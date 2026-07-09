#!/usr/bin/env python3
"""
Analyze each transition's 48-frame segment in the ground-truth capture to find,
per slug, the frame where the animation SETTLES to source B. Produces the
per-slug settle windows that tools/slice_gui_gt.py uses to slice each GT so it
ends on fully-settled B (transitions have different authored durations, so B
settles at different seg-frames — see slice_gui_gt.py's docstring).

Each segment = 12 still-A + 24 transition + 12 still-B frames. transStart (the
first transition frame) is at seg index 12; its video frame = round(offset_s * fps).
For each slug it computes:
  lead   — last leading frame still identical to source A (still-A region)
  settle — first frame of the trailing static (fully-settled-B) region
  settle_is_B — whether the settle frame actually matches source B (sanity check)

Distances are RMS over 320x180 thumbnails. Prints a per-slug table and lists any
slugs whose settle frame is NOT B (indicates a detection/capture problem).

Inputs:  /tmp/gt_slice_map.json (slug -> {offset_s}), /tmp/allframes/f_NNNNN.png
         (1-indexed ffmpeg frames, already 320x180), images/start.jpg, images/end.jpg
Output:  /tmp/seg_analysis.json

Usage: ./venv/bin/python tools/analyze_segments.py
"""
import json
import os
import sys
import numpy as np
from PIL import Image

# tools/ dir holds the canonical side-effect-free constants module.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fcp_constants import FPS  # canonical FPS = TIMESCALE/1001 = 24000/1001

fps=FPS  # = TIMESCALE/1001 (canonical in tools/fcp_constants.py); 23.976fps
gm={r['slug']:r for r in json.load(open('/tmp/gt_slice_map.json'))}  # slug -> {offset_s, ...}
AF='/tmp/allframes'
A=np.asarray(Image.open('images/start.jpg').convert('RGB').resize((320,180)),float)  # source A
B=np.asarray(Image.open('images/end.jpg').convert('RGB').resize((320,180)),float)     # source B
def frame(n): return np.asarray(Image.open(f'{AF}/f_{n:05d}.png').convert('RGB'),float)  # already 320x180
def d(x,y): return float(np.sqrt(((x-y)**2).mean()))  # RMS distance between two thumbnails
res={}
for slug in sorted(gm):
    ts=round(gm[slug]['offset_s']*fps)   # transStart video frame (=seg idx 12)
    segstart=ts-12                        # seg idx 0
    # ffmpeg output frames are 1-indexed: video frame N -> f_{N+1:05d}
    ims={}
    for k in range(48):
        vn=segstart+k
        try: ims[k]=frame(vn+1)
        except Exception: ims[k]=None
    if any(v is None for v in ims.values()): res[slug]={'err':'missing'}; continue
    dB=[d(ims[k],B) for k in range(48)]
    dA=[d(ims[k],A) for k in range(48)]
    # trailing static region: largest s s.t. frames [s..47] mutually ~identical
    settle=47
    for k in range(46,11,-1):
        if d(ims[k],ims[k+1])<1.5: settle=k
        else: break
    # leading static (still-A): last j s.t. [0..j] identical
    lead=0
    for j in range(1,36):
        if d(ims[j],ims[j-1])<1.5: lead=j
        else: break
    res[slug]={'segstart':segstart,'transStart_idx':12,'lead':lead,'settle':settle,
               'dB_at_35':round(dB[35],1),'dB_at_settle':round(dB[settle],1),
               'settle_is_B':dB[settle]<15}
json.dump(res,open('/tmp/seg_analysis.json','w'),indent=0)
# summary
print(f"{'slug':38s} lead settle dB@35 dB@settle settleB?")
bad=[]
for slug in sorted(res):
    r=res[slug]
    if 'err' in r: print(f"{slug:38s} ERR"); continue
    print(f"{slug:38s} {r['lead']:4d} {r['settle']:6d} {r['dB_at_35']:6.1f} {r['dB_at_settle']:8.1f}  {r['settle_is_B']}")
    if not r['settle_is_B']: bad.append(slug)
print(f"\n{len(bad)} slugs whose settle frame is NOT B: {bad}")
