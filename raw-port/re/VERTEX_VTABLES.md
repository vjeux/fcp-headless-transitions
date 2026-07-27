# OZ vertex / spline / interpolator vtables — resolved via `dyld_info -fixups` (2026-07-27)

Vtable fn pointers begin at (vtable symbol + 0x10). Slot offset N (as used in `callq *N(%rax)`)
indexes from there. All resolved by rebase target -> nearest T/t symbol.

## OZDynamicVertex vtable (sym 0xd5380; fns @0xd5390) — the KEYPOINT object
  +0x00 ~OZDynamicVertex        +0x10 OZVertex::setValueU(CMTime)      +0x18 getValueV(CMTime)  <-- VALUE
  +0x20 setValueV(double,CMTime) +0x28 getBias(CMTime)                 +0x30 setBias
  +0x38 getInputTangents(double*,double*,CMTime)  +0x40 getOutputTangents(...)
  +0x48 setInputTangents        +0x50 setOutputTangents               +0x58 flattenTangents
  +0x60 resetTangents           +0x68 OZVertex::setNormal             +0x70 OZVertex::getNormal
  +0x78 swapTangents            +0x88 isEnabled(CMTime)
=> a keypoint is an OZDynamicVertex: value = getValueV(t); time(U) via setValueU/CMTime at +0x10;
   in/out tangents via getInput/OutputTangents(&tTime,&tVal, t).

## OZSpline vtable (sym 0xd5228; fns @0xd5238)
  +0x10 getInterpolation(uint*,bool*,bool*)   +0x18 getAllVerticesHandles(vector<void*>&)
  +0x20 deleteVertex   +0x28/0x30 sampleSpline   +0x38/0x40 sampleSplineDerivatives
  +0x48 sampleSplineSegment  +0x50 sampleSplineSegments
  +0x58 enableVertex   +0x60 disableVertex   +0x68 isEnabledVertex(void*,CMTime)  <-- gate
  +0x70 setVertexInputHandles  +0x78 setVertexOutputHandles

## OZLinearInterpolator vtable (sym 0xd6508; fns @0xd6518)
  +0x00 ~   +0x08 ~   (init/interpolate live lower; see disasm) — interpolate @0x44ec8,
  subDivide @0x4511e. The *0x68 call inside interpolate is on the SPLINE arg's vtable (isEnabledVertex).

## => OZLinearInterpolator::interpolate(OZSpline& sp, CMTime t, OZDynamicVertex* a, OZDynamicVertex* b,
##    CMTime& u, bool fX, bool fY)  [ProChannel @0x44ec8], fully decoded:
   tA = a.timeU (CMTime @a+0x10); tB = b.timeU.
   if CMTimeCompare(tB, tA) > 0: nudge via getSmallDeltaU + PC_CMTimeSaferAdd (equal-time guard).
   sp.isEnabledVertex(a, t)   (via spline vtable *0x68)
   num = CMTimeGetSeconds(PC_CMTimeSaferSubtract(t,  tA))
   den = CMTimeGetSeconds(PC_CMTimeSaferSubtract(tB, tA))
   valA = a.getValueV(t)  (vertex vtable *0x18); valB = b.getValueV(t)
   fY==0: result = valA + (valB - valA) * (num/den)   [packed SIMD: value + a 2nd lane]
   fY==1: result = (x - valA)/den    [derivative/slope variant]
