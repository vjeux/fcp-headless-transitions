// PCLMProblem.ts — ProCore's abstract base for Levenberg–Marquardt problems.
// Faithful transcription of the four exported symbols in ProCore.framework:
//
//   @0x00000000000b6bac  PCLMProblem::PCLMProblem()               C2 (base ctor)
//                        __ZN11PCLMProblemC2Ev
//   @0x00000000000b6bbc  PCLMProblem::~PCLMProblem()              D2 (base dtor)
//                        __ZN11PCLMProblemD2Ev
//   @0x00000000000dde62  PCLMProblem::~PCLMProblem()              D1 (complete)
//                        __ZN11PCLMProblemD1Ev
//   @0x00000000000dde68  PCLMProblem::~PCLMProblem()              D0 (deleting)
//                        __ZN11PCLMProblemD0Ev
//
// VTABLE (via `resolve.py ProCore vtable PCLMProblem` —
//   __ZTV11PCLMProblem @0x14c738; installed pointer = 0x14c748):
//   *0x00 -> 0x000dde62  PCLMProblem::~PCLMProblem()   D1
//   *0x08 -> 0x000dde68  PCLMProblem::~PCLMProblem()   D0
//   *0x10 -> 0x00000314  __cxa_pure_virtual  (pure virtual slot)
//   *0x18 -> 0x00000314  __cxa_pure_virtual  (pure virtual slot)
//   *0x20 -> 0x00000314  __cxa_pure_virtual  (pure virtual slot)
//   *0x28 -> 0x0                (nul terminator — end of PCLMProblem's own vtable body)
//
// So PCLMProblem is an ABSTRACT base with:
//   - 2 destructor slots (D1/D0)
//   - 3 pure virtual method slots — resolved by concrete subclasses.
//
// Cross-check: PCMatchmoveProblem derives from PCLMProblem and its vtable
// (also in __ZTV18PCMatchmoveProblem @0x14c7d8) fills the same three slot
// positions (@0x14c7d8 + 0x68/0x70/0x78) with:
//   *0x68 -> PCMatchmoveProblem::setX(PCGenVector<float> const&)   @0xb9b9e
//   *0x70 -> PCMatchmoveProblem::evalY(PCGenVector<float>&)        @0xb9bfa
//   *0x78 -> PCMatchmoveProblem::evalDy(PCGenMatrix<float>&)       @0xb9c32
// — i.e. the 3 pure-virtual slots in PCLMProblem are: setX, evalY, evalDy
// (the standard Levenberg–Marquardt interface: bind parameters, compute
// residuals, compute Jacobian).
//
// Frontier / external symbols:
//   __cxa_pure_virtual @ProCore 0x314 — Itanium ABI trap-on-pure-virtual-call.
//   __ZdaPv            @ProCore stub  — operator delete[](void*). NOT called
//                                       by any PCLMProblem code path here;
//                                       otool -tV linearly bleeds the next
//                                       function into the D0 dump but the
//                                       actual D0 body ends at `ud2` @0xdde6c.
//   PCLMProblem C1 (complete-ctor mangling) has NO body in the binary — the
//   base ctor C2 covers all construction (there are no virtual bases, so C1
//   is aliased to C2 by the linker/ABI).

/**
 * `__cxa_pure_virtual` — Itanium ABI stub installed in the three unresolved
 * slots of PCLMProblem's vtable. Any attempt to invoke a pure-virtual
 * method on a bare PCLMProblem traps into this function. Not decoded here
 * (@ProCore 0x314); modeled as a throwing stub.
 */
function __cxa_pure_virtual(): never {
  throw new Error(
    "__cxa_pure_virtual @ProCore 0x314 called — pure-virtual PCLMProblem " +
      "method invoked on a non-derived instance",
  );
}

/**
 * Forward-declarations for the two ProCore template types that parameterize
 * the pure-virtual interface (only their names appear in mangled derived-
 * class symbols). They are never dereferenced inside PCLMProblem itself.
 */
export interface PCGenVector<T> {
  __phantom?: T;
}
export interface PCGenMatrix<T> {
  __phantom?: T;
}

/**
 * `PCLMProblem` — abstract root of ProCore's Levenberg–Marquardt problem
 * hierarchy. Concrete subclasses (e.g. PCMatchmoveProblem) provide:
 *   - `setX(v)`   : bind the parameter vector.
 *   - `evalY(y)`  : compute the residual vector.
 *   - `evalDy(J)` : compute the Jacobian matrix.
 *
 * The class has ONE observable field: the vtable pointer at +0x00.
 * No data members are touched by any of the four exported bodies.
 */
export class PCLMProblem {
  /**
   * @ProCore PCLMProblem +0x00 — vtable pointer. Installed by the base
   * ctor @0xb6bb0..@0xb6bb7 via `leaq 0x95b91(%rip),%rax ; movq %rax,(%rdi)`.
   * The RIP-relative target resolves to 0x000b6bb0 + 7 + 0x95b91 = 0x14c748
   * — the installed pointer for __ZTV11PCLMProblem (base+0x10).
   */
  vptr_at_0x00: string = "";

