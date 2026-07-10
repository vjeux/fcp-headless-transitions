"""fct.read — the SINGLE way to read a frame from disk.

Always returns a float64 numpy array shape (H, W, 3), RGB, values 0..255.
Nothing is cached in memory; every call hits the disk. If the file is missing,
returns a black frame of the canonical SIZE (so callers never crash on gaps).

`size=(w,h)` LANCZOS-resizes after decode. For the regression GATE, which reads
the immutable GUI GT at a small fixed size thousands of times, use
`read_frame_cached(path, size)`: it writes a decoded+downscaled thumbnail next to
the source once (`.fctcache/<w>x<h>/…`) and reads that tiny thumbnail thereafter, so
the cost drops from decoding a full 1920x1080 frame to a small downscaled one.
"""
import os
import numpy as np
from PIL import Image
from .config import SIZE, FRAME_EXT, JPEG_QUALITY

def _save(im: Image.Image, path: str) -> None:
    """Save an image honoring the project frame format (JPEG q=90 by default)."""
    if path.lower().endswith((".jpg", ".jpeg")):
        im.save(path, quality=JPEG_QUALITY)
    else:
        im.save(path)

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

def read_frame_cached(path: str, size) -> np.ndarray:
    """Like read_frame(path, size) but caches the downscaled thumbnail on disk.

    Only for IMMUTABLE frames (the GUI GT). The thumbnail lives at
    <dir>/.fctcache/<w>x<h>/<name>.<FRAME_EXT> and is regenerated if the source is
    newer. Reading the tiny thumbnail avoids decoding the full-res source.
    """
    if size is None or not os.path.exists(path):
        return read_frame(path, size)
    w, h = size
    d, name = os.path.split(path)
    stem = os.path.splitext(name)[0]
    cdir = os.path.join(d, ".fctcache", f"{w}x{h}")
    cpath = os.path.join(cdir, f"{stem}.{FRAME_EXT}")
    if os.path.exists(cpath) and os.path.getmtime(cpath) >= os.path.getmtime(path):
        return np.asarray(Image.open(cpath).convert("RGB"), np.float64)
    im = Image.open(path).convert("RGB")
    if im.size != (w, h):
        im = im.resize((w, h), Image.LANCZOS)
    os.makedirs(cdir, exist_ok=True)
    _save(im, cpath)
    # Return by RE-READING the saved thumbnail (not the in-memory `im`): the cache
    # format may be lossy (JPEG q90), so the just-written file's decoded pixels differ
    # slightly from `im`. Reading it back makes the cold (build) and warm (reuse) paths
    # return byte-identical pixels — otherwise `fct baseline` (cold) and `fct regress`
    # (warm) would score the same frames differently (~1dB), causing phantom regressions.
    return np.asarray(Image.open(cpath).convert("RGB"), np.float64)
