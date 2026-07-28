// @shader flipYFragmentFunc (Lithium)
//
// Trivial texture-passthrough fragment shader from Lithium's
// `LiSolidShaders.metallib`. It samples `inputtex` at the fragment's uv
// and returns the sampled RGBA verbatim.
//
// The "flipY" in the shader's name refers to the vertex-side inversion
// of the y coordinate — this fragment does nothing more than a straight
// sample, mirroring the trivial vertex-passthrough family already ported
// (blit_tex_fragment_shader, blurFragmentFunc, cocFragmentFunc, ...).
//
// Source LLVM IR: raw-port/re/shaders/flipYFragmentFunc.ll
// Extracted from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib
// (via `bash raw-port/tools/shader_disasm.sh flipYFragmentFunc Lithium`) —
// entry point @0x0000000001ced9.
//
// AIR signature (from !air.fragment !15..!21):
//   define <{ <4 x float> }> @flipYFragmentFunc(
//     <4 x float> %0,       ; air.position position (unused — !19 air.arg_unused)
//     <2 x float> %1,       ; air.fragment_input uv (generated from vertex out)
//     texture2d<float, sample> %2)   ; air.texture inputtex (location 0)
//
// Sampler is inlined via metadata !22 pointing at
// `@__air_sampler_state.2` — a constant sampler_state whose i64 encoding
// is `34901797601020489` (Lithium's default "clamp-to-edge / linear"
// bindings). From JS the sampler is folded into the `sample` callback.
//
// Function attributes: `fast_math_enable` (!13) — fast-math is ON here,
// but the only fp op is the sample itself; every fp value we handle is
// stored to a `<4 x float>` return slot, so Math.fround preserves f32
// fidelity end-to-end.
//
// IR line map:
//   %4 = call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(
//           texture %2, sampler bit-cast(@__air_sampler_state.2),
//           <2 x float> %1, i1 true, <2 x i32> zero, i1 false,
//           float 0.0, float 0.0, i32 0)
//         -> sample(inputtex, uv)  (returns float4 texel + residency byte)
//   %5 = extractvalue { <4 x float>, i8 } %4, 0     ; drop residency i8
//   %6 = insertvalue <{ <4 x float> }> undef, <4 x float> %5, 0
//   ret <{ <4 x float> }> %6

/**
 * Callback that samples a 2D texture at a uv (fp32 pair) and returns the
 * sampled RGBA as four fp32 lanes. Faithfully models AIR's
 * `air.sample_texture_2d.v4f32` call at `%4`.
 */
export type SampleTexture2D = (
  tex: unknown,
  uv: readonly [number, number],
) => readonly [number, number, number, number];

/**
 * flipYFragmentFunc — sample `inputtex` at `uv`, return the texel.
 *
 * @param _position   fragment position (unused per !19 `air.arg_unused`)
 * @param uv          fragment_input uv (!20 — the vertex-stage-flipped uv)
 * @param inputtex    texture2d<float, sample> — !21 "inputtex"
 * @param sample      texture-sampler callback (models !22's inlined sampler)
 * @returns RGBA float4 — exactly the texel at `uv`.
 */
export function flipYFragmentFunc(
  _position: readonly [number, number, number, number],
  uv: readonly [number, number],
  inputtex: unknown,
  sample: SampleTexture2D,
): [number, number, number, number] {
  // %4 = air.sample_texture_2d.v4f32(inputtex, __air_sampler_state.2, uv, ...)
  // %5 = extractvalue %4, 0
  const texel = sample(inputtex, uv);
  // %6 = insertvalue <{ <4 x float> }> undef, %5, 0  ;  ret %6
  // The struct wrapper is transparent — we return the four float lanes.
  return [
    Math.fround(texel[0]),
    Math.fround(texel[1]),
    Math.fround(texel[2]),
    Math.fround(texel[3]),
  ];
}
