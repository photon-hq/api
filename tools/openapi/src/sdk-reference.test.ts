import assert from "node:assert/strict";
import test from "node:test";
import { pythonMethods, rustMethods } from "./code-samples.js";
import type { ManifestOperation } from "./generate-facades.js";
import {
  methodPage,
  resourcePage,
  resources,
  resourceTitle,
  sdkReferencePages,
  typeLabel,
  typescriptSignatures,
  withSdkNav,
} from "./sdk-reference.js";
import type { JsonObject } from "./shared.js";

const samples = (call: string) => [
  { lang: "typescript", label: "TypeScript", source: `await photon.${call}();` },
  { lang: "python", label: "Python", source: `photon.${call}()` },
  { lang: "rust", label: "Rust", source: `client.${call}().await?;` },
];

const document: JsonObject = {
  openapi: "3.1.0",
  paths: {
    "/v1/projects/{projectId}": {
      get: {
        operationId: "getProject",
        summary: "Get project",
        description: "Returns the project. Use {projectId} from <listProjects>.",
        parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "The project.", content: { "application/json": { schema: { $ref: "#/components/schemas/Project" } } } } },
        "x-codeSamples": samples("projects.get"),
      },
    },
    "/v1/projects/{projectId}/platforms/imessage/assignments": {
      get: {
        operationId: "listImessageAssignments",
        summary: "List iMessage assignments",
        responses: { "200": { description: "Assignments.", content: { "application/json": { schema: { type: "array", items: { type: "string" } } } } } },
        "x-codeSamples": samples("projects.platforms.imessage.assignments.list"),
      },
    },
  },
  components: {
    schemas: {
      Project: {
        type: "object",
        description: "A project.",
        required: ["id", "kind"],
        properties: {
          id: { type: "string" },
          kind: { enum: ["sms", "imessage"] },
          createdAt: { type: "string", format: "date-time", pattern: "^.*Z$" },
          note: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
      },
    },
  },
};

const getProject: ManifestOperation = {
  operationId: "getProject", rpcMethod: "get", namespace: ["projects"], httpMethod: "GET",
  path: "/v1/projects/{projectId}", safe: true, idempotencyKeyRequired: false,
  parameters: [{ name: "projectId", wireName: "projectId", location: "path", required: true, schema: { type: "string" } }],
  responses: { "200": { "application/json": "#/components/schemas/Project" } },
};
const listAssignments: ManifestOperation = {
  operationId: "listImessageAssignments", rpcMethod: "list", namespace: ["projects", "platforms", "imessage", "assignments"],
  httpMethod: "GET", path: "/v1/projects/{projectId}/platforms/imessage/assignments", safe: true, idempotencyKeyRequired: false,
  parameters: [], responses: { "200": { "application/json": "#/components/schemas/Assignments" } },
};
const manifest = { operations: [listAssignments, getProject] } as unknown as Parameters<typeof resources>[1];

const typescriptClient = `export const createClient = () => ({
    projects: {
        get: (input: Schemas.GetProjectInput, options?: RequestOptions) => invokers.data<Schemas.GetProjectInput, Schemas.GetProjectOutput>(
            "getProject",
        platforms: {
            imessage: {
                assignments: {
                    list: (input: Schemas.ListImessageAssignmentsInput = {}, options?: RequestOptions) => invokers.data<Schemas.ListImessageAssignmentsInput, Schemas.ListImessageAssignmentsOutput>(
                        "listImessageAssignments",
`;

const pythonClient = `class SyncProjectsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = SyncRawProjectsResource(transport)
        self.platforms = SyncProjectsPlatformsResource(transport)

    def get(
        self, input: GetProjectInput
    ) -> models.Project:
        return None

class SyncProjectsPlatformsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self.imessage = SyncProjectsPlatformsImessageResource(transport)

class SyncProjectsPlatformsImessageResource:
    def __init__(self, transport: SyncTransport) -> None:
        self.assignments = SyncAssignmentsResource(transport)

class SyncAssignmentsResource:
    def __init__(self, transport: SyncTransport) -> None:
        self._raw_resource = None

    def list(self, input: ListImessageAssignmentsInput | None = None) -> list[str]:
        return None

class SyncRoot:
    def __init__(self, transport: SyncTransport) -> None:
        self.projects = SyncProjectsResource(transport)
`;

const rustClient = `impl Client {
    pub async fn get_project(
        &self,
        project_id: String,
    ) -> Result<
        support::ResponseValue<types::Project>,
        support::Error<GetProjectError>,
    > {}
    pub async fn list_imessage_assignments(&self) -> Result<support::ResponseValue<Vec<String>>, support::Error<ListImessageAssignmentsError>> {}
}`;

const sources = { typescriptClient, pythonClient, rustClient };

