# swarm_doctor's CHECKS list is the new OPS_LOG tail: eight open PRs append to one line, and a same-name check merges CLEAN into a double definition

- **reported** 2026-08-11T21:01:00Z by reviewer-1
- **status** OPEN — the conflict class #638 removed for `OPS_LOG.md` has reappeared one file over,
  with a second failure mode that is worse because git reports success.

## Symptom

Two things, measured within ten minutes of each other while reviewing #649, #683 and #690.

**(1) One line, eight authors.** Every swarm-level fix now ends with "and add the check to
`swarm_doctor`", and every one of them appends a name to the FIRST LINE of `CHECKS = [...]`, plus a
layer to `prove_all.py`. Right now:

    open PRs touching raw-port/army/tools/swarm_doctor.py:  693 690 683 679 678 656 651 649

and since the `ops/` convention landed 24 commits ago, `swarm_doctor.py` and `prove_all.py` are
already tied for second-hottest shared file (2 merges each) behind `OPS_LOG.md` (4). #649 — content
reviewer-approved at `25488b93`, merged with main once already — conflicts again, and the whole
conflict is those two registries:

    git merge-tree --write-tree origin/main ecd2d5b3  -> exit 1
      CONFLICT (content): raw-port/army/tools/swarm_doctor.py
      CONFLICT (content): raw-port/army/verifier/prove_all.py

    <<<<<<< origin/main
    CHECKS = [check_pr_base, check_queue_coverage, check_guards_wired, check_tree_current, …
    =======
    CHECKS = [check_queue_coverage, check_guards_wired, check_lease_ownership, check_tree_current,
    >>>>>>> the PR

Two authors, two different functions, no disagreement — the same "two adjacent appends" that made
every ops PR conflict with every other one.

**(2) The dangerous one: two PRs adding a check with the SAME NAME merge cleanly into a file with
two definitions.** #670 landed `def check_pr_base()`; #683 (open, forked earlier) adds its own
`def check_pr_base()` in a different region. Git sees additions in two places and merges without a
murmur:

    git merge-tree --write-tree origin/main <#683 head>   -> exit 0, no CONFLICT line
    in the resulting tree:
      grep -c '^def check_pr_base'  -> 2      (lines 104 and 705)
      CHECKS = ['check_pr_base', …, 'check_pr_base', 'check_ops_contention']
      loaded: both CHECKS entries are the same object -> True
              the surviving definition is #683's; #670's LANDED check is dead code
              and the report prints two `pr-base` rows

So the harmless-looking case (same name) is the silent one, and the noisy case (different names, one
line) is the safe one. That is backwards from how a reviewer's attention is allocated.

## Root cause

A single-line, ordered registry is a merge bottleneck for the same reason an append-only log tail is:
every contributor edits the same line, and the merge has no way to know the two edits are
independent. `CHECKS` and `prove_all`'s layer list are now that line, and there are eight PRs queued
against them.

The double-definition half is worse than the OPS_LOG version because **every guard in this repo is
aimed at deletions** (worker 2's #627 entry says this exactly): a duplicate is an ADDITION, so the
three-dot file list is unchanged, `git diff origin/main | grep '^-[^-]'` is empty, `python3 -c
'import'` is happy, and the doctor's own suite passes because the surviving copy is a good one.
Python's last-definition-wins then silently retires the landed check.

## Fix / workaround

1. **Stop editing one line.** Register by DECORATOR — `@check` appending to a module-level list at
   definition site — or discover checks by name (`[v for k, v in globals().items() if
   k.startswith("check_") and callable(v)]`, sorted). Either makes two new checks two additions in
   two different regions, which merges cleanly and needs no coordination. `prove_all`'s layer list
   wants the same treatment.
2. **Refuse a duplicate at import**, three lines, and it turns the silent case into a loud one:

       _names = [c.__name__ for c in CHECKS]
       assert len(_names) == len(set(_names)), f"duplicate check registered: {_names}"

   and, if discovery is by name, the duplicate `def` itself can be caught with a
   `grep -c '^def check_'` vs `sort -u` assertion in the guard suite.
3. **For reviewers, until then — and this is the cheap part, adopt it now:** before approving any PR
   that touches a file main has also changed, run

       git merge-tree --write-tree origin/main <head>

   and, if it produces a tree, grep that tree's version of the file for duplicate definitions. An
   exit of 0 means "git found no textual conflict", NOT "the merged file is coherent". This is the
   check that caught #683; #649 and #690 pass it.

## Evidence

```
$ git log <ops-README-add>..origin/main --name-only --pretty=format: -- raw-port/army raw-port/tools \
    | sort | uniq -c | sort -rn | head -4
   4 raw-port/army/OPS_LOG.md
   2 raw-port/army/verifier/prove_all.py
   2 raw-port/army/tools/swarm_doctor.py
   2 raw-port/army/tools/pr_land.sh
(24 commits since the ops/ convention landed)

$ for p in $(gh pr list --limit 50 --json number --jq '.[].number'); do … done
open PRs touching swarm_doctor.py: 693 690 683 679 678 656 651 649

# the clean-merge-into-a-double-definition, on #683:
$ git merge-tree --write-tree origin/main 6b56ece1 ; echo "exit=$?"
20d8a046b67e59964a4044573c1b1e557d7a5e40
exit=0
$ git show 20d8a046:raw-port/army/tools/swarm_doctor.py | grep -c '^def check_pr_base'
2
$ python3 -c "…import the merged file…; print([c.__name__ for c in m.CHECKS])"
['check_pr_base', 'check_queue_coverage', …, 'check_rebase_actionable', 'check_pr_base', 'check_ops_contention']
both entries are the same object: True
the surviving definition is #683's -> #670's landed check never runs
```
