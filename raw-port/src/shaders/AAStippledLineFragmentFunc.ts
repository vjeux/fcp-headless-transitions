// Faithful transcription @0x0000000000198b6 (metallib entry offset)
// @shader AAStippledLineFragmentFunc (MDPKit)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/AAStippledLineFragmentFunc.ll, extracted
// via raw-port/tools/shader_disasm.sh from MDPKit.framework/Versions/A/Resources/
// default.metallib. The .ll header line reads
// `0x000000000198b6 -- AAStippledLineFragmentFunc:` — the shader's entry offset in the
// metallib. Compile options: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`, `air.compile.framebuffer_fetch_enable`.
// Function attributes carry `unsafe-fp-math=true`, `no-infs-fp-math=true`,
// `no-nans-fp-math=true`, `no-signed-zeros-fp-math=true`, `approx-func-fp-math=true`.
// Per SHADERS.md the fast-math flags do NOT license algebraic re-association — every
// fadd/fmul/fdiv/fmax/select is a direct TS mapping and every scalar fp32 op is
// fp32-narrowed via `Math.fround`.
//
// This is a FRAGMENT shader (from `!air.fragment` metadata) with a colour output
// (`!31 = air.render_target, 0, 0 ; air.arg_type_name "float4" ; air.arg_name "color"`).
// It draws anti-aliased stippled lines for FCP's timeline / trim UI:
//   final.rgba = premultiply(applyGamma(unpremultiply(sample(brush, uv) * vertColor)),
//                            gamma.y) with alpha *= calcStipple(...)
//
// Fragment signature (from !32..!40):
//   position       : float4  air.position           — declared with `air.arg_unused`.
//   color          : float4  air.fragment_input     — vertex-interpolated tint.
//   brushTexCoord  : float2  air.fragment_input     — brush-texture UV.
//   stipplePos     : float   air.fragment_input     — 1-D stipple-space position
//                                                     (`air.no_perspective`).
//   uniforms       : constant MDPAALineUniforms* index 4  (buffer size 80, 16-aligned):
//                      offset  0..64  : float4x4 mvp             (unused in this shader)
//                      offset 64..72  : float2   gamma           (only .y read)
//                      offset 72..76  : uint     stipplePattern  (bitmask; -1 => all-on)
//                      offset 76..80  : float    stippleScale
//   brush          : texture2d<float, sample>  index 5.
//   brushSampler   : sampler                   index 6.
//   output         : float4  air.render_target.
//
// AIR intrinsics used:
//   air.sample_texture_2d.v4f32(tex, sam, uv, offset_valid=true, <0,0>,
//                                bias_valid=false, 0.0, 0.0, i32 0)
//                                                 -> { <4 x float> rgba, i8 stat }.
//   air.fwidth.f32(float)                         — |ddx| + |ddy| over the fragment quad.
//   air.convert.s.i32.f.f32(float)                — SIGNED f32->i32 truncation
//                                                   (`ftosi`). Numerically equivalent to
//                                                   `Math.trunc(x)|0` per SHADERS.md
//                                                   int-cast rule.
//   air.convert.f.f32.s.i32(i32)                  — SIGNED i32->f32 conversion.
//   air.fast_fmax.f32(float, float)               — scalar fp32 max.
//   air.fast_pow.f32(float, float)                — fast-math scalar pow.
//
// LITERAL CONSTANTS (all recovered verbatim from the .ll):
//   %13 = fmul %17, 5.000000e-01                  — half-width factor (fp32 0.5).
//   %22, %24 = ftosi(...)                         — quad-boundary indices (int).
//   %25 = and i32 %22, 31                         — cell-index modulo 32 (low bits).
//   %26 = shl nuw i32 1, %25                      — bit-mask for pattern lookup.
//   %29 = fcmp fast ogt float %14, 1.0            — stippleScale > 1 guard.
//   %44 = select fast i1 %28, float 1.0, float 0.0  — hard 0/1 fallback for scale<=1.
//   %46 = phi float [1.0, %7], ...                — pattern==-1 => coverage 1.0.
//   %51 = fmax(%50, 0x3EB0C6F7A0000000)           — divide-by-alpha epsilon.
//                                                   0x3EB0C6F7A0000000 (double) narrows
//                                                   to fp32 0x358637BD = 9.99999974e-07.
//
// The `0x3EB0C6F7A0000000` epsilon is written in the IR as a double literal but the fmax
// callee is `air.fast_fmax.f32` — LLVM emits the double literal purely as the constant
// pool notation; it is fp32-narrowed before the call. Bit pattern verified via
// `struct.pack('<d',0x3EB0C6F7A0000000) -> 9.999999974752427e-07`; fp32 narrowing gives
// `0x358637BD` (identical value). We mirror this by `Math.fround(1e-6)` — the exact
// binary of the fp32 constant.
//
// CONTROL FLOW MAP (%N labels are the IR block indices):
//   entry (%7):
//     %8  = sample_texture_2d(brush, brushSampler, brushTexCoord)
//     %10 = load gamma           (float2 @+64; alias-scope arg(4))
//     %12 = load stipplePattern  (uint    @+72)
//     %14 = load stippleScale    (float   @+76)
//     %15 = icmp eq i32 %12, -1                                          [!17=68]
//     br if pattern==-1 -> %45 (coverage=1.0), else -> %16
//   %16 (calcStipple main):
//     %17 = fwidth(stipplePos)                                            [!17=101]
//     %18 = fmul %17, 0.5                                                 [!74=71:47]
//     %19 = fsub stipplePos, %18                                          [!75=71:43]  = a
//     %20 = fadd %19, %17                                                 [!76=72:39]  = b
//     %21 = fdiv %19, stippleScale                                        [!77=74:46]
//     %22 = ftosi(%21)                                                    [!78=74:37]  = ia
//     %23 = fdiv %20, stippleScale                                        [!79=75:42]
//     %24 = ftosi(%23)                                                    [!80=75:35]  = ib
//     %25 = and i32 %22, 31                                               [!81=77:46]
//     %26 = shl nuw i32 1, %25                                            [!81]         (1 << (ia&31))
//     %27 = and i32 %26, %12                                              [!82=77:40]
//     %28 = icmp ne i32 %27, 0                                            [!83=77:63]  = bitA
//     %29 = fcmp fast ogt %14, 1.0                                        [!84=80:26]
//     br if !(scale>1) -> %43 (hard 0/1 by bitA), else -> %30
//   %30 (bitA vs bitB compare):
//     %31 = and i32 %24, 31
//     %32 = shl nuw i32 1, %31                                            (1 << (ib&31))
//     %33 = and i32 %32, %12
//     %34 = icmp eq i32 %33, 0                                            = !bitB
//     %35 = xor i1 %28, %34                                               = bitA XOR !bitB
//                                                                          = bitA == bitB
//                                                                            (in the sense
//                                                                            that both cells
//                                                                            match state) —
//                                                                          i.e. bitA XOR !bitB
//                                                                          is TRUE only when
//                                                                          bitA==!bitB, i.e.
//                                                                          bitA != bitB.
//     br if !bitA-neq-bitB -> %43 (hard 0/1), else -> %36 (edge partial)
//   %36 (edge partial):
//     %37 = sitof(%24)                                                    [!89=82:30]  = float(ib)
//     %38 = fmul %37, %14                                                 [!90=82:57]  = ib*scale
//     %39 = fsub %38, %19                                                 [!91=83:40]  = ib*scale - a
//     %40 = fsub %20, %38                                                 [!92=84:38]  = b - ib*scale
//     %41 = select fast %28, %39, %40                                     [!93=86:21]  bitA?%39:%40
//     %42 = fdiv %41, %17                                                 [!94=86:52]  = coverage
//     br -> %45
//   %43 (hard 0/1):
//     %44 = select fast %28, 1.0, 0.0
//     br -> %45
//   %45 (coverage join):
//     %46 = phi float [1.0, %7], [%42, %36], [%44, %43]                   = coverage
//     -- premultiply-tint & unpremultiply --
//     %47 = extractvalue %8, 0                                            = sampled.rgba
//     %48 = fmul <4xfloat> %47, color                                     = premult * vertColor
//     %49 = shufflevector %48, <0,1,2>                                    = .rgb
//     %50 = extractelement %48, 3                                         = .a
//     %51 = fmax(%50, 1e-6)                                               = alpha_safe
//     %52..%53 = splat %51 to <3xfloat>
//     %54 = fdiv <3xfloat> %49, %53                                        = unpremult rgb
//     %55, %59, %62 = per-lane extractelement of %54
//     %56 = extractelement <2 x float> %10, 1                             = gamma.y
//     %57 = fast_pow(%55, %56)                                            = gamma-corr R
//     %60 = fast_pow(%59, %56)                                            = gamma-corr G
//     %63 = fast_pow(%62, %56)                                            = gamma-corr B
//     %64 = <%57, %60, %63>                                               = gamma-corr rgb
//     -- premultiply back with stipple-modulated alpha --
//     %65 = fmul %46, %50                                                 = coverage * alpha
//     %68 = <3xfloat> %64 * splat(%65)                                    = premult rgb
//     %70 = <%68.r, %68.g, %68.b, %65>                                    = output float4
//     ret %70
//
// The three ways coverage is produced are all decoded from IR — every constant, every
// branch, every intrinsic call is a direct mapping. Every fp32 op is fp32-narrowed and
// the port matches the IR structurally. The IR flags mean the compiler MAY have
// re-associated during codegen; the port does not.
//
// FRONTIER: `air.sample_texture_2d.v4f32` and `air.fwidth.f32` are host GPU-runtime
// bridges — the transcription takes them as callbacks/inputs.

