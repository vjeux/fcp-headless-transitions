# a reviewer's worktree is reset mid-differential, and the theft fails toward VERIFIED

- **reported** 2026-08-11T21:30:00Z by reviewer-9
- **status** OPEN — an addendum to worker 2's "a HELD warm-pool lease was taken from under a live
  unit" entry: same theft, on the REVIEWER side, where the consequence is a signature rather than a
  lost file. Workaround here is two lines and costs nothing.

## Symptom

While reviewing PR #694 I leased a worktree at the PR head (`wt_pool.sh acquire-at 9d8e871643aa`,
slot 8, 14:03:27), re-derived the disassembly there, and ran the port's live-binary differential in
it. The differential printed **VERIFIED**. Nine minutes later, in the same worktree, the file I had
just verified did not exist:

    $ bash raw-port/army/gate/gate.sh "$WT/raw-port/src/channels/FFCachesForRepeatedRetimingCalculations.ts"
      MISSING FILE: /Users/vjeux/.fct-pool/wt/8/raw-port/src/channels/FFCachesForRepeatedRetimingCalculations.ts
    GATE: REJECT

The slot had been reset to `origin/main` and handed to a WORKER, who was already writing an
unrelated unit into it. My lease was 30 seconds old when the first reset landed.

## Root cause

Not new: `wt_pool.sh acquire` does not refuse a slot whose lease is present and fresh, which worker
2 reported this morning for a worker's in-progress transcription. What is new is **where it lands
for a reviewer, and which way it fails.**

A worker loses a file and finds out at `git commit` — loud, and expensive but honest. A reviewer
loses the SUBJECT of a measurement that is still running, and the differential does not
necessarily notice:

* if the port is a NEW file (this case), the reset deletes it and the driver dies loudly;
* if the port EXTENDS a landed class file — the commonest shape in this repo — the reset leaves
  `origin/main`'s copy of that same path in place. The driver then imports a file that exists,
  compiles, and matches the live binary for every method main already carries. **The reviewer reads
  VERIFIED for the PR's head while the harness measured main's content**, i.e. it fails silently
  toward the verdict that lets the PR merge, which is the direction this project treats as
  unacceptable everywhere else (the arm64-slice trap, the borrowed-disasm G5 verdicts, the fabricated
  regression symbol).

Nothing downstream can catch it: the gate re-runs on the PR head in a DIFFERENT worktree and is
green either way, and the approval body reads exactly as it would if the measurement had been real.

## Fix / workaround

**Pin the content by hash around the measurement.** The blob hash of the file under test, taken
immediately before and immediately after the oracle run, must equal the PR's blob — then a theft
during the run is a mismatch instead of a signature:

    EXPECT=$(git rev-parse <prBranch>:raw-port/src/<layer>/<Class>.ts)
    BEFORE=$(git -C "$WT" hash-object "$WT/raw-port/src/<layer>/<Class>.ts")
    ... run the differential ...
    AFTER=$(git -C "$WT" hash-object "$WT/raw-port/src/<layer>/<Class>.ts")

On the re-run of #694 all three were `6dfc357b3bbe7127f0b49907ecbb1fe415fbe063`, so that VERIFIED is
about this PR's bytes. This is the reviewer-side twin of `--expect-head` on `pr_review.sh` (#35):
you leased a SHA, so assert the SHA you leased is still what you are measuring.

Two tool fixes, in order of value, both already implied by worker 2's entry:

1. `wt_pool.sh acquire`/`acquire-at` should refuse a slot holding a FRESH lease and say so on
   stderr, rather than overriding it invisibly. Today the victim learns nothing.
2. An oracle harness that imports a port from a pool worktree should record the blob hash it loaded
   in its own output, next to the slide and the prologue bytes it already prints. Then the evidence
   of record names the bytes that were measured, and a stale or stolen tree cannot be quoted as a
   verdict.

A doctor check is possible and cheap — FAIL when a slot's lease tag names a head that is not what
the worktree's HEAD resolves to — but it only catches the theft after the fact, so the hash pin is
what a reviewer should actually adopt.

## Evidence

Slot 8's own reflog, read after the gate said the file was missing (my lease was the `9d8e87164`
checkout at HEAD@{5}):

    9d8e87164 HEAD@{5}: checkout: moving from 748c202a0 to 9d8e871643aa   <- my acquire-at, 14:03:27
    0a3a307f0 HEAD@{4}: reset: moving to origin/main                      <- taken from under me
    53472f1ed HEAD@{2}: checkout: moving from 89de068a3 to 53472f1ed      <- another gate lease
    89de068a3 HEAD@{1}: reset: moving to origin/main
    89de068a3 HEAD@{0}: checkout: moving to port/GetHgcMaskCompAddVisibleProgram

    $ git -C ~/.fct-pool/wt/8 status --porcelain
    ?? raw-port/src/render/GetHgcMaskCompAddVisibleProgram.ts             <- a peer's live work

I did NOT release that slot: `wt_pool.sh release <path> gate/9d8e871643aa` correctly refused
("has UNCOMMITTED or UNPUSHED work"), which is the guard from OPS_LOG #3 doing its job in the one
direction that still works. Leave a stolen slot alone — releasing it destroys the thief's work, and
they are not the one who did anything wrong.
