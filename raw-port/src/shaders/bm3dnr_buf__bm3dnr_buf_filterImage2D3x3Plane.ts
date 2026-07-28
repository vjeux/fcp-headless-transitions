// @shader bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane (HeliumSenso)
// Direct TS mapping of the AIR/LLVM IR compute kernel found in
// HeliumSenso.framework/.../default.metallib. Source IR:
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_filterImage2D3x3Plane.ll
//   (see .ll header @0x23d1d)
//
// SIGNATURE (from !14 / !17..!21 in the .ll):
//   define void @"bm3dnr_buf::bm3dnr_buf_filterImage2D3x3Plane"(
//     %params*   addrspace(2)  %0,   // constant buffer
//     <2 x i32>                 %1,   // grid_in (thread pos in grid)
//     <4 x i8>*  addrspace(1)  %2,   // input  (device RO, uchar4)
//     <4 x i8>*  addrspace(1)  %3    // output (device RW, uchar4)
//   )
// PARAMS struct (from !18) — note the metadata reuses the sibling
// bm3dnr_buf_blend4x4Column_params LLVM type, but the *field naming* in
// !18 is specific to this kernel:
//   { u32 m_strideIn,     // +0    (i32 field 0)
//     u32 m_strideOut,    // +4    (i32 field 1)
//     u32 m_width,        // +8    (i32 field 2)
//     u32 m_height,       // +12   (i32 field 3)
//     u32 m_globalWidth,  // +16   (i32 field 4)
//     u32 m_globalHeight  // +20   (i32 field 5) }
//
// FAST-MATH: kernel is compiled with `air.compile.fast_math_disable` (!12)
// and `air.compile.denorms_disable` (!11). All arithmetic here is INTEGER
// (i32/i8), no fp ops — nothing to fp32-narrow.
//
// SHAPE:
//   This is a 3x3-neighborhood integer read-and-reduce kernel over a
//   uchar4 image. For each (x=grid_in.x, y=grid_in.y) inside the
//   [m_globalWidth x m_globalHeight] domain, it loads the 9 uchar4
//   pixels of the 3x3 neighborhood (edge-clamped to [0, m_width-1] and
//   [0, m_height-1]), zero-extends them to i32 lanes, sums groups of
//   them, and writes one uchar4 back at `output[y*m_strideOut + x]`.
//   The exact reduction is transcribed lane-by-lane below and matches
//   the SSA in the .ll (not a straight per-lane mean).

/**
 * Params struct read from the constant buffer (!17/!18).
 * Field offsets are +0/+4/+8/+12/+16/+20 into the 24-byte struct.
 */
export interface Bm3dnrBufFilterImage2D3x3PlaneParams {
  m_strideIn: number;    // +0  — row stride of `input`  in uchar4 units
  m_strideOut: number;   // +4  — row stride of `output` in uchar4 units
  m_width: number;       // +8  — image width  (clamp upper bound for x)
  m_height: number;      // +12 — image height (clamp upper bound for y)
  m_globalWidth: number; // +16 — grid domain width  (early-out bound)
  m_globalHeight: number;// +20 — grid domain height (early-out bound)
}

// uchar4 is stored as a length-4 tuple of 0..255 bytes in the input/output
// buffers, packed in row-major order using the params' strides.
export type UChar4 = readonly [number, number, number, number];

/**
 * Bit-exact TypeScript transcription of the AIR kernel body.
 * The `%N` comments cite the SSA value numbers in the .ll.
 *
 * @param params  constant buffer (%0)
 * @param gridX   grid_in.x        (extractelement %1, 0)   — %5
 * @param gridY   grid_in.y        (extractelement %1, 1)   — %10
 * @param input   read-only uchar4 buffer                   — %2
 * @param output  write uchar4 buffer                       — %3
 */
