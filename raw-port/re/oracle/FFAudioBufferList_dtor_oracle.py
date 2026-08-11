#!/usr/bin/env python3
"""Memory-effect differential oracle for `FFAudioBufferList::~FFAudioBufferList()`
[D1] @Flexo 0x1255e90 (__ZN17FFAudioBufferListD1Ev).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/FFAudioBufferList_dtor_oracle.py

A destructor returns nothing, so the observable is WHICH BYTES OF THE OBJECT
CHANGE. The harness poisons an arena, calls the real destructor, and compares
the resulting byte-diff against what the port's model would have written. That
catches a wrong offset, a wrong width, a missed store, and a store the port
invented — none of which a "it did not crash" check would.

Both branches are exercised for real. The two pointer slots are freed with
`operator delete[]`, so to test the non-NULL path honestly the harness
allocates them with the process's OWN `operator new[]` (`_Znam`) rather than
handing the allocator a pointer it never produced — feeding `delete[]` a
foreign pointer is heap corruption, and a segfaulting harness proves nothing
(OPS_LOG).

WHAT THIS ORACLE DELIBERATELY DOES NOT CLAIM: that the memory was actually
returned to the allocator. The tempting check — allocate again and see whether
the address is reused — is NOT a verdict here: allocator address reuse on this
box was measured at 0, 12, 57 and 64 out of 64 across four runs of an earlier
harness (OPS_LOG). It is reported below as an observation with that caveat
attached, and it is excluded from the pass/fail decision.
"""
import ctypes
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402

FW = "Flexo"
SYM = "__ZN17FFAudioBufferListD1Ev"
ARENA = 0x100
POISON = 0xAA

VT_DERIVED = 0x19217F8   # FFAudioBufferList      (vtable.py: installed-ptr)
VT_BASE = 0x19217B8      # FFAudioBufferListBase  (as the landed base file cites)
OFF_VT = 0x00
OFF_MBUFFERLIST = 0x28
OFF_P58 = 0x58
OFF_P68 = 0x68

#   0x1255e90  55                     pushq %rbp
#   0x1255e91  48 89 e5               movq  %rsp, %rbp
#   0x1255e94  53                     pushq %rbx
#   0x1255e95  50                     pushq %rax
#   0x1255e96  48 89 fb               movq  %rdi, %rbx
#   0x1255e99  48 8d 05 58 b9 6c 00   leaq  0x6cb958(%rip), %rax
#   0x1255ea0  48 89 07               movq  %rax, (%rdi)
EXPECTED_HEAD = bytes.fromhex("55" "4889e5" "53" "50" "4889fb"
                              "488d0558b96c00" "488907")


def diff(a, b):
    return [i for i in range(len(a)) if a[i] != b[i]]


def apply_port_model(buf, slide, p58, p68):
    """Exactly what the TS port does, expressed on the raw object bytes."""
    # @0x1255e99/@0x1255ea0 — the DERIVED vtable is installed first...
    struct.pack_into("<Q", buf, OFF_VT, slide + VT_DERIVED)
    # @0x1255ea3..@0x1255eb1 — delete[] this->+0x68 when non-null, then null it
    if p68:
        struct.pack_into("<Q", buf, OFF_P68, 0)
    # @0x1255eb9..@0x1255ec7 — same for +0x58
    if p58:
        struct.pack_into("<Q", buf, OFF_P58, 0)
    # @0x1255ecf/@0x1255ed6 — ...then the BASE vtable overwrites it
    struct.pack_into("<Q", buf, OFF_VT, slide + VT_BASE)
    # @0x1255ed9 — mBufferList = nullptr
    struct.pack_into("<Q", buf, OFF_MBUFFERLIST, 0)


MUTANT_NAMES = [
    "never installs the base vtable (leaves the derived one at +0x0)",
    "zeroes +0x30 instead of +0x28",
    "does not null the +0x68 slot after freeing it",
    "nulls +0x58 even when it was already NULL (writes where the branch skips)",
    "zeroes the whole object",
    "treats the two pointer slots as one test (frees both only if BOTH set)",
]

# Mutant 3 is PROVABLY EQUIVALENT at the byte level, and it is kept in the list
# on purpose rather than quietly deleted. The branch it removes is a store of
# ZERO into a slot that the branch condition just proved already holds ZERO, so
# no byte can differ. That is a property of this body, not a gap in the
# harness — the distinction the standing rule asks for ("a dead negative
# control means your harness is blind or your mutant is equivalent; say
# which"). It is excluded from the pass/fail count and labelled in the output.
EQUIVALENT_MUTANTS = {3}


