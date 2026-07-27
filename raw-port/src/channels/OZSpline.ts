// OZSpline — the curve sampler (value at time t). ProChannel.framework.
// Faithful port. Decode: OZSpline::getVertexValue(CMTime) @ProChannel 0x303a6 (re/CURVE_EVAL.md
// ADDENDUM 2). Clamps t to [firstEnabled.U, lastEnabled.U] (holds the endpoint value outside unless
// the extrapolation flag is set — absent for these template curves), brackets the consecutive
// vertices around t, and dispatches to the interpolator selected by the LEFT vertex's
// getInterpolation() (*0xd0) via OZInterpolators::getInterpolator.
import { OZKeypoint } from "./OZCurve.js";
import { CMTime, CMTimeCompare } from "../infra/CMTime.js";
import { getInterpolatorKind } from "./OZInterpolators.js";
import { linearInterpolate } from "./OZLinearInterpolator.js";
import { scurveInterpolate } from "./OZSCurveInterpolator.js";
import { convexInterpolate } from "./OZConvexInterpolator.js";
import { concaveInterpolate } from "./OZConcaveInterpolator.js";
import { catmullRomInterpolate } from "./OZCatmullRomInterpolator.js";
import { OZ_BEZIER_INTERPOLATOR } from "./OZBezierInterpolator.js";

/**
 * sampleCurveValue — OZSpline::getVertexValue(CMTime t) @0x303a6. Keypoints ARE the vertices (sorted
 * by U). A keypoint's segment interpolation type is its own `interpolation`, else the <curve type=N>.
 */
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
        // OZCatmullRomInterpolator (@ProChannel 0x430a2): ported class faithfully throws citing its
        // undecoded upstream deps (OZBezierInterpolator::interpolate @0x407e6 +
        // OZCardinalInterpolator::computeTangents @0x42ae2) rather than substituting a textbook curve.
        case "catmullRom": return catmullRomInterpolate(t, a, b);
        // OZBezierInterpolator @ProChannel 0x407e6: interpolate is now transcribed (see
        // OZBezierInterpolator.ts + re/BEZIER_GETCONTROLPOINTS_DECODE.md). Full flow:
        //   getControlPoints @0x4054a (from OZKeypoint tangent handles) -> xs[4], ys[4]
        //   normalize t into u=[0,1] over [a.u,b.u] (den=max(span_seconds,1e-5) @0xb0770)
        //   param = OZBezierFindParameter(xs, u)  @0xa57c7 (oracle-VERIFIED)
        //   value = OZBezierEval(ys, param)       @0xa549c (oracle-VERIFIED)
        // Bezier is now REACHABLE for a real .motr bezier keyframe (interp type 2,3,4,5,9,11 —
        // rare vs 12850 linear in the corpus). The Sanitize clamp-handles path (@0xa550c) is
        // still gated off (default sp->0xa8[3]=0) — see OZBezierSanitizeControlPolygon.ts.
        case "bezier":   return OZ_BEZIER_INTERPOLATOR.interpolate(t, a, b);
        // Pending faithful transcriptions (decoded, not yet ported — each MUST match its disasm):
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
