#!/usr/bin/env python3
"""Differential oracle for HGBMDFilmGen5LinearizationLUTInfo::~...() [D0]
@Helium 0x115ac0, and the D1 @0x115ab0 it is documented against.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/HGBMDFilmGen5LinearizationLUTInfo_D0_oracle.py

Both symbols are LOCAL (`nm` type `t`), so dlsym cannot reach them: called at
dyld slide + their x86_64 vmaddrs through ozone_loader.py, which refuses to run
outside an x86_64 process.

Two claims of the port are checked against the live code:
  1. D1 IS TRIVIAL — called on a poisoned heap block it must not modify a byte,
     which is what licenses "D0 is only a free";
  2. D0 FREES THE OBJECT — `jmp __ZdlPv` is a tail call to operator delete, so
     `malloc_size(p)` must read 0 afterwards, while a live block that was never
     passed to D0 still reports non-zero.
Allocator ADDRESS REUSE is deliberately NOT part of the verdict: it is
run-dependent (OPS_LOG). No double-free: one D0 call per block.
"""
import ctypes, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

D0_VA = 0x115AC0
D1_VA = 0x115AB0
SIZE = 0x40
POISON = 0xA5


def main():
    L.require_x86_64()
    d0, a0, slide = L.local_fn("Helium", "__ZN33HGBMDFilmGen5LinearizationLUTInfoD0Ev",
                               None, [ctypes.c_void_p])
    d1, a1, _ = L.local_fn("Helium", "__ZN33HGBMDFilmGen5LinearizationLUTInfoD1Ev",
                           None, [ctypes.c_void_p])
    assert (a0, a1) == (D0_VA, D1_VA), f"symbols moved: {a0:#x}/{a1:#x}"
    print(f"slide={slide:#x} D0={a0:#x} D1={a1:#x}")

    libc = ctypes.CDLL(None)
    libc.malloc.restype = ctypes.c_void_p
    libc.malloc.argtypes = [ctypes.c_size_t]
    libc.malloc_size.restype = ctypes.c_size_t
    libc.malloc_size.argtypes = [ctypes.c_void_p]

    trials = 64
    d1_mutations = 0
    blocks = []
    for _ in range(trials):
        p = libc.malloc(SIZE)
        ctypes.memset(p, POISON, SIZE)
        before = ctypes.string_at(p, SIZE)
        d1(ctypes.c_void_p(p))
        if ctypes.string_at(p, SIZE) != before:
            d1_mutations += 1
        blocks.append(p)

    freed = 0
    for p in blocks:
        d0(ctypes.c_void_p(p))
        if libc.malloc_size(ctypes.c_void_p(p)) == 0:
            freed += 1

    ctl = libc.malloc(SIZE)
    ctl_freed = libc.malloc_size(ctypes.c_void_p(ctl)) == 0

    print(f"TRIALS={trials} D1_MUTATED_OBJECT={d1_mutations} D0_FREED={freed}/{trials}")
    print(f"  NEGATIVE CONTROL live (never-freed) block reports freed: {ctl_freed} "
          f"(expected False)")

    ok = d1_mutations == 0 and freed == trials and not ctl_freed
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
