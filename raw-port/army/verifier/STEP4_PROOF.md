# STEP 4 PROOF — the verifier rejects known-bad, accepts real (2026-07-29)

Reproduce: run each command below. This is the gate that had to pass before any swarm restart.

## Known-bad REJECTED

### 4a. The flagged cheat 7385eb01 (OZDynamicSpline::setVertexSmooth) — the actual committed file
    $ python3 raw-port/army/gate/g5_impl_gate.py raw-port/src/channels/OZDynamicSpline.ts
    FLAG: OZDynamicSpline_setVertexSmooth: DISPATCH_ONLY (7385eb01 shape) — mark `skeleton`, NEVER
          `ported`. Real work is the callees; not an implementable leaf.
  => classified DISPATCH_ONLY; must never be counted `ported`. (The cheat's whole body is two vtable
     dispatches that throw — it implements nothing itself.)

### 4b. The dispenser refuses to serve it as an implementable leaf
    leafq._is_dispatch_only("ProChannel", "__ZN15OZDynamicSpline15setVertexSmoothEPvbRK6CMTime", ...) -> True
  => leafq will not hand this shape to a worker, closing the root cause (it used to qualify as a leaf
     because its body is "only virtual dispatch = allowed boundary").

### 4c. A class-C cheat (REAL disasm ported as a throw-only body) — full gate.sh
    $ bash raw-port/army/gate/gate.sh <REAL-disasm fn with a throw body>
    G5 CHEAT — ScaleParams: REAL disasm but the port throws incompleteness on 81 reachable inputs.
    GATE: REJECT ❌
  => the #1 pattern that used to slip through (cite the addr, throw the body) is now BLOCKED.

## Genuinely-real ACCEPTED

### 4d. Real port (OZBezierEval) — Layer-1 executable oracle vs LIVE FCP
    $ python3 -m fct.parity.driver sweep curve.interp.bezier.eval
    -> VERIFIED  max_abs_err=0.000e+00 n=166
  => bit-exact against Apple's own function on 166 fuzzed inputs. This is the gold standard.

### Full stack self-proof
    $ python3 raw-port/army/verifier/prove_all.py
    LAYER 1: real VERIFIED (abs 0), shell FAILED, wrong/noop DIVERGED
    LAYER 2: 7385eb01 -> DISPATCH_ONLY, ScaleParams -> REAL, ud2 -> TRAP, getters -> EMPTY
    LAYER 3: 7385eb01 -> SKELETON, class-C(REAL+throw) -> REJECT_CHEAT, real-work -> LIKELY_REAL
    PROVE_ALL: PASS ✅

## Conclusion
The verifier demonstrably REJECTS the known-bad commits (7385eb01 shape, class-C throw-shells) and
ACCEPTS genuinely-real ports (bit-exact vs live FCP). Objective step 4 satisfied.
