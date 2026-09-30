import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { checkCollection, checkCollectionSource, checkCollectionResponsesSource } from "./check-collection.mjs";

test("collection checks reject broken examples, missing operations and enabled optional queries", () => {
  const schema = { openapi: "3.1.0", paths: { "/items": { post: { operationId: "createItem",
    parameters: [{ in: "query", name: "pageToken", schema: { type: "string" } }],
    requestBody: { content: { "application/json": { schema: { type: "object", properties: {
      kind: { const: "sms" }, token: { type: "string", minLength: 1 },
    }, required: ["kind", "token"], additionalProperties: false } } } },
  } } } };
  const collection = { item: [{ request: { method: "POST", url: { path: ["items"], query: [{ key: "pageToken", disabled: true }] },
    header: [{ key: "Content-Type", value: "application/json" }],
    body: { mode: "raw", raw: JSON.stringify({ kind: "sms", token: "" }) },
  } }] };
  const validators = { CreateItemInputSchema: z.object({ body: z.strictObject({ kind: z.literal("sms"), token: z.string().min(1) }) }) };
  const expected = { operations: 1, jsonBodies: 1, formBodies: 0, rawBodies: 0, headers: 0,
    responses: { examples: 0, jsonBodies: 0, emptyBodies: 0, rawBodies: 0 } };
  assert.deepEqual(checkCollection(schema, collection, validators), expected);
  assert.equal(JSON.parse(collection.item[0].request.body.raw).token, "");
  const invitationValidators = { CreateItemInputSchema: z.object({ body: z.strictObject({ kind: z.literal("sms"), token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }) }) };
  assert.deepEqual(checkCollection(schema, collection, invitationValidators), expected);
  assert.equal(JSON.parse(collection.item[0].request.body.raw).token, "");
  const broken = structuredClone(collection);
  broken.item[0].request.body.raw = '{"kind":"string","token":""}';
  assert.throws(() => checkCollection(schema, broken, validators), /createItem/);
  assert.throws(() => checkCollection(schema, { item: [] }, validators), /coverage/);
  broken.item[0].request.body.raw = collection.item[0].request.body.raw;
  broken.item[0].request.url.query[0].disabled = false;
  assert.throws(() => checkCollection(schema, broken, validators), /Query default/);
});

function fixture(bodySchema, value, media = "application/json") {
  const schema = { openapi: "3.1.0", paths: { "/items": { post: { operationId: "createItem",
    requestBody: { required: true, content: { [media]: { schema: bodySchema } } },
  } } } };
  const request = { method: "POST", url: { path: ["items"] },
    header: [{ key: "Content-Type", value: media }], body: { mode: "raw", raw: JSON.stringify(value) } };
  return { schema, collection: { item: [{ request }] }, request, operation: schema.paths["/items"].post };
}

test("source constraints reject examples accepted by a permissive generated validator", () => {
  const { schema, collection, request } = fixture({ $ref: "#/components/schemas/Input" }, { labels: { one: 42 }, state: "ready" });
  schema.components = { schemas: { Input: { type: "object", properties: {
    labels: { type: "object", additionalProperties: { type: "string" } },
    state: { enum: ["ready", "queued"] },
    detail: { type: ["string", "null"] },
  }, required: ["labels", "state"], additionalProperties: false } } };
  const validators = { CreateItemInputSchema: z.object({ body: z.any() }) };
  assert.throws(() => checkCollection(schema, collection, validators), /source schema.*must be string/);
  request.body.raw = JSON.stringify({ labels: { one: "yes" }, state: "invented" });
  assert.throws(() => checkCollection(schema, collection, validators), /allowed values/);
  request.body.raw = JSON.stringify({ labels: { one: "yes" }, state: "ready", detail: null });
  const before = structuredClone({ schema, collection });
  assert.equal(checkCollection(schema, collection, validators).jsonBodies, 1);
  assert.deepEqual({ schema, collection }, before);
  assert.throws(() => checkCollection(schema, collection, { CreateItemInputSchema: z.object({ body: z.never() }) }), /SDK schema/);
});

