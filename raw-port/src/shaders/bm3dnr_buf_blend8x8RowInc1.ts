// @shader bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1 (HeliumSenso)
//
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib
// (BM3D denoiser buffer helper — row blend of a 9-row × 2-col output
//  strip fed by a 16-row × 2-col numerator source, with a lag-7 wrap
//  pattern). IR at raw-port/re/shaders/bm3dnr_buf_blend8x8RowInc1.ll
//  (header @0x0000000001090d).
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
//   %2 = inOut  <4 x float>*  destination — 14 loads + 18 stores (RMW).
//                             The kernel reads rows 0..6 and writes rows 0..8.
//   %3 = inNum  <4 x float>*  source numerator — 32 loads (16 rows × 2 cols).
//   %1 = gid    <2 x i32>     thread position in grid
//
// Kernel logic (direct TS mapping):
//
//   1. bounds check gid.x < globalWidth and gid.y < globalHeight — else no-op
//
//   2. compute dst base addressing:
//        colBaseDst = (gid.x << 1)                    (%29 — dst col base, in <4xf>)
//        rowBaseDst = (stepInc << 1) * (offsetY+gid.y) (%27,%28)
//        rowStrideDst = strideInOut                    (%16)
//      dst row `r` (r ∈ 0..8) base index into inOut is:
//        dstRow(r) = strideInOut * (rowBaseDst + r) + colBaseDst
//      IR encodes this via `add %28, r` (or `or %28, 1` for r=1 since
//      %28's low bit is zero after the shl), then `mul stride`, then
//      `add colBase`. We spell it directly.
//
//   3. compute src base addressing:
//        colBaseSrc = (gid.x << 1)                    (also %29 — same expression)
//        rowBaseSrc = (gid.x << 4) = gid.x * 16        (%30 — inNum row base,
//                                                      16 rows/thread)
//        rowStrideSrc = strideIn                       (%18 -> %87)
//      inNum row `s` (s ∈ 0..15) base index into inNum is:
//        srcRow(s) = strideIn * (rowBaseSrc + s) + colBaseSrc
//      NB: `rowBaseSrc = gid.x * 16` means the "row base" for the source
//      buffer is 16 rows apart per grid thread — this kernel is called
//      once per 16-row-block on the source side and produces a 9-row
//      output block on the destination side (a lag-7 windowed sum).
//
//   4. load 14 dst tiles (rows 0..6, cols 0..1):
//        D[r][c] = inOut[dstRow(r) + c]     for r ∈ 0..6, c ∈ 0..1
//      IR: %35, %38, %43, %46, %51, %54, %59, %62, %67, %70, %75, %78, %83, %86.
//
//   5. load 32 src tiles (rows 0..15, cols 0..1):
//        S[s][c] = inNum[srcRow(s) + c]     for s ∈ 0..15, c ∈ 0..1
//      IR: %91, %94, %99, %102, ..., %211, %214.
//
//   6. compute the 18 output rows (each an fadd of <4 x float>):
//
//      Row 0  (out row 0):     dst[0][c] + S[0][c]                 (%215, %216)
//      Row 1  (out row 1):     dst[1][c] + S[1][c] + S[8][c]        (%217→%229, %218→%230)
//        IR computes this as %217 = fadd D[1][c], S[1][c], then
//        %229 = fadd %217, S[8][c]  — a two-step accumulation.
//      Row 2..6 (out rows 2..6): dst[r][c] + S[r][c] + S[r+7][c]    (@%219..%228 partials,
//                                                                     @%231..%240 finals)
//        r=2 → S[2]+S[9], r=3 → S[3]+S[10], r=4 → S[4]+S[11],
//        r=5 → S[5]+S[12], r=6 → S[6]+S[13].
//      Row 7  (out row 7):     S[7][c] + S[14][c]                   (%241, %242)
//        No dst read for row 7 — the IR encodes only the two source
//        loads S[7][c] (%147/%150) and S[14][c] (%203/%206), fadded
//        directly to produce %241/%242.
//      Row 8  (out row 8):     S[15][c]                             (%211 store, %214 store)
//        No dst read AND no fadd for row 8 — the IR stores S[15][c]
//        directly (the load's SSA value is fed straight to the store).
//
//   7. store 18 <4 x float> tiles to inOut at rows 0..8, cols 0..1.
//
// The pattern is: for the 9 output rows, "middle" rows (1..6) fold in
// the corresponding dst tile plus TWO source tiles a lag of 7 apart
// (row s and row s+7). Edge rows differ: row 0 folds in only the first
// source; rows 7 and 8 have no dst term and copy from the source alone.
//
// This is the row-oriented counterpart of the ColumnInc1 kernel — same
// param struct type name (bm3dnr_buf_blend4x4Column_params, reused per
// AIR type declaration), same overall shape, but rearranged to blend
// along the row axis instead of the column axis.
//
// Faithful transcription — every IR op maps to a direct TS operation.
// fp32-narrowed everywhere the AIR type is <4 x float> / .f32.

