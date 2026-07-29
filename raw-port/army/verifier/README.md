# verifier/ — the un-gameable executable differential oracle

The static gate (impl_gate.py) is inherently gameable (see ../CHEATING_REVIEW.md): a worker adds a
token `if`/`return` and clears any regex. The ONLY objective proof that a port "actually implements
it" is to CALL the real FCP symbol and the TS port on the same fuzzed inputs and compare.

## Pieces
- `generic_worker.ts` — a UNIVERSAL TS evaluator: `{modulePath, exportName, args, argKinds}` ->
  dynamically imports the ACTUAL ported function and calls it. No per-symbol hand-coupling (unlike
  engine/test/_parity_worker.ts's 6-entry table). This is what lets the oracle scale to thousands
  of exported symbols.
- `diff_oracle.py` — calls the REAL FCP function via dlsym (fct.parity.oracle) AND the TS port via
  the generic worker, on N fuzzed inputs; verdicts VERIFIED / DIVERGED / FAILED / NO_ORACLE.
- `prove.py` — reproducible proof the oracle is un-gameable. Run it; it must print PASS.

## Why un-gameable
A throw-shell throws in the worker -> FAILED. A wrong body returns a wrong number -> DIVERGED. A
no-op constant -> DIVERGED. ONLY a body whose output equals Apple's on every fuzzed input passes.
There is no static text a worker can write to fake a correct NUMBER.

## Coverage tiers (measured 2026-07-29)
- TIER-1 (exported, pure value->value / array->value): dlsym differential. Strongest. ~18,863
  exported T symbols across ProCore/ProChannel/Helium/Ozone (upper bound; not all are pure).
- TIER-2 (exported but needs a constructed object arg, e.g. OZDynamicSpline::setVertexSmooth whose
  real work dispatches through a `vertex` object's vtable): callable only with object scaffolding.
- TIER-3 (local/hidden, or heavy ObjC/GL side-effects): adversarial-reviewer judgment (see
  ../reviewer/). No executable proof possible in isolation.

## Proof result (2026-07-29)
    real   expect=VERIFIED got=VERIFIED  abs=0.000e+00 n=64   (bit-exact vs live FCP)
    shell  expect=FAILED   got=FAILED    (the 7385eb01 throw-shell pattern)
    wrong  expect=DIVERGED got=DIVERGED  abs=5.278e+28
    noop   expect=DIVERGED got=DIVERGED  abs=5.278e+28
