#!/usr/bin/env python3
"""Differential oracle for HGRenderNode::SetState(HGRenderNode::State) @Helium 0xdcc90.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGRenderNode_SetState_oracle.py

Both the setter and its reader GetState @0xdcdf0 are EXPORTED; the harness still
goes through ozone_loader.py for its x86_64 refusal check (the port cites x86_64
offsets). Three things are measured on a 0xEE-poisoned 0x200-byte object:
  1. the dword at +0x38 takes the full 32-bit argument;
  2. the live GetState hands the same value back (the matched store/load pair is
     what fixes the offset AND the width);
  3. NO other byte of the object changes — in particular +0x3c..+0x3f keep their
     poison, which is what distinguishes a dword store from a wider one.
"""
import ctypes, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SET_VA = 0xDCC90
GET_VA = 0xDCDF0
OBJ = 0x200
FIELD = 0x38
POISON = 0xEE


def main():
    L.require_x86_64()
    setter, sa, slide = L.local_fn("Helium", "__ZN12HGRenderNode8SetStateENS_5StateE",
                                   None, [ctypes.c_void_p, ctypes.c_uint32])
    getter, ga, _ = L.local_fn("Helium", "__ZN12HGRenderNode8GetStateEv",
                               ctypes.c_uint32, [ctypes.c_void_p])
    assert (sa, ga) == (SET_VA, GET_VA), f"symbols moved: {sa:#x}/{ga:#x}"
    print(f"slide={slide:#x} set={sa:#x} get={ga:#x}")

    random.seed(20260811)
    values = [0, 1, 2, 3, 4, 5, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF] + \
             [random.getrandbits(32) for _ in range(200)]

    n = stored_bad = roundtrip_bad = collateral = 0
    for v in values:
        buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(bytes([POISON]) * OBJ))
        before = bytes(buf)
        p = ctypes.cast(ctypes.byref(buf), ctypes.c_void_p)
        setter(p, v)
        after = bytes(buf)
        n += 1
        if int.from_bytes(after[FIELD:FIELD + 4], 'little') != (v & 0xFFFFFFFF):
            stored_bad += 1
        if getter(p) != (v & 0xFFFFFFFF):
            roundtrip_bad += 1
        if before[:FIELD] != after[:FIELD] or before[FIELD + 4:] != after[FIELD + 4:]:
            collateral += 1

    print(f"CASES={n} STORED_WRONG={stored_bad} GETTER_ROUNDTRIP_WRONG={roundtrip_bad} "
          f"COLLATERAL_WRITES={collateral}")

    def ctl(name, model):
        w = 0
        for v in values:
            buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(bytes([POISON]) * OBJ))
            setter(ctypes.cast(ctypes.byref(buf), ctypes.c_void_p), v)
            if model(v, bytes(buf)) is False:
                w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{n} wrong")

    ctl("a 16-bit store (the poison at +0x3a..+0x3b would survive)",
        lambda v, b: int.from_bytes(b[FIELD:FIELD + 4], 'little')
        == ((v & 0xFFFF) | (0xEEEE << 16)))
    ctl("a byte store", lambda v, b: b[FIELD] == (v & 0xFF)
        and b[FIELD + 1:FIELD + 4] == bytes([POISON] * 3))
    ctl("writing +0x3c instead",
        lambda v, b: int.from_bytes(b[FIELD + 4:FIELD + 8], 'little') == (v & 0xFFFFFFFF))
    ctl("writing the +0xb0 renderer slot instead",
        lambda v, b: int.from_bytes(b[0xB0:0xB4], 'little') == (v & 0xFFFFFFFF))

    ok = stored_bad == 0 and roundtrip_bad == 0 and collateral == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
