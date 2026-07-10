"""fct.montage — the SINGLE way to build a video montage from frame dirs.

montage(slugs, sources) builds one MP4 stacking the given sources vertically
(one labeled panel each), 24 frames/slug at 6fps, all slugs concatenated with a
title bar. Reads frames from disk via fct.read. Applies the bt709 color model to
headless/engine panels so they're visually comparable to the GUI GT panel.

    from fct.montage import montage
    montage(SLUGS, ["gui","headless","engine"], out="montage.mp4")
"""
import os, subprocess, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from .read import read_frame
from .color import to_bt709
from .config import N_FRAMES, frame_path

FFMPEG = "/opt/homebrew/bin/ffmpeg"
_PANEL = (640, 360)       # each source panel
_LABELW = 250
_FONT_PATH = "/System/Library/Fonts/Supplemental/Arial.ttf"

def _font(sz):
    try: return ImageFont.truetype(_FONT_PATH, sz)
    except Exception: return ImageFont.load_default()

def _panel(source, slug, i):
    """One labeled panel: read frame, color-correct if headless/engine, scale, label."""
    a = read_frame(frame_path(source, slug, i), size=_PANEL)
    if source in ("headless", "engine"):
        a = to_bt709(a)
    img = Image.new("RGB", (_LABELW + _PANEL[0], _PANEL[1]), (20, 20, 20))
    img.paste(Image.fromarray(a.astype(np.uint8)), (_LABELW, 0))
    d = ImageDraw.Draw(img)
    d.text((12, _PANEL[1] // 2 - 20), source, fill=(255, 255, 255), font=_font(34))
    return img

def montage(slugs, sources=("gui", "headless", "engine"), out="montage.mp4", fps=6):
    """Build the montage MP4. Returns the output path."""
    pw = _LABELW + _PANEL[0]; ph = _PANEL[1] * len(sources) + 70
    work = tempfile.mkdtemp(prefix="fct_mont_")
    segs = []
    title_font = _font(46)
    for si, slug in enumerate(slugs):
        seg_dir = os.path.join(work, f"seg_{si:03d}"); os.makedirs(seg_dir)
        for i in range(N_FRAMES):
            stack = Image.new("RGB", (pw, ph), (0, 0, 0))
            ImageDraw.Draw(stack).text((12, 14), f"{slug}   f{i:02d}/{N_FRAMES-1}",
                                       fill=(120, 220, 255), font=title_font)
            for r, src in enumerate(sources):
                stack.paste(_panel(src, slug, i), (0, 70 + r * _PANEL[1]))
            stack.save(os.path.join(seg_dir, f"f_{i:04d}.png"))
        seg_mp4 = os.path.join(work, f"seg_{si:03d}.mp4")
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-framerate", str(fps),
                        "-i", os.path.join(seg_dir, "f_%04d.png"), "-c:v", "libx264",
                        "-crf", "20", "-pix_fmt", "yuv420p",
                        "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", seg_mp4], check=True)
        segs.append(seg_mp4)
        print(f"  [{si+1}/{len(slugs)}] {slug}", flush=True)
    concat = os.path.join(work, "concat.txt")
    with open(concat, "w") as f:
        for p in segs: f.write(f"file '{p}'\n")
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
                    "-i", concat, "-c", "copy", out], check=True)
    print(f"DONE -> {out}", flush=True)
    return out
