// bm3dnr_buf_blend8x8Row.ts
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Row (HeliumSenso)
// Faithful direct TS mapping of the Metal compute kernel decompiled at
//   raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8Row.ll   (see @0x0000000000f85d)
//
// The kernel performs an in-place accumulation of 8 consecutive vec4 pairs
// (a "row" of 8 elements, each element being a vec4 == 2 lanes since indexing
// increments by 2) into an inOut buffer from a source inNum buffer, all in
// fp32. It is one horizontal step of a Block-Matching 3D Noise Reduction
// (BM3D) accumulation stage over an 8x8 block: for a single (grid.x, grid.y)
// thread, it walks 8 rows (i = 0..7) and adds the corresponding two vec4s
// from inNum into the same two vec4s of inOut.
//
// Kernel signature (recovered from !14/!17/!19/!20/!21):
//   params            : constant buffer of struct { i32 m_strideInOut,
//                                                   i32 m_strideIn,
//                                                   i32 m_stepInc,
//                                                   uint m_globalWidth,
//                                                   uint m_globalHeight }
//   grid_in           : uint2 — thread_position_in_grid
//   inOut             : device float4* (read_write)
//   inNum             : device float4* (read)
//
// Struct field mapping per metadata !18:
//   idx 0 -> offset  0 : m_strideInOut  (i32)
//   idx 1 -> offset  4 : m_strideIn     (i32)
//   idx 2 -> offset  8 : m_stepInc      (i32)   — unused by this kernel body
//   idx 3 -> offset 12 : m_globalWidth  (u32)
//   idx 4 -> offset 16 : m_globalHeight (u32)
//
// Control flow:
//   %5  = grid.x
//   %7  = params.m_globalWidth
//   %8  = %5 < %7      -- unsigned bounds check
//   if !%8: ret        (%80)
//   %10 = grid.y
//   %12 = params.m_globalHeight
//   %13 = %10 < %12    -- unsigned bounds check
//   if !%13: ret       (%80)
//   %16 = m_strideInOut
//   %18 = m_strideIn
//   %20 = m_stepInc         ; loaded but never used past this point in this kernel
//   %21 = zext grid.x -> i64
//   %22 = zext grid.y -> i64
//   %23 = sext %20 -> i64   ; note: signed-extended stepInc; only feeds %24 as a
//                            ; NON-USED intermediate — the actual per-iteration
//                            ; base is `%24 = %23 * %22`; wait — check below.
//   %24 = %23 * %22    -- base row offset = stepInc_i64 * grid.y_i64
//   %25 = grid.x_i64 << 1
//   %26 = grid.y_i64 << 3          -- grid.y * 8  (the "8" of "8x8" row block)
//   %27 = sext %16 -> i64          -- strideInOut as i64
//   %28 = sext %18 -> i64          -- strideIn    as i64
//   %29 = (%16 == 1)
//   if %29: goto %53 (fast path when strideInOut == 1)
//   else:   goto %30 (general strideInOut path)
//
//   %30: i = 0..7 loop, on each iter:
//     %31 = i as i32; %32 = zext i to i64
//     %33 = %24 + %32                        -- inOut row idx
//     %34 = %33 * strideInOut_i64
//     %35 = %34 + grid.x*2
//     %36 = &inOut[%35]
//     %37 = load float4 at %36               -- inOut[row, col0]
//     %38 = (grid.y*8) + i                   -- inNum row idx
//     %39 = %38 * strideIn_i64
//     %40 = %39 + grid.x*2
//     %41 = &inNum[%40]
//     %42 = load float4 at %41               -- inNum[row, col0]
//     %43 = %35 + 1                          -- inOut col1
//     %44 = &inOut[%43]
//     %45 = load float4 at %44
//     %46 = %40 + 1                          -- inNum col1
//     %47 = &inNum[%46]
//     %48 = load float4 at %47
//     %49 = %37 + %42                        -- vec4 fadd (col0)
//     %50 = %45 + %48                        -- vec4 fadd (col1)
//     store %49 -> inOut[%35]
//     store %50 -> inOut[%43]
//     %51 = i + 1; if %51 == 8: goto %80 else loop.
//
//   %53: strideInOut == 1 fast path — the inOut base pointer address
//        does not change with row index once strideInOut==1, because
//        `row_i * 1 == row_i`; the compiler hoists a first vec4 load out
//        of the loop and rewrites the recurrence:
//     %54 = %24 + grid.x*2
//     %55 = &inOut[%54]
//     %56 = load float4                       -- initial inOut vec4
//     goto %57
//     %57 loop (i = 0..7):
//       %58 = phi (%56 first iter, %77 next iter)     -- carried accumulator
//                                                       for inOut col1 across
//                                                       iterations (compiler
//                                                       recurrence — see note
//                                                       below)
//       %59 = i as i32
//       %60 = zext i to i64
//       %61 = %24 + %60
//       %62 = %61 * strideInOut_i64   (== %61 since strideInOut == 1)
//       %63 = %62 + grid.x*2
//       %64 = &inOut[%63]
//       %65 = (grid.y*8) + i
//       %66 = %65 * strideIn_i64
//       %67 = %66 + grid.x*2
//       %68 = &inNum[%67]
//       %69 = load float4 -> inNum[row, col0]
//       %70 = %63 + 1
//       %71 = &inOut[%70]
//       %72 = load float4 -> inOut[row, col1]
//       %73 = %67 + 1
//       %74 = &inNum[%73]
//       %75 = load float4 -> inNum[row, col1]
//       %76 = %58 + %69      -- vec4 fadd (col0) using the PHI-carried value
//       %77 = %72 + %75      -- vec4 fadd (col1)
//       store %76 -> inOut[%63]
//       store %77 -> inOut[%71]
//       %78 = i + 1
//       if %78 == 8: goto %80 else loop.
//
//   NOTE ON THE %53 FAST-PATH PHI:
//   The IR carries `%58` as a PHI seeded from %56 (the first inOut[col0] load)
//   with a self-recurrence to %77 (the col1 fadd result). This is the compiler
//   exploiting `strideInOut == 1` — under that condition, the `col1` slot of
//   iteration i and the `col0` slot of iteration i+1 alias the SAME cell
//   (because `%70 = %63+1` and next iter's `%63 = %24 + (i+1)` which equals
//   `(%24 + i) + 1 == %70`). So instead of re-loading inOut[col0] on every
//   iteration, the compiler carries the previous iteration's col1 result
//   (`%77`) forward and uses it as this iteration's col0 accumulator. We
//   mirror that recurrence verbatim so the observable stores are bit-identical
//   to the Metal kernel — no other lowering matches the IR's PHI+alias.
//
// All fadd operations are vec4 f32 without fast-math flags on this shader
// (the module has "air.compile.fast_math_disable"). We use plain JS float
// arithmetic per-lane with a Math.fround narrowing on each intermediate to
// keep every scalar in fp32.

