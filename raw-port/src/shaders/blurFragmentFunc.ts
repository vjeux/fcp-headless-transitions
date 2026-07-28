// @shader blurFragmentFunc (Lithium/LiSolidShaders) @0x00000000014ee9
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/blurFragmentFunc.ll, extracted via
// raw-port/tools/shader_disasm.sh from Lithium.framework/Versions/A/Resources/
// LiSolidShaders.metallib. The .ll header line reads
// `0x00000000014ee9 -- blurFragmentFunc:` — the shader's entry offset in the metallib.
// Compile options: `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. The function attribute set carries
// `unsafe-fp-math=true`, `no-infs-fp-math=true`, `no-nans-fp-math=true`,
// `no-signed-zeros-fp-math=true`, `approx-func-fp-math=true`. Per SHADERS.md fast-math is
// fp32-narrowed via `Math.fround` on plain JS float ops; the fast-math IR flags do NOT
// license any algebraic re-association here — every fadd/fmul/fmax is a direct TS mapping.
//
// This is a FRAGMENT shader (from !air.fragment metadata) with a colour output
// (`!17 = air.render_target,0,0 ; air.arg_type_name "float4"`), NOT a depth kernel. It is
// the RGBA-colour sibling of `blurDepthFragmentFunc` — same 7-tap 1-D binomial Gaussian
// along a caller-supplied direction UV, sampling `texture2d<float, sample>` and returning
// a `<4 x float>` colour. The optional `preserveEnergy` tail step clamps the output UP
// against the centre-tap colour via a componentwise `fmax`.
//
// Fragment signature (from !15..!23):
//   position       : float4  (unused; declared with `air.arg_unused`).
//   uv             : float2  (per-fragment centre sample UV).
//   tex            : texture2d<float, sample>  index 0.
//   directionUV    : constant float2* index 2 — the UV step per tap.
//   preserveEnergy : constant bool*  index 3 — nonzero enables the final
//                                              `fmax(blur, centre)` step. The `!range !36`
//                                              metadata `[0, 2)` says the underlying byte
//                                              only takes values 0 or 1.
//   output         : float4  (RGBA colour to the render target).
//
// Sampler state (@__air_sampler_state.2 = [i64 34901797601020489, i64 0]): the raw bit
// pattern is a Metal sampler descriptor blob that the caller-supplied `sampleColor2D`
// callback is expected to honour (nearest/linear/wrap/etc.). The transcription is opaque
// on the sampler configuration — the callback returns whatever FCP's runtime binds.
//
// AIR intrinsics used:
//   air.convert.f.f32.s.i32(i32)              -- SIGNED int->float scalar.
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true, <0,0>,
//                                bias_valid=false, 0.0, 0.0, i32 0)
//                                             -> { <4 x float> rgba, i8 stat }.
//   air.fast_fmax.v4f32(<4 x float>, <4 x float>) -- componentwise fp32 max.
//
// The 7-tap weight table is INLINED as fp32 constants:
//   w[0] = 1.562500e-02 = 0.015625     = 1/64
//   w[1] = 9.375000e-02 = 0.09375      = 6/64
//   w[2] = 2.343750e-01 = 0.234375     = 15/64
//   w[3] = 3.125000e-01 = 0.3125       = 20/64
//   w[4] = 2.343750e-01 = 0.234375     = 15/64
//   w[5] = 9.375000e-02 = 0.09375      = 6/64
//   w[6] = 1.562500e-02 = 0.015625     = 1/64
// (Rows 6/7 of Pascal's triangle scaled to sum=1 — the exact binomial kernel — the fp32
// exact form of a Gaussian for this radius.) These are stored to an `[7 x float]` alloca
// and read via `getelementptr [i]` inside the loop, so the transcription places them into
// a plain `const` array preserved verbatim as fp32.
//
// Line-by-line map of the .ll body:
//
//   block %5 (entry):
//     %6..%14   store the seven fp32 weight constants into a stack `[7 x float]` alloca.
//               Directly modelled as a const array below.
//     %15 = load <2 x float> directionUV.
//     br label %19  (unconditionally into the loop).
//
//   block %19 (loop body — 7 iterations, i = 0..6):
//     %20 = phi <4 x float> [ zeroinitializer, %5 ], [ %36, %19 ]   -- RGBA accumulator.
//     %21 = phi i32         [ 0,                %5 ], [ %37, %19 ]   -- loop counter i.
//     %22 = i - 3                                                    -- tap offset in [-3, 3].
//     %23 = air.convert.f.f32.s.i32(%22)                             -- SIGNED int->float.
//     %24, %25 = broadcast %23 to <2 x float>.
//     %26 = <2 x float> %25 * directionUV                            -- tap direction step.
//     %27 = zext i32 i to i64
//     %28 = &weights[i]                                              -- weight pointer.
//     %29 = load float weights[i].
//     %30, %31 = broadcast %29 to <4 x float>                        -- splat weight.
//     %32 = <2 x float> %26 + uv                                     -- tap sample UV.
//     %33 = air.sample_texture_2d.v4f32(tex, sam, %32, ...)
//     %34 = extractvalue %33, 0                                      -- rgba at tap.
//     %35 = <4 x float> %31 * %34                                    -- weighted tap.
//     %36 = <4 x float> %35 + %20                                    -- accumulate.
//     %37 = i + 1
//     %38 = icmp eq %37, 7                                           -- last iteration?
//     br i1 %38, label %16, label %19, !llvm.loop
//
//   block %16 (post-loop):
//     %17 = load i8 preserveEnergy                                   -- 0 or 1 per !range.
//     %18 = icmp eq preserveEnergy, 0
//     br i1 %18, label %39, label %43                                -- branch when 0 -> %43
//                                                                       (skip fmax path);
//                                                                       nonzero -> %39
//                                                                       (do the fmax).
//     Reading the phi %44 in block %43:
//       %44 = phi <4 x float> [ %42, %39 ], [ %36, %16 ]
//     confirms: preserveEnergy==0 flows via %16->%43 with %36 (raw acc); preserveEnergy!=0
//     flows via %16->%39->%43 with %42 (fmax result). Matches the sibling shader's control
//     flow exactly.
//
//   block %39 (fmax path):
//     %40 = air.sample_texture_2d.v4f32(tex, sam, uv, ...)           -- centre sample.
//     %41 = extractvalue %40, 0                                      -- centre rgba.
//     %42 = air.fast_fmax.v4f32(%36, %41)                            -- max(blur, centre).
//     br label %43.
//
//   block %43 (join / ret):
//     %44 = phi <4 x float> [ %42, %39 ], [ %36, %16 ]
//     ret <4 x float> %44.

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the RGBA texture at (u, v)
 * with the bound sampler and returns a 4-tuple of fp32 colour values. The immediate
 * `<2 x i32> zeroinitializer` offset and `bias_valid=false / 0.0 / 0.0 / i32 0` args to
 * the intrinsic are opaque to the callback (the caller is expected to bind whatever FCP
 * would have bound). The result is a mutating accumulator object per SHADERS.md ("don't
 * return tuples of Float32Array") — the callback WRITES `out.r/g/b/a`.
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
 * Fragment shader `blurFragmentFunc`.
 *
 * Symmetric 7-tap 1-D Gaussian blur of an RGBA texture along a caller-supplied direction
 * UV. For a fragment at UV `uv`, evaluates
 *   blur = sum_{i=0..6} weights[i] * sample(tex, uv + (i - 3) * directionUV)
 * with weights = (1, 6, 15, 20, 15, 6, 1) / 64 — Pascal's-triangle binomial kernel — the
 * fp32 exact form of a Gaussian for this radius. When `preserveEnergy` is truthy, the
 * output is clamped up against the centre-tap colour, componentwise:
 *   out = fmax(blur, sample(tex, uv))
 * else `out = blur`. This is the RGBA sibling of `blurDepthFragmentFunc` — same control
 * flow, different sample type.
 *
 * Denorms disabled + fast-math ENABLED per !air.compile_options — every fp32 op is
 * fp32-narrowed via `Math.fround`, but no algebraic re-association is performed (the IR
 * body is a direct TS mapping).
 *
 * Writes the result into `out` (mutating accumulator, per SHADERS.md).
 *
 * @shader blurFragmentFunc (Lithium/LiSolidShaders)
 */
export function blurFragmentFunc<TTex>(
  uv: [number, number],
  tex: TTex,
  directionUV: [number, number],
  preserveEnergy: boolean,
  sampleColor: SampleColor2D<TTex>,
  out: RgbaOut,
): void {
  // %6..%14 : the seven fp32 weight constants (Pascal row-6 / 64). Modelled as a plain
  // const array; each literal is exactly representable in fp32 (Math.fround is a defensive
  // narrowing so a later inexact edit cannot silently drift).
  const weights: readonly number[] = [
    Math.fround(0.015625),  // w[0] = 1.562500e-02
    Math.fround(0.09375),   // w[1] = 9.375000e-02
    Math.fround(0.234375),  // w[2] = 2.343750e-01
    Math.fround(0.3125),    // w[3] = 3.125000e-01
    Math.fround(0.234375),  // w[4] = 2.343750e-01
    Math.fround(0.09375),   // w[5] = 9.375000e-02
    Math.fround(0.015625),  // w[6] = 1.562500e-02
  ];

  // %15 = load <2 x float> directionUV.
  const dirU = Math.fround(directionUV[0]);
  const dirV = Math.fround(directionUV[1]);

  // Fragment-side UV load (caller supplies fp32 already, but we narrow defensively — the
  // IR reads `<2 x float>` from air.fragment_input).
  const uvU = Math.fround(uv[0]);
  const uvV = Math.fround(uv[1]);

  // %19 loop preheader: acc = <0,0,0,0>, i = 0.
  let accR = Math.fround(0);
  let accG = Math.fround(0);
  let accB = Math.fround(0);
  let accA = Math.fround(0);

  // Scratch for the sample callback — one allocation, mutated per tap.
  const tap: RgbaOut = { r: 0, g: 0, b: 0, a: 0 };

  // Loop body: seven iterations, i = 0..6. Mirrors block %19's iteration structure;
  // the `%38 = icmp eq i+1, 7` exit test is the standard "run 7 times" idiom.
  for (let i = 0; i < 7; i = (i + 1) | 0) {
    // %22 = i - 3  ; %23 = fp32(i - 3)  ; %24, %25 broadcast to <2>.
    const tapIndex = (i - 3) | 0;
    const tapFloat = Math.fround(tapIndex);

    // %26 = <tapFloat, tapFloat> * directionUV.
    const stepU = Math.fround(tapFloat * dirU);
    const stepV = Math.fround(tapFloat * dirV);

    // %28, %29 = load weights[i] (fp32) ; %30, %31 broadcast to <4>.
    const w = Math.fround(weights[i]);

    // %32 = %26 + uv  -- tap sample UV.
    const tapU = Math.fround(stepU + uvU);
    const tapV = Math.fround(stepV + uvV);

    // %33, %34 = air.sample_texture_2d.v4f32(tex, sam, tapUV, ...)
    //           extract the <4 x float> RGBA (first field of the returned struct).
    sampleColor(tex, tapU, tapV, tap);
    const tR = Math.fround(tap.r);
    const tG = Math.fround(tap.g);
    const tB = Math.fround(tap.b);
    const tA = Math.fround(tap.a);

    // %35 = %31 * %34 (fp32 fmul, componentwise) ; %36 = %35 + %20 (fp32 fadd).
    accR = Math.fround(Math.fround(tR * w) + accR);
    accG = Math.fround(Math.fround(tG * w) + accG);
    accB = Math.fround(Math.fround(tB * w) + accB);
    accA = Math.fround(Math.fround(tA * w) + accA);
    // (Loop-continue / exit at %37 / %38 handled by the `for` construct.)
  }

  // block %16 : load i8 preserveEnergy ; icmp eq 0. The .ll's !range !36 marks the byte as
  // [0, 2) so it's a genuine boolean. The phi %44 picks %36 (acc) when preserveEnergy == 0
  // and %42 (fmax) when preserveEnergy != 0.
  if (!preserveEnergy) {
    // block %43 with phi(%36): write acc directly.
    out.r = accR;
    out.g = accG;
    out.b = accB;
    out.a = accA;
    return;
  }

  // block %39 : fmax path — sample the centre uv and clamp up componentwise.
  // %40 = air.sample_texture_2d.v4f32(tex, sam, uv, ...)
  // %41 = extractvalue %40, 0  -- centre rgba.
  sampleColor(tex, uvU, uvV, tap);
  const cR = Math.fround(tap.r);
  const cG = Math.fround(tap.g);
  const cB = Math.fround(tap.b);
  const cA = Math.fround(tap.a);
  // %42 = air.fast_fmax.v4f32(acc, centre). `no-nans-fp-math=true` in the attribute set
  // says NaNs are UB, so Math.max is a direct TS mapping (any NaN input would be a
  // caller-side contract violation).
  out.r = Math.fround(Math.max(accR, cR));
  out.g = Math.fround(Math.max(accG, cG));
  out.b = Math.fround(Math.max(accB, cB));
  out.a = Math.fround(Math.max(accA, cA));
  // block %43 with phi(%42): return (via `out`).
}
