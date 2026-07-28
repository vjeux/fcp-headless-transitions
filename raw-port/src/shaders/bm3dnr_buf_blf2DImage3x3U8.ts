// bm3dnr_buf_blf2DImage3x3U8.ts
// @shader bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U8 (HeliumSenso)
// Faithful direct TS mapping of the Metal compute kernel decompiled at
//   raw-port/re/shaders/bm3dnr_buf__bm3dnr_buf_blf2DImage3x3U8.ll  (see @0x0000000001b98d)
//
// A 3x3 bilateral filter over a UCHAR8 (unsigned 8-bit grayscale) image
// packed 4 pixels per vec4 slot. Each thread processes ONE vec4 slot
// (four consecutive u8 pixels along the x axis) at (gridX, gridY) — the
// buffer stride is expressed in vec4 elements. The bilateral weight is
//   w(N) = exp2(sigma * (C - N)^2)
// with sigma coming in as a signed scalar in `m_sigma` (typically <= 0 for
// a well-formed Gaussian). The center pixel has an implicit weight of 1.
// Output is written as u8 after `x + 0.5` rounding-to-nearest and clamping
// to [0, 255].
//
// Kernel signature (from !14/!17/!19/!20/!21):
//   params : constant buffer of struct {
//              i32   m_width, m_height, m_inputStride, m_outputStride,
//              f32   m_sigma,
//              u32   m_globalWidth, m_globalHeight
//            }
//   grid_in: uint2 — thread_position_in_grid
//   input  : device uchar4* (read)
//   output : device uchar4* (read_write; only written by this shader)
//
// Struct field mapping per metadata !18:
//   idx 0 -> +0  : m_width         (i32) — vec4-column count of the image
//   idx 1 -> +4  : m_height        (i32) — pixel-row count of the image
//   idx 2 -> +8  : m_inputStride   (i32) — vec4-columns per input row
//   idx 3 -> +12 : m_outputStride  (i32) — vec4-columns per output row
//   idx 4 -> +16 : m_sigma         (f32) — bilateral exponent scale
//   idx 5 -> +20 : m_globalWidth   (u32) — grid.x upper bound (exclusive)
//   idx 6 -> +24 : m_globalHeight  (u32) — grid.y upper bound (exclusive)
//
// -----------------------------------------------------------------------------
// Neighborhood addressing (recovered from %25..%38):
//   %25 xLraw = gridX - 1                        ; %29 xLraw > 0 ?
//   %30 xL    = %29 ? xLraw : 0                  (clamp to left edge)
//   %26 xRraw = gridX + 1                        ; %31 xRraw < width ?
//   %33 xR    = %31 ? xRraw : (width - 1)        (clamp to right edge)
//   %27 yTraw = gridY - 1
//   %35 yT    = %34 ? yTraw : 0
//   %28 yBraw = gridY + 1
//   %38 yB    = %36 ? yBraw : (height - 1)
//   %5  xC    = gridX ; %10 yC = gridY
//
// The 9 vec4 loads step through 3 rows (yT, yC, yB) x 3 columns (xL, xC, xR):
//   TL = input[yT * inputStride + xL]     (%42 %43 -> f32 %44)
//   T  = input[yT * inputStride + xC]     (%47 %48 -> f32 %49)
//   TR = input[yT * inputStride + xR]     (%52 %53 -> f32 %54)
//   L  = input[yC * inputStride + xL]     (%58 %59 -> f32 %60)
//   C  = input[yC * inputStride + xC]     (%63 %64 -> f32 %65)
//   R  = input[yC * inputStride + xR]     (%68 %69 -> f32 %70)
//   BL = input[yB * inputStride + xL]     (%74 %75 -> f32 %76)
//   B  = input[yB * inputStride + xC]     (%79 %80 -> f32 %81)
//   BR = input[yB * inputStride + xR]     (%84 %85 -> f32 %86)
//
// Neighbor rows for the 4 output pixels of this vec4 slot are then composed
// via shufflevector — each shuffle name below cites the IR SSA number:
//   %102 = <TL.w, T.x, T.y, T.z>          -- NW row (T shifted left by 1 pixel)
//   %104 = <BL.w, B.x, B.y, B.z>          -- SW row
//   %119 = <T.y, T.z, T.w, TR.x>          -- NE row (T shifted right by 1 pixel)
//   %122 = <B.y, B.z, B.w, BR.x>          -- SE row
//   %136 = <L.w,  C.x, C.y, C.z>          -- W row (C shifted left by 1 pixel)
//   %139 = <C.y, C.z, C.w, R.x>           -- E row (C shifted right by 1 pixel)
//
// -----------------------------------------------------------------------------
// Bilateral accumulator (numerator "num", denominator "den"):
//   sigmaV = broadcast(sigma) into a vec4                 (%87/%88)
//   diffN  = C - N ; wN = exp2(sigmaV * diffN^2)          (per neighbor N)
//   num   += N * wN                                       (fmuladd of N,wN,acc)
//   den   += wN
//   Center starts the recurrence:
//     %97  num = T *wT  + C           (fmuladd  T ,wT, C)
//     %98  den = wT + 1
//     %99  num = B *wB  + %97         (fmuladd  B ,wB, %97)
//     %100 den = %98 + wB
//   Then in shuffle order NW, SW, NE, SE, W, E (see IR blocks %101..%150).
//   %152 = num / den
//   %153 = %152 + 0.5   (round-to-nearest before u8 cast)
//   %154 = clamp %153 into [0, 255]                       (air.clamp)
//   %155 = u8-convert %154                                (air.convert.u.v4i8.f.v4f32)
//   output[gridY * outputStride + gridX] = %155           (%156..%159)
//
// -----------------------------------------------------------------------------
// Fast-math note: the module has `air.compile.fast_math_disable`. All fadd /
// fmul / fdiv / fmuladd are per-lane fp32 with a Math.fround on each step.
// `llvm.fmuladd` is spelled as separate multiply + add here — Metal's Apple
// GPU implementation may fuse it into an FMA; the IR neither forbids nor
// requires fusion, so we mirror the plain (a*b then + c) sequence for
// deterministic fp32 rounding on the JS side. Consumers wanting bit-identical
// GPU behaviour must run the actual Metal shader.
//
// air.exp2 is a native f32 exp2 intrinsic; we spell it as `Math.fround(2 ** x)`.

