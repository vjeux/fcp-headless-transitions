// bm3dnr_buf__bm3dnr_buf_blend8x8ColumnInc5.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5 (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5.ll
// (header line: `0x0000000000e3fd -- bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5`)
//
// This kernel is the "Inc5" (stride-5) column-blend step of BM3D denoise
// aggregation. Each thread `(gx, gy)` reads 3 existing float scalars +
// 8 `<4 x float>` numerator vectors + 2 `<4 x float>` weight vectors from
// device memory, computes 8 per-lane products (alternating w0, w1),
// diagonally accumulates neighbour lanes, and writes 23 float scalars
// back into the same `inOut` buffer at a stride-5 stagger.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5(
//     %params*         %0,   // params struct (6 x i32, see below)
//     <2 x i32>        %1,   // thread_position_in_grid   (gx, gy)
//     float*           %2,   // inOut          — scalar float accumulator (read+write)
//     <4 x float>*     %3,   // inNum          — <4 x float> numerator input
//     <4 x float>*     %4    // weightBuffer   — <4 x float> weight table (16-lane cyclic)
//   )
//
// Params struct layout (from !18 in the .ll):
//   i32  m_strideInOut  @0   → %17
//   i32  m_strideIn     @4   → %19
//   i32  m_stepInc      @8   → %21  (== 5 for the Inc5 variant; scales the output-col base)
//   i32  m_offsetX      @12  → %23  (added to gx to form the output-column index)
//   uint m_globalWidth  @16  → %8   (bound check on gx, %9)
//   uint m_globalHeight @20  → %13  (bound check on gy, %14)
//
// Semantics recovered from the AIR — top-level control flow:
//   block %5  → %10 → %15 → (unrolled body) → %170 ret
//     if (gx >= globalWidth)  return;                             // %9  unsigned-lt
//     if (gy >= globalHeight) return;                             // %14 unsigned-lt
//
//   col      = m_offsetX + gx                                      // %24 (as u32 → u64 %25)
//   inNumBase = (u64)col * 8                                       // %30 = col << 3
//   outBase  = col * (m_strideInOut * 4) + gy * m_strideInOut      // %29 + %32 = %33
//   wBase    = (gy << 1) & 0x0E                                    // %71/%72 = 2*gy mod 16, even
//
// Loads (24 total) from the header block %15:
//   accum.x = inOut[outBase + 0]                                   // %34/%35 → %36 lane 0
//   accum.y = inOut[outBase + 1]                                   // %38/%39 → %40 lane 1
//   accum.z = inOut[outBase + 2]                                   // %42/%43 → %44 lane 2
//   accum.w = 0.0                                                  // %36's lane 3 = float 0.0
//
//   N[k]    = inNum[inNumBase + gy * m_strideIn + k]  for k in 0..7 // %48..%70
//               (i.e. %47 = inNumBase + strideIn*gy, then +0..+7)
//
//   w0      = weightBuffer[wBase]                                  // %74/%75
//   w1      = weightBuffer[wBase | 1]                              // %78/%79
//
// Products (%80..%87) — 8 per-lane fmul, alternating w0/w1:
//   P[0] = N[0] * w0                                               // %80
//   P[1] = N[1] * w1                                               // %81
//   P[2] = N[2] * w0                                               // %82
//   P[3] = N[3] * w1                                               // %83
//   P[4] = N[4] * w0                                               // %84
//   P[5] = N[5] * w1                                               // %85
//   P[6] = N[6] * w0                                               // %86
//   P[7] = N[7] * w1                                               // %87
//
// Accumulator vector:
//   ACC  = accum + P[0]                                            // %88 = fadd <accum.x,.y,.z,0> + P[0]
//
// Staggered diagonal cross-lane sums (%89..%115) — for adjacent product pairs,
// add lane[i] of P[odd] to lane[i-1] of P[even]:
//   s91  = P[1].y + P[2].x                                         // %89+%90 → %91
//   s94  = P[1].z + P[2].y                                         // %92+%93 → %94
//   s97  = P[1].w + P[2].z                                         // %95+%96 → %97
//   s100 = P[3].y + P[4].x                                         // %98+%99 → %100
//   s103 = P[3].z + P[4].y                                         // %101+%102 → %103
//   s106 = P[3].w + P[4].z                                         // %104+%105 → %106
//   s109 = P[5].y + P[6].x                                         // %107+%108 → %109
//   s112 = P[5].z + P[6].y                                         // %110+%111 → %112
//   s115 = P[5].w + P[6].z                                         // %113+%114 → %115
//
// Stores — 23 scalar floats at inOut[outBase + 0 .. outBase + 22]
// (%116..%169, in the exact order emitted by the compiler):
//   inOut[outBase +  0] = ACC.x                                    // %116 → %34
//   inOut[outBase +  1] = ACC.y                                    // %117 → %38
//   inOut[outBase +  2] = ACC.z                                    // %118 → %42
//   inOut[outBase +  3] = ACC.w                                    // %119 → %121 (base+3)
//   inOut[outBase +  4] = P[1].x                                   // %122 → %124 (base+4)
//   inOut[outBase +  5] = s91                                      // %91   → %126 (base+5)
//   inOut[outBase +  6] = s94                                      // %94   → %128 (base+6)
//   inOut[outBase +  7] = s97                                      // %97   → %130 (base+7)
//   inOut[outBase +  8] = P[2].w                                   // %131 → %133 (base+8)
//   inOut[outBase +  9] = P[3].x                                   // %134 → %136 (base+9)
//   inOut[outBase + 10] = s100                                     // %100  → %138 (base+10)
//   inOut[outBase + 11] = s103                                     // %103  → %140 (base+11)
//   inOut[outBase + 12] = s106                                     // %106  → %142 (base+12)
//   inOut[outBase + 13] = P[4].w                                   // %143 → %145 (base+13)
//   inOut[outBase + 14] = P[5].x                                   // %146 → %148 (base+14)
//   inOut[outBase + 15] = s109                                     // %109  → %150 (base+15)
//   inOut[outBase + 16] = s112                                     // %112  → %152 (base+16)
//   inOut[outBase + 17] = s115                                     // %115  → %154 (base+17)
//   inOut[outBase + 18] = P[6].w                                   // %155 → %157 (base+18)
//   inOut[outBase + 19] = P[7].x                                   // %158 → %160 (base+19)
//   inOut[outBase + 20] = P[7].y                                   // %161 → %163 (base+20)
//   inOut[outBase + 21] = P[7].z                                   // %164 → %166 (base+21)
//   inOut[outBase + 22] = P[7].w                                   // %167 → %169 (base+22)
//
// PORT NOTE — `m_stepInc` (%21):
//   The IR reads %21 = m_stepInc at %20/%21 into `%28 = strideInOut << 2`
//   (i.e. strideInOut * 4) — BUT %28's producer is `shl %27, 2` where
//   %27 is `sext %21`, so %28 = m_stepInc * 4 (not m_strideInOut * 4).
//   The name "Inc5" refers to m_stepInc == 5 at runtime; the IR uses it
//   as a per-column stride multiplier of 4 * m_stepInc = 20 output slots
//   per output column. Wait — re-reading %27 = sext %21 (m_stepInc),
//   then %28 = %27 << 2 = m_stepInc * 4, and %29 = %28 * col. For a
//   variant labelled Inc5 with m_stepInc == 5, that yields 20 output
//   slots per column, matching the 23-element write window (0..22 with
//   3 slots of overlap for the accumulator carry from the prior column).
//   We faithfully compute `outBase = col * (m_stepInc * 4) + gy * m_strideInOut`.
//   The 4× scaling is a plain integer shift and preserved as-is.

