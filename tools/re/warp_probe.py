#!/usr/bin/env python3
"""tools/re/warp_probe.py — decode a radial/spatial WARP filter (Fisheye/BlackHole/Poke/Target/
Sphere) against headless FCP using a SYNTHETIC test source.

KEY: ozengine.render_frame(doc, img_a, img_b, ...) takes ARBITRARY source image paths, so we feed
a synthetic radial-sine / ring / grid pattern to BOTH engines and read the warp's radial profile
with NO photo-content ambiguity. Build the single-filter synth scene with fct.faithful.synth.build,
mutate the warp param, render through ozengine with the synthetic source, and fit source-radius vs
output-radius. See evidence/FISHEYE_RE.md for the method notes (peak/edge pairing is biased for
strong barrels — prefer a dense per-radius phase-unwrap of a radial SINE, tracking cycles from the
centre outward where the map is well-conditioned).

Run via the DYLD self-re-exec pattern (SIP strips DYLD_* on a direct bash launch):
  the script re-execs itself into venv/bin/python3 with DYLD_FRAMEWORK_PATH set.
"""

import os,sys,tempfile
REPO="/Users/vjeux/random/final-cut-pro-transitions"; FW="/Applications/Final Cut Pro.app/Contents/Frameworks"; VENV=REPO+"/venv/bin/python3"
if not os.environ.get("_FIM"):
    os.environ.update(DYLD_FRAMEWORK_PATH=FW,FXPLUG_USE_PLUGINKIT="1",_FIM="1",PYTHONPATH=REPO); os.chdir(REPO); os.execv(VENV,[VENV,"-u",str(__file__)])
sys.path.insert(0,REPO); sys.path.insert(0,REPO+"/tools")
import numpy as np; from PIL import Image
import ozengine
from fct.faithful import synth,mutate,render as R; from fct import config
W,H=1920,1080; cx,cy=W/2,H/2
# A smooth radial SINE so we can phase-track (no edge merging). period 80px.
yy,xx=np.mgrid[0:H,0:W]; r=np.hypot(xx-cx,yy-cy)
val=(np.sin(r/80*2*np.pi)*0.5+0.5)*255
img=np.stack([val,val,val],-1).astype(np.uint8)
Image.fromarray(img).save("/tmp/rsine.png")
tb=synth.build("PAEFisheye","/tmp/fe_host.motr",False)
i=tb.find('pluginName="PAEFisheye"'); lt=tb.rfind('<filter',0,i); e=tb.find('</filter>',i)
tb=tb[:lt]+tb[lt:e].replace('<enabled>0</enabled>','',1)+tb[e:]
def setp(text,p,v):
    ch,_=mutate._collect_changes(text,"PAEFisheye",lambda n,o,_p=p:('%.6f'%v) if n==_p else None); return mutate.apply(text,"PAEFisheye",ch)
rp=config.slug_motr('Movements__Fall'); tmp=tempfile.mkdtemp()
def rg(text,tag,amt,rad=1.0):
    t=setp(setp(text,'amount',amt),'radius',rad); mp=R.make_mirror(rp,t,os.path.join(tmp,tag))
    doc=ozengine.load_doc(mp); out=os.path.join(tmp,tag+".png"); ozengine.render_frame(doc,"/tmp/rsine.png","/tmp/rsine.png",0.5,out)
    return np.asarray(Image.open(out).convert("RGB"),float)[:,:,0]
# For each output radius Rout along +x, the value = source sine at Rsrc => Rsrc = (asin/period).
# Simpler: the phase of the sine at output radius R gives 2pi*Rsrc/80. Unwrap along +x row.
def rsrc_profile(im):
    row=im[int(cy),int(cx):]  # from centre out
    v=(row/255.0)*2-1; v=np.clip(v,-1,1)
    # phase from value alone is ambiguous; instead COUNT sine cycles by peak detection
    # peaks of source sine are at Rsrc = 80*(k+0.25). find output-radius peaks:
    from scipy.signal import find_peaks
    pk,_=find_peaks(row,height=180,distance=8)
    return pk  # output radii where a source peak (Rsrc=80*k+20) lands
base=rg(tb,"b",0)
pk0=rsrc_profile(base)
print("identity peaks (px):", pk0[:12], "-> spacing", np.diff(pk0[:6]))
for amt in [10,20,30]:
    pk=rsrc_profile(rg(tb,f"a{amt}",amt))
    n=min(len(pk),len(pk0),10)
    # source radius of k-th peak = pk0[k] (identity maps 1:1). output radius = pk[k].
    Rsrc=pk0[:n].astype(float); Rout=pk[:n].astype(float)
    m=(Rout>40)&(Rsrc>40)
    if m.sum()>=4:
        A=np.vstack([np.log(Rout[m]),np.ones(m.sum())]).T
        exp,c=np.linalg.lstsq(A,np.log(Rsrc[m]),rcond=None)[0]
        print(f"Amount={amt}: Rsrc=Rout^{exp:.3f}*{np.exp(c):.3g}  (norm540: coeff*540^(1-exp)={np.exp(c)*540**(exp-1):.3f})")
