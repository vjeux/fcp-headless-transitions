// Faithful transcription @0x00000000017926
// @shader AALineFragmentFunc (MDPKit/default) @0x00000000017926
// Source IR: raw-port/re/shaders/AALineFragmentFunc.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/MDPKit.framework/
//     Versions/A/Resources/default.metallib
// via raw-port/tools/shader_disasm.sh — the .ll first line reads
// `0x00000000017926 -- AALineFragmentFunc:`)
//
// From the DICompileUnit metadata (!0), the .metal source path is
//   /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPAALine.metal
// and the DISubprogram line info places the body at MDPAALine.metal:108-120 with inlined
// helpers:
//   sample()        @__bits/metal_texture2d:44-47   — texture2d.sample()
//   unpremultiply() @MDPAALine.metal:52-54          — rgb/max(a, 1e-6)
//   applyGamma()    @MDPAALine.metal:58-62          — pow(rgb, gamma) per channel
//   premultiply()   @MDPAALine.metal:46-48          — rgb * a
//
// Fragment shader for an antialiased brush-textured line: samples a brush texture, tints
// by the interpolated per-vertex color, and applies a per-channel gamma curve in
// straight-alpha space (unpremultiply → pow → premultiply) so the gamma is applied to
// the tinted color and not to the alpha channel.
//
// Signature from !air.fragment (!29..!39):
//   fragment struct { float4 color [[color(0)]]; }
//   AALineFragmentFunc(
//       float4              position     [[position, center, no_perspective]],   // %0, unused
//       float4              color        [[stage_in]] (generated "color"),       // %1
//       float2              brushTexCoord[[stage_in]] (generated "brushTexCoord"),// %2
//       constant MDPAALineUniforms* uniforms  [[buffer(0)]],                     // %3
//       texture2d<float>    brush        [[texture(0)]],                         // %4
//       sampler             brushSampler [[sampler(0)]]);                        // %5
//
// struct MDPAALineUniforms {                    // total 80 bytes, align 16 (!36/!37)
//   float4x4 mvp;              // offset  0, size 64 — UNUSED in this fragment
//   float2   gamma;            // offset 64, size  8 — .x unused here, .y = exponent
//   uint     stipplePattern;   // offset 72, size  4 — UNUSED in this fragment
//   float    stippleScale;     // offset 76, size  4 — UNUSED in this fragment
// };
//
// IR body (single BB, straight-line):
//   %7  = sample_texture_2d.v4f32(brush, brushSampler, brushTexCoord, ...)
//   %8  = extractvalue %7, 0            — RGBA texel from brush
//   %9  = fmul fast %8, color           — tint the brush by the per-vertex color
//   %10 = shufflevector %9 <0,1,2>      — take RGB
//   %11 = extractelement %9, 3          — take A
//   %12 = air.fast_fmax(%11, 0x3EB0C6F7A0000000 = 1e-6)
//                                       — clamp alpha away from 0 so the divide is safe
//   %14 = splat3(%12)                   — <a', a', a'>
//   %15 = fdiv fast %10, %14            — unpremultiply: rgb / a'
//   %17 = load uniforms.gamma           — <2 x float>
//   %18 = extractelement %17, 1         — gamma.y — the exponent
//   %20/%23/%26 = air.fast_pow(rgb[i], gamma.y)   — per-channel gamma
//   %27         = <pow_r, pow_g, pow_b>
//   %28         = splat3(color_after_tint.a) = splat3(%9.a)
//   %29         = fmul fast %27, %28    — re-premultiply: pow_rgb * a  (uses ORIGINAL
//                                         premultiplied alpha, not the max-clamped one)
//   %30/%31     = pack {pow_r*a, pow_g*a, pow_b*a, %9.a}
//   return { color: %31 }
//
// Notes:
//   - "fmul fast" / "fdiv fast" plus air.compile.fast_math_enable + no-nans/no-infs/no-
//     signed-zeros flags. Metal fp32 semantics — coerce with Math.fround at every fp op.
//   - The re-premultiply uses the ORIGINAL alpha `%9.a` (not the max-clamped `%12`), so
//     if incoming alpha is exactly 0 the output is fully transparent as intended and the
//     rgb pow contribution multiplies to zero.
//   - `air.fast_pow.f32(x, y)` — undefined for x<0 (the AIR "fast" family); the incoming
//     rgb here is `texel.rgb * color.rgb / max(texel.a*color.a, 1e-6)`, i.e. the
//     unpremultiplied color, which for a well-behaved premultiplied brush stays ≥0.

/**
 * Uniforms buffer for AALineFragmentFunc — MDPAALineUniforms.
 * Total 80 bytes, align 16.
 *
 * From !37 struct_type_info:
 *   offset  0: float4x4 mvp             (unused in this fragment shader)
 *   offset 64: float2   gamma           (.x unused; .y is the exponent)
 *   offset 72: uint     stipplePattern  (unused in this fragment shader)
 *   offset 76: float    stippleScale    (unused in this fragment shader)
 */
