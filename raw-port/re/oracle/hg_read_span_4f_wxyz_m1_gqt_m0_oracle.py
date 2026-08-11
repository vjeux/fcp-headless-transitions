#!/usr/bin/env python3
"""Differential oracle for hg_read_span_4f_wxyz_m1_gqt_m0 @Helium 0x83fa0.

    arch -x86_64 /usr/bin/python3 \\
      raw-port/re/oracle/hg_read_span_4f_wxyz_m1_gqt_m0_oracle.py

WHAT IT COMPARES. The live kernel — a LOCAL `nm` type `t` symbol, so `dlsym`
cannot reach it and it is called at dyld slide + 0x83fa0 through ozone_loader —
against the SHIPPED TypeScript module, run through tsx by
`hg_read_span_4f_wxyz_m1_gqt_m0_driver.ts`. Not a Python restatement of the
port: an oracle that compares live FCP to a model measures the model (OPS_LOG).
Outputs cross the wire as RAW u32 BIT PATTERNS, so signed zero and NaN payloads
are compared exactly and no bare NaN ever has to survive JSON.

THE SLICE. Every address in the port is transcribed from the x86_64 slice while
a dlopen'd image on this machine is arm64, so the whole harness refuses to run
outside `arch -x86_64` (L.require_x86_64) and the prologue bytes at
slide + 0x83fa0 are read back and compared with the disassembly before any
number is reported.

COVERAGE. The kernel has one arithmetic path and a software-pipelined load, so
the corpus is built to reach the three places where a plausible-but-wrong
transcription hides:
  * counts 0,1,2,3,4,5,8,17 — count<=0 returns untouched; count==1 is the path
    where the `cmpl $0x2` preload guard is what stops a read past the span;
  * matrices chosen so the dot products land BELOW the 1.32 clamp, ABOVE it,
    and NEGATIVE (the `andps`/`minps`/`orps` sign-splice triad is dead code
    unless all three occur), plus a zero matrix so dot == +0 and -0;
  * sources including 0, -0, denormals, +-inf and NaN, so `minps`'s NaN rule
    (return the memory operand, unlike Math.min) is exercised;
  * biases that make v negative and that make the alpha lane exactly 0.

CONTROLS. Five mutants of the SHIPPED module (copied to /tmp, one instruction
changed each, never written into raw-port/src) plus the unmutated copy as M0.
A mutant that kills 0 lanes is reported as either an equivalent mutant or a
blind harness, with the more violent variant run to tell them apart (OPS_LOG).
"""
import ctypes, json, os, struct, subprocess, sys, tempfile, shutil

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozone_loader as L  # noqa: E402

SYM = "__Z30hg_read_span_4f_wxyz_m1_gqt_m0PviPKvPK25hgColorGammaTransformDatai"
VA = 0x83FA0
# testl %esi,%esi ; jle 0x840c4 ; pushq %rbp ; movq %rsp,%rbp  — the first four
# instructions of the disassembly this port was transcribed from.
PROLOGUE = bytes.fromhex("85f60f8e1c010000554889e5")
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
TSX = os.path.join(REPO, "raw-port", "node_modules", ".bin", "tsx")
DRIVER = os.path.join(REPO, "raw-port", "re", "oracle",
                      "hg_read_span_4f_wxyz_m1_gqt_m0_driver.ts")
MODULE = os.path.join(REPO, "raw-port", "src", "render",
                      "hg_read_span_4f_wxyz_m1_gqt_m0.ts")


def fb(x):
    """float -> u32 bit pattern (rounded to float32, like every value here)."""
    return struct.unpack("<I", struct.pack("<f", x))[0]


def aligned(nbytes, align=16):
    """A buffer whose data pointer is `align`-aligned, plus the keepalive."""
    raw = ctypes.create_string_buffer(nbytes + align)
    addr = ctypes.addressof(raw)
    off = (-addr) % align
    return addr + off, raw


# ── the corpus ───────────────────────────────────────────────────────────────
INF = float("inf")
NAN = float("nan")
DENORM = struct.unpack("<f", struct.pack("<I", 0x00000001))[0]

