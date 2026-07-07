import numpy as np, json, os
from PIL import Image
fps=24000/1001
gm={r['slug']:r for r in json.load(open('/tmp/gt_slice_map.json'))}
AF='/tmp/allframes'
A=np.asarray(Image.open('images/start.jpg').convert('RGB').resize((320,180)),float)
B=np.asarray(Image.open('images/end.jpg').convert('RGB').resize((320,180)),float)
def frame(n): return np.asarray(Image.open(f'{AF}/f_{n:05d}.png').convert('RGB'),float)  # already 320x180
def d(x,y): return float(np.sqrt(((x-y)**2).mean()))
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
