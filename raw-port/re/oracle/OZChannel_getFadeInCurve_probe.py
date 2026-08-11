#!/usr/bin/env python3
"""OZChannel::getFadeInCurve() @ProChannel 0x15f1a — live differential.
Local (t) symbol -> called BY ADDRESS at slide+0x15f1a. Run under arch -x86_64."""
import ctypes, os, platform, struct, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x15f1a
WANT=bytes.fromhex("554889e5488b47704 88b40104885c07405 8b40 30eb02 31c0 5dc3".replace(" ",""))
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
mapped=ctypes.string_at(slide+VA,len(WANT)); disk=open("/tmp/ProChannel.x86_64","rb").read()[VA:VA+len(WANT)]
print("slide=0x%x"%slide); print("  mapped=%s\n  ondisk=%s\n  expect=%s -> %s"%(mapped.hex(),disk.hex(),WANT.hex(),"OK" if mapped==disk==WANT else "MISMATCH"))
if not (mapped==disk==WANT): sys.exit(1)
fn=ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)(slide+VA)
bad=0
def build(saved_x=None, y=None, saved_null=False):
    st=ctypes.create_string_buffer(b"\xcd"*0x38); sa=ctypes.addressof(st)
    if saved_x is not None: struct.pack_into("<I", st, 0x30, saved_x)
    if y is not None: struct.pack_into("<I", st, 0x34, y)
    impl=ctypes.create_string_buffer(b"\xcd"*0x40); ia=ctypes.addressof(impl)
    ctypes.c_uint64.from_address(ia+0x08).value=0xBBBBBBBBBBBBBBBB   # the curve slot must be ignored
    ctypes.c_uint64.from_address(ia+0x10).value= 0 if saved_null else sa
    this=ctypes.create_string_buffer(b"\xcd"*0x100); ta=ctypes.addressof(this)
    ctypes.c_uint64.from_address(ta+0x70).value=ia
    ctypes.c_uint64.from_address(ta+0x78).value=0xCCCCCCCCCCCCCCCC   # implSecondary must be ignored
    return st,impl,this,ta
for x,y,label in ((0,0x11111111,"x=0"),(1,0x22222222,"x=1"),(7,0x33333333,"x=7"),
                  (0x80000000,0x44444444,"x=0x80000000 (sign bit)"),(0xffffffff,0x55555555,"x=0xffffffff")):
    st,impl,this,ta=build(x,y)
    before=ctypes.string_at(ta,0x100)+ctypes.string_at(ctypes.addressof(impl),0x40)+ctypes.string_at(ctypes.addressof(st),0x38)
    r=fn(ta)
    after=ctypes.string_at(ta,0x100)+ctypes.string_at(ctypes.addressof(impl),0x40)+ctypes.string_at(ctypes.addressof(st),0x38)
    ok=(r==x and before==after); bad+=0 if ok else 1
    print("  savedState+0x30=0x%08x (+0x34=0x%08x) -> 0x%08x  const=%s  %-28s %s"%(x,y,r,before==after,label,"PASS" if ok else "FAIL"))
st,impl,this,ta=build(saved_null=True)
r=fn(ta); ok=(r==0); bad+=0 if ok else 1
print("  savedState (impl+0x10) = NULL -> %d (want 0, the xorl at 0x15f30)  %s"%(r,"PASS" if ok else "FAIL"))
print("  the 0xBBBB.. at impl+0x08 and 0xCCCC.. at this+0x78 were never returned, and +0x34 never leaked in")
print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
