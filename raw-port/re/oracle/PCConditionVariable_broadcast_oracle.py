#!/usr/bin/env python3
"""Differential for PCConditionVariable::broadcast() @ProCore 0x34326 against the LIVE binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCConditionVariable_broadcast_oracle.py

The port is a BOUNDARY THROW — `_pthread_cond_broadcast` is a true out-of-scope extern — so there
is no return value to compare against a TS computation. What there IS to verify is every factual
claim the transcription makes, and each of them is falsifiable against the running image:

  * IDENTITY — the body bytes are re-derived from the mapped image and compared to the
    transcription, plus a one-byte-off negative control.
  * THE TAIL-JMP TARGET IS REALLY pthread_cond_broadcast — the rel32 of the `jmp` at 0x3432b is
    decoded to the stub VA, the 6-byte `jmpq *disp32(%rip)` at the stub is decoded to its lazy
    pointer, and the value in that pointer is compared to `dlsym(RTLD_DEFAULT, ...)`'s address for
    `pthread_cond_broadcast`. A comment saying "## symbol stub for:" is otool's opinion; this is
    the pointer the CPU will actually jump through. (The stub is resolved by calling the function
    once first, so the lazy pointer is bound rather than pointing at the binder.)
  * `this` IS PASSED UNMODIFIED, AT OFFSET 0 — the port's one structural claim (no `addq $N,%rdi`
    before the jmp, so the pthread_cond_t is at this+0x0). Measured, not read: a real
    `pthread_cond_init`ed cond at the START of an arena is broadcast through the FCP wrapper and
    must return 0, and the same call with the pointer shifted by +0x8 — the PCMutex layout, where
    the primitive really is at this+0x8 — must NOT return 0. If the wrapper adjusted the pointer,
    or the cond lived at +0x8, those two results would swap. That is the whole content of the
    offset claim, and it can fail.
  * PASS-THROUGH — libSystem's own `pthread_cond_broadcast` is called on the same cond through an
    identical CFUNCTYPE and must agree with the wrapper, so the wrapper adds nothing.

`broadcast()` is an exported (`nm` type `T`) symbol, so it is reached by dlsym; the byte checks
still run first, and everything runs under `arch -x86_64` because every @0xADDR in the port is an
x86_64 offset and an arm64 vmaddr would land on another function and fail silently toward VERIFIED.
"""
import ctypes
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "ProCore"
SYM = "__ZN19PCConditionVariable9broadcastEv"
BC_ADDR = 0x34326          # PCConditionVariable::broadcast()
STUB_ADDR = 0xDEA74        # the `jmp` target: symbol stub for _pthread_cond_broadcast
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


oz.require_x86_64()
bc, bc_va, slide = oz.local_fn(FW, SYM, ctypes.c_int32, [ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  broadcast vmaddr=0x{bc_va:x}")
check("address", bc_va == BC_ADDR, f"0x{bc_va:x} == the port's @0x{BC_ADDR:x}")

body = ctypes.string_at(slide + bc_va, 10)
print("  broadcast bytes: " + " ".join(f"{b:02x}" for b in body))
check("the whole body", body[0:4] == b"\x55\x48\x89\xe5" and body[4] == 0x5D and body[5] == 0xE9,
      "55 48 89 e5 | 5d | e9 rel32 — prologue, epilogue, then a TAIL-JMP (e9), not a call: "
      "no argument shuffling, no work of its own")
shifted = ctypes.string_at(slide + bc_va + 1, 4)
check("the byte check can fail", shifted != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

# ── the jmp's rel32 is relative to the END of the 5-byte instruction ───────────────────────────
rel32 = int.from_bytes(body[6:10], "little", signed=True)
jmp_target_va = bc_va + 0x5 + 5 + rel32          # 0x3432b is the jmp; +5 = next instruction
check("the tail-jmp goes to the stub the disasm names", jmp_target_va == STUB_ADDR,
      f"e9 rel32 at 0x{bc_va + 5:x} decodes to 0x{jmp_target_va:x} == @0x{STUB_ADDR:x}")

# ── bind the stub, then read the pointer the CPU jumps through ────────────────────────────────
# The FIRST call resolves the lazy pointer; before that it aims at dyld's binder, so reading it
# without calling first would compare against the wrong thing and look like a mismatch.
cond = (ctypes.c_char * 0x100)()
libc = ctypes.CDLL(None)
libc.pthread_cond_init.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
libc.pthread_cond_init.restype = ctypes.c_int32
check("test fixture", libc.pthread_cond_init(ctypes.byref(cond), None) == 0,
      "pthread_cond_init on a real 0x100-byte arena returned 0")
first = bc(ctypes.byref(cond))

stub = ctypes.string_at(slide + STUB_ADDR, 6)
print("  stub bytes: " + " ".join(f"{b:02x}" for b in stub))
check("the stub is an indirect jump", stub[0:2] == b"\xff\x25",
      "ff 25 disp32 — `jmpq *disp32(%rip)`, the lazy-pointer indirection")
lazy_va = STUB_ADDR + 6 + int.from_bytes(stub[2:6], "little", signed=True)
target = ctypes.c_void_p.from_address(slide + lazy_va).value
libc.dlsym.restype = ctypes.c_void_p
libc.dlsym.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
want = libc.dlsym(ctypes.c_void_p(-2), b"pthread_cond_broadcast")   # RTLD_DEFAULT
print(f"  lazy pointer @0x{lazy_va:x} -> 0x{target:x};  dlsym(pthread_cond_broadcast) = 0x{want:x}")
check("the target IS pthread_cond_broadcast", target == want,
      "the pointer the CPU jumps through is the same address libSystem exports for "
      "pthread_cond_broadcast — the callee identity is measured, not read off a comment")

# ── the structural claim: `this` unmodified, cond at +0x0 ─────────────────────────────────────
check("broadcast(this) on a real cond returns 0", first == 0,
      f"the FCP wrapper, called on the cond at offset 0 of the arena, returned {first}")
shifted_rc = bc(ctypes.c_void_p(ctypes.addressof(cond) + 0x8))
check("OFFSET CONTROL: the same cond at +0x8 does NOT return 0", shifted_rc != 0,
      f"broadcast(arena+0x8) returned {shifted_rc} (EINVAL=22) — the PCMutex layout, where the "
      "primitive really is at this+0x8, is REFUSED here, so 'no addq on %rdi, cond at this+0x0' "
      "is a measurement and not a reading")

libc.pthread_cond_broadcast.argtypes = [ctypes.c_void_p]
libc.pthread_cond_broadcast.restype = ctypes.c_int32
direct = libc.pthread_cond_broadcast(ctypes.byref(cond))
check("PASS-THROUGH: libSystem directly agrees", direct == first == 0,
      f"pthread_cond_broadcast(cond) direct = {direct}, through the wrapper = {first} — the "
      "wrapper contributes nothing but the jmp")

print()
print("PCConditionVariable::broadcast() @ProCore 0x34326 — "
      + ("VERIFIED (body byte-identical; the tail-jmp's rel32 and the stub's lazy pointer resolve "
         "to libSystem's pthread_cond_broadcast; `this` is passed unmodified with the cond at "
         "+0x0, and the +0x8 control is refused). The TS port is a boundary throw by policy: the "
         "callee is a true out-of-scope extern, so what is verified here is the transcription's "
         "claims, not a returned value."
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
