// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b (HeliumSenso)
//
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib
// (BM3D denoiser buffer helper — 8×8-tile weighted blend with rounded
//  saturating conversion to UNSIGNED 16-bit output). IR at
//  raw-port/re/shaders/bm3dnr_buf_blend8x8Weight16b.ll (header @0x0000000001686d).
//
// Direct TS mapping of the AIR IR. The params struct is named
// bm3dnr_buf_blend4x4Weight_params in the IR (the 8×8 variant reuses the
// same struct type, per the AIR type declaration) but the metadata
// annotates the fields with the human-friendly names for the 8×8 kernel:
//   [0] m_strideOut               (dst i16 buffer, in <4 x i16> rows)
//   [1] m_strideIn                (src pixel buffer, in <4 x float>)
//   [2] m_strideOneOverDenom      (weight buffer, in <4 x float>)
//   [3] m_globalWidth             (upper bound on gid.x, in <4 x float> cols)
//   [4] m_globalHeight            (upper bound on gid.y, in 8-row groups)
// See metadata !18 in the IR.
//
// Buffers:
//   %2 = output  <4 x i16>*   destination u16 tile
//   %3 = inOut   <4 x float>* source pixel values (per <4 x float>)
//   %4 = oneOverDenom <4 x float>*  per-cell weights
//   %1 = gid     <2 x i32>    thread position in grid (gid.x = %8, gid.y = %13)
//
// The kernel:
//   • bounds-checks gid.x < width and gid.y < height (fall through to
//     %103/ret with no work if out of bounds).
//   • allocates two 16-slot stack scratch arrays of <4 x float>:
//       %6 = SRC_TILE[16]  (holds two vertically-adjacent <4 x float>
//                            pixel columns for 8 rows -> 8+8=16 lanes)
//       %7 = W_TILE[16]    (same shape, for the weight buffer)
//   • loop-A (label %32, 8 iterations, i∈{0..7}):
//       row = gid.y*8 + i
//       col = gid.x*2
//       SRC_TILE[i]     = inOut[srcStride*row + col]
//       SRC_TILE[i+8]   = inOut[srcStride*row + col + 1]
//   • loop-B (label %54, 8 iterations, i∈{0..7}):
//       W_TILE[i]       = oneOverDenom[weightStride*row + col]
//       W_TILE[i+8]     = oneOverDenom[weightStride*row + col + 1]
//   • loop-C (label %74, 8 iterations, i∈{0..7}):
//       for each of the two columns c∈{0,1}:
//         v = SRC_TILE[i + c*8] * W_TILE[i + c*8]  (<4 x float> fmul)
//         v = v + 0.5
//         v = clamp(v, 0, 65535)      (unsigned-i16 saturation)
//         out_i16 = (uint16) v        (air.convert.u.v4i16.f — trunc)
//         out_row = gid.y*8 + i
//         out_col = gid.x*2 + c
//         output[outStride*out_row + out_col] = out_i16
//
// Constants:
//   • +0.5 rounding bias  = IR `<float 5.000000e-01,…>` @%86/%96
//   • clamp lo = <0.0,…> (zeroinitializer @%87/%97) — unsigned floor.
//   • clamp hi = 6.553500e+04 = 65535.0 (UINT16_MAX as float).
//   • The `air.convert.u.v4i16.f.v4f32` @%88/%98 is an UNSIGNED
//     truncating cast — after the clamp the value is in [0, 65535], so
//     the truncation matches `(uint16_t)f`.
//
// Notes:
//   • `shl gid.x, 1` @%28 = gid.x*2 → column base.
//   • `shl gid.y, 3` @%29 = gid.y*8 → row base.
//   • `or i64 %28, 1` @%53 forms the +1 column offset (rowBase is
//      guaranteed to have its bottom 1 bit clear because rowBase =
//      gid.x*2, so OR≡ADD here). We spell it as `colBase + 1`.
//   • The IR has three back-to-back linear loops (A, B, C). We spell
//     them the same way — no fused unroll.
//
// Faithful transcription — every IR op maps to a direct TS operation.
// fp32-narrowed everywhere the AIR type is <4 x float> / .f32.

