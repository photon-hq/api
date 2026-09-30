import { assert, isObject, pascalCase, stableJson, type JsonObject, type JsonValue } from "./shared.js";

function baseMediaType(value: string): string {
  return value.split(";", 1)[0]!.trim().toLowerCase();
}

/** Select the representation our JSON SDKs can serialize and validate. */
export function selectJsonMedia<T>(
  content: Record<string, T>,
  context: string,
): { mediaType: string; value: T } | undefined {
  const entries = Object.entries(content);
  if (entries.length === 0) return undefined;
  const json = entries.filter(
    ([key]) => baseMediaType(key) === "application/json",
  );
  const candidates =
    json.length > 0
      ? json
      : entries.filter(([key]) => {
          const mediaType = baseMediaType(key);
          return (
            mediaType.startsWith("application/") && mediaType.endsWith("+json")
          );
        });
  assert(
    candidates.length === 1,
    `${context}: ${candidates.length === 0 ? "no supported JSON media type" : "ambiguous JSON media types"} (${entries
      .map(([key]) => key)
      .sort()
      .join(", ")})`,
  );
  const [mediaType, value] = candidates[0]!;
  return { mediaType, value };
}

/** Preserve existing single-format uploads; choose JSON when alternatives exist. */
export function selectRequestMedia<T>(
  content: Record<string, T>,
  context: string,
) {
  const entries = Object.entries(content);
  if (entries.length === 1) {
    const [mediaType, value] = entries[0]!;
    return { mediaType, value };
  }
  return selectJsonMedia(content, context);
}

export function isJsonMediaType(mediaType: string): boolean {
  const base = baseMediaType(mediaType);
  return (
    base === "application/json" ||
    (base.startsWith("application/") && base.endsWith("+json"))
  );
}

export function isBinaryMediaType(mediaType: string): boolean {
  return ["application/octet-stream", "*/*"].includes(baseMediaType(mediaType));
}

/** Binary-only downloads retain bytes; mixed representations still select JSON. */
export function selectResponseMedia<T>(content: Record<string, T>, context: string) {
  const entries = Object.entries(content);
  if (entries.length === 1 && isBinaryMediaType(entries[0]![0])) {
    const [mediaType, value] = entries[0]!;
    return { mediaType, value };
  }
  return selectJsonMedia(content, context);
}

export function sdkRequestNote(content: Record<string, unknown> | undefined): string {
  if (!content || Object.keys(content).length < 2) return "";
  const selected = selectRequestMedia(content, "SDK request note")!;
  return `This SDK method sends uncompressed JSON (${selected.mediaType}). Other request formats described above apply to direct HTTP requests.`;
}

function supportsRawBytes(
  schema: unknown,
  document: JsonObject,
  seen = new Set<string>(),
): boolean {
  if (schema === undefined || schema === true) return true;
  if (!isObject(schema)) return false;
  const annotations = new Set([
    "title", "description", "example", "examples", "default", "$schema", "deprecated", "readOnly", "writeOnly",
  ]);
  const keys = Object.keys(schema).filter((key) => !annotations.has(key));
  if (keys.length === 0) return true;
  if (keys.length === 1 && typeof schema.$ref === "string") {
    const prefix = "#/components/schemas/";
    if (!schema.$ref.startsWith(prefix) || seen.has(schema.$ref)) return false;
    seen.add(schema.$ref);
    const name = decodeURIComponent(schema.$ref.slice(prefix.length))
      .replaceAll("~1", "/")
      .replaceAll("~0", "~");
    const schemas = isObject(document.components) && document.components.schemas;
    return isObject(schemas)
      && name in schemas
      && supportsRawBytes(schemas[name], document, seen);
  }
  return schema.format === "binary"
    && (schema.type === undefined || schema.type === "string")
    && keys.every((key) => key === "type" || key === "format");
}

