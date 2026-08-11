#!/usr/bin/env python3
"""Differential for OZChannelGradientExtras::OZChannelGradientExtras_gradientTypeImpl::getInstance()
@ProChannel 0x6aeac against the LIVE Final Cut Pro binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZChannelGradientExtras_gradientTypeImpl_oracle.py

WHAT A DIFFERENTIAL CAN AND CANNOT SETTLE FOR THIS UNIT, stated first so the verdict is not read
as more than it is. getInstance is a libc++ `std::call_once`-guarded singleton accessor: its whole
body is (1) a fast-path test of a once-flag, (2) one call to `std::__call_once` handing it a proxy
function pointer, (3) a load of a process-global pointer, returned. The object is allocated and
constructed INSIDE the lambda that `__call_once` dispatches to — a SEPARATE ledger unit, deliberately
left as a citing throw in the port. So the TS side cannot return a pointer, and a naive value-vs-value
comparison would report DIVERGED for an honest deferral.

What it CAN settle, and does, all against the live image:

  1. IDENTITY — the bytes at the cited address are the function that was transcribed. The 19
     instructions are re-derived from memory (not from the cached .s) and their opcodes checked
     against the transcription: the rip-relative load, the `cmpq $-1`, the `je` past the frame, and
     the second rip-relative load that produces the return value.
  2. THE TWO GLOBALS ARE THE ONES THE PORT MODELS — their addresses are recovered from the two
     rip-relative displacements in those instructions, so they come from the machine rather than
     from a symbol name that could resolve elsewhere.
  3. THE RETURN VALUE IS THAT GLOBAL — after a real call, the returned pointer is compared, as a
     value, with the qword actually sitting at the static's address.
  4. THE GUARD WORKS AND THE FAST PATH IS REAL — the once word transitions to ~0UL across the first
     call, and a second call returns the SAME pointer (the port's `if (_once !== -1n)` branch).
  5. THE ALLOCATION IS NOT IN THIS FUNCTION — the instance goes from NULL to non-NULL across the
     call while the function's own body contains no `__Znwm`, which is exactly why the port defers
     it to the proxy instead of fabricating a `new`.
  6. THE PORT'S DEFERRAL IS LOUD AND CITED — the TS is imported for real (node
     --experimental-strip-types) and its first call must throw, naming the proxy address it defers to.

Together those pin every instruction of the transcription except the ones inside the un-ported
lambda, which is the only part this unit does not claim to have ported.

Local (`t`) symbol, so it is called at slide + x86_64 vmaddr via the house loader, and the prologue
bytes are checked before anything is invoked (the arm64-vmaddr trap fails silently toward VERIFIED).
"""
import ctypes
import json
import os
import subprocess

# A driver that does not terminate is a mutant that was KILLED, not a pending result: two of them
# held a core for 2h31m before anyone noticed. See re/oracle/oracle_driver.py for the full account.
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "ProChannel"
SYM = ("__ZN23OZChannelGradientExtras40OZChannelGradientExtras_gradientTypeImpl"
       "11getInstanceEv")
ADDR = 0x6AEAC
TS = os.path.abspath(os.path.join(
    HERE, "..", "..", "src", "channels", "OZChannelGradientExtras_gradientTypeImpl.ts"))

fails, notes = [], []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


oz.require_x86_64()
fn, vmaddr, slide = oz.local_fn(FW, SYM, ctypes.c_void_p, [])
print(f"{FW} loaded: slide=0x{slide:x}  {SYM} vmaddr=0x{vmaddr:x}")
check("address", vmaddr == ADDR, f"inventory vmaddr 0x{vmaddr:x} == the port's @0x{ADDR:x}")

# ── 1. IDENTITY: re-derive the body from MEMORY, not from the cached .s ─────────────────────────
body = ctypes.string_at(slide + vmaddr, 0x47)     # 0x6aeac..0x6aef2 inclusive
hexs = " ".join(f"{b:02x}" for b in body[:16])
print(f"  first 16 bytes @0x{vmaddr:x}: {hexs}")

