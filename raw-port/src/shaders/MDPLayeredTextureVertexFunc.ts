// Faithful transcription @0x000000000070f6
// @shader MDPLayeredTextureVertexFunc (MDPKit)
//
// Provenance: LLVM AIR IR at
// raw-port/re/shaders/MDPLayeredTextureVertexFunc.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// MDPKit.framework/Versions/A/Resources/default.metallib. The header
// line reads `0x000000000070f6 -- MDPLayeredTextureVertexFunc:` — the
// shader's entry offset in the metallib.
//
// Compile options in the .ll:
//   air.compile.denorms_disable, air.compile.fast_math_enable,
//   air.compile.framebuffer_fetch_enable
// Function attrs carry `unsafe-fp-math=true`, `approx-func-fp-math=true`
// — fast-math (reassoc/afn) flags. Ops in the body use `fmul fast` and
// `fadd fast`. Mapped to plain fp32-narrowed JS float ops via Math.fround.
//
// Vertex signature (from !29..!39):
//   returns struct-of-3:
//     [0] float4 position (air.position)     -- !31
//     [1] float4 color    (air.vertex_output generated(5colorDv4_f))    -- !32
//     [2] float2 texCoord (air.vertex_output generated(8texCoordDv2_f)) -- !33
//   %0 : MDPUniformMvp addrspace(2)* — constant-space uniform buffer, size 64.
//        struct at !36:
//          offset 0: float4x4 mvp   (64 bytes).
//   %1 : MDPTextureVertex addrspace(1)* — device-space vertex buffer.
//        struct at !38 (48 bytes, 16-byte aligned; trailing 8-byte pad
//        to bring stride up to 48):
//          offset  0: float3 position (16 bytes incl. pad).
//          offset 16: float4 color.
//          offset 32: float2 texCoord.
//   %2 : uint vert -- air.vertex_id.
//
// AIR intrinsics: none (all ops are LLVM primitives — fmul/fadd/load/getelementptr/
// shufflevector/zext).
//
// Kernel algorithm (from the IR body; single basic block, identical
// SAXPY chain to AALineCapVertexFunc — this is the same mvp * pos
// vertex-passthrough template family):
//
//   %4  = zext i32 vert to i64.
//   %5..%6 = load verts[vert].position as <3 x float>.
//   %7..%8   = load mvp[0] as <4 x float>.
//   %9  = splat(pos.x). %10 = fmul fast mvp[0], splat(pos.x).
//   %11..%12 = load mvp[1] as <4 x float>.
//   %13 = splat(pos.y). %14 = fmul fast mvp[1], splat(pos.y).
//   %15 = fadd fast %14, %10.
//   %16..%17 = load mvp[2] as <4 x float>.
//   %18 = splat(pos.z). %19 = fmul fast mvp[2], splat(pos.z).
//   %20 = fadd fast %15, %19.
//   %21..%22 = load mvp[3] as <4 x float>.
//   %23 = fadd fast %20, %22 -- mvp * float4(pos.xyz, 1.0).
//   %24..%25 = load verts[vert].color    as <4 x float>.
//   %26..%27 = load verts[vert].texCoord as <2 x float>.
//   %28..%30 = insertvalue into the return struct.
//   ret <{ float4, float4, float2 }> %30.

/**
 * Uniforms buffer for `MDPLayeredTextureVertexFunc` — mirrors the AIR
 * struct `MDPUniformMvp` at !36 (64 bytes, single float4x4).
 *
 * The `float4x4 mvp` is stored column-major in Metal (each column is a
 * <4 x float> load: mvp[0..3] at offsets 0/16/32/48). Modelled here as
 * four column-vectors so the SAXPY chain in the body mirrors the IR
 * exactly.
 */
export interface MDPUniformMvp {
  mvpCol0: [number, number, number, number]; // offset  0 : mvp column 0.
  mvpCol1: [number, number, number, number]; // offset 16 : mvp column 1.
  mvpCol2: [number, number, number, number]; // offset 32 : mvp column 2.
  mvpCol3: [number, number, number, number]; // offset 48 : mvp column 3.
}

/**
 * Per-vertex input for `MDPLayeredTextureVertexFunc` — mirrors the AIR
 * struct `MDPTextureVertex` at !38 (48 bytes, 16-byte aligned). The
 * `float3 position` at offset 0 occupies 16 bytes (padded to 16). The
 * struct has an explicit trailing `[8 x i8]` pad in the IR type
 * `%struct.MDPTextureVertex` so its stride is 48 bytes.
 */
