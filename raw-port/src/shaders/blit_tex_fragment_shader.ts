// @shader blit_tex_fragment_shader (Flexo)
//
// Trivial texture-blit fragment shader from Flexo's default.metallib.
// Samples texture0 at the given fragment texcoord (as a <2 x float>),
// takes the .rgb of the sampled texel (which the sampler returned as
// four half-precision floats), promotes each of the three components
// to fp32, and returns them alongside a hard-coded alpha of 1.0.
//
// Source LLVM IR: raw-port/re/shaders/blit_tex_fragment_shader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh blit_tex_fragment_shader Flexo`)
//
// AIR signature (from air.fragment metadata !15 and !18..!22):
//   define <4 x float> @blit_tex_fragment_shader(
//     <4 x float> %0,   ; air.position P     (fragment coord, unused)
//     <4 x float> %1,   ; air.fragment_input Cs (color-space, unused)
//     <2 x float> %2,   ; air.fragment_input st (texcoord)
//     texture2d<half, sample> %3            ; air.texture te
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable` — the shader compiles under Metal fast-math.
// This port uses plain JS Number arithmetic (already IEEE-754 fp64) narrowed
// with Math.fround at every value that is stored to a `<... x float>` slot,
// preserving f32 fidelity where the AIR does. The half-to-float fpext calls
// (%8, %10, %12) preserve their input value exactly as a fp32 since every
// finite fp16 has a bit-exact fp32 image.
//
// IR line map (from the .ll body):
//   %5  = call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(
//           texture %3, sampler bit-cast(@__air_sampler_state),
//           <2xfloat> %2, i1 true, <2xi32> zero, i1 false,
//           float 0.0, float 0.0, i32 0)
//         -> sample(texture0, uv)   (returns half4 texel + residency byte)
//   %6  = extractvalue { <4 x half>, i8 } %5, 0
//         -> texel = %5[0]   (drop the residency i8)
//   %7  = extractelement <4 x half> %6, i64 0   ; halfR
//   %8  = fpext half %7 to float                 ; fpR
//   %9  = extractelement <4 x half> %6, i64 1   ; halfG
//   %10 = fpext half %9 to float                 ; fpG
//   %11 = extractelement <4 x half> %6, i64 2   ; halfB
//   %12 = fpext half %11 to float                ; fpB
//   %13 = insertelement <4 x float> <poison, poison, poison, 1.0>, float %8, i64 0
//         -> [fpR, ·, ·, 1.0]
//   %14 = insertelement <4 x float> %13, float %10, i64 1
//         -> [fpR, fpG, ·, 1.0]
//   %15 = insertelement <4 x float> %14, float %12, i64 2
//         -> [fpR, fpG, fpB, 1.0]
//   ret <4 x float> %15
//
// Notes:
//   • The sampler bindings (sampler_state @__air_sampler_state = 0x7C0064F00909
//     for slot 0 + 0 for slot 1) are inlined via the metadata !23 =
//     !{!"air.sampler_state", ...}. The runtime provides them as a
//     resolved Metal sampler_state; from JS we abstract them via the
//     `sample(tex, uv)` callback below.
//   • The last `<4 x float>` lane (%15[3]) is left as the constant 1.0
//     inserted at initialisation (the vector starts as
//     <poison, poison, poison, 1.0>). No `insertelement` touches lane 3,
//     so the return value's alpha is exactly 1.0f — matching a Metal
//     "opaque blit" whose alpha is discarded from the texture.

/**
 * Callback that samples a 2D texture. Faithfully models the AIR call at
 * `%5 = @air.sample_texture_2d.v4f16(...)`. The `tex` and `sampler` are
 * runtime-managed opaque handles; the callback returns four half-lifted
 * floats (Metal samples as half4, then fpext to float — both operations
 * are lossless for finite fp16 inputs).
 */
export type SampleTexture2D = (
  tex: unknown,
  uv: readonly [number, number],
) => readonly [number, number, number, number];

/**
 * blit_tex_fragment_shader — sample texture at `st` and return
 * `.rgb + alpha=1.0`.
 *
 * @param P         fragment position vec4 — unused (air.arg_unused per !19).
 * @param Cs        fragment color-space vec4 — unused (air.arg_unused per !20).
 * @param st        fragment texcoord vec2 (the `<2 x float> %2` input).
 * @param texture0  opaque texture handle (the `%3` argument).
 * @param sample    the AIR sample_texture_2d callback (see SampleTexture2D).
 * @returns         fp32 vec4 with alpha hard-set to 1.
 */
export function blit_tex_fragment_shader(
  P: readonly [number, number, number, number],
  Cs: readonly [number, number, number, number],
  st: readonly [number, number],
  texture0: unknown,
  sample: SampleTexture2D,
): [number, number, number, number] {
  // %0 and %1 are declared air.arg_unused in !19/!20 — the compiler
  // preserves them in the signature but the function body never reads
  // them. We accept them here for API fidelity but do not touch them.
  void P;
  void Cs;

  // %5 = air.sample_texture_2d.v4f16(texture0, sampler_state, st, ...)
  // %6 = extractvalue ..., 0    (drop the residency byte)
  const texel = sample(texture0, st);

  // %7  = extractelement <4 x half> %6, i64 0
  // %8  = fpext half %7 to float
  const fpR = Math.fround(texel[0]);
  // %9  = extractelement <4 x half> %6, i64 1
  // %10 = fpext half %9 to float
  const fpG = Math.fround(texel[1]);
  // %11 = extractelement <4 x half> %6, i64 2
  // %12 = fpext half %11 to float
  const fpB = Math.fround(texel[2]);
  // %13/%14/%15 = insertelement sequence into <poison, poison, poison, 1.0>
  //   result lane 0 = fpR
  //   result lane 1 = fpG
  //   result lane 2 = fpB
  //   result lane 3 = 1.0    (untouched constant in the initial vector)
  return [fpR, fpG, fpB, Math.fround(1.0)];
}
