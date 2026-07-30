// ProCore_Private_convertFromU8Fixed8 — free function in the ProCore::Private
// namespace: converts an ICC "u8Fixed8Number" (a 16-bit unsigned fixed-point
// value with 8 integer bits + 8 fractional bits, per the ICC.1 spec §4.15)
// to its equivalent IEEE-754 `double` (C++ `double`, 64-bit).
//
// The naming rule (raw-port/army/PORTING_SPEC.md Rule 6 + naming rule) says
// one FCP entity per file. `ProCore::Private` is a C++ NAMESPACE (not a
// class), and its free `convertFromU8Fixed8` disassembles as an independent
// leaf. Per the naming rule ("A free function goes in a file named after
// it or its translation-unit"), this file is named for the function;
// sibling `convertFromS15Fixed16` / `convertToS15Fixed16` etc. each live in
// their own file next door (see raw-port/src/infra/ProCore_Private_*.ts).
//
// Framework: ProCore
// Binary:    /Applications/Final Cut Pro.app/Contents/Frameworks/
//            ProCore.framework/Versions/A/ProCore  (x86_64 slice; VAs
//            reported by otool are unadjusted).
// Disasm:    raw-port/re/disasm/
//              ProCore.__ZN7ProCore7Private19convertFromU8Fixed8Et.s
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM (all instructions accounted for; addresses cited @0xADDR)
// ─────────────────────────────────────────────────────────────────────────
//   __ZN7ProCore7Private19convertFromU8Fixed8Et:
//     0xb0d4f  pushq     %rbp                        ; frame prologue
//     0xb0d50  movq      %rsp, %rbp                  ; frame prologue
//     0xb0d53  cvtsi2sd  %edi, %xmm0                 ; xmm0 = (double)(int32)raw
//                                                    ;   The argument is a
//                                                    ;   `uint16_t` per the C++
//                                                    ;   signature; the ABI
//                                                    ;   zero-extends it to a
//                                                    ;   32-bit edi before the
//                                                    ;   call, so the signed
//                                                    ;   cvtsi2sd from edi in
//                                                    ;   [0..65535] yields a
//                                                    ;   non-negative double.
//     0xb0d57  mulsd     0x771f1(%rip), %xmm0        ; xmm0 *= *(double*)0x127f50
//                                                    ;   RIP-relative: next-PC
//                                                    ;   0xb0d5f + 0x771f1 =
//                                                    ;   0x127f50. Constant at
//                                                    ;   that VA is
//                                                    ;   0x3f70000000000000
//                                                    ;   = 2^-8 = 0.00390625
//                                                    ;   = 1.0 / 256.0
//                                                    ;   (verified by reading
//                                                    ;   ProCore's __TEXT.__const
//                                                    ;   at that VA; the fat-
//                                                    ;   binary slice offset
//                                                    ;   for x86_64 is 0x4000,
//                                                    ;   so the file offset is
//                                                    ;   0x12bf50 = 1228624).
//     0xb0d5f  popq      %rbp                        ; frame epilogue
//     0xb0d60  retq                                  ; return xmm0 (double)
//
// SEMANTIC SUMMARY
//   u8Fixed8Number is the 16-bit ICC number type whose bit layout is
//     [ high byte = integer part | low byte = fractional part ]
//   ("Q8.8" in DSP notation). To recover the real value:
//     real = raw / 256.0
//   which the compiler implements as `raw * (1/256)` to save the division.
//   `1/256 = 2^-8` is exactly representable in binary IEEE-754, so `mulsd`
//   gives the same answer as `divsd` here without introducing any rounding.
//
// ─────────────────────────────────────────────────────────────────────────
// FRONTIER CALLEES
// ─────────────────────────────────────────────────────────────────────────
//   None. Zero in-scope callees, zero externs. Pure arithmetic leaf.
//
// ─────────────────────────────────────────────────────────────────────────
// SYMBOLS PORTED HERE
// ─────────────────────────────────────────────────────────────────────────
//   * __ZN7ProCore7Private19convertFromU8Fixed8Et
//       — ProCore::Private::convertFromU8Fixed8(unsigned short)
//         @ProCore 0xb0d4f

/**
 * `ProCore::Private::convertFromU8Fixed8(unsigned short raw) -> double`
 *   — @ProCore 0xb0d4f
 *   — __ZN7ProCore7Private19convertFromU8Fixed8Et
 *
 * ICC u8Fixed8Number → double: the raw 16-bit fixed-point value is
 * interpreted as `Q8.8` unsigned (integer.fraction), and the real value
 * is `raw / 256.0`. The compiler implements the division as a multiply
 * by the constant `2^-8 = 0.00390625` (RIP-relative literal at
 * @ProCore __const 0x127f50). Because `1/256` is exactly representable
 * in IEEE-754, this is bit-exact equivalent to `divsd` — no rounding
 * is introduced by the reformulation.
 *
 * Faithful line-for-line transcription of the 6-instruction body quoted
 * in the file header. All arithmetic is in native `double`. JS `number`
 * is IEEE-754 `double`, identical to C++ `double`, so we get bit-exact
 * parity with the machine.
 *
 * Argument note: the C++ signature is `unsigned short` (16-bit); the
 * disasm's `cvtsi2sd %edi, %xmm0` reads the full 32-bit edi, but the
 * ABI zero-extends the 16-bit arg into edi before the call, so bits
 * 16..31 are always 0 and the signed-int interpretation of cvtsi2sd
 * yields a non-negative double in [0.0, 65535.0]. We mirror that
 * zero-extension explicitly with a u16 mask — matching what the CPU
 * actually reads.
 */
export function ProCore_Private_convertFromU8Fixed8(raw: number): number {
  // @0xb0d53  cvtsi2sd %edi, %xmm0
  //   ABI zero-extends `unsigned short` → 32-bit edi (bits 16..31 = 0),
  //   so cvtsi2sd's signed interpretation still yields a non-negative
  //   double in [0.0, 65535.0]. Explicit u16 mask mirrors the ABI's
  //   zero-extension; JS number == C++ double for all subsequent math.
  const rawAsUint16: number = (raw & 0xffff) >>> 0;
  const asDouble: number = rawAsUint16;

  // @0xb0d57  mulsd 0x771f1(%rip), %xmm0
  //   RIP-relative literal @ProCore __const 0x127f50 =
  //   0x3f70000000000000 = 2^-8 = 1/256. Exactly representable in
  //   IEEE-754 → bit-exact equivalent to `raw / 256.0`.
  const K_2POW_MINUS_8: number = 1.0 / 256.0; // @ProCore __const 0x127f50 (== 2^-8)

  // @0xb0d5f/0xb0d60 — epilogue + retq (return xmm0).
  return asDouble * K_2POW_MINUS_8;
}
