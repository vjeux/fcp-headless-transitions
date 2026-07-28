// @shader AALineCapFragmentFunc (MDPKit)
// @0x0000000001bd56 — MDPKit.framework/Versions/A/Resources/default.metallib
//
// Anti-aliased line-cap fragment shader from MDPKit's MDPAALine.metal source
// (frame @DISubprogram !43 line 167, source file MDPAALine.metal). Draws the
// ROUND CAP at the endpoint of a stroked line: sample the "brush" body texture
// and the "brushCap" cap texture at the two input texcoords, take the per-lane
// MIN of the two texel colors (so the cap punches the body down to zero where
// the cap alpha is 0 — the cap is a stencil), multiply by the input color, then
// apply the pipeline's colorspace gamma (unpremultiply → per-channel pow(., γ) →
// premultiply) so subsequent blending is gamma-correct.
//
// Source LLVM IR: raw-port/re/shaders/AALineCapFragmentFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh AALineCapFragmentFunc MDPKit`).
//
// AIR signature (from air.fragment !29 and !33..!42):
//   define <{ <4 x float> }> @AALineCapFragmentFunc(
//     <4 x float> position                                             ; !33 unused
//     <4 x float> color                                                ; !34 fragment input (perspective)
//     <2 x float> brushTexCoord                                        ; !35 fragment input
//     <2 x float> brushCapTexCoord                                     ; !36 fragment input
//     constant MDPAALineUniforms* uniforms   [80 bytes, align 16]      ; !37
//     texture2d<float, sample> brush                                    ; !39
//     texture2d<float, sample> brushCap                                 ; !40
//     sampler brushSampler                                              ; !41
//     sampler brushCapSampler                                           ; !42
//   ) -> struct { float4 color } (single render target 0, RGBA float)
//
// MDPAALineUniforms layout (from !38 — 80 bytes, 16-byte aligned):
//   +0   float4x4 mvp                    (unused in this fragment)
//   +64  float2   gamma                  (only gamma.y is read: the pow exponent)
//   +72  uint     stipplePattern         (unused in this fragment)
//   +76  float    stippleScale           (unused in this fragment)
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, and
// `air.compile.fast_math_enable`. The IR uses `fast_fmin` / `fast_fmax` /
// `fast_pow` — the "fast" prefix authorizes IEEE-non-strict rewrites (finite
// operands, no signed-zero, associativity). Fidelity note: `air.fast_pow.f32`
// is Metal's fast-math pow — we mirror as `Math.fround(Math.pow(x, y))`,
// per shaders porting guidance (Math.fround on the result narrows back to f32,
// which is what the shader instruction produces after all its internal doubles).
//
// IR line map (%N → semantics):
//   %10  air.sample_texture_2d.v4f32(brush,    brushSampler,    brushTexCoord)     ; brush body texel
//   %11  extractvalue %10, 0                                                       ; drop residency byte
//   %12  air.sample_texture_2d.v4f32(brushCap, brushCapSampler, brushCapTexCoord)  ; cap texel
//   %13  extractvalue %12, 0
//   %14  air.fast_fmin.v4f32(%11, %13)                                              ; per-lane min: cap ⊓ body
//   %15  fmul fast <4>: %14 * color                                                 ; tint by fragment color (RGBA)
//   ; --- unpremultiply(%15) starts here (!64 DISubprogram "unpremultiply") ---
//   %16  shufflevector %15, undef, <0,1,2>                                          ; rgb = %15.rgb
//   %17  extractelement %15, 3                                                      ; a   = %15.a
//   %18  air.fast_fmax.f32(a, 0x3EB0C6F7A0000000 = 1.0e-6f)                        ; max(a, 1e-6f)
//   %19-%20  splat that clamped a to <3 x float>
//   %21  fdiv fast <3>: rgb / splat(clamped a)                                     ; rgb straightened
//   ; --- applyGamma(%21) starts here (!75 DISubprogram "applyGamma") ---
//   %22-%23  load <2 x float> uniforms->gamma  (offset +64 from struct base;
//                                                +64 is field 1 in the IR's
//                                                gep index 1 because field 0
//                                                is the 64-byte mvp matrix)
//   %24  extractelement gamma, 1                                                   ; γ = gamma.y
//   %25 = %21.x  ;  %26 = air.fast_pow.f32(%25, γ)                                  ; pow(r_lin, γ)
//   %28 = %21.y  ;  %29 = air.fast_pow.f32(%28, γ)                                  ; pow(g_lin, γ)
//   %31 = %21.z  ;  %32 = air.fast_pow.f32(%31, γ)                                  ; pow(b_lin, γ)
//   %33  <pow(r), pow(g), pow(b)> as <3 x float>
//   ; --- premultiply(%33, %15.a) — !87 DISubprogram "premultiply" ---
//   %34  shufflevector %15, undef, <3,3,3>                                          ; splat a → <3>
//   %35  fmul fast <3>: %33 * splat(a)                                              ; rgb * a
//   %36  <lane0..2 = %35, lane3 = undef>                                            ; expand to <4>
//   %37  shufflevector %36, %15, <0,1,2,7>                                          ; put %15.a back into lane 3
//   %38  insertvalue { <4 x float> } undef, %37, 0                                  ; wrap in return struct
//   ret %38
//
// The wrapping return type `<{ <4 x float> }>` (a packed struct with a single
// vec4) is Metal's convention for "one render_target" output — the runtime
// unwraps that on write. We simply return the vec4.

/**
 * Callback modelling `air.sample_texture_2d.v4f32(...)` — one 2D texture read
 * that returns four fp32 channels. The shader calls this once per texture,
 * with the corresponding sampler; we pass `tex` and `sampler` as opaque
 * handles that the caller resolves to whatever backend they use.
 */
