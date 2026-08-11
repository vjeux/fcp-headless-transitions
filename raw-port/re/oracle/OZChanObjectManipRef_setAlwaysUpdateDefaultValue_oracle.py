#!/usr/bin/env python3
"""Differential oracle for OZChanObjectManipRef::setAlwaysUpdateDefaultValue(bool) @Ozone 0x3796c0.

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZChanObjectManipRef_setAlwaysUpdateDefaultValue_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED). Ozone IS dlopen-able outside the app
bundle by preloading its @rpath chain depth-first (OPS_LOG, worker 1).

A one-store setter has exactly three ways to be wrong — wrong offset, wrong width, or an invented
normalisation of the value — so the corpus targets those: every byte value 0..255, arguments whose
LOW byte is the payload but whose upper bits are junk, and a full-object check after each call so
a store that spills into a neighbouring byte is caught.
"""
import ctypes
import glob
import os
import platform
import subprocess
import sys

FW = "Ozone"
SYM = "_ZN20OZChanObjectManipRef27setAlwaysUpdateDefaultValueEb"   # dlsym: no leading underscore
OFF = 0x99
OBJ_SIZE = 0x120
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


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, FW + ".framework", FW))
    fn = getattr(lib, SYM)
    fn.restype = None
    # The 2nd arg is declared as a full 64-bit word ON PURPOSE: the machine reads only %sil, and
    # passing junk in the upper bits is how "the store is 8 bits wide" gets measured rather than
    # assumed.
    fn.argtypes = [ctypes.c_void_p, ctypes.c_uint64]

    args = [v for v in range(256)]
    args += [0xFFFFFF00 | v for v in (0, 1, 2, 0x7F, 0x80, 0xFF)]
    args += [0xDEADBEEFCAFE0000 | v for v in (0, 1, 0x5A, 0xFF)]

    obj = ctypes.create_string_buffer(OBJ_SIZE)
    bad_value, bad_spill = [], []
    for a in args:
        ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
        fn(ctypes.addressof(obj), a)
        raw = bytes(obj.raw)
        port = a & 0xFF                      # the TS port: `value & 0xff`
        if raw[OFF] != port:
            bad_value.append((a, raw[OFF], port))
        rest = raw[:OFF] + raw[OFF + 1:]
        if rest != bytes([POISON]) * (OBJ_SIZE - 1):
            bad_spill.append((a, [i for i, b in enumerate(raw)
                                  if b != POISON and i != OFF][:4]))

    print(f"cases={len(args)}  value mismatches={len(bad_value)}  "
          f"objects with a spilled byte={len(bad_spill)}")
    for a, live, port in bad_value[:5]:
        print(f"  arg {a:#x}: live byte {live:#04x}, port {port:#04x}")
    for a, offs in bad_spill[:5]:
        print(f"  arg {a:#x}: unexpected writes at {[hex(o) for o in offs]}")

    print("NEGATIVE CONTROLS (each is a plausible mis-read; the live bytes must reject them):")
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    fn(ctypes.addressof(obj), 0x5A)
    raw = bytes(obj.raw)
    print(f"  {'rejected' if raw[OFF] == 0x5A else 'NOT REJECTED'} — the value is normalised to "
          f"0/1 (live stored {raw[OFF]:#04x} for arg 0x5a)")
    print(f"  {'rejected' if raw[OFF - 1] == POISON else 'NOT REJECTED'} — the field is at +0x98")
    print(f"  {'rejected' if raw[OFF + 1] == POISON else 'NOT REJECTED'} — the field is at +0x9a")
    ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
    fn(ctypes.addressof(obj), 0xFFFFFF00)
    raw = bytes(obj.raw)
    print(f"  {'rejected' if raw[OFF] == 0x00 else 'NOT REJECTED'} — the store is wider than a "
          f"byte (live stored {raw[OFF]:#04x} for arg 0xffffff00, i.e. only %sil is used)")

    ok = not bad_value and not bad_spill
    print("VERIFIED vs live Ozone" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
