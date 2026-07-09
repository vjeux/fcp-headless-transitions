#!/usr/bin/env python3
"""Slice GT_ALL_65.mov into per-transition GUI ground-truth frames — INTEGER FRAME,
PER-SLUG B-SETTLE window.

Each transition occupies a 48-frame segment (12 still-A + 24 transition + 12 still-B),
BUT the transition does NOT complete at a fixed frame: transitions have different authored
durations, so B settles at different points. Push settles to B at seg-frame #35, but most
others (Clone_Spin/Rotate/Fall/Dissolves/...) settle at #36+, and some (Glide/Diagonal/Bloom)
settle EARLIER (#29-32). A fixed [transStart .. transStart+23] window therefore ends
MID-TRANSITION for the slower ones — the GT's last frame is not B (the bug this fixes).

Correct window = [transStart .. settleFrame], where settleFrame = first frame of the
trailing STATIC (fully-settled-B) region, detected per-slug (see /tmp/settle_windows.json,
built by analyze_segments.py from a single-pass thumbnail extraction). The span (18-25 video
frames) is resampled to exactly 24 output frames by nearest-integer mapping, so:
  frame_0000 = transStart (pure source A, t0)
  frame_0023 = settleFrame (fully-settled source B)
This guarantees every GT ends on B, and each transition's 24 frames span its TRUE extent.

transStart/settle come from /tmp/settle_windows.json. Extracts the full span with ONE ffmpeg
select= pass per slug, then maps to 24 frames. Output: ~/fct-gui-gt/<slug>/frame_XXXX.png (1920x1080).

TIME CONVENTION: the 24 output frames use the HALF-OPEN i/N mapping (frame i <- source
slice int(i/N * span)), matching the headless scorer's sample_time = i/24 * scene_duration
(see ~/fct-notes/fct_score_lib.py). Frame N-1 is the only exception: it is pinned to the
settle frame so the GT always ends on fully-settled source B. This module only SLICES the
GT; the sRGB->bt709 color model that reconciles headless vs GUI lives in the scorer, not here.
"""
import json, os, shutil, subprocess, sys
MOV=os.path.expanduser('~/random/final-cut-pro-transitions/GT_ALL_65.mov')
OUT=os.path.expanduser('~/fct-gui-gt')
FFMPEG='/opt/homebrew/bin/ffmpeg'
N=24
WIN=json.load(open('/tmp/settle_windows.json'))
if not os.path.exists(MOV): sys.exit(f"MOV not found: {MOV}")
os.makedirs(OUT,exist_ok=True)
only=set(sys.argv[1:])
for slug in sorted(WIN):
    if only and slug not in only: continue
    w=WIN[slug]; f0=w['transStart']; f1=w['settle']; span=f1-f0+1
    d=os.path.join(OUT,slug); os.makedirs(d,exist_ok=True)
    for p in os.listdir(d):
        if p.startswith('_seg_') or p.startswith('frame_'):
            try: os.remove(os.path.join(d,p))
            except OSError: pass
    # extract the full span [f0..f1] at full res
    tmp=os.path.join(d,"_seg_%04d.png")
    subprocess.run([FFMPEG,'-y','-loglevel','error','-i',MOV,
                    '-vf',f"select='between(n\\,{f0}\\,{f1})',scale=1920:1080",
                    '-vsync','0','-frame_pts','0',tmp],check=False)
    segs=sorted(p for p in os.listdir(d) if p.startswith('_seg_'))
    if len(segs) < span:
        print(f"{slug}: WARN extracted {len(segs)}/{span}",flush=True)
    # Map 24 output frames onto the extracted span via HALF-OPEN i/N (matching headless's
    # sample_time = i/24 * scene_duration). Without this, the closed i/(N-1) mapping causes a
    # timing misalignment of up to ~4% for span!=24 (50 of 65 transitions), which shows as a
    # "timing lag" at the midpoint (Flip f12: GUI 4.2% ahead of headless -> +11dB from fix).
    # EXCEPTION: frame N-1 (last) is pinned to the settle frame (src S-1 = B) so the GT still
    # ends on B (Problem 1 requirement). This makes the last step slightly larger — acceptable
    # since FCP's GUI export also ends on B at the settle.
    for i in range(N):
        if i == N - 1:
            src_idx = len(segs) - 1  # last GT frame = settle = B
        else:
            src_idx = min(int(i / N * len(segs)), len(segs) - 1)
        shutil.copy(os.path.join(d,segs[src_idx]), os.path.join(d,f"frame_{i:04d}.png"))
    for p in segs:
        try: os.remove(os.path.join(d,p))
        except OSError: pass
    print(f"{slug}: span [{f0}..{f1}]={span}f -> 24 (settle-anchored)",flush=True)
print(f"DONE -> {OUT}")
