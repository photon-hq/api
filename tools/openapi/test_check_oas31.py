"""Self-tests for check_oas31.py: known-bad documents must be rejected."""

from __future__ import annotations

import contextlib
import copy
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))

import check_oas31  # noqa: E402
from jsonschema import Draft202012Validator  # noqa: E402
from referencing.exceptions import Unresolvable, Unretrievable  # noqa: E402

VALID: dict[str, Any] = {
    "openapi": "3.1.1",
    "info": {"title": "Fixture", "version": "1.0.0"},
    "paths": {
        "/items": {
            "get": {
                "operationId": "listItems",
                "responses": {
                    "200": {
                        "description": "Items",
                        "headers": {"X-Request-Id": {"schema": {"type": "string"}}},
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/Item"},
                                "example": {"$ref": "https://example.com/not-a-reference"},
                            }
                        },
                    },
                    "4XX": {"description": "Client error"},
                },
            }
        }
    },
    "components": {
        "schemas": {
            "Item": {
                "type": "object",
                "properties": {
                    "schema": {"type": "string"},
                    "$ref": {"type": "string"},
                },
                "required": ["schema"],
            }
        }
    },
}


def mutate(change) -> dict[str, Any]:
    document = copy.deepcopy(VALID)
    change(document)
    return document


def response_200(document: dict[str, Any]) -> dict[str, Any]:
    return document["paths"]["/items"]["get"]["responses"]["200"]


def run_checker(document: dict[str, Any]) -> tuple[int, str]:
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "openapi.json"
        path.write_text(json.dumps(document), encoding="utf-8")
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = check_oas31.main(["--jobs", "1", str(path)])
    return code, output.getvalue()


class CheckOas31Test(unittest.TestCase):
    def assert_invalid(self, document: dict[str, Any], check: str, fragment: str) -> None:
        code, output = run_checker(document)
        self.assertEqual(code, 1, output)
        self.assertRegex(output, rf"INVALID {check}")
        self.assertIn(fragment, output)

    def test_minimal_valid_document_passes(self) -> None:
        code, output = run_checker(VALID)
        self.assertEqual(code, 0, output)
        self.assertEqual(output.count("VALID  "), 3, output)
        self.assertNotIn("INVALID", output)

    def test_rejects_header_without_schema_or_content(self) -> None:
        def change(document: dict[str, Any]) -> None:
            response_200(document)["headers"]["X-Request-Id"] = {"description": "No shape"}

        self.assert_invalid(mutate(change), "structure", "/paths/~1items/get/responses")

    def test_rejects_invalid_response_code_key(self) -> None:
        def change(document: dict[str, Any]) -> None:
            responses = document["paths"]["/items"]["get"]["responses"]
            responses["2XY"] = responses.pop("200")

        self.assert_invalid(mutate(change), "structure", "2XY")

    def test_rejects_invalid_schema_keyword_value(self) -> None:
        def change(document: dict[str, Any]) -> None:
            document["components"]["schemas"]["Item"]["properties"]["schema"]["type"] = 5

        self.assert_invalid(
            mutate(change), "schemas", "/components/schemas/Item/properties/schema/type"
        )

    def test_rejects_invalid_inline_schema(self) -> None:
        def change(document: dict[str, Any]) -> None:
            response_200(document)["headers"]["X-Request-Id"]["schema"] = {"minLength": -1}

        self.assert_invalid(mutate(change), "schemas", "X-Request-Id/schema/minLength")

    def test_rejects_external_reference(self) -> None:
        def change(document: dict[str, Any]) -> None:
            media = response_200(document)["content"]["application/json"]
            media["schema"] = {"$ref": "https://example.com/schemas/item.json"}

        self.assert_invalid(mutate(change), "references", "external reference")

    def test_rejects_external_reference_inside_schema(self) -> None:
        def change(document: dict[str, Any]) -> None:
            item = document["components"]["schemas"]["Item"]
            item["properties"]["owner"] = {"$ref": "other.json#/Owner"}

        self.assert_invalid(mutate(change), "references", "'other.json#/Owner'")

    def test_rejects_unresolvable_local_reference(self) -> None:
        def change(document: dict[str, Any]) -> None:
            media = response_200(document)["content"]["application/json"]
            media["schema"] = {"$ref": "#/components/schemas/Missing"}

        self.assert_invalid(mutate(change), "references", "does not resolve")

    def test_rejects_unsupported_schema_dialect(self) -> None:
        def change(document: dict[str, Any]) -> None:
            document["jsonSchemaDialect"] = "http://json-schema.org/draft-07/schema#"

        self.assert_invalid(mutate(change), "schemas", "unsupported dialect")

    def test_rules_resolve_only_vendored_or_bundled_resources(self) -> None:
        registry = check_oas31.build_registry(check_oas31.load_oas_schema())

        def validator(ref: str) -> Draft202012Validator:
            return Draft202012Validator({"$ref": ref}, registry=registry)

        self.assertFalse(validator(check_oas31.OAS_SCHEMA_ID).is_valid({"openapi": "3.1.0"}))
        self.assertTrue(validator("https://json-schema.org/draft/2020-12/schema").is_valid({}))
        with self.assertRaises(Unresolvable) as caught:
            validator("https://spec.openapis.org/oas/3.1/schema-base/2025-09-15").is_valid({})
        with self.assertRaises(Unretrievable) as caught:
            registry.get_or_retrieve("https://example.com/schema.json")
        self.assertIsInstance(caught.exception.__cause__, check_oas31.ExternalReferenceError)


if __name__ == "__main__":
    unittest.main()
