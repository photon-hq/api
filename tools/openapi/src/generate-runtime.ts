import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  loadSdkConfig,
  schemaPath,
  validateSchemaTarget,
  type SdkConfig,
} from "./sdk-config.js";
import { readJson, repositoryRoot, sdkPackages, writeAtomic, type JsonObject } from "./shared.js";

export function runtimeFiles(config: SdkConfig): Record<string, string> {
  const url = JSON.stringify(config.defaultBaseUrl);
  return {
    "packages/typescript/src/config.generated.ts": `// Generated from config/sdk.json. Do not edit.\nexport const DEFAULT_BASE_URL = ${url};\n`,
    "packages/python/src/photon_api/config_generated.py": `# Generated from config/sdk.json. Do not edit.\nDEFAULT_BASE_URL = ${url}\n`,
    "packages/rust/src/config_generated.rs": `// Generated from config/sdk.json. Do not edit.\npub const DEFAULT_BASE_URL: &str = ${url};\n`,
  };
}

export async function generateRuntime(expectedEnvironment?: string): Promise<void> {
  const config = await loadSdkConfig(expectedEnvironment);
  validateSchemaTarget(await readJson<JsonObject>(schemaPath(config)), config);
  const present = sdkPackages();
  for (const [path, contents] of Object.entries(runtimeFiles(config))) {
    const language = path.split("/")[1] as keyof typeof present;
    if (!present[language]) continue;
    await writeAtomic(resolve(repositoryRoot, path), contents);
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { values } = parseArgs({ options: { environment: { type: "string" } } });
  await generateRuntime(values.environment);
}
