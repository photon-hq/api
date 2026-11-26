//! File uploads: a request body offered only as `multipart/related` with a
//! raw-bytes schema (`isFileUpload` in tools/openapi/src/media-types.ts).
//!
//! The SDK input (openapi/sdk.json) leaves out a file upload's Content-Type and
//! Content-Length: the client builds the body and sets both. Spargen generates a
//! raw `multipart/related` body only with a required Content-Type header
//! parameter that carries the caller's boundary, so [`restore_content_type`]
//! adds that parameter to the copy Spargen reads, and [`rewrite`] then gives
//! each upload method one `file: &crate::UploadFile` argument in place of
//! Spargen's `content_type` and `body`. The method builds both from the file
//! (`UploadFile::multipart_related` in packages/rust/src/upload.rs) before the
//! rest of Spargen's code runs unchanged.

use std::ops::Range;

use anyhow::{Context, Result, bail, ensure};
use proc_macro2::Span;
use serde_json::{Value, json};
use syn::spanned::Spanned;
use syn::{Expr, FnArg, ImplItem, ImplItemFn, Item, ItemImpl, Pat, Stmt, Type};

const HTTP_METHODS: &[&str] = &[
    "get", "put", "post", "delete", "patch", "options", "head", "trace",
];
const UPLOAD_FILE: &str = "file: &crate::UploadFile";

fn resolve<'a>(document: &'a Value, mut value: &'a Value) -> Result<&'a Value> {
    for _ in 0..32 {
        let Some(reference) = value.get("$ref").and_then(Value::as_str) else {
            return Ok(value);
        };
        value = reference
            .strip_prefix('#')
            .and_then(|pointer| document.pointer(pointer))
            .with_context(|| format!("unresolved reference {reference}"))?;
    }
    bail!("reference chain is too long or circular")
}

/// The JSON pointer of the value at `pointer` once its `$ref`s are followed.
fn resolved_pointer(document: &Value, mut pointer: String) -> Result<String> {
    for _ in 0..32 {
        let value = document
            .pointer(&pointer)
            .with_context(|| format!("unresolved reference {pointer}"))?;
        let Some(reference) = value.get("$ref").and_then(Value::as_str) else {
            return Ok(pointer);
        };
        pointer = reference
            .strip_prefix('#')
            .with_context(|| format!("unsupported reference {reference}"))?
            .to_owned();
    }
    bail!("reference chain is too long or circular")
}

fn escape(token: &str) -> String {
    token.replace('~', "~0").replace('/', "~1")
}

fn is_content_type(document: &Value, parameter: &Value) -> Result<bool> {
    let parameter = resolve(document, parameter)?;
    Ok(parameter["in"].as_str() == Some("header")
        && parameter["name"]
            .as_str()
            .is_some_and(|name| name.eq_ignore_ascii_case("content-type")))
}

fn is_multipart_related(media: &str) -> bool {
    media
        .split(';')
        .next()
        .is_some_and(|essence| essence.trim().eq_ignore_ascii_case("multipart/related"))
}

