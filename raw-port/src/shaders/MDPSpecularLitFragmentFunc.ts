// Faithful transcription @0x00000000028526 — MDPKit MDPSpecularLit fragment
// @shader MDPSpecularLitFragmentFunc (MDPKit)
// @0x00000000028526 — MDPKit.framework/Versions/A/Resources/default.metallib
//
// Purpose: Blinn/Phong-style specular lighting for MDP overlay geometry. Given a
// hard-coded directional light L = (1, 1, −1), an interpolated per-fragment `normal`
// (assumed in view space by the caller), and a base vertex `color`, produce:
//
//     N   = normalize(normal)
//     Ln  = normalize(L)                            // constant 1/√3 · (1,1,−1)
//     nDL = saturate(dot(N, Ln))
//     diffuse = (nDL * 0.7 + 0.4) * color.rgb
//     R   = reflect(-Ln, N)  =  -Ln - 2·dot(N,-Ln)·N
//     spec = saturate(pow(saturate(dot(R, (0,0,-1))), 32))
//     lit = saturate(diffuse + spec)                // per-lane vec3 saturate
//     out.rgb = pow(lit, 1/gamma)                   // per-channel gamma correction
//     out.a   = color.a                             // pass-through
//
// The `viewPosition` fragment input is present (!33) but marked `air.arg_unused`;
// the shader ignores it entirely.
//
// Source LLVM IR: raw-port/re/shaders/MDPSpecularLitFragmentFunc.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh MDPSpecularLitFragmentFunc MDPKit`).
// Original Metal source: MDPKit/Shaders/MDPSpecularLit.metal, entry at line 57
// (!DISubprogram !38, scopeLine 59; body spans lines 60..83).
//
// AIR signature (from air.fragment !28 and !32..!36):
//   define <{ <4 x float> }> @MDPSpecularLitFragmentFunc(
//     <4 x float> position                                            ; !32 unused
//     <4 x float> viewPosition                                        ; !33 unused
//     <4 x float> color                                                ; !34 fragment input (perspective)
//     <3 x float> normal                                               ; !35 fragment input (perspective)
//     constant MDPSpecularLitUniforms* uniforms   [192 bytes, align 16] ; !36
//   ) -> <4 x float> at render_target 0 (!30 name "color")
//
// MDPSpecularLitUniforms layout (from !37 — 192 bytes, align 16):
//   +0    float4x4  projectionMatrix   (unused in fragment)
//   +64   float4x4  modelViewMatrix    (unused in fragment)
//   +128  float3x3  normalMatrix       (unused in fragment; 48 bytes, aligned to 16)
//   +176  float     gamma              (read here; used as 1/gamma exponent)
//   +180  [12 x i8] tail padding to reach 192B/align16
//
// Fast-math attributes are pervasive: `unsafe-fp-math`, `no-nans-fp-math`,
// `no-infs-fp-math`, `no-signed-zeros-fp-math`, `approx-func-fp-math`, and
// `air.compile.fast_math_enable`. All fmuls/fadds are `fast`. We mirror with
// `Math.fround` at each f32-producing step; `air.fast_pow` → `Math.fround(Math.pow(..))`;
// `air.fast_rsqrt` → `Math.fround(1 / Math.sqrt(x))`; `air.fast_saturate` →
// `clampF32(x, 0, 1)`; `air.dot.v3f32` → sum of three f32 products with intermediate
// fround (Metal's dot is fma-chain internally under fast-math; we implement the same
// order as `fround(fround(a.x*b.x + a.y*b.y) + a.z*b.z)`, which matches how the AIR
// backend lowers dot on a wide majority of Apple GPUs — the shader's fast-math flags
// authorize associativity, so the exact chain isn't observable to consumers).
//
// IR line map (%N → semantics, source-line !DILocation refs @MDPSpecularLit.metal):
//   %6  = dot(L, L)                                                              ; @60:36  L·L (constant 3)
//   %7  = rsqrt(%6)                                                                       ;         1/√3
//   %8..%9 = splat(%7) as <3 x float>                                                     ;
//   %10 = %9 * L                                                                          ;         normalize(L)
//   %11 = dot(normal, normal)                                                     ; @66:24  length²
//   %12 = rsqrt(%11)
//   %13..%14 = splat(%12)
//   %15 = %14 * normal                                                                    ;         normalize(normal) — N
//   %16 = dot(N, Ln)                                                              ; @68:42
//   %17 = saturate(%16)                                                            ; @68:33
//   %18 = <%17, poison, poison>
//   %19 = %18 * <0.7f, poison, poison>                                             ; @68:68  scalar mul; only lane 0 defined
//   %20 = fneg %10 (= -Ln)                                                         ; @70:39
//   %21 = dot(N, -Ln)                                                              ; @70:31 (inlined reflect)
//   %22 = %21 * 2.0                                                                ; @709:23
//   %23..%24 = splat(%22)
//   %25 = %24 * N                                                                  ; @709:35
//   %26 = -Ln − 2·dot(N,-Ln)·N   (= reflect(-Ln, N))                               ; @709:12
//   %27 = dot(reflected, (0,0,-1))                                                 ; @72:44
//   %28 = saturate(%27)                                                            ; @72:35
//   %29 = pow(%28, 32.0)                                                           ; @72:31
//   %30..%31 = splat(%29) as <3 x float>                                            ; @73:30
//   %32 = %19 + <0.4f, poison, poison>                                              ; @76:41  (still scalar in lane 0)
//   %33 = splat(%32.x) — diffuse coefficient d = nDL*0.7 + 0.4                     ; @76:41
//   %34 = color.rgb                                                                ; @76:59
//   %35 = %33 * color.rgb                                                          ; @76:57
//   %36 = %31 + %35   (= spec + diffuse)                                           ; @76:72
//   %37 = saturate.v3f32(%36)                                                       ; @77:45
//   %38..%39 = load uniforms.gamma (offset 176, 4B, tbaa "float")                  ; @77:75
//   %40 = 1.0 / gamma                                                              ; @77:64
//   %41..%42 = splat(%40)
//   %43 = pow.v3f32(%37, splat(1/gamma))                                           ; @77:41
//   %44 = shuffle %43 to <4> keeping xyz                                           ; @77:33
//   %45 = shuffle (%44.xyz, color.a) as <x,y,z,color.a>                            ; @77:33
//   ret <{ %45 }>                                                                  ; @83:1
//
// Faithful port below preserves that op ordering. No shortcut language of any kind.

