// Faithful transcription — see raw-port/re/shaders/TextureVertexFunc.ll
// @shader TextureVertexFunc (MDPKit)
// @0x0000000000022706 — MDPKit.framework/Versions/A/Resources/default.metallib
//
// Vertex shader from MDPKit's texture-drawing pipeline (DISubprogram !40).
// Runs once per vertex: reads a struct-of-arrays vertex (float3 position,
// float4 color, float2 texCoord — 48-byte stride) indexed by vertex_id,
// transforms position by an MVP matrix loaded from a constant buffer, and
// forwards color + texCoord to the fragment stage unchanged.
//
// Source LLVM IR: raw-port/re/shaders/TextureVertexFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh TextureVertexFunc MDPKit`). This is
// the direct sibling of MDPTextureAlphaHitIDVertexFunc (same MVP math, just
// different pass-through payload: color+texCoord vs texCoord+hitID).
//
// AIR signature (from air.vertex !29 and !30..!39):
//   define <{ <4 x float>, <4 x float>, <2 x float> }> @TextureVertexFunc(
//     constant MDPUniformMvp*  uniforms   ; !35 buffer 0, 64 bytes align 16
//     device   MDPTextureVertex* verts    ; !37 buffer 1, 48-byte stride align 16
//     uint                     vert       ; !39 air.vertex_id
//   ) -> struct { float4 position, float4 color, float2 texCoord }
//
// MDPUniformMvp layout (from !36):
//   +0   float4x4  mvp                                    (64 bytes)
//
// MDPTextureVertex layout (from !38, stride 48 align 16):
//   +0   float3    position                               (16 bytes w/ pad)
//   +16  float4    color                                  (16 bytes)
//   +32  float2    texCoord                               (8 bytes)
//   +40  [8 x i8]  trailing pad                           (stride 48)
//
// Vertex outputs (from !30..!33):
//   !31  air.position                float4               -> struct field 0
//   !32  air.vertex_output "color"    float4              -> struct field 1
//   !33  air.vertex_output "texCoord" float2              -> struct field 2
//
// Function attributes: `argmemonly mustprogress nofree norecurse nosync nounwind
// readonly willreturn` plus `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, and
// `air.compile.fast_math_enable`. All MVP mul/add pairs are `fmul fast` /
// `fadd fast` — the fast-math flags authorize reassociation and FMA.
//
// IR line map (%N → semantics):
//   %4  zext i32 vert to i64                                        ; index widening
//   %5  gep verts[%4].position                                      ; &vert.position
//   %6  load <3 x float>                                            ; p = vert.position
//   %7  gep uniforms->mvp[0]                                        ; &mvp col 0
//   %8  load <4 x float>                                            ; c0 = mvp col 0
//   %9  shufflevector p, undef, <0,0,0,0>                           ; splat p.x → <4>
//   %10 fmul fast <4> c0 * splat(p.x)
//   %11 gep uniforms->mvp[1]
//   %12 load <4 x float>                                            ; c1
//   %13 shufflevector p, undef, <1,1,1,1>                           ; splat p.y
//   %14 fmul fast <4> c1 * splat(p.y)
//   %15 fadd fast <4> %14 + %10                                     ; c0*p.x + c1*p.y
//   %16 gep uniforms->mvp[2]
//   %17 load <4 x float>                                            ; c2
//   %18 shufflevector p, undef, <2,2,2,2>                           ; splat p.z
//   %19 fmul fast <4> c2 * splat(p.z)
//   %20 fadd fast <4> %15 + %19                                     ; += c2*p.z
//   %21 gep uniforms->mvp[3]
//   %22 load <4 x float>                                            ; c3
//   %23 fadd fast <4> %20 + %22                                     ; += c3 (implicit p.w=1)
//   %24 gep verts[%4].color                                         ; &vert.color
//   %25 load <4 x float>                                            ; col = vert.color
//   %26 gep verts[%4].texCoord                                      ; &vert.texCoord
//   %27 load <2 x float>                                            ; t = vert.texCoord
//   %28..%30 insertvalue struct { %23, %25, %27 }                   ; wrap outputs
//   ret <{ <4 x float>, <4 x float>, <2 x float> }> %30
//
// Column-major mat4 · (px, py, pz, 1). No perspective divide here — Metal
// consumes air.position downstream.

/**
 * MDPUniformMvp — one 4x4 matrix, stored column-major (each `mvpN` is a
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
 * MDPTextureVertex — one textured vertex record. 48-byte stride, 16-byte
 * aligned per !37/!38.
 */
export interface MDPTextureVertex {
  /** float3 position @+0 (16 bytes w/ pad). */
  position: readonly [number, number, number];
  /** float4 color @+16 (16 bytes). */
  color: readonly [number, number, number, number];
  /** float2 texCoord @+32 (8 bytes). */
  texCoord: readonly [number, number];
}

/**
 * Vertex-stage output record — mirrors the AIR return struct
 * `<{ <4 x float>, <4 x float>, <2 x float> }>` (fields 0/1/2 per !30..!33).
 */
export interface TextureVertexOut {
  /** air.position (%23) — MVP-transformed clip-space position. */
  position: [number, number, number, number];
  /** air.vertex_output "color" (%25) — pass-through of vert.color. */
  color: [number, number, number, number];
  /** air.vertex_output "texCoord" (%27) — pass-through of vert.texCoord. */
  texCoord: [number, number];
}

/**
 * TextureVertexFunc — transform vertex position by MVP; forward color and
 * texCoord unchanged.
 *
 * @param uniforms constant buffer 0: MDPUniformMvp with column-major MVP (%0).
 * @param verts    device buffer 1: array of MDPTextureVertex records (%1).
 * @param vert     air.vertex_id — index into `verts` (%2).
 * @returns        the vertex-stage output tuple (position, color, texCoord).
 */
export function TextureVertexFunc(
  uniforms: MDPUniformMvp,
  verts: readonly MDPTextureVertex[],
  vert: number,
): TextureVertexOut {
  // %4: zext i32 vert to i64.
  const idx = vert >>> 0;

  // %5/%6: p = verts[idx].position.
  const v = verts[idx];
  const px = Math.fround(v.position[0]);
  const py = Math.fround(v.position[1]);
  const pz = Math.fround(v.position[2]);

  // %7..%22: load the four MVP columns.
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

  // %9..%23: pos.i = c0.i*px + c1.i*py + c2.i*pz + c3.i, evaluated with fp32
  // narrowing on every mul/add lane (matching the AIR fmul fast / fadd fast).
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

  // %24/%25: col = verts[idx].color   (passthrough)
  // %26/%27: t   = verts[idx].texCoord (passthrough)
  const col0 = Math.fround(v.color[0]);
  const col1 = Math.fround(v.color[1]);
  const col2 = Math.fround(v.color[2]);
  const col3 = Math.fround(v.color[3]);
  const tx = Math.fround(v.texCoord[0]);
  const ty = Math.fround(v.texCoord[1]);

  // %28..%30 + ret: wrap the three outputs into the return struct.
  return {
    position: [outX, outY, outZ, outW],
    color: [col0, col1, col2, col3],
    texCoord: [tx, ty],
  };
}
