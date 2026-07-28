// @shader Hgc2ChannelCopy (Helium) @0x14a6
// Transcribed from Helium.framework/Versions/A/Resources/
// HeliumFiltersHgcMetalShaders_derived.metallib (function offset 0x14a6).
// IR: raw-port/re/shaders/Hgc2ChannelCopy.ll (79 lines).
//
// Two-input channel-copy fragment shader.  Given two source textures A/B
// with their own UV inputs (texcoord0, texcoord1), it fetches one texel
// from each (with a half-pixel-center offset produced by fast_floor+0.5,
// i.e. nearest-neighbour sampling snapped to the pixel-centre grid), and
// picks per-lane which of the two RGBA values to output based on a
// per-channel MASK read from a uniform buffer:
//
//   mask = params.rgba   (uniform buffer at binding 7, i.e. `<4 x float>`)
//   perLane(i): mask.i > 0 ? texelB.i : texelA.i
//
// So a mask channel > 0 selects texture1, otherwise texture0 — for each
// of R/G/B/A independently.  Common use: mixing "which source contributes
// this channel" for mattes / channel-swap operations.
//
// GATE NOTE: fast-math (reassoc/afn/no-signed-zeros/unsafe-fp-math);
// plain JS float ops with Math.fround at fp32 boundaries.  No pow / no
// fp32-narrowed double literals — the only numeric literal in the IR is
// the exact fp32 value 0.5 in `<0.5, 0.5>` used for the pixel-centre bias.

/**
 * A sample callback for texture reads.  The Metal shader samples through
 * a caller-supplied sampler (linear/clamp per Helium's usual filter setup);
 * from the JS port's perspective it's a UV → RGBA function.
 * @shader Hgc2ChannelCopy (Helium) IR %13/%18
 */
export type TextureSample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Hgc2ChannelCopy — per-channel mux between two textures.
 *
 * Signature (from .ll):
 *   (%0 vec4 position,       air.position (unused in body)
 *    %1 vec4 texcoord0,      per-vertex UV for texture0
 *    %2 vec4 texcoord1,      per-vertex UV for texture1
 *    %3 texture2d texture0,
 *    %4 texture2d texture1,
 *    %5 sampler sampler0,
 *    %6 sampler sampler1,
 *    %7 vec4* params buffer)  → mask
 *
 * Body:
 *   %9    : load params.rgba mask                                (float4)
 *   %10   : uv0 = texcoord0.xy                                   (shufflevector)
 *   %11   : uv0Floor = fast_floor(uv0)                           (v2 lane-parallel)
 *   %12   : uv0Snap  = uv0Floor + <0.5, 0.5>                     (pixel-centre)
 *   %13   : texelA = sample(texture0, sampler0, uv0Snap)         (rgba+i8 residency)
 *   %14   : texelA = extractvalue lane 0                         (drop residency)
 *   %15..%17: same recipe for texcoord1/texture1 → texelB
 *   %18   : texelB
 *   %19   : mask > 0 (per lane)                                  (fcmp ogt)
 *   %20/%21: select per lane: mask>0 ? texelB : texelA
 *   ret   : blended vec4
 *
 * @shader Hgc2ChannelCopy (Helium) IR %9..%21
 */
export function Hgc2ChannelCopy(
  _position: [number, number, number, number],
  texcoord0: [number, number, number, number],
  texcoord1: [number, number, number, number],
  sampleTexture0: TextureSample2D,
  sampleTexture1: TextureSample2D,
  params: [number, number, number, number],
): [number, number, number, number] {
  // %9 : mask uniform buffer read.
  const mask = params;

  // %10..%12 : snap UV for texture0 to nearest pixel-centre.
  const uv0x = Math.fround(texcoord0[0]);
  const uv0y = Math.fround(texcoord0[1]);
  const uv0Snap: [number, number] = [
    Math.fround(Math.floor(uv0x) + 0.5),
    Math.fround(Math.floor(uv0y) + 0.5),
  ];
  // %13..%14 : sample texture0; drop residency i8 lane.
  const texelA = sampleTexture0(uv0Snap);

  // %15..%17 : same recipe for texture1.
  const uv1x = Math.fround(texcoord1[0]);
  const uv1y = Math.fround(texcoord1[1]);
  const uv1Snap: [number, number] = [
    Math.fround(Math.floor(uv1x) + 0.5),
    Math.fround(Math.floor(uv1y) + 0.5),
  ];
  // %18 : sample texture1.
  const texelB = sampleTexture1(uv1Snap);

  // %19..%21 : per-lane select on mask > 0.
  //   The .ll uses `fcmp fast ogt <4 x float> %9, zeroinitializer`, i.e.
  //   an ordered-greater-than-zero test per channel.  `fast` means
  //   NaN-behaviour is unspecified; we mirror ogt (returns false for NaN,
  //   which is JavaScript's default > semantic).
  const r = mask[0] > 0 ? texelB[0] : texelA[0];
  const g = mask[1] > 0 ? texelB[1] : texelA[1];
  const b = mask[2] > 0 ? texelB[2] : texelA[2];
  const a = mask[3] > 0 ? texelB[3] : texelA[3];
  return [Math.fround(r), Math.fround(g), Math.fround(b), Math.fround(a)];
}
