import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";
import { addUnknownPlatformMembers, namesFromContract, prepareOptionsFor, prepareSdk, type PrepareOptions } from "./prepare-sdk.js";
import { jsonSdkDocument } from "./media-types.js";
import { loadSdkConfig } from "./sdk-config.js";

import {
  contractPath,
  isObject,
  readJson,
  repositoryRoot,
  sdkPackages,
  sha256,
  stableJson,
  type JsonObject,
  type JsonValue,
} from "./shared.js";

interface ManifestOperation {
  operationId: string;
  path: string;
  httpMethod: string;
  requestBody?: {
    content: Record<string, string>;
  };
  responses: Record<string, Record<string, string>>;
}

interface Manifest {
  sourceSha256: string;
  operationCount: number;
  operations: ManifestOperation[];
}

const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "patch",
  "options",
  "head",
  "trace",
]);

/** The committed SDK input's preparation options (config/sdk.json), as `npm run prepare:sdk` selects them. */
async function repositoryOptions(): Promise<PrepareOptions> {
  return prepareOptionsFor(await loadSdkConfig());
}

const COMPONENT_PREFIX = "#/components/schemas/";

/** The component a schema is exactly a reference to, if any. */
function componentName(schema: JsonValue | undefined): string | undefined {
  if (!isObject(schema) || Object.keys(schema).length !== 1 || typeof schema.$ref !== "string") {
    return undefined;
  }
  return schema.$ref.startsWith(COMPONENT_PREFIX) ? schema.$ref.slice(COMPONENT_PREFIX.length) : undefined;
}

/** A schema, or the component it is exactly a reference to. */
function resolveComponent(document: JsonObject, schema: JsonValue | undefined): JsonValue | undefined {
  const name = componentName(schema);
  if (name === undefined) return schema;
  assert(isObject(document.components) && isObject(document.components.schemas));
  return document.components.schemas[name];
}

/**
 * The SDK component that holds an operation media schema: the contract
 * component the source references, or (internal lane) the operation-specific
 * name that hoisting gives an inline schema.
 */
function sdkMediaComponent(schema: JsonValue | undefined, hoistedName: string): string {
  return componentName(schema) ?? hoistedName;
}

const NOMINAL_KEYWORDS = ["enum", "const", "oneOf", "anyOf", "allOf", "properties", "items", "$ref"];

function isScalarSchema(schema: JsonObject): boolean {
  return ["string", "number", "integer", "boolean"].includes(schema.type as string) &&
    NOMINAL_KEYWORDS.every((keyword) => !Object.hasOwn(schema, keyword));
}

function sourceOperationIds(source: JsonObject): string[] {
  assert(isObject(source.paths));
  const operationIds: string[] = [];
  for (const pathItem of Object.values(source.paths)) {
    if (!isObject(pathItem)) {
      continue;
    }
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method)) {
        continue;
      }
      assert(isObject(operation));
      assert.equal(typeof operation.operationId, "string");
      operationIds.push(operation.operationId as string);
    }
  }
  return operationIds.sort();
}

function countKey(value: JsonValue, key: string): number {
  if (Array.isArray(value)) {
    return value.reduce<number>(
      (total, child) => total + countKey(child, key),
      0,
    );
  }
  if (!isObject(value)) {
    return 0;
  }
  return (
    (Object.hasOwn(value, key) ? 1 : 0) +
    Object.values(value).reduce<number>(
      (total, child) => total + countKey(child, key),
      0,
    )
  );
}

