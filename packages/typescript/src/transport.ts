import { TransportError } from "./errors.js";

export type HeaderValues =
  | Headers
  | Readonly<Record<string, string | undefined>>;

export type HeaderProvider =
  | HeaderValues
  | (() => HeaderValues | Promise<HeaderValues>);

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

      try {
        const response = await fetchImplementation(attemptRequest);
        if (
          attempt >= maxAttempts ||
          !canRetry ||
          !statuses.has(response.status)
        ) {
          return response;
        }
        const retryAfter = retryAfterMs(response);
        if (retryAfter !== undefined && retryAfter > maximumRetryAfterMs) {
          return response;
        }
        const delay =
          retryAfter ?? jitterDelay(attempt, baseDelayMs, maximumDelayMs);
        await response.body?.cancel();
        await wait(delay, original.signal);
      } catch (error) {
        if (original.signal.aborted) {
          throw error;
        }
        lastError = error;
        if (!canRetry || attempt >= maxAttempts) {
          throw new TransportError("Photon request failed", { cause: error });
        }
        await wait(
          jitterDelay(attempt, baseDelayMs, maximumDelayMs),
          original.signal,
        );
      }
    }

    throw new TransportError("Photon request failed", { cause: lastError });
  };
}
