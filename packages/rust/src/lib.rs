#![forbid(unsafe_code)]

mod client;
mod config_generated;
mod webhooks;
#[allow(unused_parens)]
mod generated {
    include!("generated.rs");
}

pub use client::{DEFAULT_BASE_URL, DEFAULT_MAXIMUM_RETRY_AFTER, PhotonClientBuilder};
pub use generated::*;
pub use webhooks::{InvalidWebhookSecret, WebhookSecret, WebhookVerificationError, verify_webhook};
