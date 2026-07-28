// Faithful transcription @0x0000000001de36 — MDPKit.framework/Versions/A/Resources/default.metallib
// @shader MDPDefaultLitVertexFunc (MDPKit)
//
// Default-lit vertex shader from MDPKit's MDPDefaultLit.metal source. Reads a per-vertex
// record (float3 position, float4 color, float3 normal) indexed by air.vertex_id, and
// produces three outputs:
//   position = projectionMatrix * modelViewMatrix * float4(pos.xyz, 1)   (air.position)
//   color    = vertex color (passthrough)
//   normal   = normalMatrix (float3x3) * normalize(vertex.normal)
//
// NOTE — differs from MDPSpecularLitVertexFunc in three ways:
//   1. Uniform buffer field order: modelViewMatrix at +0 (index 0), projectionMatrix at +64
//      (index 1); SpecularLit has projection first, modelview second.
//   2. No `viewPosition` output — only position, color, normal (SpecularLit emits a
//      viewPosition = modelView * float4(pos,1) fourth output).
//   3. The vertex normal is NORMALIZED (via air.dot / air.fast_rsqrt) BEFORE being
//      multiplied by the normalMatrix; SpecularLit does not normalize on input.
//
// Source LLVM IR: raw-port/re/shaders/MDPDefaultLitVertexFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh MDPDefaultLitVertexFunc MDPKit`).
//
// AIR signature (from air.vertex !29 and !30..!39):
//   define <{ <4 x float>, <4 x float>, <3 x float> }>
//   @MDPDefaultLitVertexFunc(
//     constant MDPDefaultLitUniforms* uniforms   [176 bytes, align 16]        ; !35
//     device   MDPDefaultLitVertex*   verts      [48 bytes/rec, align 16]     ; !37
//     uint     vert                                                           ; !39 air.vertex_id
//   ) -> struct {
//     float4 position (air.position, "position"),
//     float4 color    (air.vertex_output "color"),
//     float3 normal   (air.vertex_output "normal")
//   }
//
// MDPDefaultLitUniforms layout (from !36 — 176 bytes, 16-byte aligned):
//   +0    float4x4 modelViewMatrix    (column-major, 4 columns × 4 floats)
//   +64   float4x4 projectionMatrix   (column-major, 4 columns × 4 floats)
//   +128  float3x3 normalMatrix       (column-major, 3 columns × 3 floats; each col padded to 16 bytes)
//
// MDPDefaultLitVertex layout (from !38 — 48 bytes/record, 16-byte aligned):
//   +0    float3   position           (loaded as <3 x float>, align 16)
//   +16   float4   color              (loaded as <4 x float>, align 16 — passthrough)
//   +32   float3   normal             (loaded as <3 x float>, align 16)
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable (air.compile.fast_math_enable). We use
// Math.fround to preserve fp32 lane values. air.fast_rsqrt is a fp32 fast-math
// reciprocal square root; Math.fround(1/sqrt(x)) is faithful for finite inputs.
//
// MATRIX BUILD OBSERVATION: the IR builds pv.col[K] = sum_j proj.col[j] * mv.col[K][j]
// (a 4x4 matrix multiply expressed as column-of-outputs = weighted sum of proj columns),
// then dots pv with float4(pos.xyz, 1) to produce clip-space. Columns 0-2 are fully
// summed to pv.col[K]; column 3 is emitted as four separate scaled proj columns
// (%57/%59/%61/%63) and interleaved into the final position accumulation in a specific
// order. We mirror that fusion literally to keep the fp32 rounding identical.

/**
 * Column-major float3x3, 9 usable lanes packed contiguously:
 * [c0x, c0y, c0z, c1x, c1y, c1z, c2x, c2y, c2z]. The raw uniform buffer stores each
 * column padded to 16 bytes for a 48-byte struct; this interface exposes only the 9
 * significant floats. Callers unpacking directly from the raw buffer read lanes at
 * offsets 0,1,2, 4,5,6, 8,9,10.
 */
export type NormalMatrix3x3 = Float32Array;

/**
 * MDPDefaultLitUniforms — the constant-buffer struct read by the shader.
 */
