// header.ts — Helium framework, file-static free function `header` (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice, unadjusted VAs).
//
// Symbol:  __ZL6headerPKcRj  =  header(char const*, unsigned int&)
//          (`__ZL` = file-local / `static` linkage, so it has no enclosing
//           class — per the naming rule a free function lives in a file named
//           after it, as with invert_anon.ts / clampComponents.ts / glsl.ts.)
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * header(char const*, unsigned int&)   @Helium 0xa7d60
//     __ZL6headerPKcRj
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZL6headerPKcRj.s   (440 lines, @0xa7d60..@0xa83eb)
//
// -----------------------------------------------------------------------------
// WHAT IT IS
// -----------------------------------------------------------------------------
// The shader-source header sniffer. Given a NUL-terminated shader source and an
// out-reference, it skips leading whitespace and `#` lines, matches the source's
// magic prefix (`!!ARBfp`, `//GLfs`, `!!Metal`, ...) against a fixed table,
// writes a profile code into the out-reference, folds an optional `MAJOR.MINOR`
// version into that code, and then skips whitespace and C/C++ comments to see
// whether any body follows.
//
// It is called four times from the Helium shader-compile path — @0xa7cb5,
// @0xa87a4, @0xabf7f and @0xae118 (visible in the HGTransform::HGTransform and
// HGChannelCopy::HGChannelCopy translation units) — always as
// `header(src, &profileWord)`.
//
// -----------------------------------------------------------------------------
// RETURN VALUE — read the ABI carefully, this is NOT a clean bool
// -----------------------------------------------------------------------------
// The callers test the FULL integer register, not just %al:
//   @0xa7cba  testq %rax, %rax ; je ...      (HGTransform TU)
//   @0xa87a9  movq  %rax, %r12               (kept as a 64-bit value)
// and the function only ever writes the 32-bit %eax (which zero-extends into
// %rax), so the observable result is the 32-bit %eax word. That word is NOT
// always 0/1 — it is whatever happened to be in %eax when control reached the
// shared epilogue @0xa8394:
//   * 0                        — every explicit `xorl %eax,%eax` failure exit
//                                (@0xa7f72, @0xa8392) and every prefix match
//                                that zeroes it (@0xa8094, @0xa80a1, ...).
//   * 1                        — ONLY the `!!FP` prefix (`movb $0x1,%al`
//                                @0xa8119).
//   * the parsed MINOR number  — if the source carried a `MAJOR.MINOR` version,
//                                %eax is reused as the minor accumulator
//                                (`xorl %eax,%eax` @0xa8194 then the
//                                @0xa81b0 loop) and is never restored.
// Worked consequence, transcribed rather than "fixed": for `!!ARBfp1.0` the
// minor digit run is "0", so %eax leaves the minor loop as 0 and the function
// returns 0 even though the header parsed fine — while `!!ARBfp1.30` returns 30.
// Modelling this as a TS `boolean` would silently normalise that away, so the
// port returns the raw uint32 %eax and documents that a C++ caller's
// `testq %rax,%rax` is `(returned !== 0)`.
//
// -----------------------------------------------------------------------------
// PROFILE CODE TABLE (the `unsigned int&` out-parameter, %r15)
// -----------------------------------------------------------------------------
// Every code below is a PLAIN IMMEDIATE in the instruction stream. otool
// annotates four of them with a symbol name because the constant happens to
// equal that symbol's address in this binary — they are NOT function pointers
// (they are stored straight into the `unsigned int&` @0xa8133). Resolved with
// `nm -arch x86_64 Helium`:
//   __ZN12_GLOBAL__N_110block_fillEPvm                          = 0x00060b00
//   __ZN13HGRenderUtils17BufferReformatter7executeEP8HGBitmapS2_ = 0x00060500
//   __ZN13HGRenderUtils12BufferCopierC2Ev                       = 0x00060200
//   __ZN21HGShadowHighlightFast16CIToHGBlurRadiusEf             = 0x00030400
//
//   prefix     len  code        set @        consumed  notes
//   ---------  ---  ----------  -----------  --------  ---------------------------
//   "!!ARBfp"   7   0x00060300  0xa8096      p+7
//   "!!NVfp"    6   0x00060400  0xa80b0      p+6
//   "!!ARBvp"   7   0x00050300  0xa80d5      p+7
//   "!!NVvp"    6   0x00050400  0xa7e12      p+6       code preset BEFORE the test
//   "!!NVgp"    6   0x00030400  0xa80f3      p+6       (= CIToHGBlurRadius addr)
//   "!!VP"      4   0x00050400  (inherited)  p+4       reuses the 0xa7e12 preset
//   "!!FP"      4   0x00000000  0xa811b      p+4       and %al = 1 @0xa8119
//   "!!VSP"     5   0x00040400  0xa8128      p+5
//   "!!HGfp"    6   0x00060500  0xa83ac      p+6       (= BufferReformatter addr)
//   "!!HGvp"    6   0x00050500  0xa83b7      p+6
//   "!!CIfp"    6   0x00060200  0xa83c2      p+6       (= BufferCopier addr)
//   "!!SSEfp"   7   0x04260200  0xa83cd      p+7
//   "!!CIsw"    6   0x01060200  0xa83da      p+6
//   "!!CIvp"    6   0x00050200  0xa83e5      p+6
//   "!!CIpp"    6   0x00010200  0xa7f64      p+6       last '!' case; no match => 0
//   "//GLfs"    6   0x00060600  0xa80a3      p+6
//   "//GLvs"    6   0x00050600  0xa80bb      p+6
//   "//GLps"    6   0x00020600  0xa80df      p+6
//   "//GLus"    6   0x00070600  0xa80e9      p+6
//   "//CGfs"    6   0x00060700  0xa8100      p+6
//   "//CGvs"    6   0x00050700  0xa810f      p+6
//   "//Metal"   7   0x00060b00  0xa8089      p+7       (= block_fill addr)
//
// The `!!VP` case is a genuine compiler-level subtlety, transcribed as-is: no
// `movl` sets %r12 on its path, so it INHERITS the 0x50400 preset that
// @0xa7e12 installed for the earlier `!!NVvp` test. `!!VP` and `!!NVvp`
// therefore report the same profile code.
//
// -----------------------------------------------------------------------------
// OUT-OF-SCOPE EXTERNS (modelled at the boundary, PORTING_SPEC Rule 3)
// -----------------------------------------------------------------------------
//   * _strncmp (libc) — stub 0x3c5618, called 22 times (@0xa7db1 ... @0xa8078).
//     Pure byte comparison over a NUL-terminated string and a literal; modelled
//     directly on the JS string model below (no host boundary needed — a
//     prefix compare has no platform behaviour to fake).
// FRONTIER CALLEES: none in-scope. Dependencies: 0 in-scope, 0 indirect,
// 1 out-of-scope extern (_strncmp).
//
// -----------------------------------------------------------------------------
// STRING MODEL
// -----------------------------------------------------------------------------
// `char const*` is modelled as a JS string plus an integer index (the pointer),
// with `charCodeAt` past the end reading as 0 — the NUL terminator. Every
// comparison in the disasm is on a `movzbl`-loaded BYTE, so `readByte` below
// masks to 8 bits and returns 0 at/after the end, which is exactly what the
// machine sees for a properly NUL-terminated buffer.
// -----------------------------------------------------------------------------

