// blit_tex_vertex_shader.ts — vertex shader: pass texcoord through, transform position by matrix.
// @shader blit_tex_vertex_shader (Flexo)
// Source IR: raw-port/re/shaders/blit_tex_vertex_shader.ll
// Compiled from: Flexo.framework/Versions/A/Resources/default.metallib @0x0000000000f850
//
// LLVM IR signature (from the .ll):
//   define <{ <4 x float>, <4 x float>, <2 x float>, float }>
//     @blit_tex_vertex_shader(
//         i32 %0 = vertex_id "idx"                                    (!22)
//       , <2 x float> addrspace(2)* %1 = per-vertex position buffer "P"  (!23)
//       , <2 x float> addrspace(2)* %2 = per-vertex texcoord buffer "st" (!24)
//       , metal::matrix %3 = float4x4 uniform "matrix"                    (!25)
//     )
// Vertex outputs (!16):
//   slot 0 : air.position       float4 "P"   — clip-space position
//   slot 1 : air.vertex_output  float4 "Cs"  — passthrough color (unused; stays undef)
//   slot 2 : air.vertex_output  float2 "st"  — passthrough texcoord
//   slot 3 : air.point_size     float        — undef (never written)
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. We use plain JS fp32-narrowed math ops — the shader
// itself only does dot products of 4 floats, which is bit-exact under fast-math.

/**
 * Buffer accessors.
 *
 * The shader reads three GPU buffers via a vertex index. In TS we accept the buffers as
 * Float32Arrays and index them the same way (two float32s per position/texcoord, 16 float32s
 * for the 4x4 matrix).
 *
 * Return value mirrors the IR return struct order:
 *   { position: [x,y,z,w], color: [r,g,b,a] | undefined, st: [s,t], pointSize: number | undefined }
 * `color` and `pointSize` are never written by this shader (see %28/%29: only slot 0 and slot 2
 * are inserted; slots 1 and 3 remain `undef`). We reflect that with `undefined`.
 */
export interface BlitTexVertexOutput {
  position: [number, number, number, number]; // slot 0 — air.position (Cs)
  color: undefined;                            // slot 1 — never inserted (see %28/%29)
  st: [number, number];                        // slot 2 — passthrough texcoord
  pointSize: undefined;                        // slot 3 — never inserted
}

/**
 * @shader blit_tex_vertex_shader (Flexo) — faithful port of the AIR IR.
 *
 * @param idx    Vertex index (%0, i32 vertex_id).
 * @param P      Per-vertex position buffer (%1). Layout: pairs of float32 [x, y] per vertex.
 * @param st     Per-vertex texcoord buffer (%2). Layout: pairs of float32 [s, t] per vertex.
 * @param matrix 4x4 column-major transform (%3). Layout: 16 float32s = 4 columns of 4 floats,
 *               column K occupies matrix[K*4 .. K*4+3].
 */
export function blit_tex_vertex_shader(
  idx: number,
  P: Float32Array,
  st: Float32Array,
  matrix: Float32Array,
): BlitTexVertexOutput {
  // %5..%12: load the four columns of the 4x4 matrix (each is a <4 x float>).
  //   %5  = &matrix.columns[0]   ; %6  = load %5   (col 0)
  //   %7  = &matrix.columns[1]   ; %8  = load %7   (col 1)
  //   %9  = &matrix.columns[2]   ; %10 = load %9   (col 2)
  //   %11 = &matrix.columns[3]   ; %12 = load %11  (col 3)
  const c0x = matrix[0], c0y = matrix[1], c0z = matrix[2], c0w = matrix[3];   // %6
  const c1x = matrix[4], c1y = matrix[5], c1z = matrix[6], c1w = matrix[7];   // %8
  const c2x = matrix[8], c2y = matrix[9], c2z = matrix[10], c2w = matrix[11]; // %10
  const c3x = matrix[12], c3y = matrix[13], c3z = matrix[14], c3w = matrix[15]; // %12

  // %13 = zext i32 %0 to i64  — index widened to 64-bit for GEP.
  const i = idx >>> 0;

  // %14 = &P[%13] ; %15 = load <2 x float>  — read this vertex's (x, y).
  const px = P[i * 2 + 0]; // %15.x
  const py = P[i * 2 + 1]; // %15.y

  // %16 = shufflevector %15, poison, <0,1,undef,undef>  — widen to <4 x float> (x, y, ?, ?)
  // %17 = shufflevector %16, <_,_,0.0,1.0>, <0,1,6,7>   — replace lanes 2,3 with (0.0, 1.0)
  // Net effect: build <x, y, 0.0, 1.0>. Position lifted from 2D to homogeneous 4D.
  const vx = px;
  const vy = py;
  const vz = 0.0;
  const vw = 1.0;

  // %18 = tail call fast air.dot.v4f32(<x,y,0,1>, col0)   -> component 0
  // %20 = ... dot with col1 -> component 1
  // %22 = ... dot with col2 -> component 2
  // %24 = ... dot with col3 -> component 3
  // These four dot products form: outPos = matrix^T * <x,y,0,1>  (row-vector view of matrix).
  // Metal float4x4 is column-major, so `matrix * v` in Metal computes col0*v.x + col1*v.y + ...,
  // NOT what this shader is doing. This shader dots v with each COLUMN, which — for a matrix
  // stored column-major — is equivalent to (transpose(matrix)) * v. Whether the CPU-side setup
  // pre-transposed the matrix or intends this row-major-times-column-vector convention is a
  // caller contract, not something this shader can decide.
  //
  // Faithful transcription: 4-way dot with the 4 columns. Cite each %N.
  const p0 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c0x) + Math.fround(vy * c0y)) + Math.fround(vz * c0z)) + Math.fround(vw * c0w)); // %18
  const p1 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c1x) + Math.fround(vy * c1y)) + Math.fround(vz * c1z)) + Math.fround(vw * c1w)); // %20
  const p2 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c2x) + Math.fround(vy * c2y)) + Math.fround(vz * c2z)) + Math.fround(vw * c2w)); // %22
  const p3 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c3x) + Math.fround(vy * c3y)) + Math.fround(vz * c3z)) + Math.fround(vw * c3w)); // %24

  // %19/%21/%23/%25: insertelement into a <4 x float> — the assembled clip-space position.
  const position: [number, number, number, number] = [p0, p1, p2, p3];

  // %26 = &st[%13] ; %27 = load <2 x float>  — read this vertex's (s, t) passthrough.
  const s = st[i * 2 + 0]; // %27.x
  const t = st[i * 2 + 1]; // %27.y

  // %28 = insertvalue undef, %25, 0  — output slot 0 = position.
  // %29 = insertvalue %28,   %27, 2  — output slot 2 = texcoord.
  // Slots 1 (Cs) and 3 (pointSize) remain undef.
  return {
    position,
    color: undefined,
    st: [s, t],
    pointSize: undefined,
  };
}
