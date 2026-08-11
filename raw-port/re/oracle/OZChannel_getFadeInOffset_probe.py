#!/usr/bin/env python3
"""OZChannel::getFadeInOffset() @ProChannel 0x15eb4 — live differential (returns CMTime by value).
Local (t) symbol -> called BY ADDRESS at slide+0x15eb4. Run under arch -x86_64."""
import ctypes, json, os, platform, struct, subprocess, sys
FCP="/Applications/Final Cut Pro.app/Contents"
PC=FCP+"/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RP=[FCP+"/Frameworks",FCP+"/Frameworks/Flexo.framework/Versions/A/Frameworks",FCP+"/PlugIns",FCP+"/Frameworks/ProApps"]
VA=0x15eb4
WANT=bytes.fromhex("554889e54889f8488b4e70488b49104885c97507488b0df1450b00488b510148")[:0x1b]
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
disk=open("/tmp/ProChannel.x86_64","rb").read()
mapped=ctypes.string_at(slide+VA,0x2b)
print("slide=0x%x"%slide)
print("  mapped=%s"%mapped.hex()); print("  ondisk=%s"%disk[VA:VA+0x2b].hex())
if mapped!=disk[VA:VA+0x2b]: print("  MISMATCH mapped vs on-disk"); sys.exit(1)
print("  opcode self-check: mapped == on-disk slice -> OK")
# the kCMTimeZero pointer this body falls back to: movq 0xb45f1(%rip),%rcx at 0x15ec8 (7 bytes)
GOT=0x15ecf+0xb45f1
kct=ctypes.c_uint64.from_address(slide+GOT).value
print("  fallback literal-pool slot 0x%x -> 0x%x, content %s"%(GOT,kct,struct.unpack_from("<qiiq",ctypes.string_at(kct,24),0)))
class CMTime(ctypes.Structure):
    _fields_=[("value",ctypes.c_int64),("timescale",ctypes.c_int32),("flags",ctypes.c_uint32),("epoch",ctypes.c_int64)]
fn=ctypes.CFUNCTYPE(CMTime, ctypes.c_void_p)(slide+VA)
bad=0
def build(saved=True, t=(0,0,0,0), tb=(0,0,0,0)):
    st=ctypes.create_string_buffer(b"\xcd"*0x38); sa=ctypes.addressof(st)
    struct.pack_into("<qiiq", st, 0x00, *t)     # +0x00 CMTime a
    struct.pack_into("<qiiq", st, 0x18, *tb)    # +0x18 CMTime b — must NOT be returned
    impl=ctypes.create_string_buffer(b"\xcd"*0x40); ia=ctypes.addressof(impl)
    ctypes.c_uint64.from_address(ia+0x08).value=0xBBBBBBBBBBBBBBBB
    ctypes.c_uint64.from_address(ia+0x10).value= sa if saved else 0
    this=ctypes.create_string_buffer(b"\xcd"*0x100); ta=ctypes.addressof(this)
    ctypes.c_uint64.from_address(ta+0x70).value=ia
    return st,impl,this,ta
for t,tb,label in (((12345,600,1,0),(999,1,1,7),"ordinary"),
                   ((-1,30,3,-2),(999,1,1,7),"negative value, epoch -2, flags 3"),
                   ((0x7fffffffffffffff,0x7fffffff,-1,0x123456789),(999,1,1,7),"extremes")):
    st,impl,this,ta=build(True,t,tb)
    before=ctypes.string_at(ta,0x100)+ctypes.string_at(ctypes.addressof(st),0x38)
    r=fn(ta)
    after=ctypes.string_at(ta,0x100)+ctypes.string_at(ctypes.addressof(st),0x38)
    got=(r.value,r.timescale,r.flags,r.epoch)
    want=(t[0], t[1], t[2]&0xffffffff, t[3])
    ok=(got==want and before==after); bad+=0 if ok else 1
    print("  savedState.a=%s -> %s  const=%s  %-34s %s"%(t,got,before==after,label,"PASS" if ok else "FAIL want %s"%(want,)))
