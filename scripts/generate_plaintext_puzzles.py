#!/usr/bin/env python3
"""Generate plaintext Akari puzzle definitions from screenshot images.

The script intentionally uses only the Python standard library plus macOS
`sips`, which is available on this workspace and handles JPEG decoding.
"""

from __future__ import annotations

import argparse
import math
import shutil
import struct
import subprocess
import sys
import tempfile
from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path


CELL_CHARACTERS = {
    "wall_0": "0",
    "wall_1": "1",
    "wall_2": "2",
    "wall_3": "3",
    "wall_4": "4",
}
SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
CELL_SAMPLE_SIZE = 48
DIGIT_SAMPLE_SIZE = 32
DIGIT_THRESHOLD = 90
BLANK_WALL_MAX_DIGIT_PIXELS = 20

# Visually confirmed corrections for cells where the lightweight digit matcher
# is still ambiguous. Keys are (puzzle_name, zero-indexed row, zero-indexed col).
CELL_VALUE_OVERRIDES: dict[tuple[str, int, int], str] = {
    ("beginner-10x10-3-2", 8, 1): "2",
    ("beginner-10x10-3-3", 8, 0): "2",
    ("beginner-10x10-3-5", 0, 8): "3",
    ("beginner-10x10-3-5", 9, 6): "3",
    ("advanced-10x10-2-1", 4, 1): "2",
    ("advanced-10x10-2-2", 4, 0): "2",
    ("advanced-10x10-2-3", 0, 8): "0",
    ("advanced-10x10-2-3", 3, 1): "2",
    ("advanced-10x10-2-3", 7, 1): "2",
    ("advanced-10x10-2-3", 9, 8): "3",
}


@dataclass(frozen=True)
class LineGroup:
    start: int
    end: int


@dataclass
class ImageData:
    width: int
    height: int
    rgb: bytearray
    gray: list[int] | None = None

    def gray_at(self, x: int, y: int) -> int:
        if self.gray is None:
            self.gray = []
            for index in range(0, len(self.rgb), 3):
                red = self.rgb[index]
                green = self.rgb[index + 1]
                blue = self.rgb[index + 2]
                self.gray.append((red * 299 + green * 587 + blue * 114) // 1000)
        return self.gray[y * self.width + x]

    def crop(self, x0: int, y0: int, x1: int, y1: int) -> ImageData:
        x0 = max(0, x0)
        y0 = max(0, y0)
        x1 = min(self.width, x1)
        y1 = min(self.height, y1)
        width = x1 - x0
        height = y1 - y0
        rgb = bytearray(width * height * 3)
        write_index = 0
        for y in range(y0, y1):
            read_start = (y * self.width + x0) * 3
            read_end = read_start + width * 3
            row = self.rgb[read_start:read_end]
            rgb[write_index : write_index + len(row)] = row
            write_index += len(row)
        return ImageData(width, height, rgb)


@dataclass(frozen=True)
class TemplateMask:
    name: str
    points: frozenset[tuple[int, int]]
    shifted_points: tuple[frozenset[tuple[int, int]], ...]


@dataclass(frozen=True)
class PuzzleImageName:
    name: str
    rows: int
    cols: int


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate src/puzzles/generatedPlaintext.ts from puzzle screenshots.",
    )
    parser.add_argument(
        "--images-dir",
        type=Path,
        default=Path("screenshots/puzzles"),
        help="Directory containing puzzle images named {name}--{rows}x{cols}.jpg or .png.",
    )
    parser.add_argument(
        "--png-templates-dir",
        type=Path,
        default=Path("screenshots/png_templates"),
        help="Directory containing PNG template images named {template_name}.png.",
    )
    parser.add_argument(
        "--jpg-templates-dir",
        type=Path,
        default=Path("screenshots/jpg_templates"),
        help="Directory containing JPG template images named {template_name}.jpg.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("src/puzzles/generatedPlaintext.ts"),
        help="TypeScript file to write.",
    )
    args = parser.parse_args()

    ensure_sips_exists()
    template_sets = {
        ".png": read_image_templates(args.png_templates_dir),
        ".jpg": read_image_templates(args.jpg_templates_dir),
        ".jpeg": read_image_templates(args.jpg_templates_dir),
    }
    plaintext_puzzles = load_puzzles_from_images(args.images_dir, template_sets)
    write_plaintext_typescript(args.output, plaintext_puzzles)


