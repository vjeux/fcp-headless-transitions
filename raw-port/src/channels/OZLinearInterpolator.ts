// OZLinearInterpolator — linear keyframe interpolator (ProChannel.framework).
// Faithful port. Decode: OZLinearInterpolator::interpolate @ProChannel 0x44ec8 (re/CURVE_EVAL.md).
import { OZKeypoint } from "./OZCurve.js";
import { CMTime, CMTimeGetSeconds, PC_CMTimeSaferSubtract } from "../infra/CMTime.js";
import { easeTime_identity } from "./OZInterpolator.js";

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