test("original tuple, null, union and format assertions remain effective", () => {
  const { schema, collection, request } = fixture({ $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "array", prefixItems: [{ const: "ready" }, { type: "null" }], minItems: 2, items: false,
  }, ["ready", null]);
  assert.equal(checkCollectionSource(schema, collection).jsonBodies, 1);
  request.body.raw = '["ready",null,"extra"]';
  assert.throws(() => checkCollectionSource(schema, collection), /more than 2 items/);
  schema.paths["/items"].post.requestBody.content["application/json"].schema = {
    oneOf: [{ type: "string", format: "email" }, { type: "null" }],
  };
  request.body.raw = '"person@example.com"';
  assert.equal(checkCollectionSource(schema, collection).jsonBodies, 1);
  request.body.raw = '"not-an-email"';
  assert.throws(() => checkCollectionSource(schema, collection), /format.*email/);
});

test("a matching date-time pattern does not replace the format assertion", () => {
  const { schema, collection, request } = fixture({ type: "string", format: "date-time",
    pattern: "^2026-09-22T10:30(?::00)?Z$", "x-photon-extension": true,
  }, "2026-09-22T10:30Z");
  schema.components = { schemas: { Other: { type: "string", "x-photon-extension": true } } };
  assert.throws(() => checkCollectionSource(schema, collection), /format.*date-time/);
  request.body.raw = '"2026-09-22T10:30:00Z"';
  assert.equal(checkCollectionSource(schema, collection).jsonBodies, 1);
});

test("form examples validate the actual grant branch and preserve empty credentials", () => {
  const { schema, collection, request } = fixture({ oneOf: [
    { type: "object", properties: { grant_type: { const: "refresh_token" }, refresh_token: { type: "string", minLength: 1 } }, required: ["grant_type", "refresh_token"], additionalProperties: false },
    { type: "object", properties: { grant_type: { const: "device_code" }, device_code: { type: "string" } }, required: ["grant_type", "device_code"], additionalProperties: false },
  ] }, {}, "application/x-www-form-urlencoded");
  request.body = { mode: "urlencoded", urlencoded: [{ key: "grant_type", value: "refresh_token" }, { key: "refresh_token", value: "" }] };
  const before = structuredClone(collection);
  assert.equal(checkCollectionSource(schema, collection).formBodies, 1);
  assert.deepEqual(collection, before);
  request.body.urlencoded[0].value = "device_code";
  assert.throws(() => checkCollectionSource(schema, collection), /source schema/);
  request.header[0].value = "text/plain";
  assert.throws(() => checkCollectionSource(schema, collection), /Undeclared request media type/);
});

test("required headers and inline binary byte length are checked against the source", () => {
  const { schema, collection, request, operation } = fixture({ type: "string", format: "binary", minLength: 1 }, null, "multipart/related");
  request.body.raw = "--sample\r\n\r\né\r\n--sample--\r\n";
  request.header[0].value = "multipart/related; boundary=sample";
  request.header.push({ key: "Idempotency-Key", value: "test-request" });
  operation.parameters = [
    { in: "header", name: "content-length", required: true, schema: { type: "string", pattern: "^[1-9][0-9]*$" } },
    { in: "header", name: "content-type", required: true, schema: { type: "string", maxLength: 512 } },
    { in: "header", name: "idempotency-key", required: true, schema: { type: "string", minLength: 8 } },
  ];
  const before = structuredClone(collection);
  assert.deepEqual(checkCollectionSource(schema, collection), { operations: 1, jsonBodies: 0, formBodies: 0, rawBodies: 1, headers: 3 });
  assert.deepEqual(collection, before);
  request.header.push({ key: "Content-Length", value: String(request.body.raw.length) });
  assert.throws(() => checkCollectionSource(schema, collection), /Content-Length does not match/);
  request.header.pop();
  request.header[1].disabled = true;
  assert.throws(() => checkCollectionSource(schema, collection), /Disabled required header/);
  request.header[1].disabled = false;
  request.header[1].value = "short";
  assert.throws(() => checkCollectionSource(schema, collection), /fewer than 8 characters/);
  request.header.pop();
  assert.throws(() => checkCollectionSource(schema, collection), /Missing required header/);
});

