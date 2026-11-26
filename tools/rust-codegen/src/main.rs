use std::{
    env, fs,
    path::PathBuf,
    time::{SystemTime, UNIX_EPOCH},
};

use anyhow::{Context, Result, bail, ensure};
use spargen::{Build, CargoIntegration, Code, Diagnostic, Outcome, Report, Severity, Spec};

mod file_upload;
mod share_models;

const SPEC_PATH: &str = "openapi/sdk.json";
const OUTPUT_PATH: &str = "packages/rust/src/generated.rs";
const EXPECTED_DEFAULT_WARNINGS: &[&str] = &[
    "/components/schemas/CreateOauthClientRequestApplicationJson/properties/scopes",
    "/components/schemas/DisableOrganizationSsoRequest/properties/domains",
    "/components/schemas/QueryMessageMetricsRequestApplicationJson/properties/dimensions",
    "/components/schemas/QueryMessageMetricsRequestApplicationJson/properties/timeRange",
];

fn repository_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .canonicalize()
        .expect("repository root must exist")
}

fn generation_spec() -> Spec {
    Spec::new(SPEC_PATH)
        .uuid(false)
        .time(true)
        .error_body_cap(64 * 1024)
        .batch_cap(10_000)
        .carve(false)
}

fn generation_build(output_path: &str) -> Build {
    generation_spec()
        .build(output_path)
        // This is an explicit one-shot generator, not a Cargo build script.
        .cargo(CargoIntegration::Off)
}

fn accepted_diagnostic(diagnostic: &Diagnostic) -> bool {
    diagnostic.severity == Severity::Warning
        && (diagnostic.code == Code::ValidationKeywordIgnored
            || (diagnostic.code == Code::SchemaDefaultNotApplied
                && EXPECTED_DEFAULT_WARNINGS.contains(&diagnostic.pointer.as_str())))
}

fn validate_report(report: &Report, expected: Outcome) -> Result<()> {
    let unexpected = report
        .diagnostics
        .iter()
        .filter(|diagnostic| !accepted_diagnostic(diagnostic))
        .map(|diagnostic| {
            format!(
                "{} at {}: {}",
                diagnostic.code.as_str(),
                diagnostic.pointer,
                diagnostic.message
            )
        })
        .collect::<Vec<_>>();
    ensure!(
        unexpected.is_empty(),
        "Spargen emitted diagnostics outside the audited allowlist:\n{}",
        unexpected.join("\n")
    );

    ensure!(
        report.outcome == expected,
        "unexpected Spargen outcome: expected {expected:?}, got {:?}",
        report.outcome
    );
    Ok(())
}

/// A directory this run creates under the system temporary directory and
/// removes when dropped. The name carries the process id and the time, and
/// `fs::create_dir` fails on any existing entry, symlinks included, so the
/// directory is new and belongs to this run.
struct Scratch(PathBuf);

impl Scratch {
    fn new() -> Result<Self> {
        let nanos = SystemTime::now().duration_since(UNIX_EPOCH)?.as_nanos();
        let directory = env::temp_dir().join(format!(
            "photon-rust-codegen-{}-{nanos}",
            std::process::id()
        ));
        fs::create_dir(&directory)
            .with_context(|| format!("failed to create {}", directory.display()))?;
        Ok(Self(directory))
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

/// A scratch directory holding the `openapi/sdk.json` Spargen reads: the SDK
/// input with each file upload's Content-Type header parameter restored
/// (`file_upload::restore_content_type`). Spargen runs from this directory, so
/// the spec path it records in the generated header stays `openapi/sdk.json`,
/// and writes its output there too.
struct SpargenInput {
    scratch: Scratch,
    uploads: Vec<String>,
}

impl SpargenInput {
    fn prepare() -> Result<Self> {
        let mut document: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(SPEC_PATH).context("failed to read the SDK input")?,
        )
        .context("the SDK input is not JSON")?;
        let uploads = file_upload::restore_content_type(&mut document)?;
        let input = Self {
            scratch: Scratch::new()?,
            uploads,
        };
        let spec = input.scratch.0.join(SPEC_PATH);
        fs::create_dir(spec.parent().context("the spec path has a directory")?)?;
        fs::write(&spec, serde_json::to_vec(&document)?)
            .context("failed to write Spargen's input")?;
        Ok(input)
    }

    /// Run `spargen` from the scratch directory, then return to the current one.
    fn run<T>(&self, spargen: impl FnOnce() -> T) -> Result<T> {
        let previous = env::current_dir()?;
        env::set_current_dir(&self.scratch.0).context("failed to enter Spargen's input")?;
        let result = spargen();
        env::set_current_dir(previous)?;
        Ok(result)
    }
}

/// Spargen suppresses `unexpected_cfgs` because it cannot know whether the crate
/// declares its `blocking` feature. packages/rust/Cargo.toml declares it, so
/// remove the suppression: an undeclared or misspelled feature then warns (and
/// fails Clippy's `-D warnings`) instead of silently compiling the code out.
fn remove_unexpected_cfgs_allowance(source: &str) -> Result<String> {
    let mut removed = 0;
    let output = source
        .split_inclusive('\n')
        .map(|line| {
            let trimmed = line.trim_start();
            if !trimmed.starts_with("#[allow(") || !trimmed.contains("unexpected_cfgs") {
                return line.to_owned();
            }
            removed += 1;
            line.replacen("unexpected_cfgs, ", "", 1)
                .replacen(", unexpected_cfgs", "", 1)
        })
        .collect::<String>();
    ensure!(
        removed > 0 && !output.contains("unexpected_cfgs"),
        "expected Spargen's unexpected_cfgs allowances in a supported form"
    );
    Ok(output)
}

const BACKEND_ACCESSOR: &str = "            pub fn backend(&self) -> &Arc<dyn HttpBackend> {
                &self.backend
            }