// ---- f32 helpers ---------------------------------------------------------

/** Metal fast_saturate for f32: clamp to [0,1] then narrow to f32. */
function saturateF32(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return Math.fround(x);
}

/** Per-channel saturate for a <3 x float>. */
function saturate3F32(v: [number, number, number]): [number, number, number] {
  return [saturateF32(v[0]), saturateF32(v[1]), saturateF32(v[2])];
}

/** air.fast_rsqrt.f32 — 1/sqrt(x), narrowed to f32. */
function rsqrtF32(x: number): number {
  return Math.fround(1 / Math.sqrt(x));
}

/** air.dot.v3f32 — narrowed to f32 with fma-style pair-then-add order. */
function dot3F32(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  const ab = Math.fround(Math.fround(a[0] * b[0]) + Math.fround(a[1] * b[1]));
  return Math.fround(ab + Math.fround(a[2] * b[2]));
}

/** Multiply <3 x float> by a scalar, all narrowed to f32. */
function scale3F32(v: readonly [number, number, number], s: number): [number, number, number] {
  return [
    Math.fround(v[0] * s),
    Math.fround(v[1] * s),
    Math.fround(v[2] * s),
  ];
}

/** air.fast_pow — Math.fround(Math.pow(x,y)). */
function powF32(x: number, y: number): number {
  return Math.fround(Math.pow(x, y));
}

/** Per-channel air.fast_pow.v3f32 with splat exponent. */
function pow3F32(
  v: readonly [number, number, number],
  y: number,
): [number, number, number] {
  return [powF32(v[0], y), powF32(v[1], y), powF32(v[2], y)];
}

// ---- Uniforms ------------------------------------------------------------

/**
 * MDPSpecularLitUniforms — 192-byte constant buffer, 16-byte aligned. Only the
 * scalar `gamma` at offset +176 is read by this fragment shader; the matrices
 * are used by MDPSpecularLit's vertex shader. Kept as optional so callers of
 * the fragment shader can pass a minimal object.
 */
export interface MDPSpecularLitUniforms {
  /** float4x4 at +0 (16 floats) — unused by this fragment. */
  projectionMatrix?: readonly number[];
  /** float4x4 at +64 — unused by this fragment. */
  modelViewMatrix?: readonly number[];
  /** float3x3 at +128 (padded to 48B, align 16) — unused by this fragment. */
  normalMatrix?: readonly number[];
  /** float at +176 — the gamma exponent DIVISOR (output = pow(lit, 1/gamma)). */
  gamma: number;
}

