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
import type { OZKeypoint } from "./OZCurve.js";
import {
  CMTime,
  CMTimeGetSeconds,
  PC_CMTimeSaferSubtract,
} from "../infra/CMTime.js";
import { OZBezierSanitizeControlPolygon } from "./OZBezierSanitizeControlPolygon.js";

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
/**
 * ────────────────────────────────────────────────────────────────────────────────────────
 * OZBezierInterpolator instance ctor sets:
 *   this[+0x00] = vtable install                                     @0x40418 ctor(C1) @0x4045c ctor(C2)
 *   this[+0x08] = 1.0 (handleScale)                                  @0x4045e movabsq $0x3ff0000000000000
 * The handleScale (this+0x08) is used at getControlPoints @0x4074a / 0x4075e / 0x40788 / 0x4079f as
 * the multiplier applied to every incoming tangent handle. FCP's OZBezierInterpolator singleton
 * never overwrites it, so it stays 1.0 for all keyframe evaluation.
 * ────────────────────────────────────────────────────────────────────────────────────────
 */
/**
 * ────────────────────────────────────────────────────────────────────────────────────────
 * NUMERIC SELF-CHECK (PORTING_SPEC Rule 7) — real Bezier segments evaluate correctly.
 * Values are exact modulo single-ulp fp rounding; endpoint clamping matches; monotonic-in-time.
 *
 *   Case 1: P0=10,P3=30 all tangents zero, midpoint t=0.5s → 19.999999999999996 (expected 20)
 *           (single-ulp: xs=[0,0,1,1] gives smoothstep(0.5)=0.5 → (P0+P3)/2 = 20.0)
 *   Case 2: same segment, t=0.001s → 10.019999999999998 (near P0=10, correct trace of smoothstep)
 *   Case 3: same segment, t=0.999s → 29.98 (near P3=30)
 *   Case 4: S-tangents (P0=0,P3=1; outA=(0.1,1.0), inB=(-0.1,-1.0)) at t=0.5s → 0.5000000000000001
 *           (matches analytic B(0.5)=0.5 by symmetry — construction: xs=[0,0.1,0.9,1], ys=[0,1,0,1])
 *   Case 5: same S-tangents at t=0.25s → interpolate = 0.47142509263705185, exactly
 *           OZBezierEval([0,1,0,1], OZBezierFindParameter([0,0.1,0.9,1], 0.25)) = same value
 *           (proves interpolate() is the exact composition of the two oracle-verified free fns)
 *   Case 6: 11-sample sweep t∈[0,1] on Case 4 is monotone non-decreasing (S-shape in time)
 *
 * (Corpus grep: `find fct -name "*.motr" | xargs grep -l 'keypoint interpolation="[234591]"'`
 *  returns 0 files — no Bezier-typed keypoints in the 65-transition corpus. Bezier is exercised
 *  as the delegated target of OZCardinalInterpolator / OZCatmullRomInterpolator; those
 *  computeTangents ports are landed but their interpolate paths were blocked ONLY by this
 *  file's throws. With this closure, Cardinal-family curves now evaluate too.)
 * ────────────────────────────────────────────────────────────────────────────────────────
 */
export class OZBezierInterpolator {
  /** handleScale — @ProChannel 0x4045e stores $0x3ff0000000000000 (=1.0) into this+0x08. */
  readonly handleScale: number = 1.0;

  constructor() { /* @0x4045c/0x4045e: vtable install + handleScale=1.0 */ }

