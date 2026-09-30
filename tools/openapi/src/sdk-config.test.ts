import assert from "node:assert/strict";
import test from "node:test";
import { runtimeFiles } from "./generate-runtime.js";
import { authOrigins, bindSchemaTarget, validateSdkConfig, validateSchemaTarget } from "./sdk-config.js";
import type { JsonObject } from "./shared.js";

const config = {
  environment: "production",
  schemaPath: "openapi/staging.json",
  defaultBaseUrl: "https://api.example.test",
  authEndpoints: { oauth: { flows: { authorizationCode: {
    authorizationUrl: "https://identity.example.test/authorize",
    tokenUrl: "https://identity.example.test/token",
  } } } },
};
const contract = (): JsonObject => ({
  servers: [{ url: config.defaultBaseUrl }],
  components: { securitySchemes: { oauth: {
    type: "oauth2", flows: { authorizationCode: {
      ...config.authEndpoints.oauth.flows.authorizationCode,
      scopes: { "project:read": "Read projects" },
    } },
  } } },
});

test("rejects missing production endpoints, staging defaults and unknown config fields", () => {
  for (const patch of [
    { defaultBaseUrl: null },
    { defaultBaseUrl: "https://api.staging.example.test" },
    { openapiSourceUrl: "https://api.example.test/openapi.json" },
    { defaultBaseUrl: "http://api.example.test" },
    { schemaPath: "openapi/../../secrets.json" },
    { defaultBaseUrl: "https://username:password@api.example.test" },
    { defaultBaseUrl: "https://api.example.test/" },
    { apiKey: "must-not-be-embedded" },
    { allowedAuthOrigins: [] },
    { authEndpoints: null },
    { authEndpoints: { oauth: { flows: {} } } },
    { authEndpoints: { oauth: { flows: { unknownFlow: {} } } } },
    { authEndpoints: { oauth: { flows: { authorizationCode: { authorizationUrl: null, tokenUrl: null } } } } },
    { authEndpoints: { oauth: { openIdConnectUrl: "https://identity-staging.example.test/discovery" } } },
    { authEndpoints: { oauth: { openIdConnectUrl: "https://identity.example.test/discovery", flows: {} } } },
    { authEndpoints: { oauth: { flows: { authorizationCode: { ...config.authEndpoints.oauth.flows.authorizationCode, clientSecret: "not-config" } } } } },
  ]) assert.throws(() => validateSdkConfig({ ...config, ...patch }));
  assert.throws(() => validateSdkConfig(config, "staging"));
});

test("the internal contract is openapi/staging.json; the public repository's is openapi/openapi.json", () => {
  assert.equal(validateSdkConfig(config, "production").schemaPath, "openapi/staging.json");
  assert.equal(validateSdkConfig({ ...config, schemaPath: "openapi/openapi.json" }, "production").schemaPath, "openapi/openapi.json");
  const staging = { ...config, environment: "staging", defaultBaseUrl: "https://api.staging.example.test", authEndpoints: {} };
  assert.equal(validateSdkConfig(staging, "staging").schemaPath, "openapi/staging.json");
  assert.throws(() => validateSdkConfig({ ...staging, schemaPath: "openapi/openapi.json" }), /schemaPath/);
  assert.throws(() => validateSdkConfig({ ...config, schemaPath: "openapi/production.json" }), /schemaPath/);
});

test("a naming waiver is a complete record, and only for production", () => {
  const namingWaiver = { reason: "Preview release", approvedBy: "API owner", approvedOn: "2026-09-29", until: "0.2.0" };
  assert.deepEqual(validateSdkConfig({ ...config, namingWaiver }, "production").namingWaiver, namingWaiver);
  assert.equal(validateSdkConfig(config).namingWaiver, undefined);
  for (const patch of [
    { reason: "" },
    { approvedBy: undefined },
    { approvedOn: "29 September 2026" },
    { until: "next" },
    { expires: "2026-10-31" },
  ]) assert.throws(() => validateSdkConfig({ ...config, namingWaiver: { ...namingWaiver, ...patch } }), /namingWaiver/);
  assert.throws(() => validateSdkConfig({ ...config, namingWaiver: true }), /namingWaiver/);
  const staging = { ...config, environment: "staging", defaultBaseUrl: "https://api.staging.example.test", authEndpoints: {} };
  assert.throws(() => validateSdkConfig({ ...staging, namingWaiver }), /only to the production/);
});

