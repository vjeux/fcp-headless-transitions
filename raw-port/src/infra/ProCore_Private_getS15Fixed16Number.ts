// ProCore::Private::getS15Fixed16Number(unsigned char const*) — read a big-endian
// signed 15.16 fixed-point number from a byte pointer and return it as a double.
//
// @ProCore /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// @0xb0bd7  __ZN7ProCore7Private19getS15Fixed16NumberEPKh
//
// s15Fixed16Number is Apple/ICC's rational format: a signed 32-bit big-endian integer
// whose value is scaled by 2^-16. Used throughout ICC profile parsing (chromaticity,
// gamma, matrix column entries). The 32 bits split as [sign : 15 int : 16 frac], so the
// range is exactly [-32768.0, +32768.0) with a granularity of 1/65536 = 1.52587890625e-5.
//
// DECODE: raw-port/re/disasm/ProCore.__ZN7ProCore7Private19getS15Fixed16NumberEPKh.s
//
//   0xb0bd7..0xb0bd8  prologue (push rbp; mov rsp -> rbp)
//   0xb0bdb  movl   (%rdi), %eax             ;; eax = *(uint32_t*)p   (raw 4 bytes, LE-in-reg)
//   0xb0bdd  bswapl %eax                     ;; byte-swap  -> big-endian interpretation
//                                              of the 4 bytes as a signed 32-bit integer.
//   0xb0bdf  cvtsi2sd %eax, %xmm0            ;; SIGNED int32 -> double  (this is the
//                                              signed-conversion opcode; the top bit of
//                                              eax is treated as sign).
//   0xb0be3  mulsd  0x7733d(%rip), %xmm0     ;; multiply by the constant at 0x127f28.
//                                              That constant is 0x3ef0000000000000 =
//                                              1.52587890625e-05 = 1/65536 = 2^-16.
//   0xb0beb  popq %rbp; retq                 ;; return the double in xmm0.
//
// The `EPKh` in the mangle = `Ph` = `unsigned char const*` (the ICC byte cursor). The
// namespace `ProCore::Private` collects the small ICC/color numeric helpers.

// ── constants ─────────────────────────────────────────────────────────────────
// The multiplier constant, read at RIP-relative address 0x127f28 in ProCore.__TEXT.__const
// (bytes: 00 00 00 00 00 00 f0 3e, little-endian) — this decodes to the double 2^-16.
// Confirmed via `otool -s __TEXT __const ProCore` at row 0x127f20 offset +8. It is the
// exact reciprocal of 65536, i.e. the s15fixed16 fractional scale factor.
// @const ProCore __TEXT.__const 0x127f28  (referenced by mulsd @0xb0be3)
const S15FIXED16_SCALE = 1.52587890625e-05; // === 1 / 65536 === 2 ** -16

/**
 * Read a 32-bit big-endian s15fixed16 number from `bytes` starting at `offset`, and
 * return it as a double (scaled by 2^-16). Faithful to the 8-instruction body:
 *
 *   1. Read four bytes at (p) as a 32-bit unsigned little-endian value (native x86-64
 *      load into eax).
 *   2. bswap — reverse bytes so the interpretation is big-endian (ICC byte order).
 *   3. cvtsi2sd — SIGNED int32 -> double (bit 31 is the sign; result already in
 *      units of "raw ticks").
 *   4. Multiply by 2^-16 to translate ticks -> fractional units.
 *
 * Steps 1+2 combined = "read a 32-bit big-endian int". We fuse them via DataView, which
 * has a built-in big-endian getInt32; the sign extension of cvtsi2sd is inherent in
 * DataView.getInt32(offset, false) — the `false` selects big-endian byte order.
 *
 * @ProCore 0xb0bd7
 */
export function ProCore_Private_getS15Fixed16Number(
  bytes: Uint8Array,
  offset: number = 0,
): number {
  // @ProCore 0xb0bdb  movl (%rdi), %eax
  // @ProCore 0xb0bdd  bswapl %eax
  //   Fused as a big-endian signed 32-bit load. DataView shares the underlying buffer;
  //   using bytes.byteOffset preserves callers that pass a subarray view.
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const rawInt32 = dv.getInt32(offset, false); // false = big-endian byte order

  // @ProCore 0xb0bdf  cvtsi2sd %eax, %xmm0
  //   int32 -> double. JS numbers are IEEE-754 f64; an int32 is exactly representable.
  //
  // @ProCore 0xb0be3  mulsd 0x127f28(%rip), %xmm0
  //   scale by 1/65536.
  return rawInt32 * S15FIXED16_SCALE;
}
