// bm3dnr_buf__bm3dnr_buf_blf2DImage5x5U16b.ts — direct TS mapping of the
// Metal compute kernel `bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U16b` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U16b (HeliumSenso)
// IR provenance: raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blf2DImage5x5U16b.ll
// (header line: `0x0000000001e75d -- bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U16b`)
//
// A 5×5 bilateral filter for uint16 (ushort4) images. Each thread `(gx, gy)`
// reads a 5×5 neighbourhood centred on itself, converts each unsigned lane
// to f32, computes exp2(sigma * (center - neighbour)^2) weights per lane,
// and writes the weighted average back as `<4 x i16>` (unsigned lanes)
// at output[strideOut*gy + gx].
//
// This is the 5×5 counterpart of `bm3dnr_buf_blf2DImage3x3U16b` — same
// bilateral shape, but the taps span 5 rows × 5 columns (25 taps).
//
// Signature (%N naming from the .ll):
//   void @bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U16b(
//     %params*        %0,    // params struct (7 fields, see below)
//     <2 x i32>       %1,    // thread_position_in_grid   (gx, gy)
//     <4 x i16>*      %2,    // input   (read)
//     <4 x i16>*      %3     // output  (write)
//   )
//
// Params struct layout (from !18 in the .ll — note the type is spelled
// `bm3dnr_buf::bm3dnr_buf_blf2DImage3x3S16_params` in the IR but the
// !air.arg_type_name at !17 correctly names it `blf2DImage5x5U16b_params`):
//   i32   m_width         @0    → %16
//   i32   m_height        @4    → %18
//   i32   m_inputStride   @8    → %20
//   i32   m_outputStride  @12   → %22
//   float m_sigma         @16   → %24  (splatted to vec4 as %125 → %126)
//   uint  m_globalWidth   @20   → %7   (bound check on gx, %8)
//   uint  m_globalHeight  @24   → %12  (bound check on gy, %13)
//
// -----------------------------------------------------------------------------
// Neighbour indexing (mirror-clamped, from %25..%44):
//   x-neighbours: xL = max(gx-1, 0)         // %25/%31/%32 select
//                 xR = min(gx+1, m_width-1) // %26/%33/%35 select
//   y-neighbours: yTT = max(gy-2, 0)        // %27/%38/%39 select
//                 yT  = max(gy-1, 0)        // %28/%36/%37 select
//                 yB  = min(gy+1, m_height-1) // %29/%41/%42 select
//                 yBB = min(gy+2, m_height-1) // %30/%43/%44 select
//
// -----------------------------------------------------------------------------
// The 15 vec4 loads (5 rows × 3 columns of vec4s, each vec4 = 4 output
// pixels along x). Each load goes through `air.convert.f.v4f32.u.v4i16`
// (unsigned i16 → f32). Row base = m_inputStride * yRow:
//     TT_L = f(input[stride*yTT + xL])    // %49 → %50
//     TT_C = f(input[stride*yTT + gx])    // %54 → %55
//     TT_R = f(input[stride*yTT + xR])    // %59 → %60
//     T_L  = f(input[stride*yT  + xL])    // %65 → %66
//     T_C  = f(input[stride*yT  + gx])    // %70 → %71
//     T_R  = f(input[stride*yT  + xR])    // %75 → %76
//     C_L  = f(input[stride*gy  + xL])    // %81 → %82
//     CC   = f(input[stride*gy  + gx])    // %86 → %87   — the centre
//     C_R  = f(input[stride*gy  + xR])    // %91 → %92
//     B_L  = f(input[stride*yB  + xL])    // %97 → %98
//     B_C  = f(input[stride*yB  + gx])    // %102 → %103
//     B_R  = f(input[stride*yB  + xR])    // %107 → %108
//     BB_L = f(input[stride*yBB + xL])    // %113 → %114
//     BB_C = f(input[stride*yBB + gx])    // %118 → %119
//     BB_R = f(input[stride*yBB + xR])    // %123 → %124
//
// SIGMA splat (%125 → %126): scalar float m_sigma → <s, s, s, s>.
//
// -----------------------------------------------------------------------------
// The 25 taps of the 5×5 window are computed in 6 stages. Every stage:
//    d      = CC - N
//    w      = exp2(sigma * d^2)         // per-lane
//    sum   := fmuladd(N, w, sum)         // sum += N * w
//    wsum  := wsum + w
// The initial (sum, wsum) is (CC, 1.0)  — the centre tap contributes
// itself with unit weight (see %143/%144).
//
// Stage 1 — CENTRE COLUMN (4 vertical neighbours: TT_C, T_C, B_C, BB_C)
//   [see %127..%150]
//   d1 = CC - TT_C   // %127         d2 = CC - T_C    // %128
//   d3 = CC - B_C    // %129         d4 = CC - BB_C   // %130
//   sum₀ = fmuladd(TT_C, w1, CC)   wsum₀ = w1 + <1,1,1,1>    (%143, %144)
//   sum₁ = fmuladd(T_C,  w2, sum₀) wsum₁ = wsum₀ + w2       (%145, %146)
//   sum₂ = fmuladd(B_C,  w3, sum₁) wsum₂ = wsum₁ + w3       (%147, %148)
//   sum₃ = fmuladd(BB_C, w4, sum₂) wsum₃ = wsum₂ + w4       (%149, %150)
//
// Stage 2 — HORIZONTAL SHIFT -2 (col-2) on TT/T/B/BB rows via
//   pair(L,C) shufflevector <0,1,4,5> after taking lanes <2,3> of L:
//     TT_LL = <TT_L[2], TT_L[3], TT_C[0], TT_C[1]>   (%151..%153)
//     T_LL  = <T_L[2],  T_L[3],  T_C[0],  T_C[1]>    (%154..%156)
//     B_LL  = <B_L[2],  B_L[3],  B_C[0],  B_C[1]>    (%157..%159)
//     BB_LL = <BB_L[2], BB_L[3], BB_C[0], BB_C[1]>   (%160..%162)
//   Adds 4 taps (offset -2 in each of TT/T/B/BB rows). Weights and
//   fmuladds in %163..%186.
//
// Stage 3 — HORIZONTAL SHIFT -1 (col-1) on TT/T/B/BB rows via
//   pair(L,C) shufflevector <0,4,5,6> after taking lane 3 of L:
//     TT_LC = <TT_L[3], TT_C[0], TT_C[1], TT_C[2]>   (%187, %188)
//     T_LC  = <T_L[3],  T_C[0],  T_C[1],  T_C[2]>    (%189, %190)
//     B_LC  = <B_L[3],  B_C[0],  B_C[1],  B_C[2]>    (%191, %192)
//     BB_LC = <BB_L[3], BB_C[0], BB_C[1], BB_C[2]>   (%193, %194)
//   Weights + fmuladds in %195..%218.
//
// Stage 4 — HORIZONTAL SHIFT +1 (col+1) on TT/T/B/BB rows via
//   pair(C,R) shufflevector <0,1,2,4> after taking lanes 1..3 of C:
//     TT_RC = <TT_C[1], TT_C[2], TT_C[3], TT_R[0]>   (%219..%221)
//     T_RC  = <T_C[1],  T_C[2],  T_C[3],  T_R[0]>    (%222..%224)
//     B_RC  = <B_C[1],  B_C[2],  B_C[3],  B_R[0]>    (%225..%227)
//     BB_RC = <BB_C[1], BB_C[2], BB_C[3], BB_R[0]>   (%228..%230)
//   Weights + fmuladds in %231..%254.
//
// Stage 5 — HORIZONTAL SHIFT +2 (col+2) on TT/T/B/BB rows via
//   pair(C,R) shufflevector <0,1,4,5> after taking lanes 2,3 of C:
//     TT_RR = <TT_C[2], TT_C[3], TT_R[0], TT_R[1]>   (%255..%257)
//     T_RR  = <T_C[2],  T_C[3],  T_R[0],  T_R[1]>    (%258..%260)
//     B_RR  = <B_C[2],  B_C[3],  B_R[0],  B_R[1]>    (%261..%263)
//     BB_RR = <BB_C[2], BB_C[3], BB_R[0], BB_R[1]>   (%264..%266)
//   Weights + fmuladds in %267..%290.
//
// Stage 6 — CENTRE ROW's 4 horizontal shifted taps (offsets ±1, ±2):
//   Uses pair(C_L, CC) for the leftward shifts and pair(CC, C_R) for the
//   rightward shifts (i.e. %82/%87 and %87/%92):
//     CC_LL = <C_L[2], C_L[3], CC[0],  CC[1]>        (%291..%293)  // shift -2
//     CC_LC = <C_L[3], CC[0],  CC[1],  CC[2]>        (%294, %295)  // shift -1
//     CC_RC = <CC[1],  CC[2],  CC[3],  C_R[0]>       (%296..%298)  // shift +1
//     CC_RR = <CC[2],  CC[3],  C_R[0], C_R[1]>       (%299..%301)  // shift +2
//   Weights + fmuladds in %302..%325.
//
// Total taps: 5 (centre column) + 4×4 (TT/T/B/BB rows × 4 shifted cols)
//              + 4 (centre row ±1/±2)   =   5 + 16 + 4  =  25 ✓
//
// -----------------------------------------------------------------------------
// Finalise (%326..%329):
//   avg   = sum₂₄ / wsum₂₄                                            // %326
//   avg   = avg + <0.5, 0.5, 0.5, 0.5>                                // %327
//   avg   = air.clamp(avg, <0,0,0,0>, <65535,65535,65535,65535>)      // %328
//   out   = air.convert.u.v4i16.f.v4f32(avg)                          // %329
//   output[m_outputStride * gy + gx] = out                            // %330..%333
//
// Constants (decoded from the IR):
//   <float 1.000000e+00, ...>       — 1.0 splat added to weight-sum (%144)
//   <float 5.000000e-01, ...>       — 0.5 splat added before clamp (%327)
//   <float 0.000000e+00, ...>       — zeroinitializer lower bound (%328)
//   <float 6.553500e+04, ...>       — 65535.0 (UINT16_MAX) upper bound (%328)
//
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable       ← STRICT IEEE-754 semantics
//   air.compile.framebuffer_fetch_enable
// Fast-math is DISABLED, so we mirror `llvm.fmuladd` as strict unfused
// `a*b + c` and `air.exp2` as Math.fround(Math.pow(2, x)) — same as the
// 3x3 U16b sibling.

