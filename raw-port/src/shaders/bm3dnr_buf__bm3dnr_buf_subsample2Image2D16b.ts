// bm3dnr_buf__bm3dnr_buf_subsample2Image2D16b.ts — direct TS mapping of the
// @shader bm3dnr_buf::bm3dnr_buf_subsample2Image2D16b (HeliumSenso)
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_subsample2Image2D16b.ll
// (header line: `0x0000000006dc6d -- bm3dnr_buf::bm3dnr_buf_subsample2Image2D16b`)
//
// 2× downsample kernel for ushort4 tiles (16-bit path). Each thread `(gx, gy)` outputs one
// ushort4 tile whose 4 lanes are the "even" lanes (0, 2) of TWO adjacent source tiles at
// input row `2*gy` (clamped) and input columns `2*gx` and `2*gx + 1` (both clamped). Since
// each tile packs 4 horizontal samples, taking lanes 0 & 2 of two consecutive tiles yields
// 4 samples that are ALL at even source-column positions — i.e. the horizontal 2× downsample
// picks every other sample. The vertical 2× downsample is implicit in the row-index
// doubling: source-row = 2*output-row. NO filtering / averaging — this is a raw stride-2 pick.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_subsample2Image2D16b(
//     %params*    %0,     // 5-field params struct (see !18)
//     <2 x i32>   %1,     // thread_position_in_grid  (gx, gy) — output coordinates
//     <4 x i16>*  %2,     // input   (read)
//     <4 x i16>*  %3      // output  (write)
//   )
//
// Params struct layout (!18):
//   int  m_inputStride   @0    → %16   (input row stride in ushort4 tiles)
//   int  m_outputStride  @4    → %18   (output row stride in ushort4 tiles)
//   int  m_inputHeight   @8    → %20   (used only to clamp the source row 2*gy)
//   uint m_globalWidth   @12   → %7    (bound check on output gx)
//   uint m_globalHeight  @16   → %12   (bound check on output gy)
//
// Algorithm decoded (%14..%45):
//   1. If gx >= globalWidth OR gy >= globalHeight, return.                    // %8 / %13
//   2. Compute the doubled and clamped source coordinates:
//        srcX0    = 2*gx                                                       // %21
//        srcRow0  = 2*gy                                                       // %22
//        srcRow   = srcRow0 < inputHeight ? srcRow0 : inputHeight - 1          // %25 select
//        srcCol0  = srcX0   < inputStride  ? srcX0  : inputStride  - 1         // %28 select
//        srcCol1  = (srcCol0 + 1) < inputStride ? srcCol0 + 1 : inputStride-1  // %31 select
//        (Note: the RIGHT column clamp uses `%29 = %28 + 1`, i.e. it clamps
//         to inputStride-1 if the +1 would go OOB — this mirrors "right-edge
//         replication" for the far-right output pixel.)
//   3. Compute the input row base + fetch both source tiles:
//        rowBase  = srcRow * inputStride                                       // %32
//        tile0    = input[rowBase + srcCol0]                                   // %35/%36
//        tile1    = input[rowBase + srcCol1]                                   // %39/%40
//   4. Shuffle even-lane pick from both tiles:
//        out      = <tile0[0], tile0[2], tile1[0], tile1[2]>                   // %41 shufflevector
//                    (mask <0, 2, 4, 6> — lanes 0/2 of tile0, lanes 0/2 of tile1)
//   5. Store to output[outputStride * gy + gx]:                                // %42-%45
//        output[outputStride * gy + gx] = out
//   6. Return (%46).
//
// This is the 16-bit sibling of the 8-bit subsample2Image2D kernel (which follows the same
// AIR shape, differs only in tile type `<4 x i8>` and the shufflevector mask <0,2,4,6> being
// applied to 8-bit lanes). Both kernels rely on the caller to ensure `2*gy < inputHeight *
// 2` and `2*gx < inputStride * 2` — the clamps handle single-lane OOB (the far edge) but not
// unbounded excess (that would produce a tile that repeats the last valid pixel).

