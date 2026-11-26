import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { childPointer, contractValues, NoValueError, patternSample, refPointer } from "./contract-values.js";
import { contractPath, isObject, repositoryRoot, type JsonObject } from "./shared.js";

const ref = (name: string): JsonObject => ({ $ref: `#/components/schemas/${name}` });
const ORGANIZATION_ID = "^pho_org_[0-7][0-9a-hjkmnp-tv-z]{25}$";
const document: JsonObject = {
  openapi: "3.1.0",
  info: { title: "Values", version: "1" },
  paths: {},
  components: {
    schemas: {
      OrganizationId: { pattern: ORGANIZATION_ID, type: "string" },
      Greeting: { example: "Hello", minLength: 1, type: "string" },
      Text: { additionalProperties: false, properties: { text: { type: "string" }, type: { const: "text" } }, required: ["type", "text"], type: "object" },
      Read: { additionalProperties: false, properties: { type: { const: "message.read" } }, required: ["type"], type: "object" },
      Content: { oneOf: [ref("Text"), ref("Read")] },
      Message: { properties: { content: ref("Content"), platform: { enum: ["sms", "email"] } }, required: ["content", "platform"], type: "object" },
      ReadReceipt: {
        allOf: [ref("Message"), { properties: { content: { properties: { type: { const: "message.read" } } }, platform: { const: "email" } } }],
      },
      Page: {
        additionalProperties: false,
        properties: { organizations: { items: ref("OrganizationId"), minItems: 1, type: "array" }, size: { maximum: 100, minimum: 10, type: "integer" } },
        required: ["size", "organizations"],
        type: "object",
      },
      Name: { type: "string" },
      Never: { not: {} },
    },
  },
};
const values = contractValues(document);
const sample = (name: string, key = "test") => values.sample(`#/components/schemas/${name}`, { key, name: "name" });

test("a value is the schema's example, else the first one its keywords accept", () => {
  assert.equal(sample("Greeting"), "Hello");
  assert.equal(sample("Name"), "name");
  const page = sample("Page") as { organizations: string[]; size: number };
  assert.equal(page.size, 10);
  assert.equal(page.organizations.length, 1);
  assert.match(page.organizations[0]!, new RegExp(ORGANIZATION_ID));
  assert.deepEqual(sample("Page"), page);
});

test("a later allOf member picks the union branch it narrows", () => {
  assert.deepEqual(sample("ReadReceipt"), { content: { type: "message.read" }, platform: "email" });
  assert.deepEqual(sample("Message"), { content: { text: "text", type: "text" }, platform: "sms" });
});

test("a value can be made to satisfy further schemas", () => {
  const value = values.sample("#/components/schemas/Name", { key: "test", name: "org_example", also: ["#/components/schemas/OrganizationId"] });
  assert.match(value as string, new RegExp(ORGANIZATION_ID));
});

test("a schema that admits no value has no sample", () => {
  assert.throws(() => sample("Never"), NoValueError);
});

test("issues name the JSON pointer of each mismatch", () => {
  assert.deepEqual(values.issues("#/components/schemas/Page", { extra: true, organizations: ["org"], size: 5 }), [
    { pointer: "/extra", message: "must NOT have additional properties" },
    { pointer: "/organizations/0", message: `must match pattern "${ORGANIZATION_ID}"` },
    { pointer: "/size", message: "must be >= 10" },
  ]);
});

test("a pattern's sample matches it and depends only on its key", () => {
  for (const pattern of [ORGANIZATION_ID, "^\\+[1-9]\\d{1,14}$", "^(?!0{32}$)[0-9a-f]{32}$", "^[A-Za-z0-9_-]{43}$", "^[a-z0-9]+(?:-[a-z0-9]+)*$"]) {
    const text = patternSample("key", pattern);
    assert.ok(text !== undefined && new RegExp(pattern, "u").test(text), `${pattern}: ${text}`);
    assert.equal(patternSample("key", pattern), text);
  }
  assert.equal(patternSample("key", "^[a-z]{3,}$", 5, 6)?.length, 5);
});

test("every component schema, and every parameter, request and response schema of an operation, has a value", () => {
  const contract = JSON.parse(readFileSync(resolve(repositoryRoot, contractPath()), "utf8")) as JsonObject;
  const tree = contractValues(contract);
  const target = (pointer: string): string => {
    const node = tree.node(pointer);
    return isObject(node) && typeof node.$ref === "string" ? target(refPointer(node.$ref)) : pointer;
  };
  const media = (pointer: string): string[] => {
    const content = tree.node(childPointer(target(pointer), "content"));
    return isObject(content) ? Object.keys(content).map((type) => childPointer(target(pointer), "content", type, "schema")) : [];
  };
  const pointers = Object.keys((contract.components as JsonObject).schemas as JsonObject).map((name) => childPointer("#/components/schemas", name));
  for (const [path, item] of Object.entries(contract.paths as JsonObject)) {
    if (!isObject(item)) continue;
    const owner = childPointer("#/paths", path);
    for (const index of Array.isArray(item.parameters) ? item.parameters.keys() : []) pointers.push(childPointer(target(childPointer(owner, "parameters", index)), "schema"));
    for (const [method, operation] of Object.entries(item)) {
      if (!(isObject(operation) && typeof operation.operationId === "string")) continue;
      const at = childPointer(owner, method);
      for (const index of Array.isArray(operation.parameters) ? operation.parameters.keys() : []) pointers.push(childPointer(target(childPointer(at, "parameters", index)), "schema"));
      if (operation.requestBody) pointers.push(...media(childPointer(at, "requestBody")));
      for (const status of Object.keys(isObject(operation.responses) ? operation.responses : {})) pointers.push(...media(childPointer(at, "responses", status)));
    }
  }
  const failures: string[] = [];
  for (const pointer of new Set(pointers)) {
    if (tree.node(pointer) === undefined) continue;
    try {
      tree.sample(pointer, { key: pointer, name: "value" });
    } catch (error) {
      failures.push(`${pointer}: ${(error as Error).message}`);
    }
  }
  assert.ok(pointers.length > Object.keys((contract.components as JsonObject).schemas as JsonObject).length);
  assert.deepEqual(failures, []);
});

test("an enum value is one the whole schema accepts", () => {
  const tree = contractValues({ openapi: "3.1.0", paths: {}, components: { schemas: { Status: { type: "string", enum: [0, null, "ok"] } } } });
  assert.equal(tree.sample("#/components/schemas/Status", { key: "k", name: "n" }), "ok");
});

test("a $ref's fragment is percent-decoded, and a member name may hold a percent sign", () => {
  const tree = contractValues({
    openapi: "3.1.0",
    paths: {},
    components: { schemas: { "discount%": { type: "integer", minimum: 5 }, Price: { $ref: "#/components/schemas/discount%25" } } },
  });
  assert.equal(refPointer("#/components/schemas/discount%25"), "#/components/schemas/discount%");
  assert.equal(tree.sample(childPointer("#/components/schemas", "discount%"), { key: "k", name: "n" }), 5);
  assert.deepEqual(tree.issues(childPointer("#/components/schemas", "discount%"), 4), [{ pointer: "", message: "must be >= 5" }]);
  assert.equal(tree.sample("#/components/schemas/Price", { key: "k", name: "n" }), 5);
});
