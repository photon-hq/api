import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  checkContractNaming,
  checkRustNaming,
  checkTypeScriptNaming,
  countViolations,
  renderNamingReport,
  type NamingViolation,
} from "./naming.js";
import { addUnknownPlatformMembers } from "./prepare-sdk.js";
import { validateSdkConfig, type NamingWaiver } from "./sdk-config.js";
import { assert, contractPath as configuredContractPath, isObject, repositoryRoot, sdkPackages, type JsonObject } from "./shared.js";

/**
 * Public-lane naming gate: the contract check, then the generated-SDK check
 * for each language package present (or those named with --sdk). Exits 1 on
 * any violation. Nothing is exempted: a failing name is fixed upstream, in the
 * service that owns the schema, or in the generator. The only SDK names that do
 * not spell a contract component are the request copies of platform unions
 * that SDK preparation adds with the unknown-platform member
 * (`UserSnapshotInput`, see addUnknownPlatformMembers).
 *
 * The one exception is a recorded naming waiver in the SDK configuration
 * (`namingWaiver` in --config, default config/sdk.json; the internal
 * repository's public configuration is config/sdk.production.json): the
 * check then runs and reports in full but does not fail.
 *
 *   node tools/openapi/dist/check-naming.js [--contract FILE (default: config/sdk.json schemaPath)]
 *     [--config FILE] [--sdk typescript,python,rust|none] [--report FILE.md] [--json FILE.json] [--limit N]
 */

const LANGUAGES = ["typescript", "python", "rust"] as const;
type Language = (typeof LANGUAGES)[number];

export function sdkNamingViolations(language: Language, contract: JsonObject, root = repositoryRoot, contractPath?: string): NamingViolation[] {
  const read = (path: string): string => readFileSync(resolve(root, path), "utf8");
  if (language === "typescript") {
    return checkTypeScriptNaming(contract, ["types.gen.ts", "zod.gen.ts"].map((name) => {
      const file = `packages/typescript/src/generated/${name}`;
      return { file, text: read(file) };
    }));
  }
  if (language === "rust") return checkRustNaming(contract, read("packages/rust/src/generated.rs"));
  // Python classes are mapped to their source pointers by the generator's own
  // parser (tools/python-codegen/check_naming.py).
  const scratch = mkdtempSync(join(tmpdir(), "photon-python-naming-"));
  try {
    const output = join(scratch, "violations.json");
    const python = process.env.PYTHON_BIN ?? "python3";
    const result = spawnSync(python, [
      "tools/python-codegen/check_naming.py",
      "--contract", contractPath ?? resolve(root, configuredContractPath(root)),
      "--sdk", "openapi/sdk.json",
      "--json", output,
      "--limit", "0",
    ], { cwd: root, stdio: ["ignore", "inherit", "inherit"] });
    assert(result.status === 0 || result.status === 1, `Python naming check failed to run (${python}): exit ${result.status ?? result.signal}`);
    return JSON.parse(readFileSync(output, "utf8")) as NamingViolation[];
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** The naming waiver of an SDK configuration file, if it records one. */
export function namingWaiverOf(configPath: string): NamingWaiver | undefined {
  return validateSdkConfig(JSON.parse(readFileSync(configPath, "utf8"))).namingWaiver;
}

/**
 * The waiver's report line. The approval record appears only when the
 * configuration has one (the internal production configuration); the public
 * repository's copy has none, so its CI prints `until` and `reason` only.
 */
export function waiverNotice(waiver: NamingWaiver, violations: number): string {
  const approval = waiver.approvedBy ? ` Waiver approved by ${waiver.approvedBy} on ${waiver.approvedOn}.` : "";
  return violations
    ? `Naming not enforced until ${waiver.until}: ${violations} violations reported, not failed.${approval} ${waiver.reason}`
    : `The contract and SDK names pass the naming gate; remove the naming waiver (until ${waiver.until}) so the gate is enforced again.${approval}`;
}

function main(): void {
  const { values } = parseArgs({
    options: {
      contract: { type: "string" },
      config: { type: "string" },
      sdk: { type: "string" },
      report: { type: "string" },
      json: { type: "string" },
      limit: { type: "string", default: "20" },
    },
  });
  const contractPath = resolve(values.contract ?? configuredContractPath());
  const contract = JSON.parse(readFileSync(contractPath, "utf8")) as JsonObject;
  assert(isObject(contract) && isObject(contract.paths), `${contractPath} is not an OpenAPI document`);
  const present = sdkPackages();
  const languages: Language[] = values.sdk === undefined
    ? LANGUAGES.filter((language) => present[language])
    : values.sdk === "none" ? [] : values.sdk.split(",").map((value) => {
      assert((LANGUAGES as readonly string[]).includes(value), `Unknown SDK language: ${value}`);
      return value as Language;
    });

  const contractReport = checkContractNaming(contract);
  const violations = [...contractReport.violations];
  const sections = [renderNamingReport(
    `Contract names (${contractReport.operations} operations, ${contractReport.components} components)`,
    contractReport.violations,
    Number(values.limit),
  )];
  // The SDK's names: the contract's, plus the request copies SDK preparation adds.
  const named = structuredClone(contract);
  const added = addUnknownPlatformMembers(named);
  const scratch = mkdtempSync(join(tmpdir(), "photon-naming-contract-"));
  try {
    const namedPath = added.length ? join(scratch, "contract.json") : contractPath;
    if (added.length) writeFileSync(namedPath, JSON.stringify(named));
    for (const language of languages) {
      const found = sdkNamingViolations(language, named, repositoryRoot, namedPath);
      violations.push(...found);
      sections.push(renderNamingReport(`Generated ${language} type names`, found, Number(values.limit)));
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  const waiver = namingWaiverOf(resolve(values.config ?? resolve(repositoryRoot, "config/sdk.json")));
  if (waiver) sections.unshift(`> [!WARNING]\n> ${waiverNotice(waiver, violations.length)}\n`);
  const report = sections.join("\n");
  if (values.report) writeFileSync(values.report, report);
  if (values.json) writeFileSync(values.json, `${JSON.stringify({ counts: countViolations(violations), violations }, null, 2)}\n`);
  console.log(report);
  if (waiver) {
    const notice = waiverNotice(waiver, violations.length);
    console.log(process.env.GITHUB_ACTIONS === "true" ? `::warning title=Naming waiver::${notice}` : notice);
    return;
  }
  if (violations.length) {
    console.error(`Naming check failed: ${violations.length} violations (${Object.entries(countViolations(violations)).map(([rule, count]) => `${rule} ${count}`).join(", ")}).`);
    process.exitCode = 1;
  } else {
    console.log(`Naming check passed: contract${languages.length ? ` and ${languages.join(", ")} SDK` : ""} names come from the contract.`);
  }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
