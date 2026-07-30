/**
 * PCComputeQuadToSquareProjectionMatrix — build the 4x4 homogeneous
 * projection matrix that maps four source corners P0,P1,P2,P3 (in that
 * order) BACK onto the unit square {(0,0),(1,0),(1,1),(0,1)}.
 *
 * This is the inverse of PCComputeSquareToQuadProjectionMatrix: FCP
 * builds the square-to-quad matrix in xmm registers (SAME math as the
 * sibling function — closure defect, affine vs projective branch, (g,h),
 * col_u, col_v) and then computes the 4x4 inverse in-place via
 * adjugate / determinant, writing the result to `out`.
 *
 * Symbol:  __Z37PCComputeQuadToSquareProjectionMatrixRK9PCVector2IdES2_S2_S2_R14PCMatrix44TmplIdE
 * Address: @ProCore 0x00067d5c (thin-slice file offset == virtual addr)
 * Source disasm: raw-port/re/disasm/ProCore.__Z37PCComputeQuadToSquareProjectionMatrixRK9PCVector2IdES2_S2_S2_R14PCMatrix44TmplIdE.s
 * Framework: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore (x86_64 slice)
 *
 * ARGUMENT REGS (System V x86_64):
 *   rdi = P0 (const PCVector2<double>&)
 *   rsi = P1
 *   rdx = P2
 *   rcx = P3
 *   r8  = out (PCMatrix44Tmpl<double>&)
 *
 * ============================================================================
 * ALGORITHM
 * ============================================================================
 *
 * Stage 1 (@0x67d5c..0x67e3a): build the square-to-quad matrix components in
 *   registers. Identical math to PCComputeSquareToQuadProjectionMatrix — same
 *   closure test, same (g, h), same col_u/col_v — but the values are held in
 *   a DIFFERENT interleaved register layout (col_u.x and col_v.y in xmm4,
 *   col_v.x and col_u.y in xmm5) so they can be consumed by the inversion
 *   block that follows without shuffling back to the pure-row form.
 *
 * Stage 2 (@0x67e3e..0x67f70): compute the adjugate of the (x, y, w) 3x3
 *   projective block of the square-to-quad matrix
 *
 *     [ M00  M01  P0.x ]
 *     [ M10  M11  P0.y ]
 *     [  g    h    1   ]
 *
 *   (where M00 = col_u.x, M11 = col_v.y, M01 = col_v.x, M10 = col_u.y)
 *   and stitch it into a 4x4 with the z-column and z-row of an identity
 *   scaled by the same 2x2 sub-determinant (M00*M11 - M01*M10). Compute
 *   the full 3x3 det = M00*M11 - M01*M10 + g*(M01*P0.y - P0.x*M11)
 *                                        + h*(P0.x*M10 - P0.y*M00).
 *
 * Stage 3 (@0x67f74..0x67fae): divide every entry of `out` by det. This is
 *   done in a 4x4 double loop (rax is the OUTER row counter incremented at
 *   0x67fa0; the target `jne 0x67f84` on `cmp $0x4, %rax` re-enters at the
 *   `xorl %ecx, %ecx` that resets the inner column counter — 4 outer × 4
 *   inner (2 doubles per mulpd × 2 iterations) = 16 doubles).
 *
 * Rows of the final matrix (before the /det scaling) are:
 *
 *     row 0: [ M11 - h*P0.y,   h*P0.x - M01,   0,   M01*P0.y - P0.x*M11 ]
 *     row 1: [ P0.y*g - M10,   M00 - g*P0.x,   0,   P0.x*M10 - P0.y*M00 ]
 *     row 2: [ 0,              0,              det2,  0                 ]
 *     row 3: [ h*M10 - g*M11,  g*M01 - h*M00,  0,   det2                ]
 *
 *   where det2 = M00*M11 - M01*M10 (the top-left 2x2 sub-determinant).
 *
 * Divide the entire 4x4 by det (@0x67f80's `movddup` broadcasts 1/det into
 * both lanes of xmm0; the mulpd loop scales every packed pair) to obtain
 * the true inverse.
 *
 * ============================================================================
 * NUMERICS
 * ============================================================================
 * All arithmetic is double-precision (mulpd/subpd/addpd/divpd/hsubpd/mulsd/
 * subsd/addsd/divsd — no cvtsd2ss anywhere in the frame). Plain JS `number`
 * matches bit-for-bit; NO Math.fround is used (nor allowed — cf. sibling
 * PCComputeSquareToQuadProjectionMatrix and PCMatrix44Tmpl.ts header).
 *
 * ============================================================================
 * RODATA CONSTANTS (all addresses are ProCore x86_64 thin-slice file offsets)
 * ============================================================================
 *   @0x00122670  0x7fffffffffffffff duplicated — abs-value bit mask (andpd)
 *                Referenced RIP-relative @0x67d7c (next-PC 0x67d84 + 0xba8ec = 0x122670).
 *   @0x00123610  1e-7 duplicated (0x3e7ad7f29abcaf48 x2) — degeneracy threshold
 *                Referenced RIP-relative @0x67d88 (next-PC 0x67d91 + 0xbb87f = 0x123610).
 *   @0x00122530  1.0 (0x3ff0000000000000) — numerator for the 1.0/det reciprocal
 *                Referenced RIP-relative @0x67f74 (next-PC 0x67f7c + 0xba5b4 = 0x122530).
 */

