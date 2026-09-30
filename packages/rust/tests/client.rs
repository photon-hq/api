use std::{
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};

mod support;

use photon_ai_api::{
    ChangePlanResponse, Client, Credential, DeviceAuthorizeError, Error,
    GetOrganizationBillingOverviewError, ListVoiceProfilesParams, PhotonClientBuilder,
    SecretString,
};
use reqwest::{
    StatusCode,
    header::{AUTHORIZATION, HeaderMap, HeaderValue},
};
use serde_json::json;
use support::request;
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::TcpListener,
    sync::Mutex,
    task::JoinHandle,
};

type TestResponse = (u16, &'static str, Vec<(&'static str, &'static str)>);

struct TestServer {
    base_url: String,
    requests: Arc<Mutex<Vec<String>>>,
    connection_count: Arc<AtomicUsize>,
    task: JoinHandle<()>,
}

impl Drop for TestServer {
    fn drop(&mut self) {
        self.task.abort();
    }
}

fn content_length(header: &[u8]) -> usize {
    String::from_utf8_lossy(header)
        .lines()
        .find_map(|line| {
            let (name, value) = line.split_once(':')?;
            name.eq_ignore_ascii_case("content-length")
                .then(|| value.trim().parse::<usize>().ok())
                .flatten()
        })
        .unwrap_or(0)
}

async fn test_server(responses: Vec<TestResponse>) -> TestServer {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    let requests = Arc::new(Mutex::new(Vec::new()));
    let connection_count = Arc::new(AtomicUsize::new(0));
    let response_index = Arc::new(AtomicUsize::new(0));
    let shared_responses = Arc::new(responses);
    let recorded_requests = requests.clone();
    let recorded_connections = connection_count.clone();

    let task = tokio::spawn(async move {
        loop {
            let Ok((mut stream, _)) = listener.accept().await else {
                return;
            };
            recorded_connections.fetch_add(1, Ordering::SeqCst);
            let requests = recorded_requests.clone();
            let response_index = response_index.clone();
            let responses = shared_responses.clone();
            tokio::spawn(async move {
                loop {
                    let mut request = Vec::new();
                    let mut chunk = [0_u8; 4096];
                    let header_end = loop {
                        let Ok(read) = stream.read(&mut chunk).await else {
                            return;
                        };
                        if read == 0 {
                            return;
                        }
                        request.extend_from_slice(&chunk[..read]);
                        if let Some(index) =
                            request.windows(4).position(|window| window == b"\r\n\r\n")
                        {
                            break index + 4;
                        }
                    };
                    let expected = header_end + content_length(&request[..header_end]);
                    while request.len() < expected {
                        let Ok(read) = stream.read(&mut chunk).await else {
                            return;
                        };
                        if read == 0 {
                            return;
                        }
                        request.extend_from_slice(&chunk[..read]);
                    }
                    requests
                        .lock()
                        .await
                        .push(String::from_utf8_lossy(&request[..expected]).into_owned());

                    let index = response_index.fetch_add(1, Ordering::SeqCst);
                    let Some((status, body, headers)) = responses.get(index) else {
                        return;
                    };
                    let reason = match status {
                        200 => "OK",
                        201 => "Created",
                        202 => "Accepted",
                        400 => "Bad Request",
                        401 => "Unauthorized",
                        503 => "Service Unavailable",
                        _ => "Test Response",
                    };
                    let extra_headers = headers
                        .iter()
                        .map(|(name, value)| format!("{name}: {value}\r\n"))
                        .collect::<String>();
                    let content_type = if headers
                        .iter()
                        .any(|(name, _)| name.eq_ignore_ascii_case("content-type"))
                    {
                        ""
                    } else {
                        "Content-Type: application/json\r\n"
                    };
                    let response = format!(
                        "HTTP/1.1 {status} {reason}\r\n{content_type}Content-Length: {}\r\nConnection: keep-alive\r\n{extra_headers}\r\n{body}",
                        body.len()
                    );
                    if stream.write_all(response.as_bytes()).await.is_err() {
                        return;
                    }
                }
            });
        }
    });

    TestServer {
        base_url: format!("http://{address}"),
        requests,
        connection_count,
        task,
    }
}

// Built from its wire form, so the test does not depend on generated type names.
fn device_token_body<T: serde::de::DeserializeOwned>() -> T {
    serde_json::from_value(json!({
        "device_code": "device-code",
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
    }))
    .expect("a valid device-code token request")
}

// The request type is inferred from `change_plan`'s signature, not named.
macro_rules! change_plan_body {
    ($category:expr, $plan_code:expr) => {
        request(|client: &Client, body| {
            drop(client.change_plan(String::new(), String::new(), String::new(), body))
        })
        .decode(json!({"category": $category, "planCode": $plan_code}))
        .expect("a valid change-plan request")
    };
}

fn authenticated_client_builder(base_url: &str) -> PhotonClientBuilder {
    PhotonClientBuilder::new().base_url(base_url).credential(
        "accountServiceKey",
        Credential::Bearer(SecretString::from("test-account-key".to_owned())),
    )
}

#[tokio::test]
async fn attachment_download_preserves_body_and_headers() {
    let body = "attachment\0é";
    let server = test_server(vec![(
        200,
        body,
        vec![
            ("Content-Type", "image/png"),
            ("X-Request-ID", "download-request"),
            ("Content-Disposition", "attachment; filename=image.png"),
        ],
    )])
    .await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();
    let response = client
        .download_attachment(
            format!("pho_att_{}", "0".repeat(26)),
            format!("pho_prj_{}", "0".repeat(26)),
        )
        .await
        .unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    assert_eq!(response.headers()["x-request-id"], "download-request");
    assert_eq!(
        response.headers()["content-disposition"],
        "attachment; filename=image.png"
    );
    assert_eq!(response.into_inner().as_ref(), body.as_bytes());
}

#[tokio::test]
async fn retries_with_per_attempt_headers_and_reuses_the_connection() {
    let server = test_server(vec![
        (503, r#"{"detail":"busy"}"#, vec![("Retry-After", "0")]),
        (503, r#"{"detail":"busy"}"#, vec![("Retry-After", "0")]),
        (200, r#"{"count":2}"#, vec![("X-Request-ID", "req_rust")]),
    ])
    .await;
    let header_attempt = Arc::new(AtomicUsize::new(0));
    let provider_attempt = header_attempt.clone();
    let client = authenticated_client_builder(&server.base_url)
        .headers(move || {
            let attempt = provider_attempt.fetch_add(1, Ordering::SeqCst) + 1;
            async move {
                let mut headers = HeaderMap::new();
                headers.insert(
                    AUTHORIZATION,
                    HeaderValue::from_str(&format!("Bearer attempt-{attempt}")).unwrap(),
                );
                headers.insert(
                    "x-attempt",
                    HeaderValue::from_str(&attempt.to_string()).unwrap(),
                );
                headers
            }
        })
        .timeout(Duration::from_secs(2))
        .build()
        .unwrap();

    let response = client
        .count_projects("organization".to_owned(), None)
        .await
        .unwrap();

    assert_eq!(response.inner().count, 2);
    assert_eq!(
        response.headers()["x-request-id"],
        HeaderValue::from_static("req_rust")
    );
    assert_eq!(header_attempt.load(Ordering::SeqCst), 3);
    assert_eq!(server.connection_count.load(Ordering::SeqCst), 1);
    let requests = server.requests.lock().await;
    assert_eq!(requests.len(), 3);
    for (index, request) in requests.iter().enumerate() {
        let request = request.to_ascii_lowercase();
        assert!(request.contains(&format!("x-attempt: {}\r\n", index + 1)));
        // Generated operation credentials take precedence over configured headers.
        assert!(request.contains("authorization: bearer test-account-key\r\n"));
        assert!(!request.contains("authorization: bearer attempt-"));
    }
}

#[tokio::test]
async fn idempotency_key_enables_mutation_retries() {
    let server = test_server(vec![
        (503, r#"{"detail":"busy"}"#, vec![("Retry-After", "0")]),
        (
            400,
            r#"{"code":"INVALID_ARGUMENT","status":400,"title":"Invalid Argument","type":"urn:photon:problem:invalid-argument"}"#,
            vec![],
        ),
    ])
    .await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();
    let body = change_plan_body!("analytics", "analytics_pro");

    let _ = client
        .change_plan(
            "idem-1".to_owned(),
            "organization".to_owned(),
            "project".to_owned(),
            &body,
        )
        .await;

    let requests = server.requests.lock().await;
    assert_eq!(requests.len(), 2);
    assert!(requests.iter().all(|request| {
        let request = request.to_ascii_lowercase();
        request.contains("idempotency-key: idem-1")
            && request.contains("authorization: bearer test-account-key")
    }));
}

#[tokio::test]
async fn configured_idempotency_key_enables_mutation_retries() {
    let server = test_server(vec![
        (503, r#"{"detail":"busy"}"#, vec![("Retry-After", "0")]),
        (503, r#"{"detail":"busy"}"#, vec![]),
    ])
    .await;
    let mut headers = HeaderMap::new();
    headers.insert("idempotency-key", HeaderValue::from_static("global-1"));
    let client = PhotonClientBuilder::new()
        .base_url(&server.base_url)
        .static_headers(headers)
        .max_attempts(2)
        .build()
        .unwrap();

    let _ = client.device_token(&device_token_body()).await;

    let requests = server.requests.lock().await;
    assert_eq!(requests.len(), 2);
    assert!(requests.iter().all(|request| {
        request
            .to_ascii_lowercase()
            .contains("idempotency-key: global-1")
    }));
}

#[tokio::test]
async fn retry_after_beyond_the_cap_returns_the_response_without_waiting() {
    let server = test_server(vec![
        (503, r#"{"detail":"busy"}"#, vec![("Retry-After", "3600")]),
        (200, r#"{"count":2}"#, vec![]),
    ])
    .await;
    let client = authenticated_client_builder(&server.base_url)
        .maximum_retry_after(Duration::from_secs(1))
        .build()
        .unwrap();

    let started = std::time::Instant::now();
    let result = client.count_projects("organization".to_owned(), None).await;

    assert!(result.is_err());
    assert!(started.elapsed() < Duration::from_secs(5));
    assert_eq!(server.requests.lock().await.len(), 1);
}

#[tokio::test]
async fn unsafe_mutation_does_not_retry() {
    let server = test_server(vec![
        (503, r#"{"detail":"busy"}"#, vec![("Retry-After", "0")]),
        (200, r#"{}"#, vec![]),
    ])
    .await;
    let client = PhotonClientBuilder::new()
        .base_url(&server.base_url)
        .build()
        .unwrap();

    let error = client.device_token(&device_token_body()).await.unwrap_err();

    // Whether the contract documents a 503 body decides how the error is classified; either
    // way the mutation is sent once and never retried.
    assert!(matches!(
        error,
        Error::UnexpectedStatus { .. } | Error::Api(_) | Error::Decode { .. }
    ));
    assert_eq!(server.requests.lock().await.len(), 1);
}

#[tokio::test]
async fn transport_failures_are_not_retried() {
    let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let base_url = format!("http://{}", listener.local_addr().unwrap());
    drop(listener);
    let header_attempt = Arc::new(AtomicUsize::new(0));
    let provider_attempt = header_attempt.clone();
    let client = authenticated_client_builder(&base_url)
        .headers(move || {
            provider_attempt.fetch_add(1, Ordering::SeqCst);
            async { HeaderMap::new() }
        })
        .timeout(Duration::from_secs(1))
        .build()
        .unwrap();

    let _connection_error = client
        .count_projects("organization".to_owned(), None)
        .await
        .unwrap_err();

    assert_eq!(header_attempt.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn documented_errors_are_typed_and_device_token_uses_json() {
    let server = test_server(vec![(
        400,
        r#"{"error":"authorization_pending","error_description":"wait"}"#,
        vec![("X-Request-ID", "req_device")],
    )])
    .await;
    let client = PhotonClientBuilder::new()
        .base_url(&server.base_url)
        .build()
        .unwrap();

    let error = client.device_token(&device_token_body()).await.unwrap_err();

    match error {
        Error::Api(response) => {
            assert_eq!(response.status(), StatusCode::BAD_REQUEST);
            assert_eq!(response.headers()["x-request-id"], "req_device");
            // The OAuth error body, whatever the contract names its type.
            assert!(format!("{:?}", response.inner()).contains(r#""authorization_pending""#));
        }
        other => panic!("expected typed API error, got {other:?}"),
    }
    let requests = server.requests.lock().await;
    assert_eq!(requests.len(), 1);
    let request = requests[0].to_ascii_lowercase();
    assert!(request.contains("content-type: application/json"));
    assert!(request.contains(r#""grant_type":"urn:ietf:params:oauth:grant-type:device_code""#));
}

#[tokio::test]
async fn billing_errors_preserve_authorization_problem_bodies() {
    for (status, body, content_type) in [
        (
            401,
            r#"{"code":"NOT_AUTHENTICATED","status":401,"title":"Not Authenticated","type":"https://photon.codes/docs/problems/not-authenticated"}"#,
            "application/problem+json",
        ),
        (
            403,
            r#"{"code":"INSUFFICIENT_SCOPE","status":403,"title":"Insufficient Scope","type":"https://photon.codes/docs/problems/insufficient-scope"}"#,
            "application/problem+json",
        ),
        (
            500,
            r#"{"code":"INTERNAL_ERROR","status":500,"title":"Internal Server Error","type":"https://photon.codes/docs/problems/internal-error"}"#,
            "application/problem+json",
        ),
        (
            503,
            r#"{"code":"UPSTREAM_UNAVAILABLE","status":503,"title":"Upstream Service Unavailable","type":"https://photon.codes/docs/problems/upstream-unavailable"}"#,
            "application/problem+json",
        ),
        (
            403,
            r#"{"code":"FORBIDDEN","status":403,"title":"Forbidden","type":"https://photon.codes/docs/problems/forbidden"}"#,
            "application/problem+json",
        ),
    ] {
        let server = test_server(vec![(
            status,
            body,
            vec![
                ("Content-Type", content_type),
                ("X-Request-ID", "error-request"),
            ],
        )])
        .await;
        let client = PhotonClientBuilder::new()
            .base_url(&server.base_url)
            .max_attempts(1)
            .credential(
                "oauth2",
                Credential::Bearer(SecretString::from("test-oauth-token".to_owned())),
            )
            .build()
            .unwrap();
        let error = client
            .get_organization_billing_overview(format!("pho_org_{}", "0".repeat(26)))
            .await
            .unwrap_err();
        let Error::Api(response) = error else {
            panic!("expected a typed API error, got {error:?}")
        };
        assert_eq!(response.status().as_u16(), status);
        assert_eq!(response.headers()["x-request-id"], "error-request");
        let decoded = match response.into_inner() {
            GetOrganizationBillingOverviewError::Status401(value) => {
                serde_json::to_value(value).unwrap()
            }
            GetOrganizationBillingOverviewError::Status403(value) => {
                serde_json::to_value(value).unwrap()
            }
            GetOrganizationBillingOverviewError::Status500(value) => {
                serde_json::to_value(value).unwrap()
            }
            GetOrganizationBillingOverviewError::Status503(value) => {
                serde_json::to_value(value).unwrap()
            }
            other => panic!("unexpected error status: {other:?}"),
        };
        assert_eq!(
            decoded,
            serde_json::from_str::<serde_json::Value>(body).unwrap()
        );
        assert_eq!(server.requests.lock().await.len(), 1);
    }
}

#[tokio::test]
async fn malformed_billing_errors_still_fail_decoding() {
    let server = test_server(vec![(403, r#"{"unrelated":"not an error body"}"#, vec![])]).await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();
    let error = client
        .get_organization_billing_overview(format!("pho_org_{}", "0".repeat(26)))
        .await
        .unwrap_err();
    assert!(matches!(error, Error::Decode { .. }));
}

#[tokio::test]
async fn alternate_success_statuses_return_typed_variants() {
    let server = test_server(vec![
        (
            200,
            r#"{"failure":null,"kind":"change_plan","operationId":"op_1","resolvedAt":"now","result":{"type":"version","version":"pro"},"status":"succeeded","submittedAt":null}"#,
            vec![],
        ),
        (
            202,
            r#"{"failure":null,"kind":"change_plan","operationId":"op_2","resolvedAt":null,"result":null,"status":"pending","submittedAt":null}"#,
            vec![],
        ),
    ])
    .await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();
    let body = change_plan_body!("analytics", "analytics_pro");

    let completed = client
        .change_plan(
            "idem-200".to_owned(),
            "organization".to_owned(),
            "project".to_owned(),
            &body,
        )
        .await
        .unwrap();
    let pending = client
        .change_plan(
            "idem-202".to_owned(),
            "organization".to_owned(),
            "project".to_owned(),
            &body,
        )
        .await
        .unwrap();

    assert!(matches!(
        completed.inner(),
        ChangePlanResponse::Status200(_)
    ));
    assert!(matches!(pending.inner(), ChangePlanResponse::Status202(_)));
}

#[tokio::test]
async fn undocumented_status_retains_raw_body() {
    let server = test_server(vec![(418, r#"{"error":"teapot"}"#, vec![])]).await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();

    let error = client
        .count_projects("organization".to_owned(), None)
        .await
        .unwrap_err();

    match error {
        Error::UnexpectedStatus { status, body, .. } => {
            assert_eq!(status, StatusCode::IM_A_TEAPOT);
            assert!(String::from_utf8_lossy(&body).contains("teapot"));
        }
        other => panic!("expected unexpected-status error, got {other:?}"),
    }
}

#[tokio::test]
async fn declared_bodiless_error_status_is_a_typed_api_error() {
    let server = test_server(vec![(400, "", vec![("X-Request-ID", "device-400")])]).await;
    let client = authenticated_client_builder(&server.base_url)
        .max_attempts(1)
        .build()
        .unwrap();

    // The contract declares a bodiless 400, so it is an `Error::Api` variant
    // like the documented problem+json statuses (see the billing overview test).
    match client.device_authorize().await.unwrap_err() {
        Error::Api(value) => {
            assert_eq!(value.status(), StatusCode::BAD_REQUEST);
            assert_eq!(value.headers()["x-request-id"], "device-400");
            assert!(matches!(
                value.into_inner(),
                DeviceAuthorizeError::Status400
            ));
        }
        other => panic!("expected a documented 400, got {other:?}"),
    }
}

#[tokio::test]
async fn a_parameter_named_default_keeps_params_default_callable() {
    let server = test_server(vec![(200, r#"{"profiles":[]}"#, vec![])]).await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();
    // The `default` query parameter's setter is `default_`, so it does not
    // shadow `Default::default`.
    // The enum's name depends on the contract; build its "true" value by value.
    let params = ListVoiceProfilesParams::default()
        .default_(serde_json::from_value(json!("true")).unwrap())
        .page_size(10);

    client
        .list_voice_profiles("project".to_owned(), Some(params))
        .await
        .unwrap();

    let requests = server.requests.lock().await;
    assert!(
        requests[0].starts_with(
            "GET /v1/projects/project/platforms/voice/profiles?default=true&pageSize=10 "
        ),
        "{}",
        requests[0]
    );
}

#[tokio::test]
async fn malformed_success_json_retains_the_body_as_a_decode_error() {
    let server = test_server(vec![(
        200,
        r#"{"count":}"#,
        vec![("X-Request-ID", "malformed-success")],
    )])
    .await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();

    let error = client
        .count_projects("organization".to_owned(), None)
        .await
        .unwrap_err();

    match error {
        Error::Decode {
            status,
            headers,
            path,
            body,
            truncated,
        } => {
            assert_eq!(status, StatusCode::OK);
            assert_eq!(headers["x-request-id"], "malformed-success");
            assert!(!path.is_empty());
            assert_eq!(body.as_ref(), br#"{"count":}"#);
            assert!(!truncated);
        }
        other => panic!("expected decode error, got {other:?}"),
    }
}

#[tokio::test]
async fn malformed_error_json_is_capped_for_forensics() {
    let oversized: &'static str = Box::leak("x".repeat(70_000).into_boxed_str());
    let server = test_server(vec![(400, oversized, vec![])]).await;
    let client = PhotonClientBuilder::new()
        .base_url(&server.base_url)
        .build()
        .unwrap();

    let error = client.device_token(&device_token_body()).await.unwrap_err();

    match error {
        Error::Decode {
            status,
            body,
            truncated,
            ..
        } => {
            assert_eq!(status, StatusCode::BAD_REQUEST);
            assert_eq!(body.len(), 64 * 1024);
            assert!(truncated);
        }
        other => panic!("expected capped decode error, got {other:?}"),
    }
}

#[tokio::test]
async fn validation_only_constraints_do_not_block_outbound_requests() {
    let server = test_server(vec![(
        400,
        r#"{"code":"INVALID_ARGUMENT","status":400,"title":"Invalid Argument","type":"urn:photon:problem:invalid-argument"}"#,
        vec![],
    )])
    .await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();
    let body = change_plan_body!("analytics", "");

    let _ = client
        .change_plan(
            "idem-empty".to_owned(),
            "organization".to_owned(),
            "project".to_owned(),
            &body,
        )
        .await;

    let requests = server.requests.lock().await;
    assert_eq!(requests.len(), 1);
    assert!(requests[0].contains(r#""planCode":"""#));
}

#[tokio::test]
async fn attachment_download_preserves_json_file_bytes_and_metadata() {
    let body = "{ \"file\": true }\n";
    let server = test_server(vec![(
        200,
        body,
        vec![
            ("X-Request-ID", "raw-file"),
            ("Content-Disposition", "attachment; filename=test.json"),
        ],
    )])
    .await;
    let client = authenticated_client_builder(&server.base_url)
        .build()
        .unwrap();
    let response = client
        .download_attachment(
            "pho_att_00000000000000000000000000".to_owned(),
            "pho_prj_00000000000000000000000000".to_owned(),
        )
        .await
        .unwrap();
    assert_eq!(response.inner().as_ref(), body.as_bytes());
    assert_eq!(response.headers()["x-request-id"], "raw-file");
    assert_eq!(
        response.headers()["content-disposition"],
        "attachment; filename=test.json"
    );
}
