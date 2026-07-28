// Faithful transcription @0x00000000000015d8 — @shader mergeKernel (VAML)
// Source IR: raw-port/re/shaders/mergeKernel.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/VAML.framework/
//     Versions/A/Resources/default.metallib
// via `bash raw-port/tools/shader_disasm.sh mergeKernel VAML` — the .ll first
// line reads `0x000000000015d8 -- mergeKernel:`)
//
// VAML = "Vision Algorithms Media Library" — a Metal-backed connected-component
// labelling compute pass used by Motion/FCP for tracking-style analyses (region
// finding, blob analysis). This kernel implements the neighbour-merge step of a
// classic UF/disjoint-set 8-connectivity labelling: for each cell (gid.x,gid.y)
// that survives the threshold `*threshold`, walk the four neighbour offsets in
// {(dx,dy) | dx∈{-1,0,1}, dy∈{-1,0,1}, (dx,dy)≠(0,0)} intersected with the two
// low-diagonal predecessors (the loop layout below picks exactly the (r,d)∈
// {-1,0}×{-1,0} minus (0,0) pattern, i.e. the four upper-left and left neighbours
// under the 8-connectivity template) and, for each in-bounds neighbour that also
// survives threshold, `merge(labeledImage, this-index, neighbour-index)`.
//
// The merge itself is the two-pointer lock-free UF: for each of the two input
// indices, follow the chain `label[i]-1` while `label[i]-1 != i` (i.e. until a
// self-loop, the standard "self is root" encoding shifted by 1 so that value 0
// can distinguish "no label"), then unify the two found roots by writing a new
// pointer via `air.atomic.global.min.u.i32(new_root_ptr, smaller_root+1, …)`.
// The two atomic-min races settle at a lower fixed-point, giving convergence.
//
// AIR signature (from !air.kernel !15 and !18..!26):
//   define void @mergeKernel(
//     texture2d<float, read> sourceTexture     ; !18 read-only source
//     device metal::_atomic<uint>* labeledImage; !19 read/write UF forest
//     constant float* threshold                ; !21 scalar cutoff
//     constant bool* onlyBorders               ; !22 restrict to grid borders
//     uint2 gid                                ; !23 thread_position_in_grid
//     uint2 pid                                ; !24 thread_position_in_threadgroup
//     uint2 threads_per_threadgroup            ; !25 (compared against gid+1 for border test)
//     uint2 threads_per_grid                   ; !26 air.arg_unused
//   ) -> void
//
// The IR uses `air.atomic.global.load.i32` (memory order acquire — !18==i32 2)
// and `air.atomic.global.min.u.i32` for the actual UF ops. Faithful transcription
// mirrors these as caller-supplied callbacks so the caller wires the atomic
// backend (a shared Uint32Array + Atomics on the JS side, or the real Metal
// atomic table under a WebGPU/Metal renderer). We do NOT reorder or fuse the
// atomic accesses — the IR's exact sequence is preserved.
//
// Faithful fp32 transcription — no fitting, no fudging. UF pointer semantics
// preserved verbatim from the IR (indices, +1/−1 sentinel offsets, and the
// argument order of every atomic call).

/**
 * Read `air.atomic.global.load.i32(&labeledImage[i], sync=0, order=2 acquire, i1 true)`.
 * Returns the packed "parent+1" pointer stored at UF forest slot `i`.
 * @IR %6/%13/%20/%27 in _Z5merge
 */
export type AtomicLoadFn = (i: number) => number;

/**
 * Read `air.atomic.global.min.u.i32(&labeledImage[i], value, sync=0, order=2 acquire, i1 true)`.
 * Atomically updates slot `i` to `min(slot[i], value)` unsigned; returns the
 * previous value (result unused by the IR here — it is discarded).
 * @IR %37/%44 in _Z5merge
 */
export type AtomicMinUFn = (i: number, value: number) => number;

/**
 * Read `air.read_texture_2d.v4f32(sourceTexture, coord, i32 0, i32 1)`.
 * Returns the four fp32 components at `coord` (i8 occlusion flag from the
 * struct return is discarded — IR only reads `extractvalue …, 0`).
 * @IR %32/%59
 */
export type ReadSourceTextureFn = (
  coord: readonly [number, number],
) => [number, number, number, number];

/**
 * Return `air.get_width_texture_2d(sourceTexture, 0)` (i32/u32).
 * @IR %9
 */
export type GetTextureWidthFn = () => number;
/**
 * Return `air.get_height_texture_2d(sourceTexture, 0)` (i32/u32).
 * @IR %14
 */
export type GetTextureHeightFn = () => number;