  /**
   * `PCLMProblem::PCLMProblem()` C2 (base ctor) @ProCore 0xb6bac
   * (__ZN11PCLMProblemC2Ev).
   *
   * Full body (all @ProCore):
   *   0xb6bac  pushq %rbp / movq %rsp, %rbp
   *   0xb6bb0  leaq  0x95b91(%rip), %rax          ; rax = &__ZTV11PCLMProblem + 0x10
   *                                                = 0x14c748 (installed vptr)
   *   0xb6bb7  movq  %rax, (%rdi)                 ; this->+0x00 = vptr
   *   0xb6bba  popq  %rbp / retq
   *
   * There is no separate C1 (complete-ctor) body in the binary — the linker
   * aliases C1 to C2 (no virtual bases → identical construction).
   */
  constructor() {
    // @0xb6bb0..@0xb6bb7 — install PCLMProblem's vtable pointer at +0x00.
    this.vptr_at_0x00 = "__ZTV11PCLMProblem+0x10";
  }

  /**
   * `PCLMProblem::~PCLMProblem()` D2 (base dtor) @ProCore 0xb6bbc
   * (__ZN11PCLMProblemD2Ev).
   *
   * Full body (all @ProCore):
   *   0xb6bbc  pushq %rbp / movq %rsp, %rbp
   *   0xb6bc0  popq  %rbp / retq
   *
   * Empty body — the class owns no fields needing teardown at the base-
   * subobject level. This is the dtor invoked by derived-class D2 dtors.
   */
  destructor_D2(): void {
    // @0xb6bbc..@0xb6bc1 — empty body, just prologue/epilogue.
  }

  /**
   * `PCLMProblem::~PCLMProblem()` D1 (complete dtor) @ProCore 0xdde62
   * (__ZN11PCLMProblemD1Ev). Also the slot-0 vtable entry.
   *
   * Full body (all @ProCore):
   *   0xdde62  pushq %rbp / movq %rsp, %rbp
   *   0xdde66  ud2                              ; illegal instruction — trap
   *
   * The `ud2` @0xdde66 marks this destructor as "never callable": the compiler
   * emitted it because the ABI requires a symbol for the vtable slot, but
   * PCLMProblem's C++ definition either declares the destructor `= delete`
   * or the class is otherwise non-destructible-in-place. The trailing bytes
   * (up to the next function boundary @0xdde68) are dead padding.
   */
  destructor_D1(): never {
    // @0xdde66 — `ud2`: illegal instruction, always traps.
    throw new Error(
      "PCLMProblem::~PCLMProblem() D1 @ProCore 0xdde62 — ud2 trap (deleted/" +
        "unreachable destructor). This vtable slot exists only to satisfy the " +
        "Itanium ABI; concrete subclasses override it (e.g. PCMatchmoveProblem::" +
        "~PCMatchmoveProblem() @0xb8aaa).",
    );
  }

  /**
   * `PCLMProblem::~PCLMProblem()` D0 (deleting dtor) @ProCore 0xdde68
   * (__ZN11PCLMProblemD0Ev). Also the slot-1 vtable entry.
   *
   * Full body (all @ProCore):
   *   0xdde68  pushq %rbp / movq %rsp, %rbp
   *   0xdde6c  ud2                              ; illegal instruction — trap
   *
   * Same `ud2` pattern as D1: the deleting destructor is unreachable. The
   * bytes at @0xdde6e..@0xdde85 look like a small operator-delete[] wrapper
   * (`addq $-0x8,%rdi ; callq __ZdaPv`), but that is a linear-sweep decode
   * of the NEXT function's bytes bleeding into this dump; the real body of
   * D0 ends at the `ud2`.
   */
  destructor_D0(): never {
    // @0xdde6c — `ud2`: illegal instruction, always traps.
    throw new Error(
      "PCLMProblem::~PCLMProblem() D0 @ProCore 0xdde68 — ud2 trap (deleted/" +
        "unreachable deleting destructor). This vtable slot exists only to " +
        "satisfy the Itanium ABI; concrete subclasses override it.",
    );
  }

  /**
   * VTABLE SLOT 2 (pure virtual) — bound to `__cxa_pure_virtual` @ProCore
   * 0x314 in the base vtable. Concrete subclasses fill it with `setX`
   * (see PCMatchmoveProblem::setX @0xb9b9e).
   *
   * Signature recovered from the derived-class override:
   *   void setX(PCGenVector<float> const& x)
   */
  setX(_x: PCGenVector<number>): void {
    // Slot @0x14c748 +0x10 -> 0x314 __cxa_pure_virtual.
    __cxa_pure_virtual();
  }

  /**
   * VTABLE SLOT 3 (pure virtual) — bound to `__cxa_pure_virtual` @ProCore
   * 0x314 in the base vtable. Concrete subclasses fill it with `evalY`
   * (see PCMatchmoveProblem::evalY @0xb9bfa).
   *
   * Signature recovered from the derived-class override:
   *   void evalY(PCGenVector<float>& y)
   */
  evalY(_y: PCGenVector<number>): void {
    // Slot @0x14c748 +0x18 -> 0x314 __cxa_pure_virtual.
    __cxa_pure_virtual();
  }

  /**
   * VTABLE SLOT 4 (pure virtual) — bound to `__cxa_pure_virtual` @ProCore
   * 0x314 in the base vtable. Concrete subclasses fill it with `evalDy`
   * (see PCMatchmoveProblem::evalDy @0xb9c32).
   *
   * Signature recovered from the derived-class override:
   *   void evalDy(PCGenMatrix<float>& J)
   */
  evalDy(_j: PCGenMatrix<number>): void {
    // Slot @0x14c748 +0x20 -> 0x314 __cxa_pure_virtual.
    __cxa_pure_virtual();
  }
}
