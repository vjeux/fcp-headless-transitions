#!/usr/bin/env python3
"""Differential oracle for hg_read_span_4s_m0_gqt_m0_premul @Helium 0x18d200.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/hg_read_span_4s_m0_gqt_m0_premul_oracle.py

The live kernel (a LOCAL `nm` type `t` symbol, reached at dyld slide + 0x18d200 via
ozone_loader.py) and the REAL TypeScript port (through tsx) are given identical
spans, and their float32 outputs are compared as RAW u32 BIT PATTERNS — so a signed
zero or a NaN payload cannot be smeared by float equality, and Python's bare NaN
never has to cross a JSON wire.

Coverage is built around the three code paths the binary has:
  * counts 0..9 and 16/17/31/32 exercise the head loop, the 2-per-iteration main
    loop and the 1-pixel tail in every combination;
  * the source buffer is deliberately placed at each 2-byte misalignment 0..14, so
    the head loop runs for a different number of pixels each time (at src%16 == 2,
    6, 10, 14 the alignment test can NEVER succeed and the whole span goes through
    the head loop — that asymmetry is itself a good test of the transcription);
  * samples include 0, 0xFFFF, and values around the bias so that `v` is negative,
    zero and positive, and biases include 0 and values that drive alpha to exactly
    0 (the max(EPS, a) floor) and negative.

ALIGNMENT: the kernel uses `movaps` for the destination store and `movdqa` for the
main loop's source load, so both buffers must be 16-byte aligned or the process
faults — the harness aligns them explicitly rather than trusting malloc.
"""
import ctypes, json, os, random, struct, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__Z32hg_read_span_4s_m0_gqt_m0_premulPviPKvPK25hgColorGammaTransformDatai"
VA = 0x18D200
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TSX = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
DRIVER = os.path.join(REPO, "raw-port", "re", "oracle",
                      "hg_read_span_4s_m0_gqt_m0_premul_driver.ts")


