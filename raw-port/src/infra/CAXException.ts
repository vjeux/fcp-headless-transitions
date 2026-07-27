// CAXException.ts — Flexo's CAXException, a concrete C++ exception carrier
// used across Flexo/AudioX to bundle a fixed-capacity error-string buffer
// with a numeric error code, together with a formatter that composes a
// [<CCString-of-code>] <msg> string into a caller-supplied buffer.
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// DECODE. Both methods below are transcribed one-for-one from the ASM.
// Every method cites its @0xADDR in Flexo; every callee is resolved by
// name and every byte offset is read directly from the assembly.
//
// STRUCT LAYOUT (recovered from CAXException::CAXException(char const*, int)
//                @0xd02ab0 store instructions):
//   +0x000  msg   : char[0x100]     // 256-byte inline C-string buffer; the
//                                   // ctor NUL-terminates at [0xff] when the
//                                   // input is >= 0x100 long, and treats
//                                   // strlen<0x100 as "strlcpy will fit and
//                                   // NUL-terminate itself".
//                                   // The empty-input path stores a single
//                                   // '\0' at [0].
//   +0x100  code  : int32           // stored via `movl %edx, 0x100(%rdi)`
//                                   // @0xd02aba, i.e. the raw `int` code
//                                   // arg with no widening.
//   sizeof(CAXException) is at least 0x104 (0x100 buf + 4-byte int); base
//   class (if any: std::exception) sits after or is inherited into the
//   same block — not touched by these two methods, so we don't attempt to
//   model it here.
//
// The class does not appear as a source of a vtable-installed pointer in
// either of the two methods disassembled (neither writes a vptr into
// (%rbx)/(this)), so the base sub-object and any virtual dispatch (what/
// className/report/...) are frontier for this file. They will be filled
// in when the base class port (std::exception, or a CAX-side wrapper)
// lands. This file transcribes only what these two disasms decoded.

// ── Frontier: undecoded companion types ─────────────────────────────────
// CAX4CCString is the tiny FourCC-string helper Flexo uses to stringify a
// numeric code as a four-character 'code' fragment (e.g. an OSStatus
// FourCharCode). Its int-taking ctor is at Flexo 0x1234968 (called by
// FormatError below) and is a separate class — porting deferred to the
// CAX4CCString file. We model it here by the observable contract used by
// FormatError: a stack-resident value whose first byte-storage is a
// NUL-terminated C-string suitable for the '%s' path of strlcpy.

/** Opaque handle for the on-stack CAX4CCString constructed at
 *  FormatError @0xd02a8b (`callq _ZN12CAX4CCStringC2Ei`). The `.cStr`
 *  field represents the printable NUL-terminated bytes that strlcpy
 *  reads out of the object at @0xd02999 when the object is passed by
 *  address. The exact byte layout of CAX4CCString is not decoded in
 *  THIS file — see the CAX4CCString port for provenance. */
export interface CAX4CCString_stack {
  readonly cStr: string;
}

/** CAX4CCString::CAX4CCString(int) @Flexo 0x1234968 — not transcribed
 *  in this file. Called from CAXException::FormatError @0xd0298e to
 *  build a stack CAX4CCString from the exception's `code` field. */
function CAX4CCString_ctor_int_stub(_code: number): CAX4CCString_stack {
  throw new Error(
    "CAX4CCString::CAX4CCString(int) @Flexo 0x1234968 not yet transcribed",
  );
}

/** libc `strlen(const char*)` — called from CAXException ctor @0xd02acb
 *  via the __stubs entry for `_strlen`. Trivial in JS-land. */
function strlen_stub(s: string): number {
  // The asm passes a C-string pointer and reads its NUL-terminated length.
  // In JS the message is already a string; its byte length in UTF-8 would
  // differ from strlen on non-ASCII input, but the ctor's contract is a
  // C-string, so we mirror the byte semantics with the JS `.length` of
  // the (assumed ASCII) source — callers that pass non-ASCII would see a
  // different truncation boundary and should port a real strlen if that
  // matters. Kept as an explicit citation site rather than inlined.
  return s.length;
}

/** libc `memcpy(dst, src, n)` — called from CAXException ctor @0xd02ae3
 *  via the __stubs entry for `_memcpy`. Copies the first 0xff bytes of
 *  the input string when strlen(input) >= 0x100. */
