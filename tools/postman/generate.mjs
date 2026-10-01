import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";

const credentialValue = /\b(?:pho_(?:ask|sk)_[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
const credentialField = /^(?:password|passwd|secret|client_?secret|api_?key|api_?token|access_?token|refresh_?token|(?:account)?service_?key|token)$/i;

/** Postman stores names of at most this many characters and cuts longer ones. */
export const maxNameLength = 255;

/**
 * Postman example name for a response. The converter uses the response
 * description, which OpenAPI doesn't limit (a status with several problems
 * lists all of them); shorten it at the last whole "; " entry, or else the
 * last word, so Postman doesn't cut it mid-word. The description itself is
 * unchanged in the contract.
 */
export function exampleName(name) {
  if (typeof name !== "string" || name.length <= maxNameLength) return name;
  // Never end on half of a surrogate pair (a character outside the BMP).
  const head = name.slice(0, maxNameLength - 1).replace(/[\uD800-\uDBFF]$/, "");
  const entry = head.lastIndexOf("; ");
  if (entry > 0) return `${head.slice(0, entry)}; …`;
  const word = head.lastIndexOf(" ");
  return `${word > 0 ? head.slice(0, word) : head.replace(/.$/u, "")} …`;
}

/** Empty credential examples without changing the saved API contract. */
function emptyCredentials(value, field = "") {
  if (typeof value === "string") {
    if (credentialField.test(field)) return "";
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        const cleaned = emptyCredentials(parsed);
        return JSON.stringify(parsed) === JSON.stringify(cleaned) ? value : JSON.stringify(cleaned, null, 2);
      }
    } catch {}
    return credentialValue.test(value) ? "" : value;
  }
  if (Array.isArray(value)) return value.map((item) => emptyCredentials(item, field));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyCredentials(child, key === "value" && typeof value.key === "string" ? value.key : key)]));
}

/** Adapt newer schema keywords for the converter's older example generator.
 * Only this disposable copy changes; the published contract stays untouched.
 * Literal example/default/enum data must never be traversed as schemas.
 */
