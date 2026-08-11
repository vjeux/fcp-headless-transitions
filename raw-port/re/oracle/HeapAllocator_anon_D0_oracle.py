#!/usr/bin/env python3
"""Differential oracle for (anonymous namespace)::HeapAllocator::~HeapAllocator() [D0]
@Helium 0x171db0, plus the D1 @0x171da0 it is documented against.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HeapAllocator_anon_D0_oracle.py

Both symbols are LOCAL (`nm` type `t`) — anonymous-namespace internal linkage — so
dlsym cannot reach them; they are called at dyld slide + their x86_64 vmaddr through
raw-port/re/oracle/ozone_loader.py (which refuses to run outside an x86_64 process and
resolves addresses with `nm -n -arch x86_64`, closing both halves of the OPS_LOG
architecture trap).

Two claims of the port are checked against the live code:
  1. D1 IS TRIVIAL. Called on a poisoned heap block, it must not modify a single byte
     — that is what licenses the port's "no member teardown happens here".
  2. D0 FREES THE OBJECT. `jmp __ZdlPv` is a tail call to operator delete(void*), so
     after D0 the block is back on the heap. The signal used is `malloc_size(p) == 0`,
     which is 64/64 after D0 and False for a live block (see the negative control).
     Address reuse by the next same-size malloc is ALSO measured but is deliberately
     NOT a pass criterion: it is RUN-DEPENDENT — the same unmodified harness measured
     0/64 on one run and 64/64 on the next, because whether the block comes straight
     back off the free list depends on the allocator's state, not on the port. Had it
     been wired into the verdict it would have produced a false DIVERGED on correct
     code half the time. It is printed for information only.
No double-free is ever performed: each block is handed to exactly one D0 call.

DEPENDENCY: raw-port/re/oracle/ozone_loader.py, which is added by the
OZLightingFolder_Factory PR (#415) and is deliberately NOT duplicated here.
"""
import ctypes, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

D0_VA = 0x171DB0
D1_VA = 0x171DA0
SIZE = 0x30           # the block size used for the reuse probe (any small size works)
POISON = 0xA5


def main():
    L.require_x86_64()
    L.load_framework("Helium")
    slide, image = L.image_slide("Helium")
    print(f"image={image}\nslide={slide:#x}")

    d0, d0_addr, _ = L.local_fn("Helium", "__ZN12_GLOBAL__N_113HeapAllocatorD0Ev",
                                None, [ctypes.c_void_p])
    d1, d1_addr, _ = L.local_fn("Helium", "__ZN12_GLOBAL__N_113HeapAllocatorD1Ev",
                                None, [ctypes.c_void_p])
    assert (d0_addr, d1_addr) == (D0_VA, D1_VA), \
        f"symbols moved: {d0_addr:#x}/{d1_addr:#x} (wrong slice?)"

    libc = ctypes.CDLL(None)
    libc.malloc.restype = ctypes.c_void_p
    libc.malloc.argtypes = [ctypes.c_size_t]
    libc.malloc_size.restype = ctypes.c_size_t
    libc.malloc_size.argtypes = [ctypes.c_void_p]

    # ---- 1. D1 must not touch the object ----------------------------------
    d1_mutations = 0
    trials = 64
    blocks = []
    for _ in range(trials):
        p = libc.malloc(SIZE)
        ctypes.memset(p, POISON, SIZE)
        before = ctypes.string_at(p, SIZE)
        d1(ctypes.c_void_p(p))
        if ctypes.string_at(p, SIZE) != before:
            d1_mutations += 1
        blocks.append(p)

    # ---- 2. D0 must free the object ---------------------------------------
    freed_by_malloc_size = 0
    reused = 0
    for p in blocks:
        ctypes.memset(p, POISON, SIZE)
        d0(ctypes.c_void_p(p))                    # tail-calls operator delete(p)
        if libc.malloc_size(ctypes.c_void_p(p)) == 0:
            freed_by_malloc_size += 1
        q = libc.malloc(SIZE)                     # LIFO free list -> same address
        if q == p:
            reused += 1

    print(f"TRIALS={trials} D1_MUTATED_OBJECT={d1_mutations} "
          f"D0_FREED_malloc_size={freed_by_malloc_size}/{trials} "
          f"D0_FREED_address_reused={reused}/{trials} (informational only, RUN-DEPENDENT: "
          f"measured 0, 12, 57 and 64 of 64 across four runs of this same harness "
          f"— see the module docstring)")

    # negative control: a block that is NOT passed to D0 shows neither signal.
    ctl = libc.malloc(SIZE)
    ctl_size_zero = libc.malloc_size(ctypes.c_void_p(ctl)) == 0
    ctl_reused = libc.malloc(SIZE) == ctl
    print(f"  NEGATIVE CONTROL live (never-freed) block: malloc_size==0 -> {ctl_size_zero} "
          f"(expected False), address reused -> {ctl_reused} (expected False)")

    ok = (d1_mutations == 0 and freed_by_malloc_size == trials
          and not ctl_size_zero and not ctl_reused)
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
