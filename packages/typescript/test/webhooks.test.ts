import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import test from "node:test";
import { PhotonError, verifyWebhook, WebhookVerificationError } from "../src/index.js";

// Sign a delivery the way Photon does, independently of the library under test:
// HMAC-SHA256 over "<id>.<timestamp>.<body>", keyed with the secret's decoded bytes.
function secret(): string {
  return `whsec_${randomBytes(32).toString("base64")}`;
}

function sign(signingSecret: string, id: string, timestamp: number, body: string | Uint8Array): string {
  const key = Buffer.from(signingSecret.slice("whsec_".length), "base64");
  const mac = createHmac("sha256", key).update(`${id}.${timestamp}.`).update(body).digest("base64");
  return `v1,${mac}`;
}

const now = () => Math.floor(Date.now() / 1000);
const eventId = "pho_evt_00000000000000000000000001";
const body = JSON.stringify({ id: eventId, type: "message.received", text: "Hello 🌍" });

function delivery(signingSecrets: string[], timestamp = now(), payload: string | Uint8Array = body): Headers {
  return new Headers({
    "webhook-id": eventId,
    "webhook-timestamp": String(timestamp),
    "webhook-signature": signingSecrets.map((value) => sign(value, eventId, timestamp, payload)).join(" "),
  });
}

function rejects(run: () => unknown, message: RegExp): void {
  assert.throws(run, (error: unknown) => {
    assert.ok(error instanceof WebhookVerificationError);
    assert.ok(error instanceof PhotonError);
    assert.match(error.message, message);
    // The Standard Webhooks library's own error stays inside the client.
    assert.equal(error.cause, undefined);
    return true;
  });
}

test("verifies a delivery signed with the destination's secret and returns nothing", () => {
  const current = secret();
  assert.equal(verifyWebhook(body, delivery([current]), { secret: current }), undefined);
});

test("reads the body as bytes and the headers from a record in any case", () => {
  const current = secret();
  const timestamp = now();
  const bytes = new TextEncoder().encode(body);
  const headers = Object.fromEntries(delivery([current], timestamp, bytes));
  const record = {
    "Webhook-Id": headers["webhook-id"],
    "WEBHOOK-TIMESTAMP": [headers["webhook-timestamp"] as string],
    "webhook-signature": headers["webhook-signature"],
    "content-type": "application/json",
  };
  assert.doesNotThrow(() => verifyWebhook(bytes, record, { secret: current }));
  assert.doesNotThrow(() => verifyWebhook(Buffer.from(bytes), record, { secret: current }));
});

test("rejects a bad signature, a changed body, and another destination's secret", () => {
  const current = secret();
  const headers = delivery([current]);
  rejects(() => verifyWebhook(body.replace("Hello", "Hullo"), headers, { secret: current }), /no matching signature/i);
  rejects(() => verifyWebhook(body, headers, { secret: secret() }), /no matching signature/i);
  const forged = new Headers(headers);
  forged.set("webhook-signature", `v1,${Buffer.alloc(32).toString("base64")}`);
  rejects(() => verifyWebhook(body, forged, { secret: current }), /no matching signature/i);
  const otherScheme = new Headers(headers);
  otherScheme.set("webhook-signature", (headers.get("webhook-signature") as string).replace("v1,", "v2,"));
  rejects(() => verifyWebhook(body, otherScheme, { secret: current }), /no matching signature/i);
});

test("rejects a timestamp more than five minutes old or ahead", () => {
  const current = secret();
  rejects(() => verifyWebhook(body, delivery([current], now() - 301), { secret: current }), /too old/i);
  rejects(() => verifyWebhook(body, delivery([current], now() + 301), { secret: current }), /too new/i);
  assert.doesNotThrow(() => verifyWebhook(body, delivery([current], now() - 290), { secret: current }));
  assert.doesNotThrow(() => verifyWebhook(body, delivery([current], now() + 290), { secret: current }));
  const unreadable = delivery([current]);
  unreadable.set("webhook-timestamp", "yesterday");
  rejects(() => verifyWebhook(body, unreadable, { secret: current }), /invalid/i);
});

test("rejects an extreme timestamp without a valid signature", () => {
  const current = secret();
  const cases = [
    ["-9223372036854775808", /webhook-timestamp/],
    ["9223372036854775807", /too new/i],
  ] as const;
  for (const [timestamp, message] of cases) {
    const headers = delivery([current]);
    headers.set("webhook-timestamp", timestamp);
    headers.set("webhook-signature", `v1,${Buffer.alloc(32).toString("base64")}`);
    rejects(() => verifyWebhook(body, headers, { secret: current }), message);
  }
});

test("accepts either secret during a rotation, and only the new one after it", () => {
  const previous = secret();
  const next = secret();
  // While both keys are valid, Photon signs with each of them in one header.
  assert.doesNotThrow(() => verifyWebhook(body, delivery([previous, next]), { secret: next }));
  assert.doesNotThrow(() => verifyWebhook(body, delivery([previous, next]), { secret: previous }));
  // Once the previous key expires, Photon signs with the new one alone.
  rejects(() => verifyWebhook(body, delivery([next]), { secret: previous }), /no matching signature/i);
  // A timestamp failure is reported as such, not as a signature mismatch.
  rejects(() => verifyWebhook(body, delivery([previous, next], now() - 301), { secret: next }), /too old/i);
});

test("rejects a delivery without its headers or with a body that is not UTF-8", () => {
  const current = secret();
  for (const name of ["webhook-id", "webhook-timestamp", "webhook-signature"]) {
    const headers = delivery([current]);
    headers.delete(name);
    rejects(() => verifyWebhook(body, headers, { secret: current }), /missing/i);
  }
  for (const timestamp of [`${now()}abc`, `${now()}.5`, `+${now()}`]) {
    const headers = delivery([current]);
    headers.set("webhook-timestamp", timestamp);
    rejects(() => verifyWebhook(body, headers, { secret: current }), /webhook-timestamp/);
  }
  const invalid = new Uint8Array([0x7b, 0xff, 0x7d]);
  rejects(() => verifyWebhook(invalid, delivery([current], now(), invalid), { secret: current }), /UTF-8/);
});

test("throws TypeError, not a verification error, for a missing or malformed secret", () => {
  const headers = delivery([secret()]);
  for (const value of ["", "pho_sk_api_key", "whsec_", "whsec_not base64!"]) {
    assert.throws(() => verifyWebhook(body, headers, { secret: value }), (error: unknown) => {
      assert.ok(error instanceof TypeError);
      assert.equal(error.cause, undefined);
      return true;
    });
  }
  // An unset environment variable passed through a cast.
  const unset = process.env.PHOTON_DOCS_UNSET_SECRET as unknown as string;
  assert.throws(() => verifyWebhook(body, headers, { secret: unset }), { name: "TypeError", message: /signing secret/ });
});

test("matches the Standard Webhooks reference signature", (context) => {
  // The known-answer vector of the Standard Webhooks reference libraries' tests.
  context.mock.timers.enable({ apis: ["Date"], now: 1614265330 * 1000 });
  const headers = {
    "webhook-id": "msg_p5jXN8AQM9LWM0D4loKWxJek",
    "webhook-timestamp": "1614265330",
    "webhook-signature": "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=",
  };
  assert.doesNotThrow(() =>
    verifyWebhook('{"test": 2432232314}', headers, { secret: "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw" }),
  );
});
