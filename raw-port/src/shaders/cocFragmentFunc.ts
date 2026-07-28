// cocFragmentFunc.ts — depth-buffer -> circle-of-confusion (CoC) radius fragment shader.
// @shader cocFragmentFunc (Lithium)
// Source IR: raw-port/re/shaders/cocFragmentFunc.ll
// Compiled from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib @0x00000000013ab9
//
// LLVM IR signature (from the .ll):
//   define <4 x float> @cocFragmentFunc(
//       <4 x float> %0  = fragment position (air.position, unused)                  (!19)
//     , <2 x float> %1  = uv (air.fragment_input, perspective-interpolated)         (!20)
//     , texture2d    %2 = zBuffer (air.texture, location 0)                         (!21)
//     , float4x4     %3 = invProj — inverse projection matrix (air.buffer, size 64) (!22)
//     , float        %4 = dofNear — near depth-of-field boundary                    (!23)
//     , float        %5 = dofFar  — far  depth-of-field boundary                    (!24)
//     , float        %6 = aperture                                                  (!25)
//     , float        %7 = farPlane                                                  (!26)
//     , float        %8 = maxRadius — CoC clamp                                     (!27)
//   ) -> render_target 0 (float4)
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. All fp arithmetic uses plain JS float ops
// fp32-narrowed via Math.fround. Constants come from the .ll bit-patterns.
//
// Algorithm (faithful trace of %10..%51):
//   1. Sample zBuffer at uv -> depth (R channel = %12, full float4 also used as broadcast).
//   2. Reconstruct view-space Z from NDC depth via invProj: viewH = invProj.col2 * depth
//      + invProj.col3; then viewZ = (viewH / viewH.w).z.  (%14..%22)
//   3. Distance-from-camera = -viewZ (camera looks down -Z).  (%23)
//   4. In-focus test: if dofNear > dist OR dofFar < dist, we're OUT of the focus zone.  (%25/%27/%28)
//      If in-focus (else branch of %28), output (0,0,0,0).  (phi %51 <- zeroinitializer)
//   5. Near out-of-focus (%25 true):  coc = viewZ + dofNear.  (%31)
//   6. Far  out-of-focus (%25 false, %27 true):
//        - Skip if |depth| > 0.9999 (background sky-clamp): coc = 0.  (%33/%34)
//        - Otherwise coc = min(dist - dofFar, farPlane - dofFar).  (%36..%39)
//   7. radius = aperture * coc / dist, then radius = min(radius, maxRadius).  (%43..%46)
//   8. Return (radius, radius, radius, 1.0).  (%47..%49, phi %51)
//
// Constant decoded from the .ll:
//   float 0x3FEFFF2E40000000 = double 0.9998999834060669 -> fp32-narrowed 0.9999
//   (used at %34 as the |depth| skip threshold — treats the far-clip depth as background sky).

/**
 * Texture sample callback modelling `air.sample_texture_2d.v4f32(zBuffer, sampler, uv, ...)`.
 * Returns a 4-lane float RGBA sample. The shader only uses lane 0 (R = depth).
 */
export type SampleFn = (uv: [number, number]) => [number, number, number, number];

/**
 * Output of the CoC fragment shader — a single render_target float4.
 * Lanes 0/1/2 all carry the CoC radius; lane 3 is 1.0 (see %47 constant vector).
 */
export type CocFragmentOutput = [number, number, number, number];

/**
 * @shader cocFragmentFunc (Lithium) — faithful port of the AIR IR.
 *
 * @param uv        Interpolated per-fragment texture coordinate (%1).
 * @param sample    Sampler callback for the zBuffer texture (%2 + %__air_sampler_state.2).
 * @param invProj   4x4 inverse-projection matrix as 16 column-major float32s (%3).
 *                  Column K occupies invProj[K*4 .. K*4+3].
 * @param dofNear   Near depth-of-field boundary (%4).
 * @param dofFar    Far  depth-of-field boundary (%5).
 * @param aperture  Aperture scale (%6).
 * @param farPlane  Far plane distance (%7).
 * @param maxRadius Maximum allowed CoC radius (%8).
 */
