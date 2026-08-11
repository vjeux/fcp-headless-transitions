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
import re
import subprocess
import sys
import time

# READ-ONLY IS AN INVARIANT OF THIS FILE, not an accident of its current contents: it takes no
# lease, posts nothing, writes no file and issues no mutating API call. It is safe to run at any
# time, from any slot, including against a live swarm — which is the only reason AGENT_ENTRY can
# tell every agent to run it. Any future check that needs to WRITE belongs in a different tool.
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


MAIN_SHA = None


def from_main(relpath):
    """Read a tool's source from `origin/main`, never from the canonical working tree.

    WHY: the canonical checkout is routinely tens of commits behind (this file's own tree-current
    check measures it and calls small drift OK), so a check that reads CANON can report a guard as
    missing an hour after it landed — which is what happened to `guards-wired` and
    `check_duplicate_classes.py` on the first review of this file. That is the "#506 fix could not
    reach the reconciler" pattern: a fix that exists on main, invisible to the tool that looks for
    it. Reading through git makes every source-inspecting check independent of how stale the
    working tree is, and MAIN_SHA is printed in the report so the answer is self-labelling.
    """
    global MAIN_SHA
    if MAIN_SHA is None:
        sh("git fetch -q origin main")
        MAIN_SHA = (sh("git rev-parse --short origin/main").stdout or "").strip() or "?"
    r = sh(f"git show origin/main:{relpath}")
    return r.stdout if r.returncode == 0 else ""


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
def check_pr_base():
    """#46: every reviewer tool in the swarm assumes a PR's base is `main`, and none of them checked.

    `pr_gate.sh` diffs `origin/main...HEAD` and feeds that file list to regression_check/dup_check;
    `pr_land.sh` merges with `gh pr merge --squash --auto --delete-branch`, which targets the PR's
    OWN base. For a PR stacked on another PR's branch those answer different questions: the status
    covers every commit in the stack, and the merge goes somewhere branch protection does not apply,
    with --delete-branch removing a branch a third PR is based on. Measured when this landed:
    `grep -c baseRefName` was 0 in review_claim.sh, rework_claim.sh, rebase_claim.sh, swarm_doctor.py
    and every file under army/tools and army/gate, while #649 -> main, #650 -> tools/lease-ownership
    and #651 -> tools/review-claim-g5 were all open and all claimable by review_claim.

    Note what this check does NOT do: it does not ask the queues to skip such a PR. A PR no queue
    offers is stranded, which this log already records three times — the right place to stop is the
    two tools that would act wrongly (both now refuse), and the right thing here is to make the
    condition visible. `pr_submit.sh` passes `--base main`, so only a hand-rolled `gh pr create`
    produces one, which is how every ops/tooling PR is opened.
    SECOND HALF (#656, worker 9): the same condition also breaks the REBASE queue, and there the
    remedy is a guard rather than a refusal. `rebase_pr.sh` merged `origin/main` unconditionally, so
    for a stacked PR the remedy could not clear the conflict it was charged an attempt for — #656
    took two such merges from two agents minutes apart and stayed DIRTY, each pass printing
    `REBASE_CLEAN … pushed`. `git merge-tree --write-tree origin/main <head>` agrees with the tool
    the whole time, because it is answering about a different base commit, so nothing anywhere reads
    as an error. This check therefore also asserts that `rebase_pr.sh` ON ORIGIN/MAIN resolves
    `baseRefName` before merging (read from main, not from the canonical tree, which runs tens of
    commits behind and would certify a fix that has not landed).
    """
    guard_src = from_main("raw-port/army/tools/rebase_pr.sh")
    guarded = None if not guard_src else (
        "baseRefName" in guard_src and 'merge --no-edit "origin/$BASE"' in guard_src)
    prs, err = gh_json(f"pr list --repo {SLUG} --state open --limit 200 --json number,baseRefName,headRefName")
    if prs is None:
        return record("pr-base", UNKNOWN, f"could not list open PRs to check their base: {err}", "#46")
    off = [f"#{p['number']} -> {p.get('baseRefName')}" for p in prs
           if p.get("baseRefName") != "main"]
    if guarded is None:
        guardnote = "; could not read rebase_pr.sh from origin/main to check its base handling"
    elif guarded:
        guardnote = "; rebase_pr.sh resolves the PR's base before merging"
    else:
        guardnote = ("; AND rebase_pr.sh merges origin/main without asking for baseRefName, so the "
                     "rebase queue burns this PR's attempts on a merge that cannot clear it (#656)")
    if off or guarded is False:
        return record("pr-base", FAIL,
                      f"{len(off)} open PR(s) do not target main, so pr_gate's verdict and pr_land's "
                      f"merge target disagree: {', '.join(off[:8]) or '(none right now)'} — retarget "
                      f"with `gh pr edit <n> --base main`" + guardnote, "#46")
    record("pr-base", OK, f"all {len(prs)} open PR(s) target main" + guardnote)


