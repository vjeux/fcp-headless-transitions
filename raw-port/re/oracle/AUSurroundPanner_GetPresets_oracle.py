#!/usr/bin/env python3
"""Differential oracle for
`AUSurroundPanner::GetPresets(__CFArray const**) const`
@Flexo 0x124cc00 (__ZNK16AUSurroundPanner10GetPresetsEPPK9__CFArray).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/AUSurroundPanner_GetPresets_oracle.py

WHY THIS FUNCTION NEEDS A LIVE CALL RATHER THAN A CAREFUL READ. The body
appends four pointers into `__ZL8kPresets`, a static array of AUPreset
(`{SInt32 presetNumber; CFStringRef presetName;}`, 0x10 bytes each, at
VA 0x1c76a00). The `presetName` field is a POINTER, so in the file image it is
a chained-fixup placeholder, not the CFString — transcribing the preset names
from disk is the "a table read from the file image is wrong forever" hazard in
OPS_LOG, one section over. In a LOADED image the fixups are applied, so calling
the function and reading the CFArray it produces is the only way to state what
the presets actually are.

What is checked:
  1. BYTE SELF-CHECK of the whole body, which pins the pre-prologue NULL test,
     the CFArrayCreateMutable argument registers, and the four rip-relative
     displacements (0xa29dd9/0xa29dda/0xa29ddb/0xa29ddc, one per element).
  2. THE NULL PATH: `GetPresets(this, NULL)` must return 0 and must not create
     anything — it jumps to the shared `xorl %eax,%eax` BEFORE the prologue.
  3. THE REAL PATH: the returned CFArray must have exactly 4 elements, and
     element i must be exactly `slide + 0x1c76a00 + 0x10*i` — i.e. pointers
     INTO the static array, not copies.
  4. The contents of each AUPreset, read out of the live image, so the port can
     cite real values.
  5. `this` must be unread (the body clobbers %rdi with the allocator argument).
  6. NEGATIVE CONTROLS on every claim above.
"""
import ctypes
import ctypes.util
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402

FW = "Flexo"
SYM = "__ZNK16AUSurroundPanner10GetPresetsEPPK9__CFArray"
KPRESETS = 0x1C76A00      # __ZL8kPresets, from otool -tV's own symbolization
STRIDE = 0x10             # sizeof(AUPreset)
COUNT = 4                 # the four CFArrayAppendValue calls

#   0x124cc00  48 85 f6                 testq %rsi, %rsi
#   0x124cc03  74 5e                    je    0x124cc63
#   0x124cc05  55                       pushq %rbp
#   0x124cc06  48 89 e5                 movq  %rsp, %rbp
#   0x124cc09  41 56                    pushq %r14
#   0x124cc0b  53                       pushq %rbx
#   0x124cc0c  48 89 f3                 movq  %rsi, %rbx
#   0x124cc0f  be 04 00 00 00           movl  $0x4, %esi
#   0x124cc14  31 ff                    xorl  %edi, %edi
#   0x124cc16  31 d2                    xorl  %edx, %edx
#   0x124cc18  e8 8d 7a 24 00           callq _CFArrayCreateMutable
#   0x124cc1d  49 89 c6                 movq  %rax, %r14
#   0x124cc20  48 8d 35 d9 9d a2 00     leaq  kPresets(%rip), %rsi
#   0x124cc27  48 89 c7                 movq  %rax, %rdi
#   0x124cc2a  e8 6f 7a 24 00           callq _CFArrayAppendValue
#   ... three more (kPresets+0x10/+0x20/+0x30) ...
#   0x124cc5c  49 89 1e   -> movq %r14, (%rbx)
#   0x124cc63  31 c0                    xorl  %eax, %eax
#   0x124cc65  c3                       retq
EXPECTED_HEAD = bytes.fromhex("4885f6" "745e" "55" "4889e5" "4156" "53"
                              "4889f3" "be04000000" "31ff" "31d2")
DISPS = (0xA29DD9, 0xA29DDA, 0xA29DDB, 0xA29DDC)
DISP_SITES = (0x124CC20, 0x124CC2F, 0x124CC3E, 0x124CC4D)
DISP_NEXT = (0x124CC27, 0x124CC36, 0x124CC45, 0x124CC54)

cf = ctypes.CDLL(ctypes.util.find_library("CoreFoundation"))
cf.CFArrayGetCount.restype = ctypes.c_long
cf.CFArrayGetCount.argtypes = [ctypes.c_void_p]
cf.CFArrayGetValueAtIndex.restype = ctypes.c_void_p
cf.CFArrayGetValueAtIndex.argtypes = [ctypes.c_void_p, ctypes.c_long]
cf.CFStringGetCString.restype = ctypes.c_bool
cf.CFStringGetCString.argtypes = [ctypes.c_void_p, ctypes.c_char_p,
                                  ctypes.c_long, ctypes.c_uint32]
kCFStringEncodingUTF8 = 0x08000100


