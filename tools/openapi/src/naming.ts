import { isObject, pascalCase, type JsonObject, type JsonValue } from "./shared.js";

/**
 * Public-lane naming gates.
 *
 * The public SDKs must take every type name from the contract. Three checks
 * enforce that, and none of them rename anything:
 *
 * - the contract check: every nominal schema (object, enum, union, union
 *   member, intersection) that a public operation reaches is a `$ref` to a
 *   named component, and every such component name follows the convention;
 * - the TypeScript and Rust checks: every generated type is a contract
 *   component, an operation-derived client type or fixed runtime API;
 * - the Python check (tools/python-codegen/check_naming.py) applies the same
 *   rule to datamodel-code-generator classes, mapped to their source pointers.
 *
 * Plain scalars (strings, numbers, booleans, null, `const`, scalar arrays and
 * free-form maps) are exempt: they need no type name.
 */

export type NamingCheck = "contract" | "typescript" | "python" | "rust";

export interface NamingViolation {
  check: NamingCheck;
  /** A stable rule identifier, for example `inline-object` or `hoisted-root`. */
  rule: string;
  /** JSON pointer into the checked document, when known. */
  pointer?: string;
  /** Component or generated type name, when the violation is about a name. */
  name?: string;
  /** Generated file, for SDK checks. */
  file?: string;
  /** Public operations that reach the violating position (sorted). */
  operations: string[];
  message: string;
}

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;
const SCHEMA_PREFIX = "#/components/schemas/";
const ANNOTATIONS = new Set([
  "title", "description", "example", "examples", "default", "deprecated", "readOnly", "writeOnly", "$comment", "$schema",
]);

const escapeSegment = (segment: string): string => segment.replaceAll("~", "~0").replaceAll("/", "~1");
const unescapeSegment = (segment: string): string => segment.replaceAll("~1", "/").replaceAll("~0", "~");
/** Case- and separator-insensitive key: generators recase component names differently. */
export const nameKey = (name: string): string => name.toLowerCase().replaceAll(/[^a-z0-9]/g, "");

function componentName(reference: unknown): string | undefined {
  if (typeof reference !== "string" || !reference.startsWith(SCHEMA_PREFIX)) return undefined;
  const rest = reference.slice(SCHEMA_PREFIX.length);
  if (rest.includes("/")) return undefined;
  return unescapeSegment(decodeURIComponent(rest));
}

function resolve(document: JsonObject, reference: string): { value: JsonValue; pointer: string } | undefined {
  if (!reference.startsWith("#/")) return undefined;
  let value: JsonValue | undefined = document;
  for (const segment of reference.slice(2).split("/").map((part) => unescapeSegment(decodeURIComponent(part)))) {
    value = isObject(value) ? value[segment] : Array.isArray(value) ? value[Number(segment)] : undefined;
    if (value === undefined) return undefined;
  }
  return { value, pointer: reference.slice(1) };
}

/** Follow `$ref` on an OpenAPI object (parameter, request body, response, header). */
function deref(document: JsonObject, value: JsonValue | undefined, pointer: string): { value: JsonValue; pointer: string } | undefined {
  const seen = new Set<string>();
  let current: { value: JsonValue; pointer: string } | undefined = value === undefined ? undefined : { value, pointer };
  while (current && isObject(current.value) && typeof current.value.$ref === "string") {
    if (seen.has(current.value.$ref)) return undefined;
    seen.add(current.value.$ref);
    current = resolve(document, current.value.$ref);
  }
  return current;
}

export interface PublicOperation {
  operationId: string;
  method: string;
  path: string;
}

export function publicOperations(document: JsonObject): PublicOperation[] {
  const operations: PublicOperation[] = [];
  for (const [path, item] of Object.entries(isObject(document.paths) ? document.paths : {})) {
    if (!isObject(item)) continue;
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (isObject(operation) && typeof operation.operationId === "string") {
        operations.push({ operationId: operation.operationId, method, path });
      }
    }
  }
  return operations;
}

interface SchemaRoot {
  pointer: string;
  schema: JsonValue;
  position: "request body" | "response body" | "parameter" | "header";
  operations: Set<string>;
}

