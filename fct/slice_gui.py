"""fct.slice_gui — the SINGLE way to produce GUI ground-truth frames on disk.

Slices the recorded FCP GUI screen capture (GT_ALL_65.mov) into 24 frames/slug
at the SAME half-open i/N cadence the renderers use, so gui/headless/engine align.

GUI GT is the ONLY real truth. Do NOT compare renders to each other's outputs.

Window table: fct/gt_settle_windows.json  (transStart/settle per slug).
Output: ~/fct-gui-gt/<slug>/frame_0000..0023.<ext> (1920x1080, fct.config.FRAME_EXT).

Safety: extracts to a scratch dir and verifies the full span BEFORE overwriting
canonical frames — an under-extraction (ffmpeg under load) would silently corrupt
the GT, so a short span is a hard per-slug ERROR that leaves existing frames intact.
"""
import os, sys, json, subprocess
from .config import N_FRAMES, GUI_GT_DIR, REPO

MOV = os.path.join(REPO, "GT_ALL_65.mov")
FFMPEG = "/opt/homebrew/bin/ffmpeg"
_WIN_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "gt_settle_windows.json")

def slice_gui(slug: str) -> str:
    """Slice one slug's GUI GT from the .mov. Returns the output dir.
    Raises RuntimeError on under-extraction (canonical frames left intact)."""
    win = json.load(open(_WIN_PATH))
    if slug not in win:
        raise KeyError(f"no settle window for {slug}")
    if not os.path.exists(MOV):
        raise FileNotFoundError(f"GT mov not found: {MOV}")
    w = win[slug]; f0, f1 = w["transStart"], w["settle"]; span = f1 - f0 + 1
    d = os.path.join(GUI_GT_DIR, slug); os.makedirs(d, exist_ok=True)
    scratch = os.path.join(d, "_scratch"); os.makedirs(scratch, exist_ok=True)
    for p in os.listdir(scratch):
        try: os.remove(os.path.join(scratch, p))
        except OSError: pass
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", MOV,
                    "-vf", f"select='between(n\\,{f0}\\,{f1})',scale=1920:1080",
                    "-vsync", "0", "-frame_pts", "0",
                    os.path.join(scratch, "_seg_%04d.png")], check=False)
    segs = sorted(p for p in os.listdir(scratch) if p.startswith("_seg_"))
    if len(segs) < span:
        for p in segs:
            try: os.remove(os.path.join(scratch, p))
            except OSError: pass
        raise RuntimeError(f"{slug}: under-extracted {len(segs)}/{span} — canonical frames intact; re-run alone")
    for p in os.listdir(d):
        if p.startswith("frame_"):
            try: os.remove(os.path.join(d, p))
            except OSError: pass
    from PIL import Image
    from .read import _save
    from .config import FRAME_EXT
    for i in range(N_FRAMES):
        src_idx = (len(segs) - 1) if i == N_FRAMES - 1 else min(int(i / N_FRAMES * len(segs)), len(segs) - 1)
        im = Image.open(os.path.join(scratch, segs[src_idx])).convert("RGB")
        _save(im, os.path.join(d, f"frame_{i:04d}.{FRAME_EXT}"))
    for p in segs:
        try: os.remove(os.path.join(scratch, p))
        except OSError: pass
    try: os.rmdir(scratch)
    except OSError: pass
    return d
