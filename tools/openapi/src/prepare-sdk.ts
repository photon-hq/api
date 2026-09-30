import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isBinaryMediaType, isJsonMediaType, jsonSdkDocument } from "./media-types.js";
import { checkContractNaming, formatViolation } from "./naming.js";
import { loadSdkConfig, schemaPath, validateSchemaTarget, type SdkConfig } from "./sdk-config.js";
import {
  assert,
  isObject,
  pascalCase,
  readJson,
  repositoryRoot,
  sha256,
  stableJson,
  writeAtomic,
  type JsonObject,
  type JsonValue,
} from "./shared.js";

const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "patch",
  "options",
  "head",
  "trace",
]);

const LEGACY_RPC_METHOD_ALIASES: Record<string, string> = {
  deleteAccount: "delete",
  getAccount: "get",
  updateAccount: "update",
  getAccountPaymentMethod: "getPaymentMethod",
  createAccountPaymentMethodCheckout: "createPaymentMethodCheckout",
  getAccountOnboarding: "get",
  updateAccountOnboarding: "update",
  completeAccountOnboarding: "complete",
  confirmAccountPhoneVerification: "confirmPhoneVerification",
  startAccountPhoneVerification: "startPhoneVerification",
  resetAccountProfilePicture: "resetProfilePicture",
  commitAccountProfilePicture: "commitProfilePicture",
  createAccountProfilePictureUpload: "createProfilePictureUpload",
  deviceAuthorize: "authorize",
  deviceToken: "token",
  getStatus: "status",
  listProjects: "list",
  createProject: "create",
  countProjects: "count",
  acceptProjectInvitation: "acceptInvitation",
  previewProjectInvitation: "previewInvitation",
  getProjectPlatforms: "list",
  getProjectImessagePlatform: "getImessage",
  listSharedLineAssignments: "list",
  createSharedLineAssignment: "create",
  releaseSharedLineAssignment: "release",
  getSharedLineAssignment: "get",
  deleteProject: "delete",
  getProject: "get",
  updateProject: "update",
  getAgentProfile: "get",
  updateAgentProfile: "update",
  resetAgentProfileAvatar: "resetAvatar",
  commitAgentProfileAvatar: "commitAvatar",
  createAgentProfileAvatarUpload: "createAvatarUpload",
  getBillingOverview: "getOverview",
  cancelSubscription: "cancelSubscription",
  listInvoices: "listInvoices",
  getBillingOperation: "getOperation",
  purchasePlan: "purchasePlan",
  resumeSubscription: "resumeSubscription",
  listProjectInvitations: "listInvitations",
  createProjectInvitation: "createInvitation",
  revokeProjectInvitation: "revokeInvitation",
  listProjectMembers: "list",
  removeProjectMember: "remove",
  updateProjectMemberRole: "updateRole",
};

/**
 * `internal`: the staging SDKs; inline operation media schemas are hoisted
 * under `<Op>Request<Media>` / `<Op>Response<Status><Media>` names.
 * `public`: the production contract; nothing is hoisted. Every type
 * name must come from the contract, so preparation fails when the contract
 * naming check (naming.ts) finds an inline nominal schema or a
 * non-conforming component name.
 */
export type SdkLane = "internal" | "public";

/** The production SDK configuration is the public lane. */
export function laneFor(config: Pick<SdkConfig, "environment">): SdkLane {
  return config.environment === "production" ? "public" : "internal";
}

export interface PrepareOptions {
  lane?: SdkLane;
  /**
   * Public lane under a naming waiver (SdkConfig.namingWaiver): derive names
   * for unnamed operation schemas as the internal lane does instead of failing.
   */
  namingWaived?: boolean;
}

/** Preparation options for an SDK configuration: its lane and whether it records a naming waiver. */
export function prepareOptionsFor(config: Pick<SdkConfig, "environment" | "namingWaiver">): PrepareOptions {
  return { lane: laneFor(config), namingWaived: config.namingWaiver !== undefined };
}

/** Every type name comes from the contract: the public lane without a naming waiver. */
export function namesFromContract(options: PrepareOptions): boolean {
  return options.lane === "public" && options.namingWaived !== true;
}

