#!/usr/bin/env python3
"""Differential oracle for OZChannelMaterialRoot::setMaterial(OZMaterialBase*) @Ozone 0x5a5180.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannelMaterialRoot_setMaterial_oracle.py

The body stores the argument at +0x100 and a pointer adjusted by +0x10 at +0xd0 — with a `cmoveq`
that keeps NULL as NULL instead of turning it into 0x10. Both halves are measured: the sweep runs
null and a spread of non-null pointers (including ones whose low bits would hide a wrong
adjustment), and the whole 0x200-byte object is poisoned so any other write shows up.
"""
import ctypes, os, random, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

VA = 0x5A5180
OBJ = 0x200
POISON = 0xEE
PROLOGUE = bytes.fromhex("554889e54889b700010000")  # push rbp; mov rbp,rsp; mov %rsi,0x100(%rdi)


def main():
    L.require_x86_64()
    L.load_framework("Ozone")
    slide, _ = L.image_slide("Ozone")
    got = ctypes.string_at(slide + VA, len(PROLOGUE))
    print(f"prologue: {got.hex()}  expected: {PROLOGUE.hex()}")
    if got != PROLOGUE:
        print("PROLOGUE MISMATCH — refusing to report a result")
        return 1
    fn = ctypes.cast(slide + VA, ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p))

    rng = random.Random(17)
    scratch = ctypes.create_string_buffer(4096)
    live = ctypes.cast(scratch, ctypes.c_void_p).value
    ptrs = [0, live, live + 8, live + 0x10, live + 0x1000 - 0x20, 0x1000, 0xFFFFFFFFFFFF0000]
    ptrs += [rng.getrandbits(48) | 1 for _ in range(40)]

    bad = mut = 0
    for p in ptrs:
        obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ, OBJ)
        before = bytes(obj.raw)
        fn(ctypes.cast(obj, ctypes.c_void_p), ctypes.c_void_p(p))
        raw = bytes(obj.raw)
        at100 = struct.unpack_from("<Q", raw, 0x100)[0]
        atd0 = struct.unpack_from("<Q", raw, 0x0D0)[0]
        want_d0 = 0 if p == 0 else (p + 0x10) & 0xFFFFFFFFFFFFFFFF   # the cmoveq null guard
        if at100 != p or atd0 != want_d0:
            bad += 1
            if bad <= 4:
                print(f"  MISMATCH ptr=0x{p:x}: +0x100=0x{at100:x} +0xd0=0x{atd0:x} "
                      f"(expected 0x{p:x} / 0x{want_d0:x})")
        untouched = raw[:0x0D0] + raw[0x0D8:0x100] + raw[0x108:]
        if untouched != before[:0x0D0] + before[0x0D8:0x100] + before[0x108:]:
            mut += 1
    print(f"{len(ptrs) - bad}/{len(ptrs)} agree; {mut} cases wrote outside +0xd0 and +0x100")

    # NEGATIVE CONTROL: the null guard. A port without the cmoveq would store 0x10 for null.
    obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ, OBJ)
    fn(ctypes.cast(obj, ctypes.c_void_p), ctypes.c_void_p(0))
    naive_wrong = struct.unpack_from("<Q", bytes(obj.raw), 0x0D0)[0] == 0x10
    print(f"  negative control [null without the cmoveq -> 0x10]: "
          f"{'MATCHED — indistinguishable' if naive_wrong else 'correctly differs'}")

    ok = not (bad or mut or naive_wrong)
    print("setMaterial oracle: " + ("VERIFIED" if ok else "DIVERGED"))
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
