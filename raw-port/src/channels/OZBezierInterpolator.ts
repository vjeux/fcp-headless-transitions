// OZBezierInterpolator — ProChannel.framework. Faithful transcription of the two ORACLE-GATED
// free functions the parity harness verifies bit-for-bit against the live FCP symbols:
//   __Z12OZBezierEvalPKdd           @ProChannel 0xa549c  ->  OZBezierEval(ctrl[4], u) -> double
//   __Z21OZBezierFindParameterPKdd  @ProChannel 0xa57c7  ->  OZBezierFindParameter(tctrl[4], t) -> double
// A helper OZBezierGetRoots (called by FindParameter) is also transcribed:
//   __Z16OZBezierGetRootsPKddPd     @ProChannel 0xa5716  ->  OZBezierGetRoots(ctrl[4], t, out[3]) -> count
//
// The 13 class methods of OZBezierInterpolator (ctor/dtor + interpolate/eval/computeTangents/
// getControlPoints/subDivide/getMinMaxValues/uForCurveValue) sit atop these two free fns.
// They require getVertexValue @0x303a6, getVertexInputHandles @0x3c522, getVertexOutputHandles
// @0x3c5da, OZBezierSanitizeControlPolygon @0xa550c, and the CMTime-vector combine at 0x40a10+
// — NONE of which are decoded yet. Per PORTING_SPEC Rule 3 they THROW citing their addrs.
//
// Decode evidence:
//   raw-port/re/BEZIER_DECODE.md                    (getControlPoints / interpolate outline)
//   raw-port/re/disasm/ProChannel.OZBezierInterpolator.interpolate.s
//   /tmp/OZBezierEval.s              (extracted from otool -tV of ProChannel)
//   /tmp/OZBezierGetRoots.s
//   /tmp/OZBezierFindParameter.s
//   raw-port/src/infra/PCMath.ts     (quadraticD @ProCore 0x12a17, cubicD @ProCore 0x12c56)

import { quadraticD, cubicD } from "../infra/PCMath.js";

