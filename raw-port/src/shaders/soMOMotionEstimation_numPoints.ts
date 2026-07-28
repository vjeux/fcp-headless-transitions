// Faithful transcription @0x000000000d53ed
// @shader soMOMotionEstimation_numPoints (HeliumSenso) @0x000000000d53ed
// Source IR: raw-port/re/shaders/soMOMotionEstimation__soMOMotionEstimation_numPoints.ll
//   (extracted via `bash raw-port/tools/shader_disasm.sh
//     soMOMotionEstimation_numPoints`; the .ll first line reads
//    `0x000000000d53ed -- soMOMotionEstimation::soMOMotionEstimation_numPoints:`)
//
// This file is BOTH a landed shader port AND a worked example proving the
// harness/ThreadgroupReduction two-phase barrier model is correct. It is
// the smallest barrier-family kernel in HeliumSenso (171 lines of IR),
// making it the canonical decode reference for the ~30 other >500-line
// barrier compute shaders.
//
// AIR SIGNATURE (from !air.kernel !14 in the .ll)
// ───────────────────────────────────────────────
//   define void @soMOMotionEstimation::soMOMotionEstimation_numPoints(
//     addrspace(2)* %0,             // params — struct {u32 m_label, i32 m_x_1, m_x_2, m_y_1, m_y_2}
//     <2 x i32>     %1,             // gSize  = air.threads_per_threadgroup   (uint2)
//     <2 x i32>     %2,             // lid    = air.thread_position_in_threadgroup (uint2)
//     texture2d     %3,             // _pval  : texture2d<uint, sample>
//     i32 addrspace(1)* %4,         // sum_global — global scratch, read_write, 4 bytes
//     i32 addrspace(3)* %5)         // local_mem — threadgroup shared int buffer
//
// The IR labels each metadata operand explicitly (!17..!23). See in
// particular !18 for the params struct field order and !22/!23 for the
// global/threadgroup buffer types.
//
// ALGORITHM (decoded block by block from the .ll)
// ───────────────────────────────────────────────
//   %7  = extractelement lid,   0    ; lid.x
//   %8  = extractelement gSize, 0    ; gSize.x
//   %10 = params.m_y_1                ; struct index 3 (see !18)
//   %12 = params.m_y_2                ; struct index 4
//   if (m_y_1 < m_y_2) {              ; block %14 — outer loop entry
//     %16 = params.m_x_1              ; struct index 1
//     %19 = params.m_x_2              ; struct index 2
//     %21 = &params.m_label           ; struct index 0
//     for (y = m_y_1; y < m_y_2; y++) {           ; block %29
//       if (m_x_1 + lid.x < m_x_2) {              ; %20 gates the inner loop
//         %34 = params.m_label
//         for (x = m_x_1 + lid.x; x < m_x_2; x += gSize.x) {   ; block %39
//           uv = float2(x + 0.5, y + 0.5);
//           t  = air.sample_texture_2d.u.v4i32(_pval, uv, ...); // returns uvec4
//           if (t.r == m_label) count++;                        ; %49 zext-add
//         }
//       }
//     }
//   } else {
//     count = 0;                       ; %23 phi (initial value 0 from entry)
//   }
//   local_mem[lid.x] = count;          ; store @ block %22 line %25
//   air.wg.barrier(scope=2, flags=1);  ; PHASE BOUNDARY (see IR line %26 call)
//   if (lid.x == 0) {                  ; block %27 — only thread 0 reduces
//     if (gSize.x > 1) {               ; %28 icmp sgt
//       sum = count;                   ; phi seed = own count (%23)
//       for (i = 1; i < gSize.x; i++)  ; block %56 accumulator loop
//         sum += local_mem[i];
//     } else {
//       sum = count;
//     }
//     sum_global[0] = sum;             ; block %54, store to addrspace(1)
//   }
//
// NOTE: this kernel counts, per threadgroup, how many texels in a rectangular
// window `(m_x_1..m_x_2, m_y_1..m_y_2)` of `_pval` have their .r channel
// equal to `m_label`. The threadgroup shape is 1-D-in-X (only lid.x is
// used); one threadgroup covers the whole rectangle. lid.y is never read.
//
// The `air.convert.f.f32.s.i32` calls (%33, %42) are SIGNED int-to-float
// (that's the `.s.` variant — the `.u.` unsigned variant would need the
// `>>>0` coercion from SHADERS.md, but this kernel uses `.s.` throughout).
// The sample coord bias `+ 0.5` puts the sample at the pixel CENTER,
// matching AIR line %45.

import {
  UInt2,
  ThreadIndex,
  PhaseFn,
  dispatchThreadgroup,
} from "../harness/ThreadgroupReduction";

// ── Params struct (from !18) ────────────────────────────────────────────────
// The AIR name is `soMOMotionEstimation::soMOMotionEstimation_numPoints_params`
// (see !17), sizeof=20, aligned 4. Field types per !18 (offset, size, kind,
// name): 0=uint m_label, 4=int m_x_1, 8=int m_x_2, 12=int m_y_1, 16=int m_y_2.
export interface NumPointsParams {
  /** the uint label value that the sampled texture's .r channel is compared
   *  to (`.u.v4i32` returns a uvec4; we test the .r lane). */
  readonly m_label: number;
  readonly m_x_1: number;
  readonly m_x_2: number;
  readonly m_y_1: number;
  readonly m_y_2: number;
}

