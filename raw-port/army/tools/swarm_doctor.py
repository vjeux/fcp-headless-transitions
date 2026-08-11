#!/usr/bin/env python3
"""swarm_doctor.py — assert the swarm's standing invariants NOW, instead of rediscovering them.

WHY THIS EXISTS
---------------
OPS_LOG holds 35 fixed entries and 37 open sections. Essentially every one was found the same way:
an agent TRIPPED OVER IT while doing something else, lost work or time, and wrote it up. That is
discovery by collision, and it costs a unit of real work per finding.

Almost all of them are also ONE SHAPE: **a tool reports success while doing the wrong thing.** A
rebase drops files and gates green. A status post erases a rejection and exits 0. A filter matches
nothing and returns NONE. A guard is never invoked and stays silent. A test passes with its own fix
deleted. None of these can be caught downstream, because the output looks right — so a downstream
gate is the wrong instrument, and a periodic ASSERTION is the right one.

So this file is the other half of OPS_LOG. OPS_LOG says what went wrong once; this says what is
wrong right now. Every check below is derived from a specific incident, and every check is written
so that it CAN FAIL — that discipline is itself an OPS_LOG entry, learned five times in one day.

The most valuable check here is COVERAGE (`check_queue_coverage`). Two of today's worst findings —
31 rejected PRs invisible to every queue, and conflicted non-src PRs invisible to every queue — are
the same bug discovered twice, months of agent-hours apart in swarm time. Rather than wait to
discover the third, assert the general property: **every open PR must be claimable by SOME queue.**
A work item no queue can see is invisible, indefinitely, and nothing else in the system notices.

USAGE
    python3 raw-port/army/tools/swarm_doctor.py            # human-readable report
    python3 raw-port/army/tools/swarm_doctor.py --quiet    # print only problems (for cron)
    python3 raw-port/army/tools/swarm_doctor.py --json     # machine-readable

EXIT: 0 all clear · 1 one or more FAILs · 2 could not run some check (never silently "fine")
"""
import argparse
import collections
import json
import os
import subprocess
import sys
import time

SLUG = os.environ.get("FCT_REPO", "vjeux/fcp-headless-transitions")
CANON = os.path.expanduser("~/random/final-cut-pro-transitions")
STATE = os.environ.get("FCT_STATE_DIR", os.path.expanduser("~/.fct-pool"))

OK, FAIL, UNKNOWN = "OK", "FAIL", "UNKNOWN"
results = []


def record(name, status, detail, incident=""):
    results.append({"check": name, "status": status, "detail": detail, "incident": incident})


def sh(cmd, cwd=CANON, timeout=120):
    try:
        return subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        class R:
            returncode, stdout, stderr = -1, "", "timeout"
        return R()


def gh_json(args, tries=3):
    """A gh query, retried. Returns (data, error). A transient failure is UNKNOWN, never OK."""
    for i in range(tries):
        r = sh(f"gh {args}")
        if r.returncode == 0 and r.stdout.strip():
            try:
                return json.loads(r.stdout), None
            except Exception as e:
                return None, f"unparseable: {e}"
        err = (r.stderr or "").strip()
        time.sleep(1 + i)
    return None, err or "empty response"


