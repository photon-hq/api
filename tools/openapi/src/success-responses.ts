import { isObject, type JsonValue } from "./shared.js";
import { isBinaryMediaType, selectResponseMedia } from "./media-types.js";

export interface ManifestSuccessResponse {
  status: string;
  exactStatus?: number;
  range?: number;
  model?: string;
  binary?: boolean;
}

export type ManifestResponses = Record<
  string,
  Record<string, string | JsonValue>
>;

const COMPONENT_PREFIX = "#/components/schemas/";

export function modelNameFromReference(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith(COMPONENT_PREFIX)) {
    return undefined;
  }
  return decodeURIComponent(
    value
      .slice(COMPONENT_PREFIX.length)
      .replaceAll("~1", "/")
      .replaceAll("~0", "~"),
  );
}

/**
 * The documented statuses that are not errors: every 2XX, and 304 Not
 * Modified, the answer to a conditional request (`If-None-Match`) whose cached
 * representation is current. A 304 has no body.
 */
function successStatus(
  status: string,
): { exactStatus: number } | { range: number } | undefined {
  if (/^2\d\d$/.test(status) || status === "304") {
    return { exactStatus: Number(status) };
  }
  if (/^2xx$/i.test(status)) {
    return { range: 2 };
  }
  return undefined;
}

export function successResponses(
  operationId: string,
  responses: ManifestResponses,
): ManifestSuccessResponse[] {
  const result: ManifestSuccessResponse[] = [];
  for (const [status, content] of Object.entries(responses)) {
    const parsedStatus = successStatus(status);
    if (!parsedStatus) {
      continue;
    }
    const canonicalStatus =
      "range" in parsedStatus ? `${parsedStatus.range}XX` : status;
    const selected = selectResponseMedia(
      content,
      `${operationId} response ${status}`,
    );
    if (!selected) {
      result.push({ status: canonicalStatus, ...parsedStatus });
      continue;
    }
    if (isBinaryMediaType(selected.mediaType)) {
      result.push({ status: canonicalStatus, ...parsedStatus, binary: true });
      continue;
    }
    const schema = selected.value;
    const model = modelNameFromReference(schema);
    if (!model) {
      const description = isObject(schema)
        ? JSON.stringify(schema)
        : String(schema);
      throw new Error(
        `${operationId} response ${status} schema is not a component reference: ${description}`,
      );
    }
    result.push({ status: canonicalStatus, ...parsedStatus, model });
  }
  return result.sort((left, right) => {
    if (left.exactStatus !== undefined && right.exactStatus !== undefined) {
      return left.exactStatus - right.exactStatus;
    }
    if (left.exactStatus !== undefined) {
      return -1;
    }
    if (right.exactStatus !== undefined) {
      return 1;
    }
    return (left.range ?? 0) - (right.range ?? 0);
  });
}

export function statusVariant(status: string): string {
  return `Status${status.replaceAll(/[^0-9A-Za-z]/g, "").replaceAll(/xx/gi, "xx")}`;
}
