#!/usr/bin/env python3
"""resolve.py — resolve call targets / vtable slots / data pointers in an FCP framework.

The single most-reused RE capability for the army. Modes:
  resolve.py <FW> sym  <addr>            symbol containing/at an address (nm -n nearest)
  resolve.py <FW> stub <addr>            __stubs entry -> imported name (otool -Iv)
  resolve.py <FW> vtable <Class> [slots] dump vtable: installed-ptr (from ctor) -> slot->method.
                                         Uses dyld_info -fixups; low-32 of the fixup qword = target.
  resolve.py <FW> const <addr>           read the 8-byte double at a RIP-relative data addr.
  resolve.py <FW> ripconst <instr_addr> <disp> [len]
                                         resolve a RIP-relative operand in ONE shot. Give the
                                         address of the instruction that HAS the `disp(%rip)`
                                         operand and the displacement; ripconst computes the target
                                         VA = instr_addr + instr_len + disp (x86 RIP is relative to
                                         the END of the instruction) and decodes the datum as f32,
                                         f64, f32x4, f64x2, u32/i32, u64/i64 so you don't hand-derive
                                         it. `len` = instruction byte length (default 7 for the
                                         common `movsd/movss/movaps xmm, m(%rip)`; movss/movaps are
                                         often 8, movsd 8, leaq 7 — pass it if unsure). Kills the
                                         pc+disp + struct.unpack dance every shader/const worker does.

Examples that this reproduces (interpolator decode):
  vtable OZLinearInterpolator -> *0x18 interpolate, *0x60 uForCurveValue, *0x68 easeTime.
  vtable OZDynamicVertex     -> *0x18 getValueV, *0x88 isEnabled.
  ripconst Helium 0x30de0b 0x5c1dd5   -> target VA + f32/f64/f32x4 decode of a ctor const-fill.
"""
import subprocess, sys, struct, os, re, functools

FW_BIN = "/Applications/Final Cut Pro.app/Contents/Frameworks/{fw}.framework/Versions/A/{fw}"
def thin(fw):
    p = f"/tmp/{fw}.x86_64"
    if not os.path.exists(p):
        subprocess.run(["lipo",FW_BIN.format(fw=fw),"-thin","x86_64","-output",p],
                       capture_output=True)
    return p

@functools.lru_cache(None)
def symmap(fw):
    out = subprocess.run(["nm","-arch","x86_64","-n",FW_BIN.format(fw=fw)],
                         capture_output=True,text=True).stdout
    syms=[]
    for l in out.splitlines():
        p=l.split()
        if len(p)>=3 and p[1] in ("T","t","W","S","s") and p[2].startswith("__Z"):
            syms.append((int(p[0],16),p[2]))
    syms.sort()
    dem = subprocess.run(["c++filt"], input="\n".join(m for _,m in syms),
                         capture_output=True,text=True).stdout.splitlines()
    return [(a,m,d) for (a,m),d in zip(syms,dem)]

def nearest(fw, addr):
    last=None
    for a,m,d in symmap(fw):
        if a<=addr: last=(a,d)
        else: break
    return f"{last[1]} (+0x{addr-last[0]:x})" if last else "?"

def find_class_vtable(fw, cls):
    # __ZTVN..E for OZFoo is "vtable for OZFoo"
    for a,m,d in symmap(fw):
        if d==f"vtable for {cls}": return a
    return None

def ctor_installed_ptr(fw, cls):
    # find <Class>C1Ev/C2Ev, disasm, read the "leaq ...(%rip), %rax ## 0xVT" it stores into (%rbx)/(this)
    for a,m,d in symmap(fw):
        if d.startswith(f"{cls}::{cls.split('::')[-1]}()") or (f"{cls}::" in d and d.endswith("()") and cls.split('::')[-1] in d):
            pass
    return None  # fallback: vtable-sym + 0x10

