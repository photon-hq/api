// SDK reference pages for the documentation site's API Client tab, in the style
// of Cloudflare's: one page per SDK method, and per resource (SDK namespace) a
// page that lists its methods and the models they return, which opens from the
// resource's sidebar group. Every page shows the TypeScript, Python and Rust
// form of a call in synced tabs.
//
// Reads the public contract with its code samples (openapi/openapi.mintlify.json),
// the RPC manifest and the generated clients, so a signature is always the one
// the released package has. Writes docs/sdk/**/*.mdx.vel and the "SDK reference"
// group of docs/nav.json; the guide's groups in that file are kept.
import { mkdir, readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { MINTLIFY_CONTRACT_PATH, pythonMethods, rustMethods, type CodeSample } from "./code-samples.js";
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

export const SDK_REFERENCE_DIR = "docs/sdk";
export const NAV_PATH = "docs/nav.json";
const MOUNT = "api-client";
const GROUP = "SDK reference";
const LANGUAGES = [
  { label: "TypeScript", lang: "typescript" },
  { label: "Python", lang: "python" },
  { label: "Rust", lang: "rust" },
] as const;
type Language = (typeof LANGUAGES)[number]["lang"];

// Sidebar icons (Lucide): reads point in, writes point out, edits and removals have their own mark.
const ICONS: Record<string, string> = { GET: "arrow-down-left", POST: "arrow-up-right", PUT: "pencil", PATCH: "pencil", DELETE: "x" };
const METHOD_ORDER: Record<string, number> = { GET: 0, POST: 1, PUT: 2, PATCH: 2, DELETE: 3 };
// Namespace words whose capitalisation is a product name.
const PRODUCT_WORDS: Record<string, string> = { imessage: "iMessage", whatsapp: "WhatsApp", sms: "SMS", oauth: "OAuth", sso: "SSO" };

export interface SdkSources {
  typescriptClient: string;
  pythonClient: string;
  rustClient: string;
}

export interface Method {
  operation: ManifestOperation;
  slug: string;
  summary: string;
  signatures: Record<Language, string>;
  samples: Record<Language, string>;
}

/** A resource: one SDK namespace, its methods and its sub-resources. */
export interface Resource {
  namespace: string[];
  title: string;
  slug: string;
  methods: Method[];
  children: Resource[];
}

const kebab = (value: string) => snakeCase(value).replace(/_/g, "-");

export function resourceTitle(segment: string): string {
  const words = snakeCase(segment).split("_").map((word) => PRODUCT_WORDS[word] ?? word);
  const [first = "", ...rest] = words;
  return [first === first.toLowerCase() ? `${first[0]?.toUpperCase() ?? ""}${first.slice(1)}` : first, ...rest].join(" ");
}

/** TypeScript signature of each operation, read from the generated client (packages/typescript/src/rpc.generated.ts). */
export function typescriptSignatures(source: string, manifest: RpcManifest): Map<string, string> {
  const signatures = new Map<string, string>();
  for (const match of source.matchAll(
    /(\w+): \(input: Schemas\.(\w+)( = \{\})?, options\?: RequestOptions\) => invokers\.data<Schemas\.\w+, Schemas\.(\w+)>\(\s*"(\w+)"/g,
  )) {
    const [, name, input, optional, output, operationId] = match;
    const operation = manifest.operations.find((candidate) => candidate.operationId === operationId);
    assert(operation, `TypeScript client method ${operationId} is not in the RPC manifest`);
    assert(name === operation.rpcMethod, `TypeScript client names ${operationId} ${name}, not ${operation.rpcMethod}`);
    const parameter = optional ? `input?: ${input}` : `input: ${input}`;
    signatures.set(operationId!, `photon.${[...operation.namespace, name].join(".")}(${parameter}, options?: RequestOptions): Promise<${output}>`);
  }
  return signatures;
}

/** The resource tree, with each method's signatures and samples in every language. */
export function resources(document: JsonObject, manifest: RpcManifest, sources: SdkSources): Resource[] {
  const typescript = typescriptSignatures(sources.typescriptClient, manifest);
  const python = pythonMethods(sources.pythonClient);
  const rust = rustMethods(sources.rustClient);
  const contract = operationsById(document);
  const roots: Resource[] = [];
  const nodeFor = (namespace: string[]): Resource => {
    let siblings = roots;
    let node: Resource | undefined;
    for (let depth = 1; depth <= namespace.length; depth += 1) {
      const path = namespace.slice(0, depth);
      node = siblings.find((candidate) => candidate.namespace.join(".") === path.join("."));
      if (!node) {
        node = { namespace: path, title: resourceTitle(path.at(-1)!), slug: path.map(kebab).join("/"), methods: [], children: [] };
        siblings.push(node);
      }
      siblings = node.children;
    }
    assert(node, "Every operation has a namespace");
    return node;
  };
  for (const operation of manifest.operations) {
    const source = contract.get(operation.operationId);
    assert(source, `Operation ${operation.operationId} is not in ${MINTLIFY_CONTRACT_PATH}`);
    const pythonMethod = python.get(pascalCase(operation.operationId));
    const rustMethod = rust.get(snakeCase(operation.operationId));
    const typescriptSignature = typescript.get(operation.operationId);
    assert(typescriptSignature, `TypeScript client has no method for ${operation.operationId}`);
    assert(pythonMethod, `Python client has no method for ${operation.operationId}`);
    assert(rustMethod, `Rust client has no method for ${operation.operationId}`);
    const samples = Object.fromEntries(((source["x-codeSamples"] ?? []) as unknown as CodeSample[]).map((sample) => [sample.lang, sample.source]));
    for (const { lang } of LANGUAGES) assert(samples[lang], `${operation.operationId} has no ${lang} code sample`);
    const rustArguments = rustMethod.arguments.map((argument) => `${argument.name}: ${argument.type}`).join(", ");
    nodeFor(operation.namespace).methods.push({
      operation,
      slug: kebab(operation.rpcMethod),
      summary: typeof source.summary === "string" ? source.summary : operation.operationId,
      signatures: {
        typescript: typescriptSignature,
        python: `${pythonMethod.path}(${pythonMethod.parameter}) -> ${pythonMethod.returns}`,
        rust: `client.${snakeCase(operation.operationId)}(${rustArguments}).await -> ${rustMethod.returns}`,
      },
      samples: samples as Record<Language, string>,
    });
  }
  const order = (node: Resource) => {
    node.methods.sort((a, b) =>
      METHOD_ORDER[a.operation.httpMethod]! - METHOD_ORDER[b.operation.httpMethod]! ||
      Number(!a.operation.rpcMethod.startsWith("list")) - Number(!b.operation.rpcMethod.startsWith("list")) ||
      a.operation.rpcMethod.localeCompare(b.operation.rpcMethod));
    node.children.sort((a, b) => a.title.localeCompare(b.title));
    node.children.forEach(order);
  };
  roots.sort((a, b) => a.title.localeCompare(b.title));
  roots.forEach(order);
  return roots;
}

function operationsById(document: JsonObject): Map<string, JsonObject> {
  const operations = new Map<string, JsonObject>();
  for (const item of Object.values(document.paths as JsonObject)) {
    if (!isObject(item)) continue;
    for (const operation of Object.values(item)) {
      if (isObject(operation) && typeof operation.operationId === "string") operations.set(operation.operationId, operation);
    }
  }
  return operations;
}

// Rendering. Prose is escaped for MDX; the site renders .mdx.vel with Nunjucks, so
// no page may contain its delimiters.

function prose(value: unknown): string {
  return typeof value === "string" ? value.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;").replace(/</g, "&lt;").trim() : "";
}

function component(document: JsonObject, schema: JsonValue | undefined): JsonObject {
  let current = schema;
  while (isObject(current) && typeof current.$ref === "string") {
    current = (document.components as JsonObject & { schemas: JsonObject }).schemas[current.$ref.split("/").at(-1)!];
  }
  return isObject(current) ? current : {};
}

/** A short, readable type: component names, unions, arrays and formats; never a pattern. */
export function typeLabel(document: JsonObject, schema: JsonValue | undefined): string {
  if (!isObject(schema)) return "any";
  if (typeof schema.$ref === "string") {
    const name = schema.$ref.split("/").at(-1)!;
    const target = component(document, schema);
    const scalar = ["string", "integer", "number", "boolean"].includes(target.type as string) && !("enum" in target);
    return scalar ? typeLabel(document, target) : name;
  }
  for (const key of ["anyOf", "oneOf"]) {
    if (Array.isArray(schema[key])) return [...new Set((schema[key] as JsonValue[]).map((member) => typeLabel(document, member)))].join(" | ");
  }
  if (Array.isArray(schema.type)) return schema.type.map((type) => typeLabel(document, { ...schema, type })).join(" | ");
  if ("const" in schema) return JSON.stringify(schema.const);
  if (Array.isArray(schema.enum)) return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  if (schema.type === "array") return `array of ${typeLabel(document, schema.items)}`;
  if (schema.type === "string" && typeof schema.format === "string" && schema.format !== "binary") return `string (${schema.format})`;
  return typeof schema.type === "string" ? schema.type : "object";
}

interface ObjectShape {
  label?: string;
  properties: JsonObject;
  required: Set<string>;
}

/**
 * The object shapes a schema can take: one for an object (an `allOf` merges its
 * parts), one per object member of a `oneOf`/`anyOf`. A member is labelled by its
 * component name, else by a constant property such as `grant_type`.
 */
function objectShapes(document: JsonObject, raw: JsonValue | undefined, depth = 0): ObjectShape[] {
  const schema = component(document, raw);
  if (depth > 6) return [];
  for (const key of ["oneOf", "anyOf"]) {
    if (!Array.isArray(schema[key])) continue;
    return (schema[key] as JsonValue[]).flatMap((member, index) => objectShapes(document, member, depth + 1).map((shape) => {
      const name = isObject(member) && typeof member.$ref === "string" ? member.$ref.split("/").at(-1) : undefined;
      const constant = Object.entries(shape.properties).find(([, property]) => isObject(property) && "const" in component(document, property));
      const label = name ?? (constant ? `${constant[0]}: ${JSON.stringify(component(document, constant[1]).const)}` : `Option ${index + 1}`);
      return { ...shape, label: shape.label ?? label };
    }));
  }
  if (Array.isArray(schema.allOf)) {
    const merged: ObjectShape = { properties: {}, required: new Set() };
    for (const part of schema.allOf as JsonValue[]) {
      for (const shape of objectShapes(document, part, depth + 1)) {
        Object.assign(merged.properties, shape.properties);
        shape.required.forEach((name) => merged.required.add(name));
      }
    }
    return Object.keys(merged.properties).length ? [merged] : [];
  }
  if (!isObject(schema.properties)) return [];
  return [{ properties: schema.properties, required: new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []) }];
}

function fields(document: JsonObject, schema: JsonValue | undefined, tag: "ParamField" | "ResponseField", attribute: string): string[] {
  const shapes = objectShapes(document, schema);
  return shapes.flatMap((shape) => [
    ...(shapes.length > 1 ? [`**One of: ${prose(shape.label)}**`, ""] : []),
    ...Object.entries(shape.properties).map(([name, member]) => {
      const description = prose(isObject(member) ? member.description ?? component(document, member).description : undefined);
      const flag = shape.required.has(name) ? " required" : "";
      return `<${tag} ${attribute}="${name}" type={${JSON.stringify(typeLabel(document, member))}}${flag}>\n${description}\n</${tag}>\n`;
    }),
  ]);
}

interface SuccessResponse {
  status: string;
  description: string;
  mediaType: string | undefined;
  schema: JsonValue | undefined;
  /** The contract's example for this status, when it gives one. */
  example: JsonValue | undefined;
  headers: string[];
}

/** Headers every success response in the contract declares (request ID, rate limits, ...). */
function commonHeaders(document: JsonObject): Set<string> {
  let common: Set<string> | undefined;
  for (const operation of operationsById(document).values()) {
    for (const [status, response] of Object.entries(isObject(operation.responses) ? operation.responses : {})) {
      if (!status.startsWith("2") || !isObject(response)) continue;
      const names = new Set(Object.keys(isObject(response.headers) ? response.headers : {}).map((name) => name.toLowerCase()));
      common = common ? new Set([...common].filter((name) => names.has(name))) : names;
    }
  }
  return common ?? new Set();
}

/**
 * Every success response (2xx, and a declared 304): its body's media type and
 * schema, and the headers it adds to those every response carries.
 */
function successResponses(document: JsonObject, operation: JsonObject): SuccessResponse[] {
  const common = commonHeaders(document);
  return Object.entries(isObject(operation.responses) ? operation.responses : {})
    .filter(([status, response]) => status.startsWith("2") || status === "304" ? isObject(response) : false)
    .map(([status, response]) => {
      const value = response as JsonObject;
      const content = isObject(value.content) ? value.content : {};
      const mediaType = "application/json" in content ? "application/json" : Object.keys(content)[0];
      const media = mediaType ? content[mediaType] : undefined;
      return {
        status,
        description: typeof value.description === "string" ? value.description : "",
        mediaType,
        schema: isObject(media) ? media.schema : undefined,
        example: mediaExample(media),
        headers: Object.keys(isObject(value.headers) ? value.headers : {}).filter((name) => !common.has(name.toLowerCase())),
      };
    });
}

/** A media type object's own example: `example`, else the first of `examples`. */
function mediaExample(media: JsonValue | undefined): JsonValue | undefined {
  if (!isObject(media)) return undefined;
  if ("example" in media) return media.example as JsonValue;
  const first = isObject(media.examples) ? Object.values(media.examples)[0] : undefined;
  return isObject(first) && "value" in first ? (first.value as JsonValue) : undefined;
}

/** A component name returned in a JSON success body, for the resource page's models. */
function returnedModels(document: JsonObject, operation: JsonObject): string[] {
  return successResponses(document, operation).flatMap(({ mediaType, schema }) =>
    mediaType === "application/json" && isObject(schema) && typeof schema.$ref === "string" ? [schema.$ref.split("/").at(-1)!] : []);
}

const isNullable = (document: JsonObject, schema: JsonObject): boolean =>
  (Array.isArray(schema.type) && schema.type.includes("null")) ||
  ["oneOf", "anyOf"].some((key) => Array.isArray(schema[key]) && (schema[key] as JsonValue[]).some((member) => component(document, member).type === "null"));

/**
 * A representative value: the schema's example, else one built from its type.
 * Nullable values are `null`: the simplest valid value, and the one a resource in
 * its ordinary state has (no `deletedAt`, no `revokedAt`).
 */
export function exampleValue(document: JsonObject, raw: JsonValue | undefined, depth = 0): JsonValue {
  const schema = isObject(raw) && typeof raw.$ref === "string" ? { ...component(document, raw), ...raw, $ref: undefined } : raw;
  if (!isObject(schema)) return null;
  if ("example" in schema) return schema.example as JsonValue;
  if (Array.isArray(schema.examples) && schema.examples.length) return schema.examples[0]!;
  if ("const" in schema) return schema.const as JsonValue;
  if (Array.isArray(schema.enum)) return schema.enum[0]!;
  if (schema.type === "null" || isNullable(document, schema)) return null;
  for (const key of ["oneOf", "anyOf"]) {
    if (Array.isArray(schema[key])) return exampleValue(document, (schema[key] as JsonValue[])[0], depth);
  }
  if (Array.isArray(schema.allOf)) {
    return Object.assign({}, ...(schema.allOf as JsonValue[]).map((part) => exampleValue(document, part, depth)).filter(isObject));
  }
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === "object" || isObject(schema.properties)) {
    if (depth > 4) return {};
    return Object.fromEntries(Object.entries(isObject(schema.properties) ? schema.properties : {})
      .map(([name, member]) => [name, exampleValue(document, member, depth + 1)]));
  }
  if (type === "array") return depth > 4 ? [] : [exampleValue(document, schema.items, depth + 1)];
  if (type === "integer" || type === "number") {
    return typeof schema.minimum === "number" ? schema.minimum : typeof schema.exclusiveMinimum === "number" ? schema.exclusiveMinimum + 1 : 0;
  }
  if (type === "boolean") return true;
  const formats: Record<string, string> = { "date-time": "2026-01-01T00:00:00Z", date: "2026-01-01", email: "user@example.com", uri: "https://example.com" };
  return formats[schema.format as string] ?? "string";
}