def check_queue_coverage():
    """The generalisation of two separate incidents, both 'work no queue could see'.

    #33: 31 PRs sat CHANGES_REQUESTED, oldest 16h untouched, while every reviewer polled NONE —
         review_claim skips them (author's turn), rebase_claim needs a gate FAILURE, depclaim only
         hands out fresh symbols. Three correct components, one uncovered state.
    #41: a conflicted PR touching no raw-port/src short-circuits pr_gate to SUCCESS, so it is green,
         invisible to rebase_claim, and never re-offered by review_claim. Sits open forever.

    IT ASKS THE QUEUES; IT DOES NOT MODEL THEM. The first version of this check re-implemented each
    tool's filter in Python, and in one live run it got both interesting PRs backwards: it accused
    #554, which review_claim's own query was selecting at that moment, and it certified #256 as
    covered while no queue could claim it. A re-implementation is a second source of truth, and this
    log is mostly what happens when two sources of truth drift (#20, #21, #26). So each queue's
    SELECTOR IS LIFTED OUT OF ITS OWN SCRIPT and executed read-only, with no lease taken:

      * review_claim.sh  — the `rows=$(gh pr list …)` assignment, verbatim
      * rework_claim.sh  — the `cand=$(gh pr list …)` assignment, verbatim
      * rebase_claim.sh  — its `cand=` assignment AND the description grep that follows it inside
        the loop, because the FAILURE prefilter alone is not the filter: a FAILURE whose
        description does not match `regression|rebase|add-only|G6|gate reject` (for example
        `1 G5 flag(s): …`, `dup-ledger (already on main)`) is dropped, and those are exactly the
        states that strand. …and the grep is not the whole filter either: a row the queue selected
        because GitHub says the branch CONFLICTS is taken without any description being read, so
        the exemption is followed here too — otherwise this check reports `rebase_claim=0` for
        PRs the queue is handing out, which is the same disagreement in the other direction.

    Change a filter and this check follows it, instead of silently disagreeing with it.
    """
    prs, err = gh_json(f"pr list --repo {SLUG} --state open --limit 200 "
                       "--json number,reviewDecision,mergeStateStatus,statusCheckRollup")
    if prs is None:
        return record("queue-coverage", UNKNOWN, f"could not list PRs: {err}", "#33/#41")
    open_nums = {pr["number"] for pr in prs}

    def numbers_from(tool, var):
        """Run the tool's OWN selector; return (numbers, row-fields by number, error).

        THE ROWS, not just the numbers, because a selector's row carries the evidence the tool's
        own loop then acts on. rebase_claim emits `<num>\\t<branch>\\t<sha>\\t<mergeStateStatus>`
        and its DIRTY branch reads that fourth field to skip the description grep entirely. Taking
        that field out of the row keeps this check downstream of the tool's OWN answer — same
        query, same moment — instead of pairing a lifted selector with a second, colder snapshot
        of GitHub. (`mergeStateStatus` is computed lazily: the first ask returns UNKNOWN and merely
        triggers the computation, so two snapshots seconds apart genuinely disagree.) Fields are
        matched by CONTENT below, never by index, so a tool that adds a column does not silently
        change what this check believes.
        """
        src = from_main(f"raw-port/army/tools/{tool}")
        if not src:
            return None, None, f"could not read {tool} from origin/main"
        m = re.search(r'^\s*' + var + r'=\$\(gh pr list.*?\)\n', src, re.S | re.M)
        if not m:
            return None, None, f"could not find the {var}= query in {tool}"
        probe = m.group(0).replace('"$SLUG"', SLUG).replace("2>/dev/null)", ")")
        r = sh(probe + f'\nprintf "%s" "${var}"', timeout=180)
        if r.returncode != 0 and not r.stdout.strip():
            return None, None, f"{tool} selector failed: {(r.stderr or '').strip()[:120]}"
        out, rows = set(), {}
        for line in r.stdout.splitlines():
            fields = [f.strip() for f in line.split("\t")]
            tok = fields[0] if fields else ""
            if tok.isdigit():
                out.add(int(tok))
                rows[int(tok)] = fields
        return out, rows, ""

    coverage, rows_by_tool, problems = {}, {}, []
    for tool, var in (("review_claim.sh", "rows"), ("rework_claim.sh", "cand"),
                      ("rebase_claim.sh", "cand")):
        nums, rows, e = numbers_from(tool, var)
        if nums is None:
            problems.append(e)
        else:
            coverage[tool] = nums
            rows_by_tool[tool] = rows

    if problems:
        # Cannot ask a queue -> cannot claim to know what is uncovered. UNKNOWN, never OK.
        return record("queue-coverage", UNKNOWN,
                      "could not consult every queue's own selector, so coverage is unknown "
                      "(a modelled answer would be a second source of truth): " + "; ".join(problems),
                      "#33/#41")

    # rebase_claim's prefilter is only half its filter: the loop then reads the STATUS DESCRIPTION
    # (REST — it is not in the GraphQL rollup) and greps it. Apply the same grep to the same field.
    rebase_src = from_main("raw-port/army/tools/rebase_claim.sh")
    m = re.search(r"grep -qiE '([^']+)'", rebase_src)
    desc_re = re.compile(m.group(1) if m else r"regression|rebase", re.I)

    # ── …AND THE GREP IS NOT THE WHOLE FILTER EITHER, ONCE THE QUEUE CAN SEE A CONFLICT ─────────
    # rebase_claim now selects a PR two ways: the gate said regression/rebase, or GITHUB SAYS THE
    # BRANCH CONFLICTS (mergeStateStatus DIRTY). Its DIRTY branch skips the description grep ON
    # PURPOSE — the conflict IS the evidence, and such a PR is usually gate-GREEN with a
    # description about something else entirely ("no raw-port/src ports to gate (infra/tooling
    # PR)", or empty), which is precisely why those PRs stranded. Re-applying the grep to them here
    # would drop the very PRs that fix makes claimable and report `rebase_claim=0` while the queue
    # hands them out — this check disagreeing with the tool it lifted, which is the
    # second-source-of-truth failure it exists to avoid (#20/#21/#26).
    #
    # DETECTED, NOT ASSUMED: the exemption applies only if the tool read from origin/main actually
    # HAS that branch. Run against an older rebase_claim that cannot select a conflict, this check
    # must behave exactly as before rather than inventing coverage the queue does not provide.
    dirty_bypass = "DIRTY" in rebase_src
    rebase_rows = rows_by_tool.get("rebase_claim.sh", {})
    review_by_num = {pr["number"]: pr.get("reviewDecision") for pr in prs}
    snapshot_dirty = {pr["number"] for pr in prs if pr.get("mergeStateStatus") == "DIRTY"}

    def dirty_selected(n):
        """Did the queue's own row say DIRTY? Fall back to our snapshot, never the other way round.

        Two sources because `mergeStateStatus` is lazy (UNKNOWN on a cold ask, DIRTY seconds
        later): the selector's row is the warmer of the two, and our list snapshot was taken first.
        Either saying DIRTY means GitHub says the branch conflicts, so accepting either only widens
        coverage against that race — it can never call a conflicted PR clean.
        """
        return n in snapshot_dirty or "DIRTY" in rebase_rows.get(n, [])[1:]

    def retired_by_cap(n):
        """Would rebase_claim's own attempt cap make it SKIP this PR? Then nobody can claim it.

        On the DIRTY path the cap does not close the PR (correctly — closing an author's work is a
        human's call), it just stops offering it, silently. That is #28's shape again: state, not a
        filter, making work invisible, and counting such a PR as covered here would hide it behind
        a cheerful `queue-coverage ok`. `no-stranded-work` flags the counter; this names the PR.

        READ-ONLY, and it applies the queue's own two exemptions: a head that has moved since the
        attempt was charged resets the counter (a new head is progress), and an APPROVED PR is
        exempt outright.
        """
        att = os.path.join(STATE, "rebase_attempts")
        try:
            n_att = int((open(os.path.join(att, str(n))).read() or "0").strip() or 0)
        except Exception:
            return False                     # no counter -> nothing has been charged
        if n_att < int(os.environ.get("REBASE_ATTEMPT_CAP", 3)):
            return False
        try:
            last = (open(os.path.join(att, f"{n}.sha")).read() or "").strip()
        except Exception:
            last = ""
        head = next((f for f in rebase_rows.get(n, []) if re.fullmatch(r"[0-9a-f]{40}", f)), "")
        if last and head and last != head:
            return False                     # the queue resets the counter for a new head
        return review_by_num.get(n) != "APPROVED"

    kept = set()
    for n in sorted(coverage.get("rebase_claim.sh", set())):
        if dirty_bypass and dirty_selected(n):
            if not retired_by_cap(n):
                kept.add(n)                  # taken on the conflict alone; no description read
            continue
        one, _ = gh_json(f"pr view {n} --repo {SLUG} --json headRefOid", tries=2)
        if not one:
            kept.add(n)                      # cannot check -> do not call it uncovered
            continue
        # RAW TEXT, not gh_json: `--jq '….description'` prints a BARE string, which is not JSON, so
        # a JSON-parsing wrapper reads a perfectly good answer as a failure and the PR silently
        # drops out of the covered set. That is how the first run of this fix reported
        # rebase_claim=0 while the queue was handing that very PR to a worker — an unparseable
        # SUCCESS is not an empty description, and conflating them accuses the wrong PRs.
        r = sh(f"gh api repos/{SLUG}/commits/{one['headRefOid']}/statuses "
               "--jq '[.[]|select(.context==\"faithfulness-gate\")][0].description'", timeout=60)
        if r.returncode != 0:
            kept.add(n)                      # cannot check -> do not call it uncovered
            continue
        if desc_re.search(r.stdout or ""):
            kept.add(n)
    coverage["rebase_claim.sh"] = kept

    # pr_land is not a queue anyone polls, but a PR that is APPROVED + green + mergeable is not
    # stranded: it is waiting on a reviewer's merge step. Counted as covered, and named as such.
    landable = set()
    for pr in prs:
        gate = ""
        for st in (pr.get("statusCheckRollup") or []):
            if (st.get("context") or st.get("name")) == "faithfulness-gate":
                gate = (st.get("state") or st.get("conclusion") or "").upper()
        if (pr.get("reviewDecision") == "APPROVED" and gate == "SUCCESS"
                and (pr.get("mergeStateStatus") or "") not in ("DIRTY",)):
            landable.add(pr["number"])
    coverage["pr_land"] = landable

    covered = set().union(*coverage.values()) if coverage else set()
    orphans = sorted(open_nums - covered)

    # CONFIRM EACH ORPHAN INDIVIDUALLY. A PR being merged right now looks exactly like an orphan in
    # a list snapshot — APPROVED, gate PENDING while pr_land re-gates, mergeStateStatus BLOCKED —
    # and the first run of this check reported #563 as stuck three seconds before it merged. A
    # doctor that cries wolf gets ignored, which is the same "guard nobody trusts" failure it exists
    # to prevent, so a candidate must still be OPEN and still uncoverable on a second, later look.
    confirmed = []
    if orphans:
        time.sleep(20)
        for n in orphans:
            one, _e = gh_json(f"pr view {n} --repo {SLUG} "
                              "--json state,reviewDecision,mergeStateStatus,statusCheckRollup", tries=2)
            if one is None or one.get("state") != "OPEN":
                continue
            g2 = ""
            for s2 in (one.get("statusCheckRollup") or []):
                if (s2.get("context") or s2.get("name")) == "faithfulness-gate":
                    g2 = (s2.get("state") or s2.get("conclusion") or "").upper()
            if g2 in ("PENDING", "EXPECTED"):
                continue                      # a gate is running on it right now
            confirmed.append(f"#{n} (review={one.get('reviewDecision') or 'none'} "
                             f"gate={g2 or 'none'} merge={one.get('mergeStateStatus') or '?'})")

    sizes = ", ".join(f"{k.replace('.sh','')}={len(v)}" for k, v in sorted(coverage.items()))
    if confirmed:
        return record("queue-coverage", FAIL,
                      f"{len(confirmed)} open PR(s) NO queue can claim — they will sit indefinitely "
                      f"and nothing else notices: " + "; ".join(confirmed[:6])
                      + f"  [selectors consulted at origin/main {MAIN_SHA}: {sizes}]", "#33/#41")
    record("queue-coverage", OK,
           f"all {len(open_nums)} open PRs are selected by some queue's OWN filter "
           f"[origin/main {MAIN_SHA}: {sizes}]", "#33/#41")


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
    # FROM origin/main, NOT from the working tree. This check reported
    # `check_duplicate_classes.py` as uninvoked an hour after #565 wired it into pr_gate.sh, purely
    # because the canonical checkout was 28 commits behind — a state this file's own tree-current
    # check calls OK. Two checks in one report disagreeing about whether the tree can be trusted is
    # worse than either being wrong alone, so every source-inspecting check now reads through git
    # and the report names the SHA it read.
    callers_text = ""
    for rel in ("raw-port/army/tools/pr_gate.sh", "raw-port/army/gate/gate.sh",
                "raw-port/army/verifier/prove_all.py", "raw-port/army/tools/swarm_maint.sh"):
        callers_text += from_main(rel)
    if not callers_text:
        return record("guards-wired", UNKNOWN,
                      "could not read any caller from origin/main — cannot tell wired from "
                      "unwired, and guessing here is how a missing guard reads as reassurance", "#44")
    orphaned = [g for g in guards if g not in callers_text]
    if orphaned:
        return record("guards-wired", FAIL,
                      f"guard(s) that exist but nothing invokes: {', '.join(orphaned)} "
                      f"[read at origin/main {MAIN_SHA}]", "#44")
    record("guards-wired", OK,
           f"all {len(guards)} guards are invoked by a caller [origin/main {MAIN_SHA}]", "#44")


