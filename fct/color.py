"""fct.color — the SINGLE sRGB->bt709 color transform.

Headless and engine render in sRGB; the GUI GT is bt709. To compare a
headless/engine frame against the GUI GT fairly, apply this first.
out = 255 * gain * (in/255) ** gamma, per channel.
"""
import numpy as np
from .config import GAM

def to_bt709(a: np.ndarray) -> np.ndarray:
    """Apply the sRGB->bt709 color model to a (H,W,3) 0..255 array."""
    o = np.zeros_like(a)
    for c, ch in enumerate("RGB"):
        g, gain = GAM[ch]
        o[:, :, c] = 255.0 * gain * np.clip(a[:, :, c] / 255.0, 1e-4, 1.0) ** g
    return np.clip(o, 0.0, 255.0)