/**
 * Compute-kernel parameters (constant buffer struct). Field names match the
 * `air.struct_type_info` metadata !18. Only 4 fields are actually read by this
 * kernel body (m_stepInc is loaded @%20 but then unused after the `sext`).
 */
export interface Bm3dnrBufBlend8x8RowParams {
  /** @+0  m_strideInOut (i32) — row pitch (in vec4 elements) of the inOut buffer. */
  m_strideInOut: number;
  /** @+4  m_strideIn (i32) — row pitch (in vec4 elements) of the inNum buffer. */
  m_strideIn: number;
  /** @+8  m_stepInc (i32) — loaded @%20; not consumed further by this kernel. */
  m_stepInc: number;
  /** @+12 m_globalWidth (u32) — grid.x upper bound (exclusive). */
  m_globalWidth: number;
  /** @+16 m_globalHeight (u32) — grid.y upper bound (exclusive). */
  m_globalHeight: number;
}

/**
 * A device float4* buffer. Represented as a Float32Array laid out as
 * [x0,y0,z0,w0, x1,y1,z1,w1, ...] with element index `e` mapping to base
 * `e*4`. This mirrors Metal's `device float4*` where indexing steps by one
 * 16-byte vec4 per unit.
 */
export type Float4Buffer = Float32Array;

/**
 * Fp32-narrowed vec4 add: (a + b) with each lane cast through Math.fround.
 * Reads 4 lanes from `srcA` starting at `aBase` and 4 from `srcB` starting at
 * `bBase`, and writes the sum into `dst[dstBase..dstBase+4)`.
 * Mirrors an AIR `fadd <4 x float>` on 4 lanes, no fast-math (matches
 * `air.compile.fast_math_disable` on this module).
 */
function fadd4(
  srcA: Float4Buffer,
  aBase: number,
  srcB: Float4Buffer,
  bBase: number,
  dst: Float4Buffer,
  dstBase: number,
): void {
  // 4 lanes, each cast to float32 after the JS number add (per-lane fadd).
  // %49/%50/%76/%77 in the IR — direct scalar unroll of the vec4 op.
  dst[dstBase + 0] = Math.fround(srcA[aBase + 0] + srcB[bBase + 0]);
  dst[dstBase + 1] = Math.fround(srcA[aBase + 1] + srcB[bBase + 1]);
  dst[dstBase + 2] = Math.fround(srcA[aBase + 2] + srcB[bBase + 2]);
  dst[dstBase + 3] = Math.fround(srcA[aBase + 3] + srcB[bBase + 3]);
}

