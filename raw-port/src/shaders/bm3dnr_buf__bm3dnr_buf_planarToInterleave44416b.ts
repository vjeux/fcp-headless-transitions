// @shader bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_planarToInterleave44416b.ll
//   (see .ll header @0x6663d)
//
// SIGNATURE (from !14 / !17..!23 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b"(
//     %params*      addrspace(2) %0,   // constant buffer (see !18)
//     <2 x i32>                  %1,   // grid_in (thread pos in grid)
//     <4 x i16>*    addrspace(1) %2,   // inputY    (device R, ushort4)
//     <4 x i16>*    addrspace(1) %3,   // inputU    (device R, ushort4)
//     <4 x i16>*    addrspace(1) %4,   // inputV    (device R, ushort4)
//     <4 x i16>*    addrspace(1) %5    // outputYUV (device R/W, ushort4)
//   )
// PARAMS struct (from !18 — 40 bytes / 10 fields, mixed i16/i32):
//   { u32 m_strideY,       // +0    (uint; Y plane row stride)
//     u32 m_strideU,       // +4    (uint; U plane row stride)
//     u32 m_strideV,       // +8    (uint; V plane row stride)
//     u32 m_strideYUV,     // +12   (uint; output row stride, applied inside
//                                    the reader-offset arith)
//     u32 m_mul,           // +16   (uint; part of the writer-offset math)
//     u32 m_off,           // +20   (uint; part of the writer-offset math)
//     u32 m_shift,         // +24   (uint; low 4 bits used as lshl on each lane)
//     i16 m_clamp,         // +28   (ushort; max value per lane; lane 0 pinned to -1)
//     u32 m_globalWidth,   // +32   (uint; grid bound)
//     u32 m_globalHeight   // +36   (uint; grid bound) }
//   Note: !18 says field type is "ushort" for m_clamp (16-bit), and both
//   the IR and the transcription treat it as a 16-bit lane value. The
//   struct total size is 40 bytes (!17: `air.arg_type_size, i32 40`) —
//   the ushort at +28 sits in the low 2 bytes of a 4-byte slot (per the
//   struct layout in !18 spelling "i16 %31 = load i16"), with the
//   upper 2 bytes of that 4-byte slot being padding.
//
// FAST-MATH: this kernel is INTEGER-only. Both denorms and fast-math are
// disabled (!11, !12) but no fp32 ops exist here — no Math.fround needed.
//
// SHAPE:
//   For each (x = grid_in.x, y = grid_in.y) inside the [m_globalWidth x
//   m_globalHeight] grid, the kernel:
//     1. Loads ONE ushort4 vector from each of the three planar inputs at
//        the same (x, y) with per-plane strides:
//          Y = inputY[m_strideY * y + x]     (%39)
//          U = inputU[m_strideU * y + x]     (%44)
//          V = inputV[m_strideV * y + x]     (%49)
//     2. Assembles FOUR output ushort4 pixels (one per lane 0..3 of the
//        source planes). Each output pixel is:
//          out[lane_i] = { 0xFFFF, Y[lane_i], U[lane_i], V[lane_i] }
//        (lane 0 == 0xFFFF because the shufflevector picks a literal
//        `i16 -1` from a vector-of-`<-1, undef, undef, undef>` constant.)
//     3. Clamps lanes 1..3 to m_clamp (lane 0 stays 0xFFFF since
//        min.u(0xFFFF, 0xFFFF)=0xFFFF), then left-shifts by (m_shift & 15).
//     4. Stores the 4 pixels at
//          outputYUV[(m_mul*y + m_off) * m_strideYUV + x*4 + i]  for i=0..3
//   The kernel name "44416b" reflects the 4:4:4 chroma sampling ("4-4-4")
//   with 16-bit precision — every source plane is read at native
//   resolution and packed into a 4-channel interleaved output.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16/+20/+24/+28/+32/+36 into the 40-byte
 * struct. See file header for size and mixed-width interpretation.
 * @shader bm3dnr_buf::bm3dnr_buf_planarToInterleave44416b — !18 in the .ll.
 */
export interface Bm3dnrBufPlanarToInterleave44416bParams {
  // +0  — uint32 Y-plane row stride (%18 in IR)
  m_strideY: number;
  // +4  — uint32 U-plane row stride (%20 in IR)
  m_strideU: number;
  // +8  — uint32 V-plane row stride (%22 in IR)
  m_strideV: number;
  // +12 — uint32 output row stride (%24 in IR, used inside writer-offset math)
  m_strideYUV: number;
  // +16 — uint32 (%26 in IR)
  m_mul: number;
  // +20 — uint32 (%28 in IR)
  m_off: number;
  // +24 — uint32 shift amount (%30 in IR; low 4 bits used as shl)
  m_shift: number;
  // +28 — ushort per-lane max value (%32 in IR; loaded as `load i16`)
  m_clamp: number;
  // +32 — uint32 grid domain width  (%9 in IR)
  m_globalWidth: number;
  // +36 — uint32 grid domain height (%14 in IR)
  m_globalHeight: number;
}

