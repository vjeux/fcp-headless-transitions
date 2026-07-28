// @shader soOFlowEstimator::soOFlowEstimator_genBlurWeights (HeliumSenso) @0x000000000a23fd
// Source IR: raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_genBlurWeights.ll
// (extracted from HeliumSenso.framework/Versions/A/Resources/default.metallib)
/**
 * @shader soOFlowEstimator::soOFlowEstimator_genBlurWeights (HeliumSenso)
 *
 * Per-row 1D resampling-kernel generator for the optical-flow estimator's
 * separable box/blur down/upsampler. For each output row index `x`
 * (dispatched as [[thread_position_in_grid]]), builds a per-tap weight
 * table into a `weights[dimX*x + …]` slice such that:
 *   - weights[0]        = first-source-idx (as float, i32-narrowed)
 *   - weights[1]        = last-source-idx  (as float, i32-narrowed)
 *   - weights[2..]      = normalised Keys' bicubic (a=-0.5) taps that
 *                         map the input scale to the output pixel `x`.
 *
 * The tap kernel is Keys' bicubic (Catmull-Rom, a=-0.5), evaluated over
 * the window `[first, last)`. Support radius is
 *   R = max(0.5, 2 * sigma * max(1, 1/imageScale)).
 * Centre of the tap in source coords is
 *   c = (x + 0.5) / imageScale.
 *
 * Normalisation: the raw taps are summed once (sum = %83). If nonzero we
 * scale by 1/sum for float output taps AND by 32768/sum for a round-to-int
 * "leading zero" trim so that any tap that would round to 0 at 15-bit
 * fixed-point precision is DROPPED from the front of the tap array. This
 * happens INSIDE the second loop (%89..%191): a per-iteration Q15 round is
 * used purely as an "is this tap significant at fixed-point precision?"
 * predicate; only significant taps are written, and the first-idx marker
 * (weights[0]) is advanced past leading fixed-point zeros. Trailing zeros
 * are naturally not counted because the number of stored taps drives the
 * last-idx marker on the sum==nonzero path.
 *
 * Two zero-sum degenerate paths are handled at the tail:
 *   - sum == 0 exactly (all taps 0):
 *       weights[0] and weights[1] are collapsed toward each other
 *       (a smoothed retreat) and weights[2] is set to 1.0. See %197..%204.
 *   - sum == nonzero but the QUANTISED-taps sum != 1 (kept-tap count
 *     doesn't cover the centre): we correct one tap by (1 - sum) at
 *     `round(c)`-relative index. See %205..%222.
 *
 * Signature from !air.kernel (!14..!20):
 *   kernel void soOFlowEstimator_genBlurWeights(
 *       constant params  *params   [[buffer(0)]],
 *       uint              x        [[thread_position_in_grid]],
 *       device float     *weights  [[buffer(1), read_write]]);
 *
 * params struct (16 bytes, 4-byte aligned) — from !17/!18/!22:
 *   +0   int   m_weightArrayDimX   — stride (per-row tap slots incl. 2 markers)
 *   +4   int   m_weightArrayDimY   — number of rows to fill (guard on x)
 *   +8   float m_imageScale        — scale factor from output → source
 *   +12  float m_sigma             — support-radius multiplier
 *
 * Denorms / fast-math (from !11..!13):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_disable   — strict IEEE-754; every fp op is
 *   fp32-narrowed via Math.fround at each `air.*` boundary.
 */

/** params struct (16 bytes, 4-byte aligned). @IR !17/!18 */
export interface soOFlowEstimator_genBlurWeights_Params {
  /** int at +0: per-row stride. @IR %9 (load i32 at offset 0) */
  m_weightArrayDimX: number;
  /** int at +4: number of rows (guard against x). @IR %5 (load i32 at offset 4) */
  m_weightArrayDimY: number;
  /** float at +8: output→source scale. @IR %17 (load f32 at offset 8) */
  m_imageScale: number;
  /** float at +12: sigma / support-radius multiplier. @IR %15 (load f32 at offset 12) */
  m_sigma: number;
}

/**
 * fp32-narrowed max — mirrors `air.fmax.f32` (IR %19, %25).
 * @IR calls to @air.fmax.f32
 */
function airFmax(a: number, b: number): number {
  // air.fmax.f32 returns fmax with denorms-disable; on positive operands
  // and the specific call sites (max(1, 1/scale), max(0.5, 2*sigma*mul))
  // this is a plain IEEE fmax.
  return Math.fround(Math.max(a, b));
}