/**
 * Compute-kernel parameters (constant buffer struct). Field names match the
 * `air.struct_type_info` metadata !18.
 */
export interface Bm3dnrBufBlf2DImage3x3U8Params {
  /** @+0  m_width (i32) — vec4-column count of the image. */
  m_width: number;
  /** @+4  m_height (i32) — pixel-row count of the image. */
  m_height: number;
  /** @+8  m_inputStride (i32) — vec4-columns per input row. */
  m_inputStride: number;
  /** @+12 m_outputStride (i32) — vec4-columns per output row. */
  m_outputStride: number;
  /** @+16 m_sigma (f32) — bilateral exponent scale (typically <= 0). */
  m_sigma: number;
  /** @+20 m_globalWidth (u32) — grid.x upper bound (exclusive). */
  m_globalWidth: number;
  /** @+24 m_globalHeight (u32) — grid.y upper bound (exclusive). */
  m_globalHeight: number;
}

/** device uchar4* — one vec4 slot per element; four consecutive u8 pixels. */
export type Uchar4Buffer = Uint8Array;

// -----------------------------------------------------------------------------
// Small vec4 helpers. Each returns a fresh Float32Array so nothing aliases.

/**
 * `air.convert.f.v4f32.u.v4i8` — unsigned u8→f32 lane-wise conversion.
 * Reads 4 bytes at `byteBase` and returns them as fp32 lanes in [0, 255].
 * Cited from IR calls %44/%49/%54/%60/%65/%70/%76/%81/%86.
 */