/**
 * Read a vec4 (4 floats starting at `base*4`) into a fresh length-4 array.
 * Mirrors `%37 = load <4 x float>` in the IR.
 */
function loadVec4(buf: Float4Buffer, elemIndex: number): Float32Array {
  const off = elemIndex * 4;
  const v = new Float32Array(4);
  v[0] = buf[off + 0];
  v[1] = buf[off + 1];
  v[2] = buf[off + 2];
  v[3] = buf[off + 3];
  return v;
}

/**
 * Write a vec4 (4 floats starting at `base*4`).
 * Mirrors `store <4 x float>` in the IR.
 */
function storeVec4(buf: Float4Buffer, elemIndex: number, v: Float32Array): void {
  const off = elemIndex * 4;
  buf[off + 0] = v[0];
  buf[off + 1] = v[1];
  buf[off + 2] = v[2];
  buf[off + 3] = v[3];
}

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8Row — one thread invocation.
 *
 * Bounds-checks (grid.x, grid.y) against (globalWidth, globalHeight). On a
 * pass, walks 8 rows and adds inNum[row, col*2..col*2+1] into
 * inOut[row, col*2..col*2+1] in-place. Two code paths in the IR:
 *   - general path (%30) when strideInOut != 1
 *   - fast path (%53/%57) when strideInOut == 1, using a PHI-carried
 *     accumulator across successive rows that alias the same cell.
 */
