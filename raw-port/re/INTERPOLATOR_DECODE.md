# Interpolator subsystem — FULLY decoded via dyld_info -fixups vtable resolution (2026-07-27)

All vtable slots resolved by decoding chained-fixup raw qwords (low bits = target vmaddr), not guessed.

## Vertices are OZDynamicVertex (vtable 0xd5380, fn array from 0xd5390):
  *0x10 OZVertex::setValueU(CMTime)         *0x18 OZDynamicVertex::getValueV(CMTime)   <- the VALUE
  *0x20 setValueV   *0x28 getBias  *0x30 setBias
  *0x38 getInputTangents(double* tTime,double* tVal, CMTime)   *0x40 getOutputTangents(...)
  *0x48 setInputTangents  *0x50 setOutputTangents  *0x58 flattenTangents  *0x60 resetTangents
  *0x68 setNormal  *0x70 getNormal  *0x78 swapTangents  *0x88 isEnabled(CMTime)
  Layout: the vertex's U (time) is a CMTime at vertex+0x10; getValueV(t) returns the V (value).

## OZSpline vtable (0xd5228, fns from 0xd5238):
  *0x10 getInterpolation(uint*,bool*,bool*)  *0x18 getAllVerticesHandles(vector<void*>&)
  *0x28/0x30 sampleSpline  *0x38/0x40 sampleSplineDerivatives  *0x48 sampleSplineSegment
  *0x58 enableVertex  *0x60 disableVertex  *0x68 isEnabledVertex  *0x70/0x78 set{Input,Output}Handles

## OZLinearInterpolator vtable (installed ptr 0xd6518; calls use *N(0xd6518)):
  *0x18 interpolate(OZSpline&, CMTime t, void* vA, void* vB, CMTime& u, bool fX, bool fY)  [@0x44ec8]
  *0x28 convertHandlesToTangents   *0x30 convertTangentsToHandles   *0x38 useTangents  *0x40 useKeypoints
  *0x60 uForCurveValue             *0x68 OZInterpolator::easeTime(OZSpline&, CMTime t, void* vA, void* vB) [@0x418b2]

## OZInterpolator::easeTime (base, @0x418b2) = IDENTITY: copies the input CMTime to the output struct
   verbatim (out.value=in.value; out[0:16]=in[0:16]). So for OZLinearInterpolator (no override) t' = t.

## => OZLinearInterpolator::interpolate (ProChannel @0x44ec8), fully resolved:
   uA = vA.U (CMTime at vA+0x10); uB = vB.U (CMTime at vB+0x10)
   if CMTimeCompare(uB, uA) > 0:  nudge uA via getSmallDeltaU (@0x2fe52) + PC_CMTimeSaferAdd  (equal-U guard)
   t' = this->easeTime(spline, t, vA, vB)                          [identity for Linear]
   num = CMTimeGetSeconds( PC_CMTimeSaferSubtract(t', uA) )
   den = CMTimeGetSeconds( PC_CMTimeSaferSubtract(uB, uA) )
   valA = vA.getValueV(t')  (vertex *0x18);  valB = vB.getValueV(t')
   fY==0 (default):  result = valA + (valB - valA) * (num/den)     [packed SIMD: value + a 2nd lane]
   fY==1:            result = (x - valA)/den                       [derivative/slope variant]

The dispatcher OZSpline::interpolate (@0x31ec8) selects the two bounding vertices + the interpolator
(getInterpolator(type) — see INTERPOLATION_TYPES.md) and calls this via *0x18.
