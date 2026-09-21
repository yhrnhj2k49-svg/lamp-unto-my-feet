"""Parchment grain for the page background.

    python3 scripts/make-parchment.py

Writes assets/parchment.png: a white image whose only content is its alpha,
so the app can tint it per theme (warm brown on the day page, candle-gold on
the night one) and keep it faint.

It has to tile with no visible seam, so the large mottling is built only from
waves whose periods divide the tile exactly, and the fine grain is per-pixel
noise, which has no edges to line up in the first place.
"""

import numpy as np
from PIL import Image

N = 256
rng = np.random.default_rng(1611)  # the year of the King James; any seed would do

y, x = np.mgrid[0:N, 0:N] / N

# Mottling: a handful of waves at whole-number frequencies, so tile edges meet.
mottle = np.zeros((N, N))
for _ in range(14):
    fx, fy = rng.integers(1, 5, size=2)
    phase = rng.uniform(0, 2 * np.pi)
    weight = rng.uniform(0.4, 1.0) / (fx + fy)
    mottle += weight * np.cos(2 * np.pi * (fx * x + fy * y) + phase)
mottle = (mottle - mottle.min()) / (mottle.max() - mottle.min())

# Fibres: faint horizontal streaks, the way laid paper shows its mould.
fibre = np.zeros((N, N))
for _ in range(60):
    row = rng.integers(0, N)
    start = rng.integers(0, N)
    length = rng.integers(20, 90)
    cols = (start + np.arange(length)) % N
    fibre[row, cols] += rng.uniform(0.3, 0.8)

grain = rng.random((N, N))

alpha = 0.55 * mottle + 0.30 * grain + 0.35 * np.clip(fibre, 0, 1)
alpha = (alpha - alpha.min()) / (alpha.max() - alpha.min())
# Keep it a whisper: the page must still read as clean paper.
alpha = (alpha * 255 * 0.55).astype(np.uint8)

rgba = np.dstack([np.full((N, N), 255, np.uint8)] * 3 + [alpha])
Image.fromarray(rgba).save("assets/parchment.png", optimize=True)
print("assets/parchment.png", N, "px, alpha", int(alpha.min()), "-", int(alpha.max()))
