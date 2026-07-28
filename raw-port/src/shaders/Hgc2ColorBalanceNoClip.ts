// Faithful transcription @0x00000000004b80 — @shader Hgc2ColorBalanceNoClip (ProAppsFxSupport)
//
// Metal fragment shader from ProAppsFxSupport's HgcRender pixel-math library.
// This is the "NoClip" variant of Helium's color-balance node — it applies
// a signed-magnitude gamma to a scalar tint value derived from the sampled
// alpha and lerps the RGB channels of the texel toward that tint by `mix`.
//
// The IR is unambiguous: the two `gain` and `alpha` broadcasts both go
// through single-lane insertelement + splat, so the intermediate value
// `s = 2 * gain * alpha` is a SCALAR (all four lanes carry the same
// number). The signed-magnitude gamma is then computed once (all three
// RGB lanes are identical) and lane-3 (alpha) is left un-gamma'd.
//
// Source LLVM IR: raw-port/re/shaders/Hgc2ColorBalanceNoClip.ll
// Extracted from: ProAppsFxSupport.framework/Versions/A/Resources/
//                   ProAppsFxSupportHgcMetalShaders_derived.metallib
// (via `bash raw-port/tools/shader_disasm.sh Hgc2ColorBalanceNoClip
//        ProAppsFxSupport`)
//
// AIR signature (from the .ll, `!air.fragment !15`):
//   define <4 x float> @Hgc2ColorBalanceNoClip(
//     <4 x float> %0,     // position   (unused)
//     <4 x float> %1,     // texcoord0  (.xy is sample uv)
//     <4 x float> %2..%9, // texcoord1..7 + primary color (all unused)
//     float*      %10,    // params (constant-address-space float buffer)
//     texture2d   %11,    // texture0
//     sampler     %12     // sampler0
//   )
//
// Function attributes: `unsafe-fp-math`, `no-signed-zeros-fp-math`,
// `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`. `no-nans-fp-math`/`no-infs-fp-math`
// are "false" here — same policy as the sibling Hgc2Gamma port. This
// port uses plain JS Number arithmetic (already IEEE-754 fp64) narrowed
// with Math.fround at every stored intermediate for f32 fidelity.
//
// Params layout, decoded from the .ll:
//   params is a `float*` (NOT float4*) — the IR indexes by scalar
//   `getelementptr inbounds float, ..., i64 <k>`, reading three scalars:
//     params[1] = gain   (loaded at %14/%15)
//     params[2] = gamma  (loaded at %17/%18)
//     params[3] = mix    (loaded at %20/%21)
//   params[0] is not referenced by this shader — the CPU-side builder
//   may pack a fourth constant there for other variants (Clip vs NoClip
//   share the same buffer layout in Hgc), but this NoClip variant simply
//   skips it. We take the buffer as a 4-element tuple to mirror the
//   CPU layout while only reading lanes 1..3.
//
// IR line map (from the .ll body):
//   %14/%15  load float from params[1]                     -> gain
//   %16      insertelement poison, gain, 0                 -> [gain, ?, ?, ?]
//   %17/%18  load float from params[2]                     -> gamma
//   %19      insertelement poison, gamma, 0                -> [gamma, ?, ?, ?]
//   %20/%21  load float from params[3]                     -> mix
//   %22      insertelement poison, mix, 0                  -> [mix, ?, ?, ?]
//   %23      shufflevector %22, poison, <0,0,0,0>          -> mixV = [mix]*4
//   %24      shufflevector texcoord0, poison, <0,1>        -> uv = (uvX, uvY)
//   %25/%26  air.sample_texture_2d.v4f32(...)              -> texel (signed RGBA)
//   %27      shufflevector %26, undef, <3,3,3,3>           -> alphaSplat = [A]*4
//   %28      fmul fast %16, <2.0, poison, poison, poison>  -> lane0 = 2*gain
//   %29      shufflevector %28, poison, <0,0,0,0>          -> gain2V = [2*gain]*4
//   %30      fmul fast %29, %27                            -> s4 = [2*gain*A]*4
//                                                          (all 4 lanes carry the
//                                                          same scalar s = 2*gain*A)
//   %31      air.fast_fabs.v4f32(%30)                      -> |s|4 (all lanes |s|)
//   %32      shufflevector %31, poison, <0,1,2>            -> [|s|,|s|,|s|]
//   %33      shufflevector %19, poison, <0,0,0>            -> gammaV3 = [gamma]*3
//   %34      air.fast_pow.v3f32(%32, %33)                  -> pow3 = [pow(|s|,gamma)]*3
//                                                          (same value all 3 lanes)
//   %35      fneg fast %34                                 -> -pow3
//   %36      shufflevector %30, poison, <0,1,2>            -> s3 = [s,s,s]
//   %37      fcmp fast olt %36, zeroinitializer            -> mask = (s < 0) in each lane
//                                                          (identical across lanes)
//   %38      select %37, %35, %34                          -> signedPow3 =
//                                                            [sign(s)*pow(|s|,gamma)]*3
//   %39      shufflevector %38, poison, <0,1,2,undef>      -> [sp,sp,sp,?]
//   %40      shufflevector %39, %30, <0,1,2,7>             -> tint4 = [sp,sp,sp,s]
//                                                          (lane 3 pulls %30[3]=s, i.e.
//                                                          2*gain*A un-gamma'd)
//   %41      fsub fast %40, %26                            -> delta = tint4 - texel
//   %42      fmul fast %41, %23                            -> weighted = mix * delta
//   %43      fadd fast %42, %26                            -> result = texel + mix*delta
//   ret      <4 x float> %43

