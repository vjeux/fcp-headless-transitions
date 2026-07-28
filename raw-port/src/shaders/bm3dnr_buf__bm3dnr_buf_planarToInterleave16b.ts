// bm3dnr_buf__bm3dnr_buf_planarToInterleave16b.ts — direct TS mapping of
// the Metal compute kernel `bm3dnr_buf::bm3dnr_buf_planarToInterleave16b`
// from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_planarToInterleave16b (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_planarToInterleave16b.ll
// (header: `0x000000000065010d -- bm3dnr_buf::bm3dnr_buf_planarToInterleave16b`)
//
// Converts four PLANAR uint16 images (Y, U, V, A) into a single
// INTERLEAVED YUV(A) image. Each thread `(gx, gy)` produces 4 output
// vec4s (16 output samples), one per source-x sub-position.
//
// Two dispatch paths controlled by params.flag444:
//   - flag444 != 0  (4:4:4 chroma): U, V, A are read at the SAME x-index
//                    as Y; %37..%70 build 4 output vec4s by lane-shuffling
//                    (V[i], Y[i], U[i], A[i]) across i=0..3.
//   - flag444 == 0  (subsampled 4:2:0 / 4:2:2): Y is read at TWO adjacent
//                    x-indices (`2*x`, `2*x+1`) — so 8 Y samples for each
//                    4 UV samples — and %71..%105 build 4 output vec4s by
//                    a slightly different lane shuffle.
//
// After the shuffle stage the two paths converge at %106 (a 6-way PHI):
//   %107  clampMask     (per-lane u16)
//   %108  shiftAmount   (per-lane u16 — will be `& 15` at %117)
//   %109  outVec3       (per-block output 3)
//   %110  outVec2       (per-block output 2)
//   %111  outVec1       (per-block output 1)
//   %112  outVec0       (per-block output 0)
//
// Then for each of the 4 output vec4s:
//   clamped_i = air.min.u.v4i16(outVec_i, clampMask)   // %116/%119/%121/%123
//   shifted_i = clamped_i << (shiftAmount & 15)         // %118/%120/%122/%124
//   output[base + i] = shifted_i                        // %128/%131/%134/%137
//
// The store base is `4*gx + strideYUV * (mul*gy + off)`, so consecutive
// x threads produce 4 adjacent vec4s each (a stride of 4 per x step).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_planarToInterleave16b(
//     %params*        %0,    // params struct (10 fields, see below)
//     <2 x i32>       %1,    // thread_position_in_grid   (gx, gy)
//     <4 x i16>*      %2,    // inputY  (read)
//     <4 x i16>*      %3,    // inputU  (read)
//     <4 x i16>*      %4,    // inputV  (read)
//     <4 x i16>*      %5,    // inputA  (read)
//     <4 x i16>*      %6     // outputYUV (write)
//   )
//
// Params struct layout (from !18 in the .ll):
//   uint    m_strideInY     @0    → %19
//   uint    m_strideInUVA   @4    → %21
//   uint    m_strideYUV     @8    → %23
//   uint    m_mul           @12   → %25
//   uint    m_off           @16   → %27
//   uint    m_flag444       @20   → %29   (only tested for == 0 at %36)
//   uint    m_shift         @24   → %31   (truncated to i16 at %67/%103)
//   ushort  m_clamp         @28   → %33
//   uint    m_globalWidth   @32   → %10
//   uint    m_globalHeight  @36   → %14
//
// -----------------------------------------------------------------------------
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// This kernel is INTEGER-ONLY (no fp ops), so the flags do not apply — the
// transcription is bit-exact against the AIR IR by construction.

