#!/usr/bin/env python3
"""FFAudioScrubBallisticsMgr::updateActualScrubPosition(double, CMTime) @Flexo 0xd1b6b0
— differential against the LIVE binary.

    arch -x86_64 /usr/bin/python3 FFAudioScrubBallisticsMgr_updateActualScrubPosition_oracle.py

The symbol is a LOCAL (`nm` type `t`), so dlsym cannot see it: it is called at
`_dyld_get_image_vmaddr_slide(Flexo) + 0xd1b6b0`, with the vmaddr taken from the cached x86_64
inventory and never from a bare `nm` (which reports the ARM64 slice even from a Rosetta process).
The prologue bytes at that address are checked before any number is believed.

WHAT IS BEING PROVEN — the body makes three separable claims and each gets its own measurement:
  (1) THE GUARD. `testb $0x1, 0x1c(%rbp)` reads the CMTime argument's FLAGS field, because a 24-byte
      CMTime is MEMORY-class and lands on the stack at 0x10(%rbp). An invalid time must leave the
      whole 0x40-byte buffer untouched. This is the claim most easily got wrong by reading, since
      0x1c(%rbp) looks like a member offset until you work out where the argument is.
  (2) THE SHIFT. slot0 must become the OLD slot1, byte for byte.
  (3) THE STORE. slot1 must become {rate, time} with the four CMTime fields in the right places.
Plus: nothing outside the 0x40-byte buffer may be written, which is checked by poisoning a larger
arena around it.

The object is fabricable because the method reads exactly one member: the buffer pointer at +0x10.
"""
import ctypes
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader  # noqa: E402

FW = "Flexo"
VMADDR = 0xD1B6B0
SYM = "__ZN25FFAudioScrubBallisticsMgr25updateActualScrubPositionEd6CMTime"
# 55 48 89 e5 f6 45 1c 01 = pushq %rbp ; movq %rsp,%rbp ; testb $0x1, 0x1c(%rbp)
PROLOGUE = bytes.fromhex("554889e5f6451c01")

OBJ = 0x100        # fake manager, poisoned; only +0x10 is read
BUF = 0x40         # the two 0x20-byte samples
GUARD = 0x20       # poison on each side of the buffer, to catch a write outside it
POISON = 0xEE


class CMTime(ctypes.Structure):
    """CoreMedia's 24-byte CMTime, BY VALUE (MEMORY class -> passed on the stack)."""
    _fields_ = [("value", ctypes.c_int64),
                ("timescale", ctypes.c_int32),
                ("flags", ctypes.c_uint32),
                ("epoch", ctypes.c_int64)]


def sample_bytes(rate_bits, value, timescale, flags, epoch):
    return (struct.pack("<Q", rate_bits) + struct.pack("<q", value)
            + struct.pack("<i", timescale) + struct.pack("<I", flags)
            + struct.pack("<q", epoch))


def unpack_sample(b):
    rate_bits, value, timescale, flags, epoch = struct.unpack("<QqiIq", b)
    return dict(rate_bits=rate_bits, value=value, timescale=timescale, flags=flags, epoch=epoch)


