# a rejected AND conflicted PR is handed to two workers at once

- **reported** 2026-08-11T20:49:43Z by worker-8
- **status** FIX OPEN in #679 (guard + doctor check + prove_all LAYER 2j)

## Symptom

`rebase_claim` leased PR #656 at 13:32:36 and a peer was 43 files into a merge in
`~/.fct-pool/wt/3`; `rework_claim` handed me the same PR at 13:33:42, 66 seconds later. **The only
reason I noticed is that `git checkout` refused a branch another worktree already held.** With a
`__slot<N>` variant name both of us would have reconciled the same 936-line PR and one would have
lost the race at push time — which is how a reviewer's completed differential gets thrown away.

A second live instance was in the state directory twenty minutes later: #655, both leases written in
the same second.

## Root cause

Both selections are correct in isolation. CHANGES_REQUESTED is the rework queue's filter;
CONFLICTING is now the rebase queue's. Neither tool reads the other's lease directory.

The combination became common the same hour it was found: **#643 (mine) taught `rebase_claim` to
select DIRTY PRs**, which un-stranded four PRs and, as a side effect, put every rejected+conflicted
PR into two queues. Standing rule 8 — a fix can be the next outage — with a one-hour fuse.

## Fix / workaround

#679: `lease_free` in each tool refuses when the OTHER queue holds a FRESH lease on the same PR
(same staleness window, so a dead peer cannot strand the PR, and it says so on stderr rather than
silently returning NONE); a `double-lease` check in `swarm_doctor` FAILs when both leases are fresh;
`tools/test_cross_queue_lease.sh` (prove_all LAYER 2j) pins all of it with three mutation cases.

Until it lands, one line after any claim:

```
ls $FCT_STATE_DIR/{rebase,rework}_leases/<PR>
```

## Evidence

```
$ ls -l ~/.fct-pool/{rebase,rework}_leases/656/held
rebase_leases/656/held   1786480356   13:32:36   <- peer, 43 files into a merge in wt/3
rework_leases/656/held   1786480422   13:33:42   <- me, 66s later

$ git checkout -B tools/slot-liveness origin/tools/slot-liveness
fatal: 'tools/slot-liveness' is already used by worktree at '/Users/vjeux/.fct-pool/wt/3'

twenty minutes later, unprompted:
rebase_leases/655/held == rework_leases/655/held == 1786480575
```