export interface MDPDefaultLitUniforms {
  /** float4x4, column-major, 16 float32s. */
  modelViewMatrix: Float32Array;
  /** float4x4, column-major, 16 float32s. */
  projectionMatrix: Float32Array;
  /** float3x3, column-major, 9 usable float32s (columns unpadded in this interface). */
  normalMatrix: NormalMatrix3x3;
}

/**
 * MDPDefaultLitVertex — a single per-vertex record (48 bytes in the raw buffer).
 */
export interface MDPDefaultLitVertex {
  position: [number, number, number];
  color: [number, number, number, number];
  normal: [number, number, number];
}

/**
 * Output struct mirroring the IR return type
 * `<{ <4 x float>, <4 x float>, <3 x float> }>`.
 */
export interface MDPDefaultLitVertexFuncOutput {
  position: [number, number, number, number]; // slot 0 — air.position
  color: [number, number, number, number];    // slot 1 — air.vertex_output "color"
  normal: [number, number, number];           // slot 2 — air.vertex_output "normal"
}

/**
 * @shader MDPDefaultLitVertexFunc (MDPKit) — faithful port of the AIR IR.
 *
 * @param uniforms Uniform block (modelViewMatrix + projectionMatrix + normalMatrix).
 * @param verts    Array of MDPDefaultLitVertex records — %1 device pointer.
 * @param vert     air.vertex_id (%2 uint) — indexes into `verts`.
 */
