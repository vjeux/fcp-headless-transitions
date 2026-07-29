# Anti-cheat rebuild — STATUS (compaction-proof)

## DONE (proven, committed, pushed)
1. Characterized cheating (../CHEATING_REVIEW.md): patterns A(ud2) B(empty) C(REAL+throw) D(skeleton)
   E(real). C & D are the problem. Root cause: gate only checked compile+cite, oracle only 65 nodes.
2. UN-GAMEABLE VERIFIER STACK (verifier/), proven by `python3 prove_all.py` -> PROVE_ALL: PASS:
   - LAYER 1 executable differential oracle (Tier-1 callable pure fns): diff_oracle.py + generic_worker.ts.
     Real port VERIFIED (abs 0 vs LIVE FCP), throw-shell FAILED, wrong/noop DIVERGED.
   - LAYER 2 structural classifier: classify_disasm.py (TRAP/EMPTY/DISPATCH_ONLY/REAL). 7385eb01 ->
     DISPATCH_ONLY (never a leaf). test_classify.py LOCKS 9 fixtures vs real .s bytes.
   - LAYER 3 Tier-3 reachability: reach_worker.ts + reach_check.py. 7385eb01 -> SKELETON,
     class-C(REAL+throw) -> REJECT_CHEAT, real-work -> LIKELY_REAL.
3. GATE G5 wired into gate.sh (g5_impl_gate.py). Re-derives disasm from the binary on-demand
   (adversarial). PROVEN: gate.sh REJECTS a REAL-disasm throw-shell end-to-end; FLAGS 7385eb01 as
   skeleton. wt_merge.sh runs gate.sh -> G5 enforced at merge time.
4. DISPENSER FIX (leafq.py): _is_dispatch_only() refuses to serve DISPATCH_ONLY shells as leaves.
   setVertexSmooth -> refused; OZBezierEval -> still served. 213 cheatable candidates in ProChannel
   alone now filtered.
5. AUTO-REGISTRY (autoreg.py + autosig.py): grows Layer-1 oracle from demangled signatures. SAFETY
   FIX: only emits FREE-function / no-rdi-static descriptors (instance methods segfault via dlsym —
   proven exit 139). Measured: only ~4 free pure+exported fns/fw — confirms Layer-1 covers a small
   slice; Layer-2/3 is the workhorse for the 99% that are C++ methods needing objects.
6. BRIEFS: REVIEWER_BRIEF.md (adversarial-reviewer protocol, blocking sign-off) + LEAF_BRIEF.md
   (consolidated, points workers at G5 / dispenser refusal / oracle / reviewer).
7. STEP 4 PROVEN (verifier/STEP4_PROOF.md): rejects 7385eb01 (SKELETON) + class-C (GATE REJECT),
   accepts OZBezierEval (VERIFIED bit-exact vs LIVE FCP, abs 0 n=166).

## STEP 5 (in progress): controlled pilot before any swarm restart
- All spawn crons remain DISABLED (swarm-coordinator d82b4a68, progress-logger 2688fe17, etc).
- Running ONE adversarial-reviewer pilot sub-agent to prove it REJECTS the known cheats and ACCEPTS
  a real port in practice. NO mass spawning. Swarm restart only after the reviewer demonstrably
  blocks a cheat, and then SMALL + closely-watched with the reviewer as mandatory merge-blocker.

## REMAINING (smaller)
- mark_ported.py: add `skeleton` status for DISPATCH_ONLY (today it's ported/stub/todo; DISPATCH_ONLY
  bodies that don't throw a stub-phrase can still be miscounted `ported`). Reclassify 7385eb01-family.
- Wire the reviewer sign-off (<file>.review.json) as a hard precondition in wt_merge.sh for
  LIKELY_REAL/REAL-noncallable cases (G5 already blocks the mechanical cheats).

## COVERAGE (measured 2026-07-29)
   ~18,863 exported T symbols (ProCore 2260 + ProChannel 2747 + Helium 4203 + Ozone 9653). Not all
   pure/callable-in-isolation. Tier-1 = pure value/array in-out. Tier-2 = needs constructed obj.
   Tier-3 = local/hidden or ObjC/GL -> reviewer + classify + reach.