/**
 * Internal helper — faithful transcription of `_Z5merge` (@0x…, "fastcc void
 * @_Z5mergePU9MTLdeviceN5metal7_atomicIjvEEjj"). Two-pointer lock-free UF
 * merge: walk each input's chain to its root via `label[i]-1 == i`, then
 * unify the two roots by writing `min_root+1` into the higher-root slot with
 * `air.atomic.global.min.u.i32`.
 *
 * @param a  first index (%1)
 * @param b  second index (%2)
 * @param atomicLoad  mirrors `air.atomic.global.load.i32` on `labeledImage`
 * @param atomicMinU  mirrors `air.atomic.global.min.u.i32` on `labeledImage`
 */
function merge(
  a: number,
  b: number,
  atomicLoad: AtomicLoadFn,
  atomicMinU: AtomicMinUFn,
): void {
  // Path 1: walk from `a` (%1). Encoded as `label[i]-1 == i` => "i is root".
  // @IR %6 = atomic.load(&label[a]); %7 = %6 - 1; %8 = (%7 == a)?
  //     if not, loop starting at %10 = %7 (%14 next).
  let load1 = atomicLoad(a >>> 0) >>> 0;
  let cur1 = a >>> 0;
  let next1 = ((load1 - 1) >>> 0);
  // @IR %8 = icmp eq i32 %7, %1 — root if load-1 equals current.
  if (next1 !== cur1) {
    // Loop @IR labels 9→9 phi %10 = [%14, %9], [%7, %3].
    do {
      cur1 = next1;
      // @IR %13 = atomic.load(&label[cur1]); %14 = %13 - 1; %15 = (%14 == cur1)
      load1 = atomicLoad(cur1) >>> 0;
      next1 = ((load1 - 1) >>> 0);
    } while (next1 !== cur1);
  }
  // @IR %17 = phi i32 [ %1, %3 ], [ %10, %9 ] — root of a.
  const rootA = cur1 >>> 0;

  // Path 2: same for `b` (%2). @IR block 16 onwards; %20/%21, then loop 23→23.
  let load2 = atomicLoad(b >>> 0) >>> 0;
  let cur2 = b >>> 0;
  let next2 = ((load2 - 1) >>> 0);
  // @IR %22 = icmp eq i32 %21, %2
  if (next2 !== cur2) {
    do {
      cur2 = next2;
      // @IR %27 = atomic.load(&label[cur2]); %28 = %27 - 1; %29 = (%28 == cur2)
      load2 = atomicLoad(cur2) >>> 0;
      next2 = ((load2 - 1) >>> 0);
    } while (next2 !== cur2);
  }
  // @IR %31 = phi i32 [ %2, %16 ], [ %24, %23 ] — root of b.
  const rootB = cur2 >>> 0;

  // @IR %32 = icmp ult i32 %17, %31 — unsigned compare
  if ((rootA >>> 0) < (rootB >>> 0)) {
    // @IR block 33: %34 = zext i32 %31; %35 = add nuw i32 %17, 1
    //               %37 = @air.atomic.global.min.u.i32(&label[%31], %17+1, …)
    atomicMinU(rootB, ((rootA + 1) >>> 0));
    return;
  }
  // @IR %39 = icmp ugt i32 %17, %31
  if ((rootA >>> 0) > (rootB >>> 0)) {
    // @IR block 40: %41 = zext i32 %17; %43 = add nuw i32 %31, 1
    //               %44 = @air.atomic.global.min.u.i32(&label[%17], %31+1, …)
    atomicMinU(rootA, ((rootB + 1) >>> 0));
    return;
  }
  // Equal roots — nothing to unify. @IR falls straight through to ret void.
}

