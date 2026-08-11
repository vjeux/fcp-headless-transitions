#!/usr/bin/env python3
"""OZSplineNode::operator==(OZSplineNode const&) const @ProChannel 0x2a34e — live differential.

The whole body is a virtual dispatch: load vtable[+0x70] and TAIL-JUMP. So the differential is over
the dispatch itself — a FAKE vtable whose +0x70 slot is a ctypes callback records what arrives and
what comes back. Run under arch -x86_64.
"""
import ctypes, os, platform, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x2a34e
WANT=bytes.fromhex("554889e5488b07488b40705dffe0")
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
print("slide=0x%x"%slide); print("  mapped=%s  ondisk=%s  expect=%s -> %s"%(mapped.hex(),disk.hex(),WANT.hex(),"OK" if mapped==disk==WANT else "MISMATCH"))
if not (mapped==disk==WANT): sys.exit(1)

CAPT={}
CB=ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p, ctypes.c_void_p)
RET=[0]
def hook(this_, other):
    CAPT.update(this_=this_, other=other)
    return RET[0]
cb=CB(hook); cbaddr=ctypes.cast(cb,ctypes.c_void_p).value

vt=ctypes.create_string_buffer(b"\xcd"*0x200); vta=ctypes.addressof(vt)
ctypes.c_uint64.from_address(vta+0x70).value=cbaddr
ctypes.c_uint64.from_address(vta+0x68).value=0xDEADBEEF   # neighbouring slots must not be used
ctypes.c_uint64.from_address(vta+0x78).value=0xDEADBEEF
a=ctypes.create_string_buffer(b"\xcd"*0x80); aa=ctypes.addressof(a)
b=ctypes.create_string_buffer(b"\xee"*0x80); ba=ctypes.addressof(b)
ctypes.c_uint64.from_address(aa).value=vta
ctypes.c_uint64.from_address(ba).value=vta
fn=ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p, ctypes.c_void_p)(slide+VA)
bad=0
for ret in (0,1,0xff):
    RET[0]=ret; CAPT.clear()
    r=fn(aa,ba)
    ok = (CAPT.get("this_")==aa and CAPT.get("other")==ba and r==(ret&0xff))
    bad += 0 if ok else 1
    print("  slot returns 0x%02x -> operator== returns 0x%02x ; slot saw this=%s other=%s  %s"%(
        ret, r, "arg0" if CAPT.get("this_")==aa else hex(CAPT.get("this_") or 0),
        "arg1" if CAPT.get("other")==ba else hex(CAPT.get("other") or 0), "PASS" if ok else "FAIL"))
# the receiver's vtable is the one consulted, not the argument's
vt2=ctypes.create_string_buffer(b"\xcd"*0x200); vt2a=ctypes.addressof(vt2)
CAPT2={}
def hook2(this_, other):
    CAPT2.update(this_=this_, other=other); return 7
cb2=CB(hook2); ctypes.c_uint64.from_address(vt2a+0x70).value=ctypes.cast(cb2,ctypes.c_void_p).value
ctypes.c_uint64.from_address(ba).value=vt2a          # give the ARGUMENT a different vtable
RET[0]=1; CAPT.clear(); CAPT2.clear()
r=fn(aa,ba)
ok = (r==1 and CAPT and not CAPT2)
bad += 0 if ok else 1
print("  argument carries a DIFFERENT vtable -> dispatched through the RECEIVER's: %s (ret 0x%02x)"%("PASS" if ok else "FAIL", r))
print("  0xdeadbeef in slots +0x68/+0x78 was never called, so the slot is +0x70 and nothing else")
print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
