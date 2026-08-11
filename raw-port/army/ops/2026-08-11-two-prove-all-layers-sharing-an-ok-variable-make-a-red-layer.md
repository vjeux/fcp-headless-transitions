# two prove_all layers sharing an `ok` variable make a RED layer return PASS

- **reported** 2026-08-11T22:14:00Z by worker-8
- **status** OPEN (measured live; the four PRs I merged today are allocated around it by hand, which
  is not a fix)

**Read the layer-letters entry first** — worker 6's "prove_all layer letters are a contended global
counter" and worker 2's "every tooling PR conflicts on prove_all's layer tail" have the general
diagnosis. Both treat the collision as CLERICAL: keep main's layer, shift your letter, shift your
`r<N>`/`ok<N>`, extend the return. This is the case where doing exactly that, and getting the letter
right, still leaves the suite lying — and it lies TOWARD GREEN.

## Symptom

Two blocks in `prove_all.layer2()` that assign the **same** `ok<N>` both print correctly, and the
`return` reports only the LATER one. So a layer that FAILED prints `FAIL` on its own line while
`prove_all` prints `PASS ✅` and exits 0 — and every agent's startup check is `PROVE_ALL: PASS`,
not a count of the FAIL lines.

Measured just now, in a pool worktree, on a real copy of the file with two colliding blocks (main's
2l `cross_queue_lease` at `r12`/`ok12`, and a branch's block that a letter-only merge left at
`r12`/`ok12` as well), with the FIRST of them pointed at a script that does not exist:

```
LAYER 2l (cross-queue lease — one PR is never handed to two workers): FAIL
LAYER 2q (publish guard — a force-push cannot empty a PR or drop its files): PASS
PROVE_ALL: PASS ✅ — the anti-cheat verifier stack rejects known cheats and accepts real ports
EXIT=0
```

A red layer, a green verdict, exit 0.

## Root cause

A layer's identity is THREE hand-allocated things, not one: the label letter, the `r<N>`/`ok<N>`
binding, and its term in the single `return ok and ok2 and … and okN` expression. The existing
entries name all three but treat the letter as the thing that matters, because the letter is what
GIT conflicts on. The variable is what BREAKS, and git cannot see it: two branches that assign
`ok13` in different blocks merge cleanly wherever their blocks do not touch, and only the `return`
line conflicts — which the resolver fixes by writing `and ok13` once, since that is all the name
there is.

Note the asymmetry that makes it silent:

* the `print` is fine — it follows its own assignment, so each layer reports its own truth;
* the `return` is not — it names `ok13` once, after both assignments, so the second block's result
  is the only one that reaches the exit status.

The existing hazard on record is "a careless merge DROPS a suite and the conjunction shrinks with
it". This is the neighbour: nothing is dropped, both suites run, both print, and one of the two
results is simply unobservable. Counting the printed `LAYER` lines — the workaround the
layer-letters entry recommends, and a good one — does **not** catch it, because the count is right.

## Fix / workaround

WORKAROUND, and it is what I did across the four merges I was holding on this tail at once (#656,
#715, #714, #655): **allocate the letters AND the variable indices disjointly, in one place, before
pushing any of them** — #656 `2m/2n/2o` `r13-r15`, #715 `2p` `r16`, #714 `2q` `r17`, #655 `2r`
`r18/r19` — and say so in each PR so the next resolver inherits the allocation instead of guessing.
Then check the merge with this, which is the property that actually fires — **no `ok<N>` may be
assigned twice**:

    python3 - raw-port/army/verifier/prove_all.py <<'EOF'
    import re, sys
    s = open(sys.argv[1]).read()
    body = s[s.index("def layer2"):s.index("def _reach")]
    names = re.findall(r"^\s*(ok\d+) =", body, re.M)
    dupes = sorted({n for n in names if names.count(n) > 1})
    returned = set(re.findall(r"\b(ok\d+)\b", body[body.rindex("return"):]))
    missing = sorted(set(names) - returned)
    print(f"{len(names)} ok-assignments, double-assigned: {dupes or 'none'}, "
          f"assigned-but-not-returned: {missing or 'none'}")
    EOF

    origin/main            11 ok-assignments, double-assigned: none,      assigned-but-not-returned: none
    my merged head         12 ok-assignments, double-assigned: none,      assigned-but-not-returned: none
    the collided copy      12 ok-assignments, double-assigned: ['ok12'],  assigned-but-not-returned: none

**A WARNING ABOUT THE OBVIOUS VERSION OF THIS CHECK, because I wrote it first and it is inert.** The
natural formulation — "the return must name every `ok` the function assigns" — reports `none` on the
collided copy, i.e. it cannot fire on the very defect it is for: the duplicated name IS in the
return, once, which is exactly the problem. `assigned - returned` is a SET difference and the
collision does not change the set. The `assigned-but-not-returned` column is kept above only because
it catches the OTHER, already-recorded hazard (a resolution that drops a suite from the
conjunction), and it is shown next to a case where it prints `none` so nobody mistakes it for this
one's alarm. Two properties, two columns; the first is the new one.

FIX worth making, and it subsumes this: the layer-letters entry already proposes replacing the
hand-allocated letter+index with a **table of `(label, runner)` tuples** and `all(results)`. That
change removes this failure mode entirely rather than making it detectable — there is no name to
collide and no conjunction to under-write. This entry is the second, sharper reason to do it: the
letter collision costs a rebase, the VARIABLE collision costs the verifier's honesty.

Cheap intermediate, if the table is too big a change for one PR: have `swarm_doctor`'s existing
`layer-letters` check assert the same property over the variables (it already parses this file from
origin/main and already reports duplicate labels — an `assigned - returned` line is a few lines
next to it), so the next collision is a line in the doctor's report instead of a green suite with a
red layer in it.

## Evidence

The probe was a copy of `raw-port/army/verifier/prove_all.py` **inside a pool worktree** (it must
live in the tree — `prove_all` derives `REPO` from its own `__file__`, so a copy under `/tmp` dies
with `OSError: Read-only file system: '/raw-port'` before it proves anything), with three edits:

```
r17 = run([... "test_publish_guard.sh"])      ->  r12 = run([...])          # the collision a
ok17 = "TEST_PUBLISH_GUARD: PASS" in r17...   ->  ok12 = ... in r12...      # letter-only merge
... and ok12 and ok17)                        ->  ... and ok12)            # leaves behind
"test_cross_queue_lease.sh"                   ->  "..._MISSING.sh"          # make the FIRST fail
```

and the run above is its whole output for those three lines. The unmutated file at the same head
prints `LAYER 2l … PASS`, `LAYER 2q … PASS`, `PROVE_ALL: PASS`, exit 0 — so the difference is the
collision and not the harness.
