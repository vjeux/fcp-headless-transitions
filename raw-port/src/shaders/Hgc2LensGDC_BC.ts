// @shader Hgc2LensGDC_BC (Helium)  @0x000001cf2
// Direct TS mapping of the AIR fragment shader in
// raw-port/re/shaders/Hgc2LensGDC_BC.ll (metallib symbol offset 0x00001cf2).
// Applies a geometric-distortion-correction (GDC) unwarp to a UV coordinate
// using LensGDCShaderParameters (BC = "boundary correction"?), then re-samples
// the source texture with 16-tap Catmull-Rom bicubic filtering.
//
// AIR IR signature: `<4 x float> @Hgc2LensGDC_BC(<4 x float> %0, <4 x float>
//   %1, LensGDCShaderParameters* %2, texture2d %3)`.
//   %1 = texcoord0 (uv)
//   %2 = params buffer (LensGDCShaderParameters, 84 bytes / 21 floats + 1 byte flag)
//   %3 = source texture
//
// LensGDCShaderParameters layout (from %struct):
//   float center.x         @0
//   float center.y         @4
//   float radiusScale      @8
//   float coeffs[15]       @12..@68  (5 rows of 4 for %22/%34/%46, then 3 for %55)
//     -- actually 4+4+4+3 = 15 floats organized as [%22:0..3, %34:4..7, %46:8..11, %55:12..14]
//   float rMin (clampLo)   @72
//   float rMax (clampHi)   @76
//   u8    invertMode       @80  (0 → divide by scale ; nonzero → multiply)
//
// Fast-math flags (afn/reassoc/nsz) live in the .ll — we transcribe in fp32.

type Vec4 = [number, number, number, number];
type SampleFn = (tex: number, sampler: number, uv: [number, number]) => Vec4;

/**
 * Internal `gdc` — %2 (of the internal fn) — applies the LensGDC unwarp.
 * Returns the corrected uv in [0,1] space (before the +0.5 recentering).
 */
