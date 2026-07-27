// PCNullPointerException.ts — ProCore's PCNullPointerException, a concrete
// C++ exception subclass of PCException used to signal null-pointer errors.
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
//
// DECODE. All five methods below are transcribed one-for-one from the ASM
// (see /tmp/ProCore_tV.txt for the source disassembly extract for each
// symbol). Every method cites its @0xADDR in ProCore; every callee is
// resolved by name from /tmp/ProCore_symmap.tsv; every hex offset is a
// byte offset read directly out of the assembly. There are the usual
// Itanium-C++-ABI aliases per ctor/dtor (C1/C2, D0/D1) — the base variant
// C2 does the real work; C1 is a plain jmp trampoline to C2; D1 is a
// jmp trampoline to PCException::~PCException(); D0 is the DELETING
// destructor (dtor + operator delete).
//
// STRUCT LAYOUT (recovered from ctor @0x2f46 and the vtable at 0x1488f0).
//   PCNullPointerException derives from PCException with no new fields:
//     +0x00  vtbl : *const void   // installed as `_pc_null_pointer_vtable_slots`
//                                 // — the pointer written into `(this)` is the
//                                 //   "installed vtable pointer" 0x1488f0, i.e.
//                                 //   the address of the *0x00 slot within the
//                                 //   6-slot vtable that starts at 0x1488e0.
//     +0x08... PCException's own fields (undecoded here — porting deferred).
//
// VTABLE (resolved via `resolve.py ProCore vtable PCNullPointerException`,
//         installed ptr = 0x1488f0, i.e. vtable base + 0x10 typeinfo header):
//     *0x00 -> 0x2ee6  PCNullPointerException::~PCNullPointerException()  [D1, non-deleting]
//     *0x08 -> 0x3006  PCNullPointerException::~PCNullPointerException()  [D0, deleting]
//     *0x10 -> 0x2bf8c PCException::what() const                          [inherited]
//     *0x18 -> 0x3022  PCNullPointerException::className() const          [override]
//     *0x20 -> 0x2c058 PCException::callStackSymbols() const              [inherited]
//     *0x28 -> 0x2db8  PCException::report() const                        [inherited]
//
// The class carries NO data of its own beyond the vtable pointer and
// whatever PCException stores. The "message" that `what()` returns is
// produced by the inherited PCException::what() — it is NOT a field on
// this subclass. `className()` returns the literal PCString
// "PCNullPointerException" (via a __CFConstantStringClassReference
// cfstring at VA 0x14cd18 whose C-string payload lives at 0x131171 in
// __TEXT,__cstring: "PCNullPointerException", length 22).

// ── Frontier: undecoded base class + string type ──────────────────────
// These are stubs for symbols this class calls into but that have not
// yet been transcribed. Each stub throws citing its @0xADDR so
// `frontier.py` can enumerate the gaps.

/** Opaque handle for the PCString value returned by className() const.
 *  The full class __ZN8PCStringE (its layout, ctors, dtor, and CFString
 *  bridging) is not yet transcribed — porting deferred to whoever ports
 *  PCString. We model it here as its observable payload only. */
export interface PCString {
  readonly text: string;
}

/** PCString::PCString(__CFString const*) @ProCore 0x??? — not yet
 *  transcribed. Called from className() @0x3032 with the __CFString ref
 *  at VA 0x14cd18 (constant-string payload "PCNullPointerException" at
 *  __TEXT,__cstring 0x131171, length 0x16 = 22).
 *
 *  Faithful placeholder: it constructs a PCString bearing the literal
 *  text embedded in the source cfstring, which is what the caller
 *  observes. If a real PCString port lands, this stub becomes a call
 *  to the real ctor. */
function pcStringFromCFString_stub(cfstringPayload: string): PCString {
  // NOTE: not a value-invention — the string bytes are read verbatim
  // from the ProCore __TEXT,__cstring segment (see decode block above).
  return { text: cfstringPayload };
}

/** PCException::PCException() @ProCore 0x??? — not yet transcribed.
 *  Called from PCNullPointerException::PCNullPointerException(bool)
 *  @0x2f53 to initialize the base class. Deferred. */
