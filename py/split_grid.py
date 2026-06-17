#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from akari_puzzles.classify import cell_key
from akari_puzzles.grid import parse_puzzle_image_name, split_grid
from akari_puzzles.images import iter_image_files, read_image, write_image


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Split extracted Akari grids into cell images.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--dest", type=Path, required=True)
    args = parser.parse_args(argv)

    split_grids(args.source, args.dest)


def split_grids(source: Path, dest: Path) -> None:
    if source.is_dir():
        dest.mkdir(parents=True, exist_ok=True)
        for source_path in iter_image_files(source):
            split_one_grid(source_path, dest / source_path.stem)
        return

    split_one_grid(source, dest)


def split_one_grid(source: Path, dest: Path) -> None:
    image_name = parse_puzzle_image_name(source)
    grid = read_image(source)
    cells = split_grid(grid, image_name.rows, image_name.cols)
    dest.mkdir(parents=True, exist_ok=True)
    suffix = source.suffix if source.suffix else ".PNG"
    for (row_index, col_index), cell in sorted(cells.items()):
        write_image(dest / f"{cell_key(row_index, col_index)}{suffix}", cell)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"split_grid.py: {error}", file=sys.stderr)
        raise SystemExit(1) from error