/** Public lane: fail instead of inventing names. */
export function assertPublicNames(source: JsonObject, shown = 25): void {
  const { violations } = checkContractNaming(source);
  if (!violations.length) return;
  const lines = violations.slice(0, shown).map((violation) => `  ${formatViolation(violation)}`);
  if (violations.length > shown) lines.push(`  ... ${violations.length - shown} more`);
  throw new Error(
    `Public SDK preparation does not hoist schemas; every type name must come from the contract. ` +
      `${violations.length} naming violations (run npm run check:naming for the full report):\n${lines.join("\n")}`,
  );
}

/**
 * Public lane: an error status with several JSON representations would need
 * an SDK union type the contract does not name (jsonSdkDocument invents
 * `<Op>Response<Status>Body` in the internal lane). Fail with the operation
 * and status instead of an unexplained naming violation.
 */
export function assertPublicErrorRepresentations(source: JsonObject): void {
  const found: string[] = [];
  for (const [path, item] of Object.entries(isObject(source.paths) ? source.paths : {})) {
    if (!isObject(item)) continue;
    for (const [method, operation] of Object.entries(item)) {
      if (!HTTP_METHODS.has(method) || !isObject(operation) || !isObject(operation.responses)) continue;
      for (const [status, response] of Object.entries(operation.responses)) {
        if (/^2/.test(status) || !isObject(response) || !isObject(response.content)) continue;
        const json = Object.keys(response.content).filter(isJsonMediaType);
        if (json.length > 1) found.push(`${String(operation.operationId ?? `${method.toUpperCase()} ${path}`)} ${status}: ${json.join(", ")}`);
      }
    }
  }
  assert(found.length === 0,
    `The public lane generates one type per error status; these declare several JSON representations (name one schema for both, or keep one media type):\n  ${found.join("\n  ")}`);
}

interface ManifestParameter {
  name: string;
  wireName: string;
  location: string;
  required: boolean;
  schema?: JsonValue;
}

interface ManifestOperation {
  operationId: string;
  summary?: string;
  description?: string;
  rpcMethod: string;
  namespace: string[];
  httpMethod: string;
  path: string;
  safe: boolean;
  idempotencyKeyRequired: boolean;
  parameters: ManifestParameter[];
  requestBody?: {
    required: boolean;
    content: Record<string, string | JsonValue>;
  };
  responses: Record<string, Record<string, string | JsonValue>>;
}

interface RpcManifest {
  sourceSha256: string;
  operationCount: number;
  operations: ManifestOperation[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function resolveLocalReference(root: JsonValue, reference: string): JsonValue | undefined {
  if (reference === "#") {
    return root;
  }
  if (!reference.startsWith("#/")) {
    return undefined;
  }
  const pointer = decodeURIComponent(reference.slice(2));
  const segments = pointer
    .split("/")
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
  let current: JsonValue | undefined = root;
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      current = Number.isInteger(index) ? current[index] : undefined;
    } else if (isObject(current)) {
      current = current[segment];
    } else {
      current = undefined;
    }
    if (current === undefined) {
      return undefined;
    }
  }
  return current;
}

function assertInternalReferences(
  value: JsonValue,
  root: JsonValue,
  location = "$",
): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) =>
      assertInternalReferences(child, root, `${location}[${index}]`),
    );
    return;
  }
  if (!isObject(value)) {
    return;
  }
  if (value.$ref !== undefined) {
    assert(typeof value.$ref === "string", `${location}.$ref must be a string`);
    assert(
      value.$ref === "#" || value.$ref.startsWith("#/"),
      `External reference ${value.$ref} at ${location} is not allowed`,
    );
    assert(
      resolveLocalReference(root, value.$ref) !== undefined,
      `Unresolved reference ${value.$ref} at ${location}`,
    );
  }
  for (const [key, child] of Object.entries(value)) {
    assertInternalReferences(child, root, `${location}.${key}`);
  }
}

function contentComponentSuffix(mediaType: string): string {
  return pascalCase(
    mediaType
      .replace("+", " Plus ")
      .replace("/", " ")
      .replace("x-www-form-urlencoded", "form"),
  );
}

function statusSuffix(status: string): string {
  return status === "default" ? "Default" : status.replaceAll(/[^0-9A-Za-z]/g, "");
}