/// Add a required Content-Type header parameter to each file upload in
/// `document`, as Spargen requires, and return the uploads' operationIds.
/// Spargen matches the media type `multipart/related` exactly, so each
/// upload's media type key becomes that essence, without case or parameters.
pub fn restore_content_type(document: &mut Value) -> Result<Vec<String>> {
    let mut uploads = Vec::new();
    let paths = document["paths"]
        .as_object()
        .context("the SDK input has no paths")?;
    for (path, item) in paths {
        let shared = item["parameters"].as_array().map_or(&[][..], Vec::as_slice);
        for method in HTTP_METHODS {
            let Some(operation) = item.get(*method) else {
                continue;
            };
            if operation.get("requestBody").is_none() {
                continue;
            }
            let body = resolved_pointer(
                document,
                format!("/paths/{}/{method}/requestBody", escape(path)),
            )?;
            let content = document
                .pointer(&format!("{body}/content"))
                .and_then(Value::as_object)
                .with_context(|| format!("{method} {path}: the request body has no content"))?;
            let Some(media) = content.keys().find(|media| is_multipart_related(media)) else {
                continue;
            };
            ensure!(
                content.len() == 1,
                "{method} {path}: the SDK input offers multipart/related beside other request media types"
            );
            let own = operation["parameters"]
                .as_array()
                .map_or(&[][..], Vec::as_slice);
            for parameter in shared.iter().chain(own) {
                ensure!(
                    !is_content_type(document, parameter)?,
                    "{method} {path}: the SDK input must leave out a file upload's Content-Type \
                     (tools/openapi/src/method-surface.ts)"
                );
            }
            let operation_id = operation["operationId"]
                .as_str()
                .with_context(|| format!("{method} {path}: the operation has no operationId"))?;
            uploads.push((
                path.clone(),
                *method,
                operation_id.to_owned(),
                body,
                media.clone(),
            ));
        }
    }
    for (path, method, _, body, media) in &uploads {
        let content = document
            .pointer_mut(&format!("{body}/content"))
            .and_then(Value::as_object_mut)
            .expect("the upload's content was found above");
        if let Some(value) = content.remove(media) {
            content.insert("multipart/related".to_owned(), value);
        }
        let operation = document["paths"][path][*method]
            .as_object_mut()
            .expect("the upload operation was found above");
        let parameters = operation
            .entry("parameters")
            .or_insert_with(|| Value::Array(Vec::new()))
            .as_array_mut()
            .with_context(|| format!("{method} {path}: parameters is not an array"))?;
        parameters.push(json!({
            "in": "header",
            "name": "content-type",
            "required": true,
            "schema": {"type": "string"},
        }));
    }
    Ok(uploads
        .into_iter()
        .map(|(_, _, operation_id, _, _)| operation_id)
        .collect())
}

/// A name compared without case or separators, as conformance matches
/// operationIds to Rust methods (`name_key` in tools/conformance/targets.py).
fn name_key(name: &str) -> String {
    name.chars()
        .filter(char::is_ascii_alphanumeric)
        .map(|c| c.to_ascii_lowercase())
        .collect()
}

fn text(source: &str, span: Span) -> &str {
    &source[span.byte_range()]
}

fn compact(text: &str) -> String {
    text.split_whitespace().collect()
}

fn impl_of<'a>(items: &'a [Item], name: &str) -> Vec<&'a ItemImpl> {
    items
        .iter()
        .filter_map(|item| match item {
            Item::Impl(item)
                if item.trait_.is_none()
                    && matches!(item.self_ty.as_ref(), Type::Path(ty) if ty.path.is_ident(name)) =>
            {
                Some(item)
            }
            _ => None,
        })
        .collect()
}

fn module<'a>(items: &'a [Item], name: &str) -> Result<&'a [Item]> {
    items
        .iter()
        .find_map(|item| match item {
            Item::Mod(module) if module.ident == name => {
                module.content.as_ref().map(|(_, items)| items.as_slice())
            }
            _ => None,
        })
        .with_context(|| format!("Spargen's output has no `{name}` module"))
}

fn method<'a>(impls: &[&'a ItemImpl], operation_id: &str, owner: &str) -> Result<&'a ImplItemFn> {
    let key = name_key(operation_id);
    let methods = impls
        .iter()
        .flat_map(|item| &item.items)
        .filter_map(|item| match item {
            ImplItem::Fn(method) if name_key(&method.sig.ident.to_string()) == key => Some(method),
            _ => None,
        })
        .collect::<Vec<_>>();
    match methods.as_slice() {
        [method] => Ok(*method),
        _ => bail!(
            "expected one {owner} method for {operation_id} in Spargen's output, found {}",
            methods.len()
        ),
    }
}

/// The text of `method`'s arguments after `&self`, as (name, compacted type, source text).
fn arguments<'a>(source: &'a str, method: &ImplItemFn) -> Result<Vec<(String, String, &'a str)>> {
    let mut inputs = method.sig.inputs.iter();
    ensure!(
        matches!(inputs.next(), Some(FnArg::Receiver(_))),
        "{} does not take &self",
        method.sig.ident
    );
    inputs
        .map(|input| {
            let FnArg::Typed(input) = input else {
                bail!("{} takes a second receiver", method.sig.ident);
            };
            let Pat::Ident(name) = input.pat.as_ref() else {
                bail!("{} has a non-identifier argument", method.sig.ident);
            };
            Ok((
                name.ident.to_string(),
                compact(text(source, input.ty.span())),
                text(source, input.span()),
            ))
        })
        .collect()
}

