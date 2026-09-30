"""Generate JSON Schema `prefixItems` arrays with their positional item types.

The pinned generator ignores `prefixItems` unless the array is a closed tuple
(`items: false` and `minItems == maxItems == len(prefixItems)`); otherwise it
emits `list[Any]`, which accepts any array. For example

    AllWebhookEvents: {type: array, prefixItems: [{$ref: WebhookEventWildcard}]}

accepts `[]`, `["*"]` and `["*", <anything>...]` in the contract (without
`items`, later items are unconstrained), but `["x"]` too in the generated SDK.

`rewrite` marks each such array with `x-python-type`
`photon_api._model_base.PrefixItems[T1, ..., Tn]`, which validates item i (when
present) as Ti and leaves later items unconstrained. Ti is a `Literal` for a
`const` or `enum` item (directly or through a `$ref`), or `str` for a plain
string; any other prefix item stops generation instead of being loosened. The
generator applies `x-python-type` to an inline schema but not to a component's
own root, so a component that is such an array is wrapped in a one-member
`anyOf` (the same set of values).
"""

import json

PREFIX = "#/components/schemas/"
HELPER = "photon_api._model_base.PrefixItems"
ANNOTATIONS = {"title", "description", "example", "examples", "deprecated", "$comment"}


def _literal(values: list) -> str:
    if not values or not all(isinstance(value, str | int | bool) for value in values):
        raise SystemExit(f"unsupported prefixItems literal values: {values!r}")
    return "Literal[" + ", ".join(json.dumps(value) for value in values) + "]"


def _item_type(schemas: dict, item, seen: tuple[str, ...] = ()) -> str:
    if not isinstance(item, dict):
        raise SystemExit(f"unsupported prefixItems member: {item!r}")
    reference = item.get("$ref")
    if isinstance(reference, str) and set(item) - ANNOTATIONS == {"$ref"}:
        name = reference.removeprefix(PREFIX)
        if not reference.startswith(PREFIX) or name in seen or name not in schemas:
            raise SystemExit(f"unsupported prefixItems reference: {reference}")
        return _item_type(schemas, schemas[name], (*seen, name))
    keys = set(item) - ANNOTATIONS
    if "const" in item and keys <= {"const", "type"}:
        return _literal([item["const"]])
    if "enum" in item and keys <= {"enum", "type"}:
        return _literal(item["enum"])
    if item.get("type") == "string" and keys == {"type"}:
        return "str"
    raise SystemExit(f"unsupported prefixItems member: {json.dumps(item)}")


def _fixed_tuple(schema: dict) -> bool:
    """The closed tuple the generator already emits exactly."""
    return schema.get("items") is False and schema.get("minItems") == schema.get("maxItems") == len(
        schema["prefixItems"]
    )


def _mark(schemas: dict, schema: dict, pointer: str) -> bool:
    if not isinstance(schema.get("prefixItems"), list) or _fixed_tuple(schema):
        return False
    if "items" in schema or "x-python-type" in schema:
        raise SystemExit(f"unsupported prefixItems array at {pointer}")
    types = ", ".join(_item_type(schemas, item) for item in schema["prefixItems"])
    schema["x-python-type"] = f"{HELPER}[{types}]"
    return True


def rewrite(document: dict) -> list[str]:
    """Mark every open `prefixItems` array in place; return their JSON pointers."""
    schemas = document.get("components", {}).get("schemas", {})
    marked: list[str] = []

    def visit(node, pointer: str) -> None:
        if isinstance(node, dict):
            if _mark(schemas, node, pointer):
                marked.append(pointer)
            for key, child in node.items():
                visit(child, f"{pointer}/{key.replace('~', '~0').replace('/', '~1')}")
        elif isinstance(node, list):
            for index, child in enumerate(node):
                visit(child, f"{pointer}/{index}")

    visit(document, "")
    for name, schema in list(schemas.items()):
        if isinstance(schema, dict) and "x-python-type" in schema and "prefixItems" in schema:
            annotations = {key: schema.pop(key) for key in list(schema) if key in ANNOTATIONS}
            schemas[name] = {**annotations, "anyOf": [schema]}
    return marked
