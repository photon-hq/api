"""Generate a union narrowed by object constraints as one contract type.

A component such as

    PlatformSpace: allOf [$ref Space, $ref SupportedPlatformConstraint]

where `Space` is a union (anyOf/oneOf) and every other member is an object
component, is distributed by the pinned generator over the union's members. It
invents a class per member (`PlatformSpace1`..`PlatformSpace8`, none of them a
contract name), and a member that is itself a union loses its shape (it becomes
a bare subclass of the open constraint model).

Generate such a component instead as a root model of the union with a model
validator that checks the value against each constraint model. Every type name
is then a contract component, and the accepted values are exactly the `allOf`:
the union validates the value, and each constraint model validates it again.

`rewrite` prepares the generator input (the component becomes a `$ref` to the
union, keeping its annotations); `add_validators` adds the validators to the
generated module. The collapse adapter keeps these root models at the places
that use them, so the validator is not inlined away.

An object constraint written inline (the internal lane's hoisted operation
schemas, for example `allOf [$ref Message, {required: [platform], ...}]`)
becomes a component `<Name>Constraint<i>` first; without it the generator
distributed the union over the constraint and kept only the constraint's own
fields, so any value with them validated. The public lane names every
constraint in the contract.
"""

import ast

PREFIX = "#/components/schemas/"
HELPER = "validate_all_of"
HELPER_MODULE = "photon_api._model_base"


def _target(schemas: dict, member) -> tuple[str, dict] | None:
    if not isinstance(member, dict) or list(member) != ["$ref"]:
        return None
    reference = member["$ref"]
    if not isinstance(reference, str) or not reference.startswith(PREFIX):
        return None
    name = reference[len(PREFIX) :]
    schema = schemas.get(name)
    return (name, schema) if isinstance(schema, dict) else None


def _is_union(schema: dict) -> bool:
    return ("anyOf" in schema or "oneOf" in schema) and not {
        "allOf",
        "properties",
        "type",
    } & schema.keys()


def _is_object(schema: dict) -> bool:
    return schema.get("type") == "object" and not {"anyOf", "oneOf", "allOf"} & schema.keys()


def _narrows_union(schemas: dict, schema: dict) -> bool:
    """An `allOf` of exactly one union component and object constraints (inline or named)."""
    members = schema.get("allOf")
    if not isinstance(members, list) or len(members) < 2:
        return False
    unions = 0
    for member in members:
        target = _target(schemas, member)
        if target is not None and _is_union(target[1]):
            unions += 1
        elif not (target is not None and _is_object(target[1])) and not (
            isinstance(member, dict) and "$ref" not in member and _is_object(member)
        ):
            return False
    return unions == 1


def _hoist_nested(schemas: dict, reachable: set[str]) -> None:
    """Make each union-narrowing `allOf` nested inside a component a component itself.

    (The internal lane's hoisted list responses: `items: {allOf: [Message, {...}]}`.)
    """

    def visit(node, owner: str, counter: list[int]) -> None:
        if isinstance(node, dict):
            for key, child in list(node.items()):
                if key in ("example", "examples", "const", "enum", "default"):
                    continue
                if isinstance(child, dict) and _narrows_union(schemas, child):
                    counter[0] += 1
                    name = f"{owner}AllOf{counter[0]}"
                    if name in schemas:
                        raise SystemExit(f"allOf component already exists: {name}")
                    schemas[name] = child
                    node[key] = {"$ref": PREFIX + name}
                    visit(child, owner, counter)
                else:
                    visit(child, owner, counter)
        elif isinstance(node, list):
            for index, child in enumerate(node):
                if isinstance(child, dict) and _narrows_union(schemas, child):
                    counter[0] += 1
                    name = f"{owner}AllOf{counter[0]}"
                    if name in schemas:
                        raise SystemExit(f"allOf component already exists: {name}")
                    schemas[name] = child
                    node[index] = {"$ref": PREFIX + name}
                visit(child, owner, counter)

    for owner in sorted(reachable):
        visit(schemas[owner], owner, [0])


