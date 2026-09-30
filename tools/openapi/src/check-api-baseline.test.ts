import assert from "node:assert/strict";
import test from "node:test";
import { checkApiBaseline } from "./check-api-baseline.js";
import type { JsonObject } from "./shared.js";

const config = {
  environment: "staging", schemaPath: "openapi/staging.json",
  defaultBaseUrl: "https://api.staging.example.test", authEndpoints: {},
};
function source(): JsonObject {
  return {
    openapi: "3.1.0", info: { title: "Example", version: "2026-07-01" },
    servers: [{ url: config.defaultBaseUrl }],
    paths: { "/v1/items": { get: { operationId: "listItems", responses: {
      "200": { description: "Items", content: { "application/json": { schema: {
        type: "object", additionalProperties: { type: "string" },
        properties: { state: { type: "string", enum: ["ready"] } },
      } } } },
    } } } },
  };
}

test("baseline validation leaves schemas intact for the wire-contract diff", () => {
  const base = source();
  const candidate = source();
  candidate.paths = {};
  const before = structuredClone({ base, candidate });
  assert.equal(checkApiBaseline(base, candidate, config), "2026-07-01");
  assert.deepEqual({ base, candidate }, before);
});

test("different or absent document versions cannot be reported as compatible", () => {
  for (const version of ["2026-09-01", "", undefined]) {
    const candidate = source();
    candidate.info = version === undefined ? { title: "Example" } : { title: "Example", version };
    assert.throws(() => checkApiBaseline(source(), candidate, config), /version/);
  }
});

test("a version change points maintainers to the manual baseline procedure", () => {
  const candidate = source();
  candidate.info = { title: "Example", version: "2026-09-01" };
  assert.throws(
    () => checkApiBaseline(source(), candidate, config),
    /base "2026-07-01", candidate "2026-09-01".*Accepting a new API document version/,
  );
});

test("staging and production snapshots require separate baselines", () => {
  const production = { ...config, environment: "production", defaultBaseUrl: "https://api.example.test" };
  const candidate = source();
  candidate.servers = [{ url: production.defaultBaseUrl }];
  assert.throws(() => checkApiBaseline(source(), candidate, production), /server does not match/);
});

test("routing overrides cannot silently select another API target", () => {
  const candidate = source();
  candidate.paths = { "/v1/items": { servers: [{ url: "https://other.example.test" }] } };
  assert.throws(() => checkApiBaseline(source(), candidate, config), /server does not match/);
});
