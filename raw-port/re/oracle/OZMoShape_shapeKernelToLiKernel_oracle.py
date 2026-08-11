#!/usr/bin/env python3
"""Differential oracle for
OZMoShape::shapeKernelToLiKernel(OZShapeEdgeTexture::Kernel) @Ozone 0x5096c0.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZMoShape_shapeKernelToLiKernel_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED). Ozone IS dlopen-able outside the app
bundle by preloading its @rpath chain depth-first (OPS_LOG, worker 1).

The function is a pure u32 -> u32 map, so the corpus can be near-exhaustive over the interesting
region and random elsewhere. `this` is passed as poison: the port claims it is never read.
"""
import ctypes
import glob
import os
import platform
import random
import subprocess
import sys

FW = "Ozone"
SYM = "_ZN9OZMoShape21shapeKernelToLiKernelEN18OZShapeEdgeTexture6KernelE"  # dlsym: no underscore
POISON_PTR = 0xDEADBEEFDEADBEEF
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))


def load_with_rpath(path, seen=None):
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir, dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def port(k):
    """The TS port, transliterated: unsigned (k-1) < 6 ? k : 0."""
    k &= 0xFFFFFFFF
    return k if ((k - 1) & 0xFFFFFFFF) < 6 else 0


def ctl_signed(k):
    """The range test read as SIGNED (`cmovl` instead of `cmovb`)."""
    k &= 0xFFFFFFFF
    d = (k - 1) & 0xFFFFFFFF
    d = d - (1 << 32) if d >> 31 else d
    return k if d < 6 else 0


def ctl_off_by_one(k):
    """`cmpl $0x7` — admits kernel 7 as well."""
    k &= 0xFFFFFFFF
    return k if ((k - 1) & 0xFFFFFFFF) < 7 else 0


def ctl_no_minus_one(k):
    """Forget the `leal -0x1` and test the raw value (`kernel <u 6`), which admits 0."""
    k &= 0xFFFFFFFF
    return k if k < 6 else 0


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, FW + ".framework", FW))
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_uint32
    fn.argtypes = [ctypes.c_void_p, ctypes.c_uint32]

    rng = random.Random(0x5096C0)
    cases = list(range(0, 1024))
    cases += [0x7FFFFFFF, 0x80000000, 0x80000001, 0xFFFFFFFE, 0xFFFFFFFF]
    cases += [rng.getrandbits(32) for _ in range(2000)]

    live = [fn(POISON_PTR, k) for k in cases]
    bad = [(k, l, port(k)) for k, l in zip(cases, live) if l != port(k)]
    passthrough = sorted({k for k, l in zip(cases, live) if l == k and k != 0})
    print(f"cases={len(cases)}  divergences={len(bad)}  "
          f"(this passed as {POISON_PTR:#x} — never dereferenced)")
    print(f"live pass-through set (answer == input, excluding 0): {passthrough[:10]}")
    for k, l, p in bad[:5]:
        print(f"  kernel {k:#x}: live {l:#x}, port {p:#x}")

    print("NEGATIVE CONTROLS (each is a plausible mis-read; the live answers must reject them):")
    for name, f in (("SIGNED range test (cmovl instead of cmovb)", ctl_signed),
                    ("off-by-one: cmpl $0x7, admitting kernel 7", ctl_off_by_one),
                    ("no `-1` bias: `kernel <u 6`, admitting kernel 0", ctl_no_minus_one)):
        wrong = sum(1 for k, l in zip(cases, live) if f(k) != l)
        print(f"  {wrong:5d}/{len(cases)} wrong — {name}")

    ok = not bad and passthrough == [1, 2, 3, 4, 5, 6]
    print("VERIFIED vs live Ozone" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
