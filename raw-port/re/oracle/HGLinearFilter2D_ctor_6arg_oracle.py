#!/usr/bin/env python3
"""Differential oracle for
HGLinearFilter2D::HGLinearFilter2D(float vector[4] const*, int, int, int, int, int) [C2]
@Helium 0x10b0f0.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGLinearFilter2D_ctor_6arg_oracle.py

The symbol is EXPORTED (`nm` type `T`). Two properties are measured, not read off the listing:

  * WHICH FIELD EACH ARGUMENT LANDS IN, including the two the listing makes easy to mis-transcribe
    — `+0x18` is written with a CONSTANT ZERO rather than with an argument, and the SIXTH argument
    (the first STACK argument, `0x10(%rbp)`) skips over it into `+0x1c`. A port that walked the
    arguments in order would put arg6 at +0x18 and leave +0x1c poisoned; the poison makes that
    visible.
  * THAT NOTHING ELSE IS TOUCHED — the object is poisoned with 0xEE over 0x40 bytes and compared
    byte for byte outside the seven written slots.
"""
import ctypes, os, random, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

VA = 0x10B0F0
OBJ = 0x40
POISON = 0xEE
PROLOGUE = bytes.fromhex("554889e58b4510488937")  # push rbp; mov rbp,rsp; mov 0x10(%rbp),%eax; mov %rsi,(%rdi)


def main():
    L.require_x86_64()
    L.load_framework("Helium")
    slide, _ = L.image_slide("Helium")
    got = ctypes.string_at(slide + VA, len(PROLOGUE))
    print(f"prologue: {got.hex()}  expected: {PROLOGUE.hex()}")
    if got != PROLOGUE:
        print("PROLOGUE MISMATCH — refusing to report a result")
        return 1

    fn = ctypes.cast(slide + VA, ctypes.CFUNCTYPE(
        None, ctypes.c_void_p, ctypes.c_void_p,
        ctypes.c_int32, ctypes.c_int32, ctypes.c_int32, ctypes.c_int32, ctypes.c_int32))

    rng = random.Random(11)
    cases = [(0, 0, 0, 0, 0), (1, 2, 3, 4, 5), (-1, -2, -3, -4, -5),
             (0x7FFFFFFF, -0x80000000, 0x7FFFFFFF, -0x80000000, 0x7FFFFFFF)]
    cases += [tuple(rng.randint(-2**31, 2**31 - 1) for _ in range(5)) for _ in range(60)]

    taps = ctypes.create_string_buffer(64)
    tapaddr = ctypes.cast(taps, ctypes.c_void_p).value

    bad = mut = 0
    for (a, b, c, d, e) in cases:
        obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ, OBJ)
        fn(ctypes.cast(obj, ctypes.c_void_p), tapaddr, a, b, c, d, e)
        raw = bytes(obj.raw)
        want = {0x00: tapaddr}
        got8 = struct.unpack_from("<Q", raw, 0x00)[0]
        fields = {off: struct.unpack_from("<i", raw, off)[0] for off in (0x08, 0x0c, 0x10, 0x14, 0x18, 0x1c)}
        # the port: data=+0x00, offsetX=+0x08, offsetY=+0x0c, width=+0x10, height=+0x14,
        #           count=+0x18 = 0 (a constant), flags=+0x1c = the SIXTH argument
        expect = {0x08: a, 0x0c: b, 0x10: c, 0x14: d, 0x18: 0, 0x1c: e}
        if got8 != want[0x00] or fields != expect:
            bad += 1
            if bad <= 4:
                print(f"  MISMATCH args={(a,b,c,d,e)}: ptr=0x{got8:x} fields={fields} expected={expect}")
        if raw[0x20:] != bytes([POISON]) * (OBJ - 0x20):
            mut += 1
    print(f"{len(cases) - bad}/{len(cases)} agree; {mut} cases wrote outside +0x00..+0x1f")

    # NEGATIVE CONTROL: the "arguments in order" mis-transcription (arg6 -> +0x18, +0x1c zero).
    obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ, OBJ)
    fn(ctypes.cast(obj, ctypes.c_void_p), tapaddr, 1, 2, 3, 4, 0x5A5A5A5A)
    in_order_wrong = (struct.unpack_from("<i", bytes(obj.raw), 0x18)[0] == 0x5A5A5A5A)
    print(f"  negative control [arg6 -> +0x18 instead of +0x1c]: "
          f"{'MATCHED — indistinguishable' if in_order_wrong else 'correctly differs'}")

    ok = not (bad or mut or in_order_wrong)
    print("HGLinearFilter2D 6-arg ctor oracle: " + ("VERIFIED" if ok else "DIVERGED"))
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
