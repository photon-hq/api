import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import Handlebars from "handlebars";
import {
  isJsonMediaType,
  selectRequestMedia,
  selectResponseMedia,
  sdkRequestNote,
} from "./media-types.js";
import {
  assert,
  isObject,
  pascalCase,
  readJson,
  repositoryRoot,
  snakeCase,
  sdkPackages,
  writeAtomic,
  type JsonValue,
} from "./shared.js";
import {
  modelNameFromReference,
  successResponses,
  type ManifestSuccessResponse,
} from "./success-responses.js";

/**
 * datamodel-code-generator class name for a component: capitalize each
 * underscore-separated word, keeping the rest of the word unchanged (for
 * example `PhotonProblem_NOT_AUTHENTICATED_401` becomes
 * `PhotonProblemNOTAUTHENTICATED401`; `__schema0` becomes `FieldSchema0`, as the
 * generator prefixes names that do not start with a letter). Operation-hoisted names are already in
 * this form and are returned unchanged.
 */
export function pythonModelName(component: string): string {
  // Like the generator, a name that does not start with a letter gets a
  // `field` word first (`__schema0` becomes `FieldSchema0`).
  return (/^[A-Za-z]/.test(component) ? component : `field_${component}`)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => `${word[0]!.toUpperCase()}${word.slice(1)}`)
    .join("");
}

function pythonModel(response: ManifestSuccessResponse): string | undefined {
  return response.model === undefined ? undefined : pythonModelName(response.model);
}

/**
 * The TypeScript facade names each success response's component schema
 * directly. hey-api keeps contract component names exactly (`case: "preserve"`
 * in tools/openapi-generator/openapi-ts.config.ts), so the validator is
 * `z<Component>` for any component name that is an identifier.
 */
function typescriptModelName(component: string): string {
  if (!/^[A-Za-z_$][\w$]*$/.test(component)) {
    throw new Error(
      `TypeScript facade cannot name response component ${component}; extend typescriptModelName`,
    );
  }
  return component;
}

interface ManifestParameter {
  name: string;
  wireName: string;
  location: string;
  required: boolean;
  schema?: JsonValue;
}

export interface ManifestOperation {
  operationId: string;
  summary?: string;
  description?: string;
  rpcMethod: string;
  namespace: string[];
  httpMethod: string;
  path: string;
  safe: boolean;
  idempotencyKeyRequired: boolean;
  parameters: ManifestParameter[];
  requestBody?: {
    required: boolean;
    content: Record<string, unknown>;
  };
  responses: Record<string, Record<string, string | JsonValue>>;
}

export interface RpcManifest {
  operations: ManifestOperation[];
}

interface TreeNode {
  children: Map<string, TreeNode>;
  operations: ManifestOperation[];
}

const GENERATED_HEADER =
  "// This file is generated from openapi/rpc-manifest.json. Do not edit.\n";
const PYTHON_GENERATED_HEADER =
  "# This file is generated from openapi/rpc-manifest.json. Do not edit.\n";

function schemaField(
  name: string,
  schema: string,
  required: boolean,
): string {
  return `    ${name}: ${schema}${required ? "" : ".optional()"},`;
}

function typescriptPropertyName(name: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)
    ? name
    : JSON.stringify(name);
}

