// @shader textureWrapNearestSamplingShader (Flexo)  @0x00000000016510
//
// Metal fragment shader from Flexo's default.metallib.  A minimal
// texture-sampling shader with a compile-time-baked sampler state.
// The sampler is initialized as {i64 34901797601018002, i64 0} at the
// metallib symbol @__air_sampler_state.2 (address space 2, function
// constant) — a fixed-function config which, per the shader name,
// corresponds to Metal's "wrap" address mode with "nearest" min/mag
// filter. Callers do not supply the sampler at dispatch time; it is
// baked into the shader.
//
// Source LLVM IR: raw-port/re/shaders/textureWrapNearestSamplingShader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh textureWrapNearestSamplingShader Flexo`)
//
// AIR signature (from the .ll):
//   define <4 x float> @textureWrapNearestSamplingShader(
//     <4 x float>            %0,   // clipSpacePosition (air.position, UNUSED per !19 air.arg_unused)
//     <2 x float>            %1,   // textureCoordinate (uv)
//     %struct._texture_2d_t* %2)   // colorTexture (texture2d<half, sample>)
//
// Fragment metadata (from !air.fragment, !15..!22 in the .ll):
//   arg %0 = "clipSpacePosition" (float4, air.position, air.no_perspective) — UNUSED
//   arg %1 = "textureCoordinate" (float2, air.fragment_input, air.perspective)
//   arg %2 = "colorTexture"      (texture2d<half, sample>, location index 0)
//   sampler = @__air_sampler_state.2 (baked, see !22 air.sampler_state)
//   return  = "air.render_target" 0/0, float4.
//
// IR line map (from the .ll body of @textureWrapNearestSamplingShader):
//   %4 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(
//         %2 colorTexture,
//         @__air_sampler_state.2 (bitcast to sampler*),
//         %1 uv,
//         i1 true,                     ; enable_offset flag
//         <2 x i32> zeroinitializer,   ; offset = (0,0)
//         i1 false,                    ; lod_options: none
//         float 0.0, float 0.0,        ; unused LOD/bias
//         i32 0)                       ; sampler-modifier flags
//   %5 = extractvalue { <4 x half>, i8 } %4, 0   ; = sampled <4 x half>
//   %6 = tail call fast <4 x float> @air.convert.f.v4f32.f.v4f16(<4 x half> %5)
//         ; half4 -> float4 lane-wise widening (lossless: fp32 strictly wider than fp16)
//   ret <4 x float> %6
//
// Fast-math attributes on #0: `unsafe-fp-math`, `no-nans-fp-math`,
// `no-infs-fp-math`, `no-signed-zeros-fp-math`, `approx-func-fp-math`;
// plus module compile options `air.compile.fast_math_enable`,
// `air.compile.denorms_disable`, `air.compile.framebuffer_fetch_enable`.
// This shader does NO fp arithmetic — only a texture sample plus a
// half->float widen — so the fast-math flags cannot affect the result.
// Direct TS mapping of the identity-widen path.
//
// Half-to-float conversion (`air.convert.f.v4f32.f.v4f16`): AIR's f16->f32
// widen is bit-exact per lane (every finite fp16 value is representable
// as an fp32 without rounding, since fp32 has strictly more range and
// mantissa bits than fp16). We surface the sampled texel as fp32 already
// via the caller's sample() callback and treat the widen as a no-op,
// matching this repo's other sampling shaders (textureSamplingShader,
// Hgc2CopyAlpha) and the shader-port ABI in raw-port/army/SHADERS.md.

/**
 * RGBA texel from `air.sample_texture_2d.v4f16` — modeled as a length-4
 * tuple of fp32 lanes (the shader itself operates on <4 x half>, but the
 * shader-port ABI in this repo uses fp32 sampler callbacks; the f16->f32
 * widen at the tail of the shader is a lossless per-lane cast).
 */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture-sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f16(tex, sampler, uv, ...)` intrinsic. The
 * sampler is baked into the metallib (see @__air_sampler_state.2 in the
 * .ll) and the offset/LOD arguments are all zero/default in this shader,
 * so the callback strips them.
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * `@textureWrapNearestSamplingShader` — Flexo Metal fragment shader.
 *
 * Samples `colorTexture` at `textureCoordinate` using the baked-in
 * "wrap" address / "nearest" filter sampler, then widens the half4
 * result to float4 and returns it.
 *
 * `clipSpacePosition` is present in the AIR ABI (fragment position,
 * air.position) but is UNUSED by the shader body — the .ll never
 * references %0 (air.arg_unused in metadata !19).
 *
 * @param _clipSpacePosition  fragment position (AIR `<4 x float> %0`) — unused
 * @param textureCoordinate   uv (AIR `<2 x float> %1`)
 * @param colorTexture        opaque texture handle (AIR `%2`) passed to `sample`
 * @param sample              caller-supplied texture-sampling callback wrapping
 *                            `air.sample_texture_2d.v4f16` with the baked wrap/nearest sampler
 * @returns                   the sampled RGBA texel (fp32 lanes)
 */
export function textureWrapNearestSamplingShader(
  _clipSpacePosition: readonly [number, number, number, number],
  textureCoordinate: readonly [number, number],
  colorTexture: unknown,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %4/%5 = air.sample_texture_2d.v4f16(%2 tex, @__air_sampler_state.2, %1 uv, ...)
  //         -> sampled <4 x half>.
  const uv: [number, number] = [textureCoordinate[0], textureCoordinate[1]];
  const sampled: ShaderTexel = sample(colorTexture, uv);

  // %6 = tail call fast @air.convert.f.v4f32.f.v4f16(<4 x half> %5)
  //      Lossless per-lane widen; Math.fround preserves f32 bit-exactness
  //      in case the caller returns a value the fp16 domain would not.
  return [
    Math.fround(sampled[0]),
    Math.fround(sampled[1]),
    Math.fround(sampled[2]),
    Math.fround(sampled[3]),
  ];
}
