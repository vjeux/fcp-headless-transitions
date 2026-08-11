#!/usr/bin/env python3
"""Differential oracle for HGMetalDeviceInfo::isBuiltin() const @Helium 0x1c55a0.

Calls the REAL exported symbol out of Helium.framework and compares it to the TypeScript port in
raw-port/src/render/HGMetalDeviceInfo.ts.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGMetalDeviceInfo_isBuiltin_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

The body is `cmpl $0x0, 0x28(%rdi) ; sete %al`, so a synthetic record is a complete stand-in: the
only inputs are the u32 at +0x28 and (as a control) the u32 vendor id at +0x20 that the three
sibling predicates in the same file read instead. Every case randomises +0x20 independently of
+0x28 — including the two crossed shapes (+0x20 == 0 with +0x28 != 0, and +0x20 != 0 with
+0x28 == 0) that are the only ones able to tell "reads +0x28" from "reads +0x20" apart — and
fills the rest of the record with 0xEE so a read of any undecoded slot would be visible.

The corpus deliberately carries 0x10000 and 0xffff0000 (low half zero / high half zero) to pin
the compare's WIDTH, and scores four negative controls: wrong field, `!= 0` instead of `== 0`,
the sibling isExternal immediate (2), and a 16-bit-wide compare. A corpus on which a wrong model
still agrees proves nothing.
"""
import ctypes
import glob
import json
import os
import platform
import random
import struct
import subprocess
import sys

SYM = "_ZNK17HGMetalDeviceInfo9isBuiltinEv"   # dlsym: no leading underscore
OBJ_SIZE = 0x40
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "HGMetalDeviceInfo_isBuiltin_driver.ts")


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


def build_cases():
    rng = random.Random(0x1C55A0)              # reproducible corpus
    interesting = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0xFFFF, 0x10000, 0xFFFF0000,
                   0x7FFFFFFF, 0x80000000, 0xFFFFFFFF]
    vendors = [0, 0x106B, 0x8086, 0x1002]      # incl. 0 -> crosses the wrong-field control
    cases = []
    for loc in interesting:
        for vendor in vendors:
            cases.append({"loc": loc, "vendor": vendor})
    while len(cases) < 1024:
        loc = rng.getrandbits(32)
        vendor = rng.choice([0, rng.getrandbits(32)])
        cases.append({"loc": loc, "vendor": vendor})
    return cases


def run_native(cases, fn):
    out = []
    obj = ctypes.create_string_buffer(OBJ_SIZE)
    for c in cases:
        ctypes.memset(ctypes.addressof(obj), 0xEE, OBJ_SIZE)   # poison every undecoded slot
        struct.pack_into("<I", obj, 0x20, c["vendor"] & 0xFFFFFFFF)
        struct.pack_into("<I", obj, 0x28, c["loc"] & 0xFFFFFFFF)
        out.append(bool(fn(ctypes.addressof(obj))))
    return out


def run_ts(cases):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(cases), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


# --- negative controls: wrong models that must NOT match the binary -------------------------
def wrong_field(c):
    """Reads the +0x20 vendor id the three sibling predicates use."""
    return (c["vendor"] & 0xFFFFFFFF) == 0


def wrong_polarity(c):
    """`testl`/`setne` misread — non-zero means true."""
    return (c["loc"] & 0xFFFFFFFF) != 0


def wrong_immediate(c):
    """Copies isExternal's `cmpl $0x2, 0x28(%rdi)` @0x1c55c4."""
    return (c["loc"] & 0xFFFFFFFF) == 2


def wrong_width(c):
    """16-bit compare instead of the `cmpl` 32-bit one."""
    return (c["loc"] & 0xFFFF) == 0


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, "Helium.framework", "Helium"))
    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_bool
    fn.argtypes = [ctypes.c_void_p]

    cases = build_cases()
    native = run_native(cases, fn)
    ts = run_ts(cases)
    bad = [(i, native[i], ts[i]) for i in range(len(cases)) if native[i] != ts[i]]
    ntrue = sum(1 for v in native if v)
    print(f"cases={len(cases)}  native TRUE={ntrue}  native FALSE={len(cases) - ntrue}  "
          f"divergences={len(bad)}")
    for i, nv, tv in bad[:10]:
        print(f"  case {i}: native={nv} ts={tv}  {cases[i]}")

    for name, model in (("+0x20 vendor slot instead of +0x28", wrong_field),
                        ("!= 0 instead of == 0", wrong_polarity),
                        ("isExternal's immediate 2", wrong_immediate),
                        ("16-bit-wide compare", wrong_width)):
        n = sum(1 for i, c in enumerate(cases) if model(c) != native[i])
        print(f"  NEGATIVE CONTROL {name}: {n} divergences")

    print("VERIFIED vs live Helium" if not bad else "DIVERGED")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
