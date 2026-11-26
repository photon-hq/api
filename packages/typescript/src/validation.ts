import * as z from "zod";

/**
 * Helpers the generated Zod schemas call (tools/openapi-generator/zod-resolvers.ts).
 */

/**
 * An open string enum: the known values, and any other string the API adds
 * after this SDK was generated. The type keeps the known values for
 * completion (`"a" | "b" | (string & {})`).
 */
export function openEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.union([z.enum(values), z.string() as unknown as z.ZodType<string & {}, string & {}>]);
}

/**
 * A member the contract says is absent (`{ not: {} }`), such as `remediation`
 * on a problem that has none today. The type is `never`, but a response value
 * is not checked: a service that adds the member later must not break this
 * SDK, as with members the contract does not list.
 */
export function absent() {
  return z.unknown() as unknown as z.ZodType<never, never>;
}

/** An open numeric enum: the known values, and any other number. */
export function openNumberEnum<const T extends readonly [number, ...number[]]>(values: T) {
  const known = values.map((value) => z.literal(value)) as unknown as [z.ZodType<T[number], T[number]>];
  return z.union([...known, z.number() as unknown as z.ZodType<number & {}, number & {}>]);
}

interface ItemSchema { safeParse(value: unknown): { success: boolean } }

/** JSON Schema `prefixItems` without `items: false`: each present item matches its position. */
export function prefixItems(schemas: readonly ItemSchema[]): (value: readonly unknown[]) => boolean {
  return (value) => schemas.every((schema, index) => index >= value.length || schema.safeParse(value[index]).success);
}

/**
 * The value of a union member this SDK does not know: a platform added after
 * it was generated. `raw` is the value as the API sent it, typed as the
 * contract's fallback (`UnknownUser`, ...), so its real platform and shared
 * fields stay readable. `"UNKNOWN"` is upper-case: no platform takes it.
 */
export type UnknownMember<K extends string, T> = { [P in K]: "UNKNOWN" } & { raw: T };

/**
 * The fallback member of a union that declares one (`x-photon-extension`),
 * listed after the known members: a value only it takes is wrapped as an
 * `UnknownMember`. Such a value may carry a reserved platform the known member
 * does not take; the contract allows it, so it is kept, not rejected.
 */
export function unknownMember<const K extends string, T>(discriminator: K, schema: z.ZodType<T>) {
  const wrapped = schema.transform((raw) => ({ [discriminator]: "UNKNOWN", raw }) as UnknownMember<K, T>);
  // Responses are parsed from the wire; only the parsed type is used.
  return wrapped as unknown as z.ZodType<UnknownMember<K, T>, UnknownMember<K, T>>;
}

/** The intersection of a tuple's types (`unknown` for none). */
type AllOf<T extends readonly unknown[]> = T extends readonly [infer Head, ...infer Rest] ? Head & AllOf<Rest> : unknown;

type Narrowed<O, I, C extends readonly z.ZodType[]> = z.ZodType<
  O & AllOf<{ [K in keyof C]: z.output<C[K]> }>,
  I & AllOf<{ [K in keyof C]: z.input<C[K]> }>
>;

/**
 * A union narrowed by other schemas (`allOf`): the value must satisfy each of
 * them, and the union parses it. A Zod intersection would merge the union's
 * `UnknownMember` with the other schemas' outputs and fail. The type is the
 * union's type intersected with each constraint's, as types.gen.ts writes the
 * same `allOf`. It holds for every value the contract allows: the contract's
 * union lists only the known members. A value no known member takes is still
 * kept, as the fallback `UnknownMember`, rather than rejected.
 */
export function narrowed<O, I, C extends readonly z.ZodType[]>(
  union: z.ZodType<O, I>,
  ...constraints: C
): Narrowed<O, I, C> {
  const checked = z.unknown().superRefine((value, context) => {
    for (const constraint of constraints) {
      const result = constraint.safeParse(value);
      if (result.success) continue;
      for (const issue of result.error.issues) context.addIssue({ code: "custom", message: issue.message, path: issue.path });
    }
  });
  // The constraints checked the value, so a known member's output also has their types.
  return checked.pipe(union as z.ZodType<O, unknown>) as unknown as Narrowed<O, I, C>;
}

type Def = z.core.$ZodTypes["_zod"]["def"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The definition a union member's value is read with: what optional, lazy and piped schemas wrap. */
function base(schema: z.core.$ZodType): Def {
  const def = (schema as z.core.$ZodTypes)._zod.def;
  switch (def.type) {
    case "optional":
    case "nullable":
      return base(def.innerType);
    case "lazy":
      return base(def.getter());
    case "pipe":
      return base(def.in);
    default:
      return def;
  }
}

/**
 * The member of a union that a value matching none of them is read as: for
 * an object, the first member whose constant members (the discriminator) all
 * take the value's, else the first object member without constants (an open
 * union's fallback); for an array, the first array member.
 */
function unionMember(options: readonly z.core.$ZodType[], value: unknown): z.core.$ZodType | undefined {
  if (Array.isArray(value)) return options.find((option) => base(option).type === "array");
  if (!isRecord(value)) return undefined;
  let fallback: z.core.$ZodType | undefined;
  for (const option of options) {
    const def = base(option);
    if (def.type !== "object") continue;
    const constants = Object.entries(def.shape).flatMap(([key, member]) => {
      const memberDef = (member as z.core.$ZodTypes)._zod.def;
      return memberDef.type === "literal" ? [[key, memberDef.values] as const] : [];
    });
    if (constants.length === 0) fallback ??= option;
    else if (constants.every(([key, values]) => (values as readonly unknown[]).includes(value[key]))) return option;
  }
  return fallback;
}

/**
 * A successful response whose body does not match its schema, read as far as
 * the schema allows instead of rejected (the client's default; the
 * `strictResponseValidation` option rejects it). Every part that matches its
 * schema is parsed as usual, an open union's fallback member included; an
 * object keeps the members it has, each read the same way, and leaves out
 * the ones the response lacks; any other value that does not match is kept as
 * the API sent it.
 */
export function loosen(schema: z.core.$ZodType, value: unknown): unknown {
  const parsed = (schema as z.ZodType).safeParse(value);
  if (parsed.success) return parsed.data;
  const def = (schema as z.core.$ZodTypes)._zod.def;
  switch (def.type) {
    case "optional":
    case "nullable":
      return loosen(def.innerType, value);
    case "lazy":
      return loosen(def.getter(), value);
    case "pipe": {
      // A transform, such as the fallback member's wrapping, applies to what
      // its input read; a narrowed union is read as the union.
      if ((def.out as z.core.$ZodTypes)._zod.def.type !== "transform") return loosen(def.out, value);
      const input = loosen(def.in, value);
      const output = (def.out as z.ZodType).safeParse(input);
      return output.success ? output.data : input;
    }
    case "object": {
      if (!isRecord(value)) return value;
      return Object.fromEntries(Object.entries(value).map(([key, member]) => {
        const schemaOfMember = Object.hasOwn(def.shape, key) ? def.shape[key] : def.catchall;
        return [key, schemaOfMember ? loosen(schemaOfMember, member) : member];
      }));
    }
    case "array":
      return Array.isArray(value) ? value.map((item) => loosen(def.element, item)) : value;
    case "union": {
      const member = unionMember(def.options, value);
      return member ? loosen(member, value) : value;
    }
    default:
      return value;
  }
}
