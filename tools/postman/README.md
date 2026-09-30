# Postman generation

`openapi-to-postmanv2` 6.3.3 is the official Postman converter, pinned with its
lockfile. It is development tooling, never a dependency of the published SDKs.
Run `node tools/postman/run.mjs` from the prepared public source tree. It reads
the saved public OpenAPI and writes `postman/collection.json`; publishing copies
that file without converting it again.

A fixed random seed and clock make generated examples reproducible. A converter-only
copy adapts constants and tuple entries for its older example generator, supplies
valid fictional phone/email examples and removes redundant known dialect declarations. The saved OpenAPI
and SDK validation rules remain unchanged.

The converter fakes an `allOf` by replacing each `anyOf`/`oneOf` with its first
alternative and merging the branches, with enums merged as a union
([`schemaUtils.js`](https://github.com/postmanlabs/openapi-to-postman/blob/develop/libV2/CollectionGeneration/schemaUtils.js)).
That can produce a `const` from one branch that another rejects, or an optional
property that a closed sibling forbids. For each `allOf`, the copy therefore
uses the first union alternative, in declaration order, that is compatible with
the sibling branches. It also intersects enums and omits optional properties
that a closed sibling forbids. These changes only narrow the example to values
the original `allOf` accepts. If no alternative is compatible, the `allOf` is
left unchanged and the source check reports it. Optional parameters start disabled.
Credential fields and credential-shaped values in generated request/response
examples are emptied, including URL variables; saved schema values are untouched.
The attachment example includes metadata and a small text file with matching
multipart framing and byte size; request Content-Length is calculated by Postman.
`npm run check:postman:source` in the public source tree validates requests and saved responses directly
against the contract (`openapi/openapi.json`), before building any SDK. JSON bodies, string-valued
URL-encoded form bodies, inline raw payloads and header examples are checked at
their original schema locations, including references, formats, enums, nulls,
unions, tuples and typed maps. Required headers must be enabled; an omitted
Content-Length is checked using the inline payload's UTF-8 byte count because
Postman calculates it. Optional query examples must remain disabled.

Saved response examples are checked against the original response schemas, with
exact status codes taking precedence over ranges and `default`, and exact media
types taking precedence over wildcards. Every declared response status must have
an example. JSON bodies are parsed and validated; inline non-JSON bodies are
checked as strings. Responses declared without content must have empty bodies.
Missing schemas, invalid JSON and undeclared statuses or media types fail the
check. The checker never repairs an example or loosens the source schema.

After building TypeScript, `npm run check:postman` also checks JSON request bodies against
the SDK validators. Both checks use temporary local values for intentionally
empty credentials without changing the collection or source schema. The public
test command runs the source check first, so a bad example fails before expensive
language builds. To run it directly, use
`node tools/postman/check-collection.mjs --source-only` from that tree.

This validates the selected request example for each operation and every saved
response example. It does not send requests or prove that every union branch or
alternative media type works live. Response headers are not validated. Raw binary
schemas validate the declared string constraints, not the encoded file format;
multipart framing and file-size consistency are covered by the converter tests.
External file bodies, repeated form fields and unsupported schema assertions
fail visibly instead of being skipped. Query values and path IDs still require
the existing live qualification. Report source or converter defects to their
owner; do not rewrite schemas or examples to make this check pass.

The launcher clears inherited environment variables and runs the converter
under Node 26's permissions with reads limited to the converter and saved
schema, writes limited to the collection directory, and network, subprocess and
worker access disabled. These are defense-in-depth restrictions, not a claim
that Node permissions are an operating-system sandbox. Use reviewed source and
an unprivileged CI job without publishing credentials.

## Dependency assessment

Verdict: **APPROVE WITH CAVEATS** for offline generation, assessed September 17,
2026. The converter is maintained by Postman, supports OpenAPI 3.1, requires Node
18+, and is Apache-2.0 licensed. This project uses Node 26. No existing dependency
in the SDK toolchain performs the requested conversion.

- [Official converter and documentation](https://github.com/postmanlabs/openapi-to-postman)
- [Converter license](https://github.com/postmanlabs/openapi-to-postman/blob/develop/LICENSE.md)
- [Faker advisory GHSA-qxc2-j82w-r537](https://github.com/advisories/GHSA-qxc2-j82w-r537)

Postman's collection library currently requires Faker 5.5.3, which is deprecated
and falls in the advisory's affected range. Faker 10.6.0 fixes the advisory but
breaks the library's old imports/API. Keep the compatible version for this
restricted generation use until upstream supports a patched version. Do not
use this exception in an application or a request-serving process.

Inspection found no direct use of the affected Faker string-template evaluator
in the converter/collection library. Postman's schema example generation uses
its separate bundled JSON Schema faker. This is an exposure assessment, not
proof that every possible input is safe. Tests exercise conversion with the
Faker evaluator disabled.

The other reported transitive issues are addressed with pinned patched
`js-yaml`, `yaml` and `uuid`. `node tools/postman/check-audit.mjs` permits only
this advisory for the inspected converter/Faker versions and fails on other
advisories or audit errors. A dependency upgrade requires reassessment. Review
upstream updates during normal dependency maintenance.

### Source validation dependencies

Verdict: **APPROVE WITH CAVEATS**, assessed September 22, 2026, for pinned
development-only `ajv` 8.20.0 and `ajv-formats` 3.0.1. These MIT-licensed packages
validate JSON Schema 2020-12 and standard formats on the project's Node 26 runtime.
Ajv 8.20.0 was released April 24, 2026; ajv-formats 3.0.1 on March 30, 2024. Neither
version is deprecated. The converter already depends on Ajv; declaring the checker
dependencies directly avoids relying on a transitive package layout. Node has no
built-in JSON Schema validator, and generated Zod validators cannot independently
check the source they were generated from.

- [Ajv JSON Schema support](https://ajv.js.org/json-schema.html)
- [Ajv releases and license](https://github.com/ajv-validator/ajv)
- [Format plugin and license](https://github.com/ajv-validator/ajv-formats)
- [Ajv advisory fixed in 8.18.0](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6)
- [Earlier Ajv advisory fixed in 6.12.3](https://github.com/advisories/GHSA-v88g-cgmw-v5xw)

The registry audit of the resulting lockfile reports only the existing Faker
exception. Ajv format checks can involve expensive regular expressions; run this
offline against reviewed source and generated examples, not arbitrary public
inputs. The checker does not enable coercion, default insertion, property removal,
`$data`, asynchronous reference loading, or network access. Unknown non-extension
schema keywords fail compilation. None of these dependencies enters an SDK's
runtime dependency graph.
