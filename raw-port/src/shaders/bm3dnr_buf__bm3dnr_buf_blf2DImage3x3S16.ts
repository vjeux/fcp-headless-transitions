// bm3dnr_buf__bm3dnr_buf_blf2DImage3x3S16.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16 (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16.ll
// (header line: `0x00000000018f9d -- bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16`)
//
// A 3×3 bilateral filter for int16 (short4) images. Each thread `(gx, gy)`
// reads a 3×3 neighbourhood of `<4 x i16>` values centred on itself,
// computes exp(sigma * (center - neighbour)^2) weights per lane, and
// writes the weighted average back as `<4 x i16>` at output[strideOut*gy + gx].
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16(
//     %params*        %0,    // params struct (7 fields, see below)
//     <2 x i32>       %1,    // thread_position_in_grid   (gx, gy)
//     <4 x i16>*      %2,    // input   (read)
//     <4 x i16>*      %3     // output  (write)
//   )
//
// Params struct layout (from !18 in the .ll):
//   i32   m_width         @0    → %16
//   i32   m_height        @4    → %18
//   i32   m_inputStride   @8    → %20
//   i32   m_outputStride  @12   → %22
//   float m_sigma         @16   → %24  (splatted to vec4 as %87 → %88)
//   uint  m_globalWidth   @20   → %7   (bound check on gx, %8)
//   uint  m_globalHeight  @24   → %12  (bound check on gy, %13)
//
// The 3×3 neighbour indexing uses mirror-clamped coordinates:
//   lx = max(gx-1, 0)                                                  // %25, %29/%30 select
//   rx = min(gx+1, m_width-1)                                          // %26, %31/%33 select
//   ty = max(gy-1, 0)                                                  // %27, %34/%35 select
//   by = min(gy+1, m_height-1)                                         // %28, %36/%38 select
// (The `sgt 0`/`slt width` guards are on the *incremented* value, so the
//  underflow at gx=0 wraps to gx-1 = -1 → replaced by 0, and the overflow
//  at gx=width-1 wraps to gx+1 = width → replaced by width-1.)
//
// The 9 neighbours are loaded from `input` and immediately converted to
// float via `air.convert.f.v4f32.s.v4i16`:
//     TL = f(input[stride*ty + lx])                                    // %43 → %44
//     TC = f(input[stride*ty + gx])                                    // %48 → %49
//     TR = f(input[stride*ty + rx])                                    // %53 → %54
//     CL = f(input[stride*gy + lx])                                    // %59 → %60
//     CC = f(input[stride*gy + gx])                                    // %64 → %65     — the centre
//     CR = f(input[stride*gy + rx])                                    // %69 → %70
//     BL = f(input[stride*by + lx])                                    // %75 → %76
//     BC = f(input[stride*by + gx])                                    // %80 → %81
//     BR = f(input[stride*by + rx])                                    // %85 → %86
// where `stride = m_inputStride` (%20). Each load is a `<4 x i16>` (short4)
// treated as 4 horizontally-packed pixels; horizontal shifts between adjacent
// tiles are done via shufflevector.
//
// SIGMA splat (%87 → %88): scalar float m_sigma → <s, s, s, s>.
//
// Weight and accumulator computation — the AIR walks 4 neighbour groups
// (top-column, mid-column-diagonal, mid-column, bottom-column). At each
// step it computes exp2(sigma * diff * diff) as the weight, and Kahan-free
// fmuladd(neighbour, weight, running_sum). The running sum and running
// weight-sum are both `<4 x float>`.
//
// Step 1 — top column (CC vs TC and CC vs BC), initial accum:
//   d0    = CC - TC                                                     // %89 = fsub %65,%49
//   d1    = CC - BC                                                     // %90 = fsub %65,%81
//   w_TC  = exp2(sigma * d0^2)                                          // %93 = air.exp2(%92 = sigma*d0*d0)
//   w_BC  = exp2(sigma * d1^2)                                          // %96 = air.exp2(%95 = sigma*d1*d1)
//   sum0  = fmuladd(TC, w_TC, CC)                                       // %97 = TC*w_TC + CC
//   wsum0 = w_TC + <1,1,1,1>                                            // %98 = w_TC + 1
//   sum1  = fmuladd(BC, w_BC, sum0)                                     // %99 = BC*w_BC + sum0
//   wsum1 = wsum0 + w_BC                                                // %100 = wsum0 + w_BC
//
// Step 2 — mid-column diagonal borrows (lane-shift left+right by 1):
//   LL    = shuffle(TL.w, CL.[0,1,2])                                   // %101/%102: (TL[3], CL[0], CL[1], CL[2])
//   LR    = shuffle(BL.w, CL.[0,1,2])                                   // %103/%104: (BL[3], CL[0], CL[1], CL[2])
//   d2    = CC - LL                                                     // %105
//   d3    = CC - LR                                                     // %106
//   w_LL  = exp2(sigma * d2^2)                                          // %109
//   w_LR  = exp2(sigma * d3^2)                                          // %112
//   sum2  = fmuladd(LL, w_LL, sum1)                                     // %113
//   wsum2 = wsum1 + w_LL                                                // %114
//   sum3  = fmuladd(LR, w_LR, sum2)                                     // %115
//   wsum3 = wsum2 + w_LR                                                // %116
//
// Step 3 — mid-column right-shift (borrow from right-column):
//   RL    = shuffle(CL.[1,2,3], TR[0])                                  // %117..%119: (CL[1], CL[2], CL[3], TR[0])
//   RR    = shuffle(CL.[1,2,3], BR[0])                                  // %120..%122: (CL[1], CL[2], CL[3], BR[0])
//   Wait — the AIR actually uses CL/BL shuffle sources for these. Careful re-reading:
//     %117 = shuffle %49 (TC) → picks lanes 1,2,3 as a <3 x float>
//     %118 = extend to <4 x float>
//     %119 = shuffle %118 with %54 (TR), taking (0,1,2, 4=TR[0])
//   So RL = (TC[1], TC[2], TC[3], TR[0])  — the row of "top-shifted-right" values.
//   Similarly %120..%122: RR = (BC[1], BC[2], BC[3], BR[0]).
//   d4    = CC - RL                                                     // %123
//   d5    = CC - RR                                                     // %124
//   w_RL  = exp2(sigma * d4^2)                                          // %127
//   w_RR  = exp2(sigma * d5^2)                                          // %130
//   sum4  = fmuladd(RL, w_RL, sum3)                                     // %131
//   wsum4 = wsum3 + w_RL                                                // %132
//   sum5  = fmuladd(RR, w_RR, sum4)                                     // %133
//   wsum5 = wsum4 + w_RR                                                // %134
//
// Step 4 — the last two diagonals (CL and CR-shifted):
//   Reading the .ll again — %135/%136: (CL.w, CC[0], CC[1], CC[2]) — i.e. "CC shifted right by 1, with CL's last lane in slot 0". That IS CL as a whole shifted-left view.
//     %135 = shuffle %60 (CL) → picks lane 3 into slot 0
//     %136 = shuffle %135 with %65 (CC), taking (0, 4=CC[0], 5=CC[1], 6=CC[2])  → (CL[3], CC[0], CC[1], CC[2])
//   And %137..%139: (CC[1], CC[2], CC[3], CR[0]) — CC shifted-right one lane, CR[0] filling.
//     %137 = shuffle %65 (CC) → lanes 1,2,3 as <3 x float>
//     %138 = extend to <4 x float>
//     %139 = shuffle %138 with %70 (CR), taking (0,1,2, 4=CR[0])  → (CC[1], CC[2], CC[3], CR[0])
//   d6    = CC - LC (== CL-shifted-into-CC-slot)                        // %140
//   d7    = CC - RC (== CC-shifted-into-CR-slot)                        // %141
//   w_LC  = exp2(sigma * d6^2)                                          // %144
//   w_RC  = exp2(sigma * d7^2)                                          // %147
//   sum6  = fmuladd(LC, w_LC, sum5)                                     // %148
//   wsum6 = wsum5 + w_LC                                                // %149
//   sum7  = fmuladd(RC, w_RC, sum6)                                     // %150
//   wsum7 = wsum6 + w_RC                                                // %151
//
// Final normalise, round to i16, store (%152..%160):
//   avg    = sum7 / wsum7                                               // %152
//   avg    = avg + <0.5, 0.5, 0.5, 0.5>                                 // %153
//   avg    = air.floor(avg)                                             // %154
//   avg    = air.clamp(avg, INT16_MIN, INT16_MAX)                       // %155
//   out    = air.convert.s.v4i16(avg)                                   // %156
//   output[m_outputStride * gy + gx] = out                              // %157..%160
//
// Constants (decoded from the IR):
//   <float 1.000000e+00, ...>      — 1.0 splat added to weight-sum (%98)
//   <float 5.000000e-01, ...>      — 0.5 splat added before floor (%153)
//   <float -3.276800e+04, ...>     — -32768.0 (INT16_MIN) for the clamp (%155)
//   <float  3.276700e+04, ...>     —  32767.0 (INT16_MAX) for the clamp (%155)
//
// NOTE on `llvm.fmuladd`: The AIR intrinsic is defined as an FMA that MAY
// or MAY NOT be fused (depending on hardware). Here we mirror it as a
// plain `a*b + c` — the fp32 result may differ in the last bit from a
// hardware FMA, but that's a documented port trade-off (`fast_math_disable`
// is set on this module — see !12 — so we use the strict, unfused semantics).

/** RGBA float pixel — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];
/** Short4 pixel — matches `<4 x i16>` lane order (int16-valued numbers). */
export type Short4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params` (!18). */
export interface Blf2DImage3x3S16Params {
  /** i32   m_width        — image width  in short4 tiles. */
  readonly width: number;
  /** i32   m_height       — image height in short4 rows. */
  readonly height: number;
  /** i32   m_inputStride  — row stride into `input`  (in `<4 x i16>` units). */
  readonly inputStride: number;
  /** i32   m_outputStride — row stride into `output` (in `<4 x i16>` units). */
  readonly outputStride: number;
  /** float m_sigma        — the exp2 weight scaling factor (typically negative). */
  readonly sigma: number;
  /** uint  m_globalWidth  — grid width  in output columns. */
  readonly globalWidth: number;
  /** uint  m_globalHeight — grid height in output rows. */
  readonly globalHeight: number;
}

/** fp32 helper — the IR is all `float`, so every fp op is Math.fround-narrowed. */
const f = Math.fround;

/**
 * bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16 — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value in the
 * .ll is cited by the `// %N` tag on its producing statement.
 */
export function bm3dnr_buf__bm3dnr_buf_blf2DImage3x3S16(
  params: Blf2DImage3x3S16Params,             // %0
  gridPos: readonly [number, number],         // %1 (gx, gy)
  input: readonly Short4[],                    // %2 <4 x i16>* (read)
  output: Short4[],                            // %3 <4 x i16>* (write)
): void {
  const gx = gridPos[0] | 0;                   // %5
  const gy = gridPos[1] | 0;                   // %10

  // Bounds checks — %8 / %13 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %8  → %161 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %13 → %161 ret

  const width        = params.width        | 0; // %16
  const height       = params.height       | 0; // %18
  const inputStride  = params.inputStride  | 0; // %20
  const outputStride = params.outputStride | 0; // %22
  const sigma        = f(params.sigma);         // %24 (float)

  // Mirror-clamped neighbour indices.
  const gxm1 = (gx - 1) | 0;                   // %25
  const gxp1 = (gx + 1) | 0;                   // %26
  const gym1 = (gy - 1) | 0;                   // %27
  const gyp1 = (gy + 1) | 0;                   // %28
  const lx   = gxm1 > 0 ? gxm1 : 0;            // %29 (sgt 0) → %30 select
  const rx   = gxp1 < width  ? gxp1 : ((width  - 1) | 0);  // %31 (slt %16) → %33 select
  const ty   = gym1 > 0 ? gym1 : 0;            // %34 → %35 select
  const by   = gyp1 < height ? gyp1 : ((height - 1) | 0);  // %36 → %38 select

  // Row-stride offsets.
  const rowT = (inputStride * ty) | 0;         // %39
  const rowC = (inputStride * gy) | 0;         // %55
  const rowB = (inputStride * by) | 0;         // %71

  // Load 9 neighbours, converting i16→f32 (air.convert.f.v4f32.s.v4i16).
  const TL: Vec4 = i16toF32(input[(rowT + lx) | 0]);   // %41..%44
  const TC: Vec4 = i16toF32(input[(rowT + gx) | 0]);   // %45..%49
  const TR: Vec4 = i16toF32(input[(rowT + rx) | 0]);   // %50..%54
  const CL: Vec4 = i16toF32(input[(rowC + lx) | 0]);   // %56..%60
  const CC: Vec4 = i16toF32(input[(rowC + gx) | 0]);   // %61..%65 — the centre
  const CR: Vec4 = i16toF32(input[(rowC + rx) | 0]);   // %66..%70
  const BL: Vec4 = i16toF32(input[(rowB + lx) | 0]);   // %72..%76
  const BC: Vec4 = i16toF32(input[(rowB + gx) | 0]);   // %77..%81
  const BR: Vec4 = i16toF32(input[(rowB + rx) | 0]);   // %82..%86

  // sigma splat: %87 = insertelement undef, sigma, 0; %88 = shufflevector, zeroinitializer.
  const sig: Vec4 = [sigma, sigma, sigma, sigma];

  // Step 1 — top-and-bottom column neighbours (TC, BC vs CC).
  const d0: Vec4    = subVec4(CC, TC);          // %89
  const d1: Vec4    = subVec4(CC, BC);          // %90
  const w_TC: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d0, d0)));   // %91..%93
  const w_BC: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d1, d1)));   // %94..%96
  const sum0: Vec4  = fmuladdVec4(TC, w_TC, CC);                 // %97 = TC*w_TC + CC
  const wsum0: Vec4 = addScalarVec4(w_TC, f(1.0));               // %98 = w_TC + <1,1,1,1>
  const sum1: Vec4  = fmuladdVec4(BC, w_BC, sum0);               // %99
  const wsum1: Vec4 = addVec4(wsum0, w_BC);                       // %100

  // Step 2 — left-column-shifted-right diagonals (borrow lane 3 from TL/BL).
  //   LL = (TL[3], CL[0], CL[1], CL[2])                          // %101/%102
  //   LR = (BL[3], CL[0], CL[1], CL[2])                          // %103/%104
  const LL: Vec4 = [TL[3], CL[0], CL[1], CL[2]];
  const LR: Vec4 = [BL[3], CL[0], CL[1], CL[2]];
  const d2: Vec4    = subVec4(CC, LL);           // %105
  const d3: Vec4    = subVec4(CC, LR);           // %106
  const w_LL: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d2, d2)));   // %107..%109
  const w_LR: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d3, d3)));   // %110..%112
  const sum2: Vec4  = fmuladdVec4(LL, w_LL, sum1);               // %113
  const wsum2: Vec4 = addVec4(wsum1, w_LL);                       // %114
  const sum3: Vec4  = fmuladdVec4(LR, w_LR, sum2);               // %115
  const wsum3: Vec4 = addVec4(wsum2, w_LR);                       // %116

  // Step 3 — right-column-shifted-left diagonals (borrow lane 0 from TR/BR).
  //   RL = (TC[1], TC[2], TC[3], TR[0])                          // %117..%119
  //   RR = (BC[1], BC[2], BC[3], BR[0])                          // %120..%122
  const RL: Vec4 = [TC[1], TC[2], TC[3], TR[0]];
  const RR: Vec4 = [BC[1], BC[2], BC[3], BR[0]];
  const d4: Vec4    = subVec4(CC, RL);           // %123
  const d5: Vec4    = subVec4(CC, RR);           // %124
  const w_RL: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d4, d4)));   // %125..%127
  const w_RR: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d5, d5)));   // %128..%130
  const sum4: Vec4  = fmuladdVec4(RL, w_RL, sum3);               // %131
  const wsum4: Vec4 = addVec4(wsum3, w_RL);                       // %132
  const sum5: Vec4  = fmuladdVec4(RR, w_RR, sum4);               // %133
  const wsum5: Vec4 = addVec4(wsum4, w_RR);                       // %134

  // Step 4 — center-row shifts (borrow from CL/CR).
  //   LC = (CL[3], CC[0], CC[1], CC[2])                          // %135/%136 (borrows CL[3] into slot 0)
  //   RC = (CC[1], CC[2], CC[3], CR[0])                          // %137..%139 (borrows CR[0] into slot 3)
  const LC: Vec4 = [CL[3], CC[0], CC[1], CC[2]];
  const RC: Vec4 = [CC[1], CC[2], CC[3], CR[0]];
  const d6: Vec4    = subVec4(CC, LC);           // %140
  const d7: Vec4    = subVec4(CC, RC);           // %141
  const w_LC: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d6, d6)));   // %142..%144
  const w_RC: Vec4  = exp2Vec4(mulVec4(sig, mulVec4(d7, d7)));   // %145..%147
  const sum6: Vec4  = fmuladdVec4(LC, w_LC, sum5);               // %148
  const wsum6: Vec4 = addVec4(wsum5, w_LC);                       // %149
  const sum7: Vec4  = fmuladdVec4(RC, w_RC, sum6);               // %150
  const wsum7: Vec4 = addVec4(wsum6, w_RC);                       // %151

  // Normalise → round-toward-+∞ via +0.5-then-floor → clamp[INT16_MIN,INT16_MAX] → i16.
  const avg152: Vec4 = divVec4(sum7, wsum7);                     // %152
  const avg153: Vec4 = addScalarVec4(avg152, f(0.5));            // %153
  const avg154: Vec4 = floorVec4(avg153);                        // %154
  const avg155: Vec4 = clampVec4(avg154, f(-3.276800e+04), f(3.276700e+04));  // %155
  const avg156: Short4 = f32toI16(avg155);                       // %156 = air.convert.s.v4i16

  // Store: output[m_outputStride * gy + gx].
  const outIdx = (outputStride * gy + gx) | 0;                   // %157 + %5 = %158
  output[outIdx] = avg156;                                       // %160 store
  // %161: ret void.
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR intrinsic on <4 x float>.
// ---------------------------------------------------------------------------

