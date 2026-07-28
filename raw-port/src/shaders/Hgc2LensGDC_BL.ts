// @shader Hgc2LensGDC_BL (Helium) — .ll header offset @0x00000000000672
//
// Metal fragment shader from Helium's HgcRender pixel-math library.
// "Lens Geometric Distortion Correction — Bilinear" — computes a radial
// distortion of the fragment's texture coordinate about a lens center
// (cx, cy) using a scalar 14th-degree even/odd polynomial in the
// magnitude-of-radius space, then samples the source texture at the
// distorted uv. Bilinear sampling comes from the AIR sampler configured
// with the embedded 2632-magic `__air_sampler_state`.
//
// Source LLVM IR: raw-port/re/shaders/Hgc2LensGDC_BL.ll
// Extracted from: Helium.framework/Versions/A/Resources/
//                   HeliumRenderHgcMetalShaders_derived.metallib
// (via `bash raw-port/tools/shader_disasm.sh Hgc2LensGDC_BL Helium`)
//
// AIR signature (from the .ll):
//   define <4 x float> @Hgc2LensGDC_BL(
//     <4 x float>              %0,  // position (unused)
//     <4 x float>              %1,  // texcoord0
//     LensGDCShaderParameters* %2,  // parameters (constant-address-space, 84B)
//     texture2d                %3   // inTexture
//   )
//
// air.struct_type_info spelled out in metadata !21:
//   struct LensGDCShaderParameters {
//     float cx;                //  @0
//     float cy;                //  @4
//     float oneOverM;          //  @8
//     float k[15];             //  @12  (fifteen f32 coefficients)
//     float minRadius;         //  @72
//     float maxRadius;         //  @76
//     bool  reciprocalScaling; //  @80  (i8, range !36 = {0,1})
//   };  // total 84 bytes (align 4)
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`,
// `air.compile.denorms_disable`, `air.compile.fast_math_enable` — Metal
// fast-math. This port uses plain JS Number arithmetic (already IEEE-754
// fp64) narrowed with Math.fround at every stored intermediate for f32.
//
// Polynomial evaluation — this is a Horner-style nested-multiply-by-r4
// polynomial in the clamped radius. Let s = clamp(r * oneOverM, minR,
// maxR), s2 = s*s, s3 = s*s*s, s4 = s2*s2. Group the 15 coefficients as
// four dense "quads" over the basis [1, s, s^2, s^3] plus a trailing
// triple over [1, s, s^2] (from !21's k[15] flat array chopped into vec4,
// vec4, vec4, vec3):
//   P1 = dot(k[0..3],  [1, s, s^2, s^3])   // %83
//   P2 = dot(k[4..7],  [1, s, s^2, s^3])   // %80
//   P3 = dot(k[8..11], [1, s, s^2, s^3])   // %77
//   P4 = dot(k[12..14], [1, s, s^2])       // %75
//   T  = ((P4 * s4 + P3) * s4 + P2) * s4 + P1   // %76..%84
// T is the scalar distortion factor. If reciprocalScaling == false the
// distorted delta is delta * T; otherwise it's delta / T. Then add the
// lens center back and offset by +0.5 (%7) to remap into UV space.
//
// IR line map for the outer function @Hgc2LensGDC_BL:
//   %5  shufflevector texcoord0, poison, <0,1>       -> uv = (uvX, uvY)
//   %6  tail call fastcc gdc(params, uv)             -> distorted delta+center
//   %7  fadd fast %6, <0.5, 0.5>                     -> sample_uv
//   %8  air.sample_texture_2d.v4f32(inTexture,
//         @__air_sampler_state, sample_uv, i1 true,
//         zero offset, i1 false, 0.0, 0.0, i32 0)    -> {texel, status}
//   %9  extractvalue %8, 0                           -> texel (rgba)
//   %10 insertelement %9, 1.0, i64 3                 -> force alpha = 1
//   ret <4xf32> %10
//
// IR line map for the internal fastcc @gdc:
//   %3..%8   loads cx (@0) and cy (@4) — center = (cx, cy)     ; %8 vec2
//   %9..%10  loads oneOverM (@8)
//   %11..%22 loads k[0..3] into a <4xf32>   -> k0_3            ; %22
//   %23..%34 loads k[4..7] into a <4xf32>   -> k4_7            ; %34
//   %35..%46 loads k[8..11] into a <4xf32>  -> k8_11           ; %46
//   %47..%55 loads k[12..14] into a <3xf32> -> k12_14          ; %55
//   %56..%57 loads minRadius (@72)
//   %58..%59 loads maxRadius (@76)
//   %60..%61 loads reciprocalScaling (@80) as i8
//   %62 icmp eq i8 %61, 0                    -> reciprocal FALSE?
//                                              (i.e. multiply branch)
//   %63 fsub fast <2xf32> uv, center         -> delta
//   %64 air.dot.v2f32(delta, delta)          -> r^2
//   %65 air.fast_sqrt.f32(%64)               -> r
//   %66 fmul r, oneOverM                     -> rScaled
//   %67 air.fast_clamp.f32(rScaled, minR, maxR) -> s
//   %68 fmul s, s                            -> s2
//   %69 fmul s2, s                           -> s3
//   %70 fmul s2, s2                          -> s4
//   %71 <4xf32>{1.0, s,   ?,   ?}
//   %72 %71 with lane 2 = s2                 -> {1, s, s2, ?}
//   %73 %72 with lane 3 = s3                 -> {1, s, s2, s3}   (basis4)
//   %74 shufflevector %72, poison, <0,1,2>   -> {1, s, s2}       (basis3)
//   %75 air.dot.v3f32(k12_14, basis3)        -> P4
//   %76 fmul s4, P4                          -> P4 * s4
//   %77 air.dot.v4f32(k8_11, basis4)         -> P3
//   %78 fadd %76, P3                         -> P4*s4 + P3
//   %79 fmul %78, s4                         -> (P4*s4 + P3) * s4
//   %80 air.dot.v4f32(k4_7, basis4)          -> P2
//   %81 fadd %79, %80                        -> above + P2
//   %82 fmul %81, s4                         -> * s4
//   %83 air.dot.v4f32(k0_3, basis4)          -> P1
//   %84 fadd %82, P1                         -> T
//   %85 insertelement <2xf32> undef, T, i64 0
//   %86 shufflevector %85, poison, <0, 0>    -> [T, T]
//   br %62 -> label 89 (multiply) : label 87 (divide)
//   ; --- 87: reciprocalScaling == true — divide ---
//   %88 fdiv fast <2xf32> delta, [T, T]      -> delta / T
//   ; --- 89: reciprocalScaling == false — multiply ---
//   %90 fmul fast <2xf32> [T, T], delta      -> T * delta
//   ; --- 91: join ---
//   %92 phi <2xf32> [ %88, 87 ], [ %90, 89 ]
//   %93 fadd fast <2xf32> %92, center        -> + center
//   ret <2xf32> %93

/**
 * The RGBA texel produced by sampling `inTexture` at `uv` — modeled as a
 * length-4 tuple of f32 lanes.
 */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f32(tex, sampler, uv, ...)` intrinsic. The
 * sampler used here is the built-in bilinear state
 * (@__air_sampler_state).
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * LensGDCShaderParameters — the 84-byte constant buffer laid out by
 * !21 in the .ll. Field names and offsets match the AIR metadata.
 */
