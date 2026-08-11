#!/usr/bin/env python3
"""Differential oracle for hg_span_read_1h(float vector[4]*, int, void const*) @Helium 0x1e6d00.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/hg_span_read_1h_oracle.py

Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). The symbol is a
LOCAL (`t`, an `__ZL` internal-linkage name), so it is called at x86_64 vmaddr + the loaded
image's slide. Addresses come from the cached inventory, never from nm on the fat binary.

Coverage:
  * EXHAUSTIVE — one call over all 65,536 possible half bit patterns, comparing all 262,144
    output floats bit-exactly. This is what pins the Inf/NaN/denormal behaviour of the
    shift-mask-scale trick, which a "proper" half decoder would get wrong.
  * small n — 0, negative, and 1..9, to exercise the odd-count peel and the count-down-by-2
    loop, each with a sentinel-filled destination so a write past `count` is caught.
"""
import ctypes
import json
import os
import platform
import struct
import subprocess
import sys

FW = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
      "Helium.framework/Versions/A/Helium")
SYM, VMADDR = "__ZL15hg_span_read_1hPDv4_fiPKv", 0x1e6d00
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Helium.syms.txt")
SCALE = float(2 ** 112)          # @Helium 0x85f8a0, all four lanes
BASE = (0.0, 0.0, 0.0, struct.unpack("<f", struct.pack("<I", 0x07800000))[0])  # @0x85f890
SENTINEL = -777.0


def image_slide(path):
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    for i in range(libc._dyld_image_count()):
        if libc._dyld_get_image_name(i).decode() == path:
            return int(libc._dyld_get_image_vmaddr_slide(i) or 0)
    raise SystemExit("image not loaded: " + path)


def f32(x):
    """Round to IEEE binary32. An out-of-range magnitude saturates to +/-inf, which is what
    `mulps` does; struct.pack raises OverflowError instead, so handle that explicitly (only the
    deliberately-broken negative-control mutants can reach it)."""
    try:
        return struct.unpack("<f", struct.pack("<f", x))[0]
    except OverflowError:
        return float("-inf") if x < 0 else float("inf")


def model_lane0(h):
    """movswl ; shll $13 ; andl $0x8fffe000 ; pinsrd lane 0 ; mulps 2**112."""
    v = h - 0x10000 if h & 0x8000 else h          # movswl: sign-extend the 16-bit half
    bits = ((v << 13) & 0xFFFFFFFF) & 0x8FFFE000  # shll $0xd then andl
    as_f = struct.unpack("<f", struct.pack("<I", bits))[0]
    return f32(as_f * SCALE)


def model(halves, count):
    out = []
    for i in range(count):
        out.append(model_lane0(halves[i]))
        out.append(f32(BASE[1] * SCALE))
        out.append(f32(BASE[2] * SCALE))
        out.append(f32(BASE[3] * SCALE))
    return out


def bits_of(xs):
    return [struct.pack("<f", x) for x in xs]


