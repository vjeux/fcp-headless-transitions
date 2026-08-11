#!/usr/bin/env python3
"""Bit-exact differential oracle for
`SurroundPanner::AngleBisectionRatio(double, double, double)`
@Flexo 0x12513a0 (__ZN14SurroundPanner19AngleBisectionRatioEddd).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/SurroundPanner_AngleBisectionRatio_oracle.py

This is a REAL TypeScript <-> binary differential. It does not compare the live
function against a Python restatement of the port (which would share any
misreading of the disassembly with the port itself); it shells out to node with
`--experimental-strip-types` and imports
`raw-port/src/channels/SurroundPanner.ts`, so the thing being compared IS the
shipped TypeScript.

Doubles cross the process boundary as raw u64 BIT PATTERNS in hex:
`json.dump` emits bare NaN/Infinity which `JSON.parse` rejects, and comparing
bit patterns is exact for signed zero and NaN payloads instead of merely
value-equal (OPS_LOG).

The corpus is built around the three traps in this body rather than being
uniform random:
  * NaN in each argument position — `ucomisd` is unordered, and `MAXSD`/`MINSD`
    return their SRC operand rather than NaN, which is where `Math.max` and
    `Math.min` diverge;
  * +0.0 vs -0.0 — same MAXSD/MINSD src rule, and `-0.0 < 0.0` is false so the
    2π wrap must NOT fire;
  * b == c, and angles exactly on each clamp boundary — the divide is
    unguarded, so 0/0 -> NaN and x/0 -> ±Inf must both be reproduced.
"""
import ctypes
import json
import math
import os
import random
import struct
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import local_fn, require_x86_64  # noqa: E402

FW = "Flexo"
SYM = "__ZN14SurroundPanner19AngleBisectionRatioEddd"
HERE = os.path.dirname(os.path.abspath(__file__))
DRIVER = os.path.join(HERE, "SurroundPanner_AngleBisectionRatio_driver.mts")

BODY_LEN = 0x5E  # 0x12513a0..0x12513fe
TWO_PI_VA = 0x1572558
ONE_VA = 0x156CA00
# (site, next-instruction address, expected disp32, expected target)
RIP_SITES = [
    (0x12513A8, 0x12513B0, 0x3211A8, TWO_PI_VA),
    (0x12513D0, 0x12513D8, 0x31B628, ONE_VA),
]
EXPECTED_HEAD = bytes.fromhex("55" "4889e5" "660f28e0")   # push/mov/movapd


def bits(x):
    return struct.unpack("<Q", struct.pack("<d", x))[0]


def unbits(b):
    return struct.unpack("<d", struct.pack("<Q", b))[0]


def is_nan_bits(b):
    return (b & 0x7FF0000000000000) == 0x7FF0000000000000 and (b & 0xFFFFFFFFFFFFF)


def is_nan_pair_diff(x, y):
    """True when the two results differ ONLY by being different NaNs.

    x86's `divsd` on 0/0 produces the QNaN floating-point indefinite,
    0xfff8000000000000 — sign bit SET. JavaScript canonicalises every
    arithmetic NaN to 0x7ff8000000000000 and provides no way to produce the
    other from arithmetic, so a NaN-vs-NaN mismatch is a property of the two
    languages, not of the transcription. Every other mismatch is a real one.
    """
    return x != y and is_nan_bits(x) and is_nan_bits(y)


def classify(cases, live, other, verbose=False):
    """-> (real divergences, NaN-bits-only differences)"""
    real = nan_only = 0
    for i, (want, got) in enumerate(zip(live, other)):
        if want == got:
            continue
        if is_nan_pair_diff(want, got):
            nan_only += 1
            continue
        real += 1
        if verbose and real <= 5:
            a, b, c = cases[i]
            print(f"  DIVERGED a={a!r} b={b!r} c={c!r}: "
                  f"live=0x{want:016x} ({unbits(want)!r}) "
                  f"ts=0x{got:016x} ({unbits(got)!r})")
    return real, nan_only


def corpus():
    rng = random.Random(0x50414E)
    vals = [
        0.0, -0.0, 1.0, -1.0, 0.5, math.pi, -math.pi, 2 * math.pi,
        -2 * math.pi, math.pi / 2, -math.pi / 2, 6.283185307179586,
        1e-320, -1e-320, 1e300, -1e300,
        float("inf"), float("-inf"), float("nan"),
    ]
    cases = []
    # every combination of the interesting values, all three positions
    for a in vals:
        for b in vals[:8]:
            for c in (0.0, 1.0, math.pi, float("nan"), -0.0):
                cases.append((a, b, c))
    # boundary-exact cases: angle sitting precisely on lo / hi, and b == c
    for lo, hi in ((0.0, 1.0), (-1.0, 1.0), (math.pi / 2, math.pi),
                   (2.0, 2.0), (-0.0, 0.0)):
        for a in (lo, hi, (lo + hi) / 2, math.nextafter(lo, -math.inf),
                  math.nextafter(hi, math.inf)):
            cases.append((a, lo, hi))
            cases.append((a, hi, lo))     # reversed, since b/c are unordered
    # random doubles in the angular range, plus wide-range randoms
    for _ in range(400):
        cases.append((rng.uniform(-8, 8), rng.uniform(-8, 8), rng.uniform(-8, 8)))
    for _ in range(200):
        cases.append((unbits(rng.getrandbits(64) & 0x7FEFFFFFFFFFFFFF),
                      unbits(rng.getrandbits(64) & 0x7FEFFFFFFFFFFFFF),
                      unbits(rng.getrandbits(64) & 0x7FEFFFFFFFFFFFFF)))
    return cases


