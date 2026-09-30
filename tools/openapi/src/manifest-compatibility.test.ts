import assert from "node:assert/strict";
import test from "node:test";
import {
  comparePublicSurfaces,
  type ManifestOperation,
  type RpcManifest,
} from "./manifest-compatibility.js";

function operation(
  overrides: Partial<ManifestOperation> = {},
): ManifestOperation {
  return {
    operationId: "createProject",
    namespace: ["projects"],
    rpcMethod: "create",
    idempotencyKeyRequired: false,
    parameters: [],
    ...overrides,
  };
}

function manifest(...operations: ManifestOperation[]): RpcManifest {
  return { operations };
}

test("marks removals, RPC renames, and newly required inputs as breaking", () => {
  const base = manifest(
    operation({
      parameters: [
        { location: "query", wireName: "cursor", required: false },
      ],
    }),
    operation({ operationId: "getProject", rpcMethod: "get" }),
  );
  const head = manifest(
    operation({
      namespace: ["projects", "admin"],
      parameters: [
        { location: "query", wireName: "cursor", required: true },
        { location: "header", wireName: "X-Tenant", required: true },
      ],
    }),
  );

  const comparison = comparePublicSurfaces(base, head);
  assert.equal(comparison.breaking, true);
  assert.deepEqual(
    new Set(comparison.changes.map((change) => change.kind)),
    new Set([
      "operation-removed",
      "parameter-added",
      "parameter-required",
      "rpc-name-changed",
    ]),
  );
});

test("accepts operation additions and new optional arguments", () => {
  const baseOperation = operation();
  const comparison = comparePublicSurfaces(
    manifest(baseOperation),
    manifest(
      operation({
        parameters: [
          { location: "query", wireName: "include_deleted", required: false },
        ],
      }),
      operation({ operationId: "listProjects", rpcMethod: "list" }),
    ),
  );

  assert.equal(comparison.breaking, false);
  assert.deepEqual(
    comparison.changes.map((change) => change.kind),
    ["parameter-added", "operation-added"],
  );
});

test("detects request-body requiredness and removed media types", () => {
  const comparison = comparePublicSurfaces(
    manifest(
      operation({
        requestBody: {
          required: false,
          content: {
            "application/json": {},
            "application/x-www-form-urlencoded": {},
          },
        },
      }),
    ),
    manifest(
      operation({
        requestBody: {
          required: true,
          content: { "application/json": {} },
        },
      }),
    ),
  );

  assert.equal(comparison.breaking, true);
  assert.deepEqual(
    comparison.changes.map((change) => change.kind),
    ["request-body-required", "request-media-type-removed"],
  );
});
