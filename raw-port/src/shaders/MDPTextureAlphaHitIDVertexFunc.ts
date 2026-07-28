// Faithful transcription — see raw-port/re/shaders/MDPTextureAlphaHitIDVertexFunc.ll
// @shader MDPTextureAlphaHitIDVertexFunc (MDPKit)
// @0x0000000002a766 — MDPKit.framework/Versions/A/Resources/default.metallib
//
// Vertex shader from MDPKit's MDPTextureAlphaHitID.metal (DISubprogram !40
// line 28). Runs once per vertex of the "textured alpha-mask hit-testing"
// primitive: reads a struct-of-arrays vertex (float3 position, float2 texCoord,
// uint hitID) indexed by the vertex_id, transforms the position by an MVP
// matrix loaded from a constant buffer, and forwards the texCoord + hitID to
// the fragment stage unchanged.
//
// Source LLVM IR: raw-port/re/shaders/MDPTextureAlphaHitIDVertexFunc.ll
// (extracted via `bash raw-port/tools/shader_disasm.sh
// MDPTextureAlphaHitIDVertexFunc MDPKit`).
//
// AIR signature (from air.vertex !29 and !30..!39):
//   define <{ <4 x float>, <2 x float>, i32 }> @MDPTextureAlphaHitIDVertexFunc(
//     constant MDPUniformMvp*      uniforms  ; !35 buffer 0, 64 bytes align 16
//     device   MDPTextureAlphaHitIDVertex* verts ; !37 buffer 1, 32-byte stride
//     uint                         vert      ; !39 air.vertex_id
//   ) -> struct { float4 position, float2 texCoord, uint hitID }
//
// MDPUniformMvp layout (from !36):
//   +0   float4x4  mvp                                    (64 bytes)
//
// MDPTextureAlphaHitIDVertex layout (from !38, stride 32 align 16):
//   +0   float3    position                               (16 bytes w/ pad)
//   +16  float2    texCoord                               (8 bytes)
//   +24  uint      hitID                                  (4 bytes)
//
// Vertex outputs (from !30..!33):
//   !31  air.position                                     -> struct field 0
//   !32  air.vertex_output "texCoord" float2              -> struct field 1
//   !33  air.vertex_output "hitID"    uint                -> struct field 2
//
// Function attributes: `argmemonly mustprogress nofree norecurse nosync nounwind
// readonly willreturn` plus `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, and
// `air.compile.fast_math_enable`. All FMA-eligible mul/add pairs are `fmul fast`
// + `fadd fast` — the fast-math flags authorize reassociation.
//
// IR line map (%N → semantics):
//   %4  zext i32 vert to i64                                        ; index widening
//   %5  gep verts[%4].position                                      ; &vert.position
//   %6  load <3 x float> from %5                                    ; p = vert.position
//   %7  gep uniforms->mvp[0]  (column 0)                            ; &mvp[0]
//   %8  load <4 x float> from %7                                    ; c0 = mvp col 0
//   %9  shufflevector p, undef, <0,0,0,0>                           ; splat p.x → <4>
//   %10 fmul fast <4> c0 * splat(p.x)                               ; c0 * p.x
//   %11 gep uniforms->mvp[1]                                        ; &mvp[1]
//   %12 load <4 x float>                                            ; c1 = mvp col 1
//   %13 shufflevector p, undef, <1,1,1,1>                           ; splat p.y → <4>
//   %14 fmul fast <4> c1 * splat(p.y)                               ; c1 * p.y
//   %15 fadd fast <4> %14 + %10                                     ; c0*p.x + c1*p.y
//   %16 gep uniforms->mvp[2]                                        ; &mvp[2]
//   %17 load <4 x float>                                            ; c2 = mvp col 2
//   %18 shufflevector p, undef, <2,2,2,2>                           ; splat p.z → <4>
//   %19 fmul fast <4> c2 * splat(p.z)                               ; c2 * p.z
//   %20 fadd fast <4> %15 + %19                                     ; += c2*p.z
//   %21 gep uniforms->mvp[3]                                        ; &mvp[3]
//   %22 load <4 x float>                                            ; c3 = mvp col 3
//   %23 fadd fast <4> %20 + %22                                     ; += c3  (implicit p.w=1)
//   %24 gep verts[%4].texCoord                                      ; &vert.texCoord
//   %25 load <2 x float>                                            ; t = vert.texCoord
//   %26 gep verts[%4].hitID                                         ; &vert.hitID
//   %27 load i32                                                    ; h = vert.hitID
//   %28..%30 insertvalue struct { %23, %25, %27 } into return       ; wrap outputs
//   ret <{ <4 x float>, <2 x float>, i32 }> %30
//
// The transform is a column-major mat4 * (px, py, pz, 1) — the shader stores
// the columns as 4-vectors and computes col0*x + col1*y + col2*z + col3 (which
// is exactly M·(x,y,z,1) for a column-major matrix). No perspective divide
// happens here — that is Metal's job when it consumes air.position.

/**
 * MDPUniformMvp — one 4x4 matrix, stored column-major (each `mvp[i]` is a
 * column vector). 64 bytes, 16-byte aligned per !35.
 */
export interface MDPUniformMvp {
  /** Column 0 of the MVP matrix (mvp[0]). */
  mvp0: readonly [number, number, number, number];
  /** Column 1 of the MVP matrix (mvp[1]). */
  mvp1: readonly [number, number, number, number];
  /** Column 2 of the MVP matrix (mvp[2]). */
  mvp2: readonly [number, number, number, number];
  /** Column 3 of the MVP matrix (mvp[3]). */
  mvp3: readonly [number, number, number, number];
}

