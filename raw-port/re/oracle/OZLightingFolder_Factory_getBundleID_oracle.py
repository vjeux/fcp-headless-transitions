#!/usr/bin/env python3
"""Differential oracle for OZLightingFolder_Factory::getBundleID() @Ozone 0x4b2820.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZLightingFolder_Factory_getBundleID_oracle.py

This symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it — it is called at
slide + its x86_64 vmaddr through raw-port/re/oracle/ozone_loader.py, which also
handles the @rpath preload chain Ozone needs outside the app bundle. Both halves of
the OPS_LOG architecture trap are closed there: the process must be x86_64 (the port
cites x86_64 offsets), and the address comes from `nm -n -arch x86_64` rather than a
bare `nm` that would answer from the arm64 slice.

What is checked, against the live binary:
  1. the returned pointer is EXACTLY the literal the `leaq 0x33475d(%rip)` @0x4b2824
     computes — VA 0x7e6f88 — so the port's claim about WHICH literal is verified,
     not just the string value it happens to contain;
  2. that literal is the EMPTY string (otool annotates it `""`; here the bytes are
     read back through the live pointer);
  3. the body never reads `this`: the same answer comes back for a range of bogus
     `this` pointers, which is what licenses the port's stateless model.
"""
import ctypes, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN24OZLightingFolder_Factory11getBundleIDEv"
FN_VA = 0x4B2820          # @Ozone — the function
LITERAL_VA = 0x7E6F88     # = 0x4b282b (RIP after the leaq) + 0x33475d


def main():
    L.require_x86_64()
    L.load_framework("Ozone")
    slide, image = L.image_slide("Ozone")
    print(f"image={image}\nslide={slide:#x}")

    vmaddr = L.nm_addr("Ozone", SYM)
    assert vmaddr == FN_VA, f"symbol moved: {vmaddr:#x} != {FN_VA:#x} (wrong slice?)"

    as_ptr, _, _ = L.local_fn("Ozone", SYM, ctypes.c_void_p, [ctypes.c_void_p])
    as_str, _, _ = L.local_fn("Ozone", SYM, ctypes.c_char_p, [ctypes.c_void_p])

    # 3. `this`-insensitivity: the body has no (%rdi) operand at all.
    this_values = [None, 0x1, 0xDEADBEEF, slide, 0x7FFFFFFFFFFF, 0x4141414141414141]
    ptrs = [as_ptr(ctypes.c_void_p(t)) for t in this_values]
    strs = [as_str(ctypes.c_void_p(t)) for t in this_values]

    # 1. the pointer identity
    wrong_ptr = sum(1 for p in ptrs if p - slide != LITERAL_VA)
    # 2. the content
    wrong_str = sum(1 for s in strs if s != b"")
    this_sensitive = len(set(ptrs)) - 1

    print(f"CALLS={len(ptrs)} WRONG_LITERAL_ADDR={wrong_ptr} NON_EMPTY_RESULT={wrong_str} "
          f"THIS_SENSITIVE={this_sensitive}")
    print(f"  returned pointer - slide = {ptrs[0] - slide:#x} (expected {LITERAL_VA:#x})")
    print(f"  bytes at that pointer    = {strs[0]!r} (expected b'')")

    # negative controls: what a wrong port would have to look like to pass
    print("  NEGATIVE CONTROL a port returning 'com.apple.motion': "
          f"{sum(1 for s in strs if s != b'com.apple.motion')}/{len(strs)} wrong")
    print("  NEGATIVE CONTROL a port returning the NEXT cstring literal ('Woods_EnvMapIcon'): "
          f"{sum(1 for s in strs if s != b'Woods_EnvMapIcon')}/{len(strs)} wrong")
    print("  NEGATIVE CONTROL a port returning null instead of an empty string: "
          f"{sum(1 for p in ptrs if p is None)}/{len(ptrs)} match (the real one is a "
          "valid pointer TO an empty string, not NULL)")

    ok = wrong_ptr == 0 and wrong_str == 0 and this_sensitive == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
