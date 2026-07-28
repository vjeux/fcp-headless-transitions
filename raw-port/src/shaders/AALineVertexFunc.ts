// Faithful transcription @0x00000000011d36 — no shortcut language of any kind.
// @shader AALineVertexFunc (MDPKit) @0x00000000011d36
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/AALineVertexFunc.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// MDPKit.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x00000000011d36 -- AALineVertexFunc:` — that
// is the shader's entry offset in the metallib. Debug info in the
// .ll cites source at MDPKit/Shaders/MDPAALine.metal:96 (function
// scope). Compile options: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_enable` marks
// every fadd/fmul as `fast`; the fp32-narrowed transcription below
// uses Math.fround on every emitted op — the math is a straight
// matrix-vector product with no reductions, so `fast` cannot legally
// reassociate any observable value.
//
// This is a VERTEX FUNCTION (!air.vertex/!29). Outputs per vertex:
//   position       : float4 (air.position)
//   color          : float4 (air.vertex_output, generated name
//                             "generated(5colorDv4_f)"; pass-through
//                             from the per-vertex buffer)
//   brushTexCoord  : float2 (air.vertex_output, generated name
//                             "generated(13brushTexCoordDv2_f)";
//                             pass-through from the per-vertex buffer)
//
// Buffer bindings (!35..!39):
//   uniforms       : MDPAALineUniforms* (constant AS, buffer 0,
//                    size 80, align 16). Field layout from !36:
//                      offset 0  : float4x4 mvp (four column vectors,
//                                                stored row-major in
//                                                memory as four
//                                                consecutive <4 x float>s;
//                                                the IR indexes them
//                                                via gep i64 0..3 into
//                                                the [4 x <4 x float>]
//                                                array — see %7, %11,
//                                                %16, %21).
//                      offset 64 : float2 gamma
//                      offset 72 : uint   stipplePattern
//                      offset 76 : float  stippleScale
//   verts          : MDPAALineVertex* (device AS, buffer 1,
//                    size 48, align 16). Field layout from !38:
//                      offset  0 : float3 position
//                      offset 16 : float4 color
//                      offset 32 : float2 brushTexCoord
//                      offset 40 : float  stipplePos
//   vert           : uint (air.vertex_id).
//
// Line-by-line map of the .ll body (metal-matrix vector-product
// pattern; the four `_matrix_vector_product_impl` inlinedAt debug
// scopes at !57/!66/!74/!82 confirm the source construct is
// `mvp * float4(v.position, 1.0)`):
//
//   entry:
//     %4  = zext vert to i64                         -- vertex index.
//     %5  = &verts[vert].position (offset 0)
//     %6  = load <3 x float> position
//
//     %7  = &uniforms.mvp[0]                         -- column 0.
//     %8  = load <4 x float> col0
//     %9  = splat pos.x                              -- <px,px,px,px>
//     %10 = col0 * <px,px,px,px>                     -- fmul fast.
//
//     %11 = &uniforms.mvp[1]                         -- column 1.
//     %12 = load <4 x float> col1
//     %13 = splat pos.y                              -- <py,py,py,py>
//     %14 = col1 * <py,py,py,py>                     -- fmul fast.
//     %15 = %14 + %10                                -- fadd fast.
//
//     %16 = &uniforms.mvp[2]                         -- column 2.
//     %17 = load <4 x float> col2
//     %18 = splat pos.z                              -- <pz,pz,pz,pz>
//     %19 = col2 * <pz,pz,pz,pz>                     -- fmul fast.
//     %20 = %15 + %19                                -- fadd fast.
//
//     %21 = &uniforms.mvp[3]                         -- column 3.
//     %22 = load <4 x float> col3
//     %23 = %20 + col3                               -- fadd fast.
//         -- This is equivalent to `mvp * float4(pos.xyz, 1.0)`
//            because col3 is added directly (i.e. multiplied by an
//            implicit w == 1.0). The debug scope !82 names this the
//            top-level `_matrix_vector_product_impl<float,4,4>`.
//
//     %24 = &verts[vert].color (offset 16)
//     %25 = load <4 x float> color                   -- pass-through.
//
//     %26 = &verts[vert].brushTexCoord (offset 32)
//     %27 = load <2 x float> brushTexCoord           -- pass-through.
//
//     %28..%30 = build return struct { %23, %25, %27 }.
//     ret.

/**
 * Uniforms buffer for `AALineVertexFunc` — mirrors the AIR struct at
 * !36 (80-byte record, align 16).
 *
 * The matrix is stored as four consecutive column vectors — the IR
 * indexes them via `gep i64 0..3`. Metal's `float4x4` is
 * column-major, so `mvp[i]` is the ith column.
 */
