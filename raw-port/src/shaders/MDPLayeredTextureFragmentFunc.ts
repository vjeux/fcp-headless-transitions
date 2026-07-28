// Faithful transcription @0x00000000008f26
// @shader MDPLayeredTextureFragmentFunc (MDPKit/default) @0x00000000008f26
// Source IR: raw-port/re/shaders/MDPLayeredTextureFragmentFunc.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/MDPKit.framework/
//     Versions/A/Resources/default.metallib
// via raw-port/tools/shader_disasm.sh — first-line offset in that .ll is
// `0x00000000008f26 -- MDPLayeredTextureFragmentFunc:`)
//
// From DICompileUnit !0 the source .metal file is
//   /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPLayeredTexture.metal
// and DILocation !42..!78 place the body at lines 47..60 of that file. The four
// per-channel arithmetic lines are 54/55/56/57 (rgb + a) with a final `* color` at 58.
//
// Composites a base texture UNDER an outline texture using a mask alpha as the "amount
// of base to show inside the outline". Standard alpha-over between the outline and
// (mask.a-scaled base), then a per-vertex color tint at the end.
//
// Signature from !air.fragment (!29..!41):
//   fragment struct { float4 color [[color(0)]]; }
//   MDPLayeredTextureFragmentFunc(
//       float4              position          [[position, center, no_perspective]],  // %0, UNUSED
//       float4              color             [[stage_in]] "color",                  // %1
//       float2              texCoord          [[stage_in]] "texCoord",               // %2
//       texture2d<float>    tex               [[texture(0)]] "tex",                  // %3
//       sampler             texSampler        [[sampler(0)]] "texSampler",           // %4
//       texture2d<float>    maskTex           [[texture(1)]] "maskTex",              // %5
//       sampler             maskTexSampler    [[sampler(1)]] "maskTexSampler",       // %6
//       texture2d<float>    outlineTex        [[texture(2)]] "outlineTex",           // %7
//       sampler             outlineTexSampler [[sampler(2)]] "outlineTexSampler"     // %8
//   );
//
// IR body (single BB — no branches, no undecoded callees):
//   %10 = sample(tex,        texSampler,        texCoord)  → texel     (%11)
//   %12 = sample(maskTex,    maskTexSampler,    texCoord)  → maskTexel (%13)
//   %14 = sample(outlineTex, outlineTexSampler, texCoord)  → outlineTexel (%15)
//
//   %16 = outlineTexel.x
//   %17 = outlineTexel.a
//   %18 = 1.0 - outlineTexel.a                          — outline transparency
//   %19 = maskTexel.a
//   %20 = %18 * maskTexel.a                             — "how much base to show"
//   %21 = texel.x
//   %22 = %20 * texel.x
//   %23 = %22 + outlineTexel.x                          — out.r
//   %24 = <r, ?, ?, ?>
//   %25 = outlineTexel.y
//   %26 = texel.y
//   %27 = %20 * texel.y
//   %28 = %27 + outlineTexel.y                          — out.g
//   %29 = <r, g, ?, ?>
//   %30 = outlineTexel.z
//   %31 = texel.z
//   %32 = %20 * texel.z
//   %33 = %32 + outlineTexel.z                          — out.b
//   %34 = <r, g, b, ?>
//   %35 = texel.a
//   %36 = %20 * texel.a
//   %37 = %36 + outlineTexel.a                          — out.a
//   %38 = <r, g, b, a>
//   %39 = %38 * color                                    — component-wise tint
//   ret { %39 }
//
// Notes:
//   - "fmul fast" / "fadd fast" / "fsub fast" everywhere, plus fast_math + no-nans/no-
//     infs. Metal fp32 semantics — coerce with Math.fround at every fp op.
//   - The blend is a hand-rolled "outline OVER (mask.a * texel)":
//         out = outlineTexel + (1 - outlineTexel.a) * maskTexel.a * texel
//     — but note this uses ONLY the OUTLINE's alpha for the "over" weight; the mask
//     alpha rides along in the multiplier. The base color is expected premultiplied
//     (otherwise the % maskTexel.a weight would double-apply on the rgb channels).
//   - Final `* color` is component-wise on all four channels (RGBA), matching the AAL
//     line pattern: colour comes in premultiplied.

/**
 * Sampled-texel type: what `sample()` returns. A pixel-space float4 RGBA.
 */
export type SampleFn = (uv: [number, number]) => [number, number, number, number];

/**
 * MDPLayeredTextureFragmentFunc — one fragment.
 *
 * @param position           [[position]] — provided by rasterizer; UNUSED (marked
 *                           `air.arg_unused` at !33). Kept in the signature to mirror IR.
 * @param color              per-vertex interpolated colour (premultiplied RGBA).
 * @param texCoord           per-vertex interpolated texture UV, shared by all three
 *                           samplers.
 * @param sampleTex          closure that samples `tex`         with `texSampler`.
 * @param sampleMaskTex      closure that samples `maskTex`     with `maskTexSampler`.
 * @param sampleOutlineTex   closure that samples `outlineTex`  with `outlineTexSampler`.
 * @returns                  `{ color }` — the fragment output at render_target 0.
 *
 * @IR entire function @0x00000000008f26.
 */
export function MDPLayeredTextureFragmentFunc(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position: [number, number, number, number],
  color: [number, number, number, number],
  texCoord: [number, number],
  sampleTex: SampleFn,
  sampleMaskTex: SampleFn,
  sampleOutlineTex: SampleFn,
): {
  /** render_target 0 — float4 premultiplied RGBA. @IR %39 */
  color: [number, number, number, number];
} {
  // @IR %10 = sample(tex,        texSampler,        texCoord); %11 = extractvalue
  //     %12 = sample(maskTex,    maskTexSampler,    texCoord); %13 = extractvalue
  //     %14 = sample(outlineTex, outlineTexSampler, texCoord); %15 = extractvalue
  const texel = sampleTex([texCoord[0], texCoord[1]]);
  const maskTexel = sampleMaskTex([texCoord[0], texCoord[1]]);
  const outlineTexel = sampleOutlineTex([texCoord[0], texCoord[1]]);
  // @IR %17 = outlineTexel.a
  //     %18 = fsub fast 1.0, outlineTexel.a
  const oneMinusOutA = Math.fround(1.0 - outlineTexel[3]);
  // @IR %19 = maskTexel.a
  //     %20 = fmul fast %18, maskTexel.a       — "how much base to show"
  const baseAmount = Math.fround(oneMinusOutA * maskTexel[3]);
  // @IR %21..%23 — out.r = baseAmount * texel.r + outlineTexel.r
  //     %25..%28 — out.g = baseAmount * texel.g + outlineTexel.g
  //     %30..%33 — out.b = baseAmount * texel.b + outlineTexel.b
  //     %35..%37 — out.a = baseAmount * texel.a + outlineTexel.a
  const outR = Math.fround(Math.fround(baseAmount * texel[0]) + outlineTexel[0]);
  const outG = Math.fround(Math.fround(baseAmount * texel[1]) + outlineTexel[1]);
  const outB = Math.fround(Math.fround(baseAmount * texel[2]) + outlineTexel[2]);
  const outA = Math.fround(Math.fround(baseAmount * texel[3]) + outlineTexel[3]);
  // @IR %39 = fmul fast <r,g,b,a>, color   — component-wise RGBA tint
  return {
    color: [
      Math.fround(outR * color[0]),
      Math.fround(outG * color[1]),
      Math.fround(outB * color[2]),
      Math.fround(outA * color[3]),
    ],
  };
}
