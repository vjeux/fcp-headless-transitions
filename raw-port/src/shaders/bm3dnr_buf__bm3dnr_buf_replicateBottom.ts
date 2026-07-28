// bm3dnr_buf__bm3dnr_buf_replicateBottom.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_replicateBottom` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_replicateBottom (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_replicateBottom.ll
// (header: `0x00000000006ad8d -- bm3dnr_buf::bm3dnr_buf_replicateBottom`)
//
// Row-replication ("clamp-to-edge extend") kernel. Each thread `(gx, gy)`
// reads the vec4-slot at row `m_height - 1` and column `gx`, then writes
// the SAME vec4 into every row from `m_height` up to `m_heightOut - 1`.
// I.e. it fills the "tail" of a buffer whose content height is `m_height`
// out to a larger allocation height `m_heightOut` by replicating the last
// content row.
//
// Two dispatch paths controlled by m_flag8bit (%25 = (m_flag8bit == 0)):
//   - flag8bit != 0  (8-bit path, %30)  : buffer is treated as uchar4* — the
//                                          source vec4 and the store vec4 are
//                                          both <4 x i8>, 4-byte aligned.
//   - flag8bit == 0  (16-bit path, %44) : buffer is treated as ushort4* — the
//                                          source vec4 and the store vec4 are
//                                          both <4 x i16>, 8-byte aligned.
// Both paths address `buffer` at the same base pointer — the shader
// bitcasts the raw i8* buffer to either <4 x i8>* (%23) or <4 x i16>* (%24)
// before indexing.
//
// The `gy` grid coordinate is USED for the bound check at %12 but is
// NOT USED to compute the destination row: the destination-row iterator
// runs inside the kernel as a `for k in [0, heightOut - height)` loop
// (see %35 / %49 tight loops). This means every `gy` value in the grid
// launches the same fill work — the caller almost certainly uses a
// grid.y of exactly 1 to avoid redundant fills.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_replicateBottom(
//     %params*        %0,    // params struct (6 fields, see below)
//     <2 x i32>       %1,    // thread_position_in_grid   (gx, gy)
//     i8*             %2     // buffer (read+write; bitcast to <4 x i8>* or <4 x i16>*)
//   )
//
// Params struct layout (from !18 in the .ll):
//   int    m_stride        @0   → %15
//   int    m_height        @4   → %17
//   int    m_heightOut     @8   → %19
//   int    m_flag8bit      @12  → %21
//   uint   m_globalWidth   @16  → %6   (bound check on gx, %7)
//   uint   m_globalHeight  @20  → %11  (bound check on gy, %12)
//
// -----------------------------------------------------------------------------
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// This kernel is INTEGER-ONLY (no fp ops), so the flags do not apply — the
// transcription is bit-exact against the AIR IR by construction.

