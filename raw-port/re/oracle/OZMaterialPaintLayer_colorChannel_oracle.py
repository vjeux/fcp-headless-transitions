#!/usr/bin/env python3
"""Differential oracle for `OZMaterialPaintLayer::colorChannel()` @Ozone 0x621e70
(__ZN20OZMaterialPaintLayer12colorChannelEv).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZMaterialPaintLayer_colorChannel_oracle.py

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; `ozone_loader`
preloads Ozone's @rpath chain and calls it at `dyld slide + 0x621e70`.

WHAT THIS BODY CAN GET WRONG, and therefore what is checked here. It is five
instructions and one number, so the only possible defect is the NUMBER — and
this class makes that failure mode plausible rather than theoretical: it has
eleven sibling accessors of the identical shape, two of them (+0x1b28
getColorType, +0x1a28 getCarPaintType) only 0x100 and 0x200 away, so a
transposed offset still returns a pointer INSIDE the same 0x3708-byte object and
looks entirely reasonable. Nothing static can catch that. So:

  1. BYTE SELF-CHECK — the 13 bytes at slide+0x621e70 must be exactly the
     encoding of `push/mov/leaq 0x1c28(%rdi)/pop/ret`. The displacement is
     visible in the machine code as the little-endian `28 1c 00 00`, which is
     0x1c28 and settles the question independently of the disassembler's
     operand column (a landed sibling in this family records `otool -tV`
     symbolizing that column into an unrelated ObjC selector name).
  2. LIVE DIFFERENTIAL — call the real function with many `this` pointers and
     check the returned pointer is exactly `this + 0x1c28` every time.
  3. NEGATIVE CONTROLS — wrong-offset models must be caught, including the two
     near neighbours above, so a transposed field would not pass.
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import local_fn, require_x86_64  # noqa: E402

FW = "Ozone"
SYM = "__ZN20OZMaterialPaintLayer12colorChannelEv"
OFFSET = 0x1C28          # the field this accessor returns the address of
SIZEOF = 0x3708          # movl $0x3708, %edi in clone() @0x61edfa
STRIDE = 0x98            # OZChannel subobject stride: the six fresnel accessors
                         # step +0x3378 +0x3410 +0x34a8 +0x3540 +0x35d8 +0x3670,
                         # and 0x3670 + 0x98 == SIZEOF

#   0x621e70  55              pushq %rbp
#   0x621e71  48 89 e5        movq  %rsp, %rbp
#   0x621e74  48 8d 87 28 1c 00 00   leaq 0x1c28(%rdi), %rax
#   0x621e7b  5d              popq  %rbp
#   0x621e7c  c3              retq
EXPECTED_BYTES = bytes.fromhex("554889e5488d87281c00005dc3")


def ts_model(this):
    """What the TS port computes: the address of the field at +0x1c28."""
    return (this or 0) + OFFSET


# Deliberately wrong models. Each must be caught.
MUTANTS = {
    "+0x1b28 (getColorType's offset, 0x100 below)": lambda t: (t or 0) + 0x1B28,
    "+0x1a28 (getCarPaintType's offset, 0x200 below)": lambda t: (t or 0) + 0x1A28,
    "+0x3378 (fresnelDiffuseIntensityChannel's offset)": lambda t: (t or 0) + 0x3378,
    "+0x1c20 (offset off by 8)": lambda t: (t or 0) + 0x1C20,
    "+0x0 (returns `this` unchanged)": lambda t: (t or 0),
    "dereferences the field instead of taking its address":
        lambda t: 0xDEADBEEF,
}


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, ctypes.c_void_p, [ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    # ---- 1. byte self-check -------------------------------------------------
    got = ctypes.string_at(slide + addr, len(EXPECTED_BYTES))
    if got != EXPECTED_BYTES:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_BYTES.hex()}"
              f"\n  got      {got.hex()}")
        return 1
    disp = int.from_bytes(got[7:11], "little")
    print(f"byte self-check PASS: {got.hex()}")
    print(f"  displacement bytes {got[7:11].hex()} little-endian = 0x{disp:x}")
    if disp != OFFSET:
        print(f"  ...which is NOT the ported offset 0x{OFFSET:x}")
        return 1

    # ---- 2. live differential ----------------------------------------------
    # A real, correctly-sized object so the returned pointer is in-bounds.
    obj = ctypes.create_string_buffer(b"\xcd" * SIZEOF, SIZEOF)
    obj_before = bytes(obj.raw)
    base = ctypes.cast(obj, ctypes.c_void_p).value

    this_values = [
        ("NULL", None),
        ("real 0x3708-byte object", base),
        ("0x4141414141414141", 0x4141414141414141),
        ("0xdeadbeef", 0xDEADBEEF),
        ("1", 1),
    ]
    # ...plus a spread of aligned pointers inside the object, so a model that
    # ignored `this` (or scaled it) would show up.
    this_values += [(f"obj+0x{off:x}", base + off)
                    for off in range(0, SIZEOF, STRIDE)]

    cases = divergences = 0
    for label, this in this_values:
        live = fn(this)
        live = 0 if live is None else live
        port = ts_model(this)
        cases += 1
        if live != port:
            divergences += 1
            print(f"  DIVERGED this={label}: live=0x{live:x} port=0x{port:x}")
    print(f"live differential: {cases} cases, {divergences} divergences "
          f"(returned pointer == this + 0x{OFFSET:x} every time)")

    wrote = sum(a != b for a, b in zip(obj_before, bytes(obj.raw)))
    print(f"poison object: {wrote} of {SIZEOF} bytes modified "
          f"(0 expected — leaq computes an address, it dereferences nothing)")

    # The layout claims the port makes, checked for consistency. NOTE this
    # member is NOT the last one (unlike the diffuse-layer sibling); what pins
    # the stride is the fresnel family ending exactly at the allocation size.
    print(f"layout check: 0x{OFFSET:x} + 0x{STRIDE:x} = 0x{OFFSET + STRIDE:x}, "
          f"inside sizeof 0x{SIZEOF:x} — "
          f"{'in-bounds, not the last member' if OFFSET + STRIDE < SIZEOF else 'INCONSISTENT'}"
          f"; last fresnel channel 0x3670 + 0x{STRIDE:x} = 0x{0x3670 + STRIDE:x} == sizeof "
          f"{'yes' if 0x3670 + STRIDE == SIZEOF else 'NO'}")

    # ---- 3. negative controls ----------------------------------------------
    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0
    for name, mutant in MUTANTS.items():
        caught = 0
        for _l, t in this_values:
            live = fn(t)
            live = 0 if live is None else live
            if live != mutant(t):
                caught += 1
        if caught == 0:
            dead += 1
        print(f"  {caught:3d}/{cases} caught — {name}")

    ok = divergences == 0 and wrote == 0 and dead == 0
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
