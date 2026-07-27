# OZBezierInterpolator — decode notes (transcription pending; sampleCurveValue THROWS for bezier) 2026-07-27

Bezier is NOT a naive cubic in (time,value). It evaluates by SAMPLING the spline at intermediate
control-point times. Chain (all addresses ProChannel x86_64):

## OZBezierInterpolator::interpolate(OZSpline& sp, CMTime t, void* vA, void* vB, CMTime u, bool, bool)
   @0x407e6:
  1. getControlPoints(sp, vA, vB, t, &cpA{CMTime,val}, &cpB{CMTime,val}, ...)   @0x4054a
  2. Using the control-point times: PC_CMTimeSaferSubtract + CMTimeGetSeconds + CMTimeMake(1,1000)
     (0x3e8=1000 scale) + PC_CMTimeSaferAdd to build TWO intermediate CMTimes cp1t, cp2t.
  3. v1 = sp.getVertexValue(cp1t)   (spline vtable *0xf0 = OZSpline::getVertexValue @0x303a6)
     v2 = sp.getVertexValue(cp2t)
  4. (tail, 0x40a10+) combines v1,v2 with the eased fraction into the final cubic value — de Casteljau
     style recursive subdivision via the spline sampler. TODO: decode the final combine + the third
     getVertexValue.

## OZBezierInterpolator::getControlPoints @0x4054a  — builds the control polygon:
  - reads vA.getValueV / vB.getValueV (*0x18) -> endpoint values P0, P3 (stored at outstruct +0x0/+0x18).
  - CMTimeCompare(uB,uA) + getSmallDeltaU + PC_CMTimeSaferAdd (equal-U guard).
  - *0x80 on a vertex = getInputTangents/getOutputTangents (tangent handle time+value).
  - affine combine (mulsd/addsd) of tangent handles scaled by the segment span -> interior control
    points P1, P2 (times + values). Constant 1.0 (0x3ff0..) used for the (1-f) weight.
  - calls OZBezierSanitizeControlPolygon(double* xs, double* ys) @0xa550c to clamp the control
    polygon monotonic (prevents overshoot/back-tracking in time).

## OZBezierSanitizeControlPolygon @0xa550c: clamps the 4-point control polygon so the time-axis is
   monotonic (standard AE/Motion keyframe-handle clamp). TODO: decode exact clamp.

NEXT to transcribe (fills the sampleCurveValue 'bezier' throw): getControlPoints affine math +
SanitizeControlPolygon + the interpolate combine. Until then bezier THROWS (no silent approximation).
Types using bezier in the corpus: keypoint interpolation 2,3,4,5,9,11 (rare vs 12850 linear).

## ADDENDUM (2026-07-27) — getControlPoints tangent math resolved:
- *0x80(spline) = OZSpline::getVertexInputHandles(void* v, double* outDx, double* outDy, CMTime, bool)
  @0x3c522 — returns a vertex's tangent HANDLE as (dTime, dValue). (There is a matching
  getVertexOutputHandles @0x3c5da.)
- Denominator floor constant @0xb0770 = 1e-5: den = max(CMTimeGetSeconds(span), 1e-5) via maxsd,
  guarding divide-by-zero for zero-length segments.
- Interior control point build (0x4074a..0x407ab): with handle (hx=out[0x8], the SIMD lane math):
    cp.time  = handle.dTime  * outStruct[0x8]  / den        (divpd by broadcast den)
    cp.value = (handle.dValue * outStruct[0x10] + secs) / den
  and the second control point: out[0x8] = out[0x8]*handle + out[0x0]; out[0x10] = out[0x10]*handle + out[0x18].
  (Exact lane->field mapping still needs a careful re-trace before transcription — do NOT guess.)
- OZBezierSanitizeControlPolygon(double* xs, double* ys) @0xa550c is called ONLY when the spline flag
  bytes spline->0xa8[0]==0 && spline->0xa8[3]==1 (a "clamp handles" mode).
STILL PENDING before transcription: exact SIMD lane->(time,value) mapping in getControlPoints; the
interpolate combine (0x40a10+) that samples getVertexValue at the 2 control times + the 3rd sample;
OZBezierSanitizeControlPolygon body. Until all three are decoded, sampleCurveValue THROWS for bezier.
