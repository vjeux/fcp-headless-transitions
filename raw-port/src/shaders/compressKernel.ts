// Faithful transcription @0x00000000004728 — @shader compressKernel (VAML)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/compressKernel.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// VAML.framework/Versions/A/Resources/default.metallib. The .ll header
// line reads `0x00000000004728 -- compressKernel:` — that is the
// shader's entry offset in the metallib. Compile options:
// `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. This shader performs
// integer union-find path compression on a flat label buffer — the
// `fast_math` flag has no observable effect on integer atomics.
//
// This is a compute KERNEL (!air.kernel/!15) dispatched one thread
// per pixel. It implements a step of the connected-components
// label-compression pass over a flat array of atomic uint32 labels.
//
// Arguments (!17..!25):
//   labeledImage    : device atomic<uint>* (buffer 0, read_write).
//                     Flat row-major array of size width*height.
//                     Each cell stores a 1-based label (0 = "no label
//                     yet / background" in the sense of the sentinel
//                     tested at %23 below).
//   width           : constant uint*      (buffer 1, size 4).
//   height          : constant uint*      (buffer 2, size 4).
//   componentCount  : device atomic<uint>*(buffer 3, read_write).
//                     Per-label counter of pixels; incremented by 1
//                     for each pixel that reaches the "settled"
//                     branch (%45).
//   centroidX       : device atomic<uint>*(buffer 4, read_write).
//                     Per-label accumulator of pixel X coordinates;
//                     `+= gid.x` at %47. Together with componentCount
//                     this yields per-component centroid-x means.
//   labeledTexture  : texture2d<float, read_write> (texture 0).
//                     Output texture written with the settled label
//                     (as float in all three channels, alpha=1) or
//                     with (0,0,0,1) for background pixels.
//   gid             : uint2 (air.thread_position_in_grid).
//
// -- Atomic parameters --
// Every `air.atomic.global.load.i32(ptr, order, scope, isVolatile)` in
// the IR is `(ptr, 0, 2, true)`:
//   order 0 = memory_order_relaxed
//   scope 2 = memory_scope_device
//   volatile bit set (i1 true) — matches the Metal source
//                                std::atomic_load_explicit(...) with
//                                a device-scoped relaxed order.
// Every `air.atomic.global.store.i32(ptr, val, order, scope, vol)` is
// `(ptr, val, 0, 2, true)` — same order/scope.
// Every `air.atomic.global.add.u.i32(ptr, val, order, scope, vol)` is
// `(ptr, val, 0, 2, true)` — relaxed device-scoped fetch-add.
// This TypeScript transcription models the buffers as plain
// Uint32Array — there is no cross-thread concurrency to preserve
// because each pixel writes only its own labeledImage cell (%43),
// and the componentCount/centroidX increments target distinct root
// labels across settled pixels (contention is possible in the real
// GPU dispatch, but relaxed-order atomics are commutative so a
// single-threaded serial replay produces the correct sum).
//
// -- Control flow (block-by-block) --
//
//   entry (%7):
//     %8  = gid.x
//     %9  = load width
//     %10 = width - 1
//     %11 = gid.x >ᵤ (width - 1)         (icmp ugt)
//     branch %11 -> %52 (early-out, no write) else %12
//
//     Semantics: if gid.x >= width, do NOTHING (no texture write, no
//     buffer touch). This is the standard out-of-bounds guard for a
//     dispatch that was rounded up to threadgroup size.
//
//   %12 (in-x-bounds):
//     %13 = gid.y
//     %14 = load height
//     %15 = height - 1
//     %16 = gid.y >ᵤ (height - 1)
//     branch %16 -> %52 (early-out) else %17
//
//   %17 (in-bounds):
//     %18 = width * height              (i32 mul — actually width*gid.y
//                                        by dominators; see below)
//     Careful read: `%18 = mul i32 %9, %13`. %9 is `width`, %13 is
//     `gid.y`. So %18 = width * gid.y — the row offset.
//     %19 = row_offset + gid.x          (flat index)
//     %20 = zext to i64
//     %21 = &labeledImage[flatIdx].__s  (atomic uint*)
//     %22 = atomic_load labeledImage[flatIdx]
//     %23 = (label == 0)
//     branch %23 -> %24 (background) else %25
//
//   %24 (background pixel):
//     write_texture(labeledTexture, gid, (0.0, 0.0, 0.0, 1.0), lod=0,
//                    mask=3)   -- mask 3 = write ONLY R+G channels?
//                                See NOTE on mask below.
//     branch %52
//
//   NOTE on write mask: the 5th argument to `air.write_texture_2d.v4f32`
//   is documented in Apple's AIR spec as `(texture, coord, value, lod,
//   ??? )`. The value `3` here matches the "no-swizzle, all-channel"
//   codegen for float RGBA writes — every observed metallib in this
//   port emits `i32 3` here and the pixels do land in R,G,B,A. We
//   preserve the constant `3` in the write and treat it as opaque.
//
//   %25 (has a label — do union-find):
//     %26 = label - 1                       (unsigned; label is 1-based
//                                            so parent index is label-1
//                                            in the flat array)
//     %27 = zext to i64
//     %28 = &labeledImage[parentIdx]
//     %29 = atomic_load labeledImage[parentIdx]
//     %30 = (parentLabel == label)          (%29 == %22)
//     branch %30 -> %40 (root already found) else %31
//
//     Semantics: "label X points at itself" (i.e. labeledImage[X-1] ==
//     X) is the root sentinel. If we're already at a root, skip the
//     walk.
//
//   %31 (walk the parent chain):
//     %32 = parentLabel - 1                 (next index to visit)
//     branch %33
//
//   %33 (loop, mustprogress):
//     %34 = phi i32 [%38 <- %33, %32 <- %31]      (current index)
//     %35 = zext to i64
//     %36 = &labeledImage[%34]
//     %37 = atomic_load labeledImage[%34]
//     %38 = %37 - 1                              (next index candidate)
//     %39 = (%38 == %34)                         (label == index+1 => root)
//     branch %39 -> %40 else %33 (loop, !llvm.loop.mustprogress)
//
//     Loop invariant: %34 walks the parent-index chain, %38 is
//     `labeledImage[%34] - 1`. Termination: when %38 == %34, meaning
//     the cell at %34 holds label %34+1, i.e. it is a self-labelled
//     root.
//
//   %40 (root found; phi from %25 (short-circuit) and %33 (loop exit)):
//     %41 = phi i64 [%27 <- %25, %35 <- %33]     (root INDEX, i64)
//     %42 = phi i32 [%26 <- %25, %34 <- %33]     (root INDEX, i32; ==%41)
//     %43 = root_index + 1                        (root LABEL, 1-based)
//     atomic_store labeledImage[flatIdx] = rootLabel
//                                                 (path compression: the
//                                                  original pixel now
//                                                  points directly to
//                                                  the root)
//     %44 = &componentCount[rootIndex]
//     %45 = atomic_add componentCount[rootIndex] += 1
//     %46 = &centroidX[rootIndex]
//     %47 = atomic_add centroidX[rootIndex] += gid.x
//     %48 = uitofp(rootLabel)   -- unsigned convert to fp32
//     %49 = <poison, poison, poison, 1.0> insert lane 0 = %48
//     %50 = insert lane 1 = %48
//     %51 = insert lane 2 = %48
//     write_texture(labeledTexture, gid, (label, label, label, 1.0),
//                    lod=0, mask=3)
//     branch %52
//
//   %52 (return): void.

