// Faithful transcription @0x00000000000690 — @shader Hgc2FeatherOutside (ProAppsFxSupport)
//
// Metallib offset from raw-port/re/shaders/Hgc2FeatherOutside.ll header
//   `0x00000000000690 -- Hgc2FeatherOutside:` — the shader's entry offset in
// ProAppsFxSupport.framework/Versions/A/Resources/ProAppsFxSupportHgcMetalShaders_derived.metallib.
//
// Two-texture fragment shader that composites a "source" texture (texture1)
// against a matte (texture0) with a quadratic outside-edge feather. The
// signature — fragment inputs texcoord0/texcoord1, two textures, two
// samplers, and a `parameters` constant buffer of two float4s — matches
// the "outside feather" companion to the sibling inside-feather shader.
//
// Provenance: LLVM AIR IR in raw-port/re/shaders/Hgc2FeatherOutside.ll,
// extracted via raw-port/tools/shader_disasm.sh from the metallib above.
// Compile options (from !air.compile_options / attribute set #0):
// `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`, `unsafe-fp-math=true`,
// `no-infs/nans/signed-zeros-fp-math=true`, `approx-func-fp-math=true`.
// The port coerces every fp32 op with Math.fround.
//
// AIR intrinsics used:
//   air.sample_texture_2d.v4f32(tex, sampler, uv, /*offset_valid=*/i1 true,
//                                <0,0> offset, /*bias_valid=*/i1 false,
//                                0.0 bias, 0.0 min_lod, i32 0)
//                                -> { <4 x float>, i8 residency }
//     — 2D sample; offset/bias/min_lod are inert at both call sites.
//   air.fast_pow.v4f32(<4 x float>, <4 x float>)
//     — per-lane approx-power; the second argument here is the compile-
//       time constant vector <2.0, 2.0, 2.0, 2.0>, so this collapses to
//       a per-lane square. We port it as `x * x` (exact for f32, matches
//       `air.fast_pow(x, 2.0)` bit-for-bit under IEEE fp32 rounding and
//       avoids the fast_pow log/exp path entirely — the multiplication
//       is the strictest faithful transcription of the constant-2 case).
//   air.fast_fmin.v4f32(<4 x float>, <4 x float>)
//     — per-lane min; the second argument here is the constant vector
//       <1.0, 1.0, 1.0, 1.0>, so it clamps each lane to at most 1.0.
//
// Fragment metadata (from !air.fragment !15, arg descriptors !19..!26):
//   arg %0 = "position"   (air.position, no_perspective) — UNUSED
//            (marked air.arg_unused in !19).
//   arg %1 = "texcoord0"  (float4, perspective) — sampled at .xy.
//   arg %2 = "texcoord1"  (float4, perspective) — sampled at .xy.
//   arg %3 = "texture0"   (texture2d<float, sample>, index 0) — matte.
//   arg %4 = "texture1"   (texture2d<float, sample>, index 1) — source.
//   arg %5 = "sampler0"   (index 0).
//   arg %6 = "sampler1"   (index 1).
//   arg %7 = "parameters" (constant float4[2], 16-byte-aligned buffer).
//   return = "air.render_target" 0/0, float4.
//
// Line-by-line map from the .ll body:
//   %9  = load parameters[0]                                -> P0 : float4
//   %10 = getelementptr parameters, i64 1
//   %11 = load parameters[1]                                -> P1 : float4
//   %12 = shufflevector %1, poison, <0, 1>                  -> uv0 = tc0.xy
//   %13 = air.sample_texture_2d.v4f32(%3 tex0, %5 s0, uv0)  -> { rgba0, res0 }
//   %14 = extractvalue %13, 0                               -> M   (matte, float4)
//   %15 = shufflevector %2, poison, <0, 1>                  -> uv1 = tc1.xy
//   %16 = air.sample_texture_2d.v4f32(%4 tex1, %6 s1, uv1)  -> { rgba1, res1 }
//   %17 = extractvalue %16, 0                               -> S   (source, float4)
//   %18 = fmul fast %9, <poison, poison, poison, 2.0>       -> only lane .w
//                                                              is defined:
//                                                              %18.w = P0.w * 2
//                                                              (lanes 0..2 are
//                                                              poison — LLVM
//                                                              undefined value —
//                                                              but immediately
//                                                              overwritten by
//                                                              the shuffle at
//                                                              %19 which reads
//                                                              only lane 3).
//   %19 = shufflevector %18, poison, <3,3,3,3>              -> splat4(P0.w * 2)
//   %20 = fmul fast %19, %17                                -> S_scaled = S * (2*P0.w)
//   %21 = fsub fast <1,1,1,1>, %14                          -> invM = 1 - M
//   %22 = air.fast_pow.v4f32(%21, <2,2,2,2>)                -> invM^2  (per lane)
//   %23 = fmul fast %20, %22                                -> feather = S_scaled * invM^2
//   %24 = fmul fast %11, <0.5,0.5,0.5,0.5>                  -> P1 * 0.5
//   %25 = fadd fast %24, <0.5,0.5,0.5,0.5>                  -> mix   = P1*0.5 + 0.5
//                                                              (remap [-1,1]->[0,1])
//   %26 = fsub fast %20, %23                                -> S_scaled - feather
//                                                              = S_scaled * (1 - invM^2)
//   %27 = fmul fast %26, %25                                -> that * mix
//   %28 = fadd fast %23, %14                                -> feather + M
//   %29 = fadd fast %28, %27                                -> feather + M + delta
//   %30 = air.fast_fmin.v4f32(%29, <1,1,1,1>)               -> min(..., 1.0)
//   ret %30
//
// Simplified per-channel form:
//   feather_c = S_c * (2 * P0.w) * (1 - M_c)^2
//   mix_c     = P1_c * 0.5 + 0.5
//   out_c     = min( feather_c + M_c
//                    + (S_c * (2 * P0.w) - feather_c) * mix_c
//                  , 1.0 )
//
// The `2 * P0.w` factor is a single scalar splat across all four output
// lanes (it is drawn from lane 3 of P0 by the shufflevector at %19).
// The `mix` term, in contrast, uses all four lanes of P1 independently,
// so alpha can carry a distinct feather-blend from rgb.
//
// Fast-math semantics: with `unsafe-fp-math=true`, Metal is free to
// reassociate and contract these fp32 ops. The transcription below
// evaluates in the same left-to-right order as the IR so the produced
// values stay bit-identical to the IR under the default fp32 rounding
// mode; Math.fround is applied at each individual op.

