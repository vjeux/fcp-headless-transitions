// Faithful transcription @0x00000000004d78 — @shader fragmentShaderViewer (Ozone)
// Source IR: raw-port/re/shaders/fragmentShaderViewer.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Resources/default.metallib
// via raw-port/tools/shader_disasm.sh — the .ll first line reads
// `0x00000000004d78 -- fragmentShaderViewer:`)
//
// Faithful fp32 transcription of a very small fragment shader:
//   uv.x = position.x / textureWidth
//   uv.y = 1.0 - position.y / textureHeight     (Y-flip)
//   return textureColorMap.sample(sampler, uv)   (linear/nearest — sampler baked)
//
// Function signature (from !air.fragment metadata !15/!18/!20):
//   [[position]]                           float4  position      (center, no_perspective)
//   texture2d<half, sample> [[texture(0)]] colorMap
//   → return float4                        [[color(0)]]
//
// The IR loads the texture's fp16 sample and widens to fp32 for the render
// target output (@air.convert.f.v4f32.f.v4f16). The sampler is baked into the
// metallib as @__air_sampler_state (constant 34901797601036873 — an opaque
// packed sampler descriptor); we surface it as an opaque callback so callers
// choose the sampling mode. The extra i8 occlusion flag from
// @air.sample_texture_2d.v4f16 is discarded (only extractvalue …, 0 is used).
//
// @IR whole body @0x00000000004d78 (%3..%16).

/**
 * Callback that mirrors `air.sample_texture_2d.v4f16` for the caller-provided
 * `colorMap` (baked sampler at !air.sampler_states !21 — sampler-state constant
 * 34901797601036873). Takes normalized UV coordinates and returns RGBA in fp32
 * (widened from the underlying `texture2d<half, sample>` via
 * `air.convert.f.v4f32.f.v4f16`).
 *
 * @IR %14 = @air.sample_texture_2d.v4f16(…, %13 uv, …)
 *     %15 = extractvalue %14, 0
 *     %16 = @air.convert.f.v4f32.f.v4f16(%15)
 */
export type SampleColorMapFn = (
  uv: [number, number],
) => [number, number, number, number];

/**
 * fragmentShaderViewer — one fragment.
 *
 * Fragment shader that samples `colorMap` at the fragment's pixel position,
 * normalizing X by the texture width and Y by the texture height with a
 * vertical flip (1.0 - y/h). The sampled fp16 texel is widened to fp32 and
 * written to `[[color(0)]]`.
 *
 * @param position      [[position]] — float4 (center, no_perspective).
 *                      Only .x (%3) and .y (%7) are read; .zw are unused.
 * @param textureWidth  Result of `@air.get_width_texture_2d(colorMap, 0)`
 *                      (%4 — i32 → u32→f32 via `air.convert.f.f32.u.i32` %5).
 * @param textureHeight Result of `@air.get_height_texture_2d(colorMap, 0)`
 *                      (%8 — i32 → u32→f32 via `air.convert.f.f32.u.i32` %9).
 * @param sampleColorMap Callback that samples the bound `colorMap` texture
 *                       at a given UV (mirrors `air.sample_texture_2d.v4f16`
 *                       widened to fp32 via `air.convert.f.v4f32.f.v4f16`).
 *                       The extra i8 occlusion result of the IR call is
 *                       ignored (the IR only reads `extractvalue %14, 0`).
 * @returns              `{ color }` — the fragment output at render_target 0.
 *
 * @IR entire function @0x00000000004d78.
 */
export function fragmentShaderViewer(
  position: [number, number, number, number],
  textureWidth: number,
  textureHeight: number,
  sampleColorMap: SampleColorMapFn,
): {
  /** render_target 0 — float4 RGBA (widened from fp16 texel). @IR %16 */
  color: [number, number, number, number];
} {
  // @IR %3  = extractelement %0, i64 0       — position.x
  const posX = Math.fround(position[0]);
  // @IR %4  = @air.get_width_texture_2d(colorMap, 0)   — u32
  //     %5  = @air.convert.f.f32.u.i32(%4)             — UNSIGNED → f32
  //     u32 promotion: >>>0 before Math.fround preserves the unsigned semantic.
  const widthF = Math.fround((textureWidth >>> 0));
  // @IR %6  = fdiv fast %3, %5                — u = position.x / width
  const u = Math.fround(posX / widthF);
  // @IR %7  = extractelement %0, i64 1        — position.y
  const posY = Math.fround(position[1]);
  // @IR %8  = @air.get_height_texture_2d(colorMap, 0)  — u32
  //     %9  = @air.convert.f.f32.u.i32(%8)             — UNSIGNED → f32
  const heightF = Math.fround((textureHeight >>> 0));
  // @IR %10 = fdiv fast %7, %9                — position.y / height
  const yNorm = Math.fround(posY / heightF);
  // @IR %11 = fsub fast 1.000000e+00, %10     — v = 1.0 - position.y / height
  const v = Math.fround(Math.fround(1.0) - yNorm);
  // @IR %12 = insertelement undef, %6, i64 0
  //     %13 = insertelement %12,   %11, i64 1  — <2 x float> uv = (u, v)
  // @IR %14 = @air.sample_texture_2d.v4f16(colorMap, sampler, %13, …)
  //     %15 = extractvalue %14, 0              — <4 x half> (discard i8 flag)
  //     %16 = @air.convert.f.v4f32.f.v4f16(%15) — widen fp16 → fp32
  const texel = sampleColorMap([u, v]);
  const r = Math.fround(texel[0]);
  const g = Math.fround(texel[1]);
  const b = Math.fround(texel[2]);
  const a = Math.fround(texel[3]);
  // @IR ret <4 x float> %16
  return {
    color: [r, g, b, a],
  };
}