export function bm3dnr_buf_blend8x8Row(
  params: Bm3dnrBufBlend8x8RowParams,
  gridIn: readonly [number, number],
  inOut: Float4Buffer,
  inNum: Float4Buffer,
): void {
  // %5 = extractelement grid_in, 0
  const gridX = gridIn[0] | 0;
  // %7 = params.m_globalWidth (via GEP idx 3)
  const globalWidth = params.m_globalWidth >>> 0;
  // %8 = icmp ult gridX, globalWidth  ; %80 on false (early return)
  if (!((gridX >>> 0) < globalWidth)) {
    return;
  }
  // %10 = extractelement grid_in, 1
  const gridY = gridIn[1] | 0;
  // %12 = params.m_globalHeight (via GEP idx 4)
  const globalHeight = params.m_globalHeight >>> 0;
  // %13 = icmp ult gridY, globalHeight
  if (!((gridY >>> 0) < globalHeight)) {
    return;
  }

  // %16 = params.m_strideInOut (GEP idx 0)
  const strideInOut = params.m_strideInOut | 0;
  // %18 = params.m_strideIn (GEP idx 1)
  const strideIn = params.m_strideIn | 0;
  // %20 = params.m_stepInc (GEP idx 2)  — loaded but not used past %23.
  const stepInc = params.m_stepInc | 0;

  // %21 = zext gridX -> i64  ;  %22 = zext gridY -> i64
  // %23 = sext stepInc -> i64
  // %24 = stepInc_i64 * gridY_i64
  // We keep these as plain JS numbers. All indices this kernel produces fit
  // well within 2^53; buffers big enough to overflow that are not addressable
  // by a Metal device buffer anyway. Widths (strideInOut, strideIn, stepInc)
  // are signed-extended in the IR; JS mul preserves sign for the ranges the
  // kernel is invoked with.
  const rowBase = stepInc * gridY;
  // %25 = gridX << 1  — the "col0" offset within a row (col1 is +1).
  const colBase = gridX * 2;
  // %26 = gridY << 3  — inNum row group base = gridY * 8.
  const inNumRowGroup = gridY * 8;
  // %27 = strideInOut as i64  ;  %28 = strideIn as i64  (already ints in JS)
  // %29 = strideInOut == 1  — pick fast path when true.
  if (strideInOut === 1) {
    // ---- %53 fast path ----
    // %54 = rowBase + colBase
    // %55 = &inOut[%54]
    // %56 = load float4  — seeds the PHI %58.
    const seedIdx = rowBase + colBase;
    // Cast lanes to fp32 explicitly on load (Float32Array is already fp32,
    // but the intermediate JS number path is fp64; we cache into a fp32 view).
    let phiAcc = loadVec4(inOut, seedIdx);

    // %57 loop over i = 0..7.
    for (let i = 0; i < 8; i = (i + 1) | 0) {
      // %60 = zext i -> i64
      // %61 = rowBase + i
      // %62 = %61 * strideInOut_i64  ; == %61 since strideInOut == 1
      // %63 = %62 + colBase
      const inOutCol0 = rowBase + i + colBase; // strideInOut == 1 folded in
      // %64 = &inOut[%63]  (only used for the col0 store below)
      // %65 = inNumRowGroup + i
      // %66 = %65 * strideIn_i64
      // %67 = %66 + colBase
      const inNumCol0 = (inNumRowGroup + i) * strideIn + colBase;
      // %69 = load float4 -> inNum[col0]
      const inNumV0 = loadVec4(inNum, inNumCol0);
      // %70 = %63 + 1
      const inOutCol1 = inOutCol0 + 1;
      // %72 = load float4 -> inOut[col1]
      const inOutV1 = loadVec4(inOut, inOutCol1);
      // %73 = %67 + 1
      const inNumCol1 = inNumCol0 + 1;
      // %75 = load float4 -> inNum[col1]
      const inNumV1 = loadVec4(inNum, inNumCol1);
      // %76 = %58 + %69   ; PHI-carried col0 accumulator + inNum col0
      const outV0 = new Float32Array(4);
      outV0[0] = Math.fround(phiAcc[0] + inNumV0[0]);
      outV0[1] = Math.fround(phiAcc[1] + inNumV0[1]);
      outV0[2] = Math.fround(phiAcc[2] + inNumV0[2]);
      outV0[3] = Math.fround(phiAcc[3] + inNumV0[3]);
      // %77 = %72 + %75   ; inOut col1 + inNum col1  -> also feeds next PHI
      const outV1 = new Float32Array(4);
      outV1[0] = Math.fround(inOutV1[0] + inNumV1[0]);
      outV1[1] = Math.fround(inOutV1[1] + inNumV1[1]);
      outV1[2] = Math.fround(inOutV1[2] + inNumV1[2]);
      outV1[3] = Math.fround(inOutV1[3] + inNumV1[3]);
      // store %76 -> inOut[%63]
      storeVec4(inOut, inOutCol0, outV0);
      // store %77 -> inOut[%71]  (inOutCol1)
      storeVec4(inOut, inOutCol1, outV1);
      // %58 next-iter <- %77
      phiAcc = outV1;
      // %78/%79 loop termination on i == 8 handled by the for-loop bound.
    }
    // fallthrough to %80 (ret).
    // Reference the throwaway load to keep the symbol observably read.
    // (It's already been consumed; no further work.)
    // stepInc is loaded but not consumed by the kernel body — retained for
    // parity with %20 in the IR.
    void stepInc;
    return;
  }

  // ---- %30 general path (strideInOut != 1) ----
  for (let i = 0; i < 8; i = (i + 1) | 0) {
    // %32 = zext i -> i64
    // %33 = rowBase + i
    // %34 = %33 * strideInOut_i64
    // %35 = %34 + colBase
    const inOutCol0 = (rowBase + i) * strideInOut + colBase;
    // %38 = inNumRowGroup + i
    // %39 = %38 * strideIn_i64
    // %40 = %39 + colBase
    const inNumCol0 = (inNumRowGroup + i) * strideIn + colBase;
    // %37 = load float4 -> inOut[col0]
    const inOutV0 = loadVec4(inOut, inOutCol0);
    // %42 = load float4 -> inNum[col0]
    const inNumV0 = loadVec4(inNum, inNumCol0);
    // %43 = %35 + 1  ;  %45 = load float4 -> inOut[col1]
    const inOutCol1 = inOutCol0 + 1;
    const inOutV1 = loadVec4(inOut, inOutCol1);
    // %46 = %40 + 1  ;  %48 = load float4 -> inNum[col1]
    const inNumCol1 = inNumCol0 + 1;
    const inNumV1 = loadVec4(inNum, inNumCol1);
    // %49 = %37 + %42   (vec4 fadd, col0)
    const outV0 = new Float32Array(4);
    fadd4(inOutV0, 0, inNumV0, 0, outV0, 0);
    // %50 = %45 + %48   (vec4 fadd, col1)
    const outV1 = new Float32Array(4);
    fadd4(inOutV1, 0, inNumV1, 0, outV1, 0);
    // store %49 -> inOut[%35]
    storeVec4(inOut, inOutCol0, outV0);
    // store %50 -> inOut[%44]
    storeVec4(inOut, inOutCol1, outV1);
    // %51/%52 loop termination on i == 8 handled by the for-loop bound.
  }
  // fallthrough to %80 (ret).
  // Reference stepInc so the load @%20 is not eliminated in the port.
  void stepInc;
}