test("all generators share the JSON projection without losing operations", async () => {
  const [source, sdk, manifest] = await Promise.all([
    readJson<JsonObject>(resolve(repositoryRoot, contractPath())),
    readJson<JsonObject>(resolve(repositoryRoot, "openapi/sdk.json")),
    readJson<Manifest>(resolve(repositoryRoot, "openapi/rpc-manifest.json")),
  ]);
  const original = structuredClone(source);
  const prepared = prepareSdk(source, await repositoryOptions());
  assert.deepEqual(source, original, "SDK preparation must not mutate the source contract");
  assert.deepEqual(sdk, prepared.sdk);
  assert.deepEqual(manifest, prepared.manifest);
  assert.equal(manifest.sourceSha256, sha256(stableJson(source)));
  assert.deepEqual(sourceOperationIds(sdk), sourceOperationIds(source));
});

test("manifest preserves source routes, response statuses and every declared media type", async () => {
  const [source, manifest] = await Promise.all([
    readJson<JsonObject>(resolve(repositoryRoot, contractPath())),
    readJson<Manifest>(resolve(repositoryRoot, "openapi/rpc-manifest.json")),
  ]);
  assert(isObject(source.paths));
  for (const operation of manifest.operations) {
    const item: JsonValue | undefined = source.paths[operation.path];
    assert(isObject(item));
    const original: JsonValue | undefined = item[operation.httpMethod.toLowerCase()];
    assert(isObject(original));
    assert.equal(operation.operationId, original.operationId);
    const body: JsonObject = isObject(original.requestBody) ? original.requestBody : {};
    assert.deepEqual(Object.keys(operation.requestBody?.content ?? {}).sort(),
      Object.keys(isObject(body.content) ? body.content : {}).sort(), operation.operationId);
    assert(isObject(original.responses));
    assert.deepEqual(Object.keys(operation.responses).sort(), Object.keys(original.responses).sort());
    for (const [status, content] of Object.entries(operation.responses)) {
      const response: JsonValue | undefined = original.responses[status];
      assert(isObject(response));
      assert.deepEqual(Object.keys(content).sort(),
        Object.keys(isObject(response.content) ? response.content : {}).sort(), `${operation.operationId} ${status}`);
    }
  }
});

test("manifest and the TypeScript and Python facades expose every OpenAPI operation", async () => {
  const [manifest, source] = await Promise.all([
    readJson<Manifest>(resolve(repositoryRoot, "openapi/rpc-manifest.json")),
    readJson<JsonObject>(resolve(repositoryRoot, contractPath())),
  ]);
  const expectedOperationIds = sourceOperationIds(source);
  const manifestOperationIds = manifest.operations
    .map(({ operationId }) => operationId)
    .sort();
  assert.equal(manifest.operationCount, expectedOperationIds.length);
  assert.deepEqual(manifestOperationIds, expectedOperationIds);
  assert.equal(new Set(manifestOperationIds).size, expectedOperationIds.length);

  // Each public language repository carries only its own package.
  const present = sdkPackages();
  if (present.python) {
    const python = await readFile(
      resolve(repositoryRoot, "packages/python/src/photon_api/rpc_generated.py"),
      "utf8",
    );
    for (const { operationId } of manifest.operations) {
      assert.match(python, new RegExp(`operation_id="${operationId}"`));
    }
  }
  if (!present.typescript) return;
  const [typescript, schemas] = await Promise.all([
    readFile(
      resolve(repositoryRoot, "packages/typescript/src/rpc.generated.ts"),
      "utf8",
    ),
    readFile(resolve(repositoryRoot, "packages/typescript/src/schemas.ts"), "utf8"),
  ]);
  for (const { operationId } of manifest.operations) {
    assert.match(typescript, new RegExp(`Sdk\\.${operationId}\\b`));
  }
  assert.equal(
    (schemas.match(/InputSchema =/g) ?? []).length,
    expectedOperationIds.length,
  );
  assert.equal(
    (schemas.match(/OutputSchema =/g) ?? []).length,
    expectedOperationIds.length,
  );
});

