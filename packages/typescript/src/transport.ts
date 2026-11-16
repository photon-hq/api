import { TransportError } from "./errors.js";

export type HeaderValues =
  | Headers
  | Readonly<Record<string, string | undefined>>;

export type HeaderProvider =
  | HeaderValues
  | (() => HeaderValues | Promise<HeaderValues>);

/**
 * What `RetryOptions.onRetry` receives before an automatic retry: the attempt
 * about to be sent, and why the previous one is retried, either a response
 * with a retried status or a network failure or timeout.
 */
export type RetryContext = {
  /** The attempt about to be sent, counting the first: 2 for the first retry. */
  readonly attempt: number;
  /** The most attempts the client makes for this call: `retry.maxAttempts`, clamped to 1 to 3. */
  readonly maxAttempts: number;
  /** How long the client waits before sending the attempt, in milliseconds: the `Retry-After` delay, or the backoff. */
  readonly delayMs: number;
} & (
  | {
      /** The retried status of the previous attempt's response. */
      readonly status: number;
      /** The previous attempt's response. Its body has been discarded; its status and headers can be read. */
      readonly response: Response;
      readonly error?: undefined;
    }
  | {
      /** The network failure or timeout that ended the previous attempt. */
      readonly error: unknown;
      readonly status?: undefined;
      readonly response?: undefined;
    }
);

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maximumDelayMs?: number;
  /**
   * Longest server-requested `Retry-After` delay the client waits for,
   * in milliseconds (default 60 000). A longer delay is not shortened: the
   * client stops retrying and returns that response to the caller.
   */
  maximumRetryAfterMs?: number;
  statuses?: readonly number[];
  /**
   * Called once before each automatic retry, before the client waits
   * `delayMs`. It only observes: it cannot change, delay or cancel the retry.
   * The client does not await it, and ignores an exception it throws or a
   * promise it rejects. A call cancelled through its `signal` during the wait
   * does not send the attempt it reported.
   */
  onRetry?: (context: RetryContext) => void;
}

export interface TransportOptions {
  fetch?: typeof globalThis.fetch;
  headers?: HeaderProvider;
  timeoutMs?: number;
  retry?: RetryOptions | false;
}

const DEFAULT_RETRY_STATUSES = [408, 429, 502, 503, 504] as const;

function toHeaders(values: HeaderValues | undefined): Headers {
  if (!values) {
    return new Headers();
  }
  if (values instanceof Headers) {
    return new Headers(values);
  }
  const headers = new Headers();
  for (const [name, value] of Object.entries(values)) {
    if (value !== undefined) {
      headers.set(name, value);
    }
  }
  return headers;
}

async function resolveHeaders(provider: HeaderProvider | undefined): Promise<Headers> {
  if (typeof provider === "function") {
    return toHeaders(await provider());
  }
  return toHeaders(provider);
}

function retryAfterMs(response: Response): number | undefined {
  const value = response.headers.get("retry-after");
  if (!value) {
    return undefined;
  }
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1_000;
  }
  const date = Date.parse(value);
  if (Number.isNaN(date)) {
    return undefined;
  }
  return Math.max(0, date - Date.now());
}

function jitterDelay(
  attempt: number,
  baseDelayMs: number,
  maximumDelayMs: number,
): number {
  const ceiling = Math.min(maximumDelayMs, baseDelayMs * 2 ** (attempt - 1));
  return Math.floor(Math.random() * Math.max(1, ceiling));
}

async function wait(delayMs: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    throw signal.reason;
  }
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delayMs);
    const abort = (): void => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    signal.addEventListener("abort", abort, { once: true });
    setTimeout(() => signal.removeEventListener("abort", abort), delayMs);
  });
}

// Statuses whose responses never have a body (the Fetch standard's null body statuses).
const NULL_BODY_STATUSES = new Set([101, 103, 204, 205, 304]);

/**
 * The response with its body read in full, so reading the body is part of the
 * attempt: a timeout, network failure or cancellation while the body arrives
 * fails the attempt like one before the headers, and is retried the same way.
 */