export function operationSchema(operation: ManifestOperation): string {
  const typeName = pascalCase(operation.operationId);
  // One schema per documented success status, so a response is validated
  // against the body declared for the status it arrived with.
  const statusSchemas = operationSuccessResponses(operation).map((response): [string, string] => [
    response.status,
    response.binary
      ? "z.instanceof(Blob)"
      : response.model
        ? `GeneratedZod.z${typescriptModelName(response.model)}`
        : "z.undefined()",
  ]);
  const variants = [...new Set(statusSchemas.map(([, schema]) => schema))];
  const outputSchema = variants.length === 0
    ? "z.unknown()"
    : variants.length === 1
      ? variants[0]!
      : `/* @__PURE__ */ (() => z.union([${variants.join(", ")}]))()`;
  const outputSchemas = `{\n${statusSchemas.map(([status, schema]) => `    ${JSON.stringify(status)}: ${schema},`).join("\n")}\n}`;
  const fields: string[] = [];
  if (operation.requestBody) {
    fields.push(
      schemaField(
        "body",
        `GeneratedZod.z${typeName}Body`,
        operation.requestBody.required,
      ),
    );
  }
  for (const location of ["path", "query"] as const) {
    const parameters = operation.parameters.filter(
      (parameter) => parameter.location === location,
    );
    if (parameters.length > 0) {
      fields.push(
        schemaField(
          location,
          `GeneratedZod.z${typeName}${pascalCase(location)}.strict()`,
          parameters.some((parameter) => parameter.required),
        ),
      );
    }
  }
  const headerParameters = operation.parameters.filter(
    (parameter) => parameter.location === "header",
  );
  if (headerParameters.length > 0) {
    // Reuse the generated contract schema for each header so the facade
    // enforces exactly its declared constraints and required-ness.
    const properties = headerParameters
      .map(
        (parameter) =>
          `        ${typescriptPropertyName(parameter.name)}: GeneratedZod.z${typeName}Headers.shape[${JSON.stringify(parameter.wireName)}],`,
      )
      .join("\n");
    const required = headerParameters.some((parameter) => parameter.required);
    fields.push(
      `    headers: z.strictObject({\n${properties}\n    })${required ? "" : ".optional()"},`,
    );
  }
  // The input type comes from the generated request types (exact: an unknown
  // key or a wrong shape fails type-checking); the Zod schemas are loose for
  // responses. The input schema is not applied at runtime (gate B checks it).
  const data = `WireTypes.${typeName}Data`;
  const members: string[] = [];
  if (operation.requestBody) {
    members.push(operation.requestBody.required
      ? `    body: ${data}["body"];`
      : `    body?: NonNullable<${data}["body"]>;`);
  }
  for (const location of ["path", "query"] as const) {
    const parameters = operation.parameters.filter((parameter) => parameter.location === location);
    if (parameters.length > 0) {
      members.push(parameters.some((parameter) => parameter.required)
        ? `    ${location}: NonNullable<${data}["${location}"]>;`
        : `    ${location}?: NonNullable<${data}["${location}"]>;`);
    }
  }
  if (headerParameters.length > 0) {
    const headers = headerParameters
      .map((parameter) =>
        `        ${typescriptPropertyName(parameter.name)}${parameter.required ? "" : "?"}: NonNullable<${data}["headers"]>[${JSON.stringify(parameter.wireName)}];`)
      .join("\n");
    const required = headerParameters.some((parameter) => parameter.required);
    members.push(`    headers${required ? "" : "?"}: {\n${headers}\n    };`);
  }
  const inputType = members.length ? `{\n${members.join("\n")}\n}` : "Record<string, never>";
  return `export const ${typeName}InputSchema = /* @__PURE__ */ (() => z.strictObject({\n${fields.join("\n")}\n}))();\nexport type ${typeName}Input = ${inputType};\n\nexport const ${typeName}OutputSchema = ${outputSchema === "z.unknown()" ? "/* @__PURE__ */ z.unknown()" : outputSchema};\nexport type ${typeName}Output = z.output<typeof ${typeName}OutputSchema>;\nexport const ${typeName}OutputSchemas: OutputSchemas<${typeName}Output> = /* @__PURE__ */ (() => (${outputSchemas}))();`;
}

function makeTree(operations: ManifestOperation[]): TreeNode {
  const root: TreeNode = { children: new Map(), operations: [] };
  for (const operation of operations) {
    let node = root;
    for (const segment of operation.namespace) {
      let child = node.children.get(segment);
      if (!child) {
        child = { children: new Map(), operations: [] };
        node.children.set(segment, child);
      }
      node = child;
    }
    node.operations.push(operation);
  }
  return root;
}

function operationDocumentation(operation: ManifestOperation): string {
  const paragraphs = [operation.summary, operation.description]
    .filter((text): text is string =>
      typeof text === "string" && text.trim().length > 0,
    )
    .map((text) => text.trim());
  const note = sdkRequestNote(operation.requestBody?.content);
  return [...new Set([...paragraphs, ...(note ? [note] : [])])].join("\n\n");
}

function typescriptDocumentation(
  operation: ManifestOperation,
  pad: string,
): string {
  const text = operationDocumentation(operation);
  if (!text) return "";
  // Contract prose must not terminate the generated source comment.
  const lines = text.replaceAll("*/", "*\\/").split(/\r\n|[\n\r\u2028\u2029]/u);
  const body = lines.map((line) => `${pad} * ${line}`.trimEnd()).join("\n");
  return `${pad}/**\n${body}\n${pad} */\n`;
}