/** Every schema position an operation declares directly, keyed by pointer. */
function operationRoots(document: JsonObject): Map<string, SchemaRoot> {
  const roots = new Map<string, SchemaRoot>();
  const add = (pointer: string, schema: JsonValue | undefined, position: SchemaRoot["position"], operationId: string): void => {
    if (schema === undefined) return;
    const root = roots.get(pointer) ?? { pointer, schema, position, operations: new Set<string>() };
    root.operations.add(operationId);
    roots.set(pointer, root);
  };
  const content = (holder: JsonValue, pointer: string, position: SchemaRoot["position"], operationId: string): void => {
    if (!isObject(holder) || !isObject(holder.content)) return;
    for (const [media, value] of Object.entries(holder.content)) {
      if (isObject(value)) add(`${pointer}/content/${escapeSegment(media)}/schema`, value.schema, position, operationId);
    }
  };
  const parameterSchemas = (value: JsonValue | undefined, pointer: string, operationId: string): void => {
    const resolved = deref(document, value, pointer);
    if (!resolved || !isObject(resolved.value)) return;
    const position = resolved.value.in === "header" ? "header" : "parameter";
    add(`${resolved.pointer}/schema`, resolved.value.schema, position, operationId);
    content(resolved.value, resolved.pointer, position, operationId);
  };
  for (const { operationId, method, path } of publicOperations(document)) {
    const itemPointer = `/paths/${escapeSegment(path)}`;
    const item = (document.paths as JsonObject)[path] as JsonObject;
    const operation = item[method] as JsonObject;
    const operationPointer = `${itemPointer}/${method}`;
    for (const [holder, pointer] of [[item, itemPointer], [operation, operationPointer]] as const) {
      if (Array.isArray(holder.parameters)) {
        holder.parameters.forEach((parameter, index) => parameterSchemas(parameter, `${pointer}/parameters/${index}`, operationId));
      }
    }
    const body = deref(document, operation.requestBody, `${operationPointer}/requestBody`);
    if (body) content(body.value, body.pointer, "request body", operationId);
    for (const [status, value] of Object.entries(isObject(operation.responses) ? operation.responses : {})) {
      const response = deref(document, value, `${operationPointer}/responses/${escapeSegment(status)}`);
      if (!response || !isObject(response.value)) continue;
      content(response.value, response.pointer, "response body", operationId);
      for (const [header, headerValue] of Object.entries(isObject(response.value.headers) ? response.value.headers : {})) {
        parameterSchemas(headerValue, `${response.pointer}/headers/${escapeSegment(header)}`, operationId);
      }
    }
  }
  return roots;
}

/**
 * The component an open-union fallback names. Photon's extension points at the
 * zod definition (`"x-photon-extension": {"fallback": "#/$defs/UnknownMessage"}`);
 * the public contract keeps the component carrying that name. Resolve it as
 * tools/release/public-contract.mjs does: the name itself or a `_`-separated
 * suffix, preferring the candidate that shares the longest prefix with the
 * component declaring the fallback. An unresolvable fallback returns the bare
 * name, which the check then reports as an unresolved reference.
 */
function fallbackComponent(schemas: JsonObject, fallback: string, namespace: string): string {
  const local = /^#\/\$defs\/([A-Za-z0-9_]+)$/.exec(fallback);
  if (!local) return fallback;
  const name = local[1]!;
  const common = (candidate: string): number => {
    let index = 0;
    while (index < candidate.length && candidate[index] === namespace[index]) index += 1;
    return index;
  };
  const matches = Object.keys(schemas)
    .filter((candidate) => candidate === name || candidate.endsWith(`_${name}`))
    .map((candidate) => ({ candidate, score: common(candidate) }))
    .sort((a, b) => b.score - a.score);
  if (!matches.length || (matches.length > 1 && matches[0]!.score === matches[1]!.score)) return name;
  return matches[0]!.candidate;
}

/**
 * Component schema names referenced anywhere in `value`: `$ref`s,
 * discriminator mappings and open-union fallbacks (SDKs generate the fallback
 * variant's type, so it is part of the public surface). `namespace` is the
 * component that `value` defines, if any.
 */
