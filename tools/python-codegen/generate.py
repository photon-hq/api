"""Run the pinned generator with the tested root-collapse indexing adapter."""

import faulthandler
import json
import re
import sys
import tempfile
import time
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass, field
from pathlib import Path

import absent_properties
import fallback_unions
import intersections
import prefix_items
import ref_defaults
import sdk_types
from collapse import install
from datamodel_code_generator.__main__ import main
from datamodel_code_generator.parser import base

INPUT = "openapi/sdk.json"
OUTPUT = "packages/python/src/photon_api/generated/models.py"
CONFIG = "config/sdk.json"
COMPONENT_PREFIX = "#/components/schemas/"


def lane(config_path: str = CONFIG) -> str:
    """`public` for the production SDK configuration (as laneFor in prepare-sdk.ts)."""
    path = Path(config_path)
    if not path.is_file():
        return "internal"
    return (
        "public" if json.loads(path.read_text()).get("environment") == "production" else "internal"
    )


def keep_components(config_path: str = CONFIG) -> bool:
    """The public lane exports every contract component, so root collapse keeps them."""
    return lane(config_path) == "public"


def arguments(input_path: str = INPUT, output_path: str = OUTPUT) -> list[str]:
    """Generator options. check_naming.py parses the input with the same ones."""
    return [
        "--input",
        input_path,
        "--input-file-type",
        "openapi",
        "--output",
        output_path,
        "--output-model-type",
        "pydantic_v2.BaseModel",
        "--base-class",
        "photon_api._model_base.BaseModel",
        "--target-python-version",
        "3.11",
        "--use-standard-collections",
        "--use-union-operator",
        "--use-schema-description",
        "--use-field-description",
        "--use-missing-sentinel",
        "--strict-nullable",
        # Enums are Literal types; sdk_types.py opens those with several values.
        "--enum-field-as-literal",
        "all",
        # Models keep members the SDK does not know (a response may gain fields).
        "--extra-fields",
        "allow",
        "--collapse-root-models",
        "--disable-timestamp",
        "--formatters",
        "ruff-format",
    ]


def check_arguments(values: list[str]) -> None:
    if "--collapse-root-models-name-strategy" in values or any(
        value.startswith("--collapse-root-models-name-strategy=") for value in values
    ):
        raise SystemExit("The root-collapse adapter supports the default naming strategy only")


@dataclass
class Preparation:
    """Input rewrites (sdk_types, ref_defaults, intersections, prefix_items,
    absent_properties), the allOf validators they need (intersections) and the
    platform unions read in order (fallback_unions)."""

    constraints: dict[str, list[str]] = field(default_factory=dict)
    prefix_arrays: list[str] = field(default_factory=list)
    absent: list[str] = field(default_factory=list)
    fallback_unions: list[str] = field(default_factory=list)
    operation_models: frozenset[str] = frozenset()

    def preserve(self) -> frozenset[str]:
        """Components whose root model is never inlined where it is used.

        Includes, for the internal lane (the public lane keeps every
        component), the components an operation's parameter or body schema is
        exactly a `$ref` to (the RPC facade types it as `models.<Component>`)
        and the platform unions that fallback_unions.pin annotates.
        """
        return frozenset(self.constraints) | self.operation_models | frozenset(self.fallback_unions)

    def finish(self, source: str) -> str:
        source = intersections.add_validators(source, self.constraints)
        classes = [python_model_name(name) for name in self.fallback_unions]
        return fallback_unions.pin(source, classes)


def operation_components(document: dict) -> frozenset[str]:
    """Components an operation parameter's or body's schema is exactly a `$ref` to."""

    def resolve(value: object) -> object:
        for _ in range(20):
            reference = value.get("$ref") if isinstance(value, dict) else None
            if not (
                isinstance(reference, str) and reference.startswith("#/components/parameters/")
            ):
                return value
            value = document["components"]["parameters"][reference.rsplit("/", 1)[1]]
        return value

    def media(holder: object) -> list:
        content = holder.get("content") if isinstance(holder, dict) else None
        return [
            value.get("schema") for value in (content or {}).values() if isinstance(value, dict)
        ]

    found = set()
    for item in document.get("paths", {}).values():
        operations = [item, *(value for value in item.values() if isinstance(value, dict))]
        for holder in operations:
            schemas = [
                resolve(parameter).get("schema", {})
                for parameter in (holder.get("parameters", []) if isinstance(holder, dict) else [])
            ]
            schemas += media(holder.get("requestBody"))
            for response in (holder.get("responses") or {}).values():
                schemas += media(response)
            for schema in schemas:
                reference = schema.get("$ref") if isinstance(schema, dict) else None
                if isinstance(reference, str) and reference.startswith(COMPONENT_PREFIX):
                    found.add(reference.removeprefix(COMPONENT_PREFIX))
    return frozenset(found)


