// @shader soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant (HeliumSenso)
// Source IR: raw-port/re/shaders/soMOMotionEstimation__soMOMotionEstimation_updateWeightsConstant.ll
// (extracted from HeliumSenso.framework/Versions/A/Resources/default.metallib
//  @0x000000000d674d)
/**
 * @shader soMOMotionEstimation::soMOMotionEstimation_updateWeightsConstant (HeliumSenso)
 *
 * Iterative motion-estimation weights update — CONSTANT (0th-order) model.
 * One thread per output weight. Reads three motion-partial-image-gradient
 * textures (pigx, pigy, pigt = ∂I/∂x, ∂I/∂y, ∂I/∂t at time-t) and produces
 * a per-pixel L2 kernel weight used to reweight the next iteration of
 * least-squares motion regression:
 *
 *   pos    = (m_x0 + coord.x, m_y0 + coord.y)             ; write position
 *   if pos.x >= m_x1 || pos.y >= m_y1 → return             ; bounds guard
 *   uv     = float2(pos) + 0.5                             ; texel-centred
 *   gx     = pigx(uv).r                                    ; ∂I/∂x
 *   gy     = pigy(uv).r                                    ; ∂I/∂y
 *   gt     = pigt(uv).r                                    ; ∂I/∂t
 *
 *   residual = m_coe12 + gt + gx*m_coe0 + gy*m_coe1        ; linear scoring
 *   e        = m_inv * residual                            ; normalise
 *   e2       = e * e                                       ; squared error
 *   w        = (e2 > 1) ? 0 : (1 - e2)                     ; Tukey biweight
 *   w2       = w * w                                       ; squared → hard falloff
 *   weights(pos) = float4(w2, w2, w2, w2)                  ; broadcast to RGBA
 *
 * This is the "Tukey biweight" (or Epanechnikov-squared) M-estimator
 * update rule: pixels whose motion-model residual exceeds `1/m_inv` in
 * magnitude are ZERO-weighted; well-fitting pixels get a smooth falloff
 * (1-e²)² toward the centre. In the CONSTANT variant the reweight uses
 * a per-tile shared (coe0, coe1, coe12) coefficient tuple — hence
 * "Constant" (a single affine motion model over the whole tile).
 *
 * Signature from !air.kernel (!14..!23):
 *   kernel void soMOMotionEstimation_updateWeightsConstant(
 *       constant params  *params    [[buffer(0)]],
 *       uint2             coord_    [[thread_position_in_grid]],
 *       texture2d<float,sample> pigx  [[texture(0)]],
 *       texture2d<float,sample> pigy  [[texture(1)]],
 *       texture2d<float,sample> pigt  [[texture(2)]],
 *       texture2d<float,write>  weights [[texture(3)]]);
 *
 * params struct (from !18 — total 32 bytes, align 4):
 *   +0   float m_inv         (scoring inv-scale)
 *   +4   uint  m_x0          (tile origin x)
 *   +8   uint  m_y0          (tile origin y)
 *   +12  uint  m_x1          (tile exclusive-x — write bound)
 *   +16  uint  m_y1          (tile exclusive-y — write bound)
 *   +20  float m_coe0        (x-gradient coefficient of the affine model)
 *   +24  float m_coe1        (y-gradient coefficient of the affine model)
 *   +28  float m_coe12       (constant term — the "0th-order" offset)
 *
 * The kernel uses an internal air.sampler_state (bitcast from the module
 * constant @__air_sampler_state = 0x8082000000000000 = -9188470239253725184
 * as i64). The sampler is used with `is_normalized=true`, coord_offset=0,
 * shadow=false, min_lod_clamp=0, max_lod_clamp=0, lod=0 — i.e. a plain
 * linear-filter, edge-clamp sampler at LOD 0. In the TS port the sampler
 * is abstracted behind the Sample2D contract.
 *
 * Fast-math is DISABLED (!12) — every fp32 op is Math.fround-narrowed.
 * Denorms are DISABLED (!11) — irrelevant here (no operand is denormal
 * for realistic inputs).
 */

/** params struct — 32 bytes. @IR !18 */
export interface soMOMotionEstimation_updateWeightsConstant_Params {
  /** float m_inv at +0. @IR %47 */
  m_inv: number;
  /** uint m_x0 at +4. @IR %9 */
  m_x0: number;
  /** uint m_y0 at +8. @IR %13 */
  m_y0: number;
  /** uint m_x1 at +12 (exclusive). @IR %18 */
  m_x1: number;
  /** uint m_y1 at +16 (exclusive). @IR %22 */
  m_y1: number;
  /** float m_coe0 at +20. @IR %37 */
  m_coe0: number;
  /** float m_coe1 at +24. @IR %39 */
  m_coe1: number;
  /** float m_coe12 at +28. @IR %44 */
  m_coe12: number;
}

