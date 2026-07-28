// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Column (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR at
//   raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8Column.ll
// (header: `0x0000000000abbd -- bm3dnr_buf::bm3dnr_buf_blend8x8Column`).
//
// Compute kernel dispatched per (x, y) point in a 2D grid.  For a point
// inside the (m_globalWidth × m_globalHeight) window, it reads 8
// consecutive float32 samples from a strided `inOut` row, multiplies two
// float4 numerators (loaded from `inNum`) by two float4 weights (loaded
// from `weightBuffer`), accumulates into the 8 float samples, and stores
// them back at the same positions.
//
// AIR compile options captured in the .ll:
//   !11 air.compile.denorms_disable
//   !12 air.compile.fast_math_disable         (fp32-narrowed math; no fast-math)
//   !13 air.compile.framebuffer_fetch_enable
// The kernel signature (from !kernel metadata, arg indices):
//   arg0 (!17) buffer<params>        m_strideInOut, m_strideIn, m_stepInc,
//                                     m_globalWidth, m_globalHeight (5×i32)
//   arg1 (!19) uint2                 thread_position_in_grid  (grid_in)
//   arg2 (!20) buffer<float>         inOut          (read_write float row)
//   arg3 (!21) buffer<float4>        inNum          (read_write float4 buf)
//   arg4 (!22) buffer<float4>        weightBuffer   (read_write float4 buf)
// Note: name is bm3dnr_buf_blend8x8Column but the params struct type
// symbol is `bm3dnr_buf_blend4x4Weight_params` (verbatim from the IR) —
// same 5-i32 shape, shared by the 4x4/8x8 sibling kernels.

/**
 * Params buffer (arg0) — 5 signed 32-bit fields.  Field names come from the
 * !17/!18 kernel-arg metadata in the .ll (`m_strideInOut`, `m_strideIn`,
 * `m_stepInc`, `m_globalWidth`, `m_globalHeight`).
 */
export interface Bm3dnrBlend8x8ColumnParams {
  /** !18 field 0 — `int m_strideInOut` — stride (in float32 units) of `inOut`. */
  m_strideInOut: number;
  /** !18 field 1 — `int m_strideIn` — stride (in float4 units) of `inNum`. */
  m_strideIn: number;
  /** !18 field 2 — `int m_stepInc` — per-row column step for `inOut`. */
  m_stepInc: number;
  /** !18 field 3 — `uint m_globalWidth` — X-axis bound (exclusive). */
  m_globalWidth: number;
  /** !18 field 4 — `uint m_globalHeight` — Y-axis bound (exclusive). */
  m_globalHeight: number;
}

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8Column — direct transcription.
 *
 * @param params    kernel arg0 (buffer<params>)
 * @param grid_in   kernel arg1 (uint2 thread_position_in_grid) = [x, y]
 * @param inOut     kernel arg2 (buffer<float>, read_write float row)
 * @param inNum     kernel arg3 (buffer<float4>, read_write float4 buf)
 * @param weightBuf kernel arg4 (buffer<float4>, read_write float4 buf)
 */