def ensure_sips_exists() -> None:
    if shutil.which("sips") is None:
        raise RuntimeError("This script requires macOS `sips` to decode image files.")


def read_image_templates(templates_dir: Path) -> dict[str, TemplateMask]:
    templates: dict[str, TemplateMask] = {}
    for path in iter_image_files(templates_dir):
        template_name = path.stem
        if template_name == "floor" or template_name == "wall_blank":
            continue
        if template_name not in CELL_CHARACTERS:
            raise ValueError(f"Unrecognized template image: {path}")
        image = read_image(path)
        points = normalize_digit_points(mask_points(resize_to_grayscale(image), threshold=DIGIT_THRESHOLD))
        templates[template_name] = TemplateMask(
            name=template_name,
            points=points,
            shifted_points=shifted_masks(points),
        )
    missing = set(CELL_CHARACTERS) - set(templates)
    if missing:
        missing_names = ", ".join(sorted(missing))
        raise ValueError(f"Missing template images: {missing_names}")
    return templates


def load_puzzles_from_images(
    images_dir: Path,
    template_sets: dict[str, dict[str, TemplateMask]],
) -> list[dict[str, str]]:
    puzzles: list[dict[str, str]] = []
    for path in iter_image_files(images_dir):
        image_name = parse_puzzle_image_name(path)
        templates = template_sets[path.suffix.lower()]
        image = read_image(path)
        board = load_board_from_image(
            image_name.name,
            image,
            image_name.rows,
            image_name.cols,
            templates,
        )
        puzzles.append({"name": image_name.name, "board": board})
    return puzzles


def iter_image_files(directory: Path) -> list[Path]:
    return sorted(
        path
        for path in directory.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS
    )


def parse_puzzle_image_name(path: Path) -> PuzzleImageName:
    try:
        name, dimensions = path.stem.rsplit("--", 1)
        rows_text, cols_text = dimensions.lower().split("x", 1)
        rows = int(rows_text)
        cols = int(cols_text)
    except ValueError as exc:
        raise ValueError(
            f"Image filename must be formatted as {{name}}--{{rows}}x{{cols}}.jpg or .png: {path.name}",
        ) from exc
    if rows <= 0 or cols <= 0:
        raise ValueError(f"Puzzle dimensions must be positive: {path.name}")
    return PuzzleImageName(name=name, rows=rows, cols=cols)


def load_board_from_image(
    puzzle_name: str,
    image: ImageData,
    rows: int,
    cols: int,
    templates: dict[str, TemplateMask],
) -> str:
    row_lines, col_lines = find_puzzle_grid_lines(image, rows, cols)
    plaintext_rows: list[str] = []
    for row_index in range(rows):
        plaintext_row = []
        for col_index in range(cols):
            cell = crop_cell(image, row_lines, col_lines, row_index, col_index)
            cell_value = parse_image_of_cell(cell, templates)
            plaintext_row.append(
                CELL_VALUE_OVERRIDES.get(
                    (puzzle_name, row_index, col_index),
                    cell_value,
                ),
            )
        plaintext_rows.append("|" + "".join(plaintext_row) + "|")
    return "\n".join(plaintext_rows)


def crop_cell(
    image: ImageData,
    row_lines: list[LineGroup],
    col_lines: list[LineGroup],
    row_index: int,
    col_index: int,
) -> ImageData:
    x0 = col_lines[col_index].end + 1
    x1 = col_lines[col_index + 1].start
    y0 = row_lines[row_index].end + 1
    y1 = row_lines[row_index + 1].start
    return image.crop(x0, y0, x1, y1)


