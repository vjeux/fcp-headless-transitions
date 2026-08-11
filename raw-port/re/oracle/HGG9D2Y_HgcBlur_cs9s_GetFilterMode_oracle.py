#!/usr/bin/env python3
"""Differential for HGG9D2Y<HgcBlur_cs9s>::GetFilterMode @Helium 0x1f6cd0.

Port: raw-port/src/render/HGG9D2Y_HgcBlur_cs9s.ts   Run: arch -x86_64 /usr/bin/python3 <this file>

A local (`t`) symbol, so it is called BY ADDRESS at slide + vmaddr, with the prologue bytes
re-read from the mapped image and checked against the transcription first — the cheap guard
against calling the wrong address (the arm64-vmaddr trap). Runs under x86_64 by construction:
every address here is from the x86_64 inventory.
"""
import ctypes, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
import ozone_loader as L

L.require_x86_64()
VMADDR = 0x1F6CD0
EXPECT = bytes.fromhex("554889e531c05dc3")     # push rbp; mov rbp,rsp; xor eax,eax; pop rbp; ret

L.load_framework("Helium")
slide, image = L.image_slide("Helium")
print(f"image={image} slide=0x{slide:x} target=0x{slide + VMADDR:x}")
got = ctypes.string_at(slide + VMADDR, len(EXPECT))
print(f"bytes at target: {got.hex()}   expected: {EXPECT.hex()}")
if got != EXPECT:
    print("PROLOGUE MISMATCH — not the function that was transcribed; refusing to report a number")
    sys.exit(1)

# int32 GetFilterMode(this*, int, HGFilterMode) — the body reads none of them, which is exactly
# what the differential has to show, so `this` is a poisoned arena and the args are swept.
proto = ctypes.CFUNCTYPE(ctypes.c_int32, ctypes.c_void_p, ctypes.c_int32, ctypes.c_int32)
fn = ctypes.cast(slide + VMADDR, proto)

arena = ctypes.create_string_buffer(b"\xCD" * 256)
before = bytes(arena.raw)
bad = 0
cases = 0
for a in (0, 1, -1, 2, 7, 0x7FFFFFFF, -0x80000000, 12345):
    for b in (0, 1, 2, 3, -1, 0x7FFFFFFF, -0x80000000):
        real = fn(ctypes.cast(arena, ctypes.c_void_p), a, b)
        port = 0                                   # the TS body: `return 0;` @0x1f6cd4
        cases += 1
        if real != port:
            bad += 1
            print(f"  MISMATCH ({a}, {b}): live={real} port={port}")
print(f"{cases - bad}/{cases} agree with the live symbol")
if bytes(arena.raw) != before:
    print("THE CALLEE WROTE THROUGH `this` — the port models it as reading nothing; that is wrong")
    sys.exit(2)
print("poisoned `this` arena is byte-identical after every call: the body touches no state")
sys.exit(2 if bad else 0)
