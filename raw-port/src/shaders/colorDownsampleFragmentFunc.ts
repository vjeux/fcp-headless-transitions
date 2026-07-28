// @shader colorDownsampleFragmentFunc (Lithium/LiSolidShaders) @0x00000000020279
// Source IR: raw-port/re/shaders/colorDownsampleFragmentFunc.ll
// (extracted from Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib via
// raw-port/tools/shader_disasm.sh). The .ll header line reads
// `0x00000000020279 -- colorDownsampleFragmentFunc:` — the shader's entry offset in the
// metallib.
//
// Fragment shader that downsamples an RGBA texture using a caller-supplied set of
// per-sample offsets & weights, with a SYMMETRIC-PAIR TWIST: each iteration reads TWO
// samples — one at `uv + offset` and one at `uv - offset` — and adds them with the same
// weight (so the effective kernel is symmetric around `uv`, i.e. one iteration accounts
// for both `+offset` and `-offset`). After the loop the alpha channel is clamped into
// [0, 1] (the RGB channels are NOT clamped — this is a direct TS mapping of the IR's
// `insertelement <4 x float> %11, float %14, i64 3`).
//
// Fragment signature (from !15..!25):
//   position       : float4  (unused; declared with `air.arg_unused`).
//   uv             : float2  (per-fragment centre sample UV).
//   inputTex       : texture2d<float, sample>  index 0.
//   numSamples     : constant uint*   index 2 — loop trip count.
//   weights        : constant float*  index 3 — per-sample scalar weight.
//   xOffsets       : constant float*  index 4 — per-sample U offset.
//   yOffsets       : constant float*  index 5 — per-sample V offset.
//   output         : float4  (RGBA colour to the render target).
//
// Sampler state (@__air_sampler_state.2) — opaque; caller-supplied `sampleColor` callback
// honours the FCP-runtime binding.
//
// Line-by-line map of the .ll body:
//
//   block %7 (entry):
//     %8  = load uint numSamples[0]
//     %9  = icmp eq %8, 0                                    -- if zero, skip loop.
//     br i1 %9, label %10, label %16
//
//   block %16 (loop body — iteration `i` in [0, numSamples)):
//     %17 = phi <4 x float> [ zero, %7 ], [ %38, %16 ]        -- rgba accumulator.
//     %18 = phi i32         [ 0,    %7 ], [ %39, %16 ]        -- loop counter.
//     %19 = zext i32 %18 to i64
//     %20 = &xOffsets[i]         (buffer %5 in .ll — bound to !24 "xOffsets")
//     %21 = load fp32 xOffsets[i]
//     %22 = insertelement <2 x float> undef, %21, i64 0
//     %23 = &yOffsets[i]         (buffer %6 in .ll — bound to !25 "yOffsets")
//     %24 = load fp32 yOffsets[i]
//     %25 = insertelement <2 x float> %22, %24, i64 1        -- offset = (x, y)
//     %26 = &weights[i]          (buffer %4 in .ll — bound to !23 "weights")
//     %27 = load fp32 weights[i]
//     %28 = <2 x float> %25 + uv                             -- uv+offset
//     %29 = air.sample_texture_2d.v4f32(inputTex, sam, %28, ...)
//     %30 = extractvalue %29, 0                              -- rgba at uv+offset
//     %31 = <2 x float> uv - %25                             -- uv-offset
//     %32 = air.sample_texture_2d.v4f32(inputTex, sam, %31, ...)
//     %33 = extractvalue %32, 0                              -- rgba at uv-offset
//     %34 = <4 x float> %33 + %30                            -- pair sum
//     %35..%36 = broadcast weight to <4 x float>
//     %37 = <4 x float> %34 * %36                            -- weighted pair
//     %38 = <4 x float> %37 + %17                            -- accumulate
//     %39 = i + 1
//     %40 = icmp eq %39, numSamples
//     br i1 %40, label %10, label %16, !llvm.loop
//
//   block %10 (post-loop / alpha clamp):
//     %11 = phi <4 x float> [ zero, %7 ], [ %38, %16 ]        -- final rgba (0 if numSamples==0).
//     %12 = extractelement %11, i64 3                         -- alpha
//     %13 = air.fast_fmin.f32(alpha, 1.0)                    -- fmin FIRST (per IR order)
//     %14 = air.fast_fmax.f32(%13, 0.0)                       -- then fmax with 0 -> [0, 1]
//     %15 = insertelement %11, %14, i64 3                     -- write clamped alpha back
//     ret <4 x float> %15
//
// Denorms disabled + fast-math ENABLED per !air.compile_options — every fp32 op is
// fp32-narrowed via `Math.fround`, but no algebraic re-association is performed (the IR
// body is a direct TS mapping). `no-nans-fp-math=true` licenses `Math.min/Math.max` as a
// direct TS mapping of `air.fast_fmin.f32 / air.fast_fmax.f32`.

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the RGBA texture at (u, v)
 * with the bound sampler and WRITES the result into the mutating `out` accumulator (per
 * SHADERS.md — "don't return tuples of Float32Array"). The `<2 x i32> zeroinitializer`
 * offset and `bias_valid=false / 0.0 / 0.0 / i32 0` args to the intrinsic are opaque to
 * the callback (the caller binds whatever FCP would have bound).
 */
export type SampleColor2D<T> = (
  texture: T,
  u: number,
  v: number,
  out: RgbaOut,
) => void;

