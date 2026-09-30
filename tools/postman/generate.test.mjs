import assert from "node:assert/strict";
import test from "node:test";
import { generateCollection } from "./generate.mjs";
const schema = {
  openapi: "3.1.0", info: { title: "Fixture", version: "1.0.0" },
  servers: [{ url: "https://api.example.test" }],
  security: [{ accountServiceKey: [] }],
  paths: { "/v1/projects/count": { get: { operationId: "countProjects", summary: "Count projects", responses: { "200": { description: "Count", content: { "application/json": { schema: { type: "object", properties: { count: { type: "integer" } }, required: ["count"] }, example: { count: 2 } } } } } } } },
  components: { securitySchemes: { accountServiceKey: { type: "http", scheme: "bearer" } } },
};

test("converter output is reproducible and credentials are empty", async () => {
  const converter = (await import("openapi-to-postmanv2")).default;
  const first = await generateCollection(schema, converter);
  const second = await generateCollection(schema, converter);
  assert.deepEqual(first, second);
  assert.equal(first.info.version, schema.info.version);
  assert.equal(first.variable.find((item) => item.key === "apiToken").value, "");
  assert.equal(first.variable.find((item) => item.key === "baseUrl").value, schema.servers[0].url);
  const serialized = JSON.stringify(first);
  assert.deepEqual(first.item[0].request.url.path, ["v1", "projects", "count"]);
  assert.ok(serialized.includes("{{apiToken}}"));
  assert.ok(!serialized.includes("_postman_id"));
});

test("conversion does not call the advisory's Faker template evaluator", async () => {
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const collectionRequire = createRequire(require.resolve("postman-collection"));
  const faker = collectionRequire("@faker-js/faker/locale/en");
  const original = faker.fake;
  faker.fake = () => { throw new Error("Faker template evaluation is not permitted"); };
  try {
    const converter = (await import("openapi-to-postmanv2")).default;
    await generateCollection(schema, converter);
  } finally { faker.fake = original; }
});

test("anonymous endpoints stay anonymous and unsupported credentials fail", async () => {
  const converter = (await import("openapi-to-postmanv2")).default;
  const anonymous = structuredClone(schema);
  anonymous.paths["/v1/projects/count"].get.security = [];
  const output = await generateCollection(anonymous, converter);
  assert.deepEqual(output.item[0].request.auth, { type: "noauth" });
  const unsupported = structuredClone(schema);
  unsupported.components.securitySchemes.accountServiceKey = { type: "apiKey", in: "query", name: "secret" };
  await assert.rejects(generateCollection(unsupported, converter), /credential handling/);
});

test("credentials in URL variables and JSON examples are empty", async () => {
  const converter = (await import("openapi-to-postmanv2")).default;
  const input = structuredClone(schema);
  const operation = input.paths["/v1/projects/count"].get;
  delete input.paths["/v1/projects/count"];
  input.paths["/v1/keys/{serviceKey}"] = { get: operation };
  operation.parameters = [{ name: "serviceKey", in: "path", required: true, schema: { type: "string" }, example: `pho_ask_${"a".repeat(32)}` }];
  operation.responses["200"].content["application/json"].example = { count: 2, nested: { clientSecret: "synthetic-secret", value: `pho_sk_${"b".repeat(32)}` } };
  const before = structuredClone(input);
  const output = await generateCollection(input, converter);
  const item = output.item[0];
  assert.equal(item.request.url.variable[0].value, "");
  assert.equal(item.response[0].originalRequest.url.variable[0].value, "");
  assert.deepEqual(JSON.parse(item.response[0].body), { count: 2, nested: { clientSecret: "", value: "" } });
  assert.deepEqual(input, before, "The saved contract must not be scrubbed or rewritten");
});

