import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateSchemaTarget, validateSdkConfig } from "./sdk-config.js";
import { assert, isObject, readJson, type JsonObject } from "./shared.js";

/** Reject incomparable snapshots before running a wire-contract diff. */
export function checkApiBaseline(
  base: JsonObject,
  candidate: JsonObject,
  candidateConfig: unknown,
): string {
  const current = validateSdkConfig(candidateConfig);
  // Validate the source itself against the selected target. Historical SDK
  // configuration can use an older format and is not the API contract.
  validateSchemaTarget(base, current);
  validateSchemaTarget(candidate, current);
  assert(isObject(base.info) && isObject(candidate.info), "Both source documents must declare info");
  const version = base.info.version;
  assert(typeof version === "string" && version.trim().length > 0 &&
    version === candidate.info.version,
  `API document version changed or is missing (base ${JSON.stringify(version)}, candidate ${JSON.stringify(candidate.info.version)}); ` +
    "compatibility is not classified across versions. To accept the new version as the baseline, follow " +
    "\"Accepting a new API document version\" in the repository README");
  return version;
}

async function main(): Promise<void> {
  const [basePath, candidatePath, candidateConfigPath] = process.argv.slice(2);
  assert(basePath && candidatePath && candidateConfigPath,
    "Usage: check-api-baseline BASE_SOURCE CANDIDATE_SOURCE CANDIDATE_CONFIG");
  const [base, candidate, candidateConfig] = await Promise.all([
    readJson<JsonObject>(resolve(basePath)),
    readJson<JsonObject>(resolve(candidatePath)),
    readJson<unknown>(resolve(candidateConfigPath)),
  ]);
  const version = checkApiBaseline(base, candidate, candidateConfig);
  console.log("# API comparison baseline\n");
  console.log(`Comparing authoritative source snapshots with matching target and document version (${JSON.stringify(version)}).`);
  console.log("This checks the declared document version, not whether it is the previously published client/API-version baseline. Public release qualification must establish that baseline separately.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