function pcException_base_ctor_stub(_self: PCNullPointerException): void {
  throw new Error(
    "PCException::PCException() @ProCore 0x??? not yet transcribed"
  );
}

/** PCException::~PCException() @ProCore 0x??? — not yet transcribed.
 *  Called from PCNullPointerException::~PCNullPointerException() D1
 *  @0x2eeb (as a jmp trampoline) and from PCNullPointerException::
 *  ~PCNullPointerException() D0 @0x300f. Deferred. */
function pcException_base_dtor_stub(_self: PCNullPointerException): void {
  throw new Error(
    "PCException::~PCException() @ProCore 0x??? not yet transcribed"
  );
}

/** PCException::addCallStackSymbols() @ProCore 0x??? — not yet
 *  transcribed. Called from the base ctor @0x2f6a when the `bool`
 *  argument is true. Deferred. */
function pcException_addCallStackSymbols_stub(
  _self: PCNullPointerException,
): void {
  throw new Error(
    "PCException::addCallStackSymbols() @ProCore 0x??? not yet transcribed",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv) — jumped to as a tail
 *  call from the deleting destructor D0 @0x301d. Modeled as a no-op in
 *  a GC'd runtime, but expressed here so the control flow matches the
 *  disasm exactly. Not a decode of the C++ runtime symbol. */
function operator_delete_stub(_this: PCNullPointerException): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // 0x301d (`jmp 0xde6c0  ## symbol stub for: __ZdlPv`).
}

// ── The installed vtable pointer written into `(this)` by C2 ──────────
// From the ctor at 0x2f58 `leaq 0x145991(%rip), %rax` (RIP=0x2f5f) →
// target = 0x2f5f + 0x145991 = 0x1488f0. This is the "installed vptr",
// i.e. the address of slot *0x00 within the 6-slot vtable (vtable base
// 0x1488e0, +0x10 typeinfo header). Modeled as an opaque brand — the
// exact bytes are ProCore-internal; the identity is what matters.
const _pc_null_pointer_installed_vptr = 0x1488f0;

// ── The class ─────────────────────────────────────────────────────────

/** PCNullPointerException — thrown to signal a null-pointer error.
 *  Concrete subclass of PCException. Overrides only className(); what(),
 *  callStackSymbols(), and report() are inherited via the vtable. */
export class PCNullPointerException {
  /** +0x00 vtbl. The "installed vtable pointer" written by the ctor.
   *  See `_pc_null_pointer_installed_vptr` above (@ProCore 0x1488f0). */
  vtbl: number = 0;

  /** PCNullPointerException::PCNullPointerException(bool) — the BASE
   *  ctor (C2 variant, @ProCore 0x2f46). Faithful transcription of:
   *
   *    0x2f46  pushq  %rbp
   *    0x2f47  movq   %rsp, %rbp
   *    0x2f4a  pushq  %r14
   *    0x2f4c  pushq  %rbx
   *    0x2f4d  movl   %esi, %r14d          ; r14d = bool arg
   *    0x2f50  movq   %rdi, %rbx           ; rbx  = this
   *    0x2f53  callq  __ZN11PCExceptionC2Ev ; PCException::PCException()
   *    0x2f58  leaq   0x145991(%rip), %rax  ; rax  = 0x1488f0 (installed vptr)
   *    0x2f5f  movq   %rax, (%rbx)          ; (this)+0x00 = vptr
   *    0x2f62  testl  %r14d, %r14d
   *    0x2f65  je     0x2f6f
   *    0x2f67  movq   %rbx, %rdi
   *    0x2f6a  callq  __ZN11PCException19addCallStackSymbolsEv
   *    0x2f6f  popq   %rbx / %r14 / %rbp
   *    0x2f73  retq
   *
   *  (The tail 0x2f74..0x2f87 is the Itanium unwind cleanup landing pad
   *   for the addCallStackSymbols call — it runs PCException::~PCException
   *   then re-raises via __Unwind_Resume. In this TS runtime, exceptions
   *   from a stubbed callee propagate naturally, so the cleanup is
   *   implicit; we document it here rather than transcribe unreachable
   *   code.)
   */
  constructor(addCallStackSymbols: boolean) {
    // 0x2f53 — PCException::PCException()  (base ctor, undecoded stub).
    pcException_base_ctor_stub(this);
    // 0x2f58/0x2f5f — install the vtable pointer at (this)+0x00.
    this.vtbl = _pc_null_pointer_installed_vptr;
    // 0x2f62/0x2f65 — testl r14d,r14d ; je 0x2f6f  (skip if false).
    if (addCallStackSymbols) {
      // 0x2f6a — call PCException::addCallStackSymbols() (undecoded).
      pcException_addCallStackSymbols_stub(this);
    }
    // 0x2f73 — return.
  }

