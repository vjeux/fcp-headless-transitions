// PCException_AttributeUndefined.ts — FCP ProCore PCException_AttributeUndefined:
// a concrete PCException subclass thrown when a required attribute is not defined.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProCore.PCException_AttributeUndefined.*.s.
//
// SYMBOLS:
//   __ZN30PCException_AttributeUndefinedC1Ev  @0x0002e1b8   (ctor)
//   __ZN30PCException_AttributeUndefinedD1Ev  @0x0002e1d8   (base dtor D1)
//   __ZN30PCException_AttributeUndefinedD0Ev  @0x0002e6c8   (deleting dtor D0)
//
// INHERITANCE: PCException_AttributeUndefined : PCException (single inheritance,
// base at offset 0 — confirmed by ctor calling PCException::PCException() with
// the same `this` in %rbx, and D0 calling PCException::~PCException with the
// same `this`).
//
// INSTANCE LAYOUT: only field observed by these three fns is the vtable slot:
//   +0x00  vtable ptr  (written by ctor at @0x0002e1cd from `leaq 0x11bbe3(%rip),%rax`;
//                       target = 0x0002e1cd + 0x11bbe3 = 0x00149DB0
//                       = &vtable-for-PCException_AttributeUndefined).
// All other fields are inherited from PCException (un-decoded here — see PCException.ts
// when it's ported).

// --- Un-ported parent class ------------------------------------------------
export interface PCException {
  /** Opaque view over PCException's own fields. */
  readonly _pcexc_opaque: never;
}
function PCException_C2(_this: PCException): void {
  // __ZN11PCExceptionC2Ev @0x0002e1c1 (called from our ctor) — not yet transcribed.
  throw new Error("PCException::PCException() @0x0002e1c1 (base ctor) not yet transcribed");
}
function PCException_D2(_this: PCException): void {
  // __ZN11PCExceptionD2Ev  (base dtor) — called from both D0 @0x0002e6d1 and
  // D1 @0x0002e1dd; not yet transcribed.
  throw new Error("PCException::~PCException() (D2) not yet transcribed — required by @0x0002e1dd / @0x0002e6d1");
}
function operator_delete(_ptr: unknown): void {
  // __ZdlPv (@0xde6c0 __stubs entry).  Tail-called by D0; no-op under GC.
}

/**
 * Tag for the vtable pointer installed by C1 at @0x0002e1cd.
 * Address computed as (rip-after-leaq=0x0002e1cd) + 0x11bbe3 = 0x00149DB0.
 * The slot contents (which method fills each vtable index) are NOT decoded
 * from this file's disasms — they belong to PCException_AttributeUndefined's
 * virtual overrides (e.g. `what()`), out of task scope.
 */
const PCEXCEPTION_ATTRIBUTEUNDEFINED_VTABLE_AT_0x00149DB0 = Symbol(
  "PCException_AttributeUndefined::vtable @0x00149DB0",
);

export class PCException_AttributeUndefined {
  readonly _asPCException: PCException;
  /** +0x00 vtable slot — set by ctor at @0x0002e1cd, read by any virtual call. */
  _vtable: symbol;

  /**
   * PCException_AttributeUndefined::PCException_AttributeUndefined()  @0x0002e1b8
   *
   * ASM (@0x0002e1b8..@0x0002e1d6):
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax   ; prologue
   *   movq  %rdi,%rbx                                          @0x2e1be  ; rbx = this
   *   callq __ZN11PCExceptionC2Ev                              @0x2e1c1  ; base ctor
   *   leaq  0x11bbe3(%rip),%rax                                @0x2e1c6  ; rax = &vtable @0x00149DB0
   *   movq  %rax,(%rbx)                                        @0x2e1cd  ; this->vtable = rax
   *   addq  $0x8,%rsp / popq %rbx / popq %rbp / retq           ; epilogue
   *
   * Standard Itanium-ABI ctor: base ctor, then install our own vtable pointer
   * at offset +0x00.
   */
  constructor(base: PCException) {
    this._asPCException = base;
    // @0x0002e1c1: base ctor (throws stub — un-ported).
    PCException_C2(this._asPCException);
    // @0x0002e1cd: install our vtable at +0x00.
    this._vtable = PCEXCEPTION_ATTRIBUTEUNDEFINED_VTABLE_AT_0x00149DB0;
  }

  /**
   * PCException_AttributeUndefined::~PCException_AttributeUndefined()  (D1 non-deleting)  @0x0002e1d8
   *
   * ASM (@0x0002e1d8..@0x0002e1dd):
   *   pushq %rbp
   *   movq  %rsp,%rbp
   *   popq  %rbp
   *   jmp   __ZN11PCExceptionD2Ev
   *
   * Pure tail-jmp to base dtor.  No own fields to release; the vtable slot is
   * about to be overwritten by base's own vtable install (per Itanium ABI dtor
   * semantics), so we don't clear it.
   */
  destroyBase(): void {
    // @0x0002e1dd
    PCException_D2(this._asPCException);
  }

  /**
   * PCException_AttributeUndefined::~PCException_AttributeUndefined()  (D0 deleting)  @0x0002e6c8
   *
   * ASM (@0x0002e6c8..@0x0002e6df):
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   movq  %rdi,%rbx                                          @0x2e6ce
   *   callq __ZN11PCExceptionD2Ev                              @0x2e6d1
   *   movq  %rbx,%rdi                                          @0x2e6d6
   *   addq  $0x8,%rsp / popq %rbx / popq %rbp
   *   jmp   __ZdlPv                                            @0x2e6df   ; operator delete(this)
   *
   * Standard Itanium-ABI deleting-dtor: base D2, then operator delete.
   */
  destroyAndDelete(): void {
    // @0x0002e6d1
    PCException_D2(this._asPCException);
    // @0x0002e6df
    operator_delete(this);
  }
}
