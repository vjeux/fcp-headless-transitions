#!/usr/bin/env python3
"""Differential oracle for
`FFDest_GPU_effectiveDurationForRate(CMTime const&, double)`
@Flexo 0xd3f340 (__Z35FFDest_GPU_effectiveDurationForRateRK6CMTimed).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/FFDest_GPU_effectiveDurationForRate_oracle.py

The function has three exits and the harness reaches ALL THREE, which is worth
saying because the middle one crosses into CoreMedia:

  A. flags has BOTH Valid(0x01) and Indefinite(0x10)  -> return kCMTimeZero
  B. |rate| <= 1.0                                     -> return the duration
                                                          unchanged (a 24-byte
                                                          copy)
  C. otherwise -> return CMTimeMultiply(duration, (int32)|rate|)

Path C is a CoreMedia call, so the TypeScript port throws there rather than
modelling `CMTimeMultiply` (that function is CoreMedia public ABI and belongs
in the landed `infra/CMTime.ts`, as its own unit). **The arguments the binary
derives for that call are still verifiable, and are verified here**: the
harness computes CoreMedia's own `CMTimeMultiply(duration, (int32)|rate|)`
through ctypes and asserts the live Flexo function returns exactly that. So the
fabs-via-XOR, the `cvttsd2si` truncation and the 1.0 threshold are all pinned,
even though the port defers the multiply itself.

Comparison is over the CMTime's RAW 24 BYTES, so a wrong flag bit or a stale
epoch cannot hide behind a value-equal check.
"""
import ctypes
import ctypes.util
import math
import os
import random
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402

FW = "Flexo"
SYM = "__Z35FFDest_GPU_effectiveDurationForRateRK6CMTimed"

kCMTimeFlags_Valid = 0x01
kCMTimeFlags_Indefinite = 0x10


class CMTime(ctypes.Structure):
    _fields_ = [("value", ctypes.c_int64),
                ("timescale", ctypes.c_int32),
                ("flags", ctypes.c_uint32),
                ("epoch", ctypes.c_int64)]

    def raw(self):
        return bytes(ctypes.string_at(ctypes.byref(self), ctypes.sizeof(self)))

    def __repr__(self):
        return (f"CMTime(v={self.value}, ts={self.timescale}, "
                f"fl=0x{self.flags:x}, ep={self.epoch})")


cm = ctypes.CDLL(ctypes.util.find_library("CoreMedia"))
cm.CMTimeMultiply.restype = CMTime
cm.CMTimeMultiply.argtypes = [CMTime, ctypes.c_int32]
kCMTimeZero = CMTime.in_dll(cm, "kCMTimeZero")

#   0xd3f340  8b 46 0c        movl  0xc(%rsi), %eax
#   0xd3f343  f7 d0           notl  %eax
#   0xd3f345  a8 11           testb $0x11, %al
#   0xd3f347  75 19           jne   0xd3f362
EXPECTED_HEAD = bytes.fromhex("8b460c" "f7d0" "a811" "7519")
SIGN_MASK_VA = 0x156CC70   # movapd operand: two -0.0, i.e. the sign-bit mask
THRESHOLD_VA = 0x156CA00   # movsd operand: 1.0


def cvttsd2si32(x):
    """`cvttsd2si %xmm, %r32` — TRUNCATE toward zero to int32, and on NaN or an
    out-of-range magnitude produce the x86 "integer indefinite" INT_MIN
    (0x80000000) rather than saturating or raising. This is not Math.trunc: the
    first run of this oracle modelled it as one and diverged on every rate of
    1e18, where the live function multiplies by -2147483648."""
    if math.isnan(x) or math.isinf(x):
        return -(2 ** 31)
    t = math.trunc(x)
    if t < -(2 ** 31) or t > 2 ** 31 - 1:
        return -(2 ** 31)
    return int(t)


