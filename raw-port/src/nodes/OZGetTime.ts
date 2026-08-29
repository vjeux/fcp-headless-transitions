// OZGetTime — Ozone free function
// @Ozone /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// @0x23bdd0  OZGetTime() -> unsigned int
//
// DECODE: raw-port/re/disasm/__Z9OZGetTimev.s
//
// The entire 13-instruction body is:
//   0x23bdd0  pushq  %rbp
//   0x23bdd1  movq   %rsp, %rbp
//   0x23bdd4  subq   $0x10, %rsp
//   0x23bdd8  leaq   -0x8(%rbp), %rdi                ; rdi = &local (a UnsignedWide slot)
//   0x23bddc  callq  _Microseconds                   ; CarbonCore stub @0x6dcd0e —
//                                                    ;   fills *rdi with the current
//                                                    ;   uptime in microseconds (a 64-bit
//                                                    ;   UnsignedWide struct).
//   0x23bde1  movl   -0x8(%rbp), %eax                ; eax = low 32 bits of that µs count
//                                                    ;   (drops the high half — matches
//                                                    ;   the fact that the return type
//                                                    ;   is `unsigned int`, not u64).
//   0x23bde4  imulq  $0x10624dd3, %rax, %rax         ; rax = (u64) eax * 0x10624DD3
//                                                    ;   (274_877_907 = ceil(2^38/1000))
//   0x23bdeb  shrq   $0x26, %rax                     ; rax >>= 38
//                                                    ;   Together these two instructions
//                                                    ;   are the compiler's canonical
//                                                    ;   magic-number fast unsigned
//                                                    ;   divide-by-1000. For any 32-bit
//                                                    ;   input x, `(x * 0x10624DD3) >> 38`
//                                                    ;   == `x / 1000` exactly.
//   0x23bdef  addq   $0x10, %rsp
//   0x23bdf3  popq   %rbp
//   0x23bdf4  retq
//
// Semantic reading: OZGetTime() returns the current CarbonCore uptime, converted
// from microseconds into milliseconds, then truncated to the low 32 bits — the
// classic "monotonically increasing millisecond timer" idiom seen throughout
// Motion/FCP for coarse elapsed-time measurements and animation timestamps.
// The u32 return silently wraps after ~49.7 days of uptime; the disasm makes
// no attempt to widen it, so neither do we.
//
// FRONTIER EXTERN (TRUE out-of-scope):
//   * _Microseconds  — CarbonCore/CoreServices ABI (deprecated but still
//                       exported); fills a UnsignedWide (a two-u32 struct
//                       that's word-equivalent to a u64) with the elapsed
//                       microseconds since some fixed epoch. Called via
//                       Ozone stub @0x6dcd0e. Not a member of any of the
//                       five in-scope frameworks (ProCore/ProChannel/Helium/
//                       Ozone/Flexo) — it lives in CarbonCore.framework.

/**
 * `_Microseconds` — CarbonCore/CoreServices. TRUE out-of-scope extern
 * (part of the OS runtime, not one of the five in-scope FCP frameworks).
 * Fills a UnsignedWide struct at *out with the current elapsed
 * microseconds since machine boot. Called from OZGetTime @0x23bddc via
 * Ozone stub 0x6dcd0e.
 *
 * Modelled here as the boundary between ported FCP code and the OS
 * runtime. The port MUST NOT invent a synthetic clock (that would
 * poison every timestamp downstream); it raises with the exact
 * @0xADDR so any caller reaches through a documented boundary.
 */
function Microseconds_stub(): bigint {
  throw new Error(
    "_Microseconds @Ozone 0x23bddc (stub 0x6dcd0e) not yet transcribed — " +
      "CarbonCore/CoreServices extern (TRUE out-of-scope boundary). Fills a " +
      "UnsignedWide struct with elapsed microseconds since boot. Any caller " +
      "of OZGetTime() reaches this boundary.",
  );
}

