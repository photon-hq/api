"""Prepare the generator input so the models carry the contract's types only.

The SDK follows the common practice of generated API clients (Stainless,
Stripe, the AWS and Azure guidelines): types carry the contract (fields, types,
requiredness, nullability, known enum values, names), and the client never
rejects a value the contract allows.

`rewrite` changes the (copied) generator input in place:

- Validation-only keywords are removed: `pattern`, lengths, bounds,
  `multipleOf`, item and property counts, `uniqueItems`, `propertyNames`, and
  `format` except `binary`. The service validates them. A closed tuple keeps
  `minItems`/`maxItems`, which are its shape. Dates and date-times are
  therefore `str`, exactly as sent and received.
- A string component or property that is a union of plain strings (only
  validation keywords told the branches apart) becomes a plain string.
- An enum with several values is open: `{"enum": [...]}` becomes
  `{"anyOf": [{"enum": [...]}, {"type": <its type>}]}`, generated (with
  `--enum-field-as-literal all`) as `Literal[...] | str`, so a value the API
  adds later is accepted. A one-value enum is a constant (typically a union
  discriminator) and stays closed.
- A union of a number with other types (`"type": [..., "number"]` or an
  `anyOf` member `{"type": "number"}`), such as a free-form JSON value, also
  lists `integer` before it, generated as `int | float`, so an integer such as
  `1` stays `1` instead of becoming `1.0`. Every integer is a number, so the
  union takes the same values. A number alone or nullable stays `float`.
"""

VALIDATION_KEYWORDS = {
    "pattern",
    "minLength",
    "maxLength",
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "minItems",
    "maxItems",
    "uniqueItems",
    "minProperties",
    "maxProperties",
    "propertyNames",
    "contains",
    "minContains",
    "maxContains",
    "x-pattern-message",
}
ANNOTATIONS = {"title", "description", "example", "examples", "deprecated", "$comment", "default"}
SCHEMA_MAPS = ("properties", "patternProperties", "$defs", "dependentSchemas")
SCHEMA_LISTS = ("allOf", "anyOf", "oneOf", "prefixItems")
SCHEMA_VALUES = ("items", "additionalProperties", "not", "if", "then", "else")
JSON_TYPES = {str: "string", int: "integer", float: "number", bool: "boolean"}


def _plain_string(schema) -> bool:
    return (
        isinstance(schema, dict)
        and set(schema) - ANNOTATIONS == {"type"}
        and schema["type"] == "string"
    )


def _open_enum(node: dict) -> None:
    values = node.get("enum")
    if not isinstance(values, list):
        return
    known = [value for value in values if value is not None]
    kinds = {JSON_TYPES.get(type(value)) for value in known}
    if len(known) < 2 or len(kinds) != 1 or None in kinds or kinds == {"boolean"}:
        return
    (kind,) = kinds
    if kind == "number" and all(float(value).is_integer() for value in known):
        kind = "integer"
    members = [{"type": kind, "enum": known}, {"type": "number" if kind == "number" else kind}]
    types = node.get("type")
    if len(known) < len(values) or (isinstance(types, list) and "null" in types):
        members.append({"type": "null"})
    for key in ("enum", "type"):
        node.pop(key, None)
    node["anyOf"] = members


def _plain_number(schema) -> bool:
    return (
        isinstance(schema, dict)
        and set(schema) - ANNOTATIONS == {"type"}
        and schema["type"] == "number"
    )


def _integers_first(node: dict) -> None:
    types = node.get("type")
    if (
        isinstance(types, list)
        and "number" in types
        and "integer" not in types
        and len(set(types) - {"null"}) > 1
    ):
        types.insert(types.index("number"), "integer")
    members = node.get("anyOf")
    if not isinstance(members, list):
        return
    kinds = [member.get("type") for member in members if isinstance(member, dict)]
    if "integer" in kinds or len(set(map(str, kinds)) - {"null"}) < 2:
        return
    for index, member in enumerate(members):
        if _plain_number(member):
            members.insert(index, {"type": "integer"})
            return


def _schema(node) -> None:
    if not isinstance(node, dict):
        return
    prefix = node.get("prefixItems")
    closed_tuple = (
        isinstance(prefix, list)
        and node.get("minItems") == len(prefix)
        and node.get("maxItems") == len(prefix)
    )
    for key in VALIDATION_KEYWORDS & node.keys():
        if closed_tuple and key in ("minItems", "maxItems"):
            continue
        del node[key]
    if node.get("format") not in (None, "binary"):
        del node["format"]
    for key in SCHEMA_MAPS:
        if isinstance(node.get(key), dict):
            for value in node[key].values():
                _schema(value)
    for key in SCHEMA_LISTS:
        if isinstance(node.get(key), list):
            for value in node[key]:
                _schema(value)
    for key in SCHEMA_VALUES:
        _schema(node.get(key))
    for key in ("anyOf", "oneOf"):
        members = node.get(key)
        if (
            node.get("type") == "string"
            and isinstance(members, list)
            and all(map(_plain_string, members))
        ):
            del node[key]
    _open_enum(node)
    _integers_first(node)


def _holder(holder) -> None:
    if not isinstance(holder, dict):
        return
    _schema(holder.get("schema"))
    for content in (holder.get("content") or {}).values():
        if isinstance(content, dict):
            _schema(content.get("schema"))
    for header in (holder.get("headers") or {}).values():
        _holder(header)


def rewrite(document: dict) -> None:
    """Rewrite every schema position of the document in place."""
    components = document.get("components", {})
    for schema in components.get("schemas", {}).values():
        _schema(schema)
    for key in ("parameters", "requestBodies", "responses", "headers"):
        for holder in components.get(key, {}).values():
            _holder(holder)
    for item in document.get("paths", {}).values():
        if not isinstance(item, dict):
            continue
        for method, operation in item.items():
            if method == "parameters":
                for parameter in operation:
                    _holder(parameter)
            if not isinstance(operation, dict):
                continue
            for parameter in operation.get("parameters", []):
                _holder(parameter)
            _holder(operation.get("requestBody"))
            for response in (operation.get("responses") or {}).values():
                _holder(response)
