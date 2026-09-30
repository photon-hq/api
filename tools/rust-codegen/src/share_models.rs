//! Share equivalent generated models without deleting their public names.
//!
//! Compare Rust syntax (including serde attributes and complete implementations),
//! not schema approximations. Resolve ordinary type aliases and repeat until
//! sharing child models exposes no more equivalent parents. Union variant names,
//! field documentation, validation code and literal values remain significant.

use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::ops::Range;

use anyhow::{Context, Result, ensure};
use proc_macro2::Ident;
use syn::spanned::Spanned;
use syn::visit_mut::{self, VisitMut};
use syn::{Attribute, FnArg, ImplItem, Item, ItemImpl, Path, Type, Visibility};

const SELF_NAME: &str = "__PhotonSharedSelf";

#[derive(Debug, PartialEq, Eq)]
pub struct Stats {
    pub models: usize,
    pub shared: usize,
    pub passes: usize,
    pub request_types: usize,
    pub headers: usize,
    pub shared_headers: usize,
}

#[derive(PartialEq, Eq, Hash)]
struct Signature {
    definition: Item,
    implementations: Vec<ItemImpl>,
}

fn plain_type_path(ty: &Type) -> Option<String> {
    let Type::Path(ty) = ty else { return None };
    if ty.qself.is_some()
        || ty.path.leading_colon.is_some()
        || ty
            .path
            .segments
            .iter()
            .any(|segment| !segment.arguments.is_empty())
    {
        return None;
    }
    Some(
        ty.path
            .segments
            .iter()
            .map(|segment| segment.ident.to_string())
            .collect::<Vec<_>>()
            .join("::"),
    )
}

fn simple_type_name(ty: &Type) -> Option<String> {
    plain_type_path(ty).filter(|name| !name.contains("::"))
}

fn attributes(item: &Item) -> &[Attribute] {
    match item {
        Item::Struct(item) => &item.attrs,
        Item::Enum(item) => &item.attrs,
        _ => unreachable!("only model definitions have signatures"),
    }
}

fn reviewed_attribute(attr: &Attribute) -> bool {
    // `non_exhaustive` rides on the shared item, so every re-export keeps it.
    if attr.path().is_ident("doc")
        || attr.path().is_ident("serde")
        || attr.path().is_ident("non_exhaustive")
    {
        return true;
    }
    if attr.path().is_ident("allow") {
        return attr
            .parse_args::<Path>()
            .is_ok_and(|path| path.is_ident("dead_code"));
    }
    if !attr.path().is_ident("derive") {
        return false;
    }
    let Ok(derives) =
        attr.parse_args_with(syn::punctuated::Punctuated::<Path, syn::Token![,]>::parse_terminated)
    else {
        return false;
    };
    derives.iter().all(|path| {
        [
            "Debug",
            "Clone",
            "Default",
            "Serialize",
            "Deserialize",
            "PartialEq",
            "Eq",
        ]
        .iter()
        .any(|name| path.is_ident(name))
    })
}

fn model_name(item: &Item) -> Option<String> {
    let (name, generics, visibility) = match item {
        Item::Struct(item) => (&item.ident, &item.generics, &item.vis),
        Item::Enum(item) => (&item.ident, &item.generics, &item.vis),
        _ => return None,
    };
    // Keep unfamiliar definitions independent until their semantics are reviewed.
    if !matches!(visibility, Visibility::Public(_))
        || !generics.params.is_empty()
        || generics.where_clause.is_some()
        || !attributes(item).iter().all(reviewed_attribute)
    {
        return None;
    }
    Some(name.to_string())
}

struct Normalize<'a> {
    own: &'a str,
    representatives: &'a BTreeMap<String, String>,
    aliases: &'a BTreeMap<String, Type>,
    expanding: BTreeSet<String>,
}

impl VisitMut for Normalize<'_> {
    fn visit_type_mut(&mut self, ty: &mut Type) {
        if let Some(name) = plain_type_path(ty)
            && let Some(target) = self.aliases.get(&name)
            && self.expanding.insert(name.clone())
        {
            *ty = target.clone();
            self.visit_type_mut(ty);
            self.expanding.remove(&name);
            return;
        }
        visit_mut::visit_type_mut(self, ty);
    }

    fn visit_path_mut(&mut self, path: &mut Path) {
        visit_mut::visit_path_mut(self, path);
        if path.leading_colon.is_some() {
            return;
        }
        let Some(first) = path.segments.first_mut() else {
            return;
        };
        if let Some(representative) = self.representatives.get(&first.ident.to_string()) {
            let name = if representative == self.own {
                SELF_NAME
            } else {
                representative
            };
            first.ident = Ident::new(name, first.ident.span());
        }
    }
}