test("path parameter overrides and referenced OpenAPI objects retain their schema locations", () => {
  const { schema, collection, request, operation } = fixture({ type: "object" }, {});
  schema.components = { parameters: { Key: { in: "header", name: "x-key", required: true, schema: { const: "new" } } },
    requestBodies: { Input: operation.requestBody } };
  schema.paths["/items"].parameters = [{ in: "header", name: "x-key", required: true, schema: { const: "old" } }];
  operation.parameters = [{ $ref: "#/components/parameters/Key" }];
  operation.requestBody = { $ref: "#/components/requestBodies/Input" };
  request.header.push({ key: "X-Key", value: "new" });
  assert.equal(checkCollectionSource(schema, collection).headers, 1);
  request.header[1].value = "old";
  assert.throws(() => checkCollectionSource(schema, collection), /#\/components\/parameters\/Key\/schema/);
});

test("missing bodies, duplicates and unsupported assertions never pass silently", () => {
  const { schema, collection, request } = fixture({ type: "object" }, {});
  collection.item.push(collection.item[0]);
  assert.throws(() => checkCollectionSource(schema, collection), /Duplicate operation/);
  collection.item.pop();
  request.body = {};
  assert.throws(() => checkCollectionSource(schema, collection), /Missing required request body/);
  request.body = { mode: "file", file: { src: "some-file" } };
  assert.throws(() => checkCollectionSource(schema, collection), /external files are not validated/);
  request.body = { mode: "raw", raw: "{}" };
  schema.paths["/items"].post.requestBody.content["application/json"].schema.misspelledAssertion = true;
  assert.throws(() => checkCollectionSource(schema, collection), /unknown keyword.*misspelledAssertion/);
});

function responseFixture(bodySchema, value) {
  const operation = { operationId: "getItem", responses: {
    200: { description: "Example", content: { "application/json": { schema: bodySchema } } },
  } };
  const schema = { openapi: "3.1.0", paths: { "/items": { get: operation } } };
  const response = { code: 200, header: [{ key: "Content-Type", value: "application/json; charset=utf-8" }], body: JSON.stringify(value) };
  const item = { request: { method: "GET", url: { path: ["items"] } }, response: [response] };
  return { schema, collection: { item: [{ name: "Items", item: [item] }] }, operation, item, response };
}

test("saved response checks enforce forbidden properties and date-time formats", () => {
  const { schema, collection, response } = responseFixture({ type: "object", properties: {
    remediation: { not: {} },
    createdAt: { type: "string", format: "date-time", pattern: "^2026-01-01T00:00(?::00)?Z$" },
    token: { type: "string", minLength: 43 },
  }, required: ["createdAt", "token"], additionalProperties: false }, { createdAt: "2026-01-01T00:00:00Z", token: "" });
  const before = structuredClone({ schema, collection });
  assert.deepEqual(checkCollectionResponsesSource(schema, collection), { examples: 1, jsonBodies: 1, emptyBodies: 0, rawBodies: 0 });
  assert.deepEqual({ schema, collection }, before);
  response.body = JSON.stringify({ createdAt: "2026-01-01T00:00:00Z", token: "", remediation: "" });
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /getItem response 200.*remediation must NOT be valid/);
  response.body = JSON.stringify({ createdAt: "2026-01-01T00:00Z", token: "" });
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /format.*date-time/);
  // The combined check must run response validation even for bodyless requests.
  assert.throws(() => checkCollection(schema, collection, {}), /format.*date-time/);
});

