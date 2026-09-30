import type { Plugins } from "@hey-api/openapi-ts";

/**
 * Supported configuration for @hey-api/openapi-ts 0.99.0, Zod 4.
 *
 * The SDK's types carry the contract (fields, types, requiredness, nullability,
 * known enum values, names). At runtime it checks responses for shape only,
 * as most generated SDKs do: validation-only keywords (pattern, lengths,
 * bounds, sizes, formats, uniqueItems) are not enforced, objects keep members
 * the SDK does not know, and enums accept values added after the SDK was
 * generated. See README.md for each hook's removal condition.
 */

type Json = Record<string, unknown>;
type ResolverContext = { path?: unknown; plugin: { context: { spec: unknown } } };
const ANNOTATIONS = new Set(["title", "description", "example", "examples", "deprecated", "readOnly", "writeOnly"]);

/**
 * The source Schema Object a resolver builds (the intermediate schema drops
 * `not`). The resolver path mirrors the input document; `items` + index is a
 * union member or a prefix item.
 */
function sourceSchema(ctx: ResolverContext): Json | undefined {
  const path = (ctx.path as { "~ref"?: unknown } | undefined)?.["~ref"];
  if (!Array.isArray(path)) return undefined;
  let node: unknown = ctx.plugin.context.spec;
  for (let index = 0; index < path.length; index += 1) {
    if (node === null || typeof node !== "object") return undefined;
    const current = node as Json;
    const segment = path[index] as string | number;
    if (segment === "items" && typeof path[index + 1] === "number") {
      const position = path[index + 1] as number;
      index += 1;
      if (Array.isArray(current.prefixItems)) node = current.prefixItems[position];
      else if (Array.isArray(current.anyOf) || Array.isArray(current.oneOf) || Array.isArray(current.allOf)) {
        node = unionMembers(current)[position];
      } else node = position === 0 ? current.items : undefined;
    } else {
      node = current[String(segment)];
    }
  }
  return node !== null && typeof node === "object" && !Array.isArray(node) ? node as Json : undefined;
}

/** Union members as the intermediate schema lists them (a member that is only a union is flattened). */
function unionMembers(schema: Json): unknown[] {
  const members = (schema.anyOf ?? schema.oneOf ?? schema.allOf) as unknown[];
  return members.flatMap((member) => {
    if (member === null || typeof member !== "object") return [member];
    const keys = Object.keys(member).filter((key) => !ANNOTATIONS.has(key));
    const nested = keys.length === 1 && (keys[0] === "anyOf" || keys[0] === "oneOf") && ("anyOf" in schema || "oneOf" in schema);
    return nested ? unionMembers(member as Json) : [member];
  });
}

/** `{ not: {} }`: no value is valid (a member that must be absent). */
function isNever(schema: Json | undefined): boolean {
  if (!schema || typeof schema.not !== "object" || schema.not === null) return false;
  return Object.keys(schema.not).length === 0 && Object.keys(schema).every((key) => key === "not" || ANNOTATIONS.has(key));
}

/** Keywords that only restrict values; the SDK leaves them to the service. */
const VALIDATION_KEYWORDS = [
  "pattern", "minLength", "maxLength", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
  "multipleOf", "minItems", "maxItems", "uniqueItems", "minProperties", "maxProperties", "propertyNames",
  "contains", "minContains", "maxContains", "x-pattern-message",
];
const SCHEMA_MAPS = ["properties", "patternProperties", "$defs", "dependentSchemas"];
const SCHEMA_LISTS = ["allOf", "anyOf", "oneOf", "prefixItems"];
const SCHEMA_VALUES = ["items", "additionalProperties", "not", "if", "then", "else", "unevaluatedItems", "unevaluatedProperties"];

