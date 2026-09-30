// Requires operations: changePlan
// This file is part of the public SDK only once every operation above is public.
import assert from "node:assert/strict";
import test from "node:test";
import { ChangePlanOutputSchemas } from "../src/schemas.js";
import { Photon, ResponseValidationError } from "../src/index.js";

// changePlan documents different bodies for 200 (terminal) and 202 (pending).
const pending = {
  failure: null, kind: "change_plan", operationId: "op_1", submittedAt: null, resolvedAt: null, result: null,
  status: "pending",
};
const succeeded = {
  ...pending, resolvedAt: "2026-09-26T00:00:00Z", result: { type: "version", version: "v1" }, status: "succeeded",
};
const input = {
  path: { organizationId: "organization", projectId: "project" },
  body: { category: "analytics", planCode: "analytics_pro" },
  headers: { idempotencyKey: "change-plan-test" },
};

function photonReturning(body: unknown, status: number): Photon {
  return new Photon({ retry: false, fetch: async () => Response.json(body, { status }) });
}

test("each success status has its own response schema", () => {
  assert.deepEqual(Object.keys(ChangePlanOutputSchemas).sort(), ["200", "202"]);
  assert.equal(ChangePlanOutputSchemas["202"]!.safeParse(pending).success, true);
  assert.equal(ChangePlanOutputSchemas["200"]!.safeParse(pending).success, false);
  assert.equal(ChangePlanOutputSchemas["200"]!.safeParse(succeeded).success, true);
  assert.equal(ChangePlanOutputSchemas["202"]!.safeParse(succeeded).success, false);
});

test("responses are validated against the body documented for their status", async () => {
  const accepted = await photonReturning(pending, 202).raw.organizations.billing.changePlan(input);
  assert.equal(accepted.status, 202);
  assert.deepEqual(accepted.data, pending);
  assert.deepEqual(await photonReturning(succeeded, 200).organizations.billing.changePlan(input), succeeded);
  // Each body is valid for the other status only, so the union would accept both.
  await assert.rejects(photonReturning(pending, 200).organizations.billing.changePlan(input), ResponseValidationError);
  await assert.rejects(photonReturning(succeeded, 202).organizations.billing.changePlan(input), ResponseValidationError);
});
