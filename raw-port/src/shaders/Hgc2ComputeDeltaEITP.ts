// @shader Hgc2ComputeDeltaEITP (Helium)
// Direct TS mapping of the AIR fragment shader in
// raw-port/re/shaders/Hgc2ComputeDeltaEITP.ll. Computes an ITU-R BT.2124-0
// ΔEITP color-difference metric between two sampled BT.2020 PQ-encoded texture
// pixels. Fast-math flags (reassoc/afn) live only in the .ll — we transcribe
// the operations in fp32 (Math.fround) as the intrinsic .f32 variants demand.
//
// AIR IR header: `<4 x float> @Hgc2ComputeDeltaEITP(<4 x float> %0, <4 x float>
// %1, ..., <4 x float> %9, %struct.fragmentUniforms* %10, texture2d %11,
// texture2d %12, sampler %13, sampler %14)`.
//   %1 = texcoord0 (attribute 1)
//   %2 = texcoord1 (attribute 2)
//   %11 = tex0, %12 = tex1, %13 = smplr0, %14 = smplr1
//   %10 = uniforms (unused — nocapture readnone)
//
// The shader returns (deltaEITP, deltaEITP, deltaEITP, 1.0) when both samples
// have non-negative rgb; else (0,0,0,1).

type Vec4 = [number, number, number, number];
type SampleFn = (
  tex: number,
  sampler: number,
  uv: [number, number],
) => Vec4;

/**
 * Hgc2ComputeDeltaEITP — %15 (entry). Returns a float4.
 * IR-cited on every op with `%N`.
 */
