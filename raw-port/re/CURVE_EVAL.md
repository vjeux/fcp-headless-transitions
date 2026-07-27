# Curve value evaluation — FULLY DECODED (all vtable slots resolved via dyld_info -fixups) 2026-07-27

Objects (verified layouts):
- OZDynamicVertex (a keypoint). vtable 0xd5380. Key virtuals:
    *0x10 OZVertex::setValueU(CMTime)      *0x18 getValueV(CMTime) -> double   (THE VALUE)
    *0x38 getInputTangents(double* tTime,double* tVal, CMTime)   *0x40 getOutputTangents(...)
    *0x88 isEnabled(CMTime).   The vertex's time "U" is a CMTime stored at vertex+0x10 (value@+0x10,
    timescale/flags@+0x18); +0x20 = epoch.
- OZSpline. vtable 0xd5228. *0x68 isEnabledVertex(void*,CMTime); *0x28/0x30 sampleSpline; getSmallDeltaU @0x2fe52.
- OZLinearInterpolator. vtable 0xd6518. *0x18 interpolate; *0x28 convertHandlesToTangents;
    *0x38 useTangents; *0x40 useKeypoints; *0x60 uForCurveValue; *0x68 OZInterpolator::easeTime.

## OZInterpolator::easeTime(OZSpline&, CMTime t, void* vA, void* vB) -> CMTime   @0x418b2
IDENTITY for the base interpolator: returns t unchanged (copies the 24-byte CMTime to the sret buffer).
Ease/SCurve/Convex/Concave subclasses OVERRIDE this to warp the query time; Linear/Bezier use the base.

## OZLinearInterpolator::interpolate(OZSpline& sp, CMTime t, OZDynamicVertex* a, OZDynamicVertex* b,
##   CMTime& u, bool fX, bool fY) -> double    @0x44ec8   [fully resolved]
  tA = a.U (CMTime @a+0x10);  tB = b.U
  if CMTimeCompare(tB, tA) > 0:                      # non-degenerate span
      d = sp.getSmallDeltaU()                        # tiny epsilon CMTime
      (used via PC_CMTimeSaferAdd to guard equal-U)  # nudge
  te = this->easeTime(sp, t, a, b)                   # *0x68 ; base = identity => te = t
  num = CMTimeGetSeconds( PC_CMTimeSaferSubtract(te, tA) )
  den = CMTimeGetSeconds( PC_CMTimeSaferSubtract(tB, tA) )
  valA = a.getValueV(te)      # vertex *0x18
  valB = b.getValueV(te)
  if !fY:  return valA + (valB - valA) * (num/den)   # packed SIMD (value + a 2nd lane / tangent)
  else:    return (te_seconds_expr - valA) / den     # derivative/slope variant

=> LINEAR value at time t between keypoints a,b:  valA + (valB-valA) * (t - tA)/(tB - tA), all in
   CMTime rational space via CMTimeGetSeconds. easeTime warps t for the eased interpolator subclasses.
CMTime.ts primitive already implements CMTimeCompare/GetSeconds/Make/PC_CMTimeSaferAdd/Subtract.
NEXT: model the keypoint as {U:CMTime, value, inTan, outTan}; transcribe easeTime (identity) +
OZLinearInterpolator::interpolate on that model; then OZBezierInterpolator (uses getControlPoints).