function frontmatter(title: string, description: string, icon?: string): string[] {
  return ["---", `title: ${JSON.stringify(title)}`, ...(icon ? [`icon: ${icon}`] : []), `description: ${JSON.stringify(description)}`, "---", ""];
}

export function methodPage(document: JsonObject, method: Method): string {
  const operation = operationsById(document).get(method.operation.operationId)!;
  const { httpMethod, path, operationId } = method.operation;
  const lines = [
    ...frontmatter(method.summary, `${method.summary}: ${operationId} in the TypeScript, Python and Rust clients.`, ICONS[httpMethod]),
    `\`${httpMethod} ${path}\``,
    "",
    prose(operation.description),
    "",
    "<Tabs>",
    ...LANGUAGES.flatMap(({ label, lang }) => [`<Tab title="${label}">`, `\`\`\`${lang} ${label}`, method.signatures[lang], "```", "</Tab>"]),
    "</Tabs>",
    "",
    // The right-hand column: the call in each SDK, then an example response. Same
    // labels as the tabs, so choosing a language in one switches the other.
    "<RequestExample>",
    ...LANGUAGES.flatMap(({ label, lang }) => [`\`\`\`${lang} ${label}`, method.samples[lang], "```", ""]),
    "</RequestExample>",
  ];
  const successes = successResponses(document, operation);
  const jsonExamples = successes.filter((response) => response.mediaType === "application/json");
  if (jsonExamples.length) {
    lines.push("", "<ResponseExample>", ...jsonExamples.flatMap((response) =>
      [`\`\`\`json ${response.status}`, JSON.stringify(response.example ?? exampleValue(document, response.schema), null, 2), "```", ""]), "</ResponseExample>");
  }
  const parameters = Array.isArray(operation.parameters) ? (operation.parameters as JsonObject[]) : [];
  if (parameters.length) {
    lines.push("", "## Parameters", "");
    for (const parameter of parameters) {
      const flag = parameter.required ? " required" : "";
      lines.push(`<ParamField ${parameter.in}="${parameter.name}" type={${JSON.stringify(typeLabel(document, parameter.schema))}}${flag}>`, prose(parameter.description), "</ParamField>", "");
    }
  }
  const body = isObject(operation.requestBody) && isObject(operation.requestBody.content) ? operation.requestBody.content["application/json"] : undefined;
  if (isObject(body)) lines.push("", "## Body", "", ...fields(document, body.schema, "ParamField", "body"));
  if (successes.length) {
    lines.push("", "## Returns", "");
    for (const response of successes) {
      const what = !response.mediaType
        ? "No body."
        : response.mediaType === "application/json"
          ? `${typeLabel(document, response.schema)}`
          : `The \`${response.mediaType}\` body${response.mediaType.startsWith("application/json") || response.mediaType.endsWith("+json") ? "" : " as bytes"}.`;
      lines.push(`**\`${response.status}\`** ${prose(response.description)} ${what}`.trim(), "");
      if (response.headers.length) {
        lines.push(`Headers: ${response.headers.map((name) => `\`${name}\``).join(", ")}. The raw response carries these headers; see [Raw responses](/${MOUNT}/raw-responses).`, "");
      }
      if (response.mediaType === "application/json") lines.push(...fields(document, response.schema, "ResponseField", "name"));
    }
  }
  return `${lines.join("\n")}\n`;
}

/** The resource page: its methods in each language, then the models they return. */
export function resourcePage(document: JsonObject, resource: Resource): string {
  const contract = operationsById(document);
  const lines = [...frontmatter(resource.title, `The ${resource.title} resource in the TypeScript, Python and Rust clients.`)];
  if (resource.methods.length) {
    lines.push("## Methods", "", "<Tabs>");
    for (const { label, lang } of LANGUAGES) {
      lines.push(`<Tab title="${label}">`);
      for (const method of resource.methods) {
        lines.push(`**[${prose(method.summary)}](/${MOUNT}/sdk/${resource.slug}/${method.slug})**`, "", `\`\`\`${lang} ${label}`, method.signatures[lang], "```", `\`${method.operation.httpMethod} ${method.operation.path}\``, "");
      }
      lines.push("</Tab>");
    }
    lines.push("</Tabs>", "");
  }
  if (resource.children.length) {
    lines.push("## Resources", "", ...resource.children.map((child) => `- [${child.title}](/${MOUNT}/sdk/${child.slug})`), "");
  }
  const models = [...new Set(resource.methods.flatMap((method) => returnedModels(document, contract.get(method.operation.operationId)!)))];
  if (models.length) {
    lines.push("## Models", "");
    for (const name of models) {
      const schema = { $ref: `#/components/schemas/${name}` };
      lines.push(`### ${name}`, "", prose(component(document, schema).description), "", ...fields(document, schema, "ResponseField", "name"), "");
    }
  }
  return `${lines.join("\n")}\n`;
}

