// PCSystemException.ts — ProCore's PCSystemException, a concrete C++
// exception subclass of PCException used to signal system-level errors.
// Faithful transcription of ALL three externally-visible PCSystemException
// methods from /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.
// framework/Versions/A/ProCore.
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.PCSystemException.D1.s               @0x34418  (D1)
//   raw-port/re/disasm/ProCore.PCSystemException.~PCSystemException.s @0x34852  (D0)
//   raw-port/re/disasm/ProCore.PCSystemException.className.s        @0x3486e
//
// nm confirms these are the ONLY externally-visible PCSystemException
// methods (the C1/C2 ctors are not present — this class is only ever
// constructed via one of the four inlined ctors seen at
// call sites @0x343c9, @0x3451d, @0x345cb, @0x34644 which install the
// vtable pointer and forward to PCException::PCException() directly).
//
// ---------------------------------------------------------------------------
// VTABLE (resolved via `resolve.py ProCore vtable PCSystemException`,
//         base @0x149e90, installed ptr 0x149ea0, i.e. base+0x10 typeinfo header):
//     *0x00 -> 0x34418  PCSystemException::~PCSystemException()  [D1, non-deleting]
//     *0x08 -> 0x34852  PCSystemException::~PCSystemException()  [D0, deleting]
//     *0x10 -> 0x2bf8c  PCException::what() const                [inherited]
//     *0x18 -> 0x3486e  PCSystemException::className() const     [override]
//     *0x20 -> 0x2c058  PCException::callStackSymbols() const    [inherited]
//     *0x28 -> 0x2db8   PCException::report() const              [inherited]
// (Slots at *0x30+ belong to the adjacent PCAudioBuffer vtable — visible in
//  the raw dump because ProCore packs unrelated vtables in a single __const
//  region; they are NOT part of PCSystemException's vtable.)
//
// ---------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from ctor install sites and the D1 dtor which
// tail-calls PCException::~PCException() with no subclass-local cleanup):
//   PCSystemException derives from PCException with no new fields:
//     +0x00  vtbl : *const void   // "installed vtable pointer" = 0x149ea0
//     +0x08... PCException's own fields (undecoded here — porting deferred).
//
// ---------------------------------------------------------------------------
// Cited callees:
//   PCException::~PCException()          @ProCore  __ZN11PCExceptionD2Ev
//                                        invoked @0x3441d (D1 tail-jmp) and
//                                        @0x3485b (D0 call).
//   operator delete(void*)               @ProCore  __stubs 0xde6c0  (__ZdlPv)
//                                        tail-jumped @0x34869 (D0 final free).
//   PCString::PCString(__CFString const*) @ProCore 0x31f32
//                                        called @0x3487e (className body).
//
// Cited constants:
//   __CFString "PCSystemException"       @ProCore 0x14da98  (__DATA_CONST,
//                                         __cfstring; length 17; payload C-string
//                                         "PCSystemException" at __TEXT,__cstring
//                                         file-offset 1255314). Loaded via
//                                         `leaq 0x11921a(%rip),%rsi` @0x34877
//                                         (RIP=0x3487e; 0x3487e+0x11921a=0x14da98).

import { PCString } from "./PCString";

// ---------------------------------------------------------------------------
// PCException stubs (undecoded — the base class is not yet transcribed).
// ---------------------------------------------------------------------------

/** PCException — base class of PCSystemException. Not fully ported yet;
 *  surfaced as an opaque brand so the vtable inheritance chain type-checks. */
export interface PCException {
  /** +0x00 vtbl — installed vtable pointer written by whichever ctor built us. */
  vtbl: number;
}

/**
 * PCException::~PCException()  [D2 base-object dtor]              @ProCore __ZN11PCExceptionD2Ev
 * @stub — invoked from PCSystemException D1 @0x3441d (tail-jmp) and
 *         D0 @0x3485b (call). Base class not ported yet.
 */
function pcException_base_dtor_stub(_self: PCSystemException): void {
  throw new Error(
    "PCException::~PCException() [D2] not ported — called from " +
      "PCSystemException D1@0x3441d / D0@0x3485b (ProCore __ZN11PCExceptionD2Ev)",
  );
}

/**
 * operator delete(void*)  (libc++abi __ZdlPv) — tail-jumped from the D0
 * deleting dtor @0x34869. In a GC'd runtime this is a no-op; expressed here
 * so the control flow matches the disasm exactly.
 */
function operator_delete_stub(_this: PCSystemException): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // 0x34869 (`jmp 0xde6c0  ## symbol stub for: __ZdlPv`).
}