export function cocFragmentFunc(
  uv: [number, number],
  sample: SampleFn,
  invProj: Float32Array,
  dofNear: number,
  dofFar: number,
  aperture: number,
  farPlane: number,
  maxRadius: number,
): CocFragmentOutput {
  // %10 = air.sample_texture_2d.v4f32(zBuffer, sampler, uv, ...) — depth sample.
  // %11 = extractvalue %10, 0 — the <4 x float> RGBA lanes.
  const zSample = sample(uv);
  // %12 = extractelement %11, i64 0 — R lane (raw depth, kept for the |depth| skip test).
  const depthR = zSample[0]; // %12

  // %13 = &invProj.columns[2] ; %14 = load col2  (used in %18 for depth*col2)
  const c2x = invProj[8],  c2y = invProj[9],  c2z = invProj[10], c2w = invProj[11]; // %14
  // %15 = &invProj.columns[3] ; %16 = load col3
  const c3x = invProj[12], c3y = invProj[13], c3z = invProj[14], c3w = invProj[15]; // %16

  // %17 = shufflevector %11, poison, <0,0,0,0> — broadcast depth (R lane) to all 4 lanes.
  //   Note: shuffling with lane 0 uses R for every lane; the extract at %12 above is redundant
  //   with lane 0 of this broadcast, but the IR names both distinctly.
  const dB = depthR; // broadcasted depth scalar

  // %18 = fmul fast <4 x float> %17, %14  — depth * col2
  // %19 = fadd fast <4 x float> %18, %16  — (depth * col2) + col3  == invProj · (0,0,depth,1)
  const vhX = Math.fround(Math.fround(dB * c2x) + c3x); // %19.x
  const vhY = Math.fround(Math.fround(dB * c2y) + c3y); // %19.y
  const vhZ = Math.fround(Math.fround(dB * c2z) + c3z); // %19.z
  const vhW = Math.fround(Math.fround(dB * c2w) + c3w); // %19.w

  // %20 = shufflevector %19, undef, <undef,undef,3,undef> — broadcast lane 3 of %19 (w) to lane 2.
  //   Only lane 2 of the result is used at %22 below, so we only need vhW as the divisor.
  // %21 = fdiv fast <4 x float> %19, %20 — homogeneous divide (only lane 2 is consumed).
  // %22 = extractelement %21, i64 2 — viewZ.
  const viewZ = Math.fround(vhZ / vhW); // %22
  // %23 = fneg fast float %22 — camera-space distance (positive; camera looks down -Z).
  const dist = Math.fround(-viewZ); // %23

  // %24 = load dofNear ; %25 = fcmp fast ogt float %24, %23  — dofNear > dist  ("near out-of-focus")
  const nearOOF = dofNear > dist; // %25
  // %26 = load dofFar  ; %27 = fcmp fast olt float %26, %23  — dofFar  < dist  ("far  out-of-focus")
  const farOOF = dofFar < dist; // %27
  // %28 = select i1 %25, i1 true, i1 %27  — logical OR (short-circuit) = any-out-of-focus.
  const anyOOF = nearOOF ? true : farOOF; // %28
  // br i1 %28, label %29 /*OOF path*/, label %50 /*in-focus, returns zeros*/
  if (!anyOOF) {
    // %51 = phi ..., [ zeroinitializer, %9 ] — in-focus fragments return zero.
    return [0, 0, 0, 0];
  }

  // OOF path (%29):
  //   br i1 %25, label %30 /*near*/, label %32 /*far branch prologue*/
  let coc: number; // %41 = phi float [ %31, %30 ], [ %39, %35 ], [ 0.0, %32 ]
  if (nearOOF) {
    // %30: %31 = fadd fast float %22, %24  — viewZ + dofNear  (viewZ is negative; equals dofNear - dist)
    coc = Math.fround(viewZ + dofNear); // %31
  } else {
    // %32: %33 = tail call fast air.fast_fabs.f32(float %12) — |raw depth R|
    const absDepth = Math.fround(Math.abs(depthR)); // %33
    // %34 = fcmp fast ogt float %33, 0x3FEFFF2E40000000  — |depth| > 0.9999 (fp32-narrowed from
    //       double 0.9998999834060669 — sky/background clamp at ~far-clip depth).
    if (absDepth > Math.fround(0.9998999834060669)) { // %34
      // br to %40 with phi = 0.0 (default third phi predecessor)
      coc = 0.0;
    } else {
      // %35: far out-of-focus body.
      // %36 = fsub fast float %23, %26  — dist - dofFar
      const distMinusFar = Math.fround(dist - dofFar); // %36
      // %37 = load farPlane ; %38 = fsub fast float %37, %26  — farPlane - dofFar
      const farExtent = Math.fround(farPlane - dofFar); // %38
      // %39 = tail call fast air.fast_fmin.f32(float %36, float %38)
      coc = Math.fround(Math.min(distMinusFar, farExtent)); // %39
    }
  }

  // %42 = load aperture ; %43 = fmul fast float %42, %41  — aperture * coc
  const scaled = Math.fround(aperture * coc); // %43
  // %44 = fdiv fast float %43, %23  — divide by dist (positive)
  const perDist = Math.fround(scaled / dist); // %44
  // %45 = load maxRadius ; %46 = fast_fmin(%44, %45)
  const radius = Math.fround(Math.min(perDist, maxRadius)); // %46

  // %47/%48/%49: insert radius into lanes 0,1,2 of <?,?,?,1.0> — output vector.
  return [radius, radius, radius, 1.0];
}
