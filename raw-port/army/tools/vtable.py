#!/usr/bin/env python3
"""vtable.py <FW> <Class> [maxslot=0x120]  — dump a C++ class vtable slot -> method.

Finds `vtable for <Class>` (nm), reads its function-pointer array starting at symbol+0x10 (the
installed pointer that ctors store into the object), and resolves each slot via chained-fixup decode
(low-32 of the raw qword = target vmaddr) to the nearest symbol. This is exactly how *0x18/*0x60/
*0x68 on OZLinearInterpolator were identified as interpolate/uForCurveValue/easeTime.
"""
import subprocess, sys, struct, os, functools
FWP="/Applications/Final Cut Pro.app/Contents/Frameworks/{fw}.framework/Versions/A/{fw}"
def thin(fw):
    p=f"/tmp/{fw}.x86_64"
    if not os.path.exists(p): subprocess.run(["lipo",FWP.format(fw=fw),"-thin","x86_64","-output",p],capture_output=True)
    return p
@functools.lru_cache(None)
def symmap(fw):
    out=subprocess.run(["nm","-arch","x86_64","-n",FWP.format(fw=fw)],capture_output=True,text=True).stdout
    mang=[]
    for l in out.splitlines():
        p=l.split()
        if len(p)>=3 and p[1] in ("T","t","S","s","W"): mang.append((int(p[0],16),p[2]))
    dem=subprocess.run(["c++filt"],input="\n".join(m for _,m in mang),capture_output=True,text=True).stdout.splitlines()
    return sorted((a,d) for (a,_),d in zip(mang,dem))
def nearest(fw,addr,codeonly=True):
    last=None
    for a,d in symmap(fw):
        if a<=addr: last=(a,d)
        else: break
    return f"{last[1]}" if last else "?"
def vtable_addr(fw,cls):
    for a,d in symmap(fw):
        if d==f"vtable for {cls}": return a
    return None
def main():
    fw,cls=sys.argv[1],sys.argv[2]
    maxslot=int(sys.argv[3],16) if len(sys.argv)>3 else 0x120
    vt=vtable_addr(fw,cls)
    if not vt: print(f"no 'vtable for {cls}' in {fw}"); return
    base=vt+0x10
    data=open(thin(fw),"rb").read()
    print(f"# {cls} vtable@0x{vt:x}  installed-ptr 0x{base:x}  ({fw})")
    for off in range(0,maxslot,8):
        raw=struct.unpack_from("<Q",data,base+off)[0]
        tgt=raw & 0xFFFFFFFF
        nm=nearest(fw,tgt)
        if nm.startswith(cls.split("::")[0]) or "Interpolator" in nm or "OZ" in nm or "PC" in nm:
            print(f"  *0x{off:02x} -> 0x{tgt:x}  {nm}")
if __name__=="__main__": main()