MATRICES = [
    # identity-ish: dots stay small, well under the 1.32 clamp
    ([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, 1.0, 0.0]),
    # a real-looking Rec.709 -> XYZ style matrix
    ([0.4124, 0.3576, 0.1805, 0.0], [0.2126, 0.7152, 0.0722, 0.0],
     [0.0193, 0.1192, 0.9505, 0.0]),
    # negative rows: drives dot < 0 so the sign splice matters
    ([-1.5, 0.25, -0.75, 0.5], [2.0, -3.0, 0.125, -0.0625], [-0.5, -0.5, -0.5, -0.5]),
    # large: every dot saturates the 1.32 clamp
    ([40.0, 40.0, 40.0, 40.0], [-40.0, 60.0, -80.0, 100.0], [1e30, 1.0, 1.0, 1.0]),
    # zero matrix: dot is +0/-0 exactly, the sign splice on a zero
    ([0.0, 0.0, 0.0, 0.0], [0.0, -0.0, 0.0, 0.0], [-0.0, 0.0, 0.0, 0.0]),
]
BIASES = [
    [0.0, 0.0, 0.0, 0.0],
    [0.25, -0.5, 1.0, 0.125],
    [1.0, 1.0, 1.0, 1.0],
]
# 4 float32 per pixel, WXYZ order (the w sample comes FIRST in memory)
PIXELS = [
    [1.0, 0.5, 0.25, 0.75],
    [0.0, -0.0, DENORM, -DENORM],
    [-1.0, -2.5, 3.5, 0.0],
    [65504.0, 1e-8, 1e8, 0.5],
    [INF, 1.0, 0.0, -INF],
    [NAN, 0.5, 1.0, 2.0],
    [0.9, 0.8, 0.7, 0.6],
    [-0.1, 0.2, -0.3, 0.4],
    [1e30, -1e30, 1.0, 1.0],
    [0.3333333, 0.6666667, 1.3199999, 1.3200001],
    [2.0, 2.0, 2.0, 2.0],
    [-5.0, -5.0, -5.0, -5.0],
    [0.05, 0.10, 0.15, 0.20],
    [7.5, -7.5, 0.001, -0.001],
    [1.0, 1.0, 1.0, 1.0],
    [0.5, 0.5, 0.5, 0.5],
    [123.456, -654.321, 0.000123, 9999.0],
]
COUNTS = [0, 1, 2, 3, 4, 5, 8, 17]


def build_cases():
    cases = []
    ci = 0
    for count in COUNTS:
        for mi, (r0, r1, r2) in enumerate(MATRICES):
            for bi, bias in enumerate(BIASES):
                n = max(count, 0) * 4
                src = []
                for p in range(max(count, 0)):
                    src.extend(PIXELS[(ci + p) % len(PIXELS)])
                ci += 1
                cases.append({
                    "srcBits": [fb(x) for x in src],
                    "count": count,
                    "row0Bits": [fb(x) for x in r0],
                    "row1Bits": [fb(x) for x in r1],
                    "row2Bits": [fb(x) for x in r2],
                    "biasBits": [fb(x) for x in bias],
                    "_tag": f"count={count} m{mi} b{bi}",
                })
                assert len(src) == n
    return cases


def run_native(fn, cases):
    """Call the live kernel once per case, returning the destination as u32s."""
    out = []
    for c in cases:
        nsrc = max(len(c["srcBits"]), 4)
        srcp, _k1 = aligned(nsrc * 4)
        for i, b in enumerate(c["srcBits"]):
            ctypes.memmove(srcp + i * 4, struct.pack("<I", b), 4)

        ndst = max(c["count"], 0) * 4 + 8
        dstp, _k2 = aligned(ndst * 4)
        poison = struct.pack("<I", 0x7FC0DEAD)   # a quiet NaN with a payload
        for i in range(ndst):
            ctypes.memmove(dstp + i * 4, poison, 4)

        datap, _k3 = aligned(0x110)
        ctypes.memset(datap, 0, 0x110)
        for off, key in ((0x00, "row0Bits"), (0x10, "row1Bits"),
                         (0x20, "row2Bits"), (0x100, "biasBits")):
            for i, b in enumerate(c[key]):
                ctypes.memmove(datap + off + i * 4, struct.pack("<I", b), 4)

        fn(ctypes.c_void_p(dstp), c["count"], ctypes.c_void_p(srcp),
           ctypes.c_void_p(datap), 0)
        blob = ctypes.string_at(dstp, ndst * 4)
        out.append(list(struct.unpack(f"<{ndst}I", blob)))
    return out


