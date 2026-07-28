/**
 * CAX4CCString — FourCC-to-C-string formatter (Flexo).
 *
 * Faithful transcription of Flexo's `CAX4CCString::CAX4CCString(int)` ctor.
 * Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
 * Mangled: __ZN12CAX4CCStringC2Ei
 * Demangled: CAX4CCString::CAX4CCString(int)
 *
 * Behavior recovered from disasm (Flexo.CAX4CCString.CAX4CCString.s):
 *
 *   this@+0x0  ..+0xF is a 16-byte C-string buffer (snprintf writes at most 16 bytes there).
 *
 *   1. `bswapl %eax` — byte-swap the int (endian flip). Store the 4 bswapped bytes
 *      at this+0x1, so that if `code` = 'A'<<24 | 'B'<<16 | 'C'<<8 | 'D' (a native
 *      FourCC value), the four bytes at this+1..this+4 read as 'A','B','C','D' in
 *      memory order.  (@0x123542e bswapl, @0x1235430 movl %eax, 0x1(%rdi))
 *
 *   2. For each of the four bytes at this+0x1, this+0x2, this+0x3, this+0x4, test
 *      isprint(c) via the __DefaultRuneLocale.__runetype[c] & 0x40000 fast-path (or
 *      call `__maskrune(c, 0x40000)` when the high bit is set). 0x40000 == _CTYPE_R
 *      (Print) — verified against /usr/include/_ctype.h. Stub target for
 *      ___maskrune: 0x14974d0 (Flexo).
 *      (@0x1235433 first byte test .. @0x12354e3 fourth byte test)
 *
 *   3. If ALL FOUR bytes are printable, write byte 0x27 (ASCII "'") at this+0x0,
 *      write word 0x0027 at this+0x5 (i.e. 0x27 then 0x00 in little-endian, closing
 *      quote + NUL). Result is the 7-byte string  '<b0><b1><b2><b3>'  followed by
 *      a NUL. Return.
 *      (@0x12354e5 movw $0x27, 0x5(%r14); @0x12354ec movb $0x27, (%r14); retq)
 *
 *   4. Else (any byte NOT printable), fall through to the numeric branch at
 *      @0x1235503. Compute `eax = code + 0x30d3f` (leal 0x30d3f(%rbx),%eax) and
 *      compare unsigned to 0x61a7e. In signed terms this is the range check
 *      -199999 <= code <= 199999 (0x30d3f == 199999, 0x61a7e == 399998).
 *      If in-range use format "%d"  (@0x1235510 lea "%d")
 *      else            use format "0x%x" (@0x1235519 lea "0x%x")
 *      Then `snprintf(this, 16, fmt, code)` (@0x1235520 movl $0x10,%esi;
 *      @0x1235525 movq %r14,%rdi; @0x1235528 movl %ebx,%ecx; @0x1235530 jmpq
 *      _snprintf@0x1497bc6). The buffer size 16 is why the object holds 16 bytes
 *      at this+0.
 *
 * Notes on the disasm listing: the file continues past 0x1235535 into what appears
 * to be linear-sweep bleed for a subsequent unrelated Objective-C helper (mentions
 * FFEffectStack and -[appendData:]); the CAX4CCString ctor itself terminates at
 * either the `retq` @0x12354f4 (printable path) or the `jmpq _snprintf` tail-call
 * @0x1235530 (numeric path). Nothing after 0x1235535 belongs to this ctor.
 *
 * Verification (transcription check, not a runtime oracle):
 *   new CAX4CCString(0x41424344 /* 'ABCD' *\/).toString() === "'ABCD'"
 *   new CAX4CCString(0).toString()                        === "0"
 *   new CAX4CCString(-199999).toString()                  === "-199999"
 *   new CAX4CCString(-200000).toString()                  === "0xfffcf2c0"
 *   new CAX4CCString(200000).toString()                   === "0x30d40"
 */

