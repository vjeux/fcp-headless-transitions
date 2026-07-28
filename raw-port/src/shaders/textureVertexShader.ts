// @shader textureVertexShader (Flexo)
//
// Direct TS mapping of the AIR vertex shader shipped in
// Flexo.framework/Versions/A/Resources/default.metallib.
//
// Source IR: raw-port/re/shaders/textureVertexShader.ll
//   @0x00000000012fe0 -- textureVertexShader
//
// Signature (from AIR IR + air.vertex metadata !15):
//   <{ <4 x float>, <2 x float> }> @textureVertexShader(
//       i32 %0                                     ; air.vertex_id
//       %struct.AAPLTextureVertex addrspace(2)* %1 ; vertexArray[] buffer
//       <2 x i32> addrspace(2)* %2                 ; viewportSize (uint2*)
//   )
//
// AAPLTextureVertex layout (from !22):
//   { <2 x float> position; <2 x float> textureCoordinate; }
//
// Return struct:
//   { <4 x float> clipSpacePosition (air.position),
//     <2 x float> textureCoordinate (air.vertex_output) }
//
// The shader is a standard viewport-normalising vertex stage: it looks up the
// current vertex's model-space 2D position in the vertexArray, divides it by
// half the viewport size (converting a pixel-space rectangle centred on
// origin into normalised device coordinates ranging -1..+1), and passes the
// per-vertex texture coordinate through to the fragment stage unchanged.
//
// Fast-math flags on the module (unsafe-fp-math, no-nans, no-infs,
// no-signed-zeros, approx-func-fp-math) are the standard Metal fp32 build —
// use plain JS float ops (fp32-narrowed via Math.fround per multiply/divide).

/** AAPLTextureVertex — from !22 in the AIR module. */
export interface AAPLTextureVertex {
  /** float2 model-space position, in pixel units centred on the origin. */
  readonly position: readonly [number, number];
  /** float2 texture coordinate to pass through to the fragment stage. */
  readonly textureCoordinate: readonly [number, number];
}

/** Return type of the vertex shader — from !15 / air.position + air.vertex_output. */
export interface TextureVertexShaderOut {
  /** float4 clip-space position (x, y, 0.0, 1.0). Tagged with air.position. */
  readonly clipSpacePosition: readonly [number, number, number, number];
  /** float2 texture coordinate passed through unchanged. */
  readonly textureCoordinate: readonly [number, number];
}

/**
 * @shader textureVertexShader (Flexo)
 *
 * Direct TS mapping of the AIR IR — each %N line documented inline.
 *
 * @param vertexID          air.vertex_id (u32 index into vertexArray) — %0
 * @param vertexArray       AAPLTextureVertex[] buffer                 — %1
 * @param viewportSize      uint2 viewport dimensions (px)             — %2 (dereference of pointer)
 * @returns                 { clipSpacePosition, textureCoordinate }
 */
export function textureVertexShader(
  vertexID: number,
  vertexArray: readonly AAPLTextureVertex[],
  viewportSize: readonly [number, number],
): TextureVertexShaderOut {
  // %4 = zext i32 %0 to i64
  //   — index widening; no numeric effect at this scale.
  const idx = vertexID >>> 0; // u32 semantics preserved.

  // %5 = getelementptr &vertexArray[idx].position
  // %6 = load <2 x float>                          ; model-space position
  const vertex = vertexArray[idx];
  const posX = Math.fround(vertex.position[0]);
  const posY = Math.fround(vertex.position[1]);

  // %7 = load <2 x i32>                            ; viewportSize (uint2)
  const vpW = viewportSize[0] >>> 0;
  const vpH = viewportSize[1] >>> 0;

  // %8 = air.convert.f.v2f32.u.v2i32(%7)           ; unsigned int2 -> float2
  //   The intrinsic name spells out u2f narrowing; Metal's fast-math
  //   ensures fp32-narrowing on the two lanes.
  const vpWf = Math.fround(vpW);
  const vpHf = Math.fround(vpH);

  // %9 = fmul fast <2 x float> %8, <0.5, 0.5>      ; half-viewport in pixels
  const halfVpW = Math.fround(vpWf * Math.fround(0.5));
  const halfVpH = Math.fround(vpHf * Math.fround(0.5));

  // %10 = fdiv fast <2 x float> %6, %9             ; NDC = pos / half-viewport
  const ndcX = Math.fround(posX / halfVpW);
  const ndcY = Math.fround(posY / halfVpH);

  // %11 = shufflevector %10, poison, <i32 0, 1, undef, undef>
  //   — expand xy -> xy?? (widen to 4-vec, top lanes undef).
  // %12 = shufflevector %11, <poison, poison, 0.0, 1.0>, <i32 0, 1, 6, 7>
  //   — replace the undef lanes with (0.0, 1.0) from the second operand
  //     -> final float4 = (ndcX, ndcY, 0.0, 1.0)
  const clipZ = Math.fround(0.0); // lane 2 -> 0.0 (from the shuffle mask index 6).
  const clipW = Math.fround(1.0); // lane 3 -> 1.0 (from the shuffle mask index 7).

  // %13 = getelementptr &vertexArray[idx].textureCoordinate
  // %14 = load <2 x float>                         ; pass-through texcoord
  const tcX = Math.fround(vertex.textureCoordinate[0]);
  const tcY = Math.fround(vertex.textureCoordinate[1]);

  // %15/%16 = insertvalue — pack the two outputs into the return struct.
  // ret <{ <4 x float>, <2 x float> }> %16
  return {
    clipSpacePosition: [ndcX, ndcY, clipZ, clipW],
    textureCoordinate: [tcX, tcY],
  };
}
