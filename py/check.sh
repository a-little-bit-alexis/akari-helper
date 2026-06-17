#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
export PYTHONDONTWRITEBYTECODE=1
pycache_dir="${TMPDIR:-/tmp}/akari-helper-pycheck-pycache"
rm -rf "$pycache_dir"
mkdir -p "$pycache_dir"
export PYTHONPYCACHEPREFIX="$pycache_dir"
trap 'rm -rf "$pycache_dir"' EXIT

uv run ruff format --check .
uv run ruff check .
uv run mypy .
uv run python -B -m compileall -q .
# uv run python validate_classifications.py \
#   --source ../screenshots/artifacts/classifications \
#   --known-values ../screenshots/assets/validation/known_values.json
