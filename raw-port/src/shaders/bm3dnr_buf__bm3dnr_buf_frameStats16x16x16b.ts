// @shader bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_frameStats16x16x16b.ll
//   (see .ll header @0x28e1d)
//
// SIGNATURE (from !14 / !17..!22 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b"(
//     %params*      addrspace(2) %0,   // constant buffer
//     <2 x i32>                  %1,   // grid_in (thread pos in grid)
//     <4 x i16>*    addrspace(1) %2,   // input     (device R/W, ushort4)
//     <4 x i16>*    addrspace(1) %3,   // inputPrev (device R/W, ushort4)
//     i32*          addrspace(1) %4    // outputStat (device R/W, uint)
//   )
// PARAMS struct (from !18):
//   { i32  m_inStride,     // +0    (field 0, signed)
//     i32  m_outStride,    // +4    (field 1, signed)
//     i32  m_shift,        // +8    (field 2, signed; lshr amount on ushort4)
//     u32  m_globalWidth,  // +12   (field 3, unsigned; grid bound)
//     u32  m_globalHeight  // +16   (field 4, unsigned; grid bound) }
//
// This is the 16-bit variant of bm3dnr_buf::bm3dnr_buf_frameStats16x16.
// The two shaders are structurally identical (three passes over a 16x4
// scratch tile) except:
//   1. Pixels arrive as ushort4 (i16 lanes) instead of uchar4 (i8 lanes).
//   2. Before the per-lane accumulate, each ushort4 is right-shifted by
//      (m_shift & 15) via a broadcast `lshr` — this narrows the 16-bit
//      pixel down to the 8-bit-ish range the accumulator expects.
//   3. The params struct picks up a third int32 field (m_shift) between
//      m_outStride and m_globalWidth (so the two "grid bound" fields
//      shift from +8/+12 (16x16) to +12/+16 (16x16x16b)).
// Everything else — the 16*4 pixel scratch, the 4x4-block SAD pass,
// the 8x8-block min-SAD pass, and the 8 uint stores at
// outputStat[y*m_outStride + x*8] — is verbatim from the 16x16 kernel.
//
// FAST-MATH: this kernel is INTEGER-only. Both denorms and fast-math are
// disabled (!11, !12) but no fp32 ops exist here — no Math.fround needed.
//
// LOCAL SCRATCH (%6):
//   `%6 = alloca [64 x <4 x i32>]` — 64-slot per-thread buffer holding
//   the 16*4 = 64 zero-extend-to-i32 lanes of `input` pixels (post-shift).
//   Populated during the first pass; consumed during the two follow-on
//   passes to compute 4x4 and 8x8 block statistics.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16 into the 20-byte struct.
 * @shader bm3dnr_buf::bm3dnr_buf_frameStats16x16x16b — !18 in the .ll.
 */
export interface Bm3dnrBufFrameStats16x16x16bParams {
  // +0  — signed row stride of both input buffers (%18 in IR)
  m_inStride: number;
  // +4  — signed row stride of outputStat in i32s (%20 in IR)
  m_outStride: number;
  // +8  — right-shift amount applied to every ushort4 pixel (%22 in IR).
  //        The low 4 bits (mask 15) select the actual lshr amount —
  //        see %31 = and <4 x i16> %30, <i16 15, ...>.
  m_shift: number;
  // +12 — grid domain width  (early-out bound, uint) (%9 in IR)
  m_globalWidth: number;
  // +16 — grid domain height (early-out bound, uint) (%14 in IR)
  m_globalHeight: number;
}

// ushort4 pixel: length-4 tuple of 0..65535 uint16 lanes in
// `input` / `inputPrev`. Interpreted as unsigned for the lshr step
// (Metal AIR loads `<4 x i16>` and applies logical right shift).
export type UShort4 = readonly [number, number, number, number];