/** Uchar4 pixel — matches `<4 x i8>` lane order (u8-valued 0..255). */
export type Uchar4  = readonly [number, number, number, number];
/** Ushort4 pixel — matches `<4 x i16>` lane order (u16-valued 0..65535). */
export type Ushort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_replicateBottom_params` (!18). */
export interface ReplicateBottomParams {
  /** int  m_stride       — row stride into `buffer` (in <4 x i8> or <4 x i16>
   *                        vec4 units — same numeric value for both paths, since
   *                        both bitcasts use the same base pointer and lane count). */
  readonly stride: number;
  /** int  m_height       — content height (in rows). The source row is (height - 1). */
  readonly height: number;
  /** int  m_heightOut    — target buffer height (in rows). Rows [height, heightOut)
   *                        are filled by replicating row (height - 1). */
  readonly heightOut: number;
  /** int  m_flag8bit     — non-zero → uchar4 path (%30); zero → ushort4 path (%44). */
  readonly flag8bit: number;
  /** uint m_globalWidth  — grid.x upper bound, exclusive. */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid.y upper bound, exclusive. */
  readonly globalHeight: number;
}

/**
 * bm3dnr_buf::bm3dnr_buf_replicateBottom — direct TS mapping of the AIR body.
 *
 * `bufferU8` and `bufferU16` are the SAME underlying buffer expressed
 * through two typed views (matching the IR's two bitcasts %23 and %24).
 * Callers should pass a `Uint8Array` and a `Uint16Array` (or equivalent
 * `Uchar4[]` / `Ushort4[]` arrays) that alias the same storage. Only ONE
 * of the two is touched per invocation, determined by `params.flag8bit`.
 */
export function bm3dnr_buf__bm3dnr_buf_replicateBottom(
  params: ReplicateBottomParams,          // %0
  gridPos: readonly [number, number],     // %1 (gx, gy)
  bufferU8:  Uchar4[],                    // %2 bitcast to <4 x i8>*  (%23)
  bufferU16: Ushort4[],                   // %2 bitcast to <4 x i16>* (%24)
): void {
  const gx = gridPos[0] | 0;              // %4
  const gy = gridPos[1] | 0;              // %9

  // Bounds checks — %7 / %12 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return; // %7  → %58 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return; // %12 → %58 ret

  const stride    = params.stride    | 0;  // %15
  const height    = params.height    | 0;  // %17
  const heightOut = params.heightOut | 0;  // %19
  const flag8bit  = params.flag8bit  | 0;  // %21

  // %26..%29  srcIdx = (height - 1) * stride + gx
  const srcRow = (((height - 1) | 0) * stride) | 0;                // %27 (mul nsw, signed)
  const srcIdx = (srcRow + gx) | 0;                                // %29 (add nsw)

  // %25 = (flag8bit == 0). Non-zero → 8-bit path (%30); zero → 16-bit path (%44).
  if (flag8bit !== 0) {
    // -----------------------------------------------------------------------
    // %30..%43  8-bit path.
    //   %32 = load <4 x i8>  bufferU8[srcIdx]
    //   loop k = 0 .. (heightOut - height) - 1:
    //     dstIdx = (k + height) * stride + gx
    //     bufferU8[dstIdx] = %32
    // -----------------------------------------------------------------------
    const src = bufferU8[srcIdx];                                  // %32

    // %33..%34  fillCount = heightOut - height  ; break if <= 0.
    const fillCount = (heightOut - height) | 0;                    // %33 (sub, signed)
    if (fillCount <= 0) return;                                    // %34 → %58 ret

    // %35 loop — increment `k` from 0 until it equals `fillCount`.
    for (let k = 0; k !== fillCount; k = (k + 1) | 0) {
      // %37 = k + height
      const row = (k + height) | 0;
      // %38 = row * stride
      const rowBase = (row * stride) | 0;
      // %40 = rowBase + gx
      const dstIdx = (rowBase + gx) | 0;
      // %41 store <4 x i8> %32, %41
      bufferU8[dstIdx] = src;
      // %42 = k + 1 ; %43 = %42 == fillCount ; br
    }
    // %58 ret
    return;
  }

  // -----------------------------------------------------------------------
  // %44..%57  16-bit path (flag8bit == 0).
  //   %46 = load <4 x i16> bufferU16[srcIdx]
  //   loop k = 0 .. (heightOut - height) - 1:
  //     dstIdx = (k + height) * stride + gx
  //     bufferU16[dstIdx] = %46
  // -----------------------------------------------------------------------
  const src16 = bufferU16[srcIdx];                                 // %46

  // %47..%48  fillCount = heightOut - height ; break if <= 0.
  const fillCount16 = (heightOut - height) | 0;                    // %47 (sub, signed)
  if (fillCount16 <= 0) return;                                    // %48 → %58 ret

  // %49 loop — increment `k` from 0 until it equals `fillCount16`.
  for (let k = 0; k !== fillCount16; k = (k + 1) | 0) {
    // %51 = k + height
    const row = (k + height) | 0;
    // %52 = row * stride
    const rowBase = (row * stride) | 0;
    // %54 = rowBase + gx
    const dstIdx = (rowBase + gx) | 0;
    // %55 store <4 x i16> %46, %55
    bufferU16[dstIdx] = src16;
    // %56 = k + 1 ; %57 = %56 == fillCount ; br
  }
  // %58 ret
}
