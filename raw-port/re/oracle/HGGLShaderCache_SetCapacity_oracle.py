#!/usr/bin/env python3
"""Differential oracle for HGGLShaderCache::SetCapacity(unsigned long) @Helium 0x175a10.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGGLShaderCache_SetCapacity_oracle.py

Rosetta is required (OPS_LOG: the oracle that calls the wrong architecture fails silently TOWARD
verified), and the symbol is LOCAL (`nm` type `t`), so it is called at (x86_64 vmaddr + image
slide) rather than through dlsym. The vmaddr comes from the repo's cached symbol inventory, never
from a bare `nm` — which reports the ARM64 slice even under Rosetta, and which the 2026-08-11
perf directive also bans on the fat framework (60-120s and a full core per call).

A setter has no return value to compare, so the differential checks the three things that can
actually be wrong: WHICH bytes moved, WHAT they hold, and whether the live getter agrees. The
record is poisoned with 0xEE so a store to any undecoded slot is visible, and `GetCapacity`
@0x150d60 (ICF-folded with HGComicDesignerInterfaceImplementation::GetLooseness — same address,
same bytes) is called live for the round-trip.
"""
import ctypes
import json
import os
import platform
import random
import struct
import subprocess
import sys

SET_SYM = "__ZN15HGGLShaderCache11SetCapacityEm"
GET_SYM = "__ZNK15HGGLShaderCache11GetCapacityEv"
OBJ_SIZE = 0x100
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TS_DRIVER = os.path.join(REPO, "raw-port", "re", "oracle", "HGGLShaderCache_SetCapacity_driver.ts")
FW = "/Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium"


def x86_vmaddr(symbol, fw="Helium"):
    """x86_64 vmaddr from the cached inventory (see the module docstring for why not `nm`).

    The cache is gitignored, so it is missing from a pool worktree — try this tree, then the
    canonical checkout, then fall back to `nm` on the THIN slice disasm.sh leaves in /tmp.
    """
    rel = os.path.join("raw-port", "army", "inventory", f"{fw}.syms.txt")
    for root in (REPO, os.path.expanduser("~/random/final-cut-pro-transitions")):
        path = os.path.join(root, rel)
        if os.path.exists(path):
            hits = {ln.split()[0] for ln in open(path) if ln.rstrip("\n").endswith(" " + symbol)}
            if len(hits) == 1:
                return int(hits.pop(), 16)
            raise SystemExit(f"expected one address for {symbol} in {path}, got {sorted(hits)}")
    thin = f"/tmp/{fw}.x86_64"
    out = subprocess.run(["nm", "-n", thin], capture_output=True, text=True).stdout
    hits = {ln.split()[0] for ln in out.splitlines() if ln.endswith(" " + symbol)}
    if len(hits) != 1:
        raise SystemExit(f"expected one address for {symbol} in {thin}, got {sorted(hits)}")
    return int(hits.pop(), 16)


def image_slide(substr):
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_long
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    for i in range(libc._dyld_image_count()):
        name = libc._dyld_get_image_name(i).decode()
        if substr in name:
            return libc._dyld_get_image_vmaddr_slide(i), name
    raise SystemExit(f"{substr} is not in the loaded image list")


def build_values():
    rng = random.Random(0x175A10)
    vals = [0, 1, 2, 0xFFFF, 0x1_0000_0000, (1 << 53) - 1, 1 << 53, (1 << 53) + 1,
            1 << 62, 1 << 63, (1 << 64) - 1, 0xDEADBEEFCAFEBABE]
    while len(vals) < 1024:
        vals.append(rng.getrandbits(64))
    return vals


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    slide, name = image_slide("Helium.framework")
    set_va, get_va = x86_vmaddr(SET_SYM), x86_vmaddr(GET_SYM)
    print(f"image={name}\n  SetCapacity vmaddr=0x{set_va:x}  GetCapacity vmaddr=0x{get_va:x}  "
          f"slide=0x{slide:x}")
    if set_va != 0x175A10 or get_va != 0x150D60:
        raise SystemExit("unexpected vmaddrs: the port cites @Helium 0x175a10 / 0x150d60")
    setter = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_uint64)(slide + set_va)
    getter = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(slide + get_va)

    values = build_values()
    stored, roundtrip, collateral = [], [], 0
    for v in values:
        obj = ctypes.create_string_buffer(OBJ_SIZE)
        ctypes.memset(ctypes.addressof(obj), 0xEE, OBJ_SIZE)
        before = ctypes.string_at(ctypes.addressof(obj), OBJ_SIZE)
        setter(ctypes.addressof(obj), v)
        after = ctypes.string_at(ctypes.addressof(obj), OBJ_SIZE)
        stored.append(struct.unpack_from("<Q", after, 0x20)[0])
        roundtrip.append(getter(ctypes.addressof(obj)))
        if before[:0x20] != after[:0x20] or before[0x28:] != after[0x28:]:
            collateral += 1

    p = subprocess.run([os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx"), TS_DRIVER],
                       input=json.dumps(["%016x" % v for v in values]),
                       capture_output=True, text=True, cwd=os.path.join(REPO, "raw-port"))
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    ts = [int(h, 16) for h in json.loads(p.stdout.strip().splitlines()[-1])]

    bad = [i for i in range(len(values))
           if not (stored[i] == roundtrip[i] == ts[i] == values[i])]
    print(f"values={len(values)}  collateral-writes={collateral}  divergences={len(bad)}")
    for i in bad[:8]:
        print(f"  value 0x{values[i]:016x}: stored=0x{stored[i]:016x} "
              f"getter=0x{roundtrip[i]:016x} ts=0x{ts[i]:016x}")

    controls = {
        "low 32 bits only": sum(1 for v in values if (v & 0xFFFFFFFF) != v),
        "stored at +0x18 instead of +0x20": sum(1 for v in values if v != 0xEEEEEEEEEEEEEEEE),
        "field modelled as a JS number (float64)": sum(1 for v in values if int(float(v)) != v),
    }
    for label, n in controls.items():
        print(f"  NEGATIVE CONTROL {label}: {n} divergences")

    ok = not bad and collateral == 0
    print("VERIFIED vs live Helium" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
