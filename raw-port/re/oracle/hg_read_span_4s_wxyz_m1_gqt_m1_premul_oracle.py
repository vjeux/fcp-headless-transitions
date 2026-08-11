#!/usr/bin/env python3
"""Differential oracle for hg_read_span_4s_wxyz_m1_gqt_m1_premul @Helium 0x18adf0.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/hg_read_span_4s_wxyz_m1_gqt_m1_premul_oracle.py

WHAT IT COMPARES. The live kernel — a LOCAL `nm` type `t` symbol, so `dlsym`
cannot reach it and it is called at dyld slide + 0x18adf0 through ozone_loader —
against the SHIPPED TypeScript module, run through tsx by
`hg_read_span_4s_wxyz_m1_gqt_m1_premul_driver.ts`. Not a Python restatement of
the port: an oracle that compares live FCP to a model measures the model
(OPS_LOG). Outputs cross the wire as RAW u32 BIT PATTERNS.

THE SLICE. Every address in the port is transcribed from the x86_64 slice while
a dlopen'd image on this machine is arm64, so the harness refuses to run outside
`arch -x86_64` and the prologue bytes at slide + 0x18adf0 are read back and
compared with the disassembly before any number is reported.

COVERAGE. The binary has three code paths and the corpus is built to reach all
of them and their boundaries:
  * counts 0..9 and 16/17/31/32 — every combination of head loop, 2-pixel main
    loop and 1-pixel tail, plus the count<=0 early-out;
  * the source is placed at each 2-byte misalignment 0..14, so the head loop
    runs for a different number of pixels each time. At src%16 == 2, 6, 10, 14
    the alignment test can NEVER succeed and the WHOLE span goes through the
    head loop — that asymmetry is itself a test of the transcription;
  * samples include 0, 0xffff and values on both sides of the bias, so `w` is
    negative, zero and positive, and biases include one that drives alpha to
    exactly 0 (the max(EPS, alpha) floor) and one that makes it negative;
  * matrices sized so the quotient lands below, at and above the 1.32 clamp,
    and one all-negative matrix so the sign splice is not dead code.

CONTROLS. Six mutants of the SHIPPED module (copied to /tmp, one instruction
changed each, never written into raw-port/src) plus the unmutated copy as M0.
A mutant that kills 0 is reported with the more violent variant of the SAME
instruction, which is what distinguishes an equivalent mutant from a blind
harness (OPS_LOG).
"""
import ctypes, json, os, random, shutil, struct, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__Z37hg_read_span_4s_wxyz_m1_gqt_m1_premulPviPKvPK25hgColorGammaTransformDatai"
VA = 0x18ADF0
# testl %esi,%esi ; jle 0x18b2e6 ; pushq %rbp ; movq %rsp,%rbp
PROLOGUE = bytes.fromhex("85f60f8eee040000554889e5")
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TSX = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
NAME = "hg_read_span_4s_wxyz_m1_gqt_m1_premul"
DRIVER = os.path.join(REPO, "raw-port", "re", "oracle", f"{NAME}_driver.ts")
MODULE = os.path.join(REPO, "raw-port", "src", "render", f"{NAME}.ts")
POISON = 0x7FC0DEAD


def fb(x):
    return struct.unpack("<I", struct.pack("<f", x))[0]


def aligned(nbytes, align=16):
    raw = ctypes.create_string_buffer(nbytes + align)
    addr = ctypes.addressof(raw)
    return addr + (-addr) % align, raw


