#!/usr/bin/env python3
"""Differential oracle for OZ3DEngineCore::getEnvironmentMapIntensity(OZScene*) @Ozone 0x4a34c0.

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZ3DEngineCore_getEnvironmentMapIntensity_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED). Ozone IS dlopen-able outside the
app bundle by preloading its @rpath chain depth-first (OPS_LOG, worker 1).

TWO things are measured, and the second is the one that decides the port's shape:

 1. VALUE — the returned double against `scene[+0x188] / 100.0`, compared as BIT PATTERNS so
    -0.0 and NaN payloads are exact rather than value-equal.
 2. WHICH OBJECT — the method is called with a second, DIFFERENT poisoned object in %rsi that
    carries a different value at its own +0x188. If the method were a NON-STATIC member (%rdi =
    this, %rsi = the scene), the answer would track the %rsi object. Itanium mangling cannot tell
    static from non-static, so this is how the reading is settled experimentally; the call site
    at OZ3DEngineSceneFile::getHeliumGraph @0x3bbca2 (which loads only %rdi) says the same thing
    statically.
"""
import ctypes
import glob
import math
import os
import platform
import random
import struct
import subprocess
import sys

FW = "Ozone"
SYM = "_ZN14OZ3DEngineCore26getEnvironmentMapIntensityEP7OZScene"   # dlsym: no leading underscore
OFF = 0x188
DIVISOR_VMADDR = 0x705428
OBJ_SIZE = 0x200
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


def bits(x):
    return struct.unpack("<Q", struct.pack("<d", x))[0]


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, FW + ".framework", FW))
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_double
    fn.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

    # The divisor, read out of the loaded image rather than trusted from the listing.
    probe = ctypes.cast(fn, ctypes.c_void_p).value
    slide = probe - 0x4a34c0
    div = struct.unpack("<d", ctypes.string_at(DIVISOR_VMADDR + slide, 8))[0]
    print(f"image slide = {slide:#x};  divisor @Ozone {DIVISOR_VMADDR:#x} = {div!r}")

    rng = random.Random(0x4A34C0)
    vals = [0.0, -0.0, 1.0, -1.0, 100.0, -100.0, 50.0, 0.5, 1e-300, 5e-324,
            float("inf"), float("-inf"), float("nan"), 1.7976931348623157e308]
    vals += [rng.uniform(-1e6, 1e6) for _ in range(500)]

    scene = ctypes.create_string_buffer(OBJ_SIZE)
    decoy = ctypes.create_string_buffer(OBJ_SIZE)
    bad, decoy_wins = [], 0
    for v in vals:
        ctypes.memset(ctypes.addressof(scene), POISON, OBJ_SIZE)
        ctypes.memset(ctypes.addressof(decoy), POISON, OBJ_SIZE)
        struct.pack_into("<d", scene, OFF, v)
        # A DIFFERENT value in the decoy's +0x188: if the method were non-static, %rsi would be
        # the scene and the answer would track this instead.
        struct.pack_into("<d", decoy, OFF, (v + 7.0) if math.isfinite(v) else 42.0)
        live = fn(ctypes.addressof(scene), ctypes.addressof(decoy))
        port = v / div
        if bits(live) != bits(port):
            bad.append((v, live, port))
        decoy_v = struct.unpack_from("<d", decoy, OFF)[0] / div
        if bits(live) == bits(decoy_v) and bits(port) != bits(decoy_v):
            decoy_wins += 1
        if bytes(scene.raw)[:OFF] != bytes([POISON]) * OFF:
            bad.append((v, "SCENE MUTATED", None))

    print(f"cases={len(vals)}  bit-exact divergences={len(bad)}  "
          f"(bit patterns, so -0.0 and NaN payloads are exact)")
    for v, live, port in bad[:5]:
        print(f"  percent {v!r}: live {live!r}, port {port!r}")

    print("NEGATIVE CONTROLS (each is a plausible mis-read; the live answers must reject them):")
    print(f"  {'rejected' if decoy_wins == 0 else 'NOT REJECTED'} — the method is NON-STATIC "
          f"(%rsi would be the scene; the decoy's value won {decoy_wins} of {len(vals)} times)")
    ctypes.memset(ctypes.addressof(scene), POISON, OBJ_SIZE)
    struct.pack_into("<d", scene, OFF, 250.0)
    r = fn(ctypes.addressof(scene), None)
    print(f"  {'rejected' if bits(r) == bits(2.5) else 'NOT REJECTED'} — the divisor is 10 or 1 "
          f"(250 percent -> live {r!r}, expected 2.5)")
    ctypes.memset(ctypes.addressof(scene), POISON, OBJ_SIZE)
    struct.pack_into("<f", scene, OFF, 100.0)      # a 32-bit float where the double should be
    r32 = fn(ctypes.addressof(scene), None)
    print(f"  {'rejected' if bits(r32) != bits(1.0) else 'NOT REJECTED'} — the load is a 32-bit "
          f"float (a float 100.0 at +0x188 would then give 1.0; live gave {r32!r})")
    ctypes.memset(ctypes.addressof(scene), POISON, OBJ_SIZE)
    struct.pack_into("<d", scene, OFF - 8, 100.0)
    rn = fn(ctypes.addressof(scene), None)
    print(f"  {'rejected' if bits(rn) != bits(1.0) else 'NOT REJECTED'} — the field is at +0x180 "
          f"(live gave {rn!r} when only +0x180 held 100.0)")

    ok = not bad and decoy_wins == 0 and div == 100.0
    print("VERIFIED vs live Ozone" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
