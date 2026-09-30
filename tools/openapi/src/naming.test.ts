import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  checkContractNaming,
  checkRustNaming,
  checkTypeScriptNaming,
  componentNameProblems,
  SCHEMA_DOMAIN_NOUNS,
  countViolations,
  nominalKind,
  renderNamingReport,
} from "./naming.js";
import { repositoryRoot, type JsonObject } from "./shared.js";

const fixture = (name: string): JsonObject =>
  JSON.parse(readFileSync(resolve(repositoryRoot, `tools/openapi/fixtures/naming/${name}.json`), "utf8")) as JsonObject;

test("a contract that names every nominal schema passes the contract check", () => {
  const report = checkContractNaming(fixture("named"));
  assert.deepEqual(report.violations, []);
  assert.equal(report.operations, 7);
  assert.equal(report.components, 20);
});

test("an unnamed contract fails with pointers and owning operations", () => {
  const { violations } = checkContractNaming(fixture("unnamed"));
  const summary = violations.map(({ rule, pointer, operations }) => `${rule} ${pointer} ${operations.join(",")}`).sort();
  assert.deepEqual(summary, [
    "component-name /components/schemas/Photon20260701_Widget createWidget,getWidget,listWidgets",
    "component-name /components/schemas/PhotonProblem_NOT_AUTHENTICATED_401 listWidgets",
    "component-name /components/schemas/Shared_0ab1d08dd35d1f91 createWidget,getWidget,listWidgets",
    "component-name /components/schemas/WidgetIdSchema createWidget,getWidget,listWidgets",
    "component-name /components/schemas/__schema0 createWidget",
    "inline-body-root /paths/~1v1~1widgets/get/responses/200/content/application~1json/schema listWidgets",
    "inline-body-root /paths/~1v1~1widgets/post/requestBody/content/application~1json/schema createWidget",
    "inline-body-root /paths/~1v1~1widgets/post/responses/409/content/application~1problem+json/schema createWidget",
    "inline-enum /components/schemas/Photon20260701_Widget/properties/status createWidget,getWidget,listWidgets",
    "inline-enum /paths/~1v1~1widgets/get/parameters/0/schema listWidgets",
    "inline-object /components/schemas/Photon20260701_Widget/properties/owner/anyOf/0 createWidget,getWidget,listWidgets",
    "inline-union-member /paths/~1v1~1widgets/post/responses/409/content/application~1problem+json/schema/oneOf/0 createWidget",
    "inline-union-member /paths/~1v1~1widgets/post/responses/409/content/application~1problem+json/schema/oneOf/1 createWidget",
  ]);
  // An unreachable component is not part of the public surface.
  assert.ok(!violations.some((violation) => violation.name === "input__Unused"));
  const report = renderNamingReport("Contract names", violations);
  assert.match(report, /13 naming violations/);
  assert.match(report, /\| `contract\/inline-body-root` \| 3 \|/);
});