test("validates exact API and authentication URLs without rewriting the contract", () => {
  const target = validateSdkConfig(config, "production");
  const source = contract();
  const before = structuredClone(source);
  validateSchemaTarget(source, target);
  assert.deepEqual(source, before);
  assert.deepEqual(authOrigins(target), ["https://identity.example.test"]);
  assert.throws(() => validateSchemaTarget({ ...source, servers: [{ url: "https://api.staging.example.test" }] }, target), /server/);
  assert.throws(() => validateSchemaTarget(source, { ...target, authEndpoints: {} }), /authentication endpoint/);
  // Same hostname is insufficient: the configured endpoint path must match too.
  const wrongPath = structuredClone(config);
  wrongPath.authEndpoints.oauth.flows.authorizationCode.tokenUrl += "/different";
  assert.throws(() => validateSchemaTarget(source, validateSdkConfig(wrongPath)), /authentication endpoint/);
  assert.throws(() => validateSchemaTarget({ servers: source.servers! }, target), /authentication endpoints/);
});

test("rejects nested server fallbacks and unconfigured OAuth/OIDC endpoints", () => {
  const target = validateSdkConfig(config);
  for (const servers of [null, [], "https://api.example.test", [{ url: "https://other.example.test" }]]) {
    assert.throws(() => validateSchemaTarget({ ...contract(), paths: { "/test": { get: { servers } } } }, target), /server/);
  }
  for (const patch of [
    { webhooks: { received: { servers: [{ url: "https://other.example.test" }] } } },
    { components: { pathItems: { shared: { servers: [] } } } },
    { components: { callbacks: { received: { "{$request.body#/url}": { servers: [] } } } } },
    { components: { links: { next: { server: { url: "https://other.example.test" } } } } },
    { paths: { "/test": { get: { responses: { "200": { links: { next: { server: { url: "https://other.example.test" } } } } } } } } },
  ]) assert.throws(() => validateSchemaTarget({ ...contract(), ...patch } as JsonObject, target), /server/);
  for (const scheme of [
    { type: "openIdConnect", openIdConnectUrl: "https://other.example.test/discovery" },
    { type: "oauth2", flows: { authorizationCode: { authorizationUrl: "https://identity.example.test/authorize", tokenUrl: "https://other.example.test/token" } } },
    { type: "oauth2", flows: { clientCredentials: { tokenUrl: "https://identity.example.test/token", refreshUrl: "https://other.example.test/refresh" } } },
    { type: "oauth2", flows: { authorizationCode: { authorizationUrl: "https://identity.example.test/authorize" } } },
    { type: "oauth2", flows: { unknownFlow: {} } },
    { type: "oauth2", flows: {} },
  ]) assert.throws(() => validateSchemaTarget({ ...contract(), components: { securitySchemes: { oauth: scheme } } } as JsonObject, target));
});

