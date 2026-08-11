#!/usr/bin/env python3
"""TypeScript-against-binary differential for `rho(float*, double const*, double)` @Helium 0x3b860.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/rho_oracle.py

It calls the LIVE Helium function at `_dyld_get_image_vmaddr_slide(Helium) + 0x3b860` and compares
its answer, BIT FOR BIT, with the answer produced by running the committed
`raw-port/src/channels/rho.ts` under `node --experimental-strip-types` (see `rho_driver.mts`, which
also echoes the source text of the function it ran). The port is compared with the machine, not
with a Python restatement of the port.

WHY BIT PATTERNS EVERYWHERE. This function's structure is mostly NaN handling — six
`min/max` + `cmpunord` + `blendv` pairs whose only job is to decide which operand survives when one
is NaN — and its inputs can produce ±0 and ±Inf through the `divpd` by `p[3]`. A decimal comparison
would erase exactly the differences under test, and `json.dump` cannot even transport them (bare
`NaN`/`Infinity` is invalid JSON that `JSON.parse` rejects). So every double crosses as a 16-char
hex bit pattern, every float as 8, and the comparison is `==` on those strings.

THE CORPUS is 200 cases: uniform random matrices, plus hand-built rows that reach each branch and
each blend — `s` below/at/above the 1.0 threshold and NaN `s`; `p[3]` = 0 so the divide yields
±Inf/NaN; NaN and Inf planted in individual matrix entries; equal minima to hit the `jbe` boundary;
and denormal-scale and huge-scale magnitudes.

MUTANTS. A differential that cannot fail is not evidence, so the same corpus is run against six
one-token mutations of the port, each of which must be KILLED, plus an unmutated copy (M0) that
goes through the identical pipeline and must kill 0 — without that baseline a table of kills cannot
distinguish a working instrument from one that rejects everything.
"""
import ctypes
import json
import os
import random
import shutil
import struct
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))          # <repo>/raw-port
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Helium"
SYM = "__ZL3rhoPfPKdd"
ADDR = 0x3B860
K_ADDR = 0x3CA260          # the ucomisd operand: @0x3b912 + 0x38e94e
PORT = os.path.join(REPO, "src", "channels", "rho.ts")
DRIVER = os.path.join(HERE, "rho_driver.mts")
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def bits64(x):
    # BIG-ENDIAN on purpose: the JS side reads these with BigInt("0x"+hex), which is big-endian by
    # definition. Packing them little-endian here was the first version of this file, and every
    # case diverged while M0 — the unmutated copy — "killed" 200/200. That is what an M0 baseline
    # is FOR: without it the mutation table read as a perfect 6-for-6 kill sheet produced by a
    # harness that was feeding the port byte-swapped garbage.
    return struct.pack(">d", x).hex()


def bits32(x):
    return struct.pack(">f", x).hex()


def unbits64(h):
    return struct.unpack(">d", bytes.fromhex(h))[0]


