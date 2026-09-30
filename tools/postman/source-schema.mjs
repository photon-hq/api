import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export const pointer = (value) => value.replaceAll("~", "~0").replaceAll("/", "~1");

/** Compile original schema locations without normalizing or copying their constraints. */
export function sourceValidator(source) {
  assert.match(source.openapi, /^3\.1\./, "Postman source validation requires OpenAPI 3.1");
  assert.ok(!source.jsonSchemaDialect || source.jsonSchemaDialect === "https://json-schema.org/draft/2020-12/schema" ||
    source.jsonSchemaDialect === "https://spec.openapis.org/oas/3.1/dialect/base", "Unsupported source schema dialect");
  // These two options disable Ajv's schema-style lint rules, not assertions:
  // JSON Schema permits union types and tuples without fixed lengths.
  const ajv = new Ajv2020({ strictTypes: false, strictTuples: false });
  addFormats(ajv);
  // Register the OpenAPI envelope so references retain their original document
  // location. Only the referenced Schema Objects are used to validate data.
  ajv.addVocabulary(["openapi", "info", "servers", "paths", "components", "security", "tags",
    "externalDocs", "webhooks", "jsonSchemaDialect", "example", "discriminator", "xml"]);
  const extensionKeywords = new Set();
  function extensions(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith("x-") && !extensionKeywords.has(key)) {
        ajv.addKeyword(key);
        extensionKeywords.add(key);
      }
      extensions(child);
    }
  }
  extensions(source);
  const uri = "https://postman-check.invalid/source.json";
  ajv.addSchema(source, uri);
  const compiled = new Map();
  return (path, value, label) => {
    if (!compiled.has(path)) compiled.set(path, ajv.compile({ $ref: `${uri}${path}` }));
    const validate = compiled.get(path);
    assert.ok(validate(value), `${label}: source schema ${path}: ${ajv.errorsText(validate.errors)}`);
  };
}

/** Resolve OpenAPI Reference Objects; JSON Schema references are handled by Ajv. */
export function sourceObject(source, value, path) {
  const seen = new Set();
  while (value?.$ref) {
    assert.ok(value.$ref.startsWith("#/"), `External OpenAPI reference is not bundled: ${value.$ref}`);
    assert.ok(!seen.has(value.$ref), `Cyclic OpenAPI reference: ${value.$ref}`);
    seen.add(value.$ref);
    path = value.$ref;
    value = decodeURIComponent(path.slice(2)).split("/").reduce((node, key) =>
      node?.[key.replaceAll("~1", "/").replaceAll("~0", "~")], source);
    assert.ok(value, `Missing OpenAPI reference: ${path}`);
  }
  return { value, path };
}
