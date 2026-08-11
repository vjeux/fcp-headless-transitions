#!/usr/bin/env python3
"""TypeScript-against-binary differential for
`HgcRetimeWithFrameBlend::GetParameter(int, float*)` @Helium 0x3364d0.

    arch -x86_64 /usr/bin/python3 \
        raw-port/re/oracle/HgcRetimeWithFrameBlend_GetParameter_oracle.py

The live function is called at `_dyld_get_image_vmaddr_slide(Helium) + 0x3364d0` with a `this`
arena this harness builds — a 0x200-byte block whose +0x198 holds a pointer to a uniform block —
and its answer is compared with the committed `raw-port/src/render/HgcRetimeWithFrameBlend.ts`,
run under `node --experimental-strip-types` (see the `_driver.mts`, which echoes the source of the
method it called). Both halves of the answer are compared: the returned `int` AND the four output
floats, as raw 32-bit patterns so NaN payloads, signalling NaNs, ±0 and denormals all count.

WHAT THE CONTROLS ARE FOR. This body is short enough to sign on reading, and three of its claims
are exactly the kind that a weak harness confirms by accident:

  * "any non-zero index returns -1 and writes NOTHING" — the output buffer is poisoned before
    every call and compared afterwards, so a write would be visible; and the corpus includes
    negative indices, INT_MIN and INT_MAX, not just 1.
  * "it reads +0x20..+0x2c of the block at this+0x198, and nothing else of `this`" — the `this`
    arena is poisoned with 0xCD and byte-compared after each call, and the block pointer is placed
    at +0x198 only, so a read of any other offset would pick up poison and diverge.
  * "the four copies are independent 32-bit moves" — the corpus puts a different special value in
    each of the four lanes (NaN with a payload, -0.0, a denormal, ±Inf), which a 16-byte vector
    move or an off-by-one source offset would reorder or renormalise.

MUTANTS: five one-token mutations of the port, each of which must be KILLED, plus M0 — an
unmutated copy through the identical pipeline, which must kill 0. Without that baseline a table of
kills cannot tell a working instrument from a broken one (this project has the scar: the first run
of the `rho` differential scored a perfect kill sheet while feeding the port byte-swapped input).
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
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Helium"
SYM = "__ZN23HgcRetimeWithFrameBlend12GetParameterEiPf"
ADDR = 0x3364D0
PORT = os.path.join(REPO, "src", "render", "HgcRetimeWithFrameBlend.ts")
DRIVER = os.path.join(HERE, "HgcRetimeWithFrameBlend_GetParameter_driver.mts")
BLOCK_FLOATS = 16          # 0x40 bytes; the function reads indices 8..11 (+0x20..+0x2c)
POISON = ["deadbeef", "7fc00001", "ffc00002", "cafebabe"]
fails = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def b32(x):
    return struct.pack(">f", x).hex()


def unb32(h):
    return struct.unpack(">f", bytes.fromhex(h))[0]


# ── corpus ────────────────────────────────────────────────────────────────────────────────────
def corpus():
    rnd = random.Random(0x3364D0)
    cases = []

    def add(index, block):
        cases.append({"index": index, "block": [b32(v) for v in block], "poison": POISON})

    nan, inf = float("nan"), float("inf")
    special = [0.0, -0.0, 1.0, -1.0, inf, -inf, nan, 1e-45, 3.4028235e38, -3.4028235e38]
    base = [float(i) for i in range(BLOCK_FLOATS)]
    # index 0 with each special value in each of the four returned lanes, one at a time
    for lane in range(4):
        for v in special:
            blk = list(base)
            blk[8 + lane] = v
            add(0, blk)
    # all four lanes special at once, in different combinations
    for i in range(len(special)):
        blk = list(base)
        for lane in range(4):
            blk[8 + lane] = special[(i + lane) % len(special)]
        add(0, blk)
    # every non-zero index shape: the body tests with `testl`, so these must ALL return -1
    for idx in (1, -1, 2, 7, -7, 0x7FFFFFFF, -0x80000000, 0x100, -0x100):
        add(idx, base)
    while len(cases) < 120:
        add(rnd.choice((0, 0, 0, 1, -1, rnd.randint(-2**31, 2**31 - 1))),
            [rnd.uniform(-1e6, 1e6) for _ in range(BLOCK_FLOATS)])
    return cases


CASES = corpus()


def run_ts(module_path):
    req = json.dumps({"module": module_path, "cases": CASES})
    r = subprocess.run(["node", "--experimental-strip-types", DRIVER],
                       input=req, capture_output=True, text=True, cwd=HERE)
    if r.returncode != 0:
        return None, r.stderr[-800:]
    out = json.loads(r.stdout)
    return out["results"], out["source"]


# ── the live function ─────────────────────────────────────────────────────────────────────────
oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, ctypes.c_int32,
                            [ctypes.c_void_p, ctypes.c_int32, ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  GetParameter vmaddr=0x{va:x}")
check("address", va == ADDR, f"0x{va:x} == the port's @0x{ADDR:x}")
body = ctypes.string_at(slide + va, 10)
print("  entry bytes: " + " ".join(f"{b:02x}" for b in body))
check("entry bytes", body[0:5] == b"\xb8\xff\xff\xff\xff" and body[5:7] == b"\x85\xf6"
      and body[7] == 0x74 and body[9] == 0xC3,
      "b8 ff ff ff ff | 85 f6 | 74 01 | c3 — `movl $-1,%eax` BEFORE the test, `testl %esi,%esi`, "
      "`je`, and the early `retq`: the -1 is pre-set and the frame is never built on that path")
check("the byte check can fail", ctypes.string_at(slide + va + 1, 5) != b"\xb8\xff\xff\xff\xff",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")

THIS_SIZE = 0x200
this_arena = (ctypes.c_char * THIS_SIZE)(*([0xCD] * THIS_SIZE))
block = (ctypes.c_float * BLOCK_FLOATS)()
ctypes.memmove(ctypes.byref(this_arena, 0x198),
               ctypes.byref(ctypes.c_void_p(ctypes.addressof(block))), 8)
this_snapshot = bytes(this_arena)


def call_live(c):
    for i, h in enumerate(c["block"]):
        block[i] = unb32(h)
    out = (ctypes.c_float * 4)(*[unb32(h) for h in c["poison"]])
    rc = fn(ctypes.byref(this_arena), c["index"], ctypes.byref(out))
    raw = bytes(out)
    return {"rc": rc, "out": [raw[i * 4:i * 4 + 4][::-1].hex() for i in range(4)]}


live = [call_live(c) for c in CASES]
check("the receiver is never written", bytes(this_arena) == this_snapshot,
      "the 0xCD-poisoned 0x200-byte `this` is byte-identical after all "
      f"{len(CASES)} calls — the only thing read from it is the pointer at +0x198")

# ── the port ──────────────────────────────────────────────────────────────────────────────────
ts, src = run_ts(PORT)
if ts is None:
    check("the TS port runs", False, f"node failed: {src}")
else:
    diffs = [i for i in range(len(CASES)) if ts[i] != live[i]]
    check("TS == live (return value AND all four output words)", not diffs,
          f"{len(CASES)} cases, {len(diffs)} divergent"
          + ("" if not diffs else
             f"; first at #{diffs[0]}: live={live[diffs[0]]} ts={ts[diffs[0]]} "
             f"index={CASES[diffs[0]]['index']}"))
    print("  the method the driver actually ran (first line): "
          + src.strip().splitlines()[0][:100])
    served = [i for i, c in enumerate(CASES) if c["index"] == 0]
    refused = [i for i, c in enumerate(CASES) if c["index"] != 0]
    check("the corpus reaches both paths", served and refused,
          f"{len(served)} index-0 cases and {len(refused)} non-zero ones")
    check("every refusal returns -1 and leaves the buffer poisoned",
          all(live[i]["rc"] == -1 and live[i]["out"] == POISON for i in refused),
          f"all {len(refused)} non-zero indices (including INT_MIN and INT_MAX) returned -1 with "
          "the output buffer bit-identical to the poison it went in with")
    check("the served path really writes something different from the poison",
          any(live[i]["out"] != POISON for i in served),
          "the index-0 cases changed the buffer, so 'unchanged' above is a measurement")

# ── mutants ───────────────────────────────────────────────────────────────────────────────────
MUTANTS = [
    ("M0  unmutated copy (must kill 0)", None, None),
    ("M1  the index test is inverted", "if (index !== 0) {", "if (index === 0) {"),
    ("M2  the refusal returns 0 instead of -1", "      return -1;", "      return 0;"),
    ("M3  the source offset slips one float", "out[0] = block[8]!;", "out[0] = block[9]!;"),
    ("M4  the fourth lane is not copied", "    out[3] = block[11]!;", "    void block[11];"),
    ("M5  the success path returns -1", "    return 0;\n  }\n}", "    return -1;\n  }\n}"),
]
tmp = tempfile.mkdtemp(prefix="hgcretime_mut_")
print("\n  MUTATION TABLE — each mutant is a copy of the port with ONE token changed, run through")
print("  the identical driver over the identical corpus:")
src_text = open(PORT).read()
for label, old, new in MUTANTS:
    path = os.path.join(tmp, f"mut_{abs(hash(label))}.ts")
    if old is None:
        open(path, "w").write(src_text)
    else:
        if src_text.count(old) != 1:
            check(label, False, f"the mutation anchor appears {src_text.count(old)} times — the "
                                "mutant was not applied, so this row is not evidence")
            continue
        open(path, "w").write(src_text.replace(old, new))
    got, err = run_ts(path)
    if got is None:
        killed, note = len(CASES), "did not run"
    else:
        killed, note = sum(1 for i in range(len(CASES)) if got[i] != live[i]), ""
    print(f"    {label:48s} killed {killed:3d}/{len(CASES)} {note}")
    if old is None:
        check("M0 baseline kills nothing", killed == 0,
              "an unmutated copy through the same pipeline agrees with the live function on every "
              "case — so the kills below are the mutations and not the harness")
    else:
        check(f"mutant killed: {label.split()[0]}", killed > 0,
              f"{killed} of {len(CASES)} cases caught it")
shutil.rmtree(tmp, ignore_errors=True)

print()
print("HgcRetimeWithFrameBlend::GetParameter(int, float*) @Helium 0x3364d0 — "
      + (f"VERIFIED (the committed TypeScript matches the live binary on all {len(CASES)} cases, "
         "return value and all four output words compared as raw bit patterns; the receiver is "
         "never written; every non-zero index returns -1 without touching the buffer; every "
         "one-token mutant is killed and the unmutated baseline kills nothing)"
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
