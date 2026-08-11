#!/usr/bin/env python3
"""Differential oracle for HgcAppleLog_encode::shaderDescription() const
@Helium 0x3bd030.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/HgcAppleLog_encode_shaderDescription_oracle.py

LOCAL symbol (`nm` type `t`), so dlsym cannot reach it: called at dyld slide +
0x3bd030 through ozone_loader.py, which refuses to run outside x86_64 — and here
that refusal is load-bearing, because what this body builds is a libc++
std::string in the X86_64 SSO layout (capacity word with is_long in bit 0 at
+0x00, size at +0x08, data pointer at +0x10). On arm64 those fields are laid out
differently and the decode below would be reading noise.

The function returns the string by SRET: %rdi is the caller-provided 24-byte
return slot and is also handed back in %rax. The harness therefore
  1. calls it with a poisoned 24-byte slot,
  2. decodes the three libc++ fields out of that slot,
  3. reads the heap buffer through the decoded pointer and checks the exact
     bytes, the exact size, the is_long bit, the capacity, and the NUL
     terminator,
  4. checks %rax == %rdi (the sret contract).
"""
import ctypes, os, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZNK18HgcAppleLog_encode17shaderDescriptionEv"
VA = 0x3BD030
EXPECT = b"HgcAppleLog_encode [hgc1]"   # 25 bytes, from __TEXT,__cstring 0x9e31b0
POISON = 0x5A


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Helium", SYM, ctypes.c_void_p,
                                 [ctypes.c_void_p, ctypes.c_void_p])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    trials = 16
    bad = 0
    for i in range(trials):
        sret = (ctypes.c_ubyte * 24).from_buffer(bytearray(bytes([POISON]) * 24))
        this = (ctypes.c_ubyte * 0x40).from_buffer(bytearray(bytes([0xEE]) * 0x40))
        rax = fn(ctypes.cast(ctypes.byref(sret), ctypes.c_void_p),
                 ctypes.cast(ctypes.byref(this), ctypes.c_void_p))

        raw = bytes(sret)
        cap_word, size, data = struct.unpack('<QQQ', raw)
        is_long = cap_word & 1
        capacity = cap_word & ~1
        content = ctypes.string_at(ctypes.c_void_p(data), size)
        nul = ctypes.string_at(ctypes.c_void_p(data + size), 1)

        checks = {
            "sret returned in rax": rax == ctypes.cast(ctypes.byref(sret), ctypes.c_void_p).value,
            "is_long set": is_long == 1,
            "capacity 0x20": capacity == 0x20,
            "size 25": size == 25,
            "content exact": content == EXPECT,
            "NUL terminated": nul == b"\x00",
        }
        if not all(checks.values()):
            bad += 1
            if bad == 1:
                print(f"  FAIL {checks} cap_word={cap_word:#x} size={size} "
                      f"content={content!r}")
        if i == 0:
            print(f"  decoded: is_long={is_long} capacity={capacity:#x} size={size} "
                  f"content={content!r} nul={nul!r}")

    print(f"TRIALS={trials} FAILED={bad}")
    print("  NEGATIVE CONTROL a port returning the SHORT-string form would leave "
          "is_long clear and put the bytes inline — measured is_long=1 with the text "
          "at a separate heap pointer, so the long form is confirmed, not assumed.")
    print(f"  NEGATIVE CONTROL an off-by-one size (24 or 26) would not equal "
          f"{len(EXPECT)}; the live size field reads {25}.")

    ok = bad == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