def hexbits(xs):
    """The float32 bit pattern as the TS driver prints it: numeric hex, NOT packed-LE bytes.
    (Comparing `struct.pack(...).hex()` against the driver's value made every span 'diverge'
    with live=0000803f vs ts=3f800000 — the same 1.0, byte-reversed.)"""
    return ["%08x" % struct.unpack("<I", struct.pack("<f", x))[0] for x in xs]


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING to run natively (%s): re-run under arch -x86_64"
                         % platform.machine())
    va = None
    for line in open(os.path.normpath(INVENTORY)):
        p = line.split()
        if len(p) == 3 and p[2] == SYM:
            va = int(p[0], 16)
    assert va == VMADDR, "vmaddr moved: %r != 0x%x" % (va, VMADDR)
    ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    slide = image_slide(FW)
    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p)(va + slide)
    print("calling %s\n  at 0x%x  (x86_64 vmaddr 0x%x + slide 0x%x)" % (SYM, va + slide, va, slide))

    def call(halves, count, pad=8):
        n_all = len(halves)
        src = ctypes.create_string_buffer(struct.pack("<%dH" % n_all, *halves), n_all * 2)
        lanes = max(count, 0) * 4 + pad * 4
        dstbuf = ctypes.create_string_buffer(lanes * 4 + 64)
        daddr = (ctypes.addressof(dstbuf) + 15) & ~15    # movaps needs 16-byte alignment
        ctypes.memmove(daddr, struct.pack("<%df" % lanes, *([SENTINEL] * lanes)), lanes * 4)
        fn(daddr, count, ctypes.addressof(src))
        return list(struct.unpack("<%df" % lanes, ctypes.string_at(daddr, lanes * 4)))

    # ── EXHAUSTIVE: every half bit pattern, in one span ──
    allh = list(range(0x10000))
    got = call(allh, len(allh))
    want = model(allh, len(allh)) + [SENTINEL] * 32
    div = sum(1 for a, b in zip(bits_of(got), bits_of(want)) if a != b)
    if div:
        for i, (a, b) in enumerate(zip(bits_of(got), bits_of(want))):
            if a != b:
                print("  first DIV at lane %d (half 0x%04x, component %d): live=%s model=%s"
                      % (i, allh[i // 4], i % 4, a.hex(), b.hex()))
                break
    print("EXHAUSTIVE 65536 halves -> %d output floats, %d divergences" % (len(got), div))

    # what the trick does to the special classes — recorded, not asserted
    for name, h in (("+0.0", 0x0000), ("-0.0", 0x8000), ("1.0", 0x3C00), ("-2.0", 0xC000),
                    ("smallest denormal", 0x0001), ("largest denormal", 0x03FF),
                    ("+Inf", 0x7C00), ("-Inf", 0xFC00), ("NaN", 0x7E00), ("max normal", 0x7BFF)):
        print("  half %-18s 0x%04x -> % .10g" % (name, h, call([h], 1)[0]))

    # ── small n: the odd peel, the by-2 loop, and no write past `count` ──
    small_div = overrun = 0
    for count in (0, -1, -7, 1, 2, 3, 4, 5, 6, 7, 8, 9):
        halves = [(0x3C00 + i * 37) & 0xFFFF for i in range(max(count, 0) + 4)] or [0]
        g = call(halves, count)
        w = model(halves, max(count, 0)) + [SENTINEL] * 32
        if bits_of(g) != bits_of(w):
            small_div += 1
            print("  SMALL DIV count=%d" % count)
        tail = g[max(count, 0) * 4:]
        if any(struct.pack("<f", t) != struct.pack("<f", SENTINEL) for t in tail):
            overrun += 1
            print("  OVERRUN count=%d wrote past the span" % count)
    print("small-n cases: 12, divergences=%d, overruns=%d" % (small_div, overrun))

    # ── negative controls ──
    # Over ALL 65,536 halves, NOT a prefix: the first 1024 patterns are all sign-bit-clear and
    # all mask-safe, so scoring the controls on them reported 0 for two real defects. A zero
    # here means the CORPUS is wrong, not that the mutant is harmless (OPS_LOG, worker 5).
    controls = {}
    ref = bits_of(got[:len(allh) * 4])

    def mutant(kind):
        out = []
        for h in allh:
            v = h - 0x10000 if h & 0x8000 else h
            if kind == "nomask":
                bits = (v << 13) & 0xFFFFFFFF
            elif kind == "zeroext":
                bits = ((h << 13) & 0xFFFFFFFF) & 0x8FFFE000
            elif kind == "shift12":
                bits = ((v << 12) & 0xFFFFFFFF) & 0x8FFFE000
            else:
                bits = ((v << 13) & 0xFFFFFFFF) & 0x8FFFE000
            a = struct.unpack("<f", struct.pack("<I", bits))[0]
            lane0 = f32(a * SCALE) if kind != "noscale" else f32(a)
            out += [lane0, 0.0, 0.0, 1.0 if kind != "noscale" else BASE[3]]
        return bits_of(out)

    for kind, label in (("nomask", "drops the 0x8fffe000 mask"),
                        ("zeroext", "zero-extends the half instead of movswl"),
                        ("shift12", "shifts left 12 instead of 13"),
                        ("noscale", "omits the 2**112 multiply")):
        m = mutant(kind)
        controls[label] = sum(1 for a, b in zip(ref, m) if a != b)
    print("negative controls (higher = the wrong port would have been caught): %r" % controls)

    # ── the SHIPPED TS port, over the same inputs, through the driver ──
    ts_div = 0
    if "--no-ts" not in sys.argv:
        wire = [dict(count=len(allh), halves=allh, lanes=len(allh) * 4 + 32)]
        for count in (0, -1, -7, 1, 2, 3, 4, 5, 6, 7, 8, 9):
            hv = [(0x3C00 + i * 37) & 0xFFFF for i in range(max(count, 0) + 4)] or [0]
            wire.append(dict(count=count, halves=hv, lanes=max(count, 0) * 4 + 32))
        here = os.path.dirname(os.path.abspath(__file__))
        rawport = os.path.abspath(os.path.join(here, "..", ".."))
        p = subprocess.run(["npx", "tsx", os.path.join(here, "hg_span_read_1h_driver.ts")],
                           cwd=rawport, input=json.dumps(wire), capture_output=True, text=True)
        if p.returncode != 0:
            print("TS driver failed:\n" + p.stdout[-2000:] + p.stderr[-2000:])
            return 2
        ts = json.loads(p.stdout)
        native = [hexbits(got)]
        for count in (0, -1, -7, 1, 2, 3, 4, 5, 6, 7, 8, 9):
            hv = [(0x3C00 + i * 37) & 0xFFFF for i in range(max(count, 0) + 4)] or [0]
            native.append(hexbits(call(hv, count)))
        for i, (a, b) in enumerate(zip(native, ts)):
            if a != b:
                ts_div += 1
                j = next(k for k in range(min(len(a), len(b))) if a[k] != b[k])
                print("  TS DIV case=%d lane=%d live=%s ts=%s" % (i, j, a[j], b[j]))
        print("TS port: %d spans (%d output floats), %d divergent spans"
              % (len(ts), sum(len(x) for x in ts), ts_div))

    ok = (div == 0 and small_div == 0 and overrun == 0 and ts_div == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