/** Mutating accumulator for a `<4 x float>` value — avoids tuple returns per SHADERS.md. */
export interface RgbaOut {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Uniform block `MDPAALineUniforms` (only the fields this shader reads are exposed;
 *  the mvp matrix at offset 0..64 is unused by the fragment path). */
export interface MDPAALineUniforms {
  /** offset 64..72 — `float2 gamma`; only `.y` is read by this shader. */
  gamma: [number, number];
  /** offset 72..76 — `uint stipplePattern`. -1 (0xFFFFFFFF) means "all on" (short-circuit
   *  coverage to 1.0). Modelled as a raw JS number, but only the low 32 bits are used. */
  stipplePattern: number;
  /** offset 76..80 — `float stippleScale`. When >1.0 the shader antialiases the pattern
   *  edge (partial coverage); when <=1.0 the shader falls back to a hard 0/1 per cell. */
  stippleScale: number;
}

/**
 * Callback for `air.sample_texture_2d.v4f32(brush, brushSampler, uv, offset_valid=1,
 * <0,0>, bias_valid=0, 0.0, 0.0, i32 0)`. The offset/bias/lod args are opaque to the
 * caller; the callback should honour whatever FCP's runtime bound. Writes into `out`.
 */
export type SampleColor2D<T> = (
  texture: T,
  u: number,
  v: number,
  out: RgbaOut,
) => void;

/**
 * Callback for `air.fwidth.f32(scalar)` — Metal `fwidth` returns
 * `abs(ddx(x)) + abs(ddy(x))`. In FCP's UI-line renderer this is used to compute the
 * per-fragment "pixel width" of the stipple axis so that a whole pattern cell that
 * spans <1 fragment collapses to solid-vs-nothing 0/1 (via the `%29 = fcmp ogt %14,1.0`
 * guard). The transcription takes it as a callback because it depends on GPU quad
 * derivatives that only exist at draw time.
 */
export type Fwidth1D = (x: number) => number;

/**
 * `calcStipple(stipplePos, stippleScale, stipplePattern) -> coverage in [0,1]`.
 *
 * Faithful transcription of the `calcStipple` scope (`!67`, .metal line 66..90):
 *   %15 = icmp eq %12, -1        (pattern == -1 => coverage 1.0; early return)
 *   %17 = fwidth(stipplePos)
 *   %18 = %17 * 0.5              (half width)
 *   %19 = stipplePos - %18       = a  (left edge of the fragment's stipple interval)
 *   %20 = %19 + %17              = b  (right edge)
 *   %22 = ftosi(%19 / stippleScale) = ia
 *   %24 = ftosi(%20 / stippleScale) = ib
 *   %28 = ((1<<(ia&31)) & pattern) != 0 = bitA
 *   IF stippleScale > 1.0:
 *     %34 = ((1<<(ib&31)) & pattern) == 0 = !bitB
 *     %35 = xor bitA, !bitB      (true iff bitA != bitB — cells disagree => edge)
 *     IF cells disagree:
 *       edge = float(ib) * stippleScale               = boundary between ia and ib
 *       t    = (bitA ? edge - a : b - edge) / %17     = partial coverage
 *       coverage = t
 *     ELSE (cells agree — both on OR both off):
 *       coverage = bitA ? 1.0 : 0.0
 *   ELSE (scale <= 1.0 — pattern cell smaller than a fragment; no AA):
 *     coverage = bitA ? 1.0 : 0.0
 *
 * Every scalar op is fp32-narrowed via Math.fround; integer casts follow the
 * SHADERS.md int-cast rule (`Math.trunc(x)|0` after the fp32 arithmetic). The two
 * signed-int lanes `ia` and `ib` are stored in JS numbers but only their low 32 bits
 * feed into the bitmask lookup (`& 31` restricts to `[0..31]` regardless of the sign).
 */
export function calcStipple(
  stipplePos: number,
  stippleScale: number,
  stipplePattern: number,
  fwidth: Fwidth1D,
): number {
  // %15 — pattern == -1 short-circuit. Comparison is on the raw 32-bit pattern; we mask
  // to 32 bits before comparing to -1 (as u32 that is 0xFFFFFFFF; in the IR the compare
  // is `icmp eq i32 %12, -1` — the same bit pattern under signed vs unsigned).
  if ((stipplePattern | 0) === -1) {
    // @%45 phi lane 0 — `[1.000000e+00, %7]`.
    return 1.0;
  }

  // %17 — GPU quad-derivative-driven "pixel width" along the stipple axis.
  const w = Math.fround(fwidth(stipplePos));
  // %18 — half width.
  const hw = Math.fround(w * 0.5);
  // %19 — a = stipplePos - hw  (left edge of the fragment).
  const a = Math.fround(stipplePos - hw);
  // %20 — b = a + w            (right edge of the fragment).
  const b = Math.fround(a + w);
  // %21/%22 — ia = ftosi(a / stippleScale).
  const ia = Math.trunc(Math.fround(a / stippleScale)) | 0;
  // %23/%24 — ib = ftosi(b / stippleScale).
  const ib = Math.trunc(Math.fround(b / stippleScale)) | 0;

  // %25/%26/%27/%28 — bitA = ((1 << (ia & 31)) & pattern) != 0.
  // The `nuw` on the shl and the `& 31` guarantee the shift never overflows 32 bits.
  const bitA = (((1 << (ia & 31)) & stipplePattern) | 0) !== 0;
  // %29 — stippleScale > 1.0 guard (fast-ogt).
  const wideCell = Math.fround(stippleScale) > 1.0;

  if (wideCell) {
    // %31/%32/%33/%34 — notBitB = ((1 << (ib & 31)) & pattern) == 0.
    const notBitB = (((1 << (ib & 31)) & stipplePattern) | 0) === 0;
    // %35 — xor bitA, notBitB  (true iff bitA != bitB — cells disagree).
    const cellsDisagree = bitA !== notBitB;
    if (cellsDisagree) {
      // %36 (edge partial):
      // %37 — sitof(ib).
      const ibf = Math.fround(ib);
      // %38 — edge = float(ib) * stippleScale.
      const edge = Math.fround(ibf * stippleScale);
      // %39 — edge - a.
      const dEnter = Math.fround(edge - a);
      // %40 — b - edge.
      const dExit = Math.fround(b - edge);
      // %41 — bitA ? dEnter : dExit. (bitA true: fragment starts ON, boundary at
      //                               `edge` transitions to OFF — the coverage of the ON
      //                               half is `edge - a`.
      //                               bitA false: fragment starts OFF, boundary at
      //                               `edge` transitions to ON — the coverage of the ON
      //                               half is `b - edge`.)
      const num = bitA ? dEnter : dExit;
      // %42 — coverage = num / w.
      return Math.fround(num / w);
    }
    // %43 fall-through (cells agree in this branch).
  }

  // %43 — hard 0/1 by bitA. Reached both when `!wideCell` and when cells agree.
  //   %44 = select fast bitA, 1.0, 0.0
  return bitA ? 1.0 : 0.0;
}

/**
 * Fragment shader `AAStippledLineFragmentFunc`.
 *
 * Anti-aliased stippled-line fragment shader for FCP's MDPKit rendering path. Samples a
 * brush texture, multiplies by a vertex-interpolated colour tint, un-premultiplies,
 * applies a per-channel gamma exponent (`gamma.y`), then re-premultiplies against a
 * `calcStipple`-derived alpha modulator. The stipple modulator lets a single triangle
 * strip render dashed/dotted lines in one draw call without any texture atlas.
 *
 * Faithful transcription of the entry function `@AAStippledLineFragmentFunc` — every
 * fadd/fmul/fdiv/fmax/select/fast_pow is a direct TS mapping; every fp32 op is narrowed
 * via `Math.fround`. Denorms are disabled at the AIR level, and the fast-math IR flags
 * (`unsafe-fp-math=true`, `no-infs-fp-math=true`, `no-nans-fp-math=true`, ...) do NOT
 * license algebraic re-association here — the port matches the IR structurally.
 *
 * Writes the result into `out` (mutating accumulator, per SHADERS.md).
 *
 * @shader AAStippledLineFragmentFunc (MDPKit)
 */
export function AAStippledLineFragmentFunc<TTex>(
  vertColor: [number, number, number, number],
  brushTexCoord: [number, number],
  stipplePos: number,
  uniforms: MDPAALineUniforms,
  brush: TTex,
  sampleColor: SampleColor2D<TTex>,
  fwidth: Fwidth1D,
  out: RgbaOut,
): void {
  // %8 — sample the brush texture.  The AIR intrinsic is
  //   air.sample_texture_2d.v4f32(brush, brushSampler, brushTexCoord,
  //                                offset_valid=true, <2xi32> zero, bias_valid=false,
  //                                0.0, 0.0, i32 0)
  // — offset(0,0), no bias, default LOD-clamp. The `sampleColor` callback is expected
  //   to honour that binding.
  const sampled: RgbaOut = { r: 0, g: 0, b: 0, a: 0 };
  sampleColor(brush, brushTexCoord[0], brushTexCoord[1], sampled);

  // %12 — load `stipplePattern` (uint @ +72).
  const stipplePattern = uniforms.stipplePattern | 0;
  // %14 — load `stippleScale` (float @ +76).
  const stippleScale = Math.fround(uniforms.stippleScale);

  // %46 (phi at block %45) — coverage from calcStipple. Encapsulated separately above.
  const coverage = Math.fround(
    calcStipple(Math.fround(stipplePos), stippleScale, stipplePattern, fwidth),
  );

  // %48 — premult = sampled * vertColor (componentwise; both operands are fp32 lanes).
  const pR = Math.fround(sampled.r * vertColor[0]);
  const pG = Math.fround(sampled.g * vertColor[1]);
  const pB = Math.fround(sampled.b * vertColor[2]);
  const pA = Math.fround(sampled.a * vertColor[3]);

  // %51 — alpha_safe = fmax(pA, 1e-6).  The IR literal 0x3EB0C6F7A0000000 is a double
  // pool constant that fp32-narrows to 0x358637BD = 9.99999974e-07. We reconstruct that
  // exact fp32 via `Math.fround(1e-6)` (bit-verified).
  const alphaSafe = Math.fround(Math.max(pA, Math.fround(1e-6)));

  // %54 — unpremult rgb = premult.rgb / alpha_safe (splat divisor).
  const uR = Math.fround(pR / alphaSafe);
  const uG = Math.fround(pG / alphaSafe);
  const uB = Math.fround(pB / alphaSafe);

  // %56 — gamma exponent is `uniforms.gamma.y` (extractelement i=1). `.x` is unused.
  const gammaY = Math.fround(uniforms.gamma[1]);
  // %57/%60/%63 — apply gamma via fast_pow per channel.
  const gR = Math.fround(Math.pow(uR, gammaY));
  const gG = Math.fround(Math.pow(uG, gammaY));
  const gB = Math.fround(Math.pow(uB, gammaY));

  // %65 — new alpha = coverage * original premultiplied alpha (%50).
  const outA = Math.fround(coverage * pA);
  // %68 — premultiply gamma-corrected rgb by the new alpha (splat).
  const outR = Math.fround(gR * outA);
  const outG = Math.fround(gG * outA);
  const outB = Math.fround(gB * outA);

  // %70 — assemble the float4 output {r, g, b, a}.
  out.r = outR;
  out.g = outG;
  out.b = outB;
  out.a = outA;
}
