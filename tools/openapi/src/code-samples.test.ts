import assert from "node:assert/strict";
import test from "node:test";
import {
  placeholder,
  pythonCallPaths,
  pythonSample,
  rustSample,
  rustSignatures,
  typescriptSample,
  withCodeSamples,
} from "./code-samples.js";
import type { ManifestOperation } from "./generate-facades.js";
import type { JsonObject } from "./shared.js";

const document: JsonObject = {
  openapi: "3.1.0",
  paths: {
    "/v1/projects/{projectId}": {
      get: { operationId: "getProject", security: [{ accountServiceKey: [] }] },
    },
    "/v1/projects": {
      post: { operationId: "createProject", security: [{ accountServiceKey: [] }] },
    },
    "/v1/scopes": { get: { operationId: "listScopes", security: [] } },
  },
  components: {
    schemas: {
      CreateProjectRequest: {
        type: "object",
        required: ["name", "kind", "createdAt"],
        properties: {
          name: { type: "string" },
          kind: { $ref: "#/components/schemas/Kind" },
          createdAt: { type: "string", format: "date-time" },
          note: { type: "string" },
        },
      },
      Kind: { type: "string", enum: ["sms", "imessage"] },
    },
  },
};

const getProject: ManifestOperation = {
  operationId: "getProject", rpcMethod: "get", namespace: ["projects"], httpMethod: "GET",
  path: "/v1/projects/{projectId}", safe: true, idempotencyKeyRequired: false,
  parameters: [{ name: "projectId", wireName: "projectId", location: "path", required: true, schema: { type: "string" } }],
  responses: { "200": { "application/json": "#/components/schemas/Project" } },
};
const createProject: ManifestOperation = {
  operationId: "createProject", rpcMethod: "create", namespace: ["projects"], httpMethod: "POST",
  path: "/v1/projects", safe: false, idempotencyKeyRequired: true,
  parameters: [{ name: "idempotencyKey", wireName: "Idempotency-Key", location: "header", required: true, schema: { type: "string" } }],
  requestBody: { required: true, content: { "application/json": "#/components/schemas/CreateProjectRequest" } },
  responses: { "204": {} },
};
const listScopes: ManifestOperation = {
  operationId: "listScopes", rpcMethod: "listScopes", namespace: ["auth"], httpMethod: "GET",
  path: "/v1/scopes", safe: true, idempotencyKeyRequired: false, parameters: [],
  responses: { "200": { "application/json": "#/components/schemas/Scopes" } },
};

const pythonClient = `class SyncRawProjectsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._transport = transport

class SyncProjectsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsResource(transport)

    def create(self, input: CreateProjectInput) -> None:
        return None

    def get(
        self, input: GetProjectInput
    ) -> models.Project:
        return None

class SyncAuthResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawAuthResource(transport)

    def list_scopes(self, input: ListScopesInput | None = None) -> models.Scopes:
        return None

class SyncRoot:
    def __init__(self, transport: SyncTransport) -> None:
        self.auth = SyncAuthResource(transport)
        self.projects = SyncProjectsResource(transport)
`;

const rustClient = `impl Client {
    pub async fn get_project(
        &self,
        project_id: String,
    ) -> Result<support::ResponseValue<types::Project>, support::Error<GetProjectError>> {}
    pub async fn create_project(
        &self,
        idempotency_key: String,
        body: &types::CreateProjectRequest,
    ) -> Result<support::ResponseValue<()>, support::Error<CreateProjectError>> {}
    pub async fn list_scopes(&self) -> Result<support::ResponseValue<types::Scopes>, support::Error<ListScopesError>> {}
}`;

test("method names come from the generated clients", () => {
  assert.deepEqual([...pythonCallPaths(pythonClient)].sort(), [
    ["CreateProject", "photon.projects.create"],
    ["GetProject", "photon.projects.get"],
    ["ListScopes", "photon.auth.list_scopes"],
  ]);
  assert.deepEqual(rustSignatures(rustClient).get("create_project"), [
    { name: "idempotency_key", type: "String" },
    { name: "body", type: "&types::CreateProjectRequest" },
  ]);
  assert.deepEqual(rustSignatures(rustClient).get("list_scopes"), []);
});

test("placeholders use required members and values the schema allows", () => {
  assert.deepEqual(placeholder(document, { $ref: "#/components/schemas/CreateProjectRequest" }, "body"), {
    name: "name", kind: "sms", createdAt: "2026-01-01T00:00:00Z",
  });
  assert.equal(placeholder(document, { type: "integer", minimum: 5 }, "count"), 5);
  assert.equal(placeholder(document, { const: "day" }, "interval"), "day");
  assert.deepEqual(placeholder(document, { type: "array", items: { type: "string" } }, "ids"), []);
  assert.equal(placeholder(document, { anyOf: [{ type: "null" }, { type: "boolean" }] }, "flag"), true);
});

test("samples call the SDK method with the operation's required inputs", () => {
  const typescript = typescriptSample(document, getProject);
  assert.match(typescript, /const result = await photon\.projects\.get\(\{\n  path: \{\n    projectId: "projectId",\n  \},\n\}\);/);
  assert.match(typescript, /Authorization: `Bearer \$\{process\.env\.PHOTON_API_TOKEN\}`/);
  assert.match(typescriptSample(document, listScopes), /new Photon\(\);\nconst result = await photon\.auth\.listScopes\(\);$/);

  const python = pythonSample(document, createProject, "photon.projects.create");
  assert.match(python, /from photon_api\.rpc_generated import CreateProjectInput/);
  assert.match(python, /^photon\.projects\.create\(\n    CreateProjectInput\.model_validate\(/m);
  assert.match(python, /"Idempotency-Key": "idempotencyKey"/);
  assert.match(python, /"kind": "sms"/);

  const rust = rustSample(document, createProject, rustSignatures(rustClient).get("create_project")!);
  assert.match(rust, /\.credential\("accountServiceKey"/);
  assert.match(rust, /"idempotencyKey"\.to_owned\(\),\n        &serde_json::from_value\(serde_json::json!\(\{/);
  assert.doesNotMatch(rust, /into_inner/);
  assert.match(rustSample(document, listScopes, []), /PhotonClientBuilder::new\(\)\.build\(\)\?;\nlet result = client\n    \.list_scopes\(\)/);
});

test("every operation gets TypeScript, Python and Rust samples", () => {
  const result = withCodeSamples(document, { operations: [getProject, createProject, listScopes] }, { pythonClient, rustClient });
  const operation = ((result.paths as JsonObject)["/v1/projects"] as JsonObject).post as JsonObject;
  assert.deepEqual((operation["x-codeSamples"] as Array<{ lang: string }>).map((sample) => sample.lang), ["typescript", "python", "rust"]);
  assert.equal("x-codeSamples" in (((document.paths as JsonObject)["/v1/projects"] as JsonObject).post as JsonObject), false);
  assert.throws(
    () => withCodeSamples(document, { operations: [getProject, createProject, listScopes] }, { pythonClient, rustClient: "" }),
    /Rust client has no method for getProject/,
  );
});
