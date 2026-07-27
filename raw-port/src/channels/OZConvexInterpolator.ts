// OZConvexInterpolator — quarter-cosine convex ease (ProChannel.framework).
// Faithful port. Decode: OZConvexInterpolator::interpolate @ProChannel 0xaae4a (re/CURVE_EVAL.md).
import { OZKeypoint } from "./OZCurve.js";
import { CMTime, CMTimeGetSeconds } from "../infra/CMTime.js";
import { easeTime_identity } from "./OZInterpolator.js";

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
