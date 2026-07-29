// (anonymous namespace)::invert(double const*, double*) @ProCore 0xaf044
//   __ZN12_GLOBAL__N_16invertEPKdPd
//
// Inverse of a 3x3 matrix, laid out row-major as 9 contiguous doubles (72
// bytes) at the input pointer, into the output pointer. Returns `true` if
// the matrix is non-degenerate (|det| >= 1e-07) — in which case the output
// holds the inverse — or `false` (with the output UNTOUCHED, matching the
// disasm's `ja 0xaf1cc` early-out).
//
// This is a hot SIMD-heavy free function in ProCore's anonymous namespace
// (a translation-unit-local helper). Faithful line-for-line transcription
// of the disassembly at
//   raw-port/re/disasm/ProCore.__ZN12_GLOBAL__N_16invertEPKdPd.s
//
// -----------------------------------------------------------------------------
// LAYOUT
// -----------------------------------------------------------------------------
// Input is a row-major 3x3 double matrix:
//   m00=+0x00  m01=+0x08  m02=+0x10
//   m10=+0x18  m11=+0x20  m12=+0x28
//   m20=+0x30  m21=+0x38  m22=+0x40
// Output is the row-major inverse (same layout).
//
// The disasm reads via unaligned SSE2 loads that STRADDLE these fields to
// pack pairs into 128-bit registers:
//   xmm5 = movupd(+0x00)   = (m00, m01)
//   xmm7 = movupd(+0x10)   = (m02, m10)
//   xmm4 = movupd(+0x18)   = (m10, m11)
//   xmm1 = movupd(+0x28)   = (m12, m20)
//   xmm9 = movupd(+0x38)   = (m21, m22)
//   xmm0 = movsd (+0x20)   = m11    (scalar, low lane)
//   xmm6 = movsd (+0x30)   = m20    (scalar, low lane; later reused)
// The overlapping windows are how the compiler amortises the 8-byte
// alignment: a 9-double matrix packs cleanly into 5 xmm-wide loads (with
// two straddling pairs) rather than 9 scalars.
//
// -----------------------------------------------------------------------------
// DETERMINANT (expansion along row 0)
// -----------------------------------------------------------------------------
//   xmm3 = (m11*m22 - m12*m21, m20*m12 - m10*m22)   ; C00, C01
//                                                     (from xmm3 build @0xaf06a-0xaf089)
//   xmm2[low]  = m21*m10 - m20*m11                  ; C02
//                                                     (from xmm2 build @0xaf08d-0xaf09f)
//   xmm2[high] = m22                                ; preserved for later reuse
//   xmm11 = m00*C00 + m01*C01 + m02*C02             ; det  (fused via haddpd + addsd @0xaf0a3-0xaf0b9)
//   xmm6  = |det|   (masked by 0x7fff...ff)         ; abs mask @ProCore __TEXT __const 0x122670
//   epsilon = 1e-07                                 ; @ProCore __TEXT __const 0x122880
//                                                     (u64 0x3e7ad7f29abcaf48)
//   xmm10 = 1.0 / det                               ; 1.0 numerator @ 0x122530
//                                                     (u64 0x3ff0000000000000)
// Fast-path: `ucomisd %xmm6, %xmm8` (== epsilon - |det|); `ja 0xaf1cc`
// takes the "epsilon > |det|" branch → **skip all writes**, return the
// setbe result on the same compare (which will be 0 = false).
//
// -----------------------------------------------------------------------------
// COFACTORS + INVERSE (rest of the body)
// -----------------------------------------------------------------------------
// The remaining 6 cofactors are packed pairwise into xmm11/xmm12/xmm14
// and combined with the surviving xmm3/xmm2 halves to fill the output.
// See per-write comments in the body below. Each output value is
// `cofactor * (1/det)`.
//
//   out[0][0] = (m11*m22 - m12*m21) / det           ; xmm3[0]
//   out[0][1] = (m02*m21 - m01*m22) / det           ; xmm11[0]
//   out[0][2] = (m01*m12 - m02*m11) / det           ; xmm1[0]
//   out[1][0] = (m12*m20 - m10*m22) / det           ; xmm3[1] (= xmm1[1] after blendpd)
//   out[1][1] = (m00*m22 - m02*m20) / det           ; xmm12[1] then swapped
//   out[1][2] = (m02*m10 - m00*m12) / det           ; xmm12[0] then swapped
//   out[2][0] = (m10*m21 - m11*m20) / det           ; xmm2[0]
//   out[2][1] = (m01*m20 - m00*m21) / det           ; xmm14[0]
//   out[2][2] = (m00*m11 - m01*m10) / det           ; xmm0[0]
//
// These match the STANDARD 3x3 inverse formula
//   (M^-1)[i][j] = cofactor[j][i] / det
// with cofactor[j][i] = (-1)^(i+j) * minor[j][i].
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — NONE.
// -----------------------------------------------------------------------------
// This function calls nothing. It is pure SSE2 arithmetic on the input
// pointer, plus three .rodata reads (abs mask, 1e-07, 1.0). No externs,
// no in-scope ledger deps, no throws.
//
// -----------------------------------------------------------------------------
// NUMERICS
// -----------------------------------------------------------------------------
// All ops are double-precision (`*sd`/`*pd`). No `Math.fround` needed —
// this is a double-only kernel. All intermediate products/sums use JS's
// native f64, which matches the SSE2 semantics bit-for-bit for the
// arithmetic used (add/sub/mul/div/haddpd; no reciprocal, no transcendental).

