import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";
import { contractPath, isObject, readJson, repositoryRoot, type JsonObject, type JsonValue } from "./shared.js";

function resolveReference(document: JsonObject, value: JsonObject): JsonObject {
  if (typeof value.$ref !== "string") return value;
  assert.ok(value.$ref.startsWith("#/"), "Expected a local contract reference");
  let target: JsonValue = document;
  for (const part of decodeURIComponent(value.$ref.slice(2)).split("/")) {
    assert(isObject(target));
    target = target[part.replaceAll("~1", "/").replaceAll("~0", "~")]!;
  }
  assert(isObject(target), `Missing ${value.$ref}`);
  return target;
}

function problemCodes(document: JsonObject, value: JsonValue, seen = new Set<string>()): string[] {
  if (!isObject(value)) return [];
  if (typeof value.$ref === "string") {
    assert(!seen.has(value.$ref), "Unexpected cyclic problem schema");
    return problemCodes(document, resolveReference(document, value), new Set([...seen, value.$ref]));
  }
  const code = isObject(value.properties) && isObject(value.properties.code) ? value.properties.code.const : undefined;
  return [
    ...(typeof code === "string" ? [code] : []),
    ...["oneOf", "anyOf", "allOf"].flatMap((key) =>
      Array.isArray(value[key]) ? value[key].flatMap((item) => problemCodes(document, item, seen)) : []),
  ];
}

test("authorization problem bodies and headers survive generation without invented representations", async () => {
  const documents = await Promise.all([contractPath(), "openapi/sdk.json"].map((path) =>
    readJson<JsonObject>(resolve(repositoryRoot, path))));
  const source = documents[0]!;
  // The staging contract already declares the Authorizer's problem responses on
  // every protected operation. Production may lag; there every declared
  // response must still survive projection unchanged.
  const { environment } = await readJson<{ environment: string }>(resolve(repositoryRoot, "config/sdk.json"));
  const requireDeclared = environment === "staging";
  assert(isObject(source.paths) && isObject(source.components) && isObject(source.components.securitySchemes));
  const bearer = new Set(Object.entries(source.components.securitySchemes).flatMap(([name, scheme]) =>
    isObject(scheme) && (scheme.type === "oauth2" || (scheme.type === "http" && scheme.scheme === "bearer")) ? [name] : []));
  const expected = {
    "401": ["NOT_AUTHENTICATED"], "403": ["FORBIDDEN", "INSUFFICIENT_SCOPE"],
    "500": ["INTERNAL_ERROR"], "503": ["UPSTREAM_UNAVAILABLE"],
  };
  let checked = 0;
  for (const [path, item] of Object.entries(source.paths)) {
    assert(isObject(item));
    for (const method of ["get", "put", "post", "delete", "patch", "options", "head", "trace"]) {
      const operation: JsonValue | undefined = item[method];
      if (!isObject(operation)) continue;
      const security = operation.security ?? source.security;
      if (!Array.isArray(security) || security.length === 0 || security.some((s) => !isObject(s) || Object.keys(s).length === 0)
          || !security.some((s) => isObject(s) && Object.keys(s).some((name) => bearer.has(name)))) continue;
      assert(isObject(operation.responses));
      for (const [status, codes] of Object.entries(expected)) {
        const original: JsonValue | undefined = operation.responses[status];
        if (original === undefined && !requireDeclared) continue;
        assert(isObject(original), `${String(operation.operationId)} ${status}: missing problem response`);
        const upstream = resolveReference(source, original);
        assert(isObject(upstream.content) && isObject(upstream.content["application/problem+json"]));
        // Staging declares the complete Authorizer set; elsewhere every code the
        // contract declares must survive projection.
        const required = requireDeclared ? codes : Object.values(upstream.content).flatMap((media) =>
          isObject(media) ? problemCodes(source, media.schema ?? {}) : []);
        for (const document of documents) {
          assert(isObject(document.paths) && isObject(document.paths[path]));
          const projected = document.paths[path][method];
          assert(isObject(projected) && isObject(projected.responses) && isObject(projected.responses[status]));
          const response = resolveReference(document, projected.responses[status]);
          assert(isObject(response.content));
          assert.deepEqual(response.headers, upstream.headers);
          const actual = Object.values(response.content).flatMap((media) =>
            isObject(media) ? problemCodes(document, media.schema ?? {}) : []);
          for (const code of required) assert.ok(actual.includes(code), `${operation.operationId} ${status}: missing ${code}`);
        }
        checked += 1;
      }
    }
  }
  assert.ok(checked > 0, "Expected protected operations in the contract");
});