test("an open-union fallback component is part of the public surface", () => {
  const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
  const status = (value: string) => ({
    type: "object",
    additionalProperties: false,
    properties: { platform: { type: "string" }, status: { const: value } },
    required: ["platform", "status"],
  });
  const document: JsonObject = {
    openapi: "3.1.0",
    info: { title: "Fallback", version: "1" },
    paths: {
      "/v1/messages": {
        get: {
          operationId: "listMessages",
          responses: { "200": { description: "OK", content: { "application/json": { schema: ref("Message") } } } },
        },
      },
    },
    components: {
      schemas: {
        Message: {
          anyOf: [ref("SmsMessage")],
          "x-photon-extension": { discriminator: "platform", fallback: "#/$defs/UnknownMessage" },
        },
        SmsMessage: { ...status("sent"), properties: { platform: { const: "sms" }, content: ref("Content") } },
        // Reached only through the fallback: its inline members need names.
        UnknownMessage: { oneOf: [status("received"), status("failed")] },
        Content: { anyOf: [ref("TextContent")], "x-photon-extension": { fallback: "#/$defs/UnknownContent" } },
        TextContent: { type: "object", properties: { text: { type: "string" } } },
        // Resolved like tools/release/public-contract.mjs: a "_"-separated suffix.
        Photon20260701_UnknownContent: { type: "object", properties: { type: { type: "string" } } },
        Unreached: { oneOf: [status("a"), status("b")] },
      },
    },
  };
  const { violations } = checkContractNaming(document);
  assert.deepEqual(
    violations.map(({ rule, pointer, operations }) => `${rule} ${pointer} ${operations.join(",")}`).sort(),
    [
      "component-name /components/schemas/Photon20260701_UnknownContent listMessages",
      "inline-union-member /components/schemas/UnknownMessage/oneOf/0 listMessages",
      "inline-union-member /components/schemas/UnknownMessage/oneOf/1 listMessages",
    ],
  );

  const schemas = (document.components as JsonObject).schemas as JsonObject;
  delete schemas.Photon20260701_UnknownContent;
  const unresolved = checkContractNaming(document).violations.filter(({ rule }) => rule === "unresolved-reference");
  assert.deepEqual(unresolved.map(({ name }) => name), ["UnknownContent"]);
});

test("component names follow the convention", () => {
  for (const name of ["Widget", "ProjectId", "TenDlcBrand", "OAuthClient", "CreateProjectConflictProblem", "E164PhoneNumber"]) {
    assert.deepEqual(componentNameProblems(name), [], name);
  }
  // Documented exception: the schema document is the domain concept.
  assert.deepEqual([...SCHEMA_DOMAIN_NOUNS], ["WebhookEventSchema"]);
  assert.deepEqual(componentNameProblems("WebhookEventSchema"), []);
  // The exception is exact: similar names and every other rule still apply.
  assert.ok(componentNameProblems("WebhookEventIdSchema").some((message) => /`Schema`\/`IdSchema` suffix/.test(message)));
  assert.ok(componentNameProblems("WebhookSchema").some((message) => /`Schema`\/`IdSchema` suffix/.test(message)));
  const expectations: [string, RegExp][] = [
    ["input__Widget", /direction prefix/],
    ["output__Photon20260701_Message", /dated prefix/],
    ["Photon20260701_Shared_46aa108ba50d9cf9", /hash name `Shared_<hash>`/],
    ["Schema_68b0acb5___schema0", /hash name `Schema_<hash>`/],
    ["__schema0", /zod default id/],
    ["Authorization_Problem_INSUFFICIENT_SCOPE_403", /status-coded problem/],
    ["PhotonProblem_FORBIDDEN_403", /status-coded problem/],
    ["ProjectIdSchema", /`Schema`\/`IdSchema` suffix/],
    ["MessageAccepted0", /trailing number/],
    ["WidgetDeadbeef12", /hash-like/],
    ["widget", /not PascalCase/],
  ];
  for (const [name, problem] of expectations) {
    assert.ok(componentNameProblems(name).some((message) => problem.test(message)), `${name}: ${componentNameProblems(name).join("; ")}`);
  }
});

test("scalars, scalar arrays, maps and nullable references need no name", () => {
  for (const schema of [
    { type: "string", format: "date-time" },
    { type: ["string", "null"] },
    { const: "widget.created" },
    { type: "array", items: { type: "string" } },
    { type: "object", additionalProperties: { type: "string" } },
    { type: "object" },
    { anyOf: [{ $ref: "#/components/schemas/Widget" }, { type: "null" }] },
    { allOf: [{ $ref: "#/components/schemas/Widget" }], description: "The widget." },
    { $ref: "#/components/schemas/Widget", description: "The widget." },
    true,
  ]) {
    assert.equal(nominalKind(schema as JsonObject), undefined, JSON.stringify(schema));
  }
  assert.equal(nominalKind({ type: "object", properties: { a: { type: "string" } } }), "object");
  assert.equal(nominalKind({ type: "object", additionalProperties: false }), "object");
  assert.equal(nominalKind({ type: "string", enum: ["a"] }), "enum");
  assert.equal(nominalKind({ oneOf: [{ type: "string" }, { type: "integer" }] }), "union");
  assert.equal(nominalKind({ allOf: [{ $ref: "#/components/schemas/A" }, { $ref: "#/components/schemas/B" }] }), "intersection");
});

