// @shader vectorscope_fragment_shader (Flexo) @0x00000000011500
//
// Metallib offset from raw-port/re/shaders/vectorscope_fragment_shader.ll
// header line `0x00000000011500 -- vectorscope_fragment_shader:` — the
// shader's entry offset in Flexo.framework/Versions/A/Resources/default.metallib.
//
// IDENTITY-COLOR FRAGMENT SHADER. The entire body of the IR is a single
// return of the second argument (%1, the "Cs" per-vertex color input);
// no arithmetic, no texture sampling, no shufflevector, no math intrinsics
// are used. The shader simply passes the interpolated fragment color
// straight to render-target 0. The vectorscope scope-drawing math is done
// entirely outside this shader (in the CPU-side geometry step that emits
// the vertex stream feeding %1); this shader is the trivial per-pixel
// pass-through that lets the interpolated Cs land in the framebuffer.
//
// Provenance: LLVM AIR IR in raw-port/re/shaders/vectorscope_fragment_shader.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// Flexo.framework/Versions/A/Resources/default.metallib. Compile options
// in the .ll: `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`; function attribute set #0 also
// carries `unsafe-fp-math=true`, `no-infs/nans/signed-zeros-fp-math=true`,
// `approx-func-fp-math=true`. Because the shader performs NO arithmetic,
// none of those fp relaxation flags impact the port — direct TS mapping
// of the identity return.
//
// Fragment metadata (from !air.fragment, !15..!21 in the .ll):
//   arg %0 = "P"  (float4, air.position, air.no_perspective) — UNUSED
//            (marked air.arg_unused in metadata !19).
//   arg %1 = "Cs" (float4, air.fragment_input, air.perspective) — the
//            per-vertex color, perspective-interpolated across the
//            fragment. Marked `returned` in the IR signature: LLVM knows
//            statically that the function returns exactly this argument.
//   arg %2 = "st" (float2, air.fragment_input, air.perspective) — UNUSED
//            (marked air.arg_unused in metadata !21).
//   return = "air.render_target" 0/0, float4.
//
// Line-by-line map from the .ll body (only one instruction!):
//   ret <4 x float> %1
//         -> return Cs as-is. The IR signature also marks %1 with the
//         `returned` attribute, an LLVM-level static promise that this
//         value passes through unchanged.

/**
 * Fragment shader `vectorscope_fragment_shader` — an identity pass-through
 * that returns the interpolated per-vertex color (%1, "Cs") unchanged as
 * the render-target 0 float4 output. Neither `P` (%0, screen-space
 * position) nor `st` (%2, 2D texcoord) is read.
 *
 * @shader vectorscope_fragment_shader (Flexo)
 * @param P  Screen-space position (float4) — UNUSED (air.arg_unused).
 * @param Cs Per-vertex color (float4) — returned unchanged.
 * @param st 2D texcoord (float2) — UNUSED (air.arg_unused).
 * @returns  Cs, verbatim; each channel is an fp32 value passed through.
 */
export function vectorscope_fragment_shader(
  P: [number, number, number, number],
  Cs: [number, number, number, number],
  st: [number, number],
): [number, number, number, number] {
  // Reference the unused params so the port surface matches the IR
  // signature exactly. void-effect: no read, no write, no math.
  void P;
  void st;

  // ret <4 x float> %1 — return Cs as-is (the IR marks %1 as `returned`,
  // a static promise of this exact identity).
  return [Cs[0], Cs[1], Cs[2], Cs[3]];
}