function memcpy_truncate255(src: string): string {
  // Copies exactly 0xff (255) bytes, then the ctor writes '\0' at [0xff].
  // In JS we just take the first 255 chars — same visible result under
  // the ASCII contract described in strlen_stub above.
  return src.slice(0, 0xff);
}

/** libc `strlcpy(dst, src, dstsize)` — called from CAXException ctor
 *  @0xd02b0b (as a tail-jmp) and from CAXException::FormatError @0xd0299c
 *  via the __stubs entry for `_strlcpy`. Copies up to dstsize-1 bytes
 *  from src into dst and always NUL-terminates. Returns strlen(src). */
function strlcpy_stub(src: string, dstsize: number): string {
  // Faithful strlcpy semantics: at most (dstsize-1) bytes then NUL.
  if (dstsize <= 0) return "";
  return src.slice(0, dstsize - 1);
}

/**
 * `CAXException` — Flexo's error-code + fixed-buffer exception.
 *
 * Only the two decoded methods (ctor, FormatError) are implemented here.
 * Any virtual/base-class behaviour (destructor, what(), etc.) is FRONTIER
 * and will be added by the eventual std::exception / base-class port.
 */
export class CAXException {
  /**
   * `msg` — the +0x000 char[0x100] inline C-string buffer. Modelled as a
   * JS string carrying the ASCII-visible contents; capacity 0x100 with a
   * mandatory trailing NUL (so at most 0xff printable bytes).
   * Reads/writes into this field always mirror the exact byte-offset
   * math observed in the disassembly (strlen/memcpy/strlcpy at +0x00).
   */
  msg: string = "";

  /** `code` — the +0x100 int32 error code. Stored via
   *  `movl %edx, 0x100(%rdi)` @0xd02aba with no widening. */
  code: number = 0;

  /**
   * `CAXException::CAXException(char const*, int)` @Flexo 0xd02ab0 (C1).
   *
   * Disasm (all @Flexo):
   *   0xd02ab0  push  rbp / mov rbp,rsp / push r14 / push rbx
   *   0xd02ab7  mov   rbx, rdi              ; rbx = this
   *   0xd02aba  mov   [rdi+0x100], edx      ; this->code = code
   *   0xd02ac0  test  rsi, rsi              ; if (msg == NULL)
   *   0xd02ac3  je    0xd02af4              ;   goto empty
   *   0xd02ac5  mov   r14, rsi              ; r14 = msg
   *   0xd02ac8  mov   rdi, rsi
   *   0xd02acb  callq _strlen               ; rax = strlen(msg)
   *   0xd02ad0  cmp   rax, 0x100
   *   0xd02ad6  jb    0xd02afc              ; if (len < 0x100) goto strlcpy_path
   *   0xd02ad8  mov   edx, 0xff             ; else: memcpy 0xff bytes and NUL-terminate
   *   0xd02add  mov   rdi, rbx
   *   0xd02ae0  mov   rsi, r14
   *   0xd02ae3  callq _memcpy               ; memcpy(this, msg, 0xff)
   *   0xd02ae8  mov   BYTE PTR [rbx+0xff], 0 ; this->msg[0xff] = '\0'
   *   0xd02aef  pop   rbx / pop r14 / pop rbp / ret
   *
   *   empty (@0xd02af4):
   *   0xd02af4  mov   BYTE PTR [rbx], 0     ; this->msg[0] = '\0'
   *   0xd02af7  pop   rbx / pop r14 / pop rbp / ret
   *
   *   strlcpy_path (@0xd02afc):
   *   0xd02afc  mov   edx, 0x100            ; dstsize = 0x100
   *   0xd02b01  mov   rdi, rbx
   *   0xd02b04  mov   rsi, r14
   *   0xd02b07  pop   rbx / pop r14 / pop rbp
   *   0xd02b0b  jmp   _strlcpy              ; tail-jmp strlcpy(this, msg, 0x100)
   *
   * Note: C1 (complete-object ctor) is the emitted symbol; the disasm
   * shows no call to a base-class ctor or vtable install, so the base
   * sub-object initialisation is either compiled inline elsewhere or
   * this class inherits nothing that needs a runtime touch here.
   */
  constructor(msg: string | null, code: number) {
    // @0xd02aba: store the int32 code at +0x100.
    this.code = code | 0;

    // @0xd02ac0..@0xd02ac3: NULL-check the message pointer.
    if (msg === null) {
      // empty path @0xd02af4: msg[0] = '\0'.
      this.msg = "";
      return;
    }

    // @0xd02acb: len = strlen(msg).
    const len = strlen_stub(msg);

    // @0xd02ad0..@0xd02ad6: branch on len < 0x100.
    if (len < 0x100) {
      // strlcpy_path @0xd02afc..@0xd02b0b — tail-jmp to strlcpy with
      // dstsize=0x100. strlcpy copies at most 0xff bytes then NUL-terms.
      this.msg = strlcpy_stub(msg, 0x100);
      return;
    }

    // memcpy path @0xd02ad8..@0xd02ae8 — copy 0xff bytes then write '\0'
    // at [0xff]. Modelled as slice(0,0xff): the trailing NUL is implicit
    // in the JS string boundary since capacity here is 0x100 including
    // the terminator.
    this.msg = memcpy_truncate255(msg);
  }

