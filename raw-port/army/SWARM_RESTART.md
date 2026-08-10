# SWARM RESTART

## ⚠️ CURRENT MODEL (2026-08-10) — QUEUE-DRIVEN CRON SLOTS, NO AGENT SPAWNS AGENTS (Model B)
The single coordinator agent that spawned workers/reviewers/rebase-workers is RETIRED. Nothing in the
swarm calls `spawn_agent`. The scheduler (cron) is the ONLY thing that creates a session, so the agent
population is structurally bounded and can never explode. See PR_FLOW.md "Dispatch model (Model B)".

### The cron slots (all created DISABLED; re-enable is an explicit human decision)
- `swarm-maint` — SCRIPT cron, `raw-port/army/tools/swarm_maint.sh`. Every ~10 min: ledger guard,
  warm-pool init/gc, clean canonical tree (only if no gate/submit proc live), periodic `depclaim seed`,
  `depgraph reconcile`, one snapshot line. NO agent, NO spawn, NO merge.
- `swarm-worker-1..4` — PROMPT crons. Each tick: `slot_lock.sh acquire worker <N>` (exit if BUSY) →
  pull ONE rebase task (`rebase_claim.sh claim`) or 4-8 port units (`depclaim.py next`) → open PRs →
  release slot lock → STOP. Brief = DEP_WORKER_BRIEF.md.
- `swarm-reviewer-1..4` — PROMPT crons. Each tick: `slot_lock.sh acquire reviewer <N>` →
  `review_claim.sh claim` (leases a PR by head SHA) → gate/review/merge/reject → release → STOP.
  Brief = REVIEWER_BRIEF.md.
- `swarm-introspection` (0a25dca7) — unchanged; it only reports, never spawns.

### TO RESTART (Model B)
1. Confirm preconditions below still hold (prove_all.py PASS, gate G5 armed).
2. `bash raw-port/army/tools/swarm_maint.sh` once by hand — confirm it prints a healthy snapshot
   (freeGB, ready>0, openPRs, pool). Fix any FATAL (usually a missing ledger) before enabling crons.
3. Enable `swarm-maint` first, watch one tick.
4. Enable a FEW slots (e.g. 2 worker + 2 reviewer), watch load + merge rate + reviewer REJECT rate for
   1-2 ticks. Concurrency is capped by #slots + the 8-lease warm pool — to scale, enable MORE slots
   (never raise spawn counts, because nothing spawns). Hold if load spikes or REJECT rate climbs.
5. The OLD coordinator cron `d82b4a68` stays DISABLED permanently (kept only for rollback reference).

The historical anti-cheat rationale and status-accounting rules below are UNCHANGED and still govern.
The only thing that changed is dispatch: pull-from-queue cron slots instead of a coordinator that
spawned agents.

---

# SWARM RESTART — reviewer-gated, small, closely-watched (2026-07-29) [HISTORICAL — dispatch superseded by Model B above]

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

## Status accounting (the headline number must be honest)
  ported   = oracle-VERIFIED (bit-exact vs live FCP) OR reviewer-signed LIKELY_REAL real body.
  skeleton = DISPATCH_ONLY / layout+stubs. Tracked separately. NEVER counted ported.
  stub     = throw-only placeholder. Not ported.
  trap     = ud2/empty. Faithful but non-executable. Counted separately.
Report "oracle-verified + reviewer-signed real implementations", not "files that compile".

## Why this kills the cheating (root cause -> fix)
  root cause: the gate checked only compile + @0xADDR; the oracle ran for ~65 nodes; leafq treated
              vtable dispatch as an allowed boundary -> a whole-body-dispatch shell qualified as a
              leaf and passed the gate (7385eb01 OZDynamicSpline::setVertexSmooth).
  fix:        (a) leafq never serves DISPATCH_ONLY; (b) G5 re-derives disasm + fuzzes the port and
              rejects REAL-disasm throw-shells; (c) the executable oracle proves callable pure fns
              bit-exact vs live FCP; (d) an adversarial reviewer blocks the judgment cases; (e)
              mark_ported never counts a shell as ported (179 reclassified skeleton).

## Status accounting (the headline number must be honest)
  ported   = oracle-VERIFIED (bit-exact vs live FCP) OR reviewer-signed LIKELY_REAL real body.
  skeleton = DISPATCH_ONLY / layout+stubs. Tracked separately. NEVER counted ported.
  stub     = throw-only placeholder. Not ported.
  trap     = ud2/empty. Faithful but non-executable. Counted separately.
