// @shader bm3dnr_buf::bm3dnr_buf_blend4x4Row (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend4x4Row.ll
//   (see .ll header @0x7bcd — module bm3dnr_buf::bm3dnr_buf_blend4x4Row)
//
// SIGNATURE (from !14 / !16..!21 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_blend4x4Row"(
//     %params*   addrspace(2)  %0,             // constant buffer
//     <2 x i32>                 %1,             // grid_in (thread pos)
//     <4 x float>* addrspace(1) %2,             // inOut (device RW)
//     <4 x float>* addrspace(1) %3              // inNum (device RO/RW)
//   )
// PARAMS struct (from !18):
//   { i32 m_strideInOut,  // +0
//     i32 m_strideIn,     // +4
//     i32 m_stepInc,      // +8
//     i32 m_offsetY,      // +12
//     u32 m_globalWidth,  // +16
//     u32 m_globalHeight  // +20 }
//
// FAST-MATH: kernel is compiled with `air.compile.fast_math_disable` (!12),
// so fadd is strict IEEE-754. Every fp32 op is fp32-narrowed via Math.fround.
//
// SHAPE:
//   The kernel reads 32 contiguous-rows-of-one-x from inNum, then writes 25
//   sums back to inOut, at a stride of `m_strideInOut` in y and stepped by
//   `8 * m_stepInc` for the row-base. Concretely, if we call
//     y_base = 8 * m_stepInc * (m_offsetY + grid_in.y)
//     addr(k) = grid_in.x + (y_base + k) * m_strideInOut
//   then for k in 0..24 the kernel writes inOut[addr(k)] = value(k), where
//   value(0)  = inOut[addr(0)] + local[0]
//   value(k)  = local[map[k]]       for the pass-through slots, or
//   value(k)  = local[j] + local[j+1] at the 7 fadd rows k in
//              {3, 6, 9, 12, 15, 18, 21} (see mapping below).
//
// LOCAL BUFFER:
//   `%5 = alloca [32 x <4 x float>]` is a per-thread 32-slot scratch that is
//   populated by the internal helper
//     _ZN10bm3dnr_buf17read32x4Float4MemEPU9MTLdeviceDv4_fPS0_iii
//   inlined at %37/%22 which does (in TS terms):
//     for i in 0..31: local[i] = inNum[grid_in.x + (row32 + i) * m_strideIn]
//   where row32 = ((m_offsetY + grid_in.y) << 5).

// The AIR intrinsic `air.compile.denorms_disable` (!11) means f32 denormals
// flush to zero. JS's `Math.fround` uses standard IEEE-754 and does NOT
// FTZ; the kernel's fadds involve values that pass through raw loads/stores
// only, so denormal FTZ would only differ in the 7 fadd rows. This is a
// direct TS mapping; a Metal-parity denormal flush is not modelled here.

/**
 * Params struct read from the constant buffer (!17/!18).
 *  - m_strideInOut: signed 32-bit stride between rows of the RW `inOut`
 *    buffer, in float4-units. Used as an `sext i32` in i64 pointer math.
 *  - m_strideIn:    signed 32-bit stride between rows of the RO `inNum`
 *    buffer (indexes into it via `mul nsw i32` before `sext to i64`).
 *  - m_stepInc:     signed 32-bit multiplier on the y-base. Used as
 *    `sext i32 -> i64 ; shl nsw i64, 3` giving `8 * m_stepInc`.
 *  - m_offsetY:     unsigned bias added to grid_in.y before both stride
 *    computations (as `i32 + i32`).
 *  - m_globalWidth: unsigned upper bound on grid_in.x.
 *  - m_globalHeight: unsigned upper bound on grid_in.y.
 */
export interface Bm3dnrBlend4x4RowParams {
  m_strideInOut: number;
  m_strideIn: number;
  m_stepInc: number;
  m_offsetY: number;
  m_globalWidth: number;
  m_globalHeight: number;
}

/**
 * float4 as a 4-lane fp32 tuple. All lane ops are fp32-narrowed.
 */
export type Float4 = [number, number, number, number];

/** Bit-exact float32 add of two float4 lanes (fp32-narrowed per lane). */
function fadd4(a: Float4, b: Float4): Float4 {
  // %39 = fadd <4 x float> %36, %38  (and the six sibling fadds).
  // fast_math_disable so we do plain lane-wise IEEE add, fp32-narrowed.
  return [
    Math.fround(Math.fround(a[0]) + Math.fround(b[0])),
    Math.fround(Math.fround(a[1]) + Math.fround(b[1])),
    Math.fround(Math.fround(a[2]) + Math.fround(b[2])),
    Math.fround(Math.fround(a[3]) + Math.fround(b[3])),
  ];
}