/**
 * fp32-narrowed fused multiply-add — mirrors `llvm.fmuladd.f32`.
 * The IR is marked `no-trapping-math` and `fast-math-disable`; llvm.fmuladd
 * with fast-math disabled may either fuse or split, matching strict IEEE.
 * We split as `a*b + c` narrowed twice (worst-case bit-exact match under
 * the split path; identical semantics for the tap-polynomial call sites).
 * @IR llvm.fmuladd.f32
 */
function fmuladd(a: number, b: number, c: number): number {
  return Math.fround(Math.fround(a * b) + c);
}

/**
 * Keys' bicubic weight (a=-0.5) evaluated at `t`, piecewise, mirroring the
 * IR blocks %37..%77 (used at both %78 (norm-sum loop) and %134/%169 (write
 * loop)). Returns 0 outside [-2, 2).
 *
 * @IR
 *   %44/%100/%137: t < -2                             → 0
 *   %46/%102/%137: t < -1  → %52 = (t+2)*(t+2)*(t+1)*0.5
 *   %54/%110/%145: t < 0   → %60 = 1 + (-2.5*t)*t + (-1.5*t*t)*t
 *                              (== 1 - 2.5*t^2 - 1.5*t^3)
 *   %62/%118/%153: t < 1   → %68 = 1 + (-2.5*t)*t + (1.5*t*t)*t
 *                              (== 1 - 2.5*t^2 + 1.5*t^3)
 *   %70/%126/%161: t < 2   → %76 = (t-1) * ((t-2) * ((t-2) * -0.5))
 *                              (== -0.5*(t-2)^2*(t-1))
 *   else                                              → 0
 */
function keysBicubic(t: number): number {
  // Direct TS mapping of the IR piecewise selector.
  if (t < -2.0) {
    // @IR %44 br true → phi picks 0.0 at %77
    return 0.0;
  }
  if (t < -1.0) {
    // @IR %47..%52
    const a48 = Math.fround(t + 1.0); // %48 = fadd t, 1.0
    const a49 = Math.fround(a48 * 0.5); // %49 = fmul %48, 0.5
    const a50 = Math.fround(t + 2.0); // %50 = fadd t, 2.0
    const a51 = Math.fround(a50 * a49); // %51 = fmul %50, %49
    const a52 = Math.fround(a50 * a51); // %52 = fmul %50, %51
    return a52;
  }
  if (t < 0.0) {
    // @IR %55..%60
    const a56 = Math.fround(t * -2.5); // %56 = fmul t, -2.5
    const a57 = fmuladd(a56, t, 1.0); // %57 = fmuladd(%56, t, 1.0)
    const a58 = Math.fround(t * -1.5); // %58 = fmul t, -1.5
    const a59 = Math.fround(t * a58); // %59 = fmul t, %58
    const a60 = fmuladd(a59, t, a57); // %60 = fmuladd(%59, t, %57)
    return a60;
  }
  if (t < 1.0) {
    // @IR %63..%68
    const a64 = Math.fround(t * -2.5); // %64 = fmul t, -2.5
    const a65 = fmuladd(a64, t, 1.0); // %65 = fmuladd(%64, t, 1.0)
    const a66 = Math.fround(t * 1.5); // %66 = fmul t, 1.5
    const a67 = Math.fround(t * a66); // %67 = fmul t, %66
    const a68 = fmuladd(a67, t, a65); // %68 = fmuladd(%67, t, %65)
    return a68;
  }
  if (t < 2.0) {
    // @IR %71..%76
    const a72 = Math.fround(t + -2.0); // %72 = fadd t, -2.0
    const a73 = Math.fround(a72 * -0.5); // %73 = fmul %72, -0.5
    const a74 = Math.fround(a72 * a73); // %74 = fmul %72, %73
    const a75 = Math.fround(t + -1.0); // %75 = fadd t, -1.0
    const a76 = Math.fround(a75 * a74); // %76 = fmul %75, %74
    return a76;
  }
  // @IR %70 br false (t >= 2) → phi 0.0 at %77
  return 0.0;
}

/**
 * i32-narrowing cast of a float — mirrors `air.convert.s.i32.f.f32` (IR
 * calls %28, %31, %171, %212). Metal's signed float→int conversion is a
 * truncation toward zero of a value that is already integer-nearby (the
 * IR pre-adds 0.5 to make it a round-half-up), so `Math.trunc` after
 * having added the 0.5 offset in the caller gives the correct result.
 */