/** Keep the full hoisted document intact; select media only in SDK inputs. */
export function jsonSdkDocument(hoisted: JsonObject): JsonObject {
  const document = structuredClone(hoisted);
  const errorBodies = new Map<string, string>();
  const sharedErrorBody = (schemas: JsonValue[], context: string): JsonObject => {
    if (!isObject(document.components)) document.components = {};
    if (!isObject(document.components.schemas)) document.components.schemas = {};
    const components = document.components.schemas;
    // Error schemas are already hoisted. Compare complete referenced definitions,
    // including documentation and validation, so identical endpoint errors share
    // one new union instead of generating a wrapper for every operation.
    const identity = schemas.map((schema) => {
      if (isObject(schema) && Object.keys(schema).length === 1 && typeof schema.$ref === "string"
          && schema.$ref.startsWith("#/components/schemas/")) {
        return components[schema.$ref.slice("#/components/schemas/".length)] ?? schema;
      }
      return schema;
    });
    const key = stableJson(identity);
    let name = errorBodies.get(key);
    if (!name) {
      name = `${pascalCase(context)}Body`;
      assert(components[name] === undefined, `SDK error component already exists: ${name}`);
      components[name] = { anyOf: schemas };
      errorBodies.set(key, name);
    }
    return { $ref: `#/components/schemas/${name}` };
  };
  const selectContent = (
    holder: unknown,
    context: string,
    request = false,
    errorResponse = false,
  ): void => {
    if (!isObject(holder) || !isObject(holder.content)) return;
    if (errorResponse) {
      const json = Object.entries(holder.content).filter(([type]) => isJsonMediaType(type))
        .sort(([left], [right]) => left.localeCompare(right));
      if (json.length > 1) {
        // Some upstream endpoints declare multiple JSON error representations
        // for one status. The SDK must decode every declared body shape.
        const schemas = json.map(([type, media]) => {
          assert(isObject(media) && (isObject(media.schema) || typeof media.schema === "boolean"),
            `${context}: missing schema for ${type}`);
          return media.schema;
        });
        holder.content = { "application/json": { schema: sharedErrorBody(schemas, context) } };
        return;
      }
    }
    const selected = (request ? selectRequestMedia : selectResponseMedia)(
      holder.content,
      context,
    );
    if (!selected) return;
    if (!request && isBinaryMediaType(selected.mediaType)) {
      assert(
        isObject(selected.value) && supportsRawBytes(selected.value.schema, document),
        `${context}: wildcard response requires an unconstrained or binary schema`,
      );
    }
    holder.content = { [selected.mediaType]: selected.value };
  };
  assert(isObject(document.paths), "SDK document must have paths");
  for (const [path, pathItem] of Object.entries(document.paths)) {
    if (!isObject(pathItem)) continue;
    for (const method of [
      "get",
      "put",
      "post",
      "delete",
      "patch",
      "options",
      "head",
      "trace",
    ]) {
      const operation = pathItem[method];
      if (!isObject(operation)) continue;
      const context = String(
        operation.operationId ?? `${method.toUpperCase()} ${path}`,
      );
      const note = isObject(operation.requestBody) && isObject(operation.requestBody.content)
        ? sdkRequestNote(operation.requestBody.content) : "";
      if (note && !String(operation.description ?? "").endsWith(note)) {
        operation.description = [operation.description, note].filter(Boolean).join("\n\n");
      }
      selectContent(operation.requestBody, `${context} request`, true);
      if (isObject(operation.responses)) {
        for (const [status, response] of Object.entries(operation.responses)) {
          selectContent(response, `${context} response ${status}`, false, !/^2(?:\d{2}|XX)$/i.test(status));
        }
      }
    }
  }
  if (isObject(document.components)) {
    // Hoisted draft-2020-12 schemas use the same validation vocabulary as the
    // OAS 3.1 base dialect accepted by Spargen. Keep the original declaration
    // in the contract and adapt only these known schema roots for SDKs.
    if (isObject(document.components.schemas)) {
      for (const schema of Object.values(document.components.schemas)) {
        // A schema-valued open dictionary makes Spargen retain arbitrary JSON
        // fields. Boolean true only permits (and then discards) unknown fields.
        // The two forms accept the same values; OTLP partialSuccess must survive.
        if (
          isObject(schema) &&
          schema.type === "object" &&
          (!isObject(schema.properties) || Object.keys(schema.properties).length === 0) &&
          schema.additionalProperties === true
        ) {
          schema.additionalProperties = {};
        }
        if (
          isObject(schema) &&
          schema.$schema === "https://json-schema.org/draft/2020-12/schema"
        ) {
          schema.$schema = "https://spec.openapis.org/oas/3.1/dialect/base";
        }
      }
    }
    for (const kind of ["requestBodies", "responses"]) {
      const components = document.components[kind];
      if (!isObject(components)) continue;
      for (const [name, value] of Object.entries(components)) {
        selectContent(
          value,
          `components.${kind}.${name}`,
          kind === "requestBodies",
          kind === "responses",
        );
      }
    }
  }
  return document;
}
