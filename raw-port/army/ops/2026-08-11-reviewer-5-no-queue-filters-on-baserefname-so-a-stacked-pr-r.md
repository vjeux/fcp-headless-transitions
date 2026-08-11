# No queue filters on `baseRefName`, so a stacked PR is handed to a reviewer whose land step writes to a peer's branch

**Reported 2026-08-11 by reviewer 5. Hit twice in one hour, on #650 and #656.**
**Status: PARTLY FIXED — fixes 2 and 3 landed in #670 three minutes after this was written;
fix 1 is still open. See CORRECTED BEFORE MERGE at the end before acting on anything here.**

## The shape

`review_claim.sh`, `rebase_claim.sh` and `rework_claim.sh` all select from `gh pr list --state open`
and filter on the gate status and the review decision. **None of them reads `baseRefName`.** So a PR
whose base is another agent's feature branch is offered to a reviewer exactly like a
main-targeted one, and the documented reviewer loop — gate, approve, `pr_land.sh` — ends in
`gh pr merge --squash --delete-branch`, which merges into **the PR's base**. Nothing on that path
mentions main.

`swarm_doctor.py` has no `baseRefName` awareness either, so its `queue-coverage` check counts such a
PR as covered: it *is* claimable, it just cannot reach main.

## Two live instances, both leased to me by `review_claim`

**#650** (as it stood when this was written; both PRs have since been retargeted to `main` and
are APPROVED) — `tools/review-claim-g5` was based on `tools/lease-ownership`, which is **#649's head
branch, and #649 stood CHANGES_REQUESTED**. Squashing #650 onto that branch would have (a) put nothing on
main, (b) moved #649's head, which makes a standing rejection go stale and re-qualifies the PR for
the review queue as "unreviewed" — the laundering door this log already documents — and (c) deleted
the head branch. Branch protection cannot help: `main`'s required status, up-to-date and linear
rules say nothing about a merge into `tools/lease-ownership`. The stack was also already out of date
(head's parent `5a3b0ac1`, base branch tip `d5f59cd6`) and GitHub still reported `MERGEABLE / CLEAN`.

**#656** (STILL LIVE at the time of this correction: `base=tools/reap-dead-counters`) —
`tools/slot-liveness` based on `tools/reap-dead-counters`, which is **#651, currently APPROVED and
unlanded**. Here the stack is coherent and deliberate, and the harm is smaller but
real: merging #656 first pushes a commit onto #651's head, and an approval does not survive a push,
so a reviewer landing the child silently un-approves the parent and sends it back through review.

Of 11 open PRs at the time, these two were the only non-`main` bases — rare enough that no tool
notices, common enough to hit twice in an hour.

## Why the reviewer does not see it

Nothing in `REVIEWER_BRIEF.md`, `PR_FLOW.md` or `HARNESS_LOOP.md` mentions a base branch; every
sentence assumes `main`. `pr_gate.sh` reinforces the illusion, because it computes
`CHANGED=$(git diff --name-only origin/main...HEAD …)` and runs `regression_check` / `dup_check`
against `origin/main` — so its verdict is about the PR's delta **against main**, i.e. against the
whole stack, not against what the merge would actually apply. On a non-src PR it prints
`PR_GATE: PASS (no src changes)` and posts green, and the reviewer has no signal at all.

I caught #650 only because the three-dot file list against main (9 files) disagreed with what GitHub
showed for the PR (3 files) and I went looking for why.

## Fix

1. **Add `.baseRefName == "main"` to the three queue selectors.** A PR that cannot reach main is not
   a reviewer's unit of work; it is either waiting on its parent or mis-targeted.
2. **Have `pr_land.sh` refuse a PR whose base is not `main`**, naming the base — the same shape as
   its existing refusals to merge over an un-dismissed rejection or without an approval on the
   current head. This is the load-bearing half: it is the step that does the damage.
3. **`swarm_doctor`: report an open PR whose base is not `main` as its own row**, with the parent PR
   number, so a deliberate stack is visible rather than silently counted as covered.

Until then, the reviewer-side check is one field on a query you already run:

    gh pr view <N> --json baseRefName -q .baseRefName      # must be "main" before you pr_land

## CORRECTED BEFORE MERGE

*(Added by worker 4 on reviewer 5's REQUEST_CHANGES, re-measured against `origin/main` rather than
copied from the review. This entry was true when it was written at 13:47:15 and two thirds of it
was fixed at 13:50:31 — three minutes later, in a PR that credits this very finding. Left as
written, the archive would tell the next agent to go and fix two things that already work.)*

**Fix 1 — the queue selectors — IS STILL OPEN.** The core finding stands: no queue reads the base,
so a stacked PR is still offered to a reviewer exactly like a main-targeted one.

    git show origin/main:raw-port/army/tools/review_claim.sh | grep -c baseRefName   ->  0
    git show origin/main:raw-port/army/tools/rebase_claim.sh | grep -c baseRefName   ->  0
    git show origin/main:raw-port/army/tools/rework_claim.sh | grep -c baseRefName   ->  0

**Fixes 2 and 3 LANDED in #670**, `833c6051f` — *"fix(pr_gate,pr_land): a PR whose base is not main
is gated against one thing and merged into another"*, 2026-08-11 13:50:31 -0700:

* `pr_land.sh:64-72` reads `baseRefName` and **refuses** — `pr_land: REFUSING to merge PR #N — its
  base is '<base>', not 'main'.`, exit 4, with an `FCT_ALLOW_NONMAIN_BASE=1` escape hatch. That was
  the load-bearing half of this entry: the step that did the damage now stops.
* `swarm_doctor.py:121-131` carries a dedicated **`pr-base`** row that FAILs and lists every open PR
  whose base is not main, so a stack is visible instead of being counted as covered.

**The instances have moved on too.** `#650` and `#649` are both `base=main` and APPROVED; the live
instance is `#656`, still based on `tools/reap-dead-counters` (#651, APPROVED, unlanded).

**"Why the reviewer does not see it" is unchanged and still true.** The briefs still say nothing
about a base branch, and `pr_gate.sh` still computes `CHANGED` against `origin/main`, so a reviewer
of a stacked PR gets no signal from the gate — the green status is about the whole stack's delta
against main, not about what the merge would apply. The one-line habit at the end of this entry is
still the right one; `pr_land`'s refusal is now the backstop behind it, not a replacement for it.
