import assert from "node:assert/strict";
import test from "node:test";
import * as z from "zod";
import { narrowed, openEnum, openNumberEnum, unknownMember } from "../src/validation.js";

test("open enums accept known and later values of the same JSON type", () => {
  const status = openEnum(["active", "paused"]);
  for (const value of ["active", "paused", "archived"]) assert.equal(status.parse(value), value);
  assert.equal(status.safeParse(1).success, false);
  const level = openNumberEnum([1, 2]);
  for (const value of [1, 2, 3]) assert.equal(level.parse(value), value);
  assert.equal(level.safeParse("1").success, false);
});

test("a platform added later is read as { platform: \"UNKNOWN\", raw }; known platforms keep their member", () => {
  const sms = z.looseObject({ platform: z.literal("sms"), handle: z.string() });
  const fallback = z.looseObject({ platform: z.string(), id: z.string() });
  const user = z.union([sms, unknownMember("platform", fallback)]);
  const known = { platform: "sms", handle: "+1", extra: true } as const;
  assert.deepEqual(user.parse(known), known);
  const later = { platform: "fax", id: "u1", handle: "h" };
  const parsed = user.parse(later);
  assert.deepEqual(parsed, { platform: "UNKNOWN", raw: later });
  // Typed: comparing the discriminator narrows.
  const handle = parsed.platform === "sms" ? parsed.handle : parsed.raw.platform;
  assert.equal(handle, "fax");
  assert.equal(user.safeParse({ platform: "fax" }).success, false);
  const constrained = narrowed(user, z.looseObject({ platform: z.string() }));
  assert.deepEqual(constrained.parse(later), { platform: "UNKNOWN", raw: later });
  assert.equal(constrained.safeParse({ platform: 1, id: "u1" }).success, false);
});

test("a narrowed union is typed as the union and each constraint, as types.gen.ts writes allOf", () => {
  const sms = z.looseObject({ platform: z.literal("sms"), status: z.string() });
  const user = z.union([sms, unknownMember("platform", z.looseObject({ platform: z.string() }))]);
  type Sms = z.output<typeof sms>;
  // Checked by the compiler: the generated schemas are annotated this way.
  const accepted: z.ZodType<Sms & { platform: "sms"; status: "accepted" }> = narrowed(
    user,
    z.looseObject({ platform: z.literal("sms") }),
    z.looseObject({ status: z.literal("accepted") }),
  );
  const value = { platform: "sms", status: "accepted" };
  assert.deepEqual(accepted.parse(value), value);
  assert.equal(accepted.safeParse({ platform: "sms", status: "sent" }).success, false);
  // Outside the contract (no known member takes it), the value is kept as the fallback.
  const partial = { platform: "sms" };
  const sent = narrowed(user, z.looseObject({ platform: z.literal("sms") }));
  assert.deepEqual(sent.parse(partial) as unknown, { platform: "UNKNOWN", raw: partial });
});