export type SampleTexture2D = (
  tex: unknown,
  sampler: unknown,
  uv: readonly [number, number],
) => readonly [number, number, number, number];

/**
 * MDPAALineUniforms struct (80 bytes, 16-byte aligned). Field names and types
 * are transcribed from !38.
 */
export interface MDPAALineUniforms {
  /** float4x4 mvp @+0 (64 bytes). Not read by this fragment; provided for signature fidelity. */
  mvp: readonly [
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
  ];
  /** float2 gamma @+64. Only `gamma[1]` (`gamma.y`) is read here — the pow exponent. */
  gamma: readonly [number, number];
  /** uint stipplePattern @+72. Not read by this fragment. */
  stipplePattern: number;
  /** float stippleScale @+76. Not read by this fragment. */
  stippleScale: number;
}

/**
 * AALineCapFragmentFunc — sample brush AND brushCap, min-blend them, tint by
 * the input color, then apply gamma (unpremultiply → pow → premultiply).
 *
 * @param position          air.position float4 (declared air.arg_unused per !33).
 * @param color             air.fragment_input float4 (per-vertex interpolated color, RGBA premultiplied).
 * @param brushTexCoord     air.fragment_input float2 (uv into the brush body texture).
 * @param brushCapTexCoord  air.fragment_input float2 (uv into the brush cap stencil texture).
 * @param uniforms          the MDPAALineUniforms constant buffer.
 * @param brush             opaque handle for the brush texture (%5).
 * @param brushCap          opaque handle for the brushCap texture (%6).
 * @param brushSampler      opaque handle for the brush sampler (%7).
 * @param brushCapSampler   opaque handle for the brushCap sampler (%8).
 * @param sample            the AIR sample_texture_2d callback.
 * @returns                 fp32 vec4 RGBA — the render_target-0 output color.
 */
export function AALineCapFragmentFunc(
  position: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
  brushTexCoord: readonly [number, number],
  brushCapTexCoord: readonly [number, number],
  uniforms: MDPAALineUniforms,
  brush: unknown,
  brushCap: unknown,
  brushSampler: unknown,
  brushCapSampler: unknown,
  sample: SampleTexture2D,
): [number, number, number, number] {
  // %0 (position) is declared air.arg_unused in !33 — signature only.
  void position;

  // %10/%11: sample brush at brushTexCoord.
  const brushTexel = sample(brush, brushSampler, brushTexCoord);
  // %12/%13: sample brushCap at brushCapTexCoord.
  const capTexel = sample(brushCap, brushCapSampler, brushCapTexCoord);

  // %14: air.fast_fmin.v4f32(brushTexel, capTexel) — per-lane min.
  // fast_fmin under unsafe-fp-math is the standard IEEE min (no NaN handling).
  const min0 = Math.fround(Math.min(Math.fround(brushTexel[0]), Math.fround(capTexel[0])));
  const min1 = Math.fround(Math.min(Math.fround(brushTexel[1]), Math.fround(capTexel[1])));
  const min2 = Math.fround(Math.min(Math.fround(brushTexel[2]), Math.fround(capTexel[2])));
  const min3 = Math.fround(Math.min(Math.fround(brushTexel[3]), Math.fround(capTexel[3])));

  // %15: fmul fast <4>: min * color (tint).
  const tinted0 = Math.fround(min0 * Math.fround(color[0]));
  const tinted1 = Math.fround(min1 * Math.fround(color[1]));
  const tinted2 = Math.fround(min2 * Math.fround(color[2]));
  const tintedA = Math.fround(min3 * Math.fround(color[3]));

  // --- unpremultiply(tinted) — !64 ---
  // %16: rgb = tinted.rgb
  // %17: a   = tinted.a
  // %18: aClamp = air.fast_fmax.f32(a, 1e-6f)   (0x3EB0C6F7A0000000 = 1e-6f)
  const aClamp = Math.fround(Math.max(tintedA, Math.fround(1e-6)));
  // %21: rgb_lin = rgb / splat(aClamp)  — straightened color (unpremultiplied).
  const rLin = Math.fround(tinted0 / aClamp);
  const gLin = Math.fround(tinted1 / aClamp);
  const bLin = Math.fround(tinted2 / aClamp);

  // --- applyGamma(rgb_lin) — !75 ---
  // %22-%24: γ = uniforms.gamma[1]
  const gamma = Math.fround(uniforms.gamma[1]);
  // %26 %29 %32: pow per-lane via air.fast_pow.f32.
  // Math.fround(Math.pow(x, γ)) — narrow to f32 to match the AIR return type.
  const rPow = Math.fround(Math.pow(rLin, gamma));
  const gPow = Math.fround(Math.pow(gLin, gamma));
  const bPow = Math.fround(Math.pow(bLin, gamma));

  // --- premultiply(rgb_pow, a) — !87 ---
  // %34: splat original a (=tinted.a, NOT aClamp — the IR shuffles %15 not
  //      the clamped alpha; the alpha kept in the output is the un-clamped
  //      tinted alpha so tiny alphas remain tiny).
  // %35: fmul fast <3>: rgb_pow * splat(a)
  const rOut = Math.fround(rPow * tintedA);
  const gOut = Math.fround(gPow * tintedA);
  const bOut = Math.fround(bPow * tintedA);
  // %37: put tinted.a back in lane 3.
  const aOut = tintedA;

  // ret <{ <4 x float> }> { color = <rOut, gOut, bOut, aOut> }
  return [rOut, gOut, bOut, aOut];
}
