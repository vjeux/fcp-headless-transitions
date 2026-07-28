// soMOMotionEstimation__soMOMotionEstimation_decimate.ts — direct TS mapping
// of the Metal compute kernel `soMOMotionEstimation::soMOMotionEstimation_decimate`
// from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader soMOMotionEstimation::soMOMotionEstimation_decimate (HeliumSenso) @0x000000000c504d
// IR provenance: raw-port/re/shaders/soMOMotionEstimation__soMOMotionEstimation_decimate.ll
// (header: `0x000000000c504d -- soMOMotionEstimation::soMOMotionEstimation_decimate`)
//
// 2× decimator (downsampler) for a uint texture. For each destination
// pixel at integer grid position (gx, gy), the shader samples the source
// texture at input-space coordinate (2*gx + 0.5, 2*gy + 0.5) — i.e. the
// centre of the corresponding 2×2 block in the source — using the module
// sampler `__air_sampler_state` (a single 64-bit sampler descriptor,
// value 0x8080000000000000 signed = -9188470239253725184 signed), then
// writes the sampled uint4 to the destination at (gx, gy).
//
// Signature (%N naming from the .ll):
//   void @soMOMotionEstimation::soMOMotionEstimation_decimate(
//     <2 x i32> %0,                    // thread_position_in_grid  (gx, gy)   [!17]
//     texture2d<uint, sample> %1,      // src                                 [!18]
//     texture2d<uint, write>  %2       // dst                                 [!19]
//   )
//
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// The only fp ops are the two int-to-float lane converts (%13, %16) and
// the +0.5 pixel-centre bias (%18); no arithmetic is performed on the
// sampled uint4 lanes.
//
// AIR intrinsics used:
//   air.get_width_texture_2d (src, lod=0)   -> i32 width          %6
//   air.get_height_texture_2d(src, lod=0)   -> i32 height         %9
//   air.convert.f.f32.s.i32(<signed i32>)   -> f32                %13, %16
//   air.sample_texture_2d.u.v4i32(src, sampler, uv,
//                                 /*offset_valid=*/i1 true, <0,0>,
//                                 /*bias_valid=*/i1 false, 0.0, 0.0, i32 0)
//                                          -> { <4 x i32>, i8 }   %19
//   air.write_texture_2d.u.v4i32(dst, coord, value, mip=0, mask=2)  %20
//
// Line-by-line map from the .ll body:
//   %4  = extractelement <2 x i32> %0, i64 0       -> gx
//   %5  = extractelement <2 x i32> %0, i64 1       -> gy
//   %6  = air.get_width_texture_2d (src, 0)         -> srcW
//   %7  = icmp slt i32 gx, srcW                     -> in-bounds x
//   br  %7, label %8, label %21                     ; else return
//   %9  = air.get_height_texture_2d(src, 0)         -> srcH
//   %10 = icmp slt i32 gy, srcH                     -> in-bounds y
//   br  %10, label %11, label %21                   ; else return
//   %12 = shl nsw i32 gx, 1                         -> 2*gx
//   %13 = air.convert.f.f32.s.i32(2*gx)             -> float(2*gx)
//   %14 = insertelement <2 x f32> undef, %13, 0     -> uvBase.x = float(2*gx)
//   %15 = shl nsw i32 gy, 1                         -> 2*gy
//   %16 = air.convert.f.f32.s.i32(2*gy)             -> float(2*gy)
//   %17 = insertelement <2 x f32> %14, %16, 1       -> uvBase.y = float(2*gy)
//   %18 = fadd <2 x f32> %17, <0.5, 0.5>            -> uv = (2*gx+0.5, 2*gy+0.5)
//   %19 = air.sample_texture_2d.u.v4i32(src, sampler, uv, ...) -> {rgba,resid}
//   %20 = extractvalue %19, 0                       -> uint4 rgba
//   air.write_texture_2d.u.v4i32(dst, %0, rgba, 0, 2)
//   br  label %21 ; ret void
//
// Sampler state (@__air_sampler_state, !20): the shader declares a single
// module-scope sampler descriptor whose raw 64-bit value is 0x8080000000000000
// (encoded as signed i64 = -9188470239253725184). The FCP sampler
// descriptor bits are not decoded here — the destination pixel-centre
// coordinate 2*gx+0.5, 2*gy+0.5 aligns exactly on the source integer grid
// (source pixel (2*gx, 2*gy)), so with nearest-neighbour filtering the
// sample returns exactly src[2*gx, 2*gy] with clamp-to-edge on the
// (rare) out-of-bounds fringe. This matches the standard AIR
// "sampler(coord::pixel, filter::nearest, address::clamp_to_edge)"
// descriptor commonly emitted for pixel-space integer sampling in FCP's
// motion-estimation pyramids; the JS `sample` callback below models
// that nearest-neighbour + clamp-to-edge behaviour.