def check_orphan_drivers():
    """#47: a mutant that never terminates burns a core until someone notices by hand.

    Two `tsx` driver processes were found at ~98% CPU, one 2h31m old (66 CPU-minutes), both mutants
    of the same unit. The mutation disabled a pointer advance, so the walk compared the same node
    forever — correct behaviour for a mutant, and nothing scored it. 69 of 69 driver-spawning calls
    in the repo passed no timeout, so the parent blocked forever, the agent finished its shift, and
    the orphan outlived everything.

    THIS CHECK IS THE HALF THAT COVERS AD-HOC HARNESSES, and that is the point: both processes came
    from `/tmp/w5_mut_*/driver.ts`, written by an agent during a shift and never in the repo. No
    amount of fixing checked-in oracles could have caught them. A process is evidence about itself.

    Threshold: a driver older than DRIVER_MAX_MIN (default 10). The slowest healthy driver measured
    here is ~1s; the AVX corpora run in seconds. Ten minutes is three orders of magnitude of margin,
    and still catches a hang ~2h20m earlier than a human noticing the fans.
    """
    max_min = int(os.environ.get("FCT_DRIVER_MAX_MIN", "10"))
    # `etime`, not `etimes`. BSD ps has no `etimes` (that is a Linux/procps extension) and rejects
    # the whole command — so the first version of this check returned UNKNOWN on every run, on the
    # only platform the swarm runs on. It read as "could not measure" rather than as "wrong flag",
    # which is the polite kind of broken: no crash, no accusation, and no coverage.
    r = sh("ps -Ao pid,etime,pcpu,args")
    if r.returncode != 0 or not r.stdout.strip():
        return record("orphan-drivers", UNKNOWN,
                      f"could not read the process table: {(r.stderr or '').strip()[:80]}", "#47")

    def _secs(et):
        """[[DD-]HH:]MM:SS -> seconds. BSD ps drops leading zero fields, so all three shapes occur."""
        days = 0
        if "-" in et:
            d, et = et.split("-", 1)
            days = int(d)
        bits = [int(x) for x in et.split(":")]
        while len(bits) < 3:
            bits.insert(0, 0)
        return days * 86400 + bits[0] * 3600 + bits[1] * 60 + bits[2]

    old = []
    for line in r.stdout.splitlines()[1:]:
        parts = line.split(None, 3)
        if len(parts) < 4:
            continue
        pid, etime, pcpu, args = parts
        try:
            etimes = _secs(etime)
        except ValueError:
            continue
        # A DRIVER, not any node: the harnesses run `node ... driver.ts` / `.mts`, and tsx drivers
        # carry the preflight shim. Matching bare `node` would accuse the editor and the dev server.
        if not re.search(r'driver\.m?ts|tsx/dist/preflight|reach_worker', args):
            continue
        if etimes > max_min * 60:
            old.append(f"pid {pid} ({etimes//60}m, {pcpu}% cpu)")
    if old:
        return record("orphan-drivers", FAIL,
                      f"{len(old)} oracle driver(s) running longer than {max_min}m — a mutant that "
                      f"does not terminate is a kill, not a pending result, and it holds a core "
                      f"until someone kills it by hand: {', '.join(old[:4])}. Kill them "
                      f"(`kill -9 <pid>`) and give the harness a timeout (oracle_driver.run_driver)",
                      "#47")
    record("orphan-drivers", OK, f"no oracle driver has been running longer than {max_min}m")


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


