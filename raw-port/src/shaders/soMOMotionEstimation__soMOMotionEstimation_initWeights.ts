// @shader soMOMotionEstimation::soMOMotionEstimation_initWeights (HeliumSenso) @0x000000000da7ad
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soMOMotionEstimation__soMOMotionEstimation_initWeights.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000da7ad -- soMOMotionEstimation::
// soMOMotionEstimation_initWeights:` — that is the shader's entry offset
// in the metallib. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_disable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_disable` means
// standard IEEE-754 fp32 semantics — direct TS mapping via Math.fround
// on every fadd/fsub/fmul; no fast-math relaxation applies.
//
// Compute kernel signature (from !14/!15/!16 metadata):
//   params buffer (address space 2, read-only) — soMOMotionEstimation
//     _initWeights_params, size 28 bytes, field layout (!18):
//       offset  0: uint  m_x0      // x-origin of the destination tile
//       offset  4: uint  m_y0      // y-origin of the destination tile
//       offset  8: uint  m_x1      // x-extent (exclusive)
//       offset 12: uint  m_y1      // y-extent (exclusive)
//       offset 16: uint  m_compute // mode: 0 = binary matte hit,
//                                  //       1 = pigt (r) weighted matte hit
//       offset 20: float m_invnorm // pigt scale factor
//       offset 24: uint  m_label   // matte label to match against
//   coord_ : uint2 — air.thread_position_in_grid
//   matte  : texture2d<uint, sample>  index 0 — label map
//   pigt   : texture2d<float, sample> index 1 — pigt weight source
//   weights: texture2d<float, write>  index 2 — output
//
// AIR intrinsics used:
//   air.convert.f.v2f32.u.v2i32(<2 x i32>) -> <2 x float>
//     — UNSIGNED int-to-float on the destination pixel coordinate (see
//       SHADERS.md: the `.u.` conversion treats the source as unsigned).
//   air.sample_texture_2d.u.v4i32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x i32>, i8}
//     — samples the uint matte texture; only the .x lane is used.
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//     — samples the float pigt texture; only the .x lane is used.
//   air.write_texture_2d.v4f32(tex, <2 x i32> coord, <4 x float>, i32 0,
//       i32 2) — writes the result at destination pixel coord.
//
// Line-by-line map of the .ll body (labels %5, %19, %23, %32, %37, %40,
// %44, %56, %60):
//
//   block %5 (entry):
//     %6..%10 : extract coord.x / coord.y, load m_x0 / m_y0.
//     %9  = params.m_x0 + coord.x                  -> dstX
//     %13 = params.m_y0 + coord.y                  -> dstY
//     %15 = <dstX, dstY> as <2 x i32>
//     %17 = load params.m_x1
//     %18 = icmp ult i32 %9 (dstX), %17 (m_x1)     -- UNSIGNED compare.
//     br i1 %18, label %19, label %60              -- OOB skips to ret.
//
//   block %19: outer-bound-passed branch.
//     %21 = load params.m_y1
//     %22 = icmp ult i32 %13 (dstY), %21 (m_y1)    -- UNSIGNED compare.
//     br i1 %22, label %23, label %60              -- OOB skips to ret.
//
//   block %23: both bounds pass — compute pixel weight.
//     %24 = air.convert.f.v2f32.u.v2i32(%15)       -- UNSIGNED cast:
//           dst pixel coord (uint) -> float.
//     %25 = %24 + <0.5, 0.5>                       -- half-pixel bias.
//     %26 = air.sample_texture_2d.u.v4i32(matte, sampler, %25 uv, ...)
//     %27 = extractvalue %26, 0                    -- <4 x i32> rgba.
//     %28 = extractelement %27, i64 0              -- matte_r (uint).
//     %30 = load params.m_compute
//     %31 = icmp eq i32 %30, 0
//     br i1 %31, label %32, label %37
//
//   block %32: compute == 0 branch — binary label test.
//     %34 = load params.m_label
//     %35 = icmp eq i32 %28 (matte_r), %34 (m_label)
//     %36 = select i1 %35, float 1.0, float 0.0
//     br label %37
//
//   block %37 (merge after compute==0 branch):
//     %38 = phi float [ 0.0, %23 (compute!=0) ], [ %36, %32 (compute==0) ]
//     %39 = icmp eq i32 %30, 1
//     br i1 %39, label %40, label %56               -- compute==1 detour.
//
//   block %40: compute == 1 branch — pigt-weighted variant, first
//     re-test that the label matches.
//     %42 = load params.m_label (re-loaded)
//     %43 = icmp eq i32 %28 (matte_r), %42
//     br i1 %43, label %44, label %56               -- no-match uses %38.
//
//   block %44: label matches and compute==1 — pigt lookup + weight math.
//     %45 = air.sample_texture_2d.v4f32(pigt, sampler, %25 uv, ...)
//     %46 = extractvalue %45, 0                    -- <4 x float> rgba.
//     %47 = extractelement %46, i64 0              -- pigt_r (float).
//     %49 = load params.m_invnorm (float)
//     %50 = fmul float %49, %47                    -- a = invnorm * pigt_r
//     %51 = fmul float %50, %50                    -- b = a * a
//     %52 = fcmp ogt float %51, 1.0                -- b > 1 ?
//     %53 = fsub float 1.0, %51                    -- 1 - b
//     %54 = select i1 %52, float 0.0, float %53    -- clamp to [0, 1]
//     %55 = fmul float %54, %54                    -- weight = (1-b)^2
//     br label %56
//
//   block %56 (merge — final weight scalar):
//     %57 = phi float [ %55, %44 ], [ %38, %40 ], [ %38, %37 ]
//     %58 = insertelement <4 x float> undef, %57, i64 0
//     %59 = shufflevector %58, undef, <4 x i32> zeroinitializer
//                                                  -- splat (w,w,w,w).
//     air.write_texture_2d.v4f32(weights, %15 coord, %59, 0, 2)
//     br label %60
//
//   block %60: ret void.

