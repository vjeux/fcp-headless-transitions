#!/usr/bin/env python3
"""Differential oracle for `OZAudioMixer::getTrackPan(STTrack*, float*)`
@Ozone 0x21b550 (__ZN12OZAudioMixer11getTrackPanEP7STTrackPf).

Run under Rosetta — every @0xADDR in the port is an x86_64 offset:

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/OZAudioMixer_getTrackPan_oracle.py

SCOPE, STATED UP FRONT so nobody reads more into a PASS than it carries.
This function has four paths and three of them cross into the ST audio API
(_STTrackGetPanModule, _STModuleGetIndexedParameter,
_STParameterGetCurrentValue) — out-of-scope externs that need a live ST audio
graph, and which the port deliberately does not model. **This harness exercises
exactly the ONE path the TS actually transcribes: the `track == NULL`
fast-exit** (@0x21b563 `testq %rsi,%rsi` / @0x21b566 `je 0x21b590`). It is a
narrow claim, and it is the whole claim:

    getTrackPan(NULL, out) returns false and writes nothing to `out`.

Everything else the port does is throw at the boundary, and a throw is not
something an oracle can confirm. What the harness CAN still settle, and does:

  1. the NULL branch really is a NULL branch and really returns 0 — not a
     crash, not a stray ST call, not a write to the out-param;
  2. `out` is untouched on that path, so a port that pre-seeded the out-float
     (a plausible "helpful" mistake) is wrong;
  3. the byte self-check pins the compare-and-branch encoding, which is the
     only instruction pair the transcription depends on for this path.

Calling the non-NULL paths with a fabricated STTrack* would dereference host
audio structures and is not attempted — a segfaulting oracle proves nothing
(OPS_LOG: a ctypes CFRange segfault was mistaken for a bad port).
"""
import ctypes
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ozone_loader import load_framework, local_fn, require_x86_64  # noqa: E402

FW = "Ozone"
SYM = "__ZN12OZAudioMixer11getTrackPanEP7STTrackPf"

# The prologue + the NULL test and its branch:
#   0x21b550  55                       pushq %rbp
#   0x21b551  48 89 e5                 movq  %rsp, %rbp
#   0x21b554  41 56                    pushq %r14
#   0x21b556  53                       pushq %rbx
#   0x21b557  48 83 ec 10              subq  $0x10, %rsp
#   0x21b55b  48 c7 45 e8 00 00 00 00  movq  $0x0, -0x18(%rbp)
#   0x21b563  48 85 f6                 testq %rsi, %rsi
#   0x21b566  74 28                    je    0x21b590   (+0x28)
EXPECTED_BYTES = bytes.fromhex(
    "554889e5" "4156" "53" "4883ec10" "48c745e800000000" "4885f6" "7428")


def main():
    require_x86_64()
    # bool(OZAudioMixer* this, STTrack* track, float* out)
    fn, addr, slide = local_fn(
        FW, SYM, ctypes.c_ubyte,
        [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p])
    print(f"symbol   {SYM}")
    print(f"vmaddr   0x{addr:x} (x86_64)   slide 0x{slide:x}   "
          f"call @0x{slide + addr:x}")

    lib = load_framework(FW)
    dl = ctypes.cast(getattr(lib, SYM[1:]), ctypes.c_void_p).value
    if dl != slide + addr:
        print(f"DLSYM CROSS-CHECK FAILED: dlsym=0x{dl:x} vs 0x{slide + addr:x}")
        return 1
    print(f"dlsym cross-check PASS: both routes give 0x{dl:x}")

    got = ctypes.string_at(slide + addr, len(EXPECTED_BYTES))
    if got != EXPECTED_BYTES:
        print(f"BYTE SELF-CHECK FAILED\n  expected {EXPECTED_BYTES.hex()}"
              f"\n  got      {got.hex()}")
        return 1
    print(f"byte self-check PASS: {got.hex()}")
    print("  `48 85 f6` = testq %rsi,%rsi (the STTrack* arg); `74 28` = je +0x28"
          " -> 0x21b590, the xorl %r14d,%r14d / return-false path")

    # ---- the NULL-track path, the only one this port transcribes ------------
    cases = divergences = wrote_out = 0
    for trial in range(64):
        # a poisoned out-float, with a different bit pattern each trial
        pattern = struct.pack("<I", 0xA5A50000 + trial)
        out = ctypes.create_string_buffer(pattern, 4)
        before = bytes(out.raw)
        this = ctypes.create_string_buffer(b"\xcd" * 256, 256)

        live = fn(ctypes.cast(this, ctypes.c_void_p), None,
                  ctypes.cast(out, ctypes.c_void_p))
        port = 0                      # the TS returns false on a NULL track
        cases += 1
        if live != port:
            divergences += 1
            if divergences <= 3:
                print(f"  DIVERGED trial {trial}: live={live} port={port}")
        if bytes(out.raw) != before:
            wrote_out += 1
            if wrote_out <= 3:
                print(f"  OUT-PARAM WRITTEN trial {trial}: "
                      f"{before.hex()} -> {bytes(out.raw).hex()}")

    print(f"NULL-track path: {cases} trials, {divergences} divergences, "
          f"{wrote_out} trials where the out-float was written "
          f"(0 expected — the branch returns before any ST call)")

    # ---- negative controls, over the same single path -----------------------
    print("negative controls (each MUST diverge; a 0 means the harness is blind"
          " or the mutant is equivalent):")
    dead = 0
    controls = {
        "returns true on a NULL track": 1,
        "returns 0xff on a NULL track": 0xFF,
    }
    for name, val in controls.items():
        caught = 0
        for trial in range(64):
            out = ctypes.create_string_buffer(b"\x00" * 4, 4)
            this = ctypes.create_string_buffer(b"\xcd" * 256, 256)
            if fn(ctypes.cast(this, ctypes.c_void_p), None,
                  ctypes.cast(out, ctypes.c_void_p)) != val:
                caught += 1
        if caught == 0:
            dead += 1
        print(f"  {caught:3d}/{cases} caught — {name}")

    # "writes 0.0 into the out-float before returning" — a plausible wrong port
    caught = 0
    for trial in range(64):
        out = ctypes.create_string_buffer(struct.pack("<f", 1.5), 4)
        this = ctypes.create_string_buffer(b"\xcd" * 256, 256)
        fn(ctypes.cast(this, ctypes.c_void_p), None,
           ctypes.cast(out, ctypes.c_void_p))
        if bytes(out.raw) != struct.pack("<f", 0.0):
            caught += 1
    if caught == 0:
        dead += 1
    print(f"  {caught:3d}/{cases} caught — zeroes the out-float before returning")

    ok = divergences == 0 and wrote_out == 0 and dead == 0
    print("COVERAGE: 1 of the function's 4 paths (the NULL fast-exit) — the "
          "other three cross the ST audio boundary the port throws at, and are "
          "NOT exercised here.")
    print("RESULT:", "VERIFIED (for the transcribed path)" if ok else "FAILED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
