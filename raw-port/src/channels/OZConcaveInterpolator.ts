// OZConcaveInterpolator — quarter-cosine concave ease (ProChannel.framework).
// Faithful port. Decode: OZConcaveInterpolator::interpolate @ProChannel 0xab0de (re/CURVE_EVAL.md).
import { OZKeypoint } from "./OZCurve.js";
import { CMTime, CMTimeGetSeconds } from "../infra/CMTime.js";
import { easeTime_identity } from "./OZInterpolator.js";

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