/**
 * gid input for `compressKernel` — the AIR `air.thread_position_in_grid`
 * value with `<2 x i32>` element type. The two lanes are gid.x and
 * gid.y in Metal thread-position order.
 *
 * These are treated as UNSIGNED at the ICMP sites (`icmp ugt`) — the
 * transcription applies `>>> 0` before comparisons.
 */
export interface CompressKernelGid {
  x: number; // gid.x (uint)
  y: number; // gid.y (uint)
}

/**
 * Buffer bundle for a single-threaded serial replay of `compressKernel`.
 *
 * All Uint32Arrays are treated as if they were device-scoped atomic
 * uint32 arrays — the relaxed order/device-scope atomics collapse to
 * plain reads/writes on a serial CPU harness because no other thread
 * observes the intermediate state within a single call.
 *
 * `labeledTexture` is modelled as a float32 array laid out as
 * `[R, G, B, A, R, G, B, A, ...]` in row-major order — texture2d
 * writes populate one 4-float texel per call.
 */
export interface CompressKernelBuffers {
  /** flat row-major width*height uint labels; 0 = background. */
  labeledImage: Uint32Array;
  width: number;   // buffer 1 (constant)
  height: number;  // buffer 2 (constant)
  /** flat width*height counter per root-index. */
  componentCount: Uint32Array;
  /** flat width*height accumulator of x-coordinates per root-index. */
  centroidX: Uint32Array;
  /** float32 texture data, 4 floats per texel, row-major. */
  labeledTexture: Float32Array;
}

/**
 * Compute kernel `compressKernel` — one thread per pixel.
 *
 * Union-find PATH COMPRESSION over a flat 1-based label buffer. For
 * each in-bounds pixel:
 *   • if `labeledImage[flatIdx] == 0` → write background (0,0,0,1) to
 *     the output texture and stop.
 *   • else walk the parent chain (index = label-1) until we reach a
 *     self-labelled root, write that root label back into
 *     `labeledImage[flatIdx]` (compressing the path), increment
 *     `componentCount[root]`, add `gid.x` into `centroidX[root]`, and
 *     write the root label into all three RGB channels of the
 *     texture (alpha = 1).
 *
 * Pixels with gid outside [0..width-1] × [0..height-1] are a no-op —
 * the shader touches no buffers and no texture at all.
 *
 * @shader compressKernel (VAML)
 */
