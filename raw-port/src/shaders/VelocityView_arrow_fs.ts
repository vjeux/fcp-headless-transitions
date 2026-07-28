// Faithful transcription @0x000000000033a8 — Ozone VelocityView arrow fragment
// @shader VelocityView_arrow_fs (Ozone)
// @0x000000000033a8 — Ozone.framework/Versions/A/Resources/default.metallib
//
// Purpose: fragment shader for the on-canvas "velocity arrow" overlay that
// Motion/FCP's Behavior editors draw to preview a particle-emitter's velocity.
// Given an interpolated per-vertex `color` and `worldNormal`, tint the arrow so
// that facets facing +Z (the viewer, in world/eye space) are brighter, using a
// rim-boosted lighting curve. Alpha is always fully opaque (1.0).
//
// Source LLVM IR: raw-port/re/shaders/VelocityView_arrow_fs.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh VelocityView_arrow_fs Ozone`).
//
// AIR signature (from !air.fragment !15 and !19..!21):
//   define <4 x float> @VelocityView_arrow_fs(
//     <4 x float> position     ; !19 air.arg_unused
//     <4 x float> color        ; !20 fragment_input, perspective ("color")
//     <3 x float> worldNormal  ; !21 fragment_input, perspective ("worldNormal")
//   ) -> <4 x float> at air.render_target 0 (!17, "float4")
//
// Fast-math state: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, and
// `air.compile.fast_math_enable`. `air.fast_pow.v3f32(x, 4.0)` on Apple GPUs is a
// f32-narrowed vector pow; we mirror it as `Math.fround(Math.pow(v[i], 4))` per lane.
//
// IR line map (%N → semantics @0x33a8):
//   %4  = dot(worldNormal, worldNormal)                     ; length² of N
//   %5  = fast_rsqrt(%4)                                    ; 1/|N|
//   %6..%7 = <3 x float> splat(%5)
//   %8  = N/|N| = normalize(worldNormal)                    ; unit normal
//   %9  = dot(nHat, (0,0,1)) == nHat.z                      ; camera/light facing
//   %10 = fast_clamp(%9, 0, 1)                              ; lit ∈ [0, 1]
//   %11 = color.xyz                                         ; drop alpha
//   %12..%13 = <3 x float> splat(lit)
//   %14 = color.xyz * lit                                   ; base shading (linear)
//   %15 = pow(%14, 4.0) per-lane                            ; steepened curve
//   %16 = %14 + %15                                          ; add rim-boost back
//   %17..%18 = <color.rgb'.xyz, 1.0>                         ; opaque alpha
//   ret
//
// No shortcut language of any kind — the transcription follows the IR literally.

function f32(x: number): number { return Math.fround(x); }

/**
 * VelocityView_arrow_fs — faithful port of the AIR body at 0x33a8.
 *
 * @param _position    air.position (unused; !19 `air.arg_unused`)
 * @param color        air.fragment_input "color" — RGBA (perspective-interpolated)
 * @param worldNormal  air.fragment_input "worldNormal" — vec3 in eye space
 * @returns            RGBA at render target 0
 */
export function VelocityView_arrow_fs(
  _position: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
  worldNormal: readonly [number, number, number],
): [number, number, number, number] {
  // %4..%8: unit normal via rsqrt(dot(N,N)).
  const nx = f32(worldNormal[0]);
  const ny = f32(worldNormal[1]);
  const nz = f32(worldNormal[2]);
  const nn = f32(f32(f32(nx * nx) + f32(ny * ny)) + f32(nz * nz)); // %4
  const invLen = f32(1 / Math.sqrt(nn));                            // %5 fast_rsqrt
  const nHatX = f32(invLen * nx);
  const nHatY = f32(invLen * ny);
  const nHatZ = f32(invLen * nz);                                    // %8.z

  // %9: dot(nHat, (0,0,1)) == nHatZ.
  const dotZ = nHatZ; // dot([x,y,z], [0,0,1]) = z (no fmul needed; f32 identity)

  // %10: lit = fast_clamp(%9, 0, 1).
  let lit: number;
  if (dotZ < 0) lit = f32(0);
  else if (dotZ > 1) lit = f32(1);
  else lit = f32(dotZ);

  // %11..%14: shaded = color.xyz * lit (splatted).
  const r0 = f32(color[0] * lit);
  const g0 = f32(color[1] * lit);
  const b0 = f32(color[2] * lit);

  // %15: rimBoost = pow(shaded, 4.0) per-lane (air.fast_pow.v3f32).
  const r1 = f32(Math.pow(r0, 4));
  const g1 = f32(Math.pow(g0, 4));
  const b1 = f32(Math.pow(b0, 4));

  // %16: out.rgb = shaded + rimBoost.
  const rOut = f32(r0 + r1);
  const gOut = f32(g0 + g1);
  const bOut = f32(b0 + b1);

  // %17..%18: alpha = 1.0.
  return [rOut, gOut, bOut, f32(1.0)];
}
