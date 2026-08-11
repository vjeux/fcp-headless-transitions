DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
#!/usr/bin/env python3
"""HgcToneParamCurve2::RenderTile_AVX @Helium 0x3764d0 — live differential.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HgcToneParamCurve2_oracle.py

THE FIRST THING THIS SETTLES, because it is the reason no AVX kernel in this
repo has been oracled: **AVX EXECUTES UNDER ROSETTA 2 ON THIS BOX.** The review
of PR #335 recorded the opposite ("Rosetta 2 does not implement AVX", so the
symbol "is NOT oracle-verifiable on this box") and signed a 160-instruction
kernel on reading alone for that reason. Measured instead of inferred: this
harness calls the real x86_64 kernel, which runs ~150 AVX instructions
(`vmovups ymm`, `vroundps`, `vblendvps`, `vcmpltps`, `vextractf128`, ...), and
the process survives and returns. OPS_LOG's standing note — "AVX kernels DO run
under Rosetta; probe by executing, never by inferring from sysctl" — is the
correct one.

WHAT IS MEASURED. The kernel is a leaf: no call of any kind in its body, all
state is `this+0x198` (the constant pool) and the HGTile it is handed. So it can
be driven directly:

  * the POOL is not fabricated and not taken from the port — the real ctor
    `__ZN18HgcToneParamCurve2C2Ev` @0x376bf0 fills it from Helium's own rodata,
    and the real `SetParameter` @0x376f30 writes the five runtime parameters.
    The 184 floats are then read out of the live object and handed to the TS
    side as bit patterns, so both sides run on the SAME constants and the
    comparison tests the transcription rather than the constant table;
  * the SOURCE PIXELS are a fuzz corpus of bit patterns (ordinary values, both
    zeros, denormals, huge values, negatives, infinities and a NaN), so the
    log2/exp2 pipeline is exercised where it branches;
  * the OUTPUT is compared as raw u32 BIT PATTERNS, which is the only exact way
    to compare signed zero — and NaN-on-both-sides is classified separately and
    kept out of the verdict, because x86's default NaN has the sign bit set and
    JavaScript's does not (OPS_LOG).

P0 IS GIVEN FOUR DIFFERENT COMPONENTS ON PURPOSE. That is the defect review
found: `vmulps (%r14), %ymm2, %ymm2` @0x37660d is elementwise, so lane L must
multiply by component L&3 of the float4 at p+0x00, and the port used component 0
for every lane. With P0 = (a, b, c, d) all distinct, green and blue diverge on
every pixel unless the fix is present. The pre-fix code is run as a MUTANT — the
harness writes a copy of the module with exactly that one edit reversed — so the
fix is priced rather than asserted.

NOT COVERED, stated plainly: the kernel's own `RenderTile` @0x376820 sibling,
the ctor and SetParameter (used here as instruments, not verified), and any
tile geometry beyond the widths below.
"""
import ctypes, json, os, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as OZ

SRC = os.path.abspath(os.path.join(HERE, "..", "..", "src", "render"))
PORT = os.path.join(SRC, "HgcToneParamCurve2.ts")
MUTANT = os.path.join(SRC, "__mutant_HgcToneParamCurve2.ts")  # transient; removed in finally
DRIVER = os.path.join(HERE, "HgcToneParamCurve2_driver.mts")

KERNEL = "__ZN18HgcToneParamCurve214RenderTile_AVXEP6HGTile"
CTOR = "__ZN18HgcToneParamCurve2C2Ev"
SETPARAM = "__ZN18HgcToneParamCurve212SetParameterEiffff"
POOL_F32 = 0x2E0 // 4          # 184 floats, the block the ctor allocates
POOL_OFF = 0x198               # this->pool  (movq 0x198(%rdi),%r14 @0x376547)

libc = ctypes.CDLL(None)
libc.malloc.restype = ctypes.c_void_p
libc.malloc.argtypes = [ctypes.c_size_t]