interface NavGroup {
  group: string;
  root?: string;
  pages: Array<string | NavGroup>;
}

/** The sidebar: each resource is a group whose title opens its resource page. */
export function navGroup(tree: Resource[]): NavGroup {
  const group = (resource: Resource): NavGroup => ({
    group: resource.title,
    root: `${MOUNT}/sdk/${resource.slug}/index`,
    pages: [...resource.methods.map((method) => `${MOUNT}/sdk/${resource.slug}/${method.slug}`), ...resource.children.map(group)],
  });
  return { group: GROUP, pages: tree.map(group) };
}

/** Every page, by its path under docs/sdk. */
export function sdkReferencePages(document: JsonObject, tree: Resource[]): Map<string, string> {
  const pages = new Map<string, string>();
  const visit = (resource: Resource) => {
    pages.set(`${resource.slug}/index.mdx.vel`, resourcePage(document, resource));
    for (const method of resource.methods) pages.set(`${resource.slug}/${method.slug}.mdx.vel`, methodPage(document, method));
    resource.children.forEach(visit);
  };
  tree.forEach(visit);
  for (const [path, text] of pages) assert(!/\{\{|\{%|\{#/.test(text), `docs/sdk/${path} contains a Nunjucks delimiter`);
  return pages;
}

/** nav.json with its "SDK reference" group replaced; the guide's groups stay first. */
export function withSdkNav(nav: { source?: string; groups?: NavGroup[] } | undefined, tree: Resource[]): { source: string; groups: NavGroup[] } {
  const groups = (nav?.groups ?? []).filter((group) => group.group !== GROUP);
  return { source: nav?.source ?? MOUNT, groups: [...groups, navGroup(tree)] };
}

async function main(): Promise<void> {
  // The public repository runs this at its root; `--root DIR` points it at another tree.
  const rootFlag = process.argv.indexOf("--root");
  const root = rootFlag > 0 ? resolve(process.argv[rootFlag + 1]!) : repositoryRoot;
  const document = await readJson<JsonObject>(resolve(root, MINTLIFY_CONTRACT_PATH));
  const manifest = await readJson<RpcManifest>(resolve(root, "openapi/rpc-manifest.json"));
  const tree = resources(document, manifest, {
    typescriptClient: await readFile(resolve(root, "packages/typescript/src/rpc.generated.ts"), "utf8"),
    pythonClient: await readFile(resolve(root, "packages/python/src/photon_api/rpc_generated.py"), "utf8"),
    rustClient: await readFile(resolve(root, "packages/rust/src/generated.rs"), "utf8"),
  });
  const pages = sdkReferencePages(document, tree);
  await rm(resolve(root, SDK_REFERENCE_DIR), { recursive: true, force: true });
  for (const [path, text] of pages) {
    const file = resolve(root, SDK_REFERENCE_DIR, path);
    await mkdir(dirname(file), { recursive: true });
    await writeAtomic(file, text);
  }
  const navFile = resolve(root, NAV_PATH);
  const nav = await readJson<{ source?: string; groups?: NavGroup[] }>(navFile).catch(() => undefined);
  await writeAtomic(navFile, `${JSON.stringify(withSdkNav(nav, tree), null, 2)}\n`);
  console.log(`Wrote ${pages.size} SDK reference pages for ${manifest.operations.length} operations to ${SDK_REFERENCE_DIR}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
