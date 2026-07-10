"""fct.score — score a source against the GUI ground truth (the ONLY real truth).

score(slug, source) reads the source's 24 frames and the GUI GT's 24 frames from
disk and returns per-frame + mean PSNR (source color-corrected to bt709 first).
No in-memory render; frames must already be on disk (use `fct gen` first).

This is the ONE scoring path. There is NO headless-vs-headless "ceiling" score —
that was circular. Truth = GUI GT only.

`gate_size` (w,h) downscales BOTH frames to a fixed small resolution before PSNR.
Decoding 48 full 1920x1080 frames/slug dominates cost, so the regression GATE
reads at a reduced resolution — PSNR ranking / regression
detection is preserved, and it's ~an order of magnitude faster and slug-uniform.
Pass gate_size=None for exact full-resolution scoring (reporting, not the gate).
"""
import numpy as np
from .config import N_FRAMES, frame_path, needs_bt709
from .read import read_frame, read_frame_cached
from .color import to_bt709
from .compare import _psnr

# Fixed gate resolution: fast, decode-cheap, and slug-uniform (a noisy 10MB frame
# and a flat frame both cost the same once downscaled). PSNR at this size
# tracks full-res closely enough to catch any >0.3dB regression.
GATE_SIZE = (480, 270)

def score(slug: str, source: str = "headless", gate_size=None) -> dict:
    """Score a source's frames vs GUI GT. Returns {mean, frames:[...], n}.
    gate_size=(w,h) downscales both sides first (fast gate); None = full res.
    At gate_size the immutable GUI GT is read from a disk thumbnail cache."""
    conform = needs_bt709(source)  # sRGB sources are conformed to the bt709 GUI GT
    per = []
    for i in range(N_FRAMES):
        gp = frame_path("gui", slug, i)
        sp = frame_path(source, slug, i)
        if gate_size:
            # Both sides cached as mtime-invalidated thumbnails: the GUI GT is
            # immutable, and a re-rendered source has a newer mtime so its stale
            # thumbnail is rebuilt automatically. This turns the gate from
            # "decode 48 full-res frames" into "decode 48 small thumbnails".
            g = read_frame_cached(gp, gate_size)
            h, w = g.shape[:2]
            s = read_frame_cached(sp, (w, h))
        else:
            g = read_frame(gp)
            h, w = g.shape[:2]
            s = read_frame(sp, size=(w, h))
        if conform:
            s = to_bt709(s)
        per.append(round(_psnr(g, s), 2))
    return {"slug": slug, "source": source,
            "mean": round(float(np.mean(per)), 2), "frames": per, "n": len(per)}