test("TypeScript names must be components, their read-only splits or operation-derived", () => {
  const named = fixture("named");
  const types = [
    "export type ClientOptions = {};",
    "export type Widget = {};",
    "export type WidgetWritable = {};",
    "export type ValidationIssueLocation = 'body';",
    "export type ListWidgetsData = {};",
    "export type ListWidgetsErrors = {};",
    "export type ListWidgetsError = {};",
    "export type ListWidgetsResponses = {};",
    "export type ListWidgetsResult = {};",
    // A contract component named like the operation keeps its name.
    "export type CountWidgetsResponse = {};",
    "export type CountWidgetsResult = {};",
    "export const SortOrder = { ASC: 'asc' } as const;",
  ].join("\n");
  const zod = [
    "export const zWidget = z.object({});",
    "export type WidgetZodInput = z.input<typeof zWidget>;",
    "export type WidgetWritableZodOutput = z.output<typeof zWidget>;",
    "export const zListWidgetsQuery = z.object({});",
    "export const zCreateWidgetBody = z.object({});",
    "export const zGetWidgetPath = z.object({});",
    "export const zListWidgetsResult = z.object({});",
    "export type listWidgetsResultZodOutput = z.output<typeof zListWidgetsResult>;",
  ].join("\n");
  assert.deepEqual(checkTypeScriptNaming(named, [
    { file: "packages/typescript/src/generated/types.gen.ts", text: types },
    { file: "packages/typescript/src/generated/zod.gen.ts", text: zod },
  ]), []);
  const positional = [
    "export type ListWidgetsResponse200ApplicationJson = {};",
    "export type CreateWidgetRequestApplicationJson = {};",
    "export type CountWidgetsResponse2 = {};",
    // Hey API's default name for the success-body union: configured away.
    "export type GetWidgetResponse = {};",
    "export type ListWidgetsDataWritable = {};",
    "export type Photon20260701WidgetOwner = {};",
  ].join("\n");
  const found = checkTypeScriptNaming(named, [{ file: "packages/typescript/src/generated/types.gen.ts", text: positional }]);
  // Component names keep their exact spelling, including runs of capitals.
  const acronyms = structuredClone(named);
  const schemas = (acronyms.components as JsonObject).schemas as JsonObject;
  schemas.AuthorizedOAuthApplication = { type: "object", properties: {} };
  schemas.WebhookM2MConfiguration = { type: "object", properties: {} };
  const exact = [
    "export type AuthorizedOAuthApplication = {};",
    "export type WebhookM2MConfigurationWritable = {};",
  ].join("\n");
  const exactZod = [
    "export const zAuthorizedOAuthApplication = z.object({});",
    "export type AuthorizedOAuthApplicationZodInput = z.input<typeof zAuthorizedOAuthApplication>;",
    "export const zWebhookM2MConfiguration = z.object({});",
    "export type WebhookM2MConfigurationZodOutput = z.output<typeof zWebhookM2MConfiguration>;",
  ].join("\n");
  assert.deepEqual(checkTypeScriptNaming(acronyms, [
    { file: "packages/typescript/src/generated/types.gen.ts", text: exact },
    { file: "packages/typescript/src/generated/zod.gen.ts", text: exactZod },
  ]), []);
  const recased = checkTypeScriptNaming(acronyms, [
    { file: "packages/typescript/src/generated/types.gen.ts", text: "export type AuthorizedOauthApplication = {};\nexport type WebhookM2mConfigurationWritable = {};\nexport type widget = {};" },
    { file: "packages/typescript/src/generated/zod.gen.ts", text: "export const zWebhookM2mConfiguration = z.object({});\nexport type webhookM2MConfigurationZodInput = z.input<typeof zWebhookM2MConfiguration>;" },
  ]);
  assert.deepEqual(recased.map(({ rule, name }) => [rule, name]), [
    ["component-case", "AuthorizedOauthApplication"],
    ["component-case", "WebhookM2mConfigurationWritable"],
    ["component-case", "widget"],
    ["component-case", "zWebhookM2mConfiguration"],
    ["component-case", "webhookM2MConfigurationZodInput"],
  ]);
  assert.match(recased[0]!.message, /changes the spelling of contract component AuthorizedOAuthApplication/);
  assert.deepEqual(found.map(({ rule, name, operations }) => [rule, name, operations]), [
    ["hoisted-root", "ListWidgetsResponse200ApplicationJson", ["listWidgets"]],
    ["hoisted-root", "CreateWidgetRequestApplicationJson", ["createWidget"]],
    ["unnamed-type", "CountWidgetsResponse2", []],
    ["unnamed-type", "GetWidgetResponse", []],
    ["writable-without-component", "ListWidgetsDataWritable", ["listWidgets"]],
    ["unnamed-type", "Photon20260701WidgetOwner", []],
  ]);
});