// ────────────────────────────────────────────────────────────────────────────────────────
// __Z12OZBezierEvalPKdd  @ProChannel 0xa549c   — cubic Bezier in Bernstein basis, Horner form.
// ────────────────────────────────────────────────────────────────────────────────────────
// Body (29 lines of x86-64, verbatim):
//   rdi = ctrl (double*), xmm0 = u
//   xmm1 = movupd (rdi)      = (c0, c1)                     @0xa54a0
//   xmm2 = movupd 0x10(rdi)  = (c2, c3)                     @0xa54a4
//   xmm3 = movapd 0xb6bf(rip) = (3.0, 3.0)                  @0xa54a9  const @ProChannel 0xb0b70
//   xmm3 = mulpd  xmm1, xmm3 = (3·c0, 3·c1)                 @0xa54b1
//   xmm4 = xmm3
//   xmm4 = unpckhpd xmm3, xmm4 => xmm4.lo = 3·c1            @0xa54b9
//   xmm5 = xmm4
//   xmm5 = subsd xmm1, xmm5   -> xmm5.lo = 3·c1 - c0        @0xa54c1
//   xmm6 = xmm1
//   xmm6 = shufpd $1, xmm2, xmm6 => (c1, c2)                @0xa54c9
//   xmm6 = mulpd 0xc66a(rip) = (6.0, 3.0), xmm6 => (6·c1, 3·c2)  @0xa54ce  const @ProChannel 0xb1b40
//   xmm4 = subsd xmm3, xmm4   -> xmm4.lo = 3·c1 - 3·c0      @0xa54d6   [xmm4.lo -= 3·c1 => = 3·c1 - 3·c0]
//   xmm3 = unpcklpd xmm5, xmm3 => (3·c0, 3·c1 - c0)         @0xa54da
//   xmm3 = subpd xmm6, xmm3   -> (3·c0 - 6·c1, 3·c1 - c0 - 3·c2)   @0xa54de
//   xmm6 = unpckhpd xmm2, xmm6 => (3·c2, c3)                @0xa54e2
//   xmm6 = addpd xmm3, xmm6   -> (3·c2 + 3·c0 - 6·c1, c3 + 3·c1 - c0 - 3·c2)   @0xa54e6
//   xmm2 = xmm6
//   xmm2 = unpckhpd xmm6, xmm2 => xmm2.lo = c3 - 3·c2 + 3·c1 - c0             @0xa54ee
//   xmm2.lo = mulsd u, xmm2 = u · A                         @0xa54f2
//   xmm2.lo = addsd xmm6.lo, xmm2 = 3·(c0 - 2·c1 + c2) + u·A                  @0xa54f6
//   xmm2.lo = mulsd u, xmm2 = u · Q1                        @0xa54fa
//   xmm2.lo = addsd xmm4.lo, xmm2 = 3·(c1 - c0) + u · Q1    @0xa54fe
//   xmm0 = mulsd xmm2, xmm0 = u · Q2                        @0xa5502
//   xmm0 = addsd xmm1.lo, xmm0 = c0 + u · Q2                @0xa5506   [xmm1.lo = c0]
// This is Horner form of the cubic Bernstein basis:
//   B(u) = c0 + u·[ 3(c1-c0) + u·( 3(c0 - 2c1 + c2) + u·(-c0 + 3c1 - 3c2 + c3) ) ]
// Constants: (3.0, 3.0) @0xb0b70; (6.0, 3.0) @0xb1b40. Verified against the (1-u)^3 c0 +
// 3(1-u)^2 u c1 + 3(1-u) u^2 c2 + u^3 c3 form.
export function OZBezierEval(ctrl: number[], u: number): number {
  // Match the packed-lane build of the three Horner coefficients exactly. The associativity
  // is fixed by the SIMD lanes (see the four subpd/addpd steps above) — do not "simplify"
  // 3·c0 - 6·c1 + 3·c2 to 3·(c0-2·c1+c2): the sequence 3·c0 - 6·c1 then +3·c2 differs
  // in the last ulp for some inputs and is what the parity fuzz compares against.
  const c0 = ctrl[0], c1 = ctrl[1], c2 = ctrl[2], c3 = ctrl[3];
  // xmm3.lo = 3·c0 ; xmm3.hi = 3·c1     (mulpd (3,3))
  const three_c0 = 3.0 * c0;
  const three_c1 = 3.0 * c1;
  // xmm6.lo = 6·c1 ; xmm6.hi = 3·c2     (mulpd (6,3) on (c1,c2))
  const six_c1 = 6.0 * c1;
  const three_c2 = 3.0 * c2;
  // xmm3 after subpd((6·c1,3·c2), (3·c0, 3·c1 - c0)):
  //   xmm3.lo = 3·c0 - 6·c1
  //   xmm3.hi = (3·c1 - c0) - 3·c2
  const lo_afterSub = three_c0 - six_c1;                     // 3·c0 - 6·c1
  const hi_afterSub = (three_c1 - c0) - three_c2;            // 3·c1 - c0 - 3·c2
  // xmm6 after unpckhpd(xmm2, xmm6): (3·c2, c3); then addpd xmm3:
  //   xmm6.lo = (3·c0 - 6·c1) + 3·c2                          = Q1_const (Horner: 3(c0-2c1+c2))
  //   xmm6.hi = (3·c1 - c0 - 3·c2) + c3                       = A        (u^3 coeff)
  const Q1_const = lo_afterSub + three_c2;                   // 3·c0 - 6·c1 + 3·c2
  const A_coef   = hi_afterSub + c3;                         // -c0 + 3·c1 - 3·c2 + c3
  // xmm4.lo = 3·c1 - 3·c0                                    = C_const  (u^1 coeff)
  const C_const  = three_c1 - three_c0;                      // 3·(c1 - c0)
  // scalar Horner: t = u·A ; t = Q1 + t ; t = u·t ; t = C + t ; result = c0 + u·t
  let t = u * A_coef;                                        // 0xa54f2
  t = Q1_const + t;                                          // 0xa54f6
  t = u * t;                                                 // 0xa54fa
  t = C_const + t;                                           // 0xa54fe
  return c0 + u * t;                                         // 0xa5502 / 0xa5506
}