/**
 * bm3dnr_buf::bm3dnr_buf_blend4x4Row — one thread of the kernel.
 *
 * @param params   the constant-buffer struct (see !17/!18)
 * @param grid_in  <2 x i32> thread position (grid_in.x = %1[0], grid_in.y = %1[1])
 * @param inOut    the RW device buffer (as float4[])
 * @param inNum    the RO device buffer (as float4[])
 *
 * Line-by-line correspondence to the IR:
 *   %6  = extractelement %1, i64 0                 // grid_in.x
 *   %7  = params.m_globalWidth
 *   %8  = load %7
 *   %9  = icmp ult %6, %8                          // x < width
 *   br %9, cont0, exit                             // @L10 or @L205
 *  cont0:
 *   %11 = extractelement %1, i64 1                 // grid_in.y
 *   %12 = params.m_globalHeight
 *   %13 = load %12
 *   %14 = icmp ult %11, %13                        // y < height
 *   br %14, cont1, exit
 *  cont1:
 *   %17 = load m_strideInOut
 *   %19 = load m_strideIn
 *   %21 = load m_stepInc
 *   %25 = load m_offsetY
 *   %26 = m_offsetY + grid_in.y                    // add i32
 *   %27 = zext %26 to i64
 *   %28 = sext m_stepInc to i64
 *   %29 = shl nsw i64 %28, 3                       // 8 * m_stepInc
 *   %30 = mul i64 %29, %27                         // 8 * m_stepInc * (m_offsetY+y)
 *   %31 = shl i32 %26, 5                           // 32 * (m_offsetY+y)  (for inNum row base)
 *   %32 = sext m_strideInOut to i64
 *   %33 = mul i64 %30, %32
 *   %34 = add i64 %33, %23                         // %23 = zext grid_in.x
 *   %35 = &inOut[%34]                              // row 0 address
 *   %36 = load %35                                 // globalload row 0
 *   ...  helper populates local[0..31] via 32 GEPs into inNum
 *   %39 = fadd %36, local[0]
 *   store %39 -> row 0
 *   ...  (24 further stores to rows 1..24 as tabulated below)
 */
