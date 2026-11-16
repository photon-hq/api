import { Webhook, WebhookVerificationError as StandardWebhookError } from "standardwebhooks";
import { PhotonError } from "./errors.js";

/** A webhook request's headers: a Fetch API `Headers`, or a record such as Node's `IncomingHttpHeaders`. */
export type WebhookHeaders =
  | Pick<Headers, "get">
  | Readonly<Record<string, string | readonly string[] | undefined>>;

export interface VerifyWebhookOptions {
  /**
   * The destination's signing secret (`whsec_...`). During a rotation Photon
   * signs each delivery with the new and the previous secret, so either one
   * verifies it.
   */
  secret: string;
}

/** A webhook delivery that failed verification. Answer it with `400` and do not act on it. */
export class WebhookVerificationError extends PhotonError {}

/**
 * Verify a webhook delivery's Standard Webhooks signature: one of the
 * `webhook-signature` signatures must be the HMAC-SHA256 of
 * `<webhook-id>.<webhook-timestamp>.<payload>` under the secret, and
 * `webhook-timestamp` must be within five minutes of the current time.
 * Pass the request body exactly as it arrived, before any JSON parsing.
 *
 * @throws {WebhookVerificationError} The delivery did not verify.
 * @throws {TypeError} The secret is not a webhook signing secret.
 */
export function verifyWebhook(
  payload: string | Uint8Array,
  headers: WebhookHeaders,
  options: VerifyWebhookOptions,
): void {
  const verifier = signingKey(options.secret);
  const id = header(headers, "webhook-id");
  const timestamp = header(headers, "webhook-timestamp");
  const signature = header(headers, "webhook-signature");
  if (!id || !timestamp || !signature) {
    throw new WebhookVerificationError("Missing webhook-id, webhook-timestamp, or webhook-signature header");
  }
  // The library reads the timestamp with parseInt; accept only Unix seconds, as the other clients do.
  if (!/^\d+$/.test(timestamp)) throw new WebhookVerificationError("Invalid webhook-timestamp header");
  try {
    verifier.verify(
      text(payload),
      { "webhook-id": id, "webhook-timestamp": timestamp, "webhook-signature": signature },
      { jsonParse: false },
    );
  } catch (error) {
    if (error instanceof StandardWebhookError) throw new WebhookVerificationError(error.message);
    throw error;
  }
}

function signingKey(secret: unknown): Webhook {
  if (typeof secret !== "string") throw new TypeError("Pass the destination's webhook signing secret");
  if (!secret.startsWith("whsec_")) throw new TypeError("A webhook signing secret starts with whsec_");
  try {
    return new Webhook(secret);
  } catch {
    throw new TypeError("Invalid webhook signing secret");
  }
}

function header(headers: WebhookHeaders, name: string): string | undefined {
  if (typeof headers.get === "function") return (headers as Pick<Headers, "get">).get(name) ?? undefined;
  for (const [key, value] of Object.entries(headers as Readonly<Record<string, string | readonly string[] | undefined>>)) {
    if (key.toLowerCase() !== name) continue;
    if (typeof value === "string") return value;
    return value?.length === 1 ? value[0] : undefined;
  }
  return undefined;
}

function text(payload: string | Uint8Array): string {
  if (typeof payload === "string") return payload;
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(payload);
  } catch {
    throw new WebhookVerificationError("The payload is not UTF-8");
  }
}