function namespaceFor(operationId: string, path: string): string[] {
  if (path.startsWith("/v1/account/billing/")) {
    return ["account", "billing"];
  }
  if (path.startsWith("/v1/account/onboarding")) {
    return ["account", "onboarding"];
  }
  if (path.startsWith("/v1/account")) {
    return ["account"];
  }
  if (path.startsWith("/v1/auth/device/")) {
    return ["auth", "device"];
  }
  if (operationId === "getStatus") {
    return ["system"];
  }
  if (path.startsWith("/v1/auth/")) {
    return ["auth"];
  }
  if (path === "/v1/organizations" || path.startsWith("/v1/organizations/")) {
    // Classify the owner before project subresources: organization billing can
    // itself contain /projects/{projectId}.
    const resource = path.split("/")[4];
    if (resource === "projects" || resource === "billing") {
      return ["organizations", resource];
    }
    return ["organizations"];
  }
  if (path.includes("/platforms/imessage/assignments")) {
    return ["projects", "platforms", "imessage", "assignments"];
  }
  if (path.includes("/platforms/")) {
    return ["projects", "platforms"];
  }
  if (path.endsWith("/platforms")) {
    return ["projects", "platforms"];
  }
  if (path.includes("/agent-profile")) {
    return ["projects", "agentProfile"];
  }
  if (path.includes("/billing")) {
    return ["projects", "billing"];
  }
  if (path.includes("/members") || path.includes("/invitations")) {
    return ["projects", "members"];
  }
  if (path.startsWith("/v1/projects")) {
    return ["projects"];
  }
  return ["system"];
}

function parametersFor(
  pathItem: JsonObject,
  operation: JsonObject,
): ManifestParameter[] {
  const parameters = [
    ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
    ...(Array.isArray(operation.parameters) ? operation.parameters : []),
  ];
  return parameters.flatMap((parameter): ManifestParameter[] => {
    if (!isObject(parameter) || typeof parameter.$ref === "string") {
      return [];
    }
    if (typeof parameter.name !== "string" || typeof parameter.in !== "string") {
      return [];
    }
    const result: ManifestParameter = {
      name:
        parameter.name === "Idempotency-Key"
          ? "idempotencyKey"
          : parameter.name,
      wireName: parameter.name,
      location: parameter.in,
      required: parameter.required === true,
    };
    if (parameter.schema !== undefined) {
      result.schema = parameter.schema;
    }
    return [result];
  });
}

/**
 * A media schema that is exactly a reference to a contract component. Such a
 * schema already has a contract name, so the SDK keeps the reference instead
 * of inventing an operation-specific copy. A reference with sibling keywords is
 * a different schema and is hoisted like any other inline schema.
 */
function componentReference(schema: JsonValue | undefined): string | undefined {
  if (
    isObject(schema) &&
    Object.keys(schema).length === 1 &&
    typeof schema.$ref === "string" &&
    schema.$ref.startsWith("#/components/schemas/")
  ) {
    return schema.$ref;
  }
  return undefined;
}

function hoistMediaSchema(
  name: string,
  media: JsonObject,
  schema: JsonValue,
  components: JsonObject,
): void {
  // Keep the contract's own name: one type per component in every generator.
  if (componentReference(schema) !== undefined) return;
  // A derived name must not replace a contract component other operations reference.
  assert(!Object.hasOwn(components, name), `Derived schema name ${name} is already a contract component`);
  components[name] = clone(schema);
  media.schema = { $ref: `#/components/schemas/${name}` };
}

export function hoistOperationSchemas(
  operationId: string,
  operation: JsonObject,
  components: JsonObject,
): void {
  if (isObject(operation.requestBody) && isObject(operation.requestBody.content)) {
    for (const [mediaType, media] of Object.entries(operation.requestBody.content)) {
      if (!isObject(media) || !isObject(media.schema)) {
        continue;
      }
      const name = `${pascalCase(operationId)}Request${contentComponentSuffix(mediaType)}`;
      hoistMediaSchema(name, media, media.schema, components);
    }
  }
  if (!isObject(operation.responses)) {
    return;
  }
  for (const [status, response] of Object.entries(operation.responses)) {
    if (!isObject(response) || !isObject(response.content)) {
      continue;
    }
    for (const [mediaType, media] of Object.entries(response.content)) {
      const binary = Object.keys(response.content).length === 1 && isBinaryMediaType(mediaType);
      if (!isObject(media) || (!isObject(media.schema) && !(binary && (media.schema === undefined || media.schema === true)))) {
        continue;
      }
      // Keep binary SDK model names stable when a source switches to */*.
      // The actual media range and unconstrained schema remain in the contract.
      const suffix = contentComponentSuffix(binary ? "application/octet-stream" : mediaType);
      const name = `${pascalCase(operationId)}Response${statusSuffix(status)}${suffix}`;
      hoistMediaSchema(name, media, isObject(media.schema) ? media.schema : {}, components);
    }
  }
}

