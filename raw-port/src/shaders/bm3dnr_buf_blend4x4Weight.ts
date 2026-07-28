// @shader bm3dnr_buf::bm3dnr_buf_blend4x4Weight (HeliumSenso)
//
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib
// (BM3D denoiser buffer helper — element-wise weighted blend of a 4-row tile,
//  with rounded conversion to signed 16-bit output). IR at
//  raw-port/re/shaders/bm3dnr_buf_blend4x4Weight.ll (header @0x000000000098dd).
//
// Direct TS mapping of the AIR IR. Params struct layout
// (see IR type `%struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params`):
//   i32 field0 = out_row_stride         (dst i16 buffer, in <4 x i16> rows)
//   i32 field1 = src_pixel_row_stride   (src <4 x float> pixel  buffer)
//   i32 field2 = src_weight_row_stride  (src <4 x float> weight buffer)
//   i32 field3 = width   (bound on gid.x)
//   i32 field4 = height  (bound on gid.y — measured in 4-row groups; the
//                         kernel writes 4 vertically-adjacent rows per gid.y)
//
// Buffers (all zero-indexed, all `<4 x …>` vector loads/stores):
//   %2 = OUT  <4 x i16>*   destination i16 tile
//   %3 = SRC  <4 x float>* source pixel values (per-pixel <4 x float>)
//   %4 = W    <4 x float>* per-pixel weights   (per-pixel <4 x float>)
//   %1 = gid  <2 x i32>    thread position in grid (gid.x = %6, gid.y = %11)
//
// The kernel bounds-checks gid.x < width (%9) and gid.y < height (%14).
// Inside the bounds it processes ONE column across 4 rows: for
//   r in {0,1,2,3}:
//     row = gid.y*4 + r
//     idx_src = src_pixel_row_stride * row + gid.x
//     idx_w   = src_weight_row_stride * row + gid.x
//     idx_out = out_row_stride * row + gid.x
//     v      = SRC[idx_src] * W[idx_w]     (<4 x float> element-wise)
//     rounded= floor(v + 0.5)              (round-half-down-ish; matches
//                                           IR's fadd 0.5 + air.floor)
//     saturated = clamp(rounded, -32768, 32767)
//     OUT[idx_out] = convert_s.v4i16.f(saturated)   (truncating cast to i16)
//
// The 4-row unrolling is spelled explicitly in the IR (%25..%48 = 4 SRC
// loads; %53..%68 = 4 W loads; %69..%72 = 4 fmuls; %73..%88 = 4 (add-0.5,
// floor, clamp, convert); %89..%104 = 4 GEPs+stores). We mirror that
// exactly with a 4-iteration loop over lane r ∈ {0..3}.
//
// Notes on constants:
//   • +0.5 rounding bias:   IR `<float 5.000000e-01 …>` @%73/%77/%81/%85.
//   • clamp min = -3.276800e+04 = -32768 (INT16_MIN as float).
//   • clamp max =  3.276700e+04 =  32767 (INT16_MAX as float — the AIR
//                                          IR spells it as 3.2767e4, i.e.
//                                          exactly 32767.0, not "close to"
//                                          32768; this is the signed-i16
//                                          saturation boundary).
//   • The `or i32 %25, 1/2/3` (@%31/%37/%43) is a bitwise-OR that behaves
//     as an add because %25 = (gid.y * 4) has its bottom 2 bits clear;
//     the compiler emits OR because it's cheaper and equivalent here.
//     We spell it as `+1/+2/+3` — same integer value.
//   • The `shl nuw nsw i64 %23, 2` @%24 is `gid.y << 2` = `gid.y * 4`.
//   • The `mul i64 %24, %89` @%90 (and its 3 unrolled siblings) uses
//     `sext i32 out_row_stride to i64` @%89 for pointer-arithmetic
//     widening. We do the same widening implicitly since JS numbers hold
//     both cleanly as long as strides×row fits in 53-bit precision.
//
// Faithful transcription — every operand is a direct TS mapping of the
// AIR op (fmul → Math.fround(a*b), fadd → Math.fround(a+b), air.floor →
// Math.floor(x), air.clamp → Math.max/min composition, air.convert.s.v4i16
// → integer truncation into the int16 storage). fp32-narrowed where the
// AIR op is .f32 / <4 x float>.

/**
 * Params struct addressed at `%0` — five i32 fields laid out as:
 *   [0] outRowStride            (dst i16 buffer row stride)
 *   [1] srcPixelRowStride       (src pixel buffer row stride)
 *   [2] srcWeightRowStride      (weight buffer row stride)
 *   [3] width                   (upper bound on gid.x)
 *   [4] height                  (upper bound on gid.y — 4-row groups)
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend4x4Weight (HeliumSenso)
 * @see %7   (field3 = width)
 * @see %12  (field4 = height)
 * @see %16  (field0 = outRowStride)
 * @see %18  (field1 = srcPixelRowStride)
 * @see %20  (field2 = srcWeightRowStride)
 */
