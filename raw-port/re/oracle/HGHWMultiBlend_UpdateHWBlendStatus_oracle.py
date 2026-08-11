#!/usr/bin/env python3
"""Differential oracle for HGHWMultiBlend::UpdateHWBlendStatus(HGRenderer*) @Helium 0x2c230.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGHWMultiBlend_UpdateHWBlendStatus_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

The method's whole observable effect is ONE byte, so the corpus is about width and scope as much
as value: the object is poisoned with 0xEE, the +0x1d8 word is swept over the interesting u32
space, and after each call the byte at +0x1e0, the neighbouring byte at +0x1e1 and every other
byte of the object are all checked. The HGRenderer* is poison throughout.
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
SYM = "_ZN14HGHWMultiBlend19UpdateHWBlendStatusEP10HGRenderer"   # dlsym: no leading underscore
OFF_MODE, OFF_STATUS = 0x1d8, 0x1e0
OBJ_SIZE = 0x220
POISON = 0xEE
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


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, FW + ".framework", FW))
    fn = getattr(lib, SYM)
    fn.restype = None
    fn.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

    rng = random.Random(0x2C230)
    modes = [0, 1, 2, 3, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF, 0x00000100, 0xFFFFFF00]
    modes += [rng.getrandbits(32) for _ in range(500)]

    obj = ctypes.create_string_buffer(OBJ_SIZE)
    bad_val, bad_width, bad_scope = [], [], []
    for m in modes:
        ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
        struct.pack_into("<I", obj, OFF_MODE, m)
        fn(ctypes.addressof(obj), POISON_PTR)
        raw = bytes(obj.raw)
        port = 1 if (m & 0xFFFFFFFF) != 0 else 0        # the TS port
        if raw[OFF_STATUS] != port:
            bad_val.append((m, raw[OFF_STATUS], port))
        if raw[OFF_STATUS + 1] != POISON:
            bad_width.append((m, raw[OFF_STATUS + 1]))
        untouched = raw[:OFF_MODE] + raw[OFF_MODE + 4:OFF_STATUS] + raw[OFF_STATUS + 1:]
        if untouched != bytes([POISON]) * len(untouched):
            bad_scope.append(m)

    print(f"cases={len(modes)}  value mismatches={len(bad_val)}  "
          f"+0x1e1 clobbered={len(bad_width)}  objects with any other byte touched={len(bad_scope)}"
          f"   (HGRenderer* = {POISON_PTR:#x} throughout)")
    for m, live, port in bad_val[:5]:
        print(f"  mode {m:#010x}: live {live}, port {port}")

    print("NEGATIVE CONTROLS (each is a plausible mis-read; the live bytes must reject them):")
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<I", obj, OFF_MODE, 2)
    fn(ctypes.addressof(obj), POISON_PTR)
    raw = bytes(obj.raw)
    print(f"  {'rejected' if raw[OFF_STATUS] == 1 else 'NOT REJECTED'} — the status is the mode "
          f"value itself (live stored {raw[OFF_STATUS]} for mode 2, i.e. a canonical 0/1)")
    print(f"  {'rejected' if raw[OFF_STATUS + 1] == POISON else 'NOT REJECTED'} — the store is "
          f"32-bit (bytes +0x1e1..+0x1e3 would be zeroed; +0x1e1 is {raw[OFF_STATUS + 1]:#04x})")
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<I", obj, OFF_MODE, 0)
    fn(ctypes.addressof(obj), POISON_PTR)
    z = bytes(obj.raw)[OFF_STATUS]
    print(f"  {'rejected' if z == 0 else 'NOT REJECTED'} — the test is `== 2` (the ctor default) "
          f"rather than `!= 0` (mode 0 gave {z})")
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    struct.pack_into("<I", obj, OFF_MODE, 0xFFFFFF00)
    nz = bytes(obj.raw)
    fn(ctypes.addressof(obj), POISON_PTR)
    nz = bytes(obj.raw)[OFF_STATUS]
    print(f"  {'rejected' if nz == 1 else 'NOT REJECTED'} — the compare is 8-bit (the low byte of "
          f"0xffffff00 is 0, so a `cmpb` would have stored 0; live stored {nz})")

    ok = not bad_val and not bad_width and not bad_scope
    print("VERIFIED vs live Helium" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
