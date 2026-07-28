// Faithful transcription @0x3a20 — @shader Hgc2ErodeInside (ProAppsFxSupport)
// Transcribed from ProAppsFxSupport.framework/Versions/A/Resources/
// ProAppsFxSupportHgcMetalShaders_derived.metallib (function offset 0x3a20).
// IR: raw-port/re/shaders/Hgc2ErodeInside.ll (103 lines).
//
// Two-input erode-inside fragment shader.  Given a "colour" texture A
// and a "matte-like" texture B (both sampled at their own UVs, linear/
// clamp through the caller-supplied samplers), it darkens/erodes the A
// plate towards zero by multiplying it with a power-shaped copy of B,
// then blends the eroded result back onto A using a scalar mix weight
// driven by parameters.w:
//
//   p       = parameters.w                                  (uniform buffer at binding 7 [3])
//   amt     = p * 0.2                          (fp32 0x3FC99999A0000000 = 0.2 exactly)
//   pClamp  = clamp(amt, 1.0, 3.0)                          (fast_fmax then fast_fmin)
//   powed   = pow(texelB, pClamp.xxxx)                      (air.fast_pow, per-channel)
//   eroded  = min(powed * texelA, 1.0)                      (per-channel saturate hi)
//   w       = min(amt, 1.0)                                 (mix weight, per-frame scalar)
//   out     = w * eroded + (1 - w) * texelA                 (lerp between plain A and eroded)
//
// Notes on the amt/pClamp/w split:  the exponent used by `pow` is clamped
// to [1, 3] (so B raised at least to power 1, at most to power 3), while
// the *mix weight* is clamped to [0, 1] (via `min(amt, 1)` — the amt
// values reached inside `pow` are ≥1 so no lower clamp on `w` is needed
// separately in the IR).  In effect: as parameters.w ramps from 0 → 5
// the shader interpolates from "pure A" (w=0), through a light-erode
// (w=1, exponent=1, output = min(A*B, 1)), up to a hard-erode
// (exponent=3, still w=1 — extra strength beyond w=1 only sharpens B).
//
// GATE NOTE: fast-math (reassoc/afn/no-signed-zeros/unsafe-fp-math);
// plain JS float ops with Math.fround at fp32 boundaries.  The single
// double literal (0x3FC99999A0000000) is decoded to fp32 0.2 exactly
// (bit-pattern equals `Math.fround(0.2)`).
//
// Faithful fp32 transcription of the IR — no reordering, no fusion.

/**
 * A sample callback for texture reads.  The Metal shader samples through
 * a caller-supplied sampler (linear/clamp per FxSupport's usual filter
 * setup); from the JS port's perspective it's a UV → RGBA function.
 * @shader Hgc2ErodeInside (ProAppsFxSupport) IR %11/%14
 */
export type TextureSample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Hgc2ErodeInside — per-channel "erode toward zero by B^k" mix on A.
 *
 * Signature (from .ll):
 *   (%0 vec4 position,       air.position (unused in body)
 *    %1 vec4 texcoord0,      per-vertex UV for texture0 (A)
 *    %2 vec4 texcoord1,      per-vertex UV for texture1 (B)
 *    %3 texture2d texture0,  A plate
 *    %4 texture2d texture1,  B plate (matte-ish)
 *    %5 sampler sampler0,
 *    %6 sampler sampler1,
 *    %7 vec4* parameters)    → parameters.w drives amount
 *
 * Body:
 *   %9    : load parameters.xyzw                            (float4)
 *   %10   : uv0 = texcoord0.xy                              (shufflevector)
 *   %11   : texelA = sample(texture0, sampler0, uv0)        (rgba + residency i8)
 *   %12   : texelA = extractvalue lane 0                    (drop residency)
 *   %13   : uv1 = texcoord1.xy
 *   %14   : texelB = sample(texture1, sampler1, uv1)
 *   %15   : texelB = extractvalue lane 0
 *   %16   : p    = extractelement parameters, i64 3         (parameters.w)
 *   %17   : amt  = fmul fast p, 0x3FC99999A0000000          (== fp32 0.2)
 *   %18   : t    = air.fast_fmax(amt, 1.0)
 *   %19   : pClamp = air.fast_fmin(t, 3.0)                  (clamp(amt, 1, 3))
 *   %20/%21: broadcast pClamp to <4 x float>                (splat via
 *                                                            insertelement+shufflevector)
 *   %22   : powed = air.fast_pow(texelB, pClamp.xxxx)       (per-channel B^k)
 *   %23   : prod  = fmul fast powed, texelA
 *   %24   : eroded = air.fast_fmin(prod, <1,1,1,1>)
 *   %25   : w    = air.fast_fmin(amt, 1.0)                  (mix weight)
 *   %26/%27: broadcast w to <4 x float>
 *   %28   : left = fmul fast w.xxxx, eroded
 *   %29   : oneMinusW = fsub fast 1.0, w
 *   %30/%31: broadcast oneMinusW to <4 x float>
 *   %32   : right = fmul fast oneMinusW.xxxx, texelA
 *   %33   : out  = fadd fast right, left
 *   ret   : out                                             (float4)
 *
 * @shader Hgc2ErodeInside (ProAppsFxSupport) IR %9..%33
 */