export interface Bm3dnrBufBlend4x4WeightParams {
  outRowStride: number;
  srcPixelRowStride: number;
  srcWeightRowStride: number;
  width: number;
  height: number;
}

/**
 * A `<4 x float>` load/store lane, matching the IR's <4 x float> vector
 * loads at %30/%36/%42/%48/%53/%58/%63/%68. Represented as a 4-tuple.
 */
export type Float4 = readonly [number, number, number, number];

/**
 * A `<4 x i16>` store lane, matching the IR's <4 x i16> stores at
 * %92/%96/%100/%104. Represented as a 4-tuple of Int16-range integers.
 */
export type Int16x4 = readonly [number, number, number, number];

/**
 * Read-only accessor for the two `<4 x float>` source buffers. Buffer is
 * indexed by a linear `<4 x float>` element index (NOT byte offset) —
 * matches the IR's `getelementptr inbounds <4 x float>, … i64 %N` shape.
 */
export interface Float4Buffer {
  load(index: number): Float4;
}

/**
 * Write-only accessor for the `<4 x i16>` destination buffer. Indexed by
 * linear `<4 x i16>` element index (NOT byte offset) — matches the IR's
 * `getelementptr inbounds <4 x i16>, … i64 %N` shape.
 */
export interface Int16x4Buffer {
  store(index: number, value: Int16x4): void;
}

/**
 * i16 saturation constants from the IR:
 *   clamp min = -3.276800e+04 = -32768 (INT16_MIN as float)
 *   clamp max =  3.276700e+04 =  32767 (INT16_MAX as float)
 *
 * @see %75/%79/%83/%87 — the four air.clamp.v4f32 calls in the IR.
 */
const I16_MIN_F = Math.fround(-32768.0);
const I16_MAX_F = Math.fround(32767.0);

/**
 * Round-and-saturate bias — the +0.5 added before `air.floor` at
 * %73/%77/%81/%85. fp32-narrowed.
 */
const HALF = Math.fround(0.5);

/**
 * Convert a `<4 x float>` value (post-clamp) to `<4 x i16>` via the AIR
 * `air.convert.s.v4i16.f.v4f32` intrinsic (@%76/%80/%84/%88). The AIR
 * conversion is a signed truncating cast — after the clamp the value is
 * already in [-32768, 32767] so truncation matches C's `(int16_t)f`. We
 * use `| 0` for the 32-bit truncation, then mask to int16 range.
 */
function convertF4toI16x4(v: Float4): Int16x4 {
  // trunc-toward-zero, matching the AIR fp-to-int semantics after clamp.
  const t0 = v[0] | 0;
  const t1 = v[1] | 0;
  const t2 = v[2] | 0;
  const t3 = v[3] | 0;
  return [t0, t1, t2, t3];
}

/**
 * Per-lane `air.floor.v4f32` (@%74/%78/%82/%86).
 */
function airFloorV4(v: Float4): Float4 {
  return [
    Math.fround(Math.floor(v[0])),
    Math.fround(Math.floor(v[1])),
    Math.fround(Math.floor(v[2])),
    Math.fround(Math.floor(v[3])),
  ];
}

/**
 * Per-lane `air.clamp.v4f32` (@%75/%79/%83/%87). Semantics:
 * `min(max(v, lo), hi)` — matches IR's clamp(v, [-32768…], [32767…]).
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
 * Per-lane `fmul <4 x float>` (@%69/%70/%71/%72). fp32-narrowed.
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
 * Per-lane `fadd <4 x float>` with a scalar broadcast (@%73/%77/%81/%85
 * add the `<0.5, 0.5, 0.5, 0.5>` splat). fp32-narrowed.
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
 * `bm3dnr_buf::bm3dnr_buf_blend4x4Weight` — element-wise weighted blend
 * of a 4-row column tile, with rounded saturating conversion to signed
 * 16-bit output.
 *
 * Invoked per grid thread `(gid.x, gid.y)`. Bounds-checks `gid.x < width`
 * and `gid.y < height`; out-of-bounds threads are no-ops (matching the IR
 * fall-through to label %105 without doing anything).
 *
 * @shader bm3dnr_buf::bm3dnr_buf_blend4x4Weight (HeliumSenso)
 * @see %5   entry
 * @see %9   icmp ult gid.x, width
 * @see %14  icmp ult gid.y, height
 * @see %24  shl gid.y, 2 (gid.y * 4)
 * @see %69..%72  fmul SRC*W
 * @see %73..%88  add 0.5, floor, clamp[-32768, 32767], convert.s.i16
 * @see %89..%104 stores to OUT
 * @see %105 exit
 */