/** Ushort4 pixel — matches `<4 x i16>` lane order (u16-valued 0..65535). */
export type Ushort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_planarToInterleave16b_params` (!18). */
export interface PlanarToInterleave16bParams {
  /** uint   m_strideInY    — row stride into `inputY`   (in <4 x i16> units). */
  readonly strideInY: number;
  /** uint   m_strideInUVA  — row stride into `inputU/V/A` (in <4 x i16> units). */
  readonly strideInUVA: number;
  /** uint   m_strideYUV    — row stride into `outputYUV` (in <4 x i16> units,
   *                         multiplied by (mul*y + off) to build the base). */
  readonly strideYUV: number;
  /** uint   m_mul          — row-index multiplier for the output base
   *                         (see %113: mul * gy). */
  readonly mul: number;
  /** uint   m_off          — row-index offset for the output base
   *                         (see %114: mul*gy + off). */
  readonly off: number;
  /** uint   m_flag444      — 0 → subsampled path (%71); non-zero → 4:4:4 path (%37). */
  readonly flag444: number;
  /** uint   m_shift        — per-sample left-shift, `& 15` applied at %117
   *                         (this is the 16-bit renormalisation of a
   *                         narrower-than-16-bit source value). */
  readonly shift: number;
  /** ushort m_clamp        — per-lane u16 clip max (splatted to <4 x i16> at %64/%101). */
  readonly clamp: number;
  /** uint   m_globalWidth  — grid.x upper bound, exclusive (bound check %10). */
  readonly globalWidth: number;
  /** uint   m_globalHeight — grid.y upper bound, exclusive (bound check %14). */
  readonly globalHeight: number;
}

/**
 * bm3dnr_buf::bm3dnr_buf_planarToInterleave16b — direct TS mapping of the
 * AIR body. Every SSA value in the .ll is cited by the `// %N` tag on its
 * producing statement.
 */
