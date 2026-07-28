// soOFlowEstimator__soOFlowEstimator_flowWarpOneImageWithResampleFlow.ts —
// direct TS mapping of the Metal compute kernel
// `soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow`
// from HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow (HeliumSenso) @0x000000000aa6cd
// IR provenance: raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_flowWarpOneImageWithResampleFlow.ll
// (header: `0x000000000aa6cd -- soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow`)
//
// Combined "resample the flow field + warp one input image" kernel used
// in FCP's optical-flow pyramid. For each destination pixel (gx, gy),
// bounds-checked against (dimX, dimY):
//
//   1. Resample the previous-level flow field. Compute a bilinear read
//      into `flowIn` at the corresponding location in the prev-pyramid
//      grid — `coord * (prevDim / dim)` — clamped to [0, prevDim-1],
//      taking .xy (the flow-vector lanes). Then RESCALE that read by
//      dividing by the same (prevDim / dim) factor so the flow vector
//      is expressed in the current level's pixel units. Write the
//      rescaled flow into `flowOut` as `(fx, fy, 0, 0)`.
//
//   2. Warp `I1` using that flow. Warped position = coord - m_dt *
//      flowInterp, clamped to [0, dim-1]. Bilinear-sample I1 at that
//      position and extract lane 0 (I1 is stored with the luminance in
//      the .r channel). Write to I1_flowWarped as `(y, y, y, 1)`.
//
// Both bilinear reads use the standard 4-tap `[TL, TR, BL, BR]` scheme
// with per-tap UV offset around the pixel-centre of the floor:
//   base = floor(pos) + 0.5   ; frac = pos - floor(pos)
//   TL = base + (0, 0), TR = base + (1, 0),
//   BL = base + (0, 1), BR = base + (1, 1)
//   top    = lerp(TL.xy, TR.xy, frac.x)   ; llvm.fmuladd(frac.x, TR - TL, TL)
//   bottom = lerp(BL.xy, BR.xy, frac.x)
//   result = lerp(top,   bottom, frac.y)  ; llvm.fmuladd(frac.y, bot - top, top)
//
// -----------------------------------------------------------------------------
// Signature (%N naming from the .ll):
//   void @soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow(
//     %params*                    %0,   // params
//     <2 x i32>                   %1,   // thread_position_in_grid (gx, gy)
//     sampler                     %2,   // user-supplied sampler `sam`
//     texture2d<float, sample>    %3,   // I1_
//     texture2d<float, write>     %4,   // I1_flowWarped_
//     texture2d<float, sample>    %5,   // flowIn_
//     texture2d<float, write>     %6    // flowOut_
//   )
//
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// Fast-math is DISABLED — use plain fp32 ops via Math.fround; llvm.fmuladd.f32
// is modeled as `Math.fround(a*b + c)`.
//
// -----------------------------------------------------------------------------
// Params struct layout (from !18 in the .ll):
//   f32   m_dt         @  0    field 0
//   i32   m_prevDimX   @  4    field 1
//   i32   m_prevDimY   @  8    field 2
//   i32   m_dimX       @ 12    field 3
//   i32   m_dimY       @ 16    field 4
//
// SAMPLER: the sampler is USER-SUPPLIED (kernel arg %2), unlike the many
// other soO* kernels that use @__air_sampler_state — so the JS callback
// takes the sampler as its own opaque handle. It is passed unchanged to
// every sample. The .metal declares it as `sampler sam` — clamp mode and
// filter are the caller's choice; the FCP CLG pipeline uses a linear
// clamp-to-edge sampler here, but the kernel does its OWN bilinear
// weighting on top by taking 4 discrete taps at pixel-centre + integer
// offsets — so the sampler's filter mode is essentially irrelevant
// (nearest-neighbour would give the same result at those specific UVs).
//
// -----------------------------------------------------------------------------
// Bounds check uses UNSIGNED-fp compare (fcmp ult) of `f32(u_i32(gx))` vs
// `f32(s_i32(dimX))`. Since (gx, gy) are the grid position (nonnegative)
// and (dimX, dimY) are positive, this reduces to gx < dimX, gy < dimY.

/**
 * Uniform buffer matching
 * `%struct.soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow_params`
 * (!18): 5 fields.
 */
export interface SoOFlowEstimatorFlowWarpParams {
  /** field 0 — f32 `m_dt`         (per-step flow magnitude / sign). */
  readonly dt: number;
  /** field 1 — i32 `m_prevDimX`   (previous-level flow width). */
  readonly prevDimX: number;
  /** field 2 — i32 `m_prevDimY`   (previous-level flow height). */
  readonly prevDimY: number;
  /** field 3 — i32 `m_dimX`       (current-level width; grid.x bound). */
  readonly dimX: number;
  /** field 4 — i32 `m_dimY`       (current-level height; grid.y bound). */
  readonly dimY: number;
}

