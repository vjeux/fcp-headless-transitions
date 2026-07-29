/**
 * PCComputeSquareToQuadProjectionMatrix — build the 4x4 homogeneous
 * projection matrix that maps the unit square {(0,0),(1,0),(1,1),(0,1)}
 * onto four destination corners P0,P1,P2,P3 (in that order).
 *
 * Symbol: __Z37PCComputeSquareToQuadProjectionMatrixRK9PCVector2IdES2_S2_S2_R14PCMatrix44TmplIdE
 * Address: @ProCore 0x00067c0f (thin-slice file offset == virtual addr)
 * Source disasm: raw-port/re/disasm/ProCore.__Z37PCComputeSquareToQuadProjectionMatrixRK9PCVector2IdES2_S2_S2_R14PCMatrix44TmplIdE.s
 * Framework: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore (x86_64 slice)
 *
 * The FCP binary computes this in-place with SSE2 packed doubles (mulpd/subpd/divpd/
 * hsubpd), then writes it out to a 128-byte row-major PCMatrix44Tmpl<double>.
 * This TS port mirrors the disasm's control flow and arithmetic instruction-by-
 * instruction; every constant cites the ProCore rodata address it was read from.
 *
 * ARGUMENT REGS (System V x86_64):
 *   rdi = P0 (const PCVector2<double>&)
 *   rsi = P1
 *   rdx = P2
 *   rcx = P3
 *   r8  = out (PCMatrix44Tmpl<double>&)
 *
 * ALGORITHM (recovered from the two branches at @0x67c54):
 *   Compute the "closure" sum s = P0 - P1 + P2 - P3 (packed doubles, @0x67c28..).
 *   If both |s.x| < 1e-7 AND |s.y| < 1e-7 (@0x67c38 abs mask + @0x67c44 cmpltpd
 *   against 1e-7,1e-7; movmskpd == 3 means BOTH components under threshold):
 *     PARALLELOGRAM (affine): jne is NOT taken, fall through to affine block
 *     @0x67c56..0x67c80. g = h = 0. Column vectors are the two edges from P0.
 *     By parallelogram closure P2 = P1 + P3 - P0, so equivalently
 *       col_u = P1 - P0 = P2 - P3 (== disasm writes P2-P1 which == P3-P0 by closure)
 *       col_v = P3 - P0 = P2 - P1 (== disasm writes P2-P1)
 *   Else PROJECTIVE (@0x67c85..0x67d0a):
 *     dx1  = P1 - P2
 *     dx3  = P3 - P2
 *     g = (s.x*dx3.y - s.y*dx3.x) / (dx1.x*dx3.y - dx1.y*dx3.x)   ; = (s x dx3)/(dx1 x dx3)
 *     h = (dx1.x*s.y - dx1.y*s.x) / (dx1.x*dx3.y - dx1.y*dx3.x)   ; = (dx1 x s)/(dx1 x dx3)
 *     col_u = (P1 - P0) + g*P1
 *     col_v = (P3 - P0) + h*P3
 *
 * OUTPUT LAYOUT (row-major, 4x4, from stores @0x67d0e..0x67d54):
 *     [ col_u.x  col_v.x  0  P0.x ]      m00 m01 m02 m03
 *     [ col_u.y  col_v.y  0  P0.y ]      m10 m11 m12 m13
 *     [   0        0      1    0  ]      m20 m21 m22 m23
 *     [   g        h      0    1  ]      m30 m31 m32 m33
 *   This is the classical square-to-quad homography written with the
 *   third row = z-passthrough (r2c2 = 1.0 @ [rip+0xba7ef]=0x122530=1.0)
 *   and the perspective row = (g, h, 0, 1) (r3c3 = 1.0 @ [rip+0xba7dc]=0x122530=1.0).
 *
 * NUMERICS: all arithmetic is double-precision (mulpd/addpd/subpd/divpd/hsubpd —
 * no cvtsd2ss anywhere in the frame), so plain JS `number` matches bit-for-bit.
 * NO Math.fround wrapping is required (nor allowed — it would introduce single-
 * precision rounding the binary does not do). Cf. PCMatrix44Tmpl.ts header.
 *
 * RODATA CONSTANTS (all addresses are ProCore x86_64 thin-slice file offsets):
 *   @0x00122670  0x7fffffffffffffff duplicated — abs-value bit mask (andpd)
 *                Referenced RIP-relative @0x67c38 (rip+0xbaa30 = 0x122670).
 *   @0x00123610  1e-7 duplicated (0x3e7ad7f29abcaf48 x2) — degeneracy threshold
 *                Referenced RIP-relative @0x67c44 (rip+0xbb9c3 = 0x123610).
 *   @0x00122530  1.0 (0x3ff0000000000000) — the row-2 and row-3 diagonal
 *                Referenced RIP-relative @0x67d39 and @0x67d4c.
 */

import { PCMatrix44Tmpl_double } from "./PCMatrix44Tmpl";

