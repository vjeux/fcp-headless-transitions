#!/usr/bin/env python3
"""DepthBufferManager::hasDepthBuffer() @Helium 0xe0090 — differential against the LIVE binary.

    arch -x86_64 /usr/bin/python3 DepthBufferManager_hasDepthBuffer_oracle.py

WHY ROSETTA: the port is transcribed from the x86_64 slice (every @0xADDR in
`raw-port/src/render/DepthBufferManager.ts` is an x86_64 offset and `disasm.sh` thins to that
slice), while this box is arm64. Calling the arm64 image would compare the port against code it did
not transcribe — OPS_LOG's "the executable oracle calls the wrong architecture, and fails toward
ACCEPT". `ozone_loader` refuses to run unless the process really is x86_64.

WHAT IS BEING PROVEN. The body is
    rax = *(this+0x10) ; cmpq *(this+0x18), rax ; setne al
so there are exactly three claims, and each gets its own measurement:
  (1) the RELATION is `!=`, not `==`;
  (2) the OFFSETS are +0x10 and +0x18, not any of their neighbours;
  (3) the function READS ONLY — it stores nothing anywhere in the object.
A test that only fed it an empty and a non-empty vector would establish none of them.

SELF-CHECK FIRST. dlsym must land on `slide + 0xe0090` and the bytes there must be the prologue of
the body that was transcribed. Without that, a passing number means nothing (OPS_LOG: take the
vmaddr from the cached x86_64 inventory, then verify the opcode bytes before trusting a result).
"""
import ctypes
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

FW = "Helium"
VMADDR = 0xE0090
SYM = "_ZN18DepthBufferManager14hasDepthBufferEv"   # dlsym wants it WITHOUT the leading underscore
# 55 48 89 e5 48 8b 47 10 = pushq %rbp ; movq %rsp,%rbp ; movq 0x10(%rdi),%rax
PROLOGUE = bytes.fromhex("554889e5488b4710")

ARENA = 0x40          # bytes of fake object, comfortably past every slot the class uses
POISON = 0xEE

OFF_BEGIN = 0x10
OFF_END = 0x18
# neighbours that must NOT affect the answer: vptr, the HGRenderer*, __end_cap_, and past the end
OTHER_OFFSETS = (0x00, 0x08, 0x20, 0x28, 0x30)

VALUES = [
    0x0000000000000000,
    0x0000000000000001,
    0x0000000000000008,
    0x00000000FFFFFFFF,
    0x0000000100000000,
    0x00007FFFFFFFFFF8,
    0x8000000000000000,
    0xFFFFFFFFFFFFFFF8,
]


def main() -> int:
    lib = ozone_loader.load_framework(FW)
    slide = ozone_loader.image_slide(FW)
    if isinstance(slide, tuple):          # image_slide returns (slide, image_name)
        slide = slide[0]

    addr = ctypes.cast(getattr(lib, SYM), ctypes.c_void_p).value
    got = ctypes.string_at(slide + VMADDR, len(PROLOGUE))
    print(f"arch            : {os.uname().machine}")
    print(f"image slide     : {hex(slide)}")
    print(f"dlsym({SYM[:34]}…) : {hex(addr)}")
    print(f"slide + 0x{VMADDR:x}  : {hex(slide + VMADDR)}")
    print(f"prologue bytes  : {got.hex()}  expected {PROLOGUE.hex()}")
    if addr != slide + VMADDR or got != PROLOGUE:
        print("SELF-CHECK FAILED — refusing to report any number")
        return 2
    print("SELF-CHECK PASS\n")

    fn = ctypes.CFUNCTYPE(ctypes.c_bool, ctypes.c_void_p)(addr)

    def call(begin, end, others=None):
        """Build a poisoned object, set the two slots (plus any neighbours), call, and return
        (result, whether any byte of the arena changed)."""
        buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)  # explicit size: no NUL
        base = ctypes.addressof(buf)
        ctypes.memmove(base + OFF_BEGIN, begin.to_bytes(8, "little"), 8)
        ctypes.memmove(base + OFF_END, end.to_bytes(8, "little"), 8)
        for off, val in (others or {}).items():
            ctypes.memmove(base + off, val.to_bytes(8, "little"), 8)
        before = bytes(buf)
        res = fn(base)
        after = bytes(buf)
        return bool(res), (before != after)

    # ── (1) the relation, over every ordered pair ───────────────────────────────────────────────
    n = wrong = mutated = 0
    for b in VALUES:
        for e in VALUES:
            res, changed = call(b, e)
            n += 1
            if res != (b != e):
                wrong += 1
                print(f"  DIVERGED begin={b:#018x} end={e:#018x} live={res} model={(b != e)}")
            if changed:
                mutated += 1
                print(f"  MUTATED the arena on begin={b:#018x} end={e:#018x}")
    print(f"(1) relation      : {n - wrong}/{n} agree with `begin != end`")
    print(f"(3) read-only     : {n - mutated}/{n} calls left the poisoned arena byte-identical")

    # ── (2) the offsets: the neighbours must be irrelevant ──────────────────────────────────────
    off_n = off_wrong = 0
    for b, e in ((0, 0), (0, 8), (8, 8), (0x1234, 0x1234), (0x1234, 0x5678)):
        for off in OTHER_OFFSETS:
            for val in (0, 1, 0xFFFFFFFFFFFFFFF8):
                res, _ = call(b, e, {off: val})
                off_n += 1
                if res != (b != e):
                    off_wrong += 1
                    print(f"  OFFSET LEAK begin={b:#x} end={e:#x} +{off:#x}={val:#x} -> {res}")
    print(f"(2) offsets       : {off_n - off_wrong}/{off_n} unaffected by "
          f"+0x00/+0x08/+0x20/+0x28/+0x30")

    # ── negative controls: a wrong model must be CAUGHT by this corpus ──────────────────────────
    # A control that scores 0 means the harness is blind OR the mutant is equivalent; both are
    # reported as such rather than counted as a pass (OPS_LOG).
    controls = {
        "M1 `==` instead of `!=`": lambda b, e: b == e,
        "M2 non-empty means begin != 0": lambda b, e: b != 0,
        "M3 non-empty means end != 0": lambda b, e: e != 0,
        "M4 always true": lambda b, e: True,
        "M5 always false": lambda b, e: False,
    }
    print()
    for name, model in controls.items():
        killed = 0
        for b in VALUES:
            for e in VALUES:
                if model(b, e) != (b != e):
                    killed += 1
        verdict = "KILLED" if killed else "EQUIVALENT-OR-BLIND (investigate)"
        print(f"  control {name:34s} {verdict} on {killed}/{n} cases")

    ok = wrong == 0 and mutated == 0 and off_wrong == 0
    print("\nVERDICT:", "VERIFIED — the live symbol is `*(this+0x10) != *(this+0x18)`, read-only"
          if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
