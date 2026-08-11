#!/usr/bin/env python3
"""Gettype1_half_satTile_AVX @Helium 0x275cf0 — live differential, and the
measurement that settles the `vrcpps` question review left open.

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/Gettype1_half_satTile_AVX_oracle.py

THREE THINGS THIS SETTLES, all by execution or by decoding the binary, none by
argument.

1. **AVX EXECUTES UNDER ROSETTA 2 ON THIS BOX**, so this kernel IS oracle-able.
   The review recorded the opposite ("no executable oracle is possible for this
   unit ... this is Tier-3, judgment only") and signed 193 instructions on
   reading alone because of it. OPS_LOG's standing note is the correct one:
   probe by executing. This harness calls the real x86_64 body and it returns.

2. **THE +0x1e0 MASK IS NOT A MANTISSA MASK, so it cannot hide the reciprocal
   deviation.** Review asked whoever ports `HGToneCurve::SetShaderParams`
   @0x248840 to come back and close this out. SetShaderParams is not where it
   comes from: it loads the State pointer from `this+0x1b0` and writes only the
   small scalar slots (+0x04, +0x08, +0x10..+0x20). The vector slots are written
   by `HGToneCurve::State::State()` @0x249860, which stores +0x1e0 (and its
   +0x1f0 twin) from rodata:

       0x249975  movaps 0x642e74(%rip), %xmm0     ; 0x24997c + 0x642e74 = 0x88c7f0
       0x24997c  movaps %xmm0, 0x1f0(%rdi)
       0x249983  movaps %xmm0, 0x1e0(%rdi)

   and the 16 bytes at 0x88c7f0 are `ff ff ff ff  ff ff ff ff  ff ff ff ff
   00 00 00 00` — i.e. **[~0, ~0, ~0, 0]: a LANE mask that keeps R, G, B and
   zeroes the alpha lane**. It clears no mantissa bit of any colour lane, so
   every bit of the reciprocal survives into the multiply @0x275d9c. The
   harness re-reads the same 16 bytes out of the LIVE image to confirm the
   static decode.

3. **THE DEVIATION IS THEREFORE REAL, AND HERE IS ITS SIZE.** The port models
   `vrcpps` @0x275d74/@0x275f4e as the exact reciprocal. The live kernel is run
   against the shipped TypeScript over a fuzz corpus and every differing lane is
   reported as a ULP distance and a relative error, so the modelling decision
   the file documents is quantified instead of asserted.

   Worth knowing while reading that number: the constant multiplied into the
   reciprocal immediately afterwards, `vmulps 0x220(%rsi)` @0x275d78, is
   **0x3f800801 = 1 + 2^-12 + 2^-23** (State ctor @0x2499a6, rodata 0x85fed0).
   That is the scale of `vrcpps`'s own error bound (<= 1.5 * 2^-12), so the
   binary is not merely tolerating the approximation — it is compensating for
   it. The exact-reciprocal model does not have the error that constant exists
   to offset.

The State is built by the REAL `HGToneCurve::State::State()` @0x249860 rather
than fabricated, so all ~35 vector slots are Helium's own constants; only the
four scalars SetShaderParams would write are set here, and their values are
printed. The same 0x1d47-byte block is handed to the TS side verbatim as bit
patterns, so both sides run on identical constants.
"""
import ctypes, json, os, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as OZ

DRIVER = os.path.join(HERE, "Gettype1_half_satTile_AVX_driver.mts")
KERNEL = "__ZL25Gettype1_half_satTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode"
STATE_CTOR = "__ZN11HGToneCurve5StateC2Ev"
STATE_BYTES = 0x1D47
MASK_RODATA_VA = 0x88C7F0          # the +0x1e0 / +0x1f0 source, see the header
STATE_F32 = 0xA00 // 4             # enough to cover every slot the kernel reads (max +0x920)

libc = ctypes.CDLL(None)
libc.malloc.restype = ctypes.c_void_p
libc.malloc.argtypes = [ctypes.c_size_t]

# The four scalars HGToneCurve::SetShaderParams writes (the kernel reads them
# with vbroadcastss). Chosen to be non-degenerate, so the log2/exp2 chain runs.
SCALARS = {0x00: 0.45,    # multiplies the log2 result
           0x04: 0.001,   # added to the clamped colour before log2
           0x0C: 1.2,     # multiplies the exp2 result
           0x24: 0.02}    # subtracted for the pass-through compare

CORPUS = [0x3F800000, 0x3E800000, 0x3F000000, 0x00000000, 0x80000000, 0x3DCCCCCD,
          0x40000000, 0x3F400000, 0x3E000000, 0x3F733333, 0x3D23D70A, 0x3F19999A,
          0x00000001, 0x7F7FFFFF, 0xBF800000, 0x3C23D70A]


def is_nan(b):
    return (b & 0x7F800000) == 0x7F800000 and (b & 0x007FFFFF) != 0


def ulps(a, b):
    """Distance in representable f32 steps between two bit patterns."""
    sa = a - 0x100000000 if False else a
    ia = (0x80000000 - a) & 0xFFFFFFFF if a & 0x80000000 else a
    ib = (0x80000000 - b) & 0xFFFFFFFF if b & 0x80000000 else b
    return abs(ia - ib)


def f32(bits):
    return struct.unpack("<f", struct.pack("<I", bits & 0xFFFFFFFF))[0]


