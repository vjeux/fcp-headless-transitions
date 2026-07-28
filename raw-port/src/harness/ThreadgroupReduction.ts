// Faithful transcription @0x000000000d53ed
// ThreadgroupReduction.ts — CPU model of Metal compute threadgroup reductions.
//
// This harness is DECODE-BACKED by AIR IR from real HeliumSenso shaders. The
// air.wg.barrier + threadgroup shared-memory pattern is used by ~30 large FCP
// compute kernels (bm3dnr_buf haar8x8 / mcBuf / noiseStats / variance,
// soMOMotionEstimation reduction* / numPoints / moment / numWtSum,
// soOFlowEstimator estimateCLG* — the whole >500-line barrier family).
//
// Representative IR consulted while writing this harness (all in
// raw-port/re/shaders/):
//   soMOMotionEstimation__soMOMotionEstimation_numPoints.ll      @0x000000000d53ed
//   soMOMotionEstimation__soMOMotionEstimation_reductionQuadratic.ll
//   soMOMotionEstimation__soMOMotionEstimation_reductionSimilarity.ll
//   soMOMotionEstimation__soMOMotionEstimation_reductionTranslation.ll
//   soMOMotionEstimation__soMOMotionEstimation_moment.ll
//   bm3dnr_buf__bm3dnr_buf_frameStats16x16.ll
// (Extracted via raw-port/tools/shader_disasm.sh; the .ll files ARE the
// provenance and stay committed under re/shaders/.)
//
// AIR primitives being modeled
// ────────────────────────────
// Each barrier shader is compiled to a function whose arguments include
// (see !air.kernel metadata of any of the .ll files above):
//   - <2 x i32> %gSize   ; air.threads_per_threadgroup   (uint2)
//   - <2 x i32> %lid     ; air.thread_position_in_threadgroup (uint2)
//   - i32 addrspace(3)*  ; threadgroup ("local_mem") buffer — SHARED across
//                        ; all threads in the group; written before a barrier
//                        ; and read after it.
// and calls into
//   - tail call void @air.wg.barrier(i32 2, i32 1)   ; workgroup barrier —
//     all threads must reach this point before ANY thread continues; loads
//     issued after the barrier will see all stores issued before it.
//
// On a single-threaded CPU we model this by PHASING execution: we run every
// thread's code up to the barrier (phase 0), THEN — only once all threads
// have finished phase 0 — we run every thread's code after the barrier
// (phase 1). Between phases, the shared threadgroup buffer already holds
// every thread's phase-0 stores, exactly as air.wg.barrier guarantees.
//
// Threadgroup shared memory is modeled as a plain JS typed array (Int32Array
// / Float32Array / Uint16Array — pick the one matching the AIR
// `addrspace(3)` element type in your shader). Indexing is literal: the
// shader's `getelementptr i32, i32 addrspace(3)* %5, i64 %lid.x` becomes
// `sharedMem[lidX]` in the phase function.
//
// The harness intentionally exposes ONLY primitives that appear in the AIR:
// there is no synthetic reduction operator, no invented tree — the phase
// functions do the exact loops/strides the IR spells out.
//
// SEE ALSO: raw-port/src/shaders/soMOMotionEstimation_numPoints.ts — a
// worked example that ports the 171-line numPoints reduction using this
// harness, proving both phases run correctly (phase 0 = per-thread stride
// scan storing per-thread count into `local_mem[lid.x]`; phase 1 = thread
// 0 sums local_mem[0..gSize.x-1] and writes `sum_global`).
//
// ── uint2 / int2 vector helpers ────────────────────────────────────────────
// AIR represents `uint2` / `int2` (the types of gSize and lid) as
// `<2 x i32>`. In JS we carry them as plain `readonly [number, number]`
// tuples with the standard `.x`/`.y` accessors below.

/** AIR `<2 x i32>` as [x, y]. Used for threads_per_threadgroup and lid. */
export type UInt2 = readonly [number, number];

/** thread_position_in_threadgroup — matches air.arg `lid_` (uint2). */
export interface ThreadIndex {
  /** thread_position_in_threadgroup — AIR `<2 x i32>` lid (uint2). */
  readonly lid: UInt2;
  /** threads_per_threadgroup — AIR `<2 x i32>` gSize (uint2). */
  readonly gSize: UInt2;
  /** threadgroup_position_in_grid — AIR `<2 x i32>` (uint2). Optional
   * because many single-threadgroup kernels never read it; supplied by
   * the driver for kernels that do (e.g. tiled bm3dnr passes). */
  readonly tgid?: UInt2;
  /** thread_position_in_grid = tgid * gSize + lid (uint2). Convenience
   * value derived by the driver; matches how AIR spells `thread_position_in_grid`. */
  readonly gid?: UInt2;
}

