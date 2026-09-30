"""Fail on generated Python classes that are not contract components.

The public SDK takes every type name from the contract. datamodel-code-generator
names an inline nested schema after its property plus a global counter
(`Metadata64`) and renames a colliding class with a numeric suffix (`Address1`);
neither is a contract name. This check parses the SDK input with the same
options, the same input preparation and the same root-collapse adapter as
generate.py, records the source reference of every class the generated module
defines, and reports each class that is not exactly a component of the contract
(config/sdk.json `schemaPath`), with the JSON pointer it came from.

    python tools/python-codegen/check_naming.py [--contract FILE]
        [--sdk openapi/sdk.json] [--json FILE] [--limit N]

Exit status 1 means violations were found.
"""

import argparse
import ast
import json
import re
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import generate  # noqa: E402
from collapse import install  # noqa: E402
from datamodel_code_generator.__main__ import main  # noqa: E402

MODELS = "packages/python/src/photon_api/generated/models.py"
_SPECIAL = re.compile(r"#-datamodel-code-generator-#-.*?-#-special-#")


def name_key(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())


def _defined_names(source: str) -> set[str]:
    names: set[str] = set()
    for node in ast.parse(source).body:
        if isinstance(node, ast.ClassDef):
            names.add(node.name)
        elif isinstance(node, ast.Assign):
            names.update(target.id for target in node.targets if isinstance(target, ast.Name))
    return names


def model_sources(sdk_path: str) -> list[dict]:
    """Class name, kind and source reference of every model the generated module defines.

    The parser also produces models that the root-collapse pass inlines and
    removes (an array item's constrained string, for example); those are not
    SDK types, so only models defined in the generated module are returned.
    """
    with tempfile.TemporaryDirectory() as directory, generate.parsed_models() as records:
        output = Path(directory) / "models.py"
        values = generate.arguments(sdk_path, str(output))
        generate.check_arguments(values)
        with generate.prepared(values) as (values, preparation):
            install(keep_components=generate.keep_components(), preserve=preparation.preserve())
            status = main(values)
        defined = _defined_names(output.read_text()) if status == 0 else set()
    if status:
        raise SystemExit(f"Python model generation failed with exit status {status}")
    return [record for record in records if record["name"] in defined]


def _escape(segment: str) -> str:
    return segment.replace("~", "~0").replace("/", "~1")


def _step(document: dict, node, location: str, segment: str, depth: int = 0) -> list:
    """Candidate (schema, pointer) pairs for one parser path segment below `node`."""
    if not isinstance(node, dict) or depth > 8:
        return []
    reference = node.get("$ref")
    if isinstance(reference, str) and reference.startswith("#/components/schemas/"):
        name = reference.rsplit("/", 1)[1].replace("~1", "/").replace("~0", "~")
        target = document.get("components", {}).get("schemas", {}).get(name)
        return _step(document, target, f"/components/schemas/{_escape(name)}", segment, depth + 1)
    found = []
    properties = node.get("properties", {})
    for key in (segment, segment[:-1] if segment.endswith("_") else None):
        if key is not None and key in properties:
            found.append((properties[key], f"{location}/properties/{_escape(key)}"))
            break
    if segment.isdigit():
        index = int(segment)
        for keyword in ("oneOf", "anyOf", "allOf", "prefixItems"):
            members = node.get(keyword, [])
            if index < len(members):
                found.append((members[index], f"{location}/{keyword}/{index}"))
        if index == 0 and isinstance(node.get("items"), dict):
            found.append((node["items"], f"{location}/items"))
    if segment == "additionalProperties" and isinstance(node.get("additionalProperties"), dict):
        found.append((node["additionalProperties"], f"{location}/additionalProperties"))
    if not found:
        # The parser path skips nullable wrappers, compositions and array items.
        for keyword in ("anyOf", "oneOf", "allOf"):
            for index, member in enumerate(node.get(keyword, [])):
                if isinstance(member, dict) and member.get("type") != "null":
                    found += _step(
                        document, member, f"{location}/{keyword}/{index}", segment, depth + 1
                    )
        if isinstance(node.get("items"), dict):
            found += _step(document, node["items"], f"{location}/items", segment, depth + 1)
    return found


