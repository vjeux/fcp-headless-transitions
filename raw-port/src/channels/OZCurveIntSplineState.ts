// OZCurveIntSplineState — per-int-channel default OZSplineState singleton for
// ProChannel/Ozone. Faithful transcription of the FCP Ozone class whose only
// exported symbols are the Itanium ABI destructor pair PLUS the std::call_once
// proxy that materializes the singleton on first use:
//
//   @0x00000000000c0a80  OZCurveIntSplineState::~OZCurveIntSplineState()  D1  [__ZN21OZCurveIntSplineStateD1Ev]
//   @0x00000000000c0a90  OZCurveIntSplineState::~OZCurveIntSplineState()  D0  [__ZN21OZCurveIntSplineStateD0Ev]
//
// The ctor body itself has no standalone symbol — it was inlined by the compiler
// into the std::call_once payload for OZCurveIntSplineState::getInstance(). That
// payload IS present in Ozone as an exported __call_once_proxy body at:
//
//   @0x00000000000c0a20  void std::__1::__call_once_proxy[abi:nqe210106]<
//                          std::__1::tuple<OZCurveIntSplineState::getInstance()::'lambda'()&&>
//                        >(void*)
//     [__ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN21OZCurveIntSplineState11getInstanceEvEUlvE_EEEEEvPv]
//
// The proxy body IS the ctor of OZCurveIntSplineState: `operator new(0x38)`,
// call the two base ctors, install the vtable, publish the pointer into the
// static _instance slot. There is NO separately-exported
// OZCurveIntSplineState::getInstance() symbol in Ozone — the outer wrapper was
// inlined into its only known caller (`OZChannelUint32Impl::OZChannelUint32Impl()`
// @0x000c07f0..@0x000c07fb which calls `__ZNSt3__111__call_onceERVmPvPFvS2_E`
// with the proxy address as its function pointer, then loads
// `__ZN21OZCurveIntSplineState9_instanceE` at @0x000c0800).
//
// VTABLE (via `resolve.py Ozone vtable OZCurveIntSplineState` —
//   __ZTV21OZCurveIntSplineState @0x838620; installed ptr = 0x838630):
//   *0x00 -> 0xc0a80  OZCurveIntSplineState::~OZCurveIntSplineState()  (D1 slot)
//   *0x08 -> 0xc0a90  OZCurveIntSplineState::~OZCurveIntSplineState()  (D0 slot)
//   (only 2 slots present; subsequent bytes in the dump belong to the next class)
//
// STRUCT LAYOUT (recovered from the ctor lambda body @0x000c0a20..@0x000c0a66):
//   sizeof(OZCurveIntSplineState) = 0x38 = 56 bytes
//     (`movl $0x38, %edi ; callq __Znwm` @0x000c0a27..@0x000c0a2c)
//
//     +0x00  vtable pointer                                          @0x000c0a4a..@0x000c0a55
//              (`leaq __ZTV21OZCurveIntSplineState(%rip), %rax ;
//                 addq $0x10, %rax ; movq %rax, (%rbx)` — installed ptr = vtable+0x10.)
//              This slot is ALSO the PCSingleton primary-base vptr (PCSingleton
//              is the primary base at offset 0 in the multi-inherit layout, so
//              its own ctor stores its own vtable at +0x00, which is then
//              overwritten by this OZCurveIntSplineState-installed vptr after
//              both base ctors return — the exact ordering the asm emits.)
//     +0x08  OZSplineState base subobject                            @0x000c0a34..@0x000c0a38
//              (`leaq 0x8(%rax), %rdi ; callq __ZN13OZSplineStateC2Ev` —
//               OZSplineState::OZSplineState() @Ozone U-import; call site @0x000c0a38).
//
// C++ multi-inheritance shape (mirrors OZCurveEnumSplineState exactly):
//   class OZCurveIntSplineState : public PCSingleton, public OZSplineState
//     - PCSingleton primary base @ offset 0x00 (ctor called on %rbx directly
//       @0x000c0a3d..@0x000c0a45 with the singleton-tag argument 200 (0xc8);
//       overlapping the vtable slot at +0x00 which is then overwritten @0x000c0a55).
//     - OZSplineState secondary base @ offset 0x08 (ctor called on %rbx+0x8
//       @0x000c0a34..@0x000c0a38).
//   The base-ctor CALL ORDER in the asm — OZSplineState FIRST (@0x000c0a38) and
//   THEN PCSingleton (@0x000c0a45) — is the ORDER of the calls, not the order
//   of subobject destruction; ISO C++ requires destruction in reverse-declaration
//   order, but here the D1/D0 bodies below only invoke PCSingleton::~D2 (the
//   OZSplineState base dtor is trivial / inlined-away by the compiler in this
//   binary — see D1/D0 disasm below).
//
// STATIC STATE (RIP-relative symbols observed at the call site @0x000c07f0..@0x000c0800):
//   OZCurveIntSplineState::_instance      [__ZN21OZCurveIntSplineState9_instanceE]
//     - loaded @0x000c0800 (`movq 0x7617c1(%rip), %rax ; movq (%rax), %rax`),
//       then indexed as `&_instance->OZSplineState_base = _instance + 0x8`
//       (@0x000c080a — `leaq 0x8(%rax), %rsi`) and passed to
//       `OZCurve::setSplineState(OZSplineState*)` @0x000c0818.
//     - stored @0x000c0a5f inside the ctor proxy (`movq %rbx, (%rax)`).
//   The proxy also implies the presence of a matching once-flag word
//   (__ZN21OZCurveIntSplineState13_instanceOnceE) governing __call_once, but
//   that word is loaded by the caller (OZChannelUint32Impl::OZChannelUint32Impl),
//   not by this class's own code — we model it here for API completeness.
//
// UNDECODED CALLEES (throwing stubs per PORTING_SPEC.md Rule 3 — every callq / stub is cited):
//   - OZSplineState::OZSplineState()              @Ozone U-import __ZN13OZSplineStateC2Ev
//                                                                 (call site @0x000c0a38)
//     OZSplineState is a ported class (raw-port/src/channels/OZSplineState.ts) but its
//     default constructor body is NOT yet transcribed there; we import the class as an
//     opaque type and use a throwing stub to keep the call site honest per Rule 3.
//   - PCSingleton::PCSingleton(unsigned int)      @Ozone U-import __ZN11PCSingletonC2Ej
//                                                                 (call site @0x000c0a45
//                                                                  with tag = 0xc8)
//     PCSingleton is a ported class (raw-port/src/infra/PCSingleton.ts); its constructor
//     takes a tag argument (matching the `movl $0xc8, %esi` immediate). Imported directly.
//   - PCSingleton::~PCSingleton()                 @Ozone U-import __ZN11PCSingletonD2Ev
//                                                                 (call sites D1@0x000c0a85
//                                                                             D0@0x000c0a99)
//     Modeled as PCSingleton.destroy() per raw-port/src/infra/PCSingleton.ts.
//   - operator new(unsigned long) __Znwm          @Ozone stub 0x6dfca2 (call site @0x000c0a2c)
//     Not modeled — JS allocates via `new`; the size (0x38) is the only decode signal.
//   - operator delete(void*) __ZdlPv              @Ozone stub 0x6dfc36 (call site
//                                                                 D0 tail-jmp @0x000c0aa7)
//     Not modeled — JS is GC'd. Throwing stub keeps the citation honest.
//   - __Unwind_Resume                             @Ozone stub 0x6dd07a (call site @0x000c0a75)
//     Exception-unwind path from the ctor proxy's landingpad if OZSplineState::C2 throws;
//     not reachable in the TS model (bases either succeed or the whole `new` bubbles the
//     exception out — GC handles reclamation).

