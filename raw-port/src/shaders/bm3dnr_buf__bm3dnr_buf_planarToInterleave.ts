// @shader bm3dnr_buf::bm3dnr_buf_planarToInterleave (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_planarToInterleave.ll
//   (see .ll header @0x679ed)
//
// SIGNATURE (from !14 / !17..!23 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_planarToInterleave"(
//     %params*   addrspace(2) %0,   // constant buffer
//     <2 x i32>               %1,   // grid_in
//     <4 x i8>*  addrspace(1) %2,   // inputY   (device RO, uchar4)
//     <4 x i8>*  addrspace(1) %3,   // inputU   (device RO, uchar4)
//     <4 x i8>*  addrspace(1) %4,   // inputV   (device RO, uchar4)
//     <4 x i8>*  addrspace(1) %5    // outputYUV (device RW, uchar4 — UYVY packed)
//   )
// PARAMS struct (from !18):
//   { u32 m_strideY,      // +0
//     u32 m_strideUV,     // +4
//     u32 m_strideYUV,    // +8
//     u32 m_mul,          // +12
//     u32 m_off,          // +16
//     u32 m_globalWidth,  // +20
//     u32 m_globalHeight  // +24 }
//
// FAST-MATH: kernel is INTEGER-only; no fp ops.
//
// SHAPE:
//   Inverse of bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV. For each
//   (x = grid_in.x, y = grid_in.y) inside the domain, this kernel reads
//   TWO ushort4 uchar4 tiles of Y (8 luma samples), ONE uchar4 of U
//   (4 chroma-U), ONE uchar4 of V (4 chroma-V), and writes FOUR
//   consecutive UYVY macropixels [U, Y0, V, Y1] to `outputYUV`.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16/+20/+24 into the 28-byte struct.
 */