/**
 * Read the byte at `i` of `s`, the way `movzbl (%reg), %e??` does: an unsigned
 * 8-bit load, with the NUL terminator (0) at and past the end of the buffer.
 */
function readByte(s: string, i: number): number {
  // Out of range = the NUL terminator the C string is required to carry.
  if (i < 0 || i >= s.length) return 0;
  return s.charCodeAt(i) & 0xff;
}

/**
 * `_strncmp(p, literal, n) == 0` — the only property of strncmp this function
 * ever uses is equality against a fixed ASCII literal (every call site does
 * `testl %eax,%eax ; je`). Compares `n` bytes with the same byte semantics as
 * `readByte`, so a short buffer compares its NUL against the literal and fails,
 * exactly as libc's strncmp does.
 */
function strncmpEq(s: string, p: number, literal: string, n: number): boolean {
  for (let k = 0; k < n; k++) {
    if (readByte(s, p + k) !== (literal.charCodeAt(k) & 0xff)) return false;
  }
  return true;
}

/**
 * `(uint8)(c - 0x21) > 0xdf` — the machine's whitespace test, used verbatim at
 * @0xa7f8a, @0xa822a, @0xa826d and @0xa831d (`leal -0x21(%rcx),%edx` then
 * `cmpb $-0x21,%dl ; ja`).
 *
 * Reading the byte arithmetic: `(c - 0x21) & 0xff > 0xdf` holds exactly for
 * c in [0x01, 0x20] — every control character and the space — and is FALSE for
 * c == 0 (which wraps to 0xdf, not greater) and for every printable c >= 0x21.
 * So "keep skipping" means "c is whitespace/control and not the terminator".
 *
 * The sibling form `cmpb $-0x20,%dl ; jb` (@0xa7f7a, @0xa8211) is the negation
 * — `(c - 0x21) & 0xff < 0xe0` — i.e. stop skipping; same partition.
 */
function isSkippableByte(c: number): boolean {
  return ((c - 0x21) & 0xff) > 0xdf;
}

