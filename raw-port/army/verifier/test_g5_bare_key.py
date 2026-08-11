#!/usr/bin/env python3
"""test_g5_bare_key.py — LOCKED test for G5's BARE-KEY resolution guard.

test_classify.py pins "given the right .s, is the verdict right?".
test_find_disasm.py pins "is it even the right .s?" for the RESOLVER.
This pins the same question for **G5 itself**, one level finer: within the RIGHT class, is it the
right METHOD? A verdict computed from a sibling method's disassembly is not a weaker verdict, it is
a fabricated one — and G5, unlike find_disasm, gets to hard-REJECT on it.

THE BUG THIS LOCKS OUT (worker 1, 2026-08-11):
  #322 made a bare-key hit prove it NAMES THE CLASS. It did not have to name the METHOD, so
  `find_disasm(file_class)` — which returns whichever of the class's methods happens to be cached —
  became the disasm for EVERY export in the file. On the landed
  channels/OZ3DEngineScenePlacementBehavior.ts, with only
  `__ZNK32OZ3DEngineScenePlacementBehavior12getLockingIDEv.s` present (6 instrs, 0 stores, 1 load ->
  classified EMPTY), all ELEVEN exports were judged against that one trivial getter and hard
  rejected as "EMPTY disasm but port throws incompleteness": eleven fabricated cheat verdicts on
  honest @0xADDR-citing deferral stubs. Both directions of harm, as ever — an EMPTY borrowed from a
  sibling getter also waves through an empty-bodied port of a REAL method in the same class.

  Worse, the trigger was OBEYING THE BRIEF: workers are told to run `disasm.sh --sym` inside the
  leased worktree before gating, precisely so G5 classifies instead of only flagging. That single
  `.s` flipped the file from "0 cheats, 12 flags -> PASS" to "11 cheats -> REJECT".

Fixtures are written to temp dirs; no binary, no cache, no network.
"""
import os, sys, json, tempfile, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
GATE = os.path.abspath(os.path.join(HERE, "..", "gate"))

# A 6-instruction trivial getter for class `Fixture3DPlacement`, method `getLockingID`.
# classify() calls this EMPTY: 0 stores, 0 compute, 0 calls, 1 load.
GETTER_S = (
    "__ZNK18Fixture3DPlacement12getLockingIDEv:\n"
    "00000000003cab90\tpushq\t%rbp\n"
    "00000000003cab91\tmovq\t%rsp, %rbp\n"
    "00000000003cab94\tmovl\t0x48(%rdi), %eax\n"
    "00000000003cab97\tpopq\t%rbp\n"
    "00000000003cab98\tretq\n"
)

# A file for the SAME class whose other export is an honest, address-citing deferral stub for a
# DIFFERENT method (`getLockDependencies`) whose own .s is absent from the cache.
TS_SRC = """// Fixture3DPlacement.ts — fixture for test_g5_bare_key.py
// Framework: Ozone.  @Ozone 0x3ca230
//
// getLockDependencies  @Ozone 0x3ca9e0
export function Fixture3DPlacement_getLockDependencies(
  _self: unknown,
  _graph: unknown,
): void {
  throw new Error("Fixture3DPlacement::getLockDependencies @0x3ca9e0 not yet transcribed (needs std::set<OZLocking*>::insert)");
}
"""


TS_SRC_TWO = """// Fixture3DPlacement2.ts — fixture for test_g5_bare_key.py (multi-export)
// Framework: Ozone.  @Ozone 0x3ca230
//
// getLockingID  @Ozone 0x3cab90  __ZNK19Fixture3DPlacement212getLockingIDEv
export function Fixture3DPlacement2_getLockingID(self: any): number {
  return self.lockingID; // @0x3cab94
}

// getLockDependencies  @Ozone 0x3ca9e0  __ZNK19Fixture3DPlacement219getLockDependenciesEPvS0_
export function Fixture3DPlacement2_getLockDependencies(
  _self: unknown,
  _graph: unknown,
): void {
  throw new Error("Fixture3DPlacement2::getLockDependencies @0x3ca9e0 not yet transcribed (needs std::set<OZLocking*>::insert)");
}
"""

TS_SRC_CTOR = """// Fixture3DPlacement3.ts — fixture for test_g5_bare_key.py (Itanium special member)
// Framework: Ozone.  @Ozone 0x3ca230
//
// ctor  @Ozone 0x3ca230  __ZN19Fixture3DPlacement3C2EPv
export function Fixture3DPlacement3_ctor(
  _self: unknown,
  _factory: unknown,
): void {
  throw new Error("Fixture3DPlacement3::Fixture3DPlacement3 @0x3ca230 not yet transcribed (needs OZBehavior::OZBehavior)");
}
"""


