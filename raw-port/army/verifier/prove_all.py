#!/usr/bin/env python3
"""prove_all.py — ONE command that proves the whole anti-cheat verifier stack is un-gameable.

Runs three layers and asserts every fixture verdict:

  LAYER 1 — executable differential oracle (Tier-1, callable pure fns): prove.py
     real  -> VERIFIED (abs 0 vs live FCP);  shell -> FAILED;  wrong/noop -> DIVERGED.

  LAYER 2 — structural classifier (dispenser filter + reviewer signal): test_classify.py
     the 7385eb01 cheat -> DISPATCH_ONLY (never a leaf);  real math -> REAL;  trivial -> EMPTY.

  LAYER 3 — Tier-3 reachability verdict (non-callable fns): reach_check on fixtures
     7385eb01 cheat            -> SKELETON (never `ported`)
     class-C (REAL + throw)    -> REJECT_CHEAT
     real-work port            -> LIKELY_REAL

Exit 0 iff ALL layers pass. This is the gate that MUST pass before any swarm restart.
"""
import os, sys, subprocess, json

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))

def run(cmd):
    return subprocess.run(cmd, cwd=REPO, capture_output=True, text=True)

def layer1():
    r = run([sys.executable, os.path.join(HERE, "prove.py")])
    ok = "PROVE: PASS" in r.stdout
    print("LAYER 1 (executable oracle):", "PASS" if ok else "FAIL")
    if not ok: print(r.stdout[-800:], r.stderr[-400:])
    return ok

def layer2():
    r = run([sys.executable, os.path.join(HERE, "test_classify.py")])
    ok = "test_classify: PASS" in r.stdout
    print("LAYER 2 (structural classifier):", "PASS" if ok else "FAIL")
    if not ok: print(r.stdout[-800:], r.stderr[-400:])
    # 2b — RESOLUTION, not just classification. "Given the right .s, is the verdict right?" is only
    # half the contract; the other half is "is it the right .s at all?". A class name that is a
    # substring of another class's name resolved to the WRONG class's body (PR #253: HGRenderNode ->
    # OZHGRenderNodeBase::finished, DISPATCH_ONLY) — a false REJECT there, and a false ACCEPT
    # wherever the wrong body happens to be EMPTY. Locked by fixtures in test_find_disasm.py.
    r2 = run([sys.executable, os.path.join(HERE, "test_find_disasm.py")])
    ok2 = "test_find_disasm: PASS" in r2.stdout
    print("LAYER 2b (disasm resolution — right function, not just right verdict):",
          "PASS" if ok2 else "FAIL")
    if not ok2: print(r2.stdout[-1200:], r2.stderr[-400:])
    return ok and ok2

def _reach(spec, expect):
    import tempfile
    f = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
    json.dump(spec, f); f.close()
    r = run([sys.executable, os.path.join(HERE, "reach_check.py"), f.name])
    os.unlink(f.name)
    try:
        got = json.loads(r.stdout)["verdict"]
    except Exception:
        print("   reach_check error:", r.stdout[-300:], r.stderr[-200:]); return False
    ok = got == expect
    print("   %-6s expect=%-16s got=%-16s %s" % ("OK" if ok else "FAIL", expect, got, spec["export"]))
    return ok

def layer3():
    D = os.path.join(REPO, "raw-port", "re", "disasm")
    # SELF-HEAL THE FIXTURE DISASM. `raw-port/re/disasm/` is gitignored (it is a generated cache), so
    # a freshly leased pool worktree has NONE of it — and Layer 3 resolves its fixtures from there.
    # Result: prove_all PASSES in the canonical checkout and FAILS with `got=UNKNOWN` in any pool
    # worktree. That is a trap, because REVIEWER_BRIEF tells every reviewer to run prove_all at
    # startup and to sign nothing unless it passes: a reviewer running it from a leased worktree
    # either stops working or learns to ignore the verifier. Both are worse than the bug.
    # Regenerating is cheap now (disasm.sh is indexed since #148 — sub-second), so rebuild whatever
    # is missing, and fall back to the canonical cache if the binary cannot be read.
    os.makedirs(D, exist_ok=True)
    sh = os.path.join(REPO, "raw-port", "tools", "disasm.sh")
    CANON_D = os.path.expanduser("~/random/final-cut-pro-transitions/raw-port/re/disasm")
    for fname, args in (
        ("ProChannel.OZBezierInterpolator.interpolate.s",
         ["OZBezierInterpolator", "interpolate", "ProChannel"]),
        ("ProChannel.__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime.s",
         ["--sym", "__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime", "ProChannel"]),
    ):
        dst = os.path.join(D, fname)
        if os.path.exists(dst):
            continue
        subprocess.run(["bash", sh] + args, capture_output=True, cwd=REPO)
        if not os.path.exists(dst) and os.path.exists(os.path.join(CANON_D, fname)):
            import shutil; shutil.copy(os.path.join(CANON_D, fname), dst)
        if not os.path.exists(dst):
            print(f"   NOTE: could not materialize Layer-3 fixture {fname}")
    specs = [
      ({"symbol":"__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime",
        "module":"raw-port/src/channels/OZDynamicSpline.ts","export":"OZDynamicSpline_setVertexSmooth",
        "params":[{"type":"unknown"},{"type":"unknown"},{"type":"boolean"},{"type":"CMTime"}],"cap":256},
       "SKELETON"),
      ({"disasm":os.path.join(D,"ProChannel.OZBezierInterpolator.interpolate.s"),
        "module":"raw-port/army/verifier/_mutants/real_but_throws.ts","export":"interpolate",
        "params":[{"type":"number"},{"type":"number"},{"type":"number"}],"cap":128},
       "REJECT_CHEAT"),
      ({"disasm":os.path.join(D,"ProChannel.OZBezierInterpolator.interpolate.s"),
        "module":"raw-port/army/verifier/_mutants/real_impl.ts","export":"interpolate",
        "params":[{"type":"number"},{"type":"number"},{"type":"number"}],"cap":128},
       "LIKELY_REAL"),
    ]
    print("LAYER 3 (Tier-3 reachability verdict):")
    allok = True
    for spec, expect in specs:
        allok = _reach(spec, expect) and allok
    print("LAYER 3:", "PASS" if allok else "FAIL")
    return allok

def _write_mutants():
    m = os.path.join(HERE, "_mutants"); os.makedirs(m, exist_ok=True)
    open(os.path.join(m,"real_but_throws.ts"),"w").write(
      '// @ProChannel interpolate — REAL disasm but body throws. Class-C cheat.\n'
      'export function interpolate(_a: number, _b: number, _c: number): number {\n'
      '  throw new Error("OZBezierInterpolator::interpolate not yet transcribed @ProChannel");\n}\n')
    open(os.path.join(m,"real_impl.ts"),"w").write(
      '// @ProChannel interpolate — illustrative real body, does arithmetic, never throws incompleteness.\n'
      'export function interpolate(a: number, b: number, c: number): number {\n'
      '  const t = c - a * b; return t * 0.5 + a;\n}\n')

def main():
    _write_mutants()
    r1 = layer1(); r2 = layer2(); r3 = layer3()
    allok = r1 and r2 and r3
    print()
    print("PROVE_ALL:", "PASS ✅ — the anti-cheat verifier stack rejects known cheats and accepts real ports"
          if allok else "FAIL ❌")
    return 0 if allok else 1

if __name__ == "__main__":
    sys.exit(main())
