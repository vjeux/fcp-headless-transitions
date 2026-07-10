"""fct.compare — the SINGLE visual comparison between TWO files on disk.

compare(a_path, b_path) -> dict with psnr, mean_abs_diff, max_diff, shape.
Both files are read from disk (via fct.read). If `color_a`/`color_b` is set,
that side gets the sRGB->bt709 model applied before comparing (use color_a
or color_b='bt709' when comparing a headless/engine frame to a GUI GT frame).
On shape mismatch, `b` is resized to `a`'s shape (LANCZOS) before comparing.

Optionally writes a side-by-side + amplified-diff PNG to `out_png`.
"""
import math
import numpy as np
from PIL import Image
from .read import read_frame
from .color import to_bt709

def _psnr(a: np.ndarray, b: np.ndarray) -> float:
    mse = ((a - b) ** 2).mean()
    return 99.0 if mse <= 0 else 10.0 * math.log10(65025.0 / mse)

def compare(a_path: str, b_path: str, color_a=None, color_b=None, out_png=None) -> dict:
    """Compare two image files. color_a/color_b: None or 'bt709'."""
    a = read_frame(a_path)
    b = read_frame(b_path)
    if a.shape != b.shape:
        # resize b -> a's (w,h)
        h, w = a.shape[:2]
        b = read_frame(b_path, size=(w, h))
    if color_a == "bt709":
        a = to_bt709(a)
    if color_b == "bt709":
        b = to_bt709(b)
    d = np.abs(a - b)
    res = {
        "psnr": round(_psnr(a, b), 2),
        "mean_abs_diff": round(float(d.mean()), 3),
        "max_diff": round(float(d.max()), 1),
        "shape": list(a.shape),
    }
    if out_png:
        # left: a, middle: b, right: 4x-amplified abs diff
        amp = np.clip(d * 4.0, 0, 255)
        strip = np.concatenate([a, b, amp], axis=1).astype(np.uint8)
        Image.fromarray(strip).save(out_png)
        res["out_png"] = out_png
    return res
