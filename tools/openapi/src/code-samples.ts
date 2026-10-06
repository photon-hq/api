// SDK code samples for the documentation site. Writes openapi/openapi.mintlify.json:
// the public contract with an `x-codeSamples` list (TypeScript, Python, Rust) on
// every operation, the format Mintlify renders beside each endpoint. Method
// names come from the generated SDKs themselves, so a sample always calls the
// method the released package has. Arguments are the operation's required
// inputs only, each set to a placeholder: its own name for strings, or a value
// the schema allows (const, first enum value, minimum, a fixed date).
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { ManifestOperation, RpcManifest } from "./generate-facades.js";
import {
  assert,
  isObject,
  pascalCase,
  readJson,
  repositoryRoot,
  snakeCase,
  writeAtomic,
  type JsonObject,
  type JsonValue,
} from "./shared.js";

export const MINTLIFY_CONTRACT_PATH = "openapi/openapi.mintlify.json";
const BINARY_SAMPLE = "Hello from Photon.";
// The media type of BINARY_SAMPLE, sent as its Content-Type.
const BINARY_MEDIA_TYPE = "text/plain";
const TOKEN_TS = "process.env.PHOTON_API_TOKEN";
const DATE_TIME = "2026-01-01T00:00:00Z";

export interface CodeSample {
  lang: "typescript" | "python" | "rust";
  label: string;
  source: string;
}

export interface PythonMethod {
  /** Call path from the client, e.g. `photon.projects.get`. */
  path: string;
  /** The `input` parameter as declared, e.g. `input: GetProjectInput | None = None`. */
  parameter: string;
  /** The declared return type, e.g. `models.Project`. */
  returns: string;
}

/** Each operation's method on the generated Python client (photon_api/rpc_generated.py), by input type name without `Input`. */
export function pythonMethods(source: string): Map<string, PythonMethod> {
  const classes = new Map<string, { children: Array<[string, string]>; methods: Array<[string, string, string, string]> }>();
  // Each class block runs from its `class` line to the next top-level statement;
  // ruff may wrap a signature, so match across lines.
  for (const block of source.split(/^(?=class )/m)) {
    const declared = /^class (\w+):/.exec(block);
    if (!declared) continue;
    const body = block.split(/^(?=\S)/m).slice(0, 2).join("");
    classes.set(declared[1]!, {
      children: [...body.matchAll(/^ {8}self\.([a-z]\w*) = (\w+)\(transport\)/gm)].map((match) => [match[1]!, match[2]!]),
      methods: [...body.matchAll(/^ {4}(?:async )?def (\w+)\(\s*self,\s*(input: (\w+)Input\b[^)]*?)\s*\)\s*->\s*([^:]+?):\s*$/gm)]
        .map((match) => [match[1]!, match[3]!, match[2]!.replace(/\s+/g, " "), match[4]!.replace(/\s+/g, " ")]),
    });
  }
  const methods = new Map<string, PythonMethod>();
  const visit = (className: string, prefix: string) => {
    const node = classes.get(className);
    assert(node, `Python client class ${className} not found`);
    for (const [method, inputType, parameter, returns] of node.methods) methods.set(inputType, { path: `${prefix}.${method}`, parameter, returns });
    for (const [member, childClass] of node.children) visit(childClass, `${prefix}.${member}`);
  };
  visit("SyncRoot", "photon");
  return methods;
}

/** Python call path of each operation, read from the generated client (photon_api/rpc_generated.py). */
export function pythonCallPaths(source: string): Map<string, string> {
  return new Map([...pythonMethods(source)].map(([inputType, method]) => [inputType, method.path]));
}

export interface RustArgument {
  name: string;
  type: string;
}

export interface RustMethod {
  arguments: RustArgument[];
  /** The declared return type, e.g. `Result<ResponseValue<types::Project>, Error<GetProjectError>>`. */
  returns: string;
}

