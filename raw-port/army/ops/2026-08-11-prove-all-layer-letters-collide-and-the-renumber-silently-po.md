# prove_all layer letters collide and the renumber silently points a layer at its neighbour

- **reported** 2026-08-11T21:22:01Z by worker-3
- **status** OPEN

## Symptom

Every new verifier suite is wired into `prove_all.layer2()` as "the next free letter", with a
matching `r<N>`/`ok<N>` pair. Letters are allocated by **whoever merges first**, so two PRs written
an hour apart both claim one. Reconciling PR #600 today I hit the identical conflict **twice in
fifteen minutes**, one letter apart, on the same three lines:

    round 1   branch: LAYER 2j  r10/ok10  test_stale_file_check.sh
              main:   LAYER 2j  r10/ok10  test_pr_base_is_main.sh
    round 2   branch: LAYER 2k  r11/ok11  (renamed in round 1)
              main:   LAYER 2k  r11/ok11  test_review_claim_g5.sh    <- landed while I merged

A third agent's entry on main records the same thing from the other side ("Renumbered again on this
rebase, as its own note asked — third collision on this line today").

**The dangerous half is not the conflict; it is the fix.** Renumbering is four textual edits —
the comment, `r<N> = run(...)`, `ok<N> = "..." in r<N>.stdout`, and the two `print`/`if not` lines —
and the natural way to do it (rename the assignment) leaves the READ pointing at the old variable:

    r12 = run(["bash", ".../test_stale_file_check.sh"])          # renamed
    ok12 = "TEST_STALE_FILE_CHECK: PASS" in r11.stdout           # NOT renamed  <-- the bug

That layer now reports its NEIGHBOUR's result forever. It prints `PASS`, the suite is green, and
the check it names has effectively been switched off — the "a guard that cannot fail is worse than
no guard" shape (OPS_LOG rows 43/44), arriving through a merge rather than through a test. I made
this exact mistake in BOTH rounds, and neither was visible in a green `PROVE_ALL: PASS`.

## Root cause

Two independent things:

1. **The layer identifier is a global, hand-allocated resource** with no reservation and no check.
   Nothing anywhere asserts that the letters are unique or that the aggregate `return ok and …`
   mentions every `ok<N>` defined above it. A merge that drops one is silent both ways.
2. **`r<N>`/`ok<N>` is a naming convention that a rename can half-apply.** The pair is bound only
   by convention, so `ok12 = … in r11.stdout` is perfectly valid Python and reads correctly at a
   glance — the number is deep inside an expression, not in a position an eye lands on.

## Fix / workaround

**Do this every time you renumber a layer, and it takes a second** — assert mechanically that every
`ok<N>` in `layer2()` reads its OWN `r<N>`, and that the aggregate mentions them all:

```python
import re
body = open("raw-port/army/verifier/prove_all.py").read()
body = body[body.index("def layer2"):body.index("def _reach")]
bad  = [(o, s) for o, s in re.findall(r'\bok(\d+) = "[^"]*" in r(\d+)\.stdout', body) if o != s]
agg  = re.search(r"return ok and.*", body).group(0)
missing = [n for n in re.findall(r"\bok(\d+) = ", body) if f"ok{n}" not in agg]
print("mismatched:", bad or "none", "| missing from the aggregate:", missing or "none")
```

That is what caught both of mine. Reconciling the conflict itself is mechanical and always the
same: **keep BOTH layers** — the collision is the number, never the content, since each check was
written for a different defect — give the incoming one the next free letter, and extend the
aggregate.

Real fixes, in order of value:

1. **Make `prove_all` check itself at run time.** Ten lines at the top of `layer2()` doing the
   regex above over its own source and refusing to report PASS on a mismatch or an unaggregated
   `ok<N>`. The suite that exists to catch guards that cannot fire should not contain one.
2. **Stop hand-numbering.** A list of `(label, command, expected_string)` tuples driven by a loop
   removes the variable pair entirely, and two PRs appending two entries to a list conflict the way
   OPS_LOG entries did — which is why `raw-port/army/ops/` now exists.
3. Failing both, a `test_guards` case asserting the two properties, so the collision fails a suite
   instead of a reviewer's attention.

## Evidence

```
# round 2, after renaming r11 -> r12 by hand (the shipped-looking, wrong version):
158:    r12 = run(["bash", os.path.join(TOOLS, "test_stale_file_check.sh")])
159:    ok12 = "TEST_STALE_FILE_CHECK: PASS" in r11.stdout      <- reads the OTHER suite
160:    print("LAYER 2l (stale-file guard ...)",

# the check, after fixing it:
mismatched ok<N> reading r<M>: none
aggregate: return ok and ok2 and ok3 and ok4 and ok5 and ok6 and ok7 and ok8 and ok9 and ok10
           and ok11 and ok12

# and the suites really do all run in the merged tree:
test_pr_base_is_main: PASS
test_review_claim_g5: PASS
TEST_STALE_FILE_CHECK: PASS (11 cases, 4 mutants killed)
PROVE_ALL: PASS   (LAYER 2j, 2k and 2l each printed and PASS)
```

---

## Second finding, same shift: an ALIASING probe that damaged the thing it was measuring

Not the same bug, but the same family as the `| 0` wire coercion reported earlier today, and worth
recording because the repair is a rule about ORDER rather than about the check.

Ports that return a struct by value need an aliasing check — the machine copies into the caller's
sret slot, so a TypeScript port that returns the source OBJECT agrees on every value and still
hands the caller a live reference into the model. My driver probed for it by mutating the returned
object and re-reading the source, then "restoring" with a second XOR:

    got.value ^= K;                      // probe
    aliased = slot.value !== before;
    if (aliased) slot.value = before;    // restore the slot
    got.value ^= K;                      // "restore" the return  <-- for an ALIASING port this is
                                         //     the SAME object, so the perturbation lands twice

For the aliasing mutant, `got` and `slot` are one object: the restore ran, then the second XOR
re-corrupted it. The mutant then died on VALUES as well, which reads as "the corpus caught it" and
quietly destroys the distinction the aliasing column exists to draw — the mutant is supposed to be
value-identical and caught by nothing else. Measured on
`FFCachesForRepeatedRetimingCalculations::mediaEndTime` (PR #694): `M4_return_slot` killed 7 of 7
rows before the fix, 0 of 0 after, with the aliasing column reading `True` in both.

**RULE: capture every observable BEFORE the probe, and restore exactly once.** Phrased generally,
next to "an instrument that normalises its subject's output with the operation under test measures
nothing there": *an instrument that MUTATES its subject must be ordered so the mutation cannot be
mistaken for the subject's behaviour.* The corrected shape, now in that driver:

    const ret  = wire(got);                 // both observables, first
    const slot = wire(self.slot);
    got.value ^= K;                         // then probe
    const aliased = self.slot.value !== before;
    if (aliased) self.slot.value = before;  // and restore exactly once
