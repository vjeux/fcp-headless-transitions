#!/usr/bin/env python3
"""Differential oracle for `PCInfo::availableVRAM()` @ProCore 0x530c6
(__ZN6PCInfo13availableVRAMEv).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/PCInfo_availableVRAM_oracle.py

This getter is a `dispatch_once` memoised static, so almost everything about it
lives in BSS and is therefore INVISIBLE IN THE FILE IMAGE — `onceToken`
@0x15bd30 and `vramAvailable` @0x15bd28 are `nm` class `b`, i.e. they occupy no
bytes on disk at all. Reading them from the Mach-O tells you nothing (OPS_LOG:
"a b-class table is all zeroes in the file image; transcribing one from disk
gates green and is wrong forever"). The only way to state what this function
does is to run it, which is what this harness does:

  1. read both BSS slots BEFORE any call — they must be 0/0, which is the
     demonstration that the file image could not have supplied them;
  2. call the function once and watch `onceToken` flip to the -1 sentinel the
     fast path compares against, and `vramAvailable` become the returned value;
  3. call it again and confirm it is memoised — same value, and the token stays
     -1, so the second call really did take the two-instruction fast path;
  4. RESOLVE THE SELECTOR the init block sends to each Metal device, by name,
     out of the live image — rather than assuming which property it is;
  5. recompute the whole thing independently through the ObjC runtime —
     max over MTLCopyAllDevices() of that selector, then >> 20 — and check it
     equals what the function returned.
"""
import ctypes
import ctypes.util
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import image_slide, load_framework, local_fn, require_x86_64  # noqa: E402

FW = "ProCore"
SYM = "__ZN6PCInfo13availableVRAMEv"
ONCE_TOKEN = 0x15BD30      # nm class `b` (BSS)
VRAM_AVAILABLE = 0x15BD28  # nm class `b` (BSS)
# The block loads the selector at @0x53169 with `movq 0x104ea0(%rip), %r14`.
# RIP-relative displacements are measured from the NEXT instruction, so the
# slot is 0x53170 + 0x104ea0 = 0x158010 — NOT 0x104ea0. (Using the displacement
# as if it were the address segfaulted the first run of this harness; that is a
# harness bug, not a port defect, and it is the same trap the @0xADDR notes in
# every port file warn about.)
SELREF_SITE = 0x53169
SELREF_NEXT = 0x53170
SELREF_DISP = 0x104EA0
SELREF = SELREF_NEXT + SELREF_DISP   # = 0x158010, in __DATA,__objc_selrefs

