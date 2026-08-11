#!/usr/bin/env python3
"""Differential for PCSerializerReadStream::currentElement() const @ProCore 0x2647a against the
LIVE Final Cut Pro binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/PCSerializerReadStream_currentElement_oracle.py

The method is an inlined `std::deque<PCStreamElement*>::back()` with an empty-check, so it has no
scalar inputs — its whole input is the SHAPE OF A MEMORY STRUCTURE. It is oracled the way OPS_LOG
prescribes for that case: build the structure in `ctypes` memory ourselves, POISON everything the
method is not supposed to read or write, call the real function, and compare both the returned
pointer AND the arena's bytes afterwards.

Each case is then replayed through the REAL TypeScript port (node --experimental-strip-types
imports the `.ts` directly), with each block slot carrying a distinct sentinel object whose `addr`
is the pointer value written into the corresponding C block, so "the port picked the same element"
is a value comparison and not a shape comparison.

The corpus targets the arithmetic the port could get wrong, not just the happy path:
  * empty deque (`__size_ == 0`) — the separate `xorl %eax,%eax` return path
  * `__start_ == 0` and every interesting `__start_` around a block boundary (511, 512, 513)
  * sizes that keep the last element in block 0, land it exactly on a boundary, or push it into
    block 1, 2, 3 — i.e. every carry of `(__size_ + __start_ - 1) >> 9`
  * the last slot of a block (`slot == 511`) and the first of the next (`slot == 0`)
  * a NULL stored in the winning slot, so "returns null" cannot be confused with "was empty"
  * `__size_` and `__start_` both large enough that a 32-bit truncation of the shift would show

A poisoned-arena byte diff runs after every call: the method is `const` and must write nothing.
"""
import ctypes
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "ProCore"
SYM = "__ZNK22PCSerializerReadStream14currentElementEv"
ADDR = 0x2647A
BLOCK = 512                      # libc++ pointers-per-block for an 8-byte element
POISON = 0xCD

oz.require_x86_64()
oz.load_framework(FW)
slide, _img = oz.image_slide(FW)
vmaddr = oz.nm_addr(FW, SYM)
fn = ctypes.CFUNCTYPE(ctypes.c_void_p, ctypes.c_void_p)(slide + vmaddr)
print(f"{FW} slide=0x{slide:x}  {SYM} vmaddr=0x{vmaddr:x}")

fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


check("address", vmaddr == ADDR, f"0x{vmaddr:x} == the port's @0x{ADDR:x}")

# ── IDENTITY: the bytes at the entry point are the function that was transcribed ────────────────
body = ctypes.string_at(slide + vmaddr, 0x34)
print("  first 12 bytes: " + " ".join(f"{b:02x}" for b in body[:12]))
check("opcode @0x2647a", body[0:4] == b"\x48\x8b\x47\x30",
      "48 8b 47 30 — movq 0x30(%rdi), %rax (the __size_ load)")
check("opcode @0x2647e", body[4:7] == b"\x48\x85\xc0", "48 85 c0 — testq %rax, %rax")
check("opcode @0x26481", body[7] == 0x74 and 0x26481 + 2 + body[8] == 0x264AB,
      f"74 {body[8]:02x} — je 0x{0x26481 + 2 + body[8]:x}, the empty-deque return")
check("opcode @0x26498", body[0x26498 - ADDR:0x26498 - ADDR + 4] == b"\x48\xc1\xea\x09",
      "48 c1 ea 09 — shrq $0x9, %rdx (block = idx / 512)")
check("opcode @0x264a0", body[0x264A0 - ADDR:0x264A0 - ADDR + 5] == b"\x25\xff\x01\x00\x00",
      "25 ff 01 00 00 — andl $0x1ff, %eax (slot = idx % 512)")
check("opcode @0x264ab", body[0x264AB - ADDR:0x264AB - ADDR + 3] == b"\x31\xc0\xc3",
      "31 c0 c3 — xorl %eax,%eax; retq (the empty path is its own exit)")
