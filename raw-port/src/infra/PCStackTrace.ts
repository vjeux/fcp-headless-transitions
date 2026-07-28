// PCStackTrace.ts — ProCore's C++ stack-trace capture + printer.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//     Versions/A/ProCore
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.PCStackTrace.PCStackTrace.s  @0x6fc30  (C1 forwarder)
//   raw-port/re/disasm/ProCore.PCStackTrace.C2.s            @0x6f512  (C2, real body)
//   raw-port/re/disasm/ProCore.PCStackTrace.print.s         @0x6fc3a  (member const)
//
// ---------------------------------------------------------------------------
// PCStackTrace LAYOUT
// ---------------------------------------------------------------------------
// From the field accesses in print @0x6fc3a and C2 @0x6f512:
//
//   struct PCStackTrace {
//     // +0x00, +0x08, +0x10 form a std::__1::vector<std::string> (libc++ 3-ptr
//     //   representation: __begin_, __end_, __end_cap_). Each std::string is
//     //   24 bytes with libc++ SSO. print()'s subq (%rdi),%rax ; sarq $3 ;
//     //   imulq $0xAAAAAAAAAAAAAAAB reciprocal at @0x6fccd/0x6fcd1 divides
//     //   the byte-diff by 24, confirming sizeof(element) == 24 == std::string.
//     // The ctor's `xorps xmm0,xmm0 ; movups xmm0,(rdi) ; movq $0,0x10(rdi)`
//     //   at @0x6f526–0x6f530 zero-initialises exactly these 24 bytes.
//     stack: string[];   // +0x00..+0x17 = std::vector<std::string> (frames)
//   };                   // sizeof = 24 bytes
//
// The ctor(int skip) uses `_backtrace` + `_dladdr` + `___cxa_demangle` to
// build one std::string per frame (formatted via a per-iteration
// std::basic_ostringstream). print() then walks that vector and emits
// "  <frame>\n" for each string on the given std::ostream.
//
// ---------------------------------------------------------------------------
// C1 forwarder — PCStackTrace::PCStackTrace(int)
// @0x6fc30
// ---------------------------------------------------------------------------
//   pushq %rbp / movq %rsp,%rbp / popq %rbp
//   jmp __ZN12PCStackTraceC2Ei     ; tail-call to C2 (the real ctor)
//
// Standard Itanium-ABI C1/C2 split for a class with no virtual bases: C1
// just tail-calls C2.
//
// ---------------------------------------------------------------------------
// C2 real ctor — PCStackTrace::PCStackTrace(int) @0x6f512
// ---------------------------------------------------------------------------
// 423-line body — NOT yet transcribed. Uses:
//   - libc++ std::vector<void*> to buffer PC addresses (ctor @0x6f54c;
//     `std::__1::vector<void*>::vector[abi:nqe210106](unsigned long)`).
//   - _backtrace       @stub 0xde798  (writes up to N PC's into that buffer).
//   - _dladdr          @stub 0xde83a  (resolves each PC → Dl_info sym name).
//   - ___cxa_demangle  @stub 0xde6f0  (demangles the C++ mangled name).
//   - std::__1::basic_ostringstream<char> constructed per frame @0x6f5ca; then
//     std::ostream << ops for the demangled name, an index, an addr; and
//     std::basic_stringbuf::str() → std::string appended into `this->stack`.
//   - _free            @stub 0xde89a  (frees the ___cxa_demangle result buffer).
//
// Every one of these is a heavy libc++/libSystem C++ symbol — not decodable
// as pure math without a full libunwind + libc++abi transcription. Kept as
// a throwing stub below (PORTING_SPEC Rule 3: undecoded → throw, that IS
// the demand signal). The three-word vector-of-string layout is still
// modelled so print() operates correctly on any vector populated by other
// means.
//
// ---------------------------------------------------------------------------
// print — PCStackTrace::print(std::ostream&) const @0x6fc3a
// ---------------------------------------------------------------------------
// Direct transcription:
//
//     movq  0x8(%rdi), %rax          ; end_   = this->stack.__end_
//     cmpq  (%rdi),    %rax          ; if end_ == __begin_ (empty vector):
//     je    <ret>                    ;   fall through to retq
//     ...standard prologue, saves rbx=rsi(ostream), r14=rdi(this)...
//     movl  $0x1, %r13d              ; index counter = 1
//     xorl  %r12d, %r12d             ; i = 0 (element index)
//     movabsq $-0x5555555555555555,%r15 ; 0xAAAAAAAAAAAAAAAB — recip for /24
//   .Lloop:
//     movl  $0x2, %edx                          ; length = 2
//     movq  %rbx, %rdi                          ; ostream
//     leaq  0xc3466(%rip), %rsi                 ; literal "  " (2 spaces)
//     callq std::__put_character_sequence(ostream&, "  ", 2)
//     movq  (%r14), %rcx                        ; rcx = stack.__begin_
//     leaq  (%r12,%r12,2), %rdi                 ; rdi = i * 3   (index in 8-byte words)
//     movzbl (%rcx,%rdi,8), %edx                ; first byte of std::string[i]
//     testb $0x1, %dl                           ; SSO discriminator bit
//     je    <short_str>
//       ; --- LONG string path: 24-byte layout is {size,cap,ptr} ---
//       movq  0x10(%rcx,%rdi,8), %rsi           ; rsi = data pointer
//       movq  0x8(%rcx,%rdi,8),  %rdx           ; rdx = size
//       jmp   .Lput
//     <short_str>:
//       ; --- SHORT (SSO) string path: 24 bytes are {size_byte, chars[23]} ---
//       shrl  %edx                              ; size = (first_byte >> 1)
//       leaq  (%rcx,%rdi,8), %rsi
//       incq  %rsi                              ; rsi = &chars[0] (inline buffer)
//     .Lput:
//       movq  %rax, %rdi                        ; rdi = ostream (return of prev __put)
//       callq std::__put_character_sequence(ostream&, str, len)   ; emit the frame text
//     movl  $0x1, %edx                          ; length = 1
//     movq  %rax, %rdi
//     leaq  0xc1756(%rip), %rsi                 ; literal "\n"
//     callq std::__put_character_sequence(ostream&, "\n", 1)      ; emit newline
//     movl  %r13d, %r12d                        ; i = previous index (r13d increments below)
//     movq  0x8(%r14), %rax                     ; end_
//     subq  (%r14),    %rax                     ; end_ - begin_  (bytes)
//     sarq  $0x3, %rax                          ; /8  (bytes → 8-byte words)
//     imulq %r15,      %rax                     ; * 0xAAA…AB  (magic recip → /3)
//                                               ;  Net effect: /24 → element count
//     incl  %r13d                               ; ++index
//     cmpq  %r12,      %rax                     ; while (i < size)
//     jne   .Lloop
//     ...epilogue, retq.
//
// Semantics: for each std::string in `stack`, emit
//   ostream << "  " << stack[i] << "\n";
// Nothing is prepended (no index printed) — the r13 counter is used only
// as the "i for next iteration" via the pre-increment/copy dance.
//
// The reciprocal 0xAAAAAAAAAAAAAAAB × (bytes >> 3) yields (bytes/24) using
// the standard "divide by 3 via multiply-high" idiom on x86_64 — because
// sizeof(std::string) == 24 == 8 * 3.
//
// ---------------------------------------------------------------------------
// Callees / stubs cited above (from otool's inline stub annotations):
//   __ZNSt3__124__put_character_sequenceB9nqe210106IcNS_11char_traitsIcEEEE
//        REN‽Sr...__stub used for the three "put string on ostream" calls
//        at @0x6fc7d, @0x6fcaa, @0x6fcbe.
//   Literal pool: "  " (2 spaces, no NUL used) via RIP + 0xc3466 @0x6fc76.
//   Literal pool: "\n" via RIP + 0xc1756 @0x6fcb7.
// ---------------------------------------------------------------------------

