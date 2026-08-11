#!/usr/bin/env python3
"""Differential oracle for PCSolveQuadratic(double,double,double,int*,double*)
@ProCore 0xc0582 — bit-exact.

MUST run under `arch -x86_64 /usr/bin/python3`: the port cites x86_64 offsets, and
this is floating-point code where the two slices can legitimately differ (arm64
may contract a multiply-add that x86_64 does not, moving the last ulp — OPS_LOG).

The model below is the TypeScript port's logic, expressed on Python floats, which
are the same IEEE-754 doubles. Comparison is on RAW BIT PATTERNS, so signed zero
and the last ulp count.
"""
import ctypes, math, platform, random, struct, sys

assert platform.machine() == 'x86_64', f"run under arch -x86_64, got {platform.machine()}"

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore"
EPS = 1e-07          # @ProCore 0x122880
K_DISC = -4.0        # @ProCore 0x122a88
C_HALF = -0.5        # @ProCore 0x1225a8

lib = ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
fn = getattr(lib, "_Z16PCSolveQuadraticdddPiPd")
fn.restype = None
fn.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double,
               ctypes.POINTER(ctypes.c_int32), ctypes.c_void_p]

POISON = 0x7ff8dead0000beef      # a quiet-NaN pattern, so a stray write is visible



def fdiv(x, y):
    """IEEE-754 division. Python raises on division by zero where the machine
    (and TypeScript's `/`) produce a signed infinity or NaN, so the harness has
    to spell the hardware behaviour out; the PORT itself just writes `x / y`."""
    try:
        return x / y
    except ZeroDivisionError:
        if x != x or y != y:
            return float("nan")
        if x == 0.0:
            return float("nan")                       # 0/0 -> NaN
        sign = math.copysign(1.0, x) * math.copysign(1.0, y)
        return math.copysign(float("inf"), sign)


def model(a, b, c):
    """Returns (count, [roots written])  — exactly what the TS port computes."""
    # @0xc0586..0xc059e — |a| vs EPS; `jbe` is taken when EPS <= |a| OR unordered
    if not (EPS > abs(a)):
        # ---- quadratic path @0xc05c9 -------------------------------------
        # @0xc05c9/@0xc05cd  b*b   ; @0xc05d1..0xc05e1  disc = (-4.0*a)*c + b*b
        disc = ((K_DISC * a) * c) + (b * b)
        # @0xc05e9/@0xc05ed — `jbe` taken when 0 <= disc OR unordered (NaN)
        if 0.0 > disc:
            return 0, []                                   # @0xc05ef
        s = math.sqrt(disc) if disc == disc else disc       # @0xc05f3 sqrtsd
        s = abs(s)                                          # @0xc05ff andpd abs
        # @0xc0603..0xc0617 — q = (b + copysign(s, b)) * -0.5
        q = (b + math.copysign(s, b)) * C_HALF
        r0 = fdiv(q, a)                                          # @0xc0627 divpd lane 0
        r1 = fdiv(c, q)                                          # @0xc0627 divpd lane 1
        # @0xc062f..0xc0640 — count = 1 + (EPS <= |r0 - r1| OR unordered)
        d = abs(r0 - r1)
        return (2 if not (EPS > d) else 1), [r0, r1]
    # ---- linear path @0xc05a0 --------------------------------------------
    if EPS > abs(b):                                        # @0xc05b0 `ja`
        return 0, []                                        # @0xc05ef
    return 1, [fdiv(-c, b)]                                    # @0xc05b2..0xc05c2


def bits(x):
    return struct.unpack("<Q", struct.pack("<d", x))[0]


def call_live(a, b, c):
    cnt = ctypes.c_int32(-12345)
    roots = (ctypes.c_uint64 * 4)(POISON, POISON, POISON, POISON)
    fn(a, b, c, ctypes.byref(cnt), ctypes.cast(roots, ctypes.c_void_p))
    return cnt.value, [roots[0], roots[1], roots[2], roots[3]]


rng = random.Random(20260811)
cases = div = 0
counts = {0: 0, 1: 0, 2: 0}
nan_only = 0


def run(a, b, c):
    global cases, div, nan_only
    live_count, live_words = call_live(a, b, c)
    want_count, want_roots = model(a, b, c)
    cases += 1
    counts[live_count] = counts.get(live_count, 0) + 1
    if live_count != want_count:
        div += 1
        if div < 8:
            print(f"DIVERGE count a={a!r} b={b!r} c={c!r}: live={live_count} want={want_count}")
        return
    for i, want in enumerate(want_roots):
        got = live_words[i]
        gotf = struct.unpack("<d", struct.pack("<Q", got))[0]
        if got != bits(want):
            # NaN payload bits are not part of the contract; count those separately
            if gotf != gotf and want != want:
                nan_only += 1
                continue
            div += 1
            if div < 8:
                print(f"DIVERGE root{i} a={a!r} b={b!r} c={c!r}: "
                      f"live={gotf!r} ({got:#018x}) want={want!r} ({bits(want):#018x})")
    # every slot the machine did NOT write must still hold the poison
    for i in range(len(want_roots), 4):
        if live_words[i] != POISON:
            div += 1
            print(f"DIVERGE slot {i} was written ({live_words[i]:#x}) for a={a!r} b={b!r} c={c!r}")


