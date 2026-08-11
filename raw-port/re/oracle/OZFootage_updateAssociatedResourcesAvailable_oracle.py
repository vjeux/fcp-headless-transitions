#!/usr/bin/env python3
"""Differential oracle for OZFootage::updateAssociatedResourcesAvailable()
   @Ozone 0xbcdc0  (__ZN9OZFootage34updateAssociatedResourcesAvailableEv)

    arch -x86_64 /usr/bin/python3 \\
        raw-port/re/oracle/OZFootage_updateAssociatedResourcesAvailable_oracle.py

Rosetta is required and enforced (ozone_loader.require_x86_64): every @0xADDR in the port is
an x86_64 offset, and a native arm64 process would check the port against code it did not
transcribe — OPS_LOG, "the executable oracle calls the wrong architecture ... fails silently
toward VERIFIED".

THE PROBLEM WITH ORACLING AN EMPTY BODY, AND WHAT THIS DOES ABOUT IT. The claimed function is
five instructions (`pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq`). A
value-differential over fuzzed inputs is nearly vacuous for such a body: "returns 0" would
also be produced by a harness that never called anything. So this harness pins the three
things a reader can actually doubt, and says which channel each check covers:

  A. IDENTITY — is the code we called the code we transcribed? The dlsym'd address is
     compared against `_dyld_get_image_vmaddr_slide(Ozone) + 0xbcdc0`, and the eight bytes at
     that address are compared against the opcodes the disassembly says are there
     (55 48 89 e5 31 c0 5d c3). This is the direct guard against the "wrong slice / wrong
     function" family of silent false VERIFIEDs, and against a truncated disassembly having
     invented an empty body (OPS_LOG: a `b`-class table is all zeroes in the file image; the
     same shape of error applies to a body cut short).
  B. NO STORES — the live function is called on a 0x2200-byte object pre-filled with poison
     patterns, and every byte is compared afterwards. `makeClipIdle` @0xbcdd0 reads a
     `PMClip*` at +0x21a0, so 0x2200 comfortably covers the part of the object siblings
     touch. Any store — the thing a NON-empty body would do — shows up here.
  C. RETURN VALUE — %rax must be 0 for every fill, matching `xorl %eax, %eax` @0xbcdc4.

LIVENESS CONTROLS. An all-zero result set is exactly what a blind harness produces, so each
channel is proved capable of reporting a failure before its result is believed (OPS_LOG: "a
dead negative control means your harness is blind or your mutant is equivalent — say which"):

  * return channel: call a DIFFERENT live Ozone function through the same ctypes path that
    returns a NONZERO value (OZLightingFolder_Factory::getBundleID @0x4b2820, the local
    symbol the landed OZLightingFolder oracle already pins). If the return channel were
    structurally stuck at 0, this control would report 0 and the "returns 0" result above
    would be worthless.
  * store channel: the byte-comparator is run against a buffer with one byte deliberately
    flipped, and must report exactly that offset.
  * identity channel: the opcode check is re-run against a deliberately wrong address
    (the neighbouring symbol `makeClipIdle` @0xbcdd0) and must FAIL there.

A control that comes back dead means this file is measuring nothing, and the verdict below
is withheld rather than reported as VERIFIED.
"""
import ctypes
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

SYM = "_ZN9OZFootage34updateAssociatedResourcesAvailableEv"  # dlsym: no leading underscore
ADDR = 0xBCDC0
NEIGHBOUR_ADDR = 0xBCDD0        # __ZN9OZFootage12makeClipIdleEv — the wrong-address control
BODY = bytes([0x55, 0x48, 0x89, 0xE5, 0x31, 0xC0, 0x5D, 0xC3])
#             pushq %rbp | movq %rsp,%rbp | xorl %eax,%eax | popq %rbp | retq
OBJ_SIZE = 0x2200               # past the +0x21a0 PMClip* that makeClipIdle @0xbcdd0 reads
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

BUNDLE_ID_SYM = "__ZN24OZLightingFolder_Factory11getBundleIDEv"   # nm-style, local (`t`)
BUNDLE_ID_ADDR = 0x4B2820


def build_fills():
    rng = random.Random(ADDR)
    fills = [bytes([b]) * OBJ_SIZE for b in (0x00, 0xEE, 0xFF, 0xA5, 0xCD, 0x5A)]
    for _ in range(34):
        fills.append(bytes(rng.getrandbits(8) for _ in range(OBJ_SIZE)))
    return fills


