// bm3dnr_buf__bm3dnr_buf_blend8x8Weight8.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8Weight8` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Weight8 (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8Weight8.ll
// (header line: `0x00000000017c0d -- bm3dnr_buf::bm3dnr_buf_blend8x8Weight8`)
//
// This kernel is the 8-bit-output sibling of `bm3dnr_buf_blend8x8Weight16`.
// The block-load structure is byte-for-byte identical; only the final
// per-lane convert differs:
//   Weight16: fmul → fadd 0.5 → air.floor → clamp[-32768,32767] → i16
//   Weight8:  fmul → fadd 0.5 →              clamp[    0,   255] → u8
// (Weight8 omits `air.floor` — the following signed→u8 convert already
//  rounds toward zero on the [0,255]-clamped positive value, which is
//  exactly what the compiler wants here.)
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8Weight8(
//     %params*         %0,   // params struct (5 x i32, see below)
//     <2 x i32>        %1,   // thread_position_in_grid   (gx, gy)
//     <4 x i8>*        %2,   // output       (uchar4)
//     <4 x float>*     %3,   // inOut        (float4)  — the accumulated blend
//     <4 x float>*     %4    // oneOverDenom (float4)  — the reciprocal weights
//   )
//
// Params struct layout (from !18 in the .ll — same names as Weight16):
//   i32  m_strideOut            @0   → %19
//   i32  m_strideIn             @4   → %21
//   i32  m_strideOneOverDenom   @8   → %23
//   uint m_globalWidth          @12  → %10   (bound check on gx, %11)
//   uint m_globalHeight         @16  → %15   (bound check on gy, %16)
//
// Semantics recovered from the AIR (block ids from the .ll):
//   block %5 → 12 → 17 → loop(%32) → 51 → loop(%54) → loop(%74) → 73 → ret(%103)
//
//   if (gx >= globalWidth)  return;                             // %11 unsigned-lt
//   if (gy >= globalHeight) return;                             // %16 unsigned-lt
//   base offsets:
//     gx2      = gx << 1                                        // %28
//     gy8      = gy << 3                                        // %29
//     baseCol  = trunc(gx2)                                     // %30
//     baseRow  = trunc(gy8)                                     // %31
//
//   For each row r in 0..7 (block %32):                          // %33 phi
//     rowOff = (r + baseRow) * strideIn                          // %34/%35
//     local[r]     = inOut[rowOff + baseCol]                     // %36..%41
//     local[r + 8] = inOut[rowOff + baseCol + 1]                 // %42..%48
//
//   For each row r in 0..7 (block %54):                          // %55 phi
//     rowOff = (r + baseRow) * strideOneOverDenom                // %56/%57
//     w[r]     = oneOverDenom[rowOff + baseCol]                  // %58..%63
//     w[r + 8] = oneOverDenom[rowOff + baseCol + 1]              // %64..%70
//
//   For each row r in 0..7 (block %74):                          // %75 phi
//     wLo     = w[r];       wHi     = w[r + 8];                  // %77/%78, %81/%82
//     locLo   = local[r];   locHi   = local[r + 8];              // %83/%84, %93/%94
//     v0 = wLo * locLo                                           // %85 fmul
//     v0 = v0 + <0.5,0.5,0.5,0.5>                                // %86 fadd
//     v0 = air.clamp.v4f32(v0, <0>, <255,255,255,255>)           // %87
//     v0 = air.convert.u.v4i8.f.v4f32(v0)                        // %88
//     out[(r + baseRow) * strideOut + gx2      ] = v0            // %89..%92
//     v1 = wHi * locHi                                           // %95 fmul
//     v1 = v1 + <0.5,...>                                        // %96 fadd
//     v1 = air.clamp.v4f32(v1, <0>, <255,...>)                   // %97
//     v1 = air.convert.u.v4i8.f.v4f32(v1)                        // %98
//     out[(r + baseRow) * strideOut + gx2 + 1  ] = v1            // %99..%100
//
// Constants (decoded from the IR):
//   <float 5.000000e-01, ...>  — 0.5 splat added before the u8 convert (%86, %96)
//   <float 2.550000e+02, ...>  — 255.0 splat = UINT8_MAX (%87, %97)
//   `zeroinitializer`          — 0.0 splat  = UINT8_MIN (%87, %97)
//
// `air.convert.u.v4i8.f.v4f32` is a per-lane float→uint8 truncation-toward-
// zero. The preceding clamp to [0, 255] guarantees the input already fits
// in the u8 range, so `Math.trunc(x) & 0xff` reproduces the AIR result
// bit-for-bit. (JS does not have a native u8 type, so we return numbers
// in [0, 255] with the low 8 bits equal to the AIR lane value.)

/** RGBA float pixel — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];
/** RGBA uint8 pixel — matches `<4 x i8>` lane order (u8-valued numbers). */
export type UChar4 = readonly [number, number, number, number];

/**
 * Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params`
 * (the struct type is reused across the bm3dnr_buf blend8x8 kernels).
 */
export interface Blend8x8Weight8Params {
  /** i32 m_strideOut            — row stride into `output`       (in `<4 x i8>`   units). */
  readonly strideOut: number;
  /** i32 m_strideIn             — row stride into `inOut`        (in `<4 x float>` units). */
  readonly strideIn: number;
  /** i32 m_strideOneOverDenom   — row stride into `oneOverDenom` (in `<4 x float>` units). */
  readonly strideOneOverDenom: number;
  /** uint m_globalWidth         — grid width  in `blend` columns (2 float4s per column). */
  readonly globalWidth: number;
  /** uint m_globalHeight        — grid height in `blend` rows    (8 float4s per row). */
  readonly globalHeight: number;
}

/** fp32 helper — the IR is all `float`, so every fp op is Math.fround-narrowed. */
const f = Math.fround;

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8Weight8 — direct TS mapping of the AIR body.
 *
 * Each thread `(gx, gy)` processes an 8-row × 2-column tile of `<4 x i8>`
 * output pixels by multiplying an 8×2 tile of `<4 x float>` `inOut` values
 * against an 8×2 tile of `<4 x float>` `oneOverDenom` reciprocals, then
 * rounding to uint8 with saturating clamp to [0, 255]. See file header
 * for the exact IR mapping.
 *
 * The output/inOut/oneOverDenom buffers are modelled as `Vec4[]` / `UChar4[]`
 * arrays indexed in `<4 x …>` units — the same units the IR uses when it
 * does `getelementptr inbounds <4 x …>*, i64 <idx>`.
 */
export function bm3dnr_buf__bm3dnr_buf_blend8x8Weight8(
  params: Blend8x8Weight8Params,             // %0
  gridPos: readonly [number, number],        // %1 (gx, gy)
  output: UChar4[],                           // %2  <4 x i8>*    (out)
  inOut: readonly Vec4[],                     // %3  <4 x float>* (in — accumulated blend)
  oneOverDenom: readonly Vec4[],              // %4  <4 x float>* (in — reciprocal weights)
): void {
  const gx = gridPos[0] | 0;                  // %8  = extractelement %1, i64 0
  const gy = gridPos[1] | 0;                  // %13 = extractelement %1, i64 1

  // Bounds checks — %11 / %16 (icmp ult = unsigned less than).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %11 → %103 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %16 → %103 ret

  const strideOut          = params.strideOut          | 0; // %19
  const strideIn           = params.strideIn           | 0; // %21
  const strideOneOverDenom = params.strideOneOverDenom | 0; // %23

  // Per-thread base offsets (%26..%31).
  const gx2      = (gx * 2) | 0;              // %28 = %26 << 1
  const gy8      = (gy * 8) | 0;              // %29 = %27 << 3
  const baseCol  = gx2 | 0;                   // %30 (trunc %28 to i32)
  const baseRow  = gy8 | 0;                   // %31 (trunc %29 to i32)

  // 16-slot scratch buffers — mirror `alloca [16 x <4 x float>]` (%6, %7).
  const local: Vec4[] = new Array(16);        // %6
  const w:     Vec4[] = new Array(16);        // %7

  // --- block %32 loop: read inOut into local[0..15] ---
  for (let r = 0; r < 8; r++) {               // %33 phi 0..7
    const row     = (r + baseRow) | 0;        // %34
    const rowOff  = (row * strideIn) | 0;     // %35
    const idx0    = (rowOff + baseCol) | 0;   // %36
    const idx1    = (idx0 + 1) | 0;           // %42
    local[r]     = readVec4(inOut, idx0);     // %38/%39 load → %41 store to local[r]
    local[r + 8] = readVec4(inOut, idx1);     // %44/%45 load → %48 store to local[r+8]
    // %49/%50: r == 8 exit — mirrored by the JS for-loop.
  }

  // --- block %54 loop: read oneOverDenom into w[0..15] ---
  for (let r = 0; r < 8; r++) {               // %55 phi 0..7
    const row     = (r + baseRow) | 0;                  // %56
    const rowOff  = (row * strideOneOverDenom) | 0;     // %57
    const idx0    = (rowOff + baseCol) | 0;             // %58
    const idx1    = (idx0 + 1) | 0;                     // %64
    w[r]         = readVec4(oneOverDenom, idx0);        // %60/%61 → %63 store
    w[r + 8]     = readVec4(oneOverDenom, idx1);        // %66/%67 → %70 store
    // %71/%72: r == 8 exit → block %51.
  }

  // Block %51: precompute the +1-column offset used by the second store.
  // %53 = %28 | 1 — since gx2 = gx << 1 has bit 0 clear, `or 1` == `add 1`.
  const gx2Plus1 = (gx2 | 1) | 0;             // %53

  // --- block %74 loop: 8 rows × 2 columns of output writes ---
  for (let r = 0; r < 8; r++) {               // %75 phi 0..7
    // Loads in the exact order emitted by the compiler.
    const wLo   = w[r];                       // %78 load from %77 (buffer %7 slot r)
    const wHi   = w[r + 8];                   // %82 load from %81 (buffer %7 slot r+8)
    const locLo = local[r];                   // %84 load from %83 (buffer %6 slot r)

    // First column store:
    // %85 = fmul <4 x float> %78, %84
    const p85: Vec4 = mulVec4(wLo, locLo);
    // %86 = fadd <4 x float> %85, <0.5, 0.5, 0.5, 0.5>
    const p86: Vec4 = addScalarVec4(p85, f(0.5));
    // %87 = tail call <4 x float> @air.clamp.v4f32(%86, zeroinitializer,
    //                                             <255.0, 255.0, 255.0, 255.0>)
    const p87: Vec4 = clampVec4(p86, f(0.0), f(2.550000e+02));
    // %88 = tail call <4 x i8> @air.convert.u.v4i8.f.v4f32(%87)
    const p88: UChar4 = convertU8Vec4(p87);
    // %89..%92: outIdxA = (r + baseRow) * strideOut + gx2
    const rowOut  = (r + baseRow) | 0;        // %89 (i64 in IR; safe i32 here)
    const outRow  = (rowOut * strideOut) | 0; // %90
    const outIdxA = (outRow + gx2) | 0;       // %91
    output[outIdxA] = p88;                    // %92 store

    // Second column store (%93..%100):
    const locHi = local[r + 8];               // %94 load from %93 (buffer %6 slot r+8)
    // %95 = fmul <4 x float> %82, %94
    const p95: Vec4 = mulVec4(wHi, locHi);
    // %96 = fadd <4 x float> %95, <0.5, 0.5, 0.5, 0.5>
    const p96: Vec4 = addScalarVec4(p95, f(0.5));
    // %97 = clamp[0, 255]
    const p97: Vec4 = clampVec4(p96, f(0.0), f(2.550000e+02));
    // %98 = air.convert.u.v4i8.f.v4f32
    const p98: UChar4 = convertU8Vec4(p97);
    // %99: outIdxB = outRow + gx2Plus1
    const outIdxB = (outRow + gx2Plus1) | 0;  // %99
    output[outIdxB] = p98;                    // %100 store
    // %101/%102: r == 8 exit → block %73 → ret.
  }

  // block %73 → %103: lifetime.end + ret void.
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR intrinsic on <4 x float>.
// (Same shape as the Weight16 sibling; kept local for one-shader-per-file.)
// ---------------------------------------------------------------------------

/** load `<4 x float>` from buffer `buf` at unit index `idx`. */
function readVec4(buf: readonly Vec4[], idx: number): Vec4 {
  const v = buf[idx | 0];
  // fp32-narrow every lane on read to keep downstream fp32 semantics tight.
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}

/** per-lane f32 multiply — matches `fmul <4 x float>` in the IR (%85, %95). */
function mulVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] * b[0]), f(a[1] * b[1]), f(a[2] * b[2]), f(a[3] * b[3])];
}

