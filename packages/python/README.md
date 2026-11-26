# photonhq-api

Synchronous and asynchronous Python client for the Photon API, generated from the
public OpenAPI contract. Requires Python 3.11+ and imports as `photon_api`.

## Installation

```sh
pip install photonhq-api
```

## Quickstart

```python
import os

from photon_api import Photon
from photon_api.rpc_generated import CountProjectsInput

token = os.environ["PHOTON_API_TOKEN"]
request = CountProjectsInput.model_validate(
    {"path": {"organizationId": os.environ["PHOTON_ORGANIZATION_ID"]}}
)

with Photon(headers={"Authorization": f"Bearer {token}"}) as photon:
    result = photon.organizations.projects.count(request)
    print(result.count)
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

`headers` accepts a mapping or a callable returning one. The callable runs before
every attempt, including retries, so it can return a freshly refreshed token.
For `AsyncPhoton` the callable may be async; for `Photon` it must be synchronous.

## Using the client

```python
import asyncio

from photon_api import AsyncPhoton


async def main() -> None:
    async with AsyncPhoton(headers={"Authorization": f"Bearer {token}"}) as photon:
        result = await photon.organizations.projects.count(request)
        print(result.count)


asyncio.run(main())
```

- `Photon` is synchronous; `AsyncPhoton` has the same methods as coroutines.
- Operations are grouped into namespaces that follow the API paths, for example
  `photon.organizations.projects.count`. Namespaces and methods are snake_case,
  as in `photon.projects.agent_profile.get`. Each method takes one input model from
  `photon_api.rpc_generated` (for example `CountProjectsInput`) with
  `path`, `query`, `body` and header members as the operation declares.
- A file upload, such as `photon.projects.upload_attachment`, takes an
  `UploadFile(data=..., content_type=..., filename=...)` from `photon_api`
  as its `body` (`filename` is optional). The client sends the
  `multipart/related` body the API takes (JSON that describes the file, then the
  file) and sets Content-Type and Content-Length; the boundary comes from the
  file's bytes, so a retry with the same idempotency key sends the same request.
- Every method also takes a keyword-only `options`, a `RequestOptions`
  dictionary, for one call: its `headers` replace the client's value for the
  same header names, and a header member of the input still takes precedence.
- The normal facade returns the response model. `photon.raw` has the same methods
  and returns a `RawResponse` with `data`, `status`, `headers` and `request_id`
  (the `x-request-id` response header when present).
- Close the client to release connections: use `with` / `async with`, or call
  `close()` / `await close()`. A client you pass in with `client=` is not closed
  for you.

Request inputs and responses are Pydantic models typed by the contract.
Building an input model checks types and required fields and raises
`pydantic.ValidationError` if they do not match; limits such as patterns,
lengths and ranges are checked by the API. Successful responses are parsed into
the model declared for their status. When a successful JSON object does not
match that model, for example because a required field is missing, the client
still returns the model, built without validation (Pydantic's `model_construct`):
fields that match are parsed as usual, a field the response leaves out is
`MISSING`, and a field of another type keeps the value the API sent. A body of
another shape, such as `null` or a list where the model is an object, is
returned as sent. Either way your code can meet a value its type does not
allow. Pass
`strict_response_validation=True` to `Photon` or `AsyncPhoton` to raise
`ResponseValidationError` instead. A JSON response whose body cannot be parsed
raises it in either mode. Fields the SDK does not know are kept, and
enums are open (`Literal["a", "b"] | str`), so the client keeps working when the
API adds fields or values. Dates and date-times are strings, as sent.

### Model fields

Omit optional fields that you do not want to send. Pass `None` only when the
schema permits null. Optional fields without defaults use Pydantic's `MISSING`
sentinel; check `model_fields_set` to see which fields were supplied. Request
serialization excludes omitted fields while preserving explicit nulls where
allowed. Extra fields are retained and sent.

The pinned Pydantic release marks `MISSING` experimental. Models containing it
cannot be pickled, and static type checker support is limited. JSON serialization
is supported; use `model_dump(mode="json", by_alias=True, exclude_unset=True)`.

## Errors

All errors extend `PhotonError`, which carries `operation_id` and `request_id`
when known.

| Class | Raised when | Attributes |
| --- | --- | --- |
| `ApiError` | The API returns a non-success status. The message is the problem `detail` when present. | `status`, `headers`, `body` (parsed JSON, or `None`), `raw_body`, `operation_id`, `request_id` |
| `ResponseValidationError` | A successful response has an undocumented status, is not empty when it should be, or cannot be parsed as the JSON the operation returns, or, with `strict_response_validation=True`, does not match its model. | `status`, `raw_body`, `operation_id`, `request_id` |
| `TransportError` | The request failed at the HTTP layer (connection error, timeout) on the last attempt. | `operation_id`; the `httpx` error is in `__cause__` |

```python
from photon_api import ApiError

