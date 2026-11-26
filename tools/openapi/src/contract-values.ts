// Values for the Schema Objects of a contract, and their validation against
// it. The guide-example mock (tools/openapi/check-docs-examples.mjs) answers
// with these values and checks every request and body with the contract's own
// JSON Schema 2020-12 validator (Ajv), and the SDK code samples
// (code-samples.ts) send them as each operation's inputs.
//
// The generator is a port of the valid-value half of
// tools/conformance/values.py: it walks the schema (`const`, `enum`, `$ref`,
// `oneOf`/`anyOf`, `allOf`, then the type), builds a string for a `pattern`
// from the regular expression itself, and keeps only values the validator
// accepts. Where values.py draws random values to stress the SDKs, this one
// draws the value a reader expects: the schema's own example first, then a
// format's sample value, the member's name for an unconstrained string, the
// lowest number the bounds allow, and required members only. The remaining
// choices (the characters a pattern allows) come from a generator seeded with
// the caller's key and the value's location, so a value is reproducible and
// does not change when another part of the contract does.
import { createHash } from "node:crypto";
import { Ajv2020 } from "ajv/dist/2020.js";
import formats from "ajv-formats";
import type { ErrorObject, ValidateFunction } from "ajv";
import { isObject, type JsonObject, type JsonValue } from "./shared.js";

/** Why a value does not match its schema: the JSON pointer of the value, and the validator's message. */
export interface ValueIssue {
  pointer: string;
  message: string;
}

export interface SampleOptions {
  /** Seeds every choice, together with the location of each value inside the sample. */
  key: string;
  /** What the value is for (a member, parameter or body): an unconstrained string's value. */
  name: string;
  /** The number of items each array gets, within its `minItems` and `maxItems`. Defaults to the minimum. */
  items?: number;
  /** Pointers of further Schema Objects the value must satisfy too, such as the other parameters one value is sent as. */
  also?: string[];
}

export interface ContractValues {
  /** The contract's node at a JSON pointer such as `#/components/schemas/Project`. */
  node(pointer: string): JsonValue | undefined;
  /** Why `value` does not match the Schema Object at `pointer`; empty when it matches. */
  issues(pointer: string, value: unknown): ValueIssue[];
  /** A value the Schema Object at `pointer` accepts. Throws `NoValueError` when the generator cannot build one. */
  sample(pointer: string, options: SampleOptions): JsonValue;
}

/** The schema admits no value the generator can build. */
export class NoValueError extends Error {}

/** `/path must ...; /other must ...`, for an error message. */
export function describeIssues(issues: readonly ValueIssue[]): string {
  return issues.map(({ pointer, message }) => `${pointer || "/"} ${message}`).join("; ");
}

/** The JSON pointer a `$ref` names: its URI fragment, percent-decoded (RFC 6901 section 6). */
export function refPointer(ref: string): string {
  if (!ref.startsWith("#")) throw new Error(`${ref}: only references inside the document are supported`);
  return `#${decodeURIComponent(ref.slice(1))}`;
}

/** The JSON pointer of a node below `pointer`, escaping each member name. */
export function childPointer(pointer: string, ...members: Array<string | number>): string {
  return members.reduce<string>((parent, member) => `${parent}/${String(member).replaceAll("~", "~0").replaceAll("/", "~1")}`, pointer);
}

// OpenAPI keywords that appear in and around Schema Objects; the validator
// treats them as annotations. Extension keywords (`x-*`) are added from the
// document. Only Schema Objects are used to validate values.
const OPENAPI_KEYWORDS = ["openapi", "info", "servers", "paths", "components", "security", "tags", "externalDocs", "webhooks",
  "jsonSchemaDialect", "example", "discriminator", "xml"];
const DOCUMENT_URI = "https://contract.invalid/openapi.json";

function validator(document: JsonObject): Ajv2020 {
  const ajv = new Ajv2020({ strictTypes: false, strictTuples: false, allErrors: true });
  formats.default(ajv);
  ajv.addVocabulary(OPENAPI_KEYWORDS);
  const extensions = new Set<string>();
  const visit = (value: JsonValue): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!isObject(value)) return;
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith("x-") && !extensions.has(key)) {
        ajv.addKeyword(key);
        extensions.add(key);
      }
      visit(child);
    }
  };
  visit(document);
  // JSON Schema 2020-12 treats `format` as an annotation; Ajv asserts the
  // formats it knows, so register the others as annotations.
  for (const name of formatNames(document)) if (!(name in ajv.formats)) ajv.addFormat(name, true);
  const { $schema: _dialect, ...schema } = document;
  ajv.addSchema(schema, DOCUMENT_URI);
  return ajv;
}