# ── 5b. No PR may be leased by two worker queues at once ────────────────────────────────────────
def check_no_double_lease():
    """Two workers handed the SAME PR, by two queues that cannot see each other's leases.

    THE INCIDENT (2026-08-11, worker 8, on #656): `rebase_claim` leased it at 13:32:36 and a peer
    was 43 files into merging main in `~/.fct-pool/wt/3`; `rework_claim` handed the same PR to
    another worker 66 seconds later. Both queues select it legitimately — it is CHANGES_REQUESTED
    (rework) and CONFLICTING (rebase) — and neither consults the other's lease directory. The
    second worker only noticed because `git checkout` refused a branch another worktree held; with
    a different branch name both would have reconciled the same conflicts and one would have lost
    the race at push time, throwing away a reviewer's worth of work.

    It became common the same hour it was found: #643 taught `rebase_claim` to select DIRTY PRs,
    which un-stranded four PRs and, as a side effect, made every rejected+conflicted PR
    double-claimable. That is standing rule 8 (a fix can be the next outage) with a one-hour fuse,
    so the guard ships with a check rather than only a code change.

    Read-only, and it reads the same two directories the queues write, with the same staleness
    window — a stale pair is not a collision, it is a dead lease.
    """
    stale_min = int(os.environ.get("REWORK_LEASE_MIN", 90))
    now, both = time.time(), []
    for kind in ("rebase", "rework"):
        d = os.path.join(STATE, f"{kind}_leases")
        if not os.path.isdir(d):
            return record("double-lease", OK, f"no {kind} lease directory yet — nothing to collide")
    a, b = (os.path.join(STATE, "rebase_leases"), os.path.join(STATE, "rework_leases"))

    def fresh(d, pr):
        held = os.path.join(d, pr, "held")
        try:
            return (now - os.path.getmtime(held)) / 60.0 <= stale_min
        except OSError:
            return False

    for pr in sorted(set(os.listdir(a)) & set(os.listdir(b))):
        if fresh(a, pr) and fresh(b, pr):
            both.append(f"#{pr}")
    if both:
        return record("double-lease", FAIL,
                      f"{len(both)} PR(s) leased by BOTH worker queues at once — two workers are "
                      f"reconciling the same PR and one will lose the race at push time: "
                      + ", ".join(both[:8]), "#656 double-hand-out")
    record("double-lease", OK, "no PR is leased by both worker queues")


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
    # The PROPERTY is "a case that could not run does not report as passed". Two spellings of it are
    # in flight in different PRs — an INCOMPLETE verdict, and a PASS plus an explicit SKIPPED list —
    # and this check must not fail a healthy suite for choosing the other one. Accept either, and
    # require only that the suite tracks unrun cases at all.
    has_incomplete = "INCOMPLETE" in src
    has_skips = ("skipped" in src) or ("SKIPPED" in src)
    if not (has_incomplete or has_skips):
        return record("tests-can-fail", FAIL,
                      "test_guards tracks no unrun cases (no INCOMPLETE verdict and no SKIPPED "
                      "list) — a case that cannot RUN would report PASS", "#40")
    r = sh(f"python3 {tg}", timeout=300)
    out = r.stdout + r.stderr
    # A PASS that carries skips is NOT an OK: the suite ran, but not all of it, which is exactly the
    # distinction the check exists to enforce and the one its own docstring demands.
    if "test_guards: PASS" in out and ("SKIPPED" in out or "COULD NOT RUN" in out):
        return record("tests-can-fail", UNKNOWN,
                      "guard suite passed the cases it RAN, but some did not run: "
                      + " ".join(l.strip() for l in out.splitlines()
                                 if "SKIPPED" in l or "COULD NOT RUN" in l)[:200], "#40")
    if "test_guards: PASS" in out:
        return record("tests-can-fail", OK, "guard suite runs and passes with a real verdict")
    if "test_guards: INCOMPLETE" in out:
        return record("tests-can-fail", UNKNOWN, "guard suite could not run every case: "
                      + " ".join(l.strip() for l in out.splitlines() if "COULD NOT RUN" in l)[:200])
    # Match ANY "<Letter>. " case line rather than a literal A..H tuple. The tuple stopped where
    # main's suite stopped, so the day test_guards gained a case J the FAIL message named nothing:
    # replaying this expression against a real J-shaped failure produced "guard suite FAILED: "
    # with an empty tail, for the case that guards the only path in the swarm that merges without
    # re-gating. Same family as the layer-letter entry filed with this change — a literal that has
    # to be maintained in lockstep with a list living somewhere else.
    return record("tests-can-fail", FAIL, "guard suite FAILED: "
                  + " ".join(l.strip() for l in out.splitlines()
                             if re.match(r"^[A-Z]\. ", l.strip()))[:300])


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
    counters = []
    for kind in ("rebase", "rework"):
        d = os.path.join(STATE, f"{kind}_attempts")
        if not os.path.isdir(d):
            continue
        counters += [(kind, f) for f in sorted(os.listdir(d))
                     if f.isdigit() and not f.endswith(".sha")]
    if not counters:
        return record("dead-counters", OK, "no attempt counters outlive their PR")
    # ONE call, not one per counter — 64 counters sat in the state dir at one point, and that would
    # have been 64 serial round trips in a tool AGENT_ENTRY tells every agent to run.
    #
    # It used to be `pr list --state all --limit 400`, which has a WINDOW: with ~650 PRs, anything
    # older than the 400 most recent came back absent, `state_of.get()` returned None, and the
    # counter was silently treated as fine. The oldest counters are the likeliest to be dead, so the
    # window hid exactly the population this check exists to find — measured: counter rebase/114
    # (MERGED) was invisible here while rebase/554 (MERGED) was reported, purely because of where
    # they fell in the list. Ask about the counters that actually exist instead: an aliased query
    # over those numbers has no window at all and costs one round trip.
    q = " ".join(f"p{f}: pullRequest(number: {f}) {{ state }}" for _k, f in counters)
    owner, name = SLUG.split("/", 1)
    r = sh(f'gh api graphql -f query=\'query {{ repository(owner: "{owner}", name: "{name}") '
           f'{{ {q} }} }}\' --jq \'.data.repository | to_entries[] | "\\(.key) \\(.value.state)"\'')
    if r.returncode != 0 or not r.stdout.strip():
        return record("dead-counters", UNKNOWN,
                      f"could not read the counters' PR states: {(r.stderr or 'empty answer').strip()[:120]}",
                      "#28")
    state_of = {}
    for line in r.stdout.split("\n"):
        parts = line.split()
        if len(parts) == 2 and parts[0].startswith("p"):
            state_of[parts[0][1:]] = parts[1]
    dead = [f"{kind}/{f}" for kind, f in counters if state_of.get(f) in ("MERGED", "CLOSED")]
    # A counter the query did not answer for is not a counter that is fine.
    unanswered = [f"{kind}/{f}" for kind, f in counters if f not in state_of]
    if unanswered and not dead:
        return record("dead-counters", UNKNOWN,
                      f"{len(unanswered)} counter(s) got no state back: {', '.join(unanswered[:6])}", "#28")
    if dead:
        return record("dead-counters", FAIL,
                      f"{len(dead)} attempt counter(s) for PRs that are already merged/closed — "
                      f"clear them (`rm $FCT_STATE_DIR/*_attempts/<n>*`) so they cannot masquerade "
                      f"as stranded work: {', '.join(dead[:8])}", "#28")
    record("dead-counters", OK, "no attempt counters outlive their PR")


