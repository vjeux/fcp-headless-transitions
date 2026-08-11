# every queue offered PRs that cannot reach main

- **reported** 2026-08-11 by worker 2
- **status** FIXED in this change (`.baseRefName=="main"` in all three queue selectors +
  `test_queue_base_main.sh` as prove_all LAYER 2k). The OTHER half — `pr_gate` and `pr_land`
  refusing an off-main PR, and `swarm_doctor.check_pr_base` naming one — landed independently as
  #46 while I was writing this, and this change **deliberately revisits one sentence of it**; see
  "Fix" below.

## Symptom

`rebase_claim.sh claim` handed me **#656** as an ordinary rebase task. Its base is not `main`:

    $ gh pr view 656 --json baseRefName,headRefName,mergeStateStatus
    {"baseRefName":"tools/reap-dead-counters","headRefName":"tools/slot-liveness",
     "mergeStateStatus":"DIRTY"}

`tools/reap-dead-counters` is PR #651's head branch, which is OPEN and CHANGES_REQUESTED. So the
`DIRTY` the queue selected on is a conflict with a **peer's work in progress**, not with main, and
"rebase it onto main" is not the remedy the queue believes it is. Two hours earlier the same shape
reached a reviewer's signature on **#650** (base `tools/lease-ownership` = #649's head); reviewer 5
caught it by reading `baseRefName` by hand and blocked the PR for it.

## Root cause

No queue looked at `baseRefName`. `review_claim` selects on gate state + review decision,
`rebase_claim` on gate FAILURE or `mergeStateStatus == DIRTY`, `rework_claim` on
`CHANGES_REQUESTED` — all three answer *"does this PR need work?"* and none answers *"can the work
be acted on?"*. That is #33's family exactly: correct components, one state nobody owns.

What makes it harmful rather than merely untidy is what `gh pr merge` does. It merges into the PR's
**base**, so for a PR based on a peer branch:

* the merge puts **nothing on main** — it writes the content onto that branch, where main's branch
  protection (faithfulness-gate + up-to-date + linear + enforce_admins) does not apply, so the
  reviewer's signature carries none of the guarantees they believe they are enforcing;
* it **moves the peer's head**, and a `CHANGES_REQUESTED` goes stale the moment the head moves — so
  the peer's rejection is not answered, it stops being visible. That is the laundering shape this
  log already records for `pr_land`, reached through a different door;
* `swarm_doctor` had no `baseRefName` awareness at all, so it reported such a PR as *covered* by
  whichever queue was offering it. The board read green.

## Fix / workaround

* `review_claim.sh`, `rebase_claim.sh`, `rework_claim.sh`: `select(.baseRefName=="main")` in the
  selector, with `baseRefName` added to the `--json` field list. In the selector rather than the
  loop **on purpose**: `swarm_doctor.queue_coverage` lifts these selectors verbatim, so putting the
  filter here means the doctor follows the change instead of drifting from it (the second-source-of-
  truth failure that check exists to avoid).
* `swarm_doctor.check_queue_coverage`: off-main PRs are excluded from its universe, so they are
  reported ONCE, by #46's `check_pr_base`, under a description that names the real remedy
  (`gh pr edit <n> --base main`) instead of "no queue can claim it".

**WHERE THIS DISAGREES WITH #46, IN ITS OWN WORDS.** That change wrote: *"it does not ask the queues
to skip such a PR. A PR no queue offers is stranded, which this log already records three times —
the right place to stop is the two tools that would act wrongly."* The concern is exactly right and
it is why this change is worth arguing rather than assuming; two things answer it:

1. **#46 itself removed the stranding risk.** `check_pr_base` names every off-main PR, with its
   number, its base and the remedy, on every doctor run. "Skipped by every queue AND named by a
   standing check" is not the #33 shape — #33 was work nothing mentioned at all.
2. **A refusal at the end does not give the slot back.** pr_gate/pr_land refusing is the right last
   line of defence, but by then a reviewer has leased the PR and run the gate, or a worker (me) has
   leased a pool worktree, spent a rebase attempt and had the counter charged. #656 cost exactly
   that, and left `rebase_attempts/656` at 1/3 — three of those and the queue stops offering it
   anyway, which is the same "invisible" end state reached expensively.

If a reviewer disagrees, the revert is one clause per tool (`select(.baseRefName=="main") | `) plus
the LAYER 2k line, and the test says exactly what is lost.
* `test_queue_base_main.sh` (new, prove_all LAYER 2j): two fixture PRs differing in one field, and
  three MUTATION cases that strip the clause from a copy of each tool and require the wrong answer.

Worker-side, meanwhile: if a queue hands you a PR whose base is not main, do not rebase or retarget
it blind. Check the depth first — #656 is four commits deep over three other open PRs, and
retargeting it at main would publish all four under one number.

## Evidence

```
$ bash raw-port/army/tools/rebase_claim.sh claim
CLAIMED 656 tools/slot-liveness   (conflicts with main; attempt 1/3 on head 816a8a5f)

$ git log --oneline origin/main..816a8a5f
816a8a5fc merge origin/main into tools/slot-liveness
236320954 slot liveness: a dead agent must not read as a full roster       <- #656
420a159a3 reap_dead_counters: clear a dead counter at any value ...        <- #651
d4313b25f review_claim: a G5-flagged PR is the reviewer's ...              <- #650
5a3b0ac16 tools: a lease may only be released by the agent holding it      <- #649
$ git diff --stat origin/main...816a8a5f | tail -1
 12 files changed, 940 insertions(+), 69 deletions(-)

after the fix, same fixtures, offline:
$ bash raw-port/army/tools/test_queue_base_main.sh
  OK    review_claim does not offer #656 (base is a peer branch)
  OK    review_claim still offers #660 (base is main)
  OK    rework_claim does not offer #656 (base is a peer branch)
  OK    rework_claim still offers #660 (base is main)
  OK    rebase_claim does not offer #656 (base is a peer branch)
  OK    rebase_claim still offers #660 (base is main)
  OK    mutation: without the guard review_claim DOES offer #656 (the case has teeth)
  OK    mutation: without the guard rework_claim DOES offer #656 (the case has teeth)
  OK    mutation: without the guard rebase_claim DOES offer #656 (the case has teeth)
test_queue_base_main: PASS
```

One note on the test, because it flaked on its first `prove_all` run and the fix is the interesting
part: with BOTH fixture rows and the guard removed, `review_claim` sees two claimable PRs and
`sort -R`s them, so "the mutant claims #656" was a coin toss. The mutation cases now use the
off-main row alone. A flaky lock is worse than no lock — it teaches people to re-run until green.
