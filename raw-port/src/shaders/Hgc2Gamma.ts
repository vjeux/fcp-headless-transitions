// @shader Hgc2Gamma (Helium) — .ll header offset @0x00000000004872
//
// Metal fragment shader from Helium's HgcRender pixel-math library.
// Applies a per-channel gamma to a premultiplied RGBA texel while:
//   1) preserving the SIGN of every input channel (so negative "extended"
//      linear values survive the pow — pow itself only sees magnitude), and
//   2) unpremultiplying by |alpha| (clamped to 1e-6) around the pow, so the
//      gamma acts on the un-premultiplied RGB and the result is re-premult'd.
//
// Source LLVM IR: raw-port/re/shaders/Hgc2Gamma.ll
// Extracted from: Helium.framework/Versions/A/Resources/
//                   HeliumRenderHgcMetalShaders_derived.metallib
// (via `bash raw-port/tools/shader_disasm.sh Hgc2Gamma Helium`)
//
// AIR signature (from the .ll):
//   define <4 x float> @Hgc2Gamma(
//     <4 x float> %0,   // position   (fragment coord — unused)
//     <4 x float> %1,   // texcoord0
//     texture2d   %2,   // texture0
//     sampler     %3,   // sampler0
//     float4*     %4    // params (constant-address-space buffer)
//   )
//
// Function attributes: `unsafe-fp-math`, `no-signed-zeros-fp-math`,
// `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`. Note `no-nans-fp-math`/`no-infs-fp-math`
// are set to "false" here, so unlike most Hgc shaders the compiler is
// allowed to preserve NaN/Inf semantics; the shader still runs under
// Metal fast-math for reassociation and reciprocal-pow. This port uses
// plain JS Number arithmetic (already IEEE-754 fp64) narrowed with
// Math.fround at every stored intermediate for f32 fidelity.
//
// Params layout, decoded from the .ll:
//   params = <4 x float> loaded from address-space(2) buffer %4
//   params[0..3] is the per-channel gamma EXPONENT vector passed straight
//   to `air.fast_pow.v4f32`. In FCP's HGColor gamma nodes the CPU-side
//   builder packs the same exponent into all four lanes for a scalar
//   gamma, or per-channel exponents for a channel-specific gamma. This
//   shader is fp32-transparent to that choice — it just calls pow.v4f32.
//
// IR line map (from the .ll body):
//   %6  load <4xf32> from params buffer               -> gammaExp = params
//   %7  shufflevector texcoord0, poison, <0,1>        -> uv = (uvX, uvY)
//   %8  air.sample_texture_2d.v4f32(tex, sampler, uv, // enable_offset=true,
//         zero offset, no LOD, sampler-flags=0)       -> {texel, status}
//   %9  extractvalue %8, 0                            -> texel (signed RGBA)
//
//   %10 air.fast_fabs.v4f32(texel)                    -> absTexel = |texel|
//   %11 shufflevector absTexel, poison, <3,3,3>       -> [|A|, |A|, |A|]
//   %12 air.fast_fmax.v3f32(
//         [|A|,|A|,|A|],
//         <0x3EB0C6F7A0000000, 0x3EB0C6F7A0000000,
//          0x3EB0C6F7A0000000>)                       -> [maxA,maxA,maxA]
//         The 0x3EB0C6F7A0000000 double literal decodes to
//         9.999999974752427e-07 — the fp32 value of 1e-6. Fp32-narrowed the
//         value is unchanged (this is a bit-exact f32 constant).
//   %13 shufflevector %12, poison, <0,1,2,undef>      -> [maxA,maxA,maxA,?]
//   %14 insertelement %13, float 1.0, i64 3           -> [maxA,maxA,maxA,1]
//   %15 fdiv fast absTexel, %14
//                                                     -> [|R|/maxA, |G|/maxA,
//                                                         |B|/maxA, |A|/1]
//                                                     = unpremultiplied |RGB|
//                                                       and lane 3 = |A|
//   %16 air.fast_pow.v4f32(%15, gammaExp)             -> pow(|RGB|/maxA,
//                                                              gammaExp)
//                                                       per channel (lane 3
//                                                       is pow(|A|, gammaExp[3])
//                                                       and is discarded)
//   %17 shufflevector %15, poison, <3,3,3>            -> [|A|, |A|, |A|]
//                                                       (lane 3 of %15 == |A|)
//   %18 shufflevector %16, poison, <0,1,2>            -> pow-RGB (3 lanes)
//   %19 fmul fast <3xf32> %17, %18                    -> |A| * pow(...)
//                                                       (re-premultiplied RGB)
//   %20 shufflevector %19, poison, <0,1,2,undef>      -> [premR,premG,premB,?]
//   %21 shufflevector %20, %15, <0,1,2,7>             -> [premR,premG,premB,
//                                                         |A|]
//                                                       (lane 3 from %15[3])
//   %22 fsub fast <-0.0,-0.0,-0.0,-0.0>, %21          -> negated result
//   %23 fcmp fast olt %9, zeroinitializer             -> mask: texel[i] < 0
//   %24 select %23, %22, %21                          -> restore sign per lane
//   ret <4xf32> %24

