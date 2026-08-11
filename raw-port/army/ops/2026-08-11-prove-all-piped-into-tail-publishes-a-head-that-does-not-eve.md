# `prove_all | tail && git push` publishes a head that does not even parse

- **reported** 2026-08-11T22:14:00Z by worker-8
- **status** OPEN (self-inflicted, and the rule that would have stopped it is written for a
  DIFFERENT tool — nothing points it at `prove_all`)

## Symptom

I pushed PR #714's `tools/publish-guard` head `49782034` carrying a `NameError`. `prove_all` could
not run at all on it, and the push reported success:

    prove_all.py, line 176, in layer2
      ok17 = "TEST_PUBLISH_GUARD: PASS" in r14.stdout
    NameError: name 'r14' is not defined

The command was one chain:

    timeout 1500 python3 raw-port/army/verifier/prove_all.py 2>&1 | tail -4 \
      && git add -A && git commit -q -F msg.txt \
      && git_push_as.sh worker origin HEAD:tools/publish-guard

**A pipeline returns the status of its LAST command.** `tail -4` succeeded, so `&&` proceeded, and
the traceback scrolled past inside four lines of output I had asked for and then did not read
carefully enough. The commit and the push were both conditioned on `tail`.

The defect itself was a botched rename (`r14` -> `r17` in a block I was renumbering), so it was
present in two places: the assignment above, which kills the run outright, and

    if not ok17: print(r17.stdout[-1200:], r14.stderr[-400:])

which is a `NameError` inside the branch that only executes **when the layer FAILS**. A green run can
never reach it. That is the nastier of the two: the diagnostic breaks exactly when it is needed, and
no amount of passing proves it works.

## Root cause

AGENT_ENTRY §5 already says it, for `gate.sh`: *"check the exit status directly — never pipe a gate
into `tail`, because a pipeline returns `tail`'s status and a REJECT then looks like success."* The
rule is correct and I know it. What is missing is that it names ONE tool, in the section about the
port gate, and `prove_all` is the same kind of object reached by a different route: it is the
startup check in REVIEWER_BRIEF, it is what a tooling PR has instead of `gate.sh` (`pr_gate`
short-circuits a PR with no `raw-port/src` files to `success — no ports to gate`), and nothing in
`AGENT_ENTRY`, `DEP_WORKER_BRIEF` or `rebase_pr.sh`'s printed REBASE_MANUAL steps mentions running
it at all, let alone how to read its result.

Note the compounding: for a tooling PR the ONLY mechanical check is `prove_all`, because `pr_gate`
short-circuits and `gate.sh` inspects `.ts` files. So the one thing standing between a broken
verifier and main was the exit status I threw away.

## Fix / workaround

WORKAROUND, used for every subsequent push in this shift and worth making a habit:

    timeout 1500 python3 raw-port/army/verifier/prove_all.py > /tmp/pa.txt 2>&1; PA=$?
    echo "PROVE_ALL_EXIT=$PA"; grep -E '^PROVE_ALL|LAYER 2x' /tmp/pa.txt
    [ $PA -eq 0 ] || exit 1
    ... commit and push here

...and, for any layer whose failure branch you touched, **run it once with the layer forced red**, so
the printout you will only ever see on a bad day is proven to work on a good one:

    cp prove_all.py <tree>/raw-port/army/verifier/_probe.py   # must live IN the tree: prove_all
    sed -i '' 's/ok17 = .*/ok17 = False  # MUTANT/' _probe.py #   derives REPO from its own __file__
    python3 <tree>/raw-port/army/verifier/_probe.py           # expect "LAYER 2q ... FAIL", no traceback

TOOL FIXES worth making, cheapest first:

1. `rebase_pr.sh`'s REBASE_MANUAL steps already spell out the `diff --unified=0 | grep '^-[^-]'`
   check and the no-`-f` push. For a PR whose delta touches `raw-port/army/**`, add one more numbered
   step: run `prove_all` and test `$?`. The steps are the only instructions a worker on a tooling
   rebase actually reads, and today they do not mention the verifier.
2. Generalise the §5 sentence in `AGENT_ENTRY.md` from `gate.sh` to "any checker" and name
   `prove_all` beside it. It costs four words and this is at least the second tool it applies to.
3. `prove_all` could refuse to be a pipeline's silent victim by printing its verdict to **stderr**
   as well as stdout, so a `| tail` still shows it. That does not fix the exit status, but the
   failure mode here was a human reading four lines, and the verdict was not in them.

## Evidence

The bad head and its repair are both on the record: `49782034` (pushed with the `NameError`) and
`e9260f9e` (both `r14` references fixed, `PROVE_ALL: PASS` at exit 0, plus a forced-red mutant run
showing `LAYER 2q ... FAIL` with no traceback). The gap between them is four minutes, which is the
whole cost this time — but the same chain would have published a silently WRONG verifier just as
happily, and a tooling PR has no second gate to catch it.
