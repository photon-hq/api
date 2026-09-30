import assert from "node:assert/strict";
import test from "node:test";

import {
  facadeLanguages,
  operationSchema,
  operationMedia,
  pythonModelName,
  renderPython,
  renderTypeScript,
  type ManifestOperation,
  type RpcManifest,
} from "./generate-facades.js";

function operation(
  operationId: string,
  responses: ManifestOperation["responses"],
  parameters: ManifestOperation["parameters"] = [],
): ManifestOperation {
  return {
    operationId,
    rpcMethod: operationId,
    namespace: ["tests"],
    httpMethod: "POST",
    path: `/v1/${operationId}`,
    safe: false,
    idempotencyKeyRequired: false,
    parameters,
    responses,
  };
}

const manifest: RpcManifest = {
  operations: [
    operation("multiSuccess", {
      "201": {
        "application/json": "#/components/schemas/CompletedResponse",
      },
      "202": {
        "application/json": "#/components/schemas/PendingResponse",
      },
    }),
    operation("mixedSuccess", {
      "200": {
        "application/json": "#/components/schemas/CompletedResponse",
      },
      "204": {},
      "2XX": {
        "application/json": "#/components/schemas/FallbackResponse",
      },
    }),
    operation("createOAuthClient", {
      "201": {
        "application/json": "#/components/schemas/OAuthClient",
      },
    }),
    operation("noContent", {
      "204": {},
    }),
    operation("duplicateSuccess", {
      "200": {
        "application/json": "#/components/schemas/SharedResponse",
      },
      "202": {
        "application/json": "#/components/schemas/SharedResponse",
      },
    }),
  ],
};

