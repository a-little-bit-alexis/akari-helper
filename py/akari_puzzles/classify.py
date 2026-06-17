from __future__ import annotations

import math
import re
import shutil
from dataclasses import dataclass
from pathlib import Path

from akari_puzzles.images import ImageData, iter_image_files, read_image, write_image

CELL_CHARACTERS = {
    "wall_0": "0",
    "wall_1": "1",
    "wall_2": "2",
    "wall_3": "3",
    "wall_4": "4",
}
CELL_SAMPLE_SIZE = 48
DIGIT_SAMPLE_SIZE = 32
DIGIT_THRESHOLD = 90
BLANK_WALL_MAX_DIGIT_PIXELS = 20
DIGIT_CROP_PADDING = 2
CELL_KEY_PATTERN = re.compile(r"(?:.*--)?ROW_(\d+)_COL_(\d+)$")


@dataclass(frozen=True)
class TemplateMask:
    name: str
    points: frozenset[tuple[int, int]]
    shifted_points: tuple[frozenset[tuple[int, int]], ...]


@dataclass(frozen=True)
class ClassificationResult:
    value: str
    cropped_digit: ImageData | None = None


def load_templates(templates_dir: Path) -> dict[str, TemplateMask]:
    digit_templates_dir = templates_dir / "cropped"
    if digit_templates_dir.is_dir():
        templates_dir = digit_templates_dir

    templates: dict[str, TemplateMask] = {}
    for path in iter_image_files(templates_dir):
        template_name = path.stem
        if template_name in {"floor", "wall_blank"}:
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


def classify_cell_file(
    path: Path,
    templates: dict[str, TemplateMask],
    row: int | None = None,
    col: int | None = None,
    digit_artifacts_dir: Path | None = None,
) -> str:
    cell = read_image(path)
    result = classify_cell(cell, templates)
    if result.cropped_digit is not None and digit_artifacts_dir is not None and row is not None and col is not None:
        write_digit_artifacts(path, result.cropped_digit, digit_artifacts_dir, row, col)

    return result.value


def classify_cell_image(cell: ImageData, templates: dict[str, TemplateMask]) -> str:
    return classify_cell(cell, templates).value


def classify_cell(cell: ImageData, templates: dict[str, TemplateMask]) -> ClassificationResult:
    grayscale = resize_to_grayscale(cell)
    mean_brightness = sum(grayscale) / len(grayscale)
    if mean_brightness >= 150:
        return ClassificationResult(" ")

    cropped_digit = crop_to_digit(cell)
    if cropped_digit is None:
        return ClassificationResult("X")

    cropped_grayscale = resize_to_grayscale(cropped_digit)
    cropped_points = normalize_digit_points(mask_points(cropped_grayscale, threshold=DIGIT_THRESHOLD))
    template = max(
        templates.values(),
        key=lambda candidate: best_shifted_f1_score(cropped_points, candidate),
    )
    return ClassificationResult(CELL_CHARACTERS[template.name], cropped_digit)


def crop_to_digit(cell: ImageData) -> ImageData | None:
    bright_pixels: list[tuple[int, int]] = []
    for y in range(cell.height):
        for x in range(cell.width):
            if cell.gray_at(x, y) > DIGIT_THRESHOLD:
                bright_pixels.append((x, y))

    if len(bright_pixels) < BLANK_WALL_MAX_DIGIT_PIXELS:
        return None

    min_x = max(0, min(x for x, _ in bright_pixels) - DIGIT_CROP_PADDING)
    max_x = min(cell.width, max(x for x, _ in bright_pixels) + DIGIT_CROP_PADDING + 1)
    min_y = max(0, min(y for _, y in bright_pixels) - DIGIT_CROP_PADDING)
    max_y = min(cell.height, max(y for _, y in bright_pixels) + DIGIT_CROP_PADDING + 1)
    return cell.crop(min_x, min_y, max_x, max_y)


def write_digit_artifacts(source_path: Path, cropped_digit: ImageData, dest_dir: Path, row: int, col: int) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    artifact_stem = f"ROW_{row:02d}__COL_{col:02d}"
    suffix = source_path.suffix or ".PNG"
    shutil.copy2(source_path, dest_dir / f"{artifact_stem}{suffix}")
    write_image(dest_dir / f"{artifact_stem}--CROPPED{suffix}", cropped_digit)


def cell_key(row: int, col: int) -> str:
    return f"ROW_{row:02d}_COL_{col:02d}"


def parse_cell_key(path: Path) -> tuple[int, int]:
    match = CELL_KEY_PATTERN.fullmatch(path.stem)
    if match is None:
        raise ValueError(f"Cell image filename must include ROW_##_COL_##: {path.name}")
    return int(match.group(1)), int(match.group(2))


def find_cell_image(source_dir: Path, row: int, col: int) -> Path:
    key = cell_key(row, col)
    matches = [path for path in iter_image_files(source_dir) if path.stem == key or path.stem.endswith(f"--{key}")]
    if not matches:
        raise ValueError(f"No cell image found for {key} in {source_dir}")
    if len(matches) > 1:
        match_names = ", ".join(path.name for path in matches)
        raise ValueError(f"Multiple cell images found for {key}: {match_names}")
    return matches[0]


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
                frozenset((x + dx, y + dy) for x, y in points if 0 <= x + dx < size and 0 <= y + dy < size),
            )
    return tuple(masks)
