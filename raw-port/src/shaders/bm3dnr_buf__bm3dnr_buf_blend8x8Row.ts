// bm3dnr_buf__bm3dnr_buf_blend8x8Row.ts — direct TS mapping of the Metal
// compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8Row` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Row (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blend8x8Row.ll
// (header line: `0x0000000000f85d -- bm3dnr_buf::bm3dnr_buf_blend8x8Row`)
//
// The row-blend step of BM3D denoise aggregation (non-Inc). Each thread
// `(gx, gy)` loops 8 rows deep, adding <4 x float> numerator values from
// `inNum` onto the existing `inOut` accumulator, two columns per row.
//
// The IR has TWO paths selected by `icmp eq i32 m_strideInOut, 1` (%29):
//   - path A (block %30): general case (strideInOut != 1) — 4 loads + 2 fadds
//     + 2 stores per iteration, no cross-iteration carry.
//   - path B (block %57):  the strideInOut == 1 fast path — the compiler
//     hoists the first-column inOut load out of the loop and phi-carries
//     the second-column value from the prior iteration into the next
//     iteration's first-column accumulator (because with strideInOut==1
//     the addresses coincide across the row/column boundary).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8Row(
//     %params*         %0,   // params struct (5 x i32, see below)
//     <2 x i32>        %1,   // thread_position_in_grid   (gx, gy)
//     <4 x float>*     %2,   // inOut     — accumulator (read+write)
//     <4 x float>*     %3    // inNum     — numerator input (read)
//   )
//
// Params struct layout (from !18 in the .ll):
//   i32  m_strideInOut  @0   → %16
//   i32  m_strideIn     @4   → %18
//   i32  m_stepInc      @8   → %20  (row-major output stride per-gy multiplier)
//   uint m_globalWidth  @12  → %7   (bound check on gx, %8)
//   uint m_globalHeight @16  → %12  (bound check on gy, %13)
//
// Semantics recovered from the AIR:
//   block %4 → %9 → %14 → (path A %30 or path B %53/%57) → %80 ret
//   if (gx >= globalWidth)  return;                              // %8  unsigned-lt
//   if (gy >= globalHeight) return;                              // %13 unsigned-lt
//
//   inOutRowBase = m_stepInc * gy                                — %24 = %23 * %22
//   inColBase    = gx << 1                                       — %25
//   inNumRowBase = gy << 3                                       — %26
//
//   Path A (m_strideInOut != 1, block %30, loop r = 0..7):
//     rIdx     = inOutRowBase + r                                — %33
//     inOutAdr = rIdx * m_strideInOut + inColBase                — %35
//     numIdx   = inNumRowBase + r                                — %38
//     inNumAdr = numIdx * m_strideIn + inColBase                 — %40
//     v0 = inOut[inOutAdr];  v1 = inOut[inOutAdr + 1]            — %37, %45
//     n0 = inNum[inNumAdr];  n1 = inNum[inNumAdr + 1]            — %42, %48
//     inOut[inOutAdr]     = v0 + n0                              — %49 store
//     inOut[inOutAdr + 1] = v1 + n1                              — %50 store
//
//   Path B (m_strideInOut == 1, blocks %53/%57, loop r = 0..7):
//     preload  v0_0 = inOut[inOutRowBase + inColBase]            — %56
//     Loop with phi carry = [%56 initial, second-column-sum from prior iter]:
//       rIdx     = inOutRowBase + r                              — %61
//       inOutAdr = rIdx * m_strideInOut + inColBase              — %63
//       numIdx   = inNumRowBase + r                              — %65
//       inNumAdr = numIdx * m_strideIn + inColBase               — %67
//       n0 = inNum[inNumAdr];  n1 = inNum[inNumAdr + 1]          — %69, %75
//       v1 = inOut[inOutAdr + 1]                                 — %72
//       sum0 = carry + n0                                        — %76 fadd
//       sum1 = v1 + n1                                           — %77 fadd
//       inOut[inOutAdr]     = sum0                               — store %76
//       inOut[inOutAdr + 1] = sum1                               — store %77
//       carry_next = sum1
//     (When strideInOut == 1, the next iteration's `inOut[inOutAdr]` at
//      row r+1 has the same physical address as this iteration's
//      `inOut[inOutAdr + 1]`, so the compiler forwards `sum1` into the
//      next iteration's `carry` and elides the redundant load. We
//      reproduce that exact forwarding here.)
//
// NOTE — fast_math_disable is set on this module (!12 in the .ll), so the
// fadds are strict fp32; the ports use plain JS floats + Math.fround.

/** RGBA float — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blend8x8Row_params` (!18). */
export interface Blend8x8RowParams {
  /** i32  m_strideInOut  — row stride into `inOut` (in `<4 x float>` units). */
  readonly strideInOut: number;
  /** i32  m_strideIn     — row stride into `inNum` (in `<4 x float>` units). */
  readonly strideIn: number;
  /** i32  m_stepInc      — output row-stride multiplier per gy. */
  readonly stepInc: number;
  /** uint m_globalWidth  — grid width  in output columns. */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid height in output rows. */
  readonly globalHeight: number;
}

