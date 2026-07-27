# Curve evaluation — decode notes for a FAITHFUL transcription (in progress) — 2026-07-27

Goal: transcribe the real value-sampling path; invent nothing. Entry -> leaf:

## OZChannel::getValueAsDouble(const CMTime& t, double dflt) — ProChannel @0x15d4e
- reads the channel's spline at this+0x70; if its keypoint list (spline+0x8) is empty -> return 0.
- vtable *0x340 = "is animated / has expression" test; flag 0x80000000 = expression channel.
- builds a time-map via vtable *0x148, then samples via *0x270 (expression) or *0x268 (normal).
- flag 0x800000000 + getFadeRatio(t) (@0x15f4e) multiplies a fade envelope onto the sampled value.

## OZSpline::interpolate(const CMTime& t, void* outA, void* outB, const CMTime& u, double* out, bool)
  — ProChannel @0x31ec8
- if spline+0xa0 (a helper obj) and its +0x28 present, try its vtable *0x70 (a fast path); else:
- eax = (via *0xd0 on outA) the interpolation TYPE at this query; then
  OZInterpolators::getInterpolator(type) (@0x447a6) -> the interpolator object.
- interpolator vtable *0x58 = "needs setup?" ; *0x10 = setup; then *0x18 = interpolate(spline, t,
  outA, outB, u, bool, bool) -> writes the sampled double to *out.

## OZLinearInterpolator::interpolate(OZSpline&, const CMTime& t, void* vA, void* vB, const CMTime& u,
   bool fX, bool fY) — ProChannel @0x44ec8    [the actual linear math]
- vA, vB are OZVertex2D-like: CMTime at vertex+0x10 (value@+0x10, timescale/flags@+0x18) and +0x20
  (epoch); the vertex VALUE is fetched via a vtable call *0x18 on the vertex (returns double in xmm0).
- CMTimeCompare(vB.time, vA.time) (@0xaca80); if >0 it computes getSmallDeltaU (@0x2fe52) and
  PC_CMTimeSaferAdd (@0xacad4) to nudge — a degenerate/equal-time guard.
- num = CMTimeGetSeconds(PC_CMTimeSaferSubtract(t,  vA.time))     [seconds of (t - tA)]
  den = CMTimeGetSeconds(PC_CMTimeSaferSubtract(vB.time, vA.time)) [seconds of (tB - tA)]  (@0xacada,@0xaca8c)
  (a sign mask xorpd @0xb0640 negates one operand as needed.)
- valA = vertexA.value (*0x18), valB = vertexB.value (*0x18).
- fY==0 (SIMD path @0x450c3): packs two (num,den) pairs, divpd -> f = num/den (2 lanes: value +
  a 2nd channel/tangent), then [valA,valB]·... mulpd + haddpd  =>  result = valA + (valB-valA)*f.
- fY==1 (@0x450fe): scalar (x0 - valB)/den — the derivative/slope variant.

=> Linear value = valA + (valB - valA) * ( seconds(t - tA) / seconds(tB - tA) ), all in CMTime space.

## Blocking to transcribe fully (must model, not guess):
- OZVertex2D exact layout + the *0x18 value accessor and *0xd0 (type) / *0x68 vtable methods.
- OZSpline vertex list + how getVertexValue / the surrounding-vertex pair is selected before
  interpolate is called (OZSpline::getPoint / sampleSpline).
- getInterpolator(type) map already decoded (see disasm/ProChannel.OZInterpolators.getInterpolator.s).
CMTime.ts primitive is in place (CMTimeCompare/GetSeconds/Make/SaferAdd/SaferSubtract).
