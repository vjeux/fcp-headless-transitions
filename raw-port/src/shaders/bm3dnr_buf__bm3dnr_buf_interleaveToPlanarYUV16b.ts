// bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUV16b.ts
// @shader bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b (HeliumSenso)
// Direct TS mapping of the Metal compute kernel decompiled at
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUV16b.ll (@0x000000000443dd)
//
// De-interleaves a packed ushort4 image into separate Y/U/V/A planes with an
// optional 4:4:4 vs subsampled (4:2:2-style) chroma layout selected by the
// `m_flag444` parameter. All arithmetic is 16-bit unsigned integer; the only
// per-lane op is `lshr <4 x i16>` with a broadcasted `m_shift & 15` count.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUV16b(
//     %params*      %0,  // params struct (9 x u32; see below)
//     <2 x i32>     %1,  // thread_position_in_grid    (gx, gy)
//     <4 x i16>*    %2,  // input   (ushort4; read-only)
//     <4 x i16>*    %3,  // outputY (ushort4; write)
//     <4 x i16>*    %4,  // outputU (ushort4; write)
//     <4 x i16>*    %5,  // outputV (ushort4; write)
//     <4 x i16>*    %6   // outputA (ushort4; write; unused in the 4:4:4 branch)
//   )
//
// Params struct layout (from !18 in the .ll):
//   u32 m_strideIn      @0   -> %19
//   u32 m_strideY       @4   -> %21
//   u32 m_strideUV      @8   -> %23
//   u32 m_mul           @12  -> %25    (input y-row multiplier)
//   u32 m_off           @16  -> %27    (input y-row offset)
//   u32 m_shift         @20  -> %29    (right-shift amount; masked to 4 bits)
//   u32 m_flag444       @24  -> %31    (0 -> 4:4:4 branch %85 ; else subsampled branch %58)
//   u32 m_globalWidth   @28  -> %10    (bound check on gx = %8)
//   u32 m_globalHeight  @32  -> %15    (bound check on gy = %13)
//
// Semantics recovered from the AIR:
//   %7 -> %12 -> %17 -> {%58 or %85} -> %112 (ret)
//     if (gx >= globalWidth)  return;                       // %9..%11
//     if (gy >= globalHeight) return;                       // %14..%16
//   Compute the 4 input <4 x i16> vec4 addresses at consecutive columns
//   (gx*4, gx*4+1, gx*4+2, gx*4+3) on row `(m_mul*gy + m_off) * m_strideIn`:
//     rowInBase = (m_mul * gy + m_off) * m_strideIn         // %38..%41
//     v44 = in[gx*4 + 0 + rowInBase]                        // %42/%43/%44
//     v47 = in[gx*4 + 1 + rowInBase]                        // %45/%46/%47
//     v50 = in[gx*4 + 2 + rowInBase]                        // %48/%49/%50
//     v53 = in[gx*4 + 3 + rowInBase]                        // %51/%52/%53
//
//   Shared "lane 0 across the 4 pixels":
//     v57 = <v44.x, v47.x, v50.x, v53.x>                    // %55/%56/%57
//
//   %54 : flag444 == 0 ?
//     TRUE  branch %85 (4:4:4 layout — Y is *doubled*: two <4 x i16> stores per
//                        (gy,gx) into outputY, plus one U and one V; no A):
//       v88 = <v44.z, v47.z, v50.z, v53.z>                  // %86/%87/%88   ("V")
//       v89 = <v44[1], v44[3], v47[1], v47[3]>              // %89           ("Y even pixels")
//       v90 = <v50[1], v50[3], v53[1], v53[3]>              // %90           ("Y odd pixels")
//       shBcast = broadcast(u16(shift & 15))                // %93/%94/%95/%96
//       out[Y ][strideY *gy + 2*gx    ] = v89 >> shBcast    // %97..%101
//       out[Y ][strideY *gy + 2*gx + 1] = v90 >> shBcast    // %102..%104
//       out[U ][strideUV*gy + gx      ] = v57 >> shBcast    // %105..%109
//       out[V ][strideUV*gy + gx      ] = v88 >> shBcast    // %110..%111
//     FALSE branch %58 (subsampled layout — one vec4 per plane at (gy,gx),
//                        plus a full-A store):
//       v61 = <v44.y, v47.y, v50.y, v53.y>                  // %59/%60/%61   ("Y")
//       v64 = <v44.z, v47.z, v50.z, v53.z>                  // %62/%63/%64   ("U")
//       v67 = <v44.w, v47.w, v50.w, v53.w>                  // %65/%66/%67   ("V")
//       shBcast = broadcast(u16(shift & 15))                // %68..%71
//       out[Y ][strideY *gy + gx] = v61 >> shBcast          // %72..%76
//       out[U ][strideUV*gy + gx] = v64 >> shBcast          // %77..%81
//       out[V ][strideUV*gy + gx] = v67 >> shBcast          // %82..%83
//       out[A ][strideUV*gy + gx] = v57                     // %84  (no shift!)
//
// The .ll has `air.compile.fast_math_disable` and `no-trapping-math=true`.
// Only shufflevector + lshr + integer stores are used; no float ops, no
// air.* intrinsics — direct TS mapping.
//
// Small caveat: the outputA store in the subsampled branch (%84) is the ONLY
// store in the whole kernel that does NOT apply `>> shBcast`. That matches
// the .ll bit-for-bit — the A samples pass through verbatim.

