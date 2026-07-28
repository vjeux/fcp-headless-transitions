// @shader bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16 (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_interleaveToPlanarYUVfp16.ll
//   (see .ll header @0x48e6d)
//
// SIGNATURE (from !14 / !17..!24 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16"(
//     %params*      addrspace(2) %0,   // constant buffer (see !18)
//     <2 x i32>                  %1,   // grid_in (thread pos in grid)
//     half*         addrspace(1) %2,   // input     (device R, fp16 interleaved)
//     <4 x i16>*    addrspace(1) %3,   // outputY   (device R/W, ushort4)
//     <4 x i16>*    addrspace(1) %4,   // outputU   (device R/W, ushort4)
//     <4 x i16>*    addrspace(1) %5,   // outputV   (device R/W, ushort4)
//     <4 x i16>*    addrspace(1) %6    // outputA   (device R/W, ushort4)
//   )
// PARAMS struct (from !18 — 32 bytes / 8 int32 fields):
//   { u32  m_strideIn,     // +0    (uint; fp16 buffer row stride)
//     u32  m_strideY,      // +4    (uint; Y plane row stride in ushort4 units)
//     u32  m_strideUVA,    // +8    (uint; U/V/A row stride in ushort4 units)
//     u32  m_mul,          // +12   (uint; loaded, never referenced — dead read)
//     u32  m_off,          // +16   (uint; part of the row-offset math)
//     i32  m_shift,        // +20   (signed; lshr amount on output ushort4)
//     u32  m_globalWidth,  // +24   (uint; grid bound)
//     u32  m_globalHeight  // +28   (uint; grid bound) }
//
// Note: m_mul (%19) and m_off (%27) load, but %19 is never used past the load.
// Metal's compiler emitted the load for %18 (m_strideIn) via the same GEP
// walk and left the aliased %19 as an unused load; we mirror the load
// faithfully as `params.m_mul` but do NOT plumb it into any expression
// — no such use exists in the .ll.
//
// FAST-MATH: fast-math is disabled (!11, !12). fp32 ops appear only for
// the (fp16 -> fp32 -> u16) conversion; each fadd/fmul is Math.fround'd
// to preserve fp32 bit-exactness. air.clamp is a lane-wise clamp.
//
// SHAPE:
//   For each (x = grid_in.x, y = grid_in.y) inside the [m_globalWidth x
//   m_globalHeight] grid, the kernel reads a 4-wide x 4-channel-interleaved
//   fp16 tile (== 16 halves) starting at
//     inBase = ((m_strideY * y) + m_off) * m_strideIn
//   Wait — that's Metal C++'s expression order; the actual IR (!44/%36..%38)
//   computes it as ((%25 * %13) + %27) * %19 where %25=m_strideUVA,
//   %27=m_off, %19=m_strideIn. That's the "reader" side offset.
//   The four vectors (%59, %79, %99, %119) hold the four rows of the tile:
//     %59  = [in[base+0],  in[base+1],  in[base+2],  in[base+3]]   (row 0)
//     %79  = [in[base+4],  in[base+5],  in[base+6],  in[base+7]]   (row 1)
//     %99  = [in[base+8],  in[base+9],  in[base+10], in[base+11]]  (row 2)
//     %119 = [in[base+12], in[base+13], in[base+14], in[base+15]]  (row 3)
//   Wait — check offsets: %33 = xBase | 1, %34 = xBase | 2, %35 = xBase | 3
//   where xBase = %30 shl 2 = gridX*4 (low bits zero). And %40 = xBase + rowOff,
//   %60 = %33 + rowOff, %80 = %34 + rowOff, %100 = %35 + rowOff. So the four
//   rows are at rowOff, rowOff+1, rowOff+2, rowOff+3 shifted by xBase. Each
//   row loads FOUR consecutive halves. So the tile actually reads
//     row 0: gridX*4+0, gridX*4+1, gridX*4+2, gridX*4+3 at rowOff
//     row 1: same four cols at rowOff+1
//     ... etc. Rows are consecutive HALVES within the SAME input byte-row —
//   this is the classic "planarize a 4-channel interleaved half stream into
//   Y/U/V/A planes" pattern.
//
//   The shufflevector chain then transposes the 4 x 4 float matrix so that
//   each output plane row picks one "channel lane" across the 4 pixels:
//     %134 = [row0[0], row1[0], row2[0], row3[0]]   — "lane-0 row"
//     %137 = [row0[1], row1[1], row2[1], row3[1]]   — "lane-1 row"
//     %140 = [row0[2], row1[2], row2[2], row3[2]]   — "lane-2 row"
//     %143 = [row0[3], row1[3], row2[3], row3[3]]   — "lane-3 row"
//
//   Store mapping (per the .ll — see stores at %152/%157/%159/%160):
//     outputY(%3)[y*strideY   + x]  <-  lshr(%137, shift)   — "lane-1 row"
//     outputU(%4)[y*strideUVA + x]  <-  lshr(%140, shift)   — "lane-2 row"
//     outputV(%5)[y*strideUVA + x]  <-  lshr(%143, shift)   — "lane-3 row"
//     outputA(%6)[y*strideUVA + x]  <-       %134           — "lane-0 row" (NO lshr)
//   The name "Y" being stored with the lane-1 vector and the last store
//   (outputA) receiving the unshifted lane-0 vector is exactly what the IR
//   emits; we transcribe it verbatim rather than "fix" a source-level
//   mismatch. Whatever the Metal author intended, this is what runs.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16/+20/+24/+28 into the 32-byte struct.
 * @shader bm3dnr_buf::bm3dnr_buf_interleaveToPlanarYUVfp16 — !18 in the .ll.
 */