function u8ToF32Vec4(buf: Uchar4Buffer, byteBase: number): Float32Array {
  const v = new Float32Array(4);
  v[0] = buf[byteBase + 0] | 0;
  v[1] = buf[byteBase + 1] | 0;
  v[2] = buf[byteBase + 2] | 0;
  v[3] = buf[byteBase + 3] | 0;
  return v;
}

/**
 * `air.convert.u.v4i8.f.v4f32` — f32→u8 lane-wise conversion (post-clamp).
 * Writes 4 bytes into `dst[byteBase..byteBase+4)`. The IR pre-clamps to
 * [0, 255] with `air.clamp`, then converts (truncation semantics).
 * Cited from IR %155.
 */
function f32ToU8Vec4(dst: Uchar4Buffer, byteBase: number, v: Float32Array): void {
  // The IR clamps first (@%154), so lane values are already in [0, 255].
  // Metal's `convert.u.v4i8.f.v4f32` truncates toward zero — matches `| 0`.
  dst[byteBase + 0] = v[0] | 0;
  dst[byteBase + 1] = v[1] | 0;
  dst[byteBase + 2] = v[2] | 0;
  dst[byteBase + 3] = v[3] | 0;
}

/** Vec4 fadd (a + b), fp32 per lane. Mirrors `fadd <4 x float>`. */
function fadd4(a: Float32Array, b: Float32Array): Float32Array {
  const v = new Float32Array(4);
  v[0] = Math.fround(a[0] + b[0]);
  v[1] = Math.fround(a[1] + b[1]);
  v[2] = Math.fround(a[2] + b[2]);
  v[3] = Math.fround(a[3] + b[3]);
  return v;
}

/** Vec4 fsub (a - b), fp32 per lane. Mirrors `fsub <4 x float>`. */
function fsub4(a: Float32Array, b: Float32Array): Float32Array {
  const v = new Float32Array(4);
  v[0] = Math.fround(a[0] - b[0]);
  v[1] = Math.fround(a[1] - b[1]);
  v[2] = Math.fround(a[2] - b[2]);
  v[3] = Math.fround(a[3] - b[3]);
  return v;
}

/** Vec4 fmul (a * b), fp32 per lane. Mirrors `fmul <4 x float>`. */
function fmul4(a: Float32Array, b: Float32Array): Float32Array {
  const v = new Float32Array(4);
  v[0] = Math.fround(a[0] * b[0]);
  v[1] = Math.fround(a[1] * b[1]);
  v[2] = Math.fround(a[2] * b[2]);
  v[3] = Math.fround(a[3] * b[3]);
  return v;
}

/**
 * `llvm.fmuladd.v4f32` — (a * b) + c per lane. The intrinsic permits FMA
 * fusion but does not require it; we implement as two separate rounded ops
 * (mul then add), each narrowed to fp32. See fast-math note in the header.
 * Mirrors IR %97/%99/%113/%115/%131/%133/%148/%150.
 */
function fmuladd4(a: Float32Array, b: Float32Array, c: Float32Array): Float32Array {
  const v = new Float32Array(4);
  v[0] = Math.fround(Math.fround(a[0] * b[0]) + c[0]);
  v[1] = Math.fround(Math.fround(a[1] * b[1]) + c[1]);
  v[2] = Math.fround(Math.fround(a[2] * b[2]) + c[2]);
  v[3] = Math.fround(Math.fround(a[3] * b[3]) + c[3]);
  return v;
}

/** Vec4 fdiv (a / b), fp32 per lane. Mirrors `fdiv <4 x float>` @%152. */
function fdiv4(a: Float32Array, b: Float32Array): Float32Array {
  const v = new Float32Array(4);
  v[0] = Math.fround(a[0] / b[0]);
  v[1] = Math.fround(a[1] / b[1]);
  v[2] = Math.fround(a[2] / b[2]);
  v[3] = Math.fround(a[3] / b[3]);
  return v;
}

/**
 * `air.exp2.v4f32` — 2^x per lane, fp32 narrowed. Mirrors IR
 * %93/%96/%109/%112/%127/%130/%144/%147.
 */