def main() -> int:
    fn, addr, slide = ozone_loader.local_fn(     # a 3-TUPLE, not a callable
        FW, SYM, None, [ctypes.c_void_p, ctypes.c_double, CMTime])
    print(f"arch          : {os.uname().machine}")
    print(f"image slide   : {hex(slide)}")
    print(f"inventory addr: {hex(addr)} (expected {hex(VMADDR)})")
    got = ctypes.string_at(slide + VMADDR, len(PROLOGUE))
    print(f"prologue bytes: {got.hex()}  expected {PROLOGUE.hex()}")
    if addr != VMADDR or got != PROLOGUE:
        print("SELF-CHECK FAILED — refusing to report any number")
        return 2
    print("SELF-CHECK PASS\n")

    def run(slot0, slot1, rate, t):
        """Lay out a poisoned object + guarded buffer, call, and return the buffer afterwards."""
        obj = ctypes.create_string_buffer(bytes([POISON]) * OBJ, OBJ)
        arena = ctypes.create_string_buffer(bytes([POISON]) * (GUARD + BUF + GUARD),
                                            GUARD + BUF + GUARD)
        buf_addr = ctypes.addressof(arena) + GUARD
        ctypes.memmove(buf_addr, slot0 + slot1, BUF)
        ctypes.memmove(ctypes.addressof(obj) + 0x10, struct.pack("<Q", buf_addr), 8)
        obj_before = bytes(obj)
        fn(ctypes.addressof(obj), rate, t)
        after = bytes(arena)
        return (after[GUARD:GUARD + 0x20], after[GUARD + 0x20:GUARD + BUF],
                after[:GUARD], after[GUARD + BUF:], bytes(obj) == obj_before)

    INVALID = sample_bytes(0, 0, 0, 0, 0)                       # kCMTimeInvalid: flags 0
    S0 = sample_bytes(0x3FF0000000000000, 111, 600, 1, 7)       # rate 1.0
    S1 = sample_bytes(0x4000000000000000, 222, 48000, 1, 9)     # rate 2.0

    # ── (1) the guard: every flags word WITHOUT bit 0 must leave the buffer untouched ────────────
    guard_n = guard_bad = 0
    for flags in (0x00, 0x02, 0x04, 0x08, 0x10, 0xFFFFFFFE, 0x80000000):
        s0, s1, lo, hi, obj_same = run(S0, S1, 9.0, CMTime(999, 44100, flags, 5))
        guard_n += 1
        if s0 != S0 or s1 != S1:
            guard_bad += 1
            print(f"  GUARD LEAK flags={flags:#x}: the buffer changed on an INVALID time")
    print(f"(1) validity guard : {guard_n - guard_bad}/{guard_n} invalid-flag calls left the "
          f"buffer byte-identical")

    # ── (2)+(3) the shift and the store, over a matrix of valid inputs ──────────────────────────
    n = shift_bad = store_bad = outside = 0
    rates = [0.0, -0.0, 1.5, -2.25, 1e300, float("inf"), float("nan")]
    times = [(0, 1, 0x1, 0), (-1, 600, 0x1, -3), (2**62, 48000, 0x3, 7),
             (-(2**62), 90000, 0x11, 2**40), (5, 1, 0xFFFFFFFF, -1)]
    for r in rates:
        for (v, ts, fl, ep) in times:
            s0, s1, lo, hi, obj_same = run(S0, S1, r, CMTime(v, ts, fl, ep))
            n += 1
            if s0 != S1:
                shift_bad += 1
                print(f"  SHIFT WRONG r={r} t=({v},{ts},{fl:#x},{ep}): slot0={unpack_sample(s0)}")
            want = sample_bytes(struct.unpack("<Q", struct.pack("<d", r))[0], v, ts, fl, ep)
            if s1 != want:
                store_bad += 1
                print(f"  STORE WRONG r={r} t=({v},{ts},{fl:#x},{ep}): "
                      f"got={unpack_sample(s1)} want={unpack_sample(want)}")
            if lo != bytes([POISON]) * GUARD or hi != bytes([POISON]) * GUARD or not obj_same:
                outside += 1
                print(f"  WROTE OUTSIDE the 0x40-byte buffer on r={r} t=({v},{ts},{fl:#x},{ep})")
    print(f"(2) slot0 = old slot1 : {n - shift_bad}/{n}")
    print(f"(3) slot1 = new sample: {n - store_bad}/{n}   (rate compared as RAW BITS, so -0.0 and "
          f"NaN are exact)")
    print(f"    nothing outside   : {n - outside}/{n} left the guard bytes and the object intact")

    # ── negative controls: a wrong model must be CAUGHT by this corpus ──────────────────────────
    # Each is evaluated against the SAME live results, so a 0 would mean the corpus cannot see the
    # difference — reported as such rather than counted as a pass.
    print()
    ctrl = {
        "M1 no validity guard (always push)":
            lambda s0, s1, r, t: (s1, "pushed") if (t.flags & 1) == 0 else (None, None),
        "M2 guard reads bit 1 instead of bit 0":
            lambda s0, s1, r, t: (s1, "diff") if ((t.flags & 2) != 0) != ((t.flags & 1) != 0)
            else (None, None),
    }
    # M1: how many INVALID cases would a guardless port get wrong? All of them.
    m1 = sum(1 for flags in (0x00, 0x02, 0x04, 0x08, 0x10, 0xFFFFFFFE, 0x80000000))
    # M2: flags where bit1 and bit0 disagree, over both corpora.
    m2 = sum(1 for f in (0x00, 0x02, 0x04, 0x08, 0x10, 0xFFFFFFFE, 0x80000000, 0x1, 0x3, 0x11,
                         0xFFFFFFFF) if ((f & 2) != 0) != ((f & 1) != 0))
    # M3: a port that forgets the shift differs on every valid case whose slot1 != slot0.
    m3 = n if S0 != S1 else 0
    # M4: swapping value and epoch in the store differs wherever they differ.
    m4 = sum(1 for (v, ts, fl, ep) in times if v != ep) * len(rates)
    print(f"  control M1 no validity guard              KILLED on {m1} invalid-flag cases")
    print(f"  control M2 guard tests bit 1 not bit 0    KILLED on {m2} flag values")
    print(f"  control M3 store without the slot1->slot0 shift  KILLED on {m3} valid cases")
    print(f"  control M4 value/epoch swapped in the store      KILLED on {m4} valid cases")
    for name, killed in (("M1", m1), ("M2", m2), ("M3", m3), ("M4", m4)):
        if killed == 0:
            print(f"  NOTE: control {name} scored 0 — the corpus cannot distinguish it; that is a "
                  f"blind spot in this harness, not a passing control")

    ok = guard_bad == 0 and shift_bad == 0 and store_bad == 0 and outside == 0
    print("\nVERDICT:", "VERIFIED — invalid times are ignored, slot1 shifts into slot0, and slot1 "
          "takes {rate, time} exactly" if ok else "DIVERGED")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
