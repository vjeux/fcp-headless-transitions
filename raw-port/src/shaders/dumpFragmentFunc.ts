// @shader dumpFragmentFunc (Lithium)
// @0x000000000161d9 — Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib
//
// Fragment shader that samples a single texture2d<float, sample> at the
// fragment texcoord and returns its `.rgb` with alpha forced to 1.0.
//
// Source LLVM IR: raw-port/re/shaders/dumpFragmentFunc.ll (extracted by
// `bash raw-port/tools/shader_disasm.sh dumpFragmentFunc Lithium`).
//
// AIR signature (from air.fragment metadata !15 and !18..!22):
//   define <4 x float> @dumpFragmentFunc(
//     <4 x float> %0,   ; air.position   position    (unused, air.arg_unused per !19)
//     <2 x float> %1,   ; air.fragment_input uv
//     texture2d<float, sample> %2         ; air.texture tex, location 0
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable` — the shader compiles under Metal fast-math.
// This port uses plain JS Number arithmetic (IEEE-754 fp64) narrowed with
// Math.fround for each fp32-typed value, preserving f32 fidelity.
//
// AIR sampler state: @__air_sampler_state.3 = [i64 34901797601017929, i64 0].
// The two 64-bit words are the Metal MTLSamplerDescriptor bits. Note the
// value differs from sibling shaders in this metallib (e.g. ccFragmentFunc
// uses 34901797601036873); this reflects a different sampler configuration
// (likely mipmap/filter differences). The runtime resolves this to a real
// Metal sampler_state. From JS we abstract sampling via a `sample(tex, uv)`
// callback that returns four fp32 channels — matching the AIR return of
// `air.sample_texture_2d.v4f32`.
//
// IR line map:
//   %4 = call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(
//          texture %2, sampler bitcast(@__air_sampler_state.3),
//          <2xfloat> %1, i1 true, <2xi32> zero, i1 false,
//          float 0.0, float 0.0, i32 0)
//        -> sample(tex, uv)   (returns float4 texel + residency byte)
//   %5 = extractvalue { <4 x float>, i8 } %4, 0
//        -> texel = %4[0]   (drop the residency i8)
//   %6 = insertelement <4 x float> %5, float 1.000000e+00, i64 3
//        -> texel with lane 3 (alpha) replaced by exactly 1.0
//   ret <4 x float> %6

/**
 * Callback modelling AIR `%4 = @air.sample_texture_2d.v4f32(...)`.
 * `tex` is an opaque texture handle and `uv` is the two-component sample
 * coordinate. Returns the four fp32 texel channels.
 */
export type SampleTexture2D = (
  tex: unknown,
  uv: readonly [number, number],
) => readonly [number, number, number, number];

/**
 * dumpFragmentFunc — sample `tex` at `uv`, keep .rgb, and override alpha to 1.0.
 *
 * @param position fragment position vec4 — declared air.arg_unused per !19.
 *                 We accept it for signature fidelity but do not read it.
 * @param uv       fragment texcoord vec2 (the `<2 x float> %1` input).
 * @param tex      opaque texture handle (the `%2` argument, texture2d<float, sample>).
 * @param sample   the AIR sample_texture_2d callback (see SampleTexture2D).
 * @returns        fp32 vec4 with the texel's RGB and alpha forced to 1.0.
 */
export function dumpFragmentFunc(
  position: readonly [number, number, number, number],
  uv: readonly [number, number],
  tex: unknown,
  sample: SampleTexture2D,
): [number, number, number, number] {
  // %0 is declared air.arg_unused in !19 — kept in the signature for API
  // fidelity but never read by the function body.
  void position;

  // %4 = air.sample_texture_2d.v4f32(tex, sampler_state, uv, ...)
  // %5 = extractvalue ..., 0    (drop the residency byte)
  const texel = sample(tex, uv);

  // %6 = insertelement <4 x float> %5, float 1.000000e+00, i64 3
  // Lane 3 replaced by the constant 1.0.
  return [
    Math.fround(texel[0]),
    Math.fround(texel[1]),
    Math.fround(texel[2]),
    Math.fround(1.0),
  ];
}