/** Each generated Rust client method (photonhq-api src/generated.rs), by method name. */
export function rustMethods(source: string): Map<string, RustMethod> {
  const methods = new Map<string, RustMethod>();
  for (const match of source.matchAll(/pub async fn (\w+)\(\s*&self,?([^)]*)\)\s*->\s*([\s\S]*?)\s*\{/g)) {
    const argumentsList = match[2]!
      .split(/,\s*(?![^<]*>)/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf(":");
        return { name: part.slice(0, separator).trim(), type: part.slice(separator + 1).trim() };
      });
    const returns = match[3]!.replace(/\s+/g, " ").replace(/support::/g, "").replace(/<\s/g, "<").replace(/,?\s*>/g, ">");
    methods.set(match[1]!, { arguments: argumentsList, returns });
  }
  return methods;
}

/** Arguments of each generated Rust client method (photonhq-api src/generated.rs), by method name. */
export function rustSignatures(source: string): Map<string, RustArgument[]> {
  return new Map([...rustMethods(source)].map(([name, method]) => [name, method.arguments]));
}

function resolveSchema(document: JsonObject, schema: JsonValue | undefined): JsonValue | undefined {
  let current = schema;
  for (let depth = 0; isObject(current) && typeof current.$ref === "string" && depth < 32; depth += 1) {
    const name = decodeURIComponent(current.$ref.replace("#/components/schemas/", ""));
    const schemas = (document.components as JsonObject | undefined)?.schemas as JsonObject | undefined;
    current = schemas?.[name];
  }
  return current;
}

/** A placeholder the schema accepts, built from required members only. */
export function placeholder(document: JsonObject, raw: JsonValue | undefined, name: string, depth = 0): JsonValue {
  const schema = resolveSchema(document, raw);
  if (!isObject(schema) || depth > 8) return name;
  if ("const" in schema) return schema.const as JsonValue;
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum.find((value) => value !== null) ?? schema.enum[0]!;
  for (const keyword of ["oneOf", "anyOf"] as const) {
    const branches = schema[keyword];
    if (Array.isArray(branches) && branches.length > 0) {
      const branch = branches.find((candidate) => {
        const resolved = resolveSchema(document, candidate);
        return !(isObject(resolved) && resolved.type === "null");
      }) ?? branches[0];
      return placeholder(document, branch, name, depth + 1);
    }
  }
  if (Array.isArray(schema.allOf)) {
    const merged: JsonObject = {};
    for (const part of schema.allOf) {
      const value = placeholder(document, part, name, depth + 1);
      if (isObject(value)) Object.assign(merged, value);
      else return value;
    }
    return merged;
  }
  const type = Array.isArray(schema.type) ? schema.type.find((value) => value !== "null") : schema.type;
  switch (type) {
    case "object": {
      const result: JsonObject = {};
      const properties = isObject(schema.properties) ? schema.properties : {};
      for (const property of Array.isArray(schema.required) ? schema.required : []) {
        if (typeof property === "string") result[property] = placeholder(document, properties[property], property, depth + 1);
      }
      return result;
    }
    case "array":
      return typeof schema.minItems === "number" && schema.minItems > 0
        ? [placeholder(document, schema.items, name, depth + 1)]
        : [];
    case "integer":
    case "number":
      return typeof schema.minimum === "number" ? schema.minimum : typeof schema.exclusiveMinimum === "number" ? schema.exclusiveMinimum + 1 : 1;
    case "boolean":
      return true;
    case "string":
      if (schema.format === "date-time") return DATE_TIME;
      if (schema.format === "date") return DATE_TIME.slice(0, 10);
      if (schema.format === "uri" || schema.format === "url") return "https://example.com";
      if (schema.format === "email") return "user@example.com";
      return name;
    default:
      return name;
  }
}

const identifier = /^[A-Za-z_$][\w$]*$/;

function typescriptLiteral(value: JsonValue, indent: string): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((item) => `${indent}  ${typescriptLiteral(item, `${indent}  `)}`).join(",\n")},\n${indent}]`;
  }
  if (isObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries.map(([key, item]) => `${indent}  ${identifier.test(key) ? key : JSON.stringify(key)}: ${typescriptLiteral(item, `${indent}  `)}`).join(",\n")},\n${indent}}`;
  }
  return JSON.stringify(value);
}

