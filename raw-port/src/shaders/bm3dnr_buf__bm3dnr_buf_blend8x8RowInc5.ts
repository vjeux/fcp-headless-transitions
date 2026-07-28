// @shader bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5 (HeliumSenso)
//
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib
// (BM3D denoiser buffer helper — row blend of a 23-row × 2-col output
//  strip fed by a 32-row × 2-col numerator source, with a lag-3
//  three-tile fold at the middle of each 8-row group). IR at
//  raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blend8x8RowInc5.ll
//  (header @0x0000000001391d).
//
// Direct TS mapping of the AIR IR. Params struct (metadata !18):
//   [0] strideInOut     (`inOut` <4 x float> row stride)
//   [1] strideIn        (`inNum` <4 x float> row stride)
//   [2] stepInc         (dst BLOCK stride — see below)
//   [3] offsetY         (integer shift added to gid.y for the dst base row)
//   [4] globalWidth     (bound on gid.x)
//   [5] globalHeight    (bound on gid.y)
//
// Buffers:
//   %2 = inOut  <4 x float>*  destination — 6 loads + 46 stores.
//                             The kernel reads rows 0..2 and writes rows 0..22.
//   %3 = inNum  <4 x float>*  source numerator — 64 loads (32 rows × 2 cols).
//   %1 = gid    <2 x i32>     thread position in grid
//
// Address math (from IR):
//   %27 = shl stepInc, 2 = stepInc * 4  (dst row-base multiplier)
//   %28 = mul %27, (offsetY + gid.y)    (dst row-base for row 0)
//   %29 = shl gid.x, 1 = gid.x * 2       (dst/src column base — inOut and
//                                         inNum share the same col base)
//   %30 = shl gid.x, 5 = gid.x * 32      (src row-base — 32 rows/thread)
//   %31 = strideInOut, %55 = strideIn
//
// Kernel logic (direct TS mapping):
//
//   1. bounds check gid.x < globalWidth and gid.y < globalHeight — else no-op
//
//   2. compute base addressing (see above).
//
//   3. load 6 dst tiles (rows 0..2, cols 0..1):
//        D[r][c] = inOut[dstIdx(r, c)]     for r ∈ 0..2, c ∈ 0..1
//      IR: %35 = D[0][0]  ; %38 = D[0][1]
//          %43 = D[1][0]  ; %46 = D[1][1]
//          %51 = D[2][0]  ; %54 = D[2][1]
//
//   4. load 64 src tiles (rows 0..31, cols 0..1):
//        S[s][c] = inNum[srcIdx(s, c)]     for s ∈ 0..31, c ∈ 0..1
//      IR: %59 = S[0][0]  ; %62 = S[0][1]  (row-base = %30 | 0)
//          %67 = S[1][0]  ; %70 = S[1][1]  (row-base = %30 | 1)
//          ... in the direct or-N pattern, N ∈ 0..31 (low 5 bits clear).
//          %307 = S[31][0] ; %310 = S[31][1]
//
//   5. compute the 46 output tiles (23 rows × 2 cols).
//
//      The IR fadds only 24 values (%311..%334) — the remaining 22
//      output tiles are DIRECT source copies stored without any fadd.
//
//      IR fadds (each `fadd <4 x float>` — cited by result SSA):
//        %311 = D[0][0] + S[0][0]       (row 0, col 0)
//        %312 = D[0][1] + S[0][1]       (row 0, col 1)
//        %313 = D[1][0] + S[1][0]       (row 1, col 0)
//        %314 = D[1][1] + S[1][1]       (row 1, col 1)
//        %315 = D[2][0] + S[2][0]       (row 2, col 0)
//        %316 = D[2][1] + S[2][1]       (row 2, col 1)
//        %317 = S[5][0]  + S[8][0]      (row 5, col 0)
//        %318 = S[5][1]  + S[8][1]      (row 5, col 1)
//        %319 = S[6][0]  + S[9][0]      (row 6, col 0)
//        %320 = S[6][1]  + S[9][1]      (row 6, col 1)
//        %321 = S[7][0]  + S[10][0]     (row 7, col 0)
//        %322 = S[7][1]  + S[10][1]     (row 7, col 1)
//        %323 = S[13][0] + S[16][0]     (row 10, col 0)
//        %324 = S[13][1] + S[16][1]     (row 10, col 1)
//        %325 = S[14][0] + S[17][0]     (row 11, col 0)
//        %326 = S[14][1] + S[17][1]     (row 11, col 1)
//        %327 = S[15][0] + S[18][0]     (row 12, col 0)
//        %328 = S[15][1] + S[18][1]     (row 12, col 1)
//        %329 = S[21][0] + S[24][0]     (row 15, col 0)
//        %330 = S[21][1] + S[24][1]     (row 15, col 1)
//        %331 = S[22][0] + S[25][0]     (row 16, col 0)
//        %332 = S[22][1] + S[25][1]     (row 16, col 1)
//        %333 = S[23][0] + S[26][0]     (row 17, col 0)
//        %334 = S[23][1] + S[26][1]     (row 17, col 1)
//
//   6. store 46 <4 x float> tiles to inOut. Rows and their sources:
//
//      Row  0: D[0]  + S[0]          (%311/%312, IR stores @%34,%37)
//      Row  1: D[1]  + S[1]          (%313/%314, IR stores @%42,%45)
//      Row  2: D[2]  + S[2]          (%315/%316, IR stores @%50,%53)
//      Row  3: S[3]                  (direct — %83/%86, IR stores @%338,%340)
//      Row  4: S[4]                  (direct — %91/%94, IR stores @%344,%346)
//      Row  5: S[5]  + S[8]          (%317/%318, IR stores @%350,%352)
//      Row  6: S[6]  + S[9]          (%319/%320, IR stores @%356,%358)
//      Row  7: S[7]  + S[10]         (%321/%322, IR stores @%362,%364)
//      Row  8: S[11]                 (direct — %147/%150, IR stores @%368,%370)
//      Row  9: S[12]                 (direct — %155/%158, IR stores @%374,%376)
//      Row 10: S[13] + S[16]         (%323/%324, IR stores @%380,%382)
//      Row 11: S[14] + S[17]         (%325/%326, IR stores @%386,%388)
//      Row 12: S[15] + S[18]         (%327/%328, IR stores @%392,%394)
//      Row 13: S[19]                 (direct — %211/%214, IR stores @%398,%400)
//      Row 14: S[20]                 (direct — %219/%222, IR stores @%404,%406)
//      Row 15: S[21] + S[24]         (%329/%330, IR stores @%410,%412)
//      Row 16: S[22] + S[25]         (%331/%332, IR stores @%416,%418)
//      Row 17: S[23] + S[26]         (%333/%334, IR stores @%422,%424)
//      Row 18: S[27]                 (direct — %275/%278, IR stores @%428,%430)
//      Row 19: S[28]                 (direct — %283/%286, IR stores @%434,%436)
//      Row 20: S[29]                 (direct — %291/%294, IR stores @%440,%442)
//      Row 21: S[30]                 (direct — %299/%302, IR stores @%446,%448)
//      Row 22: S[31]                 (direct — %307/%310, IR stores @%452,%454)
//
// Grouping pattern: 23 output rows partition into an initial 3-row "dst+src"
// prefix (rows 0..2), followed by four 5-row "lag-3 fold" groups (rows
// 3..7, 8..12, 13..17, 18..22) — but the final group (18..22) is direct
// copies only (no fadd). Within each 5-row fold group the middle three
// rows fadd source[start] with source[start+3] (lag-3 within the same
// 8-row source window), while the two edge rows are direct copies.
//
// Faithful transcription — every IR op maps to a direct TS operation.
// fp32-narrowed everywhere the AIR type is <4 x float> / .f32.

