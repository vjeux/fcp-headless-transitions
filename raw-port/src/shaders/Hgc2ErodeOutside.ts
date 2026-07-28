// Faithful transcription @0x00000000002930 — @shader Hgc2ErodeOutside (ProAppsFxSupport)
//
// Metallib offset from raw-port/re/shaders/Hgc2ErodeOutside.ll header line
//   `0x00000000002930 -- Hgc2ErodeOutside:` — the shader's entry offset in
//   ProAppsFxSupport.framework/Versions/A/Resources/ProAppsFxSupportHgcMetalShaders_derived.metallib.
//
// Provenance: LLVM AIR IR in raw-port/re/shaders/Hgc2ErodeOutside.ll,
// extracted via raw-port/tools/shader_disasm.sh.
// Compile options in the .ll: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`, `air.compile.framebuffer_fetch_enable`;
// function attribute set #0 also carries `unsafe-fp-math=true`,
// `no-infs/nans/signed-zeros-fp-math=true`, `approx-func-fp-math=true`.
//
// Fragment metadata (from !air.fragment, !15..!26 in the .ll):
//   arg %0 = "position"  (air.position, no_perspective) — UNUSED (air.arg_unused).
//   arg %1 = "texcoord0" (float4, perspective)          — UNUSED (air.arg_unused).
//   arg %2 = "texcoord1" (float4, perspective)          — .xy used as texture1 UV.
//   arg %3 = "texture0"  (texture2d<float, sample>, index 0) — UNUSED (air.arg_unused).
//   arg %4 = "texture1"  (texture2d<float, sample>, index 1) — sampled.
//   arg %5 = "sampler0"  (index 0)                      — UNUSED (air.arg_unused).
//   arg %6 = "sampler1"  (index 1)                      — sampled with texture1.
//   arg %7 = "parameters" (constant float4 buffer @ index 0, addrspace 2).
//   return = air.render_target 0/0, float4.
//
// Line-by-line map from the .ll body:
//   %9  = load <4 x float>, addrspace(2)* %7                   -> params = parameters[0]
//   %10 = shufflevector <4 x float> %2, poison, <2 x i32> <0,1>-> uv1 = texcoord1.xy
//   %11 = air.sample_texture_2d.v4f32(%4 texture1, %6 sampler1,
//                                     %10 uv1, i1 true, <0,0>,
//                                     i1 false, 0.0, 0.0, i32 0) -> { rgba1, residency }
//   %12 = extractvalue %11, 0                                   -> tex = rgba1
//   %13 = extractelement <4 x float> %9, i64 3                  -> p = params.w  (i.e. parameters[3])
//   %14 = fmul fast float %13, 0x3F947AE140000000               -> a = p * 0x3F947AE140000000
//   %15 = fadd fast float %14, 0x3FEE666660000000               -> b = a + 0x3FEE666660000000
//   %16 = air.fast_fmax.f32(%15, 1.000000e+00)                  -> c = max(b, 1.0)
//   %17 = air.fast_fmin.f32(%16, 2.000000e+00)                  -> s = min(c, 2.0)  (i.e. clamp(b, 1.0, 2.0))
//   %18 = insertelement <4 x float> poison, float %17, i64 0    -> splat0.x = s
//   %19 = shufflevector %18, poison, <4 x i32> zeroinitializer  -> splat = <s,s,s,s>
//   %20 = fmul fast <4 x float> %19, %12                        -> scaled = splat * tex
//   %21 = air.fast_fmin.v4f32(%20, <1.0, 1.0, 1.0, 1.0>)        -> min(scaled, 1.0) per-lane
//   ret %21
//
// The two double-precision hex constants in the .ll are the fp64 encodings
// of what will be truncated to fp32 constants (Metal is 32-bit; the fp64
// form is just how LLVM printed the literal):
//   0x3F947AE140000000  = 0.01999999955... (i.e. fp32-nearest to 0.02)
//   0x3FEE666660000000  = 0.94999998807... (i.e. fp32-nearest to 0.95)
// So the closed-form of the shader is:
//   uv    = texcoord1.xy
//   tex   = texture1.sample(sampler1, uv)          (fp32 float4)
//   p     = parameters.w                            (fp32 scalar)
//   scale = clamp(p * 0.02f + 0.95f, 1.0f, 2.0f)   (fp32 scalar in [1, 2])
//   out   = min(scale * tex, 1.0f) per-lane        (fp32 float4)
//
// The `air.fast_fmax`/`air.fast_fmin` intrinsics under `fast_math_enable`
// behave as IEEE fmax/fmin ignoring NaN handling — for the finite inputs
// this shader sees, they reduce to `Math.max`/`Math.min`.
//
// The shader appears to be the "outer" leg of an erosion pass: it takes
// a probe/mask sampled from texture1 and lifts it by a small parameter-
// driven gain (0.02·p) on top of a fixed 0.95 pedestal, clamped so the
// gain multiplier stays in [1, 2], then saturates to [0, 1]. Name +
// caller-provided `parameters` reflect a `parameters.w`-only uniform.

