# an unknown flag on `depclaim.py next` silently spends a unit from the append-only queue

- **reported** 2026-08-11 by worker 4
- **status** OPEN (hit live; it cost one unit, and the unit was recovered only because I noticed)

## Symptom

I wanted to re-read the warning banner `depclaim.py next` prints at claim time, without claiming.
I guessed at a probe flag:

    $ python3 raw-port/army/tools/depclaim.py next --dry-run
    CLAIMED_UNIT
    Flexo	FFOZNullCurve	__ZN13FFOZNullCurve10scaleCurveEd	FFOZNullCurve::scaleCurve(double)

It claimed. No warning, no non-zero exit, no mention of the flag it did not understand — and the
claim ledger is APPEND-ONLY, so at that moment the unit was mine forever whether or not I ever
ported it. I happened to be in a position to port it (PR #742), so nothing was lost. An agent who
ran the same probe while holding a different unit, or one shutting down, would have removed a
symbol from the queue permanently, which is OPS_LOG #18 — *"every honest refusal to fake a port
permanently deleted that symbol"* — arriving through a new door: not a refusal, a typo.

## Root cause

`depclaim.py`'s dispatcher is positional and permissive (`tools/depclaim.py:369`):

    a = sys.argv[1:] or ["claims"]
    if a[0] == "next": cmd_next(int(a[1]) if len(a) > 1 and a[1].isdigit() else 8,
                                allow_stl=("--stl" in a), retry_dropped=("--retry-dropped" in a))

Everything after the verb is either a digit (the limit), one of two recognised flags, or **silently
discarded**. `--dry-run`, `--help`, `-n`, a mistyped `--retry_dropped`, a shell-mangled argument —
all of them land in the same place: ignored, and the mutation proceeds. The two real flags are
membership tests over the whole argv, so there is not even a list of known options to compare
against.

This is the shape reviewer 2 already filed for `pr_review.sh` — *"an UNKNOWN FLAG eats the whole
review body"* — but the consequence here is worse in kind. There the flag corrupted a record that
could be re-posted; here it performs the one mutation in this swarm that is documented as
irreversible.

## Fix

* **Refuse an argument the verb does not know.** Not argparse necessarily — one line per verb is
  enough: after parsing, if any leftover token starts with `-` and is not in that verb's known set,
  print it and `exit(2)`. A queue command that cannot be probed safely must at least be
  *unrunnable* when misspelled.
* **Give `next` a real dry run**, since that is plainly what someone reaching for `--dry-run`
  wants: print the unit the selector WOULD hand out, plus the claim-time warnings, and write
  nothing. It costs nothing and it removes the reason to guess.
* `--help` should work on every verb, for the same reason: today `depclaim.py next --help` claims a
  unit.

## Check worth adding to `swarm_doctor.py`

The doctor already asserts that every guard is actually invoked. The generalisation this entry
suggests is cheap and mechanical: **for each mutating tool, assert that an unrecognised `--flag` is
rejected rather than ignored.** Run each tool's verb with a nonsense flag in a sandboxed
`FCT_STATE_DIR` and require a non-zero exit. That turns "someone will eventually guess a flag" from
a recurring cost into a one-time one, and it covers `pr_review.sh`'s already-filed instance of the
same failure at the same time.

## Evidence

    # the dispatcher, on current main (raw-port/army/tools/depclaim.py:369-371)
    a = sys.argv[1:] or ["claims"]
    if a[0] == "next": cmd_next(int(a[1]) if len(a) > 1 and a[1].isdigit() else 8,
                                allow_stl=("--stl" in a), retry_dropped=("--retry-dropped" in a))
    #   -> no known-flag set, no leftover check; anything unrecognised is dropped on the floor

    # measured
    $ python3 raw-port/army/tools/depclaim.py next --dry-run
    CLAIMED_UNIT                       # ...and the symbol is claimed, permanently
