// Faithful transcription @0x0000000000034156 (metallib entry offset)
// @shader SolidFragmentFunc (MDPKit)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/SolidFragmentFunc.ll, extracted via
// raw-port/tools/shader_disasm.sh from MDPKit.framework/Versions/A/Resources/
// default.metallib. The .ll header line reads
// `0x000000000034156 -- SolidFragmentFunc:` — the shader's entry offset in the metallib.
// Compile options: `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`.
//
// This is the SIMPLEST possible fragment shader — a "solid colour" passthrough. The
// entire function body is a single insert-and-return:
//
//   define <{ <4 x float> }> @SolidFragmentFunc(<4 x float> %0, <4 x float> %1) #0 {
//     %3 = insertvalue <{ <4 x float> }> undef, <4 x float> %1, 0
//     ret <{ <4 x float> }> %3
//   }
//
// Fragment signature (from !32..!34):
//   position : float4  air.position           — declared with `air.arg_unused`.
//   color    : float4  air.fragment_input     — vertex-interpolated colour.
//   output   : float4  air.render_target      — the colour that comes out.
//
// The `%0` (position) argument is bound but tagged `air.arg_unused`, and the shader body
// discards it (only `%1` is fed into `%3 = insertvalue`). The output is bit-identical
// to the interpolated input colour — no math, no branches, no memory ops.
//
// The function is decorated `readnone` (no memory reads) and lacks any `air.*` intrinsic
// call — no fp32 arithmetic to fp32-narrow, no texture sample callback, no derivative
// intrinsic. The output value is a lane-by-lane copy of the input `<4 x float>` (rgba).
//
// This is the RGBA-passthrough companion to `AAStippledLineFragmentFunc` in the same
// MDPKit/MDPSolid.metal translation unit — a solid line that skips the brush texture
// and stipple pattern entirely. It is used by MDPKit to draw plain filled shapes with a
// vertex-interpolated tint (no premultiply/gamma/coverage math).

/** Mutating accumulator for a `<4 x float>` value — avoids tuple returns per SHADERS.md. */
export interface RgbaOut {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Fragment shader `SolidFragmentFunc`.
 *
 * A no-op passthrough of the vertex-interpolated `color` input to the render-target
 * output. The `position` argument is bound but tagged `air.arg_unused` — the shader
 * body reads only `%1` (color). No fp32 arithmetic, no memory reads, no intrinsics.
 *
 * Writes the result into `out` (mutating accumulator, per SHADERS.md).
 *
 * @shader SolidFragmentFunc (MDPKit)
 */
export function SolidFragmentFunc(
  _position: [number, number, number, number],
  color: [number, number, number, number],
  out: RgbaOut,
): void {
  // %3 = insertvalue undef, %1, 0 ; ret %3  — lane-by-lane copy of the input rgba.
  // No Math.fround: there is no arithmetic. The lanes are transported bit-for-bit
  // from the input vertex-interpolator output slot to the render-target slot.
  out.r = color[0];
  out.g = color[1];
  out.b = color[2];
  out.a = color[3];
}
