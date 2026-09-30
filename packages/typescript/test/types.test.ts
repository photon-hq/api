// Request input types are exact (they carry the contract); response types
// keep members the SDK does not know. Checked by the compiler: an unused
// `@ts-expect-error` fails the build.
import assert from "node:assert/strict";
import test from "node:test";
import type {
  ConfirmAccountPhoneVerificationInput,
  CountProjectsOutput,
  CreateProjectInput,
} from "../src/schemas.js";
import type { CountProjectsResult, GetAccountErrors } from "../src/index.js";

test("request inputs reject unknown keys and wrong shapes at compile time", () => {
  const valid: ConfirmAccountPhoneVerificationInput = { body: { code: "123456", phoneNumber: "+15555550123" } };
  // @ts-expect-error an unknown body member
  const unknownMember: ConfirmAccountPhoneVerificationInput = { body: { code: "1", phoneNumber: "+1", futureField: true } };
  // @ts-expect-error a wrong type
  const wrongType: ConfirmAccountPhoneVerificationInput = { body: { code: 123456, phoneNumber: "+1" } };
  // @ts-expect-error a missing required member
  const missing: ConfirmAccountPhoneVerificationInput = { body: { code: "1" } };
  // @ts-expect-error an unknown input group
  const unknownGroup: ConfirmAccountPhoneVerificationInput = { body: { code: "1", phoneNumber: "+1" }, extra: {} };
  const project: CreateProjectInput = {
    path: { organizationId: "organization" },
    body: { name: "SDK test", slug: "sdk-test" },
    headers: { idempotencyKey: "key" },
  };
  // @ts-expect-error an unknown header
  const unknownHeader: CreateProjectInput = { ...project, headers: { idempotencyKey: "key", other: "x" } };
  assert.ok([valid, unknownMember, wrongType, missing, unknownGroup, project, unknownHeader]);
});

test("response types keep members the SDK does not know", () => {
  const output: CountProjectsOutput = { count: 1, futureField: true };
  assert.equal(output.count, 1);
});

test("the package entry exports contract component and error types", () => {
  const result: CountProjectsResult = { count: 1 };
  const forbidden: GetAccountErrors[403]["status"] = 403;
  // @ts-expect-error a status the operation does not declare
  const undeclared: GetAccountErrors[418] = undefined as never;
  assert.equal(result.count, 1);
  assert.equal(forbidden, 403);
  assert.ok(undeclared === undefined);
});
