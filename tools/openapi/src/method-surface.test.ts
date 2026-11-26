import assert from "node:assert/strict";
import test from "node:test";

import { prepareMethodSurface } from "./method-surface.js";
import { prepareSdk } from "./prepare-sdk.js";
import type { JsonObject } from "./shared.js";

const version = { in: "header", name: "Photon-Version", required: false, schema: { type: "string" } };
const ifNoneMatch = { in: "header", name: "if-none-match", required: false, schema: { type: "string" } };
const notModified = { description: "Not Modified" };
const ok = { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Widget" } } } };

const contract = (): JsonObject => ({
  openapi: "3.1.0",
  info: { title: "Fixture", version: "1.0.0" },
  components: {
    parameters: { Version: { ...version, name: "photon-version" }, Precondition: { ...ifNoneMatch, name: "If-None-Match" } },
    schemas: { Widget: { type: "object", properties: { id: { type: "string" } } } },
  },
  paths: {
    "/widgets/{widgetId}": {
      parameters: [{ in: "path", name: "widgetId", required: true, schema: { type: "string" } }, version],
      get: { operationId: "getWidget", responses: { "200": ok, "304": notModified } },
      delete: { operationId: "deleteWidget", parameters: [version], responses: { "204": { description: "Deleted" } } },
    },
    "/widgets/{widgetId}/conditional": {
      get: {
        operationId: "getConditionalWidget",
        parameters: [{ in: "path", name: "widgetId", required: true, schema: { type: "string" } }, version, ifNoneMatch],
        responses: { "200": ok, "304": notModified },
      },
    },
    "/widgets/{widgetId}/referenced": {
      get: {
        operationId: "getReferencedWidget",
        parameters: [{ $ref: "#/components/parameters/Version" }, { $ref: "#/components/parameters/Precondition" },
          { in: "header", name: "X-Request-Tag", required: false, schema: { type: "string" } }],
        responses: { "200": ok, "304": notModified },
      },
    },
  },
});

test("an SDK method takes no client header, at any level or by reference", () => {
  const document = contract();
  prepareMethodSurface(document);
  const paths = document.paths as Record<string, JsonObject>;
  const widget = paths["/widgets/{widgetId}"]!;
  assert.deepEqual(widget.parameters, [{ in: "path", name: "widgetId", required: true, schema: { type: "string" } }]);
  assert.equal(Object.hasOwn(widget.delete as JsonObject, "parameters"), false, "an emptied list is dropped");
  assert.deepEqual(((paths["/widgets/{widgetId}/conditional"]!.get as JsonObject).parameters as JsonObject[]).map(({ name }) => name),
    ["widgetId", "if-none-match"]);
  assert.deepEqual((paths["/widgets/{widgetId}/referenced"]!.get as JsonObject).parameters, [
    { $ref: "#/components/parameters/Precondition" },
    { in: "header", name: "X-Request-Tag", required: false, schema: { type: "string" } },
  ]);
});

test("a 304 is part of a method's result only when the method can send a precondition", () => {
  const document = contract();
  prepareMethodSurface(document);
  const paths = document.paths as Record<string, JsonObject>;
  const statuses = (path: string): string[] => Object.keys((paths[path]!.get as JsonObject).responses as JsonObject);
  assert.deepEqual(statuses("/widgets/{widgetId}"), ["200"]);
  assert.deepEqual(statuses("/widgets/{widgetId}/conditional"), ["200", "304"]);
  assert.deepEqual(statuses("/widgets/{widgetId}/referenced"), ["200", "304"]);
});

test("a parameter reference is followed through a chain of references, and a cycle ends it", () => {
  const document: JsonObject = {
    openapi: "3.1.0",
    info: { title: "Fixture", version: "1.0.0" },
    components: {
      parameters: {
        Version: version,
        VersionAlias: { $ref: "#/components/parameters/Version" },
        Precondition: ifNoneMatch,
        PreconditionAlias: { $ref: "#/components/parameters/Precondition" },
        Loop: { $ref: "#/components/parameters/Loop" },
      },
    },
    paths: {
      "/aliased": {
        get: {
          operationId: "getAliased",
          parameters: [{ $ref: "#/components/parameters/VersionAlias" }, { $ref: "#/components/parameters/PreconditionAlias" }],
          responses: { "200": ok, "304": notModified },
        },
      },
      "/modified": {
        get: {
          operationId: "getModified",
          parameters: [{ in: "header", name: "If-Modified-Since", required: false, schema: { type: "string" } }],
          responses: { "200": ok, "304": notModified },
        },
      },
      "/looped": {
        get: { operationId: "getLooped", parameters: [{ $ref: "#/components/parameters/Loop" }], responses: { "200": ok, "304": notModified } },
      },
    },
  };
  prepareMethodSurface(document);
  const operation = (path: string): JsonObject => (document.paths as Record<string, JsonObject>)[path]!.get as JsonObject;
  assert.deepEqual(operation("/aliased").parameters, [{ $ref: "#/components/parameters/PreconditionAlias" }]);
  assert.deepEqual(Object.keys(operation("/aliased").responses as JsonObject), ["200", "304"]);
  assert.deepEqual(Object.keys(operation("/modified").responses as JsonObject), ["200", "304"]);
  assert.deepEqual(operation("/looped").parameters, [{ $ref: "#/components/parameters/Loop" }]);
  assert.deepEqual(Object.keys(operation("/looped").responses as JsonObject), ["200"]);
});

test("SDK preparation applies the method surface to the generator input and the RPC manifest, not the contract", () => {
  const source = contract();
  const before = structuredClone(source);
  const { sdk, manifest } = prepareSdk(source);
  assert.deepEqual(source, before);
  const operations = Object.fromEntries(manifest.operations.map((operation) => [operation.operationId, operation]));
  assert.deepEqual(operations.getWidget!.parameters.map(({ wireName }) => wireName), ["widgetId"]);
  assert.deepEqual(Object.keys(operations.getWidget!.responses), ["200"]);
  assert.deepEqual(operations.getConditionalWidget!.parameters.map(({ wireName }) => wireName), ["widgetId", "if-none-match"]);
  assert.deepEqual(Object.keys(operations.getConditionalWidget!.responses), ["200", "304"]);
  const getWidget = ((sdk.paths as Record<string, JsonObject>)["/widgets/{widgetId}"]!.get as JsonObject);
  assert.deepEqual(Object.keys(getWidget.responses as JsonObject), ["200"]);
  assert.equal(JSON.stringify(sdk.paths).toLowerCase().includes("photon-version"), false);
});

const uploadHeaders = [
  { in: "header", name: "content-length", required: true, schema: { type: "string" } },
  { in: "header", name: "Content-Type", required: true, schema: { type: "string" } },
  { in: "header", name: "idempotency-key", required: true, schema: { type: "string" } },
];
const created = { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Widget" } } } };
const uploads = (): JsonObject => ({
  openapi: "3.1.0",
  info: { title: "Fixture", version: "1.0.0" },
  components: {
    schemas: { Widget: { type: "object", properties: { id: { type: "string" } } }, Bytes: { type: "string", format: "binary" } },
    requestBodies: { Upload: { required: true, content: { "multipart/related": { schema: { $ref: "#/components/schemas/Bytes" } } } } },
  },
  paths: {
    "/files": {
      post: {
        operationId: "uploadFile",
        parameters: uploadHeaders,
        requestBody: { required: true, content: { "multipart/related": { schema: { type: "string", format: "binary" } } } },
        responses: { "201": created },
      },
    },
    "/files/referenced": {
      post: { operationId: "uploadReferencedFile", parameters: uploadHeaders, requestBody: { $ref: "#/components/requestBodies/Upload" }, responses: { "201": created } },
    },
    "/files/json": {
      post: {
        operationId: "uploadJsonOrFile",
        parameters: uploadHeaders,
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/Widget" } },
            "multipart/related": { schema: { type: "string", format: "binary" } },
          },
        },
        responses: { "201": created },
      },
    },
  },
});
const parameterNames = (document: JsonObject, path: string): string[] =>
  (((document.paths as Record<string, JsonObject>)[path]!.post as JsonObject).parameters as JsonObject[]).map(({ name }) => String(name));