# ── 1. COVERAGE: every open PR must be claimable by SOME queue ──────────────────────────────────
def check_queue_coverage():
    """The generalisation of two separate incidents, both 'work no queue could see'.

    #33: 31 PRs sat CHANGES_REQUESTED, oldest 16h untouched, while every reviewer polled NONE —
         review_claim skips them (author's turn), rebase_claim needs a gate FAILURE, depclaim only
         hands out fresh symbols. Three correct components, one uncovered state.
    #41: a conflicted PR touching no raw-port/src short-circuits pr_gate to SUCCESS, so it is green,
         invisible to rebase_claim, and never re-offered by review_claim. Sits open forever.

    Both were found by a human noticing a number looked wrong. This asserts the property instead.
    """
    prs, err = gh_json(f"pr list --repo {SLUG} --state open --limit 200 "
                       "--json number,reviewDecision,mergeStateStatus,statusCheckRollup,updatedAt")
    if prs is None:
        return record("queue-coverage", UNKNOWN, f"could not list PRs: {err}", "#33/#41")

    orphans = []
    for pr in prs:
        n = pr["number"]
        decision = pr.get("reviewDecision") or ""
        merge_state = pr.get("mergeStateStatus") or ""
        gate = ""
        for s in (pr.get("statusCheckRollup") or []):
            if (s.get("context") or s.get("name")) == "faithfulness-gate":
                gate = (s.get("state") or s.get("conclusion") or "").upper()

        claimable_by = []
        if decision == "CHANGES_REQUESTED":
            claimable_by.append("rework_claim")          # worker fixes what the reviewer named
        if gate == "FAILURE" or merge_state == "DIRTY":
            claimable_by.append("rebase_claim")          # worker rebases / resolves
        if decision != "CHANGES_REQUESTED" and gate in ("", "NONE", "PENDING", "EXPECTED", "SUCCESS"):
            if decision != "APPROVED":
                claimable_by.append("review_claim")      # reviewer verdicts it
        if decision == "APPROVED" and gate == "SUCCESS" and merge_state not in ("DIRTY",):
            claimable_by.append("pr_land")               # ready to merge

        if not claimable_by:
            orphans.append((n, f"#{n} (review={decision or 'none'} gate={gate or 'none'} "
                               f"merge={merge_state or '?'})"))

    # CONFIRM EACH ORPHAN INDIVIDUALLY. A PR being merged right now looks exactly like an orphan in
    # a list snapshot — APPROVED, gate PENDING while pr_land re-gates, mergeStateStatus BLOCKED —
    # and the first run of this check reported #563 as stuck three seconds before it merged. A
    # doctor that cries wolf gets ignored, which is the same "guard nobody trusts" failure it exists
    # to prevent, so a candidate must still be OPEN and still uncoverable on a second, later look.
    confirmed = []
    if orphans:
        time.sleep(20)
        for n, desc in orphans:
            one, err = gh_json(f"pr view {n} --repo {SLUG} "
                               "--json state,reviewDecision,mergeStateStatus,statusCheckRollup", tries=2)
            if one is None:
                continue                      # cannot confirm -> do not accuse
            if one.get("state") != "OPEN":
                continue                      # it was mid-merge; not an orphan
            g2 = ""
            for s2 in (one.get("statusCheckRollup") or []):
                if (s2.get("context") or s2.get("name")) == "faithfulness-gate":
                    g2 = (s2.get("state") or s2.get("conclusion") or "").upper()
            if g2 in ("PENDING", "EXPECTED"):
                continue                      # a gate is running on it right now
            confirmed.append(desc)
    orphans = confirmed

    if orphans:
        return record("queue-coverage", FAIL,
                      f"{len(orphans)} open PR(s) NO queue can claim — they will sit indefinitely "
                      f"and nothing else notices: " + "; ".join(orphans[:6]), "#33/#41")
    record("queue-coverage", OK, f"all {len(prs)} open PRs are claimable by some queue", "#33/#41")


# ── 2. Every guard must actually be INVOKED by something ────────────────────────────────────────
def check_guards_wired():
    """#44: check_duplicate_classes.py worked perfectly and NOTHING ever called it — 7 duplicates
    accumulated on main while its docstring and PORTING_SPEC both called it a CI guard. A guard that
    is never called is indistinguishable from no guard, and reads as reassurance, which is worse."""
    guards = {
        "check_duplicate_classes.py": ["pr_gate.sh", "gate.sh", "prove_all.py"],
        "regression_check.py": ["pr_gate.sh", "gate.sh"],
        "dup_check.py": ["pr_gate.sh", "gate.sh"],
    }
    callers_text = ""
    for rel in ("raw-port/army/tools/pr_gate.sh", "raw-port/army/gate/gate.sh",
                "raw-port/army/verifier/prove_all.py", "raw-port/army/tools/swarm_maint.sh"):
        p = os.path.join(CANON, rel)
        if os.path.exists(p):
            callers_text += open(p, errors="replace").read()
    orphaned = [g for g in guards if g not in callers_text]
    if orphaned:
        return record("guards-wired", FAIL,
                      f"guard(s) that exist but nothing invokes: {', '.join(orphaned)}", "#44")
    record("guards-wired", OK, f"all {len(guards)} guards are invoked by a caller", "#44")