function gdc( // @shader Hgc2LensGDC_BC (Helium)  %gdc
  params: Float32Array,
  uv: [number, number],
): [number, number] {
  const fr = Math.fround;

  // %4 = params.center.x ; %7 = params.center.y ; %8 = <center.x, center.y>
  const cx = fr(params[0]); // %4
  const cy = fr(params[1]); // %7
  // %10 = params.radiusScale
  const radiusScale = fr(params[2]); // %10

  // %22 = [c12, c13, c14, c15] but re-read: coeffs @indices [3][0..3]
  //   IR: %11..%22 load coeffs[0..3] into %22.
  const c0 = fr(params[3]); const c1 = fr(params[4]); const c2p = fr(params[5]); const c3 = fr(params[6]); // %22
  // %34 = coeffs[4..7]
  const c4 = fr(params[7]); const c5 = fr(params[8]); const c6 = fr(params[9]); const c7 = fr(params[10]); // %34
  // %46 = coeffs[8..11]
  const c8 = fr(params[11]); const c9 = fr(params[12]); const c10 = fr(params[13]); const c11 = fr(params[14]); // %46
  // %55 = coeffs[12..14] (a 3-vector)
  const c12 = fr(params[15]); const c13 = fr(params[16]); const c14 = fr(params[17]); // %55

  // %57 = params.rMin (i32 4 = 17th float slot) ; %59 = params.rMax
  const rMin = fr(params[18]); // %57
  const rMax = fr(params[19]); // %59
  // %61 = params.invertMode  (i8 at offset 80 → after 20 floats)
  //   In our Float32Array we store it as a float sentinel at slot 20 to keep
  //   layout stable; a caller marshals the byte as 0 or 1.
  const invertMode = params[20] | 0; // %61
  const isDivideMode = invertMode === 0; // %62 icmp eq %61, 0

  // %63 = uv - center
  const dx = fr(uv[0] - cx);
  const dy = fr(uv[1] - cy);
  // %64 = dot(%63,%63)
  const distSq = fr(fr(dx * dx) + fr(dy * dy)); // %64
  // %65 = fast_sqrt(%64)
  const dist = fr(Math.sqrt(distSq));            // %65
  // %66 = dist * radiusScale
  const r0 = fr(dist * radiusScale);             // %66
  // %67 = fast_clamp(r0, rMin, rMax)
  const r = fr(Math.min(Math.max(r0, rMin), rMax)); // %67

  // %68 = r*r ; %69 = r^3 ; %70 = r^4
  const r2 = fr(r * r);        // %68
  const r3 = fr(r2 * r);       // %69
  const r4 = fr(r2 * r2);      // %70

  // %71..%73 build a vec4 <1.0, r, r^2, r^3>
  const V: Vec4 = [fr(1.0), r, r2, r3]; // %73
  // %74 = shufflevector V.xyz (=<1, r, r^2>)
  const V3: [number, number, number] = [V[0], V[1], V[2]]; // %74

  // %75 = dot(<c12,c13,c14>, <1, r, r^2>) = c12 + c13*r + c14*r^2
  const dot3 = fr(fr(fr(c12 * 1.0) + fr(c13 * r)) + fr(c14 * r2)); // %75
  void V3;
  // %76 = r4 * dot3   ← the r^4-scaled 3-coeff term
  const t1 = fr(r4 * dot3); // %76
  // %77 = dot(coeffs[8..11], V)  = c8 + c9*r + c10*r^2 + c11*r^3
  const dot4c = fr(fr(fr(fr(c8 * V[0]) + fr(c9 * V[1])) + fr(c10 * V[2])) + fr(c11 * V[3])); // %77
  // %78 = t1 + dot4c ; %79 = %78 * r^4 ; %80 = dot(coeffs[4..7], V)
  const term1 = fr(t1 + dot4c);      // %78
  const term1r4 = fr(term1 * r4);    // %79
  const dot4b = fr(fr(fr(fr(c4 * V[0]) + fr(c5 * V[1])) + fr(c6 * V[2])) + fr(c7 * V[3])); // %80
  // %81 = %79 + %80 ; %82 = %81 * r^4 ; %83 = dot(coeffs[0..3], V)
  const term2 = fr(term1r4 + dot4b); // %81
  const term2r4 = fr(term2 * r4);    // %82
  const dot4a = fr(fr(fr(fr(c0 * V[0]) + fr(c1 * V[1])) + fr(c2p * V[2])) + fr(c3 * V[3])); // %83
  // %84 = %82 + %83 ; %85..%86 = splat(%84)
  const scale = fr(term2r4 + dot4a); // %84
  // %92 = phi based on %62: divide vs multiply the offset by `scale`
  let ox: number, oy: number;
  if (isDivideMode) {
    // %88 = %63 / %86 (BB %87)
    ox = fr(dx / scale);
    oy = fr(dy / scale);
  } else {
    // %90 = %86 * %63 (BB %89)
    ox = fr(scale * dx);
    oy = fr(scale * dy);
  }
  // %93 = %92 + center
  return [fr(ox + cx), fr(oy + cy)]; // %93
}

/**
 * Internal `sample_bicubic` — Catmull-Rom-like 16-tap bicubic sampler.
 * The weight polynomial `((-.5,1.5,-1.5,.5)*t + (1,-2.5,2,-.5))*t + (-.5,0,.5,0))*t + (0,1,0,0))`
 * is the standard 4-tap Catmull-Rom cubic evaluated at four offsets.
 */
