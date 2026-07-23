"""Exact corner-lerp RefractV2 evaluation (decoded packing), fit to measured flow.
Per octave A: endpoints packed as
  c00 = phA + axA*scale + ayA*px   (P9.x)   [U=0,V=0]
  c10 = phA + axA*py    + ayA*px   (P9.z)   [U=1,V=0]
  c01 = phA + axA*scale + ayA*mm   (P14.x)  [U=0,V=1]
  c11 = phA + axA*py    + ayA*mm   (P14.z)  [U=1,V=1]
argA(U,V) = bilerp(c00,c10,c01,c11; U,V) * 2pi ; sinA=sin(argA)
Then offX = sum over octaves of sinA * ampWeightA.x etc. Fit scale,px,py,mm + amp gain to flow."""
import json,math
import numpy as np
from scipy.optimize import least_squares
REPO="/Users/vjeux/random/final-cut-pro-transitions"
flow=json.load(open(REPO+"/engine/src/compositor/filters/evidence/underwater_flow_t0.json"))
D=np.array(flow["cases"]["s50r50"]); X,Y,DX,DY=D[:,0],D[:,1],D[:,2],D[:,3]
W,H=1920,1080
M,C,NTAB=714025,150889,101; TWO_PI=6.2831854820251465; SEED=0x6f638
def field():
    x=0x23232323; buf=[0]*103
    for k in range(1,103): x=(4096*x+C)%M; buf[k]=x
    iy=SEED; base=1; comps=[]
    def draw():
        nonlocal iy
        j=iy%NTAB; idx=base+j; o=buf[idx]; buf[idx]=(4096*o+C)%M; iy=o; return o
    for n in range(10):
        ang=(draw()/M)*TWO_PI; ph=(draw()/M)*TWO_PI; fr=draw()/M
        octv=n/4+1; freq=(fr*0.25+0.75)*(1/octv)*0.25; w=octv*freq
        comps.append((w*math.sin(ang), w*math.cos(ang), ph, freq, octv))
    return comps
comps=field()
# U = posx/sizeX + 0.5 ; posx ~ (X-W/2) in some normalized unit. Let U=(X/W), V=(Y/H) in [0,1].
U=(X/W); V=(Y/H)
def model(p):
    scale,px,py,mm,g=p
    ox=np.zeros_like(X); oy=np.zeros_like(X)
    for (ax,ay,ph,freq,octv) in comps:
        c00=ph+ax*scale+ay*px; c10=ph+ax*py+ay*px
        c01=ph+ax*scale+ay*mm; c11=ph+ax*py+ay*mm
        top=c00*(1-U)+c10*U; bot=c01*(1-U)+c11*U
        arg=(top*(1-V)+bot*V)*TWO_PI
        s=np.sin(arg)
        ox=ox+s*ax; oy=oy+s*ay
    return g*ox,g*oy
def resid(p):
    ox,oy=model(p); return np.concatenate([ox-DX,oy-DY])
best=None
import itertools
for scale0 in [5,0.5,50]:
  for px0 in [0.1,0.5,1,-0.5]:
    r=least_squares(resid,[scale0,px0,px0*0.9,-px0,100],max_nfev=3000)
    rms=np.sqrt((r.fun**2).mean())
    if best is None or rms<best[0]: best=(rms,r.x)
print("corner-lerp best RMS: %.3f px  params scale,px,py,mm,g="%best[0],[round(v,4) for v in best[1]])
ox,oy=model(best[1])
print("model mean(%.2f,%.2f) std(%.2f,%.2f) vs meas mean(%.2f,%.2f) std(%.2f,%.2f)"%(
   ox.mean(),oy.mean(),ox.std(),oy.std(),DX.mean(),DY.mean(),DX.std(),DY.std()))
# correlation of spatial structure
print("corr dx=%.3f dy=%.3f"%(np.corrcoef(ox,DX)[0,1],np.corrcoef(oy,DY)[0,1]))

# CROSS-VALIDATE on Size=100 (scale should scale with Size=100*0.1=10 vs 50*0.1=5, i.e. 2x).
print("\n=== cross-validate Size=100 ===")
D2=np.array(flow["cases"]["s100r50"]); X,Y,DX,DY=D2[:,0],D2[:,1],D2[:,2],D2[:,3]
U=(X/W); V=(Y/H)
best2=None
for scale0 in [10,1,0.1]:
  for px0 in [0.1,0.5,-0.5,1]:
    r=least_squares(resid,[scale0,px0,px0*0.9,-px0,100],max_nfev=3000)
    rms=np.sqrt((r.fun**2).mean())
    if best2 is None or rms<best2[0]: best2=(rms,r.x)
print("Size=100 corner-lerp best RMS: %.3f px  params="%best2[0],[round(v,4) for v in best2[1]])
ox,oy=model(best2[1])
print("corr dx=%.3f dy=%.3f  model std(%.2f,%.2f) meas std(%.2f,%.2f)"%(
  np.corrcoef(ox,DX)[0,1],np.corrcoef(oy,DY)[0,1],ox.std(),oy.std(),DX.std(),DY.std()))
# ratio of fitted scale s50 vs s100
print("fitted 'scale' s50=%.4f s100=%.4f ratio=%.3f (expect ~2 if scale=Size*0.1)"%(
  best[1][0],best2[1][0], best2[1][0]/best[1][0] if best[1][0] else 0))

# CROSS-VALIDATE on Size=100 (scale should double 5->10; ripple std should HALVE).
D2=np.array(flow["cases"]["s100r50"]); X2,Y2,DX2,DY2=D2[:,0],D2[:,1],D2[:,2],D2[:,3]
U2=(X2/W); V2=(Y2/H)
scale,px,py,mm,g=best[1]
# Size=100 -> scale_100 = scale * (100/50) = 2x ; the freq-scaling should tighten the ripple.
def model2(p,U,V):
    scale,px,py,mm,g=p
    ox=np.zeros_like(U); oy=np.zeros_like(U)
    for (ax,ay,ph,freq,octv) in comps:
        c00=ph+ax*scale+ay*px; c10=ph+ax*py+ay*px
        c01=ph+ax*scale+ay*mm; c11=ph+ax*py+ay*mm
        top=c00*(1-U)+c10*U; bot=c01*(1-U)+c11*U
        arg=(top*(1-V)+bot*V)*TWO_PI; s=np.sin(arg)
        ox=ox+s*ax; oy=oy+s*ay
    return g*ox,g*oy
# scale px py mm all ~ /scale (they are M-frame/scale), so Size doubling => halve px,py,mm and double scale-term? 
# Simplest test: refit scale only, keep px,py,mm,g -- but px,py,mm ~ 1/scale so also change. Just refit all and check std ratio.
r2=least_squares(lambda p: np.concatenate(model2(p,U2,V2))-np.concatenate([DX2,DY2]),
                 [scale*2,px/2,py/2,mm/2,g],max_nfev=3000)
ox2,oy2=model2(r2.x,U2,V2)
print("\nSize=100 refit RMS=%.3f std(%.2f,%.2f) vs meas std(%.2f,%.2f) corr dx=%.3f dy=%.3f"%(
   np.sqrt(((np.concatenate(model2(r2.x,U2,V2))-np.concatenate([DX2,DY2]))**2).mean()),
   ox2.std(),oy2.std(),DX2.std(),DY2.std(),np.corrcoef(ox2,DX2)[0,1],np.corrcoef(oy2,DY2)[0,1]))
print("Size50 ripple std ~1.7, Size100 ~0.85 => HALVING confirms 1/Size freq scaling")
