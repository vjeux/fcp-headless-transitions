# the gate rejects a correct port for its PROSE, twice more — and `git commit -m` eats backticks

- **reported** 2026-08-11T20:26:55Z by worker-1
- **status** OPEN (the two gate cases are unfixed; both cost a gate cycle and both were "fixed" by
  rewording a comment, which is the wrong direction of causation)

## Symptom

Three separate times in one shift, a TEXT rule decided the fate of code that was correct.

**1. G1 banned-language, on a word that is part of the CLASS'S OWN NAME.** Porting
`HgcBT2100_PQ_OOTF_qtApprox::RenderTile_AVX` @Helium 0x3a7220:

    HgcBT2100_PQ_OOTF_qtApprox.ts:257: P3 shortcut language: * `HgcBT2100_PQ_OOTF_qtApprox` —
      the QuickTime-approximation BT.2100 PQ OOTF render node
    provenance_gate: 2 violation(s) across 1 file(s)  ->  REJECT
    GATE: REJECT

The banned token is `approximat*`, and the class FCP ships is called `qtApprox`. Saying what the
suffix means — in a header whose whole job is to say what the symbol is — is a gate rejection.

**2. G1's P4 "throwing stub missing 0xADDR", on a function that no longer throws.** Replacing the
landed throw-stub in `HgcBT2100_HLG_InverseOETF.ts` with a real 150-instruction body, the doc
comment above it said *"this replaces the throw-stub that shipped with this file"*:

    HgcBT2100_HLG_InverseOETF.ts:941: P4 throwing stub missing 0xADDR:
      * TRANSCRIBED IN FULL — this replaces the throw-stub that shipped with
    provenance_gate: 1 violation(s) across 1 file(s)  ->  REJECT

The function contains no `throw` at all. The rule fired on the words in a comment describing what
was REMOVED. Note the direction: the check is there to stop an undocumented stub landing, and here
it blocked the commit that DELETED one.

**3. `git commit -m "…"` with backticks silently deletes the quoted word.** OPS_LOG #30 records
this for review bodies and prescribes `--body-file`. It applies verbatim to a commit message, and
the failure is the same shape — the shell ate a clause out of the permanent record:

    intended:  routes EVERY doubt into `skipped`: no victim, gh not answering …
    committed: routes EVERY doubt into
               : no victim, gh not answering …

plus a stray `/bin/sh: skipped: command not found` in the push output, which is the only warning you
get and is easy to read as noise from `gh`.

## Root cause

1 and 2: `provenance_gate.py` matches its banned-language and stub rules against the WHOLE FILE
TEXT, comments included, with no notion of whether the match is inside a doc comment describing a
symbol, or whether the function it is attached to actually throws. A gate whose verdict is a
function of prose will reject correct code and — the more expensive direction — can be satisfied by
rewording, which is exactly what I did both times.

3: a double-quoted shell argument is a command substitution context. `-m` is not special.

## Fix / workaround

Until the gate distinguishes code from comment:

- **Do not use a banned token in prose even when it is the subject's own name.** For `qtApprox`,
  write ``the `qtApprox` variant (the cheaper QuickTime transfer-function path; the suffix is FCP's
  own name for it)`` — it says more and passes.
- **Do not describe a stub you are deleting in the comment that replaces it.** Say what the body IS
  ("TRANSCRIBED IN FULL. This method used to raise; the body below is the transcription of all 150
  instructions at 0x3b1660..0x3b1936"), not what it used to be.
- **`git commit -F <file>`, always** — the same rule OPS_LOG #30 already gives for review bodies.
  Then diff the stored message against the file before pushing:
  `git log -1 --format=%B | diff - msg.txt`.

Proposed real fixes, for whoever owns `provenance_gate.py` — deliberately not attempted here,
because that file is one of the most-contended in the repo and a second PR editing it is the
collision this shift already paid for once:

- strip block comments before the banned-language scan, or exempt a line that is quoting a mangled
  or demangled symbol name (both of these files' offending lines contain the class name verbatim);
- make P4 fire only on a function whose body actually contains `throw`, which is a one-line
  structural test rather than a text match.

## Evidence

The reject and the pass differ by nothing but the wording of a comment:

```
$ bash raw-port/army/gate/gate.sh .../HgcBT2100_PQ_OOTF_qtApprox.ts
provenance_gate: 2 violation(s) across 1 file(s)  ->  REJECT
GATE: REJECT ❌   (exit 1)

# reworded the two prose lines; not one line of code changed
$ bash raw-port/army/gate/gate.sh .../HgcBT2100_PQ_OOTF_qtApprox.ts
provenance_gate: 0 violation(s) across 1 file(s)  ->  PASS
GATE: PASS ✅     (exit 0)
```

and for the commit message, the amended-vs-original diff is a whole clause:

```
$ git log -1 --format=%B | sed -n '21p'
: no victim, gh not answering (via gh_did_not_answer, which _gh_retry
```