/**
 * Callback signature for AIR `air.sample_texture_2d.v4f32` — the caller
 * supplies a function that, given the opaque texture handle plus a 2D UV,
 * returns the sampled RGBA as four f32-valued numbers. The trailing
 * offset/bias/min_lod parameters in the intrinsic are inert at the one
 * call site (offset=<0,0>, bias flag disabled, bias=0.0, min_lod=0.0,
 * sampler_bias=0) and are not modeled.
 */
export type Sample2DFn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Fragment shader `Hgc2ErodeOutside` — samples texture1 at texcoord1.xy,
 * then multiplies each RGBA lane by a scalar `scale` computed from
 * `parameters.w` and saturates the result to [0, 1].
 *
 *   scale = clamp(parameters.w * 0.02f + 0.95f, 1.0f, 2.0f)
 *   out   = min(scale * texture1.sample(sampler1, texcoord1.xy), 1.0f)
 *
 * @shader Hgc2ErodeOutside (ProAppsFxSupport)
 * @param texcoord1  The .xy is the sample UV for texture1 (only .xy read).
 * @param texture1   Opaque texture handle for texture1.
 * @param parameters The single constant float4 uniform bound at index 0;
 *                   only lane 3 (`.w`) is read (matches
 *                   `extractelement %9, i64 3` in the .ll).
 * @param sample     Bound `air.sample_texture_2d.v4f32`; the shader
 *                   invokes it once, on `texture1`/`sampler1`.
 * @returns          Saturated float4 RGBA as fp32 numbers.
 */
export function Hgc2ErodeOutside<T>(
  texcoord1: [number, number, number, number],
  texture1: T,
  parameters: [number, number, number, number],
  sample: Sample2DFn<T>,
): [number, number, number, number] {
  // %10 = shufflevector %2, poison, <0,1> — texcoord1.xy.
  const u = texcoord1[0];
  const v = texcoord1[1];

  // %11/%12 = air.sample_texture_2d.v4f32(texture1, sampler1, [u,v], ...).
  const tex = sample(texture1, u, v);

  // %13 = extractelement %9, i64 3 — parameters.w. Metal loads a float4 as
  // fp32; Math.fround forces JS number->fp32 round-trip.
  const p = Math.fround(parameters[3]);

  // %14 = fmul fast %13, 0x3F947AE140000000 (fp32-nearest 0.02).
  const a = Math.fround(p * Math.fround(0.02));

  // %15 = fadd fast %14, 0x3FEE666660000000 (fp32-nearest 0.95).
  const b = Math.fround(a + Math.fround(0.95));

  // %16 = air.fast_fmax.f32(%15, 1.0);  %17 = air.fast_fmin.f32(%16, 2.0).
  // Combined effect is clamp(b, 1.0, 2.0) — encoded as max-then-min so
  // the result lies in [1.0, 2.0] regardless of `b`.
  const c = Math.max(b, Math.fround(1.0));
  const s = Math.fround(Math.min(c, Math.fround(2.0)));

  // %18/%19 = splat `s` to <s,s,s,s>.
  // %20 = fmul fast <4 x float> %19, %12 — lane-wise s * tex.
  // %21 = air.fast_fmin.v4f32(%20, <1,1,1,1>) — lane-wise saturate to 1.0.
  const r = Math.fround(Math.min(Math.fround(s * Math.fround(tex[0])), Math.fround(1.0)));
  const g = Math.fround(Math.min(Math.fround(s * Math.fround(tex[1])), Math.fround(1.0)));
  const bl = Math.fround(Math.min(Math.fround(s * Math.fround(tex[2])), Math.fround(1.0)));
  const al = Math.fround(Math.min(Math.fround(s * Math.fround(tex[3])), Math.fround(1.0)));

  return [r, g, bl, al];
}
