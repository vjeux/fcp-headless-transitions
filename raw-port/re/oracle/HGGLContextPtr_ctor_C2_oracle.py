#!/usr/bin/env python3
"""Differential oracle for HGGLContextPtr::HGGLContextPtr(void*) [C2] @Helium 0x1b3920.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGGLContextPtr_ctor_C2_oracle.py

The body is three instructions, which is exactly why it is worth measuring rather than reading:
the interesting claims about it are all NEGATIVE — that a BASE-OBJECT constructor stores no vtable
pointer, calls no base constructor, and touches no byte of the object except the first eight. A
return-value comparison cannot see any of that. So the harness poisons a 0x40-byte arena, calls the
live symbol, and byte-diffs the whole arena afterwards.

It also settles the C1/C2 question by measurement instead of by mangling lore: a compiler may alias
the two constructor symbols or emit two bodies, and here it emitted two (0x1b3920 and 0x1b3930, each
with its own prologue). Every case is run through BOTH addresses on separate arenas and the arenas
are required to come out identical, which is the evidence for the file's claim that the C2 form does
the same thing as the landed C1 form.

The TS side is the SHIPPED port, driven through HGGLContextPtr_ctor_C2_driver.mts, with three wrong
models carried alongside it as negative controls. Pointers cross as hex strings: a u64 does not
survive JSON's double.
"""
import ctypes, json, os, random, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as L  # noqa: E402
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

DRIVER = os.path.join(HERE, "HGGLContextPtr_ctor_C2_driver.mts")
VA_C2 = 0x1B3920
VA_C1 = 0x1B3930
PROLOGUE = bytes.fromhex("554889e5488937")   # push rbp; mov rbp,rsp; mov %rsi,(%rdi)
ARENA = 0x40
POISON = 0xEE
M64 = (1 << 64) - 1


def call_at(va, arena_bytes, ptr):
    """Call the ctor at <va> on a fresh poisoned arena; return the arena's bytes afterwards."""
    slide, _ = L.image_slide("Helium")
    fn = ctypes.cast(slide + va, ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p))
    buf = ctypes.create_string_buffer(arena_bytes, ARENA)
    fn(ctypes.cast(buf, ctypes.c_void_p), ctypes.c_void_p(ptr))
    return bytes(buf.raw)


def main():
    L.require_x86_64()
    L.load_framework("Helium")
    slide, _ = L.image_slide("Helium")
    got = ctypes.string_at(slide + VA_C2, len(PROLOGUE))
    print(f"prologue @0x{VA_C2:x}: {got.hex()}  expected: {PROLOGUE.hex()}")
    if got != PROLOGUE:
        print("PROLOGUE MISMATCH — refusing to report a result")
        return 1
    if ctypes.string_at(slide + VA_C1, len(PROLOGUE)) != PROLOGUE:
        print("C1 prologue mismatch — refusing")
        return 1
    if slide + VA_C1 == slide + VA_C2:
        print("C1 and C2 resolve to ONE address — the file's two-bodies claim is wrong")
        return 1

    rng = random.Random(11)
    scratch = ctypes.create_string_buffer(64)
    scratch_addr = ctypes.cast(scratch, ctypes.c_void_p).value
    ptrs = [0, 1, 8, 0x10, scratch_addr, scratch_addr + 8,
            0x7FFF_FFFF_FFFF, 0x8000_0000_0000_0000, 0xFFFF_FFFF_FFFF_FFFF,
            0xFFFF_FF80_0000_0000, 0xDEAD_BEEF, 0x1B3920]
    ptrs += [rng.getrandbits(64) for _ in range(32)]

    base = bytes([POISON]) * ARENA
    cases, bad, stray, c1c2 = [], 0, 0, 0
    for ptr in ptrs:
        after2 = call_at(VA_C2, base, ptr)
        after1 = call_at(VA_C1, base, ptr)
        stored = struct.unpack_from("<Q", after2, 0)[0]
        if stored != (ptr & M64):
            bad += 1
            print(f"  MISMATCH ptr=0x{ptr:016x}: +0x00 holds 0x{stored:016x}")
        if after2[8:] != base[8:]:
            stray += 1
            first = next(i for i in range(8, ARENA) if after2[i] != base[i])
            print(f"  STRAY WRITE ptr=0x{ptr:016x}: byte +0x{first:02x} changed")
        if after1 != after2:
            c1c2 += 1
            print(f"  C1 != C2 ptr=0x{ptr:016x}")
        cases.append({"ptr": f"{ptr & M64:016x}", "live": f"{stored:016x}"})

    proc = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                          input=json.dumps(cases), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if proc.returncode != 0:
        print("TS driver failed:\n" + proc.stdout + proc.stderr)
        return 3
    rows = json.loads(proc.stdout)
    ts_bad = {}
    for c, r in zip(cases, rows):
        for model, val in r.items():
            if val != c["live"]:
                ts_bad[model] = ts_bad.get(model, 0) + 1

    n = len(cases)
    print(f"  live vs model (+0x00 holds the argument):   {n - bad}/{n}")
    print(f"  no byte outside +0x00..+0x08 was touched:   {n - stray}/{n}")
    print(f"  C2 and C1 leave identical arenas:           {n - c1c2}/{n}")
    print(f"  live vs the SHIPPED port:                   {n - ts_bad.get('port', 0)}/{n}")
    print("NEGATIVE CONTROLS (wrong TS models, same run, scored against live):")
    for model, label in (("stores_zero", "stores 0 (the destructor's body)"),
                         ("leaves_alone", "leaves the slot untouched"),
                         ("stores_addr_of_self", "stores `this` instead of the argument")):
        print(f"  {label:52s} killed {ts_bad.get(model, 0)}/{n}")

    ok = not (bad or stray or c1c2 or ts_bad.get("port", 0))
    controls_ok = all(ts_bad.get(m, 0) > 0 for m in ("stores_zero", "leaves_alone", "stores_addr_of_self"))
    if not controls_ok:
        print("A NEGATIVE CONTROL DID NOT FIRE — the harness is blind or the mutant is equivalent")
    print("HGGLContextPtr::HGGLContextPtr(void*) [C2] oracle: "
          + ("VERIFIED" if ok and controls_ok else "DIVERGED"))
    return 0 if (ok and controls_ok) else 2


if __name__ == "__main__":
    sys.exit(main())