/**
 * Params struct addressed at `%0` (six i32 fields). Names from metadata
 * !18 in the IR:
 *   [0] strideInOut     (<4 x float>-buffer row stride for `inOut`)
 *   [1] strideIn        (<4 x float>-buffer row stride for `inNum`)
 *   [2] stepInc         (dst BLOCK stride — multiplied by 4 in the IR
 *                        (`shl 2`) and then by (offsetY + gid.y); see @%27,%28)
 *   [3] offsetY         (signed shift added to gid.y for the dst base)
 *   [4] globalWidth     (bound on gid.x)
 *   [5] globalHeight    (bound on gid.y)
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5 (HeliumSenso)
 * @see %6   (field4 = globalWidth)
 * @see %11  (field5 = globalHeight)
 * @see %15  (field0 = strideInOut)
 * @see %17  (field1 = strideIn)
 * @see %19  (field2 = stepInc)
 * @see %22  (field3 = offsetY)
 */
export interface Bm3dnrBufBlend8x8RowInc5Params {
  strideInOut: number;
  strideIn: number;
  stepInc: number;
  offsetY: number;
  globalWidth: number;
  globalHeight: number;
}

/** `<4 x float>` load/store lane. */
export type Float4 = readonly [number, number, number, number];

/**
 * Read-write accessor for the `<4 x float>` destination buffer `inOut`.
 * Indexed by linear `<4 x float>` element index (matches IR's GEP shape).
 */
