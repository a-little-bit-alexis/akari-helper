from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image

SUPPORTED_IMAGE_EXTENSIONS = {".png"}


@dataclass
class ImageData:
    image: Image.Image
    gray: list[int] | None = None

    @property
    def width(self) -> int:
        return self.image.width

    @property
    def height(self) -> int:
        return self.image.height

    def gray_at(self, x: int, y: int) -> int:
        if self.gray is None:
            rgb = self.image.tobytes()
            self.gray = []
            for index in range(0, len(rgb), 3):
                red = rgb[index]
                green = rgb[index + 1]
                blue = rgb[index + 2]
                self.gray.append((red * 299 + green * 587 + blue * 114) // 1000)
        return self.gray[y * self.width + x]

    def crop(self, x0: int, y0: int, x1: int, y1: int) -> ImageData:
        x0 = max(0, x0)
        y0 = max(0, y0)
        x1 = min(self.width, x1)
        y1 = min(self.height, y1)
        return ImageData(self.image.crop((x0, y0, x1, y1)).convert("RGB"))


def iter_image_files(directory: Path) -> list[Path]:
    return sorted(
        path for path in directory.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_IMAGE_EXTENSIONS
    )


def read_image(path: Path) -> ImageData:
    with Image.open(path) as image:
        return ImageData(image.convert("RGB"))


def write_image(path: Path, image: ImageData) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.image.save(path)
