# the warm pool stacks your unit onto another agent's APPROVED PR, and pr_submit force-pushes it

- **reported** 2026-08-11T21:25:00Z by worker-1
- **status** OPEN (hit live, avoided by hand; nothing in the loop would have stopped it)

## Symptom

`depclaim.py next` handed me `HGEquirectReorient::SetTexW`. I ran the standard loop —
`wt_pool.sh acquire HGEquirectReorient` — and the pool told me, correctly and by design, that it
was stacking:

    wt_pool: port/HGEquirectReorient has an OPEN PR + is ahead of main -> STACKING on it
             (base=origin/port/HGEquirectReorient)
    wt_pool: leased slot 18 -> /Users/vjeux/.fct-pool/wt/18 (port/HGEquirectReorient, base port/HGEquirectReorient)

That open PR was **#671, another agent's work, already APPROVED and gate-green**, created nine
minutes earlier. My worktree's HEAD was ITS branch. Had I finished the unit and run the loop's next
step, `pr_submit.sh HGEquirectReorient` would have:

1. `git rebase -q origin/main` — rewriting the approved commit's SHA (`pr_submit.sh:47`),
2. `bash ghapp/git_push_as.sh worker -q -u origin "$BR" --force-with-lease` (`:49`) — a FORCE push
   onto `port/HGEquirectReorient`, i.e. onto PR #671's head,
3. found the existing PR and printed `PR already open: #671` (`:76`), adding my unit to it,
4. written `$FCT_STATE_DIR/authored/671` = `worker-1`, overwriting the record of who actually
   authored it — which is the marker `review_claim.sh` uses to keep a reviewer off its own PR.

So a second worker, running the documented loop with no mistake of its own, silently republishes
somebody else's approved PR under a new head with extra code in it. The approval then names a SHA
that no longer exists, and the PR a reviewer signed is not the PR that would merge. I only avoided
it because I checked #671's `reviewDecision` by hand before submitting, which nothing told me to do.

## Root cause

Two correct decisions meeting:

* `wt_pool.sh acquire` stacks on any `port/<Class>` that has an OPEN PR. That is OPS #4's FIX —
  stacking on a PR-less branch was deleting landed methods, so stacking was restricted to branches
  with an open PR. Nothing there asks what STATE that PR is in.
* `pr_submit.sh` treats "a PR is already open on this branch" as the benign case (`PR already
  open: #N`) — true when the branch is your own from a previous unit, which is the case it was
  written for.

Neither knows the branch belongs to a different agent, because GitHub cannot tell them apart: every
PR is authored by the worker app and the operator login is shared (the reason `FCT_AGENT_ID` and the
`authored/` markers exist at all). The one piece of state that WOULD answer it — `authored/<PR#>` —
is written by `pr_submit`, read by `review_claim`, and consulted by nothing on the submit path.

This is the "an approval is rebound to a commit nobody read" family (already in this log from the
reviewer side, fixed there with `--expect-head`), arriving from the WORKER side through the pool.
The reviewer-side fix cannot see it: `--expect-head` protects the moment of signing, not a
force-push that lands after the signature.

## Fix / workaround

WORKAROUND, and it is two seconds — do this whenever `wt_pool` says STACKING:

    gh pr view <the open PR> --json reviewDecision,headRefOid --jq '[.reviewDecision,.headRefOid]|@tsv'

If it is `APPROVED` (or simply not yours — check `cat $FCT_STATE_DIR/authored/<PR#>`), do NOT submit
on that branch. Cut your own: `git checkout -B port/<Class>__slot<N>` and `pr_submit.sh` that
variant — the `__slot<N>` suffix is already allowed (`pr_submit.sh:23`) and is how the swarm
normally handles a contended class (#652 did exactly this for `OZChannel`).

FIXES WORTH MAKING, cheapest first:

1. `pr_submit.sh`: before the force-push, if an open PR exists on `$BR` and either
   `authored/<PR#>` names a DIFFERENT agent or its `reviewDecision` is `APPROVED`, REFUSE (exit 5,
   same shape as the existing class/branch-mismatch refusal) and print the `__slot<N>` remedy. This
   is the smallest change that closes it, and it fails safe: with no marker and no approval,
   behaviour is unchanged.
2. `wt_pool.sh acquire`: when the class's open PR is APPROVED, hand back `port/<Class>__slot<N>`
   based on that PR's head instead of the shared branch. Stacking still gets its benefit (you build
   on the sibling unit rather than conflicting with it) without putting two agents on one PR.
3. Say it in `DEP_WORKER_BRIEF.md`: today the brief's port loop is `acquire -> write -> gate ->
   pr_submit`, with nothing about what a STACKING line means for the PR you are about to touch.

## Evidence

The stacking line and the branch it left me on are quoted above, from the live run. The submit path
is quoted from `raw-port/army/tools/pr_submit.sh` on `origin/main` at the time of writing
(`BR="port/$CLASS"` `:12`, the variant-suffix allowance `:23`, `git rebase -q origin/main` `:47`,
`git_push_as.sh worker ... --force-with-lease` `:49`, `PR already open: #$EXIST` + `note_authored`
`:76-78`). The PR I would have force-pushed:

```
$ gh pr view 671 --json createdAt,reviewDecision,commits
{"createdAt":"2026-08-11T20:32:02Z","reviewDecision":"APPROVED",
 "commits":["port: HGEquirectReorient::SetWrapTexture(bool) @Helium 0x4820", ...]}
```

Note `--force-with-lease` does not help here: the lease is against the remote ref I just fetched,
which is exactly the approved head I would be overwriting. It protects against a race, not against
overwriting the right ref for the wrong reason.
