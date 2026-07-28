// @shader bm3dnr_buf::bm3dnr_buf_frameStats16x16 (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_frameStats16x16.ll
//   (see .ll header @0x275ed)
//
// SIGNATURE (from !14 / !17..!22 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_frameStats16x16"(
//     %params*   addrspace(2) %0,   // constant buffer
//     <2 x i32>               %1,   // grid_in (thread pos in grid)
//     <4 x i8>*  addrspace(1) %2,   // input     (device RO, uchar4)
//     <4 x i8>*  addrspace(1) %3,   // inputPrev (device RO, uchar4)
//     i32*       addrspace(1) %4    // outputStat (device RW, uint)
//   )
// PARAMS struct (from !18):
//   { i32  m_inStride,     // +0    (field 0, signed)
//     i32  m_outStride,    // +4    (field 1, signed)
//     u32  m_globalWidth,  // +8    (field 2, unsigned; grid bound)
//     u32  m_globalHeight  // +12   (field 3, unsigned; grid bound) }
//
// FAST-MATH: this kernel is INTEGER-only. Both denorms and fast-math are
// disabled (!11, !12) but no fp32 ops exist here — no Math.fround needed.
//
// SHAPE:
//   For each (x = grid_in.x, y = grid_in.y) inside the [m_globalWidth x
//   m_globalHeight] grid, this kernel reads a 16-row x 4-uchar4-col tile
//   of pixels from both `input` and `inputPrev`, accumulates per-lane
//   sums, sums of squares and cross-products, then emits 8 uint stats
//   at outputStat[y * m_outStride + x*8].
//
// LOCAL SCRATCH (%6):
//   `%6 = alloca [64 x <4 x i32>]` — 64-slot per-thread buffer holding
//   the 16*4 = 64 zext-to-i32 lanes of `input` pixels. Populated during
//   the first pass; consumed during the two follow-on passes to compute
//   4x4 and 8x8 block statistics.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12 into the 16-byte struct.
 */
export interface Bm3dnrBufFrameStats16x16Params {
  m_inStride: number;    // +0  — signed row stride of both input buffers
  m_outStride: number;   // +4  — signed row stride of outputStat (in i32s)
  m_globalWidth: number; // +8  — grid domain width  (early-out bound, uint)
  m_globalHeight: number;// +12 — grid domain height (early-out bound, uint)
}

// uchar4 pixel: length-4 tuple of 0..255 bytes in `input` / `inputPrev`.
export type UChar4 = readonly [number, number, number, number];

/** Vector helper: <4 x i32> add (lane-wise). */
function vAdd(a: readonly [number, number, number, number], b: readonly [number, number, number, number]): [number, number, number, number] {
  return [(a[0] + b[0]) | 0, (a[1] + b[1]) | 0, (a[2] + b[2]) | 0, (a[3] + b[3]) | 0];
}
/** Vector helper: <4 x i32> subtract (lane-wise). */
function vSub(a: readonly [number, number, number, number], b: readonly [number, number, number, number]): [number, number, number, number] {
  return [(a[0] - b[0]) | 0, (a[1] - b[1]) | 0, (a[2] - b[2]) | 0, (a[3] - b[3]) | 0];
}
/** Vector helper: <4 x i32> lane-wise multiply. */
function vMul(a: readonly [number, number, number, number], b: readonly [number, number, number, number]): [number, number, number, number] {
  return [Math.imul(a[0], b[0]) | 0, Math.imul(a[1], b[1]) | 0, Math.imul(a[2], b[2]) | 0, Math.imul(a[3], b[3]) | 0];
}
/** air.abs.s.v4i32 — signed lane-wise absolute value. */
function vAbs(a: readonly [number, number, number, number]): [number, number, number, number] {
  const a0 = a[0] | 0, a1 = a[1] | 0, a2 = a[2] | 0, a3 = a[3] | 0;
  return [a0 < 0 ? -a0 | 0 : a0, a1 < 0 ? -a1 | 0 : a1, a2 < 0 ? -a2 | 0 : a2, a3 < 0 ? -a3 | 0 : a3];
}
/** air.abs_diff.s.v4i32 — signed lane-wise |a - b|. */
function vAbsDiff(a: readonly [number, number, number, number], b: readonly [number, number, number, number]): [number, number, number, number] {
  return vAbs(vSub(a, b));
}
/** Horizontal sum across the 4 lanes of an i32 vector. */
function vHSum(a: readonly [number, number, number, number]): number {
  return ((a[0] + a[1]) | 0) + ((a[2] + a[3]) | 0) | 0;
}

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params      constant buffer (%0)
 * @param gridX       grid_in.x  (extractelement %1, 0)      — %7
 * @param gridY       grid_in.y  (extractelement %1, 1)      — %12
 * @param input       read-only  uchar4 buffer               — %2
 * @param inputPrev   read-only  uchar4 buffer               — %3
 * @param outputStat  read-write i32 buffer                  — %4
 */