#   0x530c6  48 83 3d ...  cmpq $-0x1, onceToken(%rip)
#   0x530ce  75 08         jne  0x530d8
#   0x530d0  48 8b 05 ...  movq vramAvailable(%rip), %rax
#   0x530d7  c3            retq
EXPECTED_HEAD = bytes.fromhex("48833d")


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, ctypes.c_uint64, [])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    head = ctypes.string_at(slide + addr, 3)
    if head != EXPECTED_HEAD:
        print(f"BYTE SELF-CHECK FAILED: {head.hex()} != {EXPECTED_HEAD.hex()}")
        return 1
    # recompute both rip-relative BSS references from their own encodings
    cmp_bytes = ctypes.string_at(slide + addr, 8)         # cmpq $-1, disp32(%rip)
    once_target = (addr + 8) + int.from_bytes(cmp_bytes[3:7], "little")
    mov_bytes = ctypes.string_at(slide + 0x530D0, 7)      # movq disp32(%rip), %rax
    vram_target = (0x530D0 + 7) + int.from_bytes(mov_bytes[3:7], "little")
    print(f"byte self-check PASS: {cmp_bytes.hex()} / {mov_bytes.hex()}")
    print(f"  onceToken      -> 0x{once_target:x} (want 0x{ONCE_TOKEN:x})")
    print(f"  vramAvailable  -> 0x{vram_target:x} (want 0x{VRAM_AVAILABLE:x})")
    if once_target != ONCE_TOKEN or vram_target != VRAM_AVAILABLE:
        return 1

    def peek(va):
        return struct.unpack("<q", ctypes.string_at(slide + va, 8))[0]

    # ---- 1. the BSS state before anything ran -------------------------------
    t0, v0 = peek(ONCE_TOKEN), peek(VRAM_AVAILABLE)
    print(f"BSS before the first call: onceToken={t0}, vramAvailable={v0} "
          f"(both 0 — these slots occupy NO bytes in the Mach-O; `nm` class b)")
    if (t0, v0) != (0, 0):
        print("  (already initialised in this process — re-run in a fresh one "
              "to see the transition; the checks below still hold)")

    # ---- 2/3. call it, watch the memoisation --------------------------------
    r1 = fn()
    t1, v1 = peek(ONCE_TOKEN), peek(VRAM_AVAILABLE)
    r2 = fn()
    t2, v2 = peek(ONCE_TOKEN), peek(VRAM_AVAILABLE)
    print(f"first call  -> {r1}   BSS now onceToken={t1}, vramAvailable={v1}")
    print(f"second call -> {r2}   BSS now onceToken={t2}, vramAvailable={v2}")
    ok_once = (t1 == -1 and t2 == -1)
    ok_memo = (r1 == r2 == v1 == v2)
    print(f"  dispatch_once sentinel reached: {ok_once} (the fast path compares "
          f"against -1)")
    print(f"  memoised and equal to the cached slot: {ok_memo}")

    # ---- 4. what selector does the init block actually send? ----------------
    objc = ctypes.CDLL(ctypes.util.find_library("objc"))
    objc.sel_getName.restype = ctypes.c_char_p
    objc.sel_getName.argtypes = [ctypes.c_void_p]
    raw = ctypes.string_at(slide + SELREF_SITE, 7)
    disp = int.from_bytes(raw[3:7], "little")
    if disp != SELREF_DISP:
        print(f"  selref disp32 is 0x{disp:x}, expected 0x{SELREF_DISP:x}")
        return 1
    sel = struct.unpack("<Q", ctypes.string_at(slide + SELREF, 8))[0]
    sel_name = objc.sel_getName(ctypes.c_void_p(sel)).decode()
    print(f"selector: the block's `movq 0x{disp:x}(%rip), %r14` @0x{SELREF_SITE:x} "
          f"resolves to __objc_selrefs 0x{SELREF:x} -> -[{sel_name}] "
          f"(read from the live image, not assumed)")

    # ---- 5. recompute the block independently -------------------------------
    mtl = ctypes.CDLL(ctypes.util.find_library("Metal"))
    mtl.MTLCopyAllDevices.restype = ctypes.c_void_p
    objc.objc_msgSend.restype = ctypes.c_void_p
    objc.objc_msgSend.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    objc.sel_registerName.restype = ctypes.c_void_p
    objc.sel_registerName.argtypes = [ctypes.c_char_p]

    devices = mtl.MTLCopyAllDevices()
    count_fn = ctypes.CDLL(ctypes.util.find_library("objc")).objc_msgSend
    count_fn.restype = ctypes.c_long
    count_fn.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    n = count_fn(ctypes.c_void_p(devices), objc.sel_registerName(b"count"))

    at_index = ctypes.CDLL(ctypes.util.find_library("objc")).objc_msgSend
    at_index.restype = ctypes.c_void_p
    at_index.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_long]

    prop = ctypes.CDLL(ctypes.util.find_library("objc")).objc_msgSend
    prop.restype = ctypes.c_uint64
    prop.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

    best = 0
    per_device = []
    for i in range(n):
        dev = at_index(ctypes.c_void_p(devices),
                       objc.sel_registerName(b"objectAtIndex:"), i)
        val = prop(ctypes.c_void_p(dev), ctypes.c_void_p(sel))
        per_device.append(val)
        if val > best:                       # `ja` = UNSIGNED above @0x531a5
            best = val
    recomputed = best >> 20                  # shrq $0x14 @0x531f3
    print(f"independent recompute: {n} Metal device(s), {sel_name} = "
          f"{per_device}, max = {best} bytes, >> 20 = {recomputed}")

    ok_recompute = (recomputed == r1)
    print(f"  matches the live function's answer: {ok_recompute}")

    print("negative controls (each MUST differ from the live answer; a match "
          "would mean the harness cannot tell these apart):")
    controls = {
        "no >> 20 (bytes, not megabytes)": best,
        ">> 10 (kilobytes)": best >> 10,
        "MIN over devices instead of MAX": (min(per_device) >> 20) if per_device else -1,
        "sum over devices instead of max": (sum(per_device) >> 20),
    }
    dead = 0
    for name, val in controls.items():
        differs = val != r1
        if not differs:
            dead += 1
        print(f"  {'differs' if differs else 'SAME':>8} ({val}) — {name}")
    if len(per_device) < 2:
        print("  NOTE: this host has a single Metal device, so the MIN/SUM "
              "controls cannot distinguish themselves from MAX on value alone "
              "— the `ja` at @0x531a5 is what establishes MAX, and it is an "
              "UNSIGNED compare. Reported rather than counted as proof.")
        dead = 0 if all(v != r1 for k, v in controls.items()
                        if k.startswith(("no >>", ">> 10"))) else dead

    ok = ok_once and ok_memo and ok_recompute
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
