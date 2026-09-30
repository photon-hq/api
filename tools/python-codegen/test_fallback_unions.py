import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

from fallback_unions import fallback_unions, pin

SOURCE = """from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, RootModel


class SmsUser(BaseModel):
    model_config = ConfigDict(extra="allow")
    platform: Literal["sms"]


class UnknownUser(BaseModel):
    model_config = ConfigDict(extra="allow")
    platform: str
    id: str | None = None


class User(RootModel[SmsUser | UnknownUser]):
    root: (
        SmsUser
        | UnknownUser
    )
"""


def load(source: str):
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "pinned_models.py"
        path.write_text(source)
        spec = importlib.util.spec_from_file_location("pinned_models", path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        try:
            spec.loader.exec_module(module)
        finally:
            del sys.modules[spec.name]
        return module


class FallbackUnionTest(unittest.TestCase):
    def test_lists_unions_whose_last_member_is_their_fallback(self):
        ref = lambda name: {"$ref": f"#/components/schemas/{name}"}  # noqa: E731
        extension = {"discriminator": "platform", "fallback": "#/$defs/UnknownUser"}
        document = {
            "components": {
                "schemas": {
                    "User": {
                        "anyOf": [ref("SmsUser"), ref("UnknownUser")],
                        "x-photon-extension": extension,
                    },
                    # A request's known platforms only.
                    "UserInput": {"anyOf": [ref("SmsUser")], "x-photon-extension": extension},
                    "Plain": {"anyOf": [ref("SmsUser"), ref("UnknownUser")]},
                }
            }
        }
        self.assertEqual(fallback_unions(document), ["User"])

    def test_a_known_platform_stays_its_member_when_it_gains_a_member_the_fallback_declares(self):
        value = {"platform": "sms", "id": "u1"}
        # Smart mode prefers the member that sets more fields: here the fallback.
        self.assertEqual(type(load(SOURCE).User.model_validate(value).root).__name__, "UnknownUser")
        pinned = pin(SOURCE, ["User"])
        self.assertIn('Field(union_mode="left_to_right")', pinned)
        self.assertIn("from typing import Annotated\n", pinned)
        models = load(pinned)
        self.assertIsInstance(models.User.model_validate(value).root, models.SmsUser)
        later = models.User.model_validate({"platform": "fax", "id": "u2"})
        self.assertIsInstance(later.root, models.UnknownUser)
        self.assertEqual(later.model_dump(mode="json"), {"platform": "fax", "id": "u2"})

    def test_fails_when_a_listed_union_has_no_root_model(self):
        self.assertEqual(pin(SOURCE, []), SOURCE)
        with self.assertRaises(SystemExit):
            pin(SOURCE, ["Missing"])


if __name__ == "__main__":
    unittest.main()
