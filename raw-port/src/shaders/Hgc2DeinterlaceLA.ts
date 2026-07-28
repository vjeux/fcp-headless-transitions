// @shader Hgc2DeinterlaceLA (Helium) — .ll header offset @0x00000000000426
//
// Metal fragment shader from Helium's HgcFilters pixel-math library. Performs a
// per-fragment deinterlace of a "LA" (luma+alpha, but really any RGBA)
// texture: for pixels whose row-parity matches the target field parity
// the source texel is passed through; for pixels whose row-parity does
// NOT match, the shader replaces the pixel with a neighbor row from the
// selected field — either the row below (top clamp), the row above
// (bottom clamp), or the average of the two adjacent rows (interior).
//
// Source LLVM IR: raw-port/re/shaders/Hgc2DeinterlaceLA.ll
// Extracted from: Helium.framework/Versions/A/Resources/
//                   HeliumFiltersHgcMetalShaders_derived.metallib
// (via `bash raw-port/tools/shader_disasm.sh Hgc2DeinterlaceLA Helium`)
//
// AIR signature (from the .ll):
//   define <4 x float> @Hgc2DeinterlaceLA(
//     <4 x float> %0,   // position   (fragment coord — unused)
//     <4 x float> %1,   // texcoord0
//     texture2d   %2,   // texture0
//     float4*     %3    // params (constant-address-space buffer)
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable` — the shader compiles under Metal fast-math.
// This port uses plain JS Number arithmetic (already IEEE-754 fp64) narrowed
// with Math.fround at every stored intermediate for f32 fidelity.
//
// Params layout, decoded from the .ll load and index pattern:
//   params[0] = target field parity (0.0 for even rows, 1.0 for odd rows)
//   params[1] = first-valid-row y (top clamp threshold in texcoord space
//               — a floored row index)
//   params[2] = last-valid-row  y (bottom clamp threshold; the shader
//               tests floor(uv.y) < params[2] - 1)
//   params[3] = unused (never referenced)
//
// The offset arithmetic (`uv.y + 1`, `uv.y - 1`) is in the SAME units the
// caller chose for params[1]/params[2] — the .ll writes them as raw
// texcoord offsets. Matches how FCP's Hgc deinterlace nodes bake the
// offset into params on the CPU side.
//
// IR line map (from the .ll body):
//   %5  load <4xf32> from params buffer                -> p = params
//   %6  extractelement p, i64 0                        -> fieldParity
//   %7  extractelement p, i64 2                        -> maxY
//   %8  extractelement texcoord0, i64 1                -> uvY
//   %9  air.fast_floor.f32(uvY)                        -> row = floor(uvY)
//   %10 air.fast_fmod.f32(row, 2.0)                    -> rowParity
//   %11 fcmp fast oeq %10, %6                          -> parityMatch
//   br %11 -> label 12 (match) : label 16 (mismatch)
//
//   ; --- 12: parity matches — pass-through sample at texcoord0.xy ---
//   %13 shufflevector texcoord0, poison, <0,1>         -> uv = (uvX, uvY)
//   %14 air.sample_texture_2d.v4f32(tex, sampler, uv,  ; enable_offset=true,
//         zero offset, no LOD, sampler-flags=0)        -> {texel, status}
//   %15 extractvalue %14, 0                            -> texel
//   br label 48
//
//   ; --- 16: parity mismatch — pick a neighbor row ---
//   %17 extractelement p, i64 1                        -> minY (top clamp)
//   %18 fcmp fast ugt row, minY                        -> row > minY ?
//   br %18 -> label 26 (interior/bottom) : label 19 (top clamp)
//
//   ; --- 19: row <= minY (top clamp) — sample the row BELOW ---
//   %20 extractelement texcoord0, i64 0                -> uvX
//   %21 <2xf32>{uvX, undef}
//   %22 uvY + 1.0
//   %23 <2xf32>{uvX, uvY + 1.0}
//   %24 air.sample_texture_2d.v4f32(...)               -> {texel, status}
//   %25 extractvalue %24, 0                            -> texel
//   br label 48
//
//   ; --- 26: row > minY — test bottom clamp ---
//   %27 maxY - 1.0
//   %28 fcmp fast ult row, %27                         -> row < maxY - 1 ?
//   br %28 -> label 36 (interior) : label 29 (bottom clamp)
//
//   ; --- 29: row >= maxY - 1 (bottom clamp) — sample the row ABOVE ---
//   %30 extractelement texcoord0, i64 0                -> uvX
//   %31 <2xf32>{uvX, undef}
//   %32 uvY - 1.0
//   %33 <2xf32>{uvX, uvY - 1.0}
//   %34 air.sample_texture_2d.v4f32(...)               -> {texel, status}
//   %35 extractvalue %34, 0                            -> texel
//   br label 48
//
//   ; --- 36: interior mismatched row — average row above + row below ---
//   %37 shufflevector texcoord0, poison, <0, undef>    -> {uvX, undef}
//   %38 uvY + 1.0
//   %39 insertelement %37, %38, i64 1                  -> {uvX, uvY + 1.0}
//   %40 uvY - 1.0
//   %41 insertelement %37, %40, i64 1                  -> {uvX, uvY - 1.0}
//   %42 air.sample_texture_2d.v4f32 at %39             -> {below, status}
//   %43 extractvalue %42, 0                            -> below
//   %44 air.sample_texture_2d.v4f32 at %41             -> {above, status}
//   %45 extractvalue %44, 0                            -> above
//   %46 fadd fast <4xf32> above, below                 -> sum
//   %47 fmul fast <4xf32> sum, splat(0.5)              -> sum * 0.5
//   br label 48
//
//   ; --- 48: phi node picks the correct branch result ---
//   %49 phi <4xf32> [ %15, 12 ], [ %25, 19 ],
//                   [ %35, 29 ], [ %47, 36 ]
//   ret <4xf32> %49

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
 * Params buffer for `@Hgc2DeinterlaceLA`, four f32 lanes as loaded by
 * the .ll's `load <4 x float>` from address-space(2) `%3`.
 *
 * Lane order (see file header):
 *   0: target field parity (0 or 1)
 *   1: top clamp threshold (min valid row index)
 *   2: bottom clamp threshold (max valid row index)
 *   3: unused
 */
export type Hgc2DeinterlaceLAParams = readonly [number, number, number, number];

/**
 * `@Hgc2DeinterlaceLA` — Helium Metal fragment shader.
 *
 * See file header for the full IR-line-to-code map. Faithful transcription
 * of the .ll body; every branch mirrors the IR control flow.
 *
 * The `position` argument is present in the AIR ABI (fragment position)
 * but is unused by the shader — the .ll body never references `%0`.
 *
 * @param position  fragment position (AIR `<4 x float> %0`) — unused
 * @param texcoord0 texture coordinate (AIR `<4 x float> %1`); .xy is the
 *                  sample uv, .y is the row selector
 * @param texture0  opaque texture handle passed straight to `sample`
 * @param params    4-lane params buffer (see Hgc2DeinterlaceLAParams)
 * @param sample    caller-supplied texture-sampling callback modeling
 *                  `air.sample_texture_2d.v4f32`
 * @returns         deinterlaced RGBA texel
 */
export function Hgc2DeinterlaceLA(
  _position: readonly [number, number, number, number],
  texcoord0: readonly [number, number, number, number],
  texture0: unknown,
  params: Hgc2DeinterlaceLAParams,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %5  = load <4xf32> params  — grabbed lane-by-lane below.
  // %6  = extractelement p, i64 0
  const fieldParity: number = Math.fround(params[0]);
  // %7  = extractelement p, i64 2
  const maxY: number = Math.fround(params[2]);

  // %8  = extractelement texcoord0, i64 1
  const uvY: number = Math.fround(texcoord0[1]);
  // %9  = air.fast_floor.f32(uvY)  — floor narrowed to f32
  const row: number = Math.fround(Math.floor(uvY));
  // %10 = air.fast_fmod.f32(row, 2.0)  — IEEE fmod narrowed to f32.
  //       Because `row` is an f32 integer value from floor(),
  //       `row - 2 * trunc(row / 2)` is exactly {..-1, 0, 1..} and is bit-
  //       exact under f32 for all integers up to 2^24.
  const rowParity: number = Math.fround(row - Math.fround(2 * Math.trunc(Math.fround(row / 2))));
  // %11 = fcmp fast oeq rowParity, fieldParity
  const parityMatch: boolean = rowParity === fieldParity;

  // Result texel — filled by whichever branch runs.
  let result: ShaderTexel;

  if (parityMatch) {
    // --- 12: parity matches — pass-through sample at texcoord0.xy ---
    // %13 = shufflevector texcoord0, poison, <0,1>
    const uv: [number, number] = [
      Math.fround(texcoord0[0]),
      Math.fround(texcoord0[1]),
    ];
    // %14/%15 = air.sample_texture_2d.v4f32(tex, sampler, uv, ...)
    result = sample(texture0, uv);
  } else {
    // --- 16: parity mismatch — pick a neighbor row ---
    // %17 = extractelement p, i64 1
    const minY: number = Math.fround(params[1]);
    // %18 = fcmp fast ugt row, minY
    //   Under fast-math (no-nans), unordered-greater collapses to `>`.
    const rowAboveMin: boolean = row > minY;

    if (!rowAboveMin) {
      // --- 19: row <= minY (top clamp) — sample the row BELOW ---
      // %20 = extractelement texcoord0, i64 0
      const uvX: number = Math.fround(texcoord0[0]);
      // %22 = uvY + 1.0
      const yBelow: number = Math.fround(uvY + 1.0);
      // %23 = <2xf32>{uvX, uvY + 1.0}
      const uv: [number, number] = [uvX, yBelow];
      // %24/%25 = air.sample_texture_2d.v4f32(..., uv, ...)
      result = sample(texture0, uv);
    } else {
      // --- 26: row > minY — test bottom clamp ---
      // %27 = maxY - 1.0
      const bottomThresh: number = Math.fround(maxY - 1.0);
      // %28 = fcmp fast ult row, bottomThresh
      //   Under fast-math (no-nans), unordered-less collapses to `<`.
      const rowBelowMax: boolean = row < bottomThresh;

      if (!rowBelowMax) {
        // --- 29: row >= maxY - 1 (bottom clamp) — sample the row ABOVE ---
        // %30 = extractelement texcoord0, i64 0
        const uvX: number = Math.fround(texcoord0[0]);
        // %32 = uvY - 1.0
        const yAbove: number = Math.fround(uvY - 1.0);
        // %33 = <2xf32>{uvX, uvY - 1.0}
        const uv: [number, number] = [uvX, yAbove];
        // %34/%35 = air.sample_texture_2d.v4f32(..., uv, ...)
        result = sample(texture0, uv);
      } else {
        // --- 36: interior mismatched row — average row above + row below ---
        // %37 = shufflevector texcoord0, poison, <0, undef>
        const uvX: number = Math.fround(texcoord0[0]);
        // %38 = uvY + 1.0
        const yBelow: number = Math.fround(uvY + 1.0);
        // %39 = <2xf32>{uvX, uvY + 1.0}
        const uvBelow: [number, number] = [uvX, yBelow];
        // %40 = uvY - 1.0
        const yAbove: number = Math.fround(uvY - 1.0);
        // %41 = <2xf32>{uvX, uvY - 1.0}
        const uvAbove: [number, number] = [uvX, yAbove];
        // %42/%43 = sample below-row
        const below: ShaderTexel = sample(texture0, uvBelow);
        // %44/%45 = sample above-row
        const above: ShaderTexel = sample(texture0, uvAbove);
        // %46 = fadd fast <4xf32> above, below   (element-wise sum)
        // %47 = fmul fast <4xf32> sum, splat(0.5) (element-wise * 0.5)
        result = [
          Math.fround(Math.fround(above[0] + below[0]) * 0.5),
          Math.fround(Math.fround(above[1] + below[1]) * 0.5),
          Math.fround(Math.fround(above[2] + below[2]) * 0.5),
          Math.fround(Math.fround(above[3] + below[3]) * 0.5),
        ];
      }
    }
  }

  // %49 = phi <4xf32> [ ... ]  ;  ret <4xf32> %49
  return result;
}
