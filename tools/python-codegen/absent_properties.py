"""Leave out the properties the contract says are absent (`{"not": {}}`).

`not: {}` (or the boolean schema `false`, directly or through a `$ref`) accepts
no value, so an optional property with that schema is absent today (problem
details without remediation publish `remediation` this way). The pinned
generator ignores both and types the property `Any`.

`rewrite` removes each such property, so the model does not declare it and a
type checker rejects reading it. A response value is not rejected: models keep
members they do not declare (`--extra-fields allow`), and a service that adds
the member later must not break this SDK. This matches the TypeScript SDK
(`absent` in packages/typescript/src/validation.ts).
"""

ANNOTATIONS = {"title", "description", "example", "examples", "deprecated", "$comment"}
PREFIX = "#/components/schemas/"


def _forbidden(schema, schemas: dict, seen: frozenset[str] = frozenset()) -> bool:
    if schema is False:
        return True
    if not isinstance(schema, dict):
        return False
    keys = set(schema) - ANNOTATIONS
    if keys == {"not"}:
        return schema["not"] == {}
    reference = schema.get("$ref")
    if keys == {"$ref"} and isinstance(reference, str) and reference.startswith(PREFIX):
        name = reference.removeprefix(PREFIX)
        return name not in seen and _forbidden(schemas.get(name), schemas, seen | {name})
    return False


def rewrite(document: dict) -> list[str]:
    """Remove every forbidden property schema in place; return their JSON pointers."""
    schemas = document.get("components", {}).get("schemas", {})
    removed: list[str] = []

    def visit(node, pointer: str) -> None:
        if isinstance(node, dict):
            properties = node.get("properties")
            if isinstance(properties, dict):
                for key in [key for key, value in properties.items() if _forbidden(value, schemas)]:
                    del properties[key]
                    escaped = key.replace("~", "~0").replace("/", "~1")
                    removed.append(f"{pointer}/properties/{escaped}")
            for key, child in node.items():
                visit(child, f"{pointer}/{key.replace('~', '~0').replace('/', '~1')}")
        elif isinstance(node, list):
            for index, child in enumerate(node):
                visit(child, f"{pointer}/{index}")

    visit(document, "")
    return removed
