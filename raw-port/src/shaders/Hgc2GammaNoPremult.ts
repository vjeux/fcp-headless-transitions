// @shader Hgc2GammaNoPremult (Helium) — .ll header offset @0x000000000058b2
//
// Metal fragment shader from Helium's HgcRender pixel-math library.
// A "no-premult" gamma variant of Hgc2Gamma: applies a per-channel gamma
// to the RGB lanes directly (no unpremultiply/re-premultiply divide) while
// still preserving the SIGN of every input channel. The alpha lane is
// passed through unchanged (as |A|, with sign restored).
//
// Source LLVM IR: raw-port/re/shaders/Hgc2GammaNoPremult.ll
// Extracted from: Helium.framework/Versions/A/Resources/
//                   HeliumRenderHgcMetalShaders_derived.metallib
// (via `bash raw-port/tools/shader_disasm.sh Hgc2GammaNoPremult Helium`)
//
// AIR signature (from the .ll):
//   define <4 x float> @Hgc2GammaNoPremult(
//     <4 x float> %0,   // position   (fragment coord — unused)
//     <4 x float> %1,   // texcoord0
//     texture2d   %2,   // texture0
//     sampler     %3,   // sampler0
//     float4*     %4    // params (constant-address-space buffer)
//   )
//
// Function attributes: `unsafe-fp-math`, `no-signed-zeros-fp-math`,
// `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`. `no-nans-fp-math`/`no-infs-fp-math` are
// set to "false" so NaN/Inf semantics are preserved; the shader still
// runs under Metal fast-math for reassociation. This port uses plain JS
// Number arithmetic (already IEEE-754 fp64) narrowed with Math.fround at
// every stored intermediate for f32 fidelity.
//
// Params layout, decoded from the .ll:
//   params = <4 x float> loaded from address-space(2) buffer %4
//   params[0..3] is the per-channel gamma EXPONENT vector passed straight
//   to `air.fast_pow.v4f32`. Lane 3's pow value is discarded by the
//   shufflevector in %12 — alpha stays as |A| — so `params[3]` has no
//   observable effect.
//
// IR line map (from the .ll body):
//   %6  load <4xf32> from params buffer               -> gammaExp = params
//   %7  shufflevector texcoord0, poison, <0,1>        -> uv = (uvX, uvY)
//   %8  air.sample_texture_2d.v4f32(tex, sampler, uv, // enable_offset=true,
//         zero offset, no LOD, sampler-flags=0)       -> {texel, status}
//   %9  extractvalue %8, 0                            -> texel (signed RGBA)
//   %10 air.fast_fabs.v4f32(texel)                    -> absTexel = |texel|
//   %11 air.fast_pow.v4f32(absTexel, gammaExp)        -> pow(|RGBA|, gammaExp)
//                                                       per channel
//   %12 shufflevector %11, %10, <0,1,2,7>             -> [pR, pG, pB, |A|]
//                                                       (lane 3 = %10[3])
//   %13 fsub fast <-0.0,-0.0,-0.0,-0.0>, %12          -> negated %12
//   %14 fcmp fast olt %9, zeroinitializer             -> mask: texel[i] < 0
//   %15 select %14, %13, %12                          -> restore sign per lane
//   ret <4xf32> %15

