// interpolators.ts — faithful transcription of the OZ*Interpolator::interpolate methods that
// OZSpline::interpolate dispatches to. Each is a line-by-line port of the disassembly in
// re/disasm/ + re/CURVE_EVAL.md; nothing is invented. All math runs in CMTime rational space
// (CMTime.ts), matching the binary's CMTimeCompare/GetSeconds/PC_CMTimeSaferSubtract calls.
//
// A vertex here is an OZKeypoint: its U (time) is the full CMTime `u`; its value is `value`
// (OZDynamicVertex::getValueV @0x3ea46 tail-calls OZChannel::getValueAsDouble on the nested
// value-channel at vertex+0x150 — for a static keypoint that returns the stored scalar `value`).
import { OZKeypoint } from "./OZCurve.js";
import { CMTime, CMTimeCompare, CMTimeGetSeconds, PC_CMTimeSaferSubtract } from "../infra/CMTime.js";
import { catmullRomInterpolate } from "./OZCatmullRomInterpolator.js";

/**
 * OZInterpolator::easeTime(OZSpline&, CMTime t, vA, vB) -> CMTime   @ProChannel 0x418b2.
 * The BASE implementation is IDENTITY: it copies the input CMTime `t` verbatim to the result
 * (movq 0x10(rcx)->0x10(rdi); movups (rcx)->(rdi)). Linear + Bezier use this base; the eased
 * interpolators (SCurve/Convex/Concave/Ease) OVERRIDE easeTime to warp the query time. Modelled
 * here as identity for the base; overrides are added when those interpolators are transcribed.
 */
export function easeTime_identity(t: CMTime, _a: OZKeypoint, _b: OZKeypoint): CMTime {
  return t; // verbatim copy
}

/**
 * OZLinearInterpolator::interpolate(OZSpline& sp, CMTime t, vA, vB, CMTime u, bool fX, bool fY)
 *   @ProChannel 0x44ec8. Fully decoded (re/CURVE_EVAL.md):
 *     tA = vA.U, tB = vB.U
 *     if CMTimeCompare(tB, tA) > 0: (non-degenerate) — the equal-U guard nudges tA by getSmallDeltaU;
 *        when tB<=tA the guard is skipped. Modelled below: only divide when den != 0.
 *     te   = easeTime(t)                                  (*0x68 ; base = identity)
 *     num  = CMTimeGetSeconds(PC_CMTimeSaferSubtract(te, tA))
 *     den  = CMTimeGetSeconds(PC_CMTimeSaferSubtract(tB, tA))
 *     valA = vA.getValueV(te);  valB = vB.getValueV(te)   (vertex *0x18 -> nested channel; static
 *            keypoint => stored scalar)
 *     fY==0 (default): result = valA + (valB - valA) * (num/den)   [packed SIMD dot-product form]
 *     fY==1: derivative/slope variant (not used for value sampling)
 * Returns the interpolated scalar value at time t between keypoints a (left) and b (right).
 */
export function linearInterpolate(t: CMTime, a: OZKeypoint, b: OZKeypoint): number {
  const tA = a.u, tB = b.u;
  const te = easeTime_identity(t, a, b);            // *0x68, identity for Linear
  const den = CMTimeGetSeconds(PC_CMTimeSaferSubtract(tB, tA));
  const valA = a.value;                             // vA.getValueV(te)  (static keypoint scalar)
  const valB = b.value;                             // vB.getValueV(te)
  if (den === 0) return valA;                       // CMTimeCompare(tB,tA)<=0 degenerate: hold left
  const num = CMTimeGetSeconds(PC_CMTimeSaferSubtract(te, tA));
  return valA + (valB - valA) * (num / den);        // fY==0 path
}

/**
 * OZSCurveInterpolator::interpolate(OZSpline& sp, CMTime t, vA, vB, ...)  @ProChannel 0xaabde.
 * Fully decoded (all constants + the trig fn resolved from the binary):
 *   tA = CMTimeGetSeconds(vA.U);  tB = CMTimeGetSeconds(vB.U)   (equal-U guard via getSmallDeltaU)
 *   te = easeTime(t)  (identity base)
 *   f  = (CMTimeGetSeconds(te) - tA) / (tB - tA)                 (linear fraction)
 *   x  = f * PI          (const @0xb03b8 = 3.141592653589793)
 *   c  = cosf(x)         (call @0xaced6 = _cosf)
 *   fʹ = (1.0 - c) * 0.5 (consts @0xaf528 = 1.0, @0xb03c0 = 0.5)  => fʹ = (1 - cos(PI*f))/2
 *   valA = vA.getValueV(te);  valB = vB.getValueV(te)
 *   result = valA * (1 - fʹ) + valB * fʹ
 * i.e. a raised-cosine (smooth) ease of the linear fraction. NOTE: cosf is single-precision (float)
 * in the binary — Math.fround matches that rounding.
 */
