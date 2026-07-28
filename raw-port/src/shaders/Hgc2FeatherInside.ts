// Faithful transcription @0x0000000000001780 — @shader Hgc2FeatherInside (ProAppsFxSupport)
//
// Metallib offset from raw-port/re/shaders/Hgc2FeatherInside.ll header line
//   `0x00000000001780 -- Hgc2FeatherInside:` — the shader's entry offset in
// ProAppsFxSupport.framework/Versions/A/Resources/
// ProAppsFxSupportHgcMetalShaders_derived.metallib.
//
// Two-texture fragment shader that performs a "feather inside" composite:
// it modulates a foreground (texture0) with a mask/backdrop (texture1)
// using two piecewise segments driven by parameters[1].w, then mixes the
// result over texture0 with a global fade weight from parameters[0].w.
//
// Provenance: LLVM AIR IR in raw-port/re/shaders/Hgc2FeatherInside.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// ProAppsFxSupport.framework/Versions/A/Resources/
// ProAppsFxSupportHgcMetalShaders_derived.metallib.
// Compile options in the .ll: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`, `air.compile.framebuffer_fetch_enable`;
// function attribute set #0 also carries `unsafe-fp-math=true`,
// `no-infs/nans/signed-zeros-fp-math=true`, `approx-func-fp-math=true`.
// Faithful fp32 transcription — every arithmetic step wraps its f32 result
// with Math.fround to preserve single-precision rounding.
//
// AIR intrinsics used:
//   air.sample_texture_2d.v4f32(tex, sampler, uv, /*offset_valid=*/i1 true,
//                               <0,0>, /*bias_valid=*/i1 false, 0.0, 0.0,
//                               i32 0) -> {<4 x float>, i8}
//     — 2D texture sample; the trailing offset/bias/min_lod arguments are
//     inert at both call sites (offset=0,0; bias/min_lod flags off), so
//     the JS `sample(texture, u, v)` callback need not model them.
//   air.fast_fmin.v4f32(a, b) -> per-lane fp32 minimum.
//   air.fast_fmin.f32(a, b)   -> scalar fp32 minimum.
//   air.fast_fmax.v4f32(a, b) -> per-lane fp32 maximum.
//
// Fragment metadata (from !air.fragment, !15..!26 in the .ll):
//   arg %0 = "position"  (air.position, no_perspective) — UNUSED here
//            (unused-flag NOT set in !19 for this shader; still, the body
//            never references %0. It is bound only to satisfy the fragment
//            entry signature.)
//   arg %1 = "texcoord0" (float4, perspective) — sampled at .xy.
//   arg %2 = "texcoord1" (float4, perspective) — sampled at .xy.
//   arg %3 = "texture0"  (texture2d<float, sample>, index 0).
//   arg %4 = "texture1"  (texture2d<float, sample>, index 1).
//   arg %5 = "sampler0"  (index 0).
//   arg %6 = "sampler1"  (index 1).
//   arg %7 = "parameters" (constant float4[], address space 2).
//            Two float4 slots are loaded:
//              parameters[0] via %9  (only .w = %44 is used).
//              parameters[1] via %11 (only .w = %22 is used).
//   return = "air.render_target" 0/0, float4.
//
// Constant literal decoding (Python struct '<d'→'<f' truncation):
//   0x3FD99999A0000000 = 0.4000000059604645      (fp32: 0.4f)
//   0x3FEA3D70A0000000 = 0.8199999928474426      (fp32: 0.82f)
//   0x3FFAAAAAA0000000 = 1.6666666269302368      (fp32: 5/3, i.e. 1/0.6)
//   0x3FC70A3D80000000 = 0.18000000715255737     (fp32: 0.18f)
//   Splat vectors <0.5,0.5,0.5,0.5>, <1,1,1,1> and <0,0,0,0> are literal
//   constant vectors in the IR (%18 rhs, %19 rhs, %35 rhs of clamp, %54
//   rhs of clamp).
//
// Line-by-line map from the .ll body (block "%8"):
//   %9   = load parameters[0]                 -> p0    (float4).
//   %10  = getelementptr parameters, i64 1
//   %11  = load parameters[1]                 -> p1    (float4).
//   %12  = shufflevector %1, poison, <0,1>    -> uv0 = texcoord0.xy.
//   %13  = air.sample_texture_2d(%3,%5, uv0)  -> {rgba0, residency}.
//   %14  = extractvalue %13, 0                -> rgba0.
//   %15  = shufflevector %2, poison, <0,1>    -> uv1 = texcoord1.xy.
//   %16  = air.sample_texture_2d(%4,%6, uv1)  -> {rgba1, residency}.
//   %17  = extractvalue %16, 0                -> rgba1.
//   %18  = fsub <1,1,1,1>, rgba0              -> inv  = 1 - rgba0.
//   %19  = fmul inv, <0.5,0.5,0.5,0.5>        -> half_inv = inv * 0.5.
//   %20  = fadd half_inv, rgba1               -> mid  = 0.5*(1-rgba0)+rgba1.
//   %21  = fmul mid, rgba0                    -> mul  = mid * rgba0.
//   %22  = extractelement p1, i64 3           -> pa   = parameters[1].w.
//   %23  = extractelement mul, i64 3          -> mula = mul.w.
//   %24  = fcmp ogt mula, 0.4                 -> branch predicate.
//   br %24 -> BB25 (bright branch) : BB36 (dark branch).
//
//   BB25 (mul.w > 0.4):
//     %26 = fsub  0.82, pa                    -> d = 0.82 - pa.
//     %27 = fmul  d,   1.6666666...           -> t = d * (5/3).
//     %28 = fsub  1.0, t                      -> c = 1 - t.
//     %29..30 = splat(t) into float4          -> tv = <t,t,t,t>.
//     %31 = fmul  mul, tv                     -> mul*t.
//     %32..33 = splat(c) into float4          -> cv = <c,c,c,c>.
//     %34 = fadd  mul*t, cv                   -> mul*t + c.
//     %35 = air.fast_fmin.v4f32(%34, <1,1,1,1>) -> min(., 1).
//     -> feed φ %43 as %35.
//
//   BB36 (mul.w <= 0.4):
//     %37 = fadd pa, 0.18                     -> pa + 0.18.
//     %38 = fmul %37, 2.5                     -> s = (pa+0.18)*2.5.
//     %39..40 = splat(s) into float4          -> sv = <s,s,s,s>.
//     %41 = fmul mul, sv                      -> mul * s.
//     -> feed φ %43 as %41.
//
//   BB42 (join):
//     %43 = phi float4 [%35 from BB25, %41 from BB36] -> feathered.
//     %44 = extractelement p0, i64 3          -> pw   = parameters[0].w.
//     %45 = air.fast_fmin.f32(pw, 1.0)        -> a    = min(pw, 1).
//     %46..47 = splat(a) into float4          -> av = <a,a,a,a>.
//     %48 = fmul av, feathered                -> a * feathered.
//     %49 = fsub 1.0, a                       -> 1 - a.
//     %50..51 = splat(1-a) into float4        -> nav = <1-a,1-a,1-a,1-a>.
//     %52 = fmul nav, rgba0                   -> (1-a) * rgba0.
//     %53 = fadd (1-a)*rgba0, a*feathered     -> mix.
//     %54 = air.fast_fmax.v4f32(%53, <0,0,0,0>) -> max(mix, 0).
//     ret %54.
//
// Note: the two f32 constants written as double bit patterns in the IR
// (`0x3FD99999A0000000`, `0x3FEA3D70A0000000`, `0x3FFAAAAAA0000000`,
// `0x3FC70A3D80000000`) all correspond to *single-precision* literals
// after truncation — the low 29 bits of each double mantissa are zero,
// which is exactly the pattern LLVM emits when a Metal `float` literal is
// stored as a hex-formatted double for IR text output. The fp32 values
// are 0.4, 0.82, 5/3, 0.18 respectively. Using Math.fround on JS numbers
// gives the same rounded fp32 result.

