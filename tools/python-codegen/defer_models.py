"""Redirect generated root-model imports; preserve fields and constraints.

Ordinary models use the generator's supported --base-class setting. Root models
need a separate deferred base to avoid eagerly building RootModel[T] before the
generated subclass is defined. No Pydantic globals or internals change.
"""

import ast
import sys
from pathlib import Path


def defer_models(source: str) -> str:
    lines = source.splitlines(keepends=True)
    for node in reversed(ast.parse(source).body):
        if not isinstance(node, ast.ImportFrom) or node.module != "pydantic":
            continue
        deferred = [name for name in node.names if name.name == "RootModel"]
        if not deferred:
            continue
        remaining = [name for name in node.names if name not in deferred]
        imports = [ast.ImportFrom(module="photon_api._model_base", names=deferred, level=0)]
        if remaining:
            imports.insert(0, ast.ImportFrom(module="pydantic", names=remaining, level=0))
        lines[node.lineno - 1 : node.end_lineno] = [ast.unparse(item) + "\n" for item in imports]
    return "".join(lines)


if __name__ == "__main__":
    destination = Path(sys.argv[1])
    destination.write_text(defer_models(destination.read_text()))
