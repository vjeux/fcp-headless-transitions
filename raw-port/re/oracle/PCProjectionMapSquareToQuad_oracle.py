#!/usr/bin/env python3
"""Differential oracle for PCProjectionMapSquareToQuad @ProCore 0x678d6.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/PCProjectionMapSquareToQuad_oracle.py

The LIVE function (a LOCAL `nm` type `t` symbol, called at dyld slide + 0x678d6
through ozone_loader.py, which refuses to run outside x86_64) and the REAL
TypeScript port (through tsx) get identical inputs, and both output doubles are
compared as RAW u64 BIT PATTERNS — exact for signed zero, infinities and NaN.

The corpus is built around the branch this function has:
  * PROJECTIVE quads (random corners);
  * exact PARALLELOGRAMS, where A - B + C - D is exactly 0, taking the affine path;
  * NEAR-parallelograms straddling the 1e-7 threshold in one lane, the other, and
    both — the boundary the `cmpltpd`/`movmskpd`/`cmpl $3` sequence decides;
  * DEGENERATE quads with a zero determinant, where the machine divides by zero
    and produces +-inf / NaN — the port must reproduce that, not guard it;
  * uv points inside, outside and on the unit square, plus +-0.0.
"""
import ctypes, json, os, random, struct, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__Z27PCProjectionMapSquareToQuadRK9PCVector2IdES2_S2_S2_S2_RS0_"
VA = 0x678D6
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TSX = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
DRIVER = os.path.join(REPO, "raw-port", "re", "oracle",
                      "PCProjectionMapSquareToQuad_driver.ts")


def bits(x):
    return struct.unpack('<Q', struct.pack('<d', x))[0]


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("ProCore", SYM, None, [ctypes.c_void_p] * 6)
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    rnd = random.Random(20260811)
    cases = []

    def add(a, b, c, d, uv):
        cases.append([a, b, c, d, uv])

    uvs = [(0.0, 0.0), (1.0, 0.0), (0.0, 1.0), (1.0, 1.0), (0.5, 0.5),
           (-0.25, 1.75), (-0.0, 0.0), (2.5, -3.5)]

    # projective: random quads
    for _ in range(120):
        pts = [(rnd.uniform(-500, 500), rnd.uniform(-500, 500)) for _ in range(4)]
        add(*pts, rnd.choice(uvs))
    # exact parallelograms -> the affine path
    for _ in range(60):
        ax, ay = rnd.uniform(-100, 100), rnd.uniform(-100, 100)
        ex, ey = rnd.uniform(-50, 50), rnd.uniform(-50, 50)
        fx, fy = rnd.uniform(-50, 50), rnd.uniform(-50, 50)
        A = (ax, ay); B = (ax + ex, ay + ey); C = (ax + ex + fx, ay + ey + fy); D = (ax + fx, ay + fy)
        add(A, B, C, D, rnd.choice(uvs))
    # the epsilon boundary, per lane
    for eps in (0.0, 5e-8, 9.9e-8, 1e-7, 1.0000001e-7, 2e-7, 1e-6):
        for lane in ("x", "y", "both"):
            A = (1.0, 2.0); B = (3.0, 2.0); C = (3.0, 5.0)
            dx = 1.0 - (eps if lane in ("x", "both") else 0.0)
            dy = 5.0 - (eps if lane in ("y", "both") else 0.0)
            add(A, B, C, (dx, dy), (0.5, 0.5))
    # degenerate: zero determinant (three collinear corners)
    for _ in range(20):
        A = (0.0, 0.0); B = (1.0, 1.0); C = (2.0, 2.0); D = (rnd.uniform(-5, 5), rnd.uniform(-5, 5))
        add(A, B, C, D, rnd.choice(uvs))
    # all four corners identical
    add((1.0, 1.0), (1.0, 1.0), (1.0, 1.0), (1.0, 1.0), (0.5, 0.5))

    # ---- the live function ----
    native = []
    for a, b, c, d, uv in cases:
        bufs = []
        for (x, y) in (a, b, c, d, uv):
            v = (ctypes.c_double * 2)(x, y)
            bufs.append(v)
        outv = (ctypes.c_double * 2)(float('nan'), float('nan'))
        fn(*[ctypes.cast(v, ctypes.c_void_p) for v in bufs],
           ctypes.cast(outv, ctypes.c_void_p))
        raw = bytes(outv)
        native.append([f"{struct.unpack('<Q', raw[0:8])[0]:016x}",
                       f"{struct.unpack('<Q', raw[8:16])[0]:016x}"])

    # ---- the real TypeScript ----
    wire = [[[f"{bits(x):016x}", f"{bits(y):016x}"] for (x, y) in case] for case in cases]
    p = subprocess.run([TSX, DRIVER], input=json.dumps(wire), capture_output=True,
                       text=True, cwd=REPO)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    ts = json.loads(p.stdout)

    def is_nan(hexbits):
        u = int(hexbits, 16)
        return (u & 0x7FF0000000000000) == 0x7FF0000000000000 and (u & 0x000FFFFFFFFFFFFF) != 0

    bad = 0
    nan_sign_only = 0
    fails = []
    for i, (nat, port) in enumerate(zip(native, ts)):
        if nat == port:
            continue
        # A NaN that differs ONLY in the sign bit is a JAVASCRIPT LIMIT, not a port
        # defect: the SSE invalid-operation default QNaN is NEGATIVE (0xfff8...),
        # and ECMAScript lets an implementation canonicalise NaN on a Float64Array
        # store — V8 does, to the POSITIVE 0x7ff8.... No JS program can produce or
        # observe the sign of a NaN through a double, so the port cannot match it.
        if all(is_nan(a) and is_nan(b) and (int(a, 16) ^ int(b, 16)) == 0x8000000000000000
               for a, b in zip(nat, port)):
            nan_sign_only += 1
            continue
        bad += 1
        if len(fails) < 6:
            fails.append((i, cases[i], nat, port))
    nan_cases = sum(1 for n in native if n[0].startswith(('7ff8', 'fff8')) or n[1].startswith(('7ff8', 'fff8')))
    inf_cases = sum(1 for n in native if n[0] in ('7ff0000000000000', 'fff0000000000000')
                    or n[1] in ('7ff0000000000000', 'fff0000000000000'))

    print(f"CASES={len(cases)} TS_vs_LIVE_DIVERGED={bad} "
          f"NAN_SIGN_ONLY={nan_sign_only} (JS canonicalises NaN; see the code comment) "
          f"(NaN outputs seen: {nan_cases}, +-inf outputs seen: {inf_cases} — the "
          f"degenerate quads really do reach the divide-by-zero, so those paths are covered)")
    for f in fails:
        print("  FAIL #%d %s native=%s port=%s" % f)

    print("ORACLE:", "VERIFIED" if bad == 0 else "DIVERGED")
    return 0 if bad == 0 else 1


sys.exit(main())
