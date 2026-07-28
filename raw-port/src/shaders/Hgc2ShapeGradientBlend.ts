// Faithful transcription @0x01ec — @shader Hgc2ShapeGradientBlend (ProShapes)
// Transcribed from ProShapes.framework/Versions/A/Resources/
// ProShapesHgcMetalShaders_derived.metallib (function offset 0x01ec).
// IR: raw-port/re/shaders/Hgc2ShapeGradientBlend.ll (65 lines).
//
// Two-input pure-modulate fragment shader — the simplest possible blend:
// sample two textures at their own UVs (texcoord0 / texcoord1, both
// sampled through their own linear/clamp samplers per FCP's ProShapes
// setup) and return the per-channel product.  No uniform buffer, no
// clamp, no premult conversion, no bias — just RGBA·RGBA.
//
// Body (all four fmul lanes fused into a single <4 x float> fmul fast):
//   out = sample(texture0, sampler0, texcoord0.xy)
//       * sample(texture1, sampler1, texcoord1.xy)   (per channel)
//
// Common role in ProShapes: multiply a shape's gradient fill (texture0)
// against its precomputed coverage / matte (texture1) so that the
// gradient only appears where the shape is drawn.
//
// GATE NOTE: fast-math (reassoc/afn/no-signed-zeros/unsafe-fp-math);
// there are NO numeric literals in the IR — only two texture samples and
// one fmul.  We wrap each multiply in Math.fround for fp32 fidelity.
//
// Faithful fp32 transcription of the IR — no reordering, no fusion.

/**
 * A sample callback for texture reads.  The Metal shader samples through
 * a caller-supplied sampler (linear/clamp per ProShapes' usual filter
 * setup); from the JS port's perspective it's a UV → RGBA function.
 * @shader Hgc2ShapeGradientBlend (ProShapes) IR %9/%12
 */
export type TextureSample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Hgc2ShapeGradientBlend — per-channel multiply of two textures.
 *
 * Signature (from .ll):
 *   (%0 vec4 position,       air.position (unused in body)
 *    %1 vec4 texcoord0,      per-vertex UV for texture0
 *    %2 vec4 texcoord1,      per-vertex UV for texture1
 *    %3 texture2d texture0,
 *    %4 texture2d texture1,
 *    %5 sampler sampler0,
 *    %6 sampler sampler1)
 *
 * Body:
 *   %8    : uv0 = texcoord0.xy                              (shufflevector)
 *   %9    : texelA = sample(texture0, sampler0, uv0)        (rgba + residency i8)
 *   %10   : texelA = extractvalue lane 0                    (drop residency)
 *   %11   : uv1 = texcoord1.xy
 *   %12   : texelB = sample(texture1, sampler1, uv1)
 *   %13   : texelB = extractvalue lane 0
 *   %14   : out = fmul fast texelB, texelA                  (per-channel)
 *   ret   : out                                             (float4)
 *
 * @shader Hgc2ShapeGradientBlend (ProShapes) IR %8..%14
 */
export function Hgc2ShapeGradientBlend(
  _position: [number, number, number, number],
  texcoord0: [number, number, number, number],
  texcoord1: [number, number, number, number],
  sampleTexture0: TextureSample2D,
  sampleTexture1: TextureSample2D,
): [number, number, number, number] {
  // %8..%10 : sample texture0 at texcoord0.xy — direct UV, no snap.
  const uv0: [number, number] = [
    Math.fround(texcoord0[0]),
    Math.fround(texcoord0[1]),
  ];
  const texelA = sampleTexture0(uv0);

  // %11..%13 : sample texture1 at texcoord1.xy.
  const uv1: [number, number] = [
    Math.fround(texcoord1[0]),
    Math.fround(texcoord1[1]),
  ];
  const texelB = sampleTexture1(uv1);

  // %14 : out = texelB * texelA, per channel (single <4 x float> fmul).
  return [
    Math.fround(Math.fround(texelB[0]) * Math.fround(texelA[0])),
    Math.fround(Math.fround(texelB[1]) * Math.fround(texelA[1])),
    Math.fround(Math.fround(texelB[2]) * Math.fround(texelA[2])),
    Math.fround(Math.fround(texelB[3]) * Math.fround(texelA[3])),
  ];
}