/** fp32 helper — the IR is all `float`, so every fp op is Math.fround-narrowed. */
const f = Math.fround;

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8Row — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value is
 * cited by `// %N` on its producing statement.
 */
export function bm3dnr_buf__bm3dnr_buf_blend8x8Row(
  params: Blend8x8RowParams,                 // %0
  gridPos: readonly [number, number],        // %1 (gx, gy)
  inOut: Vec4[],                              // %2 <4 x float>* (read+write)
  inNum: readonly Vec4[],                     // %3 <4 x float>* (read)
): void {
  const gx = gridPos[0] | 0;                  // %5
  const gy = gridPos[1] | 0;                  // %10

  // Bounds checks — %8 / %13 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;  // %8  → %80 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;  // %13 → %80 ret

  const strideInOut = params.strideInOut | 0; // %16
  const strideIn    = params.strideIn    | 0; // %18
  const stepInc     = params.stepInc     | 0; // %20

  const inOutRowBase = (stepInc * gy) | 0;    // %24 (= stepInc * gy)
  const inColBase    = (gx * 2) | 0;          // %25 (= gx << 1)
  const inNumRowBase = (gy * 8) | 0;          // %26 (= gy << 3)

  // Path selector — %29: icmp eq strideInOut, 1
  if (strideInOut === 1) {
    // ------ Path B (block %53/%57): strideInOut == 1 fast path ------
    //
    // Preload: v0_initial = inOut[inOutRowBase + inColBase]         — %56
    const preAddr = (inOutRowBase + inColBase) | 0;                  // %54
    let carry: Vec4 = readVec4(inOut, preAddr);                       // %56

    for (let r = 0; r < 8; r++) {                                    // %59 phi 0..7
      const rIdx     = (inOutRowBase + r) | 0;                       // %61
      const inOutAdr = (rIdx * strideInOut + inColBase) | 0;          // %63
      const numIdx   = (inNumRowBase + r) | 0;                       // %65
      const inNumAdr = (numIdx * strideIn + inColBase) | 0;           // %67

      const n0: Vec4 = readVec4(inNum,  inNumAdr);                    // %69
      const v1: Vec4 = readVec4(inOut,  inOutAdr + 1);                // %72
      const n1: Vec4 = readVec4(inNum,  inNumAdr + 1);                // %75

      const sum0: Vec4 = addVec4(carry, n0);                          // %76 fadd
      const sum1: Vec4 = addVec4(v1,    n1);                          // %77 fadd

      inOut[inOutAdr]     = sum0;                                     // store %76 → %64
      inOut[inOutAdr + 1] = sum1;                                     // store %77 → %71

      // Compiler-hoisted carry: the next iteration's first-column
      // load address coincides with this iteration's second-column
      // store when strideInOut == 1. Forward %77 → next %58.
      carry = sum1;
    }
    // fall through to %80 ret.
    return;
  }

  // ------ Path A (block %30): general case, strideInOut != 1 ------
  for (let r = 0; r < 8; r++) {                                       // %31 phi 0..7
    const rIdx     = (inOutRowBase + r) | 0;                          // %33
    const inOutAdr = (rIdx * strideInOut + inColBase) | 0;             // %35
    const numIdx   = (inNumRowBase + r) | 0;                          // %38
    const inNumAdr = (numIdx * strideIn + inColBase) | 0;              // %40

    const v0: Vec4 = readVec4(inOut, inOutAdr);                        // %37
    const n0: Vec4 = readVec4(inNum, inNumAdr);                        // %42
    const v1: Vec4 = readVec4(inOut, inOutAdr + 1);                    // %45
    const n1: Vec4 = readVec4(inNum, inNumAdr + 1);                    // %48

    const sum0: Vec4 = addVec4(v0, n0);                                // %49 fadd
    const sum1: Vec4 = addVec4(v1, n1);                                // %50 fadd

    inOut[inOutAdr]     = sum0;                                        // store %49 → %36
    inOut[inOutAdr + 1] = sum1;                                        // store %50 → %44
    // %51/%52: r == 8 exit → %80 ret.
  }
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR op on <4 x float>.
// ---------------------------------------------------------------------------

/** load a `<4 x float>` from buffer `buf` at unit index `idx`, fp32-narrowing every lane. */
function readVec4(buf: readonly Vec4[], idx: number): Vec4 {
  const v = buf[idx | 0];
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}

/** per-lane f32 add — matches `fadd <4 x float>` (%49, %50, %76, %77). */
function addVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] + b[0]), f(a[1] + b[1]), f(a[2] + b[2]), f(a[3] + b[3])];
}
