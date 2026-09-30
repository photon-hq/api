# Photon API

The public OpenAPI contract of the Photon API, a Postman collection generated
from it, and TypeScript, Python and Rust clients generated from the same
contract.

> **Preview release.** This version is generated from the current production
> contract before all of its schemas have stable names. Types the contract
> does not name yet have names derived from their operation (for example
> `ListProjectsResponse200ApplicationJson`) or carry a version prefix such as
> `Photon20260701_`. These type names change in 0.2.0, when the contract
> names them; the rename does not change requests, responses or method names.

| Language | Package | Install | Documentation |
| --- | --- | --- | --- |
| TypeScript / JavaScript | [`@photon-ai/api`](https://www.npmjs.com/package/@photon-ai/api) | `npm install @photon-ai/api` | [packages/typescript](packages/typescript/README.md) |
| Python | [`photonhq-api`](https://pypi.org/project/photonhq-api/) | `pip install photonhq-api` | [packages/python](packages/python/README.md) |
| Rust | [`photonhq-api`](https://crates.io/crates/photonhq-api) | `cargo add photonhq-api` | [packages/rust](packages/rust/README.md) |

| File | Contents |
| --- | --- |
| [`openapi/openapi.json`](openapi/openapi.json) | OpenAPI 3.1 contract, restricted to public operations. Server: `https://api.photon.codes`. |
| [`postman/collection.json`](postman/collection.json) | Postman collection generated from the contract. |

## Try it in Postman

Every release also updates the hosted collection in Photon's public Postman
workspace. You can instead download
[`postman/collection.json`](postman/collection.json) and import it into your own
workspace.

1. Set the empty `apiToken` variable to a supported API key or token. Keep it
   private.
2. Fill in the required path, query and body values, review the request, and
   send it. Mutating requests change resources in your account.

See [postman/README.md](postman/README.md) for details.

## Credentials

Every credential is sent as `Authorization: Bearer <credential>`. Each
operation's `security` entry lists the schemes it accepts; a few operations
accept requests without credentials.

| Credential | Security scheme | Notes |
| --- | --- | --- |
| Account Service Key (`pho_ask_...`) | `accountServiceKey` | Acts as the account and reaches every route the account can. |
| Project API key (`pho_sk_...`) | `projectApiKey` | Bound to one project. Accepted only under `/v1/projects/{projectId}`. |
| Organization Service Identity API key or M2M access token | `serviceIdentityBearer` | Restricted to its organization and explicitly granted permissions. Never send an M2M client secret to an API endpoint. |
| OAuth access token | `oauth2` | Scope is intersected with the permissions the route grants; an empty intersection returns `403 insufficient_scope`. |

The clients do not run OAuth flows. Obtain OAuth access tokens and manage
refresh through your application's own authentication flow. See the Photon
dashboard and documentation to create credentials.

## Versioning

The three packages share one version and are released together: every release
publishes `@photon-ai/api`, `photonhq-api` and `photonhq-api` at the same
version, even when one of them has no changes. Releases follow semantic
versioning, starting at 0.1.0; before 1.0, breaking changes increase the minor
version. Each release is tagged `v<version>` and its changes are listed in
[CHANGELOG.md](CHANGELOG.md). A release's GitHub page carries the exact files
published to npm, PyPI and crates.io, with their SHA-256s and GitHub build
attestations (`gh attestation verify FILE --repo photon-hq/api`).

## Building from source

Generation needs no API credentials. It requires Node.js 26; the Python client
also needs Python 3.11+, and the Rust client Rust 1.88+.

```sh
npm ci
npm ci --prefix tools/openapi-generator
npm ci --prefix tools/postman --ignore-scripts
python -m pip install -r tools/python-codegen/requirements-dev.txt
npm run generate
python -m pip install -e packages/python
npm test
```

`npm run regenerate:typescript`, `regenerate:python` and `regenerate:rust`
regenerate one client. CI regenerates each client and the collection from the
committed contract and fails if the output differs from the committed files.

## Support and security

Report bugs and requests through
[GitHub issues](https://github.com/photon-hq/api/issues). Do not include
credentials or private data. Report vulnerabilities privately as described in
[SECURITY.md](SECURITY.md). This repository is generated, so external pull
requests are not accepted; see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
