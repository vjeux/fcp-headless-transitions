#!/usr/bin/env python3
"""Differential oracle for
HGTextureManager::storageRecyclingPolicy(HGTextureManager::TextureStorageRecyclingPolicy)
@Helium 0x4b320.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/HGTextureManager_storageRecyclingPolicy_oracle.py

The symbol is EXPORTED (`nm` type `T`), but the harness still goes through
ozone_loader.py so the "refuse to run outside x86_64" guard applies — the port
cites x86_64 offsets.

There is no getter for +0xa8 in the export table (the only neighbour is
recycleClientStorageTextures(bool) @0x4b330), so the field is observed DIRECTLY:
the object is poisoned, the setter is called, and the raw dword at +0xa8 is read
back — together with a byte-for-byte diff of the whole object, which is what
proves the store is 4 bytes wide at that offset and touches nothing else.
"""
import ctypes, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN16HGTextureManager22storageRecyclingPolicyENS_29TextureStorageRecyclingPolicyE"
VA = 0x4B320
OBJ = 0x200
FIELD = 0xA8
POISON = 0xEE


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Helium", SYM, None, [ctypes.c_void_p, ctypes.c_uint32])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    random.seed(20260811)
    values = [0, 1, 2, 3, 0x7FFFFFFF, 0x80000000, 0xFFFFFFFF, 0xDEADBEEF]
    values += [random.getrandbits(32) for _ in range(200)]

    n = stored_bad = collateral = 0
    fails = []
    for v in values:
        buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(bytes([POISON]) * OBJ))
        before = bytes(buf)
        fn(ctypes.cast(ctypes.byref(buf), ctypes.c_void_p), v)
        after = bytes(buf)
        got = int.from_bytes(after[FIELD:FIELD + 4], 'little')
        n += 1
        if got != (v & 0xFFFFFFFF):
            stored_bad += 1
            if len(fails) < 6:
                fails.append((hex(v), hex(got)))
        # every byte outside [FIELD, FIELD+4) must be untouched
        if before[:FIELD] != after[:FIELD] or before[FIELD + 4:] != after[FIELD + 4:]:
            collateral += 1

    print(f"CASES={n} STORED_VALUE_WRONG={stored_bad} COLLATERAL_WRITES={collateral}")
    for f in fails:
        print("  FAIL value=%s stored=%s" % f)

    # ---- negative controls, measured the same way ----
    def ctl(name, model):
        w = 0
        for v in values:
            buf = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(bytes([POISON]) * OBJ))
            fn(ctypes.cast(ctypes.byref(buf), ctypes.c_void_p), v)
            if model(v, bytes(buf)) is False:
                w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{len(values)} wrong")

    ctl("a 16-bit store (the upper half would keep the 0xEE poison)",
        lambda v, b: int.from_bytes(b[FIELD:FIELD + 4], 'little')
        == ((v & 0xFFFF) | (0xEEEE << 16)))
    ctl("writing the neighbouring dword at +0xac instead",
        lambda v, b: int.from_bytes(b[FIELD + 4:FIELD + 8], 'little') == (v & 0xFFFFFFFF))
    ctl("writing +0xa4 (one dword low) instead",
        lambda v, b: int.from_bytes(b[FIELD - 4:FIELD], 'little') == (v & 0xFFFFFFFF))

    ok = stored_bad == 0 and collateral == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
