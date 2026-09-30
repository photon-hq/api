use std::{
    convert::Infallible,
    fmt,
    future::Future,
    pin::Pin,
    sync::Arc,
    time::{Duration, SystemTime},
};

use reqwest::{
    Method, Request, Response, StatusCode,
    header::{HeaderMap, RETRY_AFTER},
};

use crate::{Client, Credential, Error, ExecuteFuture, HttpBackend, TransportError};

pub use crate::config_generated::DEFAULT_BASE_URL;

type HeaderFuture = Pin<Box<dyn Future<Output = HeaderMap> + Send>>;
type DynamicHeaders = dyn Fn() -> HeaderFuture + Send + Sync;

#[derive(Clone, Default)]
enum HeaderProvider {
    #[default]
    None,
    Static(HeaderMap),
    Dynamic(Arc<DynamicHeaders>),
}

impl HeaderProvider {
    async fn get(&self) -> HeaderMap {
        match self {
            Self::None => HeaderMap::new(),
            Self::Static(headers) => headers.clone(),
            Self::Dynamic(provider) => provider().await,
        }
    }
}

#[derive(Clone)]
struct PhotonBackend {
    client: reqwest::Client,
    headers: HeaderProvider,
    timeout: Duration,
    max_attempts: usize,
    base_delay: Duration,
    maximum_delay: Duration,
    maximum_retry_after: Duration,
}

/// Longest server-requested `Retry-After` delay honoured by default.
pub const DEFAULT_MAXIMUM_RETRY_AFTER: Duration = Duration::from_secs(60);

impl fmt::Debug for PhotonBackend {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter
            .debug_struct("PhotonBackend")
            .field("timeout", &self.timeout)
            .field("max_attempts", &self.max_attempts)
            .field("base_delay", &self.base_delay)
            .field("maximum_delay", &self.maximum_delay)
            .field("maximum_retry_after", &self.maximum_retry_after)
            .finish_non_exhaustive()
    }
}

impl PhotonBackend {
    async fn execute_request(self, request: Request) -> Result<Response, TransportError> {
        let template = request.try_clone();
        let mut attempts = 1;
        let mut first = Some(request);
        let mut attempt = 0;

        while attempt < attempts {
            attempt += 1;
            let mut request = if attempt == 1 {
                first.take().expect("first request is available")
            } else if let Some(request) = template.as_ref().and_then(Request::try_clone) {
                request
            } else {
                break;
            };
            *request.timeout_mut() = Some(self.timeout);
            let configured_headers = self.headers.get().await;
            merge_configured_headers(&mut request, &configured_headers);
            if attempt == 1 && template.is_some() && can_retry(&request) {
                // Decided once configured headers are merged, so an
                // Idempotency-Key from the client-wide headers enables retries too.
                attempts = self.max_attempts;
            }

            let result = self.client.execute(request).await;
            let retry =
                attempt < attempts && retryable_outcome(result.as_ref().ok().map(Response::status));
            match result {
                Ok(response) if retry => {
                    let Some(delay) =
                        retry_delay(retry_after(&response), self.maximum_retry_after, || {
                            jitter(&self, attempt)
                        })
                    else {
                        return Ok(response);
                    };
                    let _ = response.bytes().await;
                    tokio::time::sleep(delay).await;
                }
                Ok(response) => return Ok(response),
                Err(source) => return Err(TransportError::new(source)),
            }
        }

        unreachable!("the first attempt always returns or advances to a retry")
    }
}

impl HttpBackend for PhotonBackend {
    fn execute(&self, request: Request) -> ExecuteFuture<'_> {
        let backend = self.clone();
        Box::pin(async move { backend.execute_request(request).await })
    }
}

#[derive(Clone)]
pub struct PhotonClientBuilder {
    base_url: String,
    headers: HeaderProvider,
    credentials: Vec<(String, Credential)>,
    timeout: Duration,
    max_attempts: usize,
    base_delay: Duration,
    maximum_delay: Duration,
    maximum_retry_after: Duration,
    client: Option<reqwest::Client>,
}

impl fmt::Debug for PhotonClientBuilder {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter
            .debug_struct("PhotonClientBuilder")
            .field("base_url", &self.base_url)
            .field("credential_count", &self.credentials.len())
            .field("timeout", &self.timeout)
            .field("max_attempts", &self.max_attempts)
            .field("base_delay", &self.base_delay)
            .field("maximum_delay", &self.maximum_delay)
            .field("maximum_retry_after", &self.maximum_retry_after)
            .field("has_custom_client", &self.client.is_some())
            .finish_non_exhaustive()
    }
}

impl Default for PhotonClientBuilder {
    fn default() -> Self {
        Self {
            base_url: DEFAULT_BASE_URL.to_owned(),
            headers: HeaderProvider::None,
            credentials: Vec::new(),
            timeout: Duration::from_secs(30),
            max_attempts: 3,
            base_delay: Duration::from_millis(250),
            maximum_delay: Duration::from_secs(2),
            maximum_retry_after: DEFAULT_MAXIMUM_RETRY_AFTER,
            client: None,
        }
    }
}

