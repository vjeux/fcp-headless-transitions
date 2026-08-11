#!/usr/bin/env python3
"""Differential oracle for __HGStats_private::StatsProfile::pixels() const
@Helium 0x9e300.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGStats_private__StatsProfile_pixels_oracle.py

The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; it is called at
dyld slide + 0x9e300 through raw-port/re/oracle/ozone_loader.py, which resolves the
address from the cached inventory (never nm on the fat FCP binary) and refuses to run
outside an x86_64 process — the port cites x86_64 offsets and the arm64 slice would be
a different body.

Checks, against the live binary:
  1. the getter returns the FULL 64 bits at this+0x10 — the corpus is built to make a
     32-bit read, a signed read and a double read each answer differently;
  2. it reads +0x10 and nothing else — the rest of the object is filled with a
     distinct pattern, and the neighbouring accumulators at +0x08/+0x18/+0x20 (which
     operator+= @0x96e70 also maintains) are given different values so that reading
     the wrong slot is detectable;
  3. it is a pure read — no byte of the object changes.
"""
import ctypes, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZNK17__HGStats_private12StatsProfile6pixelsEv"
VA = 0x9E300
OBJ = 0x40
PIXELS_OFF = 0x10
U64 = (1 << 64) - 1


def port(pixels: int) -> int:
    # @0x9e304 movq 0x10(%rdi), %rax — the whole body.
    return pixels & U64


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Helium", SYM, ctypes.c_uint64, [ctypes.c_void_p])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x} (wrong slice?)"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    random.seed(20260811)
    values = [
        0, 1, 2,
        0x7FFFFFFF, 0x80000000, 0xFFFFFFFF,          # 32-bit boundaries
        0x1_00000000, 0x1_00000001,                  # low 32 bits repeat a small value
        (1 << 53), (1 << 53) + 1,                    # the JS number precision cliff
        (1 << 63), (1 << 63) - 1, U64,               # sign bit / all ones
        0xDEADBEEF_CAFEF00D, 0x0000FFFF_FFFF0000,
        0x3FF0000000000000,                          # 1.0 as a double bit pattern
    ]
    values += [random.getrandbits(64) for _ in range(400)]

    n = bad = mutated = 0
    fails = []
    for v in values:
        buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(b'\x3C' * OBJ))
        # neighbouring fields get DIFFERENT values so a wrong-slot read is visible:
        # +0x00 vptr, +0x08 double time, +0x18 and +0x20 the other two accumulators
        # (all four are maintained together by operator+= @0x96e70).
        for off, other in ((0x00, 0x1111111111111111), (0x08, 0x2222222222222222),
                           (PIXELS_OFF, v), (0x18, 0x3333333333333333),
                           (0x20, 0x4444444444444444)):
            ctypes.memmove(ctypes.byref(buf, off), ctypes.byref(ctypes.c_uint64(other)), 8)
        before = bytes(buf)
        got = fn(ctypes.cast(ctypes.byref(buf), ctypes.c_void_p))
        if bytes(buf) != before:
            mutated += 1
        exp = port(v)
        n += 1
        if got != exp:
            bad += 1
            if len(fails) < 8:
                fails.append((hex(v), hex(got), hex(exp)))

    print(f"CASES={n} DIVERGED={bad} OBJECT_MUTATED={mutated}")
    for f in fails:
        print("  FAIL pixels=%s real=%s port=%s" % f)

    def ctl(name, f):
        w = 0
        for v in values:
            buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(b'\x3C' * OBJ))
            for off, other in ((0x00, 0x1111111111111111), (0x08, 0x2222222222222222),
                               (PIXELS_OFF, v), (0x18, 0x3333333333333333),
                               (0x20, 0x4444444444444444)):
                ctypes.memmove(ctypes.byref(buf, off), ctypes.byref(ctypes.c_uint64(other)), 8)
            if f(v) != fn(ctypes.cast(ctypes.byref(buf), ctypes.c_void_p)):
                w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{n} wrong")

    ctl("32-bit read (movl instead of movq)", lambda v: v & 0xFFFFFFFF)
    ctl("reads the +0x18 accumulator", lambda v: 0x3333333333333333)
    ctl("reads the +0x08 time slot", lambda v: 0x2222222222222222)
    ctl("truncates through a JS double (Number(v) round-trip)",
        lambda v: int(float(v)) & U64)

    ok = bad == 0 and mutated == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
