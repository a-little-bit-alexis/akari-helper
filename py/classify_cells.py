#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from akari_puzzles.classify import (
    cell_key,
    classify_cell_file,
    find_cell_image,
    load_templates,
    parse_cell_key,
)
from akari_puzzles.images import iter_image_files


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Classify Akari cell images into plaintext values.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--dest", type=Path, required=True)
    parser.add_argument("--templates", type=Path, default=Path("screenshots/png_templates"))
    parser.add_argument("--cropped-cells-dest", type=Path)
    parser.add_argument("--row", type=int)
    parser.add_argument("--col", type=int)
    args = parser.parse_args(argv)

    classify_cells(args.source, args.dest, args.templates, args.cropped_cells_dest, args.row, args.col)


def classify_cells(
    source: Path,
    dest: Path,
    templates_dir: Path,
    cropped_cells_dest: Path | None = None,
    row: int | None = None,
    col: int | None = None,
) -> None:
    if not source.is_dir():
        raise ValueError(f"Cell source must be a directory: {source}")
    if (row is None) != (col is None):
        raise ValueError("--row and --col must be provided together")

    templates = load_templates(templates_dir)
    digit_artifacts_dir = resolve_cropped_cells_dest(source, cropped_cells_dest)
    if row is not None and col is not None:
        classifications = read_existing_classifications(dest)
        path = find_cell_image(source, row, col)
        classifications[cell_key(row, col)] = classify_cell_file(
            path,
            templates,
            row=row,
            col=col,
            digit_artifacts_dir=digit_artifacts_dir,
        )
    else:
        clear_cropped_cell_artifacts(digit_artifacts_dir)
        classifications = {}
        for path in iter_image_files(source):
            row_index, col_index = parse_cell_key(path)
            classifications[cell_key(row_index, col_index)] = classify_cell_file(
                path,
                templates,
                row=row_index,
                col=col_index,
                digit_artifacts_dir=digit_artifacts_dir,
            )
    write_classifications(dest, classifications)


def read_existing_classifications(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    raw_values = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw_values, dict):
        raise ValueError(f"{path}: expected a JSON object")

    classifications: dict[str, str] = {}
    for key, value in raw_values.items():
        if not isinstance(key, str):
            raise ValueError(f"{path}: expected string object keys")
        if not isinstance(value, str):
            raise ValueError(f"{path}: expected string value for {key!r}")
        classifications[key] = value
    return classifications


def write_classifications(path: Path, classifications: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    sorted_items = sorted(classifications.items(), key=lambda item: parse_cell_key(Path(item[0])))
    path.write_text(json.dumps(dict(sorted_items), indent=2) + "\n", encoding="utf-8")


def resolve_cropped_cells_dest(source: Path, cropped_cells_dest: Path | None) -> Path:
    if cropped_cells_dest is not None:
        return cropped_cells_dest
    return source.parent.parent / "cropped_cells" / source.name


def clear_cropped_cell_artifacts(path: Path) -> None:
    if not path.exists():
        return
    for artifact_path in iter_image_files(path):
        artifact_path.unlink()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"classify_cells.py: {error}", file=sys.stderr)
        raise SystemExit(1) from error