/** `(uint8)(d - 0x3a) >= 0xf6` — the digit test @0xa813f / @0xa8166 /
 *  @0xa8196 / @0xa81c7. True exactly for d in [0x30,0x39] = '0'..'9'. */
function isDigitByte(d: number): boolean {
  return ((d - 0x3a) & 0xff) >= 0xf6;
}

/** A C++ `unsigned int&` out-parameter (%rsi, kept in %r15 @0xa7d9f/@0xa7fba). */
export interface UIntRef {
  value: number;
}

/**
 * `header(char const* src, unsigned int& profileOut)` — @Helium 0xa7d60
 * (__ZL6headerPKcRj).
 *
 * Returns the raw 32-bit %eax word (see the RETURN VALUE section in the file
 * header — it is NOT a normalised bool; callers do `testq %rax,%rax`).
 * `profileOut.value` receives the profile code from the table in the file
 * header, optionally folded with the parsed `MAJOR.MINOR` version.
 *
 * Register map used throughout the comments:
 *   %rbx / `p`        — the walking source pointer (modelled as an index)
 *   %r15              — `profileOut`
 *   %r12 / `code`     — the profile code being assembled (written to *%r15)
 *   %r14 / `cursor`   — the post-prefix scan pointer
 *   %eax / `eax`      — the return word (and, later, the MINOR accumulator)
 *   %esi / `major`, %eax / `minor` — the two decimal accumulators
 *   %ecx / `ecx`      — scratch; also the "code snapshot" at @0xa8181
 */
