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
"""
import json, os, subprocess, sys
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
    # Map 24 output frames onto the extracted span via nearest-integer index, so the endpoints
    # are exact: frame_0000 = span[0] = transStart (pure A), frame_0023 = span[-1] = settle (B).
    import shutil
    for i in range(N):
        src_idx = round(i/(N-1) * (len(segs)-1)) if len(segs)>1 else 0
        src_idx = min(src_idx, len(segs)-1)
        shutil.copy(os.path.join(d,segs[src_idx]), os.path.join(d,f"frame_{i:04d}.png"))
    for p in segs:
        try: os.remove(os.path.join(d,p))
        except OSError: pass
    print(f"{slug}: span [{f0}..{f1}]={span}f -> 24 (settle-anchored)",flush=True)
print(f"DONE -> {OUT}")
