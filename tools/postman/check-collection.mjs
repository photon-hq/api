import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { pointer, sourceObject, sourceValidator } from "./source-schema.mjs";

// Validate placeholders without writing fake credentials into the collection.
const credentialField = /^(?:password|passwd|secret|client_?secret|api_?key|api_?token|access_?token|refresh_?token|(?:account)?service_?key|token)$/i;
function withLocalCredentials(value, key = "") {
  // Invitation tokens require exactly 43 base64url characters. This dummy also
  // satisfies the ordinary nonempty credential fields and is never saved.
  if (value === "" && credentialField.test(key)) return "p".repeat(43);
  if (Array.isArray(value)) return value.map((child) => withLocalCredentials(child, key));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, child]) => [name, withLocalCredentials(child, name)]));
  return value;
}

function* requestItems(items) {
  for (const item of items) {
    if (item.item) yield* requestItems(item.item);
    if (item.request) yield item;
  }
}

function operationFor(schema, request) {
  const route = `/${request.url.path.join("/")}`.replace(/(^|\/):([A-Za-z0-9_]+)/g, "$1{$2}");
  const pathItem = sourceObject(schema, schema.paths[route], `#/paths/${pointer(route)}`);
  const method = request.method.toLowerCase();
  const operation = pathItem.value?.[method];
  assert.ok(operation?.operationId, `Unknown collection operation: ${request.method} ${route}`);
  return { pathItem, operation, path: `${pathItem.path}/${method}` };
}

function headersFor(request) {
  const headers = new Map();
  for (const header of request.header ?? []) {
    const key = header.key.toLowerCase();
    assert.ok(!headers.has(key), `Duplicate header: ${key}`);
    headers.set(key, header);
  }
  return headers;
}

function bodyFor(request, headers, content) {
  const header = headers.get("content-type");
  assert.ok(header && !header.disabled, "Missing active Content-Type header");
  const media = header.value.split(";", 1)[0].trim().toLowerCase();
  const type = Object.keys(content).find((key) => key.toLowerCase() === media);
  assert.ok(type, `Undeclared request media type: ${media}`);
  const body = request.body;
  if (media === "application/x-www-form-urlencoded") {
    assert.equal(body.mode, "urlencoded", "Form request must use Postman's urlencoded body mode");
    const fields = body.urlencoded.filter((field) => !field.disabled).map(({ key, value }) => {
      assert.equal(typeof value, "string", `Non-string form example: ${key}`);
      return [key, value];
    });
    assert.equal(new Set(fields.map(([key]) => key)).size, fields.length, "Repeated form fields need an explicit serialization check");
    return { type, kind: "form", value: Object.fromEntries(fields), wire: new URLSearchParams(fields).toString() };
  }
  assert.equal(body.mode, "raw", "Source check requires an inline raw body; external files are not validated");
  assert.equal(typeof body.raw, "string", "Missing raw request body");
  if (media === "application/json" || media.endsWith("+json")) {
    return { type, kind: "json", value: JSON.parse(body.raw), wire: body.raw };
  }
  return { type, kind: "raw", value: body.raw, wire: body.raw };
}

