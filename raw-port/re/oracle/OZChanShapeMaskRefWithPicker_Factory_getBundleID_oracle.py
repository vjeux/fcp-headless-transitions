#!/usr/bin/env python3
"""Differential oracle for OZChanShapeMaskRefWithPicker_Factory::getBundleID() @Ozone 0x22190.

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/OZChanShapeMaskRefWithPicker_Factory_getBundleID_oracle.py

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it — it is called at slide + its x86_64
vmaddr through raw-port/re/oracle/ozone_loader.py, which also handles the `@rpath` preload chain
Ozone needs outside the app bundle. Both halves of the OPS_LOG architecture trap are closed there:
the process must be x86_64 (the port cites x86_64 offsets), and the address comes from
`nm -n -arch x86_64` rather than a bare `nm` that would answer from the arm64 slice.

WHAT IS CHECKED against the live binary:
  1. the returned pointer is EXACTLY the literal the `leaq 0x7c4ded(%rip)` @0x22194 computes —
     VA 0x7e6f88 — so the port's claim about WHICH literal it returns is verified, not merely the
     string value it happens to contain;
  2. that literal is the EMPTY string, read back THROUGH the live pointer;
  3. the body never reads `this`: the same answer comes back for six bogus receivers, which is what
     licenses the port's stateless model;
  4. the pointer is a valid pointer TO an empty string and never NULL — modelling it as `null`
     would be a different value.

CONTROLS, and they are EXECUTED rather than asserted (OPS_LOG: "a probe's mutation control that is
asserted, not demonstrated, proves nothing"):
  * M1 calls a NEIGHBOURING method of the same class live — `getIconIDInternal` @0x221e0, which
    returns -1 — through the identical wire. It must NOT produce the literal pointer, which is what
    shows the pointer comparison discriminates at all.
  * M2 reads the bytes at the literal address PLUS ONE, live. If that region were also empty, then
    "the bytes are b''" would be a fact about the neighbourhood rather than about this literal, and
    the content check would be vacuous.
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN36OZChanShapeMaskRefWithPicker_Factory11getBundleIDEv"
FN_VA = 0x22190           # @Ozone — the function
LITERAL_VA = 0x7E6F88     # = 0x2219b (RIP after the 7-byte leaq) + 0x7c4ded
CTRL_SYM = "__ZN36OZChanShapeMaskRefWithPicker_Factory17getIconIDInternalEv"
CTRL_VA = 0x221E0         # returns -1; the same class, the same wire


def main():
    L.require_x86_64()
    L.load_framework("Ozone")
    slide, image = L.image_slide("Ozone")
    print(f"image={image}\nslide={slide:#x}")

    vmaddr = L.nm_addr("Ozone", SYM)
    assert vmaddr == FN_VA, f"symbol moved: {vmaddr:#x} != {FN_VA:#x} (wrong slice?)"

    # the RIP-relative arithmetic the port transcribes, restated here so the two cannot drift
    assert (FN_VA + 4) + 7 + 0x7C4DED == LITERAL_VA, "the leaq arithmetic in this file is wrong"

    as_ptr, _, _ = L.local_fn("Ozone", SYM, ctypes.c_void_p, [ctypes.c_void_p])
    as_str, _, _ = L.local_fn("Ozone", SYM, ctypes.c_char_p, [ctypes.c_void_p])

    # 3. `this`-insensitivity: the body has no (%rdi) operand at all.
    this_values = [None, 0x1, 0xDEADBEEF, slide, 0x7FFFFFFFFFFF, 0x4141414141414141]
    ptrs = [as_ptr(ctypes.c_void_p(t)) for t in this_values]
    strs = [as_str(ctypes.c_void_p(t)) for t in this_values]

    wrong_ptr = sum(1 for p in ptrs if p is None or p - slide != LITERAL_VA)
    wrong_str = sum(1 for s in strs if s != b"")
    this_sensitive = len(set(ptrs)) - 1
    nulls = sum(1 for p in ptrs if not p)

    print(f"CALLS={len(ptrs)} WRONG_LITERAL_ADDR={wrong_ptr} NON_EMPTY_RESULT={wrong_str} "
          f"THIS_SENSITIVE={this_sensitive} NULL_RESULTS={nulls}")
    print(f"  returned pointer - slide = {ptrs[0] - slide:#x} (expected {LITERAL_VA:#x})")
    print(f"  bytes at that pointer    = {strs[0]!r} (expected b'')")

    print("  controls (executed, not asserted):")
    ctrl_ptr, _, _ = L.local_fn("Ozone", CTRL_SYM, ctypes.c_void_p, [ctypes.c_void_p])
    c1 = ctrl_ptr(ctypes.c_void_p(None))
    m1_killed = (c1 is None) or (c1 - slide != LITERAL_VA)
    print(f"   M1 getIconIDInternal @{CTRL_VA:#x} through the same wire -> {c1!r}  "
          f"{'KILLED' if m1_killed else 'NOT KILLED — the pointer check discriminates nothing'}")

    # +1 is NOT the control to use here, and finding that out is worth recording: the literal is
    # followed by seven more zero bytes (alignment padding), so a read at +1 also returns b"" and
    # would have "passed" a content check that discriminates nothing. The nearest cstring that is
    # actually a string is at +8, and it is the one the landed OZLightingFolder_Factory oracle
    # names in prose as its hypothetical wrong answer — here it is READ, live.
    neighbour = ctypes.string_at(slide + LITERAL_VA + 8)
    pad = ctypes.string_at(slide + LITERAL_VA, 8)
    m2_killed = neighbour != b"" and pad == b"\x00" * 8
    print(f"   M2 bytes at the literal + 8 = {neighbour[:32]!r} (the literal's own 8 bytes are "
          f"{pad!r})  "
          f"{'KILLED' if m2_killed else 'NOT KILLED — an empty read here says nothing'}")

    ok = (wrong_ptr == 0 and wrong_str == 0 and this_sensitive == 0 and nulls == 0
          and m1_killed and m2_killed)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
