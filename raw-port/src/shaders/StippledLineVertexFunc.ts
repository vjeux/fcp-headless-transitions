// Faithful transcription @0x0000000000ca16
// @shader StippledLineVertexFunc (MDPKit/default) @0x0000000000ca16
// Source IR: raw-port/re/shaders/StippledLineVertexFunc.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/MDPKit.framework/
//     Versions/A/Resources/default.metallib
// via raw-port/tools/shader_disasm.sh — first-line offset reads
// `0x0000000000ca16 -- StippledLineVertexFunc:`)
//
// From DICompileUnit !0 the source .metal file is
//   /Library/Caches/com.apple.xbs/Sources/MDPKit/MDPKit-45000.0.1/MDPKit/Shaders/MDPLine.metal
// with DISubprogram !40 placing the body at lines 64..74. The inlined DISubprograms show
// the arithmetic is a hand-inlined `_matrix_vector_product_impl<float,4,4>` — the
// standard column-major float4x4 * float3(pos, ?) → float4 lane accumulation, with the
// input treated as (pos.x, pos.y, pos.z, 1) via the fourth column of mvp being added
// unconditionally (i.e., no `pos.w * mvp[3]` multiply — mvp[3] is added as-is).
//
// Vertex shader for a stippled polyline. Reads a per-vertex struct from a device buffer
// indexed by [[vertex_id]], transforms position by `uniforms.mvp`, and passes color +
// stipplePos through to the fragment stage.
//
// Signature from !air.vertex (!29..!39):
//   vertex struct { float4 position [[position]]; float4 color; float stipplePos; }
//   StippledLineVertexFunc(
//       constant MDPAliasedLineUniforms* uniforms [[buffer(0)]],   // %0
//       device   MDPAliasedLineVertex*   verts    [[buffer(1)]],   // %1
//       uint                             vert     [[vertex_id]]    // %2
//   );
//
// struct MDPAliasedLineUniforms {          // !36 — total 80 bytes, align 16
//   float4x4 mvp;              // offset  0, size 64
//   uint     stipplePattern;   // offset 64, size  4 — UNUSED in this vertex shader
//   float    stippleScale;     // offset 68, size  4 — UNUSED in this vertex shader
//   // [8 byte trailing pad — the IR sees the struct with `<{ ..., [8 x i8] }>` packing]
// };
//
// struct MDPAliasedLineVertex {            // !38 — total 48 bytes, align 16
//   float3 position;           // offset  0, size 16 (float3 padded to 16 in device buf)
//   float4 color;              // offset 16, size 16
//   float  stipplePos;         // offset 32, size  4
//   // [12 byte trailing pad — struct is { <3 x float>, <4 x float>, float, [12 x i8] }]
// };
//
// IR body (single BB, straight-line):
//   %4  = zext i32 vert to i64
//   %5  = gep verts[vert].position
//   %6  = load <3 x float> %5                                    — pos.xyz
//   %7  = gep uniforms.mvp[0]
//   %8  = load <4 x float> %7                                    — mvp[0]
//   %9  = shufflevector pos, undef, <0,0,0,0>                    — pos.x splat4
//   %10 = fmul fast mvp[0], pos.x
//   %11 = gep uniforms.mvp[1]
//   %12 = load <4 x float> %11                                   — mvp[1]
//   %13 = shufflevector pos, undef, <1,1,1,1>                    — pos.y splat4
//   %14 = fmul fast mvp[1], pos.y
//   %15 = fadd fast %14, %10                                     — sum row1
//   %16 = gep uniforms.mvp[2]
//   %17 = load <4 x float> %16                                   — mvp[2]
//   %18 = shufflevector pos, undef, <2,2,2,2>                    — pos.z splat4
//   %19 = fmul fast mvp[2], pos.z
//   %20 = fadd fast %15, %19                                     — sum row2
//   %21 = gep uniforms.mvp[3]
//   %22 = load <4 x float> %21                                   — mvp[3]
//   %23 = fadd fast %20, %22                                     — final position (w=1)
//   %24 = gep verts[vert].color
//   %25 = load <4 x float> %24                                   — color
//   %26 = gep verts[vert].stipplePos
//   %27 = load float %26                                         — stipplePos
//   ret { %23, %25, %27 }
//
// Notes:
//   - "fmul fast" / "fadd fast" everywhere plus fast-math attrs. Coerce every fp op
//     through Math.fround for Metal fp32 semantics.
//   - The final `+ mvp[3]` (no multiply) mirrors treating position.w as 1.0 exactly.
//     This is what LLVM emits when the metal source is `uniforms.mvp * float4(pos, 1)`.

/**
 * Uniforms buffer for MDPKit's aliased/stippled line pipeline — MDPAliasedLineUniforms.
 * Total 80 bytes, align 16.
 *
 * From !36 struct_type_info:
 *   offset  0: float4x4 mvp            (read here)
 *   offset 64: uint     stipplePattern (unused by this vertex shader)
 *   offset 68: float    stippleScale   (unused by this vertex shader)
 */