def parse_image_of_cell(cell: ImageData, templates: dict[str, TemplateMask]) -> str:
    grayscale = resize_to_grayscale(cell)
    mean_brightness = sum(grayscale) / len(grayscale)
    if mean_brightness >= 150:
        return " "

    digit_points = mask_points(grayscale, threshold=DIGIT_THRESHOLD)
    if len(digit_points) < BLANK_WALL_MAX_DIGIT_PIXELS:
        return "X"
    cell_points = normalize_digit_points(digit_points)
    feature_character = classify_digit_by_features(cell_points)
    if feature_character is not None:
        return feature_character

    template = max(
        templates.values(),
        key=lambda candidate: best_shifted_f1_score(cell_points, candidate),
    )
    return CELL_CHARACTERS[template.name]


def classify_digit_by_features(points: frozenset[tuple[int, int]]) -> str | None:
    if not points:
        return None

    min_x = min(x for x, _ in points)
    max_x = max(x for x, _ in points)
    min_y = min(y for _, y in points)
    max_y = max(y for _, y in points)
    width = max_x - min_x + 1
    height = max_y - min_y + 1
    if height == 0:
        return None

    def fraction_in_region(
        min_x_fraction: float,
        max_x_fraction: float,
        min_y_fraction: float,
        max_y_fraction: float,
    ) -> float:
        return sum(
            1
            for x, y in points
            if min_x + width * min_x_fraction <= x < min_x + width * max_x_fraction
            and min_y + height * min_y_fraction <= y < min_y + height * max_y_fraction
        ) / len(points)

    middle_x_fraction = fraction_in_region(1 / 3, 2 / 3, 0, 1)
    middle_y_fraction = fraction_in_region(0, 1, 1 / 3, 2 / 3)

    # A zero is the only supported digit that is both wide and hollow through
    # the vertical middle. This catches 0/2 ambiguity in the phone screenshots.
    if width / height > 0.6 and middle_x_fraction < 0.25 and middle_y_fraction > 0.25:
        return "0"

    lower_left_fraction = fraction_in_region(0, 0.45, 0.55, 1)
    lower_right_fraction = fraction_in_region(0.55, 1, 0.55, 1)
    descending_diagonal_fraction = sum(
        1
        for x, y in points
        if abs(((x - min_x) / max(1, width - 1)) + ((y - min_y) / max(1, height - 1)) - 1.15)
        < 0.18
    ) / len(points)

    # Twos in phone screenshots can otherwise score as threes because the top
    # and right strokes match closely. The lower-left diagonal is the tell.
    if lower_left_fraction - lower_right_fraction > 0.09 and descending_diagonal_fraction > 0.35:
        return "2"

    return None


def find_puzzle_grid_lines(
    image: ImageData,
    rows: int,
    cols: int,
) -> tuple[list[LineGroup], list[LineGroup]]:
    row_lines = find_grid_lines_by_dark_runs(
        image=image,
        expected_count=rows + 1,
        axis="horizontal",
        scan_start=0,
        scan_end=image.height,
        required_run_fraction=0.55,
    )
    col_lines = find_grid_lines_by_dark_runs(
        image=image,
        expected_count=cols + 1,
        axis="vertical",
        scan_start=row_lines[0].start,
        scan_end=row_lines[-1].end + 1,
        required_run_fraction=0.55,
    )
    return row_lines, col_lines


