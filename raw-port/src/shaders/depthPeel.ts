// depthPeel.ts — depth-peel visibility test: discard fragments in front of the peel layer.
// @shader depthPeel (Lithium)
// Source IR: raw-port/re/shaders/depthPeel.ll
// Compiled from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib @0x00000000025729
//
// LLVM IR signature (from the .ll):
//   define float @depthPeel(
//       <3 x float> %0 = screenNDC (air.visible_input, "float3")  (!19)
//     , depth2d     %1 = t         (air.visible_input, previous-layer depth texture) (!20)
//   ) -> air.visible_output (float)  (!17)
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. All fp32 ops use plain JS float math via Math.fround.
//
// Purpose: this is a classic "depth peel" test. On each depth-peel pass, `t` holds the depth
// buffer from the PREVIOUS peel layer; the shader discards fragments whose adjusted depth is
// closer than that layer (they've already been drawn) and passes fragments that are deeper.
// A small bias (peelDepth * (1 - peelDepth^2) * 0.0025) is subtracted from the fragment's
// z to avoid z-fighting with the previously-peeled surface.
//
// Algorithm (faithful trace of %3..%14):
//   %3  = shufflevector %0, poison, <i32 0, i32 1>  — take screenNDC.xy as the sample uv.
//   %4  = sample depth texture at %3 (compare-sample form, i32 1 = compare_less; here used
//         for its float result — .u.f8 flag byte is discarded).
//   %5  = extractvalue %4, 0  — previous-layer depth D at this pixel.
//   %6  = D * D
//   %7  = 1.0 - D*D
//   %8  = (1.0 - D*D) * 0.0025  (double 0x3F647AE140000000 fp32-narrowed to 0.0025)
//   %9  = screenNDC.z  (this fragment's depth)
//   %10 = z - bias
//   %11 = (z - bias) < D  ? — fragment is IN FRONT of previous-layer depth
//   if (%11) discard else keep. Return 0.0 if discarded, 1.0 otherwise.

/**
 * Depth-texture sample callback modelling `air.sample_depth_2d.f32(t, sampler, i32 1, uv, ...)`.
 * Returns the previous-layer depth stored at (uv.x, uv.y).
 *
 * The IR passes `i32 1` (compare_less) plus a compare-value of 0.0 as parameters, but only the
 * plain-float result at extractvalue index 0 is consumed by subsequent arithmetic — this shader
 * uses the sample as a raw depth read, not a compare-result. So a raw depth-read callback matches
 * the observed data flow.
 */
export type SampleDepthFn = (uv: [number, number]) => number;

/**
 * Discard signal returned when the fragment is culled by the peel test.
 *
 * The IR calls `air.discard_fragment()` and then, purely for the visible_output return, phis a
 * 0.0 for discarded fragments and 1.0 for kept fragments. Callers running this on the CPU cannot
 * literally discard from an in-flight framebuffer — this port surfaces the discard decision as
 * the numeric return value (0.0 = discarded, 1.0 = kept). Whether to skip the write is the
 * caller's responsibility.
 */
export type DepthPeelOutput = number;

/**
 * @shader depthPeel (Lithium) — faithful port of the AIR IR.
 *
 * @param screenNDC Fragment's screen-space NDC position (x, y in [0,1] uv, z is depth) — %0.
 * @param sample    Depth-texture sampler callback for the previous peel layer's depth (%1).
 */
export function depthPeel(
  screenNDC: [number, number, number],
  sample: SampleDepthFn,
): DepthPeelOutput {
  // %3 = shufflevector <3 x float> %0, poison, <2 x i32> <0, 1>  — uv = screenNDC.xy.
  const uv: [number, number] = [screenNDC[0], screenNDC[1]];

  // %4 = air.sample_depth_2d.f32(t, sampler, i32 1, uv, ...)  — previous-layer depth at uv.
  // %5 = extractvalue { float, i8 } %4, 0  — the float channel (previous depth D).
  const D = sample(uv); // %5

  // %6 = fmul fast float %5, %5  — D * D
  const dSq = Math.fround(D * D); // %6
  // %7 = fsub fast float 1.0, %6 — 1.0 - D*D
  const oneMinusDSq = Math.fround(1.0 - dSq); // %7
  // %8 = fmul fast float %7, 0x3F647AE140000000  — * 0.0025 (double fp32-narrowed).
  //   The .ll bit-pattern 0x3F647AE140000000 = double 0.0024999999441206455, which is bit-exactly
  //   Math.fround(0.0025) after fp32-narrowing at the intrinsic callsite.
  const bias = Math.fround(oneMinusDSq * Math.fround(0.0025)); // %8

  // %9  = extractelement <3 x float> %0, i64 2  — this fragment's depth (screenNDC.z).
  const z = screenNDC[2]; // %9
  // %10 = fsub fast float %9, %8  — z - bias  (biased fragment depth for the compare)
  const zAdj = Math.fround(z - bias); // %10

  // %11 = fcmp fast olt float %10, %5  — biased-z < D  ⇒ fragment is IN FRONT of the peel layer.
  const inFront = zAdj < D; // %11
  // br i1 %11, label %12 /*discard*/, label %13 /*keep*/
  if (inFront) {
    // %12: air.discard_fragment()  — this fragment is discarded.
    //   In a real GPU pipeline the raster write is dropped entirely; on the CPU we return 0.0
    //   (matches the phi in %14) so callers can gate their write on the return value.
    return 0.0; // phi %14 -> [ 0.0, %12 ]
  }
  // %14 = phi float [ 1.0, %2 (non-discard path) ]
  return 1.0;
}
