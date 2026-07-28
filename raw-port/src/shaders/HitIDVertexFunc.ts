// @shader HitIDVertexFunc (MDPKit)
// @0x0000000002e846 — MDPKit.framework/Versions/A/Resources/default.metallib
//
// Vertex shader for MDPKit's "hit ID" pass (MDPHitID.metal line 26). For each
// vertex, it transforms the input position by the MVP matrix (standard
// float4x4 × float4 with w=1) and passes through the per-vertex hitID as an
// interpolant-less uint output. The fragment stage downstream writes hitID to
// the pick buffer for hit-testing.
//
// Source LLVM IR: raw-port/re/shaders/HitIDVertexFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh HitIDVertexFunc MDPKit`).
//
// AIR signature (from air.vertex !29 and !30..!38):
//   define <{ <4 x float>, i32 }> @HitIDVertexFunc(
//     constant MDPUniformMvp*   uniforms  [64 bytes, align 16]  ; !34
//     const  device MDPHitIDVertex* verts                       ; !36
//     uint   vert_id  [[vertex_id]]                             ; !38
//   ) -> struct { float4 position; uint hitID; }
//
// MDPUniformMvp layout (from !35): +0 float4x4 mvp (64 bytes, 16-aligned).
//
// MDPHitIDVertex layout (from !37 — 32 bytes, 16-aligned):
//   +0   float3 position   (12 bytes + 4 pad → 16-byte lane)
//   +16  uint   hitID
//   +20  [12 x i8] pad (bringing size to 32)
//
// Function attributes: fast-math full stack (`unsafe-fp-math`, `no-nans/infs/
// signed-zeros`, `approx-func`), `air.compile.fast_math_enable`. All fp ops
// use `fmul fast` / `fadd fast`; we mirror in JS by narrowing every step with
// Math.fround (single-precision fidelity).
//
// The IR is a textbook clang-vectorized float4x4 × float4 matvec:
//   For each column c ∈ {0,1,2,3}, load col_c ∈ <4 x float>, splat vertex.xyz.c
//   (or 1.0 for the w column), multiply, accumulate. Column 3 (w) uses no
//   splat/mul — it's just the raw column added in, because pos.w = 1.
//
// IR line map (%N → semantics):
//   %4  zext i32 %2 to i64                                            ; vert_id widened
//   %5  &verts[vert_id].position   (field 0 in MDPHitIDVertex)         ; ptr to float3
//   %6  load <3 x float> from %5, align 16                             ; position.xyz
//   %7  &mvp[0]                    (row/col-0 of the float4x4)         ; ptr to col
//   %8  load col0 as <4 x float>
//   %9  shufflevector <3xfloat> %6, undef, <0,0,0,0>                   ; splat x
//   %10 fmul fast <4>: col0 * splat(x)
//   %11 &mvp[1]
//   %12 load col1
//   %13 shufflevector <3xfloat> %6, undef, <1,1,1,1>                   ; splat y
//   %14 fmul fast <4>: col1 * splat(y)
//   %15 fadd fast <4>: %14 + %10                                        ; col0*x + col1*y
//   %16 &mvp[2]
//   %17 load col2
//   %18 shufflevector <3xfloat> %6, undef, <2,2,2,2>                   ; splat z
//   %19 fmul fast <4>: col2 * splat(z)
//   %20 fadd fast <4>: %15 + %19                                        ; + col2*z
//   %21 &mvp[3]
//   %22 load col3
//   %23 fadd fast <4>: %20 + col3                                       ; + col3  (i.e. + col3 * 1.0 with w=1)
//   %24 &verts[vert_id].hitID       (field 1)                          ; ptr to uint
//   %25 load i32 hitID
//   %26 insertvalue struct undef, %23, 0                                ; position slot
//   %27 insertvalue %26,       %25, 1                                   ; hitID slot
//   ret %27

/**
 * MDPUniformMvp — 64-byte constant buffer with a single float4x4.
 * COLUMN-MAJOR: `mvp[c]` is column `c`, a 4-lane vector. This matches Metal's
 * float4x4 layout and the IR's `gep %struct.MDPUniformMvp, 0, 0, 0, i64 c`
 * indexing (fourth index selects the column).
 */
export interface MDPUniformMvp {
  /**
   * The float4x4 mvp. Indexed as `mvp[column][row]` (column-major, matching
   * Metal). @IR field !35, offset +0, 64 bytes.
   */
  mvp: readonly [
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
  ];
}

