#![forbid(unsafe_code)]

mod client;
mod config_generated;
#[allow(unused_parens)]
mod generated {
    include!("generated.rs");
}

pub use client::{DEFAULT_BASE_URL, DEFAULT_MAXIMUM_RETRY_AFTER, PhotonClientBuilder};
pub use generated::*;
