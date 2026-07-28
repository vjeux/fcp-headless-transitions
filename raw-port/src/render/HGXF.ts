// HGXF.ts — free functions in the HGXF namespace family (currently one method).
// Faithful transcription from x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
// Source disasm: raw-port/re/disasm/Helium.HGXF.rectContainsIntersection.s @0x153ff0

import type { HGRect } from "./HGRect.js";

/**
 * HGXF::rectContainsIntersection(HGRect r, double a, double b, double c, double d,
 *                                double e, double f, double g, double h)
 *   @Helium 0x000153ff0
 *   __ZN4HGXF24rectContainsIntersectionE6HGRectdddddddd
 *
 * Given a rect and two line segments (line1: (a,b)→(c,d), line2: (e,f)→(g,h)),
 * tests whether the intersection point of the two lines lies inside the rect.
 *
 * The disasm does the check in two rounds — a fast ucomisd/jb-based path that
 * returns true immediately if the intersection lies clearly inside, and a
 * fallback cmplesd/setae-based robust path that computes the intersection via
 * the OTHER line's parameter (numerically distinct expression of the same
 * point) and returns the AND of the four in-range predicates. If either round
 * accepts, the function returns true.
 *
 * RIP-relative data constants (resolved via resolve.py Helium const):
 *   @0x85aad0  0x7fffffffffffffff  — abs() bitmask (used to take |det| for
 *                                     the parallel-lines test)
 *   @0x85ab20  1e-06 double        — epsilon for the parallel-lines cutoff
 *
 * All floating-point math is IEEE754 double, native — no fround/f32 wrap.
 */