test("converter-only dialect adaptation preserves schema validation and literal examples", async () => {
  const { postmanInput } = await import("./generate.mjs");
  const original = { components: { schemas: { Item: {
    $schema: "https://json-schema.org/draft/2020-12/schema", type: "object",
    required: ["name"], properties: { name: { type: "string", minLength: 2 } },
    example: { $schema: "literal-data" },
  } } } };
  const adapted = postmanInput(original);
  assert.equal(adapted.components.schemas.Item.$schema, undefined);
  assert.equal(original.components.schemas.Item.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.deepEqual(adapted.components.schemas.Item.example, original.components.schemas.Item.example);
  assert.deepEqual(adapted.components.schemas.Item.properties, original.components.schemas.Item.properties);
});

test("examples honor constants and tuples and optional parameters start disabled", async () => {
  const input = structuredClone(schema);
  const operation = input.paths["/v1/projects/count"].get;
  operation.parameters = [
    { name: "required", in: "query", required: true, schema: { type: "string" } },
    { name: "pageToken", in: "query", schema: { type: "string" } },
    { name: "Optional-Header", in: "header", schema: { type: "string" } },
  ];
  operation.requestBody = { required: true, content: { "application/json": { schema: {
    type: "object", required: ["kind", "consent", "events", "phoneNumber"], properties: {
      kind: { type: "string", const: "sms" }, consent: { type: "boolean", const: true },
      events: { type: "array", prefixItems: [{ type: "string", const: "message.created" }], items: false },
      phoneNumber: { type: "string", pattern: "^[+\\d][\\d\\s().-]{6,24}$" },
    },
  } } } };
  const before = structuredClone(input);
  const converter = (await import("openapi-to-postmanv2")).default;
  const output = await generateCollection(input, converter);
  const request = output.item[0].request;
  const body = JSON.parse(request.body.raw);
  assert.equal(body.kind, "sms");
  assert.equal(body.consent, true);
  assert.deepEqual(body.events, ["message.created"]);
  assert.match(body.phoneNumber, /^[+\d][\d\s().-]{6,24}$/);
  assert.equal(request.url.query.find((item) => item.key === "pageToken").disabled, true);
  assert.ok(!request.url.query.find((item) => item.key === "required").disabled);
  assert.equal(request.header.find((item) => item.key === "Optional-Header").disabled, true);
  assert.deepEqual(input, before);
});

test("tuple entries that reference a component get that component's example", async () => {
  const input = structuredClone(schema);
  input.components ??= {};
  input.components.schemas = { ...input.components.schemas,
    Wildcard: { type: "string", const: "*" },
    EventName: { type: "string", pattern: "^[a-z]+\\.[a-z]+$" },
    Selection: { anyOf: [
      { type: "array", prefixItems: [{ $ref: "#/components/schemas/Wildcard" }] },
      { type: "array", items: { $ref: "#/components/schemas/EventName" }, minItems: 1 },
    ] },
  };
  input.paths["/v1/projects/count"].get.requestBody = { required: true, content: { "application/json": { schema: {
    type: "object", required: ["events", "direct"], properties: {
      events: { $ref: "#/components/schemas/Selection" },
      direct: { type: "array", prefixItems: [{ $ref: "#/components/schemas/Wildcard" }] },
    },
  } } } };
  const before = structuredClone(input);
  const converter = (await import("openapi-to-postmanv2")).default;
  const body = JSON.parse((await generateCollection(input, converter)).item[0].request.body.raw);
  assert.deepEqual(body.events, ["*"]);
  assert.deepEqual(body.direct, ["*"]);
  assert.deepEqual(input, before);
});

test("email examples satisfy lookaheads without overriding authored values or constraints", async () => {
  const { postmanInput } = await import("./generate.mjs");
  const email = { type: "string", format: "email", pattern: "^(?!\\.)(?!.*\\.\\.)[A-Za-z0-9_.+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", maxLength: 254 };
  const input = structuredClone(schema);
  input.paths["/v1/projects/count"].get.requestBody = { required: true, content: { "application/json": { schema: {
    type: "object", required: ["email"], properties: { email },
  } } } };
  const before = structuredClone(input);
  const converter = (await import("openapi-to-postmanv2")).default;
  const output = await generateCollection(input, converter);
  const example = JSON.parse(output.item[0].request.body.raw).email;
  assert.equal(example, "person@example.com");
  assert.match(example, new RegExp(email.pattern));
  assert.deepEqual(input, before);
  for (const constraint of [
    { example: "authored@example.org" }, { examples: ["authored@example.org"] },
    { default: "authored@example.org" }, { enum: ["authored@example.org"] },
    { minLength: 30 }, { maxLength: 10 }, { pattern: "@example\\.org$" },
    { allOf: [{ pattern: "@example\\.org$" }] },
  ]) {
    const value = { ...email, ...constraint };
    assert.deepEqual(postmanInput(value), value);
  }
});

test("response examples omit forbidden properties and use valid date-time and uri-reference values", async () => {
  const { sourceValidator } = await import("./source-schema.mjs");
  const { postmanInput } = await import("./generate.mjs");
  const input = structuredClone(schema);
  input.components.schemas = {
    Forbidden: { not: {} },
    Problem: { type: "object", additionalProperties: false, required: ["code", "createdAt", "schemaUrl"], properties: {
      code: { type: "string", const: "FORBIDDEN" },
      createdAt: { type: "string", format: "date-time" },
      schemaUrl: { type: "string", format: "uri-reference", pattern: "^\\/v1\\/projects\\/.*" },
      remediation: { not: {} }, acceptance: { $ref: "#/components/schemas/Forbidden" }, retired: false,
    } },
  };
  input.paths["/v1/projects/count"].get.responses["200"].content["application/json"] = { schema: { $ref: "#/components/schemas/Problem" } };
  const before = structuredClone(input);
  const output = await generateCollection(input, (await import("openapi-to-postmanv2")).default);
  const body = JSON.parse(output.item[0].response[0].body);
  assert.deepEqual(Object.keys(body).sort(), ["code", "createdAt", "schemaUrl"]);
  assert.equal(body.createdAt, "2000-01-01T00:00:00Z");
  assert.equal(body.schemaUrl, "/v1/projects/example");
  sourceValidator(input)("#/components/schemas/Problem", body, "Response body");
  assert.deepEqual(input, before, "The saved contract keeps its forbidden properties");
  // A forbidden property that is also required makes the schema unsatisfiable;
  // leave it for the source check to report instead of hiding the conflict.
  const required = { type: "object", required: ["remediation"], properties: { remediation: { not: {} } } };
  assert.deepEqual(postmanInput(required), required);
});

test("allOf examples use a union alternative compatible with sibling branches", async () => {
  const { sourceValidator } = await import("./source-schema.mjs");
  const { postmanInput } = await import("./generate.mjs");
  const input = structuredClone(schema);
  const closed = (properties, required = Object.keys(properties)) => ({ type: "object", additionalProperties: false, required, properties });
  input.components.schemas = {
    // The converter would pick each first alternative, whose status and
    // content type conflict with the refinements below.
    Content: { anyOf: [
      closed({ type: { type: "string", const: "text" }, text: { type: "string" } }),
      closed({ type: { type: "string", const: "typing" }, typing: { type: "boolean" }, note: { type: "string" } }, ["type", "typing"]),
    ] },
    Event: { anyOf: [
      { oneOf: ["received", "dispatched"].map((status) => closed({
        platform: { type: "string", const: "sms" }, status: { type: "string", const: status },
        content: { $ref: "#/components/schemas/Content" }, details: closed({ carrier: { type: "string" } }),
      })) },
      closed({ platform: { type: "string", const: "email" }, status: { type: "string", const: "received" }, content: { $ref: "#/components/schemas/Content" }, details: closed({ subject: { type: "string" } }) }),
    ], "x-photon-extension": { discriminator: "platform" } },
  };
  input.paths["/v1/projects/count"].get.responses["200"].content["application/json"] = { schema: { allOf: [
    { $ref: "#/components/schemas/Event" },
    { type: "object", required: ["platform"], properties: { platform: { type: "string", enum: ["email", "sms", "whatsapp"] } } },
    { type: "object", required: ["status", "content"], properties: {
      status: { type: "string", enum: ["dispatched", "failed"] },
      content: closed({ type: { type: "string", const: "typing" }, typing: { type: "boolean" } }),
    } },
  ] } };
  const before = structuredClone(input);
  const output = await generateCollection(input, (await import("openapi-to-postmanv2")).default);
  const body = JSON.parse(output.item[0].response[0].body);
  // The selection is by declaration order, so repeated runs pick the same branch.
  assert.equal(body.platform, "sms");
  assert.equal(body.status, "dispatched");
  assert.deepEqual(Object.keys(body.content).sort(), ["type", "typing"], "Omits the property the closed refinement forbids");
  assert.equal(body.content.type, "typing");
  sourceValidator(input)("#/paths/~1v1~1projects~1count/get/responses/200/content/application~1json/schema", body, "Response body");
  assert.deepEqual(input, before, "The saved contract keeps its unions and order");
  // Compatible branches without unions are passed through unchanged.
  const plain = { components: { schemas: {
    A: { allOf: [{ $ref: "#/components/schemas/B" }, { type: "object", properties: { id: { type: "string" } } }] },
    B: { type: "object", properties: { id: { type: "string" } } },
  } } };
  assert.deepEqual(postmanInput(plain), plain);
});

test("an unsatisfiable allOf is left for the source check to report", async () => {
  const { postmanInput } = await import("./generate.mjs");
  // A closed refinement that omits the base's required properties accepts no
  // instance of the base, so no example can satisfy both branches.
  const original = { components: { schemas: {
    User: { anyOf: [{ type: "object", additionalProperties: false, required: ["id", "platform"], properties: { id: { type: "string" }, platform: { enum: ["sms"] } } }] },
    Response: { allOf: [{ $ref: "#/components/schemas/User" }, { type: "object", additionalProperties: false, required: ["platform"], properties: { platform: { enum: ["sms", "email"] } } }] },
  } } };
  assert.deepEqual(postmanInput(original), original);
});

test("attachment examples contain two correctly framed parts with exact file size", async () => {
  const input = structuredClone(schema);
  const operation = input.paths["/v1/projects/count"].get;
  operation.operationId = "uploadAttachment";
  operation.description = "Uploads exact attachment bytes.";
  operation.parameters = [{ in: "header", name: "Content-Length", schema: { type: "integer" } }];
  operation.requestBody = { required: true, content: { "multipart/related": { schema: { type: "string", format: "binary" } } } };
  const output = await generateCollection(input, (await import("openapi-to-postmanv2")).default);
  const item = output.item[0];
  assert.match(item.request.description, /Uploads exact attachment bytes/);
  assert.ok(!item.request.description.includes("[object Object]"));
  for (const request of [item.request, ...item.response.map((response) => response.originalRequest)]) {
    assert.ok(!request.header.some((header) => /^content-length$/i.test(header.key)));
    const type = request.header.find((header) => /^content-type$/i.test(header.key)).value;
    const boundary = type.split("boundary=")[1];
    const parts = request.body.raw.split(`--${boundary}`);
    assert.equal(parts.length, 4);
    assert.equal(parts[0], "");
    assert.equal(parts[3], "--\r\n");
    const metadata = JSON.parse(parts[1].split("\r\n\r\n")[1]);
    const file = parts[2].split("\r\n\r\n")[1].slice(0, -2);
    assert.equal(metadata.filename, "hello.txt");
    assert.equal(metadata.contentType, "text/plain");
    assert.equal(metadata.sizeBytes, Buffer.byteLength(file));
    assert.equal(file, "Hello from Photon.\n");
  }
});

test("isolated CLI reproduces patterned examples", async (t) => {
  const { mkdtemp, mkdir, readFile, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { execFileSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const root = await mkdtemp(join(tmpdir(), "photon-postman-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "openapi"));
  await mkdir(join(root, "config"));
  await writeFile(join(root, "config/sdk.json"), '{"environment":"production","schemaPath":"openapi/openapi.json"}');
  const input = structuredClone(schema);
  input.paths["/v1/projects/count"].get.parameters = [{ name: "trace", in: "query", schema: { type: "string", pattern: "^[a-f0-9]{32}$" } }];
  await writeFile(join(root, "openapi/openapi.json"), JSON.stringify(input));
  const run = () => execFileSync(process.execPath, [fileURLToPath(new URL("./run.mjs", import.meta.url))], { cwd: root, env: { ...process.env, PHOTON_TEST_SECRET: "not-for-generation" }, stdio: "pipe" });
  run();
  const first = await readFile(join(root, "postman/collection.json"), "utf8");
  run();
  assert.equal(await readFile(join(root, "postman/collection.json"), "utf8"), first);
  assert.ok(!first.includes("not-for-generation"));
});