// ═════════════════════════════════════════════════════════════════════════
// CONSTANTS (transcribed from ProCore __TEXT __const)
// ═════════════════════════════════════════════════════════════════════════

/** Epsilon threshold for "matrix is degenerate" test.
 *  @ProCore __TEXT __const 0x122880 — raw u64 0x3e7ad7f29abcaf48 = 1e-07.
 *  Loaded at @0xaf0cb as `movsd 0x737ac(%rip), %xmm8` (RIP-relative). */
const DEGENERATE_EPSILON: number = 1e-07; // @0x122880

/** Numerator for the 1/det reciprocal.
 *  @ProCore __TEXT __const 0x122530 — raw u64 0x3ff0000000000000 = 1.0.
 *  Loaded at @0xaf0df as `movsd 0x73448(%rip), %xmm10` (RIP-relative). */
const ONE_OVER_DET_NUMERATOR: number = 1.0; // @0x122530

// The abs-value mask at @ProCore __TEXT __const 0x122670 is
// (0x7fffffffffffffff, 0x7fffffffffffffff) — the standard SSE2 "clear the
// sign bit of both lanes" packed constant loaded at @0xaf0be via
// `movapd 0x735aa(%rip), %xmm6`, then applied via `andpd %xmm11, %xmm6`
// @0xaf0c6. In TS we express this directly as `Math.abs(det)`, which is
// the identical mathematical operation; the bit-level mask is only
// documented here for provenance.

// ═════════════════════════════════════════════════════════════════════════

/**
 * `(anonymous namespace)::invert(double const*, double*)` @ProCore 0xaf044
 * (__ZN12_GLOBAL__N_16invertEPKdPd).
 *
 * Faithful line-for-line transcription. Reads a row-major 3x3 double
 * matrix from `input` (9 doubles at offsets 0x00..0x40) and, if the
 * matrix is non-degenerate, writes its inverse to `output` (same layout,
 * 9 doubles at offsets 0x00..0x40).
 *
 * Returns:
 *   - `true`  if the matrix is invertible (|det| >= 1e-07): `output`
 *     has been filled with the inverse.
 *   - `false` if degenerate: `output` is UNTOUCHED. (Matches the
 *     disasm's `ja 0xaf1cc` early-out at 0xaf0d9 — the ucomisd is
 *     re-run at 0xaf1cc and `setbe %al` returns the same bool.)
 *
 * Signature notes: the disasm takes `double const*` (rdi) and
 * `double*` (rsi), and returns AL (byte) which callers zero-extend to
 * `bool`. In TS we take a `readonly number[]` (or `Float64Array`) input
 * and a `number[]`/`Float64Array` output — both indexable by [0..8].
 */