def check_brief_flags_exist():
    """Every command-line flag the briefs tell agents to use must exist in the tool on main.

    THE WORST INCIDENT OF THE DAY, and it was mine. My dispatch prompts told every reviewer, in
    bold, to sign with `--expect-head <sha>`. The flag existed only on an unlanded branch, so the
    tool on main fell through to `BODY="$*"` and posted the ARGV as the review body — destroying the
    evidence file, at exit 0, with a success line naming the right verdict. Seven verdicts were lost
    that way, four on PRs that then merged.

    A brief that names a flag the tool does not implement is not a documentation error. It is a
    data-destroying one, and it is invisible: the instruction reads as authoritative precisely
    because it is written down. So assert the pairing, and assert it against the tree agents
    actually run from — a flag that exists only on a branch is a flag that does not exist.
    """
    # KNOWN GAP, stated because a partial check that reads as total is the failure this file exists
    # to prevent: the actual incident came through a DISPATCH PROMPT, which lives in the spawning
    # session and not in this repo, so nothing here could have caught it. What this does catch is the
    # same instruction reaching the checked-in briefs — which is where a prompt's advice always ends
    # up, and where it would then be inherited by every future agent. Whoever writes dispatch prompts
    # must run the flag against the tool on main FIRST; that discipline cannot be automated from here.
    briefs = ["raw-port/army/AGENT_ENTRY.md", "raw-port/army/DEP_WORKER_BRIEF.md",
              "raw-port/army/REVIEWER_BRIEF.md", "raw-port/army/HARNESS_LOOP.md",
              "raw-port/army/PR_FLOW.md"]
    import re as _re
    # `tool.sh ... --flag` — only flags named next to a tool we can actually inspect.
    pat = _re.compile(r'([a-z_]+\.(?:sh|py))((?:[^\n`]{0,80}?--[a-z][a-z0-9-]+)+)')
    missing = []
    for b in briefs:
        p = os.path.join(CANON, b)
        if not os.path.exists(p):
            continue
        text = open(p, errors="replace").read()
        for m in pat.finditer(text):
            tool, tail = m.group(1), m.group(2)
            hits = [t for t in _re.findall(r'--[a-z][a-z0-9-]+', tail)]
            cand = None
            for root, _d, files in os.walk(os.path.join(CANON, "raw-port/army")):
                if tool in files:
                    cand = os.path.join(root, tool)
                    break
            if not cand:
                continue
            src = open(cand, errors="replace").read()
            for flag in hits:
                if flag in ("--help",):
                    continue
                if flag not in src:
                    missing.append(f"{os.path.basename(b)} tells agents `{tool} {flag}` "
                                   f"but {tool} does not implement it")
    if missing:
        return record("brief-flags-exist", FAIL,
                      f"{len(missing)} brief instruction(s) name a flag the tool lacks — the tool "
                      f"will treat it as data (this destroyed 7 review bodies): "
                      + "; ".join(sorted(set(missing))[:5]), "#expect-head")
    record("brief-flags-exist", OK, "every flag the briefs name exists in the tool")


