// Faithful transcription @0x00000000005a28 — @shader findLargestComponentKernel (VAML)
//
// Metallib offset from raw-port/re/shaders/findLargestComponentKernel.ll header
//   `0x00000000005a28 -- findLargestComponentKernel:` — the kernel's entry offset in
// VAML.framework/Versions/A/Resources/default.metallib.
//
// One-dimensional compute kernel: each thread owns one image column `gid`,
// walks the `height` rows of that column, and writes into `largestCC[gid]`
// the flat index (y * width + gid) of the row whose entry in the
// `components` buffer is largest for that column. The initial value of
// `largestCC[gid]` is used as a sentinel — a value of -1 means "no
// current best" and forces the first row to be written unconditionally.
//
// The kernel is per-column (parallelism == width). The launch grid is
// 1-D — `gid` is a single uint (see !22 `air.thread_position_in_grid`
// declared with arg_type_name "uint"). Out-of-range threads (gid >=
// width) return without writing anything.
//
// Provenance: LLVM AIR IR in raw-port/re/shaders/findLargestComponentKernel.ll,
// extracted via raw-port/tools/shader_disasm.sh from the metallib above.
// Compile options (from !air.compile_options / attribute set #0):
// `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`, `unsafe-fp-math=true`,
// `no-infs/nans/signed-zeros-fp-math=true`, `approx-func-fp-math=true`.
// The kernel does NO floating-point math — all buffers are `int`/`uint`
// and no fp-math relaxation applies to the port.
//
// Kernel argument metadata (from !air.kernel !15, arg descriptors !18..!22):
//   arg %0 = "largestCC"      (int addrspace(1)*,  read_write, location 0)
//   arg %1 = "components"     (uint addrspace(2)*, read,       location 1)
//   arg %2 = "width"          (uint addrspace(2)*, read,       location 2, size 4)
//   arg %3 = "height"         (uint addrspace(2)*, read,       location 3, size 4)
//   arg %4 = "gid"            (uint, air.thread_position_in_grid)
//
// Note the metadata types: `largestCC` is declared "int" and `components`,
// `width`, `height` are declared "uint". The IR reads `width` and `height`
// with `load i32`, but the *comparison* against `height` uses `icmp sgt %10, 0`
// — a SIGNED comparison. That means the loop actually treats `height` as a
// signed int for the "is it positive?" gate (a value of 0x8000_0000 read
// from a uint would be seen as negative and the loop would be skipped).
// The port preserves this exact typing: the height >0 gate is a SIGNED
// int32 comparison. The `width - 1 < gid` gate is unsigned (`icmp ult`).
//
// Line-by-line map from the .ll body:
//   %6  = load i32 width                                    -> W (as i32 bits)
//   %7  = add i32 %6, -1                                    -> W - 1  (wrap-modulo 2^32
//                                                              if W == 0)
//   %8  = icmp ult i32 %7, %4                               -> (W-1) < gid   [unsigned]
//   br %8, %36 (return), %9                                 -> out-of-range -> ret
//   %10 = load i32 height                                   -> H (as i32 bits)
//   %11 = icmp sgt i32 %10, 0                               -> H > 0         [SIGNED]
//   br %11, %12 (enter loop), %36 (return)                  -> H<=0 -> ret
//   %13 = zext i32 gid to i64
//   %14 = &largestCC[gid]                                   -> pointer to output slot
//   %15 = load i32 %14                                      -> initial best index B0
//                                                              (sentinel: -1 == "none")
//   ; loop preheader falls into %16
//   %16: loop header (predecessors: %12 first iter, %32 iters)
//     %17 = phi i32 [ %15 first, %33 later ]                -> currentBest B
//     %18 = phi i32 [ 0    first, %34 later ]               -> loop counter y
//     %19 = mul i32 %18, %6                                 -> y * W  (wraps in i32)
//     %20 = add i32 %19, %4                                 -> y*W + gid = flat idx K
//     %21 = icmp eq i32 %17, -1                             -> is B the -1 sentinel?
//     br %21, %22 (init store), %23 (compare)
//   %22: store i32 %20 into %14 ; branch %32 with new B = %20
//   %23:
//     %24 = sext i32 %20 to i64
//     %25 = &components[K]                                   ; SIGN-extended index
//     %26 = load i32 %25                                    -> components[K]
//     %27 = sext i32 %17 to i64
//     %28 = &components[B]                                   ; SIGN-extended index
//     %29 = load i32 %28                                    -> components[B]
//     %30 = icmp sgt i32 %26, %29                           -> components[K] > components[B]
//                                                              [SIGNED comparison]
//     br %30, %31 (store), %32
//   %31: store i32 %20 into %14 ; branch %32 with new B = %20
//   %32:
//     %33 = phi i32 [ %17 keep, %20 replace, %20 init ]     -> next currentBest
//     %34 = add nuw nsw i32 %18, 1                          -> y + 1
//     %35 = icmp eq i32 %34, %10                            -> reached height?
//     br %35, %36 (return), %16 (loop)
//   %36: ret void
//
// Notes on signed vs unsigned:
//   - `width` and `height` are declared "uint" in the metadata, but the
//     kernel body loads them as i32 and uses:
//       * `icmp ult` against gid for the width gate (unsigned)
//       * `icmp sgt` against 0 for the height gate (signed)
//       * `icmp sgt` for the components[] comparison (signed)
//       * `sext` (not zext) for the components[] index (signed)
//   - The `mul i32` and `add i32` for `y*W + gid` are integer wrap-modulo-
//     2^32; on real hardware they would overflow into negative i32 for
//     large images but AIR/LLVM define this as two's-complement wrap.
//   - The port evaluates everything as JS-safe 32-bit int arithmetic
//     using `|0` for signed and `>>>0` for unsigned coercions.