function pythonDocumentation(operation: ManifestOperation): string {
  const text = operationDocumentation(operation);
  if (!text) return "";
  // A quoted string is a Python docstring. Escape source delimiters while
  // preserving authored Markdown, whitespace and backslashes exactly.
  return `        ${JSON.stringify(text)}\n`;
}

function renderNode(node: TreeNode, mode: "data" | "raw", indent = 0): string {
  const pad = " ".repeat(indent);
  const entries: string[] = [];
  for (const [name, child] of [...node.children].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    entries.push(
      `${pad}${name}: {\n${renderNode(child, mode, indent + 4)}\n${pad}},`,
    );
  }
  for (const operation of node.operations.sort((a, b) =>
    a.rpcMethod.localeCompare(b.rpcMethod),
  )) {
    const typeName = pascalCase(operation.operationId);
    const required =
      operation.requestBody?.required === true ||
      operation.parameters.some((parameter) => parameter.required);
    const input = required
      ? `input: Schemas.${typeName}Input`
      : `input: Schemas.${typeName}Input = {}`;
    entries.push(
      typescriptDocumentation(operation, pad) +
      `${pad}${operation.rpcMethod}: (${input}, options?: RequestOptions) => invokers.${mode}<Schemas.${typeName}Input, Schemas.${typeName}Output>(\n` +
        `${pad}    "${operation.operationId}",\n` +
        `${pad}    Sdk.${operation.operationId},\n` +
        `${pad}    Schemas.${typeName}OutputSchemas,\n` +
        `${pad}    input,\n` +
        `${pad}    options,\n` +
        `${pad}),`,
    );
  }
  return entries.join("\n");
}

/** A JSON scalar as a Python literal (JSON's true/false/null spelled for Python). */
function pythonLiteral(value: JsonValue): string {
  if (value === true) return "True";
  if (value === false) return "False";
  if (value === null) return "None";
  return JSON.stringify(value);
}

/**
 * A parameter's Python type: types only, as the generated models
 * (tools/python-codegen/sdk_types.py). Validation-only keywords are left to
 * the service, and an enum with several values is open (`Literal[...] | str`).
 */
function pythonType(schema: JsonValue | undefined): string {
  if (!isObject(schema)) {
    return "Any";
  }
  const literal = (values: JsonValue[]): string => `Literal[${values.map(pythonLiteral).join(", ")}]`;
  if (schema.const !== undefined) {
    return literal([schema.const]);
  }
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    const known = schema.enum.filter((value) => value !== null);
    const nullable = known.length < schema.enum.length ? " | None" : "";
    if (known.length > 1 && known.every((value) => typeof value === "string")) return `${literal(known)} | str${nullable}`;
    if (known.length > 1 && known.every((value) => typeof value === "number")) {
      return `${literal(known)} | ${known.every((value) => Number.isInteger(value)) ? "int" : "float"}${nullable}`;
    }
    return literal(schema.enum);
  }
  if (Array.isArray(schema.anyOf)) {
    const variants = schema.anyOf.map((value) => pythonType(value));
    return [...new Set(variants)].join(" | ");
  }
  if (Array.isArray(schema.oneOf)) {
    const variants = schema.oneOf.map((value) => pythonType(value));
    return [...new Set(variants)].join(" | ");
  }
  if (schema.type === "null") {
    return "None";
  }
  if (schema.type === "string") {
    return "str";
  }
  if (schema.type === "integer") {
    return "int";
  }
  if (schema.type === "number") {
    return "float";
  }
  if (schema.type === "boolean") {
    return "bool";
  }
  if (schema.type === "array") {
    return `list[${pythonType(schema.items)}]`;
  }
  if (schema.type === "object") {
    return "dict[str, Any]";
  }
  return "Any";
}

const PYTHON_RESERVED_WORDS = new Set([
  "False",
  "None",
  "True",
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
]);

function pythonIdentifier(value: string, fallback: string): string {
  // PEP 8: resources, methods and fields are snake_case attributes.
  let identifier = snakeCase(value);
  if (!identifier) {
    identifier = fallback;
  }
  if (/^[0-9]/.test(identifier)) {
    identifier = `${fallback}_${identifier}`;
  }
  if (PYTHON_RESERVED_WORDS.has(identifier)) {
    identifier += "_";
  }
  return identifier;
}

