"""One-shot: remap Darkroom inline oklch to operating-room tokens.

Skips index.css (source of truth). Conservative: only dark cool panels,
purple accents, near-black-on-neon, and white glass overlays.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"
SKIP = {"index.css"}

OKLCH_RE = re.compile(
    r"oklch\(\s*([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)(?:\s*/\s*([0-9]*\.?[0-9]+))?\s*\)"
)


def rewrite(value: str) -> str:
    L = float(value.group(1))
    C = float(value.group(2))
    H = float(value.group(3))

    # near-black used as text on neon / glow buttons
    if L <= 0.16 and C <= 0.02:
        return "var(--color-on-accent)"

    # white glass overlays / inset highlights
    if L >= 0.95 and C <= 0.02:
        alpha = float(value.group(4)) if value.group(4) is not None else 1.0
        if alpha < 0.45:
            return f"oklch(0.24 0.022 250 / {alpha:.4g})"
        return "var(--color-surface)"

    # purple Darkroom accent family
    if 280 <= H <= 320 and C >= 0.03:
        if L >= 0.82:
            return "var(--color-accent-2)"
        if L >= 0.55:
            return "var(--color-accent)"
        return "var(--color-accent-dim)"

    # dark cool panels (blue-gray / purple-gray)
    if 240 <= H <= 280 and L < 0.46:
        alpha = float(value.group(4)) if value.group(4) is not None else 1.0
        if alpha < 0.85:
            return f"oklch(0.24 0.022 250 / {alpha:.4g})"
        if L < 0.18:
            return "var(--color-well)"
        if L < 0.26:
            return "var(--color-surface-2)"
        return "var(--color-surface)"

    return value.group(0)


def main() -> None:
    changed = 0
    for path in ROOT.rglob("*"):
        if path.suffix not in {".css", ".ts", ".tsx"}:
            continue
        if path.name in SKIP:
            continue
        text = path.read_text(encoding="utf-8")
        next_text = OKLCH_RE.sub(rewrite, text)
        if next_text != text:
            path.write_text(next_text, encoding="utf-8")
            changed += 1
            print(path.relative_to(ROOT))
    print(f"updated {changed} files")


if __name__ == "__main__":
    main()