const COMPONENT_SCHEMAS = "#/components/schemas/";

/** Component schema names that `value` refers to with `$ref`, anywhere inside it. */
function referencedSchemas(value: JsonValue | undefined, found = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const child of value) referencedSchemas(child, found);
  } else if (isObject(value)) {
    if (typeof value.$ref === "string" && value.$ref.startsWith(COMPONENT_SCHEMAS)) {
      found.add(decodeURIComponent(value.$ref.slice(COMPONENT_SCHEMAS.length)));
    }
    for (const child of Object.values(value)) referencedSchemas(child, found);
  }
  return found;
}

/** The component schemas reachable from `roots`, following `$ref`s. */
function reachableSchemas(components: JsonObject, roots: Set<string>): Set<string> {
  const seen = new Set<string>();
  const queue = [...roots];
  while (queue.length) {
    const name = queue.pop()!;
    if (seen.has(name)) continue;
    seen.add(name);
    queue.push(...referencedSchemas(components[name]));
  }
  return seen;
}

/** Replaces `$ref`s to `from` inside `value` with `$ref`s to `to`. */
function replaceReference(value: JsonValue, from: string, to: string): void {
  if (Array.isArray(value)) {
    for (const child of value) replaceReference(child, from, to);
  } else if (isObject(value)) {
    if (value.$ref === `${COMPONENT_SCHEMAS}${from}`) value.$ref = `${COMPONENT_SCHEMAS}${to}`;
    for (const child of Object.values(value)) replaceReference(child, from, to);
  }
}

/** A copy of `schema` that allows members it does not list (no `additionalProperties: false`). */
function openObject(schema: JsonValue): JsonValue {
  if (!isObject(schema) || schema.additionalProperties !== false) return schema;
  const { additionalProperties: _closed, ...open } = schema;
  return open;
}

/**
 * Unknown platforms, an SDK policy like open enums: the contract lists a
 * platform union's known members (`User`: `SmsUser`, ...) and names, in
 * `x-photon-extension` (`{ discriminator: "platform", fallback }`), the
 * definition a platform added later takes (`#/$defs/UnknownUser`). SDK
 * preparation appends that component as the union's last member, so a client
 * generated today reads a newer platform's resource instead of failing, and a
 * known platform still reads as its own member first. The fallback, and each
 * member it lists (`UnknownMessage`'s status members), is made open: the new
 * platform sends fields of its own.
 *
 * Only responses get the fallback. A union that requests also use keeps the
 * contract's known members for them under `<Name>Input`
 * (`UserSnapshotInput`, for a participants update): the request components
 * that refer to it are request-only in the contract, so the split changes no
 * response type. A component used by both that refers to such a union fails
 * preparation instead of silently loosening or narrowing either side.
 *
 * The fallback component carries the name the extension gives
 * (`UnknownUser`). The public contract always publishes it, so it is required
 * there; the staging contract publishes only prefixed copies
 * (`output__..._UnknownUser`), so its unions stay as the contract has them.
 * Content unions (`discriminator: "type"`) are not changed. Returns the
 * `<Name>Input` components added.
 */