export function Hgc2ComputeDeltaEITP( // @shader Hgc2ComputeDeltaEITP (Helium)
  _fragColor: Vec4,     // %0
  texcoord0: Vec4,      // %1
  texcoord1: Vec4,      // %2
  _texcoord2: Vec4,     // %3
  _texcoord3: Vec4,     // %4
  _texcoord4: Vec4,     // %5
  _texcoord5: Vec4,     // %6
  _texcoord6: Vec4,     // %7
  _texcoord7: Vec4,     // %8
  _color: Vec4,         // %9
  _uniforms: Float32Array,   // %10 (readnone — never accessed)
  tex0: number,         // %11
  tex1: number,         // %12
  smplr0: number,       // %13
  smplr1: number,       // %14
  sample: SampleFn,
): Vec4 {
  const fr = Math.fround;

  // %16 = shufflevector %1, <2 x i32> <0,1>  → uv0 = texcoord0.xy
  const uv0: [number, number] = [texcoord0[0], texcoord0[1]]; // %16
  // %17 = air.sample_texture_2d(tex0, smplr0, uv0, ...) → { rgba, i8 }; %18 = extractvalue 0
  const s0 = sample(tex0, smplr0, uv0);                        // %17 / %18
  // %19 = shufflevector %2, <2 x i32> <0,1>  → uv1 = texcoord1.xy
  const uv1: [number, number] = [texcoord1[0], texcoord1[1]]; // %19
  const s1 = sample(tex1, smplr1, uv1);                        // %20 / %25

  // %21 = shufflevector %18 → s0.rgb ; %22 = fcmp olt %21, zeroinit
  // %23 = air.any.v3i1(%22) → any(s0.rgb < 0)
  const anyNeg0 = s0[0] < 0 || s0[1] < 0 || s0[2] < 0;         // %21 %22 %23
  if (anyNeg0) {                                                // %23 br → %93 default
    // %94 phi selects <0,0,0,1> when we come from %15
    return [0, 0, 0, 1];
  }
  // %27 = fcmp olt %26, zeroinit ; %28 = any → same check on s1
  const anyNeg1 = s1[0] < 0 || s1[1] < 0 || s1[2] < 0;         // %26 %27 %28
  if (anyNeg1) {                                                // %28 br → %93 default
    return [0, 0, 0, 1];
  }

  // ---- BT.2020 → LMS matrix (Rec.2100-ICtCp, cross-primaries LMS)
  //  IR: %30 = s0.rrr ; %31 = s0.rrr * <a,b,c>   (a,b,c decoded from doubles)
  // Row0 (R coeffs) constants:
  //   0x3FDA600000000000 = 0.412109375         // %31 lane0
  //   0x3FC5580000000000 = 0.166748046875      // %31 lane1
  //   0x3F98C00000000000 = 0.024169921875      // %31 lane2
  // Row1 (G coeffs):
  //   0x3FE0C40000000000 = 0.52392578125       // %33 lane0
  //   0x3FE70E0000000000 = 0.720458984375      // %33 lane1
  //   0x3FB3500000000000 = 0.075439453125      // %33 lane2
  // Row2 (B coeffs):
  //   0x3FB0600000000000 = 0.06396484375       // %36 lane0
  //   0x3FBCE00000000000 = 0.11279296875       // %36 lane1
  //   0x3FECD00000000000 = 0.900390625         // %36 lane2
  const M00 = fr(0.412109375),   M01 = fr(0.166748046875), M02 = fr(0.024169921875);
  const M10 = fr(0.52392578125), M11 = fr(0.720458984375), M12 = fr(0.075439453125);
  const M20 = fr(0.06396484375), M21 = fr(0.11279296875),  M22 = fr(0.900390625);

  // linear RGB → LMS (BT.2020 primary set) for s0.
  // %37 = %31 + %33 + %36
  const lms0_l = fr(fr(M00 * s0[0]) + fr(M10 * s0[1]) + fr(M20 * s0[2])); // %37 lane0
  const lms0_m = fr(fr(M01 * s0[0]) + fr(M11 * s0[1]) + fr(M21 * s0[2])); // %37 lane1
  const lms0_s = fr(fr(M02 * s0[0]) + fr(M12 * s0[1]) + fr(M22 * s0[2])); // %37 lane2

  const lms1_l = fr(fr(M00 * s1[0]) + fr(M10 * s1[1]) + fr(M20 * s1[2])); // %45 lane0
  const lms1_m = fr(fr(M01 * s1[0]) + fr(M11 * s1[1]) + fr(M21 * s1[2])); // %45 lane1
  const lms1_s = fr(fr(M02 * s1[0]) + fr(M12 * s1[1]) + fr(M22 * s1[2])); // %45 lane2

  // ---- PQ inverse EOTF (ST.2084 encoding of normalized [0, 10000]-nit linear)
  //  IR: %46 = %37 * 1e-4 (splat)   — 0x3F1A36E2E0000000 = 9.999999747378752e-05
  //      %47 = %45 * 1e-4
  const PQ_INV_10K = fr(9.999999747378752e-05);
  const y0_l = fr(lms0_l * PQ_INV_10K); const y0_m = fr(lms0_m * PQ_INV_10K); const y0_s = fr(lms0_s * PQ_INV_10K); // %46
  const y1_l = fr(lms1_l * PQ_INV_10K); const y1_m = fr(lms1_m * PQ_INV_10K); const y1_s = fr(lms1_s * PQ_INV_10K); // %47

  // %48 = air.fast_pow.v3f32(%46, 0x3FC4640000000000 splat)  — m1 = 0.1593017578125
  const M1 = fr(0.1593017578125); // (2610/16384) fp32-narrowed
  const p0_l = fr(Math.pow(y0_l, M1)); // %48 lane0
  const p0_m = fr(Math.pow(y0_m, M1)); // %48 lane1
  const p0_s = fr(Math.pow(y0_s, M1)); // %48 lane2
  const p1_l = fr(Math.pow(y1_l, M1)); // %49 lane0
  const p1_m = fr(Math.pow(y1_m, M1)); // %49 lane1
  const p1_s = fr(Math.pow(y1_s, M1)); // %49 lane2

  //  %50 = %48 * 18.8515625 (0x4032DA0000000000)         (=c2*2^12/2^12 = 2413/128)
  //  %51 = %50 + 0.8359375  (0x3FEAC00000000000)         (=c1 = 3424/4096)
  //  %52 = %48 * 1.868750e+01                            (=c3 = 2392/128, literal decimal in IR)
  //  %53 = %52 + 1.0
  //  %54 = %51 / %53
  const C2 = fr(18.8515625);
  const C1 = fr(0.8359375);
  const C3 = fr(18.6875);
  const q0_l = fr(fr(fr(p0_l * C2) + C1) / fr(fr(p0_l * C3) + fr(1.0))); // %50..54 lane0
  const q0_m = fr(fr(fr(p0_m * C2) + C1) / fr(fr(p0_m * C3) + fr(1.0))); // %54 lane1
  const q0_s = fr(fr(fr(p0_s * C2) + C1) / fr(fr(p0_s * C3) + fr(1.0))); // %54 lane2
  const q1_l = fr(fr(fr(p1_l * C2) + C1) / fr(fr(p1_l * C3) + fr(1.0))); // %60 lane0
  const q1_m = fr(fr(fr(p1_m * C2) + C1) / fr(fr(p1_m * C3) + fr(1.0))); // %60 lane1
  const q1_s = fr(fr(fr(p1_s * C2) + C1) / fr(fr(p1_s * C3) + fr(1.0))); // %60 lane2

  //  %55 = air.fast_pow.v3f32(%54, 0x4053B60000000000 splat) — m2 = 78.84375 (=2523*128/2^7)
  const M2 = fr(78.84375);
  const pq0_l = fr(Math.pow(q0_l, M2)); // %55 lane0
  const pq0_m = fr(Math.pow(q0_m, M2)); // %55 lane1
  const pq0_s = fr(Math.pow(q0_s, M2)); // %55 lane2
  const pq1_l = fr(Math.pow(q1_l, M2)); // %61 lane0
  const pq1_m = fr(Math.pow(q1_m, M2)); // %61 lane1
  const pq1_s = fr(Math.pow(q1_s, M2)); // %61 lane2

  // ---- LMS → ITP linear transform (BT.2124 §7.3, ICtCp derivation)
  //   Row0 (I  coeffs) = { 0.5, 0.5, 0.0 }
  //   Row1 (Ct coeffs) = { 0x3FF9D20000000000=1.61376953125,
  //                        0xC00A968000000000=-3.323486328125,
  //                        0x3FFB5B0000000000=1.709716796875 } — halved later at %79/%83
  //   Row2 (Cp coeffs) = { 0x4011834000000000=4.378173828125,
  //                        0xC010FB8000000000=-4.24560546875,
  //                        0xBFC0F80000000000=-0.132568359375 }
  //  IR: %63/%65/%68 form a per-lane fma chain from (pq_l, pq_m, pq_s).
  const R00 = fr(0.5);              const R01 = fr(0.5);              const R02 = fr(0.0);
  const R10 = fr(1.61376953125);    const R11 = fr(-3.323486328125);  const R12 = fr(1.709716796875);
  const R20 = fr(4.378173828125);   const R21 = fr(-4.24560546875);   const R22 = fr(-0.132568359375);

  // For pixel 0: itp0 = R * pq0
  const itp0_I  = fr(fr(R00 * pq0_l) + fr(R01 * pq0_m) + fr(R02 * pq0_s)); // %69 lane0
  const itp0_Ct = fr(fr(R10 * pq0_l) + fr(R11 * pq0_m) + fr(R12 * pq0_s)); // %69 lane1
  const itp0_Cp = fr(fr(R20 * pq0_l) + fr(R21 * pq0_m) + fr(R22 * pq0_s)); // %69 lane2

  const itp1_I  = fr(fr(R00 * pq1_l) + fr(R01 * pq1_m) + fr(R02 * pq1_s)); // %77 lane0
  const itp1_Ct = fr(fr(R10 * pq1_l) + fr(R11 * pq1_m) + fr(R12 * pq1_s)); // %77 lane1
  const itp1_Cp = fr(fr(R20 * pq1_l) + fr(R21 * pq1_m) + fr(R22 * pq1_s)); // %77 lane2

  // %78 = extractelement %69, 1 ; %79 = %78 * 0.5 ; %80 = insertelement ; %81 = shuffle
  //   → itp0.Ct is halved in place. Same for itp1.Ct at %82/%83/%84/%85.
  // (BT.2124's Ct axis is stored at half-scale for the perceptual metric.)
  const I0  = itp0_I;
  const Ct0 = fr(itp0_Ct * fr(0.5)); // %79
  const Cp0 = itp0_Cp;

  const I1  = itp1_I;
  const Ct1 = fr(itp1_Ct * fr(0.5)); // %83
  const Cp1 = itp1_Cp;

  // %86 = %81 - %85  ; %87 = dot(%86,%86) ; %88 = fast_sqrt(%87)
  const dI  = fr(I0  - I1);
  const dCt = fr(Ct0 - Ct1);
  const dCp = fr(Cp0 - Cp1);
  const distSq = fr(fr(dI * dI) + fr(dCt * dCt) + fr(dCp * dCp)); // %87 air.dot.v3f32
  const dist   = fr(Math.sqrt(distSq));                             // %88 air.fast_sqrt.f32

  // %89 = %88 * 720.0  — the BT.2124 ΔEITP scale factor.
  const dEITP = fr(dist * fr(720.0)); // %89

  // %90..92 broadcast to xyz, w = 1.0
  return [dEITP, dEITP, dEITP, fr(1.0)]; // %90 %91 %92 phi → %94 → ret
}