/** RGBA float pixel — matches `<4 x float>` lane order. */
export type Vec4 = readonly [number, number, number, number];
/** Ushort4 pixel — matches `<4 x i16>` lane order (u16-valued 0..65535). */
export type Ushort4 = readonly [number, number, number, number];

/** Params matching `%struct.bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U16b_params` (!18). */
export interface Blf2DImage5x5U16bParams {
  /** i32   m_width        — image width  in ushort4 tiles. */
  readonly width: number;
  /** i32   m_height       — image height in ushort4 rows. */
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
 * bm3dnr_buf::bm3dnr_buf_blf2DImage5x5U16b — direct TS mapping of the AIR body.
 * See the file header for the full IR→TS mapping. Every SSA value in the
 * .ll is cited by the `// %N` tag on its producing statement.
 */
export function bm3dnr_buf__bm3dnr_buf_blf2DImage5x5U16b(
  params: Blf2DImage5x5U16bParams,             // %0
  gridPos: readonly [number, number],          // %1 (gx, gy)
  input: readonly Ushort4[],                    // %2 <4 x i16>* (read)
  output: Ushort4[],                            // %3 <4 x i16>* (write)
): void {
  const gx = gridPos[0] | 0;                   // %5
  const gy = gridPos[1] | 0;                   // %10

  // Bounds checks — %8 / %13 (icmp ult).
  if ((gx >>> 0) >= (params.globalWidth  >>> 0)) return;   // %8  → %334 ret
  if ((gy >>> 0) >= (params.globalHeight >>> 0)) return;   // %13 → %334 ret

  const width        = params.width        | 0; // %16
  const height       = params.height       | 0; // %18
  const inputStride  = params.inputStride  | 0; // %20
  const outputStride = params.outputStride | 0; // %22
  const sigma        = f(params.sigma);         // %24 (float)

  // Mirror-clamped neighbour indices.
  const gxm1 = (gx - 1) | 0;                    // %25
  const gxp1 = (gx + 1) | 0;                    // %26
  const gym2 = (gy - 2) | 0;                    // %27
  const gym1 = (gy - 1) | 0;                    // %28
  const gyp1 = (gy + 1) | 0;                    // %29
  const gyp2 = (gy + 2) | 0;                    // %30
  const wm1  = (width  - 1) | 0;                // %34
  const hm1  = (height - 1) | 0;                // %40

  const xL   = gxm1 > 0 ? gxm1 : 0;             // %31/%32 select
  const xR   = gxp1 < width  ? gxp1 : wm1;      // %33/%35 select
  const yT   = gym1 > 0 ? gym1 : 0;             // %36/%37 select
  const yTT  = gym2 > 0 ? gym2 : 0;             // %38/%39 select
  const yB   = gyp1 < height ? gyp1 : hm1;      // %41/%42 select
  const yBB  = gyp2 < height ? gyp2 : hm1;      // %43/%44 select

  // Row-stride offsets (base offsets in <4 x i16> units).
  const rowTT = (inputStride * yTT) | 0;        // %45
  const rowT  = (inputStride * yT ) | 0;        // %61
  const rowC  = (inputStride * gy ) | 0;        // %77
  const rowB  = (inputStride * yB ) | 0;        // %93
  const rowBB = (inputStride * yBB) | 0;        // %109

  // -------------------------------------------------------------------------
  // Load the 15 vec4s (5 rows × 3 columns), each converted UNSIGNED i16→f32
  // via air.convert.f.v4f32.u.v4i16.
  // -------------------------------------------------------------------------
  const TT_L: Vec4 = u16toF32(input[(rowTT + xL) | 0]); // %47..%50
  const TT_C: Vec4 = u16toF32(input[(rowTT + gx) | 0]); // %51..%55
  const TT_R: Vec4 = u16toF32(input[(rowTT + xR) | 0]); // %56..%60
  const T_L:  Vec4 = u16toF32(input[(rowT  + xL) | 0]); // %62..%66
  const T_C:  Vec4 = u16toF32(input[(rowT  + gx) | 0]); // %67..%71
  const T_R:  Vec4 = u16toF32(input[(rowT  + xR) | 0]); // %72..%76
  const C_L:  Vec4 = u16toF32(input[(rowC  + xL) | 0]); // %78..%82
  const CC:   Vec4 = u16toF32(input[(rowC  + gx) | 0]); // %83..%87   — the centre
  const C_R:  Vec4 = u16toF32(input[(rowC  + xR) | 0]); // %88..%92
  const B_L:  Vec4 = u16toF32(input[(rowB  + xL) | 0]); // %94..%98
  const B_C:  Vec4 = u16toF32(input[(rowB  + gx) | 0]); // %99..%103
  const B_R:  Vec4 = u16toF32(input[(rowB  + xR) | 0]); // %104..%108
  const BB_L: Vec4 = u16toF32(input[(rowBB + xL) | 0]); // %110..%114
  const BB_C: Vec4 = u16toF32(input[(rowBB + gx) | 0]); // %115..%119
  const BB_R: Vec4 = u16toF32(input[(rowBB + xR) | 0]); // %120..%124

  // sigma splat: %125 = insertelement undef, sigma, 0; %126 = shufflevector, zeroinitializer.
  const sig: Vec4 = [sigma, sigma, sigma, sigma];

  // -------------------------------------------------------------------------
  // Stage 1 — centre column: TT_C, T_C, B_C, BB_C. Centre CC is the bias.
  // -------------------------------------------------------------------------
  const d1: Vec4 = subVec4(CC, TT_C);    // %127
  const d2: Vec4 = subVec4(CC, T_C );    // %128
  const d3: Vec4 = subVec4(CC, B_C );    // %129
  const d4: Vec4 = subVec4(CC, BB_C);    // %130
  const w1: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d1, d1))); // %131..%133
  const w2: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d2, d2))); // %134..%136
  const w3: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d3, d3))); // %137..%139
  const w4: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d4, d4))); // %140..%142
  let sum:  Vec4 = fmuladdVec4(TT_C, w1, CC);               // %143
  let wsum: Vec4 = addScalarVec4(w1, f(1.0));               // %144
  sum  = fmuladdVec4(T_C , w2, sum );                       // %145
  wsum = addVec4(wsum, w2);                                 // %146
  sum  = fmuladdVec4(B_C , w3, sum );                       // %147
  wsum = addVec4(wsum, w3);                                 // %148
  sum  = fmuladdVec4(BB_C, w4, sum );                       // %149
  wsum = addVec4(wsum, w4);                                 // %150

  // -------------------------------------------------------------------------
  // Stage 2 — horizontal shift -2 on TT/T/B/BB rows.
  //   pair(L, C) shufflevector <0,1,4,5> after taking lanes <2,3> of L.
  // -------------------------------------------------------------------------
  const TT_LL: Vec4 = [TT_L[2], TT_L[3], TT_C[0], TT_C[1]]; // %151..%153
  const T_LL:  Vec4 = [T_L [2], T_L [3], T_C [0], T_C [1]]; // %154..%156
  const B_LL:  Vec4 = [B_L [2], B_L [3], B_C [0], B_C [1]]; // %157..%159
  const BB_LL: Vec4 = [BB_L[2], BB_L[3], BB_C[0], BB_C[1]]; // %160..%162
  const d5:  Vec4 = subVec4(CC, TT_LL);  // %163
  const d6:  Vec4 = subVec4(CC, T_LL );  // %164
  const d7:  Vec4 = subVec4(CC, B_LL );  // %165
  const d8:  Vec4 = subVec4(CC, BB_LL);  // %166
  const w5:  Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d5, d5))); // %167..%169
  const w6:  Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d6, d6))); // %170..%172
  const w7:  Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d7, d7))); // %173..%175
  const w8:  Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d8, d8))); // %176..%178
  sum  = fmuladdVec4(TT_LL, w5, sum);                        // %179
  wsum = addVec4(wsum, w5);                                  // %180
  sum  = fmuladdVec4(T_LL , w6, sum);                        // %181
  wsum = addVec4(wsum, w6);                                  // %182
  sum  = fmuladdVec4(B_LL , w7, sum);                        // %183
  wsum = addVec4(wsum, w7);                                  // %184
  sum  = fmuladdVec4(BB_LL, w8, sum);                        // %185
  wsum = addVec4(wsum, w8);                                  // %186

  // -------------------------------------------------------------------------
  // Stage 3 — horizontal shift -1 on TT/T/B/BB rows.
  //   pair(L, C) shufflevector <0,4,5,6> after taking lane 3 of L.
  // -------------------------------------------------------------------------
  const TT_LC: Vec4 = [TT_L[3], TT_C[0], TT_C[1], TT_C[2]]; // %187, %188
  const T_LC:  Vec4 = [T_L [3], T_C [0], T_C [1], T_C [2]]; // %189, %190
  const B_LC:  Vec4 = [B_L [3], B_C [0], B_C [1], B_C [2]]; // %191, %192
  const BB_LC: Vec4 = [BB_L[3], BB_C[0], BB_C[1], BB_C[2]]; // %193, %194
  const d9:  Vec4 = subVec4(CC, TT_LC);  // %195
  const d10: Vec4 = subVec4(CC, T_LC );  // %196
  const d11: Vec4 = subVec4(CC, B_LC );  // %197
  const d12: Vec4 = subVec4(CC, BB_LC);  // %198
  const w9:  Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d9,  d9 ))); // %199..%201
  const w10: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d10, d10))); // %202..%204
  const w11: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d11, d11))); // %205..%207
  const w12: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d12, d12))); // %208..%210
  sum  = fmuladdVec4(TT_LC, w9 , sum);                          // %211
  wsum = addVec4(wsum, w9 );                                    // %212
  sum  = fmuladdVec4(T_LC , w10, sum);                          // %213
  wsum = addVec4(wsum, w10);                                    // %214
  sum  = fmuladdVec4(B_LC , w11, sum);                          // %215
  wsum = addVec4(wsum, w11);                                    // %216
  sum  = fmuladdVec4(BB_LC, w12, sum);                          // %217
  wsum = addVec4(wsum, w12);                                    // %218

  // -------------------------------------------------------------------------
  // Stage 4 — horizontal shift +1 on TT/T/B/BB rows.
  //   pair(C, R) shufflevector <0,1,2,4> after taking lanes <1,2,3> of C.
  // -------------------------------------------------------------------------
  const TT_RC: Vec4 = [TT_C[1], TT_C[2], TT_C[3], TT_R[0]]; // %219..%221
  const T_RC:  Vec4 = [T_C [1], T_C [2], T_C [3], T_R [0]]; // %222..%224
  const B_RC:  Vec4 = [B_C [1], B_C [2], B_C [3], B_R [0]]; // %225..%227
  const BB_RC: Vec4 = [BB_C[1], BB_C[2], BB_C[3], BB_R[0]]; // %228..%230
  const d13: Vec4 = subVec4(CC, TT_RC);  // %231
  const d14: Vec4 = subVec4(CC, T_RC );  // %232
  const d15: Vec4 = subVec4(CC, B_RC );  // %233
  const d16: Vec4 = subVec4(CC, BB_RC);  // %234
  const w13: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d13, d13))); // %235..%237
  const w14: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d14, d14))); // %238..%240
  const w15: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d15, d15))); // %241..%243
  const w16: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d16, d16))); // %244..%246
  sum  = fmuladdVec4(TT_RC, w13, sum);                          // %247
  wsum = addVec4(wsum, w13);                                    // %248
  sum  = fmuladdVec4(T_RC , w14, sum);                          // %249
  wsum = addVec4(wsum, w14);                                    // %250
  sum  = fmuladdVec4(B_RC , w15, sum);                          // %251
  wsum = addVec4(wsum, w15);                                    // %252
  sum  = fmuladdVec4(BB_RC, w16, sum);                          // %253
  wsum = addVec4(wsum, w16);                                    // %254

  // -------------------------------------------------------------------------
  // Stage 5 — horizontal shift +2 on TT/T/B/BB rows.
  //   pair(C, R) shufflevector <0,1,4,5> after taking lanes <2,3> of C.
  // -------------------------------------------------------------------------
  const TT_RR: Vec4 = [TT_C[2], TT_C[3], TT_R[0], TT_R[1]]; // %255..%257
  const T_RR:  Vec4 = [T_C [2], T_C [3], T_R [0], T_R [1]]; // %258..%260
  const B_RR:  Vec4 = [B_C [2], B_C [3], B_R [0], B_R [1]]; // %261..%263
  const BB_RR: Vec4 = [BB_C[2], BB_C[3], BB_R[0], BB_R[1]]; // %264..%266
  const d17: Vec4 = subVec4(CC, TT_RR);  // %267
  const d18: Vec4 = subVec4(CC, T_RR );  // %268
  const d19: Vec4 = subVec4(CC, B_RR );  // %269
  const d20: Vec4 = subVec4(CC, BB_RR);  // %270
  const w17: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d17, d17))); // %271..%273
  const w18: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d18, d18))); // %274..%276
  const w19: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d19, d19))); // %277..%279
  const w20: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d20, d20))); // %280..%282
  sum  = fmuladdVec4(TT_RR, w17, sum);                          // %283
  wsum = addVec4(wsum, w17);                                    // %284
  sum  = fmuladdVec4(T_RR , w18, sum);                          // %285
  wsum = addVec4(wsum, w18);                                    // %286
  sum  = fmuladdVec4(B_RR , w19, sum);                          // %287
  wsum = addVec4(wsum, w19);                                    // %288
  sum  = fmuladdVec4(BB_RR, w20, sum);                          // %289
  wsum = addVec4(wsum, w20);                                    // %290

  // -------------------------------------------------------------------------
  // Stage 6 — centre row's 4 horizontal shifted taps (±1 and ±2).
  //   %82 = C_L, %87 = CC, %92 = C_R.
  // -------------------------------------------------------------------------
  const CC_LL: Vec4 = [C_L[2], C_L[3], CC [0], CC [1]];  // %291..%293  shift -2
  const CC_LC: Vec4 = [C_L[3], CC [0], CC [1], CC [2]];  // %294, %295  shift -1
  const CC_RC: Vec4 = [CC [1], CC [2], CC [3], C_R[0]];  // %296..%298  shift +1
  const CC_RR: Vec4 = [CC [2], CC [3], C_R[0], C_R[1]];  // %299..%301  shift +2
  const d21: Vec4 = subVec4(CC, CC_LL);   // %302
  const d22: Vec4 = subVec4(CC, CC_LC);   // %303
  const d23: Vec4 = subVec4(CC, CC_RC);   // %304
  const d24: Vec4 = subVec4(CC, CC_RR);   // %305
  const w21: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d21, d21))); // %306..%308
  const w22: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d22, d22))); // %309..%311
  const w23: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d23, d23))); // %312..%314
  const w24: Vec4 = exp2Vec4(mulVec4(sig, mulVec4(d24, d24))); // %315..%317
  sum  = fmuladdVec4(CC_LL, w21, sum);                          // %318
  wsum = addVec4(wsum, w21);                                    // %319
  sum  = fmuladdVec4(CC_LC, w22, sum);                          // %320
  wsum = addVec4(wsum, w22);                                    // %321
  sum  = fmuladdVec4(CC_RC, w23, sum);                          // %322
  wsum = addVec4(wsum, w23);                                    // %323
  sum  = fmuladdVec4(CC_RR, w24, sum);                          // %324
  wsum = addVec4(wsum, w24);                                    // %325

  // -------------------------------------------------------------------------
  // Finalise (%326..%329) — same shape as the 3x3 U16b sibling.
  //   normalise → +0.5 bias → clamp to [0, 65535] → truncate to u16.
  // -------------------------------------------------------------------------
  const avg326: Vec4    = divVec4(sum, wsum);                        // %326
  const avg327: Vec4    = addScalarVec4(avg326, f(0.5));             // %327
  const avg328: Vec4    = clampVec4(avg327, f(0.0), f(6.553500e+04));// %328
  const avg329: Ushort4 = f32toU16(avg328);                          // %329

  // Store: output[m_outputStride * gy + gx].
  const outIdx = (outputStride * gy + gx) | 0;                       // %330 + %5 = %331
  output[outIdx] = avg329;                                           // %333 store
  // %334: ret void.
}

