// @shader triangleSamplingShader (Flexo)
//
// Fragment shader from Flexo.framework/Versions/A/Resources/default.metallib
// at offset 0x000173f0. Transcribed verbatim from LLVM IR — see
// raw-port/re/shaders/triangleSamplingShader.ll.
//
// SIGNATURE (from the .ll and !air.fragment metadata !15/!17/!19/!20):
//   define <4 x float> @triangleSamplingShader(
//       <4 x float> %0,           // clipSpacePosition (air.position, unused per !19 "air.arg_unused")
//       <4 x float> returned %1   // color             (air.fragment_input, interpolated)
//   ) -> <4 x float>              // air.render_target 0
//
// BODY (single IR line):
//   ret <4 x float> %1
//
// This is a solid-color triangle fragment shader — it takes the interpolated
// per-vertex color from the rasterizer and returns it unchanged. The `returned`
// attribute on %1 in the IR is the Metal compiler's way of encoding that the
// fragment output is literally the second argument, no per-fragment work.
//
// The clipSpacePosition (%0) is marked "air.arg_unused" in the fragment metadata
// (!19), confirming the position input is not read by the shader.
//
// FP FLAGS. Attributes #0 include "unsafe-fp-math"="true" +
// "approx-func-fp-math"+"no-infs-fp-math"+"no-nans-fp-math"+"no-signed-zeros-fp-math"
// (fast-math flags) — irrelevant here because there is no arithmetic.

/** RGBA color4, matching the fragment output at air.render_target 0. */
export type Float4 = [number, number, number, number];

/**
 * triangleSamplingShader — see the .ll. Pure identity on the color input.
 *
 * @param color  the interpolated per-fragment color (%1, air.fragment_input)
 * @returns      the same color, verbatim (`ret <4 x float> %1`)
 */
export function triangleSamplingShader(color: Float4): Float4 {
  // ret <4 x float> %1   // pass-through; no arithmetic, no texture, no state.
  return [color[0], color[1], color[2], color[3]];
}