/** Independent source check; no generated SDK or network access is needed. */
export function checkCollectionSource(schema, collection) {
  const validate = sourceValidator(schema);
  const seen = new Set();
  const counts = { operations: 0, jsonBodies: 0, formBodies: 0, rawBodies: 0, headers: 0 };
  const errors = [];
  for (const { request } of requestItems(collection.item)) {
    let label = request.name ?? request.method;
    try {
      const { pathItem, operation, path } = operationFor(schema, request);
      label = operation.operationId;
      assert.ok(!seen.has(operation.operationId), `Duplicate operation: ${operation.operationId}`);
      seen.add(operation.operationId);
      const headers = headersFor(request);
      const requestBody = sourceObject(schema, operation.requestBody, `${path}/requestBody`);
      let body;
      if (requestBody.value) {
        assert.ok(request.body?.mode || !requestBody.value.required, "Missing required request body");
        if (request.body?.mode) {
          body = bodyFor(request, headers, requestBody.value.content);
          assert.ok(requestBody.value.content[body.type].schema !== undefined, `Missing source body schema: ${body.type}`);
          validate(`${requestBody.path}/content/${pointer(body.type)}/schema`, withLocalCredentials(body.value), "Request body");
          counts[`${body.kind}Bodies`]++;
        }
      } else {
        assert.ok(!request.body?.mode, "Collection supplies an undeclared request body");
      }
      // Operation parameters override path-level parameters of the same name/location.
      const parameters = new Map();
      for (const [owner, ownerPath] of [[pathItem.value, pathItem.path], [operation, path]]) {
        for (const [index, entry] of (owner.parameters ?? []).entries()) {
          const parameter = sourceObject(schema, entry, `${ownerPath}/parameters/${index}`);
          const { name, in: location } = parameter.value;
          parameters.set(`${location}:${location === "header" ? name.toLowerCase() : name}`, parameter);
        }
      }
      for (const { value: parameter, path: parameterPath } of parameters.values()) {
        if (parameter.in === "query") {
          const actual = request.url.query?.find((query) => query.key === parameter.name);
          assert.ok(actual, `Missing query parameter: ${parameter.name}`);
          assert.equal(Boolean(actual.disabled), !parameter.required, `Query default: ${parameter.name}`);
        }
        if (parameter.in !== "header") continue;
        const name = parameter.name.toLowerCase();
        let actual = headers.get(name);
        // Postman calculates this transport header. Validate the inline payload's
        // UTF-8 byte count without adding a stale literal to the saved collection.
        if (!actual && name === "content-length" && body) actual = { value: String(Buffer.byteLength(body.wire)) };
        assert.ok(actual || !parameter.required, `Missing required header: ${parameter.name}`);
        if (!actual) continue;
        assert.ok(!parameter.required || !actual.disabled, `Disabled required header: ${parameter.name}`);
        assert.ok(parameter.schema !== undefined, `Missing source header schema: ${parameter.name}`);
        validate(`${parameterPath}/schema`, withLocalCredentials(actual.value, name), `Header ${parameter.name}`);
        if (name === "content-length" && body) assert.equal(actual.value, String(Buffer.byteLength(body.wire)), "Content-Length does not match the inline payload");
        counts.headers++;
      }
    } catch (error) {
      errors.push(new Error(`${label}: ${error.message}`, { cause: error }));
    }
  }
  const expected = Object.entries(schema.paths).flatMap(([route, item]) => Object.entries(sourceObject(schema, item, `#/paths/${pointer(route)}`).value)
    .filter(([method]) => ["get", "post", "put", "patch", "delete", "head", "options", "trace"].includes(method)));
  if (seen.size !== expected.length) errors.push(new Error(`Collection operation coverage changed: ${seen.size}/${expected.length}`));
  if (errors.length) throw new AggregateError(errors, `Postman source check failed (${errors.length}):\n${errors.map((error) => error.message).join("\n")}`);
  return { ...counts, operations: seen.size };
}