export function scurveInterpolate(t: CMTime, a: OZKeypoint, b: OZKeypoint): number {
  const tA = CMTimeGetSeconds(a.u), tB = CMTimeGetSeconds(b.u);
  const te = easeTime_identity(t, a, b);
  const den = tB - tA;
  const valA = a.value, valB = b.value;
  if (den === 0) return valA;                       // CMTimeCompare(tB,tA)<=0 degenerate
  const f = (CMTimeGetSeconds(te) - tA) / den;
  const fp = (1.0 - Math.fround(Math.cos(Math.fround(f * Math.PI)))) * 0.5; // (1 - cosf(PI*f))/2
  return valA * (1 - fp) + valB * fp;
}

/**
 * OZConvexInterpolator::interpolate(OZSpline& sp, CMTime t, vA, vB, ...)  @ProChannel 0xaae4a.
 * Fully decoded (constants + both trig fns + the branch predicate resolved from the binary):
 *   f = (CMTimeGetSeconds(te) - tA)/(tB - tA);  x = fround(f * (PI/2))   (const @0xaf578 = π/2)
 *   The branch (ucomisd valB, valA @0xaaf66; jbe = valB <= valA) picks the trig so the segment
 *   always bulges CONVEX regardless of rise/fall direction:
 *     valB >  valA (rising):  s = sinf(x);  result = valA*(1 - s) + valB*s
 *     valB <= valA (falling): c = cosf(x);  result = valB*(1 - c) + valA*c
 *   (consts @0xaf528 = 1.0; sinf @0xacf84, cosf @0xaced6; single-precision -> Math.fround.)
 */
export function convexInterpolate(t: CMTime, a: OZKeypoint, b: OZKeypoint): number {
  const tA = CMTimeGetSeconds(a.u), tB = CMTimeGetSeconds(b.u);
  const te = easeTime_identity(t, a, b);
  const den = tB - tA;
  const valA = a.value, valB = b.value;
  if (den === 0) return valA;
  const f = (CMTimeGetSeconds(te) - tA) / den;
  const x = Math.fround(f * (Math.PI / 2)); // cvtsd2ss(f * π/2)
  if (valB > valA) {
    const s = Math.fround(Math.sin(x)); // sinf(x)
    return valA * (1 - s) + valB * s;
  } else {
    const c = Math.fround(Math.cos(x)); // cosf(x)
    return valB * (1 - c) + valA * c;
  }
}

/**
 * OZConcaveInterpolator::interpolate(OZSpline& sp, CMTime t, vA, vB, ...)  @ProChannel 0xab0de.
 * Mirror of Convex — the segment always dips CONCAVE. Fully decoded (same π/2 scale + trig, opposite
 * pairing; branch ucomisd valB,valA @0xab1fa; jbe = valB <= valA):
 *   f = (secs(te)-tA)/(tB-tA);  x = fround(f * (PI/2))
 *   valB >  valA (rising):  c = cosf(x);  result = valA*c + valB*(1 - c)    [= valA + (valB-valA)*(1-cos x)]
 *   valB <= valA (falling): s = sinf(x);  result = valA*(1 - s) + valB*s
 *   (const @0xaf578 = π/2, @0xaf528 = 1.0; cosf @0xaced6, sinf @0xacf84; single-precision.)
 */
export function concaveInterpolate(t: CMTime, a: OZKeypoint, b: OZKeypoint): number {
  const tA = CMTimeGetSeconds(a.u), tB = CMTimeGetSeconds(b.u);
  const te = easeTime_identity(t, a, b);
  const den = tB - tA;
  const valA = a.value, valB = b.value;
  if (den === 0) return valA;
  const f = (CMTimeGetSeconds(te) - tA) / den;
  const x = Math.fround(f * (Math.PI / 2)); // cvtsd2ss(f * π/2)
  if (valB > valA) {
    const c = Math.fround(Math.cos(x)); // cosf(x)
    return valA * c + valB * (1 - c);
  } else {
    const s = Math.fround(Math.sin(x)); // sinf(x)
    return valA * (1 - s) + valB * s;
  }
}

// --- Interpolator dispatch: type-id -> which interpolate function --------------------------------
// Faithful transcription of OZInterpolators::getInterpolator(uint) @0x447a6 +
// OZInterpolatorStrategies::getInterpolator(uint) @0x44ddc. Decode (re/INTERPOLATION_TYPES.md):
//   N==10 -> XSpline, N==12 -> BSpline; else if N<=0x15: offset = table[N] (jump table @0xb0958),
//   returns the singleton interpolator at that offset (ctor @0x44a24 stores the classes); else the
//   default offset 0x18 = Bezier. The offset->class + type->offset tables were read from the binary.
export type InterpKind =
  | "constant" | "linear" | "bezier" | "catmullRom" | "convex" | "concave" | "scurve"
  | "xspline" | "bspline" | "base";

