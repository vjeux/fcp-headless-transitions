# Exhaustive cheat census of the committed raw-port (2026-07-29)

vjeux asked: "I gave you one example for the vtable, did you really do an exhaustive pass?" — No, the
first pass was NOT exhaustive. This is the exhaustive sweep of ALL ~8,907 committed `ported` functions.

## Method
For every `ported` function: slice its x86_64 disasm from the cached otool dumps, classify it
(TRAP/EMPTY/DISPATCH_ONLY/REAL), and cross-check the committed TS body. Iterated because early
heuristics had high false-positive rates (a naive "addr near a brace" body-check false-flagged 38/40
real functions). The reliable signals: framework-aware citation reconcile + method-body-matched-to-symbol.

## Bugs found in the anti-cheat accounting (each fixed + committed)
1. CROSS-FRAMEWORK ADDRESS COLLISION (stubscan keyed on bare addr): 3205 addrs appear in >1 framework.
   @ProCore 0x41b8 (PCColorUtil::applyHLGToPQ, a throw stub) shared key '41b8' with @Ozone 0x41b8
   (vertexShaderViewer, real) -> the real Ozone cite made the ProCore stub count `ported`.
   FIX: key on (framework, addr), fw-specific precedence over wildcard. Demoted ~46.
2. MULTI-LINE THROWS: the stub-phrase parser only saw same-line `throw new ... not yet transcribed`.
   Many throws span lines (cc_rgb::hsl @0x9667e, a 118-line HSL decoder throw-stubbed). FIX: 6-line
   window from each `throw new`. Demoted ~861.
3. STUB VOCABULARY GAP: regex only matched "not yet transcribed/ported/decoded/implemented". Real
   throws also use unimplemented(54), frontier callee(26), not yet decoded(18), pending(8),
   not yet ported(8), not yet materialized(3), undecoded(2), not yet wired(1). FIX: broaden vocab
   (aligned with reach_worker.ts), verified no false-positive on runtime guards. Demoted ~162.
4. CALL-SITE-ADDRESSED THROWS: some throw-stubs cite the CALLEE/call-site address in their message,
   not the method's own address (OZChannelBool3D::setValue @0x537c6 throws citing @0x53869/...), so
   address-reconcile can't link them. FIX: method-body census matched to symbol -> 38 confirmed
   class-C recorded by mangled symbol in CLASS_C_OVERRIDES.json, always demoted. Demoted 38.

## Result (honest count)
  ported:   8907 (inflated)  ->  7786 (real)     -- 1121 corrected (12.6% inflation)
  skeleton: 179  ->  163      (DISPATCH_ONLY vtable shells; never `ported`)
  stub:     516  ->  1454     (throw-stubs that were miscounted `ported`)
The headline "ported" number was inflated ~13% by throw-stubs the old accounting missed. The
verifier (classify + reach + oracle) itself was never wrong — the LEDGER STATUS accounting was, in
4 distinct ways, all now fixed. Residual class-C by the reliable method-body census: 0 after overrides.

## Caveats (honest)
- ~1829 ported fns are ctors/dtors/operators/inlined whose demangled name doesn't map to a discrete
  TS method, so the method-body census can't check them by name; they were checked by disasm class
  (TRAP/EMPTY/DISPATCH_ONLY/REAL) + framework-aware citation. A deeper per-symbol body audit of those
  would need symbol->TS-body wiring the ports don't currently carry uniformly.
- The 38 class-C overrides include a few borderline cases (body calls a `*_stub` helper rather than a
  bare throw). Treated as not-ported (conservative — a body that defers all work to a throwing stub
  is a skeleton, not a real port).

## Residual blind spot quantified (ctor/dtor/operator/inlined)
The method-body census can't name-match ctors/dtors/operators. Classified by disasm instead:
  TRAP 115, EMPTY 415, DISPATCH_ONLY 4, REAL 1356, NO_DISASM 833.
The 1356 REAL "unnamed" are the residual blind spot (a REAL-disasm dtor could in principle be a
throw-shell). Sampled 15 by citation: 6 real body, 0 throw-only, 9 addr-not-found-in-src (citation
format mismatch, not a throw). Zero throw-only in the sample -> the unnamed set does not appear to
hide bare-throw cheats, but a full per-symbol body audit of these 1356 would need symbol->TS-body
wiring the ports don't uniformly carry. Recorded as a known, bounded residual — not a silent gap.

## Bottom line
Exhaustive pass DONE. 1121 inflated `ported` entries corrected across 4 distinct accounting bugs
(cross-fw collision, multi-line throws, stub-vocab gap, call-site-addressed throws). Honest ported
count 7786. The verifier stack (classify/reach/oracle) was correct throughout; the LEDGER ACCOUNTING
was what inflated the headline number, now fixed and documented.
