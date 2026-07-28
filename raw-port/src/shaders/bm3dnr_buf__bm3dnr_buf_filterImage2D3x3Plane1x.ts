// bm3dnr_buf__bm3dnr_buf_filterImage2D3x3Plane1x.ts
// @shader bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane1x (HeliumSenso)
// Faithful direct TS mapping of the Metal compute kernel decompiled at
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_filterImage2D3x3Plane1x.ll  (see @0x00000000022b9d)
//
// A 3x3 box-mean filter over a UCHAR (unsigned 8-bit grayscale) plane at 1x
// packing (one pixel per byte — as opposed to the "U8" companion that packs
// 4 pixels per vec4). Each thread processes ONE pixel at (gridX, gridY).
//
// Kernel signature (from !14 / !17..!21):
//   params : constant buffer of struct {
//              i32   m_strideIn, m_strideOut, m_width, m_height,
//              u32   m_globalWidth, m_globalHeight
//            }
//   grid_in: uint2 — thread_position_in_grid
//   input  : device uchar* (read/read-write per !20 — but only read here)
//   output : device uchar* (read/read-write per !21 — written here)
//
// Struct field mapping per metadata !18:
//   idx 0 -> +0  : m_strideIn      (i32) — bytes per input row
//   idx 1 -> +4  : m_strideOut     (i32) — bytes per output row
//   idx 2 -> +8  : m_width         (i32) — image pixel-column count
//   idx 3 -> +12 : m_height        (i32) — image pixel-row count
//   idx 4 -> +16 : m_globalWidth   (u32) — grid.x upper bound (exclusive)
//   idx 5 -> +20 : m_globalHeight  (u32) — grid.y upper bound (exclusive)
//
// -----------------------------------------------------------------------------
// Control flow (from %8, %13):
//   if (gridX >= m_globalWidth)  return;   // %8  br to %99 (ret)
//   if (gridY >= m_globalHeight) return;   // %13 br to %99 (ret)
//
// Neighborhood addressing (from %25..%38 — clamp-to-edge in each direction):
//   %25 xL_test = (gridX == 0)
//   %27 xL      = %25 ? 0 : gridX - 1
//   %28 yT_test = (gridY == 0)
//   %30 yT      = %28 ? 0 : gridY - 1
//   %32 xR_test = (gridX <  m_width - 1)
//   %34 xR      = %32 ? gridX + 1 : m_width  - 1
//   %36 yB_test = (gridY <  m_height - 1)
//   %38 yB      = %36 ? gridY + 1 : m_height - 1
//   xC = gridX ; yC = gridY
//
// The 8 unique byte-loads (see %39..%73) sample the 3x3 neighborhood on
// input using m_strideIn:
//   idx(x,y) = m_strideIn * y + x   (byte offset from input base)
//   %39/%42 %43 = input[strideIn*yT + xL]    → TL byte
//   %44/%46 %47 = input[strideIn*yT + xC]    → T  byte
//   %48/%50 %51 = input[strideIn*yT + xR]    → TR byte
//   %54/%56 %57 = input[strideIn*yC + xL]    → L  byte
//   %58/%59 %60 = input[strideIn*yC + xC]    → C  byte
//   %61/%63 %64 = input[strideIn*yC + xR]    → R  byte
//   %65/%67 %69 = input[strideIn*yB + xL]    → BL byte
//   %70/%72 %73 = input[strideIn*yB + xC]    → B  byte
//   (NB: BR is NOT loaded — see %82 below.)
//
// Assembly of three <3 x i8> vectors, then u8->u32 conversion via the AIR
// intrinsic `air.convert.u.v3i32.u.v3i8` (zero-extend each lane):
//   %74..%76 top-row    <3 x i8> = { TL, T, TR }
//   %77..%79 mid-row    <3 x i8> = { L , C, R  }
//   %80..%82 bot-row    <3 x i8> = { BL, B, BL }
//     ^^^ IR quirk: lane 2 of the bottom row is `%69` (BL) again — the shader
//     re-uses the (x-1,y+1) sample instead of loading (x+1,y+1). This means
//     the "3x3 box" is actually 8 unique taps with BL double-counted; the
//     kernel is faithful to the FCP shader as compiled. Do NOT "fix" this.
//   %83/%84/%86 = u8->u32 lane-wise widen of the three rows
//   %85         = %84 + %83                 (top + mid, per lane)
//   %87         = %85 + %86                 (top + mid + bot, per lane)
//   %88..%92    = horizontal sum of the 3 lanes of %87
//   %93         = sum / 9                   (unsigned integer division)
//   %94         = trunc to u8
//
// Store (from %95..%98):
//   outIdx = m_strideOut * gridY + gridX
//   output[outIdx] = u8(sum / 9)
//
// -----------------------------------------------------------------------------
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// This kernel is INTEGER-ONLY (no fp ops), so denorm/fast-math flags do not
// apply — the transcription is bit-exact against the AIR IR by construction.

/** Static shape of the params struct — mirrors !18 layout. */
export interface Bm3dnrBufFilterImage2D3x3Plane1xParams {
  /** +0  m_strideIn — bytes per input row (i32) */
  m_strideIn: number;
  /** +4  m_strideOut — bytes per output row (i32) */
  m_strideOut: number;
  /** +8  m_width — image pixel-column count (i32) */
  m_width: number;
  /** +12 m_height — image pixel-row count (i32) */
  m_height: number;
  /** +16 m_globalWidth — grid.x upper bound, exclusive (u32) */
  m_globalWidth: number;
  /** +20 m_globalHeight — grid.y upper bound, exclusive (u32) */
  m_globalHeight: number;
}

