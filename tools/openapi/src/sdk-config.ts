import { resolve, relative, isAbsolute } from "node:path";
import {
  assert,
  INTERNAL_CONTRACT_PATH,
  isObject,
  PUBLIC_CONTRACT_PATH,
  readJson,
  repositoryRoot,
  type JsonObject,
  type JsonValue,
} from "./shared.js";

export interface SdkConfig {
  environment: "staging" | "production";
  schemaPath: string;
  defaultBaseUrl: string;
  authEndpoints: Record<string, {
    openIdConnectUrl?: string;
    flows?: Record<string, Record<string, string>>;
  }>;
  /**
   * Production only: releases the public clients from a production contract
   * whose schema names do not yet pass the naming gate. See NamingWaiver.
   */
  namingWaiver?: NamingWaiver;
}

/**
 * An explicit, recorded exception to the public lane's naming rule, for the
 * preview releases made before the production contract is named. While it is
 * present, SDK preparation derives type names for unnamed operation schemas
 * the way the staging lane does (`<Op>Request<Media>`, `<Op>Response<Status><Media>`)
 * and the naming gate reports its violations without failing. Nothing else
 * changes: gate A, gate B, the public content and target checks, the smoke
 * test and the reproducibility checks stay enforced. Remove it once the
 * production contract passes the naming gate; the derived names then change
 * to the contract's (a breaking release).
 */
export interface NamingWaiver {
  reason: string;
  approvedBy: string;
  /** YYYY-MM-DD */
  approvedOn: string;
  /** The release that is expected to lift the waiver, for example "0.2.0". */
  until: string;
}

const NAMING_WAIVER_FIELDS = ["reason", "approvedBy", "approvedOn", "until"];

function validateNamingWaiver(value: unknown): void {
  assert(isObject(value), "namingWaiver must be an object");
  assert(
    Object.keys(value).length === NAMING_WAIVER_FIELDS.length &&
      NAMING_WAIVER_FIELDS.every((field) => typeof value[field] === "string" && (value[field] as string).trim().length > 0),
    `namingWaiver needs exactly these non-empty fields: ${NAMING_WAIVER_FIELDS.join(", ")}`,
  );
  assert(/^\d{4}-\d{2}-\d{2}$/.test(value.approvedOn as string), "namingWaiver.approvedOn must be a YYYY-MM-DD date");
  assert(/^\d+\.\d+\.\d+$/.test(value.until as string), "namingWaiver.until must be a version such as 0.2.0");
}

const flowFields = {
  implicit: ["authorizationUrl"],
  password: ["tokenUrl"],
  clientCredentials: ["tokenUrl"],
  authorizationCode: ["authorizationUrl", "tokenUrl"],
} as const;
const endpointKey = (scheme: string, flow: string | null, field: string): string =>
  JSON.stringify([scheme, flow, field]);

function configuredAuthEndpoints(config: SdkConfig): Map<string, string> {
  const entries = new Map<string, string>();
  for (const [name, scheme] of Object.entries(config.authEndpoints)) {
    if (scheme.openIdConnectUrl !== undefined) entries.set(endpointKey(name, null, "openIdConnectUrl"), scheme.openIdConnectUrl);
    for (const [flow, fields] of Object.entries(scheme.flows ?? {})) {
      for (const [field, url] of Object.entries(fields)) entries.set(endpointKey(name, flow, field), url);
    }
  }
  return entries;
}

export function authOrigins(config: SdkConfig): string[] {
  return [...new Set([...configuredAuthEndpoints(config).values()].map((url) => new URL(url).origin))].sort();
}

export function httpsUrl(value: unknown, field: string): URL {
  assert(typeof value === "string" && value.length > 0, `${field} is required`);
  const url = new URL(value);
  assert(
    url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash &&
      !url.search,
    `${field} must be an HTTPS URL without credentials, query or fragment`,
  );
  return url;
}