/**
 * Params struct addressed at `%0` (five i32 fields). Names from metadata
 * !18 in the IR — the AIR type declaration reuses the 4x4Weight params
 * struct type, but the 8x8Weight16b kernel documents them as follows:
 *
 *   [0] strideOut            (dst i16 buffer row stride, in <4 x i16>)
 *   [1] strideIn             (src pixel buffer row stride, in <4 x float>)
 *   [2] strideOneOverDenom   (weight buffer row stride, in <4 x float>)
 *   [3] globalWidth          (bound on gid.x)
 *   [4] globalHeight         (bound on gid.y)
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b (HeliumSenso)
 * @see %9   (field3 = globalWidth)
 * @see %14  (field4 = globalHeight)
 * @see %18  (field0 = strideOut)
 * @see %20  (field1 = strideIn)
 * @see %22  (field2 = strideOneOverDenom)
 */
export interface Bm3dnrBufBlend8x8Weight16bParams {
  strideOut: number;
  strideIn: number;
  strideOneOverDenom: number;
  globalWidth: number;
  globalHeight: number;
}

/** `<4 x float>` load/store lane. */
export type Float4 = readonly [number, number, number, number];

/** `<4 x i16>` store lane. Values are in the unsigned range [0, 65535]. */
export type Uint16x4 = readonly [number, number, number, number];

/**
 * Read-only accessor for the two `<4 x float>` source buffers. Indexed
 * by linear `<4 x float>` element index (matches IR's GEP shape).
 */
export interface Float4Buffer {
  load(index: number): Float4;
}

/**
 * Write-only accessor for the `<4 x i16>` destination buffer. Indexed
 * by linear `<4 x i16>` element index. Values stored are unsigned 16-bit
 * (0..65535) — matches the AIR `air.convert.u.v4i16.f` producer.
 */
export interface Uint16x4Buffer {
  store(index: number, value: Uint16x4): void;
}

/**
 * u16 saturation constants from the IR:
 *   clamp lo = 0.0     (zeroinitializer @%87 / %97)
 *   clamp hi = 65535.0 (6.553500e+04 @%87 / %97)
 *
 * @see %87 / %97 — the two air.clamp.v4f32 calls in the IR.
 */
const U16_MIN_F = Math.fround(0.0);
const U16_MAX_F = Math.fround(65535.0);

/**
 * +0.5 rounding bias — the constant added before the clamp+convert at
 * %86/%96. fp32-narrowed.
 */
const HALF = Math.fround(0.5);

/**
 * Per-lane `air.clamp.v4f32(v, lo, hi)` = `min(max(v, lo), hi)`.
 * @see %87 / %97
 */
function airClampV4(v: Float4, lo: number, hi: number): Float4 {
  return [
    Math.fround(Math.min(Math.max(v[0], lo), hi)),
    Math.fround(Math.min(Math.max(v[1], lo), hi)),
    Math.fround(Math.min(Math.max(v[2], lo), hi)),
    Math.fround(Math.min(Math.max(v[3], lo), hi)),
  ];
}

/**
 * Per-lane `fmul <4 x float>` (@%85 / %95). fp32-narrowed.
 */
function fmulV4(a: Float4, b: Float4): Float4 {
  return [
    Math.fround(a[0] * b[0]),
    Math.fround(a[1] * b[1]),
    Math.fround(a[2] * b[2]),
    Math.fround(a[3] * b[3]),
  ];
}

/**
 * Per-lane `fadd <4 x float>` with a scalar broadcast (@%86 / %96 add
 * `<0.5,…>`). fp32-narrowed.
 */
function faddV4Scalar(a: Float4, s: number): Float4 {
  return [
    Math.fround(a[0] + s),
    Math.fround(a[1] + s),
    Math.fround(a[2] + s),
    Math.fround(a[3] + s),
  ];
}

/**
 * `air.convert.u.v4i16.f.v4f32(v)` @%88 / %98 — unsigned truncating cast.
 * After the clamp the value is in [0, 65535], so truncation-toward-zero
 * (`| 0` for the 32-bit trunc, then `& 0xffff` to model unsigned-i16
 * store width) matches the AIR semantics bit-for-bit.
 */
