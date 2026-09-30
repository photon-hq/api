"""Run the production pipeline against OpenAPI presence and extra-field contracts."""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class ContractGenerationTests(unittest.TestCase):
    def test_source_values_survive_with_and_without_collapse_adapter(self):
        def ref(name):
            return {"$ref": f"#/components/schemas/{name}"}

        text = {"type": "string", "minLength": 2}
        fields = {"value": ref("Text")}
        schemas = {
            "Text": text,
            "Open": {"type": "object", "properties": fields, "required": ["value"]},
            "Closed": {
                "type": "object",
                "properties": fields,
                "required": ["value"],
                "additionalProperties": False,
            },
            "Typed": {
                "type": "object",
                "properties": fields,
                "required": ["value"],
                "additionalProperties": {"type": "integer", "minimum": 1},
            },
            "Presence": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "required": ref("Text"),
                    "requiredNullable": {"type": ["string", "null"]},
                    "optional": ref("Text"),
                    "nullable": {"type": ["string", "null"]},
                    "defaulted": {**text, "default": "ab"},
                    "external-id": ref("Text"),
                },
                "required": ["required", "requiredNullable"],
            },
            "Tree": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "value": ref("Text"),
                    "children": {"type": "array", "items": ref("Tree")},
                },
                "required": ["value"],
            },
            "Trees": {"type": "array", "items": ref("Tree"), "minItems": 1},
        }
        document = {
            "openapi": "3.1.0",
            "info": {"title": "Python contract regression", "version": "1"},
            "paths": {},
            "components": {"schemas": schemas},
        }
        cases = []

        def case(model, value, accepts):
            cases.append({"model": model, "value": value, "accepts": accepts})

        extra = {"value": "ab", "unknown": {"nested": [1, None, True]}}
        case("Open", extra, True)
        # Members the SDK does not know are kept, and validation keywords
        # (minLength, minimum, minItems) are left to the service.
        case("Closed", extra, True)
        for model in ["Open", "Closed", "Typed"]:
            case(model, {"value": "ab"}, True)
            case(model, {}, False)
            case(model, {"value": "x"}, True)
            case(model, {"value": None}, False)
        case("Typed", {"value": "ab", "count": 2}, True)
        case("Typed", {"value": "ab", "count": 0}, True)
        case("Typed", {"value": "ab", "count": "invalid"}, False)
        case("Typed", {"value": "ab", "count": None}, False)
        required = {"required": "ab", "requiredNullable": None}
        case("Presence", required, True)
        case("Presence", {}, False)
        case("Presence", {"required": "ab"}, False)
        case("Presence", {**required, "required": None}, False)
        for field in ["optional", "defaulted", "external-id"]:
            case("Presence", {**required, field: "cd"}, True)
            case("Presence", {**required, field: None}, False)
            case("Presence", {**required, field: "x"}, True)
        case("Presence", {**required, "nullable": None}, True)
        case("Presence", {**required, "nullable": "cd"}, True)
        tree = {"value": "ab", "children": [{"value": "cd"}]}
        case("Tree", tree, True)
        case("Tree", {"value": "ab", "children": None}, False)
        case("Tree", {"value": "ab", "children": [{"value": 1}]}, False)
        case("Trees", [tree], True)
        case("Trees", [], True)

        repo = Path(__file__).resolve().parents[2]
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "openapi").mkdir()
            (root / "openapi/sdk.json").write_text(json.dumps(document))
            shutil.copytree(repo / "tools/python-codegen", root / "tools/python-codegen")
            package = root / "packages/python"
            generated = package / "src/photon_api/generated"
            generated.mkdir(parents=True)
            for path in ["__init__.py", "generated/__init__.py", "rpc_generated.py"]:
                (package / "src/photon_api" / path).write_text("")
            shutil.copy2(repo / "packages/python/pyproject.toml", package / "pyproject.toml")
            shutil.copy2(
                repo / "packages/python/src/photon_api/_model_base.py",
                package / "src/photon_api/_model_base.py",
            )
            (root / "cases.json").write_text(json.dumps(cases))
            env = dict(os.environ, PYTHON_BIN=sys.executable)
            env["RUFF_BIN"] = str(Path(sys.executable).parent / "ruff")
            env["PYTHONPATH"] = str(package / "src")
            results = []
            for mode in ["adapter", "stock"]:
                if mode == "stock":
                    entry = root / "tools/python-codegen/generate.py"
                    source = entry.read_text()
                    for installation in [
                        "from collapse import install\n",
                        "        install(keep_components=keep_components(), "
                        "preserve=preparation.preserve())\n",
                    ]:
                        self.assertEqual(source.count(installation), 1)
                        source = source.replace(installation, "")
                    entry.write_text(source)
                subprocess.run(
                    ["bash", "tools/python-codegen/generate.sh"],
                    cwd=root,
                    env=env,
                    capture_output=True,
                    check=True,
                    timeout=60,
                )
                results.append((generated / "models.py").read_bytes())
                probe = """
import json
from photon_api.generated import models
from pydantic import ValidationError

for case in json.load(open('cases.json')):
    try:
        model = getattr(models, case['model']).model_validate(case['value'])
    except ValidationError:
        assert not case['accepts'], case
    else:
        assert case['accepts'], case
        wire = model.model_dump(mode='json', by_alias=True, exclude_unset=True)
        assert wire == case['value'], case
"""
                checked = subprocess.run(
                    [sys.executable, "-B", "-c", probe],
                    cwd=root,
                    env=env,
                    capture_output=True,
                    text=True,
                    timeout=60,
                )
                self.assertEqual(checked.returncode, 0, checked.stderr)
            self.assertEqual(results[0], results[1])


if __name__ == "__main__":
    unittest.main()