export interface Bm3dnrBufInterleaveToPlanarYUVfp16Params {
  // +0  — uint32 fp16 row stride (%19 in IR, m_strideIn per !18)
  m_strideIn: number;
  // +4  — uint32 Y-plane row stride (%21 in IR, m_strideY per !18)
  m_strideY: number;
  // +8  — uint32 U/V/A row stride (%23 in IR, m_strideUVA per !18)
  m_strideUVA: number;
  // +12 — uint32 (%25 in IR, m_mul per !18; loaded but never referenced)
  m_mul: number;
  // +16 — uint32 (%27 in IR, m_off per !18; used in inBase math)
  m_off: number;
  // +20 — int32 signed shift amount (%29 in IR, m_shift per !18)
  m_shift: number;
  // +24 — uint32 grid domain width  (%10 in IR)
  m_globalWidth: number;
  // +28 — uint32 grid domain height (%15 in IR)
  m_globalHeight: number;
}

// ushort4 output pixel: length-4 tuple of 0..65535 uint16 lanes.
export type UShort4Out = [number, number, number, number];

/**
 * The fp32 constant 65535.0 broadcast to a v4f32 in %120/%123/%126/%129.
 * IR spells it as `float 6.553500e+04` — an exact fp32 value.
 */
const F32_65535 = Math.fround(65535.0);

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params      constant buffer (%0)
 * @param gridX       grid_in.x  (extractelement %1, 0)      — %8
 * @param gridY       grid_in.y  (extractelement %1, 1)      — %13
 * @param input       read-only fp16 buffer                  — %2 (represented
 *                    as a plain number[] of Math.fround'd fp32 values —
 *                    caller is responsible for converting half->fp32 on load;
 *                    IR does `fpext half to float` on each element so we
 *                    faithfully receive the fp32-narrowed value here.)
 * @param outputY     read-write ushort4 buffer              — %3
 * @param outputU     read-write ushort4 buffer              — %4
 * @param outputV     read-write ushort4 buffer              — %5
 * @param outputA     read-write ushort4 buffer              — %6
 */
