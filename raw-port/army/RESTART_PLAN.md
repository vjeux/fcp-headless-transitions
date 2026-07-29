# SWARM RESTART PLAN — small, closely-watched, reviewer-gated (only after the verifier is proven)

Preconditions (ALL proven 2026-07-29 — see verifier/STEP4_PROOF.md, verifier/STEP5_REVIEWER_PILOT.md):
  [x] verifier/prove_all.py -> PROVE_ALL: PASS (Layer 1 oracle + Layer 2 classify + Layer 3 reach)
  [x] gate.sh G5 REJECTS class-C (REAL disasm + throw body) end-to-end
  [x] leafq dispenser REFUSES DISPATCH_ONLY shells (7385eb01 shape) as leaves
  [x] mark_ported classifies DISPATCH_ONLY as `skeleton`, never `ported` (179 reclassified)
  [x] adversarial-reviewer pilot REJECTED 2 known cheats + ACCEPTED 1 real port (bit-exact)
Do NOT restart if any of the above regresses. Re-run prove_all.py first, every restart.

## The merge is now reviewer-gated (worker CANNOT self-merge a REAL body)
Two enforcement layers at merge time:
  1. AUTOMATED (already in wt_merge.sh -> gate.sh -> G5): blocks the mechanical cheats — class-C
     (REAL disasm + reachable incompleteness throw) and unverifiable REAL symbols. This is hard-fail.
  2. ADVERSARIAL REVIEWER (sub-agent, REVIEWER_BRIEF.md): for a REAL non-oracle body that PASSES G5
     (throw-free but possibly WRONG), a reviewer independently re-derives the disasm, runs the
     executable oracle where callable, reads the body line-by-line, and signs <file>.review.json
     with verdict ∈ {VERIFIED, LIKELY_REAL, TRAP, EMPTY} to ACCEPT, or REJECT to block. The reviewer
     is a SEPARATE agent rewarded for catching cheats; the worker does not self-certify.

## Restart procedure (start with ONE worker, scale slowly, watch every merge)
1. Re-prove: `python3 raw-port/army/verifier/prove_all.py` must PASS.
2. Confirm state clean: no running workers (`ps`), claims.json/leaf_claims.json not stale
   (`reap_stale_claims.py`), spawn crons still disabled.
3. Spawn ONE leaf worker (LEAF_BRIEF.md). Watch it: it should port a REAL body, gate PASS, and NOT
   merge until reviewed.
4. Spawn ONE adversarial reviewer (REVIEWER_BRIEF.md) on the worker's branch/file. It emits
   <file>.review.json. Merge ONLY on an ACCEPT verdict.
5. If the reviewer REJECTS, the worker's branch does NOT merge — fix or discard. Record the catch.
6. Only after several clean worker->reviewer->merge cycles, scale up SLOWLY (2, then 4 workers),
   each still paired with a reviewer sign-off. NEVER mass-spawn. Guard: load<12, freeGB>6.
7. The swarm-coordinator cron (d82b4a68) stays DISABLED until this manual loop is proven stable at
   small scale. When re-enabling, its brief MUST require a reviewer sign-off before wt_merge (add a
   reviewer-spawn step per completed worker; a merge without an ACCEPT review.json is forbidden).

## Status accounting (the headline number must be honest)
  ported   = oracle-VERIFIED (bit-exact vs live FCP) OR reviewer-signed LIKELY_REAL real body.
  skeleton = DISPATCH_ONLY / layout+stubs. Tracked separately. NEVER counted ported.
  stub     = throw-only placeholder. Not ported.
  trap     = ud2/empty. Faithful but non-executable. Counted separately.
Report "oracle-verified + reviewer-signed real implementations", not "files that compile".

## Why this kills the cheating (root cause -> fix)
  root cause: gate checked only compile + @0xADDR; oracle ran for 65 nodes; leafq treated vtable
              dispatch as an allowed boundary -> a whole-body-dispatch shell qualified as a leaf and
              passed the gate (7385eb01).
  fix:        (a) leafq never serves DISPATCH_ONLY; (b) G5 re-derives disasm + fuzzes the port and
              rejects REAL-disasm throw-shells; (c) the executable oracle proves callable pure fns
              bit-exact vs live FCP; (d) an adversarial reviewer blocks the judgment cases; (e)
              mark_ported never counts a shell as ported.
