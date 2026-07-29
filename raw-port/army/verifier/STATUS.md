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
   skeleton (must not be counted `ported`).

## KEY PROOFS (reproducible)
   python3 raw-port/army/verifier/prove_all.py         # 3-layer stack: PASS
   python3 raw-port/army/verifier/test_classify.py     # 9 locked fixtures: PASS
   bash raw-port/army/gate/gate.sh <cheat.ts>          # REJECT for REAL+throw

## STILL TODO (before swarm restart)
4. AUTO-REGISTRY (biggest lever): grow Layer-1 oracle from 4 -> thousands. Auto-extract ctypes
   signature from the demangled symbol + TS signature; make the executable oracle the DEFAULT
   completion gate for Tier-1 (callable pure) functions. Route G5 to oracle when callable.
5. DISPENSER FIX: leafq/claim must NEVER hand out a DISPATCH_ONLY function as an implementable leaf.
6. STATUS SPLIT: mark_ported must classify ported/skeleton/trap (DISPATCH_ONLY -> skeleton, never ported).
7. ADVERSARIAL REVIEWER sub-agent brief: independent re-derivation + structured rubric; blocks merge.
8. WORKER brief update: point at G5; explain SKELETON is not ported.
9. Re-adjudicate the ~existing DISPATCH_ONLY/throw commits (7385eb01 etc.) -> reclassify skeleton.
10. Restart SMALL watched swarm ONLY after 4-9 done + prove_all still PASS.

## COVERAGE (measured 2026-07-29)
   ~18,863 exported T symbols (ProCore 2260 + ProChannel 2747 + Helium 4203 + Ozone 9653). Not all
   pure/callable-in-isolation. Tier-1 = pure value/array in-out. Tier-2 = needs constructed obj.
   Tier-3 = local/hidden or ObjC/GL -> reviewer + classify + reach.