def run_ts(driver, cases, cwd=REPO):
    payload = json.dumps([{k: v for k, v in c.items() if not k.startswith("_")}
                          for c in cases])
    p = subprocess.run([TSX, driver], input=payload, capture_output=True,
                       text=True, cwd=cwd)
    if p.returncode != 0:
        raise SystemExit(f"TS driver failed ({driver}):\n{p.stdout}\n{p.stderr}")
    return json.loads(p.stdout)


def is_nanish(bits_):
    """True for a float32 bit pattern that is NaN or +-Inf."""
    return (bits_ & 0x7F800000) == 0x7F800000


def score(native, ts, cases=None):
    """Classify every lane.

    Three buckets, because one of them is a property of JS's number type rather
    than of the transcription:
      * EXACT        — identical u32.
      * SIGN_ONLY    — the two differ in the sign bit and nothing else, in a
                       span whose inputs contain a NaN or an infinity. x86's
                       default QNaN (from inf-inf or 0*inf) is 0xffc00000, sign
                       SET, and this kernel's `orps` splice @0x8408a copies that
                       sign onto the curve — so a NaN intermediate steers the
                       sign of an otherwise FINITE result. A JS `number` cannot
                       carry a NaN's sign at all (V8 canonicalises to
                       0x7fc00000), so no arithmetic-domain port can reproduce
                       it; see the port header's NUMERICS note.
      * DIVERGED     — anything else. This is the bucket that must be empty.
    """
    lanes = exact = sign_only = diverged = 0
    fails = []
    signs = []
    for i, (nat, port) in enumerate(zip(native, ts)):
        nanish_input = False
        if cases is not None:
            nanish_input = any(is_nanish(b) for b in cases[i]["srcBits"]) or \
                any(is_nanish(b) for k in ("row0Bits", "row1Bits", "row2Bits", "biasBits")
                    for b in cases[i][k])
        for j, (x, y) in enumerate(zip(nat, port)):
            lanes += 1
            if x == y:
                exact += 1
            elif (x ^ y) == 0x80000000 and nanish_input:
                sign_only += 1
                if len(signs) < 4:
                    signs.append((i, j, x, y))
            else:
                diverged += 1
                if len(fails) < 8:
                    fails.append((i, j, x, y))
    return lanes, exact, sign_only, diverged, fails, signs


# ── mutation controls: mutate the SHIPPED module, in /tmp ────────────────────
# Each entry is (name, old, new). The replacement is asserted to have applied —
# a mutation that silently did not fire is a control that proves nothing.
MUTANTS = [
    ("M1 shufps $0x39 dropped (no wxyz->xyzw rotate)",
     "const v0 = Math.fround(cur1 - bias[0]);\n    const v1 = Math.fround(cur2 - bias[1]);"
     "\n    const v2 = Math.fround(cur3 - bias[2]);\n    const v3 = Math.fround(cur0 - bias[3]);",
     "const v0 = Math.fround(cur0 - bias[0]);\n    const v1 = Math.fround(cur1 - bias[1]);"
     "\n    const v2 = Math.fround(cur2 - bias[2]);\n    const v3 = Math.fround(cur3 - bias[3]);"),
    ("M2 haddps pairing -> left-to-right accumulation",
     "Math.fround(Math.fround(r[0] * v0) + Math.fround(r[1] * v1)) +\n"
     "          Math.fround(Math.fround(r[2] * v2) + Math.fround(r[3] * v3)),",
     "Math.fround(Math.fround(Math.fround(r[0] * v0) + Math.fround(r[1] * v1)) +\n"
     "          Math.fround(r[2] * v2)) + Math.fround(r[3] * v3),"),
    ("M3 minps NaN rule -> Math.min",
     "const t = absd < CLAMP ? absd : CLAMP;",
     "const t = Math.min(absd, CLAMP);"),
    ("M4 orps sign splice dropped (curve keeps its own sign)",
     "const signed = fromBits((bits(d) & SIGN_MASK) | bits(curve));",
     "const signed = curve;"),
    ("M5 preload guard `esi !== 2` removed (reads one pixel past the span)",
     "if (esi !== 2) {", "if (true) {"),
]
# Run only when the mutant above it scores 0. A dead control means EITHER the
# harness cannot see that instruction OR the mutant is equivalent, and the only
# cheap way to tell them apart is to mutate the SAME instruction more violently
# (OPS_LOG): if the violent version kills, the harness sees it and the first
# mutant was equivalent on this corpus.
VIOLENT = {
    "M3": ("M3v minps ceiling 1.32 -> 1e30 (same instruction, violent)",
           "const t = absd < CLAMP ? absd : CLAMP;",
           "const t = absd < 1e30 ? absd : 1e30;"),
    "M5": ("M5v the same preload, reading pixel+2 instead of pixel+1 (violent)",
           "const p = (rax >> 2) + 4;", "const p = (rax >> 2) + 8;"),
}


