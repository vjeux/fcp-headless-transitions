// @shader bm3dnr_buf_blend4x4Column (HeliumSenso) — .ll header offset @0x000000000000678d
//
// Metal compute kernel from HeliumSenso's BM3D-based Noise Reduction
// pipeline. Blends one 4-tap column of a 4x4-Gaussian-weighted block
// pattern into a scratch `inOut` buffer. For each grid position (x, y)
// inside (globalWidth, globalHeight) the kernel:
//   1) picks the y-th row of the 4x4 Gaussian weight table
//      `weight4x4[y & 3]` — a bit-exact IEEE-754 4-tap kernel:
//        row 0/3: {0.0019, 0.031, 0.031, 0.0019}
//        row 1/2: {0.031,  0.4994, 0.4994, 0.031}
//   2) reads 8 consecutive vec4s from `input` at column base
//        (offsetX + x) * 8 + strideIn * y
//   3) multiplies each by the picked weight row
//   4) accumulates the first element into inOut[colBase + 0] (a
//      column-column accumulator) and unpacks the 8 vec4s into a linear
//      25-float run in inOut[colBase..colBase+24], with the 4-way
//      boundary elements OVERLAP-ADDED (v_k[3] + v_{k+1}[0]).
// The .metallib label spells the shader name as
// `bm3dnr_buf::bm3dnr_buf_blend4x4Column` (nested C++-namespace),
// preserved in the .ll `source_filename` and function symbol.
//
// Source LLVM IR: raw-port/re/shaders/bm3dnr_buf_blend4x4Column.ll
// Extracted from: HeliumSenso.framework/Versions/A/Resources/
//                   default.metallib
// (via `bash raw-port/tools/shader_disasm.sh
//        "bm3dnr_buf::bm3dnr_buf_blend4x4Column" HeliumSenso`)
//
// AIR signature (from the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_blend4x4Column"(
//     bm3dnr_buf_blend4x4Column_params* %0,  // params (constant, 24B)
//     <2 x i32>                          %1, // grid_in
//     float*                             %2, // inOut (read/write)
//     <4 x float>*                       %3  // input (read/write)
//   )
//
// air.struct_type_info spelled out in metadata !18 for `params`:
//   struct bm3dnr_buf_blend4x4Column_params {
//     int  m_strideInOut;  // @0  — element stride of inOut columns
//     int  m_strideIn;     // @4  — element stride of input rows (in vec4s)
//     int  m_stepInc;      // @8  — unused by this kernel (loaded but
//                          //       never referenced downstream)
//     int  m_offsetX;      // @12 — column offset added to grid.x
//     uint m_globalWidth;  // @16 — early-out ceiling for grid.x
//     uint m_globalHeight; // @20 — early-out ceiling for grid.y
//   };  // 24 bytes total
//
// Function attributes: `argmemonly`, `norecurse`, `nounwind`,
// `air.compile.denorms_disable`, `air.compile.fast_math_disable` — this
// kernel opts OUT of fast-math so all f32 arithmetic must follow IEEE
// rounding. This port uses plain JS Number arithmetic (already IEEE-754
// fp64) narrowed with Math.fround at every stored intermediate for f32
// fidelity.
//
// The `weight4x4` constant, decoded lane-by-lane from the .ll
// `[4 x <4 x float>]` literal:
//   0x3F5F212D80000000 -> 0.0019000000320374966 (bit-exact f32)
//   0x3F9FBE76C0000000 -> 0.03099999949336052   (bit-exact f32)
//   0x3FDFF62B60000000 -> 0.49939998984336853   (bit-exact f32)
// So the table is:
//   row 0: [0.0019, 0.031, 0.031, 0.0019]
//   row 1: [0.031,  0.4994, 0.4994, 0.031]
//   row 2: [0.031,  0.4994, 0.4994, 0.031]
//   row 3: [0.0019, 0.031, 0.031, 0.0019]
// Each row sums to ~1.0625 and the whole 16 entries sum to ~1.0 — this
// is a 4x4 Gaussian-blur-like filter kernel commonly used by BM3D block
// matching.
//
// IR line map (selected key lines; the full body is 260 lines of
// straight-line stores):
//   %5  extractelement grid_in, i64 0                -> x
//   %7  load m_globalWidth                            -> gW
//   %8  icmp ult x, gW                               -> x < gW
//   br %8 -> label 9 : label 164 (early-out)
//   %10 extractelement grid_in, i64 1                -> y
//   %12 load m_globalHeight                          -> gH
//   %13 icmp ult y, gH                               -> y < gH
//   br %13 -> label 14 : label 164 (early-out)
//   %16 load m_strideInOut                           -> strideInOut
//   %18 load m_strideIn                              -> strideIn
//   %20 load m_stepInc                               -> stepInc (unused)
//   %22 load m_offsetX                               -> offsetX
//   %23 add offsetX, x                               -> baseX = offsetX + x
//   %27 shl strideInOut, 3                           -> strideInOut * 8
//   %28 mul (strideInOut * 8), baseX                 -> outColByte
//   %29 and y, 3                                     -> rowMod4 = y & 3
//   %31 mul strideIn, y                              -> rowIn = strideIn*y
//   %32 add %28, %31                                 -> colInOutBase
//   %34 load inOut[colInOutBase]                     -> acc (the running
//                                                       column accumulator)
//   %35 <4xf32>{acc, 0, 0, 0}
//   %38 load weight4x4[rowMod4]                      -> w (<4xf32>)
//   %41 shl baseX, 3                                 -> baseX * 8
//   %42 add %41, %31                                 -> colInBase (in vec4s)
//   %44,%48,%52,%56,%60,%64,%68,%72 = load 8 consecutive vec4s from input
//     at colInBase..colInBase+7                       -> in0..in7
//   %45,%49,%53,%57,%61,%65,%69,%73 = fmul w, in_k    -> v0..v7
//   %76 = v0[3] + v1[0]      ; %77 = v0 with lane3 -> %76
//   %80 = v1[3] + v2[0]
//   %83 = v2[3] + v3[0]
//   %86 = v3[3] + v4[0]
//   %89 = v4[3] + v5[0]
//   %92 = v5[3] + v6[0]
//   %95 = v6[3] + v7[0]
//   %96 = %35 + %77          -> [acc+v0[0], v0[1], v0[2], v0[3]+v1[0]]
//   store %96[0..3] to inOut[colInOutBase + 0..3]
//   store v1[1], v1[2], %80 to inOut[+4..+6]
//   store v2[1], v2[2], %83 to inOut[+7..+9]
//   store v3[1], v3[2], %86 to inOut[+10..+12]
//   store v4[1], v4[2], %89 to inOut[+13..+15]
//   store v5[1], v5[2], %92 to inOut[+16..+18]
//   store v6[1], v6[2], %95 to inOut[+19..+21]
//   store v7[1], v7[2], v7[3] to inOut[+22..+24]
//   ret void