function formatNames(value: JsonValue, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) for (const item of value) formatNames(item, found);
  else if (isObject(value)) {
    if (typeof value.format === "string") found.add(value.format);
    for (const child of Object.values(value)) formatNames(child, found);
  }
  return found;
}

function issueOf(error: ErrorObject): ValueIssue {
  const params = error.params as { missingProperty?: string; additionalProperty?: string };
  const member = params.missingProperty ?? params.additionalProperty;
  return { pointer: member === undefined ? error.instancePath : childPointer(error.instancePath, member), message: error.message ?? error.keyword };
}

// -- Seeded choices ---------------------------------------------------------------

type Random = () => number;

/** A deterministic generator of numbers in [0, 1) for a key (sfc32, seeded from SHA-256). */
function seeded(key: string): Random {
  const digest = createHash("sha256").update(key).digest();
  let [a, b, c, d] = [0, 4, 8, 12].map((offset) => digest.readUInt32LE(offset)) as [number, number, number, number];
  return () => {
    const result = (a + b + d) >>> 0;
    d = (d + 1) >>> 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) >>> 0;
    c = ((c << 21) | (c >>> 11)) >>> 0;
    c = (c + result) >>> 0;
    return result / 4294967296;
  };
}

const between = (random: Random, low: number, high: number): number => low + Math.floor(random() * (high - low + 1));
const pick = <T>(random: Random, items: readonly T[]): T => items[Math.floor(random() * items.length)]!;

// -- Regular expressions ----------------------------------------------------------

// A string for an ECMA-262 pattern is built from the pattern's syntax tree:
// literals, classes, groups, alternatives and repetitions produce text, while
// anchors and lookarounds produce none, so every candidate is then checked
// against the pattern itself (values.py does the same with Python's parser).
type Category = "digit" | "word" | "space";
type Member = { from: number; to: number } | { category: Category; negate: boolean };
type RegexNode =
  | { kind: "sequence"; items: RegexNode[] }
  | { kind: "alternative"; options: RegexNode[] }
  | { kind: "literal"; text: string }
  | { kind: "class"; negate: boolean; members: Member[] }
  | { kind: "any" }
  | { kind: "group"; index: number | undefined; body: RegexNode }
  | { kind: "repeat"; min: number; max: number; body: RegexNode }
  | { kind: "reference"; index: number }
  | { kind: "assertion" };

class UnsupportedPattern extends Error {}

const DIGITS = "0123456789";
const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const WORD = `${LETTERS}${DIGITS}_`;
// Characters for negated classes and `.`: letters and digits are preferred,
// for readable text, then other visible ASCII. No backquote: the Go samples
// quote JSON bodies with it.
const VISIBLE = Array.from({ length: 95 }, (_, index) => String.fromCodePoint(index + 32)).filter((char) => char !== "\u0060");
const READABLE = [...LETTERS, ...DIGITS];
const CATEGORY_CHARS: Record<Category, string> = { digit: DIGITS, word: WORD, space: " " };

function inCategory(category: Category, char: string): boolean {
  if (category === "digit") return DIGITS.includes(char);
  if (category === "word") return WORD.includes(char);
  return /\s/u.test(char);
}

function inClass(members: readonly Member[], char: string): boolean {
  const code = char.codePointAt(0)!;
  return members.some((member) => ("category" in member
    ? inCategory(member.category, char) !== member.negate
    : member.from <= code && code <= member.to));
}

