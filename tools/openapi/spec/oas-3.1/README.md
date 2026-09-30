# Vendored OpenAPI 3.1 schema

`schema-2025-09-15.json` is the official OpenAPI 3.1 document schema, copied
byte-for-byte so the `check:oas31` validation (`tools/openapi/check_oas31.py`)
never needs the network.

- Source: <https://spec.openapis.org/oas/3.1/schema/2025-09-15>
- Downloaded: 2026-09-25
- SHA-256: `d0a3955182364c7b5fdebfd0583ecad259a870b4a2fe86a1b0fe8785f8224fed`

This schema checks document structure only; it accepts any object or boolean
where a Schema Object is expected. The checker validates Schema Objects against
the JSON Schema 2020-12 meta-schema bundled with the pinned
`jsonschema-specifications` package instead. The combined `schema-base` variant
is not used: python-jsonschema cannot resolve its references.

## Updating

1. Pick the newest dated schema listed at <https://spec.openapis.org/oas/3.1/schema/>.
2. Download it unchanged, for example
   `curl -fsSL -o schema-YYYY-MM-DD.json https://spec.openapis.org/oas/3.1/schema/YYYY-MM-DD`,
   and delete the old file.
3. Update `OAS_SCHEMA_ID`, `OAS_SCHEMA_FILE` and `OAS_SCHEMA_SHA256` in
   `check_oas31.py` (`shasum -a 256 schema-YYYY-MM-DD.json`) and this README.
4. Run `npm run test:oas31`, `npm run check:oas31` and `npm run check:oas31:public`.