# ── the corpus ────────────────────────────────────────────────────────────────────────────────
def corpus():
    rnd = random.Random(0x2026_08_11)
    cases = []

    def add(p, m, s):
        cases.append({"p": [bits32(v) for v in p], "m": [bits64(v) for v in m], "s": bits64(s)})

    nan, inf = float("nan"), float("inf")
    # the branch-reaching rows, written out rather than hoped for
    base_p = [0.25, -0.5, 7.0, 2.0]
    base_m = [3.0, 5.0, 0.0, 0.5, -2.0, 1.5, 0.0, 0.25]
    for s in (0.0, 1.0, 1.0000001, 2.0, 16.0, -3.0, nan, inf, -inf, 1e-300, 1e300):
        add(base_p, base_m, s)
    add([0.25, -0.5, 7.0, 0.0], base_m, 4.0)              # p[3] = 0 -> divide by zero
    add([0.0, 0.0, 0.0, 1.0], base_m, 4.0)                # p[0] = p[1] = 0
    add([0.25, -0.5, 7.0, -0.0], base_m, 4.0)             # negative zero divisor
    for i in range(8):                                     # one NaN, then one Inf, per matrix slot
        mm = list(base_m); mm[i] = nan; add(base_p, mm, 4.0)
        mm = list(base_m); mm[i] = inf; add(base_p, mm, 4.0)
        mm = list(base_m); mm[i] = -inf; add(base_p, mm, 0.5)
    # R IS NaN WHILE P IS NOT — the only state that separates the two `minsd` operand orders, and
    # the corpus had no case for it until the M3 mutant scored 0/200 and said so. A tiny p[3] makes
    # the two `a` lanes overflow to +Inf while the `b` lanes stay finite, so (a0+a1) is +Inf but
    # (a0-a1) is Inf-Inf = NaN: P is infinite, R is NaN. Both branch sides, since the isotropic path
    # blends the same way.
    over = [1e300, 1e-300, 0.0, 0.0, 1e300, 1e-300, 0.0, 0.0]
    add([0.25, -0.5, 7.0, 1e-30], over, 4.0)
    add([0.25, -0.5, 7.0, 1e-30], over, 0.5)
    add([0.25, -0.5, 7.0, -1e-30], over, 4.0)
    # Q IS NaN WHILE S IS FINITE — the state in which the high lane's `cmpunordpd`+`blendvpd`
    # override actually changes the answer. a0 is Inf-Inf = NaN while a1, b1 stay finite.
    qnan = [inf, 3.0, 0.0, inf, 5.0, 7.0, 0.0, 0.5]
    add([1.0, 1.0, 0.0, 2.0], qnan, 4.0)
    add([1.0, 1.0, 0.0, 2.0], qnan, 0.5)
    add([nan, 1.0, 0.0, 2.0], base_m, 4.0)                 # NaN in p
    add([1.0, nan, 0.0, 2.0], base_m, 0.5)
    add([1.0, 1.0, 0.0, nan], base_m, 4.0)
    # equal minima: a symmetric matrix makes the two candidate pairs agree, hitting the jbe edge
    add([0.0, 0.0, 0.0, 1.0], [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0], 4.0)
    add([0.0, 0.0, 0.0, 1.0], [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0], 0.5)
    while len(cases) < 200:                                # uniform random, several magnitudes
        e = rnd.choice((1e-6, 1.0, 1e3, 1e12))
        p = [rnd.uniform(-2, 2) for _ in range(4)]
        p[3] = rnd.uniform(-2, 2) or 1.0
        m = [rnd.uniform(-1, 1) * e for _ in range(8)]
        add(p, m, rnd.choice((0.25, 1.0, 2.0, 8.0, 64.0)))
    return cases


CASES = corpus()


def run_ts(module_path):
    """Run the committed port (or a mutant copy of it) over the corpus. Returns (bits[], source)."""
    req = json.dumps({"module": module_path, "cases": CASES})
    r = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       input=req, capture_output=True, text=True, cwd=HERE)
    if r.returncode != 0:
        return None, r.stderr[-800:]
    out = json.loads(r.stdout)
    return out["results"], out["source"]


# ── the live function ─────────────────────────────────────────────────────────────────────────
oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, ctypes.c_double,
                            [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_double])
print(f"{FW} slide=0x{slide:x}  rho vmaddr=0x{va:x}")
check("address", va == ADDR, f"0x{va:x} == the port's @0x{ADDR:x}")

body = ctypes.string_at(slide + va, 8)
print("  entry bytes: " + " ".join(f"{b:02x}" for b in body))
check("entry bytes", body[0:4] == b"\x55\x48\x89\xe5" and body[4:8] == b"\xf3\x0f\x10\x0f",
      "55 48 89 e5 | f3 0f 10 0f — prologue then `movss (%rdi),%xmm1`, the first instruction of "
      "the transcription")
