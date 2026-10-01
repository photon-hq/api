# photonhq-api

Rust client for the Photon API, generated from the public OpenAPI contract.
Requires Rust 1.88+. The Cargo package is `photonhq-api`; the library is
`photon_ai_api`.

## Installation

```sh
cargo add photonhq-api
```

The client is async and runs on Tokio.

## Quickstart

```rust,no_run
use photon_ai_api::{Credential, PhotonClientBuilder, SecretString};

async fn count_projects() -> Result<(), Box<dyn std::error::Error>> {
    let token = std::env::var("PHOTON_API_TOKEN")?;
    let organization_id = std::env::var("PHOTON_ORGANIZATION_ID")?;
    let client = PhotonClientBuilder::new()
        .credential("accountServiceKey", Credential::Bearer(SecretString::from(token)))
        .build()?;
    let result = client
        .count_projects(organization_id, None)
        .await
        .map_err(|error| format!("Project count failed: {error:?}"))?;
    println!("{}", result.inner().count);
    Ok(())
}
```

`countProjects` accepts an Account Service Key (scheme `accountServiceKey`) or an
Organization Service Identity API key / M2M access token (scheme
`serviceIdentityBearer`). Set `PHOTON_API_TOKEN` to one of those credentials and
register it under the matching scheme name, and set `PHOTON_ORGANIZATION_ID` to
the ID of an organization it can access. See the Photon dashboard and
documentation to create credentials and find IDs.

## Authentication

Credentials are registered by OpenAPI security-scheme name with
`PhotonClientBuilder::credential` (or `Client::with_credential`). Before sending,
the client checks the operation's `security` requirement against the registered
credentials and returns `Error::RequestConstruction` without sending anything if
none match. An `Authorization` header set through `static_headers` or `headers`
does not satisfy this check.

| Credential | Register under | Notes |
| --- | --- | --- |
| Account Service Key (`pho_ask_...`) | `"accountServiceKey"` | Acts as the account and reaches every route the account can. |
| Project API key (`pho_sk_...`) | `"projectApiKey"` | Bound to one project. Accepted only under `/v1/projects/{projectId}`. |
| Organization Service Identity API key or M2M access token | `"serviceIdentityBearer"` | Restricted to its organization and explicitly granted permissions. Never send an M2M client secret to an API endpoint. |
| OAuth access token | `"oauth2"` | Scope is intersected with the permissions the route grants; an empty intersection returns `403 insufficient_scope`. |

All four are sent as `Authorization: Bearer <credential>`; use
`Credential::Bearer(SecretString)`, or `Credential::Provider` for a token that is
fetched on demand. Each operation's `security` entry in the OpenAPI contract
lists the schemes it accepts. A few operations accept requests without
credentials.

The SDK does not run OAuth flows. Obtain OAuth access tokens and manage refresh
in your application's own authentication flow, then supply the current token.

## Using the client

- Operations are methods on `Client` with snake-case names, for example
  `count_projects`. Path parameters are arguments; optional query parameters use
  a `...Params` builder (for example `CountProjectsParams`). A setter is named
  after its parameter, except that a name matching a standard trait method gets
  a trailing underscore, so `ListVoiceProfilesParams::default().default_(...)`
  sets the `default` parameter.
- Models live in `photon_ai_api::types`.
- A successful call returns `ResponseValue<T>`: `inner()` / `into_inner()` give
  the body, `status()` and `headers()` the response metadata. Operations with
  several success statuses return status-tagged variants.
- `static_headers(HeaderMap)` or `headers(async closure)` add headers to every
  request; the closure runs before every attempt. Headers set by the operation
  take precedence.

Serde checks required fields, primitive types, unions and constants. Constraints
such as string patterns, numeric ranges and collection sizes are validated by
the server. The device-token method sends JSON; its equivalent form-encoded
representation is not exposed.

### Nullable fields

Optional nullable request fields use `Option<Option<T>>`: `None` omits the field,
`Some(None)` sends JSON `null`, and `Some(Some(value))` sends a value. For example,
set voice-profile inbound `credentials` to `Some(None)` to clear saved credentials;
use `None` to leave them unchanged. JSON deserialization preserves these three
states as well.

### Shared model identities

Request structs and enums, including their nested models, keep distinct Rust type
identities, even when two operations accept the same fields. Equivalent models
outside those input graphs, and equivalent response-header models, share
definitions to reduce compiler work. Every generated name and constructor remains
available. Field names, serde rules, wire values and header parsing are
preserved. Shared names have one Rust type identity: `Debug` and `type_name` may
show the canonical name, and separate trait implementations for two shared names
would overlap. Do not use model names as wire identifiers.

### Blocking client

The optional `blocking` feature adds `BlockingClient`, a synchronous wrapper that
drives the async client on its own current-thread Tokio runtime. Build and call
it outside any async runtime (for example on a `std::thread`).

```rust,no_run
use photon_ai_api::{BlockingClient, Credential, SecretString, DEFAULT_BASE_URL};

let client = BlockingClient::new(DEFAULT_BASE_URL)?
    .with_credential("accountServiceKey", Credential::Bearer(SecretString::from(token)));
```