shifted = ctypes.string_at(slide + vmaddr + 1, 0x10)
check("the opcode checks can fail", shifted[0:4] != b"\x48\x8b\x47\x30",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")


def make_case(start, size, null_at=None):
    """A `this` arena plus JUST the one block the method can reach, poisoned everywhere else.

    Only ONE entry of `__map_.__begin_` is ever loaded (`map[idx >> 9]`), so instead of
    materialising a map array with millions of entries we allocate a single block pointer and set
    the map BASE to `&that_pointer - block*8`, which puts our one real entry exactly where the
    method will look. That is what makes the >2^32 cases below affordable: a real map for physical
    index 2^32 would be 64 MB of pointers, and the machine would read 8 bytes of it.

    Everything else is poison: the rest of the object, and the map base itself on the empty case
    (where the method must load nothing at all — if it did, it would fault, which is a stronger
    statement than any comparison).
    """
    keep = []
    if size == 0:
        map_base = 0xDEAD0000              # never dereferenced if the empty path is correct
        slots = {}
    else:
        idx = size + start - 1
        block, slot = idx // BLOCK, idx % BLOCK
        blk = (ctypes.c_uint64 * BLOCK)()
        slots = {}
        for i in range(BLOCK):
            phys = block * BLOCK + i
            val = 0 if null_at == phys else (0x5EED_0000 + phys)
            blk[i] = val
            slots[phys] = val
        one = (ctypes.c_uint64 * 1)()
        one[0] = ctypes.cast(blk, ctypes.c_void_p).value
        keep = [blk, one]
        map_base = ctypes.addressof(one) - block * 8
        assert slots[idx] == blk[slot]
    this = (ctypes.c_char * 0x40)(*([POISON] * 0x40))            # poison the WHOLE object first
    u64 = ctypes.cast(this, ctypes.POINTER(ctypes.c_uint64))
    u64[0x10 // 8] = map_base                                    # +0x10 __map_.__begin_
    u64[0x28 // 8] = start                                       # +0x28 __start_
    u64[0x30 // 8] = size                                        # +0x30 __size_
    return this, keep, slots


CASES = [
    # (start, size, null_at)                                        what it exercises
    (0, 0, None),                     # empty — the xorl path, and it must load NO map entry
    (7, 0, None),                     # empty with a non-zero __start_
    (0, 1, None),                     # block 0 slot 0
    (0, 2, None),
    (0, 512, None),                   # last element is slot 511 of block 0
    (0, 513, None),                   # ...and one past it: block 1 slot 0
    (1, 511, None),                   # start!=0, exactly on the boundary
    (1, 512, None),                   # start!=0, carries into block 1
    (511, 1, None),                   # last slot of block 0
    (511, 2, None),                   # first slot of block 1
    (512, 1, None),                   # __start_ is a whole block
    (513, 1000, None),                # deep into block 2
    (5, 2000, None),                  # block 3
    (0, 1, 0),                        # a NULL in the winning slot (not the same as "empty")
    (511, 2, 512),                    # NULL at block 1 slot 0, the winner
    (1 << 12, 1 << 12, None),         # past 2^12
    # PAST 2^32, where a 32-bit `>>>`/`&` transcription stops agreeing with `shrq`/`andl`. The
    # first is the exact boundary (idx == 2^32 -> uint32 wraps to 0), the others land in
    # different blocks and slots than the truncated form would pick.
    (1 << 32, 1, None),
    ((1 << 32) + 511, 1, None),
    ((1 << 32) + 512, 3, None),
    ((1 << 33) + 12345, 7, None),
]

live_results = []
for start, size, null_at in CASES:
    this, keep, slots = make_case(start, size, null_at)
    before = bytes(this)
    got = fn(ctypes.byref(this)) or 0
    after = bytes(this)
    idx = size + start - 1
    want = 0 if size == 0 else slots[idx]
    ok = got == want
    live_results.append({"start": start, "size": size, "got": got, "want": want})
    if not ok:
        check(f"live start={start} size={size}", False,
              f"returned 0x{got:x}, the structure holds 0x{want:x} at physical index {idx}")
    if before != after:
        diff = [i for i in range(len(before)) if before[i] != after[i]]
        check(f"const-ness start={start} size={size}", False,
              f"the object was MODIFIED at offsets {diff} by a const method")
    keep  # keep the blocks alive until after the call

check("live behaviour", not fails,
      f"{len(CASES)} shapes: the live function returned the element the structure holds in every "
      "one, and the poisoned arena was byte-identical afterwards (it is const)")

# ── the SAME shapes through the REAL port ───────────────────────────────────────────────────────
drv = os.path.join(HERE, "PCSerializerReadStream_currentElement_driver.mts")
payload = json.dumps([{"start": s, "size": z, "nullAt": na, "block": BLOCK}
                      for (s, z, na) in CASES])
r = subprocess.run(["node", "--experimental-strip-types", drv], input=payload,
                   capture_output=True, text=True)
try:
    ts = json.loads(r.stdout.strip().splitlines()[-1])
except Exception:
    ts = None
    check("the port ran", False, f"driver produced no JSON: {(r.stdout + r.stderr)[-400:]}")

if ts is not None:
    check("the port ran", len(ts) == len(CASES), f"{len(ts)} results for {len(CASES)} shapes")
    diverged = []
    for (case, live, port) in zip(CASES, live_results, ts):
        if live["got"] != port:
            diverged.append(f"start={case[0]} size={case[1]}: live 0x{live['got']:x} vs port "
                            f"{('0x%x' % port) if port else 'null'}")
    check("TS == live, every shape", not diverged,
          f"{len(CASES)}/{len(CASES)} agree on the returned element"
          if not diverged else "; ".join(diverged[:4]))

    # NEGATIVE CONTROL on the comparison itself: three plausible mis-transcriptions must be caught.
    mut = subprocess.run(["node", "--experimental-strip-types", drv, "--mutants"], input=payload,
                         capture_output=True, text=True)
    try:
        muts = json.loads(mut.stdout.strip().splitlines()[-1])
    except Exception:
        muts = {}
        check("mutants ran", False, f"{(mut.stdout + mut.stderr)[-300:]}")
    for name, res in muts.items():
        caught = any(live["got"] != v for live, v in zip(live_results, res))
        check(f"mutant '{name}' is caught", caught,
              "this corpus separates the mutant from the port"
              if caught else "the corpus CANNOT tell this mutant from the real thing")

print()
print("PCSerializerReadStream::currentElement() @ProCore 0x2647a — "
      + (f"VERIFIED ({len(CASES)} structural shapes, 0 divergences, const-ness byte-checked)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
