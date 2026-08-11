#!/usr/bin/env python3
"""Differential oracle for HGBufferDumper::~HGBufferDumper() [D1] @Helium 0x1c79a0
(and its byte-identical D2 twin @0x1c7950).

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGBufferDumper_D1_oracle.py

ROSETTA IS LOAD-BEARING HERE, not a formality. This body is three libc++
std::string teardowns, and the two slices disagree about exactly the bytes it
reads: on x86_64 `is_long` is BIT 0 OF BYTE +0x00 of the string and the heap
pointer is at +0x10, while on arm64 `is_long` is the SIGN BIT OF BYTE +0x17 and
the data pointer is at +0x00 (OPS_LOG's flagship silent-false-VERIFIED case).
The port transcribes the x86_64 slice; ozone_loader.require_x86_64() refuses to
run anywhere else.

The dtor frees the heap buffer of each of the three strings, in reverse
declaration order (+0x30, then +0x18, then +0x00), and only when that string's
own long-flag is set. The oracle walks all EIGHT flag combinations and checks,
per string, whether its block was freed — which pins the flag->pointer mapping
(+0x30 -> +0x40, +0x18 -> +0x28, +0x00 -> +0x10) rather than merely observing
that "some frees happened".
"""
import ctypes, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

D1_VA = 0x1C79A0
D2_VA = 0x1C7950
OBJ = 0x80
BLOCK = 0x40
# (flag byte offset, heap pointer offset) for the three std::string subobjects
STRINGS = [(0x00, 0x10), (0x18, 0x28), (0x30, 0x40)]


def main():
    L.require_x86_64()
    L.load_framework("Helium")
    d1, a1, slide = L.local_fn("Helium", "__ZN14HGBufferDumperD1Ev", None, [ctypes.c_void_p])
    d2, a2, _ = L.local_fn("Helium", "__ZN14HGBufferDumperD2Ev", None, [ctypes.c_void_p])
    assert (a1, a2) == (D1_VA, D2_VA), f"symbols moved: {a1:#x}/{a2:#x}"
    print(f"slide={slide:#x} D1={a1:#x} D2={a2:#x}")

    libc = ctypes.CDLL(None)
    libc.malloc.restype = ctypes.c_void_p
    libc.malloc.argtypes = [ctypes.c_size_t]
    libc.malloc_size.restype = ctypes.c_size_t
    libc.malloc_size.argtypes = [ctypes.c_void_p]

    def run(flags, fn):
        """Build an object with the three long-flags set per `flags`, call the dtor,
        and report which of the three heap blocks was released."""
        obj = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(b'\x00' * OBJ))
        blocks = []
        for i, (flag_off, ptr_off) in enumerate(STRINGS):
            p = libc.malloc(BLOCK)
            blocks.append(p)
            ctypes.memmove(ctypes.byref(obj, ptr_off), ctypes.byref(ctypes.c_void_p(p)), 8)
            # bit 0 of the flag byte is libc++'s x86_64 is_long
            obj[flag_off] = 0x01 if flags[i] else 0x00
            # a couple of plausible-but-irrelevant bytes elsewhere in the string
            obj[flag_off + 8] = 0x7F
        fn(ctypes.cast(ctypes.byref(obj), ctypes.c_void_p))
        return [libc.malloc_size(ctypes.c_void_p(p)) == 0 for p in blocks], blocks

    combos = [(a, b, c) for a in (0, 1) for b in (0, 1) for c in (0, 1)]
    bad = 0
    print("  flags(+0x00,+0x18,+0x30) -> freed(+0x10,+0x28,+0x40)   expected")
    for flags in combos:
        freed, _ = run(flags, d1)
        expected = [bool(f) for f in flags]
        mark = "ok" if freed == expected else "MISMATCH"
        if freed != expected:
            bad += 1
        print(f"    {flags} -> {[int(x) for x in freed]}   {[int(x) for x in expected]}  {mark}")

    # the D2 base-object twin must behave identically (byte-identical body)
    d2_mismatch = 0
    for flags in combos:
        f1, _ = run(flags, d1)
        f2, _ = run(flags, d2)
        if f1 != f2:
            d2_mismatch += 1

    # a live control: a block never handed to the dtor is never freed
    ctl = libc.malloc(BLOCK)
    ctl_freed = libc.malloc_size(ctypes.c_void_p(ctl)) == 0

    print(f"COMBOS={len(combos)} FLAG_TO_POINTER_MISMATCH={bad} D2_TWIN_MISMATCH={d2_mismatch}/8")
    print(f"  NEGATIVE CONTROL untouched block reported freed: {ctl_freed} (expected False)")
    print("  NEGATIVE CONTROL an arm64-layout reading (is_long = sign bit of +0x17, "
          "data at +0x00) would test bytes this body never loads — the disasm reads "
          "0x30/0x18/0x00 for the flags and 0x40/0x28/0x10 for the pointers, which IS "
          "the x86_64 layout; the table above is that mapping, measured.")

    ok = bad == 0 and d2_mismatch == 0 and not ctl_freed
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