function pythonLiteral(value: JsonValue, indent: string): string {
  if (value === null) return "None";
  if (value === true) return "True";
  if (value === false) return "False";
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((item) => `${indent}    ${pythonLiteral(item, `${indent}    `)}`).join(",\n")},\n${indent}]`;
  }
  if (isObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries.map(([key, item]) => `${indent}    ${JSON.stringify(key)}: ${pythonLiteral(item, `${indent}    `)}`).join(",\n")},\n${indent}}`;
  }
  return JSON.stringify(value);
}

function rustJson(value: JsonValue, indent: string): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `[\n${value.map((item) => `${indent}    ${rustJson(item, `${indent}    `)}`).join(",\n")},\n${indent}]`;
  }
  if (isObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return `{\n${entries.map(([key, item]) => `${indent}    ${JSON.stringify(key)}: ${rustJson(item, `${indent}    `)}`).join(",\n")},\n${indent}}`;
  }
  return JSON.stringify(value);
}

interface Inputs {
  /** Wire-named groups, as the TypeScript input object and Python model_validate take them. */
  groups: Record<"path" | "query" | "headers", JsonObject>;
  /** Header names as the TypeScript input names them. */
  typescriptHeaders: JsonObject;
  body?: { binary: boolean; value: JsonValue };
}

function operationInputs(document: JsonObject, operation: ManifestOperation): Inputs {
  const groups: Inputs["groups"] = { path: {}, query: {}, headers: {} };
  const typescriptHeaders: JsonObject = {};
  for (const parameter of operation.parameters) {
    if (!parameter.required) continue;
    const value = parameter.location === "header" && /^content-length$/i.test(parameter.wireName)
      ? String(Buffer.byteLength(BINARY_SAMPLE))
      : parameter.location === "header" && /^content-type$/i.test(parameter.wireName)
        ? BINARY_MEDIA_TYPE
        : placeholder(document, parameter.schema as JsonValue, parameter.name);
    if (parameter.location === "header") {
      groups.headers[parameter.wireName] = value;
      typescriptHeaders[parameter.name] = value;
    } else if (parameter.location === "path" || parameter.location === "query") {
      groups[parameter.location][parameter.wireName] = value;
    }
  }
  const body = operation.requestBody;
  if (!body?.required) return { groups, typescriptHeaders };
  const [mediaType, schema] = Object.entries(body.content).find(([type]) => type === "application/json") ?? Object.entries(body.content)[0]!;
  if (mediaType !== "application/json") return { groups, typescriptHeaders, body: { binary: true, value: BINARY_SAMPLE } };
  const resolved = typeof schema === "string" ? { $ref: schema } : schema as JsonValue;
  return { groups, typescriptHeaders, body: { binary: false, value: placeholder(document, resolved, "body") } };
}

function hasResult(operation: ManifestOperation): boolean {
  return Object.entries(operation.responses).some(([status, content]) => status.startsWith("2") && Object.keys(content).length > 0);
}

function credentialScheme(document: JsonObject, operationId: string): string | undefined {
  for (const item of Object.values(document.paths as JsonObject)) {
    if (!isObject(item)) continue;
    for (const operation of Object.values(item)) {
      if (!isObject(operation) || operation.operationId !== operationId) continue;
      const security = Array.isArray(operation.security) ? operation.security : (document.security as JsonValue[] | undefined) ?? [];
      if (security.length === 0 || security.some((requirement) => isObject(requirement) && Object.keys(requirement).length === 0)) return undefined;
      const first = security.find((requirement) => isObject(requirement) && Object.keys(requirement).length > 0) as JsonObject;
      return Object.keys(first)[0];
    }
  }
  throw new Error(`Operation ${operationId} not in the contract`);
}