def main():
    require_x86_64()
    fn, addr, slide = local_fn(
        FW, SYM, ctypes.c_double,
        [ctypes.c_void_p, ctypes.c_double, ctypes.c_double, ctypes.c_double])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    # ---- byte self-check ----------------------------------------------------
    head = ctypes.string_at(slide + addr, len(EXPECTED_HEAD))
    if head != EXPECTED_HEAD:
        print(f"BYTE SELF-CHECK FAILED: {head.hex()} != {EXPECTED_HEAD.hex()}")
        return 1
    body = ctypes.string_at(slide + addr, BODY_LEN)
    print(f"byte self-check PASS: {BODY_LEN} bytes, head {head.hex()} "
          f"(push %rbp / mov %rsp,%rbp / movapd %xmm0,%xmm4)")

    for site, nxt, want_disp, want_va in RIP_SITES:
        raw = ctypes.string_at(slide + site, 8)
        disp = int.from_bytes(raw[4:8], "little")
        target = nxt + disp
        val = struct.unpack("<d", ctypes.string_at(slide + target, 8))[0]
        ok = disp == want_disp and target == want_va
        print(f"  const @0x{site:x}: disp32 0x{disp:x} -> VA 0x{target:x} "
              f"= {val!r}  {'OK' if ok else 'MISMATCH'}")
        if not ok:
            return 1

    # ---- run the corpus through the LIVE function ---------------------------
    cases = corpus()
    this = ctypes.create_string_buffer(b"\xcd" * 64, 64)
    live = []
    for a, b, c in cases:
        r = fn(ctypes.cast(this, ctypes.c_void_p), a, b, c)
        live.append(bits(r))

    # ---- and through the REAL TypeScript ------------------------------------
    req = {"cases": [[f"{bits(a):016x}", f"{bits(b):016x}", f"{bits(c):016x}"]
                     for a, b, c in cases]}
    proc = subprocess.run(
        ["node", "--experimental-strip-types", DRIVER],
        input=json.dumps(req), capture_output=True, text=True)
    if proc.returncode != 0:
        print("NODE DRIVER FAILED — this is a HARNESS failure, not a verdict:")
        print(proc.stderr[-2000:])
        return 1
    results = json.loads(proc.stdout)["results"]

    port = [int(h, 16) for h in results["port"]]
    div, nan_only = classify(cases, live, port, verbose=True)
    print(f"live-vs-TypeScript: {len(cases)} cases, {div} real divergences "
          f"(compared as raw bit patterns)")
    print(f"  {nan_only} cases are BOTH NaN but differ in the NaN bits — see "
          f"the note below; these are counted separately, not as agreements")
    if nan_only:
        example = next(i for i in range(len(cases)) if is_nan_pair_diff(live[i], port[i]))
        a, b, c = cases[example]
        print(f"  e.g. a={a!r} b={b!r} c={c!r}: live=0x{live[example]:016x}, "
              f"ts=0x{port[example]:016x}")
        print("  x86 `divsd` 0/0 yields the 'QNaN floating-point indefinite',")
        print("  whose SIGN BIT IS SET (0xfff8000000000000). JavaScript")
        print("  canonicalises every arithmetic NaN to 0x7ff8000000000000 and")
        print("  cannot produce the other one from arithmetic at all, so this")
        print("  difference is UNREPRESENTABLE in the port rather than a defect")
        print("  in it. It is confined to results that are NaN on BOTH sides.")

    nan_cases = sum(1 for a, b, c in cases
                    if math.isnan(a) or math.isnan(b) or math.isnan(c))
    zero_cases = sum(1 for a, b, c in cases
                     if 0.0 in (a, b, c) and math.copysign(1, min(
                         (v for v in (a, b, c) if v == 0.0), default=1.0)) < 0)
    distinct = len(set(live))
    print(f"  corpus shape: {nan_cases} cases involve NaN, {zero_cases} involve "
          f"a negative zero, {distinct} distinct result bit patterns "
          f"(a corpus with one answer would prove nothing)")

    # ---- negative controls, all evaluated in the SAME TypeScript process ----
    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0
    for name, hexes in results.items():
        if name == "port":
            continue
        mut = [int(h, 16) for h in hexes]
        caught, _nan = classify(cases, live, mut)
        if caught == 0:
            dead += 1
        print(f"  {caught:5d}/{len(cases)} caught — {name}")

    ok = div == 0 and dead == 0 and distinct > 3
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
