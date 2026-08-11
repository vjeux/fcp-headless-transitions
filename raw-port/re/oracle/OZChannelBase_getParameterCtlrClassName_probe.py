#!/usr/bin/env python3
"""OZChannelBase_getParameterCtlrClassName_probe.py — live differential probe for
OZChannelBase::getParameterCtlrClassName() @ProChannel 0x4bc78
(__ZN13OZChannelBase25getParameterCtlrClassNameEv, an EXPORTED `T` symbol, so it is resolved with
dlsym rather than by slide+offset — the inventory line is
`000000000004bc78 T __ZN13OZChannelBase25getParameterCtlrClassNameEv`).

THIS IS THE +0x58 TWIN of the landed OZChannelBase_getLabelCtlrClassName_probe.py, which used THIS
function as one of its two controls. The family is three ten-byte getters differing only in the
displacement, so the one thing a probe here must prove is that the port reads +0x58 and not the
slot eight bytes either side of it — a wrong-slot transcription is the only defect this body can
have, and it is invisible to every static gate (the file compiles, cites an address, and returns a
plausible CFStringRef).

WHY UNDER ROSETTA. Every port in this repo is transcribed from the x86_64 slice, while a plain
dlopen on this box maps arm64. This body is a single `movq 0x58(%rdi), %rax`, so the two slices
would agree — but the rule is not conditional, and running it under `arch -x86_64` costs nothing
and keeps the probe honest about which code it measured.

WHAT IT MEASURES, against the live x86_64 ProChannel image:
  A. the dlsym'd address is slide+0x4bc78, the 10 mapped opcode bytes are the ones the port was
     transcribed from (55 48 89 e5 48 8b 47 58 5d c3), and — when the thin slice is present —
     those bytes equal the ON-DISK bytes at the same file offset, so a mapped-image surprise
     cannot pass as agreement
  B. over a 0xCD-poisoned 0x100-byte arena standing in for `this`, for each of six sentinel words
     written at +0x58 — 0 (the NULL the port returns unchanged), 1, 0x50 (the SIBLING's
     displacement, so a wrong-slot read cannot coincidentally match), a real heap pointer,
     0xFFFFFFFFFFFFFFFF and 0xCDCDCDCDCDCDCDCD (the poison itself) — the returned qword is that
     sentinel, bit for bit
  C. the arena is byte-identical after every call: this getter reads and writes nothing. Poison
     matters here — a zero-filled buffer cannot distinguish "untouched" from "wrote zeros"
  D. CONTROL, so B is not just "any load passes": the same arena is read through the two SIBLING
     displacements (+0x50 getLabelCtlrClassName @0x4bc6e, +0x60 getInspectorCtlrClassName
     @0x4bc82, both also exported). Each returns ITS OWN distinct sentinel, and neither returns
     the +0x58 one. A port that read the wrong slot would fail B against this arena.

WHAT IT CANNOT SHOW: nothing about ownership. The absence of a retain is a property of the
instruction stream (there is no call in the body at all), not of a value comparison.

Run: arch -x86_64 /usr/bin/python3 -u raw-port/re/oracle/OZChannelBase_getParameterCtlrClassName_probe.py
     (from the repo root; the probe needs no arguments)
"""
import ctypes, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
PC = FCP + "/Frameworks/ProChannel.framework/Versions/A/ProChannel"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

SYM = "_ZN13OZChannelBase25getParameterCtlrClassNameEv"   # dlsym: no leading Mach-O underscore
VA = 0x4bc78                                             # inventory address of that symbol
EXPECT = bytes.fromhex("554889e5488b47585dc3")            # pushq..retq, 10 bytes, the whole body
THIN = "/tmp/ProChannel.x86_64"                          # optional: lipo -thin x86_64 slice
SIBLINGS = [("_ZN13OZChannelBase21getLabelCtlrClassNameEv", 0x4bc6e, 0x50),
            ("_ZN13OZChannelBase25getInspectorCtlrClassNameEv", 0x4bc82, 0x60)]

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())


def deps(path):
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def resolve(name):
    if name.startswith("@rpath/"):
        for r in RPATHS:
            p = os.path.join(r, name[len("@rpath/"):])
            if os.path.exists(p):
                return p
        return None
    return name if os.path.exists(name) else None


loaded, failed = set(), []


