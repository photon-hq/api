import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import {
  jsonSdkDocument,
  selectJsonMedia,
  selectRequestMedia,
  selectResponseMedia,
  sdkRequestNote,
} from "./media-types.js";
import { isObject, readJson, repositoryRoot, type JsonObject } from "./shared.js";

test("JSON selection is independent of media ordering and preserves the chosen schema", () => {
  const entries = [
    ["application/x-protobuf", { type: "string", format: "binary" }],
    ["application/json", { type: "object" }],
    ["application/vnd.example+json", { type: "array" }],
  ] as const;
  for (const order of [entries, [...entries].reverse()]) {
    assert.deepEqual(
      selectJsonMedia(Object.fromEntries(order), "exportLogs response 200"),
      {
        mediaType: "application/json",
        value: { type: "object" },
      },
    );
  }
});

test("both OTLP endpoints retain only JSON in the SDK view", async () => {
  const fixture = await readJson<JsonObject>(resolve(repositoryRoot, "tools/openapi/fixtures/otlp.json"));
  const projected = jsonSdkDocument(fixture);
  assert(isObject(projected.paths));
  for (const path of Object.values(projected.paths)) {
    assert(isObject(path) && isObject(path.post));
    const operation = path.post;
    assert(isObject(operation.requestBody) && isObject(operation.requestBody.content));
    assert.deepEqual(Object.keys(operation.requestBody.content), ["application/json"]);
    assert(isObject(operation.responses) && isObject(operation.responses["200"]));
    const response = operation.responses["200"];
    assert(isObject(response.content));
    assert.deepEqual(Object.keys(response.content), ["application/json"]);
  }
});

test("JSON selection supports structured suffixes, parameters, and empty content", () => {
  for (const mediaType of [
    "application/schema+json",
    "Application/JSON; charset=utf-8",
  ]) {
    assert.deepEqual(selectJsonMedia({ [mediaType]: "model" }, "request"), {
      mediaType,
      value: "model",
    });
    const content = { "application/x-protobuf": {}, [mediaType]: {} };
    const projected = jsonSdkDocument({ paths: { "/example": { post: {
      requestBody: { content }, responses: {},
    } } } });
    const post = (projected.paths as any)["/example"].post;
    assert.deepEqual(Object.keys(post.requestBody.content), [mediaType]);
    assert.ok(post.description.includes(`JSON (${mediaType})`));
  }
  assert.equal(selectJsonMedia({}, "response 204"), undefined);
});

test("existing single-format uploads retain their request representation", () => {
  assert.deepEqual(
    selectRequestMedia(
      { "multipart/related": "upload" },
      "uploadAttachment request",
    ),
    {
      mediaType: "multipart/related",
      value: "upload",
    },
  );
});

test("SDK dialect adaptation preserves validation and leaves unknown dialects explicit", () => {
  const schemas = {
    Known: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "string",
      minLength: 3,
    },
    Unknown: { $schema: "https://example.com/custom-dialect", type: "object" },
  };
  const document: JsonObject = { paths: {}, components: { schemas } };
  assert.deepEqual(jsonSdkDocument(document), {
    paths: {},
    components: {
      schemas: {
        Known: {
          ...schemas.Known,
          $schema: "https://spec.openapis.org/oas/3.1/dialect/base",
        },
        Unknown: schemas.Unknown,
      },
    },
  });
  assert.equal(
    schemas.Known.$schema,
    "https://json-schema.org/draft/2020-12/schema",
  );
});

test("open JSON response objects are explicit dictionaries so Rust preserves partial success", () => {
  const document: JsonObject = {
    paths: {},
    components: { schemas: {
      ExportLogsResponse200ApplicationJson: { type: "object", additionalProperties: true },
      Closed: { type: "object", additionalProperties: false },
      Typed: { type: "object", additionalProperties: { type: "string" } },
    } },
  };
  assert.deepEqual(jsonSdkDocument(document), {
    paths: {},
    components: { schemas: {
      ExportLogsResponse200ApplicationJson: { type: "object", additionalProperties: {} },
      Closed: { type: "object", additionalProperties: false },
      Typed: { type: "object", additionalProperties: { type: "string" } },
    } },
  });
});

test("unsupported and ambiguous representations fail with operation context", () => {
  assert.throws(
    () =>
      selectJsonMedia(
        { "application/x-protobuf": {} },
        "exportLogs response 200",
      ),
    /exportLogs response 200: no supported JSON media type.*application\/x-protobuf/,
  );
  for (const content of [
    { "application/a+json": {}, "application/b+json": {} },
    { "application/json": {}, "Application/JSON": {} },
  ]) {
    assert.throws(
      () => selectJsonMedia(content, "example request"),
      /ambiguous JSON media types/,
    );
  }
});