# ── 11. ACTIONABLE: every PR the REBASE queue offers must be one rebase_pr can actually act on ───
def check_rebase_actionable():
    """A queue whose own tool declares the work already done, then closes it for not being done.

    THE INCIDENT (2026-08-11, worker 2, on #400 — APPROVED, +153 lines of OPS_LOG, gate
    `regression (rebase needed): DIRTY on OPS_LOG.md`): `rebase_pr.sh 400` printed
    `not stale / nothing to rebase (rebase_helper exit 3)` and stopped. `rebase_helper.py` returns 3
    for "this branch changes no .ts files", which is true of every docs/tooling PR in the swarm, and
    `rebase_pr` reported it as "nothing to rebase". Meanwhile `rebase_claim.sh` keeps re-offering the
    PR — and past its 3-attempt cap that queue CLOSES it, with a comment about a shared-class
    conflict and a promise to re-hand "the symbol" that means nothing for a documentation PR. So the
    end state of the loop is: approved evidence closed, by a queue, for failing to do a thing whose
    own tool said there was nothing to do.

    Two halves, because either alone would mislead:
      * the GUARD — does `rebase_pr.sh` on origin/main still equate "no .ts changes" with
        "nothing to rebase", or does it ask GitHub whether the PR merges? Read from main, per
        `from_main`'s reasoning: the canonical tree is routinely tens of commits behind.
      * the LIVE state — which open PRs are in that class right now (no `raw-port/src/**/*.ts` in
        their delta AND not mergeable). Those are the ones the loop is running on today.
    """
    src = from_main("raw-port/army/tools/rebase_pr.sh")
    if not src:
        return record("rebase-actionable", UNKNOWN, "could not read rebase_pr.sh from origin/main",
                      "#400")
    m = re.search(r'if \[ "\$rc" = 3 \]; then(.*?)(?:\n# ---- Attempt 2|\nWT=)', src, re.S)
    if not m:
        return record("rebase-actionable", UNKNOWN,
                      "could not locate rebase_pr.sh's rebase_helper-exit-3 branch — it has been "
                      "restructured; re-read it rather than trusting this check", "#400")
    guarded = "mergeable" in m.group(1)

    prs, err = gh_json(f"pr list --repo {SLUG} --state open --limit 200 "
                       "--json number,files,mergeable,mergeStateStatus")
    stuck = None
    if prs is not None:
        stuck = []
        for pr in prs:
            paths = [f.get("path", "") for f in (pr.get("files") or [])]
            if any(x.startswith("raw-port/src/") and x.endswith(".ts") for x in paths):
                continue                      # rebase_helper can see it; not this class
            if pr.get("mergeable") == "CONFLICTING" or pr.get("mergeStateStatus") == "DIRTY":
                stuck.append(pr["number"])

    live = ("could not list PRs (%s)" % err) if stuck is None else (
        "no open PR is in that class right now" if not stuck else
        "open PRs in that class RIGHT NOW: " + ", ".join(f"#{n}" for n in sorted(stuck)))

    if not guarded:
        return record("rebase-actionable", FAIL,
                      "rebase_pr.sh treats rebase_helper's exit 3 (no .ts changes) as "
                      "'nothing to rebase' without asking whether the PR merges, so the rebase "
                      "queue no-ops on every docs/tooling PR and its attempt cap then CLOSES them; "
                      + live, "#400")
    record("rebase-actionable", OK,
           "rebase_pr.sh asks whether a no-.ts PR actually merges before reporting nothing to do; "
           + live)