function referencedComponents(value: JsonValue, schemas: JsonObject, namespace = "", found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const child of value) referencedComponents(child, schemas, namespace, found);
  } else if (isObject(value)) {
    const name = componentName(value.$ref);
    if (name !== undefined) found.push(name);
    if (isObject(value.discriminator) && isObject(value.discriminator.mapping)) {
      for (const target of Object.values(value.discriminator.mapping)) {
        const mapped = componentName(target);
        if (mapped !== undefined) found.push(mapped);
      }
    }
    const extension = value["x-photon-extension"];
    if (isObject(extension) && typeof extension.fallback === "string") {
      found.push(fallbackComponent(schemas, extension.fallback, namespace));
    }
    for (const child of Object.values(value)) referencedComponents(child, schemas, namespace, found);
  }
  return found;
}

const isReference = (schema: JsonValue): boolean => isObject(schema) && typeof schema.$ref === "string";
const annotationOnly = (schema: JsonValue): boolean =>
  isObject(schema) && Object.keys(schema).every((key) => ANNOTATIONS.has(key));
const isNullSchema = (schema: JsonValue): boolean =>
  isObject(schema) && (schema.type === "null" || (Array.isArray(schema.enum) && schema.enum.length === 1 && schema.enum[0] === null));
const nonEmptyObject = (value: JsonValue | undefined): boolean => isObject(value) && Object.keys(value).length > 0;

function unionMembers(schema: JsonObject): JsonValue[] | undefined {
  const members = [schema.oneOf, schema.anyOf].filter(Array.isArray).flat() as JsonValue[];
  return members.length ? members : undefined;
}

/**
 * The kind of named type a generator would create for this schema, or
 * undefined for scalars, scalar arrays, free-form maps, references and
 * nullable wrappers around a single schema.
 */
export function nominalKind(schema: JsonValue): "object" | "enum" | "union" | "intersection" | undefined {
  if (!isObject(schema) || isReference(schema)) return undefined;
  if (Array.isArray(schema.enum) && schema.enum.some((value) => value !== null)) return "enum";
  const members = unionMembers(schema);
  if (members && members.filter((member) => !isNullSchema(member)).length >= 2) return "union";
  if (Array.isArray(schema.allOf)) {
    const parts = schema.allOf.filter((member) => !annotationOnly(member));
    if (parts.length >= 2 || parts.some((member) => !isReference(member))) return "intersection";
  }
  if (nonEmptyObject(schema.properties) || nonEmptyObject(schema.patternProperties)) return "object";
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  // A closed object without properties still becomes a class in Python and a struct in Rust.
  if (types.includes("object") && schema.additionalProperties === false) return "object";
  return undefined;
}

const SUBSCHEMA_KEYWORDS = [
  "additionalProperties", "unevaluatedProperties", "propertyNames", "items", "unevaluatedItems", "contains", "not", "if", "then", "else",
] as const;

interface Position {
  named: boolean;
  where: string;
}

function inlineRule(kind: string, where: string): string {
  if (where === "union member") return "inline-union-member";
  if (where === "request body" || where === "response body") return "inline-body-root";
  return `inline-${kind}`;
}