/** A 2D vector of doubles. Matches `PCVector2<double>` layout: (x @+0x00, y @+0x08). */
export interface Vec2d {
  x: number;
  y: number;
}

/** Degeneracy threshold — packed against |s| via `cmpltpd` @0x67c44. See @0x123610. */
const DEGENERACY_EPS = 1e-7; // @ProCore 0x00123610

/** Row-2 and row-3 diagonal constant. See @0x122530. */
const ONE = 1.0; // @ProCore 0x00122530

/**
 * PCComputeSquareToQuadProjectionMatrix — @ProCore 0x00067c0f.
 *
 * Writes the (0,0)-(1,0)-(1,1)-(0,1) -> (P0,P1,P2,P3) homogeneous projection
 * matrix into `out`. Instruction-by-instruction mirror of the SSE2 body.
 */
export function PCComputeSquareToQuadProjectionMatrix(
  P0: Vec2d,
  P1: Vec2d,
  P2: Vec2d,
  P3: Vec2d,
  out: PCMatrix44Tmpl_double,
): void {
  // @0x67c13-0x67c24 load args as packed (x,y) doubles:
  //   xmm0 = (P0.x, P0.y), xmm1 = (P1.x, P1.y), xmm6 = (P2.x, P2.y), xmm5 = (P3.x, P3.y)
  //   xmm2 = (P1.y, 0) via movsd 0x8(rsi) — used later in the affine block for xmm4 setup.
  const P0x = P0.x, P0y = P0.y;
  const P1x = P1.x, P1y = P1.y;
  const P2x = P2.x, P2y = P2.y;
  const P3x = P3.x, P3y = P3.y;

  // @0x67c28-0x67c34: xmm4 = xmm0 - xmm1 + xmm6 - xmm5 = P0 - P1 + P2 - P3  (packed).
  // This is the "closure defect" s: zero iff the quad is a parallelogram.
  const sX = P0x - P1x + P2x - P3x;
  const sY = P0y - P1y + P2y - P3y;

  // @0x67c38-0x67c54: |s| < (1e-7, 1e-7) elementwise ; if BOTH bits set
  // (movmskpd == 3) take the affine branch (jne NOT taken).
  const affine =
    Math.abs(sX) < DEGENERACY_EPS && Math.abs(sY) < DEGENERACY_EPS;

  let m00: number, m01: number, m03: number;
  let m10: number, m11: number, m13: number;
  let m30: number, m31: number;

  if (affine) {
    // ============================================================
    // AFFINE (parallelogram) BRANCH @0x67c56..0x67c80
    // ============================================================
    // @0x67c56-0x67c62:
    //   xmm3  = P0 ; unpcklpd xmm1 -> xmm3 = (P0.x, P1.x)
    //   xmm1' = unpcklpd P2 into P1 -> xmm1 = (P1.x, P2.x)
    //   xmm1 -= xmm3   -> xmm1 = (P1.x - P0.x, P2.x - P1.x)
    const uX = P1x - P0x;
    const vX = P2x - P1x; // == P3.x - P0.x under parallelogram closure

    // @0x67c66-0x67c78:
    //   xmm4 = (P1.y, P2.y)   [movapd xmm2 then movhpd 0x8(%rdx)]
    //   xmm3 = shufpd 1 xmm2 into xmm0 -> xmm3 = (P0.y, P1.y)
    //   xmm4 -= xmm3          -> xmm4 = (P1.y - P0.y, P2.y - P1.y)
    const uY = P1y - P0y;
    const vY = P2y - P1y; // == P3.y - P0.y under parallelogram closure

    // @0x67c7c: xorpd xmm3, xmm3 -> (g, h) = (0, 0) for affine.
    // @0x67c80: jmp to shared writeout.
    m00 = uX;
    m01 = vX;
    m03 = P0x;
    m10 = uY;
    m11 = vY;
    m13 = P0y;
    m30 = 0;
    m31 = 0;
  } else {
    // ============================================================
    // PROJECTIVE BRANCH @0x67c85..0x67d0a
    // ============================================================
    // @0x67c85-0x67c8d: xmm7 = movsd(xmm1 low into xmm5) = (P1.x, P3.y);
    //                   xmm7 -= P2 packed -> xmm7 = (P1.x - P2.x, P3.y - P2.y)
    //   = (dx1.x, dx3.y) where dx1 = P1 - P2, dx3 = P3 - P2.
    const dx1x = P1x - P2x;
    const dx1y = P1y - P2y;
    const dx3x = P3x - P2x;
    const dx3y = P3y - P2y;

    // @0x67c91-0x67c95: xmm3 = shufpd 1 xmm7 -> (xmm7[1], xmm7[0]) = (dx3.y, dx1.x)
    // @0x67c9a-0x67ca4: xmm8 = (P3.x, P1.y) - P2 = (dx3.x, dx1.y)
    // @0x67ca9-0x67cb2:
    //    xmm6 = unpcklpd(xmm7,xmm8) = (dx1.x, dx3.x)
    //    xmm7 = unpckhpd(xmm7,xmm8) = (dx3.y, dx1.y)
    // @0x67cb7: xmm7 *= xmm6 -> xmm7 = (dx1.x*dx3.y, dx3.x*dx1.y)

    // @0x67cbb: xmm1 = unpcklpd(xmm1, xmm5) = (P1.x, P3.x)
    // @0x67cbf: xmm5 = movddup(xmm0) = (P0.x, P0.x)
    // @0x67cc3-0x67cc7: xmm6 = xmm1 - xmm5 = (P1.x - P0.x, P3.x - P0.x)
    const uX0 = P1x - P0x;
    const vX0 = P3x - P0x;

    // @0x67ccb: xmm3 *= xmm4  where xmm4 = s (still holding (s.x, s.y) from prologue).
    //   -> xmm3 = ((dx3.y)*s.x, (dx1.x)*s.y)
    // @0x67ccf: shufpd 1 xmm4 -> xmm4 = (s.y, s.x)
    // @0x67cd4: xmm4 *= xmm8 = ((dx3.x)*s.y, (dx1.y)*s.x)
    // @0x67cd9: xmm3 -= xmm4 -> xmm3 = (dx3.y*s.x - dx3.x*s.y , dx1.x*s.y - dx1.y*s.x)
    //   Component 0 = s x dx3   (using a x b := a.x*b.y - a.y*b.x; here s.x*dx3.y - s.y*dx3.x).
    //   Component 1 = dx1 x s.
    const num_g = sX * dx3y - sY * dx3x;
    const num_h = dx1x * sY - dx1y * sX;

    // @0x67cdd: hsubpd xmm7 -> both lanes = xmm7[0]-xmm7[1] = dx1.x*dx3.y - dx3.x*dx1.y = dx1 x dx3.
    const denom = dx1x * dx3y - dx3x * dx1y;

    // @0x67ce1: xmm3 /= xmm7 -> xmm3 = (g, h)
    const g = num_g / denom;
    const h = num_h / denom;

    // @0x67ce5: xmm1 *= xmm3 -> (g*P1.x, h*P3.x)
    // @0x67ce9: xmm2 gets high = P3.y -> xmm2 = (P1.y, P3.y)
    // @0x67cee: xmm1 += xmm6 -> (u.x, v.x) = ((P1.x - P0.x) + g*P1.x , (P3.x - P0.x) + h*P3.x)
    const colUx = uX0 + g * P1x;
    const colVx = vX0 + h * P3x;

    // @0x67cf2-0x67cf6: xmm4 = unpckhpd(xmm0,xmm0) = (P0.y, P0.y)
    // @0x67cfa-0x67cfe: xmm5 = xmm2 - xmm4 = (P1.y - P0.y, P3.y - P0.y)
    // @0x67d02: xmm2 *= xmm3 -> (g*P1.y, h*P3.y)
    // @0x67d06: xmm2 += xmm5 -> (u.y, v.y) = ((P1.y - P0.y) + g*P1.y, (P3.y - P0.y) + h*P3.y)
    // @0x67d0a: xmm4 = xmm2  (renamed for the shared writeout)
    const colUy = (P1y - P0y) + g * P1y;
    const colVy = (P3y - P0y) + h * P3y;

    m00 = colUx;
    m01 = colVx;
    m03 = P0x;
    m10 = colUy;
    m11 = colVy;
    m13 = P0y;
    m30 = g;
    m31 = h;
  }

  // ============================================================
  // SHARED WRITEOUT @0x67d0e..0x67d54
  //   movupd xmm1, (r8)          -> m00, m01
  //   movq   0,     0x10(r8)     -> m02 = 0
  //   movlpd xmm0.lo,0x18(r8)    -> m03 = P0.x
  //   movupd xmm4, 0x20(r8)      -> m10, m11
  //   movq   0,     0x30(r8)     -> m12 = 0
  //   movhpd xmm0.hi,0x38(r8)    -> m13 = P0.y
  //   xorpd  + movupd, 0x40(r8)  -> m20 = m21 = 0
  //   movsd 1.0 (@0x122530), movups,0x50(r8) -> m22 = 1.0, m23 = 0 (movsd from mem zeros hi)
  //   movupd xmm3, 0x60(r8)      -> m30 = g|0, m31 = h|0
  //   xorpd + movhpd 1.0(@0x122530), movupd,0x70(r8) -> m32 = 0, m33 = 1.0
  // ============================================================
  const m = out.m;
  m[0]  = m00;  m[1]  = m01;  m[2]  = 0;    m[3]  = m03;
  m[4]  = m10;  m[5]  = m11;  m[6]  = 0;    m[7]  = m13;
  m[8]  = 0;    m[9]  = 0;    m[10] = ONE;  m[11] = 0;
  m[12] = m30;  m[13] = m31;  m[14] = 0;    m[15] = ONE;
}
