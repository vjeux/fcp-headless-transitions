// bm3dnr_buf__bm3dnr_buf_blend8x8Weight16.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8Weight16` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Weight16 (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8Weight16.ll
// (header line: `0x0000000001546d -- bm3dnr_buf::bm3dnr_buf_blend8x8Weight16`)
//
// Signature (%%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8Weight16(
//     %params*         %0,   // params struct (5 x i32, see below)
//     <2 x i32>        %1,   // thread_position_in_grid   (gx, gy)
//     <4 x i16>*       %2,   // output       (short4)
//     <4 x float>*     %3,   // inOut        (float4)  — the accumulated blend
//     <4 x float>*     %4    // oneOverDenom (float4)  — the reciprocal weights
//   )
//
// Params struct layout (from !18 in the .ll):
//   i32 m_strideOut            @0   → %19
//   i32 m_strideIn             @4   → %21
//   i32 m_strideOneOverDenom   @8   → %23
//   uint m_globalWidth         @12  → %10  (bound check on gx)
//   uint m_globalHeight        @16  → %15  (bound check on gy)
//
// Semantics recovered from the AIR:
//   if (gx >= globalWidth  || gy >= globalHeight) return;    // %11 / %16
//   For each row r in 0..7 (%32 loop):
//     load inOut[         (r + gy*8)*strideIn         + gx*2    ] into local[r]
//     load inOut[         (r + gy*8)*strideIn         + gx*2 + 1] into local[r+8]
//   For each row r in 0..7 (%54 loop):
//     load oneOverDenom[  (r + gy*8)*strideOneOverDenom + gx*2   ] into w[r]
//     load oneOverDenom[  (r + gy*8)*strideOneOverDenom + gx*2+1] into w[r+8]
//   For each row r in 0..7 (%74 loop, 2 columns per row):
//     v0    = local[r]   * w[r]
//     v0    = clamp(floor(v0 + 0.5), -32768, 32767)         // → short4
//     out[  (r + gy*8)*strideOut + gx*2     ] = int16(v0)
//     v1    = local[r+8] * w[r+8]
//     v1    = clamp(floor(v1 + 0.5), -32768, 32767)
//     out[  (r + gy*8)*strideOut + gx*2 + 1 ] = int16(v1)
//
// The `+0.5 then floor` (%86/%97) is round-half-toward-+∞ (banker's-rounding-
// like; ties go up). The clamp bounds are the literal float constants
// -3.276800e+04 and 3.276700e+04 in the IR — i.e. INT16_MIN / INT16_MAX.
// `air.convert.s.v4i16.f.v4f32` is signed truncation-to-int16 (safe because
// the preceding clamp already snapped the value to the int16 range).