/**
 * Callback signature for AIR `air.sample_texture_2d.v4f32` — the caller
 * supplies a function that, given the opaque texture handle plus a 2D UV,
 * returns the sampled RGBA as four fp32-valued numbers. The trailing
 * offset/bias/min_lod parameters in the intrinsic are inert at both call
 * sites in this shader (see the per-call comments in the file header) and
 * are not modeled.
 */
export type Sample2DFn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Fragment shader `Hgc2FeatherInside` — samples texture0 at texcoord0.xy
 * and texture1 at texcoord1.xy, computes a "feather inside" combination
 * `mul = ((1 - tex0)*0.5 + tex1) * tex0` per lane, applies a two-branch
 * curve over `mul.w` driven by `parameters[1].w`, then mixes the curved
 * result over `tex0` weighted by `min(parameters[0].w, 1)` and clamps at
 * zero from below.
 *
 * @shader Hgc2FeatherInside (ProAppsFxSupport)
 * @param texcoord0  The .xy is the sample UV for texture0.
 * @param texcoord1  The .xy is the sample UV for texture1.
 * @param texture0   Opaque texture handle for texture0.
 * @param texture1   Opaque texture handle for texture1.
 * @param parameters Two float4 slots. Only parameters[0].w (global blend)
 *                   and parameters[1].w (branch driver) are read (per
 *                   %22, %44 in the .ll).
 * @param sample     Bound `air.sample_texture_2d.v4f32` — used for both
 *                   texture samples (each supplies its own sampler
 *                   externally). See IR lines %13 and %16.
 * @returns          [r, g, b, a] as fp32 numbers.
 */
