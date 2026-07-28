// @shader soOFlowEstimator::soOFlowEstimator_resampleFlow (HeliumSenso) @0x000000000a798d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_resampleFlow.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000a798d -- soOFlowEstimator::
// soOFlowEstimator_resampleFlow:` — that is the shader's entry offset
// in the metallib. Compile options: `denorms_disable`,
// `fast_math_disable`, `framebuffer_fetch_enable`. fast-math is OFF,
// so every fp32 op is bit-exact IEEE-754 (Math.fround on each
// intermediate); the three `llvm.fmuladd.v2f32` intrinsics (%72, %75,
// %78) are modelled as unrounded `Math.fround(a*b + c)` (single-step
// rounding).
//
// AIR sampler_state metadata (@__air_sampler_state = i64
// -9188470239253725111 = 0x8080000000000089): nearest-neighbour +
// clamp-to-edge in pixel-space at the pixel-centre UV `x + 0.5`.
// (The `+ 0.5` fp32 bias is applied literally at %47, %55, %61, %66.)
//
// Params struct (from !18):
//   offset  0 : int   m_prevDimX      -- source (flowIn) width.
//   offset  4 : int   m_prevDimY      -- source (flowIn) height.
//   offset  8 : float m_flowInScaleX  -- dest-coord -> src-coord X scale.
//   offset 12 : float m_flowInScaleY  -- dest-coord -> src-coord Y scale.
//   offset 16 : float m_scaleFlow     -- output flow magnitude scale.
//
// Signature (from !14..!21):
//   params  : constant address-space struct (see above).
//   coordOut : uint2 -- air.thread_position_in_grid (dest pixel).
//   flowIn  : texture2d<float, sample> index 0 -- source flow.
//   flowOut : texture2d<float, write>  index 1 -- destination flow.
//
// Bounds guards at %10 (`icmp ult` coordOut.x < flowOut.width)
// and %14 (`icmp ult` coordOut.y < flowOut.height) use UNSIGNED
// comparisons — preserved literally. `air.get_width/height_texture_2d`
// on `flowOut` supplies the dest dimensions (there is no explicit
// dest-dim field in params).
//
// Silent-correctness note (SHADERS.md):
//   - %22 uses `air.convert.f.v2f32.u.v2i32` (UNSIGNED int -> float).
//     coordOut is uint2 (already non-negative), so the unsigned
//     interpretation matches the signed one bit-for-bit. Still,
//     we coerce via `>>> 0` before the `Math.fround` to preserve
//     the unsigned-widen contract, per SHADERS.md.
//   - The inner clamp helper `soOFlowEstimator_clampedCoord` uses
//     `air.convert.s.i32.f.f32` for the fp32->i32 conversion, which
//     is round-toward-zero (LLVM `fptosi` semantics). We emulate with
//     `Math.trunc(x) | 0` (SHADERS.md idiom for i32 casts after a
//     clamp/valid range).
//
// Line-by-line map of the .ll body follows below (in-source comments).

/**
 * Params buffer for `soOFlowEstimator::soOFlowEstimator_resampleFlow`
 * — mirrors the AIR struct at !18 (20-byte packed record, five
 * four-byte fields).
 */
export interface SoOFlowEstimatorResampleFlowParams {
  m_prevDimX: number;      // offset  0 : int   (source width)
  m_prevDimY: number;      // offset  4 : int   (source height)
  m_flowInScaleX: number;  // offset  8 : float (dest -> src X scale)
  m_flowInScaleY: number;  // offset 12 : float (dest -> src Y scale)
  m_scaleFlow: number;     // offset 16 : float (output flow magnitude scale)
}

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the float
 * texture at (u, v) with the bound sampler and returns the four rgba
 * lanes. Only .xy is consumed (per the `<0, 1>` shuffles at %50 and
 * %64).
 */
export type SampleFloatTex2D<T> = (
  texture: T,
  u: number,
  v: number,
) => [number, number, number, number];

/**
 * Callback for AIR `air.write_texture_2d.v4f32` — writes the four rgba
 * lanes at integer pixel coord (x, y) in the destination.
 */
export type WriteFloatTex2D<T> = (
  texture: T,
  x: number,
  y: number,
  rgba: [number, number, number, number],
) => void;

/**
 * Callback for AIR `air.get_width/height_texture_2d(tex, lod=0)`.
 */