/** Ushort4 tile — matches `<4 x i16>` lane order (unsigned 16-bit lanes as JS numbers). */
export type UShort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_subsample2Image2D16b_params` (!18). */
export interface Subsample2Image2D16bParams {
  /** int  m_inputStride  — input row stride in ushort4 tiles. */
  readonly inputStride: number;
  /** int  m_outputStride — output row stride in ushort4 tiles. */
  readonly outputStride: number;
  /** int  m_inputHeight  — source rows count; source row is clamped to [0, inputHeight-1]. */
  readonly inputHeight: number;
  /** uint m_globalWidth  — grid width in output columns. */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid height in output rows. */
  readonly globalHeight: number;
}

/**
 * bm3dnr_buf::bm3dnr_buf_subsample2Image2D16b — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value in the .ll is cited by the
 * `// %N` tag on its producing statement below.
 */
export function bm3dnr_buf__bm3dnr_buf_subsample2Image2D16b(
  params: Subsample2Image2D16bParams,          // %0
  gridPos: readonly [number, number],          // %1 (gx, gy)
  input: readonly UShort4[],                    // %2 <4 x u16>* (read)
  output: UShort4[],                            // %3 <4 x u16>* (write)
): void {
  const gx = gridPos[0] | 0;                    // %5
  const gy = gridPos[1] | 0;                    // %10

  // %6-%8   bound check on gx.
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %8  → shared %46 exit
  // %11-%13 bound check on gy.
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %13 → shared %46 exit

  const inputStride  = params.inputStride  | 0;  // %16
  const outputStride = params.outputStride | 0;  // %18
  const inputHeight  = params.inputHeight  | 0;  // %20

  // %21  srcX0   = gx << 1  (2*gx)
  const srcX0   = (gx << 1) | 0;
  // %22  srcRow0 = gy << 1  (2*gy)
  const srcRow0 = (gy << 1) | 0;

  // %23-%25  srcRow  = srcRow0 < inputHeight ? srcRow0 : (inputHeight - 1)
  //          (%24 = inputHeight - 1)
  const srcRow  = srcRow0 < inputHeight ? srcRow0 : ((inputHeight - 1) | 0);

  // %26-%28  srcCol0 = srcX0 < inputStride ? srcX0 : (inputStride - 1)
  //          (%27 = inputStride - 1)
  const stride1 = (inputStride - 1) | 0;
  const srcCol0 = srcX0 < inputStride ? srcX0 : stride1;

  // %29-%31  srcCol1 = (srcCol0 + 1) < inputStride ? (srcCol0 + 1) : (inputStride - 1)
  const srcCol0p1 = (srcCol0 + 1) | 0;   // %29 add nsw i32 %28, 1
  const srcCol1   = srcCol0p1 < inputStride ? srcCol0p1 : stride1;   // %31 select

  // %32  rowBase = srcRow * inputStride
  const rowBase = Math.imul(srcRow, inputStride) | 0;

  // %33/%35/%36  tile0 = input[rowBase + srcCol0]  (as <4 x i16>)
  const tile0 = input[(rowBase + srcCol0) | 0];
  // %37/%39/%40  tile1 = input[rowBase + srcCol1]  (as <4 x i16>)
  const tile1 = input[(rowBase + srcCol1) | 0];

  // %41  shufflevector <0, 2, 4, 6> — lanes 0 & 2 of tile0, then lanes 0 & 2 of tile1.
  //   NB: mask lanes 4/5/6/7 index into the SECOND operand (tile1) with offset 4, so:
  //       mask 4 = tile1[0], mask 6 = tile1[2].
  const outTile: UShort4 = [tile0[0], tile0[2], tile1[0], tile1[2]] as const;

  // %42-%45  output[outputStride * gy + gx] = outTile
  const outIdx = ((Math.imul(outputStride, gy)) + gx) | 0;
  output[outIdx] = outTile;
}
