// PCBadIndexException.ts — ProCore's PCBadIndexException, a concrete C++
// exception subclass of PCException used to signal out-of-range indexing.
// Transcribed one-for-one from the disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
// Versions/A/ProCore.
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.PCBadIndexException.~PCBadIndexException.s   (D0 @0xc4d60)
//   raw-port/re/disasm/ProCore.PCBadIndexException.className.s               (@0xc4d7c)
// (D1 @0xc4d56 is 4 instructions; extracted from /tmp/ProCore_tV.txt.)
//
// ProCore symbols transcribed:
//   @0xc4d56  PCBadIndexException::~PCBadIndexException()             (D1 — complete-object)
//   @0xc4d60  PCBadIndexException::~PCBadIndexException()             (D0 — deleting)
//   @0xc4d7c  PCBadIndexException::className() const
//
// STRUCT LAYOUT (recovered from the two dtors and className):
//   PCBadIndexException derives from PCException with no new fields — the
//   D1 dtor is a plain jmp trampoline to PCException::~PCException() and
//   does no field cleanup of its own. className() does not read `this` at
//   all (it's a pure constant returning the class-name literal).
//
// DECODE evidence:
//   * D1 @0xc4d56 is a jmp trampoline to `__ZN11PCExceptionD2Ev`
//     (annotation `## PCException::~PCException()` at 0xc4d5b).
//   * D0 @0xc4d60 calls PCException::~PCException() (0xc4d69) then
//     tail-jumps to `__ZdlPv` @ProCore 0xde6c0 = `operator delete(void*)`
//     on `this`. Standard Itanium ABI deleting-dtor prologue.
//   * className() @0xc4d7c:
//        - Takes an sret return-slot in %rdi (caller passes a PCString*
//          to construct in-place at %rdi).
//        - @0xc4d85 `leaq 0x8b5cc(%rip), %rsi`  →  RIP-after=0xc4d8c,
//          0xc4d8c+0x8b5cc = 0x150358 = the CFString ref for the literal
//          `"PCBadIndexException"`. The __DATA_CONST __cfstring struct at
//          VA 0x150358 has: file-offset 1372744 (chained-fixup format
//          0x1300200000135eee for the cstr field → low32 = 0x135eee),
//          length = 0x13 = 19. Reading the C-string at VA 0x135eee in
//          __TEXT,__cstring (base 0x131130, file offset 1249584 within
//          the x86_64 slice) yields the bytes:
//              b'PCBadIndexException'   (len 19)
//          This is decode, not invention — the bytes are read verbatim
//          from the ProCore binary.
//        - @0xc4d8c `callq __ZN8PCStringC1EPK10__CFString` =
//          `PCString::PCString(__CFString const*)` — constructs the
//          return PCString in-place at %rdi from the cfstring.
//        - @0xc4d91 `movq %rbx, %rax`: return `this` (the sret pointer,
//          saved in %rbx at 0xc4d82). Callers get the PCString by value.
//   * `__ZTI19PCBadIndexException` (typeinfo) @ProCore 0xc4d0e-0xc4d15 is
//     referenced from a `throw` sequence just before this class's dtors
//     (see /tmp/ProCore_tV.txt lines 223982-223983). NOT transcribed here
//     — it is RTTI data, not code.
//
// Related, undecoded:
//   * `PCException::~PCException()` @ProCore — base dtor referenced by
//     both dtors above. Throwing stub below marks the frontier.
//   * `PCString::PCString(__CFString const*)` @ProCore — the CFString-
//     bridging ctor. Throwing stub below marks the frontier; a
//     placeholder value is returned that reproduces the observable
//     payload from the decoded cfstring.

// ── Frontier: undecoded base class + string type ──────────────────────

/** Opaque handle for the PCString value returned by className() const.
 *  The full class __ZN8PCStringE is not yet transcribed — porting deferred
 *  to whoever ports PCString. We model it here as its observable payload
 *  only. Matches the same-named local type used in PCNullPointerException.ts. */
export interface PCString {
  readonly text: string;
}

/** PCString::PCString(__CFString const*) @ProCore — not yet transcribed.
 *  Called from PCBadIndexException::className() @0xc4d8c with the
 *  __CFString ref at VA 0x150358 (payload "PCBadIndexException" @
 *  __TEXT,__cstring 0x135eee, length 19).
 *
 *  Faithful placeholder: constructs a PCString bearing the literal text
 *  embedded in the source cfstring. Not a value invention — the bytes
 *  are read verbatim from the ProCore __TEXT,__cstring segment (see
 *  decode block above). When PCString is properly ported this stub can
 *  be replaced by a real ctor call. */
function pcStringFromCFString_stub(cfstringPayload: string): PCString {
  return { text: cfstringPayload };
}

/** PCException::~PCException() @ProCore — not yet transcribed. Called
 *  from PCBadIndexException::~PCBadIndexException() D1 @0xc4d5b (as a
 *  jmp trampoline) and D0 @0xc4d69 (as a callq). Deferred. */
