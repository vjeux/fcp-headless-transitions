// @shader filter12FragmentFunc (Lithium)
// @0x000000000123c9 — Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib
//
// Faithful transcription from the AIR IR — each fmul/fadd/sample here mirrors
// a specific %N SSA def in the .ll cited below.
//
// 12-tap symmetric 1-D texture filter fragment shader.  Given 24 pre-computed
// texcoords (12 pairs, one on each side of the centre), samples the texture at
// each, sums the pair, multiplies by that pair's tap weight, and accumulates.
// The output is the weighted sum on the RGB channels; the alpha lane is
// clamped to [0.0, 1.0] via air.fast_fmin/air.fast_fmax before return.
//
// Source LLVM IR: raw-port/re/shaders/filter12FragmentFunc.ll (extracted by
// `bash raw-port/tools/shader_disasm.sh filter12FragmentFunc Lithium`).
//
// AIR signature (from air.fragment metadata !15 and !18..!44):
//   define <4 x float> @filter12FragmentFunc(
//     <4 x float> %0,   ; air.position position   (unused, air.arg_unused)
//     <2 x float> %1..%24  ; 24 air.fragment_input texcoords (12 pairs)
//     texture2d<float, sample> %25          ; air.texture tex, location 0
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable` — the shader compiles under Metal fast-math.
// This port uses plain JS Number arithmetic (IEEE-754 fp64) narrowed with
// Math.fround for each fp32-typed value, preserving f32 fidelity.
//
// TAP WEIGHTS (double bit patterns in IR narrowed to fp32; the AIR intrinsic
// is <4 x float> so the constants are fp32-loaded at each callsite):
//   w0 = 0x3FC4D38CE0000000 =  0.16270600259304047   (pair %1 <-> %13)
//   w1 = 0x3FC2891180000000 =  0.14480799436569214   (pair %2 <-> %14)
//   w2 = 0x3FBD000CA0000000 =  0.11328200250864029   (pair %3 <-> %15)
//   w3 = 0x3FB3485280000000 =  0.07532230019569397   (pair %4 <-> %16)
//   w4 = 0x3FA3E35FC0000000 =  0.03884410113096237   (pair %5 <-> %17)
//   w5 = 0x3F84EAF900000000 =  0.010213799774646759  (pair %6 <-> %18)
//   w6 = 0xBF7DF416E0000000 = -0.007312859874218702  (pair %7 <-> %19)
//   w7 = 0xBF8CA39740000000 = -0.013983899727463722  (pair %8 <-> %20)
//   w8 = 0xBF8A27A120000000 = -0.012770899571478367  (pair %9 <-> %21)
//   w9 = 0xBF80110A20000000 = -0.007845000363886356  (pair %10 <-> %22)
//   w10 = 0xBF6835A120000000 = -0.0029552599880844355 (pair %11 <-> %23)
//   w11 = 0xBF34283800000000 = -0.00030757300555706024 (pair %12 <-> %24)
//
// The alternating positive-negative-tail pattern is a classic band-pass /
// sharpening kernel (positive centre lobe out to ~pair 5, then a small
// negative outer skirt); it sums to less than 1.0 so overall gain is < 1.
// No normalisation is performed.
//
// IR line map (grouped per pair; each pair follows the same 4-op shape:
// two air.sample_texture_2d + fadd + fmul):
//   pair 0 (%1 <-> %13): %27..%32     -> accumulator initialised to fmul(sum0, w0)
//   pair 1 (%2 <-> %14): %33..%39     -> acc += fmul(sum1, w1)
//   pair 2 (%3 <-> %15): %40..%46     -> acc += fmul(sum2, w2)
//   pair 3 (%4 <-> %16): %47..%53     -> acc += fmul(sum3, w3)
//   pair 4 (%5 <-> %17): %54..%60     -> acc += fmul(sum4, w4)
//   pair 5 (%6 <-> %18): %61..%67     -> acc += fmul(sum5, w5)
//   pair 6 (%7 <-> %19): %68..%74     -> acc += fmul(sum6, w6)
//   pair 7 (%8 <-> %20): %75..%81     -> acc += fmul(sum7, w7)
//   pair 8 (%9 <-> %21): %82..%88     -> acc += fmul(sum8, w8)
//   pair 9 (%10 <-> %22): %89..%95    -> acc += fmul(sum9, w9)
//   pair10 (%11 <-> %23): %96..%102   -> acc += fmul(sum10, w10)
//   pair11 (%12 <-> %24): %103..%109  -> acc += fmul(sum11, w11)
//   %110 = extractelement <4 x float> %109, i64 3    -> a = acc.a
//   %111 = air.fast_fmin.f32(a, 1.000000e+00)
//   %112 = air.fast_fmax.f32(%111, 0.000000e+00)
//   %113 = insertelement <4 x float> %109, %112, i64 3
//   ret <4 x float> %113
//
// AIR sampler state: @__air_sampler_state.2 = [i64 34901797601020489, i64 0].
// The runtime resolves this to a Metal sampler_state; from JS we abstract
// via a `sample(tex, uv)` callback returning four fp32 channels.

/**
 * Callback modelling AIR `%N = @air.sample_texture_2d.v4f32(...)`.
 * `tex` is an opaque texture handle and `uv` is the two-component sample
 * coordinate. Returns the four fp32 texel channels.
 */
export type SampleTexture2D = (
  tex: unknown,
  uv: readonly [number, number],
) => readonly [number, number, number, number];

// Filter tap weights, fp32-narrowed from the AIR double bit patterns.  Each
// constant is the exact double->fp32 image of the IR literal cited beside it.
const W0 = Math.fround(0.16270600259304047);     // %32  fmul const 0x3FC4D38CE0000000
const W1 = Math.fround(0.14480799436569214);     // %38  fmul const 0x3FC2891180000000
const W2 = Math.fround(0.11328200250864029);     // %45  fmul const 0x3FBD000CA0000000
const W3 = Math.fround(0.07532230019569397);     // %52  fmul const 0x3FB3485280000000
const W4 = Math.fround(0.03884410113096237);     // %59  fmul const 0x3FA3E35FC0000000
const W5 = Math.fround(0.010213799774646759);    // %66  fmul const 0x3F84EAF900000000
const W6 = Math.fround(-0.007312859874218702);   // %73  fmul const 0xBF7DF416E0000000
const W7 = Math.fround(-0.013983899727463722);   // %80  fmul const 0xBF8CA39740000000
const W8 = Math.fround(-0.012770899571478367);   // %87  fmul const 0xBF8A27A120000000
const W9 = Math.fround(-0.007845000363886356);   // %94  fmul const 0xBF80110A20000000
const W10 = Math.fround(-0.0029552599880844355); // %101 fmul const 0xBF6835A120000000
const W11 = Math.fround(-0.00030757300555706024);// %108 fmul const 0xBF34283800000000

/**
 * filter12FragmentFunc — 12-tap symmetric texture filter.  Accepts 24
 * per-vertex uvs (12 pairs) and a texture; returns the weighted sum of
 * paired texel sums.  Alpha lane is clamped to [0,1] before return.
 *
 * @param position fragment position vec4 — declared air.arg_unused per !19.
 * @param uvPairs  24-entry array of `[u,v]` texcoords in the order
 *                 %1..%24 from the IR.  The i-th pair is
 *                 (uvPairs[i], uvPairs[i+12]).
 * @param tex      opaque texture handle (the `%25` argument).
 * @param sample   the AIR sample_texture_2d callback.
 * @returns        fp32 vec4 with the summed RGB and clamped alpha.
 */
export function filter12FragmentFunc(
  position: readonly [number, number, number, number],
  uvPairs: readonly (readonly [number, number])[],
  tex: unknown,
  sample: SampleTexture2D,
): [number, number, number, number] {
  // %0 declared air.arg_unused in !19 — kept in the signature for API fidelity.
  void position;

  // Accumulator for the 4-channel weighted sum.  We keep it as separate
  // scalars so every intermediate value is fp32-narrowed (matching the AIR
  // <4 x float> per-lane fmul/fadd semantics under fast-math).
  let accR = 0;
  let accG = 0;
  let accB = 0;
  let accA = 0;

  // Helper: sample the two paired texcoords and fold their weighted sum into
  // the accumulator.  Each fmul/fadd is fp32-narrowed with Math.fround so
  // this port matches the `<4 x float>` fast-math semantics of the AIR.
  const foldPair = (uvA: readonly [number, number], uvB: readonly [number, number], w: number): void => {
    // %A0 = air.sample_texture_2d.v4f32(tex, sampler, uvA, ...); %A1 = extractvalue ..., 0
    const a = sample(tex, uvA);
    // %B0 = air.sample_texture_2d.v4f32(tex, sampler, uvB, ...); %B1 = extractvalue ..., 0
    const b = sample(tex, uvB);
    // %S = fadd fast <4 x float> b, a
    const sR = Math.fround(Math.fround(b[0]) + Math.fround(a[0]));
    const sG = Math.fround(Math.fround(b[1]) + Math.fround(a[1]));
    const sB = Math.fround(Math.fround(b[2]) + Math.fround(a[2]));
    const sA = Math.fround(Math.fround(b[3]) + Math.fround(a[3]));
    // %M = fmul fast <4 x float> %S, <w, w, w, w>
    const mR = Math.fround(sR * w);
    const mG = Math.fround(sG * w);
    const mB = Math.fround(sB * w);
    const mA = Math.fround(sA * w);
    // %ACC = fadd fast <4 x float> prevACC, %M
    accR = Math.fround(accR + mR);
    accG = Math.fround(accG + mG);
    accB = Math.fround(accB + mB);
    accA = Math.fround(accA + mA);
  };

  // Pair 0: %1 <-> %13, weight w0.  Note: the IR emits this pair without
  // an initial add — `%32 = fmul(sum0, w0)` seeds the accumulator directly.
  // Since our accR/G/B/A start at 0, `0 + fmul(sum0, w0) == fmul(sum0, w0)`,
  // preserving the same fp32-final value.
  foldPair(uvPairs[0], uvPairs[12], W0);   // %27..%32
  foldPair(uvPairs[1], uvPairs[13], W1);   // %33..%39
  foldPair(uvPairs[2], uvPairs[14], W2);   // %40..%46
  foldPair(uvPairs[3], uvPairs[15], W3);   // %47..%53
  foldPair(uvPairs[4], uvPairs[16], W4);   // %54..%60
  foldPair(uvPairs[5], uvPairs[17], W5);   // %61..%67
  foldPair(uvPairs[6], uvPairs[18], W6);   // %68..%74
  foldPair(uvPairs[7], uvPairs[19], W7);   // %75..%81
  foldPair(uvPairs[8], uvPairs[20], W8);   // %82..%88
  foldPair(uvPairs[9], uvPairs[21], W9);   // %89..%95
  foldPair(uvPairs[10], uvPairs[22], W10); // %96..%102
  foldPair(uvPairs[11], uvPairs[23], W11); // %103..%109

  // %110 = extractelement <4 x float> %109, i64 3
  // %111 = air.fast_fmin.f32(%110, 1.000000e+00)
  // %112 = air.fast_fmax.f32(%111, 0.000000e+00)
  const clampedA = Math.fround(Math.max(0.0, Math.min(1.0, accA)));

  // %113 = insertelement <4 x float> %109, %112, i64 3
  return [accR, accG, accB, clampedA];
}