/**
 * Params struct for `bm3dnr_buf::bm3dnr_buf_blend4x4Column`, matching the
 * air.struct_type_info layout in !18 of the .ll.
 */
export interface Bm3DnrBufBlend4x4ColumnParams {
  /** Element stride of the inOut columns (offset @0). */
  readonly m_strideInOut: number;
  /** Element stride of the input rows in <4xf32> units (offset @4). */
  readonly m_strideIn: number;
  /** Step increment (offset @8). Loaded but not referenced by this kernel. */
  readonly m_stepInc: number;
  /** Column offset added to grid.x (offset @12). */
  readonly m_offsetX: number;
  /** Grid width ceiling — early-out when grid.x >= this (offset @16, uint). */
  readonly m_globalWidth: number;
  /** Grid height ceiling — early-out when grid.y >= this (offset @20, uint). */
  readonly m_globalHeight: number;
}

/**
 * The 4x4 Gaussian-ish weight table baked into the .ll as
 *   `@_ZN10bm3dnr_bufL9weight4x4E`.
 * Bit-exact f32 values from the LLVM double literals (see file header).
 * Table is exposed for testability; the kernel picks a row by `y & 3`.
 */
export const WEIGHT_4X4: readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
] = [
  [
    Math.fround(0.0019000000320374966),
    Math.fround(0.03099999949336052),
    Math.fround(0.03099999949336052),
    Math.fround(0.0019000000320374966),
  ],
  [
    Math.fround(0.03099999949336052),
    Math.fround(0.49939998984336853),
    Math.fround(0.49939998984336853),
    Math.fround(0.03099999949336052),
  ],
  [
    Math.fround(0.03099999949336052),
    Math.fround(0.49939998984336853),
    Math.fround(0.49939998984336853),
    Math.fround(0.03099999949336052),
  ],
  [
    Math.fround(0.0019000000320374966),
    Math.fround(0.03099999949336052),
    Math.fround(0.03099999949336052),
    Math.fround(0.0019000000320374966),
  ],
];