/**
 * MDPHitIDVertex — 32-byte vertex record. @IR type !37.
 */
export interface MDPHitIDVertex {
  /** float3 position @+0 (12 real bytes + 4 pad in the 16-byte slot). */
  position: readonly [number, number, number];
  /** uint hitID @+16 (32-bit unsigned; JS number carries the u32 value). */
  hitID: number;
}

/**
 * The output of HitIDVertexFunc — `<{ <4 x float>, i32 }>` in the IR.
 */
export interface HitIDVertexOutput {
  /** air.position float4 — clip-space position after MVP. */
  position: [number, number, number, number];
  /** air.vertex_output "hitID" uint — passed through unchanged from the vertex. */
  hitID: number;
}

/**
 * HitIDVertexFunc — MVP × float4(vertex.position.xyz, 1.0) plus hitID passthrough.
 *
 * @param uniforms  the MDPUniformMvp constant buffer (contains the MVP matrix).
 * @param verts     the device-buffer array of MDPHitIDVertex.
 * @param vert_id   the [[vertex_id]] uint.
 * @returns         { position: clip-space float4, hitID: uint }.
 */
export function HitIDVertexFunc(
  uniforms: MDPUniformMvp,
  verts: readonly MDPHitIDVertex[],
  vert_id: number,
): HitIDVertexOutput {
  // %4: zext i32 vert_id to i64. In JS a non-negative i32 is the same value.
  const vi = (vert_id >>> 0);

  // %5 %6: load verts[vi].position as <3 x float>.
  const vert = verts[vi];
  const px = Math.fround(vert.position[0]);
  const py = Math.fround(vert.position[1]);
  const pz = Math.fround(vert.position[2]);

  // %7 %8: col0 = mvp[0] as <4 x float>.
  const col0 = uniforms.mvp[0];
  const col0_0 = Math.fround(col0[0]);
  const col0_1 = Math.fround(col0[1]);
  const col0_2 = Math.fround(col0[2]);
  const col0_3 = Math.fround(col0[3]);
  // %9 %10: acc = col0 * splat(px) — first column contribution.
  let acc0 = Math.fround(col0_0 * px);
  let acc1 = Math.fround(col0_1 * px);
  let acc2 = Math.fround(col0_2 * px);
  let acc3 = Math.fround(col0_3 * px);

  // %11 %12 %13 %14 %15: acc += col1 * splat(py).
  const col1 = uniforms.mvp[1];
  const col1_0 = Math.fround(col1[0]);
  const col1_1 = Math.fround(col1[1]);
  const col1_2 = Math.fround(col1[2]);
  const col1_3 = Math.fround(col1[3]);
  acc0 = Math.fround(Math.fround(col1_0 * py) + acc0);
  acc1 = Math.fround(Math.fround(col1_1 * py) + acc1);
  acc2 = Math.fround(Math.fround(col1_2 * py) + acc2);
  acc3 = Math.fround(Math.fround(col1_3 * py) + acc3);

  // %16 %17 %18 %19 %20: acc += col2 * splat(pz).
  const col2 = uniforms.mvp[2];
  const col2_0 = Math.fround(col2[0]);
  const col2_1 = Math.fround(col2[1]);
  const col2_2 = Math.fround(col2[2]);
  const col2_3 = Math.fround(col2[3]);
  acc0 = Math.fround(acc0 + Math.fround(col2_0 * pz));
  acc1 = Math.fround(acc1 + Math.fround(col2_1 * pz));
  acc2 = Math.fround(acc2 + Math.fround(col2_2 * pz));
  acc3 = Math.fround(acc3 + Math.fround(col2_3 * pz));

  // %21 %22 %23: acc += col3   (equivalent to col3 * 1.0 with pos.w = 1).
  const col3 = uniforms.mvp[3];
  acc0 = Math.fround(acc0 + Math.fround(col3[0]));
  acc1 = Math.fround(acc1 + Math.fround(col3[1]));
  acc2 = Math.fround(acc2 + Math.fround(col3[2]));
  acc3 = Math.fround(acc3 + Math.fround(col3[3]));

  // %24 %25: load hitID (u32) from verts[vi].hitID.
  const hitID = (vert.hitID | 0) >>> 0;

  // %26 %27 ret: pack {position, hitID}.
  return {
    position: [acc0, acc1, acc2, acc3],
    hitID: hitID,
  };
}