// Vector helper: <4 x i32> lane-wise add.
function vAdd(
  a: readonly [number, number, number, number],
  b: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    (a[0] + b[0]) | 0,
    (a[1] + b[1]) | 0,
    (a[2] + b[2]) | 0,
    (a[3] + b[3]) | 0,
  ];
}
// Vector helper: <4 x i32> lane-wise sub.
function vSub(
  a: readonly [number, number, number, number],
  b: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    (a[0] - b[0]) | 0,
    (a[1] - b[1]) | 0,
    (a[2] - b[2]) | 0,
    (a[3] - b[3]) | 0,
  ];
}
// Vector helper: <4 x i32> lane-wise multiply (int32).
function vMul(
  a: readonly [number, number, number, number],
  b: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    Math.imul(a[0], b[0]) | 0,
    Math.imul(a[1], b[1]) | 0,
    Math.imul(a[2], b[2]) | 0,
    Math.imul(a[3], b[3]) | 0,
  ];
}
// air.abs.s.v4i32 — signed lane-wise absolute value.
function vAbs(
  a: readonly [number, number, number, number],
): [number, number, number, number] {
  const a0 = a[0] | 0;
  const a1 = a[1] | 0;
  const a2 = a[2] | 0;
  const a3 = a[3] | 0;
  return [
    a0 < 0 ? (-a0) | 0 : a0,
    a1 < 0 ? (-a1) | 0 : a1,
    a2 < 0 ? (-a2) | 0 : a2,
    a3 < 0 ? (-a3) | 0 : a3,
  ];
}
// air.abs_diff.s.v4i32 — signed lane-wise |a - b|.
function vAbsDiff(
  a: readonly [number, number, number, number],
  b: readonly [number, number, number, number],
): [number, number, number, number] {
  return vAbs(vSub(a, b));
}

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params      constant buffer (%0)
 * @param gridX       grid_in.x  (extractelement %1, 0)      — %7
 * @param gridY       grid_in.y  (extractelement %1, 1)      — %12
 * @param input       read-write ushort4 buffer              — %2
 * @param inputPrev   read-write ushort4 buffer              — %3
 * @param outputStat  read-write i32 buffer                  — %4
 */
