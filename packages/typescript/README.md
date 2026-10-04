# @photon-ai/api

TypeScript client for the Photon API, generated from the public OpenAPI contract.
Runs on Node.js 22+ and modern browsers.

## Installation

```sh
npm install @photon-ai/api
```

## Quickstart

```ts
import { Photon } from "@photon-ai/api";

const token = process.env.PHOTON_API_TOKEN;
const organizationId = process.env.PHOTON_ORGANIZATION_ID;
if (!token || !organizationId) {
  throw new Error("Set PHOTON_API_TOKEN and PHOTON_ORGANIZATION_ID");
}

const photon = new Photon({
  headers: { Authorization: `Bearer ${token}` },
});

const result = await photon.organizations.projects.count({
  path: { organizationId },
});
console.log(result.count);
```

`countProjects` accepts an Account Service Key or an Organization Service Identity
API key / M2M access token. Set `PHOTON_API_TOKEN` to one of those credentials
and `PHOTON_ORGANIZATION_ID` to the ID of an organization it can access. See the
Photon dashboard and documentation to create credentials and find IDs.

## Authentication

Every credential is sent as `Authorization: Bearer <credential>`. Pass it through
the `headers` option. The client does not choose or check a credential type; the
API accepts or rejects it.

| Credential | Security scheme | Notes |
| --- | --- | --- |
| Account Service Key (`pho_ask_...`) | `accountServiceKey` | Acts as the account and reaches every route the account can. |
| Project API key (`pho_sk_...`) | `projectApiKey` | Bound to one project. Accepted only under `/v1/projects/{projectId}`. |
| Organization Service Identity API key or M2M access token | `serviceIdentityBearer` | Restricted to its organization and explicitly granted permissions. Never send an M2M client secret to an API endpoint. |
| OAuth access token | `oauth2` | Scope is intersected with the permissions the route grants; an empty intersection returns `403 insufficient_scope`. |

Each operation's `security` entry in the OpenAPI contract lists the credential
types it accepts. A few operations accept requests without credentials.

The SDK does not run OAuth flows. Obtain OAuth access tokens and manage refresh
in your application's own authentication flow, then supply the current token.

`headers` accepts a plain object, a `Headers` instance, or a function (sync or
async) returning either. A function is called before every attempt, including
retries, so it can return a freshly refreshed token:

```ts
const photon = new Photon({
  headers: async () => ({ Authorization: `Bearer ${await getAccessToken()}` }),
});
```

In a browser, supply credentials from your application's authentication flow.
Do not embed Account Service Keys, Project API keys or Service Identity
credentials in browser bundles.

## Using the client

Operations are grouped into namespaces that follow the API paths, for example
`photon.organizations.projects.count`. Each method takes one input object with
`path`, `query`, `body` and `headers` members as the operation declares, and an
optional second argument `{ signal?: AbortSignal, headers?: HeadersInit }` for a
single call.

- `photon.<namespace>.<method>(...)` resolves to the response data.
- `photon.raw.<namespace>.<method>(...)` resolves to
  `{ data, status, headers, requestId }`. `requestId` is the `x-request-id`
  response header when present.

Request input is typed by the contract and sent as given; the API validates it.
Successful responses are decoded using the representation the contract declares
for their status (regardless of the response `Content-Type`) and checked for
shape: types and required members, not patterns, lengths or bounds. Members the
SDK does not know are kept, and enums are open (the known values plus any other
string), so the client keeps working when the API adds fields or values.
Request and response types, and the Zod schemas, are exported from the package,
as are the contract's types: each component schema by name and, per operation,
`<Operation>Errors` (error bodies by status) and `<Operation>Responses`.

An operation that declares an `Idempotency-Key` header takes it as
`headers: { idempotencyKey }` in its input.

## Errors

All errors extend `PhotonError`, which carries `operationId` and `requestId` when
known.

| Class | Thrown when | Fields |
| --- | --- | --- |
| `ApiError` | The API returns a non-success status. The message is the problem `detail` when present. | `status`, `headers`, `body` (parsed JSON, or text), `rawBody`, `operationId`, `requestId` |
| `ResponseValidationError` | A successful response has an undocumented status, cannot be decoded, or does not match its schema. | `status`, `issues`, `operationId`, `requestId`, `cause` |
| `TransportError` | The request could not complete: network failure, timeout, cancellation, or a response body that could not be read. | `cause` (the underlying error, or the `signal`'s abort reason) |

```ts
import { ApiError } from "@photon-ai/api";

try {
  await photon.organizations.projects.count({ path: { organizationId } });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status, error.requestId, error.body);
  }
  throw error;
}
```

## Retries and timeouts

| Option | Default | Behavior |
| --- | --- | --- |
| `timeoutMs` | `30000` | Limit for each attempt, not for the whole call. |
| `retry.maxAttempts` | `3` | Total attempts, including the first. Values are clamped to 1 to 3. |
| `retry.statuses` | `[408, 429, 502, 503, 504]` | Response statuses that are retried. |
| `retry.baseDelayMs` | `250` | Backoff base. |
| `retry.maximumDelayMs` | `2000` | Backoff ceiling. |
| `retry.maximumRetryAfterMs` | `60000` | Longest `Retry-After` the client waits for. |

- Only `GET`, `HEAD`, `OPTIONS` and `TRACE` requests, and requests that carry an
  `Idempotency-Key` header (from the input or from the `headers` option), are
  retried. Other mutations are sent once.
- Retryable requests are retried after a retryable status or a network error or
  timeout, including one while the response body is read.
- Without `Retry-After`, the delay is random between 0 and
  `min(maximumDelayMs, baseDelayMs * 2^(attempt - 1))`.
- `Retry-After` (seconds or an HTTP date) is used as the delay. If it exceeds
  `maximumRetryAfterMs`, the client stops retrying and handles that response
  (an `ApiError` for an error status).
- When attempts run out, the last response is handled normally, or the last
  network error is thrown as `TransportError`.
- Aborting the call's `signal` stops the current attempt and any wait.
- Disable retries with `retry: false`.

```ts
const photon = new Photon({
  headers: { Authorization: `Bearer ${token}` },
  timeoutMs: 10_000,
  retry: { maxAttempts: 2, statuses: [429, 503] },
});
```

## Base URL

The client uses `https://api.photon.codes`. For tests and alternative environments,
set `baseUrl`. The `fetch` option replaces the fetch implementation, for example
with a test double.

```ts
const photon = new Photon({ baseUrl: "http://localhost:8080", fetch: myFetch });
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
npm ci --prefix tools/openapi-generator
npm run regenerate:typescript
npm run test:typescript
```

CI regenerates the client from the committed contract and fails if the output
differs from the committed files.

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