/**
 * `OZGetTime()` — @Ozone 0x23bdd0 (__Z9OZGetTimev). Returns the current
 * elapsed uptime in milliseconds, truncated to the low 32 bits.
 *
 * Line-for-line transcription of the 13-instruction body:
 *   1. Call _Microseconds(&local) — fills a UnsignedWide/u64 with µs.
 *   2. Take the LOW 32 bits (`movl -0x8(%rbp), %eax` — a 32-bit load).
 *   3. Divide by 1000 via the compiler's magic-number recipe:
 *      `(u32 x) * 0x10624DD3 >> 38` == `x / 1000` exactly for all u32 x.
 *   4. Return that quotient (rax on the way out — 32-bit content in a
 *      64-bit reg; the ABI zero-extends to u32).
 */
export function OZGetTime(): number {
  // @0x23bdd8..0x23bddc  callq _Microseconds — the extern boundary.
  //   The disasm passes the address of an 8-byte stack slot as %rdi and
  //   the extern writes a UnsignedWide/u64 there. We model the boundary
  //   by returning that u64 as a bigint (matching the 8-byte slot width).
  const us: bigint = Microseconds_stub();

  // @0x23bde1  movl -0x8(%rbp), %eax
  //   Grab ONLY the low 32 bits. In the machine this is a plain 32-bit
  //   load; here we mask to 0xFFFFFFFF and coerce to number (safe since
  //   the value is < 2^32).
  const usLow32 = Number(us & 0xffffffffn);

  // @0x23bde4  imulq $0x10624DD3, %rax, %rax
  // @0x23bdeb  shrq  $0x26, %rax
  //   Magic-number unsigned divide-by-1000. For any 32-bit `x`:
  //     (x * 0x10624DD3) >> 38 == floor(x / 1000).
  //   We use bigint math to preserve the full 62-bit intermediate,
  //   then shift right 38, then narrow back to a JS number (result
  //   fits in 22 bits so it's < 2^53).
  const bigX = BigInt(usLow32);
  const ms = Number((bigX * 0x10624dd3n) >> 38n);

  // @0x23bdef..0x23bdf4  epilogue + retq. Returns %eax (u32 in low 32).
  return ms;
}

// Ozone.__const @0x0070ab00, bytes 8d ed b5 a0 f7 c6 b0 40: the
// binary64 value 4294.967296, exactly 2^32 / 1,000,000.
const SECONDS_PER_UNSIGNED_WIDE_HIGH_WORD = 4294.967296;

// Ozone.__const @0x00707a60, bytes 00 00 00 00 80 84 2e 41: the
// binary64 value 1,000,000.
const MICROSECONDS_PER_SECOND = 1_000_000;

/**
 * `OZGetTimeInSeconds()` — @Ozone 0x0023be00
 * (`__Z18OZGetTimeInSecondsv`).
 *
 * `_Microseconds` writes its 64-bit UnsignedWide result as low and high u32
 * words. The machine converts each zero-extended word to binary64, scales the
 * high word by 2^32 / 1,000,000, divides the low word by 1,000,000, then adds
 * the two contributions. The operation order below matches @0x23be17..0x23be31.
 */
export function OZGetTimeInSeconds(): number {
  // @0x23be08..0x23be0c: _Microseconds(&local), through Ozone stub 0x6dcd0e.
  const microseconds = Microseconds_stub();

  // @0x23be11 and @0x23be14: two movl loads zero-extend the low and high words.
  const low = Number(microseconds & 0xffffffffn);
  const high = Number((microseconds >> 32n) & 0xffffffffn);

  // @0x23be17..0x23be31: cvtsi2sd, mulsd/divsd, then addsd.
  const highSeconds = high * SECONDS_PER_UNSIGNED_WIDE_HIGH_WORD;
  const lowSeconds = low / MICROSECONDS_PER_SECOND;
  return lowSeconds + highSeconds;
}
