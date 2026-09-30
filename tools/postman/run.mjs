import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, realpath } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

// Keep the converter's process free of credentials, network and subprocess access.
assert.ok(Number(process.versions.node.split(".")[0]) >= 26, "Postman generation requires Node.js 26+");
const tooling = await realpath(dirname(fileURLToPath(import.meta.url)));
// The contract is config/sdk.json's schemaPath (openapi/openapi.json in the
// public repository); --schema selects another file.
const { values } = parseArgs({ options: { schema: { type: "string" } } });
let contract = values.schema;
if (contract === undefined) {
  const config = JSON.parse(await readFile("config/sdk.json", "utf8"));
  assert.equal(config.environment, "production", "Postman generation requires the separate public build tree");
  contract = config.schemaPath;
}
const schema = await realpath(resolve(contract));
await mkdir("postman", { recursive: true });
const output = await realpath(resolve("postman"));
execFileSync(process.execPath, [
  "--permission", `--allow-fs-read=${tooling}`, `--allow-fs-read=${schema}`,
  `--allow-fs-write=${output}`, resolve(tooling, "generate.mjs"), schema, resolve(output, "collection.json"),
], { stdio: "inherit", env: { LANG: "C.UTF-8", TZ: "UTC" } });