# ── 3. The canonical checkout must be current ───────────────────────────────────────────────────
def check_tree_current():
    """Measured 107 commits behind for most of one session. Every agent reads OPS_LOG, AGENT_ENTRY
    and the TOOLS from this tree, so a stale tree means agents rediscover fixed bugs with fixed
    tools they do not have. The fix for it could not even reach them, because the fix ships THROUGH
    the tree it is trying to advance."""
    sh("git fetch -q origin main")
    r = sh("git rev-list --count HEAD..origin/main")
    if r.returncode != 0:
        return record("tree-current", UNKNOWN, "could not count commits behind")
    behind = int(r.stdout.strip() or 0)
    # Threshold, not zero. A busy swarm lands ~20 commits per 15 minutes, and swarm_maint can only
    # fast-forward when the tree is clean and no gate process is live — so a couple of dozen commits
    # of drift is normal churn, not a fault. The incident this guards against was 107 behind for a
    # whole session, with OPS_LOG at 454 lines against 1,664 on main. Alert on that, not on churn.
    if behind > 50:
        return record("tree-current", FAIL,
                      f"canonical checkout is {behind} commits behind origin/main — every agent is "
                      f"reading a stale OPS_LOG and running stale tools", "#swarm_maint ff")
    record("tree-current", OK, f"canonical checkout is {behind} commit(s) behind")


# ── 4. No work stranded at an attempt cap ───────────────────────────────────────────────────────
def check_no_stranded():
    """#28: the rebase cap counted CLAIMS, not failures, and closed green APPROVED oracle-verified
    PRs. Fixed — but counters INFLATED by the old bug stayed at the cap and kept work invisible, so
    the fix alone did not free them. State outlives the bug that created it."""
    stranded = []
    for kind, cap_env, default in (("rebase", "REBASE_ATTEMPT_CAP", 3), ("rework", "REWORK_ATTEMPT_CAP", 3)):
        d = os.path.join(STATE, f"{kind}_attempts")
        cap = int(os.environ.get(cap_env, default))
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if f.endswith(".sha"):
                continue
            try:
                n = int(open(os.path.join(d, f)).read().strip() or 0)
            except Exception:
                continue
            if n >= cap:
                stranded.append(f"{kind} PR#{f} at {n}/{cap}")
    if stranded:
        return record("no-stranded-work", FAIL,
                      f"{len(stranded)} PR(s) at their attempt cap and invisible to the worker "
                      f"queues: {', '.join(stranded[:8])}", "#28")
    record("no-stranded-work", OK, "no PR is stranded at an attempt cap")


# ── 5. Leases and slot locks must not leak ──────────────────────────────────────────────────────
def check_leases():
    """#31: a reviewer's post-merge detached HEAD read as unpushed work, so release refused and the
    slot leaked — HARDER THE BETTER REVIEWERS DID. Ends in POOL_FULL, which halts gating (#12)."""
    leases = os.path.join(STATE, "leases")
    slots = os.path.join(STATE, "slots")
    n_leases = len(os.listdir(leases)) if os.path.isdir(leases) else 0
    n_slots = len(os.listdir(slots)) if os.path.isdir(slots) else 0
    pool = int(os.environ.get("WT_POOL_SIZE", 24))
    # A lease held with no live agent in any slot is the leak signature.
    if n_leases > n_slots + 4:
        return record("leases", FAIL,
                      f"{n_leases} worktree lease(s) held but only {n_slots} slot(s) have a live "
                      f"agent — leaked leases drift the pool toward POOL_FULL", "#31/#12")
    if n_leases >= pool:
        return record("leases", FAIL, f"pool is FULL ({n_leases}/{pool}) — gating will stall", "#12")
    record("leases", OK, f"{n_leases}/{pool} pool leases held, {n_slots} slot(s) active")