# ── the corpus ───────────────────────────────────────────────────────────────
MATRICES = [
    # A near-identity, B near-identity: the quotient stays small
    (([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0]),
     ([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0])),
    # a colour-matrix-looking pair with a small A so t lands under the clamp
    (([4.5e-5, 1.2e-5, 0.3e-5, 0.0], [2.1e-5, 7.1e-5, 0.7e-5, 0.0],
      [0.2e-5, 1.1e-5, 9.5e-5, 0.0]),
     ([1.9, -0.5, -0.3, 0.0], [-0.9, 1.8, 0.04, 0.0], [0.07, -0.2, 1.05, 0.0])),
    # negative A rows: t < 0, so the andps/orps sign splice matters
    (([-1.5e-4, 0.25e-4, -0.75e-4, 0.0], [2.0e-4, -3.0e-4, 0.125e-4, 0.0],
      [-0.5e-4, -0.5e-4, -0.5e-4, 0.0]),
     ([1.0, 1.0, 1.0, 0.0], [-1.0, -1.0, -1.0, 0.0], [0.5, -0.5, 0.5, 0.0])),
    # large A: every quotient saturates the 1.32 clamp
    (([40.0, 40.0, 40.0, 40.0], [-40.0, 60.0, -80.0, 100.0], [1.0, 1.0, 1.0, 1.0]),
     ([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0])),
    # zero A: dotA is +0/-0 exactly, so the splice runs on a zero
    (([0.0, 0.0, 0.0, 0.0], [0.0, -0.0, 0.0, 0.0], [-0.0, 0.0, 0.0, 0.0]),
     ([1.0, 2.0, 3.0, 4.0], [4.0, 3.0, 2.0, 1.0], [0.0, 0.0, 0.0, 0.0])),
]
BIASES = [
    [0.0, 0.0, 0.0, 0.0],
    [1.0, 2.0, 3.0, 4.0],
    [-100.0, 0.5, 65535.0, 0.0],
    # bias[3] == 65535 drives alpha to <= 0 for every sample: the EPS floor
    [0.0, 0.0, 0.0, 65535.0],
]
COUNTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 17, 31, 32]
MISALIGNS = [0, 2, 4, 6, 8, 10, 12, 14]


def build_cases():
    random.seed(20260811)
    cases = []
    for count in COUNTS:
        for mis in MISALIGNS:
            mi = (count + mis) % len(MATRICES)
            bi = (count + mis) % len(BIASES)
            (a0, a1, a2), (b0, b1, b2) = MATRICES[mi]
            bias = BIASES[bi]
            n = max(count, 1) * 4
            samples = []
            for _ in range(n):
                r = random.random()
                samples.append(0 if r < 0.1 else 0xFFFF if r < 0.2 else random.getrandbits(16))
            cases.append({
                "srcByteOffset": mis,
                "samples": samples,
                "count": count,
                "a0Bits": [fb(x) for x in a0], "a1Bits": [fb(x) for x in a1],
                "a2Bits": [fb(x) for x in a2], "b0Bits": [fb(x) for x in b0],
                "b1Bits": [fb(x) for x in b1], "b2Bits": [fb(x) for x in b2],
                "biasBits": [fb(x) for x in bias],
                "_tag": f"count={count} mis={mis} m{mi} b{bi}",
            })
    return cases


def run_native(fn, cases):
    out = []
    for c in cases:
        nsamp = len(c["samples"])
        base, _k1 = aligned(c["srcByteOffset"] + nsamp * 2 + 32)
        src_at = base + c["srcByteOffset"]
        for i, s in enumerate(c["samples"]):
            ctypes.memmove(src_at + i * 2, struct.pack("<H", s), 2)

        ndst = max(c["count"], 0) * 4 + 8
        dstp, _k2 = aligned(ndst * 4)
        pat = struct.pack("<I", POISON)
        for i in range(ndst):
            ctypes.memmove(dstp + i * 4, pat, 4)

        datap, _k3 = aligned(0x110)
        ctypes.memset(datap, 0, 0x110)
        for off, key in ((0x00, "a0Bits"), (0x10, "a1Bits"), (0x20, "a2Bits"),
                         (0x40, "b0Bits"), (0x50, "b1Bits"), (0x60, "b2Bits"),
                         (0x100, "biasBits")):
            for i, b in enumerate(c[key]):
                ctypes.memmove(datap + off + i * 4, struct.pack("<I", b), 4)

        fn(ctypes.c_void_p(dstp), c["count"], ctypes.c_void_p(src_at),
           ctypes.c_void_p(datap), 0)
        out.append(list(struct.unpack(f"<{ndst}I", ctypes.string_at(dstp, ndst * 4))))
    return out


