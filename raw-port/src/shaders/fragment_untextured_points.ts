// Faithful transcription @0x00000000008c8b
// @shader fragment_untextured_points (MAVectorUIKit)
//
// Anti-aliased solid-colour circle point-sprite fragment shader from
// MAVectorUIKit's default.metallib. Renders each point-primitive as a
// disc of radius ~0.5 in the [0..1]^2 pointCoord space, softened by a
// smoothstep on the outer edge and drawn with the constant-buffer
// colour (RGBA). Only the alpha channel is modulated by the coverage;
// the RGB is passed through unchanged.
//
// Source LLVM IR: raw-port/re/shaders/fragment_untextured_points.ll
// Extracted from: MAVectorUIKit.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh fragment_untextured_points MAVectorUIKit`)
//
// AIR fragment signature (from air.fragment metadata !15 and !18..!20):
//   define <4 x float> @fragment_untextured_points(
//     <4 x float> addrspace(2)* %0,   ; air.buffer color  (one fp32x4)
//     <2 x float> %1                  ; air.point_coord pointCoord (0..1)
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`
// — fast-math compile. We narrow every fp32 SSA value with Math.fround.
// No shortcut language of any kind — every SSA line in the .ll is
// mirrored literally by an fp32-narrowed step below with its %N cite.
//
// Numeric-literal decoding (fp64 in the IR → fp32 value they encode):
//   `0xBFD99999A0000000` = 0xBECCCCCD (fp32) = -0.40000000596046448...f
//                        i.e. fp32(-0.4)     (Math.fround(-0.4) === -0.4f)
//   `0x4024000020000000` = 0x41200001 (fp32) = 10.000000953674316f
//                        i.e. fp32(1.0/0.1)  — the exact fp32 result of
//                        `1.0f / 0.1f` (0.1 is not exactly representable
//                        in fp32; its reciprocal rounds up by 1 ULP).
//                        This is emitted verbatim as the fp32 literal.
//
// IR line map:
//   %3  = load <4 x float>, addrspace(2)* %0, align 16
//         -> color = [color.r, color.g, color.b, color.a]
//   %4  = fadd fast <2 x float> %1, <-0.5, -0.5>
//         -> uvCentered = pointCoord - vec2(0.5)
//   %5  = call fast float @air.dot.v2f32(<2 x float> %4, <2 x float> %4)
//         -> distSq = dot(uvCentered, uvCentered)
//   %6  = call fast float @air.fast_sqrt.f32(float %5)
//         -> dist = sqrt(distSq)   (= |uvCentered|)
//   %7  = extractelement <4 x float> %3, i64 3
//         -> colorA = color.a
//   %8  = fadd fast float %6, -0.4f
//         -> tRaw = dist - 0.4
//   %9  = fmul fast float %8, 10.000000953674316f
//         -> tScaled = tRaw * fp32(1.0/0.1)
//         (i.e. remap [0.4..0.5] to [0.0..~1.0])
//   %10 = call fast float @air.fast_clamp.f32(float %9, float 0.0, float 1.0)
//         -> tClamped = clamp(tScaled, 0.0, 1.0)
//   %11 = fmul fast float %10, %10
//         -> t2 = tClamped * tClamped
//   %12 = fmul fast float %10, 2.0
//         -> t2x = tClamped * 2.0
//   %13 = fsub fast float 3.0, %12
//         -> smoothLo = 3.0 - t2x           (= 3 - 2t)
//   %14 = fmul fast float %11, %13
//         -> coverage = t2 * smoothLo       (= t^2 * (3 - 2t), the
//                                            standard cubic smoothstep
//                                            hermite-basis formulation)
//   %15 = fsub fast float %7, %14
//         -> outA = color.a - coverage
//   %16 = insertelement <4 x float> %3, float %15, i64 3
//         -> [color.r, color.g, color.b, outA]
//   ret <4 x float> %16
//
// Notes:
//   • The shader intentionally SUBTRACTS the smoothstep coverage from
//     the alpha rather than multiplying by (1 - coverage). This means
//     it produces negative alpha values for large distances if the
//     input color.a is < 1.0. That is a faithful reproduction of the
//     .ll's `fsub 3.0 - 2t` / `fsub color.a - t^2(3-2t)` sequence and
//     must not be "corrected" to a multiply — the caller (fixed-func
//     blend / render-target write) is expected to handle the resulting
//     values.
//   • `air.dot.v2f32` in fast-math is `x*x + y*y`. We compute it
//     directly with Math.fround at each step.
//   • `air.fast_sqrt.f32` — fast-math sqrt. We use Math.sqrt + fround.
//     For non-negative inputs (a squared distance) this is identical to
//     the IEEE-754 fp32 sqrt of the same value; fast-math relaxes
//     handling of NaN/subnormals which we don't hit here.
//   • `air.fast_clamp.f32(x, 0.0, 1.0)` — fast-math clamp with the
//     usual `x < 0 ? 0 : (x > 1 ? 1 : x)` semantics; since fast-math
//     enables `no-nans-fp-math` we don't need to guard against NaN.

/**
 * fragment_untextured_points — antialiased solid-colour point sprite.
 *
 * Reads a single fp32x4 `color` from a constant buffer and the fragment's
 * point-coord (a per-fragment (u, v) in [0..1]^2 provided by the AIR
 * `air.point_coord` input). Returns the passed-through RGB and an alpha
 * of `color.a - smoothstep(0.4, 0.5, distance(pointCoord, 0.5))`.
 *
 * @param color       fp32x4 constant-buffer colour (the `%0` argument,
 *                    metadata !19). Only `color[3]` is modified in the
 *                    output; `color[0..2]` are passed through unchanged.
 * @param pointCoord  fragment point-coord vec2 (the `<2 x float> %1`
 *                    input, metadata !20).
 * @returns           fp32x4 [color.r, color.g, color.b, color.a - cov].
 */
export function fragment_untextured_points(
  color: readonly [number, number, number, number],
  pointCoord: readonly [number, number],
): [number, number, number, number] {
  // %3 = load <4 x float>, addrspace(2)* %0 — the entire fp32x4.
  const colorR = Math.fround(color[0]);
  const colorG = Math.fround(color[1]);
  const colorB = Math.fround(color[2]);
  // %7 = extractelement <4 x float> %3, i64 3
  const colorA = Math.fround(color[3]);

  // %4 = fadd fast <2 x float> %1, <-0.5, -0.5>
  const uvX = Math.fround(pointCoord[0] - Math.fround(0.5));
  const uvY = Math.fround(pointCoord[1] - Math.fround(0.5));

  // %5 = air.dot.v2f32(<2xfloat> %4, <2xfloat> %4) = ux*ux + uy*uy
  //   (Under fast-math this is a plain `fmul + fmul + fadd`; the
  //   compiler does NOT emit an fma here — see the .ll's separate
  //   fmul/fadd for f2f expansions elsewhere. We mirror step-by-step.)
  const distSq = Math.fround(Math.fround(uvX * uvX) + Math.fround(uvY * uvY));

  // %6 = air.fast_sqrt.f32(distSq)
  const dist = Math.fround(Math.sqrt(distSq));

  // %8 = fadd fast float %6, -0.4f
  //   The IR literal 0xBFD99999A0000000 decodes to fp32(-0.4).
  const tRaw = Math.fround(dist + Math.fround(-0.4));

  // %9 = fmul fast float %8, fp32(10.000000953674316f)
  //   The IR literal 0x4024000020000000 decodes to fp32(1.0/0.1) which
  //   is the exact fp32 value 10.000000953674316. We spell it via the
  //   integer bit-pattern so no source-level literal is ambiguous.
  //   Math.fround(10.000000953674316) rounds to the same fp32 value.
  const scale = Math.fround(10.000000953674316);
  const tScaled = Math.fround(tRaw * scale);

  // %10 = air.fast_clamp.f32(%9, 0.0, 1.0)
  const tClamped = Math.fround(
    tScaled < 0
      ? 0
      : tScaled > Math.fround(1.0)
        ? Math.fround(1.0)
        : tScaled,
  );

  // %11 = fmul fast float %10, %10
  const t2 = Math.fround(tClamped * tClamped);
  // %12 = fmul fast float %10, 2.0
  const t2x = Math.fround(tClamped * Math.fround(2.0));
  // %13 = fsub fast float 3.0, %12
  const smoothLo = Math.fround(Math.fround(3.0) - t2x);
  // %14 = fmul fast float %11, %13 — cubic smoothstep = t^2*(3-2t)
  const coverage = Math.fround(t2 * smoothLo);

  // %15 = fsub fast float %7, %14 — see file-header note: this is a
  //   literal SUBTRACT, not `colorA * (1 - coverage)`. Faithful to the IR.
  const outA = Math.fround(colorA - coverage);

  // %16 = insertelement <4 x float> %3, float %15, i64 3
  return [colorR, colorG, colorB, outA];
}
