# verifier/ — the un-gameable anti-cheat verifier stack

The static gate (../gate/impl_gate.py) is inherently gameable (see ../CHEATING_REVIEW.md): a worker
adds a token `if`/`return` and clears any regex. This directory replaces "does the text look done?"
with objective, executable signals a worker cannot fake without real transcription.

## Run the whole proof
    python3 raw-port/army/verifier/prove_all.py     # must print PROVE_ALL: PASS

## Three layers

### LAYER 1 — executable differential oracle (Tier-1: callable pure fns)  [STRONGEST]
- `generic_worker.ts` — universal dynamic-import TS evaluator: {modulePath, exportName, args,
  argKinds} -> imports the ACTUAL ported fn and calls it. No per-symbol hand-coupling, so it scales
  to thousands of exported symbols. Runs via tsx from raw-port/node_modules (raw-port is standalone).
- `diff_oracle.py` — calls the REAL FCP symbol via dlsym (fct.parity.oracle) AND the TS port via
  the generic worker on N fuzzed inputs; verdict VERIFIED / DIVERGED / FAILED / NO_ORACLE.
- `prove.py` — proof: real VERIFIES (abs 0 vs live FCP), throw-shell FAILS, wrong/noop DIVERGE.
- Un-gameable: only a body whose NUMBER equals Apple's on every fuzzed input passes. No static
  text fakes a correct number.

### LAYER 2 — structural classifier (dispenser filter + reviewer starting signal)
- `classify_disasm.py` — TRAP | EMPTY | DISPATCH_ONLY | REAL from one function's AT&T disasm.
  Operand-aware: a memory LOAD is not "work" (vtable loads are loads); the entry bool-arg guard
  `testl %edx,%edx` is control flow, not compute; `mov %reg,%reg` / `xorps %xmm,%xmm` are
  marshalling. DISPATCH_ONLY == the 7385eb01 shape (real work IS the callees) -> NEVER a leaf,
  at most `skeleton`. REAL -> an all-throw body is a class-C cheat.
- `test_classify.py` — LOCKED fixtures (verified against real .s bytes). Guards against regressing
  cheat detection. The 7385eb01 cheat MUST classify DISPATCH_ONLY; real math MUST be REAL.

### LAYER 3 — Tier-3 reachability verdict (non-callable fns the oracle can't reach)
- `reach_worker.ts` — fuzzes the port's own params; counts inputs that hit an INCOMPLETENESS throw
  (/not yet transcribed|pending|unimpl|TODO|stub/). Un-gameable: to pass, no reachable input may
  hit an incompleteness throw; a worker can't hide the throw behind a param-predicated branch (the
  fuzzer sets the params). Swallowing it (try/catch{}) is banned by provenance_gate P5.
- `reach_check.py` — combines classify + reach into one verdict:
    TRAP disasm                     -> ACCEPT_AS_TRAP
    EMPTY disasm, 0 incomplete      -> ACCEPT_AS_EMPTY
    DISPATCH_ONLY disasm            -> SKELETON (never `ported`; the 7385eb01 verdict)
    REAL disasm + 0 incomplete      -> LIKELY_REAL (reviewer signs / oracle if callable)
    REAL disasm + incomplete>0      -> REJECT_CHEAT (class-C: real work, port throws)

## Coverage tiers (measured 2026-07-29)
- TIER-1 (exported, pure value->value / array->value): dlsym differential. ~18,863 exported T
  symbols across ProCore/ProChannel/Helium/Ozone (upper bound; not all pure).
- TIER-2 (exported but needs a constructed object arg, e.g. OZDynamicSpline::setVertexSmooth whose
  real work dispatches through a `vertex` object's vtable): callable only with object scaffolding.
- TIER-3 (local/hidden, or heavy ObjC/GL side-effects): classify + reach_check + adversarial
  reviewer judgment. No isolated executable proof.

## Status classes (stop inflating "ported")
    ported   -> ONLY oracle-VERIFIED (Layer 1) or reviewer-signed LIKELY_REAL (Layer 3).
    skeleton -> DISPATCH_ONLY / layout+stubs. Counted separately, NEVER as ported.
    trap     -> ud2/empty. Faithful but non-executable. Counted separately.

## Proof result (2026-07-29) — prove_all.py: PASS
    LAYER 1: real VERIFIED (abs 0), shell FAILED, wrong/noop DIVERGED
    LAYER 2: 7385eb01 -> DISPATCH_ONLY, ScaleParams -> REAL, ud2 -> TRAP, getters -> EMPTY
    LAYER 3: 7385eb01 -> SKELETON, class-C(REAL+throw) -> REJECT_CHEAT, real-work -> LIKELY_REAL
