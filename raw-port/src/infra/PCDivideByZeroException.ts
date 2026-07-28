// @class PCDivideByZeroException (ProCore)
//
// DECODE from re/disasm/ProCore.PCDivideByZeroException.*.s.
//
// A PCException subclass. Three ported symbols:
//   @0x6750c  PCDivideByZeroException::~PCDivideByZeroException()          [D1]
//   @0x6789a  PCDivideByZeroException::~PCDivideByZeroException()          [D0 — deleting]
//   @0x678b6  PCDivideByZeroException::className() const                    (returns PCString)
//
// EXACT DISASM SEMANTICS:
//
//   __ZN23PCDivideByZeroExceptionD1Ev @ 0x6750c:
//     jmp __ZN11PCExceptionD2Ev
//   → bare tail-call to base dtor; no subclass state.
//
//   __ZN23PCDivideByZeroExceptionD0Ev @ 0x6789a:
//     callq __ZN11PCExceptionD2Ev   ; @0x678a3
//     jmp   __ZdlPv                  ; @0x678b1 — operator delete
//
//   __ZNK23PCDivideByZeroException9classNameEv @ 0x678b6:
//     (returns-by-value: hidden ret-slot is rdi)
//     movq  %rdi, %rbx                       ; save ret-slot ptr
//     leaq  0xe6632(%rip), %rsi               ; @0x678bf — Objc cfstring ref
//                                             ; effective addr = 0x678c6 + 0xe6632 = 0x14def8
//     callq PCString::PCString(__CFString const*)  ; @0x678c6
//     movq  %rbx, %rax                        ; return the ret-slot ptr
//     ret
//
//   → className() constructs a PCString from a fixed CFStringRef literal
//     stored at ProCore __DATA @0x14def8. The exact CFString content is not
//     needed by pure semantics — every classname comparison is against another
//     PCString-of-CFString or the CFStringRef identity — so we treat the
//     backing CFString as an opaque handle at that address.
//
// FRONTIER callees (base + PCString un-decoded; stubs cite their symbols):
//   • PCException::~PCException()              (__ZN11PCExceptionD2Ev)
//   • PCString::PCString(__CFString const*)    (__ZN8PCStringC1EPK10__CFString)
//   • operator delete(void*)                   (__ZdlPv)

/** @0x14def8 CFStringRef literal in ProCore __DATA (className identity token).
 *  Cited from disasm at @0x678bf (leaq 0xe6632(%rip) → 0x678c6 + 0xe6632 = 0x14def8). */
export const PCDivideByZeroException_CLASSNAME_CFSTRING_ADDR = 0x14def8;

/** Frontier: base PCException — not yet ported here. */
export class PCException {
  /** @0x?????? PCException::~PCException() — not yet ported. */
  destroy(): void {
    throw new Error(
      "PCException::~PCException() — base class not ported " +
        "(callee __ZN11PCExceptionD2Ev, tail-called from " +
        "PCDivideByZeroException D1 @0x67511 and D0 @0x678a3)"
    );
  }
}

/** Frontier: PCString — not yet ported. Placeholder handle type. */
export interface PCString {
  readonly _cfStringAddr: number;
}

/** @0x?????? PCString::PCString(__CFString const*) — not yet ported.
 *  Called from PCDivideByZeroException::className @0x678c6. */
function PCString_ctor_fromCFString(_this: unknown, cfstrAddr: number): PCString {
  // Faithful placeholder: real ctor would take ownership of the ref-counted
  // CFString handle. We tag the result with the source address so callers
  // can compare classname identities without decoding the literal.
  return { _cfStringAddr: cfstrAddr } as PCString;
}

/**
 * PCDivideByZeroException — "divide by zero" flavor of PCException.
 */
export class PCDivideByZeroException extends PCException {
  /**
   * @0x6750c  PCDivideByZeroException::~PCDivideByZeroException()  (D1)
   *
   * Bare `jmp __ZN11PCExceptionD2Ev` — tail-call to base dtor.
   */
  destroy(): void {
    super.destroy(); // @0x67511 → base dtor (throwing stub)
  }

  /**
   * @0x6789a  PCDivideByZeroException::~PCDivideByZeroException()  (D0 — deleting)
   *
   * callq PCException::~PCException()  ; @0x678a3
   * jmp   __ZdlPv                       ; @0x678b1 (GC-managed in JS)
   */
  destroyAndDelete(): void {
    super.destroy(); // @0x678a3 → base dtor (throwing stub)
    // @0x678b1 — operator delete; no JS analogue.
  }

  /**
   * @0x678b6  PCDivideByZeroException::className() const
   *
   * Returns `PCString(CFSTR("...") @ 0x14def8)`. In C++ the return is by-value
   * via a hidden ret-slot in rdi; in TS/JS we just return the constructed
   * value directly.
   */
  className(): PCString {
    // @0x678bf/c6: PCString::PCString(&ret_slot, CFSTR@0x14def8)
    return PCString_ctor_fromCFString(
      /* &ret_slot */ null,
      PCDivideByZeroException_CLASSNAME_CFSTRING_ADDR
    );
  }
}
