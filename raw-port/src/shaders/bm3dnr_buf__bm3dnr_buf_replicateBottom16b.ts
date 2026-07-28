// @shader bm3dnr_buf::bm3dnr_buf_replicateBottom16b (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_replicateBottom16b.ll
//   (see .ll header @0x69e2d)
//
// SIGNATURE (from !14 / !17..!20 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_replicateBottom16b"(
//     %params*   addrspace(2) %0,   // constant buffer (see !18)
//     <2 x i32>               %1,   // grid_in (thread pos in grid)
//     <4 x i16>* addrspace(1) %2    // buffer (device R/W, ushort4)
//   )
// PARAMS struct (from !18 — 20 bytes / 5 int32 fields):
//   { i32 m_stride,        // +0   (int; row stride in ushort4 units)
//     i32 m_height,        // +4   (int; source row count — last valid row is m_height-1)
//     i32 m_heightOut,     // +8   (int; total row count — writes fill up to this)
//     u32 m_globalWidth,   // +12  (uint; grid bound on x)
//     u32 m_globalHeight   // +16  (uint; grid bound on y) }
//
// FAST-MATH: this kernel is INTEGER-only. Both denorms and fast-math are
// disabled (!11, !12) but no fp32 ops exist here — no Math.fround needed.
//
// SHAPE:
//   For each (x = grid_in.x, y = grid_in.y) inside the [m_globalWidth x
//   m_globalHeight] grid, the kernel:
//     1. Loads ONE ushort4 vector from
//          bottomRow = buffer[(m_height - 1) * m_stride + x]                 (%26)
//     2. Iterates i = 0..(m_heightOut - m_height - 1) — bailing early if
//        the difference is <= 0 — and stores that same bottomRow vector to
//          buffer[(m_height + i) * m_stride + x]
//     This "replicates the last-valid row downwards" so any downstream
//     kernel that walks rows 0..m_heightOut-1 sees a valid pixel in every
//     slot even when the underlying content is only m_height rows tall.
//     The kernel is entirely a copy operation — there is no arithmetic on
//     the pixel value itself.

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16 into the 20-byte struct.
 * @shader bm3dnr_buf::bm3dnr_buf_replicateBottom16b — !18 in the .ll.
 */
export interface Bm3dnrBufReplicateBottom16bParams {
  // +0  — int32 buffer row stride (%15 in IR)
  m_stride: number;
  // +4  — int32 source row count (last valid row is m_height-1) (%17 in IR)
  m_height: number;
  // +8  — int32 total row count for the output (%19 in IR)
  m_heightOut: number;
  // +12 — uint32 grid domain width  (%6 in IR)
  m_globalWidth: number;
  // +16 — uint32 grid domain height (%11 in IR)
  m_globalHeight: number;
}

// ushort4 pixel: length-4 tuple of 0..65535 uint16 lanes.
export type UShort4 = [number, number, number, number];

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params  constant buffer (%0)
 * @param gridX   grid_in.x  (extractelement %1, 0)          — %4
 * @param gridY   grid_in.y  (extractelement %1, 1)          — %9
 * @param buffer  read-write ushort4 buffer                  — %2
 */
export function bm3dnr_buf_replicateBottom16b(
  params: Bm3dnrBufReplicateBottom16bParams,
  gridX: number,
  gridY: number,
  buffer: UShort4[],
): void {
  // %4..%7: if (grid_in.x >= m_globalWidth) return.
  //   %4 = extractelement <2 x i32> %1, i64 0
  //   %5 = gep params, i32 3         (m_globalWidth)
  //   %6 = load i32
  //   %7 = icmp ult i32 %4, %6
  //   br i1 %7, label %8, label %38
  if (!((gridX >>> 0) < (params.m_globalWidth >>> 0))) return;

  // %9..%12: if (grid_in.y >= m_globalHeight) return.
  //   %9  = extractelement <2 x i32> %1, i64 1
  //   %10 = gep params, i32 4        (m_globalHeight)
  //   %11 = load i32
  //   %12 = icmp ult i32 %9, %11
  //   br i1 %12, label %13, label %38
  if (!((gridY >>> 0) < (params.m_globalHeight >>> 0))) return;
  // Note: %9 (gridY) is loaded and range-checked but never used past that
  // point — the kernel's real work is per-x. The gridY check gates dispatch
  // shape so we mirror it verbatim.
  void gridY;

  // %14..%19: load m_stride (%15), m_height (%17), m_heightOut (%19).
  const stride = params.m_stride | 0;    // %15
  const height = params.m_height | 0;    // %17
  const heightOut = params.m_heightOut | 0; // %19

  // %20 = zext gridX to i64
  // %21 = %17 + -1                              (m_height - 1)
  // %22 = %21 * %15                             ((m_height - 1) * m_stride)
  // %23 = sext %22 to i64
  // %24 = %23 + %20                             (bottomRow index)
  // %25 = gep buffer, i64 %24
  // %26 = load <4 x i16>                        (bottomRow value)
  const bottomRowY = (height - 1) | 0;                                    // %21
  const bottomIdx = (Math.imul(bottomRowY, stride) + (gridX | 0)) | 0;    // %24
  const bottomLoad = buffer[bottomIdx];                                   // %26
  // Snapshot the loaded value's four lanes so subsequent stores that
  // aliases buffer[bottomIdx] cannot mutate it mid-kernel (Metal reads
  // once and reuses the SSA %26 vector).
  const bottomRow: UShort4 = [
    (bottomLoad[0] & 0xffff) | 0,
    (bottomLoad[1] & 0xffff) | 0,
    (bottomLoad[2] & 0xffff) | 0,
    (bottomLoad[3] & 0xffff) | 0,
  ];

  // %27 = %19 - %17                             (m_heightOut - m_height)
  // %28 = icmp sgt i32 %27, 0
  // br i1 %28, label %29, label %38
  const extraRows = (heightOut - height) | 0;                             // %27
  if (!(extraRows > 0)) return;

  // ============================================================
  // Copy loop: for (i = 0; i < extraRows; i++) buffer[(m_height + i) * m_stride + x] = bottomRow
  // ============================================================
  //   %30 = phi i32 [%36, %29], [0, %13]        (loop counter, %30 in IR)
  //   %31 = %30 + %17                           ((m_height + i))
  //   %32 = %31 * %15                           (row * stride)
  //   %33 = sext %32 to i64
  //   %34 = %33 + %20                           (destination index)
  //   %35 = gep buffer, i64 %34
  //   store <4 x i16> %26, %35
  //   %36 = %30 + 1
  //   %37 = icmp eq %36, %27
  //   br i1 %37, label %38, label %29
  for (let i = 0; i < extraRows; i++) {
    const row = (i + height) | 0;                                         // %31
    const dstIdx = (Math.imul(row, stride) + (gridX | 0)) | 0;            // %34
    // Each write is a fresh ushort4 copy — the IR emits one <4 x i16>
    // store per iteration, and we don't want the destination slots to
    // share their backing array (aliasing would defeat the replication).
    buffer[dstIdx] = [
      bottomRow[0],
      bottomRow[1],
      bottomRow[2],
      bottomRow[3],
    ];
  }
}
