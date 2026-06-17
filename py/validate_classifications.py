#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import logging
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import cast

CellValues = dict[str, str]
KnownValues = dict[str, CellValues]


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Validate classified Akari cells against known-good values.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument(
        "--known-values",
        type=Path,
        default=Path("screenshots/assets/validation/known_values.json"),
    )
    args = parser.parse_args(argv)

    logging.basicConfig(format="%(levelname)s: %(message)s", level=logging.INFO)
    discrepancies = validate_classifications(args.source, args.known_values)
    if discrepancies:
        for discrepancy in discrepancies:
            logging.error(discrepancy)
        raise SystemExit(1)
    logging.info("Validated %s against %s with no discrepancies.", args.source, args.known_values)


def validate_classifications(source: Path, known_values_path: Path) -> list[str]:
    if not source.is_dir():
        raise ValueError(f"Classification source must be a directory: {source}")

    known_values = read_known_values(known_values_path)
    actual_values = read_classification_directory(source)
    discrepancies: list[str] = []

    for puzzle_name in sorted(set(known_values) - set(actual_values)):
        discrepancies.append(f"{puzzle_name}: missing classification file")
    for puzzle_name in sorted(set(actual_values) - set(known_values)):
        discrepancies.append(f"{puzzle_name}: unexpected classification file")

    for puzzle_name in sorted(set(known_values) & set(actual_values)):
        discrepancies.extend(compare_puzzle_values(puzzle_name, known_values[puzzle_name], actual_values[puzzle_name]))

    return discrepancies


def compare_puzzle_values(puzzle_name: str, expected: CellValues, actual: CellValues) -> list[str]:
    discrepancies: list[str] = []
    for cell_name in sorted(set(expected) - set(actual)):
        discrepancies.append(f"{puzzle_name} {cell_name}: missing cell value {expected[cell_name]!r}")
    for cell_name in sorted(set(actual) - set(expected)):
        discrepancies.append(f"{puzzle_name} {cell_name}: unexpected cell value {actual[cell_name]!r}")
    for cell_name in sorted(set(expected) & set(actual)):
        expected_value = expected[cell_name]
        actual_value = actual[cell_name]
        if expected_value != actual_value:
            discrepancies.append(f"{puzzle_name} {cell_name}: expected {expected_value!r}, got {actual_value!r}")
    return discrepancies


def read_classification_directory(source: Path) -> KnownValues:
    return {path.stem: read_cell_values(path) for path in sorted(source.glob("*.json"))}


def read_known_values(path: Path) -> KnownValues:
    raw_values = read_json_object(path)
    known_values: KnownValues = {}
    for puzzle_name, raw_cell_values in raw_values.items():
        if not isinstance(raw_cell_values, dict):
            raise ValueError(f"{path}: expected object for puzzle {puzzle_name!r}")
        known_values[puzzle_name] = coerce_cell_values(path, cast(dict[str, object], raw_cell_values))
    return known_values


def read_cell_values(path: Path) -> CellValues:
    return coerce_cell_values(path, read_json_object(path))


def read_json_object(path: Path) -> dict[str, object]:
    raw_value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw_value, dict):
        raise ValueError(f"{path}: expected a JSON object")
    return {coerce_json_key(path, key): value for key, value in raw_value.items()}


def coerce_cell_values(path: Path, raw_values: Mapping[str, object]) -> CellValues:
    cell_values: CellValues = {}
    for key, value in raw_values.items():
        if not isinstance(value, str):
            raise ValueError(f"{path}: expected string value for {key!r}")
        cell_values[key] = value
    return cell_values


def coerce_json_key(path: Path, key: object) -> str:
    if not isinstance(key, str):
        raise ValueError(f"{path}: expected string object keys")
    return key


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"validate_classifications.py: {error}", file=sys.stderr)
        raise SystemExit(1) from error