export function postmanInput(schema) {
  const input = structuredClone(schema);
  const resolve = (ref) => ref.slice(2).split("/").reduce((node, key) => node?.[key.replaceAll("~1", "/").replaceAll("~0", "~")], input);
  // A property whose schema accepts nothing (false or not:{}) must be absent.
  function forbidden(value, seen = new Set()) {
    if (value === false) return true;
    if (!value || typeof value !== "object") return false;
    if (typeof value.$ref === "string" && value.$ref.startsWith("#/") && !seen.has(value.$ref)) {
      seen.add(value.$ref);
      return forbidden(resolve(value.$ref), seen);
    }
    const keys = Object.keys(value).filter((key) => !["description", "title", "$comment", "deprecated"].includes(key) && !key.startsWith("x-"));
    return keys.length === 1 && keys[0] === "not" && (value.not === true || (value.not && typeof value.not === "object" && Object.keys(value.not).length === 0));
  }
  // The older faker ignores email lookaheads and RFC 3339's required seconds,
  // and fills uri-reference patterns with characters URIs cannot contain.
  // Prefer the first fixed example that fits the declared rules.
  const formatExamples = {
    email: ["person@example.com"],
    "date-time": ["2000-01-01T00:00:00Z"],
    "uri-reference": ["https://example.com/", "/v1/projects/example"],
  };
  function visit(value) {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== "object") return;
    if (typeof value.$schema === "string") {
      assert.ok(["https://json-schema.org/draft/2020-12/schema", "https://spec.openapis.org/oas/3.1/dialect/base"].includes(value.$schema), "Unsupported Postman example schema dialect");
      delete value.$schema;
    }
    // The faker understands a one-value enum but ignores JSON Schema's const.
    if (Object.hasOwn(value, "const")) {
      if (value.enum) assert.ok(value.enum.some((item) => isDeepStrictEqual(item, value.const)), "Schema const conflicts with enum");
      value.enum = [value.const];
    }
    // Prefer a nonempty tuple example where prefixItems describes its entries.
    // Translate to the older tuple syntax only in the example-generator input.
    // The converter does not follow a $ref inside tuple items (it fakes ""),
    // so each referenced entry is copied in.
    if (Array.isArray(value.prefixItems)) {
      value.additionalItems = value.items ?? true;
      value.items = value.prefixItems.map((item) =>
        item && typeof item.$ref === "string" && item.$ref.startsWith("#/") ? structuredClone(resolve(item.$ref)) : item);
      value.minItems = Math.max(value.minItems ?? 0, Math.min(value.prefixItems.length, value.maxItems ?? Infinity));
      delete value.prefixItems;
    }
    // The faker's whitespace table includes obsolete ECMAScript entries. Give
    // this phone pattern a fictional, valid example without changing its regex.
    if (value.pattern === "^[+\\d][\\d\\s().-]{6,24}$" && value.example === undefined) value.example = "+12025550123";
    if (Object.hasOwn(formatExamples, value.format) && !["example", "examples", "default", "enum", "const", "allOf", "anyOf", "oneOf", "not", "if"].some((key) => Object.hasOwn(value, key))) {
      const example = formatExamples[value.format].find((candidate) => candidate.length >= (value.minLength ?? 0) && candidate.length <= (value.maxLength ?? Infinity)
        && (value.pattern === undefined || new RegExp(value.pattern).test(candidate)));
      if (example !== undefined) value.example = example;
    }
    if (value.properties && typeof value.properties === "object") {
      const required = new Set(Array.isArray(value.required) ? value.required : []);
      for (const [name, child] of Object.entries(value.properties)) {
        if (!required.has(name) && forbidden(child)) delete value.properties[name];
      }
    }
    for (const [key, child] of Object.entries(value)) {
      if (["properties", "patternProperties", "$defs", "definitions", "dependentSchemas", "schemas"].includes(key) && child && typeof child === "object") Object.values(child).forEach(visit);
      else if (!["example", "examples", "default", "enum", "const"].includes(key)) visit(child);
    }
  }
  visit(input);

  // The converter fakes an allOf by merging its branches after replacing each
  // anyOf/oneOf with its first alternative, and it merges enums as a union.
  // Both can yield values that some branch rejects: a first alternative whose
  // constant conflicts with a sibling, a union of enums, or an optional
  // property that a closed sibling forbids. For each allOf, select the first
  // alternative compatible with the sibling branches, intersect enums and omit
  // optional properties a closed sibling forbids. Each change only narrows the
  // example input to values the original allOf accepts. When no compatible
  // alternative exists, the allOf is left for the source check to report.
  const deref = (node) => {
    const seen = new Set();
    while (node && typeof node === "object" && typeof node.$ref === "string" && node.$ref.startsWith("#/") && !seen.has(node.$ref)) {
      seen.add(node.$ref);
      node = resolve(node.$ref);
    }
    return node;
  };
  const isObject = (node) => Boolean(node) && typeof node === "object" && !Array.isArray(node);
  // Match the converter: anyOf takes precedence over oneOf.
  const alternatives = (node) => Array.isArray(node?.anyOf) ? node.anyOf : Array.isArray(node?.oneOf) ? node.oneOf : undefined;
  const closed = (node) => node?.additionalProperties === false && !node.patternProperties;
  const unionOnly = (node) => Object.keys(node).every((key) => ["anyOf", "oneOf", "type", "description", "title", "$comment", "deprecated", "discriminator"].includes(key) || key.startsWith("x-"));
  const limit = 16;
  // Conservative: true unless enum, closed-object or property constraints conflict.
  function compatible(a, b, depth = 0) {
    if (depth > limit) return true;
    a = deref(a); b = deref(b);
    if (a === false || b === false) return false;
    if (!isObject(a) || !isObject(b)) return true;
    if (alternatives(a)) return alternatives(a).some((item) => compatible(item, b, depth + 1));
    if (alternatives(b)) return alternatives(b).some((item) => compatible(a, item, depth + 1));
    if (Array.isArray(a.enum) && Array.isArray(b.enum) && !a.enum.some((x) => b.enum.some((y) => isDeepStrictEqual(x, y)))) return false;
    for (const [x, y] of [[a, b], [b, a]]) {
      if (closed(x) && (Array.isArray(y.required) ? y.required : []).some((name) => !Object.hasOwn(x.properties ?? {}, name))) return false;
    }
    const left = a.properties ?? {}, right = b.properties ?? {};
    return Object.keys(left).filter((name) => Object.hasOwn(right, name)).every((name) => compatible(left[name], right[name], depth + 1));
  }
  // Select the converter's first alternative unless a sibling rules it out.
  function pick(node, siblings, depth) {
    const target = deref(node);
    const items = alternatives(target);
    if (!items || depth > limit || !unionOnly(target)) return node;
    const index = items.findIndex((item) => siblings.every((sibling) => compatible(item, sibling)));
    if (index < 0) return node;
    // Inline the selected alternative so its properties can be narrowed below.
    // Keep a type declared beside the union, as the converter cascades it.
    const chosen = pick(items[index], siblings, depth + 1);
    const view = deref(chosen);
    return target.type !== undefined && isObject(view) && view.type === undefined ? { ...view, type: target.type } : chosen;
  }
  // Returns the branches, replacing only those that need a narrower copy.
  function merge(nodes, depth = 0) {
    if (depth > limit) return nodes;
    const result = nodes.map((node, index) => pick(node, nodes.filter((_, other) => other !== index), depth));
    const views = result.map(deref);
    const replace = (index, changes) => { result[index] = views[index] = { ...views[index], ...changes }; };
    const objects = views.flatMap((view, index) => isObject(view) ? [index] : []);
    for (const index of objects.filter((index) => closed(views[index]))) {
      const allowed = views[index].properties ?? {};
      for (const other of objects.filter((other) => other !== index && isObject(views[other].properties))) {
        const required = new Set(Array.isArray(views[other].required) ? views[other].required : []);
        const kept = Object.entries(views[other].properties).filter(([name]) => Object.hasOwn(allowed, name) || required.has(name));
        if (kept.length !== Object.keys(views[other].properties).length) replace(other, { properties: Object.fromEntries(kept) });
      }
    }
    const names = new Set(objects.flatMap((index) => isObject(views[index].properties) ? Object.keys(views[index].properties) : []));
    for (const name of names) {
      const owners = objects.filter((index) => isObject(views[index].properties) && Object.hasOwn(views[index].properties, name));
      if (owners.length < 2) continue;
      const merged = merge(owners.map((index) => views[index].properties[name]), depth + 1);
      owners.forEach((index, position) => {
        if (merged[position] !== views[index].properties[name]) replace(index, { properties: { ...views[index].properties, [name]: merged[position] } });
      });
    }
    const enums = objects.filter((index) => Array.isArray(views[index].enum));
    if (enums.length > 1) {
      const common = views[enums[0]].enum.filter((value) => enums.every((index) => views[index].enum.some((item) => isDeepStrictEqual(item, value))));
      if (common.length) for (const index of enums) if (views[index].enum.length !== common.length) replace(index, { enum: common });
    }
    return result;
  }
  const done = new WeakSet();
  function specialize(value) {
    if (!value || typeof value !== "object" || done.has(value)) return;
    done.add(value);
    if (Array.isArray(value)) { value.forEach(specialize); return; }
    if (Array.isArray(value.allOf) && value.allOf.length > 1) value.allOf = merge(value.allOf);
    for (const [key, child] of Object.entries(value)) {
      if (["properties", "patternProperties", "$defs", "definitions", "dependentSchemas", "schemas"].includes(key) && child && typeof child === "object") Object.values(child).forEach(specialize);
      else if (!["example", "examples", "default", "enum", "const"].includes(key)) specialize(child);
    }
  }
  specialize(input);
  return input;
}

