// @shader histogram_compute (Flexo)
//
// Compute kernel from Flexo's default.metallib (metallib offset 0x10f0 per
// the .ll header line `0x00000000000010f0 -- histogram_compute:`). Part of
// the FFVideoScopesShaders.metal family (same static-init function as
// histogram_Intersect / histogram_bg_pass_vertex_shader — see the shared
// @_GLOBAL__sub_I_FFVideoScopesShaders.metal in the .ll).
//
// Source LLVM IR: raw-port/re/shaders/histogram_compute.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh histogram_compute Flexo`)
//
// PURPOSE
// -------
// Per-pixel compute kernel that atomically INCREMENTS histogram bins based
// on the sampled color at position (gid.x, gid.y). Selects one of TWO
// histogram-populating modes via `state.computation`:
//
//   computation == 0  -> LUMA HISTOGRAM
//     Sample the input texture at UV = (gid.x/511, gid.y/255) (u_bit_scale,
//     v_bit_scale — see below), take its RGB, compute a Rec.601-ish luma
//     via dot(rgb, state.rgb2ycc.row[0]), remap the luma from [0,1]-ish
//     into the sub-range [1/6, 5/6] via `L' = L*2/3 + 1/6`, clamp to [0,1],
//     scale to bin index b = clamp * (num_bins - 1), atomically increment
//     histo[b].
//
//   computation == 1  -> RGB HISTOGRAM (three separate histograms, one per channel)
//     Sample the input texture, take R/G/B (as half4). For each channel c
//     in {R, G, B}:
//       c' = clamp(c * 0.66650390625 + 0.16650390625, 0, 1)      (in fp16;
//          coefficients 0.66650390625 and 0.16650390625 are the fp16
//          images of 2/3 and 1/6 — see decode below)
//       b_c = c' * (num_bins - 1)
//       atomically increment histo[b_c + c*num_bins]
//     I.e. R bins land at [0, num_bins), G at [num_bins, 2*num_bins),
//         B at [2*num_bins, 3*num_bins). The 4th slot (fourth num_bins-sized
//     block, indices [3*num_bins, 4*num_bins)) is UNUSED here and is filled
//     later by the sister kernel `histogram_Intersect` (min across all three).
//
//   Any other computation value: fall through to the `default` case, which
//   is a no-op switch label (bb71 = ret void).
//
// AIR compute signature (from air.kernel metadata !15..!23):
//   define void @histogram_compute(
//     <2 x i32> %0,                             ; air.thread_position_in_grid "gid"  (uint2)
//     %"struct.metal::_atomic" addrspace(1)* %1 ; air.buffer 1 read_write "histo"
//     %struct.histogram_state_t addrspace(2)* %2 ; air.buffer 2 constant  "state"
//     %struct._texture_2d_t addrspace(1)* %3    ; air.texture "te"  (texture2d<half, sample>)
//   )
//
// %struct.histogram_state_t layout — see the histogram_bg_pass_vertex_shader
// port for the full layout. This kernel reads:
//     - state.rgb2ycc (float3x3 @off 64..111) — row 0 only, at %30/%31.
//     - state.computation (uint @off 128) — the switch selector, at %18/%19.
//
// Function constant `num_bins` (from !24): passed as an argument.
//
// Sampler state — the .ll uses the constant `@__air_sampler_state` (a hidden
// sampler descriptor), bit-cast into a `sampler*` for the intrinsic call.
// From the .ll: `[2 x i64] [i64 34901797601020489, i64 0]`. The exact
// filter/addressing mode is encoded in that 64-bit descriptor; for a TS
// port that runs on host arrays, we surface it as an opaque
// `Sample2DFn<T>` callback (matches the pattern used elsewhere — see
// Hgc2CopyAlpha.ts).
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable` — all float-relaxation flags. This TS port
// uses plain JS f64 arithmetic narrowed with Math.fround where AIR stores to
// a `<... x float>` slot. Values loaded from f16 (via fpext) preserve
// bit-exactly (every finite f16 has a bit-exact f32 image).
//
// AIR intrinsics used:
//   air.sample_texture_2d.v4f16       — texture2d<half, sample> sample -> half4
//   air.convert.f.f32.u.i32           — u32 -> f32
//   air.convert.u.i32.f.f32           — f32 -> u32 (truncate)
//   air.dot.v3f32                     — sum(a[i]*b[i]) for i=0..2, fp32
//   air.fast_clamp.f32                — clamp(x, lo, hi) fp32
//   air.clamp.v4f16                   — clamp(v, lo, hi) fp16 (elementwise)
//   air.atomic.global.add.u.i32       — atomic uint32 fetch-add
//
// The `_GLOBAL__sub_I_FFVideoScopesShaders.metal` static-init function in the
// .ll copies the function-constant initializer into @_ZL8num_bins; in TS this
// is just "the caller passes num_bins as a parameter."
//
// CONSTANT DECODES (each `float 0x...` in the .ll is a DOUBLE bit-pattern
// that AIR narrows to fp32 at the call site; each `half 0x...` is an fp16
// bit-pattern):
//   float 0x3F60080400000000 = 0.001956947147846222 (fp32) = 1/511
//     -> u-axis scale: gid.x * (1/511) = normalized U for a 512-wide input
//     (0..511 -> 0..1, inclusive). Used at %7 in the .ll.
//   float 0x3F70101020000000 = 0.003921568859368563 (fp32) = 1/255
//     -> v-axis scale: gid.y * (1/255) = normalized V for a 256-tall input.
//     Used at %11.
//   float 0x3FE5559B40000000 = 0.666700005531311    (fp32) — the fp32 image
//     of the fp16 value 0.66650390625, which is the fp16 image of 2/3.
//     Used at %33 (luma slope).
//   float 0x3FC5555560000000 = 0.1666666716337204   (fp32) — the fp32 image
//     of the fp16 value 0.16650390625, which is the fp16 image of 1/6.
//     Used at %34 (luma bias).
//   half  0xH3955 = 0.66650390625 (fp16 image of 2/3)   Used at %42.
//   half  0xH3155 = 0.16650390625 (fp16 image of 1/6)   Used at %43.
//   half  0xH3C00 = 1.0 (fp16)                          Used at %44 (clamp hi).
//
// The pair (2/3 slope, 1/6 bias) maps [0, 1] into [1/6, 5/6]. This
// packs each channel's histogram into the middle 2/3 of the bin range,
// leaving 1/6 padding on both ends — this is the standard "FCP Waveform
// scope" or "Vectorscope" display margin so bars at 0 or 1 don't clip
// against the frame edges.
//
// The switch's `default` label (bb71) is an empty `ret void` — any
// state.computation value other than 0 or 1 leaves `histo` unchanged.
//
// IR LINE-BY-LINE MAP  (@histogram_compute body):
//
//   %5  = extractelement <2 x i32> %0, i64 0                  ; ux = gid.x
//   %6  = call fast float @air.convert.f.f32.u.i32(%5)        ; uxf = (float)(uint)ux
//   %7  = fmul fast float %6, 0x3F60080400000000              ; u = uxf * (1/511)
//   %8  = insertelement <2 x float> undef, %7, i64 0          ; uv.x = u
//   %9  = extractelement <2 x i32> %0, i64 1                  ; uy = gid.y
//   %10 = call fast float @air.convert.f.f32.u.i32(%9)        ; uyf
//   %11 = fmul fast float %10, 0x3F70101020000000             ; v = uyf * (1/255)
//   %12 = insertelement <2 x float> %8, %11, i64 1            ; uv = (u, v)
//   %13 = call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(...)   ; sample tex at uv
//   %14 = extractvalue { <4 x half>, i8 } %13, 0              ; rgba_h = %13[0]
//   %15 = load i32, @_ZL8num_bins                             ; nb = num_bins
//   %16 = add i32 %15, -1                                     ; nbm1 = nb - 1 (i32 wrap)
//   %17 = call fast float @air.convert.f.f32.u.i32(%16)       ; nbm1f = (float)nbm1
//   %18 = getelementptr state, i64 0, i32 3                   ; -> &state->computation
//   %19 = load i32 %18                                        ; comp = state->computation
//   switch %19, default->bb71, [0->bb20, 1->bb41]
//
// bb20 (luma histogram, comp == 0):
//   %21..%29: extract rgba_h[0..2], fpext to f32 -> rgb (<3 x float>)
//   %30 = getelementptr state, i64 0, i32 1, i32 0, i64 0    ; -> &state->rgb2ycc.rows[0]
//   %31 = load <3 x float> %30                                ; ycc_row0
//   %32 = call fast float @air.dot.v3f32(rgb, ycc_row0)       ; luma = dot(rgb, ycc_row0)
//   %33 = fmul fast float %32, 0x3FE5559B40000000             ; slope = luma * 0.66670
//   %34 = fadd fast float %33, 0x3FC5555560000000             ; shifted = slope + 0.16667
//   %35 = call fast float @air.fast_clamp.f32(%34, 0.0, 1.0)  ; c = clamp(shifted, 0, 1)
//   %36 = fmul fast float %35, %17                            ; scaled = c * nbm1f
//   %37 = call i32 @air.convert.u.i32.f.f32(%36)              ; bin  = (uint)scaled (trunc)
//   %38 = zext i32 %37 to i64
//   %39 = getelementptr histo, i64 %38, i32 0                 ; -> &histo[bin].__s
//   %40 = call i32 @air.atomic.global.add.u.i32(%39, 1, 0, 2, true)   ; atomicAdd(1)
//   br bb71
//
// bb41 (RGB channelwise histograms, comp == 1):
//   %42 = fmul fast <4 x half> rgba_h, <2/3 in fp16 x4>       ; rgba_h * 2/3  (elementwise)
//   %43 = fadd fast <4 x half> %42, <1/6 in fp16 x4>          ; + 1/6  (elementwise)
//   %44 = call fast <4 x half> @air.clamp.v4f16(%43, 0, 1)    ; clamped fp16 in [0,1]
//   %45..%48: extract %44[0] (R), fpext to f32, multiply by nbm1f, convert to uint
//                                                              ; binR = clamped_R * nbm1f -> uint
//   %49 = zext i32 %48 to i64                                 ; hR = binR
//   %50..%55: same for G, with an additional (float)nb (=%53) added to the scaled value
//                                                              ; binG = (uint)(clamped_G * nbm1f + nb)
//                                                              ; -> lies in [nb, 2*nb)
//   %56 = zext i32 %55 to i64                                 ; hG = binG
//   %57..%63: same for B, but adds 2*nb (via shl i32 nb, 1)
//                                                              ; binB = (uint)(clamped_B * nbm1f + 2*nb)
//                                                              ; -> lies in [2*nb, 3*nb)
//   %64 = zext i32 %63 to i64                                 ; hB = binB
//   %65..%66: atomicAdd(histo[hR], 1)
//   %67..%68: atomicAdd(histo[hG], 1)
//   %69..%70: atomicAdd(histo[hB], 1)
//   br bb71
//
// bb71: ret void
//
// A subtle asymmetry in bb41: the R channel scales in bin space FIRST and
// then converts to uint (no +offset), while the G/B channels add `nb` /
// `2*nb` (as f32) BEFORE converting to uint. In the fast-math regime with
// clamp already in [0,1] and nb typically ≥ 4, none of the operations
// overflow uint32, and truncation-toward-zero matches. We preserve the
// exact operation order for bit-exactness.

// ---------------------------------------------------------------------------
// Constant decodes.
// ---------------------------------------------------------------------------

/** `float 0x3F60080400000000` — the fp32 image of 1/511.
 *  Used at .ll line %7 as the u-axis scale on gid.x (UV normalization for a
 *  512-wide sampling grid: gid.x ∈ [0, 511] -> u ∈ [0, 1]). */
const U_SCALE_1_OVER_511: number = Math.fround(0.001956947147846222);

/** `float 0x3F70101020000000` — the fp32 image of 1/255.
 *  Used at .ll line %11 as the v-axis scale on gid.y (UV normalization for a
 *  256-tall sampling grid). */
const V_SCALE_1_OVER_255: number = Math.fround(0.003921568859368563);

/** `float 0x3FE5559B40000000` — the fp32 image of the fp16 value 0.66650390625,
 *  itself the fp16 image of 2/3.
 *  Used at .ll line %33 as the luma slope for the [0,1] -> [1/6, 5/6] remap
 *  in the luma-histogram path. */
const LUMA_SLOPE_TWO_THIRDS_F32: number = Math.fround(0.666700005531311);

/** `float 0x3FC5555560000000` — the fp32 image of the fp16 value 0.16650390625,
 *  itself the fp16 image of 1/6.
 *  Used at .ll line %34 as the luma bias. */
const LUMA_BIAS_ONE_SIXTH_F32: number = Math.fround(0.1666666716337204);

/** `half 0xH3955` — the fp16 image of 2/3 (== 0.66650390625).
 *  Used at .ll line %42 as the elementwise slope for the fp16 rgba path. */
const CH_SLOPE_TWO_THIRDS_F16: number = Math.fround(0.66650390625);

/** `half 0xH3155` — the fp16 image of 1/6 (== 0.16650390625).
 *  Used at .ll line %43 as the elementwise bias for the fp16 rgba path. */
const CH_BIAS_ONE_SIXTH_F16: number = Math.fround(0.16650390625);

/** `half 0xH3C00` — the fp16 image of 1.0 (exact).
 *  Used at .ll line %44 as the clamp upper bound for the fp16 rgba path. */
const F16_ONE: number = Math.fround(1.0);

// ---------------------------------------------------------------------------
// Frontier types.
// ---------------------------------------------------------------------------

/**
 * Callback signature for AIR `air.sample_texture_2d.v4f16` — the caller
 * supplies a function that, given the opaque texture handle plus a 2D UV,
 * returns the sampled RGBA as four f16-valued numbers (already narrowed to
 * fp16 by the caller's texture backend). The trailing offset/bias/min_lod
 * parameters in the intrinsic are inert here (offset=0, bias/min_lod
 * disabled, per the .ll call site) and are not modeled.
 */
export type Sample2DHalfFn<T> = (
  texture: T,
  u: number,
  v: number,
) => [number, number, number, number];

/**
 * Subset of `%struct.histogram_state_t` this kernel reads. Full struct layout
 * (from metadata !22) is documented in the file header; we only expose the
 * two fields this kernel actually loads (computation, rgb2ycc_row0).
 */
export interface HistogramComputeStateT {
  /** state->computation @off 128 — uint32 switch selector: 0=luma, 1=rgb, else no-op. */
  computation: number;
  /** state->rgb2ycc.rows[0] @off 64 — float3 (the RED-luma coefficients row of
   *  the RGB->YCbCr matrix). Used at %30/%31 to compute the luma dot product. */
  rgb2ycc_row0: readonly [number, number, number];
}

/**
 * TS translation of the AIR compute kernel `histogram_compute`.
 *
 * @param gidX       Metal `air.thread_position_in_grid.x` (uint). One
 *                   invocation per (gid.x, gid.y) sample point.
 * @param gidY       Metal `air.thread_position_in_grid.y` (uint).
 * @param histo      Histogram buffer viewed as `uint32[4*num_bins]`. Slot 0
 *                   holds the luma / R histogram (comp 0/1 respectively);
 *                   slots 1, 2 hold the G, B histograms (comp 1 only); slot 3
 *                   is untouched here (populated by histogram_Intersect).
 * @param state      Constant `histogram_state_t` — see HistogramComputeStateT.
 * @param texture    Opaque texture handle to sample (Metal texture2d<half>).
 * @param sample     Bound `air.sample_texture_2d.v4f16` callback.
 * @param num_bins   Metal function constant `num_bins` (see !24).
 *
 * @shader histogram_compute (Flexo)
 */
export function histogram_compute<T>(
  gidX: number,
  gidY: number,
  histo: Uint32Array,
  state: HistogramComputeStateT,
  texture: T,
  sample: Sample2DHalfFn<T>,
  num_bins: number,
): void {
  // %5  = extractelement <2 x i32> %0, i64 0  -> ux = gid.x
  // %6  = call fast float @air.convert.f.f32.u.i32(%5)
  // %7  = fmul fast float %6, 0x3F60080400000000       -> u = ux * (1/511)
  const uxf = Math.fround(gidX >>> 0);
  const u = Math.fround(uxf * U_SCALE_1_OVER_511);

  // %9  = extractelement <2 x i32> %0, i64 1  -> uy = gid.y
  // %10 = call fast float @air.convert.f.f32.u.i32(%9)
  // %11 = fmul fast float %10, 0x3F70101020000000     -> v = uy * (1/255)
  const uyf = Math.fround(gidY >>> 0);
  const v = Math.fround(uyf * V_SCALE_1_OVER_255);

  // %13 = call @air.sample_texture_2d.v4f16(tex, sampler, uv, ...)
  // %14 = extractvalue { <4 x half>, i8 } %13, 0     -> rgba_h
  //   sampler options: offset_valid=true+<0,0> offset, bias_valid=false,
  //   min_lod_clamp=0.0, LOD=0.0 -- all inert. Modeled per the file header.
  const rgba_h = sample(texture, u, v);

  // %15 = load @_ZL8num_bins
  const nb = num_bins >>> 0;
  // %16 = add i32 %15, -1
  const nbm1 = (nb - 1) | 0;
  // %17 = call fast float @air.convert.f.f32.u.i32(%16)
  const nbm1f = Math.fround(nbm1 >>> 0);

  // %18/%19: load state->computation
  const comp = state.computation >>> 0;

  // switch %19, default->bb71, [0->bb20, 1->bb41]
  if (comp === 0) {
    // ---- bb20: LUMA HISTOGRAM ----
    // %21..%29: rgb = <rgba_h[0], rgba_h[1], rgba_h[2]> (fpext half -> float)
    //   Every finite fp16 has a bit-exact fp32 image, so fpext is lossless.
    const r = Math.fround(rgba_h[0]);
    const g = Math.fround(rgba_h[1]);
    const b = Math.fround(rgba_h[2]);

    // %30/%31: load state->rgb2ycc.rows[0]
    const row0 = state.rgb2ycc_row0;

    // %32 = call fast float @air.dot.v3f32(rgb, row0)  -> luma
    //   dot3 in fp32; fast-math flags allow left-to-right accumulation
    //   with Math.fround at the end.
    const luma = Math.fround(
      Math.fround(r * row0[0]) +
        Math.fround(g * row0[1]) +
        Math.fround(b * row0[2]),
    );

    // %33 = fmul fast float %32, 2/3   -> slope
    const slope = Math.fround(luma * LUMA_SLOPE_TWO_THIRDS_F32);
    // %34 = fadd fast float %33, 1/6   -> shifted
    const shifted = Math.fround(slope + LUMA_BIAS_ONE_SIXTH_F32);
    // %35 = call fast float @air.fast_clamp.f32(%34, 0.0, 1.0)  -> c
    //   air.fast_clamp.f32 with the fast-math flags is equivalent to
    //   max(0, min(1, x)) for finite non-NaN inputs. The clamp bounds are
    //   fp32-exact (0.0 and 1.0).
    const c = Math.fround(Math.max(0.0, Math.min(1.0, shifted)));
    // %36 = fmul fast float %35, %17   -> scaled
    const scaled = Math.fround(c * nbm1f);
    // %37 = call i32 @air.convert.u.i32.f.f32(%36)  -> bin (truncate)
    //   For scaled ∈ [0, nbm1f], truncate-toward-zero equals Math.floor.
    const bin = Math.trunc(scaled) >>> 0;
    // %39/%40: atomicAdd(histo[bin], 1)
    //   ordering=0 (relaxed), scope=2 (device), volatile=true. Single-
    //   threaded TS caller sees this as a plain non-atomic increment.
    histo[bin] = (histo[bin] + 1) >>> 0;
    return;
  }

  if (comp === 1) {
    // ---- bb41: RGB CHANNELWISE HISTOGRAMS ----
    //
    // The channelwise arithmetic in the .ll is done in fp16, not fp32. The
    // half-precision intermediate values matter because 2/3 and 1/6 are
    // NOT exactly representable in fp16 — the fp16 images are 0.66650390625
    // and 0.16650390625, decoded above. We use Math.fround for a single
    // f32-narrowing pass (JS has no native f16), but pin the constants to
    // their fp16 images so the shifted values match the AIR intermediate
    // fp16 values on the same-magnitude inputs.

    // %42 = fmul fast <4 x half> rgba_h, <2/3 f16 x4>
    // %43 = fadd fast <4 x half> %42, <1/6 f16 x4>
    // %44 = air.clamp.v4f16(%43, 0, 1)   -> clamped in fp16 [0,1]
    const rC = Math.fround(
      Math.max(
        0.0,
        Math.min(F16_ONE, Math.fround(rgba_h[0]) * CH_SLOPE_TWO_THIRDS_F16 + CH_BIAS_ONE_SIXTH_F16),
      ),
    );
    const gC = Math.fround(
      Math.max(
        0.0,
        Math.min(F16_ONE, Math.fround(rgba_h[1]) * CH_SLOPE_TWO_THIRDS_F16 + CH_BIAS_ONE_SIXTH_F16),
      ),
    );
    const bC = Math.fround(
      Math.max(
        0.0,
        Math.min(F16_ONE, Math.fround(rgba_h[2]) * CH_SLOPE_TWO_THIRDS_F16 + CH_BIAS_ONE_SIXTH_F16),
      ),
    );

    // %45..%48: R channel bin index
    //   %46 = fpext half %45 to float
    //   %47 = fmul fast float %17, %46      -> nbm1f * rC
    //   %48 = call i32 @air.convert.u.i32.f.f32(%47)
    const binR = Math.trunc(Math.fround(nbm1f * rC)) >>> 0;

    // %50..%55: G channel bin index
    //   %51 = fpext half %50 to float
    //   %52 = fmul fast float %17, %51      -> nbm1f * gC
    //   %53 = call fast float @air.convert.f.f32.u.i32(%15)   -> nbf
    //   %54 = fadd fast float %52, %53      -> nbm1f*gC + nbf
    //   %55 = call i32 @air.convert.u.i32.f.f32(%54)
    const nbf = Math.fround(nb >>> 0);
    const binG = Math.trunc(Math.fround(Math.fround(nbm1f * gC) + nbf)) >>> 0;

    // %57..%63: B channel bin index
    //   %58 = fpext half %57 to float
    //   %59 = fmul fast float %17, %58        -> nbm1f * bC
    //   %60 = shl i32 %15, 1                  -> 2*nb (i32 shift)
    //   %61 = call fast float @air.convert.f.f32.u.i32(%60)   -> 2*nbf
    //   %62 = fadd fast float %61, %59        -> 2*nbf + nbm1f*bC
    //   %63 = call i32 @air.convert.u.i32.f.f32(%62)
    const twoNb = (nb << 1) >>> 0;
    const twoNbf = Math.fround(twoNb);
    const binB = Math.trunc(Math.fround(twoNbf + Math.fround(nbm1f * bC))) >>> 0;

    // %65..%70: three atomicAdds
    histo[binR] = (histo[binR] + 1) >>> 0;
    histo[binG] = (histo[binG] + 1) >>> 0;
    histo[binB] = (histo[binB] + 1) >>> 0;
    return;
  }

  // ---- bb71 (default): no-op ----
  //   Any computation value other than 0 or 1 leaves `histo` unchanged.
  //   ret void
}
