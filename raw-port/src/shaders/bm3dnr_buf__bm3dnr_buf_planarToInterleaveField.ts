// @shader bm3dnr_buf::bm3dnr_buf_planarToInterleaveField (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_planarToInterleaveField.ll
//   (see .ll header @0x68bfd)
//
// SIGNATURE (from !14 / !17..!23 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_planarToInterleaveField"(
//     %params*   addrspace(2) %0,   // constant buffer
//     <2 x i32>               %1,   // grid_in
//     <4 x i8>*  addrspace(1) %2,   // inputY  (device RW, uchar4 - Y plane, 2 samples-per-uchar4)
//     <4 x i8>*  addrspace(1) %3,   // inputU  (device RW, uchar4 - U plane)
//     <4 x i8>*  addrspace(1) %4,   // inputV  (device RW, uchar4 - V plane)
//     <4 x i8>*  addrspace(1) %5    // outputYUV (device RW, uchar4 - interleaved YUV)
//   )
// PARAMS struct (from !18):
//   { u32 m_strideY,      // +0
//     u32 m_strideU,      // +4
//     u32 m_strideV,      // +8
//     u32 m_strideYUV,    // +12
//     i32 m_off,          // +16   (SIGNED - sext to i64 for row math)
//     u32 m_globalWidth,  // +20
//     u32 m_globalHeight  // +24 }
//   NOTE: the struct-type in the IR is named
//   "bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV_params" (shared struct),
//   but !17 gives the effective binding name
//   "bm3dnr_buf::bm3dnr_buf_planarToInterleaveField_params" for this kernel.
//   The struct GEPs used here (indices 0, 1, 2, 3, 4, 5, 6) prove the
//   above field order.
//
// FAST-MATH: kernel is INTEGER-only. !12 fast-math-disable / !11 denorms-disable
// don't affect anything here.
//
// SHAPE:
//   The inverse of bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVField.
//   Reads two adjacent Y uchar4s (columns 2x, 2x+1 of the Y plane),
//   one U uchar4 (column x), and one V uchar4 (column x).
//   Then packs them into 4 output uchar4s (macropixels 0..3 at output
//   column x*4 within the row `y*2 + m_off`), each output uchar4 laid
//   out as [U_k, Y0_j, V_k, Y1_j] where j walks the Y samples and k
//   walks the co-sited chroma samples.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16/+20/+24 into the 28-byte struct.
 */
export interface Bm3dnrBufPlanarToInterleaveFieldParams {
  m_strideY: number;     // +0  (unsigned)
  m_strideU: number;     // +4  (unsigned)
  m_strideV: number;     // +8  (unsigned)
  m_strideYUV: number;   // +12 (unsigned)
  m_off: number;         // +16 (SIGNED - field-pair row offset)
  m_globalWidth: number; // +20 (unsigned)
  m_globalHeight: number;// +24 (unsigned)
}

export type UChar4 = readonly [number, number, number, number];

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params    constant buffer (%0)
 * @param gridX     grid_in.x  (extractelement %1, 0)   - %7
 * @param gridY     grid_in.y  (extractelement %1, 1)   - %12
 * @param inputY    read/write uchar4 Y plane           - %2
 * @param inputU    read/write uchar4 U plane           - %3
 * @param inputV    read/write uchar4 V plane           - %4
 * @param outputYUV write uchar4 interleaved YUV buffer - %5
 */
