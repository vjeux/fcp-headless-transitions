// @shader blurDepthFragmentFunc (Lithium/LiSolidShaders) @0x00000000019ad9
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// blurDepthFragmentFunc.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib.
// The .ll header line reads
// `0x00000000019ad9 -- blurDepthFragmentFunc:` — the shader's entry
// offset in the metallib. Compile options:
// `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. The function attribute set
// carries `unsafe-fp-math=true`, `no-infs-fp-math=true`,
// `no-nans-fp-math=true`, `no-signed-zeros-fp-math=true`,
// `approx-func-fp-math=true`. Per SHADERS.md fast-math is fp32-
// narrowed via `Math.fround` on plain JS float ops; the fast-math IR
// flags do NOT license any algebraic re-association here — every
// fadd/fmul/fmax is mapped literally.
//
// This is a FRAGMENT shader (from !air.fragment metadata) with a
// depth output (`!17 = air.depth,...`), not a compute kernel. It
// performs a symmetric 7-tap 1-D Gaussian blur on a depth2d texture
// along a caller-supplied direction UV, then optionally clamps the
// result up against the centre-tap depth ("preserveEnergy" branch).
//
// Fragment signature (from !15..!23):
//   position       : float4  (unused; declared with `air.arg_unused`).
//   uv             : float2  (per-fragment centre sample UV).
//   tex            : depth2d<float, sample>  index 0.
//   directionUV    : constant float2* index 2 — the UV step per tap.
//   preserveEnergy : constant bool*  index 3 — nonzero enables the
//                                              final `max(blur, centre)`
//                                              step. The `!range !36`
//                                              metadata `[0, 2)` says
//                                              the underlying byte only
//                                              takes values 0 or 1.
//   output         : depth (float z).
//
// Sampler state (@__air_sampler_state.2 = [i64, i64] with i64 0
// following i64 34901797601020489 = 0x7C00000000000089): nearest with
// compare-func disabled and clamp-to-edge, sampling the depth channel
// (compare_level=1 arg at %31/%38 forces the LOD to level 1... no —
// the `i32 1` immediate arg to `air.sample_depth_2d.f32` is the
// `no_clamp_edge_or_zero` component-selector, per Metal's mangled
// intrinsic — modelled as opaque here; the caller supplies a callback).
//
// AIR intrinsics used:
//   air.convert.f.f32.s.i32(i32)              -- SIGNED int->float scalar.
//   air.sample_depth_2d.f32(tex, sampler, i32 1, uv,
//                            offset_valid=true, <0,0>,
//                            bias_valid=false, 0.0, 0.0, i32 0)
//                                             -> { float depth, i8 stat }.
//   air.fast_fmax.f32(a, b)                   -- fp32 max (unordered NaN
//                                                behaviour is
//                                                fp32-narrowed and matches
//                                                Math.max for finite inputs;
//                                                fast-math disables NaN
//                                                handling per attribute).
//
// The 7-tap weight table is INLINED as fp32 constants:
//   w[0] = 1.562500e-02 = 0.015625     = 1/64
//   w[1] = 9.375000e-02 = 0.09375      = 6/64
//   w[2] = 2.343750e-01 = 0.234375     = 15/64
//   w[3] = 3.125000e-01 = 0.3125       = 20/64
//   w[4] = 2.343750e-01 = 0.234375     = 15/64
//   w[5] = 9.375000e-02 = 0.09375      = 6/64
//   w[6] = 1.562500e-02 = 0.015625     = 1/64
// (Rows 6/7 of Pascal's triangle scaled to sum=1 — the exact
// binomial kernel — the fp32 exact form of a Gaussian for this radius.) These are stored to an
// `[7 x float]` alloca and read via `getelementptr [i]` inside the
// loop, so the transcription places them into a plain `const`
// array preserved verbatim as fp32.
//
// Line-by-line map of the .ll body:
//
//   block %5 (entry):
//     %6..%14   store the seven fp32 weight constants into a stack
//               `[7 x float]` alloca. Directly modelled as a const
//               array below.
//     %15 = load <2 x float> directionUV.
//     br label %19  (unconditionally into the loop).
//
//   block %19 (loop body — 7 iterations, i = 0..6):
//     %20 = phi float [ 0.0, %5 ], [ %34, %19 ]         -- accumulator.
//     %21 = phi i32   [ 0,   %5 ], [ %35, %19 ]         -- loop counter i.
//     %22 = i - 3                                        -- tap offset in [-3, 3].
//     %23 = air.convert.f.f32.s.i32(%22)                 -- SIGNED int->float.
//     %24, %25 = broadcast %23 to <2 x float>.
//     %26 = %25 * directionUV                            -- tap direction step.
//     %27 = zext i32 i to i64
//     %28 = &weights[i]                                  -- weight pointer.
//     %29 = load float weights[i].
//     %30 = %26 + uv                                     -- tap sample UV.
//     %31 = air.sample_depth_2d.f32(tex, sam, 1, %30, ...)
//     %32 = extractvalue %31, 0                          -- depth at tap.
//     %33 = %32 * %29                                    -- weighted tap.
//     %34 = %33 + %20                                    -- accumulate.
//     %35 = i + 1
//     %36 = icmp eq %35, 7                               -- last iteration?
//     br i1 %36, label %16, label %19, !llvm.loop
//
//   block %16 (post-loop):
//     %17 = load i8 preserveEnergy                       -- 0 or 1 per !range.
//     %18 = icmp eq preserveEnergy, 0
//     br i1 %18, label %37, label %41                    -- branch to fmax if 0
//                                                          (yes: read the labels
//                                                           carefully — %37 is
//                                                           the "not 0" path
//                                                           per the phi %42's
//                                                           source labels).
//     (Correction: the phi %42 in block %41 picks %40 from %37 and %34
//      from %16; so `preserveEnergy == 0` -> label %41 -> phi picks %34
//      (no fmax); `preserveEnergy != 0` -> label %37 -> phi picks %40
//      (fmax applied).  This is because a store of `false` to i8 is
//      an ALL-ZERO byte; the shader treats "preserveEnergy == 0" as
//      "no fmax needed".  So the fmax path is taken only when
//      preserveEnergy is truthy.)
//
//   block %37 (fmax path):
//     %38 = air.sample_depth_2d.f32(tex, sam, 1, uv, ...)  -- centre sample.
//     %39 = extractvalue %38, 0                            -- centre depth.
//     %40 = air.fast_fmax.f32(%34, %39)                    -- max(blur, centre).
//     br label %41.
//
//   block %41 (join / ret):
//     %42 = phi float [ %40, %37 ], [ %34, %16 ]
//     %43 = insertvalue undef, %42, 0
//     ret <{ float }> %43.