// ---------------------------------------------------------------------------
// The installed vtable pointer written into `(this)` by the (inlined) ctors.
// Cited from the vtable base @0x149e90 + 0x10 typeinfo header = 0x149ea0.
// See file header for the full vtable slot map.
// ---------------------------------------------------------------------------
const _pc_system_exception_installed_vptr = 0x149ea0;

// ---------------------------------------------------------------------------
// The class
// ---------------------------------------------------------------------------

/** PCSystemException — thrown to signal a system-level error.
 *  Concrete subclass of PCException. Overrides only className(); what(),
 *  callStackSymbols(), and report() are inherited via the vtable. */
export class PCSystemException implements PCException {
  /** +0x00 vtbl. The "installed vtable pointer" written by whichever inlined
   *  ctor built this object (@ProCore 0x149ea0 = 0x149e90 + 0x10 typeinfo). */
  vtbl: number = _pc_system_exception_installed_vptr;

  /**
   * PCSystemException::~PCSystemException() — D1 non-deleting dtor  @ProCore 0x34418
   *
   * Pure trampoline into the base dtor:
   *
   *    @0x34418  pushq %rbp
   *    @0x34419  movq  %rsp, %rbp
   *    @0x3441c  popq  %rbp
   *    @0x3441d  jmp   __ZN11PCExceptionD2Ev            ; PCException::~PCException()
   *
   * The `jmp` (tail-call) instead of `call`+`ret` is a compiler tail-call
   * optimization; the observable behavior is identical. No subclass-local
   * fields to finalize (PCSystemException adds none).
   */
  destroy_D1(): void {
    // @0x3441d — jmp PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
  }

  /**
   * PCSystemException::~PCSystemException() — D0 deleting dtor  @ProCore 0x34852
   *
   * Runs the base dtor then tail-jumps into `operator delete(this)`:
   *
   *    @0x34852  pushq %rbp / movq %rsp,%rbp
   *    @0x34856  pushq %rbx                            ; save
   *    @0x34857  pushq %rax                            ; align (dummy)
   *    @0x34858  movq  %rdi, %rbx                      ; rbx = this
   *    @0x3485b  callq __ZN11PCExceptionD2Ev           ; PCException::~PCException()
   *    @0x34860  movq  %rbx, %rdi                      ; rdi = this (arg for op delete)
   *    @0x34863  addq  $0x8, %rsp                      ; unwind align
   *    @0x34867  popq  %rbx / popq %rbp
   *    @0x34869  jmp   __ZdlPv                         ; operator delete(void*)
   */
  destroy_D0(): void {
    // @0x3485b — call PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
    // @0x34869 — tail jmp to operator delete(this) (GC'd runtime no-op).
    operator_delete_stub(this);
  }

  /**
   * PCSystemException::className() const                          @ProCore 0x3486e
   *
   * Vtable *0x18 override. Returns the constant PCString "PCSystemException":
   *
   *    @0x3486e  pushq %rbp / movq %rsp,%rbp
   *    @0x34872  pushq %rbx                             ; save
   *    @0x34873  pushq %rax                             ; align (dummy)
   *    @0x34874  movq  %rdi, %rbx                       ; rbx = out (sret) PCString*
   *    @0x34877  leaq  0x11921a(%rip), %rsi             ; rsi = 0x14da98
   *                                                    ;   (__CFString @__DATA_CONST,
   *                                                    ;    __cfstring, len 17;
   *                                                    ;    payload C-string
   *                                                    ;    "PCSystemException" at
   *                                                    ;    __TEXT,__cstring
   *                                                    ;    file-offset 1255314).
   *    @0x3487e  callq __ZN8PCStringC1EPK10__CFString   ; PCString::PCString(CFString*)
   *    @0x34883  movq  %rbx, %rax                       ; return the sret pointer
   *    @0x34886  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
   *
   * Note the ABI: PCString is returned by value, so %rdi holds the caller-
   * provided sret buffer and %rsi holds the __CFString*. `this` (the const
   * PCSystemException*) is NOT used — className() is a pure constant returning
   * the class-name literal.
   *
   * In this TS port we return a new PCString wrapping the literal — the
   * class name payload is read verbatim from ProCore's __cstring segment
   * (file offset 1255314, string "PCSystemException"), not invented.
   */
  className(): PCString {
    // @0x34877 — cfstring @0x14da98 -> C-string "PCSystemException"
    //            (bytes read directly from ProCore __TEXT,__cstring @1255314).
    // @0x3487e — PCString::PCString(__CFString const*) @0x31f32.
    //            The existing PCString port accepts a JS `string` via its
    //            constructor; the CFString payload semantically becomes the
    //            PCString's ref content.
    return new PCString("PCSystemException");
  }
}
