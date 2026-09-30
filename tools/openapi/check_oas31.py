#!/usr/bin/env python3
"""Validate OpenAPI documents against the official OpenAPI 3.1 rules.

Three checks run for every document:

1. structure: the whole document against the vendored OpenAPI 3.1 schema
   published at spec.openapis.org (tools/openapi/spec/oas-3.1).
2. schemas: every Schema Object against the JSON Schema 2020-12 meta-schema.
   The OpenAPI schema above only checks that a Schema Object is an object or a
   boolean, so the Schema Objects are validated separately.
3. references: every "$ref" is a local JSON pointer that resolves inside the
   document. Published documents must be self-contained.

Everything is resolved offline. The JSON Schema 2020-12 meta-schemas ship with
the pinned jsonschema-specifications package and the OpenAPI schema is
vendored; any other reference fails loudly instead of being fetched.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from collections.abc import Iterator
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from typing import Any
from urllib.parse import unquote

from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

SPEC_DIR = Path(__file__).resolve().parent / "spec" / "oas-3.1"
OAS_SCHEMA_ID = "https://spec.openapis.org/oas/3.1/schema/2025-09-15"
OAS_SCHEMA_FILE = SPEC_DIR / "schema-2025-09-15.json"
OAS_SCHEMA_SHA256 = "d0a3955182364c7b5fdebfd0583ecad259a870b4a2fe86a1b0fe8785f8224fed"

# Schema Objects use this dialect unless a document declares another one.
SUPPORTED_DIALECTS = {
    "https://json-schema.org/draft/2020-12/schema",
    "https://spec.openapis.org/oas/3.1/dialect/base",
    "https://spec.openapis.org/oas/3.1/dialect/2024-11-10",
}

# Keys whose values are example payloads rather than OpenAPI structure.
PAYLOAD_KEYS = {"example", "value", "default", "const", "enum"}

MAX_ERRORS = 5


class ExternalReferenceError(RuntimeError):
    pass


def _refuse_retrieval(uri: str) -> Resource:
    raise ExternalReferenceError(
        f"refusing to resolve {uri!r}: only vendored rules in {SPEC_DIR} and the "
        "JSON Schema 2020-12 meta-schemas bundled with jsonschema are allowed"
    )


def load_oas_schema() -> dict[str, Any]:
    raw = OAS_SCHEMA_FILE.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if digest != OAS_SCHEMA_SHA256:
        raise SystemExit(
            f"{OAS_SCHEMA_FILE} has sha256 {digest}, expected {OAS_SCHEMA_SHA256}; "
            "re-vendor it byte-exact (see spec/oas-3.1/README.md)"
        )
    schema = json.loads(raw)
    if schema.get("$id") != OAS_SCHEMA_ID:
        raise SystemExit(f"{OAS_SCHEMA_FILE} does not declare $id {OAS_SCHEMA_ID}")
    return schema


def build_registry(oas_schema: dict[str, Any]) -> Registry:
    """Offline registry: the vendored OpenAPI schema, nothing is ever retrieved.

    jsonschema combines it with the JSON Schema meta-schemas it bundles.
    """
    resource = Resource.from_contents(oas_schema, default_specification=DRAFT202012)
    return Registry(retrieve=_refuse_retrieval).with_resource(OAS_SCHEMA_ID, resource)


def build_validators() -> tuple[Draft202012Validator, Draft202012Validator]:
    oas_schema = load_oas_schema()
    registry = build_registry(oas_schema)
    structure = Draft202012Validator(oas_schema, registry=registry)
    meta = Draft202012Validator(Draft202012Validator.META_SCHEMA, registry=registry)
    return structure, meta


def pointer(parts: tuple[Any, ...] | list[Any]) -> str:
    return "".join("/" + str(p).replace("~", "~0").replace("/", "~1") for p in parts) or "/"


def schema_objects(document: Any) -> Iterator[tuple[tuple[Any, ...], Any]]:
    """Yield the top-level Schema Objects of an OpenAPI 3.1 document.

    Nested subschemas are validated as part of their enclosing Schema Object,
    so the walk does not descend into a Schema Object once it finds one.
    """

    def walk(node: Any, path: tuple[Any, ...]) -> Iterator[tuple[tuple[Any, ...], Any]]:
        if isinstance(node, dict):
            for key, value in node.items():
                child = (*path, key)
                if key in PAYLOAD_KEYS:
                    continue
                if key == "schema":
                    yield child, value
                elif path == ("components",) and key == "schemas" and isinstance(value, dict):
                    for name, schema in value.items():
                        yield (*child, name), schema
                else:
                    yield from walk(value, child)
        elif isinstance(node, list):
            for index, value in enumerate(node):
                yield from walk(value, (*path, index))

    yield from walk(document, ())


def references(node: Any, path: tuple[Any, ...] = ()) -> Iterator[tuple[tuple[Any, ...], str]]:
    if isinstance(node, dict):
        for key, value in node.items():
            if key in PAYLOAD_KEYS:
                continue
            if key == "$ref" and isinstance(value, str):
                yield (*path, key), value
            else:
                yield from references(value, (*path, key))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            yield from references(value, (*path, index))


def resolve_local(document: Any, ref: str) -> str | None:
    """Return an error message, or None when ref resolves inside document."""
    if not ref.startswith("#"):
        return f"external reference {ref!r}; documents must be self-contained"
    fragment = unquote(ref[1:])
    if fragment and not fragment.startswith("/"):
        return f"reference {ref!r} is not a JSON pointer"
    target = document
    for token in fragment.split("/")[1:]:
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(target, dict) and token in target:
            target = target[token]
        elif isinstance(target, list) and token.isdigit() and int(token) < len(target):
            target = target[int(token)]
        else:
            return f"reference {ref!r} does not resolve inside the document"
    return None


def report(out: list[str], label: str, file: str, errors: list[str], detail: str = "") -> bool:
    status = "VALID  " if not errors else "INVALID"
    suffix = f" ({len(errors)} errors)" if errors else ""
    out.append(f"{status} {label}{detail}: {file}{suffix}")
    out.extend(f"  {error}" for error in errors[:MAX_ERRORS])
    if len(errors) > MAX_ERRORS:
        out.append(f"  ... {len(errors) - MAX_ERRORS} more")
    return not errors


def format_error(prefix: tuple[Any, ...], error: ValidationError) -> str:
    message = error.message if len(error.message) <= 200 else error.message[:197] + "..."
    return f"{pointer((*prefix, *error.absolute_path))}: {message}"


_validators: tuple[Draft202012Validator, Draft202012Validator] | None = None


def check_file(file: str) -> tuple[bool, list[str]]:
    """Run every check on one file; return whether it passed and its report lines."""
    global _validators
    if _validators is None:
        _validators = build_validators()
    structure, meta = _validators
    out: list[str] = []
    try:
        document = json.loads(Path(file).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        return report(out, "document", file, [f"cannot read JSON: {error}"]), out

    structure_errors = [
        format_error((), e)
        for e in sorted(
            structure.iter_errors(document), key=lambda e: pointer(tuple(e.absolute_path))
        )
    ]
    ok = report(out, f"structure ({OAS_SCHEMA_ID})", file, structure_errors)

    schema_errors: list[str] = []
    dialect = document.get("jsonSchemaDialect") if isinstance(document, dict) else None
    if dialect is not None and dialect not in SUPPORTED_DIALECTS:
        schema_errors.append(f"/jsonSchemaDialect: unsupported dialect {dialect!r}")
    found = list(schema_objects(document))
    for path, schema in found:
        declared = schema.get("$schema") if isinstance(schema, dict) else None
        if declared is not None and declared not in SUPPORTED_DIALECTS:
            schema_errors.append(f"{pointer((*path, '$schema'))}: unsupported dialect {declared!r}")
        schema_errors.extend(format_error(path, e) for e in meta.iter_errors(schema))
    ok &= report(
        out,
        "schemas (JSON Schema 2020-12 meta-schema)",
        file,
        schema_errors,
        f" [{len(found)} Schema Objects]",
    )

    refs = list(references(document))
    ref_errors = [
        f"{pointer(path)}: {message}"
        for path, ref in refs
        if (message := resolve_local(document, ref)) is not None
    ]
    ok &= report(out, "references (local and resolvable)", file, ref_errors, f" [{len(refs)} $ref]")
    return ok, out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("files", nargs="+", metavar="FILE", help="OpenAPI 3.1 JSON document")
    parser.add_argument(
        "--jobs",
        type=int,
        default=os.cpu_count() or 1,
        help="files checked in parallel (default: CPU count)",
    )
    args = parser.parse_args(argv)
    build_validators()  # Fail on bad vendored rules before starting workers.
    jobs = max(1, min(args.jobs, len(args.files)))
    if jobs == 1:
        results = [check_file(file) for file in args.files]
    else:
        with ProcessPoolExecutor(max_workers=jobs) as pool:
            results = list(pool.map(check_file, args.files))
    passed = True
    for ok, lines in results:
        print("\n".join(lines), flush=True)
        passed &= ok
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