Report "oracle-verified + reviewer-signed real implementations", not "files that compile".

## Why this kills the cheating (root cause -> fix)
  root cause: the gate checked only compile + @0xADDR; the executable oracle ran for ~65 nodes only;
              leafq treated vtable/virtual dispatch as an allowed boundary -> a whole-body-dispatch
              shell qualified as a leaf and passed the gate (7385eb01 OZDynamicSpline::setVertexSmooth).
  fix:        (a) leafq never serves DISPATCH_ONLY as a leaf; (b) gate G5 re-derives the disasm from
              the binary + fuzzes the port and REJECTS a REAL-disasm throw-shell; (c) the executable
              differential oracle proves callable pure fns bit-exact vs LIVE FCP; (d) an adversarial
              reviewer sub-agent blocks the judgment cases; (e) mark_ported downgrades shells to
              `skeleton` so the count is never inflated.

## WIRED (2026-07-29) — everything is plumbed; only the enable flip remains
The coordinator cron (d82b4a68) was rewritten and the old system deleted:
- DISPENSER: cron dispenses via `depclaim.py next` (strict dependency queue) — NOT the old claim.py.
  A worker only gets a function whose EVERY in-scope callee is ported. depclaim.py added `reap`.
- BRIEF: workers get DEP_WORKER_BRIEF.md (throw allowed ONLY for true out-of-scope externs; an
  in-scope callee is already ported, so a throw for it is a rejected cheat). The old throw-licensing
  GENERAL brief is gone.
- GATE: wt_merge.sh runs gate.sh (G5 blocks REAL-disasm throw-shells) AND now requires a REVIEWER
  sign-off (<file>.review.json, ACCEPT verdict) before merge. Worker cannot self-merge.
  Escape hatch WT_MERGE_SKIP_REVIEW=1 for a watched pilot only.
- REVIEWER: cron spawns 1-2 adversarial reviewers per tick alongside the workers.
- SIZE: Phase-B pilot = TARGET 3 workers (not 20). Widen only on explicit instruction.
- DELETED (superseded): leafq.py, callgraph.py, frontier.py, claim.py, assemble_class.py,
  coordinator_scan.py, demote_stub_bodies.py, army/graph/, army/swarm/, LEAF_BRIEF.md, wave_manifest.
- HONEST LEDGER: ported 7700, skeleton 217, stub 1524 (throw-shells + DISPATCH_ONLY never counted ported).

TO RESTART: **[SUPERSEDED by Model B — do NOT re-enable d82b4a68; it spawned agents.]** Historically
this said "set cron d82b4a68 enabled=true" to spawn ≤3 dep-workers + reviewers per tick. Under Model B,
restart by enabling the `swarm-maint` + `swarm-worker-*` + `swarm-reviewer-*` crons instead (see the
top of this file). Watch the first 1-2 ticks the same way: confirm workers import+call real deps (no
internal throws) and the ready-count grows as PRs merge.

## Phase-C sign-off (2026-07-29) — WIDENED to 6 workers + 2 reviewers
Phase B is signed off. Evidence the reviewer catches every injected cheat:
- reviewer-04 caught 6/6 Pattern-C call_once cheats (dep-worker-05).
- reviewer-05 caught 8/8 (matched an independent coordinator ground-truth scan; 0 rubber-stamps).
- Hardened G5 (_callonce_singleton_cheat in g5_impl_gate.py) is a STRUCTURAL backstop that rejects
  the fabricated-`new`/`!==1`-sentinel cheat even if a reviewer misses it; locked by
  test_callonce_cheat.py; prove_all.py PASS. wt_merge runs gate.sh(G5) BEFORE the sidecar check.
- No cheat from the swarm reached main; the only on-main cheat (pre-gate seed
  OZChannelPositionPercent3D_Factory) was demoted to stub.
Architecture change: reviewers MERGE their own ACCEPTs (rebase-safe wt_merge: global lock +
re-pull/retry). The coordinator is NO LONGER a merge queue (removed the bottleneck/SPOF).
Phase-C params (coordinator cron d82b4a68): TARGET 6 workers + 2 reviewers, spawn <=6/tick,
load1<25 (under-fill to <=2 workers if load1>12), freeGB>6, git-clean (untracked-only) disk prune.
Widen further toward 12 only on a later explicit instruction after Phase-C stays clean.
