"""An optional property whose referenced component has a default is not nullable."""

import unittest

from ref_defaults import rewrite
from test_intersections import document, generate, probe

SCHEMAS = {
    "Intent": {"type": "string", "enum": ["sso", "domain_verification"], "default": "sso"},
    "IntentAlias": {"$ref": "#/components/schemas/Intent"},
    "Request": {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "intent": {"$ref": "#/components/schemas/Intent"},
            "aliased": {"$ref": "#/components/schemas/IntentAlias", "description": "Alias."},
            "own": {"$ref": "#/components/schemas/Intent", "default": "domain_verification"},
            "returnTo": {"type": "string"},
        },
        "required": ["returnTo"],
        "example": {"properties": {"intent": {"$ref": "#/components/schemas/Intent"}}},
    },
}


class RefDefaultsTest(unittest.TestCase):
    def test_rewrite_copies_only_missing_referenced_defaults(self):
        source = {"components": {"schemas": {k: dict(v) for k, v in SCHEMAS.items()}}}
        source["components"]["schemas"]["Request"]["properties"] = {
            k: dict(v) for k, v in SCHEMAS["Request"]["properties"].items()
        }
        marked = rewrite(source)
        properties = source["components"]["schemas"]["Request"]["properties"]
        self.assertEqual(
            marked,
            [
                "/components/schemas/Request/properties/intent",
                "/components/schemas/Request/properties/aliased",
            ],
        )
        self.assertEqual(properties["intent"]["default"], "sso")
        self.assertEqual(properties["aliased"]["default"], "sso")
        self.assertEqual(properties["own"]["default"], "domain_verification")
        self.assertNotIn("default", properties["returnTo"])

    def test_generated_models_reject_null(self):
        source = document()
        source["components"]["schemas"] = SCHEMAS
        for environment in (None, "production"):
            generated = generate(source, environment)
            cases = [
                {
                    "model": "Request",
                    "value": {
                        "returnTo": "x",
                        "intent": "domain_verification",
                        "aliased": "sso",
                        "own": "sso",
                    },
                    "accepts": True,
                },
                {"model": "Request", "value": {"returnTo": "x", "intent": None}, "accepts": False},
                {"model": "Request", "value": {"returnTo": "x", "aliased": None}, "accepts": False},
                {"model": "Request", "value": {"returnTo": "x", "own": None}, "accepts": False},
            ]
            checked = probe(generated, cases)
            self.assertEqual(checked.returncode, 0, checked.stderr)
            # Not nullable; the enum is open (a later value is accepted).
            self.assertIn('Literal["sso", "domain_verification"] | str = "sso"', generated)


if __name__ == "__main__":
    unittest.main()