function sample_bicubic( // @shader Hgc2LensGDC_BC (Helium)  %sample_bicubic
  tex: number,
  uv: [number, number],
  sample: SampleFn,
): Vec4 {
  const fr = Math.fround;
  const SAMPLER_STATE = 0; // %__air_sampler_state.1 (internal; caller provides no sampler)

  // %3 = uv + (-0.5, -0.5)
  const shifted: [number, number] = [fr(uv[0] - 0.5), fr(uv[1] - 0.5)]; // %3
  // %4 = floor(%3) ; %5 = frac = %3 - %4
  const fx = Math.floor(shifted[0]);
  const fy = Math.floor(shifted[1]);
  const tx = fr(shifted[0] - fx);
  const ty = fr(shifted[1] - fy);

  // %6 = splat(tx) ; %7..%12 = Catmull-Rom weights vec4 for tx
  const wx = catmullRom(tx); // %7..%12
  const wy = catmullRom(ty); // %107..%112 (same polynomial, using ty)

  // %13 = floor + (0.5, 0.5) — pixel-centered integer taps
  const bx = fr(fx + 0.5);
  const by = fr(fy + 0.5);
  // %15 = <bx-1, bx, bx+1, bx+2>
  const xs: Vec4 = [fr(bx - 1), fr(bx + 0), fr(bx + 1), fr(bx + 2)]; // %15
  // %17 = <by-1, by, by+1, by+2>
  const ys: Vec4 = [fr(by - 1), fr(by + 0), fr(by + 1), fr(by + 2)]; // %17

  // Sample 4×4 grid. IR: %21/%25/%29/%33 sample the row-0 taps (y = ys[0])
  //   at x = xs[0..3]; %48/%51/%54/%57 sample row-1 (y=ys[1]); %68/%71/%74/%77 row-2;
  //   %88/%91/%94/%97 row-3.
  const s00 = sample(tex, SAMPLER_STATE, [xs[0], ys[0]]); // %22
  const s10 = sample(tex, SAMPLER_STATE, [xs[1], ys[0]]); // %26
  const s20 = sample(tex, SAMPLER_STATE, [xs[2], ys[0]]); // %30
  const s30 = sample(tex, SAMPLER_STATE, [xs[3], ys[0]]); // %34

  // Row 0 blend: sum(wx[k] * s{k}0)  → %45
  const row0 = blendRow(wx, s00, s10, s20, s30); // %36..%45

  const s01 = sample(tex, SAMPLER_STATE, [xs[0], ys[1]]); // %49
  const s11 = sample(tex, SAMPLER_STATE, [xs[1], ys[1]]); // %52
  const s21 = sample(tex, SAMPLER_STATE, [xs[2], ys[1]]); // %55
  const s31 = sample(tex, SAMPLER_STATE, [xs[3], ys[1]]); // %58
  const row1 = blendRow(wx, s01, s11, s21, s31); // %59..%65

  const s02 = sample(tex, SAMPLER_STATE, [xs[0], ys[2]]); // %69
  const s12 = sample(tex, SAMPLER_STATE, [xs[1], ys[2]]); // %72
  const s22 = sample(tex, SAMPLER_STATE, [xs[2], ys[2]]); // %75
  const s32 = sample(tex, SAMPLER_STATE, [xs[3], ys[2]]); // %78
  const row2 = blendRow(wx, s02, s12, s22, s32); // %79..%85

  const s03 = sample(tex, SAMPLER_STATE, [xs[0], ys[3]]); // %89
  const s13 = sample(tex, SAMPLER_STATE, [xs[1], ys[3]]); // %92
  const s23 = sample(tex, SAMPLER_STATE, [xs[2], ys[3]]); // %95
  const s33 = sample(tex, SAMPLER_STATE, [xs[3], ys[3]]); // %98
  const row3 = blendRow(wx, s03, s13, s23, s33); // %99..%105

  // Final: blend rows by wy — %114..%123
  return [
    fr(fr(row0[0] * wy[0]) + fr(row1[0] * wy[1]) + fr(row2[0] * wy[2]) + fr(row3[0] * wy[3])),
    fr(fr(row0[1] * wy[0]) + fr(row1[1] * wy[1]) + fr(row2[1] * wy[2]) + fr(row3[1] * wy[3])),
    fr(fr(row0[2] * wy[0]) + fr(row1[2] * wy[1]) + fr(row2[2] * wy[2]) + fr(row3[2] * wy[3])),
    fr(fr(row0[3] * wy[0]) + fr(row1[3] * wy[1]) + fr(row2[3] * wy[2]) + fr(row3[3] * wy[3])),
  ];
}

