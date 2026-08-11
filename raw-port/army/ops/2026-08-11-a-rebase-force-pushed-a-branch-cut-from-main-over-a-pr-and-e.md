# a rebase force-pushed a branch cut from main over a PR and emptied it

- **reported** 2026-08-11T21:25:59Z by worker 9
- **status** FIXED IN THIS CHANGE (`publish_guard.sh` + the checkout status check in `rebase_pr.sh`)

## Symptom

`rebase_pr.sh 690` (PR `tools/rework-author-answered`, 5 files, 382 lines) printed two lines, both
of which read like success, and left the PR with **no content at all**:

    wt_pool: leased slot 4 -> /Users/vjeux/.fct-pool/wt/4 (port/tools/rework-author-answered, base main)
    REBASE_CLEAN: rebased tools/rework-author-answered onto origin/main + gate PASS, force-pushed

Afterwards the branch pointed at a commit from main's own history and the PR's three-dot delta was
empty. The author's work was not on main and not on the branch:

    git diff --name-status origin/main...8ee1ded2   ->   (nothing)
    branch tip 8ee1ded2 = "rebase(port/OZChannelBase): union-merge onto origin/main (#660)"

Restored by force-pushing the original head back (`+ 8ee1ded21...7173c01de`), and the five files
came back. The author's pool worktree, which held uncommitted edits to three of those files at the
time, was untouched — so nothing was lost, but only because someone was watching the file list.

## Root cause

Two known failures meeting, neither of which is visible on its own.

1. `CLS="${BR#port/}"` leaves a branch name that does not start with `port/` unchanged — every ops
   and tooling branch — and `wt_pool.sh acquire "$CLS"` then cuts **`port/<CLS>` from current main**.
2. The tool immediately corrects for that with `git -C "$WT" checkout -q -B "$BR" "origin/$BR"
   **2>/dev/null**`. A peer worker held that branch in another pool worktree, git refused the second
   checkout, and the error went to `/dev/null` (OPS_LOG #1, the swallowed `checkout -B`, reaching
   the force-push this time).

So the worktree stayed on the freshly-cut branch, `git rebase origin/main` had nothing to replay,
`gate.sh` was handed no changed `.ts` files and passed trivially, and `push -f HEAD:$BR` published
main over the PR. Every guard in the pipeline is aimed at DELETIONS, and from the pushed head's
point of view nothing was deleted: it simply never contained the work. `regression_check`, G6
add-only and the `--diff-filter=D` staleness check are all silent on it.

The same lease collision is what put two workers on this PR at once: it was held by the REWORK
queue (a peer, mid-edit) and the REBASE queue (me) simultaneously — the leases are per-queue, so
one PR can be held twice, and the two remedies fight over one branch.

## Fix / workaround

`raw-port/army/tools/publish_guard.sh`, called by `rebase_pr.sh` immediately before the force-push,
with two refusals:

* **on-branch** — the worktree's HEAD must BE the branch about to be overwritten; the refusal names
  the peer worktree holding it (`git worktree list`), which is the actual diagnosis.
* **publishes** — the head must not empty the PR, and must not drop a file the remote branch changes
  that the base does not have (the #25/#449 shape, generalised: the empty case is its corner).

Deliberately **not** an ancestry test ("HEAD must contain origin/<branch>"): a rebase rewrites the
commits, so that would reject every honest rebase force-push. Case 5 of the suite is that trap.

`rebase_pr.sh` also stops swallowing the checkout error: it refuses and releases the worktree
instead of rebasing whatever it happens to be on.

Locked by `test_publish_guard.sh` (10 cases against scratch repos with a real bare `origin`, no gh,
no network) and wired into `prove_all` as LAYER 2n in the same change — a guard nothing runs is
indistinguishable from no guard (row 44).

## Evidence

```
$ bash raw-port/army/tools/test_publish_guard.sh
  ok   — 1  a real rebase of the PR's own branch is allowed
  ok   — 2  a worktree left on another branch is REFUSED
  ok   — 3  a push that would empty the PR is REFUSED
  ok   — 3b the refusal counts what is on the remote (2 files), so it is checkable
  ok   — 4  a right-named head carrying none of the branch's work is REFUSED
  ok   — 5  rebasing onto a moved main is allowed (the normal case must not be blocked)
  ok   — 6  the refusal names the peer worktree holding the branch
  ok   — 6b a push that drops ONE of the branch's files is REFUSED
  ok   — 6c the refusal names the file that would be lost
  ok   — 7  a missing worktree exits 2 (never 0 — the caller must refuse too)
BASELINE (M0): 10 passed, 0 failed
  control M0 survived, as it must (the mutation pipeline perturbs nothing)
  mutant no_branch_test killed (would break the on-the-right-branch refusal (cases 2 and 6))
  mutant no_empty_test killed (would break the publishes-something refusal (case 3))
  mutant no_lost_files killed (would break the dropped-file refusal (case 6b))
TEST_PUBLISH_GUARD: PASS (10 cases, 3 mutants killed + the M0 control)

$ python3 -c "...; prove_all.layer2()"
LAYER 2n (publish guard — a force-push cannot empty a PR or drop its files): PASS   -> True
# and with `if [ "$head" != "$BR" ]` neutered in the shipped guard:
LAYER 2n (publish guard — a force-push cannot empty a PR or drop its files): FAIL   -> False
```

A note on the first version of that suite, because it is the failure this repo files most often:
the mutation harness copied `"$0"` into a scratch dir and re-ran it, the copy failed silently
because the suite `cd`s around and `$0` was relative, and **all three mutants therefore "died" of a
missing file**. The output was indistinguishable from a working lock. It now selects the mutated
guard through an env var and carries an **M0 control** that must SURVIVE, so a mutant killed by a
broken harness is visible as such.
