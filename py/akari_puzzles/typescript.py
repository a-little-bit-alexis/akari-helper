from __future__ import annotations

import json
from pathlib import Path

from akari_puzzles.classify import cell_key, parse_cell_key
from akari_puzzles.grid import parse_puzzle_image_name


def write_plaintext_typescript_from_classifications(source_dir: Path, output_path: Path) -> None:
    puzzles: list[dict[str, str]] = []
    for path in sorted(source_dir.glob("*.json")):
        image_name = parse_puzzle_image_name(path)
        classifications = json.loads(path.read_text(encoding="utf-8"))
        rows: list[str] = []
        for row_index in range(image_name.rows):
            cells: list[str] = []
            for col_index in range(image_name.cols):
                key = cell_key(row_index, col_index)
                if key not in classifications:
                    raise ValueError(f"Missing classification {key} in {path}")
                cells.append(classifications[key])
            rows.append("|" + "".join(cells) + "|")
        puzzles.append({"name": image_name.name, "board": "\n".join(rows)})
    write_plaintext_typescript(output_path, puzzles)


def sorted_classification_items(classifications: dict[str, str]) -> list[tuple[str, str]]:
    return sorted(classifications.items(), key=lambda item: parse_cell_key(Path(item[0])))


def write_plaintext_typescript(output_path: Path, puzzles: list[dict[str, str]]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "export interface PlaintextPuzzle {",
        "  name: string;",
        "  board: string;",
        "}",
        "",
        "export const PLAINTEXT_PUZZLES: PlaintextPuzzle[] = [",
    ]
    for puzzle in puzzles:
        lines.extend(
            [
                "  {",
                f"    name: {typescript_string_literal(puzzle['name'])},",
                "    board: `",
                escape_template_literal(puzzle["board"]),
                "`,",
                "  },",
            ],
        )
    lines.append("];")
    lines.append("")
    output_path.write_text("\n".join(lines), encoding="utf-8")


def escape_template_literal(value: str) -> str:
    return value.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")


def typescript_string_literal(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"
