export interface ManifestParameter {
  location: string;
  wireName: string;
  required: boolean;
}

export interface ManifestOperation {
  operationId: string;
  namespace: string[];
  rpcMethod: string;
  idempotencyKeyRequired: boolean;
  parameters: ManifestParameter[];
  requestBody?: {
    required: boolean;
    content: Record<string, unknown>;
  };
}

export interface RpcManifest {
  operations: ManifestOperation[];
}

export interface PublicSurfaceChange {
  kind:
    | "operation-added"
    | "operation-removed"
    | "rpc-name-changed"
    | "parameter-added"
    | "parameter-removed"
    | "parameter-required"
    | "request-body-added"
    | "request-body-removed"
    | "request-body-required"
    | "request-media-type-removed";
  operationId: string;
  breaking: boolean;
  detail: string;
}

export interface PublicSurfaceComparison {
  breaking: boolean;
  changes: PublicSurfaceChange[];
}

function publicName(operation: ManifestOperation): string {
  return [...operation.namespace, operation.rpcMethod].join(".");
}

function parameterKey(parameter: ManifestParameter): string {
  return `${parameter.location}:${parameter.wireName.toLowerCase()}`;
}

export function comparePublicSurfaces(
  base: RpcManifest,
  head: RpcManifest,
): PublicSurfaceComparison {
  const changes: PublicSurfaceChange[] = [];
  const baseById = new Map(
    base.operations.map((operation) => [operation.operationId, operation]),
  );
  const headById = new Map(
    head.operations.map((operation) => [operation.operationId, operation]),
  );

  for (const operation of base.operations) {
    const next = headById.get(operation.operationId);
    if (!next) {
      changes.push({
        kind: "operation-removed",
        operationId: operation.operationId,
        breaking: true,
        detail: `Removed ${publicName(operation)}`,
      });
      continue;
    }

    if (publicName(operation) !== publicName(next)) {
      changes.push({
        kind: "rpc-name-changed",
        operationId: operation.operationId,
        breaking: true,
        detail: `${publicName(operation)} became ${publicName(next)}`,
      });
    }

    const baseParameters = new Map(
      operation.parameters.map((parameter) => [
        parameterKey(parameter),
        parameter,
      ]),
    );
    const headParameters = new Map(
      next.parameters.map((parameter) => [parameterKey(parameter), parameter]),
    );
    for (const parameter of operation.parameters) {
      const replacement = headParameters.get(parameterKey(parameter));
      if (!replacement) {
        changes.push({
          kind: "parameter-removed",
          operationId: operation.operationId,
          breaking: true,
          detail: `No longer accepts ${parameter.location} parameter ${parameter.wireName}`,
        });
      } else if (!parameter.required && replacement.required) {
        changes.push({
          kind: "parameter-required",
          operationId: operation.operationId,
          breaking: true,
          detail: `${parameter.location} parameter ${parameter.wireName} became required`,
        });
      }
    }
    for (const parameter of next.parameters) {
      if (!baseParameters.has(parameterKey(parameter))) {
        changes.push({
          kind: "parameter-added",
          operationId: operation.operationId,
          breaking: parameter.required,
          detail: `Added ${parameter.required ? "required" : "optional"} ${parameter.location} parameter ${parameter.wireName}`,
        });
      }
    }

    if (operation.requestBody && !next.requestBody) {
      changes.push({
        kind: "request-body-removed",
        operationId: operation.operationId,
        breaking: true,
        detail: "No longer accepts a request body",
      });
    } else if (!operation.requestBody && next.requestBody) {
      changes.push({
        kind: "request-body-added",
        operationId: operation.operationId,
        breaking: next.requestBody.required,
        detail: `Added ${next.requestBody.required ? "required" : "optional"} request body`,
      });
    } else if (operation.requestBody && next.requestBody) {
      if (!operation.requestBody.required && next.requestBody.required) {
        changes.push({
          kind: "request-body-required",
          operationId: operation.operationId,
          breaking: true,
          detail: "Request body became required",
        });
      }
      for (const mediaType of Object.keys(operation.requestBody.content)) {
        if (!(mediaType in next.requestBody.content)) {
          changes.push({
            kind: "request-media-type-removed",
            operationId: operation.operationId,
            breaking: true,
            detail: `No longer accepts ${mediaType}`,
          });
        }
      }
    }
  }

  for (const operation of head.operations) {
    if (!baseById.has(operation.operationId)) {
      changes.push({
        kind: "operation-added",
        operationId: operation.operationId,
        breaking: false,
        detail: `Added ${publicName(operation)}`,
      });
    }
  }

  changes.sort(
    (left, right) =>
      left.operationId.localeCompare(right.operationId) ||
      left.kind.localeCompare(right.kind) ||
      left.detail.localeCompare(right.detail),
  );
  return {
    breaking: changes.some((change) => change.breaking),
    changes,
  };
}

export function publicSurfaceMarkdown(
  comparison: PublicSurfaceComparison,
): string {
  const lines = [
    "# RPC public-surface diff",
    "",
    comparison.breaking
      ? "Breaking public-surface changes were detected."
      : "No breaking public-surface changes were detected.",
    "",
  ];
  if (comparison.changes.length === 0) {
    lines.push("No RPC operation, name, or argument-shape changes.");
  } else {
    for (const change of comparison.changes) {
      lines.push(
        `- ${change.breaking ? "**BREAKING**" : "compatible"} \`${change.operationId}\`: ${change.detail}`,
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}