def _reachable(document: dict) -> set[str]:
    """Components the operations reach (unreached ones are not generated as used models)."""
    schemas = document.get("components", {}).get("schemas", {})
    found: set[str] = set()

    def visit(node) -> None:
        if isinstance(node, dict):
            reference = node.get("$ref")
            if isinstance(reference, str) and reference.startswith(PREFIX):
                name = reference[len(PREFIX) :]
                if name in schemas and name not in found:
                    found.add(name)
                    visit(schemas[name])
            for key, child in node.items():
                if key not in ("example", "examples", "const", "enum", "default"):
                    visit(child)
        elif isinstance(node, list):
            for child in node:
                visit(child)

    visit(document.get("paths", {}))
    return found


def rewrite(document: dict) -> dict[str, list[str]]:
    """Rewrite each union-narrowing component in place; return its constraint names."""
    schemas = document.get("components", {}).get("schemas", {})
    constraints: dict[str, list[str]] = {}
    _hoist_nested(schemas, _reachable(document))
    for name, schema in list(schemas.items()):
        if not isinstance(schema, dict) or not isinstance(schema.get("allOf"), list):
            continue
        members = list(schema["allOf"])
        inline = [
            index
            for index, member in enumerate(members)
            if isinstance(member, dict) and "$ref" not in member and _is_object(member)
        ]
        if inline and len(inline) < len(members):
            targets = [
                None if index in inline else _target(schemas, m) for index, m in enumerate(members)
            ]
            unions = [t for t in targets if t is not None and _is_union(t[1])]
            if len(unions) == 1 and all(
                t is not None for i, t in enumerate(targets) if i not in inline
            ):
                for position, index in enumerate(inline, start=1):
                    constraint = f"{name}Constraint{position}"
                    if constraint in schemas:
                        raise SystemExit(f"allOf constraint component already exists: {constraint}")
                    schemas[constraint] = members[index]
                    members[index] = {"$ref": PREFIX + constraint}
                schema["allOf"] = members
        targets = [_target(schemas, member) for member in schema["allOf"]]
        if any(target is None for target in targets):
            continue
        unions = [target for target in targets if _is_union(target[1])]
        others = [target for target in targets if not _is_union(target[1])]
        if len(unions) != 1 or not others or not all(_is_object(item[1]) for item in others):
            continue
        schema.pop("allOf")
        schema["$ref"] = PREFIX + unions[0][0]
        constraints[name] = [item[0] for item in others]
    return dict(sorted(constraints.items()))


def add_validators(source: str, constraints: dict[str, list[str]]) -> str:
    """Add an `allOf` constraint validator to each named root model class."""
    if not constraints:
        return source
    tree = ast.parse(source)
    classes = {node.name: node for node in tree.body if isinstance(node, ast.ClassDef)}
    missing = sorted(set(constraints) - classes.keys())
    if missing:
        raise SystemExit(f"allOf components were not generated: {', '.join(missing)}")
    unknown = sorted({item for names in constraints.values() for item in names} - classes.keys())
    if unknown:
        raise SystemExit(f"allOf constraint models were not generated: {', '.join(unknown)}")
    lines = source.splitlines(keepends=True)
    insertions: list[tuple[int, str]] = []
    for name, names in constraints.items():
        node = classes[name]
        bases = [ast.unparse(base) for base in node.bases]
        if len(bases) != 1 or not bases[0].startswith("RootModel["):
            raise SystemExit(f"{name} is not a root model; cannot add its allOf validator")
        arguments = ", ".join(names)
        insertions.append(
            (
                node.end_lineno,
                "\n"
                '    @model_validator(mode="before")\n'
                "    @classmethod\n"
                "    def _validate_all_of(cls, data: Any) -> Any:\n"
                f"        return {HELPER}(data, {arguments})\n",
            )
        )
    for line, text in sorted(insertions, reverse=True):
        lines.insert(line, text)
    imports = (
        "from typing import Any\n"
        "from pydantic import model_validator\n"
        f"from {HELPER_MODULE} import {HELPER}\n"
    )
    # After the last top-level import; ruff sorts and merges them.
    last_import = max(
        node.end_lineno for node in tree.body if isinstance(node, ast.Import | ast.ImportFrom)
    )
    lines.insert(last_import, imports)
    return "".join(lines)