/**
 * Per-thread body of the Metal kernel.
 *   input, output: raw uint8 byte planes (Uint8Array / Uint8ClampedArray).
 *   gridX, gridY:  thread coordinates.
 * Returns without writing if the thread is outside the global bounds.
 */
export function bm3dnr_buf__bm3dnr_buf_filterImage2D3x3Plane1x(
  params: Bm3dnrBufFilterImage2D3x3Plane1xParams,
  gridX: number,
  gridY: number,
  input: Uint8Array | Uint8ClampedArray,
  output: Uint8Array | Uint8ClampedArray,
): void {
  // %5  = extractelement grid_in, 0
  const x = gridX >>> 0;
  // %6  = params->m_globalWidth  (field idx 4 -> +16)
  // %8  = (x < globalWidth)  — %8 false ⇒ br to ret (%99)
  const globalWidth = params.m_globalWidth >>> 0;
  if (!(x < globalWidth)) return;

  // %10 = extractelement grid_in, 1
  const y = gridY >>> 0;
  // %11 = params->m_globalHeight (field idx 5 -> +20)
  // %13 = (y < globalHeight) — false ⇒ br to ret
  const globalHeight = params.m_globalHeight >>> 0;
  if (!(y < globalHeight)) return;

  // %16 = params->m_strideIn   (field 0 -> +0)
  const strideIn = params.m_strideIn | 0;
  // %18 = params->m_strideOut  (field 1 -> +4)
  const strideOut = params.m_strideOut | 0;
  // %20 = params->m_width      (field 2 -> +8)
  const width = params.m_width | 0;
  // %22 = params->m_height     (field 3 -> +12)
  const height = params.m_height | 0;

  // %25 %26 %27 : xL = (x == 0) ? 0 : x - 1
  const xL = x === 0 ? 0 : (x - 1) >>> 0;
  // %28 %29 %30 : yT = (y == 0) ? 0 : y - 1
  const yT = y === 0 ? 0 : (y - 1) >>> 0;
  // %31 %32 %33 %34 : xR = (x < width  - 1) ? x + 1 : width  - 1
  const wm1 = (width - 1) >>> 0;
  const xR = x < wm1 ? (x + 1) >>> 0 : wm1;
  // %35 %36 %37 %38 : yB = (y < height - 1) ? y + 1 : height - 1
  const hm1 = (height - 1) >>> 0;
  const yB = y < hm1 ? (y + 1) >>> 0 : hm1;

  // ---- Load the 8 unique 3x3 samples (see %39..%73) ----
  // Row yT
  const rowT = Math.imul(strideIn, yT >>> 0) >>> 0;
  const TL = input[(rowT + xL) >>> 0]; // %43
  const T  = input[(rowT + x ) >>> 0]; // %47
  const TR = input[(rowT + xR) >>> 0]; // %51

  // Row yC
  const rowC = Math.imul(strideIn >>> 0, y) >>> 0;
  const L = input[(rowC + xL) >>> 0]; // %57
  const C = input[(rowC + x ) >>> 0]; // %60
  const R = input[(rowC + xR) >>> 0]; // %64

  // Row yB
  const rowB = Math.imul(yB >>> 0, strideIn) >>> 0;
  const BL = input[(rowB + xL) >>> 0]; // %69
  const B  = input[(rowB + x ) >>> 0]; // %73
  // NB: BR is intentionally NOT loaded — the IR reuses %69 (BL) at lane 2
  // of the bottom-row <3 x i8>. See top-of-file note on %82.

  // ---- Assemble three <3 x i8> vectors (%74..%82) ----
  // top = { TL, T,  TR }
  // mid = { L , C,  R  }
  // bot = { BL, B,  BL }   ← BL re-used at lane 2 (faithful to %82)
  //
  // ---- Widen u8→u32 via air.convert.u.v3i32.u.v3i8 (%83/%84/%86) ----
  // (each lane is a zero-extend, so this is just numeric addition below.)
  //
  // ---- Lane-wise vector adds (%85 = %84 + %83 ; %87 = %85 + %86) ----
  // We do it as three horizontal sums directly on the widened lanes.
  const lane0 = ((TL >>> 0) + (L  >>> 0) + (BL >>> 0)) >>> 0; // %87.x
  const lane1 = ((T  >>> 0) + (C  >>> 0) + (B  >>> 0)) >>> 0; // %87.y
  const lane2 = ((TR >>> 0) + (R  >>> 0) + (BL >>> 0)) >>> 0; // %87.z  (BL, faithful to %82)

  // ---- Horizontal sum across the 3 lanes (%88..%92) ----
  // %90 = %88 + %89 ; %92 = %90 + %91
  const sum = (lane0 + lane1 + lane2) >>> 0;

  // ---- Unsigned divide by 9 (%93) — udiv i32, not sdiv ----
  //   trunc to u8 (%94)
  const mean = (Math.floor(sum / 9) & 0xff) >>> 0;

  // ---- Store output (%95..%98) ----
  // outIdx = m_strideOut * y + x
  const outIdx = (Math.imul(strideOut, y >>> 0) + x) >>> 0; // %97
  output[outIdx] = mean; // store i8

  // br label %99 ; ret void
}