export function header(src: string, profileOut: UIntRef): number {
  // @0xa7d60 movzbl (%rdi),%ecx ; @0xa7d63 testl ; @0xa7d65 je 0xa7f72
  //   An empty string returns 0 BEFORE the prologue — note this early exit
  //   never touches profileOut.
  let c = readByte(src, 0);
  if (c === 0) {
    // @0xa7f72 xorl %eax,%eax ; @0xa7f74 retq
    return 0;
  }

  // @0xa7d79 movq %rdi,%rbx : p = src.
  let p = 0;
  // %eax — the eventual return word. Zeroed on entry to the skip loop
  // @0xa7f75 and by every prefix arm; only `!!FP` ever sets it to 1.
  let eax = 0;

  // @0xa7d7c cmpl $0x21,%ecx ; je 0xa7d8a  : '!' goes straight to dispatch.
  // @0xa7d81 cmpl $0x2f,%ecx ; jne 0xa7f75 : '/' too; anything else must first
  //   run the whitespace / '#'-comment skipper.
  if (c !== 0x21 /* '!' */ && c !== 0x2f /* '/' */) {
    // ---- @0xa7f75 : skip whitespace, then '#' comment lines, then retry ----
    // @0xa7f75 xorl %eax,%eax
    eax = 0;
    for (;;) {
      // @0xa7f77..@0xa7f8d : while (isSkippable(c)) c = *++p;
      //   (the entry test @0xa7f7a is the `jb` negation, the loop-back test
      //    @0xa7f8a is the `ja` form — same partition, see isSkippableByte.)
      while (isSkippableByte(c)) {
        // @0xa7f80 movzbl 0x1(%rbx),%ecx ; @0xa7f84 incq %rbx
        c = readByte(src, p + 1);
        p = p + 1;
      }
      // @0xa7f8f cmpb $0x23,%cl ; @0xa7f92 jne 0xa80c5
      if (c !== 0x23 /* '#' */) {
        // @0xa80c5 movzbl %cl,%eax ; @0xa80c8 testl ; @0xa80ca jne 0xa7d8a
        if (c !== 0) break; // -> re-enter the dispatch at @0xa7d8a
        // @0xa80d0 jmp 0xa8392 : xorl %eax,%eax ; return.
        return 0;
      }
      // ---- @0xa7f98 : swallow the rest of the '#' line ----
      // @0xa7f98 movq %rbx,%rdx : q = p.
      let q = p;
      for (;;) {
        // @0xa7fa0 movzbl 0x1(%rdx),%ecx
        c = readByte(src, q + 1);
        // @0xa7fa4 testb %cl,%cl ; @0xa7fa6 je 0xa8394 : unterminated line —
        //   return the CURRENT eax (still 0 from @0xa7f75).
        if (c === 0) return eax >>> 0;
        // @0xa7fac leaq 0x1(%rdx),%rbx : p = q + 1.
        p = q + 1;
        // @0xa7fb0 cmpb $0xa,(%rdx) : was the byte we just stepped over '\n'?
        const wasNewline = readByte(src, q) === 0x0a;
        // @0xa7fb3 movq %rbx,%rdx : q = q + 1.
        q = p;
        // @0xa7fb6 jne 0xa7fa0 / @0xa7fb8 jmp 0xa7f77
        if (wasNewline) break; // back to the whitespace skip with this c/p
      }
    }
    // Falls out of the skipper with c != 0, heading for @0xa7d8a.
  }

  // ---------------------------------------------------------------------------
  // @0xa7d8a — DISPATCH on the first character.
  // ---------------------------------------------------------------------------
  // `code` is %r12; `cursor` is %r14. Both are only meaningful once a prefix
  // has matched, so they start at the values the machine leaves them at.
  let code = 0;
  let cursor = 0;

  // @0xa7d8a cmpb $0x2f,%cl ; je 0xa7fba
  if (c === 0x2f /* '/' */) {
    // ---- the "//" family @0xa7fba ----
    // @0xa7fba movq %rsi,%r15 : profileOut becomes live here.
    // @0xa7fd1 leaq 0x6(%rbx),%r14 : the 6-byte prefixes all land on p+6.
    if (strncmpEq(src, p, "//GLfs", 6)) {
      // @0xa80a1 xorl %eax,%eax ; @0xa80a3 movl $0x60600,%r12d
      eax = 0;
      code = 0x60600;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "//GLvs", 6)) {
      // @0xa80bb movl $0x50600,%r12d ; @0xa80c1 xorl %eax,%eax
      code = 0x50600;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "//GLps", 6)) {
      // @0xa80df movl $0x20600,%r12d ; @0xa80e5 xorl %eax,%eax
      code = 0x20600;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "//GLus", 6)) {
      // @0xa80e9 movl $0x70600,%r12d ; @0xa80ef xorl %eax,%eax
      code = 0x70600;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "//CGfs", 6)) {
      // @0xa8100 movl $0x60700,%r12d ; @0xa8106 xorl %eax,%eax
      code = 0x60700;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "//CGvs", 6)) {
      // @0xa810f movl $0x50700,%r12d ; @0xa8115 xorl %eax,%eax
      code = 0x50700;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "//Metal", 7)) {
      // @0xa8085 addq $0x7,%rbx ; @0xa8089 movl $0x60b00,%r12d
      // @0xa812e xorl %eax,%eax ; @0xa8130 movq %rbx,%r14
      p = p + 7;
      code = 0x60b00;
      eax = 0;
      cursor = p;
    } else {
      // @0xa807f jne 0xa8392 : no "//"-family match at all -> return 0.
      return 0;
    }
  } else if (c === 0x21 /* '!' */) {
    // ---- the "!!" family @0xa7d9f ----
    // @0xa7d9f movq %rsi,%r15 : profileOut becomes live here.
    // @0xa7db6 leaq 0x7(%rbx),%r14 : the 7-byte prefixes land on p+7.
    // @0xa7dd6 leaq 0x6(%rbx),%r13 : the 6-byte prefixes land on p+6.
    if (strncmpEq(src, p, "!!ARBfp", 7)) {
      // @0xa8094 xorl %eax,%eax ; @0xa8096 movl $0x60300,%r12d
      eax = 0;
      code = 0x60300;
      cursor = p + 7;
    } else if (strncmpEq(src, p, "!!NVfp", 6)) {
      // @0xa80ae xorl %eax,%eax ; @0xa80b0 movl $0x60400,%r12d
      // @0xa80b6 movq %r13,%r14
      eax = 0;
      code = 0x60400;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!ARBvp", 7)) {
      // @0xa80d5 movl $0x50300,%r12d ; @0xa80db xorl %eax,%eax
      //   %r14 still holds the p+7 from @0xa7db6.
      code = 0x50300;
      eax = 0;
      cursor = p + 7;
    } else if (strncmpEq(src, p, "!!NVvp", 6)) {
      // @0xa7e12 movl $0x50400,%r12d (preset BEFORE this strncmp)
      // @0xa80f9 xorl %eax,%eax ; @0xa80fb movq %r13,%r14
      code = 0x50400;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!NVgp", 6)) {
      // @0xa80f3 movl $0x30400,%r12d (= CIToHGBlurRadius's address, a plain
      //   immediate) then falls into @0xa80f9's xorl/%r13 pair.
      code = 0x30400;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!VP", 4)) {
      // @0xa7e52 leaq 0x4(%rbx),%rdx ; @0xa7e56 xorl %eax,%eax
      // @0xa810a movq %rdx,%r14 : NOTHING sets %r12 on this path, so the code
      //   is still the 0x50400 preset from @0xa7e12 — see the file header.
      code = 0x50400;
      eax = 0;
      cursor = p + 4;
    } else if (strncmpEq(src, p, "!!FP", 4)) {
      // @0xa8119 movb $0x1,%al ; @0xa811b xorl %r12d,%r12d
      // @0xa811e movq -0x30(%rbp),%r14 : the p+4 spilled at @0xa7e60.
      eax = 1;
      code = 0;
      cursor = p + 4;
    } else if (strncmpEq(src, p, "!!VSP", 5)) {
      // @0xa8124 addq $0x5,%rbx ; @0xa8128 movl $0x40400,%r12d
      // @0xa812e xorl %eax,%eax ; @0xa8130 movq %rbx,%r14
      p = p + 5;
      code = 0x40400;
      eax = 0;
      cursor = p;
    } else if (strncmpEq(src, p, "!!HGfp", 6)) {
      // @0xa83ac movl $0x60500,%r12d ; jmp 0xa80f9 (xorl %eax,%eax ; %r14=%r13)
      code = 0x60500;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!HGvp", 6)) {
      // @0xa83b7 movl $0x50500,%r12d ; jmp 0xa80f9
      code = 0x50500;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!CIfp", 6)) {
      // @0xa83c2 movl $0x60200,%r12d ; jmp 0xa80f9
      code = 0x60200;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!SSEfp", 7)) {
      // @0xa83cd movl $0x4260200,%r12d ; @0xa83d3 xorl %eax,%eax
      //   %r14 is the p+7 from @0xa7db6 (7-byte prefix).
      code = 0x4260200;
      eax = 0;
      cursor = p + 7;
    } else if (strncmpEq(src, p, "!!CIsw", 6)) {
      // @0xa83da movl $0x1060200,%r12d ; jmp 0xa80f9
      code = 0x1060200;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!CIvp", 6)) {
      // @0xa83e5 movl $0x50200,%r12d ; jmp 0xa80f9
      code = 0x50200;
      eax = 0;
      cursor = p + 6;
    } else if (strncmpEq(src, p, "!!CIpp", 6)) {
      // @0xa7f64 movl $0x10200,%r12d ; @0xa7f6a movq %r13,%r14
      //   (%eax was zeroed at @0xa7f5a before the branch.)
      code = 0x10200;
      eax = 0;
      cursor = p + 6;
    } else {
      // @0xa7f5a xorl %eax,%eax ; @0xa7f5e jne 0xa8394 : the last '!' case
      //   failing returns 0 — note it exits via @0xa8394, not @0xa8392, but
      //   %eax was just zeroed so the value is the same.
      return 0;
    }
  } else {
    // @0xa7d99 jne 0xa8392 : the dispatch char was neither '!' nor '/'.
    return 0;
  }

  // ---------------------------------------------------------------------------
  // @0xa8133 — publish the base code, then parse an optional MAJOR[.MINOR].
  // ---------------------------------------------------------------------------
  // @0xa8133 movl %r12d,(%r15)
  profileOut.value = code >>> 0;

  // @0xa8136 movzbl (%r14),%edx : d = *cursor.
  let d = readByte(src, cursor);
  // @0xa813d xorl %esi,%esi : the MAJOR accumulator.
  let major = 0;
  // @0xa8181 / @0xa816f — %ecx: 0 when the `!!FP` flag is set, else the code
  //   snapshot taken after the major fold.
  let ecx = 0;
  // rdi @0xa816b — the byte that terminated the major digit run.
  let terminatorAt = cursor;
  let sawVersion = false;

  // @0xa813f cmpb $-0xa,%cl ; @0xa8142 jae 0xa814c : is *cursor a digit?
  if (isDigitByte(d)) {
    sawVersion = true;
    // @0xa814c incq %r14 : step past the first digit before the loop body.
    cursor = cursor + 1;
    // ---- @0xa8150 : the MAJOR decimal accumulate ----
    for (;;) {
      // @0xa8150 leal (%rsi,%rsi,4),%ecx ; @0xa8156 leal (%rdx,%rcx,2),%esi
      // @0xa8159 addl $-0x30,%esi :  major = major*10 + (d - '0')
      major = (major * 10 + d - 0x30) | 0;
      // @0xa815c movzbl (%r14),%edx ; @0xa8163 incq %r14
      d = readByte(src, cursor);
      cursor = cursor + 1;
      // @0xa8166 cmpb $-0xb,%cl ; @0xa8169 ja 0xa8150
      if (!isDigitByte(d)) break;
    }
    // @0xa816b leaq -0x1(%r14),%rdi : the non-digit that stopped the run.
    terminatorAt = cursor - 1;

    // @0xa816f xorl %ecx,%ecx ; @0xa8171 testb %al,%al ; @0xa8173 jne 0xa8184
    ecx = 0;
    if ((eax & 0xff) === 0) {
      // @0xa8175 shll $0x4,%esi ; @0xa8178 addl %esi,%r12d
      //   The major number is folded in as a NIBBLE-SHIFTED addend.
      major = (major << 4) | 0;
      code = (code + major) | 0;
      // @0xa817b movl %r12d,(%r15)
      profileOut.value = code >>> 0;
      // @0xa817e movzbl (%rdi),%edx : reload the terminator byte.
      d = readByte(src, terminatorAt);
      // @0xa8181 movl %r12d,%ecx
      ecx = code | 0;
    }
    // (When %al was set — the `!!FP` prefix — the shift/add/store are SKIPPED
    //  entirely and %ecx stays 0; %edx already holds the terminator from the
    //  loop exit, so @0xa8184 reads the same byte either way.)

    // @0xa8184 cmpb $0x2e,%dl ; @0xa8187 jne 0xa82f1
    if (d === 0x2e /* '.' */) {
      // ---- @0xa818d : the MINOR run ----
      // @0xa818d movzbl (%r14),%edx : the byte after the '.'.
      d = readByte(src, cursor);
      // @0xa8194 xorl %eax,%eax : %eax is REUSED as the minor accumulator —
      //   this is where the surprising return value comes from.
      eax = 0;
      // @0xa8196 cmpb $-0xa,%sil ; @0xa819a jae 0xa81b0
      if (!isDigitByte(d)) {
        // @0xa819c xorl %r14d,%r14d : cursor = NULL.
        cursor = 0;
        // @0xa819f movl %ecx,%r12d ; @0xa81a2 cmpl $0xff,%ecx
        code = ecx | 0;
        if ((ecx >>> 0) <= 0xff) {
          // @0xa81aa jmp 0xa8303 : movl $0x60400,(%r15)
          profileOut.value = 0x60400;
          return skipWhitespaceAndCComments(src, cursor, eax);
        }
        // @0xa81a8 ja 0xa81e9 : straight to the flag test.
        return flagTail(src, cursor, code, eax);
      }
      for (;;) {
        // @0xa81b0 leal (%rax,%rax,4),%eax ; @0xa81b6 leal (%rdx,%rax,2),%eax
        // @0xa81b9 addl $-0x30,%eax : minor = minor*10 + (d - '0')
        eax = (eax * 10 + d - 0x30) | 0;
        // @0xa81bc movzbl 0x1(%r14),%edx ; @0xa81c1 incq %r14
        d = readByte(src, cursor + 1);
        cursor = cursor + 1;
        // @0xa81c7 cmpb $-0xb,%sil ; @0xa81cb ja 0xa81b0
        if (!isDigitByte(d)) break;
      }
      // @0xa81cd testl %ecx,%ecx ; @0xa81cf je 0xa8303
      if (ecx === 0) {
        // The `!!FP` path (code never folded): force the code to 0x60400.
        // @0xa8303 movl $0x60400,(%r15) ; jmp 0xa8310
        profileOut.value = 0x60400;
        return skipWhitespaceAndCComments(src, cursor, eax);
      }
      // @0xa81d5 addl %eax,%ecx ; @0xa81d7 movl %ecx,(%r15) ; @0xa81da movl %ecx,%r12d
      //   The MINOR is added to the code UNSHIFTED (contrast the major's <<4).
      ecx = (ecx + eax) | 0;
      profileOut.value = ecx >>> 0;
      code = ecx | 0;
      // @0xa81dd cmpl $0xff,%ecx ; @0xa81e3 jbe 0xa8303
      if ((ecx >>> 0) <= 0xff) {
        profileOut.value = 0x60400;
        return skipWhitespaceAndCComments(src, cursor, eax);
      }
      // @0xa81e9 : fall through to the flag test.
      return flagTail(src, cursor, code, eax);
    }

    // ---- @0xa82f1 : a version run with no '.' ----
    // @0xa82f1 movq %rdi,%r14 : cursor = the terminating byte.
    cursor = terminatorAt;
    // @0xa82f4 movl %ecx,%r12d ; @0xa82f7 cmpl $0xff,%ecx
    code = ecx | 0;
    if ((ecx >>> 0) <= 0xff) {
      // @0xa8303 movl $0x60400,(%r15) ; jmp 0xa8310
      profileOut.value = 0x60400;
      return skipWhitespaceAndCComments(src, cursor, eax);
    }
    // @0xa82fd ja 0xa81e9
    return flagTail(src, cursor, code, eax);
  }

  // @0xa8144 xorl %r14d,%r14d ; @0xa8147 jmp 0xa81e9 : no version digits at
  //   all — the cursor is NULLed and we go straight to the flag test with
  //   %eax still holding the prefix arm's value (1 only for `!!FP`).
  void sawVersion;
  cursor = 0;
  return flagTail(src, cursor, code, eax);
}

