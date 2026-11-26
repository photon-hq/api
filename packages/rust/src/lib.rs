#![forbid(unsafe_code)]

mod client;
mod config_generated;
mod upload;
mod webhooks;
#[allow(unused_parens)]
mod generated {
    include!("generated.rs");

    impl Client {
        /// A client that sends `options` with each of its calls, sharing this
        /// client's connection pool, retries and credentials. Use it for one
        /// call, as in `client.with_request_options(options).get_project(id)`.
        #[must_use]
        pub fn with_request_options(&self, options: crate::RequestOptions) -> Self {
            let mut core = self.core.clone();
            core.set_backend(options.layer(core.backend().clone()));
            Self { core }
        }
    }
}

pub use client::{
    DEFAULT_BASE_URL, DEFAULT_MAXIMUM_RETRY_AFTER, PhotonClientBuilder, RequestOptions,
};
pub use generated::*;
pub use upload::UploadFile;
pub use webhooks::{InvalidWebhookSecret, WebhookSecret, WebhookVerificationError, verify_webhook};