test("a file upload's method takes neither Content-Type nor Content-Length, which it sets from the body it builds", () => {
  const document = uploads();
  prepareMethodSurface(document);
  assert.deepEqual(parameterNames(document, "/files"), ["idempotency-key"]);
  assert.deepEqual(parameterNames(document, "/files/referenced"), ["idempotency-key"]);
  assert.deepEqual(parameterNames(document, "/files/json"), ["content-length", "Content-Type", "idempotency-key"],
    "a body the SDK sends as JSON keeps its declared headers");
  const { manifest } = prepareSdk(uploads());
  const operation = manifest.operations.find(({ operationId }) => operationId === "uploadFile")!;
  assert.deepEqual(operation.parameters.map(({ wireName }) => wireName), ["idempotency-key"]);
  assert.deepEqual(Object.keys(operation.requestBody!.content), ["multipart/related"]);
});

test("a file upload drops the Content-Type and Content-Length its path declares, and the path's other operations keep them", () => {
  const document = uploads();
  const paths = document.paths as Record<string, JsonObject>;
  const upload = paths["/files"]!.post as JsonObject;
  paths["/files"] = {
    parameters: [
      ...uploadHeaders.slice(0, 2),
      { in: "header", name: "idempotency-key", required: false, schema: { type: "string" } },
      { in: "query", name: "tag", schema: { type: "string" } },
    ],
    post: { ...upload, parameters: [uploadHeaders[2]!] },
    put: { operationId: "replaceFile", requestBody: { required: true, content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } } }, responses: { "201": created } },
  };
  prepareMethodSurface(document);
  const item = paths["/files"]!;
  assert.equal(item.parameters, undefined);
  assert.deepEqual(parameterNames(document, "/files"), ["tag", "idempotency-key"]);
  assert.equal(((item.post as JsonObject).parameters as JsonObject[])[1]!.required, true, "the operation's own parameter overrides the path's");
  assert.deepEqual(((item.put as JsonObject).parameters as JsonObject[]).map(({ name }) => name), ["content-length", "Content-Type", "idempotency-key", "tag"]);
});