/** RGBA float4 sampler contract (linear-filter, clamp-to-edge in host). */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soMOMotionEstimation_updateWeightsConstant — one dispatched thread.
 * Direct TS mapping of the AIR body. Every SSA value is cited by its
 * `%N` producer.
 *
 * @IR entire function @0x000000000d674d.
 */
export function soMOMotionEstimation_updateWeightsConstant(
  params: soMOMotionEstimation_updateWeightsConstant_Params,
  coord_: [number, number],
  sample_pigx: Sample2D,
  sample_pigy: Sample2D,
  sample_pigt: Sample2D,
  write_weights: Write2D,
): void {
  // @IR %7 extract coord.x (i32).
  const gx_i = coord_[0] | 0;
  // @IR %9 load m_x0 (i32 unsigned).
  // @IR %10 = m_x0 + coord.x   (u32 add).
  const posX = ((params.m_x0 >>> 0) + (gx_i >>> 0)) | 0;

  // @IR %11 extract coord.y (i32).
  const gy_i = coord_[1] | 0;
  // @IR %13 load m_y0 (i32 unsigned).
  // @IR %14 = m_y0 + coord.y   (u32 add).
  const posY = ((params.m_y0 >>> 0) + (gy_i >>> 0)) | 0;

  // @IR %16 insertelement <posX, posY> — writePos as <2 x i32>.
  // (Modelled inline below as posX / posY pair.)

  // @IR %18 load m_x1.  @IR %19 icmp ult posX < m_x1 (UNSIGNED).
  if ((posX >>> 0) >= (params.m_x1 >>> 0)) return; // @IR br to %56 (ret)

  // @IR %22 load m_y1.  @IR %23 icmp ult posY < m_y1 (UNSIGNED).
  if ((posY >>> 0) >= (params.m_y1 >>> 0)) return; // @IR br to %56 (ret)

  // @IR %25 = convert.f.v2f32.u.v2i32(writePos)  UNSIGNED int→float.
  // @IR %26 = %25 + <0.5, 0.5>                     ; texel-centre uv.
  const uv_x = Math.fround(Math.fround(posX >>> 0) + Math.fround(0.5));
  const uv_y = Math.fround(Math.fround(posY >>> 0) + Math.fround(0.5));

  // @IR %27/%28/%29  sample pigx at uv, extract lane 0 (.r).
  const gx_val = Math.fround(sample_pigx([uv_x, uv_y])[0]);
  // @IR %30/%31/%32  sample pigy at uv, extract lane 0 (.r).
  const gy_val = Math.fround(sample_pigy([uv_x, uv_y])[0]);
  // @IR %33/%34/%35  sample pigt at uv, extract lane 0 (.r).
  const gt_val = Math.fround(sample_pigt([uv_x, uv_y])[0]);

  // @IR %37 load m_coe0.  @IR %39 load m_coe1.
  const coe0 = Math.fround(params.m_coe0);
  const coe1 = Math.fround(params.m_coe1);
  // @IR %40 = pigy_r * m_coe1    (fmul, fp32).
  const gy_coe1 = Math.fround(gy_val * coe1);
  // @IR %41 = fmuladd(pigx_r, m_coe0, %40)
  //          = pigx*coe0 + pigy*coe1    (single-rounding FMA on hardware
  //           that supports it; on x86_64 without fp-contract this is
  //           fp32-narrow(fp32-narrow(pigx*coe0) + gy_coe1). TS mirrors
  //           the non-contract IEEE path — matching AIR bit-for-bit when
  //           the target lacks FMA, which is the safe/portable default.)
  const linear = Math.fround(Math.fround(gx_val * coe0) + gy_coe1);
  // @IR %42 = pigt_r + linear.
  const withT = Math.fround(gt_val + linear);
  // @IR %44 load m_coe12.  @IR %45 = m_coe12 + withT.
  const residual = Math.fround(Math.fround(params.m_coe12) + withT);

  // @IR %47 load m_inv.  @IR %48 = m_inv * residual.
  const e = Math.fround(Math.fround(params.m_inv) * residual);
  // @IR %49 = e * e.
  const e2 = Math.fround(e * e);
  // @IR %50 = fcmp ogt %49, 1.0
  // @IR %51 = 1.0 - %49
  // @IR %52 = select %50, 0.0, %51
  //           i.e. w = (e2 > 1) ? 0 : (1 - e2)  — Tukey biweight cutoff.
  //           NB: `fcmp ogt` is FALSE for NaN, so a NaN e² takes the
  //           %51 branch → w = 1.0 - NaN = NaN — matching AIR exactly.
  const one = Math.fround(1);
  const zero = Math.fround(0);
  const w1: number = e2 > one ? zero : Math.fround(one - e2);
  // @IR %53 = w1 * w1
  const w2 = Math.fround(w1 * w1);

  // @IR %54 %55 splat to <4 x float>, all lanes = w2.
  // @IR write_texture_2d weights at writePos.
  write_weights([posX, posY], [w2, w2, w2, w2]);

  // @IR br to %56 (ret).
}