function allocatePythonIdentifier(
  value: string,
  used: Set<string>,
  fallback: string,
): string {
  let identifier = pythonIdentifier(value, fallback);
  while (used.has(identifier)) {
    identifier += "_";
  }
  used.add(identifier);
  return identifier;
}

function pythonField(
  identifier: string,
  wireName: string,
  type: string,
  required: boolean,
  indent = "    ",
): string {
  // No contract parameter is nullable: omission uses MISSING so None is rejected.
  const options = required ? [] : ["default=MISSING"];
  options.push(`alias=${JSON.stringify(wireName)}`);
  return `${indent}${identifier}: ${type}${required ? "" : " | MISSING"} = Field(${options.join(", ")})`;
}

const PYTHON_ANNOTATION_KEYWORDS = new Set(["description", "title", "example", "examples", "deprecated"]);

/**
 * A parameter whose schema is a component reference (a named enum, for
 * example) is typed as that generated model.
 */
function pythonParameterModel(schema: JsonValue | undefined): string | undefined {
  if (!isObject(schema) || schema.$ref === undefined) return undefined;
  const component = modelNameFromReference(schema.$ref);
  const extra = Object.keys(schema).filter((keyword) => keyword !== "$ref" && !PYTHON_ANNOTATION_KEYWORDS.has(keyword));
  if (component === undefined || extra.length > 0) {
    throw new Error(`Unsupported parameter schema reference for the Python facade: ${JSON.stringify(schema)}`);
  }
  return `models.${pythonModelName(component)}`;
}

function pythonGroupClass(
  operation: ManifestOperation,
  location: string,
): string | undefined {
  const parameters = operation.parameters.filter(
    (parameter) => parameter.location === location,
  );
  if (parameters.length === 0) {
    return undefined;
  }
  const className = `${pascalCase(operation.operationId)}${pascalCase(location)}`;
  const identifiers = new Set(["model_config"]);
  const fields = parameters
    .map((parameter) => {
      const model = pythonParameterModel(parameter.schema);
      return pythonField(
        allocatePythonIdentifier(parameter.name, identifiers, "field"),
        parameter.wireName,
        model ?? pythonType(parameter.schema),
        parameter.required,
      );
    })
    .join("\n");
  return `class ${className}(BaseModel):\n    model_config = ConfigDict(extra="forbid", populate_by_name=True)\n\n${fields}\n`;
}

function operationSuccessResponses(
  operation: ManifestOperation,
): ManifestSuccessResponse[] {
  return successResponses(operation.operationId, operation.responses);
}

function pythonSuccessType(operation: ManifestOperation): string {
  const variants = operationSuccessResponses(operation).map((response) =>
    response.binary ? "bytes" : response.model ? `models.${pythonModel(response)}` : "None",
  );
  return [...new Set(variants)].join(" | ") || "None";
}

function pythonSuccessAdapters(operation: ManifestOperation): string {
  const entries = operationSuccessResponses(operation).map(
    (response) =>
      `        ${JSON.stringify(response.status)}: ${response.binary ? "bytes" : response.model ? `TypeAdapter(models.${pythonModel(response)})` : "None"},`,
  );
  return `    success_responses={\n${entries.join("\n")}\n    },\n`;
}

function pythonInputClasses(operation: ManifestOperation): string {
  const typeName = pascalCase(operation.operationId);
  const groups = ["path", "query", "header"]
    .map((location) => pythonGroupClass(operation, location))
    .filter((value): value is string => Boolean(value));
  const fields: string[] = [];
  if (operation.requestBody) {
    const bodyReference = selectRequestMedia(
      operation.requestBody.content,
      `${operation.operationId} request`,
    )?.value;
    const bodyComponent = modelNameFromReference(bodyReference);
    const bodyModel = bodyComponent === undefined ? undefined : pythonModelName(bodyComponent);
    fields.push(
      `    body: models.${bodyModel ?? "RootModel[Any]"}${operation.requestBody.required ? "" : " | None = None"}`,
    );
  }
  for (const location of ["path", "query", "header"] as const) {
    const parameters = operation.parameters.filter(
      (parameter) => parameter.location === location,
    );
    if (parameters.length === 0) {
      continue;
    }
    const publicName = location === "header" ? "headers" : location;
    const groupType = `${typeName}${pascalCase(location)}`;
    const required = parameters.some((parameter) => parameter.required);
    fields.push(
      `    ${publicName}: ${groupType}${required ? "" : " | None = None"}`,
    );
  }
  return `${groups.join("\n")}\nclass ${typeName}Input(BaseModel):\n    model_config = ConfigDict(extra="forbid", populate_by_name=True)\n${fields.length ? `\n${fields.join("\n")}` : ""}\n`;
}

