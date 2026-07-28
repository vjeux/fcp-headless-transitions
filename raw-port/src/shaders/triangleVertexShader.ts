// @shader triangleVertexShader (Flexo)  @0x00000000013f50
//
// Metal VERTEX shader from Flexo's default.metallib. This is Apple's
// canonical "hello triangle" vertex shader (see AAPLTriangleVertexWithColor
// struct type in the .ll — Apple's tutorial naming). For each vertexID, it
// reads a (position, color) pair from a vertex buffer, converts the
// position from PIXEL SPACE (in viewport pixels) to CLIP SPACE by
// normalizing against half the viewport size, and passes the color
// through unchanged.
//
// Source LLVM IR: raw-port/re/shaders/triangleVertexShader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh triangleVertexShader Flexo`)
//
// AIR signature (from the .ll):
//   define <{ <4 x float>, <4 x float> }> @triangleVertexShader(
//     i32 %0,                                    // vertexID
//     %struct.AAPLTriangleVertexWithColor* %1,   // vertices[]
//     <2 x i32>* %2                              // viewportSizePointer (uint2)
//   )
//
// The vertex-buffer struct layout (from `!22` in the .ll):
//   struct AAPLTriangleVertexWithColor {
//     float2 position;   // offset 0,  size 8,  align 16 (padded)
//     float4 color;      // offset 16, size 16, align 16
//   };                   // total size 32, align 16
//
// Return-type is a packed struct `<{ <4 x float>, <4 x float> }>` (LLVM's
// packed-struct syntax); interpreted per `!16`:
//   field 0 = air.position  (clipSpacePosition, float4)
//   field 1 = air.vertex_output "generated(5colorDv4_f)" (color, float4)
//
// IR line map (from the .ll body of @triangleVertexShader):
//   %4  = zext i32 %0 to i64                        ; extend vertexID for GEP index
//   %5  = getelementptr [%1], i64 %4, i32 0         ; &vertices[vertexID].position
//   %6  = load <2 x float>, %5                      ; vertices[vertexID].position (px)
//   %7  = load <2 x i32>, %2                        ; viewportSize (uint2)
//   %8  = tail call fast air.convert.f.v2f32.u.v2i32(<2 x i32> %7)
//                                                    ; uint2 -> float2 (unsigned->float)
//   %9  = fmul fast %8, <0.5, 0.5>                  ; viewportF * 0.5 per lane
//   %10 = fdiv fast %6, %9                          ; position / halfViewport (NDC-like)
//   %11 = shufflevector %10, poison, <0, 1, undef, undef>  ; extend to float4
//   %12 = shufflevector %11, <undef, undef, 0.0, 1.0>, <0, 1, 6, 7>
//                                                    ; = { ndc.x, ndc.y, 0.0, 1.0 }
//   %13 = getelementptr [%1], i64 %4, i32 1         ; &vertices[vertexID].color
//   %14 = load <4 x float>, %13                     ; vertices[vertexID].color (float4)
//   %15 = insertvalue undef, %12, 0                 ; return.clipPos = %12
//   %16 = insertvalue %15,  %14, 1                  ; return.color   = %14
//   ret <{ float4, float4 }> %16
//
// Semantics summary:
//   For a per-vertex (position_px, color) pair and the runtime viewport size
//   in pixels, the shader returns:
//     clipSpacePosition = ( position_px.x / (viewport.w * 0.5),
//                           position_px.y / (viewport.h * 0.5),
//                           0.0,
//                           1.0 )
//     color             = the vertex's color, unchanged
//
// Fast-math attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`.
// This port uses plain JS Number arithmetic; Math.fround is applied at each
// stored intermediate for f32 fidelity (matching the AIR <2 x float>/<4 x float>
// types).

/**
 * A vertex from the AAPLTriangleVertexWithColor buffer. Matches the AIR
 * struct type `%struct.AAPLTriangleVertexWithColor = type { <2 x float>,
 * <4 x float> }` (see `!22` in the .ll).
 */