/**
 * Compact int32-buffer interface used by this kernel. Each buffer is a
 * flat i32 array; the kernel indexes with `sext` (signed) for
 * `components` and treats `largestCC` as a signed int slot.
 *
 * The AIR IR has `largestCC` in address space 1 (device / read_write)
 * and `components` / `width` / `height` in address space 2 (constant /
 * read). The port collapses this to a plain typed-array read for
 * `components` / `width` / `height` and a read+write for `largestCC`.
 */
export interface Int32Buffer {
  /** Read the i32 at index `i` (signed). */
  read(i: number): number;
  /** Write the i32 at index `i` (signed). */
  write(i: number, value: number): void;
}

/**
 * Kernel `findLargestComponentKernel` — for one image column `gid`, walk
 * every row and store into `largestCC[gid]` the flat index of the row
 * whose value in `components` is largest.
 *
 * @shader findLargestComponentKernel (VAML)
 *
 * @param largestCC   read-write i32 output buffer, one slot per column.
 *                    Slot `gid` on entry is either -1 (sentinel: "no
 *                    current best", used as the initial write) or a
 *                    previously-written flat index. On exit it holds
 *                    the flat index (y*width + gid) of the max-valued
 *                    row for column `gid`. Ignored (untouched) if
 *                    `gid >= width` or `height <= 0`.
 * @param components  read-only i32 buffer, length >= width*height,
 *                    laid out row-major (index = y*width + x).
 * @param width       image width (declared uint; read as i32 bits).
 *                    Out-of-range threads (gid >= width) return early.
 *                    The width gate is `(width - 1) <u gid`, using the
 *                    UNSIGNED comparison — for `width == 0` this reduces
 *                    to `0xFFFF_FFFF <u gid` which is false for all gid,
 *                    so the width gate does not filter when width is 0
 *                    (but see the height gate below).
 * @param height      image height (declared uint; read as i32 bits).
 *                    The gate is `height >s 0` — a SIGNED comparison —
 *                    so a value read whose i32 bit-pattern is negative
 *                    (i.e. >= 0x8000_0000 when viewed as uint) causes
 *                    the kernel to return without touching `largestCC`.
 * @param gid         thread position in the 1-D grid; the column index
 *                    this thread owns.
 */
