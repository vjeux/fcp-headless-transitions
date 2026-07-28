// @shader cocVertexFunc (Lithium/LiSolidShaders) @0x00000000006009
// Source IR: raw-port/re/shaders/cocVertexFunc.ll
// (extracted from Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib via
// raw-port/tools/shader_disasm.sh). The .ll header line reads
// `0x00000000006009 -- cocVertexFunc:` — the shader's entry offset in the metallib.
//
// Trivial fullscreen-quad passthrough vertex shader — the circle-of-confusion (defocus)
// pipeline entry vertex, byte-identical body to `blurVertexFunc` and `blurDepthVertexFunc`.
// Given a per-vertex 2D clip-space `position` and a 2D `texCoord`, emits:
//   air.position   = float4(position.x, position.y, 0.0, 1.0)
//   air.vertex_out = texCoord           (float2, unmodified)
//
// Direct TS mapping: no arithmetic, only lane splatting and constant injection at lanes
// 2/3 of position. The IR body is 4 SSA values:
//   %3 = shufflevector position, poison, <0, 1, undef, undef>
//   %4 = shufflevector %3, <poison, poison, 0.0, 1.0>, <0, 1, 6, 7>
//   %5 = insertvalue undef, %4, 0
//   %6 = insertvalue %5, texCoord, 1
//   ret %6
//
// Signature from !air.vertex (!15..!21):
//   vertex struct { float4 position [[position]]; float2 uv [generated(2uvDv2_f)]; }
//   cocVertexFunc(
//       float2 position [[vertex_input(0)]],
//       float2 texCoord [[vertex_input(1)]]);
//
// Denorms / fast-math (from !12..!14):
//   air.compile.denorms_disable
//   air.compile.fast_math_enable   — NO arithmetic ops in this shader, so no Math.fround
//   is required (the 0.0 and 1.0 lane constants are exact fp32).

/**
 * cocVertexFunc — one vertex.
 *
 * @param position clip-space 2D position (vertex_input 0)
 * @param texCoord passthrough uv (vertex_input 1)
 * @returns the vertex outputs: `{ position4, uv }`
 *
 * @IR entire function @0x00000000006009.
 */
export function cocVertexFunc(
  position: [number, number],
  texCoord: [number, number],
): {
  /** air.position — float4(position.xy, 0.0, 1.0). @IR %4 */
  position: [number, number, number, number];
  /** vertex_output "uv" — passthrough texCoord. @IR %6 (insertvalue field 1) */
  uv: [number, number];
} {
  // @IR %3 = shufflevector position, poison, <0, 1, undef, undef>
  //     %4 = shufflevector %3, <poison, poison, 0.0, 1.0>, <0, 1, 6, 7>
  //     → position4 = (position.x, position.y, 0.0, 1.0)
  const position4: [number, number, number, number] = [
    position[0],
    position[1],
    0.0,
    1.0,
  ];
  // @IR %5 = insertvalue undef, position4, 0
  //     %6 = insertvalue %5, texCoord, 1
  //     ret %6
  return {
    position: position4,
    uv: [texCoord[0], texCoord[1]],
  };
}
