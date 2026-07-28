// Faithful transcription @0x0000000000005146 — no shortcut language of any kind.
// @shader MDP3DLineFragmentFunc (MDPKit) @0x0000000000005146
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/MDP3DLineFragmentFunc.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// MDPKit.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x00000000005146 -- MDP3DLineFragmentFunc:` —
// that is the shader's entry offset in the metallib. Debug info in
// the .ll cites source at MDPKit/Shaders/MDP3DLine.metal:66 (function
// scope) with inlined helpers `unpremultiply` (line 32) and
// `premultiply` (line 26). Compile options:
// `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_enable` marks
// every fadd/fmul/fdiv as `fast` and the two `air.fast_pow.f32` /
// `air.fast_fmax.f32` intrinsics are Apple's fast approximations —
// per raw-port/army/SHADERS.md, `air.fast_pow` is transcribed as
// `Math.fround(Math.pow(...))` and `air.fast_fmax` as
// `Math.fround(Math.max(...))`. fp32-narrowed via Math.fround on
// every op.
//
// This is a FRAGMENT FUNCTION (!air.fragment/!29). Fragment inputs
// (!30..!35):
//   position       : float4 (air.position, air.center, air.no_perspective,
//                    unused per air.arg_unused at !33).
//   color          : float4 (air.fragment_input, perspective-interp),
//                    the vertex-stage passthrough.
//   brushTexCoord  : float2 (air.fragment_input, perspective-interp).
//   uniforms       : MDP3DLineUniforms* (constant AS, buffer 0,
//                    size 144, align 16). Field layout from !37:
//                      offset   0 : float2 gamma
//                      offset  16 : float4x4 modelViewMatrix
//                      offset  80 : float4x4 projectionMatrix
//                    Only `gamma.y` (the second lane at offset 4 within
//                    the float2 field, i.e. shader-level byte 4) is
//                    read by the fragment stage — the two matrices are
//                    used by the vertex stage only.
//   brush          : texture2d<float, sample> — the brush texture.
//   brushSampler   : sampler.
//
// Render target output (!30/!31):
//   color          : float4 (air.render_target 0/0).
//
// Line-by-line map of the .ll body (variable names as-in-IR):
//
//   entry:
//     %7  = air.sample_texture_2d.v4f32(brush, brushSampler,
//               brushTexCoord uv, offset_valid=true, <0,0>,
//               bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//     %8  = extractvalue %7, 0                       -- brush rgba.
//     %9  = brush * color                            -- fmul fast <4 x float>.
//     %10 = shufflevector %9, poison, <0, 1, 2>      -- (br*co).rgb.
//     %11 = extractelement %9, 3                     -- (br*co).a.
//     %12 = air.fast_fmax.f32(%11, 1e-6)             -- clamp alpha to >= eps.
//     %13/%14 = splat %12 to <3 x float>
//     %15 = %10 / <clampedA, clampedA, clampedA>     -- unpremultiply.
//     %16 = extractelement %15, 0                    -- unpremul .r.
//     %17 = &uniforms.gamma                          -- gep offset 0.
//     %18 = load <2 x float> gamma
//     %19 = extractelement %18, 1                    -- gamma.y.
//     %20 = air.fast_pow.f32(%16, gamma.y)           -- pow r.
//     %21 = insertelement <undef>, %20 at 0
//     %22 = extractelement %15, 1                    -- unpremul .g.
//     %23 = air.fast_pow.f32(%22, gamma.y)           -- pow g.
//     %24 = insertelement %21, %23 at 1
//     %25 = extractelement %15, 2                    -- unpremul .b.
//     %26 = air.fast_pow.f32(%25, gamma.y)           -- pow b.
//     %27 = insertelement %24, %26 at 2
//     %28 = shufflevector %9, poison, <3, 3, 3>      -- splat original
//                                                       premul alpha
//                                                       (=%11, from %9).
//     %29 = %27 * %28                                -- re-premultiply
//                                                       ONLY .rgb with the
//                                                       ORIGINAL (%11)
//                                                       alpha — not the
//                                                       eps-clamped alpha
//                                                       from %12.
//     %30 = shufflevector %29, poison, <0, 1, 2, u>  -- lift to <4 x float>.
//     %31 = shufflevector %30, %9, <0, 1, 2, 7>      -- lanes 0..2 from %29,
//                                                       lane 3 from %9 (= the
//                                                       ORIGINAL brush.a *
//                                                       color.a; not the
//                                                       eps-clamped value).
//     ret { %31 }.

/**
 * Uniforms buffer for `MDP3DLineFragmentFunc` — mirrors the AIR
 * struct at !37 (144-byte record, align 16). Only `gamma` is read
 * in the fragment stage.
 */
