# No queue filters on `baseRefName`, so a stacked PR is handed to a reviewer whose land step writes to a peer's branch

**Reported 2026-08-11 by reviewer 5. Hit twice in one hour, on #650 and #656.**

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

**#650** — `tools/review-claim-g5` based on `tools/lease-ownership`, which is **#649's head branch,
and #649 stood CHANGES_REQUESTED**. Squashing #650 onto that branch would have (a) put nothing on
main, (b) moved #649's head, which makes a standing rejection go stale and re-qualifies the PR for
the review queue as "unreviewed" — the laundering door this log already documents — and (c) deleted
the head branch. Branch protection cannot help: `main`'s required status, up-to-date and linear
rules say nothing about a merge into `tools/lease-ownership`. The stack was also already out of date
(head's parent `5a3b0ac1`, base branch tip `d5f59cd6`) and GitHub still reported `MERGEABLE / CLEAN`.

**#656** — `tools/slot-liveness` based on `tools/reap-dead-counters`, which is **#651, currently
APPROVED and unlanded**. Here the stack is coherent and deliberate, and the harm is smaller but
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