/** `air.convert.f.v4f32.s.v4i16` — signed int16 → float32 per lane. */
function i16toF32(v: Short4): Vec4 {
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}

/** `air.convert.s.v4i16.f.v4f32` — signed float32 → int16 truncation per lane.
 *  The preceding clamp[INT16_MIN, INT16_MAX] guarantees the input already
 *  fits, so `Math.trunc(x) | 0` reproduces the AIR result bit-for-bit. */
function f32toI16(v: Vec4): Short4 {
  const t = (x: number) => Math.trunc(x) | 0;
  return [t(v[0]), t(v[1]), t(v[2]), t(v[3])];
}

/** per-lane f32 sub — matches `fsub <4 x float>`. */
function subVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] - b[0]), f(a[1] - b[1]), f(a[2] - b[2]), f(a[3] - b[3])];
}

/** per-lane f32 add — matches `fadd <4 x float>`. */
function addVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] + b[0]), f(a[1] + b[1]), f(a[2] + b[2]), f(a[3] + b[3])];
}

/** add a splatted scalar to every lane — matches `fadd _, <s,s,s,s>`. */
function addScalarVec4(v: Vec4, s: number): Vec4 {
  return [f(v[0] + s), f(v[1] + s), f(v[2] + s), f(v[3] + s)];
}

