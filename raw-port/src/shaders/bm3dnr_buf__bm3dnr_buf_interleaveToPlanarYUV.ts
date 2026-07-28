// @shader bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUV.ll
//   (see .ll header @0x46a7d)
//
// SIGNATURE (from !14 / !17..!23 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV"(
//     %params*   addrspace(2) %0,   // constant buffer
//     <2 x i32>               %1,   // grid_in
//     <4 x i8>*  addrspace(1) %2,   // input   (device RO, uchar4 — packed UYVY)
//     <4 x i8>*  addrspace(1) %3,   // outputY (device RW, uchar4 — Y plane)
//     <4 x i8>*  addrspace(1) %4,   // outputU (device RW, uchar4 — U plane)
//     <4 x i8>*  addrspace(1) %5    // outputV (device RW, uchar4 — V plane)
//   )
// PARAMS struct (from !18):
//   { u32 m_strideIn,     // +0    (row stride of packed input,   uchar4 units)
//     u32 m_strideY,      // +4    (row stride of outputY,        uchar4 units)
//     u32 m_strideUV,     // +8    (row stride of outputU & V,    uchar4 units)
//     u32 m_mul,          // +12   (row-selection multiplier)
//     u32 m_off,          // +16   (row-selection offset)
//     u32 m_globalWidth,  // +20   (grid domain width  — bound)
//     u32 m_globalHeight  // +24   (grid domain height — bound) }
//
// FAST-MATH: kernel is INTEGER-only; !12 fast-math-disable / !11 denorms-disable
// don't affect anything here.
//
// SHAPE:
//   For each (x = grid_in.x, y = grid_in.y) inside the domain, the kernel
//   loads 4 consecutive uchar4 pixels from `input`. Interpreting each
//   uchar4 as a UYVY 4:2:2 packed macropixel = (U, Y0, V, Y1), the 4
//   uchar4 pixels hold 8 luma samples plus 4 U and 4 V samples. The
//   kernel writes:
//     outputY[y*m_strideY*2 + x*2 + 0] = [Y0,Y1,Y0,Y1] from pixels 0,1
//     outputY[y*m_strideY*2 + x*2 + 1] = [Y0,Y1,Y0,Y1] from pixels 2,3
//     outputU[y*m_strideUV  + x    ] = [U from pixels 0..3]
//     outputV[y*m_strideUV  + x    ] = [V from pixels 0..3]

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16/+20/+24 into the 28-byte struct.
 */
