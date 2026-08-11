#!/usr/bin/env python3
"""Differential oracle for `ProShade::Func<ProShade::Func_dot>::atomic() const`
@Ozone 0x1ebd20 (__ZNK8ProShade4FuncINS_8Func_dotEE6atomicEv).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/ProShade__Func_Func_dot_atomic_oracle.py

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; `ozone_loader`
preloads Ozone's @rpath chain and calls it at `dyld slide + 0x1ebd20`.

WHY A CONSTANT-RETURNING FUNCTION IS WORTH ORACLING AT ALL. `return false` is
exactly what an empty-body cheat looks like, and no static gate can tell the two
apart — the question "is the real body empty?" is a question about the machine.
So this harness answers it BY EXECUTION, and it is written to be able to fail:

  1. BYTE SELF-CHECK — the 8 bytes at slide+0x1ebd20 must be exactly
     `55 48 89 e5 31 c0 5d c3` (push/mov/xorl/pop/ret). If the body were longer
     than five instructions, this is where that shows up.
  2. INDEPENDENCE FROM `this` — the same call over many different `this`
     pointers, including a real object whose bytes are poison. A constant body
     must return 0 for all of them; a body that read a field would not.
  3. NO MEMORY TRAFFIC — the poisoned object is byte-identical afterwards.
  4. NEGATIVE CONTROLS — models that return 1, return `this`, return the low
     byte of `this`, or dereference the object must each be caught. Their catch
     counts are printed per case: "returns `this`" agrees with the truth on
     NULL, and saying so is more honest than a boolean.
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import local_fn, require_x86_64  # noqa: E402

FW = "Ozone"
SYM = "__ZNK8ProShade4FuncINS_8Func_dotEE6atomicEv"

#   0x1ebd20  55        pushq %rbp
#   0x1ebd21  48 89 e5  movq  %rsp, %rbp
#   0x1ebd24  31 c0     xorl  %eax, %eax
#   0x1ebd26  5d        popq  %rbp
#   0x1ebd27  c3        retq
EXPECTED_BYTES = bytes.fromhex("554889e531c05dc3")

OBJ_SIZE = 0x100          # a stand-in object; the body should never touch it


def ts_model(_this):
    """What the TS port computes: false, i.e. 0, for every `this`."""
    return 0


MUTANTS = {
    "returns 1 (true)": lambda t: 1,
    "returns `this`": lambda t: (t or 0),
    "returns the low byte of `this`": lambda t: (t or 0) & 0xFF,
    "reads the first qword of the object (dereferences `this`)":
        lambda t: 0xCDCDCDCDCDCDCDCD if t else 0,
}


def main():
    require_x86_64()
    # c_uint64 rather than c_bool: read the whole return register, so a body
    # that returned something wider than a bool cannot hide in the high bits.
    fn, addr, slide = local_fn(FW, SYM, ctypes.c_uint64, [ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    # ---- 1. byte self-check -------------------------------------------------
    got = ctypes.string_at(slide + addr, len(EXPECTED_BYTES))
    if got != EXPECTED_BYTES:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_BYTES.hex()}"
              f"\n  got      {got.hex()}")
        return 1
    print(f"byte self-check PASS: {got.hex()}  "
          f"(push/mov/xorl %eax,%eax/pop/ret — the whole function)")

    # ---- 2. independence from `this` ---------------------------------------
    obj = ctypes.create_string_buffer(b"\xcd" * OBJ_SIZE, OBJ_SIZE)
    obj_before = bytes(obj.raw)
    base = ctypes.cast(obj, ctypes.c_void_p).value

    this_values = [("NULL", None),
                   ("real poisoned object", base),
                   ("0x4141414141414141", 0x4141414141414141),
                   ("0xdeadbeef", 0xDEADBEEF),
                   ("1", 1),
                   ("~0UL", 0xFFFFFFFFFFFFFFFF)]
    this_values += [(f"obj+0x{off:x}", base + off) for off in range(0, OBJ_SIZE, 8)]

    cases = divergences = 0
    for label, this in this_values:
        live = fn(this)
        live = 0 if live is None else int(live)
        cases += 1
        if live != ts_model(this):
            divergences += 1
            print(f"  DIVERGED this={label}: live=0x{live:x} port=0")
    print(f"live differential: {cases} cases, {divergences} divergences "
          f"(returned 0 for every `this` — the body is a constant)")

    # ---- 3. no memory traffic ----------------------------------------------
    wrote = sum(a != b for a, b in zip(obj_before, bytes(obj.raw)))
    print(f"poison object: {wrote} of {OBJ_SIZE} bytes modified "
          f"(0 expected — the body reads and writes nothing)")

    # ---- 4. negative controls ----------------------------------------------
    print("negative controls (each MUST diverge somewhere; a 0 means the harness"
          " is blind or the mutant is equivalent):")
    dead = 0
    for name, mutant in MUTANTS.items():
        caught = 0
        for _l, t in this_values:
            live = int(fn(t) or 0)
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
