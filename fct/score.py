"""fct.score — score a source against the GUI ground truth (the ONLY real truth).

score(slug, source) reads the source's 24 frames and the GUI GT's 24 frames from
disk and returns per-frame + mean PSNR (source color-corrected to bt709 first).
No in-memory render; frames must already be on disk (use `fct gen` first).

This is the ONE scoring path. There is NO headless-vs-headless "ceiling" score —
that was circular. Truth = GUI GT only.
"""
import numpy as np
from .config import N_FRAMES, frame_path
from .read import read_frame
from .color import to_bt709
from .compare import _psnr

def score(slug: str, source: str = "headless") -> dict:
    """Score a source's frames vs GUI GT. Returns {mean, frames:[...], n}."""
    per = []
    for i in range(N_FRAMES):
        g = read_frame(frame_path("gui", slug, i))
        s = read_frame(frame_path(source, slug, i), size=(g.shape[1], g.shape[0]))
        s = to_bt709(s)
        per.append(round(_psnr(g, s), 2))
    return {"slug": slug, "source": source,
            "mean": round(float(np.mean(per)), 2), "frames": per, "n": len(per)}
