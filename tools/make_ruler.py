#!/usr/bin/env python3
"""
Generate two "ruler" source images that encode their row index in RGB, so a
rendered frame can be decoded back to the exact per-pixel vertical displacement
(sub-pixel, noise-free) of each source. This is how we measured the real engine's
motion curve precisely (see docs/DEBUGGING.md).

Ruler A: R = row%256, G = (row//256)*40, B = 128
Ruler B: R = 64,      G = 200,          B = row%256

Writes /tmp/rulerA.png and /tmp/rulerB.png at 1854x1042 (repo source size).

Usage: ./venv/bin/python tools/make_ruler.py
"""
from PIL import Image
import numpy as np

W, H = 1854, 1042
a = np.zeros((H, W, 3), dtype=np.uint8)
for y in range(H):
    a[y, :, 0] = y % 256
    a[y, :, 1] = (y // 256) * 40
    a[y, :, 2] = 128
Image.fromarray(a).save("/tmp/rulerA.png")

b = np.zeros((H, W, 3), dtype=np.uint8)
for y in range(H):
    b[y, :, 0] = 64
    b[y, :, 1] = 200
    b[y, :, 2] = y % 256
Image.fromarray(b).save("/tmp/rulerB.png")
print("wrote /tmp/rulerA.png, /tmp/rulerB.png")