# ── 6. Slot locks must carry a heartbeat ────────────────────────────────────────────────────────
def check_heartbeats():
    """#32: the lock recorded only `<epoch> pid-agent`, written once at acquire, so the 90-minute
    stale-reclaim measured TICK AGE rather than idleness — a healthy long-running reviewer looked
    exactly like a corpse, and a holder that died at minute 5 held the slot for the full 90."""
    slots = os.path.join(STATE, "slots")
    if not os.path.isdir(slots):
        return record("heartbeats", OK, "no slots held")
    stale, noheart = [], []
    for s in sorted(os.listdir(slots)):
        held = os.path.join(slots, s, "held")
        if not os.path.exists(held):
            continue
        body = open(held, errors="replace").read().strip()
        age_min = (time.time() - os.path.getmtime(held)) / 60
        if "pid-agent" in body:
            noheart.append(s)
        if age_min > 90:
            stale.append(f"{s} ({age_min:.0f}m since last beat)")
    msg = []
    if stale:
        msg.append(f"stale beyond the reclaim window: {', '.join(stale)}")
    if noheart:
        msg.append(f"no real pid (pre-heartbeat tool): {', '.join(noheart)}")
    if stale:
        return record("heartbeats", FAIL, "; ".join(msg), "#32")
    record("heartbeats", OK, "; ".join(msg) or f"{len(os.listdir(slots))} slot(s) beating")


# ── 7. The tests that guard all this must still be able to FAIL ─────────────────────────────────
def check_tests_can_fail():
    """FIVE times in one session a test asserted a property it could not detect the loss of: a case
    comparing a set against itself, a case matching an explanatory COMMENT rather than code, a
    filter that silently selected nothing, a case that SKIPPED on a network blip while the suite
    said PASS, and a probe that resolved its data path from __file__. This does not re-run every
    mutation (too slow for a cron); it asserts the suites exist, run, and report a real verdict —
    and that an unrunnable case downgrades to INCOMPLETE rather than passing."""
    tg = os.path.join(CANON, "raw-port/army/verifier/test_guards.py")
    if not os.path.exists(tg):
        return record("tests-can-fail", UNKNOWN,
                      "test_guards.py not in this tree (it lands with the fix/guards PR) — the guard "
                      "suite is therefore NOT protecting anything here yet")
    src = open(tg, errors="replace").read()
    if "INCOMPLETE" not in src or "skipped" not in src:
        return record("tests-can-fail", FAIL,
                      "test_guards has no INCOMPLETE path — a case that cannot RUN would report PASS",
                      "#40")
    r = sh(f"python3 {tg}", timeout=300)
    out = r.stdout + r.stderr
    if "test_guards: PASS" in out:
        return record("tests-can-fail", OK, "guard suite runs and passes with a real verdict")
    if "test_guards: INCOMPLETE" in out:
        return record("tests-can-fail", UNKNOWN, "guard suite could not run every case: "
                      + " ".join(l.strip() for l in out.splitlines() if "COULD NOT RUN" in l)[:200])
    return record("tests-can-fail", FAIL, "guard suite FAILED: "
                  + " ".join(l.strip() for l in out.splitlines() if l.strip().startswith(("A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.")))[:300])


