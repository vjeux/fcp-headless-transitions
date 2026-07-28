// @shader textureSamplingShaderForOSCLinearization (Flexo)
//
// Fragment shader from Flexo.framework/Versions/A/Resources/default.metallib
// at offset 0x00019e60. Transcribed verbatim from LLVM IR — see
// raw-port/re/shaders/textureSamplingShaderForOSCLinearization.ll.
//
// SIGNATURE (from the .ll and !air.fragment metadata !15/!19/!20/!21):
//   define <4 x half> @textureSamplingShaderForOSCLinearization(
//       <4 x float> %0,   // clipSpacePosition          (air.position, unused)
//       <2 x float> %1,   // textureCoordinate          (air.fragment_input)
//       %texture_2d_t %2  // colorTexture (half4 sampled)
//   ) -> <4 x half>       // air.render_target 0, half4
//
// SAMPLER STATE (!22 -> @__air_sampler_state = [i64 34901797601020489, i64 0]).
// The high i64 is a packed set of Metal sampler bits (filter/address/lod); the
// low i64 is zero. This port receives the sampled RGBA directly through a
// `sample(tex, uv)` callback so it does not need to model the sampler state
// bit pattern.
//
// SEMANTICS. Given a premultiplied HDR half4 texture read at `uv`:
//   1. Alpha nonlinearity: alpha' = min(tanh(a * 5.78125), 1.0)   (0 if a == 0)
//   2. Unpremultiply RGB by max(a, 1.0132789611816406e-6).
//   3. Clamp RGB to 1.5 (soft ceiling), then pow(rgb, 2.19921875) (de-gamma).
//   4. Apply the fixed 3x3 color-space matrix M below to the de-gamma'd RGB.
//   5. Re-premultiply by (a * 2.0).
//   6. Output = (rgb', alpha') as half4.
//
// The 3x3 matrix M (rows = output R,G,B; cols = input R,G,B) — read directly
// off %28/%30/%33 which multiply broadcasted r,g,b lanes by three per-column
// constant vectors and sum:
//        R_in           G_in           B_in
//   R:  0.62744140625   0.329345703125 0.043304443359375
//   G:  0.069091796875  0.91943359375  0.01136016845703125
//   B:  0.016387939453125 0.0110... 0.8955078125
//
// (fp16 half constants; each 0xHNNNN literal in the IR is a raw half.  See
// the per-line comments and the /raw-port/re/shaders/*.ll for provenance.)
//
// FP FLAGS. Every arith op in the .ll is `fast` (attributes #0 has
// "unsafe-fp-math"="true" + "no-infs-fp-math"+"no-nans-fp-math"+
// "no-signed-zeros-fp-math"+"approx-func-fp-math"). This TS port uses plain
// JS Number arithmetic. Where the IR narrows to half, we mirror by calling
// Math.fround on both operands and the result so an fp32-narrowed value
// survives (JS has no fp16 type; fround gives fp32-narrowing, which is
// bit-exact for the constants used here after their fp16 round-trip).

// ── Types ────────────────────────────────────────────────────────────────────

/** RGBA half4, returned by the texture-sample callback and as this shader's output. */
export type Half4 = [number, number, number, number];

/** Texture-sample callback: given a UV, return the half4 sample. Models
 *  `air.sample_texture_2d.v4f16(tex, sampler, uv, ...)` from the IR. */
export type SampleTex = (uv: [number, number]) => Half4;

// ── Constants (all fp16 half literals from the IR, decoded exactly) ─────────
//
// Each constant below is the exact IEEE-754 half value of the 0xHNNNN literal
// in the .ll, cast to fp32 (JS Number) via Math.fround. The comment shows the
// raw half bit pattern.

const H_ZERO   = Math.fround(0.0);                          // 0xH0000
const H_ONE    = Math.fround(1.0);                          // 0xH3C00
const H_TWO    = Math.fround(2.0);                          // 0xH4000
const H_TANH_K = Math.fround(5.78125);                      // 0xH45C8 (alpha scale before tanh)
const H_EPS    = Math.fround(1.0132789611816406e-6);        // 0xH0011 (unpremul epsilon)
const H_CLAMP  = Math.fround(1.5);                          // 0xH3E00 (soft-clip ceiling on rgb)
const H_GAMMA  = Math.fround(2.19921875);                   // 0xH4066 (pow exponent)

