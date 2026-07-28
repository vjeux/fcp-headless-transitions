// @shader soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p1_Pass5_q_upsampled_out.ll
// (extracted from HeliumSenso.framework/Versions/A/Resources/default.metallib
//  @0x000000000915dd)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p1_Pass5_q_upsampled_out (HeliumSenso)
 *
 * Guided-filter Pass5 (I1p1 = 1-channel-guide, 1-channel-output) — upsampled
 * q reconstruction. This is the "publish" pass for the SINGLE-CHANNEL variant:
 * a and b are packed into the SAME low-res texture (a in the .r lane, b in
 * the .g lane) and the guide I is a single-channel image at full resolution.
 *
 *   uv_ab = scaleUpsample * float2(pos) + 0.5          // downsampled cursor
 *   uv_I  = float2(pos)                + 0.5           // full-res cursor
 *   ab    = sample(input_a_b_mean, uv_ab)               // ab.r=a, ab.g=b
 *   I     = sample(input_I,        uv_I ).r
 *   q     = a * I + b                                    // SCALAR
 *   output_q(pos) = clamp((q,q,q, 1), 0, 1)              // grayscale w/ alpha=1
 *
 * Contrast with the I1p3 sibling: I1p3 does a 4-lane fmuladd on per-channel
 * a and b (a_mean and b_mean live in separate textures, each carrying an
 * RGB triple). I1p1 is a scalar fmuladd — one a, one b, one I — and then
 * splats q into the RGB triple with alpha=1.
 *
 * Signature from !air.kernel (!14..!23):
 *   kernel void soGuidedFilter_I1p1_Pass5_q_upsampled_out(
 *       constant params  *params                [[buffer(0)]],
 *       uint2             grid_in               [[thread_position_in_grid]],
 *       sampler           sam                   [[sampler(0)]],
 *       texture2d<float,sample> input_a_b_mean  [[texture(0)]],
 *       texture2d<float,sample> input_I         [[texture(1)]],
 *       texture2d<float,write>  output_q        [[texture(2)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in        (align 16, 16 bytes)
 *   +16  float m_scaleUpsample  (align 16, 4 bytes)
 *   +20  [12 x i8] tail padding to 32-byte struct size
 *
 * Fast-math is DISABLED (!12), so every fp32 op is Math.fround-narrowed
 * (matching the AIR IR bit-for-bit modulo the sampler filter kernel choice
 * that the host wires in).
 *
 * BOUNDS GUARD: both axes use `icmp ult` (unsigned) — preserved literally.
 * A negative extent would wrap to a huge unsigned and always "pass"; that
 * is the intended AIR behaviour.
 *
 * UNSIGNED int→float cast: %27 is
 * `air.convert.f.v2f32.u.v2i32(<2 x i32> %10)` — the `.u.` variant treats
 * the source int as UNSIGNED. We coerce with `>>> 0` before Math.fround.
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p1_Pass5_q_upsampled_out_Params {
  /** int4 at +0 — {origin_x, origin_y, right, bottom} in write-image coords.
   *  @IR %8  (load <4 x i32>) */
  m_rect_in: [number, number, number, number];
  /** float at +16 — ratio between the mean-texture resolution and the guide
   *  resolution. Applied as `uv_ab = scaleUpsample * float2(pos) + 0.5`.
   *  @IR %24 (load float, align 16) */
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
 * soGuidedFilter_I1p1_Pass5_q_upsampled_out — one dispatched thread.
 * Direct TS mapping of the AIR body. Every SSA value is cited by its
 * `%N` producer.
 *
 * @IR entire function @0x000000000915dd.
 */
export function soGuidedFilter_I1p1_Pass5_q_upsampled_out(
  params: soGuidedFilter_I1p1_Pass5_q_upsampled_out_Params,
  grid_in: [number, number],
  sample_input_a_b_mean: Sample2D,
  sample_input_I: Sample2D,
  write_output_q: Write2D,
): void {
  // @IR %8  load <4 x i32> m_rect_in (align 16).
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;

  // @IR %9  shufflevector — lanes <0,1> of rect (= .xy).
  // @IR %10 = rect.xy + grid_in       (writePos, 2-lane i32).
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;
  const posY = (rect1 + gy) | 0;

  // @IR %11 extract writePos.x, %12 rect.z, %13 rect.x.
  // @IR %14 = rect.z - rect.x  (width, signed NSW).
  // @IR %15 = icmp ult writePos.x < width   (UNSIGNED compare).
  const width = (rect2 - rect0) | 0;
  if ((posX >>> 0) >= (width >>> 0)) return; // @IR br to %42 (ret)

  // @IR %17 writePos.y, %18 rect.w, %19 rect.y.
  // @IR %20 = rect.w - rect.y  (height, signed NSW).
  // @IR %21 = icmp ult writePos.y < height   (UNSIGNED compare — same axis
  //   discipline as the outer guard in the I1p1 body; the I1p3 sibling
  //   uses the same pair, both ult).
  const height = (rect3 - rect1) | 0;
  if ((posY >>> 0) >= (height >>> 0)) return; // @IR br to %42 (ret)

  // @IR %24 load scaleUpsample.
  // @IR %25 %26 insertelement/splat to <2 x float>.
  const scale = Math.fround(params.m_scaleUpsample);

  // @IR %27 = convert.f.v2f32.u.v2i32(writePos)   UNSIGNED int→float.
  //   Coerce with `>>> 0` before Math.fround (see file-level note).
  const posXf = Math.fround(posX >>> 0);
  const posYf = Math.fround(posY >>> 0);

  // @IR %28 = fmuladd(scale_splat, posF, <0.5, 0.5>)
  //          = scale * pos + 0.5 (2 lanes).
  //   llvm.fmuladd may fuse to a single-rounding FMA; with fast-math
  //   disabled and no hardware FMA on the target, this lowers to fmul then
  //   fadd, each fp32-narrowed. TS mirrors with `fround(a*b + c)` — the
  //   inner `fround(a*b)` matches the non-contract IEEE path used when
  //   the compiler cannot prove FMA safety.
  const uv_ab_X = Math.fround(Math.fround(scale * posXf) + Math.fround(0.5));
  const uv_ab_Y = Math.fround(Math.fround(scale * posYf) + Math.fround(0.5));

  // @IR %29 %30 sample input_a_b_mean at uv_ab.
  //   input_a_b_mean packs {a, b, _, _} into RGBA lanes.
  const sab = sample_input_a_b_mean([uv_ab_X, uv_ab_Y]);

  // @IR %31 = fadd(posF, <0.5, 0.5>)  ; uv_I — full-res cursor.
  const uv_I_X = Math.fround(posXf + Math.fround(0.5));
  const uv_I_Y = Math.fround(posYf + Math.fround(0.5));

  // @IR %32 %33 sample input_I at uv_I.
  const sI = sample_input_I([uv_I_X, uv_I_Y]);

  // @IR %34 = extractelement sI, i64 0     ; I.r
  const I_r = Math.fround(sI[0]);
  // @IR %35 = extractelement sab, i64 0    ; a
  const a = Math.fround(sab[0]);
  // @IR %36 = extractelement sab, i64 1    ; b
  const b = Math.fround(sab[1]);

  // @IR %37 = llvm.fmuladd.f32(a, I, b)     ; scalar q = a*I + b.
  const q = Math.fround(Math.fround(a * I_r) + b);

  // @IR %38..%40 build <4 x float>{q, q, q, 1.0}
  //   (insertelement q into lane 0, then lane 1, then lane 2; the initial
  //    vector is <undef, undef, undef, 1.0>).
  const q_r = q;
  const q_g = q;
  const q_b = q;
  const q_a = Math.fround(1);

  // @IR %41 = air.clamp(<4 x float>, <0,0,0,0>, <1,1,1,1>)
  const out_r = clamp1(q_r, Math.fround(0), Math.fround(1));
  const out_g = clamp1(q_g, Math.fround(0), Math.fround(1));
  const out_b = clamp1(q_b, Math.fround(0), Math.fround(1));
  const out_a = clamp1(q_a, Math.fround(0), Math.fround(1)); // trivially 1.0

  // @IR write_texture_2d output_q at writePos.
  write_output_q([posX, posY], [out_r, out_g, out_b, out_a]);

  // @IR br to %42 (ret).
}