/**
 * Callback modelling AIR `air.sample_texture_2d.u.v4i32` — the caller
 * supplies a function that, given the opaque uint-texture handle plus a
 * 2D float UV in pixel-space, returns the sampled RGBA as four u32-valued
 * numbers (0..2^32-1 domain). The trailing offset/bias/min_lod
 * parameters in the intrinsic are inert at this call site (offset=(0,0),
 * bias_valid=false, bias=0.0, min_lod=0.0, sampler_bias=0) and are not
 * modeled. The module sampler @__air_sampler_state (see file header) is
 * nearest-neighbour with clamp-to-edge in pixel-space coordinates.
 */
export type SampleU32Fn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Callback modelling AIR `air.write_texture_2d.u.v4i32` — the caller
 * supplies a function that stores a uint4 value at integer pixel (x, y)
 * of the destination texture at mip level 0.
 */
export type WriteU32Fn<T> = (texture: T, x: number, y: number, rgba: readonly [number, number, number, number]) => void;

/**
 * Callback returning the width (in pixels) of a uint texture at mip 0.
 * Models AIR `air.get_width_texture_2d(tex, i32 0)`.
 */
export type TexWidthFn<T> = (texture: T) => number;

/**
 * Callback returning the height (in pixels) of a uint texture at mip 0.
 * Models AIR `air.get_height_texture_2d(tex, i32 0)`.
 */
export type TexHeightFn<T> = (texture: T) => number;

/**
 * Compute kernel `soMOMotionEstimation::soMOMotionEstimation_decimate` —
 * 2× nearest-neighbour decimator for a uint texture. For destination
 * pixel (gx, gy), samples the source at pixel-space UV
 * (2*gx + 0.5, 2*gy + 0.5) and writes the result to the destination at
 * (gx, gy). Out-of-bounds threads (gx >= srcW || gy >= srcH) early-out
 * without writing.
 *
 * @shader soMOMotionEstimation::soMOMotionEstimation_decimate (HeliumSenso)
 * @param gridPos       Thread position in grid (gx, gy) — %0.
 * @param src           Source uint texture (read) — %1.
 * @param dst           Destination uint texture (write) — %2.
 * @param sample        AIR `air.sample_texture_2d.u.v4i32` callback.
 * @param write         AIR `air.write_texture_2d.u.v4i32` callback.
 * @param getWidth      AIR `air.get_width_texture_2d` callback.
 * @param getHeight     AIR `air.get_height_texture_2d` callback.
 */
export function soMOMotionEstimation__soMOMotionEstimation_decimate<TSrc, TDst>(
  gridPos: readonly [number, number],   // %0
  src: TSrc,                             // %1
  dst: TDst,                             // %2
  sample: SampleU32Fn<TSrc>,
  write: WriteU32Fn<TDst>,
  getWidth: TexWidthFn<TSrc>,
  getHeight: TexHeightFn<TSrc>,
): void {
  const gx = gridPos[0] | 0;              // %4
  const gy = gridPos[1] | 0;              // %5

  // %6 = air.get_width_texture_2d(src, 0); %7 = icmp slt gx, srcW
  const srcW = getWidth(src) | 0;
  if (!(gx < srcW)) return;               // br %7 -> %21 ret

  // %9 = air.get_height_texture_2d(src, 0); %10 = icmp slt gy, srcH
  const srcH = getHeight(src) | 0;
  if (!(gy < srcH)) return;               // br %10 -> %21 ret

  // %12 = shl nsw gx, 1 ; %13 = air.convert.f.f32.s.i32(%12)
  // %14 = insertelement <2 x f32> undef, %13, 0
  // %15 = shl nsw gy, 1 ; %16 = air.convert.f.f32.s.i32(%15)
  // %17 = insertelement <2 x f32> %14, %16, 1
  // %18 = fadd <2 x f32> %17, <0.5, 0.5>
  //   uv = (float(2*gx) + 0.5, float(2*gy) + 0.5)
  const u = Math.fround(Math.fround((gx << 1) | 0) + Math.fround(0.5));
  const v = Math.fround(Math.fround((gy << 1) | 0) + Math.fround(0.5));

  // %19 = air.sample_texture_2d.u.v4i32(src, __air_sampler_state, uv, ...)
  // %20 = extractvalue %19, 0
  const rgba = sample(src, u, v);

  // air.write_texture_2d.u.v4i32(dst, %0, rgba, 0, 2)
  write(dst, gx, gy, rgba);
  // br label %21 ; ret void
}
