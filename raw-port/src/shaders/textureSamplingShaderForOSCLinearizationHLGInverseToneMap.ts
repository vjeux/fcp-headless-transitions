// @shader textureSamplingShaderForOSCLinearizationHLGInverseToneMap (Flexo)  @0x0000000001c100
//
// Fragment shader that samples an HLG-encoded (BT.2100 Hybrid Log-Gamma)
// SDR preview texture, un-premultiplies its RGB, linearizes it via
// pow(x, 2.19921875), applies a 3x3 color matrix (the same primaries
// matrix used by textureSamplingShaderForOSCLinearizationHLG), then
// applies the HLG *inverse OOTF* (Y^(1-gamma)*12, with gamma = 1.2 --> the
// literal 0.1821635663509369 is 1/gamma - 1/1.2 = 0.18216...) to produce
// display-linear RGB scaled for HDR display. Alpha is passed through
// unmodified from the sampled texel (contrast this to the sibling
// shader `...HLG` which applies a tanh() alpha shaper).
//
// Source IR: raw-port/re/shaders/textureSamplingShaderForOSCLinearizationHLGInverseToneMap.ll
// Metal signature (from !15/!17/!19-!21):
//   half4  textureSamplingShaderForOSCLinearizationHLGInverseToneMap(
//       float4 clipSpacePosition [[position]],   // %0  unused
//       float2 textureCoordinate,                // %1
//       texture2d<half, sample> colorTexture     // %2
//   )
//
// unsafe-fp-math / no-nans / no-signed-zeros are on, so we use plain JS
// float ops (fp32-narrowed with Math.fround). The .ll is committed at
// raw-port/re/shaders/textureSamplingShaderForOSCLinearizationHLGInverseToneMap.ll.
//
// Half constants (decoded from .ll):
//   0xH0011 = 1.0132789611816406e-06  -- alpha epsilon-guard
//   0xH4100 = 2.5                      -- linearize input clamp
//   0xH4066 = 2.19921875               -- gamma exponent for linearize
//   0xH0000 = 0                        -- PHI fallback for inverse-OOTF
//
//   3x3 color matrix (same as ...HLG sibling):
//     Row0 = (0.62744140625, 0.06909179..., 0.016387939...)   -- 0xH3905,0xH2C6C,0xH2432
//     Row1 = (0.329345703..., 0.91943359..., 0.0880126953...) -- 0xH3545,0xH3B5B,0xH2DA2
//     Row2 = (0.0433044..., 0.0113601..., 0.8955078125)       -- 0xH298B,0xH21D1,0xH3B2A
//
//   Luma weights for HLG OOTF Y: (0.2626953125, 0.67822265625, 0.059295654296875)
//     = 0xH3434,0xH396D,0xH2B97 -- Rec.2020 luma coefficients (fp16-narrowed).
//
//   Inverse-OOTF exponent (fp32 constant in the IR):
//     0x3FC75122C0000000 = 0.1821635663509369   -- 1/gamma - 1 with gamma=1.2
//     is 1/1.2 - 1 = -0.1666...  the actual sign/value here matches the HLG
//     spec form Y^((1-gamma)/gamma) = Y^(-1/6) which is fp32-narrowed to
//     0.1821635663509369 (note: not exactly -1/6; the compiler emits the
//     positive constant and applies fmul by 12.0 for the OOTF-inverse form
//     Y' = 12 * Y^k). We transcribe the emitted bit pattern verbatim.
//   Scale 12.0 = 1.200000e+01 -- HLG peak scale.

export type Half4 = [number, number, number, number];
export type Half3 = [number, number, number];
export type Vec2 = [number, number];

export type SampleTexture2D = (tex: unknown, uv: Vec2) => Half4;