test("signatures come from the generated clients", () => {
  assert.equal(
    typescriptSignatures(typescriptClient, manifest).get("listImessageAssignments"),
    "photon.projects.platforms.imessage.assignments.list(input?: ListImessageAssignmentsInput, options?: RequestOptions): Promise<ListImessageAssignmentsOutput>",
  );
  assert.deepEqual(pythonMethods(pythonClient).get("GetProject"), {
    path: "photon.projects.get", parameter: "input: GetProjectInput", returns: "models.Project",
  });
  assert.equal(pythonMethods(pythonClient).get("ListImessageAssignments")?.parameter, "input: ListImessageAssignmentsInput | None = None");
  assert.equal(rustMethods(rustClient).get("get_project")?.returns, "Result<ResponseValue<types::Project>, Error<GetProjectError>>");
});

test("resources follow the SDK namespaces, with product names capitalised", () => {
  const tree = resources(document, manifest, sources);
  assert.deepEqual(tree.map((resource) => resource.title), ["Projects"]);
  const [projects] = tree;
  assert.deepEqual(projects!.methods.map((method) => method.slug), ["get"]);
  const assignments = projects!.children[0]!.children[0]!.children[0]!;
  assert.deepEqual([projects!.children[0]!.title, projects!.children[0]!.children[0]!.title, assignments.title], ["Platforms", "iMessage", "Assignments"]);
  assert.equal(assignments.slug, "projects/platforms/imessage/assignments");
  assert.equal(resourceTitle("agentProfile"), "Agent profile");
  assert.throws(() => resources(document, manifest, { ...sources, rustClient: "" }), /Rust client has no method for/);
});

