#!/usr/bin/env python3
"""Differential oracle for HgcSMAAEdgeDetect::GetParameter(int, float*) @Helium 0x203570.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HgcSMAAEdgeDetect_GetParameter_oracle.py

Under Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). The symbol is
a LOCAL (`t`), so it is called at x86_64 vmaddr + the loaded image's slide. Symbol addresses come
from the cached raw-port/army/inventory/Helium.syms.txt, never from nm on the fat binary.

Checks, per case:
  * index != 0  -> returns -1 AND writes nothing (the out buffer is bit-identical);
  * index == 0  -> returns 0 and copies EXACTLY the first 16 bytes of the parameter block into
                   out[0..3], leaving out[4..] untouched (so a 32-byte copy would be caught);
  * the receiver object is never written through, on either path.
"""
import ctypes
import os
import platform
import random
import struct
import sys

FW = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
      "Helium.framework/Versions/A/Helium")
SYM = "__ZN17HgcSMAAEdgeDetect12GetParameterEiPf"
VMADDR = 0x203570
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Helium.syms.txt")
PARAM_SZ = 0xE0
OUT_LANES = 8          # twice what the function should write, so an over-copy shows up
SENTINEL = -777.0


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


def model(index, params, out):
    """The transcription: -1 unless index == 0, else four movss lane copies and 0."""
    if index != 0:                                   # @0x203575 testl %esi,%esi ; jne -> ret
        return -1                                    # @0x203570 movl $0xffffffff,%eax
    for i in range(4):                               # @0x203585..0x2035a6, four movss pairs
        out[i] = params[i]
    return 0                                         # @0x2035ab xorl %eax,%eax


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
    fn = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_int,
                          ctypes.c_void_p)(va + slide)
    print("calling %s\n  at 0x%x  (x86_64 vmaddr 0x%x + slide 0x%x)" % (SYM, va + slide, va, slide))

    rng = random.Random(5)
    indices = [0, 0, 0, 1, -1, 2, 7, -100, 0x7fffffff, -0x80000000] + \
              [rng.randint(-1000, 1000) for _ in range(90)]
    div = ret_div = obj_written = overcopy = 0
    n = 0
    for _ in range(6):
        for index in indices:
            n += 1
            pvals = [struct.unpack("<f", struct.pack("<I", rng.getrandbits(32)))[0]
                     for _ in range(PARAM_SZ // 4)]
            praw = ctypes.create_string_buffer(PARAM_SZ + 64)
            paddr = (ctypes.addressof(praw) + 31) & ~31
            ctypes.memmove(paddr, struct.pack("<%df" % len(pvals), *pvals), 4 * len(pvals))

            obj = ctypes.create_string_buffer(0x200)
            ctypes.memset(obj, 0xAA, 0x200)
            struct.pack_into("<Q", obj, 0x198, paddr)

            out = (ctypes.c_float * OUT_LANES)(*([SENTINEL] * OUT_LANES))
            want = [SENTINEL] * OUT_LANES
            want_rc = model(index, pvals, want)

            rc = fn(ctypes.addressof(obj), index, ctypes.byref(out))
            got = [out[i] for i in range(OUT_LANES)]

            if rc != want_rc:
                ret_div += 1
            if [struct.pack("<f", x) for x in got] != [struct.pack("<f", x) for x in want]:
                div += 1
                if div <= 3:
                    print("  DIV index=%d live=%s model=%s" % (index, got[:5], want[:5]))
            if any(struct.pack("<f", got[i]) != struct.pack("<f", SENTINEL)
                   for i in range(4, OUT_LANES)):
                overcopy += 1
            if bytes(obj.raw) != b"\xAA" * 0x198 + bytes(obj.raw)[0x198:0x1a0] + b"\xAA" * 0x60:
                obj_written += 1

    print("HgcSMAAEdgeDetect::GetParameter: %d cases  value divergences=%d  return divergences=%d  "
          "wrote past 16 bytes=%d  object written=%d" % (n, div, ret_div, overcopy, obj_written))

    # negative controls, measured on the same corpus
    controls = {}
    for name, bad in (
            ("accepts any index instead of only 0",
             lambda ix, p, o: (0, [p[i] for i in range(4)])),
            ("returns 0 instead of -1 for a bad index",
             lambda ix, p, o: (0, o) if ix != 0 else (0, [p[i] for i in range(4)])),
            ("copies 8 lanes instead of 4",
             lambda ix, p, o: (-1, o) if ix != 0 else (0, [p[i] for i in range(8)]))):
        caught = 0
        rng2 = random.Random(5)
        for _ in range(6):
            for index in indices:
                pv = [struct.unpack("<f", struct.pack("<I", rng2.getrandbits(32)))[0]
                      for _ in range(PARAM_SZ // 4)]
                base = [SENTINEL] * OUT_LANES
                good = list(base)
                good_rc = model(index, pv, good)
                brc, bout = bad(index, pv, list(base))
                bout = (list(bout) + base)[:OUT_LANES] if index == 0 or name.startswith("accepts") \
                    else list(base)
                if brc != good_rc or [struct.pack("<f", x) for x in bout] != \
                        [struct.pack("<f", x) for x in good]:
                    caught += 1
        controls[name] = caught
    print("negative controls (higher = the wrong port would have been caught): %r" % controls)

    ok = (div == 0 and ret_div == 0 and overcopy == 0 and obj_written == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
