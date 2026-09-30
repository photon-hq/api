#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN="${PYTHON_BIN:-python3}"
RUFF_BIN="${RUFF_BIN:-ruff}"

# Generator options live in generate.py, shared with check_naming.py.
"${PYTHON_BIN}" tools/python-codegen/generate.py

"${PYTHON_BIN}" tools/python-codegen/defer_models.py packages/python/src/photon_api/generated/models.py

"${RUFF_BIN}" check \
  --config packages/python/pyproject.toml \
  --fix \
  --select I,F401,UP006,UP035 \
  packages/python/src/photon_api/generated \
  packages/python/src/photon_api/rpc_generated.py
"${RUFF_BIN}" format \
  --config packages/python/pyproject.toml \
  packages/python/src/photon_api/generated \
  packages/python/src/photon_api/rpc_generated.py
