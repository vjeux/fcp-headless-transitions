// bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUV44416b.ts — direct TS mapping of the
// @shader bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV44416b (HeliumSenso)
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUV44416b.ll
// (header line: `0x000000000457dd -- bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV44416b`)
//
// Deinterleaves a 4-lane packed YUV444 16-bit source (ushort4-per-pixel, one pixel per lane
// laid out as `<Y, U, V, ??>`) into three separate planar Y/U/V outputs. Each output pixel is
// a `<4 x u16>` (ushort4) representing 4 adjacent horizontal samples of a single channel, and
// each is right-shifted by `m_shift & 15` before store (bit-depth scaling — the source is a
// higher-bit-precision buffer, the outputs are the target bit depth).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV44416b(
//     %params*        %0,    // 9-field params struct (see !18)
//     <2 x i32>       %1,    // thread_position_in_grid   (gx, gy)
//     <4 x i16>*      %2,    // input   (read; packed YUV, ushort4 per pixel)
//     <4 x i16>*      %3,    // outputY (write, ushort4 = 4 Y samples)
//     <4 x i16>*      %4,    // outputU (write, ushort4 = 4 U samples)
//     <4 x i16>*      %5     // outputV (write, ushort4 = 4 V samples)
//   )
//
// Params struct layout (!18):
//   uint m_strideIn      @0    → %18   (input row stride, in packed pixels)
//   uint m_strideY       @4    → %20   (Y output row stride, in ushort4 tiles)
//   uint m_strideU       @8    → %22   (U output row stride, in ushort4 tiles)
//   uint m_strideV       @12   → %24   (V output row stride, in ushort4 tiles)
//   uint m_mul           @16   → %26   (a multiplier applied to gy for input-row scaling)
//   uint m_off           @20   → %28   (a constant added to (m_mul*gy) for input-row offset)
//   uint m_shift         @24   → %30   (bit-scale right shift, masked to low 4 bits)
//   uint m_globalWidth   @28   → %9    (bound check on gx)
//   uint m_globalHeight  @32   → %14   (bound check on gy)
//
// Algorithm decoded (%16..%80):
//   Compute the input-tile base index for this (gx, gy):
//     baseRow    = ((m_mul * gy) + m_off) * m_strideIn                  // %37..%39
//     baseIdx    = gx*4 + baseRow                                       // %33 = gx<<2 ; %41 = %33 + %40
//     idx0..idx3 = baseIdx + {0,1,2,3}                                  // via or-immediate %33/%34/%35/%36
//   Load 4 consecutive ushort4 pixels (one pixel each):
//     P0 = input[idx0]   P1 = input[idx1]   P2 = input[idx2]   P3 = input[idx3]     // %43/%46/%49/%52
//   Rebuild per-channel ushort4s by shuffling lane-1 (Y), lane-2 (U), lane-3 (V) of the 4
//   consecutive pixels into 4-lane vectors:
//     Yvec = <P0[1], P1[1], P2[1], P3[1]>                               // %53/%54/%55  (mask 1,5,-,-  → 0,1,5,-  → 0,1,2,5)
//     Uvec = <P0[2], P1[2], P2[2], P3[2]>                               // %56/%57/%58  (mask 2,6,-,-)
//     Vvec = <P0[3], P1[3], P2[3], P3[3]>                               // %59/%60/%61  (mask 3,7,-,-)
//   Compute the shift splat:
//     shiftScalar = m_shift & 0xF                                        // %62/%63/%64  (truncate to i16, AND 15)
//     shiftVec    = <shiftScalar, shiftScalar, shiftScalar, shiftScalar> // %65 shufflevector zeroinit
//   Right-shift each channel and store to its plane:
//     outputY[m_strideY * gy + gx] = Yvec >> shiftVec                    // %66/%67..%70  store
//     outputU[m_strideU * gy + gx] = Uvec >> shiftVec                    // %71/%72..%75  store
//     outputV[m_strideV * gy + gx] = Vvec >> shiftVec                    // %76/%77..%80  store
//   (`lshr` is a logical right shift — matches u16 semantics.)
//
// The .ll uses `<4 x i16>` for both input and output. The type name in the arg metadata (!20)
// is `ushort4`, so all lane values are treated as unsigned 16-bit numbers.
//
// NOTE: `!16` argument ordering says the input alias is %33 (arg 2), and outputs Y/U/V are
// args 3/4/5 (aliases %34/%35/%36 in !47/49/51/53). The kernel is single-pass (no fp math,
// no fused ops); all AIR intrinsics are shufflevector and lshr — no exp2/floor/clamp.

/** Ushort4 pixel — matches `<4 x u16>` lane order (unsigned 16-bit lanes as JS numbers). */
export type UShort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV44416b_params` (!18). */
export interface InterleaveToPlanarYUV44416bParams {
  /** uint m_strideIn — input row stride, in packed ushort4 pixels. */
  readonly strideIn: number;
  /** uint m_strideY  — Y output row stride, in ushort4 tiles.       */
  readonly strideY: number;
  /** uint m_strideU  — U output row stride, in ushort4 tiles.       */
  readonly strideU: number;
  /** uint m_strideV  — V output row stride, in ushort4 tiles.       */
  readonly strideV: number;
  /** uint m_mul      — multiplier applied to gy for input-row scaling. */
  readonly mul: number;
  /** uint m_off      — constant added to (m_mul*gy) for input-row offset. */
  readonly off: number;
  /** uint m_shift    — bit-scale right shift; only the low 4 bits are used. */
  readonly shift: number;
  /** uint m_globalWidth  — grid width  in output columns (ushort4 tiles). */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid height in output rows. */
  readonly globalHeight: number;
}

/**
 * bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV44416b — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value in the .ll is cited by the
 * `// %N` tag on its producing statement below.
 */
