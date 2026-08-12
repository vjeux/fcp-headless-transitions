#!/usr/bin/env python3
"""MXF__MXFColorSpace_decodeMatrix_oracle.py — differential for
`MXF::MXFColorSpace::decodeMatrix()` @Flexo 0x1445ec0 against the LIVE Final Cut Pro binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/MXF__MXFColorSpace_decodeMatrix_oracle.py

WHAT THIS DOES AND DOES NOT MEASURE. Every path of `decodeMatrix` enters
`MXF::operator==(MXKey16 const&, unsigned long long const*)` — an MXFExportSDK extern, outside the
five in-scope frameworks, modelled in the port as a throwing boundary stub — before the method
computes anything. So there is no TS-side value to place next to a binary-side value, and this is
NOT a TS-vs-binary value differential; claiming one would be the "an oracle that never runs the
port" shape OPS_LOG records. What it measures is the transcription's CONTENT: the four
(key, code, name) triples, the two store offsets, and both return values, by running the REAL
function on a synthetic object and reading back what it wrote.

Method, and why each part is there:
  * the symbol is LOCAL (`t`), so it is called BY ADDRESS at slide+0x1445ec0. The process must be
    x86_64 (`arch -x86_64`): the dlopen'd image on this machine is arm64 otherwise and the address
    would land in unrelated code — a failure that reads as a wrong ANSWER, not as an error.
  * before calling, the bytes at the target are compared against the same bytes in the on-disk
    x86_64 slice. A mismatch means the address is not the function and the harness refuses.
  * `this` is a poisoned 0x48-byte arena (0xCD). Every byte is diffed afterwards, so a store the
    port does not model would be caught rather than assumed absent.
  * the synthetic MXKey16 puts its two payload words at +0x10/+0x18, which is where the extern's
    decoded body reads them (MXFExportSDK 0x63070: `movq 0x8(%rsi),%rax ; cmpq 0x18(%rdi),%rax`
    … `movq (%rsi),%rax ; cmpq 0x10(%rdi),%rax ; sete %al`).

Exit status 0 = every case agreed with the port's model AND every negative control disagreed.
"""
import ctypes
import ctypes.util
import platform
import os
import struct
import subprocess
import sys

FCP = "/Applications/Final Cut Pro.app/Contents"
FLEXO = FCP + "/Frameworks/Flexo.framework/Versions/A/Flexo"
SLICE = "/tmp/Flexo.x86_64"  # `lipo -thin x86_64` of the framework; regenerated if absent

DECODE_MATRIX_VA = 0x1445EC0

# --- the model this file is checking: raw-port/src/channels/MXF__MXFColorSpace.ts ----------------
# (key address, word0, word1, expected code, expected name) in the order the body tests them.
MODEL = [
    ("kmlBT601CodingEquations", 0x1C781E0, 0x060E2B3404010101, 0x0401010102010000, 2, "BT.601"),
    ("kmlBT709CodingEquations", 0x1C781F0, 0x060E2B3404010101, 0x0401010102020000, 1, "BT.709"),
    ("kml240MCodingEquations", 0x1C78200, 0x060E2B3404010106, 0x0401010102030000, 3, "ST240"),
    ("kmlITU2020_NCLCodingEquations", 0x1C78230, 0x060E2B340401010D, 0x0401010102060000, 6, "BT.2020"),
]
# In the same __DATA array, deliberately NOT tested by this body -> must come back false.
UNTESTED = [
    ("kmlYCgCoCodingEquations", 0x1C78210, 0x060E2B340401010D, 0x0401010102040000),
    ("kmlGBRCodingEquations", 0x1C78220, 0x060E2B340401010D, 0x0401010102050000),
]

THIS_SIZE = 0x48
POISON = 0xCD
OFF_KEY, OFF_CODE, OFF_NAME = 0x10, 0x20, 0x40

if platform.machine() != "x86_64":
    sys.exit("REFUSING: %s — rerun under `arch -x86_64 /usr/bin/python3`" % platform.machine())

# ---------------------------------------------------------------------------------------------
# load Flexo outside the app bundle (depth-first @rpath preload; OPS_LOG 2026-08-10)
# ---------------------------------------------------------------------------------------------
RPATHS = [
    FCP + "/Frameworks",
    FCP + "/Frameworks/Flexo.framework/Versions/A/Frameworks",
    "/Applications/Final Cut Pro.app/Contents/PlugIns",
    FCP + "/Frameworks/ProApps",
]


def deps(path):
    out = subprocess.run(["otool", "-L", path], capture_output=True, text=True).stdout
    return [l.split()[0] for l in out.splitlines()[1:] if l.strip()]


def resolve(name):
    if name.startswith("@rpath/"):
        tail = name[len("@rpath/"):]
        for r in RPATHS:
            p = os.path.join(r, tail)
            if os.path.exists(p):
                return p
        return None
    return name if os.path.exists(name) else None


_loaded = set()


