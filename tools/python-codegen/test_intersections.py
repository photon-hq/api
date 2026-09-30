"""Union-narrowing components and public-lane components keep contract names."""

import ast
import copy
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from intersections import add_validators, rewrite

REPO = Path(__file__).resolve().parents[2]


def ref(name: str) -> dict[str, str]:
    return {"$ref": f"#/components/schemas/{name}"}


def platform_object(platform: str) -> dict:
    return {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "platform": {"type": "string", "const": platform},
            "id": ref("ItemId"),
        },
        "required": ["platform", "id"],
    }


SCHEMAS = {
    "ItemId": {"type": "string", "pattern": "^itm_[0-9]+$"},
    "Platform": {"type": "string", "enum": ["sms", "email"]},
    "SmsItem": platform_object("sms"),
    "VoiceItem": platform_object("voice"),
    "EmailSent": platform_object("email"),
    "EmailItem": {"oneOf": [ref("EmailSent"), ref("EmailDraft")]},
    "EmailDraft": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "platform": {"type": "string", "const": "email"},
            "draft": {"type": "boolean"},
        },
        "required": ["platform", "draft"],
    },
    "Item": {"anyOf": [ref("SmsItem"), ref("VoiceItem"), ref("EmailItem")]},
    "SupportedPlatform": {
        "type": "object",
        "additionalProperties": True,
        "properties": {"platform": ref("Platform")},
        "required": ["platform"],
    },
    "SupportedItem": {
        "allOf": [ref("Item"), ref("SupportedPlatform")],
        "description": "An item on a supported platform.",
    },
    "ItemPage": {
        "type": "object",
        "additionalProperties": False,
        "properties": {"items": {"type": "array", "items": ref("SupportedItem")}},
        "required": ["items"],
    },
    "ItemIds": {
        "type": "object",
        "additionalProperties": False,
        "properties": {"ids": {"type": "array", "items": ref("ItemId")}},
        "required": ["ids"],
    },
}


def document() -> dict:
    return {
        "openapi": "3.1.0",
        "info": {"title": "Python intersection regression", "version": "1"},
        "paths": {},
        "components": {"schemas": copy.deepcopy(SCHEMAS)},
    }


def generate(document: dict, environment: str | None) -> str:
    """Run generate.sh in a scratch repository; return the generated models module."""
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        (root / "openapi").mkdir()
        (root / "openapi/sdk.json").write_text(json.dumps(document))
        if environment is not None:
            (root / "config").mkdir()
            (root / "config/sdk.json").write_text(json.dumps({"environment": environment}))
        shutil.copytree(REPO / "tools/python-codegen", root / "tools/python-codegen")
        package = root / "packages/python"
        (package / "src/photon_api/generated").mkdir(parents=True)
        for path in ["__init__.py", "generated/__init__.py", "rpc_generated.py"]:
            (package / "src/photon_api" / path).write_text("")
        shutil.copy2(REPO / "packages/python/pyproject.toml", package / "pyproject.toml")
        env = dict(os.environ, PYTHON_BIN=sys.executable)
        env["RUFF_BIN"] = str(Path(sys.executable).parent / "ruff")
        subprocess.run(
            ["bash", "tools/python-codegen/generate.sh"],
            cwd=root,
            env=env,
            capture_output=True,
            check=True,
            timeout=60,
        )
        return (package / "src/photon_api/generated/models.py").read_text()


def defined(source: str) -> set[str]:
    return {node.name for node in ast.parse(source).body if isinstance(node, ast.ClassDef)}


def probe(source: str, cases: list[dict]) -> subprocess.CompletedProcess:
    """Validate each case with the generated module and the real model base."""
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        (root / "models.py").write_text(source)
        (root / "cases.json").write_text(json.dumps(cases))
        script = """
import json
import models
from pydantic import ValidationError

for case in json.load(open('cases.json')):
    try:
        value = getattr(models, case['model']).model_validate(case['value'])
    except ValidationError:
        assert not case['accepts'], case
    else:
        assert case['accepts'], case
        assert value.model_dump(mode='json', by_alias=True) == case['value'], case
"""
        env = dict(os.environ, PYTHONPATH=f"{root}{os.pathsep}{REPO / 'packages/python/src'}")
        return subprocess.run(
            [sys.executable, "-B", "-c", script],
            cwd=root,
            env=env,
            capture_output=True,
            text=True,
            timeout=60,
        )


class RewriteTests(unittest.TestCase):
    def test_rewrites_only_a_union_narrowed_by_object_components(self):
        source = document()
        schemas = source["components"]["schemas"]
        schemas["InlineConstraint"] = {"allOf": [ref("Item"), {"type": "object"}]}
        schemas["TwoUnions"] = {"allOf": [ref("Item"), ref("EmailItem")]}
        schemas["ScalarConstraint"] = {"allOf": [ref("Item"), ref("ItemId")]}
        schemas["Objects"] = {"allOf": [ref("SmsItem"), ref("SupportedPlatform")]}
        untouched = copy.deepcopy(
            {
                name: schemas[name]
                for name in schemas
                if name not in ("SupportedItem", "InlineConstraint")
            }
        )
        self.assertEqual(
            rewrite(source),
            {
                "InlineConstraint": ["InlineConstraintConstraint1"],
                "SupportedItem": ["SupportedPlatform"],
            },
        )
        # An inline object constraint becomes a component first.
        self.assertEqual(schemas["InlineConstraintConstraint1"], {"type": "object"})
        self.assertEqual(schemas["InlineConstraint"], {"$ref": "#/components/schemas/Item"})
        self.assertEqual(
            schemas["SupportedItem"],
            {
                "$ref": "#/components/schemas/Item",
                "description": "An item on a supported platform.",
            },
        )
        self.assertEqual({name: schemas[name] for name in untouched}, untouched)

    def test_validator_requires_generated_root_models(self):
        with self.assertRaisesRegex(SystemExit, "were not generated: Missing"):
            add_validators("class Other(RootModel[int]):\n    root: int\n", {"Missing": ["Other"]})
        with self.assertRaisesRegex(SystemExit, "is not a root model"):
            add_validators(
                "class Base(BaseModel):\n    pass\n\nclass Item(Base):\n    pass\n",
                {"Item": ["Base"]},
            )