def mutant_run(tmp, name, old, new, cases):
    """Copy the shipped module + driver to /tmp, apply one edit, run the driver."""
    src = open(MODULE).read()
    if old not in src:
        raise SystemExit(f"MUTATION DID NOT APPLY ({name}) — the control would be vacuous")
    mod = os.path.join(tmp, "mod.ts")
    open(mod, "w").write(src.replace(old, new, 1))
    drv_src = open(DRIVER).read()
    marker = '"../../src/render/hg_read_span_4f_wxyz_m1_gqt_m0.js"'
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
    finite = [c for c in cases if not (
        any(is_nanish(b) for b in c["srcBits"]) or
        any(is_nanish(b) for k in ("row0Bits", "row1Bits", "row2Bits", "biasBits")
            for b in c[k]))]
    native = run_native(fn, cases)
    ts = run_ts(DRIVER, cases)
    lanes, exact, sign_only, bad, fails, signs = score(native, ts, cases)
    print(f"SPANS={len(cases)} LANES={lanes} EXACT={exact} "
          f"SIGN_ONLY(NaN-fed)={sign_only} DIVERGED={bad}")
    for i, j, x, y in fails:
        print(f"  FAIL {cases[i]['_tag']} lane={j} native={x:#010x} port={y:#010x}")
    for i, j, x, y in signs:
        print(f"  sign-only {cases[i]['_tag']} lane={j} native={x:#010x} port={y:#010x}")

    # The primary claim: over spans with NO NaN and NO infinity anywhere in the
    # inputs, the port is bit-exact. Everything above that is not exact must be
    # in the NaN-fed sign class, and this run proves the two sets are disjoint.
    fnative = run_native(fn, finite)
    fts = run_ts(DRIVER, finite)
    flanes, fexact, fsign, fbad, ffails, _ = score(fnative, fts, finite)
    print(f"FINITE-INPUT SUBSET: SPANS={len(finite)} LANES={flanes} EXACT={fexact} "
          f"SIGN_ONLY={fsign} DIVERGED={fbad}")
    for i, j, x, y in ffails:
        print(f"  FAIL {finite[i]['_tag']} lane={j} native={x:#010x} port={y:#010x}")

    print("CONTROLS (mutants of the SHIPPED module, run through the same driver):")
    tmp = tempfile.mkdtemp(prefix="w5_mut_")
    try:
        # M0 — the unmutated copy, to prove the /tmp pipeline itself is faithful.
        base = mutant_run(tmp, "M0 base", "const ONE = Math.fround(1.0);",
                          "const ONE = Math.fround(1.0);", cases)
        _, _, _, m0bad, _, _ = score(native, base, cases)
        print(f"  M0 unmutated copy through the mutation pipeline: {m0bad} killed"
              f"  {'(expected 0)' if m0bad == 0 else '<<< PIPELINE BROKEN'}")
        for name, old, new in MUTANTS:
            out = mutant_run(tmp, name, old, new, cases)
            _, _, _, mbad, _, _ = score(native, out, cases)
            note = ""
            if mbad == 0:
                note = "  <<< DEAD CONTROL"
            print(f"  {name}: {mbad}/{lanes} killed{note}")
            if mbad == 0 and name.split()[0] in VIOLENT:
                vn, vo, vnew = VIOLENT[name.split()[0]]
                vout = mutant_run(tmp, vn, vo, vnew, cases)
                _, _, _, vbad, _, _ = score(native, vout, cases)
                verdict = ("the harness DOES observe that code, so the dead control is an "
                           "EQUIVALENT MUTANT on this corpus"
                           if vbad else "the harness CANNOT see that code at all")
                print(f"    {vn}: {vbad}/{lanes} killed -> {verdict}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    ok = bad == 0 and fbad == 0 and fsign == 0
    print("ORACLE:", "VERIFIED" if ok else "DIVERGED")
    return 0 if ok else 1


sys.exit(main())
