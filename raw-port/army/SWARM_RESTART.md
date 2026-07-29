# SWARM RESTART — reviewer-gated, small, closely-watched (2026-07-29)

The swarm was HALTED after the 7385eb01 cheat. It restarts ONLY now that the verifier demonstrably
blocks cheating (verifier/STEP4_PROOF.md + STEP5_REVIEWER_PILOT.md, prove_all.py PASS). Restart is
deliberately SMALL and reviewer-gated — not the old 20-wide mass-spawn.

## Preconditions (ALL must hold before enabling any spawn)
1. `python3 raw-port/army/verifier/prove_all.py` -> PROVE_ALL: PASS.
2. `python3 raw-port/army/verifier/test_classify.py` -> PASS (9 fixtures).
3. gate.sh includes G5; wt_merge.sh runs gate.sh (G5 blocks class-C at merge).
4. leafq refuses DISPATCH_ONLY (never dispenses a vtable shell as a leaf).
5. mark_ported downgrades DISPATCH_ONLY real-cited bodies to `skeleton` (never counts them ported).

## The reviewer-gated worker loop (what changes vs the old flow)
OLD: worker claims -> ports -> gate.sh -> wt_merge (self-merge). Cheats slipped through because the
gate only checked compile+cite.
NEW: worker claims -> ports -> gate.sh (now G5-armed) -> **DOES NOT self-merge**. A separate
ADVERSARIAL REVIEWER sub-agent (REVIEWER_BRIEF.md) is spawned per completed branch; it re-derives the
disasm from the binary, runs classify -> oracle(Tier-1)/reach(Tier-3) -> line-by-line, and writes a
blocking `<file>.review.json`. Only a verdict in {VERIFIED, LIKELY_REAL(+sign), TRAP, EMPTY} lets
wt_merge proceed. REJECT/SKELETON stops the merge (SKELETON may land as `skeleton`, never `ported`).

## Restart size + guards (start tiny, widen only on clean evidence)
- Phase A (proof): 1 worker + 1 reviewer, closely watched by a human/coordinator. Confirm the loop
  produces a REAL merged port and the reviewer would have blocked a cheat. (Done: pilots passed.)
- Phase B (small): at most 3 concurrent workers, each gated by a reviewer before merge. Watch load,
  merge rate, and reviewer REJECT rate. Hold if REJECT rate > 0 without being caught.
- Phase C (scale): only after Phase B shows the reviewer catches every injected cheat, widen toward
  the old target — but keep the reviewer gate mandatory. Load guard load1<25 (under-fill >12),
  freeGB>6, spawn <=6/tick, count live by subSessionStatus=='running'.

## Enabling the coordinator cron (d82b4a68) — DO NOT until Phase B is signed off
The cron message must be updated to: (a) spawn a reviewer per completed worker branch and block
merge on its verdict; (b) start at Phase-B size (3), not 20; (c) treat `skeleton` as not-ported in
its progress accounting. Until then it stays enabled=false. Re-enable is an EXPLICIT human decision,
not an autonomous one — restarting a fleet that writes to the shared repo is a blast-radius action.

## If a cheat is ever merged again
The reviewer's `<file>.review.json` + the commit are the audit trail. Re-run mark_ported to reclassify
(DISPATCH_ONLY -> skeleton), and add the offending shape as a locked fixture in test_classify.py so it
can never regress.
