#!/usr/bin/env python3
"""Static differential for (anonymous namespace)::HeapPoolFixedAllocationPolicy<0, 2097152>::~…()
[D0] @Helium 0x1a8710, against the LIVE Final Cut Pro binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HeapPoolFixedAllocationPolicy_0_2097152_D0_oracle.py

WHAT THIS DOES NOT DO, first, because the limit is the interesting part: **it does not CALL the
function.** A deleting destructor's whole body is `jmp operator delete`, so calling it hands a
pointer to the process allocator. A harness-owned `ctypes` buffer is not a `malloc_zone` allocation,
so the honest outcomes are a crash or silent heap corruption inside the FCP frameworks this same
process has loaded — and a differential that corrupts the heap it is measuring can report anything
afterwards. There is no version of "call it and see" that is evidence here.

Everything else about the unit IS checkable from the loaded image, and all of it is checked:

  1. IDENTITY — the four instruction bytes at 0x1a8710 are re-derived from the mapped image and
     compared against the transcription, with a one-byte-off negative control.
  2. IT IS A TAIL JUMP, NOT A CALL — the frame is torn down (`popq %rbp`) BEFORE an `e9` jmp, so
     `operator delete` returns to D0's caller. The port's comment says exactly that.
  3. THE TARGET IS THE `operator delete` STUB — the rel32 is resolved and must land on Helium's
     `__ZdlPv` stub at 0x3c4fa0, and that stub is then decoded as an indirect jump through the
     lazy-binding pointer table (`ff 25`), which is what a symbol stub is. So "the only callee is
     the C++ runtime's deallocation function" is read off the machine rather than off the `##`
     comment otool printed.
  4. THERE IS NOTHING TO TEAR DOWN — the sibling D1 @0x1a8700, quoted in the port as the evidence
     that D0 runs no member teardown, is itself byte-checked as the trivial
     `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq`. That claim is load-bearing (it is why the port's
     body is empty rather than a call into D1), so it is verified rather than asserted.
  5. NO OTHER CALLEE — no byte at any transcribed instruction boundary is a call or an indirect
     branch, decoded at the boundaries rather than scanned for (a byte scan for 0xe8 finds
     displacement bytes; that mistake cost a false FAIL on another unit today).

Local (`t`) symbols, so addresses are `slide + x86_64 vmaddr` under `arch -x86_64`: an arm64 vmaddr
would land inside the image at some other function and fail SILENTLY toward VERIFIED.
"""
import ctypes
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Helium"
D0 = "__ZN12_GLOBAL__N_129HeapPoolFixedAllocationPolicyILi0ELi2097152EED0Ev"
D1 = "__ZN12_GLOBAL__N_129HeapPoolFixedAllocationPolicyILi0ELi2097152EED1Ev"
D0_ADDR, D1_ADDR, DELETE_STUB = 0x1A8710, 0x1A8700, 0x3C4FA0
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


oz.require_x86_64()
oz.load_framework(FW)
slide, _img = oz.image_slide(FW)
d0, d1 = oz.nm_addr(FW, D0), oz.nm_addr(FW, D1)
print(f"{FW} slide=0x{slide:x}  D0 vmaddr=0x{d0:x}  D1 vmaddr=0x{d1:x}")
check("addresses", d0 == D0_ADDR and d1 == D1_ADDR,
      f"D0 0x{d0:x} / D1 0x{d1:x} == the ports's @0x{D0_ADDR:x} / @0x{D1_ADDR:x}")

# ── 1. IDENTITY ─────────────────────────────────────────────────────────────────────────────────
body = ctypes.string_at(slide + d0, 10)
print("  D0 bytes: " + " ".join(f"{b:02x}" for b in body))
check("D0 body", body[0:4] == b"\x55\x48\x89\xe5\x5d"[0:4] and body[4] == 0x5D and body[5] == 0xE9,
      "55 48 89 e5 | 5d | e9 <rel32> — prologue, POP, then a jmp: four instructions and no call")
shifted = ctypes.string_at(slide + d0 + 1, 8)
check("the byte check can fail", shifted[0:4] != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

# ── 2 + 3. TAIL JUMP, TO THE operator delete STUB ───────────────────────────────────────────────
target = 0x1A871A + int.from_bytes(body[6:10], "little", signed=True)   # rip = next instruction
check("tail jump, not a call", body[4] == 0x5D and body[5] == 0xE9,
      "the frame is torn down (5d = popq %rbp) BEFORE the jump (e9), so operator delete returns to "
      "D0's caller — the port documents it as a tail call")
check("jumps to the __ZdlPv stub", target == DELETE_STUB,
      f"rel32 resolves to 0x{target:x} — Helium's operator delete(void*) stub, the address the port "
      "cites")
stub = ctypes.string_at(slide + target, 6)
check("and that really is a symbol stub", stub[0:2] == b"\xff\x25",
      f"stub bytes {' '.join(f'{b:02x}' for b in stub)} — ff 25 is an indirect jmp through the "
      "lazy-binding pointer, which is what a Mach-O symbol stub is (so the callee is the runtime's "
      "deallocation function, not something local that otool merely labelled)")

# ── 4. THE SIBLING D1 IS TRIVIAL — the port's reason for an empty body ──────────────────────────
d1b = ctypes.string_at(slide + d1, 6)
print("  D1 bytes: " + " ".join(f"{b:02x}" for b in d1b))
check("D1 is trivial", d1b[0:5] == b"\x55\x48\x89\xe5\x5d" and d1b[5] == 0xC3,
      "55 48 89 e5 5d c3 — pushq %rbp; movq %rsp,%rbp; popq %rbp; retq. Nothing to tear down, "
      "which is why D0 neither calls it nor does any member work")

# ── 5. NO OTHER CALLEE, decoded at the transcription's own boundaries ───────────────────────────
STARTS = [0x1A8710, 0x1A8711, 0x1A8714, 0x1A8715]
calls = [a for a in STARTS if body[a - D0_ADDR] == 0xE8]
indirect = [a for a in STARTS if body[a - D0_ADDR] == 0xFF]
check("no call and no indirect branch", not calls and not indirect,
      "checked at the four instruction boundaries the port transcribes, not by scanning for opcode "
      "bytes (a scan finds displacement bytes: 0xe8 is the displacement of `leaq -0x18(%rbp),%rcx`, "
      "which cost a false FAIL on another unit today)")

print()
print("HeapPoolFixedAllocationPolicy<0, 2097152>::~…() [D0] @Helium 0x1a8710 — "
      + ("VERIFIED STATICALLY (body byte-identical; tail jump resolved to the operator delete stub; "
         "sibling D1 trivial; no other callee). NOT called: a deleting destructor frees its "
         "argument, and no pointer this harness owns is the allocator's to free."
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