# Five parameters, each a float4 with four DIFFERENT components — see the header.
PARAMS = [
    (0, 1.5, 0.75, 2.25, 0.5),      # P0 — the multiply under review @0x37660d
    (1, 1.0, 0.9, 1.1, 1.0),        # P1 — x * P1
    (2, 0.001, 0.01, 0.1, 0.0),     # P2 — + P2
    (3, 0.02, 0.03, 0.04, 0.0),     # P3 — the blended floor
    (4, 0.25, 0.35, 0.45, 0.0),     # P4 — the (x - P4) < 0 test
]

# A fuzz corpus of f32 bit patterns: ordinary values, both zeros, a denormal,
# large and small magnitudes, negatives, infinities and a quiet NaN.
CORPUS = [0x3F800000, 0x00000000, 0x80000000, 0x3E800000, 0x40490FDB, 0x00000001,
          0x7F7FFFFF, 0xBF800000, 0x3D4CCCCD, 0x7F800000, 0xFF800000, 0x7FC00000,
          0x41200000, 0xC1200000, 0x3F000000, 0x38D1B717]


def f32(bits):
    return struct.unpack("<f", struct.pack("<I", bits & 0xFFFFFFFF))[0]


def is_nan(bits):
    return (bits & 0x7F800000) == 0x7F800000 and (bits & 0x007FFFFF) != 0


def run_ts(module_path, payload):
    proc = subprocess.run(["node", "--experimental-strip-types", DRIVER, module_path],
                          input=json.dumps(payload), capture_output=True, text=True, cwd=HERE, timeout=DRIVER_TIMEOUT)
    if proc.returncode != 0:
        raise SystemExit("TS driver failed (%s):\n%s" % (module_path, proc.stderr[-2000:]))
    return json.loads(proc.stdout)


