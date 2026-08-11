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
TOOLS = os.path.join(os.path.dirname(HERE), "tools")
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
    # 2c — the same question one level FINER, and for G5 itself: within the right class, is it the
    # right METHOD? #322 made a bare-key hit prove it names the CLASS, but not the method, so
    # find_disasm(<class>) handed whichever of the class's methods was cached to EVERY export in the
    # file — 11 fabricated cheat verdicts on one landed file, triggered by deriving the disasm the
    # worker brief REQUIRES. Locked by fixtures in test_g5_bare_key.py.
    r3 = run([sys.executable, os.path.join(HERE, "test_g5_bare_key.py")])
    ok3 = "test_g5_bare_key: PASS" in r3.stdout
    print("LAYER 2c (G5 bare-key guard — right method, not just right class):",
          "PASS" if ok3 else "FAIL")
    if not ok3: print(r3.stdout[-1200:], r3.stderr[-400:])
    # 2d — the status reconciler's fast path must agree with the reference it replaced. The
    # depth/enclosing-class test decides whether a throw-only body demotes a unit from `ported` to
    # `stub`; drift there moves the headline number silently, in the flattering direction. The
    # batch scanner is 29x faster than the per-def originals, which remain in the tree AS the
    # reference this compares against.
    r4 = run([sys.executable, os.path.join(HERE, "test_brace_context.py")])
    ok4 = "BRACE_CONTEXT: PASS" in r4.stdout
    print("LAYER 2d (status reconciler brace-context — fast path == reference):",
          "PASS" if ok4 else "FAIL")
    if not ok4: print(r4.stdout[-1200:], r4.stderr[-400:])

    # 2e — the rebase path. Not a cheat-detection layer: a work-PRESERVATION one. Three failures in
    # one day routed finished work into the discard pile — a cited .s filename read as a symbol and
    # false-BAILed a disjoint union, a class-keyed branch guess handed a reviewer another PR's
    # content, and a rebase silently dropped the branch's non-src files (an oracle harness, lost to
    # a force-push). None could be caught by a gate: each produces output that is itself gate-clean.
    r5 = run([sys.executable, os.path.join(HERE, "test_rebase_tools.py")])
    ok5 = "test_rebase_tools: PASS" in r5.stdout
    print("LAYER 2e (rebase path — no phantom symbols, no branch guessing, no dropped files):",
          "PASS" if ok5 else "FAIL")
    if not ok5: print(r5.stdout[-1200:], r5.stderr[-400:])
    # 2f — the guards that stop a TOOL from overriding a PERSON. A mechanical success must not paper
    # over a reviewer's rejection; a signature must not slide onto a head that moved; a slot must not
    # be handed on mid-rebase or carrying disasm residue that switches off the blind-spot flag.
    # Every case is mutation-checked (revert the fix, watch it go red) — one of them originally
    # passed with its own fix deleted, because it matched the explanatory comment rather than code.
    r6 = run([sys.executable, os.path.join(HERE, "test_guards.py")])
    ok6 = "test_guards: PASS" in r6.stdout
    print("LAYER 2f (guards — no status override, no head drift, no dirty slot handover):",
          "PASS" if ok6 else "FAIL")
    if not ok6: print(r6.stdout[-1200:], r6.stderr[-400:])
    # 2g — pr_land's approval CARRY. It decides whether a reviewer's APPROVE survives the head move
    # that pr_land's own `update-branch` causes, i.e. it is a guard about a MERGE, and its first
    # version failed OPEN (two unreadable commits hashed to the same empty digest and compared
    # equal). It shipped with a suite that NOTHING RAN — OPS_LOG row 44's exact shape, and worse
    # than no test, because pr_land's comment told the next reader the function was pinned. This is
    # that caller. 1.4s, and every case is mutation-checked inside the suite.
    r7 = run(["bash", os.path.join(TOOLS, "test_pr_land_carry.sh")])
    ok7 = "TEST_PR_LAND_CARRY: PASS" in r7.stdout
    print("LAYER 2g (pr_land approval carry — tree identity, never fail-open):",
          "PASS" if ok7 else "FAIL")
    if not ok7: print(r7.stdout[-1200:], r7.stderr[-400:])
    # 2h — the walk that recovers WHICH HEAD a reviewer signed. GitHub re-points a review's
    # commit_id forward onto every `Merge branch 'main' into …` that update-branch makes (+3s to
    # +39s after submission; two hops on #585), so 2g's comparison is only as good as the walk that
    # finds the reviewed commit. One hop too far compares against an older head; one too few
    # compares a commit with itself and always agrees. 0.3s.
    r8 = run(["bash", os.path.join(TOOLS, "test_pr_land_signed_head.sh")])
    ok8 = "TEST_PR_LAND_SIGNED_HEAD: PASS" in r8.stdout
    print("LAYER 2h (pr_land signed-head recovery — the rebound commit_id is not the reviewed head):",
          "PASS" if ok8 else "FAIL")
    if not ok8: print(r8.stdout[-1200:], r8.stderr[-400:])
    # 2i — swarm_doctor's COVERAGE check, the one assertion that re-states a queue's behaviour
    # (it lifts each selector, then re-applies rebase_claim's status-description grep). A
    # re-statement that drifts does not fail loudly: it accuses PRs the queue is handing out, or
    # certifies stranded ones, in the report AGENT_ENTRY tells every agent to trust — and the first
    # version of that check did report two live PRs backwards in one run. Pinned here because
    # rebase_claim can now select a CONFLICTED PR without reading any description. Offline (gh, sh
    # and from_main are stubbed), ~0.2s, every case mutation-checked inside the suite.
    r9 = run([sys.executable, os.path.join(HERE, "test_queue_coverage.py")])
    ok9 = "test_queue_coverage: PASS" in r9.stdout
    print("LAYER 2i (queue coverage — the doctor follows the queues instead of disagreeing):",
          "PASS" if ok9 else "FAIL")
    if not ok9: print(r9.stdout[-1200:], r9.stderr[-400:])
    # 2j — the pool's release ownership. The suite existed on main and NOTHING RAN IT: row 44's
    # shape for the third time, and the guard it pinned was opt-in on a caller-supplied tag that no
    # caller supplies, so both the test and the guard were decoration. Wired here in the same PR
    # that gives the guard a key the caller cannot forget (the claim-time FCT_AGENT_ID). ~2s.
    r10 = run(["bash", os.path.join(TOOLS, "test_wt_pool_release_ownership.sh")])
    ok10 = "test_wt_pool_release_ownership: PASS" in r10.stdout
    print("LAYER 2j (worktree release ownership — a peer's live slot is never reset):",
          "PASS" if ok10 else "FAIL")
    if not ok10: print(r10.stdout[-1200:], r10.stderr[-400:])
    return ok and ok2 and ok3 and ok4 and ok5 and ok6 and ok7 and ok8 and ok9 and ok10

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