export function bm3dnr_buf__bm3dnr_buf_planarToInterleave16b(
  params: PlanarToInterleave16bParams,          // %0
  gridPos: readonly [number, number],           // %1 (gx, gy)
  inputY: readonly Ushort4[],                    // %2 <4 x i16>* (read)
  inputU: readonly Ushort4[],                    // %3 <4 x i16>* (read)
  inputV: readonly Ushort4[],                    // %4 <4 x i16>* (read)
  inputA: readonly Ushort4[],                    // %5 <4 x i16>* (read)
  outputYUV: Ushort4[],                          // %6 <4 x i16>* (write)
): void {
  const gx = gridPos[0] | 0;                    // %8
  const gy = gridPos[1] | 0;                    // %13

  // Bounds checks — %11 / %16 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return; // %11 → %138 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return; // %16 → %138 ret

  const strideInY   = params.strideInY   | 0;   // %19
  const strideInUVA = params.strideInUVA | 0;   // %21
  const strideYUV   = params.strideYUV   | 0;   // %23
  const mul         = params.mul         | 0;   // %25
  const off         = params.off         | 0;   // %27
  const flag444     = params.flag444     | 0;   // %29
  const shift       = params.shift       | 0;   // %31
  const clamp       = params.clamp & 0xffff;    // %33 (i16 load, sign-agnostic)

  // %36 = (flag444 == 0). Non-zero → %37 (4:4:4 path); zero → %71 (subsampled).
  let outVec0: Ushort4;
  let outVec1: Ushort4;
  let outVec2: Ushort4;
  let outVec3: Ushort4;
  let clampMask: Ushort4;
  let shiftAmount: Ushort4;

  if (flag444 !== 0) {
    // -----------------------------------------------------------------------
    // %37..%70 — 4:4:4 path. U, V, A read at the SAME x-index as Y.
    // -----------------------------------------------------------------------
    // %38..%40  yIdx  = strideInY   * gy + gx
    const yIdx = (Math.imul(strideInY, gy) + gx) >>> 0;
    // %41..%42  Y = inputY[yIdx]
    const Y = inputY[yIdx];                                     // %42

    // %43..%45  uvaIdx = strideInUVA * gy + gx
    const uvaIdx = (Math.imul(strideInUVA, gy) + gx) >>> 0;
    // %46..%47  U = inputU[uvaIdx]
    const U = inputU[uvaIdx];                                   // %47
    // %48..%49  V = inputV[uvaIdx]
    const V = inputV[uvaIdx];                                   // %49
    // %50..%51  A = inputA[uvaIdx]
    const A = inputA[uvaIdx];                                   // %51

    // The 4 output vec4s of the 4:4:4 path are built by three chained
    // shufflevectors each. The pattern for lane i∈{0,1,2,3} is:
    //   step1 = shuffle(A, Y, <i, 4+i>, undef, undef)   // = (A[i], Y[i], _, _)
    //   step2 = shuffle(step1, U, <0, 1, 4+i>, undef)   // = (A[i], Y[i], U[i], _)
    //   step3 = shuffle(step2, V, <0, 1, 2, 4+i>)       // = (A[i], Y[i], U[i], V[i])
    //
    // Corresponding IR %52/%53/%54 for i=0; %55/%56/%57 for i=1;
    //                 %58/%59/%60 for i=2; %61/%62/%63 for i=3.
    // NB: the shufflevector <i32 0, i32 4, undef, undef> pattern's first
    // operand is %51 (=A) and second is %42 (=Y) — so lane 0 of the vec4
    // is A[i] and lane 1 is Y[i]. Then U and V are inserted at lanes 2/3.
    const shuf = (i: number): Ushort4 => [A[i], Y[i], U[i], V[i]];
    outVec0 = shuf(0); // %54
    outVec1 = shuf(1); // %57
    outVec2 = shuf(2); // %60
    outVec3 = shuf(3); // %63

    // %64..%66  clampMask = <-1(u16), clamp, clamp, clamp>
    //   %64 = insertelement <i16 -1, undef, undef, undef>, i16 %33, 1
    //   %65 = insertelement %64, %33, 2
    //   %66 = insertelement %65, %33, 3
    // The `<i16 -1, ...>` initialiser is a splat of 0xFFFF at lane 0, then
    // the u16 clamp fills lanes 1..3. That is, the ALPHA lane (lane 0 in
    // this shuffle's output order, per the "(A[i], Y[i], U[i], V[i])"
    // mapping above) is clipped to the full u16 range (i.e. NOT clipped),
    // while Y/U/V are clipped to `clamp`. That matches the semantics:
    // alpha is 16-bit-full-range but chroma/luma are narrower.
    clampMask = [0xffff, clamp, clamp, clamp];  // %66

    // %67..%70  shiftAmount = <0, shift16, shift16, shift16>
    //   %67 = trunc i32 %31 to i16       (shift16 = shift & 0xFFFF)
    //   %68 = insertelement <i16 0, undef, undef, undef>, %67, 1
    //   %69 = insertelement %68, %67, 2
    //   %70 = insertelement %69, %67, 3
    // Alpha lane is shifted by 0 (i.e. unchanged); Y/U/V are shifted by
    // `shift` bits.
    const shift16 = shift & 0xffff;
    shiftAmount = [0, shift16, shift16, shift16]; // %70
  } else {
    // -----------------------------------------------------------------------
    // %71..%105 — subsampled path. Y read at 2*gx and 2*gx+1.
    // -----------------------------------------------------------------------
    // %72 %73  gxDouble = 2*gx    gxDoubleP1 = 2*gx + 1
    const gxDouble   = (gx * 2) >>> 0;                           // %72
    const gxDoubleP1 = (gxDouble | 1) >>> 0;                     // %73

    // %74..%76  yIdx0 = strideInY * gy + 2*gx
    // %79       yIdx1 = strideInY * gy + 2*gx + 1
    const rowY = Math.imul(strideInY, gy) >>> 0;                // %75
    const yIdx0 = (rowY + gxDouble)   >>> 0;                    // %76
    const yIdx1 = (rowY + gxDoubleP1) >>> 0;                    // %79
    const Y0 = inputY[yIdx0];                                    // %78
    const Y1 = inputY[yIdx1];                                    // %81

    // %82..%84  uvaIdx = strideInUVA * gy + gx
    const uvaIdx = (Math.imul(strideInUVA, gy) + gx) >>> 0;
    const U = inputU[uvaIdx];                                    // %86
    const V = inputV[uvaIdx];                                    // %88
    // NB: this path does NOT load inputA — the 4:2:0/4:2:2 output has no
    // dedicated alpha samples (the alpha lane is filled by the
    // clampMask/shiftAmount splat below, not by a source A vec4).

    // The subsampled shuffle pattern for pixel-pair i∈{0,1,2,3} builds:
    //   step1 = shuffle(U, Y0, <i, 4+i, u, u>)             = (U[i], Y0[i], _, _)  (i=0,1)
    //           shuffle(U, Y1, <i, 4+(i-2), u, u>)         = (U[i], Y1[i-2], _, _) (i=2,3)
    //   step2 = shuffle(step1, V, <0, 1, 4+i%2, u>)        = (U[i], Yk[l], V[i], _)
    //   step3 = shuffle(step2, Y*, <0, 1, 2, 4+m>)         = (U[i], Yk[l], V[i], Y*[m])
    //
    // The exact %51..%81 references are as follows (verbatim from the IR):
    //   %89  = shuffle(%86=U, %78=Y0, <0, 4, u, u>)              // = (U[0], Y0[0], _, _)
    //   %90  = shuffle(%89, %88=V,   <0, 1, 4, u>)               // = (U[0], Y0[0], V[0], _)
    //   %91  = shuffle(%90, %78=Y0,  <0, 1, 2, 5>)               // = (U[0], Y0[0], V[0], Y0[1])
    //
    //   %92  = shuffle(%86, %78, <1, 6, u, u>)                   // = (U[1], Y0[2], _, _)
    //   %93  = shuffle(%92, %88, <0, 1, 5, u>)                   // = (U[1], Y0[2], V[1], _)
    //   %94  = shuffle(%93, %78, <0, 1, 2, 7>)                   // = (U[1], Y0[2], V[1], Y0[3])
    //
    //   %95  = shuffle(%86, %81=Y1, <2, 4, u, u>)                // = (U[2], Y1[0], _, _)
    //   %96  = shuffle(%95, %88, <0, 1, 6, u>)                   // = (U[2], Y1[0], V[2], _)
    //   %97  = shuffle(%96, %81, <0, 1, 2, 5>)                   // = (U[2], Y1[0], V[2], Y1[1])
    //
    //   %98  = shuffle(%86, %81, <3, 6, u, u>)                   // = (U[3], Y1[2], _, _)
    //   %99  = shuffle(%98, %88, <0, 1, 7, u>)                   // = (U[3], Y1[2], V[3], _)
    //   %100 = shuffle(%99, %81, <0, 1, 2, 7>)                   // = (U[3], Y1[2], V[3], Y1[3])
    outVec0 = [U[0], Y0[0], V[0], Y0[1]];        // %91
    outVec1 = [U[1], Y0[2], V[1], Y0[3]];        // %94
    outVec2 = [U[2], Y1[0], V[2], Y1[1]];        // %97
    outVec3 = [U[3], Y1[2], V[3], Y1[3]];        // %100

    // %101..%102  clampMask = splat(clamp)   — all four lanes clipped equally.
    clampMask = [clamp, clamp, clamp, clamp];                    // %102
    // %103..%105  shiftAmount = splat(shift16) — all four lanes shifted equally.
    const shift16 = shift & 0xffff;
    shiftAmount = [shift16, shift16, shift16, shift16];          // %105
  }

  // ---------------------------------------------------------------------------
  // %106 (join point) — the two paths converge with 6-way PHIs. Then for
  // each of the 4 output vec4s:
  //   clamped_i = air.min.u.v4i16(outVec_i, clampMask)          // u16 min
  //   shifted_i = clamped_i << (shiftAmount & 15)               // u16 shl
  //   output[base + i] = shifted_i
  // ---------------------------------------------------------------------------

  // %113..%115  outBase = strideYUV * (mul*gy + off)   (as a scalar row-offset,
  // in <4 x i16> units).
  const mulGy = Math.imul(mul, gy) >>> 0;                         // %113
  const rowIdx = (mulGy + off) >>> 0;                             // %114
  const outBase = Math.imul(rowIdx, strideYUV) >>> 0;             // %115

  // %117  shiftMask = shiftAmount & <15, 15, 15, 15>
  const s0 = shiftAmount[0] & 15;
  const s1 = shiftAmount[1] & 15;
  const s2 = shiftAmount[2] & 15;
  const s3 = shiftAmount[3] & 15;

  // Per-lane u16 min and u16 shl.
  //   %116 = air.min.u.v4i16(outVec0, clampMask)
  //   %118 = %116 << shiftMask
  const c0: Ushort4 = [
    minU16(outVec0[0], clampMask[0]),
    minU16(outVec0[1], clampMask[1]),
    minU16(outVec0[2], clampMask[2]),
    minU16(outVec0[3], clampMask[3]),
  ];
  const v0: Ushort4 = [
    shlU16(c0[0], s0),
    shlU16(c0[1], s1),
    shlU16(c0[2], s2),
    shlU16(c0[3], s3),
  ];
  //   %119 = min(outVec1, clampMask)   %120 = %119 << shiftMask
  const c1: Ushort4 = [
    minU16(outVec1[0], clampMask[0]),
    minU16(outVec1[1], clampMask[1]),
    minU16(outVec1[2], clampMask[2]),
    minU16(outVec1[3], clampMask[3]),
  ];
  const v1: Ushort4 = [
    shlU16(c1[0], s0),
    shlU16(c1[1], s1),
    shlU16(c1[2], s2),
    shlU16(c1[3], s3),
  ];
  //   %121 = min(outVec2, clampMask)   %122 = %121 << shiftMask
  const c2: Ushort4 = [
    minU16(outVec2[0], clampMask[0]),
    minU16(outVec2[1], clampMask[1]),
    minU16(outVec2[2], clampMask[2]),
    minU16(outVec2[3], clampMask[3]),
  ];
  const v2: Ushort4 = [
    shlU16(c2[0], s0),
    shlU16(c2[1], s1),
    shlU16(c2[2], s2),
    shlU16(c2[3], s3),
  ];
  //   %123 = min(outVec3, clampMask)   %124 = %123 << shiftMask
  const c3: Ushort4 = [
    minU16(outVec3[0], clampMask[0]),
    minU16(outVec3[1], clampMask[1]),
    minU16(outVec3[2], clampMask[2]),
    minU16(outVec3[3], clampMask[3]),
  ];
  const v3: Ushort4 = [
    shlU16(c3[0], s0),
    shlU16(c3[1], s1),
    shlU16(c3[2], s2),
    shlU16(c3[3], s3),
  ];

  // %125..%137  Store 4 output vec4s starting at outBase + 4*gx:
  //   idxBase = 4*gx + outBase
  //   output[idxBase + 0] = v0
  //   output[idxBase + 1] = v1
  //   output[idxBase + 2] = v2
  //   output[idxBase + 3] = v3
  const gx4 = (gx * 4) >>> 0;                                     // %125
  const idxBase = (gx4 + outBase) >>> 0;                          // %127
  outputYUV[idxBase + 0] = v0;                                    // %128 store
  outputYUV[idxBase + 1] = v1;                                    // %131 store
  outputYUV[idxBase + 2] = v2;                                    // %134 store
  outputYUV[idxBase + 3] = v3;                                    // %137 store

  // br label %138 ; ret void
}

// ---------------------------------------------------------------------------
// Small u16 helpers — mirror the AIR intrinsics on <4 x i16>.
// ---------------------------------------------------------------------------

/** `air.min.u.v4i16` per lane — u16 minimum. */
function minU16(a: number, b: number): number {
  const ua = a & 0xffff;
  const ub = b & 0xffff;
  return ua < ub ? ua : ub;
}

/** `shl <4 x i16>` per lane — 16-bit left shift with wraparound. The
 *  shifted-in bits are zero; bits shifted past bit 15 are discarded. */
function shlU16(v: number, s: number): number {
  return ((v & 0xffff) << (s & 15)) & 0xffff;
}
