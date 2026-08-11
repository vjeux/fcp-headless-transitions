#!/usr/bin/env python3
"""Differential oracle for PCAtomBoxFile::getWritePercentDone() @ProCore 0x25e94
(__ZN13PCAtomBoxFile19getWritePercentDoneEv, `nm` class T).

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/PCAtomBoxFile_getWritePercentDone_oracle.py

WHAT THE CORPUS IS BUILT AROUND. The body converts its two 64-bit fields to double by DIFFERENT
instructions: `cvtsi2sd` on +0x80 (SIGNED) and the magic-constant `unpcklps`/`subpd`/`haddpd`
sequence on +0x68 (UNSIGNED). A port that converts both the same way agrees on every ordinary input
and diverges wildly once bit 63 is set — the silent-wrong-answer shape. So the corpus is dense at
exactly that boundary: 0x8000000000000000 and its neighbours in BOTH fields, values above 2^53
where the conversion itself rounds, the int64 extremes, zero denominators, and randoms.

Results are compared as RAW IEEE-754 BIT PATTERNS, carried across the TS boundary as hex, so signed
zero and the NaN payload are part of the comparison rather than smoothed away by value equality.

THE ONE CASE NO PORT CAN MATCH, reported separately rather than hidden: 0/0 through `divsd` gives
x86's "indefinite" QNaN 0xfff8000000000000 (SIGN BIT SET) while JavaScript canonicalises every
arithmetic NaN to 0x7ff8000000000000. Both sides are NaN; neither is wrong; constructing the x86
payload in the port through a DataView would be a rewrite of `divsd`, not a transcription. Counted
as NAN_PAYLOAD, kept out of the verdict, and printed with its count — while a NaN where the machine
produced a finite number would still count as a real divergence.
"""
import ctypes, json, os, random, struct, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ozone_loader  # noqa: E402

FW = "ProCore"
VMADDR = 0x25E94
PROLOGUE = bytes((0x55, 0x48, 0x89, 0xE5, 0x48, 0x8B, 0x87))   # ... movq 0x80(%rdi),%rax
ARENA = 0x100
OFF_TOTAL = 0x68
OFF_WRITTEN = 0x80
POISON = 0xCD


def build_cases():
    rng = random.Random(0x25E94)
    edges = [0, 1, 2, 100, 1 << 31, (1 << 53) - 1, 1 << 53, (1 << 53) + 1,
             (1 << 63) - 1, 1 << 63, (1 << 63) + 1, (1 << 64) - 1, (1 << 62), 0xDEADBEEFCAFEBABE]
    cases = []
    for w in edges:
        for t in edges:
            cases.append((w, t))
    while len(cases) < 300:
        cases.append((rng.getrandbits(64), rng.getrandbits(64)))
    return cases[:300]


def main():
    ozone_loader.require_x86_64()
    ozone_loader.load_framework(FW)
    slide, image = ozone_loader.image_slide(FW)
    addr = slide + VMADDR
    got = ctypes.string_at(addr, len(PROLOGUE))
    if got != PROLOGUE:
        raise SystemExit("PROLOGUE MISMATCH at %#x: %s != %s — refusing to report"
                         % (addr, got.hex(), PROLOGUE.hex()))
    fn = ctypes.CFUNCTYPE(ctypes.c_double, ctypes.c_void_p)(addr)

    cases = build_cases()
    live, stray = [], 0
    for w, t in cases:
        recv = ctypes.create_string_buffer(bytes([POISON]) * ARENA, ARENA)
        base = ctypes.addressof(recv)
        ctypes.c_uint64.from_address(base + OFF_TOTAL).value = t
        ctypes.c_uint64.from_address(base + OFF_WRITTEN).value = w
        before = ctypes.string_at(base, ARENA)
        r = fn(base)
        after = ctypes.string_at(base, ARENA)
        stray += sum(1 for i in range(ARENA) if before[i] != after[i])
        live.append(struct.unpack("<Q", struct.pack("<d", r))[0])

    wire = [{"w": "%016x" % w, "t": "%016x" % t} for w, t in cases]
    driver = os.path.join(HERE, "PCAtomBoxFile_getWritePercentDone_driver.mts")
    p = subprocess.run(["node", "--experimental-strip-types", driver],
                       input=json.dumps(wire), capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit("TS driver failed:\n" + p.stdout + p.stderr)
    reply = json.loads(p.stdout)

    def is_nan(u):
        return (u & 0x7FF0000000000000) == 0x7FF0000000000000 and (u & 0xFFFFFFFFFFFFF) != 0

    def score(rows):
        wrong = nanonly = 0
        first = None
        for i, hexv in enumerate(rows):
            a, b = live[i], int(hexv, 16)
            if a == b:
                continue
            if is_nan(a) and is_nan(b):
                nanonly += 1
                continue
            wrong += 1
            if first is None:
                first = (i, a, b)
        return wrong, nanonly, first

    wrong, nanonly, first = score(reply["port"])
    print("PCAtomBoxFile::getWritePercentDone  @%s 0x%x  (image %s, slide %#x)"
          % (FW, VMADDR, os.path.basename(image), slide))
    print("prologue self-check: %s OK" % PROLOGUE.hex())
    print()
    print("cases=%d  REAL divergences=%d  NaN-payload-only=%d  stray receiver bytes=%d"
          % (len(cases), wrong, nanonly, stray))
    if first:
        i, a, b = first
        print("  first: case %d  w=%016x t=%016x  live=%016x  ts=%016x"
              % (i, cases[i][0], cases[i][1], a, b))
    print()
    print("NEGATIVE CONTROLS (wrong TS models, same node process):")
    for m in reply["mutants"]:
        w2, n2, _ = score(m["values"])
        note = "" if (w2 + n2) else "   <-- EQUIVALENT or BLIND, not a control that fired"
        print("  %-52s killed %d (+%d NaN-only)%s" % (m["name"], w2, n2, note))
    print()
    ok = wrong == 0 and stray == 0
    print("VERDICT: %s" % ("VERIFIED — 0 real divergences" if ok else "DIVERGED"))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
