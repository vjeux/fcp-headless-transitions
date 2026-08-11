#!/usr/bin/env python3
"""Differential for OZObjectManipulator::didFinishLoadingIntoMotionEffect() @Ozone 0xfae40.

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZObjectManipulator_didFinishLoadingIntoMotionEffect_oracle.py

THE PROBLEM WITH THIS UNIT. The function's whole body is `pushq %rbp; movq %rsp,%rbp; popq %rbp;
retq` — the base class's do-nothing default for a virtual its subclasses override. "It does
nothing" is the one claim a harness can appear to confirm while measuring nothing at all: a driver
that calls a function and looks at an unchanged buffer reports exactly the same thing whether the
function is empty, whether the driver never called it, or whether the instrument cannot see a
write. So every claim here is paired with a control that FAILS if the instrument is blind:

  * IDENTITY — body bytes re-derived from the mapped image, plus a one-byte-off negative control.
  * SHAPE — the SAME virtual in a sibling class (`OZSceneNode::didFinishLoadingIntoMotionEffect`
    @0x961a0, which walks two intrusive lists and makes a virtual call at +0x180) is read through
    the identical path and is NOT this shape. So "empty" is a property of THIS address, not of the
    way the bytes are being read.
  * WRITES NOTHING — called with a 0xCD-poisoned 0x100-byte `this`, byte-compared afterwards.
    MUTATION CONTROL: `pthread_cond_init` is run over an identical arena through the same
    byte-diff, which DOES report a change — so the comparison can see a write when there is one.
  * READS NOTHING — called with `this` pointing at UNMAPPED memory (0xdead0000). FAULT CONTROL: a
    forked child dereferences that same address and dies with SIGSEGV, so an unmapped read really
    does fault in this process, and surviving the call means the function never performed one.

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; it is called at
`_dyld_get_image_vmaddr_slide(Ozone) + 0xfae40` under `arch -x86_64`, with the byte checks run
BEFORE the call — an arm64 vmaddr would land on some other function and fail silently toward
VERIFIED.
"""
import ctypes
import os
import signal
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Ozone"
SYM = "__ZN19OZObjectManipulator32didFinishLoadingIntoMotionEffectEv"
SIB = "__ZN11OZSceneNode32didFinishLoadingIntoMotionEffectEv"
ADDR, SIB_ADDR = 0xFAE40, 0x961A0
UNMAPPED = 0xDEAD0000
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, None, [ctypes.c_void_p])
sib_va = oz.nm_addr(FW, SIB)
print(f"{FW} slide=0x{slide:x}  vmaddr=0x{va:x}  sibling override vmaddr=0x{sib_va:x}")
check("addresses", va == ADDR and sib_va == SIB_ADDR,
      f"0x{va:x} == the port's @0x{ADDR:x}; the sibling control is at @0x{sib_va:x}")

body = ctypes.string_at(slide + va, 6)
print("  body bytes:    " + " ".join(f"{b:02x}" for b in body))
check("the whole body", body == b"\x55\x48\x89\xe5\x5d\xc3",
      "55 48 89 e5 | 5d c3 — prologue then epilogue and retq. No load, no store, no call, no "
      "branch, no immediate: the function is EMPTY, and %rdi is never touched")
shifted = ctypes.string_at(slide + va + 1, 4)
check("the byte check can fail", shifted[0:4] != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

sib_body = ctypes.string_at(slide + sib_va, 12)
print("  sibling bytes: " + " ".join(f"{b:02x}" for b in sib_body))
check("SHAPE CONTROL: the sibling override is not empty", sib_body[0:6] != b"\x55\x48\x89\xe5\x5d\xc3",
      "OZSceneNode's override of the SAME virtual, read through the identical path, is "
      "55 48 89 e5 41 56 … (pushes r14/rbx and walks a list) — so 'empty' is a fact about "
      "@0xfae40 and not about how these bytes are being read")

# ── writes nothing, and the instrument can see a write ────────────────────────────────────────
arena = (ctypes.c_char * 0x100)(*([0xCD] * 0x100))
before = bytes(arena)
fn(ctypes.byref(arena))
check("writes nothing", bytes(arena) == before,
      "the 0xCD-poisoned 0x100-byte `this` is byte-identical after the call")

libc = ctypes.CDLL(None)
libc.pthread_cond_init.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
libc.pthread_cond_init.restype = ctypes.c_int32
mut = (ctypes.c_char * 0x100)(*([0xCD] * 0x100))
mut_before = bytes(mut)
libc.pthread_cond_init(ctypes.byref(mut), None)
check("MUTATION CONTROL: the byte-diff can see a write", bytes(mut) != mut_before,
      "pthread_cond_init over an identical 0xCD arena IS reported as changed by the same "
      "comparison, so 'byte-identical' above is a measurement and not a blind spot")

# ── reads nothing, and an unmapped read really does fault here ────────────────────────────────
fn(ctypes.c_void_p(UNMAPPED))
check("reads nothing", True,
      f"called with `this` = 0x{UNMAPPED:x} (UNMAPPED) it returned normally — a dereference "
      "would have faulted")

pid = os.fork()
if pid == 0:                                    # child: prove that address really is fatal
    try:
        ctypes.CDLL(None).strlen(ctypes.c_void_p(UNMAPPED))
    except Exception:
        os._exit(3)
    os._exit(0)
_, status = os.waitpid(pid, 0)
sig = os.WTERMSIG(status) if os.WIFSIGNALED(status) else 0
check("FAULT CONTROL: that address is fatal to dereference", sig in (signal.SIGSEGV, signal.SIGBUS),
      f"a forked child reading 0x{UNMAPPED:x} died with signal {sig} "
      f"(SIGSEGV={int(signal.SIGSEGV)}) — so surviving the call above means the function never "
      "read its receiver")

print()
print("OZObjectManipulator::didFinishLoadingIntoMotionEffect() @Ozone 0xfae40 — "
      + ("VERIFIED (body byte-identical and EMPTY; the sibling class's override of the same "
         "virtual is a different shape; the receiver is neither written — with a mutation control "
         "proving the diff can see writes — nor read, with a fault control proving an unmapped "
         "read is fatal in this process)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
