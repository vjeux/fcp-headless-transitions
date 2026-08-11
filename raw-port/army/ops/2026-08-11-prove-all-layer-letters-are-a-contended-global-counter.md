# prove_all layer letters are a contended global counter

- **reported** 2026-08-11T21:33:00Z by worker-8
- **status** OPEN (workaround costs a rebase each time; a structural fix is proposed and not done)

## Symptom

**One line of `verifier/prove_all.py` was the merge conflict FOUR times in one afternoon, across
three different PRs, and each resolution was pure clerical renumbering with no disagreement in it.**

```
#600  branch's 2j (stale-file guard)      -> main took 2i (queue coverage)      -> renumbered 2j/r10
#650  branch's 2i -> 2j (G5 queue)        -> main took 2i, then 2j (PR base)    -> renumbered 2k/r11
#656  branch's 2i..2l (four suites)       -> main took 2i and 2j                -> renumbered 2k..2n
#705  branch's 2j (cross-queue lease)     -> main took 2j, then 2k              -> renumbered twice,
                                                                                   2j -> 2k -> 2l
```

Every one is the same edit: keep main's layer, shift the branch's letter, shift its `r<N>`/`ok<N>`
bindings, extend `return ok and ... and okN`. Nobody disagreed about anything, and the suites
themselves never conflicted — only the labels and the conjunction did.

## Root cause

A layer's identity is a hand-allocated LETTER plus a hand-allocated variable index, both written
into one shared function and one shared `return` expression. So the letter is a global counter that
every open PR increments optimistically, and the conjunction is a single line every PR must touch.
N open PRs adding suites conflict pairwise, by construction — and the letters are in fact allocated
by MERGE ORDER, which no author can know in advance.

This is exactly the shape `OPS_LOG.md` had before `ops/` (#638) turned it into a directory: a shared
append point with no per-item identity. Measured there: 28% of merges touched one file.

There is a second, worse-than-clerical hazard in it. The resolution is mechanical enough to do
carelessly, and a careless one drops a suite silently — take one side wholesale and a whole layer
vanishes while `prove_all` still prints `PASS`, because the conjunction shrinks with it. On #656 I
was resolving four layers against two of main's at once; the only thing that made that safe was
running the suite and counting the printed layers afterwards.

## Fix / workaround

WORKAROUND, which is what I did four times: keep main's layer, renumber yours, extend the return,
and then RUN `prove_all` and count the `LAYER` lines — a resolution that drops a suite still passes.

FIX worth making (not done here; it touches the same contended file and wants a reviewer's eye):
**give a layer a NAME instead of a letter, and build the list from data rather than from code.** A
table of `(label, runner)` tuples appended to — or, better, a directory scan of `verifier/test_*.py`
and `tools/test_*.sh` with each suite declaring its own label — turns "add a layer" into "add a
file", which is what `ops/` did for reports. The letters exist for humans reading a log; a name
serves that better than a position, and `all(results)` replaces the conjunction that has to be
edited by every PR.

## Evidence

```
$ git log --oneline --since="4 hours ago" -- raw-port/army/verifier/prove_all.py | wc -l
   (every one of these is a layer addition; four of them required a hand merge today)

#705, twice in twenty minutes:
  21:12  main had 2i, 2j        -> my 2j  became 2k
  21:24  main had 2i, 2j, 2k    -> my 2k  became 2l
each time: no semantic conflict, one line of clerical work, one full prove_all run to confirm
nothing was dropped (2m07s a piece).
```
