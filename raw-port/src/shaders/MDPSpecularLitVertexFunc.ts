// Faithful transcription @0x00000000025f36 — MDPKit.framework/Versions/A/Resources/default.metallib
// @shader MDPSpecularLitVertexFunc (MDPKit)
//
// Specular-lit vertex shader from MDPKit's MDPSpecularLit.metal source
// (frame !40 DISubprogram line 39, source file MDPKit/Shaders/MDPSpecularLit.metal).
// Reads a per-vertex record (float3 position, float3 normal, float4 color) indexed by
// air.vertex_id from the vertex buffer, and produces four outputs for the fragment shader:
//   position     = projectionMatrix * modelViewMatrix * float4(pos.xyz, 1)   (air.position)
//   viewPosition = modelViewMatrix * float4(pos.xyz, 1)
//   color        = vertex color (passthrough)
//   normal       = normalMatrix (float3x3) * normal.xyz
//
// Source LLVM IR: raw-port/re/shaders/MDPSpecularLitVertexFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh MDPSpecularLitVertexFunc MDPKit`).
//
// AIR signature (from air.vertex !28 and !29..!39):
//   define <{ <4 x float>, <4 x float>, <4 x float>, <3 x float> }>
//   @MDPSpecularLitVertexFunc(
//     constant MDPSpecularLitUniforms* uniforms  [192 bytes, align 16]    ; !35
//     device   MDPSpecularLitVertex*   verts     [48 bytes/rec, align 16] ; !37
//     uint     vertID                                                     ; !39 air.vertex_id
//   ) -> struct {
//     float4 position     (air.position, "position"),
//     float4 viewPosition (air.vertex_output "viewPosition"),
//     float4 color        (air.vertex_output "color"),
//     float3 normal       (air.vertex_output "normal")
//   }
//
// MDPSpecularLitUniforms layout (from !36 — 192 bytes, 16-byte aligned):
//   +0    float4x4 projectionMatrix     (column-major, 4 columns × 4 floats)
//   +64   float4x4 modelViewMatrix      (column-major, 4 columns × 4 floats)
//   +128  float3x3 normalMatrix         (column-major, 3 columns × 3 floats; each col padded to 16 bytes)
//   +176  float    gamma                (unused in this vertex shader — consumed downstream)
//   +180  12 bytes trailing padding
//
// MDPSpecularLitVertex layout (from !38 — 48 bytes/record, 16-byte aligned):
//   +0    float3   position             (loaded as <3 x float>, align 16)
//   +16   float3   normal               (loaded as <3 x float>, align 16)
//   +32   float4   color                (loaded as <4 x float>, align 16 — passthrough)
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable (air.compile.fast_math_enable).
// We use Math.fround to preserve fp32 lane values.
//
// MATRIX BUILD OBSERVATION: rather than computing `pv = projection * modelView` and then
// `pv * float4(pos, 1)`, the compiler folds the two multiplies. Each output-column of the
// product is: pv.colK = sum_j proj.col[j] * modelView.col[K][j]. The IR builds the four
// composite columns pv.col[0..3] out of proj.col[0..3] scaled by lanes of mv.col[K], then
// dots against float4(pos.xyz, 1). We mirror that exactly.

/**
 * Column-major float3x3 (nominal layout — 9 floats). In the AIR IR the uniform is a
 * `float3x3` (metal::matrix<float, 3, 3>) whose columns are each <3 x float> loaded at
 * 16-byte alignment. Padding between columns exists in the raw buffer (each column
 * pads to 16 bytes for a 48-byte struct), but this JS interface exposes the 9 usable
 * lanes packed contiguously: [c0x, c0y, c0z, c1x, c1y, c1z, c2x, c2y, c2z].
 *
 * If callers are supplying the raw uniform buffer view with 16-byte padded columns,
 * the corresponding lanes are at offsets 0,1,2, 4,5,6, 8,9,10.
 */
export type NormalMatrix3x3 = Float32Array; // 9 lanes; caller unpacks column padding

/**
 * MDPSpecularLitUniforms — the constant-buffer struct read by the shader.
 */
export interface MDPSpecularLitUniforms {
  /** float4x4, column-major, 16 float32s. */
  projectionMatrix: Float32Array;
  /** float4x4, column-major, 16 float32s. */
  modelViewMatrix: Float32Array;
  /** float3x3, column-major, 9 usable float32s (columns unpadded in this interface). */
  normalMatrix: NormalMatrix3x3;
  /** Not consumed by this vertex shader (used downstream). */
  gamma?: number;
}

