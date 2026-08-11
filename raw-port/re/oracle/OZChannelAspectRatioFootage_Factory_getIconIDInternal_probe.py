#!/usr/bin/env python3
"""Call OZChannelAspectRatioFootage_Factory::getIconIDInternal() @ProChannel 0x64b0 live.
Local (t) symbol -> called by address at slide+0x64b0. Run under arch -x86_64."""
import ctypes, os, platform, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x64b0; EXPECT=bytes.fromhex("554889e5b8ffffffff5dc3")
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
print("slide=0x%x  opcode self-check: live=%s expect=%s -> %s"%(slide,got.hex(),EXPECT.hex(),"OK" if got==EXPECT else "MISMATCH"))
if got!=EXPECT: sys.exit(1)
fn=ctypes.CFUNCTYPE(ctypes.c_int32,ctypes.c_void_p)(slide+VA)
buf=ctypes.create_string_buffer(0x200)
bad=0
for tag,recv in (("NULL",0),("1",1),("0xdeadbeef",0xdeadbeef),("live 0x200 buffer",ctypes.addressof(buf))):
    r=fn(recv)
    ok = (r==-1)
    bad += 0 if ok else 1
    print("  this=%-18s -> %d (0x%08x)  %s"%(tag,r,r&0xffffffff,"PASS" if ok else "FAIL"))
# is the 4-byte-wide write observable? read the value as unsigned too
fnu=ctypes.CFUNCTYPE(ctypes.c_uint64,ctypes.c_void_p)(slide+VA)
print("  as u64 (upper 32 bits of rax after a 32-bit movl): 0x%x"%fnu(0))
print("RESULT:","PASS" if bad==0 else "FAIL")
sys.exit(0 if bad==0 else 1)
