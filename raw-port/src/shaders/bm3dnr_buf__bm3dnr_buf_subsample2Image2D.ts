// bm3dnr_buf__bm3dnr_buf_subsample2Image2D.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_subsample2Image2D` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_subsample2Image2D (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_subsample2Image2D.ll
// (header: `0x0000000006ec5d -- bm3dnr_buf::bm3dnr_buf_subsample2Image2D`)
//
// 2× nearest-neighbour subsampler for uchar4 (u8 grayscale packed 4 pixels
// per vec4). Each output vec4 samples the top-left of a 2×2 pixel block
// from the input: horizontally by taking every other lane (0 and 2) of two
// adjacent input vec4s, vertically by reading row 2*gy of the input.
//
// The source-index CLAMPS are all clamp-to-edge (min-with-`limit-1`) —
// there is no negative-x mirror, since the input coordinates are already
// non-negative (2*gx, 2*gy >= 0).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_subsample2Image2D(
//     %params*        %0,    // params struct (5 fields, see below)
//     <2 x i32>       %1,    // thread_position_in_grid   (gx, gy)
//     <4 x i8>*       %2,    // input   (read)
//     <4 x i8>*       %3     // output  (write)
//   )
//
// Params struct layout (from !18 in the .ll):
//   int  m_inputStride   @0   → %16    (input row stride in <4 x i8> units)
//   int  m_outputStride  @4   → %18    (output row stride in <4 x i8> units)
//   int  m_inputHeight   @8   → %20    (input image height, in rows;
//                                        the source-row clamp is inputHeight-1)
//   uint m_globalWidth   @12  → %7     (grid.x upper bound, exclusive)
//   uint m_globalHeight  @16  → %12    (grid.y upper bound, exclusive)
//
// NB: the source-column clamp uses `m_inputStride - 1`, NOT a separate
// width field. This is unusual but faithful to the IR (see %26/%28,
// %30/%31) — the shader treats the input row stride as the effective
// column count. That's consistent with the caller sizing the input
// allocation so that stride == width (no per-row padding).
//
// -----------------------------------------------------------------------------
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// This kernel is INTEGER-ONLY (no fp ops), so the flags do not apply — the
// transcription is bit-exact against the AIR IR by construction.

/** Uchar4 pixel — matches `<4 x i8>` lane order (u8-valued 0..255). */
export type Uchar4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_subsample2Image2D_params` (!18). */
export interface Subsample2Image2DParams {
  /** int  m_inputStride   — input row stride (in <4 x i8> vec4 units). Also
   *                         used as the column-clamp upper bound at %26/%30. */
  readonly inputStride: number;
  /** int  m_outputStride  — output row stride (in <4 x i8> vec4 units). */
  readonly outputStride: number;
  /** int  m_inputHeight   — input image height (in rows). Row clamp = inputHeight - 1. */
  readonly inputHeight: number;
  /** uint m_globalWidth   — grid.x upper bound, exclusive. */
  readonly globalWidth: number;
  /** uint m_globalHeight  — grid.y upper bound, exclusive. */
  readonly globalHeight: number;
}

/**
 * bm3dnr_buf::bm3dnr_buf_subsample2Image2D — direct TS mapping of the AIR body.
 * Every SSA value in the .ll is cited by the `// %N` tag on its producing statement.
 */
export function bm3dnr_buf__bm3dnr_buf_subsample2Image2D(
  params: Subsample2Image2DParams,        // %0
  gridPos: readonly [number, number],     // %1 (gx, gy)
  input: readonly Uchar4[],                // %2 <4 x i8>* (read)
  output: Uchar4[],                        // %3 <4 x i8>* (write)
): void {
  const gx = gridPos[0] | 0;              // %5
  const gy = gridPos[1] | 0;              // %10

  // Bounds checks — %8 / %13 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return; // %8  → %46 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return; // %13 → %46 ret

  const inputStride  = params.inputStride  | 0; // %16
  const outputStride = params.outputStride | 0; // %18
  const inputHeight  = params.inputHeight  | 0; // %20

  // %21  x2   = 2 * gx     (input-space x, base of the 2×2 sample block)
  // %22  y2   = 2 * gy     (input-space y)
  const x2 = (gx << 1) | 0;                     // shl nsw
  const y2 = (gy << 1) | 0;

  // %23  y_test    = (y2 < inputHeight)
  // %24  ymax      = inputHeight - 1
  // %25  ySrc      = y_test ? y2 : ymax     (clamp-to-edge on y)
  const ymax = (inputHeight - 1) | 0;
  const ySrc = y2 < inputHeight ? y2 : ymax;

  // %26  x0_test   = (x2 < inputStride)
  // %27  xmax      = inputStride - 1
  // %28  xSrc0     = x0_test ? x2 : xmax    (clamp-to-edge on x, first vec4)
  const xmax = (inputStride - 1) | 0;
  const xSrc0 = x2 < inputStride ? x2 : xmax;

  // %29  x1raw     = xSrc0 + 1
  // %30  x1_test   = (x1raw < inputStride)
  // %31  xSrc1     = x1_test ? x1raw : xmax (clamp-to-edge, second vec4)
  const x1raw = (xSrc0 + 1) | 0;
  const xSrc1 = x1raw < inputStride ? x1raw : xmax;

  // %32  rowBase   = ySrc * inputStride
  // %33  idx0      = rowBase + xSrc0
  const rowBase = (Math.imul(ySrc, inputStride)) | 0;
  const idx0 = (rowBase + xSrc0) | 0;
  // %35..%36  in0 = input[idx0]
  const in0 = input[idx0];

  // %37       idx1      = rowBase + xSrc1
  const idx1 = (rowBase + xSrc1) | 0;
  // %39..%40  in1 = input[idx1]
  const in1 = input[idx1];

  // %41  out = shufflevector(in0, in1, <0, 2, 4, 6>)
  //           = (in0[0], in0[2], in1[0], in1[2])
  // Takes lane 0 and 2 of each input vec4 (i.e. every-other pixel) →
  // 4 output pixels are the horizontal 2× subsample of 8 input pixels.
  const outVec: Uchar4 = [in0[0], in0[2], in1[0], in1[2]];

  // %42  outRowBase = outputStride * gy
  // %43  outIdx     = outRowBase + gx
  const outIdx = (Math.imul(outputStride, gy) + gx) | 0;
  // %45  store <4 x i8> outVec, output[outIdx]
  output[outIdx] = outVec;

  // br label %46 ; ret void
}
