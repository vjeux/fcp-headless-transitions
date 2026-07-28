// bm3dnr_buf__bm3dnr_buf_blend8x8Weight16b.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blend8x8Weight16b.ll
// (header line: `0x0000000001686d -- bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b`)
//
// Signature (%%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b(
//     %params*         %0,   // params struct (5 x i32, see below)
//     <2 x i32>        %1,   // thread_position_in_grid   (gx, gy)
//     <4 x i16>*       %2,   // output       (ushort4)
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
// This kernel is the UNSIGNED sibling of `bm3dnr_buf::bm3dnr_buf_blend8x8Weight16`
// (already ported at ./bm3dnr_buf__bm3dnr_buf_blend8x8Weight16.ts). Structural
// differences per the AIR (direct TS mapping — no approximations):
//   1. Output element type is `ushort4` (%20/`air.arg_type_name = "ushort4"`),
//      not `short4`. The output pointer type in the IR is the same `<4 x i16>*`
//      because Metal's ushort4 and short4 are both 4 x i16 at the LLVM level;
//      the distinction lives in the AIR metadata + the convert intrinsic.
//   2. The clamp bounds are `<0.0, 6.553500e+04>` (0..65535) instead of
//      `<-32768.0, 32767.0>` — the U16 numeric range. See %87 and %97.
//   3. The convert intrinsic is `air.convert.u.v4i16.f.v4f32` (unsigned)
//      not `air.convert.s.v4i16.f.v4f32` (signed).
//   4. There is NO `air.floor.v4f32` in this variant — the .ll goes
//      `fmul → fadd 0.5 → clamp → convert.u`. Without an explicit floor, the
//      `air.convert.u` intrinsic performs its own truncation-toward-zero;
//      combined with the `+ 0.5` immediate that yields round-toward-nearest
//      with ties-away-from-zero for the non-negative range guaranteed by
//      the clamp lower bound of 0.0.
//
// Everything else — the two 8-iter read loops that stage `inOut` into a
// 16-slot scratch buffer and `oneOverDenom` into another 16-slot buffer,
// followed by the 8-iter multiply-and-store loop that writes two output
// pixels per iteration — is byte-identical to the signed variant.
//
// Semantics recovered from the AIR:
//   if (gx >= globalWidth  || gy >= globalHeight) return;  // %11 / %16
//   For each row r in 0..7 (%32 loop):
//     load inOut[         (r + gy*8)*strideIn         + gx*2   ] into local[r]
//     load inOut[         (r + gy*8)*strideIn         + gx*2+1 ] into local[r+8]
//   For each row r in 0..7 (%54 loop):
//     load oneOverDenom[  (r + gy*8)*strideOneOverDenom + gx*2   ] into w[r]
//     load oneOverDenom[  (r + gy*8)*strideOneOverDenom + gx*2+1 ] into w[r+8]
//   For each row r in 0..7 (%74 loop, 2 columns per row):
//     v0 = local[r]   * w[r]
//     v0 = clamp(v0 + 0.5, 0, 65535)
//     out[  (r + gy*8)*strideOut + gx*2     ] = uint16(v0)   // via air.convert.u
//     v1 = local[r+8] * w[r+8]
//     v1 = clamp(v1 + 0.5, 0, 65535)
//     out[  (r + gy*8)*strideOut + gx*2 + 1 ] = uint16(v1)

