# a force-push to a commit already on main CLOSES the PR, and restoring the branch does not reopen it

- **reported** 2026-08-11T21:05:00Z by reviewer-1
- **status** OPEN — this is A PATH for the "PR closed below the attempt cap" mystery OPS_LOG says
  nobody had found. Mechanism measured on #690 today; the recovery is known and the prevention is a
  one-line check in `rebase_pr.sh`.

## Symptom

PR #690 (`tools/rework-author-answered`, 5 files, 382 lines, under review by me) went from OPEN to
CLOSED with no queue, no cap and no agent deciding anything:

    gh api repos/vjeux/fcp-headless-transitions/issues/690/events
      2026-08-11T21:02:17Z   head_ref_force_pushed   vjeux
      2026-08-11T21:02:17Z   closed                  vjeux        <- SAME SECOND

Worker 9's account (posted on the PR) supplies the cause: `rebase_pr.sh` derives its worktree class
as `CLS="${BR#port/}"` and hands that to `wt_pool.sh acquire`, which cuts **`port/<CLS>`**. For a
branch that does not begin with `port/` — every ops and tooling branch — that is a different,
brand-new branch cut from current main. The tool rebased that (nothing to replay), gated it
(trivially green), printed `REBASE_CLEAN … force-pushed`, and pushed it over
`tools/rework-author-answered`, whose head then became `8ee1ded2` — **a commit already on main**.

## Root cause

GitHub closes a pull request automatically when its head becomes a commit contained in the base.
Nothing in this swarm did it: no `gh pr close`, no attempt counter, no reviewer. It is a side effect
of the ref move, attributed to the operator account, in the same second.

And it does not undo. Worker 9 restored the branch immediately — `origin/tools/rework-author-answered`
is back at `7173c01de` with all five files present against main — but the PR object still records the
merged commit as its head, so:

    gh pr reopen 690  ->  GraphQL: Could not open the pull request. (reopenPullRequest)

The branch is fine, the review thread is fine, and the PR cannot be reopened until its HEAD moves off
the merged commit.

**Why this matters beyond one PR.** OPS_LOG's #571 entry records a PR "closed at 18:47:43Z with its
branch deleted and its lines never on main, with its attempt counter at 1 of 3, i.e. NOT the
documented at-cap auto-close", and closes with "nobody has found the other path yet". This is a path
that needs no cap and no decision — any tool that force-pushes a PR branch can trip it, and the
`REBASE_CLEAN … force-pushed` success line is printed either way.

## Fix / workaround

**Recovery, if you meet it:** push any new commit to the branch (the merge of `origin/main` the PR
owes is the natural one), which moves the head off the merged commit; `gh pr reopen <N>` then works
and the thread survives. If it still refuses, open a fresh PR from the SAME branch and link the old
one — the content is intact, so nothing is re-derived.

**Prevention, in `rebase_pr.sh`, and it is the same defect worker 9 is filing from the branch-naming
side:**

1. Derive the pool class from the branch only when the branch IS a port branch; otherwise use a name
   that cannot collide, and — the load-bearing part — **assert before any force-push that the ref you
   are about to publish descends from the PR's current head**:

       git merge-base --is-ancestor "$PR_HEAD" "$NEW_HEAD" || refuse

   A rebase produces a head that does NOT descend from the old one, so the honest form for the
   rebase path is "the new head's three-dot diff against main is non-empty AND its file list matches
   the PR's" — the file-list check #25/#449 already ask for. Either way the accident here is caught,
   because the pushed head's diff against main was EMPTY.
2. Refuse to push a head whose `git diff --name-status origin/main...HEAD` is empty. A PR with no
   content is never the intended outcome of a rebase, and that single condition is exactly what
   closes the PR.

## Evidence

```
$ gh api repos/vjeux/fcp-headless-transitions/issues/690/events \
    --jq '.[]|select(.event=="closed" or .event=="head_ref_force_pushed")|[.created_at,.event]|@tsv'
2026-08-11T21:02:17Z    closed
2026-08-11T21:02:17Z    head_ref_force_pushed

$ gh pr view 690 --json state,headRefOid --jq '[.state,.headRefOid[0:8]]|@tsv'
CLOSED  8ee1ded2                     # the commit that was already on main

$ git rev-parse --short origin/tools/rework-author-answered
7173c01de                            # the branch, restored by worker 9

$ git diff --name-status origin/main...origin/tools/rework-author-answered
A  raw-port/army/ops/2026-08-11-a-merge-of-main-reads-as-a-rework-and-the-pr-leaves-every-qu.md
M  raw-port/army/tools/rework_claim.sh
M  raw-port/army/tools/swarm_doctor.py
A  raw-port/army/tools/test_rework_author_answered.sh
M  raw-port/army/verifier/prove_all.py

$ gh pr reopen 690
GraphQL: Could not open the pull request. (reopenPullRequest)
```
