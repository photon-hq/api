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
