import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  addUnknownPlatformMembers,
  hoistOperationSchemas,
  laneFor,
  manifestOperation,
  prepareSdk,
} from "./prepare-sdk.js";
import { repositoryRoot, type JsonObject } from "./shared.js";

const fixture = (name: string): JsonObject =>
  JSON.parse(readFileSync(resolve(repositoryRoot, `tools/openapi/fixtures/naming/${name}.json`), "utf8")) as JsonObject;

test("SDK preparation rejects invalid source references and duplicate operation IDs", () => {
  const source: JsonObject = {
    openapi: "3.1.0",
    info: { title: "Fixture", version: "1.0.0" },
    paths: { "/example": { get: { operationId: "getExample", responses: { "204": { description: "No content" } } } } },
  };
  assert.throws(() => prepareSdk({ ...source, openapi: "3.0.0" }), /OpenAPI 3.1/);
  for (const reference of ["#/components/schemas/Missing", "https://example.test/schema.json"]) {
    assert.throws(() => prepareSdk({ ...source, components: { schemas: { Invalid: { $ref: reference } } } }),
      /Unresolved reference|External reference/);
  }
  assert.throws(() => prepareSdk({ ...source, paths: {
    "/first": { get: { operationId: "duplicate", responses: {} } },
    "/second": { post: { operationId: "duplicate", responses: {} } },
  } }), /Duplicate operationId duplicate/);
});

test("RPC manifest retains operation prose without changing the callable surface", () => {
  const operation: JsonObject = {
    operationId: "getProject",
    summary: "Get a project",
    description:
      "Returns the project visible to the caller.\n\nRequires project read access.",
    responses: { "200": { description: "OK" } },
  };
  const documented = manifestOperation(
    "/v1/projects/{projectId}", "get", {}, operation,
  );
  assert.equal(documented.summary, operation.summary);
  assert.equal(documented.description, operation.description);
  const { summary, description, ...surface } = documented;
  assert.deepEqual(surface, manifestOperation("/v1/projects/{projectId}", "get", {}, {
    ...operation,
    summary: " ",
    description: "\n",
  }));
});

test("organization project routes retain their RPC aliases and required scope", () => {
  for (const [method, suffix, operationId, rpcMethod] of [
    ["post", "", "createProject", "create"],
    ["get", "", "listProjects", "list"],
    ["get", "/count", "countProjects", "count"],
  ] as const) {
    const parameter = {
      name: "organizationId",
      in: "path",
      required: true,
      schema: { type: "string" },
    };
    const operation = manifestOperation(
      `/v1/organizations/{organizationId}/projects${suffix}`,
      method,
      { parameters: [parameter] },
      { operationId },
    );

    assert.deepEqual(operation.namespace, ["organizations", "projects"]);
    assert.equal(operation.rpcMethod, rpcMethod);
    assert.deepEqual(operation.parameters, [{
      name: "organizationId",
      wireName: "organizationId",
      location: "path",
      required: true,
      schema: { type: "string" },
    }]);
  }
});

test("organization namespaces respect the owning resource and path boundaries", () => {
  for (const [path, operationId, namespace] of [
    ["/v1/organizations/{organizationId}/billing/projects/{projectId}/cancel", "cancelSubscription", ["organizations", "billing"]],
    ["/v1/organizations/{organizationId}/billing/invoices", "listInvoices", ["organizations", "billing"]],
    ["/v1/organizations/{organization_id}/10dlc/brands", "listTenDlcBrands", ["organizations"]],
    ["/v1/organizations", "listOrganizations", ["organizations"]],
    ["/v1/organizations/{organizationId}", "getOrganization", ["organizations"]],
    ["/v1/organizations-archive", "getArchive", ["system"]],
    ["/v1/projects", "createProject", ["projects"]],
    ["/v1/projects/{projectId}", "getProject", ["projects"]],
    ["/v1/projects/{projectId}/billing", "getBillingOverview", ["projects", "billing"]],
    ["/v1/auth/organizations/{orgId}/sso", "getOrganizationSsoConfiguration", ["auth"]],
  ] as const) {
    assert.deepEqual(
      manifestOperation(path, "get", {}, { operationId }).namespace,
      namespace,
      path,
    );
  }
});

