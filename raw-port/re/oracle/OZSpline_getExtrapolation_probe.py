#!/usr/bin/env python3
"""OZSpline::getExtrapolation(unsigned int) @ProChannel 0x2d856 — live differential.
Local (t) symbol -> called BY ADDRESS at slide+0x2d856. Run under arch -x86_64."""
import ctypes, os, platform, struct, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x2d856
EXPECT=bytes.fromhex("554889e531c085f60f95c0488b8fa80000008b4481245dc3")
if platform.machine()!="x86_64": sys.exit("REFUSING: "+platform.machine())
def deps(p): return [l.split()[0] for l in subprocess.run(["otool","-L",p],capture_output=True,text=True).stdout.splitlines()[1:] if l.strip()]
def res(n):
    if n.startswith("@rpath/"):
        for r in RP:
            q=os.path.join(r,n[7:])
            if os.path.exists(q): return q
        return None
    return n if os.path.exists(n) else None
seen=set()
def pre(p,d=0):
    if p in seen or d>6: return
    seen.add(p)
    for x in deps(p):
        r=res(x)
        if r and r!=p: pre(r,d+1)
    try: ctypes.CDLL(p,mode=ctypes.RTLD_GLOBAL)
    except OSError: pass
pre(PC); ctypes.CDLL(PC,mode=ctypes.RTLD_GLOBAL)
libc=ctypes.CDLL(None)
libc._dyld_get_image_name.restype=ctypes.c_char_p; libc._dyld_get_image_name.argtypes=[ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype=ctypes.c_void_p; libc._dyld_get_image_vmaddr_slide.argtypes=[ctypes.c_uint32]
slide=None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/ProChannel"): slide=libc._dyld_get_image_vmaddr_slide(i); break
if slide is None: sys.exit("INCONCLUSIVE: ProChannel not loaded")
got=ctypes.string_at(slide+VA,len(EXPECT))
print("slide=0x%x opcode self-check live=%s"%(slide,got.hex()))
print("                      expect=%s -> %s"%(EXPECT.hex(),"OK" if got==EXPECT else "MISMATCH"))
if got!=EXPECT: sys.exit(1)
fn=ctypes.CFUNCTYPE(ctypes.c_int32, ctypes.c_void_p, ctypes.c_uint32)(slide+VA)

st=ctypes.create_string_buffer(b"\xcd"*0x80); sa=ctypes.addressof(st)
V24, V28, V2C, V20 = 0x11111111, 0x22222222, 0x33333333, 0x44444444
struct.pack_into("<I", st, 0x20, V20); struct.pack_into("<I", st, 0x24, V24)
struct.pack_into("<I", st, 0x28, V28); struct.pack_into("<I", st, 0x2c, V2C)
this=ctypes.create_string_buffer(b"\xcd"*0x100); ta=ctypes.addressof(this)
ctypes.c_uint64.from_address(ta+0xa8).value = sa
before=ctypes.string_at(ta,0x100)+ctypes.string_at(sa,0x80)
bad=0
def name(v):
    return {V24:"state+0x24",V28:"state+0x28",V2C:"state+0x2c (WRONG - raw index)",V20:"state+0x20 (WRONG)"}.get(v&0xffffffff,"0x%08x"%(v&0xffffffff))
for w in (0,1,2,3,0xffffffff,0x80000000):
    r=fn(ta,w)&0xffffffff
    want = V24 if w==0 else V28
    ok = (r==want)
    bad += 0 if ok else 1
    print("  which=0x%-9x -> 0x%08x  %-30s %s"%(w,r,name(r),"PASS" if ok else "FAIL (want 0x%08x)"%want))
after=ctypes.string_at(ta,0x100)+ctypes.string_at(sa,0x80)
print("  no writes to this/state:", before==after)
bad += 0 if before==after else 1
print("  NOTE which=2 returning 0x22222222 (not 0x33333333) is what kills a `state[0x24 + which*4]`")
print("       model; which=0xffffffff returning 0x22222222 kills a signed/index-arithmetic model.")
print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
