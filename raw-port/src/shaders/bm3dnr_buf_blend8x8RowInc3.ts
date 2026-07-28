// @shader bm3dnr_buf::bm3dnr_buf_blend8x8RowInc3 (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR at
//   raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8RowInc3.ll
// (header: `0x00000000011ead -- bm3dnr_buf::bm3dnr_buf_blend8x8RowInc3`).
//
// Compute kernel dispatched per (x, y) point in a 2D grid.  For a point
// inside the (m_globalWidth × m_globalHeight) window, it processes a
// 17-row × 2-column tile of `inOut` (34 float4 words) and mixes it with
// pieces of a 32-row × 2-column strip of `inNum` (64 float4 words).
//
// The output pattern (verbatim from the store order in the .ll):
//   rows 0..4   : inOut[r,c] += inNum[r, c]                  (%327..%340)
//   rows 5, 8   : inOut[r,c] = inNum[3r-15, c] + inNum[3r-14, c]
//                              (i.e. two-input sums, no inOut fed back)
//   rows 6, 7   : inOut[r,c] = inOut[r,c] + inNum[..] + inNum[..]
//   rows 9,10   : inOut[r,c] = inOut[r,c] + inNum[..] + inNum[..]
//   rows 11..13 : inOut[r,c] = inNum[a,c] + inNum[b,c]        (two inNum sums)
//   rows 14..16 : inOut[r,c] = inNum[29|30|31, c]             (pure inNum copy)
// The exact source-indices per output row are recorded on each store line
// below; the shape is dictated by the "row-increment-3" schedule
// (%28 grows by 3 across sibling tiles).
//
// AIR compile options captured in the .ll:
//   !11 air.compile.denorms_disable
//   !12 air.compile.fast_math_disable   (fp32-narrowed math; no fast-math)
//   !13 air.compile.framebuffer_fetch_enable
// Kernel arg list (from !kernel metadata !16):
//   arg0 (!17)  buffer<params>   m_strideInOut, m_strideIn, m_stepInc,
//                                m_offsetY, m_globalWidth, m_globalHeight
//                                                             (6 × i32)
//   arg1 (!19)  uint2            thread_position_in_grid    (grid_in)
//   arg2 (!20)  buffer<float4>   inOut                       (read_write)
//   arg3 (!21)  buffer<float4>   inNum                       (read_only)
// Note the params type symbol is `bm3dnr_buf_blend4x4Column_params` in the
// IR, sharing the layout with the sibling 4x4 kernel — but the arg
// metadata names the correct fields for this 8x8 variant.

/**
 * Params buffer (arg0) — 6 signed 32-bit fields.  Names from !18 metadata.
 */
export interface Bm3dnrBlend8x8RowInc3Params {
  /** !18 field 0 — `int m_strideInOut` — row stride (float4 units) of `inOut`. */
  m_strideInOut: number;
  /** !18 field 1 — `int m_strideIn`    — row stride (float4 units) of `inNum`. */
  m_strideIn: number;
  /** !18 field 2 — `int m_stepInc`     — row-block step multiplier. */
  m_stepInc: number;
  /** !18 field 3 — `int m_offsetY`     — Y offset applied before the strip index. */
  m_offsetY: number;
  /** !18 field 4 — `uint m_globalWidth`  — X-axis bound (exclusive). */
  m_globalWidth: number;
  /** !18 field 5 — `uint m_globalHeight` — Y-axis bound (exclusive). */
  m_globalHeight: number;
}

/**
 * Load a float4 from a Float32Array-backed float4 buffer at float4-index
 * `i`.  The buffer is a flat float32 array; each float4 occupies four
 * consecutive slots.  Returned tuple is [x, y, z, w], all fp32-narrowed.
 */
function ld4(buf: Float32Array, i: number): [number, number, number, number] {
  const b = i * 4;
  return [
    Math.fround(buf[b + 0]),
    Math.fround(buf[b + 1]),
    Math.fround(buf[b + 2]),
    Math.fround(buf[b + 3]),
  ];
}