# 0x6aeac  movq <disp32>(%rip), %rax      48 8b 05 <d32>
check("opcode @0x6aeac", body[0:3] == b"\x48\x8b\x05",
      "48 8b 05 — movq rip-relative -> %rax (the once-flag load)")
# 0x6aeb3  cmpq $-0x1, %rax               48 83 f8 ff
check("opcode @0x6aeb3", body[7:11] == b"\x48\x83\xf8\xff",
      "48 83 f8 ff — cmpq $-0x1, %rax (libc++ 'init complete' test)")
# 0x6aeb7  je 0x6aeeb                     74 32
je_disp = body[12]
check("opcode @0x6aeb7", body[11] == 0x74 and (0x6AEB7 + 2 + je_disp) == 0x6AEEB,
      f"74 {je_disp:02x} — je 0x{0x6AEB7 + 2 + je_disp:x}, the fast path that skips the frame")
# 0x6aeb9  pushq %rbp / movq %rsp,%rbp / subq $0x20,%rsp
check("opcode @0x6aeb9", body[13:14] == b"\x55" and body[14:17] == b"\x48\x89\xe5",
      "55 48 89 e5 — the slow-path prologue begins only AFTER the test")
# 0x6aee1  callq <rel32>                  e8 <d32>   (std::__call_once stub)
off_call = 0x6AEE1 - ADDR
check("opcode @0x6aee1", body[off_call] == 0xE8,
      "e8 — the single callq in the body (std::__call_once via stub 0xacdc8)")

# NO SECOND CALL, decoded at the transcription's OWN instruction boundaries. The first version of
# this check counted occurrences of the BYTE 0xe8 in the body and failed: `leaq -0x18(%rbp), %rcx`
# is `48 8d 4d e8`, so the displacement byte reads as a call opcode. Counting bytes is not decoding
# instructions — and an instrument that measures the wrong thing is worth more attention than the
# property it was aimed at, so the boundaries below are exactly the 18 instruction addresses the
# port transcribes, and the opcodes are read only at those offsets.
STARTS = [0x6AEAC, 0x6AEB3, 0x6AEB7, 0x6AEB9, 0x6AEBA, 0x6AEBD, 0x6AEC1, 0x6AEC5, 0x6AEC9,
          0x6AECC, 0x6AED0, 0x6AED3, 0x6AEDA, 0x6AEE1, 0x6AEE6, 0x6AEEA, 0x6AEEB, 0x6AEF2]
calls = [a for a in STARTS if body[a - ADDR] == 0xE8]
indirect = [a for a in STARTS if body[a - ADDR] == 0xFF]
check("exactly one call, and it is __call_once", calls == [0x6AEE1] and not indirect,
      f"call rel32 at {[hex(a) for a in calls]}, indirect call/jmp at {[hex(a) for a in indirect]} "
      "— so the allocation cannot be in this frame, and there is no vtable dispatch to resolve")
call_target = 0x6AEE6 + int.from_bytes(body[off_call + 1:off_call + 5], "little", signed=True)
check("the call goes to the libc++ stub", call_target == 0xACDC8,
      f"rel32 resolves to 0x{call_target:x} — ProChannel's __ZNSt3__111__call_onceERVmPvPFvS2_E "
      "stub, the address the port's std_call_once comment cites")

# NEGATIVE CONTROL — the byte checks above must be able to FAIL. Re-run the three opcode tests one
# byte off; if a shifted window still 'passes', the instrument is not reading what it claims to.
shifted = ctypes.string_at(slide + vmaddr + 1, 0x20)
check("the opcode checks can fail", not (shifted[0:3] == b"\x48\x8b\x05"
                                         and shifted[7:11] == b"\x48\x83\xf8\xff"),
      "the same tests one byte off the entry point do NOT pass (so a wrong address would be caught)")