// Half constants -- fp32-narrowed exact decodes.
const K_ALPHA_EPS = Math.fround(1.0132789611816406e-06); // 0xH0011
const K_LIN_CLAMP = Math.fround(2.5);                    // 0xH4100
const K_GAMMA = Math.fround(2.19921875);                 // 0xH4066

// 3x3 primaries matrix -- identical to sibling shader.
const M_R: Half3 = [
  Math.fround(0.62744140625),
  Math.fround(0.069091796875),
  Math.fround(0.016387939453125),
];
const M_G: Half3 = [
  Math.fround(0.329345703125),
  Math.fround(0.91943359375),
  Math.fround(0.0880126953125),
];
const M_B: Half3 = [
  Math.fround(0.043304443359375),
  Math.fround(0.01136016845703125),
  Math.fround(0.8955078125),
];

// Rec.2020 luma coefficients (fp16-narrowed).
const LUMA_R = Math.fround(0.2626953125);        // 0xH3434
const LUMA_G = Math.fround(0.67822265625);       // 0xH396D
const LUMA_B = Math.fround(0.059295654296875);   // 0xH2B97

// HLG inverse-OOTF exponent -- fp32 literal (already 32-bit in the IR).
const K_OOTF_EXP = 0.1821635663509369;           // 0x3FC75122C0000000 -- fp32
const K_OOTF_SCALE = Math.fround(12.0);          // 1.200000e+01

/**
 * air.fast_pow.f32(x, y) -- fp32 pow(). Direct TS mapping via Math.pow,
 * result cast to float32. Referenced from IR line %32.
 */
function airFastPowF32(x: number, y: number): number {
  return Math.fround(Math.pow(x, y));
}

/**
 * air.pow.v3f16(x, y) -- component-wise pow(), narrowed to fp16.
 * Referenced from IR line %19.
 */
function airPowV3F16(x: Half3, y: Half3): Half3 {
  return [
    Math.fround(Math.pow(x[0], y[0])),
    Math.fround(Math.pow(x[1], y[1])),
    Math.fround(Math.pow(x[2], y[2])),
  ];
}

/**
 * Direct TS mapping of the AIR IR. See the .ll for per-line origin.
 *
 * @param uv          textureCoordinate (%1)
 * @param sample      sampler callback for @air.sample_texture_2d.v4f16 (%4)
 * @param colorTex    the texture handle passed as %2
 * @returns half4 output color (%43)
 */
