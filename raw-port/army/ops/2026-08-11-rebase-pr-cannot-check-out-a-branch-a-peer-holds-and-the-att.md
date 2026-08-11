# rebase_pr cannot check out a branch a peer holds, and the attempt is charged anyway

- **reported** 2026-08-11T20:45:00Z by worker-6
- **status** OPEN

## Symptom

`rebase_claim.sh` handed me PR #656 (`tools/slot-liveness`, "conflicts with main",
attempt 1/3 on head `b3820c58`). `rebase_pr.sh 656` leased a fresh pool worktree, then
stopped on one line:

```
rebase_pr: PR #656  branch=tools/slot-liveness  class=tools/slot-liveness
rebase_pr: PR #656 changes no .ts files and is CONFLICTING — rebase_helper cannot see it; merging origin/main in place
wt_pool: leased slot 15 -> /Users/vjeux/.fct-pool/wt/15 (port/tools_slot-liveness, base main)
rebase_pr: cannot check out tools/slot-liveness
```

The real error is one git refuses to make quiet, and `rebase_pr` swallows it:

```
$ git -C /Users/vjeux/.fct-pool/wt/15 checkout tools/slot-liveness
fatal: 'tools/slot-liveness' is already used by worktree at '/Users/vjeux/.fct-pool/wt/10'
```

`wt/10` was on that branch at `efa0ceb3a` — *"merge the BASE branch
tools/reap-dead-counters into tools/slot-liveness"* — while the remote branch was still
`b3820c58`. So the commit existed only in that worktree: **a peer was mid-rebase on this
exact PR, and the queue leased it to me at the same time.**

## Root cause

Two independent things, both of which have precedent in this log:

1. **A branch checked out in another pool worktree is invisible to the queue.** The
   REBASE queue's eligibility test is about the PR's *status* (conflicting / regression),
   and its lease bounds one worker per PR — but a peer that is mid-work through
   `rebase_pr` holds the branch in a WORKTREE, not through the rebase lease it may have
   already released, and nothing joins those two facts. This is OPS_LOG #1's
   "branch already used by another worktree" arriving on the REBASE path instead of the
   port path, where #240 fixed it by falling back to `port/<Class>__slot<N>`. A rebase
   cannot take that fallback: it must publish the SAME branch the PR points at.
2. **The attempt counter is charged before the work can start.** `$FCT_STATE_DIR/rebase_attempts/656`
   read `1` after a run that did nothing at all. That is OPS_LOG #28's shape (the counter
   counts claims, not failures) surviving in a path #28 did not cover: three collisions
   with a busy peer retire a PR nobody ever worked on.

## Fix / workaround

WHAT I DID, and what the next agent should do on this message: **do not push over it.**
The peer's merge commit is unpushed local work; publishing my own merge of the same
branch would either lose theirs or force them into a non-fast-forward push. I released
the lease, deleted the charged counter
(`rm -f $FCT_STATE_DIR/rebase_attempts/656 ...656.sha`) so the collision costs the PR
nothing, and moved on to the next unit.

TOOL FIXES, cheapest first:

* `rebase_pr.sh` should print git's actual message rather than `cannot check out <branch>`
  — the useful half ("already used by worktree at …") is exactly what tells you a peer is
  on it, and it is thrown away today.
* On that specific failure it should **release the rebase lease and NOT charge an
  attempt**, ideally re-queueing the PR for later: a branch held elsewhere is a
  *try again in a minute* condition, not a failed rebase.
* Stronger: `rebase_claim.sh` could skip a PR whose branch is currently checked out in any
  pool worktree — `git worktree list --porcelain | grep -F "branch refs/heads/<br>"` is
  one cheap local call and it is the same question the lease is trying to answer.

## Evidence

```
$ bash raw-port/army/tools/rebase_claim.sh claim
CLAIMED 656 tools/slot-liveness   (conflicts with main; attempt 1/3 on head b3820c58)

$ git -C ~/.fct-pool/wt/10 log --oneline -1
efa0ceb3a merge the BASE branch tools/reap-dead-counters into tools/slot-liveness
$ git ls-remote origin tools/slot-liveness
b3820c58d5603dc6dd363b77236148419cc6c425	refs/heads/tools/slot-liveness      # peer's work unpushed

$ cat ~/.fct-pool/rebase_attempts/656
1                                     # charged for a run that did nothing
```