/** The syntax tree of an ECMA-262 pattern, for the constructs JSON Schema patterns use. */
function parsePattern(pattern: string): RegexNode {
  const chars = [...pattern];
  let at = 0;
  let groups = 0;
  const peek = (offset = 0): string | undefined => chars[at + offset];
  const next = (): string => {
    const char = chars[at];
    if (char === undefined) throw new UnsupportedPattern(`${pattern}: unexpected end`);
    at += 1;
    return char;
  };
  const hex = (count: number): string => {
    const digits = chars.slice(at, at + count).join("");
    if (digits.length !== count || !/^[0-9a-fA-F]+$/.test(digits)) throw new UnsupportedPattern(`${pattern}: bad escape`);
    at += count;
    return String.fromCodePoint(Number.parseInt(digits, 16));
  };
  // The escape after a backslash: a class member, one character, a back reference or an assertion.
  const escape = (inClassBody: boolean): Member | string | RegexNode => {
    const char = next();
    switch (char) {
      case "d": case "D": return { category: "digit", negate: char === "D" };
      case "w": case "W": return { category: "word", negate: char === "W" };
      case "s": case "S": return { category: "space", negate: char === "S" };
      case "t": return "\t";
      case "n": return "\n";
      case "r": return "\r";
      case "f": return "\f";
      case "v": return "\v";
      case "0": return "\0";
      case "x": return hex(2);
      case "u": {
        if (peek() !== "{") return hex(4);
        const close = chars.indexOf("}", at);
        if (close < 0) throw new UnsupportedPattern(`${pattern}: bad escape`);
        const code = Number.parseInt(chars.slice(at + 1, close).join(""), 16);
        at = close + 1;
        return String.fromCodePoint(code);
      }
      case "c": return String.fromCodePoint(next().codePointAt(0)! % 32);
      case "b": return inClassBody ? "\b" : { kind: "assertion" };
      case "B": return { kind: "assertion" };
      case "p": case "P": throw new UnsupportedPattern(`${pattern}: Unicode property escapes are not generated`);
      default: {
        if (inClassBody || !/[1-9]/.test(char)) return char;
        let digits = char;
        while (/[0-9]/.test(peek() ?? "")) digits += next();
        return { kind: "reference", index: Number(digits) };
      }
    }
  };
  const classAtom = (): Member | string => {
    const char = next();
    if (char !== "\\") return char;
    const escaped = escape(true);
    if (typeof escaped !== "string" && "kind" in escaped) throw new UnsupportedPattern(`${pattern}: unexpected escape in a class`);
    return escaped;
  };
  const characterClass = (): RegexNode => {
    const negate = peek() === "^";
    if (negate) at += 1;
    const members: Member[] = [];
    while (peek() !== "]") {
      if (peek() === undefined) throw new UnsupportedPattern(`${pattern}: unclosed class`);
      const low = classAtom();
      if (typeof low !== "string") {
        members.push(low);
      } else if (peek() === "-" && peek(1) !== undefined && peek(1) !== "]") {
        at += 1;
        const high = classAtom();
        if (typeof high !== "string") throw new UnsupportedPattern(`${pattern}: bad range`);
        members.push({ from: low.codePointAt(0)!, to: high.codePointAt(0)! });
      } else {
        members.push({ from: low.codePointAt(0)!, to: low.codePointAt(0)! });
      }
    }
    at += 1;
    return { kind: "class", negate, members };
  };
  const group = (): RegexNode => {
    let index: number | undefined;
    let lookaround = false;
    if (peek() === "?") {
      at += 1;
      const kind = next();
      if (kind === "=" || kind === "!") {
        lookaround = true;
      } else if (kind === "<" && (peek() === "=" || peek() === "!")) {
        at += 1;
        lookaround = true;
      } else if (kind === "<") {
        while (next() !== ">");
        groups += 1;
        index = groups;
      } else if (kind !== ":") {
        throw new UnsupportedPattern(`${pattern}: group (?${kind}`);
      }
    } else {
      groups += 1;
      index = groups;
    }
    const body = alternative();
    if (next() !== ")") throw new UnsupportedPattern(`${pattern}: unclosed group`);
    return lookaround ? { kind: "assertion" } : { kind: "group", index, body };
  };
  const atom = (): RegexNode => {
    const char = next();
    if (char === "^" || char === "$") return { kind: "assertion" };
    if (char === ".") return { kind: "any" };
    if (char === "[") return characterClass();
    if (char === "(") return group();
    if (char !== "\\") return { kind: "literal", text: char };
    const escaped = escape(false);
    if (typeof escaped === "string") return { kind: "literal", text: escaped };
    if ("kind" in escaped) return escaped;
    return { kind: "class", negate: false, members: [escaped] };
  };
  const quantified = (body: RegexNode): RegexNode => {
    let bounds: [number, number] | undefined;
    const char = peek();
    if (char === "*") bounds = [0, Infinity];
    else if (char === "+") bounds = [1, Infinity];
    else if (char === "?") bounds = [0, 1];
    else if (char === "{") {
      const match = /^\{(\d+)(,(\d*))?\}/.exec(chars.slice(at).join(""));
      if (!match) return body;
      const low = Number(match[1]);
      bounds = [low, match[2] === undefined ? low : match[3] ? Number(match[3]) : Infinity];
      at += match[0].length - 1;
    }
    if (!bounds) return body;
    at += 1;
    if (peek() === "?") at += 1;
    return { kind: "repeat", min: bounds[0], max: bounds[1], body };
  };
  const sequence = (): RegexNode => {
    const items: RegexNode[] = [];
    while (peek() !== undefined && peek() !== "|" && peek() !== ")") items.push(quantified(atom()));
    return { kind: "sequence", items };
  };
  const alternative = (): RegexNode => {
    const options = [sequence()];
    while (peek() === "|") {
      at += 1;
      options.push(sequence());
    }
    return options.length === 1 ? options[0]! : { kind: "alternative", options };
  };
  const tree = alternative();
  if (at < chars.length) throw new UnsupportedPattern(`${pattern}: unbalanced parenthesis`);
  return tree;
}

