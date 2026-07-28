// @shader depthDownsampleFragmentFunc (Lithium)
// Source IR: raw-port/re/shaders/depthDownsampleFragmentFunc.ll
// (extracted from Lithium.framework/.../LiSolidShaders.metallib @0x0000000001f1b9)
/**
 * @shader depthDownsampleFragmentFunc (Lithium)
 *
 * Depth-buffer downsampling fragment shader. For each output fragment (at
 * UV `uv`), it samples the input depth texture at 2*numSamples offsets
 * arranged symmetrically around `uv` (uv+offset[i] and uv-offset[i], for
 * i in [0, numSamples)) and returns the MINIMUM depth across all those
 * samples. The initial accumulator is 1.0f (the far-plane sentinel), so
 * when numSamples == 0 the fragment simply returns 1.0.
 *
 * Semantically this is a "closest-fragment wins" downsampler — useful for
 * building a coarser depth pyramid that preserves foreground edges.
 *
 * Signature from !air.fragment (!15):
 *   fragment float depthDownsampleFragmentFunc(
 *       float4                     position       [[position]]        // unused
 *       float2                     uv             [[user(uv)]],
 *       depth2d<float,sample>      inputtex       [[texture(0)]],
 *       constant int              *numSamples     [[buffer(2)]],
 *       constant float2           *offsets        [[buffer(3)]]);
 *
 * Return type is the AIR-quirky wrapped struct `<{ float }>` marked as
 * `air.depth` (see !17) — the fragment writes the min-depth to the depth
 * buffer directly.
 *
 * Fast-math is ENABLED (!13 air.compile.fast_math_enable), so every fp32
 * op is fp32-narrowed via Math.fround (matches the "unsafe-fp-math=true"
 * shader attribute; the resulting behaviour is bit-for-bit float32).
 *
 * The sampler is a compile-time-fixed state constant `@__air_sampler_state.3`
 * baked into the .metallib — no user sampler is bound. The `i1 true, <2 x i32>
 * zeroinitializer, i1 false, float 0.0, float 0.0, i32 0` trailing args to
 * `air.sample_depth_2d.f32` describe LOD/offset/min-LOD/coordinate mode; we
 * expose the sampler through the `sample_inputtex(uv)` callback so callers
 * can supply their own bit-exact depth sampler.
 */

/** RGBA-free (single-lane) depth sampler contract for `air.sample_depth_2d.f32`. */
export type SampleDepth2D = (uv: [number, number]) => number;

/**
 * depthDownsampleFragmentFunc — one fragment invocation.
 *
 * @param _position   [[position]] — unused (air.arg_unused).
 * @param uv          per-fragment UV.
 * @param sample_inputtex  bound depth2d<float,sample> reader.
 * @param numSamples  constant int * — number of paired samples to fetch.
 * @param offsets     constant float2 * — array of `numSamples` UV offsets.
 *
 * @returns the fragment depth value (float).
 *
 * @IR entire function @0x0000000001f1b9.
 */
export function depthDownsampleFragmentFunc(
  _position: [number, number, number, number],
  uv: [number, number],
  sample_inputtex: SampleDepth2D,
  numSamples: number,
  offsets: [number, number][],
): number {
  // Load numSamples (i32).  @IR %6 = load i32 @numSamples, align 4
  const n = numSamples | 0;

  // %7 = icmp sgt %6, 0 (SIGNED). If numSamples <= 0, skip the loop and
  // return the entry-phi value 1.0 (see @IR %9 phi's first incoming).
  //   @IR %7 br i1
  if (n <= 0) {
    // %8 predecessor from %5:  %9 phi [1.0, %5]
    // %10 = insertvalue <{ float }> undef, 1.0, 0
    // ret <{ float }> %10
    return Math.fround(1);
  }

  // Loop block %11. Two phis:
  //   %12 = z_min accumulator (init 1.0f, updated to %26 each iteration)
  //   %13 = i (init 0, updated to %27 = i+1)
  let z_min = Math.fround(1);

  for (let i = 0; i < n; i = (i + 1) | 0) {
    // Load offsets[i] as <2 x float>.
    //   @IR %14 = zext i32 i to i64
    //   @IR %15 = getelementptr <2 x float> @offsets, i64 %14
    //   @IR %16 = load <2 x float> %15, align 8
    const ox = Math.fround(offsets[i][0]);
    const oy = Math.fround(offsets[i][1]);

    // uv+offset — first paired sample.
    //   @IR %17 = fadd fast <2 x float> %16, uv
    const uvPlusX = Math.fround(ox + Math.fround(uv[0]));
    const uvPlusY = Math.fround(oy + Math.fround(uv[1]));

    // Sample inputtex at (uv+offset). i32 constant `1` is the sampler-lod
    // selector; the wrapped sampler state and its trailing modality args
    // are the compile-time baked constants (see file-level doc-comment).
    //   @IR %18 = air.sample_depth_2d.f32(inputtex, sampler_state.3, 1, %17, true, 0, false, 0.0, 0.0, 0)
    //   @IR %19 = extractvalue { float, i8 } %18, 0
    const sPlus = Math.fround(sample_inputtex([uvPlusX, uvPlusY]));

    // z_min = min(z_min, sPlus). Encoded as `fcmp olt` + select.
    //   @IR %20 = fcmp fast olt %19, %12
    //   @IR %21 = select i1 %20, float %19, float %12
    const z_afterPlus = sPlus < z_min ? sPlus : z_min;

    // uv-offset — second paired sample.
    //   @IR %22 = fsub fast <2 x float> uv, %16
    const uvMinusX = Math.fround(Math.fround(uv[0]) - ox);
    const uvMinusY = Math.fround(Math.fround(uv[1]) - oy);

    // Sample inputtex at (uv-offset).
    //   @IR %23 = air.sample_depth_2d.f32(inputtex, sampler_state.3, 1, %22, true, 0, false, 0.0, 0.0, 0)
    //   @IR %24 = extractvalue { float, i8 } %23, 0
    const sMinus = Math.fround(sample_inputtex([uvMinusX, uvMinusY]));

    // z_min = min(z_afterPlus, sMinus).
    //   @IR %25 = fcmp fast olt %24, %21
    //   @IR %26 = select i1 %25, float %24, float %21
    z_min = sMinus < z_afterPlus ? sMinus : z_afterPlus;

    // %27 = i+1 ; %28 = icmp eq numSamples → exit to block %8.
  }

  // Block %8 exit: %9 = phi float [1.0, %5], [%26, %11]; the second incoming
  // holds our final z_min.
  //   @IR %10 = insertvalue <{ float }> undef, %9, 0 ; ret <{ float }> %10
  return z_min;
}
