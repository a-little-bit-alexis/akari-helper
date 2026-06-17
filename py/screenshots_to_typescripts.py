#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from akari_puzzles.images import iter_image_files


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Run the full Akari screenshot-to-TypeScript pipeline.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--artifacts", "--artifcats", dest="artifacts", type=Path, required=True)
    parser.add_argument("--dest", type=Path, required=True)
    parser.add_argument("--templates", type=Path, default=Path("screenshots/png_templates"))
    args = parser.parse_args(argv)

    screenshots_to_typescript(args.source, args.artifacts, args.dest, args.templates)


def screenshots_to_typescript(source: Path, artifacts: Path, dest: Path, templates: Path) -> None:
    script_dir = Path(__file__).resolve().parent
    grids_dir = artifacts / "grids"
    cells_dir = artifacts / "cells"
    classifications_dir = artifacts / "classifications"

    run_script(script_dir / "extract_grid.py", "--source", source, "--dest", grids_dir)
    run_script(script_dir / "split_grid.py", "--source", grids_dir, "--dest", cells_dir)

    classifications_dir.mkdir(parents=True, exist_ok=True)
    for grid_path in iter_image_files(grids_dir):
        puzzle_cells_dir = cells_dir / grid_path.stem
        classification_path = classifications_dir / f"{grid_path.stem}.json"
        run_script(
            script_dir / "classify_cells.py",
            "--source",
            puzzle_cells_dir,
            "--dest",
            classification_path,
            "--templates",
            templates,
        )

    run_script(script_dir / "generate_typescript.py", "--source", classifications_dir, "--dest", dest)


def run_script(script: Path, *args: str | Path) -> None:
    subprocess.run(
        [sys.executable, str(script), *(str(arg) for arg in args)],
        check=True,
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"screenshots_to_typescripts.py: {error}", file=sys.stderr)
        raise SystemExit(1) from error
