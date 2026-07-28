// bm3dnr_buf__bm3dnr_buf_replicateRight.ts — direct TS mapping of the
// @shader bm3dnr_buf::bm3dnr_buf_replicateRight (HeliumSenso)
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_replicateRight.ll
// (header line: `0x0000000006ccad -- bm3dnr_buf::bm3dnr_buf_replicateRight`)
//
// "Replicate right edge" padding kernel — for each row `gy`, it reads the last valid pixel
// (at index `m_width - 1`) and copies it into every slot from index `m_width` up to
// (exclusive) `m_stride`. Two byte-width paths, dispatched by `m_flag8bit`:
//   • m_flag8bit != 0 → 4-byte tiles (uchar4 lanes, aliased as `<4 x i8>`)
//   • m_flag8bit == 0 → 8-byte tiles (ushort4 lanes, aliased as `<4 x i16>`)
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_replicateRight(
//     %params*    %0,     // 5-field params struct (see !18)
//     <2 x i32>   %1,     // thread_position_in_grid   (gx, gy)   — gx is unused past bounds
//     i8*         %2      // buffer  (aliased as <4 x i8>* or <4 x i16>* per m_flag8bit)
//   )
//
// Params struct layout (!18):
//   int  m_width         @0    → %15   (last valid pixel index = m_width - 1)
//   int  m_stride        @4    → %17   (row stride in tiles; positions [m_width, m_stride) are
//                                        the right-edge pad region)
//   int  m_flag8bit      @8    → %19   (non-zero → uchar4 path ; zero → ushort4 path)
//   uint m_globalWidth   @12   → %6    (bound check on gx)
//   uint m_globalHeight  @16   → %11   (bound check on gy)
//
// Algorithm decoded (%13..%54):
//   0. If gx >= globalWidth OR gy >= globalHeight, return.                    // %7 / %12
//   1. Compute the row base + last-valid-pixel offset:
//        rowBase = m_stride * gy                                              // %25
//        lastIdx = rowBase + m_width - 1                                      // %28 = %27 + (-1)
//   2. Compute the number of pad slots to fill:
//        padCount = m_stride - m_width                                        // %33 / %46
//   3. Dispatch on m_flag8bit:
//        if (m_flag8bit != 0) {                                              // %23 icmp eq 0
//          // 4-byte path
//          tile = buffer[lastIdx];   // <4 x i8>                             // %30/%31 load
//          rep  = <tile[3], tile[3], tile[3], tile[3]>                        // %32 shufflevector
//          for (i = 0; i < padCount; ++i)
//            buffer[rowBase + i + m_width] = rep;                            // wait: check GEP
//        } else {
//          // 8-byte path — same shape, <4 x i16> tiles.
//          tile = buffer[lastIdx];   // <4 x i16>                            // %43/%44 load
//          rep  = <tile[3], tile[3], tile[3], tile[3]>                        // %45 shufflevector
//          for (i = 0; i < padCount; ++i)
//            buffer[rowBase + i + m_width] = rep;
//        }
//   4. return (%55).
//
// A closer read of the GEP:
//   %27 = rowBase + m_width  (add %25 %26 where %26 = sext m_width)          → the FIRST pad idx
//   %28 = %27 + (-1)                                                          → lastIdx
//   In the loop: %38 = %27 + i   (or %51 = %27 + i for the 16bit path)       — so the store
//   position is `rowBase + m_width + i`, i.e. positions [m_width, m_width + padCount) in the
//   row. Since padCount = m_stride - m_width, this fills positions [m_width, m_stride).
//
// The shufflevector <3,3,3,3> broadcasts LANE 3 of the source tile (i.e. the last channel /
// last sample of the last valid pixel) to all 4 lanes of every pad tile. If tiles are 4
// horizontal pixels per lane, lane-3 is the rightmost pixel — so this really does "replicate
// the right-edge pixel across every pad slot". If tiles are packed pixels-per-tile with 4
// channels per lane, this replicates channel-3 (typically alpha) to all channels — either
// way, the IR faithfully copies lane 3 → all 4 lanes.
//
// NO FP math, no exp2/floor/clamp. All operations are integer indexing + vector shuffle +
// store. Both paths are byte-for-byte structural copies of each other; the only difference is
// the pointer bitcast (`i8*` reinterpreted as `<4 x i8>*` @%21 vs `<4 x i16>*` @%22) and thus
// the tile size.

/** UChar4 tile — matches `<4 x i8>` lane order (unsigned 8-bit lanes as JS numbers). */
export type UChar4 = readonly [number, number, number, number];
/** UShort4 tile — matches `<4 x i16>` lane order (unsigned 16-bit lanes as JS numbers). */
export type UShort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_replicateRight_params` (!18). */
export interface ReplicateRightParams {
  /** int  m_width  — last valid pixel index = m_width - 1. */
  readonly width: number;
  /** int  m_stride — row stride in tiles; pad region is [m_width, m_stride). */
  readonly stride: number;
  /** int  m_flag8bit — non-zero → uchar4 path, zero → ushort4 path. */
  readonly flag8bit: number;
  /** uint m_globalWidth  — grid width in output columns (unused after bounds check). */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid height in output rows. */
  readonly globalHeight: number;
}

/**
 * A dual-typed "buffer" view — the AIR kernel aliases a single `i8*` (`%2`) as either a
 * `<4 x i8>*` (@%21) OR a `<4 x i16>*` (@%22) depending on `m_flag8bit`. In TS we can't
 * bitcast; the caller supplies the correctly-typed array up front, and we dispatch based on
 * the same `m_flag8bit` flag. The caller MUST pick the array matching the flag (or the
 * unused array's slot passes through untouched).
 */
export interface ReplicateRightBuffers {
  /** Used when m_flag8bit != 0.  Row-major indexing: buf8[gy*stride + x]. */
  readonly buf8?: UChar4[];
  /** Used when m_flag8bit == 0.  Row-major indexing: buf16[gy*stride + x]. */
  readonly buf16?: UShort4[];
}

/**
 * bm3dnr_buf::bm3dnr_buf_replicateRight — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value in the .ll is cited by the
 * `// %N` tag on its producing statement below.
 */
export function bm3dnr_buf__bm3dnr_buf_replicateRight(
  params: ReplicateRightParams,                // %0
  gridPos: readonly [number, number],          // %1 (gx, gy)
  buffers: ReplicateRightBuffers,              // %2  (dual-alias — see interface docs)
): void {
  const gx = gridPos[0] | 0;                    // %4
  const gy = gridPos[1] | 0;                    // %9

  // %5-%7  bound check on gx.
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %7 → jump to shared %55 exit
  // %10-%12 bound check on gy.
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %12 → jump to shared %55 exit

  const width    = params.width    | 0;         // %15
  const stride   = params.stride   | 0;         // %17
  const flag8bit = params.flag8bit | 0;         // %19

  // %25  rowBase = stride * gy   (sext to i64)
  const rowBase = Math.imul(stride, gy) | 0;
  // %27  firstPadIdx = rowBase + width
  const firstPadIdx = (rowBase + width) | 0;
  // %28  lastIdx = firstPadIdx - 1  = rowBase + width - 1
  const lastIdx = (firstPadIdx - 1) | 0;
  // %33 / %46  padCount = stride - width
  const padCount = (stride - width) | 0;

  // %23  icmp eq m_flag8bit, 0  → br i1 → 42 (else, ushort4) or 29 (then, uchar4).
  //   Note: the IR condition is `%23 = icmp eq %19, 0`, and `br i1 %23, label %42, label %29`
  //   — so when %23 is TRUE (flag == 0) it jumps to %42 (the ushort4 path), and when FALSE
  //   (flag != 0) it falls to %29 (the uchar4 path). That matches the header comment.
  if (flag8bit !== 0) {
    // ── uchar4 path (block %29 in the IR) ────────────────────────────────────────────────
    const buf = buffers.buf8;
    if (buf === undefined) {
      // buf8 not provided — the caller violated the interface contract. Raise so the
      // demand signal isn't silenced by writing to a scratch array.
      throw new Error(
        "raise: bm3dnr_buf_replicateRight uchar4 path requested (m_flag8bit != 0) but " +
          "buffers.buf8 is undefined — the AIR kernel bitcast i8* → <4 x i8>* @%21 " +
          "requires a uchar4 view of the buffer.",
      );
    }
    // %30/%31  tile = buf[lastIdx] as <4 x i8>
    const tile = buf[lastIdx];
    // %32  shufflevector <3,3,3,3> — broadcast lane 3 to all 4 lanes.
    const rep: UChar4 = [tile[3], tile[3], tile[3], tile[3]] as const;
    // %33-%34  if (padCount <= 0) return.
    if (padCount <= 0) return;
    // %35-%41  loop i = 0..padCount-1: buf[firstPadIdx + i] = rep.
    for (let i = 0; i < padCount; i++) {   // %36 phi ; %40 add nuw nsw 1 ; %41 cmp
      buf[(firstPadIdx + i) | 0] = rep;    // %39 gep ; store <4 x i8>
    }
  } else {
    // ── ushort4 path (block %42 in the IR) ───────────────────────────────────────────────
    const buf = buffers.buf16;
    if (buf === undefined) {
      throw new Error(
        "raise: bm3dnr_buf_replicateRight ushort4 path requested (m_flag8bit == 0) but " +
          "buffers.buf16 is undefined — the AIR kernel bitcast i8* → <4 x i16>* @%22 " +
          "requires a ushort4 view of the buffer.",
      );
    }
    // %43/%44  tile = buf[lastIdx] as <4 x i16>
    const tile = buf[lastIdx];
    // %45  shufflevector <3,3,3,3> — broadcast lane 3 to all 4 lanes.
    const rep: UShort4 = [tile[3], tile[3], tile[3], tile[3]] as const;
    // %46-%47  if (padCount <= 0) return.
    if (padCount <= 0) return;
    // %48-%54  loop i = 0..padCount-1: buf[firstPadIdx + i] = rep.
    for (let i = 0; i < padCount; i++) {   // %49 phi ; %53 add nuw nsw 1 ; %54 cmp
      buf[(firstPadIdx + i) | 0] = rep;    // %52 gep ; store <4 x i16>
    }
  }
}