export interface MDP3DLineUniforms {
  gamma: [number, number]; // offset  0 : float2 (only .y read here)
  /** float4x4 modelViewMatrix — offset 16, unused in fragment. */
  modelViewMatrix: [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
  /** float4x4 projectionMatrix — offset 80, unused in fragment. */
  projectionMatrix: [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
  ];
}

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the
 * float texture at (u, v) with the bound sampler and returns the
 * four rgba lanes.
 */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Return type of `MDP3DLineFragmentFunc` — mirrors the AIR return
 * struct `<{ <4 x float> }>` (a single render-target colour).
 */
export interface MDP3DLineFragmentOutput {
  color: [number, number, number, number]; // air.render_target 0
}

/**
 * Alpha epsilon used by the inlined `unpremultiply` helper (see the
 * debug scope !55 at metal source line 32) to avoid divide-by-zero.
 * The literal `0x3EB0C6F7A0000000` decodes to 9.999999974752427e-07,
 * which is the fp32 representation of 1e-6.
 */
const ALPHA_EPS = Math.fround(9.999999974752427e-07); // 0x3EB0C6F7A0000000

/**
 * Fragment kernel `MDP3DLineFragmentFunc`.
 *
 * Samples the brush texture, multiplies it by the interpolated
 * vertex colour, unpremultiplies by the resulting alpha (clamped to
 * `ALPHA_EPS`), applies a per-channel `pow(., gamma.y)` gamma, then
 * re-premultiplies by the ORIGINAL (un-clamped) alpha. The output
 * alpha lane is likewise the original `brush.a * color.a` — the eps
 * clamp is used only for the div in the unpremultiply step (see
 * %31's `<0,1,2,7>` shuffle, which sources lane 3 from %9 rather
 * than from the eps-clamped value).
 *
 * @shader MDP3DLineFragmentFunc (MDPKit)
 */
export function MDP3DLineFragmentFunc<TBrush>(
  position: [number, number, number, number], // unused per !33
  color: [number, number, number, number],
  brushTexCoord: [number, number],
  uniforms: MDP3DLineUniforms,
  brush: TBrush,
  sampleBrush: SampleFloatTex2D<TBrush>,
): MDP3DLineFragmentOutput {
  // position is marked air.arg_unused at !33 and is not read by the
  // IR body. Kept in the signature to match the AIR fragment ABI.
  void position;

  // %7 = air.sample_texture_2d.v4f32(brush, ...) ; %8 = extract rgba.
  const brushRGBA = sampleBrush(brush, Math.fround(brushTexCoord[0]), Math.fround(brushTexCoord[1]));

  // %9 = brush * color (per-lane).
  const p0 = Math.fround(Math.fround(brushRGBA[0]) * Math.fround(color[0]));
  const p1 = Math.fround(Math.fround(brushRGBA[1]) * Math.fround(color[1]));
  const p2 = Math.fround(Math.fround(brushRGBA[2]) * Math.fround(color[2]));
  const p3 = Math.fround(Math.fround(brushRGBA[3]) * Math.fround(color[3]));

  // %11 = extractelement %9, 3 ; %12 = air.fast_fmax.f32(%11, 1e-6).
  //   Per SHADERS.md: air.fast_fmax -> Math.fround(Math.max(...)).
  const clampedA = Math.fround(Math.max(p3, ALPHA_EPS));

  // %15 = %10 / splat(clampedA) — unpremultiply .rgb. fdiv fast.
  const u0 = Math.fround(p0 / clampedA);
  const u1 = Math.fround(p1 / clampedA);
  const u2 = Math.fround(p2 / clampedA);

  // %19 = uniforms.gamma.y.
  const gammaY = Math.fround(uniforms.gamma[1]);

  // %20 / %23 / %26 = air.fast_pow.f32(., gamma.y).
  //   Per SHADERS.md: air.fast_pow -> Math.fround(Math.pow(...)).
  const g0 = Math.fround(Math.pow(u0, gammaY));
  const g1 = Math.fround(Math.pow(u1, gammaY));
  const g2 = Math.fround(Math.pow(u2, gammaY));

  // %28 = splat original premul alpha (from %9, lane 3, which is p3 —
  // NOT the eps-clamped clampedA). %29 = %27 * splat(p3).
  const r0 = Math.fround(g0 * p3);
  const r1 = Math.fround(g1 * p3);
  const r2 = Math.fround(g2 * p3);

  // %31 : <r0, r1, r2, p3> — lane 3 sourced from %9 (original).
  return {
    color: [r0, r1, r2, p3],
  };
}