/**
 * A single phase of a threadgroup kernel — the code between two consecutive
 * barriers (or between kernel entry and the first barrier, or between the
 * last barrier and kernel exit). It is invoked once per thread in the
 * threadgroup; all threads' calls to phase N complete before ANY thread
 * enters phase N+1.
 *
 * `sharedMem` is the SAME array reference every thread receives — writes by
 * one thread are visible to reads by another in the next phase. This models
 * AIR `addrspace(3)` (threadgroup memory) exactly.
 *
 * The concrete element type is chosen by the caller (Int32Array for the
 * `i32 addrspace(3)*` in numPoints, Float32Array for the
 * `float addrspace(3)*` in reductionQuadratic, etc.).
 */
export type PhaseFn<TShared> = (
  idx: ThreadIndex,
  sharedMem: TShared,
) => void;

/**
 * Drive a single threadgroup through an ordered list of phase functions,
 * with a workgroup barrier BETWEEN successive phases.
 *
 * `gSize` — the threadgroup shape (matches AIR `threads_per_threadgroup`).
 *           `gSize[0] * gSize[1]` threads total; lid iterates in
 *           column-major order (lid.x fastest, lid.y outer) — this matches
 *           how the sample IR indexes `local_mem[lid.x]` when lid.y == 0.
 * `sharedMem` — pre-sized typed array or plain array shared by all threads.
 *               Its element type must match the AIR `addrspace(3)` type.
 * `phases`  — one function per (barrier-separated) region of the kernel.
 *             With N phases, the harness inserts N-1 barriers between them.
 * `tgid`    — optional threadgroup_position_in_grid; defaults to (0, 0)
 *             for single-threadgroup dispatches.
 *
 * The implementation is the two-nested loop that literally IS the CPU
 * expression of "workgroup barrier": for each phase, iterate every thread
 * in the group, then advance to the next phase. See numPoints for the
 * canonical 2-phase example (compute-store, barrier, thread-0 sums).
 */
export function dispatchThreadgroup<TShared>(
  gSize: UInt2,
  sharedMem: TShared,
  phases: ReadonlyArray<PhaseFn<TShared>>,
  tgid: UInt2 = [0, 0],
): void {
  const gW = gSize[0] | 0;
  const gH = gSize[1] | 0;
  const tgX = tgid[0] | 0;
  const tgY = tgid[1] | 0;
  for (let p = 0; p < phases.length; p++) {
    const phase = phases[p];
    // Run every thread's phase-p code before any thread advances.
    for (let y = 0; y < gH; y++) {
      for (let x = 0; x < gW; x++) {
        const idx: ThreadIndex = {
          lid: [x, y],
          gSize,
          tgid: [tgX, tgY],
          gid: [tgX * gW + x, tgY * gH + y],
        };
        phase(idx, sharedMem);
      }
    }
    // The transition from phase p -> phase p+1 IS the barrier: by the time
    // the outer loop iterates to the next phase, every thread has finished
    // phase p, so every store to sharedMem is visible to every later read.
    // This matches air.wg.barrier(i32 2, i32 1) semantics — `scope=2`
    // (threadgroup) with `flags=1` (mem_flags::mem_threadgroup).
  }
}

/**
 * Drive a full 2D grid of threadgroups. `gridTgSize` is the number of
 * threadgroups along (x, y); `gSize` is the shape of ONE threadgroup.
 *
 * Each threadgroup receives a FRESH `sharedMem` from the `makeShared`
 * factory — threadgroup memory is per-group in Metal, not global.
 *
 * Used by kernels like bm3dnr_buf_frameStats16x16 (one threadgroup per
 * 16x16 tile) and any per-tile block-reduce.
 */
export function dispatchGrid<TShared>(
  gridTgSize: UInt2,
  gSize: UInt2,
  makeShared: () => TShared,
  phases: ReadonlyArray<PhaseFn<TShared>>,
): void {
  const gx = gridTgSize[0] | 0;
  const gy = gridTgSize[1] | 0;
  for (let ty = 0; ty < gy; ty++) {
    for (let tx = 0; tx < gx; tx++) {
      const sharedMem = makeShared();
      dispatchThreadgroup(gSize, sharedMem, phases, [tx, ty]);
    }
  }
}

// ── Barrier as a sentinel (documentation-only) ──────────────────────────────
// The harness never CALLS a barrier function — the phase-list itself IS the
// barrier structure. But we export a sentinel so translated shaders can name
// the barrier positions faithfully in a comment:
//   // ── air.wg.barrier(scope=threadgroup, flags=mem_threadgroup) ──
//   // (phase boundary)
export const AIR_WG_BARRIER_SCOPE_THREADGROUP = 2; // AIR barrier scope arg 0
export const AIR_WG_BARRIER_FLAGS_THREADGROUP = 1; // AIR barrier flags arg 1
