#!/usr/bin/env python3
"""OZRenderParams::setImageType(PCImageType) @Ozone 0x270800 — differential against the LIVE binary.

    arch -x86_64 /usr/bin/python3 OZRenderParams_setImageType_oracle.py

WHY ROSETTA: the port is transcribed from the x86_64 slice (every @0xADDR in
`raw-port/src/nodes/OZRenderParams.ts` is an x86_64 offset and `disasm.sh` thins to that slice),
while this box is arm64. Calling the arm64 image would compare the port against code it did not
transcribe — OPS_LOG's "the executable oracle calls the wrong architecture, and fails toward
ACCEPT". `ozone_loader` refuses to run unless the process really is x86_64.

WHAT IS BEING PROVEN. The body is ten lines and makes exactly three claims:

    0x270804  movl   %esi, 0x140(%rdi)      (1) a FOUR-byte store of the enum arg at +0x140
    0x27080a  xorps  %xmm0, %xmm0
    0x27080d  movups %xmm0, 0x188(%rdi)     (2) SIXTEEN bytes of zero at +0x188
    0x270814  movups %xmm0, 0x198(%rdi)     (2) SIXTEEN bytes of zero at +0x198
                                            (3) and nothing else in the object is written

A test that only read the field back would establish claim 1 and neither of the others. So this
allocates the object itself as a POISONED arena, calls the real function, and diffs the arena BYTE
FOR BYTE — which proves both "the intended bytes changed" and, the part a read-back can never show,
"nothing else did". That is the memory-mutation recipe OPS_LOG records for
`OZScene::clearTemporaryFilesPersistence`, applied to a setter.

SELF-CHECK FIRST. dlsym must land on `slide + 0x270800` and the bytes there must be the prologue of
the body that was transcribed. Without that a passing number means nothing (OPS_LOG: take the vmaddr
from the cached x86_64 inventory, then verify the opcode bytes before trusting a result).

NEGATIVE CONTROLS. Three MUTATED EXPECTATIONS are scored next to the real one — an 8-byte store, a
single 8-byte zero at +0x188, and +0x1a0..+0x1a8 left untouched. Each must be killed by the same
measurement; a control that kills nothing means the harness is blind, not that the port is right.
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

FW = "Ozone"
VMADDR = 0x270800
SYM = "_ZN14OZRenderParams12setImageTypeE11PCImageType"  # dlsym: no leading underscore
# 55 48 89 e5 89 b7 40 01 00 00
#   = pushq %rbp ; movq %rsp,%rbp ; movl %esi,0x140(%rdi)
PROLOGUE = bytes.fromhex("554889e589b740010000")

ARENA = 0x400          # comfortably past +0x30c, the highest slot this class is known to use
OFF_IMAGE_TYPE = 0x140
OFF_ZERO_A = 0x188
OFF_ZERO_B = 0x198

# int32 enum values: the ordinary ones, both signed extremes, and a pattern with a distinct byte in
# every lane so a short store cannot hide behind a symmetric value.
VALUES = [0, 1, 2, 3, 7, -1, 0x12345678, 0x7FFFFFFF, -0x80000000, 0x01020304]


def poison(n, seed=0xA5):
    """A per-byte-varying fill: a constant fill cannot reveal a store that writes the same byte."""
    b = bytearray(n)
    x = seed
    for i in range(n):
        x = (x * 73 + 41) & 0xFF
        b[i] = x
    return bytes(b)


def expected(base, value, mutant=None):
    """The arena as the transcription says it must look after the call."""
    e = bytearray(base)
    width = 8 if mutant == "m1_eight_byte_store" else 4
    e[OFF_IMAGE_TYPE:OFF_IMAGE_TYPE + width] = (value & ((1 << (8 * width)) - 1)).to_bytes(width, "little")
    zero_a = 8 if mutant == "m2_half_zero_at_188" else 16
    e[OFF_ZERO_A:OFF_ZERO_A + zero_a] = b"\x00" * zero_a
    zero_b = 8 if mutant == "m3_tail_of_198_untouched" else 16
    e[OFF_ZERO_B:OFF_ZERO_B + zero_b] = b"\x00" * zero_b
    return bytes(e)


def ranges(a, b):
    """Contiguous [start,end) byte ranges where a and b differ — the shape of what was written."""
    out, i, n = [], 0, len(a)
    while i < n:
        if a[i] != b[i]:
            j = i
            while j < n and a[j] != b[j]:
                j += 1
            out.append((i, j))
            i = j
        else:
            i += 1
    return out


def main():
    ozone_loader.require_x86_64()
    oz = ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    here = ctypes.string_at(addr, len(PROLOGUE))
    print(f"image        : {image}")
    print(f"slide+vmaddr : {slide:#x} + {VMADDR:#x} = {addr:#x}")
    print(f"prologue     : {here.hex()}  expected {PROLOGUE.hex()}")
    if here != PROLOGUE:
        print("SELF-CHECK FAILED — the bytes at the address are not the transcribed body. "
              "Every number below would be meaningless; refusing to produce one.")
        return 1
    print("self-check   : OK — dlsym/vmaddr land on the transcribed x86_64 body\n")

    fn = getattr(oz, SYM)
    fn.restype = None
    fn.argtypes = [ctypes.c_void_p, ctypes.c_int32]

    base = poison(ARENA)
    ok = True
    kills = {"m1_eight_byte_store": 0, "m2_half_zero_at_188": 0, "m3_tail_of_198_untouched": 0}
    print(f"{'value':>12}  {'verdict':<8}  written ranges")
    for v in VALUES:
        buf = ctypes.create_string_buffer(base, ARENA)
        fn(ctypes.cast(buf, ctypes.c_void_p), v)
        after = bytes(buf.raw[:ARENA])
        want = expected(base, v)
        good = after == want
        ok &= good
        print(f"{v:>12}  {'match' if good else 'DIVERGED':<8}  "
              f"{[(hex(a), hex(b)) for a, b in ranges(base, after)]}")
        if not good:
            for a, b in ranges(want, after):
                print(f"               at [{a:#x},{b:#x})  live={after[a:b].hex()}  "
                      f"transcription={want[a:b].hex()}")
        for m in kills:
            if after != expected(base, v, m):
                kills[m] += 1

    print("\n-- NEGATIVE CONTROLS (mutated EXPECTATIONS, same measurement) --")
    labels = {
        "m1_eight_byte_store": "M1 the store at +0x140 is 8 bytes wide, not 4",
        "m2_half_zero_at_188": "M2 only 8 bytes are zeroed at +0x188",
        "m3_tail_of_198_untouched": "M3 +0x1a0..+0x1a8 is left untouched",
    }
    for m, n in kills.items():
        print(f"   {labels[m]}: killed {n}/{len(VALUES)}")
        if n == 0:
            print("   !! killed 0 — say which: a BLIND harness, or an EQUIVALENT mutant. "
                  "Not a clean run.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED — every byte of a poisoned 1 KiB object accounted for: the "
                 "4-byte enum store at +0x140, 16 zero bytes at +0x188 and at +0x198, and NOTHING "
                 "else written" if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