test("a path that declares no upload header keeps its parameters at the path", () => {
  const document = uploads();
  const paths = document.paths as Record<string, JsonObject>;
  paths["/files"]!.parameters = [{ in: "query", name: "tag", schema: { type: "string" } }];
  prepareMethodSurface(document);
  assert.deepEqual(paths["/files"]!.parameters, [{ in: "query", name: "tag", schema: { type: "string" } }]);
  assert.deepEqual(parameterNames(document, "/files"), ["idempotency-key"]);
});

test("a file upload whose request body is optional fails generation", () => {
  const document = uploads();
  const upload = (document.paths as Record<string, JsonObject>)["/files"]!.post as JsonObject;
  upload.requestBody = { content: { "multipart/related": { schema: { type: "string", format: "binary" } } } };
  assert.throws(() => prepareMethodSurface(document), /uploadFile request: a multipart\/related file upload's request body must be required/);
});

test("a multipart/related request body that is not raw bytes fails generation", () => {
  const document = uploads();
  const upload = (document.paths as Record<string, JsonObject>)["/files"]!.post as JsonObject;
  upload.requestBody = { required: true, content: { "multipart/related": { schema: { type: "object", properties: { file: { type: "string" } } } } } };
  assert.throws(() => prepareMethodSurface(document), /uploadFile request: a multipart\/related file upload requires an unconstrained or binary schema/);
});