/**
 * `bm3dnr_buf::bm3dnr_buf_blend4x4Column` — HeliumSenso Metal compute
 * kernel. Runs for a single grid position (gridX, gridY); the caller is
 * responsible for dispatching the full grid.
 *
 * Buffers are modeled as `Float32Array`s to preserve the .ll's f32
 * semantics (the kernel does NOT run under fast-math). `inOut` is
 * indexed as a flat float array; `input` is indexed as if it were a
 * `Float32Array` view over a `<4 x float>*` — every four consecutive
 * elements form one vec4, so index `n * 4 + lane` selects vec4[n] lane
 * `lane`.
 *
 * See file header for the full IR-line-to-code map.
 *
 * @param params  the 24-byte params struct
 * @param gridX   thread position X (grid_in.x)
 * @param gridY   thread position Y (grid_in.y)
 * @param inOut   read/write float scratch buffer
 * @param input   read/write vec4-of-float source buffer (packed as
 *                consecutive Float32 quads)
 */
export function bm3dnr_buf_blend4x4Column(
  params: Bm3DnrBufBlend4x4ColumnParams,
  gridX: number,
  gridY: number,
  inOut: Float32Array,
  input: Float32Array,
): void {
  // %5 = x, %7 = m_globalWidth, %8 = x < gW.
  //   The .ll uses `icmp ult` (unsigned less-than) matching the fact that
  //   m_globalWidth is a `uint` (see !18).
  const gW: number = params.m_globalWidth >>> 0;
  const x: number = gridX >>> 0;
  if (!(x < gW)) {
    // br to label 164 -> ret void
    return;
  }
  // %10 = y, %12 = m_globalHeight, %13 = y < gH.
  const gH: number = params.m_globalHeight >>> 0;
  const y: number = gridY >>> 0;
  if (!(y < gH)) {
    return;
  }

  // %16..%22 = load the four params ints (stride ints are C `int` -> signed).
  const strideInOut: number = params.m_strideInOut | 0;
  const strideIn: number = params.m_strideIn | 0;
  // %20 = load m_stepInc — the .ll loads it but never uses it. We match:
  //   drop the value on the floor (a JS engine will DCE the read).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _stepInc: number = params.m_stepInc | 0;
  const offsetX: number = params.m_offsetX | 0;

  // %23 = add offsetX, x  — the .ll treats x as i32 so this is 32-bit
  //   wrap-around addition. `+ x >>> 0` reifies uint semantics.
  const baseX: number = ((offsetX + x) | 0) >>> 0;
  // %24, %25 = zext (baseX -> i64), (y -> i64) — 64-bit widening below.
  //   JS Numbers hold full 53-bit ints so we compute in plain arithmetic.
  const baseX64: number = baseX;
  const y64: number = y;

  // %27 = shl (sext strideInOut), 3 — signed strideInOut * 8.
  const strideInOutTimes8: number = strideInOut * 8;
  // %28 = mul %27, baseX
  const outColByte: number = strideInOutTimes8 * baseX64;
  // %29 = and y, 3 — pick weight row.
  const rowMod4: number = y & 3;
  // %31 = mul (sext strideIn), y64
  const rowIn: number = strideIn * y64;
  // %32 = add %28, %31 — colInOutBase.
  const colInOutBase: number = outColByte + rowIn;

  // %33/%34 = load inOut[colInOutBase] — the running column accumulator.
  const acc: number = Math.fround(inOut[colInOutBase]);

  // %38 = load weight4x4[rowMod4] — a <4xf32>.
  const wRow = WEIGHT_4X4[rowMod4];
  const w0: number = Math.fround(wRow[0]);
  const w1: number = Math.fround(wRow[1]);
  const w2: number = Math.fround(wRow[2]);
  const w3: number = Math.fround(wRow[3]);

  // %41 = shl baseX, 3   — baseX * 8 (baseX is unsigned; nuw/nsw guaranteed).
  const baseXTimes8: number = baseX64 * 8;
  // %42 = add %41, %31   — colInBase in <vec4> units.
  const colInBaseVec4: number = baseXTimes8 + rowIn;
  // The Float32Array is a flat view over vec4s, so vec4-index k
  // corresponds to float-index k*4.
  const inFloatBase: number = colInBaseVec4 * 4;

  // Read the 8 consecutive vec4s in0..in7 as (4-tuples of f32).
  const in0_0: number = Math.fround(input[inFloatBase + 0 * 4 + 0]);
  const in0_1: number = Math.fround(input[inFloatBase + 0 * 4 + 1]);
  const in0_2: number = Math.fround(input[inFloatBase + 0 * 4 + 2]);
  const in0_3: number = Math.fround(input[inFloatBase + 0 * 4 + 3]);
  const in1_0: number = Math.fround(input[inFloatBase + 1 * 4 + 0]);
  const in1_1: number = Math.fround(input[inFloatBase + 1 * 4 + 1]);
  const in1_2: number = Math.fround(input[inFloatBase + 1 * 4 + 2]);
  const in1_3: number = Math.fround(input[inFloatBase + 1 * 4 + 3]);
  const in2_0: number = Math.fround(input[inFloatBase + 2 * 4 + 0]);
  const in2_1: number = Math.fround(input[inFloatBase + 2 * 4 + 1]);
  const in2_2: number = Math.fround(input[inFloatBase + 2 * 4 + 2]);
  const in2_3: number = Math.fround(input[inFloatBase + 2 * 4 + 3]);
  const in3_0: number = Math.fround(input[inFloatBase + 3 * 4 + 0]);
  const in3_1: number = Math.fround(input[inFloatBase + 3 * 4 + 1]);
  const in3_2: number = Math.fround(input[inFloatBase + 3 * 4 + 2]);
  const in3_3: number = Math.fround(input[inFloatBase + 3 * 4 + 3]);
  const in4_0: number = Math.fround(input[inFloatBase + 4 * 4 + 0]);
  const in4_1: number = Math.fround(input[inFloatBase + 4 * 4 + 1]);
  const in4_2: number = Math.fround(input[inFloatBase + 4 * 4 + 2]);
  const in4_3: number = Math.fround(input[inFloatBase + 4 * 4 + 3]);
  const in5_0: number = Math.fround(input[inFloatBase + 5 * 4 + 0]);
  const in5_1: number = Math.fround(input[inFloatBase + 5 * 4 + 1]);
  const in5_2: number = Math.fround(input[inFloatBase + 5 * 4 + 2]);
  const in5_3: number = Math.fround(input[inFloatBase + 5 * 4 + 3]);
  const in6_0: number = Math.fround(input[inFloatBase + 6 * 4 + 0]);
  const in6_1: number = Math.fround(input[inFloatBase + 6 * 4 + 1]);
  const in6_2: number = Math.fround(input[inFloatBase + 6 * 4 + 2]);
  const in6_3: number = Math.fround(input[inFloatBase + 6 * 4 + 3]);
  const in7_0: number = Math.fround(input[inFloatBase + 7 * 4 + 0]);
  const in7_1: number = Math.fround(input[inFloatBase + 7 * 4 + 1]);
  const in7_2: number = Math.fround(input[inFloatBase + 7 * 4 + 2]);
  const in7_3: number = Math.fround(input[inFloatBase + 7 * 4 + 3]);

  // fmul w, in_k — elementwise. Note fast_math_DISABLE, so plain IEEE.
  const v0_0: number = Math.fround(w0 * in0_0);
  const v0_1: number = Math.fround(w1 * in0_1);
  const v0_2: number = Math.fround(w2 * in0_2);
  const v0_3: number = Math.fround(w3 * in0_3);
  const v1_0: number = Math.fround(w0 * in1_0);
  const v1_1: number = Math.fround(w1 * in1_1);
  const v1_2: number = Math.fround(w2 * in1_2);
  const v1_3: number = Math.fround(w3 * in1_3);
  const v2_0: number = Math.fround(w0 * in2_0);
  const v2_1: number = Math.fround(w1 * in2_1);
  const v2_2: number = Math.fround(w2 * in2_2);
  const v2_3: number = Math.fround(w3 * in2_3);
  const v3_0: number = Math.fround(w0 * in3_0);
  const v3_1: number = Math.fround(w1 * in3_1);
  const v3_2: number = Math.fround(w2 * in3_2);
  const v3_3: number = Math.fround(w3 * in3_3);
  const v4_0: number = Math.fround(w0 * in4_0);
  const v4_1: number = Math.fround(w1 * in4_1);
  const v4_2: number = Math.fround(w2 * in4_2);
  const v4_3: number = Math.fround(w3 * in4_3);
  const v5_0: number = Math.fround(w0 * in5_0);
  const v5_1: number = Math.fround(w1 * in5_1);
  const v5_2: number = Math.fround(w2 * in5_2);
  const v5_3: number = Math.fround(w3 * in5_3);
  const v6_0: number = Math.fround(w0 * in6_0);
  const v6_1: number = Math.fround(w1 * in6_1);
  const v6_2: number = Math.fround(w2 * in6_2);
  const v6_3: number = Math.fround(w3 * in6_3);
  const v7_0: number = Math.fround(w0 * in7_0);
  const v7_1: number = Math.fround(w1 * in7_1);
  const v7_2: number = Math.fround(w2 * in7_2);
  const v7_3: number = Math.fround(w3 * in7_3);

  // Overlap-add pairs at every 4-way boundary (%76,%80,%83,%86,%89,%92,%95).
  const b_v0_3_v1_0: number = Math.fround(v0_3 + v1_0);
  const b_v1_3_v2_0: number = Math.fround(v1_3 + v2_0);
  const b_v2_3_v3_0: number = Math.fround(v2_3 + v3_0);
  const b_v3_3_v4_0: number = Math.fround(v3_3 + v4_0);
  const b_v4_3_v5_0: number = Math.fround(v4_3 + v5_0);
  const b_v5_3_v6_0: number = Math.fround(v5_3 + v6_0);
  const b_v6_3_v7_0: number = Math.fround(v6_3 + v7_0);

  // %96 = <acc,0,0,0> + <v0_0, v0_1, v0_2, b_v0_3_v1_0>
  // Only lane 0 gains the accumulator; the .ll's %35 is
  //   `<undef, 0, 0, 0>` in the poison-preserved form, but the store to
  //   lane 0 immediately overwrites the undef with acc + v0_0.
  const out0: number = Math.fround(acc + v0_0);
  const out1: number = v0_1;
  const out2: number = v0_2;
  const out3: number = b_v0_3_v1_0;

  // Straight-line writes matching the store schedule in the .ll.
  inOut[colInOutBase + 0] = out0;
  inOut[colInOutBase + 1] = out1;
  inOut[colInOutBase + 2] = out2;
  inOut[colInOutBase + 3] = out3;
  inOut[colInOutBase + 4] = v1_1;
  inOut[colInOutBase + 5] = v1_2;
  inOut[colInOutBase + 6] = b_v1_3_v2_0;
  inOut[colInOutBase + 7] = v2_1;
  inOut[colInOutBase + 8] = v2_2;
  inOut[colInOutBase + 9] = b_v2_3_v3_0;
  inOut[colInOutBase + 10] = v3_1;
  inOut[colInOutBase + 11] = v3_2;
  inOut[colInOutBase + 12] = b_v3_3_v4_0;
  inOut[colInOutBase + 13] = v4_1;
  inOut[colInOutBase + 14] = v4_2;
  inOut[colInOutBase + 15] = b_v4_3_v5_0;
  inOut[colInOutBase + 16] = v5_1;
  inOut[colInOutBase + 17] = v5_2;
  inOut[colInOutBase + 18] = b_v5_3_v6_0;
  inOut[colInOutBase + 19] = v6_1;
  inOut[colInOutBase + 20] = v6_2;
  inOut[colInOutBase + 21] = b_v6_3_v7_0;
  inOut[colInOutBase + 22] = v7_1;
  inOut[colInOutBase + 23] = v7_2;
  inOut[colInOutBase + 24] = v7_3;
  // ret void
}