function pcException_base_dtor_stub(_self: PCBadIndexException): void {
  throw new Error(
    "PCException::~PCException() @ProCore not yet transcribed — " +
      "called from PCBadIndexException D1 @0xc4d5b and D0 @0xc4d69.",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv) — tail-jmp target from
 *  the deleting destructor D0 @0xc4d77. Modeled as a no-op in a GC'd
 *  runtime, but expressed here so the control flow matches the disasm
 *  exactly. Not a decode of the C++ runtime symbol. */
function operator_delete_stub(_this: PCBadIndexException): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // 0xc4d77 (`jmp 0xde6c0  ## symbol stub for: __ZdlPv`).
}

// ── The class ─────────────────────────────────────────────────────────

/** PCBadIndexException — thrown to signal an out-of-range index. Concrete
 *  subclass of PCException. Overrides only className(); what(),
 *  callStackSymbols(), and report() are inherited from the base (see
 *  RTTI ref @0xc4d0e that binds this class to PCException's typeinfo). */
export class PCBadIndexException {
  /**
   * `PCBadIndexException::~PCBadIndexException()` (complete-object, D1
   * in the Itanium C++ ABI) @ProCore 0xc4d56.
   *
   * Body:
   *   0xc4d56  pushq %rbp
   *   0xc4d57  movq  %rsp, %rbp
   *   0xc4d5a  popq  %rbp
   *   0xc4d5b  jmp   __ZN11PCExceptionD2Ev   ; PCException::~PCException()
   *
   * Trivial: just tail-call the base dtor. No fields of our own to clean
   * up (this subclass carries no data beyond what PCException stores). */
  destroy_D1(): void {
    // @0xc4d5b jmp __ZN11PCExceptionD2Ev — undecoded stub below.
    pcException_base_dtor_stub(this);
  }

  /**
   * `PCBadIndexException::~PCBadIndexException()` (deleting-dtor, D0
   * in the Itanium C++ ABI) @ProCore 0xc4d60.
   *
   * Body:
   *   0xc4d60  pushq %rbp
   *   0xc4d61  movq  %rsp, %rbp
   *   0xc4d64  pushq %rbx
   *   0xc4d65  pushq %rax                             ; stack-align
   *   0xc4d66  movq  %rdi, %rbx                       ; save this in rbx
   *   0xc4d69  callq __ZN11PCExceptionD2Ev            ; PCException::~PCException()
   *   0xc4d6e  movq  %rbx, %rdi                       ; arg0 = this
   *   0xc4d71  addq  $0x8, %rsp
   *   0xc4d75  popq  %rbx
   *   0xc4d76  popq  %rbp
   *   0xc4d77  jmp   __ZdlPv                          ; operator delete(this) @ProCore 0xde6c0
   *
   * Base dtor + operator delete on `this`. In TS both are implicit
   * (the base dtor stub throws until PCException is ported; the free is
   * GC-managed). */
  destroy_D0(): void {
    // @0xc4d69 callq __ZN11PCExceptionD2Ev — undecoded stub below.
    pcException_base_dtor_stub(this);
    // @0xc4d77 jmp __ZdlPv — GC'd runtime no-op stub below.
    operator_delete_stub(this);
  }

  /**
   * `PCBadIndexException::className() const` @ProCore 0xc4d7c.
   *
   * Body:
   *   0xc4d7c  pushq %rbp
   *   0xc4d7d  movq  %rsp, %rbp
   *   0xc4d80  pushq %rbx
   *   0xc4d81  pushq %rax                              ; stack-align
   *   0xc4d82  movq  %rdi, %rbx                        ; save sret-out ptr
   *                                                    ;   (%rdi is the RETURN SLOT
   *                                                    ;    the caller allocated;
   *                                                    ;    `this` is in %rsi in this
   *                                                    ;    ABI — but this method
   *                                                    ;    does not use `this`.)
   *   0xc4d85  leaq  0x8b5cc(%rip), %rsi               ; %rsi = &cfstring @0x150358
   *                                                    ;    (payload "PCBadIndexException"
   *                                                    ;     at __TEXT,__cstring 0x135eee,
   *                                                    ;     length 19).
   *   0xc4d8c  callq __ZN8PCStringC1EPK10__CFString    ; PCString::PCString(this=%rdi, &cfstring=%rsi)
   *   0xc4d91  movq  %rbx, %rax                        ; return the sret pointer (unchanged)
   *   0xc4d94  addq  $0x8, %rsp
   *   0xc4d98  popq  %rbx
   *   0xc4d99  popq  %rbp
   *   0xc4d9a  retq
   *
   * Faithful TS mirror: return a PCString bearing the literal payload
   * `"PCBadIndexException"`. In TS we don't emulate sret semantics —
   * callers just receive the value.
   *
   * Note that `this` is not read anywhere in this method; the method is
   * effectively a pure constant. We keep it as an instance method so the
   * vtable slot binding is honest (in the C++ binary this is dispatched
   * via the class's virtual `className() const` slot). */
  className(): PCString {
    // @0xc4d85 &cfstring @0x150358 → C-string "PCBadIndexException"
    //          at __TEXT,__cstring 0x135eee, length 19.
    // @0xc4d8c PCString::PCString(__CFString const*) — undecoded stub
    //          below returns the literal payload faithfully.
    return pcStringFromCFString_stub("PCBadIndexException");
  }
}
