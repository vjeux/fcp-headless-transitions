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

# ── LAYER 2 TABLE ────────────────────────────────────────────────────────────────────────────────
# One row per sub-layer: (label, description, command, pass-token). ADD A ROW; touch nothing else.
# The label is a string, so no two PRs can be assigned the same letter by the merge — and if two
# rows ever DO share one, `check_layer_labels` below says so instead of one silently shadowing the
# other. Rows run in order; a row's own comment sits above it, where it survives a merge intact.
LAYER2 = [
    ("2",
     "structural classifier",
     [sys.executable, os.path.join(HERE, "test_classify.py")],
     "test_classify: PASS"),
    # 2b — RESOLUTION, not just classification. "Given the right .s, is the verdict right?" is only
    # half the contract; the other half is "is it the right .s at all?". A class name that is a
    # substring of another class's name resolved to the WRONG class's body (PR #253: HGRenderNode ->
    # OZHGRenderNodeBase::finished, DISPATCH_ONLY) — a false REJECT there, and a false ACCEPT
    # wherever the wrong body happens to be EMPTY. Locked by fixtures in test_find_disasm.py.
    ("2b",
     "disasm resolution — right function, not just right verdict",
     [sys.executable, os.path.join(HERE, "test_find_disasm.py")],
     "test_find_disasm: PASS"),
    # 2c — the same question one level FINER, and for G5 itself: within the right class, is it the
    # right METHOD? #322 made a bare-key hit prove it names the CLASS, but not the method, so
    # find_disasm(<class>) handed whichever of the class's methods was cached to EVERY export in the
    # file — 11 fabricated cheat verdicts on one landed file, triggered by deriving the disasm the
    # worker brief REQUIRES. Locked by fixtures in test_g5_bare_key.py.
    ("2c",
     "G5 bare-key guard — right method, not just right class",
     [sys.executable, os.path.join(HERE, "test_g5_bare_key.py")],
     "test_g5_bare_key: PASS"),
    # 2d — the status reconciler's fast path must agree with the reference it replaced. The
    # depth/enclosing-class test decides whether a throw-only body demotes a unit from `ported` to
    # `stub`; drift there moves the headline number silently, in the flattering direction. The
    # batch scanner is 29x faster than the per-def originals, which remain in the tree AS the
    # reference this compares against.
    ("2d",
     "status reconciler brace-context — fast path == reference",
     [sys.executable, os.path.join(HERE, "test_brace_context.py")],
     "BRACE_CONTEXT: PASS"),
    # 2e — the rebase path. Not a cheat-detection layer: a work-PRESERVATION one. Three failures in
    # one day routed finished work into the discard pile — a cited .s filename read as a symbol and
    # false-BAILed a disjoint union, a class-keyed branch guess handed a reviewer another PR's
    # content, and a rebase silently dropped the branch's non-src files (an oracle harness, lost to
    # a force-push). None could be caught by a gate: each produces output that is itself gate-clean.
    ("2e",
     "rebase path — no phantom symbols, no branch guessing, no dropped files",
     [sys.executable, os.path.join(HERE, "test_rebase_tools.py")],
     "test_rebase_tools: PASS"),
    # 2f — the guards that stop a TOOL from overriding a PERSON. A mechanical success must not paper
    # over a reviewer's rejection; a signature must not slide onto a head that moved; a slot must not
    # be handed on mid-rebase or carrying disasm residue that switches off the blind-spot flag.
    # Every case is mutation-checked (revert the fix, watch it go red) — one of them originally
    # passed with its own fix deleted, because it matched the explanatory comment rather than code.
    ("2f",
     "guards — no status override, no head drift, no dirty slot handover",
     [sys.executable, os.path.join(HERE, "test_guards.py")],
     "test_guards: PASS"),
    # 2g — pr_land's approval CARRY. It decides whether a reviewer's APPROVE survives the head move
    # that pr_land's own `update-branch` causes, i.e. it is a guard about a MERGE, and its first
    # version failed OPEN (two unreadable commits hashed to the same empty digest and compared
    # equal). It shipped with a suite that NOTHING RAN — OPS_LOG row 44's exact shape, and worse
    # than no test, because pr_land's comment told the next reader the function was pinned. This is
    # that caller. 1.4s, and every case is mutation-checked inside the suite.
    ("2g",
     "pr_land approval carry — tree identity, never fail-open",
     ["bash", os.path.join(TOOLS, "test_pr_land_carry.sh")],
     "TEST_PR_LAND_CARRY: PASS"),
    # 2h — the walk that recovers WHICH HEAD a reviewer signed. GitHub re-points a review's
    # commit_id forward onto every `Merge branch 'main' into …` that update-branch makes (+3s to
    # +39s after submission; two hops on #585), so 2g's comparison is only as good as the walk that
    # finds the reviewed commit. One hop too far compares against an older head; one too few
    # compares a commit with itself and always agrees. 0.3s.
    ("2h",
     "pr_land signed-head recovery — the rebound commit_id is not the reviewed head",
     ["bash", os.path.join(TOOLS, "test_pr_land_signed_head.sh")],
     "TEST_PR_LAND_SIGNED_HEAD: PASS"),
    # 2i — swarm_doctor's COVERAGE check, the one assertion that re-states a queue's behaviour
    # (it lifts each selector, then re-applies rebase_claim's status-description grep). A
    # re-statement that drifts does not fail loudly: it accuses PRs the queue is handing out, or
    # certifies stranded ones, in the report AGENT_ENTRY tells every agent to trust — and the first
    # version of that check did report two live PRs backwards in one run. Pinned here because
    # rebase_claim can now select a CONFLICTED PR without reading any description. Offline (gh, sh
    # and from_main are stubbed), ~0.2s, every case mutation-checked inside the suite.
    ("2i",
     "queue coverage — the doctor follows the queues instead of disagreeing",
     [sys.executable, os.path.join(HERE, "test_queue_coverage.py")],
     "test_queue_coverage: PASS"),
    # 2j — THE PR'S BASE. Nothing in the swarm read `baseRefName`: pr_gate diffs `origin/main...HEAD`
    # while pr_land merges into the PR's OWN base, so a PR stacked on another PR's branch got a green
    # status covering three PRs' commits and would have been merged where no branch protection
    # applies. Both tools now refuse; this pins both refusals AND the two decisions inside them (the
    # gate posts no status, so the PR stays claimable; pr_land fails OPEN on an unanswered query, so
    # a TLS blip cannot wedge every merge). Offline, guards extracted from the shipped files. ~1s.
    ("2j",
     "a PR's base must be main — the gate and the merge target must agree",
     ["bash", os.path.join(TOOLS, "test_pr_base_is_main.sh")],
     "test_pr_base_is_main: PASS"),
    # 2k — WHICH QUEUE OWNS A G5-FLAGGED PR. The gate cannot clear a NO-DISASM blind spot itself; it
    # fails with "reviewer must re-derive disasm" and hands the PR back to a reviewer. No queue
    # offered it: review_claim excluded every FAILURE, rebase_claim takes regression/rebase only,
    # rework_claim takes CHANGES_REQUESTED only. #645 sat claimable-by-nobody until queue-coverage
    # noticed. Offline, jq-backed fixtures with the real status descriptions. ~1s.
    # (2k, not 2i or 2j: written when 2i was free, then main took 2i (queue coverage) and 2j
    #  (PR base) while this PR was open. Renumbered again on this rebase, as its own note asked —
    #  two layers claiming one letter is the kind of silent collision this suite exists to refuse.
    #  Third collision on this line today; the letters are allocated by whoever merges first.)
    ("2k",
     "queue ownership of a G5-flagged PR — the gate asked for a reviewer",
     ["bash", os.path.join(TOOLS, "test_review_claim_g5.sh")],
     "test_review_claim_g5: PASS"),
    # 2l — the cross-queue lease guard. A PR that is CHANGES_REQUESTED *and* CONFLICTING sits in
    # BOTH worker queues, and until #643 taught rebase_claim to see DIRTY branches that combination
    # was rare. It is not rare now: measured the same hour, two workers held the two leases on #656
    # 66 seconds apart and both began reconciling the same 936-line PR. Offline, ~0.2s, and each
    # case is mutation-checked inside the suite.
    ("2l",
     "cross-queue lease — one PR is never handed to two workers",
     ["bash", os.path.join(TOOLS, "test_cross_queue_lease.sh")],
     "TEST_CROSS_QUEUE_LEASE: PASS"),
    # 2p — nothing may force-push a PR head. pr_land squashes every PR, so main's linear history
    # never came from rebasing the branch; the force-push bought three destructive incidents instead
    # (files silently dropped, 92 reviewer-verified lines replaced by an empty branch, and a PR
    # CLOSED by forcing onto a commit already on main). Every path now merges main in and
    # fast-forwards, and git_push_as.sh refuses a force at a branch with an open PR.
    # Offline: local bare repo, stubbed gh. ~1s.
    ("2p",
     "no force-push at a PR head — a PR head may only GAIN commits",
     ["bash", os.path.join(TOOLS, "test_no_force_push.sh")],
     "test_no_force_push: PASS"),
    # 2s — the self-heal that clears attempt counters whose PR has already merged. It only looked at
    # counters AT the cap, while swarm_doctor flags any dead counter at all, so the tool reporting
    # the fault and the tool fixing it disagreed by construction and the board could never go green.
    # Offline, function extracted from the shipped file, stubbed gh. ~0.5s.
    #
    # LETTER AND VARIABLES, third renumbering of this block (2i -> 2j -> 2l -> 2s): main took 2l and
    # r12/ok12 for the cross-queue lease above. Keeping BOTH sides is the only safe resolution — a
    # layer that is not in the file cannot fail
    # (army/ops/2026-08-11-every-tooling-pr-conflicts-on-prove-alls-layer-tail.md) — and the VARIABLE
    # has to move with the letter, which is the half that is easy to miss: two blocks both assigning
    # `ok12` still PRINT correctly, because each print follows its own assignment, while the single
    # `return` names `ok12` once, so the later block's result silently decides the verdict for both
    # and a RED layer returns PASS. Measured, and filed as
    # army/ops/2026-08-11-two-prove-all-layers-sharing-an-ok-variable-make-a-red-layer.md. One
    # worker is holding five merges on this tail right now, allocated disjointly in both letters and
    # variables: #656 2m/2n/2o r13-r15, #715 2p r16, #714 2q r17, #655 2r r18/r19, this one 2s r20.
    ("2s",
     "dead attempt counters — the reaper can reach what the doctor reports",
     ["bash", os.path.join(TOOLS, "test_reap_dead_counters.sh")],
     "test_reap_dead_counters: PASS"),
    # 2u — a driver that does not terminate. Two mutants held a core for 2h31m because 69 of 69
    # driver spawns had no timeout: "a mutant must fail" had been read as "returns a wrong answer",
    # never as "never returns". Offline, real node on a two-line fixture. ~28s.
    #
    # LETTER: this block went out as 2m, was renumbered 2u against the hand-written tail, and is now
    # a ROW — which is the point of main's refactor: there is no variable to collide any more, only
    # a label, and check_layer_labels() refuses a duplicate before anything runs. Kept 2u because it
    # is what the reviewer verified and what the PR body cites.
    ("2u",
     "driver timeout — a hang is a kill, not a pending result",
     ["bash", os.path.join(TOOLS, "test_driver_timeout.sh")],
     "test_driver_timeout: PASS"),
    # 2v — the doctor's verifier-contention counting. The check reports a NUMBER and the number is
    # the whole message: "8 concurrent prove_all.py runs" is actionable, the naive `pgrep | wc -l`
    # of the same pile-up says 20 (it counts each run's sh wrapper and its timeout), and "1" while a
    # run is live is a false all-clear. Offline, driven over the captured `ps` output of the real
    # incident, with three mutants that must break the cases they cover. ~0.2s.
    #
    # LETTER: 2v is the next free one (main holds 2p and 2u; #656 holds 2m-2o, #714 2q, #655 2r,
    # #651 2s, #696 2t). As a ROW there is no r<N>/ok<N> left to collide — what the table refactor
    # bought — and check_layer_labels() refuses a duplicate label before any layer runs.
    ("2v",
     "verifier contention — the doctor counts RUNS, not the wrappers around them",
     [sys.executable, os.path.join(TOOLS, "test_verifier_contention.py")],
     "test_verifier_contention: PASS"),
    # LETTER: this went out as 2v and is renumbered to 2w because #735 took 2v first —
    # a collision between two PRs neither of which could see the other's choice, which is
    # the thing THIS row's check reports. Keeping both rows is the only safe resolution;
    # taking a side would delete a layer and the suite would still print PASS.
    # 2w — the doctor's own duplicate-label check, which THIS table's arrival silently retired: its
    # pattern was `print("LAYER 2<letter>` and it matched nothing here, so `swarm_doctor` reported
    # `?? layer-letters … not evidence of anything` on every run, permanently, against a main whose
    # fifteen labels were all distinct. An UNKNOWN that no correct state can clear is a check that
    # has stopped checking while still occupying a line in the report. The suite feeds the extractor
    # BOTH shapes plus an unrecognisable one, so the next refactor of this file fails a suite instead
    # of quietly retiring a guard. Offline — no gh, no network, no pool. ~2s.
    ("2w",
     "the doctor can still read this table — a refactor must not silently retire its check",
     [sys.executable, os.path.join(TOOLS, "test_doctor_layer_labels.py")],
     "test_doctor_layer_labels: PASS"),
]

