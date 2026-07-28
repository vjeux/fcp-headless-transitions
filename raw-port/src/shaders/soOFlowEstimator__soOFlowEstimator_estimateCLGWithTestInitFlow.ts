// soOFlowEstimator__soOFlowEstimator_estimateCLGWithTestInitFlow.ts —
// direct TS mapping of the Metal compute kernel
// `soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow (HeliumSenso) @0x000000000b38cd
// IR provenance: raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_estimateCLGWithTestInitFlow.ll
// (header: `0x000000000b38cd -- soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow`)
//
// Per-pixel test/init step of a Combined-Local-Global (CLG) optical-flow
// estimator. For each destination pixel (gx, gy):
//   1. Reads image0(uv).r, image1(uv).r → dI = I0 - I1 (temporal derivative).
//   2. Reads grad(uv).xy  (spatial derivative pair — from a prior grad pass).
//   3. Writes to flowOut(gx, gy):
//        flow_xy = m_denom * m_smooth * grad_xy * (-dI)   (a 2-vector)
//        flowOut.rgba = (flow_xy.x, flow_xy.y, flow_xy.x, flow_xy.y)
//         (the shuffle broadcasts the 2-lane result across R,G,B,A)
//   4. If m_writeE != 0, also stores E[m_rowSizeE * gy + gx] = dI * dI
//      (per-pixel energy for the outer solver).
//
// -----------------------------------------------------------------------------
// Signature (%N naming from the .ll):
//   void @soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow(
//     %params*                    %0,   // params buffer
//     <2 x i32>                   %1,   // thread_position_in_grid   (gx, gy)
//     texture2d<float, sample>    %2,   // image0
//     texture2d<float, sample>    %3,   // image1
//     texture2d<float, sample>    %4,   // grad   (uses .xy)
//     texture2d<float, write>     %5,   // flowOut
//     float*                      %6    // E     (energy accumulator buffer)
//   )
//
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// Fast-math is DISABLED — use plain fp32 ops via Math.fround.
//
// -----------------------------------------------------------------------------
// Params struct layout (from !18 in the .ll):
//   f32   m_smooth     @  0    field 0
//   f32   m_dt         @  4    field 1
//   f32   m_denom      @  8    field 2
//   i32   m_dimX       @ 12    field 3  — grid.x upper bound (exclusive)
//   i32   m_dimY       @ 16    field 4  — grid.y upper bound (exclusive)
//   u32   m_writeE     @ 20    field 5  — nonzero enables E[] store
//   i32   m_rowSizeE   @ 24    field 6  — row stride of E[]
//
// Note: `m_dt` (field 1) is loaded as %31 and used to multiply the flow
// result — the IR treats it as the "smooth-vs-dt" scale, not `m_smooth`.
// I match the IR field indices literally (params.dt at field 1, params.smooth
// at field 0). Only params.dt and params.denom actually participate in the
// arithmetic; params.smooth is unused by the body (it's the smoothing
// weight for other CLG passes, still declared in the shared params struct).
//
// Sampler state (@__air_sampler_state, !25): 0x8080000000000089 (signed
// i64 = -9188470239253725111 — three bits different from most other kernels'
// sampler; still nearest-neighbour + clamp-to-edge in pixel-space per the
// pixel-centre UV `coord + 0.5`). JS `sampleFloat` models that.
//
// -----------------------------------------------------------------------------
// Line-by-line body (%7 entry .. %56 ret):
//   %8  = extractelement <2 x i32> %1, 0                 -> gx
//   %9  = gep params field 3 (m_dimX)
//   %10 = load                                            -> dimX
//   %11 = icmp slt gx, dimX
//   br  %11, %12, %56                                     ; else ret
//   %13 = extractelement <2 x i32> %1, 1                 -> gy
//   %14 = gep params field 4 (m_dimY)
//   %15 = load                                            -> dimY
//   %16 = icmp slt gy, dimY
//   br  %16, %17, %56                                     ; else ret
//   %18 = air.convert.f.v2f32.s.v2i32(coord)              -> (float(gx), float(gy))
//   %19 = fadd  %18, <0.5, 0.5>                           -> uv pixel-centre
//   %20 = sample image0 (uv)  -> {rgba, resid}
//   %21 = extractvalue %20, 0                             -> image0 rgba
//   %22 = extractelement %21, 0                           -> I0 = image0.r
//   %23 = sample image1 (uv)
//   %24 = extractvalue %23, 0
//   %25 = extractelement %24, 0                           -> I1 = image1.r
//   %26 = fsub I0, I1                                     -> dI  (temporal derivative)
//   %27 = sample grad   (uv)
//   %28 = extractvalue %27, 0                             -> grad rgba
//   %29 = shufflevector %28, undef, <0, 1>                -> grad.xy   (2 lanes)
//   %30 = gep params field 1 (m_dt)
//   %31 = load                                             -> dt
//   %32 = insertelement <2 x f32> undef, dt, 0
//   %33 = shufflevector %32, undef, <0, 0>                 -> broadcast(dt)  (2 lanes)
//   %34 = fsub float -0.0, %26                            -> -dI
//   %35 = insertelement <2 x f32> undef, -dI, 0
//   %36 = shufflevector %35, undef, <0, 0>                 -> broadcast(-dI) (2 lanes)
//   %37 = fmul <2 x f32> %29 (grad_xy), %36 (broadcast -dI)
//   %38 = fmul <2 x f32> %33 (broadcast dt), %37
//   %39 = gep params field 2 (m_denom)
//   %40 = load                                             -> denom
//   %41 = insertelement <2 x f32> undef, denom, 0
//   %42 = shufflevector %41, undef, <0, 0>                 -> broadcast(denom)
//   %43 = fmul <2 x f32> %42 (broadcast denom), %38        -> flow_xy (2-vec)
//   %44 = shufflevector %43, undef, <0, 1, 0, 1>           -> (fx, fy, fx, fy)
//   air.write_texture_2d.v4f32(flowOut, coord, %44, mip=0, mask=2)
//   %45 = gep params field 5 (m_writeE)
//   %46 = load                                             -> writeE
//   %47 = icmp eq writeE, 0
//   br  %47, %56, %48                                     ; else write E
//   %49 = fmul %26, %26                                    -> dI * dI
//   %50 = gep params field 6 (m_rowSizeE)
//   %51 = load                                             -> rowSizeE
//   %52 = mul rowSizeE, gy
//   %53 = add %52, gx
//   %54 = sext to i64
//   %55 = gep E[]  at %54
//   store %49, %55
//   br  %56                                                ; ret