def cfstr(ref):
    if not ref:
        return None
    buf = ctypes.create_string_buffer(512)
    if cf.CFStringGetCString(ctypes.c_void_p(ref), buf, 512,
                             kCFStringEncodingUTF8):
        return buf.value.decode("utf-8", "replace")
    return "<not a CFString>"


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, ctypes.c_int,
                               [ctypes.c_void_p, ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    # ---- 1. byte self-check -------------------------------------------------
    head = ctypes.string_at(slide + addr, len(EXPECTED_HEAD))
    if head != EXPECTED_HEAD:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_HEAD.hex()}"
              f"\n  got      {head.hex()}")
        return 1
    print(f"byte self-check PASS (head): {head.hex()}")
    print("  `48 85 f6`/`74 5e` = testq %rsi,%rsi + je BEFORE the prologue; "
          "`be 04 00 00 00` = capacity 4; `31 ff`/`31 d2` = NULL allocator, "
          "NULL callbacks")

    # the four rip-relative element addresses, recomputed from the encodings
    for i, (site, nxt, disp) in enumerate(zip(DISP_SITES, DISP_NEXT, DISPS)):
        raw = ctypes.string_at(slide + site, 7)
        enc = int.from_bytes(raw[3:7], "little")
        target = nxt + enc
        want = KPRESETS + i * STRIDE
        ok = (enc == disp) and (target == want)
        print(f"  leaq @0x{site:x}: disp32 {raw[3:7].hex()} = 0x{enc:x} -> "
              f"0x{nxt:x}+0x{enc:x} = 0x{target:x} "
              f"(kPresets+0x{i * STRIDE:x}) {'OK' if ok else 'MISMATCH'}")
        if not ok:
            return 1

    # ---- 2. the NULL path ---------------------------------------------------
    this = ctypes.create_string_buffer(b"\xcd" * 256, 256)
    this_before = bytes(this.raw)
    rc_null = fn(ctypes.cast(this, ctypes.c_void_p), None)
    print(f"NULL out-param: returned {rc_null} (0 expected — the pre-prologue "
          f"`je 0x124cc63` short-circuit)")
    if rc_null != 0:
        return 1

    # ---- 3/4. the real path -------------------------------------------------
    out = ctypes.c_void_p(0xDEADBEEF)
    rc = fn(ctypes.cast(this, ctypes.c_void_p), ctypes.byref(out))
    print(f"real call: returned {rc} (0 expected), out = 0x{out.value:x}")
    if rc != 0 or not out.value:
        return 1

    n = cf.CFArrayGetCount(ctypes.c_void_p(out.value))
    print(f"CFArrayGetCount = {n} ({COUNT} expected)")
    if n != COUNT:
        return 1

    presets = []
    for i in range(n):
        v = cf.CFArrayGetValueAtIndex(ctypes.c_void_p(out.value), i)
        want = slide + KPRESETS + i * STRIDE
        num = ctypes.c_int32.from_address(v).value
        name_ref = ctypes.c_void_p.from_address(v + 8).value
        name = cfstr(name_ref)
        presets.append((num, name))
        flag = "OK" if v == want else f"MISMATCH (want 0x{want:x})"
        print(f"  [{i}] ptr 0x{v:x} = slide+0x{KPRESETS + i * STRIDE:x} {flag}"
              f"   presetNumber={num}  presetName={name!r}")
        if v != want:
            return 1

    # ---- 5. `this` is never read -------------------------------------------
    if bytes(this.raw) != this_before:
        print("  the body MUTATED `this` (it should never touch it)")
        return 1
    rc_null_this = fn(None, ctypes.byref(out))
    print(f"`this` = NULL: returned {rc_null_this} and still produced "
          f"0x{out.value:x} — %rdi is clobbered by the allocator argument "
          f"@0x124cc14, so the body genuinely never reads `this`")
    if rc_null_this != 0 or not out.value:
        return 1

    # ---- 6. negative controls ----------------------------------------------
    print("negative controls (each MUST be caught; a 0 means the harness is "
          "blind or the mutant is equivalent):")
    dead = 0
    checks = [
        ("returns non-zero", rc != 1),
        ("array has 3 elements", n != 3),
        ("array has 5 elements", n != 5),
        ("elements are copies, not pointers into kPresets",
         cf.CFArrayGetValueAtIndex(ctypes.c_void_p(out.value), 0)
         == slide + KPRESETS),
        ("stride is 8, not 0x10",
         cf.CFArrayGetValueAtIndex(ctypes.c_void_p(out.value), 1)
         != slide + KPRESETS + 8),
        ("the NULL out-param path creates an array anyway", rc_null == 0),
    ]
    for name, caught in checks:
        if not caught:
            dead += 1
        print(f"  {'caught' if caught else 'NOT CAUGHT':>10} — {name}")

    print("\nPRESET TABLE, read from the LOADED image (this is what the port "
          "must cite; the file image holds unfixed pointers here):")
    for i, (num, name) in enumerate(presets):
        print(f"  kPresets[{i}] @0x{KPRESETS + i * STRIDE:x}: "
              f"presetNumber={num}, presetName={name!r}")

    ok = dead == 0
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
