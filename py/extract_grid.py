#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from akari_puzzles.grid import extract_grid_from_file, parse_puzzle_image_name
from akari_puzzles.images import iter_image_files, write_image


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Extract Akari puzzle grids from screenshot images.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--dest", type=Path, required=True)
    args = parser.parse_args(argv)

    extract_grids(args.source, args.dest)


def extract_grids(source: Path, dest: Path) -> None:
    if source.is_dir():
        dest.mkdir(parents=True, exist_ok=True)
        for source_path in iter_image_files(source):
            extract_one_grid(source_path, dest / source_path.name)
        return

    output_path = dest / source.name if is_directory_like_dest(dest) else dest
    extract_one_grid(source, output_path)


def extract_one_grid(source: Path, dest: Path) -> None:
    parse_puzzle_image_name(source)
    grid = extract_grid_from_file(source)
    write_image(dest, grid)


def is_directory_like_dest(path: Path) -> bool:
    return path.exists() and path.is_dir() or path.suffix == ""


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"extract_grid.py: {error}", file=sys.stderr)
        raise SystemExit(1) from error