/**
 * Params struct addressed at `%0` (six i32 fields). Names from metadata
 * !18 in the IR:
 *   [0] strideInOut     (<4 x float>-buffer row stride for `inOut`)
 *   [1] strideIn        (<4 x float>-buffer row stride for `inNum`)
 *   [2] stepInc         (dst BLOCK stride — multiplied by 2 in the IR
 *                        (`shl 1`) and then by (offsetY + gid.y); see @%28)
 *   [3] offsetY         (signed shift added to gid.y for the dst base)
 *   [4] globalWidth     (bound on gid.x)
 *   [5] globalHeight    (bound on gid.y)
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1 (HeliumSenso)
 * @see %6   (field4 = globalWidth)
 * @see %11  (field5 = globalHeight)
 * @see %15  (field0 = strideInOut)
 * @see %17  (field1 = strideIn)
 * @see %19  (field2 = stepInc)
 * @see %22  (field3 = offsetY)
 */
export interface Bm3dnrBufBlend8x8RowInc1Params {
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
 * Per-lane `fadd <4 x float>` (@%215, %216, %217..%242). fp32-narrowed.
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
 * `bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1` — row blend of a 9-row × 2-col
 * destination strip fed by a 16-row × 2-col source, with a lag-7 wrap.
 *
 * Per grid thread `(gid.x, gid.y)`: reads a 7-row × 2-col RMW tile from
 * `inOut`, reads a 16-row × 2-col tile from `inNum`, and produces a
 * 9-row × 2-col output tile written back to `inOut`.
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8RowInc1 (HeliumSenso)
 * @see %4    entry
 * @see %8    icmp ult gid.x, globalWidth
 * @see %13   icmp ult gid.y, globalHeight
 * @see %24   offsetY + gid.y
 * @see %27   shl stepInc, 1 (stepInc * 2)
 * @see %28   dst row-base
 * @see %29   dst/src col-base = gid.x * 2
 * @see %30   src row-base = gid.x * 16
 * @see %33..%86    14 dst loads (rows 0..6 × cols 0..1)
 * @see %89..%214  32 src loads (rows 0..15 × cols 0..1)
 * @see %215..%242  18 fadd <4 x float> results
 * @see %34..%254  18 dst stores (rows 0..8 × cols 0..1)
 * @see %255  ret void
 */
export function bm3dnr_buf_blend8x8RowInc1(
  params: Bm3dnrBufBlend8x8RowInc1Params,
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
  // %27 = shl stepInc, 1 = stepInc * 2  (dst row-base multiplier)
  const dstRowMul = (stepInc << 1) | 0;
  // %28 = mul (stepInc<<1), dstRowBaseIdx  (dst row-base)
  const dstRowBase = Math.imul(dstRowMul, dstRowBaseIdx) | 0;

  // %29 = shl gid.x, 1 = gid.x * 2  (dst/src column base)
  const colBase = (gidX << 1) | 0;
  // %30 = shl gid.x, 4 = gid.x * 16 (src row-base — 16 rows/thread)
  const srcRowBase = (gidX << 4) | 0;

  // Helper: compute the linear <4 x float> element index for
  // inOut[dstRow][col] where dstRow ∈ 0..8, col ∈ 0..1.
  //   dstRowIdx = dstRowBase + row
  //   linearIdx = strideInOut * dstRowIdx + colBase + col
  // IR encodes the row+0 case via the raw `%28`, row+1 via `or %28, 1`
  // (equivalent to add-1 since %28's low bit is 0), and rows 2..8 via
  // `add %28, N` where N∈{2..8}. We spell them all as add.
  const dstIdx = (row: number, col: number): number =>
    (Math.imul(strideInOut, (dstRowBase + row) | 0) + colBase + col) | 0;

  // Helper: compute the linear <4 x float> element index for
  // inNum[srcRow][col] where srcRow ∈ 0..15, col ∈ 0..1.
  //   srcRowIdx = srcRowBase + row
  //   linearIdx = strideIn * srcRowIdx + colBase + col
  // IR mostly uses `or %30, N` for N ∈ {0..15}. All rows have low 4 bits
  // clear in %30 (since %30 = gid.x << 4), so or ≡ add for N < 16.
  const srcIdx = (row: number, col: number): number =>
    (Math.imul(strideIn, (srcRowBase + row) | 0) + colBase + col) | 0;

  // ─── 14 destination reads (dst rows 0..6, cols 0..1) ──────────────
  // D[r][c] = inOut[dstIdx(r, c)]
  //   IR: %35 = D[0][0]  ; %38 = D[0][1]
  //       %43 = D[1][0]  ; %46 = D[1][1]
  //       %51 = D[2][0]  ; %54 = D[2][1]
  //       %59 = D[3][0]  ; %62 = D[3][1]
  //       %67 = D[4][0]  ; %70 = D[4][1]
  //       %75 = D[5][0]  ; %78 = D[5][1]
  //       %83 = D[6][0]  ; %86 = D[6][1]
  const D: Float4[][] = [
    [inOut.load(dstIdx(0, 0)), inOut.load(dstIdx(0, 1))],
    [inOut.load(dstIdx(1, 0)), inOut.load(dstIdx(1, 1))],
    [inOut.load(dstIdx(2, 0)), inOut.load(dstIdx(2, 1))],
    [inOut.load(dstIdx(3, 0)), inOut.load(dstIdx(3, 1))],
    [inOut.load(dstIdx(4, 0)), inOut.load(dstIdx(4, 1))],
    [inOut.load(dstIdx(5, 0)), inOut.load(dstIdx(5, 1))],
    [inOut.load(dstIdx(6, 0)), inOut.load(dstIdx(6, 1))],
  ];

  // ─── 32 source reads (src rows 0..15, cols 0..1) ──────────────────
  // S[s][c] = inNum[srcIdx(s, c)]
  //   IR: %91  = S[0][0]  ; %94  = S[0][1]  (%88..%94)
  //       %99  = S[1][0]  ; %102 = S[1][1]
  //       ... (S[r][c] follows the same shape for r ∈ 0..15) ...
  //       %211 = S[15][0] ; %214 = S[15][1]
  const S: Float4[][] = [];
  for (let s = 0; s < 16; s++) {
    S.push([inNum.load(srcIdx(s, 0)), inNum.load(srcIdx(s, 1))]);
  }

  // ─── 18 fadd <4 x float> results ──────────────────────────────────
  //
  // Row 0: only dst + first source.
  //   %215 = fadd D[0][0], S[0][0]
  //   %216 = fadd D[0][1], S[0][1]
  const out0_0 = faddV4(D[0][0], S[0][0]);
  const out0_1 = faddV4(D[0][1], S[0][1]);

  // Rows 1..6: dst + source_r + source_{r+7}, computed as a two-step
  // accumulation in the IR (partial %217..%228, final %229..%240).
  //
  //   Row 1:  D[1] + S[1]  → partial %217/%218 ; + S[8]   → final %229/%230
  //   Row 2:  D[2] + S[2]  → partial %219/%220 ; + S[9]   → final %231/%232
  //   Row 3:  D[3] + S[3]  → partial %221/%222 ; + S[10]  → final %233/%234
  //   Row 4:  D[4] + S[4]  → partial %223/%224 ; + S[11]  → final %235/%236
  //   Row 5:  D[5] + S[5]  → partial %225/%226 ; + S[12]  → final %237/%238
  //   Row 6:  D[6] + S[6]  → partial %227/%228 ; + S[13]  → final %239/%240
  //
  // We spell the same two fadds explicitly (not `a+b+c` as one round);
  // that matches the IR's rounding order for fp32-narrowed sums.
  function accum2(dRC: Float4, srcRC: Float4, lagRC: Float4): Float4 {
    // partial = fadd D, S_r
    const partial = faddV4(dRC, srcRC);
    // final = fadd partial, S_{r+7}
    return faddV4(partial, lagRC);
  }

  const out1_0 = accum2(D[1][0], S[1][0], S[8][0]);
  const out1_1 = accum2(D[1][1], S[1][1], S[8][1]);
  const out2_0 = accum2(D[2][0], S[2][0], S[9][0]);
  const out2_1 = accum2(D[2][1], S[2][1], S[9][1]);
  const out3_0 = accum2(D[3][0], S[3][0], S[10][0]);
  const out3_1 = accum2(D[3][1], S[3][1], S[10][1]);
  const out4_0 = accum2(D[4][0], S[4][0], S[11][0]);
  const out4_1 = accum2(D[4][1], S[4][1], S[11][1]);
  const out5_0 = accum2(D[5][0], S[5][0], S[12][0]);
  const out5_1 = accum2(D[5][1], S[5][1], S[12][1]);
  const out6_0 = accum2(D[6][0], S[6][0], S[13][0]);
  const out6_1 = accum2(D[6][1], S[6][1], S[13][1]);

  // Row 7: only source-lag pair, no dst read.
  //   %241 = fadd S[7][0], S[14][0]
  //   %242 = fadd S[7][1], S[14][1]
  const out7_0 = faddV4(S[7][0], S[14][0]);
  const out7_1 = faddV4(S[7][1], S[14][1]);

  // Row 8: direct copy of S[15][c] — no fadd, no dst read.
  //   store S[15][0] → %252, store S[15][1] → %254
  const out8_0 = S[15][0];
  const out8_1 = S[15][1];

  // ─── 18 destination stores ────────────────────────────────────────
  // IR: %34, %37, %42, %45, %50, %53, %58, %61, %66, %69, %74, %77,
  //     %82, %85, %246, %248, %252, %254 (the last four for rows 7,8).
  inOut.store(dstIdx(0, 0), out0_0);
  inOut.store(dstIdx(0, 1), out0_1);
  inOut.store(dstIdx(1, 0), out1_0);
  inOut.store(dstIdx(1, 1), out1_1);
  inOut.store(dstIdx(2, 0), out2_0);
  inOut.store(dstIdx(2, 1), out2_1);
  inOut.store(dstIdx(3, 0), out3_0);
  inOut.store(dstIdx(3, 1), out3_1);
  inOut.store(dstIdx(4, 0), out4_0);
  inOut.store(dstIdx(4, 1), out4_1);
  inOut.store(dstIdx(5, 0), out5_0);
  inOut.store(dstIdx(5, 1), out5_1);
  inOut.store(dstIdx(6, 0), out6_0);
  inOut.store(dstIdx(6, 1), out6_1);
  inOut.store(dstIdx(7, 0), out7_0);
  inOut.store(dstIdx(7, 1), out7_1);
  inOut.store(dstIdx(8, 0), out8_0);
  inOut.store(dstIdx(8, 1), out8_1);

  // %255 = ret void
}