def run_ts(driver, cases):
    payload = json.dumps([{k: v for k, v in c.items() if not k.startswith("_")}
                          for c in cases])
    p = subprocess.run([TSX, driver], input=payload, capture_output=True,
                       text=True, cwd=REPO)
    if p.returncode != 0:
        raise SystemExit(f"TS driver failed ({driver}):\n{p.stdout}\n{p.stderr}")
    return json.loads(p.stdout)


def score(native, ts):
    """EXACT / DIVERGED per lane. This kernel's corpus is all finite (u16 samples
    and finite matrices), so unlike the 4f sibling there is no NaN-sign class to
    separate: every lane must match bit for bit."""
    lanes = exact = bad = 0
    fails = []
    for i, (nat, port) in enumerate(zip(native, ts)):
        for j, (x, y) in enumerate(zip(nat, port)):
            lanes += 1
            if x == y:
                exact += 1
            else:
                bad += 1
                if len(fails) < 8:
                    fails.append((i, j, x, y))
    return lanes, exact, bad, fails


# ── mutation controls ────────────────────────────────────────────────────────
MUTANTS = [
    ("M1 shufps $0x39 dropped (no wxyz->xyzw rotate)",
     "const w0 = Math.fround(src[sp + 1] - bias[0]);\n"
     "    const w1 = Math.fround(src[sp + 2] - bias[1]);\n"
     "    const w2 = Math.fround(src[sp + 3] - bias[2]);\n"
     "    const w3 = Math.fround(src[sp + 0] - bias[3]);",
     "const w0 = Math.fround(src[sp + 0] - bias[0]);\n"
     "    const w1 = Math.fround(src[sp + 1] - bias[1]);\n"
     "    const w2 = Math.fround(src[sp + 2] - bias[2]);\n"
     "    const w3 = Math.fround(src[sp + 3] - bias[3]);"),
    ("M2 haddps pairing -> left-to-right accumulation",
     "Math.fround(Math.fround(r[0] * v[0]) + Math.fround(r[1] * v[1])) +\n"
     "          Math.fround(Math.fround(r[2] * v[2]) + Math.fround(r[3] * v[3])),",
     "Math.fround(Math.fround(Math.fround(r[0] * v[0]) + Math.fround(r[1] * v[1])) +\n"
     "          Math.fround(r[2] * v[2])) + Math.fround(r[3] * v[3]),"),
    ("M3 maxps operand order -> (alpha > EPS) ? alpha : EPS",
     "const den0 = EPS > alpha ? EPS : alpha;",
     "const den0 = alpha > EPS ? alpha : EPS;"),
    ("M4 minps clamp removed (t' = |t|)",
     "const tc = absT < CLAMP ? absT : CLAMP;", "const tc = absT;"),
    ("M5 orps sign splice dropped (curve keeps its own sign)",
     "const signed = fromBits((bits(t) & SIGN_MASK) | bits(curve));",
     "const signed = curve;"),
    ("M6 the re-premultiply dropped (pm = signed)",
     "pm[lane] = Math.fround(signed * alpha);", "pm[lane] = signed;"),
    ("M7 head-loop alignment test inverted",
     "if ((srcByte & 0xf) !== 0) {", "if ((srcByte & 0xf) === 0) {"),
]
VIOLENT = {
    "M3": ("M3v the same maxps floor, EPS -> 1e30 (violent)",
           "const den0 = EPS > alpha ? EPS : alpha;", "const den0 = 1e30;"),
    "M4": ("M4v the same minps, ceiling 1.32 -> 1e-3 (violent)",
           "const tc = absT < CLAMP ? absT : CLAMP;",
           "const tc = absT < 1e-3 ? absT : 1e-3;"),
    # NOTE the shape of this one. Forcing the head loop to run for every span
    # kills NOTHING, and that is not a blind harness: the three code paths
    # compute the SAME expression (the split exists so the main loop can use an
    # aligned load), so ANY mutation of the path SELECTION is equivalent by
    # construction and no output-comparing oracle can see it. What the corpus
    # must prove instead is that the head loop is REACHED at all, so the violent
    # variant corrupts the head loop's own cursor advance.
    "M7": ("M7v the same head loop, advancing the source cursor by 8 samples "
           "instead of 4 (violent — proves the head loop RUNS)",
           "      srcPix += 4; // @0x18af75 leaq 0x8(%r8),%r9 : +8 BYTES = 4 samples",
           "      srcPix += 8; // MUTANT"),
    "M2": ("M2v the same reduction, dropping the fourth product entirely (violent)",
           "Math.fround(Math.fround(r[0] * v[0]) + Math.fround(r[1] * v[1])) +\n"
           "          Math.fround(Math.fround(r[2] * v[2]) + Math.fround(r[3] * v[3])),",
           "Math.fround(Math.fround(r[0] * v[0]) + Math.fround(r[1] * v[1])) +\n"
           "          Math.fround(r[2] * v[2]),"),
}


