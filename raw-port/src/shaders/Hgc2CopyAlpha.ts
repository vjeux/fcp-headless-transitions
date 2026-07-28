// @shader Hgc2CopyAlpha (Flexo) @0x0000000000004a0
//
// Metallib offset from raw-port/re/shaders/Hgc2CopyAlpha.ll header line
//   `0x000000000004a0 -- Hgc2CopyAlpha:` — the shader\'s entry offset in
// Flexo.framework/Versions/A/Resources/FlexoHgcMetalShaders_derived.metallib.
//
//
// Two-texture fragment shader that outputs the RGB channels from texture0
// combined with the ALPHA channel from texture1:
//
//     rgb = texture0.sample(sampler0, texcoord0.xy).rgb
//     a   = texture1.sample(sampler1, texcoord1.xy).a
//     return (rgb, a)
//
// Provenance: LLVM AIR IR in raw-port/re/shaders/Hgc2CopyAlpha.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// Flexo.framework/Versions/A/Resources/FlexoHgcMetalShaders_derived.metallib.
// Compile options in the .ll: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`, `air.compile.framebuffer_fetch_enable`;
// function attribute set #0 also carries `unsafe-fp-math=true`,
// `no-infs/nans/signed-zeros-fp-math=true`, `approx-func-fp-math=true`.
// This shader performs NO arithmetic — only two texture samples and a
// four-lane shuffle — so no floating-point relaxation impacts the port.
//
// AIR intrinsic used:
//   air.sample_texture_2d.v4f32(tex, sampler, uv, /*offset_valid=*/i1 true,
//                                <0,0> offset, /*bias_valid=*/i1 false,
//                                float 0.0 bias, float 0.0 min_lod, i32 0
//                                sampler_bias) -> {<4 x float>, i8}
//     — 2D texture sample; the trailing offset/bias/min_lod arguments are
//     all inert at both call sites (offset=0,0; bias/min_lod flags
//     disabled) so the JS `sample(texture, u, v)` callback need not
//     model them. Modeled per raw-port/army/SHADERS.md.
//
// Fragment metadata (from !air.fragment, !15..!25 in the .ll):
//   arg %0 = "position" (air.position, no_perspective) — UNUSED
//            (marked air.arg_unused in metadata !19).
//   arg %1 = "texcoord0" (float4, perspective) — sampled at .xy.
//   arg %2 = "texcoord1" (float4, perspective) — sampled at .xy.
//   arg %3 = "texture0" (texture2d<float, sample>, index 0).
//   arg %4 = "texture1" (texture2d<float, sample>, index 1).
//   arg %5 = "sampler0" (index 0).
//   arg %6 = "sampler1" (index 1).
//   return = "air.render_target" 0/0, float4.
//
// Line-by-line map from the .ll body:
//   %8  = shufflevector <4 x float> %1, poison, <2 x i32> <0, 1>
//         -> uv0 = [texcoord0[0], texcoord0[1]]
//   %9  = air.sample_texture_2d.v4f32(%3 texture0, %5 sampler0, %8 uv0, ...)
//         -> { rgba0, residency0 }
//   %10 = extractvalue %9, 0                              -> rgba0
//   %11 = shufflevector <4 x float> %2, poison, <2 x i32> <0, 1>
//         -> uv1 = [texcoord1[0], texcoord1[1]]
//   %12 = air.sample_texture_2d.v4f32(%4 texture1, %6 sampler1, %11 uv1, ...)
//         -> { rgba1, residency1 }
//   %13 = extractvalue %12, 0                             -> rgba1
//   %14 = shufflevector <4 x float> %10, <4 x float> %13, <4 x i32> <0,1,2,7>
//         -> [rgba0[0], rgba0[1], rgba0[2], rgba1[3]]
//         (LLVM shufflevector: lane indices 0..3 index the FIRST vector,
//          lanes 4..7 index the SECOND vector at index-minus-4. So lane
//          index 7 pulls rgba1[7-4] = rgba1[3] = tex1 alpha.)
//   ret %14

/**
 * Callback signature for AIR `air.sample_texture_2d.v4f32` — the caller
 * supplies a function that, given the opaque texture handle plus a 2D UV,
 * returns the sampled RGBA as four f32-valued numbers. The trailing
 * offset/bias/min_lod parameters in the intrinsic are inert here (see the
 * per-call comments in the file header) and are not modeled.
 */
export type Sample2DFn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Fragment shader `Hgc2CopyAlpha` — samples texture0 at texcoord0.xy and
 * texture1 at texcoord1.xy, then returns the RGB channels from texture0
 * with the alpha channel replaced by texture1's alpha.
 *
 * @shader Hgc2CopyAlpha (Flexo)
 * @param texcoord0 The .xy is the sample UV for texture0.
 * @param texcoord1 The .xy is the sample UV for texture1.
 * @param texture0  Opaque texture handle for texture0.
 * @param texture1  Opaque texture handle for texture1.
 * @param sample    Bound `air.sample_texture_2d.v4f32` — see IR lines
 *                  %9 and %12; the same callback is used for both texture
 *                  samples (each supplies its own sampler externally).
 * @returns         [tex0.r, tex0.g, tex0.b, tex1.a] as fp32 numbers.
 */
export function Hgc2CopyAlpha<T>(
  texcoord0: [number, number, number, number],
  texcoord1: [number, number, number, number],
  texture0: T,
  texture1: T,
  sample: Sample2DFn<T>,
): [number, number, number, number] {
  // %8 = shufflevector %1, poison, <0, 1> — take texcoord0.xy.
  const u0 = texcoord0[0];
  const v0 = texcoord0[1];

  // %9 = air.sample_texture_2d.v4f32(texture0, sampler0, [u0,v0], ...)
  // %10 = extractvalue %9, 0 — RGBA payload from texture0.
  const rgba0 = sample(texture0, u0, v0);

  // %11 = shufflevector %2, poison, <0, 1> — take texcoord1.xy.
  const u1 = texcoord1[0];
  const v1 = texcoord1[1];

  // %12 = air.sample_texture_2d.v4f32(texture1, sampler1, [u1,v1], ...)
  // %13 = extractvalue %12, 0 — RGBA payload from texture1.
  const rgba1 = sample(texture1, u1, v1);

  // %14 = shufflevector %10, %13, <0,1,2,7> — RGB from rgba0, alpha from
  //       rgba1 (LLVM shufflevector lane index 7 = second-vector index 3).
  return [rgba0[0], rgba0[1], rgba0[2], rgba1[3]];
}