export function bm3dnr_buf_filterImage2D3x3Plane(
  params: Bm3dnrBufFilterImage2D3x3PlaneParams,
  gridX: number,
  gridY: number,
  input: readonly UChar4[],
  output: UChar4[],
): void {
  // %6..%8: if (grid_in.x >= m_globalWidth) return.
  //   %6 = gep params, i32 4       (m_globalWidth)
  //   %7 = load i32                (via alias/tbaa scopes)
  //   %8 = icmp ult i32 %5, %7
  //   br i1 %8, label %9, label %120
  if (!(gridX >>> 0 < params.m_globalWidth >>> 0)) return;

  // %11..%13: if (grid_in.y >= m_globalHeight) return.
  //   %11 = gep params, i32 5      (m_globalHeight)
  //   %12 = load i32
  //   %13 = icmp ult i32 %10, %12
  //   br i1 %13, label %14, label %120
  if (!(gridY >>> 0 < params.m_globalHeight >>> 0)) return;

  // %15..%22: load the 4 stride/size fields.
  //   %16 = m_strideIn, %18 = m_strideOut, %20 = m_width, %22 = m_height
  const strideIn = params.m_strideIn | 0;
  const strideOut = params.m_strideOut | 0;
  const width = params.m_width | 0;
  const height = params.m_height | 0;

  // %23, %24: zext grid_in.x / grid_in.y to i64. In TS we keep them as
  // JS numbers (safe for image dimensions well below 2^32).
  const x = gridX >>> 0;
  const y = gridY >>> 0;

  // %25..%27: x_west = (x == 0) ? 0 : x - 1        (edge-clamp low X)
  //   %25 = icmp eq i32 %5, 0
  //   %26 = add i32 %5, -1
  //   %27 = select i1 %25, i32 0, i32 %26
  const xWest = x === 0 ? 0 : (x - 1) | 0;

  // %28..%30: y_north = (y == 0) ? 0 : y - 1       (edge-clamp low Y)
  //   %28 = icmp eq i32 %10, 0
  //   %29 = add i32 %10, -1
  //   %30 = select i1 %28, i32 0, i32 %29
  const yNorth = y === 0 ? 0 : (y - 1) | 0;

  // %31..%34: x_east = (x < m_width-1) ? x+1 : m_width-1
  //   %31 = add i32 %20, -1
  //   %32 = icmp ult i32 %5, %31
  //   %33 = add nuw i32 %5, 1
  //   %34 = select i1 %32, i32 %33, i32 %31
  const widthMinus1 = (width - 1) | 0;
  const xEast = (x >>> 0) < (widthMinus1 >>> 0) ? (x + 1) | 0 : widthMinus1;

  // %35..%38: y_south = (y < m_height-1) ? y+1 : m_height-1
  //   %35 = add i32 %22, -1
  //   %36 = icmp ult i32 %10, %35
  //   %37 = add nuw i32 %10, 1
  //   %38 = select i1 %36, i32 %37, i32 %35
  const heightMinus1 = (height - 1) | 0;
  const ySouth = (y >>> 0) < (heightMinus1 >>> 0) ? (y + 1) | 0 : heightMinus1;

  // Row-base offsets into `input`, indexed in uchar4 units.
  //   %39 = mul i32 %16, %30            (strideIn * y_north)  — north row base
  //   %45 = zext i32 %39 to i64
  //   %57 = mul nuw i64 %56, %24        (strideIn * y)        — center row base
  //   %71 = mul i32 %38, %16            (strideIn * y_south)  — south row base
  //   %77 = zext i32 %71 to i64
  const rowN = Math.imul(strideIn, yNorth) | 0;
  const rowC = Math.imul(strideIn, y) | 0;
  const rowS = Math.imul(strideIn, ySouth) | 0;

  // Load and zext-to-i32 the nine 3x3 neighbors.
  // Convention: variable name is <row><col> where row in {N,C,S}
  //             and col in {W,C,E}. Each value is a length-4 tuple
  //             of unsigned lanes (0..255 originally, i32 after zext).
  //
  //   %42 = gep input, i64 (rowN + x_west)     ; %44 = zext to <4 x i32>
  //   %47 = gep input, i64 (rowN + x)          ; %49 = zext to <4 x i32>
  //   %52 = gep input, i64 (rowN + x_east)     ; %54 = zext to <4 x i32>
  //   %59 = gep input, i64 (rowC + x_west)     ; %61 = zext to <4 x i32>
  //   %63 = gep input, i64 (rowC + x)          ; %65 = zext to <4 x i32>
  //   %68 = gep input, i64 (rowC + x_east)     ; %70 = zext to <4 x i32>
  //   %74 = gep input, i64 (rowS + x_west)     ; %76 = zext to <4 x i32>
  //   %79 = gep input, i64 (rowS + x)          ; %81 = zext to <4 x i32>
  //   %84 = gep input, i64 (rowS + x_east)     ; %86 = zext to <4 x i32>
  const NW = input[(rowN + xWest) | 0];
  const NC = input[(rowN + x) | 0];
  const NE = input[(rowN + xEast) | 0];
  const CW = input[(rowC + xWest) | 0];
  const CC = input[(rowC + x) | 0];
  const CE = input[(rowC + xEast) | 0];
  const SW = input[(rowS + xWest) | 0];
  const SC = input[(rowS + x) | 0];
  const SE = input[(rowS + xEast) | 0];

  // Column vector sums as <4 x i32>. The IR names these %88 / %90 / %92:
  //   %87 = add <4 x i32> %61, %44     ; CW + NW    (left col, partial)
  //   %88 = add <4 x i32> %87, %76     ; + SW       — LEFT column sum
  //   %89 = add <4 x i32> %65, %49     ; CC + NC    (mid col,  partial)
  //   %90 = add <4 x i32> %89, %81     ; + SC       — MIDDLE column sum
  //   %91 = add <4 x i32> %70, %54     ; CE + NE    (right col, partial)
  //   %92 = add <4 x i32> %91, %86     ; + SE       — RIGHT column sum
  const L0 = (CW[0] + NW[0] + SW[0]) | 0;
  const L1 = (CW[1] + NW[1] + SW[1]) | 0;
  const L2 = (CW[2] + NW[2] + SW[2]) | 0;
  const L3 = (CW[3] + NW[3] + SW[3]) | 0;

  const M0 = (CC[0] + NC[0] + SC[0]) | 0;
  const M1 = (CC[1] + NC[1] + SC[1]) | 0;
  const M2 = (CC[2] + NC[2] + SC[2]) | 0;
  const M3 = (CC[3] + NC[3] + SC[3]) | 0;

  const R0 = (CE[0] + NE[0] + SE[0]) | 0;
  // R1..R3 are computed by the IR (%92 vector add) but never read; keep
  // the SSA transcription faithful — subsequent code only uses %92[0].
  // (Values R1..R3 = CE[k]+NE[k]+SE[k], k in {1,2,3}, elided as dead.)

  // Final scalar reductions, per the IR's extractelement + add sequence:
  //   %93  = extractelement %88, 3          ; LEFT column, lane 3       (L3)
  //   %94  = extractelement %90, 0          ; MIDDLE column, lane 0     (M0)
  //   %95  = extractelement %90, 1          ; MIDDLE column, lane 1     (M1)
  //   %96  = add i32 %95, %94               ; M1 + M0
  //   %97  = add i32 %96, %93               ; (M1 + M0) + L3
  //   %98  = extractelement %90, 2          ; MIDDLE column, lane 2     (M2)
  //   %99  = add i32 %96, %98               ; (M1 + M0) + M2
  //   %100 = extractelement %90, 3          ; MIDDLE column, lane 3     (M3)
  //   %101 = add i32 %95, %98               ; M1 + M2
  //   %102 = add i32 %101, %100             ; (M1 + M2) + M3
  //   %103 = add i32 %98, %100              ; M2 + M3
  //   %104 = extractelement %92, 0          ; RIGHT column, lane 0      (R0)
  //   %105 = add i32 %103, %104             ; (M2 + M3) + R0
  const s96 = (M1 + M0) | 0;
  const s97 = (s96 + L3) | 0;             // %97
  const s99 = (s96 + M2) | 0;             // %99
  const s101 = (M1 + M2) | 0;
  const s102 = (s101 + M3) | 0;           // %102
  const s103 = (M2 + M3) | 0;
  const s105 = (s103 + R0) | 0;           // %105

  // %106..%109: unsigned divide each of the four scalar sums by 9.
  //   %106 = udiv i32 %97,  9
  //   %107 = udiv i32 %99,  9
  //   %108 = udiv i32 %102, 9
  //   %109 = udiv i32 %105, 9
  const d0 = ((s97 >>> 0) / 9) >>> 0;
  const d1 = ((s99 >>> 0) / 9) >>> 0;
  const d2 = ((s102 >>> 0) / 9) >>> 0;
  const d3 = ((s105 >>> 0) / 9) >>> 0;

  // %110..%113: pack into <4 x i32>.
  // %114: air.clamp.u.v4i32(%113, <0,0,0,0>, <255,255,255,255>).
  // %115: air.convert.u.v4i8.u.v4i32(%114) — narrow to <4 x i8>.
  const c0 = d0 > 255 ? 255 : d0 < 0 ? 0 : d0;
  const c1 = d1 > 255 ? 255 : d1 < 0 ? 0 : d1;
  const c2 = d2 > 255 ? 255 : d2 < 0 ? 0 : d2;
  const c3 = d3 > 255 ? 255 : d3 < 0 ? 0 : d3;

  // %116..%119: store %115 at output[y * m_strideOut + x].
  //   %116 = zext m_strideOut to i64
  //   %117 = mul  m_strideOut, y
  //   %118 = add  %117, x
  //   %119 = gep output, i64 %118
  //   store <4 x i8> %115, ...
  const outIdx = (Math.imul(strideOut, y) + x) | 0;
  output[outIdx] = [c0, c1, c2, c3];
}
