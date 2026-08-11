#!/usr/bin/env python3
"""Differential oracle for HGTextureManager::recycleClientStorageTextures(bool) @Helium 0x4b330.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGTextureManager_recycleClientStorage_oracle.py

Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). Addresses come from
the cached inventory, never from nm on the fat binary.

Proves the store is exactly ONE BYTE at +0xac and that nothing else in the object moves — in
particular that it does NOT disturb the u32 `storageRecyclingPolicy` slot at +0xa8 that the
immediately preceding function @0x4b320 owns, which is the neighbour a wrong width would clobber.
"""
import ctypes
import os
import platform
import struct
import sys

FW = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
      "Helium.framework/Versions/A/Helium")
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Helium.syms.txt")
SYM, VMADDR = "__ZN16HGTextureManager28recycleClientStorageTexturesEb", 0x4b330
POLICY_SYM, POLICY_VA = ("__ZN16HGTextureManager22storageRecyclingPolicyENS_"
                         "29TextureStorageRecyclingPolicyE"), 0x4b320
OBJ_SZ, FIELD, POLICY_FIELD = 0x200, 0xac, 0xa8


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


def main():
    if platform.machine() != "x86_64":
        raise SystemExit("REFUSING to run natively (%s): re-run under arch -x86_64"
                         % platform.machine())
    assert vmaddr(SYM) == VMADDR, "vmaddr moved"
    ctypes.CDLL(FW, ctypes.RTLD_GLOBAL)
    slide = image_slide(FW)
    fn = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_uint8)(VMADDR + slide)
    setpolicy = ctypes.CFUNCTYPE(None, ctypes.c_void_p,
                                 ctypes.c_uint32)(vmaddr(POLICY_SYM) + slide)
    print("recycleClientStorageTextures at 0x%x (x86_64 vmaddr 0x%x + slide 0x%x)"
          % (VMADDR + slide, VMADDR, slide))

    bad_field = bad_other = 0
    for v in range(256):
        obj = ctypes.create_string_buffer(OBJ_SZ)
        ctypes.memset(obj, 0xAA, OBJ_SZ)
        fn(ctypes.addressof(obj), v)
        raw = bytes(obj.raw)
        if raw[FIELD] != v:
            bad_field += 1
        if raw[:FIELD] != b"\xAA" * FIELD or raw[FIELD + 1:] != b"\xAA" * (OBJ_SZ - FIELD - 1):
            bad_other += 1
    print("256 byte values: wrong byte at +0xac=%d  any other byte touched=%d"
          % (bad_field, bad_other))

    # the two neighbouring setters must not disturb each other's slot
    cross = 0
    for v, pol in ((1, 0xDEADBEEF), (0, 0xFFFFFFFF), (0xFF, 0x12345678)):
        obj = ctypes.create_string_buffer(OBJ_SZ)
        ctypes.memset(obj, 0xAA, OBJ_SZ)
        setpolicy(ctypes.addressof(obj), pol)
        fn(ctypes.addressof(obj), v)
        raw = bytes(obj.raw)
        if struct.unpack_from("<I", raw, POLICY_FIELD)[0] != pol or raw[FIELD] != v:
            cross += 1
    print("neighbour independence (+0xa8 u32 policy vs +0xac byte): %d/3 interfered" % cross)

    ok = (bad_field == 0 and bad_other == 0 and cross == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
