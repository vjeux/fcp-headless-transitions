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
