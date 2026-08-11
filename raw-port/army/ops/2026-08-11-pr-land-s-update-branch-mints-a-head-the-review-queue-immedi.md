# `pr_land`'s update-branch mints a head the review queue immediately offers to a SECOND reviewer

- **reported** 2026-08-11 by reviewer 2
- **status** OPEN (measured live on PR #656; no damage this time because I noticed the peer's
  signature and stood down)

## Symptom

`review_claim.sh claim` leased me PR #656 at head `72feff58`. **Seven seconds later a peer's APPROVE
was recorded on that same head**, and I was not the one who signed it:

    15:49:37  (me)    CLAIMED 656 72feff5899e476be67c8dc22655e9610a8ace124
                      $ cat ~/.fct-pool/review_leases/pr-656/held
                      1786488577 72feff5899e476be67c8dc22655e9610a8ace124     <- one lease: mine
    15:49:44  (peer)  APPROVED  72feff58            (7s after my claim)
    15:51:06          head is now d4ba9eff, mergeStateStatus CLEAN            <- a THIRD head

The PR's review list shows the shape plainly — consecutive approvals on consecutive heads, each one
an `update-branch` merge commit produced by the peer's own `pr_land` loop:

    CHANGES_REQUESTED  23632095   20:32
    CHANGES_REQUESTED  b3820c58   20:42
    CHANGES_REQUESTED  d121c1c3   21:47
    APPROVED           0646712f   22:34
    APPROVED           72feff58   22:49:44        <- the head review_claim had just leased to me

I ran `pr_gate.sh 656` on `72feff58` before I worked out what was happening: a pool worktree lease
and a gate run spent on a head another reviewer was already merging.

## Root cause

The review lease is keyed by **PR# + head SHA**, which is exactly right for its stated purpose — two
reviewers never gate the *same* head. But `pr_land`'s REBASE-RACE loop **creates a new head every
round**: `update-branch` makes a merge commit, waits for the new SHA, re-gates it, tries to merge,
and if main moved again, does it once more. Each of those heads is a PR with no fresh verdict for
its current SHA, so `review_claim` correctly — and uselessly — offers it to whichever reviewer asks
next. The holder of the *previous* head's lease is not consulted, because by construction it is
holding a different key.

So the documented REBASE-RACE (OPS_LOG, reviewer 3: *"#420 burned 12 rounds across two invocations"*)
is worse than a gate-time cost to the agent running it: **every losing round manufactures a fresh
review-queue item for a different slot.** At 8 reviewers, a PR that laps the update-branch cycle N
times can pull in up to N reviewers, each paying a pool lease and a gate for a head that is already
approved and mid-merge by someone else. It is a queue that gets *more* attractive the more contended
the merge is.

Nothing here is a lease bug: every lease behaved as specified. The queue's unit of exclusion (a head)
is finer than the unit of work (a PR), and one agent's merge machinery is what subdivides it.

## Fix

In rough order of value:

1. **Do not offer a PR whose head is a `pr_land` update-branch merge commit.** They are recognisable
   without guessing: the merge commit's *first parent* is the previously-verified head and its tree
   is the merge of main into it. `review_claim` already reads `statusCheckRollup`; a PR that carries
   an APPROVE whose `commit_id` is the first parent of the current head is being landed by someone,
   not waiting for a verdict.
2. **Lease by PR, refresh by head.** Keep the head in the lease file (so a genuine author push is
   still visible as "the head moved, re-review"), but make the *directory* `pr-<N>` exclusive for a
   short TTL, so a head that moves under a live holder does not become a second claimable item. This
   is what the lease was already trying to say — `pr-656` is one directory today, and it is the SHA
   *inside* it that made the second offer legal.
3. Failing both, `review_claim` could skip a PR that already carries an APPROVE from the reviewer app
   on a head reachable from the current one, since that is a PR in the merge path rather than in the
   review path.

Worth noting what already works and should not be touched: `pr_review.sh --expect-head` and
`pr_land`'s tree-identity carry check both refused to do anything unsafe throughout this, and the
peer's signature was visible to me only because `pr_review` records the SHA it signs.

## Workaround for a reviewer meeting this today

Before gating a claimed head, read the PR's reviews once:

    gh api repos/vjeux/fcp-headless-transitions/pulls/<N>/reviews \
      --jq '.[]|[.state,.commit_id[0:8],.submitted_at]|@tsv' | tail -3

An APPROVE dated within the last minute or two, on your head or on its parent, means a peer is
mid-land: release the lease and claim the next PR. Do **not** start a second `pr_land` — that is two
agents racing update-branch on one PR, and the losing round costs another gate.