`BlockingClient` is built directly, not through `PhotonClientBuilder`, so the
builder's timeout and retry behavior below does not apply to it. Use
`BlockingClient::with_client` to supply a `reqwest::Client` with your own
timeouts.

## Errors

Operations return `Result<ResponseValue<T>, Error<E>>`, where `E` is the
operation's typed error type. When an operation documents a single error status
with a body, `E` is that body type. Otherwise `E` is a per-operation enum (for
example `CountProjectsError`) with one variant per documented error status, and
a unit variant such as `Status400` for a status documented without a body.
`Error` is non-exhaustive.

| Variant | When |
| --- | --- |
| `RequestConstruction` | Invalid base URL, serialization failure, or no registered credential satisfies the operation's security requirement. Nothing is sent. |
| `Transport` | DNS, connection or TLS failure. |
| `Timeout` | The request timeout elapsed. |
| `Protocol` | Malformed HTTP or decompression failure. |
| `Redirect` | The redirect policy was exhausted. |
| `Api(ResponseValue<E>)` | A documented error status, decoded into `E`, with status and headers. |
| `UnexpectedStatus { status, headers, body }` | An undocumented status; the raw body is kept. |
| `Decode { path, body, truncated }` | A response body did not match its model. Error bodies are kept up to 64 KiB. |
| `InterruptedBody` | The connection dropped while a streamed body was read. |

`Error::is_transient()` reports whether a failure is a transport error, timeout,
interrupted body, 429 or 5xx.

## Retries and timeouts

These apply to clients built with `PhotonClientBuilder`.

| Builder method | Default | Behavior |
| --- | --- | --- |
| `timeout(Duration)` | 30 seconds | Applied to each attempt, and as the connect timeout of the default HTTP client. |
| `max_attempts(usize)` | `3` | Total attempts, including the first. Values are clamped to 1 to 3; `1` disables retries. |
| `maximum_retry_after(Duration)` | 60 seconds | Longest `Retry-After` the client waits for. |

- Only `GET`, `HEAD`, `OPTIONS` and `TRACE` requests, and requests that carry an
  `Idempotency-Key` header (from the operation or from configured headers), are
  retried. Other mutations are sent once. A request whose body cannot be cloned
  is sent once.
- Retries happen only after status 408, 429, 502, 503 or 504. Transport failures
  and timeouts are not retried. The status list is not configurable.
- Without `Retry-After`, the delay is random between 0 and
  `min(2 s, 250 ms * 2^(attempt - 1))`. The backoff is not configurable.
- `Retry-After` (whole seconds or an HTTP date) is used as the delay. If it
  exceeds `maximum_retry_after`, the client stops retrying and returns that
  response, which is then reported as an error for an error status.
- `reqwest_client(reqwest::Client)` supplies your own HTTP client; the per-attempt
  timeout and retry behavior still apply.

## Base URL

The client uses `https://api.photon.codes` (also exported as `DEFAULT_BASE_URL`). For
tests and alternative environments, call `base_url`:

```rust,no_run
let client = PhotonClientBuilder::new()
    .base_url("http://localhost:8080")
    .credential("accountServiceKey", Credential::Bearer(SecretString::from(token)))
    .build()?;
```

## API reference

The OpenAPI contract this client is generated from is
[`openapi/openapi.json`](https://github.com/photon-hq/api/blob/main/openapi/openapi.json)
in [photon-hq/api](https://github.com/photon-hq/api), with a Postman
collection generated from it. The same repository contains the
[TypeScript](https://github.com/photon-hq/api/tree/main/packages/typescript),
[Python](https://github.com/photon-hq/api/tree/main/packages/python) and
[Rust](https://github.com/photon-hq/api/tree/main/packages/rust) clients.

## Versioning

The TypeScript, Python and Rust clients share one version and are released
together. Releases follow semantic versioning, starting at 0.1.0. Before 1.0,
breaking changes increase the minor version. Changes are listed in
[CHANGELOG.md](https://github.com/photon-hq/api/blob/main/CHANGELOG.md).

## Building from source

Generation requires Node.js 26 and no API credentials. From the repository
root:

```sh
npm ci
npm run regenerate:rust
cargo test --locked -p photonhq-api
```

`npm run regenerate:rust` runs the pinned public Spargen generator through
Cargo. CI regenerates the client from the committed contract and fails if the
output differs from the committed files.

## Support and security

Report bugs and requests through
[GitHub issues](https://github.com/photon-hq/api/issues). Do not include
credentials or private data. Report vulnerabilities privately as described in
[SECURITY.md](https://github.com/photon-hq/api/blob/main/SECURITY.md).

This repository is generated, so external pull requests are not accepted. See
[CONTRIBUTING.md](https://github.com/photon-hq/api/blob/main/CONTRIBUTING.md).

## License

MIT. See [LICENSE](https://github.com/photon-hq/api/blob/main/LICENSE) and
[NOTICE](https://github.com/photon-hq/api/blob/main/NOTICE).