test("SDK preparation preserves distinct schemas for each successful status", () => {
  const components: JsonObject = {};
  const operation: JsonObject = {
    operationId: "purchaseNumber",
    responses: {
      "201": {
        description: "completed",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status", "number"],
              properties: {
                status: { const: "completed" },
                number: { type: "string" },
              },
            },
          },
        },
      },
      "202": {
        description: "pending",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["status"],
              properties: {
                status: { const: "pending" },
              },
            },
          },
        },
      },
    },
  };

  hoistOperationSchemas("purchaseNumber", operation, components);
  const manifest = manifestOperation(
    "/v1/numbers",
    "post",
    {},
    operation,
  );

  assert.deepEqual(manifest.responses, {
    "201": {
      "application/json":
        "#/components/schemas/PurchaseNumberResponse201ApplicationJson",
    },
    "202": {
      "application/json":
        "#/components/schemas/PurchaseNumberResponse202ApplicationJson",
    },
  });
  assert.notDeepEqual(
    components.PurchaseNumberResponse201ApplicationJson,
    components.PurchaseNumberResponse202ApplicationJson,
  );
});

for (const direction of ["request", "response"] as const) {
  test(`${direction} preparation keeps schema keywords used as property names intact`, () => {
    const fields: JsonObject = {
      properties: { type: "object", additionalProperties: {} },
      additionalProperties: { type: "string", enum: ["known"] },
      type: { type: "string" },
      $ref: { type: "object", properties: { id: { type: "string" } } },
    };
    const schema = { type: "object", properties: fields };
    const original = structuredClone(schema);
    const components: JsonObject = {};
    const media = { "application/json": { schema } };
    const operation: JsonObject = direction === "request"
      ? { requestBody: { content: media } }
      : { responses: { "200": { description: "OK", content: media } } };

    hoistOperationSchemas("ingestEvent", operation, components);

    assert.deepEqual(Object.values(components), [original]);
    assert.deepEqual(schema, original);
  });
}

