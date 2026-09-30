"""Compare live reference queries and generated output with the pinned upstream."""

import ast
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import sdk_types
from collapse import CollapseStore, install
from datamodel_code_generator.model.pydantic_v2.base_model import BaseModel, DataModelField
from datamodel_code_generator.parser.generation import GenerationIndexBuilder, GenerationStore
from datamodel_code_generator.reference import Reference
from datamodel_code_generator.types import DataType


def model(name: str, data_type: DataType) -> BaseModel:
    return BaseModel(
        reference=Reference(path=f"#/{name}", name=name),
        fields=[DataModelField(name="value", data_type=data_type, required=True)],
    )


class ReferenceTests(unittest.TestCase):
    def assert_matches_upstream(
        self, store: CollapseStore, reference: Reference, excluded: DataType
    ) -> None:
        oracle = GenerationStore()
        oracle.models.extend(store.models)
        self.assertEqual(
            store.index.has_data_type_references_other_than(reference, excluded),
            oracle.index.has_data_type_references_other_than(reference, excluded),
        )

    def test_shared_copies_detached_temporaries_and_replaced_fields(self) -> None:
        target = Reference(path="#/Target", name="Target")
        shared = DataType(reference=target)
        original = DataType(data_types=[shared], is_list=True)
        shallow = original.model_copy()
        first = model("First", original)
        second = model("Second", shallow)
        other = DataType(reference=target)
        third = model("Third", other)
        # Registered reverse links alone do not establish reachability.
        detached = DataType(reference=target)
        store = CollapseStore()
        store.models.extend([first, second, third])
        with store._collapse_root_reference_scope():
            self.assert_matches_upstream(store, target, other)
            store.replace_field_type(first.fields[0], DataType(type="str"))
            # The shared node has a stale parent path, but remains in Second.
            self.assert_matches_upstream(store, target, other)
            store.replace_field_type(second.fields[0], DataType(type="str"))
            self.assert_matches_upstream(store, target, other)
            self.assertFalse(store.index.has_data_type_references_other_than(target, other))
            self.assert_matches_upstream(store, target, detached)
            store.detach_data_type_ref(other)
            self.assert_matches_upstream(store, target, detached)

    def test_missing_reverse_links_dictionary_keys_and_nested_replacements(self) -> None:
        target = Reference(path="#/Key", name="Key")
        key = DataType(reference=target)
        mapping = DataType(is_dict=True, dict_key=key, data_types=[DataType(type="str")])
        excluded = DataType(reference=target)
        owner = model("Mapping", mapping)
        store = CollapseStore()
        store.models.extend([owner, model("Excluded", excluded)])
        target.children.clear()
        with store._collapse_root_reference_scope():
            self.assert_matches_upstream(store, target, excluded)
            store.replace_nested_data_type(mapping, key, DataType(type="str"))
            self.assert_matches_upstream(store, target, excluded)
            self.assertFalse(store.index.has_data_type_references_other_than(target, excluded))
            replacement = DataType(reference=target)
            store.set_nested_data_types(mapping, [replacement])
            self.assert_matches_upstream(store, target, excluded)
            store.replace_data_type_ref(replacement, None)
            self.assert_matches_upstream(store, target, excluded)

    def test_base_reference_is_live_without_a_parent(self) -> None:
        parent = model("Parent", DataType(type="str"))
        child = BaseModel(
            reference=Reference(path="#/Child", name="Child"),
            fields=[],
            base_classes=[parent.reference],
        )
        excluded = DataType(reference=parent.reference)
        store = CollapseStore()
        store.models.extend([parent, child, model("Other", excluded)])
        with store._collapse_root_reference_scope():
            self.assert_matches_upstream(store, parent.reference, excluded)
            self.assertTrue(
                store.index.has_data_type_references_other_than(parent.reference, excluded)
            )

    def test_many_mutations_rebuild_the_graph_only_at_pass_boundaries(self) -> None:
        reference = Reference(path="#/Shared", name="Shared")
        store = CollapseStore()
        for index in range(120):
            store.models.append(model(f"Model{index}", DataType(reference=reference)))
        build = GenerationIndexBuilder.build
        builds = 0

        def counted(builder, *args, **kwargs):
            nonlocal builds
            builds += 1
            return build(builder, *args, **kwargs)

        with patch.object(GenerationIndexBuilder, "build", counted):
            with store._collapse_root_reference_scope():
                for index, owner in enumerate(store.models):
                    self.assertEqual(
                        store.index.has_data_type_references_other_than(
                            reference, owner.fields[0].data_type
                        ),
                        index < 119,
                    )
                    store.replace_field_type(owner.fields[0], DataType(type="str"))
            self.assertFalse(store.index.has_data_type_references(reference))
        self.assertLessEqual(builds, 2)

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
