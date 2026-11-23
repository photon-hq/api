import { isObject, type JsonObject, type JsonValue } from "./shared.js";

const HTTP_METHODS = new Set(["get", "put", "post", "delete", "patch", "options", "head", "trace"]);

/**
 * Request headers the client sends from its own configuration. The contract
 * declares `Photon-Version` on each versioned operation; the SDKs take it from
 * the client (the date a release is pinned to, or a date the caller sets on the
 * client or in a request's headers), as SDKs carry an API version in client
 * configuration rather than as a method argument.
 */
const CLIENT_HEADERS = new Set(["photon-version"]);

/** Request headers that make a request conditional (RFC 9110 section 13.1). */
const PRECONDITION_HEADERS = new Set(["if-none-match", "if-modified-since"]);

const COMPONENT_PARAMETERS = "#/components/parameters/";

/**
 * Shapes what each generated method takes and returns, in the SDK input only:
 * the contract keeps every parameter and response.
 *
 * - A client header is not a method parameter.
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
  const headerName = (value: JsonValue): string | undefined => {
    const seen = new Set<string>();
    let parameter: JsonValue | undefined = value;
    while (isObject(parameter) && typeof parameter.$ref === "string") {
      const reference: string = parameter.$ref;
      if (!reference.startsWith(COMPONENT_PARAMETERS) || seen.has(reference)) return undefined;
      seen.add(reference);
      parameter = parameters[decodeURIComponent(reference.slice(COMPONENT_PARAMETERS.length))];
    }
    return isObject(parameter) && parameter.in === "header" && typeof parameter.name === "string"
      ? parameter.name.toLowerCase()
      : undefined;
  };
  const methodParameters = (owner: JsonObject): JsonValue[] => {
    if (!Array.isArray(owner.parameters)) return [];
    const kept = owner.parameters.filter((value) => !CLIENT_HEADERS.has(headerName(value) ?? ""));
    if (kept.length) owner.parameters = kept;
    else delete owner.parameters;
    return kept;
  };

  for (const item of Object.values(isObject(document.paths) ? document.paths : {})) {
    if (!isObject(item)) continue;
    const shared = methodParameters(item);
    for (const [method, operation] of Object.entries(item)) {
      if (!HTTP_METHODS.has(method) || !isObject(operation)) continue;
      const conditional = [...shared, ...methodParameters(operation)]
        .some((value) => PRECONDITION_HEADERS.has(headerName(value) ?? ""));
      if (!conditional && isObject(operation.responses)) delete operation.responses["304"];
    }
  }
}