fn signature(
    item: &Item,
    implementations: &[&ItemImpl],
    name: &str,
    representatives: &BTreeMap<String, String>,
    aliases: &BTreeMap<String, Type>,
) -> Signature {
    let mut definition = item.clone();
    let (ident, attrs) = match &mut definition {
        Item::Struct(item) => (&mut item.ident, &mut item.attrs),
        Item::Enum(item) => (&mut item.ident, &mut item.attrs),
        _ => unreachable!(),
    };
    *ident = Ident::new(SELF_NAME, ident.span());
    // Each public re-export retains its own top-level documentation. Field and
    // variant docs stay in the signature because a re-export cannot override them.
    attrs.retain(|attr| !attr.path().is_ident("doc"));
    let mut normalizer = Normalize {
        own: &representatives[name],
        representatives,
        aliases,
        expanding: BTreeSet::new(),
    };
    normalizer.visit_item_mut(&mut definition);
    let implementations = implementations
        .iter()
        .map(|item| {
            let mut item = (*item).clone();
            normalizer.visit_item_impl_mut(&mut item);
            item
        })
        .collect();
    Signature {
        definition,
        implementations,
    }
}

fn replacement(source: &str, item: &Item, name: &str, representative: &str) -> String {
    let start = item.span().byte_range().start;
    let line_start = source[..start].rfind('\n').map_or(0, |index| index + 1);
    let indent = source[line_start..start]
        .chars()
        .take_while(|c| *c == ' ')
        .collect::<String>();
    let docs = attributes(item)
        .iter()
        .filter(|attr| attr.path().is_ident("doc"))
        .map(|attr| format!("{}\n{indent}", &source[attr.span().byte_range()]))
        .collect::<String>();
    format!("{docs}pub use self::{representative} as {name};")
}

fn removal_range(source: &str, item: &ItemImpl) -> Range<usize> {
    let mut range = item.span().byte_range();
    let line_start = source[..range.start]
        .rfind('\n')
        .map_or(0, |index| index + 1);
    if source[line_start..range.start].trim().is_empty() {
        range.start = line_start;
    }
    if let Some(newline) = source[range.end..].find('\n')
        && source[range.end..range.end + newline].trim().is_empty()
    {
        range.end += newline + 1;
    }
    range
}

fn aliases(items: &[Item]) -> BTreeMap<String, Type> {
    items
        .iter()
        .filter_map(|item| match item {
            Item::Type(item)
                if item.generics.params.is_empty()
                    && item.generics.where_clause.is_none()
                    && item.attrs.iter().all(|attr| attr.path().is_ident("doc")) =>
            {
                Some((item.ident.to_string(), (*item.ty).clone()))
            }
            _ => None,
        })
        .collect()
}

struct ReferencedTypes {
    qualified: bool,
    names: BTreeSet<String>,
}

impl VisitMut for ReferencedTypes {
    fn visit_path_mut(&mut self, path: &mut Path) {
        visit_mut::visit_path_mut(self, path);
        if path.leading_colon.is_none()
            && ((!self.qualified && path.segments.len() == 1)
                || (self.qualified
                    && path.segments.len() == 2
                    && path.segments[0].ident == "types"))
        {
            self.names
                .insert(path.segments.last().unwrap().ident.to_string());
        }
    }
}