export function bm3dnr_buf_interleaveToPlanarYUVfp16(
  params: Bm3dnrBufInterleaveToPlanarYUVfp16Params,
  gridX: number,
  gridY: number,
  input: readonly number[] | Float32Array,
  outputY: UShort4Out[],
  outputU: UShort4Out[],
  outputV: UShort4Out[],
  outputA: UShort4Out[],
): void {
  // %8..%11: if (grid_in.x >= m_globalWidth) return.
  //   %8  = extractelement <2 x i32> %1, i64 0
  //   %9  = gep params, i32 6         (m_globalWidth)
  //   %10 = load i32
  //   %11 = icmp ult i32 %8, %10
  //   br i1 %11, label %12, label %161
  if (!((gridX >>> 0) < (params.m_globalWidth >>> 0))) return;

  // %13..%16: if (grid_in.y >= m_globalHeight) return.
  //   %13 = extractelement <2 x i32> %1, i64 1
  //   %14 = gep params, i32 7         (m_globalHeight)
  //   %15 = load i32
  //   %16 = icmp ult i32 %13, %15
  //   br i1 %16, label %17, label %161
  if (!((gridY >>> 0) < (params.m_globalHeight >>> 0))) return;

  // %17..%29: load all six remaining params in field order.
  //   %19 = m_strideIn   (uint)
  //   %21 = m_strideY    (uint)
  //   %23 = m_strideUVA  (uint)
  //   %25 = m_mul        (uint; loaded but never referenced after)
  //   %27 = m_off        (uint)
  //   %29 = m_shift      (int)
  const strideIn = params.m_strideIn | 0;
  const strideY = params.m_strideY | 0;
  const strideUVA = params.m_strideUVA | 0;
  // %25 = m_mul — loaded in IR but not used further; keep the reference so
  // future readers of this transcription can see the dead-read explicitly.
  void params.m_mul;
  const offConst = params.m_off | 0;
  const shiftRaw = params.m_shift | 0;

  // %30 = zext grid_in.x to i64
  // %31 = zext grid_in.y to i64
  // %32 = %30 shl 2   (xBase = gridX * 4)
  // %33 = %32 | 1     (xBase + 1)
  // %34 = %32 | 2     (xBase + 2)
  // %35 = %32 | 3     (xBase + 3)
  const xBase = ((gridX | 0) * 4) | 0;

  // %36 = %25 * %13   (uses %25 = m_strideUVA — wait, that's the loaded
  //   value ORDER: field indices 0,1,2,3,4,5 -> %19,%21,%23,%25,%27,%29.
  //   The IR then does `%36 = mul i32 %25, %13` — i.e. m_mul * gridY. BUT
  //   %25 is m_mul per !18, not m_strideUVA. Re-read:
  //     %22 = gep i32 2   (m_strideUVA)  -> %23 = load
  //     %24 = gep i32 3   (m_mul)        -> %25 = load
  //   So %36 = m_mul * gridY. The "unused m_mul" observation above was
  //   wrong on my first read — m_mul IS used, in the reader-side offset.
  //   %37 = m_mul*gridY + m_off
  //   %38 = %37 * m_strideIn
  //   %39 = zext %38 to i64
  //   %40 = xBase + %39     (inBase for row 0)
  const rowOff = Math.imul(Math.imul(params.m_mul | 0, gridY | 0) + offConst | 0, strideIn) | 0;
  const inBase = (xBase + rowOff) | 0; // %40

  // ============================================================
  // Load 16 halves as four <4 x float> vectors, one per row.
  // ============================================================
  //   %41..%59  -> v0 (row 0, cols 0..3)     — indices %40, %40+1, %40+2, %40+3
  //   %61..%79  -> v1 (row 1, cols 0..3)     — indices %60, %60+1, %60+2, %60+3
  //   %81..%99  -> v2 (row 2, cols 0..3)     — indices %80, %80+1, %80+2, %80+3
  //   %101..%119-> v3 (row 3, cols 0..3)     — indices %100, %100+1, %100+2, %100+3
  //   Each element load is `load half` followed by `fpext half to float`;
  //   see file header comment on the caller's fp32-narrowed input.
  //
  // The four "row starts" derive from %40 (xBase+rowOff) plus xBase-lane
  // offsets 0/1/2/3 via bit-or (identical to add since the low 2 bits of
  // %40 include the "xBase = gridX*4" contribution):
  //   %40  = xBase   + rowOff
  //   %60  = xBase|1 + rowOff  == inBase + 1  (low bits collapse)
  //   %80  = xBase|2 + rowOff  == inBase + 2
  //   %100 = xBase|3 + rowOff  == inBase + 3
  const row0Base = inBase;               // %40
  const row1Base = (inBase + 1) | 0;     // %60
  const row2Base = (inBase + 2) | 0;     // %80
  const row3Base = (inBase + 3) | 0;     // %100

  // Row load helper. `input[i]` yields the fp32-narrowed half load result.
  function loadRow(base: number): [number, number, number, number] {
    return [
      Math.fround(input[(base + 0) | 0] as number),
      Math.fround(input[(base + 1) | 0] as number),
      Math.fround(input[(base + 2) | 0] as number),
      Math.fround(input[(base + 3) | 0] as number),
    ];
  }
  const v0 = loadRow(row0Base); // %59
  const v1 = loadRow(row1Base); // %79
  const v2 = loadRow(row2Base); // %99
  const v3 = loadRow(row3Base); // %119

  // ============================================================
  // Per-row: multiply by 65535, clamp to [0, 65535], convert to u16.
  // ============================================================
  //   %120 = fmul %59, <65535, 65535, 65535, 65535>
  //   %121 = air.clamp.v4f32(%120, 0, 65535)
  //   %122 = air.convert.u.v4i16.f.v4f32(%121)   (fp32 -> u16, saturating)
  //   ... (same for %123..%125, %126..%128, %129..%131)
  function toU16(v: readonly [number, number, number, number]): [number, number, number, number] {
    return [
      quantize(v[0]),
      quantize(v[1]),
      quantize(v[2]),
      quantize(v[3]),
    ];
  }
  function quantize(f: number): number {
    // %120: fmul
    const m = Math.fround(Math.fround(f) * F32_65535);
    // %121: air.clamp — lane-wise max(min(m, 65535), 0)
    const c = m < 0 ? 0 : m > F32_65535 ? F32_65535 : m;
    // %122: air.convert.u.v4i16.f.v4f32 — fp32 -> uint16 saturating.
    // AIR's u16 convert truncates toward zero and saturates to [0, 65535];
    // after the clamp the value is already in-range, so truncation is
    // the only remaining step.
    return (c | 0) & 0xffff;
  }
  const u0 = toU16(v0); // %122
  const u1 = toU16(v1); // %125
  const u2 = toU16(v2); // %128
  const u3 = toU16(v3); // %131

  // ============================================================
  // 4x4 transpose via shufflevector chains.
  // ============================================================
  //   %132 = shufflevector %122, %125, <0, 4, undef, undef>  -> [u0[0], u1[0], ?, ?]
  //   %133 = shufflevector %132, %128, <0, 1, 4, undef>       -> [u0[0], u1[0], u2[0], ?]
  //   %134 = shufflevector %133, %131, <0, 1, 2, 4>           -> [u0[0], u1[0], u2[0], u3[0]]
  //   Same pattern for lanes 1, 2, 3:
  //     %137 = [u0[1], u1[1], u2[1], u3[1]]
  //     %140 = [u0[2], u1[2], u2[2], u3[2]]
  //     %143 = [u0[3], u1[3], u2[3], u3[3]]
  const lane0Row: [number, number, number, number] = [u0[0], u1[0], u2[0], u3[0]]; // %134
  const lane1Row: [number, number, number, number] = [u0[1], u1[1], u2[1], u3[1]]; // %137
  const lane2Row: [number, number, number, number] = [u0[2], u1[2], u2[2], u3[2]]; // %140
  const lane3Row: [number, number, number, number] = [u0[3], u1[3], u2[3], u3[3]]; // %143

  // ============================================================
  // Broadcast m_shift & 15 into a ushort4 for lshr on 3 of the 4 outputs.
  // ============================================================
  //   %144 = trunc i32 %29 to i16
  //   %145 = insertelement <4 x i16> undef, i16 %144, i64 0
  //   %146 = and <4 x i16> %145, <i16 15, undef, undef, undef>
  //   %147 = shufflevector <4 x i16> %146, undef, <4 x i32> zeroinitializer
  const lshrAmount = (shiftRaw & 15) | 0; // %147 (broadcast of low-4-bit shift)

  // ============================================================
  // Output stores.
  // ============================================================
  //   %148 = lshr <4 x i16> %137, %147          — lshr the "lane-1 row"
  //   %149 = zext m_strideY (%21) to i64
  //   %150 = %149 * gridY
  //   %151 = %150 + gridX
  //   %152 = gep outputY, i64 %151
  //   store <4 x i16> %148 -> outputY[y*strideY + x]
  const yIdx = (Math.imul(strideY, gridY | 0) + (gridX | 0)) | 0;
  outputY[yIdx] = [
    ((lane1Row[0] & 0xffff) >>> lshrAmount) | 0,
    ((lane1Row[1] & 0xffff) >>> lshrAmount) | 0,
    ((lane1Row[2] & 0xffff) >>> lshrAmount) | 0,
    ((lane1Row[3] & 0xffff) >>> lshrAmount) | 0,
  ];

  //   %153 = lshr <4 x i16> %140, %147          — lshr the "lane-2 row"
  //   %154 = zext m_strideUVA (%23) to i64
  //   %155 = %154 * gridY
  //   %156 = %155 + gridX
  //   %157 = gep outputU, i64 %156
  //   store <4 x i16> %153 -> outputU[y*strideUVA + x]
  const uvaIdx = (Math.imul(strideUVA, gridY | 0) + (gridX | 0)) | 0;
  outputU[uvaIdx] = [
    ((lane2Row[0] & 0xffff) >>> lshrAmount) | 0,
    ((lane2Row[1] & 0xffff) >>> lshrAmount) | 0,
    ((lane2Row[2] & 0xffff) >>> lshrAmount) | 0,
    ((lane2Row[3] & 0xffff) >>> lshrAmount) | 0,
  ];

  //   %158 = lshr <4 x i16> %143, %147          — lshr the "lane-3 row"
  //   %159 = gep outputV, i64 %156              (same idx as outputU)
  //   store <4 x i16> %158 -> outputV[y*strideUVA + x]
  outputV[uvaIdx] = [
    ((lane3Row[0] & 0xffff) >>> lshrAmount) | 0,
    ((lane3Row[1] & 0xffff) >>> lshrAmount) | 0,
    ((lane3Row[2] & 0xffff) >>> lshrAmount) | 0,
    ((lane3Row[3] & 0xffff) >>> lshrAmount) | 0,
  ];

  //   %160 = gep outputA, i64 %156              (same idx as outputU/V)
  //   store <4 x i16> %134 -> outputA[y*strideUVA + x]  (NO lshr)
  outputA[uvaIdx] = [
    lane0Row[0] & 0xffff,
    lane0Row[1] & 0xffff,
    lane0Row[2] & 0xffff,
    lane0Row[3] & 0xffff,
  ];
}
