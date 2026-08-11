#!/usr/bin/env python3
"""Differential for OZChannelCurve_Factory::version() @ProChannel 0x11a6c against the LIVE binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannelCurve_Factory_version_oracle.py

Six instructions returning a constant 1. That is exactly the unit a reviewer is tempted to sign on
reading alone, and exactly the one where `movl $0x1` vs `movl $0x0`, or a constant vs an empty body
leaving %eax undefined, is invisible on the page — so it is settled against the machine, with
controls that can fail:

  * IDENTITY — the body bytes are re-derived from the mapped image and compared to the
    transcription, plus a one-byte-off negative control.
  * VALUE — the function is CALLED and must return 1.
  * IT DOES NOT READ ITS RECEIVER — called once with a 0xCD-poisoned `this` (byte-compared
    afterwards, since it must write nothing) and once with `this` pointing at UNMAPPED memory. A
    dereference would fault; it returns 1, so the claim is enforced by the hardware rather than by
    inspection.
  * SENSITIVITY — the neighbour `revision()` @0x11a78 is the same shape with `xorl %eax,%eax` and
    must return 0 through the IDENTICAL CFUNCTYPE in the same process. Without this control, a
    harness that reported a stale or defaulted register would look perfect. The sibling is the
    strongest available form of it (same class, same shape, same call path — the only difference is
    the immediate), and here it runs in the direction the ops log warns about: this port's expected
    answer is the NON-zero one, so the control proves the instrument can still report 0.

This is the ProChannel counterpart of the landed OZChannelBlendMode_Factory::revision() oracle, and
the version/revision pairing reads the same on both classes: format version 1, revision 0.

Both symbols are LOCAL (`nm` type `t`), so dlsym cannot reach them; they are called at
`_dyld_get_image_vmaddr_slide(ProChannel) + <x86_64 vmaddr>` under `arch -x86_64`. The byte checks
run BEFORE any call, because an arm64 vmaddr lands on some other function and fails silently
toward VERIFIED.
"""
import ctypes
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "ProChannel"
VER = "__ZN22OZChannelCurve_Factory7versionEv"
REV = "__ZN22OZChannelCurve_Factory8revisionEv"
VER_ADDR, REV_ADDR = 0x11A6C, 0x11A78
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


oz.require_x86_64()
ver, ver_va, slide = oz.local_fn(FW, VER, ctypes.c_int32, [ctypes.c_void_p])
rev, rev_va, _ = oz.local_fn(FW, REV, ctypes.c_int32, [ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  version vmaddr=0x{ver_va:x}  revision vmaddr=0x{rev_va:x}")
check("addresses", ver_va == VER_ADDR and rev_va == REV_ADDR,
      f"0x{ver_va:x} / 0x{rev_va:x} == the port's @0x{VER_ADDR:x} and its control @0x{REV_ADDR:x}")

body = ctypes.string_at(slide + ver_va, 11)
rbody = ctypes.string_at(slide + rev_va, 8)
print("  version  bytes: " + " ".join(f"{b:02x}" for b in body))
print("  revision bytes: " + " ".join(f"{b:02x}" for b in rbody))
check("the whole body", body[0:4] == b"\x55\x48\x89\xe5" and body[4] == 0xB8
      and int.from_bytes(body[5:9], "little") == 1 and body[9:11] == b"\x5d\xc3",
      "55 48 89 e5 | b8 01 00 00 00 | 5d c3 — prologue, movl $0x1 %eax, epilogue: "
      "no load, no call, no branch")
check("the immediate is 1, and it is stored", body[4] == 0xB8
      and int.from_bytes(body[5:9], "little") == 1,
      "b8 imm32 is `movl $imm,%eax` with imm32 == 1 — the value is SET, so this is a constant and "
      "not an empty body leaving %eax undefined")
check("the control differs by exactly the immediate", rbody[0:7] == b"\x55\x48\x89\xe5\x31\xc0\x5d",
      "revision() is the same shape with 31 c0 (`xorl %eax,%eax`, the two-byte spelling of "
      "`movl $0x0,%eax`) — version 1, revision 0")
shifted = ctypes.string_at(slide + ver_va + 1, 11)
check("the byte check can fail", shifted[0:4] != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

arena = (ctypes.c_char * 0x40)(*([0xCD] * 0x40))
before = bytes(arena)
got = ver(ctypes.byref(arena))
check("returns 1", got == 1, f"the live function returned {got}")
check("writes nothing", bytes(arena) == before,
      "the poisoned 0x40-byte `this` is byte-identical after the call")
check("ignores `this` entirely", ver(ctypes.c_void_p(0xDEAD0000)) == 1,
      "called with `this` in UNMAPPED memory it still returns 1 — a dereference would have faulted")

rgot = rev(ctypes.byref(arena))
check("SENSITIVITY: the neighbour returns 0", rgot == 0,
      f"revision() through the IDENTICAL CFUNCTYPE returns {rgot}, so the harness is reading the "
      "real %eax and 'version is 1' is a measurement rather than a default")

print()
print("OZChannelCurve_Factory::version() @ProChannel 0x11a6c — "
      + ("VERIFIED (body byte-identical; returns 1 from the live image; reads and writes nothing; "
         "the same-shape neighbour returns 0, so the instrument discriminates)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