/**
 * Opaque handle for a `std::__1::basic_ostream<char, ...>&` argument, as
 * used by libc++'s `std::__put_character_sequence`. The port doesn't yet
 * model an ostream directly; callers wire their own sink through
 * `putCharacterSequence`.
 */
export interface PCStackTrace_Ostream {
  /**
   * @0x6fc7d / @0x6fcaa / @0x6fcbe: the exact libc++ ABI symbol
   * `std::__1::__put_character_sequence[abi:nqe210106]<char, char_traits>`
   * that writes `n` bytes from `s` into the ostream and returns the
   * ostream (chainable). Callers implement this to emit into whatever
   * concrete sink they use (Node stdout, string buffer, etc.).
   */
  putCharacterSequence(s: string, n: number): PCStackTrace_Ostream;
}

/**
 * `PCStackTrace` — a captured C++ stack trace, stored as a vector of
 * per-frame formatted strings and printable via `print(ostream)`.
 *
 * The C2 ctor @0x6f512 builds the frame strings from `_backtrace` +
 * `_dladdr` + `___cxa_demangle` and formats them through
 * `std::basic_ostringstream`. That path is a 423-line libc++/libSystem
 * body which has NOT yet been transcribed — the ctor @0x6f512 raises to keep
 * the call graph honest (PORTING_SPEC Rule 3). `print()` still works on
 * any PCStackTrace whose `stack` array is populated by other means.
 */
