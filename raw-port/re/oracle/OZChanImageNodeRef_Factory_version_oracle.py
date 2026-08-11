#!/usr/bin/env python3
"""OZChanImageNodeRef_Factory::version() @Ozone 0x1be10 — differential against the LIVE binary.

    arch -x86_64 /usr/bin/python3 OZChanImageNodeRef_Factory_version_oracle.py

The symbol is a LOCAL (`nm` type `t`), so dlsym cannot see it. It is reached the way OPS_LOG
prescribes: the x86_64 vmaddr from the cached inventory plus dyld's image slide, never a bare `nm`
(which reports the ARM64 slice even from a Rosetta process, giving an address inside the mapped
image that points at some other function). `ozone_loader` refuses to run unless the process really
is x86_64, and preloads Ozone's @rpath chain depth-first so the framework loads outside the app
bundle.

SELF-CHECK BEFORE ANY NUMBER. The nine prologue bytes at `slide + 0x1be10` must be the ones this
port transcribes. That is the cheapest available guard against calling the wrong address, and it
catches the arm64-vmaddr trap directly rather than through its consequences.

THE SENSITIVITY PROBLEM, and how it is solved here. This function returns a CONSTANT, so "the live
call returned 1" is indistinguishable from a harness that never reads %eax at all — a dead control
means the harness is blind, not that the port is right. The control is the class's own neighbour:
`revision()` @0x1be20 is the same six-instruction shape with `xorl %eax,%eax` instead of
`movl $0x1,%eax`, so it must come back 0 through the SAME CFUNCTYPE. If the harness were blind both
would read alike; they do not.
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

FW = "Ozone"

VERSION_VMADDR = 0x1BE10
VERSION_SYM = "__ZN26OZChanImageNodeRef_Factory7versionEv"
# 55 48 89 e5 b8 01 00 00 00 = pushq %rbp ; movq %rsp,%rbp ; movl $0x1,%eax
VERSION_PROLOGUE = bytes.fromhex("554889e5b801000000")

REVISION_VMADDR = 0x1BE20
# 55 48 89 e5 31 c0 = pushq %rbp ; movq %rsp,%rbp ; xorl %eax,%eax
REVISION_PROLOGUE = bytes.fromhex("554889e531c0")


def main() -> int:
    fn, addr, slide = ozone_loader.local_fn(          # returns a 3-TUPLE, not a callable
        FW, VERSION_SYM, ctypes.c_int32, [ctypes.c_void_p])
    print(f"arch          : {os.uname().machine}")
    print(f"image slide   : {hex(slide)}")
    print(f"inventory addr: {hex(addr)}  (expected {hex(VERSION_VMADDR)})")
    if addr != VERSION_VMADDR:
        print("SELF-CHECK FAILED — the inventory vmaddr is not the address this port cites")
        return 2

    got = ctypes.string_at(slide + VERSION_VMADDR, len(VERSION_PROLOGUE))
    rev_got = ctypes.string_at(slide + REVISION_VMADDR, len(REVISION_PROLOGUE))
    print(f"version  bytes: {got.hex()}  expected {VERSION_PROLOGUE.hex()}")
    print(f"revision bytes: {rev_got.hex()}  expected {REVISION_PROLOGUE.hex()}")
    if got != VERSION_PROLOGUE or rev_got != REVISION_PROLOGUE:
        print("SELF-CHECK FAILED — refusing to report any number")
        return 2
    print("SELF-CHECK PASS\n")

    revision = ctypes.CFUNCTYPE(ctypes.c_int32, ctypes.c_void_p)(slide + REVISION_VMADDR)

    # `this` is never read: %rdi is not touched anywhere in the six-instruction body. Call it with a
    # NULL receiver and with a poisoned arena, and require the same answer from both — that is the
    # measurement behind modelling the method as `static`, rather than an inference from reading.
    poison = ctypes.create_string_buffer(b"\xEE" * 0x40, 0x40)
    receivers = [
        ("NULL", None),
        ("poisoned 0x40-byte arena", ctypes.addressof(poison)),
    ]

    n = wrong = 0
    results = {}
    for label, recv in receivers:
        for _ in range(64):
            r = fn(recv)
            n += 1
            if r != 1:
                wrong += 1
                print(f"  DIVERGED receiver={label} -> {r}, expected 1")
        results[label] = fn(recv)
    print(f"version()  : {n - wrong}/{n} calls returned 1 "
          f"({', '.join(f'{k}={v}' for k, v in results.items())})")

    before = bytes(poison)
    fn(ctypes.addressof(poison))
    after = bytes(poison)
    print(f"read-only  : the poisoned receiver is "
          f"{'byte-identical' if before == after else '*** MODIFIED ***'} after the call")

    # SENSITIVITY CONTROL — a different function, same shape, same CFUNCTYPE, different constant.
    rev = revision(None)
    print(f"control    : revision() @0x1be20 -> {rev} (must be 0; if it read 1 the harness would be "
          f"reporting a constant of its own rather than %eax)")

    ok = wrong == 0 and before == after and rev == 0
    print("\nVERDICT:", "VERIFIED — version() returns the constant 1, reads no receiver, writes "
          "nothing, and the harness demonstrably reads %eax" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