test("batch event preparation does not add a property named additionalProperties", () => {
  const components: JsonObject = {};
  hoistOperationSchemas("ingestEvents", {
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    properties: { type: "object", additionalProperties: {} },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, components);

  assert.deepEqual(components.IngestEventsRequestApplicationJson, {
    type: "object",
    properties: {
      events: {
        type: "array",
        items: {
          type: "object",
          properties: {
            properties: { type: "object", additionalProperties: {} },
          },
        },
      },
    },
  });
});

test("SDK preparation preserves literal data and nested schema constraints", () => {
  const literal = { type: "object", properties: { type: "string", enum: ["value"] } };
  const components: JsonObject = {};
  hoistOperationSchemas("getExample", {
    responses: {
      "200": {
        description: "OK",
        content: {
          "application/json": {
            schema: {
              default: literal,
              const: literal,
              enum: [literal],
              example: literal,
              examples: [literal],
              "x-example": literal,
              allOf: [{
                type: "object",
                properties: { status: { type: "string", enum: ["ready"] } },
              }],
              $defs: {
                properties: { type: "object", properties: { anything: true } },
              },
            },
          },
        },
      },
    },
  }, components);

  assert.deepEqual(components.GetExampleResponse200ApplicationJson, {
    default: literal,
    const: literal,
    enum: [literal],
    example: literal,
    examples: [literal],
    "x-example": literal,
    allOf: [{
      type: "object",
      properties: { status: { type: "string", enum: ["ready"] } },
    }],
    $defs: {
      properties: {
        type: "object",
        properties: { anything: true },
      },
    },
  });
});

for (const direction of ["request", "response"] as const) {
  test(`${direction} hoisting preserves open, closed and typed objects equally inline and referenced`, () => {
    const schemas: JsonObject = {
      Closed: {
        type: "object", additionalProperties: false, required: ["mode", "name"],
        properties: {
          mode: { type: "string", enum: ["ready", "paused"] },
          name: { type: ["string", "null"], minLength: 2 },
        },
      },
      Typed: {
        type: "object", additionalProperties: { type: "integer", minimum: 1 },
        properties: { label: { type: "string", default: "example" } },
      },
      Open: { type: "object", properties: { count: { type: "integer" } } },
      ExplicitOpen: { type: "object", additionalProperties: true },
    };
    for (const [name, schema] of Object.entries(schemas)) {
      for (const reference of [false, true]) {
        const original = structuredClone(schema);
        const body = reference ? { $ref: `#/components/schemas/${name}` } : schema;
        const media = { "application/json": { schema: body } };
        const operation: JsonObject = {
          operationId: "getExample",
          ...(direction === "request"
            ? { requestBody: { required: true, content: media }, responses: { "204": { description: "No body" } } }
            : { responses: { "200": { description: "Example", content: media } } }),
        };
        const source: JsonObject = {
          openapi: "3.1.0", info: { title: "Fixture", version: "1.0.0" },
          components: { schemas }, paths: { "/example": { post: operation } },
        };
        const { sdk, manifest } = prepareSdk(source);
        const components = (sdk.components as JsonObject).schemas as JsonObject;
        const generated = direction === "request"
          ? "GetExampleRequestApplicationJson" : "GetExampleResponse200ApplicationJson";
        const hoisted = components[generated];
        const resolved = reference ? components[name] : hoisted;
        // The JSON projection expresses an unconstrained schema as {} instead
        // of true; both permit any value for an extra property.
        const expected = name === "ExplicitOpen" ? { ...original as JsonObject, additionalProperties: {} } : original;
        assert.deepEqual(resolved, expected, `${name}: ${reference ? "reference" : "inline"}`);
        // A referenced component keeps its contract name; no copy is invented.
        if (reference) assert.equal(hoisted, undefined);
        const operationMedia = direction === "request"
          ? manifest.operations[0]?.requestBody?.content["application/json"]
          : manifest.operations[0]?.responses["200"]?.["application/json"];
        assert.equal(operationMedia, `#/components/schemas/${reference ? name : generated}`);
        assert.deepEqual(schemas[name], original, "source schema must not be mutated");
        assert.equal(manifest.operationCount, 1);
        assert.equal(manifest.operations[0]?.operationId, "getExample");
      }
    }
  });
}

test("SDK preparation keeps component references and hoists only inline or annotated schemas", () => {
  const components: JsonObject = {
    Problem: { type: "object", properties: { code: { type: "string" } } },
  };
  const operation: JsonObject = {
    operationId: "countProjects",
    requestBody: {
      content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } },
    },
    responses: {
      "200": {
        description: "Count",
        content: { "application/json": { schema: { type: "object", properties: { count: { type: "integer" } } } } },
      },
      "401": {
        description: "Unauthenticated",
        content: { "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } } },
      },
      "403": {
        description: "Forbidden",
        content: {
          "application/problem+json": {
            schema: { $ref: "#/components/schemas/Problem", description: "Annotated reference" },
          },
        },
      },
    },
  };
  hoistOperationSchemas("countProjects", operation, components);
  assert.deepEqual(Object.keys(components).sort(), [
    "CountProjectsResponse200ApplicationJson",
    "CountProjectsResponse403ApplicationProblemPlusJson",
    "Problem",
  ]);
  assert.deepEqual(components.CountProjectsResponse403ApplicationProblemPlusJson, {
    $ref: "#/components/schemas/Problem",
    description: "Annotated reference",
  });
  const manifest = manifestOperation("/v1/projects/count", "post", {}, operation);
  assert.equal(manifest.requestBody?.content["application/json"], "#/components/schemas/Problem");
  assert.equal(manifest.responses["401"]?.["application/problem+json"], "#/components/schemas/Problem");
  assert.equal(
    manifest.responses["200"]?.["application/json"],
    "#/components/schemas/CountProjectsResponse200ApplicationJson",
  );
});

test("a derived schema name never replaces a contract component", () => {
  const existing = { type: "object", properties: { id: { type: "string" } } };
  const components: JsonObject = { ListWidgetsResponse200ApplicationJson: structuredClone(existing) };
  const operation: JsonObject = {
    responses: { "200": { content: { "application/json": { schema: { type: "array" } } } } },
  };
  assert.throws(() => hoistOperationSchemas("listWidgets", operation, components),
    /ListWidgetsResponse200ApplicationJson is already a contract component/);
  assert.deepEqual(components.ListWidgetsResponse200ApplicationJson, existing);
});

test("the public lane does not hoist, and fails on unnamed schemas", () => {
  assert.equal(laneFor({ environment: "production" }), "public");
  assert.equal(laneFor({ environment: "staging" }), "internal");
  const named = fixture("named");
  const { sdk } = prepareSdk(named, { lane: "public" });
  const schemas = (sdk.components as JsonObject).schemas as JsonObject;
  assert.deepEqual(Object.keys(schemas).sort(), Object.keys((named.components as JsonObject).schemas as JsonObject).sort());
  assert.throws(() => prepareSdk(fixture("unnamed"), { lane: "public" }),
    /does not hoist schemas.*13 naming violations[\s\S]*inline-body-root/);
  // The internal lane keeps hoisting inline operation schemas.
  const internal = prepareSdk(fixture("unnamed"), { lane: "internal" }).sdk;
  assert.ok(Object.hasOwn((internal.components as JsonObject).schemas as JsonObject, "ListWidgetsResponse200ApplicationJson"));
});