function checkSchema(
  schema: JsonValue,
  pointer: string,
  operations: string[],
  position: Position,
  report: (violation: NamingViolation) => void,
): void {
  if (!isObject(schema) || isReference(schema)) return;
  const kind = nominalKind(schema);
  if (kind && !position.named) {
    report({
      check: "contract",
      rule: inlineRule(kind, position.where),
      pointer,
      operations,
      message: `inline ${kind} (${position.where}) must be a $ref to a named component`,
    });
  }
  const nested = (child: JsonValue | undefined, childPointer: string, where = "property"): void => {
    if (child !== undefined) checkSchema(child, childPointer, operations, { named: false, where }, report);
  };
  for (const keyword of ["properties", "patternProperties", "dependentSchemas"] as const) {
    const children = schema[keyword];
    if (!isObject(children)) continue;
    for (const [key, child] of Object.entries(children)) nested(child, `${pointer}/${keyword}/${escapeSegment(key)}`, keyword === "properties" ? "property" : "map value");
  }
  for (const keyword of SUBSCHEMA_KEYWORDS) {
    const where = keyword === "items" || keyword === "unevaluatedItems" || keyword === "contains" ? "array item"
      : keyword === "additionalProperties" || keyword === "unevaluatedProperties" ? "map value" : "subschema";
    if (isObject(schema[keyword])) nested(schema[keyword], `${pointer}/${keyword}`, where);
  }
  if (Array.isArray(schema.prefixItems)) schema.prefixItems.forEach((child, index) => nested(child, `${pointer}/prefixItems/${index}`, "array item"));
  // allOf members compose into this schema: they carry its name.
  if (Array.isArray(schema.allOf)) {
    schema.allOf.forEach((member, index) => checkSchema(member, `${pointer}/allOf/${index}`, operations, { named: true, where: position.where }, report));
  }
  for (const keyword of ["oneOf", "anyOf"] as const) {
    const members = schema[keyword];
    if (!Array.isArray(members)) continue;
    const union = kind === "union";
    members.forEach((member, index) => checkSchema(
      member,
      `${pointer}/${keyword}/${index}`,
      operations,
      // A nullable wrapper (one non-null member) carries the parent's name.
      union ? { named: false, where: "union member" } : position,
      report,
    ));
  }
}

/**
 * Components whose "Schema" suffix names the domain concept rather than
 * restating that the component is a schema, so the `Schema` suffix rule does
 * not apply. Each entry is an explicit, reviewed exception; every other rule
 * still applies to it.
 *
 * - `WebhookEventSchema`: the JSON Schema document the webhooks service
 *   publishes for one webhook event type (`getWebhookEventSchema`).
 */
export const SCHEMA_DOMAIN_NOUNS: ReadonlySet<string> = new Set(["WebhookEventSchema"]);

const COMPONENT_NAME_RULES: [RegExp | ((name: string) => boolean), string][] = [
  [/^(input|output)__/, "direction prefix `input__`/`output__` (use one name, or `<Name>Input` for a differing request shape)"],
  [/Photon\d{8}_/, "dated prefix `Photon<YYYYMMDD>_`"],
  [/(^|_)Shared_[0-9a-f]+/, "hash name `Shared_<hash>`"],
  [/(^|_)Schema_[0-9a-f]+/, "hash name `Schema_<hash>`"],
  [/__schema\d+/, "zod default id `__schemaN`"],
  [/_Problem_|Problem_[A-Z0-9_]+_\d{3}$/, "status-coded problem name (use `<CodePascal>Problem`)"],
  [(name) => /Schema$/.test(name) && !SCHEMA_DOMAIN_NOUNS.has(name), "`Schema`/`IdSchema` suffix"],
  [(name) => [...name.matchAll(/[0-9a-f]{8,}/g)].some(([run]) => /\d/.test(run) && /[a-f]/.test(run)), "hash-like hexadecimal run"],
  [/[A-Za-z]\d+$/, "trailing number (positional counter)"],
  [(name) => !/^[A-Z][A-Za-z0-9]*$/.test(name), "not PascalCase (ASCII letters and digits, starting upper-case)"],
];

/** Convention problems with a component name (empty when the name conforms). */
export function componentNameProblems(name: string): string[] {
  return COMPONENT_NAME_RULES.filter(([rule]) => (typeof rule === "function" ? rule(name) : rule.test(name))).map(([, message]) => message);
}

export interface ContractNamingReport {
  operations: number;
  components: number;
  violations: NamingViolation[];
}