function airExp2Vec4(x: Float32Array): Float32Array {
  const v = new Float32Array(4);
  v[0] = Math.fround(Math.pow(2, x[0]));
  v[1] = Math.fround(Math.pow(2, x[1]));
  v[2] = Math.fround(Math.pow(2, x[2]));
  v[3] = Math.fround(Math.pow(2, x[3]));
  return v;
}

/**
 * `air.clamp.v4f32` — per-lane clamp to [lo, hi]. Mirrors IR %154.
 */
function airClampVec4(x: Float32Array, lo: number, hi: number): Float32Array {
  const v = new Float32Array(4);
  const loF = Math.fround(lo);
  const hiF = Math.fround(hi);
  for (let i = 0; i < 4; i = (i + 1) | 0) {
    const xi = x[i];
    let out = xi;
    if (out < loF) out = loF;
    if (out > hiF) out = hiF;
    v[i] = out;
  }
  return v;
}

/** Vec4 add-scalar: adds a scalar into all lanes, fp32. */
function fadd4Scalar(a: Float32Array, s: number): Float32Array {
  const sF = Math.fround(s);
  const v = new Float32Array(4);
  v[0] = Math.fround(a[0] + sF);
  v[1] = Math.fround(a[1] + sF);
  v[2] = Math.fround(a[2] + sF);
  v[3] = Math.fround(a[3] + sF);
  return v;
}

/**
 * bm3dnr_buf::bm3dnr_buf_blf2DImage3x3U8 — one thread invocation.
 *
 * Applies a 3x3 bilateral filter to one vec4 slot (four consecutive u8
 * pixels along x) at (gridX, gridY), reading from `input` and writing to
 * `output`. Both buffers are UInt8 arrays laid out as vec4-groups of 4 u8s
 * (one vec4 = 4 bytes = 4 grayscale pixels).
 */