def _option(values: list[str], option: str) -> int | None:
    return values.index(option) + 1 if option in values else None


@contextmanager
def prepared(values: list[str]) -> Iterator[tuple[list[str], Preparation]]:
    """Generator options with the rewritten input, and the preparation to finish."""
    index = _option(values, "--input")
    if index is None:
        yield values, Preparation()
        return
    source = Path(values[index])
    document = json.loads(source.read_text())
    # First: the rewrites below see types only.
    sdk_types.rewrite(document)
    ref_defaults.rewrite(document)
    preparation = Preparation(
        intersections.rewrite(document),
        prefix_items.rewrite(document),
        absent_properties.rewrite(document),
        operation_models=operation_components(document),
        fallback_unions=fallback_unions.fallback_unions(document),
    )
    with tempfile.TemporaryDirectory() as directory:
        # Same file name: the generator records it in references and the header.
        target = Path(directory) / source.name
        target.write_text(json.dumps(document))
        prepared_values = list(values)
        prepared_values[index] = str(target)
        yield prepared_values, preparation


def python_model_name(component: str) -> str:
    """The class name of a component: each word capitalized, separators dropped.

    tools/openapi/src/generate-facades.ts (pythonModelName) writes these names
    into the RPC facade, and the conformance gate looks error models up by
    them, so `run` fails when the generator names a component differently.
    """
    # The generator puts `field` before a name that does not start with a
    # letter (`__schema0` becomes `FieldSchema0`).
    if not re.match(r"[A-Za-z]", component):
        component = f"field_{component}"
    return "".join(w[0].upper() + w[1:] for w in re.split(r"[^A-Za-z0-9]+", component) if w)


@contextmanager
def parsed_models() -> Iterator[list]:
    """Class name, kind and source reference of every model the parser produced.

    Includes models that root collapse later inlines and removes.
    """
    models: list[dict] = []
    original = base.Parser.parse

    def parse(self, *args, **kwargs):
        result = original(self, *args, **kwargs)
        models[:] = [
            {"name": model.class_name, "kind": type(model).__name__, "path": model.reference.path}
            for model in self.results
        ]
        return result

    base.Parser.parse = parse
    try:
        yield models
    finally:
        base.Parser.parse = original


def component_classes(models: list[dict]) -> dict[str, str]:
    """Component name -> generated class name, checked against python_model_name."""
    classes: dict[str, str] = {}
    for model in models:
        fragment = model["path"].partition("#")[2]
        name = fragment.removeprefix("/components/schemas/")
        if name == fragment or "/" in name:
            continue
        component = name.replace("~1", "/").replace("~0", "~")
        classes[component] = model["name"]
    wrong = {c: n for c, n in classes.items() if n != python_model_name(c)}
    if wrong:
        listed = ", ".join(f"{c} -> {n}" for c, n in sorted(wrong.items())[:10])
        raise SystemExit(
            f"The generator named {len(wrong)} component(s) differently from "
            f"python_model_name (the RPC facade would reference missing classes): {listed}"
        )
    return classes


def run(values: list[str]) -> int:
    check_arguments(values)
    with prepared(values) as (values, preparation), parsed_models() as models:
        install(keep_components=keep_components(), preserve=preparation.preserve())
        status = main(values)
        index = _option(values, "--output")
        if status == 0 and index is not None:
            output = Path(values[index])
            component_classes(models)
            output.write_text(preparation.finish(output.read_text()))
    return status


if __name__ == "__main__":
    # Explicit options replace the pipeline's (the adapter regression tests use their own).
    started = time.monotonic()
    faulthandler.dump_traceback_later(60, repeat=True)
    try:
        sys.exit(run(sys.argv[1:] or arguments()))
    finally:
        faulthandler.cancel_dump_traceback_later()
        print(f"Python model generation: {time.monotonic() - started:.1f}s", file=sys.stderr)