import { PCSingleton } from "../infra/PCSingleton";
import { OZSplineState } from "./OZSplineState";

// ─────────────────────────────────────────────────────────────────────────────
// Undecoded-base stubs
// ─────────────────────────────────────────────────────────────────────────────

/** OZSplineState::OZSplineState() — @Ozone U-import __ZN13OZSplineStateC2Ev
 *  (call site @0x000c0a38 inside the __call_once_proxy body for
 *  OZCurveIntSplineState::getInstance()::'lambda'()). The OZSplineState default
 *  ctor body is not transcribed in raw-port/src/channels/OZSplineState.ts yet. */
function OZSplineState_default_ctor(_baseSubobj: OZSplineState): void {
  throw new Error(
    "OZSplineState::OZSplineState() @Ozone U-import __ZN13OZSplineStateC2Ev (call site @0x000c0a38 in OZCurveIntSplineState ctor lambda) not yet transcribed",
  );
}

/** `operator delete(void*)` — @Ozone stub 0x6dfc36 (__ZdlPv). Tail-jumped from
 *  D0 @0x000c0aa7. Not modeled in TS (JS is GC'd); throwing stub cites the site. */
function operator_delete(_p: OZCurveIntSplineState): void {
  throw new Error(
    "operator delete (__ZdlPv) not modeled in the TS port; JS/TS objects are GC'd. Cited call site: OZCurveIntSplineState::~OZCurveIntSplineState() D0 @0x000c0aa7",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OZCurveIntSplineState — 56-byte object; int-curve default OZSplineState singleton
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OZCurveIntSplineState — per-curve-type (int/uint32 variant) OZSplineState
 * singleton for ProChannel's OZChannelUint32Impl. Multi-inherits from
 * PCSingleton (primary base @ +0x00, tag = 0xc8) and OZSplineState (secondary
 * base @ +0x08). The whole struct is 56 bytes (0x38); no per-class fields beyond
 * the two base subobjects.
 */
export class OZCurveIntSplineState {
  /** (+0x00) PCSingleton primary base. Constructed with tag = 0xc8 @0x000c0a45. */
  readonly _pcSingletonBase: PCSingleton;

  /** (+0x08) OZSplineState secondary base subobject. Default-constructed
   *  @0x000c0a38 via the undecoded U-import __ZN13OZSplineStateC2Ev. */
  readonly _splineStateBase: OZSplineState;

  /**
   * OZCurveIntSplineState::OZCurveIntSplineState() — the ctor lambda body
   * exported as the std::call_once proxy at @0x000c0a20 (__call_once_proxy
   * for `OZCurveIntSplineState::getInstance()::'lambda'()` in Ozone).
   *
   * Mirrors the asm byte-for-byte:
   *   @0x000c0a20  pushq %rbp
   *   @0x000c0a21  movq  %rsp, %rbp
   *   @0x000c0a24  pushq %r14
   *   @0x000c0a26  pushq %rbx
   *   @0x000c0a27  movl  $0x38, %edi                       ; sizeof = 56
   *   @0x000c0a2c  callq __Znwm                            ; %rax = operator new(56)
   *   @0x000c0a31  movq  %rax, %rbx                        ; this = %rbx
   *   @0x000c0a34  leaq  0x8(%rax), %rdi                   ; &this->OZSplineState_base (+0x8)
   *   @0x000c0a38  callq __ZN13OZSplineStateC2Ev           ; OZSplineState::OZSplineState()  (U-import)
   *   @0x000c0a3d  movq  %rbx, %rdi                        ; %rdi = this
   *   @0x000c0a40  movl  $0xc8, %esi                       ; tag = 200
   *   @0x000c0a45  callq __ZN11PCSingletonC2Ej             ; PCSingleton::PCSingleton(uint)
   *   @0x000c0a4a  leaq  __ZTV21OZCurveIntSplineState(%rip), %rax
   *   @0x000c0a51  addq  $0x10, %rax                       ; installed ptr = vtable+0x10
   *   @0x000c0a55  movq  %rax, (%rbx)                      ; this->vtable = installed
   *   @0x000c0a58  movq  0x7617c1(%rip), %rax              ; &_instance (literal-pool slot)
   *   @0x000c0a5f  movq  %rbx, (%rax)                      ; _instance = this
   *   @0x000c0a62  popq  %rbx / popq %r14 / popq %rbp / retq
   *
   * The landingpad @0x000c0a67..@0x000c0a79 (movq %rax,%r14 ; movq %rbx,%rdi ;
   * callq __ZdlPv ; movq %r14,%rdi ; callq __Unwind_Resume) is the C++ unwind
   * path if OZSplineState::C2 throws — it frees the just-allocated storage and
   * resumes propagation. TS has no manual unwind: an exception from
   * OZSplineState_default_ctor propagates naturally, and GC reclaims the
   * partially-constructed object.
   *
   * ORDER of the two base ctor calls in the asm:
   *   1. OZSplineState::OZSplineState()   @0x000c0a38   (on this+0x8)
   *   2. PCSingleton::PCSingleton(uint)   @0x000c0a45   (on this, with tag=0xc8)
   * We call them in the same order in TS.
   *
   * The vtable install @0x000c0a55 has no direct TS analogue (we have no vptr);
   * the two virtual destructors become ordinary methods on the class.
   */
  private constructor() {
    // @0x000c0a38 — OZSplineState base ctor on the secondary base subobject at +0x8.
    // OZSplineState.ts has no exported default ctor yet, so we throw a citation stub
    // per Rule 3 while still materialising a distinct base holder so identity
    // comparisons behave sensibly if a caller catches the throw and inspects state.
    const splineStateBase = Object.create(OZSplineState.prototype) as OZSplineState;
    OZSplineState_default_ctor(splineStateBase); // throws — currently undecoded
    this._splineStateBase = splineStateBase;

    // @0x000c0a45 — PCSingleton primary-base ctor with tag = 0xc8 (200 decimal).
    // PCSingleton.ts provides a real ctor taking the tag argument; call it directly.
    this._pcSingletonBase = new PCSingleton(0xc8);

    // @0x000c0a4a..@0x000c0a55 — vptr install. No TS analogue (no vptr in TS).
    // @0x000c0a58..@0x000c0a5f — publish `this` into the static _instance slot.
    OZCurveIntSplineState._instance = this;
  }

  // ── static once-flag + instance slot (RIP-relative globals in Ozone) ──
  //   __ZN21OZCurveIntSplineState13_instanceOnceE   — std::once_flag word (used by the caller,
  //                                                    not directly by this ctor lambda; modeled
  //                                                    here for API completeness).
  //   __ZN21OZCurveIntSplineState9_instanceE        — OZCurveIntSplineState* published @0x000c0a5f.
  /** @Ozone __ZN21OZCurveIntSplineState13_instanceOnceE — the once_flag word tested by
   *  the outer inlined getInstance() at the caller (`cmpq $-0x1, %rax`). Set to the
   *  sentinel -1 after successful init by __call_once. */
  private static _instanceOnce: -1 | 0 = 0;
  /** @Ozone __ZN21OZCurveIntSplineState9_instanceE — pointer stored @0x000c0a5f
   *  inside the ctor lambda and loaded @0x000c0800 by
   *  OZChannelUint32Impl::OZChannelUint32Impl(). */
  private static _instance: OZCurveIntSplineState | null = null;

  /**
   * OZCurveIntSplineState::getInstance() — synthesized entry point.
   *
   * There is NO separately-exported __ZN21OZCurveIntSplineState11getInstanceEv
   * symbol in Ozone; the outer std::call_once wrapper is inlined into
   * OZChannelUint32Impl::OZChannelUint32Impl() at @0x000c07f0..@0x000c0800. We
   * expose this method here as a faithful re-materialization of that inlined
   * wrapper so downstream ports can call `OZCurveIntSplineState.getInstance()`
   * without duplicating the once-flag dance at every call site.
   *
   * Behaviour mirrors the inlined wrapper: run the ctor lambda exactly once
   * (guarded by _instanceOnce), then return the _instance pointer.
   */
  static getInstance(): OZCurveIntSplineState | null {
    // Fast-path: `cmpq $-0x1, %rax ; je fast-path` at the inlined call site.
    if (OZCurveIntSplineState._instanceOnce !== -1) {
      // Slow-path: __call_once(_instanceOnce, &lambda, __call_once_proxy) —
      // the proxy body @0x000c0a20 is exactly what our private ctor does.
      // If the ctor raises (currently guaranteed because OZSplineState::C2
      // @Ozone 0xa9f0a is undecoded), the once-flag stays at 0 — matching
      // std::call_once semantics where a raising ctor leaves the flag "not
      // yet initialised" (see @0x000c0a58 in the ctor lambda).
      new OZCurveIntSplineState();
      OZCurveIntSplineState._instanceOnce = -1;
    }
    // Fast-path merge: load `_instance` and return it (single-threaded TS
    // model guarantees non-null once past the guard).
    return OZCurveIntSplineState._instance;
  }

  /**
   * ~OZCurveIntSplineState() — Itanium ABI D1 (complete-object destructor).
   * Faithful transcription of __ZN21OZCurveIntSplineStateD1Ev @0x000c0a80.
   *
   * Full disassembly:
   *   @0x000c0a80  pushq %rbp
   *   @0x000c0a81  movq  %rsp, %rbp
   *   @0x000c0a84  popq  %rbp
   *   @0x000c0a85  jmp   __ZN11PCSingletonD2Ev            ; stub 0x6dd63e
   *                                                       ; tail-call PCSingleton::~PCSingleton
   *
   * Degenerate stack frame (created and torn down without spilling anything),
   * then a tail-jmp to PCSingleton::~D2 with %rdi (= `this`) forwarded
   * UNCHANGED — PCSingleton is the primary base at offset 0. There is NO
   * per-class work here and NO explicit destruction of the OZSplineState
   * secondary base @ +0x8 (its dtor is either trivial or inlined-away — the
   * compiler emitted no other calls at this address).
   */
  __dtor_D1(): void {
    // @0x000c0a85 — tail-jmp to PCSingleton::~PCSingleton() (D2).
    this._pcSingletonBase.destroy();
  }

  /**
   * ~OZCurveIntSplineState() — Itanium ABI D0 (deleting destructor).
   * Faithful transcription of __ZN21OZCurveIntSplineStateD0Ev @0x000c0a90.
   *
   * Full disassembly:
   *   @0x000c0a90  pushq %rbp
   *   @0x000c0a91  movq  %rsp, %rbp
   *   @0x000c0a94  pushq %rbx
   *   @0x000c0a95  pushq %rax                              ; 8-byte spill for align
   *   @0x000c0a96  movq  %rdi, %rbx                        ; save this
   *   @0x000c0a99  callq __ZN11PCSingletonD2Ev             ; stub 0x6dd63e
   *   @0x000c0a9e  movq  %rbx, %rdi                        ; %rdi = this
   *   @0x000c0aa1  addq  $0x8, %rsp
   *   @0x000c0aa5  popq  %rbx
   *   @0x000c0aa6  popq  %rbp
   *   @0x000c0aa7  jmp   __ZdlPv                           ; stub 0x6dfc36
   *                                                       ; tail-jmp to operator delete
   *
   * Same as D1 wrt member destruction (only PCSingleton::~D2 is called on the
   * primary base; no per-class or OZSplineState-base cleanup emitted), then
   * tail-jumps to `operator delete(this)`. Modeled by clearing the static
   * _instance slot iff it points at `this` so a future getInstance() would
   * re-run the ctor.
   */
  __dtor_D0(): void {
    // @0x000c0a99 — PCSingleton::~PCSingleton() (D2) on `this`.
    this._pcSingletonBase.destroy();

    // @0x000c0aa7 — tail-jmp to operator delete(this). No manual free in TS;
    // uncouple the static _instance slot when it points at us so future
    // getInstance() calls re-materialize a fresh singleton.
    if (OZCurveIntSplineState._instance === this) {
      OZCurveIntSplineState._instance = null;
      OZCurveIntSplineState._instanceOnce = 0;
    }
    // Citation-only invocation of operator_delete keeps the tail-jmp visible
    // in the ported control flow (throws — that's the demand signal per Rule 3
    // that this call site exists and is not modeled).
    operator_delete(this);
  }
}
