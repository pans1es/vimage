"""Generate minimal vimage wordmark icons (black bg, white italic V)."""

from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as e:
    raise SystemExit(
        "Pillow required: uv run --with pillow python frontend/scripts/generate_brand_icons.py"
    ) from e

OUT = Path(__file__).resolve().parents[1] / "public"


def make_icon(size: int, *, maskable: bool = False) -> Image.Image:
    img = Image.new("RGBA", (size, size), (17, 24, 39, 255))  # near ink
    draw = ImageDraw.Draw(img)
    # Safe zone for maskable ~80%
    inset = int(size * 0.12) if maskable else int(size * 0.08)
    font_size = max(12, size - 2 * inset)
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except OSError:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", font_size)
        except OSError:
            font = ImageFont.load_default()

    text = "V"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) / 2 - bbox[0]
    y = (size - th) / 2 - bbox[1] - size * 0.04
    # slight italic via affine shear
    letter = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ld = ImageDraw.Draw(letter)
    ld.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    shear = 0.18
    letter = letter.transform(
        (size, size),
        Image.Transform.AFFINE,
        (1, shear, -shear * size * 0.35, 0, 1, 0),
        resample=Image.Resampling.BICUBIC,
    )
    img = Image.alpha_composite(img, letter)
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    specs = [
        ("favicon-16x16.png", 16, False),
        ("favicon-32x32.png", 32, False),
        ("apple-touch-icon.png", 180, False),
        ("android-chrome-192x192.png", 192, False),
        ("android-chrome-512x512.png", 512, False),
        ("android-chrome-maskable-192x192.png", 192, True),
        ("android-chrome-maskable-512x512.png", 512, True),
    ]
    for name, size, maskable in specs:
        make_icon(size, maskable=maskable).save(OUT / name, format="PNG")
        print("wrote", name)

    # ICO from 32 + 16
    ico16 = make_icon(16)
    ico32 = make_icon(32)
    ico32.save(
        OUT / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=[ico16],
    )
    print("wrote favicon.ico")


if __name__ == "__main__":
    main()
