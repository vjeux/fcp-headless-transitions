#!/usr/bin/env python3
"""Differential oracle for OZRenderState::TransformSet's flag setters — rotation(bool) @Ozone
0x277180 and translation(bool) @Ozone 0x2771e0, swept together because they are the same body with
different masks and the same reading is wrong for both.

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
DRIVER_TIMEOUT = int(__import__("os").environ.get("FCT_DRIVER_TIMEOUT", "120"))

DRIVER = os.path.join(HERE, "OZRenderState__TransformSet_rotation_driver.mts")
# (export name, mangled symbol, VA, the prologue bytes through the AND immediate)
METHODS = [
    ("rotation",    "_ZN13OZRenderState12TransformSet8rotationEb",    0x277180,
     "554889e5488b0789c181e1c73f0000"),
    # translation's ON immediate does not fit in an imm8, so it encodes as `48 0d imm32` — and that
    # is the instruction otool renders as an ObjC selector. The prologue check covers the AND; the
    # OR's bytes are asserted separately below, since that constant is the one the disassembly lies
    # about.
    ("translation", "_ZN13OZRenderState12TransformSet11translationEb", 0x2771E0,
     "554889e5488b0789c181e1ff070000"),
]
OR_BYTES = {"rotation": "4883c838", "translation": "480d00380000"}
ARENA = 0x40
POISON = 0xEE
M64 = (1 << 64) - 1


def main():
    L.require_x86_64()
    lib = L.load_framework("Ozone")
    slide, _ = L.image_slide("Ozone")
    fns = {}
    for name, sym, va, prologue in METHODS:
        exp = bytes.fromhex(prologue)
        got = ctypes.string_at(slide + va, len(exp))
        print(f"prologue {name} @0x{va:x}: {got.hex()}  expected: {exp.hex()}")
        if got != exp:
            print("PROLOGUE MISMATCH — refusing to report a result")
            return 1
        # the OR immediate, read as bytes: this is the constant the disassembly mis-symbolizes
        orb = bytes.fromhex(OR_BYTES[name])
        window = ctypes.string_at(slide + va, 0x20)
        if orb not in window:
            print(f"{name}: OR encoding {orb.hex()} not found in the body — refusing")
            return 1
        fn = getattr(lib, sym, None)
        if fn is None:
            print(f"dlsym {sym} failed")
            return 1
        fn.restype = None
        fn.argtypes = [ctypes.c_void_p, ctypes.c_uint64]  # %rdi = this, %rsi = the bool argument
        fns[name] = fn

    rng = random.Random(7)
    words = [0, 1, 0x38, 0x7, 0x1C0, 0x3800, 0x3FFF, 0x3FC7,
             0x4000, 0xFFFF, 0x1_0000_0000, 0xDEAD_BEEF_0000_0000,
             0x8000_0000_0000_0000, M64, 0xFFFF_FFFF, 0xFFFF_FFFF_FFFF]
    words += [rng.getrandbits(64) for _ in range(8)]
    # The argument as it arrives in %rsi. `testl %esi,%esi` looks at 32 bits, so the last two are
    # the interesting ones: a value whose LOW half is zero must take the OFF path however large it
    # is, and one with only a high byte set must still take the ON path.
    args = [0, 1, 2, 0x100, 0xFFFF_FFFF, 0x1_0000_0000]

    cases, stray = [], 0
    for name, _sym, _va, _p in METHODS:
        for w in words:
            for a in args:
                buf = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
                struct.pack_into("<Q", buf, 0, w)
                before = bytes(buf.raw)
                fns[name](ctypes.cast(buf, ctypes.c_void_p), ctypes.c_uint64(a))
                after = bytes(buf.raw)
                out = struct.unpack_from("<Q", after, 0)[0]
                if after[8:] != before[8:]:
                    stray += 1
                    print(f"  STRAY WRITE {name} bits=0x{w:016x} arg=0x{a:x}")
                cases.append({"method": name, "bits": f"{w:016x}", "arg": f"{a:016x}",
                              "live": f"{out:016x}"})

    proc = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                          input=json.dumps(cases), capture_output=True, text=True, timeout=DRIVER_TIMEOUT)
    if proc.returncode != 0:
        print("TS driver failed:\n" + proc.stdout + proc.stderr)
        return 3
    rows = json.loads(proc.stdout)
    killed = {}
    for c, r in zip(cases, rows):
        for model, val in r.items():
            if val != c["live"]:
                killed.setdefault(c["method"], {})
                killed[c["method"]][model] = killed[c["method"]].get(model, 0) + 1

    per = len(cases) // len(METHODS)
    bad = sum(killed.get(m[0], {}).get("port", 0) for m in METHODS)
    print(f"  live vs the SHIPPED port:   {len(cases) - bad}/{len(cases)}")
    print(f"  no byte outside +0x00..+0x08 touched: {len(cases) - stray}/{len(cases)}")
    print("NEGATIVE CONTROLS (wrong TS models, same run, scored against live):")
    for name, _s, _v, _p in METHODS:
        k = killed.get(name, {})
        print(f"  {name}:")
        for model, label in (
                ("complement_mask", "bits & ~mask (the symmetric model)"),
                ("or_on_both", "ORs on the OFF path too"),
                ("byte_test", "tests only the low BYTE of the argument"),
                ("no_truncate", "ANDs in 64 bits (no movl truncation)")):
            print(f"    {label:44s} killed {k.get(model, 0)}/{per}")

    controls = ("complement_mask", "or_on_both", "byte_test", "no_truncate")
    dead = sorted({m for name, _s, _v, _p in METHODS for m in controls
                   if killed.get(name, {}).get(m, 0) == 0})
    if dead:
        print(f"  NOTE: {', '.join(dead)} killed 0 — on this corpus that model is EQUIVALENT to the")
        print("  port, which is a statement about the corpus, not a pass. Say which in the report.")
    ok = not (bad or stray)
    print("OZRenderState::TransformSet flag setters oracle: "
          + ("VERIFIED" if ok else "DIVERGED"))
    return 0 if ok else 2


if __name__ == "__main__":
    sys.exit(main())