/** AIR `air.sample_texture_2d.v4f32(tex, sam, uv, ...)` callback. */
export type SampleFloatFn<TTex, TSam> = (texture: TTex, sampler: TSam, u: number, v: number) => [number, number, number, number];

/** AIR `air.write_texture_2d.v4f32` callback. */
export type WriteFloat4Fn<T> = (texture: T, x: number, y: number, rgba: readonly [number, number, number, number]) => void;

/** AIR `air.floor.v2f32(v2)` — componentwise floor. */
function airFloor2(x: number, y: number): [number, number] {
  return [Math.floor(x), Math.floor(y)];
}

/**
 * AIR `air.clamp.v2f32(v, lo, hi)` — componentwise clamp. Undefined
 * behaviour for lo > hi; here the callers guarantee lo=0 <= hi=dim-1.
 */
function airClamp2(x: number, y: number, loX: number, loY: number, hiX: number, hiY: number): [number, number] {
  const cx = x < loX ? loX : (x > hiX ? hiX : x);
  const cy = y < loY ? loY : (y > hiY ? hiY : y);
  return [Math.fround(cx), Math.fround(cy)];
}

/** LLVM `llvm.fmuladd.f32(a, b, c)` — single-rounded a*b+c under fast-math OFF. */
function fmuladd_f32(a: number, b: number, c: number): number {
  return Math.fround(Math.fround(Math.fround(a) * Math.fround(b)) + Math.fround(c));
}

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_flowWarpOneImageWithResampleFlow`.
 */
export function soOFlowEstimator__soOFlowEstimator_flowWarpOneImageWithResampleFlow<TSam, TI1, TFlowIn, TI1Out, TFlowOut>(
  params: SoOFlowEstimatorFlowWarpParams,                    // %0
  gridPos: readonly [number, number],                         // %1
  sam: TSam,                                                  // %2
  I1_: TI1,                                                   // %3
  I1_flowWarped_: TI1Out,                                     // %4
  flowIn_: TFlowIn,                                           // %5
  flowOut_: TFlowOut,                                         // %6
  sampleI1: SampleFloatFn<TI1, TSam>,
  sampleFlowIn: SampleFloatFn<TFlowIn, TSam>,
  writeI1Warp: WriteFloat4Fn<TI1Out>,
  writeFlowOut: WriteFloat4Fn<TFlowOut>,
): void {
  const gx = gridPos[0] | 0;
  const gy = gridPos[1] | 0;

  // %8 = convert.f.v2f32.u.v2i32(coord)  -> (float(gx), float(gy))
  //   NOTE: this is UNSIGNED-fp conversion (see SHADERS.md
  //   air.convert.f.u.* trap). Coerce to u32 before Math.fround.
  const coordFx = Math.fround(gx >>> 0);
  const coordFy = Math.fround(gy >>> 0);

  // %11 = f32(s_i32(m_dimX)) ; %15 = f32(s_i32(m_dimY))
  //   These are SIGNED-fp converts. dim{X,Y} are nonnegative but the
  //   IR intrinsic is .s.i32.
  const dimXf = Math.fround(params.dimX | 0);
  const dimYf = Math.fround(params.dimY | 0);

  // %19 = f32(s_i32(m_prevDimX)) ; %23 = f32(s_i32(m_prevDimY))
  const prevDimXf = Math.fround(params.prevDimX | 0);
  const prevDimYf = Math.fround(params.prevDimY | 0);

  // %26 = f32(u_i32(gx)) ; %27 = fcmp ult coordFx, dimXf
  if (!(coordFx < dimXf)) return; // fcmp ult; false path -> %102 ret
  // %30 = f32(u_i32(gy)) ; %31 = fcmp ult coordFy, dimYf
  if (!(coordFy < dimYf)) return;

  // ---- flow resample (%32 .. %65) ----

  // %33 = <prevDimXf, prevDimYf> / <dimXf, dimYf>       — scale (2-vec)
  const scaleX = Math.fround(prevDimXf / dimXf);
  const scaleY = Math.fround(prevDimYf / dimYf);
  // %34 = coord * scale                                 — coordInPrev (2-vec)
  const inPrevX = Math.fround(coordFx * scaleX);
  const inPrevY = Math.fround(coordFy * scaleY);
  // %35 = <prevDimXf, prevDimYf> + (-1, -1)              — prevDim - 1
  const prevMaxX = Math.fround(prevDimXf + Math.fround(-1));
  const prevMaxY = Math.fround(prevDimYf + Math.fround(-1));
  // %36 = clamp(coordInPrev, 0, prevDim - 1)
  const [clampedX, clampedY] = airClamp2(inPrevX, inPrevY, 0, 0, prevMaxX, prevMaxY);
  // %37 = floor(%36)
  const [floorX, floorY] = airFloor2(clampedX, clampedY);
  // %38 = %36 - %37                                     — fract (fx, fy)
  const fracX = Math.fround(clampedX - Math.fround(floorX));
  const fracY = Math.fround(clampedY - Math.fround(floorY));
  // %39 = floor + (0.5, 0.5)                            — base = pixel-centre TL
  const baseX = Math.fround(Math.fround(floorX) + Math.fround(0.5));
  const baseY = Math.fround(Math.fround(floorY) + Math.fround(0.5));
  // %40 = base + (1, 0)  ; %41 = base + (0, 1) ; %42 = base + (1, 1)
  const trX = Math.fround(baseX + Math.fround(1));  // %40.x
  const trY = baseY;                                 // %40.y
  const blX = baseX;                                 // %41.x
  const blY = Math.fround(baseY + Math.fround(1));  // %41.y
  const brX = Math.fround(baseX + Math.fround(1));  // %42.x
  const brY = Math.fround(baseY + Math.fround(1));  // %42.y

  // 4 sample taps on flowIn.
  // %43/%44 tl rgba ; %45 = tl.xy
  const tlSample = sampleFlowIn(flowIn_, sam, baseX, baseY);
  const tlX = Math.fround(tlSample[0]);
  const tlY = Math.fround(tlSample[1]);
  // %46/%47 tr rgba (full <4>)
  const trSample = sampleFlowIn(flowIn_, sam, trX, trY);
  const trFullX = Math.fround(trSample[0]);
  const trFullY = Math.fround(trSample[1]);
  // %48/%49 bl rgba ; %50 = bl.xy
  const blSample = sampleFlowIn(flowIn_, sam, blX, blY);
  const blXX = Math.fround(blSample[0]);
  const blYY = Math.fround(blSample[1]);
  // %51/%52 br rgba (full <4>)
  const brSample = sampleFlowIn(flowIn_, sam, brX, brY);
  const brFullX = Math.fround(brSample[0]);
  const brFullY = Math.fround(brSample[1]);

  // %53 = broadcast(fracX) 2 lanes
  //
  // %54 = fsub <4> tr - tl  (full 4-lane sub, but only .xy is used)
  // %55 = (tr - tl).xy
  const dxTop_x = Math.fround(trFullX - tlX);
  const dxTop_y = Math.fround(trFullY - tlY);
  // %56 = fmuladd(fracX, (tr-tl).xy, tl.xy) -> top-row lerp .xy
  const topX = fmuladd_f32(fracX, dxTop_x, tlX);
  const topY = fmuladd_f32(fracX, dxTop_y, tlY);
  // %57 = fsub <4> br - bl ; %58 = (br - bl).xy
  const dxBot_x = Math.fround(brFullX - blXX);
  const dxBot_y = Math.fround(brFullY - blYY);
  // %59 = fmuladd(fracX, (br-bl).xy, bl.xy) -> bottom-row lerp .xy
  const botX = fmuladd_f32(fracX, dxBot_x, blXX);
  const botY = fmuladd_f32(fracX, dxBot_y, blYY);
  // %60 = broadcast(fracY) 2 lanes
  // %61 = fsub bot - top .xy
  const dyMid_x = Math.fround(botX - topX);
  const dyMid_y = Math.fround(botY - topY);
  // %62 = fmuladd(fracY, bot - top, top) -> bilinear .xy = flowInterp
  const flowInterpX = fmuladd_f32(fracY, dyMid_x, topX);
  const flowInterpY = fmuladd_f32(fracY, dyMid_y, topY);
  // %63 = %62 / %33 (scale)                          — flow rescaled to current-level pixel units
  const flowScaledX = Math.fround(flowInterpX / scaleX);
  const flowScaledY = Math.fround(flowInterpY / scaleY);
  // %64/%65 shuffle to (flowScaledX, flowScaledY, 0, 0) then write
  writeFlowOut(flowOut_, gx, gy, [flowScaledX, flowScaledY, 0, 0]);

  // ---- I1 warp (%66 .. %101) ----

  // %67 = load params.m_dt (field 0)
  const dt = Math.fround(params.dt);
  // %68/%69 = broadcast(dt) ; %70 = fsub -0.0, dt broadcast  -> (-dt, -dt)
  const negDt = Math.fround(-0 - dt);
  // %71 = fmuladd(-dt broadcast, %63 flowScaled, %8 coord)   -> warpedPos
  const warpX = fmuladd_f32(negDt, flowScaledX, coordFx);
  const warpY = fmuladd_f32(negDt, flowScaledY, coordFy);
  // %72 = dim + (-1, -1)
  const dimMaxX = Math.fround(dimXf + Math.fround(-1));
  const dimMaxY = Math.fround(dimYf + Math.fround(-1));
  // %73 = clamp(warpedPos, 0, dim - 1)
  const [wClampX, wClampY] = airClamp2(warpX, warpY, 0, 0, dimMaxX, dimMaxY);
  // %74 = floor(%73) ; %75 = %73 - %74 = fract
  const [wFloorX, wFloorY] = airFloor2(wClampX, wClampY);
  const wFracX = Math.fround(wClampX - Math.fround(wFloorX));
  const wFracY = Math.fround(wClampY - Math.fround(wFloorY));
  // %76 = floor + (0.5, 0.5) ; %77 = +(1,0) ; %78 = +(0,1) ; %79 = +(1,1)
  const wBaseX = Math.fround(Math.fround(wFloorX) + Math.fround(0.5));
  const wBaseY = Math.fround(Math.fround(wFloorY) + Math.fround(0.5));
  const wTrX = Math.fround(wBaseX + Math.fround(1));
  const wTrY = wBaseY;
  const wBlX = wBaseX;
  const wBlY = Math.fround(wBaseY + Math.fround(1));
  const wBrX = Math.fround(wBaseX + Math.fround(1));
  const wBrY = Math.fround(wBaseY + Math.fround(1));

  // Sample I1 at each corner; extract .xy for TL/BL, keep full <4> for TR/BR.
  // %80/%81 tl rgba ; %82 = tl.xy
  const wTl = sampleI1(I1_, sam, wBaseX, wBaseY);
  const wTlX = Math.fround(wTl[0]);
  const wTlY = Math.fround(wTl[1]);
  // %83/%84 tr rgba (full <4>)
  const wTr = sampleI1(I1_, sam, wTrX, wTrY);
  const wTrFullX = Math.fround(wTr[0]);
  const wTrFullY = Math.fround(wTr[1]);
  // %85/%86 bl rgba ; %87 = bl.xy
  const wBl = sampleI1(I1_, sam, wBlX, wBlY);
  const wBlXX = Math.fround(wBl[0]);
  const wBlYY = Math.fround(wBl[1]);
  // %88/%89 br rgba (full <4>)
  const wBr = sampleI1(I1_, sam, wBrX, wBrY);
  const wBrFullX = Math.fround(wBr[0]);
  const wBrFullY = Math.fround(wBr[1]);

  // %90 = broadcast(wFracX) 2 lanes ; %91 = tr - tl full <4> ; %92 = .xy
  const wDxTopX = Math.fround(wTrFullX - wTlX);
  const wDxTopY = Math.fround(wTrFullY - wTlY);
  // %93 = fmuladd(wFracX, tr-tl.xy, tl.xy) -> top lerp .xy
  const wTopX = fmuladd_f32(wFracX, wDxTopX, wTlX);
  const wTopY = fmuladd_f32(wFracX, wDxTopY, wTlY);
  // %94 = br - bl full <4> ; %95 = .xy
  const wDxBotX = Math.fround(wBrFullX - wBlXX);
  const wDxBotY = Math.fround(wBrFullY - wBlYY);
  // %96 = fmuladd(wFracX, br-bl.xy, bl.xy) -> bottom lerp .xy
  const wBotX = fmuladd_f32(wFracX, wDxBotX, wBlXX);
  const wBotY = fmuladd_f32(wFracX, wDxBotY, wBlYY);
  // %97 = broadcast(wFracY) 2 lanes ; %98 = bot - top .xy
  const wDyMidX = Math.fround(wBotX - wTopX);
  const wDyMidY = Math.fround(wBotY - wTopY);
  // %99 = fmuladd(wFracY, bot - top, top) -> bilinear .xy (only .x is used below)
  const wBiX = fmuladd_f32(wFracY, wDyMidX, wTopX);
  // wBiY is computed by the IR but immediately discarded by the %100 shuffle
  // (index <0, undef, undef, undef>). We compute it explicitly so the fp32
  // register pressure sequence matches, but do not read it.
  const wBiY_unused = fmuladd_f32(wFracY, wDyMidY, wTopY);
  void wBiY_unused;

  // %100 = shufflevector <2 x f32> %99, undef, <0, undef, undef, undef>
  //   -> (wBiX, u, u, u)
  // %101 = shufflevector <?,?,?,1.0>, %100, <4, 4, 4, 3>
  //   -> (wBiX, wBiX, wBiX, 1.0)     (see file header — I1 stores luminance
  //                                    in .r, so we broadcast .x to RGB with
  //                                    A = 1)
  writeI1Warp(I1_flowWarped_, gx, gy, [wBiX, wBiX, wBiX, Math.fround(1)]);
  // br label %102 ; ret void
}
