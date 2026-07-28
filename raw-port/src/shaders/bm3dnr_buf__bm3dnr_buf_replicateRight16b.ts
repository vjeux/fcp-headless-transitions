// @shader bm3dnr_buf::bm3dnr_buf_replicateRight16b (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_replicateRight16b.ll
//   (see .ll header @0x6bd7d)
//
// SIGNATURE (from !14 / !17..!20 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_replicateRight16b"(
//     %params*   addrspace(2) %0,   // constant buffer (see !18)
//     <2 x i32>               %1,   // grid_in (thread pos in grid)
//     <4 x i16>* addrspace(1) %2    // buffer (device R/W, ushort4)
//   )
// PARAMS struct (from !18 — 16 bytes / 4 int32 fields):
//   { i32 m_width,          // +0   (int; last valid column index is m_width-1)
//     i32 m_stride,         // +4   (int; row stride in ushort4 units)
//     u32 m_globalWidth,    // +8   (uint; grid bound on x)
//     u32 m_globalHeight    // +12  (uint; grid bound on y) }
//
// FAST-MATH: this kernel is INTEGER-only. Both denorms and fast-math are
// disabled (!11, !12) but no fp32 ops exist here — no Math.fround needed.
//
// SHAPE:
//   For each (x = grid_in.x, y = grid_in.y) inside the [m_globalWidth x
//   m_globalHeight] grid — but the x-loop-index is IGNORED past the bounds
//   check — the kernel:
//     1. Loads ONE ushort4 from
//          rightmost = buffer[y * m_stride + m_width - 1]                    (%25)
//     2. Broadcasts LANE 3 to all four lanes:
//          fill = { rightmost[3], rightmost[3], rightmost[3], rightmost[3] } (%26)
//        Rationale: the last valid ushort4 covers columns [m_width-4 ..
//        m_width-1); its highest-column sample lives in lane 3 (`.w`).
//        Replicating that scalar across all four lanes yields the "right
//        edge" pixel value we need to smear rightward.
//     3. Iterates i = 0..(m_stride - m_width - 1) — bailing early if the
//        difference is <= 0 — and stores that same broadcast vector to
//          buffer[y * m_stride + m_width + i]
//     This "replicates the last-valid column rightward" so any downstream
//     kernel that walks columns 0..m_stride-1 sees a valid pixel in every
//     slot even when the underlying content is only m_width columns wide.
//     The kernel is entirely a copy operation — there is no arithmetic on
//     the pixel value itself.
//
//   x-arg NOTE: grid_in.x participates ONLY in the bounds test at %7. Once
//   the thread is admitted, all four lanes of a single ushort4 are written
//   per row-loop step (the loop is over i, not over x). The x-launch shape
//   thus subsumes ALL work for a given y at x==0, and threads with x>0 do
//   redundant identical work. This is a native-side scheduling artifact,
//   preserved bit-exactly here.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12 into the 16-byte struct.
 * @shader bm3dnr_buf::bm3dnr_buf_replicateRight16b — !18 in the .ll.
 */
export interface Bm3dnrBufReplicateRight16bParams {
  // +0  — int32 last valid column count (%15 in IR)
  m_width: number;
  // +4  — int32 buffer row stride in ushort4 units (%17 in IR)
  m_stride: number;
  // +8  — uint32 grid domain width  (%6 in IR)
  m_globalWidth: number;
  // +12 — uint32 grid domain height (%11 in IR)
  m_globalHeight: number;
}

// ushort4 pixel: length-4 tuple of 0..65535 uint16 lanes.
export type UShort4 = [number, number, number, number];

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params  constant buffer (%0)
 * @param gridX   grid_in.x  (extractelement %1, 0)   — %4
 * @param gridY   grid_in.y  (extractelement %1, 1)   — %9
 * @param buffer  device R/W ushort4 buffer            — %2
 */
export function bm3dnr_buf_replicateRight16b(
  params: Bm3dnrBufReplicateRight16bParams,
  gridX: number,
  gridY: number,
  buffer: UShort4[],
): void {
  // %4..%7: if (grid_in.x >= m_globalWidth) return.
  //   %5 = gep params, i32 2   (m_globalWidth)
  //   %7 = icmp ult i32 %4, %6
  if (!(gridX >>> 0 < params.m_globalWidth >>> 0)) return;

  // %9..%12: if (grid_in.y >= m_globalHeight) return.
  //   %10 = gep params, i32 3   (m_globalHeight)
  //   %12 = icmp ult i32 %9, %11
  if (!(gridY >>> 0 < params.m_globalHeight >>> 0)) return;

  // %14..%17: load m_width (idx 0) and m_stride (idx 1) as signed i32.
  const width = params.m_width | 0;    // %15
  const stride = params.m_stride | 0;  // %17

  // %18 = zext grid_in.y to i64.
  // %19 = sext m_stride to i64.
  // %20 = m_stride * y                 -> row base
  // %21 = sext m_width to i64.
  // %22 = row base + m_width           -> one-past-last-valid index
  // %23 = %22 + (-1)                   -> last-valid index (col m_width-1)
  const rowBase = Math.imul(stride, gridY | 0) | 0;   // %20
  const rowEnd = (rowBase + width) | 0;               // %22
  const rightmostIdx = (rowEnd - 1) | 0;              // %23

  // %25 = load buffer[%23]              -> rightmost valid ushort4
  const rightmost = buffer[rightmostIdx];              // %25

  // %26 = shufflevector <4 x i16> %25, undef, <i32 3, i32 3, i32 3, i32 3>
  //   -> broadcast lane 3 (`.w`) to all four lanes.
  const w = rightmost[3];                              // lane 3 of %25
  const fill: UShort4 = [w, w, w, w];                  // %26

  // %27 = m_stride - m_width           (signed 32-bit sub)
  // %28 = icmp sgt %27, 0              (branch to loop only if >0)
  const countRight = (stride - width) | 0;             // %27
  if (!(countRight > 0)) return;                       // %28

  // Loop %29..%35:
  //   phi %30 = i (0 initially, %34 = i+1 next).
  //   %32 = %22 + i                     -> buffer index to store into
  //   store %26 to buffer[%32]
  //   %34 = i + 1
  //   %35 = i+1 == countRight ; if true, exit; else re-enter.
  for (let i = 0; i < countRight; i = (i + 1) | 0) {    // %30 / %34
    const dstIdx = (rowEnd + i) | 0;                    // %32
    // NOTE: we assign a fresh 4-tuple per store so callers relying on
    // reference-identity don't observe cross-store aliasing. The native
    // code writes 8 raw bytes; JS records the shape by-reference.
    buffer[dstIdx] = [w, w, w, w];                      // store %26
  }
  void fill; // documented value; the loop above writes fresh copies to avoid aliasing
}
