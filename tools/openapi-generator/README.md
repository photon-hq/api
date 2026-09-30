# TypeScript generation

The generator is pinned to stable `@hey-api/openapi-ts@0.99.0` with Zod 4.
`zod-resolvers.ts` uses the documented
[$resolvers API](https://heyapi.dev/docs/openapi/typescript/plugins/concepts/resolvers).
No dependency internals or generated runtime/validator source are patched.
`bound-zod-types.mjs` still bounds value-preserving union declarations and marks
audited schema constructors pure for compilation and tree shaking.

## What the generated client checks

The SDK follows the common practice of generated API clients (Stainless,
Stripe, Speakeasy, the AWS and Azure SDK guidelines):

- **Types carry the contract**: fields, types, requiredness, nullability, known
  enum values and the contract's names.
- **Validation-only keywords are not enforced** on requests or responses:
  `pattern`, lengths, bounds, `multipleOf`, item and property counts,
  `uniqueItems`, `propertyNames` and `format` (except `binary`). The service
  validates them; a client that enforced them would break when the service
  relaxes a limit.
- **The client never rejects a value the contract allows.** Requests are not
  validated at runtime (`validator.request: false`); the facade sends the input
  as given. Responses are parsed for shape.
- **Responses tolerate additions**: objects keep members the SDK does not know,
  even where the contract says `additionalProperties: false`, and enums with
  several values are open: the type is `"a" | "b" | (string & {})` and the Zod
  schema accepts any string (`openEnum` in `packages/typescript/src/validation.ts`).
  A one-value enum is a constant (typically a union discriminator) and stays closed.
- **`default` is documentation** (`@default` on the type), never filled in.
- **Unions tolerate members added later** where the contract declares a
  fallback (`x-photon-extension: {discriminator, fallback}`, the platform
  unions). The contract lists only the known members; SDK preparation appends
  the fallback as the last member of a union that responses use (see
  `addUnknownPlatformMembers` in `tools/openapi/src/prepare-sdk.ts`). The known
  members are tried first, and a value only the fallback
  takes is `{ <discriminator>: "UNKNOWN"; raw: <Fallback> }`, as in
  [Speakeasy's forward-compatible unions](https://www.speakeasy.com/blog/open-unions-typescript-type-theory).
  The upper-case sentinel is no platform, so comparing the discriminator with a
  known value narrows. A union without the fallback member (a request's
  `<Name>Input`) is unchanged.

## Supported configuration and removal conditions

These hooks compensate for gaps in the current stable package (not a fork or
prerelease). They never change the contract.

| Hook | What it does and why | Removal condition |
| --- | --- | --- |
| input patch (`prepareInput`, `parser.patch.input`) | Removes validation-only keywords and moves `default` into the description (`@default`) before Hey API parses the document. 0.99.0 has no option to omit either from the Zod schemas (it emits `.min()`, `.regex()`, `z.email()`, `.default()` and so on). A closed tuple keeps `minItems`/`maxItems`, which are its shape. | The zod plugin can generate shape-only schemas without `.default()`. |
| `object` (Zod) | Every object is `z.looseObject` (unknown members kept); a typed catchall (`additionalProperties: {schema}`) stays `z.object(shape).catchall(type)`. 0.99.0's `z.object` strips unknown members (closing explicit `additionalProperties: false` is tracked in [#4307](https://github.com/hey-api/hey-api/issues/4307)), and it ignores typed catchalls on objects with known properties. | The plugin has a "keep unknown members" object mode and visits typed catchalls. |
| `object` (TypeScript) | A closed object without properties is `Record<string, unknown>`; 0.99.0 types it `{ [key: string]: never }`, which a response that gained members could not satisfy. | Same as above. |
| `enum` (Zod and TypeScript), `enums: false` | Open enums as described above. With `enums: "javascript"` the named enum types derive from closed JavaScript objects, so the types plugin emits unions instead. | The plugins support open (forward-compatible) enums. |
| `number` (Zod) | An integer is `z.number().refine(Number.isInteger)`: `z.int()` also rejects integers beyond ±(2^53 − 1), which the contract allows. | The plugin emits an unbounded integer check. |
| `tuple` (Zod and TypeScript) | A `prefixItems` array whose length is not fixed becomes `z.array(z.unknown()).refine(prefixItems([...]))` and the type `unknown[]`: it may be shorter than the prefix and, without `items: false`, longer. 0.99.0 emits a fixed tuple ([#352](https://github.com/hey-api/hey-api/issues/352)). | The generator emits open tuples. |
| `unknown` (Zod) | `{ not: {} }`, a member that must be absent, is `never` in the types and `absent()` in Zod: not checked in a response, so a service that adds the member later (a problem's `remediation`) does not break the SDK. 0.99.0's parser drops `not`. | The parser keeps `not: {}` and the plugin leaves response members unchecked. |
| `union` (Zod and TypeScript), `intersection` (Zod) | The fallback member of a union with `x-photon-extension` becomes `unknownMember(discriminator, fallback)` (`packages/typescript/src/validation.ts`) and the type `{ <discriminator>: "UNKNOWN"; raw: <Fallback> }`. An `allOf` that narrows such a union (`PlatformUser`) is `narrowed(union, ...others)`: a Zod intersection would merge the wrapper with the other members' output and fail. | The generator supports forward-compatible unions. |
| `string` (Zod) | `format: binary` is `z.instanceof(Blob)` (File included), as the Fetch client sends and returns it ([#4265](https://github.com/hey-api/hey-api/issues/4265)). | The plugin emits a Blob check for binary. |

The hooks read the input schema by the resolver path, flattening a union whose
member is itself only a union, as the intermediate schema does.

## Verification

Use the repository's Node 26 toolchain:

```sh
npm ci
npm ci --prefix tools/openapi-generator
npm --prefix tools/openapi-generator run typecheck
node --test tools/openapi-generator/zod-resolvers.test.mjs
npm run generate:typescript
npm run test:tools
npm run test:typescript
```

The resolver tests generate directly from declared fixture schemas, bypassing
SDK preparation. They cover objects (unknown members kept, typed catchalls),
references, nesting, recursion, defaults, requiredness, nullability, open enums,
unenforced validation keywords, composition, binary fields, multipart File
uploads and raw byte round trips, and compile the generated declarations and a
browser bundle. The SDK suite checks Photon data/raw interfaces and retries with
mock Fetch. No fixture contacts an API service. Generation must also be repeated
and compared byte-for-byte on the complete internal and public TypeScript trees.

## Boundaries

SDK preparation (`prepare-sdk.ts`) does not rewrite schemas: it hoists inline
operation schemas under operation names in the internal lane and selects one
JSON media type per request and response. The hooks therefore see the
contract's schemas; gate B (`tools/conformance/`) checks in both lanes that
every contract-valid value is accepted and round-trips, and that responses
with unknown members or enum values are accepted.

Hey API 0.99.0 also spreads per-call headers into object literals in generated
methods that set a body content type. Passing a Headers instance there loses
its entries; tuple header inputs are also unsupported
by its merge helper. The public Photon facade supplies an object at that
boundary and supports its documented Headers inputs. These hooks do not change
the lower-level SDK's header serialization. Body-free generated methods accept
Headers; the focused tests exercise that path as well as Photon header inputs.

## Dependency review (September 23, 2026)

Verdict: **prefer the existing bundled client**. The separate development-only
`@hey-api/client-fetch@0.13.1` dependency is redundant and removed; the
`@hey-api/client-fetch` plugin remains configured. The official
[npm metadata](https://registry.npmjs.org/@hey-api/client-fetch) deprecates the
separate package because clients have been bundled since openapi-ts 0.73.0;
[Fetch configuration](https://heyapi.dev/docs/openapi/typescript/clients/fetch)
requires only the plugin. No new dependency or version change is introduced.

The official registry reports 0.99.0 as latest stable (published June 22, 2026),
MIT licensing and Node >=22.18.0 for the generator; the repository uses Node 26.
The separate package is MIT and peers on openapi-ts <2. The maintained bundled
implementation avoids carrying the obsolete package and its peer requirement.
The known [prototype-chain advisory](https://github.com/hey-api/hey-api/security/advisories/GHSA-hhx9-57xq-r5rw)
identifies 0.97.3 as patched, earlier than the retained pin. This is a targeted
dependency review, not a claim that every transitive dependency has been audited.
Clean install, deterministic regeneration and the full TypeScript checks qualify
the removal without changing the plugin or generated transport interface.