def model(dur, rate):
    """The reference model. Paths A and B are what the TS port implements; path
    C is the boundary the port throws at, and is computed here with CoreMedia's
    OWN CMTimeMultiply so the argument derivation can still be checked."""
    if (~dur.flags) & 0x11 == 0:                      # Valid AND Indefinite
        return kCMTimeZero, "A: kCMTimeZero"
    # fabs, the way the machine does it: xorpd with the sign mask, then MAXSD
    neg = -rate                                        # xorpd sign-mask, rate
    mag = neg if neg > rate else rate                  # maxsd dst=neg, src=rate
    if 1.0 >= mag:                                     # ucomisd + jae (ordered)
        return dur, "B: unchanged"
    mult = cvttsd2si32(mag)                            # cvttsd2si %xmm1, %esi
    return cm.CMTimeMultiply(dur, ctypes.c_int32(mult)), "C: CMTimeMultiply"


def corpus():
    rng = random.Random(0xFFDE57)
    durs = []
    for value, ts, flags, epoch in [
        (0, 600, kCMTimeFlags_Valid, 0),
        (600, 600, kCMTimeFlags_Valid, 0),
        (-600, 600, kCMTimeFlags_Valid, 0),
        (1001, 30000, kCMTimeFlags_Valid, 0),
        (1, 1, kCMTimeFlags_Valid, 7),
        (0, 0, 0, 0),                                    # invalid
        (0, 600, kCMTimeFlags_Valid | kCMTimeFlags_Indefinite, 0),   # path A
        (5, 600, kCMTimeFlags_Indefinite, 0),            # Indefinite, NOT Valid
        (5, 600, kCMTimeFlags_Valid | 0x02, 3),          # HasBeenRounded
        (2**40, 90000, kCMTimeFlags_Valid, -2),
    ]:
        durs.append(CMTime(value, ts, flags, epoch))
    for _ in range(12):
        durs.append(CMTime(rng.randint(-(2**40), 2**40),
                           rng.choice([1, 24, 30, 600, 30000, 90000]),
                           rng.choice([0x01, 0x03, 0x11, 0x05, 0x00]),
                           rng.randint(-3, 3)))
    rates = [0.0, -0.0, 1.0, -1.0, 0.5, -0.5, 1.0000001, 2.0, -2.0, 3.9, -3.9,
             8.0, 1e3, -1e3, math.nextafter(1.0, 2.0),
             math.nextafter(1.0, 0.0), 1e18, float("nan"),
             float("inf"), float("-inf")]
    rates += [rng.uniform(-40, 40) for _ in range(10)]
    return [(d, r) for d in durs for r in rates]


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, CMTime,
                               [ctypes.POINTER(CMTime), ctypes.c_double])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    lib = load_framework(FW)
    dl = ctypes.cast(getattr(lib, SYM[1:]), ctypes.c_void_p).value
    if dl != slide + addr:
        print(f"DLSYM CROSS-CHECK FAILED: 0x{dl:x} vs 0x{slide + addr:x}")
        return 1
    print(f"dlsym cross-check PASS: both routes give 0x{dl:x}")

    head = ctypes.string_at(slide + addr, len(EXPECTED_HEAD))
    if head != EXPECTED_HEAD:
        print(f"BYTE SELF-CHECK FAILED: {head.hex()} != {EXPECTED_HEAD.hex()}")
        return 1
    print(f"byte self-check PASS: {head.hex()}")
    print("  `8b 46 0c` loads flags at +0xc; `f7 d0` NOTs it; `a8 11` tests "
          "0x11 against the COMPLEMENT, so the fall-through needs BOTH "
          "Valid(0x01) and Indefinite(0x10) SET")

    for name, site, nxt, va in (("sign mask", 0xD3F362, 0xD3F36A, SIGN_MASK_VA),
                                ("threshold", 0xD3F372, 0xD3F37A, THRESHOLD_VA)):
        raw = ctypes.string_at(slide + site, 8)
        disp = int.from_bytes(raw[4:8], "little")
        target = nxt + disp
        val = struct.unpack("<d", ctypes.string_at(slide + target, 8))[0]
        ok = target == va
        print(f"  {name} @0x{site:x}: disp32 0x{disp:x} -> VA 0x{target:x} "
              f"= {val!r} {'OK' if ok else 'MISMATCH'}")
        if not ok:
            return 1

    cases = corpus()
    div = 0
    hits = {"A: kCMTimeZero": 0, "B: unchanged": 0, "C: CMTimeMultiply": 0,
            "C: multiplier is not representable": 0}
    skipped = 0
    for dur, rate in cases:
        want, path = model(dur, rate)
        hits[path] = hits.get(path, 0) + 1
        if want is None:
            # cvttsd2si on a non-finite value is UB-ish (yields INT_MIN); the
            # model refuses to predict it rather than pretending, and the case
            # is reported as skipped instead of silently passing.
            skipped += 1
            continue
        got = fn(ctypes.byref(dur), rate)
        if got.raw() != want.raw():
            div += 1
            if div <= 5:
                print(f"  DIVERGED dur={dur} rate={rate!r} [{path}]: "
                      f"live={got} want={want}")
    print(f"live-vs-model: {len(cases)} cases, {div} divergences, "
          f"{skipped} skipped (compared over the raw 24 CMTime bytes)")
    print("  path coverage: " + ", ".join(f"{k} x{v}" for k, v in hits.items()))

    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0

    def control(name, f):
        nonlocal dead
        caught = 0
        n = 0
        for dur, rate in cases:
            want, path = model(dur, rate)
            if want is None:
                continue
            n += 1
            mut = f(dur, rate)
            got = fn(ctypes.byref(dur), rate)
            if mut is None or got.raw() != mut.raw():
                caught += 1
        if caught == 0:
            dead += 1
        print(f"  {caught:4d}/{n} caught — {name}")

    def c_threshold_strict(dur, rate):
        if (~dur.flags) & 0x11 == 0:
            return kCMTimeZero
        mag = abs(rate)
        if 1.0 > mag:            # `>` instead of `>=`
            return dur
        return cm.CMTimeMultiply(dur, ctypes.c_int32(cvttsd2si32(mag)))

    def c_round_not_trunc(dur, rate):
        if (~dur.flags) & 0x11 == 0:
            return kCMTimeZero
        mag = abs(rate)
        if 1.0 >= mag:
            return dur
        m = cvttsd2si32(round(mag)) if math.isfinite(mag) else -(2**31)
        return cm.CMTimeMultiply(dur, ctypes.c_int32(m))

    def c_no_fabs(dur, rate):
        if (~dur.flags) & 0x11 == 0:
            return kCMTimeZero
        mag = rate                                        # forgot the fabs
        if 1.0 >= mag:
            return dur
        return cm.CMTimeMultiply(dur, ctypes.c_int32(cvttsd2si32(mag)))

    def c_valid_only(dur, rate):
        if dur.flags & kCMTimeFlags_Valid:                # wrong flag test
            return kCMTimeZero
        mag = abs(rate)
        if 1.0 >= mag:
            return dur
        return cm.CMTimeMultiply(dur, ctypes.c_int32(cvttsd2si32(mag)))

    def c_zero_instead_of_passthrough(dur, rate):
        if (~dur.flags) & 0x11 == 0:
            return kCMTimeZero
        mag = abs(rate)
        if 1.0 >= mag:
            return kCMTimeZero                            # B returns zero
        return cm.CMTimeMultiply(dur, ctypes.c_int32(cvttsd2si32(mag)))

    control("threshold is `1.0 > |rate|` instead of `>=`", c_threshold_strict)
    control("rounds the multiplier instead of truncating (cvttsd2si)",
            c_round_not_trunc)
    control("forgets the fabs (xorpd+maxsd) on the rate", c_no_fabs)
    control("tests Valid only, not Valid AND Indefinite", c_valid_only)
    control("path B returns kCMTimeZero instead of the duration",
            c_zero_instead_of_passthrough)

    ok = div == 0 and dead == 0 and all(
        hits[k] for k in ("A: kCMTimeZero", "B: unchanged", "C: CMTimeMultiply"))
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