function convertF4toU16x4(v: Float4): Uint16x4 {
  const t0 = (v[0] | 0) & 0xffff;
  const t1 = (v[1] | 0) & 0xffff;
  const t2 = (v[2] | 0) & 0xffff;
  const t3 = (v[3] | 0) & 0xffff;
  return [t0, t1, t2, t3];
}

/**
 * `bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b` — 8×8-tile weighted blend
 * with unsigned-16 saturating output. Each grid thread processes one
 * 2-column × 8-row sub-tile: it multiplies pixels by weights, rounds via
 * +0.5+floor(implicit-in-clamp-then-trunc), clamps to [0, 65535], and
 * writes 16 `<4 x i16>` cells to the destination buffer.
 *
 * Invoked per grid thread `(gid.x, gid.y)`. Bounds-checks `gid.x < width`
 * and `gid.y < height`; out-of-bounds threads no-op (fall to %103).
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b (HeliumSenso)
 * @see %5   entry
 * @see %11  icmp ult gid.x, globalWidth
 * @see %16  icmp ult gid.y, globalHeight
 * @see %28  shl gid.x, 1 (gid.x*2 → column base)
 * @see %29  shl gid.y, 3 (gid.y*8 → row base)
 * @see %32  loop-A (SRC pixel loads into SRC_TILE[0..15])
 * @see %54  loop-B (weight loads into W_TILE[0..15])
 * @see %74  loop-C (fmul + 0.5 + clamp + convert.u.i16 + store, 2 cols × 8 rows)
 * @see %103 exit
 */