/**
 * MDPSpecularLitVertex — a single per-vertex record (48 bytes in the raw buffer).
 */
export interface MDPSpecularLitVertex {
  position: [number, number, number];
  normal: [number, number, number];
  color: [number, number, number, number];
}

/**
 * Output struct mirroring the IR return type
 * `<{ <4 x float>, <4 x float>, <4 x float>, <3 x float> }>`.
 */
export interface MDPSpecularLitVertexFuncOutput {
  position: [number, number, number, number]; // slot 0 — air.position
  viewPosition: [number, number, number, number]; // slot 1
  color: [number, number, number, number]; // slot 2
  normal: [number, number, number]; // slot 3
}

/**
 * @shader MDPSpecularLitVertexFunc (MDPKit) — faithful port of the AIR IR.
 *
 * @param uniforms Uniform block with projection matrix, model-view matrix, and normal matrix.
 * @param verts    Array of MDPSpecularLitVertex records — %1 device pointer.
 * @param vertID   air.vertex_id (%2 uint) — indexes into `verts`.
 */
export function MDPSpecularLitVertexFunc(
  uniforms: MDPSpecularLitUniforms,
  verts: readonly MDPSpecularLitVertex[],
  vertID: number,
): MDPSpecularLitVertexFuncOutput {
  // %4 = zext i32 %vertID to i64 ; %5 = gep verts[vertID].position
  // %6 = load <3 x float>  -> pos.xyz
  const rec = verts[vertID >>> 0];
  const px = rec.position[0];
  const py = rec.position[1];
  const pz = rec.position[2];

  const proj = uniforms.projectionMatrix;
  const mv = uniforms.modelViewMatrix;

  // %10 = load projection.col[0]        ; %14 = load projection.col[1]
  // %19 = load projection.col[2]        ; %24 = load projection.col[3]
  const p0x = proj[0],  p0y = proj[1],  p0z = proj[2],  p0w = proj[3];
  const p1x = proj[4],  p1y = proj[5],  p1z = proj[6],  p1w = proj[7];
  const p2x = proj[8],  p2y = proj[9],  p2z = proj[10], p2w = proj[11];
  const p3x = proj[12], p3y = proj[13], p3z = proj[14], p3w = proj[15];

  // %8  = load modelView.col[0]         ; %29 = load modelView.col[1]
  // %42 = load modelView.col[2]         ; %55 = load modelView.col[3]
  const mv0x = mv[0],  mv0y = mv[1],  mv0z = mv[2],  mv0w = mv[3];
  const mv1x = mv[4],  mv1y = mv[5],  mv1z = mv[6],  mv1w = mv[7];
  const mv2x = mv[8],  mv2y = mv[9],  mv2z = mv[10], mv2w = mv[11];
  const mv3x = mv[12], mv3y = mv[13], mv3z = mv[14], mv3w = mv[15];

  // ---------- composite pv = projection * modelView, column 0 (%27) ----------
  // %12 = proj.col[0] * splat(mv.col[0].x)
  // %16 = proj.col[1] * splat(mv.col[0].y) ; %17 = %16 + %12
  // %21 = proj.col[2] * splat(mv.col[0].z) ; %22 = %17 + %21
  // %26 = proj.col[3] * splat(mv.col[0].w) ; %27 = %22 + %26   -> pv.col[0]
  const pv0x = Math.fround(Math.fround(Math.fround(Math.fround(p0x * mv0x) + Math.fround(p1x * mv0y)) + Math.fround(p2x * mv0z)) + Math.fround(p3x * mv0w));
  const pv0y = Math.fround(Math.fround(Math.fround(Math.fround(p0y * mv0x) + Math.fround(p1y * mv0y)) + Math.fround(p2y * mv0z)) + Math.fround(p3y * mv0w));
  const pv0z = Math.fround(Math.fround(Math.fround(Math.fround(p0z * mv0x) + Math.fround(p1z * mv0y)) + Math.fround(p2z * mv0z)) + Math.fround(p3z * mv0w));
  const pv0w = Math.fround(Math.fround(Math.fround(Math.fround(p0w * mv0x) + Math.fround(p1w * mv0y)) + Math.fround(p2w * mv0z)) + Math.fround(p3w * mv0w));

  // ---------- composite pv column 1 (%40) ----------
  // %31 = proj.col[0] * splat(mv.col[1].x) ; %33 = proj.col[1] * splat(mv.col[1].y) ; %34 = %31 + %33
  // %36 = proj.col[2] * splat(mv.col[1].z) ; %37 = %34 + %36
  // %39 = proj.col[3] * splat(mv.col[1].w) ; %40 = %37 + %39   -> pv.col[1]
  const pv1x = Math.fround(Math.fround(Math.fround(Math.fround(p0x * mv1x) + Math.fround(p1x * mv1y)) + Math.fround(p2x * mv1z)) + Math.fround(p3x * mv1w));
  const pv1y = Math.fround(Math.fround(Math.fround(Math.fround(p0y * mv1x) + Math.fround(p1y * mv1y)) + Math.fround(p2y * mv1z)) + Math.fround(p3y * mv1w));
  const pv1z = Math.fround(Math.fround(Math.fround(Math.fround(p0z * mv1x) + Math.fround(p1z * mv1y)) + Math.fround(p2z * mv1z)) + Math.fround(p3z * mv1w));
  const pv1w = Math.fround(Math.fround(Math.fround(Math.fround(p0w * mv1x) + Math.fround(p1w * mv1y)) + Math.fround(p2w * mv1z)) + Math.fround(p3w * mv1w));

  // ---------- composite pv column 2 (%53) ----------
  // %44 = proj.col[0] * splat(mv.col[2].x) ; %46 = proj.col[1] * splat(mv.col[2].y) ; %47 = %44 + %46
  // %49 = proj.col[2] * splat(mv.col[2].z) ; %50 = %47 + %49
  // %52 = proj.col[3] * splat(mv.col[2].w) ; %53 = %50 + %52   -> pv.col[2]
  const pv2x = Math.fround(Math.fround(Math.fround(Math.fround(p0x * mv2x) + Math.fround(p1x * mv2y)) + Math.fround(p2x * mv2z)) + Math.fround(p3x * mv2w));
  const pv2y = Math.fround(Math.fround(Math.fround(Math.fround(p0y * mv2x) + Math.fround(p1y * mv2y)) + Math.fround(p2y * mv2z)) + Math.fround(p3y * mv2w));
  const pv2z = Math.fround(Math.fround(Math.fround(Math.fround(p0z * mv2x) + Math.fround(p1z * mv2y)) + Math.fround(p2z * mv2z)) + Math.fround(p3z * mv2w));
  const pv2w = Math.fround(Math.fround(Math.fround(Math.fround(p0w * mv2x) + Math.fround(p1w * mv2y)) + Math.fround(p2w * mv2z)) + Math.fround(p3w * mv2w));

  // ---------- composite pv column 3 as separate terms (%57, %59, %61, %63) — NOT summed yet ----------
  // %57 = proj.col[0] * splat(mv.col[3].x)
  // %59 = proj.col[1] * splat(mv.col[3].y)
  // %61 = proj.col[2] * splat(mv.col[3].z)
  // %63 = proj.col[3] * splat(mv.col[3].w)
  const pv3ax = Math.fround(p0x * mv3x), pv3ay = Math.fround(p0y * mv3x), pv3az = Math.fround(p0z * mv3x), pv3aw = Math.fround(p0w * mv3x);
  const pv3bx = Math.fround(p1x * mv3y), pv3by = Math.fround(p1y * mv3y), pv3bz = Math.fround(p1z * mv3y), pv3bw = Math.fround(p1w * mv3y);
  const pv3cx = Math.fround(p2x * mv3z), pv3cy = Math.fround(p2y * mv3z), pv3cz = Math.fround(p2z * mv3z), pv3cw = Math.fround(p2w * mv3z);
  const pv3dx = Math.fround(p3x * mv3w), pv3dy = Math.fround(p3y * mv3w), pv3dz = Math.fround(p3z * mv3w), pv3dw = Math.fround(p3w * mv3w);

  // ---------- clip-space position = pv * float4(pos.xyz, 1) with the specific IR ordering ----------
  // %65 = %27 * splat(pos.x)                 -> pv.col0 * x
  // %67 = %40 * splat(pos.y)                 -> pv.col1 * y
  // %69 = %53 * splat(pos.z)                 -> pv.col2 * z
  // %70 = %59 + %65                          -> (pv3b) + pv0*x
  // %71 = %70 + %57                          -> ... + pv3a
  // %72 = %71 + %61                          -> ... + pv3c
  // %73 = %72 + %63                          -> ... + pv3d                         = pv0*x + pv3
  // %74 = %73 + %67                          -> ... + pv1*y
  // %75 = %74 + %69                          -> ... + pv2*z                        = pv * float4(pos, 1)
  const gx0 = Math.fround(pv0x * px), gx1 = Math.fround(pv1x * py), gx2 = Math.fround(pv2x * pz);
  const gy0 = Math.fround(pv0y * px), gy1 = Math.fround(pv1y * py), gy2 = Math.fround(pv2y * pz);
  const gz0 = Math.fround(pv0z * px), gz1 = Math.fround(pv1z * py), gz2 = Math.fround(pv2z * pz);
  const gw0 = Math.fround(pv0w * px), gw1 = Math.fround(pv1w * py), gw2 = Math.fround(pv2w * pz);

  const posX = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3bx + gx0) + pv3ax) + pv3cx) + pv3dx) + gx1) + gx2);
  const posY = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3by + gy0) + pv3ay) + pv3cy) + pv3dy) + gy1) + gy2);
  const posZ = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3bz + gz0) + pv3az) + pv3cz) + pv3dz) + gz1) + gz2);
  const posW = Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(pv3bw + gw0) + pv3aw) + pv3cw) + pv3dw) + gw1) + gw2);

  // ---------- viewPosition = modelView * float4(pos.xyz, 1) ----------
  // %76 = %8  * splat(pos.x)  ; %77 = %29 * splat(pos.y) ; %78 = %77 + %76
  // %79 = %42 * splat(pos.z)  ; %80 = %78 + %79
  // %81 = %80 + %55           -> mv.col0*x + mv.col1*y + mv.col2*z + mv.col3
  const vx0 = Math.fround(mv0x * px), vx1 = Math.fround(mv1x * py), vx2 = Math.fround(mv2x * pz);
  const vy0 = Math.fround(mv0y * px), vy1 = Math.fround(mv1y * py), vy2 = Math.fround(mv2y * pz);
  const vz0 = Math.fround(mv0z * px), vz1 = Math.fround(mv1z * py), vz2 = Math.fround(mv2z * pz);
  const vw0 = Math.fround(mv0w * px), vw1 = Math.fround(mv1w * py), vw2 = Math.fround(mv2w * pz);

  const vpX = Math.fround(Math.fround(Math.fround(vx1 + vx0) + vx2) + mv3x);
  const vpY = Math.fround(Math.fround(Math.fround(vy1 + vy0) + vy2) + mv3y);
  const vpZ = Math.fround(Math.fround(Math.fround(vz1 + vz0) + vz2) + mv3z);
  const vpW = Math.fround(Math.fround(Math.fround(vw1 + vw0) + vw2) + mv3w);

  // ---------- normal = normalMatrix (float3x3) * normal.xyz ----------
  // %82 = gep verts[vertID].normal ; %83 = load <3 x float>  -> normal.xyz
  // %85 = load normalMatrix.col[0] (<3 x float>)
  // %87 = %85 * splat(nrm.x)
  // %89 = load normalMatrix.col[1] ; %91 = %89 * splat(nrm.y) ; %92 = %91 + %87
  // %94 = load normalMatrix.col[2] ; %96 = %94 * splat(nrm.z) ; %97 = %92 + %96
  const nx = rec.normal[0];
  const ny = rec.normal[1];
  const nz = rec.normal[2];
  const nm = uniforms.normalMatrix;
  // NormalMatrix3x3 exposed as 9 packed lanes: c0=[0,1,2], c1=[3,4,5], c2=[6,7,8].
  const n0x = nm[0], n0y = nm[1], n0z = nm[2];
  const n1x = nm[3], n1y = nm[4], n1z = nm[5];
  const n2x = nm[6], n2y = nm[7], n2z = nm[8];

  const t0x = Math.fround(n0x * nx), t0y = Math.fround(n0y * nx), t0z = Math.fround(n0z * nx);
  const t1x = Math.fround(n1x * ny), t1y = Math.fround(n1y * ny), t1z = Math.fround(n1z * ny);
  const t2x = Math.fround(n2x * nz), t2y = Math.fround(n2y * nz), t2z = Math.fround(n2z * nz);
  const s01x = Math.fround(t1x + t0x), s01y = Math.fround(t1y + t0y), s01z = Math.fround(t1z + t0z);
  const outNx = Math.fround(s01x + t2x);
  const outNy = Math.fround(s01y + t2y);
  const outNz = Math.fround(s01z + t2z);

  // ---------- color = passthrough ----------
  // %98 = gep verts[vertID].color ; %99 = load <4 x float>  -> color.xyzw
  const col = rec.color;

  // %100..%103 = insertvalue slots 0..3
  return {
    position: [posX, posY, posZ, posW],
    viewPosition: [vpX, vpY, vpZ, vpW],
    color: [col[0], col[1], col[2], col[3]],
    normal: [outNx, outNy, outNz],
  };
}