// ────────────────────────────────────────────────────────────────────────────────────────
// __Z16OZBezierGetRootsPKddPd  @ProChannel 0xa5716
//   int OZBezierGetRoots(double const* ctrl, double t, double* roots_out);
// Builds the Bezier polynomial B(u) - t = A·u³ + B·u² + C·u + (D - t), where
//   A = -c0 + 3·c1 - 3·c2 + c3    (the u^3 coeff; SAME as A_coef above via a different assembly path)
//   B = 3·c0 - 6·c1 + 3·c2
//   C = 3·c1 - 3·c0
//   D = c0
// Threshold |A| >= 1e-7 (const @ProChannel 0xb03b0) picks the CUBIC branch (Cardano/trig via
// PCMath::cubic(a=B/A, b=C/A, c=(D-t)/A) @ProCore 0x12c56); otherwise the QUADRATIC branch
// (PCMath::quadratic(a=B, b=C, c=D-t, tol=0.0) @ProCore 0x12a17). Both callees write their
// roots (sorted ascending; per PCMath) into the caller's roots_out buffer and return the count.
//
// Constants used (verified via otool __TEXT __const):
//   0xb0b70  (3.0, 3.0)       ; movapd -> xmm1 (paired mul on (c1,c2))
//   0xb03b0  1e-7             ; movsd -> xmm7 (|A|<1e-7 gate to switch cubic->quadratic)
//   0xaf580  3.0              ; movsd -> xmm5 (scalar 3·c0 build for C_const)
//   0xb0d70  -6.0             ; mulsd (-6.0) with c1 for B_const
//   0xb0390  (0x7FFF..FF, 0x7FFF..FF) ; abs-mask via andpd for |A|
export function OZBezierGetRoots(ctrl: number[], t: number, rootsOut: number[]): number {
  const c0 = ctrl[0], c1 = ctrl[1], c2 = ctrl[2], c3 = ctrl[3];
  // xmm4 = (c1, c2)   (movupd 0x8(rdi))
  //   Note: the read is UNALIGNED and starts at ctrl+8 — ctrl[1], ctrl[2] respectively.
  // xmm1 = (3, 3) * xmm4 = (3·c1, 3·c2)
  const three_c1 = 3.0 * c1;
  const three_c2 = 3.0 * c2;
  // xmm3 = xmm1 (init)
  // xmm3 = subsd xmm2, xmm3  -> xmm3.lo = 3·c1 - c0                             @0xa5736
  //   (xmm2 = movsd(rdi) = c0)
  // xmm6 = xmm1 ; xmm6 = unpckhpd xmm1, xmm6 -> xmm6.lo = 3·c2                  @0xa573a-0xa573e
  // xmm3 = subsd xmm6, xmm3  -> xmm3.lo = 3·c1 - c0 - 3·c2                      @0xa5742
  // xmm3 = addsd 0x18(rdi), xmm3 -> xmm3.lo = -c0 + 3·c1 - 3·c2 + c3 = A        @0xa5746
  const A_coef = ((three_c1 - c0) - three_c2) + c3;
  // xmm5 = movapd (7FFF..FF, 7FFF..FF); xmm5 = andpd xmm3 => |A|                @0xa574b-0xa5753
  const absA = Math.abs(A_coef);
  // xmm7 = movsd 1e-7                                                           @0xa5757
  const EPS_CUBIC = 1e-7;      // @ProChannel 0xb03b0 (0x3E7AD7F29ABCAF48)
  // xmm5 = movsd 3.0                                                             @0xa5763
  // xmm5 = mulsd xmm2(=c0), xmm5 -> xmm5.lo = 3·c0                              @0xa5767
  const three_c0 = 3.0 * c0;
  // xmm4.lo = mulsd 0xb0d70(=-6.0), xmm4  -> xmm4.lo = -6·c1                    @0xa576f
  // xmm4 = addsd xmm5, xmm4  -> xmm4.lo = -6·c1 + 3·c0                          @0xa5777
  // xmm4 = addsd xmm6, xmm4  -> xmm4.lo = -6·c1 + 3·c0 + 3·c2  = B (u^2)         @0xa577b
  //   (xmm6.lo was 3·c2 from the earlier unpckhpd)
  const B_coef = (-6.0 * c1 + three_c0) + three_c2;   // = 3·c0 - 6·c1 + 3·c2
  // 0xa577f jbe 0xa579e  :  ucomisd xmm5, xmm7 sets flags per xmm7 - xmm5.
  //   xmm5 == |A|. jbe = CF|ZF = xmm7 <= |A| = |A| >= 1e-7  =>  CUBIC branch.
  //   NOTE the flags come from the ucomisd at 0xa575f (BEFORE xmm5 gets clobbered with 3·c0).
  //   So the branch predicate is correct: |A_orig| >= 1e-7.
  if (absA >= EPS_CUBIC) {
    // CUBIC branch (fallthrough @0xa579e onward):
    //   xmm4.lo /= xmm3.lo   -> B / A
    //   xmm1.lo -= xmm5.lo   -> (3·c1) - (3·c0) = C = 3(c1-c0)
    //   xmm1.lo /= xmm3.lo   -> C / A
    //   xmm2.lo -= xmm0.lo   -> c0 - t = D - t
    //   xmm2.lo /= xmm3.lo   -> (D - t) / A
    //   jmp PCMath::cubic(a = B/A, b = C/A, c = (D - t)/A, &x1, &x2, &x3)
    const a = B_coef / A_coef;
    const b = (three_c1 - three_c0) / A_coef;
    const cCoeff = (c0 - t) / A_coef;
    const r = cubicD(a, b, cCoeff);                          // PCMath::cubic @ProCore 0x12c56
    rootsOut[0] = r.x1; rootsOut[1] = r.x2; rootsOut[2] = r.x3;
    return r.count;                                          // 1 or 3
  }
  // QUADRATIC branch (@0xa5781):
  //   xmm1.lo -= xmm5.lo   -> (3·c1) - (3·c0) = C   [xmm1.lo held 3·c1 from before the branch]
  //   xmm2.lo -= xmm0.lo   -> c0 - t = D - t
  //   xorpd xmm3, xmm3     -> tol = 0.0
  //   xmm0 = xmm4          -> a = B
  //   jmp PCMath::quadratic(a = B, b = C, c = D - t, &x1, &x2, tol = 0.0)
  const q = quadraticD(B_coef, three_c1 - three_c0, c0 - t, 0.0);  // PCMath::quadratic @ProCore 0x12a17
  rootsOut[0] = q.x1; rootsOut[1] = q.x2; rootsOut[2] = 0;
  return q.count;                                            // 0, 1 or 2
}