test("under a naming waiver the public lane derives names like the internal lane", () => {
  const unnamed = fixture("unnamed");
  const waived = prepareSdk(unnamed, { lane: "public", namingWaived: true });
  const internal = prepareSdk(unnamed, { lane: "internal" });
  assert.deepEqual(waived, internal);
  assert.ok(Object.hasOwn((waived.sdk.components as JsonObject).schemas as JsonObject, "ListWidgetsResponse200ApplicationJson"));
  // The waiver keeps deriving names (for example for inline binary bodies)
  // even once the contract is named, so it must be removed to lift it.
  const named = fixture("named");
  assert.deepEqual(prepareSdk(named, { lane: "public", namingWaived: true }), prepareSdk(named, { lane: "internal" }));
});

test("the public lane names the operation of an error with several JSON representations", async () => {
  const { assertPublicErrorRepresentations } = await import("./prepare-sdk.js");
  const source = {
    paths: { "/x": { get: { operationId: "getX", responses: {
      "200": { description: "ok" },
      "401": { description: "no", content: { "application/json": { schema: {} }, "application/problem+json": { schema: {} } } },
    } } } },
  };
  assert.throws(() => assertPublicErrorRepresentations(source as never), /getX 401: application\/json, application\/problem\+json/);
  source.paths["/x"].get.responses["401"].content = { "application/problem+json": { schema: {} } } as never;
  assertPublicErrorRepresentations(source as never);
});

// A contract shaped like the public one: platform unions list known platforms
// and name their fallback in x-photon-extension.
function platformSource(): JsonObject {
  const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
  const closed = (platform: JsonObject, extra: JsonObject = {}) => ({
    type: "object", additionalProperties: false, required: ["platform"], properties: { platform, ...extra },
  });
  const platformExtension = (fallback: string) => ({
    discriminator: "platform", fallback: `#/$defs/${fallback}`, reserved: ["sms", "email"],
  });
  const json = (schema: JsonObject) => ({ content: { "application/json": { schema } } });
  return {
    openapi: "3.1.0",
    info: { title: "Fixture", version: "1.0.0" },
    paths: {
      "/users/{id}": { get: { operationId: "getUser", responses: { "200": { description: "ok", ...json(ref("User")) } } } },
      "/messages": {
        get: { operationId: "getMessage", responses: { "200": { description: "ok", ...json(ref("Message")) } } },
        post: { operationId: "sendMessage", requestBody: json(ref("SendContent")), responses: { "204": { description: "sent" } } },
      },
    },
    components: {
      schemas: {
        User: { anyOf: [ref("SmsUser"), ref("EmailUser")], "x-photon-extension": platformExtension("UnknownUser") },
        SmsUser: closed({ const: "sms", type: "string" }, { handle: { type: "string" } }),
        EmailUser: closed({ const: "email", type: "string" }),
        UnknownUser: closed({ type: "string", minLength: 1 }),
        Message: { anyOf: [ref("SmsMessage")], "x-photon-extension": platformExtension("UnknownMessage") },
        SmsMessage: closed({ const: "sms", type: "string" }, { sender: ref("User") }),
        UnknownMessage: { oneOf: [ref("ReceivedUnknownMessage"), ref("SentUnknownMessage")] },
        ReceivedUnknownMessage: closed({ type: "string" }, { status: { const: "received" }, sender: ref("User") }),
        SentUnknownMessage: closed({ type: "string" }, { status: { const: "sent" }, sender: ref("User") }),
        // A request refers to the platform union too.
        SendContent: {
          anyOf: [ref("SendParticipantsContent")],
          "x-photon-extension": { discriminator: "type", fallback: "#/$defs/UnknownContent" },
        },
        SendParticipantsContent: { type: "object", properties: { added: { type: "array", items: ref("User") } } },
        UnknownContent: { type: "object", additionalProperties: false, properties: { type: { type: "string" } } },
      },
    },
  };
}