def find_grid_lines_by_dark_runs(
    image: ImageData,
    expected_count: int,
    axis: str,
    scan_start: int,
    scan_end: int,
    required_run_fraction: float,
) -> list[LineGroup]:
    groups = find_dark_run_line_groups(
        image,
        axis,
        dark_threshold=130,
        scan_start=scan_start,
        scan_end=scan_end,
        required_run_fraction=required_run_fraction,
    )
    if len(groups) == expected_count:
        return groups

    candidates: list[tuple[int, float, int, float, list[LineGroup]]] = []
    candidates.append((abs(len(groups) - expected_count), -required_run_fraction, 130, required_run_fraction, groups))
    for dark_threshold in (60, 90, 110, 150, 170):
        for run_fraction in (
            required_run_fraction,
            0.5,
            0.45,
            0.4,
        ):
            groups = find_dark_run_line_groups(image, axis, dark_threshold, scan_start, scan_end, run_fraction)
            if len(groups) == expected_count:
                return groups
            candidates.append(
                (
                    abs(len(groups) - expected_count),
                    -run_fraction,
                    dark_threshold,
                    run_fraction,
                    groups,
                ),
            )

    _, _, dark_threshold, run_fraction, groups = min(candidates, key=lambda item: item[:2])
    raise ValueError(
        f"Expected {expected_count} {axis} grid lines, but found {len(groups)} "
        f"with dark_threshold={dark_threshold} and run_fraction={run_fraction}.",
    )


def find_dark_run_line_groups(
    image: ImageData,
    axis: str,
    dark_threshold: int,
    scan_start: int,
    scan_end: int,
    required_run_fraction: float,
) -> list[LineGroup]:
    line_indices: list[int] = []
    if axis == "horizontal":
        required_run_length = image.width * required_run_fraction
        for y in range(image.height):
            if longest_dark_run(
                (image.gray_at(x, y) for x in range(image.width)),
                dark_threshold,
            ) >= required_run_length:
                line_indices.append(y)
    elif axis == "vertical":
        required_run_length = (scan_end - scan_start) * required_run_fraction
        for x in range(image.width):
            if longest_dark_run(
                (image.gray_at(x, y) for y in range(scan_start, scan_end)),
                dark_threshold,
            ) >= required_run_length:
                line_indices.append(x)
    else:
        raise ValueError(f"Unknown axis: {axis}")

    return group_consecutive_indices(line_indices)


def longest_dark_run(values: Iterable[int], dark_threshold: int) -> int:
    best = 0
    current = 0
    for value in values:
        if value < dark_threshold:
            current += 1
            best = max(best, current)
        else:
            current = 0
    return best


def group_consecutive_indices(indices: list[int]) -> list[LineGroup]:
    if not indices:
        return []
    groups: list[LineGroup] = []
    start = indices[0]
    previous = indices[0]
    for index in indices[1:]:
        if index == previous + 1:
            previous = index
        else:
            groups.append(LineGroup(start, previous))
            start = index
            previous = index
    groups.append(LineGroup(start, previous))
    return groups


def resize_to_grayscale(image: ImageData, size: int = CELL_SAMPLE_SIZE) -> list[float]:
    values: list[float] = []
    for output_y in range(size):
        source_y = (output_y + 0.5) * image.height / size - 0.5
        y0 = max(0, min(image.height - 1, math.floor(source_y)))
        y1 = min(image.height - 1, y0 + 1)
        y_fraction = source_y - y0
        for output_x in range(size):
            source_x = (output_x + 0.5) * image.width / size - 0.5
            x0 = max(0, min(image.width - 1, math.floor(source_x)))
            x1 = min(image.width - 1, x0 + 1)
            x_fraction = source_x - x0
            value = (
                image.gray_at(x0, y0) * (1 - x_fraction) * (1 - y_fraction)
                + image.gray_at(x1, y0) * x_fraction * (1 - y_fraction)
                + image.gray_at(x0, y1) * (1 - x_fraction) * y_fraction
                + image.gray_at(x1, y1) * x_fraction * y_fraction
            )
            values.append(value)
    return values