export function bm3dnr_buf_planarToInterleaveField(
  params: Bm3dnrBufPlanarToInterleaveFieldParams,
  gridX: number,
  gridY: number,
  inputY: readonly UChar4[],
  inputU: readonly UChar4[],
  inputV: readonly UChar4[],
  outputYUV: UChar4[],
): void {
  // %7..%10: if (grid_in.x >= m_globalWidth) return.
  //   %8  = gep params, i32 5       (m_globalWidth)
  //   %10 = icmp ult i32 %7, %9
  if (!(gridX >>> 0 < params.m_globalWidth >>> 0)) return;

  // %12..%15: if (grid_in.y >= m_globalHeight) return.
  //   %13 = gep params, i32 6       (m_globalHeight)
  //   %15 = icmp ult i32 %12, %14
  if (!(gridY >>> 0 < params.m_globalHeight >>> 0)) return;

  // %17..%26: load the five stride/offset fields.
  //   %18 = m_strideY, %20 = m_strideU, %22 = m_strideV,
  //   %24 = m_strideYUV, %26 = m_off  (signed)
  const strideY = params.m_strideY | 0;
  const strideU = params.m_strideU | 0;
  const strideV = params.m_strideV | 0;
  const strideYUV = params.m_strideYUV | 0;
  const off = params.m_off | 0;

  // %27, %28: zext grid_in.x / grid_in.y to i64.
  const x = gridX >>> 0;
  const y = gridY >>> 0;

  // %29 = x shl 1         -> x*2
  // %30 = %29 or 1        -> x*2 + 1
  const x2 = (x * 2) | 0;
  const x2p1 = (x2 + 1) | 0;

  // %31 = zext m_strideY
  // %32 = m_strideY * y   -> y*strideY
  // %33 = %32 + %29       -> Y[y*strideY + 2x]  index
  // %35 = load inputY[%33]                            -> Y0 (uchar4 with 2 Y-column samples in lanes 1,3)
  const yRowBase = Math.imul(strideY, y | 0) | 0;
  const yIdx0 = (yRowBase + x2) | 0;
  const Y0 = inputY[yIdx0];                             // %35

  // %36 = %30 + %32       -> Y[y*strideY + 2x+1]  index
  // %38 = load inputY[%36]                             -> Y1
  const yIdx1 = (yRowBase + x2p1) | 0;
  const Y1 = inputY[yIdx1];                             // %38

  // %39 = zext m_strideU
  // %40 = m_strideU * y   -> y*strideU
  // %41 = %40 + x         -> U[y*strideU + x]  index
  // %43 = load inputU[%41]
  const uIdx = (Math.imul(strideU, y | 0) + x) | 0;
  const U = inputU[uIdx];                               // %43

  // %44 = zext m_strideV
  // %45 = m_strideV * y   -> y*strideV
  // %46 = %45 + x         -> V[y*strideV + x]  index
  // %48 = load inputV[%46]
  const vIdx = (Math.imul(strideV, y | 0) + x) | 0;
  const V = inputV[vIdx];                               // %48

  // Shufflevector packing (%49..%60). Every lane index cites the
  // 8-element concatenated vector of the two source uchar4s:
  //   For shuffle(%A, %B, <mask>), lanes 0..3 come from %A, lanes 4..7 from %B.
  //
  // Macropixel 0  (output = [U[0], Y0[0], V[0], Y0[1]]):
  //   %49 = shuffle(%43=U, %35=Y0, <0,4,u,u>)  = [U[0], Y0[0], ?, ?]
  //   %50 = shuffle(%49,   %48=V,  <0,1,4,u>)  = [U[0], Y0[0], V[0], ?]
  //   %51 = shuffle(%50,   %35=Y0, <0,1,2,5>)  = [U[0], Y0[0], V[0], Y0[1]]
  const out0: UChar4 = [U[0], Y0[0], V[0], Y0[1]];      // %51

  // Macropixel 1  (output = [U[1], Y0[2], V[1], Y0[3]]):
  //   %52 = shuffle(%43=U, %35=Y0, <1,6,u,u>)  = [U[1], Y0[2], ?, ?]
  //   %53 = shuffle(%52,   %48=V,  <0,1,5,u>)  = [U[1], Y0[2], V[1], ?]
  //   %54 = shuffle(%53,   %35=Y0, <0,1,2,7>)  = [U[1], Y0[2], V[1], Y0[3]]
  const out1: UChar4 = [U[1], Y0[2], V[1], Y0[3]];      // %54

  // Macropixel 2  (output = [U[2], Y1[0], V[2], Y1[1]]):
  //   %55 = shuffle(%43=U, %38=Y1, <2,4,u,u>)  = [U[2], Y1[0], ?, ?]
  //   %56 = shuffle(%55,   %48=V,  <0,1,6,u>)  = [U[2], Y1[0], V[2], ?]
  //   %57 = shuffle(%56,   %38=Y1, <0,1,2,5>)  = [U[2], Y1[0], V[2], Y1[1]]
  const out2: UChar4 = [U[2], Y1[0], V[2], Y1[1]];      // %57

  // Macropixel 3  (output = [U[3], Y1[2], V[3], Y1[3]]):
  //   %58 = shuffle(%43=U, %38=Y1, <3,6,u,u>)  = [U[3], Y1[2], ?, ?]
  //   %59 = shuffle(%58,   %48=V,  <0,1,7,u>)  = [U[3], Y1[2], V[3], ?]
  //   %60 = shuffle(%59,   %38=Y1, <0,1,2,7>)  = [U[3], Y1[2], V[3], Y1[3]]
  const out3: UChar4 = [U[3], Y1[2], V[3], Y1[3]];      // %60

  // Output addressing (%61..%77):
  //   %61 = x shl 2                    -> x*4
  //   %62 = zext m_strideYUV
  //   %63 = y shl 1                    -> y*2
  //   %64 = sext m_off                 -> off (signed)
  //   %65 = %63 + %64                  -> rowIdx = y*2 + off (signed)
  //   %66 = %65 * m_strideYUV          -> rowBase (signed since %65 is signed)
  //   %67 = %66 + %61                  -> output index 0
  //   store %51 -> outputYUV[%67]
  //   %69 = %61 or 1                   -> x*4 + 1
  //   %70 = %69 + %66                  -> output index 1
  //   store %54 -> outputYUV[%70]
  //   %72 = %61 or 2                   -> x*4 + 2
  //   %73 = %72 + %66                  -> output index 2
  //   store %57 -> outputYUV[%73]
  //   %75 = %61 or 3                   -> x*4 + 3
  //   %76 = %75 + %66                  -> output index 3
  //   store %60 -> outputYUV[%76]
  const x4 = (x * 4) | 0;
  const rowIdx = ((y * 2) + off) | 0;
  const rowBase = Math.imul(rowIdx, strideYUV) | 0;
  outputYUV[(rowBase + x4)     | 0] = out0;             // %68 store
  outputYUV[(rowBase + x4 + 1) | 0] = out1;             // %71 store
  outputYUV[(rowBase + x4 + 2) | 0] = out2;             // %74 store
  outputYUV[(rowBase + x4 + 3) | 0] = out3;             // %77 store
}
