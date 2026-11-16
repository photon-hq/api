"""Webhook signature verification against deliveries signed here, independently of the
library under test: HMAC-SHA256 over "<id>.<timestamp>.<body>", keyed with the secret's
decoded bytes, as Photon signs them.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from datetime import UTC, datetime
from typing import Any

import pytest
import standardwebhooks.webhooks

from photon_api import PhotonError, WebhookVerificationError, verify_webhook

EVENT_ID = "pho_evt_00000000000000000000000001"
BODY = json.dumps({"id": EVENT_ID, "type": "message.received", "text": "Hello 🌍"})


def new_secret() -> str:
    return "whsec_" + base64.b64encode(secrets.token_bytes(32)).decode()


def sign(secret: str, timestamp: int, body: bytes) -> str:
    key = base64.b64decode(secret.removeprefix("whsec_"))
    mac = hmac.new(key, f"{EVENT_ID}.{timestamp}.".encode() + body, hashlib.sha256).digest()
    return "v1," + base64.b64encode(mac).decode()


def delivery(
    signing_secrets: list[str], timestamp: int | None = None, body: bytes = BODY.encode()
) -> dict[str, str]:
    timestamp = int(time.time()) if timestamp is None else timestamp
    return {
        "webhook-id": EVENT_ID,
        "webhook-timestamp": str(timestamp),
        "webhook-signature": " ".join(sign(value, timestamp, body) for value in signing_secrets),
    }


def rejected(raised: pytest.ExceptionInfo[WebhookVerificationError]) -> None:
    assert isinstance(raised.value, PhotonError)
    # The Standard Webhooks library's own error stays inside the client.
    assert raised.value.__cause__ is None
    assert raised.value.__suppress_context__


def test_verifies_a_delivery_signed_with_the_destination_secret() -> None:
    secret = new_secret()
    assert verify_webhook(BODY.encode(), delivery([secret]), secret=secret) is None
    assert verify_webhook(BODY, delivery([secret]), secret=secret) is None


def test_reads_headers_in_any_case() -> None:
    secret = new_secret()
    headers = {name.title(): value for name, value in delivery([secret]).items()}
    headers["Content-Type"] = "application/json"
    verify_webhook(BODY.encode(), headers, secret=secret)


@pytest.mark.parametrize(
    "change",
    ["body", "secret", "forged", "version", "malformed"],
)
def test_rejects_a_bad_signature(change: str) -> None:
    secret = new_secret()
    headers = delivery([secret])
    body = BODY.encode()
    other_secret = secret
    if change == "body":
        body = BODY.replace("Hello", "Hullo").encode()
    elif change == "secret":
        other_secret = new_secret()
    elif change == "forged":
        headers["webhook-signature"] = "v1," + base64.b64encode(bytes(32)).decode()
    elif change == "version":
        headers["webhook-signature"] = headers["webhook-signature"].replace("v1,", "v2,")
    else:
        headers["webhook-signature"] = "v1"
    with pytest.raises(WebhookVerificationError) as raised:
        verify_webhook(body, headers, secret=other_secret)
    rejected(raised)
    assert "signature" in str(raised.value).lower()


@pytest.mark.parametrize(("offset", "message"), [(-301, "too old"), (301, "too new")])
def test_rejects_a_timestamp_outside_five_minutes(offset: int, message: str) -> None:
    secret = new_secret()
    with pytest.raises(WebhookVerificationError, match=message) as raised:
        verify_webhook(BODY, delivery([secret], int(time.time()) + offset), secret=secret)
    rejected(raised)
    inside = int(time.time()) + (290 if offset > 0 else -290)
    verify_webhook(BODY, delivery([secret], inside), secret=secret)


@pytest.mark.parametrize("timestamp", ["-9223372036854775808", "9223372036854775807"])
def test_rejects_an_extreme_timestamp_without_a_valid_signature(timestamp: str) -> None:
    secret = new_secret()
    headers = delivery([secret])
    headers["webhook-timestamp"] = timestamp
    headers["webhook-signature"] = "v1," + base64.b64encode(bytes(32)).decode()
    with pytest.raises(WebhookVerificationError) as raised:
        verify_webhook(BODY, headers, secret=secret)
    rejected(raised)


def test_rejects_an_unreadable_timestamp() -> None:
    secret = new_secret()
    headers = delivery([secret])
    headers["webhook-timestamp"] = "yesterday"
    with pytest.raises(WebhookVerificationError, match="Invalid"):
        verify_webhook(BODY, headers, secret=secret)


def test_accepts_either_secret_during_a_rotation_and_only_the_new_one_after_it() -> None:
    previous, current = new_secret(), new_secret()
    # While both keys are valid, Photon signs with each of them in one header.
    verify_webhook(BODY, delivery([previous, current]), secret=current)
    verify_webhook(BODY, delivery([previous, current]), secret=previous)
    # Once the previous key expires, Photon signs with the new one alone.
    with pytest.raises(WebhookVerificationError, match="No matching signature"):
        verify_webhook(BODY, delivery([current]), secret=previous)
    # A timestamp failure is reported as such, not as a signature mismatch.
    old = int(time.time()) - 301
    with pytest.raises(WebhookVerificationError, match="too old"):
        verify_webhook(BODY, delivery([previous, current], old), secret=current)


@pytest.mark.parametrize("missing", ["webhook-id", "webhook-timestamp", "webhook-signature"])
def test_rejects_a_delivery_without_its_headers(missing: str) -> None:
    secret = new_secret()
    headers = delivery([secret])
    del headers[missing]
    with pytest.raises(WebhookVerificationError, match="Missing"):
        verify_webhook(BODY, headers, secret=secret)


def test_rejects_a_body_that_is_not_utf8() -> None:
    secret = new_secret()
    body = b"{\xff}"
    with pytest.raises(WebhookVerificationError, match="UTF-8"):
        verify_webhook(body, delivery([secret], body=body), secret=secret)


@pytest.mark.parametrize("secret", ["", "pho_sk_api_key", "whsec_", "whsec_not base64!", None])
def test_raises_value_error_for_a_missing_or_malformed_secret(secret: Any) -> None:
    with pytest.raises(ValueError) as raised:
        verify_webhook(BODY, delivery([new_secret()]), secret=secret)
    assert not isinstance(raised.value, WebhookVerificationError)
    assert raised.value.__cause__ is None


def test_matches_the_standard_webhooks_reference_signature(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # The known-answer vector of the Standard Webhooks reference libraries' tests.
    class Frozen(datetime):
        @classmethod
        def now(cls, tz: object = None) -> Frozen:  # type: ignore[override]
            return cls.fromtimestamp(1614265330, tz=UTC)

    monkeypatch.setattr(standardwebhooks.webhooks, "datetime", Frozen)
    headers = {
        "webhook-id": "msg_p5jXN8AQM9LWM0D4loKWxJek",
        "webhook-timestamp": "1614265330",
        "webhook-signature": "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=",
    }
    secret = "whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw"
    verify_webhook(b'{"test": 2432232314}', headers, secret=secret)