// Protect the entire client input graph, including nested structs, enum variants,
// containers and aliases. Equal wire shapes do not make two inputs interchangeable.
fn request_types(
    items: &[Item],
    type_items: &[Item],
    aliases: &BTreeMap<String, Type>,
) -> BTreeSet<String> {
    let definitions = type_items
        .iter()
        .filter_map(|item| match item {
            Item::Struct(item) => Some((
                item.ident.to_string(),
                item.fields
                    .iter()
                    .map(|field| field.ty.clone())
                    .collect::<Vec<_>>(),
            )),
            Item::Enum(item) => Some((
                item.ident.to_string(),
                item.variants
                    .iter()
                    .flat_map(|variant| variant.fields.iter().map(|field| field.ty.clone()))
                    .collect(),
            )),
            _ => None,
        })
        .collect::<BTreeMap<_, _>>();
    let mut referenced = ReferencedTypes {
        qualified: true,
        names: BTreeSet::new(),
    };
    for item in items {
        if let Item::Impl(item) = item
            && item.trait_.is_none()
            && simple_type_name(&item.self_ty).as_deref() == Some("Client")
        {
            for method in &item.items {
                if let ImplItem::Fn(method) = method {
                    for argument in &method.sig.inputs {
                        if let FnArg::Typed(argument) = argument {
                            referenced.visit_type_mut(&mut argument.ty.clone());
                        }
                    }
                }
            }
        }
    }
    let mut names = referenced.names;
    let mut pending = names.iter().cloned().collect::<Vec<_>>();
    while let Some(name) = pending.pop() {
        for target in aliases
            .get(&name)
            .into_iter()
            .chain(definitions.get(&name).into_iter().flatten())
        {
            let mut nested = ReferencedTypes {
                qualified: false,
                names: BTreeSet::new(),
            };
            nested.visit_type_mut(&mut target.clone());
            for name in nested.names {
                if names.insert(name.clone()) {
                    pending.push(name);
                }
            }
        }
    }
    names
}

type Edit = (Range<usize>, String);

fn share_items(
    source: &str,
    items: &[Item],
    models: &BTreeMap<String, &Item>,
    aliases: &BTreeMap<String, Type>,
    edits: &mut Vec<Edit>,
) -> Result<(usize, usize)> {
    ensure!(
        !models.contains_key(SELF_NAME) && !aliases.contains_key(SELF_NAME),
        "reserved model-sharing identifier is already used"
    );
    let mut implementations: BTreeMap<String, Vec<&ItemImpl>> = BTreeMap::new();
    for item in items {
        if let Item::Impl(item) = item {
            let Some(name) = simple_type_name(&item.self_ty) else {
                // A generic or compound target (Spargen's `impl<T: ConstField> ConstField for
                // Option<T>` helper) is fine as long as it cannot apply to a model.
                let mut referenced = ReferencedTypes {
                    qualified: false,
                    names: BTreeSet::new(),
                };
                referenced.visit_type_mut(&mut (*item.self_ty).clone());
                ensure!(
                    referenced
                        .names
                        .iter()
                        .all(|name| !models.contains_key(name)),
                    "model sharing requires a simple implementation target"
                );
                continue;
            };
            if !models.contains_key(&name) {
                continue;
            }
            if let Some((path, _)) = &item.trait_ {
                let trait_name = path
                    .segments
                    .iter()
                    .map(|segment| segment.ident.to_string())
                    .collect::<Vec<_>>()
                    .join("::");
                ensure!(
                    [
                        "serde::Serialize",
                        "serde::Deserialize",
                        "std::fmt::Display"
                    ]
                    .contains(&trait_name.as_str()),
                    "unreviewed generated model trait: {trait_name}"
                );
            }
            implementations.entry(name).or_default().push(item);
        }
    }
    let mut representatives = models
        .keys()
        .map(|name| (name.clone(), name.clone()))
        .collect::<BTreeMap<_, _>>();
    let mut passes = 0;
    loop {
        passes += 1;
        let mut groups = HashMap::new();
        let mut next = BTreeMap::new();
        for (name, item) in models {
            let signature = signature(
                item,
                implementations.get(name).map_or(&[], Vec::as_slice),
                name,
                &representatives,
                aliases,
            );
            // Full AST equality is checked as well as the hash.
            let representative = groups.entry(signature).or_insert_with(|| name.clone());
            next.insert(name.clone(), representative.clone());
        }
        if next == representatives {
            break;
        }
        ensure!(passes <= models.len(), "model sharing did not converge");
        representatives = next;
    }
    let mut shared = 0;
    for (name, item) in models {
        let representative = &representatives[name];
        if name == representative {
            continue;
        }
        shared += 1;
        edits.push((
            item.span().byte_range(),
            replacement(source, item, name, representative),
        ));
        for implementation in implementations.get(name).into_iter().flatten() {
            edits.push((removal_range(source, implementation), String::new()));
        }
    }
    Ok((shared, passes))
}

