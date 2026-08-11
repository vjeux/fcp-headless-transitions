# Every tooling PR now conflicts on the same two lines: prove_all's layer tail and the doctor's CHECKS list

- **reported** 2026-08-11T21:15:00Z by worker-6
- **status** OPEN

## Symptom

Three consecutive REBASE-queue claims in one 40-minute stretch — #651, #679, #649 — were
the SAME conflict, in the same two places, and none of them disagreed about anything:

```
Conflicted:  raw-port/army/tools/swarm_doctor.py raw-port/army/verifier/prove_all.py
```

Each pair looked like this (from #679):

```
<<<<<<< HEAD
    r10 = run(["bash", os.path.join(TOOLS, "test_cross_queue_lease.sh")])
    ok10 = "TEST_CROSS_QUEUE_LEASE: PASS" in r10.stdout
    print("LAYER 2j (cross-queue lease — one PR is never handed to two workers):",
=======
    r10 = run(["bash", os.path.join(TOOLS, "test_pr_base_is_main.sh")])
    ok10 = "test_pr_base_is_main: PASS" in r10.stdout
    print("LAYER 2j (a PR's base must be main — the gate and the merge target must agree):",
>>>>>>> origin/main
```

and

```
<<<<<<< HEAD
CHECKS = [check_queue_coverage, check_guards_wired, check_lease_ownership, check_tree_current,
=======
CHECKS = [check_pr_base, check_queue_coverage, check_guards_wired, check_tree_current,
>>>>>>> origin/main
```

Both sides are *additions*. Neither author touched the other's work.

## Root cause

`prove_all.py` numbers its layers by hand (`2i`, `2j`, …) and threads each one through a
positional variable pair (`r10`/`ok10`) plus a single `return ok and ok2 and … and ok10`
line. `swarm_doctor.py` registers its checks in one literal `CHECKS = [...]` list. So
**"add a check" means editing the same two lines every other check-adding PR edits**, and
the letter/number a PR picks is only correct until someone else's PR merges first.

This is exactly the contention argument that moved ops reports out of `OPS_LOG.md` and into
one-file-per-entry `ops/` (#638), arriving in the verifier. The difference is that a merge
here is not just annoying: **the natural "resolve by taking one side" reflex silently
deletes a guard**, and the result is gate-clean and PROVE_ALL-green, because a layer that is
not in the file cannot fail. I resolved all three by keeping both sides and renumbering the
incoming one to the next free letter, but that is a judgement each rebasing worker has to
get right, three times a day, on someone else's change.

## Fix / workaround

WORKAROUND (what I did, and what the next rebaser should do): **never choose a side.** Keep
main's layer at its letter, renumber the branch's to the next free one, give it fresh
`rNN`/`okNN` names, and add it to the `return` conjunction — then re-run `prove_all` and
confirm BOTH layer lines print. Same for `CHECKS`: union the lists rather than taking
either.

TOOL FIX, and it is small:

* have `prove_all` collect layers in a list instead of numbered variables —
  `LAYERS.append(("2j cross-queue lease", lambda: run([...]) ))`, with the pass/fail fold
  computed by iterating — so adding a layer is an append, not an edit of the fold line;
* better still, make each layer a FILE (`verifier/layers/<name>.py`) discovered by glob, the
  same shape `ops/` uses. Two PRs adding two layers then touch two files;
* `swarm_doctor` can register with a decorator (`@check`) that appends to `CHECKS` at import,
  so the list literal disappears entirely.

## Evidence

Three PRs, three identical conflicts, all resolved by keeping both sides, each verified after
the merge:

```
#651  prove_all: main's 2i (queue coverage) kept, branch's reaper layer -> 2j
      -> test_reap_dead_counters: PASS ; test_queue_coverage: PASS ; PROVE_ALL: PASS
#679  prove_all: main's 2j (pr base) kept, branch's cross-queue layer -> 2k
      CHECKS: union of check_pr_base + check_no_double_lease
      -> TEST_CROSS_QUEUE_LEASE: PASS ; test_pr_base_is_main: PASS ; PROVE_ALL: PASS (2i,2j,2k)
#649  prove_all: main's 2j kept, branch's release-ownership layer -> 2k
      CHECKS: union of check_pr_base + check_lease_ownership
      -> test_wt_pool_release_ownership: PASS ; PROVE_ALL: PASS (2i,2j,2k)
```

Note the collision rate: #651 was rebased at 13:41 against a main that did not yet contain
the `2j` that #679 collided with at 14:00. It is already stale again — whichever of the three
lands second will need the same renumbering a second time.
