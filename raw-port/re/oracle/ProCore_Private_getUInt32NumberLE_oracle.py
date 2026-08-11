#!/usr/bin/env python3
"""Differential oracle for ProCore::Private::getUInt32NumberLE(unsigned char const*)
@ProCore 0xb0e13.

Run under `arch -x86_64 /usr/bin/python3`: every @0xADDR in the port is an x86_64
offset, and an oracle that dlsym's the arm64 slice fails silently toward VERIFIED
(OPS_LOG, "the executable oracle calls the wrong architecture").
"""
import ctypes, platform, random, struct, sys

assert platform.machine() == 'x86_64', f"WRONG SLICE: {platform.machine()}"

PC = "/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore"
lib = ctypes.CDLL(PC, ctypes.RTLD_GLOBAL)

getLE = lib._ZN7ProCore7Private17getUInt32NumberLEEPKh   # the unit under test
getLE.restype = ctypes.c_uint32
getLE.argtypes = [ctypes.c_char_p]

getBE = lib._ZN7ProCore7Private15getUInt32NumberEPKh     # landed sibling: the bswap twin
getBE.restype = ctypes.c_uint32
getBE.argtypes = [ctypes.c_char_p]


def port(b: bytes) -> int:
    """What the TS port computes: DataView.getUint32(offset, /*littleEndian=*/true)."""
    return struct.unpack('<I', b[:4])[0]


def main():
    random.seed(20260811)
    vecs = [
        b'\x00\x00\x00\x00', b'\xff\xff\xff\xff', b'\x01\x00\x00\x00', b'\x00\x00\x00\x01',
        b'\x80\x00\x00\x00', b'\x00\x00\x00\x80', b'\x12\x34\x56\x78', b'\x78\x56\x34\x12',
        b'\xde\xad\xbe\xef', b'\x7f\xff\xff\xff', b'\xff\x00\xff\x00', b'\x00\xff\x00\xff',
    ]
    vecs += [bytes(random.getrandbits(8) for _ in range(4)) for _ in range(2000)]

    n = bad = 0
    endian_discriminating = 0
    fails = []
    for v in vecs:
        # 8-byte buffer: the extra 4 bytes catch a port that reads too wide.
        buf = ctypes.create_string_buffer(v + bytes(random.getrandbits(8) for _ in range(4)), 8)
        got = getLE(buf)
        exp = port(v)
        n += 1
        if got != exp:
            bad += 1
            if len(fails) < 10:
                fails.append((v.hex(), hex(got), hex(exp)))
        # Cross-check against the landed big-endian sibling: they must differ
        # exactly when the 4 bytes are not a palindrome. That is what proves this
        # body really has no bswap rather than the harness reading a mirrored buffer.
        be = getBE(buf)
        pal = v == v[::-1]
        if (be == got) != pal:
            endian_discriminating += 1

    print(f"CASES={n} DIVERGED={bad} BE_SIBLING_INCONSISTENT={endian_discriminating}")
    for f in fails:
        print("  FAIL bytes=%s real=%s port=%s" % f)

    def ctl(name, f):
        w = 0
        for v in vecs:
            buf = ctypes.create_string_buffer(v + b'\x00\x00\x00\x00', 8)
            if f(v) != getLE(buf):
                w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{n} wrong")

    ctl("big-endian read (the bswap twin's behaviour)", lambda v: struct.unpack('>I', v[:4])[0])
    ctl("signed int32 instead of uint32", lambda v: struct.unpack('<i', v[:4])[0])
    ctl("16-bit read", lambda v: struct.unpack('<H', v[:2])[0])
    ctl("reads at offset 1", lambda v: struct.unpack('<I', (v + b'\x00')[1:5])[0])
    print("ORACLE:", "VERIFIED" if bad == 0 and endian_discriminating == 0 else "DIVERGED")
    return 0 if bad == 0 and endian_discriminating == 0 else 1


sys.exit(main())