/** Check saved responses independently of the converter and generated SDK. */
export function checkCollectionResponsesSource(schema, collection) {
  const validate = sourceValidator(schema);
  const counts = { examples: 0, jsonBodies: 0, emptyBodies: 0, rawBodies: 0 };
  const errors = [];
  for (const item of requestItems(collection.item)) {
    const { operation, path } = operationFor(schema, item.request);
    const declared = operation.responses ?? {};
    const seen = new Set();
    for (const response of item.response ?? []) {
      const label = `${operation.operationId} response ${response.code ?? "default"}`;
      try {
        // The converter leaves code absent for OpenAPI's default response,
        // which has no single HTTP status. Do not invent one for the example.
        assert.ok(response.code === undefined || (Number.isInteger(response.code) && response.code >= 100 && response.code <= 599), "Invalid response status");
        // OpenAPI gives exact status codes precedence over ranges and default.
        const candidates = response.code === undefined ? ["default"] : [String(response.code), `${String(response.code)[0]}XX`, "default"];
        const status = candidates
          .find((key) => Object.hasOwn(declared, key));
        assert.ok(status, "Undeclared response status");
        seen.add(status);
        const entry = sourceObject(schema, declared[status], `${path}/responses/${status}`);
        const content = entry.value.content ?? {};
        if (Object.keys(content).length === 0) {
          assert.ok(response.body === undefined || response.body === null || response.body === "", "Body supplied for an empty response");
          counts.emptyBodies++;
        } else {
          const headers = (response.header ?? []).filter((entry) => entry.key.toLowerCase() === "content-type" && !entry.disabled);
          assert.equal(headers.length, 1, "Missing or duplicate active response Content-Type header");
          const [header] = headers;
          const media = header.value.split(";", 1)[0].trim().toLowerCase();
          const types = Object.keys(content);
          // The most specific matching media declaration owns the schema.
          const type = [media, `${media.split("/", 1)[0]}/*`, "*/*"]
            .map((match) => types.find((key) => key.toLowerCase() === match)).find(Boolean);
          assert.ok(type, `Undeclared response media type: ${media}`);
          assert.ok(content[type].schema !== undefined, `Missing source response schema: ${type}`);
          assert.equal(typeof response.body, "string", "Missing inline response body");
          const json = media === "application/json" || media.endsWith("+json");
          const value = json ? JSON.parse(response.body) : response.body;
          validate(`${entry.path}/content/${pointer(type)}/schema`, withLocalCredentials(value), "Response body");
          counts[json ? "jsonBodies" : "rawBodies"]++;
        }
        counts.examples++;
      } catch (error) {
        errors.push(new Error(`${label}: ${error.message}`, { cause: error }));
      }
    }
    for (const status of Object.keys(declared).filter((key) => /^(?:[1-5](?:[0-9]{2}|XX)|default)$/.test(key))) {
      if (!seen.has(status)) errors.push(new Error(`${operation.operationId}: Missing saved response example for ${status}`));
    }
  }
  if (errors.length) throw new AggregateError(errors, `Postman response source check failed (${errors.length}):\n${errors.map((error) => error.message).join("\n")}`);
  return counts;
}

export function checkCollection(schema, collection, validators) {
  const counts = checkCollectionSource(schema, collection);
  const responses = checkCollectionResponsesSource(schema, collection);
  for (const { request } of requestItems(collection.item)) {
    const { operation } = operationFor(schema, request);
    const media = request.header?.find((header) => header.key.toLowerCase() === "content-type" && !header.disabled)?.value.split(";", 1)[0].trim().toLowerCase();
    if (!request.body?.mode || !(media === "application/json" || media?.endsWith("+json"))) continue;
    const name = `${operation.operationId[0].toUpperCase()}${operation.operationId.slice(1)}InputSchema`;
    const bodySchema = validators[name]?.shape.body;
    assert.ok(bodySchema, `Missing SDK body validator: ${operation.operationId}`);
    const result = bodySchema.safeParse(withLocalCredentials(JSON.parse(request.body.raw)));
    assert.ok(result.success, `${operation.operationId}: SDK schema: ${result.error?.message}`);
  }
  return { ...counts, responses };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { "source-only": { type: "boolean", default: false }, schema: { type: "string" } } });
  const root = new URL("../../", import.meta.url);
  // Default: the contract config/sdk.json names (openapi/openapi.json in the public repository).
  const contract = values.schema ?? JSON.parse(await readFile(new URL("config/sdk.json", root), "utf8")).schemaPath;
  const schema = JSON.parse(await readFile(new URL(contract, root), "utf8"));
  const collection = JSON.parse(await readFile(new URL("postman/collection.json", root), "utf8"));
  try {
    if (values["source-only"]) {
      console.log("Validated Postman examples against source schemas:", {
        ...checkCollectionSource(schema, collection), responses: checkCollectionResponsesSource(schema, collection),
      });
    } else {
      const validators = await import(new URL("packages/typescript/dist/schemas.js", root));
      console.log("Validated Postman requests against source and SDK schemas, and responses against source schemas:", checkCollection(schema, collection, validators));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