test("closed allOf branches and mismatched union examples remain failures", () => {
  const { schema, collection, response, operation } = responseFixture({ allOf: [
    { type: "object", properties: { id: { type: "string" }, platform: { const: "sms" } }, required: ["id", "platform"] },
    { type: "object", properties: { platform: { const: "sms" } }, additionalProperties: false },
  ] }, { id: "example", platform: "sms" });
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /additional properties/);
  response.body = '{"platform":"sms"}';
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /required property 'id'/);
  operation.responses[200].content["application/json"].schema = { oneOf: [
    { type: "object", properties: { platform: { const: "sms" }, details: { const: "phone" } }, required: ["platform", "details"] },
    { type: "object", properties: { platform: { const: "email" }, details: { const: "mailbox" } }, required: ["platform", "details"] },
  ] };
  response.body = '{"platform":"email","details":"phone"}';
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /oneOf/);
  response.body = '{"platform":"email","details":"mailbox"}';
  assert.equal(checkCollectionResponsesSource(schema, collection).jsonBodies, 1);
});

test("response status precedence, references and coverage use original declarations", () => {
  const { schema, collection, operation, item, response } = responseFixture({ const: "exact" }, "exact");
  schema.components = { responses: { OtherSuccess: { description: "Other success", content: { "application/json": { schema: { const: "range" } } } } } };
  operation.responses["2XX"] = { $ref: "#/components/responses/OtherSuccess" };
  operation.responses.default = { description: "Other status", content: { "application/json": { schema: { const: "default" } } } };
  const range = { ...structuredClone(response), code: 201, body: '"range"' };
  item.response.push(range, { ...structuredClone(response), code: 500, body: '"default"' });
  assert.equal(checkCollectionResponsesSource(schema, collection).examples, 3);
  delete item.response[2].code;
  assert.equal(checkCollectionResponsesSource(schema, collection).examples, 3);
  range.body = '"bad"';
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /#\/components\/responses\/OtherSuccess\/content/);
  range.body = '"range"';
  response.body = '"range"';
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /responses\/200\/content/);
  response.body = '"exact"';
  item.response.pop();
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Missing saved response example for default/);
  delete operation.responses.default;
  item.response.push({ ...structuredClone(response), code: 404 });
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Undeclared response status/);
  item.response.pop();
  response.code = "200";
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Invalid response status/);
});

test("response media precedence, raw bodies and empty responses cannot bypass validation", () => {
  const { schema, collection, operation, response } = responseFixture({ const: "exact" }, "exact");
  const content = operation.responses[200].content;
  content["application/*"] = { schema: { const: "fallback" } };
  content["text/plain"] = { schema: { type: "string", minLength: 4 } };
  response.body = '"fallback"';
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /equal to constant/);
  response.header[0].value = "application/problem+json";
  assert.equal(checkCollectionResponsesSource(schema, collection).jsonBodies, 1);
  response.header[0].value = "text/plain";
  response.body = "example";
  assert.equal(checkCollectionResponsesSource(schema, collection).rawBodies, 1);
  response.body = "x";
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /fewer than 4 characters/);
  response.header[0].value = "image/png";
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Undeclared response media type/);
  response.header = [];
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Missing or duplicate active response Content-Type/);
  delete operation.responses[200].content;
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Body supplied for an empty response/);
  response.body = "";
  assert.equal(checkCollectionResponsesSource(schema, collection).emptyBodies, 1);
});

test("malformed or absent response JSON and schemas are reported with the operation and status", () => {
  const { schema, collection, operation, response } = responseFixture({ type: "object" }, {});
  response.body = "{";
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /getItem response 200/);
  delete response.body;
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Missing inline response body/);
  response.body = "{}";
  delete operation.responses[200].content["application/json"].schema;
  assert.throws(() => checkCollectionResponsesSource(schema, collection), /Missing source response schema/);
});
