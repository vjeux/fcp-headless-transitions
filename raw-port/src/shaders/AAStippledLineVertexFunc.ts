// Faithful transcription @0x00000000013b86
// @shader AAStippledLineVertexFunc (MDPKit)
//
// Antialiased stippled-line vertex shader from MDPKit's default.metallib
// (source file `MDPKit/Shaders/MDPAALine.metal`, line 124). Multiplies
// the per-vertex `<3 x float>` object-space position by the 4x4 `mvp`
// column-major matrix packed as `<4 x float> mvp[0..3]` in the
// MDPAALineUniforms constant buffer, adds the translation column (as a
// homogeneous vec4 add against the promoted-to-vec4 position sum), and
// passes color, brushTexCoord, and stipplePos through unchanged.
//
// Source LLVM IR: raw-port/re/shaders/AAStippledLineVertexFunc.ll
// Extracted from: MDPKit.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh AAStippledLineVertexFunc MDPKit`)
//
// AIR vertex signature (from air.vertex metadata !29 and !35..!40):
//   define <{ <4 x float>, <4 x float>, <2 x float>, float }>
//     @AAStippledLineVertexFunc(
//       MDPAALineUniforms addrspace(2)* %0,   ; air.buffer uniforms (size 80)
//       MDPAALineVertex   addrspace(1)* %1,   ; air.buffer verts (per-vertex)
//       i32 %2                                 ; air.vertex_id vert
//     )
//
// MDPAALineUniforms layout (!36, !37 — 80 bytes, align 16):
//   offset  0 (64 B) float4x4 mvp        (four `<4 x float>` columns)
//   offset 64 (8 B)  float2   gamma      (unused in this shader)
//   offset 72 (4 B)  uint     stipplePattern (unused)
//   offset 76 (4 B)  float    stippleScale   (unused)
//
// MDPAALineVertex layout (!38, !39 — 48 bytes, align 16):
//   offset  0 (16 B) float3   position   (`<3 x float>`, padded to 16)
//   offset 16 (16 B) float4   color
//   offset 32 (8 B)  float2   brushTexCoord
//   offset 40 (4 B)  float    stipplePos
//
// air.vertex_output list (!30..!34):
//   !31 air.position           float4 position
//   !32 air.vertex_output      float4 color
//   !33 air.vertex_output      float2 brushTexCoord
//   !34 air.vertex_output      float  stipplePos
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`
// — fast-math compile. No shortcut language of any kind — every fp32
// operation is Math.fround'd; every SSA value in the .ll body has a
// matching step below with its %N reference.
//
// IR line map (from the .ll body):
//   %4  = zext i32 %2 to i64                                   -> vertIdx
//   %5  = GEP verts[vertIdx].position                          -> address of pos
//   %6  = load <3 x float>, addrspace(1)*                      -> pos = verts[i].position
//   %7  = GEP uniforms.mvp[0][0..3]                            -> address of mvp col 0
//   %8  = load <4 x float>                                      -> mvpCol0
//   %9  = shufflevector <3xf> %6, undef, <0,0,0,0>              -> vec4(pos.x)
//   %10 = fmul fast <4 x float> %8, %9                          -> mvpCol0 * pos.x
//   %11 = GEP uniforms.mvp[0][1]                                -> address of mvp col 1
//   %12 = load <4 x float>                                      -> mvpCol1
//   %13 = shufflevector <3xf> %6, undef, <1,1,1,1>              -> vec4(pos.y)
//   %14 = fmul fast <4 x float> %12, %13                        -> mvpCol1 * pos.y
//   %15 = fadd fast <4 x float> %14, %10                        -> acc1 = c1*y + c0*x
//   %16 = GEP uniforms.mvp[0][2]                                -> address of mvp col 2
//   %17 = load <4 x float>                                      -> mvpCol2
//   %18 = shufflevector <3xf> %6, undef, <2,2,2,2>              -> vec4(pos.z)
//   %19 = fmul fast <4 x float> %17, %18                        -> mvpCol2 * pos.z
//   %20 = fadd fast <4 x float> %15, %19                        -> acc2 = acc1 + c2*z
//   %21 = GEP uniforms.mvp[0][3]                                -> address of mvp col 3
//   %22 = load <4 x float>                                      -> mvpCol3 (= translation col)
//   %23 = fadd fast <4 x float> %20, %22                        -> gl_Position = acc2 + c3
//   %24 = GEP verts[vertIdx].color                              -> color addr
//   %25 = load <4 x float>                                      -> color = verts[i].color
//   %26 = GEP verts[vertIdx].brushTexCoord                      -> texcoord addr
//   %27 = load <2 x float>                                      -> brushTexCoord
//   %28 = GEP verts[vertIdx].stipplePos                         -> stipplePos addr
//   %29 = load float                                             -> stipplePos
//   %30 = insertvalue struct, %23, 0                            -> {position, ., ., .}
//   %31 = insertvalue struct, %25, 1                            -> {., color, ., .}
//   %32 = insertvalue struct, %27, 2                            -> {., ., brushTexCoord, .}
//   %33 = insertvalue struct, %29, 3                            -> {., ., ., stipplePos}
//   ret
//
// Notes:
//   • The `<3 x float>` load is a 16-byte-aligned load: the fourth lane
//     of the underlying storage is padding (see !39 offset 0 size 16).
//     We only read three lanes; the padding lane is never used.
//   • Standard column-major `mvp * float4(pos.xyz, 1.0)` — the four
//     `fmul + fadd` steps expand the matrix-vector product with the
//     compiler-generated pattern `col0*x + col1*y + col2*z + col3*1`.
//   • Fast-math is enabled but the compiler emits explicit
//     `fmul` + `fadd` pairs (not `fma`) — we mirror that step-by-step.

/**
 * Standard MDPAALineUniforms struct as seen from JS: `mvp` is a
 * column-major 4x4 matrix packed as four `<4 x float>` columns; other
 * fields are present but unused by this shader.
 */
export interface MDPAALineUniforms {
  /** column-major 4x4 matrix — 4 columns of 4 fp32 lanes each. */
  readonly mvp: readonly [
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
  ];
  readonly gamma: readonly [number, number];
  readonly stipplePattern: number;
  readonly stippleScale: number;
}

/**
 * Per-vertex MDPAALineVertex. `position` is a 3-vector even though the
 * underlying storage is 16-byte-padded (see AIR layout notes above).
 */
export interface MDPAALineVertex {
  readonly position: readonly [number, number, number];
  readonly color: readonly [number, number, number, number];
  readonly brushTexCoord: readonly [number, number];
  readonly stipplePos: number;
}

/**
 * Return-value struct matching the `<{ <4 x float>, <4 x float>,
 * <2 x float>, float }>` AIR return. Field names come from the
 * `air.vertex_output` metadata (!31..!34).
 */
export interface AAStippledLineVertexOutput {
  /** air.position — clip-space position (mvp * float4(pos, 1)). */
  position: [number, number, number, number];
  /** air.vertex_output color — passed through. */
  color: [number, number, number, number];
  /** air.vertex_output brushTexCoord — passed through. */
  brushTexCoord: [number, number];
  /** air.vertex_output stipplePos — passed through. */
  stipplePos: number;
}

/**
 * AAStippledLineVertexFunc — MVP-transform the vertex position and
 * pass through color/brushTexCoord/stipplePos.
 *
 * @param uniforms  MDPAALineUniforms constant buffer (only `mvp` is read).
 * @param verts     per-vertex MDPAALineVertex array (indexed by `vert`).
 * @param vert      air.vertex_id — index into `verts`.
 * @returns         AAStippledLineVertexOutput (`{ position, color,
 *                  brushTexCoord, stipplePos }`).
 */
export function AAStippledLineVertexFunc(
  uniforms: MDPAALineUniforms,
  verts: ArrayLike<MDPAALineVertex>,
  vert: number,
): AAStippledLineVertexOutput {
  // %4 = zext i32 %2 to i64  — the vertex_id promoted to a 64-bit index.
  const vertIdx = vert >>> 0; // treat as unsigned int32 per AIR

  // %5..%6: load verts[vertIdx].position (`<3 x float>`).
  const v = verts[vertIdx];
  const posX = Math.fround(v.position[0]);
  const posY = Math.fround(v.position[1]);
  const posZ = Math.fround(v.position[2]);

  // %7..%8: load uniforms.mvp[0] (column 0, `<4 x float>`).
  const c0 = uniforms.mvp[0];
  // %9: shufflevector <3xf> to <0,0,0,0> — broadcast pos.x.
  // %10 = fmul fast <4xf> %8, <pos.x,pos.x,pos.x,pos.x>
  const c0x = Math.fround(Math.fround(c0[0]) * posX);
  const c0y = Math.fround(Math.fround(c0[1]) * posX);
  const c0z = Math.fround(Math.fround(c0[2]) * posX);
  const c0w = Math.fround(Math.fround(c0[3]) * posX);

  // %11..%12: mvp column 1.
  // %13: broadcast pos.y.
  // %14 = fmul; %15 = fadd (acc = c0*x + c1*y).
  const c1 = uniforms.mvp[1];
  const acc1x = Math.fround(c0x + Math.fround(Math.fround(c1[0]) * posY));
  const acc1y = Math.fround(c0y + Math.fround(Math.fround(c1[1]) * posY));
  const acc1z = Math.fround(c0z + Math.fround(Math.fround(c1[2]) * posY));
  const acc1w = Math.fround(c0w + Math.fround(Math.fround(c1[3]) * posY));

  // %16..%17: mvp column 2.
  // %18: broadcast pos.z.
  // %19 = fmul; %20 = fadd (acc = acc1 + c2*z).
  const c2 = uniforms.mvp[2];
  const acc2x = Math.fround(acc1x + Math.fround(Math.fround(c2[0]) * posZ));
  const acc2y = Math.fround(acc1y + Math.fround(Math.fround(c2[1]) * posZ));
  const acc2z = Math.fround(acc1z + Math.fround(Math.fround(c2[2]) * posZ));
  const acc2w = Math.fround(acc1w + Math.fround(Math.fround(c2[3]) * posZ));

  // %21..%22: mvp column 3 (translation column — implicit w=1 add).
  // %23 = fadd (gl_Position = acc2 + c3).
  const c3 = uniforms.mvp[3];
  const px = Math.fround(acc2x + Math.fround(c3[0]));
  const py = Math.fround(acc2y + Math.fround(c3[1]));
  const pz = Math.fround(acc2z + Math.fround(c3[2]));
  const pw = Math.fround(acc2w + Math.fround(c3[3]));

  // %24..%25: pass-through color = verts[i].color.
  const color: [number, number, number, number] = [
    Math.fround(v.color[0]),
    Math.fround(v.color[1]),
    Math.fround(v.color[2]),
    Math.fround(v.color[3]),
  ];

  // %26..%27: pass-through brushTexCoord = verts[i].brushTexCoord.
  const brushTexCoord: [number, number] = [
    Math.fround(v.brushTexCoord[0]),
    Math.fround(v.brushTexCoord[1]),
  ];

  // %28..%29: pass-through stipplePos = verts[i].stipplePos.
  const stipplePos = Math.fround(v.stipplePos);

  // %30..%33 + ret: pack the struct return.
  return {
    position: [px, py, pz, pw],
    color,
    brushTexCoord,
    stipplePos,
  };
}