/**
 * Params buffer for `soMOMotionEstimation::soMOMotionEstimation_initWeights`
 * — mirrors the AIR struct at !18 (28-byte packed record, four-byte
 * fields). All uint fields are unsigned 32-bit; m_invnorm is fp32.
 */
export interface SoMOMotionEstimationInitWeightsParams {
  m_x0: number;      // offset  0 : uint
  m_y0: number;      // offset  4 : uint
  m_x1: number;      // offset  8 : uint
  m_y1: number;      // offset 12 : uint
  m_compute: number; // offset 16 : uint  — 0 = binary, 1 = pigt-weighted
  m_invnorm: number; // offset 20 : float
  m_label: number;   // offset 24 : uint
}

/**
 * Callback for AIR `air.sample_texture_2d.u.v4i32` — samples a
 * texture2d<uint, sample> at (u, v) and returns the four rgba i32 lanes.
 * Only the .x lane is consumed by this kernel (see %28).
 */
export type SampleUintTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples a
 * texture2d<float, sample> at (u, v) and returns the four rgba f32
 * lanes. Only the .x lane is consumed by this kernel (see %47).
 */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Callback for AIR `air.write_texture_2d.v4f32` — writes a splatted
 * (w, w, w, w) float4 at pixel coord (x, y) in the destination texture.
 */
export type WriteFloatTex2D<T> = (texture: T, x: number, y: number, rgba: [number, number, number, number]) => void;

/**
 * Compute kernel `soMOMotionEstimation::soMOMotionEstimation_initWeights`.
 *
 * For each destination pixel at `(m_x0 + coord.x, m_y0 + coord.y)` that
 * lies within `[m_x0, m_x1) x [m_y0, m_y1)` (bounds tested with UNSIGNED
 * `icmp ult` — negative extents wrap and effectively pass, matching the
 * IR), computes a scalar weight `w`:
 *
 *   * `m_compute == 0` : `w = (matte.r == m_label) ? 1.0 : 0.0`
 *   * `m_compute == 1` : if `matte.r == m_label`, sample `pigt.r`, form
 *                       `a = m_invnorm * pigt.r`, `b = a*a`, then
 *                       `w = (b > 1.0) ? 0.0 : (1.0 - b) ^ 2`.
 *                       Otherwise `w = 0.0`.
 *   * any other value : `w = 0.0` (falls through the phi merge at %57).
 *
 * The scalar `w` is splatted to `(w, w, w, w)` and written to
 * `weights` at the destination pixel.
 *
 * @shader soMOMotionEstimation::soMOMotionEstimation_initWeights (HeliumSenso)
 */
