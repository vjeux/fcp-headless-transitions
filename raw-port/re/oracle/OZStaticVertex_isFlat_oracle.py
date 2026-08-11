#!/usr/bin/env python3
"""Differential oracle for OZStaticVertex::isFlat() @ProChannel 0x4012e.

Calls the REAL exported symbol out of ProChannel.framework over the full cross-product of the
floating-point boundary values its four comparisons can turn on, and compares to the TypeScript
port in raw-port/src/channels/OZStaticVertex.ts.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZStaticVertex_isFlat_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

The method reads only four doubles — +0x48, +0x50, +0x58, +0x60 — so a synthetic object is a
complete stand-in. The object is poisoned with 0xEE so that a port reading any OTHER field would
show up as a divergence rather than passing on a lucky zero.

Values are carried over the wire as raw IEEE-754 BIT PATTERNS (hex strings), not as JSON floats:
Python's json emits bare NaN/Infinity, which JSON.parse rejects (OPS_LOG), and bit patterns also
make the comparison exact for -0.0 and NaN payloads.
"""
import ctypes
import glob
import itertools
import json
import math
import os
import platform
import struct
import subprocess
import sys

SYM = "_ZN14OZStaticVertex6isFlatEv"   # dlsym: no leading underscore
OBJ_SIZE = 0x100
POISON = 0xEE
OFFSETS = {"in0": 0x48, "out0": 0x50, "in1": 0x58, "out1": 0x60}
EPS = 1e-7
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "OZStaticVertex_isFlat_driver.ts")

# 15 values per component: zero and its negative, well inside, just inside, EXACTLY the epsilon
# (the exclusive boundary the `jbe` decides), just outside, far outside, and the non-finites.
VALUES = [
    0.0, -0.0,
    1e-9, -1e-9,
    9.9e-8, -9.9e-8,
    1e-7, -1e-7,
    1.0000001e-7, -1.0000001e-7,
    1.0, -1.0,
    float("nan"), float("inf"), float("-inf"),
]


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
    return "%016x" % struct.unpack("<Q", struct.pack("<d", x))[0]


def build_cases():
    return [{"in0": a, "out0": b, "in1": c, "out1": d}
            for a, b, c, d in itertools.product(VALUES, repeat=4)]


def run_native(cases, fn):
    obj = ctypes.create_string_buffer(OBJ_SIZE)
    out = []
    for c in cases:
        ctypes.memset(ctypes.addressof(obj), POISON, OBJ_SIZE)
        for name, off in OFFSETS.items():
            struct.pack_into("<d", obj, off, c[name])
        out.append(bool(fn(ctypes.addressof(obj))))
    return out


def run_ts(cases):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    wire = [{k: bits(v) for k, v in c.items()} for c in cases]
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(wire), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


# --- negative controls: plausible mis-transcriptions of THIS body -------------------------
def ctl_inclusive(c):
    """`jbe` read as `jb` — i.e. |t| <= eps instead of |t| < eps."""
    return all(abs(c[k]) <= EPS for k in OFFSETS)


def ctl_nan_is_flat(c):
    """Forget that an unordered ucomisd takes the `jbe` — treat NaN as passing."""
    return all(math.isnan(c[k]) or abs(c[k]) < EPS for k in OFFSETS)


def ctl_no_abs(c):
    """Drop the `andpd` sign mask and compare the signed value."""
    return all(c[k] < EPS for k in OFFSETS)


def ctl_inputs_only(c):
    """Check only the two components read first (+0x48, +0x58)."""
    return abs(c["in0"]) < EPS and abs(c["in1"]) < EPS


CONTROLS = [
    ("|t| <= eps (jbe read as jb)", ctl_inclusive),
    ("NaN treated as flat", ctl_nan_is_flat),
    ("signed compare (no andpd)", ctl_no_abs),
    ("only the two input components", ctl_inputs_only),
]


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    lib = load_with_rpath(os.path.join(fwdir, "ProChannel.framework", "ProChannel"))
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
        print(f"  case {i}: native={nv} ts={tv}  "
              + " ".join(f"{k}={cases[i][k]!r}" for k in OFFSETS))

    print("NEGATIVE CONTROLS (each is a plausible mis-read; a good corpus must reject all):")
    for name, f in CONTROLS:
        wrong = sum(1 for c, v in zip(cases, native) if f(c) != v)
        print(f"  {wrong:6d}/{len(cases)} wrong — {name}")

    print("VERIFIED vs live ProChannel" if not bad else "DIVERGED")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
