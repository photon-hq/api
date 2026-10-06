import { createClient, type Client } from "./generated/client/index.js";
import { ZodError } from "zod";
import { DEFAULT_BASE_URL } from "./config.generated.js";
import {
  ApiError,
  ResponseValidationError,
  TransportError,
} from "./errors.js";
import {
  createPhotonFetch,
  type HeaderProvider,
  type RetryOptions,
} from "./transport.js";
import {
  createRpcNamespaces,
  operationMediaTypes,
  type OutputSchemas,
  type PhotonNamespaces,
  type PhotonRawNamespaces,
  type RawResponse,
  type RequestOptions,
  type SdkFunction,
} from "./rpc.generated.js";

export interface PhotonOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  headers?: HeaderProvider;
  timeoutMs?: number;
  retry?: RetryOptions | false;
}

interface HeyApiResult {
  data?: unknown;
  error?: unknown;
  request?: Request;
  response?: Response;
}

// The selected contract determines the namespaces present in each build.
export interface Photon extends Readonly<PhotonNamespaces> {}

export class Photon {
  readonly raw: PhotonRawNamespaces;

  readonly #client: Client;

  constructor(options: PhotonOptions = {}) {
    this.#client = createClient({
      baseUrl: options.baseUrl ?? DEFAULT_BASE_URL,
      fetch: createPhotonFetch(options),
      responseStyle: "fields",
      throwOnError: false,
    });

    const namespaces = createRpcNamespaces({
      data: async <Input, Output>(
        operationId: string,
        sdkFunction: SdkFunction,
        outputSchemas: OutputSchemas<Output>,
        input: Input | undefined,
        requestOptions: RequestOptions | undefined,
      ): Promise<Output> => {
        const result = await this.#invoke<Input, Output>(
          operationId,
          sdkFunction,
          outputSchemas,
          input,
          requestOptions,
        );
        return result.data;
      },
      raw: async <Input, Output>(
        operationId: string,
        sdkFunction: SdkFunction,
        outputSchemas: OutputSchemas<Output>,
        input: Input | undefined,
        requestOptions: RequestOptions | undefined,
      ): Promise<RawResponse<Output>> =>
        this.#invoke<Input, Output>(
          operationId,
          sdkFunction,
          outputSchemas,
          input,
          requestOptions,
        ),
    });

    Object.assign(this, namespaces.data);
    this.raw = namespaces.raw;
  }

  async #invoke<Input, Output>(
    operationId: string,
    sdkFunction: SdkFunction,
    outputSchemas: OutputSchemas<Output>,
    input: Input | undefined,
    requestOptions: RequestOptions | undefined,
  ): Promise<RawResponse<Output>> {
    // The input's types carry the contract; the service validates values.
    const data = (input ?? {}) as Record<string, unknown>;
    const declaredHeaders = data.headers as
      | Record<string, string | undefined>
      | undefined;
    const headers = new Headers(requestOptions?.headers);
    for (const [name, value] of Object.entries(declaredHeaders ?? {})) {
      if (value !== undefined) {
        headers.set(name === "idempotencyKey" ? "Idempotency-Key" : name, value);
      }
    }
    const media = operationMediaTypes[operationId];
    if (media?.request) headers.set("Content-Type", media.request);
    if (media?.accept.length) headers.set("Accept", media.accept.join(", "));
    const sdkInput = { ...data };
    delete sdkInput.headers;

    // The SDK function returns a failed decode as `error` with its response
    // (throwOnError is off), so validation failures are handled below.
    const result = (await sdkFunction({
      ...sdkInput,
      ...(media?.rawRequest ? { bodySerializer: null } : {}),
      client: this.#client,
      headers: Object.fromEntries(headers),
      signal: requestOptions?.signal,
      // Defer successful decoding so each status uses its declared
      // representation, never the response's Content-Type.
      ...(media ? { parseAs: "stream" } : {}),
    })) as HeyApiResult;

    if (!result?.response) {
      // A failure before or while reading the response, or a cancellation:
      // a TransportError naming the operation, with the underlying cause.
      const error = result?.error;
      throw new TransportError(
        error instanceof TransportError ? error.message : "Photon request failed",
        {
          cause: error instanceof TransportError ? error.cause : error,
          operationId,
          requestId: error instanceof TransportError ? error.requestId : undefined,
        },
      );
    }

    const requestId = result.response.headers.get("x-request-id") ?? undefined;
    const status = result.response.status;
    if (result.error !== undefined && !result.response.ok &&
      media?.responseKinds[String(status)] === "empty") {
      // A declared status without a body that is not an error, such as
      // 304 Not Modified answering a conditional request.
      return {
        data: undefined as Output,
        status,
        headers: result.response.headers,
        requestId,
      };
    }
    if (result.error !== undefined) {
      const errorBody = result.error;
      if (result.response.ok) {
        // A successful response the SDK function could not decode or validate.
        throw new ResponseValidationError(
          operationId,
          errorBody instanceof ZodError ? errorBody.issues : [],
          { status, cause: errorBody, requestId },
        );
      }
      // Any other status is the service's answer, whatever its body holds
      // (a VALIDATION_FAILED problem lists its `issues`).
      const detail =
        typeof errorBody === "object" &&
        errorBody !== null &&
        "detail" in errorBody &&
        typeof errorBody.detail === "string"
          ? errorBody.detail
          : `Photon API returned HTTP ${status}`;
      throw new ApiError(detail, {
        operationId,
        requestId,
        status,
        headers: result.response.headers,
        body: errorBody,
        rawBody:
          typeof errorBody === "string"
            ? errorBody
            : JSON.stringify(errorBody),
      });
    }

    if (media) {
      const documented = media.responseKinds[String(status)] !== undefined ? String(status) : "2XX";
      const kind = media.responseKinds[documented];
      if (!kind) {
        throw new ResponseValidationError(operationId, [], {
          status,
          cause: new Error(`Undocumented successful status ${status}`),
          requestId,
        });
      }
      let decoded: unknown;
      try {
        decoded = kind === "binary"
          ? await result.response.blob()
          : kind === "json"
            ? await result.response.text()
            : await result.response.arrayBuffer();
      } catch (error) {
        // The transport reads the body within each attempt, so this is rare;
        // like a failure before the headers, it is a TransportError whose
        // cause is the underlying error (or the caller's abort reason).
        throw new TransportError("Photon response body could not be read", {
          cause: error,
          operationId,
          requestId,
        });
      }
      try {
        if (kind === "json") {
          decoded = JSON.parse(decoded as string);
        } else if (kind === "empty") {
          if ((decoded as ArrayBuffer).byteLength !== 0) {
            throw new Error("Expected an empty response");
          }
          decoded = undefined;
        }
        // Validate against the body documented for this status, not the
        // union of every success body.
        const outputSchema = outputSchemas[documented];
        if (!outputSchema) {
          throw new Error(`No response schema for status ${documented}`);
        }
        result.data = await outputSchema.parseAsync(decoded);
      } catch (error) {
        throw new ResponseValidationError(
          operationId,
          error instanceof ZodError ? error.issues : [],
          { status, cause: error, requestId },
        );
      }
    }

    return {
      data: result.data as Output,
      status,
      headers: result.response.headers,
      requestId,
    };
  }
}