export function typescriptSample(document: JsonObject, operation: ManifestOperation): string {
  const inputs = operationInputs(document, operation);
  const scheme = credentialScheme(document, operation.operationId);
  const input: JsonObject = {};
  for (const group of ["path", "query"] as const) if (Object.keys(inputs.groups[group]).length) input[group] = inputs.groups[group];
  if (Object.keys(inputs.typescriptHeaders).length) input.headers = inputs.typescriptHeaders;
  let argument = Object.keys(input).length || inputs.body ? typescriptLiteral(input, "") : "";
  if (inputs.body) {
    const body = inputs.body.binary ? `new Blob([${JSON.stringify(inputs.body.value)}], { type: ${JSON.stringify(BINARY_MEDIA_TYPE)} })` : typescriptLiteral(inputs.body.value, "  ");
    argument = argument === "{}" ? `{\n  body: ${body},\n}` : `${argument.slice(0, -1)}  body: ${body},\n}`;
  }
  const client = scheme
    ? `const photon = new Photon({\n  headers: { Authorization: \`Bearer \${${TOKEN_TS}}\` },\n});`
    : "const photon = new Photon();";
  const call = `await photon.${[...operation.namespace, operation.rpcMethod].join(".")}(${argument})`;
  return [
    'import { Photon } from "@photon-ai/api";',
    "",
    client,
    hasResult(operation) ? `const result = ${call};` : `${call};`,
  ].join("\n");
}

export function pythonSample(document: JsonObject, operation: ManifestOperation, callPath: string): string {
  const inputs = operationInputs(document, operation);
  const scheme = credentialScheme(document, operation.operationId);
  const typeName = `${pascalCase(operation.operationId)}Input`;
  const input: JsonObject = {};
  for (const group of ["path", "query", "headers"] as const) if (Object.keys(inputs.groups[group]).length) input[group] = inputs.groups[group];
  let literal = Object.keys(input).length || inputs.body ? pythonLiteral(input, "    ") : "";
  if (inputs.body) {
    const body = inputs.body.binary ? `b${JSON.stringify(inputs.body.value)}` : pythonLiteral(inputs.body.value, "        ");
    literal = literal === "{}" ? `{\n        "body": ${body},\n    }` : `${literal.slice(0, -5)}        "body": ${body},\n    }`;
  }
  const lines = scheme
    ? ["import os", "", "from photon_api import Photon"]
    : ["from photon_api import Photon"];
  if (literal) lines.push(`from photon_api.rpc_generated import ${typeName}`);
  lines.push("");
  lines.push(scheme ? 'photon = Photon(headers={"Authorization": f"Bearer {os.environ[\'PHOTON_API_TOKEN\']}"})' : "photon = Photon()");
  const call = literal ? `${callPath}(\n    ${typeName}.model_validate(${literal})\n)` : `${callPath}()`;
  lines.push(hasResult(operation) ? `result = ${call}` : call);
  return lines.join("\n");
}

function rustArgument(document: JsonObject, operation: ManifestOperation, inputs: Inputs, argument: RustArgument): string {
  if (argument.name === "body") {
    assert(inputs.body, `${operation.operationId}: Rust takes a body the contract does not require`);
    if (inputs.body.binary) return `&${JSON.stringify(inputs.body.value)}.into()`;
    return `&serde_json::from_value(serde_json::json!(${rustJson(inputs.body.value, "        ")}))?`;
  }
  if (/^Option</.test(argument.type)) return "None";
  const parameter = operation.parameters.find((candidate) => snakeCase(candidate.name) === argument.name || snakeCase(candidate.wireName) === argument.name);
  assert(parameter, `${operation.operationId}: no contract parameter for Rust argument ${argument.name}`);
  const groups = { path: inputs.groups.path, query: inputs.groups.query, header: inputs.groups.headers } as Record<string, JsonObject>;
  const value = groups[parameter.location]?.[parameter.wireName] ?? placeholder(document, parameter.schema as JsonValue, parameter.name);
  if (argument.type === "String") return `${JSON.stringify(typeof value === "string" ? value : JSON.stringify(value))}.to_owned()`;
  if (/^f(32|64)$/.test(argument.type) && typeof value === "number") return Number.isInteger(value) ? `${value}.0` : String(value);
  if (/^(i|u)(8|16|32|64)$|^bool$/.test(argument.type)) return JSON.stringify(value);
  return `serde_json::from_value(serde_json::json!(${JSON.stringify(value)}))?`;
}

