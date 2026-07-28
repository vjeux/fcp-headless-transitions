// Faithful transcription @0x00000000009aeb
// @shader fragment_textured (MAVectorUIKit)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/fragment_textured.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// MAVectorUIKit.framework/Versions/A/Resources/default.metallib. The
// header line reads `0x00000000009aeb -- fragment_textured:` — the
// shader's entry offset in the metallib.
//
// Compile options in the .ll:
//   air.compile.denorms_disable, air.compile.fast_math_enable,
//   air.compile.framebuffer_fetch_enable
// The function attributes carry `approx-func-fp-math=true` and
// `unsafe-fp-math=true` — fast-math (reassoc/afn) flags; there is no
// arithmetic op in the body (just a passthrough texture sample) so
// fp32-narrowed Math.fround is a no-op on the returned rgba.
//
// Fragment signature (from !15..!22):
//   render target : float4 (color 0).
//   %0 : float4 position  — !19 air.no_perspective, marked air.arg_unused.
//   %1 : float2 texCoord  — !20 generated fragment input (perspective-correct).
//   %2 : texture2d<float, sample>  — !21 tex0 at location 0.
//   %3 : sampler                   — !22 sampler2D at location 0.
//
// Kernel body (single basic block, no branches):
//
//   %5 = air.sample_texture_2d.v4f32(tex0, sampler2D, texCoord, ...) -- LOD 0.
//   %6 = extractvalue { <4 x float>, i8 } %5, 0        -- rgba lanes only.
//   ret <4 x float> %6.
//
// (The `i8` residency byte from the sample tuple is dropped by
// `extractvalue ..., 0`.)
//
// AIR intrinsic used:
//   air.sample_texture_2d.v4f32                 -- 2D texture sample.

/** Callback for AIR `air.sample_texture_2d.v4f32`. */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Fragment shader `fragment_textured` — the simplest possible
 * textured passthrough: sample `tex0` at `texCoord` (via
 * `air.sample_texture_2d.v4f32`) and return the sampled rgba as
 * the render target color. The `position` fragment input is unused
 * (`air.arg_unused` on !19).
 *
 * @shader fragment_textured (MAVectorUIKit)
 */
export function fragment_textured<T>(
  _position: [number, number, number, number],
  texCoord: [number, number],
  tex0: T,
  sample: SampleFloatTex2D<T>,
): [number, number, number, number] {
  // %5 = air.sample_texture_2d.v4f32(tex0, sampler2D, texCoord, ...).
  //   No AIR arithmetic follows -- returned rgba passes through unchanged.
  const rgba = sample(tex0, texCoord[0], texCoord[1]);
  // %6 = extractvalue %5, 0 -- rgba lanes.
  // ret <4 x float> %6.
  return [rgba[0], rgba[1], rgba[2], rgba[3]];
}
