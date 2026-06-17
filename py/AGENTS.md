# AGENTS.md

This directory is a uv-managed Python project for the Akari screenshot parsing pipeline.

Use `./check.sh` from this directory, or `./py/check.sh` from the repository root, after Python code changes. It checks formatting, linting, typing, and compilation. It does not prove that puzzle screenshots were parsed correctly.

Do not add override tables or puzzle-specific special cases to force individual cell values. If a screenshot is parsed incorrectly, report the issue with the puzzle name, row, column, expected value, parsed value, and any relevant cropped-cell artifact paths so the user can inspect it.

The pipeline is PNG-only. Do not add JPG/JPEG support unless the user explicitly asks for it.

When testing parser changes:

1. Start with the smallest useful data point, usually one cell with `classify_cells.py --row --col`.
2. Expand to one puzzle.
3. Diff the new classification JSON against a saved temp copy or validate against `screenshots/assets/validation/known_values.json`.
4. Only then run the full pipeline.

Prefer these stage-specific commands while debugging:

```sh
uv run --project py python py/extract_grid.py \
  --source=screenshots/puzzles/advanced-10x10-2-3--10x10.PNG \
  --dest=screenshots/artifacts/grids/advanced-10x10-2-3--10x10.PNG

uv run --project py python py/split_grid.py \
  --source=screenshots/artifacts/grids/advanced-10x10-2-3--10x10.PNG \
  --dest=screenshots/artifacts/cells/advanced-10x10-2-3--10x10

uv run --project py python py/classify_cells.py \
  --source=screenshots/artifacts/cells/advanced-10x10-2-3--10x10 \
  --dest=screenshots/artifacts/classifications/advanced-10x10-2-3--10x10.json \
  --row=0 \
  --col=8

uv run --project py python py/classify_cells.py \
  --source=screenshots/artifacts/cells/advanced-10x10-2-3--10x10 \
  --dest=screenshots/artifacts/classifications/advanced-10x10-2-3--10x10.json
```

Use the full pipeline only after smaller-scope checks pass or when the user asks to regenerate everything:

```sh
uv run --project py python py/screenshots_to_typescripts.py \
  --source=screenshots/puzzles \
  --artifacts=screenshots/artifacts \
  --dest=src/puzzles/generatedPlaintext.ts
```

Run validation separately from `check.sh`:

```sh
uv run --project py python py/validate_classifications.py \
  --source=screenshots/artifacts/classifications \
  --known-values=screenshots/assets/validation/known_values.json
```

`screenshots/artifacts/cropped_cells` is useful for digit-classification debugging. For numbered wall cells, it contains the original cell image and the cropped digit image that was compared against the templates.