/** Mutating accumulator for a <4 x float> value — avoids tuple returns per SHADERS.md. */
export interface RgbaOut {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Fragment shader `colorDownsampleFragmentFunc`.
 *
 * For a fragment at UV `uv`, evaluates
 *   acc = sum_{i=0..numSamples-1} weights[i] *
 *           ( sample(uv + (xOffsets[i], yOffsets[i]))
 *           + sample(uv - (xOffsets[i], yOffsets[i])) )
 * then clamps `acc.a` into [0, 1] (RGB untouched) and writes the result into `out`.
 *
 * When `numSamples[0] === 0` the loop is skipped and the returned colour is
 * `(0, 0, 0, 0)` before the alpha clamp — the clamp turns 0 into 0, so `out = (0,0,0,0)`.
 *
 * Denorms disabled + fast-math ENABLED per !air.compile_options — every fp32 op is
 * fp32-narrowed via `Math.fround`. Order of the fmin/fmax clamp is preserved literally
 * (fmin-with-1.0 first, then fmax-with-0.0), matching the IR.
 *
 * @shader colorDownsampleFragmentFunc (Lithium/LiSolidShaders)
 */
export function colorDownsampleFragmentFunc<TTex>(
  uv: [number, number],
  inputTex: TTex,
  numSamples: ArrayLike<number>,
  weights: ArrayLike<number>,
  xOffsets: ArrayLike<number>,
  yOffsets: ArrayLike<number>,
  sampleColor: SampleColor2D<TTex>,
  out: RgbaOut,
): void {
  // %8 = load uint numSamples[0]. Buffer is `dereferenceable(4)` — only slot 0.
  // The IR reads it as i32; we treat it as an unsigned count (>>> 0 for safety).
  const n = (numSamples[0] as number) >>> 0;

  // Fragment-side UV load (defensive fp32 narrowing).
  const uvU = Math.fround(uv[0]);
  const uvV = Math.fround(uv[1]);

  // %7 -> %10 branch when n == 0 : accumulator stays zero, then alpha-clamp runs on 0.
  // fmin(0, 1) = 0 ; fmax(0, 0) = 0. So the direct TS mapping is to just write zero.
  if (n === 0) {
    // %11 = zeroinitializer ; %12..%14 clamp of 0 = 0 ; %15 insertelement.
    out.r = Math.fround(0);
    out.g = Math.fround(0);
    out.b = Math.fround(0);
    out.a = Math.fround(0);
    return;
  }

  // %17 loop preheader: acc = <0,0,0,0>, i = 0.
  let accR = Math.fround(0);
  let accG = Math.fround(0);
  let accB = Math.fround(0);
  let accA = Math.fround(0);

  // Scratch for the sample callback (one allocation, mutated per tap-pair).
  const sPlus: RgbaOut = { r: 0, g: 0, b: 0, a: 0 };
  const sMinus: RgbaOut = { r: 0, g: 0, b: 0, a: 0 };

  // Loop `i = 0..n-1`. The IR's exit test is `icmp eq (i+1), numSamples` (bottom-tested);
  // the `for (i = 0; i < n; i++)` form is the direct TS mapping.
  for (let i = 0; i < n; i = (i + 1) | 0) {
    // %20/%21 : xOffsets[i] ; %22 insertelement lane 0.
    const xOff = Math.fround(xOffsets[i]);
    // %23/%24 : yOffsets[i] ; %25 insertelement lane 1.
    const yOff = Math.fround(yOffsets[i]);
    // %26/%27 : weights[i].
    const w = Math.fround(weights[i]);

    // %28 : uv + offset -> sample.
    const uPlus = Math.fround(uvU + xOff);
    const vPlus = Math.fround(uvV + yOff);
    sampleColor(inputTex, uPlus, vPlus, sPlus);
    const pR = Math.fround(sPlus.r);
    const pG = Math.fround(sPlus.g);
    const pB = Math.fround(sPlus.b);
    const pA = Math.fround(sPlus.a);

    // %31 : uv - offset -> sample. Note the IR is `fsub uv, offset` (uv is LHS), so this
    // is `uv - offset`, i.e. the mirror tap.
    const uMinus = Math.fround(uvU - xOff);
    const vMinus = Math.fround(uvV - yOff);
    sampleColor(inputTex, uMinus, vMinus, sMinus);
    const mR = Math.fround(sMinus.r);
    const mG = Math.fround(sMinus.g);
    const mB = Math.fround(sMinus.b);
    const mA = Math.fround(sMinus.a);

    // %34 : pair sum ; %37 : * weight ; %38 : += acc.
    const sumR = Math.fround(pR + mR);
    const sumG = Math.fround(pG + mG);
    const sumB = Math.fround(pB + mB);
    const sumA = Math.fround(pA + mA);
    accR = Math.fround(Math.fround(sumR * w) + accR);
    accG = Math.fround(Math.fround(sumG * w) + accG);
    accB = Math.fround(Math.fround(sumB * w) + accB);
    accA = Math.fround(Math.fround(sumA * w) + accA);
    // (Loop-continue / exit at %39 / %40 handled by the `for` construct.)
  }

  // block %10 (post-loop): clamp alpha into [0, 1]. IR order: fmin FIRST then fmax.
  // %13 = air.fast_fmin.f32(alpha, 1.0) ; %14 = air.fast_fmax.f32(%13, 0.0)
  const aFmin = Math.fround(Math.min(accA, Math.fround(1.0)));
  const aClamped = Math.fround(Math.max(aFmin, Math.fround(0.0)));

  // %15 = insertelement <4 x float> %11, float %14, i64 3.
  out.r = accR;
  out.g = accG;
  out.b = accB;
  out.a = aClamped;
}