export function bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUV44416b(
  params: InterleaveToPlanarYUV44416bParams,   // %0
  gridPos: readonly [number, number],          // %1 (gx, gy)
  input: readonly UShort4[],                    // %2 <4 x u16>* (read)
  outputY: UShort4[],                           // %3 <4 x u16>* (write)
  outputU: UShort4[],                           // %4 <4 x u16>* (write)
  outputV: UShort4[],                           // %5 <4 x u16>* (write)
): void {
  const gx = gridPos[0] | 0;                    // %7
  const gy = gridPos[1] | 0;                    // %12

  // Bounds checks — %10 / %15 (icmp ult) — early return to shared %81 exit.
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %10
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %15

  const strideIn = params.strideIn | 0;         // %18
  const strideY  = params.strideY  | 0;         // %20
  const strideU  = params.strideU  | 0;         // %22
  const strideV  = params.strideV  | 0;         // %24
  const mul      = params.mul      | 0;         // %26
  const off      = params.off      | 0;         // %28
  const shiftRaw = params.shift    | 0;         // %30

  // Input tile base index computation.
  const gx4 = (gx << 2) | 0;                    // %33 = shl gx,2  (four consecutive pixels)
  const idx0 = gx4;                             // %33  (or 0)
  const idx1 = (gx4 | 1) | 0;                   // %34  or i64 %33, 1
  const idx2 = (gx4 | 2) | 0;                   // %35  or i64 %33, 2
  const idx3 = (gx4 | 3) | 0;                   // %36  or i64 %33, 3

  // baseRow = (mul * gy + off) * strideIn  — %37..%39.
  const baseRow = (Math.imul(Math.imul(mul, gy) + off, strideIn)) | 0;   // %37 mul; %38 add; %39 mul

  // Load 4 consecutive input pixels — %42/%45/%48/%51 GEPs, %43/%46/%49/%52 loads.
  const P0 = input[(idx0 + baseRow) | 0];       // %43 load  (gep %41)
  const P1 = input[(idx1 + baseRow) | 0];       // %46 load  (gep %44)
  const P2 = input[(idx2 + baseRow) | 0];       // %49 load  (gep %47)
  const P3 = input[(idx3 + baseRow) | 0];       // %52 load  (gep %50)

  // Rebuild per-channel ushort4s by picking lane-1/2/3 of each of the 4 pixels.
  // %53..%55  Yvec = <P0[1], P1[1], P2[1], P3[1]>
  //   masks: <1,5,-,-> → <0,1,5,-> → <0,1,2,5>
  const Yvec: UShort4 = [P0[1], P1[1], P2[1], P3[1]] as const;
  // %56..%58  Uvec = <P0[2], P1[2], P2[2], P3[2]>
  const Uvec: UShort4 = [P0[2], P1[2], P2[2], P3[2]] as const;
  // %59..%61  Vvec = <P0[3], P1[3], P2[3], P3[3]>
  const Vvec: UShort4 = [P0[3], P1[3], P2[3], P3[3]] as const;

  // Shift splat — %62 trunc(m_shift) to i16 ; %64 AND 15 ; %65 splat to <s,s,s,s>.
  const s = (shiftRaw & 0x0F) | 0;              // %62/%63/%64

  // Right-shift each channel — `lshr <4 x u16>` is a logical (unsigned) right shift.
  const shr = (v: UShort4): UShort4 => [
    (v[0] >>> s) & 0xFFFF,
    (v[1] >>> s) & 0xFFFF,
    (v[2] >>> s) & 0xFFFF,
    (v[3] >>> s) & 0xFFFF,
  ] as const;

  // Y plane store — %66 lshr ; %69 gep (strideY*gy + gx) ; store.
  const Yout = shr(Yvec);                       // %66
  const yIdx = ((Math.imul(strideY, gy)) + gx) | 0;   // %68 = %67*%32 ; %69 = %68+%31
  outputY[yIdx] = Yout;                         // %70 store

  // U plane store — %71 lshr ; %74 gep (strideU*gy + gx) ; store.
  const Uout = shr(Uvec);                       // %71
  const uIdx = ((Math.imul(strideU, gy)) + gx) | 0;   // %73 = %72*%32 ; %74 = %73+%31
  outputU[uIdx] = Uout;                         // %75 store

  // V plane store — %76 lshr ; %79 gep (strideV*gy + gx) ; store.
  const Vout = shr(Vvec);                       // %76
  const vIdx = ((Math.imul(strideV, gy)) + gx) | 0;   // %78 = %77*%32 ; %79 = %78+%31
  outputV[vIdx] = Vout;                         // %80 store
}