export function bm3dnr_buf_blend8x8Column(
  params: Bm3dnrBlend8x8ColumnParams,
  grid_in: readonly [number, number],
  inOut: Float32Array,
  inNum: Float32Array,
  weightBuf: Float32Array,
): void {
  // %6  = extractelement <2 x i32> %1, i64 0
  const x = grid_in[0] >>> 0;
  // %8  = load i32, params.m_globalWidth
  const gw = params.m_globalWidth >>> 0;
  // %9  = icmp ult i32 %6, %8
  //       br i1 %9, label %10, label %90
  if (!(x < gw)) {
    // %90 ret void — early exit
    return;
  }
  // %11 = extractelement <2 x i32> %1, i64 1
  const y = grid_in[1] >>> 0;
  // %13 = load i32, params.m_globalHeight
  const gh = params.m_globalHeight >>> 0;
  // %14 = icmp ult i32 %11, %13
  //       br i1 %14, label %15, label %90
  if (!(y < gh)) {
    return;
  }

  // Block %15 — inside the (x,y) rectangle.
  // %17 = load i32, params.m_strideInOut   (arg0 field 0)
  const strideInOut = params.m_strideInOut | 0;
  // %19 = load i32, params.m_strideIn      (arg0 field 1)
  const strideIn = params.m_strideIn | 0;
  // %21 = load i32, params.m_stepInc       (arg0 field 2)
  const stepInc = params.m_stepInc | 0;

  // %22 = zext i32 %6 to i64          -> x as i64
  // %23 = zext i32 %11 to i64         -> y as i64
  // %24 = sext i32 %21 to i64         -> stepInc as i64
  // %25 = mul nsw i64 %24, %22        -> stepInc * x
  const colBase = Math.imul(stepInc, x);
  // %26 = shl nuw nsw i64 %22, 1      -> x << 1  (used for inNum indexing)
  const xShl1 = x << 1;
  // %27 = sext i32 %17 to i64         -> strideInOut as i64
  // %28 = mul nsw i64 %27, %23        -> strideInOut * y
  const rowBase = Math.imul(strideInOut, y);
  // %29 = add i64 %25, %28            -> base offset into `inOut`
  const base = colBase + rowBase;

  // %30..%42 — GEP+load %29..%29+3, insertelement into <4 x float>
  //           (call it "left half" of the 8-sample window)
  // %31 %35 %39 %43 are inOut[base + {0,1,2,3}]
  const l0 = Math.fround(inOut[base + 0]);
  const l1 = Math.fround(inOut[base + 1]);
  const l2 = Math.fround(inOut[base + 2]);
  const l3 = Math.fround(inOut[base + 3]);

  // %45..%58 — GEP+load %29+4..%29+7, insertelement into <4 x float>
  //           ("right half" of the 8-sample window)
  // %47 %51 %55 %59 are inOut[base + {4,5,6,7}]
  const r0 = Math.fround(inOut[base + 4]);
  const r1 = Math.fround(inOut[base + 5]);
  const r2 = Math.fround(inOut[base + 6]);
  const r3 = Math.fround(inOut[base + 7]);

  // %61 = sext i32 %19 to i64                strideIn as i64
  // %62 = mul nsw i64 %61, %23                strideIn * y
  // %63 = add nsw i64 %62, %26                (+ x<<1)  -> inNum base (float4)
  const numBase = Math.imul(strideIn, y) + xShl1;
  // %64/%65 = GEP+load <4 x float>, inNum[%63]
  //   float4 loads are stored as 4 consecutive float32s; multiply by 4 for
  //   the float32-flat view Float32Array we take here.
  const numL_x = Math.fround(inNum[numBase * 4 + 0]);
  const numL_y = Math.fround(inNum[numBase * 4 + 1]);
  const numL_z = Math.fround(inNum[numBase * 4 + 2]);
  const numL_w = Math.fround(inNum[numBase * 4 + 3]);
  // %66 = add nsw i64 %63, 1
  // %67/%68 = GEP+load <4 x float>, inNum[%63 + 1]
  const numRIdx = (numBase + 1) * 4;
  const numR_x = Math.fround(inNum[numRIdx + 0]);
  const numR_y = Math.fround(inNum[numRIdx + 1]);
  const numR_z = Math.fround(inNum[numRIdx + 2]);
  const numR_w = Math.fround(inNum[numRIdx + 3]);

  // %69 = shl i32 %11, 1                       y << 1
  // %70 = and i32 %69, 14                      (y << 1) & 0xE  -> bin index in [0,14]
  //   The weight buffer is cyclically indexed by the low bits of `y*2`.
  //   With mask 0xE (0b1110), consecutive y values step the bin by 2 modulo 16,
  //   giving 8 distinct bins for y in [0..7] before wrapping.
  const wBin = ((y << 1) & 0xE) >>> 0;
  // %71 = zext i32 %70 to i64
  // %72/%73 = GEP+load <4 x float>, weightBuffer[wBin]
  const wLIdx = wBin * 4;
  const wL_x = Math.fround(weightBuf[wLIdx + 0]);
  const wL_y = Math.fround(weightBuf[wLIdx + 1]);
  const wL_z = Math.fround(weightBuf[wLIdx + 2]);
  const wL_w = Math.fround(weightBuf[wLIdx + 3]);
  // %74 = or i32 %70, 1                        (wBin | 1)
  // %75 = zext i32 %74 to i64
  // %76/%77 = GEP+load <4 x float>, weightBuffer[wBin | 1]
  const wRIdx = ((wBin | 1) >>> 0) * 4;
  const wR_x = Math.fround(weightBuf[wRIdx + 0]);
  const wR_y = Math.fround(weightBuf[wRIdx + 1]);
  const wR_z = Math.fround(weightBuf[wRIdx + 2]);
  const wR_w = Math.fround(weightBuf[wRIdx + 3]);

  // %78 = fmul <4 x float> %65, %73             numL * wL
  const mL_x = Math.fround(numL_x * wL_x);
  const mL_y = Math.fround(numL_y * wL_y);
  const mL_z = Math.fround(numL_z * wL_z);
  const mL_w = Math.fround(numL_w * wL_w);
  // %79 = fmul <4 x float> %68, %77             numR * wR
  const mR_x = Math.fround(numR_x * wR_x);
  const mR_y = Math.fround(numR_y * wR_y);
  const mR_z = Math.fround(numR_z * wR_z);
  const mR_w = Math.fround(numR_w * wR_w);
  // %80 = fadd <4 x float> %44, %78             leftHalf + mL
  const o0 = Math.fround(l0 + mL_x);
  const o1 = Math.fround(l1 + mL_y);
  const o2 = Math.fround(l2 + mL_z);
  const o3 = Math.fround(l3 + mL_w);
  // %81 = fadd <4 x float> %60, %79             rightHalf + mR
  const o4 = Math.fround(r0 + mR_x);
  const o5 = Math.fround(r1 + mR_y);
  const o6 = Math.fround(r2 + mR_z);
  const o7 = Math.fround(r3 + mR_w);

  // %82..%89 — extractelement + store float, back to inOut[base+{0..7}].
  inOut[base + 0] = o0;
  inOut[base + 1] = o1;
  inOut[base + 2] = o2;
  inOut[base + 3] = o3;
  inOut[base + 4] = o4;
  inOut[base + 5] = o5;
  inOut[base + 6] = o6;
  inOut[base + 7] = o7;
  // br label %90; ret void
}
