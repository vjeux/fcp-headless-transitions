// Faithful transcription @0x000000000055db
// @shader vertex_untextured (MAVectorUIKit/default) @0x000000000055db
// Source IR: raw-port/re/shaders/vertex_untextured.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/EDEL.framework/Versions/A/
//     Frameworks/MAVectorUIKit.framework/Versions/A/Resources/default.metallib
// via raw-port/tools/shader_disasm.sh — first-line offset in that .ll is
// `0x000000000055db -- vertex_untextured:`)
//
// The IR has no debug metadata, so all citations refer to SSA %-numbers of the .ll.
//
// POINT-primitive vertex shader: reads a per-vertex 2D position from a constant buffer
// indexed by [[vertex_id]], upgrades it to a float4 clip-space position by injecting
// (0.0, 1.0) into lanes 2 and 3, and emits a per-invocation point-sprite pixel size
// read from a single-float constant buffer (broadcast to every vertex — every point
// gets the same on-screen radius). It's the point-drawing sibling of
// chromaVerb_vertex_untextured / chromaVerb_vertex_textured (which are the strip-quad
// variants — they don't emit air.point_size).
//
// Signature from !air.vertex (!15..!22):
//   vertex struct { float4 position [[position]]; float pointSize [[point_size]]; }
//   vertex_untextured(
//       constant float2* positions [[buffer(0)]],   // %0
//       constant float*  pointSize [[buffer(1)]],   // %1  (scalar shared by all vids)
//       uint             vid       [[vertex_id]]    // %2
//   );
//
// IR body (single BB, straight-line — 8 SSA values, no arithmetic):
//   %4  = zext i32 vid to i64
//   %5  = getelementptr <2 x float>, positions, %4
//   %6  = load  <2 x float>, %5                          — per-vertex pos.xy
//   %7  = shufflevector %6, poison, <0, 1, undef, undef>
//   %8  = shufflevector %7, <poison, poison, 0.0, 1.0>, <0, 1, 6, 7>
//                                                        — float4(pos.x, pos.y, 0, 1)
//   %9  = load  float, pointSize                         — SCALAR, not indexed by vid
//   %10 = insertvalue undef, %8, 0
//   %11 = insertvalue %10, %9, 1
//   ret %11
//
// Notes:
//   - `pointSize` is a SINGLE constant float shared by every vertex. Both `positions`
//     GEPs use `%4 = zext vid` as their index, but the `pointSize` GEP has no index —
//     it's `load float, float* pointSize` at buffer(1) offset 0.
//   - No arithmetic ops at all. Every "value" is just a shuffle or a load. Compile
//     flags (fast_math_enable) don't matter here.
//
// Sibling: chromaVerb_vertex_untextured is a similar rename-template but takes float4
// positions from a buffer and does NOT emit air.point_size (it's for tri strips, not
// points). This shader is for point-primitive draw calls.

/**
 * vertex_untextured — one point-primitive vertex.
 *
 * @param positions  constant buffer 0 — per-vertex float2 positions in clip space
 *                   (upgraded to float4 by injecting (0.0, 1.0) at z/w).
 * @param pointSize  constant buffer 1 — a SINGLE-element float, broadcast to every
 *                   vertex. The AIR call is `load float, %1` with no index, so every
 *                   invocation reads the same value; the array wrapper here mirrors
 *                   the buffer-pointer signature — element 0 is what the shader reads.
 * @param vid        [[vertex_id]] — u32 index into `positions`. Not used to index
 *                   `pointSize`.
 * @returns          the vertex outputs `{ position, pointSize }`.
 *
 * @IR entire function @0x000000000055db.
 */
export function vertex_untextured(
  positions: ReadonlyArray<[number, number]>,
  pointSize: ReadonlyArray<number>,
  vid: number,
): {
  /** air.position — float4(pos.x, pos.y, 0.0, 1.0). @IR %8 */
  position: [number, number, number, number];
  /** air.point_size — the scalar loaded from `pointSize[0]`. @IR %9 */
  pointSize: number;
} {
  // @IR %4 = zext i32 vid to i64
  const i = vid >>> 0;
  // @IR %5 = getelementptr <2 x float>, positions, i
  //     %6 = load  <2 x float>, %5
  const p = positions[i];
  // @IR %7 = shufflevector %6, poison, <0, 1, undef, undef>
  //     %8 = shufflevector %7, <poison, poison, 0.0, 1.0>, <0, 1, 6, 7>
  const position4: [number, number, number, number] = [p[0], p[1], 0.0, 1.0];
  // @IR %9 = load float, pointSize    — SCALAR, index 0 (not indexed by vid)
  const ps = pointSize[0];
  // @IR %10 = insertvalue undef, %8, 0
  //     %11 = insertvalue %10, %9, 1
  //     ret %11
  return {
    position: position4,
    pointSize: ps,
  };
}