// ────────────────────────────────────────────────────────────────────────────────────────
// __Z21OZBezierFindParameterPKdd  @ProChannel 0xa57c7
//   double OZBezierFindParameter(double const* tctrl, double t);
// Solve B_time(u) = t for u ∈ [0,1] where B_time is the cubic Bezier with control points tctrl.
// Delegates to OZBezierGetRoots for the algebra; then picks the root closest to [0,1] (measured
// by "distance outside [0,1]" — 0 if inside), and clamps: <0 -> 0 ; >1 -> 1.
//
// Constants (all resolved via otool __TEXT __const):
//   0xaf528  1.0     (upper clamp; also 1.0 threshold for distance calc)
//   0xb03c8  -1.0    (added to values > 1.0 to compute the "above 1" distance)
//
// Distance-to-[0,1] shape (repeated per root; from the 3 identical mini-blocks at
// 0xa5818 / 0xa585c / 0xa58c1 / 0xa58f2 / 0xa5902 in the count==2/3 branches):
//     if root < 0     -> d = -root
//     elif root > 1   -> d = root - 1
//     else             -> d = 0
export function OZBezierFindParameter(tctrl: number[], t: number): number {
  // callq OZBezierGetRoots(tctrl, t, &roots)     @0xa57e1
  const roots: number[] = [0, 0, 0];
  const count = OZBezierGetRoots(tctrl, t, roots);
  // cmpl $3 -> je 0xa5828;  cmpl $2 -> je 0xa580e;  cmpl $1 -> jne 0xa59ba (cold)
  if (count === 3) {
    // ── count == 3 : two-stage min-distance tournament between the 3 sorted roots ──
    const r0 = roots[0], r1 = roots[1], r2 = roots[2];
    const d0 = distTo01(r0);                                 // 0xa5836..0xa58bd
    const d1 = distTo01(r1);                                 // 0xa58c1..0xa58e3
    // Stage 1: compare d0 vs d1 (ucomisd xmm0=d0, xmm1=d1 -> jbe 0xa58fe when d1<=d0)
    let stage1: number;                                       // the closer of r0, r1
    let stage1_d: number;
    if (d1 <= d0) {
      // "case A": r1 wins over r0; then compute d2 into xmm0 (in original asm), compare d1 vs d2
      stage1 = r1; stage1_d = d1;
    } else {
      stage1 = r0; stage1_d = d0;
    }
    const d2 = distTo01(r2);                                 // 0xa58fe..0xa5924 or 0xa58fe..0xa5920 mirror
    // Stage 2: pick between stage1 and r2. The asm's cmpltsd + blendvpd + cmoval computes:
    //   chosen = (stage1_d < d2) ? stage1 : r2
    //   negFlag = (chosen < 0)
    // (Then the final block at 0xa598b clamps chosen: negFlag -> return 0 else min(chosen, 1.0).)
    const chosen = stage1_d < d2 ? stage1 : r2;
    return clampToUnit(chosen);
  } else if (count === 2) {
    // ── count == 2 : same tournament shape on the 2 roots ──
    const r0 = roots[0], r1 = roots[1];
    const d0 = distTo01(r0);
    const d1 = distTo01(r1);
    // cmpltsd xmm3, xmm0 -> mask = (d0 < d1) ; blendvpd picks r0 : r1
    const chosen = d0 < d1 ? r0 : r1;
    return clampToUnit(chosen);
  } else if (count === 1) {
    // ── count == 1 : direct clamp of the single root ──
    // Asm: xorpd xmm0; ucomisd root, 0; seta al ; testb al; jne -> return 0; else min(root,1.0)
    return clampToUnit(roots[0]);
  } else {
    // ── count == 0 : callq __Z21OZBezierFindParameterPKdd.cold.1 (compiler-emitted trap for the
    //    'no root' case — a well-formed monotonic time-Bezier cannot produce this). Faithful port:
    throw new Error(
      "OZBezierFindParameter: OZBezierGetRoots returned 0 roots — cold path @ProChannel 0xa59ba " +
        "(compiler-emitted __builtin_unreachable-ish trap in the FCP binary). The caller must " +
        "supply a control polygon whose cubic Bezier attains value t at some u.",
    );
  }
}

