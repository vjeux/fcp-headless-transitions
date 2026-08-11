#!/usr/bin/env python3
"""Differential oracle for ausdk::AUEffectBase::SetBypassEffect(bool) @Flexo 0x1241600
and its matched reader ShouldBypassEffect() @0x1241610.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/ausdk_AUEffectBase_SetBypassEffect_oracle.py

Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). Both symbols are
LOCAL (`t`), so they are called at x86_64 vmaddr + the loaded image's slide; Flexo needs its
@rpath chain preloaded depth-first before it will dlopen outside the app bundle. Addresses come
from the cached raw-port/army/inventory/Flexo.syms.txt, never from nm on the fat binary.

Proves: the store is ONE BYTE at +0x268 and nothing else in the object moves, and the matched
reader hands that same byte back zero-extended.
"""
import ctypes
import os
import platform
import sys
import subprocess

FLEXO = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
         "Flexo.framework/Versions/A/Flexo")
FRAMEWORKS = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(FLEXO))))
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Flexo.syms.txt")
SET_SYM, SET_VA = "__ZN5ausdk12AUEffectBase15SetBypassEffectEb", 0x1241600
GET_SYM, GET_VA = "__ZN5ausdk12AUEffectBase18ShouldBypassEffectEv", 0x1241610
OBJ_SZ, FIELD = 0x300, 0x268


def load_with_rpath(path, _seen=None):
    if _seen is None:
        _seen = set()
    if path in _seen:
        return None
    _seen.add(path)
    out = subprocess.run(["otool", "-arch", "x86_64", "-L", path],
                         capture_output=True, text=True).stdout
    for line in out.splitlines()[1:]:
        dep = line.strip().split(" (")[0]
        if dep.startswith("@rpath/"):
            cand = os.path.join(FRAMEWORKS, dep[len("@rpath/"):])
            if os.path.exists(cand):
                try:
                    load_with_rpath(cand, _seen)
                except OSError:
                    pass
    return ctypes.CDLL(path, ctypes.RTLD_GLOBAL)


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
    assert vmaddr(SET_SYM) == SET_VA and vmaddr(GET_SYM) == GET_VA, "vmaddrs moved"
    load_with_rpath(FLEXO)
    slide = image_slide(FLEXO)
    setf = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_uint8)(SET_VA + slide)
    getf = ctypes.CFUNCTYPE(ctypes.c_uint32, ctypes.c_void_p)(GET_VA + slide)
    print("SetBypassEffect at 0x%x, ShouldBypassEffect at 0x%x (slide 0x%x)"
          % (SET_VA + slide, GET_VA + slide, slide))

    bad_field = bad_other = bad_read = 0
    values = list(range(256))
    for v in values:
        obj = ctypes.create_string_buffer(OBJ_SZ)
        ctypes.memset(obj, 0xAA, OBJ_SZ)
        setf(ctypes.addressof(obj), v)
        raw = bytes(obj.raw)
        if raw[FIELD] != v:
            bad_field += 1
        if raw[:FIELD] != b"\xAA" * FIELD or raw[FIELD + 1:] != b"\xAA" * (OBJ_SZ - FIELD - 1):
            bad_other += 1
        if getf(ctypes.addressof(obj)) != v:
            bad_read += 1

    print("SetBypassEffect/ShouldBypassEffect: %d byte values  "
          "wrong byte at +0x268=%d  any other byte touched=%d  reader mismatch=%d"
          % (len(values), bad_field, bad_other, bad_read))
    print("  -> the store is exactly one byte at +0x268 (a 4- or 8-byte store would have "
          "shown up as 'any other byte touched'), and the matched reader movzbl's it back.")
    ok = (bad_field == 0 and bad_other == 0 and bad_read == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
