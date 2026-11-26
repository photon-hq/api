import assert from "node:assert/strict";
import test from "node:test";
import { Webhook } from "standardwebhooks";
import {
  answer, checkDelivery, checkResponse, collectExamples, createMock, ENVIRONMENT, extractBlocks, readContract, redirectBuilders, SKIP_MARKER,
  strictClients, webhookDeliveries,
} from "./check-docs-examples.mjs";

const page = `---
title: "Example"
---

<CodeGroup>
\`\`\`typescript TypeScript
console.log("ts");
\`\`\`

\`\`\`python Python
print("py")
\`\`\`
</CodeGroup>

\`\`\`sh
npm install
\`\`\`

${SKIP_MARKER}
\`\`\`ts
fragment(
\`\`\`

  \`\`\`rust Rust
  fn main() {}
  \`\`\`
`;

const bearer = (token) => ({ authorization: `Bearer ${token}` });
const accountKey = bearer(ENVIRONMENT.PHOTON_API_KEY);
const projectKey = bearer(ENVIRONMENT.PHOTON_PROJECT_API_KEY);
const accessToken = bearer(ENVIRONMENT.PHOTON_ACCESS_TOKEN);
const projects = `/v1/organizations/${ENVIRONMENT.PHOTON_ORGANIZATION_ID}/projects`;
const json = { "content-type": "application/json" };
const createProject = (headers, body) => answer({ method: "POST", url: projects, headers: { ...json, ...headers }, body });

test("every block of the language is checked, except other languages and skipped fragments", () => {
  assert.deepEqual(extractBlocks(page, "typescript"), [{ line: 6, code: 'console.log("ts");\n' }]);
  assert.deepEqual(extractBlocks(page, "python"), [{ line: 10, code: 'print("py")\n' }]);
  assert.deepEqual(extractBlocks(page, "rust"), [{ line: 24, code: "fn main() {}\n" }]);
  assert.throws(() => extractBlocks("```ts\nopen\n", "typescript"), /Unclosed code block/);
});

test("the mock serves the guide's operations to the credentials their security requirements accept", () => {
  const anonymous = answer({ method: "GET", url: projects, headers: {} });
  assert.equal(anonymous.body.code, "NOT_AUTHENTICATED");
  // The example that sent it fails: no guide request goes without a credential its operation accepts.
  assert.equal(anonymous.rejected, "listProjects without a credential it accepts");
  assert.equal(answer({ method: "GET", url: `/v1/projects/${ENVIRONMENT.PHOTON_PROJECT_ID}`, headers: projectKey }).status, 200);
  assert.equal(answer({ method: "GET", url: projects, headers: projectKey }).unexpected, "listProjects with the projectApiKey credential");
  assert.equal(answer({ method: "GET", url: "/v1/account", headers: accessToken }).status, 200);
  assert.equal(answer({ method: "GET", url: projects, headers: accessToken }).unexpected, "listProjects with the oauth2 credential");
  assert.equal(answer({ method: "DELETE", url: projects, headers: accountKey }).unexpected, `DELETE ${projects}`);
});

test("the mock validates each request against its operation", () => {
  assert.equal(answer({ method: "GET", url: `${projects}?pageSize=100`, headers: accountKey }).status, 200);
  assert.equal(answer({ method: "GET", url: `${projects}?pageSize=0`, headers: accountKey }).unexpected, "listProjects request: query pageSize must be >= 1");
  assert.equal(answer({ method: "GET", url: `${projects}?limit=10`, headers: accountKey }).unexpected, "listProjects request: query limit is not a parameter");
  assert.equal(answer({ method: "GET", url: `${projects}?pageSize=100&pageSize=0`, headers: accountKey }).unexpected, "listProjects request: query pageSize is repeated");
  const body = '{"name":"Support","slug":"support"}';
  assert.equal(createProject(accountKey, body).unexpected, "createProject request: header Idempotency-Key is required");
  const keyed = { ...accountKey, "idempotency-key": "k" };
  assert.equal(createProject(keyed, '{"name":"Support"}').unexpected, "createProject request: body/slug must have required property 'slug'");
  assert.equal(createProject(keyed, "{").unexpected, "createProject request: the body is not JSON");
  assert.equal(createProject({ ...keyed, "content-type": "text/plain" }, body).unexpected,
    "createProject request: header Content-Type text/plain is not one of application/json");
  assert.equal(createProject({ ...keyed, "content-type": "application/json; charset=utf-8" }, body).status, 201);
  assert.equal(createProject(keyed, body).status, 201);
});

