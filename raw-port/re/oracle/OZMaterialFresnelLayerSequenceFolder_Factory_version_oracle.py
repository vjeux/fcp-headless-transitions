#!/usr/bin/env python3
"""Differential oracle for
`OZMaterialFresnelLayerSequenceFolder_Factory::version()` @Ozone 0x29b90
(__ZN44OZMaterialFresnelLayerSequenceFolder_Factory7versionEv).

Run it under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZMaterialFresnelLayerSequenceFolder_Factory_version_oracle.py

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it. We go through
`ozone_loader.local_fn`, which preloads Ozone's @rpath chain depth-first (the
framework does load outside the app bundle), takes the vmaddr from the cached
x86_64 inventory, and adds the slide dyld actually applied.

Three things are checked, because "the live function returns 1" on its own is a
weak claim for a 5-instruction body:

  1. BYTE SELF-CHECK — the 11 bytes at slide+0x29b90 must equal the encoding of
     the instructions this port transcribes. Calling by address is only as good
     as the address, and this proves we are calling the transcribed code and not
     a neighbour (`revision()` sits 16 bytes later and returns 0, which is
     exactly the mistake this check would catch).
  2. LIVE DIFFERENTIAL over many `this` values, including NULL, poison, and a
     real 256-byte arena. `version()` must not depend on instance state.
  3. NEGATIVE CONTROLS — deliberately wrong models must FAIL. A harness that
     cannot fail is not evidence (OPS_LOG: a dead negative control means the
     harness is blind or the mutant is equivalent).
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import local_fn, require_x86_64  # noqa: E402

FW = "Ozone"
SYM = "__ZN44OZMaterialFresnelLayerSequenceFolder_Factory7versionEv"

# The transcribed body, as encoded x86_64 bytes:
#   0x29b90  55              pushq %rbp
#   0x29b91  48 89 e5        movq  %rsp, %rbp
#   0x29b94  b8 01 00 00 00  movl  $0x1, %eax
#   0x29b99  5d              popq  %rbp
#   0x29b9a  c3              retq
EXPECTED_BYTES = bytes.fromhex("554889e5b8010000005dc3")


# ---------------------------------------------------------------------------
# The port under test, re-expressed in Python (this mirrors the TS exactly:
# a constant 1, no read of `this`).
# ---------------------------------------------------------------------------
def ts_model(_this):
    return 1


# Deliberately wrong models. Each must diverge from the live function.
MUTANTS = {
    "returns 0 (revision()'s body, 16 bytes later)": lambda _t: 0,
    "returns 2 (off-by-one version)": lambda _t: 2,
    "returns -1 (getIconIDInternal's $0xffffffff)": lambda _t: -1,
    "returns the low byte of `this` (fake instance dependence)":
        lambda t: (t or 0) & 0xFF,
}


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, ctypes.c_int, [ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    # ---- 1. byte self-check -------------------------------------------------
    got = ctypes.string_at(slide + addr, len(EXPECTED_BYTES))
    if got != EXPECTED_BYTES:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_BYTES.hex()}"
              f"\n  got      {got.hex()}")
        return 1
    print(f"byte self-check PASS: {got.hex()} == the transcribed instructions")

    # ---- 2. live differential ----------------------------------------------
    arena = ctypes.create_string_buffer(b"\xcd" * 256, 256)
    arena_before = bytes(arena.raw)
    this_values = [
        ("NULL", None),
        ("poisoned arena", ctypes.cast(arena, ctypes.c_void_p).value),
        ("0x4141414141414141", 0x4141414141414141),
        ("0xdeadbeef", 0xDEADBEEF),
        ("1", 1),
        ("-1 as u64", 0xFFFFFFFFFFFFFFFF),
    ]
    # ...plus every 8-byte-aligned offset into the arena, so an instance read
    # of any field in the first 256 bytes would have to show up.
    base = ctypes.cast(arena, ctypes.c_void_p).value
    this_values += [(f"arena+0x{off:x}", base + off) for off in range(0, 256, 8)]

    cases = divergences = 0
    for label, this in this_values:
        live = fn(this)
        port = ts_model(this)
        cases += 1
        if live != port:
            divergences += 1
            print(f"  DIVERGED this={label}: live={live} port={port}")
    print(f"live differential: {cases} cases, {divergences} divergences")

    arena_after = bytes(arena.raw)
    wrote = sum(a != b for a, b in zip(arena_before, arena_after))
    print(f"poison arena: {wrote} of 256 bytes modified "
          f"(0 expected — the body has no memory operand)")

    # ---- 3. negative controls ----------------------------------------------
    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0
    for name, mutant in MUTANTS.items():
        caught = sum(1 for _l, t in this_values if fn(t) != mutant(t))
        if caught == 0:
            dead += 1
        print(f"  {caught:3d}/{cases} caught — {name}")

    ok = divergences == 0 and wrote == 0 and dead == 0
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
