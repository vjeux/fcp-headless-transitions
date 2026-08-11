# A legitimate refactor silently retired a doctor check, and its UNKNOWN was permanent

- **reported** 2026-08-11 by reviewer 2
- **status** FIXED IN THIS CHANGE (`prove_all_layer_labels` + `test_doctor_layer_labels.py` +
  `prove_all` LAYER 2v)

## Symptom

`swarm_doctor.py`, run against a completely healthy main:

    ??   layer-letters   found no LAYER labels in prove_all.py on origin/main — the label format
                         changed, or this check's pattern is stale; it is not evidence of anything

    swarm_doctor: 1 FAIL, 1 UNKNOWN, 14 OK

`check_layer_letters` exists to catch two `prove_all` suites claiming one label. It found its labels
with

    re.findall(r'print\(\s*"LAYER (\d+[a-z])\b', src)

which was correct for the thirteen hand-numbered blocks it was written against, and matches **zero**
of the fifteen labels in main's `LAYER2 = [(label, desc, cmd, token), …]` table — the data-driven
refactor that three ops entries in this directory had asked for. Nothing was broken by the refactor
except the thing watching it.

## Why this is worse than a FAIL

The message is honest, the UNKNOWN is the right verdict for "could not run", and AGENT_ENTRY §7b
says so in as many words: *"`UNKNOWN` means a check could not run — never that it passed."* All true,
and all beside the point: **no state of a healthy repo could clear it.** A FAIL gets fixed because
someone wants the board green. A permanent UNKNOWN becomes furniture — one line of a sixteen-line
report that has always looked like that — and the property it names goes unwatched. The check was
still listed in `CHECKS`, still ran, still cost a `git show`, and answered nothing.

That is the same family as this repo's most-filed defect (a guard that cannot fail), reached from an
unusual direction: **not a bug, not a bad merge, but a good refactor of the subject.** Any check that
identifies its subject by matching source text can be retired this way, by someone improving that
source, with no signal at either end. The refactor's author had no reason to look in
`swarm_doctor.py`; the check's author could not have known the file would be rewritten.

Note what did NOT save us. `prove_all` grew its own `check_layer_labels()` in the same refactor and
that one is correct — so the property was still enforced *inside the suite*. But the suite takes
minutes and runs at a reviewer's startup, while the doctor is the thing the board reads, and the two
had silently swapped roles without anyone deciding that.

## Fix, in this change

* `prove_all_layer_labels(src)` — a module-level extractor that reads the CURRENT table shape first
  (sliced to the `LAYER2` literal, so a look-alike tuple elsewhere is not counted), falls back to
  the legacy `print("LAYER 2x"` shape, and returns `[]` only when it recognises neither. The empty
  case is still the caller's UNKNOWN: "selects nothing" must never read as "all distinct".
* `test_doctor_layer_labels.py`, wired as `prove_all` LAYER **2v** in the same change, because a
  guard nothing runs is indistinguishable from no guard. Six cases: main's table is read; main is
  CLEAN by it (a check whose red no correct state can clear is the other half of this bug); a
  planted duplicate row IS detected; the legacy shape still reads, so a revert cannot blind it; an
  unrecognisable shape returns nothing; and a look-alike tuple outside the table is not a layer.
  Two mutants — deleting the table branch (which is literally the blind check that shipped) and
  deleting the legacy branch — are both killed, and an M0 control must SURVIVE the same pipeline.

## The general rule, worth more than the fix

**When a check matches its subject by source text, the suite for that check must feed it every shape
the subject has ever had, including one it has never had.** Case 4 (legacy) and case 5
(unrecognisable) are the two that make case 1 mean something: without them, the extractor could be
rewritten to match only today's file and would go blind again on the next refactor, exactly as
quietly.

And when reading a doctor report: **an UNKNOWN that has been there a while is a finding, not a
detail.** This one was.

## Evidence

    # the same repo, the same moment, two versions of the check
    $ git show origin/main:raw-port/army/tools/swarm_doctor.py > /tmp/doctor_main.py
    $ python3 /tmp/doctor_main.py            | grep layer-letters
    ??   layer-letters   found no LAYER labels in prove_all.py on origin/main — …
    $ python3 raw-port/army/tools/swarm_doctor.py | grep layer-letters
    ok   layer-letters   15 layer label(s), all distinct

    $ python3 raw-port/army/tools/test_doctor_layer_labels.py
      ok   — 1  main's LAYER2 table is read (15 labels: 2 2b 2c 2d 2e 2f…)
      ok   — 2  main's labels are all distinct, so the check reports OK rather than a stuck FAIL
      ok   — 3  a duplicated row label is detected (2 x2)
      ok   — 4  the legacy print("LAYER 2x") shape still reads
      ok   — 5  an unrecognisable shape returns nothing (the caller's UNKNOWN, never a false OK)
      ok   — 6  a look-alike tuple outside the LAYER2 table is not counted as a layer
    BASELINE (M0): 6 passed, 0 failed
      control M0 survived, as it must (the mutation pipeline perturbs nothing)
      mutant no_table_branch killed (would break reading the LAYER2 table — this IS the blind check that shipped)
      mutant no_legacy_branch killed (would break reading the legacy print() shape)
    test_doctor_layer_labels: PASS (6 cases, 2 mutants killed + the M0 control)
