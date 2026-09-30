import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { canonicalize } from "json-canonicalize";

export const repositoryRoot = resolve(import.meta.dirname, "../../..");

/**
 * SDK packages present in this checkout. The internal repository has all
 * three; each public language repository has exactly one, and generation only
 * writes the packages that exist.
 */
export function sdkPackages(root = repositoryRoot): { typescript: boolean; python: boolean; rust: boolean } {
  return {
    typescript: existsSync(resolve(root, "packages/typescript")),
    python: existsSync(resolve(root, "packages/python")),
    rust: existsSync(resolve(root, "packages/rust")),
  };
}

/**
 * Where each repository keeps its contract (config/sdk.json `schemaPath`):
 * the internal repository at openapi/staging.json, the public repository at
 * openapi/openapi.json.
 */
export const INTERNAL_CONTRACT_PATH = "openapi/staging.json";
export const PUBLIC_CONTRACT_PATH = "openapi/openapi.json";

/** The contract path of this checkout, from config/sdk.json. */
export function contractPath(root = repositoryRoot): string {
  const config = JSON.parse(readFileSync(resolve(root, "config/sdk.json"), "utf8")) as { schemaPath?: unknown };
  assert(
    config.schemaPath === INTERNAL_CONTRACT_PATH || config.schemaPath === PUBLIC_CONTRACT_PATH,
    `config/sdk.json schemaPath must be ${INTERNAL_CONTRACT_PATH} or ${PUBLIC_CONTRACT_PATH}`,
  );
  return config.schemaPath;
}

export type JsonObject = { [key: string]: JsonValue };
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | JsonObject;

export function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function readJson<T = JsonValue>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

export function stableJson(value: JsonValue): string {
  return `${canonicalize(value)}\n`;
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function writeAtomic(path: string, contents: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, contents, "utf8");
  await rename(temporaryPath, path);
}

export function pascalCase(value: string): string {
  const words = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  return words
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join("");
}

/**
 * `snake_case`. A lower-case letter followed by a capital starts a word; a
 * capital run that contains a digit stays one word (`createM2MToken` ->
 * `create_m2m_token`, not `create_m2_mtoken`). Other capital runs join the
 * next word as before (`updateOAuthClient` -> `update_oauth_client`).
 */
export function snakeCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/([0-9][A-Z]*)([A-Z][a-z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

