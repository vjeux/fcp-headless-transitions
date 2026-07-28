// @shader bm3dnr_buf::bm3dnr_buf_mergeAlfa (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_mergeAlfa.ll
//   (see .ll header @0x5b92d)
//
// SIGNATURE (from !14 / !17..!21 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_mergeAlfa"(
//     %params*   addrspace(2) %0,   // constant buffer
//     <2 x i32>               %1,   // grid_in
//     <4 x i16>* addrspace(1) %2,   // input   (device RO, ushort4)
//     <4 x i16>* addrspace(1) %3    // output  (device RW, ushort4)
//   )
// PARAMS struct (from !18):
//   { u32 m_strideIn,     // +0
//     u32 m_strideOut,    // +4
//     u32 m_globalWidth,  // +8
//     u32 m_globalHeight  // +12 }
//
// FAST-MATH: kernel is INTEGER-only — no fp ops.
//
// SHAPE:
//   For each (x = grid_in.x, y = grid_in.y) inside the [m_globalWidth,
//   m_globalHeight] grid, this kernel reads one ushort4 from `input` at
//   (y*m_strideIn + x), reads the corresponding ushort4 from `output`
//   at (y*m_strideOut + x), then writes back to that `output` position
//   a merged ushort4 where lane 0 comes from `input`'s lane 0 and
//   lanes 1..3 are preserved from the existing `output` (the "merge
//   alfa" operation — replace only the first channel, aka alpha in
//   this pipeline's channel ordering).

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12 into the 16-byte struct.
 */
export interface Bm3dnrBufMergeAlfaParams {
  m_strideIn: number;    // +0
  m_strideOut: number;   // +4
  m_globalWidth: number; // +8
  m_globalHeight: number;// +12
}

export type UShort4 = readonly [number, number, number, number];

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params  constant buffer (%0)
 * @param gridX   grid_in.x  (extractelement %1, 0)   — %5
 * @param gridY   grid_in.y  (extractelement %1, 1)   — %10
 * @param input   read-only ushort4 buffer            — %2
 * @param output  read-write ushort4 buffer           — %3
 */
export function bm3dnr_buf_mergeAlfa(
  params: Bm3dnrBufMergeAlfaParams,
  gridX: number,
  gridY: number,
  input: readonly UShort4[],
  output: UShort4[],
): void {
  // %6..%8: if (grid_in.x >= m_globalWidth) return.
  //   %6 = gep params, i32 2       (m_globalWidth)
  //   %8 = icmp ult i32 %5, %7
  if (!(gridX >>> 0 < params.m_globalWidth >>> 0)) return;

  // %11..%13: if (grid_in.y >= m_globalHeight) return.
  //   %11 = gep params, i32 3      (m_globalHeight)
  //   %13 = icmp ult i32 %10, %12
  if (!(gridY >>> 0 < params.m_globalHeight >>> 0)) return;

  // %15..%18: load stride fields.
  //   %16 = m_strideIn, %18 = m_strideOut
  const strideIn = params.m_strideIn | 0;
  const strideOut = params.m_strideOut | 0;

  // %19, %20: zext grid_in.x / grid_in.y to i64.
  const x = gridX >>> 0;
  const y = gridY >>> 0;

  // %21 = zext m_strideIn to i64
  // %22 = %21 * %20                     -> m_strideIn * y
  // %23 = %22 + %19                     -> input read index
  // %24 = gep input, i64 %23
  // %25 = load <4 x i16>                (input pixel)
  const inIdx = (Math.imul(strideIn, y | 0) + x) | 0;
  const inPix = input[inIdx];                 // %25

  // %26 = zext m_strideOut to i64
  // %27 = %26 * %20                     -> m_strideOut * y
  // %28 = %27 + %19                     -> output read/write index
  // %29 = gep output, i64 %28
  // %30 = load <4 x i16>                (existing output pixel)
  const outIdx = (Math.imul(strideOut, y | 0) + x) | 0;
  const outPix = output[outIdx];              // %30

  // %31 = shufflevector <4 x i16> %25, %30, <0, 5, 6, 7>
  //   -> [ inPix[0], outPix[1], outPix[2], outPix[3] ]
  //   (indices 4..7 select lanes 0..3 of %30; the shuffle keeps %25's
  //   lane 0 and pulls lanes 1..3 from %30.)
  // store <4 x i16> %31 at output[%28]
  output[outIdx] = [inPix[0], outPix[1], outPix[2], outPix[3]];
}