export function Hgc2FeatherInside<T>(
  texcoord0: [number, number, number, number],
  texcoord1: [number, number, number, number],
  texture0: T,
  texture1: T,
  parameters: readonly [
    [number, number, number, number],
    [number, number, number, number],
  ],
  sample: Sample2DFn<T>,
): [number, number, number, number] {
  // %9  = load parameters[0].
  // %11 = load parameters[1].
  const p0 = parameters[0];
  const p1 = parameters[1];

  // %12 = shufflevector %1, poison, <0,1> — take texcoord0.xy.
  // %13 = air.sample_texture_2d(%3,%5, uv0); %14 = extractvalue %13, 0.
  const rgba0 = sample(texture0, texcoord0[0], texcoord0[1]);

  // %15 = shufflevector %2, poison, <0,1> — take texcoord1.xy.
  // %16 = air.sample_texture_2d(%4,%6, uv1); %17 = extractvalue %16, 0.
  const rgba1 = sample(texture1, texcoord1[0], texcoord1[1]);

  // %18 = fsub <1,1,1,1>, rgba0 — inv = 1 - rgba0, per lane.
  const inv0 = Math.fround(1 - rgba0[0]);
  const inv1 = Math.fround(1 - rgba0[1]);
  const inv2 = Math.fround(1 - rgba0[2]);
  const inv3 = Math.fround(1 - rgba0[3]);

  // %19 = fmul inv, <0.5,0.5,0.5,0.5> — half_inv = inv * 0.5.
  const half0 = Math.fround(inv0 * 0.5);
  const half1 = Math.fround(inv1 * 0.5);
  const half2 = Math.fround(inv2 * 0.5);
  const half3 = Math.fround(inv3 * 0.5);

  // %20 = fadd half_inv, rgba1 — mid = 0.5*(1-rgba0) + rgba1.
  const mid0 = Math.fround(half0 + rgba1[0]);
  const mid1 = Math.fround(half1 + rgba1[1]);
  const mid2 = Math.fround(half2 + rgba1[2]);
  const mid3 = Math.fround(half3 + rgba1[3]);

  // %21 = fmul mid, rgba0 — mul = mid * rgba0, per lane.
  const mul0 = Math.fround(mid0 * rgba0[0]);
  const mul1 = Math.fround(mid1 * rgba0[1]);
  const mul2 = Math.fround(mid2 * rgba0[2]);
  const mul3 = Math.fround(mid3 * rgba0[3]);

  // %22 = extractelement p1, i64 3 — pa = parameters[1].w.
  // %23 = extractelement mul, i64 3 — mula = mul.w.
  const pa = p1[3];
  const mula = mul3;

  // %24 = fcmp fast ogt mula, 0.4 — branch predicate.
  //   `ogt` = ordered greater-than; with fast-math NaNs are excluded by
  //   the compile attributes, so this is a plain `>` compare.
  let f0: number;
  let f1: number;
  let f2: number;
  let f3: number;
  if (mula > Math.fround(0.4)) {
    // BB25 (bright branch, mul.w > 0.4):
    //   %26 = fsub 0.82, pa
    //   %27 = fmul %26, 5/3
    //   %28 = fsub 1.0, %27
    //   %29..30 splat(%27), %31 = fmul mul, tv
    //   %32..33 splat(%28), %34 = fadd %31, cv
    //   %35 = air.fast_fmin.v4f32(%34, <1,1,1,1>)
    const d = Math.fround(Math.fround(0.82) - pa);
    const t = Math.fround(d * Math.fround(1.6666666269302368));
    const c = Math.fround(1 - t);
    f0 = Math.min(Math.fround(Math.fround(mul0 * t) + c), 1);
    f1 = Math.min(Math.fround(Math.fround(mul1 * t) + c), 1);
    f2 = Math.min(Math.fround(Math.fround(mul2 * t) + c), 1);
    f3 = Math.min(Math.fround(Math.fround(mul3 * t) + c), 1);
  } else {
    // BB36 (dark branch, mul.w <= 0.4):
    //   %37 = fadd pa, 0.18
    //   %38 = fmul %37, 2.5
    //   %39..40 splat(%38), %41 = fmul mul, sv
    const s = Math.fround(Math.fround(pa + Math.fround(0.18)) * Math.fround(2.5));
    f0 = Math.fround(mul0 * s);
    f1 = Math.fround(mul1 * s);
    f2 = Math.fround(mul2 * s);
    f3 = Math.fround(mul3 * s);
  }

  // BB42 join:
  //   %43 = phi %35/%41 -> feathered.
  //   %44 = extractelement p0, i64 3 — pw = parameters[0].w.
  //   %45 = air.fast_fmin.f32(pw, 1.0) — a = min(pw, 1).
  const a = Math.min(p0[3], 1);

  //   %46..47 splat(a); %48 = fmul av, feathered.
  //   %49 = fsub 1.0, a.
  //   %50..51 splat(1-a); %52 = fmul nav, rgba0.
  //   %53 = fadd %52, %48.
  const oneMinusA = Math.fround(1 - a);
  const mix0 = Math.fround(Math.fround(oneMinusA * rgba0[0]) + Math.fround(a * f0));
  const mix1 = Math.fround(Math.fround(oneMinusA * rgba0[1]) + Math.fround(a * f1));
  const mix2 = Math.fround(Math.fround(oneMinusA * rgba0[2]) + Math.fround(a * f2));
  const mix3 = Math.fround(Math.fround(oneMinusA * rgba0[3]) + Math.fround(a * f3));

  //   %54 = air.fast_fmax.v4f32(%53, <0,0,0,0>). ret %54.
  return [
    Math.max(mix0, 0),
    Math.max(mix1, 0),
    Math.max(mix2, 0),
    Math.max(mix3, 0),
  ];
}