/**
 * Callback for AIR `air.sample_depth_2d.f32` — samples the depth
 * texture at (u, v) with the bound sampler and returns the scalar
 * depth value. The `i32 1` immediate lod/component-selector arg is
 * opaque to the callback (the caller is expected to bind whatever
 * FCP would have bound).
 */
export type SampleDepth2D<T> = (texture: T, u: number, v: number) => number;

/**
 * Fragment shader `blurDepthFragmentFunc`.
 *
 * Symmetric 7-tap 1-D Gaussian blur of a depth texture along a caller-
 * supplied direction UV. For a fragment at UV `uv`, evaluates
 *   blur = sum_{i=0..6} weights[i] * depth(tex, uv + (i - 3) * directionUV)
 * with weights = (1, 6, 15, 20, 15, 6, 1) / 64 — Pascal's-triangle
 * binomial kernel — the fp32 exact form of a Gaussian for this radius. When `preserveEnergy` is
 * truthy, the output is clamped up against the centre-tap depth:
 *   z = max(blur, depth(tex, uv))
 * else `z = blur`. The `max` never lowers a depth; combined with
 * downstream depth-test behaviour, this preserves the front-most
 * silhouette pixel and prevents the blur from bleeding depth
 * ("energy") behind existing surfaces.
 *
 * Denorms disabled + fast-math ENABLED per !air.compile_options —
 * every fp32 op is fp32-narrowed via `Math.fround`, but no algebraic
 * re-association is performed (the IR body is transcribed literally).
 *
 * @shader blurDepthFragmentFunc (Lithium/LiSolidShaders)
 */