/** add a splatted scalar to every lane — matches `fadd <4 x float> _, <s,s,s,s>` (%86, %96). */
function addScalarVec4(v: Vec4, s: number): Vec4 {
  return [f(v[0] + s), f(v[1] + s), f(v[2] + s), f(v[3] + s)];
}

/** `air.clamp.v4f32(v, lo, hi)` per-lane — min(max(v,lo),hi) (%87, %97). */
function clampVec4(v: Vec4, lo: number, hi: number): Vec4 {
  return [
    f(Math.min(Math.max(v[0], lo), hi)),
    f(Math.min(Math.max(v[1], lo), hi)),
    f(Math.min(Math.max(v[2], lo), hi)),
    f(Math.min(Math.max(v[3], lo), hi)),
  ];
}

/**
 * `air.convert.u.v4i8.f.v4f32` — unsigned float→uint8 truncation per lane
 * (%88, %98).
 *
 * The preceding `air.clamp.v4f32(v, 0.0, 255.0)` (%87 / %97) guarantees
 * v ∈ [0, 255]. On that non-negative range, `Math.trunc(x) & 0xff` yields
 * the correct u8 value bit-for-bit (truncate toward zero; the result is
 * already in u8 range so the mask is a nop but makes the u8 semantics
 * explicit).
 */
function convertU8Vec4(v: Vec4): UChar4 {
  const u = (x: number) => (Math.trunc(x) & 0xff);
  return [u(v[0]), u(v[1]), u(v[2]), u(v[3])];
}
