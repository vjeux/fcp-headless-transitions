# a PR whose base is not main is gated against one thing and merged into another

- **reported** 2026-08-11T20:23:40Z by reviewer-3
- **status** FIXED in this change (pr_gate + pr_land refuse; swarm_doctor `check_pr_base`; prove_all LAYER 2i)

## Symptom

`review_claim.sh` leased me **#651**, and it does not target `main`. It sits on top of a stack:

    #649  tools/lease-ownership     -> main                      (CHANGES_REQUESTED)
    #650  tools/review-claim-g5     -> tools/lease-ownership
    #651  tools/reap-dead-counters  -> tools/review-claim-g5

Two things follow, and both were live:

- **The diff the review queue shows is not the diff the gate judges.** `gh pr view 651 --json files`
  lists 5 files (the top commit). `git diff origin/main...420a159a` is the whole stack — it includes
  `check_lease_ownership` in `swarm_doctor.py` and `test_review_claim_g5.sh`, which belong to #649
  and #650. `pr_gate.sh` diffs `origin/main...HEAD` (line 208) and passes that file list to
  `regression_check` and `dup_check` (lines 248-250), so a green `faithfulness-gate` posted on #651's
  head is a statement about three PRs' commits — one of which carried an un-dismissed
  CHANGES_REQUESTED at the time.
- **`pr_land.sh` would have merged it into `tools/review-claim-g5`, not into main.** Line 276 is
  `ghr pr merge "$PR" --squash --auto --delete-branch`, which targets the PR's own base. Branch
  protection (required `faithfulness-gate`, linear history, enforce_admins) exists on `main` and on
  nothing else, so that merge takes no required check at all — and `--delete-branch` then removes a
  branch that a fourth PR (#656, which appeared during this session) is based on. Everything else in
  `pr_land` — `carry_tree_identity`, `signed_head_of`, the whole `update-branch` loop — is written
  against `origin/main` and silently answers a different question for such a PR.

This is not the reviewer noticing something subtle. Nothing anywhere in the swarm read the field.

## Root cause

`baseRefName` was never consulted. Measured before the fix:

    grep -c baseRefName raw-port/army/tools/review_claim.sh   -> 0
    grep -c baseRefName raw-port/army/tools/rework_claim.sh   -> 0
    grep -c baseRefName raw-port/army/tools/rebase_claim.sh   -> 0
    grep -c baseRefName raw-port/army/tools/swarm_doctor.py   -> 0
    grep -rn baseRefName raw-port/army/tools/ raw-port/army/gate/   -> (no matches at all)

`pr_submit.sh` line 81 passes `--base main`, so the port pipeline cannot produce one. Only a
hand-rolled `gh pr create` can — which is exactly how the ops and tooling PRs are opened, so the
exposure is entirely on the swarm's own infrastructure changes, the PRs whose blast radius is
largest.

## Fix / workaround

**`pr_gate.sh` refuses and posts NO status** (exit 3). Posting `failure` would have been worse than
the bug: `review_claim` selects on the head's status and skips `FAILURE`, so a red status would hide
the PR from the only queue that can tell its author to retarget — the "stranded in no queue" shape
this log already carries three times. Silence leaves the head at `NONE`, so it stays claimable and
the next reviewer reads the refusal instead of a verdict.

**`pr_land.sh` refuses independently** (exit 4), before any other work. It has to be independent:
`pr_land` decides on its gate log by grepping the literal `PR_GATE: FAIL`, and the gate's refusal
prints `PR_GATE: REFUSING`, so it would otherwise sail straight past it. That relationship is itself
a test case, because it is the kind of thing a later edit to either message would quietly break.

Both guards **fail OPEN on an unanswered query** and say so, rather than failing closed: a TLS blip
must not wedge every merge in the swarm, and the gate still has to be green underneath. Both honour
`FCT_ALLOW_NONMAIN_BASE=1`, which exists so the test can drive the other side.

**Deliberately NOT done: the queues were left alone.** The tempting fix is to make `review_claim`
skip a non-main-base PR. That creates a PR no queue offers, which is the failure this log records
three separate times. The right place to stop is the two tools that would act wrongly; the right
thing everywhere else is to make the condition visible.

**`swarm_doctor.check_pr_base`** lists open PRs and FAILs naming every one whose base is not `main`
(UNKNOWN if the query fails). **`test_pr_base_is_main.sh`** drives both guard blocks, extracted
verbatim from the shipped tools, with `gh` stubbed — 12 cases, offline, and it deletes each guard
from a copy of its own tool at the end so a guard that stops existing cannot pass. Wired into
`prove_all.py` as LAYER 2i, because a suite nothing runs is decoration (row #44, three times now).

For an author who meets the refusal, the remedy needs no code change:

    gh pr edit <n> --repo vjeux/fcp-headless-transitions --base main

## Evidence

```
$ gh pr view 651 --json baseRefName --jq .baseRefName
tools/review-claim-g5

$ grep -n "gh pr merge" raw-port/army/tools/pr_land.sh
276:  ghr pr merge "$PR" --repo "$SLUG" --squash --auto --delete-branch >/dev/null 2>&1 || true

$ grep -rn baseRefName raw-port/army/tools/ raw-port/army/gate/     # before this change
(no output)

$ bash raw-port/army/tools/test_pr_base_is_main.sh
── pr_land.sh
  OK    a PR based on main is merged as before
  OK    a PR based on another PR's branch is REFUSED (exit 4)
  OK    the refusal names the base it found
  OK    the refusal carries the one command that resolves it
  OK    an unanswered base query warns and proceeds (fail-open, deliberate)
  OK    FCT_ALLOW_NONMAIN_BASE=1 is the documented escape hatch
── pr_gate.sh
  OK    a PR based on main is gated as before
  OK    a stacked-base PR is REFUSED by the gate (exit 3)
  OK    the gate posts NO status while refusing, so the PR stays visible to review_claim
── the two guards are independent
  OK    pr_land does not inherit the gate's refusal (it greps only 'PR_GATE: FAIL') and carries its own
── mutation: delete each guard from a copy of its tool; a case must die
  OK    mutation — deleting pr_land's guard is caught
  OK    mutation — deleting pr_gate's guard is caught
test_pr_base_is_main: PASS

$ python3 raw-port/army/tools/swarm_doctor.py     # the new check, against the live repo
FAIL pr-base   2 open PR(s) do not target main, so pr_gate's verdict and pr_land's merge target
               disagree: #656 -> tools/reap-dead-counters, #651 -> tools/review-claim-g5 —
               retarget with `gh pr edit <n> --base main`

$ python3 raw-port/army/verifier/prove_all.py | tail -2
LAYER 2i (a PR's base must be main — the gate and the merge target must agree): PASS
PROVE_ALL: PASS ✅
```
