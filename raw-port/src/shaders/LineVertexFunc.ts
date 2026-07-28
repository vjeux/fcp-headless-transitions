// Faithful transcription @0x0000000000abf6 — MDPKit.framework/Versions/A/Resources/default.metallib
// @shader LineVertexFunc (MDPKit)
//
// Aliased-line vertex shader from MDPKit's MDPLine.metal source
// (frame !39 DISubprogram line 44, source file MDPKit/Shaders/MDPLine.metal).
// Reads a per-vertex record (float3 position, float4 color, float stipplePos) from
// the vertex buffer indexed by vertex_id, transforms the position through the
// uniform MVP float4x4 with implicit w=1, and passes the vertex color through.
// Faithful port of the AIR IR: fadd/fmul fast → fp32-narrowed Math.fround.
//
// Source LLVM IR: raw-port/re/shaders/LineVertexFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh LineVertexFunc MDPKit`).
//
// AIR signature (from air.vertex !29 and !30..!38):
//   define <{ <4 x float>, <4 x float> }> @LineVertexFunc(
//     constant MDPAliasedLineUniforms* uniforms  [80 bytes, align 16]   ; !34
//     device   MDPAliasedLineVertex*   verts     [48 bytes/rec, align 16]; !36
//     uint     vert                                                     ; !38 air.vertex_id
//   ) -> struct { float4 position (air.position, "position"), float4 color (air.vertex_output "color") }
//
// MDPAliasedLineUniforms layout (from !35 — 72 bytes payload in 80-byte struct, 16-byte aligned):
//   +0   float4x4 mvp
//   +64  uint     stipplePattern            (unused in this vertex shader)
//   +68  float    stippleScale              (unused in this vertex shader)
//   +72  8 bytes  trailing padding
//
// MDPAliasedLineVertex layout (from !37 — 48 bytes/record, 16-byte aligned):
//   +0   float3   position                  (loaded as <3 x float>, 16-byte aligned)
//   +16  float4   color                     (passed through unchanged)
//   +32  float    stipplePos                (unused in this vertex shader)
//   +36  12 bytes trailing padding
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable (air.compile.fast_math_enable).
// We use Math.fround to preserve fp32 lane values.
//
// The compiler expands mvp * float4(position.xyz, 1.0) as:
//   col0*splat(x) + col1*splat(y) + col2*splat(z) + col3
// All four columns are loaded (unlike drawTileVertexFunc which folds z=0 and skips col2).

/**
 * Output struct mirroring the IR return type `<{ <4 x float>, <4 x float> }>`.
 *
 * slot 0: position (air.position, "position") — clip-space float4 = mvp * float4(pos.xyz, 1.0).
 * slot 1: color    (air.vertex_output "color", generated(5colorDv4_f)) — passthrough vertex color float4.
 */
export interface LineVertexFuncOutput {
  position: [number, number, number, number]; // slot 0 — air.position
  color: [number, number, number, number];    // slot 1 — air.vertex_output "color"
}

/**
 * Per-vertex record read from the `verts` device buffer (matches MDPAliasedLineVertex, !37).
 * The IR loads position as <3 x float> at record offset 0 (align 16) and color as <4 x float>
 * at record offset 16 (align 16). stipplePos at +32 is not consumed by this vertex shader.
 */
export interface MDPAliasedLineVertex {
  position: [number, number, number]; // +0  float3
  color: [number, number, number, number]; // +16 float4
  stipplePos: number; // +32 float — unused by LineVertexFunc
}

/**
 * @shader LineVertexFunc (MDPKit) — faithful port of the AIR IR.
 *
 * @param uniforms Uniform block. Only `mvp` (column-major float4x4, 16 float32s) is read
 *                 by this shader. Column K occupies mvp[K*4 .. K*4+3].
 * @param verts    Vertex buffer (array of MDPAliasedLineVertex records) — %1 device pointer.
 * @param vert     air.vertex_id (%2 uint) — indexes into `verts`.
 */
