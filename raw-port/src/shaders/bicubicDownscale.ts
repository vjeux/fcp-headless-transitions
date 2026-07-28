// @shader bicubicDownscale (Lithium) @0x00000000001c59
// Source IR: raw-port/re/shaders/bicubicDownscale.ll
// (extracted from Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib)
/**
 * @shader bicubicDownscale (Lithium)
 *
 * Compute kernel that downsamples `inTex` into `outTex` using the metallib's
 * built-in inline sampler state (`__air_sampler_state`, IR-embedded as
 * `[i64 34901797601023049, i64 0]`, referenced from !air.sampler_states).
 * The "bicubic" name refers to the sampler's filter mode configured by
 * that sampler-state descriptor — the SHADER BODY itself is:
 *
 *   uv = (gid + 0.5) / (outWidth, outHeight)      // normalised sample uv
 *   half4 c = sample(inTex, __air_sampler_state, uv, lod=0)
 *   outTex[gid] = c
 *
 * i.e. a plain normalised-uv fetch from `inTex` at the pixel-centre of the
 * destination `gid`, letting the sampler do all the filtering. The
 * "bicubicness" is entirely in the sampler descriptor, which is opaque to
 * the shader body.
 *
 * Signature from !air.kernel (!15..!20):
 *   kernel void bicubicDownscale(
 *       texture2d<half,sample> inTex   [[texture(0)]],
 *       texture2d<half,write>  outTex  [[texture(1)]],
 *       ushort2                gid     [[thread_position_in_grid]]);
 *
 * Denorms / fast-math (from !12..!14):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_enable   — with `unsafe-fp-math`,
 *   `no-infs-fp-math`, `no-nans-fp-math`, `no-signed-zeros-fp-math`,
 *   `approx-func-fp-math`. There are two arithmetic ops in the body
 *   (a fadd of 0.5 and an fdiv), both fp32-narrowed via Math.fround at
 *   each `air.*` boundary.
 *
 * Precision note:
 *   Sample/write is `<4 x half>` (16-bit float). Our TS sample/write
 *   contract exposes float32 tuples; if callers want strict bit-exact
 *   half-precision, they should f16-round at their sampler/writer
 *   boundaries. This transcription does NOT re-round to half — the IR
 *   itself doesn't do any half arithmetic in the body, only load/store.
 */

/**
 * Sample function contract — one 2D sample returning RGBA half4. The IR
 * calls `air.sample_texture_2d.v4f16` with the metallib's inline sampler
 * state and normalised uv (offset=0, lod=0.0). Exposed as float32 tuple.
 * @IR %13 — the sampler is `__air_sampler_state`, texture is `inTex`.
 */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Write function contract — one 2D half4 write at a ushort2 pixel. The IR
 * emits `air.write_texture_2d.i16.v4f16` (mip=0, dim=2). Exposed as float32
 * tuple.
 * @IR call after %14 in block %3.
 */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * bicubicDownscale — one dispatched thread.
 *
 * @param sample_inTex sampler-bound reader for inTex (with the metallib's
 *                     inline __air_sampler_state — the "bicubic" filter is
 *                     encoded in that sampler descriptor, not in this body)
 * @param write_outTex writer for outTex
 * @param outWidth     outTex.get_width(0)  — @IR %4
 * @param outHeight    outTex.get_height(0) — @IR %7
 * @param gid          [[thread_position_in_grid]] ushort2 (destination pixel)
 *
 * @IR entire function @0x00000000001c59.
 */
export function bicubicDownscale(
  sample_inTex: Sample2D,
  write_outTex: Write2D,
  outWidth: number,
  outHeight: number,
  gid: [number, number],
): void {
  // @IR %4 = air.get_width_texture_2d(outTex, 0)
  //     %5 = air.convert.f.f32.u.i32(%4)   ; UNSIGNED int→float
  //     %6 = insertelement undef, %5, 0
  const w = Math.fround((outWidth | 0) >>> 0);
  // @IR %7 = air.get_height_texture_2d(outTex, 0)
  //     %8 = air.convert.f.f32.u.i32(%7)   ; UNSIGNED int→float
  //     %9 = insertelement %6, %8, 1
  const h = Math.fround((outHeight | 0) >>> 0);

  // @IR %10 = air.convert.f.v2f32.u.v2i16(gid)   ; UNSIGNED i16→f32 pair
  // ushort2 → uint16 lanes → float; coerce lane by lane.
  const gxu = (gid[0] & 0xffff) >>> 0;
  const gyu = (gid[1] & 0xffff) >>> 0;
  const gxf = Math.fround(gxu);
  const gyf = Math.fround(gyu);

  // @IR %11 = fadd fast %10, <0.5, 0.5>
  const gxHalf = Math.fround(gxf + 0.5);
  const gyHalf = Math.fround(gyf + 0.5);
  // @IR %12 = fdiv fast %11, %9    ; per-lane divide by (outW, outH)
  const uvx = Math.fround(gxHalf / w);
  const uvy = Math.fround(gyHalf / h);

  // @IR %13 = air.sample_texture_2d.v4f16(inTex, __air_sampler_state,
  //           <uvx, uvy>, offset=0, lod=0.0)
  //     %14 = extractvalue lane 0 (drop residency i8)
  const c = sample_inTex([uvx, uvy]);

  // @IR write_texture_2d.i16.v4f16(outTex, gid, %14, 0, 2)
  write_outTex([gxu | 0, gyu | 0], [
    Math.fround(c[0]),
    Math.fround(c[1]),
    Math.fround(c[2]),
    Math.fround(c[3]),
  ]);
  // @IR ret
}
