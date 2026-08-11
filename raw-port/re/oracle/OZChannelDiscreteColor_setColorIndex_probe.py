#!/usr/bin/env python3
"""OZChannelDiscreteColor::setColorIndex(unsigned int) @ProChannel 0x8f1c0 — live differential.

The body is pure ARGUMENT MARSHALLING ending in a tail-jump through vtable[+0x2c8]
(= OZChannel::setValue(CMTime const&, double, bool) @ProChannel 0x1663c). So instead of a real
channel we hand it a FAKE vtable whose +0x2c8 slot is a ctypes callback: the callback records
(rdi, rsi, xmm0, edx) and the differential is over the marshalling, which is the whole method.

Run under arch -x86_64.
"""
import ctypes, os, platform, struct, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x8f1c0
WANT=bytes.fromhex("554889e589f0f2480f2ac0488b07488b80c8020000488b35e4b2030031d25dffe0")
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
got=ctypes.string_at(slide+VA,len(WANT))
disk=open("/tmp/ProChannel.x86_64","rb").read()[VA:VA+len(WANT)]
print("slide=0x%x"%slide)
print("  opcode mapped =%s"%got.hex())
print("  opcode ondisk =%s"%disk.hex())
print("  opcode expect =%s -> %s"%(WANT.hex(),"OK" if got==WANT==disk else "MISMATCH"))
if not (got==WANT==disk): sys.exit(1)

# the kCMTimeZero pointer the body loads: movq 0x3b2e4(%rip), %rsi at 0x8f1d5, next insn 0x8f1dc
GOTSLOT = 0x8f1dc + 0x3b2e4
kct_ptr = ctypes.c_uint64.from_address(slide + GOTSLOT).value
try:
    cm = ctypes.CDLL("/System/Library/Frameworks/CoreMedia.framework/CoreMedia", mode=ctypes.RTLD_GLOBAL)
    dl = ctypes.cast(cm.__getattr__("kCMTimeZero"), ctypes.c_void_p).value if False else None
except Exception:
    dl = None
dlsym_ptr = None
try:
    h = ctypes.CDLL(None)
    h.dlsym.restype = ctypes.c_void_p; h.dlsym.argtypes=[ctypes.c_void_p, ctypes.c_char_p]
    RTLD_DEFAULT = ctypes.c_void_p(-2)
    dlsym_ptr = h.dlsym(RTLD_DEFAULT, b"kCMTimeZero")
except Exception:
    pass
print("  vtable-free constant: literal-pool slot 0x%x -> 0x%x   dlsym(kCMTimeZero)=%s  %s"%(
    GOTSLOT, kct_ptr, hex(dlsym_ptr) if dlsym_ptr else "n/a",
    "MATCH" if dlsym_ptr and dlsym_ptr==kct_ptr else ("(no dlsym answer)" if not dlsym_ptr else "DIFFER")))
if kct_ptr:
    v,ts,fl,ep = struct.unpack_from("<qiiq", ctypes.string_at(kct_ptr,24), 0)
    print("     *kCMTimeZero = {value=%d timescale=%d flags=%d epoch=%d}"%(v,ts,fl,ep))

CAPT={}
CB = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_double, ctypes.c_uint32)
def hook(this_, tptr, val, flag):
    CAPT.update(this_=this_, tptr=tptr, val=val, flag=flag)
cb = CB(hook)
cbaddr = ctypes.cast(cb, ctypes.c_void_p).value

vt = ctypes.create_string_buffer(b"\xcd"*0x400); vta=ctypes.addressof(vt)
ctypes.c_uint64.from_address(vta+0x2c8).value = cbaddr
this = ctypes.create_string_buffer(b"\xcd"*0x40); ta=ctypes.addressof(this)
ctypes.c_uint64.from_address(ta).value = vta
fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_uint32)(slide+VA)
bad=0
for idx in (0, 1, 7, 0x7fffffff, 0x80000000, 0xffffffff):
    CAPT.clear()
    fn(ta, idx)
    want_val = float(idx)                      # movl %esi,%eax ZERO-extends, cvtsi2sd on the 64-bit rax
    signed_val = float(struct.unpack("<i", struct.pack("<I", idx))[0])
    ok = (CAPT.get("this_")==ta and CAPT.get("tptr")==kct_ptr
          and CAPT.get("val")==want_val and CAPT.get("flag")==0)
    bad += 0 if ok else 1
    note = ""
    if want_val != signed_val:
        note = "   <- a (int32) model would pass %.1f" % signed_val
    print("  idx=0x%-9x -> this=%s  t=%s  value=%.1f  bool=%s  %s%s"%(
        idx, "same" if CAPT.get("this_")==ta else "0x%x"%(CAPT.get("this_") or 0),
        "&kCMTimeZero" if CAPT.get("tptr")==kct_ptr else hex(CAPT.get("tptr") or 0),
        CAPT.get("val"), CAPT.get("flag"), "PASS" if ok else "FAIL", note))
print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