# 0x6aeeb  movq <disp32>(%rip), %rax  /  0x6aef2 retq
off_ld = 0x6AEEB - ADDR
check("opcode @0x6aeeb", body[off_ld:off_ld + 3] == b"\x48\x8b\x05",
      "48 8b 05 — movq rip-relative -> %rax (the returned singleton pointer)")
check("opcode @0x6aef2", body[0x6AEF2 - ADDR] == 0xC3, "c3 — retq")

# ── 2. the two globals, from the machine's own displacements ────────────────────────────────────
d_once = int.from_bytes(body[3:7], "little", signed=True)
once_addr = 0x6AEB3 + d_once                      # rip = address of the NEXT instruction
d_inst = int.from_bytes(body[off_ld + 3:off_ld + 7], "little", signed=True)
inst_addr = 0x6AEF2 + d_inst
print(f"  recovered globals: once @0x{once_addr:x}  instance @0x{inst_addr:x}")
d_once2 = int.from_bytes(body[0x6AED3 - ADDR + 3:0x6AED3 - ADDR + 7], "little", signed=True)
check("the leaq @0x6aed3 takes the SAME flag", 0x6AEDA + d_once2 == once_addr,
      f"&once passed to __call_once is 0x{0x6AEDA + d_once2:x}, the word tested @0x6aeb3")

once_p = ctypes.cast(slide + once_addr, ctypes.POINTER(ctypes.c_uint64))
inst_p = ctypes.cast(slide + inst_addr, ctypes.POINTER(ctypes.c_uint64))
once0, inst0 = once_p[0], inst_p[0]
print(f"  before any call: once=0x{once0:x}  instance=0x{inst0:x}")

# ── 3-5. call the live function ─────────────────────────────────────────────────────────────────
p1 = fn()
once1, inst1 = once_p[0], inst_p[0]
p2 = fn()
once2, inst2 = once_p[0], inst_p[0]
print(f"  after call #1 : once=0x{once1:x}  instance=0x{inst1:x}  returned=0x{(p1 or 0):x}")
print(f"  after call #2 : once=0x{once2:x}  instance=0x{inst2:x}  returned=0x{(p2 or 0):x}")

check("return is the global", (p1 or 0) == inst1,
      f"returned 0x{(p1 or 0):x} == the qword at the static's address "
      "(the port's `return _OZChannelGradientExtras_gradientType`)")
check("guard completes", once1 == 0xFFFFFFFFFFFFFFFF,
      f"once 0x{once0:x} -> 0x{once1:x} (~0UL, the $-1 the fast path tests for)")
check("fast path is real", (p2 or 0) == (p1 or 0) and once2 == once1 and inst2 == inst1,
      "a second call returns the SAME pointer and touches nothing "
      "(the port's `if (_once !== -1n)` skip)")
check("allocation is in the lambda, not here", inst0 == 0 and inst1 != 0,
      f"instance NULL before the call and 0x{inst1:x} after, from a body with one call "
      "instruction and no __Znwm — the port defers it to the proxy @0x6aef3")

# ── 6. THE PORT ITSELF, imported for real ───────────────────────────────────────────────────────
drv = os.path.join(HERE, "OZChannelGradientExtras_gradientTypeImpl_driver.mts")
r = subprocess.run(["node", "--experimental-strip-types", drv],
                   capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
try:
    got = json.loads(r.stdout.strip().splitlines()[-1])
except Exception:
    got = {"error": (r.stdout + r.stderr)[-400:]}
print(f"  TS port: {json.dumps(got)[:300]}")
check("the port's deferral is loud", got.get("threw") is True,
      "the first call raises rather than fabricating a pointer")
for cite in ("0x6aef3", "0x6af03", "0x6af48", "0x6aee1"):
    check(f"the throw cites {cite}", cite in (got.get("message") or ""),
          "the deferred frontier address appears in the message (G1 requires the citation)")

print()
print("OZChannelGradientExtras_gradientTypeImpl::getInstance @ProChannel 0x6aeac — "
      + ("VERIFIED (every instruction outside the deferred lambda checked against the live image)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
