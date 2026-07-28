// bm3dnr_buf__bm3dnr_buf_blend8x8Column.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8Column` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8Column (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8Column.ll
// (header line: `0x0000000000abbd -- bm3dnr_buf::bm3dnr_buf_blend8x8Column`)
//
// The base (non-"Inc") column-blend step of BM3D denoise aggregation.
// Each thread `(gx, gy)` reads 8 existing float scalars + 2 `<4 x float>`
// numerator vectors + 2 `<4 x float>` weight vectors, computes 2 per-lane
// weighted products, adds them onto the existing accumulator, and writes
// 8 float scalars back. No cross-lane staggering (unlike the Inc5 sibling).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8Column(
//     %params*         %0,   // params struct (5 x i32, see below)
//     <2 x i32>        %1,   // thread_position_in_grid   (gx, gy)
//     float*           %2,   // inOut          — scalar float accumulator (read+write)
//     <4 x float>*     %3,   // inNum          — <4 x float> numerator input
//     <4 x float>*     %4    // weightBuffer   — <4 x float> weight table (16-lane cyclic)
//   )
//
// Params struct (!24 layout at bytes 0/4/8/12/16 — reuses the shape of
// `%struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params`):
//   i32  m_strideInOut       @0   → %17  (row stride for `inOut`, scalar float units)
//   i32  m_strideIn          @4   → %19  (row stride for `inNum`, <4 x float> units)
//   i32  m_strideCol         @8   → %21  (column-major output stride per-gx multiplier)
//   uint m_globalWidth       @12  → %8   (bound check on gx, %9)
//   uint m_globalHeight      @16  → %13  (bound check on gy, %14)
//
// Semantics recovered from the AIR:
//   block %5 → %10 → %15 → %90 ret
//   if (gx >= globalWidth)  return;                              // %9  unsigned-lt
//   if (gy >= globalHeight) return;                              // %14 unsigned-lt
//
//   colStride = (i64)m_strideCol                                  // %24 = sext %21
//   base      = colStride * gx + m_strideInOut * gy               // %25 + %28 = %29
//   inColBase = gx * 2                                            // %26 = gx << 1
//   inRowBase = m_strideIn * gy + inColBase                       // %62 + %63 (as i64)
//
//   Load 8 scalar float values from inOut[base + 0..7]:
//     v0..3 in a <4 x float>                                      // %30..%44 → %44
//     v4..7 in a <4 x float>                                      // %46..%60 → %60
//
//   Load 2 <4 x float> from inNum:
//     N0 = inNum[inRowBase + 0]                                   // %65
//     N1 = inNum[inRowBase + 1]                                   // %68
//
//   wBase = (gy << 1) & 0x0E                                      // %69/%70
//   w0    = weightBuffer[wBase]                                   // %72/%73
//   w1    = weightBuffer[wBase | 1]                               // %75/%76/%77
//
//   P0 = N0 * w0                                                  // %78
//   P1 = N1 * w1                                                  // %79
//   ACC0 = <v0,v1,v2,v3> + P0                                     // %80
//   ACC1 = <v4,v5,v6,v7> + P1                                     // %81
//
//   Store 8 scalars back at inOut[base + 0..7] in lane order      // %82..%89
//
// Note: `!24 = _ZTSN10bm3dnr_buf32bm3dnr_buf_blend8x8Column_paramsE` names
// the struct type but the IR does not carry per-field names; the field-8
// value (%21) is used only to scale gx into the output offset, so we name
// it `strideCol` per its role. In the Inc5 sibling this field is named
// `m_stepInc` in the metadata; here `!17`/`!24` don't provide a per-field
// name so `strideCol` is the closest role-based label.

/** RGBA float — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blend4x4Weight_params`. */
export interface Blend8x8ColumnParams {
  /** i32 m_strideInOut  — row stride into `inOut` (scalar float units). */
  readonly strideInOut: number;
  /** i32 m_strideIn     — row stride into `inNum` (in `<4 x float>` units). */
  readonly strideIn: number;
  /** i32 m_strideCol    — output-column stride per gx (scalar float units). */
  readonly strideCol: number;
  /** uint m_globalWidth  — grid width  in output columns. */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid height in output rows. */
  readonly globalHeight: number;
}

/** fp32 helper — the IR is all `float`, so every fp op is Math.fround-narrowed. */
const f = Math.fround;

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8Column — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value in the
 * .ll is cited by the `// %N` tag on its producing statement.
 */
