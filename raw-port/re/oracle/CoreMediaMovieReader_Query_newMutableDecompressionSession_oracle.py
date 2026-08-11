#!/usr/bin/env python3
"""Differential for
`CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting() const`
@Flexo 0xdee040.

    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/\
CoreMediaMovieReader_Query_newMutableDecompressionSession_oracle.py

ONE CASE LIST DRIVES BOTH SIDES. Revision 2 of this harness built its two sides from separately
constructed inputs — the live call labelled "already has a session" actually went down the CREATE
path, the TS call with the same label took the early return, and the two agreed at NULL for
unrelated reasons. It therefore reported 9 green checks over an INVERTED guard (`!== null` where
the machine branches on `== 0`), which is the defect reviewers 3 and 4 found by reading. The fix is
structural, not a new assertion: `CASES` below is the only source of inputs, `live(case)` and
`port(case)` are both derived from it, and the only comparison the harness can express is
`live(case) vs port(case)` for the SAME case. See
`raw-port/army/ops/2026-08-11-a-differential-that-builds-its-two-sides-separately-confirms.md`.

THE TWO INPUTS THAT EXIST. The function's first instruction is `cmpq $0x0, 0x58(%rdi)` and its
second is `je`, so +0x58 NULL vs non-NULL is the whole input space of the branch:

    +0x58 == 0   -> @0xdee09e  xorl %eax,%eax ; retq        (frameless early exit, returns NULL)
    +0x58 != 0   -> @0xdee047… VTDecompressionSessionCreate (the create path)

WHAT IS MEASURED, AND WHAT IS NOT — stated per case rather than in a preamble, because a claim that
is not attached to the case it covers is how the last revision misled two reviews:

  * case "no session": MEASURED both sides, value for value. The live function is called on a
    0xCD-poisoned receiver and must return NULL without writing a byte; the port must return null.
    This is the case the old harness could not express, and it is the one that fails on the
    inverted guard.
  * case "has session": the LIVE side is measured (in a forked child — it calls into VideoToolbox);
    with a NULL format description VideoToolbox refuses, leaves the out-parameter NULL, and the
    function returns NULL, which executes the `andb %cl,%dl` fall-through. The PORT side cannot be
    compared to it: VideoToolbox is a true out-of-scope extern and the port raises there by policy.
    That is reported as DECLARED NOT COMPARABLE with the reason, never as agreement — the port is
    instead required to throw citing @0xdee073, i.e. to refuse rather than to invent a session.
  * the release branch (`create failed AND still produced a session`) needs a real decoder to
    reach. NOT reached, NOT claimed; it is transcribed from the instructions for a reviewer to
    re-derive.

NEGATIVE CONTROLS, because a harness that cannot fail is not a harness (OPS_LOG):
  * the entry-byte check is re-run one byte off the entry point and must not pass;
  * the FIELD OFFSET is confirmed by a second function — `hasValidDecompressionSession()` @0xdecb90
    is `cmpq $0x0, 0x58(%rdi) ; setne %al` — called on the same arenas this harness builds;
  * a MUTANT of the port with the guard flipped back to `!== null` is run through the identical
    case list, and this harness FAILS unless the mutant DISAGREES with the live function. That is
    the specific defect this revision exists to catch, so it is checked directly rather than
    assumed.
"""
import ctypes
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, HERE)
import ozone_loader as oz  # noqa: E402

FW = "Flexo"
SYM = "__ZNK26CoreMediaMovieReader_Query50newMutableDecompressionSessionForCapabilityTestingEv"
SIB = "__ZNK26CoreMediaMovieReader_Query28hasValidDecompressionSessionEv"
ADDR, SIB_ADDR = 0xDEE040, 0xDECB90
THIS_SIZE = 0x300

# ── THE case list: every input in this harness comes from here ────────────────────────────────
CASES = [
    {
        "name": "no session",
        "sessionAt0x58": 0,
        "formatDescription": 0,
        "expected_path": "early exit @0xdee09e (je taken: +0x58 == 0)",
        "reaches_videotoolbox": False,
    },
    {
        "name": "has session",
        "sessionAt0x58": 0xBEEF0000,
        "formatDescription": 0,
        "expected_path": "create path @0xdee047.. (je not taken: +0x58 != 0)",
        "reaches_videotoolbox": True,
    },
]

fails = []
declared = []


def check(name, ok, detail):
    print(("  ok   " if ok else "  FAIL ") + f"{name}: {detail}")
    if not ok:
        fails.append(name)


def inconclusive(name, detail):
    """Could not run. Never a pass — an unrun check is a hole, not a result."""
    print(f"  INCONCLUSIVE {name}: {detail}")
    fails.append(name + " (INCONCLUSIVE — could not run, which is not a pass)")


def declare_not_comparable(name, detail):
    """The comparison does not EXIST for this case (an out-of-scope boundary), as opposed to
    existing and not having been run. Reported, counted, and never presented as agreement."""
    print(f"  DECLARED NOT COMPARABLE  {name}: {detail}")
    declared.append(name)


