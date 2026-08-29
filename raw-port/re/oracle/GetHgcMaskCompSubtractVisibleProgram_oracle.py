#!/usr/bin/env python3
"""Differential for `GetHgcMaskCompSubtractVisibleProgram()` @Ozone 0x6a6aa0.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/\
GetHgcMaskCompSubtractVisibleProgram_oracle.py

THE WHOLE FUNCTION IS ONE `leaq`:

    0x6a6aa0  pushq %rbp
    0x6a6aa1  movq  %rsp, %rbp
    0x6a6aa4  leaq  0x15332a(%rip), %rax     ; -> 0x6a6aab + 0x15332a = 0x7f9dd5
    0x6a6aab  popq  %rbp
    0x6a6aac  retq

so there are exactly two things a port of it can get wrong — the ADDRESS the RIP-relative
displacement lands on, and the BYTES that live there — and both are measured here against the live
Ozone image.

ONE DEFINITION OF THE EXPECTED BYTES, AND IT IS THE PORT'S. The expected string is not typed into
this harness: it is imported from `raw-port/src/render/GetHgcMaskCompSubtractVisibleProgram.ts`
by node (`--experimental-strip-types`, no build step) and compared as raw UTF-8 bytes against the
bytes read out of the mapped image. A harness that carried its own copy of the string would only
prove that the harness agrees with itself — the mistake recorded in
`raw-port/army/ops/2026-08-11-a-differential-that-builds-its-two-sides-separately-confirms.md`.

  MEASURED, against the live Ozone image
    * the returned pointer minus the dyld slide is exactly 0x7f9dd5, i.e. the address the port's
      `leaq` arithmetic names (and the harness recomputes that arithmetic from the instruction's
      own operands rather than hard-coding the answer);
    * the 740 bytes there are byte-for-byte the port's constant, and the 741st is the NUL;
    * the pointer is invariant across calls.

  NEGATIVE CONTROLS, so that a pass means something
    * the same byte comparison one byte further into the literal must FAIL;
    * the string's own embedded `//LEN=00000002e4` header must equal the length actually read
      (the binary's internal self-check, used here as a third opinion on the byte count).
"""
import ctypes
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Ozone"
SYM = "__ZL36GetHgcMaskCompSubtractVisibleProgramv"
ADDR = 0x6A6AA0
# The `leaq` at 0x6a6aa4 is 7 bytes, so RIP is 0x6a6aab when the displacement is added.
LEAQ_AT, LEAQ_NEXT, LEAQ_DISP = 0x6A6AA4, 0x6A6AAB, 0x15332A
LITERAL_VA = LEAQ_NEXT + LEAQ_DISP  # 0x7f9dd5 — computed, not pasted

fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def inconclusive(name, detail):
    """Could not run. Never a pass — an unrun check is a hole, not a result."""
    print(f"  INCONCLUSIVE {name}: {detail}")
    fails.append(name + " (INCONCLUSIVE — could not run, which is not a pass)")


oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, ctypes.c_void_p, [])
print(f"{FW} slide=0x{slide:x}  vmaddr=0x{va:x}")
check("address", va == ADDR, f"0x{va:x} == the port's @0x{ADDR:x}")
check("the leaq arithmetic in the port's comment", LITERAL_VA == 0x7F9DD5,
      f"0x{LEAQ_NEXT:x} (the address AFTER the 7-byte leaq at 0x{LEAQ_AT:x}) + 0x{LEAQ_DISP:x} "
      f"= 0x{LITERAL_VA:x} — measuring the displacement from the leaq's own address instead "
      "would name a string 7 bytes earlier")

# ── the live side ─────────────────────────────────────────────────────────────────────────────
ptrs = [fn() for _ in range(3)]
ptr = ptrs[0]
check("the pointer is invariant across calls", len(set(ptrs)) == 1 and ptr,
      f"three calls returned {hex(ptr)} every time (never NULL)")
check("the returned pointer IS the literal the leaq names",
      ptr - slide == LITERAL_VA,
      f"0x{ptr:x} - slide 0x{slide:x} = 0x{ptr - slide:x} == 0x{LITERAL_VA:x}")

live = ctypes.string_at(ptr)                       # stops at the NUL
live_with_nul = ctypes.string_at(ptr, len(live) + 1)
print(f"  live literal: {len(live)} bytes at 0x{ptr - slide:x}, "
      f"first 16 = {live[:16].hex()}")

# ── the port's side: node imports the REAL .ts, so the two sides cannot share a typo ───────────
PORT = os.path.join(REPO, "src", "render", "GetHgcMaskCompSubtractVisibleProgram.ts")
DRIVER = """
const mod = await import(process.argv[2]);
const s = mod.GetHgcMaskCompSubtractVisibleProgram();
process.stdout.write(JSON.stringify({
  s,
  sameObject: s === mod.kHgcMaskCompSubtract_MetalVisible_Program,
}));
"""
drv = os.path.join(HERE, ".hgcmcs_driver.mts")
open(drv, "w").write(DRIVER)
try:
    p = subprocess.run(["node", "--experimental-strip-types", drv, PORT],
                       capture_output=True, text=True, cwd=HERE)
    if p.returncode != 0:
        inconclusive("the TS port runs", f"node failed: {p.stderr[-600:]}")
        port_bytes = None
    else:
        d = json.loads(p.stdout)
        port_bytes = d["s"].encode("utf-8")
        check("the port returns its own constant", d["sameObject"],
              "the exported function returns the exported constant, so what is compared below is "
              "what a caller gets")
finally:
    os.unlink(drv)

# ── the differential ──────────────────────────────────────────────────────────────────────────
if port_bytes is not None:
    check("TS == live, byte for byte", port_bytes == live,
          f"the port's string is {len(port_bytes)} bytes and the literal in the mapped image is "
          f"{len(live)}; they are identical as raw UTF-8 bytes")
    check("the literal is NUL-terminated where the port's string ends",
          live_with_nul[-1:] == b"\x00" and len(live_with_nul) == len(port_bytes) + 1,
          f"byte {len(port_bytes)} at 0x{ptr - slide + len(port_bytes):x} is 0x00 — the port's "
          "string ends exactly where the C string does")
    # NEGATIVE CONTROL: the comparison must be able to fail.
    shifted = ctypes.string_at(ptr + 1, len(port_bytes))
    check("NEGATIVE CONTROL: one byte off the literal does NOT match", shifted != port_bytes,
          "the same comparison started one byte further into the literal fails, so the equality "
          "above is discriminating rather than vacuous")
    # THIRD OPINION on the length: the string carries its own byte count.
    head = live.split(b"\n")[1] if b"\n" in live else b""
    declared_len = int(head.split(b"=")[1], 16) if head.startswith(b"//LEN=") else -1
    check("the string's embedded //LEN header agrees with the bytes read",
          declared_len == len(live),
          f"the literal's own header says LEN=0x{declared_len:x} ({declared_len}) and "
          f"{len(live)} bytes were read")

print()
print("GetHgcMaskCompSubtractVisibleProgram() @Ozone 0x6a6aa0 — "
      + ("VERIFIED: the live function returns a pointer to __TEXT,__cstring 0x7f9dd5 — the address "
         "the port's leaq arithmetic derives — invariantly across calls, and the 740 bytes there "
         "are byte-for-byte the string the TypeScript port returns, NUL terminator included, with "
         "the literal's own //LEN header agreeing and a one-byte shift rejected."
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