export interface Float4RWBuffer {
  load(index: number): Float4;
  store(index: number, value: Float4): void;
}

/**
 * Read-only accessor for the `<4 x float>` source buffer `inNum`.
 * Indexed by linear `<4 x float>` element index.
 */
export interface Float4Buffer {
  load(index: number): Float4;
}

/**
 * Per-lane `fadd <4 x float>` (@%311..%334). fp32-narrowed.
 */
function faddV4(a: Float4, b: Float4): Float4 {
  return [
    Math.fround(a[0] + b[0]),
    Math.fround(a[1] + b[1]),
    Math.fround(a[2] + b[2]),
    Math.fround(a[3] + b[3]),
  ];
}

/**
 * `bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5` — row blend of a 23-row × 2-col
 * destination strip fed by a 32-row × 2-col source, with 12 lag-3 folds
 * scattered across four 5-row groups.
 *
 * Per grid thread `(gid.x, gid.y)`: reads a 3-row × 2-col RMW tile from
 * `inOut`, reads a 32-row × 2-col tile from `inNum`, and produces a
 * 23-row × 2-col output tile written back to `inOut`.
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8RowInc5 (HeliumSenso)
 * @see %4    entry
 * @see %8    icmp ult gid.x, globalWidth
 * @see %13   icmp ult gid.y, globalHeight
 * @see %24   offsetY + gid.y
 * @see %27   shl stepInc, 2 (stepInc * 4)
 * @see %28   dst row-base
 * @see %29   dst/src col-base = gid.x * 2
 * @see %30   src row-base = gid.x * 32
 * @see %35..%54    6 dst loads (rows 0..2 × cols 0..1)
 * @see %59..%310  64 src loads (rows 0..31 × cols 0..1)
 * @see %311..%334 24 fadd <4 x float> results
 * @see %34..%454  46 dst stores (rows 0..22 × cols 0..1)
 * @see %455  ret void
 */
