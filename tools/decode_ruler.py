#!/usr/bin/env python3
"""
Decode ruler-rendered frames back to the exact vertical displacement of source A
per frame. Reads column x=960 of each frame, recovers each output row's source
row from the encoded RGB, and reports the median displacement.

  displacement = output_row - oy - source_row     (oy = letterbox top = 19)

Usage: ./venv/bin/python tools/decode_ruler.py <frames_dir> [nframes]
Prints:  "<frame> <displacement>" per line (NA if source A not visible).
"""
import sys
from PIL import Image
import numpy as np

OY = 19  # (1080-1042)/2 letterbox offset
d = sys.argv[1]
n = int(sys.argv[2]) if len(sys.argv) > 2 else 50
for fi in range(n):
    try:
        im = np.asarray(Image.open(f"{d}/frame_{fi:04d}.png").convert("RGB")).astype(int)
    except FileNotFoundError:
        print(f"{fi} NA"); continue
    col = im[:, 960]
    disps = []
    for y in range(im.shape[0]):
        r, g, bl = col[y]
        # Ruler A pixels: B ~ 128, G is a multiple of 40 (not 200 = ruler B's green)
        if abs(bl - 128) < 30 and g != 200 and (r + g) > 4:
            srow = r + round(g / 40) * 256
            if 0 <= srow < 1042:
                disps.append(y - OY - srow)
    print(f"{fi} {round(float(np.median(disps)),1) if len(disps) >= 20 else 'NA'}")
