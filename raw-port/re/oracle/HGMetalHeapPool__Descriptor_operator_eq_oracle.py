#!/usr/bin/env python3
"""Differential oracle for
`HGMetalHeapPool::Descriptor::operator==(Descriptor const&) const`
@Helium 0x171180 (__ZNK15HGMetalHeapPool10DescriptoreqERKS0_).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/HGMetalHeapPool__Descriptor_operator_eq_oracle.py

The body compares TWO fields of DIFFERENT WIDTHS:

    0x171184  movq (%rsi), %rax     ; 64-bit field at +0x0
    0x171187  cmpq (%rdi), %rax
    0x17118c  movl 0x8(%rsi), %eax  ; 32-bit field at +0x8   <-- movl, not movq
    0x17118f  cmpl 0x8(%rdi), %eax

so the whole risk in this unit is reading `movl` as a 64-bit compare. The fuzz
corpus is built to make that mistake impossible to miss: it includes pairs that
differ ONLY in bytes 0xc..0xf — the four bytes just above the 32-bit field. The
live function must call those pairs EQUAL. A port that compared a u64 at +0x8
would call them different, and that exact mutant is one of the negative
controls below.
"""
import ctypes
import os
import random
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402

FW = "Helium"
SYM = "__ZNK15HGMetalHeapPool10DescriptoreqERKS0_"
OBJ = 16   # the two fields observed: u64 @+0x0, u32 @+0x8 (+ 4 bytes padding)

#   0x171180  55              pushq %rbp
#   0x171181  48 89 e5        movq  %rsp, %rbp
#   0x171184  48 8b 06        movq  (%rsi), %rax
#   0x171187  48 3b 07        cmpq  (%rdi), %rax
#   0x17118a  75 0b           jne   0x171197
#   0x17118c  8b 46 08        movl  0x8(%rsi), %eax
#   0x17118f  3b 47 08        cmpl  0x8(%rdi), %eax
#   0x171192  0f 94 c0        sete  %al
#   0x171195  5d              popq  %rbp
#   0x171196  c3              retq
#   0x171197  31 c0           xorl  %eax, %eax
#   0x171199  5d              popq  %rbp
#   0x17119a  c3              retq
EXPECTED_BYTES = bytes.fromhex(
    "554889e5" "488b06" "483b07" "750b" "8b4608" "3b4708" "0f94c0" "5dc3"
    "31c0" "5dc3")


def make(size64, field32, pad32):
    return struct.pack("<QII", size64 & 0xFFFFFFFFFFFFFFFF,
                       field32 & 0xFFFFFFFF, pad32 & 0xFFFFFFFF)


def ts_model(a, b):
    """The TS port: u64 at +0x0 equal AND u32 at +0x8 equal."""
    a64, a32, _apad = struct.unpack("<QII", a)
    b64, b32, _bpad = struct.unpack("<QII", b)
    return 1 if (a64 == b64 and a32 == b32) else 0


MUTANTS = {
    "compares a u64 at +0x8 (reads movl as movq — includes the padding)":
        lambda a, b: 1 if a[0:8] == b[0:8] and a[8:16] == b[8:16] else 0,
    "compares only the u64 at +0x0":
        lambda a, b: 1 if a[0:8] == b[0:8] else 0,
    "compares only the u32 at +0x8":
        lambda a, b: 1 if a[8:12] == b[8:12] else 0,
    "compares all 16 bytes":
        lambda a, b: 1 if a == b else 0,
    "always equal": lambda a, b: 1,
    "always different": lambda a, b: 0,
}