export interface TriangleVertexWithColor {
  /** float2 position (pixel coordinates in viewport space). */
  readonly position: readonly [number, number];
  /** float4 color (RGBA). */
  readonly color: readonly [number, number, number, number];
}

/**
 * Output of the vertex shader. Corresponds to the AIR packed struct
 * `<{ <4 x float>, <4 x float> }>` — field 0 is the clip-space position
 * (`air.position`), field 1 is the interpolated color (`air.vertex_output`).
 */
export interface TriangleVertexOut {
  /** air.position — clip-space position (float4). */
  readonly clipSpacePosition: [number, number, number, number];
  /** air.vertex_output "color" (float4). */
  readonly color: [number, number, number, number];
}

/**
 * `@triangleVertexShader` — Flexo Metal vertex shader.
 *
 * For a given `vertexID`, reads `vertices[vertexID]` and converts its
 * pixel-space `position` to clip space by dividing by (viewport * 0.5),
 * then returns { clipSpacePosition = (ndc.x, ndc.y, 0, 1), color = vertex.color }.
 *
 * Faithful transcription of the .ll body; see the IR line map above.
 *
 * @param vertexID    the vertex index (AIR `air.vertex_id`, u32)
 * @param vertices    the AAPLTriangleVertexWithColor buffer
 *                    (AIR buffer at binding index 0)
 * @param viewportSize the u32 viewport size {width, height} in pixels
 *                    (AIR buffer at binding index 1, uint2)
 * @returns           the vertex shader output (see TriangleVertexOut)
 */
export function triangleVertexShader(
  vertexID: number,
  vertices: readonly TriangleVertexWithColor[],
  viewportSize: readonly [number, number],
): TriangleVertexOut {
  // %4 = zext i32 %0 to i64 — extend vertexID for GEP index. In JS,
  // vertexID is expected to be a nonnegative integer < 2^32; use `>>> 0`
  // to enforce u32 semantics (matches the `zext` widening).
  const idx: number = (vertexID >>> 0);

  // %5/%6 = load vertices[vertexID].position (float2, pixel coordinates)
  const v = vertices[idx];
  const px: number = Math.fround(v.position[0]);
  const py: number = Math.fround(v.position[1]);

  // %7 = load <2 x i32>, %2 — read viewportSize as uint2.
  // %8 = air.convert.f.v2f32.u.v2i32(<2 x i32>) — unsigned int -> float
  //      per lane. Enforce u32 semantics with `>>> 0` before conversion.
  const vwU32: number = viewportSize[0] >>> 0;
  const vhU32: number = viewportSize[1] >>> 0;
  const vwF: number = Math.fround(vwU32);   // uint -> float (unsigned)
  const vhF: number = Math.fround(vhU32);

  // %9 = fmul fast %8, <0.5, 0.5> — half-viewport per lane.
  const halfW: number = Math.fround(vwF * Math.fround(0.5));
  const halfH: number = Math.fround(vhF * Math.fround(0.5));

  // %10 = fdiv fast %6, %9 — pixel-position / half-viewport = NDC-like.
  const ndcX: number = Math.fround(px / halfW);
  const ndcY: number = Math.fround(py / halfH);

  // %11 = shufflevector %10, poison, <0, 1, undef, undef>
  //     = extend the float2 to a float4 with the last two lanes undef.
  // %12 = shufflevector %11, <undef, undef, 0.0, 1.0>, <0, 1, 6, 7>
  //     = replace the undef lanes with (0.0, 1.0)
  //     -> clipSpacePosition = (ndcX, ndcY, 0.0, 1.0)
  const clipSpacePosition: [number, number, number, number] = [
    ndcX,
    ndcY,
    Math.fround(0.0),
    Math.fround(1.0),
  ];

  // %13/%14 = load vertices[vertexID].color (float4) — passthrough color.
  const color: [number, number, number, number] = [
    Math.fround(v.color[0]),
    Math.fround(v.color[1]),
    Math.fround(v.color[2]),
    Math.fround(v.color[3]),
  ];

  // %15/%16/ret = pack into <{ float4, float4 }> = { clipPos, color }.
  return { clipSpacePosition, color };
}
