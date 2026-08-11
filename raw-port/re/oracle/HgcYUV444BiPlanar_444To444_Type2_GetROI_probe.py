#!/usr/bin/env python3
"""HgcYUV444BiPlanar_444To444_Type2_GetROI_probe.py — live differential probe for
HgcYUV444BiPlanar_444To444_Type2::GetROI(HGRenderer*, int, HGRect) @Helium 0x3395c0
(__ZN32HgcYUV444BiPlanar_444To444_Type26GetROIEP10HGRendereri6HGRect, a LOCAL `t` symbol, so it is
called BY ADDRESS at slide + 0x3395c0, not by dlsym).

WHY UNDER ROSETTA. The port is transcribed from the x86_64 slice; a plain dlopen here maps arm64.
The arm64 build of this function cannot have the same encoding and would not sit at 0x3395c0 at
all, so the opcode self-check below is only meaningful in an x86_64 process.

WHAT IT MEASURES, against the live x86_64 Helium image:
  A. the 31 mapped opcode bytes at slide+0x3395c0 are the ones the port was transcribed from,
     including the `72 13` (jb) and the `48 8d 0d b1 8c 09 00` whose displacement resolves to
     _HGRectNull @0x3d2284
  B. inputIdx 0 and 1 return the caller's HGRect unchanged, bit for bit, over three different
     rects (a plain one, one with negative corners, and one of INT_MIN/INT_MAX extremes)
  C. inputIdx 2, 3, 0x7fffffff, 0x80000000 and 0xffffffff return {0,0,0,0} — HGRectNull
  D. CONTROL — the comparison is UNSIGNED, and this is what proves it rather than asserting it
     from the mnemonic alone. Two candidate models are scored against the same trace:
         signed   `(int)idx < 2`        predicts pass-through at idx = -1 and 0x80000000
         unsigned `(unsigned)idx < 2`   predicts HGRectNull there
     They disagree on exactly those inputs, and the binary answers. A `<= 2` model is refuted by
     idx = 2 in the same table.
  E. `this` (%rdi) and `HGRenderer*` (%rsi) are passed as NULL for every call above. The function
     returns normally, so it dereferences neither — the evidence for the port modelling no state.

Run: arch -x86_64 /usr/bin/python3 -u \
       raw-port/re/oracle/HgcYUV444BiPlanar_444To444_Type2_GetROI_probe.py
     (from the repo root; the probe needs no arguments)
"""
import ctypes, os, platform, subprocess, sys

FCP = "/Applications/Final Cut Pro.app/Contents"
HELIUM = FCP + "/Frameworks/Helium.framework/Versions/A/Helium"
RPATHS = [FCP + "/Frameworks", FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
          FCP + "/PlugIns", FCP + "/Frameworks/ProApps"]

FN = 0x3395c0
RECTNULL = 0x3d2284          # 0x3395d3 + 0x98cb1, from the leaq's own disp32
EXPECT = bytes.fromhex("4889c883fa027213554889e5488d0db18c0900488b014c8b41085d4c89c2c3")

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


preload(HELIUM)
print("preloaded %d images (%d failed)" % (len(loaded), len(failed)))
for f in failed[:5]:
    print("   failed:", f)
ctypes.CDLL(HELIUM, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Helium"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        print("Helium image #%d slide=0x%x" % (i, slide))
        break
if slide is None:
    sys.exit("INCONCLUSIVE: Helium not in the image list")

fails = []


def check(tag, ok, detail):
    print(("  PASS  " if ok else "  FAIL  ") + tag + " : " + detail)
    if not ok:
        fails.append(tag)


# A — opcode self-check at the cited address.
got = ctypes.string_at(slide + FN, len(EXPECT))
check("A opcode self-check @0x%x (31 bytes)" % FN, got == EXPECT,
      "live=%s" % got.hex())
# and the DATA symbol the leaq resolves to really is 16 zero bytes.
nullbytes = ctypes.string_at(slide + RECTNULL, 16)
check("A _HGRectNull @0x%x is 16 zero bytes" % RECTNULL, nullbytes == b"\0" * 16,
      nullbytes.hex())


class HGRect16(ctypes.Structure):
    """The 16-byte by-value HGRect: two SysV INTEGER eightbytes, {x,y} and {right,bottom}."""
    _fields_ = [("lo", ctypes.c_uint64), ("hi", ctypes.c_uint64)]

    def __repr__(self):
        return "{x:%d y:%d right:%d bottom:%d}" % (
            ctypes.c_int32(self.lo & 0xffffffff).value, ctypes.c_int32(self.lo >> 32).value,
            ctypes.c_int32(self.hi & 0xffffffff).value, ctypes.c_int32(self.hi >> 32).value)


def pack(x, y, right, bottom):
    m = lambda v: v & 0xffffffff
    return HGRect16(m(x) | (m(y) << 32), m(right) | (m(bottom) << 32))


fn = ctypes.CFUNCTYPE(HGRect16, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int,
                      HGRect16)(slide + FN)

RECTS = [("plain", pack(1, 2, 3, 4)),
         ("negative corners", pack(-7, -9, 11, 13)),
         ("INT_MIN/INT_MAX", pack(-0x80000000, -0x80000000, 0x7fffffff, 0x7fffffff))]
NULL16 = (0, 0)

# B — the pass-through indices.
for idx in (0, 1):
    for name, r in RECTS:
        # E — this and renderer are NULL on every call.
        out = fn(None, None, idx, r)
        check("B idx=%d %s -> caller's rect" % (idx, name),
              (out.lo, out.hi) == (r.lo, r.hi), "%s" % out)

# C — the HGRectNull indices, including the two that separate the models.
r = RECTS[0][1]
for idx in (2, 3, 0x7fffffff, -0x80000000, -1):
    out = fn(None, None, idx, r)
    check("C idx=0x%08x -> HGRectNull" % (idx & 0xffffffff),
          (out.lo, out.hi) == NULL16, "%s" % out)

# D — score the two candidate models over the whole index set, and say which one the binary is.
IDXS = [0, 1, 2, 3, 0x7fffffff, -0x80000000, -1]
signed_wrong = unsigned_wrong = 0
disagree = []
for idx in IDXS:
    out = fn(None, None, idx, r)
    passthrough = (out.lo, out.hi) == (r.lo, r.hi)
    s_pred = (idx < 2)                          # signed  (int)idx < 2
    u_pred = ((idx & 0xffffffff) < 2)           # unsigned (unsigned)idx < 2
    signed_wrong += (s_pred != passthrough)
    unsigned_wrong += (u_pred != passthrough)
    if s_pred != u_pred:
        disagree.append((idx, passthrough))
check("D unsigned model matches the binary on all %d indices" % len(IDXS), unsigned_wrong == 0,
      "%d mismatch(es)" % unsigned_wrong)
check("D signed model is REFUTED (a dead control here would mean the two are indistinguishable)",
      signed_wrong > 0,
      "%d mismatch(es), on idx %s" % (signed_wrong,
                                      ", ".join("0x%08x -> %s" % (i & 0xffffffff,
                                                                  "passthrough" if p else "null")
                                                for i, p in disagree)))

print("\nRESULT: %s (%d checks failed)" % ("PASS" if not fails else "FAIL " + ",".join(fails), len(fails)))
sys.exit(0 if not fails else 1)
