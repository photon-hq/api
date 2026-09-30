"""The Python naming check maps generated classes to contract components."""

import json
import tempfile
import unittest
from pathlib import Path

from check_naming import model_sources, violations

FIXTURES = Path(__file__).resolve().parents[1] / "openapi/fixtures/naming"


def load(name: str) -> tuple[str, dict]:
    path = FIXTURES / f"{name}.json"
    return str(path), json.loads(path.read_text())


class NamingCheckTests(unittest.TestCase):
    def test_named_contract_produces_only_component_classes(self):
        path, contract = load("named")
        models = model_sources(path)
        self.assertIn("Widget", {model["name"] for model in models})
        self.assertEqual(violations(models, contract), [])

    def test_unnamed_contract_reports_nested_classes_with_pointers(self):
        path, contract = load("unnamed")
        found = violations(model_sources(path), contract, contract)
        pointers = {(item["rule"], item["pointer"]) for item in found}
        self.assertIn(
            ("nested-class", "/components/schemas/Photon20260701_Widget/properties/owner/anyOf/0"),
            pointers,
        )
        self.assertTrue(all(item["check"] == "python" for item in found))

    def test_hoisted_renamed_and_counter_classes_fail(self):
        contract = {"components": {"schemas": {"Address": {}, "address": {}}}}
        models = [
            {
                "name": "Address",
                "kind": "BaseModel",
                "path": "sdk.json#/components/schemas/Address",
            },
            {
                "name": "Address1",
                "kind": "BaseModel",
                "path": "sdk.json#/components/schemas/address",
            },
            {
                "name": "ListAddressesResponse200ApplicationJson",
                "kind": "BaseModel",
                "path": "sdk.json#/components/schemas/ListAddressesResponse200ApplicationJson",
            },
            {
                "name": "Metadata64",
                "kind": "BaseModel",
                "path": "sdk.json#/components/schemas/Address/properties/metadata",
            },
        ]
        self.assertEqual(
            [(item["rule"], item["name"]) for item in violations(models, contract)],
            [
                ("hoisted-root", "ListAddressesResponse200ApplicationJson"),
                ("property-counter", "Metadata64"),
                ("renamed-class", "Address1"),
            ],
        )

    def test_classes_removed_by_root_collapse_are_not_sdk_types(self):
        contract = {
            "openapi": "3.1.0",
            "info": {"title": "Collapsed items", "version": "1"},
            "paths": {},
            "components": {
                "schemas": {
                    "Egress": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "ipAddresses": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "format": "ipv4",
                                    "pattern": "^[0-9.]+$",
                                },
                                "minItems": 1,
                                "uniqueItems": True,
                            }
                        },
                        "required": ["ipAddresses"],
                    }
                }
            },
        }
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "sdk.json"
            path.write_text(json.dumps(contract))
            models = model_sources(str(path))
        self.assertEqual([model["name"] for model in models], ["Egress"])
        self.assertEqual(violations(models, contract, contract), [])


if __name__ == "__main__":
    unittest.main()
