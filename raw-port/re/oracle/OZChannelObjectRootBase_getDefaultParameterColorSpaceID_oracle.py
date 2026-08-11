#!/usr/bin/env python3
"""Differential for OZChannelObjectRootBase::getDefaultParameterColorSpaceID() const
@ProChannel 0x7337c against the LIVE Final Cut Pro binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannelObjectRootBase_getDefaultParameterColorSpaceID_oracle.py

The body is five instructions and returns a constant, which is exactly the sort of unit that gets
signed on reading alone — and exactly the sort where a one-character misread (`$0x3` vs `$0x30`,
`movl` vs `movq`) is invisible in review and produces a plausible wrong number downstream. It costs
two seconds to settle against the machine, so it is settled:

  * IDENTITY — the entry-point bytes are re-derived from the loaded image and checked against the
    transcription, including that the immediate really is a 32-bit `movl $0x3` (`b8 03 00 00 00`)
    and not a wider or differently-valued move. A one-byte-off negative control must fail.
  * VALUE — the function is CALLED with a `this` poisoned with 0xCD and must return 3.
  * IT READS NOTHING — the poisoned `this` is byte-compared afterwards (a const method must not
    write), and, more strongly, the function is also called with `this = 0xdead0000`, a pointer
    into unmapped memory. If the body dereferenced `this` at all, that call would fault instead of
    returning; the port models the method as ignoring `this` entirely, and this is what makes that
    claim testable rather than asserted.
  * THE PORT — the real `.ts` is imported (node --experimental-strip-types) and its answer compared.

Local (`t`) symbol, so it is called at slide + x86_64 vmaddr; the byte check runs first, because
the arm64-vmaddr trap fails silently toward VERIFIED.
"""
import ctypes
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "ProChannel"
SYM = "__ZNK23OZChannelObjectRootBase31getDefaultParameterColorSpaceIDEv"
ADDR = 0x7337C
POISON = 0xCD
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


oz.require_x86_64()
fn, vmaddr, slide = oz.local_fn(FW, SYM, ctypes.c_int32, [ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  {SYM} vmaddr=0x{vmaddr:x}")
check("address", vmaddr == ADDR, f"0x{vmaddr:x} == the port's @0x{ADDR:x}")

body = ctypes.string_at(slide + vmaddr, 11)
print("  body bytes: " + " ".join(f"{b:02x}" for b in body))
check("the whole body", body == b"\x55\x48\x89\xe5\xb8\x03\x00\x00\x00\x5d\xc3",
      "55 48 89 e5 | b8 03 00 00 00 | 5d c3 — prologue, movl $0x3 %eax, epilogue: five "
      "instructions, no memory operand anywhere")
check("the immediate is 3 and 32-bit", body[4] == 0xB8 and
      int.from_bytes(body[5:9], "little") == 3,
      "b8 <imm32> is `movl $imm, %eax`; imm32 == 3 (not 0x30, and not a 64-bit movabs)")
shifted = ctypes.string_at(slide + vmaddr + 1, 11)
check("the byte check can fail", shifted[0:4] != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

arena = (ctypes.c_char * 0x40)(*([POISON] * 0x40))
before = bytes(arena)
got = fn(ctypes.byref(arena))
check("returns 3", got == 3, f"the live function returned {got}")
check("writes nothing", bytes(arena) == before,
      "the poisoned 0x40-byte `this` is byte-identical after the call (it is a const method)")
got_unmapped = fn(ctypes.c_void_p(0xDEAD0000))
check("ignores `this` entirely", got_unmapped == 3,
      "called with `this` pointing at UNMAPPED memory it still returns 3 — a dereference would "
      "have faulted, so 'reads no memory' is enforced by the hardware, not by inspection")

drv = os.path.join(HERE, "OZChannelObjectRootBase_getDefaultParameterColorSpaceID_driver.mts")
r = subprocess.run(["node", "--experimental-strip-types", drv], capture_output=True, text=True)
try:
    ts = json.loads(r.stdout.strip().splitlines()[-1])
except Exception:
    ts = None
    check("the port ran", False, f"driver produced no JSON: {(r.stdout + r.stderr)[-300:]}")
if ts is not None:
    check("TS == live", ts["value"] == got,
          f"the port returns {ts['value']}, the live function {got}")
    check("the port ignores `this` too", ts["poisonedThis"] == got,
          "calling it on an instance whose every modelled field is left unset gives the same "
          "answer, matching a body with no memory operand")

print()
print("OZChannelObjectRootBase::getDefaultParameterColorSpaceID @ProChannel 0x7337c — "
      + ("VERIFIED (body byte-identical to the transcription; returns 3 from the live image; "
         "reads and writes nothing)" if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