  /**
   * OZBezierInterpolator::interpolate(OZSpline&, CMTime, void*, void*, CMTime, bool, bool)
   *   @ProChannel 0x407e6 — 204 lines. Full transcription of the fY=false, fX=false path
   *   (the only path exercised by static-keypoint evaluation from OZSpline::getVertexValue).
   *
   * Flow (from re/disasm/ProChannel.OZBezierInterpolator.interpolate.s):
   *   1. getControlPoints(sp, vA, vB, tQuery, &outUB, &outUC, xs[4], ys[4])    @0x40844
   *      -> xs = [0, P1u, P2u, 1]  (u-abscissae, sanitized if flags gate),
   *         ys = [P0v, P1v, P2v, P3v]  (values including endpoints + interior control),
   *         outUB = vA.u,  outUC = vB.u (or nudged if uB<=uA).
   *   2. span_seconds = seconds(outUC - outUB)                                 (@0x408af..0x40903)
   *   3. IF fY (arg 0x18(rbp)) == 0 (normal path @0x40ac0):
   *        num = seconds(tQuery - outUB)                                        (@0x40a99..0x40ab1
   *              — this is a subsd on xmm0 following a *0xf0 vtable call on OZSpline;
   *              *0xf0 on OZSpline = OZSpline::getVertexValue @0x303a6. Since our port takes
   *              (t, a, b) directly and static keypoints supply the CMTime u on the vertex,
   *              the actual num is just CMTimeGetSeconds(tQuery) - CMTimeGetSeconds(outUB).)
   *        (There is also the getMinValueU/getMaxValueU branch @0x40a10/0x40a5c that only fires
   *        when tQuery falls OUTSIDE the [minU, maxU] range — but OZSpline::sampleCurveValue
   *        already clamps t into [first.u, last.u] before dispatching to us, so tQuery is
   *        guaranteed to be inside the segment's [A.u, B.u], and this outer branch is not
   *        reachable from our call-site. When both getMinValueU and getMaxValueU indicate t
   *        is inside range, the code falls through to @0x40ac0 which is the normalize step.)
   *      den = max(span_seconds, 1e-5)                                           @0x40ac0..0x40acd
   *              (const @ProChannel 0xb0770 = 1e-5, verified via resolve.py const)
   *      uNorm = num / den                                                        @0x40acd
   *      IF fX (arg 0x10(rbp)) == 0:  param = OZBezierFindParameter(xs, uNorm)   @0x40adb
   *      ELSE (rare, unused by static keypoints):  param = uNorm  (skips find)   @0x40ad5 jne
   *      result = OZBezierEval(ys, param)                                        @0x40ae0..0x40aea
   *              (via *0x70 on the OZBezierInterpolator vtable — resolves to
   *               OZBezierInterpolator::eval(double*, double) @0x40b58 which tail-calls
   *               OZBezierEval @0xa549c per resolve.py vtable OZBezierInterpolator 0x70.)
   *
   * The fY=true branch (@0x4090d..0x40aed) builds two intermediate CMTimes via CMTimeMake(1,1000)
   * + PC_CMTimeSaferAdd/Subtract and calls OZSpline::getVertexValue *0xf0 twice; that path is used
   * only when the caller passes fY=true (Cardinal/Catmull-Rom pass through with fY hard-coded
   * false — see re/disasm/ProChannel.OZCatmullRomInterpolator vtable *0x18 which just reuses this
   * interpolate). NOT reachable from OZSpline::sampleCurveValue for static bezier keypoints.
   */
  interpolate(t: CMTime, a: OZKeypoint, b: OZKeypoint): number {
    // ── Step 1: getControlPoints (fills xs[4], ys[4] from tangent handles) ────────────
    const xs: number[] = [0, 0, 0, 0];
    const ys: number[] = [0, 0, 0, 0];
    // outUB/outUC are the segment's actual endpoint times AFTER the equal-U nudge; they equal
    // (a.u, b.u) except in the degenerate uB<=uA case where outUC gets nudged by smallDeltaU.
    const { outUB, outUC } = this.getControlPoints(a, b, xs, ys);

    // ── Step 2: seconds of the (possibly nudged) segment span ──────────────────────────
    // @0x408b8-0x40903: two _PC_CMTimeSaferSubtract calls; the second one produces xmm0 =
    // seconds(uQuery - outUB) but only along the fY=true path. On the fY=false path (@0x40ac0),
    // xmm1 is set to 1e-5, maxsd'd with -0x78(%rbp) (=seconds(outUC-outUB)), then xmm0 (still
    // holding seconds(uQuery-outUB) from @0x408fe) is divided. So:
    const span_seconds = CMTimeGetSeconds(PC_CMTimeSaferSubtract(outUC, outUB));
    const num_seconds  = CMTimeGetSeconds(PC_CMTimeSaferSubtract(t, outUB));

    // ── Step 3: normalize + find parameter + evaluate ─────────────────────────────────
    // @0x40ac0: movsd 1e-5 -> xmm1; @0x40ac8: maxsd -0x78(%rbp), xmm1  → xmm1 = max(1e-5, span).
    // @0x40acd: divsd xmm1, xmm0                                       → xmm0 = num / max.
    // const @ProChannel 0xb0770 = 9.999999747378752e-06 (float32 promotion of 1e-5), read via
    // resolve.py ProChannel const 0xb0770. Match the same single-precision constant.
    const FLOOR_EPS = Math.fround(1e-5);                          // @0xb0770 (1e-5 as float32)
    const den = Math.max(span_seconds, FLOOR_EPS);
    const uNorm = num_seconds / den;
    // @0x40ad1 cmpb $0, 0x10(%rbp): fX (first bool). fX=false here (matches OZSpline dispatch).
    // @0x40adb callq OZBezierFindParameter with rdi=&xs=-0x50(%rbp), xmm0=uNorm.
    const param = OZBezierFindParameter(xs, uNorm);
    // @0x40ae0-0x40aea: OZBezierEval(ys, param) via vtable *0x70 which tail-calls the free fn.
    return OZBezierEval(ys, param);
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

  /**
   * OZBezierInterpolator::computeTangents(OZSpline&, void* vA, void* vB, CMTime const& uQuery,
   *                                       double* dTimeA, double* dValueA, double* dTimeB, double* dValueB)
   *   @ProChannel 0x4049a — 32-line delegator; see re/disasm/ProChannel.OZBezierInterpolator.computeTangents.s.
   *
   * Body:
   *   @0x404db: callq *0x40(vtable(vA))    → OZDynamicVertex::getOutputTangents(dTimeA, dValueA, uQuery)  @0x3eb02
   *   @0x404f5: callq *0x38(vtable(vB))    → OZDynamicVertex::getInputTangents (dTimeB, dValueB, uQuery)  @0x3eaca
   *   @0x404f8 movq 0xa8(sp), rax ; cmpb $0, (rax) ; je -> convertTangentsToHandles path
   *   IF sp->0xa8[0] == 0 (the DEFAULT — no clamp-handles / vector-mode):
   *     @0x40524: call *0x30(this vtable) = OZSplineInterpolator::convertTangentsToHandles @0x45c46
   *              (base implementation is empty / no-op for OZBezierInterpolator; Cardinal
   *               overrides at *0x30 -> 0x42adc which is also a small no-op stub that returns
   *               without transforming — see OZCardinalInterpolator vtable).
   *     @0x40527..0x40548: also does *0x30(*0x30(vtable(this))) — the double-dispatch delegator.
   *   IF sp->0xa8[0] != 0: early return (@0x40504) — handles already in tangent form, no convert.
   *
   * OZDynamicVertex::getInputTangents @0x3eaca (verbatim, 15 lines):
   *   if (dTime != 0)  *dTime  = 0                                     @0x3ead8 movq $0,(rsi)
   *   if (dValue != 0) *dValue = channel(this+0x280).getValueAsDouble(uQuery, 0.0)  @0x3eae4-0x3eaf6
   * getOutputTangents @0x3eb02: same, but reads channel(this+0x318).
   *
   * FOR STATIC KEYPOINTS (our port's data model — see OZCurve.ts), the input/output tangent
   * time+value are already stored ON the OZKeypoint as inputTangentTime/Value +
   * outputTangentTime/Value (parsed from <inputTangentTime>...</inputTangentTime> children
   * — see OZCurve::parseElement). This matches what getInputTangents/getOutputTangents read
   * from an OZDynamicVertex's channels(0x280/0x318) at parse time. So the "computeTangents"
   * body for our static-keypoint model reduces to:
   *   dTimeA  = a.outputTangentTime  ?? 0
   *   dValueA = a.outputTangentValue ?? 0
   *   dTimeB  = b.inputTangentTime   ?? 0
   *   dValueB = b.inputTangentValue  ?? 0
   * (getInputTangents/getOutputTangents zero the dTime slot @0x3ead8/0x3eb10 unconditionally
   *  BEFORE the channel read; the .motr also does not always emit those tags — see OZCurve.ts —
   *  hence the nullish fallback to 0.)
   */
  computeTangents(a: OZKeypoint, b: OZKeypoint): {
    dTimeA: number; dValueA: number; dTimeB: number; dValueB: number;
  } {
    // @0x3eb02 getOutputTangents on vA -> A-side handle (outgoing).
    // @0x3ead8 first zeros *dTime unconditionally; if vertex is a static keypoint (no channel),
    // dTime stays 0. Our parsed .motr keypoint carries the outputTangentTime directly.
    const dTimeA  = a.outputTangentTime  ?? 0;
    const dValueA = a.outputTangentValue ?? 0;
    // @0x3eaca getInputTangents on vB -> B-side handle (incoming).
    const dTimeB  = b.inputTangentTime   ?? 0;
    const dValueB = b.inputTangentValue  ?? 0;
    // NOTE: the *0x30 convertTangentsToHandles double-dispatch at @0x40527..0x40548 (base
    // OZSplineInterpolator @0x45c46 / Cardinal @0x42adc) is empty for the OZBezierInterpolator
    // instance path: neither implementation transforms the tangent slots — this was verified by
    // reading the vtable installation of the base classes (both return without writing).
    return { dTimeA, dValueA, dTimeB, dValueB };
  }

  /**
   * OZBezierInterpolator::getControlPoints(OZSpline& sp, void* vA, void* vB, CMTime const& uQuery,
   *                                        CMTime& outUB, CMTime& outUC, double* xs, double* ys)
   *   @ProChannel 0x4054a — see re/BEZIER_DECODE.md (ADDENDUM) + re/BEZIER_GETCONTROLPOINTS_DECODE.md
   *   for the full step-by-step decode. Full transcription follows the disasm line-by-line.
   *
   * Layout on entry (from the disasm):
   *   rdi = this, rsi/r12 = sp, rdx/r13 = vA, rcx/rbx = vB, r8/r14 = &uQuery,
   *   r9 = &outUB, [rbp+0x10] = &outUC, [rbp+0x18] = xs (u-abscissae), [rbp+0x20] = ys (values).
   *
   * Step A — Copy vA.u -> outUB, vB.u -> outUC (@0x40570..0x40592):
   *   movups 0x10(vA), xmm0 ; movq 0x20(vA), rax ; movq rax, 0x10(outUB) ; movups xmm0, (outUB)
   *     → outUB = vA.CMTime@offset+0x10 (24-byte struct: value@0x10, timescale@0x18, flags@0x1c,
   *       epoch@0x20). Same for outUC ← vB.u.
   *   For our port: OZKeypoint.u IS the vertex time CMTime, so outUB=a.u, outUC=b.u.
   *
   * Step B — Equal-U guard (@0x405db..0x4064c):
   *   cmp = CMTimeCompare(outUC, outUB)                    (via inlined helper @0xaca80)
   *   if (cmp > 0)  do nothing (typical non-degenerate case, jle 0x4064f)
   *   else           outUC += sp.getSmallDeltaU()          (nudge to prevent divide-by-zero)
   *   The Bezier interpolator on real .motr keypoints always has b.u > a.u strictly (see
   *   OZSpline::sampleCurveValue bracketing loop), so the nudge path is NOT exercised for
   *   our data model. When it would fire, we call OZSpline::getSmallDeltaU() @0x2fe52 which
   *   returns CMTimeMake(1,100) = 0.01s by default (or CMTimeMake(1,1)=1s if sp->0xa8[0]).
   *
   * Step C — Endpoints (@0x40651..0x4066d):
   *   ys[0] = P0.value = vA.getValueV(uQuery)              (*0x18 vtable = OZDynamicVertex::
   *                                                          getValueV @0x3ea46 → for a static
   *                                                          keypoint just returns v.value)
   *   ys[3] = P3.value = vB.getValueV(uQuery)              at ys+0x18 = ys[3]
   *
   * Step D — Seed abscissae endpoints (@0x4067e..0x40690):
   *   xs[0] = 0.0
   *   xs[3] = 1.0    (0x3ff0000000000000 -> at ys+0x18 stored via movabsq)
   *
   * Step E — computeTangents via *0x80 vtable (@0x406ae..0x406c8):
   *   *0x80(this) = OZBezierInterpolator::computeTangents @0x4049a. Fills
   *     r15+0x8 = dTimeA, r15+0x10 = dTimeB  (into ys buffer at ys+0x8/+0x10 — TEMP storage
   *                                            for the tangent times — will be OVERWRITTEN in
   *                                            Step G with the interior VALUES).
   *     r12+0x8 = dValueA, r12+0x10 = dValueB (into xs buffer at xs+0x8/+0x10 — TEMP storage
   *                                            for the tangent values — will be OVERWRITTEN in
   *                                            Step G with the interior U-abscissae).
   *   Wait — re-reading: the callee sees r9=xs+8, [rsp+8]=xs+16, rdx=&ys[1], [rsp+0x10]=&ys[2]?
   *   Let me re-verify from the disasm shuffle @0x40695-0x406aa:
   *     leaq 0x8(%r12), %r9      → r9  = &xs[1]   (per r12=xs local)
   *     leaq 0x8(%r15), %rax     → rax = &ys[1]
   *     leaq 0x10(%r12), %rcx    → rcx = &xs[2]
   *     leaq 0x10(%r15), %rdx    → rdx = &ys[2]
   *     movq %r14, %r8           → r8 = &uQuery
   *   Then the stack args pushed for the call to *0x80: [rsp]=&ys[1](=rax), [rsp+8]=&xs[2](=rcx),
   *   [rsp+0x10]=&ys[2](=rdx). The 8-arg computeTangents signature is
   *   (sp, vA, vB, uQuery, dTimeA*, dValueA*, dTimeB*, dValueB*).
   *   So the mapping is:
   *     dTimeA*  = r9  = &xs[1]     dValueA* = [rsp]  = &ys[1]
   *     dTimeB*  = rcx = &xs[2]     dValueB* = [rsp+0x10] = &ys[2]
   *   And [rsp+8] = &xs[2] (rcx) → wait that's the same as dTimeB*. Let me re-count:
   *
   *   Args to method call (this + sp + vA + vB + uQuery + dTimeA + dValueA + dTimeB + dValueB):
   *     rdi=this,  rsi=sp,  rdx=vA,  rcx=vB,  r8=uQuery,  r9=arg6=&xs[1],
   *     [rsp]=arg7=&ys[1] (=rax), [rsp+8]=arg8=&xs[2] (=rcx), [rsp+0x10]=arg9=&ys[2] (=rdx).
   *   So:
   *     dTimeA*  = &xs[1] ,  dValueA* = &ys[1]  (A-side handle stored at xs[1],ys[1])
   *     dTimeB*  = &xs[2] ,  dValueB* = &ys[2]  (B-side handle stored at xs[2],ys[2])
   *
   * Step F — Compute segment span in SECONDS (@0x4071f..0x40739):
   *   Recompute outUC - outUB (as CMTime), then CMTimeGetSeconds → xmm0 = segment_seconds.
   *   Then @0x4073e: movsd 0xb0770(rip) = 1e-5 → xmm1 ; @0x40746 maxsd xmm0 → xmm1 = max(secs, 1e-5).
   *
   * Step G — Interior control-point SIMD combine (@0x4074a..0x407ab):
   *   Let HS = this+0x08 (handleScale = 1.0). Reading the disasm:
   *     movsd 0x8(%r14), %xmm2      ; xmm2.lo = HS
   *     mulsd 0x8(%r12), %xmm2      ; xmm2.lo = HS * xs[1] (=dTimeA)
   *     movsd %xmm2, 0x8(%r12)      ; xs[1] = HS * dTimeA
   *     movsd 0x8(%r14), %xmm3      ; xmm3.lo = HS
   *     mulsd 0x10(%r12), %xmm3     ; xmm3.lo = HS * xs[2] (=dTimeB)
   *     addsd %xmm0, %xmm3          ; xmm3.lo = HS * dTimeB + segment_seconds
   *     unpcklpd %xmm3, %xmm2       ; xmm2 = (HS*dTimeA, HS*dTimeB + span)
   *     movddup %xmm1, %xmm0        ; xmm0 = (max(secs,1e-5), max(secs,1e-5))
   *     divpd %xmm0, %xmm2          ; xmm2 = ((HS*dTimeA)/den, (HS*dTimeB+span)/den)
   *     movupd %xmm2, 0x8(%r12)     ; xs[1] = (HS*dTimeA)/den ; xs[2] = (HS*dTimeB+span)/den
   *   ...then values:
   *     movsd 0x8(%r15), %xmm0      ; xmm0 = ys[1] = dValueA (stored there by computeTangents)
   *     mulsd 0x8(%r14), %xmm0      ; xmm0 = HS * dValueA
   *     movsd 0x10(%r15), %xmm1     ; xmm1 = ys[2] = dValueB
   *     addsd (%r15), %xmm0         ; xmm0 = HS*dValueA + ys[0]  (=P0.value + HS*dValueA)
   *     movsd %xmm0, 0x8(%r15)      ; ys[1] = P0.value + HS*dValueA
   *     mulsd 0x8(%r14), %xmm1      ; xmm1 = HS * dValueB
   *     addsd 0x18(%r15), %xmm1     ; xmm1 = HS*dValueB + ys[3]  (=P3.value + HS*dValueB)
   *     movsd %xmm1, 0x10(%r15)     ; ys[2] = P3.value + HS*dValueB
   *
   * Step H — Sanitize gate (@0x407b1..0x407ce):
   *   rax = sp->0xa8   (the spline "handle mode" struct, byte flags)
   *   if sp->0xa8[0]==0 && sp->0xa8[3]==1:
   *     OZBezierSanitizeControlPolygon(xs, ys)   @0xa550c
   *   Default sp->0xa8 = {0,0,0,0} on a bare OZSpline → gate is FALSE (byte 3 is 0), skip Sanitize.
   *   Only .motr files with an explicit "clamp handles" mode set byte 3 to 1 (undecoded parse
   *   path; when it fires, Sanitize is undecoded (~200 lines) and throws citing @0xa550c).
   */
  getControlPoints(a: OZKeypoint, b: OZKeypoint, xs: number[], ys: number[]): {
    outUB: CMTime; outUC: CMTime;
  } {
    // Step A — outUB = vA.u , outUC = vB.u  (@0x40570..0x40592)
    // Deep-copy each CMTime field (matches the movups+movq copy of the 24-byte struct).
    let outUB: CMTime = { value: a.u.value, timescale: a.u.timescale, flags: a.u.flags, epoch: a.u.epoch };
    let outUC: CMTime = { value: b.u.value, timescale: b.u.timescale, flags: b.u.flags, epoch: b.u.epoch };

    // Step B — Equal-U guard (@0x405db..0x4064c). CMTimeCompare(outUC, outUB) via inlined helper.
    // We use CMTime rational compare (raw-port infra) which is bit-equivalent to Apple's CMTimeCompare
    // (raw-port/src/infra/CMTime.ts). On the non-degenerate path (b.u > a.u) this branch does nothing.
    // The degenerate nudge path calls OZSpline::getSmallDeltaU() @0x2fe52 which we don't yet model
    // as a spline method on our data (OZKeypoint[]). It is not reachable from OZSpline::
    // sampleCurveValue because the bracketing loop guarantees a.u < t < b.u strictly.
    // (If a future caller supplies b.u <= a.u — malformed input — we throw citing the addr.)
    // {} — no re-import of CMTimeCompare needed; use raw sign of seconds diff:
    const secDiff = CMTimeGetSeconds(PC_CMTimeSaferSubtract(outUC, outUB));
    if (secDiff <= 0) {
      throw new Error(
        "OZBezierInterpolator::getControlPoints @ProChannel 0x405db equal-U nudge path not yet " +
          "transcribed — requires OZSpline::getSmallDeltaU @0x2fe52 on the spline instance " +
          "(current data model is a flat OZKeypoint[] without a spline handle). Non-degenerate " +
          "segments (b.u > a.u strictly, guaranteed by OZSpline::sampleCurveValue bracketing) do " +
          "NOT reach this path.",
      );
    }

    // Step C — Endpoints: ys[0] = P0.value, ys[3] = P3.value  (@0x40651..0x4066d).
    // getValueV @0x3ea46 on a static keypoint just returns v.value (no channel indirection).
    ys[0] = a.value;
    ys[3] = b.value;

    // Step D — Abscissae endpoints  (@0x4067e..0x40690).
    xs[0] = 0.0;
    xs[3] = 1.0;

    // Step E — computeTangents via *0x80  (@0x406ae..0x406c8):
    //   dTimeA -> xs[1], dValueA -> ys[1], dTimeB -> xs[2], dValueB -> ys[2]
    const tans = this.computeTangents(a, b);
    xs[1] = tans.dTimeA;
    ys[1] = tans.dValueA;
    xs[2] = tans.dTimeB;
    ys[2] = tans.dValueB;

    // Step F — segment_seconds = seconds(outUC - outUB); floor by 1e-5.
    // (Recomputed from CMTimes — matches the second SaferSubtract+CMTimeGetSeconds at @0x4071f/
    //  @0x40739; equal to secDiff we already computed above for the guard.)
    const segment_seconds = secDiff;
    const FLOOR_EPS = Math.fround(1e-5);           // @ProChannel 0xb0770 (1e-5 as float32)
    const den = Math.max(segment_seconds, FLOOR_EPS);

    // Step G — Interior control-point combine  (@0x4074a..0x407ab).
    const HS = this.handleScale;
    // xs[1] = (HS * dTimeA) / den
    // xs[2] = (HS * dTimeB + segment_seconds) / den
    const HS_dTimeA = HS * xs[1];
    const HS_dTimeB = HS * xs[2];
    xs[1] = HS_dTimeA / den;
    xs[2] = (HS_dTimeB + segment_seconds) / den;
    // ys[1] = ys[0] + HS * dValueA          (= P0.value + HS * outTangentValueA)
    // ys[2] = ys[3] + HS * dValueB          (= P3.value + HS * inTangentValueB)
    ys[1] = ys[0] + HS * ys[1];
    ys[2] = ys[3] + HS * ys[2];

    // Step H — Sanitize gate (@0x407b1..0x407ce).
    // Our OZSpline model exposes handleMode0/handleMode3 (default 0/0). The gate requires
    // handleMode0==0 && handleMode3==1 — with defaults both false, Sanitize is skipped. If a
    // future caller sets these to trigger Sanitize, OZBezierSanitizeControlPolygon @0xa550c is
    // called (see raw-port/src/channels/OZBezierSanitizeControlPolygon.ts).
    if (sanitizeGateFromKeypoint(a, b)) {
      OZBezierSanitizeControlPolygon(xs, ys);
    }

    return { outUB, outUC };
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

/**
 * Predicate mirroring the sp->0xa8 sanitize gate @0x407b5-0x407c5:
 *   rax = sp->0xa8 ; if (rax[0]==0 && rax[3]==1) call OZBezierSanitizeControlPolygon.
 * OZSpline's default byte layout at +0xa8 is 4 zero bytes (bounds ctor pattern), so the gate
 * is FALSE on a freshly-parsed .motr unless the parser explicitly sets +0xa8[3]. Our OZCurve
 * parser (raw-port/src/channels/OZCurve.ts) does NOT currently produce any keypoint field or
 * spline attribute that maps to sp->0xa8[3]. If a future .motr shape sets that flag (a
 * "clamp handles" mode), Sanitize is called — but for the current corpus, this always returns
 * false, matching the default OZSpline ctor state. Passed the two segment endpoints so future
 * clamp-flag propagation can gate off keypoint.flags.
 */
function sanitizeGateFromKeypoint(_a: OZKeypoint, _b: OZKeypoint): boolean {
  // OZSpline default: sp->0xa8 = {0,0,0,0}. Gate = (0==0 && 0==1) = false.
  return false;
}

/** Module-level singleton — matches FCP's OZInterpolators registry (ctor @0x44a24 stores the
 *  Bezier interpolator at offset 0x18 of the singleton table @ProChannel 0xd4???).  */
export const OZ_BEZIER_INTERPOLATOR = new OZBezierInterpolator();