export function HGXF_rectContainsIntersection(
  r: HGRect,
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
): boolean {
  // ---- Prologue: xmm0=a, xmm1=b, xmm2=c, xmm3=d, xmm4=e, xmm5=f, xmm6=g, xmm7=h
  //      HGRect r packed in %rdi:%rsi as int32 (x | y<<32 | right | bottom<<32).
  //      We re-use the JS r.{x,y,right,bottom} directly since layout is known.

  // @0x153ff4  subsd %xmm5, %xmm7   -> xmm7 = h - f   (= line2 dy)
  let xmm7 = h - f;
  // @0x153ff8  subsd %xmm0, %xmm2   -> xmm2 = c - a   (= line1 dx)
  let xmm2 = c - a;
  // @0x153ffc  movapd %xmm2, %xmm8
  // @0x154001  mulsd  %xmm7, %xmm8  -> xmm8 = xmm2 * xmm7   (line1 dx * line2 dy)
  let xmm8 = xmm2 * xmm7;
  // @0x154006  subsd %xmm4, %xmm6   -> xmm6 = g - e   (= line2 dx)
  let xmm6 = g - e;
  // @0x15400a  movapd %xmm1, %xmm9
  // @0x15400f  subsd  %xmm3, %xmm9  -> xmm9 = b - d   (= -line1 dy)
  let xmm9 = b - d;
  // @0x154014  mulsd  %xmm6, %xmm9  -> xmm9 = xmm9 * xmm6   ((b-d) * line2 dx)
  xmm9 = xmm9 * xmm6;
  // @0x154019  subsd  %xmm9, %xmm8  -> xmm8 = det = xmm8 - xmm9
  xmm8 = xmm8 - xmm9;

  // @0x15401e  movapd 0x706aa9(%rip),%xmm9   -> xmm9 = 0x7fffffffffffffff (abs mask)
  // @0x154027  andpd  %xmm8, %xmm9           -> xmm9 = |det|
  //   NOTE: andpd of a double with the sign-bit-cleared mask == fabs.
  const absDet = Math.abs(xmm8); // |det|
  // @0x15402c  movsd  0x706aeb(%rip),%xmm10  -> xmm10 = 1e-06
  const EPS = 1e-6;
  // @0x154035  ucomisd %xmm9,%xmm10          ; compare EPS vs |det|
  // @0x15403a  jbe    0x154040                ; if EPS <= |det| continue
  //                                          ; otherwise fall through to return 0
  // ucomisd/jbe treats NaN as unordered so falls through to the ret-0 path too.
  //
  // We mirror the asm: if !(EPS <= |det|) (i.e. |det| < EPS or NaN) → return false.
  if (!(EPS <= absDet)) {
    // @0x15403c  xorl %eax,%eax ; @0x15403e popq %rbp ; @0x15403f retq
    return false;
  }

  // ---- Rect corners loaded as doubles.
  // @0x154040-0x15404a  extract r.right (rsi lo→eax lo == rsi lo before shr; wait
  //   the asm shifts %rsi right by 0x20 into %rax, then %rdi right by 0x20 into %rcx —
  //   those are the HIGH 32-bit halves = r.bottom (from rsi) and r.y (from rdi).
  //   The LOW halves reach cvtsi2sd via edi/esi directly.
  //
  // @0x154093  xorps %xmm0,%xmm0
  // @0x154096  cvtsi2sd %edi,%xmm0   -> xmm0 = double(r.x)          (low32 of rdi)
  const rectX = r.x;
  // @0x15409f  cvtsi2sd %esi,%xmm13  -> xmm13 = double(r.right)     (low32 of rsi)
  const rectRight = r.right;
  // @0x1540a4  xorps %xmm10,%xmm10
  // @0x1540a8  cvtsi2sd %ecx,%xmm10  -> xmm10 = double(r.y)          (high32 of rdi)
  const rectY = r.y;
  // @0x1540ad  xorps %xmm9,%xmm9
  // @0x1540b1  cvtsi2sd %eax,%xmm9   -> xmm9 = double(r.bottom)      (high32 of rsi)
  const rectBottom = r.bottom;

  // ---- First-round intersection via parameter t on line1: p(t) = P0a + t*(P0b-P0a)
  // @0x15404e  movapd %xmm1, %xmm11
  // @0x154053  subsd  %xmm5, %xmm11   -> xmm11 = b - f
  const xmm11 = b - f;
  // @0x154058  movapd %xmm11,%xmm14
  // @0x15405d  mulsd  %xmm6, %xmm14   -> xmm14 = (b-f) * (g-e)   [xmm6 = line2 dx]
  let xmm14 = xmm11 * xmm6;
  // @0x154062  movapd %xmm0, %xmm12
  // @0x154067  subsd  %xmm4, %xmm12   -> xmm12 = a - e
  const xmm12 = a - e;
  // @0x15406c  movapd %xmm12,%xmm9    ; (this is the reg-9 reuse — different xmm9
  //             from the one we already read for r.bottom; the asm just tramples
  //             a scratch — the DOUBLE value for r.bottom is preserved in the
  //             out-of-band comparisons below via the same asm's use of xmm9,
  //             which is set later at 0x1540b1 to the r.bottom double. Faithful
  //             port: use two separate JS locals.)
  // @0x154071  mulsd %xmm7, %xmm9     -> xmm9_scratch = (a-e) * (h-f)  [xmm7 = line2 dy]
  const xmm9_num2 = xmm12 * xmm7;
  // @0x154076  subsd %xmm9, %xmm14    -> xmm14 = (b-f)*(g-e) - (a-e)*(h-f)   (= num_t)
  xmm14 = xmm14 - xmm9_num2;
  // @0x15407b  divsd %xmm8, %xmm14    -> xmm14 = t = num_t / det
  xmm14 = xmm14 / xmm8;
  // @0x154080  subsd %xmm1, %xmm3     -> xmm3 = d - b   (line1 dy;  overwrites the
  //                                     old xmm3=d value — we mirror this)
  const line1Dy = d - b;
  // @0x154084  movapd %xmm2, %xmm15
  // @0x154089  mulsd  %xmm14, %xmm15  -> xmm15 = xmm2 * t = (c-a) * t = dx1 * t
  // @0x15408e  addsd  %xmm0, %xmm15   -> xmm15 = a + dx1*t   ; intersection X on line1
  //             NOTE: xmm0 = a HERE, before the cvtsi2sd overwrite below.
  const ix = a + xmm2 * xmm14;

  // The asm now overwrites xmm0/xmm10/xmm9 with the rect corner doubles (already
  // captured above). Meanwhile xmm15 (=ix) is compared against them.
  //
  // @0x15409a  ucomisd %xmm0,%xmm15    ; compare r.x vs ix
  // @0x1540b6  jb      0x1540db        ; if ix < r.x → fallback
  // @0x1540b8  ucomisd %xmm15,%xmm13   ; compare ix vs r.right
  // @0x1540bd  jb      0x1540db        ; if r.right < ix → fallback
  //   (ucomisd/jb treats NaN as unordered → also falls through to fallback,
  //   which is the point of the two-round design: try fast, then robust.)
  if (!(ix >= rectX) || !(rectRight >= ix)) {
    return roundTwo();
  }
  // @0x1540bf  mulsd  %xmm3, %xmm14    -> xmm14 = t * (d-b) = t * line1Dy
  //                                     (xmm14 was t before this)
  // Faithful mirroring: reuse xmm14 slot so we don't accidentally reference
  // the pre-mul value later.
  xmm14 = xmm14 * line1Dy;
  // @0x1540c4  addsd  %xmm14, %xmm1    -> xmm1 = b + t*(d-b)  ; intersection Y on line1
  let xmm1 = b + xmm14;
  // @0x1540c9  ucomisd %xmm10, %xmm1   ; compare r.y vs iy
  // @0x1540ce  jb      0x1540db        ; if iy < r.y → fallback
  if (!(xmm1 >= rectY)) {
    return roundTwo();
  }
  // @0x1540d0  movb $0x1, %al          ; provisional true
  // @0x1540d2  ucomisd %xmm1, %xmm9    ; compare iy vs r.bottom
  // @0x1540d7  jb      0x1540db        ; if r.bottom < iy → fallback
  // @0x1540d9  popq %rbp ; @0x1540da retq   ; else return true
  if (!(rectBottom >= xmm1)) {
    return roundTwo();
  }
  return true;

  // ---- Second-round robust intersection via parameter u on line2.
  // @0x1540db-0x154126
  //
  // The asm re-uses xmm2 (=dx1), xmm3 (=line1Dy after 0x154080), xmm11 (=b-f),
  // xmm12 (=a-e), xmm6 (=dx2), xmm7 (=dy2), xmm8 (=det), xmm4 (=e), xmm5 (=f),
  // xmm10 (=rectY), xmm13 (=rectRight), xmm9 (=rectBottom), xmm0 (=rectX).
  //
  // @0x1540db  mulsd %xmm11,%xmm2   -> xmm2 = (c-a) * (b-f)
  // @0x1540e0  mulsd %xmm12,%xmm3   -> xmm3 = (d-b) * (a-e)
  // @0x1540e5  subsd %xmm3, %xmm2   -> xmm2 = (c-a)*(b-f) - (d-b)*(a-e)   (= num_u)
  // @0x1540e9  divsd %xmm8, %xmm2   -> xmm2 = u = num_u / det
  // @0x1540ee  mulsd %xmm2, %xmm7   -> xmm7 = (h-f) * u
  // @0x1540f2  addsd %xmm7, %xmm5   -> xmm5 = f + u*(h-f)   ; iy2 = intersection Y on line2
  // @0x1540f6  mulsd %xmm2, %xmm6   -> xmm6 = (g-e) * u
  // @0x1540fa  addsd %xmm6, %xmm4   -> xmm4 = e + u*(g-e)   ; ix2 = intersection X on line2
  // @0x1540fe  cmplesd %xmm4, %xmm0 -> xmm0 = (r.x <= ix2) ? all-ones-mask : 0
  // @0x154103  cmplesd %xmm13,%xmm4 -> xmm4 = (ix2 <= r.right) ? all-ones-mask : 0
  // @0x154109  ucomisd %xmm10,%xmm5 -> compare iy2 vs r.y
  // @0x15410e  andpd   %xmm0, %xmm4 -> xmm4 = (r.x<=ix2) AND (ix2<=r.right)  [bitwise]
  // @0x154112  setae   %cl          -> cl = (iy2 >= r.y) ? 1 : 0   (unsigned ≥ = ordered ≥)
  // @0x154115  ucomisd %xmm5, %xmm9 -> compare r.bottom vs iy2
  // @0x15411a  movd    %xmm4, %edx  -> edx = low32 of xmm4 (0 or -1); LSB is what matters
  // @0x15411e  setae   %al          -> al = (r.bottom >= iy2) ? 1 : 0
  // @0x154121  andb    %cl, %al
  // @0x154123  andb    %dl, %al     -> return al  (bit 0 of edx anded in)
  //
  // NaN semantics:
  //   cmplesd unordered → 0 mask; ucomisd unordered → CF=PF=ZF=1 so setae is 0.
  //   Any NaN anywhere → returns false. We honour that.
  function roundTwo(): boolean {
    // Re-derive the still-live temporaries from their post-first-round values.
    // (In the asm these live in xmm registers; in JS we recompute from the
    //  original args for clarity — the values are the SAME expressions.)
    const dx1 = c - a; // xmm2 pre-first-round (still holds this in asm)
    const dy1 = d - b; // xmm3 post-@0x154080 (line1Dy)
    const dx2 = g - e; // xmm6
    const dy2 = h - f; // xmm7
    const b_minus_f = b - f; // xmm11
    const a_minus_e = a - e; // xmm12
    const det = xmm8;

    // xmm2 = dx1 * (b-f) ; xmm3 = dy1 * (a-e) ; xmm2 -= xmm3 ; xmm2 /= det
    const num_u = dx1 * b_minus_f - dy1 * a_minus_e;
    const u = num_u / det;
    // ix2 = e + u * (g-e) ; iy2 = f + u * (h-f)
    const ix2 = e + u * dx2;
    const iy2 = f + u * dy2;

    // cmplesd is ordered LE with unordered→0. In JS: `x <= y` returns false for
    // NaN operands, exactly matching the SSE ordered-LE-with-unordered-false.
    const xInRect = rectX <= ix2 && ix2 <= rectRight;
    // setae after ucomisd — ordered ≥. NaN → false. Match with `>=`.
    const yGE_top = iy2 >= rectY;
    const yLE_bot = rectBottom >= iy2;
    return xInRect && yGE_top && yLE_bot;
  }
}