def check_layer_labels():
    """A label may appear once. Two rows sharing one is the old `ok12` collision in table form:
    both print, and a reader reconciling `LAYER 2l` against a PR cannot tell which row answered.
    Cheap, and it runs before anything else so the suite cannot report on a table it distrusts."""
    seen, dupes = set(), []
    for label, *_ in LAYER2:
        if label in seen:
            dupes.append(label)
        seen.add(label)
    return dupes


def layer2():
    """LAYER 2 and its sub-layers, as DATA.

    THIS USED TO BE THIRTEEN HAND-NUMBERED BLOCKS, and the numbering was the single busiest merge
    conflict in the repo: every new check appended a `LAYER 2<letter>`, an `r<N>`/`ok<N>` pair, and a
    term in one `return ok and ok2 and …` line, so any two tooling PRs collided on all three. Six
    were in flight on this tail at once; one worker had to allocate letters AND variables by hand
    across five PRs (2m-2u, r13-r22), and the block below this docstring carried a comment recording
    its THIRD renumbering (2i -> 2j -> 2l -> 2s).

    The conflict was never the danger. These were:

      * "take mine" on that hunk silently DELETES a peer's landed layer. The file parses, the suite
        prints PASS, and the dropped check never runs again — invisible to every gate.
      * two blocks assigning the same `ok12` both PRINT correctly (each print follows its own
        assignment) while the single `return` names `ok12` once, so the later block decides the
        verdict for both and **a RED layer returns PASS**. Measured, with `LAYER 2l … FAIL` printed
        directly above `PROVE_ALL: PASS`, exit 0.
      * a mechanical merge left TWO `return` statements, the second unreachable, so the conjunction
        was computed without the new layer.

    A table has none of those failure modes by construction: there is no letter to collide (the
    label is text in a row), no variable to share (results are a list), and no conjunction to edit
    (`all(...)`). Two PRs adding a layer now conflict only if they add it at the same position, and
    the union of two rows is obviously correct in a way the union of three edits is not.

    Adding a layer = adding one row. Nothing else.
    """
    dupes = check_layer_labels()
    if dupes:
        print(f"LAYER 2: DUPLICATE LABEL(S) {dupes} — two rows claim the same layer, so a reader "
              f"cannot tell which one answered. Fix the table before trusting this run.")
        return False
    results = []
    for label, desc, cmd, token in LAYER2:
        r = run(cmd)
        ok = token in r.stdout
        print(f"LAYER {label} ({desc}):", "PASS" if ok else "FAIL")
        if not ok:
            print(r.stdout[-1200:], r.stderr[-400:])
        results.append(ok)
    # EVERY row is counted. The old conjunction had to name each variable, which is exactly how a
    # layer got computed, printed, and then left out of the verdict.
    if len(results) != len(LAYER2):
        print(f"PROVE_ALL: INTERNAL — ran {len(results)} of {len(LAYER2)} layers")
        return False
    return all(results)

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
