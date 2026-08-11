#!/usr/bin/env python3
"""Differential oracle for PCStream::~PCStream() [D2] @ProCore 0x6dec.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCStream_D2_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would check the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

An EMPTY body cannot be oracled by its return value — it has none. What CAN be checked, and is
the thing a reader actually doubts about a no-op dtor port, is the claim of NO EFFECT: that the
real D2 writes nothing to the object it is handed. So this harness calls the live symbol on a
0x100-byte record pre-filled with a poison pattern and compares the buffer byte-for-byte
afterwards, over several fills (0x00, 0xEE, 0xFF, 0xA5, and random bytes) including ones whose
first qword looks like a plausible vptr. Any store — most importantly a vptr reset at +0x00,
which is what a NON-empty base dtor would do — shows up as a changed byte.

This also guards the specific failure mode OPS_LOG #368 describes (a truncated disassembly
turning a REAL body into an apparently EMPTY one): if the slicer had cut the body short, the
instructions it dropped would still run here, and their stores would be visible.
"""
import ctypes
import glob
import os
import platform
import random
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

SYM = "_ZN8PCStreamD2Ev"     # dlsym: no leading underscore
OBJ_SIZE = 0x100
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


def build_fills():
    rng = random.Random(0x6DEC)
    fills = [bytes([0x00]) * OBJ_SIZE,
             bytes([0xEE]) * OBJ_SIZE,
             bytes([0xFF]) * OBJ_SIZE,
             bytes([0xA5]) * OBJ_SIZE]
    for _ in range(28):
        fills.append(bytes(rng.getrandbits(8) for _ in range(OBJ_SIZE)))
    return fills


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, "ProCore.framework", "ProCore"))
    fn = getattr(lib, SYM)
    fn.restype = None
    fn.argtypes = [ctypes.c_void_p]

    fills = build_fills()
    changed = 0
    for fill in fills:
        obj = ctypes.create_string_buffer(fill, OBJ_SIZE)
        fn(ctypes.addressof(obj))
        after = ctypes.string_at(ctypes.addressof(obj), OBJ_SIZE)
        if after != fill:
            changed += 1
            diff = [i for i in range(OBJ_SIZE) if after[i] != fill[i]]
            print(f"  MUTATED at offsets {diff[:16]} (fill 0x{fill[0]:02x})")
    print(f"records={len(fills)}  size=0x{OBJ_SIZE:x}  mutated={changed}")

    # The TS port is a no-op method; the only faithful behaviour to compare is "does not throw
    # and does not touch the object". Run it for real so the port, not just its doc, is exercised.
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    driver = os.path.join(REPO, "raw-port", "re", "oracle", "PCStream_D2_driver.ts")
    p = subprocess.run([tsx, driver], capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"), timeout=DRIVER_TIMEOUT)
    ts_ok = p.returncode == 0 and p.stdout.strip().splitlines()[-1] == "TS_NO_EFFECT"
    print("TS port: no-effect confirmed" if ts_ok else "TS port: FAILED\n" + p.stdout + p.stderr)

    ok = changed == 0 and ts_ok
    print("VERIFIED vs live ProCore (empty body, zero stores)" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