/**
 * mergeKernel — VAML connected-component labelling neighbour-merge pass.
 *
 * For each grid position `gid` that survives the threshold, walk two-neighbour
 * offset patterns and, for each in-bounds neighbour that also survives, merge
 * their UF slots in `labeledImage`.
 *
 * The border-gate: when `*onlyBorders` is non-zero, the kernel restricts
 * itself to threadgroup-boundary pids (either pid.x == threads_per_threadgroup.x-1
 * or pid.y == threads_per_threadgroup.y-1) — this is the "process only the
 * seams between threadgroups" mode used by the second pass of a two-pass
 * boundary-first labelling.
 *
 * @param sourceTexture     Bound texture2d<float, read> — supplied via
 *                          `readSourceTexture` callback (mirrors
 *                          `air.read_texture_2d.v4f32`).
 * @param getTextureWidth   Mirrors `air.get_width_texture_2d(sourceTexture, 0)`.
 * @param getTextureHeight  Mirrors `air.get_height_texture_2d(sourceTexture, 0)`.
 * @param readSourceTexture Mirrors `air.read_texture_2d.v4f32(sourceTexture, coord, 0, 1)`.
 * @param atomicLoad        Mirrors `air.atomic.global.load.i32` on `labeledImage`.
 * @param atomicMinU        Mirrors `air.atomic.global.min.u.i32` on `labeledImage`.
 * @param threshold         `*threshold` (constant float*, buffer(1), size 4).
 * @param onlyBorders       `*onlyBorders` (constant bool*, buffer(2), size 1) — 0/1.
 * @param gid               air.thread_position_in_grid (uint2).
 * @param pid               air.thread_position_in_threadgroup (uint2).
 * @param threadsPerThreadgroup air.threads_per_threadgroup (uint2).
 * @param _threadsPerGrid   air.threads_per_grid (uint2) — `air.arg_unused` in !26.
 */
