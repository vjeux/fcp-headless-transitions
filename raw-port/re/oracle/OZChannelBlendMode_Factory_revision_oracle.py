#!/usr/bin/env python3
"""Differential for OZChannelBlendMode_Factory::revision() @Ozone 0x1cf60 against the LIVE binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannelBlendMode_Factory_revision_oracle.py

Six instructions returning a constant 0. That is exactly the unit a reviewer is tempted to sign on
reading alone, and exactly the one where `xorl %eax,%eax` vs a missing store, or 0 vs 0x30, is
invisible — so it is settled against the machine, with controls that can fail:

  * IDENTITY — the body bytes are re-derived from the mapped image and compared to the
    transcription, plus a one-byte-off negative control.
  * VALUE — the function is CALLED and must return 0.
  * IT DOES NOT READ ITS RECEIVER — called once with a 0xCD-poisoned `this` (byte-compared
    afterwards, since it must write nothing) and once with `this` pointing at UNMAPPED memory. A
    dereference would fault; it returns 0, so the claim is enforced by the hardware.
  * SENSITIVITY — the neighbour `version()` @0x1cf50, the same six-instruction shape with
    `movl $0x1,%eax`, is called through the IDENTICAL CFUNCTYPE in the same process and must return
    1. Without this control, a harness that always reported 0 would look perfect on a function whose
    right answer is 0. This is the sibling-override control the ops log prescribes, and it is
    stronger than "call something non-zero" because the sibling is the same shape, same class, same
    call path — the only difference is the immediate.

Both are LOCAL (`nm` type `t`) symbols, called at slide + x86_64 vmaddr under `arch -x86_64`; the
byte checks run before any call, because an arm64 vmaddr lands on another function silently.
"""
import ctypes
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Ozone"
REV, VER = "__ZN26OZChannelBlendMode_Factory8revisionEv", "__ZN26OZChannelBlendMode_Factory7versionEv"
REV_ADDR, VER_ADDR = 0x1CF60, 0x1CF50
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


oz.require_x86_64()
rev, rev_va, slide = oz.local_fn(FW, REV, ctypes.c_int32, [ctypes.c_void_p])
ver, ver_va, _ = oz.local_fn(FW, VER, ctypes.c_int32, [ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  revision vmaddr=0x{rev_va:x}  version vmaddr=0x{ver_va:x}")
check("addresses", rev_va == REV_ADDR and ver_va == VER_ADDR,
      f"0x{rev_va:x} / 0x{ver_va:x} == the port's @0x{REV_ADDR:x} and its control @0x{VER_ADDR:x}")

body = ctypes.string_at(slide + rev_va, 8)
vbody = ctypes.string_at(slide + ver_va, 11)
print("  revision bytes: " + " ".join(f"{b:02x}" for b in body))
print("  version  bytes: " + " ".join(f"{b:02x}" for b in vbody))
check("the whole body", body[0:7] == b"\x55\x48\x89\xe5\x31\xc0\x5d" and body[7] == 0xC3,
      "55 48 89 e5 | 31 c0 | 5d c3 — prologue, xorl %eax,%eax, epilogue: no load, no call, no branch")
check("it is xorl, not a missing store", body[4:6] == b"\x31\xc0",
      "31 c0 is the compiler's two-byte `movl $0x0,%eax` — the value is SET, so this is a constant "
      "and not an empty body leaving %eax undefined")
check("the control differs by exactly the immediate", vbody[0:4] == b"\x55\x48\x89\xe5"
      and vbody[4] == 0xB8 and int.from_bytes(vbody[5:9], "little") == 1,
      "version() is the same shape with b8 01 00 00 00 (movl $0x1) — version 1, revision 0")
shifted = ctypes.string_at(slide + rev_va + 1, 8)
check("the byte check can fail", shifted[0:4] != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

arena = (ctypes.c_char * 0x40)(*([0xCD] * 0x40))
before = bytes(arena)
got = rev(ctypes.byref(arena))
check("returns 0", got == 0, f"the live function returned {got}")
check("writes nothing", bytes(arena) == before, "the poisoned 0x40-byte `this` is byte-identical after the call")
check("ignores `this` entirely", rev(ctypes.c_void_p(0xDEAD0000)) == 0,
      "called with `this` in UNMAPPED memory it still returns 0 — a dereference would have faulted")

vgot = ver(ctypes.byref(arena))
check("SENSITIVITY: the neighbour returns 1", vgot == 1,
      f"version() through the IDENTICAL CFUNCTYPE returns {vgot}, so the harness is reading the "
      "real %eax and 'revision is 0' is a measurement rather than a default")

print()
print("OZChannelBlendMode_Factory::revision() @Ozone 0x1cf60 — "
      + ("VERIFIED (body byte-identical; returns 0 from the live image; reads and writes nothing; "
         "the same-shape neighbour returns 1, so the instrument discriminates)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
