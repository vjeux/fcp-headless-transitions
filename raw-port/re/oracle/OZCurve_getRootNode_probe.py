#!/usr/bin/env python3
"""OZCurve::getRootNode() const @ProChannel 0x1ea5c — live differential.
Local (t) symbol -> called BY ADDRESS at slide+0x1ea5c. Run under arch -x86_64."""
import ctypes, os, platform, struct, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x1ea5c
if platform.machine()!="x86_64": sys.exit("REFUSING: "+platform.machine())
EXPECT=open("/tmp/ProChannel.x86_64","rb").read()[VA:VA+10] if os.path.exists("/tmp/ProChannel.x86_64") else None
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
WANT=bytes.fromhex("554889e5488b47085dc3")
got=ctypes.string_at(slide+VA,len(WANT))
print("slide=0x%x  opcode self-check mapped=%s"%(slide,got.hex()))
if EXPECT is not None: print("                     on-disk slice=%s"%EXPECT[:len(WANT)].hex())
print("                     expected     =%s -> %s"%(WANT.hex(),"OK" if got==WANT else "MISMATCH"))
if got!=WANT: sys.exit(1)
fn=ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(slide+VA)
bad=0
for tag,v in (("NULL",0),("0x1",1),("marker",0x1122334455667788),("all ones",0xffffffffffffffff)):
    b=ctypes.create_string_buffer(b"\xcd"*0x100); a=ctypes.addressof(b)
    ctypes.c_uint64.from_address(a+0x00).value=0xAAAAAAAAAAAAAAAA   # vptr slot, must be ignored
    ctypes.c_uint64.from_address(a+0x08).value=v
    ctypes.c_uint64.from_address(a+0x10).value=0xBBBBBBBBBBBBBBBB   # +0x10 must be ignored
    before=ctypes.string_at(a,0x100)
    r=fn(a)
    after=ctypes.string_at(a,0x100)
    ok=(r==v) and before==after
    bad += 0 if ok else 1
    print("  this+0x08=%-20s -> 0x%016x  const=%s  %s"%(tag,r,before==after,"PASS" if ok else "FAIL"))
print("  (+0x00 = 0xAAA.. and +0x10 = 0xBBB.. were never returned, so the load is +0x08 and nothing else)")
print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
