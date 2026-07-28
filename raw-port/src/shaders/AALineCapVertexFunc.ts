// Faithful transcription @0x00000000015a76
// @shader AALineCapVertexFunc (MDPKit)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/AALineCapVertexFunc.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// MDPKit.framework/Versions/A/Resources/default.metallib. The header
// line reads `0x00000000015a76 -- AALineCapVertexFunc:` — the shader's
// entry offset in the metallib.
//
// Compile options in the .ll:
//   air.compile.denorms_disable, air.compile.fast_math_enable,
//   air.compile.framebuffer_fetch_enable
// Function attrs carry `unsafe-fp-math=true`, `approx-func-fp-math=true`
// — fast-math (reassoc/afn) flags. Ops in the body use `fmul fast` and
// `fadd fast`. Mapped to plain fp32-narrowed JS float ops via Math.fround.
//
// Vertex signature (from !29..!40):
//   returns struct-of-4:
//     [0] float4 position       (air.position)     -- !31
//     [1] float4 color          (air.vertex_output generated(5colorDv4_f)) -- !32
//     [2] float2 brushTexCoord  (air.vertex_output generated(13brushTexCoordDv2_f)) -- !33
//     [3] float2 brushCapTexCoord (air.vertex_output generated(16brushCapTexCoordDv2_f)) -- !34
//   %0 : MDPAALineUniforms addrspace(2)* — constant-space uniform buffer, size 80.
//        struct at !37 (16-byte-aligned):
//          offset  0: float4x4 mvp             (16 * 4 = 64 bytes).
//          offset 64: float2   gamma           (8 bytes).
//          offset 72: uint     stipplePattern  (4 bytes).
//          offset 76: float    stippleScale    (4 bytes).
//   %1 : MDPAALineCapVertex addrspace(1)* — device-space vertex buffer.
//        struct at !39 (16-byte-aligned):
//          offset  0: float3 position         (16 bytes incl. pad).
//          offset 16: float4 color            (16 bytes).
//          offset 32: float2 brushTexCoord    (8 bytes).
//          offset 40: float2 brushCapTexCoord (8 bytes).
//   %2 : uint vert -- air.vertex_id.
//
// AIR intrinsics: none (all ops are LLVM primitives — fmul/fadd/load/getelementptr/
// shufflevector/zext).
//
// Kernel algorithm (from the IR body; single basic block):
//
//   %4  = zext i32 vert to i64.
//   %5..%6 = load verts[vert].position as <3 x float>.
//   %7..%8 = load mvp[0] (row/column 0)  as <4 x float>.
//   %9 = shufflevector <3 x float> %6, undef, <4 x i32> <0,0,0,0>   -- splat pos.x.
//   %10 = fmul fast %8, splat(pos.x).
//   %11..%12 = load mvp[1] as <4 x float>.
//   %13 = shufflevector <3 x float> %6, undef, <4 x i32> <1,1,1,1>  -- splat pos.y.
//   %14 = fmul fast %12, splat(pos.y).
//   %15 = fadd fast %14, %10.
//   %16..%17 = load mvp[2] as <4 x float>.
//   %18 = shufflevector <3 x float> %6, undef, <4 x i32> <2,2,2,2>  -- splat pos.z.
//   %19 = fmul fast %17, splat(pos.z).
//   %20 = fadd fast %15, %19.
//   %21..%22 = load mvp[3] as <4 x float>.
//   %23 = fadd fast %20, %22
//     -- mvp * float4(pos.xyz, 1.0) via column-major SAXPY chain;
//        matches metal_matrix.h operator*<float, 4, 4> at !60.
//   %24..%25 = load verts[vert].color         as <4 x float>.
//   %26..%27 = load verts[vert].brushTexCoord as <2 x float>.
//   %28..%29 = load verts[vert].brushCapTexCoord as <2 x float>.
//   %30..%33 = insertvalue into the return struct.
//   ret <{ float4, float4, float2, float2 }> %33.
//
// (No perspective divide or w-clip is emitted by this shader — that's
// the rasteriser's job downstream.)