export function bm3dnr_buf_frameStats16x16x16b(
  params: Bm3dnrBufFrameStats16x16x16bParams,
  gridX: number,
  gridY: number,
  input: readonly UShort4[],
  inputPrev: readonly UShort4[],
  outputStat: Int32Array | number[],
): void {
  // %7..%10: if (grid_in.x >= m_globalWidth) return.
  //   %7  = extractelement <2 x i32> %1, i64 0
  //   %8  = gep params, i32 3       (m_globalWidth)
  //   %9  = load i32
  //   %10 = icmp ult i32 %7, %9
  //   br i1 %10, label %11, label %354
  if (!((gridX >>> 0) < (params.m_globalWidth >>> 0))) return;

  // %12..%15: if (grid_in.y >= m_globalHeight) return.
  //   %12 = extractelement <2 x i32> %1, i64 1
  //   %13 = gep params, i32 4       (m_globalHeight)
  //   %14 = load i32
  //   %15 = icmp ult i32 %12, %14
  //   br i1 %15, label %16, label %354
  if (!((gridY >>> 0) < (params.m_globalHeight >>> 0))) return;

  // %17..%22: load m_inStride (%18), m_outStride (%20), m_shift (%22).
  //   %17 = gep params, i32 0
  //   %18 = load i32                (m_inStride)
  //   %19 = gep params, i32 1
  //   %20 = load i32                (m_outStride)
  //   %21 = gep params, i32 2
  //   %22 = load i32                (m_shift)
  const inStride = params.m_inStride | 0;
  const outStride = params.m_outStride | 0;
  const shiftRaw = params.m_shift | 0;

  // %23 = zext grid_in.x to i64
  // %24 = zext grid_in.y to i64
  // %25 = %23 shl 2  ->  grid_in.x * 4
  // %26 = %24 shl 4  ->  grid_in.y * 16
  const xBase = ((gridX | 0) * 4) | 0;      // %25 (ushort4 units)
  const yBase = ((gridY | 0) * 16) | 0;     // %26 (rows)

  // %28 = sext m_inStride to i64  (interp'd as i32 here — the multiply
  //       is bit-exact under Math.imul).
  const inStrideSext = inStride | 0;        // %28

  // %29 = trunc i32 %22 to i16
  // %30 = insertelement <4 x i16> undef, i16 %29, i64 0
  // %31 = and <4 x i16> %30, <i16 15, i16 undef, i16 undef, i16 undef>
  // %32 = shufflevector <4 x i16> %31, <4 x i16> undef, <4 x i32> zeroinitializer
  //
  // The IR trunc-to-i16 followed by low-lane `and 15` (with lane 0 taken
  // via broadcast-zeroinitializer) reduces the ushort4 lshr amount to
  // (m_shift & 0xF). Every subsequent `lshr <4 x i16>` broadcasts that
  // scalar to all four lanes.
  const lshrAmount = (shiftRaw & 15) | 0;   // %32 (all lanes = %31[0])

  // %6 = alloca [64 x <4 x i32>] — per-thread scratch (see %27 lifetime).
  // Populated by pass 1; consumed by passes 2 and 3.
  const scratch: [number, number, number, number][] = new Array(64);
  for (let i = 0; i < 64; i++) scratch[i] = [0, 0, 0, 0];

  // ============================================================
  // PASS 1  (blocks %33, %48, %45 — the two nested unrolled loops)
  // ============================================================
  // Outer: iRow = 0..15 (%39), Inner: iCol = 0..3 (%54).
  // Phis accumulate five <4 x i32> vectors across all 64 (iRow, iCol):
  //   %34→%68  sumIn      (SUM of input pixels, lane-wise)
  //   %35→%70  sumInSq    (SUM of input*input, lane-wise)
  //   %36→%75  sumInPrev  (SUM of inputPrev*input, lane-wise)
  //   %37→%71  sumPrev    (SUM of inputPrev pixels, lane-wise)
  //   %38→%73  sumPrevSq  (SUM of inputPrev*inputPrev, lane-wise)
  let sumIn: [number, number, number, number]     = [0, 0, 0, 0]; // %34→%68
  let sumInSq: [number, number, number, number]   = [0, 0, 0, 0]; // %35→%70
  let sumInPrev: [number, number, number, number] = [0, 0, 0, 0]; // %36→%75
  let sumPrev: [number, number, number, number]   = [0, 0, 0, 0]; // %37→%71
  let sumPrevSq: [number, number, number, number] = [0, 0, 0, 0]; // %38→%73

  for (let iRow = 0; iRow < 16; iRow++) {
    // %40 = zext %39; %41 = %26 + %40   (absY = yBase + iRow)
    // %42 = %41 * %28                    (rowOffset = absY * m_inStride)
    // %43 = %39 shl 2                    (scratchRowBase = iRow * 4)
    // %44 = %42 + %25                    (rowOffset + xBase)
    const absY = (yBase + iRow) | 0;
    const rowOffset = Math.imul(absY, inStrideSext) | 0;
    const scratchRowBase = (iRow * 4) | 0;
    const rowStart = (rowOffset + xBase) | 0;

    for (let iCol = 0; iCol < 4; iCol++) {
      // %55 = zext %54
      // %56 = %44 + %55        (pixel index in ushort4 units)
      // %57 = gep input, i64 %56
      // %58 = load <4 x i16>
      // %59 = lshr <4 x i16> %58, %32     (per-lane logical shift by lshrAmount)
      // %60 = air.convert.s.v4i32.u.v4i16 (unsigned i16 -> signed i32)
      const idx = (rowStart + iCol) | 0;
      const px = input[idx];
      // Each ushort lane read is 0..65535; treat as unsigned and lshr by
      // the broadcast amount to reproduce Metal's per-lane behavior.
      const pxI: [number, number, number, number] = [
        ((px[0] & 0xffff) >>> lshrAmount) | 0,
        ((px[1] & 0xffff) >>> lshrAmount) | 0,
        ((px[2] & 0xffff) >>> lshrAmount) | 0,
        ((px[3] & 0xffff) >>> lshrAmount) | 0,
      ]; // %60

      // %61 = %54 + %43; %62 = zext; %63 = gep scratch, i64 %62
      // store <4 x i32> %60, %63
      const scratchIdx = (scratchRowBase + iCol) | 0;
      scratch[scratchIdx] = [pxI[0], pxI[1], pxI[2], pxI[3]];

      // %64 = gep inputPrev, i64 %56; %65 = load <4 x i16>; %66 = lshr; %67 = zext-to-i32
      const pxp = inputPrev[idx];
      const pxpI: [number, number, number, number] = [
        ((pxp[0] & 0xffff) >>> lshrAmount) | 0,
        ((pxp[1] & 0xffff) >>> lshrAmount) | 0,
        ((pxp[2] & 0xffff) >>> lshrAmount) | 0,
        ((pxp[3] & 0xffff) >>> lshrAmount) | 0,
      ]; // %67

      // %68 = add <4 x i32> %60, %49       (sumIn += pxI)
      sumIn = vAdd(pxI, sumIn);
      // %69 = mul <4 x i32> %60, %60
      // %70 = add <4 x i32> %69, %50       (sumInSq += pxI*pxI)
      sumInSq = vAdd(vMul(pxI, pxI), sumInSq);
      // %71 = add <4 x i32> %67, %52       (sumPrev += pxpI)
      sumPrev = vAdd(pxpI, sumPrev);
      // %72 = mul <4 x i32> %67, %67
      // %73 = add <4 x i32> %72, %53       (sumPrevSq += pxpI*pxpI)
      sumPrevSq = vAdd(vMul(pxpI, pxpI), sumPrevSq);
      // %74 = mul <4 x i32> %67, %60
      // %75 = add <4 x i32> %74, %51       (sumInPrev += pxpI*pxI)
      sumInPrev = vAdd(vMul(pxpI, pxI), sumInPrev);
    }
  }

  // ============================================================
  // PASS 2 (blocks %78, %91, %88, %86 — 4x4-block statistics)
  // ============================================================
  // Outer (%78..%88): %79 = 0, 4, 8, 12 (step 4; %90 = icmp ult %79, 12).
  // Inner (%91)     : %92 = 0..3        (%142 = icmp eq %141, 4).
  // Phis:
  //   %80→%140  accSAD    (scalar, i32) — running horizontal-sum of SAD
  //   %81→%132  accBlkAvg (scalar, i32) — running SUM of per-block avgs
  //
  // Per (outer, inner) iteration ("block"), the kernel reads FOUR scratch
  // vectors from indices %95, %99, %104, %109 which are:
  //   base = outer*4 + inner (== IR's %92 + %82, since low bits are zero)
  //   %95  = base + 0        — %98  = scratch[base]
  //   %99  = base + 4        — %102 = scratch[base + 4]
  //   %104 = base + 8        — %107 = scratch[base + 8]
  //   %109 = base + 12       — %112 = scratch[base + 12]
  //   %113 = %98 + %102 + %107 + %112           (per-lane 4-vector sum)
  //   %121 = 8 + hsum(%113); %122 = %121 ashr 4  (arith shift by 4)
  //   %124 = broadcast <4 x i32> %122
  //   %131 = absDiff(%98,%124)+absDiff(%102,%124)+absDiff(%107,%124)+absDiff(%112,%124)
  //   %132 = %122 + %94               (accBlkAvg accumulate)
  //   %140 = %93 + hsum(%131)         (accSAD accumulate)
  //   Note the IR does %137 = %134 + %93 (lane 1 + prevAcc first) — for
  //   i32 addition it's identical, mirrored verbatim below.
  let accSAD = 0;    // %80→%140
  let accBlkAvg = 0; // %81→%132

  for (let outer = 0; outer < 16; outer += 4) {
    // %82 = outer * 4 (interpreted as bit-or, since outer%4==0); IR uses
    // `or`, but the lower bits are zero so `or` and `add` coincide.
    for (let inner = 0; inner < 4; inner++) {
      const base = (outer * 4 + inner) | 0;     // %95 in IR
      const v0 = scratch[base];                 // %98
      const v1 = scratch[(base + 4) | 0];       // %102
      const v2 = scratch[(base + 8) | 0];       // %107
      const v3 = scratch[(base + 12) | 0];      // %112
      const s01 = vAdd(v1, v0);                 // %103
      const s012 = vAdd(s01, v2);               // %108
      const s0123 = vAdd(s012, v3);             // %113

      // %121 = 8 + hsum(%113); %122 = %121 ashr 4
      //   %114..%117 = extractelement lanes 0..3
      //   %118 = %115 + 8; %119 = %118 + %114; %120 = %119 + %116; %121 = %120 + %117
      const avg =
        ((((s0123[1] + 8) | 0) + s0123[0]) | 0) +
        s0123[2] | 0;
      const avgFinal = (avg + s0123[3]) | 0;
      const blkAvg = avgFinal >> 4;             // %122 (signed ashr)

      // %124 = shufflevector broadcast of %123 = insertelement(undef, %122, 0)
      const bc: [number, number, number, number] = [blkAvg, blkAvg, blkAvg, blkAvg];

      // %125 = absDiff(%98,%124); %126 = absDiff(%102,%124); %127 = %126 + %125
      // %128 = absDiff(%107,%124); %129 = %127 + %128
      // %130 = absDiff(%112,%124); %131 = %129 + %130
      const d0 = vAbsDiff(v0, bc);
      const d1 = vAbsDiff(v1, bc);
      const d2 = vAbsDiff(v2, bc);
      const d3 = vAbsDiff(v3, bc);
      const sad = vAdd(vAdd(vAdd(d1, d0), d2), d3);

      // %132 = %122 + %94
      accBlkAvg = (blkAvg + accBlkAvg) | 0;

      // Horizontal SAD, IR order:
      //   %133 = sad[0]; %134 = sad[1]; %135 = sad[2]; %136 = sad[3]
      //   %137 = %134 + %93; %138 = %137 + %133; %139 = %138 + %135; %140 = %139 + %136
      accSAD =
        ((((sad[1] + accSAD) | 0) + sad[0]) | 0) +
        sad[2] | 0;
      accSAD = (accSAD + sad[3]) | 0;
    }
  }

  // %86 falls through to %143 after %78 exits its loop:
  //   %87 = %132 + 8;   %155 = %87 ashr 4     (round-and-avg of 16 block avgs)
  const roundedBlkAvg = ((accBlkAvg + 8) | 0) >> 4;   // %155

  // ============================================================
  // PASS 3 (blocks %143, %204, %203, %154 — 8x8-block min-SAD tracking)
  // ============================================================
  // Outer (%143..%203): 2 iterations.
  //   %144: true (first), false (second)      — controls exit at %203
  //   %145: 0    (first), 32    (second)      — half-scratch base offset
  //   %146: 16320 (first), previous %353 (second)  — running min
  //   Derived offsets (IR `or` on offsets whose low bits are known-zero):
  //     %147 = %145 |  4      %151 = %145 | 20
  //     %148 = %145 |  8      %152 = %145 | 24
  //     %149 = %145 | 12      %153 = %145 | 28
  //     %150 = %145 | 16
  // Inner (%204): 2 iterations.
  //   %205: true (first), false (second)      — controls back-edge at %203
  //   %206: 0    (first), 2    (second)
  //   %207: outer %146 (first), previous %353 (second)
  //   Per inner iter, reads SIXTEEN scratch vectors at indices %208..%242
  //   and each + 1:
  //     %208 = %206 | %145          -> %211
  //     %212 = %206 | %147          -> %215
  //     %217 = %206 | %148          -> %220
  //     %222 = %206 | %149          -> %225
  //     %227 = %206 | %150          -> %230
  //     %232 = %206 | %151          -> %235
  //     %237 = %206 | %152          -> %240
  //     %242 = %206 | %153          -> %245
  //     %247 = %208 | 1             -> %250
  //     %252 = %212 | 1             -> %255
  //     %257 = %217 | 1             -> %260
  //     %262 = %222 | 1             -> %265
  //     %267 = %227 | 1             -> %270
  //     %272 = %232 | 1             -> %275
  //     %277 = %237 | 1             -> %280
  //     %282 = %242 | 1             -> %285
  //   %286 = sum of all 16 vectors.
  //   %294 = 32 + hsum(%286); %295 = %294 ashr 6 (== (sum+32)/64 rounded)
  //   %297 = broadcast %295
  //   %344 = sum of abs(vec - %297) across all 16 vectors.
  //   %351 = hsum(%344)
  //   %353 = min(%207, %351)
  //   loop back if %205.
  // outer loop exits after second pass (%144 false), then stores to output.
  let outerLimit = 16320; // %146 initial
  for (let outerIter = 0; outerIter < 2; outerIter++) {
    const half = outerIter === 0 ? 0 : 32;    // %145
    const off1 = (half + 4) | 0;              // %147
    const off2 = (half + 8) | 0;              // %148
    const off3 = (half + 12) | 0;             // %149
    const off4 = (half + 16) | 0;             // %150
    const off5 = (half + 20) | 0;             // %151
    const off6 = (half + 24) | 0;             // %152
    const off7 = (half + 28) | 0;             // %153

    let runningMin = outerLimit;              // %207 init from %146
    for (let innerIter = 0; innerIter < 2; innerIter++) {
      const p = (innerIter * 2) | 0;          // %206  (0 then 2)
      const b0 = (p + half) | 0;              // %208
      const b1 = (p + off1) | 0;              // %212
      const b2 = (p + off2) | 0;              // %217
      const b3 = (p + off3) | 0;              // %222
      const b4 = (p + off4) | 0;              // %227
      const b5 = (p + off5) | 0;              // %232
      const b6 = (p + off6) | 0;              // %237
      const b7 = (p + off7) | 0;              // %242
      const v0  = scratch[b0];                // %211
      const v1  = scratch[b1];                // %215
      const v2  = scratch[b2];                // %220
      const v3  = scratch[b3];                // %225
      const v4  = scratch[b4];                // %230
      const v5  = scratch[b5];                // %235
      const v6  = scratch[b6];                // %240
      const v7  = scratch[b7];                // %245
      const v8  = scratch[(b0 + 1) | 0];      // %250
      const v9  = scratch[(b1 + 1) | 0];      // %255
      const v10 = scratch[(b2 + 1) | 0];      // %260
      const v11 = scratch[(b3 + 1) | 0];      // %265
      const v12 = scratch[(b4 + 1) | 0];      // %270
      const v13 = scratch[(b5 + 1) | 0];      // %275
      const v14 = scratch[(b6 + 1) | 0];      // %280
      const v15 = scratch[(b7 + 1) | 0];      // %285

      // %216..%286: cumulative <4 x i32> add.
      let acc = vAdd(v1, v0);            // %216
      acc = vAdd(acc, v2);               // %221
      acc = vAdd(acc, v3);               // %226
      acc = vAdd(acc, v4);               // %231
      acc = vAdd(acc, v5);               // %236
      acc = vAdd(acc, v6);               // %241
      acc = vAdd(acc, v7);               // %246
      acc = vAdd(acc, v8);               // %251
      acc = vAdd(acc, v9);               // %256
      acc = vAdd(acc, v10);              // %261
      acc = vAdd(acc, v11);              // %266
      acc = vAdd(acc, v12);              // %271
      acc = vAdd(acc, v13);              // %276
      acc = vAdd(acc, v14);              // %281
      acc = vAdd(acc, v15);              // %286

      // %291 = %288 + 32; %292 = %291 + %287; %293 = %292 + %289; %294 = %293 + %290
      const sumLanes =
        ((((acc[1] + 32) | 0) + acc[0]) | 0) +
        acc[2] | 0;
      const sumLanesFinal = (sumLanes + acc[3]) | 0;
      const mean = sumLanesFinal >> 6;   // %295 (ashr 6 = /64 rounded via +32)
      const bc: [number, number, number, number] = [mean, mean, mean, mean];

      // %298..%344: sum of |vk - bc| across all 16 vectors.
      // IR does the running sum starting from vAbsDiff(v1) then adds v0:
      //   %301 = abs(v1-bc); %299 = abs(v0-bc); %302 = %301 + %299
      let sadAcc: [number, number, number, number] = vAdd(
        vAbsDiff(v1, bc),
        vAbsDiff(v0, bc),
      ); // %302
      sadAcc = vAdd(sadAcc, vAbsDiff(v2, bc));    // %305
      sadAcc = vAdd(sadAcc, vAbsDiff(v3, bc));    // %308
      sadAcc = vAdd(sadAcc, vAbsDiff(v4, bc));    // %311
      sadAcc = vAdd(sadAcc, vAbsDiff(v5, bc));    // %314
      sadAcc = vAdd(sadAcc, vAbsDiff(v6, bc));    // %317
      sadAcc = vAdd(sadAcc, vAbsDiff(v7, bc));    // %320
      sadAcc = vAdd(sadAcc, vAbsDiff(v8, bc));    // %323
      sadAcc = vAdd(sadAcc, vAbsDiff(v9, bc));    // %326
      sadAcc = vAdd(sadAcc, vAbsDiff(v10, bc));   // %329
      sadAcc = vAdd(sadAcc, vAbsDiff(v11, bc));   // %332
      sadAcc = vAdd(sadAcc, vAbsDiff(v12, bc));   // %335
      sadAcc = vAdd(sadAcc, vAbsDiff(v13, bc));   // %338
      sadAcc = vAdd(sadAcc, vAbsDiff(v14, bc));   // %341
      sadAcc = vAdd(sadAcc, vAbsDiff(v15, bc));   // %344

      // %347 = %345 + %346; %349 = %347 + %348; %351 = %349 + %350
      const totalSad =
        (((sadAcc[0] + sadAcc[1]) | 0) + sadAcc[2]) | 0;
      const totalSadFinal = (totalSad + sadAcc[3]) | 0;
      // %352 = icmp slt %207, %351
      // %353 = select %352, %207, %351   (== min(%207, %351))
      runningMin = runningMin < totalSadFinal ? runningMin : totalSadFinal;
    }
    // %203 back-edge: if outer %144 is true (first iter) go around; else exit.
    outerLimit = runningMin;  // becomes %146 for the second outer iter, or the final result
  }
  const minSad = outerLimit; // %353 as read by the store in %154

  // ============================================================
  // STORE 8 stats (block %154)
  // ============================================================
  // %155 = %87 ashr 4    == roundedBlkAvg (see PASS 2 exit).
  // %156 = grid_in.x shl 3        (base index in outputStat, uint units)
  // %157 = gep outputStat, %156
  // %158 = sext m_outStride
  // %159 = %158 * grid_in.y       (row offset)
  // %160 = gep %157, %159         (outputStat[y*outStride + x*8])
  // stores:
  //   +0  = %140 = accSAD                 (sum of 4x4-block SADs)
  //   +1  = %155 = roundedBlkAvg          ((sum-of-block-avgs + 8) / 16)
  //   +2  = hsum(%68)  = hsum(sumIn)
  //   +3  = hsum(%71)  = hsum(sumPrev)
  //   +4  = hsum(%70)  = hsum(sumInSq)
  //   +5  = hsum(%73)  = hsum(sumPrevSq)
  //   +6  = hsum(%75)  = hsum(sumInPrev)
  //   +7  = %353       = minSad
  const outBase =
    (Math.imul(outStride | 0, gridY | 0) + ((gridX | 0) * 8)) | 0;
  outputStat[outBase + 0] = accSAD | 0;

  outputStat[outBase + 1] = roundedBlkAvg | 0;

  // %164 = %68[0] + %68[1]; %166 = %164 + %68[2]; %168 = %166 + %68[3]
  outputStat[outBase + 2] =
    (((sumIn[0] + sumIn[1]) | 0) + sumIn[2]) | 0;
  outputStat[outBase + 2] =
    ((outputStat[outBase + 2] as number) + sumIn[3]) | 0;

  // %172 = %71[0] + %71[1]; %174 = %172 + %71[2]; %176 = %174 + %71[3]
  outputStat[outBase + 3] =
    (((sumPrev[0] + sumPrev[1]) | 0) + sumPrev[2]) | 0;
  outputStat[outBase + 3] =
    ((outputStat[outBase + 3] as number) + sumPrev[3]) | 0;

  // %180 = %70[0] + %70[1]; %182 = %180 + %70[2]; %184 = %182 + %70[3]
  outputStat[outBase + 4] =
    (((sumInSq[0] + sumInSq[1]) | 0) + sumInSq[2]) | 0;
  outputStat[outBase + 4] =
    ((outputStat[outBase + 4] as number) + sumInSq[3]) | 0;

  // %188 = %73[0] + %73[1]; %190 = %188 + %73[2]; %192 = %190 + %73[3]
  outputStat[outBase + 5] =
    (((sumPrevSq[0] + sumPrevSq[1]) | 0) + sumPrevSq[2]) | 0;
  outputStat[outBase + 5] =
    ((outputStat[outBase + 5] as number) + sumPrevSq[3]) | 0;

  // %196 = %75[0] + %75[1]; %198 = %196 + %75[2]; %200 = %198 + %75[3]
  outputStat[outBase + 6] =
    (((sumInPrev[0] + sumInPrev[1]) | 0) + sumInPrev[2]) | 0;
  outputStat[outBase + 6] =
    ((outputStat[outBase + 6] as number) + sumInPrev[3]) | 0;

  outputStat[outBase + 7] = minSad | 0;
}
