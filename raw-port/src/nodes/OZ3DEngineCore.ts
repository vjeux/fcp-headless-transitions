// OZ3DEngineCore.ts — Ozone.framework (nodes layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * OZ3DEngineCore::OZ3DEngineCore()  [C1]  @Ozone 0x4a2110
//     __ZN14OZ3DEngineCoreC1Ev
//
// re/disasm:
//   raw-port/re/disasm/__ZN14OZ3DEngineCoreC1Ev.s
//
// NOT ported here (separate ledger entries): the C2 base-object ctor @0x4a2100 and the engine's
// real work — buildRenderGraph @0x4a2120, build3DEngineRenderGraph @0x4a2530,
// makeRenderImageSource @0x4a2f30, getMotionLights @0x4a1fd0, getEnvironmentMap @0x4a3490,
// getEnvironmentMapIntensity @0x4a34c0, getCachedEnvironmentMap @0x4a34e0. One of them is
// quoted below as evidence about the class's state, not ported.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. No callq, no base-class ctor call, no vptr store, no allocation.
// `depgraph.py deps __ZN14OZ3DEngineCoreC1Ev` reports nothing.
//
// -----------------------------------------------------------------------------
// FULL DISASM (the whole function, @0x4a2110..@0x4a2115)
// -----------------------------------------------------------------------------
//   0x4a2110  pushq %rbp                     ; frame prologue
//   0x4a2111  movq  %rsp, %rbp
//   0x4a2114  popq  %rbp                     ; epilogue
//   0x4a2115  retq
//   0x4a2116  nopw  %cs:(%rax,%rax)          ; padding to the next 0x10 boundary — not executed
//
// THE BODY IS COMPLETE, NOT TRUNCATED. The next symbol in the table,
// `OZ3DEngineCore::buildRenderGraph`, is at 0x4a2120 — exactly 0x10 on — and the four
// instructions above occupy six bytes with the rest padding, so nothing is missing. (Worth
// stating: a listing that ends early is precisely how the #368 slicer bug turned REAL bodies
// into EMPTY ones, so an "empty" body deserves a bound, not a shrug.)
//
// WHAT THE EMPTINESS MEANS. Two independent facts say this is a genuinely stateless class
// rather than an undecoded gap:
//   1. THERE IS NO VPTR STORE. A polymorphic class's constructor always writes its vtable
//      pointer; this one writes nothing at all, so OZ3DEngineCore has no virtual functions.
//   2. THE ENGINE'S CACHED STATE IS A FUNCTION-LOCAL STATIC, NOT A MEMBER.
//      `OZ3DEngineCore::getCachedEnvironmentMap()` @0x4a34e0 opens with
//        0x4a34eb  movq __ZZN14OZ3DEngineCore23getCachedEnvironmentMapEvE14environmentMap(%rip),%rax
//        0x4a34f2  testq %rax,%rax ; 0x4a34f5 jne …   ; return the cached one if already built
//      i.e. it reads the guarded static `getCachedEnvironmentMap()::environmentMap` — NOT
//      `this`. So the class is a facade over file-scope/static state, which is exactly why its
//      constructor has nothing to initialise.
// Modelling any field here would therefore be the invented-layout mistake PORTING_SPEC Rule 5
// forbids: the class body below is deliberately empty of state.
//
// -----------------------------------------------------------------------------
// ORACLE — the negative claim, measured
// -----------------------------------------------------------------------------
// raw-port/re/oracle/OZ3DEngineCore_ctor_oracle.py. "It writes nothing" is a NEGATIVE claim,
// which reading a listing cannot settle on its own, so it is measured: 128 constructions per
// ctor into a 0x100-byte buffer pre-filled with a per-case poison byte, requiring every byte to
// survive.
//   C1 @0x4a2110 — 128 constructions, objects with ANY byte modified: 0
//   C2 @0x4a2100 — 128 constructions, objects with ANY byte modified: 0
// A vptr store or any member initialisation would have shown up here. Both symbols are exported
// (`nm` class `T`) but are called at x86_64 vmaddr + the loaded image's slide anyway, under
// `arch -x86_64 /usr/bin/python3` so dyld maps the x86_64 slice these addresses come from
// (OPS_LOG "wrong architecture"). Ozone does not plain-dlopen outside the app bundle, so the
// harness preloads its @rpath chain depth-first first — the technique OPS_LOG records.
//
// THE C1/C2 TWIN. `OZ3DEngineCoreC2Ev` @0x4a2100 is the base-object constructor: the same empty
// body at a distinct address, 0x10 earlier (not ICF-folded). It stays its own ledger unit; the
// oracle above covers it only as evidence. Whoever claims it should extend this file add-only.

/**
 * `OZ3DEngineCore` — Ozone's 3D-engine entry point (render-graph construction and environment
 * lighting). A STATELESS class: its constructor initialises nothing, it has no vptr, and the
 * one piece of cached state its accessors use is a function-local static rather than a member
 * (see the file header). No field is modelled, because no decoded instruction writes or reads
 * one.
 */
export class OZ3DEngineCore {
  /**
   * `OZ3DEngineCore::OZ3DEngineCore()` [C1] — @Ozone 0x4a2110
   *   (__ZN14OZ3DEngineCoreC1Ev)
   *
   * Faithful transcription of the whole function: a frame prologue and epilogue with nothing
   * in between. No member is written, no vtable pointer is stored, no base constructor is
   * called. Verified live: 128 constructions over a poisoned buffer left every byte intact.
   *
   * Doing nothing IS the transcription — see the file header for the disassembly, the bound
   * that proves the listing is complete, and the evidence that the class is stateless.
   */
  constructor() {
    // @0x4a2110..0x4a2111 — prologue; @0x4a2114..0x4a2115 — epilogue + retq.
    // There is no instruction in between.
  }
}
