#!/usr/bin/env python3
"""decode_reveal_order — extract the per-tile A->B flip FRAME from a slug's frames.

For a grid/replicator reveal transition (Squares, Duplicate, Video_Wall, ...), sample
each grid cell centre across all frames of a rendered SOURCE (gui / engine / headless)
and record the first frame where the cell is closer to image B than image A. This yields
the reveal ORDER matrix — the timing the engine's sequenceOrder must reproduce.

Rule 1: the GUI GT is the ONLY truth (default --source gui). Headless is offered only to
CONFIRM/REFUTE it as an oracle for a slug's order (Squares: headless correlates 0.102 with
GT => NOT valid; decode from gui). NO per-slug constant — the goal is the generic Motion
shuffle algorithm keyed on Shuffle Order / Seed.

Usage: decode_reveal_order.py <slug> --cols 14 --rows 8 [--source gui|engine|headless]
"""
import sys, os, glob, argparse
import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, REPO)
from fct.config import frames_dir, IMG_A, IMG_B

def load(path, size=(1920,1080)):
    return np.asarray(Image.open(path).convert("RGB").resize(size), float)

def flip_grid(slug, ncols, nrows, source="gui", samp=0.4):
    fdir = frames_dir(source, slug)
    frames = sorted(glob.glob(os.path.join(fdir, "frame_*.*")))
    if not frames:
        raise SystemExit(f"no frames in {fdir}")
    A = load(IMG_A); B = load(IMG_B)
    imgs = [load(f) for f in frames]
    H, W = 1080, 1920
    cw, ch = W/ncols, H/nrows
    flip = np.full((nrows, ncols), -1, int)
    for r in range(nrows):
        for c in range(ncols):
            y0 = int(r*ch + ch*(0.5-samp/2)); y1 = int(r*ch + ch*(0.5+samp/2))
            x0 = int(c*cw + cw*(0.5-samp/2)); x1 = int(c*cw + cw*(0.5+samp/2))
            aT = A[y0:y1, x0:x1].mean(axis=(0,1)); bT = B[y0:y1, x0:x1].mean(axis=(0,1))
            for fi, im in enumerate(imgs):
                t = im[y0:y1, x0:x1].mean(axis=(0,1))
                if np.abs(t-bT).sum() < np.abs(t-aT).sum():
                    flip[r, c] = fi; break
    return flip, len(frames)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug")
    ap.add_argument("--cols", type=int, required=True)
    ap.add_argument("--rows", type=int, required=True)
    ap.add_argument("--source", default="gui")
    ap.add_argument("--samp", type=float, default=0.4)
    a = ap.parse_args()
    flip, nf = flip_grid(a.slug, a.cols, a.rows, a.source, a.samp)
    print(f"# {a.slug}  source={a.source}  grid={a.cols}x{a.rows}  {nf} frames  flip-frame per cell (-1=never):")
    for r in range(a.rows):
        print(" ".join(f"{flip[r,c]:3d}" for c in range(a.cols)))
    lr = np.array_equal(flip, flip[:, ::-1]); tb = np.array_equal(flip, flip[::-1, :])
    print(f"# L<->R mirror: {lr}   T<->B mirror: {tb}")
    print(f"# distinct flip frames: {sorted(set(int(v) for v in flip.flatten() if v>=0))}")

if __name__ == "__main__":
    main()
