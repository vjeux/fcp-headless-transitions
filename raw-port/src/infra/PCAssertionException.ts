// PCAssertionException.ts — ProCore's PCAssertionException, a concrete
// C++ exception subclass of PCException thrown when a runtime assertion
// (PC_ASSERT/PC_REQUIRE macros in ProCore) trips.
//
// Verbatim from FCP's ProCore framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// Source disassembly captured in:
//   raw-port/re/disasm/ProCore.PCAssertionException.~PCAssertionException.s  (D0 @0x58002)
//   raw-port/re/disasm/ProCore.PCAssertionException.className.s              (@0x5801e)
// D1 (@0x567ac) is a 6-byte trampoline recovered directly from /tmp/ProCore_tV.txt
// (see the /*!D1!*/ inline comment on `destroy_D1` below).
//
// THREE EXPORTED SYMBOLS — the only members of this class in the framework
// (per Itanium-C++-ABI aliases; ctors are inline in a header and not exported):
//   @ProCore 0x00000000000567ac  PCAssertionException::~PCAssertionException()   (D1 — non-deleting)
//   @ProCore 0x0000000000058002  PCAssertionException::~PCAssertionException()   (D0 — deleting)
//   @ProCore 0x000000000005801e  PCAssertionException::className() const
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────────
// The class carries NO subclass-specific data (D1 is a bare tail-call trampoline
// to PCException::~PCException; D0 wraps that same tail-call in a `pushq %rbx /
// callq PCException::~PCException() / jmp __ZdlPv` sequence). All state lives in
// the inherited PCException base:
//
//   offset  size  field                       comments
//   ------  ----  --------------------------  --------------------------------------------------
//   +0x00   0x08  vtbl : *const void          Installed by an unexported inline ctor. Not
//                                             touched by the three transcribed methods.
//   +0x08+ ??    PCException-inherited state (undecoded — PCException is its own port).
//
// The vtable installed pointer for PCAssertionException is NOT visible from these
// three symbols alone (no method here reads or writes it). Its address would be
// recoverable from PCAssertionException's ctor (not exported), or by cross-
// referencing the ProCore __DATA_CONST,__const section for a vtable-16-with-typeinfo
// matching PCAssertionException's className. We do NOT invent a value: it is
// modelled as an opaque brand and left for PCException / vtable decoding.
//
// ── className() STRING PROVENANCE ────────────────────────────────────────────
// className() @0x5801e loads the sentinel CFString via
//   0x58027  leaq 0xf5c8a(%rip), %rsi        ;  RIP=0x5802e; target=0x14dcb8
// which is a __CFConstantStringClassReference (isa=0x150363 CFConstantStringClassReference
// pattern) cfstring at __DATA_CONST,__cfstring 0x14dcb8:
//   struct {
//     const void*  isa;         // 0x000000800020036363 (CFConstantString isa constant)
//     uint32_t     flags;       // 0x000007c8
//     uint64_t     data_ptr;    // → 0x00132c1c    (C-string in __TEXT,__cstring)
//     uint64_t     length;      // 0x14 (20 bytes UTF-8, no NUL)
//   }
// The C-string payload at 0x00132c1c reads exactly "PCAssertionException" (verified via
// `otool -s __TEXT __cstring -v` — see the "PCAssertionException" line at 0x132c1c).
// This IS the class name — className() is a pure constant returning that literal
// wrapped in a PCString; `this` is NOT read.
//
// ── FRONTIER CALLEES (not members of this class — throw-stubbed if invoked) ──
//   @ProCore 0x5800b  __ZN11PCExceptionD2Ev     PCException::~PCException()
//         Base-class destructor (D2, base-object variant). PCException itself is a
//         separate task-queue entry. We surface it as a throwing stub so the demand
//         signal is explicit for its own port.
//   @ProCore 0x58019  __ZdlPv                    operator delete(void*)  (libc++abi)
//         Tail-call at end of D0. No-op in a GC'd runtime; captured for control-flow
//         parity.
//   @ProCore 0x5802e  __ZN8PCStringC1EPK10__CFString  PCString::PCString(__CFString const*)
//         The (real, ported) PCString class already models this construction path — we
//         construct via `new PCString("PCAssertionException")`, which routes through
//         PCString's unified constructor. That single-argument constructor produces a
//         CFString via _CFStringCreateWithCString(...UTF8) in FCP; we use the payload
//         string as its cross-runtime equivalent.

import { PCString } from "./PCString";

/** Frontier stub for __ZN11PCExceptionD2Ev.
 *  @ProCore 0x5800b  PCException::~PCException()  (D2 — base-object)
 *  Not decoded here. Faithful decode-don't-fit stub — the raise below is the
 *  demand signal that PCException needs its own task-queue entry.
 */