/** RGBA float pixel — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];
/** RGBA int16 pixel — matches `<4 x i16>` lane order. */
export type Short4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params`. */
export interface Blend8x8Weight16Params {
  /** i32 m_strideOut            — row stride into `output` (in `<4 x i16>` units). */
  readonly strideOut: number;
  /** i32 m_strideIn             — row stride into `inOut`  (in `<4 x float>` units). */
  readonly strideIn: number;
  /** i32 m_strideOneOverDenom   — row stride into `oneOverDenom` (in `<4 x float>` units). */
  readonly strideOneOverDenom: number;
  /** uint m_globalWidth         — grid width in `blend` columns (2 float4s per column). */
  readonly globalWidth: number;
  /** uint m_globalHeight        — grid height in `blend` rows   (8 float4s per row). */
  readonly globalHeight: number;
}

/** fp32 helper — the IR is all `float`, so every fp op is Math.fround-narrowed. */
const f = Math.fround;

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8Weight16 — direct TS mapping of the AIR body.
 *
 * Each thread `(gx, gy)` processes an 8-row × 2-column tile of `<4 x i16>`
 * output pixels by multiplying an 8×2 tile of `<4 x float>` `inOut` values
 * against an 8×2 tile of `<4 x float>` `oneOverDenom` reciprocals, then
 * rounding to int16 with saturating clamp. See file header for the exact IR
 * mapping.
 *
 * The output/inOut/oneOverDenom buffers are modelled as `Vec4[]` / `Short4[]`
 * arrays indexed in `<4 x …>` units — i.e. the same units the IR uses when
 * it does `getelementptr inbounds <4 x …>*, i64 <idx>`.
 */
export function bm3dnr_buf__bm3dnr_buf_blend8x8Weight16(
  params: Blend8x8Weight16Params,           // %0
  gridPos: readonly [number, number],       // %1 (gx, gy)
  output: Short4[],                          // %2  <4 x i16>*   (out)
  inOut: readonly Vec4[],                    // %3  <4 x float>* (in — accumulated blend)
  oneOverDenom: readonly Vec4[],             // %4  <4 x float>* (in — reciprocal weights)
): void {
  const gx = gridPos[0] | 0;                 // %8
  const gy = gridPos[1] | 0;                 // %13

  // Bounds checks — %11 / %16 (icmp ult == unsigned less than).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;  // %11 → %105 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;  // %16 → %105 ret

  const strideOut          = params.strideOut          | 0; // %19
  const strideIn           = params.strideIn           | 0; // %21
  const strideOneOverDenom = params.strideOneOverDenom | 0; // %23

  // %26..%31 : precompute the per-thread base offsets.
  const gx2   = (gx * 2) | 0;                // %28 = %26 << 1
  const gy8   = (gy * 8) | 0;                // %29 = %27 << 3
  const baseCol = gx2 | 0;                   // %30 (trunc to i32)
  const baseRow = gy8 | 0;                   // %31 (trunc to i32)

  // 16-slot scratch buffers — mirror `alloca [16 x <4 x float>]` (%6, %7).
  const local: Vec4[] = new Array(16);       // %6
  const w:     Vec4[] = new Array(16);       // %7

  // --- %32 loop: read inOut into local[0..15] (r → r, r → r+8) ---
  for (let r = 0; r < 8; r++) {              // %33 phi 0..7
    const row     = (r + baseRow) | 0;       // %34
    const rowOff  = (row * strideIn) | 0;    // %35 = row * strideIn
    const idx0    = (rowOff + baseCol)     | 0; // %36
    const idx1    = (idx0 + 1)             | 0; // %42
    // %38/%39: load inOut[idx0]  → local[r]
    // %44/%45: load inOut[idx1]  → local[r+8]
    local[r]     = readVec4(inOut, idx0);    // %39 → %41 store
    local[r + 8] = readVec4(inOut, idx1);    // %45 → %48 store
  }

  // --- %54 loop: read oneOverDenom into w[0..15] (r → r, r → r+8) ---
  for (let r = 0; r < 8; r++) {              // %55 phi 0..7
    const row     = (r + baseRow) | 0;                  // %56
    const rowOff  = (row * strideOneOverDenom) | 0;     // %57
    const idx0    = (rowOff + baseCol) | 0;             // %58
    const idx1    = (idx0 + 1) | 0;                     // %64
    w[r]         = readVec4(oneOverDenom, idx0);        // %61 → %63 store
    w[r + 8]     = readVec4(oneOverDenom, idx1);        // %67 → %70 store
  }

  // --- %74 loop: multiply → +0.5 → floor → clamp[-32768,32767] → i16 → store ---
  // Precompute the row-stride into output and the +1 column offset:
  //   %52 = sext strideOut  (i32 → i64)  — used at %91
  //   %53 = %28 | 1                       — used at %101 (second column store)
  const gx2Plus1 = gx2 | 1;                   // %53 (or works because gx2 low-bit is 0)

  for (let r = 0; r < 8; r++) {               // %75 phi 0..7
    // First column: local[r] * w[r]
    const va: Vec4 = local[r + 8];            // %78 (yes — the IR loads w-side from %77/%81 which point at buffer %7 slots 0..7 and 8..15; local-side loads %83/%94 use buffer %6 slots 0..7 and 8..15. Cross-check by index.)
    const wa: Vec4 = w[r];                    // %78 above is actually w[r] from buffer %7. Detailed mapping is per-index.
    // NOTE: to preserve the IR pairing exactly, we re-derive the four loads
    // in the same order the compiler emitted them — see inline citations.
    // Untangling the compiler's index-shuffle: the .ll pairs
    //   (buffer %7 slot r, buffer %6 slot r) → out at [(r+gy8)*strideOut + gx2]
    //   (buffer %7 slot r+8, buffer %6 slot r+8) → out at [(r+gy8)*strideOut + gx2+1]
    // where buffer %7 == w, buffer %6 == local. So the correct pairings are:
    const wLo = w[r];                         // %78 load from %77 (buffer %7 slot r)
    const wHi = w[r + 8];                     // %82 load from %81 (buffer %7 slot r+8)
    const localLo = local[r];                 // %84 load from %83 (buffer %6 slot r)
    const localHi = local[r + 8];             // %95 load from %94 (buffer %6 slot r+8)

    // %85: %78 * %84 — per-lane f32 multiply.
    const p85: Vec4 = mulVec4(wLo, localLo);
    // %86: %85 + <0.5, 0.5, 0.5, 0.5>
    const p86: Vec4 = addScalarVec4(p85, f(0.5));
    // %87: air.floor.v4f32(%86)  — per-lane floor, fp32-narrowed.
    const p87: Vec4 = floorVec4(p86);
    // %88: air.clamp.v4f32(%87, <-32768,...>, <32767,...>)
    const p88: Vec4 = clampVec4(p87, f(-3.276800e+04), f(3.276700e+04));
    // %89: air.convert.s.v4i16.f.v4f32(%88) — signed truncation to int16.
    const p89: Short4 = convertI16Vec4(p88);

    // %90..%92: outIdxA = (r + gy8)*strideOut + gx2
    const rowOut = (r + baseRow) | 0;         // %90 (as i64 in IR; safe i32 here)
    const outRow = (rowOut * strideOut) | 0;  // %91
    const outIdxA = (outRow + gx2) | 0;       // %92
    output[outIdxA] = p89;                    // %93 → store

    // Now the second column (%94..%102):
    // %96: %82 * %95 — per-lane f32 multiply.
    const p96: Vec4 = mulVec4(wHi, localHi);
    // %97: %96 + <0.5>
    const p97: Vec4 = addScalarVec4(p96, f(0.5));
    // %98: floor
    const p98: Vec4 = floorVec4(p97);
    // %99: clamp[-32768, 32767]
    const p99: Vec4 = clampVec4(p98, f(-3.276800e+04), f(3.276700e+04));
    // %100: convert to i16
    const p100: Short4 = convertI16Vec4(p99);
    // %101: outIdxB = outRow + gx2Plus1
    const outIdxB = (outRow + gx2Plus1) | 0;  // %101
    output[outIdxB] = p100;                   // %102 → store

    // Silence "va/wa unused" from the mislabelled reads above — they were
    // just a scaffolding step for the index-untangling comment.
    void va; void wa;
  }

  // %73: lifetime.end + fallthrough to %105 ret.
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR intrinsic on <4 x float>.
// ---------------------------------------------------------------------------

/** load `<4 x float>` from buffer `buf` at unit index `idx`. Direct index. */
function readVec4(buf: readonly Vec4[], idx: number): Vec4 {
  const v = buf[idx | 0];
  // fp32-narrow every lane on read to keep downstream fp32 semantics tight.
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}

/** per-lane f32 multiply — matches `fmul <4 x float>` in the IR (%85, %96). */
function mulVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] * b[0]), f(a[1] * b[1]), f(a[2] * b[2]), f(a[3] * b[3])];
}

/** add a splatted scalar to every lane — matches `fadd <4 x float> _, <s,s,s,s>` (%86, %97). */
function addScalarVec4(v: Vec4, s: number): Vec4 {
  return [f(v[0] + s), f(v[1] + s), f(v[2] + s), f(v[3] + s)];
}

/** `air.floor.v4f32` — per-lane floor toward -∞, fp32-narrowed (%87, %98). */
function floorVec4(v: Vec4): Vec4 {
  return [f(Math.floor(v[0])), f(Math.floor(v[1])),
          f(Math.floor(v[2])), f(Math.floor(v[3]))];
}

/** `air.clamp.v4f32(v, lo, hi)` per-lane — the AIR clamp is min(max(v,lo),hi) (%88, %99). */
function clampVec4(v: Vec4, lo: number, hi: number): Vec4 {
  return [
    f(Math.min(Math.max(v[0], lo), hi)),
    f(Math.min(Math.max(v[1], lo), hi)),
    f(Math.min(Math.max(v[2], lo), hi)),
    f(Math.min(Math.max(v[3], lo), hi)),
  ];
}

/**
 * `air.convert.s.v4i16.f.v4f32` — signed float→int16 truncation per lane (%89, %100).
 *
 * The preceding `air.clamp.v4f32(v, -3.276800e+04, 3.276700e+04)` (%88 / %99)
 * guarantees v ∈ [INT16_MIN, INT16_MAX]. On that range, `Math.trunc(x) | 0`
 * yields the correct int16 value directly (truncate toward zero; the result
 * already fits in 16-bit signed range).
 */
function convertI16Vec4(v: Vec4): Short4 {
  const clip = (x: number) => Math.trunc(x) | 0;
  return [clip(v[0]), clip(v[1]), clip(v[2]), clip(v[3])];
}
