//! Compiled only with the `blocking` feature; CI type-checks it with
//! `cargo check -p photonhq-api --features blocking --all-targets`.
#![cfg(feature = "blocking")]

use photon_ai_api::BlockingClient;

#[test]
fn blocking_client_builds_on_a_plain_thread() {
    let client = BlockingClient::new("https://api.example.invalid").unwrap();
    assert_eq!(
        client.inner().core().base_url().as_str(),
        "https://api.example.invalid/"
    );
}
