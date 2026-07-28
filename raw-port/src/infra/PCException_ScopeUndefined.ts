// @class PCException_ScopeUndefined (ProCore)
//
// DECODE from re/disasm/ProCore.PCException_ScopeUndefined.*.s.
//
// A thin PCException subclass — "scope-undefined" error type. All three ported
// symbols are trivial:
//
//   @0x2d9ee  PCException_ScopeUndefined::PCException_ScopeUndefined()   [C1]
//   @0x2da0e  PCException_ScopeUndefined::~PCException_ScopeUndefined()  [D1 — tail-call to base dtor]
//   @0x2e690  PCException_ScopeUndefined::~PCException_ScopeUndefined()  [D0 — deleting dtor]
//
// EXACT DISASM SEMANTICS:
//
//   __ZN26PCException_ScopeUndefinedC1Ev @ 0x2d9ee:
//     callq __ZN11PCExceptionC2Ev                     ; @0x2d9f7 — base ctor
//     leaq  0x11c32d(%rip), %rax                      ; @0x2d9fc
//     movq  %rax, (%rbx)                              ; @0x2da03 — install vptr
//     ret
//     ; next-instr addr @0x2da03 + disp 0x11c32d = 0x149d30  (vptr value = vtable + 0x10;
//     ;  vtable object base = 0x149d20 per Itanium C++ ABI).
//
//   __ZN26PCException_ScopeUndefinedD1Ev @ 0x2da0e:
//     jmp   __ZN11PCExceptionD2Ev                     ; tail-call to base dtor
//
//   __ZN26PCException_ScopeUndefinedD0Ev @ 0x2e690:
//     callq __ZN11PCExceptionD2Ev                     ; @0x2e699 — base dtor
//     jmp   __ZdlPv                                    ; @0x2e6a7 — operator delete
//
// The subclass has no owned resources beyond the vptr — it exists solely as a
// distinct RTTI type used at throw sites to signal "scope undefined".
//
// FRONTIER callees (base class un-decoded; stubs below throw citing addr):
//   • PCException::PCException()   (__ZN11PCExceptionC2Ev)
//   • PCException::~PCException()  (__ZN11PCExceptionD2Ev)
//   • operator delete(void*)       (__ZdlPv)

/** @0x149d20 vtable object for PCException_ScopeUndefined in ProCore __DATA;
 *  cited from ctor @0x2d9fc (leaq 0x11c32d(%rip) → 0x2da03+0x11c32d = 0x149d30 = base+0x10). */
export const PCException_ScopeUndefined_VTABLE_ADDR = 0x149d20;

/** Frontier: base PCException class not yet ported. */
export class PCException {
  /** @0x?????? PCException::PCException() — not yet ported. */
  constructor() {
    throw new Error(
      "PCException::PCException() — base class not ported " +
        "(callee __ZN11PCExceptionC2Ev, called from " +
        "PCException_ScopeUndefined::ctor @0x2d9f7)"
    );
  }

  /** @0x?????? PCException::~PCException() — not yet ported. */
  destroy(): void {
    throw new Error(
      "PCException::~PCException() — base class not ported " +
        "(callee __ZN11PCExceptionD2Ev, tail-called from " +
        "PCException_ScopeUndefined::~ctor @0x2da13, called from D0 @0x2e699)"
    );
  }
}

/**
 * PCException_ScopeUndefined — "scope undefined" flavored ProCore exception.
 *
 * No data members beyond what the vptr install implies. Present only to give
 * distinct RTTI at throw sites.
 */
export class PCException_ScopeUndefined extends PCException {
  /** vptr value written into *this at @0x2da03. */
  readonly __vptr: number = PCException_ScopeUndefined_VTABLE_ADDR + 0x10;

  /**
   * @0x2d9ee  PCException_ScopeUndefined::PCException_ScopeUndefined()
   *
   * Asm:
   *   callq PCException::PCException()   ; @0x2d9f7
   *   store subclass vptr into *this      ; @0x2d9fc..0x2da03
   */
  constructor() {
    super(); // @0x2d9f7 → base ctor (throwing stub)
    // @0x2d9fc/2da03: vptr install — captured by the __vptr field above.
  }

  /**
   * @0x2da0e  PCException_ScopeUndefined::~PCException_ScopeUndefined()  (D1)
   *
   * Bare `jmp __ZN11PCExceptionD2Ev` — pure tail-call to base dtor.
   */
  destroy(): void {
    super.destroy(); // @0x2da13 → base dtor (throwing stub)
  }

  /**
   * @0x2e690  PCException_ScopeUndefined::~PCException_ScopeUndefined()  (D0 — deleting dtor)
   *
   * callq PCException::~PCException() ; @0x2e699
   * jmp   __ZdlPv                     ; @0x2e6a7  (no JS analogue — GC handles storage)
   */
  destroyAndDelete(): void {
    super.destroy(); // @0x2e699 → base dtor (throwing stub)
    // @0x2e6a7 — operator delete, no JS analogue.
  }
}