/**
 * The RGBA texel produced by sampling `texture0` at `uv` — modeled as a
 * length-4 tuple of f32 lanes.
 */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f32(tex, sampler, uv, ...)` intrinsic. The
 * offset/LOD arguments in the IR are all zeros or defaults in this
 * shader, so the callback signature strips them for clarity — a host
 * that needs to model them can wrap.
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * Params buffer for `@Hgc2Gamma`, four f32 lanes as loaded by the .ll's
 * `load <4 x float>` from address-space(2) `%4`.
 *
 * Lane order (see file header):
 *   0..3: per-channel gamma exponent passed to `air.fast_pow.v4f32`.
 */
export type Hgc2GammaParams = readonly [number, number, number, number];

/**
 * fmax epsilon guarding the unpremultiply divide, from the .ll's
 *   <float 0x3EB0C6F7A0000000, ...>
 * The literal decodes to 9.999999974752427e-07 — the fp32 value of 1e-6.
 * Cast to fp32 the value is unchanged (bit-exact f32).
 */
const ALPHA_MIN_EPS: number = Math.fround(9.999999974752427e-07);

/**
 * `@Hgc2Gamma` — Helium Metal fragment shader.
 *
 * See file header for the full IR-line-to-code map. Faithful transcription
 * of the .ll body; every op mirrors the IR.
 *
 * @param position  fragment position (AIR `<4 x float> %0`) — unused
 * @param texcoord0 texture coordinate (AIR `<4 x float> %1`); .xy is the
 *                  sample uv
 * @param texture0  opaque texture handle passed straight to `sample`
 * @param params    4-lane gamma exponent buffer (see Hgc2GammaParams)
 * @param sample    caller-supplied texture-sampling callback modeling
 *                  `air.sample_texture_2d.v4f32`
 * @returns         signed-preserving gamma-corrected RGBA texel
 */
export function Hgc2Gamma(
  _position: readonly [number, number, number, number],
  texcoord0: readonly [number, number, number, number],
  texture0: unknown,
  params: Hgc2GammaParams,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %6 = load <4xf32> params — read all four gamma-exponent lanes.
  const gammaR: number = Math.fround(params[0]);
  const gammaG: number = Math.fround(params[1]);
  const gammaB: number = Math.fround(params[2]);
  const gammaA: number = Math.fround(params[3]);

  // %7 = shufflevector texcoord0, poison, <0,1>
  const uv: [number, number] = [
    Math.fround(texcoord0[0]),
    Math.fround(texcoord0[1]),
  ];
  // %8/%9 = air.sample_texture_2d.v4f32(tex, sampler, uv, ...)
  const texel: ShaderTexel = sample(texture0, uv);
  const tR: number = Math.fround(texel[0]);
  const tG: number = Math.fround(texel[1]);
  const tB: number = Math.fround(texel[2]);
  const tA: number = Math.fround(texel[3]);

  // %10 = air.fast_fabs.v4f32(texel) — Math.abs is bit-exact for f32.
  const aR: number = Math.fround(Math.abs(tR));
  const aG: number = Math.fround(Math.abs(tG));
  const aB: number = Math.fround(Math.abs(tB));
  const aA: number = Math.fround(Math.abs(tA));

  // %11 = shufflevector abs, poison, <3,3,3>       — broadcast lane 3.
  // %12 = air.fast_fmax.v3f32([aA,aA,aA],
  //         [ALPHA_MIN_EPS, ALPHA_MIN_EPS, ALPHA_MIN_EPS])
  //   Under fast-math (no-nans) fmax collapses to Math.max on ordered
  //   inputs. All three broadcast lanes carry the same aA, so we compute
  //   the scalar once.
  const maxA: number = Math.fround(Math.max(aA, ALPHA_MIN_EPS));

  // %13/%14 = the divisor vector [maxA, maxA, maxA, 1.0]
  // %15 = fdiv fast absTexel, [maxA, maxA, maxA, 1.0]
  const uR: number = Math.fround(aR / maxA);
  const uG: number = Math.fround(aG / maxA);
  const uB: number = Math.fround(aB / maxA);
  const uA: number = Math.fround(aA /* / 1.0 */);
  // Note lane 3 of %15 is exactly |A| (aA), which is what %17 later reads.

  // %16 = air.fast_pow.v4f32(%15, gammaExp)
  //   Repo-canonical mapping for air.fast_pow.f32 is Math.fround(Math.pow).
  //   Vector pow is elementwise. Lane 3 (pow(uA, gammaA)) is computed but
  //   later discarded by the shuffle in %18; we still spell it out so the
  //   transcription mirrors the IR — a JS engine will DCE it.
  const pR: number = Math.fround(Math.pow(uR, gammaR));
  const pG: number = Math.fround(Math.pow(uG, gammaG));
  const pB: number = Math.fround(Math.pow(uB, gammaB));
  const _pA: number = Math.fround(Math.pow(uA, gammaA));

  // %17 = shufflevector %15, poison, <3,3,3>       — [uA, uA, uA]
  //   uA == aA by construction (see divisor lane 3 = 1.0).
  // %18 = shufflevector %16, poison, <0,1,2>       — [pR, pG, pB]
  // %19 = fmul fast <3xf32> %17, %18               — re-premultiply RGB.
  const premR: number = Math.fround(uA * pR);
  const premG: number = Math.fround(uA * pG);
  const premB: number = Math.fround(uA * pB);

  // %20 = shufflevector %19, poison, <0,1,2,undef> — [premR,premG,premB,?]
  // %21 = shufflevector %20, %15, <0,1,2,7>        — lane 3 = %15[3] = uA (=|A|)
  const r21_r: number = premR;
  const r21_g: number = premG;
  const r21_b: number = premB;
  const r21_a: number = uA;

  // %22 = fsub fast <-0.0,-0.0,-0.0,-0.0>, %21 — negation of %21.
  // %23 = fcmp fast olt %9, zeroinitializer    — texel[i] < 0 (ordered LT).
  // %24 = select %23, %22, %21                 — restore sign per lane.
  //
  // Ordered `<` in JS: `x < 0` is false for NaN, matching AIR `olt`.
  // For -0 the compare `-0 < 0` is false (matching IEEE `olt`), so a
  // -0 input keeps its lane sign-unchanged — the shader is a signed-
  // magnitude gamma.
  const outR: number = tR < 0 ? Math.fround(-r21_r) : r21_r;
  const outG: number = tG < 0 ? Math.fround(-r21_g) : r21_g;
  const outB: number = tB < 0 ? Math.fround(-r21_b) : r21_b;
  const outA: number = tA < 0 ? Math.fround(-r21_a) : r21_a;

  // ret <4xf32> %24
  return [outR, outG, outB, outA];
}