def preload(path, depth=0):
    if path in _loaded or depth > 6:
        return
    _loaded.add(path)
    for d in deps(path):
        rp = resolve(d)
        if rp and rp != path and rp not in _loaded:
            preload(rp, depth + 1)
    try:
        ctypes.CDLL(path, mode=ctypes.RTLD_GLOBAL)
    except OSError:
        pass


preload(FLEXO)
ctypes.CDLL(FLEXO, mode=ctypes.RTLD_GLOBAL)

libc = ctypes.CDLL(None)
libc._dyld_image_count.restype = ctypes.c_uint32
libc._dyld_get_image_name.restype = ctypes.c_char_p
libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]

slide = None
for i in range(libc._dyld_image_count()):
    if libc._dyld_get_image_name(i).decode().endswith("/Flexo"):
        slide = libc._dyld_get_image_vmaddr_slide(i)
        break
if slide is None:
    sys.exit("Flexo is not in the image list")

# ---------------------------------------------------------------------------------------------
# refuse unless the bytes at the target ARE the function
# ---------------------------------------------------------------------------------------------
if not os.path.exists(SLICE):
    subprocess.run(["lipo", "-thin", "x86_64", FLEXO, "-output", SLICE], check=True)


def file_bytes(va, n):
    """Read n bytes at virtual address va out of the on-disk x86_64 slice."""
    with open(SLICE, "rb") as f:
        _, _, _, _, ncmds, sizeofcmds, _, _ = struct.unpack("<IiiIIIII", f.read(32))
        d = f.read(sizeofcmds)
        off = 0
        for _ in range(ncmds):
            cmd, cz = struct.unpack_from("<II", d, off)
            if cmd == 0x19:  # LC_SEGMENT_64
                nsects = struct.unpack_from("<I", d, off + 64)[0]
                so = off + 72
                for _s in range(nsects):
                    sa, ss = struct.unpack_from("<QQ", d, so + 32)
                    sf = struct.unpack_from("<I", d, so + 48)[0]
                    if sa <= va < sa + ss:
                        f.seek(sf + (va - sa))
                        return f.read(n)
                    so += 80
            off += cz
    return None


want = file_bytes(DECODE_MATRIX_VA, 32)
got = ctypes.string_at(slide + DECODE_MATRIX_VA, 32)
if want != got:
    sys.exit(
        "REFUSING: bytes at slide+0x%x do not match the on-disk x86_64 slice\n  disk %s\n  live %s"
        % (DECODE_MATRIX_VA, want.hex(), got.hex())
    )

decode_matrix = ctypes.CFUNCTYPE(ctypes.c_bool, ctypes.c_void_p)(slide + DECODE_MATRIX_VA)

CF = ctypes.CDLL("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation")
CF.CFStringGetCString.restype = ctypes.c_bool
CF.CFStringGetCString.argtypes = [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_long, ctypes.c_uint32]


def cfstr(ptr):
    if not ptr:
        return None
    buf = ctypes.create_string_buffer(256)
    if CF.CFStringGetCString(ctypes.c_void_p(ptr), buf, 256, 0x08000100):  # kCFStringEncodingUTF8
        return buf.value.decode()
    return "<unreadable CFString at 0x%x>" % ptr


def run_case(word0, word1):
    """Call the live function with a synthetic key; return (ret, code, name, touched_offsets)."""
    key = (ctypes.c_ubyte * 0x20)(*([POISON] * 0x20))
    struct.pack_into("<QQ", key, 0x10, word0, word1)
    arena = (ctypes.c_ubyte * THIS_SIZE)(*([POISON] * THIS_SIZE))
    before = bytes(arena)
    struct.pack_into("<Q", arena, OFF_KEY, ctypes.addressof(key))
    ret = decode_matrix(ctypes.addressof(arena))
    after = bytes(arena)
    code = struct.unpack_from("<i", after, OFF_CODE)[0]
    name_ptr = struct.unpack_from("<Q", after, OFF_NAME)[0]
    touched = sorted(
        {o for o in range(THIS_SIZE) if before[o] != after[o] and not (OFF_KEY <= o < OFF_KEY + 8)}
    )
    return ret, code, name_ptr, touched