// ushort4 pixel: length-4 tuple of 0..65535 uint16 lanes.
export type UShort4In = readonly [number, number, number, number];
export type UShort4Out = [number, number, number, number];

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params      constant buffer (%0)
 * @param gridX       grid_in.x  (extractelement %1, 0)      — %7
 * @param gridY       grid_in.y  (extractelement %1, 1)      — %12
 * @param inputY      read-only ushort4 buffer               — %2
 * @param inputU      read-only ushort4 buffer               — %3
 * @param inputV      read-only ushort4 buffer               — %4
 * @param outputYUV   read-write ushort4 buffer              — %5
 */
export function bm3dnr_buf_planarToInterleave44416b(
  params: Bm3dnrBufPlanarToInterleave44416bParams,
  gridX: number,
  gridY: number,
  inputY: readonly UShort4In[],
  inputU: readonly UShort4In[],
  inputV: readonly UShort4In[],
  outputYUV: UShort4Out[],
): void {
  // %7..%10: if (grid_in.x >= m_globalWidth) return.
  //   %7  = extractelement <2 x i32> %1, i64 0
  //   %8  = gep params, i32 8       (m_globalWidth)
  //   %9  = load i32
  //   %10 = icmp ult i32 %7, %9
  //   br i1 %10, label %11, label %94
  if (!((gridX >>> 0) < (params.m_globalWidth >>> 0))) return;

  // %12..%15: if (grid_in.y >= m_globalHeight) return.
  //   %12 = extractelement <2 x i32> %1, i64 1
  //   %13 = gep params, i32 9       (m_globalHeight)
  //   %14 = load i32
  //   %15 = icmp ult i32 %12, %14
  //   br i1 %15, label %16, label %94
  if (!((gridY >>> 0) < (params.m_globalHeight >>> 0))) return;

  // %17..%32: load the remaining eight params in field order.
  //   %18 = m_strideY   (uint)      %26 = m_mul      (uint)
  //   %20 = m_strideU   (uint)      %28 = m_off      (uint)
  //   %22 = m_strideV   (uint)      %30 = m_shift    (uint)
  //   %24 = m_strideYUV (uint)      %32 = m_clamp    (ushort, load i16)
  const strideY = params.m_strideY | 0;
  const strideU = params.m_strideU | 0;
  const strideV = params.m_strideV | 0;
  const strideYUV = params.m_strideYUV | 0;
  const mulConst = params.m_mul | 0;
  const offConst = params.m_off | 0;
  const shiftRaw = params.m_shift | 0;
  const clamp = (params.m_clamp & 0xffff) | 0;

  // %33 = zext gridX, %34 = zext gridY.
  // %35 = zext %18 (m_strideY).
  // %36 = %35 * %34 ; %37 = %36 + %33
  // %38 = gep inputY, %37 ; %39 = load <4 x i16>  -> Y vector.
  //   Same shape for U (%40..%44) and V (%45..%49).
  const yIdx = (Math.imul(strideY, gridY | 0) + (gridX | 0)) | 0; // %37
  const uIdx = (Math.imul(strideU, gridY | 0) + (gridX | 0)) | 0; // %42
  const vIdx = (Math.imul(strideV, gridY | 0) + (gridX | 0)) | 0; // %47
  const y = inputY[yIdx]; // %39
  const u = inputU[uIdx]; // %44
  const v = inputV[vIdx]; // %49

  // ============================================================
  // Assemble the 4 output pixels via shufflevector chains.
  // ============================================================
  // The IR uses a per-pixel pattern that folds a literal `i16 -1` into
  // lane 0 of each output and drops the {lane i} of Y/U/V into lanes 1/2/3.
  //
  //   %50 = shufflevector <-1,undef,undef,undef>, %39, <0, 4, undef, undef>
  //       -> [-1, Y[0], undef, undef]
  //   %51 = shufflevector %50, %44, <0, 1, 4, undef>
  //       -> [-1, Y[0], U[0], undef]
  //   %52 = shufflevector %51, %49, <0, 1, 2, 4>
  //       -> [-1, Y[0], U[0], V[0]]        (pixel 0)
  //
  //   %53 = insertelement %39, i16 -1, i64 0
  //       -> [-1, Y[1], Y[2], Y[3]]  (a Y vector with lane 0 replaced by -1)
  //   %54 = shufflevector %53, %44, <0, 1, 5, undef>
  //       -> [-1, Y[1], U[1], undef]
  //   %55 = shufflevector %54, %49, <0, 1, 2, 5>
  //       -> [-1, Y[1], U[1], V[1]]        (pixel 1)
  //
  //   %56/%57/%58 -> [-1, Y[2], U[2], V[2]]  (pixel 2)
  //   %59/%60/%61 -> [-1, Y[3], U[3], V[3]]  (pixel 3)
  //
  // The lane-0 sentinel is 0xFFFF when the ushort4 is viewed as unsigned
  // (i16 -1 == 0xFFFF); we materialize it as 0xFFFF for direct comparison
  // against m_clamp in the min.u step below.
  const NEG1_U16 = 0xffff;
  const px0: [number, number, number, number] = [NEG1_U16, y[0] & 0xffff, u[0] & 0xffff, v[0] & 0xffff]; // %52
  const px1: [number, number, number, number] = [NEG1_U16, y[1] & 0xffff, u[1] & 0xffff, v[1] & 0xffff]; // %55
  const px2: [number, number, number, number] = [NEG1_U16, y[2] & 0xffff, u[2] & 0xffff, v[2] & 0xffff]; // %58
  const px3: [number, number, number, number] = [NEG1_U16, y[3] & 0xffff, u[3] & 0xffff, v[3] & 0xffff]; // %61

  // ============================================================
  // Build the two broadcast vectors used in the min.u + shl steps.
  // ============================================================
  //   %62 = insertelement <-1, undef, undef, undef>, i16 %32, i64 1
  //   %63 = insertelement %62, i16 %32, i64 2
  //   %64 = insertelement %63, i16 %32, i64 3
  //       -> clampVec = [0xFFFF, m_clamp, m_clamp, m_clamp]
  //
  //   %65 = trunc i32 %30 to i16    (m_shift narrowed to i16)
  //   %66 = insertelement <0, undef, undef, undef>, i16 %65, i64 1
  //   %67 = insertelement %66, i16 %65, i64 2
  //   %68 = insertelement %67, i16 %65, i64 3
  //       -> shiftVec = [0, m_shift, m_shift, m_shift]
  //
  //   %73 = and <4 x i16> %68, <15, 15, 15, 15>
  //       -> lane 0 is 0 & 15 == 0 (no shift on the sentinel lane), lanes
  //       1..3 hold (m_shift & 15).
  const clampVec: [number, number, number, number] = [NEG1_U16, clamp, clamp, clamp]; // %64
  const shiftLane0 = 0;                          // %73 lane 0 (0 & 15)
  const shiftOther = (shiftRaw & 15) | 0;        // %73 lanes 1..3 ((m_shift trunc) & 15)

  // ============================================================
  // Writer-side base offset.
  // ============================================================
  //   %69 = mul i32 %26, %12       (m_mul * gridY)
  //   %70 = add %69, %28           (+ m_off)
  //   %71 = mul %70, %24           (* m_strideYUV)
  //   %75 = %33 shl 2              (gridX * 4)
  //   %76 = zext %71 to i64
  //   %77 = %75 + %76              (base index for pixel 0)
  const rowOff = Math.imul((Math.imul(mulConst, gridY | 0) + offConst) | 0, strideYUV) | 0; // %71
  const xBase = ((gridX | 0) * 4) | 0;           // %75

  // Per-pixel: min.u(pixel, clampVec), then shl by shiftVec (lane 0 uses 0).
  function clampAndShift(p: [number, number, number, number]): UShort4Out {
    // air.min.u.v4i16 — unsigned lane-wise min. p[0]=NEG1_U16, clampVec[0]=NEG1_U16.
    const m0 = p[0] < clampVec[0] ? p[0] : clampVec[0];
    const m1 = p[1] < clampVec[1] ? p[1] : clampVec[1];
    const m2 = p[2] < clampVec[2] ? p[2] : clampVec[2];
    const m3 = p[3] < clampVec[3] ? p[3] : clampVec[3];
    // shl <4 x i16> by shiftVec: lane 0 shifts by 0, lanes 1..3 by shiftOther.
    // Mask to 16 bits after shift (v4i16 truncates).
    return [
      (m0 << shiftLane0) & 0xffff,
      (m1 << shiftOther) & 0xffff,
      (m2 << shiftOther) & 0xffff,
      (m3 << shiftOther) & 0xffff,
    ];
  }

  // ============================================================
  // 4 stores at outputYUV[xBase + rowOff + i], i in {0,1,2,3}.
  // ============================================================
  //   %78 = gep outputYUV, i64 %77             (pixel 0)   store %74
  //   %81 = %75 | 1 ; %82 = %81 + %76 ; %83 = gep, %82     (pixel 1) store %80
  //   %86 = %75 | 2 ; %87 = %86 + %76 ; %88 = gep, %87     (pixel 2) store %85
  //   %91 = %75 | 3 ; %92 = %91 + %76 ; %93 = gep, %92     (pixel 3) store %90
  outputYUV[(xBase + rowOff) | 0] = clampAndShift(px0);        // %78 <- %74
  outputYUV[((xBase | 1) + rowOff) | 0] = clampAndShift(px1);  // %83 <- %80
  outputYUV[((xBase | 2) + rowOff) | 0] = clampAndShift(px2);  // %88 <- %85
  outputYUV[((xBase | 3) + rowOff) | 0] = clampAndShift(px3);  // %93 <- %90
}
