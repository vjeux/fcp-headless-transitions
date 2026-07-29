// ProCore_Private_convertFromS15Fixed16.ts — converts a signed 32-bit
// Apple "S15Fixed16" fixed-point value into a double.
//
// S15Fixed16 (a.k.a. `Fixed` on classic Mac / CoreGraphics) is a signed
// 32-bit fixed-point value with 16 integer bits and 16 fractional bits.
// The conversion to a real number is `x / 2^16` — this file's whole
// job. The sibling `convertToS15Fixed16` @0xb0c51 does the inverse
// (already ported at raw-port/src/infra/ProCore_Private_convertToS15Fixed16.ts).
//
// This file ports EXACTLY ONE ledger unit:
//
//   * __ZN7ProCore7Private21convertFromS15Fixed16Ei
//       — ProCore::Private::convertFromS15Fixed16(int)
//         @ProCore 0xb0bed
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted VAs
// from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN7ProCore7Private21convertFromS15Fixed16Ei.s
//
// -----------------------------------------------------------------------------
// LITERAL POOL
// -----------------------------------------------------------------------------
//   @0x127f28 (RIP-rel from 0xb0bfd, disp 0x7732b): 1.52587890625e-05
//                = 2^-16 = 1/65536 (hex bytes 000000000000f03e in the
//                  ProCore x86_64 slice — verified with the /tmp/ProCore.x86_64
//                  cached slice). This is the S15Fixed16 → real number
//                  scale factor: 1 fixed-point unit = 2^-16 real units.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProCore.__ZN7ProCore7Private21convertFromS15Fixed16Ei.s)
// -----------------------------------------------------------------------------
//   0x0b0bed  pushq   %rbp
//   0x0b0bee  movq    %rsp, %rbp
//   0x0b0bf1  cvtsi2sd %edi, %xmm0                ; xmm0 = (double)(int32) edi
//   0x0b0bf5  mulsd   0x7732b(%rip), %xmm0        ; xmm0 *= 1/65536
//   0x0b0bfd  popq    %rbp
//   0x0b0bfe  retq
//
// NUMERICS: the whole body is double-precision (`cvtsi2sd` produces a
// double directly from a 32-bit signed integer, `mulsd` is scalar
// double). NO `cvtsd2ss` or `-f` libm call anywhere — plain JS `number`
// arithmetic matches bit-for-bit; NO Math.fround wrapping is required
// (nor allowed — it would introduce single-precision rounding the
// binary does not do). Same policy as PCMatrix44Tmpl.ts and the sibling
// convertToS15Fixed16.ts.
//
// The multiplication `x * 2^-16` is EXACT for every finite double `x`
// because 2^-16 is a power of two: the mantissa is unchanged and only
// the biased exponent shifts by 16. So even the extreme S15Fixed16
// values (INT32_MIN = -2^31 → -32768.0, INT32_MAX = 2^31 - 1 →
// 32767.999984741211) come out with zero rounding error.
//
// Argument-width note: the source instruction is `cvtsi2sd %edi` (32-bit
// dword source), not `cvtsi2sdq %rdi` — the S15Fixed16 payload is a
// signed 32-bit int. If callers pass a wider integer we mask with `|0`
// to force the JS numeric coercion to int32 semantics, matching what
// `%edi` reads from `rdi`.

/** @ProCore rodata 0x127f28. The S15Fixed16 → real scale factor 2^-16.
 *  Loaded RIP-relative @0x0b0bf5 in the disasm quoted above.
 *  This value is EXACT in IEEE-754 double (a pure power of two). */
const S15FIXED16_SCALE = 1.52587890625e-5; // @ProCore 0x00127f28 = 1/65536 = 2^-16

/**
 * `ProCore::Private::convertFromS15Fixed16(int)` — @ProCore 0xb0bed.
 *
 * Faithful line-for-line port of the 6-instruction body. Multiplies the
 * signed 32-bit fixed-point input by 2^-16 to recover the real value.
 *
 * @param x  A signed 32-bit S15Fixed16 encoding.
 * @returns  `x * 2^-16` as an IEEE-754 double, EXACT to the last bit.
 */
export function ProCore_Private_convertFromS15Fixed16(x: number): number {
  // @0xb0bf1: cvtsi2sd %edi, %xmm0
  //   Reads the LOW 32 BITS of edi as a signed int and converts to
  //   double. `x | 0` in JS is the well-defined int32 coercion, so
  //   this matches the machine's dword-width semantics exactly.
  const asInt32Double = x | 0;
  // @0xb0bf5: mulsd 0x7732b(%rip), %xmm0
  //   Multiply by the rodata constant at ProCore file offset 0x127f28
  //   (= 1/65536, EXACT). Returned in xmm0.
  return asInt32Double * S15FIXED16_SCALE;
}