/**
 * Uniforms buffer for `AALineCapVertexFunc` — mirrors the AIR struct
 * `MDPAALineUniforms` at !37 (80 bytes, 16-byte aligned).
 *
 * The `float4x4 mvp` is stored column-major in Metal (each column is a
 * <4 x float> load: mvp[0..3] at offsets 0/16/32/48). Modelled here as
 * four column-vectors so the SAXPY chain in the body mirrors the IR
 * exactly.
 */
export interface MDPAALineUniforms {
  mvpCol0: [number, number, number, number]; // offset  0 : mvp column 0.
  mvpCol1: [number, number, number, number]; // offset 16 : mvp column 1.
  mvpCol2: [number, number, number, number]; // offset 32 : mvp column 2.
  mvpCol3: [number, number, number, number]; // offset 48 : mvp column 3.
  gamma: [number, number];                   // offset 64 : unused here.
  stipplePattern: number;                    // offset 72 : unused here.
  stippleScale: number;                      // offset 76 : unused here.
}

/**
 * Per-vertex input for `AALineCapVertexFunc` — mirrors the AIR struct
 * `MDPAALineCapVertex` at !39 (48 bytes, 16-byte aligned). The `float3
 * position` at offset 0 occupies 16 bytes (padded).
 */
export interface MDPAALineCapVertex {
  position: [number, number, number];         // offset  0 : float3.
  color: [number, number, number, number];    // offset 16 : float4.
  brushTexCoord: [number, number];            // offset 32 : float2.
  brushCapTexCoord: [number, number];         // offset 40 : float2.
}

/**
 * Struct-of-4 return type mirroring the AIR return type
 * `<{ <4 x float>, <4 x float>, <2 x float>, <2 x float> }>`.
 */
export interface AALineCapVertexOutput {
  position: [number, number, number, number];
  color: [number, number, number, number];
  brushTexCoord: [number, number];
  brushCapTexCoord: [number, number];
}

/**
 * Vertex shader `AALineCapVertexFunc` — projects a MDPAALineCapVertex
 * by the mvp matrix and passes through color and both brush texcoords.
 *
 * The matrix multiply is a per-column SAXPY chain (mvp[0]*pos.x +
 * mvp[1]*pos.y + mvp[2]*pos.z + mvp[3]), matching the IR literally.
 * Position lane w is implicitly 1.0 via the mvp[3] add.
 *
 * @shader AALineCapVertexFunc (MDPKit)
 */
export function AALineCapVertexFunc(
  uniforms: MDPAALineUniforms,
  verts: MDPAALineCapVertex[],
  vert: number,
): AALineCapVertexOutput {
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

  // %23 = fadd fast %20, mvp[3] -- final clip-space position (w=1 is folded in via mvp[3]).
  const outX = Math.fround(s012x + Math.fround(c3[0]));
  const outY = Math.fround(s012y + Math.fround(c3[1]));
  const outZ = Math.fround(s012z + Math.fround(c3[2]));
  const outW = Math.fround(s012w + Math.fround(c3[3]));

  // %24..%29 = pass-through loads of color, brushTexCoord, brushCapTexCoord.
  const color = verts[idx].color;
  const brushTC = verts[idx].brushTexCoord;
  const brushCapTC = verts[idx].brushCapTexCoord;

  // %30..%33 = insertvalue into return struct.
  return {
    position: [outX, outY, outZ, outW],
    color: [
      Math.fround(color[0]),
      Math.fround(color[1]),
      Math.fround(color[2]),
      Math.fround(color[3]),
    ],
    brushTexCoord: [Math.fround(brushTC[0]), Math.fround(brushTC[1])],
    brushCapTexCoord: [Math.fround(brushCapTC[0]), Math.fround(brushCapTC[1])],
  };
}