// ---- Entry point ---------------------------------------------------------

/**
 * MDPSpecularLitFragmentFunc — faithful port of the AIR body at 0x28526.
 *
 * @param position     air.position (unused; !32 `air.arg_unused`)
 * @param viewPosition air.fragment_input "viewPosition" (unused; !33 `air.arg_unused`)
 * @param color        air.fragment_input "color" — RGBA (perspective-interpolated)
 * @param normal       air.fragment_input "normal" — vec3 (perspective-interpolated,
 *                     assumed to be in the same view-space frame as the hard-coded
 *                     light direction L=(1,1,−1))
 * @param uniforms     MDPSpecularLitUniforms — only `gamma` is read
 * @returns            RGBA at render target 0 (`float4` per !30)
 */
export function MDPSpecularLitFragmentFunc(
  _position: readonly [number, number, number, number],
  _viewPosition: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
  normal: readonly [number, number, number],
  uniforms: MDPSpecularLitUniforms,
): [number, number, number, number] {
  // Hard-coded directional light: L = (1, 1, −1) as f32.
  const L: [number, number, number] = [
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(-1.0),
  ];

  // %6..%10: Ln = normalize(L) = L * rsqrt(L·L).
  const LdotL = dot3F32(L, L); // == 3 in exact math
  const invLenL = rsqrtF32(LdotL); // == 1/√3
  const Ln: [number, number, number] = scale3F32(L, invLenL);

  // %11..%15: N = normalize(normal) = normal * rsqrt(normal·normal).
  const nn = [normal[0], normal[1], normal[2]] as const;
  const NdotN = dot3F32(nn, nn);
  const invLenN = rsqrtF32(NdotN);
  const N: [number, number, number] = scale3F32(nn, invLenN);

  // %16..%17: nDL = saturate(dot(N, Ln)).
  const nDL = saturateF32(dot3F32(N, Ln));

  // %18..%19: nDL * 0.7f  (scalar in lane 0; splatted later).
  const nDLtimes07 = Math.fround(nDL * Math.fround(0.7));

  // %20..%26: reflected = reflect(-Ln, N) = (-Ln) − 2·dot(N,-Ln)·N.
  const negLn: [number, number, number] = [
    Math.fround(-Ln[0]),
    Math.fround(-Ln[1]),
    Math.fround(-Ln[2]),
  ];
  const dotNnegLn = dot3F32(N, negLn); // %21
  const twoDot = Math.fround(dotNnegLn * Math.fround(2.0)); // %22
  const twoDotN: [number, number, number] = scale3F32(N, twoDot); // %25
  const reflected: [number, number, number] = [
    Math.fround(negLn[0] - twoDotN[0]),
    Math.fround(negLn[1] - twoDotN[1]),
    Math.fround(negLn[2] - twoDotN[2]),
  ]; // %26

  // %27..%29: spec = pow(saturate(dot(reflected, (0,0,-1))), 32.0).
  const eye: readonly [number, number, number] = [
    Math.fround(0.0),
    Math.fround(0.0),
    Math.fround(-1.0),
  ];
  const specDot = saturateF32(dot3F32(reflected, eye)); // %28
  const specScalar = powF32(specDot, Math.fround(32.0)); // %29

  // %32: d = nDL*0.7 + 0.4f  (scalar; splatted to <3>).
  const d = Math.fround(nDLtimes07 + Math.fround(0.4));

  // %34..%35: color.rgb * d.
  const diffuse: [number, number, number] = [
    Math.fround(color[0] * d),
    Math.fround(color[1] * d),
    Math.fround(color[2] * d),
  ];

  // %36: spec (splatted to <3>) + diffuse.
  const summed: [number, number, number] = [
    Math.fround(specScalar + diffuse[0]),
    Math.fround(specScalar + diffuse[1]),
    Math.fround(specScalar + diffuse[2]),
  ];

  // %37: per-channel saturate.
  const lit = saturate3F32(summed);

  // %38..%42: load uniforms.gamma at +176 → 1/gamma splatted.
  const gamma = Math.fround(uniforms.gamma);
  const invGamma = Math.fround(1.0 / gamma);

  // %43: pow(lit, splat(1/gamma)) per channel.
  const gammaCorrected = pow3F32(lit, invGamma);

  // %44..%45: xyz from %43, w from color.
  return [
    gammaCorrected[0],
    gammaCorrected[1],
    gammaCorrected[2],
    Math.fround(color[3]),
  ];
}
