// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass5_q_upsampled_out.ll
// (extracted from HeliumSenso.framework/Versions/A/Resources/default.metallib
//  @0x0000000009dfed)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass5_q_upsampled_out (HeliumSenso)
 *
 * Guided-filter Pass5 — upsampled q reconstruction. This is the "publish"
 * pass that reads the DOWNSAMPLED per-output a_mean and b_mean plus the
 * FULL-RES guide image I, and forms the classical guided-filter output:
 *
 *   uv_ab  = scaleUpsample * float2(pos) + 0.5        ; downsampled cursor
 *   uv_I   = float2(pos)               + 0.5          ; full-res cursor
 *   a      = sample(input_a_mean, uv_ab)
 *   b      = sample(input_b_mean, uv_ab)
 *   I      = sample(input_I,      uv_I ).r  (splat 4x)
 *   q      = a * I.rrrr + b                            ; fmuladd 4-lane
 *   q.a    = 1.0                                        ; force alpha
 *   output_q(pos) = clamp(q, 0, 1)
 *
 * Because a_mean/b_mean are stored at LOW resolution and I is at HIGH
 * resolution, the shader samples the mean textures at a SCALED coordinate
 * (`scaleUpsample * pos + 0.5`) — the sampler's linear interpolation does
 * the bilinear upsample for free. The guide texture is sampled at the
 * write position itself.
 *
 * Signature from !air.kernel (!14..!24):
 *   kernel void soGuidedFilter_I1p3_Pass5_q_upsampled_out(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_a_mean [[texture(0)]],
 *       texture2d<float,sample> input_b_mean [[texture(1)]],
 *       texture2d<float,sample> input_I      [[texture(2)]],
 *       texture2d<float,write>  output_q     [[texture(3)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in        (align 16, 16 bytes)
 *   +16  float m_scaleUpsample  (align 16, 4 bytes)
 *   +20  [12 x i8] tail padding to 32-byte struct size
 *
 * NB: the struct type in the IR is called
 *   `soGuidedFilter_I1p1_Pass5_q_upsampled_out_params`
 * (I1p1, singular-channel-a) even though the kernel body is the I1p3
 * (RGB-channel-a) variant. The layout is identical, so both kernel
 * variants can share the exact same params ABI.
 *
 * Fast-math is DISABLED (!12), so every fp32 op is Math.fround-narrowed
 * (matching the AIR IR bit-for-bit modulo sampler filter kernel choice).
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p3_Pass5_q_upsampled_out_Params {
  /** int4 at +0 — {origin_x, origin_y, right, bottom} in write-image coords.
   *  @IR %9  (load <4 x i32>) */
  m_rect_in: [number, number, number, number];
  /** float at +16 — ratio between the mean-texture resolution and the guide
   *  resolution. Applied as `uv_ab = scaleUpsample * float2(pos) + 0.5`.
   *  @IR %25 (load float, align 16) */
  m_scaleUpsample: number;
}

/** RGBA float4 sampler contract (bilinear, wrap/clamp per host). */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/** Clamp a float to [lo, hi] — direct TS mapping of `air.clamp` (FMIN(FMAX)).
 *  For finite fp32 lanes the ordering (max-first, then min) matches AIR's
 *  bit-exact result. */
function clamp1(x: number, lo: number, hi: number): number {
  return Math.fround(Math.min(hi, Math.max(lo, Math.fround(x))));
}

/**
 * soGuidedFilter_I1p3_Pass5_q_upsampled_out — one dispatched thread.
 * Direct TS mapping of the AIR body. Every SSA value is cited by its
 * `%N` producer.
 *
 * @IR entire function @0x0000000009dfed.
 */
export function soGuidedFilter_I1p3_Pass5_q_upsampled_out(
  params: soGuidedFilter_I1p3_Pass5_q_upsampled_out_Params,
  grid_in: [number, number],
  sample_input_a_mean: Sample2D,
  sample_input_b_mean: Sample2D,
  sample_input_I: Sample2D,
  write_output_q: Write2D,
): void {
  // @IR %9  load <4 x i32> m_rect_in (align 16).
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;

  // @IR %10 shufflevector — lanes <0,1> of rect (= .xy).
  // @IR %11 = rect.xy + grid_in       (writePos, 2-lane i32).
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;
  const posY = (rect1 + gy) | 0;

  // @IR %12 extract writePos.x, %13 rect.z, %14 rect.x.
  // @IR %15 = rect.z - rect.x  (width, signed NSW).
  // @IR %16 = icmp ult writePos.x < width   (UNSIGNED compare).
  const width = (rect2 - rect0) | 0;
  if ((posX >>> 0) >= (width >>> 0)) return; // @IR br to %41 (ret)

  // @IR %18 writePos.y, %19 rect.w, %20 rect.y.
  // @IR %21 = rect.w - rect.y  (height, signed NSW).
  // @IR %22 = icmp ult writePos.y < height.
  const height = (rect3 - rect1) | 0;
  if ((posY >>> 0) >= (height >>> 0)) return; // @IR br to %41 (ret)

  // @IR %25 load scaleUpsample.
  // @IR %26 %27 insertelement/splat to <2 x float>.
  const scale = Math.fround(params.m_scaleUpsample);

  // @IR %28 = convert.f.v2f32.u.v2i32(writePos)  UNSIGNED int→float.
  const posXf = Math.fround(posX >>> 0);
  const posYf = Math.fround(posY >>> 0);

  // @IR %29 = fmuladd(scale_splat, posF, <0.5, 0.5>)
  //          = scale * pos + 0.5 (2 lanes, fmuladd — llvm.fmuladd contract
  //           allows a single-rounding FMA on hardware that supports it;
  //           on x86_64 without fp-contract this is fmul + fadd, both
  //           fp32-narrowed. TS mirrors as fround(a*b+c) — the additional
  //           narrowing after * matches the non-contract IEEE path).
  const uv_ab_X = Math.fround(Math.fround(scale * posXf) + Math.fround(0.5));
  const uv_ab_Y = Math.fround(Math.fround(scale * posYf) + Math.fround(0.5));

  // @IR %30 %31 sample input_a_mean at uv_ab.
  const sa = sample_input_a_mean([uv_ab_X, uv_ab_Y]);

  // @IR %32 %33 sample input_b_mean at uv_ab.
  const sb = sample_input_b_mean([uv_ab_X, uv_ab_Y]);

  // @IR %34 = fadd(posF, <0.5, 0.5>)  ; uv_I — full-res cursor.
  const uv_I_X = Math.fround(posXf + Math.fround(0.5));
  const uv_I_Y = Math.fround(posYf + Math.fround(0.5));

  // @IR %35 %36 sample input_I at uv_I.
  const sI = sample_input_I([uv_I_X, uv_I_Y]);

  // @IR %37 = shufflevector(sI, undef, <0,0,0,0>)  — splat I.r across 4 lanes.
  const I_splat = Math.fround(sI[0]);

  // @IR %38 = fmuladd(a, I.rrrr, b)  ; q = a * I + b, 4-lane.
  const q_r = Math.fround(Math.fround(Math.fround(sa[0]) * I_splat) + Math.fround(sb[0]));
  const q_g = Math.fround(Math.fround(Math.fround(sa[1]) * I_splat) + Math.fround(sb[1]));
  const q_b = Math.fround(Math.fround(Math.fround(sa[2]) * I_splat) + Math.fround(sb[2]));
  // lane 3 computed here for provenance completeness (%38 lane 3 = a.a*I+b.a)
  // but immediately overwritten by the insertelement in the next instruction.
  // We omit the compute to skip a rounding artifact whose result is discarded.

  // @IR %39 = insertelement(%38, 1.0, 3)  ; force alpha lane to 1.0f.
  const q_a = Math.fround(1);

  // @IR %40 = air.clamp(%39, <0,0,0,0>, <1,1,1,1>)
  const out_r = clamp1(q_r, Math.fround(0), Math.fround(1));
  const out_g = clamp1(q_g, Math.fround(0), Math.fround(1));
  const out_b = clamp1(q_b, Math.fround(0), Math.fround(1));
  const out_a = clamp1(q_a, Math.fround(0), Math.fround(1)); // trivially 1.0

  // @IR write_texture_2d output_q at writePos.
  write_output_q([posX, posY], [out_r, out_g, out_b, out_a]);

  // @IR br to %41 (ret).
}