/** RGBA float pixel — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];
/** RGBA ushort pixel — matches `<4 x i16>` lane order (unsigned). */
export type UShort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params`. */
export interface Blend8x8Weight16bParams {
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
 * bm3dnr_buf::bm3dnr_buf_blend8x8Weight16b — direct TS mapping of the AIR body.
 *
 * Each thread `(gx, gy)` processes an 8-row × 2-column tile of `<4 x i16>`
 * (interpreted as `ushort4`) output pixels by multiplying an 8×2 tile of
 * `<4 x float>` `inOut` values against an 8×2 tile of `<4 x float>`
 * `oneOverDenom` reciprocals, then rounding to uint16 with saturating clamp
 * to `[0, 65535]`. See file header for the exact IR mapping.
 */
export function bm3dnr_buf__bm3dnr_buf_blend8x8Weight16b(
  params: Blend8x8Weight16bParams,          // %0
  gridPos: readonly [number, number],       // %1 (gx, gy)
  output: UShort4[],                         // %2  <4 x i16>*   (out — ushort4)
  inOut: readonly Vec4[],                    // %3  <4 x float>* (in — accumulated blend)
  oneOverDenom: readonly Vec4[],             // %4  <4 x float>* (in — reciprocal weights)
): void {
  const gx = gridPos[0] | 0;                 // %8
  const gy = gridPos[1] | 0;                 // %13

  // Bounds checks — %11 / %16 (icmp ult == unsigned less than).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;  // %11 → %103 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;  // %16 → %103 ret

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
    // %38/%39: load inOut[idx0]  → local[r]     (store at %41)
    // %44/%45: load inOut[idx1]  → local[r+8]   (store at %48)
    local[r]     = readVec4(inOut, idx0);
    local[r + 8] = readVec4(inOut, idx1);
  }

  // --- %54 loop: read oneOverDenom into w[0..15] (r → r, r → r+8) ---
  for (let r = 0; r < 8; r++) {              // %55 phi 0..7
    const row     = (r + baseRow) | 0;                  // %56
    const rowOff  = (row * strideOneOverDenom) | 0;     // %57
    const idx0    = (rowOff + baseCol) | 0;             // %58
    const idx1    = (idx0 + 1) | 0;                     // %64
    // %61/%63: load oneOverDenom[idx0]  → w[r]         (store at %63)
    // %67/%70: load oneOverDenom[idx1]  → w[r+8]       (store at %70)
    w[r]         = readVec4(oneOverDenom, idx0);
    w[r + 8]     = readVec4(oneOverDenom, idx1);
  }

  // --- %74 loop: multiply → +0.5 → clamp[0,65535] → u16 → store ---
  // Precompute the +1 column offset for the second store:
  //   %52 = sext strideOut  (i32 → i64)  — used at %90 in the row-stride mul
  //   %53 = %28 | 1                       — used at %99 (second column store)
  const gx2Plus1 = gx2 | 1;                   // %53 (or-with-1 works because
                                              //      gx2 = gx*2 is even).

  for (let r = 0; r < 8; r++) {               // %75 phi 0..7
    // Load pairing per the IR: buffer %7 slots (r, r+8) = w; buffer %6 slots
    // (r, r+8) = local. First store uses (%7 slot r) * (%6 slot r); second
    // store uses (%7 slot r+8) * (%6 slot r+8).
    const wLo     = w[r];                     // %78 load from %77 (buffer %7 slot r)
    const wHi     = w[r + 8];                 // %82 load from %81 (buffer %7 slot r+8)
    const localLo = local[r];                 // %84 load from %83 (buffer %6 slot r)
    const localHi = local[r + 8];             // %94 load from %93 (buffer %6 slot r+8)

    // FIRST COLUMN:
    // %85: fmul <4 x float> %78, %84  — per-lane f32 multiply.
    const p85: Vec4 = mulVec4(wLo, localLo);
    // %86: fadd <4 x float> %85, <0.5, 0.5, 0.5, 0.5>
    const p86: Vec4 = addScalarVec4(p85, f(0.5));
    // %87: air.clamp.v4f32(%86, <0.0,...>, <65535.0,...>)
    //      note: no separate air.floor here — the u-convert truncates itself.
    const p87: Vec4 = clampVec4(p86, f(0.0), f(6.553500e+04));
    // %88: air.convert.u.v4i16.f.v4f32(%87) — unsigned truncation to u16.
    const p88: UShort4 = convertU16Vec4(p87);

    // %89..%91: outIdxA = (r + gy8)*strideOut + gx2
    const rowOut  = (r + baseRow) | 0;        // %89 (as i64 in IR; safe i32 here)
    const outRow  = (rowOut * strideOut) | 0; // %90
    const outIdxA = (outRow + gx2) | 0;       // %91
    // %92 → %92 store
    output[outIdxA] = p88;

    // SECOND COLUMN:
    // %95: fmul <4 x float> %82, %94
    const p95: Vec4 = mulVec4(wHi, localHi);
    // %96: fadd <4 x float> %95, <0.5>
    const p96: Vec4 = addScalarVec4(p95, f(0.5));
    // %97: clamp[0, 65535]
    const p97: Vec4 = clampVec4(p96, f(0.0), f(6.553500e+04));
    // %98: air.convert.u.v4i16.f.v4f32
    const p98: UShort4 = convertU16Vec4(p97);
    // %99: outIdxB = outRow + gx2Plus1
    const outIdxB = (outRow + gx2Plus1) | 0;  // %99
    // %100 → store
    output[outIdxB] = p98;
  }

  // %73: lifetime.end + fallthrough to %103 ret.
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

/** per-lane f32 multiply — matches `fmul <4 x float>` in the IR (%85, %95). */
function mulVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] * b[0]), f(a[1] * b[1]), f(a[2] * b[2]), f(a[3] * b[3])];
}

/** add a splatted scalar to every lane — matches `fadd <4 x float> _, <s,s,s,s>` (%86, %96). */
function addScalarVec4(v: Vec4, s: number): Vec4 {
  return [f(v[0] + s), f(v[1] + s), f(v[2] + s), f(v[3] + s)];
}

/** `air.clamp.v4f32(v, lo, hi)` per-lane — direct TS mapping: min(max(v,lo),hi) (%87, %97). */
function clampVec4(v: Vec4, lo: number, hi: number): Vec4 {
  return [
    f(Math.min(Math.max(v[0], lo), hi)),
    f(Math.min(Math.max(v[1], lo), hi)),
    f(Math.min(Math.max(v[2], lo), hi)),
    f(Math.min(Math.max(v[3], lo), hi)),
  ];
}

/**
 * `air.convert.u.v4i16.f.v4f32` — UNSIGNED float→u16 truncation per lane
 * (%88, %98).
 *
 * The preceding `air.clamp.v4f32(v, 0.0, 65535.0)` (%87 / %97) guarantees
 * v ∈ [0, 65535]. On that range, `Math.trunc(x) & 0xFFFF` yields the correct
 * u16 value directly (truncate toward zero; the result already fits the
 * 16-bit unsigned range).
 */
function convertU16Vec4(v: Vec4): UShort4 {
  // The preceding `air.clamp.v4f32(v, 0.0, 65535.0)` (%87/%97) narrows every
  // lane to [0, 65535], so a plain truncate-toward-zero suffices for the
  // `air.convert.u.v4i16` semantics — the result already fits in u16 and
  // never crosses the sign bit. Direct TS mapping of the AIR intrinsic (%88, %98).
  const clip = (x: number) => Math.trunc(x) | 0;
  return [clip(v[0]), clip(v[1]), clip(v[2]), clip(v[3])];
}
