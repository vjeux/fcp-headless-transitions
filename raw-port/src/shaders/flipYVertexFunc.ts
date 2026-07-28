// flipYVertexFunc.ts — trivial pass-through vertex shader.
// @shader flipYVertexFunc (Lithium)
// Source IR: raw-port/re/shaders/flipYVertexFunc.ll
// Compiled from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib @0x0000000000ccf9
//
// Byte-identical AIR IR body to sibling passthrough vertex passes (ccVertexFunc,
// cdVertexFunc, depthDownsampleVertexFunc) — the shaders differ only in the metallib
// entry offset and their name; the body (shufflevector + insertvalue pattern) is exactly
// the same. Kept as a distinct ONE-shader-per-file port per SHADERS.md.
//
// NOTE ON THE NAME: the shader is named "flipYVertexFunc" but the IR performs NO
// coordinate flip — the position is lifted to (x, y, 0.0, 1.0) unchanged and the
// texCoord is copied unchanged. Any Y-flip effect the pipeline achieves is done in the
// caller (input geometry or a different fragment sampling path), NOT in this shader.
// A faithful transcription therefore matches the passthrough sibling shaders bit-exactly.
//
// LLVM IR signature (from the .ll):
//   define <{ <4 x float>, <2 x float> }>
//     @flipYVertexFunc(
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

/**
 * Output struct mirroring the IR return type `<{ <4 x float>, <2 x float> }>`.
 *
 * slot 0: position (air.position, "position") — clip-space float4.
 * slot 1: uv       (air.vertex_output "uv", generated(2uvDv2_f)) — passthrough texcoord float2.
 */
export interface FlipYVertexFuncOutput {
  position: [number, number, number, number]; // slot 0 — air.position
  uv: [number, number];                        // slot 1 — air.vertex_output "uv"
}

/**
 * @shader flipYVertexFunc (Lithium) — faithful port of the AIR IR.
 *
 * @param position 2D input position (%0, air.vertex_input at location 0).
 * @param texCoord 2D input texture coordinate (%1, air.vertex_input at location 1).
 */
export function flipYVertexFunc(
  position: [number, number],
  texCoord: [number, number],
): FlipYVertexFuncOutput {
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