/**
 * Uniform buffer matching `%struct.soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow_params`
 * (!18): 7 fields in declared order.
 */
export interface SoOFlowEstimatorCLGWithTestInitFlowParams {
  /** field 0 — f32 `m_smooth`     (unused by this body — see file header). */
  readonly smooth: number;
  /** field 1 — f32 `m_dt`         (multiplier applied to the flow update). */
  readonly dt: number;
  /** field 2 — f32 `m_denom`      (final scale of the flow update). */
  readonly denom: number;
  /** field 3 — i32 `m_dimX`       (grid.x upper bound, exclusive). */
  readonly dimX: number;
  /** field 4 — i32 `m_dimY`       (grid.y upper bound, exclusive). */
  readonly dimY: number;
  /** field 5 — u32 `m_writeE`     (nonzero enables E[] store). */
  readonly writeE: number;
  /** field 6 — i32 `m_rowSizeE`   (row stride of E[]). */
  readonly rowSizeE: number;
}

/**
 * AIR `air.sample_texture_2d.v4f32` callback — nearest-neighbour +
 * clamp-to-edge in pixel-space per the module sampler @__air_sampler_state.
 */
export type SampleFloatFn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * AIR `air.write_texture_2d.v4f32` callback — stores a float4 value at
 * integer pixel (x, y) of the destination texture at mip level 0.
 */