/**
 * @0xa81e9 — the flag test that picks which trailing scanner runs.
 *
 *   @0xa81e9 testl $0x600,%r12d ; @0xa81f0 jne 0xa8310
 *   @0xa81f6 testl $0x900,%r12d ; @0xa81fd jne 0xa8260
 *   otherwise fall through to @0xa81ff
 *
 * @0xa8310 and @0xa8260 are BYTE-FOR-BYTE the same routine — the compiler
 * duplicated the whitespace+C/C++-comment skipper for the two flag arms (the
 * only difference is the internal label numbering: @0xa830c vs @0xa825a for
 * the NUL-restart, @0xa8360 vs @0xa82c0 for the block-comment head). They are
 * therefore one function here, called from both arms.
 */
function flagTail(
  src: string,
  cursor: number,
  code: number,
  eax: number,
): number {
  // @0xa81e9 testl $0x600,%r12d
  if ((code & 0x600) !== 0) {
    // @0xa81f0 jne 0xa8310
    return skipWhitespaceAndCComments(src, cursor, eax);
  }
  // @0xa81f6 testl $0x900,%r12d
  if ((code & 0x900) !== 0) {
    // @0xa81fd jne 0xa8260 — the duplicate of @0xa8310.
    return skipWhitespaceAndCComments(src, cursor, eax);
  }
  // @0xa81ff — the third arm: whitespace + '#' comment lines.
  return skipWhitespaceAndHashComments(src, cursor, eax);
}

