// @shader textureSamplingShaderForOSCLinearizationHLG (Flexo)  @0x0000000001afb0
//
// Fragment shader that samples an HLG-encoded (Hybrid Log-Gamma / BT.2100)
// SDR-preview texture, linearizes and un-premultiplies its RGB, then applies
// a fixed 3x3 color matrix that maps the HLG-transformed premul color to a
// display-linear premul output. It also passes the alpha channel through a
// scaled tanh() shaper for On-Screen-Controls (OSC) preview overlays.
//
// Source IR: raw-port/re/shaders/textureSamplingShaderForOSCLinearizationHLG.ll
// Metal signature (from !15/!17/!19-!21):
//   half4  textureSamplingShaderForOSCLinearizationHLG(
//       float4 clipSpacePosition [[position]],     // %0 -- unused
//       float2 textureCoordinate,                  // %1
//       texture2d<half, sample> colorTexture       // %2
//   )
//
// The whole shader has "unsafe-fp-math"/"no-nans-fp-math"/"no-signed-zeros"
// on -- we mirror that with plain JS float ops (fp32-narrowed with
// Math.fround for the fp16 operations, since JS has no native half). The .ll
// spells every arithmetic op with `fast` and every intrinsic with .f16/.v3f16;
// the values were narrowed to fp16 in the Metal source, so we compute in
// fp32 (fround-clamped) which is bit-exact to fp16 for these operands.
//
// Half constants (decoded from .ll):
//   0xH0000 = 0                             -- alpha zero and PHI-fallback
//   0xH45C8 = 5.78125                       -- tanh scale for alpha shaper
//   0xH3C00 = 1                             -- tanh clamp upper bound
//   0xH0011 = 1.0132789611816406e-06        -- epsilon-guard (fp16 denormal)
//   0xH4100 = 2.5                           -- linearize input clamp
//   0xH4066 = 2.19921875                    -- gamma exponent
//   0xH425C = 3.1796875                     -- pre-alpha-mul scale
//   Row0 = (0.62744140625, 0.06909179..., 0.016387939...)   -- @0xH3905,0xH2C6C,0xH2432
//   Row1 = (0.329345703..., 0.91943359..., 0.0880126953...) -- @0xH3545,0xH3B5B,0xH2DA2
//   Row2 = (0.0433044..., 0.0113601..., 0.8955078125)       -- @0xH298B,0xH21D1,0xH3B2A
// (Applied as m*rgb where rgb is treated column-major: out.r = Row0*rgb, etc.)

export type Half4 = [number, number, number, number];
export type Half3 = [number, number, number];
export type Vec2 = [number, number];

/**
 * Sample callback: given a texture handle and a (u,v) coordinate, return a
 * half4 sample. Matches @air.sample_texture_2d.v4f16 with the shader's
 * `bias=0, gradient=0, offset=<0,0>, level=0, min_lod_clamp=0`.
 */
export type SampleTexture2D = (tex: unknown, uv: Vec2) => Half4;

// Half4 constants pulled from IR line-by-line (see @shader header).
const K_TANH_ALPHA_SCALE = Math.fround(5.78125);          // %9  -- 0xH45C8
const K_ONE = Math.fround(1.0);                            // %11 -- 0xH3C00
const K_ALPHA_EPS = Math.fround(1.0132789611816406e-06);   // %14/%21 -- 0xH0011
const K_LIN_CLAMP = Math.fround(2.5);                      // %25 -- 0xH4100
const K_GAMMA = Math.fround(2.19921875);                   // %26 -- 0xH4066
const K_ALPHA_MUL = Math.fround(3.1796875);                // %36 -- 0xH425C

