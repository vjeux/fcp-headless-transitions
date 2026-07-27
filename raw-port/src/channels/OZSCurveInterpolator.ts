// OZSCurveInterpolator — raised-cosine (S-curve) keyframe interpolator (ProChannel.framework).
// Faithful port. Decode: OZSCurveInterpolator::interpolate @ProChannel 0xaabde (re/CURVE_EVAL.md).
import { OZKeypoint } from "./OZCurve.js";
import { CMTime, CMTimeGetSeconds } from "../infra/CMTime.js";
import { easeTime_identity } from "./OZInterpolator.js";

/**
 * OZSCurveInterpolator::interpolate(OZSpline& sp, CMTime t, vA, vB, ...)  @ProChannel 0xaabde.
 * Fully decoded (all constants + the trig fn resolved from the binary):
 *   f  = (CMTimeGetSeconds(te) - tA) / (tB - tA)                 (linear fraction; te = easeTime base)
 *   x  = f * PI          (const @0xb03b8 = 3.141592653589793)
 *   c  = cosf(x)         (call @0xaced6 = _cosf)
 *   fʹ = (1.0 - c) * 0.5 (consts @0xaf528 = 1.0, @0xb03c0 = 0.5)  => fʹ = (1 - cos(PI*f))/2
 *   result = valA * (1 - fʹ) + valB * fʹ
 * cosf is single-precision (float) in the binary — Math.fround matches that rounding.
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