impl PhotonClientBuilder {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn base_url(mut self, base_url: impl Into<String>) -> Self {
        self.base_url = base_url.into().trim_end_matches('/').to_owned();
        self
    }

    pub fn static_headers(mut self, headers: HeaderMap) -> Self {
        self.headers = HeaderProvider::Static(headers);
        self
    }

    pub fn headers<F, Fut>(mut self, provider: F) -> Self
    where
        F: Fn() -> Fut + Send + Sync + 'static,
        Fut: Future<Output = HeaderMap> + Send + 'static,
    {
        self.headers = HeaderProvider::Dynamic(Arc::new(move || Box::pin(provider())));
        self
    }

    /// Register a credential under an OpenAPI security-scheme name.
    ///
    /// The scheme name must match a key in `components.securitySchemes`. The
    /// generated client validates operation security requirements before the
    /// transport backend runs, so credentials must be registered here rather
    /// than supplied only through [`Self::static_headers`] or [`Self::headers`].
    pub fn credential(mut self, scheme: impl Into<String>, credential: Credential) -> Self {
        self.credentials.push((scheme.into(), credential));
        self
    }

    pub fn timeout(mut self, timeout: Duration) -> Self {
        self.timeout = timeout;
        self
    }

    pub fn max_attempts(mut self, max_attempts: usize) -> Self {
        self.max_attempts = max_attempts.clamp(1, 3);
        self
    }

    /// Longest server-requested `Retry-After` delay to wait for before a retry
    /// (default 60 seconds). A longer delay is not shortened: the client stops
    /// retrying and returns that response.
    pub fn maximum_retry_after(mut self, maximum_retry_after: Duration) -> Self {
        self.maximum_retry_after = maximum_retry_after;
        self
    }

    pub fn reqwest_client(mut self, client: reqwest::Client) -> Self {
        self.client = Some(client);
        self
    }

    // Keep Spargen's native error type in the public builder contract.
    #[allow(clippy::result_large_err)]
    pub fn build(self) -> Result<Client, Error<Infallible>> {
        let client = match self.client {
            Some(client) => client,
            None => reqwest::Client::builder()
                .connect_timeout(self.timeout)
                .timeout(self.timeout)
                .build()
                .map_err(Error::<Infallible>::request_construction)?,
        };
        let backend = PhotonBackend {
            client,
            headers: self.headers,
            timeout: self.timeout,
            max_attempts: self.max_attempts,
            base_delay: self.base_delay,
            maximum_delay: self.maximum_delay,
            maximum_retry_after: self.maximum_retry_after,
        };
        let mut client = Client::with_backend(Arc::new(backend), &self.base_url)?;
        for (scheme, credential) in self.credentials {
            client = client.with_credential(&scheme, credential);
        }
        Ok(client)
    }
}

fn can_retry(request: &Request) -> bool {
    matches!(
        *request.method(),
        Method::GET | Method::HEAD | Method::OPTIONS | Method::TRACE
    ) || request.headers().contains_key("idempotency-key")
}

fn retryable_status(status: StatusCode) -> bool {
    matches!(status.as_u16(), 408 | 429 | 502 | 503 | 504)
}

fn retryable_outcome(status: Option<StatusCode>) -> bool {
    status.is_some_and(retryable_status)
}

fn merge_configured_headers(request: &mut Request, configured: &HeaderMap) {
    for (name, value) in configured {
        if !request.headers().contains_key(name) {
            request.headers_mut().insert(name, value.clone());
        }
    }
}

fn retry_after(response: &Response) -> Option<Duration> {
    let value = response.headers().get(RETRY_AFTER)?.to_str().ok()?;
    parse_retry_after(value, SystemTime::now())
}

fn parse_retry_after(value: &str, now: SystemTime) -> Option<Duration> {
    if let Ok(seconds) = value.parse::<u64>() {
        return Some(Duration::from_secs(seconds));
    }
    let retry_at = httpdate::parse_http_date(value).ok()?;
    Some(retry_at.duration_since(now).unwrap_or(Duration::ZERO))
}

/// The delay before the next attempt, or `None` when the server asked for a
/// longer wait than `maximum_retry_after` and the response should be returned.
fn retry_delay(
    retry_after: Option<Duration>,
    maximum_retry_after: Duration,
    jitter: impl FnOnce() -> Duration,
) -> Option<Duration> {
    match retry_after {
        Some(delay) if delay > maximum_retry_after => None,
        Some(delay) => Some(delay),
        None => Some(jitter()),
    }
}