/**
 * @0xa81ff..@0xa8258 (+ the @0xa83a3 exit) — skip whitespace and `#` comment
 * lines, then report whether anything is left.
 *
 *   @0xa81ff movzbl (%r14),%ecx ; testb ; je 0xa8392   -> empty => return 0
 *   @0xa820b movq %r14,%rax
 *   @0xa820e..@0xa822d  while (isSkippable(c)) c = *++rax
 *   @0xa822f cmpb $0x23,%cl ; jne 0xa83a3
 *   @0xa8238..@0xa8256  swallow through the next '\n' (NUL => @0xa8392, 0)
 *   @0xa8258 jmp 0xa820e (re-skip whitespace)
 *   @0xa83a3 movzbl %cl,%ecx ; testl ; je 0xa8392 (0) ; jmp 0xa8394 (eax)
 */
function skipWhitespaceAndHashComments(
  src: string,
  cursor: number,
  eax: number,
): number {
  // @0xa81ff movzbl (%r14),%ecx ; @0xa8203 testb %cl,%cl ; @0xa8205 je 0xa8392
  let c = readByte(src, cursor);
  if (c === 0) return 0;
  // @0xa820b movq %r14,%rax
  let a = cursor;
  for (;;) {
    // @0xa820e..@0xa822d : while (isSkippable(c)) { c = a[1]; ++a; }
    while (isSkippableByte(c)) {
      // @0xa8220 movzbl 0x1(%rax),%ecx ; @0xa8224 incq %rax
      c = readByte(src, a + 1);
      a = a + 1;
    }
    // @0xa822f cmpb $0x23,%cl ; @0xa8232 jne 0xa83a3
    if (c !== 0x23 /* '#' */) {
      // @0xa83a3 movzbl %cl,%ecx ; @0xa83a6 testl ; @0xa83a8 je 0xa8392
      if (c === 0) return 0;
      // @0xa83aa jmp 0xa8394 : return the CURRENT %eax, untouched.
      return eax >>> 0;
    }
    // @0xa8238 movq %rax,%rdx : q = a.
    let q = a;
    for (;;) {
      // @0xa8240 movzbl 0x1(%rdx),%ecx ; @0xa8244 testb ; @0xa8246 je 0xa8392
      c = readByte(src, q + 1);
      if (c === 0) return 0;
      // @0xa824c leaq 0x1(%rdx),%rax : a = q + 1.
      a = q + 1;
      // @0xa8250 cmpb $0xa,(%rdx)
      const wasNewline = readByte(src, q) === 0x0a;
      // @0xa8253 movq %rax,%rdx
      q = a;
      // @0xa8256 jne 0xa8240 / @0xa8258 jmp 0xa820e
      if (wasNewline) break;
    }
  }
}

