#!/usr/bin/env python3
"""Differential oracle for OZChannelImageWithOptions::getOffset() @Ozone 0x31d940.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannelImageWithOptions_getOffset_oracle.py

Rosetta is required (OPS_LOG: an oracle on the wrong architecture fails silently TOWARD
verified). The symbol is LOCAL (`nm` type `t`), so it is called at (x86_64 vmaddr + image slide);
the vmaddr comes from the repo's cached symbol inventory, never a bare `nm`, which reports the
ARM64 address even under Rosetta (and which the perf directive bans on the fat framework).

Ozone does dlopen outside the app bundle once its @rpath dependencies are preloaded depth-first
(OPS_LOG, worker 1) — no DYLD_* variable can help, since /usr/bin/python3 is hardened.

WHAT IS BEING PROVEN. The body is one instruction, `leaq 0x270(%rdi), %rax`, so there are exactly
two readings and they are trivially distinguishable at runtime:
  * ADDRESS-OF (the port's reading): the return value is `this + 0x270`;
  * a LOAD misread (`movq 0x270(%rdi), %rax`): the return value is the QWORD stored at +0x270.
Each record is filled so those two answers can never coincide: the qword at +0x270 holds a poison
value that is not a valid address, and the receiver addresses vary. Both hypotheses are scored.
"""
import ctypes
import glob
import os
import platform
import random
import struct
import subprocess
import sys

SYM = "__ZN25OZChannelImageWithOptions9getOffsetEv"
OFFSET = 0x270
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
POISON = 0xDEADBEEF0BADF00D


def fwdir():
    return glob.glob("/Applications/Final*Cut*Pro.app/Contents/Frameworks")[0]


def load_with_rpath(path, seen=None):
    seen = seen if seen is not None else set()
    real = os.path.realpath(path)
    if real in seen:
        return None
    seen.add(real)
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(fwdir(), dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


def x86_vmaddr(symbol, fw="Ozone"):
    """x86_64 vmaddr from the cached inventory; the cache is gitignored, so fall back to the
    canonical checkout and then to `nm` on the THIN /tmp slice — never the fat framework."""
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


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING TO RUN natively: re-run as `arch -x86_64 /usr/bin/python3 "
                         + os.path.relpath(__file__, REPO) + "`")
    load_with_rpath(os.path.join(fwdir(), "Ozone.framework", "Ozone"))
    slide, name = image_slide("Ozone.framework")
    vmaddr = x86_vmaddr(SYM)
    print(f"image={name}\n  x86_64 vmaddr=0x{vmaddr:x}  slide=0x{slide:x}  call=0x{slide+vmaddr:x}")
    if vmaddr != 0x31D940:
        raise SystemExit(f"unexpected vmaddr 0x{vmaddr:x}: the port cites @Ozone 0x31d940")
    fn = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(slide + vmaddr)

    rng = random.Random(0x31D940)
    addr_of_hits = load_hits = 0
    keep = []
    for i in range(4096):
        size = rng.choice([0x300, 0x400, 0x1000, 0x280 + rng.randrange(0, 0x200)])
        buf = ctypes.create_string_buffer(size)
        ctypes.memset(ctypes.addressof(buf), 0xEE, size)
        struct.pack_into("<Q", buf, OFFSET, POISON)   # so "load" != "address-of", always
        keep.append(buf)                              # keep every buffer alive: distinct addresses
        this = ctypes.addressof(buf)
        got = fn(this)
        if got == this + OFFSET:
            addr_of_hits += 1
        if got == POISON:
            load_hits += 1
    print(f"records=4096  returned this+0x{OFFSET:x}: {addr_of_hits}  "
          f"returned the QWORD at +0x{OFFSET:x} (the load misread): {load_hits}")
    ok = addr_of_hits == 4096 and load_hits == 0
    print("VERIFIED vs live Ozone (leaq = address-of, offset 0x270)" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