export interface MDPTextureVertex {
  position: [number, number, number];      // offset  0 : float3.
  color: [number, number, number, number]; // offset 16 : float4.
  texCoord: [number, number];              // offset 32 : float2.
}

/**
 * Struct-of-3 return type mirroring the AIR return type
 * `<{ <4 x float>, <4 x float>, <2 x float> }>`.
 */
export interface MDPLayeredTextureVertexOutput {
  position: [number, number, number, number];
  color: [number, number, number, number];
  texCoord: [number, number];
}

/**
 * Vertex shader `MDPLayeredTextureVertexFunc` — projects a
 * MDPTextureVertex by the mvp matrix and passes through color and
 * texCoord.
 *
 * The matrix multiply is a per-column SAXPY chain (mvp[0]*pos.x +
 * mvp[1]*pos.y + mvp[2]*pos.z + mvp[3]), matching the IR literally.
 * Position lane w is implicitly 1.0 via the mvp[3] add. Same
 * template as the sibling AALineCapVertexFunc.
 *
 * @shader MDPLayeredTextureVertexFunc (MDPKit)
 */
export function MDPLayeredTextureVertexFunc(
  uniforms: MDPUniformMvp,
  verts: MDPTextureVertex[],
  vert: number,
): MDPLayeredTextureVertexOutput {
  // %4 = zext i32 vert to i64. JS array indices are 32-bit fine as-is.
  const idx = vert >>> 0;

  // %5..%6 = load verts[vert].position as <3 x float>.
  const p = verts[idx].position;
  const px = Math.fround(p[0]);
  const py = Math.fround(p[1]);
  const pz = Math.fround(p[2]);

  // Load mvp columns.
  const c0 = uniforms.mvpCol0;
  const c1 = uniforms.mvpCol1;
  const c2 = uniforms.mvpCol2;
  const c3 = uniforms.mvpCol3;

  // %9 = splat(pos.x). %10 = fmul fast mvp[0], splat(pos.x).
  const t0x = Math.fround(Math.fround(c0[0]) * px);
  const t0y = Math.fround(Math.fround(c0[1]) * px);
  const t0z = Math.fround(Math.fround(c0[2]) * px);
  const t0w = Math.fround(Math.fround(c0[3]) * px);

  // %13 = splat(pos.y). %14 = fmul fast mvp[1], splat(pos.y).
  const t1x = Math.fround(Math.fround(c1[0]) * py);
  const t1y = Math.fround(Math.fround(c1[1]) * py);
  const t1z = Math.fround(Math.fround(c1[2]) * py);
  const t1w = Math.fround(Math.fround(c1[3]) * py);

  // %15 = fadd fast %14, %10.
  const s01x = Math.fround(t1x + t0x);
  const s01y = Math.fround(t1y + t0y);
  const s01z = Math.fround(t1z + t0z);
  const s01w = Math.fround(t1w + t0w);

  // %18 = splat(pos.z). %19 = fmul fast mvp[2], splat(pos.z).
  const t2x = Math.fround(Math.fround(c2[0]) * pz);
  const t2y = Math.fround(Math.fround(c2[1]) * pz);
  const t2z = Math.fround(Math.fround(c2[2]) * pz);
  const t2w = Math.fround(Math.fround(c2[3]) * pz);

  // %20 = fadd fast %15, %19.
  const s012x = Math.fround(s01x + t2x);
  const s012y = Math.fround(s01y + t2y);
  const s012z = Math.fround(s01z + t2z);
  const s012w = Math.fround(s01w + t2w);

  // %23 = fadd fast %20, mvp[3] -- final clip-space position (w=1 folded via mvp[3]).
  const outX = Math.fround(s012x + Math.fround(c3[0]));
  const outY = Math.fround(s012y + Math.fround(c3[1]));
  const outZ = Math.fround(s012z + Math.fround(c3[2]));
  const outW = Math.fround(s012w + Math.fround(c3[3]));

  // %24..%27 = pass-through loads of color and texCoord.
  const color = verts[idx].color;
  const tc = verts[idx].texCoord;

  // %28..%30 = insertvalue into return struct.
  return {
    position: [outX, outY, outZ, outW],
    color: [
      Math.fround(color[0]),
      Math.fround(color[1]),
      Math.fround(color[2]),
      Math.fround(color[3]),
    ],
    texCoord: [Math.fround(tc[0]), Math.fround(tc[1])],
  };
}