export function bm3dnr_buf_blend4x4Weight(
  params: Bm3dnrBufBlend4x4WeightParams,
  gid: readonly [number, number],
  out: Int16x4Buffer,
  src: Float4Buffer,
  weight: Float4Buffer,
): void {
  // %6  = extractelement gid, 0    (gid.x)
  const gidX = gid[0];
  // %7,%8 = load params.field3 (width)
  const width = params.width;
  // %9  = icmp ult gid.x, width
  if (!(gidX >>> 0 < width >>> 0)) {
    return; // fall to %105 (no-op)
  }

  // %11 = extractelement gid, 1    (gid.y)
  const gidY = gid[1];
  // %12,%13 = load params.field4 (height)
  const height = params.height;
  // %14 = icmp ult gid.y, height
  if (!(gidY >>> 0 < height >>> 0)) {
    return; // fall to %105 (no-op)
  }

  // %16,%17 = load params.field0 (outRowStride)
  // %18,%19 = load params.field1 (srcPixelRowStride)
  // %20,%21 = load params.field2 (srcWeightRowStride)
  const outRowStride = params.outRowStride;
  const srcPixelRowStride = params.srcPixelRowStride;
  const srcWeightRowStride = params.srcWeightRowStride;

  // %22 = zext gid.x  (used as base column offset)
  // %23 = zext gid.y
  // %24 = shl gid.y, 2  = gid.y*4 = base row within the 4-row group
  const rowBase = (gidY << 2) >>> 0;

  // The IR unrolls the 4-row work explicitly. We mirror the unroll with a
  // r ∈ {0,1,2,3} loop, computing one <4 x float> src, one weight, one
  // fmul, one +0.5/floor/clamp/convert, and one <4 x i16> store per r.
  //
  // IR row-index formation (unrolled r=0..3):
  //   r=0: %25 = trunc %24         (= rowBase + 0)
  //   r=1: %31 = or %25, 1         (= rowBase + 1)
  //   r=2: %37 = or %25, 2         (= rowBase + 2)
  //   r=3: %43 = or %25, 3         (= rowBase + 3)
  // The OR-with-1/2/3 is legal because rowBase's bottom 2 bits are zero
  // (rowBase = gid.y << 2), so or ≡ add here.
  for (let r = 0; r < 4; r++) {
    const row = (rowBase + r) | 0;

    // SRC index:    srcPixelRowStride * row + gid.x
    //   IR: %26 = mul %19, %25 (row) ; %27 = add %26, %6 (gidX) ;
    //       %28 = sext to i64 ; %29 = GEP <4 x float>, %3, %28 ;
    //       %30 = load <4 x float>.
    const srcIdx = (Math.imul(srcPixelRowStride, row) + gidX) | 0;
    const srcV = src.load(srcIdx);

    // W index:      srcWeightRowStride * row + gid.x
    //   IR: %49 = mul %21, %25 ; %50 = add %49, %6 ; %51 = sext ;
    //       %52 = GEP <4 x float>, %4, %51 ; %53 = load <4 x float>.
    const wIdx = (Math.imul(srcWeightRowStride, row) + gidX) | 0;
    const wV = weight.load(wIdx);

    // %69 = fmul <4 x float> src, w
    const product = fmulV4(srcV, wV);

    // %73 = fadd product, <0.5,0.5,0.5,0.5>
    const biased = faddV4Scalar(product, HALF);

    // %74 = air.floor.v4f32(biased)
    const floored = airFloorV4(biased);

    // %75 = air.clamp.v4f32(floored, [-32768…], [32767…])
    const clamped = airClampV4(floored, I16_MIN_F, I16_MAX_F);

    // %76 = air.convert.s.v4i16.f.v4f32(clamped) — signed truncating cast
    const i16v = convertF4toI16x4(clamped);

    // OUT index:    outRowStride * row + gid.x
    //   IR: %89 = sext outRowStride to i64 ; %90 = mul %24 (row-of-r=0)
    //       or per-r variant, %89 ; %91 = add %90, %22 (gidX) ;
    //       %92/%96/%100/%104 = GEP <4 x i16>, %2, that ;
    //       store <4 x i16> %76/%80/%84/%88 to it.
    // NB: the IR uses `mul %(row64), %89` on i64s. We reproduce that by
    // reading the i32 `outRowStride` and forming the same product; the
    // r=0/1/2/3 row values differ by 1 which is what the IR's unroll
    // encodes via %90/%94/%98/%102.
    const outIdx = (Math.imul(outRowStride, row) + gidX) | 0;
    out.store(outIdx, i16v);
  }

  // %105 = ret void
}
