// @shader HgcColorLinearizeAlpha (Flexo)
//
// Metal fragment shader from Flexo's Hgc pixel-math library. Samples a
// single texture with texcoord0 and returns the RGBA texel with the alpha
// channel raised to a fixed power (≈1.956) — a "linearize alpha" op,
// mirroring the gamma linearization applied to RGB elsewhere in the Hgc
// pipeline.
//
// Source LLVM IR: raw-port/re/shaders/HgcColorLinearizeAlpha.ll
// Extracted from: Flexo.framework/Versions/A/Resources/
//                   FlexoHgcMetalShaders_derived.metallib
// (via `bash raw-port/tools/shader_disasm.sh HgcColorLinearizeAlpha Flexo`)
//
// AIR signature:
//   define <4 x float> @HgcColorLinearizeAlpha(
//     <4 x float> %0,   ; position   (fragment coordinate — unused)
//     <4 x float> %1,   ; texcoord0
//     texture2d   %2,   ; texture0
//     sampler     %3    ; sampler0
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable` — the shader compiles under Metal fast-math.
// This port uses plain JS Number arithmetic (already IEEE-754 fp64) narrowed
// with Math.fround at every stored intermediate for f32 fidelity.
//
// IR line map (from the .ll body):
//   %5  shufflevector <4xf32> %1, poison, <2xi32> <0,1>
//         -> uv = texcoord0.xy  (lanes 0 and 1)
//   %6  tail call { <4xf32>, i8 } @air.sample_texture_2d.v4f32(
//         tex, sampler, uv,
//         i1 true,               ; enable_offset  (per AIR ABI; here true
//                                  with zero offset below is a no-op)
//         <2xi32> zeroinitializer,; offset = (0,0)
//         i1 false,              ; lod_options: none
//         float 0.0, float 0.0,  ; unused LOD/bias floats
//         i32 0)                 ; sampler-modifier flags
//   %7  extractvalue %6, 0       -> the sampled <4xf32> texel {r,g,b,a}
//   %8  extractelement %7, i64 3 -> alpha (lane 3)
//   %9  tail call fast float @air.fast_pow.f32(float %8,
//         float 0x3FFF4BC6A0000000)
//         -> pow(alpha, ≈1.9559999704360962)
//            The IR literal 0x3FFF4BC6A0000000 is the LLVM double bit
//            pattern for the fp32 constant; decoded as an IEEE-754 double
//            it equals 1.9559999704360962. Cast to fp32 the value is
//            bit-identical (1.9559999704360962). We spell it out as
//            Math.fround(1.9559999704360962) so the constant survives at
//            fp32 precision through any fold.
//   %10 insertelement %7, %9, i64 3 -> replace lane 3 with the linearized
//                                       alpha
//   ret <4xf32> %10                 -> {r, g, b, alphaLinear}
//
// AIR `air.fast_pow.f32` is the Metal fast-math pow intrinsic. Per
// raw-port/army/SHADERS.md the canonical mapping in this repo is
// `Math.fround(Math.pow(base, exp))`; this file uses that mapping.
//
// `air.sample_texture_2d.v4f32` is modeled by the caller-supplied
// `sample(tex, uv) => [r,g,b,a]` callback — the standard shader-port ABI
// for this repo. The sampler + tex handle types are opaque to us.

/**
 * The RGBA texel produced by sampling `texture0` at `uv` — modeled as a
 * length-4 tuple of f32 lanes.
 */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f32(tex, sampler, uv, ...)` intrinsic. The
 * offset/LOD arguments in the IR are all zeros or defaults in this
 * shader, so the callback signature strips them for clarity — a host
 * that needs to model them can wrap.
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * Alpha-linearization exponent from the .ll:
 *   %9 = ... @air.fast_pow.f32(float %8, float 0x3FFF4BC6A0000000)
 * The literal 0x3FFF4BC6A0000000 decoded as an IEEE-754 double is
 * exactly 1.9559999704360962; cast to fp32 the value is unchanged.
 */
const LINEARIZE_ALPHA_EXPONENT: number = Math.fround(1.9559999704360962);

/**
 * `@HgcColorLinearizeAlpha` — Flexo Metal fragment shader.
 *
 * Samples `tex` at the xy of `texcoord0` and returns the RGBA texel with
 * its alpha channel replaced by `pow(alpha, 1.956)`. Faithful transcription
 * of the .ll body; see the IR line map in the file header.
 *
 * The `position` argument is present in the AIR ABI (fragment position)
 * but is unused by the shader — the .ll body never references `%0`.
 *
 * @param position  fragment position (AIR `<4 x float> %0`) — unused
 * @param texcoord0 texture coordinate (AIR `<4 x float> %1`); .xy is the
 *                  sample uv
 * @param texture0  opaque texture handle passed straight to `sample`
 * @param sample    caller-supplied texture-sampling callback modeling
 *                  `air.sample_texture_2d.v4f32`
 * @returns         RGBA texel with alpha linearized
 */
export function HgcColorLinearizeAlpha(
  _position: readonly [number, number, number, number],
  texcoord0: readonly [number, number, number, number],
  texture0: unknown,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %5 = shufflevector %1, poison, <0,1> — take (x, y) of texcoord0.
  const uv: [number, number] = [texcoord0[0], texcoord0[1]];

  // %6/%7 = air.sample_texture_2d.v4f32(tex, sampler, uv, ...) — the RGBA
  // texel. Offset (0,0), no LOD modifiers, sampler config 0.
  const texel: ShaderTexel = sample(texture0, uv);

  // %8 = extractelement %7, i64 3 — the alpha lane.
  const alpha: number = texel[3];

  // %9 = air.fast_pow.f32(alpha, 1.9559999704360962). fp32-narrowed with
  // Math.fround; Math.pow is the accepted spec for air.fast_pow.f32 in
  // this repo's shader corpus.
  const alphaLinear: number = Math.fround(Math.pow(alpha, LINEARIZE_ALPHA_EXPONENT));

  // %10 = insertelement %7, %9, i64 3 — replace alpha lane, return.
  return [texel[0], texel[1], texel[2], alphaLinear];
}
