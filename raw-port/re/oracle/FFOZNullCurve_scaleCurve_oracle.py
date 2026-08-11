#!/usr/bin/env python3
"""Differential for `FFOZNullCurve::scaleCurve(double)` @Flexo 0x1287840 against the LIVE binary.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/FFOZNullCurve_scaleCurve_oracle.py

The port says three things, and a lazy harness would "confirm" all three by doing nothing:

    it always returns 0    it never reads the scale factor    it never touches the receiver

So the interesting half of this file is not the 400 calls; it is the CONTROL. The real
implementation of the same virtual — `OZCurve::scaleCurve(double)` @ProChannel 0x2190c — is called
through the IDENTICAL CFUNCTYPE on an identical arena: it returns 1 (`movb $0x1,%al` @0x219a4) and
writes the scaled value back to +0x38 (`movsd %xmm2, 0x38(%rdi)` @0x21923). If this harness could
not see a return value or a receiver write, that control would come back looking like the null
curve — and it does not. That is the sibling-override control OPS_LOG prescribes for
constant-returning bodies, in its strongest available form: same virtual, real work, same plumbing.

The control runs in a FORKED CHILD because `OZCurve::scaleCurve` calls on into
`OZSplineNode::getSpline()` and `OZSpline::scaleSpline(...)`; a harness must not risk the parent on
a synthetic receiver. A child that dies is reported INCONCLUSIVE, never as a pass.

Both symbols are LOCAL/exported x86_64 addresses called at `slide + vmaddr` under `arch -x86_64`,
with the body bytes checked BEFORE any call — an arm64 vmaddr would land on another function and
fail silently toward VERIFIED.
"""
import ctypes
import math
import os
import random
import struct
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

NULL_SYM = "__ZN13FFOZNullCurve10scaleCurveEd"
NULL_ADDR = 0x1287840
REAL_SYM = "__ZN7OZCurve10scaleCurveEd"          # the concrete override, in ProChannel
REAL_ADDR = 0x2190C
ARENA = 0x100
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def inconclusive(name, detail):
    print(f"  INCONCLUSIVE {name}: {detail}")
    fails.append(name + " (INCONCLUSIVE — could not run, which is not a pass)")


oz.require_x86_64()
fn, va, slide = oz.local_fn("Flexo", NULL_SYM, ctypes.c_int32,
                            [ctypes.c_void_p, ctypes.c_double])
print(f"Flexo slide=0x{slide:x}  scaleCurve vmaddr=0x{va:x}")
check("address", va == NULL_ADDR, f"0x{va:x} == the port's @0x{NULL_ADDR:x}")

body = ctypes.string_at(slide + va, 6)
print("  body bytes: " + " ".join(f"{b:02x}" for b in body))
check("the whole body", body == b"\x55\x48\x89\xe5\x31\xc0",
      "55 48 89 e5 | 31 c0 — prologue then `xorl %eax,%eax`. No load, no store, no mulsd: neither "
      "the receiver nor the double in %xmm0 can be read by these instructions")
check("the byte check can fail", ctypes.string_at(slide + va + 1, 4) != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

# ── 400 calls against a poisoned receiver ─────────────────────────────────────────────────────
rnd = random.Random(0x1287840)
scales = [0.0, -0.0, 1.0, -1.0, 2.0, 0.5, math.inf, -math.inf, math.nan, 5e-324, 1.7976931348623157e308]
scales += [rnd.uniform(-1e6, 1e6) for _ in range(400 - len(scales))]
nonzero, written = 0, 0
for s in scales:
    a = (ctypes.c_char * ARENA)(*([0xAA] * ARENA))
    before = bytes(a)
    if fn(ctypes.byref(a), s) != 0:
        nonzero += 1
    if bytes(a) != before:
        written += 1
check("it always returns 0", nonzero == 0,
      f"{len(scales)} calls (including ±0, ±Inf, NaN, denormal and 1.0), {nonzero} non-zero returns")
check("it never touches the receiver", written == 0,
      f"{written} of {len(scales)} calls changed any byte of the 0xAA-poisoned 0x{ARENA:x}-byte "
      "object")

# ── THE CONTROL: the real override of the same virtual, identical plumbing, forked ────────────
r, w = os.pipe()
pid = os.fork()
if pid == 0:
    try:
        real, real_va, real_slide = oz.local_fn("ProChannel", REAL_SYM, ctypes.c_int32,
                                                [ctypes.c_void_p, ctypes.c_double])
        a = (ctypes.c_char * ARENA)()                 # zeroed: getSpline() then returns null
        struct.pack_into("<d", a, 0x38, 3.0)          # the end time the real code scales
        struct.pack_into("<d", a, 0x78, -1e300)       # the low clamp at +0x78
        struct.pack_into("<d", a, 0x80, 1e300)        # the high clamp at +0x80
        before = bytes(a)
        rc = real(ctypes.byref(a), 4.0)
        after = struct.unpack_from("<d", a, 0x38)[0]
        os.write(w, f"{real_va:x} {rc} {int(bytes(a) != before)} {after}".encode())
        os._exit(0)
    except BaseException:
        os._exit(4)
os.close(w)
_, status = os.waitpid(pid, 0)
out = os.read(r, 128).decode()
if os.WIFSIGNALED(status) or os.WEXITSTATUS(status) != 0:
    inconclusive("SIBLING-OVERRIDE CONTROL",
                 f"the forked child running OZCurve::scaleCurve did not complete "
                 f"(signal={os.WTERMSIG(status) if os.WIFSIGNALED(status) else 0}, "
                 f"exit={os.WEXITSTATUS(status) if not os.WIFSIGNALED(status) else '-'}) — the "
                 "control was NOT measured, so the two zeroes above stand unsupported")
else:
    rva, rc, changed, after = out.split()
    print(f"  control: OZCurve::scaleCurve @ProChannel 0x{rva} returned {rc}, "
          f"receiver changed={changed}, +0x38 is now {after}")
    check("the control address", int(rva, 16) == REAL_ADDR,
          f"0x{rva} == the concrete override @0x{REAL_ADDR:x}")
    check("SIBLING-OVERRIDE CONTROL: the real override answers 1, not 0", rc == "1",
          "the same virtual, implemented for a real curve, returns 1 through the IDENTICAL "
          "CFUNCTYPE — so the harness reads the true %al and 'the null curve returns 0' is an "
          "answer rather than an artifact")
    check("MUTATION CONTROL: the real override writes its receiver", changed == "1",
          f"it scaled +0x38 from 3.0 to {after} (x4.0), so the byte-comparison used above can see "
          "a write when there is one")

print()
print("FFOZNullCurve::scaleCurve(double) @Flexo 0x1287840 — "
      + ("VERIFIED (body byte-identical; 400 live calls all return 0 and leave a poisoned receiver "
         "untouched, while the real override of the same virtual, through the same plumbing, "
         "returns 1 and writes at +0x38)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