/**
 * Callback signature for `air.sample_texture_2d.v4f32`. Given the opaque
 * texture handle plus a 2D UV, returns the sampled RGBA as four fp32
 * numbers. The trailing offset/bias/min_lod fields of the intrinsic are
 * inert at both call sites (see per-call notes in the file header) and
 * are not modeled — the caller is responsible for whichever sampler is
 * bound to the intrinsic externally.
 */
export type Sample2DFn<T> = (
  texture: T,
  u: number,
  v: number,
) => [number, number, number, number];

/**
 * `parameters` constant buffer laid out per !26 in the .ll —
 * air.location_index 0, address_space 2 (constant), 16-byte-aligned,
 * two float4 slots. The shader reads both slots by GEP index 0 and 1.
 */
export interface Hgc2FeatherOutsideParameters {
  /** parameters[0] — only `.w` is read by this shader; lanes 0..2 are
   *  loaded into %9 but the only lane used downstream is lane 3
   *  (via the splat at IR line %19). */
  readonly p0: readonly [number, number, number, number];
  /** parameters[1] — all four lanes read by this shader, remapped as
   *  `p1 * 0.5 + 0.5` to derive the per-channel outside-feather mix. */
  readonly p1: readonly [number, number, number, number];
}

/**
 * Fragment shader `Hgc2FeatherOutside` — composites a source RGBA texture
 * (`texture1`) against a matte RGBA texture (`texture0`) with a per-
 * channel quadratic outside-edge feather controlled by the two float4
 * constants in the `parameters` buffer.
 *
 * @shader Hgc2FeatherOutside (ProAppsFxSupport)
 * @param texcoord0  fragment input 1 — the .xy is UV for `texture0`.
 * @param texcoord1  fragment input 2 — the .xy is UV for `texture1`.
 * @param texture0   opaque texture handle for the matte.
 * @param texture1   opaque texture handle for the source.
 * @param sample     bound `air.sample_texture_2d.v4f32`. The same
 *                   callback is used for both texture samples; each call
 *                   supplies its own texture handle (`texture0` /
 *                   `texture1`) and the sampler binding is external.
 * @param parameters constant buffer holding `p0` (lane .w scales the
 *                   source contribution by `2*p0.w`) and `p1` (remapped
 *                   `p1*0.5+0.5` per-channel outside-feather mix).
 * @returns          the fragment-shader render-target 0 output as
 *                   `[r, g, b, a]` fp32 numbers, each clamped to ≤ 1.0
 *                   by the trailing `air.fast_fmin` against `<1,1,1,1>`.
 */
