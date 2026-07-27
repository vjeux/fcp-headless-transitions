# Curve interpolation type-id -> interpolator (DECODED, not guessed) — 2026-07-27

Source: ProChannel.framework x86_64.
- Keypoint `interpolation="N"` selects the interpolator for the segment.
- Dispatch: OZSpline::interpolate (@0x31ec8) -> OZInterpolators::getInterpolator(N) (@0x447a6):
    N==0xa(10) -> OZXSplineInterpolator ; N==0xc(12) -> OZBSplineInterpolator ;
    else -> OZInterpolatorStrategies::getInterpolator(N) (@0x44ddc).
- OZInterpolatorStrategies::getInterpolator(N): if N<=0x15, offset = table[N] (table @0xb0958,
  8-byte entries); returns *(singleton + offset). Else default offset 0x18 (Bezier).

## Singleton construction (OZInterpolatorStrategiesC2 @0x44a24) — offset <- interpolator:
  0x08 = OZConstantInterpolator
  0x10 = OZLinearInterpolator
  0x18 = OZBezierInterpolator
  0x20 = OZCatmullRomInterpolator
  0x28 = OZInterpolator (base/no-op)
  0x30 = OZInterpolator (base)
  0x38 = OZInterpolator (base)
  0x40 = OZInterpolator (base)
  0x48 = OZLinearInterpolator
  0x50 = OZLinearInterpolator
  0x58 = OZLinearInterpolator
  0x60 = OZConvexInterpolator
  0x68 = OZConcaveInterpolator
  0x70 = OZSCurveInterpolator

## type-id -> offset (table @0xb0958):
  0->0x08  1->0x10  2->0x18  3->0x18  4->0x18  5->0x18  6->0x20  7->0x28  8->0x30
  9->0x18  10->0x18(but pre-empted to XSpline)  11->0x18  12->0x18(pre-empted to BSpline)
  13->0x38  14->0x40  15->0x58  16->0x48  17->0x50  18->0x10  19->0x60  20->0x68  21->0x70

## => DECODED type-id -> interpolator:
  0  = Constant (hold-left)          <-- 916 keypoints
  1  = Linear                         <-- 12850 keypoints (DOMINANT)
  2,3,4,5,11 = Bezier
  6  = CatmullRom
  7,8,13,14 = base OZInterpolator (identity/no-op segment)
  9  = Bezier
  10 = XSpline
  12 = BSpline
  15,16,17,18 = Linear                <-- 16:66, 17:76 keypoints
  19 = Convex
  20 = Concave
  21 = SCurve

Observed in the 65 shipped transitions: types {1,0,6,16,17,8,7,15}. So the render-relevant set is
Linear (1,15,16,17), Constant (0), CatmullRom (6), SCurve/base (8,7). Bezier keypoints carry
in/out tangents; Linear/Constant do not. NEXT: decode OZLinearInterpolator::interpolate (@0x44ec8)
and OZBezierInterpolator::interpolate for the exact segment math (Bezier uses the keypoint tangents).
