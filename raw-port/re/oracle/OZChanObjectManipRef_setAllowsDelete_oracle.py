#!/usr/bin/env python3
"""Differential oracle for OZChanObjectManipRef::setAllowsDelete(bool) @Ozone 0x3796a0.

    arch -x86_64 /usr/bin/python3 \
      raw-port/re/oracle/OZChanObjectManipRef_setAllowsDelete_oracle.py

Ozone is loaded outside the app bundle by ozone_loader.py (depth-first @rpath
preload), which also refuses to run outside an x86_64 process.

Checks, against the live binary:
  1. the store is exactly ONE byte at +0x98 (`movb %sil`), with no collateral write
     anywhere in a 0x200-byte object — in particular the three bytes at +0x99..+0x9b
     keep their poison, which is what distinguishes a byte store from a dword one;
  2. NO NORMALISATION happens: the machine stores the low byte of the argument
     verbatim, so 2 stays 2 and 0x100 stores 0. The sibling getter @0x3796b0
     (`movzbl 0x98(%rdi), %eax`, its own ledger unit, read here only to pin the
     field) hands the same raw byte back rather than a 0/1 bool.
"""
import ctypes, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SET_VA = 0x3796A0
GET_VA = 0x3796B0
OBJ = 0x200
FIELD = 0x98
POISON = 0x5A


def main():
    L.require_x86_64()
    setter, sa, slide = L.local_fn("Ozone", "__ZN20OZChanObjectManipRef15setAllowsDeleteEb",
                                   None, [ctypes.c_void_p, ctypes.c_uint8])
    getter, ga, _ = L.local_fn("Ozone", "__ZNK20OZChanObjectManipRef15getAllowsDeleteEv",
                               ctypes.c_uint32, [ctypes.c_void_p])
    assert (sa, ga) == (SET_VA, GET_VA), f"symbols moved: {sa:#x}/{ga:#x}"
    print(f"slide={slide:#x} set={sa:#x} get={ga:#x}")

    random.seed(20260811)
    values = [0, 1, 2, 3, 0x7F, 0x80, 0xFE, 0xFF] + [random.getrandbits(8) for _ in range(64)]

    n = stored_bad = collateral = getter_bad = 0
    for v in values:
        buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(bytes([POISON]) * OBJ))
        before = bytes(buf)
        p = ctypes.cast(ctypes.byref(buf), ctypes.c_void_p)
        setter(p, v)
        after = bytes(buf)
        n += 1
        if after[FIELD] != (v & 0xFF):
            stored_bad += 1
        if before[:FIELD] != after[:FIELD] or before[FIELD + 1:] != after[FIELD + 1:]:
            collateral += 1
        if getter(p) != (v & 0xFF):
            getter_bad += 1

    print(f"CASES={n} STORED_BYTE_WRONG={stored_bad} COLLATERAL_WRITES={collateral} "
          f"GETTER_ROUNDTRIP_WRONG={getter_bad}")
    print("  (getter round-trip returning the RAW byte, not a normalised 0/1, is the "
          "point: setAllowsDelete(2) -> getAllowsDelete() == 2)")

    def ctl(name, model):
        w = 0
        for v in values:
            buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(bytes([POISON]) * OBJ))
            setter(ctypes.cast(ctypes.byref(buf), ctypes.c_void_p), v)
            if model(v, bytes(buf)) is False:
                w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{n} wrong")

    ctl("normalising to 0/1 (a `!= 0` store)", lambda v, b: b[FIELD] == (1 if v else 0))
    ctl("a 32-bit store (the poison at +0x99..+0x9b would be cleared)",
        lambda v, b: b[FIELD + 1:FIELD + 4] == bytes([0, 0, 0]))
    ctl("writing the neighbouring byte +0x99", lambda v, b: b[FIELD + 1] == (v & 0xFF))

    ok = stored_bad == 0 and collateral == 0 and getter_bad == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