export interface Bm3dnrBufInterleaveToPlanarYUV16bParams {
  m_strideIn: number;     // u32 @0
  m_strideY: number;      // u32 @4
  m_strideUV: number;     // u32 @8
  m_mul: number;          // u32 @12
  m_off: number;          // u32 @16
  m_shift: number;        // u32 @20
  m_flag444: number;      // u32 @24
  m_globalWidth: number;  // u32 @28
  m_globalHeight: number; // u32 @32
}

/** ushort4-packed image plane — 8 bytes per vec4 slot, little-endian u16 lanes. */
export type Ushort4Buffer = Uint16Array;

/**
 * Load a <4 x i16> vec4 at `vec4Index` (i.e. `Uint16Array` offset = vec4Index*4).
 * Returns a fresh Uint16Array of length 4 so callers cannot alias into the buffer.
 */
function loadV4U16(buf: Ushort4Buffer, vec4Index: number): Uint16Array {
  const b = vec4Index * 4;
  const r = new Uint16Array(4);
  r[0] = buf[b + 0];
  r[1] = buf[b + 1];
  r[2] = buf[b + 2];
  r[3] = buf[b + 3];
  return r;
}

/**
 * Store a <4 x i16> vec4 at `vec4Index` in `buf`.
 */
function storeV4U16(buf: Ushort4Buffer, vec4Index: number, v: Uint16Array): void {
  const b = vec4Index * 4;
  buf[b + 0] = v[0];
  buf[b + 1] = v[1];
  buf[b + 2] = v[2];
  buf[b + 3] = v[3];
}

/**
 * `lshr <4 x i16> v, broadcast(shift)` — lane-wise unsigned right shift.
 * The IR masks `shift` to 4 bits via `and <i16 15, undef, undef, undef>`
 * (%70/%95) before broadcasting — so shifts >= 16 wrap to shift & 15.
 */
function lshrV4U16(v: Uint16Array, shift: number): Uint16Array {
  const s = shift & 15;
  const r = new Uint16Array(4);
  // Uint16Array auto-truncates each store to u16; no explicit mask needed.
  r[0] = v[0] >>> s;
  r[1] = v[1] >>> s;
  r[2] = v[2] >>> s;
  r[3] = v[3] >>> s;
  return r;
}

/**
 * Direct TS mapping of the AIR kernel body for one output vec4 at (gx,gy).
 * `input` and each `output*` are Uint16Array-packed ushort4 buffers indexed
 * by vec4-slot (4 u16 lanes = 8 bytes per slot).
 */