export function mergeKernel(
  getTextureWidth: GetTextureWidthFn,
  getTextureHeight: GetTextureHeightFn,
  readSourceTexture: ReadSourceTextureFn,
  atomicLoad: AtomicLoadFn,
  atomicMinU: AtomicMinUFn,
  threshold: number,
  onlyBorders: number,
  gid: readonly [number, number],
  pid: readonly [number, number],
  threadsPerThreadgroup: readonly [number, number],
  _threadsPerGrid: readonly [number, number],
): void {
  // @IR %9  = @air.get_width_texture_2d(sourceTexture, 0)
  const width = getTextureWidth() >>> 0;
  // @IR %10 = extractelement <2 x i32> %4, i64 0 — gid.x
  const gx = gid[0] >>> 0;
  // @IR %11 = add i32 %9, -1     — width - 1
  //     %12 = icmp ugt i32 %10, %11
  //     br i1 %12, label %69 (early ret), label %13
  const wMinus1 = (width - 1) >>> 0;
  if ((gx >>> 0) > (wMinus1 >>> 0)) {
    return;
  }
  // @IR %14 = @air.get_height_texture_2d(sourceTexture, 0)
  const height = getTextureHeight() >>> 0;
  // @IR %15 = extractelement <2 x i32> %4, i64 1 — gid.y
  const gy = gid[1] >>> 0;
  // @IR %16 = add i32 %14, -1
  //     %17 = icmp ugt i32 %15, %16
  //     br i1 %17, label %69, label %18
  const hMinus1 = (height - 1) >>> 0;
  if ((gy >>> 0) > (hMinus1 >>> 0)) {
    return;
  }
  // @IR %19 = load i8, i8* onlyBorders (align 1, range 0..1)
  //     %20 = icmp eq i8 %19, 0
  //     br i1 %20, label %31 (default path), label %21 (border-gate path)
  const isBorderMode = ((onlyBorders | 0) & 0xff) !== 0;
  if (isBorderMode) {
    // @IR block 21..30:
    //   %22 = extractelement <2 x i32> %6, i64 1 — threadsPerThreadgroup.y
    //   %23 = extractelement <2 x i32> %6, i64 0 — threadsPerThreadgroup.x
    //   %24 = extractelement <2 x i32> %5, i64 0 — pid.x
    //   %25 = add i32 %23, -1                    — tpt.x - 1
    //   %26 = icmp eq i32 %24, %25               — pid.x == tpt.x-1
    //   %27 = extractelement <2 x i32> %5, i64 1 — pid.y
    //   %28 = add i32 %22, -1                    — tpt.y - 1
    //   %29 = icmp eq i32 %27, %28               — pid.y == tpt.y-1
    //   %30 = or i1 %26, %29                     — either boundary
    //   br i1 %30, label %31 (continue), label %69 (ret) — skip interior threads.
    const tptX = threadsPerThreadgroup[0] >>> 0;
    const tptY = threadsPerThreadgroup[1] >>> 0;
    const pxAtBoundary = (pid[0] >>> 0) === ((tptX - 1) >>> 0);
    const pyAtBoundary = (pid[1] >>> 0) === ((tptY - 1) >>> 0);
    if (!(pxAtBoundary || pyAtBoundary)) {
      return;
    }
  }

  // @IR block 31: sample the source texture at gid and threshold-gate.
  //   %32 = @air.read_texture_2d.v4f32(sourceTexture, %4 gid, 0, 1)
  //   %33 = extractvalue { <4 x float>, i8 } %32, 0
  //   %34 = extractelement <4 x float> %33, i64 0 — .x channel
  //   %35 = load float, float* threshold (align 4)
  //   %36 = fcmp fast olt float %34, %35
  //   br i1 %36, label %69 (below threshold → skip), label %37
  const srcTexel = readSourceTexture([gx | 0, gy | 0]);
  const srcX = Math.fround(srcTexel[0]);
  const thr = Math.fround(threshold);
  if (srcX < thr) {
    return;
  }

  // @IR block 37:
  //   %38 = mul i32 %9, %15                     — width * gid.y
  //   %39 = add i32 %38, %10                    — thisIndex = width*gy + gx
  const thisIndex = ((Math.imul(width | 0, gy | 0) >>> 0) + gx) >>> 0;

  // @IR outer loop: %41 = phi i32 [ -1, %37 ], [ %47, %46 ] — r ∈ {-1, 0}.
  //   %42 = add i32 %41, %10                    — nx = gid.x + r
  //   %43 = icmp sgt i32 %42, -1                — nx > -1 (signed)
  //   %44 = icmp slt i32 %42, %11               — nx < width-1 (signed)
  //   %45 = insertelement <2 x i32> undef, %42, i64 0
  //   goto inner loop (%49). After inner: %47 = %41 + 1; if %47 == 2 → ret.
  for (let r = -1 | 0; r !== 2; r = (r + 1) | 0) {
    const nx = ((gx | 0) + r) | 0;
    // @IR %43: signed sgt %42, -1 — nx > -1 (i.e. nx >= 0)
    const nxGtNeg1 = (nx | 0) > (-1 | 0);
    // @IR %44: signed slt %42, %11 — nx < width-1 (signed compare, treat wMinus1 as i32).
    // Note the asymmetry vs %12/%17 which used unsigned ugt — that's decoded verbatim.
    const nxLtWm1 = (nx | 0) < ((wMinus1 | 0));
    // @IR inner loop: %50 = phi i32 [ -1, %40 ], [ %67, %66 ] — d ∈ {-1, 0}.
    //   %51 = add i32 %50, %15                  — ny = gid.y + d
    //   %52 = icmp sgt i32 %51, -1              — ny > -1
    //   %53 = select i1 %43, i1 %52, i1 false   — nxGtNeg1 && nyGtNeg1
    //   %54 = icmp slt i32 %51, %16             — ny < height-1
    //   %55 = select i1 %53, i1 %54, i1 false   — && nyLtHm1
    //   %56 = select i1 %55, i1 %44, i1 false   — && nxLtWm1
    //   br i1 %56, label %57 (in-bounds), label %66 (skip)
    for (let d = -1 | 0; d !== 2; d = (d + 1) | 0) {
      const ny = ((gy | 0) + d) | 0;
      // Skip the (0,0) self — but the IR does NOT skip (0,0)! It relies on
      // the merge(sameIndex, sameIndex) being a no-op because both roots
      // collapse to the same slot and neither `ult` nor `ugt` fires. So we
      // also do NOT skip (0,0) — faithful transcription.
      const nyGtNeg1 = (ny | 0) > (-1 | 0);
      const nyLtHm1 = (ny | 0) < ((hMinus1 | 0));
      // @IR %55 = && ; %56 = && ; note the ordering — see comment above.
      const inBounds = nxGtNeg1 && nyGtNeg1 && nyLtHm1 && nxLtWm1;
      if (!inBounds) {
        continue;
      }
      // @IR block 57:
      //   %58 = insertelement <2 x i32> %45 (with nx), %51, i64 1 — coord = (nx, ny)
      //   %59 = @air.read_texture_2d.v4f32(sourceTexture, %58, 0, 1)
      //   %60 = extractvalue …, 0
      //   %61 = extractelement <4 x float> %60, i64 0
      //   %62 = fcmp fast ult float %61, %35    — neighbour < threshold?
      //   br i1 %62, label %66 (skip), label %63 (merge)
      const nTexel = readSourceTexture([nx | 0, ny | 0]);
      const nX = Math.fround(nTexel[0]);
      if (nX < thr) {
        continue;
      }
      // @IR block 63:
      //   %64 = mul i32 %51, %9                 — ny * width
      //   %65 = add i32 %64, %42                — neighbourIndex = ny*width + nx
      //   call fastcc @_Z5merge(labeledImage, %39 thisIndex, %65 nIndex)
      const nIndex = ((Math.imul(ny | 0, width | 0) >>> 0) + (nx >>> 0)) >>> 0;
      merge(thisIndex, nIndex, atomicLoad, atomicMinU);
    }
  }
  // @IR block 69: ret void — fall through when outer loop completes.
}