export function addUnknownPlatformMembers(document: JsonObject, required = false): string[] {
  const components = isObject(document.components) && isObject(document.components.schemas)
    ? document.components.schemas : undefined;
  if (!components || !isObject(document.paths)) return [];
  const unions: { name: string; key: "anyOf" | "oneOf"; fallback: string }[] = [];
  for (const [name, schema] of Object.entries(components)) {
    const extension = isObject(schema) ? schema["x-photon-extension"] : undefined;
    if (!isObject(schema) || !isObject(extension) || extension.discriminator !== "platform") continue;
    assert(typeof extension.fallback === "string", `${name}: x-photon-extension names no fallback`);
    const key = Array.isArray(schema.anyOf) ? "anyOf" : Array.isArray(schema.oneOf) ? "oneOf" : undefined;
    assert(key !== undefined, `${name}: a platform union must be an anyOf or oneOf`);
    const fallback = extension.fallback.slice(extension.fallback.lastIndexOf("/") + 1);
    if (!isObject(components[fallback])) {
      assert(!required, `${name}: the fallback component ${fallback} (${extension.fallback}) is missing`);
      continue;
    }
    unions.push({ name, key, fallback });
  }
  if (!unions.length) return [];

  // Request bodies are the request roots; every other schema use in an operation
  // (responses, response headers, parameters) and shared responses are response roots.
  const requestRoots = new Set<string>();
  const responseRoots = new Set<string>();
  const requestBodies: JsonValue[] = [];
  for (const item of Object.values(document.paths)) {
    if (!isObject(item)) continue;
    for (const [method, operation] of Object.entries(item)) {
      if (!HTTP_METHODS.has(method) || !isObject(operation)) {
        referencedSchemas(operation, responseRoots);
        continue;
      }
      for (const [key, value] of Object.entries(operation)) {
        if (key === "requestBody") {
          requestBodies.push(value);
          referencedSchemas(value, requestRoots);
        } else {
          referencedSchemas(value, responseRoots);
        }
      }
    }
  }
  for (const [kind, value] of Object.entries(document.components as JsonObject)) {
    if (kind === "requestBodies") {
      requestBodies.push(value);
      referencedSchemas(value, requestRoots);
    } else if (kind !== "schemas") {
      referencedSchemas(value, responseRoots);
    }
  }
  const requests = reachableSchemas(components, requestRoots);
  // A response also reaches what its unions' fallbacks refer to.
  let responses = reachableSchemas(components, responseRoots);
  for (let size = -1; size !== responses.size;) {
    size = responses.size;
    for (const { name, fallback } of unions) if (responses.has(name)) responseRoots.add(fallback);
    responses = reachableSchemas(components, responseRoots);
  }

  const inputs: string[] = [];
  for (const { name, key, fallback } of unions) {
    if (!responses.has(name)) continue;
    const union = components[name] as JsonObject;
    if (requests.has(name)) {
      const input = `${name}Input`;
      assert(components[input] === undefined, `${name}: SDK request component ${input} already exists`);
      components[input] = clone(union);
      inputs.push(input);
      for (const body of requestBodies) replaceReference(body, name, input);
      for (const user of requests) {
        if (!referencedSchemas(components[user]).has(name) || user === input) continue;
        assert(!responses.has(user),
          `${user} is used by requests and responses and refers to the platform union ${name}; name a request schema for it in the contract`);
        replaceReference(components[user]!, name, input);
      }
    }
    const members = union[key] as JsonValue[];
    const reference = `${COMPONENT_SCHEMAS}${fallback}`;
    if (!members.some((member) => isObject(member) && member.$ref === reference)) members.push({ $ref: reference });
    const target = components[fallback] as JsonObject;
    components[fallback] = openObject(target);
    for (const unionKey of ["anyOf", "oneOf"] as const) {
      const fallbackMembers = target[unionKey];
      if (!Array.isArray(fallbackMembers)) continue;
      for (const [index, member] of fallbackMembers.entries()) {
        const memberName = componentReference(member)?.slice(COMPONENT_SCHEMAS.length);
        if (memberName === undefined) fallbackMembers[index] = openObject(member);
        else components[memberName] = openObject(components[memberName]!);
      }
    }
  }
  return inputs.sort();
}

function referenceOrValue(schema: JsonValue | undefined): string | JsonValue {
  if (isObject(schema) && typeof schema.$ref === "string") {
    return schema.$ref;
  }
  return schema ?? {};
}

