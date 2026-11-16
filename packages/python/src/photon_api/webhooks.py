from __future__ import annotations

import base64
import binascii
from collections.abc import Mapping

from standardwebhooks import Webhook
from standardwebhooks import WebhookVerificationError as StandardWebhookError

from .errors import PhotonError

_SECRET_PREFIX = "whsec_"
_HEADERS = ("webhook-id", "webhook-timestamp", "webhook-signature")


class WebhookVerificationError(PhotonError):
    """A webhook delivery that failed verification. Answer it with 400 and do not act on it."""


def verify_webhook(payload: bytes | str, headers: Mapping[str, str], *, secret: str) -> None:
    """Verify a webhook delivery's Standard Webhooks signature.

    One of the ``webhook-signature`` signatures must be the HMAC-SHA256 of
    ``<webhook-id>.<webhook-timestamp>.<payload>`` under the secret, and
    ``webhook-timestamp`` must be within five minutes of the current time. Pass
    the request body exactly as it arrived, before any JSON parsing.

    ``secret`` is the destination's signing secret (``whsec_...``). During a
    rotation Photon signs each delivery with the new and the previous secret, so
    either one verifies it.

    Raises ``WebhookVerificationError`` when the delivery does not verify, and
    ``ValueError`` when the secret is not a webhook signing secret.
    """
    verifier = _signing_key(secret)
    delivered = {name.lower(): value for name, value in headers.items() if name.lower() in _HEADERS}
    if not all(delivered.get(name) for name in _HEADERS):
        raise WebhookVerificationError(
            "Missing webhook-id, webhook-timestamp, or webhook-signature header"
        )
    if isinstance(payload, bytes):
        try:
            payload = payload.decode("utf-8")
        except UnicodeDecodeError:
            raise WebhookVerificationError("The payload is not UTF-8") from None
    try:
        verifier.verify(payload, delivered, json_parse=False)
    except StandardWebhookError as error:
        raise WebhookVerificationError(str(error)) from None
    except ValueError:
        # The library raises a bare ValueError for a malformed signature token.
        raise WebhookVerificationError("Invalid webhook-signature header") from None


def _signing_key(secret: str) -> Webhook:
    if not isinstance(secret, str) or not secret.startswith(_SECRET_PREFIX):
        raise ValueError("A webhook signing secret starts with whsec_")
    try:
        key = base64.b64decode(secret[len(_SECRET_PREFIX) :], validate=True)
    except binascii.Error:
        raise ValueError("Invalid webhook signing secret") from None
    if not key:
        raise ValueError("Invalid webhook signing secret")
    return Webhook(key)