async function buffered(response: Response): Promise<Response> {
  const body = NULL_BODY_STATUSES.has(response.status) ? null : await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/** Calls `onRetry` without awaiting it; whatever it throws or rejects with is ignored. */
function notifyRetry(onRetry: RetryOptions["onRetry"], context: RetryContext): void {
  if (!onRetry) {
    return;
  }
  try {
    Promise.resolve(onRetry(context)).catch(() => {});
  } catch {}
}

const attemptCounts = new WeakMap<Response, number>();

function counted(response: Response, attempts: number): Response {
  attemptCounts.set(response, attempts);
  return response;
}

/**
 * How many attempts the client made for a response it returned, counting
 * the first; undefined for any other response.
 */
export function attemptsMade(response: Response): number | undefined {
  return attemptCounts.get(response);
}

function retryableRequest(method: string, headers: Headers): boolean {
  return (
    ["GET", "HEAD", "OPTIONS", "TRACE"].includes(method) ||
    headers.has("idempotency-key")
  );
}

export const DEFAULT_MAXIMUM_RETRY_AFTER_MS = 60_000;

export function createPhotonFetch(
  options: TransportOptions,
): typeof globalThis.fetch {
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const retry = options.retry === false ? undefined : options.retry ?? {};
  const maxAttempts = Math.max(1, Math.min(3, retry?.maxAttempts ?? 3));
  const baseDelayMs = retry?.baseDelayMs ?? 250;
  const maximumDelayMs = retry?.maximumDelayMs ?? 2_000;
  const maximumRetryAfterMs =
    retry?.maximumRetryAfterMs ?? DEFAULT_MAXIMUM_RETRY_AFTER_MS;
  const statuses = new Set(retry?.statuses ?? DEFAULT_RETRY_STATUSES);

  return async (input, init): Promise<Response> => {
    const original = new Request(input, init);
    // Decided on the first attempt, once configured headers are merged, so an
    // Idempotency-Key from the client-wide headers enables retries too.
    let canRetry = false;
    let lastError: unknown;
    // The request ID of a response whose body could not be read.
    let lastRequestId: string | undefined;

    for (let attempt = 1; attempt <= (canRetry ? maxAttempts : 1); attempt += 1) {
      const request = original.clone();
      const configuredHeaders = await resolveHeaders(options.headers);
      const mergedHeaders = new Headers(configuredHeaders);
      request.headers.forEach((value, key) => mergedHeaders.set(key, value));
      if (attempt === 1) {
        canRetry =
          retry !== undefined &&
          retryableRequest(original.method, mergedHeaders);
      }
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const signal = AbortSignal.any([original.signal, timeoutSignal]);
      const attemptRequest = new Request(request, {
        headers: mergedHeaders,
        signal,
      });

      lastRequestId = undefined;
      try {
        const response = await fetchImplementation(attemptRequest);
        lastRequestId = response.headers.get("x-request-id") ?? undefined;
        if (
          attempt >= maxAttempts ||
          !canRetry ||
          !statuses.has(response.status)
        ) {
          return counted(await buffered(response), attempt);
        }
        const retryAfter = retryAfterMs(response);
        if (retryAfter !== undefined && retryAfter > maximumRetryAfterMs) {
          return counted(await buffered(response), attempt);
        }
        const delay =
          retryAfter ?? jitterDelay(attempt, baseDelayMs, maximumDelayMs);
        await response.body?.cancel();
        notifyRetry(retry?.onRetry, {
          attempt: attempt + 1,
          maxAttempts,
          delayMs: delay,
          status: response.status,
          response,
        });
        await wait(delay, original.signal);
      } catch (error) {
        if (original.signal.aborted) {
          throw error;
        }
        lastError = error;
        if (!canRetry || attempt >= maxAttempts) {
          throw new TransportError("Photon request failed", { cause: error, requestId: lastRequestId, attempts: attempt });
        }
        const delay = jitterDelay(attempt, baseDelayMs, maximumDelayMs);
        notifyRetry(retry?.onRetry, { attempt: attempt + 1, maxAttempts, delayMs: delay, error });
        await wait(delay, original.signal);
      }
    }

    throw new TransportError("Photon request failed", { cause: lastError, requestId: lastRequestId });
  };
}