/// Replace the items between a pair of parentheses, one per line when the
/// original list spanned several lines (with a trailing comma, as Spargen
/// writes them).
fn list(source: &str, parentheses: Span, items: &[&str]) -> (Range<usize>, String) {
    let range = parentheses.byte_range();
    let inner = &source[range.start + 1..range.end - 1];
    let replacement = match inner.rfind('\n') {
        None => format!("({})", items.join(", ")),
        Some(last) => {
            let indent = inner[1..]
                .chars()
                .take_while(|c| *c == ' ')
                .collect::<String>();
            let lines = items
                .iter()
                .map(|item| format!("\n{indent}{item},"))
                .collect::<String>();
            format!("({lines}\n{})", &inner[last + 1..])
        }
    };
    (range, replacement)
}

struct Upload<'a> {
    kept: Vec<&'a str>,
    names: Vec<String>,
}

/// The arguments an upload method keeps: all but `content_type: String` and a
/// raw-bytes `body`, which `file` replaces in place.
fn upload<'a>(
    arguments: &[(String, String, &'a str)],
    byte_types: &[String],
    operation_id: &str,
) -> Result<Upload<'a>> {
    let mut kept = Vec::new();
    let mut names = Vec::new();
    let mut content_type = false;
    let mut body = false;
    for (name, ty, source) in arguments {
        match name.as_str() {
            "content_type" if ty == "String" => content_type = true,
            "body" if byte_types.contains(ty) => {
                body = true;
                kept.push(UPLOAD_FILE);
                names.push("file".to_owned());
            }
            "file" => bail!("{operation_id} already takes an argument named `file`"),
            _ => {
                kept.push(*source);
                names.push(name.clone());
            }
        }
    }
    ensure!(
        content_type && body,
        "{operation_id}: expected Spargen's `content_type: String` and raw-bytes `body` arguments"
    );
    Ok(Upload { kept, names })
}

fn rewrite_async(
    source: &str,
    method: &ImplItemFn,
    byte_types: &[String],
    operation_id: &str,
    edits: &mut Vec<(Range<usize>, String)>,
) -> Result<Vec<String>> {
    ensure!(
        method.sig.asyncness.is_some(),
        "{operation_id}: the Client method is not async"
    );
    let body = text(source, method.block.span());
    ensure!(
        body.matches("&content_type").count() == 1
            && body.matches("request.body(body.clone())").count() == 1,
        "{operation_id}: expected Spargen to set Content-Type from `content_type` and send `body.clone()`"
    );
    let upload = upload(&arguments(source, method)?, byte_types, operation_id)?;
    let mut items = vec![text(source, method.sig.inputs[0].span())];
    items.extend(&upload.kept);
    edits.push(list(source, method.sig.paren_token.span.join(), &items));

    let open = method.block.brace_token.span.open().byte_range().end;
    let first = method
        .block
        .stmts
        .first()
        .with_context(|| format!("{operation_id}: the Client method has no statements"))?;
    let indent = &source[open..first.span().byte_range().start];
    let indent = &indent[indent.rfind('\n').map_or(0, |line| line + 1)..];
    edits.push((
        open..open,
        format!(
            "\n{indent}let (content_type, body) = file\n{indent}    .multipart_related()\n{indent}    .map_err(support::Error::request_message)?;\n{indent}let body = &body;"
        ),
    ));
    Ok(upload.names)
}

fn rewrite_blocking(
    source: &str,
    method: &ImplItemFn,
    byte_types: &[String],
    operation_id: &str,
    names: &[String],
    edits: &mut Vec<(Range<usize>, String)>,
) -> Result<()> {
    let arguments = arguments(source, method)?;
    let upload = upload(&arguments, byte_types, operation_id)?;
    let call = match method.block.stmts.as_slice() {
        [Stmt::Expr(Expr::MethodCall(block_on), None)] if block_on.method == "block_on" => {
            match block_on.args.iter().collect::<Vec<_>>().as_slice() {
                [Expr::MethodCall(call)] if call.method == method.sig.ident => Some(call),
                _ => None,
            }
        }
        _ => None,
    }
    .with_context(|| {
        format!("{operation_id}: expected the blocking method to block_on the async method")
    })?;
    let passed = call
        .args
        .iter()
        .map(|argument| compact(text(source, argument.span())))
        .collect::<Vec<_>>();
    let declared = arguments
        .iter()
        .map(|(name, _, _)| name.clone())
        .collect::<Vec<_>>();
    ensure!(
        passed == declared,
        "{operation_id}: expected the blocking method to pass its arguments through unchanged"
    );
    ensure!(
        upload.names == names,
        "{operation_id}: the blocking and async methods take different arguments"
    );
    let mut items = vec![text(source, method.sig.inputs[0].span())];
    items.extend(&upload.kept);
    edits.push(list(source, method.sig.paren_token.span.join(), &items));
    let names = names.iter().map(String::as_str).collect::<Vec<_>>();
    edits.push(list(source, call.paren_token.span.join(), &names));
    Ok(())
}