test("SDK projection keeps only JSON media, notes dropped request media, and is idempotent without mutating the source", () => {
  const content = {
    "application/x-protobuf": {
      schema: { $ref: "#/components/schemas/Binary" },
    },
    "application/json": { schema: { $ref: "#/components/schemas/Json" } },
  };
  const source: JsonObject = {
    openapi: "3.1.0",
    paths: {
      "/logs": {
        post: {
          operationId: "exportLogs",
          requestBody: { required: true, content },
          responses: {
            "200": { description: "success", content },
            "204": { description: "empty" },
            "400": {
              content: {
                "application/problem+json": { schema: { type: "object" } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: { Json: { type: "object" }, Binary: { type: "string" } },
    },
  };
  const original = structuredClone(source);
  const expected = structuredClone(source) as any;
  expected.paths["/logs"].post.requestBody.content = {
    "application/json": content["application/json"],
  };
  expected.paths["/logs"].post.description = sdkRequestNote(content);
  expected.paths["/logs"].post.responses["200"].content = {
    "application/json": content["application/json"],
  };
  assert.deepEqual(jsonSdkDocument(source), expected);
  assert.deepEqual(source, original);
  assert.deepEqual(jsonSdkDocument(jsonSdkDocument(source)), expected);
});

test("binary download projection preserves bytes and response metadata", () => {
  const content = { "application/octet-stream": { schema: { type: "string", format: "binary" } } };
  const document: JsonObject = { paths: { "/download": { get: {
    operationId: "download", responses: { "200": { content, headers: { "Content-Disposition": { schema: { type: "string" } } } } },
  } } } };
  assert.deepEqual(jsonSdkDocument(document), document);
  assert.deepEqual(selectResponseMedia(content, "download response"), {
    mediaType: "application/octet-stream", value: content["application/octet-stream"],
  });
});

test("SDK error responses retain every JSON body while successful responses still select one", () => {
  const json = { schema: { $ref: "#/components/schemas/GatewayError" } };
  const problem = { schema: { $ref: "#/components/schemas/EndpointProblem" } };
  for (const entries of [
    [["application/problem+json", problem], ["application/json", json]],
    [["application/json", json], ["application/problem+json", problem]],
  ] as const) {
    const content = Object.fromEntries(entries);
    const document: JsonObject = { paths: { "/billing": { get: { operationId: "getBilling", responses: {
      "200": { content }, "403": { description: "Forbidden", headers: { "X-Request-ID": { schema: { type: "string" } } }, content },
    } } } } };
    const original = structuredClone(document);
    const projected = jsonSdkDocument(document);
    assert(isObject(projected.paths) && isObject(projected.paths["/billing"]) && isObject(projected.paths["/billing"].get));
    const responses = projected.paths["/billing"].get.responses;
    assert(isObject(responses));
    assert.deepEqual(responses["200"], { content: { "application/json": json } });
    assert.deepEqual(responses["403"], {
      description: "Forbidden",
      headers: { "X-Request-ID": { schema: { type: "string" } } },
      content: { "application/json": { schema: { $ref: "#/components/schemas/GetBillingResponse403Body" } } },
    });
    assert(isObject(projected.components) && isObject(projected.components.schemas));
    assert.deepEqual(projected.components.schemas.GetBillingResponse403Body, { anyOf: [json.schema, problem.schema] });
    assert.deepEqual(document, original);
    assert.deepEqual(jsonSdkDocument(projected), projected);
  }
});

test("identical error definitions share a union but different validation remains separate", () => {
  const response = (name: string): JsonObject => ({ content: {
    "application/json": { schema: { $ref: "#/components/schemas/Gateway" } },
    "application/problem+json": { schema: { $ref: `#/components/schemas/${name}` } },
  } });
  const problem = { type: "object", required: ["code"], properties: { code: { const: "FORBIDDEN" } } };
  const document: JsonObject = {
    components: { schemas: {
      Gateway: { type: "object", required: ["error"], properties: { error: { type: "string" } } },
      First: problem, Second: structuredClone(problem),
      Different: { ...problem, properties: { code: { const: "RESOURCE_MISMATCH" } } },
    } },
    paths: { "/test": {
      get: { operationId: "first", responses: { "403": response("First") } },
      post: { operationId: "second", responses: { "403": response("Second") } },
      delete: { operationId: "different", responses: { "403": response("Different") } },
    } },
  };
  const result = jsonSdkDocument(document);
  assert(isObject(result.components) && isObject(result.components.schemas));
  assert.deepEqual(Object.keys(result.components.schemas).filter((name) => name.endsWith("Body")), ["FirstResponse403Body", "DifferentResponse403Body"]);
  assert(isObject(result.paths) && isObject(result.paths["/test"]));
  const operation = result.paths["/test"].post;
  assert(isObject(operation) && isObject(operation.responses));
  assert.deepEqual(operation.responses["403"], { content: { "application/json": { schema: { $ref: "#/components/schemas/FirstResponse403Body" } } } });
});

test("wildcard file responses retain the upstream media type, schema, and headers", () => {
  for (const schema of [{}, true, { $ref: "#/components/schemas/Raw" }]) {
    const source: JsonObject = {
      paths: { "/download": { get: { operationId: "download", responses: {
        "200": { content: { "*/*": { schema } }, headers: { "Content-Disposition": { schema: { type: "string" } } } },
      } } } },
      components: { schemas: { Raw: {} } },
    };
    const original = structuredClone(source);
    assert.deepEqual(jsonSdkDocument(source), original);
    assert.deepEqual(source, original);
  }
});

test("wildcard responses do not silently drop typed constraints", () => {
  const source: JsonObject = { paths: { "/download": { get: { operationId: "download", responses: {
    "200": { content: { "*/*": { schema: { type: "object", properties: { value: { type: "string" } } } } } },
  } } } } };
  assert.throws(() => jsonSdkDocument(source), /download response 200: wildcard response requires/);
});