";

/// Spargen's `ClientCore` can read its backend but not replace it.
/// `Client::with_request_options` (packages/rust/src/lib.rs) derives a client
/// whose backend adds per-call headers, so give the core a setter beside the
/// accessor.
fn add_backend_setter(source: &str) -> Result<String> {
    ensure!(
        source.matches(BACKEND_ACCESSOR).count() == 1,
        "expected one ClientCore::backend accessor in Spargen's output"
    );
    Ok(source.replacen(
        BACKEND_ACCESSOR,
        &format!(
            "{BACKEND_ACCESSOR}            /// Replace the transport backend, keeping the base URL, configuration and credentials.
            pub fn set_backend(&mut self, backend: Arc<dyn HttpBackend>) {{
                self.backend = backend;
            }}
"
        ),
        1,
    ))
}

/// Generate the Rust client and post-process it in the scratch directory, and
/// return its source. Nothing is written to the committed client here, so a
/// step that fails leaves it unchanged.
fn generate() -> Result<(Report, String)> {
    let input = SpargenInput::prepare()?;
    let output = input.scratch.0.join("generated.rs");
    let output_path = output
        .to_str()
        .context("the scratch Rust output path is not valid UTF-8")?;
    let report = input.run(|| spargen::generate(&generation_build(output_path)))?;
    validate_report(&report, Outcome::Generated)?;
    // Compile each structurally equivalent model once; request models keep
    // their distinct types.
    let (source, stats) = share_models::share(&fs::read_to_string(&output)?)?;
    let source = file_upload::rewrite(&source, &input.uploads)?;
    let source = remove_unexpected_cfgs_allowance(&add_backend_setter(&source)?)?;
    println!(
        "shared {} of {} Rust model definitions in {} passes; kept {} request models distinct; shared {} of {} header definitions",
        stats.shared,
        stats.models,
        stats.passes,
        stats.request_types,
        stats.shared_headers,
        stats.headers
    );
    Ok((report, source))
}

fn main() -> Result<()> {
    let check_only = match env::args().skip(1).collect::<Vec<_>>().as_slice() {
        [] => false,
        [argument] if argument == "--check" => true,
        _ => bail!("usage: photon-rust-codegen [--check]"),
    };

    env::set_current_dir(repository_root()).context("failed to enter repository root")?;
    let (report, source) = generate()?;
    if check_only {
        let committed = fs::read(OUTPUT_PATH).context("failed to read committed Rust client")?;
        ensure!(
            committed == source.as_bytes(),
            "{OUTPUT_PATH} is out of date; run `npm run generate:rust`"
        );
    } else {
        fs::write(OUTPUT_PATH, source).context("failed to write the Rust client")?;
    }

    let validation_warnings = report
        .diagnostics
        .iter()
        .filter(|diagnostic| diagnostic.code == Code::ValidationKeywordIgnored)
        .count();
    let action = if check_only { "checked" } else { "generated" };
    println!("{action} {OUTPUT_PATH} with {validation_warnings} accepted validation warnings");
    Ok(())
}

