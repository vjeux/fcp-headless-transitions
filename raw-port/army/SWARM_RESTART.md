# SWARM RESTART — queue-driven cron slots (Model B)

The swarm dispatch is QUEUE-DRIVEN: the scheduler (cron) is the ONLY thing that creates a session.
No agent calls `spawn_agent`, so the agent population is structurally bounded and can never explode.
See PR_FLOW.md "Dispatch model (Model B)" for the authoritative description.

## The cron slots
- **`swarm-maint`** — SCRIPT cron (`raw-port/army/tools/swarm_maint.sh`, every ~10 min). Ledger guard,
  warm-pool init/gc, clean the canonical tree (only if no gate/submit proc is live), periodic
  `depclaim seed`, `depgraph reconcile`, one snapshot line. No agent, no spawn, no merge.
- **`swarm-worker-1..4`** — PROMPT crons, one fixed slot each. Every tick: `slot_lock.sh acquire
  worker <N>` (exit if BUSY) → pull ONE rebase task (`rebase_claim.sh claim`) or 4-8 port units
  (`depclaim.py next`) → open PRs → release slot lock → STOP. Brief = DEP_WORKER_BRIEF.md.
- **`swarm-reviewer-1..4`** — PROMPT crons, one fixed slot each. Every tick: `slot_lock.sh acquire
  reviewer <N>` → `review_claim.sh claim` (leases a PR by head SHA) → gate/review/merge/reject →
  release → STOP. Brief = REVIEWER_BRIEF.md.
- **`swarm-introspection`** — reports on burn-down and self-adjusts its own cadence; never spawns.

Concurrency is bounded by (#worker + #reviewer slots) ∩ the warm pool (WT_POOL_SIZE leases) + the per-slot
single-flight lock. To scale, enable MORE cron slots (a human decision) — never raise a spawn count,
because nothing spawns.

## Preconditions (all must hold before enabling any slot)
1. `python3 raw-port/army/verifier/prove_all.py` → PROVE_ALL: PASS.
2. `python3 raw-port/army/verifier/test_classify.py` → PASS (9 fixtures).
3. gate.sh includes G5 (blocks REAL-disasm throw-shells + DISPATCH_ONLY skeletons at the PR gate).
4. `depclaim.py next` never dispenses a DISPATCH_ONLY shell as a leaf.
5. `mark_ported.py` never counts a DISPATCH_ONLY / throw-shell body as `ported`.

## The anti-cheat gate (why nothing false-completes)
A function is `ported` ONLY when its TS body reproduces the disassembly — not when it merely compiles.
- G5 (`gate/g5_impl_gate.py`) re-derives each cited function's disasm, classifies it (TRAP/EMPTY/
  DISPATCH_ONLY/REAL) and reach-fuzzes the port: a REAL-disasm body that throws on a reachable input
  is REJECT_CHEAT; a DISPATCH_ONLY dispatch shell is a hard REJECT; a NO-DISASM cited body is FLAGGED
  for the reviewer to re-derive.
- The ADVERSARIAL REVIEWER (a reviewer cron slot) is the CI: it re-derives disasm INDEPENDENTLY from
  the binary, runs classify → oracle (Tier-1) / reach (Tier-3) → line-by-line, and posts the
  `faithfulness-gate` commit status. A worker cannot self-merge; branch protection requires the green
  status + up-to-date + linear + enforce_admins. See CHEATING_REVIEW.md + REVIEWER_BRIEF.md.

## TO RESTART (in order — nothing spawns, so scale = enable more slots)
1. Confirm the preconditions above.
2. Run `bash raw-port/army/tools/swarm_maint.sh` once by hand — confirm a healthy snapshot (freeGB,
   ready>0, openPRs, pool). Fix any FATAL (usually a missing ledger) before enabling crons.
3. Enable `swarm-maint`, watch one tick.
4. Enable a FEW slots (e.g. 2 worker + 2 reviewer). Watch load, merge rate, and reviewer REJECT rate
   for 1-2 ticks. Hold if load spikes or the REJECT rate climbs.
5. Scale by enabling MORE worker/reviewer slots (and, if needed, raise WT_POOL_SIZE first so the pool
   isn't the bottleneck). Concurrency stays bounded by #slots ∩ pool leases.

## Status accounting (the headline number must be honest)
  ported   = oracle-VERIFIED (bit-exact vs live FCP) OR reviewer-signed LIKELY_REAL real body.
  skeleton = DISPATCH_ONLY / layout+stubs. Tracked separately. NEVER counted ported.
  stub     = throw-only placeholder. Not ported.
  trap     = ud2/empty. Faithful but non-executable. Counted separately.
Report "oracle-verified + reviewer-signed real implementations", not "files that compile".