test("project request and response components preserve their source constraints", async () => {
  const [source, sdk] = await Promise.all([
    readJson<JsonObject>(resolve(repositoryRoot, contractPath())),
    readJson<JsonObject>(resolve(repositoryRoot, "openapi/sdk.json")),
  ]);
  const projected = jsonSdkDocument(source);
  assert(isObject(projected.paths));
  const item = projected.paths["/v1/organizations/{organizationId}/projects"];
  assert(isObject(item) && isObject(item.post));
  const operation = item.post;
  assert(isObject(sdk.components) && isObject(sdk.components.schemas));
  assert(isObject(operation.requestBody) && isObject(operation.requestBody.content));
  const request = operation.requestBody.content["application/json"];
  assert(isObject(request));
  assert.deepEqual(
    sdk.components.schemas[sdkMediaComponent(request.schema, "CreateProjectRequestApplicationJson")],
    resolveComponent(projected, request.schema),
  );
  assert(isObject(operation.responses) && isObject(operation.responses["201"]));
  const response = operation.responses["201"];
  assert(isObject(response.content) && isObject(response.content["application/json"]));
  const responseSchema = response.content["application/json"].schema;
  assert.deepEqual(
    sdk.components.schemas[sdkMediaComponent(responseSchema, "CreateProjectResponse201ApplicationJson")],
    resolveComponent(projected, responseSchema),
  );
  for (const keyword of ["oneOf", "anyOf", "additionalProperties", "format"]) {
    assert.ok(countKey(sdk, keyword) > 0, keyword);
  }
});

