
import json, numpy as np

data = json.load(open('/tmp/hue_multiinput.json'))
# constants
c0=np.array([0.9999899864,9.999999747e-06,9.999999975e-07,0.0])
c1=np.array([0.001,0.0,2.0,4.0])
c2=np.array([0.1666666716,6.0,0.0,0.0])
c3=np.array([0.0,1.0,2.0,3.0])
c4=np.array([1.0,-1.0,0.0,0.0])

def clamp01(x): return np.clip(x,0.0,1.0)
def SEL(a,b,cond):  # metal select(a,b,c) = c ? b : a
    return np.where(cond, b, a)

def sim(rgb, hueoff, satmul, valmul):
    # registers as length-4 arrays
    color0=np.array([rgb[0]/255.,rgb[1]/255.,rgb[2]/255.,1.0])
    r0=color0.copy()
    # r1.xyz = fmax(r0.xxx,r0.yyy); fmax(r1,r0.zzz); fmax(r1,c0.xxx)
    m=max(r0[0],r0[1]); m=max(m,r0[2]); m=max(m,c0[0])
    r1=np.array([m,m,m,0.0])
    # r1.x = r1.x + c0.y
    r1[0]=r1[0]+c0[1]
    # r2.x = 1/r1.x ; r2.yz = r2.xx
    inv=1.0/r1[0]
    r2=np.array([inv,inv,inv,0.0])
    # r0.xyz = r0.xyz*r2.xyz  (normalize by V)
    r0=np.array([r0[0]*r2[0],r0[1]*r2[1],r0[2]*r2[2],r0[3]])
    # r2.xyz = fmax(r0.xxx,r0.yyy); fmax(r2,r0.zzz)  -> r2.x=max normalized
    mm=max(r0[0],r0[1]); mm=max(mm,r0[2])
    r2[0]=mm; r2[1]=mm; r2[2]=mm
    # r3.x = min(r0.x,r0.y); min(...,r0.z); r3.x = r2.x - r3.x  (chroma)
    mn=min(r0[0],r0[1]); mn=min(mn,r0[2])
    r3=np.zeros(4); r3[0]=r2[0]-mn
    # r4.xyz = float3(r0.xyz >= r2.xyz)
    r4=np.array([1.0 if r0[i]>=r2[i] else 0.0 for i in range(3)]+[0.0])
    # r4.yz = clamp(r4.yz - r4.xx)
    r4[1]=clamp01(r4[1]-r4[0]); r4[2]=clamp01(r4[2]-r4[0])
    # r4.z = clamp(r4.z - r4.y)
    r4[2]=clamp01(r4[2]-r4[1])
    # r2.x = r2.x + c0.y ; r2.x = r3.x / r2.x   (saturation ratio)
    r2[0]=r2[0]+c0[1]
    r2[0]=r3[0]/r2[0]
    # r0.xyz = r0.yzx - r0.zxy
    r0=np.array([r0[1]-r0[2], r0[2]-r0[0], r0[0]-r0[1], r0[3]])
    # r5.xyz = float3(r3.xxx >= c0.zzz) ; r5.xyz = c0.www - r5.xyz
    r5=np.array([1.0 if r3[0]>=c0[2] else 0.0]*3+[0.0])
    r5=np.array([c0[3]-r5[0],c0[3]-r5[1],c0[3]-r5[2],0.0])
    # r3.x = r3.x + c1.x
    r3[0]=r3[0]+c1[0]
    # r0.xyz = r0.xyz / r3.xxx
    r0=np.array([r0[0]/r3[0],r0[1]/r3[0],r0[2]/r3[0],r0[3]])
    # r0.xyz = select(c0.www, r0.xyz, r5.xyz < 0)   (c0.w=0)
    r0=np.array([SEL(c0[3],r0[i],r5[i]<0.0) for i in range(3)]+[r0[3]])
    # r0.xyz = r0.xyz + c1.yzw   (0,2,4)
    r0=np.array([r0[0]+c1[1],r0[1]+c1[2],r0[2]+c1[3],r0[3]])
    # r0 = float4(dot(r0.xyz, r4.xyz))
    d=r0[0]*r4[0]+r0[1]*r4[1]+r0[2]*r4[2]
    r0=np.array([d,d,d,d])
    # r0 = r0*c2.xxxx + hg_Params[0].xxxx   (hueoff)
    r0=r0*c2[0]+hueoff
    # r2.xy = clamp(r2.xy*hg_Params[0].yz)   (sat*satmul, (1/V)*valmul)
    r2[0]=clamp01(r2[0]*satmul); r2[1]=clamp01(r2[1]*valmul)
    # r0 = fract(r0)
    r0=r0-np.floor(r0)
    # r0 = r0*c2.yyyy   (*6)
    r0=r0*c2[1]
    # r3.xyz = fract(r0.xyz)
    r3=np.array([r0[0]-np.floor(r0[0]),r0[1]-np.floor(r0[1]),r0[2]-np.floor(r0[2]),r3[3]])
    # r0 = floor(r0)
    r0=np.floor(r0)
    # r5 = clamp(r0 - c3)   (r0 - (0,1,2,3))
    r5=clamp01(r0-c3)
    # r0.xyz = clamp(r0.xyz - c1.www)  (r0 - 4)
    r0=np.array([clamp01(r0[0]-c1[3]),clamp01(r0[1]-c1[3]),clamp01(r0[2]-c1[3]),r0[3]])
    # r4.xyz = -c3.xyy * r2.xxx   ; r4.z = r4.z * r3.z
    r4=np.array([-c3[0]*r2[0], -c3[1]*r2[0], -c3[1]*r2[0], 0.0])
    r4[2]=r4[2]*r3[2]
    # r6.xyz = c4.xyz * r2.xxx ; r6.x = r6.x*r3.x + r6.y
    r6=np.array([c4[0]*r2[0], c4[1]*r2[0], c4[2]*r2[0], 0.0])
    r6[0]=r6[0]*r3[0]+r6[1]
    # r0.xyz = select(r6.xyz, r4.xyz, -r0.xyz < 0)
    r0=np.array([SEL(r6[i],r4[i], (-r0[i])<0.0) for i in range(3)]+[r0[3]])
    # r4.xyz = c4.yyz*r2.xxx ; r4.y=r4.y*r3.y
    r4=np.array([c4[1]*r2[0],c4[1]*r2[0],c4[2]*r2[0],0.0]); r4[1]=r4[1]*r3[1]
    # r0.xyz = select(r4.xyz, r0.xyz, -r5.www < 0)  -> r5.w
    r0=np.array([SEL(r4[i],r0[i], (-r5[3])<0.0) for i in range(3)]+[r0[3]])
    # r6.xyz = c4.yzx*r2.xxx ; r6.z=r6.z*r3.z + r6.x
    r6=np.array([c4[1]*r2[0],c4[2]*r2[0],c4[0]*r2[0],0.0]); r6[2]=r6[2]*r3[2]+r6[0]
    # r0.xyz = select(r6.xyz, r0.xyz, -r5.zzz<0)
    r0=np.array([SEL(r6[i],r0[i], (-r5[2])<0.0) for i in range(3)]+[r0[3]])
    # r4.xyz=c4.yzy*r2.xxx ; r4.x=r4.x*r3.x
    r4=np.array([c4[1]*r2[0],c4[2]*r2[0],c4[1]*r2[0],0.0]); r4[0]=r4[0]*r3[0]
    # r0.xyz=select(r4.xyz,r0.xyz,-r5.yyy<0)
    r0=np.array([SEL(r4[i],r0[i], (-r5[1])<0.0) for i in range(3)]+[r0[3]])
    # r6.xyz=c4.zxy*r2.xxx ; r6.y=r6.y*r3.y+r6.z
    r6=np.array([c4[2]*r2[0],c4[0]*r2[0],c4[1]*r2[0],0.0]); r6[1]=r6[1]*r3[1]+r6[2]
    # r0.xyz=select(r6.xyz,r0.xyz,-r5.xxx<0)
    r0=np.array([SEL(r6[i],r0[i], (-r5[0])<0.0) for i in range(3)]+[r0[3]])
    # r0.xyz = r0.xyz*r2.yyy + r2.yyy
    r0=np.array([r0[0]*r2[1]+r2[1], r0[1]*r2[1]+r2[1], r0[2]*r2[1]+r2[1], r0[3]])
    # output.color0.xyz = r0.xyz * r1.xyz  (V)
    out=np.array([r0[0]*r1[0], r0[1]*r1[0], r0[2]*r1[0]])
    return np.clip(out,0,1)*255

# test offset mappings
for lbl,fo in [("off=p/2pi",lambda p:p/(2*np.pi)),("off=p",lambda p:p),("off=-p/2pi",lambda p:-p/(2*np.pi))]:
    worst=0; rows=[]
    for key,fcp in data.items():
        rgb=eval(key.split('|')[0]); p=float(key.split('|')[1]); fcp=np.array(fcp)
        pred=sim(rgb,fo(p),1.0,1.0)
        dr=np.abs(pred-fcp).max(); worst=max(worst,dr); rows.append((dr,rgb,p,pred,fcp))
    print(f"{lbl}: worst dR={worst:.1f}")
    if lbl=="off=p/2pi":
        for dr,rgb,p,pred,fcp in sorted(rows,reverse=True)[:3]:
            print(f"    dR={dr:.0f} in={rgb} p={p} pred={[round(x,0) for x in pred]} fcp={[round(x,0) for x in fcp]}")
