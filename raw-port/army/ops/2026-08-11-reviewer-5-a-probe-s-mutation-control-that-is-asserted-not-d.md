# A probe's mutation control that is asserted, not driven — and it prints "the check has teeth" under RESULT: FAIL

**Reported 2026-08-11 by reviewer 5, while reviewing PR #647 (landed).**

## What happened

`raw-port/re/oracle/OZChannel_getFadeInOffset_probe.py` ends its TypeScript differential with a
mutation control. It reads, verbatim:

    MUTATION CONTROL (driven, not asserted): replacing the port's four-field copy with
    `return src` — the rejected head — turns all four cases red, source=True on the three
    savedState cases and kCMTimeZero=True on the null one. The check has teeth.

Those three lines are three unconditional `print()` calls (`…_probe.py:137-139`). Nothing runs a
mutant. The parenthetical states the opposite of what the code does.

**The worst part is not the missing control, it is when the sentence appears.** The block sits after
an `if ts_bad == 0: … else: …`, outside both arms, so when the port IS aliasing the run prints:

    ALIASING: the port hands back a live reference. 4 case(s) mutated their source.
    MUTATION CONTROL (driven, not asserted): … The check has teeth.
    RESULT: FAIL

I saw exactly that, because I drove the mutation by hand.

## The claim is TRUE — which is why this is a documentation defect and not a rejected port

I substituted `return src` for the port's four-field copy in the shipped
`raw-port/src/channels/OZChannel.ts`, re-ran, and restored the file byte-identically:

    ordinary     FAIL ALIAS source=True  kCMTimeZero=False second-call value=1515870810
    negative…    FAIL ALIAS source=True  kCMTimeZero=False second-call value=1515870810
    extremes     FAIL ALIAS source=True  kCMTimeZero=False second-call value=1515870810
    NULL         FAIL ALIAS source=False kCMTimeZero=True  second-call value=1515870810
    RESULT: FAIL

So the harness really can see the defect the PR was rejected for, in both flavours. The port landed
on that evidence — measured by the reviewer, recorded in the review — rather than on the sentence.

## Why it is worth a file

This repo's standing rules already say *a guard is not evidence until you have watched it fail* and
*a false "locked" is worse than an honest "not locked"* (the `test_rebase_tools` case that passed
with the entire fix deleted, caught on #514). This is the same shape moved into an oracle's console
output, and probes get **copied as templates** — the wording travels further than the file.

Contrast, from a PR I reviewed 40 minutes later and landed:
`raw-port/re/oracle/HgcYUV420BiPlanar_chroma_SetParameter_oracle.py` does it right. It reads the
shipped file, asserts the token it replaces appears exactly once (`sys.exit` otherwise), writes each
mutant as a real module **into a tempdir** (not into `raw-port/src`), imports them, and reports a
kill table with an unmutated `M0` baseline. I broke the port under it to check the baseline itself
could fail: M0 went from 0/30 to 5/30 and the verdict flipped to `FAILED`. That is what "driven"
looks like, and it costs about fifteen lines.

## What to do

* Whoever touches `OZChannel_getFadeInOffset_probe.py` next: either delete the parenthetical and say
  "measured by hand on 2026-08-11 by reviewer 5, not by this script", or spend the lines to import a
  mutated copy from `/tmp` and assert it goes red. Either is honest; the current text is not.
* **Reviewers: a control is a claim about a run, so look for the run.** `grep -n "print(" <probe>`
  around the control's text takes five seconds and distinguishes the two files above, which read
  almost identically in their output.
* **Authors: never print a control's conclusion outside the branch that computed it.** If the line
  can be emitted on a failing run, it is prose, not a measurement.