# --- A: roots planted, so the discriminant is meaningfully positive/zero ------
vals = [0.0, -0.0, 1.0, -1.0, 0.5, 2.0, 3.0, 1e-8, 1e-7, 1.0000001e-7, 1e-6,
        1e6, 1e12, -1e12, math.pi, -math.e, 1e-300, 1e300]
for _ in range(1500):
    r1 = rng.choice(vals) if rng.random() < 0.4 else rng.uniform(-1e3, 1e3)
    r2 = r1 if rng.random() < 0.25 else (
        rng.choice(vals) if rng.random() < 0.4 else rng.uniform(-1e3, 1e3))
    a = rng.choice([1.0, -1.0, 2.5, 1e-3, 1e3, rng.uniform(-10, 10)])
    if a == 0.0:
        a = 1.0
    run(a, -a * (r1 + r2), a * r1 * r2)          # a(x-r1)(x-r2)

# --- B: the EPS boundaries on |a| and |b|, and the twin-root boundary ---------
for eps_scale in (0.0, 0.5, 0.999999, 1.0, 1.000001, 2.0, 10.0):
    for sign in (1.0, -1.0):
        run(sign * EPS * eps_scale, 3.0, -4.0)               # |a| around EPS
        run(0.0, sign * EPS * eps_scale, 7.0)                # |b| around EPS
        run(1.0, 2.0, 1.0 - (EPS * eps_scale) ** 2 / 4.0)    # roots EPS apart

# --- C: degenerate and extreme inputs, including NaN/Inf ----------------------
extremes = [0.0, -0.0, 1.0, -1.0, EPS, -EPS, 1e-300, 1e300, -1e300,
            float("inf"), float("-inf"), float("nan"), 5e-324, 1.7976931348623157e308]
for a in extremes:
    for b in extremes:
        for c in (0.0, 1.0, -1.0, 1e300, float("nan")):
            run(a, b, c)

# --- D: uniform random noise --------------------------------------------------
for _ in range(1500):
    pick = lambda: rng.choice(vals) if rng.random() < 0.3 else struct.unpack(
        "<d", struct.pack("<Q", rng.getrandbits(64)))[0]
    a, b, c = pick(), pick(), pick()
    if any(x != x for x in (a, b, c)) and rng.random() < 0.5:
        continue
    run(a, b, c)

# --- negative controls: WRONG models scored against the live answer -----------
neg = {"disc = b*b - 4ac with the roots as (-b +/- sqrt)/2a (the naive formula)": 0,
       "root order swapped (c/q into slot 0)": 0,
       "copysign dropped: q = (b + sqrt(disc)) * -0.5": 0,
       "twin-root test uses == instead of the EPS window": 0}
NEG_N = 0
for _ in range(600):
    r1 = rng.uniform(-100, 100)
    r2 = r1 if rng.random() < 0.3 else rng.uniform(-100, 100)
    a = rng.choice([1.0, -2.0, 0.25])
    b, c = -a * (r1 + r2), a * r1 * r2
    live_count, live_words = call_live(a, b, c)
    want_count, want_roots = model(a, b, c)
    if want_count != 2 and want_count != 1:
        continue
    NEG_N += 1
    disc = b * b - 4.0 * a * c
    if disc >= 0:
        sq = math.sqrt(disc)
        naive = [(-b + sq) / (2 * a), (-b - sq) / (2 * a)]
        if len(want_roots) == 2 and (bits(naive[0]) != live_words[0]
                                     or bits(naive[1]) != live_words[1]):
            neg["disc = b*b - 4ac with the roots as (-b +/- sqrt)/2a (the naive formula)"] += 1
        nocs = (b + math.copysign(sq, 1.0)) * C_HALF
        if len(want_roots) == 2 and nocs != 0 and bits(fdiv(nocs, a)) != live_words[0]:
            neg["copysign dropped: q = (b + sqrt(disc)) * -0.5"] += 1
    if len(want_roots) == 2 and bits(want_roots[1]) != live_words[0]:
        neg["root order swapped (c/q into slot 0)"] += 1
    if len(want_roots) == 2:
        strict = 1 if want_roots[0] == want_roots[1] else 2
        if strict != live_count:
            neg["twin-root test uses == instead of the EPS window"] += 1

print(f"CASES={cases} DIVERGENCES={div}   counts seen: {counts}"
      f"   (NaN-payload-only mismatches, not counted: {nan_only})")
print(f"negative controls over {NEG_N} solvable cases "
      f"(higher = the wrong port would have been caught):")
for k, v in neg.items():
    print(f"   {v:4d}  {k}")
print("ORACLE:", "VERIFIED" if div == 0 else "DIVERGED")
sys.exit(0 if div == 0 else 1)
