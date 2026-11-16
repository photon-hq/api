//! Webhook verification against deliveries signed with the Standard Webhooks
//! reference signer, which `signer_matches_the_reference_vector` checks first.

use std::time::{SystemTime, UNIX_EPOCH};

use photon_ai_api::{
    InvalidWebhookSecret, WebhookSecret, WebhookVerificationError, verify_webhook,
};
use reqwest::header::{HeaderMap, HeaderValue};
use standardwebhooks::Webhook;

const EVENT_ID: &str = "pho_evt_00000000000000000000000001";
const BODY: &[u8] =
    r#"{"id":"pho_evt_00000000000000000000000001","type":"message.received","text":"Hello 🌍"}"#
        .as_bytes();
// Synthetic 32-byte keys, base64 of bytes 1..=32 and 33..=64.
const PREVIOUS: &str = "whsec_AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA=";
const CURRENT: &str = "whsec_ISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0A=";

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

fn secret(value: &str) -> WebhookSecret {
    WebhookSecret::new(value).unwrap()
}

fn delivery(secrets: &[&str], timestamp: i64, body: &[u8]) -> HeaderMap {
    let signature = secrets
        .iter()
        .map(|secret| {
            Webhook::new(secret)
                .unwrap()
                .sign(EVENT_ID, timestamp, body)
                .unwrap()
        })
        .collect::<Vec<_>>()
        .join(" ");
    let mut headers = HeaderMap::new();
    headers.insert("webhook-id", HeaderValue::from_static(EVENT_ID));
    headers.insert("webhook-timestamp", timestamp.to_string().parse().unwrap());
    headers.insert("webhook-signature", signature.parse().unwrap());
    headers
}

#[test]
fn signer_matches_the_reference_vector() {
    // The known-answer vector of the Standard Webhooks reference libraries' tests.
    let signature = Webhook::new("whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw")
        .unwrap()
        .sign(
            "msg_p5jXN8AQM9LWM0D4loKWxJek",
            1614265330,
            br#"{"test": 2432232314}"#,
        )
        .unwrap();
    assert_eq!(signature, "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE=");
}

#[test]
fn verifies_a_delivery_signed_with_the_destination_secret() {
    let headers = delivery(&[CURRENT], now(), BODY);
    assert_eq!(verify_webhook(BODY, &headers, &secret(CURRENT)), Ok(()));
}

#[test]
fn rejects_a_bad_signature() {
    let current = secret(CURRENT);
    let headers = delivery(&[CURRENT], now(), BODY);
    let changed = String::from_utf8(BODY.to_vec())
        .unwrap()
        .replace("Hello", "Hullo");
    assert_eq!(
        verify_webhook(changed.as_bytes(), &headers, &current),
        Err(WebhookVerificationError::InvalidSignature)
    );
    assert_eq!(
        verify_webhook(BODY, &headers, &secret(PREVIOUS)),
        Err(WebhookVerificationError::InvalidSignature)
    );
    let mut forged = headers.clone();
    forged.insert(
        "webhook-signature",
        HeaderValue::from_static("v1,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="),
    );
    assert_eq!(
        verify_webhook(BODY, &forged, &current),
        Err(WebhookVerificationError::InvalidSignature)
    );
    let mut other_scheme = headers.clone();
    let signature = headers["webhook-signature"]
        .to_str()
        .unwrap()
        .replace("v1,", "v2,");
    other_scheme.insert("webhook-signature", signature.parse().unwrap());
    assert_eq!(
        verify_webhook(BODY, &other_scheme, &current),
        Err(WebhookVerificationError::InvalidSignature)
    );
}

#[test]
fn rejects_a_timestamp_more_than_five_minutes_away() {
    let current = secret(CURRENT);
    for offset in [-301, 301] {
        let outside = delivery(&[CURRENT], now() + offset, BODY);
        assert_eq!(
            verify_webhook(BODY, &outside, &current),
            Err(WebhookVerificationError::TimestampOutOfRange)
        );
    }
    for offset in [-290, 290] {
        let inside = delivery(&[CURRENT], now() + offset, BODY);
        assert_eq!(verify_webhook(BODY, &inside, &current), Ok(()));
    }
    let mut unreadable = delivery(&[CURRENT], now(), BODY);
    unreadable.insert("webhook-timestamp", HeaderValue::from_static("yesterday"));
    assert_eq!(
        verify_webhook(BODY, &unreadable, &current),
        Err(WebhookVerificationError::InvalidSignature)
    );
}

#[test]
fn rejects_an_extreme_timestamp_without_a_valid_signature() {
    let current = secret(CURRENT);
    for timestamp in ["-9223372036854775808", "9223372036854775807"] {
        let mut headers = delivery(&[CURRENT], now(), BODY);
        headers.insert("webhook-timestamp", HeaderValue::from_static(timestamp));
        headers.insert(
            "webhook-signature",
            HeaderValue::from_static("v1,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="),
        );
        assert_eq!(
            verify_webhook(BODY, &headers, &current),
            Err(WebhookVerificationError::TimestampOutOfRange)
        );
    }
}

#[test]
fn accepts_either_secret_during_a_rotation_and_only_the_new_one_after_it() {
    // While both keys are valid, Photon signs with each of them in one header.
    let both = delivery(&[PREVIOUS, CURRENT], now(), BODY);
    assert_eq!(verify_webhook(BODY, &both, &secret(CURRENT)), Ok(()));
    assert_eq!(verify_webhook(BODY, &both, &secret(PREVIOUS)), Ok(()));
    // Once the previous key expires, Photon signs with the new one alone.
    let after = delivery(&[CURRENT], now(), BODY);
    assert_eq!(
        verify_webhook(BODY, &after, &secret(PREVIOUS)),
        Err(WebhookVerificationError::InvalidSignature)
    );
    // A timestamp failure is reported as such, not as a signature mismatch.
    let old = delivery(&[PREVIOUS, CURRENT], now() - 301, BODY);
    assert_eq!(
        verify_webhook(BODY, &old, &secret(CURRENT)),
        Err(WebhookVerificationError::TimestampOutOfRange)
    );
}

#[test]
fn rejects_missing_headers_and_a_body_that_is_not_utf8() {
    let current = secret(CURRENT);
    for name in ["webhook-id", "webhook-timestamp", "webhook-signature"] {
        let mut headers = delivery(&[CURRENT], now(), BODY);
        headers.remove(name);
        assert_eq!(
            verify_webhook(BODY, &headers, &current),
            Err(WebhookVerificationError::InvalidSignature)
        );
    }
    let body = b"{\xff}";
    let mut headers = delivery(&[CURRENT], now(), BODY);
    headers.insert("webhook-signature", HeaderValue::from_static("v1,AAAA"));
    assert_eq!(
        verify_webhook(body, &headers, &current),
        Err(WebhookVerificationError::InvalidSignature)
    );
}

#[test]
fn rejects_a_missing_or_malformed_secret_before_any_delivery() {
    for value in ["", "pho_sk_api_key", "whsec_", "whsec_not base64!"] {
        let error: InvalidWebhookSecret = WebhookSecret::new(value).unwrap_err();
        assert_eq!(error.to_string(), "invalid webhook signing secret");
    }
    // The secret's key never reaches a log through Debug.
    assert_eq!(format!("{:?}", secret(CURRENT)), "WebhookSecret { .. }");
}
