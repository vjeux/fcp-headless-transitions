#!/usr/bin/env python3
"""Differential oracle for HGRenderJob::UsesOnlyGPUResource() @Helium 0x54b20.

Calls the REAL exported symbol out of Helium.framework over an EXHAUSTIVE cross-product of the
inputs its 40 instructions actually branch on, and compares to the TypeScript port in
raw-port/src/render/HGRenderJob.ts.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGRenderJob_UsesOnlyGPUResource_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

The method reads only six things — `_resource` (u32 @+0x10), the pointer @+0x18 and the u32 at
+0x08 of its pointee, the pointer @+0x50, and the begin/end pair @+0x28/+0x30 of a vector of
16-byte entries whose first qword is a pointer with a u32 at +0x08 — so a synthetic object is a
complete stand-in. The corpus covers resource 0..8 x {ref18 null, tag 0, 1, 2} x {slot50 null,
non-null} x vectors of length 0..3 over tags {0, 1, 2}, which reaches every exit in the body.
"""
import ctypes
import glob
import itertools
import json
import os
import platform
import struct
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

SYM = "_ZN11HGRenderJob19UsesOnlyGPUResourceEv"   # dlsym: no leading underscore
OBJ_SIZE = 0x100
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.environ.get("FCT_TS_DRIVER") or os.path.join(
    REPO, "raw-port", "re", "oracle", "HGRenderJob_UsesOnlyGPUResource_driver.ts")


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
    cases = []
    vecs = [()]
    for n in (1, 2, 3):
        vecs += list(itertools.product((0, 1, 2), repeat=n))
    for resource in range(0, 9):
        for ref18 in (None, 0, 1, 2):
            for slot50 in (False, True):
                for vec in vecs:
                    cases.append({"resource": resource, "ref18": ref18,
                                  "slot50": slot50, "vec": list(vec)})
    return cases


def run_native(cases, fn):
    out = []
    for c in cases:
        keep = []
        obj = ctypes.create_string_buffer(OBJ_SIZE)
        ctypes.memset(ctypes.addressof(obj), 0, OBJ_SIZE)
        struct.pack_into("<I", obj, 0x10, c["resource"] & 0xFFFFFFFF)
        if c["ref18"] is not None:
            ref = ctypes.create_string_buffer(0x20)
            ctypes.memset(ctypes.addressof(ref), 0, 0x20)
            struct.pack_into("<I", ref, 0x08, c["ref18"] & 0xFFFFFFFF)
            keep.append(ref)
            struct.pack_into("<Q", obj, 0x18, ctypes.addressof(ref))
        if c["slot50"]:
            struct.pack_into("<Q", obj, 0x50, 0xDEADBEEF)
        if c["vec"]:
            n = len(c["vec"])
            entries = ctypes.create_string_buffer(0x10 * n)   # 16 bytes per entry
            ctypes.memset(ctypes.addressof(entries), 0, 0x10 * n)
            keep.append(entries)
            for i, tag in enumerate(c["vec"]):
                pointee = ctypes.create_string_buffer(0x20)
                ctypes.memset(ctypes.addressof(pointee), 0, 0x20)
                struct.pack_into("<I", pointee, 0x08, tag & 0xFFFFFFFF)
                keep.append(pointee)
                struct.pack_into("<Q", entries, 0x10 * i, ctypes.addressof(pointee))
            begin = ctypes.addressof(entries)
            struct.pack_into("<Q", obj, 0x28, begin)
            struct.pack_into("<Q", obj, 0x30, begin + 0x10 * n)
        keep.append(obj)
        out.append(bool(fn(ctypes.addressof(obj))))
    return out


def run_ts(cases):
    tsx = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
    p = subprocess.run([tsx, TS_DRIVER], input=json.dumps(cases), capture_output=True, text=True,
                       cwd=os.path.join(REPO, "raw-port"), timeout=DRIVER_TIMEOUT)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    return json.loads(p.stdout.strip().splitlines()[-1])


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
    print("VERIFIED vs live Helium" if not bad else "DIVERGED")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