/** The contract naming check over every operation in `document` (the public contract). */
export function checkContractNaming(document: JsonObject): ContractNamingReport {
  const schemas = isObject(document.components) && isObject(document.components.schemas) ? document.components.schemas : {};
  const roots = operationRoots(document);
  const owners = new Map<string, Set<string>>();
  for (const root of roots.values()) {
    const queue = referencedComponents(root.schema, schemas);
    for (let name = queue.shift(); name !== undefined; name = queue.shift()) {
      const operations = owners.get(name) ?? new Set<string>();
      const before = operations.size;
      for (const operation of root.operations) operations.add(operation);
      owners.set(name, operations);
      const schema = schemas[name];
      if (operations.size !== before && schema !== undefined) queue.push(...referencedComponents(schema, schemas, name));
    }
  }
  const violations: NamingViolation[] = [];
  const report = (violation: NamingViolation): void => { violations.push(violation); };
  for (const root of [...roots.values()].sort((a, b) => a.pointer.localeCompare(b.pointer))) {
    checkSchema(root.schema, root.pointer, [...root.operations].sort(), { named: false, where: root.position }, report);
  }
  for (const [name, operationSet] of [...owners].sort(([a], [b]) => a.localeCompare(b))) {
    const operations = [...operationSet].sort();
    const pointer = `/components/schemas/${escapeSegment(name)}`;
    if (schemas[name] === undefined) {
      report({ check: "contract", rule: "unresolved-reference", pointer, name, operations, message: `reference to missing component ${name}` });
      continue;
    }
    const problems = componentNameProblems(name);
    if (problems.length) {
      report({ check: "contract", rule: "component-name", pointer, name, operations, message: `component name ${name}: ${problems.join("; ")}` });
    }
    checkSchema(schemas[name], pointer, operations, { named: true, where: "component" }, report);
  }
  return { operations: publicOperations(document).length, components: owners.size, violations };
}

/** Contract component names and operation-derived client type names. */
export function contractNames(document: JsonObject): { components: Map<string, string>; operations: Map<string, string> } {
  const components = new Map<string, string>();
  const schemas = isObject(document.components) && isObject(document.components.schemas) ? document.components.schemas : {};
  for (const name of Object.keys(schemas)) components.set(nameKey(name), name);
  const operations = new Map<string, string>();
  for (const { operationId } of publicOperations(document)) operations.set(nameKey(pascalCase(operationId)), operationId);
  return { components, operations };
}

/** The operation whose name prefixes `name` with one of `suffixes` exactly, if any. */
function operationFor(name: string, operations: Map<string, string>, suffixes: RegExp): string | undefined {
  const key = nameKey(name);
  for (const [prefix, operationId] of operations) {
    if (key.startsWith(prefix) && suffixes.test(key.slice(prefix.length))) return operationId;
  }
  return undefined;
}

/**
 * Operation-derived names (allowed: they come from the contract's operationId).
 * Hey API's union of success bodies is configured as `<Op>Result`
 * (tools/openapi-generator/openapi-ts.config.ts): its default `<Op>Response`
 * collides with contract components of that name.
 */
const TYPESCRIPT_OPERATION_SUFFIXES = /^(data|errors|error|responses|result|body|path|query|headers)$/;
const HOISTED_ROOT = /^(request|response(\d{3}|\dxx|default))[a-z]+$/;
const TYPESCRIPT_RUNTIME = new Set(["ClientOptions"]);

/**
 * TypeScript: exported names in Hey API's types.gen.ts and zod.gen.ts. Allowed:
 * contract components, spelled exactly (with Hey API's `Writable` read-only
 * split and zod's `z`/`ZodInput`/`ZodOutput` decoration; a case change such as
 * `Oauth` for `OAuth` fails as `component-case`), and
 * `<Op>Data/Errors/Responses/Result/…`.
 */