import { PCMatrix44Tmpl_double } from "./PCMatrix44Tmpl";
import type { Vec2d } from "./PCComputeSquareToQuadProjectionMatrix";

/** Degeneracy threshold — packed against |s| via `cmpltpd` @0x67d88. See @0x123610. */
const DEGENERACY_EPS = 1e-7; // @ProCore 0x00123610

/** Numerator of the reciprocal `1.0 / det`. See @0x122530. */
const ONE = 1.0; // @ProCore 0x00122530

/**
 * PCComputeQuadToSquareProjectionMatrix — @ProCore 0x00067d5c.
 *
 * Writes the (P0,P1,P2,P3) -> (0,0)-(1,0)-(1,1)-(0,1) homogeneous
 * projection matrix into `out`. Instruction-by-instruction mirror of the
 * SSE2 body (build square-to-quad in registers, then invert into `out`).
 */
export function PCComputeQuadToSquareProjectionMatrix(
  P0: Vec2d,
  P1: Vec2d,
  P2: Vec2d,
  P3: Vec2d,
  out: PCMatrix44Tmpl_double,
): void {
  // ==========================================================================
  // Stage 1 — square-to-quad matrix components in xmm registers.
  // Same math as the sibling function, but the final layout stored into
  // (xmm0=P0, xmm1=(g,h), xmm4=(M00,M11), xmm5=(M01,M10)) is interleaved,
  // consumed directly by the 3x3 adjugate/inverse block that follows.
  // ==========================================================================

  // @0x67d5c-0x67d68 load args as packed (x,y) doubles:
  //   xmm2 = P1, xmm4 = P2, xmm6 = P3, xmm0 = P0
  const P0x = P0.x, P0y = P0.y;
  const P1x = P1.x, P1y = P1.y;
  const P2x = P2.x, P2y = P2.y;
  const P3x = P3.x, P3y = P3.y;

  // @0x67d6c-0x67d78: xmm5 = xmm0 - xmm2 + xmm4 - xmm6 = P0 - P1 + P2 - P3
  // Closure defect s: zero iff the quad is a parallelogram.
  const sX = P0x - P1x + P2x - P3x;
  const sY = P0y - P1y + P2y - P3y;

  // @0x67d7c-0x67d98: |s| < (1e-7, 1e-7) elementwise; movmskpd == 3 means
  // BOTH lanes < threshold, so `jne 0x67dc0` is NOT taken -> affine branch.
  const affine =
    Math.abs(sX) < DEGENERACY_EPS && Math.abs(sY) < DEGENERACY_EPS;

  // M00 = col_u.x, M11 = col_v.y  (packed together in xmm4 at 0x67e3a/0x67dba)
  // M01 = col_v.x, M10 = col_u.y  (packed together in xmm5 at 0x67e35/0x67daa)
  let M00: number, M01: number, M10: number, M11: number;
  let g: number, h: number;

  if (affine) {
    // ========================================================================
    // AFFINE BRANCH @0x67d9a..0x67dbe
    // ========================================================================
    // @0x67d9a-0x67daa: xmm5 = (P2.x, P1.y) - (P1.x, P0.y)
    //   = (P2.x - P1.x, P1.y - P0.y)
    // Under parallelogram closure P2 = P1 + P3 - P0, so P2.x - P1.x == P3.x - P0.x.
    const M01_affine = P2x - P1x; // == P3.x - P0.x under parallelogram closure
    const M10_affine = P1y - P0y;

    // @0x67dae-0x67db6: xmm4 = (P1.x, P2.y) - (P0.x, P1.y)
    //   = (P1.x - P0.x, P2.y - P1.y)
    // P2.y - P1.y == P3.y - P0.y under parallelogram closure.
    const M00_affine = P1x - P0x;
    const M11_affine = P2y - P1y; // == P3.y - P0.y under parallelogram closure

    // @0x67dba: xorpd xmm1, xmm1 -> (g, h) = (0, 0)
    M00 = M00_affine;
    M01 = M01_affine;
    M10 = M10_affine;
    M11 = M11_affine;
    g = 0;
    h = 0;
  } else {
    // ========================================================================
    // PROJECTIVE BRANCH @0x67dc0..0x67e3a
    // ========================================================================
    //
    // Same (g, h), col_u, col_v derivation as the SquareToQuad sibling, but
    // the columns are constructed with x-lane and y-lane swapped between
    // xmm4 and xmm5 so that
    //   xmm4 = ((P1.x-P0.x) + g*P1.x, (P3.y-P0.y) + h*P3.y) = (M00, M11)
    //   xmm5 = ((P3.x-P0.x) + h*P3.x, (P1.y-P0.y) + g*P1.y) = (M01, M10)
    //
    // ------------------------------------------------------------------------
    // @0x67dc0-0x67dcc:
    //   xmm3 = (P1.x, P3.y)     (from movsd P1 low into xmm3=P3)
    //   xmm7 = xmm3 - P2 = (P1.x - P2.x, P3.y - P2.y) = (dx1.x, dx3.y)
    const dx1x = P1x - P2x;
    const dx1y = P1y - P2y;
    const dx3x = P3x - P2x;
    const dx3y = P3y - P2y;

    // @0x67dd0-0x67dd4: xmm1 = shufpd 1 xmm7 = (dx3.y, dx1.x)
    // @0x67dd9-0x67de1: xmm2 = (P3.x, P1.y);  xmm6 = xmm2 - P2 = (dx3.x, dx1.y)
    // @0x67de5-0x67de9: xmm4 = unpcklpd(xmm7, xmm6) = (dx1.x, dx3.x)
    // @0x67ded    : xmm7 = unpckhpd(xmm7, xmm6) = (dx3.y, dx1.y)
    // @0x67df1    : xmm7 *= xmm4 -> xmm7 = (dx1.x*dx3.y, dx3.x*dx1.y)

    // @0x67df5-0x67df9: xmm4 = xmm3 - P0 = (P1.x - P0.x, P3.y - P0.y) = (uX, vY)
    // @0x67dfd-0x67e02: xmm8 = xmm2 - P0 = (P3.x - P0.x, P1.y - P0.y) = (vX, uY)
    const uX = P1x - P0x;
    const vY = P3y - P0y;
    const vX = P3x - P0x;
    const uY = P1y - P0y;

    // @0x67e07    : xmm1 *= xmm5 (=s) -> xmm1 = (dx3.y * sX, dx1.x * sY)
    // @0x67e0b    : shufpd 1 xmm5 -> xmm5 = (sY, sX)
    // @0x67e10    : xmm5 *= xmm6 -> xmm5 = (dx3.x*sY, dx1.y*sX)
    // @0x67e14    : xmm1 -= xmm5 -> xmm1 = (dx3.y*sX - dx3.x*sY, dx1.x*sY - dx1.y*sX)
    //                                     = (numG, numH)
    const numG = dx3y * sX - dx3x * sY;
    const numH = dx1x * sY - dx1y * sX;

    // @0x67e18    : hsubpd xmm7 -> both lanes = xmm7[0]-xmm7[1]
    //             = dx1.x*dx3.y - dx3.x*dx1.y = denom
    const denom = dx1x * dx3y - dx3x * dx1y;

    // @0x67e1c    : xmm1 /= xmm7 -> xmm1 = (g, h)
    g = numG / denom;
    h = numH / denom;

    // @0x67e20    : xmm3 *= xmm1 -> xmm3 = (g*P1.x, h*P3.y)
    // @0x67e24    : xmm3 += xmm4 -> xmm3 = ((uX + g*P1.x), (vY + h*P3.y)) = (M00, M11)
    M00 = uX + g * P1x;
    M11 = vY + h * P3y;

    // @0x67e28-0x67e2c: xmm5 = shufpd 1 xmm1 = (h, g)
    // @0x67e31    : xmm5 *= xmm2 -> xmm5 = (h*P3.x, g*P1.y)
    // @0x67e35    : xmm5 += xmm8 -> xmm5 = ((vX + h*P3.x), (uY + g*P1.y)) = (M01, M10)
    M01 = vX + h * P3x;
    M10 = uY + g * P1y;

    // @0x67e3a    : xmm4 = xmm3   (rename; xmm4 now holds (M00, M11))
  }

  // ==========================================================================
  // Stage 2 — adjugate of the 3x3 (x, y, w) projective block.
  // (@0x67e3e..0x67f70)
  //
  // The square-to-quad matrix's projective 3x3 is
  //
  //     [ M00  M01  P0.x ]
  //     [ M10  M11  P0.y ]
  //     [  g    h    1   ]
  //
  // Its adjugate (transpose of the cofactor matrix) is
  //
  //     [  M11 - h*P0.y     h*P0.x - M01     M01*P0.y - P0.x*M11 ]
  //     [  P0.y*g - M10     M00 - g*P0.x     P0.x*M10 - P0.y*M00 ]
  //     [  h*M10 - g*M11    g*M01 - h*M00    M00*M11 - M01*M10   ]
  //
  // The disasm assembles these entries in-register (mixing packed/scalar
  // ops so different components land in different xmm halves), stores the
  // 4x4 with Z-column/row identity-like scaffolding
  //
  //     [ adj[0][0]  adj[0][1]  0    adj[0][2] ]
  //     [ adj[1][0]  adj[1][1]  0    adj[1][2] ]
  //     [ 0          0          det2 0         ]     det2 = M00*M11 - M01*M10
  //     [ adj[2][0]  adj[2][1]  0    det2      ]
  //
  // and then Stage 3 divides everything by det. det2 at (2,2) becomes
  // det2/det, which (together with the Z-decoupled input structure) is
  // the correct z-row / homog-row entry after normalization.
  // ==========================================================================

  // @0x67e42-0x67e46: xmm2 = (h, h)        (unpckhpd (g,h),(g,h))
  // @0x67e4a-0x67e4e: xmm3 = (P0.y, P0.y)
  // @0x67e52   : xmm10 = xmm3 = (P0.y, P0.y)
  // @0x67e57   : xmm11 = P0 = (P0.x, P0.y)
  // @0x67e5c   : xmm11.lo = P0.x * h    -> xmm11 = (P0.x*h, P0.y)
  // @0x67e61   : xmm6 = (P0.y, P0.y)
  // @0x67e65-0x67e6a: xmm8 = (M11, M11)   (unpckhpd of (M00,M11))
  // @0x67e6f   : xmm7 = P0
  // @0x67e73   : xmm7.lo = P0.x * M11    -> xmm7 = (P0.x*M11, P0.y)
  // @0x67e78   : xmm9 = (g, h)
  // @0x67e7d   : xmm9 *= xmm5 (=(M01,M10))  -> xmm9 = (g*M01, h*M10)
  // @0x67e82-0x67e87: xmm12 = shufpd 1 (g,h) = (h, g)
  // @0x67e8d   : xmm12 *= (M00, M11)     -> xmm12 = (h*M00, g*M11)
  // @0x67e92   : xmm9 -= xmm12           -> xmm9 = (g*M01 - h*M00, h*M10 - g*M11)
  // @0x67e97   : xmm12 = (P0.y, P0.y)
  // @0x67e9c   : xmm12.lo = P0.y * g     -> xmm12 = (P0.y*g, P0.y)
  // @0x67ea1   : xmm3.lo = P0.y * M00    -> xmm3 = (P0.y*M00, P0.y)
  // @0x67ea5   : xmm8.lo = M11 * M00     -> xmm8 = (M11*M00, M11)
  // @0x67eaa   : unpcklpd xmm4, xmm12   -> xmm12 = (P0.y*g, M00)
  // @0x67eaf   : xmm4 = shufpd 1 (xmm4,xmm11) = (M11, P0.x*h)
  // @0x67eb5   : xmm10.lo = h * P0.y     -> xmm10 = (h*P0.y, P0.y)
  // @0x67eba   : xmm6.lo = M01 * P0.y    -> xmm6 = (M01*P0.y, P0.y)
  // @0x67ebe   : unpcklpd xmm5, xmm10   -> xmm10 = (h*P0.y, M01)
  // @0x67ec3   : xmm4 -= xmm10           -> xmm4 = (M11 - h*P0.y, P0.x*h - M01)

  const adj00 = M11 - h * P0y;      // out[0]  before /det   -- row 0, col 0
  const adj01 = h * P0x - M01;      // out[1]

  // @0x67ec8-0x67ecd: xmm10 = xmm6 = (M01*P0.y, P0.y)
  //                    xmm10.lo -= xmm7.lo (=P0.x*M11)
  //                    -> xmm10 = (M01*P0.y - P0.x*M11, P0.y)
  const adj03 = M01 * P0y - P0x * M11; // out[3]

  // @0x67ed2   : movupd xmm4 -> out[0..1] = (adj00, adj01)
  // @0x67ed7   : xmm11 = P0
  // @0x67edc   : xmm11 *= (g, h)         -> xmm11 = (P0.x*g, P0.y*h)
  // @0x67ee1   : rax = 0
  // @0x67ee3   : store rax at 0x10       -> out[2] = 0
  // @0x67ee7   : movsd xmm10 at 0x18     -> out[3] = adj03

  // @0x67eed-0x67ef1: xmm4 = (M10, M10)   (unpckhpd of (M01,M10))
  // @0x67ef5   : xmm0.lo = P0.x * M10    -> xmm0 = (P0.x*M10, P0.y)
  // @0x67ef9   : xmm4.lo = M01 * M10     -> xmm4 = (M01*M10, M10)
  // @0x67efd   : xmm5 = shufpd 1 (xmm5, xmm11) = (M10, P0.x*g)
  // @0x67f03   : xmm12 -= xmm5           -> xmm12 = (P0.y*g - M10, M00 - P0.x*g)
  const adj10 = P0y * g - M10;      // out[4]
  const adj11 = M00 - P0x * g;      // out[5]

  // @0x67f08   : movupd xmm12 at 0x20    -> out[4..5] = (adj10, adj11)

  // @0x67f0e   : xmm5 = xmm0 = (P0.x*M10, P0.y)
  // @0x67f12   : xmm5.lo -= xmm3.lo (=P0.y*M00)
  //             -> xmm5 = (P0.x*M10 - P0.y*M00, P0.y)
  const adj13 = P0x * M10 - P0y * M00; // out[7]

  // @0x67f16   : store 0 at 0x30         -> out[6] = 0
  // @0x67f1a   : movsd xmm5 at 0x38      -> out[7] = adj13

  // @0x67f20-0x67f24: xorpd xmm5, movupd -> out[8..9] = (0, 0)

  // @0x67f2a   : xmm6.lo *= g            -> xmm6 = (g*M01*P0.y, P0.y)
  // @0x67f2e   : xmm6.lo += xmm8.lo (=M00*M11)
  //             -> xmm6 = (g*M01*P0.y + M00*M11, P0.y)
  // @0x67f33   : xmm8.lo -= xmm4.lo (=M01*M10)
  //             -> xmm8 = (M00*M11 - M01*M10, M11)   -- the 2x2 sub-det
  const det2 = M00 * M11 - M01 * M10;

  // @0x67f38   : movsd xmm8 at 0x50      -> out[10] = det2
  // @0x67f3e   : store 0 at 0x58         -> out[11] = 0

  // @0x67f42   : shufpd 1 xmm9           -> xmm9 = (h*M10 - g*M11, g*M01 - h*M00)
  // @0x67f48   : movupd xmm9 at 0x60     -> out[12..13] = (h*M10 - g*M11, g*M01 - h*M00)
  const adj30 = h * M10 - g * M11;
  const adj31 = g * M01 - h * M00;

  // @0x67f4e   : store 0 at 0x70         -> out[14] = 0
  // @0x67f52   : movsd xmm8 at 0x78      -> out[15] = det2   (same value as m22)

  // ==========================================================================
  // Compute the FULL 3x3 determinant (@0x67f58..0x67f70)
  //   det = M00*M11 - M01*M10                        (already in xmm6.lo minus more)
  //       + g*(M01*P0.y - P0.x*M11)
  //       + h*(P0.x*M10 - P0.y*M00)
  //
  // Instruction stream (all scalar-double on the low lane):
  //   xmm0.lo (=P0.x*M10) *= xmm2.lo (=h)       -> h*P0.x*M10
  //   xmm0.lo += xmm6.lo  (=g*M01*P0.y + M00*M11)
  //   xmm7.lo (=P0.x*M11) *= xmm1.lo (=g)       -> g*P0.x*M11
  //   xmm0.lo -= xmm7.lo                        -> ... - g*P0.x*M11
  //   xmm0.lo -= xmm4.lo  (=M01*M10)            -> ... - M01*M10
  //   xmm3.lo (=P0.y*M00) *= xmm2.lo (=h)       -> h*P0.y*M00
  //   xmm0.lo -= xmm3.lo                        -> ... - h*P0.y*M00
  // ==========================================================================
  const det =
    M00 * M11 - M01 * M10 +
    g * (M01 * P0y - P0x * M11) +
    h * (P0x * M10 - P0y * M00);

  // ==========================================================================
  // Stage 3 — divide the entire 4x4 by det. (@0x67f74..0x67fab)
  //   xmm1.lo = 1.0 (@0x122530) ; xmm1.lo /= det ; xmm0 = (1/det, 1/det)
  //   Inner loop over 4 pairs of doubles per row; outer loop over 4 rows.
  // The 0 entries stay 0 (0 * 1/det = 0), so we can equivalently just scale
  // the 8 non-zero adjugate entries and leave the eight zero slots at 0.
  // ==========================================================================
  const invDet = ONE / det;

  const m = out.m;
  // Row 0 — @out[0x00..0x18]
  m[0]  = adj00 * invDet;
  m[1]  = adj01 * invDet;
  m[2]  = 0;                       // (0 * invDet)
  m[3]  = adj03 * invDet;
  // Row 1 — @out[0x20..0x38]
  m[4]  = adj10 * invDet;
  m[5]  = adj11 * invDet;
  m[6]  = 0;
  m[7]  = adj13 * invDet;
  // Row 2 — @out[0x40..0x58]
  m[8]  = 0;
  m[9]  = 0;
  m[10] = det2 * invDet;
  m[11] = 0;
  // Row 3 — @out[0x60..0x78]
  m[12] = adj30 * invDet;
  m[13] = adj31 * invDet;
  m[14] = 0;
  m[15] = det2 * invDet;
}
