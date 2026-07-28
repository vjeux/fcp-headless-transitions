// Faithful transcription — see raw-port/re/shaders/LineFragmentFunc.ll
// @shader LineFragmentFunc (MDPKit)
// @0x0000000000e8e6 — MDPKit.framework/Versions/A/Resources/default.metallib
//
// Trivial pass-through fragment shader from MDPKit's MDPLine.metal source
// (frame @DISubprogram !35 line 55, source file MDPKit/Shaders/MDPLine.metal
// line 59 column 5). Draws a straight solid line: the vertex stage interpolates
// the per-vertex color across the primitive and this fragment stage forwards
// that interpolated color unchanged to the single render_target-0 output.
//
// Source LLVM IR: raw-port/re/shaders/LineFragmentFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh LineFragmentFunc MDPKit`).
//
// AIR signature (from air.fragment !29 and !33..!34):
//   define <{ <4 x float> }> @LineFragmentFunc(
//     <4 x float> position   ; !33 air.position, air.arg_unused (never read)
//     <4 x float> color      ; !34 air.fragment_input, air.perspective (interpolated)
//   ) -> struct { float4 color }    ; single render target 0, RGBA float
//
// Function attributes: `mustprogress nofree norecurse nosync nounwind readnone
// willreturn` plus `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, and `air.compile.fast_math_enable`.
// The function body has no arithmetic — just a single `insertvalue` that wraps
// %1 (the color input) into the return struct — so all the fast-math flags are
// signature only for this shader.
//
// IR line map (%N → semantics):
//   %3  insertvalue <{ <4 x float> }> undef, <4 x float> %1, 0     ; wrap color in struct
//   ret <{ <4 x float> }> %3                                        ; return the color
//
// The wrapping return type `<{ <4 x float> }>` (a packed struct with a single
// vec4) is Metal's convention for "one render_target" output — the runtime
// unwraps that on write. We simply return the vec4.
//
// This is the fragment half of MDPKit's line-drawing pipeline; the AA cap
// variant (which samples a brush + brushCap texture and applies gamma) lives
// alongside as AALineCapFragmentFunc.ts. A plain line body has no texturing —
// the color is entirely established at the vertex stage.

/**
 * LineFragmentFunc — pass the interpolated vertex color straight to the
 * render target. No sampling, no math, no uniforms.
 *
 * @param position air.position float4 (%0). Declared air.arg_unused in !33 —
 *                 present in the signature but never read.
 * @param color    air.fragment_input float4 (%1). The per-vertex color
 *                 interpolated by the fragment interpolator with perspective
 *                 correction (per !34's air.perspective attribute).
 * @returns        fp32 vec4 RGBA — the render_target-0 output color, exactly
 *                 equal to the input `color`.
 */
export function LineFragmentFunc(
  position: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
): [number, number, number, number] {
  // %0 (position) is declared air.arg_unused in !33 — signature only.
  void position;

  // %3: insertvalue <{ <4 x float> }> undef, <4 x float> %1, 0
  // ret <{ <4 x float> }> %3
  //
  // No fp arithmetic in the IR — the values pass through the fragment stage
  // bit-identically. Copy the four lanes into a fresh tuple so we don't alias
  // the caller's array.
  return [color[0], color[1], color[2], color[3]];
}