export function bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUV16b(
  params: Bm3dnrBufInterleaveToPlanarYUV16bParams,
  grid_in: [number, number],
  input: Ushort4Buffer,
  outputY: Ushort4Buffer,
  outputU: Ushort4Buffer,
  outputV: Ushort4Buffer,
  outputA: Ushort4Buffer,
): void {
  // %8, %13 : gx, gy
  const gx = grid_in[0] >>> 0;
  const gy = grid_in[1] >>> 0;

  // %9..%11 : if (gx >= globalWidth) return
  if (gx >= (params.m_globalWidth >>> 0)) return;
  // %14..%16 : if (gy >= globalHeight) return
  if (gy >= (params.m_globalHeight >>> 0)) return;

  // %19, %21, %23, %25, %27, %29, %31
  const strideIn = params.m_strideIn >>> 0;
  const strideY = params.m_strideY >>> 0;
  const strideUV = params.m_strideUV >>> 0;
  const mul = params.m_mul >>> 0;
  const off = params.m_off >>> 0;
  const shift = params.m_shift >>> 0;
  const flag444 = params.m_flag444 >>> 0;

  // %38..%41 : rowInBase = (m_mul * gy + m_off) * m_strideIn
  //   `mul i32 %25, %13` -> %38, `add %27, %38` -> %39, `mul %19, %39` -> %40.
  const rowInBase = ((mul * gy + off) * strideIn) >>> 0;

  // %34..%42 : v44 = in[gx*4 + 0 + rowInBase]
  //   `shl nuw nsw i64 %32, 2` -> %34 = gx*4 ; `or 1/2/3` -> %35/%36/%37.
  const gx4 = (gx * 4) >>> 0;
  const v44 = loadV4U16(input, gx4 + 0 + rowInBase);         // %42..%44
  const v47 = loadV4U16(input, gx4 + 1 + rowInBase);         // %45..%47
  const v50 = loadV4U16(input, gx4 + 2 + rowInBase);         // %48..%50
  const v53 = loadV4U16(input, gx4 + 3 + rowInBase);         // %51..%53

  // %55/%56/%57 : v57 = [v44.x, v47.x, v50.x, v53.x] (lane-0 across 4 pixels)
  const v57 = new Uint16Array([v44[0], v47[0], v50[0], v53[0]]);

  // %54 : `flag444 == 0` selects the 4:4:4 branch %85; else the subsampled %58.
  if (flag444 === 0) {
    // ---- 4:4:4 branch (%85) ----
    // %86/%87/%88 : v88 = [v44.z, v47.z, v50.z, v53.z]  ("V" plane data)
    const v88 = new Uint16Array([v44[2], v47[2], v50[2], v53[2]]);
    // %89 : v89 = shuffle(v44, v47, <1,3,5,7>) = [v44[1], v44[3], v47[1], v47[3]]
    const v89 = new Uint16Array([v44[1], v44[3], v47[1], v47[3]]);
    // %90 : v90 = shuffle(v50, v53, <1,3,5,7>) = [v50[1], v50[3], v53[1], v53[3]]
    const v90 = new Uint16Array([v50[1], v50[3], v53[1], v53[3]]);

    // Store positions (%91..%111):
    //   posY0 = strideY * gy + 2*gx
    //   posY1 = strideY * gy + 2*gx + 1
    //   posUV = strideUV * gy + gx
    const gx2 = (gx * 2) >>> 0;
    const posY0 = (strideY * gy + gx2) >>> 0;                // %98..%100
    const posY1 = (strideY * gy + gx2 + 1) >>> 0;            // %103
    const posUV = (strideUV * gy + gx) >>> 0;                // %106..%108

    // %97 : lshr v89, shBcast  -> outputY[posY0]                 (%101)
    storeV4U16(outputY, posY0, lshrV4U16(v89, shift));
    // %102 : lshr v90, shBcast -> outputY[posY1]                 (%104)
    storeV4U16(outputY, posY1, lshrV4U16(v90, shift));
    // %105 : lshr v57, shBcast -> outputU[posUV]                 (%109)
    storeV4U16(outputU, posUV, lshrV4U16(v57, shift));
    // %110 : lshr v88, shBcast -> outputV[posUV]                 (%111)
    storeV4U16(outputV, posUV, lshrV4U16(v88, shift));
    // (No outputA store in the 4:4:4 branch.)
  } else {
    // ---- subsampled branch (%58) ----
    // %59/%60/%61 : v61 = [v44.y, v47.y, v50.y, v53.y]  ("Y" plane data)
    const v61 = new Uint16Array([v44[1], v47[1], v50[1], v53[1]]);
    // %62/%63/%64 : v64 = [v44.z, v47.z, v50.z, v53.z]  ("U" plane data)
    const v64 = new Uint16Array([v44[2], v47[2], v50[2], v53[2]]);
    // %65/%66/%67 : v67 = [v44.w, v47.w, v50.w, v53.w]  ("V" plane data)
    const v67 = new Uint16Array([v44[3], v47[3], v50[3], v53[3]]);

    // Store positions (%73..%84):
    //   posY  = strideY  * gy + gx
    //   posUV = strideUV * gy + gx    (same slot re-used across U/V/A)
    const posY = (strideY * gy + gx) >>> 0;                  // %74/%75
    const posUV = (strideUV * gy + gx) >>> 0;                // %79/%80

    // %72 : lshr v61, shBcast -> outputY[posY]                   (%76)
    storeV4U16(outputY, posY, lshrV4U16(v61, shift));
    // %77 : lshr v64, shBcast -> outputU[posUV]                  (%81)
    storeV4U16(outputU, posUV, lshrV4U16(v64, shift));
    // %82 : lshr v67, shBcast -> outputV[posUV]                  (%83)
    storeV4U16(outputV, posUV, lshrV4U16(v67, shift));
    // %84 : v57 (verbatim, NO shift) -> outputA[posUV]
    storeV4U16(outputA, posUV, v57);
  }
}