export function compressKernel(
  bufs: CompressKernelBuffers,
  gid: CompressKernelGid,
): void {
  // %8 = extractelement gid, 0.
  const gx = gid.x >>> 0;
  // %9 = load width.
  const width = bufs.width >>> 0;
  // %10 = width - 1 ; %11 = gx >ᵤ (width - 1).
  // Equivalent to gx >= width (unsigned). Early-out at %52.
  if (gx > (width - 1) >>> 0) {
    return;
  }

  // %13 = gid.y ; %14 = load height ; %15..%16 : gy >ᵤ (height - 1).
  const gy = gid.y >>> 0;
  const height = bufs.height >>> 0;
  if (gy > (height - 1) >>> 0) {
    return;
  }

  // %17 : in-bounds.
  // %18 = width * gid.y   (row-major offset) — the IR mul is
  // `mul i32 %9, %13` which is `width * gy` per the SSA graph.
  const rowOffset = Math.imul(width, gy) >>> 0;
  // %19 = row_offset + gx (flat index).
  const flatIdx = (rowOffset + gx) >>> 0;

  // %22 = atomic_load labeledImage[flatIdx].
  const label = bufs.labeledImage[flatIdx] >>> 0;

  // %23 = (label == 0) → background branch.
  if (label === 0) {
    // %24 : write (0, 0, 0, 1) at gid, lod=0, mask=3.
    const t = (Math.imul(width, gy) + gx) * 4;
    bufs.labeledTexture[t + 0] = 0.0;
    bufs.labeledTexture[t + 1] = 0.0;
    bufs.labeledTexture[t + 2] = 0.0;
    bufs.labeledTexture[t + 3] = 1.0;
    return;
  }

  // %25 : has a label. Union-find walk.
  // %26 = label - 1  (parent index; label is 1-based).
  let parentIdx = (label - 1) >>> 0;
  // %29 = atomic_load labeledImage[parentIdx].
  const parentLabel = bufs.labeledImage[parentIdx] >>> 0;
  // %30 = (parentLabel == label) → already a root; short-circuit.
  let rootIdx: number;
  if (parentLabel === label) {
    // %40 phi arm from %25 : rootIdx = %26 = label - 1.
    rootIdx = parentIdx;
  } else {
    // %31 : %32 = parentLabel - 1 ; enter loop.
    let cur = (parentLabel - 1) >>> 0;
    // %33 loop: read labeledImage[cur], nextIdx = value - 1, exit when
    // nextIdx == cur (self-labelled root).
    // Loop marked `mustprogress` in IR (!43). The transcription mirrors
    // the exact PHI: `cur` is the loop-carried variable equivalent to
    // %34; the exit test uses the *next* candidate (%38) against %34.
    for (;;) {
      const nextLabel = bufs.labeledImage[cur] >>> 0;
      const nextIdx = (nextLabel - 1) >>> 0;
      if (nextIdx === cur) {
        // %39 true → branch to %40 with %41 = zext(cur), %42 = cur.
        rootIdx = cur;
        break;
      }
      cur = nextIdx;
    }
  }

  // %43 = rootIdx + 1 (root LABEL, 1-based).
  const rootLabel = (rootIdx + 1) >>> 0;

  // atomic_store labeledImage[flatIdx] = rootLabel  (path compression).
  bufs.labeledImage[flatIdx] = rootLabel;

  // %45 : atomic_add componentCount[rootIdx] += 1.
  // (Uint32Array wraparound at 2^32 matches i32 atomic add semantics
  // for the "value component" — the IR emits `air.atomic.global.add.u.i32`
  // which is modular over 2^32.)
  bufs.componentCount[rootIdx] = (bufs.componentCount[rootIdx] + 1) >>> 0;
  // %47 : atomic_add centroidX[rootIdx] += gid.x.
  bufs.centroidX[rootIdx] = (bufs.centroidX[rootIdx] + gx) >>> 0;

  // %48 : uitofp(rootLabel) — unsigned i32 → f32. `air.convert.f.f32.u.i32`
  // is UNSIGNED, so `>>> 0` before Math.fround.
  const labelF = Math.fround(rootLabel >>> 0);

  // %49..%51 : build <labelF, labelF, labelF, 1.0> ; write at gid.
  const t = (Math.imul(width, gy) + gx) * 4;
  bufs.labeledTexture[t + 0] = labelF;
  bufs.labeledTexture[t + 1] = labelF;
  bufs.labeledTexture[t + 2] = labelF;
  bufs.labeledTexture[t + 3] = 1.0;

  // %52 : ret void.
}