export function Hgc2ErodeInside(
  _position: [number, number, number, number],
  texcoord0: [number, number, number, number],
  texcoord1: [number, number, number, number],
  sampleTexture0: TextureSample2D,
  sampleTexture1: TextureSample2D,
  parameters: [number, number, number, number],
): [number, number, number, number] {
  // %10..%12 : sample texture0 at texcoord0.xy — direct UV (no snap; the
  // IR does not floor/bias here, unlike Hgc2ChannelCopy).
  const uv0: [number, number] = [
    Math.fround(texcoord0[0]),
    Math.fround(texcoord0[1]),
  ];
  const texelA = sampleTexture0(uv0);
  const Ar = Math.fround(texelA[0]);
  const Ag = Math.fround(texelA[1]);
  const Ab = Math.fround(texelA[2]);
  const Aa = Math.fround(texelA[3]);

  // %13..%15 : sample texture1 at texcoord1.xy.
  const uv1: [number, number] = [
    Math.fround(texcoord1[0]),
    Math.fround(texcoord1[1]),
  ];
  const texelB = sampleTexture1(uv1);
  const Br = Math.fround(texelB[0]);
  const Bg = Math.fround(texelB[1]);
  const Bb = Math.fround(texelB[2]);
  const Ba = Math.fround(texelB[3]);

  // %16..%17 : amt = parameters.w * 0.2  (0x3FC99999A0000000 → fp32 0.2 exactly).
  const p = Math.fround(parameters[3]);
  const amt = Math.fround(p * Math.fround(0.2));

  // %18..%19 : pClamp = clamp(amt, 1.0, 3.0), applied as fmax then fmin
  // (fast_fmax/fast_fmin have unspecified NaN behaviour; we use the
  // straightforward JS Math.max/Math.min which match ogt/olt for finite
  // fp32 values).
  const pClamp = Math.fround(Math.min(Math.max(amt, 1.0), 3.0));

  // %20..%22 : powed = pow(texelB, pClamp.xxxx).  air.fast_pow is
  // per-lane pow; we replicate as scalar per channel.  Math.fround-wrap
  // both operand widening and the fp32 result narrowing.
  const powedR = Math.fround(Math.pow(Br, pClamp));
  const powedG = Math.fround(Math.pow(Bg, pClamp));
  const powedB = Math.fround(Math.pow(Bb, pClamp));
  const powedA = Math.fround(Math.pow(Ba, pClamp));

  // %23..%24 : eroded = min(powed * texelA, 1.0), per channel.
  const erodedR = Math.fround(Math.min(Math.fround(powedR * Ar), 1.0));
  const erodedG = Math.fround(Math.min(Math.fround(powedG * Ag), 1.0));
  const erodedB = Math.fround(Math.min(Math.fround(powedB * Ab), 1.0));
  const erodedA = Math.fround(Math.min(Math.fround(powedA * Aa), 1.0));

  // %25 : w = min(amt, 1.0).
  const w = Math.fround(Math.min(amt, 1.0));

  // %26..%33 : out = w * eroded + (1 - w) * texelA, per channel.
  const oneMinusW = Math.fround(1.0 - w);
  const outR = Math.fround(
    Math.fround(oneMinusW * Ar) + Math.fround(w * erodedR),
  );
  const outG = Math.fround(
    Math.fround(oneMinusW * Ag) + Math.fround(w * erodedG),
  );
  const outB = Math.fround(
    Math.fround(oneMinusW * Ab) + Math.fround(w * erodedB),
  );
  const outA = Math.fround(
    Math.fround(oneMinusW * Aa) + Math.fround(w * erodedA),
  );

  return [outR, outG, outB, outA];
}