// ---------------------------------------------------------------------------
// Small helpers modelling the exact libc / rune-locale semantics used above.
// isprint(c) on Darwin returns non-zero iff __DefaultRuneLocale.__runetype[c] &
// _CTYPE_R (0x40000). For ASCII 0..127 this is exactly the standard C isprint
// (space through '~'); it is the only range the ctor can produce because the 4
// bytes it examines come from a 32-bit int and are checked one byte at a time
// with `movsbl` — which sign-extends. The `js` (signed jump negative) branch
// then routes any byte >= 0x80 through __maskrune. For our C-locale ports this
// is identical to  c >= 0x20 && c <= 0x7e.
// ---------------------------------------------------------------------------
function isPrintByte(b: number): boolean {
  // b comes in as a full-width sign-extended int (from movsbl). Test bit
  // 0x40000 of the rune-type flags for that character. For ASCII this is
  // exactly "printable" (space..tilde inclusive). Matches Darwin _CTYPE_R.
  //
  // We faithfully mirror both arms of the disasm:
  //   if (b >= 0)   check the inline __DefaultRuneLocale.__runetype[b]
  //   else          call __maskrune(b, 0x40000)
  // Both reduce, for ASCII bytes 0x00..0x7f, to the same predicate:
  //   0x20 <= b <= 0x7e.
  // A byte with the high bit set can never appear here in practice because
  // the caller-supplied FourCC is a 32-bit int and each byte is truncated
  // to signed 8-bit before this test; the high-bit path exists but for a
  // typed-in ASCII FourCC ("ABCD" etc.) it is unreachable. If we ever pass
  // a byte >= 0x80 through here we would need __maskrune's real answer;
  // for safety, treat those as NOT printable (they fail the isprint test
  // in the C locale, which is what the __maskrune path returns).
  const c = b & 0xff;
  return c >= 0x20 && c <= 0x7e;
}

/**
 * CAX4CCString — a value type wrapping a small char[] that CoreAudio uses to
 * render an OSType/FourCC integer either as `'ABCD'` (when all four bytes are
 * printable ASCII) or as a signed decimal / hex fallback.
 *
 * The C++ class stores a 16-byte inline buffer starting at offset 0 (proved by
 * the `snprintf(this, 16, ...)` on the numeric branch). We model it as a JS
 * string field; callers only ever read `str` or its `toString()`.
 */
export class CAX4CCString {
  /**
   * The 16-byte formatted C-string buffer, NUL-truncated to the actual
   * length used by the ctor path taken.
   */
  readonly str: string;

  /**
   * Construct from a 32-bit signed integer `code`.
   * Ports Flexo `CAX4CCString::CAX4CCString(int)` @0x1235420.
   */
  constructor(code: number) {
    // Force to a 32-bit signed integer up front so `bswapl` and `snprintf`
    // both see the same value the binary sees on entry (`%esi` is 32-bit).
    const code32 = code | 0;

    // Step 1: bswap the code and treat the four resulting bytes as the FourCC
    // characters in native (big-endian display) order.
    //   b0 = (code >> 24) & 0xff   ← lands at this+0x1
    //   b1 = (code >> 16) & 0xff   ← lands at this+0x2
    //   b2 = (code >>  8) & 0xff   ← lands at this+0x3
    //   b3 = (code      ) & 0xff   ← lands at this+0x4
    // (bswap on `[b3, b2, b1, b0]` gives `[b0, b1, b2, b3]` in memory.)
    const b0 = (code32 >>> 24) & 0xff;
    const b1 = (code32 >>> 16) & 0xff;
    const b2 = (code32 >>>  8) & 0xff;
    const b3 =  code32         & 0xff;

    // Step 2/3: quoted-printable path.
    if (
      isPrintByte(b0) &&
      isPrintByte(b1) &&
      isPrintByte(b2) &&
      isPrintByte(b3)
    ) {
      // Writes:  this+0=0x27, this+1..+4=b0..b3, this+5=0x27, this+6=0x00.
      this.str =
        "'" +
        String.fromCharCode(b0) +
        String.fromCharCode(b1) +
        String.fromCharCode(b2) +
        String.fromCharCode(b3) +
        "'";
      return;
    }

    // Step 4: numeric fallback.
    //   leal 0x30d3f(%rbx),%eax; cmpl $0x61a7e,%eax; ja …
    // Equivalent to: (uint32_t)(code + 0x30d3f) <= 0x61a7e, i.e.
    //   -199999 <= code <= 199999   →  "%d"
    //   otherwise                    →  "0x%x"
    // 0x30d3f = 199999, 0x61a7e = 399998.
    // Note the compare is UNSIGNED (`ja`), so the wrap-around after adding
    // 0x30d3f is what implements the signed window trick.
    const shifted = (code32 + 0x30d3f) >>> 0; // uint32 add
    const useDecimal = shifted <= 0x61a7e;

    if (useDecimal) {
      // "%d" with a signed 32-bit int.
      this.str = code32.toString(10);
    } else {
      // "0x%x" with the value as an unsigned 32-bit int (glibc/libc %x is
      // an unsigned conversion; the ctor passes the int through %ecx which
      // is naturally reinterpreted as unsigned by %x).
      this.str = "0x" + (code32 >>> 0).toString(16);
    }
  }

  /** Return the formatted C-string. */
  toString(): string {
    return this.str;
  }
}