# ── 8. The symbol inventory must exist where agents work ────────────────────────────────────────
def check_inventory():
    """The perf directive told every agent to grep army/inventory/<FW>.syms.txt instead of running
    nm on a 78MB binary — but the files are gitignored, so pool worktrees had EMPTY inventory dirs
    and an oracle following the directive died with FileNotFoundError. The guidance and the
    filesystem disagreed, and the filesystem won."""
    inv = os.path.join(CANON, "raw-port/army/inventory")
    want = {"Flexo", "Helium", "Ozone", "ProChannel", "ProCore"}
    have = {f[:-9] for f in os.listdir(inv)} if os.path.isdir(inv) else set()
    missing_canon = want - have
    if missing_canon:
        return record("inventory", FAIL, f"canonical inventory missing: {sorted(missing_canon)} "
                                         f"— regenerate ONCE with dump_syms.sh, not per agent")
    pool_wt = os.path.join(STATE, "wt")
    bad = []
    if os.path.isdir(pool_wt):
        for slot in sorted(os.listdir(pool_wt))[:24]:
            d = os.path.join(pool_wt, slot, "raw-port/army/inventory")
            n = len([f for f in os.listdir(d)]) if os.path.isdir(d) else 0
            if n < 5:
                bad.append(f"{slot}({n}/5)")
    if bad:
        return record("inventory", FAIL,
                      f"worktree(s) without the full inventory, so the mandated fast path dies "
                      f"there: {', '.join(bad[:8])}")
    record("inventory", OK, "inventory present in the canonical tree and every pool worktree")


def check_dead_counters():
    """State outlives the bug that created it. When #28's cap bug was fixed, the counters it had
    INFLATED stayed at the cap and kept real work invisible — the fix alone did not free them. And
    counters for PRs that have since merged or closed accumulate forever: 64 of them were sitting in
    the state dir, one of which (#387, MERGED) read as 'stranded' on this doctor's first run."""
    dead = []
    for kind in ("rebase", "rework"):
        d = os.path.join(STATE, f"{kind}_attempts")
        if not os.path.isdir(d):
            continue
        for f in sorted(os.listdir(d)):
            if f.endswith(".sha") or not f.isdigit():
                continue
            one, err = gh_json(f"pr view {f} --repo {SLUG} --json state", tries=1)
            if one and one.get("state") in ("MERGED", "CLOSED"):
                dead.append(f"{kind}/{f}")
    if dead:
        return record("dead-counters", FAIL,
                      f"{len(dead)} attempt counter(s) for PRs that are already merged/closed — "
                      f"clear them (`rm $FCT_STATE_DIR/*_attempts/<n>*`) so they cannot masquerade "
                      f"as stranded work: {', '.join(dead[:8])}", "#28")
    record("dead-counters", OK, "no attempt counters outlive their PR")


CHECKS = [check_queue_coverage, check_guards_wired, check_tree_current, check_no_stranded,
          check_leases, check_heartbeats, check_tests_can_fail, check_inventory,
          check_dead_counters]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quiet", action="store_true", help="print only problems (for cron)")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    for c in CHECKS:
        try:
            c()
        except Exception as e:
            record(c.__name__, UNKNOWN, f"check raised {type(e).__name__}: {e}")

    fails = [r for r in results if r["status"] == FAIL]
    unknowns = [r for r in results if r["status"] == UNKNOWN]

    if args.json:
        print(json.dumps({"fails": len(fails), "unknown": len(unknowns), "results": results}, indent=1))
    elif args.quiet:
        for r in fails + unknowns:
            print(f"{r['status']}: {r['check']} — {r['detail']}" + (f"  [{r['incident']}]" if r["incident"] else ""))
    else:
        for r in results:
            mark = {"OK": "ok  ", "FAIL": "FAIL", "UNKNOWN": "??  "}[r["status"]]
            print(f"{mark} {r['check']:20} {r['detail']}")
        print()
        print(f"swarm_doctor: {len(fails)} FAIL, {len(unknowns)} UNKNOWN, "
              f"{len(results) - len(fails) - len(unknowns)} OK")

    return 1 if fails else (2 if unknowns else 0)


if __name__ == "__main__":
    sys.exit(main())