export interface Bm3dnrBufPlanarToInterleaveParams {
  m_strideY: number;     // +0
  m_strideUV: number;    // +4
  m_strideYUV: number;   // +8
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
 * @param params    constant buffer (%0)
 * @param gridX     grid_in.x  (extractelement %1, 0)   — %7
 * @param gridY     grid_in.y  (extractelement %1, 1)   — %12
 * @param inputY    read-only Y plane                   — %2
 * @param inputU    read-only U plane                   — %3
 * @param inputV    read-only V plane                   — %4
 * @param outputYUV write UYVY-packed buffer            — %5
 */
export function bm3dnr_buf_planarToInterleave(
  params: Bm3dnrBufPlanarToInterleaveParams,
  gridX: number,
  gridY: number,
  inputY: readonly UChar4[],
  inputU: readonly UChar4[],
  inputV: readonly UChar4[],
  outputYUV: UChar4[],
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
  //   %18 = m_strideY, %20 = m_strideUV, %22 = m_strideYUV,
  //   %24 = m_mul,     %26 = m_off
  const strideY = params.m_strideY | 0;
  const strideUV = params.m_strideUV | 0;
  const strideYUV = params.m_strideYUV | 0;
  const mul = params.m_mul | 0;
  const off = params.m_off | 0;

  // %27, %28: zext grid_in.x / grid_in.y to i64.
  const x = gridX >>> 0;
  const y = gridY >>> 0;

  // %29 = x shl 1                       -> x*2   (Y-plane column base)
  // %30 = %29 or 1                      -> x*2 + 1
  // %31 = zext m_strideY to i64
  // %32 = m_strideY * y
  // %33 = %32 + %29                     -> inputY[y*strideY + x*2]
  // %34 = gep inputY, %33
  // %35 = load <4 x i8>                (Y0..Y3)
  const yRowBase = Math.imul(strideY, y | 0) | 0;
  const y0123 = inputY[(yRowBase + x * 2) | 0];         // %35 (Y0,Y1,Y2,Y3)
  // %36 = %30 + %32                     -> inputY[y*strideY + x*2 + 1]
  // %38 = load <4 x i8>                (Y4..Y7)
  const y4567 = inputY[(yRowBase + x * 2 + 1) | 0];     // %38 (Y4,Y5,Y6,Y7)

  // %39 = zext m_strideUV to i64
  // %40 = m_strideUV * y
  // %41 = %40 + x
  // %42 = gep inputU, %41    ; %43 = load               (U0..U3)
  // %44 = gep inputV, %41    ; %45 = load               (V0..V3)
  const uvIdx = (Math.imul(strideUV, y | 0) + x) | 0;
  const u = inputU[uvIdx];   // %43 (U0,U1,U2,U3)
  const v = inputV[uvIdx];   // %45 (V0,V1,V2,V3)

  // Shufflevector-derived output macropixels (%46..%57):
  //   Each of the 4 output uchar4s packs one [U, Y_even, V, Y_odd] macropixel
  //   using pairs (U_k, Y_{2k}, V_k, Y_{2k+1}).
  //
  // Macropixel 0 (%48): [u[0], y0123[0], v[0], y0123[1]]  = [U0, Y0, V0, Y1]
  //   %46 = shuffle(u, y0123, <0, 4, u, u>)                = [U0, Y0, u, u]
  //   %47 = shuffle(%46, v,   <0, 1, 4, u>)                = [U0, Y0, V0, u]
  //   %48 = shuffle(%47, y0123,<0, 1, 2, 5>)               = [U0, Y0, V0, Y1]
  const mp0: UChar4 = [u[0], y0123[0], v[0], y0123[1]];   // %48

  // Macropixel 1 (%51): [u[1], y0123[2], v[1], y0123[3]]  = [U1, Y2, V1, Y3]
  //   %49 = shuffle(u, y0123, <1, 6, u, u>)                = [U1, Y2, u, u]
  //   %50 = shuffle(%49, v,   <0, 1, 5, u>)                = [U1, Y2, V1, u]
  //   %51 = shuffle(%50, y0123,<0, 1, 2, 7>)               = [U1, Y2, V1, Y3]
  const mp1: UChar4 = [u[1], y0123[2], v[1], y0123[3]];   // %51

  // Macropixel 2 (%54): [u[2], y4567[0], v[2], y4567[1]]  = [U2, Y4, V2, Y5]
  //   %52 = shuffle(u, y4567, <2, 4, u, u>)                = [U2, Y4, u, u]
  //   %53 = shuffle(%52, v,   <0, 1, 6, u>)                = [U2, Y4, V2, u]
  //   %54 = shuffle(%53, y4567,<0, 1, 2, 5>)               = [U2, Y4, V2, Y5]
  const mp2: UChar4 = [u[2], y4567[0], v[2], y4567[1]];   // %54

  // Macropixel 3 (%57): [u[3], y4567[2], v[3], y4567[3]]  = [U3, Y6, V3, Y7]
  //   %55 = shuffle(u, y4567, <3, 6, u, u>)                = [U3, Y6, u, u]
  //   %56 = shuffle(%55, v,   <0, 1, 7, u>)                = [U3, Y6, V3, u]
  //   %57 = shuffle(%56, y4567,<0, 1, 2, 7>)               = [U3, Y6, V3, Y7]
  const mp3: UChar4 = [u[3], y4567[2], v[3], y4567[3]];   // %57

  // Output addressing:
  //   %58 = m_mul * y
  //   %59 = %58 + m_off
  //   %60 = %59 * m_strideYUV
  //   %61 = x shl 2                     -> x*4
  //   %62 = zext %60 to i64
  //   %63 = %61 + %62                   -> outputYUV[rowIdx*strideYUV + x*4]
  //   store %48 (mp0)
  //   %65 = %61 or 1  ; %66 = %65 + %62 ; store %51 (mp1)
  //   %68 = %61 or 2  ; %69 = %68 + %62 ; store %54 (mp2)
  //   %71 = %61 or 3  ; %72 = %71 + %62 ; store %57 (mp3)
  const rowIdx = (Math.imul(mul, y | 0) + off) | 0;
  const rowBase = Math.imul(rowIdx, strideYUV) | 0;
  const outBase = (rowBase + x * 4) | 0;
  outputYUV[outBase + 0] = mp0;
  outputYUV[outBase + 1] = mp1;
  outputYUV[outBase + 2] = mp2;
  outputYUV[outBase + 3] = mp3;
}