/** RGBA float — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5_params` (!18 in the .ll). */
export interface Blend8x8ColumnInc5Params {
  /** i32 m_strideInOut  — row stride into `inOut`  (scalar float units). */
  readonly strideInOut: number;
  /** i32 m_strideIn     — row stride into `inNum`  (in `<4 x float>` units). */
  readonly strideIn: number;
  /** i32 m_stepInc      — output-column stride multiplier (== 5 for Inc5). */
  readonly stepInc: number;
  /** i32 m_offsetX      — added to gx to form the output-column index. */
  readonly offsetX: number;
  /** uint m_globalWidth  — grid width  in output columns. */
  readonly globalWidth: number;
  /** uint m_globalHeight — grid height in output rows. */
  readonly globalHeight: number;
}

/** fp32 helper — the IR is all `float`, so every fp op is Math.fround-narrowed. */
const f = Math.fround;

/**
 * bm3dnr_buf::bm3dnr_buf_blend8x8ColumnInc5 — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping, block-by-block. Every
 * SSA value in the .ll is cited on its producing line by the `// %N` tag.
 */
export function bm3dnr_buf__bm3dnr_buf_blend8x8ColumnInc5(
  params: Blend8x8ColumnInc5Params,          // %0
  gridPos: readonly [number, number],        // %1 (gx, gy)
  inOut: number[],                            // %2 float* (scalar; read+write)
  inNum: readonly Vec4[],                     // %3 <4 x float>* (read only)
  weightBuffer: readonly Vec4[],              // %4 <4 x float>* (read only)
): void {
  const gx = gridPos[0] | 0;                  // %6  = extractelement %1, i64 0
  const gy = gridPos[1] | 0;                  // %11 = extractelement %1, i64 1

  // Bounds checks — %9 / %14 (icmp ult == unsigned less than).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %9  → %170 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %14 → %170 ret

  const strideInOut = params.strideInOut | 0; // %17
  const strideIn    = params.strideIn    | 0; // %19
  const stepInc     = params.stepInc     | 0; // %21
  const offsetX     = params.offsetX     | 0; // %23

  // col      = m_offsetX + gx                                     — %24 → %25 (u64)
  const col = (offsetX + gx) | 0;

  // outBase  = col * (m_stepInc * 4) + gy * m_strideInOut         — %29 + %32 = %33
  const colStrideOut = (stepInc * 4) | 0;     // %28 = m_stepInc << 2
  const outBase      = (col * colStrideOut + gy * strideInOut) | 0; // %33

  // inNumBase = col * 8 + gy * m_strideIn                         — %30 + %46 = %47
  const inNumBase = ((col * 8) + (gy * strideIn)) | 0; // %47

  // wBase    = (gy << 1) & 0x0E                                   — %71/%72
  const wBase = ((gy << 1) & 14) | 0;         // %72

  // --- header loads (24 total) --------------------------------------------
  //  accum.x = inOut[outBase + 0]                                   — %34/%35
  //  accum.y = inOut[outBase + 1]                                   — %38/%39
  //  accum.z = inOut[outBase + 2]                                   — %42/%43
  //  accum.w = 0.0                                                  — <undef,undef,undef,0.0>
  const accum: Vec4 = [
    f(inOut[outBase + 0]),                    // %35 → %36 lane 0
    f(inOut[outBase + 1]),                    // %39 → %40 lane 1
    f(inOut[outBase + 2]),                    // %43 → %44 lane 2
    f(0.0),                                   // %36 lane 3 = float 0.0
  ];

  //  N[k]    = inNum[inNumBase + k]  for k in 0..7                  — %48..%70
  const N0 = readVec4(inNum, inNumBase + 0);  // %49
  const N1 = readVec4(inNum, inNumBase + 1);  // %52
  const N2 = readVec4(inNum, inNumBase + 2);  // %55
  const N3 = readVec4(inNum, inNumBase + 3);  // %58
  const N4 = readVec4(inNum, inNumBase + 4);  // %61
  const N5 = readVec4(inNum, inNumBase + 5);  // %64
  const N6 = readVec4(inNum, inNumBase + 6);  // %67
  const N7 = readVec4(inNum, inNumBase + 7);  // %70

  //  w0/w1   = weightBuffer[wBase] / weightBuffer[wBase | 1]        — %75 / %79
  const w0 = readVec4(weightBuffer, wBase);       // %75
  const w1 = readVec4(weightBuffer, wBase | 1);   // %79

  // --- products (%80..%87) ------------------------------------------------
  const P0 = mulVec4(N0, w0);                 // %80
  const P1 = mulVec4(N1, w1);                 // %81
  const P2 = mulVec4(N2, w0);                 // %82
  const P3 = mulVec4(N3, w1);                 // %83
  const P4 = mulVec4(N4, w0);                 // %84
  const P5 = mulVec4(N5, w1);                 // %85
  const P6 = mulVec4(N6, w0);                 // %86
  const P7 = mulVec4(N7, w1);                 // %87

  // --- accumulator vector (%88) -------------------------------------------
  const ACC: Vec4 = addVec4(accum, P0);       // %88

  // --- staggered diagonal cross-lane sums (%89..%115) ---------------------
  const s91  = f(P1[1] + P2[0]);              // %89 + %90 → %91
  const s94  = f(P1[2] + P2[1]);              // %92 + %93 → %94
  const s97  = f(P1[3] + P2[2]);              // %95 + %96 → %97
  const s100 = f(P3[1] + P4[0]);              // %98 + %99 → %100
  const s103 = f(P3[2] + P4[1]);              // %101 + %102 → %103
  const s106 = f(P3[3] + P4[2]);              // %104 + %105 → %106
  const s109 = f(P5[1] + P6[0]);              // %107 + %108 → %109
  const s112 = f(P5[2] + P6[1]);              // %110 + %111 → %112
  const s115 = f(P5[3] + P6[2]);              // %113 + %114 → %115

  // --- stores (23 total) at inOut[outBase + 0 .. outBase + 22] ------------
  inOut[outBase +  0] = ACC[0];               // %116 → %34
  inOut[outBase +  1] = ACC[1];               // %117 → %38
  inOut[outBase +  2] = ACC[2];               // %118 → %42
  inOut[outBase +  3] = ACC[3];               // %119 → %121
  inOut[outBase +  4] = P1[0];                // %122 → %124
  inOut[outBase +  5] = s91;                  // %91   → %126
  inOut[outBase +  6] = s94;                  // %94   → %128
  inOut[outBase +  7] = s97;                  // %97   → %130
  inOut[outBase +  8] = P2[3];                // %131 → %133
  inOut[outBase +  9] = P3[0];                // %134 → %136
  inOut[outBase + 10] = s100;                 // %100  → %138
  inOut[outBase + 11] = s103;                 // %103  → %140
  inOut[outBase + 12] = s106;                 // %106  → %142
  inOut[outBase + 13] = P4[3];                // %143 → %145
  inOut[outBase + 14] = P5[0];                // %146 → %148
  inOut[outBase + 15] = s109;                 // %109  → %150
  inOut[outBase + 16] = s112;                 // %112  → %152
  inOut[outBase + 17] = s115;                 // %115  → %154
  inOut[outBase + 18] = P6[3];                // %155 → %157
  inOut[outBase + 19] = P7[0];                // %158 → %160
  inOut[outBase + 20] = P7[1];                // %161 → %163
  inOut[outBase + 21] = P7[2];                // %164 → %166
  inOut[outBase + 22] = P7[3];                // %167 → %169
  // %170: ret void.
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR op on <4 x float>.
// ---------------------------------------------------------------------------

/** load a `<4 x float>` from buffer `buf` at unit index `idx`, fp32-narrowing every lane. */
function readVec4(buf: readonly Vec4[], idx: number): Vec4 {
  const v = buf[idx | 0];
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}

/** per-lane f32 multiply — matches `fmul <4 x float>` (%80..%87). */
function mulVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] * b[0]), f(a[1] * b[1]), f(a[2] * b[2]), f(a[3] * b[3])];
}

/** per-lane f32 add — matches `fadd <4 x float>` (%88). */
function addVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] + b[0]), f(a[1] + b[1]), f(a[2] + b[2]), f(a[3] + b[3])];
}