def span(offsets):
    """Collapse touched byte offsets into the field offsets they belong to."""
    return sorted({(o // 8) * 8 for o in offsets})


fails = 0
cases = []  # (label, ret, code, name, touched) — kept so the controls can be scored on the SAME data


def check(label, cond, detail=""):
    global fails
    if cond:
        print("  ok   — %s" % label)
    else:
        fails += 1
        print("  FAIL — %s\n         %s" % (label, detail))


print("Flexo slide 0x%x; decodeMatrix @ slide+0x%x (prologue verified against %s)"
      % (slide, DECODE_MATRIX_VA, SLICE))
print("\n== the four keys the body tests ==")
for name, addr, w0, w1, want_code, want_name in MODEL:
    ret, code, nptr, touched = run_case(w0, w1)
    s = cfstr(nptr)
    cases.append((name, w0, w1, ret, code, s, touched))
    check(
        "%-30s -> (true, %d, %r)" % (name, want_code, want_name),
        ret is True and code == want_code and s == want_name,
        "got ret=%s code=%s name=%r" % (ret, code, s),
    )
    check(
        "  %-28s writes ONLY +0x20 and +0x40" % "",
        span(touched) == [OFF_CODE, OFF_NAME],
        "touched field offsets %s" % [hex(o) for o in span(touched)],
    )

print("\n== the two coding-equation labels in the same array that this body does NOT test ==")
for name, addr, w0, w1 in UNTESTED:
    ret, code, nptr, touched = run_case(w0, w1)
    cases.append((name, w0, w1, ret, code, cfstr(nptr) if ret else None, touched))
    check(
        "%-30s -> false, nothing stored" % name,
        ret is False and touched == [],
        "got ret=%s touched=%s" % (ret, [hex(o) for o in touched]),
    )

print("\n== near misses: one payload word of a real key perturbed ==")
for name, addr, w0, w1, _c, _n in MODEL:
    for tag, a, b in (("word0^1", w0 ^ 1, w1), ("word1^1", w0, w1 ^ 1)):
        ret, code, nptr, touched = run_case(a, b)
        cases.append(("%s/%s" % (name, tag), a, b, ret, code, None, touched))
        check(
            "%-30s %s -> false, nothing stored" % (name, tag),
            ret is False and touched == [],
            "got ret=%s touched=%s" % (ret, [hex(o) for o in touched]),
        )

print("\n== degenerate keys ==")
for tag, a, b in (("all-zero", 0, 0), ("all-ones", (1 << 64) - 1, (1 << 64) - 1)):
    ret, code, nptr, touched = run_case(a, b)
    cases.append((tag, a, b, ret, code, None, touched))
    check("%-30s -> false, nothing stored" % tag, ret is False and touched == [],
          "got ret=%s touched=%s" % (ret, [hex(o) for o in touched]))

# ---------------------------------------------------------------------------------------------
# NEGATIVE CONTROLS — a mutated model must DISAGREE with the live answers already collected.
# A control that cannot fail is not a control (OPS_LOG: "a probe's mutation control that is
# asserted, not demonstrated").
# ---------------------------------------------------------------------------------------------
print("\n== negative controls (each must DISAGREE with the live binary) ==")


def score(model_lookup):
    """Count cases where the mutated model's prediction differs from what the binary did."""
    wrong = 0
    for label, w0, w1, ret, code, name, _t in cases:
        pred = model_lookup(w0, w1)
        if pred is None:
            got = (ret, None, None)
            exp = (False, None, None)
        else:
            got = (ret, code, name)
            exp = (True, pred[0], pred[1])
        if got != exp:
            wrong += 1
    return wrong


def truthful(w0, w1):
    for _n, _a, a0, a1, c, nm in MODEL:
        if (w0, w1) == (a0, a1):
            return (c, nm)
    return None


check("the transcribed model itself agrees with every case", score(truthful) == 0,
      "%d disagreement(s)" % score(truthful))


def swapped_codes(w0, w1):
    t = truthful(w0, w1)
    if t is None:
        return None
    return {2: (1, t[1]), 1: (2, t[1])}.get(t[0], t)


n = score(swapped_codes)
check("swapping the BT.601/BT.709 codes disagrees (2 cases)", n == 2, "%d disagreement(s)" % n)


def no_store_rule(w0, w1):
    """A model in which a MISS also stores (code 0, no name) — i.e. the `xorl %eax,%eax` exit
    reached the shared store. Predicts true for everything."""
    t = truthful(w0, w1)
    return t if t is not None else (0, None)


n = score(no_store_rule)
misses = len(cases) - len(MODEL)
check("dropping the 'a miss stores nothing' rule disagrees (every miss: %d)" % misses,
      n == misses, "%d disagreement(s), expected %d" % (n, misses))


def ycgco_tested(w0, w1):
    """A model that also matched the two untested labels."""
    t = truthful(w0, w1)
    if t is not None:
        return t
    if (w0, w1) == (UNTESTED[0][2], UNTESTED[0][3]):
        return (4, "YCgCo")
    if (w0, w1) == (UNTESTED[1][2], UNTESTED[1][3]):
        return (5, "GBR")
    return None


n = score(ycgco_tested)
check("claiming YCgCo/GBR are matched here disagrees (2 cases)", n == 2, "%d disagreement(s)" % n)

# The ORDER of the chain is NOT observable: the four labels are pairwise distinct, so no input can
# match two of them. Stated rather than measured — an unobservable property must not be reported as
# verified.
pairs = [(w0, w1) for _n, _a, w0, w1, _c, _nm in MODEL]
check("the four labels are pairwise distinct, so the test ORDER is unobservable (not verified)",
      len(set(pairs)) == len(pairs), "two model labels are equal")

print("\nMXFCOLORSPACE_DECODEMATRIX_ORACLE: %s (%d case check(s) failed)"
      % ("PASS" if fails == 0 else "FAIL", fails))
sys.exit(0 if fails == 0 else 1)