export interface LensGDCShaderParameters {
  /** Lens optical-center X in texcoord space (offset @0). */
  readonly cx: number;
  /** Lens optical-center Y in texcoord space (offset @4). */
  readonly cy: number;
  /** Inverse magnification scaling applied to radius before clamp (offset @8). */
  readonly oneOverM: number;
  /** 15 polynomial coefficients in the radius basis (offsets @12..@68). */
  readonly k: readonly [
    number, number, number, number, number,
    number, number, number, number, number,
    number, number, number, number, number,
  ];
  /** Lower clamp on the pre-poly radius (offset @72). */
  readonly minRadius: number;
  /** Upper clamp on the pre-poly radius (offset @76). */
  readonly maxRadius: number;
  /**
   * When true, the distorted delta is `delta / T`; when false, it is
   * `T * delta` (offset @80, i8 range {0,1}).
   */
  readonly reciprocalScaling: boolean;
}

/**
 * `@gdc` — the internal fastcc helper that returns the distorted uv (in
 * texcoord units, before the +0.5 offset). Exported for testability;
 * the outer shader just adds 0.5 and samples.
 *
 * See file header for the full IR-line-to-code map.
 */
export function gdc(
  params: LensGDCShaderParameters,
  uv: readonly [number, number],
): [number, number] {
  // %4/%7 = load cx, cy — center = (cx, cy)
  const cx: number = Math.fround(params.cx);
  const cy: number = Math.fround(params.cy);

  // %10 = load oneOverM
  const oneOverM: number = Math.fround(params.oneOverM);

  // %12..%22 = load k[0..3]
  const k0: number = Math.fround(params.k[0]);
  const k1: number = Math.fround(params.k[1]);
  const k2: number = Math.fround(params.k[2]);
  const k3: number = Math.fround(params.k[3]);
  // %23..%34 = load k[4..7]
  const k4: number = Math.fround(params.k[4]);
  const k5: number = Math.fround(params.k[5]);
  const k6: number = Math.fround(params.k[6]);
  const k7: number = Math.fround(params.k[7]);
  // %35..%46 = load k[8..11]
  const k8: number = Math.fround(params.k[8]);
  const k9: number = Math.fround(params.k[9]);
  const k10: number = Math.fround(params.k[10]);
  const k11: number = Math.fround(params.k[11]);
  // %47..%55 = load k[12..14]
  const k12: number = Math.fround(params.k[12]);
  const k13: number = Math.fround(params.k[13]);
  const k14: number = Math.fround(params.k[14]);

  // %57 = load minRadius, %59 = load maxRadius
  const minRadius: number = Math.fround(params.minRadius);
  const maxRadius: number = Math.fround(params.maxRadius);
  // %61/%62 = load reciprocalScaling and test == 0 (i.e. multiply branch).
  const reciprocalScaling: boolean = params.reciprocalScaling;

  // %63 = fsub fast <2xf32> uv, center
  const deltaX: number = Math.fround(Math.fround(uv[0]) - cx);
  const deltaY: number = Math.fround(Math.fround(uv[1]) - cy);
  // %64 = air.dot.v2f32(delta, delta) — dx*dx + dy*dy under fast-math.
  const r2: number = Math.fround(Math.fround(deltaX * deltaX) + Math.fround(deltaY * deltaY));
  // %65 = air.fast_sqrt.f32(r2)  — Math.sqrt narrowed to f32.
  const r: number = Math.fround(Math.sqrt(r2));
  // %66 = fmul r, oneOverM
  const rScaled: number = Math.fround(r * oneOverM);
  // %67 = air.fast_clamp.f32(rScaled, minR, maxR). Under fast-math
  //   (no-nans) fast_clamp is Math.min(Math.max(x, lo), hi). AIR
  //   fast_clamp assumes lo <= hi (the CPU builder guarantees it).
  const s: number = Math.fround(Math.min(Math.max(rScaled, minRadius), maxRadius));
  // %68/%69/%70 = s^2, s^3, s^4
  const s2: number = Math.fround(s * s);
  const s3: number = Math.fround(s2 * s);
  const s4: number = Math.fround(s2 * s2);

  // Bases used by the polynomial:
  //   basis4 = [1, s, s2, s3]      // for dot with k0_3, k4_7, k8_11
  //   basis3 = [1, s, s2]          // for dot with k12_14

  // %75 = air.dot.v3f32(k12_14, [1, s, s2]) — P4
  const P4: number = Math.fround(
    Math.fround(Math.fround(k12 * 1.0) + Math.fround(k13 * s)) + Math.fround(k14 * s2),
  );
  // %77 = air.dot.v4f32(k8_11, [1, s, s2, s3]) — P3
  const P3: number = Math.fround(
    Math.fround(
      Math.fround(Math.fround(k8 * 1.0) + Math.fround(k9 * s)) + Math.fround(k10 * s2),
    ) + Math.fround(k11 * s3),
  );
  // %80 = air.dot.v4f32(k4_7, [1, s, s2, s3]) — P2
  const P2: number = Math.fround(
    Math.fround(
      Math.fround(Math.fround(k4 * 1.0) + Math.fround(k5 * s)) + Math.fround(k6 * s2),
    ) + Math.fround(k7 * s3),
  );
  // %83 = air.dot.v4f32(k0_3, [1, s, s2, s3]) — P1
  const P1: number = Math.fround(
    Math.fround(
      Math.fround(Math.fround(k0 * 1.0) + Math.fround(k1 * s)) + Math.fround(k2 * s2),
    ) + Math.fround(k3 * s3),
  );

  // %76 = P4 * s4
  // %78 = P4 * s4 + P3
  // %79 = above * s4
  // %81 = above + P2
  // %82 = above * s4
  // %84 = above + P1 = T
  const step1: number = Math.fround(Math.fround(P4 * s4) + P3);
  const step2: number = Math.fround(Math.fround(step1 * s4) + P2);
  const T: number = Math.fround(Math.fround(step2 * s4) + P1);

  // %85/%86 = broadcast T into <2xf32>. Both branches operate lane-wise.
  //
  // The .ll's `icmp eq i8 reciprocalScaling, 0` -> branch to the multiply
  // block when reciprocalScaling is false. We spell that out directly.
  let distX: number;
  let distY: number;
  if (!reciprocalScaling) {
    // --- 89: multiply branch (%90 = T * delta) ---
    distX = Math.fround(T * deltaX);
    distY = Math.fround(T * deltaY);
  } else {
    // --- 87: divide branch (%88 = delta / T) ---
    distX = Math.fround(deltaX / T);
    distY = Math.fround(deltaY / T);
  }
  // %93 = distorted-delta + center — the returned pre-offset uv.
  return [Math.fround(distX + cx), Math.fround(distY + cy)];
}

