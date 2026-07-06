#!/usr/bin/env python3
"""Slice GT_ALL_65.mov into per-transition GUI ground-truth frames — INTEGER FRAME.

Each transition occupies a 48-frame segment in the video: 12 still-A + 24 transition
+ 12 still-B. FCP plays the transition over its authored scene duration, and the GUI
export sampled it as 24 EQUAL, HALF-OPEN frames covering [transStart, transStart+24).
So GT frame i is EXACTLY video frame (transStartFrame + i) — a clean integer decode,
no fractional -ss seek (which lands past the frame boundary and shifts the whole ramp
one frame late; that was the old off-by-one that put a B-sliver on frame 0 and lagged
the back half).

transStartFrame = round(offset_s * fps), where offset_s/dur_s come from FCP's own
round-trip export (/tmp/gt_slice_map.json). fps = 24000/1001 (23.976).

Extracts the whole 24-frame transition window with ONE ffmpeg select= pass per slug
(fast: single decode, not 24 seeks) into ~/fct-gui-gt/<slug>/frame_XXXX.png (1920x1080).
"""
import json, os, subprocess, sys
MOV=os.path.expanduser('~/random/final-cut-pro-transitions/GT_ALL_65.mov')
OUT=os.path.expanduser('~/fct-gui-gt')
FFMPEG='/opt/homebrew/bin/ffmpeg'
FPS=24000/1001
N=24
rows=json.load(open('/tmp/gt_slice_map.json'))
if not os.path.exists(MOV): sys.exit(f"MOV not found: {MOV}")
os.makedirs(OUT,exist_ok=True)
only=set(sys.argv[1:])  # optional slug filter
for r in rows:
    slug=r['slug']
    if only and slug not in only: continue
    off=r['offset_s']
    transStart=round(off*FPS)          # integer video frame of transition frame 0
    f0, f1 = transStart, transStart+N-1  # inclusive video-frame range [f0..f1]
    d=os.path.join(OUT,slug); os.makedirs(d,exist_ok=True)
    # one decode pass: select the N frames, emit sequentially, scale to 1920x1080
    tmp=os.path.join(d,"_seg_%04d.png")
    for p in os.listdir(d):
        if p.startswith('_seg_') or p.startswith('frame_'):
            try: os.remove(os.path.join(d,p))
            except OSError: pass
    subprocess.run([FFMPEG,'-y','-loglevel','error','-i',MOV,
                    '-vf',f"select='between(n\\,{f0}\\,{f1})',scale=1920:1080",
                    '-vsync','0','-frame_pts','0',tmp],check=False)
    # rename _seg_0001.. (ffmpeg starts at 1) -> frame_0000..0023
    segs=sorted(p for p in os.listdir(d) if p.startswith('_seg_'))
    for i,p in enumerate(segs[:N]):
        os.rename(os.path.join(d,p),os.path.join(d,f"frame_{i:04d}.png"))
    print(f"{slug}: frames {f0}..{f1} ({len(segs)} extracted)",flush=True)
print(f"DONE -> {OUT}")
