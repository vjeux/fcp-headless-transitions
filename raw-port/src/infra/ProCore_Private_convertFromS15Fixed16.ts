// ProCore_Private_convertFromS15Fixed16.ts — ProCore::Private free helper.
//
// One symbol transcribed here:
//   @ProCore 0xb0bed
//     ProCore::Private::convertFromS15Fixed16(int) -> double
//     mangled: __ZN7ProCore7Private21convertFromS15Fixed16Ei
//
// Source disassembly:
//   raw-port/re/disasm/ProCore.__ZN7ProCore7Private21convertFromS15Fixed16Ei.s
//
// Sibling helpers already ported live next to this file
// (ProCore_Private_getInt32Number.ts, ProCore_Private_getUInt16Number.ts,
// ProCore_Private_getInt16Number.ts) — same one-free-function-per-file
// naming convention. `ProCore::Private` is a C++ namespace (not a class),
// so per the naming rule ("A free function goes in a file named after it")
// this file is named after its symbol.
//
// -----------------------------------------------------------------------------
// FULL DISASM (all 6 body instructions accounted for)
// -----------------------------------------------------------------------------
//   0xb0bed  pushq %rbp                          ; frame prologue
//   0xb0bee  movq  %rsp, %rbp                    ; frame prologue
//   0xb0bf1  cvtsi2sd %edi, %xmm0                ; xmm0 = (double)(int32_t)edi
//   0xb0bf5  mulsd 0x7732b(%rip), %xmm0          ; xmm0 *= *(double*)&K
//                                                ; RIP-target = 0xb0bfd + 0x7732b = 0x127f28
//                                                ; K = 8 bytes @__TEXT.__const 0x127f28
//                                                ;     bytes: 00 00 00 00 00 00 f0 3e
//                                                ;     -> IEEE-754 double 0x3ef0000000000000
//                                                ;     -> 1.52587890625e-05 == 1.0 / 65536.0 == 2^-16
//   0xb0bfd  popq  %rbp                          ; frame epilogue
//   0xb0bfe  retq                                ; return xmm0
//
// -----------------------------------------------------------------------------
// SEMANTICS
// -----------------------------------------------------------------------------
// S15.16 fixed-point (aka `Fixed`/`SInt32Fixed16` in QuickDraw / ICC land) is a
// 32-bit signed integer where the top 16 bits are the signed integer part and
// the low 16 bits are the fractional part with an implicit scale of 2^-16.
// Converting to double is therefore just `(int32_t) x / 65536.0` — which is
// EXACTLY what this function does (cvtsi2sd sign-extends the low 32 bits of
// edi into a double, then mulsd by 2^-16 = 1/65536). No clamping, no
// saturation, no rounding beyond the double's implicit conversion.
//
// The `cvtsi2sd %edi, %xmm0` reads the LOW 32 bits of edi as a SIGNED int32
// and converts to double — so an input of e.g. 0x00010000 (1.0 fixed) yields
// 1.0, and 0xFFFF0000 (-1.0 fixed) yields -1.0. In JS we honour this by
// running the input through `| 0` first, which is the canonical int32 cast:
// it truncates to the low 32 bits AND sign-extends the top bit, matching
// `cvtsi2sd`'s behaviour on the low half of edi.
//
// K is exact 2^-16 (a power of two) so `x * K` is bit-identical to `x / 65536`
// in IEEE-754. We keep the multiplication form to mirror the disasm's `mulsd`
// literally — the numerics are indistinguishable.

/** RIP-relative constant loaded @0xb0bf5. Address decode:
 *  next-insn-rip (0xb0bfd) + 0x7732b = 0x127f28 → 8 bytes at __TEXT.__const:
 *  `00 00 00 00 00 00 f0 3e` → IEEE-754 double 1.52587890625e-05 (= 2^-16
 *  = 1 / 65536). Read directly from
 *  `/Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore`
 *  via `otool -s __TEXT __const`. */
const K_1_OVER_65536 = 1.52587890625e-05; // @ProCore __TEXT.__const 0x127f28 (mulsd operand @0xb0bf5)

/**
 * `ProCore::Private::convertFromS15Fixed16(int)` — @ProCore 0xb0bed
 *   __ZN7ProCore7Private21convertFromS15Fixed16Ei
 *
 * Convert an S15.16 fixed-point integer to a plain double.
 * Faithful line-for-line transcription of the 6-instruction body:
 *
 *   cvtsi2sd %edi, %xmm0        ; (double)(int32_t)x
 *   mulsd    K(%rip), %xmm0     ; *= 2^-16
 *
 * @param x  S15.16 fixed-point value as a 32-bit SIGNED integer. Any JS
 *           number is coerced to int32 via `| 0` first (matches cvtsi2sd
 *           reading edi's low 32 bits as signed).
 * @returns  `(int32_t)x / 65536` as a double, exactly.
 */
export function ProCore_Private_convertFromS15Fixed16(x: number): number {
  // @0xb0bf1  cvtsi2sd %edi, %xmm0 — int32 -> double (sign-extends bit 31).
  //           `| 0` truncates to int32 and sign-extends, matching cvtsi2sd.
  const asDouble = (x | 0) as number;
  // @0xb0bf5  mulsd K(%rip), %xmm0 — multiply by 1/65536.
  return asDouble * K_1_OVER_65536;
}
