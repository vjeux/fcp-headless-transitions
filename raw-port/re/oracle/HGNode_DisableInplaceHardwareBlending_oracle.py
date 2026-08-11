#!/usr/bin/env python3
"""Differential oracle for `HGNode::DisableInplaceHardwareBlending()`
@Helium 0x122100 (__ZN6HGNode30DisableInplaceHardwareBlendingEv).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/HGNode_DisableInplaceHardwareBlending_oracle.py

This one is a MEMORY-EFFECT differential, not a return-value one: the whole
body is a single one-byte store, so the observable is *which bytes of the object
changed*. The harness poisons a 0x200-byte arena, calls the live function, and
diffs the arena against what the TS port's model would have written. That is
strictly stronger than checking the byte at +0x14c, because it also proves the
function touches NOTHING ELSE — a store of the wrong WIDTH (u32 instead of u8)
or at the wrong OFFSET shows up as a different diff set, and both are in the
negative controls below.

The symbol is EXPORTED (`nm` type `T`), so dlsym can reach it. We call it by
ADDRESS anyway, via ozone_loader.local_fn, and then cross-check that dlsym
resolves to the very same address — the two routes agreeing rules out the
class of mistakes where an address-based call lands on a neighbour (the
neighbour here is `SetInPlaceHardwareBlendingInfo` @0x122110, 16 bytes later,
which writes 32 bytes at +0x150).
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402

FW = "Helium"
SYM = "__ZN6HGNode30DisableInplaceHardwareBlendingEv"
FIELD = 0x14C        # the field the single store targets
ARENA = 0x200        # comfortably past the 0x190 fields HGNode.ts models
POISON = 0xAA        # not 0x00, so "wrote a zero" is unambiguous

#   0x122100  55                       pushq %rbp
#   0x122101  48 89 e5                 movq  %rsp, %rbp
#   0x122104  c6 87 4c 01 00 00 00     movb  $0x0, 0x14c(%rdi)
#   0x12210b  5d                       popq  %rbp
#   0x12210c  c3                       retq
EXPECTED_BYTES = bytes.fromhex("554889e5c6874c010000005dc3")


def ts_model(buf):
    """The TS port's memory effect: one byte, at +0x14c, set to 0."""
    buf[FIELD] = 0x00


MUTANTS = {
    "stores at +0x148 (field_148, the neighbour above)":
        lambda b: b.__setitem__(0x148, 0x00),
    "stores at +0x150 (field_150, the neighbour below)":
        lambda b: b.__setitem__(0x150, 0x00),
    "stores 1 instead of 0 (Enable, not Disable)":
        lambda b: b.__setitem__(FIELD, 0x01),
    "stores a u32 zero instead of a byte (wrong width)":
        lambda b: b.__setitem__(slice(FIELD, FIELD + 4), b"\x00\x00\x00\x00"),
    "does nothing at all":
        lambda b: None,
}


def diff(a, b):
    return [i for i in range(len(a)) if a[i] != b[i]]


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, None, [ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    # ---- 0. dlsym cross-check (the symbol is exported, so both routes exist)
    lib = load_framework(FW)
    # dlsym wants the symbol WITHOUT the Mach-O leading underscore — exactly
    # ONE of them (`__ZN…` -> `_ZN…`); stripping both would look up a symbol
    # that does not exist.
    dl = ctypes.cast(getattr(lib, SYM[1:]), ctypes.c_void_p).value
    if dl != slide + addr:
        print(f"DLSYM CROSS-CHECK FAILED: dlsym=0x{dl:x} "
              f"address-route=0x{slide + addr:x}")
        return 1
    print(f"dlsym cross-check PASS: dlsym and slide+vmaddr agree on 0x{dl:x}")

    # ---- 1. byte self-check -------------------------------------------------
    got = ctypes.string_at(slide + addr, len(EXPECTED_BYTES))
    if got != EXPECTED_BYTES:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_BYTES.hex()}"
              f"\n  got      {got.hex()}")
        return 1
    disp = int.from_bytes(got[6:10], "little")
    print(f"byte self-check PASS: {got.hex()}")
    print(f"  `c6 87` = movb imm8 -> [rdi+disp32]; disp32 {got[6:10].hex()} "
          f"= 0x{disp:x}; imm8 = 0x{got[10]:02x}")
    if disp != FIELD or got[10] != 0x00:
        print("  ...which does not match the ported store")
        return 1

    # ---- 2. live memory-effect differential ---------------------------------
    cases = divergences = 0
    observed_diffs = None
    for trial in range(64):
        # vary the poison and the starting content so a model that "happens to
        # agree" on one pattern cannot survive
        fill = bytes([(POISON + trial) & 0xFF]) * ARENA
        live_buf = ctypes.create_string_buffer(fill, ARENA)
        before = bytearray(live_buf.raw)
        fn(ctypes.cast(live_buf, ctypes.c_void_p))
        after = bytearray(live_buf.raw)

        model = bytearray(before)
        ts_model(model)

        cases += 1
        if model != after:
            divergences += 1
            if divergences <= 3:
                print(f"  DIVERGED trial {trial}: live changed "
                      f"{diff(before, after)}, port changed {diff(before, model)}")
        d = diff(before, after)
        observed_diffs = d if observed_diffs is None else observed_diffs
        if d != observed_diffs:
            print(f"  NON-DETERMINISTIC: trial {trial} changed {d}, "
                  f"earlier trials changed {observed_diffs}")
            return 1

    print(f"live differential: {cases} trials, {divergences} divergences")
    print(f"bytes the live function modified, every trial: "
          f"{[hex(i) for i in observed_diffs]} "
          f"(exactly one, at +0x{FIELD:x}) — {ARENA - len(observed_diffs)} of "
          f"{ARENA} bytes untouched")

    # ---- 3. negative controls ----------------------------------------------
    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0
    for name, mutant in MUTANTS.items():
        caught = 0
        for trial in range(64):
            fill = bytes([(POISON + trial) & 0xFF]) * ARENA
            buf = ctypes.create_string_buffer(fill, ARENA)
            before = bytearray(buf.raw)
            fn(ctypes.cast(buf, ctypes.c_void_p))
            after = bytearray(buf.raw)
            model = bytearray(before)
            mutant(model)
            if model != after:
                caught += 1
        if caught == 0:
            dead += 1
        print(f"  {caught:3d}/{cases} caught — {name}")

    ok = divergences == 0 and observed_diffs == [FIELD] and dead == 0
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