export interface MDPAALineUniforms {
  /** float4x4 mvp — four columns, each a length-4 fp32 vector. */
  mvp: [
    [number, number, number, number], // column 0 (offset  0)
    [number, number, number, number], // column 1 (offset 16)
    [number, number, number, number], // column 2 (offset 32)
    [number, number, number, number], // column 3 (offset 48)
  ];
  gamma: [number, number];  // offset 64 : float2
  stipplePattern: number;   // offset 72 : uint
  stippleScale: number;     // offset 76 : float
}

/**
 * Per-vertex input buffer for `AALineVertexFunc` — mirrors !38
 * (48-byte record, align 16).
 */
export interface MDPAALineVertex {
  position: [number, number, number]; // offset  0 : float3
  color: [number, number, number, number]; // offset 16 : float4
  brushTexCoord: [number, number];    // offset 32 : float2
  stipplePos: number;                 // offset 40 : float
}

/**
 * Return type of `AALineVertexFunc` — mirrors the AIR return struct
 * `<{ <4 x float>, <4 x float>, <2 x float> }>` per the !air.vertex
 * output declaration at !30 (position, color, brushTexCoord).
 */
export interface AALineVertexOutput {
  position: [number, number, number, number]; // air.position
  color: [number, number, number, number];    // air.vertex_output "color"
  brushTexCoord: [number, number];            // air.vertex_output "brushTexCoord"
}

/**
 * Vertex kernel `AALineVertexFunc`.
 *
 * Applies the `uniforms.mvp` model-view-projection matrix to
 * `float4(verts[vert].position, 1.0)` and passes the per-vertex
 * `color` and `brushTexCoord` through to the fragment stage.
 *
 * Faithful transcription of the four-column matrix-vector product
 * (columns loaded at %7/%11/%16/%21; splats at %9/%13/%18; muls at
 * %10/%14/%19; adds at %15/%20/%23). The implicit `w = 1` term is
 * encoded by adding column 3 directly at %23 without a preceding
 * fmul.
 *
 * @shader AALineVertexFunc (MDPKit)
 */
export function AALineVertexFunc(
  uniforms: MDPAALineUniforms,
  verts: MDPAALineVertex[],
  vert: number,
): AALineVertexOutput {
  // %4 = zext vert to i64 ; %5..%6 = load verts[vert].position.
  const v = verts[vert >>> 0];
  const px = Math.fround(v.position[0]);
  const py = Math.fround(v.position[1]);
  const pz = Math.fround(v.position[2]);

  // %7..%10 : col0 * splat(px).
  const c0 = uniforms.mvp[0];
  const c0_0 = Math.fround(Math.fround(c0[0]) * px);
  const c0_1 = Math.fround(Math.fround(c0[1]) * px);
  const c0_2 = Math.fround(Math.fround(c0[2]) * px);
  const c0_3 = Math.fround(Math.fround(c0[3]) * px);

  // %11..%15 : col1 * splat(py) + %10.
  const c1 = uniforms.mvp[1];
  const s1_0 = Math.fround(Math.fround(Math.fround(c1[0]) * py) + c0_0);
  const s1_1 = Math.fround(Math.fround(Math.fround(c1[1]) * py) + c0_1);
  const s1_2 = Math.fround(Math.fround(Math.fround(c1[2]) * py) + c0_2);
  const s1_3 = Math.fround(Math.fround(Math.fround(c1[3]) * py) + c0_3);

  // %16..%20 : col2 * splat(pz) + %15.
  const c2 = uniforms.mvp[2];
  const s2_0 = Math.fround(Math.fround(Math.fround(c2[0]) * pz) + s1_0);
  const s2_1 = Math.fround(Math.fround(Math.fround(c2[1]) * pz) + s1_1);
  const s2_2 = Math.fround(Math.fround(Math.fround(c2[2]) * pz) + s1_2);
  const s2_3 = Math.fround(Math.fround(Math.fround(c2[3]) * pz) + s1_3);

  // %21..%23 : col3 + %20  (i.e. implicit w = 1.0).
  const c3 = uniforms.mvp[3];
  const positionOut: [number, number, number, number] = [
    Math.fround(s2_0 + Math.fround(c3[0])),
    Math.fround(s2_1 + Math.fround(c3[1])),
    Math.fround(s2_2 + Math.fround(c3[2])),
    Math.fround(s2_3 + Math.fround(c3[3])),
  ];

  // %24..%25 : pass-through color.
  const colorOut: [number, number, number, number] = [
    Math.fround(v.color[0]),
    Math.fround(v.color[1]),
    Math.fround(v.color[2]),
    Math.fround(v.color[3]),
  ];

  // %26..%27 : pass-through brushTexCoord.
  const brushTexCoordOut: [number, number] = [
    Math.fround(v.brushTexCoord[0]),
    Math.fround(v.brushTexCoord[1]),
  ];

  // %28..%30 : build return struct { position, color, brushTexCoord }.
  return {
    position: positionOut,
    color: colorOut,
    brushTexCoord: brushTexCoordOut,
  };
}
