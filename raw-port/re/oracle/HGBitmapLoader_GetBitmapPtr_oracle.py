#!/usr/bin/env python3
"""Differential oracle for HGBitmapLoader::GetBitmapPtr() const @Helium 0xf3e50.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGBitmapLoader_GetBitmapPtr_oracle.py

Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). Addresses come from
the cached inventory, never from nm on the fat binary.

Checks that the getter returns the pointer at +0x198 VERBATIM — including null, and including
values that a port tempted to "validate" would change — and that it is a pure read.
"""
import ctypes
import os
import platform
import random
import struct
import sys

FW = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
      "Helium.framework/Versions/A/Helium")
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Helium.syms.txt")
SYM, VMADDR = "__ZNK14HGBitmapLoader12GetBitmapPtrEv", 0xf3e50
OBJ_SZ, FIELD = 0x200, 0x198


def image_slide(path):
    libc = ctypes.CDLL(None)
    libc._dyld_image_count.restype = ctypes.c_uint32
    libc._dyld_get_image_name.restype = ctypes.c_char_p
    libc._dyld_get_image_name.argtypes = [ctypes.c_uint32]
    libc._dyld_get_image_vmaddr_slide.restype = ctypes.c_void_p
    libc._dyld_get_image_vmaddr_slide.argtypes = [ctypes.c_uint32]
    for i in range(libc._dyld_image_count()):
        if libc._dyld_get_image_name(i).decode() == path:
            return int(libc._dyld_get_image_vmaddr_slide(i) or 0)
    raise SystemExit("image not loaded: " + path)


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING to run natively (%s): re-run under arch -x86_64"
                         % platform.machine())
    va = None
    for line in open(os.path.normpath(INVENTORY)):
        p = line.split()
        if len(p) == 3 and p[2] == SYM:
            va = int(p[0], 16)
    assert va == VMADDR, "vmaddr moved: %r != 0x%x" % (va, VMADDR)
    ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    slide = image_slide(FW)
    fn = ctypes.CFUNCTYPE(ctypes.c_uint64, ctypes.c_void_p)(va + slide)
    print("calling %s\n  at 0x%x  (x86_64 vmaddr 0x%x + slide 0x%x)" % (SYM, va + slide, va, slide))

    rng = random.Random(5)
    values = [0, 1, 0xFFFFFFFFFFFFFFFF, 0xAAAAAAAAAAAAAAAA, 0x00007FFFFFFFFFFF, 0xDEADBEEFCAFEF00D]
    values += [rng.getrandbits(64) for _ in range(500)]
    bad_ret = bad_write = 0
    for v in values:
        obj = ctypes.create_string_buffer(OBJ_SZ)
        ctypes.memset(obj, 0xAA, OBJ_SZ)
        struct.pack_into("<Q", obj, FIELD, v)
        before = bytes(obj.raw)
        got = fn(ctypes.addressof(obj))
        if got != v:
            bad_ret += 1
            if bad_ret <= 3:
                print("  DIV field=%#x returned=%#x" % (v, got))
        if bytes(obj.raw) != before:
            bad_write += 1

    print("GetBitmapPtr: %d cases  wrong return=%d  object modified=%d (a pure read)"
          % (len(values), bad_ret, bad_write))

    # negative controls over the same corpus
    ctrl = {
        "reads +0x1a0 instead of +0x198":
            sum(1 for v in values if v != 0xAAAAAAAAAAAAAAAA),
        "returns null when the slot looks invalid":
            sum(1 for v in values if v not in (0,)),
        "truncates the pointer to 32 bits":
            sum(1 for v in values if (v & 0xFFFFFFFF) != v),
    }
    print("negative controls (higher = the wrong port would have been caught): %r" % ctrl)

    ok = (bad_ret == 0 and bad_write == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