function classChar(random: Random, negate: boolean, members: readonly Member[]): string {
  if (negate) {
    const readable = READABLE.filter((char) => !inClass(members, char));
    const allowed = readable.length ? readable : VISIBLE.filter((char) => !inClass(members, char));
    if (!allowed.length) throw new UnsupportedPattern("a negated class without a visible ASCII character");
    return pick(random, allowed);
  }
  const member = pick(random, members);
  if ("category" in member) {
    const chars = member.negate ? READABLE.filter((char) => !inCategory(member.category, char)) : [...CATEGORY_CHARS[member.category]];
    return pick(random, chars.length ? chars : VISIBLE.filter((char) => !inCategory(member.category, char)));
  }
  return String.fromCodePoint(pick(random, [member.from, member.to, between(random, member.from, member.to)]));
}

function fromTree(random: Random, node: RegexNode, captures: Map<number, string>, stretch: number): string {
  switch (node.kind) {
    case "sequence": return node.items.map((item) => fromTree(random, item, captures, stretch)).join("");
    case "alternative": return fromTree(random, pick(random, node.options), captures, stretch);
    case "literal": return node.text;
    case "class": return classChar(random, node.negate, node.members);
    case "any": return pick(random, READABLE);
    case "group": {
      const text = fromTree(random, node.body, captures, stretch);
      if (node.index !== undefined) captures.set(node.index, text);
      return text;
    }
    case "repeat": {
      const high = node.max === Infinity ? node.min + stretch : node.max;
      const count = pick(random, [node.min, high, between(random, node.min, high)]);
      return Array.from({ length: count }, () => fromTree(random, node.body, captures, stretch)).join("");
    }
    case "reference": return captures.get(node.index) ?? "";
    case "assertion": return "";
  }
}

const length = (text: string): number => [...text].length;

/** A string that matches an ECMA-262 pattern within the length bounds, or undefined (values.py `regex_sample`). */
export function patternSample(key: string, pattern: string, minLength = 0, maxLength?: number): string | undefined {
  let tree: RegexNode;
  try {
    tree = parsePattern(pattern);
  } catch (error) {
    if (error instanceof UnsupportedPattern) return undefined;
    throw error;
  }
  const expression = new RegExp(pattern, "u");
  let stretch = 4;
  for (let attempt = 0; attempt < 16; attempt += 1) {
    let text: string;
    try {
      text = fromTree(seeded(`${key}:${attempt}`), tree, new Map(), stretch);
    } catch (error) {
      if (error instanceof UnsupportedPattern) return undefined;
      throw error;
    }
    if (length(text) < minLength) {
      // Open repetitions (`+`, `*`) grow until the minimum length fits.
      stretch = Math.max(stretch * 2, minLength);
      continue;
    }
    if (maxLength !== undefined && length(text) > maxLength) {
      stretch = Math.max(1, Math.floor(stretch / 2));
      continue;
    }
    if (expression.test(text)) return text;
  }
  return undefined;
}