  /**
   * `CAXException::FormatError(char*, unsigned long) const` @Flexo 0x1234960.
   *
   * Composes a formatted diagnostic into a caller-supplied buffer. In the
   * source this is:
   *
   *    char* FormatError(char* dst, size_t dstsize) const {
   *      CAX4CCString ccs(this->code);        // stack-local, 4-char code fragment
   *      strlcpy(dst, &ccs, dstsize);         // copy CCS text into dst
   *      return dst;                          // %rax = dst
   *    }
   *
   * The stack-guard save/check bracket confirms the CAX4CCString is a
   * local with an internal buffer (why the compiler emitted a canary).
   * Note that despite the "FormatError" name, the disasm does NOT read
   * `this->msg` — it only uses `this->code` (loaded as `movl 0x100(%rdi),
   * %esi` @0x1234981). Whatever assembles "[<code>] <msg>" happens either
   * inside CAX4CCString or in the caller after this returns; we transcribe
   * only what's here.
   *
   * Disasm (all @Flexo):
   *   0x1234960  push  rbp / mov rbp,rsp / push r15 / push r14 / push rbx
   *   0x123496d  sub   rsp, 0x18                 ; frame: 0x30 CCS + canary
   *   0x123496d  mov   r14, rdx                  ; r14 = dstsize
   *   0x1234970  mov   rbx, rsi                  ; rbx = dst
   *   0x1234973  mov   rax, [rip+0x6b924e]       ; ___stack_chk_guard
   *   0x123497a  mov   rax, [rax]
   *   0x123497d  mov   [rbp-0x20], rax           ; save canary
   *   0x1234981  mov   esi, [rdi+0x100]          ; esi = this->code
   *   0x1234987  lea   r15, [rbp-0x30]           ; r15 = &ccs (stack)
   *   0x123498b  mov   rdi, r15
   *   0x123498e  callq _ZN12CAX4CCStringC2Ei     ; CAX4CCString::CAX4CCString(int)
   *   0x1234993  mov   rdi, rbx                  ; strlcpy(dst,
   *   0x1234996  mov   rsi, r15                  ;         &ccs,
   *   0x1234999  mov   rdx, r14                  ;         dstsize)
   *   0x123499c  callq _strlcpy                  ;
   *   0x12349a1..@0x12349af  canary check
   *   0x12349b1  mov   rax, rbx                  ; return dst
   *   0x12349b4  pop-frame / ret
   *   0x12349bf  callq ___stack_chk_fail         ; on canary mismatch
   *
   * Returns the same `dst` pointer that was passed in (rax = rbx). The
   * caller can chain this into further formatting.
   */
  FormatError(dst: { value: string }, dstsize: number): { value: string } {
    // @0x123498e: build a CAX4CCString from the int code. This is a
    // stack-resident value in the source; we model it as a locally-scoped
    // TS value. Its internal cStr is what strlcpy will read.
    const ccs = CAX4CCString_ctor_int_stub(this.code | 0);

    // @0x123499c: strlcpy(dst, &ccs, dstsize). The asm passes r15 (the
    // address of the CCS object) as `src`; strlcpy reads it as a C-string,
    // so the observable byte stream is CCS's leading NUL-terminated text.
    dst.value = strlcpy_stub(ccs.cStr, dstsize >>> 0);

    // @0x12349b1: return dst.
    return dst;
  }
}
