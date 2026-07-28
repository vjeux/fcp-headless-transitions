// Faithful transcription @0x0000000000001230 — @shader fragmentShader (ProAppsFxSupport)
// Source IR: raw-port/re/shaders/fragmentShader.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProAppsFxSupport.framework/
//     Versions/A/Resources/default.metallib
// via `bash raw-port/tools/shader_disasm.sh fragmentShader ProAppsFxSupport` —
// the .ll first line reads `0x00000000001230 -- fragmentShader:`)
//
// Faithful fp32 transcription of a minimal texture-sample fragment shader used
// by the ProAppsFxSupport framework (the Pro Apps FxPlug support surface that
// Motion/FCP loads for third-party FxPlug effects). The IR body samples the
// bound `inputFrame` texture at the interpolated `textureCoordinate` and
// widens the fp16 texel to fp32 for the render target output.
//
// AIR signature (from !air.fragment !15 and !19..!21):
//   define <4 x float> @fragmentShader(
//     <4 x float> clipSpacePosition   ; !19 air.position, center, no_perspective, air.arg_unused
//     <2 x float> textureCoordinate   ; !20 air.fragment_input, center, perspective — used as sample UV
//     texture2d<half, sample> inputFrame ; !21 air.texture, location_index 0/1
//   ) -> <4 x float> at air.render_target 0 (!17, "float4")
//
// The sampler is baked into the metallib at
//   @__air_sampler_state = internal addrspace(2) constant
//     [2 x i64] [i64 34901797601020489, i64 0]
// referenced by !air.sampler_states !22 — an opaque packed sampler-state
// constant that we surface as an opaque caller-supplied callback (mirroring
// the pattern established by fragmentShaderViewer.ts, whose baked sampler
// constant is 34901797601036873, a different packed descriptor of the same
// [2 x i64] layout — we do not decode the packed bits; the caller wires the
// sampler).
//
// The IR body @0x1230 in full (%4..%6):
//   %4 = tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(
//          inputFrame, __air_sampler_state, %1 textureCoordinate,
//          i1 true, <2 x i32> zeroinitializer, i1 false,
//          float 0.0, float 0.0, i32 0)
//   %5 = extractvalue { <4 x half>, i8 } %4, 0     — <4 x half> (discard i8 flag)
//   %6 = tail call fast <4 x float> @air.convert.f.v4f32.f.v4f16(<4 x half> %5)
//   ret <4 x float> %6
//
// The `i1 true` / `<2 x i32> zeroinitializer` / `i1 false` / two `float 0.0` /
// `i32 0` trailing args are the standard air.sample_texture_2d.v4f16 signature
// (lod_options, offset, min_lod_clamp, bias, lod, sample_component). The IR
// requests no offset, no bias, no LOD clamp — a plain sample. We ignore the i8
// occlusion/status byte because the IR itself never reads it (only extractvalue
// %4, 0 is consumed).
//
// Faithful fp32 transcription — no fitting, no fudging.

/**
 * Callback that mirrors `air.sample_texture_2d.v4f16` for the caller-provided
 * `inputFrame` texture (baked sampler at !air.sampler_states !22 — sampler-state
 * constant 34901797601020489). Takes UV coordinates and returns RGBA in fp32
 * (widened from the underlying `texture2d<half, sample>` via
 * `air.convert.f.v4f32.f.v4f16`).
 *
 * @IR %4 = @air.sample_texture_2d.v4f16(inputFrame, sampler, %1 uv, …)
 *     %5 = extractvalue %4, 0
 *     %6 = @air.convert.f.v4f32.f.v4f16(%5)
 */
export type SampleInputFrameFn = (
  uv: readonly [number, number],
) => [number, number, number, number];

/**
 * fragmentShader — samples `inputFrame` at `textureCoordinate` and returns
 * the widened fp32 texel at render_target 0.
 *
 * @param _clipSpacePosition [[position]] — float4, `air.arg_unused` in !19.
 *                            The compiler proved this argument is not read by
 *                            the IR body, so we ignore it here too.
 * @param textureCoordinate   air.fragment_input "textureCoordinate" — the UV
 *                            (%1) fed directly into air.sample_texture_2d.v4f16.
 * @param sampleInputFrame    Callback mirroring the baked
 *                            `air.sample_texture_2d.v4f16(inputFrame, sampler, uv, …)`
 *                            call (widened to fp32 via
 *                            `air.convert.f.v4f32.f.v4f16`). The i8 occlusion
 *                            byte is discarded (IR reads only extractvalue …, 0).
 * @returns                   `[r, g, b, a]` — fragment output at render_target 0.
 */
export function fragmentShader(
  _clipSpacePosition: readonly [number, number, number, number],
  textureCoordinate: readonly [number, number],
  sampleInputFrame: SampleInputFrameFn,
): [number, number, number, number] {
  // @IR %4 = @air.sample_texture_2d.v4f16(inputFrame, sampler, %1, i1 true,
  //             <2 x i32> zeroinitializer, i1 false, 0.0, 0.0, i32 0)
  //     %5 = extractvalue %4, 0                  — <4 x half> (discard i8 flag)
  //     %6 = @air.convert.f.v4f32.f.v4f16(%5)    — widen fp16 → fp32
  const texel = sampleInputFrame([
    Math.fround(textureCoordinate[0]),
    Math.fround(textureCoordinate[1]),
  ]);
  // @IR ret <4 x float> %6 — components already fp32 from the callback.
  // Math.fround each channel to preserve the fp32 render-target semantic even
  // if the callback happens to return a wider representation.
  return [
    Math.fround(texel[0]),
    Math.fround(texel[1]),
    Math.fround(texel[2]),
    Math.fround(texel[3]),
  ];
}