def apply_mutant(idx, buf, slide, p58, p68):
    if idx == 0:
        struct.pack_into("<Q", buf, OFF_VT, slide + VT_DERIVED)
        if p68:
            struct.pack_into("<Q", buf, OFF_P68, 0)
        if p58:
            struct.pack_into("<Q", buf, OFF_P58, 0)
        struct.pack_into("<Q", buf, OFF_MBUFFERLIST, 0)
    elif idx == 1:
        apply_port_model(buf, slide, p58, p68)
        struct.pack_into("<Q", buf, OFF_MBUFFERLIST, POISON * 0x0101010101010101 % (1 << 64))
        struct.pack_into("<Q", buf, 0x30, 0)
    elif idx == 2:
        struct.pack_into("<Q", buf, OFF_VT, slide + VT_BASE)
        if p58:
            struct.pack_into("<Q", buf, OFF_P58, 0)
        struct.pack_into("<Q", buf, OFF_MBUFFERLIST, 0)
    elif idx == 3:
        apply_port_model(buf, slide, p58, p68)
        struct.pack_into("<Q", buf, OFF_P58, 0)
    elif idx == 4:
        for i in range(len(buf)):
            buf[i] = 0
    elif idx == 5:
        struct.pack_into("<Q", buf, OFF_VT, slide + VT_BASE)
        if p58 and p68:
            struct.pack_into("<Q", buf, OFF_P58, 0)
            struct.pack_into("<Q", buf, OFF_P68, 0)
        struct.pack_into("<Q", buf, OFF_MBUFFERLIST, 0)


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, None, [ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    head = ctypes.string_at(slide + addr, len(EXPECTED_HEAD))
    if head != EXPECTED_HEAD:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_HEAD.hex()}"
              f"\n  got      {head.hex()}")
        return 1
    print(f"byte self-check PASS: {head.hex()}")

    # the two rip-relative vtable stores, recomputed from their own encodings
    for site, nxt, want in ((0x1255E99, 0x1255EA0, VT_DERIVED),
                            (0x1255ECF, 0x1255ED6, VT_BASE)):
        raw = ctypes.string_at(slide + site, 7)
        disp = int.from_bytes(raw[3:7], "little")
        target = nxt + disp
        ok = target == want
        print(f"  vtable store @0x{site:x}: disp32 {raw[3:7].hex()} -> "
              f"0x{target:x} (want 0x{want:x}) {'OK' if ok else 'MISMATCH'}")
        if not ok:
            return 1

    # the process's own operator new[] / delete[], so the freed pointers are
    # ones this allocator really produced
    lib = load_framework(FW)
    libcxx = ctypes.CDLL(None)
    new_arr = libcxx._Znam
    new_arr.restype = ctypes.c_void_p
    new_arr.argtypes = [ctypes.c_size_t]
    _ = lib

    cases = []
    for p68_live in (False, True):
        for p58_live in (False, True):
            cases.append((p58_live, p68_live))

    real = 0
    trials = 0
    for p58_live, p68_live in cases:
        for _rep in range(8):
            obj = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
            p58 = new_arr(64) if p58_live else 0
            p68 = new_arr(64) if p68_live else 0
            struct.pack_into("<Q", obj, OFF_P58, p58)
            struct.pack_into("<Q", obj, OFF_P68, p68)
            before = bytearray(obj.raw)

            model = bytearray(before)
            apply_port_model(model, slide, p58, p68)

            fn(ctypes.cast(obj, ctypes.c_void_p))
            after = bytearray(obj.raw)
            trials += 1
            if after != model:
                real += 1
                if real <= 3:
                    print(f"  DIVERGED (p58={'set' if p58_live else 'NULL'}, "
                          f"p68={'set' if p68_live else 'NULL'}): live changed "
                          f"{[hex(i) for i in diff(before, after)]}, port changed "
                          f"{[hex(i) for i in diff(before, model)]}")

    print(f"live-vs-port memory effect: {trials} trials over all 4 "
          f"NULL/non-NULL combinations, {real} divergences")

    # report the exact diff set for the fully-populated case
    obj = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
    p58, p68 = new_arr(64), new_arr(64)
    struct.pack_into("<Q", obj, OFF_P58, p58)
    struct.pack_into("<Q", obj, OFF_P68, p68)
    before = bytearray(obj.raw)
    fn(ctypes.cast(obj, ctypes.c_void_p))
    after = bytearray(obj.raw)
    changed = diff(before, after)
    spans = []
    for i in changed:
        if spans and i == spans[-1][1] + 1:
            spans[-1][1] = i
        else:
            spans.append([i, i])
    print("  bytes modified (both pointers non-NULL): "
          + ", ".join(f"0x{a:x}..0x{b:x}" for a, b in spans))
    print(f"  final vtable at +0x0 = 0x{struct.unpack_from('<Q', after, 0)[0] - slide:x}"
          f" (base 0x{VT_BASE:x} expected — the derived 0x{VT_DERIVED:x} is "
          f"written first and then overwritten)")

    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0
    for idx, name in enumerate(MUTANT_NAMES):
        caught = 0
        n = 0
        for p58_live, p68_live in cases:
            for _rep in range(4):
                obj = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
                p58 = new_arr(64) if p58_live else 0
                p68 = new_arr(64) if p68_live else 0
                struct.pack_into("<Q", obj, OFF_P58, p58)
                struct.pack_into("<Q", obj, OFF_P68, p68)
                before = bytearray(obj.raw)
                mut = bytearray(before)
                apply_mutant(idx, mut, slide, p58, p68)
                fn(ctypes.cast(obj, ctypes.c_void_p))
                n += 1
                if bytearray(obj.raw) != mut:
                    caught += 1
        if idx in EQUIVALENT_MUTANTS:
            note = ("EQUIVALENT by construction — it removes a store of ZERO "
                    "into a slot the branch condition proved already ZERO, so "
                    "no byte can differ. Harness is not blind; the mutant is.")
            print(f"  {caught:3d}/{n} caught — {name}")
            print(f"        ^ expected 0: {note}")
            if caught:
                print("        ...but it was CAUGHT, so the reasoning above is "
                      "wrong — investigate.")
                dead += 1
            continue
        if caught == 0:
            dead += 1
        print(f"  {caught:3d}/{n} caught — {name}")

    ok = real == 0 and dead == 0
    print("NOTE: this oracle does NOT assert that the freed blocks were "
          "returned to the allocator. Address-reuse is run-dependent on this "
          "box (0/12/57/64 of 64 across four runs, OPS_LOG) and is not a "
          "verdict; what is asserted is the object's byte-level end state.")
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
