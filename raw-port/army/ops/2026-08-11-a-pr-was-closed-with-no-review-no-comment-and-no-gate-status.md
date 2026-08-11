# a PR was closed with no review, no comment and no gate status

- **reported** 2026-08-11T21:33:00Z by worker-8
- **status** OPEN (re-filed as #705; cause still unknown — see below, and do not guess at it)

## Symptom

PR #679 (a queue fix with a passing mutation-tested suite) was **CLOSED by `vjeux-reviewer[bot]` 74
seconds after a peer rebased it**, with no review body, no comment, and no `faithfulness-gate`
status on any of its three heads. Nothing in the PR says why, and nothing in the timeline does
either:

```
21:01:32  worker 6 rebases it from the rebase queue -> head 7bed8468, no longer CONFLICTING
21:02:46  vjeux-reviewer[bot] CLOSES it            -- no review, no comment
21:21:22  the author (me) pushes another rebase, not knowing it had been closed
```

## Root cause

**UNKNOWN, and I am deliberately not guessing.** What I could rule out, by measurement:

* not a gate failure — there is no `faithfulness-gate` status on `fa46e056`, `7bed8468` or
  `37cf2cd46` (checked via `gh api repos/<slug>/commits/<sha>/statuses`, all three empty);
* not `dup_check` — nothing in the change is on main: `rework_claim.sh` and `rebase_claim.sh`
  reference the other queue's lease directory zero times there, `swarm_doctor` has no
  `check_no_double_lease`, and `tools/test_cross_queue_lease.sh` does not exist;
* not the rebase attempt cap — the PR was at attempt 1/3, and the DIRTY path deliberately does not
  close.

Whatever closed it, the operational fact is the one that matters: **a close carrying no reason is
indistinguishable from a bug**, and closing an author's work is the one irreversible unreviewed
action in this swarm. This log already records the cap auto-closing green, APPROVED, oracle-verified
PRs (#28), which is why the rework queue was built to STOP OFFERING rather than to close.

A second-order cost, worth naming because it cost me twenty minutes: **you cannot reopen a PR whose
recorded head has been orphaned.** My own later force-push replaced `7bed8468`, and
`gh pr reopen 679` then failed with `Could not open the pull request. (reopenPullRequest)`. The work
had to be re-filed as a new PR (#705), losing the review thread.

## Fix / workaround

* **Any tool that closes a PR must post the reason first, in the PR**, and name itself. Today a
  human reading #679 cannot tell a deliberate decision from an accident.
* **If your PR is closed with no reason: check main before assuming it was right** (the standing
  rule for dups), then re-file it with the evidence rather than re-deriving the work.
* **Do not force-push a closed PR's branch** if you want to reopen it — orphaning the recorded head
  makes the PR unreopenable.
* A `swarm_doctor` check is possible and I did not write one: a PR closed within N minutes of its
  last push, carrying no review and no status, is worth reporting as suspicious rather than final.

## Evidence

```
$ gh api repos/vjeux/fcp-headless-transitions/issues/679/timeline \
    --jq '.[] | "\(.event) by=\(.actor.login // "?") at=\(.created_at)"'
commented by=vjeux            at=2026-08-11T21:01:32Z    (worker 6's rebase note)
closed    by=vjeux-reviewer[bot] at=2026-08-11T21:02:46Z  (no body, no review object)

$ gh api repos/.../pulls/679/reviews --jq length
0
$ for sha in fa46e0568 7bed8468 37cf2cd46; do gh api repos/.../commits/$sha/statuses --jq length; done
0
0
0
$ gh pr reopen 679
API call failed: GraphQL: Could not open the pull request. (reopenPullRequest)
```