/**
 * The RGBA texel produced by sampling `texture0` at `uv` — modeled as a
 * length-4 tuple of f32 lanes. Also the return type of this shader.
 */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f32(tex, sampler, uv, ...)` intrinsic. This
 * shader's sample call has `enable_offset=true` (immediate `i1 true`
 * arg) with a zero `<2 x i32>` offset, no LOD (`min_lod=0, lod=0`),
 * `sampler_flags=0`. All of those degenerate to a plain sampled fetch,
 * so the callback signature strips them for clarity.
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * Params buffer for `@Hgc2ColorBalanceNoClip`, four f32 lanes.
 *
 * The `.ll` reads scalars at indices 1, 2, 3 (see file header for the
 * exact `getelementptr` chain). Lane 0 is present in the underlying
 * float* buffer but is not referenced by this NoClip variant.
 *
 * Lane order:
 *   0: unused by this shader (present for CPU-side buffer alignment)
 *   1: gain   — RGB tint gain; the shader forms `s = 2*gain*alpha`
 *              as its per-pixel scalar tint before gamma.
 *   2: gamma  — signed-magnitude gamma exponent applied to |s|.
 *   3: mix    — lerp weight blending the tinted result toward the
 *              original texel.
 */
export type Hgc2ColorBalanceNoClipParams = readonly [
  number,
  number,
  number,
  number,
];

/**
 * `@Hgc2ColorBalanceNoClip` — ProAppsFxSupport Metal fragment shader.
 *
 * Faithful transcription of the .ll body. Every op mirrors an IR line
 * (see file header for the map). The RGB tint value `s = 2*gain*alpha`
 * is a SCALAR by construction of the IR (single-lane inserts + splat),
 * so all three RGB output lanes carry the same signed-magnitude gamma
 * of `s` before the mix-lerp toward the original texel. Lane 3 (alpha)
 * uses `s` directly (un-gamma'd), which lerps the texel's alpha toward
 * `2*gain*alpha` by `mix`.
 *
 * Under fast-math the compiler is allowed to reassociate; ordered `<`
 * in JS matches AIR `fcmp olt` for both NaN (false) and -0 (false,
 * since `-0 < 0` is false in IEEE-754). The shader is therefore a
 * signed-magnitude tint: negative inputs keep their sign after the
 * pow, and -0 inputs are treated as non-negative.
 *
 * @param position   fragment position (unused)
 * @param texcoord0  texture coordinate — .xy is the sample uv
 * @param texture0   opaque texture handle passed straight to `sample`
 * @param params     4-lane params buffer (see Hgc2ColorBalanceNoClipParams);
 *                   only lanes 1..3 are read
 * @param sample     caller-supplied texture-sampling callback modeling
 *                   `air.sample_texture_2d.v4f32`
 * @returns          mixed RGBA texel (texel + mix*(tint - texel))
 */
export function Hgc2ColorBalanceNoClip(
  _position: readonly [number, number, number, number],
  texcoord0: readonly [number, number, number, number],
  texture0: unknown,
  params: Hgc2ColorBalanceNoClipParams,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %14/%15  load params[1] -> gain
  // %17/%18  load params[2] -> gamma
  // %20/%21  load params[3] -> mix
  const gain: number = Math.fround(params[1]);
  const gamma: number = Math.fround(params[2]);
  const mix: number = Math.fround(params[3]);

  // %24 = shufflevector texcoord0, poison, <0,1>
  const uv: [number, number] = [
    Math.fround(texcoord0[0]),
    Math.fround(texcoord0[1]),
  ];
  // %25/%26 = air.sample_texture_2d.v4f32(tex, sampler, uv, ...)
  const texel: ShaderTexel = sample(texture0, uv);
  const tR: number = Math.fround(texel[0]);
  const tG: number = Math.fround(texel[1]);
  const tB: number = Math.fround(texel[2]);
  const tA: number = Math.fround(texel[3]);

  // %27 = shufflevector texel, undef, <3,3,3,3>      -> [A, A, A, A]
  // %28 = fmul <4> {gain,poison,poison,poison}, <2.0, poison, poison, poison>
  //         -> lane 0 = gain*2
  // %29 = splat lane 0                                -> [2*gain]*4
  // %30 = %29 * %27                                   -> [2*gain*A]*4
  //
  // The IR produces a SCALAR `s` broadcast across all lanes: single-lane
  // insertelement + <0,0,0,0> splat + splat*splat is a full 4-lane
  // broadcast of the scalar product. Compute it once here.
  const s: number = Math.fround(Math.fround(2 * gain) * tA);

  // %31 = air.fast_fabs.v4f32(%30)                    -> |s| (all 4 lanes)
  // Math.abs on an f32-narrowed value is bit-exact for f32.
  const absS: number = Math.fround(Math.abs(s));

  // %32 = shufflevector %31, poison, <0,1,2>          -> [|s|, |s|, |s|]
  // %33 = shufflevector %19, poison, <0,0,0>          -> [gamma, gamma, gamma]
  // %34 = air.fast_pow.v3f32(%32, %33)
  //   Repo-canonical mapping for air.fast_pow.f32 is Math.fround(Math.pow).
  //   The three lanes are computationally identical, so a single scalar
  //   suffices — the RGB output lanes below all reuse it.
  const powS: number = Math.fround(Math.pow(absS, gamma));

  // %35 = fneg fast %34                               -> -powS
  // %36 = shufflevector %30, poison, <0,1,2>          -> [s, s, s]
  // %37 = fcmp fast olt %36, zeroinitializer          -> (s < 0) per lane
  // %38 = select %37, %35, %34
  //   Ordered `<` in JS: `x < 0` is false for NaN (matches AIR `olt`).
  //   For -0 the compare `-0 < 0` is false (matches IEEE `olt`) — a -0
  //   input keeps the positive branch, so a -0 scalar tint yields
  //   +pow(|s|,gamma). Signed-magnitude gamma.
  const signedPow: number = s < 0 ? Math.fround(-powS) : powS;

  // %39 = shufflevector %38, poison, <0,1,2,undef>    -> [sp, sp, sp, ?]
  // %40 = shufflevector %39, %30, <0,1,2,7>           -> [sp, sp, sp, %30[3]=s]
  //   Lane 3 of the tint pulls the un-gamma'd scalar `s` (= 2*gain*A),
  //   so the alpha channel is lerped toward `s` — no signed gamma on
  //   alpha, matching the IR exactly.
  const tint_r: number = signedPow;
  const tint_g: number = signedPow;
  const tint_b: number = signedPow;
  const tint_a: number = s;

  // %41 = fsub fast %40, %26                          -> tint - texel
  const dR: number = Math.fround(tint_r - tR);
  const dG: number = Math.fround(tint_g - tG);
  const dB: number = Math.fround(tint_b - tB);
  const dA: number = Math.fround(tint_a - tA);

  // %42 = fmul fast %41, %23                          -> mix * delta
  const wR: number = Math.fround(dR * mix);
  const wG: number = Math.fround(dG * mix);
  const wB: number = Math.fround(dB * mix);
  const wA: number = Math.fround(dA * mix);

  // %43 = fadd fast %42, %26                          -> texel + mix*delta
  const outR: number = Math.fround(wR + tR);
  const outG: number = Math.fround(wG + tG);
  const outB: number = Math.fround(wB + tB);
  const outA: number = Math.fround(wA + tA);

  // ret <4 x float> %43
  return [outR, outG, outB, outA];
}
