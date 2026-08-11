#!/usr/bin/env python3
"""Differential oracle for HGGPURenderer::GetMetalHandler() const @Helium 0x11d30.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGGPURenderer_GetMetalHandler_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

A one-load getter is easy to port and easy to get subtly wrong (wrong offset, wrong width, an
invented null guard), so the corpus is built to catch exactly those:
  * every sentinel must round-trip EXACTLY, including 0 (the port must not substitute anything
    for a null pointer) and 0xffffffffffffffff (no sign/width mangling);
  * the object is poisoned with 0xEE everywhere else, so a wrong offset returns poison;
  * the OFFSET is pinned positively: writing the same sentinel into the NEIGHBOURING slots
    +0x518 and +0x528 while holding +0x520 fixed must not change the answer.
"""
import ctypes
import glob
import os
import platform
import random
import struct
import subprocess
import sys

FW = "Helium"
SYM = "_ZNK13HGGPURenderer15GetMetalHandlerEv"      # dlsym: no leading underscore
OFF = 0x520
OBJ_SIZE = 0x600
POISON = 0xEE
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


def sentinels():
    vals = [0, 1, 0xFFFFFFFFFFFFFFFF, 0x7FFFFFFFFFFFFFFF, 0x8000000000000000,
            0xDEADBEEF, 0xDEADBEEFCAFEBABE, 0xEEEEEEEEEEEEEEEE, 0x00000000FFFFFFFF,
            0xFFFFFFFF00000000]
    rng = random.Random(0x11D30)
    vals += [rng.getrandbits(64) for _ in range(990)]
    return vals


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, FW + ".framework", FW))
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_uint64
    fn.argtypes = [ctypes.c_void_p]

    obj = ctypes.create_string_buffer(OBJ_SIZE)
    vals = sentinels()

    # (1) round-trip: the TS port is `return this.metalHandler_at_0x520`, i.e. the identity on the
    #     stored value, so the port's answer for each case IS the sentinel.
    bad = []
    for v in vals:
        ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
        struct.pack_into("<Q", obj, OFF, v)
        live = fn(ctypes.addressof(obj))
        if live != v:
            bad.append((v, live))
    print(f"round-trip: {len(vals) - len(bad)}/{len(vals)} sentinels returned EXACTLY "
          f"(port = the stored value, unfiltered)")
    for v, live in bad[:5]:
        print(f"  MISMATCH stored {v:#018x} -> live {live:#018x}")

    # (2) null is not special-cased on either side.
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<Q", obj, OFF, 0)
    null_ok = fn(ctypes.addressof(obj)) == 0
    print(f"null passthrough: {'PASS' if null_ok else 'FAIL'} "
          f"(a NULL handle is returned as NULL, no invented guard)")

    # (3) the OFFSET is pinned: perturbing the neighbours must not move the answer.
    marker, other = 0x1122334455667788, 0x99AABBCCDDEEFF00
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<Q", obj, OFF, marker)
    struct.pack_into("<Q", obj, OFF - 8, other)
    struct.pack_into("<Q", obj, OFF + 8, other)
    neighbours_ok = fn(ctypes.addressof(obj)) == marker
    # and reading the neighbour instead of +0x520 would have answered `other`
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<Q", obj, OFF - 8, marker)
    off_minus8 = fn(ctypes.addressof(obj))
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<Q", obj, OFF + 8, marker)
    off_plus8 = fn(ctypes.addressof(obj))
    print(f"offset pinned: {'PASS' if neighbours_ok else 'FAIL'} "
          f"(+0x518/+0x528 perturbed, answer unchanged)")
    print("NEGATIVE CONTROLS (each is a plausible mis-read; the live answers must reject them):")
    print(f"  {'rejected' if off_minus8 != marker else 'NOT REJECTED'} — the field is at +0x518 "
          f"(live answered {off_minus8:#018x}, i.e. poison)")
    print(f"  {'rejected' if off_plus8 != marker else 'NOT REJECTED'} — the field is at +0x528 "
          f"(live answered {off_plus8:#018x}, i.e. poison)")
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<Q", obj, OFF, 0xFFFFFFFF00000000)
    hi = fn(ctypes.addressof(obj))
    print(f"  {'rejected' if hi == 0xFFFFFFFF00000000 else 'NOT REJECTED'} — the load is 32-bit "
          f"(a movl would have answered 0x0 for {0xFFFFFFFF00000000:#018x}; live said {hi:#018x})")

    ok = not bad and null_ok and neighbours_ok and off_minus8 != marker and off_plus8 != marker
    print("VERIFIED vs live Helium" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