export function findLargestComponentKernel(
  largestCC: Int32Buffer,
  components: Int32Buffer,
  width: number,
  height: number,
  gid: number,
): void {
  // Coerce inputs to their IR-observed bit widths. `width`/`height` are
  // loaded as i32 in the IR (i.e. `load i32`) despite metadata declaring
  // them "uint" — so we keep them as signed i32 for the SIGNED height
  // gate, and reinterpret to uint when needed for the UNSIGNED width
  // gate. `gid` is uint (thread_position_in_grid).
  const W_i32 = width | 0;
  const H_i32 = height | 0;
  const gidU = gid >>> 0;

  // %6 = load width ; %7 = %6 + (-1) ; %8 = icmp ult %7, gid ; br return
  //   -> unsigned:  (width - 1) < gid  ->  return.
  //   Note: `(W_i32 - 1)` in i32 wraps to 0xFFFF_FFFF when W_i32 == 0;
  //   coerce to unsigned via `>>> 0` for the ULT comparison to match.
  const WminusOneU = (W_i32 + -1) >>> 0;
  if (WminusOneU < gidU) {
    // %36: ret void
    return;
  }

  // %10 = load height ; %11 = icmp sgt %10, 0 ; br return if not >
  //   -> signed:  height > 0  ->  enter loop.
  if (!(H_i32 > 0)) {
    // %36: ret void
    return;
  }

  // %13 = zext gid to i64 ; %14 = &largestCC[gid]
  // %15 = load i32 %14  ->  initial current-best index (sentinel: -1)
  const outIdx = gidU; // zext preserves the unsigned bit pattern
  let currentBest = largestCC.read(outIdx) | 0;

  // Loop header %16: y from 0 up to height-1 inclusive.
  for (let y = 0; y < H_i32; y = (y + 1) | 0) {
    // %19 = mul i32 y, width   ; wrap-modulo 2^32
    // %20 = add i32 %19, gid   ; wrap-modulo 2^32 ; flat index K
    // Use Math.imul for exact i32 wrap-mul semantics.
    const K = (Math.imul(y, W_i32) + (gidU | 0)) | 0;

    // %21 = icmp eq %17, -1   ; sentinel check on current best
    if (currentBest === -1) {
      // %22: store i32 K into largestCC[gid] ; new currentBest = K
      largestCC.write(outIdx, K);
      currentBest = K;
    } else {
      // %24 = sext K to i64 ; %25 = &components[K] ; %26 = load
      // %27 = sext currentBest to i64 ; %28 = &components[currentBest]
      // %29 = load ; %30 = icmp sgt %26, %29  ; SIGNED comparison.
      // NB: `Int32Buffer.read(i)` here is passed a signed i32 index —
      // components[] is indexed by `sext i32 -> i64`, meaning if K or
      // currentBest were somehow negative the AIR IR would read from
      // a negative address (in practice K and currentBest are >= 0 for
      // any well-formed launch, but we preserve the SIGNED index pass-
      // through rather than masking to uint).
      const compK = components.read(K) | 0;
      const compB = components.read(currentBest) | 0;
      if (compK > compB) {
        // %31: store i32 K into largestCC[gid] ; new currentBest = K
        largestCC.write(outIdx, K);
        currentBest = K;
      }
      // else: %32 falls through with currentBest unchanged.
    }

    // %34 = add nuw nsw %18, 1 ; %35 = icmp eq %34, height
    // Loop back to %16 unless y+1 == height. The `add nuw nsw` allows
    // LLVM to assume no overflow, safe because height was already
    // checked >0 (signed) and the compiler emits the exit as `%34 ==
    // height`, so the loop always terminates in exactly `height`
    // iterations.
  }

  // %36: ret void
}