// type-id -> singleton offset (table @0xb0958, read from the binary; entries 0..0x15).
const TYPE_TO_OFFSET: Record<number, number> = {
  0:0x08, 1:0x10, 2:0x18, 3:0x18, 4:0x18, 5:0x18, 6:0x20, 7:0x28, 8:0x30,
  9:0x18, 10:0x18, 11:0x18, 12:0x18, 13:0x38, 14:0x40, 15:0x58, 16:0x48,
  17:0x50, 18:0x10, 19:0x60, 20:0x68, 21:0x70,
};
// singleton offset -> interpolator class (ctor @0x44a24 store order, read from the binary).
const OFFSET_TO_KIND: Record<number, InterpKind> = {
  0x08:"constant", 0x10:"linear", 0x18:"bezier", 0x20:"catmullRom",
  0x28:"base", 0x30:"base", 0x38:"base", 0x40:"base",
  0x48:"linear", 0x50:"linear", 0x58:"linear",
  0x60:"convex", 0x68:"concave", 0x70:"scurve",
};

/** OZInterpolators::getInterpolator(type) — returns the interpolator KIND for a keypoint's type. */
export function getInterpolatorKind(type: number): InterpKind {
  if (type === 10) return "xspline";     // OZInterpolators::getInterpolator pre-empts 10/12
  if (type === 12) return "bspline";
  if (type >= 0 && type <= 0x15) return OFFSET_TO_KIND[TYPE_TO_OFFSET[type]] ?? "bezier";
  return "bezier";                        // else default offset 0x18
}

// --- Spline sampler: value at time t ------------------------------------------------------------
// Faithful transcription of OZSpline::getVertexValue(CMTime t) @0x303a6 (re/CURVE_EVAL.md ADDENDUM 2):
//   - clamp t to [firstEnabled.U, lastEnabled.U]: OUTSIDE the range the spline HOLDS the endpoint
//     value (unless an extrapolation flag is set — not present for these template curves).
//   - INSIDE, find the bracketing consecutive vertices (vA.U <= t <= vB.U) and dispatch to the
//     interpolator selected by the LEFT vertex's getInterpolation() (*0xd0) via getInterpolatorKind.
// Keypoints ARE the vertices (sorted by U). A keypoint's type falls to the <curve type=N> when the
// keypoint carries no per-keypoint interpolation attr.

export function sampleCurveValue(
  keypoints: OZKeypoint[],
  curveType: number | undefined,
  t: CMTime,
): number {
  const n = keypoints.length;
  if (n === 0) return 0;
  if (n === 1) return keypoints[0].value;
  const first = keypoints[0], last = keypoints[n - 1];
  // clamp: hold endpoint value outside [first.U, last.U]
  if (CMTimeCompare(t, first.u) <= 0) return first.value;
  if (CMTimeCompare(t, last.u) >= 0) return last.value;
  // bracket
  for (let i = 0; i < n - 1; i++) {
    const a = keypoints[i], b = keypoints[i + 1];
    if (CMTimeCompare(t, a.u) >= 0 && CMTimeCompare(t, b.u) <= 0) {
      // segment interpolator = LEFT vertex getInterpolation() (else the <curve type>)
      const type = a.interpolation ?? curveType ?? 1;
      const kind = getInterpolatorKind(type);
      switch (kind) {
        case "constant": return a.value;              // OZConstantInterpolator: hold left value
        case "linear":   return linearInterpolate(t, a, b);
        case "scurve":   return scurveInterpolate(t, a, b);
        case "convex":   return convexInterpolate(t, a, b);
        case "concave":  return concaveInterpolate(t, a, b);
        // OZCatmullRomInterpolator (@ProChannel 0x430a2, vtable 0xd6040) — ported class exists in
        // OZCatmullRomInterpolator.ts. It faithfully throws citing its two undecoded upstream deps
        // (OZBezierInterpolator::interpolate @0x407e6 + OZCardinalInterpolator::computeTangents
        // @0x42ae2), rather than substituting a textbook Catmull-Rom that would diverge from FCP.
        case "catmullRom": return catmullRomInterpolate(t, a, b);
        // Pending faithful transcriptions (decoded, not yet ported — each MUST match its disasm):
        //   bezier      OZBezierInterpolator::interpolate      @ProChannel 0x407e6
        //   xspline     OZXSplineInterpolator::interpolate     @ProChannel 0x45eae
        //   bspline     OZBSplineInterpolator::interpolate     @ProChannel 0x4191c
        // Never silently substitute a different curve; a loud throw is the correct behaviour.
        default:
          throw new Error(`interpolator '${kind}' (type ${type}) not yet transcribed @ProChannel 0x407e6`);
      }
    }
  }
  return last.value;
}