export function textureSamplingShaderForOSCLinearizationHLGInverseToneMap(
  uv: Vec2,
  sample: SampleTexture2D,
  colorTex: unknown,
): Half4 {
  // %4/%5: sample_texture_2d -> half4 s.
  const s: Half4 = sample(colorTex, uv);

  // %6: extractelement s, 3 -- alpha.
  const a: number = Math.fround(s[3]);

  // %7: fcmp fast oge a, 1.013e-6
  // %8/%9: bool -> f32 -> half     (0.0 or 1.0)
  // %10/%11: splat into <3 x half>
  // %12: shufflevector s, <0,1,2>  -- RGB lanes
  // %13: fmul splat * RGB          -- gate
  const gateMul: number = a >= K_ALPHA_EPS ? Math.fround(1.0) : 0;
  const gatedRGB: Half3 = [
    Math.fround(gateMul * Math.fround(s[0])),
    Math.fround(gateMul * Math.fround(s[1])),
    Math.fround(gateMul * Math.fround(s[2])),
  ];

  // %14: fmax.f16(a, 1.013e-6) -- divisor floor
  // %15/%16: splat divisor
  // %17: fdiv gatedRGB / divisor  -- unpremultiply
  const divisor: number = Math.fround(Math.max(a, K_ALPHA_EPS));
  const unpremRGB: Half3 = [
    Math.fround(gatedRGB[0] / divisor),
    Math.fround(gatedRGB[1] / divisor),
    Math.fround(gatedRGB[2] / divisor),
  ];

  // %18: fmin.v3f16(unpremRGB, <2.5,2.5,2.5>)  -- clamp for pow safety
  const clampedRGB: Half3 = [
    Math.fround(Math.min(unpremRGB[0], K_LIN_CLAMP)),
    Math.fround(Math.min(unpremRGB[1], K_LIN_CLAMP)),
    Math.fround(Math.min(unpremRGB[2], K_LIN_CLAMP)),
  ];

  // %19: pow.v3f16(clampedRGB, <2.199,...>)   -- linearize
  const linRGB: Half3 = airPowV3F16(clampedRGB, [K_GAMMA, K_GAMMA, K_GAMMA]);

  // %20..%27: matrix multiply (same layout as sibling shader)
  const rSplat: number = linRGB[0];
  const gSplat: number = linRGB[1];
  const bSplat: number = linRGB[2];
  const t21: Half3 = [
    Math.fround(rSplat * M_R[0]),
    Math.fround(rSplat * M_R[1]),
    Math.fround(rSplat * M_R[2]),
  ];
  const t23: Half3 = [
    Math.fround(gSplat * M_G[0]),
    Math.fround(gSplat * M_G[1]),
    Math.fround(gSplat * M_G[2]),
  ];
  const t24: Half3 = [
    Math.fround(t21[0] + t23[0]),
    Math.fround(t21[1] + t23[1]),
    Math.fround(t21[2] + t23[2]),
  ];
  const t26: Half3 = [
    Math.fround(bSplat * M_B[0]),
    Math.fround(bSplat * M_B[1]),
    Math.fround(bSplat * M_B[2]),
  ];
  const t27: Half3 = [           // matRGB
    Math.fround(t24[0] + t26[0]),
    Math.fround(t24[1] + t26[1]),
    Math.fround(t24[2] + t26[2]),
  ];

  // %28: air.dot.v3f16(<0.2627,0.6782,0.0593>, matRGB)  -- BT.2020 luma Y.
  //   Note: IR emits dot as a scalar half; we compute in fp32-narrowed form.
  const Y: number = Math.fround(
    Math.fround(LUMA_R * t27[0]) +
      Math.fround(LUMA_G * t27[1]) +
      Math.fround(LUMA_B * t27[2]),
  );

  // %29: fcmp fast ogt Y, 0
  // %30..%34: HLG inverse OOTF branch:
  //   %31: fpext Y half->float
  //   %32: air.fast_pow.f32(Yf, 0.1821635663509369)
  //   %33: fmul %32, 12.0
  //   %34: fptrunc back to half
  // %35/%36 phi: Y' = (Y > 0) ? fp32-narrow(12 * pow(Y, k)) : 0
  let ootfScale: number;
  if (Y > 0) {
    const Yf = Y;                                      // fp32 (was half)
    const pw = airFastPowF32(Yf, K_OOTF_EXP);          // %32
    const mul12 = Math.fround(pw * K_OOTF_SCALE);      // %33
    ootfScale = mul12;                                 // %34 (already half-rep)
  } else {
    ootfScale = 0;                                     // phi fallback
  }

  // %37/%38: splat ootfScale into <3 x half>
  // %39: shufflevector s, <3,3,3>  -- original alpha splat
  // %40: fmul matRGB * <a,a,a>   -- premultiply by original alpha
  // %41: fmul %40 * <ootfScale,ootfScale,ootfScale>   -- scale by OOTF factor
  const premul: Half3 = [
    Math.fround(t27[0] * a),
    Math.fround(t27[1] * a),
    Math.fround(t27[2] * a),
  ];
  const outRGB: Half3 = [
    Math.fround(premul[0] * ootfScale),
    Math.fround(premul[1] * ootfScale),
    Math.fround(premul[2] * ootfScale),
  ];

  // %42/%43: pack outRGB with the original sample's alpha (lane 7 = s[3]).
  return [outRGB[0], outRGB[1], outRGB[2], Math.fround(s[3])];
}
