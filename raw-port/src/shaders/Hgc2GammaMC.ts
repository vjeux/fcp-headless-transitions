// @shader Hgc2GammaMC (Helium)  @0x00003812
// Direct TS mapping of the AIR fragment shader in
// raw-port/re/shaders/Hgc2GammaMC.ll (metallib symbol offset 0x00003812). Per-channel signed-power gamma with a
// separate exponent for alpha, and a sign-preservation rule for input < 0.
// Fast-math (afn, no-signed-zeros, unsafe-fp) lives in the .ll; we transcribe
// as fp32 with Math.fround.
//
// AIR IR signature: `<4 x float> @Hgc2GammaMC(<4 x float> %0, <4 x float> %1,
//   texture2d %2, sampler %3, float4* addrspace(2) %4)`.
//   %0 = position (unused)
//   %1 = texcoord0
//   %2 = texture0, %3 = sampler0
//   %4 = params buffer: params[0] = RGB gamma vec4, params[1] = alpha gamma vec4

type Vec4 = [number, number, number, number];
type SampleFn = (tex: number, sampler: number, uv: [number, number]) => Vec4;

/**
 * Hgc2GammaMC — %5 (entry). Returns float4.
 */
export function Hgc2GammaMC( // @shader Hgc2GammaMC (Helium)
  _position: Vec4,          // %0
  texcoord0: Vec4,          // %1
  texture0: number,         // %2
  sampler0: number,         // %3
  params: Float32Array,     // %4 — 8 floats: params[0..3] = rgbGamma.xyzw, params[4..7] = alphaGamma.xyzw
  sample: SampleFn,
): Vec4 {
  const fr = Math.fround;

  // %6 = load params[0] (16-byte aligned vec4)
  const g_rgb: Vec4 = [ // %6
    fr(params[0]), fr(params[1]), fr(params[2]), fr(params[3]),
  ];
  // %7 = getelementptr params[1] ; %8 = load
  const g_a: Vec4 = [ // %8
    fr(params[4]), fr(params[5]), fr(params[6]), fr(params[7]),
  ];

  // %9 = shufflevector %1, <2 x i32> <0,1> → uv
  const uv: [number, number] = [texcoord0[0], texcoord0[1]]; // %9
  // %10 = air.sample_texture_2d(...) ; %11 = extractvalue 0
  const s = sample(texture0, sampler0, uv); // %10 %11

  // %12 = air.fast_fabs.v4f32(%11) — |s|
  const a: Vec4 = [ // %12
    fr(Math.abs(s[0])),
    fr(Math.abs(s[1])),
    fr(Math.abs(s[2])),
    fr(Math.abs(s[3])),
  ];

  // Per-channel pow chain: %15/%19/%23 build lanes 0/1/2 of an rgb pow.
  // %13 = |s|.x ; %14 = g_rgb.x ; %15 = fast_pow(%13, %14)
  const rgb0 = fr(Math.pow(a[0], g_rgb[0])); // %15
  const rgb1 = fr(Math.pow(a[1], g_rgb[1])); // %19
  const rgb2 = fr(Math.pow(a[2], g_rgb[2])); // %23

  // Alpha pow uses the vector form on splat-w:
  // %25 = shufflevector %12, <3,3,3,3> → (|s|.w, |s|.w, |s|.w, |s|.w)
  // %26 = air.fast_pow.v4f32(%25, %8) — alpha gamma applied component-wise
  const aw = a[3];
  const alphaPow: Vec4 = [ // %26
    fr(Math.pow(aw, g_a[0])),
    fr(Math.pow(aw, g_a[1])),
    fr(Math.pow(aw, g_a[2])),
    fr(Math.pow(aw, g_a[3])),
  ];

  // %27 = fcmp ogt %12, 0 (per lane) — mask of "|s| > 0"
  // %28 = select %27 ? %26 : <0,0,0,undef>  — zero out alpha-pow lanes where |s|==0
  const gate0 = a[0] > 0 ? alphaPow[0] : 0; // %27 lane0 / %28 lane0
  const gate1 = a[1] > 0 ? alphaPow[1] : 0; // %27 lane1 / %28 lane1
  const gate2 = a[2] > 0 ? alphaPow[2] : 0; // %27 lane2 / %28 lane2
  // Lane 3 of %28 is the `undef` slot in the select's else-vector; the shuffle
  // at %30 replaces lane 3 with %12.w regardless, so the select value here is
  // irrelevant. Using alphaPow[3] preserves the IR shape without leaking undef.
  const gate3 = a[3] > 0 ? alphaPow[3] : 0; // %27 lane3 / %28 lane3

  // %29 = %28 * %24  — where %24 = insertelement-chain of (rgb0, rgb1, rgb2, undef)
  //   IR builds %24 from three insertelement ops (lanes 0..2), leaving lane 3 undef.
  //   The subsequent shuffle at %30 explicitly replaces lane 3 with |s|.w, so the
  //   undef never escapes.
  const m0 = fr(gate0 * rgb0); // %29 lane0
  const m1 = fr(gate1 * rgb1); // %29 lane1
  const m2 = fr(gate2 * rgb2); // %29 lane2
  const m3 = fr(gate3 * fr(0));  // %29 lane3 (0 * undef → 0 under fast-math; but immediately overwritten by %30)

  // %30 = shufflevector %29, %12, <0,1,2,7> — take rgb from %29, w from %12 (=|s|.w)
  const gated: Vec4 = [m0, m1, m2, a[3]]; // %30 (m3 discarded)
  void m3;

  // %31 = fsub -0.0, %30  → negation per lane
  const negGated: Vec4 = [fr(-gated[0]), fr(-gated[1]), fr(-gated[2]), fr(-gated[3])]; // %31

  // %32 = fcmp olt %11, 0  — original signed input < 0 per lane
  // %33 = select %32 ? %31 : %30  — restore sign of original input
  return [ // %33
    s[0] < 0 ? negGated[0] : gated[0],
    s[1] < 0 ? negGated[1] : gated[1],
    s[2] < 0 ? negGated[2] : gated[2],
    s[3] < 0 ? negGated[3] : gated[3],
  ];
}