/**
 * `@Hgc2LensGDC_BL` — Helium Metal fragment shader.
 *
 * See file header for the full IR-line-to-code map.
 *
 * @param position   fragment position (AIR `<4 x float> %0`) — unused
 * @param texcoord0  texture coordinate (AIR `<4 x float> %1`); .xy is uv
 * @param parameters LensGDC constant buffer (see LensGDCShaderParameters)
 * @param inTexture  opaque texture handle passed straight to `sample`
 * @param sample     caller-supplied texture-sampling callback modeling
 *                   `air.sample_texture_2d.v4f32` with the AIR bilinear
 *                   `@__air_sampler_state` sampler
 * @returns          RGBA texel from the distorted uv (alpha forced to 1)
 */
export function Hgc2LensGDC_BL(
  _position: readonly [number, number, number, number],
  texcoord0: readonly [number, number, number, number],
  parameters: LensGDCShaderParameters,
  inTexture: unknown,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %5 = shufflevector texcoord0, poison, <0,1>
  const uv: [number, number] = [
    Math.fround(texcoord0[0]),
    Math.fround(texcoord0[1]),
  ];
  // %6 = tail call fastcc gdc(params, uv)
  const distorted: [number, number] = gdc(parameters, uv);
  // %7 = fadd fast %6, <0.5, 0.5>
  const sampleUv: [number, number] = [
    Math.fround(distorted[0] + 0.5),
    Math.fround(distorted[1] + 0.5),
  ];
  // %8/%9 = air.sample_texture_2d.v4f32(inTexture, sampler, sampleUv, ...)
  const texel: ShaderTexel = sample(inTexture, sampleUv);
  // %10 = insertelement %9, 1.0, i64 3 — force alpha lane to 1.0.
  return [
    Math.fround(texel[0]),
    Math.fround(texel[1]),
    Math.fround(texel[2]),
    Math.fround(1.0),
  ];
}
