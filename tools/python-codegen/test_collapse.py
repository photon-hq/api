"""The root-collapse adapter keeps upstream output and guards its upstream version."""

import ast
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import sdk_types
from collapse import install


class InstallTests(unittest.TestCase):
    def test_an_upstream_upgrade_requires_adapter_review(self) -> None:
        with (
            patch("collapse.version", return_value="99.0.0"),
            self.assertRaisesRegex(RuntimeError, "Review the root-collapse adapter"),
        ):
            install()


class GenerationTests(unittest.TestCase):
    def test_shared_recursive_models_match_unmodified_generator(self) -> None:
        def ref(name: str) -> dict[str, str]:
            return {"$ref": f"#/components/schemas/{name}"}

        schemas = {
            "Choice": {"anyOf": [{"type": "string"}, {"type": "integer"}, {"type": "null"}]},
            "Values": {"type": "array", "items": ref("Choice")},
            "JsonValue": {
                "anyOf": [
                    {"type": "string"},
                    {"type": "array", "items": ref("JsonValue")},
                    {"type": "object", "additionalProperties": ref("JsonValue")},
                ]
            },
            "Node": {
                "type": "object",
                "properties": {
                    "children": {"type": "array", "items": ref("Node")},
                    "values": ref("Values"),
                    "attributes": {"type": "object", "additionalProperties": ref("Choice")},
                    "json": ref("JsonValue"),
                },
            },
            "Named": {
                "type": "object",
                "required": ["name"],
                "properties": {"name": {"type": "string", "minLength": 2}},
            },
            "NamedNode": {"allOf": [ref("Node"), ref("Named")]},
        }
        for index in range(12):
            schemas[f"Envelope{index}"] = {
                "type": "object",
                "required": ["data"],
                "properties": {
                    "data": {"anyOf": [ref("Node"), ref("NamedNode")]},
                    "choice": ref("Choice"),
                    "values": ref("Values"),
                },
            }
        document = {
            "openapi": "3.1.0",
            "info": {"title": "Collapse regression", "version": "1"},
            "paths": {},
            "components": {"schemas": schemas},
        }
        # generate.py prepares its input (sdk_types.py); compare on that input.
        sdk_types.rewrite(document)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "input.json"
            output = root / "models.py"
            source.write_text(json.dumps(document))
            arguments = [
                "--input",
                str(source),
                "--input-file-type",
                "openapi",
                "--output",
                str(output),
                "--output-model-type",
                "pydantic_v2.BaseModel",
                "--target-python-version",
                "3.11",
                "--use-standard-collections",
                "--use-union-operator",
                "--use-schema-description",
                "--use-field-description",
                "--collapse-root-models",
                "--disable-timestamp",
                "--formatters",
                "ruff-format",
            ]
            upstream = [sys.executable, "-m", "datamodel_code_generator", *arguments]
            subprocess.run(upstream, check=True, capture_output=True, timeout=60)
            expected = output.read_text()
            wrapper = Path(__file__).with_name("generate.py")
            # No config/sdk.json in the scratch directory: the internal lane,
            # where root collapse is the upstream pass.
            subprocess.run(
                [sys.executable, str(wrapper), *arguments],
                cwd=root,
                check=True,
                capture_output=True,
                timeout=60,
            )
            self.assertEqual(output.read_text(), expected)
            compile(ast.parse(expected), str(output), "exec")


if __name__ == "__main__":
    unittest.main()