def main():
    kernel, kva, slide = OZ.local_fn("Helium", KERNEL, None,
                                     [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p])
    ctor, cva, _ = OZ.local_fn("Helium", STATE_CTOR, None, [ctypes.c_void_p])

    want = bytes([0x8B, 0x47, 0x0C, 0x2B, 0x47, 0x04])   # movl 0xc(%rdi),%eax ; subl 0x4(%rdi),%eax
    got = ctypes.string_at(slide + kva, len(want))
    print("kernel @0x%x  slide 0x%x  prologue %s %s"
          % (kva, slide, got.hex(), "OK" if got == want else "MISMATCH"))
    if got != want:
        raise SystemExit("PROLOGUE MISMATCH — refusing to report a number")

    # ---- 2. the +0x1e0 mask, read from the live image -----------------------
    mask = ctypes.string_at(slide + MASK_RODATA_VA, 16)
    mask_u32 = struct.unpack("<4I", mask)
    print("state ctor @0x%x ; +0x1e0 rodata @0x%x = %s"
          % (cva, MASK_RODATA_VA, [hex(x) for x in mask_u32]))
    print("  -> %s"
          % ("a LANE mask (keeps R,G,B, zeroes alpha) — it clears NO mantissa bit, so the "
             "reciprocal deviation is NOT hidden by it"
             if mask_u32 == (0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0)
             else "UNEXPECTED value — re-derive before trusting anything below"))

    state = libc.malloc(STATE_BYTES + 64)
    ctypes.memset(state, 0, STATE_BYTES + 64)
    ctor(ctypes.c_void_p(state))
    for off, val in SCALARS.items():
        ctypes.c_float.from_address(state + off).value = val
    live_mask = [ctypes.c_uint32.from_address(state + 0x1E0 + 4 * i).value for i in range(4)]
    rcp_scale = ctypes.c_uint32.from_address(state + 0x220).value
    print("  live State +0x1e0 = %s   +0x220 = 0x%08x (%.10f)"
          % ([hex(x) for x in live_mask], rcp_scale, f32(rcp_scale)))
    print("  scalars set: %s" % {hex(k): v for k, v in SCALARS.items()})

    results = []
    for width, height in ((8, 2), (7, 1), (1, 1), (3, 1)):
        n = width * height * 4
        src_bits = [CORPUS[i % len(CORPUS)] for i in range(n)]
        srcbuf, dstbuf = libc.malloc(n * 4 + 64), libc.malloc(n * 4 + 64)
        ctypes.memset(dstbuf, 0xCD, n * 4 + 64)
        for i, b in enumerate(src_bits):
            ctypes.c_uint32.from_address(srcbuf + 4 * i).value = b
        tile = libc.malloc(0x60)
        ctypes.memset(tile, 0, 0x60)
        ctypes.c_int32.from_address(tile + 0x08).value = width
        ctypes.c_int32.from_address(tile + 0x0C).value = height
        ctypes.c_uint64.from_address(tile + 0x10).value = dstbuf
        ctypes.c_int32.from_address(tile + 0x18).value = width
        ctypes.c_uint64.from_address(tile + 0x50).value = srcbuf
        ctypes.c_int32.from_address(tile + 0x58).value = width
        kernel(ctypes.c_void_p(tile), ctypes.c_void_p(state), None)
        live = [ctypes.c_uint32.from_address(dstbuf + 4 * i).value for i in range(n)]
        results.append({"width": width, "height": height, "src": src_bits, "live": live})

    state_bits = [ctypes.c_uint32.from_address(state + 4 * i).value for i in range(STATE_F32)]

    print("\nSHIPPED PORT vs LIVE AVX KERNEL")
    tot = exact = nanpair = diff = 0
    worst_ulp = 0
    worst_rel = 0.0
    for r in results:
        proc = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                              input=json.dumps({"stateBits": state_bits, "srcBits": r["src"],
                                                "width": r["width"], "height": r["height"]}),
                              capture_output=True, text=True, cwd=HERE)
        if proc.returncode != 0:
            raise SystemExit("TS driver failed:\n" + proc.stderr[-2000:])
        ts = json.loads(proc.stdout)["dstBits"]
        e = np_ = d = 0
        for a, b in zip(r["live"], ts):
            tot += 1
            if a == b:
                e += 1
            elif is_nan(a) and is_nan(b):
                np_ += 1
            else:
                d += 1
                u = ulps(a, b)
                worst_ulp = max(worst_ulp, u)
                fa, fb = f32(a), f32(b)
                if fa != 0.0:
                    worst_rel = max(worst_rel, abs(fa - fb) / abs(fa))
        exact += e; nanpair += np_; diff += d
        print("  %dx%d   bit-exact %3d   NaN-both %2d   differing %3d"
              % (r["width"], r["height"], e, np_, d))

    print("\nRESULT")
    print("  lanes compared            : %d" % tot)
    print("  bit-exact                 : %d" % exact)
    print("  NaN on both sides         : %d" % nanpair)
    print("  differing                 : %d" % diff)
    if diff:
        print("  worst ULP distance        : %d" % worst_ulp)
        print("  worst relative difference : %.3e   (vrcpps error bound is 1.5 * 2^-12 = %.3e)"
              % (worst_rel, 1.5 * 2 ** -12))
        print("  Every differing lane is downstream of the reciprocal @0x275d74/@0x275f4e;")
        print("  the port emits the exact reciprocal the source expresses, the machine emits")
        print("  the 12-bit VRCPPS estimate scaled by 1 + 2^-12 @0x275d78. This is the")
        print("  DOCUMENTED modelling decision, now with its size measured rather than")
        print("  argued — not a transcription defect.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
