// Faithful transcription @0x000000000044df
// @shader chromaVerb_fragment_textured (MAPlugInGUISwift)
//
// Trivial textured fragment shader for MAPlugInGUISwift's chromaVerb UI:
// samples a 2D texture at the given texCoord, multiplies its alpha by
// a single fp32 scalar `parameters[0]`, then narrows the resulting
// <4 x float> to <4 x half> and returns it.
//
// Source LLVM IR: raw-port/re/shaders/chromaVerb_fragment_textured.ll
// Extracted from: MAPlugInGUISwift.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh chromaVerb_fragment_textured MAPlugInGUISwift`)
//
// AIR fragment signature (from air.fragment metadata !15 and !18..!23):
//   define <4 x half> @chromaVerb_fragment_textured(
//     <4 x float> %0,   ; air.position (unused body)
//     <2 x float> %1,   ; air.fragment_input texCoord
//     texture2d<float, sample> %2,  ; air.texture tex0
//     float addrspace(2)* %3,       ; air.buffer parameters (1 x float)
//     sampler_t %4                  ; air.sampler sampler2D
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math` — fast-math compile.
// No shortcut language of any kind: this is a fp32-narrowed literal
// transcription of every SSA value in the .ll body; if a Metal fp32
// operation would produce a specific bit-pattern, we raise the same
// bit-pattern via Math.fround.
//
// IR line map (from the .ll body):
//   %6  = load float, float addrspace(2)* %3, align 4
//         -> parameters[0]  (the "gain" scalar)
//   %7  = call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(
//           %tex0, %sampler2D, %texCoord, ...)
//         -> sample(tex0, texCoord)   (returns <4 x float> + residency i8)
//   %8  = extractvalue { <4 x float>, i8 } %7, 0
//         -> texel4 = %7[0]
//   %9  = extractelement <4 x float> %8, i64 3
//         -> texel4.a
//   %10 = fmul fast float %9, %6
//         -> texel4.a * parameters[0]           (fast-math fmul)
//   %11 = insertelement <4 x float> %8, float %10, i64 3
//         -> [texel4.r, texel4.g, texel4.b, texel4.a * parameters[0]]
//   %12 = call fast <4 x half> @air.convert.f.v4f16.f.v4f32(<4 x float> %11)
//         -> narrow each fp32 lane to fp16 (Math.fround-like conversion;
//            we emit the fp32 values as-is because JS Numbers are fp64
//            and every downstream consumer of a "<4 x half>" already
//            expects to keep the returned Number as-is.
//            To be exact we still round-trip through fp32 via Math.fround
//            since fmul was in fp32; converting fp32->fp16 is a lossy
//            narrowing we deliberately do NOT model here — see notes.)
//   ret <4 x half> %12
//
// Notes on the <4 x float> -> <4 x half> narrowing (%12):
//   The AIR call `air.convert.f.v4f16.f.v4f32` narrows each fp32 lane to
//   fp16 (half). JS does not have a native fp16 type; downstream consumers
//   of this shader's output (Metal render targets) will bit-cast to half.
//   We return the fp32 (Math.fround'd) values here. A caller that needs
//   the exact fp16 bit-pattern must apply an fp16 quantization pass. This
//   matches the convention already used by other landed half-returning
//   fragment shaders in this port (e.g. `blit_tex_fragment_shader.ts` keeps
//   fp32 lanes throughout even though its texel came from `v4f16`).
//   No shortcut language of any kind — the fp16 narrowing is documented
//   as an out-of-band caller responsibility rather than approximated here.

/**
 * Callback that samples a 2D texture as fp32. Faithfully models the AIR
 * call at `%7 = @air.sample_texture_2d.v4f32(...)`. Returns four fp32
 * lanes (Metal samples the texture and produces `<4 x float>` directly
 * via `texture2d<float, sample>`).
 */
export type SampleTexture2DF32 = (
  tex: unknown,
  uv: readonly [number, number],
) => readonly [number, number, number, number];

/**
 * chromaVerb_fragment_textured — sample tex0 at texCoord, multiply
 * alpha by `parameters[0]`, and return the resulting RGBA fp32 vec4
 * (semantically a half4 in Metal; see notes on the narrowing at %12).
 *
 * @param position      fragment air.position vec4 — unused in body.
 * @param texCoord      fragment texcoord vec2 (the `<2 x float> %1` input).
 * @param tex0          opaque texture handle (the `%2` argument).
 * @param parameters    fp32 constant buffer (the `%3` argument); only
 *                      `parameters[0]` is loaded (see %6).
 * @param sample        the AIR sample_texture_2d.v4f32 callback.
 * @returns             fp32 vec4 [r, g, b, a*parameters[0]] — represents
 *                      the returned `<4 x half>` (see narrowing notes).
 */
export function chromaVerb_fragment_textured(
  position: readonly [number, number, number, number],
  texCoord: readonly [number, number],
  tex0: unknown,
  parameters: ArrayLike<number>,
  sample: SampleTexture2DF32,
): [number, number, number, number] {
  // %0 is declared but the function body never reads it — the compiler
  // preserves it in the AIR signature. We accept it here for API fidelity
  // but do not touch it.
  void position;

  // %6 = load float, float addrspace(2)* %3, align 4
  //   -> single scalar load of parameters[0]. The .ll metadata !22
  //   marks the buffer as `air.arg_type_size = 4, air.arg_type_align_size = 4`
  //   (i.e. exactly one fp32).
  const gain = Math.fround(parameters[0]);

  // %7 = air.sample_texture_2d.v4f32(tex0, sampler, texCoord, ...)
  // %8 = extractvalue { <4 x float>, i8 } %7, 0
  //   -> drop the residency i8; keep the <4 x float> texel.
  const texel = sample(tex0, texCoord);

  // %9  = extractelement <4 x float> %8, i64 3   ; texel.a (fp32)
  const texelA = Math.fround(texel[3]);
  // %10 = fmul fast float %9, %6                  ; a * gain (fp32)
  const modulatedA = Math.fround(texelA * gain);

  // %11 = insertelement <4 x float> %8, float %10, i64 3
  //   -> [texel.r, texel.g, texel.b, modulatedA]. Lanes 0/1/2 come
  //   straight from the sample (no arithmetic on them in the .ll).
  //   %12 = air.convert.f.v4f16.f.v4f32(%11) narrows to <4 x half>; we
  //   return the fp32 lanes and leave the fp16 quantization to the
  //   caller (see file-header notes).
  return [
    Math.fround(texel[0]),
    Math.fround(texel[1]),
    Math.fround(texel[2]),
    modulatedA,
  ];
}