function pcException_base_dtor_stub(_self: PCAssertionException): void {
  throw new Error(
    "PCException::~PCException() @ProCore 0x??? invoked from PCAssertionException D0@0x5800b / D1@0x567b1 — not yet ported",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv) — jumped to as a tail call from D0.
 *  Modeled as a no-op in a GC'd runtime; kept as an explicit call so the control
 *  flow matches the disasm at 0x58019. Not a decode of the C++ runtime symbol.
 */
function operator_delete_stub(_self: PCAssertionException): void {
  // 0x58019: `jmp 0xde6c0  ## symbol stub for: __ZdlPv`. GC'd runtime — nothing to
  // free. Retained as a call site so the destructor's tail-call structure is
  // observable.
}

/**
 * PCAssertionException — thrown to signal a runtime assertion failure.
 *
 * Concrete subclass of PCException. Overrides only className(); what(),
 * callStackSymbols(), and report() are inherited via the vtable (which itself
 * is installed by an unexported inline ctor and thus not decoded here).
 *
 * The class carries NO data of its own beyond the base-class state, so both
 * destructors are pure trampolines into PCException's dtor plus (for D0) the
 * `delete this` tail-call.
 */
export class PCAssertionException {
  /** +0x00  Installed vtable pointer for PCAssertionException. Not touched by
   *  any of the three exported methods (D0/D1/className), so its exact value
   *  is not recoverable from this class alone. Modeled as `null` sentinel
   *  until PCException / the vtable are decoded; the field's presence
   *  preserves the layout budget for downstream decoders. */
  vtbl: number | null = null;

  /**
   * PCAssertionException::~PCAssertionException() — the D1 (non-deleting)
   * destructor.
   *   @ProCore 0x00000000000567ac..0x00000000000567b1
   *
   * Disassembly:
   *   0x567ac  pushq %rbp
   *   0x567ad  movq  %rsp, %rbp
   *   0x567b0  popq  %rbp
   *   0x567b1  jmp   __ZN11PCExceptionD2Ev   ; PCException::~PCException()
   *
   * A bare frame-set-up / frame-tear-down / tail-call trampoline into
   * PCException's base destructor. No subclass fields to finalize (there are
   * none).
   */
  destroy_D1(): void {
    // 0x567b1: jmp PCException::~PCException() — undecoded frontier stub.
    pcException_base_dtor_stub(this);
  }

  /**
   * PCAssertionException::~PCAssertionException() — the D0 (deleting)
   * destructor.
   *   @ProCore 0x0000000000058002..0x0000000000058019
   *
   * Disassembly:
   *   0x58002  pushq %rbp
   *   0x58003  movq  %rsp, %rbp
   *   0x58006  pushq %rbx
   *   0x58007  pushq %rax                     ; 16-byte stack align
   *   0x58008  movq  %rdi, %rbx               ; rbx = this
   *   0x5800b  callq __ZN11PCExceptionD2Ev    ; PCException::~PCException()
   *   0x58010  movq  %rbx, %rdi               ; restore this
   *   0x58013  addq  $0x8, %rsp
   *   0x58017  popq  %rbx
   *   0x58018  popq  %rbp
   *   0x58019  jmp   __ZdlPv                  ; operator delete(void*)
   *
   * D0 does NOT tail-call D1 — the compiler noticed D1 is a bare trampoline
   * (its body is one instruction: the same call to PCException::~PCException),
   * and inlined that single call directly. Semantics are still "run base dtor
   * then delete this", i.e. exactly what the abstract Itanium ABI defines as
   * D0.
   */
  destroy_D0(): void {
    // 0x5800b: call PCException::~PCException() (undecoded frontier stub).
    pcException_base_dtor_stub(this);
    // 0x58019: jmp __ZdlPv (operator delete). GC'd runtime — no-op.
    operator_delete_stub(this);
  }

  /**
   * PCAssertionException::className() const — vtable *0x18 override returning
   * the constant PCString "PCAssertionException".
   *   @ProCore 0x000000000005801e..0x000000000005803c
   *
   * Disassembly:
   *   0x5801e  pushq %rbp
   *   0x5801f  movq  %rsp, %rbp
   *   0x58022  pushq %rbx
   *   0x58023  pushq %rax                     ; 16-byte stack align
   *   0x58024  movq  %rdi, %rbx               ; rbx = out (sret) PCString*
   *   0x58027  leaq  0xf5c8a(%rip), %rsi      ; rsi = 0x14dcb8
   *                                            ;   __CFConstantString cfstring;
   *                                            ;   payload C-string at
   *                                            ;   __TEXT,__cstring 0x132c1c
   *                                            ;   ("PCAssertionException", len 20).
   *   0x5802e  callq __ZN8PCStringC1EPK10__CFString  ; PCString::PCString(CFString*)
   *   0x58033  movq  %rbx, %rax               ; return the sret pointer
   *   0x58036  addq  $0x8, %rsp
   *   0x5803a  popq  %rbx
   *   0x5803b  popq  %rbp
   *   0x5803c  retq
   *
   * ABI note: PCString is returned by value (sret), so %rdi is the caller-
   * provided output buffer and %rsi is the __CFString*. The receiver
   * (`const PCAssertionException* this`) is NOT read — className() is a pure
   * constant returning the class-name literal. Consequently `this` is unused
   * in our TS port too (though kept as a method so the vtable *0x18 binding
   * is honest).
   *
   * Payload provenance for the cfstring at 0x14dcb8:
   *   __DATA_CONST,__cfstring:
   *     0x14dcb8  63 03 00 00 00 00 20 80  c8 07 00 00 00 00 00 00
   *     0x14dcc8  1c 2c 13 00 00 00 20 00  14 00 00 00 00 00 00 00
   *   → data_ptr=0x00132c1c, length=0x14 (20). String at 0x132c1c reads
   *     "PCAssertionException" (verified via otool -s __TEXT __cstring -v).
   *
   * The (already-ported) PCString class routes single-argument construction
   * through its unified constructor. Passing the payload string reproduces
   * the FCP behaviour (a PCString whose backing CFStringRef bears exactly
   * the class-name literal).
   */
  className(): PCString {
    // 0x58027 → cfstring 0x14dcb8 → C-string 0x132c1c "PCAssertionException" (len 20).
    // 0x5802e → PCString::PCString(__CFString const*). Real PCString port handles
    //           the CFString-creation semantics (via _CFStringCreateWithCString
    //           in the underlying char* branch).
    return new PCString("PCAssertionException");
  }
}