pub fn share(source: &str) -> Result<(String, Stats)> {
    let syntax = syn::parse_file(source).context("parse generated Rust for model sharing")?;
    let items = syntax
        .items
        .iter()
        .find_map(|item| match item {
            Item::Mod(module) if module.ident == "types" => {
                module.content.as_ref().map(|(_, items)| items)
            }
            _ => None,
        })
        .context("generated Rust types module is missing")?;
    let models = items
        .iter()
        .filter_map(|item| model_name(item).map(|name| (name, item)))
        .collect::<BTreeMap<_, _>>();
    let model_count = models.len();
    let aliases = aliases(items);
    let protected = request_types(&syntax.items, items, &aliases);
    let eligible = models
        .into_iter()
        .filter(|(name, _)| !protected.contains(name))
        .collect::<BTreeMap<_, _>>();
    let mut edits = Vec::new();
    let (shared, passes) = share_items(source, items, &eligible, &aliases, &mut edits)?;

    // Header models live at the crate root. Only resolve audited scalar aliases
    // across the types-module boundary; unfamiliar header types stay independent.
    let scalar_names = ["String", "bool", "i64", "Date", "DateTime"];
    let header_aliases = aliases
        .iter()
        .filter(|(_, target)| {
            simple_type_name(target).is_some_and(|name| scalar_names.contains(&name.as_str()))
        })
        .map(|(name, target)| (format!("types::{name}"), target.clone()))
        .collect();
    let headers = syntax
        .items
        .iter()
        .filter_map(|item| {
            let name = model_name(item)?;
            (matches!(item, Item::Struct(_)) && name.ends_with("Headers")).then_some((name, item))
        })
        .collect::<BTreeMap<_, _>>();
    let (shared_headers, _) =
        share_items(source, &syntax.items, &headers, &header_aliases, &mut edits)?;
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
    if shared > 0 || shared_headers > 0 {
        output = output.replacen(
            "// content-sha256:",
            "// spargen-content-sha256-before-sharing:",
            1,
        );
        output.insert_str(
            0,
            "// Equivalent public models and headers share definitions; request models remain distinct.\n",
        );
    }
    Ok((
        output,
        Stats {
            models: model_count,
            shared,
            passes,
            request_types: model_count - eligible.len(),
            headers: headers.len(),
            shared_headers,
        },
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn committed_client_argument_models_are_not_shared_reexports() {
        let source =
            std::fs::read_to_string(crate::repository_root().join(crate::OUTPUT_PATH)).unwrap();
        let syntax = syn::parse_file(&source).unwrap();
        let items = syntax
            .items
            .iter()
            .find_map(|item| match item {
                Item::Mod(module) if module.ident == "types" => {
                    module.content.as_ref().map(|(_, items)| items)
                }
                _ => None,
            })
            .unwrap();
        let requests = request_types(&syntax.items, items, &aliases(items));
        assert!(
            !requests.is_empty(),
            "client argument model discovery must find the API inputs"
        );
        for item in items {
            if let Item::Use(item) = item
                && let syn::UseTree::Path(path) = &item.tree
                && let syn::UseTree::Rename(rename) = path.tree.as_ref()
            {
                assert!(
                    !requests.contains(&rename.rename.to_string()),
                    "request model {} must retain its identity",
                    rename.rename
                );
            }
        }
    }

    #[test]
    fn shares_nested_models_and_resolves_primitive_aliases_without_removing_names() {
        let input = r#"pub mod types {
            pub type FirstText = String;
            pub type SecondText = String;
            #[derive(Debug, Clone)] pub struct First { pub text: FirstText }
            #[derive(Debug, Clone)] pub struct Second { pub text: SecondText }
            pub struct FirstParent { pub child: Option<First> }
            pub struct SecondParent { pub child: Option<Second> }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 2);
        assert!(
            stats.passes >= 3,
            "parents must be revisited after children share"
        );
        assert!(output.contains("pub use self::First as Second;"));
        assert!(output.contains("pub use self::FirstParent as SecondParent;"));
        assert!(output.contains("pub type SecondText = String;"));
        syn::parse_file(&output).unwrap();
        assert_eq!(
            share(input).unwrap().0,
            output,
            "generation is deterministic"
        );
    }

    #[test]
    fn serde_attributes_fields_variants_and_implementations_remain_significant() {
        let input = r#"pub mod types {
            #[serde(deny_unknown_fields)] pub struct Strict { pub x: String }
            pub struct Open { pub x: String }
            pub struct Required { pub x: String }
            pub struct Optional { pub x: Option<String> }
            pub struct Renamed { #[serde(rename="different")] pub x: String }
            pub struct OtherField { pub y: String }
            pub enum First { #[serde(rename="one")] Value }
            pub enum Second { #[serde(rename="two")] Value }
            pub enum Third { #[serde(rename="one")] DifferentVariant }
            pub struct Checked { pub x: String }
            impl Checked { fn validate(&self) -> bool { false } }
            pub struct AlsoChecked { pub x: String }
            impl AlsoChecked { fn validate(&self) -> bool { true } }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 1); // Open and Required only.
        for name in [
            "Strict",
            "Optional",
            "Renamed",
            "OtherField",
            "Checked",
            "AlsoChecked",
        ] {
            assert!(output.contains(&format!("pub struct {name}")));
        }
        for name in ["First", "Second", "Third"] {
            assert!(output.contains(&format!("pub enum {name}")));
        }
    }

    #[test]
    fn shares_enum_display_implementation_but_preserves_wire_literals() {
        let input = r#"pub mod types {
            #[serde(rename_all="snake_case")] pub enum First { Ready }
            impl std::fmt::Display for First {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    match self { First::Ready => f.write_str("ready") }
                }
            }
            #[serde(rename_all="snake_case")] pub enum Second { Ready }
            impl std::fmt::Display for Second {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    match self { Second::Ready => f.write_str("ready") }
                }
            }
            #[serde(rename_all="snake_case")] pub enum Third { Ready }
            impl std::fmt::Display for Third {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    match self { Third::Ready => f.write_str("different") }
                }
            }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 1);
        assert!(output.contains("pub use self::First as Second;"));
        assert!(!output.contains("Display for Second"));
        assert!(output.contains("Display for Third"));
    }

    #[test]
    fn preserves_unicode_documentation_and_does_not_merge_different_field_docs() {
        let input = r#"pub mod types {
            /// First model 📦.
            pub struct First { pub value: String }
            /// Second model 日本語.
            pub struct Second { pub value: String }
            pub struct Third { /// A different meaning.
                pub value: String }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 1);
        assert!(output.contains("/// Second model 日本語."));
        assert!(output.contains("pub use self::First as Second;"));
        assert!(output.contains("pub struct Third"));
        syn::parse_file(&output).unwrap();
    }

    #[test]
    fn retains_distinct_union_variants_and_error_messages() {
        let input = r#"pub mod types {
            pub enum FirstUnion { FirstVariant(Box<String>) }
            pub enum SecondUnion { SecondVariant(Box<String>) }
            pub struct First { pub value: String }
            impl First { fn error() -> &'static str { "First" } }
            pub struct Second { pub value: String }
            impl Second { fn error() -> &'static str { "Second" } }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 0);
        assert_eq!(output, input);
    }

    #[test]
    fn handles_recursive_models_conservatively_and_terminates_on_alias_cycles() {
        let input = r#"pub mod types {
            pub struct First { pub next: Option<Box<First>> }
            pub struct Second { pub next: Option<Box<Second>> }
            pub type Left = Right;
            pub type Right = Left;
            pub struct Third { pub next: Left }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 1);
        assert!(output.contains("pub use self::First as Second;"));
        assert!(output.contains("pub struct Third"));
    }

    #[test]
    fn rejects_unreviewed_conversion_impls_that_could_overlap_after_sharing() {
        let input = r#"pub mod types {
            pub struct First;
            pub struct Second;
            impl From<First> for Second { fn from(_: First) -> Self { Second } }
        }"#;
        assert!(
            share(input)
                .unwrap_err()
                .to_string()
                .contains("unreviewed generated model trait")
        );
    }

    #[test]
    fn ignores_generic_helper_impls_but_not_ones_that_could_target_models() {
        let input = r#"pub mod types {
            trait ConstField { fn matches_const(&self, expected: &str) -> bool; }
            impl ConstField for String { fn matches_const(&self, expected: &str) -> bool { self == expected } }
            impl<T: ConstField> ConstField for Option<T> {
                fn matches_const(&self, expected: &str) -> bool { self.as_ref().is_none_or(|v| v.matches_const(expected)) }
            }
            pub struct First { #[serde(serialize_with = "const_a_ser")] pub code: String }
            pub struct Second { #[serde(serialize_with = "const_a_ser")] pub code: String }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 1);
        assert!(output.contains("pub use self::First as Second;"));
        let targeted = r#"pub mod types {
            pub struct First { pub value: String }
            impl Clone for Option<First> { fn clone(&self) -> Self { None } }
        }"#;
        assert!(
            share(targeted)
                .unwrap_err()
                .to_string()
                .contains("simple implementation target")
        );
    }

    #[test]
    fn keeps_models_with_unreviewed_derives_independent() {
        let input = r#"pub mod types {
            #[derive(CustomValidation)] pub struct First { pub value: String }
            #[derive(CustomValidation)] pub struct Second { pub value: String }
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.shared, 0);
        assert_eq!(output, input);
    }

    #[test]
    fn keeps_entire_client_input_graph_distinct() {
        let input = r#"pub mod types {
            pub struct First { pub child: FirstChild }
            pub struct Second { pub child: SecondChild }
            pub struct FirstChild { pub value: String }
            pub struct SecondChild { pub value: String }
            pub enum Variant { Child(SecondChild) }
            pub struct Recursive { pub next: Option<Box<Recursive>>, pub value: Variant }
            pub struct CollectionElement { pub child: SecondChild }
            pub struct Output { pub value: String }
            pub struct OtherOutput { pub value: String }
            pub type Collection = Vec<CollectionElement>;
            pub type RecursiveAlias = RecursiveAlias;
        }
        pub struct Client;
        impl Client {
            pub async fn first(&self, body: &types::First) {}
            pub async fn second(&self, body: Option<&types::Second>) {}
            pub async fn collection(&self, body: &types::Collection) {}
            pub async fn cycle(&self, body: &types::RecursiveAlias) {}
            pub async fn recursive(&self, body: &types::Recursive) {}
        }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.request_types, 7);
        assert_eq!(stats.shared, 1);
        for name in [
            "First",
            "Second",
            "FirstChild",
            "SecondChild",
            "CollectionElement",
            "Recursive",
        ] {
            assert!(output.contains(&format!("pub struct {name} {{")));
        }
        assert!(output.contains("pub enum Variant"));
        assert!(output.contains("pub use self::OtherOutput as Output;"));
    }

    #[test]
    fn shares_header_models_only_when_types_docs_and_parsing_match() {
        let input = r#"pub mod types {
            pub type FirstId = String;
            pub type SecondId = String;
            pub type NumericId = i64;
        }
        /// First response.
        #[allow(dead_code)] #[derive(Debug, Clone)]
        pub struct FirstHeaders { /// Request identity.
            pub request_id: Option<types::FirstId> }
        impl FirstHeaders { fn read(h: &HeaderMap) -> Self {
            Self { request_id: parse(h, "X-Request-ID", false) }
        } }
        /// Second response.
        #[allow(dead_code)] #[derive(Debug, Clone)]
        pub struct SecondHeaders { /// Request identity.
            pub request_id: Option<types::SecondId> }
        impl SecondHeaders { fn read(h: &HeaderMap) -> Self {
            Self { request_id: parse(h, "X-Request-ID", false) }
        } }
        #[allow(dead_code)] #[derive(Debug, Clone)]
        pub struct ExplodedHeaders { /// Request identity.
            pub request_id: Option<types::SecondId> }
        impl ExplodedHeaders { fn read(h: &HeaderMap) -> Self {
            Self { request_id: parse(h, "X-Request-ID", true) }
        } }
        #[allow(dead_code)] #[derive(Debug, Clone)]
        pub struct NumericHeaders { /// Request identity.
            pub request_id: Option<types::NumericId> }
        impl NumericHeaders { fn read(h: &HeaderMap) -> Self {
            Self { request_id: parse(h, "X-Request-ID", false) }
        } }
        #[allow(dead_code)] #[derive(Debug, Clone)]
        pub struct TraceHeaders { /// Request identity.
            pub request_id: Option<types::SecondId> }
        impl TraceHeaders { fn read(h: &HeaderMap) -> Self {
            Self { request_id: parse(h, "X-Trace-ID", false) }
        } }
        #[allow(dead_code)] #[derive(Debug, Clone)]
        pub struct OtherMeaningHeaders { /// A different meaning.
            pub request_id: Option<types::SecondId> }
        impl OtherMeaningHeaders { fn read(h: &HeaderMap) -> Self {
            Self { request_id: parse(h, "X-Request-ID", false) }
        } }"#;
        let (output, stats) = share(input).unwrap();
        assert_eq!(stats.headers, 6);
        assert_eq!(stats.shared_headers, 1);
        assert!(output.contains("pub use self::FirstHeaders as SecondHeaders;"));
        assert!(!output.contains("impl SecondHeaders"));
        assert!(output.contains("/// Second response."));
        for name in ["Exploded", "Numeric", "Trace", "OtherMeaning"] {
            assert!(output.contains(&format!("pub struct {name}Headers")));
        }
        syn::parse_file(&output).unwrap();
        assert_eq!(share(input).unwrap().0, output);
    }
}