export class PCStackTrace {
  /**
   * @0x6f512 (C2) — the `stack` field at object offset +0x00 as a
   * `std::__1::vector<std::string>`. In TS we model the observable
   * behaviour (a sequence of strings) rather than the SSO byte layout;
   * `print()` uses only the abstract sequence.
   */
  readonly stack: string[] = [];

  /**
   * @0x6fc30 (C1) → tail-jumps to @0x6f512 (C2). Both variants share this
   * body. The C2 body @0x6f512 uses `_backtrace`, `_dladdr`,
   * `___cxa_demangle`, `_free`, and `std::basic_ostringstream` — a full
   * libunwind + libc++abi + libc++ streams path. NOT yet transcribed;
   * throws so the frontier stays loud per PORTING_SPEC Rule 3.
   *
   * @param _skip  the same `int` param passed to `_backtrace` at @0x6f558
   *               (biased by `+5` at @0x6f53f — 5 additional frames captured
   *               past the caller's `skip` count).
   *
   * @see raw-port/re/disasm/ProCore.PCStackTrace.C2.s (full 423-line body).
   */
  constructor(_skip: number) {
    // Zero-init of the {begin,end,cap} vector triplet at @0x6f526-0x6f530
    // is captured by the `[] = []` field initializer above.
    // The remaining backtrace/dladdr/demangle path @0x6f542–0x6fb2e is
    // not yet ported at address @0x6f512.
    throw new Error(
      'PCStackTrace::PCStackTrace(int) @0x6f512 body (backtrace/dladdr/__cxa_demangle/basic_ostringstream) not yet transcribed',
    );
  }

  /**
   * `print(std::ostream&) const` — @0x6fc3a. Emit each captured frame as
   *   "  " + frame + "\n"
   * onto the given ostream. Faithful transcription of the loop @0x6fc6e–
   * 0x6fcdb: uses the SSO-vs-long-string branch at @0x6fc8d only to fetch
   * the string bytes; in TS the same effect is achieved by passing the
   * (already-decoded) string and its length to `putCharacterSequence`.
   *
   * Iteration count comes from `(end_ - begin_) >> 3 * 0xAAA…AB` which is
   * the standard "divide by 24" idiom (sizeof(std::string) == 24) — in
   * TS we simply iterate `this.stack`.
   */
  print(ostream: PCStackTrace_Ostream): void {
    // @0x6fc3a-0x6fc41: empty-vector early-out.
    //   movq 0x8(%rdi),%rax ; cmpq (%rdi),%rax ; je <ret>
    if (this.stack.length === 0) {
      return;
    }

    // @0x6fc61: xorl r12d,r12d — i = 0. (r13d/index-copy pattern only
    // matters for the pre-increment book-keeping; the effective loop
    // variable is r12 comparing against the vector's element count.)
    for (let i = 0; i < this.stack.length; i++) {
      // @0x6fc6e-0x6fc7d: emit the two-space indent
      //   movl $0x2,%edx ; leaq "  "(%rip),%rsi ; callq __put_character_sequence
      let os = ostream.putCharacterSequence('  ', 2);

      // @0x6fc82-0x6fcaa: fetch the i-th std::string (either SSO or heap
      // path) and emit its bytes. In TS both paths converge on `s`.
      const s = this.stack[i];
      os = os.putCharacterSequence(s, s.length);

      // @0x6fcaf-0x6fcbe: emit a single newline
      //   movl $0x1,%edx ; leaq "\n"(%rip),%rsi ; callq __put_character_sequence
      os = os.putCharacterSequence('\n', 1);

      // @0x6fcc3-0x6fcdb: i = (r13d - 1), ++r13d, cmp against size, jne loop.
      // Modelled by the `for` counter above; the intermediate ostream
      // return `os` isn't consumed by the outer scope (matches asm: `%rax`
      // is only used as `%rdi` for the *next* __put_character_sequence
      // within the same iteration).
      void os;
    }

    // @0x6fcdd-0x6fceb: epilogue + retq.
  }
}