def mutant_run(tmp, name, old, new, cases):
    src = open(MODULE).read()
    if old not in src:
        raise SystemExit(f"MUTATION DID NOT APPLY ({name}) — the control would be vacuous")
    open(os.path.join(tmp, "mod.ts"), "w").write(src.replace(old, new, 1))
    drv_src = open(DRIVER).read()
    marker = f'"../../src/render/{NAME}.js"'
    if marker not in drv_src:
        raise SystemExit("driver import marker not found — cannot build the mutant driver")
    drv = os.path.join(tmp, "driver.ts")
    open(drv, "w").write(drv_src.replace(marker, '"./mod.js"'))
    return run_ts(drv, cases)


def main():
    L.require_x86_64()
    fn, addr, slide = L.local_fn(
        "Helium", SYM, None,
        [ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int])
    assert addr == VA, f"symbol moved: {addr:#x} != {VA:#x}"
    got = ctypes.string_at(slide + VA, len(PROLOGUE))
    assert got == PROLOGUE, f"prologue mismatch at {slide + VA:#x}: {got.hex()}"
    print(f"slide={slide:#x} vmaddr={addr:#x} prologue={got.hex()} OK")

    cases = build_cases()
    native = run_native(fn, cases)
    ts = run_ts(DRIVER, cases)
    lanes, exact, bad, fails = score(native, ts)
    print(f"SPANS={len(cases)} LANES={lanes} EXACT={exact} DIVERGED={bad}")
    for i, j, x, y in fails:
        print(f"  FAIL {cases[i]['_tag']} lane={j} native={x:#010x} port={y:#010x}")

    print("CONTROLS (mutants of the SHIPPED module, run through the same driver):")
    tmp = tempfile.mkdtemp(prefix="w5_mut_")
    try:
        base = mutant_run(tmp, "M0 base", "const ONE = Math.fround(1.0);",
                          "const ONE = Math.fround(1.0);", cases)
        _, _, m0bad, _ = score(native, base)
        print(f"  M0 unmutated copy through the mutation pipeline: {m0bad} killed"
              f"  {'(expected 0)' if m0bad == 0 else '<<< PIPELINE BROKEN'}")
        for name, old, new in MUTANTS:
            _, _, mbad, _ = score(native, mutant_run(tmp, name, old, new, cases))
            print(f"  {name}: {mbad}/{lanes} killed" + ("  <<< DEAD CONTROL" if not mbad else ""))
            key = name.split()[0]
            if mbad == 0 and key in VIOLENT:
                vn, vo, vnew = VIOLENT[key]
                _, _, vbad, _ = score(native, mutant_run(tmp, vn, vo, vnew, cases))
                verdict = ("the harness DOES observe that code, so the dead control is an "
                           "EQUIVALENT MUTANT on this corpus"
                           if vbad else "the harness CANNOT see that code at all")
                print(f"    {vn}: {vbad}/{lanes} killed -> {verdict}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    print("ORACLE:", "VERIFIED" if bad == 0 else "DIVERGED")
    return 0 if bad == 0 else 1


sys.exit(main())