check("the byte check can fail", ctypes.string_at(slide + va + 1, 4) != b"\x55\x48\x89\xe5",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")
k = struct.unpack("<d", ctypes.string_at(slide + K_ADDR, 8))[0]
check("the branch constant is 1.0", k == 1.0,
      f"the ucomisd operand at @0x{K_ADDR:x} reads {k!r} out of the mapped image — the port's "
      "`s > 1.0` is that constant, not a guess")


def call_live(c):
    p = (ctypes.c_float * 4)(*[struct.unpack(">f", bytes.fromhex(h))[0] for h in c["p"]])
    m = (ctypes.c_double * 8)(*[unbits64(h) for h in c["m"]])
    return fn(ctypes.byref(p), ctypes.byref(m), unbits64(c["s"]))


live = [bits64(call_live(c)) for c in CASES]

# ── the port ──────────────────────────────────────────────────────────────────────────────────
ts, src = run_ts(PORT)
if ts is None:
    check("the TS port runs", False, f"node failed: {src}")
else:
    diffs = [i for i in range(len(CASES)) if ts[i] != live[i]]
    check("TS == live, bit for bit", not diffs,
          f"{len(CASES)} cases, {len(diffs)} divergent"
          + ("" if not diffs else
             f"; first at #{diffs[0]}: live={live[diffs[0]]} ts={ts[diffs[0]]} "
             f"case={CASES[diffs[0]]}"))
    print("  the function the driver actually ran (first line): "
          + src.strip().splitlines()[0][:100])
    # the corpus has to have REACHED the interesting states, or "0 divergent" means little
    vals = [unbits64(h) for h in live]
    check("the corpus exercises the branches",
          any(v != v for v in vals) and any(v in (float("inf"), float("-inf")) for v in vals)
          and any(v == v and abs(v) not in (float("inf"),) for v in vals),
          f"{sum(1 for v in vals if v != v)} NaN, "
          f"{sum(1 for v in vals if v in (float('inf'), float('-inf')))} infinite and "
          f"{sum(1 for v in vals if v == v and v not in (float('inf'), float('-inf')))} finite "
          "results — so the NaN blends and the divide-by-zero paths are actually being compared")

# ── mutants ───────────────────────────────────────────────────────────────────────────────────
# One token each, and each one is a misreading a careful transcriber could plausibly make.
MUTANTS = [
    ("M0  unmutated copy (must kill 0)", None, None),
    ("M1  `s > 1.0` -> `s >= 1.0`", "if (!(s > 1.0))", "if (!(s >= 1.0))"),
    ("M2  the difference diagonal becomes a sum",
     "const difA = a0 - a1;", "const difA = a0 + a1;"),
    # NOT M3-as-first-written. The obvious mutation here — swapping the `minsd` operand order to
    # `bigP < bigR ? bigP : bigR` — scored 0/200, and chasing that with more corpus was wrong,
    # because the mutation is EQUIVALENT on every reachable input: the two orders differ only when
    # one operand is NaN and the other is not, and R = (a0-a1)^2 + (b0-b1)^2 can only be NaN when a
    # lane is Inf-Inf, which forces the corresponding (a0+a1) to be Inf and therefore P to be Inf.
    # An infinite minLow can never satisfy `minHigh > minLow`, so the low lane's minimum is never
    # read on that path and the swap is unobservable. The mutation that IS observable is the one
    # below: DROP the high lane's unordered blend, which changes the answer whenever Q is NaN and S
    # is not — reached by the `qnan` rows added to the corpus for exactly this purpose.
    ("M3  the high-lane NaN blend is dropped",
     "  if (Number.isNaN(bigQ)) minHigh = bigS;", "  // blend removed by the mutant"),
    ("M4  the ratio is not narrowed to float",
     "const ratiof = Math.fround(ratio);", "const ratiof = ratio;"),
    ("M5  the isotropic path takes the LARGER maximum",
     "let pick = maxRPf < maxSQf ? maxRPf : maxSQf;",
     "let pick = maxRPf > maxSQf ? maxRPf : maxSQf;"),
    ("M6  the winning pair is chosen the other way",
     "if (minHigh > minLow) {", "if (minHigh < minLow) {"),
]
tmp = tempfile.mkdtemp(prefix="rho_mut_")
print("\n  MUTATION TABLE — each mutant is a copy of the port with ONE token changed, run through")
print("  the identical driver over the identical corpus:")
src_text = open(PORT).read()
for label, old, new in MUTANTS:
    path = os.path.join(tmp, f"mut_{abs(hash(label))}.ts")
    if old is None:
        open(path, "w").write(src_text)
    else:
        if src_text.count(old) != 1:
            check(label, False, f"the mutation anchor appears {src_text.count(old)} times — "
                                "the mutant was not applied, so this row is not evidence")
            continue
        open(path, "w").write(src_text.replace(old, new))
    got, err = run_ts(path)
    if got is None:
        killed = len(CASES)     # a mutant that will not even load is killed by every case
        note = "did not run"
    else:
        killed = sum(1 for i in range(len(CASES)) if got[i] != live[i])
        note = ""
    print(f"    {label:52s} killed {killed:3d}/{len(CASES)} {note}")
    if old is None:
        check("M0 baseline kills nothing", killed == 0,
              "an unmutated copy through the same pipeline agrees with the live function on every "
              "case — so the kills below are the mutations and not the harness")
    else:
        check(f"mutant killed: {label.split()[0]}", killed > 0,
              f"{killed} of {len(CASES)} cases caught it")
shutil.rmtree(tmp, ignore_errors=True)

print()
print("rho(float*, double const*, double) @Helium 0x3b860 — "
      + (f"VERIFIED (the committed TypeScript matches the live binary bit-for-bit on all "
         f"{len(CASES)} cases, including NaN, ±Inf and ±0 results; every one-token mutant is "
         f"killed and the unmutated baseline kills nothing)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
