#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from akari_puzzles.typescript import write_plaintext_typescript_from_classifications


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Generate TypeScript puzzle definitions from classifications.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--dest", type=Path, required=True)
    args = parser.parse_args(argv)

    write_plaintext_typescript_from_classifications(args.source, args.dest)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"generate_typescript.py: {error}", file=sys.stderr)
        raise SystemExit(1) from error