// ---------------------------------------------------------------------------
// Small helpers — each mirrors a single AIR intrinsic on <4 x float>.
// Fast-math is DISABLED on this module, so every op is fp32-narrowed
// strictly via Math.fround.
// ---------------------------------------------------------------------------

/** `air.convert.f.v4f32.u.v4i16` — unsigned i16 → f32 per lane.
 *  Callers pass numbers already in the u16 range [0, 65535]; we simply
 *  fp32-narrow each lane. */
function u16toF32(v: Ushort4): Vec4 {
  return [f(v[0]), f(v[1]), f(v[2]), f(v[3])];
}

/** `air.convert.u.v4i16.f.v4f32` — unsigned float32 → u16 truncation per
 *  lane. The preceding clamp[0, 65535] guarantees the input already fits,
 *  so `Math.trunc(x) | 0` reproduces the AIR result bit-for-bit. */
function f32toU16(v: Vec4): Ushort4 {
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

/** per-lane f32 divide — matches `fdiv <4 x float>` (%326). */
function divVec4(a: Vec4, b: Vec4): Vec4 {
  return [f(a[0] / b[0]), f(a[1] / b[1]), f(a[2] / b[2]), f(a[3] / b[3])];
}

/** `air.clamp.v4f32(v, lo, hi)` per-lane — min(max(v,lo),hi) (%328). */
function clampVec4(v: Vec4, lo: number, hi: number): Vec4 {
  return [
    f(Math.min(Math.max(v[0], lo), hi)),
    f(Math.min(Math.max(v[1], lo), hi)),
    f(Math.min(Math.max(v[2], lo), hi)),
    f(Math.min(Math.max(v[3], lo), hi)),
  ];
}

/** `air.exp2.v4f32` — per-lane exp2, fp32-narrowed. `fast_math_disable` is
 *  set on this module (!12 in the .ll), so no fast-path libcall — we use
 *  the strict Math.pow(2, x). */
function exp2Vec4(v: Vec4): Vec4 {
  return [f(Math.pow(2, v[0])), f(Math.pow(2, v[1])),
          f(Math.pow(2, v[2])), f(Math.pow(2, v[3]))];
}

/** `llvm.fmuladd.v4f32(a, b, c)` — a*b + c per lane. With
 *  `fast_math_disable` set on this module (!12 in the .ll), we use the
 *  strict, unfused form. */
function fmuladdVec4(a: Vec4, b: Vec4, c: Vec4): Vec4 {
  return [
    f(f(a[0] * b[0]) + c[0]),
    f(f(a[1] * b[1]) + c[1]),
    f(f(a[2] * b[2]) + c[2]),
    f(f(a[3] * b[3]) + c[3]),
  ];
}
