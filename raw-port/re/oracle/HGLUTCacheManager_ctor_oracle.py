#!/usr/bin/env python3
"""Differential oracle for HGLUTCacheManager::HGLUTCacheManager(HGRenderer*) @Helium 0xdfc50 (C1),
plus the byte-identical C2 twin @0xdfc30.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGLUTCacheManager_ctor_oracle.py

Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). Addresses come from
the cached inventory, never from nm on the fat binary.

Checks per case, on a 0xAA-poisoned buffer:
  * +0x00 == the renderer argument, verbatim;
  * +0x08 == the ADDRESS of the object + 0x10 (libc++'s empty-tree `__begin_node_ == end()`
    invariant) — the fact a port is most likely to get wrong by storing null instead;
  * +0x10 == 0 and +0x18 == 0;
  * NO byte outside +0x00..+0x1f is touched, which is what bounds the constructed object at
    0x20 bytes.
C2 is run through the identical checks so the "byte-identical twin" claim is measured, not assumed.
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
C1_SYM, C1_VA = "__ZN17HGLUTCacheManagerC1EP10HGRenderer", 0xdfc50
C2_SYM, C2_VA = "__ZN17HGLUTCacheManagerC2EP10HGRenderer", 0xdfc30
OBJ_SZ, CTOR_SZ = 0x80, 0x20


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


def vmaddr(sym):
    for line in open(os.path.normpath(INVENTORY)):
        p = line.split()
        if len(p) == 3 and p[2] == sym:
            return int(p[0], 16)
    raise SystemExit("not in the cached symbol table: " + sym)


def run(fn, rng, n):
    bad_renderer = bad_begin = bad_zero = bad_other = 0
    images = []
    for _ in range(n):
        obj = ctypes.create_string_buffer(OBJ_SZ)
        ctypes.memset(obj, 0xAA, OBJ_SZ)
        addr = ctypes.addressof(obj)
        renderer = rng.getrandbits(47) & ~0xF     # a plausible, aligned pointer value
        fn(addr, renderer)
        raw = bytes(obj.raw)
        got_r, got_b, got_l, got_s = struct.unpack_from("<4Q", raw, 0)
        if got_r != renderer:
            bad_renderer += 1
        if got_b != addr + 0x10:
            bad_begin += 1
        if got_l != 0 or got_s != 0:
            bad_zero += 1
        if raw[CTOR_SZ:] != b"\xAA" * (OBJ_SZ - CTOR_SZ):
            bad_other += 1
        # normalise the self-pointer so the two ctors' images can be compared across buffers
        images.append(raw[:8] + b"\x00" * 8 + raw[16:])
    return bad_renderer, bad_begin, bad_zero, bad_other, images


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING to run natively (%s): re-run under arch -x86_64"
                         % platform.machine())
    assert vmaddr(C1_SYM) == C1_VA and vmaddr(C2_SYM) == C2_VA, "vmaddrs moved"
    ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    slide = image_slide(FW)
    proto = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)
    c1, c2 = proto(C1_VA + slide), proto(C2_VA + slide)
    print("C1 at 0x%x, C2 at 0x%x (slide 0x%x)" % (C1_VA + slide, C2_VA + slide, slide))

    n = 512
    r1 = run(c1, random.Random(5), n)
    print("C1 ctor: %d cases  renderer wrong=%d  __begin_node_ != this+0x10 =%d  "
          "root/size not zero=%d  bytes touched outside +0x00..+0x1f=%d" % ((n,) + r1[:4]))
    r2 = run(c2, random.Random(5), n)
    print("C2 twin: %d cases  renderer wrong=%d  __begin_node_ != this+0x10 =%d  "
          "root/size not zero=%d  bytes touched outside +0x00..+0x1f=%d" % ((n,) + r2[:4]))
    twin = (r1[4] == r2[4])
    print("C1 and C2 produce byte-identical objects on all %d cases: %s" % (n, twin))

    ok = all(v == 0 for v in r1[:4]) and all(v == 0 for v in r2[:4]) and twin
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