/**
 * @0xa8310..@0xa838c (identical twin @0xa8260..@0xa82ec) — skip whitespace and
 * C/C++ comments, then report whether anything is left.
 *
 *   @0xa8310 movq %r14,%rax ; movzbl (%r14),%ecx ; incq %r14
 *   @0xa831d cmpb $-0x21,%dl ; ja 0xa8310        (skip whitespace; rax = &c)
 *   @0xa8322 cmpl $0x2f,%ecx ; jne 0xa838e       (not '/': see below)
 *   @0xa8327 movzbl (%r14),%ecx                  (the byte after the '/')
 *   @0xa832b cmpl $0x2a,%ecx ; je 0xa8360        ('*' -> block comment)
 *   @0xa8330 cmpl $0x2f,%ecx ; jne 0xa8394       (not a comment -> return eax)
 *   @0xa8335 addq $0x2,%rax                      ('//' -> line comment)
 *   @0xa8340..@0xa8352  run to just past the next '\n' (NUL -> restart at the
 *                       skip with cursor = rax), then restart the skip
 *   @0xa8360..@0xa838c  block comment: advance until rax[-2..-1] == "*", "/"
 *                       (NUL -> restart the skip), then restart the skip
 *   @0xa838e testl %ecx,%ecx ; jne 0xa8394 (return eax) ; else @0xa8392 (0)
 *
 * Note the block-comment scan starts at rax+2, i.e. the two-byte lookbehind
 * cannot match the comment's own opening "/*" — an empty comment still needs a
 * real closing delimiter. Transcribed as-is.
 */
