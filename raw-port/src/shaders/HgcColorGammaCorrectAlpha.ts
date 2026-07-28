// HgcColorGammaCorrectAlpha.ts
// @shader HgcColorGammaCorrectAlpha (Flexo)
//
// Faithful raw-port from the Metal AIR IR at raw-port/re/shaders/HgcColorGammaCorrectAlpha.ll
// The IR is committed alongside this file; it IS the provenance.
//
// Purpose: sample RGBA from a 2D texture at the incoming texcoord, then gamma-correct ONLY the
// alpha channel by raising it to a fixed power. RGB is passed through untouched.
//
// AIR entry:
//   define <4 x float> @HgcColorGammaCorrectAlpha(
//     <4 x float> %0 /* position, unused */,
//     <4 x float> %1 /* texcoord0 */,
//     texture2d<float, sample> %2 /* texture0 */,
//     sampler %3 /* sampler0 */
//   )
//
// Fast-math flags on the entry (module attrs #0) enable the AIR fast-math suite
// (see the .ll for the exact attribute list). We use plain JS float arithmetic with
// Math.fround where needed to honor the fp32 IO contract.

/**
 * A texture sampler callback. Given a texture handle (opaque) and 2D uv, returns an RGBA float4.
 * The engine passes an appropriate implementation (mip/filter is baked into the sampler param).
 */
export type Sample2D = (
  texture: unknown,
  sampler: unknown,
  uv: readonly [number, number]
) => readonly [number, number, number, number];

/** f32 rounding helper (single-precision faithful; the shader is compiled with fp32 semantics). */
const f = (x: number): number => Math.fround(x);

/**
 * Gamma-correction exponent, cited @IR line %9 in HgcColorGammaCorrectAlpha.ll:
 *   `tail call fast float @air.fast_pow.f32(float %8, float 0x3FE05C22A0000000)`
 *
 * The IR encodes the second arg as a `double` literal 0x3FE05C22A0000000 = 0.5112469792366028d,
 * which LLVM implicitly demotes to the f32 arg of `air.fast_pow.f32`. As f32 this is 0x3f02e115
 * = 0.5112469792366028f (identical to seven significant digits — the literal happens to be
 * exactly representable as f32 with no rounding loss).
 */
export const HgcColorGammaCorrectAlpha_EXPONENT = f(0.5112469792366028);

/**
 * @shader HgcColorGammaCorrectAlpha (Flexo)
 *
 * Faithful transcription of the shader body @IR lines %5..%10:
 *   %5  = shufflevector <4 x float> %1, poison, <2 x i32> <i32 0, i32 1>
 *   %6  = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(
 *           %2 [texture0],
 *           %3 [sampler0],
 *           <2 x float> %5 [uv],
 *           i1 true,                    // enable offset
 *           <2 x i32> zeroinitializer,  // offset = (0,0)
 *           i1 false,                   // enable lod-bias
 *           float 0.000000e+00,         // lod-bias
 *           float 0.000000e+00,         // min-lod-clamp
 *           i32 0                       // gradient mode
 *         )
 *   %7  = extractvalue { <4 x float>, i8 } %6, 0        ; drop the sample-status i8
 *   %8  = extractelement <4 x float> %7, i64 3          ; alpha
 *   %9  = tail call fast float @air.fast_pow.f32(float %8, float 0x3FE05C22A0000000)
 *   %10 = insertelement <4 x float> %7, float %9, i64 3 ; put gamma-corrected alpha back
 *   ret <4 x float> %10
 *
 * The `position` argument (%0) is unused by the shader body — the AIR metadata !19 marks it
 * `air.arg_unused`. Kept in the signature for source-level parity.
 *
 * @param position     %0 fragment position (unused; parity-only)
 * @param texcoord0    %1 texcoord (float4; only .xy is used, per shufflevector @%5)
 * @param texture0     %2 the sampled texture (opaque handle passed through to `sample`)
 * @param sampler0     %3 the sampler state    (opaque handle passed through to `sample`)
 * @param sample       host-provided callback that performs `air.sample_texture_2d.v4f32`
 * @returns            <4 x float> RGBA with alpha gamma-corrected by ^EXPONENT
 */
export function HgcColorGammaCorrectAlpha(
  _position: readonly [number, number, number, number],
  texcoord0: readonly [number, number, number, number],
  texture0: unknown,
  sampler0: unknown,
  sample: Sample2D
): [number, number, number, number] {
  // %5 = shufflevector %1, poison, <i32 0, i32 1> — pack .xy into a float2 uv
  const uv: readonly [number, number] = [f(texcoord0[0]), f(texcoord0[1])];

  // %6 = air.sample_texture_2d.v4f32(texture0, sampler0, uv, offset-enable=true, offset=(0,0), ...)
  // %7 = extractvalue %6, 0  — take the RGBA float4, discard the sample-status i8
  const rgba = sample(texture0, sampler0, uv);
  const r = f(rgba[0]);
  const g = f(rgba[1]);
  const b = f(rgba[2]);
  // %8 = extractelement %7, i64 3
  const a = f(rgba[3]);

  // %9 = air.fast_pow.f32(a, EXPONENT)
  //   AIR's fast_pow is a fast-math single-precision pow; on the host we compute
  //   `Math.fround(Math.pow(a, exponent))` which honors the fp32 IO contract. The fast-math
  //   flags on the call (`fast`) authorize the compiler to use hardware-fast implementations; the observable
  //   contract is "an f32 result faithful to a^exponent". We match with Math.pow → fround.
  const aCorrected = f(Math.pow(a, HgcColorGammaCorrectAlpha_EXPONENT));

  // %10 = insertelement %7, %9, i64 3
  // ret %10
  return [r, g, b, aCorrected];
}

export default HgcColorGammaCorrectAlpha;
