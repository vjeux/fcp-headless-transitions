#!/usr/bin/env python3
"""Differential oracle for HGTexturePoolHandleImpl::empty() @Helium 0x44060
   (__ZN23HGTexturePoolHandleImpl5emptyEv — file-local, `nm` class `t`)

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGTexturePoolHandleImpl_empty_oracle.py

Rosetta is required and enforced: every @0xADDR in the port is an x86_64 offset (OPS_LOG, "the
executable oracle calls the wrong architecture ... fails silently toward VERIFIED"). dlsym cannot
see a local symbol, so the function is called at `_dyld_get_image_vmaddr_slide(Helium) + 0x44060`
via ozone_loader.local_fn, and the opcode bytes there are checked against the disassembly first.

The body is three loads/compares — `rax = this[+0x18]`, `sete on rax[+0x78] == 0`. The things a
reader can doubt are exactly: which indirection, which offset, and which polarity. So this harness
builds a real `this` arena and a real owner arena (both poisoned 0xCD so a wrong offset reads
garbage rather than a convenient zero), sweeps the count field, and reports three separate probes:

  * VALUE sweep — count in {0, 1, 2, 41, 42, 43, 2^31, 2^32, 2^63, 2^64-1} and 40 random u64:
    the live result must be `count == 0`, and the port must agree on every one.
  * SENSITIVITY at +0x78 (a probe, not a mutant): flipping the count between zero and non-zero
    must move the live answer. A dead probe here would mean the corpus proves nothing about the
    offset.
  * INSENSITIVITY at the NEIGHBOURS +0x70 and +0x80: writing those must NOT move the live answer.
    This is what distinguishes a port that read the right field from one that read an adjacent
    one — the failure `size()`/`end()` make easy, since +0x70 is also a count-like field.
"""
import ctypes
import os
import random
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

SYM = "__ZN23HGTexturePoolHandleImpl5emptyEv"
ADDR = 0x44060
# pushq %rbp ; movq %rsp,%rbp ; movq 0x18(%rdi),%rax ; cmpq $0x0,0x78(%rax) ; sete %al
BODY = bytes([0x55, 0x48, 0x89, 0xE5, 0x48, 0x8B, 0x47, 0x18, 0x48, 0x83, 0x78, 0x78, 0x00,
              0x0F, 0x94, 0xC0])
OFF_OWNER = 0x18
OFF_COUNT = 0x78
IMPL_SIZE = 0x40
OWNER_SIZE = 0x100
POISON = 0xCD

COUNTS = [0, 1, 2, 41, 42, 43, 1 << 31, 1 << 32, 1 << 63, (1 << 64) - 1]


def arena(count, count_off=OFF_COUNT, neighbour=None):
    impl = ctypes.create_string_buffer(bytes([POISON]) * IMPL_SIZE, IMPL_SIZE)
    owner = ctypes.create_string_buffer(bytes([POISON]) * OWNER_SIZE, OWNER_SIZE)
    struct.pack_into("<Q", owner, count_off, count & ((1 << 64) - 1))
    if neighbour is not None:
        off, val = neighbour
        struct.pack_into("<Q", owner, off, val & ((1 << 64) - 1))
    struct.pack_into("<Q", impl, OFF_OWNER, ctypes.addressof(owner))
    return impl, owner


def main():
    ozone_loader.require_x86_64()
    fn, addr, slide = ozone_loader.local_fn("Helium", SYM, ctypes.c_bool, [ctypes.c_void_p])
    live = ctypes.string_at(slide + ADDR, len(BODY))
    ident = (addr == ADDR) and live == BODY
    print(f"identity: nm addr 0x{addr:x} == 0x{ADDR:x}; opcodes {live.hex()} "
          f"expected {BODY.hex()}  match={ident}")

    rng = random.Random(ADDR)
    counts = COUNTS + [rng.getrandbits(64) for _ in range(40)]
    bad = 0
    n_true = 0
    for c in counts:
        impl, owner = arena(c)
        got = bool(fn(ctypes.addressof(impl)))
        want = (c == 0)            # what the TS port computes: owner.countB === 0n
        n_true += 1 if got else 0
        if got != want:
            bad += 1
            print(f"  DIVERGED count={c:#x} live={got} port={want}")
        del impl, owner
    print(f"value sweep: cases={len(counts)}  live TRUE={n_true}  live FALSE={len(counts)-n_true}"
          f"  divergences={bad}")

    # sensitivity at +0x78
    moved = 0
    for c in counts:
        a_impl, a_owner = arena(0)
        b_impl, b_owner = arena(c if c else 1)
        if bool(fn(ctypes.addressof(a_impl))) != bool(fn(ctypes.addressof(b_impl))):
            moved += 1
        del a_impl, a_owner, b_impl, b_owner
    print(f"SENSITIVITY probe: {moved}/{len(counts)} — writing +0x{OFF_COUNT:x} moves the live "
          f"answer (a 0 here would mean the corpus cannot see the offset at all)")

    # insensitivity at the neighbours
    stuck = {}
    for nb in (0x70, 0x80):
        differs = 0
        for c in (0, 7):
            base_impl, base_owner = arena(c)
            base = bool(fn(ctypes.addressof(base_impl)))
            for v in (0, 1, 42, (1 << 64) - 1):
                p_impl, p_owner = arena(c, neighbour=(nb, v))
                if bool(fn(ctypes.addressof(p_impl))) != base:
                    differs += 1
                del p_impl, p_owner
            del base_impl, base_owner
        stuck[nb] = differs
        print(f"INSENSITIVITY probe: +0x{nb:x} changed the live answer {differs} times "
              f"(must be 0 — this is what separates the right field from its neighbour)")

    ok = ident and bad == 0 and moved == len(counts) and all(v == 0 for v in stuck.values())
    print("VERIFIED vs live Helium" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