export function bm3dnr_buf_blend4x4Row(
  params: Bm3dnrBlend4x4RowParams,
  grid_in: [number, number],
  inOut: Float4[],
  inNum: Float4[],
): void {
  // Bounds gate: both x < width AND y < height (unsigned compare via >>> 0).
  const x = grid_in[0] >>> 0;                              // %6
  const y = grid_in[1] >>> 0;                              // %11
  if ((x >>> 0) >= (params.m_globalWidth >>> 0)) return;   // %9 false -> exit @%205
  if ((y >>> 0) >= (params.m_globalHeight >>> 0)) return;  // %14 false -> exit @%205

  // Load the six struct fields (%17, %19, %21, %25). m_strideInOut,
  // m_strideIn, m_stepInc, m_offsetY are all i32 with sign-extension
  // semantics on the multiplies; use `| 0` to pin i32 arithmetic and
  // fall through to Number for the i64 result (JS integers up to 2^53).
  const strideInOut = params.m_strideInOut | 0;    // %17
  const strideIn    = params.m_strideIn | 0;       // %19
  const stepInc     = params.m_stepInc | 0;        // %21
  const offsetY     = params.m_offsetY | 0;        // %25

  // %26 = m_offsetY + grid_in.y (i32 add — no wraparound guard, matches IR).
  const yBiased = (offsetY + (y | 0)) | 0;
  // %30 = (8 * stepInc) * yBiased  (all in i64)
  const stepInc_x8 = 8 * stepInc;                  // %29 = shl 3
  const rowBase64  = stepInc_x8 * yBiased;         // %30
  // %31 = (yBiased << 5) — the i32 row-index passed to the helper as arg %3.
  //       Note the IR does a plain `shl` on the i32 yBiased before any sign
  //       or zero extension; that matches multiplication by 32 in unsigned
  //       semantics for our (non-negative) inputs.
  const helperRow32 = (yBiased * 32) | 0;          // %31

  // Base address into inOut for row k=0 (see %33/%34/%35):
  //   addr(k) = x + (rowBase64 + k) * strideInOut
  // Compute the row-0 base once, then step by strideInOut per k.
  const addr = (k: number) => x + (rowBase64 + k) * strideInOut;

  // Populate local[0..31] via the inlined helper
  //   _ZN10bm3dnr_buf17read32x4Float4MemEPU9MTLdeviceDv4_fPS0_iii
  // which was declared `internal fastcc` and does, per its body @L206..L262:
  //   for i in 0..31: local[i] = inNum[x + (helperRow32 + i) * strideIn]
  // (The helper mixes an initial i==0 store without an outer index and then
  //  builds indices 1..31 by literal add; the effect is a straight strided
  //  read into local[0..31].)
  const local: Float4[] = new Array(32);
  for (let i = 0; i < 32; i++) {
    // Helper body: %6 = strideIn*helperRow32 + x is the i==0 read;
    // for i>0 the helper does add i32 helperRow32, i then mul strideIn.
    // Both formulations are algebraically identical for our sane inputs.
    const idx = x + (helperRow32 + i) * strideIn;
    local[i] = inNum[idx];
  }

  // Row 0: %36 = load inOut[addr(0)] ; %39 = fadd %36, local[0] ; store %39.
  inOut[addr(0)] = fadd4(inOut[addr(0)], local[0]);

  // Rows 1..24. Mapping recovered by tracing every `store <4 x float>` in
  // the IR back through its GEP and value-origin (see the .ll for the raw
  // %numbers). Seven of the rows come from a pairwise fadd of adjacent
  // local slots; the other 18 rows are direct pass-throughs.
  //
  // The `or i64 %30, N` variant is used for N in 1..7 (bits below the low
  // 3 bits of %30 are known zero because %30 = 8 * stepInc * yBiased); the
  // `add i64 %30, N` variant is used for N >= 8. Both produce the same
  // integer row-index; we use plain `+` here since JS Numbers do not
  // preserve the compiler's or-vs-add split.

  // Row 1: store local[1]                @L%76 -> %80
  inOut[addr(1)] = local[1];
  // Row 2: store local[2]                @L%82 -> %86
  inOut[addr(2)] = local[2];
  // Row 3: store fadd(local[3], local[4])  @L%44 -> %90    (%44 = fadd %41,%43)
  inOut[addr(3)] = fadd4(local[3], local[4]);
  // Row 4: store local[5]                @L%92 -> %96
  inOut[addr(4)] = local[5];
  // Row 5: store local[6]                @L%98 -> %102
  inOut[addr(5)] = local[6];
  // Row 6: store fadd(local[7], local[8])  @L%49 -> %106   (%49 = fadd %46,%48)
  inOut[addr(6)] = fadd4(local[7], local[8]);
  // Row 7: store local[9]                @L%108 -> %112
  inOut[addr(7)] = local[9];
  // Row 8: store local[10]               @L%114 -> %118
  inOut[addr(8)] = local[10];
  // Row 9: store fadd(local[11], local[12]) @L%54 -> %122  (%54 = fadd %51,%53)
  inOut[addr(9)] = fadd4(local[11], local[12]);
  // Row 10: store local[13]              @L%124 -> %128
  inOut[addr(10)] = local[13];
  // Row 11: store local[14]              @L%130 -> %134
  inOut[addr(11)] = local[14];
  // Row 12: store fadd(local[15], local[16]) @L%59 -> %138 (%59 = fadd %56,%58)
  inOut[addr(12)] = fadd4(local[15], local[16]);
  // Row 13: store local[17]              @L%140 -> %144
  inOut[addr(13)] = local[17];
  // Row 14: store local[18]              @L%146 -> %150
  inOut[addr(14)] = local[18];
  // Row 15: store fadd(local[19], local[20]) @L%64 -> %154 (%64 = fadd %61,%63)
  inOut[addr(15)] = fadd4(local[19], local[20]);
  // Row 16: store local[21]              @L%156 -> %160
  inOut[addr(16)] = local[21];
  // Row 17: store local[22]              @L%162 -> %166
  inOut[addr(17)] = local[22];
  // Row 18: store fadd(local[23], local[24]) @L%69 -> %170 (%69 = fadd %66,%68)
  inOut[addr(18)] = fadd4(local[23], local[24]);
  // Row 19: store local[25]              @L%172 -> %176
  inOut[addr(19)] = local[25];
  // Row 20: store local[26]              @L%178 -> %182
  inOut[addr(20)] = local[26];
  // Row 21: store fadd(local[27], local[28]) @L%74 -> %186 (%74 = fadd %71,%73)
  inOut[addr(21)] = fadd4(local[27], local[28]);
  // Row 22: store local[29]              @L%188 -> %192
  inOut[addr(22)] = local[29];
  // Row 23: store local[30]              @L%194 -> %198
  inOut[addr(23)] = local[30];
  // Row 24: store local[31]              @L%200 -> %204
  inOut[addr(24)] = local[31];

  // br label %205 ; ret void.
}
