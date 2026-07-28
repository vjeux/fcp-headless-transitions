// soOFlowEstimator__soOFlowEstimator_medianFilterFlow.ts — direct TS mapping
// of the Metal compute kernel
// `soOFlowEstimator::soOFlowEstimator_medianFilterFlow` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader soOFlowEstimator::soOFlowEstimator_medianFilterFlow (HeliumSenso) @0x000000000aea9d
// IR provenance: raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_medianFilterFlow.ll
// (header: `0x000000000aea9d -- soOFlowEstimator::soOFlowEstimator_medianFilterFlow`)
//
// 3×3 componentwise median filter for a 2-channel flow field. For each
// destination pixel (gx, gy) that is in-bounds vs (dimX, dimY):
//   1. Compute clamped-to-edge sample window
//        min = clamp(coord - 1, 0, dim - 1)
//        max = clamp(coord + 1, 0, dim - 1)
//     (2-lane SIGNED int clamp — `air.clamp.s.v2i32`).
//   2. Enumerate every (cx, cy) in the box, sample `flowIn` at pixel-
//      centre (cx + 0.5, cy + 0.5), and stash both channels of the .rg
//      component into an on-stack `float[18]` — up to 9 pairs. The
//      order is (cx varies slowest, cy varies fastest) with a running
//      slot index; if the x-clamp collapsed (min.x > max.x) or the
//      y-clamp collapsed (min.y > max.y), the corresponding loop is
//      skipped and NO samples are stored.
//   3. Insertion-sort each channel INDEPENDENTLY over the collected
//      samples (accessing lanes with stride 2).
//   4. Median index = `ceil(count / 2) - 1` — i.e. lower-median for even
//      counts. Output `(arr[2*k], arr[2*k+1], 0, 0)` to `flowOut` at
//      (gx, gy).
//
// If EITHER clamp collapsed (empty window), no samples are stored and no
// sort happens (count == 0). The IR still runs the "output" block %70,
// but ONLY when the count>1 sort path is taken (via the %36 predicate
// gate); if count <= 1, the sort loop is skipped for both channels. The
// output stage %70 requires reaching it via label %88 → %70 with
// %68=false, which only happens after the second sort-or-skip pass.
// When count == 0, arr[] is uninitialised — the write would emit
// undefined data. In practice the caller sizes the dispatch so this
// never fires (in-bounds threads have at least min.x == max.x AND
// min.y == max.y — a 1×1 window with one sample). Reproduce the IR
// faithfully: initialise the stash to 0 (mirrors the deterministic
// zero-fill that a compliant Metal implementation must NOT do, but is
// the closest observable behaviour — see !12 `fast_math_disable`).
//
// -----------------------------------------------------------------------------
// Signature (%N naming from the .ll):
//   void @soOFlowEstimator::soOFlowEstimator_medianFilterFlow(
//     %params*                   %0,   // params
//     <2 x i32>                  %1,   // thread_position_in_grid (gx, gy)
//     sampler                    %2,   // sam
//     texture2d<float, sample>   %3,   // flowIn
//     texture2d<float, write>    %4    // flowOut
//   )
//
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// Only two fp32 ops in the body — `air.convert.f.f32.s.i32` (i32 -> f32)
// and `fmul %71, 0.5` (%72 in IR) — everything else is int / texture /
// insertion-sort.
//
// -----------------------------------------------------------------------------
// Params struct layout (from !18):
//   i32   m_dimX   @  0    field 0
//   i32   m_dimY   @  4    field 1

/** Uniform buffer for the median filter (!18). */
export interface SoOFlowEstimatorMedianFilterFlowParams {
  /** field 0 — i32 `m_dimX` (grid.x bound). */
  readonly dimX: number;
  /** field 1 — i32 `m_dimY` (grid.y bound). */
  readonly dimY: number;
}

/** AIR `air.sample_texture_2d.v4f32(tex, sam, uv, ...)` callback. */
export type SampleFloatFn<TTex, TSam> = (texture: TTex, sampler: TSam, u: number, v: number) => [number, number, number, number];

/** AIR `air.write_texture_2d.v4f32` callback. */
export type WriteFloat4Fn<T> = (texture: T, x: number, y: number, rgba: readonly [number, number, number, number]) => void;