/** Convert the saved public contract. Never contacts an API or a Postman workspace. */
export async function generateCollection(schema, converter) {
  assert.ok(schema.servers?.length === 1, "Collection requires one configured API server");
  const operations = new Map();
  for (const [path, item] of Object.entries(schema.paths)) {
    for (const [method, operation] of Object.entries(item)) {
      if (["get", "post", "put", "patch", "delete", "head", "options", "trace"].includes(method)) operations.set(`${method.toUpperCase()} ${path}`, operation);
    }
  }
  const seen = new Set();
  const origin = schema.servers[0].url;
  assert.equal(new URL(origin).origin, origin, "Collection API server must be an origin");
  const result = await new Promise((accept, reject) => converter.convertV2(
    { type: "json", data: postmanInput(schema) },
    { folderStrategy: "Tags", schemaFaker: true, includeAuthInfoInExample: false, parametersResolution: "Example", enableOptionalParameters: false },
    (error, value) => error ? reject(error) : accept(value),
  ));
  assert.equal(result.result, true, "OpenAPI-to-Postman conversion failed");
  const collection = result.output.find((item) => item.type === "collection")?.data;
  assert.ok(collection?.item?.length, "Converter returned no requests");
  delete collection.info._postman_id;
  delete collection.info._exporter_id;
  collection.info.version = schema.info.version;
  // Stable IDs prevent converter UUID generation from changing the release diff.
  function clean(value) {
    if (Array.isArray(value)) value.forEach(clean);
    else if (value && typeof value === "object") {
      if (value.request || value.item) delete value.id;
      if (value.originalRequest) delete value.id;
      for (const item of Object.values(value)) clean(item);
    }
  }
  clean(collection);
  const variables = new Map((collection.variable ?? []).map((item) => [item.key, item]));
  variables.set("baseUrl", { key: "baseUrl", value: origin, type: "string" });
  variables.set("apiToken", { key: "apiToken", value: "", type: "string" });
  collection.variable = emptyCredentials([...variables.values()]);
  collection.auth = { type: "bearer", bearer: [{ key: "token", value: "{{apiToken}}", type: "string" }] };
  function requests(items) {
    for (const item of items) {
      if (item.item) requests(item.item);
      if (!item.request) continue;
      const request = item.request;
      if (typeof request.url === "string") {
        assert.ok(request.url.startsWith("{{baseUrl}}/"), "Unexpected collection request server");
      } else {
        assert.deepEqual(request.url?.host, ["{{baseUrl}}"], "Unexpected collection request server");
        assert.ok(Array.isArray(request.url.path), "Converter request path is required");
        assert.ok(!request.url.protocol, "Collection URL must inherit the configured origin");
      }
      const path = typeof request.url === "string" ? request.url.slice("{{baseUrl}}".length).split("?")[0]
        : `/${request.url.path.join("/")}`;
      const route = path.replace(/(^|\/):([A-Za-z0-9_]+)/g, "$1{$2}");
      const key = `${request.method} ${route}`;
      const operation = operations.get(key);
      assert.ok(operation && !seen.has(key), `Missing or duplicate source operation: ${key}`);
      seen.add(key);
      const security = operation.security ?? schema.security ?? [];
      const anonymous = security.length === 0 || security.some((requirement) => Object.keys(requirement).length === 0);
      if (anonymous) request.auth = { type: "noauth" };
      else {
        const bearer = security.some((requirement) => Object.keys(requirement).length === 1 && Object.keys(requirement).every((name) => {
          const scheme = schema.components?.securitySchemes?.[name];
          return scheme?.type === "oauth2" || (scheme?.type === "http" && scheme.scheme === "bearer");
        }));
        assert.ok(bearer, `Collection credential handling needs an explicit implementation: ${key}`);
        delete request.auth;
      }
      request.header = (request.header ?? []).filter((header) => !/^(authorization|cookie)$/i.test(header.key));
      function cleanRequestExamples(example) {
        // Postman calculates the length of the actual outgoing bytes.
        example.header = (example.header ?? []).filter((header) => !/^content-length$/i.test(header.key));
        if (operation.operationId === "uploadAttachment") {
          assert.ok(operation.requestBody?.content?.["multipart/related"], "Attachment upload media type changed");
          const boundary = "photon-postman-example";
          const file = "Hello from Photon.\n";
          const metadata = { filename: "hello.txt", contentType: "text/plain", sizeBytes: Buffer.byteLength(file) };
          example.header = example.header.filter((header) => !/^content-type$/i.test(header.key));
          example.header.push({ key: "Content-Type", value: `multipart/related; boundary=${boundary}` });
          example.body = { mode: "raw", raw: `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: text/plain\r\n\r\n${file}\r\n--${boundary}--\r\n` };
        }
        for (const field of ["body", "header"]) if (example[field]) example[field] = emptyCredentials(example[field]);
        if (example.url && typeof example.url === "object") {
          for (const field of ["query", "variable"]) if (example.url[field]) example.url[field] = emptyCredentials(example.url[field]);
        }
      }
      cleanRequestExamples(request);
      if (operation.operationId === "uploadAttachment") {
        const description = typeof request.description === "string" ? request.description : request.description?.content ?? "";
        request.description = `${description}\n\nThis request uploads the included hello.txt text file. Set your project ID and a fresh Idempotency-Key. The raw body contains JSON metadata followed by the file bytes. If editing it, keep sizeBytes equal to the UTF-8 file byte count and preserve the CRLF boundaries. For a binary file, select a prepared multipart/related payload as a binary body and set its matching boundary in Content-Type. Postman calculates Content-Length.`;
      }
      for (const response of item.response ?? []) {
        response.name = exampleName(response.name);
        if (response.body) response.body = emptyCredentials(response.body);
        response.header = emptyCredentials((response.header ?? []).filter((header) => !/^(authorization|set-cookie)$/i.test(header.key)));
        if (response.originalRequest) {
          delete response.originalRequest.auth;
          response.originalRequest.header = (response.originalRequest.header ?? []).filter((header) => !/^(authorization|cookie)$/i.test(header.key));
          cleanRequestExamples(response.originalRequest);
        }
      }
    }
  }
  requests(collection.item);
  assert.equal(seen.size, operations.size, "Collection must cover every public operation");
  return collection;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assert.ok([4, 5].includes(process.argv.length), "Use tools/postman/run.mjs to generate a collection");
  const schema = JSON.parse(await readFile(process.argv[2], "utf8"));
  // The converter's schema examples use randomness and the current date. Fix
  // both only in this isolated worker so regenerated collection bytes are stable.
  let seed = 0x50484f54;
  Math.random = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) / 0x100000000;
  };
  const NativeDate = Date;
  globalThis.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [946684800000])); }
    static now() { return 946684800000; }
  };
  const converter = (await import("openapi-to-postmanv2")).default;
  const collection = await generateCollection(schema, converter);
  if (process.argv[4] !== undefined) collection.info.version = process.argv[4];
  await writeFile(process.argv[3], `${JSON.stringify(collection, null, 2)}\n`);
}