function skipWhitespaceAndCComments(
  src: string,
  cursor: number,
  eax: number,
): number {
  let r14 = cursor;
  for (;;) {
    // ---- @0xa8310 : the whitespace skip. `a` is %rax = the byte's address,
    //      %r14 is always one past it.
    let a: number;
    let c: number;
    for (;;) {
      // @0xa8310 movq %r14,%rax ; @0xa8313 movzbl (%r14),%ecx ; @0xa831a incq %r14
      a = r14;
      c = readByte(src, r14);
      r14 = r14 + 1;
      // @0xa831d cmpb $-0x21,%dl ; @0xa8320 ja 0xa8310
      if (!isSkippableByte(c)) break;
    }
    // @0xa8322 cmpl $0x2f,%ecx ; @0xa8325 jne 0xa838e
    if (c !== 0x2f /* '/' */) {
      // @0xa838e testl %ecx,%ecx ; @0xa8390 jne 0xa8394 ; else @0xa8392.
      if (c === 0) return 0;
      return eax >>> 0;
    }
    // @0xa8327 movzbl (%r14),%ecx : the byte after the '/'.
    c = readByte(src, r14);
    // @0xa832b cmpl $0x2a,%ecx ; @0xa832e je 0xa8360
    if (c === 0x2a /* '*' */) {
      // ---- @0xa8360 : block comment ----
      // @0xa8360 leaq 0x2(%rax),%r14 ; @0xa8364 cmpb $0x0,0x2(%rax)
      r14 = a + 2;
      let atNul = readByte(src, a + 2) === 0;
      for (;;) {
        // @0xa8378 movq %r14,%rax ; @0xa837b je 0xa8310
        a = r14;
        if (atNul) break; // NUL -> restart the whitespace skip
        // @0xa837d cmpb $0x2a,-0x2(%rax) ; @0xa8383 cmpb $0x2f,-0x1(%rax)
        if (
          readByte(src, a - 2) === 0x2a /* '*' */ &&
          readByte(src, a - 1) === 0x2f /* '/' */
        ) {
          // @0xa8389 movq %rax,%r14 ; @0xa838c jmp 0xa8310
          r14 = a;
          break;
        }
        // @0xa8370 leaq 0x1(%rax),%r14 ; @0xa8374 cmpb $0x0,0x1(%rax)
        r14 = a + 1;
        atNul = readByte(src, a + 1) === 0;
      }
      continue; // -> @0xa8310
    }
    // @0xa8330 cmpl $0x2f,%ecx ; @0xa8333 jne 0xa8394
    if (c !== 0x2f /* '/' */) {
      // A lone '/' that starts no comment: return the current %eax.
      return eax >>> 0;
    }
    // ---- @0xa8335 : line comment ----
    // @0xa8335 addq $0x2,%rax
    a = a + 2;
    for (;;) {
      // @0xa8340 cmpb $0x0,(%rax) ; @0xa8343 je 0xa830c
      if (readByte(src, a) === 0) {
        // @0xa830c movq %rax,%r14 : restart the skip at the NUL.
        r14 = a;
        break;
      }
      // @0xa8345 cmpb $0xa,-0x1(%rax) ; @0xa8349 movq %rax,%r14
      const prevWasNewline = readByte(src, a - 1) === 0x0a;
      r14 = a;
      // @0xa834c leaq 0x1(%rax),%rax
      a = a + 1;
      // @0xa8350 jne 0xa8340 / @0xa8352 jmp 0xa8310
      if (prevWasNewline) break;
    }
    // -> @0xa8310
  }
}
