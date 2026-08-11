#!/usr/bin/env python3
"""OZChannelEnum::getEnabledState(unsigned long) const @ProChannel 0x6366a — live differential.
Local (t) symbol -> called BY ADDRESS at slide+0x6366a. Run under arch -x86_64."""
import ctypes, os, platform, struct, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x6366a
WANT=bytes.fromhex("554889e5488b87c000000048" "89f148c1e906488b04c8480fa3f00f92c05dc3")
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
print("slide=0x%x"%slide)
print("  mapped=%s"%mapped.hex()); print("  ondisk=%s"%disk.hex()); print("  expect=%s -> %s"%(WANT.hex(),"OK" if mapped==disk==WANT else "MISMATCH"))
if not (mapped==disk==WANT): sys.exit(1)
fn=ctypes.CFUNCTYPE(ctypes.c_uint8, ctypes.c_void_p, ctypes.c_uint64)(slide+VA)

NW=8
words=[0x0000000000000001,  # w0: bit0
       0x8000000000000000,  # w1: bit63
       0xAAAAAAAAAAAAAAAA,  # w2: odd bits
       0x0000000000000000,
       0xFFFFFFFFFFFFFFFF,
       0,0,0]
wb=ctypes.create_string_buffer(8*NW+64); wa=(ctypes.addressof(wb)+31)&~31
for i,w in enumerate(words): ctypes.c_uint64.from_address(wa+8*i).value=w
this=ctypes.create_string_buffer(b"\xcd"*0x100); ta=ctypes.addressof(this)
ctypes.c_uint64.from_address(ta+0xc0).value=wa
before=ctypes.string_at(ta,0x100)+ctypes.string_at(wa,8*NW)
bad=0
def model(idx):  # the port's model: word = idx >> 6 (logical), bit = idx & 63
    return (words[idx>>6] >> (idx & 63)) & 1
for idx in (0,1,63,64,65,127,128,129,130,131,255,256,257,319):
    r=fn(ta,idx)
    m=model(idx)
    ok = (r==m)
    bad += 0 if ok else 1
    extra=""
    if idx>=64:
        naive = (words[0] >> (idx & 63)) & 1   # a model that forgot the word select
        if naive!=m: extra="   <- a word-select-less model would say %d"%naive
    print("  idx=%-4d word=%d bit=%-2d -> %d (model %d) %s%s"%(idx, idx>>6, idx&63, r, m, "PASS" if ok else "FAIL", extra))
after=ctypes.string_at(ta,0x100)+ctypes.string_at(wa,8*NW)
print("  const (no writes to this or the word array):", before==after); bad += 0 if before==after else 1
print("  NOTE the bit index is rsi MOD 64 because `btq %rsi,%rax` with a register offset and a")
print("       register destination masks the offset to the operand size — idx=64 reading word 1")
print("       bit 0 (value %d here) is that fact, and it is why no explicit AND appears."%model(64))
print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