export function bm3dnr_buf_blf2DImage3x3U8(
  params: Bm3dnrBufBlf2DImage3x3U8Params,
  gridIn: readonly [number, number],
  input: Uchar4Buffer,
  output: Uchar4Buffer,
): void {
  // %5 = extractelement grid_in, 0
  const gridX = gridIn[0] | 0;
  // %7 = params.m_globalWidth (GEP idx 5)
  const globalWidth = params.m_globalWidth >>> 0;
  // %8 = icmp ult gridX, globalWidth ; false -> %160 (ret)
  if (!((gridX >>> 0) < globalWidth)) {
    return;
  }
  // %10 = extractelement grid_in, 1
  const gridY = gridIn[1] | 0;
  // %12 = params.m_globalHeight (GEP idx 6)
  const globalHeight = params.m_globalHeight >>> 0;
  // %13 = icmp ult gridY, globalHeight ; false -> %160
  if (!((gridY >>> 0) < globalHeight)) {
    return;
  }

  // %16 = params.m_width (GEP idx 0) — vec4-column count.
  const width = params.m_width | 0;
  // %18 = params.m_height (GEP idx 1).
  const height = params.m_height | 0;
  // %20 = params.m_inputStride (GEP idx 2).
  const inputStride = params.m_inputStride | 0;
  // %22 = params.m_outputStride (GEP idx 3).
  const outputStride = params.m_outputStride | 0;
  // %24 = params.m_sigma (GEP idx 4).
  const sigma = Math.fround(params.m_sigma);

  // %25 = gridX - 1  (i32)  ;  %29 = %25 > 0 ; %30 = select %29 (%25, 0)
  const xLraw = (gridX - 1) | 0;
  const xL = xLraw > 0 ? xLraw : 0;
  // %26 = gridX + 1 (i32, nuw)  ;  %31 = %26 < width ; %32 = width - 1
  //   %33 = select %31 (%26, %32)
  const xRraw = (gridX + 1) | 0;
  const xR = xRraw < width ? xRraw : (width - 1) | 0;
  // %27 = gridY - 1 ; %34 = %27 > 0 ; %35 = select
  const yTraw = (gridY - 1) | 0;
  const yT = yTraw > 0 ? yTraw : 0;
  // %28 = gridY + 1 (nuw) ; %36 = %28 < height ; %37 = height - 1 ; %38 = select
  const yBraw = (gridY + 1) | 0;
  const yB = yBraw < height ? yBraw : (height - 1) | 0;

  // ---- 9 vec4 loads (u8 -> f32) ----
  // Each element is 4 bytes; byte offset = elem * 4.
  // Row yT.
  // %39 = inputStride * yT ; %40 = %39 + xL ; %41 = sext -> i64 ; %42 = &input[%41]
  const rowYT = inputStride * yT;
  const idxTL = rowYT + xL;   // %40
  const TL = u8ToF32Vec4(input, idxTL * 4);       // %44
  const idxT  = rowYT + gridX; // %45
  const T  = u8ToF32Vec4(input, idxT  * 4);       // %49
  const idxTR = rowYT + xR;   // %50
  const TR = u8ToF32Vec4(input, idxTR * 4);       // %54
  // Row yC (== gridY).
  const rowYC = inputStride * gridY;               // %55
  const idxL  = rowYC + xL;                        // %56
  const L  = u8ToF32Vec4(input, idxL  * 4);        // %60
  const idxC  = rowYC + gridX;                     // %61
  const C  = u8ToF32Vec4(input, idxC  * 4);        // %65
  const idxR  = rowYC + xR;                        // %66
  const R  = u8ToF32Vec4(input, idxR  * 4);        // %70
  // Row yB.
  const rowYB = inputStride * yB;                  // %71
  const idxBL = rowYB + xL;                        // %72
  const BL = u8ToF32Vec4(input, idxBL * 4);        // %76
  const idxB  = rowYB + gridX;                     // %77
  const B  = u8ToF32Vec4(input, idxB  * 4);        // %81
  const idxBR = rowYB + xR;                        // %82
  const BR = u8ToF32Vec4(input, idxBR * 4);        // %86

  // %87 = <sigma, undef, undef, undef> ; %88 = shufflevector -> <sigma, sigma, sigma, sigma>
  const sigmaV = new Float32Array(4);
  sigmaV[0] = sigma; sigmaV[1] = sigma; sigmaV[2] = sigma; sigmaV[3] = sigma;

  // ---- Iteration 1: N (T) and S (B) ----
  // %89 = C - T ; %90 = C - B
  const diffN = fsub4(C, T);
  const diffS = fsub4(C, B);
  // %91 = %89 * %89 ; %92 = sigma * %91 ; %93 = exp2(%92)  = w_N
  const wN = airExp2Vec4(fmul4(sigmaV, fmul4(diffN, diffN)));
  // %94 = %90 * %90 ; %95 = sigma * %94 ; %96 = exp2(%95)  = w_S
  const wS = airExp2Vec4(fmul4(sigmaV, fmul4(diffS, diffS)));
  // %97 = fmuladd(T, w_N, C)  -- num := T * w_N + C  (center gets implicit weight 1)
  let num = fmuladd4(T, wN, C);
  // %98 = w_N + 1
  let den = fadd4Scalar(wN, 1.0);
  // %99 = fmuladd(B, w_S, num) ; %100 = den + w_S
  num = fmuladd4(B, wS, num);
  den = fadd4(den, wS);

  // ---- Iteration 2: NW and SW (from shufflevector of T/TL, B/BL) ----
  // %101 = <TL.w, undef, undef, undef>
  // %102 = shuffle(%101, T, <0,4,5,6>) = <TL.w, T.x, T.y, T.z>  -- NW row
  const NW = new Float32Array(4);
  NW[0] = TL[3]; NW[1] = T[0]; NW[2] = T[1]; NW[3] = T[2];
  // %103/%104 = analogous for BL/B -> SW row
  const SW = new Float32Array(4);
  SW[0] = BL[3]; SW[1] = B[0]; SW[2] = B[1]; SW[3] = B[2];
  // %105 = C - NW ; %106 = C - SW
  const diffNW = fsub4(C, NW);
  const diffSW = fsub4(C, SW);
  // %107..%109 = w_NW = exp2(sigma * diffNW^2)
  const wNW = airExp2Vec4(fmul4(sigmaV, fmul4(diffNW, diffNW)));
  // %110..%112 = w_SW
  const wSW = airExp2Vec4(fmul4(sigmaV, fmul4(diffSW, diffSW)));
  // %113 = fmuladd(NW, w_NW, num) ; %114 = den + w_NW
  num = fmuladd4(NW, wNW, num);
  den = fadd4(den, wNW);
  // %115 = fmuladd(SW, w_SW, num) ; %116 = den + w_SW
  num = fmuladd4(SW, wSW, num);
  den = fadd4(den, wSW);

  // ---- Iteration 3: NE and SE (right-shift of T/B with TR/BR wrapping in the top lane) ----
  // %117 = shuffle(T, undef, <1,2,3>)  ;  %118 = shuffle(%117, undef, <0,1,2,undef>)
  // %119 = shuffle(%118, TR, <0,1,2,4>) = <T.y, T.z, T.w, TR.x>  -- NE row
  const NE = new Float32Array(4);
  NE[0] = T[1]; NE[1] = T[2]; NE[2] = T[3]; NE[3] = TR[0];
  // %120..%122 = <B.y, B.z, B.w, BR.x> -- SE row
  const SE = new Float32Array(4);
  SE[0] = B[1]; SE[1] = B[2]; SE[2] = B[3]; SE[3] = BR[0];
  // %123..%130 = weights, %131/%133 = fmuladds, %132/%134 = den accumulations
  const diffNE = fsub4(C, NE);
  const diffSE = fsub4(C, SE);
  const wNE = airExp2Vec4(fmul4(sigmaV, fmul4(diffNE, diffNE)));
  const wSE = airExp2Vec4(fmul4(sigmaV, fmul4(diffSE, diffSE)));
  num = fmuladd4(NE, wNE, num);
  den = fadd4(den, wNE);
  num = fmuladd4(SE, wSE, num);
  den = fadd4(den, wSE);

  // ---- Iteration 4: W and E (from shufflevector of L/C, C/R) ----
  // %135 = <L.w, undef, undef, undef>
  // %136 = shuffle(%135, C, <0,4,5,6>) = <L.w, C.x, C.y, C.z>  -- W row
  const W = new Float32Array(4);
  W[0] = L[3]; W[1] = C[0]; W[2] = C[1]; W[3] = C[2];
  // %137/%138/%139 = <C.y, C.z, C.w, R.x>  -- E row
  const E = new Float32Array(4);
  E[0] = C[1]; E[1] = C[2]; E[2] = C[3]; E[3] = R[0];
  // %140..%147 = weights, %148/%150 = fmuladds, %149/%151 = den accumulations
  const diffW = fsub4(C, W);
  const diffE = fsub4(C, E);
  const wW = airExp2Vec4(fmul4(sigmaV, fmul4(diffW, diffW)));
  const wE = airExp2Vec4(fmul4(sigmaV, fmul4(diffE, diffE)));
  num = fmuladd4(W, wW, num);
  den = fadd4(den, wW);
  num = fmuladd4(E, wE, num);
  den = fadd4(den, wE);

  // ---- Finalize ----
  // %152 = num / den
  const filtered = fdiv4(num, den);
  // %153 = filtered + 0.5  (round-to-nearest before u8 truncation)
  const rounded = fadd4Scalar(filtered, 0.5);
  // %154 = clamp %153 to [0, 255]
  const clamped = airClampVec4(rounded, 0, 255);
  // %155 = u8-convert %154

  // ---- Store ----
  // %156 = outputStride * gridY ; %157 = %156 + gridX ; %158 = sext -> i64
  // %159 = &output[%158] ; store <4 x i8> %155
  const outIdx = outputStride * gridY + gridX;   // %157
  f32ToU8Vec4(output, outIdx * 4, clamped);
  // br label %160 ; ret void
}
