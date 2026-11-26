// SDK code samples for the documentation site. Writes openapi/openapi.mintlify.json:
// the public contract with an `x-codeSamples` list (TypeScript, Python, Rust, Go) on
// every operation, the format Mintlify renders beside each endpoint. Method
// names come from the generated SDKs themselves, so a sample always calls the
// method the released package has. Arguments are the operation's required
// inputs only, each set to a value its schema accepts: the contract's example
// where it has one, else a value generated from the schema
// (contract-values.ts). Every input is validated against its schema, and a
// mismatch fails the generation.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { childPointer, contractValues, refPointer, type ContractValues } from "./contract-values.js";
import type { ManifestOperation, ManifestParameter, RpcManifest } from "./generate-facades.js";
import { isFileUpload, isMultipartRelated } from "./media-types.js";
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
// The file a sample with a raw request body or a file upload sends.
const FILE_SAMPLE = "Hello from Photon.";
const FILE_MEDIA_TYPE = "text/plain";
const FILE_NAME = "hello.txt";
const TOKEN_TS = "process.env.PHOTON_API_TOKEN";

export interface CodeSample {
  lang: "typescript" | "python" | "rust" | "go";
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
        return { name: part.slice(0, separator).trim(), type: part.slice(separator + 1).trim().replace(/\bcrate::/g, "") };
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

export interface GoField {
  /** Go struct field name, e.g. `IdempotencyKey`. */
  name: string;
  location: "path" | "query" | "header";
  /** The contract parameter's wire name, from the generated field comment. */
  wireName: string;
  /** Go type with any pointer stripped. */
  type: string;
  /** Pointer fields are the contract's optional inputs. */
  optional: boolean;
}

export interface GoMethod {
  /** Call path from the client, e.g. `client.Projects.SendMessage`. */
  path: string;
  /** The params struct type name, e.g. `SendMessageParams`; absent when the method takes only ctx. */
  params?: string | undefined;
  fields: GoField[];
  /** The body field's Go type (`SendMessageRequest`, `io.Reader` for a binary body, or `*UploadFile` for a file upload). */
  bodyType?: string | undefined;
  /** The declared return, e.g. `(*SentMessage, error)` or `error`. */
  returns: string;
}

/**
 * Each generated Go client method (packages/go/operations_generated.go), by
 * `namespace.MethodName` (e.g. `account.onboarding.Get`). The namespace comes
 * from each service's "groups the X operations" comment and the call path from
 * the client's own service fields, so both always match the released package.
 */
export function goMethods(source: string): Map<string, GoMethod> {
  const namespaces = new Map<string, string>();
  for (const match of source.matchAll(/\/\/ (\w+Service) groups the ([\w.]+) operations\./g)) namespaces.set(match[1]!, match[2]!);
  // The client's service tree: `client.X = newYService(c)`, then `s.X = newYService(c)` per service.
  const paths = new Map<string, string>();
  const root = /\nfunc newClient\(c \*core\) \*Client \{([\s\S]*?)\n\}/.exec(source);
  assert(root, "Go client constructor not found");
  const pending: Array<[string, string]> = [...root[1]!.matchAll(/client\.(\w+) = new(\w+Service)\(c\)/g)].map((match) => [match[2]!, `client.${match[1]!}`]);
  while (pending.length) {
    const [service, path] = pending.pop()!;
    paths.set(service, path);
    const constructor = new RegExp(`\\nfunc new${service}\\(c \\*core\\) \\*${service} \\{([\\s\\S]*?)\\n\\}`).exec(source);
    assert(constructor, `Go service constructor new${service} not found`);
    for (const match of constructor[1]!.matchAll(/s\.(\w+) = new(\w+Service)\(c\)/g)) pending.push([match[2]!, `${path}.${match[1]!}`]);
  }
  const structs = new Map<string, { fields: GoField[]; bodyType?: string | undefined }>();
  for (const match of source.matchAll(/\ntype (\w+Params) struct \{([\s\S]*?)\n\}/g)) {
    const fields: GoField[] = [];
    for (const field of match[2]!.matchAll(/\n\t\/\/ (\w+) is the (path|query|header) parameter ([^.\n]+)\.[^\n]*\n\t\w+ ([^\n]+)/g)) {
      const type = field[4]!.trim();
      fields.push({ name: field[1]!, location: field[2] as GoField["location"], wireName: field[3]!, type: type.replace(/^\*/, ""), optional: type.startsWith("*") });
    }
    const body = /\n\t\/\/ Body is the request body\.[^\n]*\n\tBody ([^\n]+)/.exec(match[2]!);
    structs.set(match[1]!, { fields, bodyType: body?.[1]?.trim() });
  }
  const methods = new Map<string, GoMethod>();
  for (const match of source.matchAll(/\nfunc \(s \*(\w+Service)\) (\w+)\(ctx context\.Context(?:, params \*(\w+Params))?, opts \.\.\.RequestOption\) ((?:\([^)]*\))|error) \{/g)) {
    const [, service, method, paramsType, returns] = match;
    const namespace = namespaces.get(service!);
    const path = paths.get(service!);
    assert(namespace && path, `Go service ${service} has no namespace comment or client field`);
    const struct = paramsType ? structs.get(paramsType) : undefined;
    assert(!paramsType || struct, `Go params struct ${paramsType} not found`);
    methods.set(`${namespace}.${method}`, {
      path: `${path}.${method}`,
      params: paramsType ?? undefined,
      fields: struct?.fields ?? [],
      bodyType: struct?.bodyType,
      returns: returns!,
    });
  }
  return methods;
}

interface Contract {
  values: ContractValues;
  /** The JSON pointer of each operation, by operation ID. */
  operations: Map<string, string>;
}
const contracts = new WeakMap<JsonObject, Contract>();

/** The values of `document` and where its operations are, read once per document. */
function contractOf(document: JsonObject): Contract {
  let contract = contracts.get(document);
  if (!contract) {
    const operations = new Map<string, string>();
    for (const [path, item] of Object.entries(document.paths as JsonObject)) {
      if (!isObject(item)) continue;
      for (const [method, operation] of Object.entries(item)) {
        if (isObject(operation) && typeof operation.operationId === "string") operations.set(operation.operationId, childPointer("#/paths", path, method));
      }
    }
    contract = { values: contractValues(document), operations };
    contracts.set(document, contract);
  }
  return contract;
}

interface ContractParameter {
  pointer: string;
  location: string;
  name: string;
  required: boolean;
}

/**
 * An operation's parameters in the contract, operation parameters first since
 * they replace path-item parameters of the same name and location, and the
 * pointer of its Request Body Object.
 */
function contractOperation(document: JsonObject, operation: ManifestOperation): { parameters: ContractParameter[]; requestBody?: string } {
  const { values, operations } = contractOf(document);
  const at = operations.get(operation.operationId);
  assert(at, `Operation ${operation.operationId} not in the contract`);
  const resolved = (pointer: string): string => {
    const node = values.node(pointer);
    return isObject(node) && typeof node.$ref === "string" ? resolved(refPointer(node.$ref)) : pointer;
  };
  const parameters: ContractParameter[] = [];
  for (const owner of [at, at.slice(0, at.lastIndexOf("/"))]) {
    const list = values.node(childPointer(owner, "parameters"));
    for (const index of Array.isArray(list) ? list.keys() : []) {
      const pointer = resolved(childPointer(owner, "parameters", index));
      const parameter = values.node(pointer);
      if (!(isObject(parameter) && typeof parameter.in === "string" && typeof parameter.name === "string")) continue;
      const found = { pointer, location: parameter.in, name: parameter.name, required: parameter.required === true };
      if (!parameters.some((other) => sameParameter(other, found.location, found.name))) parameters.push(found);
    }
  }
  const requestBody = values.node(childPointer(at, "requestBody")) === undefined ? undefined : resolved(childPointer(at, "requestBody"));
  return { parameters, ...(requestBody ? { requestBody } : {}) };
}

/** Header names are case-insensitive. */
function sameParameter(parameter: ContractParameter, location: string, name: string): boolean {
  return parameter.location === location && (location === "header" ? parameter.name.toLowerCase() === name.toLowerCase() : parameter.name === name);
}

/** The JSON pointer of the Schema Object of an operation's parameter, or of its JSON body. */
function inputSchema(document: JsonObject, operation: ManifestOperation, input: ManifestParameter | "body"): string {
  const { parameters, requestBody } = contractOperation(document, operation);
  if (input === "body") {
    assert(requestBody, `${operation.operationId}: no request body in the contract`);
    return childPointer(requestBody, "content", "application/json", "schema");
  }
  const parameter = parameters.find((candidate) => sameParameter(candidate, input.location, input.wireName));
  assert(parameter, `${operation.operationId}: no ${input.location} parameter ${input.wireName} in the contract`);
  return childPointer(parameter.pointer, "schema");
}

/**
 * A value the schema of an operation's parameter or JSON body accepts: the
 * first example on the parameter or media type that the schema accepts, since
 * OpenAPI lets it override the schema's, else the schema's example, else one
 * generated from the schema. Values are seeded by the schema, so a project ID
 * is the same on every page that takes one.
 */
function inputValue(document: JsonObject, operation: ManifestOperation, input: ManifestParameter | "body"): JsonValue {
  const { values } = contractOf(document);
  const schema = inputSchema(document, operation, input);
  const name = input === "body" ? "body" : input.name;
  const owner = values.node(schema.slice(0, schema.lastIndexOf("/")));
  const declared = isObject(owner)
    ? [
        ...("example" in owner ? [owner.example] : []),
        ...Object.values(isObject(owner.examples) ? owner.examples : {}).map((entry) => {
          const example = isObject(entry) && typeof entry.$ref === "string" ? values.node(refPointer(entry.$ref)) : entry;
          return isObject(example) ? example.value : undefined;
        }),
      ]
    : [];
  const example = declared.find((value) => value !== undefined && values.issues(schema, value).length === 0);
  if (example !== undefined) return structuredClone(example);
  try {
    return values.sample(schema, { key: JSON.stringify(values.node(schema)), name });
  } catch (error) {
    throw new Error(`${operation.operationId}: no sample for ${name} (${schema}): ${(error as Error).message}`);
  }
}

/** The raw body a sample sends, in a media type the operation declares. */
function rawBody(operation: ManifestOperation, declared: string[]): { mediaType: string; value: string } {
  const mediaType = declared.find((type) => [FILE_MEDIA_TYPE, "application/octet-stream", "*/*"].includes(type));
  assert(mediaType, `${operation.operationId}: no sample body for ${declared.join(", ")}`);
  return { mediaType: mediaType === "*/*" ? FILE_MEDIA_TYPE : mediaType, value: FILE_SAMPLE };
}

// A media type without parameters (RFC 6838 section 4.2).
const mediaTypeName = /^[A-Za-z0-9][\w!#$&^.+-]{0,126}\/[A-Za-z0-9][\w!#$&^.+-]{0,126}$/;

/**
 * Throw, naming each input and JSON pointer, when a sample's inputs do not
 * match the operation in the contract. A file upload's file is checked
 * itself, since its SDK builds the multipart/related body from it.
 */
function checkInputs(document: JsonObject, operation: ManifestOperation, inputs: Inputs): void {
  const { values } = contractOf(document);
  const { parameters, requestBody } = contractOperation(document, operation);
  const issues: string[] = [];
  const groups: Record<string, JsonObject> = { path: inputs.groups.path, query: inputs.groups.query, header: inputs.groups.headers };
  for (const parameter of parameters) {
    // A file upload's SDK sets the Content-Type and Content-Length of the multipart/related body it builds.
    if (inputs.body?.upload && parameter.location === "header" && ["content-type", "content-length"].includes(parameter.name.toLowerCase())) continue;
    const group = groups[parameter.location] ?? {};
    const sent = Object.keys(group).find((name) => sameParameter(parameter, parameter.location, name));
    const where = `${parameter.location} ${parameter.name}`;
    if (sent === undefined) {
      if (parameter.required) issues.push(`${where} is required and missing`);
      continue;
    }
    for (const issue of values.issues(childPointer(parameter.pointer, "schema"), group[sent])) issues.push(`${where}${issue.pointer} ${issue.message}`);
  }
  const declared = requestBody === undefined ? undefined : values.node(requestBody);
  const content = isObject(declared) && isObject(declared.content) ? Object.keys(declared.content) : [];
  if (!inputs.body) {
    if (isObject(declared) && declared.required === true) issues.push("body is required and missing");
  } else if (inputs.body.upload) {
    if (!content.some(isMultipartRelated)) issues.push(`body is a file upload, and the contract's body is ${content.join(", ") || "none"}`);
    if (Buffer.byteLength(inputs.body.value) === 0) issues.push("body file has no bytes");
    if (!mediaTypeName.test(inputs.body.mediaType)) issues.push(`body file media type ${inputs.body.mediaType} is not type/subtype`);
  } else if (inputs.body.binary) {
    const essence = inputs.body.mediaType.split(";")[0]!.trim();
    const media = [essence, "*/*"].find((type) => content.includes(type));
    const schema = media === undefined ? undefined : childPointer(requestBody!, "content", media, "schema");
    if (schema === undefined) issues.push(`body media type ${essence} is not one of ${content.join(", ") || "none"}`);
    else if (values.node(schema) !== undefined) {
      for (const issue of values.issues(schema, inputs.body.value)) issues.push(`body${issue.pointer} ${issue.message}`);
    }
  } else {
    for (const issue of values.issues(inputSchema(document, operation, "body"), inputs.body.value)) issues.push(`body${issue.pointer} ${issue.message}`);
  }
  assert(issues.length === 0, `${operation.operationId}: the sample's inputs do not match the contract: ${issues.join("; ")}`);
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
  /** A raw body or, for a file upload (`isFileUpload` in media-types.ts), the file its SDK sends as a multipart/related body. */
  body?: { binary: false; upload: false; value: JsonValue } | { binary: true; upload: boolean; mediaType: string; value: string };
}

function operationInputs(document: JsonObject, operation: ManifestOperation): Inputs {
  const groups: Inputs["groups"] = { path: {}, query: {}, headers: {} };
  const typescriptHeaders: JsonObject = {};
  let body: Inputs["body"];
  if (operation.requestBody?.required) {
    const { content } = operation.requestBody;
    const declared = Object.keys(content);
    const media = Object.fromEntries(Object.entries(content).map(([type, schema]) => [type, { schema: typeof schema === "string" ? { $ref: schema } : schema }]));
    body = declared.includes("application/json")
      ? { binary: false, upload: false, value: inputValue(document, operation, "body") }
      : isFileUpload(media, document, `${operation.operationId} request`)
        ? { binary: true, upload: true, mediaType: FILE_MEDIA_TYPE, value: FILE_SAMPLE }
        : { binary: true, upload: false, ...rawBody(operation, declared) };
  }
  for (const parameter of operation.parameters) {
    if (!parameter.required) continue;
    const isHeader = (name: string): boolean => parameter.location === "header" && parameter.wireName.toLowerCase() === name;
    const value = body?.binary && isHeader("content-length")
      ? String(Buffer.byteLength(body.value))
      : body?.binary && isHeader("content-type")
        ? body.mediaType
        : inputValue(document, operation, parameter);
    if (parameter.location === "header") {
      groups.headers[parameter.wireName] = value;
      typescriptHeaders[parameter.name] = value;
    } else if (parameter.location === "path" || parameter.location === "query") {
      groups[parameter.location][parameter.wireName] = value;
    }
  }
  const inputs: Inputs = { groups, typescriptHeaders, ...(body ? { body } : {}) };
  checkInputs(document, operation, inputs);
  return inputs;
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
    const body = inputs.body.upload
      ? `new File([${JSON.stringify(inputs.body.value)}], ${JSON.stringify(FILE_NAME)}, { type: ${JSON.stringify(inputs.body.mediaType)} })`
      : inputs.body.binary ? `new Blob([${JSON.stringify(inputs.body.value)}], { type: ${JSON.stringify(inputs.body.mediaType)} })` : typescriptLiteral(inputs.body.value, "  ");
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
    const body = inputs.body.upload
      ? `UploadFile(data=b${JSON.stringify(inputs.body.value)}, content_type=${JSON.stringify(inputs.body.mediaType)}, filename=${JSON.stringify(FILE_NAME)})`
      : inputs.body.binary ? `b${JSON.stringify(inputs.body.value)}` : pythonLiteral(inputs.body.value, "        ");
    literal = literal === "{}" ? `{\n        "body": ${body},\n    }` : `${literal.slice(0, -5)}        "body": ${body},\n    }`;
  }
  const imports = inputs.body?.upload ? "from photon_api import Photon, UploadFile" : "from photon_api import Photon";
  const lines = scheme ? ["import os", "", imports] : [imports];
  if (literal) lines.push(`from photon_api.rpc_generated import ${typeName}`);
  lines.push("");
  lines.push(scheme ? 'photon = Photon(headers={"Authorization": f"Bearer {os.environ[\'PHOTON_API_TOKEN\']}"})' : "photon = Photon()");
  const call = literal ? `${callPath}(\n    ${typeName}.model_validate(${literal})\n)` : `${callPath}()`;
  lines.push(hasResult(operation) ? `result = ${call}` : call);
  return lines.join("\n");
}

function rustArgument(document: JsonObject, operation: ManifestOperation, inputs: Inputs, argument: RustArgument): string {
  if (/\bUploadFile\b/.test(argument.type)) {
    assert(inputs.body?.upload, `${operation.operationId}: Rust takes a file the contract does not upload`);
    return `&UploadFile::new(${JSON.stringify(inputs.body.value)}, ${JSON.stringify(inputs.body.mediaType)}).filename(${JSON.stringify(FILE_NAME)})`;
  }
  if (argument.name === "body") {
    assert(inputs.body, `${operation.operationId}: Rust takes a body the contract does not require`);
    if (inputs.body.binary) return `&${JSON.stringify(inputs.body.value)}.into()`;
    return `&serde_json::from_value(serde_json::json!(${rustJson(inputs.body.value, "        ")}))?`;
  }
  if (/^Option</.test(argument.type)) return "None";
  const parameter = operation.parameters.find((candidate) => snakeCase(candidate.name) === argument.name || snakeCase(candidate.wireName) === argument.name);
  assert(parameter, `${operation.operationId}: no contract parameter for Rust argument ${argument.name}`);
  const groups = { path: inputs.groups.path, query: inputs.groups.query, header: inputs.groups.headers } as Record<string, JsonObject>;
  const value = groups[parameter.location]?.[parameter.wireName] ?? inputValue(document, operation, parameter);
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
  const upload = inputs.body?.upload ? ", UploadFile" : "";
  const lines = scheme
    ? [
        `use photon_ai_api::{Credential, PhotonClientBuilder, SecretString${upload}};`,
        "",
        'let token = std::env::var("PHOTON_API_TOKEN")?;',
        "let client = PhotonClientBuilder::new()",
        `    .credential(${JSON.stringify(scheme)}, Credential::Bearer(SecretString::from(token)))`,
        "    .build()?;",
      ]
    : [upload ? `use photon_ai_api::{PhotonClientBuilder${upload}};` : "use photon_ai_api::PhotonClientBuilder;", "", "let client = PhotonClientBuilder::new().build()?;"];
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

export function goSample(document: JsonObject, operation: ManifestOperation, method: GoMethod): string {
  const inputs = operationInputs(document, operation);
  const scheme = credentialScheme(document, operation.operationId);
  const returnsResult = method.returns !== "error";
  const jsonBody = inputs.body && !inputs.body.binary;
  const stdlib = [
    "context",
    ...(jsonBody ? ["encoding/json"] : []),
    ...(scheme ? ["os"] : []),
    ...(inputs.body?.binary && !inputs.body.upload ? ["strings"] : []),
  ].sort();
  const lines = [
    "import (",
    ...stdlib.map((name) => `\t"${name}"`),
    "",
    '\tphotonapi "github.com/photon-hq/api/packages/go"',
    ")",
    "",
    "ctx := context.Background()",
    scheme
      ? 'client := photonapi.NewClient(photonapi.WithAPIKey(os.Getenv("PHOTON_API_TOKEN")))'
      : "client := photonapi.NewClient()",
  ];
  const sets: string[] = [];
  const groups = { path: inputs.groups.path, query: inputs.groups.query, header: inputs.groups.headers } as Record<string, JsonObject>;
  for (const field of method.fields) {
    if (field.optional) continue;
    const value = groups[field.location]?.[field.wireName];
    assert(value !== undefined, `${operation.operationId}: no required input for Go field ${field.name}`);
    assert(["string", "int64", "float64"].includes(field.type), `${operation.operationId}: Go field ${field.name} has unhandled type ${field.type}`);
    sets.push(`\t${field.name}: ${field.type === "string" ? JSON.stringify(value) : String(value)},`);
  }
  if (inputs.body) {
    assert(method.bodyType, `${operation.operationId}: Go takes no body the contract requires`);
    if (inputs.body.upload) {
      sets.push(`\tBody: &photonapi.UploadFile{Data: []byte(${JSON.stringify(inputs.body.value)}), ContentType: ${JSON.stringify(inputs.body.mediaType)}, Filename: ${JSON.stringify(FILE_NAME)}},`);
    } else if (inputs.body.binary) {
      sets.push(`\tBody: strings.NewReader(${JSON.stringify(inputs.body.value)}),`);
    } else {
      const literal = JSON.stringify(inputs.body.value, null, "\t");
      assert(!literal.includes("`"), `${operation.operationId}: body placeholder contains a backquote`);
      lines.push(
        `var body photonapi.${method.bodyType}`,
        `if err := json.Unmarshal([]byte(\`${literal}\`), &body); err != nil {`,
        "\treturn err",
        "}",
      );
      sets.push("\tBody: body,");
    }
  }
  const argument = method.params ? (sets.length ? `, &photonapi.${method.params}{\n${sets.join("\n")}\n}` : ", nil") : "";
  const call = `${method.path}(ctx${argument})`;
  lines.push(returnsResult ? `result, err := ${call}` : `err := ${call}`, "if err != nil {", "\treturn err", "}");
  // The result stays unprinted: some operations return one-time credentials,
  // and the TypeScript, Python and Rust samples do not print theirs either.
  if (returnsResult) lines.push("_ = result");
  return lines.join("\n");
}

export interface SampleSources {
  pythonClient: string;
  rustClient: string;
  goClient: string;
}

/** The contract with `x-codeSamples` on every operation the SDKs expose. */
export function withCodeSamples(document: JsonObject, manifest: RpcManifest, sources: SampleSources): JsonObject {
  const result = structuredClone(document);
  const python = pythonCallPaths(sources.pythonClient);
  const rust = rustSignatures(sources.rustClient);
  const go = goMethods(sources.goClient);
  const operations = new Map(manifest.operations.map((operation) => [operation.operationId, operation]));
  const failures: string[] = [];
  for (const item of Object.values(result.paths as JsonObject)) {
    if (!isObject(item)) continue;
    for (const operation of Object.values(item)) {
      if (!isObject(operation) || typeof operation.operationId !== "string") continue;
      const manifestOperation = operations.get(operation.operationId);
      assert(manifestOperation, `Operation ${operation.operationId} is not in the RPC manifest`);
      const pythonPath = python.get(pascalCase(operation.operationId));
      const rustSignature = rust.get(snakeCase(operation.operationId));
      const goMethod = go.get(`${manifestOperation.namespace.join(".")}.${pascalCase(manifestOperation.rpcMethod)}`);
      assert(pythonPath, `Python client has no method for ${operation.operationId}`);
      assert(rustSignature, `Rust client has no method for ${operation.operationId}`);
      assert(goMethod, `Go client has no method for ${operation.operationId}`);
      let samples: CodeSample[];
      try {
        samples = [
          { lang: "typescript", label: "TypeScript", source: typescriptSample(document, manifestOperation) },
          { lang: "python", label: "Python", source: pythonSample(document, manifestOperation, pythonPath) },
          { lang: "rust", label: "Rust", source: rustSample(document, manifestOperation, rustSignature) },
          { lang: "go", label: "Go", source: goSample(document, manifestOperation, goMethod) },
        ];
      } catch (error) {
        failures.push((error as Error).message);
        continue;
      }
      operation["x-codeSamples"] = samples as unknown as JsonValue;
    }
  }
  assert(failures.length === 0, `Code samples the contract rejects, in ${failures.length} of ${operations.size} operations:\n${failures.join("\n")}`);
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
    goClient: await readFile(resolve(root, "packages/go/operations_generated.go"), "utf8"),
  };
  const output = withCodeSamples(document, manifest, sources);
  await writeAtomic(resolve(root, MINTLIFY_CONTRACT_PATH), `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${MINTLIFY_CONTRACT_PATH} with code samples for ${manifest.operations.length} operations, each with inputs the contract accepts`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