function prepareSchema(schema: unknown): void {
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) return;
  const node = schema as Record<string, unknown>;
  // `default` is the value the server assumes when a member is absent, not a
  // value to fill in (Zod's `.default()`): keep it as documentation only.
  if ("default" in node) {
    const tag = `@default ${JSON.stringify(node.default)}`;
    node.description = typeof node.description === "string" && node.description ? `${node.description}\n\n${tag}` : tag;
    delete node.default;
  }
  // A closed tuple's length is its shape: keep minItems/maxItems there.
  const prefix = Array.isArray(node.prefixItems) ? node.prefixItems.length : -1;
  const closedTuple = prefix >= 0 && node.minItems === prefix && node.maxItems === prefix;
  for (const key of VALIDATION_KEYWORDS) {
    if (closedTuple && (key === "minItems" || key === "maxItems")) continue;
    delete node[key];
  }
  // `format` is an annotation, except `binary`, which types a body as a Blob.
  if (node.format !== "binary") delete node.format;
  for (const key of SCHEMA_MAPS) {
    const map = node[key];
    if (typeof map === "object" && map !== null) Object.values(map).forEach(prepareSchema);
  }
  for (const key of SCHEMA_LISTS) {
    const list = node[key];
    if (Array.isArray(list)) list.forEach(prepareSchema);
  }
  for (const key of SCHEMA_VALUES) prepareSchema(node[key]);
}

/**
 * Input patch (`parser.patch.input`): every schema of the document without its
 * validation-only keywords, and with `default` moved into its description.
 * Hey API 0.99.0 has no option to omit either from the Zod schemas.
 */
export function prepareInput(spec: object): void {
  const document = spec as Record<string, any>;
  const visit = (holder: unknown): void => {
    if (typeof holder !== "object" || holder === null) return;
    const object = holder as Record<string, any>;
    prepareSchema(object.schema);
    for (const content of Object.values(object.content ?? {})) prepareSchema((content as any)?.schema);
    for (const header of Object.values(object.headers ?? {})) visit(header);
  };
  const components = document.components ?? {};
  Object.values(components.schemas ?? {}).forEach(prepareSchema);
  for (const key of ["parameters", "requestBodies", "responses", "headers"]) {
    Object.values(components[key] ?? {}).forEach(visit);
  }
  for (const item of Object.values(document.paths ?? {}) as Record<string, any>[]) {
    for (const [method, operation] of Object.entries(item ?? {})) {
      if (method === "parameters") (operation as unknown[]).forEach(visit);
      if (typeof operation !== "object" || operation === null || Array.isArray(operation)) continue;
      (operation.parameters ?? []).forEach(visit);
      visit(operation.requestBody);
      Object.values(operation.responses ?? {}).forEach(visit);
    }
  }
}

/**
 * A `prefixItems` array whose length is not fixed (not `minItems` =
 * `maxItems` = the number of members): it may be shorter than the prefix and,
 * without `items: false`, longer. 0.99.0 treats every one as a fixed tuple.
 */
function isOpenPrefix(schema: { items?: unknown[]; minItems?: number; maxItems?: number }): boolean {
  const members = schema.items?.length ?? 0;
  return !(schema.minItems === members && schema.maxItems === members);
}

type EnumItem = { const?: unknown };

/** The enum's non-null values when all are strings (or all numbers) and there are several. */
function openEnumValues(items: readonly EnumItem[] | undefined): { kind: "string" | "number"; values: (string | number)[] } | undefined {
  const values = (items ?? []).map((item) => item.const).filter((value) => value !== null && value !== undefined);
  // A single value is a constant (typically a union discriminator), not a set that grows.
  if (values.length < 2) return undefined;
  if (values.every((value) => typeof value === "string")) return { kind: "string", values: values as string[] };
  if (values.every((value) => typeof value === "number")) return { kind: "number", values: values as number[] };
  return undefined;
}

/**
 * The unknown-member fallback of a union that declares one in
 * `x-photon-extension` (`{ discriminator, fallback }`), and its position among
 * the union's members. The platform unions (User, Message, ...) list it last;
 * a union without it (a request's `<Name>Input`) has none.
 */