export function bm3dnr_buf__bm3dnr_buf_blend8x8Column(
  params: Blend8x8ColumnParams,              // %0
  gridPos: readonly [number, number],        // %1 (gx, gy)
  inOut: number[],                            // %2 float* (scalar; read+write)
  inNum: readonly Vec4[],                     // %3 <4 x float>* (read only)
  weightBuffer: readonly Vec4[],              // %4 <4 x float>* (read only)
): void {
  const gx = gridPos[0] | 0;                  // %6  = extractelement %1, i64 0
  const gy = gridPos[1] | 0;                  // %11 = extractelement %1, i64 1

  // Bounds checks — %9 / %14 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %9  → %90 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %14 → %90 ret

  const strideInOut = params.strideInOut | 0; // %17
  const strideIn    = params.strideIn    | 0; // %19
  const strideCol   = params.strideCol   | 0; // %21

  // base      = m_strideCol * gx + m_strideInOut * gy              — %25 + %28 = %29
  const base       = (strideCol * gx + strideInOut * gy) | 0;
  // inColBase = gx << 1                                            — %26
  const inColBase  = (gx * 2) | 0;
  // inRowBase = strideIn * gy + inColBase                          — %62 + %26 = %63
  const inRowBase  = (strideIn * gy + inColBase) | 0;

  // wBase     = (gy << 1) & 0x0E                                   — %69/%70
  const wBase      = ((gy << 1) & 14) | 0;

  // --- 8 scalar float loads into two <4 x float> lanes ---------------------
  //   %30/%31 → %32: v0 = inOut[base + 0]                          → lane 0
  //   %34/%35 → %36: v1 = inOut[base + 1]                          → lane 1
  //   %38/%39 → %40: v2 = inOut[base + 2]                          → lane 2
  //   %42/%43 → %44: v3 = inOut[base + 3]                          → lane 3
  const v03: Vec4 = [
    f(inOut[base + 0]),                       // %31
    f(inOut[base + 1]),                       // %35
    f(inOut[base + 2]),                       // %39
    f(inOut[base + 3]),                       // %43
  ];
  //   %46/%47 → %48: v4                        → lane 0
  //   %50/%51 → %52: v5                        → lane 1
  //   %54/%55 → %56: v6                        → lane 2
  //   %58/%59 → %60: v7                        → lane 3
  const v47: Vec4 = [
    f(inOut[base + 4]),                       // %47
    f(inOut[base + 5]),                       // %51
    f(inOut[base + 6]),                       // %55
    f(inOut[base + 7]),                       // %59
  ];

  // --- 2 <4 x float> loads from inNum -------------------------------------
  const N0: Vec4 = readVec4(inNum, inRowBase + 0);      // %65
  const N1: Vec4 = readVec4(inNum, inRowBase + 1);      // %68

  // --- 2 <4 x float> loads from weightBuffer ------------------------------
  const w0: Vec4 = readVec4(weightBuffer, wBase);       // %73
  const w1: Vec4 = readVec4(weightBuffer, wBase | 1);   // %77

  // --- 2 fmul + 2 fadd ----------------------------------------------------
  const P0: Vec4   = mulVec4(N0, w0);         // %78
  const P1: Vec4   = mulVec4(N1, w1);         // %79
  const ACC0: Vec4 = addVec4(v03, P0);        // %80
  const ACC1: Vec4 = addVec4(v47, P1);        // %81

  // --- 8 scalar float stores back at inOut[base + 0..7] -------------------
  inOut[base + 0] = ACC0[0];                  // %82 → %30
  inOut[base + 1] = ACC0[1];                  // %83 → %34
  inOut[base + 2] = ACC0[2];                  // %84 → %38
  inOut[base + 3] = ACC0[3];                  // %85 → %42
  inOut[base + 4] = ACC1[0];                  // %86 → %46
  inOut[base + 5] = ACC1[1];                  // %87 → %50
  inOut[base + 6] = ACC1[2];                  // %88 → %54
  inOut[base + 7] = ACC1[3];                  // %89 → %58
  // %90: ret void.
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR op on <4 x float>.
// ---------------------------------------------------------------------------

/** load a `<4 x float>` from buffer `buf` at unit index `idx`, fp32-narrowing every lane. */
function readVec4(buf: readonly Vec4[], idx: number): Vec4 {
  const v = buf[idx | 0];
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}

/** per-lane f32 multiply — matches `fmul <4 x float>` (%78, %79). */
function mulVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] * b[0]), f(a[1] * b[1]), f(a[2] * b[2]), f(a[3] * b[3])];
}

/** per-lane f32 add — matches `fadd <4 x float>` (%80, %81). */
function addVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] + b[0]), f(a[1] + b[1]), f(a[2] + b[2]), f(a[3] + b[3])];
}
