// Faithful transcription @0x0000000000278f
// @shader chromaVerb_vertex_textured (MAPlugInGUISwift/default) @0x0000000000278f
// Source IR: raw-port/re/shaders/chromaVerb_vertex_textured.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/EDEL.framework/Versions/A/
//     Frameworks/MAPlugInGUISwift.framework/Versions/A/Resources/default.metallib
// via raw-port/tools/shader_disasm.sh). The .ll header reads
// `0x0000000000278f -- chromaVerb_vertex_textured:` — the shader's entry offset in the
// metallib.
//
// Vertex-array-lookup passthrough. Unlike the mcVertexFunc / blurVertexFunc family
// (which take per-vertex `position` / `texCoord` as vertex_input attributes), this
// variant reads BOTH from indexed constant buffers using [[vertex_id]] as the index:
//
//   air.position   = positions[vid]                (float4, verbatim — NOT xy,0,1)
//   air.vertex_out = texCoords[vid]                (float2, verbatim)
//
// The IR body is exactly 7 SSA values — a zext of the u32 vid, two indexed loads, and
// two insertvalues that build the return struct. No arithmetic at all.
//   %4  = zext i32 vid to i64
//   %5  = getelementptr <4 x float>, positions, %4
//   %6  = load  <4 x float>, %5
//   %7  = getelementptr <2 x float>, texCoords, %4
//   %8  = load  <2 x float>, %7
//   %9  = insertvalue undef, %6, 0
//   %10 = insertvalue %9,    %8, 1
//   ret %10
//
// Signature from !air.vertex (!15..!22):
//   vertex struct { float4 position [[position]]; float2 texCoord [generated]; }
//   chromaVerb_vertex_textured(
//       constant float4* positions   [[buffer(0)]],
//       constant float2* texCoords   [[buffer(1)]],
//       uint             vid         [[vertex_id]]);
//
// Denorms / fast-math (from !12..!14):
//   air.compile.denorms_disable
//   air.compile.fast_math_enable   — no arithmetic ops, so no Math.fround needed.
//
// Sibling: chromaVerb_vertex_untextured (same family, presumably drops the texCoord
// output — not this file).

/**
 * chromaVerb_vertex_textured — one vertex.
 *
 * @param positions  constant buffer 0 — per-vertex float4 (typically clip-space, NOT
 *                   pre-splatted from a float2; the shader emits the full float4 verbatim).
 * @param texCoords  constant buffer 1 — per-vertex float2 texCoord.
 * @param vid        [[vertex_id]] — index into both buffers (u32, treated as u64).
 * @returns the vertex outputs `{ position, texCoord }`.
 *
 * @IR entire function @0x0000000000278f.
 */
export function chromaVerb_vertex_textured(
  positions: ReadonlyArray<[number, number, number, number]>,
  texCoords: ReadonlyArray<[number, number]>,
  vid: number,
): {
  /** air.position — positions[vid] verbatim. @IR %6 */
  position: [number, number, number, number];
  /** vertex_output "texCoord" — texCoords[vid] verbatim. @IR %8 */
  texCoord: [number, number];
} {
  // @IR %4 = zext i32 vid to i64  — treat the u32 vertex id as an unsigned index.
  //     In JS all array indices are safe integers, so we just coerce to a
  //     non-negative int and let the array access handle it.
  const i = vid >>> 0;
  // @IR %5 = getelementptr <4 x float>, positions, i
  //     %6 = load  <4 x float>, %5
  const p = positions[i];
  // @IR %7 = getelementptr <2 x float>, texCoords, i
  //     %8 = load  <2 x float>, %7
  const t = texCoords[i];
  // @IR %9  = insertvalue undef, %6, 0
  //     %10 = insertvalue %9,    %8, 1
  //     ret %10
  return {
    position: [p[0], p[1], p[2], p[3]],
    texCoord: [t[0], t[1]],
  };
}