export function validateSdkConfig(
  value: unknown,
  expectedEnvironment?: string,
): SdkConfig {
  assert(isObject(value), "SDK config must be an object");
  const fields = [
    "environment",
    "schemaPath",
    "defaultBaseUrl",
    "authEndpoints",
    "namingWaiver",
  ];
  assert(
    Object.keys(value).every((key) => fields.includes(key)),
    "Unknown SDK config field; configuration must not contain credentials",
  );
  assert(
    value.environment === "staging" || value.environment === "production",
    "SDK environment must be staging or production",
  );
  assert(
    expectedEnvironment === undefined || value.environment === expectedEnvironment,
    `Expected ${expectedEnvironment} SDK config`,
  );
  if (Object.hasOwn(value, "namingWaiver")) {
    assert(value.environment === "production", "namingWaiver applies only to the production (public) configuration");
    validateNamingWaiver(value.namingWaiver);
  }
  const base = httpsUrl(value.defaultBaseUrl, "defaultBaseUrl");
  assert(base.pathname === "/", "defaultBaseUrl must be an origin");
  assert(
    value.defaultBaseUrl === base.origin,
    "defaultBaseUrl must be a canonical origin without a trailing slash",
  );
  assert(isObject(value.authEndpoints), "authEndpoints must explicitly configure OAuth/OIDC endpoints (or be empty when unused)");
  for (const [name, scheme] of Object.entries(value.authEndpoints)) {
    assert(isObject(scheme), `Invalid authEndpoints scheme: ${name}`);
    assert(Object.keys(scheme).every((field) => ["openIdConnectUrl", "flows"].includes(field)), `Unknown authentication config field in ${name}`);
    assert(Object.hasOwn(scheme, "openIdConnectUrl") !== Object.hasOwn(scheme, "flows"), `Configure either OIDC or OAuth flows for ${name}`);
    if (Object.hasOwn(scheme, "openIdConnectUrl")) httpsUrl(scheme.openIdConnectUrl, `authEndpoints.${name}.openIdConnectUrl`);
    else {
      assert(isObject(scheme.flows) && Object.keys(scheme.flows).length > 0, `OAuth flows are required for ${name}`);
      for (const [flow, fields] of Object.entries(scheme.flows)) {
        assert(Object.hasOwn(flowFields, flow), `Unsupported OAuth flow: ${flow}`);
        assert(isObject(fields), `Invalid OAuth endpoint config: ${name}.${flow}`);
        const required = flowFields[flow as keyof typeof flowFields];
        assert(Object.keys(fields).every((field) => [...required, "refreshUrl"].includes(field)), `Unknown OAuth endpoint field in ${name}.${flow}`);
        for (const field of required) httpsUrl(fields[field], `authEndpoints.${name}.${flow}.${field}`);
        if (Object.hasOwn(fields, "refreshUrl")) httpsUrl(fields.refreshUrl, `authEndpoints.${name}.${flow}.refreshUrl`);
      }
    }
  }
  // The internal repository's checked-in contract; the public repository
  // keeps its (production) contract at openapi/openapi.json.
  assert(
    value.schemaPath === INTERNAL_CONTRACT_PATH ||
      (value.environment === "production" && value.schemaPath === PUBLIC_CONTRACT_PATH),
    `schemaPath must be ${INTERNAL_CONTRACT_PATH} (or ${PUBLIC_CONTRACT_PATH} for the public repository's production contract), the checked-in contract used by generation and CI`,
  );
  if (value.environment === "production") {
    for (const url of [
      base,
      ...authOrigins(value as unknown as SdkConfig).map((origin) => new URL(origin)),
    ]) {
      assert(
        !/(^|[.-])staging([.-]|$)/i.test(url.hostname),
        "Production configuration cannot use a staging host",
      );
    }
  }
  return value as unknown as SdkConfig;
}

export async function loadSdkConfig(
  expectedEnvironment?: string,
  configPath = "config/sdk.json",
): Promise<SdkConfig> {
  return validateSdkConfig(
    await readJson(resolve(repositoryRoot, configPath)),
    expectedEnvironment,
  );
}

export function schemaPath(config: SdkConfig): string {
  const path = resolve(repositoryRoot, config.schemaPath);
  const pathFromRoot = relative(repositoryRoot, path);
  assert(
    !pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot),
    "Schema must remain inside the source tree",
  );
  return path;
}