export interface MDPAALineUniforms {
  /** float4x4 mvp — unused by the fragment shader. */
  mvp: readonly [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
  /** float2 gamma — only `.y` is read by AALineFragmentFunc (as the pow exponent). */
  gamma: [number, number];
  /** uint stipplePattern — unused by the fragment shader. */
  stipplePattern: number;
  /** float stippleScale — unused by the fragment shader. */
  stippleScale: number;
}

/**
 * Sampled-texel type: what `sample()` returns. A pixel-space float4 RGBA sampled from
 * the brush texture at `brushTexCoord`, in whatever colour space the brush texture was
 * created with (typically straight or premultiplied — the shader treats it as
 * premultiplied since it unpremultiplies below).
 */
export type SampleFn = (uv: [number, number]) => [number, number, number, number];

/**
 * AALineFragmentFunc — one fragment.
 *
 * @param position       [[position]] — provided by rasterizer; UNUSED (marked
 *                       `air.arg_unused` at !33). Kept in the signature to mirror IR.
 * @param color          per-vertex interpolated color (premultiplied RGBA).
 * @param brushTexCoord  per-vertex interpolated brush texture UV.
 * @param uniforms       MDPAALineUniforms — only `gamma.y` is read.
 * @param sampleBrush    closure that samples the brush texture with the shader's
 *                       sampler at a given UV (mirrors `air.sample_texture_2d.v4f32`).
 *                       The extra scalar result of the IR call (occlusion flag, i8) is
 *                       ignored (the IR only reads `extractvalue %7, 0`).
 * @returns              `{ color }` — the fragment output at render_target 0.
 *
 * @IR entire function @0x00000000017926.
 */
export function AALineFragmentFunc(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position: [number, number, number, number],
  color: [number, number, number, number],
  brushTexCoord: [number, number],
  uniforms: MDPAALineUniforms,
  sampleBrush: SampleFn,
): {
  /** render_target 0 — float4 premultiplied RGBA. @IR %31 */
  color: [number, number, number, number];
} {
  // @IR %7 = air.sample_texture_2d.v4f32(brush, brushSampler, brushTexCoord, ...)
  //     %8 = extractvalue %7, 0
  const texel = sampleBrush([brushTexCoord[0], brushTexCoord[1]]);
  // @IR %9 = fmul fast %8, color    — component-wise RGBA tint
  const tintedR = Math.fround(texel[0] * color[0]);
  const tintedG = Math.fround(texel[1] * color[1]);
  const tintedB = Math.fround(texel[2] * color[2]);
  const tintedA = Math.fround(texel[3] * color[3]);
  // @IR %10 = shufflevector %9, <0,1,2>   — RGB triple
  //     %11 = extractelement %9, 3        — alpha scalar
  //     %12 = air.fast_fmax(%11, 1e-6)    — divide-safety clamp
  //         literal 0x3EB0C6F7A0000000 (double) = 9.999999974752427e-07 ≈ 1e-6
  //         (the AIR fp32 literal is the top-32-bits view of the double)
  const safeA = Math.fround(Math.max(tintedA, Math.fround(1e-6)));
  // @IR %14 = splat3(%12)
  //     %15 = fdiv fast %10, %14         — unpremultiplied rgb
  const unpremR = Math.fround(tintedR / safeA);
  const unpremG = Math.fround(tintedG / safeA);
  const unpremB = Math.fround(tintedB / safeA);
  // @IR %16 = getelementptr uniforms, i32 1     — .gamma (float2 at offset 64)
  //     %17 = load  <2 x float>
  //     %18 = extractelement %17, 1              — gamma.y  (the exponent)
  const gammaY = Math.fround(uniforms.gamma[1]);
  // @IR %20 = air.fast_pow.f32(rgb.x, gamma.y)
  //     %23 = air.fast_pow.f32(rgb.y, gamma.y)
  //     %26 = air.fast_pow.f32(rgb.z, gamma.y)
  const powR = Math.fround(Math.pow(unpremR, gammaY));
  const powG = Math.fround(Math.pow(unpremG, gammaY));
  const powB = Math.fround(Math.pow(unpremB, gammaY));
  // @IR %28 = shufflevector %9, <3,3,3>    — splat original tinted-alpha (NOT %12)
  //     %29 = fmul fast %27, %28           — re-premultiply
  const outR = Math.fround(powR * tintedA);
  const outG = Math.fround(powG * tintedA);
  const outB = Math.fround(powB * tintedA);
  // @IR %30 = shufflevector %29, poison, <0,1,2,undef>
  //     %31 = shufflevector %30, %9, <0,1,2,7>   — take rgb from %29, a from %9
  //     %32 = insertvalue undef, %31, 0
  //     ret %32
  return {
    color: [outR, outG, outB, tintedA],
  };
}