function airConvertSI32FF32(f: number): number {
  return Math.trunc(f) | 0;
}

/**
 * u32→f32 conversion — mirrors `air.convert.f.f32.u.i32` (IR %21). The
 * kernel gets `x` as `uint`; we coerce `>>> 0` first, then narrow.
 */
function airConvertFF32UI32(u: number): number {
  return Math.fround(u >>> 0);
}

/**
 * s32→f32 conversion — mirrors `air.convert.f.f32.s.i32` (IR %32/%34/%40/
 * %96/%206/%208).
 */
function airConvertFF32SI32(i: number): number {
  return Math.fround(i | 0);
}

/**
 * round-to-nearest-even f32 — mirrors `air.round.f32` (IR %170/%211).
 * Metal's `air.round` is round-half-to-even (IEEE roundeven). JS's
 * `Math.round` is round-half-up. Emulate roundeven directly.
 */
function airRound(f: number): number {
  const r = Math.round(f);
  // Half-to-even correction: if fractional part is exactly ±0.5, prefer even.
  const frac = Math.abs(f - Math.trunc(f));
  if (frac === 0.5) {
    const rTrunc = Math.trunc(f);
    // Move to nearest even neighbour.
    if ((rTrunc & 1) === 0) return Math.fround(rTrunc);
    return Math.fround(rTrunc + Math.sign(f));
  }
  return Math.fround(r);
}

/**
 * soOFlowEstimator_genBlurWeights — one dispatched thread.
 *
 * @param params  the constant-buffer params (buffer(0))
 * @param x       the [[thread_position_in_grid]] uint (row index)
 * @param weights the read-write float buffer that this thread will write
 *                a per-row weight-table slice into (buffer(1))
 *
 * @IR entire function @0x000000000a23fd.
 */