function pythonOperationConstant(operation: ManifestOperation): string {
  const media = operationMedia(operation);
  return (
    `_OP_${snakeCase(operation.operationId).toUpperCase()} = OperationSpec(\n` +
    `    operation_id=${JSON.stringify(operation.operationId)},\n` +
    `    method=${JSON.stringify(operation.httpMethod)},\n` +
    `    path=${JSON.stringify(operation.path)},\n` +
    `    safe=${operation.safe ? "True" : "False"},\n` +
    `    idempotency_key_required=${operation.idempotencyKeyRequired ? "True" : "False"},\n` +
    (media.request
      ? `    request_media_type=${JSON.stringify(media.request)},\n`
      : "") +
    (media.rawRequest ? "    raw_request=True,\n" : "") +
    (media.accept.length
      ? `    accept_media_types=(${media.accept.map((value) => `${JSON.stringify(value)},`).join(" ")}),\n`
      : "") +
    pythonSuccessAdapters(operation) +
    `)`
  );
}

function pythonMethod(
  operation: ManifestOperation,
  asynchronous: boolean,
  methodName: string,
): string {
  const typeName = pascalCase(operation.operationId);
  const required =
    operation.requestBody?.required === true ||
    operation.parameters.some((parameter) => parameter.required);
  const input = required
    ? `input: ${typeName}Input`
    : `input: ${typeName}Input | None = None`;
  const parsedInput = required ? "input" : `(input or ${typeName}Input())`;
  const outputType = pythonSuccessType(operation);
  const awaitPrefix = asynchronous ? "await " : "";
  const asyncPrefix = asynchronous ? "async " : "";
  const rawRequest = operationMedia(operation).rawRequest;
  return `    ${asyncPrefix}def ${methodName}(self, ${input}) -> ${outputType} | RawResponse[${outputType}]:\n` +
    pythonDocumentation(operation) +
    `        payload = ${parsedInput}.model_dump(mode="json", by_alias=True, exclude_unset=True${rawRequest ? ', exclude={"body"}' : ""})\n` +
    (rawRequest ? `        payload["body"] = ${parsedInput}.body.root if ${parsedInput}.body is not None else None\n` : "") +
    `        response = ${awaitPrefix}self._transport.request(\n` +
    `            _OP_${snakeCase(operation.operationId).toUpperCase()}, payload\n` +
    `        )\n` +
    `        return response if self._raw else response.data\n`;
}

function allNodes(
  root: TreeNode,
  path: string[] = [],
  result: Array<{ node: TreeNode; path: string[] }> = [],
): Array<{ node: TreeNode; path: string[] }> {
  for (const [name, child] of root.children) {
    allNodes(child, [...path, name], result);
  }
  if (path.length > 0) {
    result.push({ node: root, path });
  }
  return result;
}

function pythonResourceClass(
  node: TreeNode,
  path: string[],
  asynchronous: boolean,
): string {
  const prefix = asynchronous ? "Async" : "Sync";
  const className = `${prefix}${path.map(pascalCase).join("")}Resource`;
  const transportType = asynchronous ? "AsyncTransport" : "SyncTransport";
  const lines = [
    `class ${className}:`,
    `    def __init__(self, transport: ${transportType}, raw: bool = False) -> None:`,
    "        self._transport = transport",
    "        self._raw = raw",
  ];
  const memberNames = new Set(["__init__", "_raw", "_transport"]);
  for (const [name] of [...node.children].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const childClass = `${prefix}${[...path, name].map(pascalCase).join("")}Resource`;
    const memberName = allocatePythonIdentifier(name, memberNames, "resource");
    lines.push(`        self.${memberName} = ${childClass}(transport, raw)`);
  }
  for (const operation of node.operations.sort((a, b) =>
    a.rpcMethod.localeCompare(b.rpcMethod),
  )) {
    const methodName = allocatePythonIdentifier(
      operation.rpcMethod,
      memberNames,
      "operation",
    );
    lines.push(
      "",
      pythonMethod(operation, asynchronous, methodName).trimEnd(),
    );
  }
  return `${lines.join("\n")}\n`;
}