export function soMOMotionEstimation__soMOMotionEstimation_initWeights<TMatte, TPigt, TWeights>(
  params: SoMOMotionEstimationInitWeightsParams,
  coord: [number, number],
  matte: TMatte,
  pigt: TPigt,
  weights: TWeights,
  sampleMatte: SampleUintTex2D<TMatte>,
  samplePigt: SampleFloatTex2D<TPigt>,
  writeWeights: WriteFloatTex2D<TWeights>,
): void {
  // %6..%13 : extract coord lanes, load m_x0 / m_y0, add.
  //   Values remain uint32 in the IR — coerce with `>>> 0` to preserve
  //   the unsigned semantics used by the subsequent `icmp ult` checks
  //   and by `air.convert.f.v2f32.u.v2i32` (see SHADERS.md).
  const coordX = coord[0] >>> 0;                    // %6
  const coordY = coord[1] >>> 0;                    // %10
  const dstX = (params.m_x0 + coordX) >>> 0;        // %9
  const dstY = (params.m_y0 + coordY) >>> 0;        // %13

  // %18 = icmp ult i32 dstX, params.m_x1 — UNSIGNED compare (per
  //   SHADERS.md silent-correctness rule: negative extents wrap and
  //   trivially pass, preserved literally).
  const inBoundsX = (dstX >>> 0) < (params.m_x1 >>> 0);
  if (!inBoundsX) {
    // br i1 %18 false -> label %60 : ret void.
    return;
  }

  // %22 = icmp ult i32 dstY, params.m_y1 — UNSIGNED compare.
  const inBoundsY = (dstY >>> 0) < (params.m_y1 >>> 0);
  if (!inBoundsY) {
    // br i1 %22 false -> label %60 : ret void.
    return;
  }

  // %24 = air.convert.f.v2f32.u.v2i32(<dstX, dstY>) — UNSIGNED cast.
  //   The `>>> 0` coercion above ensures the pre-cast value is treated
  //   as unsigned; Math.fround narrows to fp32.
  const dstXf = Math.fround(dstX >>> 0);
  const dstYf = Math.fround(dstY >>> 0);

  // %25 = %24 + <0.5, 0.5> — half-pixel-centre bias.
  const uvU = Math.fround(dstXf + Math.fround(0.5));
  const uvV = Math.fround(dstYf + Math.fround(0.5));

  // %26 = air.sample_texture_2d.u.v4i32(matte, sampler, uv, ...)
  // %27 = extractvalue %26, 0
  // %28 = extractelement %27, i64 0 — matte_r (uint).
  const matteSample = sampleMatte(matte, uvU, uvV);
  const matteR = matteSample[0] >>> 0;

  // %30 = load params.m_compute
  const mCompute = params.m_compute >>> 0;

  // %31 = icmp eq i32 mCompute, 0
  //   Branch %32 (compute==0) computes %36 = (matteR == label) ? 1 : 0;
  //   phi %38 at block %37 selects 0.0 when compute != 0.
  let phi38: number;                                 // %38 in the IR
  if (mCompute === 0) {
    // %34 = load params.m_label
    // %35 = icmp eq i32 matteR, params.m_label
    // %36 = select i1 %35, float 1.0, float 0.0
    const matchesLabel = (matteR >>> 0) === (params.m_label >>> 0);
    phi38 = matchesLabel ? Math.fround(1.0) : Math.fround(0.0);
  } else {
    // phi %38 = 0.0 when arriving from %23 directly.
    phi38 = Math.fround(0.0);
  }

  // %39 = icmp eq i32 mCompute, 1
  //   Branch %40 (compute==1) re-loads label, gates the pigt lookup
  //   on `matteR == m_label`, and computes the pigt-based weight; the
  //   final phi %57 selects between %55 (pigt path) and %38 (else).
  let phi57: number;                                 // %57 in the IR
  if (mCompute === 1) {
    // %42 = load params.m_label (re-load) ; %43 = icmp eq matteR, m_label
    const matchesLabelAgain = (matteR >>> 0) === (params.m_label >>> 0);
    if (matchesLabelAgain) {
      // %45 = air.sample_texture_2d.v4f32(pigt, sampler, uv, ...)
      // %46 = extractvalue %45, 0
      // %47 = extractelement %46, i64 0 — pigt_r (fp32).
      const pigtSample = samplePigt(pigt, uvU, uvV);
      const pigtR = Math.fround(pigtSample[0]);

      // %49 = load params.m_invnorm (fp32)
      const invnorm = Math.fround(params.m_invnorm);

      // %50 = fmul invnorm, pigt_r
      const a = Math.fround(invnorm * pigtR);
      // %51 = fmul a, a
      const b = Math.fround(a * a);
      // %52 = fcmp ogt b, 1.0
      const bGtOne = b > Math.fround(1.0);
      // %53 = fsub 1.0, b
      const oneMinusB = Math.fround(Math.fround(1.0) - b);
      // %54 = select %52, 0.0, %53
      const clamped = bGtOne ? Math.fround(0.0) : oneMinusB;
      // %55 = fmul %54, %54
      phi57 = Math.fround(clamped * clamped);
    } else {
      // br i1 %43 false -> label %56 with phi %57 = %38.
      phi57 = phi38;
    }
  } else {
    // br i1 %39 false -> label %56 with phi %57 = %38.
    phi57 = phi38;
  }

  // %58 = insertelement <4 x float> undef, %57, i64 0
  // %59 = shufflevector %58, undef, <4 x i32> zeroinitializer
  //   -> splat (w, w, w, w).
  const w = phi57;

  // air.write_texture_2d.v4f32(weights, <dstX, dstY>, <w,w,w,w>, 0, 2)
  writeWeights(weights, dstX, dstY, [w, w, w, w]);

  // br label %60 : ret void.
}
