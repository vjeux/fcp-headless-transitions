// @shader bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVField (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUVField.ll
//   (see .ll header @0x47c5d)
//
// SIGNATURE (from !14 / !17..!23 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVField"(
//     %params*   addrspace(2) %0,   // constant buffer
//     <2 x i32>               %1,   // grid_in
//     <4 x i8>*  addrspace(1) %2,   // input   (device RO, uchar4 — packed UYVY)
//     <4 x i8>*  addrspace(1) %3,   // outputY (device RW, uchar4 — Y plane)
//     <4 x i8>*  addrspace(1) %4,   // outputU (device RW, uchar4 — U plane)
//     <4 x i8>*  addrspace(1) %5    // outputV (device RW, uchar4 — V plane)
//   )
// PARAMS struct (from !18) — DIFFERENT from the non-Field variant: this
// one has SEPARATE U and V stride fields and a SIGNED `m_off`:
//   { u32 m_strideIn,     // +0
//     u32 m_strideY,      // +4
//     u32 m_strideU,      // +8
//     u32 m_strideV,      // +12
//     i32 m_off,          // +16   (SIGNED — sext to i64 for row math)
//     u32 m_globalWidth,  // +20
//     u32 m_globalHeight  // +24 }
//
// FAST-MATH: kernel is INTEGER-only; !12 fast-math-disable / !11 denorms-disable
// don't affect anything here.
//
// SHAPE:
//   Identical macropixel de-interleave to the sibling
//   bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV, but with two changes
//   relative to that kernel:
//     (1) The row selection is `rowIdx = y*2 + m_off` (a signed offset
//         into interlaced-field-pair rows), instead of `y*m_mul + m_off`.
//     (2) The U and V output buffers use their own row strides
//         (m_strideU vs m_strideV) instead of a shared m_strideUV.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16/+20/+24 into the 28-byte struct.
 */
export interface Bm3dnrBufInterleaveToPlanarYUVFieldParams {
  m_strideIn: number;    // +0  (unsigned)
  m_strideY: number;     // +4  (unsigned)
  m_strideU: number;     // +8  (unsigned)
  m_strideV: number;     // +12 (unsigned)
  m_off: number;         // +16 (SIGNED — field-pair row offset)
  m_globalWidth: number; // +20 (unsigned)
  m_globalHeight: number;// +24 (unsigned)
}

export type UChar4 = readonly [number, number, number, number];

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params   constant buffer (%0)
 * @param gridX    grid_in.x  (extractelement %1, 0)   — %7
 * @param gridY    grid_in.y  (extractelement %1, 1)   — %12
 * @param input    read-only UYVY uchar4 buffer        — %2
 * @param outputY  write uchar4 Y plane                — %3
 * @param outputU  write uchar4 U plane                — %4
 * @param outputV  write uchar4 V plane                — %5
 */
export function bm3dnr_buf_interleaveToPlanarYUVField(
  params: Bm3dnrBufInterleaveToPlanarYUVFieldParams,
  gridX: number,
  gridY: number,
  input: readonly UChar4[],
  outputY: UChar4[],
  outputU: UChar4[],
  outputV: UChar4[],
): void {
  // %8..%10: if (grid_in.x >= m_globalWidth) return.
  //   %8  = gep params, i32 5       (m_globalWidth)
  //   %10 = icmp ult i32 %7, %9
  if (!(gridX >>> 0 < params.m_globalWidth >>> 0)) return;

  // %13..%15: if (grid_in.y >= m_globalHeight) return.
  //   %13 = gep params, i32 6       (m_globalHeight)
  //   %15 = icmp ult i32 %12, %14
  if (!(gridY >>> 0 < params.m_globalHeight >>> 0)) return;

  // %17..%26: load the five stride/offset fields.
  //   %18 = m_strideIn, %20 = m_strideY, %22 = m_strideU,
  //   %24 = m_strideV,  %26 = m_off  (signed)
  const strideIn = params.m_strideIn | 0;
  const strideY = params.m_strideY | 0;
  const strideU = params.m_strideU | 0;
  const strideV = params.m_strideV | 0;
  const off = params.m_off | 0;

  // %27, %28: zext grid_in.x / grid_in.y to i64.
  const x = gridX >>> 0;
  const y = gridY >>> 0;

  // %29 = x shl 2       ->  x*4
  // %30 = %29 or 1
  // %31 = %29 or 2
  // %32 = %29 or 3
  const x4 = (x * 4) | 0;

  // %33 = y shl 1                       -> y * 2
  // %34 = sext m_off  to i64
  // %35 = %33 + %34                     -> rowIdx = y*2 + m_off  (signed)
  // %36 = zext m_strideIn to i64
  // %37 = %35 * %36                     -> rowIdx * m_strideIn   (rowBase)
  // %38 = %37 + %29                     -> input read index #0
  const rowIdx = ((y * 2) + off) | 0;
  const rowBase = Math.imul(rowIdx, strideIn) | 0;
  const idx0 = (rowBase + x4) | 0;

  // %39..%49: load 4 consecutive uchar4s.
  //   %40 = input[idx0    ]       (macropixel 0)
  //   %43 = input[idx0 + 1]       (macropixel 1)
  //   %46 = input[idx0 + 2]       (macropixel 2)
  //   %49 = input[idx0 + 3]       (macropixel 3)
  const p0 = input[idx0];              // %40
  const p1 = input[(idx0 + 1) | 0];    // %43
  const p2 = input[(idx0 + 2) | 0];    // %46
  const p3 = input[(idx0 + 3) | 0];    // %49

  // Shufflevector-derived subvectors (%50..%57):
  //   %50..%52: build [p0[0], p1[0], p2[0], p3[0]]  — U samples.
  //   %53..%55: build [p0[2], p1[2], p2[2], p3[2]]  — V samples.
  //   %56 = shuffle(%40,%43, <1,3,5,7>) = [p0[1], p0[3], p1[1], p1[3]]
  //   %57 = shuffle(%46,%49, <1,3,5,7>) = [p2[1], p2[3], p3[1], p3[3]]
  //     — Y samples.
  const outU: UChar4  = [p0[0], p1[0], p2[0], p3[0]];   // %52
  const outV: UChar4  = [p0[2], p1[2], p2[2], p3[2]];   // %55
  const outY0: UChar4 = [p0[1], p0[3], p1[1], p1[3]];   // %56
  const outY1: UChar4 = [p2[1], p2[3], p3[1], p3[3]];   // %57

  // Output addressing:
  //   %58 = x shl 1              -> x*2
  //   %59 = %58 or 1             -> x*2 + 1
  //   %60 = zext m_strideY
  //   %61 = m_strideY * y
  //   %62 = %61 + %58            -> outputY[y*strideY + x*2]
  //   store %56 (outY0)
  //   %64 = %59 + %61
  //   store %57 (outY1)
  const yRowBase = Math.imul(strideY, y | 0) | 0;
  outputY[(yRowBase + x * 2) | 0]     = outY0;
  outputY[(yRowBase + x * 2 + 1) | 0] = outY1;

  //   %66 = zext m_strideU
  //   %67 = m_strideU * y
  //   %68 = %67 + x
  //   store %52 -> outputU[y*strideU + x]
  const uIdx = (Math.imul(strideU, y | 0) + x) | 0;
  outputU[uIdx] = outU;

  //   %70 = zext m_strideV
  //   %71 = m_strideV * y
  //   %72 = %71 + x
  //   store %55 -> outputV[y*strideV + x]     (NOTE: m_strideV, not shared UV)
  const vIdx = (Math.imul(strideV, y | 0) + x) | 0;
  outputV[vIdx] = outV;
}
