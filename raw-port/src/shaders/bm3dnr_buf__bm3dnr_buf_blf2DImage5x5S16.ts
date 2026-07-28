// bm3dnr_buf__bm3dnr_buf_blf2DImage5x5S16.ts — direct TS mapping of the
// @shader bm3dnr_buf::bm3dnr_buf_blf2DImage5x5S16 (HeliumSenso)
// Metal compute kernel from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blf2DImage5x5S16.ll
// (header line: `0x0000000001ce4d -- bm3dnr_buf::bm3dnr_buf_blf2DImage5x5S16`)
//
// A 5×5 bilateral filter for int16 (short4) images. Structurally the same as the 3×3 sibling
// (bm3dnr_buf__bm3dnr_buf_blf2DImage3x3S16.ts) but expanded to a 5-row × 5-column neighbourhood:
// each thread loads 5×3 = 15 aligned short4 tiles (5 rows × {lx, gx, rx} columns) and uses
// shufflevector to synthesise the four extra diagonal columns per row (shift-left-2, shift-
// left-1, shift-right-1, shift-right-2), plus the center-row shifts for the last 4 diagonals.
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blf2DImage5x5S16(
//     %params*        %0,    // params struct (7 fields, see !18)
//     <2 x i32>       %1,    // thread_position_in_grid   (gx, gy)
//     <4 x i16>*      %2,    // input   (read)
//     <4 x i16>*      %3     // output  (write)
//   )
//
// Params struct layout (!18 — same shape as the 3x3 variant):
//   i32   m_width         @0    → %16
//   i32   m_height        @4    → %18
//   i32   m_inputStride   @8    → %20
//   i32   m_outputStride  @12   → %22
//   float m_sigma         @16   → %24 (splatted via %125/%126)
//   uint  m_globalWidth   @20   → %7   (bound check on gx)
//   uint  m_globalHeight  @24   → %12  (bound check on gy)
//
// Mirror-clamped neighbour indices (%25-%44 in the .ll):
//   lx = max(gx-1, 0)                                                  // %25, %31/%32 select
//   rx = min(gx+1, m_width-1)                                          // %26, %33/%35 select
//   ty2 = max(gy-2, 0)                                                 // %27, %38/%39 select
//   ty  = max(gy-1, 0)                                                 // %28, %36/%37 select
//   by  = min(gy+1, m_height-1)                                        // %29, %41/%42 select
//   by2 = min(gy+2, m_height-1)                                        // %30, %43/%44 select
// (The 3×3 kernel only had ty/by; the 5×5 adds ty2/by2 for the outer two rows.)
//
// 15 direct short4 loads (rows R0..R4 × cols {lx, gx, rx}), each converted to <4 x float>
// via `air.convert.f.v4f32.s.v4i16`:
//   R0 (row ty2):  %50 = f(input[stride*ty2 + lx])                     // %49 load
//                  %55 = f(input[stride*ty2 + gx])                     // %54 load
//                  %60 = f(input[stride*ty2 + rx])                     // %59 load
//   R1 (row ty):   %66 = f(input[stride*ty  + lx])                     // %65 load
//                  %71 = f(input[stride*ty  + gx])                     // %70 load
//                  %76 = f(input[stride*ty  + rx])                     // %75 load
//   R2 (row gy):   %82 = f(input[stride*gy  + lx])                     // %81 load
//                  %87 = f(input[stride*gy  + gx])                     // %86 load  ← CENTER
//                  %92 = f(input[stride*gy  + rx])                     // %91 load
//   R3 (row by):   %98  = f(input[stride*by  + lx])                    // %97  load
//                  %103 = f(input[stride*by  + gx])                    // %102 load
//                  %108 = f(input[stride*by  + rx])                    // %107 load
//   R4 (row by2):  %114 = f(input[stride*by2 + lx])                    // %113 load
//                  %119 = f(input[stride*by2 + gx])                    // %118 load
//                  %124 = f(input[stride*by2 + rx])                    // %123 load
// where `stride = m_inputStride` (%20).
//
// SIGMA splat (%125 → %126): scalar float m_sigma → <s, s, s, s>.
//
// The 5×5 kernel accumulates 24 neighbours (the center pixel is added once as the initial
// accumulator via the first fmuladd's C argument). It processes them in 6 groups of 4:
//
// GROUP 1 — the four "same-column" vertical neighbours R0/R1/R3/R4 col=gx (%127-%150).
//   Uses direct-loaded %55, %71, %103, %119. First fmuladd's C = %87 (CENTER) and the initial
//   weight-sum uses the constant <1,1,1,1> for the center's implicit weight.
//     %127 = %87 - %55                                                 // fsub CC - R0_c
//     %128 = %87 - %71                                                 // fsub CC - R1_c
//     %129 = %87 - %103                                                // fsub CC - R3_c
//     %130 = %87 - %119                                                // fsub CC - R4_c
//     w0 = exp2(sigma * d0^2)   (%133 from %132 = %126*%131=%126*d0^2) // via %131/%132/%133
//     w1 = exp2(sigma * d1^2)                                          // %134/%135/%136
//     w2 = exp2(sigma * d2^2)                                          // %137/%138/%139
//     w3 = exp2(sigma * d3^2)                                          // %140/%141/%142
//     %143 = fmuladd(%55,  w0, %87)                                    // running sum init
//     %144 = w0 + <1,1,1,1>                                            // running wsum init
//     %145 = fmuladd(%71,  w1, %143) ; %146 = %144 + w1
//     %147 = fmuladd(%103, w2, %145) ; %148 = %146 + w2
//     %149 = fmuladd(%119, w3, %147) ; %150 = %148 + w3
//
// GROUP 2 — shifted-left-by-2 columns for R0/R1/R3/R4 (%151-%186).
//   The shift-left-by-2 lane is `(a[2], a[3], b[0], b[1])` where a = col-lx tile, b = col-gx tile.
//     %151 = shuffle(%50) → <a[2], a[3]>            (v2f)              // R0 lx lanes 2,3
//     %152 = extend %151 to <4 x float> (lanes 0,1 valid; 2,3 undef)
//     %153 = shuffle(%152, %55) with mask <0,1,4,5> → (a[2], a[3], b[0], b[1])  // R0 shift-L2
//     %154..%156 → R1 shift-L2 = (%66[2], %66[3], %71[0], %71[1])
//     %157..%159 → R3 shift-L2 = (%98[2], %98[3], %103[0], %103[1])
//     %160..%162 → R4 shift-L2 = (%114[2], %114[3], %119[0], %119[1])
//     d = CC - shift-L2 ; w = exp2(sigma * d^2) ; fmuladd/fadd extend the running accum.
//   Result: sum @%185, wsum @%186 after 4 fmuladds/fadds (%179-%186).
//
// GROUP 3 — shifted-left-by-1 columns for R0/R1/R3/R4 (%187-%218).
//   Lane pattern `(a[3], b[0], b[1], b[2])` — used mask <0,4,5,6>.
//     %187 = shuffle(%50)  → (a[3], undef, undef, undef)               // R0 lx lane 3 into slot 0
//     %188 = shuffle(%187, %55) with mask <0,4,5,6> → (a[3], b[0], b[1], b[2])
//     %189..%190 → R1 shift-L1
//     %191..%192 → R3 shift-L1
//     %193..%194 → R4 shift-L1
//   sum @%217, wsum @%218 after 4 fmuladds/fadds (%211-%218).
//
// GROUP 4 — shifted-right-by-1 columns for R0/R1/R3/R4 (%219-%254).
//   Lane pattern `(a[1], a[2], a[3], b[0])` — mask uses lanes 1,2,3 of a extended, then lane 0 of b.
//     %219 = shuffle(%55) → <a[1], a[2], a[3]>          (v3f)          // R0 gx lanes 1,2,3
//     %220 = extend %219 to <4 x float>
//     %221 = shuffle(%220, %60) with mask <0,1,2,4>  → (a[1], a[2], a[3], b[0])   // R0 shift-R1
//     %222..%224 → R1 shift-R1 = (%71[1], %71[2], %71[3], %76[0])
//     %225..%227 → R3 shift-R1 = (%103[1], %103[2], %103[3], %108[0])
//     %228..%230 → R4 shift-R1 = (%119[1], %119[2], %119[3], %124[0])
//   sum @%253, wsum @%254 after 4 fmuladds/fadds (%247-%254).
//
// GROUP 5 — shifted-right-by-2 columns for R0/R1/R3/R4 (%255-%290).
//   Lane pattern `(a[2], a[3], b[0], b[1])` — same shape as Group 2, but "a" is the gx tile and
//   "b" is the rx tile (so this is a symmetric right-shift).
//     %255..%257 → R0 shift-R2 = (%55[2], %55[3], %60[0], %60[1])
//     %258..%260 → R1 shift-R2
//     %261..%263 → R3 shift-R2
//     %264..%266 → R4 shift-R2
//   sum @%289, wsum @%290 after 4 fmuladds/fadds (%283-%290).
//
// GROUP 6 — the center-row (R2) 4 diagonals (%291-%325).
//   These are the four neighbours around the center within row R2 — 2 to the left and 2 to
//   the right of CC — using the R2 tiles (%82=lx, %87=gx, %92=rx). CC itself (%87 slot=(gx))
//   is NOT re-added; it was already the initial accum.
//     %291..%293 → CC shift-L2 = (%82[2], %82[3], %87[0], %87[1])       // slot pattern (a[2],a[3],b[0],b[1])
//     %294..%295 → CC shift-L1 = (%82[3], %87[0], %87[1], %87[2])       // slot pattern (a[3],b[0],b[1],b[2])
//     %296..%298 → CC shift-R1 = (%87[1], %87[2], %87[3], %92[0])       // slot pattern (a[1],a[2],a[3],b[0])
//     %299..%301 → CC shift-R2 = (%87[2], %87[3], %92[0], %92[1])       // slot pattern (a[2],a[3],b[0],b[1])
//   sum @%324, wsum @%325 after 4 fmuladds/fadds (%318-%325).
//
// FINAL NORMALISE + STORE (%326-%334):
//   %326 = %324 / %325                                  // sum / wsum   → fdiv
//   %327 = %326 + <0.5, 0.5, 0.5, 0.5>                  // bias for round-to-nearest-via-floor
//   %328 = air.floor(%327)                              // → floor(avg + 0.5)
//   %329 = air.clamp(%328, <-32768,...>, <32767,...>)   // clamp to int16 range
//   %330 = air.convert.s.v4i16(%329)                    // f32 → i16 lanes
//   output[m_outputStride * gy + gx] = %330             // store  (%331..%334)
//
// Constants decoded from the IR (all lanes-splatted, i.e. <c, c, c, c>):
//   <float 1.000000e+00>     — the constant added to weight-sum on the very first accum step
//                              (%144 = w0 + <1,1,1,1>), representing the center's own weight.
//   <float 5.000000e-01>     — 0.5 added before floor (%327).
//   <float -3.276800e+04>    — -32768.0 (INT16_MIN) low  clamp (%329).
//   <float  3.276700e+04>    —  32767.0 (INT16_MAX) high clamp (%329).
//
// NOTE on `llvm.fmuladd`: same rule as the 3×3 sibling — the module sets `!12 =
// !"air.compile.fast_math_disable"`, so we use the strict unfused `a*b + c` semantics.
//
// NOTE on `air.convert.f.v4f32.s.v4i16` / `air.convert.s.v4i16.f.v4f32`: these are the AIR
// int16↔float32 convert intrinsics. In TS the int16 lanes are ordinary numbers already in
// the int16 range, so the "convert to f32" is a pass-through (with fp32 narrowing) and the
// "convert to i16" is `x | 0` after clamping — the IR precomputed the clamp for us via
// air.clamp.

/** RGBA float pixel — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];
/** Short4 pixel — matches `<4 x i16>` lane order (int16-valued numbers). */
export type Short4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params` used by !18. */
export interface Blf2DImage5x5S16Params {
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

/** `air.exp2.v4f32` — vectorised 2**x, per lane, fp32. */
function exp2v4(v: Vec4): Vec4 {
  return [
    f(2 ** v[0]),
    f(2 ** v[1]),
    f(2 ** v[2]),
    f(2 ** v[3]),
  ] as const;
}

/** `air.floor.v4f32` — vectorised floor, per lane, fp32. */
function floorv4(v: Vec4): Vec4 {
  return [
    Math.floor(v[0]),
    Math.floor(v[1]),
    Math.floor(v[2]),
    Math.floor(v[3]),
  ] as const;
}

/** `air.clamp.v4f32` — vectorised clamp, per lane, fp32. */
function clampv4(v: Vec4, lo: Vec4, hi: Vec4): Vec4 {
  return [
    f(Math.min(Math.max(v[0], lo[0]), hi[0])),
    f(Math.min(Math.max(v[1], lo[1]), hi[1])),
    f(Math.min(Math.max(v[2], lo[2]), hi[2])),
    f(Math.min(Math.max(v[3], lo[3]), hi[3])),
  ] as const;
}

/** `fsub <4 x float>` — per-lane fp32 subtract. */
function fsubv4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] - b[0]), f(a[1] - b[1]), f(a[2] - b[2]), f(a[3] - b[3])] as const;
}

/** `fmul <4 x float>` — per-lane fp32 multiply. */
function fmulv4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] * b[0]), f(a[1] * b[1]), f(a[2] * b[2]), f(a[3] * b[3])] as const;
}

/** `fadd <4 x float>` — per-lane fp32 add. */
function faddv4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] + b[0]), f(a[1] + b[1]), f(a[2] + b[2]), f(a[3] + b[3])] as const;
}

/** `llvm.fmuladd.v4f32` — strict unfused a*b + c under `fast_math_disable`. */
function fmuladdv4(a: Vec4, b: Vec4, c: Vec4): Vec4 {
  return [
    f(a[0] * b[0] + c[0]),
    f(a[1] * b[1] + c[1]),
    f(a[2] * b[2] + c[2]),
    f(a[3] * b[3] + c[3]),
  ] as const;
}

/**
 * Convert a `<4 x i16>` (short4) tile to `<4 x float>` — `air.convert.f.v4f32.s.v4i16`.
 * The int16 lanes are already in-range JS numbers; the AIR intrinsic sign-extends before
 * converting to fp32, which we mirror by fp32-narrowing after a pass-through.
 */
function s16ToF32v4(v: Short4): Vec4 {
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])] as const;
}

/**
 * Convert `<4 x float>` → `<4 x i16>` via `air.convert.s.v4i16.f.v4f32`. The IR precedes this
 * with a clamp to [-32768, 32767]; here we still truncate-toward-zero (matches Metal's
 * documented rounding for float→int conversions when the value has already been floored).
 */
function f32ToS16v4(v: Vec4): Short4 {
  return [v[0] | 0, v[1] | 0, v[2] | 0, v[3] | 0] as const;
}

/**
 * bm3dnr_buf::bm3dnr_buf_blf2DImage5x5S16 — direct TS mapping of the AIR body.
 *
 * See the file header for the full IR→TS mapping. Every SSA value in the .ll is cited by the
 * `// %N` tag on its producing statement below.
 */
export function bm3dnr_buf__bm3dnr_buf_blf2DImage5x5S16(
  params: Blf2DImage5x5S16Params,             // %0
  gridPos: readonly [number, number],         // %1 (gx, gy)
  input: readonly Short4[],                    // %2 <4 x i16>* (read)
  output: Short4[],                            // %3 <4 x i16>* (write)
): void {
  const gx = gridPos[0] | 0;                   // %5
  const gy = gridPos[1] | 0;                   // %10

  // Bounds checks — %8 / %13 (icmp ult) — early-return to the shared %335 exit.
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %8
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %13

  const width        = params.width        | 0; // %16
  const height       = params.height       | 0; // %18
  const inputStride  = params.inputStride  | 0; // %20
  const outputStride = params.outputStride | 0; // %22
  const sigmaScalar  = f(params.sigma);         // %24 (float)

  // ── Mirror-clamped neighbour indices (%25-%44) ─────────────────────────────
  const gxm1 = (gx - 1) | 0;                   // %25
  const gxp1 = (gx + 1) | 0;                   // %26
  const gym2 = (gy - 2) | 0;                   // %27
  const gym1 = (gy - 1) | 0;                   // %28
  const gyp1 = (gy + 1) | 0;                   // %29
  const gyp2 = (gy + 2) | 0;                   // %30
  const lx   = gxm1 > 0 ? gxm1 : 0;                                     // %31 → %32
  const rx   = gxp1 < width  ? gxp1 : ((width  - 1) | 0);               // %33 → %35 (via %34 = width-1)
  const ty   = gym1 > 0 ? gym1 : 0;                                     // %36 → %37
  const ty2  = gym2 > 0 ? gym2 : 0;                                     // %38 → %39
  const by   = gyp1 < height ? gyp1 : ((height - 1) | 0);               // %41 → %42 (via %40 = height-1)
  const by2  = gyp2 < height ? gyp2 : ((height - 1) | 0);               // %43 → %44

  // ── 15 direct short4 loads, converted to <4 x float> ───────────────────────
  // Row R0 (y = ty2):  base = inputStride * ty2                        // %45
  const baseR0 = (inputStride * ty2) | 0;
  const r0_lx = s16ToF32v4(input[(baseR0 + lx) | 0]);                   // %49 → %50
  const r0_gx = s16ToF32v4(input[(baseR0 + gx) | 0]);                   // %54 → %55
  const r0_rx = s16ToF32v4(input[(baseR0 + rx) | 0]);                   // %59 → %60
  // Row R1 (y = ty):   base = inputStride * ty                         // %61
  const baseR1 = (inputStride * ty) | 0;
  const r1_lx = s16ToF32v4(input[(baseR1 + lx) | 0]);                   // %65 → %66
  const r1_gx = s16ToF32v4(input[(baseR1 + gx) | 0]);                   // %70 → %71
  const r1_rx = s16ToF32v4(input[(baseR1 + rx) | 0]);                   // %75 → %76
  // Row R2 (y = gy):   base = inputStride * gy                         // %77
  const baseR2 = (inputStride * gy) | 0;
  const r2_lx = s16ToF32v4(input[(baseR2 + lx) | 0]);                   // %81 → %82
  const CC    = s16ToF32v4(input[(baseR2 + gx) | 0]);                   // %86 → %87  ← CENTER
  const r2_rx = s16ToF32v4(input[(baseR2 + rx) | 0]);                   // %91 → %92
  // Row R3 (y = by):   base = inputStride * by                         // %93
  const baseR3 = (inputStride * by) | 0;
  const r3_lx = s16ToF32v4(input[(baseR3 + lx) | 0]);                   // %97  → %98
  const r3_gx = s16ToF32v4(input[(baseR3 + gx) | 0]);                   // %102 → %103
  const r3_rx = s16ToF32v4(input[(baseR3 + rx) | 0]);                   // %107 → %108
  // Row R4 (y = by2):  base = inputStride * by2                        // %109
  const baseR4 = (inputStride * by2) | 0;
  const r4_lx = s16ToF32v4(input[(baseR4 + lx) | 0]);                   // %113 → %114
  const r4_gx = s16ToF32v4(input[(baseR4 + gx) | 0]);                   // %118 → %119
  const r4_rx = s16ToF32v4(input[(baseR4 + rx) | 0]);                   // %123 → %124

  // SIGMA splat (%125 → %126) — <s, s, s, s>.
  const sigma: Vec4 = [sigmaScalar, sigmaScalar, sigmaScalar, sigmaScalar];

  // Per-lane exp2(sigma * d^2) weight helper, mirroring the IR: fmul d,d → fmul sigma,dd → exp2.
  const weight = (d: Vec4): Vec4 => exp2v4(fmulv4(sigma, fmulv4(d, d)));

  // ── GROUP 1 — same-column vertical neighbours R0/R1/R3/R4 col=gx (%127-%150) ──
  const d1_0 = fsubv4(CC, r0_gx);                                       // %127
  const d1_1 = fsubv4(CC, r1_gx);                                       // %128
  const d1_2 = fsubv4(CC, r3_gx);                                       // %129
  const d1_3 = fsubv4(CC, r4_gx);                                       // %130
  const w1_0 = weight(d1_0);                                            // %133
  const w1_1 = weight(d1_1);                                            // %136
  const w1_2 = weight(d1_2);                                            // %139
  const w1_3 = weight(d1_3);                                            // %142
  let sum  = fmuladdv4(r0_gx, w1_0, CC);                                // %143
  let wsum = faddv4(w1_0, [f(1), f(1), f(1), f(1)]);                    // %144
  sum  = fmuladdv4(r1_gx, w1_1, sum);                                   // %145
  wsum = faddv4(wsum, w1_1);                                            // %146
  sum  = fmuladdv4(r3_gx, w1_2, sum);                                   // %147
  wsum = faddv4(wsum, w1_2);                                            // %148
  sum  = fmuladdv4(r4_gx, w1_3, sum);                                   // %149
  wsum = faddv4(wsum, w1_3);                                            // %150

  // ── GROUP 2 — shift-left-by-2 columns for R0/R1/R3/R4 (%151-%186) ─────────
  //   pattern (a[2], a[3], b[0], b[1])  where a = row's lx tile, b = row's gx tile.
  const shiftL2 = (a: Vec4, b: Vec4): Vec4 =>
    [a[2], a[3], b[0], b[1]] as const;                                  // masks <0,1,4,5>
  const g2_0 = shiftL2(r0_lx, r0_gx);                                   // %153
  const g2_1 = shiftL2(r1_lx, r1_gx);                                   // %156
  const g2_2 = shiftL2(r3_lx, r3_gx);                                   // %159
  const g2_3 = shiftL2(r4_lx, r4_gx);                                   // %162
  const d2_0 = fsubv4(CC, g2_0);                                        // %163
  const d2_1 = fsubv4(CC, g2_1);                                        // %164
  const d2_2 = fsubv4(CC, g2_2);                                        // %165
  const d2_3 = fsubv4(CC, g2_3);                                        // %166
  const w2_0 = weight(d2_0);                                            // %169
  const w2_1 = weight(d2_1);                                            // %172
  const w2_2 = weight(d2_2);                                            // %175
  const w2_3 = weight(d2_3);                                            // %178
  sum  = fmuladdv4(g2_0, w2_0, sum);                                    // %179
  wsum = faddv4(wsum, w2_0);                                            // %180
  sum  = fmuladdv4(g2_1, w2_1, sum);                                    // %181
  wsum = faddv4(wsum, w2_1);                                            // %182
  sum  = fmuladdv4(g2_2, w2_2, sum);                                    // %183
  wsum = faddv4(wsum, w2_2);                                            // %184
  sum  = fmuladdv4(g2_3, w2_3, sum);                                    // %185
  wsum = faddv4(wsum, w2_3);                                            // %186

  // ── GROUP 3 — shift-left-by-1 columns for R0/R1/R3/R4 (%187-%218) ─────────
  //   pattern (a[3], b[0], b[1], b[2])
  const shiftL1 = (a: Vec4, b: Vec4): Vec4 =>
    [a[3], b[0], b[1], b[2]] as const;                                  // mask <0,4,5,6>
  const g3_0 = shiftL1(r0_lx, r0_gx);                                   // %188
  const g3_1 = shiftL1(r1_lx, r1_gx);                                   // %190
  const g3_2 = shiftL1(r3_lx, r3_gx);                                   // %192
  const g3_3 = shiftL1(r4_lx, r4_gx);                                   // %194
  const d3_0 = fsubv4(CC, g3_0);                                        // %195
  const d3_1 = fsubv4(CC, g3_1);                                        // %196
  const d3_2 = fsubv4(CC, g3_2);                                        // %197
  const d3_3 = fsubv4(CC, g3_3);                                        // %198
  const w3_0 = weight(d3_0);                                            // %201
  const w3_1 = weight(d3_1);                                            // %204
  const w3_2 = weight(d3_2);                                            // %207
  const w3_3 = weight(d3_3);                                            // %210
  sum  = fmuladdv4(g3_0, w3_0, sum);                                    // %211
  wsum = faddv4(wsum, w3_0);                                            // %212
  sum  = fmuladdv4(g3_1, w3_1, sum);                                    // %213
  wsum = faddv4(wsum, w3_1);                                            // %214
  sum  = fmuladdv4(g3_2, w3_2, sum);                                    // %215
  wsum = faddv4(wsum, w3_2);                                            // %216
  sum  = fmuladdv4(g3_3, w3_3, sum);                                    // %217
  wsum = faddv4(wsum, w3_3);                                            // %218

  // ── GROUP 4 — shift-right-by-1 columns for R0/R1/R3/R4 (%219-%254) ────────
  //   pattern (a[1], a[2], a[3], b[0])  where a = row's gx tile, b = row's rx tile.
  const shiftR1 = (a: Vec4, b: Vec4): Vec4 =>
    [a[1], a[2], a[3], b[0]] as const;                                  // mask <0,1,2,4>
  const g4_0 = shiftR1(r0_gx, r0_rx);                                   // %221
  const g4_1 = shiftR1(r1_gx, r1_rx);                                   // %224
  const g4_2 = shiftR1(r3_gx, r3_rx);                                   // %227
  const g4_3 = shiftR1(r4_gx, r4_rx);                                   // %230
  const d4_0 = fsubv4(CC, g4_0);                                        // %231
  const d4_1 = fsubv4(CC, g4_1);                                        // %232
  const d4_2 = fsubv4(CC, g4_2);                                        // %233
  const d4_3 = fsubv4(CC, g4_3);                                        // %234
  const w4_0 = weight(d4_0);                                            // %237
  const w4_1 = weight(d4_1);                                            // %240
  const w4_2 = weight(d4_2);                                            // %243
  const w4_3 = weight(d4_3);                                            // %246
  sum  = fmuladdv4(g4_0, w4_0, sum);                                    // %247
  wsum = faddv4(wsum, w4_0);                                            // %248
  sum  = fmuladdv4(g4_1, w4_1, sum);                                    // %249
  wsum = faddv4(wsum, w4_1);                                            // %250
  sum  = fmuladdv4(g4_2, w4_2, sum);                                    // %251
  wsum = faddv4(wsum, w4_2);                                            // %252
  sum  = fmuladdv4(g4_3, w4_3, sum);                                    // %253
  wsum = faddv4(wsum, w4_3);                                            // %254

  // ── GROUP 5 — shift-right-by-2 columns for R0/R1/R3/R4 (%255-%290) ────────
  //   pattern (a[2], a[3], b[0], b[1])  where a = row's gx tile, b = row's rx tile.
  const g5_0 = shiftL2(r0_gx, r0_rx);                                   // %257 (same mask shape as G2)
  const g5_1 = shiftL2(r1_gx, r1_rx);                                   // %260
  const g5_2 = shiftL2(r3_gx, r3_rx);                                   // %263
  const g5_3 = shiftL2(r4_gx, r4_rx);                                   // %266
  const d5_0 = fsubv4(CC, g5_0);                                        // %267
  const d5_1 = fsubv4(CC, g5_1);                                        // %268
  const d5_2 = fsubv4(CC, g5_2);                                        // %269
  const d5_3 = fsubv4(CC, g5_3);                                        // %270
  const w5_0 = weight(d5_0);                                            // %273
  const w5_1 = weight(d5_1);                                            // %276
  const w5_2 = weight(d5_2);                                            // %279
  const w5_3 = weight(d5_3);                                            // %282
  sum  = fmuladdv4(g5_0, w5_0, sum);                                    // %283
  wsum = faddv4(wsum, w5_0);                                            // %284
  sum  = fmuladdv4(g5_1, w5_1, sum);                                    // %285
  wsum = faddv4(wsum, w5_1);                                            // %286
  sum  = fmuladdv4(g5_2, w5_2, sum);                                    // %287
  wsum = faddv4(wsum, w5_2);                                            // %288
  sum  = fmuladdv4(g5_3, w5_3, sum);                                    // %289
  wsum = faddv4(wsum, w5_3);                                            // %290

  // ── GROUP 6 — center-row (R2) 4 diagonals (%291-%325) ─────────────────────
  //   left-2 via (r2_lx, CC) with pattern (a[2],a[3],b[0],b[1])         → %293
  //   left-1 via (r2_lx, CC) with pattern (a[3],b[0],b[1],b[2])         → %295
  //   right-1 via (CC, r2_rx) with pattern (a[1],a[2],a[3],b[0])        → %298
  //   right-2 via (CC, r2_rx) with pattern (a[2],a[3],b[0],b[1])        → %301
  const g6_L2 = shiftL2(r2_lx, CC);                                     // %293
  const g6_L1 = shiftL1(r2_lx, CC);                                     // %295
  const g6_R1 = shiftR1(CC,    r2_rx);                                  // %298
  const g6_R2 = shiftL2(CC,    r2_rx);                                  // %301
  const d6_0 = fsubv4(CC, g6_L2);                                       // %302
  const d6_1 = fsubv4(CC, g6_L1);                                       // %303
  const d6_2 = fsubv4(CC, g6_R1);                                       // %304
  const d6_3 = fsubv4(CC, g6_R2);                                       // %305
  const w6_0 = weight(d6_0);                                            // %308
  const w6_1 = weight(d6_1);                                            // %311
  const w6_2 = weight(d6_2);                                            // %314
  const w6_3 = weight(d6_3);                                            // %317
  sum  = fmuladdv4(g6_L2, w6_0, sum);                                   // %318
  wsum = faddv4(wsum, w6_0);                                            // %319
  sum  = fmuladdv4(g6_L1, w6_1, sum);                                   // %320
  wsum = faddv4(wsum, w6_1);                                            // %321
  sum  = fmuladdv4(g6_R1, w6_2, sum);                                   // %322
  wsum = faddv4(wsum, w6_2);                                            // %323
  sum  = fmuladdv4(g6_R2, w6_3, sum);                                   // %324
  wsum = faddv4(wsum, w6_3);                                            // %325

  // ── FINAL NORMALISE + STORE (%326-%334) ───────────────────────────────────
  // %326  avg   = sum / wsum
  const avg: Vec4 = [
    f(sum[0] / wsum[0]),
    f(sum[1] / wsum[1]),
    f(sum[2] / wsum[2]),
    f(sum[3] / wsum[3]),
  ];
  // %327  avg  += 0.5
  const biased = faddv4(avg, [f(0.5), f(0.5), f(0.5), f(0.5)]);
  // %328  avg   = floor(avg)
  const floored = floorv4(biased);
  // %329  avg   = clamp(avg, -32768, 32767)
  const clamped = clampv4(
    floored,
    [f(-32768), f(-32768), f(-32768), f(-32768)],
    [f( 32767), f( 32767), f( 32767), f( 32767)],
  );
  // %330  out   = convert.s.v4i16(avg)
  const outPixel = f32ToS16v4(clamped);
  // %331..%334  output[outputStride * gy + gx] = out
  const outIdx = ((outputStride * gy) + gx) | 0;
  output[outIdx] = outPixel;
}
