import numpy as np
# Faithful register-level sim of HgcHSVAdjust. Vectors are float4 (x,y,z,w).
c0=np.array([0.9999899864,9.999999747e-06,9.999999975e-07,0.0])
c1=np.array([0.001000000047,0.0,2.0,4.0])
c2=np.array([0.1666666716,6.0,0.0,0.0])
c3=np.array([0.0,1.0,2.0,3.0])
c4=np.array([1.0,-1.0,0.0,0.0])
def clamp01(x): return np.clip(x,0.0,1.0)
def sel(a,b,cond):  # select(a,b,cond) = cond ? b : a
    return np.where(cond,b,a)

def sim(rgb, hp0):  # hp0 = (hueoff, satmul, valmul)
    r0=np.array([rgb[0],rgb[1],rgb[2],1.0],float)
    w=r0[3]
    # r1.xyz = fmax over channels, then fmax c0.x  => V (max, floored at ~1.0? c0.x=0.99999)
    m=max(r0[0],r0[1]); m=max(m,r0[2]); m=max(m,c0[0])
    r1=np.array([m,m,m,0.0])
    r1[0]=r1[0]+c0[1]        # +eps
    r2=np.zeros(4)
    r2[0]=1.0/r1[0]          # 1/V
    r2[1]=r2[0]; r2[2]=r2[0] # r2.yz = r2.xx
    # r0.xyz = r0.xyz * r2.xyz   (normalize by V)
    r0[0]*=r2[0]; r0[1]*=r2[1]; r0[2]*=r2[2]
    # r2.xyz = fmax(r0.xxx,r0.yyy); fmax(r2,r0.zzz)  -> OVERWRITES r2.x,y,z = max(norm)=~1
    mm=max(r0[0],r0[1]); mm=max(mm,r0[2])
    r2[0]=mm; r2[1]=mm; r2[2]=mm
    # r3.x = min(...)
    mn=min(r0[0],r0[1]); mn=min(mn,r0[2])
    r3=np.zeros(4); r3[0]=r2[0]-mn        # chroma = max-min
    # r4.xyz = float3(r0>=r2)  (which channel is max)
    r4=np.array([1.0 if r0[0]>=r2[0] else 0.0,
                 1.0 if r0[1]>=r2[1] else 0.0,
                 1.0 if r0[2]>=r2[2] else 0.0, 0.0])
    r4[1]=clamp01(r4[1]-r4[0]); r4[2]=clamp01(r4[2]-r4[0])
    r4[2]=clamp01(r4[2]-r4[1])
    # r2.x = r2.x + eps ; r2.x = r3.x / r2.x   (saturation = chroma/max)
    r2[0]=r2[0]+c0[1]
    r2[0]=r3[0]/r2[0]
    # r0.xyz = r0.yzx - r0.zxy
    r0=np.array([r0[1]-r0[2], r0[2]-r0[0], r0[0]-r0[1], r0[3]])
    # r5.xyz = float3(r3.xxx>=c0.zzz) ; r5 = c0.www - r5   (c0.z=1e-6, c0.w=0) -> r5 = -(chroma>=eps)
    r5=np.array([1.0 if r3[0]>=c0[2] else 0.0]*3+[0.0])
    r5=np.array([c0[3]-r5[0],c0[3]-r5[1],c0[3]-r5[2],0.0])   # 0 - {0,1}
    # r3.x = r3.x + c1.x  (chroma + 0.001)
    r3[0]=r3[0]+c1[0]
    # r0.xyz = r0.xyz / r3.xxx
    r0[0]/=r3[0]; r0[1]/=r3[0]; r0[2]/=r3[0]
    # r0.xyz = select(c0.www, r0.xyz, r5.xyz<0)  => where chroma>=eps (r5<0) keep r0 else 0
    r0=np.array([sel(c0[3],r0[0],r5[0]<0), sel(c0[3],r0[1],r5[1]<0), sel(c0[3],r0[2],r5[2]<0), r0[3]])
    # r0.xyz = r0.xyz + c1.yzw  (+0,+2,+4)
    r0[0]+=c1[1]; r0[1]+=c1[2]; r0[2]+=c1[3]
    # r0 = dot(r0.xyz, r4.xyz)  -> hue6 base for the winning sextant
    d=r0[0]*r4[0]+r0[1]*r4[1]+r0[2]*r4[2]
    r0=np.array([d,d,d,d])
    # r0 = r0*c2.x + hp0.x   (hue6*(1/6) + hueoff)
    r0=r0*c2[0]+hp0[0]
    # r2.xy = clamp(r2.xy * hp0.yz)  -> r2.x=sat*satmul, r2.y=? r2.y was max(norm)~1, *valmul
    r2[0]=clamp01(r2[0]*hp0[1]); r2[1]=clamp01(r2[1]*hp0[2])
    # r0 = fract(r0)
    r0=r0-np.floor(r0)
    # r0 = r0*c2.y  (*6)
    r0=r0*c2[1]
    # r3.xyz = fract(r0.xyz)
    r3=np.array([r0[0]-np.floor(r0[0]),r0[1]-np.floor(r0[1]),r0[2]-np.floor(r0[2]),r3[3]])
    # r0 = floor(r0)
    r0=np.floor(r0)
    # r5 = clamp(r0 - c3)   (r0-{0,1,2,3})
    r5=clamp01(r0-c3)
    # r0.xyz = clamp(r0.xyz - c1.www)  (r0 - 4)
    r0=np.array([clamp01(r0[0]-c1[3]),clamp01(r0[1]-c1[3]),clamp01(r0[2]-c1[3]),r0[3]])
    # r4.xyz = -c3.xyy * r2.xxx  (=-{0,1,1}*sat) ; r4.z = r4.z*r3.z
    r4=np.array([-c3[0]*r2[0], -c3[1]*r2[0], -c3[1]*r2[0], 0.0]); r4[2]=r4[2]*r3[2]
    # r6.xyz = c4.xyz*r2.xxx (={1,-1,0}*sat) ; r6.x = r6.x*r3.x + r6.y
    r6=np.array([c4[0]*r2[0],c4[1]*r2[0],c4[2]*r2[0],0.0]); r6[0]=r6[0]*r3[0]+r6[1]
    # r0.xyz = select(r6, r4, -r0<0)  => where r0>0 (i.e. floor>=... ) pick r4 else r6
    r0=np.array([sel(r6[0],r4[0],-r0[0]<0), sel(r6[1],r4[1],-r0[1]<0), sel(r6[2],r4[2],-r0[2]<0), r0[3]])
    # r4.xyz = c4.yyz*r2.xxx (={-1,-1,0}*sat) ; r4.y=r4.y*r3.y
    r4=np.array([c4[1]*r2[0],c4[1]*r2[0],c4[2]*r2[0],0.0]); r4[1]=r4[1]*r3[1]
    # r0 = select(r4,r0,-r5.www<0)  (r5.w unset=0 -> -0<0 false -> pick r4)
    cond=-r5[3]<0
    r0=np.array([sel(r4[0],r0[0],cond), sel(r4[1],r0[1],cond), sel(r4[2],r0[2],cond), r0[3]])
    # r6.xyz = c4.yzx*r2.xxx ({-1,0,1}*sat) ; r6.z=r6.z*r3.z+r6.x
    r6=np.array([c4[1]*r2[0],c4[2]*r2[0],c4[0]*r2[0],0.0]); r6[2]=r6[2]*r3[2]+r6[0]
    r0=np.array([sel(r6[0],r0[0],-r5[2]<0), sel(r6[1],r0[1],-r5[2]<0), sel(r6[2],r0[2],-r5[2]<0), r0[3]])
    # r4.xyz=c4.yzy*r2 ({-1,0,-1}*sat); r4.x=r4.x*r3.x
    r4=np.array([c4[1]*r2[0],c4[2]*r2[0],c4[1]*r2[0],0.0]); r4[0]=r4[0]*r3[0]
    r0=np.array([sel(r4[0],r0[0],-r5[1]<0), sel(r4[1],r0[1],-r5[1]<0), sel(r4[2],r0[2],-r5[1]<0), r0[3]])
    # r6.xyz=c4.zxy*r2 ({0,1,-1}*sat); r6.y=r6.y*r3.y+r6.z
    r6=np.array([c4[2]*r2[0],c4[0]*r2[0],c4[1]*r2[0],0.0]); r6[1]=r6[1]*r3[1]+r6[2]
    r0=np.array([sel(r6[0],r0[0],-r5[0]<0), sel(r6[1],r0[1],-r5[0]<0), sel(r6[2],r0[2],-r5[0]<0), r0[3]])
    # r0.xyz = r0.xyz*r2.yyy + r2.yyy   (*V' + V')  where r2.y = valmul-scaled max
    r0=np.array([r0[0]*r2[1]+r2[1], r0[1]*r2[1]+r2[1], r0[2]*r2[1]+r2[1], r0[3]])
    # output.xyz = r0.xyz * r1.xyz  (*V)
    out=np.array([r0[0]*r1[0], r0[1]*r1[0], r0[2]*r1[0]])
    return np.clip(out,0,1)