/** Sampler callback modeling `air.sample_texture_2d.u.v4i32(_pval, uv, ...)`.
 *  The AIR intrinsic returns a `{ <4 x i32>, i8 }` (rgba + residency); we
 *  only need the rgba value's .r lane (line %48 in the IR), so the callback
 *  returns just the uvec4 as [r, g, b, a]. `uv` is the (x+0.5, y+0.5)-shifted
 *  float2 from AIR line %45. */
export type SampleTexU4 = (uv: readonly [number, number]) => readonly [number, number, number, number];

// ── The two phases of the kernel (split at the air.wg.barrier) ──────────────

/** Phase 0: block %6 -> %22 in the IR. Each thread scans a Y-full,
 *  X-strided slice of the rectangle, counts label matches, and stores its
 *  per-thread total into `local_mem[lid.x]`. The %13 branch also lets
 *  threads whose y-range is empty (m_y_1 >= m_y_2) drop straight to the
 *  store with count=0. */
function phase0(
  params: NumPointsParams,
  sample: SampleTexU4,
): PhaseFn<Int32Array> {
  return (idx: ThreadIndex, localMem: Int32Array) => {
    const lidX = idx.lid[0] | 0;        // %7
    const gW   = idx.gSize[0] | 0;      // %8
    const m_label = params.m_label | 0; // %34 (loaded per outer-y iter in IR; the value is constant per dispatch — hoisting here matches semantics)
    const m_x_1 = params.m_x_1 | 0;     // %16
    const m_x_2 = params.m_x_2 | 0;     // %19
    const m_y_1 = params.m_y_1 | 0;     // %10
    const m_y_2 = params.m_y_2 | 0;     // %12

    let count = 0;                       // %23 phi seed for the empty-y branch
    if (m_y_1 < m_y_2) {                 // %13 icmp slt
      const xStart = (m_x_1 + lidX) | 0; // %17 add nsw
      if (xStart < m_x_2) {              // %20 icmp slt (inner-loop gate)
        for (let y = m_y_1; y < m_y_2; y = (y + 1) | 0) {          // %35 loop, +1 stride
          for (let x = xStart; x < m_x_2; x = (x + gW) | 0) {      // %52 loop, +gSize.x stride
            // AIR %42 = fp32(x), %33 = fp32(y); assembled as
            //   float2 uv = {fp32(x) + 0.5, fp32(y) + 0.5}  (%45).
            // Math.fround narrows to fp32 exactly like AIR's `.f.f32.s.i32`.
            const uv: [number, number] = [
              Math.fround(Math.fround(x) + 0.5),
              Math.fround(Math.fround(y) + 0.5),
            ];
            const t = sample(uv);        // %46 air.sample_texture_2d.u.v4i32
            // %48 extractelement <4 x i32> t, 0  (the .r lane)
            // %49 icmp eq t.r, m_label
            // %50 zext i1 -> i32   (0 or 1)
            // %51 add nsw count, {0,1}
            if ((t[0] | 0) === m_label) count = (count + 1) | 0;
          }
        }
      }
    }

    // Block %22: store the per-thread count into threadgroup memory at lid.x.
    //   %24 = sext i32 lid.x to i64
    //   %25 = &local_mem[lid.x]
    //   store i32 count, addrspace(3)* %25
    localMem[lidX] = count | 0;

    // ── air.wg.barrier(scope=2, flags=1) — PHASE BOUNDARY ──
    // (Not called here; the harness's phase list IS the barrier — the
    //  transition to phase1 is the barrier point in the IR.)
  };
}

/** Phase 1: blocks %27..%65 in the IR. Only thread 0 participates; it sums
 *  local_mem[0..gSize.x-1] and writes the result to sum_global[0]. Every
 *  other thread returns immediately (block %65 = ret void from %22 when
 *  lid.x != 0). */
function phase1(
  writeSum: (v: number) => void,
): PhaseFn<Int32Array> {
  return (idx: ThreadIndex, localMem: Int32Array) => {
    const lidX = idx.lid[0] | 0;                  // %7
    // %26 icmp eq lid.x, 0 — non-zero threads fall through to %65 ret.
    if (lidX !== 0) return;

    const gW = idx.gSize[0] | 0;                  // %8

    // %28 icmp sgt gW, 1 — if gW <= 1 we skip the loop and just store
    // localMem[0] (which IS thread 0's own count). Note the IR seeds the
    // %56 loop's accumulator with %23 (own count) at i=1, so we mirror that:
    let sum = localMem[0] | 0;                    // %23 == localMem[0] since phase0 stored it
    if (gW > 1) {
      for (let i = 1; i < gW; i = (i + 1) | 0) {  // %63 add nuw nsw, %64 icmp eq gW
        // %60 = &local_mem[i]; %61 = load; %62 = add nsw
        sum = (sum + (localMem[i] | 0)) | 0;
      }
    }
    // Block %54: store i32 sum, addrspace(1)* sum_global
    writeSum(sum | 0);
  };
}

/**
 * Run the numPoints kernel for ONE threadgroup on the CPU. The kernel is
 * always dispatched with a single threadgroup (lid.y is unused and gSize.y
 * is expected to be 1 by the shader) — the caller supplies the label,
 * rectangle, sample callback, and receives the count via the returned value.
 */
export function runNumPointsKernel(
  gSize: UInt2,
  params: NumPointsParams,
  sample: SampleTexU4,
): number {
  const gW = gSize[0] | 0;
  const localMem = new Int32Array(gW);
  let out = 0;
  const writeSum = (v: number) => { out = v | 0; };

  dispatchThreadgroup(gSize, localMem, [
    phase0(params, sample),
    phase1(writeSum),
  ]);

  return out | 0;
}