test("explicit development binding changes only API and auth endpoint metadata", () => {
  const target = validateSdkConfig(config);
  const stage = validateSdkConfig({ ...config, environment: "staging", defaultBaseUrl: "https://api.staging.example.test", authEndpoints: {
    oauth: { flows: { authorizationCode: { authorizationUrl: "https://identity.staging.example.test/authorize", tokenUrl: "https://identity.staging.example.test/token" } } },
  } });
  // Construct a staging source using the same explicit binding in reverse.
  const source = bindSchemaTarget(contract(), target, stage);
  const server = { url: stage.defaultBaseUrl, description: "API" };
  const response = { links: { next: { server: structuredClone(server) } }, headers: { servers: { schema: { type: "string" } } } };
  const pathItem = { servers: [structuredClone(server)], get: { operationId: "readItem", servers: [structuredClone(server)], responses: { "200": response } } };
  source.paths = { "/items": pathItem };
  source.webhooks = { received: structuredClone(pathItem) };
  const components = source.components as JsonObject;
  components.pathItems = { shared: structuredClone(pathItem) };
  components.links = { next: { server: structuredClone(server) } };
  components.responses = { shared: structuredClone(response) };
  components.callbacks = { received: { "{$request.body#/callbackUrl}": structuredClone(pathItem) } };
  pathItem.get = { ...pathItem.get, callbacks: { received: { "{$request.body#/callbackUrl}": structuredClone(pathItem) } } } as typeof pathItem.get;
  components.schemas = { Item: { type: "object", properties: { servers: { type: "string", const: stage.defaultBaseUrl } }, example: { tokenUrl: stage.authEndpoints.oauth!.flows!.authorizationCode!.tokenUrl! } } };
  const before = structuredClone(source);
  const output = bindSchemaTarget(source, stage, target);
  validateSchemaTarget(output, target);
  assert.deepEqual(source, before);
  assert.deepEqual((output.components as JsonObject).schemas, components.schemas, "Body fields and example URLs are data");
  assert.deepEqual(bindSchemaTarget(output, target, stage), source, "Rebinding back must recover every non-target byte value");
  assert.deepEqual(bindSchemaTarget(source, stage, target), output, "Binding is deterministic");
  assert.throws(() => bindSchemaTarget(source, stage, { ...target, authEndpoints: {} }), /preserve/);
  assert.throws(() => bindSchemaTarget(source, target, stage), /server/);
});

test("binding supports OIDC and every OAuth flow without changing scopes or security", () => {
  const sourceConfig = validateSdkConfig({ ...config, authEndpoints: {
    oidc: { openIdConnectUrl: "https://identity.example.test/discovery" },
    oauth: { flows: {
      implicit: { authorizationUrl: "https://identity.example.test/authorize" },
      password: { tokenUrl: "https://identity.example.test/token" },
      clientCredentials: { tokenUrl: "https://identity.example.test/token", refreshUrl: "https://identity.example.test/refresh" },
      authorizationCode: config.authEndpoints.oauth.flows.authorizationCode,
    } },
  } });
  const flows = Object.fromEntries(Object.entries(sourceConfig.authEndpoints.oauth!.flows!).map(([key, fields]) => [key, { ...fields, scopes: { read: "Read" } }]));
  const source = { servers: [{ url: sourceConfig.defaultBaseUrl }], security: [{ oauth: ["read"] }], components: { securitySchemes: {
    oidc: { type: "openIdConnect", openIdConnectUrl: sourceConfig.authEndpoints.oidc!.openIdConnectUrl! },
    oauth: { type: "oauth2", flows }, bearer: { type: "http", scheme: "bearer" },
  } } };
  const target = validateSdkConfig(JSON.parse(JSON.stringify(sourceConfig).replaceAll("identity.example.test", "identity2.example.test")));
  const output = bindSchemaTarget(source, sourceConfig, target);
  validateSchemaTarget(output, target);
  assert.deepEqual(output.security, source.security);
  assert.deepEqual(bindSchemaTarget(output, target, sourceConfig), source);
});

test("all three runtime modules are deterministic and use the selected default", () => {
  const target = validateSdkConfig(config);
  const generated = runtimeFiles(target);
  assert.deepEqual(generated, runtimeFiles(target));
  assert.equal(Object.keys(generated).length, 3);
  for (const contents of Object.values(generated)) {
    assert.ok(contents.includes(config.defaultBaseUrl));
    assert.ok(!contents.includes("staging"));
  }
});
