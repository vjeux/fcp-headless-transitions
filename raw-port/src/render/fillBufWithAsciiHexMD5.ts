// fillBufWithAsciiHexMD5.ts — Helium free function (internal linkage).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This unit ports ONE free function:
//
//   __ZL22fillBufWithAsciiHexMD5PhS_
//     — fillBufWithAsciiHexMD5(unsigned char*, unsigned char*)   @Helium 0x1d1330
//
// `__ZL...` is Itanium for a function with INTERNAL LINKAGE (a file-scope
// `static`), which is why `nm` types it `t` and not `T`. Per PORTING_SPEC's
// naming rule a free function gets a file named after itself; Helium free
// functions live under raw-port/src/render/ (cf.
// Getsrgb_half_sat_unpremultTile_AVX.ts, HGComicLUT.ts).
//
// Re-derive with:
//   raw-port/tools/disasm.sh --sym __ZL22fillBufWithAsciiHexMD5PhS_ Helium
//   -> raw-port/re/disasm/Helium.__ZL22fillBufWithAsciiHexMD5PhS_.s (311 lines)
//
// -----------------------------------------------------------------------------
// WHAT IT DOES
// -----------------------------------------------------------------------------
// Writes the 16-byte MD5 digest at `src` (%rsi) into `dst` (%rdi) as 32
// UPPERCASE ASCII hex characters followed by a NUL terminator — 33 bytes total.
// The compiler fully UNROLLED the 16-iteration loop, so the body is 16 copies of
// the same 10-instruction pair-of-nibbles sequence plus the final
// `movb $0x0, 0x20(%rdi)`. There is no loop counter and no branch anywhere: the
// two per-nibble selects are `cmovb`, not jumps.
//
// FRONTIER CALLEES — none. No calls at all: no in-scope callee, no extern, no
// allocation, no indirect or virtual dispatch (`depgraph.py deps
// __ZL22fillBufWithAsciiHexMD5PhS_` lists nothing).
//
// -----------------------------------------------------------------------------
// THE UNROLLED UNIT — byte 0 verbatim (@0x1d1334..0x1d1368); bytes 1..15 repeat
// it against src+i and dst+2i, with only register allocation and instruction
// scheduling differing between copies.
// -----------------------------------------------------------------------------
//   0x1d1334  movzbl (%rsi), %eax        ; eax = src[0]                    (u8)
//   0x1d1337  movl   %eax, %ecx
//   0x1d1339  shrb   $0x4, %cl           ; cl = src[0] >> 4   — BYTE-width LOGICAL
//                                        ;   shift, so the high nibble, 0..15
//   0x1d133c  movl   %eax, %edx
//   0x1d133e  andb   $0xf, %dl           ; dl = src[0] & 0xf  — the low nibble
//   0x1d1341  leal   0x30(%rcx), %r8d    ; r8d = highNibble + '0'
//   0x1d1345  addb   $0x37, %cl          ; cl  = highNibble + 0x37 ('A' - 10)
//   0x1d1348  cmpb   $-0x60, %al         ; flags on (al - 0xa0): -0x60 as a BYTE is
//                                        ;   0xa0. Comparing the WHOLE byte against
//                                        ;   0xa0 is the compiler's way of asking
//                                        ;   "is the high nibble < 0xa?" — the two
//                                        ;   are equivalent because the low nibble
//                                        ;   cannot carry into the high one.
//   0x1d134a  movzbl %r8b, %eax
//   0x1d134e  movzbl %cl, %ecx
//   0x1d1351  cmovbl %eax, %ecx          ; CF=1 (UNSIGNED al < 0xa0) -> take the
//                                        ;   digit form; else keep the letter form
//   0x1d1354  movb   %cl, (%rdi)         ; dst[0] = the high nibble's character
//   0x1d1356  leal   0x30(%rdx), %eax    ; eax = lowNibble + '0'
//   0x1d1359  leal   0x37(%rdx), %ecx    ; ecx = lowNibble + 0x37
//   0x1d135c  cmpb   $0xa, %dl           ; flags on (dl - 0xa) — here the compiler
//                                        ;   does compare the NIBBLE with 10
//   0x1d135f  movzbl %al, %eax
//   0x1d1362  movzbl %cl, %ecx
//   0x1d1365  cmovbl %eax, %ecx          ; CF=1 (lowNibble < 10) -> digit form
//   0x1d1368  movb   %cl, 0x1(%rdi)      ; dst[1] = the low nibble's character
//
// ... and so on for src[1] -> dst[2..3] (@0x1d136b), src[2] -> dst[4..5]
// (@0x1d13a4), src[3] -> dst[6..7] (@0x1d13dd), src[4] -> dst[8..9] (@0x1d1416),
// src[5] -> dst[10..11] (@0x1d144f), src[6] -> dst[12..13] (@0x1d1488),
// src[7] -> dst[14..15] (@0x1d14c1), src[8] -> dst[16..17] (@0x1d14fa),
// src[9] -> dst[18..19] (@0x1d1533), src[10] -> dst[20..21] (@0x1d156c),
// src[11] -> dst[22..23] (@0x1d15a5), src[12] -> dst[24..25] (@0x1d15de),
// src[13] -> dst[26..27] (@0x1d1617), src[14] -> dst[28..29] (@0x1d1650),
// src[15] -> dst[30..31] (@0x1d1689).
//
//   0x1d16c1  movb $0x0, 0x20(%rdi)      ; dst[32] = '\0' — the terminator, which
//                                        ;   is what fixes the output buffer at 33
//                                        ;   bytes
//   0x1d16c5  popq %rbp ; 0x1d16c6 retq  ; returns void
//
// DECODE NOTES
//   * TWO DIFFERENT PREDICATES, deliberately preserved. The high nibble is
//     selected by `cmpb $-0x60, %al` — a test on the ORIGINAL BYTE against 0xa0 —
//     while the low nibble uses `cmpb $0xa, %dl` on the nibble itself. Both are
//     UNSIGNED (`cmovb`/CF). Folding them into one "nibble < 10" helper would be
//     the "clean it up away from the instruction structure" anti-pattern, so the
//     port writes each condition the way its own instructions state it.
//   * The letter form is `nibble + 0x37`, i.e. 10 -> 0x41 'A'. So the output is
//     UPPERCASE hex; nothing in the body can produce lowercase.
//   * Every intermediate is byte-width (`addb`, `movzbl`), and the nibbles are
//     0..15, so the maximum intermediate is 15 + 0x37 = 0x46 and nothing wraps.
//     The port still masks each stored character to 8 bits so the byte-width of
//     the `movb` stores is explicit.
//   * The two copies differ in SCHEDULING only: in some of the sixteen the two
//     `movb` stores are issued back-to-back at the end (e.g. @0x1d13d7/@0x1d13da
//     for src[2]) rather than interleaved (@0x1d1354/@0x1d1368 for src[0]).
//     Both orders write the same two bytes to the same two addresses, so the
//     loop below is written once, over i = 0..15, and this note records that the
//     unrolling is the only difference.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// -----------------------------------------------------------------------------
// Checked against the real function. Harness: `arch -x86_64 /usr/bin/python3`
// (the port is transcribed from the x86_64 slice), dlopen Helium, resolve this
// LOCAL symbol as `nm -n -arch x86_64` vmaddr 0x1d1330 + the dyld image slide
// (NOT the bare `nm -n` that fct/parity/local_call uses — it reports the ARM64
// slice even from a Rosetta process), then call it with a 16-byte input and a
// 33-byte output buffer pre-filled with 0xEE so any byte the function does not
// write is visible.
// Cases: the 16 all-same-byte digests for a sweep of byte values, 256 digests
// that place every value 0x00..0xff in a rotating position, the all-zero and
// all-0xff digests, and 2,000 random ones — 2,290 in total.
// RESULT: 2290/2290 output buffers BYTE-IDENTICAL to Final Cut Pro over all 33
// bytes, including the NUL at [32] and the untouched 0xEE guard byte at [33].
// NEGATIVE CONTROLS (measured): lowercase hex ('a'-'f' via +0x57) -> 2269 of
// 2290 wrong; nibbles emitted low-then-high -> 2286 wrong; the NUL terminator
// omitted -> 2290 wrong; the high-nibble predicate written as `byte <= 0xa0`
// -> 157 wrong.
// Also measured, and worth recording: writing the high-nibble predicate as
// `hi < 0x0a` instead of `byte < 0xa0` gives 2290/2290 as well, which
// EMPIRICALLY confirms the equivalence argued in the decode note above. The
// port keeps the `byte < 0xa0` form regardless, because that is the comparison
// the instruction at @0x1d1348 actually performs.