test("every hoisted operation schema preserves the selected source contract", async () => {
  const [source, sdk, options] = await Promise.all([
    readJson<JsonObject>(resolve(repositoryRoot, contractPath())),
    readJson<JsonObject>(resolve(repositoryRoot, "openapi/sdk.json")),
    repositoryOptions(),
  ]);
  // The unknown-platform fallback is SDK policy (prepare-sdk.ts), not hoisting:
  // expect it as preparation applies it.
  const withFallbacks = structuredClone(source);
  addUnknownPlatformMembers(withFallbacks, namesFromContract(options));
  const projected = jsonSdkDocument(withFallbacks);
  assert(isObject(projected.components) && isObject(projected.components.schemas));
  assert(isObject(sdk.components) && isObject(sdk.components.schemas));
  const originalSchemas = projected.components.schemas;
  const schemas = sdk.components.schemas;
  const hoisted = new Set(Object.keys(schemas).filter((name) => !Object.hasOwn(originalSchemas, name)));
  function inlineHoisted(value: JsonValue, expected?: JsonValue): JsonValue {
    if (Array.isArray(value)) return value.map((child, index) =>
      inlineHoisted(child, Array.isArray(expected) ? expected[index] : undefined));
    if (!isObject(value)) return value;
    if (Object.keys(value).length === 1 && typeof value.$ref === "string") {
      const name = value.$ref.replace(/^#\/components\/schemas\//, "");
      if (hoisted.has(name)) {
        const schema = structuredClone(schemas[name]!);
        // Hoisting makes this a schema root. The existing format adapter maps
        // this known validation vocabulary to the equivalent OAS 3.1 dialect.
        if (isObject(schema) && isObject(expected) &&
            schema.$schema === "https://spec.openapis.org/oas/3.1/dialect/base" &&
            expected.$schema === "https://json-schema.org/draft/2020-12/schema") {
          schema.$schema = expected.$schema;
        }
        return inlineHoisted(schema, expected);
      }
    }
    return Object.fromEntries(Object.entries(value).map(([key, child]) =>
      [key, inlineHoisted(child, isObject(expected) ? expected[key] : undefined)]));
  }
  assert.deepEqual(inlineHoisted(sdk.paths!, projected.paths), projected.paths);
  for (const [name, schema] of Object.entries(originalSchemas)) {
    assert.deepEqual(inlineHoisted(schemas[name]!, schema), schema, name);
  }
});

test("device-token contract retains upstream JSON and form unions plus OAuth errors", async () => {
  const [source, sdk] = await Promise.all([
    readJson<JsonObject>(resolve(repositoryRoot, contractPath())),
    readJson<JsonObject>(resolve(repositoryRoot, "openapi/sdk.json")),
  ]);
  assert(isObject(source.paths));
  const path = source.paths["/v1/auth/device/token"];
  assert(isObject(path));
  assert(isObject(path.post));
  assert(isObject(path.post.requestBody));
  assert(isObject(path.post.requestBody.content));
  assert.deepEqual(Object.keys(path.post.requestBody.content).sort(), [
    "application/json",
    "application/x-www-form-urlencoded",
  ]);
  assert(isObject(path.post.requestBody.content["application/json"]));
  assert(isObject(path.post.requestBody.content["application/x-www-form-urlencoded"]));
  assert(isObject(sdk.components) && isObject(sdk.components.schemas));
  for (const [mediaType, suffix] of [
    ["application/json", "ApplicationJson"],
    ["application/x-www-form-urlencoded", "ApplicationForm"],
  ] as const) {
    const media: JsonValue | undefined = path.post.requestBody.content[mediaType];
    assert(isObject(media));
    const schema = resolveComponent(source, media.schema);
    assert(isObject(schema));
    assert.equal(Array.isArray(schema.oneOf), true, mediaType);
    const name = sdkMediaComponent(media.schema, `DeviceTokenRequest${suffix}`);
    const component: JsonValue | undefined = sdk.components.schemas[name];
    assert(isObject(component));
    assert.equal(Array.isArray(component.oneOf), true, name);
  }

  assert(isObject(path.post.responses));
  const oauth = path.post.responses["400"];
  assert(isObject(oauth));
  assert(isObject(oauth.content));
  assert.ok(oauth.content["application/json"]);
});

test("successful and problem response schemas use stable component references", async () => {
  const [manifest, source, sdk, options] = await Promise.all([
    readJson<Manifest>(resolve(repositoryRoot, "openapi/rpc-manifest.json")),
    readJson<JsonObject>(resolve(repositoryRoot, contractPath())),
    readJson<JsonObject>(resolve(repositoryRoot, "openapi/sdk.json")),
    repositoryOptions(),
  ]);
  assert(isObject(source.components) && isObject(source.components.schemas));
  assert(isObject(sdk.components) && isObject(sdk.components.schemas));
  const sourceSchemas = source.components.schemas;
  const sdkSchemas = sdk.components.schemas;
  const check = (reference: string) => {
    const name = reference.replace(/^#\/components\/schemas\//, "");
    assert.notEqual(name, reference, reference);
    assert.ok(Object.hasOwn(sdkSchemas, name), `${reference} must resolve`);
    // Either a contract component, referenced by its own name, or an
    // operation-specific name for an inline media schema.
    if (!Object.hasOwn(sourceSchemas, name)) {
      assert.match(name, /^[A-Za-z0-9]+$/);
    }
  };
  let contractReferences = 0;
  for (const operation of manifest.operations) {
    const references = [
      ...Object.values(operation.requestBody?.content ?? {}),
      ...Object.values(operation.responses).flatMap((content) => Object.values(content)),
    ];
    for (const reference of references) {
      if (namesFromContract(options) && typeof reference !== "string") {
        // The public lane hoists nothing: an inline scalar media schema (a
        // binary upload, for example) has no type name to reference.
        assert(isObject(reference) && isScalarSchema(reference), `${operation.operationId} ${stableJson(reference)}`);
        continue;
      }
      assert.equal(typeof reference, "string");
      check(reference as string);
      if (Object.hasOwn(sourceSchemas, (reference as string).slice("#/components/schemas/".length))) {
        contractReferences += 1;
      }
    }
  }
  assert.ok(contractReferences > 0, "media that reference a contract component keep that reference");
  assert.ok(
    manifest.operations.some((operation) =>
      Object.values(operation.responses).some((content) =>
        Object.hasOwn(content, "application/problem+json"),
      ),
    ),
  );
});