/** distanceOutside01(root): 0 if in [0,1], -root if <0, root-1 if >1.
 *  From the three identical asm blocks (xorpd/ucomisd/jbe/subsd|-1.0+add) in FindParameter. */
function distTo01(root: number): number {
  if (root < 0) return -root;                                // subsd xmm1|xmm2|xmm3, xmm0
  if (root > 1.0) return root - 1.0;                         // movsd -1.0, xmm0 ; addsd root, xmm0
  return 0;                                                  // xmm0 remained 0 from xorpd
}

/** clampToUnit(chosen): return 0 if chosen<0 else min(chosen, 1.0).
 *  From the tail block @0xa598b..0xa599f (xorpd/testb/jne-return0 / movsd 1.0 / minsd). */
function clampToUnit(chosen: number): number {
  // testb al, al comes from the last `seta` (root < 0). If AL != 0 -> jne -> return 0.
  if (chosen < 0) return 0;                                  // @0xa5991 jne 0xa599f -> xmm0 = 0
  return Math.min(chosen, 1.0);                              // @0xa5993/9b: movsd 1.0 ; minsd chosen
}

// ────────────────────────────────────────────────────────────────────────────────────────
// The 13 class methods below all require infrastructure that is decoded but NOT yet transcribed
// (getVertexValue @0x303a6, getVertexInputHandles @0x3c522, getVertexOutputHandles @0x3c5da,
// OZBezierSanitizeControlPolygon @0xa550c, and the interpolate combine at 0x40a10+). Per
// PORTING_SPEC Rule 3 they throw citing the addresses they defer.
// ────────────────────────────────────────────────────────────────────────────────────────

/**
 * OZBezierInterpolator::OZBezierInterpolator()   @ProChannel 0x4040e (C1) / 0x4043c (C2).
 * Empty ctor per the disasm (both C1 and C2 are 16-line shims that install the vtable and
 * chain to OZInterpolator's ctor). No user-visible state on this class.
 */
