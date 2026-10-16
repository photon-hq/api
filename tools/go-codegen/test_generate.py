"""Inline objects become named structs; only free-form objects stay maps.

The feature-coverage fixture cannot carry inline objects (the contract naming
gate requires a `$ref` for every object), so the generator is tested on
synthetic schemas here.
"""

import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import generate


def obj(properties: dict, required: tuple = (), **extra) -> dict:
    return {"type": "object", "additionalProperties": False, "properties": properties, "required": list(required), **extra}


SCHEMAS = {
    "Base": obj({"id": {"type": "string"}}, ("id",)),
    "Other": obj({"name": {"type": "string"}}, ("name",)),
    "Parent": obj(
        {
            "owner": obj({"name": {"type": "string"}, "address": obj({"city": {"type": "string"}}, ("city",))}, ("name",)),
            "latest": {**obj({"id": {"type": "string"}}, ("id",)), "type": ["object", "null"]},
            "previous": {"anyOf": [obj({"id": {"type": "string"}}, ("id",)), {"type": "null"}]},
            "entries": {"type": "array", "items": obj({"count": {"type": "integer"}}, ("count",))},
            "byKey": {"type": "object", "additionalProperties": obj({"ok": {"type": "boolean"}}, ("ok",))},
            "nullableEntries": {"type": "array", "items": {**obj({"count": {"type": "integer"}}, ("count",)), "type": ["object", "null"]}},
            "nullableByKey": {
                "type": "object",
                "additionalProperties": {"anyOf": [obj({"ok": {"type": "boolean"}}, ("ok",)), {"type": "null"}]},
            },
            "merged": {"allOf": [{"$ref": "#/components/schemas/Base"}, obj({"extra": {"type": "string"}})]},
            "open": {"type": "object", "additionalProperties": {}, "properties": {"x": {"type": "string"}}},
            "extras": {"type": "object", "additionalProperties": {}},
            "empty": obj({}),
            "variant": {
                **obj({"kind": {"type": "string"}}),
                "oneOf": [{"$ref": "#/components/schemas/Base"}, {"$ref": "#/components/schemas/Other"}],
            },
        },
        ("owner", "previous", "entries"),
    ),
    "Variant": {
        "anyOf": [{"$ref": "#/components/schemas/Base"}, {"$ref": "#/components/schemas/Other"}],
        "x-photon-extension": {"discriminator": "kind"},
    },
    "Status": {"type": "string", "enum": ["sent", "failed"]},
    "Narrowed": {
        "allOf": [
            {"$ref": "#/components/schemas/Variant"},
            obj({"status": {"$ref": "#/components/schemas/Status"}}, ("status",)),
        ]
    },
}


def render(name: str) -> str:
    with mock.patch.object(generate, "SCHEMAS", SCHEMAS), mock.patch.object(generate, "mapper", generate.Mapper()):
        return generate.gofmt("package photonapi\n\n" + generate.emit_model(name) + generate.drain())


def structs(source: str) -> dict[str, list[str]]:
    """Struct name -> its field lines, whitespace collapsed."""
    found = re.findall(r"^type (\w+) struct \{\n(.*?)^\}", source, re.M | re.S)
    return {name: [" ".join(line.split()) for line in body.splitlines()] for name, body in found}


