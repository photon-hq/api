import assert from "node:assert/strict";
import test from "node:test";
import * as z from "zod";
import { loosen, narrowed, openEnum, openNumberEnum, unknownMember } from "../src/validation.js";

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

test("a value that fails its schema is read as far as the schema allows", () => {
  const sms = z.looseObject({ platform: z.literal("sms"), handle: z.string() });
  const user = z.union([sms, unknownMember("platform", z.looseObject({ platform: z.string(), id: z.string() }))]);
  const project = z.looseObject({
    projectId: z.string(),
    createdByAccountId: z.string().nullable(),
    owner: user,
    members: z.array(user),
    labels: z.object({}).catchall(z.string()),
  });
  const fax = { platform: "fax", id: "u2" };
  const value = {
    projectId: "prj_1",
    owner: { platform: "sms" },
    members: [{ platform: "sms", handle: "+1" }, fax, { platform: "fax" }, 7],
    labels: { color: "red", size: 3 },
    futureField: true,
  };
  assert.equal(project.safeParse(value).success, false);
  assert.deepEqual(loosen(project, value), {
    projectId: "prj_1",
    // A known member that fails is read as that member, not as the fallback.
    owner: { platform: "sms" },
    // Members that match are parsed as usual, the fallback's wrapping included.
    members: [{ platform: "sms", handle: "+1" }, { platform: "UNKNOWN", raw: fax }, { platform: "UNKNOWN", raw: { platform: "fax" } }, 7],
    labels: { color: "red", size: 3 },
    futureField: true,
  });
  assert.equal("createdByAccountId" in (loosen(project, value) as object), false);
});

test("a value that matches is parsed as usual, and one that matches nothing is kept", () => {
  const sms = z.looseObject({ platform: z.literal("sms"), status: z.string() });
  const user = z.union([sms, unknownMember("platform", z.looseObject({ platform: z.string() }))]);
  const accepted = narrowed(user, z.looseObject({ status: z.literal("accepted") }));
  assert.deepEqual(loosen(accepted, { platform: "sms", status: "sent" }), { platform: "sms", status: "sent" });
  assert.deepEqual(loosen(user, { platform: "fax" }), { platform: "UNKNOWN", raw: { platform: "fax" } });
  for (const scalar of [1, null, true]) assert.equal(loosen(z.string().optional(), scalar), scalar);
  assert.deepEqual(loosen(z.array(z.number()), "not an array"), "not an array");
  const lazy: z.ZodType<{ child?: unknown; name: string }> = z.lazy(() => z.looseObject({ name: z.string(), child: lazy.optional() }));
  assert.deepEqual(loosen(lazy, { name: "a", child: { name: 1 } }), { name: "a", child: { name: 1 } });
});

test("reading a failed object keeps members named like built-in properties as data", () => {
  const value = JSON.parse('{"__proto__": {"polluted": true}, "toString": 1, "constructor": "x", "name": 2}') as object;
  const result = loosen(z.looseObject({ name: z.string() }), value) as Record<string, unknown>;
  assert.deepEqual(Object.keys(result), ["__proto__", "toString", "constructor", "name"]);
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.equal(result.toString, 1);
});
