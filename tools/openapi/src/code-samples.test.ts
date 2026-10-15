import assert from "node:assert/strict";
import test from "node:test";
import {
  goMethods,
  goSample,
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

const goClient = `// ProjectsService groups the projects operations.
type ProjectsService struct{ c *core }

// AuthService groups the auth operations.
type AuthService struct{ c *core }

type Client struct {
	c        *core
	Projects *ProjectsService
	Auth     *AuthService
}

func newClient(c *core) *Client {
	client := &Client{c: c}
	client.Projects = newProjectsService(c)
	client.Auth = newAuthService(c)
	return client
}

func newProjectsService(c *core) *ProjectsService {
	return &ProjectsService{c: c}
}

func newAuthService(c *core) *AuthService {
	return &AuthService{c: c}
}

type GetParams struct {
	// ProjectID is the path parameter projectId.
	ProjectID string
}

type CreateParams struct {
	// IdempotencyKey is the header parameter Idempotency-Key. Generated when empty.
	IdempotencyKey string
	// Note is the query parameter note.
	Note *string
	// Body is the request body.
	Body CreateProjectRequest
}

func (s *ProjectsService) Get(ctx context.Context, params *GetParams, opts ...RequestOption) (*Project, error) {
	return nil, nil
}

func (s *ProjectsService) Create(ctx context.Context, params *CreateParams, opts ...RequestOption) error {
	return nil
}

func (s *AuthService) ListScopes(ctx context.Context, opts ...RequestOption) (*Scopes, error) {
	return nil, nil
}
`;

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
  const go = goMethods(goClient);
  assert.equal(go.get("projects.Get")?.path, "client.Projects.Get");
  assert.deepEqual(go.get("projects.Create")?.fields, [
    { name: "IdempotencyKey", location: "header", wireName: "Idempotency-Key", type: "string", optional: false },
    { name: "Note", location: "query", wireName: "note", type: "string", optional: true },
  ]);
  assert.equal(go.get("projects.Create")?.bodyType, "CreateProjectRequest");
  assert.equal(go.get("auth.ListScopes")?.params, undefined);
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

  const go = goSample(document, createProject, goMethods(goClient).get("projects.Create")!);
  assert.match(go, /photonapi\.NewClient\(photonapi\.WithAPIKey\(os\.Getenv\("PHOTON_API_TOKEN"\)\)\)/);
  assert.match(go, /var body photonapi\.CreateProjectRequest/);
  assert.match(go, /"kind": "sms"/);
  assert.match(go, /\tIdempotencyKey: "idempotencyKey",/);
  assert.match(go, /err := client\.Projects\.Create\(ctx, &photonapi\.CreateParams\{/);
  assert.doesNotMatch(go, /\tNote:/);
  const goList = goSample(document, listScopes, goMethods(goClient).get("auth.ListScopes")!);
  assert.match(goList, /client := photonapi\.NewClient\(\)\nresult, err := client\.Auth\.ListScopes\(ctx\)/);
  // Results are never printed: some operations return one-time credentials.
  assert.match(goList, /_ = result/);
  assert.doesNotMatch(goList, /fmt\.Println/);
});

test("every operation gets TypeScript, Python, Rust and Go samples", () => {
  const result = withCodeSamples(document, { operations: [getProject, createProject, listScopes] }, { pythonClient, rustClient, goClient });
  const operation = ((result.paths as JsonObject)["/v1/projects"] as JsonObject).post as JsonObject;
  assert.deepEqual((operation["x-codeSamples"] as Array<{ lang: string }>).map((sample) => sample.lang), ["typescript", "python", "rust", "go"]);
  assert.equal("x-codeSamples" in (((document.paths as JsonObject)["/v1/projects"] as JsonObject).post as JsonObject), false);
  assert.throws(
    () => withCodeSamples(document, { operations: [getProject, createProject, listScopes] }, { pythonClient, rustClient: "", goClient }),
    /Rust client has no method for getProject/,
  );
});