def corpus(n=400):
    """Pairs chosen so every distinguishing case is represented, not just
    random 16-byte blobs (random pairs are almost never equal, which would
    make 'always different' look almost right)."""
    rng = random.Random(0x4D544C48)
    out = []
    interesting = [0, 1, 2, 0xFFFFFFFF, 0x100000000, 0x7FFFFFFFFFFFFFFF,
                   0xFFFFFFFFFFFFFFFF, 0x400000, 0x1000]
    for s in interesting:
        for f in (0, 1, 0xFFFFFFFF, 0x80000000):
            # identical, including padding
            out.append((make(s, f, 0xAAAAAAAA), make(s, f, 0xAAAAAAAA), "identical"))
            # THE DISCRIMINATOR: differ ONLY in the padding above the u32
            out.append((make(s, f, 0x11111111), make(s, f, 0xEEEEEEEE),
                        "differs only in +0xc padding -> must be EQUAL"))
            # differ in the u64 only
            out.append((make(s, f, 0), make(s ^ 1, f, 0), "differs in +0x0"))
            # differ in the u32 only
            out.append((make(s, f, 0), make(s, f ^ 1, 0), "differs in +0x8"))
            # differ in the u32's HIGH bits only (still within the 32 bits)
            out.append((make(s, f, 0), make(s, f ^ 0x80000000, 0),
                        "differs in +0x8 high bit"))
    while len(out) < n:
        a = make(rng.getrandbits(64), rng.getrandbits(32), rng.getrandbits(32))
        b = make(rng.getrandbits(64), rng.getrandbits(32), rng.getrandbits(32))
        out.append((a, b, "random"))
    return out


def main():
    require_x86_64()
    fn, addr, slide = local_fn(FW, SYM, ctypes.c_ubyte,
                               [ctypes.c_void_p, ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    lib = load_framework(FW)
    dl = ctypes.cast(getattr(lib, SYM[1:]), ctypes.c_void_p).value
    if dl != slide + addr:
        print(f"DLSYM CROSS-CHECK FAILED: dlsym=0x{dl:x} vs 0x{slide + addr:x}")
        return 1
    print(f"dlsym cross-check PASS: both routes give 0x{dl:x}")

    got = ctypes.string_at(slide + addr, len(EXPECTED_BYTES))
    if got != EXPECTED_BYTES:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_BYTES.hex()}"
              f"\n  got      {got.hex()}")
        return 1
    print(f"byte self-check PASS: {got.hex()}")
    print("  `48 8b 06`/`48 3b 07` = 64-bit load+cmp at +0x0; "
          "`8b 46 08`/`3b 47 08` = 32-BIT load+cmp at +0x8 (no REX.W)")

    cases = corpus()
    div = 0
    eq_count = 0
    pad_cases = 0
    for a, b, label in cases:
        ba = ctypes.create_string_buffer(a, OBJ)
        bb = ctypes.create_string_buffer(b, OBJ)
        before = (bytes(ba.raw), bytes(bb.raw))
        live = fn(ctypes.cast(ba, ctypes.c_void_p),
                  ctypes.cast(bb, ctypes.c_void_p))
        port = ts_model(a, b)
        eq_count += 1 if live else 0
        if "padding" in label:
            pad_cases += 1
            if not live:
                print(f"  PADDING CASE NOT EQUAL — the +0x8 compare is wider "
                      f"than 32 bits: {a.hex()} vs {b.hex()}")
                return 1
        if live != port:
            div += 1
            if div <= 5:
                print(f"  DIVERGED [{label}] a={a.hex()} b={b.hex()}: "
                      f"live={live} port={port}")
        if (bytes(ba.raw), bytes(bb.raw)) != before:
            print("  THE FUNCTION MUTATED ITS OPERANDS (it is `const`)")
            return 1

    print(f"live differential: {len(cases)} pairs, {div} divergences "
          f"({eq_count} reported equal, {len(cases) - eq_count} not equal — "
          f"both outcomes exercised)")
    print(f"  of which {pad_cases} pairs differ ONLY in the +0xc padding and "
          f"the live function called every one of them EQUAL")

    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0
    for name, mutant in MUTANTS.items():
        caught = 0
        for a, b, _l in cases:
            ba = ctypes.create_string_buffer(a, OBJ)
            bb = ctypes.create_string_buffer(b, OBJ)
            live = fn(ctypes.cast(ba, ctypes.c_void_p),
                      ctypes.cast(bb, ctypes.c_void_p))
            if live != mutant(a, b):
                caught += 1
        if caught == 0:
            dead += 1
        print(f"  {caught:3d}/{len(cases)} caught — {name}")

    ok = div == 0 and dead == 0 and 0 < eq_count < len(cases)
    print("RESULT:", "VERIFIED" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