#[cfg(test)]
mod tests {
    use std::{
        collections::{BTreeMap, BTreeSet},
        fs,
    };

    use serde_json::Value;
    use spargen::{JsonPointer, Severity};
    use syn::{ImplItem, Item, Type};

    use super::*;

    const HTTP_METHODS: &[&str] = &[
        "get", "put", "post", "delete", "patch", "options", "head", "trace",
    ];

    fn diagnostic(code: Code, pointer: &str) -> Diagnostic {
        Diagnostic {
            code,
            severity: Severity::Warning,
            pointer: JsonPointer::from(pointer),
            span: None,
            message: code.title().to_owned(),
            remedy: None,
            interpretation: None,
        }
    }

    fn generated_syntax() -> syn::File {
        let source = fs::read_to_string(repository_root().join(OUTPUT_PATH))
            .expect("generated Rust must exist");
        syn::parse_file(&source).expect("generated Rust must parse")
    }

    fn type_name(item: &syn::ItemImpl) -> Option<&syn::Ident> {
        let Type::Path(path) = item.self_ty.as_ref() else {
            return None;
        };
        path.path.segments.last().map(|segment| &segment.ident)
    }

    fn operation_count(document: &Value) -> usize {
        document["paths"]
            .as_object()
            .expect("normalized paths must be an object")
            .values()
            .filter_map(Value::as_object)
            .map(|path| {
                HTTP_METHODS
                    .iter()
                    .filter(|method| path.contains_key(**method))
                    .count()
            })
            .sum()
    }

    fn pascal_case(raw: &str) -> String {
        let mut words = Vec::new();
        let mut current = String::new();
        let mut previous_lowercase = false;

        for character in raw.chars() {
            if character.is_ascii_alphanumeric() {
                let is_uppercase = character.is_ascii_uppercase();
                if is_uppercase && previous_lowercase && !current.is_empty() {
                    words.push(std::mem::take(&mut current));
                }
                current.push(character.to_ascii_lowercase());
                previous_lowercase = character.is_ascii_lowercase() || character.is_ascii_digit();
            } else {
                if !current.is_empty() {
                    words.push(std::mem::take(&mut current));
                }
                previous_lowercase = false;
            }
        }

        if !current.is_empty() {
            words.push(current);
        }

        words
            .into_iter()
            .map(|word| {
                let mut characters = word.chars();
                match characters.next() {
                    Some(first) => first.to_ascii_uppercase().to_string() + characters.as_str(),
                    None => String::new(),
                }
            })
            .collect()
    }

    fn success_variant(status: &str) -> Option<String> {
        if status == "2XX" {
            return Some("Status2xx".to_owned());
        }

        status
            .parse::<u16>()
            .ok()
            .filter(|status| (200..=299).contains(status))
            .map(|status| format!("Status{status}"))
    }

    fn alternate_success_responses(document: &Value) -> BTreeMap<String, BTreeSet<String>> {
        let mut responses = BTreeMap::new();
        let paths = document["paths"]
            .as_object()
            .expect("normalized paths must be an object");

        for path in paths.values().filter_map(Value::as_object) {
            for method in HTTP_METHODS {
                let Some(operation) = path.get(*method).and_then(Value::as_object) else {
                    continue;
                };
                let operation_id = operation["operationId"]
                    .as_str()
                    .expect("normalized operation must have an operationId");
                let variants = operation["responses"]
                    .as_object()
                    .expect("normalized operation responses must be an object")
                    .keys()
                    .filter_map(|status| success_variant(status))
                    .collect::<BTreeSet<_>>();

                if variants.len() > 1 {
                    let name = format!("{}Response", pascal_case(operation_id));
                    assert!(
                        responses.insert(name.clone(), variants).is_none(),
                        "duplicate generated response enum {name}"
                    );
                }
            }
        }

        responses
    }

    #[test]
    fn removes_only_the_unexpected_cfgs_allowance() {
        let source = "#[allow(dead_code, unexpected_cfgs, unused_imports)]\nmod a {}\n    #[allow(unexpected_cfgs, unused_imports)]\nmod b {}\n";
        assert_eq!(
            remove_unexpected_cfgs_allowance(source).unwrap(),
            "#[allow(dead_code, unused_imports)]\nmod a {}\n    #[allow(unused_imports)]\nmod b {}\n"
        );
        assert!(remove_unexpected_cfgs_allowance("mod a {}\n").is_err());
    }