oz.require_x86_64()
fn, va, slide = oz.local_fn(FW, SYM, ctypes.c_void_p, [ctypes.c_void_p])
sib, sib_va, _ = oz.local_fn(FW, SIB, ctypes.c_uint8, [ctypes.c_void_p])
print(f"{FW} slide=0x{slide:x}  vmaddr=0x{va:x}  sibling vmaddr=0x{sib_va:x}")
check("addresses", va == ADDR and sib_va == SIB_ADDR,
      f"0x{va:x} == the port's @0x{ADDR:x}; the field control is at @0x{sib_va:x}")

body = ctypes.string_at(slide + va, 7)
print("  entry bytes: " + " ".join(f"{b:02x}" for b in body))
check("entry bytes: the null test on +0x58 is the FIRST instruction",
      body[0:5] == b"\x48\x83\x7f\x58\x00" and body[5] == 0x74,
      "48 83 7f 58 00 | 74 — `cmpq $0x0, 0x58(%rdi)` then `je` (0x74), before any frame is built. "
      "0x74 is JE, not JNE (0x75): the jump is taken when +0x58 IS zero, which is the branch sense "
      "this port had backwards until revision 3")
check("the byte check can fail", ctypes.string_at(slide + va + 1, 5) != b"\x48\x83\x7f\x58\x00",
      "NEGATIVE CONTROL: the same test one byte off the entry point does not pass")


# ── one arena builder, one live caller, one TS caller — all keyed by a case ────────────────────
def arena_from(case):
    a = (ctypes.c_char * THIS_SIZE)(*([0xCD] * THIS_SIZE))
    ctypes.memmove(ctypes.byref(a, 0x08),
                   ctypes.byref(ctypes.c_uint64(case["formatDescription"])), 8)
    ctypes.memmove(ctypes.byref(a, 0x58),
                   ctypes.byref(ctypes.c_uint64(case["sessionAt0x58"])), 8)
    return a


def live(case):
    """Call the live function for ONE case. Returns (ok, value_or_None, note).

    A case that reaches VideoToolbox is run in a FORKED CHILD: a harness must not risk the parent
    on an out-of-scope framework call. A child that dies is INCONCLUSIVE, never a pass.
    """
    a = arena_from(case)
    if not case["reaches_videotoolbox"]:
        before = bytes(a)
        rc = fn(ctypes.byref(a))
        return (True, 0 if rc is None else rc,
                "in-process (this case is frameless and calls nothing)",
                bytes(a) == before)
    r, w = os.pipe()
    pid = os.fork()
    if pid == 0:
        try:
            got = fn(ctypes.byref(a))
            os.write(w, str(0 if got is None else got).encode())
            os._exit(0)
        except BaseException:
            os._exit(4)
    os.close(w)
    _, status = os.waitpid(pid, 0)
    out = os.read(r, 64).decode()
    os.close(r)
    if os.WIFSIGNALED(status):
        return (False, None, f"the forked child died with signal {os.WTERMSIG(status)}", None)
    if os.WEXITSTATUS(status) != 0:
        return (False, None, f"the forked child exited {os.WEXITSTATUS(status)}", None)
    return (True, int(out), "forked child (this case calls into VideoToolbox)", None)


DRIVER = """
const [modPath, casesJson] = process.argv.slice(2);
const mod = await import(modPath);
const out = [];
for (const c of JSON.parse(casesJson)) {
  const o = new mod.CoreMediaMovieReader_Query();
  // The SAME case fields the ctypes arena is built from: +0x58 and +0x8.
  o.sessionAt0x58 = c.sessionAt0x58 === 0 ? null : { marker: c.name };
  o.formatDescriptionAt0x8 = c.formatDescription === 0 ? null : { marker: "fmt" };
  try {
    const ret = o.newMutableDecompressionSessionForCapabilityTesting();
    out.push({ name: c.name, threw: null, isNull: ret === null, ret: ret === null ? null : "object" });
  } catch (e) {
    out.push({ name: c.name, threw: String(e && e.message), isNull: null, ret: null });
  }
}
process.stdout.write(JSON.stringify({
  results: out,
  guard: mod.CoreMediaMovieReader_Query.prototype
           .newMutableDecompressionSessionForCapabilityTesting.toString()
           .split("\\n").find((l) => l.includes("sessionAt0x58")).trim(),
}));
"""

PORT = os.path.join(REPO, "src", "infra", "CoreMediaMovieReader_Query.ts")
DRV = os.path.join(HERE, ".rq_driver.mts")


def port(module_path):
    """Run the WHOLE case list through one TS module (the port, or a mutant of it)."""
    p = subprocess.run(["node", "--experimental-strip-types", DRV, module_path,
                        json.dumps(CASES)], capture_output=True, text=True, cwd=HERE)
    if p.returncode != 0:
        return None, f"node failed: {p.stderr[-600:]}"
    d = json.loads(p.stdout)
    return {r["name"]: r for r in d["results"]}, d["guard"]


