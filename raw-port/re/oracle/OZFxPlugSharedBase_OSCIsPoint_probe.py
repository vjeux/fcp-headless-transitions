#!/usr/bin/env python3
"""OZFxPlugSharedBase::OSCIsPoint() const @Ozone 0x29bdd0 — live differential.
Local (t) symbol -> called BY ADDRESS at slide+0x29bdd0. Run under arch -x86_64."""
import ctypes, os, platform, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
OZ=FCP+"/Frameworks/Ozone.framework/Versions/A/Ozone"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x29bdd0; EXPECT=bytes.fromhex("554889e50fb687d50000005dc3")
if platform.machine()!="x86_64": sys.exit("REFUSING: "+platform.machine())
def deps(p): return [l.split()[0] for l in subprocess.run(["otool","-L",p],capture_output=True,text=True).stdout.splitlines()[1:] if l.strip()]
def res(n):
    if n.startswith("@rpath/"):
        for r in RP:
            q=os.path.join(r,n[7:])
            if os.path.exists(q): return q
        return None
    return n if os.path.exists(n) else None
seen=set(); failed=[]
def pre(p,d=0):
    if p in seen or d>6: return
    seen.add(p)
    for x in deps(p):
        r=res(x)
        if r and r!=p: pre(r,d+1)
    try: ctypes.CDLL(p,mode=ctypes.RTLD_GLOBAL)
    except OSError as e: failed.append(os.path.basename(p))
pre(OZ); ctypes.CDLL(OZ,mode=ctypes.RTLD_GLOBAL)
print("preloaded %d images, %d failed"%(len(seen),len(failed)))
libc=ctypes.CDLL(None)
libc._dyld_get_image_name.restype=ctypes.c_char_p; libc._dyld_get_image_name.argtypes=[ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype=ctypes.c_void_p; libc._dyld_get_image_vmaddr_slide.argtypes=[ctypes.c_uint32]
slide=None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Ozone"): slide=libc._dyld_get_image_vmaddr_slide(i); break
if slide is None: sys.exit("INCONCLUSIVE: Ozone not loaded")
got=ctypes.string_at(slide+VA,len(EXPECT))
print("slide=0x%x opcode self-check live=%s expect=%s -> %s"%(slide,got.hex(),EXPECT.hex(),"OK" if got==EXPECT else "MISMATCH"))
if got!=EXPECT: sys.exit(1)
fn=ctypes.CFUNCTYPE(ctypes.c_uint32,ctypes.c_void_p)(slide+VA)
N=0x200; bad=0
for v in (0x00,0x01,0x02,0x7f,0x80,0xff):
    buf=ctypes.create_string_buffer(b"\xcd"*N)   # poison every other byte
    a=ctypes.addressof(buf)
    ctypes.memset(a+0xd4,0xAA,1); ctypes.memset(a+0xd5,v,1); ctypes.memset(a+0xd6,0x55,1)
    before=ctypes.string_at(a,N)
    r=fn(a)
    after=ctypes.string_at(a,N)
    ok = (r==v) and (before==after)
    bad += 0 if ok else 1
    masked = v & 1
    print("  this+0xd5=0x%02x -> %-3d  const(no writes)=%s  %s%s"%(
        v, r, before==after, "PASS" if ok else "FAIL",
        "   <- an `& 1` or `!= 0` model would say %d here"%masked if v>1 else ""))
# neighbours must not matter
buf=ctypes.create_string_buffer(b"\xff"*N); a=ctypes.addressof(buf); ctypes.memset(a+0xd5,0x03,1)
r=fn(a); print("  neighbours 0xff, 0xd5=0x03 -> %d  %s"%(r,"PASS" if r==3 else "FAIL")); bad += 0 if r==3 else 1
print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