def pointer(reference_path: str, document: dict | None = None) -> str:
    """The JSON pointer of a parser reference, resolved against the SDK input.

    The parser records property names and member indexes, not schema keywords;
    each segment is resolved to the schema it names. An unresolvable path is
    returned as recorded (special segments removed).
    """
    fragment = _SPECIAL.sub("", reference_path.split("#", 1)[1] if "#" in reference_path else "")
    parts = fragment.split("/")[1:]
    if document is None or parts[:2] != ["components", "schemas"] or len(parts) < 3:
        return fragment
    name = parts[2].replace("~1", "/").replace("~0", "~")
    node = document.get("components", {}).get("schemas", {}).get(name)
    location = f"/components/schemas/{_escape(name)}"
    for segment in parts[3:]:
        candidates = _step(document, node, location, segment.replace("~1", "/").replace("~0", "~"))
        if not candidates:
            return fragment
        node, location = candidates[0]
    return location


def violations(models: list[dict], contract: dict, sdk: dict | None = None) -> list[dict]:
    components = {
        name_key(name): name for name in contract.get("components", {}).get("schemas", {})
    }
    found = []
    for model in models:
        location = pointer(model["path"], sdk)
        parts = _SPECIAL.sub("", model["path"].split("#", 1)[-1]).split("/")[1:]
        rule = None
        if parts[:2] == ["components", "schemas"] and len(parts) == 3:
            source = parts[2].replace("~1", "/").replace("~0", "~")
            if name_key(source) not in components:
                rule, message = (
                    "hoisted-root",
                    f"{model['name']} comes from {source}, which is not a contract component",
                )
            elif name_key(model["name"]) != name_key(source):
                rule, message = (
                    "renamed-class",
                    f"{model['name']} renames contract component {source} (name collision)",
                )
        elif parts[:2] == ["components", "schemas"]:
            counter = re.search(r"\d+$", model["name"])
            rule, message = (
                "property-counter" if counter else "nested-class",
                f"{model['name']} is an inline schema inside component {parts[2]}",
            )
        else:
            rule, message = "unnamed-class", f"{model['name']} is not a contract component"
        if rule:
            found.append(
                {
                    "check": "python",
                    "rule": rule,
                    "name": model["name"],
                    "pointer": location,
                    "file": MODELS,
                    "operations": [],
                    "message": message,
                }
            )
    return sorted(found, key=lambda item: (item["rule"], item["pointer"], item["name"]))


def main_cli() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    # Default: the contract config/sdk.json names (openapi/openapi.json in the public repository).
    parser.add_argument("--contract", default=None)
    parser.add_argument("--sdk", default="openapi/sdk.json")
    parser.add_argument("--json")
    parser.add_argument("--limit", type=int, default=20)
    options = parser.parse_args()
    contract_path = options.contract or json.loads(Path(generate.CONFIG).read_text())["schemaPath"]
    contract = json.loads(Path(contract_path).read_text())
    sdk = json.loads(Path(options.sdk).read_text())
    found = violations(model_sources(options.sdk), contract, sdk)
    if options.json:
        Path(options.json).write_text(json.dumps(found, indent=2) + "\n")
    counts: dict[str, int] = {}
    for item in found:
        counts[item["rule"]] = counts.get(item["rule"], 0) + 1
    for rule, count in sorted(counts.items()):
        print(f"python/{rule}: {count}", file=sys.stderr)
        for item in [entry for entry in found if entry["rule"] == rule][: options.limit]:
            print(f"  {item['pointer']}: {item['message']}", file=sys.stderr)
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main_cli())
