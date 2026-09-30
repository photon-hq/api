use std::{
    env, fs,
    path::{Path, PathBuf},
};

use anyhow::{Context, Result, bail, ensure};
use spargen::{Build, CargoIntegration, Code, Diagnostic, Outcome, Report, Severity, Spec};

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

struct TemporaryOutput(PathBuf);

impl TemporaryOutput {
    fn new() -> Self {
        Self(env::temp_dir().join(format!(
            "photon-rust-codegen-{}-generated.rs",
            std::process::id()
        )))
    }

    fn path(&self) -> &Path {
        &self.0
    }
}

impl Drop for TemporaryOutput {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

fn check_generated_output() -> Result<Report> {
    let temporary = TemporaryOutput::new();
    let temporary_path = temporary
        .path()
        .to_str()
        .context("temporary Rust output path is not valid UTF-8")?;
    let report = generate(temporary_path)?;

    let committed = fs::read(OUTPUT_PATH).context("failed to read committed Rust client")?;
    let generated = fs::read(temporary.path()).context("failed to read generated Rust client")?;
    ensure!(
        committed == generated,
        "{OUTPUT_PATH} is out of date; run `npm run generate:rust`"
    );
    Ok(report)
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

fn generate(output: &str) -> Result<Report> {
    let report = spargen::generate(&generation_build(output));
    validate_report(&report, Outcome::Generated)?;
    // Compile each structurally equivalent model once; request models keep
    // their distinct types.
    let (source, stats) = share_models::share(&fs::read_to_string(output)?)?;
    fs::write(output, remove_unexpected_cfgs_allowance(&source)?)?;
    println!(
        "shared {} of {} Rust model definitions in {} passes; kept {} request models distinct; shared {} of {} header definitions",
        stats.shared,
        stats.models,
        stats.passes,
        stats.request_types,
        stats.shared_headers,
        stats.headers
    );
    Ok(report)
}

fn main() -> Result<()> {
    let check_only = match env::args().skip(1).collect::<Vec<_>>().as_slice() {
        [] => false,
        [argument] if argument == "--check" => true,
        _ => bail!("usage: photon-rust-codegen [--check]"),
    };

    env::set_current_dir(repository_root()).context("failed to enter repository root")?;
    let report = if check_only {
        check_generated_output()?
    } else {
        generate(OUTPUT_PATH)?
    };

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
        let report = spargen::check(&generation_spec());
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