export function soOFlowEstimator_genBlurWeights(
  params: soOFlowEstimator_genBlurWeights_Params,
  x: number,
  weights: Float32Array,
): void {
  // Coerce grid index to unsigned; the guard below uses `icmp ult`.
  const xu = x >>> 0;

  // @IR %5 = load m_weightArrayDimY ; %6 = icmp ult %5, xu ; br %6, %223, %7
  // i.e. if (dimY <u xu) return
  const dimY = params.m_weightArrayDimY >>> 0;
  if (dimY < xu) {
    // @IR label %223: ret
    return;
  }

  // @IR %9 = load m_weightArrayDimX
  const dimX = params.m_weightArrayDimX | 0;

  // @IR %10 = mul i32 dimX, xu ; %11 = zext ; %12 = &weights[%11]
  // @IR %13 = %12 + 2  (pointer bias — first tap slot; weights[%13-2..] are markers)
  const rowBase = (dimX * (xu | 0)) | 0;
  const tapBase = (rowBase + 2) | 0;

  // @IR %15 = load m_sigma
  const sigma = Math.fround(params.m_sigma);
  // @IR %17 = load m_imageScale
  const imageScale = Math.fround(params.m_imageScale);
  // @IR %18 = fdiv 1.0, imageScale
  const invScale = Math.fround(1.0 / imageScale);
  // @IR %19 = air.fmax.f32(1.0, %18)
  const scaleMul = airFmax(1.0, invScale);
  // @IR %20 = fmul sigma, %19
  const sigmaScaled = Math.fround(sigma * scaleMul);

  // @IR %21 = u32→f32(xu) ; %22 = %21 + 0.5 ; %23 = %22 / imageScale
  const xf = airConvertFF32UI32(xu);
  const xfHalf = Math.fround(xf + 0.5);
  const centre = Math.fround(xfHalf / imageScale);

  // @IR %24 = fmul sigmaScaled, 2.0 ; %25 = air.fmax.f32(0.5, %24)
  const twoSigma = Math.fround(sigmaScaled * 2.0);
  const radius = airFmax(0.5, twoSigma);

  // @IR %26 = centre - radius ; %27 = %26 + 0.5 ; %28 = i32(%27)
  const firstF = Math.fround(Math.fround(centre - radius) + 0.5);
  const first = airConvertSI32FF32(firstF);

  // @IR %29 = radius + centre ; %30 = %29 + 0.5 ; %31 = i32(%30)
  const lastF = Math.fround(Math.fround(radius + centre) + 0.5);
  const last = airConvertSI32FF32(lastF);

  // @IR %32 = f32(first) ; store at weights[tapBase - 2]
  weights[(tapBase - 2) | 0] = airConvertFF32SI32(first);
  // @IR %34 = f32(last)  ; store at weights[tapBase - 1]
  weights[(tapBase - 1) | 0] = airConvertFF32SI32(last);

  // @IR %36 = icmp slt first, last ; br %36, %37, %82
  const rangeNonEmpty = first < last;

  // First loop @IR %37..%77: normalisation sum. For i in [first, last).
  let sumAll = Math.fround(0.0); // @IR %38 phi 0.0
  if (rangeNonEmpty) {
    let i = first | 0; // @IR %39 phi first
    for (;;) {
      // @IR %40 = f32(i) ; %41 = %40 + 0.5 ; %42 = %41 - centre ; %43 = %42 / sigmaScaled
      const iF = airConvertFF32SI32(i);
      const shifted = Math.fround(Math.fround(iF + 0.5) - centre);
      const tParam = Math.fround(shifted / sigmaScaled);
      // @IR %78 phi = keysBicubic(%43)
      const w = keysBicubic(tParam);
      // @IR %79 = %38 + %78
      sumAll = Math.fround(sumAll + w);
      // @IR %80 = i + 1 ; %81 = %80 == last ; br %81, %82, %37
      i = (i + 1) | 0;
      if (i === last) break;
    }
  }

  // @IR %83 phi sumAll ; %84 = %83 == 0.0
  const sumIsZero = sumAll === 0.0;
  // @IR %85 = 32768.0 / sumAll ; %86 = select sumIsZero, 32768.0, %85
  const q15Scale = sumIsZero
    ? Math.fround(32768.0)
    : Math.fround(32768.0 / sumAll);
  // @IR %87 = 1.0 / sumAll ; %88 = select sumIsZero, 1.0, %87
  const invSum = sumIsZero ? Math.fround(1.0) : Math.fround(1.0 / sumAll);

  // Second loop @IR %89..%191: iff range is non-empty. Same iteration
  // window [first, last); computes tap twice (once for the Q15
  // "is-significant" round, once for the fp32 write value — the IR
  // literally emits the piecewise TWICE and we mirror that faithfully).
  //
  // Loop-carried state (@IR phis at %89):
  //   %90 = leadingIdx      (init 0)
  //   %91 = zeroRunActive   (init 1 — "we're still in a leading-zero run")
  //   %92 = writtenCount    (init 0)
  //   %93 = iterI           (init first)
  //   %94 = trimmedFirst    (init first — advanced while zeroRun continues)
  //   %95 = tapSum          (init 0)
  let trimmedFirst = first | 0; // %94
  let writtenCount = 0; // %92
  let zeroRunActive = 1; // %91
  let leadingIdx = 0; // %90
  let tapSum = Math.fround(0.0); // %95

  if (rangeNonEmpty) {
    let iterI = first | 0; // %93
    for (;;) {
      // Recompute tParam for this iteration (@IR %96..%99, identical to loop 1).
      const iF = airConvertFF32SI32(iterI);
      const shifted = Math.fround(Math.fround(iF + 0.5) - centre);
      const tParam = Math.fround(shifted / sigmaScaled);

      // @IR %134 phi = keysBicubic(tParam) — Q15-scale predicate weight
      const wQ = keysBicubic(tParam);
      // @IR %135 = q15Scale * wQ
      const wQ15 = Math.fround(q15Scale * wQ);
      // @IR %169 phi = keysBicubic(tParam) — fp32 write weight (redundant recompute)
      const wF = keysBicubic(tParam);

      // @IR %170 = air.round(%135) ; %171 = i32(%170)
      const wQ15Int = airConvertSI32FF32(airRound(wQ15));

      // @IR %172 = zeroRunActive == 0 ; %173 = wQ15Int != 0
      // @IR %174 = select %172, true, %173  === (zeroRunActive == 0) || (wQ15Int != 0)
      // Rewritten: keep-tap ← (zeroRun ended already) OR (this tap is significant)
      const keepTap = zeroRunActive === 0 || wQ15Int !== 0;

      if (keepTap) {
        // @IR %177..%183 — write branch
        // @IR %178 = invSum * wF
        const wOut = Math.fround(invSum * wF);
        // @IR %179 = writtenCount + 1
        // @IR %181 = &weights[tapBase + writtenCount] ; store %178
        weights[(tapBase + writtenCount) | 0] = wOut;
        writtenCount = (writtenCount + 1) | 0;
        // @IR %182 = tapSum + wOut
        tapSum = Math.fround(tapSum + wOut);
        // @IR %183 = select wQ15Int != 0, iterI, leadingIdx
        // (If this is the first significant tap, snapshot iterI as leadingIdx.)
        if (wQ15Int !== 0) {
          leadingIdx = iterI | 0;
        }
        // @IR %188 = 0 on write branch  (zeroRunActive → 0 once we've kept a tap
        // OR wQ15Int was already 0-with-run-ended, i.e. once we entered the write
        // path we stay in "not-in-run" from now on).
        zeroRunActive = 0;
        // @IR %186 = trimmedFirst  (unchanged on write branch)
      } else {
        // @IR %175..%176 — skip branch (still in leading-zero run)
        // @IR %176 = trimmedFirst + 1
        trimmedFirst = (trimmedFirst + 1) | 0;
        // @IR %188 = 1 on skip branch (still in zero run)
        zeroRunActive = 1;
        // @IR %189 = leadingIdx (unchanged)
        // @IR %187 = writtenCount (unchanged)
      }

      // @IR %190 = iterI + 1 ; %191 = %190 == last ; br %191, %192, %89
      iterI = (iterI + 1) | 0;
      if (iterI === last) break;
    }
  }

  // @IR %192: post-loop2. If range was empty, tapSum stayed 0 and
  // trimmedFirst/leadingIdx stayed at their inits (which coincide with the
  // rangeEmpty=false loop-1 fall-through paths).
  // @IR %193 = tapSum ; %194 = trimmedFirst ; %195 = leadingIdx
  // @IR %196 = tapSum == 0.0 ; br %196, %197, %205

  if (tapSum === 0.0) {
    // @IR %197..%204 — degenerate all-zero-taps recovery.
    // %198 = weights[tapBase-2] ; %199 = weights[tapBase-1]
    const w0 = Math.fround(weights[(tapBase - 2) | 0]);
    const w1 = Math.fround(weights[(tapBase - 1) | 0]);
    // %200 = w0 + w1 ; %201 = %200 * 0.5 ; store at tapBase-2
    const midHalf = Math.fround(Math.fround(w0 + w1) * 0.5);
    weights[(tapBase - 2) | 0] = midHalf;
    // %202 = w1 + midHalf ; %203 = %202 * 0.5 ; %204 = %203 + 1 ; store at tapBase-1
    const nextHalf = Math.fround(Math.fround(w1 + midHalf) * 0.5);
    weights[(tapBase - 1) | 0] = Math.fround(nextHalf + 1.0);
    // store 1.0 at tapBase
    weights[tapBase | 0] = Math.fround(1.0);
    // @IR br %223 : ret
    return;
  }

  // @IR %205..%222 — non-zero-sum finalisation.
  // %206 = f32(trimmedFirst) ; store at tapBase-2
  weights[(tapBase - 2) | 0] = airConvertFF32SI32(trimmedFirst);
  // %207 = leadingIdx + 1 ; %208 = f32(%207) ; store at tapBase-1
  const lastMarker = (leadingIdx + 1) | 0;
  weights[(tapBase - 1) | 0] = airConvertFF32SI32(lastMarker);

  // @IR %209 = tapSum != 1.0 ; br %209, %210, %223
  if (tapSum !== 1.0) {
    // @IR %210..%222 — one-tap normalisation correction.
    // %211 = air.round(centre) ; %212 = i32(%211)
    const centreInt = airConvertSI32FF32(airRound(centre)) | 0;
    // %213 = centreInt <s trimmedFirst
    const centreBelowFirst = centreInt < trimmedFirst;
    // %214 = centreInt <s leadingIdx+1
    const centreBelowLast = centreInt < lastMarker;
    // %215 = select %214, centreInt, lastMarker
    const clampedRight = centreBelowLast ? centreInt : lastMarker;
    // %216 = 1.0 - tapSum
    const missing = Math.fround(1.0 - tapSum);
    // %217 = clampedRight - trimmedFirst
    const relIdx = (clampedRight - trimmedFirst) | 0;
    // %218 = select centreBelowFirst, 0, %217
    const writeIdx = centreBelowFirst ? 0 : relIdx;
    // %220 = &weights[tapBase + writeIdx] ; %221 = load ; %222 = missing + %221 ; store
    const slot = (tapBase + writeIdx) | 0;
    weights[slot] = Math.fround(missing + Math.fround(weights[slot]));
  }
  // @IR label %223: ret
}