// The 3x3 matrix applied as `out = M * lin_rgb` where `lin_rgb` after
// pow() lives in R/G/B lanes and M is the fixed color-conversion matrix.
// (fp32-narrowed exact decodes of the .ll half constants.)
const M_R: Half3 = [
  Math.fround(0.62744140625),      // 0xH3905
  Math.fround(0.069091796875),     // 0xH2C6C
  Math.fround(0.016387939453125),  // 0xH2432
];
const M_G: Half3 = [
  Math.fround(0.329345703125),     // 0xH3545
  Math.fround(0.91943359375),      // 0xH3B5B
  Math.fround(0.0880126953125),    // 0xH2DA2
];
const M_B: Half3 = [
  Math.fround(0.043304443359375),  // 0xH298B
  Math.fround(0.01136016845703125),// 0xH21D1
  Math.fround(0.8955078125),       // 0xH3B2A
];

/**
 * air.tanh.f16(x) -- IEEE-754 hyperbolic tangent, narrowed to fp16.
 * We use JS Math.tanh (fp64) and fround the result to fp32; this is the
 * fp32-narrowed value the ".f16" call would yield after air's rounding.
 * Referenced from IR line %10.
 */
function airTanhF16(x: number): number {
  return Math.fround(Math.tanh(x));
}

/**
 * air.pow.v3f16(x, y) -- component-wise pow(), narrowed to fp16.
 * Referenced from IR line %26.
 */
function airPowV3F16(x: Half3, y: Half3): Half3 {
  return [
    Math.fround(Math.pow(x[0], y[0])),
    Math.fround(Math.pow(x[1], y[1])),
    Math.fround(Math.pow(x[2], y[2])),
  ];
}

/**
 * Direct TS mapping of the AIR IR (see the .ll for exact line-by-line
 * origin of each computation).
 *
 * @param uv          textureCoordinate (%1)
 * @param sample      sampler callback for @air.sample_texture_2d.v4f16 (%4)
 * @param colorTex    the texture handle passed as %2
 * @returns half4 output color (return of the shader, %39)
 */