/// Give each file upload's async and blocking client methods one
/// `file: &crate::UploadFile` argument in place of Spargen's `content_type`
/// and `body`. Fails when Spargen's output no longer has the expected shape.
pub fn rewrite(source: &str, operation_ids: &[String]) -> Result<String> {
    if operation_ids.is_empty() {
        return Ok(source.to_owned());
    }
    let syntax = syn::parse_file(source).context("parse generated Rust for file uploads")?;
    let byte_types = module(&syntax.items, "types")?
        .iter()
        .filter_map(|item| match item {
            Item::Type(alias) if compact(text(source, alias.ty.span())) == "bytes::Bytes" => {
                Some(format!("&types::{}", alias.ident))
            }
            _ => None,
        })
        .chain(["&bytes::Bytes".to_owned()])
        .collect::<Vec<_>>();
    let client = impl_of(&syntax.items, "Client");
    let blocking = impl_of(
        module(&syntax.items, "__spargen_blocking")?,
        "BlockingClient",
    );
    let mut edits = Vec::new();
    for operation_id in operation_ids {
        let names = rewrite_async(
            source,
            method(&client, operation_id, "Client")?,
            &byte_types,
            operation_id,
            &mut edits,
        )?;
        rewrite_blocking(
            source,
            method(&blocking, operation_id, "BlockingClient")?,
            &byte_types,
            operation_id,
            &names,
            &mut edits,
        )?;
    }
    edits.sort_by_key(|(range, _)| range.start);
    let mut output = String::with_capacity(source.len());
    let mut previous = 0;
    for (range, replacement) in edits {
        ensure!(
            range.start >= previous && range.end <= source.len(),
            "invalid or overlapping Rust source spans"
        );
        output.push_str(&source[previous..range.start]);
        output.push_str(&replacement);
        previous = range.end;
    }
    output.push_str(&source[previous..]);
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    const SPARGEN_OUTPUT: &str = r#"pub mod types {
    pub type UploadRequest = bytes::Bytes;
}
impl Client {
    pub async fn upload_attachment(
        &self,
        id: String,
        idempotency_key: String,
        content_type: String,
        body: &types::UploadRequest,
    ) -> Result<support::ResponseValue<types::Attachment>, support::Error<UploadAttachmentError>> {
        let mut request = self.core.http().request(reqwest::Method::POST, url(&id));
        request = request
            .header(
                "content-type",
                support::serialize_simple(
                        &content_type,
                        false,
                        support::PercentEncoding::Passthrough,
                    )
                    .map_err(support::Error::request_construction)?,
            );
        request = request.body(body.clone());
        send(request).await
    }
}
mod __spargen_blocking {
    use super::*;
    impl BlockingClient {
        pub fn upload_attachment(
            &self,
            id: String,
            idempotency_key: String,
            content_type: String,
            body: &types::UploadRequest,
        ) -> Result<support::ResponseValue<types::Attachment>, support::Error<UploadAttachmentError>> {
            self.runtime
                .block_on(
                    self
                        .inner
                        .upload_attachment(
                            id,
                            idempotency_key,
                            content_type,
                            body,
                        ),
                )
        }
    }
}
"#;

    fn operation(content: Value, parameters: Value) -> Value {
        json!({
            "operationId": "uploadAttachment",
            "parameters": parameters,
            "requestBody": {"required": true, "content": content},
        })
    }

    #[test]
    fn restores_a_required_content_type_on_each_file_upload_only() {
        let binary = json!({"schema": {"type": "string", "format": "binary"}});
        let mut document = json!({
            "paths": {
                "/uploads/{id}": {
                    "parameters": [{"in": "path", "name": "id", "required": true}],
                    "post": operation(
                        json!({"multipart/related": binary}),
                        json!([{"in": "header", "name": "idempotency-key", "required": true}]),
                    ),
                    "put": {
                        "operationId": "replaceUpload",
                        "requestBody": {"$ref": "#/components/requestBodies/Upload"},
                    },
                    "patch": operation(json!({"application/json": {"schema": {}}}), json!([])),
                },
            },
            "components": {"requestBodies": {"Upload": {
                "content": {"Multipart/Related; type=\"application/json\"": binary},
            }}},
        });

        assert_eq!(
            restore_content_type(&mut document).unwrap(),
            ["replaceUpload", "uploadAttachment"]
        );
        let content_type = json!({
            "in": "header",
            "name": "content-type",
            "required": true,
            "schema": {"type": "string"},
        });
        let item = &document["paths"]["/uploads/{id}"];
        assert_eq!(
            item["post"]["parameters"],
            json!([
                {"in": "header", "name": "idempotency-key", "required": true},
                content_type.clone(),
            ])
        );
        assert_eq!(item["put"]["parameters"], json!([content_type]));
        assert_eq!(item["patch"]["parameters"], json!([]));
        assert_eq!(
            document["components"]["requestBodies"]["Upload"]["content"],
            json!({"multipart/related": binary})
        );
        assert_eq!(
            item["post"]["requestBody"]["content"],
            json!({"multipart/related": binary})
        );
        assert_eq!(item["parameters"].as_array().unwrap().len(), 1);
    }

    #[test]
    fn rejects_an_upload_the_sdk_input_did_not_prepare() {
        let binary = json!({"schema": {"type": "string", "format": "binary"}});
        let kept = json!({"paths": {"/uploads": {"post": operation(
            json!({"multipart/related": binary}),
            json!([{"$ref": "#/components/parameters/ContentType"}]),
        )}}, "components": {"parameters": {"ContentType": {
            "in": "header", "name": "Content-Type", "required": true,
        }}}});
        let alternatives = json!({"paths": {"/uploads": {"post": operation(
            json!({"multipart/related": binary, "application/octet-stream": binary}),
            json!([]),
        )}}});
        for mut document in [kept, alternatives] {
            assert!(restore_content_type(&mut document).is_err(), "{document}");
        }
    }

    #[test]
    fn rewrites_the_async_and_blocking_upload_methods() {
        let expected = SPARGEN_OUTPUT
            .replace(
                "        content_type: String,\n        body: &types::UploadRequest,\n",
                "        file: &crate::UploadFile,\n",
            )
            .replace(
                "            content_type: String,\n            body: &types::UploadRequest,\n",
                "            file: &crate::UploadFile,\n",
            )
            .replace(
                "UploadAttachmentError>> {\n        let mut request",
                "UploadAttachmentError>> {\n        let (content_type, body) = file\n            .multipart_related()\n            .map_err(support::Error::request_message)?;\n        let body = &body;\n        let mut request",
            )
            .replace(
                "                            content_type,\n                            body,\n",
                "                            file,\n",
            );
        assert_eq!(
            rewrite(SPARGEN_OUTPUT, &["uploadAttachment".to_owned()]).unwrap(),
            expected
        );
        assert_eq!(rewrite(SPARGEN_OUTPUT, &[]).unwrap(), SPARGEN_OUTPUT);
    }

    #[test]
    fn fails_when_spargen_output_changes_shape() {
        let operations = ["uploadAttachment".to_owned()];
        for (from, to) in [
            ("pub async fn upload_attachment", "pub async fn upload_file"),
            ("pub fn upload_attachment", "pub fn upload_file"),
            (
                "pub type UploadRequest = bytes::Bytes;",
                "pub type UploadRequest = String;",
            ),
            (
                "        content_type: String,\n",
                "        media_type: String,\n",
            ),
            ("request.body(body.clone())", "request.body(body.to_vec())"),
            (
                "                            content_type,\n",
                "                            content_type.clone(),\n",
            ),
            (
                "        idempotency_key: String,\n",
                "        file: String,\n",
            ),
        ] {
            let source = SPARGEN_OUTPUT.replacen(from, to, 1);
            assert_ne!(source, SPARGEN_OUTPUT, "{from}");
            assert!(rewrite(&source, &operations).is_err(), "{from}");
        }
    }
}