export type WriteFloat4Fn<T> = (texture: T, x: number, y: number, rgba: readonly [number, number, number, number]) => void;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_estimateCLGWithTestInitFlow`.
 */
export function soOFlowEstimator__soOFlowEstimator_estimateCLGWithTestInitFlow<TImg0, TImg1, TGrad, TFlow>(
  params: SoOFlowEstimatorCLGWithTestInitFlowParams,   // %0
  gridPos: readonly [number, number],                   // %1
  image0: TImg0,                                        // %2
  image1: TImg1,                                        // %3
  grad: TGrad,                                          // %4
  flowOut: TFlow,                                       // %5
  E: number[],                                          // %6  (dense float buffer)
  sampleImage0: SampleFloatFn<TImg0>,
  sampleImage1: SampleFloatFn<TImg1>,
  sampleGrad: SampleFloatFn<TGrad>,
  writeFlow: WriteFloat4Fn<TFlow>,
): void {
  const gx = gridPos[0] | 0;              // %8
  // %11 = icmp slt gx, dimX
  if (!(gx < (params.dimX | 0))) return;

  const gy = gridPos[1] | 0;              // %13
  // %16 = icmp slt gy, dimY
  if (!(gy < (params.dimY | 0))) return;

  // %18 = convert.f.v2f32.s.v2i32(coord)  ; %19 = %18 + <0.5, 0.5>
  //   uv = (float(gx) + 0.5, float(gy) + 0.5)
  const u = Math.fround(Math.fround(gx) + Math.fround(0.5));
  const v = Math.fround(Math.fround(gy) + Math.fround(0.5));

  // %20/%21/%22 = sample image0 at uv, take lane 0        -> I0
  const I0 = Math.fround(sampleImage0(image0, u, v)[0]);
  // %23/%24/%25 = sample image1 at uv, take lane 0        -> I1
  const I1 = Math.fround(sampleImage1(image1, u, v)[0]);
  // %26 = fsub I0, I1                                     -> dI
  const dI = Math.fround(I0 - I1);

  // %27/%28 = sample grad at uv ; %29 = shuffle .xy       -> gradX, gradY
  const gradSample = sampleGrad(grad, u, v);
  const gradX = Math.fround(gradSample[0]);
  const gradY = Math.fround(gradSample[1]);

  // %31 = load params.dt (field 1) ; %33 = broadcast(dt) 2 lanes
  const dt = Math.fround(params.dt);

  // %34 = fsub -0.0, dI                                   -> -dI
  // %35/%36 = broadcast(-dI) 2 lanes
  const negDI = Math.fround(-0 - dI);

  // %37 = fmul gradXY, broadcast(-dI)                     (2-lane)
  const p1x = Math.fround(gradX * negDI);
  const p1y = Math.fround(gradY * negDI);
  // %38 = fmul broadcast(dt), %37
  const p2x = Math.fround(dt * p1x);
  const p2y = Math.fround(dt * p1y);

  // %40 = load params.denom (field 2) ; %42 = broadcast(denom) 2 lanes
  const denom = Math.fround(params.denom);
  // %43 = fmul broadcast(denom), %38                      -> flowXY  (2-vec)
  const flowX = Math.fround(denom * p2x);
  const flowY = Math.fround(denom * p2y);

  // %44 = shufflevector <2 x f32> flowXY, undef, <0, 1, 0, 1>
  //   -> (flowX, flowY, flowX, flowY)
  writeFlow(flowOut, gx, gy, [flowX, flowY, flowX, flowY]);

  // %46 = load params.writeE (field 5) ; %47 = icmp eq writeE, 0
  if ((params.writeE | 0) === 0) return;  // br %47 -> %56 ret

  // ---- %48: energy store ----
  // %49 = fmul dI, dI
  const energy = Math.fround(dI * dI);
  // %51 = load params.rowSizeE (field 6)
  // %52 = mul rowSizeE, gy ; %53 = %52 + gx ; %55 = &E[%53]
  const idx = (Math.imul(params.rowSizeE | 0, gy) + gx) | 0;
  E[idx] = energy;
  // br label %56 ; ret void
}
