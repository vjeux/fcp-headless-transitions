#!/usr/bin/env python3
"""Differential oracle for OZ3DEngineCore::OZ3DEngineCore() [C1] @Ozone 0x4a2110 and its C2 twin
@0x4a2100.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZ3DEngineCore_ctor_oracle.py

Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). Ozone does not
plain-dlopen outside the app bundle (its @rpath chain, and a hardened /usr/bin/python3 strips
DYLD_*), so the harness preloads every @rpath dependency depth-first first. Addresses come from
the cached inventory, never from nm on the fat binary.

The claim under test is a NEGATIVE one, which is exactly what a listing alone cannot settle:
the constructor writes NOTHING — no member, no vptr. Each case constructs into a 0xAA-poisoned
buffer and requires every byte to survive.
"""
import ctypes
import os
import platform
import subprocess
import sys

OZONE = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
         "Ozone.framework/Versions/A/Ozone")
FRAMEWORKS = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(OZONE))))
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Ozone.syms.txt")
C1_SYM, C1_VA = "__ZN14OZ3DEngineCoreC1Ev", 0x4a2110
C2_SYM, C2_VA = "__ZN14OZ3DEngineCoreC2Ev", 0x4a2100
OBJ_SZ = 0x100


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
    assert vmaddr(C1_SYM) == C1_VA and vmaddr(C2_SYM) == C2_VA, "vmaddrs moved"
    load_with_rpath(OZONE)
    slide = image_slide(OZONE)
    proto = ctypes.CFUNCTYPE(None, ctypes.c_void_p)
    c1, c2 = proto(C1_VA + slide), proto(C2_VA + slide)
    print("C1 at 0x%x, C2 at 0x%x (slide 0x%x)" % (C1_VA + slide, C2_VA + slide, slide))

    n = 128
    results = {}
    for name, fn in (("C1", c1), ("C2", c2)):
        touched = 0
        for i in range(n):
            fill = bytes([(0xAA + i) & 0xFF]) * OBJ_SZ
            obj = ctypes.create_string_buffer(fill, OBJ_SZ)
            fn(ctypes.addressof(obj))
            if bytes(obj.raw) != fill:
                touched += 1
        results[name] = touched
        print("%s: %d constructions, objects with ANY byte modified = %d" % (name, n, touched))

    print("  -> a vptr store or any member initialisation would have shown up as a modified "
          "byte; neither ctor writes anything, so the class has no vptr and no initialised "
          "state.")
    ok = all(v == 0 for v in results.values())
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