/**
 * The RGBA texel produced by sampling `texture0` at `uv` — modeled as a
 * length-4 tuple of f32 lanes.
 */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f32(tex, sampler, uv, ...)` intrinsic.
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * Params buffer for `@Hgc2GammaNoPremult`, four f32 lanes.
 *
 * Lane order (see file header):
 *   0..2: per-channel gamma exponent for R, G, B.
 *   3   : gamma exponent for A — value is computed but discarded
 *         by the .ll's shufflevector at %12, so it has no effect.
 */
export type Hgc2GammaNoPremultParams = readonly [number, number, number, number];

/**
 * `@Hgc2GammaNoPremult` — Helium Metal fragment shader.
 *
 * See file header for the full IR-line-to-code map. Faithful transcription
 * of the .ll body; every op mirrors the IR.
 *
 * @param position  fragment position (AIR `<4 x float> %0`) — unused
 * @param texcoord0 texture coordinate (AIR `<4 x float> %1`); .xy is uv
 * @param texture0  opaque texture handle passed straight to `sample`
 * @param params    4-lane gamma exponent buffer (see Hgc2GammaNoPremultParams)
 * @param sample    caller-supplied texture-sampling callback modeling
 *                  `air.sample_texture_2d.v4f32`
 * @returns         signed-preserving gamma-corrected RGBA texel
 */
export function Hgc2GammaNoPremult(
  _position: readonly [number, number, number, number],
  texcoord0: readonly [number, number, number, number],
  texture0: unknown,
  params: Hgc2GammaNoPremultParams,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %6 = load <4xf32> params — read per-channel gamma exponents.
  const gammaR: number = Math.fround(params[0]);
  const gammaG: number = Math.fround(params[1]);
  const gammaB: number = Math.fround(params[2]);
  const gammaA: number = Math.fround(params[3]);

  // %7 = shufflevector texcoord0, poison, <0,1>
  const uv: [number, number] = [
    Math.fround(texcoord0[0]),
    Math.fround(texcoord0[1]),
  ];
  // %8/%9 = air.sample_texture_2d.v4f32(tex, sampler, uv, ...)
  const texel: ShaderTexel = sample(texture0, uv);
  const tR: number = Math.fround(texel[0]);
  const tG: number = Math.fround(texel[1]);
  const tB: number = Math.fround(texel[2]);
  const tA: number = Math.fround(texel[3]);

  // %10 = air.fast_fabs.v4f32(texel) — Math.abs is bit-exact for f32.
  const aR: number = Math.fround(Math.abs(tR));
  const aG: number = Math.fround(Math.abs(tG));
  const aB: number = Math.fround(Math.abs(tB));
  const aA: number = Math.fround(Math.abs(tA));

  // %11 = air.fast_pow.v4f32(absTexel, gammaExp)
  //   Repo-canonical mapping for air.fast_pow.f32 is Math.fround(Math.pow).
  //   Lane 3 (pow(aA, gammaA)) is computed but discarded by %12; kept for
  //   faithful transcription — a JS engine will DCE it.
  const pR: number = Math.fround(Math.pow(aR, gammaR));
  const pG: number = Math.fround(Math.pow(aG, gammaG));
  const pB: number = Math.fround(Math.pow(aB, gammaB));
  const _pA: number = Math.fround(Math.pow(aA, gammaA));

  // %12 = shufflevector %11, %10, <0,1,2,7> — lane 3 from second operand (%10[3])
  const r12_r: number = pR;
  const r12_g: number = pG;
  const r12_b: number = pB;
  const r12_a: number = aA;

  // %13 = fsub fast <-0.0,-0.0,-0.0,-0.0>, %12  — negation of %12.
  // %14 = fcmp fast olt %9, zeroinitializer     — texel[i] < 0 (ordered LT).
  // %15 = select %14, %13, %12                  — restore sign per lane.
  //
  // Ordered `<` in JS: `x < 0` is false for NaN, matching AIR `olt`. For
  // -0, `-0 < 0` is false (matching IEEE `olt`), so a -0 input keeps its
  // lane sign-unchanged — the shader is a signed-magnitude gamma.
  const outR: number = tR < 0 ? Math.fround(-r12_r) : r12_r;
  const outG: number = tG < 0 ? Math.fround(-r12_g) : r12_g;
  const outB: number = tB < 0 ? Math.fround(-r12_b) : r12_b;
  const outA: number = tA < 0 ? Math.fround(-r12_a) : r12_a;

  // ret <4xf32> %15
  return [outR, outG, outB, outA];
}