import json
r=json.load(open('/tmp/hue_clamped.json'))['results']
data=[]
for x in r:
    tag=x['tag']; rgbs,a=tag.split('|'); data.append((np.array(eval(rgbs),float)/255,float(a),np.array(x['center'],float)))
# identity check
print("identity (hue=0,sat*1,val*1):")
for rgb,a,fcp in data[:3]:
    if a!=0: continue
    print(f"  in={(rgb*255).round(0)} -> sim={(sim(rgb,(0.0,1.0,1.0))*255).round(0)} fcp={fcp.round(0)}")
# sweep hueoff mapping
for label,fo in [("p/2pi",lambda p:p/(2*np.pi))]:
    worst=0; rows=[]
    for rgb,a,fcp in data:
        if a==0:continue
        pred=sim(rgb,(fo(a),1.0,1.0))*255
        dr=np.abs(pred-fcp).max(); worst=max(worst,dr); rows.append((dr,rgb*255,a,pred,fcp))
    print(f"hueoff={label}: worst={worst:.0f}")
    for dr,rgb,a,pred,fcp in sorted(rows,reverse=True)[:4]:
        print(f"   dR={dr:.0f} in={rgb.round(0)} a={a*180/np.pi:.0f} pred={pred.round(0)} fcp={fcp.round(0)}")
