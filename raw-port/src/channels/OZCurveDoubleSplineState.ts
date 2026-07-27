// OZCurveDoubleSplineState — Flexo class whose only decoded surface is the
// Itanium ABI destructor pair. Directly derives from PCSingleton with no
// intervening offset (the PCSingleton subobject IS the whole layout; %rdi on
// entry is passed unchanged to PCSingleton::~PCSingleton() D2 — no  addq
// $0xNN, %rdi  offset adjust step, in contrast to classes like
// FFOZBlindDataCustomUIChannelInfo where PCSingleton lives at +0x50).
//
// The exported symbols are:
//   __ZN24OZCurveDoubleSplineStateD1Ev  @0x0000000001289150  (complete-object dtor)
//   __ZN24OZCurveDoubleSplineStateD0Ev  @0x0000000001289160  (deleting dtor)
// Framework: Flexo.framework
// (getInstance()'s std::call_once payload IS present as
//  __ZNSt3__117__call_once_proxy…OZCurveDoubleSplineState11getInstanceEv…  —
//  a lambda thunk for a lazily-initialized singleton — but no
//  OZCurveDoubleSplineState-owned OZCurveDoubleSplineState::getInstance()
//  symbol is exported; the outer wrapper is inlined into whichever caller
//  uses it, and only the call_once proxy body — a std::__1::tuple bookkeeping
//  helper — has an exported symbol. That helper's body is std::__1 internals
//  and NOT a member of this class, so it is out of scope for this file.)
//
// Body of D1 @0x1289150, byte-for-byte:
//   @0x1289150..@0x1289154  pushq %rbp / movq %rsp,%rbp / popq %rbp
//                           — degenerate stack frame: created and torn down
//                           without ever spilling anything (the compiler
//                           still emits the frame here because -fomit-frame-
//                           pointer is off for this TU).
//   @0x1289155              jmp 0x1495ff4 (symbol stub for __ZN11PCSingletonD2Ev)
//                           — tail-jump to PCSingleton::~PCSingleton() (D2,
//                           base-subobject dtor) with %rdi = `this` UNCHANGED
//                           (no  addq $0xNN, %rdi  step). This is the exact
//                           shape of a "trivial derived class whose base is
//                           at offset 0 and whose own body has nothing to
//                           destroy" dtor — a one-line pass-through.
//
// Body of D0 @0x1289160, byte-for-byte:
//   @0x1289160..@0x1289165  standard prologue (pushq %rbp / movq %rsp,%rbp /
//                           pushq %rbx / pushq %rax — 8-byte spill for align).
//   @0x1289166              movq %rdi, %rbx                — save `this`.
//   @0x1289169              callq 0x1495ff4 (stub __ZN11PCSingletonD2Ev)
//                                                          — destroy PCSingleton
//                                                            base at (this+0x00)
//                                                            (%rdi = `this`,
//                                                            unchanged).
//   @0x128916e              movq %rbx, %rdi                — %rdi = `this`.
//   @0x1289171..@0x1289176  epilogue (addq $0x8,%rsp / popq %rbx / popq %rbp).
//   @0x1289177              jmp 0x1497404 (symbol stub for __ZdlPv)
//                                                          — tail-jmp to operator
//                                                            delete(this).
//
// DECODE — struct layout:
//   +0x00  PCSingleton  base    // sole subobject. Every field beyond +0x00 (if any)
//                               // is entirely a property of PCSingleton's own layout
//                               // — not touched by either dtor of this class.
// sizeof(OZCurveDoubleSplineState) == sizeof(PCSingleton) exactly (there is no
// per-class trailing data — if there were, the dtor pair would either destroy
// it before the base dtor, or the compiler would emit an  addq  to skip past
// it; neither happens here). No per-class fields exist.
//
// Frontier callees (via PLT-style symbol stubs; a stub jmp/callq is a normal
// import redirection, semantically identical to a direct callq to the exported
// symbol for decode purposes):
//   PCSingleton::~PCSingleton() (D2)  stub 0x1495ff4   called @0x1289155 (D1 tail-jmp)
//                                                              @0x1289169 (D0 call)
//   operator delete (__ZdlPv)         stub 0x1497404   called @0x1289177 (D0 tail-jmp)

import { PCSingleton } from "../infra/PCSingleton";

/**
 * `operator delete(void*)` — libc++ / system runtime allocator hook. Tail-jumped
 * from D0 @0x1289177 via  jmp 0x1497404 (symbol stub for __ZdlPv). Not modeled
 * in TS (GC handles freeing); throwing stub keeps the call site honest.
 */
function operator_delete(_p: OZCurveDoubleSplineState): void {
  // jmpq 0x1497404 (symbol stub for __ZdlPv)  @0x1289177
  throw new Error(
    "operator delete (__ZdlPv) not modeled in the TS port; JS/TS objects are GC'd. Cited call site: OZCurveDoubleSplineState::~OZCurveDoubleSplineState() D0 @0x1289177"
  );
}

/**
 * OZCurveDoubleSplineState — Flexo class, decoded surface = dtor pair, direct
 * PCSingleton derivative (base at offset 0, no per-class fields).
 *
 * Modeled as a plain class that *contains* a PCSingleton subobject (rather
 * than `extends PCSingleton`) for symmetry with the rest of the raw-port and
 * because we have not observed a ctor to faithfully transcribe base-class
 * initialization here; the composition-not-inheritance modeling still makes
 * the "delegate to base D2" step explicit and lossless — it exactly mirrors
 * the  jmp/callq PCSingleton::~D2  in the asm.
 */
export class OZCurveDoubleSplineState {
  /** +0x00 PCSingleton base subobject — sole per-instance field. */
  readonly base: PCSingleton;

  constructor(base: PCSingleton) {
    // No ctor is exported for OZCurveDoubleSplineState in Flexo's symbol table
    // (only D1/D0 are visible plus the std::call_once proxy for a
    // getInstance() lambda that IS NOT decoded here — its outer wrapper is
    // inlined into callers). We therefore do NOT transcribe any decoded ctor
    // body here — the caller supplies the pre-constructed PCSingleton base.
    this.base = base;
  }

  /**
   * ~OZCurveDoubleSplineState — Itanium ABI D1 (complete-object destructor).
   * Faithful transcription of __ZN24OZCurveDoubleSplineStateD1Ev @0x1289150.
   *
   * The body reduces to a single tail-jump to PCSingleton::~D2 (@0x1289155)
   * with %rdi (= `this`) forwarded unchanged. There is NO per-class work to
   * do between the empty prologue-then-epilogue and the tail-jmp.
   */
  __dtor_D1(): void {
    // @0x1289155 — tail-jmp to PCSingleton::~PCSingleton() (D2 base-subobject
    // dtor) on `this` (identity-mapped, no offset adjust). PCSingleton.destroy()
    // is the raw-port's transcription of the same D2 body (see
    // raw-port/src/infra/PCSingleton.ts).
    this.base.destroy();
  }

  /**
   * ~OZCurveDoubleSplineState — Itanium ABI D0 (deleting destructor).
   * Faithful transcription of __ZN24OZCurveDoubleSplineStateD0Ev @0x1289160.
   *
   * Differs from D1 only in the tail: instead of tail-JUMPING to
   * PCSingleton::~D2, D0 CALLS PCSingleton::~D2 @0x1289169 and then tail-jumps
   * to operator delete(this) at @0x1289177.
   */
  __dtor_D0(): void {
    // @0x1289169 — PCSingleton::~PCSingleton() (D2) on `this`.
    this.base.destroy();

    // @0x1289177 — tail-jmp to operator delete(this).
    operator_delete(this);
  }
}