type Fallback = { discriminator: string; index: number };
function unionFallback(ctx: ResolverContext & { schemas: readonly { $ref?: string }[] }): Fallback | undefined {
  return fallbackOf(sourceSchema(ctx), ctx.schemas);
}
function fallbackOf(schema: Json | undefined, members: readonly { $ref?: string }[]): Fallback | undefined {
  const extension = schema?.["x-photon-extension"] as { discriminator?: unknown; fallback?: unknown } | undefined;
  const { discriminator, fallback } = extension ?? {};
  if (typeof discriminator !== "string" || typeof fallback !== "string") return undefined;
  const name = fallback.slice(fallback.lastIndexOf("/") + 1);
  const index = members.findIndex((member) => member.$ref === `#/components/schemas/${name}`);
  return index < 0 ? undefined : { discriminator, index };
}
/** Whether a `$ref` names a union with an unknown-member fallback. */
function referencesFallbackUnion(ctx: ResolverContext, member: { $ref?: string }): boolean {
  const prefix = "#/components/schemas/";
  if (!member.$ref?.startsWith(prefix)) return false;
  const spec = ctx.plugin.context.spec as { components?: { schemas?: Record<string, Json> } };
  const schema = spec.components?.schemas?.[member.$ref.slice(prefix.length)];
  const members = (schema?.anyOf ?? schema?.oneOf ?? []) as { $ref?: string }[];
  return fallbackOf(schema, members) !== undefined;
}
/** The discriminator of a value this SDK does not know: upper-case, so no platform (lower-case) takes it. */
const UNKNOWN = "UNKNOWN";

export const typeResolvers: Plugins.HeyApiTypeScript.Resolvers = {
  // A union with an unknown-member fallback: a value this SDK does not know
  // is `{ <discriminator>: "UNKNOWN"; raw: <Fallback> }`, so comparing the
  // discriminator with a known value narrows to that member.
  union(ctx) {
    const fallback = unionFallback(ctx as never);
    if (!fallback) return undefined;
    const { $ } = ctx;
    const members = ctx.childResults.map((result, index) => index !== fallback.index ? result.type : $.type.object()
      .prop(fallback.discriminator, (prop) => prop.type($.type.literal(UNKNOWN)))
      .prop("raw", (prop) => prop.type(result.type)));
    return $.type.or(...members);
  },
  // Open enums: the known values, plus any other string (or number) the API adds later.
  enum(ctx) {
    const open = openEnumValues(ctx.schema.items as EnumItem[] | undefined);
    if (!open) return undefined;
    const { $ } = ctx;
    const { enumMembers, isNullable } = ctx.nodes.items(ctx);
    const other = $.type.and($.type(open.kind), $.type("{}"));
    return $.type.or(...enumMembers, other, ...(isNullable ? [$.type("null")] : []));
  },
  tuple(ctx) {
    if (!isOpenPrefix(ctx.schema as never)) return undefined;
    return ctx.$.type("Array").generic(ctx.$.type("unknown"));
  },
  // A closed object without properties: 0.99.0 types it `{ [key: string]: never }`,
  // which a response that gained members could not satisfy.
  object(ctx) {
    const schema = ctx.schema as { properties?: Record<string, object>; additionalProperties?: { type?: string } | false };
    const extra = schema.additionalProperties;
    const closed = extra === false || (typeof extra === "object" && extra?.type === "never");
    if (closed && !Object.keys(schema.properties ?? {}).length) {
      return ctx.$.type("Record").generic(ctx.$.type("string")).generic(ctx.$.type("unknown"));
    }
    // A member that must be absent (`{ not: {} }`) is `never`; 0.99.0's parser
    // drops `not` and types it `unknown`. Zod does not check it (`absent`).
    const source = sourceSchema(ctx as never)?.properties as Record<string, Json> | undefined;
    const absent = Object.keys(schema.properties ?? {}).filter((key) => isNever(source?.[key]));
    if (!absent.length) return undefined;
    const properties = { ...schema.properties };
    for (const key of absent) properties[key] = { ...properties[key], type: "never" };
    return ctx.nodes.base({ ...ctx, schema: { ...ctx.schema, properties } as never });
  },
};