export function blurDepthFragmentFunc<TDepth>(
  uv: [number, number],
  tex: TDepth,
  directionUV: [number, number],
  preserveEnergy: boolean,
  sampleDepth: SampleDepth2D<TDepth>,
): number {
  // %6..%14 : the seven fp32 weight constants (Pascal row-6 / 64).
  //   Modelled as a Float32Array via Math.fround so each constant is
  //   exactly the fp32 value the IR stores. (These decimals are all
  //   exactly representable in fp32; the Math.fround is defence-in-
  //   depth against a later editor introducing an inexact literal.)
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

  // Fragment-side UV load (caller supplies fp32 already, but we
  // narrow defensively — the IR reads `<2 x float>` from air.fragment_input).
  const uvU = Math.fround(uv[0]);
  const uvV = Math.fround(uv[1]);

  // %19 loop preheader: acc = 0.0, i = 0.
  let acc = Math.fround(0);

  // Loop body: seven iterations, i = 0..6.
  //   Mirrors block %19's iteration structure; the `%36 = icmp eq
  //   i+1, 7` exit test is the standard "run 7 times" idiom.
  for (let i = 0; i < 7; i = (i + 1) | 0) {
    // %22 = i - 3  ; %23 = fp32(i - 3)  ; %24, %25 broadcast to <2>.
    const tapIndex = (i - 3) | 0;
    const tapFloat = Math.fround(tapIndex);

    // %26 = <tapFloat, tapFloat> * directionUV.
    const stepU = Math.fround(tapFloat * dirU);
    const stepV = Math.fround(tapFloat * dirV);

    // %28, %29 = load weights[i] (fp32).
    const w = Math.fround(weights[i]);

    // %30 = %26 + uv  -- tap sample UV.
    const tapU = Math.fround(stepU + uvU);
    const tapV = Math.fround(stepV + uvV);

    // %31, %32 = air.sample_depth_2d.f32(tex, sam, 1, tapUV, ...)
    //           extract the depth scalar (first field of the returned struct).
    const d = Math.fround(sampleDepth(tex, tapU, tapV));

    // %33 = %32 * %29  ; %34 = %33 + %20  (fp32 fmul then fadd).
    acc = Math.fround(Math.fround(d * w) + acc);
    // (Loop-continue / exit at %35 / %36 handled by the `for` construct.)
  }

  // block %16 : load i8 preserveEnergy ; icmp eq 0.
  //   The .ll's !range !36 marks the byte as [0, 2) so it's a genuine
  //   boolean. The phi %42 picks %34 (acc) when preserveEnergy == 0
  //   and %40 (fmax) when preserveEnergy != 0 — see the corrected
  //   analysis in the header comment.
  if (!preserveEnergy) {
    // block %41 with phi(%34): return acc directly.
    return acc;
  }

  // block %37 : fmax path — sample the centre uv and clamp up.
  // %38 = air.sample_depth_2d.f32(tex, sam, 1, uv, ...)
  // %39 = extractvalue %38, 0  -- centre depth.
  const centreD = Math.fround(sampleDepth(tex, uvU, uvV));
  // %40 = air.fast_fmax.f32(acc, centreD).
  //   `no-nans-fp-math=true` in the attribute set says NaNs are UB,
  //   so we use Math.max (which returns NaN if either operand is NaN,
  //   but by the fast-math contract that input is never presented).
  const result = Math.fround(Math.max(acc, centreD));
  // block %41 with phi(%40): return result.
  return result;
}