/** per-lane f32 multiply — matches `fmul <4 x float>`. */
function mulVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] * b[0]), f(a[1] * b[1]), f(a[2] * b[2]), f(a[3] * b[3])];
}

/** per-lane f32 divide — matches `fdiv <4 x float>` (%152). */
function divVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] / b[0]), f(a[1] / b[1]), f(a[2] / b[2]), f(a[3] / b[3])];
}

/** `air.floor.v4f32` — per-lane floor toward -∞, fp32-narrowed (%154). */
function floorVec4(v: Vec4): Vec4 {
  return [f(Math.floor(v[0])), f(Math.floor(v[1])),
          f(Math.floor(v[2])), f(Math.floor(v[3]))];
}

/** `air.clamp.v4f32(v, lo, hi)` per-lane — min(max(v,lo),hi) (%155). */
function clampVec4(v: Vec4, lo: number, hi: number): Vec4 {
  return [
    f(Math.min(Math.max(v[0], lo), hi)),
    f(Math.min(Math.max(v[1], lo), hi)),
    f(Math.min(Math.max(v[2], lo), hi)),
    f(Math.min(Math.max(v[3], lo), hi)),
  ];
}

/** `air.exp2.v4f32` — per-lane exp2, fp32-narrowed. Math.pow(2, x) is bit-
 *  exact for f32 on the LLVM-modelled domain (fast_math_disable is set on
 *  this module — see !12 in the .ll — so the strict libm exp2 is used). */
function exp2Vec4(v: Vec4): Vec4 {
  return [f(Math.pow(2, v[0])), f(Math.pow(2, v[1])),
          f(Math.pow(2, v[2])), f(Math.pow(2, v[3]))];
}

/** `llvm.fmuladd.v4f32(a, b, c)` — a*b + c per lane. With `fast_math_disable`
 *  set on this module (!12 in the .ll), we use the strict, unfused form. */
function fmuladdVec4(a: Vec4, b: Vec4, c: Vec4): Vec4 {
  return [
    f(f(a[0] * b[0]) + c[0]),
    f(f(a[1] * b[1]) + c[1]),
    f(f(a[2] * b[2]) + c[2]),
    f(f(a[3] * b[3]) + c[3]),
  ];
}