export function checkTypeScriptNaming(contract: JsonObject, files: { file: string; text: string }[]): NamingViolation[] {
  const { components, operations } = contractNames(contract);
  const exact = new Set(components.values());
  const violations: NamingViolation[] = [];
  const seen = new Set<string>();
  for (const { file, text } of files) {
    for (const [, name] of text.matchAll(/^export (?:declare )?(?:type|const|enum|interface|function|class) ([A-Za-z_$][\w$]*)/gm)) {
      if (TYPESCRIPT_RUNTIME.has(name!)) continue;
      // Component-derived names spell the component exactly (case-sensitive):
      // `<Component>`, `<Component>Writable`, and in zod.gen.ts `z<Component>`
      // and `<Component>ZodInput`/`ZodOutput`.
      const candidates = [name!];
      if (file.endsWith("zod.gen.ts")) {
        if (name!.startsWith("z")) candidates.push(name!.slice(1));
        if (/Zod(Input|Output)$/.test(name!)) candidates.push(name!.replace(/Zod(Input|Output)$/, ""));
      }
      for (const candidate of [...candidates]) if (candidate.endsWith("Writable")) candidates.push(candidate.slice(0, -"Writable".length));
      if (candidates.some((candidate) => exact.has(candidate))) continue;
      const key = `${file}:${name}`;
      // Same letters and digits as a component, spelled differently (case, `_`).
      const differentCase = candidates.map((candidate) => components.get(nameKey(candidate)))
        .find((component) => component !== undefined);
      if (differentCase !== undefined) {
        if (!seen.has(key)) {
          seen.add(key);
          violations.push({
            check: "typescript",
            rule: "component-case",
            name: name!,
            file,
            operations: [],
            message: `${name} changes the spelling of contract component ${differentCase}`,
          });
        }
        continue;
      }
      let base = name!;
      if (file.endsWith("zod.gen.ts")) base = base.replace(/^z(?=[A-Z])/, "").replace(/Zod(Input|Output)$/, "");
      const writable = base.endsWith("Writable");
      const unsplit = writable ? base.slice(0, -"Writable".length) : base;
      const operationId = operationFor(unsplit, operations, TYPESCRIPT_OPERATION_SUFFIXES);
      if (operationId !== undefined && !writable) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      const hoistedOperation = operationFor(unsplit, operations, HOISTED_ROOT);
      const rule = hoistedOperation !== undefined ? "hoisted-root" : writable ? "writable-without-component" : "unnamed-type";
      violations.push({
        check: "typescript",
        rule,
        name: name!,
        file,
        operations: [hoistedOperation ?? operationId].filter((id): id is string => id !== undefined),
        message: rule === "hoisted-root"
          ? `${name} is an operation-media root name, not a contract component`
          : rule === "writable-without-component"
            ? `${name} is a read-only split of a type that is not a contract component`
            : `${name} is neither a contract component nor an operation-derived client type`,
      });
    }
  }
  return violations;
}

// Spargen names the headers of a `default` response `<Op>DefaultHeaders`.
const RUST_OPERATION_SUFFIXES = /^(params|error|response|(status(\d{3}|\dxx)|default)headers)$/;
const RUST_SCALAR = /^(String|bool|[iu](8|16|32|64|128)|f32|f64|DateTime|Date|serde_json::Value|bytes::Bytes|\(\)|uuid::Uuid)$/;
const RUST_RUNTIME = new Set(["Client"]);

/** `alias` is the right-hand side of a `pub type` (possibly empty when it spans lines). */
function rustRule(name: string, alias?: string): { rule: string; message: string } {
  // Spargen disambiguates colliding names with an 8-digit FNV hash of the JSON pointer.
  if ([...name.matchAll(/[0-9A-Fa-f]{8}$/g)].some(([run]) => /\d/.test(run) && /[A-Za-z]/.test(name.slice(0, -8)))) {
    return { rule: "hash-suffix", message: `${name} carries a pointer-hash suffix` };
  }
  if (/Variant\d+/.test(name)) return { rule: "variant-index", message: `${name} is named by union member position` };
  if (alias !== undefined && RUST_SCALAR.test(alias.trim())) {
    return { rule: "scalar-alias", message: `${name} is a per-position alias of ${alias.trim()}` };
  }
  if (alias !== undefined) {
    return { rule: "position-alias", message: `${name} is a per-position type alias${alias.trim() ? ` of ${alias.trim()}` : ""}` };
  }
  return { rule: "unnamed-type", message: `${name} is not a contract component` };
}

/**
 * Rust: items Spargen emits in generated.rs. `types` items must be contract
 * components, spelled exactly (`OauthClient` for `OAuthClient` fails as
 * `component-case`); top-level items must be operation-derived (`<Op>Params`,
 * `<Op>Error`, `<Op>Response`, `<Op>Status<N>Headers`, `<Op>DefaultHeaders`) or the client. Hash
 * suffixes, `Variant{i}` names or variants, per-position scalar aliases and
 * `servers::Server{i}` fail.
 */
