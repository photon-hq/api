"""Read a platform union's members in order (`union_mode="left_to_right"`).

SDK preparation (addUnknownPlatformMembers in tools/openapi/src/prepare-sdk.ts)
appends the unknown-platform fallback (`UnknownUser`, ...) as the last member
of a platform union. Pydantic's default smart mode picks the member that
matches best, so a known platform's response that gains a member the fallback
declares could be read as the fallback. `left_to_right` makes the order the
rule, as in the TypeScript and Rust clients: the known members are tried
first, and the fallback takes only a value none of them takes.

`fallback_unions` lists those unions in the (prepared) generator input;
`pin` rewrites their generated root models.
"""

import ast

PREFIX = "#/components/schemas/"


def fallback_unions(document: dict) -> list[str]:
    """Components whose last union member is their `x-photon-extension` fallback."""
    found = []
    for name, schema in document.get("components", {}).get("schemas", {}).items():
        extension = schema.get("x-photon-extension") if isinstance(schema, dict) else None
        fallback = extension.get("fallback") if isinstance(extension, dict) else None
        if not isinstance(fallback, str):
            continue
        members = schema.get("anyOf") or schema.get("oneOf") or []
        if members and members[-1] == {"$ref": PREFIX + fallback.rsplit("/", 1)[1]}:
            found.append(name)
    return sorted(found)


def pin(source: str, classes: list[str]) -> str:
    """Annotate the `root` of each named root model with `union_mode="left_to_right"`."""
    if not classes:
        return source
    tree = ast.parse(source)
    lines = source.splitlines(keepends=True)
    edits = {}
    for node in tree.body:
        if not isinstance(node, ast.ClassDef) or node.name not in classes:
            continue
        for statement in node.body:
            if (
                isinstance(statement, ast.AnnAssign)
                and isinstance(statement.target, ast.Name)
                and statement.target.id == "root"
                and statement.value is None
            ):
                union = ast.get_source_segment(source, statement.annotation)
                edits[node.name] = (
                    statement.lineno,
                    statement.end_lineno,
                    f'    root: Annotated[{union}, Field(union_mode="left_to_right")]\n',
                )
    missing = sorted(set(classes) - set(edits))
    if missing:
        raise SystemExit(f"No generated root model to pin for: {', '.join(missing)}")
    for start, end, text in sorted(edits.values(), reverse=True):
        lines[start - 1 : end] = [text]
    imported = {
        (node.module, alias.name)
        for node in tree.body
        if isinstance(node, ast.ImportFrom)
        for alias in node.names
    }
    # After `from __future__` imports (and the module docstring), before the others.
    imports = [node for node in tree.body if isinstance(node, ast.ImportFrom | ast.Import)]
    future = [node for node in imports if getattr(node, "module", None) == "__future__"]
    at = future[-1].end_lineno if future else imports[0].lineno - 1
    for module, name in (("pydantic", "Field"), ("typing", "Annotated")):
        if (module, name) not in imported:
            lines.insert(at, f"from {module} import {name}\n")
    return "".join(lines)