export function LineVertexFunc(
  uniforms: { mvp: Float32Array; stipplePattern?: number; stippleScale?: number },
  verts: readonly MDPAliasedLineVertex[],
  vert: number,
): LineVertexFuncOutput {
  // %4 = zext i32 %vert to i64 ; %5 = gep verts[vert].position
  // %6 = load <3 x float> %5 -> pos.xyz
  const rec = verts[vert >>> 0];
  const px = rec.position[0];
  const py = rec.position[1];
  const pz = rec.position[2];

  const mvp = uniforms.mvp;
  // %7  = &mvp.columns[0] ; %8  = load <4 x float> -> col0
  const c0x = mvp[0], c0y = mvp[1], c0z = mvp[2], c0w = mvp[3];
  // %11 = &mvp.columns[1] ; %12 = load <4 x float> -> col1
  const c1x = mvp[4], c1y = mvp[5], c1z = mvp[6], c1w = mvp[7];
  // %16 = &mvp.columns[2] ; %17 = load <4 x float> -> col2
  const c2x = mvp[8], c2y = mvp[9], c2z = mvp[10], c2w = mvp[11];
  // %21 = &mvp.columns[3] ; %22 = load <4 x float> -> col3
  const c3x = mvp[12], c3y = mvp[13], c3z = mvp[14], c3w = mvp[15];

  // %9  = shufflevector <3 x float> %6, undef, <0,0,0,0>  -> splat(x)
  // %10 = fmul fast <4 x float> %8, %9                    -> col0 * x
  const m0x = Math.fround(c0x * px);
  const m0y = Math.fround(c0y * px);
  const m0z = Math.fround(c0z * px);
  const m0w = Math.fround(c0w * px);

  // %13 = shufflevector <3 x float> %6, undef, <1,1,1,1>  -> splat(y)
  // %14 = fmul fast <4 x float> %12, %13                  -> col1 * y
  // %15 = fadd fast <4 x float> %14, %10                  -> col0*x + col1*y
  const m1x = Math.fround(c1x * py);
  const m1y = Math.fround(c1y * py);
  const m1z = Math.fround(c1z * py);
  const m1w = Math.fround(c1w * py);
  const s1x = Math.fround(m1x + m0x);
  const s1y = Math.fround(m1y + m0y);
  const s1z = Math.fround(m1z + m0z);
  const s1w = Math.fround(m1w + m0w);

  // %18 = shufflevector <3 x float> %6, undef, <2,2,2,2>  -> splat(z)
  // %19 = fmul fast <4 x float> %17, %18                  -> col2 * z
  // %20 = fadd fast <4 x float> %15, %19                  -> +col2*z
  const m2x = Math.fround(c2x * pz);
  const m2y = Math.fround(c2y * pz);
  const m2z = Math.fround(c2z * pz);
  const m2w = Math.fround(c2w * pz);
  const s2x = Math.fround(s1x + m2x);
  const s2y = Math.fround(s1y + m2y);
  const s2z = Math.fround(s1z + m2z);
  const s2w = Math.fround(s1w + m2w);

  // %23 = fadd fast <4 x float> %20, %22                  -> +col3 (the w=1 lane fold)
  const outX = Math.fround(s2x + c3x);
  const outY = Math.fround(s2y + c3y);
  const outZ = Math.fround(s2z + c3z);
  const outW = Math.fround(s2w + c3w);

  // %24 = gep verts[vert].color ; %25 = load <4 x float> -> color (passthrough)
  const col = rec.color;

  // %26 = insertvalue undef,  <4 x float> %23, 0   -> transformed position in slot 0
  // %27 = insertvalue %26,    <4 x float> %25, 1   -> vertex color in slot 1
  // ret <{ <4 x float>, <4 x float> }> %27
  return {
    position: [outX, outY, outZ, outW],
    color: [col[0], col[1], col[2], col[3]],
  };
}
