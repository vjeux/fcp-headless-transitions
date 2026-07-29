# STEP 4 PROOF — the verifier rejects known-bad and accepts genuinely-real (2026-07-29)

Reproduce all four with: (each command below)

## 4a — the ACTUAL known cheat 7385eb01 (OZDynamicSpline::setVertexSmooth) is FLAGGED, not counted ported
    python3 raw-port/army/gate/g5_impl_gate.py raw-port/src/channels/OZDynamicSpline.ts
  => FLAG: OZDynamicSpline_setVertexSmooth: DISPATCH_ONLY (7385eb01 shape) — mark `skeleton`, NEVER `ported`.

## 4b — the dispenser REFUSES to serve 7385eb01's symbol as an implementable leaf (root-cause fix)
    leafq._is_dispatch_only("ProChannel","__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime", info) => True

## 4c — a class-C cheat (REAL disasm + all-throw body) is REJECTED by the full gate
    python3 raw-port/army/gate/g5_impl_gate.py <REAL-disasm fn ported as throw>
  => G5 CHEAT — REAL disasm but the port throws incompleteness on N reachable inputs -> REJECT (exit 2).

## 4d — a genuinely-REAL port is ACCEPTED (bit-exact vs LIVE FCP)
    python3 -m fct.parity.driver sweep curve.interp.bezier.eval
  => VERIFIED  max_abs_err=0.000e+00 n=166

## Full stack self-test
    python3 raw-port/army/verifier/prove_all.py   => PROVE_ALL: PASS
      LAYER 1 real VERIFIED (abs 0), shell FAILED, wrong/noop DIVERGED
      LAYER 2 7385eb01 -> DISPATCH_ONLY, ScaleParams -> REAL, ud2 -> TRAP, getters -> EMPTY
      LAYER 3 7385eb01 -> SKELETON, class-C(REAL+throw) -> REJECT_CHEAT, real-work -> LIKELY_REAL

CONCLUSION: the un-gameable verifier demonstrably blocks cheating (Step 4 satisfied). Remaining:
Step 5 — restart a SMALL, closely-watched swarm with the adversarial reviewer as a mandatory
merge-blocker. No mass spawning.