def check_rebase_branch_naming():
    """The union rebase must be able to FIND the branch it just pushed.

    THE INCIDENT (2026-08-11, worker 1, on #660 `port/OZChannelBase__slot3`): `rebase_helper.py`
    derives the CLASS from the PR — stripping `__slot<N>` — and pushes `port/<Class>_rebased`.
    `rebase_pr.sh` re-derived that name from the BRANCH, stripping only `_rebased`, so it looked for
    `port/<Class>__slot<N>_rebased`. That ref does not exist: `git diff` fataled, the empty side made
    `comm` report EVERY file as missing, and the last guard printed "REFUSING to force-push — the
    rebased branch is missing files the PR has" about a union that was sitting on the remote,
    gate-green, complete. The PR returned to the queue unchanged, and at 3/3 attempts the rebase
    queue CLOSES it (#28's shape, on work that was already done).

    It is invisible on `port/<Class>` PRs, where the two spellings coincide — and `__slot<N>` is the
    NORMAL shape under contention (#240 creates it whenever a class is being worked in two slots).

    Two halves:
      * the GUARD — does `rebase_pr.sh` on origin/main take the branch name from rebase_helper's own
        output, or does it still compose one out of `$CLS`/`$BR`? Two derivations of one name is the
        bug; asking the tool that pushed it is the fix.
      * the LIVE state — `port/*_rebased` refs on the remote. The success path force-pushes the union
        onto the PR branch and DELETES that temp ref, so a lingering one is a rebase that was
        computed, pushed, and never landed. Each is a worker unit spent for nothing and a PR one
        attempt closer to being auto-closed.
    """
    src = from_main("raw-port/army/tools/rebase_pr.sh")
    if not src:
        return record("rebase-branch-naming", UNKNOWN,
                      "could not read rebase_pr.sh from origin/main", "#660")
    m = re.search(r'if \[ "\$rc" = 0 \]; then(.*?)\nfi\n', src, re.S)
    if not m:
        return record("rebase-branch-naming", UNKNOWN,
                      "could not locate rebase_pr.sh's rebase_helper-exit-0 branch — it has been "
                      "restructured; re-read it rather than trusting this check", "#660")
    block = m.group(1)
    recomposed = re.search(r'port/\$\{?CLS\}?_rebased', block)
    asks_helper = "_rh.log" in block

    orphans, err = None, None
    # A newline-delimited name list, not JSON, so `sh` rather than `gh_json`.
    r = sh(f"gh api repos/{SLUG}/branches?per_page=100 --jq '.[].name'")
    if r.returncode == 0:
        orphans = [b for b in r.stdout.split() if b.endswith("_rebased")]
    else:
        err = (r.stderr or "").strip() or "no answer"

    live = ("could not list branches (%s)" % err) if orphans is None else (
        "no orphan port/*_rebased branch on the remote" if not orphans else
        "ORPHAN union branches on the remote right now (each is a completed rebase that never "
        "landed): " + ", ".join(sorted(orphans)))

    if recomposed or not asks_helper:
        return record("rebase-branch-naming", FAIL,
                      "rebase_pr.sh re-derives the rebased branch name instead of taking it from "
                      "rebase_helper's output, so every PR on a `port/<Class>__slot<N>` branch "
                      "refuses its own completed union as 'missing files' and burns a rebase "
                      "attempt; " + live, "#660")
    record("rebase-branch-naming", OK,
           "rebase_pr.sh takes the union branch name from rebase_helper's own output; " + live)


# How many commits the window must hold before a percentage over it means anything. Below this the
# check reports ok and says how far it has filled: 20% of five commits is one commit.
OPS_WINDOW_MIN = 40