/**
 * MDPTextureAlphaHitIDVertex — the input vertex record. 32-byte stride,
 * 16-byte aligned per !37/!38.
 */
export interface MDPTextureAlphaHitIDVertex {
  /** float3 position @+0 (16 bytes with trailing pad). */
  position: readonly [number, number, number];
  /** float2 texCoord @+16 (8 bytes). */
  texCoord: readonly [number, number];
  /** uint hitID @+24 (4 bytes). */
  hitID: number;
}

/**
 * Vertex-stage output record — mirrors the AIR return struct
 * `<{ <4 x float>, <2 x float>, i32 }>` (fields 0/1/2 per !30..!33).
 */
export interface MDPTextureAlphaHitIDVertexOut {
  /** air.position (%23) — the MVP-transformed clip-space position. */
  position: [number, number, number, number];
  /** air.vertex_output "texCoord" (%25) — pass-through of vert.texCoord. */
  texCoord: [number, number];
  /** air.vertex_output "hitID" (%27) — pass-through of vert.hitID. */
  hitID: number;
}

/**
 * MDPTextureAlphaHitIDVertexFunc — transform vertex position by MVP, and
 * forward texCoord + hitID unchanged.
 *
 * @param uniforms constant buffer 0: MDPUniformMvp with a column-major MVP matrix (%0).
 * @param verts    device buffer 1: array of MDPTextureAlphaHitIDVertex records (%1).
 * @param vert     air.vertex_id — index into `verts` (%2).
 * @returns        the vertex-stage output tuple (position, texCoord, hitID).
 */
export function MDPTextureAlphaHitIDVertexFunc(
  uniforms: MDPUniformMvp,
  verts: readonly MDPTextureAlphaHitIDVertex[],
  vert: number,
): MDPTextureAlphaHitIDVertexOut {
  // %4: zext i32 vert to i64 — just the JS index.
  const idx = vert >>> 0;

  // %5/%6: p = verts[idx].position (float3, but only .x/.y/.z are read below).
  const v = verts[idx];
  const px = Math.fround(v.position[0]);
  const py = Math.fround(v.position[1]);
  const pz = Math.fround(v.position[2]);

  // %7/%8:   c0 = uniforms.mvp[0]
  // %11/%12: c1 = uniforms.mvp[1]
  // %16/%17: c2 = uniforms.mvp[2]
  // %21/%22: c3 = uniforms.mvp[3]
  const c00 = Math.fround(uniforms.mvp0[0]);
  const c01 = Math.fround(uniforms.mvp0[1]);
  const c02 = Math.fround(uniforms.mvp0[2]);
  const c03 = Math.fround(uniforms.mvp0[3]);
  const c10 = Math.fround(uniforms.mvp1[0]);
  const c11 = Math.fround(uniforms.mvp1[1]);
  const c12 = Math.fround(uniforms.mvp1[2]);
  const c13 = Math.fround(uniforms.mvp1[3]);
  const c20 = Math.fround(uniforms.mvp2[0]);
  const c21 = Math.fround(uniforms.mvp2[1]);
  const c22 = Math.fround(uniforms.mvp2[2]);
  const c23 = Math.fround(uniforms.mvp2[3]);
  const c30 = Math.fround(uniforms.mvp3[0]);
  const c31 = Math.fround(uniforms.mvp3[1]);
  const c32 = Math.fround(uniforms.mvp3[2]);
  const c33 = Math.fround(uniforms.mvp3[3]);

  // %9/%10:  c0 * splat(p.x)                       ; per-lane multiply
  // %13/%14: c1 * splat(p.y)
  // %15:     %14 + %10
  // %18/%19: c2 * splat(p.z)
  // %20:     %15 + %19
  // %23:     %20 + c3                              ; implicit p.w = 1
  //
  // The IR evaluates lane-parallel <4 x float>: pos.i = c0.i*px + c1.i*py + c2.i*pz + c3.i.
  // We transcribe each lane individually so the fp32 narrowing on every
  // fmul/fadd matches AIR (fast-math flags let the hardware reassociate — the
  // per-op fround here is the shader's own f32 fidelity).
  const outX = Math.fround(
    Math.fround(Math.fround(Math.fround(c00 * px) + Math.fround(c10 * py)) + Math.fround(c20 * pz)) +
      c30,
  );
  const outY = Math.fround(
    Math.fround(Math.fround(Math.fround(c01 * px) + Math.fround(c11 * py)) + Math.fround(c21 * pz)) +
      c31,
  );
  const outZ = Math.fround(
    Math.fround(Math.fround(Math.fround(c02 * px) + Math.fround(c12 * py)) + Math.fround(c22 * pz)) +
      c32,
  );
  const outW = Math.fround(
    Math.fround(Math.fround(Math.fround(c03 * px) + Math.fround(c13 * py)) + Math.fround(c23 * pz)) +
      c33,
  );

  // %24/%25: t = verts[idx].texCoord   (passthrough)
  // %26/%27: h = verts[idx].hitID      (passthrough)
  const tx = Math.fround(v.texCoord[0]);
  const ty = Math.fround(v.texCoord[1]);
  const h = v.hitID | 0;

  // %28..%30 + ret: wrap the three outputs into the return struct.
  return {
    position: [outX, outY, outZ, outW],
    texCoord: [tx, ty],
    hitID: h,
  };
}
