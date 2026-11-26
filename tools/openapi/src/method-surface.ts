import { isFileUpload } from "./media-types.js";
import { assert, isObject, type JsonObject, type JsonValue } from "./shared.js";

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "patch", "options", "head", "trace"]);

/**
 * Request headers the client sends from its own configuration. The contract
 * declares `Photon-Version` on each versioned operation; the SDKs take it from
 * the client (the date a release is pinned to, or a date the caller sets on the
 * client or in a request's headers), as SDKs carry an API version in client
 * configuration rather than as a method argument.
 */
const CLIENT_HEADERS = new Set(["photon-version"]);

/**
 * Request headers of a file upload that the SDK sets from the body it builds:
 * Content-Type carries the multipart boundary, and the HTTP client sets
 * Content-Length from the body (RFC 9110 section 8.6).
 */
const FILE_UPLOAD_HEADERS = new Set(["content-type", "content-length"]);

/** Request headers that make a request conditional (RFC 9110 section 13.1). */
const PRECONDITION_HEADERS = new Set(["if-none-match", "if-modified-since"]);

const COMPONENT_PARAMETERS = "#/components/parameters/";
const COMPONENT_REQUEST_BODIES = "#/components/requestBodies/";

/**
 * Shapes what each generated method takes and returns, in the SDK input only:
 * the contract keeps every parameter and response.
 *
 * - A client header is not a method parameter.
 * - A file upload's Content-Type and Content-Length are not method parameters:
 *   the method takes the file and sets both from the body it builds
 *   (`isFileUpload` in media-types.ts). OpenAPI cannot remove a path-level
 *   parameter from one operation, so when a path declares either header and
 *   one of its operations is a file upload, each operation of that path gets
 *   its own copy of the path's parameters. A file upload's body is required:
 *   the method has no request to send without the file.
 * - A server sends 304 Not Modified only in reply to a conditional request
 *   (RFC 9110 section 15.4.5). An operation whose parameters include no
 *   precondition header cannot receive one through its method, so its 304 is
 *   not part of the method's result; a 304 it gets anyway (the caller added
 *   If-None-Match to the request's headers) is an undocumented status, an API
 *   error in every SDK. An operation that takes If-None-Match or
 *   If-Modified-Since keeps its 304.
 */
export function prepareMethodSurface(document: JsonObject): void {
  const parameters = isObject(document.components) && isObject(document.components.parameters)
    ? document.components.parameters
    : {};
  const resolveParameter = (value: JsonValue): JsonObject | undefined => {
    const seen = new Set<string>();
    let parameter: JsonValue | undefined = value;
    while (isObject(parameter) && typeof parameter.$ref === "string") {
      const reference: string = parameter.$ref;
      if (!reference.startsWith(COMPONENT_PARAMETERS) || seen.has(reference)) return undefined;
      seen.add(reference);
      parameter = parameters[decodeURIComponent(reference.slice(COMPONENT_PARAMETERS.length))];
    }
    return isObject(parameter) && typeof parameter.name === "string" ? parameter : undefined;
  };
  const headerName = (value: JsonValue): string | undefined => {
    const parameter = resolveParameter(value);
    return parameter?.in === "header" ? String(parameter.name).toLowerCase() : undefined;
  };
  /** A parameter's identity: its location and name (case-insensitive for a header). */
  const parameterKey = (value: JsonValue): string | undefined => {
    const parameter = resolveParameter(value);
    if (parameter === undefined) return undefined;
    const name = String(parameter.name);
    return `${String(parameter.in)}:${parameter.in === "header" ? name.toLowerCase() : name}`;
  };
  const requestBodies = isObject(document.components) && isObject(document.components.requestBodies)
    ? document.components.requestBodies
    : {};
  const requestBody = (value: JsonValue | undefined): JsonObject | undefined => {
    const seen = new Set<string>();
    let body = value;
    while (isObject(body) && typeof body.$ref === "string") {
      const reference: string = body.$ref;
      if (!reference.startsWith(COMPONENT_REQUEST_BODIES) || seen.has(reference)) return undefined;
      seen.add(reference);
      body = requestBodies[decodeURIComponent(reference.slice(COMPONENT_REQUEST_BODIES.length))];
    }
    return isObject(body) && isObject(body.content) ? body : undefined;
  };
  const isUpload = (method: string, operation: JsonObject): boolean => {
    const body = requestBody(operation.requestBody);
    const context = `${String(operation.operationId ?? method)} request`;
    if (body === undefined || !isFileUpload(body.content as JsonObject, document, context)) return false;
    assert(body.required === true, `${context}: a multipart/related file upload's request body must be required`);
    return true;
  };
  const methodParameters = (owner: JsonObject, sdkSets: ReadonlySet<string> = CLIENT_HEADERS): JsonValue[] => {
    if (!Array.isArray(owner.parameters)) return [];
    const kept = owner.parameters.filter((value) => !sdkSets.has(headerName(value) ?? ""));
    if (kept.length) owner.parameters = kept;
    else delete owner.parameters;
    return kept;
  };

  for (const item of Object.values(isObject(document.paths) ? document.paths : {})) {
    if (!isObject(item)) continue;
    const operations = Object.entries(item)
      .filter((entry): entry is [string, JsonObject] => HTTP_METHODS.has(entry[0]) && isObject(entry[1]));
    const uploads = new Set(operations.filter(([method, operation]) => isUpload(method, operation)).map(([method]) => method));
    const inherited = Array.isArray(item.parameters) ? item.parameters : [];
    if (uploads.size > 0 && inherited.some((value) => FILE_UPLOAD_HEADERS.has(headerName(value) ?? ""))) {
      for (const [, operation] of operations) {
        const own = Array.isArray(operation.parameters) ? operation.parameters : [];
        const overridden = new Set(own.map(parameterKey));
        const kept = inherited.filter((value) => {
          const key = parameterKey(value);
          return key === undefined || !overridden.has(key);
        });
        operation.parameters = [...kept, ...own];
      }
      delete item.parameters;
    }
    const shared = methodParameters(item);
    for (const [method, operation] of operations) {
      const sdkSets = uploads.has(method) ? new Set([...CLIENT_HEADERS, ...FILE_UPLOAD_HEADERS]) : CLIENT_HEADERS;
      const conditional = [...shared, ...methodParameters(operation, sdkSets)]
        .some((value) => PRECONDITION_HEADERS.has(headerName(value) ?? ""));
      if (!conditional && isObject(operation.responses)) delete operation.responses["304"];
    }
  }
}
