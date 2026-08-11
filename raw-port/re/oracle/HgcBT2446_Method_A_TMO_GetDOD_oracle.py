#!/usr/bin/env python3
"""Differential oracle for HgcBT2446_Method_A_TMO::GetDOD(HGRenderer*, int, HGRect) @Helium 0x359130.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HgcBT2446_Method_A_TMO_GetDOD_oracle.py

Rosetta is required: every @0xADDR in the port is an x86_64 offset, and a native arm64 process
would compare the port against code it did not transcribe (OPS_LOG: "the executable oracle calls
the wrong architecture" — it fails silently toward VERIFIED).

The symbol is LOCAL (`t`), so dlsym cannot reach it: the image slide is measured from an exported
symbol and the function is called at slide + vmaddr, with the OPCODE BYTES at that address checked
against the transcribed instructions first — otherwise "the call returned something" would not
prove which function ran (a bare `nm` reports ARM64 addresses even under Rosetta, per OPS_LOG).

`this` and the HGRenderer* are both passed as POISON pointers: the port claims neither is
dereferenced, and a wrong claim would fault here instead of passing quietly.
"""
import ctypes
import glob
import os
import platform
import random
import subprocess
import sys

FW = "Helium"
NM_SYM = "__ZN22HgcBT2446_Method_A_TMO6GetDODEP10HGRendereri6HGRect"
VMADDR = 0x359130
# movq %rcx,%rax ; testl %edx,%edx ; je +0x13 ; pushq %rbp ; movq %rsp,%rbp ; leaq ...
BODY = bytes.fromhex("4889c885d27413554889e5488d0d")
HGRECTNULL_VMADDR = 0x3d2284
POISON_PTR = 0xDEADBEEFDEADBEEF
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))


class HGRect(ctypes.Structure):
    """16 bytes, INTEGER class: passed in a register pair, returned in (rax, rdx)."""
    _fields_ = [("x", ctypes.c_int32), ("y", ctypes.c_int32),
                ("right", ctypes.c_int32), ("bottom", ctypes.c_int32)]

    def tup(self):
        return (self.x, self.y, self.right, self.bottom)


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


def symbol_table(fw, path):
    """The inventory cache, then `nm -n -arch x86_64` on the THIN slice — never nm on the 78 MB
    fat binary (swarm perf directive); the explicit -arch because a bare nm reports ARM64 even
    under Rosetta (OPS_LOG)."""
    text = ""
    cache = os.path.join(REPO, "raw-port", "army", "inventory", fw + ".syms.txt")
    if os.path.exists(cache):
        text = open(cache, encoding="utf-8", errors="replace").read()
    thin = "/tmp/%s.x86_64" % fw
    if not os.path.exists(thin):
        subprocess.run(["lipo", "-thin", "x86_64", path, "-output", thin], check=True)
    text += subprocess.run(["nm", "-n", "-arch", "x86_64", thin],
                           capture_output=True, text=True).stdout
    out = {}
    for line in text.splitlines():
        p = line.split(None, 2)
        if len(p) == 3 and p[0].strip():
            try:
                out.setdefault(p[2], (p[1], int(p[0], 16)))
            except ValueError:
                pass
    return out


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    fwdir = glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]
    path = os.path.join(fwdir, FW + ".framework", FW)
    lib = load_with_rpath(path)
    table = symbol_table(FW, path)
    if table[NM_SYM][1] != VMADDR:
        raise SystemExit("symbol moved: table says %s, port cites %#x"
                         % (table[NM_SYM][1], VMADDR))

    slide = None
    for name, (kind, va) in table.items():
        if kind == "T":
            try:
                a = ctypes.cast(getattr(lib, name[1:]), ctypes.c_void_p).value
            except AttributeError:
                continue
            if a:
                slide = a - va
                break
    if slide is None:
        raise SystemExit("could not measure the image slide")
    print(f"image slide = {slide:#x}")

    addr = VMADDR + slide
    got = ctypes.string_at(addr, len(BODY))
    print(f"bytes at {addr:#x}: {got.hex()}  expected: {BODY.hex()}  "
          f"{'MATCH' if got == BODY else 'MISMATCH'}")
    if got != BODY:
        raise SystemExit("the transcribed body is not at the computed address — refusing to sign")

    null_bytes = ctypes.string_at(HGRECTNULL_VMADDR + slide, 16)
    zeros = bytes(16)
    print("_HGRectNull @Helium %#x = %s (%s)"
          % (HGRECTNULL_VMADDR, null_bytes.hex(),
             "all zero" if null_bytes == zeros else "NOT all zero"))
    null_tup = (0, 0, 0, 0) if null_bytes == zeros else None

    fn = ctypes.CFUNCTYPE(HGRect, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int, HGRect)(addr)

    rng = random.Random(0x359130)
    rects = [HGRect(0, 0, 0, 0), HGRect(-2**31, -2**31, 2**31 - 1, 2**31 - 1),
             HGRect(1, 2, 3, 4), HGRect(-7, 11, -13, 17)]
    rects += [HGRect(*(rng.randint(-2**31, 2**31 - 1) for _ in range(4))) for _ in range(120)]
    idxs = [0, 1, -1, 2, 3, 7, -2**31, 2**31 - 1] + [rng.randint(-1000, 1000) for _ in range(40)]

    bad = []
    n = 0
    for r in rects:
        for i in idxs:
            live = fn(POISON_PTR, POISON_PTR, i, r).tup()
            port = r.tup() if i == 0 else null_tup          # the TS port
            n += 1
            if live != port:
                bad.append((i, r.tup(), live, port))
    print(f"cases={n}  divergences={len(bad)}  (this and HGRenderer* both passed as "
          f"{POISON_PTR:#x} — neither is dereferenced)")
    for i, rr, live, port in bad[:5]:
        print(f"  idx={i} r={rr}: live={live} port={port}")

    print("NEGATIVE CONTROLS (each is a plausible mis-read; the live answers must reject them):")
    r = HGRect(11, 22, 33, 44)
    at0 = fn(POISON_PTR, POISON_PTR, 0, r).tup()
    at1 = fn(POISON_PTR, POISON_PTR, 1, r).tup()
    print(f"  {'rejected' if at0 != null_tup else 'NOT REJECTED'} — the branch polarity is "
          f"inverted (input 0 would answer HGRectNull; live said {at0})")
    print(f"  {'rejected' if at1 == null_tup else 'NOT REJECTED'} — every input passes the rect "
          f"through (input 1 would answer {r.tup()}; live said {at1})")
    print(f"  {'rejected' if at0 == r.tup() else 'NOT REJECTED'} — the rect halves are swapped or "
          f"only half is returned (live returned the argument intact: {at0})")

    ok = not bad and null_tup is not None
    print("VERIFIED vs live Helium" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
