"""The generator input keeps types only, with open enums."""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from sdk_types import rewrite
from test_intersections import REPO, document, generate, probe

JSON_VALUE = {
    "anyOf": [
        {"type": "string"},
        {"type": "number"},
        {"type": "boolean"},
        {"type": "array", "items": {"$ref": "#/components/schemas/JsonValue"}},
        {"type": "object", "additionalProperties": {"$ref": "#/components/schemas/JsonValue"}},
        {"type": "null"},
    ]
}


def contract(schemas: dict) -> dict:
    return {
        "openapi": "3.1.0",
        "info": {"title": "t", "version": "1"},
        "paths": {},
        "components": {"schemas": schemas},
    }


class SdkTypesTest(unittest.TestCase):
    def test_rewrite_keeps_types_and_opens_enums(self):
        source = contract(
            {
                "Name": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 3,
                    "pattern": "^a",
                    "format": "email",
                },
                "When": {"type": "string", "format": "date-time", "pattern": "^\\d"},
                "File": {"type": "string", "format": "binary"},
                "Count": {"type": "integer", "minimum": 0, "maximum": 9, "multipleOf": 3},
                "Tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 1,
                    "uniqueItems": True,
                },
                "Pair": {
                    "type": "array",
                    "prefixItems": [{"type": "string"}, {"type": "integer"}],
                    "items": False,
                    "minItems": 2,
                    "maxItems": 2,
                },
                "State": {"type": "string", "enum": ["on", "off"], "description": "d"},
                "Maybe": {"type": ["string", "null"], "enum": ["on", "off", None]},
                "Level": {"type": "integer", "enum": [1, 2]},
                "Kind": {"type": "string", "enum": ["only"]},
                "Mailbox": {
                    "type": "string",
                    "oneOf": [{"type": "string"}, {"type": "string", "pattern": "x"}],
                },
            }
        )
        rewrite(source)
        schemas = source["components"]["schemas"]
        self.assertEqual(schemas["Name"], {"type": "string"})
        self.assertEqual(schemas["When"], {"type": "string"})
        self.assertEqual(schemas["File"], {"type": "string", "format": "binary"})
        self.assertEqual(schemas["Count"], {"type": "integer"})
        self.assertEqual(schemas["Tags"], {"type": "array", "items": {"type": "string"}})
        self.assertEqual((schemas["Pair"]["minItems"], schemas["Pair"]["maxItems"]), (2, 2))
        self.assertEqual(
            schemas["State"],
            {
                "description": "d",
                "anyOf": [{"type": "string", "enum": ["on", "off"]}, {"type": "string"}],
            },
        )
        self.assertEqual(schemas["Maybe"]["anyOf"][-1], {"type": "null"})
        self.assertEqual(
            schemas["Level"]["anyOf"], [{"type": "integer", "enum": [1, 2]}, {"type": "integer"}]
        )
        self.assertEqual(schemas["Kind"], {"type": "string", "enum": ["only"]})
        self.assertEqual(schemas["Mailbox"], {"type": "string"})

    def test_rewrite_lists_integer_before_number_in_unions(self):
        source = contract(
            {
                "JsonValue": JSON_VALUE,
                "Scalar": {"type": ["boolean", "number", "string"]},
                "Double": {"anyOf": [{"type": "number"}, {"type": "string"}]},
                "Amount": {"type": "number"},
                "MaybeAmount": {"anyOf": [{"type": "number"}, {"type": "null"}]},
                "NullableAmount": {"type": ["number", "null"]},
            }
        )
        rewrite(source)
        schemas = source["components"]["schemas"]
        kinds = [member["type"] for member in schemas["JsonValue"]["anyOf"]]
        self.assertEqual(kinds[:3], ["string", "integer", "number"])
        self.assertEqual(schemas["Scalar"]["type"], ["boolean", "integer", "number", "string"])
        self.assertEqual(
            schemas["Double"]["anyOf"],
            [{"type": "integer"}, {"type": "number"}, {"type": "string"}],
        )
        # A number alone (or nullable) keeps its float type.
        self.assertEqual(schemas["Amount"], {"type": "number"})
        self.assertEqual(schemas["MaybeAmount"]["anyOf"], [{"type": "number"}, {"type": "null"}])
        self.assertEqual(schemas["NullableAmount"]["type"], ["number", "null"])

    def test_generated_json_values_keep_integers_and_decimals(self):
        source = document()
        source["components"]["schemas"] = {
            "JsonValue": JSON_VALUE,
            "Holder": {
                "type": "object",
                "additionalProperties": {"$ref": "#/components/schemas/JsonValue"},
            },
        }
        generated = generate(source, None)
        cases = ['{"parts":1}', '{"x":1.5}', '{"n":[1,2.0,true,"1",null,{"k":-3}]}']
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "models.py").write_text(generated)
            script = (
                "import json, sys, models\n"
                "for text in json.loads(sys.argv[1]):\n"
                "    dumped = models.Holder.model_validate_json(text).model_dump_json()\n"
                "    assert dumped == text, (text, dumped)\n"
            )
            env = dict(os.environ, PYTHONPATH=f"{root}{os.pathsep}{REPO / 'packages/python/src'}")
            checked = subprocess.run(
                [sys.executable, "-B", "-c", script, json.dumps(cases)],
                cwd=root,
                env=env,
                capture_output=True,
                text=True,
                timeout=60,
            )
        self.assertEqual(checked.returncode, 0, checked.stderr)

    def test_generated_models_accept_later_values_and_unknown_members(self):
        source = document()
        source["components"]["schemas"] = {
            "Status": {"type": "string", "enum": ["active", "paused"]},
            "Item": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "status": {"$ref": "#/components/schemas/Status"},
                    "name": {"type": "string", "maxLength": 2},
                },
                "required": ["status"],
            },
        }
        for environment in (None, "production"):
            generated = generate(source, environment)
            cases = [
                {"model": "Item", "value": {"status": "active"}, "accepts": True},
                {
                    "model": "Item",
                    "value": {"status": "archived", "name": "long name"},
                    "accepts": True,
                },
                {
                    "model": "Item",
                    "value": {"status": "active", "later": {"x": 1}},
                    "accepts": True,
                },
                {"model": "Item", "value": {"status": 1}, "accepts": False},
                {"model": "Item", "value": {}, "accepts": False},
            ]
            checked = probe(generated, cases)
            self.assertEqual(checked.returncode, 0, checked.stderr)


if __name__ == "__main__":
    unittest.main()
