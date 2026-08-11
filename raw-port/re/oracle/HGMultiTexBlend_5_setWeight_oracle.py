#!/usr/bin/env python3
"""Differential oracle for HGMultiTexBlend<5>::setWeight(int, float) @Helium 0x110bc0.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/HGMultiTexBlend_5_setWeight_oracle.py

LOCAL symbol (`nm` type `t` — a template instantiation with internal linkage), so
dlsym cannot reach it: called at dyld slide + 0x110bc0 through ozone_loader.py,
which also refuses to run outside an x86_64 process.

The body is `movslq %esi,%rax ; movss %xmm0, 0x198(%rdi,%rax,4)` — one 4-byte
store, no bounds check, and a SIGN-extended index. So the oracle checks:
  1. the store lands at exactly 0x198 + index*4 and is exactly 4 bytes wide;
  2. the float is stored BIT-EXACTLY (NaN payloads and -0.0 included);
  3. NEGATIVE indices really do write BEFORE the array (the movslq is signed) —
     which is why the object here is placed in the middle of a large arena, so
     those writes stay inside the harness's own allocation;
  4. nothing else in the object changes.
"""
import ctypes, os, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN15HGMultiTexBlendILi5EE9setWeightEif"
VA = 0x110BC0
ARENA = 0x800          # the object sits at ARENA/2 so negative indices stay inside
OBJ_OFF = 0x400
WEIGHTS = 0x198
POISON = 0x3C


def cfloat(bits):
    """A c_float carrying EXACTLY these 32 bits.

    `ctypes.c_float(python_float)` goes through a C double, which QUIETS a
    signalling NaN (0x7f800001 arrives as 0x7fc00001). That is the harness
    mangling the input, not the callee mangling the output — it showed up as 10
    false divergences on a correct port until the bits were injected directly.
    """
    cf = ctypes.c_float()
    ctypes.memmove(ctypes.byref(cf), struct.pack('<I', bits), 4)
    return cf


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Helium", SYM, None,
                                 [ctypes.c_void_p, ctypes.c_int, ctypes.c_float])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    # bit patterns, not values: -0.0, both infinities, a quiet NaN with a payload,
    # a signalling NaN, plus ordinary weights
    values = [0x00000000, 0x80000000, 0x3F800000, 0xBF800000, 0x7F800000, 0xFF800000,
              0x7FC00000, 0x7FC0DEAD, 0x7F800001, 0x3DCCCCCD, 0x477FFF00, 0x00000001]
    indices = list(range(-2, 8))

    n = wrong_place = wrong_bits = collateral = 0
    fails = []
    for index in indices:
        for bits in values:
            arena = (ctypes.c_ubyte * ARENA).from_buffer(bytearray(bytes([POISON]) * ARENA))
            objp = ctypes.cast(ctypes.addressof(arena) + OBJ_OFF, ctypes.c_void_p)
            before = bytes(arena)
            fn(objp, index, cfloat(bits))
            after = bytes(arena)
            n += 1

            expect_at = OBJ_OFF + WEIGHTS + index * 4
            got = after[expect_at:expect_at + 4]
            if got != struct.pack('<I', bits):
                wrong_bits += 1
                if len(fails) < 6:
                    fails.append((index, hex(bits), got.hex()))
            # every byte outside those four must be untouched
            if before[:expect_at] != after[:expect_at] or \
               before[expect_at + 4:] != after[expect_at + 4:]:
                collateral += 1
                if len(fails) < 6:
                    diff = [i for i in range(ARENA)
                            if before[i] != after[i] and not (expect_at <= i < expect_at + 4)]
                    fails.append((index, "collateral at", [hex(d - OBJ_OFF) for d in diff[:4]]))

    print(f"CASES={n} WRONG_BITS_STORED={wrong_bits} COLLATERAL_WRITES={collateral}")
    for f in fails:
        print("  FAIL index=%s %s %s" % f)

    def ctl(name, offset_of):
        w = 0
        for index in indices:
            for bits in values:
                arena = (ctypes.c_ubyte * ARENA).from_buffer(bytearray(bytes([POISON]) * ARENA))
                objp = ctypes.cast(ctypes.addressof(arena) + OBJ_OFF, ctypes.c_void_p)
                fn(objp, index, cfloat(bits))
                at = OBJ_OFF + offset_of(index)
                if bytes(arena)[at:at + 4] != struct.pack('<I', bits):
                    w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{n} wrong")

    ctl("UNSIGNED index (movl instead of movslq) — negative indices would land high",
        lambda i: WEIGHTS + (i & 0xFFFFFFFF) * 4 if i >= 0 else WEIGHTS + 4 * ((i & 0xFFFFFFFF) % 64))
    ctl("8-byte stride (the +0x1c0 transform array's stride)", lambda i: WEIGHTS + i * 8)
    ctl("array based at +0x1c0 instead of +0x198", lambda i: 0x1C0 + i * 4)

    ok = wrong_bits == 0 and collateral == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