export function bm3dnr_buf_blend8x8Weight16b(
  params: Bm3dnrBufBlend8x8Weight16bParams,
  gid: readonly [number, number],
  output: Uint16x4Buffer,
  inOut: Float4Buffer,
  oneOverDenom: Float4Buffer,
): void {
  // %8  = extractelement gid, 0    (gid.x)
  const gidX = gid[0];
  // %9,%10 = load params.field3 (globalWidth)
  const globalWidth = params.globalWidth;
  // %11 = icmp ult gid.x, globalWidth
  if (!(gidX >>> 0 < globalWidth >>> 0)) {
    return;
  }

  // %13 = extractelement gid, 1    (gid.y)
  const gidY = gid[1];
  // %14,%15 = load params.field4 (globalHeight)
  const globalHeight = params.globalHeight;
  // %16 = icmp ult gid.y, globalHeight
  if (!(gidY >>> 0 < globalHeight >>> 0)) {
    return;
  }

  // %18,%19 = load field0 (strideOut)
  // %20,%21 = load field1 (strideIn)
  // %22,%23 = load field2 (strideOneOverDenom)
  const strideOut = params.strideOut;
  const strideIn = params.strideIn;
  const strideOneOverDenom = params.strideOneOverDenom;

  // %28 = shl gid.x, 1  = gid.x*2  (column base within a <4 x float> row)
  // %29 = shl gid.y, 3  = gid.y*8  (row base)
  const colBase = (gidX << 1) >>> 0;
  const rowBase = (gidY << 3) >>> 0;

  // %6 = alloca [16 x <4 x float>]  (SRC_TILE)
  // %7 = alloca [16 x <4 x float>]  (W_TILE)
  const srcTile: Float4[] = new Array<Float4>(16);
  const wTile: Float4[] = new Array<Float4>(16);

  // ─── loop-A @%32: SRC pixel loads into SRC_TILE ───────────────────
  //   for i in 0..7:
  //     row = rowBase + i
  //     srcIdx = strideIn*row + colBase
  //     SRC_TILE[i]     = inOut[srcIdx]         (%39 load)
  //     SRC_TILE[i + 8] = inOut[srcIdx + 1]     (%45 load)
  //   %49 = i + 1 ; %50 = icmp eq %49, 8 → exit to label %54.
  for (let i = 0; i < 8; i++) {
    // %34 = i + rowBase ; %35 = mul strideIn ; %36 = add colBase.
    const row = (i + rowBase) | 0;
    const srcIdx = (Math.imul(row, strideIn) + colBase) | 0;
    // %38/%39 = GEP+load column 0
    srcTile[i] = inOut.load(srcIdx);
    // %42/%44/%45 = GEP+load column 1 (srcIdx + 1)
    srcTile[i + 8] = inOut.load((srcIdx + 1) | 0);
  }

  // ─── loop-B @%54: weight loads into W_TILE ────────────────────────
  //   for i in 0..7:
  //     row = rowBase + i
  //     wIdx = strideOneOverDenom*row + colBase
  //     W_TILE[i]     = oneOverDenom[wIdx]        (%61 load)
  //     W_TILE[i + 8] = oneOverDenom[wIdx + 1]    (%67 load)
  for (let i = 0; i < 8; i++) {
    // %56 = i + rowBase ; %57 = mul strideOneOverDenom ; %58 = add colBase.
    const row = (i + rowBase) | 0;
    const wIdx = (Math.imul(row, strideOneOverDenom) + colBase) | 0;
    wTile[i] = oneOverDenom.load(wIdx);
    wTile[i + 8] = oneOverDenom.load((wIdx + 1) | 0);
  }

  // ─── loop-C @%74: blend + clamp + convert + store ─────────────────
  //   %52 = sext strideOut to i64  (block %51, hoisted out of loop-C).
  //   %53 = or colBase, 1          (colBase + 1, since colBase has bit0 = 0).
  //   for i in 0..7:
  //     v0 = SRC_TILE[i]     * W_TILE[i]           (%84*%78 → %85)
  //     v0 = v0 + 0.5                              (%86)
  //     v0 = clamp(v0, 0, 65535)                   (%87)
  //     u0 = convert.u.i16(v0)                     (%88)
  //     outRow = rowBase + i                       (%89)
  //     store output[strideOut*outRow + colBase]   (%92)
  //
  //     v1 = SRC_TILE[i + 8] * W_TILE[i + 8]       (%94*%82 → %95)
  //     v1 = v1 + 0.5                              (%96)
  //     v1 = clamp(v1, 0, 65535)                   (%97)
  //     u1 = convert.u.i16(v1)                     (%98)
  //     store output[strideOut*outRow + colBase+1] (%100)
  for (let i = 0; i < 8; i++) {
    // Column 0 lane.
    // %78 = load W_TILE[i] ; %84 = load SRC_TILE[i] ; %85 = fmul
    const v0 = fmulV4(srcTile[i], wTile[i]);
    // %86 = fadd v0, <0.5,…>
    const b0 = faddV4Scalar(v0, HALF);
    // %87 = air.clamp(b0, 0, 65535)
    const c0 = airClampV4(b0, U16_MIN_F, U16_MAX_F);
    // %88 = air.convert.u.v4i16.f
    const u0 = convertF4toU16x4(c0);

    // %89 = add rowBase, i  (outRow) ; %90 = mul outRow, strideOut ;
    // %91 = add %90, colBase ; %92 = GEP + store <4 x i16> u0.
    const outRow = (rowBase + i) | 0;
    const rowByte = Math.imul(outRow, strideOut) | 0;
    output.store((rowByte + colBase) | 0, u0);

    // Column 1 lane.
    // %82 = load W_TILE[i+8] ; %94 = load SRC_TILE[i+8] ; %95 = fmul
    const v1 = fmulV4(srcTile[i + 8], wTile[i + 8]);
    // %96 = fadd v1, <0.5,…>
    const b1 = faddV4Scalar(v1, HALF);
    // %97 = air.clamp(b1, 0, 65535)
    const c1 = airClampV4(b1, U16_MIN_F, U16_MAX_F);
    // %98 = air.convert.u.v4i16.f
    const u1 = convertF4toU16x4(c1);

    // %99 = add %53 (colBase+1), %90 (rowByte) ; %100 = GEP+store.
    output.store((rowByte + colBase + 1) | 0, u1);
  }

  // %103 = ret void
}