def read_fixups(fw):
    out = subprocess.run(["dyld_info","-fixups",FW_BIN.format(fw=fw)],
                         capture_output=True,text=True).stdout
    tbl={}
    for l in out.splitlines():
        if "__const" in l:
            p=l.split()
            try:
                a=int(p[2],16)
                if "rebase" in l: tbl[a]=int(p[4],16)
            except: pass
    return tbl, out

def main():
    fw=sys.argv[1]; mode=sys.argv[2]
    if mode=="sym":
        print(nearest(fw,int(sys.argv[3],16)))
    elif mode=="stub":
        addr=sys.argv[3].lower().lstrip("0x")
        out=subprocess.run(["otool","-Iv",thin(fw)],capture_output=True,text=True).stdout
        for l in out.splitlines():
            if addr in l.lower(): print(l.strip())
    elif mode=="const":
        data=open(thin(fw),"rb").read()
        va=int(sys.argv[3],16)
        print(f"double={struct.unpack_from('<d',data,va)[0]}  "
              f"u64=0x{struct.unpack_from('<Q',data,va)[0]:x}")
    elif mode=="ripconst":
        # resolve a RIP-relative operand in ONE shot: target VA = instr_addr + instr_len + disp,
        # then decode the datum every which way so the worker never hand-derives pc+disp or unpacks.
        # x86 RIP is relative to the END of the instruction, hence + instr_len.
        instr=int(sys.argv[3],16); disp=int(sys.argv[4],16)
        ilen=int(sys.argv[5],16) if len(sys.argv)>5 else 7
        # disp is a signed 32-bit displacement in the encoding — honor the sign.
        if disp & 0x80000000: disp -= 0x100000000
        va=instr+ilen+disp
        data=open(thin(fw),"rb").read()
        if va<0 or va+16>len(data):
            print(f"target VA 0x{va:x} out of range (file 0x{len(data):x}) — check instr_len "
                  f"(passed 0x{ilen:x}; movsd/movss/movaps are often 8, leaq 7)"); return
        f32=struct.unpack_from('<f',data,va)[0]
        f64=struct.unpack_from('<d',data,va)[0]
        f32x4=struct.unpack_from('<4f',data,va)
        f64x2=struct.unpack_from('<2d',data,va)
        u32=struct.unpack_from('<I',data,va)[0]; i32=struct.unpack_from('<i',data,va)[0]
        u64=struct.unpack_from('<Q',data,va)[0]; i64=struct.unpack_from('<q',data,va)[0]
        print(f"# instr@0x{instr:x} + len 0x{ilen:x} + disp {'-0x%x'%(-disp) if disp<0 else '0x%x'%disp}"
              f"  ->  target VA 0x{va:x}")
        near=nearest(fw,va)
        if near and near!="?": print(f"#   (in {near})")
        print(f"  f32      = {f32!r}")
        print(f"  f64      = {f64!r}")
        print(f"  f32x4    = ({f32x4[0]!r}, {f32x4[1]!r}, {f32x4[2]!r}, {f32x4[3]!r})")
        print(f"  f64x2    = ({f64x2[0]!r}, {f64x2[1]!r})")
        print(f"  u32/i32  = {u32} / {i32}   (0x{u32:x})")
        print(f"  u64/i64  = {u64} / {i64}   (0x{u64:x})")
    elif mode=="vtable":
        cls=sys.argv[3]
        vt=find_class_vtable(fw,cls)
        if not vt: print(f"no vtable for {cls}"); return
        base=vt+0x10  # fn pointers start after RTTI/offset-to-top (installed ptr = vtable+0x10)
        data=open(thin(fw),"rb").read()
        slots = [int(x,16) for x in sys.argv[4:]] if len(sys.argv)>4 else range(0,0x100,8)
        print(f"# {cls} vtable @0x{vt:x}; installed ptr 0x{base:x}")
        for off in slots:
            raw=struct.unpack_from("<Q",data,base+off)[0]
            tgt=raw & 0xFFFFFFFF
            print(f"  *0x{off:02x} -> 0x{tgt:x}  {nearest(fw,tgt)}")
    else:
        print(__doc__)

if __name__=="__main__": main()