fn backoff_ceiling(backend: &PhotonBackend, attempt: usize) -> Duration {
    backend
        .base_delay
        .saturating_mul(1_u32 << (attempt - 1).min(8))
        .min(backend.maximum_delay)
}

fn jitter(backend: &PhotonBackend, attempt: usize) -> Duration {
    let ceiling = backoff_ceiling(backend, attempt);
    Duration::from_secs_f64(rand::random_range(0.0..=ceiling.as_secs_f64()))
}

#[cfg(test)]
mod tests {
    use crate::SecretString;
    use reqwest::header::{AUTHORIZATION, HeaderValue};

    use super::*;

    #[test]
    fn retries_safe_requests_and_idempotent_mutations_only() {
        let get = Request::new(Method::GET, "https://example.test".parse().unwrap());
        assert!(can_retry(&get));

        let post = Request::new(Method::POST, "https://example.test".parse().unwrap());
        assert!(!can_retry(&post));

        let mut idempotent_post =
            Request::new(Method::POST, "https://example.test".parse().unwrap());
        idempotent_post
            .headers_mut()
            .insert("idempotency-key", "stable-key".parse().unwrap());
        assert!(can_retry(&idempotent_post));
    }

    #[test]
    fn retry_statuses_match_the_transport_contract() {
        for status in [408, 429, 502, 503, 504] {
            assert!(retryable_status(StatusCode::from_u16(status).unwrap()));
        }
        for status in [400, 401, 409, 500, 501, 505] {
            assert!(!retryable_status(StatusCode::from_u16(status).unwrap()));
        }
        assert!(
            !retryable_outcome(None),
            "transport failures are not retried"
        );
    }

    #[test]
    fn retry_after_and_full_jitter_match_the_transport_contract() {
        let now = SystemTime::UNIX_EPOCH + Duration::from_secs(1_000_000);
        assert_eq!(parse_retry_after("3", now), Some(Duration::from_secs(3)));
        let retry_at = httpdate::fmt_http_date(now + Duration::from_secs(5));
        assert_eq!(
            parse_retry_after(&retry_at, now),
            Some(Duration::from_secs(5))
        );
        assert_eq!(parse_retry_after("not-a-date", now), None);

        let backend = PhotonBackend {
            client: reqwest::Client::new(),
            headers: HeaderProvider::None,
            timeout: Duration::from_secs(30),
            max_attempts: 3,
            base_delay: Duration::from_millis(250),
            maximum_delay: Duration::from_secs(2),
            maximum_retry_after: DEFAULT_MAXIMUM_RETRY_AFTER,
        };
        for (attempt, expected) in [250, 500, 1_000, 2_000, 2_000].into_iter().enumerate() {
            let attempt = attempt + 1;
            let ceiling = Duration::from_millis(expected);
            assert_eq!(backoff_ceiling(&backend, attempt), ceiling);
            assert!(jitter(&backend, attempt) <= ceiling);
        }
    }

    #[test]
    fn retry_after_is_capped_without_shortening_the_server_delay() {
        let cap = Duration::from_secs(60);
        let fallback = || Duration::from_millis(7);
        assert_eq!(
            retry_delay(Some(Duration::from_secs(60)), cap, fallback),
            Some(Duration::from_secs(60))
        );
        assert_eq!(
            retry_delay(Some(Duration::from_secs(61)), cap, fallback),
            None
        );
        assert_eq!(
            retry_delay(Some(Duration::from_secs(u64::MAX)), cap, fallback),
            None
        );
        assert_eq!(
            retry_delay(None, cap, fallback),
            Some(Duration::from_millis(7))
        );
        assert_eq!(
            PhotonClientBuilder::new().maximum_retry_after,
            DEFAULT_MAXIMUM_RETRY_AFTER
        );
        assert_eq!(
            PhotonClientBuilder::new()
                .maximum_retry_after(Duration::from_secs(5))
                .maximum_retry_after,
            Duration::from_secs(5)
        );
    }

    #[test]
    fn operation_headers_take_precedence_over_configured_headers() {
        let mut request = Request::new(Method::GET, "https://example.test".parse().unwrap());
        request
            .headers_mut()
            .insert(AUTHORIZATION, HeaderValue::from_static("operation"));
        let mut configured = HeaderMap::new();
        configured.insert(AUTHORIZATION, HeaderValue::from_static("configured"));
        configured.insert("x-extra", HeaderValue::from_static("value"));

        merge_configured_headers(&mut request, &configured);

        assert_eq!(request.headers()[AUTHORIZATION], "operation");
        assert_eq!(request.headers()["x-extra"], "value");
    }

    #[test]
    fn registers_credentials_for_arbitrary_security_schemes() {
        let client = PhotonClientBuilder::new()
            .credential(
                "futureSecurityScheme",
                Credential::ApiKey(SecretString::from("test-secret".to_owned())),
            )
            .build()
            .unwrap();

        assert!(client.core().credential("futureSecurityScheme").is_some());
    }
}