try:
    photon.organizations.projects.count(request)
except ApiError as error:
    print(error.status, error.request_id, error.body)
    raise
```

## Retries and timeouts

| Argument | Default | Behavior |
| --- | --- | --- |
| `timeout` | `30.0` | Seconds, applied to each attempt. |
| `max_attempts` | `3` | Total attempts, including the first. Values are clamped to 1 to 3; `1` disables retries. |
| `max_retry_after` | `60.0` | Longest `Retry-After`, in seconds, the client waits for. |

- Only `GET` operations and requests that carry an `Idempotency-Key` header
  (from the input or from the `headers` option) are retried. Other mutations are
  sent once.
- Retryable requests are retried after status 408, 429, 502, 503 or 504, or after
  an `httpx` error (for example a connection error or timeout). The status list
  and backoff are not configurable.
- Without `Retry-After`, the delay is random between 0 and
  `min(2.0, 0.25 * 2^(attempt - 1))` seconds.
- `Retry-After` (seconds or an HTTP date) is used as the delay. If it exceeds
  `max_retry_after`, the client stops retrying and handles that response (an
  `ApiError` for an error status).
- When attempts run out, the last response is handled normally, or
  `TransportError` is raised.

You can pass your own `httpx.Client` (for `Photon`) or `httpx.AsyncClient` (for
`AsyncPhoton`) as `client=`; the base URL, `timeout` and retry behavior above
still apply.

## Base URL

The client uses `https://api.photon.codes`. For tests and alternative environments,
set `base_url`:

```python
photon = Photon(
    base_url="http://localhost:8080",
    headers={"Authorization": f"Bearer {token}"},
)
```

## Webhooks

`verify_webhook` checks a webhook delivery's
[Standard Webhooks](https://www.standardwebhooks.com/) signature with the
destination's signing secret (`whsec_...`). Pass the body exactly as it arrived,
before anything parses it. When it returns, the delivery verified and the body
is the event. It raises `WebhookVerificationError` when the delivery does not
verify: answer that with `400` and ignore the body.

```python
import json

from photon_api import verify_webhook

verify_webhook(body, headers, secret=webhook_secret)
event = json.loads(body)
```

## API reference

The OpenAPI contract this client is generated from is
[`openapi/openapi.json`](https://github.com/photon-hq/api/blob/main/openapi/openapi.json)
in [photon-hq/api](https://github.com/photon-hq/api), with a Postman
collection generated from it. The same repository contains the
[TypeScript](https://github.com/photon-hq/api/tree/main/packages/typescript),
[Python](https://github.com/photon-hq/api/tree/main/packages/python),
[Rust](https://github.com/photon-hq/api/tree/main/packages/rust) and
[Go](https://github.com/photon-hq/api/tree/main/packages/go) clients.

## Versioning

The TypeScript, Python, Rust and Go clients share one version and are
released together. Releases follow semantic versioning, starting at 0.1.0. Before 1.0,
breaking changes increase the minor version. Changes are listed in
[CHANGELOG.md](https://github.com/photon-hq/api/blob/main/CHANGELOG.md).

## Building from source

Generation requires Node.js 26 and no API credentials; Node.js is not needed to
use the package. From the repository root:

```sh
python -m pip install -r tools/python-codegen/requirements-dev.txt
npm ci
npm run regenerate:python
python -m pip install -e packages/python
npm run test:python
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

Apache-2.0. See [LICENSE](https://github.com/photon-hq/api/blob/main/LICENSE) and
[NOTICE](https://github.com/photon-hq/api/blob/main/NOTICE).