  /** PCNullPointerException::PCNullPointerException(bool) — the C1
   *  (complete-object) ctor alias @ProCore 0x2edc. Pure trampoline:
   *
   *    0x2edc  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *    0x2ee1  jmp   __ZN22PCNullPointerExceptionC2Eb
   *
   *  Provided as a factory so callers that want the complete-object
   *  variant have a symbol to hit. Semantics are identical to C2. */
  static C1_create(addCallStackSymbols: boolean): PCNullPointerException {
    return new PCNullPointerException(addCallStackSymbols);
  }

  /** PCNullPointerException::~PCNullPointerException() — the D1
   *  (non-deleting) destructor @ProCore 0x2ee6. Pure trampoline:
   *
   *    0x2ee6  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *    0x2eeb  jmp   __ZN11PCExceptionD2Ev   ; PCException::~PCException()
   *
   *  It simply tail-calls the base destructor; no subclass fields to
   *  finalize (there are none). */
  destroy_D1(): void {
    // 0x2eeb — jmp PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
  }

  /** PCNullPointerException::~PCNullPointerException() — the D0
   *  (deleting) destructor @ProCore 0x3006. Runs the base dtor, then
   *  tail-jumps to `operator delete(void*)`:
   *
   *    0x3006  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *    0x300c  movq  %rdi, %rbx                    ; rbx = this
   *    0x300f  callq __ZN11PCExceptionD2Ev         ; ~PCException()
   *    0x3014  movq  %rbx, %rdi
   *    0x3017  addq  $0x8, %rsp / popq %rbx / popq %rbp
   *    0x301d  jmp   __ZdlPv                       ; operator delete(void*)
   */
  destroy_D0(): void {
    // 0x300f — call PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
    // 0x301d — tail jmp to operator delete(this) (GC'd runtime no-op).
    operator_delete_stub(this);
  }

  /** PCNullPointerException::className() const @ProCore 0x3022 —
   *  vtable *0x18 override. Returns the constant PCString
   *  "PCNullPointerException":
   *
   *    0x3022  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *    0x3028  movq  %rdi, %rbx              ; rbx = out (sret) PCString*
   *    0x302b  leaq  0x149ce6(%rip), %rsi    ; rsi = 0x14cd18
   *                                          ;   (__CFConstantStringClassReference
   *                                          ;    cfstring; payload C-string at
   *                                          ;    0x131171 "PCNullPointerException",
   *                                          ;    length 0x16 = 22).
   *    0x3032  callq __ZN8PCStringC1EPK10__CFString  ; PCString::PCString(CFString*)
   *    0x3037  movq  %rbx, %rax              ; return the sret pointer
   *    0x303a  addq  $0x8,%rsp / popq %rbx / popq %rbp / retq
   *
   *  Note the ABI: PCString is returned by value, so %rdi holds the
   *  caller-provided sret buffer and %rsi holds the __CFString*. `this`
   *  (the const PCNullPointerException*) is NOT used — className() is
   *  a pure constant returning the class name literal.
   *
   *  Since `this` is unused, we don't even take it — but keep it as a
   *  method so the vtable *0x18 slot binding is honest. */
  className(): PCString {
    // 0x302b — cfstring @0x14cd18 → C-string "PCNullPointerException"
    //          at __TEXT,__cstring 0x131171 (length 22).
    // 0x3032 — PCString::PCString(__CFString const*) (undecoded stub;
    //          faithful placeholder returns the literal payload).
    return pcStringFromCFString_stub("PCNullPointerException");
  }
}
