// hue_ring_vertex_shader.ts — vertex shader: transform 2D position by 4x4 matrix, pass color through.
// @shader hue_ring_vertex_shader (Flexo)
// Source IR: raw-port/re/shaders/hue_ring_vertex_shader.ll
// Compiled from: Flexo.framework/Versions/A/Resources/default.metallib @0x00000000003bb0
//
// LLVM IR signature (from the .ll):
//   define <{ <4 x float>, <4 x float>, <2 x float>, float }>
//     @hue_ring_vertex_shader(
//         i32 %0                                    = vertex_id "idx"        (!22)
//       , <2 x float> addrspace(2)* %1              = per-vertex position "P"  (!23)
//       , <4 x float> addrspace(2)* %2              = per-vertex color "Cs"    (!24)
//       , metal::matrix addrspace(2)* %3            = float4x4 uniform "matrix" (!25)
//     )
// Vertex outputs (!16):
//   slot 0 : air.position       float4 "P"        — clip-space position
//   slot 1 : air.vertex_output  float4 "Cs"       — passthrough color
//   slot 2 : air.vertex_output  float2 "st"       — undef (never written)
//   slot 3 : air.point_size     float             — undef (never written)
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. We use plain JS fp32-narrowed math ops — the shader
// itself only does dot products of 4 floats, which is bit-exact under fast-math.

/**
 * Return value mirrors the IR return struct order:
 *   { position: [x,y,z,w], color: [r,g,b,a], st: undefined, pointSize: undefined }
 * `st` and `pointSize` are never written by this shader (see %28/%29: only slot 0 and slot 1
 * are inserted; slots 2 and 3 remain undef). We reflect that with `undefined`.
 */
export interface HueRingVertexOutput {
  position: [number, number, number, number]; // slot 0 — air.position (P)
  color: [number, number, number, number];    // slot 1 — passthrough Cs
  st: undefined;                               // slot 2 — never inserted
  pointSize: undefined;                        // slot 3 — never inserted
}

/**
 * @shader hue_ring_vertex_shader (Flexo) — faithful port of the AIR IR.
 *
 * @param idx    Vertex index (%0, i32 vertex_id).
 * @param P      Per-vertex position buffer (%1). Layout: pairs of float32 [x, y] per vertex.
 * @param Cs     Per-vertex color buffer (%2). Layout: quads of float32 [r, g, b, a] per vertex.
 * @param matrix 4x4 column-major transform (%3). Layout: 16 float32s = 4 columns of 4 floats,
 *               column K occupies matrix[K*4 .. K*4+3].
 */
export function hue_ring_vertex_shader(
  idx: number,
  P: Float32Array,
  Cs: Float32Array,
  matrix: Float32Array,
): HueRingVertexOutput {
  // %5..%12: load the four columns of the 4x4 matrix (each is a <4 x float>).
  //   %5  = &matrix.columns[0]   ; %6  = load %5   (col 0)
  //   %7  = &matrix.columns[1]   ; %8  = load %7   (col 1)
  //   %9  = &matrix.columns[2]   ; %10 = load %9   (col 2)
  //   %11 = &matrix.columns[3]   ; %12 = load %11  (col 3)
  const c0x = matrix[0], c0y = matrix[1], c0z = matrix[2], c0w = matrix[3];    // %6
  const c1x = matrix[4], c1y = matrix[5], c1z = matrix[6], c1w = matrix[7];    // %8
  const c2x = matrix[8], c2y = matrix[9], c2z = matrix[10], c2w = matrix[11];  // %10
  const c3x = matrix[12], c3y = matrix[13], c3z = matrix[14], c3w = matrix[15]; // %12

  // %13 = zext i32 %0 to i64  — index widened to 64-bit for GEP.
  const i = idx >>> 0;

  // %14 = &Cs[%13]  (stride 16 = one float4 per vertex) ; %15 = load <4 x float>  — this vertex's color.
  const csR = Cs[i * 4 + 0]; // %15.x
  const csG = Cs[i * 4 + 1]; // %15.y
  const csB = Cs[i * 4 + 2]; // %15.z
  const csA = Cs[i * 4 + 3]; // %15.w

  // %16 = &P[%13]  (stride 8 = one float2 per vertex) ; %17 = load <2 x float>  — this vertex's (x, y).
  const px = P[i * 2 + 0]; // %17.x
  const py = P[i * 2 + 1]; // %17.y

  // %18 = shufflevector %17, poison, <0,1,undef,undef>  — widen to <4 x float> (x, y, ?, ?)
  // %19 = shufflevector %18, <_,_,0.0,1.0>, <0,1,6,7>   — replace lanes 2,3 with (0.0, 1.0)
  // Net effect: build <x, y, 0.0, 1.0>. Position lifted from 2D to homogeneous 4D.
  const vx = px;
  const vy = py;
  const vz = 0.0;
  const vw = 1.0;

  // %20 = tail call fast air.dot.v4f32(<x,y,0,1>, col0)   -> component 0
  // %22 = tail call fast air.dot.v4f32(<x,y,0,1>, col1)   -> component 1
  // %24 = tail call fast air.dot.v4f32(<x,y,0,1>, col2)   -> component 2
  // %26 = tail call fast air.dot.v4f32(<x,y,0,1>, col3)   -> component 3
  // Same 4-way dot as blit_tex_vertex_shader — this is v dotted with each COLUMN of the
  // column-major matrix (i.e. equivalent to transpose(matrix) * v). The caller decides whether
  // the CPU-side already transposed the matrix; the shader itself is faithful to the IR.
  const p0 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c0x) + Math.fround(vy * c0y)) + Math.fround(vz * c0z)) + Math.fround(vw * c0w)); // %20
  const p1 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c1x) + Math.fround(vy * c1y)) + Math.fround(vz * c1z)) + Math.fround(vw * c1w)); // %22
  const p2 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c2x) + Math.fround(vy * c2y)) + Math.fround(vz * c2z)) + Math.fround(vw * c2w)); // %24
  const p3 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c3x) + Math.fround(vy * c3y)) + Math.fround(vz * c3z)) + Math.fround(vw * c3w)); // %26

  // %21/%23/%25/%27: insertelement into a <4 x float> — the assembled clip-space position.
  const position: [number, number, number, number] = [p0, p1, p2, p3];

  // %28 = insertvalue undef, %27, 0  — output slot 0 = position.
  // %29 = insertvalue %28,   %15, 1  — output slot 1 = passthrough color Cs.
  // Slots 2 (st) and 3 (pointSize) remain undef.
  return {
    position,
    color: [csR, csG, csB, csA],
    st: undefined,
    pointSize: undefined,
  };
}
