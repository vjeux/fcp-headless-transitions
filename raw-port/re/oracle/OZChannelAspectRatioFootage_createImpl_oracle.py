#!/usr/bin/env python3
"""OZChannelAspectRatioFootage::createOZChannelAspectRatioFootageImpl() @ProChannel 0x66e2
— differential against the LIVE binary.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/OZChannelAspectRatioFootage_createImpl_oracle.py

WHY ROSETTA: the port is transcribed from the x86_64 slice — OPS_LOG's "the executable
oracle calls the wrong architecture, and fails toward ACCEPT".

WHAT CAN AND CANNOT BE CLAIMED HERE. The initializer lambda (@0x6890, through the libc++
proxy @0x687f) is a SEPARATE ledger unit, so the port defers it with a throw. A value-for-value
differential is therefore impossible by construction, and pretending otherwise would be the
dishonest half of this. What IS checkable — and is exactly the part the port models — is the
ACCESSOR's contract:

  1. the address really is the transcribed body (byte self-check on the prologue);
  2. the two RIP-relative operands the transcription names are the once_flag and the singleton
     pointer, decoded FROM THE INSTRUCTION BYTES rather than trusted from the disassembler's
     symbolisation (OPS_LOG: `otool -tV` will happily symbolise a displacement into an
     unrelated name);
  3. the once_flag really does end at ~0UL and the fast path is a `cmpq $-1`, which is the one
     branch the port's model turns on;
  4. the accessor returns the singleton pointer VERBATIM from that global — the same value on
     the second call, and equal to the word the global holds.

Calling it runs FCP's own initializer inside this process, which is what makes 3 and 4
observable at all.
"""
import ctypes
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

FW = "ProChannel"
VMADDR = 0x66E2
# 55 48 89 e5 48 83 ec 20 = pushq %rbp ; movq %rsp,%rbp ; subq $0x20,%rsp
PROLOGUE = bytes.fromhex("554889e54883ec20")


def rip_target(base_addr, insn_off, insn_len, disp_off):
    """Decode a RIP-relative operand from the bytes themselves: target = next_insn + disp32."""
    raw = ctypes.string_at(base_addr + insn_off, insn_len)
    disp = struct.unpack_from("<i", raw, disp_off)[0]
    return base_addr + insn_off + insn_len + disp, raw


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    here = ctypes.string_at(addr, len(PROLOGUE))
    print(f"image        : {image}")
    print(f"slide+vmaddr : {slide:#x} + {VMADDR:#x} = {addr:#x}")
    print(f"prologue     : {here.hex()}  expected {PROLOGUE.hex()}")
    if here != PROLOGUE:
        print("SELF-CHECK FAILED — not the transcribed body.")
        return 1
    print("self-check   : OK\n")

    # 0x66ea  48 8b 05 <disp32>   movq _..._once(%rip), %rax     (7 bytes)
    once_addr, once_raw = rip_target(addr, 0x66EA - VMADDR, 7, 3)
    # 0x671c  48 8d 05 <disp32>   leaq _...Impl(%rip), %rax      (7 bytes)
    impl_addr, impl_raw = rip_target(addr, 0x671C - VMADDR, 7, 3)
    print(f"decoded from the bytes, not from the disassembler's symbolisation:")
    print(f"  @0x66ea {once_raw.hex()}  -> once_flag at {once_addr:#x} "
          f"(vmaddr {once_addr - slide:#x})")
    print(f"  @0x671c {impl_raw.hex()}  -> singleton at {impl_addr:#x} "
          f"(vmaddr {impl_addr - slide:#x})")
    if once_raw[:3] != b"\x48\x8b\x05" or impl_raw[:3] != b"\x48\x8d\x05":
        print("the two operands are not the movq/leaq the transcription names — stopping")
        return 1

    once_before = struct.unpack("<q", ctypes.string_at(once_addr, 8))[0]
    impl_before = struct.unpack("<Q", ctypes.string_at(impl_addr, 8))[0]
    print(f"\nbefore: once = {once_before:#x}   singleton = {impl_before:#x}")

    fn = ctypes.CFUNCTYPE(ctypes.c_void_p)(addr)
    first = fn()
    once_1 = struct.unpack("<q", ctypes.string_at(once_addr, 8))[0]
    impl_1 = struct.unpack("<Q", ctypes.string_at(impl_addr, 8))[0]
    second = fn()
    once_2 = struct.unpack("<q", ctypes.string_at(once_addr, 8))[0]
    print(f"call 1: returned {first if first else 0:#x}   once = {once_1:#x}   "
          f"singleton = {impl_1:#x}")
    print(f"call 2: returned {second if second else 0:#x}  once = {once_2:#x}")

    ok = True
    checks = [
        ("the accessor returns the singleton pointer verbatim", (first or 0) == impl_1),
        ("it is not NULL after the initializer ran", (first or 0) != 0),
        ("the second call returns the same pointer", first == second),
        ("the once_flag ends at ~0UL, which is what the `cmpq $-1` fast path tests",
         once_1 == -1 and once_2 == -1),
        ("the initializer ran exactly once (the flag did not move on call 2)", once_1 == once_2),
    ]
    print()
    for label, good in checks:
        print(f"   {'ok  ' if good else 'FAIL'} — {label}")
        ok &= good

    print("\n" + ("VERDICT: VERIFIED — the accessor's contract is exactly what the port models: "
                 "a ~0UL fast-path flag, and a verbatim load of the singleton global. The "
                 "INITIALIZER is a separate ledger unit (@0x6890 via the proxy @0x687f) and is "
                 "deferred with a citing throw, so no claim is made about it here"
                 if ok else "VERDICT: FAILED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