def aligned(nbytes, align=16):
    """A buffer whose data pointer is `align`-aligned, plus the keepalive."""
    raw = ctypes.create_string_buffer(nbytes + align)
    addr = ctypes.addressof(raw)
    off = (-addr) % align
    return ctypes.cast(addr + off, ctypes.POINTER(ctypes.c_ubyte)), raw, off


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn(
        "Helium", SYM, None,
        [ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    random.seed(20260811)
    counts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 17, 31, 32]
    misaligns = [0, 2, 4, 6, 8, 10, 12, 14]
    biases = [
        [0.0, 0.0, 0.0, 0.0],
        [1.0, 2.0, 3.0, 4.0],
        [-100.0, 0.5, 65535.0, 0.0],
        [32768.0, 32768.0, 32768.0, 32768.0],
    ]

    cases = []
    for count in counts:
        for mis in misaligns:
            for bias in biases:
                n = max(count, 1) * 4 + 8
                samples = []
                for i in range(n):
                    r = random.random()
                    samples.append(0 if r < 0.1 else 0xFFFF if r < 0.2 else random.getrandbits(16))
                cases.append({"srcByteOffset": mis, "samples": samples, "count": count,
                              "biasBits": [struct.unpack('<I', struct.pack('<f', b))[0] for b in bias]})

    # ---- the live kernel -------------------------------------------------
    native = []
    for c in cases:
        nsamp = len(c["samples"])
        srcp, srckeep, _ = aligned(nsamp * 2 + 32)
        # place the source at the requested misalignment from a 16-aligned base
        src_at = ctypes.cast(ctypes.addressof(srckeep.__class__.from_address(
            ctypes.addressof(srcp.contents))) + c["srcByteOffset"], ctypes.c_void_p)
        for i, s in enumerate(c["samples"]):
            ctypes.memmove(ctypes.c_void_p(src_at.value + i * 2),
                           ctypes.byref(ctypes.c_uint16(s)), 2)

        ndst = max(c["count"], 0) * 4 + 8
        dstp, dstkeep, _ = aligned(ndst * 4)
        nan = struct.pack('<f', float('nan'))
        for i in range(ndst):
            ctypes.memmove(ctypes.c_void_p(ctypes.addressof(dstp.contents) + i * 4), nan, 4)

        datap, datakeep, _ = aligned(0x110)
        for i, bits in enumerate(c["biasBits"]):
            ctypes.memmove(ctypes.c_void_p(ctypes.addressof(datap.contents) + 0x100 + i * 4),
                           struct.pack('<I', bits), 4)

        fn(ctypes.c_void_p(ctypes.addressof(dstp.contents)), c["count"], src_at,
           ctypes.c_void_p(ctypes.addressof(datap.contents)), 0)
        out = ctypes.string_at(ctypes.addressof(dstp.contents), ndst * 4)
        native.append(list(struct.unpack(f"<{ndst}I", out)))

    # ---- the real TypeScript --------------------------------------------
    p = subprocess.run([TSX, DRIVER], input=json.dumps(cases), capture_output=True,
                       text=True, cwd=REPO)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    ts = json.loads(p.stdout)

    lanes = bad = 0
    bad_cases = 0
    fails = []
    for c, nat, port in zip(cases, native, ts):
        mismatch = 0
        for i, (x, y) in enumerate(zip(nat, port)):
            lanes += 1
            if x != y:
                bad += 1
                mismatch += 1
                if len(fails) < 6:
                    fails.append((c["count"], c["srcByteOffset"], i, hex(x), hex(y)))
        if mismatch:
            bad_cases += 1

    print(f"SPANS={len(cases)} LANES={lanes} DIVERGED_LANES={bad} DIVERGED_SPANS={bad_cases}")
    for f in fails:
        print("  FAIL count=%d misalign=%d lane=%d native=%s port=%s" % f)

    # ---- negative controls: recompute in DOUBLE, and with the mask swapped ----
    def model(c, double=False, swap_masks=False):
        bias = [struct.unpack('<f', struct.pack('<I', b))[0] for b in c["biasBits"]]
        f32 = (lambda x: x) if double else (lambda x: struct.unpack('<f', struct.pack('<f', x))[0])
        SCALE = struct.unpack('<f', struct.pack('<I', 0x37800080))[0]
        EPS = struct.unpack('<f', struct.pack('<I', 0x33D6BF95))[0]
        A = struct.unpack('<f', struct.pack('<I', 0x412BF69C))[0]
        B = struct.unpack('<f', struct.pack('<I', 0x40B5E9BF))[0]
        C = struct.unpack('<f', struct.pack('<I', 0x4131FB48))[0]
        D = struct.unpack('<f', struct.pack('<I', 0x3F991C0F))[0]
        E = struct.unpack('<f', struct.pack('<I', 0x40A39964))[0]
        out = []
        for px in range(max(c["count"], 0)):
            v = [f32(f32(c["samples"][px * 4 + k] - bias[k]) * SCALE) for k in range(4)]
            a = v[3]
            den0 = max(EPS, a)
            for lane in range(4):
                t = f32(v[lane] / den0)
                t2 = f32(t * t)
                den = f32(f32(B * t2) + f32(f32(A * t) + 1.0))
                q = f32(t2 / den)
                num = f32(f32(E * t2) + f32(f32(C * t) + D))
                curve = f32(f32(num * q) * a)
                am = [0, 0, 0, 1][lane]
                rm = [1, 1, 1, 0][lane]
                if swap_masks:
                    am, rm = rm, am
                out.append(struct.unpack('<I', struct.pack('<f', f32(f32(curve * rm) + f32(v[lane] * am))))[0])
        return out

    for name, kw in (("all-double arithmetic (one final rounding)", {"double": True}),
                     ("alpha/rgb masks swapped", {"swap_masks": True})):
        w = tot = 0
        for c, nat in zip(cases, native):
            m = model(c, **kw)
            for i, x in enumerate(m):
                tot += 1
                if x != nat[i]:
                    w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{tot} lanes wrong")

    ok = bad == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