def check_ops_contention():
    """No single file should be the swarm's merge bottleneck.

    OPS_LOG.md was 28% of the last 259 merges (73 of them) because every agent appended to it, so
    every pair of ops reports conflicted by construction — five at once at the worst, three of them
    reviewer-APPROVED and unmergeable for over an hour. `ops/` (one file per entry) removes the
    class. This check exists so the convention cannot quietly lapse back: if one shared file starts
    dominating merges again, say so before it costs another afternoon of hand-merges.

    MEASURED OVER THE CONVENTION, NOT THE ARCHIVE. The first version counted a fixed 200 commits of
    history, so it FAILed the moment it landed and stayed red for ~150 commits no matter how well
    the swarm behaved — a check correct behaviour cannot clear teaches agents to skim the doctor,
    which is the one tool that audits the queues. The window therefore starts at the commit that
    ADDED `raw-port/army/ops/README.md`: before that commit nobody could have followed the
    convention, and after it every commit in the window is one that could. It goes green today by
    agents doing the right thing, and red again if they stop.
    """
    base = sh("git log --diff-filter=A --format=%H -1 origin/main -- raw-port/army/ops/README.md")
    if base.returncode != 0:
        return record("ops-contention", UNKNOWN, "could not read git history")
    since = base.stdout.strip()
    if not since:
        return record("ops-contention", OK,
                      "one-file-per-finding (raw-port/army/ops/) is not on main yet — "
                      "nothing to measure until it lands")
    r = sh(f"git log {since}..origin/main --name-only --pretty=format:%H "
           f"-- raw-port/army raw-port/tools")
    if r.returncode != 0:
        return record("ops-contention", UNKNOWN, "could not read git history")
    commits, counts = 0, collections.Counter()
    seen = set()
    for line in r.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        if len(line) == 40 and all(c in "0123456789abcdef" for c in line):
            commits += 1
            seen = set()
            continue
        if line not in seen:            # one commit counts a file once
            seen.add(line)
            counts[line] += 1
    if commits < OPS_WINDOW_MIN:
        return record("ops-contention", OK,
                      f"only {commits} commit(s) under raw-port/army|tools since the ops/ "
                      f"convention landed — window fills at {OPS_WINDOW_MIN}, nothing to conclude yet")
    top, n = counts.most_common(1)[0]
    pct = 100.0 * n / commits
    if pct >= 20:
        return record("ops-contention", FAIL,
                      f"{top} is in {n} of the {commits} commits since the ops/ convention landed "
                      f"({pct:.0f}%) — one file that hot is a merge bottleneck by construction; "
                      f"file findings with `new_ops_entry.sh` (one file per entry) instead",
                      "#ops-dir")
    record("ops-contention", OK,
           f"hottest shared file is {top} at {pct:.0f}% of the {commits} commits since the ops/ "
           f"convention landed")


def check_layer_letters():
    """No two prove_all layers may claim the same letter.

    Every suite is wired into `prove_all.layer2()` by appending a hand-numbered `rN`/`okN` pair, a
    hand-CHOSEN `LAYER 2<letter>` label, and one more `and okN` to the single `return` line. There
    is no allocator for the letter and no way for two open PRs to see each other's choice, so two
    authors pick the same one routinely: main's list went 2h -> 2i -> 2j in ninety minutes today,
    and PR #650 needed THREE letters in one hour (2i taken by queue-coverage while it waited, then
    2j taken by #670 in the eight minutes between its re-approval and its merge).

    The collision is only ever discovered at rebase time — the three-dot diff is clean on both
    sides — and the tempting resolution is the dangerous one: "take mine" on that hunk REVERTS the
    peer's landed layer, the file still parses, the suite still passes with a layer missing, and G6
    add-only cannot see it because it only inspects the .ts file handed to gate.sh.

    So: report a duplicate label as a FAIL naming the letter. This does not remove the append point
    (see the ops entry filed with this check for the two ways to do that); it makes the next
    collision a line in this report instead of two reviewer rounds.
    """
    src = from_main("raw-port/army/verifier/prove_all.py")
    if not src:
        return record("layer-letters", UNKNOWN,
                      "could not read prove_all.py from origin/main — cannot say whether two "
                      "layers claim one letter")
    # ONLY the lettered sub-layers (2b, 2c, ... 2z). The bare top-level labels are excluded on
    # purpose: `LAYER 3` is legitimately printed TWICE on main — once as a heading before the
    # per-fixture rows and once as its verdict — so counting it would make this check FAIL against
    # a healthy main, which is the "a red that correct behaviour cannot clear" defect this file's
    # own ops-contention check was rejected for. Measured: with a bare-label pattern, main reports
    # `3 (x2)`. The lettered labels are the ones with no allocator and the real collisions.
    labels = re.findall(r'print\(\s*"LAYER (\d+[a-z])\b', src)
    if not labels:
        # The pattern found nothing, which is either a rewrite or a broken regex — and "selects
        # nothing" must never read as "all distinct" (test_guards case E's lesson, one file over).
        return record("layer-letters", UNKNOWN,
                      "found no LAYER labels in prove_all.py on origin/main — the label format "
                      "changed, or this check's pattern is stale; it is not evidence of anything")
    dupes = sorted({l for l in labels if labels.count(l) > 1})
    if dupes:
        return record("layer-letters", FAIL,
                      "duplicate prove_all LAYER label(s): "
                      + ", ".join(f"{d} (x{labels.count(d)})" for d in dupes)
                      + " — two suites are claiming one letter; the second to land silently "
                        "replaces the first")
    record("layer-letters", OK, f"{len(labels)} layer label(s), all distinct")


CHECKS = [check_pr_base, check_queue_coverage, check_guards_wired, check_tree_current, check_no_stranded,
          check_leases, check_no_double_lease, check_heartbeats, check_tests_can_fail, check_inventory,
          check_dead_counters,
          check_brief_flags_exist, check_rebase_actionable, check_rebase_branch_naming,
          check_ops_contention, check_layer_letters,
          check_orphan_drivers]


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