test("all convenience methods retain summaries and descriptions safely", () => {
  const documented = operation("getExample", { "204": {} });
  documented.summary = "Get an example";
  documented.description =
    'Returns "quoted" text, a \\path, and triple quotes """.\n\nA comment terminator */ stays documentation.';
  const fixture = { operations: [documented] };
  const typescript = renderTypeScript(fixture);
  const python = renderPython(fixture);

  // TypeScript data/raw and Python sync/async methods must each carry the prose.
  assert.equal(typescript.match(/\* Get an example/g)?.length, 2);
  assert.equal(
    typescript.match(/\* A comment terminator \*\\\/ stays documentation\./g)?.length,
    2,
  );
  assert.doesNotMatch(typescript, /terminator \*\//);
  const docstrings = [...python.matchAll(
    /^    (?:async )?def get_example\([^\n]+\n([^\n]+)/gm,
  )];
  assert.deepEqual(docstrings.map((match) => JSON.parse(match[1]!.trim())), [
    `${documented.summary}\n\n${documented.description}`,
    `${documented.summary}\n\n${documented.description}`,
  ]);
});

test("legacy manifests without documentation still generate valid method bodies", () => {
  const fixture = { operations: [operation("undocumented", { "204": {} })] };
  assert.doesNotMatch(renderTypeScript(fixture), /\/\*\*/);
  assert.match(renderPython(fixture), /def undocumented\([^\n]+\n        payload =/);
});

test("facades select JSON request/response models and wire headers for mixed media", () => {
  const mixed = operation("exportLogs", {
    "200": {
      "application/x-protobuf": "#/components/schemas/BinaryResponse",
      "application/json": "#/components/schemas/JsonResponse",
    },
  });
  mixed.requestBody = {
    required: true,
    content: {
      "application/x-protobuf": "#/components/schemas/BinaryRequest",
      "application/json": "#/components/schemas/JsonRequest",
    },
  };
  assert.deepEqual(operationMedia(mixed), {
    request: "application/json",
    responses: ["application/json"],
    accept: ["application/json"],
    responseKinds: { "200": "json" },
  });
  const python = renderPython({ operations: [mixed] });
  assert.match(python, /body: models.JsonRequest/);
  assert.match(python, /TypeAdapter\(models.JsonResponse\)/);
  assert.doesNotMatch(python, /BinaryRequest|BinaryResponse/);
  assert.match(python, /request_media_type="application\/json"/);
  assert.match(python, /accept_media_types=\("application\/json",\)/);
  assert.match(operationSchema(mixed), /"200": GeneratedZod\.zJsonResponse,/);
  for (const source of [python, renderTypeScript({ operations: [mixed] })]) {
    assert.match(source, /This SDK method sends uncompressed JSON/);
  }
});

test("Python binary methods expose bytes while retaining empty response handling", () => {
  const source = renderPython({ operations: [operation("download", {
    "200": { "application/octet-stream": "#/components/schemas/DownloadBody" }, "204": {},
  })] });
  assert.match(source, /"200": bytes/);
  assert.match(source, /"204": None/);
  assert.match(source, /bytes \| None \| RawResponse\[bytes \| None\]/);
  assert.doesNotMatch(source, /TypeAdapter\(models.DownloadBody\)/);
});

test("Python facade validates and returns every successful response model", () => {
  const source = renderPython(manifest);
  assert.match(
    source,
    /"201": TypeAdapter\(models\.CompletedResponse\)/,
  );
  assert.match(source, /"202": TypeAdapter\(models\.PendingResponse\)/);
  assert.match(source, /"204": None/);
  assert.match(source, /"2XX": TypeAdapter\(models\.FallbackResponse\)/);
  assert.equal(
    source.match(/TypeAdapter\(models\.SharedResponse\)/g)?.length,
    2,
  );
  assert.match(
    source,
    /models\.CompletedResponse \| models\.PendingResponse \| RawResponse\[models\.CompletedResponse \| models\.PendingResponse\]/,
  );
});

test("TypeScript facade validates each success status against its own component", () => {
  const [multi, mixed, , noContent, duplicate] = manifest.operations.map(operationSchema);
  // No reference to Hey API's per-operation union of success bodies.
  for (const source of [multi, mixed, noContent, duplicate]) {
    assert.doesNotMatch(source!, /GeneratedZod\.z(MultiSuccess|MixedSuccess|NoContent|DuplicateSuccess)(Response|Result)\b/);
  }
  assert.match(
    multi!,
    /export const MultiSuccessOutputSchemas: OutputSchemas<MultiSuccessOutput> = \/\* @__PURE__ \*\/ \(\(\) => \(\{\n    "201": GeneratedZod\.zCompletedResponse,\n    "202": GeneratedZod\.zPendingResponse,\n\}\)\)\(\);/,
  );
  assert.match(
    multi!,
    /export const MultiSuccessOutputSchema = \/\* @__PURE__ \*\/ \(\(\) => z\.union\(\[GeneratedZod\.zCompletedResponse, GeneratedZod\.zPendingResponse\]\)\)\(\);/,
  );
  assert.match(mixed!, /"200": GeneratedZod\.zCompletedResponse,\n    "204": z\.undefined\(\),\n    "2XX": GeneratedZod\.zFallbackResponse,/);
  assert.match(noContent!, /export const NoContentOutputSchema = z\.undefined\(\);/);
  assert.match(noContent!, /"204": z\.undefined\(\),/);
  // One component for two statuses: one schema, listed under both.
  assert.match(duplicate!, /export const DuplicateSuccessOutputSchema = GeneratedZod\.zSharedResponse;/);
  assert.match(duplicate!, /"200": GeneratedZod\.zSharedResponse,\n    "202": GeneratedZod\.zSharedResponse,/);
  assert.match(renderTypeScript(manifest), /Schemas\.MultiSuccessOutputSchemas,/);
});

test("TypeScript facade quotes header names that are not identifiers", () => {
  const source = operationSchema(
    operation(
      "conditionalUpdate",
      { "204": {} },
      [
        {
          name: "if-match",
          wireName: "if-match",
          location: "header",
          required: true,
          schema: { type: "string" },
        },
      ],
    ),
  );

  assert.match(source, /"if-match": GeneratedZod\.zConditionalUpdateHeaders\.shape\["if-match"\]/);
});

test("Python facade escapes reserved identifiers while preserving wire names", () => {
  const keywordOperation = operation(
    "keywordParameters",
    { "204": {} },
    [
      {
        name: "from",
        wireName: "from",
        location: "query",
        required: false,
        schema: { type: "string" },
      },
      {
        name: "from_",
        wireName: "from_",
        location: "query",
        required: false,
        schema: { type: "string" },
      },
      {
        name: "2fa-code",
        wireName: "2fa-code",
        location: "query",
        required: false,
        schema: { type: "string" },
      },
    ],
  );
  keywordOperation.rpcMethod = "async";
  keywordOperation.namespace = ["from"];

  const source = renderPython({ operations: [keywordOperation] });

  assert.match(
    source,
    /from_: str \| MISSING = Field\(default=MISSING, alias="from"\)/,
  );
  assert.match(
    source,
    /from__: str \| MISSING = Field\(default=MISSING, alias="from_"\)/,
  );
  assert.match(
    source,
    /field_2fa_code: str \| MISSING = Field\(default=MISSING, alias="2fa-code"\)/,
  );
  assert.equal(source.match(/def async_\(self,/g)?.length, 2);
  assert.match(source, /self\.from_ = SyncFromResource\(transport, raw\)/);
  assert.match(source, /self\.from_ = AsyncFromResource\(transport, raw\)/);
});


test("binary facades retain status-specific decoding and public byte types", () => {
  const download = operation("download", {
    "200": { "*/*": "#/components/schemas/Raw" },
    "202": { "application/json": "#/components/schemas/PendingResponse" },
    "204": {},
  });
  assert.deepEqual(operationMedia(download), {
    responses: ["*/*", "application/json"],
    accept: ["*/*", "application/json"],
    responseKinds: { "200": "binary", "202": "json", "204": "empty" },
  });
  assert.match(operationSchema(download), /z.union\(\[z.instanceof\(Blob\), GeneratedZod.zPendingResponse, z.undefined\(\)\]\)/);
  const python = renderPython({ operations: [download] });
  assert.match(python, /"200": bytes/);
  assert.match(python, /"202": TypeAdapter\(models.PendingResponse\)/);
  assert.match(python, /bytes \| models.PendingResponse \| None/);
});

test("Python facade parameters carry types only, and open enums", () => {
  const source = renderPython({ operations: [operation("lengths", { "204": {} }, [
    {
      name: "resourceId", wireName: "resource-id", location: "path", required: true,
      schema: { type: "string", minLength: 0, maxLength: 0 },
    },
    {
      name: "query", wireName: "query", location: "query", required: false,
      schema: { type: "string", minLength: 1 },
    },
    {
      name: "contentType", wireName: "content-type", location: "header", required: true,
      schema: { type: "string", maxLength: 512 },
    },
    {
      name: "unbounded", wireName: "unbounded", location: "query", required: false,
      schema: { type: "string", default: "existing" },
    },
    {
      name: "state", wireName: "state", location: "query", required: false,
      schema: { type: "string", enum: ["open", "closed"] },
    },
  ])] });
  assert.ok(source.includes(
    'state: Literal["open", "closed"] | str | MISSING = Field(default=MISSING, alias="state")',
  ));

  assert.ok(source.includes(
    'resource_id: str = Field(alias="resource-id")',
  ));
  assert.ok(source.includes(
    'query: str | MISSING = Field(default=MISSING, alias="query")',
  ));
  assert.ok(source.includes(
    'content_type: str = Field(alias="content-type")',
  ));
  assert.ok(source.includes(
    'unbounded: str | MISSING = Field(default=MISSING, alias="unbounded")',
  ));
});

test("Accept lists selected success types and every declared error type", () => {
  const withErrors = operation("createThing", {
    "201": { "application/json": "#/components/schemas/Thing" },
    "204": {},
    "400": { "application/problem+json": "#/components/schemas/Problem" },
    "500": { "application/json": "#/components/schemas/LegacyError" },
    default: { "application/problem+json": "#/components/schemas/Problem" },
  });
  const media = operationMedia(withErrors);
  assert.deepEqual(media.responses, ["application/json"]);
  assert.deepEqual(media.accept, ["application/json", "application/problem+json"]);
  assert.deepEqual(media.responseKinds, { "201": "json", "204": "empty" });
  assert.match(
    renderPython({ operations: [withErrors] }),
    /accept_media_types=\("application\/json", "application\/problem\+json",\)/,
  );
});

test("facade header and parameter schemas enforce exactly the contract", () => {
  const keyed = operation(
    "createCampaign",
    { "201": { "application/json": "#/components/schemas/Campaign" } },
    [
      { name: "idempotencyKey", wireName: "Idempotency-Key", location: "header", required: true,
        schema: { type: "string", minLength: 8, maxLength: 128, pattern: "^[!-~]{8,128}$" } },
      { name: "if-none-match", wireName: "if-none-match", location: "header", required: false,
        schema: { type: "string" } },
      { name: "unit", wireName: "unit", location: "query", required: false,
        schema: { type: "string", const: "day" } },
      { name: "limit", wireName: "limit", location: "query", required: false,
        schema: { type: "integer", minimum: 1, maximum: 100, default: 25 } },
      { name: "after", wireName: "after", location: "query", required: false,
        schema: { type: "integer", exclusiveMinimum: 0 } },
    ],
  );
  const typescript = operationSchema(keyed);
  assert.match(typescript, /idempotencyKey: GeneratedZod\.zCreateCampaignHeaders\.shape\["Idempotency-Key"\],/);
  assert.match(typescript, /"if-none-match": GeneratedZod\.zCreateCampaignHeaders\.shape\["if-none-match"\],/);
  assert.doesNotMatch(typescript, /z\.string\(\)\.min\(1\)/);
  // The input type is exact, from the generated request types (not a loose Zod input).
  assert.match(typescript, /export type CreateCampaignInput = \{\n    query\?: NonNullable<WireTypes\.CreateCampaignData\["query"\]>;/);
  assert.match(typescript, /        idempotencyKey: NonNullable<WireTypes\.CreateCampaignData\["headers"\]>\["Idempotency-Key"\];/);
  assert.match(typescript, /        "if-none-match"\?: NonNullable<WireTypes\.CreateCampaignData\["headers"\]>\["if-none-match"\];/);

  const python = renderPython({ operations: [keyed] });
  // Types only: validation keywords are left to the service (tools/python-codegen/sdk_types.py).
  assert.match(python, /idempotency_key: str = Field\(alias="Idempotency-Key"\)/);
  assert.match(python, /if_none_match: str \| MISSING = Field\(default=MISSING, alias="if-none-match"\)/);
  assert.match(python, /unit: Literal\["day"\] \| MISSING/);
  assert.match(python, /limit: int \| MISSING = Field\(default=MISSING, alias="limit"\)/);
  assert.match(python, /after: int \| MISSING = Field\(default=MISSING, alias="after"\)/);
});

test("Python facade names referenced contract components like the model generator", () => {
  assert.equal(pythonModelName("CountProjectsResponse200ApplicationJson"), "CountProjectsResponse200ApplicationJson");
  assert.equal(pythonModelName("input__ClickHouseSqlQueryRequest"), "InputClickHouseSqlQueryRequest");
  assert.equal(pythonModelName("PhotonProblem_NOT_AUTHENTICATED_401"), "PhotonProblemNOTAUTHENTICATED401");
  assert.equal(pythonModelName("__schema0"), "FieldSchema0");
  assert.equal(pythonModelName("1Password"), "Field1Password");
  const referenced = operation("queryEvents", {
    "200": { "application/json": "#/components/schemas/output__Schema_f581a22c___schema1" },
  });
  referenced.requestBody = {
    required: true,
    content: { "application/json": "#/components/schemas/input__ClickHouseSqlQueryRequest" },
  };
  const python = renderPython({ operations: [referenced] });
  assert.match(python, /body: models\.InputClickHouseSqlQueryRequest\b/);
  assert.match(python, /TypeAdapter\(models\.OutputSchemaF581a22cSchema1\)/);
});

test("Python facade types a referenced parameter schema as its contract model", () => {
  const ordered = operation("listWidgets", { "204": {} }, [
    { name: "order", wireName: "order", location: "query", required: false,
      schema: { $ref: "#/components/schemas/SortOrder", description: "Sort direction." } },
    { name: "widgetId", wireName: "widgetId", location: "path", required: true,
      schema: { $ref: "#/components/schemas/WidgetId" } },
  ]);
  const python = renderPython({ operations: [ordered] });
  assert.match(python, /order: models\.SortOrder \| MISSING = Field\(default=MISSING, alias="order"\)/);
  assert.match(python, /widget_id: models\.WidgetId = Field\(alias="widgetId"\)/);
  const constrained = operation("listWidgets", { "204": {} }, [
    { name: "order", wireName: "order", location: "query", required: false,
      schema: { $ref: "#/components/schemas/SortOrder", maxLength: 4 } },
  ]);
  assert.throws(() => renderPython({ operations: [constrained] }), /Unsupported parameter schema reference/);
});

test("one package's façade regenerates without rewriting the other's", () => {
  const both = { typescript: true, python: true };
  assert.deepEqual(facadeLanguages(both), both);
  assert.deepEqual(facadeLanguages(both, "typescript"), { typescript: true, python: false });
  assert.deepEqual(facadeLanguages(both, "python"), { typescript: false, python: true });
  assert.deepEqual(facadeLanguages({ typescript: false, python: true }), { typescript: false, python: true });
  assert.throws(() => facadeLanguages(both, "rust"), /--only must be typescript or python/);
  assert.throws(() => facadeLanguages({ typescript: false, python: true }, "typescript"), /not present/);
});

test("Python resources are snake_case while TypeScript keeps camelCase", () => {
  const nested = operation("getAgentProfile", { "204": {} });
  nested.namespace = ["projects", "agentProfile"];
  const fixture = { operations: [nested] };
  const python = renderPython(fixture);
  assert.match(python, /self\.agent_profile = SyncProjectsAgentProfileResource\(transport, raw\)/);
  assert.match(python, /self\.agent_profile = AsyncProjectsAgentProfileResource\(transport, raw\)/);
  assert.doesNotMatch(python, /self\.agentProfile/);
  assert.match(renderTypeScript(fixture), /agentProfile: \{/);
});
