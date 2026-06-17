from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path

from akari_puzzles.images import ImageData, read_image


@dataclass(frozen=True)
class LineGroup:
    start: int
    end: int


@dataclass(frozen=True)
class PuzzleImageName:
    name: str
    rows: int
    cols: int


def parse_puzzle_image_name(path: Path) -> PuzzleImageName:
    try:
        name, dimensions = path.stem.rsplit("--", 1)
        rows_text, cols_text = dimensions.lower().split("x", 1)
        rows = int(rows_text)
        cols = int(cols_text)
    except ValueError as exc:
        raise ValueError(
            f"Image filename must be formatted as {{name}}--{{rows}}x{{cols}}.png: {path.name}",
        ) from exc
    if rows <= 0 or cols <= 0:
        raise ValueError(f"Puzzle dimensions must be positive: {path.name}")
    return PuzzleImageName(name=name, rows=rows, cols=cols)


def extract_grid_from_file(path: Path) -> ImageData:
    image_name = parse_puzzle_image_name(path)
    return extract_grid(read_image(path), image_name.rows, image_name.cols)


def extract_grid(image: ImageData, rows: int, cols: int) -> ImageData:
    row_lines, col_lines = find_puzzle_grid_lines(image, rows, cols)
    return image.crop(
        col_lines[0].start,
        row_lines[0].start,
        col_lines[-1].end + 1,
        row_lines[-1].end + 1,
    )


def split_grid(image: ImageData, rows: int, cols: int) -> dict[tuple[int, int], ImageData]:
    row_lines, col_lines = find_puzzle_grid_lines(image, rows, cols)
    cells: dict[tuple[int, int], ImageData] = {}
    for row_index in range(rows):
        for col_index in range(cols):
            cells[(row_index, col_index)] = crop_cell(image, row_lines, col_lines, row_index, col_index)
    return cells


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

    candidates: list[tuple[int, float, int, float, list[LineGroup]]] = [
        (abs(len(groups) - expected_count), -required_run_fraction, 130, required_run_fraction, groups),
    ]
    for dark_threshold in (60, 90, 110, 150, 170):
        for run_fraction in (required_run_fraction, 0.5, 0.45, 0.4):
            groups = find_dark_run_line_groups(
                image,
                axis,
                dark_threshold,
                scan_start,
                scan_end,
                run_fraction,
            )
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
            if (
                longest_dark_run(
                    (image.gray_at(x, y) for x in range(image.width)),
                    dark_threshold,
                )
                >= required_run_length
            ):
                line_indices.append(y)
    elif axis == "vertical":
        required_run_length = (scan_end - scan_start) * required_run_fraction
        for x in range(image.width):
            if (
                longest_dark_run(
                    (image.gray_at(x, y) for y in range(scan_start, scan_end)),
                    dark_threshold,
                )
                >= required_run_length
            ):
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
