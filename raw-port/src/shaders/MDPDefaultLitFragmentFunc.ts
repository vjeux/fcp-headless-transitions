// Faithful transcription @0x00000000020706
// @shader MDPDefaultLitFragmentFunc (MDPKit)
//
// Default lit fragment shader from MDPKit's default.metallib (source file
// `MDPKit/Shaders/MDPDefaultLit.metal`, line 59). Computes a simple three-
// point directional-light shading using three hard-coded light directions
// baked into the shader's stack-allocated `[3 x <3 x float>]` array. For
// each light, it normalises the direction, computes `max(0, dot(N, L))`,
// scales by 0.7 and biases by 0.35 (a fake soft "half-Lambert" ramp),
// then multiplies by the vertex `color.rgb` and accumulates. The output
// is the accumulated RGB with the original per-vertex `color.a`.
//
// Source LLVM IR: raw-port/re/shaders/MDPDefaultLitFragmentFunc.ll
// Extracted from: MDPKit.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh MDPDefaultLitFragmentFunc MDPKit`)
//
// AIR fragment signature (from air.fragment metadata !29 and !32..!36):
//   define <{ <4 x float> }> @MDPDefaultLitFragmentFunc(
//     <4 x float> %0,   ; air.position          (unused, air.arg_unused)
//     <4 x float> %1,   ; air.fragment_input color
//     <3 x float> %2,   ; air.fragment_input normal (already normalised
//                       ;                             upstream — see notes)
//     MDPDefaultLitUniforms addrspace(2)* %3  ; air.buffer uniforms
//                       ;                        (unused, air.arg_unused)
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`.
// Fast-math compile. No shortcut language of any kind — every fp32
// operation is Math.fround'd and every SSA value in the .ll body has a
// matching step below with its %N reference.
//
// Baked light directions (stored via `store <3 x float> <...>, %5[i]`):
//   lights[0] = ( 3.0,  3.0,  3.0)     (see %7 store)
//   lights[1] = ( 0.0, -3.0, -1.0)     (see %8 store)
//   lights[2] = (-2.0,  0.0,  0.0)     (see %9 store)
//
// Baked scalar constants (fp32 literals stored as fp64 in the IR):
//   0x3FE6666660000000 -> fp32(0.7)   — the N·L slope
//   0x3FD6666660000000 -> fp32(0.35)  — the N·L bias
// (see numeric decode in the notes at the bottom of this header.)
//
// IR line map (from the .ll body):
//   %5  = alloca [3 x <3 x float>], align 16                    -> lights[]
//   %7/%8/%9 store the three hard-coded light directions above.
//   %10 = shufflevector <4xf> %1, poison, <0,1,2>               -> color.rgb
//   Loop `%11:` iterating i = 0..2 (br i1 %31 to %11 or %32):
//     %12 = phi <3 x float>                    (acc; init = <0,0,0>)
//     %13 = phi i32                            (i;   init = 0)
//     %14 = zext i32 %13 to i64                (i as 64-bit index)
//     %15 = GEP lights[i]                       (address of lights[i])
//     %16 = load <3 x float>                    (lightDir = lights[i])
//     %17 = call fast @air.dot.v3f32(%16, %16)  (lengthSq = dot(L, L))
//     %18 = call fast @air.fast_rsqrt.f32(%17)  (invLen = rsqrt(lengthSq))
//     %19 = insertelement poison, %18, 0        (splat vec3 lane 0 <- invLen)
//     %20 = shufflevector %19, poison, <0,0,0>  (broadcast to <invLen,invLen,invLen>)
//     %21 = fmul fast <3 x float> %20, %16      (Lhat = lightDir * invLen)
//     %22 = call fast @air.dot.v3f32(%2, %21)   (nDotL = dot(N, Lhat))
//     %23 = call fast @air.fast_fmax.f32(0.0, %22)  (nDotLPos = max(0, nDotL))
//     %24 = insertelement poison, %23, 0        (splat lane 0 <- nDotLPos)
//     %25 = fmul fast <3xf> %24, <0.7, poison, poison>
//     %26 = fadd fast <3xf> %25, <0.35, poison, poison>
//         (only lane 0 is used before the next shufflevector, so the
//          poison lanes 1/2 are irrelevant — the compiler folds a
//          scalar computation into vec3 form because the following
//          broadcast reads lane 0 into all three lanes.)
//     %27 = shufflevector %26, poison, <0,0,0>  (broadcast lane 0 -> vec3(shade))
//     %28 = fmul fast <3xf> %27, %10            (shaded = shade * color.rgb)
//     %29 = fadd fast <3xf> %28, %12            (acc = acc + shaded)
//     %30 = add nuw nsw i32 %13, 1              (i++)
//     %31 = icmp eq i32 %30, 3                  (loop while i != 3)
//     br i1 %31, label %32, label %11
//   %32: (loop exit)
//   %33 = shufflevector <3xf> %29, poison, <0,1,2,undef>       (accToVec4)
//   %34 = shufflevector <4xf> %33, %1, <0,1,2,7>               (rgb from acc,
//                                                               alpha from
//                                                               original color)
//   %35 = insertvalue struct, %34, 0
//   ret struct
//
// Notes:
//   • The three light-vectors are NOT unit vectors; the shader normalises
//     each on the fly via `rsqrt(dot(L, L))` before dotting with N.
//   • The per-fragment `normal` (%2) is assumed already normalised
//     upstream — the shader does NOT re-normalise it before the dot.
//   • The `MDPDefaultLitUniforms` buffer is `air.arg_unused` per !36 —
//     even though the buffer is bound (mvp/projection/normalMatrix), the
//     fragment shader never reads it. The vertex shader consumes it. We
//     accept it for API fidelity but never touch it.
//   • The `<4 x float>` return's `.rgb` lanes come from the accumulator;
//     `.a` comes from the original `color.a` (lane 3) via the final
//     `shufflevector <0,1,2,7>` (index 7 into the second operand = %1[3]).
//   • Numeric-literal decoding: `0x3FE6666660000000` and
//     `0x3FD6666660000000` are the fp64 promotions of the fp32 values
//     0.7f (bit-pattern 0x3F333333) and 0.35f (bit-pattern 0x3EB33333);
//     Math.fround(0.7) and Math.fround(0.35) reproduce them exactly.
//   • `air.fast_rsqrt.f32(x)` returns `1/sqrt(x)`; under fast-math the
//     result may be less than 1-ULP accurate but for our non-zero
//     inputs (dot-of-non-zero-vec == a strictly positive number) the
//     Math.sqrt-based implementation below matches to within Metal's
//     fast-math tolerance.
//
// Baked light lengths for reference (used only in comments — the shader
// does NOT hard-code these; they fall out of the on-the-fly rsqrt):
//   |lights[0]| = sqrt(27) ≈ 5.196152    (Lhat ≈ (0.577..., 0.577..., 0.577...))
//   |lights[1]| = sqrt(10) ≈ 3.162278    (Lhat ≈ (0, -0.9487, -0.3162))
//   |lights[2]| = 2                        (Lhat = (-1, 0, 0))

/**
 * MDPDefaultLitFragmentFunc — three-light hemispheric-ish shading.
 *
 * @param position  air.position vec4 — declared but unused (`air.arg_unused`).
 * @param color     interpolated per-vertex color vec4 (rgb is the surface
 *                  color, alpha is passed through to the output).
 * @param normal    interpolated per-vertex normal vec3 (must already be
 *                  normalised — the shader does NOT re-normalise it).
 * @param uniforms  MDPDefaultLitUniforms — declared but unused
 *                  (`air.arg_unused`); accepted for API fidelity only.
 * @returns         fp32 vec4 [acc.r, acc.g, acc.b, color.a].
 */
export function MDPDefaultLitFragmentFunc(
  position: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
  normal: readonly [number, number, number],
  uniforms: unknown,
): [number, number, number, number] {
  // %0 (position) and %3 (uniforms) are declared `air.arg_unused`.
  void position;
  void uniforms;

  // %5 alloca + %7/%8/%9 stores — the three hard-coded light directions.
  // Stored as fp32 SIMD3s; the values are integers exactly representable
  // in fp32 so Math.fround here is a no-op but preserved for clarity.
  const lights: readonly [
    readonly [number, number, number],
    readonly [number, number, number],
    readonly [number, number, number],
  ] = [
    [Math.fround(3.0), Math.fround(3.0), Math.fround(3.0)],
    [Math.fround(0.0), Math.fround(-3.0), Math.fround(-1.0)],
    [Math.fround(-2.0), Math.fround(0.0), Math.fround(0.0)],
  ];

  // %10 = shufflevector <4xf> %1, poison, <0,1,2>  — color.rgb.
  const colorR = Math.fround(color[0]);
  const colorG = Math.fround(color[1]);
  const colorB = Math.fround(color[2]);
  // (color.a is preserved for the final shufflevector <0,1,2,7>.)
  const colorA = Math.fround(color[3]);

  // Normal (assumed already normalised — see notes).
  const nx = Math.fround(normal[0]);
  const ny = Math.fround(normal[1]);
  const nz = Math.fround(normal[2]);

  // Loop accumulator `%12 = phi zeroinitializer` — start at <0,0,0>.
  let accR = Math.fround(0.0);
  let accG = Math.fround(0.0);
  let accB = Math.fround(0.0);

  // %11: label — loop 3 times (i = 0..2), exit when i == 3 (%31 = icmp eq).
  for (let i = 0; i < 3; i++) {
    // %14/%15/%16: load lights[i].
    const lx = lights[i][0];
    const ly = lights[i][1];
    const lz = lights[i][2];

    // %17 = air.dot.v3f32(%16, %16) — lengthSq of the light dir.
    const lenSq = Math.fround(
      Math.fround(Math.fround(lx * lx) + Math.fround(ly * ly)) +
        Math.fround(lz * lz),
    );

    // %18 = air.fast_rsqrt.f32(%17) — 1 / sqrt(lengthSq).
    //   Under fast-math this may lose a ULP; Math.fround(1 / Math.sqrt(...))
    //   is accurate to <=1 ULP for these all-non-zero inputs and matches
    //   Metal's fast_rsqrt within the fast-math tolerance.
    const invLen = Math.fround(1.0 / Math.fround(Math.sqrt(lenSq)));

    // %19..%21: fmul <3xf> %20, %16 — Lhat = lightDir * invLen.
    const Lhx = Math.fround(lx * invLen);
    const Lhy = Math.fround(ly * invLen);
    const Lhz = Math.fround(lz * invLen);

    // %22 = air.dot.v3f32(%2, %21) — nDotL = dot(N, Lhat).
    const nDotL = Math.fround(
      Math.fround(Math.fround(nx * Lhx) + Math.fround(ny * Lhy)) +
        Math.fround(nz * Lhz),
    );

    // %23 = air.fast_fmax.f32(0.0, %22)  — max(0, nDotL).
    //   Note the argument order: max(0.0, %22). Under fast-math with
    //   no-nans, this is a plain `<` compare. NaN handling is undefined
    //   but the compiler assumes no NaNs.
    const nDotLPos = Math.fround(Math.max(Math.fround(0.0), nDotL));

    // %24..%26 (only lane 0 matters — later `shufflevector <0,0,0>` broadcasts):
    //   shade = nDotLPos * 0.7 + 0.35.
    //   0x3FE6666660000000 = fp32(0.7); 0x3FD6666660000000 = fp32(0.35).
    const shade = Math.fround(
      Math.fround(nDotLPos * Math.fround(0.7)) + Math.fround(0.35),
    );

    // %27..%28: shaded.rgb = shade * color.rgb (via <0,0,0> broadcast).
    const shadedR = Math.fround(shade * colorR);
    const shadedG = Math.fround(shade * colorG);
    const shadedB = Math.fround(shade * colorB);

    // %29 = fadd <3xf> %28, %12 — acc += shaded.
    accR = Math.fround(accR + shadedR);
    accG = Math.fround(accG + shadedG);
    accB = Math.fround(accB + shadedB);
    // %30 = i++; %31 = icmp eq i, 3 — loop control.
  }

  // %33/%34 — final shuffle: rgb from `acc`, alpha from original `color.a`
  // (the `<0,1,2,7>` index 7 selects lane 3 of the second operand = %1[3]).
  return [accR, accG, accB, colorA];
}