open(DRV, "w").write(DRIVER)
try:
    ts, guard = port(PORT)
    if ts is None:
        check("the TS port runs", False, guard)
        ts = {}
    else:
        print(f"  the guard the driver actually ran: {guard}")

    # ── the differential: live(case) vs port(case), per case ──────────────────────────────────
    for case in CASES:
        n = case["name"]
        ok, value, how, unchanged = live(case)
        if not ok:
            inconclusive(f"case {n!r}: live", how)
            continue
        shown = "NULL" if value == 0 else hex(value)
        print(f"  live[{n}] -> {shown}   ({case['expected_path']}; {how})")
        t = ts.get(n)
        if t is None:
            check(f"case {n!r}: the port ran", False, "no TS result for this case")
            continue
        if case["reaches_videotoolbox"]:
            declare_not_comparable(
                f"case {n!r}: live == port",
                f"the live function returns {shown} by going through VideoToolbox, which the port "
                "may not call: VTDecompressionSessionCreate is a true out-of-scope extern and the "
                "port raises at that boundary by policy. The values cannot be compared for this "
                "case; what IS required of the port is the refusal, checked next")
            check(f"case {n!r}: the port refuses at the VideoToolbox boundary",
                  t["threw"] is not None and "VTDecompressionSessionCreate" in t["threw"]
                  and "0xdee073" in t["threw"],
                  f"port throws citing the call site: {(t['threw'] or 'DID NOT THROW')[:110]}")
        else:
            check(f"case {n!r}: live == port",
                  t["threw"] is None and t["isNull"] and value == 0,
                  f"live returned {shown} and the port returned "
                  f"{'null' if t['isNull'] else (t['threw'] or t['ret'])} — the same case, both "
                  "sides, value for value")
            if unchanged is not None:
                check(f"case {n!r}: the early exit writes nothing", unchanged,
                      "the 0xCD-poisoned 0x300-byte receiver is byte-identical after the call")

    # ── FIELD-OFFSET CONTROL: a second function, the same arenas ──────────────────────────────
    sib_answers = {c["name"]: sib(ctypes.byref(arena_from(c))) for c in CASES}
    check("FIELD CONTROL: the sibling agrees about +0x58",
          sib_answers["no session"] == 0 and sib_answers["has session"] == 1,
          "hasValidDecompressionSession() @0xdecb90 (`cmpq $0x0, 0x58(%rdi) ; setne %al`) — an "
          f"independent function reading the same offset — answers {sib_answers}, so +0x58 is "
          "confirmed by a second symbol AND the harness can tell the two cases apart")

    # ── MUTANT CONTROL: the harness must fail on the defect it was rebuilt for ─────────────────
    src = open(PORT).read()
    mutated, n_sub = re.subn(r"if \(this\.sessionAt0x58 === null\) \{",
                             "if (this.sessionAt0x58 !== null) {", src)
    if n_sub != 1:
        check("MUTANT CONTROL: the guard was found to mutate", False,
              f"expected exactly one `this.sessionAt0x58 === null` guard, found {n_sub}")
    else:
        mpath = os.path.join(HERE, ".rq_mutant.ts")
        open(mpath, "w").write(mutated)
        try:
            mts, mguard = port(mpath)
            if mts is None:
                check("MUTANT CONTROL: the mutant runs", False, mguard)
            else:
                m = mts["no session"]
                check("MUTANT CONTROL: an inverted guard is CAUGHT by this case list",
                      not (m["threw"] is None and m["isNull"]),
                      "with the guard flipped back to `!== null` (the defect reviewers 3 and 4 "
                      f"found), case 'no session' gives {m['threw'][:60] + '…' if m['threw'] else 'null'}"
                      " where the live function returns NULL — so this harness fails on it, which "
                      "the previous revision could not")
        finally:
            os.unlink(mpath)
finally:
    os.unlink(DRV)

print()
if declared:
    print("DECLARED NOT COMPARABLE (an out-of-scope boundary, not an unrun check): "
          + ", ".join(declared))
print("CoreMediaMovieReader_Query::newMutableDecompressionSessionForCapabilityTesting() "
      "@Flexo 0xdee040 — "
      + ("VERIFIED as far as an out-of-scope callee allows: both branch cases are driven from ONE "
         "case list, the early-exit case agrees value-for-value with the live image and writes "
         "nothing, the create case is executed live (VideoToolbox refuses a NULL format "
         "description) while the port is required to refuse at that boundary, the +0x58 offset is "
         "confirmed by an independent sibling, and an inverted-guard mutant is caught. The release "
         "branch needs a real decoder and is explicitly NOT claimed."
         if not fails else f"FAILED: {', '.join(fails)}"))
sys.exit(1 if fails else 0)