export function manifestOperation(
  path: string,
  method: string,
  pathItem: JsonObject,
  operation: JsonObject,
): ManifestOperation {
  assert(
    typeof operation.operationId === "string",
    `${method.toUpperCase()} ${path} has no operationId`,
  );
  const operationId = operation.operationId;
  const rpcMethod = LEGACY_RPC_METHOD_ALIASES[operationId] ?? operationId;
  const parameters = parametersFor(pathItem, operation);
  const result: ManifestOperation = {
    operationId,
    rpcMethod,
    namespace: namespaceFor(operationId, path),
    httpMethod: method.toUpperCase(),
    path,
    safe: ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase()),
    idempotencyKeyRequired: parameters.some(
      (parameter) =>
        parameter.location === "header" &&
        parameter.wireName.toLowerCase() === "idempotency-key" &&
        parameter.required,
    ),
    parameters,
    responses: {},
  };

  for (const field of ["summary", "description"] as const) {
    if (typeof operation[field] === "string" && operation[field].trim()) {
      result[field] = operation[field];
    }
  }

  if (isObject(operation.requestBody) && isObject(operation.requestBody.content)) {
    const content: Record<string, string | JsonValue> = {};
    for (const [mediaType, media] of Object.entries(operation.requestBody.content)) {
      if (isObject(media)) {
        content[mediaType] = referenceOrValue(media.schema);
      }
    }
    result.requestBody = {
      required: operation.requestBody.required === true,
      content,
    };
  }
  if (isObject(operation.responses)) {
    for (const [status, response] of Object.entries(operation.responses)) {
      const content: Record<string, string | JsonValue> = {};
      if (isObject(response) && isObject(response.content)) {
        for (const [mediaType, media] of Object.entries(response.content)) {
          if (isObject(media)) {
            content[mediaType] = referenceOrValue(media.schema);
          }
        }
      }
      result.responses[status] = content;
    }
  }
  return result;
}

/** Prepare generator input and the full-media RPC manifest from the saved source. */
export function prepareSdk(
  source: JsonObject,
  options: PrepareOptions = {},
): { sdk: JsonObject; manifest: RpcManifest } {
  assert(
    typeof source.openapi === "string" && source.openapi.startsWith("3.1."),
    "Source must be OpenAPI 3.1",
  );
  assertInternalReferences(source, source);
  const publicLane = options.lane === "public";
  // Under a naming waiver the public lane derives names like the internal lane.
  const contractNames = namesFromContract(options);
  if (contractNames) {
    assertPublicNames(source);
    assertPublicErrorRepresentations(source);
  }
  const hoisted = clone(source);

  if (!isObject(hoisted.components)) {
    hoisted.components = {};
  }
  if (!isObject(hoisted.components.schemas)) {
    hoisted.components.schemas = {};
  }
  const components = hoisted.components.schemas;
  assert(isObject(components), "components.schemas must be an object");
  assert(isObject(hoisted.paths), "paths must be an object");

  const seen = new Set<string>();
  const operations: ManifestOperation[] = [];
  for (const path of Object.keys(hoisted.paths).sort()) {
    const pathItem = hoisted.paths[path];
    if (!isObject(pathItem)) {
      continue;
    }
    for (const method of Object.keys(pathItem).sort()) {
      if (!HTTP_METHODS.has(method)) {
        continue;
      }
      const operation = pathItem[method];
      assert(isObject(operation), `${method.toUpperCase()} ${path} is invalid`);
      assert(
        typeof operation.operationId === "string",
        `${method.toUpperCase()} ${path} is missing operationId`,
      );
      assert(
        !seen.has(operation.operationId),
        `Duplicate operationId ${operation.operationId}`,
      );
      seen.add(operation.operationId);
      if (!contractNames) {
        hoistOperationSchemas(operation.operationId, operation, components);
      }
      operations.push(manifestOperation(path, method, pathItem, operation));
    }
    const remainingMethods = Object.keys(pathItem).filter((key) =>
      HTTP_METHODS.has(key),
    );
    if (remainingMethods.length === 0) {
      delete hoisted.paths[path];
    }
  }

  assert(operations.length > 0, "No public operations were generated");
  addUnknownPlatformMembers(hoisted, contractNames);
  const manifest: RpcManifest = {
    sourceSha256: sha256(stableJson(source)),
    operationCount: operations.length,
    operations: operations.sort((a, b) =>
      a.operationId.localeCompare(b.operationId),
    ),
  };
  return { sdk: jsonSdkDocument(hoisted), manifest };
}

async function main(): Promise<void> {
  const config = await loadSdkConfig();
  const source = await readJson<JsonObject>(schemaPath(config));
  validateSchemaTarget(source, config);
  const options = prepareOptionsFor(config);
  const { lane, namingWaived } = options;
  const { sdk, manifest } = prepareSdk(source, options);
  validateSchemaTarget(sdk, config);
  await writeAtomic(resolve(repositoryRoot, "openapi/sdk.json"), stableJson(sdk));
  await writeAtomic(resolve(repositoryRoot, "openapi/rpc-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Prepared ${lane} SDK input and RPC manifest for ${manifest.operationCount} source operations`);
  if (namingWaived) console.log(`Naming waiver (until ${config.namingWaiver!.until}): unnamed operation schemas got derived names.`);
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