export function MDPDefaultLitVertexFunc(
  uniforms: MDPDefaultLitUniforms,
  verts: readonly MDPDefaultLitVertex[],
  vert: number,
): MDPDefaultLitVertexFuncOutput {
  // %4 = zext i32 %vert to i64 ; %5 = gep verts[vert].position
  // %6 = load <3 x float>       -> pos.xyz
  const rec = verts[vert >>> 0];
  const px = rec.position[0];
  const py = rec.position[1];
  const pz = rec.position[2];

  const mv = uniforms.modelViewMatrix;
  const proj = uniforms.projectionMatrix;

  // %8  = load uniforms.field[0].col[0] = mv.col[0]
  // %29 = load uniforms.field[0].col[1] = mv.col[1]
  // %42 = load uniforms.field[0].col[2] = mv.col[2]
  // %55 = load uniforms.field[0].col[3] = mv.col[3]
  const mv0x = mv[0],  mv0y = mv[1],  mv0z = mv[2],  mv0w = mv[3];
  const mv1x = mv[4],  mv1y = mv[5],  mv1z = mv[6],  mv1w = mv[7];
  const mv2x = mv[8],  mv2y = mv[9],  mv2z = mv[10], mv2w = mv[11];
  const mv3x = mv[12], mv3y = mv[13], mv3z = mv[14], mv3w = mv[15];

  // %10 = load uniforms.field[1].col[0] = proj.col[0]
  // %14 = load uniforms.field[1].col[1] = proj.col[1]
  // %19 = load uniforms.field[1].col[2] = proj.col[2]
  // %24 = load uniforms.field[1].col[3] = proj.col[3]
  const p0x = proj[0],  p0y = proj[1],  p0z = proj[2],  p0w = proj[3];
  const p1x = proj[4],  p1y = proj[5],  p1z = proj[6],  p1w = proj[7];
  const p2x = proj[8],  p2y = proj[9],  p2z = proj[10], p2w = proj[11];
  const p3x = proj[12], p3y = proj[13], p3z = proj[14], p3w = proj[15];

  // ---------- composite pv.col[0] (%27) = proj * mv.col[0] ----------
  // %12 = proj.col[0] * splat(mv.col[0].x)
  // %16 = proj.col[1] * splat(mv.col[0].y) ; %17 = %16 + %12
  // %21 = proj.col[2] * splat(mv.col[0].z) ; %22 = %17 + %21
  // %26 = proj.col[3] * splat(mv.col[0].w) ; %27 = %22 + %26
  const pv0x = Math.fround(Math.fround(Math.fround(Math.fround(p0x * mv0x) + Math.fround(p1x * mv0y)) + Math.fround(p2x * mv0z)) + Math.fround(p3x * mv0w));
  const pv0y = Math.fround(Math.fround(Math.fround(Math.fround(p0y * mv0x) + Math.fround(p1y * mv0y)) + Math.fround(p2y * mv0z)) + Math.fround(p3y * mv0w));
  const pv0z = Math.fround(Math.fround(Math.fround(Math.fround(p0z * mv0x) + Math.fround(p1z * mv0y)) + Math.fround(p2z * mv0z)) + Math.fround(p3z * mv0w));
  const pv0w = Math.fround(Math.fround(Math.fround(Math.fround(p0w * mv0x) + Math.fround(p1w * mv0y)) + Math.fround(p2w * mv0z)) + Math.fround(p3w * mv0w));

  // ---------- composite pv.col[1] (%40) = proj * mv.col[1] ----------
  const pv1x = Math.fround(Math.fround(Math.fround(Math.fround(p0x * mv1x) + Math.fround(p1x * mv1y)) + Math.fround(p2x * mv1z)) + Math.fround(p3x * mv1w));
  const pv1y = Math.fround(Math.fround(Math.fround(Math.fround(p0y * mv1x) + Math.fround(p1y * mv1y)) + Math.fround(p2y * mv1z)) + Math.fround(p3y * mv1w));
  const pv1z = Math.fround(Math.fround(Math.fround(Math.fround(p0z * mv1x) + Math.fround(p1z * mv1y)) + Math.fround(p2z * mv1z)) + Math.fround(p3z * mv1w));
  const pv1w = Math.fround(Math.fround(Math.fround(Math.fround(p0w * mv1x) + Math.fround(p1w * mv1y)) + Math.fround(p2w * mv1z)) + Math.fround(p3w * mv1w));

  // ---------- composite pv.col[2] (%53) = proj * mv.col[2] ----------
  const pv2x = Math.fround(Math.fround(Math.fround(Math.fround(p0x * mv2x) + Math.fround(p1x * mv2y)) + Math.fround(p2x * mv2z)) + Math.fround(p3x * mv2w));
  const pv2y = Math.fround(Math.fround(Math.fround(Math.fround(p0y * mv2x) + Math.fround(p1y * mv2y)) + Math.fround(p2y * mv2z)) + Math.fround(p3y * mv2w));
  const pv2z = Math.fround(Math.fround(Math.fround(Math.fround(p0z * mv2x) + Math.fround(p1z * mv2y)) + Math.fround(p2z * mv2z)) + Math.fround(p3z * mv2w));
  const pv2w = Math.fround(Math.fround(Math.fround(Math.fround(p0w * mv2x) + Math.fround(p1w * mv2y)) + Math.fround(p2w * mv2z)) + Math.fround(p3w * mv2w));

  // ---------- pv column 3 as four separate scaled proj columns (%57, %59, %61, %63) ----------
  // %57 = proj.col[0] * splat(mv.col[3].x)
  // %59 = proj.col[1] * splat(mv.col[3].y)
  // %61 = proj.col[2] * splat(mv.col[3].z)
  // %63 = proj.col[3] * splat(mv.col[3].w)
  const pv3ax = Math.fround(p0x * mv3x), pv3ay = Math.fround(p0y * mv3x), pv3az = Math.fround(p0z * mv3x), pv3aw = Math.fround(p0w * mv3x);
  const pv3bx = Math.fround(p1x * mv3y), pv3by = Math.fround(p1y * mv3y), pv3bz = Math.fround(p1z * mv3y), pv3bw = Math.fround(p1w * mv3y);
  const pv3cx = Math.fround(p2x * mv3z), pv3cy = Math.fround(p2y * mv3z), pv3cz = Math.fround(p2z * mv3z), pv3cw = Math.fround(p2w * mv3z);
  const pv3dx = Math.fround(p3x * mv3w), pv3dy = Math.fround(p3y * mv3w), pv3dz = Math.fround(p3z * mv3w), pv3dw = Math.fround(p3w * mv3w);

  // ---------- clip-space position = pv * float4(pos.xyz, 1) with the specific IR ordering ----------
  // %65 = pv.col[0] * splat(pos.x)
  // %67 = pv.col[1] * splat(pos.y)
  // %69 = pv.col[2] * splat(pos.z)
  // %70 = %59 (pv3b)  + %65                -> pv3b + pv0*x
  // %71 = %70 + %57 (pv3a)                 -> + pv3a
  // %72 = %71 + %61 (pv3c)                 -> + pv3c
  // %73 = %72 + %63 (pv3d)                 -> + pv3d           = pv0*x + pv3
  // %74 = %73 + %67                        -> + pv1*y
  // %75 = %74 + %69                        -> + pv2*z          = pv * float4(pos, 1)
  const gx0 = Math.fround(pv0x * px), gx1 = Math.fround(pv1x * py), gx2 = Math.fround(pv2x * pz);
  const gy0 = Math.fround(pv0y * px), gy1 = Math.fround(pv1y * py), gy2 = Math.fround(pv2y * pz);
  const gz0 = Math.fround(pv0z * px), gz1 = Math.fround(pv1z * py), gz2 = Math.fround(pv2z * pz);
  const gw0 = Math.fround(pv0w * px), gw1 = Math.fround(pv1w * py), gw2 = Math.fround(pv2w * pz);

  const posX = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3bx + gx0) + pv3ax) + pv3cx) + pv3dx) + gx1) + gx2);
  const posY = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3by + gy0) + pv3ay) + pv3cy) + pv3dy) + gy1) + gy2);
  const posZ = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3bz + gz0) + pv3az) + pv3cz) + pv3dz) + gz1) + gz2);
  const posW = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3bw + gw0) + pv3aw) + pv3cw) + pv3dw) + gw1) + gw2);

  // ---------- color = passthrough (vertex color loaded as <4 x float> at rec+16) ----------
  // %76 = gep verts[vert].color ; %77 = load <4 x float>  -> color
  const col = rec.color;

  // ---------- normal = normalMatrix * normalize(vert.normal) ----------
  // %78 = gep verts[vert].normal ; %79 = load <3 x float>   -> normal.xyz
  // %80 = air.dot.v3f32(%79, %79)  ; %81 = air.fast_rsqrt.f32(%80)
  // %82/%83 = splat(%81) to <3>    ; %84 = %83 * %79        -> normalized normal
  const nx = rec.normal[0];
  const ny = rec.normal[1];
  const nz = rec.normal[2];
  const nLenSq = Math.fround(Math.fround(nx * nx) + Math.fround(Math.fround(ny * ny) + Math.fround(nz * nz)));
  const nRsqrt = Math.fround(1.0 / Math.fround(Math.sqrt(nLenSq)));
  const nnx = Math.fround(nRsqrt * nx);
  const nny = Math.fround(nRsqrt * ny);
  const nnz = Math.fround(nRsqrt * nz);

  // %85 = load normalMatrix.col[0] (<3 x float>)
  // %87 = normalMatrix.col[0] * splat(nn.x)  ; %88 = the fmul
  // %89 = load normalMatrix.col[1] ; %91 = %89 * splat(nn.y) ; %92 splat  ; %93 = %88 + %92? Actually:
  // Per IR: %87 = splat(%84,0) ; %88 = %87 * %86 (col[0] * nn.x)
  //         %91 = shufflevector %84 <1,1,1> = splat(nn.y) ; %92 = %91 * %90 (col[1] * nn.y)
  //         %93 = %88 + %92
  //         %96 = shufflevector %84 <2,2,2> = splat(nn.z) ; %97 = %96 * %95 (col[2] * nn.z)
  //         %98 = %93 + %97
  const nm = uniforms.normalMatrix;
  const n0x = nm[0], n0y = nm[1], n0z = nm[2];
  const n1x = nm[3], n1y = nm[4], n1z = nm[5];
  const n2x = nm[6], n2y = nm[7], n2z = nm[8];

  const t0x = Math.fround(n0x * nnx), t0y = Math.fround(n0y * nnx), t0z = Math.fround(n0z * nnx);
  const t1x = Math.fround(n1x * nny), t1y = Math.fround(n1y * nny), t1z = Math.fround(n1z * nny);
  const t2x = Math.fround(n2x * nnz), t2y = Math.fround(n2y * nnz), t2z = Math.fround(n2z * nnz);
  const s01x = Math.fround(t0x + t1x), s01y = Math.fround(t0y + t1y), s01z = Math.fround(t0z + t1z);
  const outNx = Math.fround(s01x + t2x);
  const outNy = Math.fround(s01y + t2y);
  const outNz = Math.fround(s01z + t2z);

  // %99..%101 = insertvalue slots 0..2
  return {
    position: [posX, posY, posZ, posW],
    color: [col[0], col[1], col[2], col[3]],
    normal: [outNx, outNy, outNz],
  };
}