def run_g5(ts_path, disasm_dir):
    """Run g5_impl_gate in a subprocess with DISASM pointed at the fixture dir."""
    shim = (
        "import sys, os\n"
        f"sys.path.insert(0, {GATE!r})\n"
        f"sys.path.insert(0, {HERE!r})\n"
        "import classify_disasm as C\n"
        f"C.DISASM = {disasm_dir!r}\n"
        "import g5_impl_gate as G\n"
        f"errs, flags = G.check_file({ts_path!r})\n"
        "import json; print('RESULT ' + json.dumps({'errs': errs, 'flags': flags}))\n"
    )
    r = subprocess.run([sys.executable, "-c", shim], capture_output=True, text=True)
    for line in r.stdout.splitlines():
        if line.startswith("RESULT "):
            return json.loads(line[len("RESULT "):])
    raise RuntimeError("g5 shim produced no result:\n%s\n%s" % (r.stdout[-2000:], r.stderr[-2000:]))


def main():
    fails = 0
    sys.path.insert(0, GATE); sys.path.insert(0, HERE)
    import g5_impl_gate as _G
    # The POSITIONAL rule, unit-level. A whole-component test is not enough: `RK6CMTime` is a
    # PARAMETER TYPE, and treating it as a name made OZDynamicSpline::setVertexSmooth the judge of
    # all twelve src/infra/CMTime.ts exports (12 fabricated DISPATCH_ONLY rejects).
    NAMES_METHOD_CASES = [
        ("ProChannel.__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime.s", "CMTime", False,
         "a parameter TYPE must never answer as the method"),
        ("ProChannel.__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime.s", "setVertexSmooth", True,
         "the real method resolves"),
        ("__ZNK32OZ3DEngineScenePlacementBehavior12getLockingIDEv", "distance", False,
         "a SIBLING method of the right class is still the wrong function"),
        ("__ZNK32OZ3DEngineScenePlacementBehavior12getLockingIDEv", "getLockingID", True,
         "the method itself resolves"),
        ("__ZThn328_NK32OZ3DEngineScenePlacementBehavior12getLockingIDEv", "getLockingID", True,
         "a Thn adjustor thunk resolves to the function it adjusts"),
        ("__ZN18HgcToneParamCurve214RenderTile_AVXEP6HGTile", "RenderTile_AVX", True,
         "a class name ending in a digit does not hide the method's length prefix"),
        ("Ozone.__ZN19Fixture3DPlacement3C2EPv", "ctor", True,
         "Itanium C2 answers a `_ctor` export"),
        ("Ozone.__ZN19Fixture3DPlacement3C2EPv", "dtor", False,
         "...but not a `_dtor` export"),
        ("__ZN21OZXSplineInterpolatoreqERKS_", "equals", True,
         "Itanium `eq` answers an `_equals` export"),
        ("ProChannel.OZChannelBase.parseElement.s", "parseElement", True,
         "the dotted human form still resolves"),
    ]
    for base, meth, expect, note in NAMES_METHOD_CASES:
        got = _G._sym_names_method(base, meth)
        ok = got == expect
        fails += (0 if ok else 1)
        print("  %-6s _sym_names_method(%-34s, %-16s) = %-5s %s"
              % ("OK" if ok else "FAIL", base[:34], meth, got, note))

    with tempfile.TemporaryDirectory() as d:
        dis = os.path.join(d, "disasm"); os.makedirs(dis)
        ts = os.path.join(d, "Fixture3DPlacement.ts")
        open(ts, "w").write(TS_SRC)

        # (1) Cache EMPTY: nothing to classify against -> the honest NO-DISASM flag, never a cheat.
        res = run_g5(ts, dis)
        ok = not res["errs"]
        fails += (0 if ok else 1)
        print("  %-6s no same-class .s cached -> %d cheat(s), %d flag(s) (want 0 cheats)"
              % ("OK" if ok else "FAIL", len(res["errs"]), len(res["flags"])))
        if not ok:
            print("         ", res["errs"])

        # (2) THE REGRESSION: a SIBLING method's .s is cached. It names the class but not this
        #     method, so it must be DISCARDED — the deferral stub for getLockDependencies must not
        #     be judged against getLockingID's body.
        open(os.path.join(dis, "Ozone.__ZNK18Fixture3DPlacement12getLockingIDEv.s"), "w").write(GETTER_S)
        res = run_g5(ts, dis)
        ok = not res["errs"]
        fails += (0 if ok else 1)
        print("  %-6s sibling-method .s cached -> %d cheat(s), %d flag(s) (want 0 cheats: a "
              "sibling's body may not judge this method)"
              % ("OK" if ok else "FAIL", len(res["errs"]), len(res["flags"])))
        if not ok:
            print("         ", res["errs"])

        # (3) The guard must not go too far: when the method's OWN disasm is cached and its body is
        #     REAL, an incompleteness throw is still a cheat and must still hard-reject.
        real = ("__ZNK18Fixture3DPlacement19getLockDependenciesEPvS0_:\n"
                "00000000003ca9e0\tpushq\t%rbp\n"
                "00000000003ca9e1\tmovq\t%rsp, %rbp\n"
                "00000000003ca9e4\tmovq\t%rsi, 0x18(%rdi)\n"
                "00000000003ca9e8\tmovq\t%rdx, 0x20(%rdi)\n"
                "00000000003ca9ec\taddq\t$0x148, %rdi\n"
                "00000000003ca9f3\tmovq\t%rdi, 0x28(%rsi)\n"
                "00000000003ca9f7\tpopq\t%rbp\n"
                "00000000003ca9f8\tretq\n")
        open(os.path.join(dis, "Ozone.__ZNK18Fixture3DPlacement19getLockDependenciesEPvS0_.s"),
             "w").write(real)
        res = run_g5(ts, dis)
        ok = len(res["errs"]) == 1 and "getLockDependencies" in res["errs"][0]
        fails += (0 if ok else 1)
        print("  %-6s own REAL .s cached -> %d cheat(s) (want exactly 1: the guard must not make "
              "G5 toothless)" % ("OK" if ok else "FAIL", len(res["errs"])))
        if not ok:
            print("         ", res["errs"], res["flags"])

        # (4) TEETH, in a MULTI-export file (the single-export escape hatch cannot help here): both
        #     methods' own .s are cached, so each export must be judged against ITS OWN body — the
        #     REAL one rejects, the trivial getter accepts.
        ts2 = os.path.join(d, "Fixture3DPlacement2.ts")
        open(ts2, "w").write(TS_SRC_TWO)
        dis2 = os.path.join(d, "disasm2"); os.makedirs(dis2)
        open(os.path.join(dis2, "Ozone.__ZNK19Fixture3DPlacement212getLockingIDEv.s"), "w").write(
            GETTER_S.replace("18Fixture3DPlacement", "19Fixture3DPlacement2"))
        open(os.path.join(dis2, "Ozone.__ZNK19Fixture3DPlacement219getLockDependenciesEPvS0_.s"),
             "w").write(real.replace("18Fixture3DPlacement", "19Fixture3DPlacement2"))
        res = run_g5(ts2, dis2)
        ok = len(res["errs"]) == 1 and "getLockDependencies" in res["errs"][0]
        fails += (0 if ok else 1)
        print("  %-6s multi-export, both .s cached -> %d cheat(s) (want exactly 1: each export "
              "judged against its OWN body)" % ("OK" if ok else "FAIL", len(res["errs"])))
        if not ok:
            print("         ", res["errs"], res["flags"])

        # (5) The Itanium special members must still resolve: a `_ctor` export can never contain its
        #     symbol's spelling (`C2Ev`), so without the alias table every ctor/dtor in the corpus
        #     would silently drop to a flag — teeth lost on exactly the plumbing that gets stubbed.
        ts3 = os.path.join(d, "Fixture3DPlacement3.ts")
        open(ts3, "w").write(TS_SRC_CTOR)
        dis3 = os.path.join(d, "disasm3"); os.makedirs(dis3)
        open(os.path.join(dis3, "Ozone.__ZN19Fixture3DPlacement3C2EPv.s"), "w").write(
            real.replace("__ZNK18Fixture3DPlacement19getLockDependenciesEPvS0_",
                         "__ZN19Fixture3DPlacement3C2EPv"))
        # a sibling of ANOTHER class must not answer for it, even with the alias
        open(os.path.join(dis3, "Ozone.__ZN14SomeOtherClassC2EPv.s"), "w").write(GETTER_S)
        res = run_g5(ts3, dis3)
        ok = len(res["errs"]) == 1 and "_ctor" in res["errs"][0]
        fails += (0 if ok else 1)
        print("  %-6s `_ctor` export + class's own C2E .s -> %d cheat(s) (want exactly 1: the "
              "Itanium special-member alias keeps resolving)"
              % ("OK" if ok else "FAIL", len(res["errs"])))
        if not ok:
            print("         ", res["errs"], res["flags"])

    print()
    print("test_g5_bare_key:", "PASS ✅" if fails == 0 else "FAIL ❌ (%d fail)" % fails)
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