/** Visit only OpenAPI routing/auth metadata, never body properties or examples. */
function visitSchemaTargets(
  source: JsonObject,
  checkServer: (server: JsonValue) => void,
  checkAuthUrl: (parent: JsonObject, field: string, key: string) => void,
): void {
  assert(isObject(source), "Contract must be a JSON object");
  assert(
    Array.isArray(source.servers) && source.servers.length > 0,
    "Contract must declare an API server",
  );
  const checkServers = (value: JsonValue): void => {
    if (!isObject(value)) return;
    if (value.servers !== undefined) {
      assert(
        Array.isArray(value.servers) && value.servers.length > 0,
        "Contract servers must be a nonempty array; implicit server defaults are not allowed",
      );
      for (const server of value.servers) checkServer(server);
    }
  };
  const members = (value: JsonValue | undefined): JsonValue[] =>
    isObject(value) ? Object.values(value) : [];
  const checkLink = (value: JsonValue): void => {
    if (isObject(value) && value.server !== undefined) checkServer(value.server);
  };
  const checkResponse = (value: JsonValue): void => {
    if (isObject(value)) for (const link of members(value.links)) checkLink(link);
  };
  const checkCallback = (value: JsonValue): void => {
    if (!isObject(value)) return;
    for (const [key, pathItem] of Object.entries(value)) {
      if (key !== "$ref" && !key.startsWith("x-")) checkPathItem(pathItem);
    }
  };
  const checkPathItem = (value: JsonValue): void => {
    if (!isObject(value)) return;
    checkServers(value);
    for (const method of ["get", "put", "post", "delete", "options", "head", "patch", "trace"]) {
      const operation = value[method];
      if (!isObject(operation)) continue;
      checkServers(operation);
      for (const callback of members(operation.callbacks)) checkCallback(callback);
      for (const response of members(operation.responses)) checkResponse(response);
    }
  };
  // Traverse OpenAPI routing locations, not arbitrary body/header/example fields
  // that happen to be named "servers".
  checkServers(source);
  for (const pathItem of [...members(source.paths), ...members(source.webhooks)]) {
    checkPathItem(pathItem);
  }
  if (isObject(source.components)) {
    for (const value of members(source.components.pathItems)) checkPathItem(value);
    for (const value of members(source.components.callbacks)) checkCallback(value);
    for (const value of members(source.components.responses)) checkResponse(value);
    for (const value of members(source.components.links)) checkLink(value);
  }
  const schemes = isObject(source.components)
    ? source.components.securitySchemes
    : undefined;
  if (!isObject(schemes)) return;
  for (const [name, scheme] of Object.entries(schemes)) {
    assert(isObject(scheme), "Invalid security scheme");
    assert(!scheme.$ref, "Security schemes must be resolved before target validation");
    if (scheme.type === "openIdConnect")
      checkAuthUrl(scheme, "openIdConnectUrl", endpointKey(name, null, "openIdConnectUrl"));
    if (scheme.type !== "oauth2") continue;
    assert(isObject(scheme.flows) && Object.keys(scheme.flows).length > 0, "OAuth flows are required");
    for (const [flowName, flow] of Object.entries(scheme.flows)) {
      assert(
        Object.hasOwn(flowFields, flowName),
        "Unsupported OAuth flow requires explicit review",
      );
      assert(isObject(flow), "Invalid OAuth flow");
      const required = flowFields[flowName as keyof typeof flowFields];
      for (const field of ["authorizationUrl", "tokenUrl", "refreshUrl"]) {
        const mandatory = (required as readonly string[]).includes(field);
        assert(field === "refreshUrl" || mandatory || !Object.hasOwn(flow, field), `Unexpected OAuth endpoint in ${flowName}: ${field}`);
        if (mandatory || Object.hasOwn(flow, field)) checkAuthUrl(flow, field, endpointKey(name, flowName, field));
      }
    }
  }
}

/** Offline regeneration and release checking validate without changing inputs. */
export function validateSchemaTarget(source: JsonObject, config: SdkConfig): void {
  const endpoints = configuredAuthEndpoints(config);
  const seen = new Set<string>();
  visitSchemaTargets(source, (server) => {
    assert(isObject(server) && server.url === config.defaultBaseUrl && server.variables === undefined,
      "Contract server does not match defaultBaseUrl; bind the selected target during development assembly");
  }, (parent, field, key) => {
    httpsUrl(parent[field], field);
    assert(endpoints.get(key) === parent[field], `Contract authentication endpoint differs from authEndpoints: ${key}`);
    seen.add(key);
  });
  assert(seen.size === endpoints.size, "Configured authentication endpoints must match the contract's OAuth/OIDC schemes and flows");
}

/** Explicit development assembly only; release preparation never calls this. */
export function bindSchemaTarget(source: JsonObject, sourceConfig: SdkConfig, targetConfig: SdkConfig): JsonObject {
  validateSdkConfig(sourceConfig);
  validateSdkConfig(targetConfig);
  validateSchemaTarget(source, sourceConfig);
  const before = configuredAuthEndpoints(sourceConfig);
  const after = configuredAuthEndpoints(targetConfig);
  assert(before.size === after.size && [...before.keys()].every((key) => after.has(key)),
    "Target must preserve the source authentication schemes, flows and endpoint fields");
  const output = structuredClone(source);
  visitSchemaTargets(output, (server) => {
    assert(isObject(server), "Invalid API server");
    server.url = targetConfig.defaultBaseUrl;
  }, (parent, field, key) => {
    const url = after.get(key);
    assert(url !== undefined, `Target authentication endpoint is required: ${key}`);
    parent[field] = url;
  });
  validateSchemaTarget(output, targetConfig);
  return output;
}