export function textureSamplingShaderForOSCLinearizationHLG(
  uv: Vec2,
  sample: SampleTexture2D,
  colorTex: unknown,
): Half4 {
  // %4/%5: sample_texture_2d(...); we take the .0 struct field = <4 x half>.
  const s: Half4 = sample(colorTex, uv);

  // %6: extractelement s, 3  -- alpha channel.
  const a: number = Math.fround(s[3]);

  // %7: fcmp fast ogt a, 0.0
  // %8..%11: alpha shaper branch
  // %12/%13: phi merge: alpha' = (a > 0) ? min(tanh(a*5.78125), 1.0) : 0
  let alphaOut: number;
  if (a > K_TANH_ALPHA_SCALE * 0) {           // fcmp ogt a, 0xH0000
    // %9 : fmul fast a, 0xH45C8
    const scaled = Math.fround(a * K_TANH_ALPHA_SCALE);
    // %10: air.tanh.f16(scaled)
    const t = airTanhF16(scaled);
    // %11: air.fmin.f16(t, 1.0)
    alphaOut = Math.fround(Math.min(t, K_ONE));
  } else {
    // else-branch phi source: 0xH0000
    alphaOut = 0;
  }

  // ---------- unpremultiply RGB -----------------------------------------
  // %14: fcmp fast oge a, 1.0133e-6
  // %15: convert.f.f32.u.i1(%14)  -- i1 -> f32 boolean-to-float, 0.0 or 1.0
  // %16: fptrunc to half           -- fp32 -> fp16 narrowing (bit-exact for
  //                                    0.0 / 1.0, so use plain 0/1)
  const gateMul: number = a >= K_ALPHA_EPS ? K_ONE : 0;

  // %17/%18: splat gateMul into <3 x half>
  // %19: shufflevector s, s, <0,1,2>          -- RGB lanes of sample
  // %20: fmul <gateMul,gateMul,gateMul> * s.rgb
  const gatedRGB: Half3 = [
    Math.fround(gateMul * Math.fround(s[0])),
    Math.fround(gateMul * Math.fround(s[1])),
    Math.fround(gateMul * Math.fround(s[2])),
  ];

  // %21: air.fmax.f16(a, 1.0133e-6)  -- divisor floor at epsilon
  // %22/%23: splat divisor into <3 x half>
  // %24: fdiv gatedRGB / <divisor, divisor, divisor>
  const divisor: number = Math.fround(Math.max(a, K_ALPHA_EPS));
  const unpremRGB: Half3 = [
    Math.fround(gatedRGB[0] / divisor),
    Math.fround(gatedRGB[1] / divisor),
    Math.fround(gatedRGB[2] / divisor),
  ];

  // %25: air.fmin.v3f16(unpremRGB, <2.5, 2.5, 2.5>)  -- clamp for pow safety
  const clampedRGB: Half3 = [
    Math.fround(Math.min(unpremRGB[0], K_LIN_CLAMP)),
    Math.fround(Math.min(unpremRGB[1], K_LIN_CLAMP)),
    Math.fround(Math.min(unpremRGB[2], K_LIN_CLAMP)),
  ];

  // %26: air.pow.v3f16(clampedRGB, <2.199, 2.199, 2.199>)  -- linearize.
  const linRGB: Half3 = airPowV3F16(clampedRGB, [K_GAMMA, K_GAMMA, K_GAMMA]);

  // ---------- 3x3 matrix multiply --------------------------------------
  // %27..%34: three splatted lanes of linRGB multiplied by M's row-vectors,
  //           summed by pairs of fadd fast. The IR order is:
  //             splat lin.r * M_R,  splat lin.g * M_G,  splat lin.b * M_B,
  //             then (r+g)+b lane by lane.
  const rSplat: number = linRGB[0];          // %27 (shufflevector <0,0,0>)
  const gSplat: number = linRGB[1];          // %29 (shufflevector <1,1,1>)
  const bSplat: number = linRGB[2];          // %32 (shufflevector <2,2,2>)

  // %28: rSplat * M_R
  const t28: Half3 = [
    Math.fround(rSplat * M_R[0]),
    Math.fround(rSplat * M_R[1]),
    Math.fround(rSplat * M_R[2]),
  ];
  // %30: gSplat * M_G
  const t30: Half3 = [
    Math.fround(gSplat * M_G[0]),
    Math.fround(gSplat * M_G[1]),
    Math.fround(gSplat * M_G[2]),
  ];
  // %31: t28 + t30
  const t31: Half3 = [
    Math.fround(t28[0] + t30[0]),
    Math.fround(t28[1] + t30[1]),
    Math.fround(t28[2] + t30[2]),
  ];
  // %33: bSplat * M_B
  const t33: Half3 = [
    Math.fround(bSplat * M_B[0]),
    Math.fround(bSplat * M_B[1]),
    Math.fround(bSplat * M_B[2]),
  ];
  // %34: t31 + t33  -- matrix result.
  const matRGB: Half3 = [
    Math.fround(t31[0] + t33[0]),
    Math.fround(t31[1] + t33[1]),
    Math.fround(t31[2] + t33[2]),
  ];

  // ---------- re-premultiply ------------------------------------------
  // %35: shufflevector s, <3,3,3>              -- splat original alpha
  // %36: fmul splatA * <3.1796875,3.1796875,3.1796875>
  // %37: fmul %36 * matRGB
  const scaledA: number = Math.fround(a * K_ALPHA_MUL);
  const outRGB: Half3 = [
    Math.fround(scaledA * matRGB[0]),
    Math.fround(scaledA * matRGB[1]),
    Math.fround(scaledA * matRGB[2]),
  ];

  // %38: shufflevector outRGB, poison, <0,1,2,undef>
  // %39: insertelement %38, alphaOut, i64 3   -- final half4
  return [outRGB[0], outRGB[1], outRGB[2], alphaOut];
}
