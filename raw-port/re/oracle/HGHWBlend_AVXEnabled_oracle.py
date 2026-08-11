#!/usr/bin/env python3
"""Differential oracle for `HGHWBlend::AVXEnabled()` @Helium 0x2a0580
(__ZN9HGHWBlend10AVXEnabledEv).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/HGHWBlend_AVXEnabled_oracle.py

The claim this port makes is a strong one — "this function returns true, always,
without consulting the CPU" — so the harness attacks exactly that:

  1. BYTE SELF-CHECK: the 8 bytes at slide+0x2a0580 must be
     `55 48 89 e5 b0 01 5d c3`. There is no `cpuid`, no `xgetbv`, no load of any
     kind in that encoding, which is the static half of the claim.
  2. DLSYM CROSS-CHECK: the symbol is exported, so both resolution routes exist
     and must agree — the neighbour `HGHWBlend::State::C2` starts 16 bytes later
     and would look nothing like this.
  3. LIVE DIFFERENTIAL over many `this` values, with a poisoned arena, so an
     instance-state or global-table dependence would show.
  4. NEGATIVE CONTROLS, including "returns 2" — for a bool the exact byte
     matters, and the ABI only defines AL.

Note for anyone reading this after the OPS_LOG entry about AVX under Rosetta:
that warning is about kernels whose behavior depends on FEATURE BITS, which lie
in a translated process. It does not apply here, and this harness demonstrates
why rather than assuming it — the function's own bytes contain no feature probe
at all, so there is nothing for Rosetta to misreport.
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402

FW = "Helium"
SYM = "__ZN9HGHWBlend10AVXEnabledEv"

#   0x2a0580  55           pushq %rbp
#   0x2a0581  48 89 e5     movq  %rsp, %rbp
#   0x2a0584  b0 01        movb  $0x1, %al
#   0x2a0586  5d           popq  %rbp
#   0x2a0587  c3           retq
EXPECTED_BYTES = bytes.fromhex("554889e5b0015dc3")

# Instruction prefixes that would indicate a runtime CPU probe. None may appear.
FORBIDDEN = {"cpuid": b"\x0f\xa2", "xgetbv": b"\x0f\x01\xd0"}


def ts_model(_this):
    """What the TS port returns: true, i.e. the byte 1 in AL."""
    return 1


MUTANTS = {
    "returns 0 (AVX disabled)": lambda _t: 0,
    "returns 2 (truthy but not the byte the ABI carries)": lambda _t: 2,
    "returns 0xff": lambda _t: 0xFF,
    "reads a flag out of `this` instead of being constant":
        lambda t: (t or 0) & 0x1,
}


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, ctypes.c_ubyte, [ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    lib = load_framework(FW)
    # dlsym wants the symbol without the Mach-O leading underscore — one of them.
    dl = ctypes.cast(getattr(lib, SYM[1:]), ctypes.c_void_p).value
    if dl != slide + addr:
        print(f"DLSYM CROSS-CHECK FAILED: dlsym=0x{dl:x} "
              f"address-route=0x{slide + addr:x}")
        return 1
    print(f"dlsym cross-check PASS: both routes give 0x{dl:x}")

    got = ctypes.string_at(slide + addr, len(EXPECTED_BYTES))
    if got != EXPECTED_BYTES:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_BYTES.hex()}"
              f"\n  got      {got.hex()}")
        return 1
    print(f"byte self-check PASS: {got.hex()} — `b0 01` is MOV AL, imm8=1")
    for name, opcode in FORBIDDEN.items():
        if opcode in got:
            print(f"  ...but the body contains {name}: the constant claim is wrong")
            return 1
    print(f"  no cpuid/xgetbv in the body — the value cannot depend on CPU "
          f"feature bits, so Rosetta's feature-bit caveat does not apply")

    arena = ctypes.create_string_buffer(b"\xa5" * 512, 512)
    arena_before = bytes(arena.raw)
    base = ctypes.cast(arena, ctypes.c_void_p).value
    this_values = [("NULL", None), ("0x4141414141414141", 0x4141414141414141),
                   ("1", 1), ("0xffffffffffffffff", 0xFFFFFFFFFFFFFFFF)]
    this_values += [(f"arena+0x{o:x}", base + o) for o in range(0, 512, 16)]

    cases = divergences = 0
    for label, this in this_values:
        live = fn(this)
        cases += 1
        if live != ts_model(this):
            divergences += 1
            print(f"  DIVERGED this={label}: live={live} port={ts_model(this)}")
    print(f"live differential: {cases} cases, {divergences} divergences "
          f"(AL == 1 every time)")

    wrote = sum(a != b for a, b in zip(arena_before, bytes(arena.raw)))
    print(f"poison arena: {wrote} of 512 bytes modified (0 expected)")

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