class GenerationTests(unittest.TestCase):
    def test_public_lane_uses_only_component_names_and_checks_the_intersection(self):
        source = generate(document(), "production")
        self.assertEqual(defined(source) - set(SCHEMAS), set())
        # A root model that one field used is inlined there but keeps its class.
        self.assertIn("ItemId", defined(source))
        tree = ast.parse(source)
        page = next(n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == "ItemPage")
        self.assertIn("list[SupportedItem]", ast.unparse(page))

        sms = {"platform": "sms", "id": "itm_1"}
        voice = {"platform": "voice", "id": "itm_2"}
        email = {"platform": "email", "id": "itm_3"}
        draft = {"platform": "email", "draft": True}
        cases = [
            {"model": "Item", "value": voice, "accepts": True},
            {"model": "SupportedItem", "value": sms, "accepts": True},
            {"model": "SupportedItem", "value": email, "accepts": True},
            {"model": "SupportedItem", "value": draft, "accepts": True},
            # Enums are open and patterns are left to the service; the
            # constraint still requires its members and their types.
            {"model": "SupportedItem", "value": voice, "accepts": True},
            {"model": "SupportedItem", "value": {"platform": "sms", "id": "x"}, "accepts": True},
            {"model": "SupportedItem", "value": {"platform": "sms"}, "accepts": False},
            {"model": "SupportedItem", "value": {"platform": 1, "id": "itm_1"}, "accepts": False},
            {"model": "ItemPage", "value": {"items": [sms, draft]}, "accepts": True},
            {"model": "ItemPage", "value": {"items": [sms, voice]}, "accepts": True},
            {"model": "ItemIds", "value": {"ids": ["itm_4"]}, "accepts": True},
            {"model": "ItemIds", "value": {"ids": ["x"]}, "accepts": True},
            {"model": "ItemIds", "value": {"ids": [1]}, "accepts": False},
        ]
        checked = probe(source, cases)
        self.assertEqual(checked.returncode, 0, checked.stderr)

    def test_internal_lane_validates_an_inline_constraint(self):
        # The internal lane's hoisted operation schemas write the constraint inline.
        source = document()
        schemas = source["components"]["schemas"]
        schemas["SupportedItem"] = {
            "allOf": [ref("Item"), copy.deepcopy(SCHEMAS["SupportedPlatform"])]
        }
        generated = generate(source, None)
        sms = {"platform": "sms", "id": "itm_1"}
        cases = [
            {"model": "SupportedItem", "value": sms, "accepts": True},
            {"model": "SupportedItem", "value": {"platform": "sms", "id": "x"}, "accepts": True},
            {"model": "SupportedItem", "value": {"platform": "sms"}, "accepts": False},
            {"model": "SupportedItem", "value": {"platform": 1, "id": "itm_1"}, "accepts": False},
        ]
        checked = probe(generated, cases)
        self.assertEqual(checked.returncode, 0, checked.stderr)

    def test_internal_lane_validates_a_nested_narrowed_union(self):
        # A hoisted list response: `items` is the narrowed union, written inline.
        source = document()
        schemas = source["components"]["schemas"]
        schemas["ItemPage"]["properties"]["items"]["items"] = {
            "allOf": [ref("Item"), copy.deepcopy(SCHEMAS["SupportedPlatform"])]
        }
        # Only what an operation reaches is hoisted.
        source["paths"] = {
            "/items": {
                "get": {
                    "responses": {
                        "200": {
                            "description": "Items",
                            "content": {"application/json": {"schema": ref("ItemPage")}},
                        }
                    }
                }
            }
        }
        generated = generate(source, None)
        sms = {"platform": "sms", "id": "itm_1"}
        voice = {"platform": "voice", "id": "itm_2"}
        cases = [
            {"model": "ItemPage", "value": {"items": [sms]}, "accepts": True},
            {"model": "ItemPage", "value": {"items": [voice]}, "accepts": True},
            {"model": "ItemPage", "value": {"items": [{**sms, "extra": 1}]}, "accepts": True},
            {"model": "ItemPage", "value": {"items": [{"platform": "sms"}]}, "accepts": False},
        ]
        checked = probe(generated, cases)
        self.assertEqual(checked.returncode, 0, checked.stderr)

    def test_internal_lane_keeps_upstream_root_collapse(self):
        schemas = {name: SCHEMAS[name] for name in ["ItemId", "ItemIds"]}
        source = generate({**document(), "components": {"schemas": schemas}}, None)
        self.assertNotIn("ItemId", defined(source))
        self.assertEqual(
            generate({**document(), "components": {"schemas": schemas}}, "staging"), source
        )


if __name__ == "__main__":
    unittest.main()
