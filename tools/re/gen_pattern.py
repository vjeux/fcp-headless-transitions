#!/usr/bin/env python3
"""tools/re/gen_pattern.py — synthetic test-pattern generator for filter RE.

Produces controlled inputs (single/concentric rings, radial spokes, grids) used to
probe the SHAPE of a filter's kernel through real headless FCP (see filter_probe.py
--in-a). Committed tool — reproducible, not a /tmp scratch pattern.

USAGE
  gen_pattern.py rings   --out p.png [--w 1920 --h 1080 --spacing 40 --thick 2]
  gen_pattern.py ring    --out p.png [--radius 300 --thick 2]      # single ring
  gen_pattern.py spokes  --out p.png [--n 36]                       # radial spokes
"""
import argparse, numpy as np
from PIL import Image

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("kind", choices=["rings","ring","spokes","grid"])
    ap.add_argument("--out", required=True)
    ap.add_argument("--w", type=int, default=1920)
    ap.add_argument("--h", type=int, default=1080)
    ap.add_argument("--spacing", type=int, default=40)
    ap.add_argument("--thick", type=float, default=2.0)
    ap.add_argument("--radius", type=float, default=300.0)
    ap.add_argument("--n", type=int, default=36)
    a = ap.parse_args()
    W,H = a.w,a.h
    cy,cx = H/2.0, W/2.0
    yy,xx = np.mgrid[0:H,0:W]
    r = np.hypot(xx-cx, yy-cy)
    th = np.arctan2(yy-cy, xx-cx)
    img = np.zeros((H,W),float)
    if a.kind=="rings":
        # bright rings at every `spacing` px
        m = np.abs((r % a.spacing)) < a.thick
        img[m] = 255
    elif a.kind=="ring":
        m = np.abs(r - a.radius) < a.thick
        img[m] = 255
    elif a.kind=="spokes":
        # bright radial spokes every 360/n degrees
        step = 2*np.pi/a.n
        m = np.abs(((th+np.pi) % step)) < (a.thick*step/ a.spacing + 0.01)
        img[m] = 255
    elif a.kind=="grid":
        m = (np.abs(xx % a.spacing) < a.thick) | (np.abs(yy % a.spacing) < a.thick)
        img[m]=255
    rgb = np.stack([img,img,img],axis=-1).astype(np.uint8)
    Image.fromarray(rgb).save(a.out)
    print(f"wrote {a.kind} {W}x{H} -> {a.out}")

if __name__=="__main__":
    main()