export class OZBezierInterpolator {
  constructor() { /* @0x4040e: vtable install, no fields */ }

  /**
   * OZBezierInterpolator::interpolate(OZSpline&, CMTime, void*, void*, CMTime, bool, bool)
   *   @ProChannel 0x407e6  — 204-line function; see re/BEZIER_DECODE.md.
   * Requires: getControlPoints @0x4054a, OZSpline::getVertexValue @0x303a6 (via *0xf0 vtable),
   *           OZBezierSanitizeControlPolygon @0xa550c, and the affine combine at 0x40a10+.
   */
  interpolate(): number {
    throw new Error(
      "OZBezierInterpolator::interpolate @ProChannel 0x407e6 not yet transcribed — " +
        "requires OZBezierInterpolator::getControlPoints @0x4054a + OZSpline::getVertexValue " +
        "@0x303a6 + OZBezierSanitizeControlPolygon @0xa550c + the CMTime/value combine at 0x40a10+.",
    );
  }

  /** OZBezierInterpolator::eval(double* ctrl, double u)   @ProChannel 0x40b58 —
   *  a 14-line shim that TAIL-CALLS the free OZBezierEval @0xa549c. */
  evalCtrl(ctrl: number[], u: number): number {
    // Body at 0x40b58 is: jmp __Z12OZBezierEvalPKdd
    return OZBezierEval(ctrl, u);
  }

  /**
   * OZBezierInterpolator::eval(OZSpline&, CMTime, void*, void*, double)   @ProChannel 0x40b66.
   * Requires: getControlPoints @0x4054a + the tail CMTime-to-u remap. Not yet decoded.
   */
  evalSpline(): number {
    throw new Error(
      "OZBezierInterpolator::eval(OZSpline&,CMTime,...) @ProChannel 0x40b66 not yet transcribed — " +
        "requires OZBezierInterpolator::getControlPoints @0x4054a and its CMTime->u remap.",
    );
  }

  /** OZBezierInterpolator::computeTangents(...)  @ProChannel 0x40499a. */
  computeTangents(): void {
    throw new Error(
      "OZBezierInterpolator::computeTangents @ProChannel 0x4049a not yet transcribed — " +
        "requires OZSpline::getVertexInputHandles @0x3c522 + getVertexOutputHandles @0x3c5da.",
    );
  }

  /** OZBezierInterpolator::getControlPoints(...)  @ProChannel 0x4054a — see re/BEZIER_DECODE.md ADDENDUM. */
  getControlPoints(): void {
    throw new Error(
      "OZBezierInterpolator::getControlPoints @ProChannel 0x4054a not yet transcribed — " +
        "requires OZSpline::getVertexInputHandles @0x3c522, getVertexOutputHandles @0x3c5da, " +
        "OZBezierSanitizeControlPolygon @0xa550c, and the affine-combine at 0x4074a-0x407ab.",
    );
  }

  /** OZBezierInterpolator::subDivide(...)  @ProChannel 0x40cb6. */
  subDivide(): void {
    throw new Error(
      "OZBezierInterpolator::subDivide @ProChannel 0x40cb6 not yet transcribed.",
    );
  }

  /** OZBezierInterpolator::getMinMaxValues(...)  @ProChannel 0x411a0. */
  getMinMaxValues(): void {
    throw new Error(
      "OZBezierInterpolator::getMinMaxValues @ProChannel 0x411a0 not yet transcribed.",
    );
  }

  /** OZBezierInterpolator::uForCurveValue(...)  @ProChannel 0x415f8. */
  uForCurveValue(): void {
    throw new Error(
      "OZBezierInterpolator::uForCurveValue @ProChannel 0x415f8 not yet transcribed — " +
        "requires the vector<CMTime> output-collection path.",
    );
  }
}

/** Module-level singleton — matches FCP's OZInterpolators registry (ctor @0x44a24 stores the
 *  Bezier interpolator at offset 0x18 of the singleton table @ProChannel 0xd4???).  */
export const OZ_BEZIER_INTERPOLATOR = new OZBezierInterpolator();
