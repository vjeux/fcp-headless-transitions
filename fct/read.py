"""fct.read — the SINGLE way to read a frame from disk.

Always returns a float64 numpy array shape (H, W, 3), RGB, values 0..255.
Nothing is cached in memory; every call hits the disk. If the file is missing,
returns a black frame of the canonical SIZE (so callers never crash on gaps).
"""
import os
import numpy as np
from PIL import Image
from .config import SIZE

def read_frame(path: str, size=None) -> np.ndarray:
    """Read a PNG/JPG file -> (H,W,3) float64 RGB 0..255.

    size: optional (w, h) to LANCZOS-resize to. Default: native size.
          Pass fct.config.SIZE to force the canonical 1920x1080.
    Missing file -> black frame at `size` (or SIZE if size is None).
    """
    if not os.path.exists(path):
        w, h = size or SIZE
        return np.zeros((h, w, 3), np.float64)
    im = Image.open(path).convert("RGB")
    if size is not None and im.size != tuple(size):
        im = im.resize(size, Image.LANCZOS)
    return np.asarray(im, np.float64)