def diff_offsets(a, b):
    return [i for i in range(len(a)) if a[i] != b[i]]


def main():
    ozone_loader.require_x86_64()
    lib = ozone_loader.load_framework("Ozone")
    slide, image_name = ozone_loader.image_slide("Ozone")

    fn = getattr(lib, SYM)
    fn.restype = ctypes.c_uint64
    fn.argtypes = [ctypes.c_void_p]

    # ── A. identity ────────────────────────────────────────────────────────────────────────
    dlsym_addr = ctypes.cast(fn, ctypes.c_void_p).value
    expect_addr = slide + ADDR
    addr_ok = dlsym_addr == expect_addr
    live_bytes = ctypes.string_at(expect_addr, len(BODY))
    body_ok = live_bytes == BODY
    print(f"A. identity: dlsym=0x{dlsym_addr:x}  slide+0x{ADDR:x}=0x{expect_addr:x}  "
          f"match={addr_ok}")
    print(f"   image = {image_name}")
    print(f"   body bytes in memory = {live_bytes.hex()}  expected = {BODY.hex()}  "
          f"match={body_ok}")

    # ── B/C. no stores, return value ───────────────────────────────────────────────────────
    fills = build_fills()
    mutated, nonzero_ret = 0, 0
    for fill in fills:
        obj = ctypes.create_string_buffer(fill, OBJ_SIZE)
        ret = fn(ctypes.addressof(obj))
        after = ctypes.string_at(ctypes.addressof(obj), OBJ_SIZE)
        if after != fill:
            mutated += 1
            print(f"   MUTATED at {diff_offsets(fill, after)[:16]} (fill 0x{fill[0]:02x})")
        if ret != 0:
            nonzero_ret += 1
            print(f"   RETURNED 0x{ret:x} (fill 0x{fill[0]:02x})")
    print(f"B. no stores: objects={len(fills)}  size=0x{OBJ_SIZE:x}  mutated={mutated}")
    print(f"C. return value: nonzero returns={nonzero_ret}/{len(fills)}")

    # ── liveness controls ──────────────────────────────────────────────────────────────────
    print("LIVENESS CONTROLS (each proves the matching channel can report a failure):")

    bundle, _bid_addr, _bid_slide = ozone_loader.local_fn(
        "Ozone", BUNDLE_ID_SYM, ctypes.c_uint64, [])
    bid = bundle()
    ret_channel_live = bid != 0
    print(f"  return channel: OZLightingFolder_Factory::getBundleID @0x{BUNDLE_ID_ADDR:x} "
          f"-> 0x{bid:x}  live={ret_channel_live}")

    probe = bytearray(b"\x00" * 64)
    tampered = bytearray(probe)
    tampered[37] ^= 0xFF
    store_channel_live = diff_offsets(probe, tampered) == [37]
    print(f"  store channel: injected 1-byte flip detected at "
          f"{diff_offsets(probe, tampered)}  live={store_channel_live}")

    wrong = ctypes.string_at(slide + NEIGHBOUR_ADDR, len(BODY))
    id_channel_live = wrong != BODY
    print(f"  identity channel: bytes at the NEIGHBOURING symbol 0x{NEIGHBOUR_ADDR:x} = "
          f"{wrong.hex()}  differ={id_channel_live}")

    dead = [n for n, v in (("return", ret_channel_live), ("store", store_channel_live),
                           ("identity", id_channel_live)) if not v]
    for n in dead:
        print(f"  !! DEAD CONTROL on the {n} channel — this harness is blind there; "
              f"its result for that channel means nothing")

    # ── the TS port ────────────────────────────────────────────────────────────────────────
    # The port is a pure `return 0` with no object access, so there is nothing to drive it
    # with: its entire content is the two facts checked above. Assert them against the source
    # rather than pretending a fuzz loop adds information.
    src = os.path.join(REPO, "raw-port", "src", "nodes", "OZFootage.ts")
    with open(src, "r", encoding="utf-8") as fh:
        text = fh.read()
    ts_ok = ("return 0;" in text
             and "throw" not in text.split("export function")[1]
             and hex(ADDR)[2:] in text.lower())
    print(f"TS port: returns 0, no throw in the body, cites 0x{ADDR:x} -> {ts_ok}")

    ok = (addr_ok and body_ok and mutated == 0 and nonzero_ret == 0 and not dead and ts_ok)
    print("VERIFIED vs live Ozone (empty body: zero stores, returns 0, opcodes match)"
          if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