def mask_points(
    grayscale: list[float],
    size: int = CELL_SAMPLE_SIZE,
    threshold: int = DIGIT_THRESHOLD,
) -> frozenset[tuple[int, int]]:
    points: set[tuple[int, int]] = set()
    for index, value in enumerate(grayscale):
        if value > threshold:
            points.add((index % size, index // size))
    return frozenset(points)


def normalize_digit_points(
    points: frozenset[tuple[int, int]],
    size: int = DIGIT_SAMPLE_SIZE,
    padding: int = 2,
) -> frozenset[tuple[int, int]]:
    if not points:
        return frozenset()

    min_x = min(x for x, _ in points)
    max_x = max(x for x, _ in points)
    min_y = min(y for _, y in points)
    max_y = max(y for _, y in points)
    width = max_x - min_x + 1
    height = max_y - min_y + 1
    scale = min((size - 2 * padding) / width, (size - 2 * padding) / height)
    offset_x = (size - width * scale) / 2
    offset_y = (size - height * scale) / 2

    normalized_points: set[tuple[int, int]] = set()
    for x, y in points:
        normalized_x = round(offset_x + (x - min_x + 0.5) * scale - 0.5)
        normalized_y = round(offset_y + (y - min_y + 0.5) * scale - 0.5)
        if 0 <= normalized_x < size and 0 <= normalized_y < size:
            normalized_points.add((normalized_x, normalized_y))
    return frozenset(normalized_points)


def best_shifted_f1_score(
    cell_points: frozenset[tuple[int, int]],
    template: TemplateMask,
) -> float:
    denominator = len(cell_points) + len(template.points)
    if denominator == 0:
        return 0

    return max(2 * len(cell_points & shifted_points) / denominator for shifted_points in template.shifted_points)


def shifted_masks(
    points: frozenset[tuple[int, int]],
    size: int = DIGIT_SAMPLE_SIZE,
    max_shift: int = 3,
) -> tuple[frozenset[tuple[int, int]], ...]:
    masks: list[frozenset[tuple[int, int]]] = []
    for dy in range(-max_shift, max_shift + 1):
        for dx in range(-max_shift, max_shift + 1):
            masks.append(
                frozenset(
                    (x + dx, y + dy)
                    for x, y in points
                    if 0 <= x + dx < size and 0 <= y + dy < size
                ),
            )
    return tuple(masks)


def read_image(path: Path) -> ImageData:
    with tempfile.NamedTemporaryFile(suffix=".bmp", delete=False) as temp_file:
        bmp_path = Path(temp_file.name)
    try:
        subprocess.run(
            ["sips", "-s", "format", "bmp", str(path), "--out", str(bmp_path)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return read_bmp(bmp_path)
    finally:
        bmp_path.unlink(missing_ok=True)


def read_bmp(path: Path) -> ImageData:
    data = path.read_bytes()
    if data[:2] != b"BM":
        raise ValueError(f"Not a BMP file: {path}")

    pixel_offset = struct.unpack_from("<I", data, 10)[0]
    width = struct.unpack_from("<i", data, 18)[0]
    signed_height = struct.unpack_from("<i", data, 22)[0]
    planes = struct.unpack_from("<H", data, 26)[0]
    bits_per_pixel = struct.unpack_from("<H", data, 28)[0]
    compression = struct.unpack_from("<I", data, 30)[0]
    if planes != 1 or bits_per_pixel != 24 or compression != 0:
        raise ValueError(f"Unsupported BMP format produced by sips: {path}")

    height = abs(signed_height)
    top_down = signed_height < 0
    row_stride = ((width * bits_per_pixel + 31) // 32) * 4
    rgb = bytearray(width * height * 3)
    for y in range(height):
        source_y = y if top_down else height - 1 - y
        row_start = pixel_offset + source_y * row_stride
        for x in range(width):
            blue, green, red = data[row_start + x * 3 : row_start + x * 3 + 3]
            write_index = (y * width + x) * 3
            rgb[write_index] = red
            rgb[write_index + 1] = green
            rgb[write_index + 2] = blue
    return ImageData(width, height, rgb)


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


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"generate_plaintext_puzzles.py: {error}", file=sys.stderr)
        raise SystemExit(1)