export interface MDPAliasedLineUniforms {
  /** Column-major float4x4. `mvp[c]` is column `c` — each is a float4 of 4 rows. */
  mvp: readonly [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
  /** uint stipplePattern — unused by the vertex shader (fragment-side only). */
  stipplePattern: number;
  /** float stippleScale — unused by the vertex shader (fragment-side only). */
  stippleScale: number;
}

/**
 * Per-vertex struct — MDPAliasedLineVertex. 48 bytes, align 16.
 *
 * From !38 struct_type_info:
 *   offset  0: float3 position    (device: padded to 16 bytes)
 *   offset 16: float4 color
 *   offset 32: float  stipplePos
 *   (offset 36..47: implicit pad)
 */
export interface MDPAliasedLineVertex {
  /** float3 position — .xyz are read; the shader implicitly treats w as 1. */
  position: [number, number, number];
  /** float4 color — passthrough to fragment stage. */
  color: [number, number, number, number];
  /** float stipplePos — passthrough to fragment stage. */
  stipplePos: number;
}

/**
 * StippledLineVertexFunc — one vertex.
 *
 * @param uniforms  constant buffer 0 — provides `mvp`; stipple fields are unused here.
 * @param verts     device buffer 1 — the vertex array, indexed by `vert`.
 * @param vert      [[vertex_id]] — u32 index into `verts`.
 * @returns         the vertex outputs `{ position, color, stipplePos }`.
 *
 * @IR entire function @0x0000000000ca16.
 */
export function StippledLineVertexFunc(
  uniforms: MDPAliasedLineUniforms,
  verts: ReadonlyArray<MDPAliasedLineVertex>,
  vert: number,
): {
  /** air.position — mvp * float4(pos, 1). @IR %23 */
  position: [number, number, number, number];
  /** vertex_output "color" — verts[vert].color verbatim. @IR %25 */
  color: [number, number, number, number];
  /** vertex_output "stipplePos" — verts[vert].stipplePos verbatim. @IR %27 */
  stipplePos: number;
} {
  // @IR %4 = zext i32 vert to i64
  const i = vert >>> 0;
  // @IR %5 = gep verts[i].position; %6 = load <3 x float>
  const p = verts[i].position;
  const px = Math.fround(p[0]);
  const py = Math.fround(p[1]);
  const pz = Math.fround(p[2]);
  // @IR %7  = gep uniforms.mvp[0]; %8  = load <4 x float>   — column 0
  //     %9  = splat4(px)
  //     %10 = fmul fast mvp[0], px
  const m0 = uniforms.mvp[0];
  const c00 = Math.fround(m0[0] * px);
  const c01 = Math.fround(m0[1] * px);
  const c02 = Math.fround(m0[2] * px);
  const c03 = Math.fround(m0[3] * px);
  // @IR %11 = gep uniforms.mvp[1]; %12 = load <4 x float>   — column 1
  //     %13 = splat4(py)
  //     %14 = fmul fast mvp[1], py
  //     %15 = fadd fast %14, %10                            — running sum
  const m1 = uniforms.mvp[1];
  const s10 = Math.fround(Math.fround(m1[0] * py) + c00);
  const s11 = Math.fround(Math.fround(m1[1] * py) + c01);
  const s12 = Math.fround(Math.fround(m1[2] * py) + c02);
  const s13 = Math.fround(Math.fround(m1[3] * py) + c03);
  // @IR %16 = gep uniforms.mvp[2]; %17 = load <4 x float>   — column 2
  //     %18 = splat4(pz)
  //     %19 = fmul fast mvp[2], pz
  //     %20 = fadd fast %15, %19                            — running sum
  const m2 = uniforms.mvp[2];
  const s20 = Math.fround(s10 + Math.fround(m2[0] * pz));
  const s21 = Math.fround(s11 + Math.fround(m2[1] * pz));
  const s22 = Math.fround(s12 + Math.fround(m2[2] * pz));
  const s23 = Math.fround(s13 + Math.fround(m2[3] * pz));
  // @IR %21 = gep uniforms.mvp[3]; %22 = load <4 x float>   — column 3
  //     %23 = fadd fast %20, %22                            — final position (w=1)
  const m3 = uniforms.mvp[3];
  const outPos: [number, number, number, number] = [
    Math.fround(s20 + m3[0]),
    Math.fround(s21 + m3[1]),
    Math.fround(s22 + m3[2]),
    Math.fround(s23 + m3[3]),
  ];
  // @IR %24 = gep verts[i].color; %25 = load <4 x float>
  const c = verts[i].color;
  // @IR %26 = gep verts[i].stipplePos; %27 = load float
  const sp = verts[i].stipplePos;
  // @IR %28..%30 = insertvalue chain; ret
  return {
    position: outPos,
    color: [c[0], c[1], c[2], c[3]],
    stipplePos: sp,
  };
}