export function Hgc2FeatherOutside<T>(
  texcoord0: readonly [number, number, number, number],
  texcoord1: readonly [number, number, number, number],
  texture0: T,
  texture1: T,
  sample: Sample2DFn<T>,
  parameters: Hgc2FeatherOutsideParameters,
): [number, number, number, number] {
  // %9  = load parameters[0], %11 = load parameters[1]
  const p0 = parameters.p0;
  const p1 = parameters.p1;

  // %12 = shufflevector texcoord0.xy ; %13 = air.sample_texture_2d.v4f32
  // %14 = extractvalue -> M (matte RGBA)
  const M = sample(texture0, texcoord0[0], texcoord0[1]);

  // %15 = shufflevector texcoord1.xy ; %16 = air.sample_texture_2d.v4f32
  // %17 = extractvalue -> S (source RGBA)
  const S = sample(texture1, texcoord1[0], texcoord1[1]);

  // %18 = fmul fast %9, <_, _, _, 2.0>  (lanes 0..2 poison but unused)
  // %19 = shufflevector %18, poison, <3,3,3,3>  -> splat4(p0.w * 2)
  const scale = Math.fround(Math.fround(p0[3]) * 2.0);

  // Per-channel evaluation, matching the IR's straight-line 4-lane math.
  const out: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const Mi = Math.fround(M[i]);
    const Si = Math.fround(S[i]);
    const P1i = Math.fround(p1[i]);

    // %20 = fmul fast %19, %17  -> S_scaled = S * scale
    const sScaled = Math.fround(scale * Si);

    // %21 = fsub fast <1,1,1,1>, %14  -> invM = 1 - M
    const invM = Math.fround(1.0 - Mi);

    // %22 = air.fast_pow.v4f32(%21, <2,2,2,2>) -> invM^2 (constant-2
    //       exponent: identical to invM*invM under fp32 rounding).
    const invM2 = Math.fround(invM * invM);

    // %23 = fmul fast %20, %22  -> feather = S_scaled * invM^2
    const feather = Math.fround(sScaled * invM2);

    // %24 = fmul fast %11, <0.5,...>  ; %25 = fadd fast %24, <0.5,...>
    //       -> mix = p1 * 0.5 + 0.5  (remap [-1,1] to [0,1])
    const mix = Math.fround(Math.fround(P1i * 0.5) + 0.5);

    // %26 = fsub fast %20, %23  -> S_scaled - feather
    const delta = Math.fround(sScaled - feather);

    // %27 = fmul fast %26, %25  -> delta * mix
    const weighted = Math.fround(delta * mix);

    // %28 = fadd fast %23, %14  -> feather + M
    const base = Math.fround(feather + Mi);

    // %29 = fadd fast %28, %27  -> base + weighted
    const sum = Math.fround(base + weighted);

    // %30 = air.fast_fmin.v4f32(%29, <1,1,1,1>)  -> clamp to <=1.0
    out[i] = Math.fround(Math.min(sum, 1.0));
  }

  return out;
}