class InlineObjectTest(unittest.TestCase):
    def test_inline_objects_are_named_structs(self):
        types = structs(render("Parent"))
        self.assertEqual(
            types["Parent"],
            [
                'Owner ParentOwner `json:"owner"`',
                'Latest Nullable[ParentLatest] `json:"latest,omitzero"`',
                'Previous *ParentPrevious `json:"previous"`',
                'Entries []ParentEntriesItem `json:"entries"`',
                'ByKey map[string]ParentByKeyValue `json:"byKey,omitempty"`',
                'NullableEntries []*ParentNullableEntriesItem `json:"nullableEntries,omitempty"`',
                'NullableByKey map[string]*ParentNullableByKeyValue `json:"nullableByKey,omitempty"`',
                'Merged *ParentMerged `json:"merged,omitempty"`',
                'Open *ParentOpen `json:"open,omitempty"`',
                'Extras map[string]any `json:"extras,omitempty"`',
                'Empty map[string]any `json:"empty,omitempty"`',
                'Variant *Union `json:"variant,omitempty"`',
            ],
        )
        self.assertEqual(
            types["ParentOwner"],
            ['Name string `json:"name"`', 'Address *ParentOwnerAddress `json:"address,omitempty"`'],
        )
        self.assertEqual(types["ParentOwnerAddress"], ['City string `json:"city"`'])
        self.assertEqual(types["ParentLatest"], ['ID string `json:"id"`'])
        self.assertEqual(types["ParentEntriesItem"], ['Count int64 `json:"count"`'])
        self.assertEqual(types["ParentByKeyValue"], ['Ok bool `json:"ok"`'])
        self.assertEqual(types["ParentMerged"], ['ID string `json:"id"`', 'Extra *string `json:"extra,omitempty"`'])
        self.assertEqual(types["ParentOpen"], ['X *string `json:"x,omitempty"`'])
        self.assertNotIn("ParentVariant", types)

    @unittest.skipUnless(shutil.which("go"), "needs the Go toolchain")
    def test_nullable_collection_elements_round_trip(self):
        # Compile the synthetic models into a copy of the package and round-trip
        # null items and values through encoding/json.
        roundtrip = """package photonapi

import (
	"encoding/json"
	"testing"
)

func TestSyntheticRoundTrip(t *testing.T) {
	const doc = `{"owner":{"name":"n"},"previous":null,"entries":[],"nullableEntries":[null,{"count":1}],"nullableByKey":{"a":null,"b":{"ok":true}}}`
	var value Parent
	if err := json.Unmarshal([]byte(doc), &value); err != nil {
		t.Fatal(err)
	}
	if value.NullableEntries[0] != nil || value.NullableEntries[1].Count != 1 || value.NullableByKey["a"] != nil || !value.NullableByKey["b"].Ok {
		t.Fatalf("decoded %+v", value)
	}
	back, err := json.Marshal(value)
	if err != nil || string(back) != doc {
		t.Fatalf("round trip = %s, %v", back, err)
	}
}
"""
        with tempfile.TemporaryDirectory() as tmp:
            package = Path(tmp) / "go"
            shutil.copytree(generate.PACKAGE_DIR, package, ignore=shutil.ignore_patterns("*_test.go"))
            (package / "synthetic_models_test.go").write_text(render("Parent"))
            (package / "synthetic_roundtrip_test.go").write_text(roundtrip)
            proc = subprocess.run(["go", "test", "-run", "TestSyntheticRoundTrip", "."], cwd=package, capture_output=True, text=True)
            self.assertEqual(proc.returncode, 0, proc.stdout + proc.stderr)

    def test_allof_over_a_union_stays_a_union(self):
        # The union's full surface survives: decoders for every member, the
        # union's discriminator, and one accessor per constraint member.
        source = render("Narrowed")
        self.assertIn("type Narrowed struct{ Union }", source)
        self.assertIn('func (u Narrowed) Kind() string { return u.Discriminator("kind") }', source)
        self.assertIn('func (u Narrowed) Status() string { return u.Discriminator("status") }', source)
        self.assertIn("func (u Narrowed) AsBase() (Base, error)", source)
        self.assertIn("func (u Narrowed) AsOther() (Other, error)", source)
        self.assertNotIn("type Narrowed struct {\n", source)

    def test_multi_status_responses_get_a_named_union(self):
        op = {
            "operationId": "changeThing", "rpcMethod": "change", "namespace": ["things"],
            "httpMethod": "POST", "path": "/v1/things", "safe": False, "idempotencyKeyRequired": False,
            "parameters": [],
            "responses": {
                "200": {"application/json": "#/components/schemas/Base"},
                "201": {"application/json": "#/components/schemas/Base"},
                "202": {"application/json": "#/components/schemas/Other"},
            },
        }
        node = generate.Node(("things",))
        with mock.patch.object(generate, "mapper", generate.Mapper()), mock.patch.object(generate, "RESPONSE_UNIONS", {}):
            structure, code = generate.emit_op(node, op)
        self.assertIn("type ChangeThingResponse struct {\n\tUnion\n\tstatus int\n}", structure)
        # Statuses sharing a schema share one decoder, gated on those statuses.
        self.assertEqual(structure.count("func (u ChangeThingResponse) AsBase()"), 1)
        self.assertIn("the body of status 200, 201", structure)
        self.assertIn("if u.status != 0 && u.status != 200 && u.status != 201 {", structure)
        self.assertIn("if u.status != 0 && u.status != 202 {", structure)
        self.assertIn("func (u ChangeThingResponse) Status() int { return u.status }", structure)
        self.assertIn("func (u *ChangeThingResponse) setStatus(code int) { u.status = code }", structure)
        self.assertIn("(*ChangeThingResponse, error)", code)

    def test_path_parameters_hoist_nothing(self):
        op = {
            "operationId": "getThing",
            "parameters": [{"location": "path", "name": "thing", "wireName": "thing", "required": True, "schema": obj({"id": {"type": "string"}})}],
        }
        with mock.patch.object(generate, "mapper", generate.Mapper()):
            fields = generate.param_fields(op)
            self.assertEqual(generate.mapper.hoisted, {})
        self.assertEqual(fields[0]["type"], "string")

    def test_conflicting_inline_objects_fail(self):
        mapper = generate.Mapper()
        mapper.hoist("ParentOwner", obj({"a": {"type": "string"}}))
        self.assertEqual(mapper.hoist("ParentOwner", obj({"a": {"type": "string"}})), "ParentOwner")
        with self.assertRaises(SystemExit):
            mapper.hoist("ParentOwner", obj({"b": {"type": "string"}}))
        with self.assertRaises(SystemExit):
            mapper.go_type(obj({"a": {"type": "string"}}))


if __name__ == "__main__":
    unittest.main()