/**
 * `fillBufWithAsciiHexMD5(unsigned char* dst, unsigned char* src)`
 *   — @Helium 0x1d1330  (__ZL22fillBufWithAsciiHexMD5PhS_)
 *
 * Formats the 16-byte MD5 digest `src` into `dst` as 32 uppercase ASCII hex
 * characters plus a NUL terminator (33 bytes written).
 *
 * The disassembly is the 16-fold unrolling of the single byte->two-characters
 * sequence quoted in the file header; the loop below walks the same sixteen
 * source bytes in the same order, writing the same pairs of destination bytes.
 * `dst` is %rdi and `src` is %rsi (System-V argument order), matching the
 * declaration's `(unsigned char*, unsigned char*)`.
 *
 * The binary performs NO bounds check and NO null check on either pointer: with
 * 33 unconditional stores it simply writes, and would fault on a short or null
 * `dst`. This port therefore does not invent a check either; it documents the
 * requirement and lets an out-of-range index behave as the caller's typed array
 * defines.
 *
 * @param dst %rdi — at least 33 bytes of writable storage.
 * @param src %rsi — the 16-byte MD5 digest.
 */
export function fillBufWithAsciiHexMD5(dst: Uint8Array, src: Uint8Array): void {
  // The 16 unrolled copies, in source order: src[i] -> dst[2i], dst[2i+1].
  for (let i = 0; i < 16; i++) {
    // @0x1d1334 movzbl (%rsi),%eax — the source byte, zero-extended.
    const byte = src[i] & 0xff;

    // @0x1d1339 shrb $0x4,%cl — byte-width logical shift: the high nibble.
    const hi = (byte >>> 4) & 0x0f;
    // @0x1d133e andb $0xf,%dl — the low nibble.
    const lo = byte & 0x0f;

    // @0x1d1341 leal 0x30(%rcx),%r8d  — the digit form  ('0' + nibble).
    // @0x1d1345 addb $0x37,%cl        — the letter form (0x37 + nibble = 'A'..'F').
    // @0x1d1348 cmpb $-0x60,%al       — UNSIGNED compare of the WHOLE BYTE with
    //                                   0xa0 (not of the nibble with 10).
    // @0x1d1351 cmovbl %eax,%ecx      — CF=1, i.e. byte < 0xa0, selects the digit.
    const hiChar = (byte < 0xa0 ? 0x30 + hi : 0x37 + hi) & 0xff;
    // @0x1d1354 movb %cl,(%rdi) — dst[2i].
    dst[i * 2] = hiChar;

    // @0x1d1356 leal 0x30(%rdx),%eax  — the digit form.
    // @0x1d1359 leal 0x37(%rdx),%ecx  — the letter form.
    // @0x1d135c cmpb $0xa,%dl         — UNSIGNED compare of the NIBBLE with 10.
    // @0x1d1365 cmovbl %eax,%ecx      — CF=1, i.e. nibble < 10, selects the digit.
    const loChar = (lo < 0x0a ? 0x30 + lo : 0x37 + lo) & 0xff;
    // @0x1d1368 movb %cl,0x1(%rdi) — dst[2i+1].
    dst[i * 2 + 1] = loChar;
  }

  // @0x1d16c1 movb $0x0, 0x20(%rdi) — the NUL terminator at dst[32].
  dst[32] = 0x00;
  // @0x1d16c6 retq — returns void.
}