export function rustSample(document: JsonObject, operation: ManifestOperation, signature: RustArgument[]): string {
  const inputs = operationInputs(document, operation);
  const scheme = credentialScheme(document, operation.operationId);
  const argumentsText = signature.map((argument) => rustArgument(document, operation, inputs, argument));
  const call = argumentsText.some((text) => text.includes("\n")) || argumentsText.join(", ").length > 60
    ? `(\n        ${argumentsText.join(",\n        ")},\n    )`
    : `(${argumentsText.join(", ")})`;
  const lines = scheme
    ? [
        "use photon_ai_api::{Credential, PhotonClientBuilder, SecretString};",
        "",
        'let token = std::env::var("PHOTON_API_TOKEN")?;',
        "let client = PhotonClientBuilder::new()",
        `    .credential(${JSON.stringify(scheme)}, Credential::Bearer(SecretString::from(token)))`,
        "    .build()?;",
      ]
    : ["use photon_ai_api::PhotonClientBuilder;", "", "let client = PhotonClientBuilder::new().build()?;"];
  const request = [
    "client",
    `    .${snakeCase(operation.operationId)}${call}`,
    "    .await",
    '    .map_err(|error| format!("{error:?}"))?',
  ];
  if (hasResult(operation)) {
    lines.push(`let result = ${request[0]}`, ...request.slice(1), "    .into_inner();");
  } else {
    lines.push(...request.slice(0, -1), `${request.at(-1)};`);
  }
  return lines.join("\n");
}

export interface SampleSources {
  pythonClient: string;
  rustClient: string;
}

/** The contract with `x-codeSamples` on every operation the SDKs expose. */
export function withCodeSamples(document: JsonObject, manifest: RpcManifest, sources: SampleSources): JsonObject {
  const result = structuredClone(document);
  const python = pythonCallPaths(sources.pythonClient);
  const rust = rustSignatures(sources.rustClient);
  const operations = new Map(manifest.operations.map((operation) => [operation.operationId, operation]));
  for (const item of Object.values(result.paths as JsonObject)) {
    if (!isObject(item)) continue;
    for (const operation of Object.values(item)) {
      if (!isObject(operation) || typeof operation.operationId !== "string") continue;
      const manifestOperation = operations.get(operation.operationId);
      assert(manifestOperation, `Operation ${operation.operationId} is not in the RPC manifest`);
      const pythonPath = python.get(pascalCase(operation.operationId));
      const rustSignature = rust.get(snakeCase(operation.operationId));
      assert(pythonPath, `Python client has no method for ${operation.operationId}`);
      assert(rustSignature, `Rust client has no method for ${operation.operationId}`);
      const samples: CodeSample[] = [
        { lang: "typescript", label: "TypeScript", source: typescriptSample(document, manifestOperation) },
        { lang: "python", label: "Python", source: pythonSample(document, manifestOperation, pythonPath) },
        { lang: "rust", label: "Rust", source: rustSample(document, manifestOperation, rustSignature) },
      ];
      operation["x-codeSamples"] = samples as unknown as JsonValue;
    }
  }
  return result;
}

async function main(): Promise<void> {
  // The public repository runs this at its root; `--root DIR` points it at another tree.
  const rootFlag = process.argv.indexOf("--root");
  const root = rootFlag > 0 ? resolve(process.argv[rootFlag + 1]!) : repositoryRoot;
  const document = await readJson<JsonObject>(resolve(root, "openapi/openapi.json"));
  const manifest = await readJson<RpcManifest>(resolve(root, "openapi/rpc-manifest.json"));
  const sources = {
    pythonClient: await readFile(resolve(root, "packages/python/src/photon_api/rpc_generated.py"), "utf8"),
    rustClient: await readFile(resolve(root, "packages/rust/src/generated.rs"), "utf8"),
  };
  const output = withCodeSamples(document, manifest, sources);
  await writeAtomic(resolve(root, MINTLIFY_CONTRACT_PATH), `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${MINTLIFY_CONTRACT_PATH} with code samples for ${manifest.operations.length} operations`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
