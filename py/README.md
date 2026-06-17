# Akari Puzzle Screenshot Pipeline

This directory contains the Python tools used to turn Akari puzzle screenshots into the plaintext puzzle definitions consumed by the React app.

The pipeline is PNG-only. Source screenshots and templates should be `.png` / `.PNG` files named with the puzzle dimensions:

```text
{puzzle-name}--{rows}x{cols}.PNG
```

For example:

```text
advanced-10x10-2-3--10x10.PNG
expert-14x14-3-1--14x14.PNG
```

Run commands from the repository root unless otherwise noted.

## Project Commands

Install and run tools with `uv`. The Python project lives in `py`, so commands from the repo root use `--project py`.

```sh
./py/check.sh
```

`check.sh` verifies Python code quality only. It runs formatting checks, linting, mypy, and compile checks. It does not validate puzzle classification correctness.

To validate generated classifications against the known-good snapshot, run validation separately:

```sh
uv run --project py python py/validate_classifications.py \
  --source=screenshots/artifacts/classifications \
  --known-values=screenshots/assets/validation/known_values.json
```

## Directory Layout

Source inputs:

```text
screenshots/puzzles/
```

PNG screenshots of puzzles. Each filename must include the grid dimensions as `{rows}x{cols}`.

Templates:

```text
screenshots/png_templates/
screenshots/png_templates/cropped/
```

The classifier uses `screenshots/png_templates/cropped` when present. The cropped templates should contain digit images for numbered walls:

```text
wall_0.png
wall_1.png
wall_2.png
wall_3.png
wall_4.png
```

Generated artifacts:

```text
screenshots/artifacts/grids/
screenshots/artifacts/cells/
screenshots/artifacts/cropped_cells/
screenshots/artifacts/classifications/
```

Final TypeScript output:

```text
src/puzzles/generatedPlaintext.ts
```

Known-good validation snapshot:

```text
screenshots/assets/validation/known_values.json
```

## Full Pipeline

Run the full pipeline with:

```sh
uv run --project py python py/screenshots_to_typescripts.py \
  --source=screenshots/puzzles \
  --artifacts=screenshots/artifacts \
  --dest=src/puzzles/generatedPlaintext.ts
```

The full pipeline runs these stages:

1. `extract_grid.py`
2. `split_grid.py`
3. `classify_cells.py`
4. `generate_typescript.py`

Use the full pipeline when the individual stages have already been tested on a small scope, or when regenerating the library after confirmed parser changes.

## Stage 1: Extract Grids

`extract_grid.py` finds the puzzle grid inside each phone screenshot and writes a cropped grid image.

Single file:

```sh
uv run --project py python py/extract_grid.py \
  --source=screenshots/puzzles/advanced-10x10-2-3--10x10.PNG \
  --dest=screenshots/artifacts/grids/advanced-10x10-2-3--10x10.PNG
```

Directory:

```sh
uv run --project py python py/extract_grid.py \
  --source=screenshots/puzzles \
  --dest=screenshots/artifacts/grids
```

When `--source` is a directory, `--dest` is treated as a directory and one cropped grid is written for each source screenshot.

## Stage 2: Split Grids Into Cells

`split_grid.py` splits an extracted grid into one image per cell.

Single grid:

```sh
uv run --project py python py/split_grid.py \
  --source=screenshots/artifacts/grids/advanced-10x10-2-3--10x10.PNG \
  --dest=screenshots/artifacts/cells/advanced-10x10-2-3--10x10
```

Directory:

```sh
uv run --project py python py/split_grid.py \
  --source=screenshots/artifacts/grids \
  --dest=screenshots/artifacts/cells
```

Cell filenames are written as:

```text
ROW_00_COL_00.PNG
ROW_00_COL_01.PNG
...
```

## Stage 3: Classify Cells

`classify_cells.py` classifies each cell image as one plaintext value:

```text
space, X, 0, 1, 2, 3, 4
```

The classifier first detects blank floor cells and blank wall cells. For numbered wall cells, it crops to the bright digit pixels, adds a small buffer, and compares the cropped digit against the cropped PNG templates.

Single puzzle:

```sh
uv run --project py python py/classify_cells.py \
  --source=screenshots/artifacts/cells/advanced-10x10-2-3--10x10 \
  --dest=screenshots/artifacts/classifications/advanced-10x10-2-3--10x10.json
```

Single cell:

```sh
uv run --project py python py/classify_cells.py \
  --source=screenshots/artifacts/cells/advanced-10x10-2-3--10x10 \
  --dest=screenshots/artifacts/classifications/advanced-10x10-2-3--10x10.json \
  --row=0 \
  --col=8
```

When `--row` and `--col` are provided, only that cell is classified. If the destination JSON already exists, that one cell value is updated and the other values are preserved.

For digit cells, `classify_cells.py` also writes debugging artifacts:

```text
screenshots/artifacts/cropped_cells/{puzzle-name}--{rows}x{cols}/ROW_00__COL_08.PNG
screenshots/artifacts/cropped_cells/{puzzle-name}--{rows}x{cols}/ROW_00__COL_08--CROPPED.PNG
```

The first file is the original cell image. The second file is the cropped digit image that was compared against the templates.

## Stage 4: Generate TypeScript

`generate_typescript.py` reads classification JSON files and writes the React app's plaintext puzzle library.

```sh
uv run --project py python py/generate_typescript.py \
  --source=screenshots/artifacts/classifications \
  --dest=src/puzzles/generatedPlaintext.ts
```

## Validation

After a visually confirmed run, update the known-good values from the generated classifications:

```sh
uv run --project py python -c 'import json; from pathlib import Path; source = Path("screenshots/artifacts/classifications"); data = {path.stem: json.loads(path.read_text(encoding="utf-8")) for path in sorted(source.glob("*.json"))}; Path("screenshots/assets/validation/known_values.json").write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")'
```

Then validate future runs with:

```sh
uv run --project py python py/validate_classifications.py \
  --source=screenshots/artifacts/classifications \
  --known-values=screenshots/assets/validation/known_values.json
```

Validation checks generated values against the known-good snapshot. It should be run deliberately as a parser-correctness check, not as part of `check.sh`.