export interface Bm3dnrBufInterleaveToPlanarYUVParams {
  m_strideIn: number;    // +0
  m_strideY: number;     // +4
  m_strideUV: number;    // +8
  m_mul: number;         // +12
  m_off: number;         // +16
  m_globalWidth: number; // +20
  m_globalHeight: number;// +24
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
export function bm3dnr_buf_interleaveToPlanarYUV(
  params: Bm3dnrBufInterleaveToPlanarYUVParams,
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

  // %17..%26: load the five stride/mul/off fields.
  //   %18 = m_strideIn, %20 = m_strideY, %22 = m_strideUV,
  //   %24 = m_mul,     %26 = m_off
  const strideIn = params.m_strideIn | 0;
  const strideY = params.m_strideY | 0;
  const strideUV = params.m_strideUV | 0;
  const mul = params.m_mul | 0;
  const off = params.m_off | 0;

  // %27, %28: zext grid_in.x / grid_in.y to i64.
  const x = gridX >>> 0;
  const y = gridY >>> 0;

  // %29 = x shl 2       ->  x*4
  // %30 = %29 or 1      ->  x*4 + 1
  // %31 = %29 or 2      ->  x*4 + 2
  // %32 = %29 or 3      ->  x*4 + 3
  const x4  = (x * 4) | 0;

  // %33 = %24 * %12                     -> m_mul * y
  // %34 = %33 + %26                     -> m_mul*y + m_off        (rowIdx)
  // %35 = %34 * %18                     -> rowIdx * m_strideIn    (rowByteBase in uchar4 units)
  // %36 = zext %35 to i64
  // %37 = %29 + %36                     -> input read index #0
  const rowIdx = (Math.imul(mul, y | 0) + off) | 0;
  const rowBase = Math.imul(rowIdx, strideIn) | 0;
  const idx0 = (rowBase + x4) | 0;

  // %38..%48: load 4 consecutive uchar4s.
  //   %39 = input[idx0    ]       (macropixel 0)
  //   %42 = input[idx0 + 1]       (macropixel 1)
  //   %45 = input[idx0 + 2]       (macropixel 2)
  //   %48 = input[idx0 + 3]       (macropixel 3)
  const p0 = input[idx0];              // %39
  const p1 = input[(idx0 + 1) | 0];    // %42
  const p2 = input[(idx0 + 2) | 0];    // %45
  const p3 = input[(idx0 + 3) | 0];    // %48

  // Shufflevector-derived subvectors (%49..%56):
  //   %49 = shuffle(%39,%42, <0, 4, u, u>) = [p0[0], p1[0], u, u]
  //   %50 = shuffle(%49,%45, <0, 1, 4, u>) = [p0[0], p1[0], p2[0], u]
  //   %51 = shuffle(%50,%48, <0, 1, 2, 4>) = [p0[0], p1[0], p2[0], p3[0]]
  //     — lane 0 of each macropixel (the U samples for UYVY).
  const outU: UChar4 = [p0[0], p1[0], p2[0], p3[0]]; // %51

  //   %52 = shuffle(%39,%42, <2, 6, u, u>) = [p0[2], p1[2], u, u]
  //   %53 = shuffle(%52,%45, <0, 1, 6, u>) = [p0[2], p1[2], p2[2], u]
  //     — note the third shuffle index is 6, which selects lane 2 of the
  //       second operand (%45 lanes are 4..7 so 6 = %45[2]).
  //   %54 = shuffle(%53,%48, <0, 1, 2, 6>) = [p0[2], p1[2], p2[2], p3[2]]
  //     — lane 2 of each macropixel (the V samples for UYVY).
  const outV: UChar4 = [p0[2], p1[2], p2[2], p3[2]]; // %54

  //   %55 = shuffle(%39,%42, <1, 3, 5, 7>) = [p0[1], p0[3], p1[1], p1[3]]
  //     — Y samples from macropixels 0 and 1 (two Y's each).
  //   %56 = shuffle(%45,%48, <1, 3, 5, 7>) = [p2[1], p2[3], p3[1], p3[3]]
  //     — Y samples from macropixels 2 and 3.
  const outY0: UChar4 = [p0[1], p0[3], p1[1], p1[3]]; // %55
  const outY1: UChar4 = [p2[1], p2[3], p3[1], p3[3]]; // %56

  // Output addressing:
  //   %57 = x shl 1              -> x*2
  //   %58 = %57 or 1             -> x*2 + 1
  //   %59 = zext m_strideY to i64
  //   %60 = m_strideY * y
  //   %61 = %60 + %57            -> Y row-base + x*2
  //   store %55 -> outputY[%61]
  //   %63 = %58 + %60            -> Y row-base + x*2 + 1
  //   store %56 -> outputY[%63]
  const yRowBase = Math.imul(strideY, y | 0) | 0;
  outputY[(yRowBase + x * 2) | 0]     = outY0;   // %62 store %55
  outputY[(yRowBase + x * 2 + 1) | 0] = outY1;   // %64 store %56

  //   %65 = zext m_strideUV to i64
  //   %66 = m_strideUV * y
  //   %67 = %66 + x
  //   store %51 -> outputU[%67]
  //   store %54 -> outputV[%67]
  const uvIdx = (Math.imul(strideUV, y | 0) + x) | 0;
  outputU[uvIdx] = outU;                          // %68 store %51
  outputV[uvIdx] = outV;                          // %69 store %54
}
