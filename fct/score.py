"""fct.score — score a source against the ground-truth reference.

score(slug, source) reads the source's 24 frames and the REFERENCE truth's 24 frames
from disk and returns per-frame + mean PSNR (source color-conformed to the reference's
color space first). No in-memory render; frames must already be on disk (use `fct gen`).

GROUND TRUTH = HEADLESS FCP (changed 2026-07-22).
Previously the GUI ProRes export ("gui") was the only truth, but the GUI applies a
display-pipeline colour transform ON TOP of FCP's actual per-pixel render (proven in
fct/parity: the decoded, node-boundary-VERIFIED colour transfers match HEADLESS FCP but
REGRESS the GUI gate — headless≠GUI). Headless FCP is FCP's real render function, so it is
the faithful truth that lets the decode work actually land. The reference source is set by
`TRUTH` below (env override FCT_TRUTH) and defaults to "headless". Both headless and engine
render in sRGB, so an sRGB source scored against the sRGB headless truth needs NO bt709
conform; the conform is applied only when the reference is the bt709 GUI GT.

`gate_size` (w,h) downscales BOTH frames to a fixed small resolution before PSNR.
Decoding 48 full 1920x1080 frames/slug dominates cost, so the regression GATE
reads at a reduced resolution — PSNR ranking / regression detection is preserved,
and it's ~an order of magnitude faster and slug-uniform. Pass gate_size=None for exact
full-resolution scoring (reporting, not the gate).
"""
import os
import numpy as np
from .config import N_FRAMES, frame_path, needs_bt709, SOURCES
from .read import read_frame, read_frame_cached
from .color import to_bt709
from .compare import _psnr

# Fixed gate resolution: fast, decode-cheap, and slug-uniform (a noisy 10MB frame
# and a flat frame both cost the same once downscaled). PSNR at this size
# tracks full-res closely enough to catch any >0.3dB regression.
GATE_SIZE = (480, 270)

# GROUND TRUTH source: HEADLESS FCP by default (see module docstring). Override with
# FCT_TRUTH=gui to fall back to the legacy GUI ProRes export truth.
TRUTH = os.environ.get("FCT_TRUTH", "headless")


def score(slug: str, source: str = "engine", gate_size=None, truth: str = None) -> dict:
    """Score a source's frames vs the ground-truth reference. Returns {mean, frames:[...], n}.
    gate_size=(w,h) downscales both sides first (fast gate); None = full res.
    truth=<source> overrides the reference (default TRUTH = headless FCP)."""
    ref = truth or TRUTH
    ref_color = SOURCES[ref]["color"]
    src_color = SOURCES[source]["color"]
    # Conform the source to the reference's color space ONLY when they differ. Both
    # headless and engine are sRGB, so engine-vs-headless needs no conform; a bt709 GUI
    # reference triggers the sRGB->bt709 model on an sRGB source.
    conform = (src_color == "srgb" and ref_color == "bt709")
    if source == ref:
        # scoring the truth against itself is degenerate (perfect); guard for clarity.
        pass
    per = []
    for i in range(N_FRAMES):
        gp = frame_path(ref, slug, i)
        sp = frame_path(source, slug, i)
        if gate_size:
            # Both sides cached as mtime-invalidated thumbnails: the reference GT is
            # immutable (or re-rendered with a newer mtime), and a re-rendered source has
            # a newer mtime so its stale thumbnail is rebuilt automatically.
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
    return {"slug": slug, "source": source, "truth": ref,
            "mean": round(float(np.mean(per)), 2), "frames": per, "n": len(per)}