/**
 * Store a float4 into a Float32Array-backed float4 buffer at float4-index
 * `i`.  Values are fp32-narrowed on write.
 */
function st4(
  buf: Float32Array,
  i: number,
  v: [number, number, number, number],
): void {
  const b = i * 4;
  buf[b + 0] = Math.fround(v[0]);
  buf[b + 1] = Math.fround(v[1]);
  buf[b + 2] = Math.fround(v[2]);
  buf[b + 3] = Math.fround(v[3]);
}

/** Componentwise fp32 fadd of two float4s (matches AIR `fadd <4 x float>`). */
function fadd4(
  a: readonly [number, number, number, number],
  b: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    Math.fround(a[0] + b[0]),
    Math.fround(a[1] + b[1]),
    Math.fround(a[2] + b[2]),
    Math.fround(a[3] + b[3]),
  ];
}

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8RowInc3 — direct transcription.
 *
 * @param params  kernel arg0 (buffer<params>)
 * @param grid_in kernel arg1 (uint2 thread_position_in_grid) = [x, y]
 * @param inOut   kernel arg2 (buffer<float4>, read_write float4 buf)
 * @param inNum   kernel arg3 (buffer<float4>, read_only  float4 buf)
 */
export function bm3dnr_buf_blend8x8RowInc3(
  params: Bm3dnrBlend8x8RowInc3Params,
  grid_in: readonly [number, number],
  inOut: Float32Array,
  inNum: Float32Array,
): void {
  // %5 = extractelement <2 x i32> %1, i64 0
  const x = grid_in[0] >>> 0;
  // %7  = load i32, params.m_globalWidth    (arg0 field 4)
  const gw = params.m_globalWidth >>> 0;
  // %8  = icmp ult i32 %5, %7
  //       br i1 %8, label %9, label %439
  if (!(x < gw)) {
    // %439 ret void
    return;
  }
  // %10 = extractelement <2 x i32> %1, i64 1
  const y = grid_in[1] >>> 0;
  // %12 = load i32, params.m_globalHeight   (arg0 field 5)
  const gh = params.m_globalHeight >>> 0;
  // %13 = icmp ult i32 %10, %12
  //       br i1 %13, label %14, label %439
  if (!(y < gh)) {
    return;
  }

  // Block %14 — inside the (x,y) rectangle.
  // %16 = load i32, params.m_strideInOut     (field 0)
  const strideInOut = params.m_strideInOut | 0;
  // %18 = load i32, params.m_strideIn        (field 1)
  const strideIn = params.m_strideIn | 0;
  // %20 = load i32, params.m_stepInc         (field 2)
  const stepInc = params.m_stepInc | 0;
  // %23 = load i32, params.m_offsetY         (field 3)
  const offsetY = params.m_offsetY | 0;

  // %21 = zext i32 %5 to i64                  x as i64
  // %24 = add i32 %23, %10                    (offsetY + y)
  const yPlus = (offsetY + y) | 0;
  // %25 = zext i32 %24 to i64                 (offsetY + y) as i64
  // %26 = sext i32 %20 to i64                 stepInc as i64
  // %27 = shl nsw i64 %26, 2                  stepInc * 4
  const stepInc4 = Math.imul(stepInc, 4);
  // %28 = mul i64 %27, %25                    stepInc * 4 * (offsetY + y)
  const rowMulBase = Math.imul(stepInc4, yPlus);
  // %29 = shl nuw nsw i64 %21, 1              x * 2  (col offset within row)
  const colOffset = (x << 1) >>> 0;
  // %30 = shl nuw nsw i64 %25, 5              (offsetY + y) * 32
  //                                           strip index into inNum
  const stripBase = Math.imul(yPlus, 32);
  // %31 = sext i32 %16 to i64                 strideInOut as i64
  // %71 = sext i32 %18 to i64                 strideIn    as i64

  // -----------------------------------------------------------------------
  // Read the 17 inOut rows (2 float4s per row).  Row r's first float4 lives
  // at `mul((%28 | r) or (%28 + r), %31) + %29`, with `|` used for r ∈ {1,2,3}
  // and `+` for r ∈ {4..16}.  We compute both forms; they coincide when
  // (rowMulBase & r) == 0, which is the alignment invariant that led the
  // compiler to pick `or` for the small r.
  //
  // For safety we mirror the exact op each row uses (documented per line).
  // -----------------------------------------------------------------------

  // Helper: float4-index for inOut row r, col c ∈ {0, 1}.
  //   r ∈ {0,1,2,3}   -> (rowMulBase | r)  ×  strideInOut  + colOffset
  //   r ∈ {4..16}     -> (rowMulBase + r)  ×  strideInOut  + colOffset
  // The two forms are bitwise-equivalent because the low log2(r) bits of
  // rowMulBase are zero (rowMulBase = 4*stepInc*yPlus, a multiple of 4 for
  // r < 4).  We keep both spellings to match the .ll.
  const rowIdxOr = (r: number) => (
    Math.imul((rowMulBase | r) >>> 0, strideInOut) + colOffset
  );
  const rowIdxAdd = (r: number) => (
    Math.imul((rowMulBase + r) | 0, strideInOut) + colOffset
  );
  const cell = (i: number, c: number) => i + c;

  // %33  = mul(%28,      %31) + %29                            (row0 col0)
  const p_r0c0 = cell(rowIdxOr(0), 0);
  // %35  = load <4 x float>, inOut[p_r0c0]
  const v35 = ld4(inOut, p_r0c0);
  // %36  = or i64 %33, 1                                        (row0 col1)
  const p_r0c1 = cell(rowIdxOr(0), 1);
  // %38  = load <4 x float>, inOut[p_r0c1]
  const v38 = ld4(inOut, p_r0c1);

  // %41  = mul(or %28,1, %31) + %29                            (row1 col0)
  const p_r1c0 = cell(rowIdxOr(1), 0);
  // %43  = load <4 x float>, inOut[p_r1c0]
  const v43 = ld4(inOut, p_r1c0);
  // %44  = add %41, 1                                           (row1 col1)
  const p_r1c1 = cell(rowIdxOr(1), 1);
  // %46  = load <4 x float>, inOut[p_r1c1]
  const v46 = ld4(inOut, p_r1c1);

  // %49  = mul(or %28,2, %31) + %29                            (row2 col0)
  const p_r2c0 = cell(rowIdxOr(2), 0);
  // %51  = load <4 x float>, inOut[p_r2c0]
  const v51 = ld4(inOut, p_r2c0);
  // %52  = or i64 %49, 1                                        (row2 col1)
  const p_r2c1 = cell(rowIdxOr(2), 1);
  // %54  = load <4 x float>, inOut[p_r2c1]
  const v54 = ld4(inOut, p_r2c1);

  // %57  = mul(or %28,3, %31) + %29                            (row3 col0)
  const p_r3c0 = cell(rowIdxOr(3), 0);
  // %59  = load <4 x float>, inOut[p_r3c0]
  const v59 = ld4(inOut, p_r3c0);
  // %60  = add %57, 1                                           (row3 col1)
  const p_r3c1 = cell(rowIdxOr(3), 1);
  // %62  = load <4 x float>, inOut[p_r3c1]
  const v62 = ld4(inOut, p_r3c1);

  // %65  = mul(add %28,4, %31) + %29                           (row4 col0)
  const p_r4c0 = cell(rowIdxAdd(4), 0);
  // %67  = load <4 x float>, inOut[p_r4c0]
  const v67 = ld4(inOut, p_r4c0);
  // %68  = or i64 %65, 1                                        (row4 col1)
  const p_r4c1 = cell(rowIdxAdd(4), 1);
  // %70  = load <4 x float>, inOut[p_r4c1]
  const v70 = ld4(inOut, p_r4c1);

  // -----------------------------------------------------------------------
  // Read the 32-row strip from inNum (indices 0..31, 2 float4s per row).
  // Row s uses  `mul(%30 | s, %71) + %29` for s ∈ {1..7 and any single-bit
  // combo}` and `mul(%30 + s, %71) + %29` for the compound s values.  We
  // mirror the .ll's mixed `or`/`add` op-choice exactly.
  // -----------------------------------------------------------------------

  const numRowOr = (s: number) => (
    Math.imul((stripBase | s) >>> 0, strideIn) + colOffset
  );
  const numRowAdd = (s: number) => (
    Math.imul((stripBase + s) | 0, strideIn) + colOffset
  );

  // %73  = mul(%30,       %71) + %29                            (num strip s=0 c0)
  const v75 = ld4(inNum, cell(numRowOr(0), 0));
  // %76  = or i64 %73, 1                                         (s=0 c1)
  const v78 = ld4(inNum, cell(numRowOr(0), 1));
  // %81  = mul(or %30, 1, %71) + %29                             (s=1 c0)
  const v83 = ld4(inNum, cell(numRowOr(1), 0));
  // %84  = add %81, 1                                             (s=1 c1)
  const v86 = ld4(inNum, cell(numRowOr(1), 1));
  // %89  = mul(or %30, 2, %71) + %29                             (s=2 c0)
  const v91 = ld4(inNum, cell(numRowOr(2), 0));
  // %92  = or i64 %89, 1                                          (s=2 c1)
  const v94 = ld4(inNum, cell(numRowOr(2), 1));
  // %97  = mul(or %30, 3, %71) + %29                             (s=3 c0)
  const v99 = ld4(inNum, cell(numRowOr(3), 0));
  // %100 = add %97, 1                                             (s=3 c1)
  const v102 = ld4(inNum, cell(numRowOr(3), 1));
  // %105 = mul(or %30, 4, %71) + %29                             (s=4 c0)
  const v107 = ld4(inNum, cell(numRowOr(4), 0));
  // %108 = or i64 %105, 1                                         (s=4 c1)
  const v110 = ld4(inNum, cell(numRowOr(4), 1));
  // %113 = mul(or %30, 5, %71) + %29                             (s=5 c0)
  const v115 = ld4(inNum, cell(numRowOr(5), 0));
  // %116 = add %113, 1                                            (s=5 c1)
  const v118 = ld4(inNum, cell(numRowOr(5), 1));
  // %121 = mul(or %30, 6, %71) + %29                             (s=6 c0)
  const v123 = ld4(inNum, cell(numRowOr(6), 0));
  // %124 = add %121, 1                                            (s=6 c1)
  const v126 = ld4(inNum, cell(numRowOr(6), 1));
  // %129 = mul(or %30, 7, %71) + %29                             (s=7 c0)
  const v131 = ld4(inNum, cell(numRowOr(7), 0));
  // %132 = add %129, 1                                            (s=7 c1)
  const v134 = ld4(inNum, cell(numRowOr(7), 1));
  // %137 = mul(or %30, 8, %71) + %29                             (s=8 c0)
  const v139 = ld4(inNum, cell(numRowOr(8), 0));
  // %140 = or i64 %137, 1                                         (s=8 c1)
  const v142 = ld4(inNum, cell(numRowOr(8), 1));
  // %145 = mul(or %30, 9, %71) + %29                             (s=9 c0)
  const v147 = ld4(inNum, cell(numRowOr(9), 0));
  // %148 = add %145, 1                                            (s=9 c1)
  const v150 = ld4(inNum, cell(numRowOr(9), 1));
  // %153 = mul(or %30, 10, %71) + %29                            (s=10 c0)
  const v155 = ld4(inNum, cell(numRowOr(10), 0));
  // %156 = or i64 %153, 1                                         (s=10 c1)
  const v158 = ld4(inNum, cell(numRowOr(10), 1));
  // %161 = mul(or %30, 11, %71) + %29                            (s=11 c0)
  const v163 = ld4(inNum, cell(numRowOr(11), 0));
  // %164 = add %161, 1                                            (s=11 c1)
  const v166 = ld4(inNum, cell(numRowOr(11), 1));
  // %169 = mul(or %30, 12, %71) + %29                            (s=12 c0)
  const v171 = ld4(inNum, cell(numRowOr(12), 0));
  // %172 = or i64 %169, 1                                         (s=12 c1)
  const v174 = ld4(inNum, cell(numRowOr(12), 1));
  // %177 = mul(or %30, 13, %71) + %29                            (s=13 c0)
  const v179 = ld4(inNum, cell(numRowOr(13), 0));
  // %180 = add %177, 1                                            (s=13 c1)
  const v182 = ld4(inNum, cell(numRowOr(13), 1));
  // %185 = mul(or %30, 14, %71) + %29                            (s=14 c0)
  const v187 = ld4(inNum, cell(numRowOr(14), 0));
  // %188 = or i64 %185, 1                                         (s=14 c1)
  const v190 = ld4(inNum, cell(numRowOr(14), 1));
  // %193 = mul(or %30, 15, %71) + %29                            (s=15 c0)
  const v195 = ld4(inNum, cell(numRowOr(15), 0));
  // %196 = add %193, 1                                            (s=15 c1)
  const v198 = ld4(inNum, cell(numRowOr(15), 1));
  // %201 = mul(or %30, 16, %71) + %29                            (s=16 c0)
  const v203 = ld4(inNum, cell(numRowOr(16), 0));
  // %204 = or i64 %201, 1                                         (s=16 c1)
  const v206 = ld4(inNum, cell(numRowOr(16), 1));
  // %209 = mul(or %30, 17, %71) + %29                            (s=17 c0)
  const v211 = ld4(inNum, cell(numRowOr(17), 0));
  // %212 = add %209, 1                                            (s=17 c1)
  const v214 = ld4(inNum, cell(numRowOr(17), 1));
  // %217 = mul(or %30, 18, %71) + %29                            (s=18 c0)
  const v219 = ld4(inNum, cell(numRowOr(18), 0));
  // %220 = or i64 %217, 1                                         (s=18 c1)
  const v222 = ld4(inNum, cell(numRowOr(18), 1));
  // %225 = mul(or %30, 19, %71) + %29                            (s=19 c0)
  const v227 = ld4(inNum, cell(numRowOr(19), 0));
  // %228 = add %225, 1                                            (s=19 c1)
  const v230 = ld4(inNum, cell(numRowOr(19), 1));
  // %233 = mul(or %30, 20, %71) + %29                            (s=20 c0)
  const v235 = ld4(inNum, cell(numRowOr(20), 0));
  // %236 = or i64 %233, 1                                         (s=20 c1)
  const v238 = ld4(inNum, cell(numRowOr(20), 1));
  // %241 = mul(or %30, 21, %71) + %29                            (s=21 c0)
  const v243 = ld4(inNum, cell(numRowOr(21), 0));
  // %244 = add %241, 1                                            (s=21 c1)
  const v246 = ld4(inNum, cell(numRowOr(21), 1));
  // %249 = mul(or %30, 22, %71) + %29                            (s=22 c0)
  const v251 = ld4(inNum, cell(numRowOr(22), 0));
  // %252 = or i64 %249, 1                                         (s=22 c1)
  const v254 = ld4(inNum, cell(numRowOr(22), 1));
  // %257 = mul(or %30, 23, %71) + %29                            (s=23 c0)
  const v259 = ld4(inNum, cell(numRowOr(23), 0));
  // %260 = add %257, 1                                            (s=23 c1)
  const v262 = ld4(inNum, cell(numRowOr(23), 1));
  // %265 = mul(or %30, 24, %71) + %29                            (s=24 c0)
  const v267 = ld4(inNum, cell(numRowOr(24), 0));
  // %268 = or i64 %265, 1                                         (s=24 c1)
  const v270 = ld4(inNum, cell(numRowOr(24), 1));
  // %273 = mul(or %30, 25, %71) + %29                            (s=25 c0)
  const v275 = ld4(inNum, cell(numRowOr(25), 0));
  // %276 = add %273, 1                                            (s=25 c1)
  const v278 = ld4(inNum, cell(numRowOr(25), 1));
  // %281 = mul(or %30, 26, %71) + %29                            (s=26 c0)
  const v283 = ld4(inNum, cell(numRowOr(26), 0));
  // %284 = or i64 %281, 1                                         (s=26 c1)
  const v286 = ld4(inNum, cell(numRowOr(26), 1));
  // %289 = mul(or %30, 27, %71) + %29                            (s=27 c0)
  const v291 = ld4(inNum, cell(numRowOr(27), 0));
  // %292 = add %289, 1                                            (s=27 c1)
  const v294 = ld4(inNum, cell(numRowOr(27), 1));
  // %297 = mul(or %30, 28, %71) + %29                            (s=28 c0)
  const v299 = ld4(inNum, cell(numRowOr(28), 0));
  // %300 = or i64 %297, 1                                         (s=28 c1)
  const v302 = ld4(inNum, cell(numRowOr(28), 1));
  // %305 = mul(or %30, 29, %71) + %29                            (s=29 c0)
  const v307 = ld4(inNum, cell(numRowOr(29), 0));
  // %308 = add %305, 1                                            (s=29 c1)
  const v310 = ld4(inNum, cell(numRowOr(29), 1));
  // %313 = mul(or %30, 30, %71) + %29                            (s=30 c0)
  const v315 = ld4(inNum, cell(numRowOr(30), 0));
  // %316 = or i64 %313, 1                                         (s=30 c1)
  const v318 = ld4(inNum, cell(numRowOr(30), 1));
  // %321 = mul(or %30, 31, %71) + %29                            (s=31 c0)
  const v323 = ld4(inNum, cell(numRowOr(31), 0));
  // %324 = add %321, 1                                            (s=31 c1)
  const v326 = ld4(inNum, cell(numRowOr(31), 1));

  // -----------------------------------------------------------------------
  // The output fadd tree — mirrors the .ll ops %327..%366 exactly.
  // -----------------------------------------------------------------------
  // %327 = fadd %35,  %75              (row0 col0)
  const v327 = fadd4(v35, v75);
  // %328 = fadd %38,  %78              (row0 col1)
  const v328 = fadd4(v38, v78);
  // %329 = fadd %43,  %83              (row1 col0)
  const v329 = fadd4(v43, v83);
  // %330 = fadd %46,  %86              (row1 col1)
  const v330 = fadd4(v46, v86);
  // %331 = fadd %51,  %91              (row2 col0)
  const v331 = fadd4(v51, v91);
  // %332 = fadd %54,  %94              (row2 col1)
  const v332 = fadd4(v54, v94);
  // %333 = fadd %59,  %99              (partial row3 col0)
  const v333 = fadd4(v59, v99);
  // %334 = fadd %62, %102              (partial row3 col1)
  const v334 = fadd4(v62, v102);
  // %335 = fadd %67, %107              (partial row4 col0)
  const v335 = fadd4(v67, v107);
  // %336 = fadd %70, %110              (partial row4 col1)
  const v336 = fadd4(v70, v110);
  // %337 = fadd %333, %139             (row3 col0 = %333 + inNum s=8 c0)
  const v337 = fadd4(v333, v139);
  // %338 = fadd %334, %142             (row3 col1)
  const v338 = fadd4(v334, v142);
  // %339 = fadd %335, %147             (row4 col0 = %335 + inNum s=9 c0)
  const v339 = fadd4(v335, v147);
  // %340 = fadd %336, %150             (row4 col1)
  const v340 = fadd4(v336, v150);
  // %341 = fadd %115, %155             (row5 col0 = inNum s=5 c0 + s=10 c0)
  const v341 = fadd4(v115, v155);
  // %342 = fadd %118, %158             (row5 col1)
  const v342 = fadd4(v118, v158);
  // %343 = fadd %123, %163             (partial)
  const v343 = fadd4(v123, v163);
  // %344 = fadd %343, %203             (row6 col0 = %343 + inNum s=16 c0)
  const v344 = fadd4(v343, v203);
  // %345 = fadd %126, %166             (partial)
  const v345 = fadd4(v126, v166);
  // %346 = fadd %345, %206             (row6 col1)
  const v346 = fadd4(v345, v206);
  // %347 = fadd %131, %171             (partial)
  const v347 = fadd4(v131, v171);
  // %348 = fadd %347, %211             (row7 col0 = %347 + inNum s=17 c0)
  const v348 = fadd4(v347, v211);
  // %349 = fadd %134, %174             (partial)
  const v349 = fadd4(v134, v174);
  // %350 = fadd %349, %214             (row7 col1)
  const v350 = fadd4(v349, v214);
  // %351 = fadd %179, %219             (row8 col0 = inNum s=13 c0 + s=18 c0)
  const v351 = fadd4(v179, v219);
  // %352 = fadd %182, %222             (row8 col1)
  const v352 = fadd4(v182, v222);
  // %353 = fadd %187, %227             (partial)
  const v353 = fadd4(v187, v227);
  // %354 = fadd %353, %267             (row9 col0 = %353 + inNum s=24 c0)
  const v354 = fadd4(v353, v267);
  // %355 = fadd %190, %230             (partial)
  const v355 = fadd4(v190, v230);
  // %356 = fadd %355, %270             (row9 col1)
  const v356 = fadd4(v355, v270);
  // %357 = fadd %195, %235             (partial)
  const v357 = fadd4(v195, v235);
  // %358 = fadd %357, %275             (row10 col0)
  const v358 = fadd4(v357, v275);
  // %359 = fadd %198, %238             (partial)
  const v359 = fadd4(v198, v238);
  // %360 = fadd %359, %278             (row10 col1)
  const v360 = fadd4(v359, v278);
  // %361 = fadd %243, %283             (row11 col0 = inNum s=21 c0 + s=26 c0)
  const v361 = fadd4(v243, v283);
  // %362 = fadd %246, %286             (row11 col1)
  const v362 = fadd4(v246, v286);
  // %363 = fadd %251, %291             (row12 col0)
  const v363 = fadd4(v251, v291);
  // %364 = fadd %254, %294             (row12 col1)
  const v364 = fadd4(v254, v294);
  // %365 = fadd %259, %299             (row13 col0)
  const v365 = fadd4(v259, v299);
  // %366 = fadd %262, %302             (row13 col1)
  const v366 = fadd4(v262, v302);

  // -----------------------------------------------------------------------
  // Stores.  Row indices per pointer variable are annotated inline.
  // -----------------------------------------------------------------------

  // store %327 -> %34   (row0 col0)
  st4(inOut, p_r0c0, v327);
  // store %328 -> %37   (row0 col1)
  st4(inOut, p_r0c1, v328);
  // store %329 -> %42   (row1 col0)
  st4(inOut, p_r1c0, v329);
  // store %330 -> %45   (row1 col1)
  st4(inOut, p_r1c1, v330);
  // store %331 -> %50   (row2 col0)
  st4(inOut, p_r2c0, v331);
  // store %332 -> %53   (row2 col1)
  st4(inOut, p_r2c1, v332);
  // store %337 -> %58   (row3 col0)
  st4(inOut, p_r3c0, v337);
  // store %338 -> %61   (row3 col1)
  st4(inOut, p_r3c1, v338);
  // store %339 -> %66   (row4 col0)
  st4(inOut, p_r4c0, v339);
  // store %340 -> %69   (row4 col1)
  st4(inOut, p_r4c1, v340);

  // rows 5..16 use the compound (add) form of the row multiplier.
  // %369 = mul(add %28, 5, %31) + %29
  const p_r5c0 = cell(rowIdxAdd(5), 0);
  // store %341 -> %370
  st4(inOut, p_r5c0, v341);
  // %371 = add %369, 1
  const p_r5c1 = cell(rowIdxAdd(5), 1);
  // store %342 -> %372
  st4(inOut, p_r5c1, v342);
  // %375 = mul(add %28, 6, %31) + %29
  const p_r6c0 = cell(rowIdxAdd(6), 0);
  // store %344 -> %376
  st4(inOut, p_r6c0, v344);
  // %377 = or %375, 1
  const p_r6c1 = cell(rowIdxAdd(6), 1);
  // store %346 -> %378
  st4(inOut, p_r6c1, v346);
  // %381 = mul(add %28, 7, %31) + %29
  const p_r7c0 = cell(rowIdxAdd(7), 0);
  // store %348 -> %382
  st4(inOut, p_r7c0, v348);
  // %383 = add %381, 1
  const p_r7c1 = cell(rowIdxAdd(7), 1);
  // store %350 -> %384
  st4(inOut, p_r7c1, v350);
  // %387 = mul(add %28, 8, %31) + %29
  const p_r8c0 = cell(rowIdxAdd(8), 0);
  // store %351 -> %388
  st4(inOut, p_r8c0, v351);
  // %389 = or %387, 1
  const p_r8c1 = cell(rowIdxAdd(8), 1);
  // store %352 -> %390
  st4(inOut, p_r8c1, v352);
  // %393 = mul(add %28, 9, %31) + %29
  const p_r9c0 = cell(rowIdxAdd(9), 0);
  // store %354 -> %394
  st4(inOut, p_r9c0, v354);
  // %395 = add %393, 1
  const p_r9c1 = cell(rowIdxAdd(9), 1);
  // store %356 -> %396
  st4(inOut, p_r9c1, v356);
  // %399 = mul(add %28, 10, %31) + %29
  const p_r10c0 = cell(rowIdxAdd(10), 0);
  // store %358 -> %400
  st4(inOut, p_r10c0, v358);
  // %401 = or %399, 1
  const p_r10c1 = cell(rowIdxAdd(10), 1);
  // store %360 -> %402
  st4(inOut, p_r10c1, v360);
  // %405 = mul(add %28, 11, %31) + %29
  const p_r11c0 = cell(rowIdxAdd(11), 0);
  // store %361 -> %406
  st4(inOut, p_r11c0, v361);
  // %407 = add %405, 1
  const p_r11c1 = cell(rowIdxAdd(11), 1);
  // store %362 -> %408
  st4(inOut, p_r11c1, v362);
  // %411 = mul(add %28, 12, %31) + %29
  const p_r12c0 = cell(rowIdxAdd(12), 0);
  // store %363 -> %412
  st4(inOut, p_r12c0, v363);
  // %413 = or %411, 1
  const p_r12c1 = cell(rowIdxAdd(12), 1);
  // store %364 -> %414
  st4(inOut, p_r12c1, v364);
  // %417 = mul(add %28, 13, %31) + %29
  const p_r13c0 = cell(rowIdxAdd(13), 0);
  // store %365 -> %418
  st4(inOut, p_r13c0, v365);
  // %419 = add %417, 1
  const p_r13c1 = cell(rowIdxAdd(13), 1);
  // store %366 -> %420
  st4(inOut, p_r13c1, v366);
  // %423 = mul(add %28, 14, %31) + %29
  const p_r14c0 = cell(rowIdxAdd(14), 0);
  // store %307 -> %424     (pure inNum s=29 c0)
  st4(inOut, p_r14c0, v307);
  // %425 = or %423, 1
  const p_r14c1 = cell(rowIdxAdd(14), 1);
  // store %310 -> %426     (pure inNum s=29 c1)
  st4(inOut, p_r14c1, v310);
  // %429 = mul(add %28, 15, %31) + %29
  const p_r15c0 = cell(rowIdxAdd(15), 0);
  // store %315 -> %430     (pure inNum s=30 c0)
  st4(inOut, p_r15c0, v315);
  // %431 = add %429, 1
  const p_r15c1 = cell(rowIdxAdd(15), 1);
  // store %318 -> %432     (pure inNum s=30 c1)
  st4(inOut, p_r15c1, v318);
  // %435 = mul(add %28, 16, %31) + %29
  const p_r16c0 = cell(rowIdxAdd(16), 0);
  // store %323 -> %436     (pure inNum s=31 c0)
  st4(inOut, p_r16c0, v323);
  // %437 = or %435, 1
  const p_r16c1 = cell(rowIdxAdd(16), 1);
  // store %326 -> %438     (pure inNum s=31 c1)
  st4(inOut, p_r16c1, v326);

  // br label %439 ; ret void
}
