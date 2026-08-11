#!/usr/bin/env python3
"""FFConditionLock::getCondition() const @Flexo 0x12b94f0 — differential against the LIVE binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/FFConditionLock_getCondition_oracle.py

WHY ROSETTA: every @0xADDR in `raw-port/src/infra/FFConditionLock.ts` is an x86_64 vmaddr
and `disasm.sh` thins to that slice, while this box is arm64. Calling the arm64 image
would compare the port against code it did not transcribe — OPS_LOG's "the executable
oracle calls the wrong architecture, and fails toward ACCEPT".

THE BODY IS ONE INSTRUCTION, `movq 0x88(%rdi), %rax`, and it makes three claims that a
read-back of a getter would not distinguish:
  (1) the OFFSET is +0x88 and not a neighbour;
  (2) the WIDTH is 8 bytes — a `movl` would truncate every value above 2^32, and the
      field is written from a `long long` (`setCondition(x)` @0x12b9500, and the ctor
      `FFConditionLock(long long)` @0x12b93b2), so the distinction is reachable;
  (3) the method is `const` and WRITES NOTHING — checked by diffing a poisoned object
      byte for byte across the call, which a return-value comparison never shows.

SELF-CHECK FIRST: dlsym must land on slide + 0x12b94f0 and the eleven bytes there must be
the encoding of the transcribed body, `55 48 89 e5 48 8b 87 88 00 00 00`.

NEGATIVE CONTROLS: three mutated expectations — the field at +0x80, the field at +0x90,
and a 4-byte load — each scored against the same measurement. A control that kills
nothing means the harness is blind, not that the port is right.
"""
import ctypes
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

FW = "Flexo"
VMADDR = 0x12B94F0
SYM = "_ZNK15FFConditionLock12getConditionEv"   # dlsym: no leading underscore
PROLOGUE = bytes.fromhex("554889e5488b8788000000")

ARENA = 0x100          # past +0x88 and the embedded pthread_cond_t at +0x58
OFF = 0x88

VALUES = [0, 1, -1, 2, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF,
          0x0000000100000000, 0x123456789ABCDEF0, 0x7FFFFFFFFFFFFFFF,
          -0x8000000000000000, -0x123456789A]


def poison(n, seed=0x5A):
    b = bytearray(n)
    x = seed
    for i in range(n):
        x = (x * 73 + 41) & 0xFF
        b[i] = x
    return bytes(b)


def main():
    ozone_loader.require_x86_64()
    lib = ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    here = ctypes.string_at(addr, len(PROLOGUE))
    print(f"image        : {image}")
    print(f"slide+vmaddr : {slide:#x} + {VMADDR:#x} = {addr:#x}")
    print(f"prologue     : {here.hex()}  expected {PROLOGUE.hex()}")
    if here != PROLOGUE:
        print("SELF-CHECK FAILED — the bytes at the address are not the transcribed body.")
        return 1
    print("self-check   : OK\n")

    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_int64
    fn.argtypes = [ctypes.c_void_p]

    base = poison(ARENA)
    ok = True
    kills = {"m1_offset_0x80": 0, "m2_offset_0x90": 0, "m3_four_byte_load": 0}
    print(f"{'value at +0x88':>22}  {'live':>22}  verdict  object")
    for v in VALUES:
        buf = ctypes.create_string_buffer(base, ARENA)
        packed = struct.pack("<q", v) if v < 2 ** 63 else struct.pack("<Q", v)
        ctypes.memmove(ctypes.addressof(buf) + OFF, packed, 8)
        before = bytes(buf.raw[:ARENA])
        got = fn(ctypes.cast(buf, ctypes.c_void_p))
        after = bytes(buf.raw[:ARENA])
        want = struct.unpack("<q", packed)[0]
        good = got == want
        untouched = before == after
        ok &= good and untouched
        print(f"{want:>22}  {got:>22}  {'match' if good else 'DIVERGED':<8} "
              f"{'unmodified' if untouched else 'MUTATED — the const getter wrote to it'}")

        # mutated expectations, scored on the same call
        if got != struct.unpack("<q", before[0x80:0x88])[0]:
            kills["m1_offset_0x80"] += 1
        if got != struct.unpack("<q", before[0x90:0x98])[0]:
            kills["m2_offset_0x90"] += 1
        if got != struct.unpack("<i", packed[:4])[0]:
            kills["m3_four_byte_load"] += 1

    print("\n-- NEGATIVE CONTROLS (mutated expectations, same measurement) --")
    labels = {"m1_offset_0x80": "M1 the field is at +0x80",
              "m2_offset_0x90": "M2 the field is at +0x90",
              "m3_four_byte_load": "M3 the load is 4 bytes wide (movl), not 8"}
    for m, n in kills.items():
        print(f"   {labels[m]}: killed {n}/{len(VALUES)}")
        if n == 0:
            print("   !! killed 0 — say which: a BLIND harness, or an EQUIVALENT mutant.")
            ok = False

    print("\n" + ("VERDICT: VERIFIED — the full 64-bit value at +0x88 is returned for every "
                 "pattern including both extremes, and the poisoned object is byte-identical "
                 "afterwards" if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
