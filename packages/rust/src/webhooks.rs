//! Verification of Photon webhook deliveries (Standard Webhooks).

use std::fmt;
use std::time::{SystemTime, UNIX_EPOCH};

use reqwest::header::HeaderMap;
use standardwebhooks::{Webhook, WebhookError as StandardWebhookError};

const SECRET_PREFIX: &str = "whsec_";
const TOLERANCE_SECONDS: u128 = 5 * 60;

/// A destination's webhook signing secret (`whsec_...`), checked once, for
/// example when the receiver starts.
///
/// During a rotation Photon signs each delivery with the new and the previous
/// secret, so either one verifies it.
pub struct WebhookSecret(Webhook);

impl WebhookSecret {
    /// Check a webhook signing secret: `whsec_` followed by a Base64 key.
    pub fn new(secret: &str) -> Result<Self, InvalidWebhookSecret> {
        match secret.strip_prefix(SECRET_PREFIX) {
            Some(key) if !key.is_empty() => Webhook::new(key)
                .map(Self)
                .map_err(|_| InvalidWebhookSecret),
            _ => Err(InvalidWebhookSecret),
        }
    }
}

impl fmt::Debug for WebhookSecret {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter
            .debug_struct("WebhookSecret")
            .finish_non_exhaustive()
    }
}

/// [`WebhookSecret::new`] was given something other than a webhook signing
/// secret (`whsec_...`): the receiver's own misconfiguration, not a bad delivery.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[non_exhaustive]
pub struct InvalidWebhookSecret;

impl fmt::Display for InvalidWebhookSecret {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("invalid webhook signing secret")
    }
}

impl std::error::Error for InvalidWebhookSecret {}

/// A webhook delivery that failed verification. Answer it with `400` and do
/// not act on it.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[non_exhaustive]
pub enum WebhookVerificationError {
    /// No signature in `webhook-signature` matches the payload, or a webhook
    /// header is missing or malformed.
    InvalidSignature,
    /// `webhook-timestamp` is more than five minutes from this server's clock,
    /// in the past or the future: a replayed delivery, or a clock out of sync.
    TimestampOutOfRange,
}

impl fmt::Display for WebhookVerificationError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(match self {
            Self::InvalidSignature => "no matching webhook signature",
            Self::TimestampOutOfRange => "webhook timestamp more than five minutes away",
        })
    }
}

impl std::error::Error for WebhookVerificationError {}

/// Verify a webhook delivery's Standard Webhooks signature.
///
/// One of the `webhook-signature` signatures must be the HMAC-SHA256 of
/// `<webhook-id>.<webhook-timestamp>.<payload>` under `secret`, and
/// `webhook-timestamp` must be within five minutes of the current time. Pass
/// the request body exactly as it arrived, and the request's headers (an
/// `http::HeaderMap`, as axum and hyper provide).
pub fn verify_webhook(
    payload: &[u8],
    headers: &HeaderMap,
    secret: &WebhookSecret,
) -> Result<(), WebhookVerificationError> {
    // The library computes `now - timestamp` in i64, which overflows for an
    // extreme timestamp before any signature is checked.
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |elapsed| elapsed.as_secs());
    let outside = headers
        .get("webhook-timestamp")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.parse::<i64>().ok())
        .is_some_and(|timestamp| {
            i128::from(timestamp).abs_diff(i128::from(now)) > TOLERANCE_SECONDS
        });
    if outside {
        return Err(WebhookVerificationError::TimestampOutOfRange);
    }
    secret
        .0
        .verify(payload, headers)
        .map_err(|error| match error {
            StandardWebhookError::TimestampTooOldError
            | StandardWebhookError::FutureTimestampError => {
                WebhookVerificationError::TimestampOutOfRange
            }
            _ => WebhookVerificationError::InvalidSignature,
        })
}
