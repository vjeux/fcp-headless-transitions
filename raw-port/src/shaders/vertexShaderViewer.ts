// Faithful transcription @0x000000000041b8 — @shader vertexShaderViewer (Ozone)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/vertexShaderViewer.ll,
// extracted via `bash raw-port/tools/shader_disasm.sh vertexShaderViewer Ozone`
// from Ozone.framework/Versions/A/Resources/default.metallib. The .ll header
// line reads `0x000000000041b8 -- vertexShaderViewer:` — that is the shader's
// entry offset in the metallib. Compile options: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`, `air.compile.framebuffer_fetch_enable`.
//
// AIR signature (from !air.vertex !15 and !17..!19):
//   define <{ <4 x float> }> @vertexShaderViewer(
//     <3 x float> position  [air.vertex_input, location 0, "float3"/"position"]  ; !19
//   )
//   returns:
//     [0] float4 position   (air.position, "float4"/"position")                  ; !17
//
// The IR body is exactly four lines and does the trivial "float3 → float4 with
// w=1.0" clip-position pass-through:
//
//   %2 = shufflevector <3 x float> %0, <3 x float> poison,
//         <4 x i32> <i32 0, i32 1, i32 2, i32 undef>  ; widen xyz, undef w
//   %3 = insertelement <4 x float> %2, float 1.000000e+00, i64 3  ; w := 1.0
//   %4 = insertvalue <{ <4 x float> }> undef, <4 x float> %3, 0   ; struct[0] := %3
//   ret <{ <4 x float> }> %4
//
// There is no arithmetic — no fadd/fmul, no matrix multiply, no uniforms, no
// buffers. Every input component is copied verbatim into the output; the w
// lane is a literal fp32 1.0. `fast_math_enable` on the function attrs is
// therefore inert here — there is nothing to reassociate. Math.fround is not
// required for a pure copy of an fp32 value, but the constant 1.0 is exactly
// representable in fp32 so `Math.fround(1)` is used for explicit fp32 provenance.
//
// This is the vertex stage of the Ozone "viewer" render pass (the fragment
// twin is `fragmentShaderViewer` in the same metallib): the input geometry
// is already provided in clip space, so the vertex shader just widens the
// float3 to a float4 clip position and hands it to the rasterizer.

export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];

/**
 * Output struct for `vertexShaderViewer`.
 *
 * Matches the IR return type `<{ <4 x float> }>` — a single-field aggregate
 * whose sole member is the clip-space `air.position` (per !17).
 */
export interface VertexShaderViewerOutput {
  /** clip-space position — float4 (air.position) */
  readonly position: Vec4;
}

/**
 * vertexShaderViewer — Ozone default.metallib vertex entry @0x000000000041b8.
 *
 * Widens a float3 vertex position to a float4 clip-space position with w=1.
 *
 * IR (verbatim):
 *   %2 = shufflevector position, poison, <0,1,2,undef>
 *   %3 = insertelement %2, 1.0, 3
 *   %4 = insertvalue undef, %3, 0
 *   ret %4
 *
 * @param position  per-vertex float3 (air.vertex_input, location 0)
 * @returns         { position: float4(xyz, 1.0) }
 */
export function vertexShaderViewer(position: Vec3): VertexShaderViewerOutput {
  // %2: shufflevector <3 x float> position, poison, <0,1,2,undef>
  //   Lanes 0..2 come from `position`; lane 3 is `undef` (any bit pattern
  //   is legal here — it will be immediately overwritten by the following
  //   insertelement). We seed it with 0 for determinism; the observable
  //   result is unchanged because %3 overwrites lane 3.
  const s0 = position[0];
  const s1 = position[1];
  const s2 = position[2];

  // %3: insertelement <4 x float> %2, float 1.000000e+00, i64 3
  //   Lane 3 becomes exactly fp32 1.0.
  // %4: insertvalue <{ <4 x float> }> undef, <4 x float> %3, 0
  //   Wrap the float4 as the sole member of the return aggregate.
  return {
    position: [s0, s1, s2, Math.fround(1)],
  };
}