export function procore_anon_invert_3x3(
  input: ArrayLike<number>,
  output: number[] | Float64Array,
): boolean {
  // ------------------------------------------------------------
  // @0xaf044..0xaf045 — prologue (no TS effect).
  // @0xaf048..0xaf061 — load the 9 matrix entries via 5 packed +
  //                     2 scalar loads. In TS we just index directly.
  // ------------------------------------------------------------
  const m00 = input[0]; // +0x00 (xmm5[0])
  const m01 = input[1]; // +0x08 (xmm5[1])
  const m02 = input[2]; // +0x10 (xmm7[0])
  const m10 = input[3]; // +0x18 (xmm4[0], also xmm7[1])
  const m11 = input[4]; // +0x20 (xmm0[0], also xmm4[1])
  const m12 = input[5]; // +0x28 (xmm1[0])
  const m20 = input[6]; // +0x30 (xmm6[0] scalar reload, also xmm1[1])
  const m21 = input[7]; // +0x38 (xmm9[0])
  const m22 = input[8]; // +0x40 (xmm9[1])

  // ------------------------------------------------------------
  // Determinant via cofactor expansion along row 0.
  //
  // @0xaf066..0xaf089 build xmm3 = (C[0][0], C[0][1]):
  //   xmm2 = shufpd(xmm4, xmm1, 1)      -> (m11, m12)
  //   xmm3 = unpckhpd(xmm9, xmm1)       -> (m22, m20)
  //   xmm3 *= xmm2                      -> (m22*m11, m20*m12)
  //   xmm2 = unpcklpd(xmm1, xmm4)       -> (m12, m10)
  //   xmm2 *= xmm9                      -> (m12*m21, m10*m22)
  //   xmm3 -= xmm2                      -> (m11*m22 - m12*m21,
  //                                        m20*m12 - m10*m22)
  // These are the 0-th and 1-th cofactors of the top row (with the
  // implicit `(-1)^(0+j)` sign folded into the subtraction ordering).
  // ------------------------------------------------------------
  const C00 = m11 * m22 - m12 * m21; // xmm3[0] @0xaf089
  const C01 = m20 * m12 - m10 * m22; // xmm3[1] @0xaf089

  // ------------------------------------------------------------
  // @0xaf08d..0xaf09f build xmm2 = (C[0][2], m22-preserve):
  //   xmm2 = xmm9;  mulsd xmm4, xmm2   -> (m21*m10, m22)
  //   xmm6 = movsd(+0x30) = m20 (scalar reload)
  //   xmm6 *= xmm0 (m11)               -> m20*m11
  //   xmm2[0] -= xmm6                  -> m21*m10 - m20*m11
  // xmm2[1] preserves m22 for a later cofactor pair — see the
  // `unpcklpd %xmm14, %xmm2` @0xaf1b4 which overwrites xmm2[1].
  // ------------------------------------------------------------
  const C02 = m21 * m10 - m20 * m11; // xmm2[0] @0xaf09f

  // ------------------------------------------------------------
  // @0xaf0a3..0xaf0b9 fuse the three products into `det`:
  //   xmm6 = xmm3 * xmm5             = (m00*C00, m01*C01)
  //   xmm6 = haddpd(xmm6, xmm6)      = (m00*C00 + m01*C01, ...)
  //   xmm11 = xmm2;  mulsd xmm7 xmm11 -> (m02*C02, m22-preserved)
  //   xmm11[0] += xmm6[0]            -> det
  // ------------------------------------------------------------
  const det = m00 * C00 + m01 * C01 + m02 * C02; // xmm11[0] @0xaf0b9

  // ------------------------------------------------------------
  // @0xaf0be..0xaf0d9 — degeneracy test:
  //   xmm6 = andpd(0x7fff...ff, xmm11) -> |det|
  //   xmm8 = 1e-07
  //   ucomisd(xmm6, xmm8); ja 0xaf1cc  -> if (epsilon > |det|) skip.
  // Then @0xaf1cc re-runs ucomisd and setbe → return (|det| >= epsilon).
  // ------------------------------------------------------------
  const absDet = Math.abs(det); // @0xaf0c6 (andpd mask 0x122670)
  // `ucomisd xmm6, xmm8`: AT&T flags on (xmm8 - xmm6) = (epsilon - |det|).
  // `ja` (CF=0 & ZF=0) → xmm8 > xmm6 → epsilon > |det| → DEGENERATE.
  if (DEGENERATE_EPSILON > absDet) {
    // @0xaf0d9 — jumped to 0xaf1cc without writing anything.
    // @0xaf1cc: ucomisd xmm6,xmm8; @0xaf1d1: setbe %al.
    // `setbe` (CF=1 or ZF=1) → xmm8 <= xmm6 → epsilon <= |det|.
    // In the degenerate case epsilon > |det|, so setbe = 0 = false.
    return false;
  }

  // ------------------------------------------------------------
  // Non-degenerate path: xmm10 = 1.0 / det (@0xaf0df-0xaf0e8).
  // Broadcast to xmm5 at @0xaf187 via movddup for the packed mults.
  // ------------------------------------------------------------
  const invDet = ONE_OVER_DET_NUMERATOR / det; // @0xaf0e8 divsd

  // ------------------------------------------------------------
  // Cofactors for row 1 of the inverse (out[0][1], out[1][0]).
  //
  // @0xaf0ed..0xaf110:
  //   xmm11 = xmm9 * xmm7             = (m21*m02, m22*m10)
  //   xmm12 = xmm9 * xmm5             = (m21*m00, m22*m01)
  //   xmm12 = unpckhpd(xmm12, xmm12)  = (m22*m01, m22*m01)
  //   xmm11 -= xmm12                  = (m21*m02 - m22*m01,
  //                                      m22*m10 - m22*m01) ← only [0] used later
  //
  // Only xmm11[0] survives to a write (via unpcklpd @0xaf182 with
  // xmm3[0]). xmm11[1] is discarded by that unpcklpd.
  // ------------------------------------------------------------
  const cofactor_02_from_row1 = m21 * m02 - m22 * m01; // xmm11[0] @0xaf110
  //  = m02*m21 - m01*m22  (== -(m01*m22 - m02*m21))
  //  Standard inv[0][1] * det numerator.

  // ------------------------------------------------------------
  // Cofactors for the (row 1) middle column pair (out[1][1], out[1][2]).
  //
  // @0xaf115..0xaf13d:
  //   xmm14 = unpckhpd(xmm7, xmm9)     = (m10, m22)
  //   xmm15 = unpcklpd(xmm5, xmm7)     = (m00, m02)
  //   xmm12 = unpcklpd(xmm7, xmm5)     = (m02, m00)
  //   xmm12 *= xmm14                   = (m02*m10, m00*m22)
  //   xmm15 *= xmm1  (=(m12,m20))      = (m00*m12, m02*m20)
  //   xmm12 -= xmm15                   = (m02*m10 - m00*m12,
  //                                       m00*m22 - m02*m20)
  //
  // xmm12[0] and xmm12[1] each carry a signed 2x2 minor; the later
  // `shufpd $0x1` @0xaf1a8 SWAPS the lanes so the output order matches
  // the standard cofactor-transpose scheme:
  //   out[1][1] = xmm12[1] / det = (m00*m22 - m02*m20) / det   (C[1][1])
  //   out[1][2] = xmm12[0] / det = (m02*m10 - m00*m12) / det   (C[2][1])
  // ------------------------------------------------------------
  const cofactor_row1_col1 = m00 * m22 - m02 * m20; // xmm12[1] pre-swap
  const cofactor_row1_col2 = m02 * m10 - m00 * m12; // xmm12[0] pre-swap

  // ------------------------------------------------------------
  // Cofactors for row 2 (out[2][0], out[2][1], out[2][2]).
  //
  // @0xaf142..0xaf158:
  //   xmm9  = blendpd(xmm9, xmm1, 0x2) = (m21, m20)  ; xmm9[1] replaced
  //   xmm9 *= xmm5  (=(m00, m01))      = (m21*m00, m20*m01)
  //   xmm14 = xmm9; unpckhpd xmm9,xmm14 = (m20*m01, m20*m01)
  //   xmm14 -= xmm9                    = (m20*m01 - m21*m00, 0)
  // Only xmm14[0] survives to a write (via unpcklpd @0xaf1b4 with xmm2[0]).
  //
  // @0xaf15d..0xaf17a — the (m01*m12 - m02*m11) and (m00*m11 - m01*m10)
  // scalars, folded into xmm1[0] and xmm0[0] respectively.
  //
  //   xmm13 = unpckhpd(xmm5, xmm5)     = (m01, m01)
  //   mulsd %xmm13, %xmm1              -> xmm1[0] = m12*m01;  xmm1[1] = m20 preserved
  //   xmm9 = xmm0 (upper garbage; low = m11) ; mulsd %xmm7, %xmm9 -> xmm9[0] = m11*m02
  //   subsd %xmm9, %xmm1               -> xmm1[0] = m12*m01 - m11*m02
  //                                            = m01*m12 - m02*m11
  //   mulsd %xmm5, %xmm0               -> xmm0[0] = m11 * m00
  //   mulsd %xmm13, %xmm4              -> xmm4[0] = m10 * m01;  xmm4[1] = m11 preserved
  //   subsd %xmm4, %xmm0               -> xmm0[0] = m00*m11 - m01*m10
  // ------------------------------------------------------------
  const cofactor_row2_col1 = m20 * m01 - m21 * m00; // xmm14[0] @0xaf158
  //  = m01*m20 - m00*m21  (C[1][2])
  const cofactor_row0_col2 = m01 * m12 - m02 * m11; // xmm1[0] @0xaf16c (C[2][0])
  const cofactor_row2_col2 = m00 * m11 - m01 * m10; // xmm0[0] @0xaf17a (C[2][2])

  // ------------------------------------------------------------
  // Emit the 9 output doubles. In the disasm this is 5 packed stores;
  // in TS we write each cell individually, which is bit-identical for
  // f64 arithmetic (no rounding differences vs the SIMD packed ops).
  //
  //   @0xaf17e..0xaf190 — xmm4 = unpcklpd(xmm3, xmm11); xmm4 *= invDet;
  //                       movupd xmm4 -> (rsi+0x00)
  //     out[0] = C00 * invDet
  //     out[1] = cofactor_02_from_row1 * invDet
  //
  //   @0xaf194..0xaf19e — blendpd(xmm1, xmm3, 0x2) puts xmm3[1] (=C01)
  //                       into xmm1[1]; xmm1 *= invDet;
  //                       movupd xmm1 -> (rsi+0x10)
  //     out[2] = cofactor_row0_col2 * invDet    (xmm1[0])
  //     out[3] = C01 * invDet                   (xmm1[1] after blend)
  //
  //   @0xaf1a3..0xaf1ae — xmm12 *= invDet; shufpd $0x1 swaps lanes;
  //                       movupd xmm12 -> (rsi+0x20)
  //     out[4] = cofactor_row1_col1 * invDet    (xmm12[1] pre-swap → [0] post-swap)
  //     out[5] = cofactor_row1_col2 * invDet    (xmm12[0] pre-swap → [1] post-swap)
  //
  //   @0xaf1b4..0xaf1bd — xmm2 = unpcklpd(xmm2, xmm14); xmm2 *= invDet;
  //                       movupd xmm2 -> (rsi+0x30)
  //     out[6] = C02 * invDet
  //     out[7] = cofactor_row2_col1 * invDet
  //
  //   @0xaf1c2..0xaf1c7 — xmm0[0] *= invDet;
  //                       movsd xmm0 -> (rsi+0x40)
  //     out[8] = cofactor_row2_col2 * invDet
  // ------------------------------------------------------------
  output[0] = C00 * invDet;                        // (m11*m22 - m12*m21) / det
  output[1] = cofactor_02_from_row1 * invDet;      // (m02*m21 - m01*m22) / det
  output[2] = cofactor_row0_col2 * invDet;         // (m01*m12 - m02*m11) / det
  output[3] = C01 * invDet;                        // (m12*m20 - m10*m22) / det
  output[4] = cofactor_row1_col1 * invDet;         // (m00*m22 - m02*m20) / det
  output[5] = cofactor_row1_col2 * invDet;         // (m02*m10 - m00*m12) / det
  output[6] = C02 * invDet;                        // (m10*m21 - m11*m20) / det
  output[7] = cofactor_row2_col1 * invDet;         // (m01*m20 - m00*m21) / det
  output[8] = cofactor_row2_col2 * invDet;         // (m00*m11 - m01*m10) / det

  // ------------------------------------------------------------
  // @0xaf1cc..0xaf1d5 — return |det| >= epsilon (setbe on the same
  // ucomisd). We already returned false above for the degenerate case,
  // so here we always return true.
  // ------------------------------------------------------------
  return true;
}