test("the guide's values are applied on top of the bodies the contract describes", () => {
  const first = answer({ method: "GET", url: `${projects}?pageSize=100`, headers: accountKey });
  assert.equal(first.body.nextPageToken, "page_2");
  const last = answer({ method: "GET", url: `${projects}?pageToken=${first.body.nextPageToken}`, headers: accountKey });
  assert.equal(last.status, 200);
  assert.equal(last.body.nextPageToken, undefined);
  assert.equal(answer({ method: "GET", url: `${projects}?pageToken=page_3`, headers: accountKey }).body.code, "INVALID_ARGUMENT");
  const created = createProject({ ...accountKey, "idempotency-key": "k" }, '{"name":"Support","slug":"support"}');
  assert.deepEqual([created.body.name, created.body.slug], ["Support", "support"]);
  assert.equal(answer({ method: "GET", url: `/v1/projects/${ENVIRONMENT.PHOTON_PROJECT_ID}`, headers: accountKey }).body.projectId, ENVIRONMENT.PHOTON_PROJECT_ID);
  assert.equal(answer({ method: "GET", url: "/v1/projects/pho_prj_00000000000000000000000000", headers: accountKey }).body.code, "PROJECT_NOT_FOUND");
});

test("the bodies follow a change to the contract with no change to the check", () => {
  const getProject = (contract) => {
    const mock = createMock(contract);
    return mock.answer({ method: "GET", url: `/v1/projects/${mock.environment.PHOTON_PROJECT_ID}`, headers: bearer(mock.environment.PHOTON_PROJECT_API_KEY) }).body;
  };
  const added = readContract();
  added.components.schemas.Project.properties.region = { enum: ["us"], type: "string" };
  added.components.schemas.Project.required.push("region");
  assert.equal(getProject(added).region, "us");
  const removed = readContract();
  delete removed.components.schemas.Project.properties.updatedAt;
  removed.components.schemas.Project.required = removed.components.schemas.Project.required.filter((member) => member !== "updatedAt");
  assert.equal(Object.hasOwn(getProject(removed), "updatedAt"), false);
  // A body the guide applies nothing to keeps its JSON type.
  const listed = readContract();
  listed.paths["/v1/account"].get.responses["200"].content["application/json"].schema = { type: "array", items: { $ref: "#/components/schemas/Account" }, minItems: 1 };
  const mock = createMock(listed);
  const account = mock.answer({ method: "GET", url: "/v1/account", headers: bearer(mock.environment.PHOTON_ACCESS_TOKEN) });
  assert.equal(account.status, 200);
  assert.ok(Array.isArray(account.body));
});

test("a body that does not match the contract fails with the operation, status and JSON pointer", () => {
  const { body } = answer({ method: "GET", url: `/v1/projects/${ENVIRONMENT.PHOTON_PROJECT_ID}`, headers: projectKey });
  assert.throws(() => checkResponse("getProject", 200, { ...body, undeclared: true }),
    { message: "getProject 200: the mock's body does not match the contract: /undeclared must NOT have additional properties" });
  const { slug: _slug, ...withoutSlug } = body;
  assert.throws(() => checkResponse("getProject", 200, withoutSlug),
    { message: "getProject 200: the mock's body does not match the contract: /slug must have required property 'slug'" });
  // A value the guide applies but the contract no longer declares fails the request.
  const contract = readContract();
  delete contract.components.schemas.Project.properties.slug;
  contract.components.schemas.Project.required = contract.components.schemas.Project.required.filter((member) => member !== "slug");
  const mock = createMock(contract);
  assert.throws(() => mock.answer({
    method: "POST", url: `/v1/organizations/${mock.environment.PHOTON_ORGANIZATION_ID}/projects`,
    headers: { ...json, ...bearer(mock.environment.PHOTON_API_KEY), "idempotency-key": "k" }, body: '{"name":"Support","slug":"support"}',
  }), { message: "createProject 201: the mock's body does not match the contract: /slug must NOT have additional properties" });
});