// 3x3 color-space matrix — three per-column constant vectors from the IR:
//   %28 = r_broadcast * <0xH3905, 0xH2C6C, 0xH2432>
//   %30 = g_broadcast * <0xH3545, 0xH3B5B, 0xH2DA2>
//   %33 = b_broadcast * <0xH298B, 0xH21D1, 0xH3B2A>
// Reading rows-vs-columns off the IR: the output-lane 0 gets
//   0.62744140625 * r + 0.329345703125 * g + 0.043304443359375 * b
// (i.e. the FIRST element of each of the three vectors combined). So
// M[out_row][in_col] = col_vectors[in_col][out_row].
const M_COL_R: [number, number, number] = [
  Math.fround(0.62744140625),        // 0xH3905
  Math.fround(0.069091796875),       // 0xH2C6C
  Math.fround(0.016387939453125),    // 0xH2432
];
const M_COL_G: [number, number, number] = [
  Math.fround(0.329345703125),       // 0xH3545
  Math.fround(0.91943359375),        // 0xH3B5B
  Math.fround(0.0880126953125),      // 0xH2DA2
];
const M_COL_B: [number, number, number] = [
  Math.fround(0.043304443359375),    // 0xH298B
  Math.fround(0.01136016845703125),  // 0xH21D1
  Math.fround(0.8955078125),         // 0xH3B2A
];

// ── Half-precision helpers ──────────────────────────────────────────────────
// JS has no fp16; we emulate half-lane arithmetic by fp32-narrowing every
// intermediate. This is bit-exact enough for the constants at play (all half
// literals) and mirrors the .ll's fast-math flags.

const f = Math.fround;

/** air.tanh.f16 — hyperbolic tangent, fp32-narrowed to stand in for fp16. */
function tanh_f16(x: number): number {
  return f(Math.tanh(f(x)));
}

/** air.pow.v3f16 — elementwise pow, fp32-narrowed. */
function pow_v3f16(base: [number, number, number], exp: number): [number, number, number] {
  return [f(Math.pow(f(base[0]), f(exp))), f(Math.pow(f(base[1]), f(exp))), f(Math.pow(f(base[2]), f(exp)))];
}

/** air.fmin.f16 / air.fmax.f16 — scalar min/max, fp32-narrowed. */
function fmin_f16(a: number, b: number): number { return f(Math.min(f(a), f(b))); }
function fmax_f16(a: number, b: number): number { return f(Math.max(f(a), f(b))); }

/** air.fmin.v3f16 — vector elementwise min. */
function fmin_v3f16(v: [number, number, number], s: number): [number, number, number] {
  return [f(Math.min(f(v[0]), f(s))), f(Math.min(f(v[1]), f(s))), f(Math.min(f(v[2]), f(s)))];
}

// ── Fragment ────────────────────────────────────────────────────────────────

/**
 * textureSamplingShaderForOSCLinearization — the fragment. See the .ll for the
 * IR line numbers cited alongside each op.
 *
 * @param uv        textureCoordinate (%1)
 * @param sample    air.sample_texture_2d.v4f16 callback for colorTexture (%2)
 * @returns         half4 (fp32-narrowed) — the fragment output at air.render_target 0.
 */