/**
 * AIR `air.clamp.s.v2i32(v, lo, hi)` — 2-lane SIGNED int clamp.
 * Callers here always pass lo = <0, 0>, hi = dim - 1 (positive).
 */
function airClampSI32_2(x: number, y: number, loX: number, loY: number, hiX: number, hiY: number): [number, number] {
  const cx = x < loX ? loX : (x > hiX ? hiX : x);
  const cy = y < loY ? loY : (y > hiY ? hiY : y);
  return [cx | 0, cy | 0];
}

/** AIR `air.ceil.f32(x)`. */
function airCeilF32(x: number): number {
  return Math.fround(Math.ceil(x));
}

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_medianFilterFlow`.
 * See file header for algorithm description.
 */
export function soOFlowEstimator__soOFlowEstimator_medianFilterFlow<TSam, TFlowIn, TFlowOut>(
  params: SoOFlowEstimatorMedianFilterFlowParams, // %0
  gridPos: readonly [number, number],              // %1
  sam: TSam,                                       // %2
  flowIn: TFlowIn,                                 // %3
  flowOut: TFlowOut,                               // %4
  sampleFlowIn: SampleFloatFn<TFlowIn, TSam>,
  writeFlowOut: WriteFloat4Fn<TFlowOut>,
): void {
  const gx = gridPos[0] | 0;
  const gy = gridPos[1] | 0;

  // %8 = load m_dimX (field 0) ; %10 = load m_dimY (field 1)
  const dimX = params.dimX | 0;
  const dimY = params.dimY | 0;

  // %12 = icmp slt gx, dimX ; %14 = icmp slt gy, dimY ; %15 = %12 && %14
  const inX = gx < dimX;
  const inY = gy < dimY;
  const inside = inX ? inY : false;
  if (!inside) return; // br %15 -> %107 ret

  // ---- %16 setup ----
  // %6 alloca [18 x float] — up to 9 (x, y) pairs. Zero-init to match a
  // deterministic-observed stash (see header note).
  const arr: number[] = new Array(18).fill(0);

  // %17/%18 = <dimX, dimY>
  // %20 = coord + <-1, -1> ; %21 = <dimX-1, dimY-1>
  // %22 = clamp(coord - 1, 0, dim - 1)         -> minWin (2-vec)
  const dimMaxX = (dimX - 1) | 0;
  const dimMaxY = (dimY - 1) | 0;
  const [minX, minY] = airClampSI32_2(gx - 1, gy - 1, 0, 0, dimMaxX, dimMaxY);
  // %23 = coord + <1, 1> ; %24 = clamp(coord + 1, 0, dim - 1) -> maxWin
  const [maxX, maxY] = airClampSI32_2(gx + 1, gy + 1, 0, 0, dimMaxX, dimMaxY);

  // %25 = minWin.x ; %26 = maxWin.x ; %27 = icmp sgt minX, maxX
  //   (empty x-clamp — jump past both loops to the median-output prep)
  let count = 0;                                     // %35 phi

  if (!(minX > maxX)) {
    // %28: %29 = minWin.y ; %30 = maxWin.y ; %31 = icmp sgt minY, maxY
    //   (empty y-clamp — skip inner loop but still count "one iter" per cx)
    const yEmpty = minY > maxY;

    // %32 = 1 - minY ; %33 = 1 - minY + maxY = (maxY - minY + 1)
    // = height of y-window. Used as the increment target on %49 stop cond.
    const yLen = (maxY - minY + 1) | 0;             // %33

    // Outer x-loop (%37 -> %44).
    //   phi %38 = running store slot index (starts 0, updated to %45 at loop tail)
    //   phi %39 = cx (starts minX, increments by 1 each iter)
    //   stop when %39 == maxX (via %47 test on ORIGINAL %39)
    //
    //   %45 phi at %44:
    //     - from %37 (yEmpty branch — inner loop skipped) : %45 = %38 (unchanged)
    //     - from %48 (inner-loop ran)                     : %45 = stopSlot (%38 + yLen)
    let slot = 0;                                    // %38
    let cx = minX;                                   // %39
    for (;;) {
      let nextSlot: number;
      if (yEmpty) {
        // %37 -> %44: inner loop skipped, slot unchanged
        nextSlot = slot;                             // %45 = %38 in the yEmpty phi
      } else {
        // %40 -> %48 inner y-loop.
        //   %49 phi = slot (starts %38)
        //   %50 phi = cy (starts %29 = minY)
        //   stops when %64 (post-increment slot) == %43 (= %38 + yLen)
        const stopSlot = (slot + yLen) | 0;         // %43
        let s = slot;                                 // %49
        let cy = minY;                                // %50
        const cxF = Math.fround(cx);                  // %41 = float(cx)
        for (;;) {
          const cyF = Math.fround(cy);                // %51 = float(cy)
          // uv = (float(cx) + 0.5, float(cy) + 0.5)
          const u = Math.fround(cxF + Math.fround(0.5));
          const v = Math.fround(cyF + Math.fround(0.5));
          // %54 sample flowIn ; %55 extract .rgba
          const rgba = sampleFlowIn(flowIn, sam, u, v);
          // %57 = shl slot, 1 = 2*slot ; store .r
          const base = (s << 1) | 0;
          arr[base] = Math.fround(rgba[0]);          // %59/%56 -> arr[2s]     = .r
          // %61 = base | 1 = 2*slot + 1 ; store .g
          arr[base | 1] = Math.fround(rgba[1]);      // %63/%60 -> arr[2s+1]   = .g
          // %64 = slot + 1 ; %65 = cy + 1
          const nextS = (s + 1) | 0;
          const nextCy = (cy + 1) | 0;
          // %66 = icmp eq nextS, stopSlot
          if (nextS === stopSlot) {
            s = nextS;
            break;
          }
          s = nextS;
          cy = nextCy;
        }
        // %45 = stopSlot when inner ran
        nextSlot = s;
      }
      // Commit %45 into %38 for the next iteration (or into %35 on loop exit).
      slot = nextSlot;
      // %46 = cx + 1 ; %47 = icmp eq %39 (ORIGINAL cx), maxX
      if (cx === maxX) break;                        // exit outer loop (POST-store check on original %39)
      cx = (cx + 1) | 0;
    }
    count = slot;                                    // %35 phi from %44 = final total samples stashed
  }
  // else: minX > maxX -> count stays 0 (jumps to %34 with %35 = 0)

  // ---- sort phase (%34, %67 ..) ----
  // Loop over the two channels (channel = 0, then 1) with an insertion sort
  // over `count` samples stashed at stride 2 (arr[2*i + channel]).
  const doSort = count > 1;                          // %36
  if (doSort) {
    for (let channel = 0; channel < 2; channel++) {
      // %86 -> %89 -> %104 insertion sort.
      //   Outer i = 1 .. count-1
      //   Inner j from i downward; swap while arr[2*j + ch] < arr[2*(j-1) + ch]
      //   (fcmp olt in IR — ordered less-than)
      for (let i = 1; i < count; i++) {
        let j = i;
        for (;;) {
          const idxHi = ((j << 1) | channel) | 0;                     // %92 = 2*j | ch
          const idxLo = (idxHi - 2) | 0;                              // %96 = idxHi - 2
          const hi = Math.fround(arr[idxHi]);
          const lo = Math.fround(arr[idxLo]);
          // %100 = fcmp olt hi, lo
          if (hi < lo) {
            arr[idxHi] = lo;
            arr[idxLo] = hi;
            const nextJ = (j - 1) | 0;                                // %102
            // %103 = icmp sgt %90, 1  — continue while j (pre-dec) > 1
            if (j > 1) {
              j = nextJ;
              continue;
            }
          }
          break;
        }
      }
    }
  }

  // ---- output (%70) ----
  // %71 = float(count) ; %72 = count * 0.5 ; %73 = ceil ; %74 = ceil - 1
  const countF = Math.fround(count | 0);
  const half = Math.fround(countF * Math.fround(0.5));
  const ceilHalf = airCeilF32(half);
  const kF = Math.fround(ceilHalf + Math.fround(-1));
  // %75 = fp32 -> s_i32 (trunc toward zero); ceil(count/2) - 1 is already integer here
  const k = Math.trunc(kF) | 0;
  // %76 = 2 * k ; %79 = arr[2k]  ; %83 = arr[2k+1]
  const base = (k << 1) | 0;
  const medX = Math.fround(arr[base]);
  const medY = Math.fround(arr[base | 1]);
  // %84/%85 build (medX, medY, 0, 0) and write
  writeFlowOut(flowOut, gx, gy, [medX, medY, 0, 0]);
  // br label %107 ; ret void
}
