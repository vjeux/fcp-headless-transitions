# the review queue re-offers a head another reviewer has already APPROVED

- **reported** 2026-08-11T22:52:00Z by reviewer-1
- **status** OPEN (measured on my own slot today; one-line fix proposed, not made)

## Symptom

`review_claim.sh claim` leased me PR #726 at head `5ca13cc1` — **55 seconds after another reviewer
had approved that same head, and 49 seconds before it merged.** I gated it, leased a pool worktree,
re-derived the whole thing and ran the verifier twice. The PR was merged out from under me while I
was measuring it; my verdict had nowhere to go.

Two reviewers ran `pr_gate` against the identical SHA seven seconds apart, which the commit's own
status history records:

```
$ gh api …/commits/5ca13cc1…/statuses
2026-08-11T22:44:04Z  pending  gate running on vjeux-mac      <- reviewer A
2026-08-11T22:44:11Z  pending  gate running on vjeux-mac      <- reviewer B (me), same head
2026-08-11T22:44:13Z  success  no raw-port/src ports to gate
2026-08-11T22:44:19Z  success  no raw-port/src ports to gate
```

Timeline, from the API:

```
22:43:07Z  reviewer A submits APPROVED on the PR                  (no gate status on the head yet)
22:44:02Z  review_claim leases ME the same PR at the same head    <- the bug
22:44:04Z  A's pr_land gates it … 22:44:34Z re-gates f046b9145 (its update-branch merge)
22:44:51Z  MERGED
22:49    Z  I am still measuring a head that no longer exists as a PR head
```

## Root cause

The queue's contract is "open PRs **without a fresh verdict for their current head SHA**", and the
lease is correctly keyed by PR#+head — but the SELECTOR only ever asks the gate STATUS about the
head. An approving review is consulted in exactly one arm:

```jq
select(.s=="NONE" or .s=="PENDING" or .s=="EXPECTED" or .s=="FAILURE"
       or (.s=="SUCCESS" and .d!="APPROVED" and .d!="CHANGES_REQUESTED"))
```

`.d` (the review decision) is tested **only** inside the `SUCCESS` arm. A head that is already
APPROVED but has no status yet falls into `.s=="NONE"` and is offered unconditionally.

And "approved but not yet gated" is not a rare state — **it is what the brief prescribes**:
`REVIEWER_BRIEF` says approve with your evidence and *then* `pr_land.sh`, and `pr_land` is what
posts the status. So every PR passes through a window, between a reviewer's signature and their
`pr_land` posting a status, in which the queue will hand that exact head to a second reviewer. The
window is short, but every reviewer is polling it.

The lease cannot save you here: reviewer A had already released theirs (their verdict was in), so
there was nothing to collide with. This is the #7/#224 "two reviewers on one head" race arriving
through the SELECTOR rather than through the lease.

**Cost.** One reviewer slot for ~6 minutes on work that was finished before it started, a duplicate
`pr_gate` (a pool worktree lease and a full gate run) on a head that already had a verdict in
flight, and a second `pending` status posted over a settled one — which is the shape OPS_LOG #17
was written about, avoided here only because both runs happened to agree.

## Fix / workaround

**Ask the same question the queue's own description asks: is there a review whose `commit_id` is
the CURRENT head?** If yes, that head has a fresh verdict regardless of what the status says, and
the PR is not review work. It is the review-side twin of the status check already there.

Do NOT simply extend `.d!="APPROVED"` to the other arms: `reviewDecision` is a property of the PR,
not of the head, and `dismiss_stale_reviews` is off, so an APPROVED PR that gets a new push would
become permanently unclaimable — starving exactly the re-review a new head deserves.

Note one interaction, in the safe direction: GitHub rebinds a review's `commit_id` FORWARD onto the
`update-branch` merges `pr_land` makes (OPS_LOG #35, and prove_all LAYER 2h). So a review can only
ever start naming a NEWER head than the one it was written on — the check can become more
conservative over time, never less, and it cannot un-see a verdict.

**Workaround until then, and it costs one field on a query you already run:** before gating a
freshly claimed PR, check `gh pr view <N> --json reviews,headRefOid` and confirm no review already
names the head you were leased. That is the same "read the PR's state before you spend a slot on it"
rule the auto-merge entry arrived at from the other direction — and the two are worth doing in one
call: `--json reviews,headRefOid,autoMergeRequest`.

## Evidence

```
$ bash raw-port/army/tools/review_claim.sh claim
CLAIMED 726 5ca13cc1a37658f10a73c70755a89e7ffb2060c5      # 22:44:02Z

$ gh api repos/vjeux/fcp-headless-transitions/pulls/726/reviews \
    --jq '.[]|[.state,.commit_id[0:8],.submitted_at]|@tsv'
APPROVED   f046b914   2026-08-11T22:43:07Z    # f046b914 is the update-branch merge of 5ca13cc1,
                                              # i.e. this review was rebound forward AFTER I claimed

$ gh pr view 726 --json state,mergedAt --jq .
state=MERGED  mergedAt=2026-08-11T22:44:51Z

$ git log -1 --format='%p' f046b9145
5ca13cc1a b14a2889d                            # first parent IS the head I was leased
```

The selector line quoted above is `raw-port/army/tools/review_claim.sh:59` on `origin/main` at
`704b935b7`.
