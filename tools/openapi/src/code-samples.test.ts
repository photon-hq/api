import assert from "node:assert/strict";
import test from "node:test";
import {
  goMethods,
  goSample,
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
      parameters: [{ name: "projectId", in: "path", required: true, schema: { $ref: "#/components/schemas/ProjectId" } }],
      get: { operationId: "getProject", security: [{ accountServiceKey: [] }] },
    },
    "/v1/projects": {
      post: {
        operationId: "createProject",
        security: [{ accountServiceKey: [] }],
        parameters: [
          { $ref: "#/components/parameters/IdempotencyKey" },
          { name: "note", in: "query", schema: { type: "string" } },
        ],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateProjectRequest" } } } },
      },
    },
    "/v1/scopes": { get: { operationId: "listScopes", security: [] } },
  },
  components: {
    parameters: {
      IdempotencyKey: { name: "Idempotency-Key", in: "header", required: true, schema: { type: "string", minLength: 1, maxLength: 255 } },
    },
    schemas: {
      ProjectId: { type: "string", pattern: "^pho_prj_[0-7][0-9a-hjkmnp-tv-z]{25}$" },
      CreateProjectRequest: {
        type: "object",
        required: ["name", "kind", "createdAt"],
        properties: {
          name: { type: "string", maxLength: 64, examples: ["Support line"] },
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
  parameters: [{ name: "projectId", wireName: "projectId", location: "path", required: true, schema: { $ref: "#/components/schemas/ProjectId" } }],
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

test("inputs are the contract's examples, else values generated from their schemas", () => {
  assert.match(typescriptSample(document, getProject), /projectId: "pho_prj_[0-7][0-9a-hjkmnp-tv-z]{25}",/);
  const python = pythonSample(document, createProject, "photon.projects.create");
  assert.match(python, /"name": "Support line"/);
  assert.match(python, /"kind": "sms"/);
  assert.match(python, /"createdAt": "2026-01-01T00:00:00Z"/);
  assert.doesNotMatch(python, /"note"/);
  assert.equal(typescriptSample(document, getProject), typescriptSample(structuredClone(document), getProject));
});

test("an example on the parameter or media type comes before its schema's", () => {
  const contract = structuredClone(document);
  const components = contract.components as JsonObject;
  const parameters = components.parameters as JsonObject;
  parameters.IdempotencyKey = { ...(parameters.IdempotencyKey as JsonObject), example: "retry-1" };
  components.examples = { Support: { value: { name: "Help desk", kind: "imessage", createdAt: "2026-02-02T00:00:00Z" } } };
  const post = ((contract.paths as JsonObject)["/v1/projects"] as JsonObject).post as JsonObject;
  ((post.requestBody as JsonObject).content as JsonObject)["application/json"] = {
    schema: { $ref: "#/components/schemas/CreateProjectRequest" },
    examples: { support: { $ref: "#/components/examples/Support" } },
  };
  const python = pythonSample(contract, createProject, "photon.projects.create");
  assert.match(python, /"Idempotency-Key": "retry-1"/);
  assert.match(python, /"name": "Help desk"/);
  assert.match(python, /"kind": "imessage"/);
  // An example the schema rejects is passed over.
  const rejected = structuredClone(document);
  const path = (rejected.paths as JsonObject)["/v1/projects/{projectId}"] as JsonObject;
  (path.parameters as JsonObject[])[0]!.example = "proj_1";
  assert.match(typescriptSample(rejected, getProject), /projectId: "pho_prj_[0-7][0-9a-hjkmnp-tv-z]{25}",/);
});

test("a raw body is sent in a media type the operation declares", () => {
  const contract = structuredClone(document);
  const post = ((contract.paths as JsonObject)["/v1/projects"] as JsonObject).post as JsonObject;
  (post.parameters as JsonObject[]).push(
    { name: "Content-Length", in: "header", required: true, schema: { type: "string", pattern: "^[1-9][0-9]*$" } },
    { name: "Content-Type", in: "header", required: true, schema: { type: "string" } },
  );
  post.requestBody = { required: true, content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } } };
  const raw: ManifestOperation = {
    ...createProject,
    parameters: [
      ...createProject.parameters,
      { name: "contentLength", wireName: "Content-Length", location: "header", required: true, schema: { type: "string" } },
      { name: "contentType", wireName: "Content-Type", location: "header", required: true, schema: { type: "string" } },
    ],
    requestBody: { required: true, content: { "application/octet-stream": {} } },
  };
  const typescript = typescriptSample(contract, raw);
  assert.ok(typescript.includes(`contentType: "application/octet-stream"`));
  assert.ok(typescript.includes(`contentLength: "${Buffer.byteLength("Hello from Photon.")}"`));
  assert.ok(typescript.includes(`body: new Blob(["Hello from Photon."], { type: "application/octet-stream" })`));
});

test("a sample whose inputs the contract rejects fails the generation", () => {
  const generate = (change: (post: JsonObject) => void, operation: ManifestOperation = createProject): void => {
    const contract = structuredClone(document);
    change(((contract.paths as JsonObject)["/v1/projects"] as JsonObject).post as JsonObject);
    withCodeSamples(contract, { operations: [getProject, operation, listScopes] }, { pythonClient, rustClient, goClient });
  };
  const failure = (message: string): RegExp => new RegExp(`in 1 of 3 operations:\\ncreateProject: ${message}`);
  // A value the sample sends that its schema rejects.
  const upload: ManifestOperation = {
    ...createProject,
    parameters: [...createProject.parameters, { name: "contentLength", wireName: "Content-Length", location: "header", required: true, schema: { type: "string" } }],
    requestBody: { required: true, content: { "text/plain": {} } },
  };
  assert.throws(() => generate((post) => {
    (post.parameters as JsonObject[]).push({ name: "Content-Length", in: "header", required: true, schema: { type: "string", maxLength: 1 } });
    post.requestBody = { required: true, content: { "text/plain": {} } };
  }, upload), failure("the sample's inputs do not match the contract: header Content-Length must NOT have more than 1 characters"));
  // An input the contract requires and the sample leaves out.
  assert.throws(() => generate((post) => {
    (post.parameters as JsonObject[])[1]!.required = true;
  }), failure("the sample's inputs do not match the contract: query note is required and missing"));
  // A raw body that the schema of its media type rejects.
  assert.throws(() => generate((post) => {
    post.requestBody = { required: true, content: { "text/plain": { schema: { type: "string", const: "ready" } } } };
  }, { ...createProject, requestBody: { required: true, content: { "text/plain": {} } } }), failure("the sample's inputs do not match the contract: body must be equal to constant"));
  // A body in a media type the samples cannot send.
  assert.throws(() => generate((post) => {
    post.requestBody = { required: true, content: { "image/png": {} } };
  }, { ...createProject, requestBody: { required: true, content: { "image/png": {} } } }), failure("no sample body for image/png"));
});

test("samples call the SDK method with the operation's required inputs", () => {
  const typescript = typescriptSample(document, getProject);
  assert.match(typescript, /const result = await photon\.projects\.get\(\{\n  path: \{\n    projectId: "pho_prj_\w{26}",\n  \},\n\}\);/);
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

test("a file upload's samples pass the file, and no Content-Type or Content-Length", () => {
  const uploadAttachment: ManifestOperation = {
    operationId: "uploadAttachment", rpcMethod: "uploadAttachment", namespace: ["projects"], httpMethod: "POST",
    path: "/v1/projects/{id}/attachments", safe: false, idempotencyKeyRequired: true,
    parameters: [
      { name: "id", wireName: "id", location: "path", required: true, schema: { type: "string" } },
      { name: "idempotency-key", wireName: "idempotency-key", location: "header", required: true, schema: { type: "string" } },
    ],
    requestBody: { required: true, content: { "multipart/related": { type: "string", format: "binary" } } },
    responses: { "201": { "application/json": "#/components/schemas/Attachment" } },
  };
  // The contract still requires the Content-Type and Content-Length that the SDK sets.
  const upload = { ...document, paths: { "/v1/projects/{id}/attachments": { post: {
    operationId: "uploadAttachment", security: [{ accountServiceKey: [] }],
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string" } },
      { name: "content-length", in: "header", required: true, schema: { type: "string", pattern: "^[1-9][0-9]*$" } },
      { name: "content-type", in: "header", required: true, schema: { type: "string", maxLength: 512 } },
      { name: "idempotency-key", in: "header", required: true, schema: { type: "string" } },
    ],
    requestBody: { required: true, content: { "multipart/related": { schema: { type: "string", format: "binary" } } } },
  } } } };

  const typescript = typescriptSample(upload, uploadAttachment);
  assert.match(typescript, /headers: \{\n    "idempotency-key": "idempotency-key",\n  \},\n  body: new File\(\["Hello from Photon\."\], "hello\.txt", \{ type: "text\/plain" \}\),/);

  const python = pythonSample(upload, uploadAttachment, "photon.projects.upload_attachment");
  assert.match(python, /^from photon_api import Photon, UploadFile$/m);
  assert.match(python, /"body": UploadFile\(data=b"Hello from Photon\.", content_type="text\/plain", filename="hello\.txt"\),/);

  const rust = rustSample(upload, uploadAttachment, [
    { name: "id", type: "String" }, { name: "idempotency_key", type: "String" }, { name: "file", type: "&UploadFile" },
  ]);
  assert.deepEqual(rustSignatures("pub async fn upload_attachment(&self, id: String, file: &crate::UploadFile) -> Result<(), ()> {}").get("upload_attachment"), [
    { name: "id", type: "String" }, { name: "file", type: "&UploadFile" },
  ]);
  assert.match(rust, /^use photon_ai_api::\{Credential, PhotonClientBuilder, SecretString, UploadFile\};$/m);
  assert.match(rust, /&UploadFile::new\("Hello from Photon\.", "text\/plain"\)\.filename\("hello\.txt"\),/);

  const go = goSample(upload, uploadAttachment, {
    path: "client.Projects.UploadAttachment", params: "UploadAttachmentParams", returns: "*Attachment", bodyType: "*UploadFile",
    fields: [
      { name: "ID", location: "path", wireName: "id", type: "string", optional: false },
      { name: "IdempotencyKey", location: "header", wireName: "idempotency-key", type: "string", optional: false },
    ],
  });
  assert.match(go, /\tBody: &photonapi\.UploadFile\{Data: \[\]byte\("Hello from Photon\."\), ContentType: "text\/plain", Filename: "hello\.txt"\},/);
  for (const sample of [typescript, python, rust, go]) assert.doesNotMatch(sample, /content-(type|length)|ContentLength|strings\.NewReader/i);

  const structured: ManifestOperation = { ...uploadAttachment, requestBody: { required: true, content: { "multipart/related": { type: "object", properties: { file: { type: "string" } } } } } };
  assert.throws(() => typescriptSample(upload, structured), /uploadAttachment request: a multipart\/related file upload requires an unconstrained or binary schema/);
  // A file upload the contract does not declare as multipart/related.
  const octets = structuredClone(upload);
  const post = (octets.paths["/v1/projects/{id}/attachments"] as JsonObject).post as JsonObject;
  post.requestBody = { required: true, content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } } };
  assert.throws(() => typescriptSample(octets, uploadAttachment), /uploadAttachment: the sample's inputs do not match the contract: body is a file upload, and the contract's body is application\/octet-stream/);
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