test("receiver examples get a delivery signed with the check's secret and a tampered copy, and the mock serves its message", () => {
  const [valid, tampered] = webhookDeliveries();
  const verifier = new Webhook(ENVIRONMENT.PHOTON_WEBHOOK_SECRET);
  const event = verifier.verify(valid.body, valid.headers);
  assert.equal(event.type, "message.received");
  assert.ok(valid.accept && !tampered.accept);
  assert.throws(() => verifier.verify(tampered.body, tampered.headers), /signature/);
  const message = `/v1/projects/${event.data.projectId}/messages/${event.data.object.id}`;
  assert.equal(answer({ method: "GET", url: message, headers: projectKey }).body.id, event.data.object.id);
  assert.match(answer({ method: "POST", url: `${message}/read`, headers: projectKey }).unexpected, /^markMessageRead request: header idempotency-key is required$/i);
  assert.equal(answer({ method: "POST", url: `${message}/read`, headers: { ...projectKey, "idempotency-key": "k" } }).status, 202);
  const other = `/v1/projects/${event.data.projectId}/messages/pho_msg_00000000000000000000000009`;
  assert.equal(answer({ method: "GET", url: other, headers: projectKey }).unexpected,
    `getMessage: message pho_msg_00000000000000000000000009 in project ${event.data.projectId}`);
  const destinations = `/v1/projects/${ENVIRONMENT.PHOTON_PROJECT_ID}/webhooks/destinations`;
  const body = JSON.stringify({ name: "Inbox", url: "https://example.com/hook", apiVersion: "2026-07-01", enabledEvents: ["message.received"] });
  assert.equal(answer({ method: "POST", url: destinations, headers: { ...json, ...projectKey, "idempotency-key": "k" }, body }).status, 201);
});

test("the receiver examples' delivery is checked against the contract's SmsMessageReceivedEvent", () => {
  const contract = (schemas) => ({ openapi: "3.1.0", info: { title: "Events", version: "1" }, paths: {}, components: { schemas } });
  checkDelivery(contract({ SmsMessageReceivedEvent: { properties: { type: { const: "message.received" } }, required: ["type", "data"], type: "object" } }));
  assert.throws(() => checkDelivery(contract({ SmsMessageReceivedEvent: { properties: { type: { const: "message.sent" } }, type: "object" } })),
    /does not match SmsMessageReceivedEvent: \/type must be equal to constant/);
  assert.throws(() => checkDelivery(contract({})), /has no SmsMessageReceivedEvent schema/);
});

test("only PhotonClientBuilder chains are redirected to the mock", () => {
  const code = "let a = PhotonClientBuilder::new()\n    .build()?;\nlet b = Other::new().build();\nlet c = PhotonClientBuilder::new().max_attempts(1).build()?;\n";
  const result = redirectBuilders(code, "example");
  assert.equal(result.match(/\.base_url\(/g).length, 2);
  assert.match(result, /Other::new\(\)\.build\(\)/);
  assert.throws(() => redirectBuilders("let x = 1;", "example"), /no PhotonClientBuilder/);
  assert.throws(() => redirectBuilders("PhotonClientBuilder::new(); PhotonClientBuilder::new().build()", "example"), /has no \.build\(\)/);
});

test("every TypeScript client an example creates validates responses strictly", () => {
  const code = "const a = new Photon({\n  headers,\n});\nconst b = new Photon();\nconst c = new Photon( {} );\n";
  assert.equal(strictClients(code, "example"),
    "const a = new Photon({ strictResponseValidation: true,\n  headers,\n});\nconst b = new Photon({ strictResponseValidation: true });\nconst c = new Photon({ strictResponseValidation: true,} );\n");
  assert.throws(() => strictClients("const a = new Photon(options);", "example"), /object literal or nothing/);
  assert.throws(() => strictClients("const a = new Photon({ ...{ strictResponseValidation: false } });", "example"), /only through the check/);
});

test("the generated SDK reference is left to the code-sample check", async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const docs = mkdtempSync(join(tmpdir(), "docs-"));
  try {
    const block = "```typescript\nconsole.log(1);\n```\n";
    writeFileSync(join(docs, "guide.mdx.vel"), block);
    mkdirSync(join(docs, "sdk", "account"), { recursive: true });
    writeFileSync(join(docs, "sdk", "account", "get.mdx.vel"), "```typescript TypeScript\nphoton.account.get(input?: GetAccountInput): Promise<GetAccountOutput>\n```\n");
    mkdirSync(join(docs, "guides", "sdk"), { recursive: true });
    writeFileSync(join(docs, "guides", "sdk", "page.mdx.vel"), block);
    assert.deepEqual(collectExamples(docs, "typescript").map((example) => example.location),
      ["docs/guide.mdx.vel:1", "docs/guides/sdk/page.mdx.vel:1"]);
  } finally {
    rmSync(docs, { recursive: true, force: true });
  }
});