test("a method page shows each SDK's signature, the call beside it, and the contract's fields", () => {
  const [projects] = resources(document, manifest, sources);
  const page = methodPage(document, projects!.methods[0]!);
  assert.match(page, /^---\ntitle: "Get project"\nicon: arrow-down-left\n/);
  assert.match(page, /`GET \/v1\/projects\/\{projectId\}`/);
  // Prose is escaped for MDX.
  assert.match(page, /Use &#123;projectId&#125; from &lt;listProjects>\./);
  assert.match(page, /```python Python\nphoton\.projects\.get\(input: GetProjectInput\) -> models\.Project\n```/);
  assert.match(page, /<RequestExample>\n```typescript TypeScript\nawait photon\.projects\.get\(\);/);
  assert.match(page, /<ParamField path="projectId" type=\{"string"\} required>/);
  // Types are JavaScript strings, so an enum's quotes cannot end the attribute.
  assert.match(page, /<ResponseField name="kind" type=\{"\\"sms\\" \| \\"imessage\\""\} required>/);
  assert.match(page, /<ResponseField name="createdAt" type=\{"string \(date-time\)"\}>/);
  assert.doesNotMatch(page, /\^\.\*Z\$/);
});

test("a resource page lists its methods per language and the models they return", () => {
  const [projects] = resources(document, manifest, sources);
  const page = resourcePage(document, projects!);
  assert.match(page, /<Tab title="Rust">\n\*\*\[Get project\]\(\/api-client\/sdk\/projects\/get\)\*\*/);
  assert.match(page, /client\.get_project\(project_id: String\)\.await -> Result<ResponseValue<types::Project>, Error<GetProjectError>>/);
  assert.match(page, /## Resources\n\n- \[Platforms\]\(\/api-client\/sdk\/projects\/platforms\)/);
  assert.match(page, /## Models\n\n### Project\n\nA project\./);
  assert.equal(typeLabel(document, { $ref: "#/components/schemas/Project" }), "Project");
});

test("pages cover every method and nav.json keeps the guide while replacing the SDK reference", () => {
  const tree = resources(document, manifest, sources);
  assert.deepEqual([...sdkReferencePages(document, tree).keys()].sort(), [
    "projects/get.mdx.vel",
    "projects/index.mdx.vel",
    "projects/platforms/imessage/assignments/index.mdx.vel",
    "projects/platforms/imessage/assignments/list.mdx.vel",
    "projects/platforms/imessage/index.mdx.vel",
    "projects/platforms/index.mdx.vel",
  ]);
  const guide = { source: "api-client", groups: [{ group: "Get started", pages: ["api-client/index"] }] };
  const nav = withSdkNav(guide, tree);
  assert.deepEqual(nav.groups.map((group) => group.group), ["Get started", "SDK reference"]);
  assert.deepEqual(withSdkNav(nav, tree), nav, "regenerating replaces the SDK reference group");
  assert.deepEqual(nav.groups[1], {
    group: "SDK reference",
    pages: [{
      group: "Projects", root: "api-client/sdk/projects/index",
      pages: ["api-client/sdk/projects/get", {
        group: "Platforms", root: "api-client/sdk/projects/platforms/index",
        pages: [{
          group: "iMessage", root: "api-client/sdk/projects/platforms/imessage/index",
          pages: [{ group: "Assignments", root: "api-client/sdk/projects/platforms/imessage/assignments/index", pages: ["api-client/sdk/projects/platforms/imessage/assignments/list"] }],
        }],
      }],
    }],
  });
});

test("pages render union bodies, every success status, non-JSON bodies and null examples", () => {
  const grant = (type: string, field: string) => ({
    type: "object", required: ["grant_type", field],
    properties: { grant_type: { const: type }, [field]: { type: "string" } },
  });
  const document: JsonObject = {
    paths: {
      "/v1/tokens": {
        post: {
          operationId: "createToken", summary: "Create token",
          requestBody: { content: { "application/json": { schema: { oneOf: [grant("device_code", "device_code"), grant("refresh_token", "refresh_token")] } } } },
          responses: {
            "200": { description: "Replayed.", headers: { "X-Request-ID": { schema: { type: "string" } } }, content: { "application/json": { schema: { $ref: "#/components/schemas/Token" } } } },
            "202": {
              description: "Pending.",
              headers: { Location: { schema: { type: "string" } }, "Retry-After": { schema: { type: "string" } }, "X-Request-ID": { schema: { type: "string" } } },
              content: { "application/json": { schema: { $ref: "#/components/schemas/Token" }, examples: { pending: { value: { id: "tok_1", revokedAt: null, outbound: null } } } } },
            },
          },
          "x-codeSamples": samples("tokens.create"),
        },
      },
      "/v1/files/{id}": {
        get: {
          operationId: "downloadFile", summary: "Download file",
          responses: { "200": { description: "The file.", headers: { "X-Request-ID": { schema: { type: "string" } } }, content: { "image/png": { schema: { type: "string", format: "binary" } } } } },
          "x-codeSamples": samples("files.download"),
        },
      },
    },
    components: {
      schemas: {
        Token: {
          allOf: [
            { type: "object", required: ["id"], properties: { id: { type: "string" } } },
            { type: "object", properties: { revokedAt: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] }, outbound: { type: "null" } } },
          ],
        },
      },
    },
  };
  const create: ManifestOperation = {
    operationId: "createToken", rpcMethod: "create", namespace: ["tokens"], httpMethod: "POST", path: "/v1/tokens",
    safe: false, idempotencyKeyRequired: false, parameters: [], responses: {},
  };
  const download: ManifestOperation = {
    operationId: "downloadFile", rpcMethod: "download", namespace: ["files"], httpMethod: "GET", path: "/v1/files/{id}",
    safe: true, idempotencyKeyRequired: false, parameters: [], responses: {},
  };
  const tree = resources(document, { operations: [create, download] } as unknown as Parameters<typeof resources>[1], {
    typescriptClient: `tokens: {
        create: (input: Schemas.CreateTokenInput, options?: RequestOptions) => invokers.data<Schemas.CreateTokenInput, Schemas.CreateTokenOutput>(
            "createToken",
    files: {
        download: (input: Schemas.DownloadFileInput, options?: RequestOptions) => invokers.data<Schemas.DownloadFileInput, Schemas.DownloadFileOutput>(
            "downloadFile",`,
    pythonClient: `class SyncTokensResource:
    def create(self, input: CreateTokenInput) -> models.Token:
        return None

class SyncFilesResource:
    def download(self, input: DownloadFileInput) -> bytes:
        return None

class SyncRoot:
    def __init__(self, transport: SyncTransport) -> None:
        self.files = SyncFilesResource(transport)
        self.tokens = SyncTokensResource(transport)
`,
    rustClient: `pub async fn create_token(&self, body: &types::CreateTokenRequest) -> Result<support::ResponseValue<types::Token>, support::Error<CreateTokenError>> {}
pub async fn download_file(&self, id: String) -> Result<support::ResponseValue<support::ByteStream>, support::Error<DownloadFileError>> {}`,
  });
  const token = methodPage(document, tree.find((resource) => resource.title === "Tokens")!.methods[0]!);
  // A union body lists each variant's fields.
  assert.match(token, /\*\*One of: grant_type: "device_code"\*\*\n\n<ParamField body="grant_type"[^>]*required>[\s\S]*<ParamField body="device_code"/);
  assert.match(token, /\*\*One of: grant_type: "refresh_token"\*\*[\s\S]*<ParamField body="refresh_token"/);
  // Every success status, the headers it adds to those every response carries, and allOf fields merged.
  assert.match(token, /\*\*`200`\*\* Replayed\. Token[\s\S]*\*\*`202`\*\* Pending\. Token\n\nHeaders: `Location`, `Retry-After`\. The raw response carries these headers/);
  assert.match(token, /<ResponseField name="id" type=\{"string"\} required>/);
  assert.match(token, /```json 200\n[\s\S]*```json 202\n/);
  // A status's own example in the contract wins over one built from the schema.
  assert.match(token, /```json 202\n\{\n  "id": "tok_1",/);
  // Nullable and null-typed values are null in examples.
  assert.match(token, /"revokedAt": null,\n\s+"outbound": null/);
  const file = methodPage(document, tree.find((resource) => resource.title === "Files")!.methods[0]!);
  assert.match(file, /\*\*`200`\*\* The file\. The `image\/png` body as bytes\./);
  assert.doesNotMatch(file, /<ResponseExample>/);
});