export const zodResolvers: Plugins.Zod.Resolvers = {
  // A union with an unknown-member fallback (see the type resolver): the known
  // members come first, so a known platform's value is parsed by its own
  // member; a value only the fallback takes becomes
  // `{ <discriminator>: "UNKNOWN", raw }` (unknownMember in
  // packages/typescript/src/validation.ts).
  union(ctx) {
    const fallback = unionFallback(ctx as never);
    if (!fallback) return undefined;
    const { $, symbols } = ctx;
    const helper = ctx.plugin.symbolOnce("unknownMember", { external: "../validation.js" });
    const members = ctx.childResults.map(({ chain }, index) => index !== fallback.index ? chain
      : $(helper).call($.literal(fallback.discriminator), chain));
    return $(symbols.z).attr("union").call($.array().pretty().elements(...members));
  },
  // An allOf that narrows such a union (PlatformUser: User and a platform
  // constraint): the value must satisfy every member and is parsed by the
  // union. Zod's intersection would merge the union's `UNKNOWN` with the
  // constraint's platform and fail.
  intersection(ctx) {
    const index = ctx.schemas.findIndex((member) => referencesFallbackUnion(ctx as never, member as { $ref?: string }));
    if (index < 0) return undefined;
    const { $ } = ctx;
    const members = ctx.childResults.map(({ chain, meta }) =>
      meta.hasLazy ? $(ctx.symbols.z).attr("lazy").call($.func().do(chain.return())) : chain);
    const helper = ctx.plugin.symbolOnce("narrowed", { external: "../validation.js" });
    return $(helper).call(members[index], ...members.filter((_, position) => position !== index));
  },
  // Objects keep members the SDK does not know, whatever additionalProperties
  // says (a response may gain fields). A typed catchall keeps its type.
  object(ctx) {
    const { $, schema, symbols } = ctx;
    const shape = ctx.nodes.shape(ctx);
    const extra = schema.additionalProperties;
    if (!extra || extra.type === "never" || (extra.type === "unknown" && Object.keys(extra).length === 1)) {
      return $(symbols.z).attr("looseObject").call(shape);
    }
    // 0.99.0's additionalProperties node only visits catchalls on dictionaries.
    const { properties: _properties, ...dictionary } = schema;
    const additional = ctx.nodes.additionalProperties({ ...ctx, schema: dictionary });
    if (!additional) throw new Error("Missing Zod additionalProperties expression");
    return $(symbols.z).attr("object").call(shape).attr("catchall").call(additional);
  },
  // Open enums, as in the types (openEnum in packages/typescript/src/validation.ts).
  enum(ctx) {
    const open = openEnumValues(ctx.schema.items as EnumItem[] | undefined);
    if (!open) return undefined;
    const helper = ctx.plugin.symbolOnce(open.kind === "string" ? "openEnum" : "openNumberEnum", {
      external: "../validation.js",
    });
    return ctx.$(helper).call(ctx.$.array(...open.values.map((value) => ctx.$.literal(value))));
  },
  tuple(ctx) {
    // Without `items: false` a prefix is open: the array may be shorter than
    // the prefix and later items are unconstrained. Each present item keeps
    // its position's type.
    const { $, schema, symbols } = ctx;
    if (!isOpenPrefix(schema as never) || schema.const !== undefined) return undefined;
    const members = ctx.childResults.map((result) => ctx.applyModifiers(result, { optional: false }).chain);
    const check = ctx.plugin.symbolOnce("prefixItems", { external: "../validation.js" });
    return $(symbols.z).attr("array").call($(symbols.z).attr("unknown").call())
      .attr("refine").call($(check).call($.array(...members)),
        $.object().prop("message", $.literal("Items do not match their positions")));
  },
  number(ctx) {
    // An integer is any integral JSON number. z.int() also rejects integers
    // beyond ±(2^53 − 1), which the contract allows (JSON numbers are
    // doubles in JavaScript, so such a value is kept as parsed).
    if (ctx.schema.type !== "integer" || ctx.schema.const !== undefined) return undefined;
    const { $, symbols } = ctx;
    return $(symbols.z).attr("number").call().attr("refine").call($("Number").attr("isInteger"),
      $.object().prop("message", $.literal("Expected an integer")));
  },
  unknown(ctx) {
    // `{ not: {} }`, a member that must be absent, is `never` in the types
    // (0.99.0's parser drops `not`) but not checked in a response
    // (absent in packages/typescript/src/validation.ts): the service may add
    // the member later. Union members told apart only by it share every other
    // member's schema, so the parsed value is the same whichever member matches.
    if (!isNever(sourceSchema(ctx))) return undefined;
    return ctx.$(ctx.plugin.symbolOnce("absent", { external: "../validation.js" })).call();
  },
  string(ctx) {
    // `format: binary` is a Blob (or File), as the Fetch client sends and returns it.
    if (ctx.schema.format !== "binary") return undefined;
    return ctx.$(ctx.symbols.z).attr("instanceof").call(ctx.$("Blob"));
  },
};
