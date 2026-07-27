// OZInterpolator — base keyframe interpolator (ProChannel.framework).
// Faithful port. Decode: OZInterpolator::easeTime @ProChannel 0x418b2 (re/CURVE_EVAL.md).
// One class per file (mirrors FCP's class hierarchy). easeTime is the base "time-warp" hook the
// interpolators call before evaluating a segment; the eased subclasses (SCurve/Convex/Concave/Ease)
// OVERRIDE it, Linear/Bezier use this identity base.
import { OZKeypoint } from "./OZCurve.js";
import { CMTime } from "../infra/CMTime.js";

/**
 * OZInterpolator::easeTime(OZSpline&, CMTime t, vA, vB) -> CMTime   @ProChannel 0x418b2.
 * The BASE implementation is IDENTITY: it copies the input CMTime `t` verbatim to the result
 * (movq 0x10(rcx)->0x10(rdi); movups (rcx)->(rdi)). Linear + Bezier use this base; the eased
 * interpolators OVERRIDE easeTime to warp the query time.
 */
export function easeTime_identity(t: CMTime, _a: OZKeypoint, _b: OZKeypoint): CMTime {
  return t; // verbatim copy
}