export type GetTexDim<T> = (texture: T) => number;

/**
 * Result of the inlined `soOFlowEstimator::soOFlowEstimator_clampedCoord`
 * helper — three <2>-vectors written through pointer args by the
 * helper. Modelled as a mutating accumulator object per SHADERS.md's
 * "no tuples of typed arrays" trap.
 */
interface ClampedCoordOut {
  lo: [number, number]; // %19 / %32 stored at %5 : floor coord, clamped to [lo, hi]
  hi: [number, number]; // %19+1 clamps stored at %6 : floor+1 clamped
  frac: [number, number]; // %34 fractional part (x - floor(x)) per lane
}

/**
 * Inlined helper `_ZN16soOFlowEstimator29soOFlowEstimator_clampedCoord...`
 * (fastcc, defined in the same .ll). For each of the two axes:
 *   i        = fptosi(f)                    -- round-toward-zero i32
 *   f_i      = sitofp(i)                    -- back to fp32
 *   frac     = f - f_i                      -- fractional (may be neg)
 *   lo_clamp = clamp(i,     [lo_i32, hi_i32])
 *   hi_clamp = clamp(i + 1, [lo_i32, hi_i32])
 * Then packs (lo_x, lo_y), (hi_x, hi_y), (frac_x, frac_y) into three
 * <2>-vectors and stores through pointer args.
 *
 * Called by the outer kernel with lo = <0, 0> and hi = <dimX-1, dimY-1>.
 */