function pythonRoot(root: TreeNode, asynchronous: boolean): string {
  const prefix = asynchronous ? "Async" : "Sync";
  const transportType = asynchronous ? "AsyncTransport" : "SyncTransport";
  const lines = [
    `class ${prefix}Root:`,
    `    def __init__(self, transport: ${transportType}, raw: bool = False) -> None:`,
  ];
  const memberNames = new Set(["__init__"]);
  for (const [name] of [...root.children].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const memberName = allocatePythonIdentifier(name, memberNames, "resource");
    lines.push(
      `        self.${memberName} = ${prefix}${pascalCase(name)}Resource(transport, raw)`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function renderPython(manifest: RpcManifest): string {
  const operations = [...manifest.operations].sort((a, b) =>
    a.operationId.localeCompare(b.operationId),
  );
  const tree = makeTree(operations);
  const nodes = allNodes(tree);
  const imports = `from __future__ import annotations

from typing import Any, Literal

from pydantic import ConfigDict, Field, TypeAdapter
from pydantic.experimental.missing_sentinel import MISSING
from ._model_base import BaseModel

from .generated import models
from .transport import AsyncTransport, OperationSpec, RawResponse, SyncTransport
`;
  const inputClasses = operations.map(pythonInputClasses).join("\n");
  const constants = operations.map(pythonOperationConstant).join("\n\n");
  const syncClasses = nodes
    .map(({ node, path }) => pythonResourceClass(node, path, false))
    .join("\n");
  const asyncClasses = nodes
    .map(({ node, path }) => pythonResourceClass(node, path, true))
    .join("\n");
  return (
    PYTHON_GENERATED_HEADER +
    imports +
    "\n" +
    inputClasses +
    "\n" +
    constants +
    "\n\n" +
    syncClasses +
    "\n" +
    asyncClasses +
    "\n" +
    pythonRoot(tree, false) +
    "\n" +
    pythonRoot(tree, true)
  );
}

export type ResponseKind = "binary" | "json" | "empty";

export interface OperationMedia {
  request?: string;
  rawRequest?: true;
  /** Selected success media types, one per documented success status. */
  responses: string[];
  /** Accept header values: the selected success types, then every declared error type. */
  accept: string[];
  /** How each documented success status is decoded, independent of Content-Type. */
  responseKinds: Record<string, ResponseKind>;
}

export function operationMedia(operation: ManifestOperation): OperationMedia {
  const request =
    operation.requestBody &&
    selectRequestMedia(
      operation.requestBody.content,
      `${operation.operationId} request`,
    );
  const responses = Object.entries(operation.responses)
    .filter(([status]) => /^2(?:\d\d|xx)$/i.test(status))
    .flatMap(([status, content]) => {
      const selected = selectResponseMedia(
        content,
        `${operation.operationId} response ${status}`,
      );
      return selected ? [selected.mediaType] : [];
    });
  const success = [...new Set(responses)].sort();
  const errors = Object.entries(operation.responses)
    .filter(([status]) => !/^2(?:\d\d|xx)$/i.test(status))
    .flatMap(([, content]) => Object.keys(content));
  return {
    ...(request && isJsonMediaType(request.mediaType)
      ? { request: request.mediaType }
      : {}),
    ...(request && !isJsonMediaType(request.mediaType) ? { rawRequest: true as const } : {}),
    responses: success,
    accept: [...new Set([...success, ...[...new Set(errors)].sort()])],
    responseKinds: Object.fromEntries(
      operationSuccessResponses(operation).map((response): [string, ResponseKind] => [
        response.status,
        response.binary ? "binary" : response.model ? "json" : "empty",
      ]),
    ),
  };
}

const schemaTemplate = Handlebars.compile(`{{header}}
import * as z from "zod";
import * as GeneratedZod from "./generated/zod.gen.js";
import type * as WireTypes from "./generated/types.gen.js";

/** Response schema for each documented success status (\`2XX\` for a range). */
type OutputSchemas<Output> = Readonly<Record<string, z.ZodType<Output>>>;

{{{schemas}}}
`);

const rpcTemplate = Handlebars.compile(`{{header}}
import type { ZodType } from "zod";
import * as Sdk from "./generated/sdk.gen.js";
import * as Schemas from "./schemas.js";

export const operationMediaTypes: Record<string, { request?: string; rawRequest?: true; responses: string[]; accept: string[]; responseKinds: Record<string, "binary" | "json" | "empty"> }> = {{{mediaTypes}}};

export interface RequestOptions {
  signal?: AbortSignal;
  headers?: HeadersInit;
}

export interface RawResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
}

export type SdkFunction = (options: any) => any;

// Response schema for each documented success status (\`2XX\` for a range).
export type OutputSchemas<Output> = Readonly<Record<string, ZodType<Output>>>;

export interface RpcInvokers {
  data<Input, Output>(
    operationId: string,
    sdkFunction: SdkFunction,
    outputSchemas: OutputSchemas<Output>,
    input: Input | undefined,
    options: RequestOptions | undefined,
  ): Promise<Output>;
  raw<Input, Output>(
    operationId: string,
    sdkFunction: SdkFunction,
    outputSchemas: OutputSchemas<Output>,
    input: Input | undefined,
    options: RequestOptions | undefined,
  ): Promise<RawResponse<Output>>;
}

export function createRpcNamespaces(invokers: RpcInvokers) {
  const data = {
{{{dataTree}}}
  };
  const raw = {
{{{rawTree}}}
  };
  return { data, raw };
}

export type PhotonNamespaces = ReturnType<typeof createRpcNamespaces>["data"];
export type PhotonRawNamespaces = ReturnType<typeof createRpcNamespaces>["raw"];
`);

export function renderTypeScript(manifest: RpcManifest): string {
  const operations = [...manifest.operations].sort((a, b) =>
    a.operationId.localeCompare(b.operationId),
  );
  const tree = makeTree(operations);
  return rpcTemplate({
    header: GENERATED_HEADER.trimEnd(),
    dataTree: renderNode(tree, "data", 4),
    rawTree: renderNode(tree, "raw", 4),
    mediaTypes: JSON.stringify(
      Object.fromEntries(
        operations.map((operation) => [
          operation.operationId,
          operationMedia(operation),
        ]),
      ),
      null,
      2,
    ),
  });
}

/**
 * Façades to write: every language package present, or with `--only` just one
 * of them, so one package regenerates without rewriting another's files.
 */
export function facadeLanguages(
  present: { typescript: boolean; python: boolean },
  only?: string,
): { typescript: boolean; python: boolean } {
  if (only === undefined) return { typescript: present.typescript, python: present.python };
  assert(only === "typescript" || only === "python", `--only must be typescript or python, not ${only}`);
  assert(present[only], `packages/${only} is not present`);
  return { typescript: only === "typescript", python: only === "python" };
}

async function main(): Promise<void> {
  const { values } = parseArgs({ options: { only: { type: "string" } } });
  const manifest = await readJson<RpcManifest>(
    resolve(repositoryRoot, "openapi/rpc-manifest.json"),
  );
  const operations = [...manifest.operations].sort((a, b) =>
    a.operationId.localeCompare(b.operationId),
  );
  const present = facadeLanguages(sdkPackages(), values.only);
  if (present.typescript) {
    const schemas = operations.map(operationSchema).join("\n\n");
    const outputRoot = resolve(repositoryRoot, "packages/typescript/src");
    await writeAtomic(
      resolve(outputRoot, "schemas.ts"),
      schemaTemplate({ header: GENERATED_HEADER.trimEnd(), schemas }),
    );
    await writeAtomic(
      resolve(outputRoot, "rpc.generated.ts"),
      renderTypeScript(manifest),
    );
    console.log(
      `Generated TypeScript RPC façade for ${operations.length} operations`,
    );
  }
  if (present.python) {
    await writeAtomic(
      resolve(repositoryRoot, "packages/python/src/photon_api/rpc_generated.py"),
      renderPython(manifest),
    );
    console.log(
      `Generated Python RPC façade for ${operations.length} operations`,
    );
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
