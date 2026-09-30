import assert from "node:assert/strict";
import test from "node:test";
import { operationMedia, renderPython } from "./generate-facades.js";
import { jsonSdkDocument, selectResponseMedia } from "./media-types.js";
import { hoistOperationSchemas, manifestOperation } from "./prepare-sdk.js";
import { type JsonObject } from "./shared.js";
import { successResponses } from "./success-responses.js";

test("OpenAPI 3.1 raw responses preserve the contract and binary SDK types", () => {
  for (const mediaType of ["*/*", "application/octet-stream"]) {
    for (const media of [{}, { schema: {} }, { schema: true }]) {
      const operation: JsonObject = {
        operationId: "download",
        responses: { "200": {
          description: "The file bytes.",
          headers: { "Content-Disposition": { schema: { type: "string" } } },
          content: { [mediaType]: structuredClone(media) },
        } },
      };
      const schemas: JsonObject = {};
      hoistOperationSchemas("download", operation, schemas);
      const model = "DownloadResponse200ApplicationOctetStream";
      assert.deepEqual(schemas[model], {});
      const manifest = manifestOperation("/download", "get", {}, operation);
      assert.deepEqual(manifest.responses["200"], { [mediaType]: `#/components/schemas/${model}` });
      assert.deepEqual(successResponses("download", manifest.responses), [
        { status: "200", exactStatus: 200, binary: true },
      ]);
      assert.deepEqual(operationMedia(manifest), { responses: [mediaType], accept: [mediaType], responseKinds: { "200": "binary" } });
      const python = renderPython({ operations: [manifest] });
      assert.match(python, /"200": bytes/);
      assert.doesNotMatch(python, /TypeAdapter\(models\.DownloadResponse/);

      const document: JsonObject = { paths: { "/download": { get: operation } }, components: { schemas } };
      const original = structuredClone(document);
      assert.deepEqual(jsonSdkDocument(document), original);
      assert.deepEqual(document, original);
      assert.deepEqual(jsonSdkDocument(jsonSdkDocument(document)), original);
    }
  }
});

test("raw response projection preserves shared source schemas and media metadata", () => {
  const document: JsonObject = {
    paths: { "/download": { get: { responses: { "200": { content: {
      "*/*": { schema: { $ref: "#/components/schemas/Download" }, example: "file bytes" },
    } } } } } },
    components: { schemas: {
      Download: { $ref: "#/components/schemas/Shared", description: "File bytes" },
      Shared: {},
    } },
  };
  const projected = jsonSdkDocument(document) as any;
  assert.deepEqual(projected.components.schemas.Shared, {});
  assert.equal(projected.paths["/download"].get.responses["200"].content["*/*"].example, "file bytes");
  assert.deepEqual(projected, document);
  assert.deepEqual((document.components as any).schemas.Download, { $ref: "#/components/schemas/Shared", description: "File bytes" });
});

test("mixed JSON and wildcard responses still select the explicit JSON representation", () => {
  const json = { schema: { type: "object" } };
  for (const entries of [
    [["*/*", { schema: {} }], ["application/json", json]],
    [["application/json", json], ["*/*", { schema: {} }]],
  ] as const) {
    assert.deepEqual(selectResponseMedia(Object.fromEntries(entries), "mixed response"), { mediaType: "application/json", value: json });
  }
});

test("raw projection fails rather than erasing constrained or unresolved schemas", () => {
  for (const schema of [false, { type: "object" }, { contentEncoding: "base64" }, { $ref: "#/components/schemas/Missing" }, { $ref: "#/components/schemas/Cycle" }]) {
    const document: JsonObject = {
      paths: { "/download": { get: { operationId: "download", responses: { "200": { content: { "*/*": { schema } } } } } } },
      components: { schemas: { Cycle: { $ref: "#/components/schemas/Cycle" } } },
    };
    assert.throws(() => jsonSdkDocument(document), /download response 200: wildcard response requires an unconstrained or binary schema/);
  }
});


test("raw responses preserve schema annotations without adding validation constraints", () => {
  for (const mediaType of ["*/*", "application/octet-stream"]) {
    for (const shape of [{}, { type: "string", format: "binary" }]) {
      const document: JsonObject = {
        paths: { "/download": { get: { operationId: "download", responses: {
          "200": { content: { [mediaType]: { schema: {
            ...shape, description: "File bytes", example: "example bytes", default: "default bytes",
          } } } },
        } } } },
      };
      assert.deepEqual(jsonSdkDocument(document), document);
    }
  }
});