export function bm3dnr_buf_frameStats16x16(
  params: Bm3dnrBufFrameStats16x16Params,
  gridX: number,
  gridY: number,
  input: readonly UChar4[],
  inputPrev: readonly UChar4[],
  outputStat: Int32Array | number[],
): void {
  // %8..%10: if (grid_in.x >= m_globalWidth) return.
  //   %8  = gep params, i32 2       (m_globalWidth)
  //   %9  = load i32
  //   %10 = icmp ult i32 %7, %9
  //   br i1 %10, label %11, label %346
  if (!(gridX >>> 0 < params.m_globalWidth >>> 0)) return;

  // %13..%15: if (grid_in.y >= m_globalHeight) return.
  //   %13 = gep params, i32 3       (m_globalHeight)
  //   %14 = load i32
  //   %15 = icmp ult i32 %12, %14
  //   br i1 %15, label %16, label %346
  if (!(gridY >>> 0 < params.m_globalHeight >>> 0)) return;

  // %17..%22: load m_inStride (%18) and m_outStride (%20).
  const inStride = params.m_inStride | 0;
  const outStride = params.m_outStride | 0;

  // %21, %22: zext grid_in.x / grid_in.y to i64.
  // %23 = %21 shl 2  ->  grid_in.x * 4
  // %24 = %22 shl 4  ->  grid_in.y * 16
  const xBase = (gridX | 0) * 4;      // %23 (uchar4 units)
  const yBase = (gridY | 0) * 16;     // %24 (rows)

  // %26 = sext m_inStride to i64
  const inStrideSext = inStride | 0;  // %26 (i64 in IR, plain int here)

  // %6 = alloca [64 x <4 x i32>] — per-thread scratch (see %25 lifetime).
  // Populated by pass 1; consumed by passes 2 and 3.
  const scratch: [number, number, number, number][] = new Array(64);
  for (let i = 0; i < 64; i++) scratch[i] = [0, 0, 0, 0];

  // ============================================================
  // PASS 1  (blocks %27, %42, %39 — the two nested unrolled loops)
  // ============================================================
  // Outer: iRow = 0..15 (%33), Inner: iCol = 0..3 (%48).
  // Phis accumulate five <4 x i32> vectors across all 64 (iRow,iCol):
  //   %28→%60  sumIn      (SUM of input pixels, lane-wise)
  //   %29→%62  sumInSq    (SUM of input*input,  lane-wise)
  //   %30→%67  sumInPrev  (SUM of inputPrev*input, lane-wise)
  //   %31→%63  sumPrev    (SUM of inputPrev pixels, lane-wise)
  //   %32→%65  sumPrevSq  (SUM of inputPrev*inputPrev, lane-wise)
  let sumIn: [number, number, number, number]     = [0, 0, 0, 0]; // %28→%60
  let sumInSq: [number, number, number, number]   = [0, 0, 0, 0]; // %29→%62
  let sumInPrev: [number, number, number, number] = [0, 0, 0, 0]; // %30→%67
  let sumPrev: [number, number, number, number]   = [0, 0, 0, 0]; // %31→%63
  let sumPrevSq: [number, number, number, number] = [0, 0, 0, 0]; // %32→%65

  for (let iRow = 0; iRow < 16; iRow++) {
    // %34 = zext %33; %35 = %24 + %34   (absY = yBase + iRow)
    // %36 = %35 * %26                    (rowOffset = absY * m_inStride)
    // %37 = %33 shl 2                    (scratchRowBase = iRow * 4)
    // %38 = %36 + %23                    (rowOffset + xBase)
    const absY = (yBase + iRow) | 0;
    const rowOffset = Math.imul(absY, inStrideSext) | 0;
    const scratchRowBase = iRow * 4;
    const rowStart = (rowOffset + xBase) | 0;

    for (let iCol = 0; iCol < 4; iCol++) {
      // %49 = zext %48
      // %50 = %38 + %49        (pixel index in uchar4 units)
      // %51 = gep input, i64 %50
      // %52 = load <4 x i8>
      // %53 = zext-to-i32-lanes (air.convert.s.v4i32.u.v4i8)
      const idx = (rowStart + iCol) | 0;
      const px = input[idx];
      const pxI: [number, number, number, number] = [px[0] | 0, px[1] | 0, px[2] | 0, px[3] | 0]; // %53

      // %54 = %48 + %37; %55 = zext; %56 = gep scratch, %55
      // store <4 x i32> %53, %56
      const scratchIdx = (scratchRowBase + iCol) | 0;
      scratch[scratchIdx] = [pxI[0], pxI[1], pxI[2], pxI[3]];

      // %57 = gep inputPrev, i64 %50; %58 = load; %59 = zext-to-i32
      const pxp = inputPrev[idx];
      const pxpI: [number, number, number, number] = [pxp[0] | 0, pxp[1] | 0, pxp[2] | 0, pxp[3] | 0]; // %59

      // %60 = add <4 x i32> %53, %43       (sumIn += pxI)
      sumIn = vAdd(pxI, sumIn);
      // %61 = mul <4 x i32> %53, %53
      // %62 = add <4 x i32> %61, %44       (sumInSq += pxI*pxI)
      sumInSq = vAdd(vMul(pxI, pxI), sumInSq);
      // %63 = add <4 x i32> %59, %46       (sumPrev += pxpI)
      sumPrev = vAdd(pxpI, sumPrev);
      // %64 = mul <4 x i32> %59, %59
      // %65 = add <4 x i32> %64, %47       (sumPrevSq += pxpI*pxpI)
      sumPrevSq = vAdd(vMul(pxpI, pxpI), sumPrevSq);
      // %66 = mul <4 x i32> %59, %53
      // %67 = add <4 x i32> %66, %45       (sumInPrev += pxpI*pxI)
      sumInPrev = vAdd(vMul(pxpI, pxI), sumInPrev);
    }
  }

  // ============================================================
  // PASS 2 (blocks %70, %83, %80, %78 — 4x4-block statistics)
  // ============================================================
  // Outer (%70..%80): %71 = 0, 4, 8, 12  (step 4; %82 = icmp ult %71, 12).
  // Inner (%83)     : %84 = 0..3        (%134 = icmp eq %133, 4).
  // Phis:
  //   %72→%132  accSAD    (scalar, i32) — running horizontal-sum of SAD
  //   %73→%124  accBlkAvg (scalar, i32) — running SUM of per-block avgs
  //
  // Per (outer, inner) iteration ("block"), the kernel reads FOUR scratch
  // vectors from indices %87, %91, %96, %101 which are:
  //   base = %71*4 + %84    (i.e. outer*4 + inner)
  //   %87 = base + 0*4      — %90  = scratch[base]
  //   %91 = base + 1*4      — %94  = scratch[base + 4]
  //   %96 = base + 2*4      — %99  = scratch[base + 8]
  //   %101= base + 3*4      — %104 = scratch[base + 12]
  //   %105 = %90 + %94 + %99 + %104           (per-lane 4-vector sum)
  //   %113 = 8 + hsum(%105);  %114 = %113 >> 4  (arith shift by 4)
  //   %116 = broadcast <4 x i32> %114
  //   %123 = absDiff(%90,%116)+absDiff(%94,%116)+absDiff(%99,%116)+absDiff(%104,%116)
  //   %124 = %114 + %86               (accBlkAvg accumulate)
  //   %132 = %85 + hsum(%123)         (accSAD  accumulate)
  //   Note the inner %129 = %126 + %85 uses lane-order (b+a) not (a+b),
  //   but for i32 addition it's identical — hsum captured verbatim below.
  let accSAD = 0;    // %72→%132
  let accBlkAvg = 0; // %73→%124

  for (let outer = 0; outer < 16; outer += 4) {
    // %74 = outer * 4 (interpreted as bit-or since outer%4==0); IR uses `or`,
    // but the lower bits are zero so `or` and `add` and `+outer*4` coincide.
    // Here we just compute base per inner iteration directly.
    for (let inner = 0; inner < 4; inner++) {
      const base = (outer * 4 + inner) | 0;     // %87 in IR
      const v0 = scratch[base];                 // %90
      const v1 = scratch[(base + 4) | 0];       // %94
      const v2 = scratch[(base + 8) | 0];       // %99
      const v3 = scratch[(base + 12) | 0];      // %104
      const s01 = vAdd(v1, v0);                 // %95
      const s012 = vAdd(s01, v2);               // %100
      const s0123 = vAdd(s012, v3);             // %105

      // %113 = 8 + hsum(%105); %114 = %113 ashr 4  (== (s+8)>>4 rounded avg over 16 lanes)
      // The IR order is:
      //   %106 = %105[0]; %107 = %105[1]; %108 = %105[2]; %109 = %105[3]
      //   %110 = %107 + 8; %111 = %110 + %106; %112 = %111 + %108; %113 = %112 + %109
      const avg = ((((s0123[1] + 8) | 0) + s0123[0] | 0) + s0123[2] | 0) + s0123[3] | 0;
      const blkAvg = avg >> 4;                  // %114 (signed ashr)

      // %116 = shuffle-broadcast %115 = insertelement(undef,%114,0)
      const bc: [number, number, number, number] = [blkAvg, blkAvg, blkAvg, blkAvg];

      // %117 = absDiff(%90,%116); %118 = absDiff(%94,%116); %119 = %118 + %117
      // %120 = absDiff(%99,%116); %121 = %119 + %120
      // %122 = absDiff(%104,%116); %123 = %121 + %122
      const d0 = vAbsDiff(v0, bc);
      const d1 = vAbsDiff(v1, bc);
      const d2 = vAbsDiff(v2, bc);
      const d3 = vAbsDiff(v3, bc);
      const sad = vAdd(vAdd(vAdd(d1, d0), d2), d3);

      // %124 = %114 + %86
      accBlkAvg = (blkAvg + accBlkAvg) | 0;

      // Horizontal SAD, IR order:
      //   %125=sad[0]; %126=sad[1]; %127=sad[2]; %128=sad[3]
      //   %129 = %126 + %85; %130 = %129 + %125; %131 = %130 + %127; %132 = %131 + %128
      accSAD = ((((sad[1] + accSAD) | 0) + sad[0] | 0) + sad[2] | 0) + sad[3] | 0;
    }
  }

  // %78 falls through to %135 after %71 exits its loop:
  //   %79 = %124 + 8;   %147 = %79 ashr 4     (round-and-avg of 16 block avgs)
  const roundedBlkAvg = ((accBlkAvg + 8) | 0) >> 4;   // %147

  // ============================================================
  // PASS 3 (blocks %135, %196, %195, %146 — 8x8-block min-SAD tracking)
  // ============================================================
  // Outer (%135..%195): 2 iterations.
  //   %136: true (first), false (second)      — controls exit at %195
  //   %137: 0    (first), 32    (second)      — half-scratch base offset
  //   %138: 16320 (first), previous %345 (second)  — running min
  //   Derived offsets (all i32 `or` with zero low bits, == plain add):
  //     %139 = %137 |  4      %143 = %137 | 20
  //     %140 = %137 |  8      %144 = %137 | 24
  //     %141 = %137 | 12      %145 = %137 | 28
  //     %142 = %137 | 16
  // Inner (%196): 2 iterations.
  //   %197: true (first), false (second)      — controls back-edge at %195
  //   %198: 0    (first), 2    (second)
  //   %199: outer %138 (first), previous %345 (second)
  //   Per inner iter, reads SIXTEEN scratch vectors at indices %200/%204/
  //   %209/%214/%219/%224/%229/%234 and each + 1:
  //     %200 = %198 | %137          -> %203
  //     %204 = %198 | %139          -> %207
  //     %209 = %198 | %140          -> %212
  //     %214 = %198 | %141          -> %217
  //     %219 = %198 | %142          -> %222
  //     %224 = %198 | %143          -> %227
  //     %229 = %198 | %144          -> %232
  //     %234 = %198 | %145          -> %237
  //     %239 = %200 | 1             -> %242
  //     %244 = %204 | 1             -> %247
  //     %249 = %209 | 1             -> %252
  //     %254 = %214 | 1             -> %257
  //     %259 = %219 | 1             -> %262
  //     %264 = %224 | 1             -> %267
  //     %269 = %229 | 1             -> %272
  //     %274 = %234 | 1             -> %277
  //   %278 = sum of all 16 vectors.
  //   %286 = 32 + hsum(%278); %287 = %286 ashr 6 (== (sum+32)/64 rounded)
  //   %289 = broadcast %287
  //   %336 = sum of abs(vec - %289) across all 16 vectors.
  //   %343 = hsum(%336)
  //   %345 = min(%199, %343)
  //   loop back if %197.
  // outer loop exits after second pass (%136 false), then stores to output.
  let outerLimit = 16320; // %138 initial
  for (let outerIter = 0; outerIter < 2; outerIter++) {
    const half = outerIter === 0 ? 0 : 32;  // %137
    const off1 = (half + 4) | 0;            // %139
    const off2 = (half + 8) | 0;            // %140
    const off3 = (half + 12) | 0;           // %141
    const off4 = (half + 16) | 0;           // %142
    const off5 = (half + 20) | 0;           // %143
    const off6 = (half + 24) | 0;           // %144
    const off7 = (half + 28) | 0;           // %145

    let runningMin = outerLimit;            // %199 init from %138
    for (let innerIter = 0; innerIter < 2; innerIter++) {
      const p = innerIter * 2;              // %198  (0 then 2)
      const b0 = (p + half) | 0;            // %200
      const b1 = (p + off1) | 0;            // %204
      const b2 = (p + off2) | 0;            // %209
      const b3 = (p + off3) | 0;            // %214
      const b4 = (p + off4) | 0;            // %219
      const b5 = (p + off5) | 0;            // %224
      const b6 = (p + off6) | 0;            // %229
      const b7 = (p + off7) | 0;            // %234
      const v0  = scratch[b0];              // %203
      const v1  = scratch[b1];              // %207
      const v2  = scratch[b2];              // %212
      const v3  = scratch[b3];              // %217
      const v4  = scratch[b4];              // %222
      const v5  = scratch[b5];              // %227
      const v6  = scratch[b6];              // %232
      const v7  = scratch[b7];              // %237
      const v8  = scratch[(b0 + 1) | 0];    // %242
      const v9  = scratch[(b1 + 1) | 0];    // %247
      const v10 = scratch[(b2 + 1) | 0];    // %252
      const v11 = scratch[(b3 + 1) | 0];    // %257
      const v12 = scratch[(b4 + 1) | 0];    // %262
      const v13 = scratch[(b5 + 1) | 0];    // %267
      const v14 = scratch[(b6 + 1) | 0];    // %272
      const v15 = scratch[(b7 + 1) | 0];    // %277

      // %208..%278: cumulative <4 x i32> add.
      let acc = vAdd(v1, v0);         // %208
      acc = vAdd(acc, v2);            // %213
      acc = vAdd(acc, v3);            // %218
      acc = vAdd(acc, v4);            // %223
      acc = vAdd(acc, v5);            // %228
      acc = vAdd(acc, v6);            // %233
      acc = vAdd(acc, v7);            // %238
      acc = vAdd(acc, v8);            // %243
      acc = vAdd(acc, v9);            // %248
      acc = vAdd(acc, v10);           // %253
      acc = vAdd(acc, v11);           // %258
      acc = vAdd(acc, v12);           // %263
      acc = vAdd(acc, v13);           // %268
      acc = vAdd(acc, v14);           // %273
      acc = vAdd(acc, v15);           // %278

      // %283 = %280 + 32; %284 = %283 + %279; %285 = %284 + %281; %286 = %285 + %282
      const sumLanes = ((((acc[1] + 32) | 0) + acc[0] | 0) + acc[2] | 0) + acc[3] | 0;
      const mean = sumLanes >> 6;                 // %287  (ashr 6 = /64 rounded via +32)
      const bc: [number, number, number, number] = [mean, mean, mean, mean];

      // %290..%336: sum of |vk - bc| across all 16 vectors.
      // IR does the running sum starting from vAbsDiff(v1) then adds v0:
      //   %293 = abs(v1-bc); %291 = abs(v0-bc); %294 = %293 + %291
      let sadAcc: [number, number, number, number] = vAdd(vAbsDiff(v1, bc), vAbsDiff(v0, bc)); // %294
      sadAcc = vAdd(sadAcc, vAbsDiff(v2, bc));   // %297
      sadAcc = vAdd(sadAcc, vAbsDiff(v3, bc));   // %300
      sadAcc = vAdd(sadAcc, vAbsDiff(v4, bc));   // %303
      sadAcc = vAdd(sadAcc, vAbsDiff(v5, bc));   // %306
      sadAcc = vAdd(sadAcc, vAbsDiff(v6, bc));   // %309
      sadAcc = vAdd(sadAcc, vAbsDiff(v7, bc));   // %312
      sadAcc = vAdd(sadAcc, vAbsDiff(v8, bc));   // %315
      sadAcc = vAdd(sadAcc, vAbsDiff(v9, bc));   // %318
      sadAcc = vAdd(sadAcc, vAbsDiff(v10, bc));  // %321
      sadAcc = vAdd(sadAcc, vAbsDiff(v11, bc));  // %324
      sadAcc = vAdd(sadAcc, vAbsDiff(v12, bc));  // %327
      sadAcc = vAdd(sadAcc, vAbsDiff(v13, bc));  // %330
      sadAcc = vAdd(sadAcc, vAbsDiff(v14, bc));  // %333
      sadAcc = vAdd(sadAcc, vAbsDiff(v15, bc));  // %336

      // %339 = %337 + %338; %341 = %339 + %340; %343 = %341 + %342
      const totalSad = (((sadAcc[0] + sadAcc[1]) | 0) + sadAcc[2] | 0) + sadAcc[3] | 0;
      // %344 = icmp slt %199, %343
      // %345 = select %344, %199, %343   (== min(%199, %343))
      runningMin = runningMin < totalSad ? runningMin : totalSad;
    }
    // %195 back-edge: if outer %136 is true (first iter) go around; else exit.
    outerLimit = runningMin;  // becomes %138 for the second outer iter, or the final result
  }
  const minSad = outerLimit; // %345 as read by the store in %146

  // ============================================================
  // STORE 8 stats (block %146)
  // ============================================================
  // %147 = %79 ashr 4    == roundedBlkAvg (see PASS 2 exit).
  // %148 = grid_in.x shl 3        (base index in outputStat, uint units)
  // %149 = gep outputStat, %148
  // %150 = sext m_outStride
  // %151 = %150 * grid_in.y       (row offset)
  // %152 = gep %149, %151         (outputStat[y*outStride + x*8])
  // stores:
  //   +0  = %132 = accSAD                 (sum of 4x4-block SADs)
  //   +1  = %147 = roundedBlkAvg          ((sum-of-block-avgs + 8) / 16)
  //   +2  = hsum(%60)  = hsum(sumIn)
  //   +3  = hsum(%63)  = hsum(sumPrev)
  //   +4  = hsum(%62)  = hsum(sumInSq)
  //   +5  = hsum(%65)  = hsum(sumPrevSq)
  //   +6  = hsum(%67)  = hsum(sumInPrev)
  //   +7  = %345       = minSad
  const outBase = (Math.imul(outStride | 0, gridY | 0) + (gridX | 0) * 8) | 0;
  outputStat[outBase + 0] = accSAD | 0;

  outputStat[outBase + 1] = roundedBlkAvg | 0;

  // %156 = %60[0] + %60[1]; %158 = %156 + %60[2]; %160 = %158 + %60[3]
  outputStat[outBase + 2] = (((sumIn[0] + sumIn[1]) | 0) + sumIn[2] | 0) + sumIn[3] | 0;

  // %164 = %63[0] + %63[1]; %166 = %164 + %63[2]; %168 = %166 + %63[3]
  outputStat[outBase + 3] = (((sumPrev[0] + sumPrev[1]) | 0) + sumPrev[2] | 0) + sumPrev[3] | 0;

  // %172 = %62[0] + %62[1]; %174 = %172 + %62[2]; %176 = %174 + %62[3]
  outputStat[outBase + 4] = (((sumInSq[0] + sumInSq[1]) | 0) + sumInSq[2] | 0) + sumInSq[3] | 0;

  // %180 = %65[0] + %65[1]; %182 = %180 + %65[2]; %184 = %182 + %65[3]
  outputStat[outBase + 5] = (((sumPrevSq[0] + sumPrevSq[1]) | 0) + sumPrevSq[2] | 0) + sumPrevSq[3] | 0;

  // %188 = %67[0] + %67[1]; %190 = %188 + %67[2]; %192 = %190 + %67[3]
  outputStat[outBase + 6] = (((sumInPrev[0] + sumInPrev[1]) | 0) + sumInPrev[2] | 0) + sumInPrev[3] | 0;

  outputStat[outBase + 7] = minSad | 0;
}