// -- Values -----------------------------------------------------------------------

/** Readable values per format; a pattern beside the format picks between them. */
const FORMAT_SAMPLES: Record<string, string[]> = {
  "date-time": ["2026-01-01T00:00:00Z", "2026-01-01T00:00:00.000Z"],
  date: ["2026-01-01"],
  time: ["00:00:00Z"],
  uri: ["https://example.com"],
  url: ["https://example.com"],
  "uri-reference": ["https://example.com"],
  email: ["user@example.com"],
  uuid: ["00000000-0000-4000-8000-000000000000"],
  ipv4: ["192.0.2.1"],
  ipv6: ["2001:db8::1"],
  hostname: ["example.com"],
  base64: ["aGVsbG8="],
  byte: ["aGVsbG8="],
};
const READABLE_SAMPLES = [...new Set(Object.values(FORMAT_SAMPLES).flat())];

// Keywords that do not constrain a value (values.py `ANNOTATIONS`, without `format`, which Ajv asserts).
const ANNOTATIONS = new Set(["title", "description", "example", "examples", "deprecated", "readOnly", "writeOnly", "default",
  "$schema", "$comment", "contentEncoding", "contentMediaType", "discriminator", "externalDocs", "xml"]);
const MAX_DEPTH = 24;

/** The JSON types a schema allows: its `type`, or the type its keywords imply (values.py `_types`). */
function types(schema: JsonObject): string[] {
  if (typeof schema.type === "string") return [schema.type];
  if (Array.isArray(schema.type)) return schema.type.filter((type): type is string => typeof type === "string");
  if (["properties", "additionalProperties", "required", "propertyNames", "minProperties"].some((key) => key in schema)) return ["object"];
  if ("items" in schema || "prefixItems" in schema) return ["array"];
  if (["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf"].some((key) => key in schema)) return ["number"];
  return ["string"];
}

/** A member that must never be present: `false` or `{ "not": {} }`. */
function forbidden(schema: JsonValue | undefined): boolean {
  return schema === false || (isObject(schema) && isObject(schema.not) && Object.keys(schema.not).length === 0
    && Object.keys(schema).every((key) => key === "not" || ANNOTATIONS.has(key)));
}

