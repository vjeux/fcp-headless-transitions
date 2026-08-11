#!/usr/bin/env python3
"""Differential oracle for OZRenderState::TransformSet::rotation(bool) @Ozone 0x277180.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/OZRenderState__TransformSet_rotation_oracle.py

The method is nine instructions and the whole question it raises is what its OFF path does to bits
it was never asked about: the machine builds that value with a 32-bit `movl %eax,%ecx` followed by
`andl $0x3fc7,%ecx`, so it discards bits 14..63, while the ON path is a 64-bit `orq` that preserves
them. A corpus of small flag words cannot tell that apart from `bits & ~0x38`, so the sweep is built
around words with bits set above 0x3FFF and above 2^32, and the complement-mask model is carried as
a negative control with its kill count reported.

The arena is poisoned and byte-diffed afterwards, which is what checks the OTHER half of the
transcription — that a method touching one word touches exactly one word.

The TS side is the SHIPPED port, driven through the .mts driver. Bit patterns cross as hex strings.
"""
import ctypes, json, os, random, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader as L  # noqa: E402

DRIVER = os.path.join(HERE, "OZRenderState__TransformSet_rotation_driver.mts")
SYM = "_ZN13OZRenderState12TransformSet8rotationEb"
VA = 0x277180
PROLOGUE = bytes.fromhex("554889e5488b0789c181e1c73f")
ARENA = 0x40
POISON = 0xEE
M64 = (1 << 64) - 1


def main():
    L.require_x86_64()
    lib = L.load_framework("Ozone")
    slide, _ = L.image_slide("Ozone")
    got = ctypes.string_at(slide + VA, len(PROLOGUE))
    print(f"prologue @0x{VA:x}: {got.hex()}  expected: {PROLOGUE.hex()}")
    if got != PROLOGUE:
        print("PROLOGUE MISMATCH — refusing to report a result")
        return 1
    fn = getattr(lib, SYM, None)
    if fn is None:
        print(f"dlsym {SYM} failed")
        return 1
    fn.restype = None
    fn.argtypes = [ctypes.c_void_p, ctypes.c_uint64]   # %rdi = this, %rsi = the bool argument

    rng = random.Random(7)
    words = [0, 1, 0x38, 0x7, 0x1C0, 0x3800, 0x3FFF, 0x3FC7,
             0x4000, 0xFFFF, 0x1_0000_0000, 0xDEAD_BEEF_0000_0000,
             0x8000_0000_0000_0000, M64, 0xFFFF_FFFF, 0xFFFF_FFFF_FFFF]
    words += [rng.getrandbits(64) for _ in range(8)]
    # The argument as it arrives in %rsi. `testl %esi,%esi` looks at 32 bits, so the last two are
    # the interesting ones: a value whose LOW half is zero must take the OFF path however large it
    # is, and one with only a high byte set must still take the ON path.
    args = [0, 1, 2, 0x100, 0xFFFF_FFFF, 0x1_0000_0000]

    cases, bad, stray = [], 0, 0
    for w in words:
        for a in args:
            buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
            struct.pack_into("<Q", buf, 0, w)
            before = bytes(buf.raw)
            fn(ctypes.cast(buf, ctypes.c_void_p), ctypes.c_uint64(a))
            after = bytes(buf.raw)
            out = struct.unpack_from("<Q", after, 0)[0]
            if after[8:] != before[8:]:
                stray += 1
                print(f"  STRAY WRITE bits=0x{w:016x} arg=0x{a:x}")
            cases.append({"bits": f"{w:016x}", "arg": f"{a:016x}", "live": f"{out:016x}"})

    proc = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                          input=json.dumps(cases), capture_output=True, text=True)
    if proc.returncode != 0:
        print("TS driver failed:\n" + proc.stdout + proc.stderr)
        return 3
    rows = json.loads(proc.stdout)
    killed = {}
    for c, r in zip(cases, rows):
        for model, val in r.items():
            if val != c["live"]:
                killed[model] = killed.get(model, 0) + 1

    n = len(cases)
    bad = killed.get("port", 0)
    print(f"  live vs the SHIPPED port:   {n - bad}/{n}")
    print(f"  no byte outside +0x00..+0x08 touched: {n - stray}/{n}")
    print("NEGATIVE CONTROLS (wrong TS models, same run, scored against live):")
    for model, label in (
            ("complement_mask", "bits & ~0x38 (the symmetric model)"),
            ("or_on_both", "ORs on the OFF path too"),
            ("byte_test", "tests only the low BYTE of the argument"),
            ("no_truncate", "ANDs 0x3fc7 in 64 bits (no movl truncation)")):
        print(f"  {label:46s} killed {killed.get(model, 0)}/{n}")

    controls = ("complement_mask", "or_on_both", "byte_test", "no_truncate")
    dead = [m for m in controls if killed.get(m, 0) == 0]
    if dead:
        print(f"  NOTE: {', '.join(dead)} killed 0 — on this corpus that model is EQUIVALENT to the")
        print("  port, which is a statement about the corpus, not a pass. Say which in the report.")
    ok = not (bad or stray)
    print("OZRenderState::TransformSet::rotation(bool) oracle: "
          + ("VERIFIED" if ok else "DIVERGED"))
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
