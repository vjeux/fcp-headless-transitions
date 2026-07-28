// drawTileVertexFunc.ts — vertex shader for the draw-tile path: MVP-transforms a 2D
// input position (z=0, w=1) by an mvp float4x4 and passes texCoord through unchanged.
// @shader drawTileVertexFunc (Lithium)
// Source IR: raw-port/re/shaders/drawTileVertexFunc.ll
// Compiled from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib @0x00000000003e39
//
// LLVM IR signature (from the .ll):
//   define <{ <4 x float>, <2 x float> }>
//     @drawTileVertexFunc(
//         <2 x float> %0 = per-vertex position at location 0 (!20, "position")
//       , <2 x float> %1 = per-vertex texCoord at location 1 (!21, "texCoord")
//       , struct.metal::matrix* %2 = "mvp" float4x4 uniform (!22, address_space 2, 64 bytes)
//     )
// Vertex outputs (!16):
//   slot 0 : air.position       float4 "position" — mvp * (x, y, 0, 1)
//   slot 1 : air.vertex_output  float2 "uv"       — passthrough texCoord (generated(2uvDv2_f))
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. We use plain JS fp32-narrowed math ops via
// Math.fround so the fp32 lane values survive.
//
// Note: the compiler folded the mvp * (x, y, 0, 1) multiply — because z = 0.0 and w = 1.0,
// column 2 is never loaded and column 3 is added without multiplication. Only columns 0, 1, 3
// are read from the uniform buffer (see %4/%8/%13 GEPs at indices 0/1/3 — 2 is skipped).

/**
 * Output struct mirroring the IR return type `<{ <4 x float>, <2 x float> }>`.
 *
 * slot 0: position (air.position, "position") — clip-space float4 = mvp * (x, y, 0, 1).
 * slot 1: uv       (air.vertex_output "uv", generated(2uvDv2_f)) — passthrough texCoord float2.
 */
export interface DrawTileVertexFuncOutput {
  position: [number, number, number, number]; // slot 0 — air.position
  uv: [number, number];                        // slot 1 — air.vertex_output "uv"
}

/**
 * @shader drawTileVertexFunc (Lithium) — faithful port of the AIR IR.
 *
 * @param position 2D input position (%0, air.vertex_input at location 0).
 * @param texCoord 2D input texture coordinate (%1, air.vertex_input at location 1).
 * @param mvp      Float4x4 model-view-projection matrix (%2, "mvp"). Column-major layout:
 *                 16 float32s = 4 columns of 4 floats, column K occupies mvp[K*4 .. K*4+3].
 */
export function drawTileVertexFunc(
  position: [number, number],
  texCoord: [number, number],
  mvp: Float32Array,
): DrawTileVertexFuncOutput {
  // %4  = &mvp.columns[0]           ; %5  = load <4 x float> %4   -> col0
  //   Only columns 0, 1, and 3 are loaded — column 2 is never touched because z = 0.0.
  const c0x = mvp[0], c0y = mvp[1], c0z = mvp[2], c0w = mvp[3];    // %5  = col 0
  const c1x = mvp[4], c1y = mvp[5], c1z = mvp[6], c1w = mvp[7];    // %9  = col 1
  const c3x = mvp[12], c3y = mvp[13], c3z = mvp[14], c3w = mvp[15]; // %14 = col 3

  const px = position[0];
  const py = position[1];

  // %6 = shufflevector <2 x float> %0, undef, <0,0,0,0>   -> splat(x)
  // %7 = fmul fast <4 x float> %5, %6                     -> col0 * x
  const m0x = Math.fround(c0x * px);
  const m0y = Math.fround(c0y * px);
  const m0z = Math.fround(c0z * px);
  const m0w = Math.fround(c0w * px);

  // %10 = shufflevector <2 x float> %0, undef, <1,1,1,1>  -> splat(y)
  // %11 = fmul fast <4 x float> %9, %10                   -> col1 * y
  const m1x = Math.fround(c1x * py);
  const m1y = Math.fround(c1y * py);
  const m1z = Math.fround(c1z * py);
  const m1w = Math.fround(c1w * py);

  // %12 = fadd fast <4 x float> %11, %7                   -> col0*x + col1*y
  const s0x = Math.fround(m1x + m0x);
  const s0y = Math.fround(m1y + m0y);
  const s0z = Math.fround(m1z + m0z);
  const s0w = Math.fround(m1w + m0w);

  // %15 = fadd fast <4 x float> %12, %14                  -> col0*x + col1*y + col3
  //   (col3 corresponds to the w=1 lane after the mvp * (x,y,0,1) fold; column 2 * 0 is dropped.)
  const outX = Math.fround(s0x + c3x);
  const outY = Math.fround(s0y + c3y);
  const outZ = Math.fround(s0z + c3z);
  const outW = Math.fround(s0w + c3w);

  // %16 = insertvalue undef, <4 x float> %15, 0           -> store transformed position in slot 0
  // %17 = insertvalue %16, <2 x float> %1, 1              -> passthrough texCoord in slot 1
  // ret <{ <4 x float>, <2 x float> }> %17
  return {
    position: [outX, outY, outZ, outW],
    uv: [texCoord[0], texCoord[1]],
  };
}