test("SDK preparation appends the unknown-platform fallback to response platform unions and opens it", () => {
  const source = platformSource();
  for (const lane of ["public", "internal"] as const) {
    const schemas = (prepareSdk(source, { lane }).sdk.components as JsonObject).schemas as JsonObject;
    const component = (name: string) => schemas[name] as JsonObject;
    const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
    // The fallback is the last member; the extension is kept.
    assert.deepEqual(component("User").anyOf, [ref("SmsUser"), ref("EmailUser"), ref("UnknownUser")]);
    assert.deepEqual(component("User")["x-photon-extension"], ((source.components as JsonObject).schemas as JsonObject).User!["x-photon-extension" as never]);
    assert.deepEqual(component("Message").anyOf, [ref("SmsMessage"), ref("UnknownMessage")]);
    // Fallbacks and their inline or referenced members are open; known platforms stay closed.
    assert.equal(component("UnknownUser").additionalProperties, undefined);
    assert.deepEqual((component("UnknownUser").properties as JsonObject).platform, { type: "string", minLength: 1 });
    assert.equal(component("ReceivedUnknownMessage").additionalProperties, undefined);
    assert.equal(component("SentUnknownMessage").additionalProperties, undefined);
    assert.equal(component("SmsUser").additionalProperties, false);
    assert.equal(component("SmsMessage").additionalProperties, false);
    // A request keeps the known platforms under <Name>Input; content unions are unchanged.
    assert.deepEqual(component("UserInput"), ((source.components as JsonObject).schemas as JsonObject).User);
    assert.deepEqual(((component("SendParticipantsContent").properties as JsonObject).added as JsonObject).items, ref("UserInput"));
    assert.deepEqual(component("SendContent").anyOf, [ref("SendParticipantsContent")]);
    assert.equal(component("UnknownContent").additionalProperties, false);
  }
  // The source is not modified.
  assert.deepEqual(source, platformSource());
  // An inline fallback member (internal lane only) is opened in place.
  const inline = platformSource();
  const inlineSchemas = (inline.components as JsonObject).schemas as JsonObject;
  (inlineSchemas.UnknownMessage as JsonObject).oneOf = [inlineSchemas.ReceivedUnknownMessage!, { $ref: "#/components/schemas/SentUnknownMessage" }];
  const members = ((((prepareSdk(inline, { lane: "internal" }).sdk.components as JsonObject).schemas as JsonObject)
    .UnknownMessage as JsonObject).oneOf as JsonObject[]);
  assert.equal(members[0]!.additionalProperties, undefined);
  assert.equal((inlineSchemas.ReceivedUnknownMessage as JsonObject).additionalProperties, false);
});

test("SDK preparation adds the unknown-platform fallback once and fails where it cannot keep requests exact", () => {
  const listed = platformSource();
  const schemas = (listed.components as JsonObject).schemas as JsonObject;
  (schemas.User as JsonObject).anyOf = [...((schemas.User as JsonObject).anyOf as JsonObject[]), { $ref: "#/components/schemas/UnknownUser" }];
  const prepared = ((prepareSdk(listed, { lane: "public" }).sdk.components as JsonObject).schemas as JsonObject).User as JsonObject;
  assert.equal((prepared.anyOf as JsonObject[]).length, 3);

  // The public contract must publish the fallback; staging's prefixed copies are left alone.
  const missing = platformSource();
  delete ((missing.components as JsonObject).schemas as JsonObject).UnknownUser;
  assert.throws(() => prepareSdk(missing, { lane: "public" }), /reference to missing component UnknownUser/);
  assert.throws(() => addUnknownPlatformMembers(structuredClone(missing), true), /User: the fallback component UnknownUser \(#\/\$defs\/UnknownUser\) is missing/);
  const internal = ((prepareSdk(missing, { lane: "internal" }).sdk.components as JsonObject).schemas as JsonObject);
  assert.equal(((internal.User as JsonObject).anyOf as JsonObject[]).length, 2);

  // A component used by requests and responses cannot refer to both shapes.
  const shared = platformSource();
  const paths = shared.paths as JsonObject;
  (paths["/messages"] as JsonObject).put = {
    operationId: "echoContent",
    requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/SendParticipantsContent" } } } },
    responses: { "200": { description: "ok", content: { "application/json": { schema: { $ref: "#/components/schemas/SendParticipantsContent" } } } } },
  };
  assert.throws(() => prepareSdk(shared, { lane: "public" }), /SendParticipantsContent is used by requests and responses and refers to the platform union User/);
});
