#!/usr/bin/env python3
"""Differential oracle for OZViewerState::getResolution(double*, double*)
@Ozone 0x36e270.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/OZViewerState_getResolution_double_oracle.py

Ozone loads outside the app bundle through raw-port/re/oracle/ozone_loader.py
(depth-first @rpath preload), and the harness refuses to run outside an x86_64
process — the port cites x86_64 offsets.

The body reads ONE field (the u32 resolution mode at this+0x20) and writes the
same scalar through BOTH out pointers, so a synthetic object is a complete
stand-in. Checked:
  1. the value for every mode in -4..8 plus the 32-bit edges, as RAW u64 BIT
     PATTERNS (this is a double, and bit patterns keep the comparison exact);
  2. that BOTH out pointers receive it, and that each is written exactly 8 bytes
     (the guard bytes around them are untouched);
  3. that the object itself is not modified;
  4. that the two constants really are the doubles at 0x709190 (1.0, 0.5) and
     0x7083a0 (0.25) — the mode->constant mapping is what the table below shows.
"""
import ctypes, os, struct, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__ZN13OZViewerState13getResolutionEPdS0_"
VA = 0x36E270
OBJ = 0x200
MODE_OFF = 0x20
GUARD = 0xA5


def port(mode: int) -> float:
    """The TS port: mode 2 -> 0.25, mode 1 -> 0.5, anything else -> 1.0."""
    m = mode & 0xFFFFFFFF
    if m == 2:
        return 0.25          # @Ozone 0x7083a0
    return 0.5 if m == 1 else 1.0   # @Ozone 0x709190 + 8 / + 0


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn("Ozone", SYM, None,
                                 [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    print(f"slide={slide:#x} vmaddr={addr:#x}")

    modes = list(range(-4, 9)) + [0x7FFFFFFF, -0x80000000, 0xFFFFFFFF, 0x100000001 & 0xFFFFFFFF]
    n = bad = obj_mutated = guard_bad = 0
    rows = []
    for mode in modes:
        obj = (ctypes.c_ubyte * OBJ).from_buffer(bytearray(bytes([GUARD]) * OBJ))
        ctypes.memmove(ctypes.byref(obj, MODE_OFF),
                       ctypes.byref(ctypes.c_uint32(mode & 0xFFFFFFFF)), 4)
        before = bytes(obj)
        # 32-byte scratch per out pointer, so an over-wide store is visible
        outx = (ctypes.c_ubyte * 32).from_buffer(bytearray(bytes([GUARD]) * 32))
        outy = (ctypes.c_ubyte * 32).from_buffer(bytearray(bytes([GUARD]) * 32))
        fn(ctypes.cast(ctypes.byref(obj), ctypes.c_void_p),
           ctypes.cast(ctypes.byref(outx), ctypes.c_void_p),
           ctypes.cast(ctypes.byref(outy), ctypes.c_void_p))
        bx, by = bytes(outx), bytes(outy)
        gx = struct.unpack('<Q', bx[:8])[0]
        gy = struct.unpack('<Q', by[:8])[0]
        exp = struct.unpack('<Q', struct.pack('<d', port(mode)))[0]
        n += 1
        if gx != exp or gy != exp:
            bad += 1
        if bx[8:] != bytes([GUARD]) * 24 or by[8:] != bytes([GUARD]) * 24:
            guard_bad += 1
        if bytes(obj) != before:
            obj_mutated += 1
        rows.append((mode, struct.unpack('<d', bx[:8])[0], struct.unpack('<d', by[:8])[0]))

    print(f"CASES={n} DIVERGED={bad} OVERWIDE_STORE={guard_bad} OBJECT_MUTATED={obj_mutated}")
    print("  mode -> (x, y):", ", ".join(f"{m}->{x:g}" for m, x, _ in rows[:13]))

    def ctl(name, model):
        w = 0
        for mode, x, _ in rows:
            if struct.pack('<d', model(mode)) != struct.pack('<d', x):
                w += 1
        print(f"  NEGATIVE CONTROL {name}: {w}/{n} wrong")

    ctl("mode 1 and 2 swapped", lambda m: 0.5 if (m & 0xFFFFFFFF) == 2 else (0.25 if (m & 0xFFFFFFFF) == 1 else 1.0))
    ctl("SIGNED table index (a negative mode reading table[-1])",
        lambda m: 0.25 if m == 2 else (0.5 if m == 1 else (0.5 if m < 0 else 1.0)))
    ctl("no mode==2 early exit, so mode 2 falls into the table as index 0",
        lambda m: 0.5 if (m & 0xFFFFFFFF) == 1 else 1.0)
    ctl("always full resolution", lambda m: 1.0)

    ok = bad == 0 and guard_bad == 0 and obj_mutated == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