function soOFlowEstimator_clampedCoord(
  f: [number, number],
  lo: [number, number],
  hi: [number, number],
): ClampedCoordOut {
  // ---- axis 0 (x) ----
  // %7  = extractelement f, 0
  const fx = Math.fround(f[0]);
  const lox = lo[0] | 0;
  const hix = hi[0] | 0;
  // %10 = air.convert.s.i32.f.f32(fx)      -- fptosi (trunc toward zero).
  const ix = Math.trunc(fx) | 0;
  // %11 = air.convert.f.f32.s.i32(ix)      -- back to fp32.
  const ixf = Math.fround(ix);
  // %12 = fsub fx, ixf                     -- fractional part.
  const fracX = Math.fround(fx - ixf);
  // %13 = air.min.s.i32(ix, hix)
  // %14 = air.max.s.i32(%13, lox)         -- lo-clamp of `ix`.
  const loClampX = Math.max(Math.min(ix, hix), lox) | 0;
  // %16 = ix + 1
  // %17 = air.min.s.i32(%16, hix)
  // %18 = air.max.s.i32(%17, lox)         -- lo-clamp of `ix+1`.
  const hiClampX = Math.max(Math.min((ix + 1) | 0, hix), lox) | 0;

  // ---- axis 1 (y) ----
  const fy = Math.fround(f[1]);
  const loy = lo[1] | 0;
  const hiy = hi[1] | 0;
  const iy = Math.trunc(fy) | 0;
  const iyf = Math.fround(iy);
  const fracY = Math.fround(fy - iyf);
  const loClampY = Math.max(Math.min(iy, hiy), loy) | 0;
  const hiClampY = Math.max(Math.min((iy + 1) | 0, hiy), loy) | 0;

  return {
    lo: [loClampX, loClampY],
    hi: [hiClampX, hiClampY],
    frac: [fracX, fracY],
  };
}

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_resampleFlow`.
 *
 * Bilinearly resamples a two-channel flow texture at every in-bounds
 * destination pixel `coordOut`. The dest-space integer coord is
 * scaled by `(m_flowInScaleX, m_flowInScaleY)` into source-space fp32
 * space, then the four corner integer sample coordinates (floor and
 * floor+1 on each axis, clamped to `[0, prevDim-1]`) are sampled and
 * the four .xy pairs are bilinearly interpolated with the fractional
 * offsets. The resulting 2-vector is multiplied by `m_scaleFlow` and
 * broadcast to `(v.x, v.y, v.x, v.y)` for the four-channel write.
 *
 * The bilinear interpolation is done as two `fmuladd` "horizontal"
 * lerps (%72 and %75), followed by a "vertical" `fmuladd` lerp (%78);
 * this is the classic form `top + fy * (bot - top)` where each of
 * `top`/`bot` is itself `p00 + fx * (p10 - p00)`.
 *
 * Denorms disabled + fast-math disabled per !air.compile_options —
 * every fp32 op is bit-exact IEEE-754.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_resampleFlow (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_resampleFlow<TIn, TOut>(
  params: SoOFlowEstimatorResampleFlowParams,
  coordOut: [number, number],
  flowIn: TIn,
  flowOut: TOut,
  sampleFlowIn: SampleFloatTex2D<TIn>,
  writeFlowOut: WriteFloatTex2D<TOut>,
  getFlowOutWidth: GetTexDim<TOut>,
  getFlowOutHeight: GetTexDim<TOut>,
): void {
  // %8  = extractelement coordOut, 0
  // %9  = air.get_width_texture_2d(flowOut, 0)
  // %10 = icmp ult coordOut.x, flowOut.width          -- UNSIGNED compare.
  const coordX = coordOut[0] >>> 0;
  const dstW = getFlowOutWidth(flowOut) >>> 0;
  if (!(coordX < dstW)) {
    // br i1 %10 false -> label %81 : ret void.
    return;
  }

  // %12 = extractelement coordOut, 1
  // %13 = air.get_height_texture_2d(flowOut, 0)
  // %14 = icmp ult coordOut.y, flowOut.height         -- UNSIGNED compare.
  const coordY = coordOut[1] >>> 0;
  const dstH = getFlowOutHeight(flowOut) >>> 0;
  if (!(coordY < dstH)) {
    // br i1 %14 false -> label %81 : ret void.
    return;
  }

  // %17, %20 : load m_flowInScaleX, m_flowInScaleY into <2 x float>.
  const scaleX = Math.fround(params.m_flowInScaleX);
  const scaleY = Math.fround(params.m_flowInScaleY);

  // %22 = air.convert.f.v2f32.u.v2i32(coordOut)       -- UNSIGNED int->float.
  //   coordOut is uint2; we've already coerced via `>>> 0` above, so
  //   the widen is exact. SHADERS.md's silent-correctness trap: force
  //   the unsigned path via `>>> 0` before Math.fround.
  const coordFx = Math.fround(coordX >>> 0);
  const coordFy = Math.fround(coordY >>> 0);

  // %24, %27 : load m_prevDimX, m_prevDimY into <2 x i32>.
  // %29 = <prevDimX, prevDimY> - <1, 1>               -- upper clamp bound.
  const prevDimX = params.m_prevDimX | 0;
  const prevDimY = params.m_prevDimY | 0;
  const hiX = (prevDimX - 1) | 0;
  const hiY = (prevDimY - 1) | 0;

  // %30 = fmul <coordFx, coordFy>, <scaleX, scaleY>   -- dest -> src float coord.
  const srcFx = Math.fround(coordFx * scaleX);
  const srcFy = Math.fround(coordFy * scaleY);

  // Call soOFlowEstimator_clampedCoord(<srcFx, srcFy>, <0,0>, <hiX, hiY>).
  //   Returns (lo, hi, frac) via three pointer args at %5, %6, %7.
  const cc = soOFlowEstimator_clampedCoord(
    [srcFx, srcFy],
    [0, 0],
    [hiX, hiY],
  );

  // %35, %37 : load m_scaleFlow and broadcast to <2 x float>.
  const scaleFlow = Math.fround(params.m_scaleFlow);

  // %38 = load <2 x i32> from %5 (cc.lo).
  // %39 = load <2 x i32> from %6 (cc.hi).
  // %40 = load <2 x float> from %7 (cc.frac).
  const loX = cc.lo[0] | 0;
  const loY = cc.lo[1] | 0;
  const hiXi = cc.hi[0] | 0;
  const hiYi = cc.hi[1] | 0;
  const fracX = Math.fround(cc.frac[0]);
  const fracY = Math.fround(cc.frac[1]);

  // %41..%47 : build UV for (loX, loY) = P00 sample.
  //   air.convert.f.f32.s.i32 : SIGNED int->float (per-lane in the
  //   helper). Clamped values are non-negative, so signed/unsigned
  //   coincide here — still `Math.fround(x)` (signed round-trip).
  const loXf = Math.fround(loX);
  const loYf = Math.fround(loY);
  const uv00u = Math.fround(loXf + Math.fround(0.5));
  const uv00v = Math.fround(loYf + Math.fround(0.5));

  // %48 = air.sample_texture_2d(flowIn, sampler, uv00, ...)
  // %49 = extractvalue %48, 0
  // %50 = shufflevector .xy                           -- .r, .g of P00.
  const p00 = sampleFlowIn(flowIn, uv00u, uv00v);
  const p00r = Math.fround(p00[0]);
  const p00g = Math.fround(p00[1]);

  // %51..%55 : UV for (hiX, loY) = P10 sample.
  const hiXf = Math.fround(hiXi);
  const uv10u = Math.fround(hiXf + Math.fround(0.5));
  const uv10v = Math.fround(loYf + Math.fround(0.5));

  // %56 = air.sample_texture_2d(flowIn, sampler, uv10, ...)
  // %57 = extractvalue %56, 0                         -- P10 rgba.
  const p10 = sampleFlowIn(flowIn, uv10u, uv10v);
  const p10r = Math.fround(p10[0]);
  const p10g = Math.fround(p10[1]);

  // %58..%61 : UV for (loX, hiY) = P01 sample.
  const hiYf = Math.fround(hiYi);
  const uv01u = Math.fround(loXf + Math.fround(0.5));
  const uv01v = Math.fround(hiYf + Math.fround(0.5));

  // %62 = air.sample_texture_2d(flowIn, sampler, uv01, ...)
  // %63 = extractvalue %62, 0
  // %64 = shufflevector .xy                           -- .r, .g of P01.
  const p01 = sampleFlowIn(flowIn, uv01u, uv01v);
  const p01r = Math.fround(p01[0]);
  const p01g = Math.fround(p01[1]);

  // %65..%66 : UV for (hiX, hiY) = P11 sample.
  const uv11u = Math.fround(hiXf + Math.fround(0.5));
  const uv11v = Math.fround(hiYf + Math.fround(0.5));

  // %67 = air.sample_texture_2d(flowIn, sampler, uv11, ...)
  // %68 = extractvalue %67, 0                         -- P11 rgba.
  const p11 = sampleFlowIn(flowIn, uv11u, uv11v);
  const p11r = Math.fround(p11[0]);
  const p11g = Math.fround(p11[1]);

  // %69 = shufflevector frac, <0, 0>                  -- broadcast fracX.
  // %70 = fsub P10.rgba, P00.rgba                     -- (v4f32 diff).
  // %71 = shufflevector .xy                           -- .r,.g of diff.
  // %72 = llvm.fmuladd.v2f32(<fracX,fracX>, %71, P00.xy)
  //         -- top = P00 + fracX * (P10 - P00)   (horizontal lerp, top).
  const top0 = Math.fround(fracX * Math.fround(p10r - p00r) + p00r);
  const top1 = Math.fround(fracX * Math.fround(p10g - p00g) + p00g);

  // %73 = fsub P11.rgba, P01.rgba
  // %74 = shufflevector .xy
  // %75 = llvm.fmuladd.v2f32(<fracX,fracX>, %74, P01.xy)
  //         -- bot = P01 + fracX * (P11 - P01)   (horizontal lerp, bot).
  const bot0 = Math.fround(fracX * Math.fround(p11r - p01r) + p01r);
  const bot1 = Math.fround(fracX * Math.fround(p11g - p01g) + p01g);

  // %76 = shufflevector frac, <1, 1>                  -- broadcast fracY.
  // %77 = fsub bot, top
  // %78 = llvm.fmuladd.v2f32(<fracY,fracY>, %77, top)
  //         -- result = top + fracY * (bot - top)   (vertical lerp).
  const res0 = Math.fround(fracY * Math.fround(bot0 - top0) + top0);
  const res1 = Math.fround(fracY * Math.fround(bot1 - top1) + top1);

  // %79 = fmul <scaleFlow, scaleFlow>, res              -- scale magnitude.
  const outX = Math.fround(scaleFlow * res0);
  const outY = Math.fround(scaleFlow * res1);

  // %80 = shufflevector %79, <4 x i32> <0, 1, 0, 1>    -- (v.x, v.y, v.x, v.y).
  // air.write_texture_2d.v4f32(flowOut, coordOut, %80, 0, 2).
  writeFlowOut(flowOut, coordX | 0, coordY | 0, [outX, outY, outX, outY]);
  // br label %81 (ret void).
}