/** The values, and the validator, of one contract. */
export function contractValues(document: JsonObject): ContractValues {
  const ajv = validator(document);
  const compiled = new Map<string, ValidateFunction>();

  function node(pointer: string): JsonValue | undefined {
    let current: JsonValue | undefined = document;
    for (const part of pointer.replace(/^#\/?/, "").split("/").filter((segment, index) => segment || index > 0)) {
      const key = part.replaceAll("~1", "/").replaceAll("~0", "~");
      current = Array.isArray(current) ? current[Number(key)] : isObject(current) ? current[key] : undefined;
    }
    return current;
  }

  function issues(pointer: string, value: unknown): ValueIssue[] {
    let validate = compiled.get(pointer);
    if (!validate) {
      const fragment = pointer.slice(1).split("/").map((part) => encodeURIComponent(part)).join("/");
      validate = ajv.compile({ $ref: `${DOCUMENT_URI}#${fragment}` });
      compiled.set(pointer, validate);
    }
    return validate(value) ? [] : (validate.errors ?? []).map(issueOf);
  }

  const valid = (pointer: string, value: unknown): boolean => issues(pointer, value).length === 0;

  function isNull(branch: JsonValue | undefined): boolean {
    const resolved = isObject(branch) && typeof branch.$ref === "string" ? node(refPointer(branch.$ref)) : branch;
    return isObject(resolved) && resolved.type === "null";
  }

  /** Whether `value` also satisfies every schema in `also`. */
  const allows = (also: string[], value: unknown): boolean => also.every((at) => valid(at, value));

  /**
   * A value of the schema at `pointer` that the schemas in `also` accept too:
   * the later members of an enclosing `allOf`, carried down member by member,
   * so a union picks the branch they narrow it to.
   */
  function generate(pointer: string, path: string, name: string, depth: number, options: SampleOptions, also: string[] = []): JsonValue {
    if (depth > MAX_DEPTH) throw new NoValueError(`${pointer}: nested deeper than ${MAX_DEPTH} schemas`);
    const schema = node(pointer);
    if (!(schema === true || isObject(schema)) || forbidden(schema)) throw new NoValueError(`${pointer} admits no value`);
    if (schema === true || Object.keys(schema).every((key) => ANNOTATIONS.has(key) && key !== "example" && key !== "examples")) {
      return also.length ? generate(also[0]!, path, name, depth + 1, options, also.slice(1)) : name;
    }
    const fits = (value: unknown): boolean => valid(pointer, value) && allows(also, value);
    // The schema's own examples first, as Prism, Steady and Speakeasy do.
    const examples = [...(Array.isArray(schema.examples) ? schema.examples : []), ...("example" in schema ? [schema.example as JsonValue] : [])];
    const example = examples.find(fits);
    if (example !== undefined) return structuredClone(example);
    if ("const" in schema) {
      if (!allows(also, schema.const)) throw new NoValueError(`${pointer}: the constant is outside ${also.join(", ")}`);
      return structuredClone(schema.const as JsonValue);
    }
    if (Array.isArray(schema.enum) && schema.enum.length) {
      const choices = schema.enum.filter(fits);
      if (!choices.length) throw new NoValueError(`${pointer}: no enum value fits the schema${also.length ? ` and ${also.join(", ")}` : ""}`);
      return structuredClone(choices.find((value) => value !== null) ?? choices[0]!);
    }
    if (typeof schema.$ref === "string") {
      return conform(generate(refPointer(schema.$ref), path, name, depth + 1, options, also), pointer, schema, path, depth, options, true);
    }
    for (const keyword of ["oneOf", "anyOf"] as const) {
      const branches = schema[keyword];
      if (Array.isArray(branches) && branches.length) return union(pointer, schema, keyword, branches, path, name, depth, options, also);
    }
    if (Array.isArray(schema.allOf) && schema.allOf.length) {
      const rest = schema.allOf.slice(1).map((_, index) => childPointer(pointer, "allOf", index + 1));
      let value = generate(childPointer(pointer, "allOf", 0), path, name, depth + 1, options, [...rest, ...also]);
      for (const part of rest) {
        const partSchema = node(part);
        if (isObject(partSchema)) value = conform(value, part, partSchema, path, depth, options);
      }
      return conform(value, pointer, schema, path, depth, options);
    }
    return typed(pointer, schema, path, name, depth, options, also);
  }

  /** The first branch, `null` last, whose value the whole schema, and `also`, accept. */
  function union(pointer: string, schema: JsonObject, keyword: "oneOf" | "anyOf", branches: JsonValue[], path: string, name: string, depth: number,
    options: SampleOptions, also: string[]): JsonValue {
    const order = branches.map((_, index) => index).sort((left, right) => Number(isNull(branches[left])) - Number(isNull(branches[right])));
    const fits = (value: unknown): boolean => valid(pointer, value) && allows(also, value);
    let first: JsonValue | undefined;
    for (const index of order) {
      let value: JsonValue;
      try {
        value = conform(generate(childPointer(pointer, keyword, index), path, name, depth + 1, options, also), pointer, schema, path, depth, options);
      } catch (error) {
        if (error instanceof NoValueError) continue;
        throw error;
      }
      if (fits(value)) return value;
      first ??= value;
    }
    // A union beside type keywords of its own (a `pattern` all branches share): a value of those keywords.
    const { [keyword]: _branches, ...own } = schema;
    if (Object.keys(own).some((key) => !ANNOTATIONS.has(key))) {
      try {
        const value = typed(pointer, own, path, name, depth, options, also);
        if (fits(value)) return value;
      } catch (error) {
        if (!(error instanceof NoValueError)) throw error;
      }
    }
    if (first === undefined) throw new NoValueError(`${pointer}: no ${keyword} branch has a value`);
    return first;
  }

  /**
   * Make `value` also satisfy the object keywords of `schema`, a sibling of
   * the `$ref`, union or `allOf` it came from, or a later `allOf` member:
   * add the members it requires, and regenerate the members it narrows
   * (values.py `_conform`).
   */
  function conform(value: JsonValue, pointer: string, schema: JsonObject, path: string, depth: number, options: SampleOptions,
    skipReference = false): JsonValue {
    if (!skipReference && typeof schema.$ref === "string") {
      const target = node(refPointer(schema.$ref));
      if (isObject(target)) value = conform(value, refPointer(schema.$ref), target, path, depth + 1, options);
    }
    if (!isObject(value)) return value;
    const properties = isObject(schema.properties) ? schema.properties : {};
    for (const member of Array.isArray(schema.required) ? schema.required : []) {
      if (typeof member !== "string" || member in value || !(member in properties)) continue;
      value[member] = generate(childPointer(pointer, "properties", member), childPointer(path, member), member, depth + 1, options);
    }
    for (const member of Object.keys(properties)) {
      const at = childPointer(pointer, "properties", member);
      if (member in value && !valid(at, value[member])) {
        value[member] = generate(at, childPointer(path, member), member, depth + 1, options);
      }
    }
    return value;
  }

  /** The schemas in `also`, with the ones they reach through `$ref` and `allOf`. */
  function reached(also: string[]): string[] {
    const found: string[] = [];
    const visit = (at: string, depth: number): void => {
      const schema = node(at);
      if (!isObject(schema) || depth > MAX_DEPTH) return;
      found.push(at);
      if (typeof schema.$ref === "string") visit(refPointer(schema.$ref), depth + 1);
      if (Array.isArray(schema.allOf)) schema.allOf.forEach((_, index) => visit(childPointer(at, "allOf", index), depth + 1));
    };
    for (const at of also) visit(at, 0);
    return found;
  }

  function typed(pointer: string, schema: JsonObject, path: string, name: string, depth: number, options: SampleOptions,
    also: string[]): JsonValue {
    const type = types(schema).find((candidate) => candidate !== "null");
    if (type === undefined) return null;
    if (type === "object") return object(pointer, schema, path, depth, options, also);
    if (type === "array") return array(pointer, schema, path, name, depth, options);
    const sources = [schema, ...reached(also).map(node).filter(isObject)];
    const candidates = type === "string" ? sources.flatMap((source) => strings(source, path, name, options))
      : type === "integer" || type === "number" ? sources.flatMap((source) => numbers(source, type === "integer"))
        : type === "boolean" ? [true, false] : [null];
    const value = candidates.find((candidate) => valid(pointer, candidate) && allows(also, candidate));
    if (value === undefined) throw new NoValueError(`${pointer}: no ${type} value matches (${describeIssues(issues(pointer, candidates[0]))})`);
    return value;
  }

  function object(pointer: string, schema: JsonObject, path: string, depth: number, options: SampleOptions, also: string[]): JsonObject {
    const properties = isObject(schema.properties) ? schema.properties : {};
    const extra = schema.additionalProperties;
    const narrowing = reached(also).flatMap((at) => {
      const narrower = node(at);
      return isObject(narrower) ? [[at, narrower] as const] : [];
    });
    const value: JsonObject = {};
    const add = (member: string): void => {
      const at = member in properties ? childPointer(pointer, "properties", member)
        : isObject(extra) ? childPointer(pointer, "additionalProperties") : undefined;
      const narrowed = narrowing.flatMap(([narrowerAt, narrower]) =>
        isObject(narrower.properties) && member in narrower.properties ? [childPointer(narrowerAt, "properties", member)] : []);
      const memberPath = childPointer(path, member);
      if (at) value[member] = generate(at, memberPath, member, depth + 1, options, narrowed);
      else value[member] = narrowed.length ? generate(narrowed[0]!, memberPath, member, depth + 1, options, narrowed.slice(1)) : member;
    };
    const required = [schema.required, ...narrowing.map(([, narrower]) => narrower.required)]
      .flatMap((list) => (Array.isArray(list) ? list : []));
    for (const member of required) if (typeof member === "string" && !(member in value)) add(member);
    // Members a present member requires (`dependentRequired`).
    const dependencies = isObject(schema.dependentRequired) ? schema.dependentRequired : {};
    for (const [member, needs] of Object.entries(dependencies)) {
      if (!(member in value) || !Array.isArray(needs)) continue;
      for (const need of needs) if (typeof need === "string" && !(need in value)) add(need);
    }
    // `minProperties`: optional members in order, then names `additionalProperties` allows.
    const wanted = typeof schema.minProperties === "number" ? schema.minProperties : 0;
    for (const member of Object.keys(properties)) {
      if (Object.keys(value).length >= wanted) break;
      if (!(member in value) && !forbidden(properties[member])) add(member);
    }
    for (let index = 1; Object.keys(value).length < wanted && extra !== false && index <= wanted; index += 1) {
      const member = isObject(schema.propertyNames)
        ? strings(schema.propertyNames, childPointer(path, index), "key", options).find((candidate) => valid(childPointer(pointer, "propertyNames"), candidate))
        : `key${index}`;
      if (typeof member === "string" && !(member in value)) add(member);
    }
    return value;
  }

  function array(pointer: string, schema: JsonObject, path: string, name: string, depth: number, options: SampleOptions): JsonValue[] {
    const prefix = Array.isArray(schema.prefixItems) ? schema.prefixItems : [];
    const low = typeof schema.minItems === "number" ? schema.minItems : 0;
    const high = typeof schema.maxItems === "number" ? schema.maxItems : Infinity;
    const count = Math.min(high, Math.max(low, options.items ?? 0), schema.items === false ? prefix.length : Infinity);
    return Array.from({ length: count }, (_, index) => {
      const at = index < prefix.length ? childPointer(pointer, "prefixItems", index) : isObject(schema.items) ? childPointer(pointer, "items") : undefined;
      return at ? generate(at, childPointer(path, index), name, depth + 1, options) : name;
    });
  }

  /** Candidates for a string, in order: format samples, the name, then a string built from the pattern. */
  function strings(schema: JsonObject, path: string, name: string, options: SampleOptions): JsonValue[] {
    const low = typeof schema.minLength === "number" ? schema.minLength : 0;
    const high = typeof schema.maxLength === "number" ? schema.maxLength : undefined;
    const fit = (text: string): string => text.repeat(Math.max(1, Math.ceil(low / Math.max(1, text.length)))).slice(0, high);
    const candidates: JsonValue[] = [...(typeof schema.format === "string" ? FORMAT_SAMPLES[schema.format] ?? [] : []), fit(name)];
    if (typeof schema.pattern === "string") {
      // A readable value the pattern happens to accept (an email address, a URL), else one built from it.
      candidates.push(...READABLE_SAMPLES);
      const text = patternSample(`${options.key}${path}`, schema.pattern, low, high);
      if (text !== undefined) candidates.push(text);
    } else {
      candidates.push(fit("x"));
    }
    return candidates;
  }

  function numbers(schema: JsonObject, whole: boolean): number[] {
    const bound = (key: string): number | undefined => (typeof schema[key] === "number" ? schema[key] : undefined);
    const step = whole ? 1 : 0.5;
    const minimum = bound("minimum");
    const maximum = bound("maximum");
    const exclusiveMinimum = bound("exclusiveMinimum");
    const exclusiveMaximum = bound("exclusiveMaximum");
    const multiple = bound("multipleOf");
    const candidates = [
      ...(minimum === undefined ? [] : [whole ? Math.ceil(minimum) : minimum]),
      ...(exclusiveMinimum === undefined ? [] : [whole ? Math.floor(exclusiveMinimum) + 1 : exclusiveMinimum + step]),
      1,
      0,
      ...(maximum === undefined ? [] : [whole ? Math.floor(maximum) : maximum]),
      ...(exclusiveMaximum === undefined ? [] : [whole ? Math.ceil(exclusiveMaximum) - 1 : exclusiveMaximum - step]),
    ];
    return multiple === undefined ? candidates : [...candidates.map((value) => Math.ceil(value / multiple) * multiple), multiple];
  }

  return {
    node,
    issues,
    sample(pointer, options) {
      const also = options.also ?? [];
      const value = generate(pointer, "", options.name, 0, options, also);
      for (const at of [pointer, ...also]) {
        const problems = issues(at, value);
        if (problems.length) throw new NoValueError(`${at}: the generated value does not match (${describeIssues(problems)})`);
      }
      return value;
    },
  };
}