export function bm3dnr_buf_blend8x8RowInc5(
  params: Bm3dnrBufBlend8x8RowInc5Params,
  gid: readonly [number, number],
  inOut: Float4RWBuffer,
  inNum: Float4Buffer,
): void {
  // %5 = extractelement gid, 0   (gid.x)
  const gidX = gid[0];
  // %6,%7 = load field4 (globalWidth)
  const globalWidth = params.globalWidth;
  // %8 = icmp ult gid.x, globalWidth
  if (!(gidX >>> 0 < globalWidth >>> 0)) {
    return;
  }

  // %10 = extractelement gid, 1  (gid.y)
  const gidY = gid[1];
  // %11,%12 = load field5 (globalHeight)
  const globalHeight = params.globalHeight;
  // %13 = icmp ult gid.y, globalHeight
  if (!(gidY >>> 0 < globalHeight >>> 0)) {
    return;
  }

  // %15,%16 = load field0 (strideInOut)
  // %17,%18 = load field1 (strideIn)
  // %19,%20 = load field2 (stepInc)
  // %22,%23 = load field3 (offsetY)
  const strideInOut = params.strideInOut;
  const strideIn = params.strideIn;
  const stepInc = params.stepInc;
  const offsetY = params.offsetY;

  // %24 = add offsetY, gid.y      (dst row-base offset)
  const dstRowBaseIdx = (offsetY + gidY) | 0;
  // %27 = shl stepInc, 2 = stepInc * 4  (dst row-base multiplier)
  const dstRowMul = (stepInc << 2) | 0;
  // %28 = mul (stepInc<<2), dstRowBaseIdx  (dst row-base)
  const dstRowBase = Math.imul(dstRowMul, dstRowBaseIdx) | 0;

  // %29 = shl gid.x, 1 = gid.x * 2  (dst/src column base)
  const colBase = (gidX << 1) | 0;
  // %30 = shl gid.x, 5 = gid.x * 32 (src row-base — 32 rows/thread)
  const srcRowBase = (gidX << 5) | 0;

  // Helper: compute the linear <4 x float> element index for
  // inOut[dstRow][col] where dstRow ∈ 0..22, col ∈ 0..1.
  //   dstRowIdx = dstRowBase + row
  //   linearIdx = strideInOut * dstRowIdx + colBase + col
  // IR encodes the row+0 case via the raw `%28`, row+1 via `or %28, 1`
  // (equivalent to add-1 since %28's low 2 bits are 0), and rows 2..22
  // via `add %28, N` (or `or %28, N` for N < 4). We spell them all as
  // add.
  const dstIdx = (row: number, col: number): number =>
    (Math.imul(strideInOut, (dstRowBase + row) | 0) + colBase + col) | 0;

  // Helper: compute the linear <4 x float> element index for
  // inNum[srcRow][col] where srcRow ∈ 0..31, col ∈ 0..1.
  //   srcRowIdx = srcRowBase + row
  //   linearIdx = strideIn * srcRowIdx + colBase + col
  // IR uses `or %30, N` for N ∈ {0..31}. All rows have low 5 bits clear
  // in %30 (since %30 = gid.x << 5), so or ≡ add for N < 32.
  const srcIdx = (row: number, col: number): number =>
    (Math.imul(strideIn, (srcRowBase + row) | 0) + colBase + col) | 0;

  // ─── 6 destination reads (dst rows 0..2, cols 0..1) ───────────────
  // D[r][c] = inOut[dstIdx(r, c)]
  //   IR: %35 = D[0][0]  ; %38 = D[0][1]
  //       %43 = D[1][0]  ; %46 = D[1][1]
  //       %51 = D[2][0]  ; %54 = D[2][1]
  const D: Float4[][] = [
    [inOut.load(dstIdx(0, 0)), inOut.load(dstIdx(0, 1))],
    [inOut.load(dstIdx(1, 0)), inOut.load(dstIdx(1, 1))],
    [inOut.load(dstIdx(2, 0)), inOut.load(dstIdx(2, 1))],
  ];

  // ─── 64 source reads (src rows 0..31, cols 0..1) ──────────────────
  // S[s][c] = inNum[srcIdx(s, c)]
  //   IR: %59 = S[0][0]   ; %62 = S[0][1]
  //       %67 = S[1][0]   ; %70 = S[1][1]
  //       ... (S[r][c] follows the same shape for r ∈ 0..31) ...
  //       %307 = S[31][0] ; %310 = S[31][1]
  const S: Float4[][] = [];
  for (let s = 0; s < 32; s++) {
    S.push([inNum.load(srcIdx(s, 0)), inNum.load(srcIdx(s, 1))]);
  }

  // ─── 24 fadd <4 x float> results ──────────────────────────────────
  //
  // Rows 0..2: D[r] + S[r] (@%311..%316)
  const out0_0 = faddV4(D[0][0], S[0][0]); // %311
  const out0_1 = faddV4(D[0][1], S[0][1]); // %312
  const out1_0 = faddV4(D[1][0], S[1][0]); // %313
  const out1_1 = faddV4(D[1][1], S[1][1]); // %314
  const out2_0 = faddV4(D[2][0], S[2][0]); // %315
  const out2_1 = faddV4(D[2][1], S[2][1]); // %316

  // Rows 5..7: S[r] + S[r+3] (lag-3 within first 8-row source window, @%317..%322)
  const out5_0 = faddV4(S[5][0], S[8][0]); // %317
  const out5_1 = faddV4(S[5][1], S[8][1]); // %318
  const out6_0 = faddV4(S[6][0], S[9][0]); // %319
  const out6_1 = faddV4(S[6][1], S[9][1]); // %320
  const out7_0 = faddV4(S[7][0], S[10][0]); // %321
  const out7_1 = faddV4(S[7][1], S[10][1]); // %322

  // Rows 10..12: S[r+3] + S[r+6] (lag-3 in second 8-row window, @%323..%328)
  const out10_0 = faddV4(S[13][0], S[16][0]); // %323
  const out10_1 = faddV4(S[13][1], S[16][1]); // %324
  const out11_0 = faddV4(S[14][0], S[17][0]); // %325
  const out11_1 = faddV4(S[14][1], S[17][1]); // %326
  const out12_0 = faddV4(S[15][0], S[18][0]); // %327
  const out12_1 = faddV4(S[15][1], S[18][1]); // %328

  // Rows 15..17: S[r+6] + S[r+9] (lag-3 in third 8-row window, @%329..%334)
  const out15_0 = faddV4(S[21][0], S[24][0]); // %329
  const out15_1 = faddV4(S[21][1], S[24][1]); // %330
  const out16_0 = faddV4(S[22][0], S[25][0]); // %331
  const out16_1 = faddV4(S[22][1], S[25][1]); // %332
  const out17_0 = faddV4(S[23][0], S[26][0]); // %333
  const out17_1 = faddV4(S[23][1], S[26][1]); // %334

  // ─── 46 destination stores ────────────────────────────────────────
  // (rows 0..22, cols 0..1)
  //
  // Row 0: fadd result
  inOut.store(dstIdx(0, 0), out0_0);
  inOut.store(dstIdx(0, 1), out0_1);
  // Row 1: fadd result
  inOut.store(dstIdx(1, 0), out1_0);
  inOut.store(dstIdx(1, 1), out1_1);
  // Row 2: fadd result
  inOut.store(dstIdx(2, 0), out2_0);
  inOut.store(dstIdx(2, 1), out2_1);
  // Row 3: direct copy of S[3]
  inOut.store(dstIdx(3, 0), S[3][0]);
  inOut.store(dstIdx(3, 1), S[3][1]);
  // Row 4: direct copy of S[4]
  inOut.store(dstIdx(4, 0), S[4][0]);
  inOut.store(dstIdx(4, 1), S[4][1]);
  // Row 5..7: fadd results
  inOut.store(dstIdx(5, 0), out5_0);
  inOut.store(dstIdx(5, 1), out5_1);
  inOut.store(dstIdx(6, 0), out6_0);
  inOut.store(dstIdx(6, 1), out6_1);
  inOut.store(dstIdx(7, 0), out7_0);
  inOut.store(dstIdx(7, 1), out7_1);
  // Row 8: direct copy of S[11]
  inOut.store(dstIdx(8, 0), S[11][0]);
  inOut.store(dstIdx(8, 1), S[11][1]);
  // Row 9: direct copy of S[12]
  inOut.store(dstIdx(9, 0), S[12][0]);
  inOut.store(dstIdx(9, 1), S[12][1]);
  // Row 10..12: fadd results
  inOut.store(dstIdx(10, 0), out10_0);
  inOut.store(dstIdx(10, 1), out10_1);
  inOut.store(dstIdx(11, 0), out11_0);
  inOut.store(dstIdx(11, 1), out11_1);
  inOut.store(dstIdx(12, 0), out12_0);
  inOut.store(dstIdx(12, 1), out12_1);
  // Row 13: direct copy of S[19]
  inOut.store(dstIdx(13, 0), S[19][0]);
  inOut.store(dstIdx(13, 1), S[19][1]);
  // Row 14: direct copy of S[20]
  inOut.store(dstIdx(14, 0), S[20][0]);
  inOut.store(dstIdx(14, 1), S[20][1]);
  // Row 15..17: fadd results
  inOut.store(dstIdx(15, 0), out15_0);
  inOut.store(dstIdx(15, 1), out15_1);
  inOut.store(dstIdx(16, 0), out16_0);
  inOut.store(dstIdx(16, 1), out16_1);
  inOut.store(dstIdx(17, 0), out17_0);
  inOut.store(dstIdx(17, 1), out17_1);
  // Row 18: direct copy of S[27]
  inOut.store(dstIdx(18, 0), S[27][0]);
  inOut.store(dstIdx(18, 1), S[27][1]);
  // Row 19: direct copy of S[28]
  inOut.store(dstIdx(19, 0), S[28][0]);
  inOut.store(dstIdx(19, 1), S[28][1]);
  // Row 20: direct copy of S[29]
  inOut.store(dstIdx(20, 0), S[29][0]);
  inOut.store(dstIdx(20, 1), S[29][1]);
  // Row 21: direct copy of S[30]
  inOut.store(dstIdx(21, 0), S[30][0]);
  inOut.store(dstIdx(21, 1), S[30][1]);
  // Row 22: direct copy of S[31]
  inOut.store(dstIdx(22, 0), S[31][0]);
  inOut.store(dstIdx(22, 1), S[31][1]);

  // %455 = ret void
}
