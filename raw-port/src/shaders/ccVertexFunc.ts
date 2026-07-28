// ccVertexFunc.ts — trivial pass-through vertex shader.
// @shader ccVertexFunc (Lithium)
// Source IR: raw-port/re/shaders/ccVertexFunc.ll
// Compiled from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib @0x00000000009049
//
// LLVM IR signature (from the .ll):
//   define <{ <4 x float>, <2 x float> }>
//     @ccVertexFunc(
//         <2 x float> %0 = per-vertex position input at location 0 (!20, "position")
//       , <2 x float> %1 = per-vertex texCoord input at location 1 (!21, "texCoord")
//     )
// Vertex outputs (!16):
//   slot 0 : air.position    float4 "position" — clip-space position
//   slot 1 : air.vertex_output float2 "uv"     — passthrough texcoord (generated(2uvDv2_f))
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. This shader does NO arithmetic — only
// shufflevector/insertvalue — so fp32 semantics are moot.
//
// The shader takes the 2D input position and lifts it to homogeneous 4D as
// (x, y, 0.0, 1.0); texCoord is copied unchanged to the "uv" vertex_output. There is no
// projection matrix — the CPU-side caller is expected to supply already-clip-space (x, y).

/**
 * Output struct mirroring the IR return type `<{ <4 x float>, <2 x float> }>`.
 *
 * slot 0: position (air.position, "position") — clip-space float4.
 * slot 1: uv       (air.vertex_output "uv", generated(2uvDv2_f)) — passthrough texcoord float2.
 */
export interface CcVertexFuncOutput {
  position: [number, number, number, number]; // slot 0 — air.position
  uv: [number, number];                        // slot 1 — air.vertex_output "uv"
}

/**
 * @shader ccVertexFunc (Lithium) — faithful port of the AIR IR.
 *
 * @param position 2D input position (%0, air.vertex_input at location 0).
 * @param texCoord 2D input texture coordinate (%1, air.vertex_input at location 1).
 */
export function ccVertexFunc(
  position: [number, number],
  texCoord: [number, number],
): CcVertexFuncOutput {
  // %3 = shufflevector <2 x float> %0, poison, <0, 1, undef, undef>
  //   Widen the 2-lane position to 4 lanes with lanes 2,3 undef.
  // %4 = shufflevector <4 x float> %3,
  //                    <float poison, float poison, float 0.0, float 1.0>,
  //                    <0, 1, 6, 7>
  //   Pick lanes 0,1 from %3 (x, y) and lanes 6,7 from the constant vector (0.0, 1.0).
  //   Net effect: build <x, y, 0.0, 1.0>.
  const outPos: [number, number, number, number] = [
    position[0],
    position[1],
    0.0,
    1.0,
  ];

  // %5 = insertvalue <{ <4 x float>, <2 x float> }> undef, <4 x float> %4, 0
  //   Store the widened position into output slot 0.
  // %6 = insertvalue <{ <4 x float>, <2 x float> }> %5, <2 x float> %1, 1
  //   Store the texCoord (unchanged) into output slot 1 ("uv").
  const outUv: [number, number] = [texCoord[0], texCoord[1]];

  // ret <{ <4 x float>, <2 x float> }> %6
  return {
    position: outPos,
    uv: outUv,
  };
}
