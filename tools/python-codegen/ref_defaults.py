"""Keep a referenced default from making an optional property nullable.

The pinned generator decides a field's nullability while parsing, from the
property's own `default`; a default that only the referenced component
declares is copied to the field afterwards. With `--strict-nullable`, an
optional property `{"$ref": "#/components/schemas/Intent"}` whose component
has `default: "sso"` was therefore generated as `Intent | None = "sso"`, which
accepts `null` although the contract does not. An inline default gives
`Intent = "sso"`.

`rewrite` copies the resolved component's `default` onto each property that is
only a `$ref` (plus annotations) and has no default of its own. In OpenAPI 3.1
`default` is an annotation beside `$ref`, so the set of valid values is
unchanged, and the field's default value is the one the generator already
used.
"""

ANNOTATIONS = {"title", "description", "example", "examples", "deprecated", "$comment"}
PREFIX = "#/components/schemas/"
# Keywords whose values are instances, not schemas.
VALUES = {"default", "const", "enum", "example", "examples"}


def _referenced_default(schema: dict, schemas: dict) -> tuple[bool, object]:
    seen: set[str] = set()
    while True:
        reference = schema.get("$ref")
        if not (isinstance(reference, str) and reference.startswith(PREFIX)):
            return ("default" in schema, schema.get("default"))
        name = reference.removeprefix(PREFIX)
        target = schemas.get(name)
        if name in seen or not isinstance(target, dict):
            return (False, None)
        seen.add(name)
        if "default" in target:
            return (True, target["default"])
        if set(target) - ANNOTATIONS != {"$ref"}:
            return (False, None)
        schema = target


def _walk(node, schemas: dict, pointer: str, marked: list[str]) -> None:
    if isinstance(node, list):
        for index, item in enumerate(node):
            _walk(item, schemas, f"{pointer}/{index}", marked)
        return
    if not isinstance(node, dict):
        return
    properties = node.get("properties")
    if isinstance(properties, dict):
        for name, schema in properties.items():
            if (
                isinstance(schema, dict)
                and "$ref" in schema
                and "default" not in schema
                and set(schema) - ANNOTATIONS == {"$ref"}
            ):
                found, value = _referenced_default(schema, schemas)
                if found:
                    schema["default"] = value
                    escaped = name.replace("~", "~0").replace("/", "~1")
                    marked.append(f"{pointer}/properties/{escaped}")
    for key, value in node.items():
        if key in VALUES:
            continue
        escaped = str(key).replace("~", "~0").replace("/", "~1")
        _walk(value, schemas, f"{pointer}/{escaped}", marked)


def rewrite(document: dict) -> list[str]:
    """Copy referenced defaults onto `$ref` properties in place; return their pointers."""
    schemas = document.get("components", {}).get("schemas", {})
    marked: list[str] = []
    _walk(document, schemas, "", marked)
    return marked