def preload(path, depth=0):
    if path in loaded or depth > 6:
        return
    loaded.add(path)
    for d in deps(path):
        rp = resolve(d)
        if rp and rp != path and rp not in loaded:
            preload(rp, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
    except OSError as e:
        failed.append((os.path.basename(path), str(e).split(":")[-1].strip()[:60]))


preload(PC)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
for f in failed[:5]:
    print("   failed:", f)
lib = ctypes.CDLL(PC, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/ProChannel"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        print("ProChannel image #%d slide=0x%x" % (i, slide))
        break
if slide is None:
    sys.exit("INCONCLUSIVE: ProChannel not in the image list")

addr = ctypes.cast(getattr(lib, SYM), ctypes.c_void_p).value
fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# A — the dlsym'd address IS 0x4bc78 in this image, and the bytes there are the transcribed ones.
check("A dlsym address == slide+0x%x" % VA, addr == slide + VA,
      "dlsym 0x%x vs slide+0x%x = 0x%x" % (addr, VA, slide + VA))
got = ctypes.string_at(addr, len(EXPECT))
check("A opcode self-check (10 bytes)", got == EXPECT,
      "live=%s expect=%s" % (got.hex(), EXPECT.hex()))
# A2 — the mapped bytes against the ON-DISK x86_64 slice, when it is there. An absent slice is
#      reported as such and is NOT counted as agreement: "could not run" never reads as "passed".
if os.path.exists(THIN):
    with open(THIN, "rb") as fh:
        fh.seek(VA)
        disk = fh.read(len(EXPECT))
    check("A2 mapped bytes == on-disk thin slice", disk == got,
          "disk=%s mapped=%s" % (disk.hex(), got.hex()))
else:
    print("  SKIP  A2 on-disk cross-check : %s absent (lipo -thin x86_64 to enable); NOT a pass"
          % THIN)

fn = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(addr)

# A poisoned arena stands in for `this`. 0xCD, not zeros: a zero buffer cannot tell "untouched"
# from "wrote zeros", which is the mirror trap this log has already recorded twice.
N = 0x100
arena = ctypes.create_string_buffer(b"\xCD" * N, N)
base = ctypes.addressof(arena)
poison = bytes(arena.raw)

# A real heap pointer is one of the sentinels — a CFStringRef in the wild is a pointer, so at
# least one case must be pointer-shaped rather than a small integer.
heapish = ctypes.addressof(ctypes.create_string_buffer(16))

SENTINELS = [0,
             1,
             0x50,
             heapish,
             0xFFFFFFFFFFFFFFFF,
             0xCDCDCDCDCDCDCDCD]

# B — the return value is the +0x58 word, for every sentinel.
for s in SENTINELS:
    ctypes.c_uint64.from_address(base + 0x58).value = s
    r = fn(base)
    check("B +0x58 = 0x%016x -> returned" % s, r == s, "0x%016x" % r)
    # C — nothing written anywhere else (compare with the slot restored to poison).
    ctypes.c_uint64.from_address(base + 0x58).value = 0xCDCDCDCDCDCDCDCD
    check("C arena unchanged after that call", bytes(arena.raw) == poison,
          "%d of %d bytes differ" % (sum(a != b for a, b in zip(bytes(arena.raw), poison)), N))

# D — CONTROL. Give the three slots three DIFFERENT values and read all three getters. If the
#     port had transcribed the wrong displacement, B above would have returned a sibling's value.
V50, V58, V60 = 0x5050505050505050, 0x5858585858585858, 0x6060606060606060
ctypes.c_uint64.from_address(base + 0x50).value = V50
ctypes.c_uint64.from_address(base + 0x58).value = V58
ctypes.c_uint64.from_address(base + 0x60).value = V60
r58 = fn(base)
check("D getParameterCtlrClassName reads +0x58, not +0x50/+0x60", r58 == V58,
      "0x%016x (siblings hold 0x%016x / 0x%016x)" % (r58, V50, V60))
for sym, va, disp in SIBLINGS:
    saddr = ctypes.cast(getattr(lib, sym), ctypes.c_void_p).value
    sfn = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(saddr)
    want = {0x50: V50, 0x60: V60}[disp]
    rs = sfn(base)
    check("D sibling @0x%x reads +0x%02x" % (va, disp), rs == want and rs != V58,
          "0x%016x (expect 0x%016x, and NOT the +0x58 value)" % (rs, want))


# E — THE PORT ITSELF, executed. Everything above measures the BINARY; this asks the shipped
#     TypeScript the same question, because the one defect this body can have — reading the +0x50
#     field instead of the +0x58 one — is invisible to every static gate and to a probe that never
#     loads the module. The driver builds a real OZChannelBase (prototype and all), fills the three
#     slots with distinguishable values, and calls the method a caller would call.
DRV = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "OZChannelBase_getParameterCtlrClassName_driver.mts")
TSX = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                   "..", "..", "node_modules", ".bin", "tsx"))
E_CASES = [{"label": "+0x50", "parameter": "+0x58", "inspector": "+0x60"},
           {"label": "+0x50", "parameter": None, "inspector": "+0x60"}]
if not os.path.exists(TSX):
    print("  SKIP  E TS port : tsx not found at %s ; NOT a pass" % TSX)
    fails.append("E unavailable")
else:
    import json
    p_ = subprocess.run([TSX, DRV], input=json.dumps(E_CASES), capture_output=True, text=True)
    if p_.returncode != 0:
        check("E TS driver ran", False, p_.stderr.strip()[-300:])
    else:
        got = json.loads(p_.stdout)
        check("E TS port returns the +0x58 slot, not +0x50/+0x60",
              got[0]["got"] == "+0x58", "returned %r (label=+0x50, inspector=+0x60)" % got[0]["got"])
        check("E TS port returns NULL unchanged", got[1]["got"] is None, "returned %r" % got[1]["got"])

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails), len(fails)))
sys.exit(0 if not fails else 1)