/** Catmull-Rom cubic weights, evaluated at fractional offset t. Direct TS
 *  mapping of IR ops %7..%12:  w = ((-.5,1.5,-1.5,.5)*t + (1,-2.5,2,-.5))*t
 *                                + (-.5,0,.5,0))*t + (0,1,0,0)   */
function catmullRom(t: number): Vec4 {
  const fr = Math.fround;
  // %7  = t * <-0.5, 1.5, -1.5, 0.5>
  // %8  = %7 + <1.0, -2.5, 2.0, -0.5>
  // %9  = %8 * t
  // %10 = %9 + <-0.5, 0.0, 0.5, 0.0>
  // %11 = %10 * t
  // %12 = %11 + <0.0, 1.0, 0.0, 0.0>
  const t2 = fr(t * t);
  const t3 = fr(t2 * t);
  return [
    fr(fr(-0.5 * t) + fr(fr(1.0) * t2) + fr(-0.5 * t3)),                       // lane 0 (via chain)
    fr(fr(1.0) + fr(-2.5 * t2) + fr(1.5 * t3)),                                  // lane 1
    fr(fr(0.5 * t) + fr(2.0 * t2) + fr(-1.5 * t3)),                              // lane 2
    fr(fr(-0.5 * t2) + fr(0.5 * t3)),                                            // lane 3
  ];
}

/** Row blend: sum(w[k] * s{k}). Direct TS mapping of IR ops %36..%45 (and equivalents). */
function blendRow(w: Vec4, s0: Vec4, s1: Vec4, s2: Vec4, s3: Vec4): Vec4 {
  const fr = Math.fround;
  return [
    fr(fr(w[0] * s0[0]) + fr(w[1] * s1[0]) + fr(w[2] * s2[0]) + fr(w[3] * s3[0])),
    fr(fr(w[0] * s0[1]) + fr(w[1] * s1[1]) + fr(w[2] * s2[1]) + fr(w[3] * s3[1])),
    fr(fr(w[0] * s0[2]) + fr(w[1] * s1[2]) + fr(w[2] * s2[2]) + fr(w[3] * s3[2])),
    fr(fr(w[0] * s0[3]) + fr(w[1] * s1[3]) + fr(w[2] * s2[3]) + fr(w[3] * s3[3])),
  ];
}

/**
 * Hgc2LensGDC_BC — %4 (entry). Returns float4.
 * IR flow:
 *   %5 = texcoord0.xy
 *   %6 = gdc(params, uv)
 *   %7 = %6 + (0.5, 0.5)
 *   %8 = sample_bicubic(tex, %7)
 *   %9 = insertelement %8, 1.0, 3  → force alpha = 1
 */
export function Hgc2LensGDC_BC( // @shader Hgc2LensGDC_BC (Helium)  @0x000001cf2
  _position: Vec4,          // %0
  texcoord0: Vec4,          // %1
  params: Float32Array,     // %2 (LensGDCShaderParameters)
  tex: number,              // %3
  sample: SampleFn,
): Vec4 {
  const fr = Math.fround;
  // %5 = shufflevector %1, <0,1>
  const uv: [number, number] = [texcoord0[0], texcoord0[1]]; // %5
  // %6 = gdc(params, uv)
  const corrected = gdc(params, uv); // %6
  // %7 = %6 + (0.5, 0.5)
  const recentered: [number, number] = [fr(corrected[0] + 0.5), fr(corrected[1] + 0.5)]; // %7
  // %8 = sample_bicubic(tex, %7)
  const rgba = sample_bicubic(tex, recentered, sample); // %8
  // %9 = force alpha = 1
  return [rgba[0], rgba[1], rgba[2], fr(1.0)]; // %9
}