test("Rust names must be components or operation-derived; positional items fail", () => {
  const named = fixture("named");
  const clean = [
    "mod support {",
    "    pub struct Internal {}",
    "}",
    "pub mod types {",
    "    pub struct Widget {",
    "        pub id: String,",
    "    }",
    "    pub enum WidgetEvent {",
    "        WidgetCreatedEvent(Box<WidgetCreatedEvent>),",
    "    }",
    "    pub use self::Widget as WidgetOwner;",
    "}",
    "pub struct ListWidgetsParams {}",
    "pub struct ListWidgetsStatus200Headers {}",
    "pub use self::ListWidgetsStatus200Headers as GetWidgetStatus200Headers;",
    // A `default` response's headers.
    "pub use self::ListWidgetsStatus200Headers as GetWidgetDefaultHeaders;",
    "pub enum GetWidgetError {}",
    "pub type CountWidgetsError = ();",
    "pub struct Client {}",
  ].join("\n");
  assert.deepEqual(checkRustNaming(named, clean), []);
  // Component names are spelled exactly: a case change fails.
  const recased = clean.replace("pub struct Widget {", "pub struct WIDGET {");
  assert.deepEqual(checkRustNaming(named, recased).map(({ rule, name }) => [rule, name]), [["component-case", "WIDGET"]]);
  const positional = [
    "pub mod types {",
    "    pub type Widgetname = String;",
    "    pub type WidgetPageitems = Vec<Widget>;",
    "    pub type WidgetIdC5b75d45 = String;",
    "    pub enum WidgetEventVariant1kind {",
    "    }",
    "    pub enum SortOrderOrUnknown {",
    "        Variant0(String),",
    "    }",
    "    pub struct Widgetlabels {",
    "    }",
    "}",
    "pub mod servers {",
    "    pub struct Server0 {}",
    "}",
    "pub struct ListWidgetsResponse200ApplicationJsonOwner {}",
  ].join("\n");
  const found = checkRustNaming(named, positional);
  assert.deepEqual(found.map(({ rule, name }) => [rule, name]), [
    ["scalar-alias", "Widgetname"],
    ["position-alias", "WidgetPageitems"],
    ["hash-suffix", "WidgetIdC5b75d45"],
    ["variant-index", "WidgetEventVariant1kind"],
    ["unnamed-type", "SortOrderOrUnknown"],
    ["variant-index", "SortOrderOrUnknown::Variant0"],
    ["unnamed-type", "Widgetlabels"],
    ["server-index", "servers::Server0"],
    ["unnamed-type", "ListWidgetsResponse200ApplicationJsonOwner"],
  ]);
  assert.deepEqual(countViolations(found), {
    "rust/hash-suffix": 1,
    "rust/position-alias": 1,
    "rust/scalar-alias": 1,
    "rust/server-index": 1,
    "rust/unnamed-type": 3,
    "rust/variant-index": 2,
  });
});
