#!/usr/bin/env python3
"""Differential oracle for HgcBT2100_PQ_InverseOETF_qtApprox::GetParameter(int, float*)
@Helium 0x3b00e0.

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/HgcBT2100_PQ_InverseOETF_qtApprox_GetParameter_oracle.py

Rosetta because the port cites x86_64 offsets (OPS_LOG "wrong architecture"). The symbol is a
LOCAL (`t`), so it is called at x86_64 vmaddr + the loaded image's slide. Addresses come from the
cached inventory, never from nm on the fat binary.

Per case:
  * index 0 and 1 -> returns 0 and copies EXACTLY the four floats of slot `index` (stride 0x20)
    into out[0..3], leaving out[4..] untouched;
  * any other index -> returns -1 and writes NOTHING. The machine's test is `cmpl $0x1 ; ja`,
    an UNSIGNED compare, so -1 must be rejected as 0xFFFFFFFF and not treated as "below 1".
  * the receiver object is never written through.
"""
import ctypes
import os
import platform
import random
import struct
import sys

FW = ("/Applications/Final Cut Pro.app/Contents/Frameworks/"
      "Helium.framework/Versions/A/Helium")
SYM = "__ZN33HgcBT2100_PQ_InverseOETF_qtApprox12GetParameterEiPf"
VMADDR = 0x3b00e0
INVENTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "..", "..", "army", "inventory", "Helium.syms.txt")
PARAM_SZ = 0x160
SLOT = 0x20
OUT_LANES = 8            # twice what the function should write, so an over-copy shows up
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
    """The transcription: -1 unless the UNSIGNED index is <= 1, else four movss lane copies."""
    if (index & 0xFFFFFFFF) > 1:                 # @0x3b00e5 cmpl $0x1,%esi ; ja
        return -1                                # @0x3b00e0 movl $0xffffffff,%eax
    base = (index * SLOT) // 4                   # @0x3b00f7 shlq $0x5 -> 32 bytes = 8 lanes
    for i in range(4):                           # @0x3b00fb..0x3b0120, four movss pairs
        out[i] = params[base + i]
    return 0                                     # @0x3b0125 xorl %eax,%eax


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
    indices = [0, 1, 0, 1, 2, 3, -1, -2, 7, -100, 0x7fffffff, -0x80000000] + \
              [rng.choice([0, 1, rng.randint(-1000, 1000)]) for _ in range(88)]
    div = ret_div = overcopy = obj_written = 0
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
                    print("  DIV index=%d rc=%d live=%s model=%s" % (index, rc, got[:5], want[:5]))
            if any(struct.pack("<f", got[i]) != struct.pack("<f", SENTINEL)
                   for i in range(4, OUT_LANES)):
                overcopy += 1
            if bytes(obj.raw) != b"\xAA" * 0x198 + bytes(obj.raw)[0x198:0x1a0] + b"\xAA" * 0x60:
                obj_written += 1

    print("GetParameter: %d cases  value divergences=%d  return divergences=%d  "
          "wrote past 16 bytes=%d  object written=%d" % (n, div, ret_div, overcopy, obj_written))

    # negative controls, over the same index corpus
    controls = {}
    for label, bad in (
            ("signed bound (accepts negative indices)",
             lambda ix: -1 if not (-1 <= 0 and ix <= 1) else (0 if ix <= 1 else -1)),
            ("bound 0 instead of 1 (rejects slot 1)",
             lambda ix: 0 if (ix & 0xFFFFFFFF) == 0 else -1),
            ("bound 2 instead of 1 (accepts a slot that does not exist)",
             lambda ix: 0 if (ix & 0xFFFFFFFF) <= 2 else -1)):
        caught = 0
        for index in indices:
            good = -1 if (index & 0xFFFFFFFF) > 1 else 0
            if bad(index) != good:
                caught += 1
        controls[label] = caught
    # slot-stride control needs the values, not just the return code
    stride_caught = 0
    pv = [float(i) for i in range(PARAM_SZ // 4)]
    for index in (0, 1):
        good = [pv[(index * SLOT) // 4 + i] for i in range(4)]
        wrong = [pv[(index * 0x10) // 4 + i] for i in range(4)]   # 0x10 stride instead of 0x20
        if good != wrong:
            stride_caught += 1
    controls["slot stride 0x10 instead of 0x20"] = stride_caught
    print("negative controls (higher = the wrong port would have been caught): %r" % controls)

    ok = (div == 0 and ret_div == 0 and overcopy == 0 and obj_written == 0)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