    #[test]
    fn blocking_feature_is_declared_for_the_generated_client() {
        let manifest =
            fs::read_to_string(repository_root().join("packages/rust/Cargo.toml")).unwrap();
        assert!(manifest.contains("\nblocking = []\n"));
        let generated = fs::read_to_string(repository_root().join(OUTPUT_PATH)).unwrap();
        assert!(generated.contains("feature = \"blocking\""));
        assert!(!generated.contains("unexpected_cfgs"));
    }

    #[test]
    fn spargen_inputs_and_output_are_locked() {
        let spec = generation_spec();
        assert_eq!(spec.path().as_str(), SPEC_PATH);

        let build = generation_build(OUTPUT_PATH);
        assert_eq!(build.spec().path().as_str(), SPEC_PATH);
        assert_eq!(build.output().as_str(), OUTPUT_PATH);
    }

    #[test]
    fn diagnostic_policy_accepts_only_the_decided_warnings() {
        assert!(accepted_diagnostic(&diagnostic(
            Code::ValidationKeywordIgnored,
            "/components/schemas/Example"
        )));
        for pointer in EXPECTED_DEFAULT_WARNINGS {
            assert!(accepted_diagnostic(&diagnostic(
                Code::SchemaDefaultNotApplied,
                pointer
            )));
        }
        assert!(!accepted_diagnostic(&diagnostic(
            Code::SchemaDefaultNotApplied,
            "/components/schemas/Other"
        )));
        assert!(!accepted_diagnostic(&diagnostic(
            Code::ServerInitiatedFlowIgnored,
            "/webhooks/example"
        )));
        assert!(!accepted_diagnostic(&diagnostic(
            Code::AlternativeMediaIgnored,
            "/paths/~1other/post/requestBody"
        )));
    }

    #[test]
    fn support_audit_has_no_unapproved_diagnostics_or_omissions() {
        env::set_current_dir(repository_root()).unwrap();
        let input = SpargenInput::prepare().unwrap();
        let report = input.run(|| spargen::check(&generation_spec())).unwrap();
        validate_report(&report, Outcome::Clean).unwrap();
    }

    #[test]
    fn generated_client_exposes_every_source_operation() {
        // The contract named by config/sdk.json (openapi/staging.json in the
        // internal repository, openapi/openapi.json in the public one).
        let config: Value = serde_json::from_str(
            &fs::read_to_string(repository_root().join("config/sdk.json")).unwrap(),
        )
        .unwrap();
        let contract = config["schemaPath"].as_str().unwrap();
        let document: Value =
            serde_json::from_str(&fs::read_to_string(repository_root().join(contract)).unwrap())
                .unwrap();
        let expected = operation_count(&document);
        let actual = generated_syntax()
            .items
            .iter()
            .filter_map(|item| match item {
                Item::Impl(item) if type_name(item).is_some_and(|name| name == "Client") => {
                    Some(item)
                }
                _ => None,
            })
            .flat_map(|item| &item.items)
            .filter(
                |item| matches!(item, ImplItem::Fn(function) if function.sig.asyncness.is_some()),
            )
            .count();
        assert_eq!(actual, expected);
    }

    #[test]
    fn alternate_success_operations_remain_typed() {
        let document: Value =
            serde_json::from_str(&fs::read_to_string(repository_root().join(SPEC_PATH)).unwrap())
                .unwrap();
        let expected = alternate_success_responses(&document);
        let enums = generated_syntax()
            .items
            .into_iter()
            .filter_map(|item| match item {
                Item::Enum(item) => Some((
                    item.ident.to_string(),
                    item.variants
                        .into_iter()
                        .map(|variant| variant.ident.to_string())
                        .collect::<BTreeSet<_>>(),
                )),
                _ => None,
            })
            .collect::<BTreeMap<_, _>>();
        let actual = expected
            .keys()
            .filter_map(|name| {
                enums
                    .get(name)
                    .map(|variants| (name.clone(), variants.clone()))
            })
            .collect::<BTreeMap<_, _>>();

        assert_eq!(actual, expected);
    }

    #[test]
    fn response_enum_names_follow_spargen_casing() {
        for (operation_id, expected) in [
            ("changePlan", "ChangePlanResponse"),
            ("updateTenDlcBrand", "UpdateTenDlcBrandResponse"),
            ("getURL", "GetUrlResponse"),
        ] {
            assert_eq!(format!("{}Response", pascal_case(operation_id)), expected);
        }
    }
}