def main():
    kernel, kva, slide = OZ.local_fn("Helium", KERNEL, ctypes.c_int,
                                     [ctypes.c_void_p, ctypes.c_void_p])
    ctor, cva, _ = OZ.local_fn("Helium", CTOR, None, [ctypes.c_void_p])
    setp, sva, _ = OZ.local_fn("Helium", SETPARAM, ctypes.c_int,
                               [ctypes.c_void_p, ctypes.c_int, ctypes.c_float,
                                ctypes.c_float, ctypes.c_float, ctypes.c_float])

    # Self-check: the kernel's first two instructions, from the transcription.
    want = bytes([0x8B, 0x46, 0x0C, 0x2B, 0x46, 0x04])   # movl 0xc(%rsi),%eax ; subl 0x4(%rsi),%eax
    got = ctypes.string_at(slide + kva, len(want))
    print("kernel @0x%x  slide 0x%x  prologue %s %s"
          % (kva, slide, got.hex(), "OK" if got == want else "MISMATCH"))
    if got != want:
        raise SystemExit("PROLOGUE MISMATCH — refusing to report a number")

    # ---- build a real node with a real pool ---------------------------------
    obj = libc.malloc(0x400)
    ctypes.memset(obj, 0, 0x400)
    ctor(ctypes.c_void_p(obj))
    pool = ctypes.c_uint64.from_address(obj + POOL_OFF).value
    print("ctor @0x%x installed pool at 0x%x" % (cva, pool))
    if not pool:
        raise SystemExit("the ctor did not install a pool — refusing to guess one")
    for (i, x, y, z, w) in PARAMS:
        rc = setp(ctypes.c_void_p(obj), i, x, y, z, w)
        if rc != 1:
            raise SystemExit("SetParameter(%d) returned %d" % (i, rc))
    pool_bits = [ctypes.c_uint32.from_address(pool + 4 * i).value for i in range(POOL_F32)]
    print("SetParameter @0x%x wrote P0..P4; pool p+0x00 = %s"
          % (sva, [f32(b) for b in pool_bits[:4]]))

    results = []
    # Widths chosen to exercise the pair loop, the single-pixel tail, and the
    # width < 2 path that skips the pair loop entirely (@0x37652b).
    for width, height in ((8, 2), (7, 1), (1, 1), (2, 1), (3, 2)):
        n = width * height * 4
        src_bits = [CORPUS[i % len(CORPUS)] for i in range(n)]
        srcbuf = libc.malloc(n * 4 + 64)
        dstbuf = libc.malloc(n * 4 + 64)
        ctypes.memset(dstbuf, 0xCD, n * 4 + 64)
        for i, b in enumerate(src_bits):
            ctypes.c_uint32.from_address(srcbuf + 4 * i).value = b

        tile = libc.malloc(0x60)
        ctypes.memset(tile, 0, 0x60)
        ctypes.c_int32.from_address(tile + 0x00).value = 0
        ctypes.c_int32.from_address(tile + 0x04).value = 0
        ctypes.c_int32.from_address(tile + 0x08).value = width
        ctypes.c_int32.from_address(tile + 0x0C).value = height
        ctypes.c_uint64.from_address(tile + 0x10).value = dstbuf
        ctypes.c_int32.from_address(tile + 0x18).value = width
        ctypes.c_uint64.from_address(tile + 0x50).value = srcbuf
        ctypes.c_int32.from_address(tile + 0x58).value = width

        rc = kernel(ctypes.c_void_p(obj), ctypes.c_void_p(tile))
        live = [ctypes.c_uint32.from_address(dstbuf + 4 * i).value for i in range(n)]
        results.append({"width": width, "height": height, "rc": rc,
                        "src_bits": src_bits, "live": live})

    payloadfor = lambda r: {"poolBits": pool_bits, "srcBits": r["src_bits"],
                            "width": r["width"], "height": r["height"],
                            "srcStride": r["width"], "outStride": r["width"]}

    # ---- shipped port --------------------------------------------------------
    print("\nSHIPPED PORT vs LIVE AVX KERNEL")
    total = exact = nanpair = diverged = 0
    for r in results:
        ts = run_ts(PORT, payloadfor(r))
        e = np = d = 0
        for a, b in zip(r["live"], ts["dstBits"]):
            total += 1
            if a == b:
                e += 1
            elif is_nan(a) and is_nan(b):
                np += 1
            else:
                d += 1
        exact += e; nanpair += np; diverged += d
        print("  %dx%d  rc live=%s ts=%s   bit-exact %3d   NaN-both %2d   DIVERGED %2d"
              % (r["width"], r["height"], r["rc"], ts["rc"], e, np, d))

    # ---- the pre-fix mutant --------------------------------------------------
    print("\nNEGATIVE CONTROL — the pre-fix model: p[0] instead of p[0 + c] at")
    print("  @0x37660d (8-lane) and @0x376788 (4-lane), i.e. lane 0's component")
    print("  of P0 for every lane. Everything else identical.")
    src_text = open(PORT).read()
    mutated = src_text.replace("v = Math.fround(v * (p[0 + c] as number));",
                               "v = Math.fround(v * (p[0] as number));")
    if mutated == src_text:
        raise SystemExit("the mutant edit matched nothing — the control would be dead")
    if mutated.count("v = Math.fround(v * (p[0] as number));") != 2:
        raise SystemExit("the mutant edit did not match BOTH sites — check the count")
    killed = mtotal = 0
    try:
        open(MUTANT, "w").write(mutated)
        for r in results:
            ts = run_ts(MUTANT, payloadfor(r))
            k = 0
            for a, b in zip(r["live"], ts["dstBits"]):
                mtotal += 1
                if a != b and not (is_nan(a) and is_nan(b)):
                    k += 1
            killed += k
            print("  %dx%d  mutant disagrees with the live kernel on %d of %d lanes"
                  % (r["width"], r["height"], k, len(r["live"])))
    finally:
        if os.path.exists(MUTANT):
            os.remove(MUTANT)

    print("\nRESULT")
    print("  lanes compared        : %d" % total)
    print("  bit-exact             : %d" % exact)
    print("  NaN on both sides     : %d  (sign-only; x86 default NaN is 0xffc00000,"
          " JS canonicalises to 0x7fc00000 — classified, not hidden)" % nanpair)
    print("  REAL divergences      : %d" % diverged)
    print("  pre-fix mutant killed : %d of %d lanes" % (killed, mtotal))
    if killed == 0:
        print("  WARNING: a control that kills nothing means this harness is blind to the")
        print("           lane index, not that the mutant is equivalent — treat as FAILED.")
    return 0 if (diverged == 0 and killed > 0) else 1


if __name__ == "__main__":
    sys.exit(main())