export function textureSamplingShaderForOSCLinearization(
  uv: [number, number],
  sample: SampleTex,
): Half4 {
  // %4 = call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(tex, sampler, uv, ...)
  // %5 = extractvalue { <4 x half>, i8 } %4, 0        // the half4 result
  const s: Half4 = sample(uv);
  const r0 = f(s[0]);
  const g0 = f(s[1]);
  const b0 = f(s[2]);
  const a  = f(s[3]);                       // %6 = extractelement <4 x half> %5, i64 3

  // %7 = fcmp fast ogt half %6, 0xH0000    ; a > 0 ?
  // br i1 %7, label %8, label %12
  let alphaOut: number;                      // %13 = phi half
  if (a > H_ZERO) {                          // label %8
    // %9  = fmul fast half %6, 0xH45C8      ; a * 5.78125
    // %10 = call fast half @air.tanh.f16(%9)
    // %11 = call fast half @air.fmin.f16(%10, 0xH3C00)     ; min(tanh(...), 1.0)
    const t = tanh_f16(f(a * H_TANH_K));
    alphaOut = fmin_f16(t, H_ONE);
  } else {                                   // else-branch phi input = 0xH0000
    alphaOut = H_ZERO;
  }

  // %14 = fcmp fast oge half %6, 0xH0011    ; a >= 1.0132789611816406e-6
  // %15 = call fast float @air.convert.f.f32.u.i1(i1 %14)
  // %16 = fptrunc float %15 to half         ; -> 1.0 if mask, else 0.0
  // %17..%18 = insertelement / shufflevector to broadcast %16 to <3 x half>
  const mask = (a >= H_EPS) ? H_ONE : H_ZERO;

  // %19 = shufflevector <4 x half> %5, poison, <3 x i32> <0,1,2>   ; rgb
  // %20 = fmul fast <3 x half> %18, %19     ; rgb * mask   (zero out when a≈0)
  const maskedR = f(mask * r0);
  const maskedG = f(mask * g0);
  const maskedB = f(mask * b0);

  // %21 = call fast half @air.fmax.f16(%6, 0xH0011)   ; max(a, eps)
  // %22..%23 = broadcast to <3 x half>
  const denom = fmax_f16(a, H_EPS);

  // %24 = fdiv fast <3 x half> %20, %23     ; unpremultiplied rgb
  const unR = f(maskedR / denom);
  const unG = f(maskedG / denom);
  const unB = f(maskedB / denom);

  // %25 = call fast <3 x half> @air.fmin.v3f16(%24, <1.5, 1.5, 1.5>)  ; soft-clip
  const cl = fmin_v3f16([unR, unG, unB], H_CLAMP);

  // %26 = call fast <3 x half> @air.pow.v3f16(%25, <2.19921875 x3>)   ; de-gamma
  const p = pow_v3f16(cl, H_GAMMA);
  const pr = p[0];
  const pg = p[1];
  const pb = p[2];

  // %27 = shufflevector %26, poison, <3 x i32> zeroinitializer         ; broadcast pr
  // %28 = fmul fast <3 x half> %27, <0xH3905, 0xH2C6C, 0xH2432>        ; pr * col_R
  const rR = f(pr * M_COL_R[0]);
  const rG = f(pr * M_COL_R[1]);
  const rB = f(pr * M_COL_R[2]);

  // %29 = shufflevector %26, undef, <1,1,1>                             ; broadcast pg
  // %30 = fmul fast <3 x half> %29, <0xH3545, 0xH3B5B, 0xH2DA2>
  // %31 = fadd fast <3 x half> %28, %30
  const s1R = f(rR + f(pg * M_COL_G[0]));
  const s1G = f(rG + f(pg * M_COL_G[1]));
  const s1B = f(rB + f(pg * M_COL_G[2]));

  // %32 = shufflevector %26, undef, <2,2,2>                             ; broadcast pb
  // %33 = fmul fast <3 x half> %32, <0xH298B, 0xH21D1, 0xH3B2A>
  // %34 = fadd fast <3 x half> %31, %33     ; final matmul row
  const mR = f(s1R + f(pb * M_COL_B[0]));
  const mG = f(s1G + f(pb * M_COL_B[1]));
  const mB = f(s1B + f(pb * M_COL_B[2]));

  // %35 = shufflevector <4 x half> %5, undef, <3 x i32> <3,3,3>         ; aaa
  // %36 = fmul fast <3 x half> %35, <2.0, 2.0, 2.0>                     ; a * 2
  // %37 = fmul fast <3 x half> %36, %34     ; (a*2) * matmul(rgb)
  const twoA = f(a * H_TWO);
  const outR = f(twoA * mR);
  const outG = f(twoA * mG);
  const outB = f(twoA * mB);

  // %38 = shufflevector <3 x half> %37, poison, <4 x i32> <0,1,2,undef>
  // %39 = insertelement <4 x half> %38, half %13, i64 3     ; alpha lane = alphaOut
  // ret <4 x half> %39
  return [outR, outG, outB, alphaOut];
}