export function checkRustNaming(contract: JsonObject, source: string, file = "packages/rust/src/generated.rs"): NamingViolation[] {
  const { components, operations } = contractNames(contract);
  const violations: NamingViolation[] = [];
  const add = (name: string, rule: string, message: string, operationId?: string): void => {
    violations.push({ check: "rust", rule, name, file, operations: operationId ? [operationId] : [], message });
  };
  let module: string | undefined;
  let enumName: string | undefined;
  for (const line of source.split("\n")) {
    const opened = /^(?:pub )?mod (\w+) \{/.exec(line);
    if (opened) { module = opened[1]; continue; }
    if (line.startsWith("}")) { module = undefined; continue; }
    if (module === "types") {
      const reexport = /^ {4}pub use self::\w+ as (\w+);/.exec(line);
      const item = /^ {4}pub (struct|enum|type) (\w+)(?:\s*=\s*(.*?);?\s*$)?/.exec(line);
      const name = reexport?.[1] ?? item?.[2];
      if (name !== undefined) {
        enumName = item?.[1] === "enum" ? name : undefined;
        const component = components.get(nameKey(name));
        if (component === name) continue;
        if (component !== undefined) {
          add(name, "component-case", `${name} changes the spelling of contract component ${component}`);
          continue;
        }
        const { rule, message } = rustRule(name, item?.[1] === "type" ? (item[3] ?? "") : undefined);
        add(name, rule, message);
        continue;
      }
      const variant = /^ {8}(Variant\d+)\b/.exec(line);
      if (variant && enumName !== undefined) {
        add(`${enumName}::${variant[1]}`, "variant-index", `${enumName}::${variant[1]} is named by union member position`);
      }
      continue;
    }
    if (module === "servers") {
      const server = /^ {4}pub struct (Server\d+)\b/.exec(line);
      if (server) add(`servers::${server[1]}`, "server-index", `servers::${server[1]} is named by server position`);
      continue;
    }
    if (module !== undefined) continue;
    const top = /^pub (?:struct|enum|type|trait) (\w+)/.exec(line) ?? /^pub use self::\w+ as (\w+);/.exec(line);
    if (!top) continue;
    const name = top[1]!;
    if (RUST_RUNTIME.has(name)) continue;
    const component = components.get(nameKey(name));
    if (component === name) continue;
    if (component !== undefined) {
      add(name, "component-case", `${name} changes the spelling of contract component ${component}`);
      continue;
    }
    const operationId = operationFor(name, operations, RUST_OPERATION_SUFFIXES);
    if (operationId !== undefined) continue;
    const { rule, message } = rustRule(name);
    add(name, rule, message);
  }
  return violations;
}

/** Counts per check and rule, for summaries and baselines. */
export function countViolations(violations: NamingViolation[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { check, rule } of violations) counts[`${check}/${rule}`] = (counts[`${check}/${rule}`] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function operationList(operations: string[]): string {
  if (!operations.length) return "";
  const shown = operations.slice(0, 3).join(", ");
  return ` (operations: ${shown}${operations.length > 3 ? `, +${operations.length - 3} more` : ""})`;
}

export function formatViolation(violation: NamingViolation): string {
  const where = violation.pointer ?? violation.file ?? "";
  return `[${violation.check}/${violation.rule}] ${where}${violation.name && violation.pointer ? ` (${violation.name})` : ""}: ${violation.message}${operationList(violation.operations)}`;
}

/** Markdown report: per-rule counts, then the first `limit` violations of each rule. */
export function renderNamingReport(title: string, violations: NamingViolation[], limit = 20): string {
  const lines = [`## ${title}`, ""];
  if (!violations.length) return [...lines, "No naming violations.", ""].join("\n");
  const counts = countViolations(violations);
  lines.push(`${violations.length} naming violations.`, "", "| Check / rule | Count |", "| --- | ---: |");
  for (const [rule, count] of Object.entries(counts)) lines.push(`| \`${rule}\` | ${count} |`);
  for (const rule of Object.keys(counts)) {
    const matching = violations.filter((violation) => `${violation.check}/${violation.rule}` === rule);
    lines.push("", `### \`${rule}\``, "");
    for (const violation of matching.slice(0, limit)) lines.push(`- ${formatViolation(violation)}`);
    if (matching.length > limit) lines.push(`- … ${matching.length - limit} more (see the JSON report)`);
  }
  return `${lines.join("\n")}\n`;
}