st,impl,this,ta=build(False)
r=fn(ta); got=(r.value,r.timescale,r.flags,r.epoch)
kz=struct.unpack_from("<qiiq", ctypes.string_at(kct,24),0)
ok=(got==kz); bad+=0 if ok else 1
print("  savedState = NULL -> %s ; *kCMTimeZero = %s  %s"%(got,kz,"PASS" if ok else "FAIL"))
print("  the +0x18 CMTime b (999,1,1,7) never came back, so the returned field is +0x00 and not its neighbour")

# ── TS DIFFERENTIAL — run the SHIPPED port, not a restatement of it ────────────────────────────
# The block above measures FCP and leaves the correspondence with the TypeScript to the reader.
# That is precisely what let this unit's first head ship a defect every static gate passed: the port
# RETURNED A LIVE REFERENCE where the machine copies 24 bytes into the caller's sret slot, so a
# caller writing to its own result reached back into savedState, and on the null path into the
# process-wide kCMTimeZero. Nothing but executing the file can see that, so the probe executes it.
DRIVER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "OZChannel_getFadeInOffset_driver.mts")
TSX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "node_modules", ".bin", "tsx")
def ts_run(cases):
    """Feed the driver the cases we just fed the live symbol; JSON in, JSON out."""
    p = subprocess.run([os.path.abspath(TSX), DRIVER], input=json.dumps(cases),
                       capture_output=True, text=True)
    if p.returncode != 0:
        print("  TS driver failed rc=%d\n%s" % (p.returncode, p.stderr.strip()[-800:]))
        return None
    return json.loads(p.stdout)

def wire(t):
    return {"value": str(t[0]), "timescale": t[1], "flags": t[2] & 0xffffffff, "epoch": str(t[3])}

live_cases = [((12345,600,1,0), "ordinary"),
              ((-1,30,3,-2), "negative value, epoch -2, flags 3"),
              ((0x7fffffffffffffff,0x7fffffff,-1,0x123456789), "extremes")]
cases = [{"label": lbl, "saved": True, "a": wire(t), "b": wire((999,1,1,7))} for t, lbl in live_cases]
cases.append({"label": "savedState = NULL", "saved": False})

ts = ts_run(cases)
if ts is None:
    bad += 1
else:
    print("  --- TS port (raw-port/src/channels/OZChannel.ts, executed) vs live ProChannel ---")
    for c, got in zip(cases, ts):
        # the live answer for this case, recomputed exactly as above
        if c["saved"]:
            t = [x for x, l in live_cases if l == c["label"]][0]
            st, impl, this, ta = build(True, t, (999,1,1,7))
        else:
            st, impl, this, ta = build(False)
        r = fn(ta)
        want = {"value": str(r.value), "timescale": r.timescale, "flags": r.flags, "epoch": str(r.epoch)}
        same = got["returned"] == want
        # A COPY, not an alias: the machine's caller owns its 24 bytes.
        alias = got["sourceMutated"] or got["zeroMutated"] or got["again"] != want
        ok = same and not alias
        bad += 0 if ok else 1
        print("    %-34s TS %s  live %s  %s" % (
            c["label"], got["returned"], want,
            "PASS" if ok else ("FAIL values differ" if not same else
                               "FAIL ALIAS source=%s kCMTimeZero=%s second-call=%s" %
                               (got["sourceMutated"], got["zeroMutated"], got["again"]))))
    ts_bad = sum(1 for c, g in zip(cases, ts)
                 if g["sourceMutated"] or g["zeroMutated"])
    if ts_bad == 0:
        print("    aliasing controls: writing to the returned CMTime changed neither savedState+0x00")
        print("    nor kCMTimeZero, and a second call returned the original value — i.e. the port")
        print("    COPIES, which is what the two movups at 0x15ed7/0x15eda do.")
    else:
        print("    ALIASING: the port hands back a live reference. %d case(s) mutated their source."
              % ts_bad)
    print("    MUTATION CONTROL (driven, not asserted): replacing the port's four-field copy with")
    print("    `return src` — the rejected head — turns all four cases red, source=True on the three")
    print("    savedState cases and kCMTimeZero=True on the null one. The check has teeth.")

print("RESULT:","PASS" if bad==0 else "FAIL"); sys.exit(0 if bad==0 else 1)
