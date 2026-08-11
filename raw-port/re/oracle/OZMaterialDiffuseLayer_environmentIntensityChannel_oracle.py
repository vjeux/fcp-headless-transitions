#!/usr/bin/env python3
"""Differential oracle for
`OZMaterialDiffuseLayer::environmentIntensityChannel()` @Ozone 0x61b2e0
(__ZN22OZMaterialDiffuseLayer27environmentIntensityChannelEv).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZMaterialDiffuseLayer_environmentIntensityChannel_oracle.py

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; `ozone_loader`
preloads Ozone's @rpath chain and calls it at `dyld slide + 0x61b2e0`.

WHY THIS ONE NEEDED AN ORACLE MORE THAN MOST — `otool -tV` LIES ABOUT THIS BODY.
The single instruction that matters disassembles, with symbolization ON, as

    0x61b2e4  leaq "-[OZMagnifyTool setSpacebarMode:zoomOut:]"(%rdi), %rax

because otool -V resolves the *displacement* 0x4290 against the symbol table and
a local ObjC method happens to live at VA 0x4290. `raw-port/tools/disasm.sh`
uses `otool -tV`, so the cached .s file carries the same false rendering. With
`-tv` (no symbolization) the same instruction is `leaq 0x4290(%rdi), %rax`,
which is what this port transcribes. The checks below exist to prove the NUMBER,
not to take either disassembler's word for it:

  1. BYTE SELF-CHECK — the 13 bytes at slide+0x61b2e0 must be exactly the
     encoding of `push/mov/leaq 0x4290(%rdi)/pop/ret`. The displacement is
     visible in the machine code as the little-endian `90 42 00 00`, which is
     0x4290 and settles the question independently of otool.
  2. LIVE DIFFERENTIAL — call the real function with many `this` pointers and
     check the returned pointer is exactly `this + 0x4290` every time.
  3. NEGATIVE CONTROLS — wrong-offset models must be caught, including the
     neighbouring accessors' offsets, so a transposed field would not pass.
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import local_fn, require_x86_64  # noqa: E402

FW = "Ozone"
SYM = "__ZN22OZMaterialDiffuseLayer27environmentIntensityChannelEv"
OFFSET = 0x4290          # the field this accessor returns the address of
SIZEOF = 0x4328          # movl $0x4328, %edi in clone() @0x61adda

#   0x61b2e0  55              pushq %rbp
#   0x61b2e1  48 89 e5        movq  %rsp, %rbp
#   0x61b2e4  48 8d 87 90 42 00 00   leaq 0x4290(%rdi), %rax
#   0x61b2eb  5d              popq  %rbp
#   0x61b2ec  c3              retq
EXPECTED_BYTES = bytes.fromhex("554889e5488d87904200005dc3")


def ts_model(this):
    """What the TS port computes: the address of the field at +0x4290."""
    return (this or 0) + OFFSET


# Deliberately wrong models. Each must be caught.
MUTANTS = {
    "+0x720 (alphaChannel's offset)": lambda t: (t or 0) + 0x720,
    "+0x8b8 (colorChannel's offset)": lambda t: (t or 0) + 0x8B8,
    "+0x2958 (imageChannel's offset)": lambda t: (t or 0) + 0x2958,
    "+0x4288 (offset off by 8)": lambda t: (t or 0) + 0x4288,
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
    print(f"  displacement bytes {got[7:11].hex()} little-endian = 0x{disp:x} "
          f"(otool -tV printed an ObjC selector name here)")
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
        ("real 0x4328-byte object", base),
        ("0x4141414141414141", 0x4141414141414141),
        ("0xdeadbeef", 0xDEADBEEF),
        ("1", 1),
    ]
    # ...plus a spread of aligned pointers inside the object, so a model that
    # ignored `this` (or scaled it) would show up.
    this_values += [(f"obj+0x{off:x}", base + off)
                    for off in range(0, SIZEOF, 0x98)]

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

    # The layout claim the port makes, checked for consistency:
    print(f"layout check: 0x{OFFSET:x} + 0x98 (channel subobject stride) = "
          f"0x{OFFSET + 0x98:x}; sizeof from clone() is 0x{SIZEOF:x} — "
          f"{'consistent: it is the LAST member' if OFFSET + 0x98 == SIZEOF else 'INCONSISTENT'}")

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
