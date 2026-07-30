// toneMap_BT2446_A_DisplayLinearToGamma — free function in ProCore.framework.
//
// Faithful line-for-line transcription of:
//   __Z37toneMap_BT2446_A_DisplayLinearToGammaDv3_ff   @ProCore 0x34f2..0x366b
//   raw-port/re/disasm/ProCore.__Z37toneMap_BT2446_A_DisplayLinearToGammaDv3_ff.s
//
// SIGNATURE (Itanium C++ mangling `Dv3_ff` = `float __vector(3), float`):
//   float3 toneMap_BT2446_A_DisplayLinearToGamma(float3 rgbLinear, float unusedArg);
// The 2nd float argument (xmm1 on entry, alpha or diagnostic) is IMMEDIATELY overwritten
// by `xorps %xmm1,%xmm1` @0x34fa. Only rgbLinear is used.
//
// ALGORITHM — BT.2446 Method A HDR-to-SDR tone map, in the "display linear" → gamma domain,
// with a BT.2020 non-constant-luminance YCbCr reconstruction:
//
//   1. clamp rgb to [0, +inf), zero the .w lane                  @0x34fa/34fd/3500
//   2. R'G'B' = pow(rgb, 1/2.4)   (per-channel gamma 2.4)         @0x3506..350d
//   3. Y'  = 0.2627*R' + 0.6780*G' + 0.0593*B'  (BT.2020 luma)   @0x3512..352a
//   4. Y_p = ln(Y'*12.2598 + 1) / 2.5847  (BT.2446-A log encode) @0x352e..3556
//   5. Y_c piecewise (matches BT.2446-A Method A gamut mapping):
//        Y_p ≤ 0.7399               →  Y_c = 1.077 * Y_p         @0x359e
//        0.7399 < Y_p < 0.9909      →  Y_c = -1.151*Y_p² + 2.7811*Y_p - 0.6302   @0x3579..359c
//        Y_p ≥ 0.9909 (or NaN)      →  Y_c = 0.5*Y_p + 0.5       @0x35a8..35b4
//   6. Y_hat = (5.696958^Y_c - 1) / 4.696958   (inverse log)     @0x35b8..35d5
//   7. denom = max(1.1 * Y', 2^-24)  (safe-divide floor)         @0x35d5..3604
//      scale = Y_hat / denom
//      Cb'  = (B' - Y') / 1.8814 * scale                          (post-scale B-diff)
//      Cr'  = (R' - Y') / 1.4746 * scale                          (post-scale R-diff)
//   8. Y_hat_desat = Y_hat - max(0, 0.1 * Cr')                   @0x362e..3641
//   9. out.R = Y_hat_desat + 1.4746 * Cr'                        @0x3657..3665
//      out.G = Y_hat_desat + (-0.16455312) * Cb' + (-0.5713531) * Cr'
//      out.B = Y_hat_desat + 1.8814 * Cb'
//
// Coefficients @1.4746, @0.16455312, @0.5713531, @1.8814 are the exact BT.2020 inverse
// non-constant-luminance matrix rows for R, G, B respectively (see the recovered vec4 constants
// at @ProCore 0xe1c50 / 0xe1c60 / 0xe1c70 — the disasm loads them directly).
//
// EXTERN CALLS (out-of-scope — libc/simd math, modelled as boundary stubs):
//   __simd_pow_f4   @0xde768  — Apple libsystem simd vector pow (per-lane pow(base, exp)).
//                               Called ONCE @0x350d with xmm0=rgb, xmm1=1/2.4 broadcast.
//   _logf           @0xde930  — libm scalar logf.  Called ONCE @0x3546.
//   _powf           @0xdea50  — libm scalar powf.  Called ONCE @0x35c0 with xmm0=5.696958, xmm1=Y_c.
// These externs are called through inline wrapper functions (no throws) — every arithmetic
// op inside the body is transcribed inline from the disassembly.
//
// NUMERIC FIDELITY:
//   All ops are single-precision (mulss/movss/addss/divss/etc.). Every intermediate is wrapped
//   in Math.fround so JS f64 promotion does not diverge from FCP's f32 register values.
//
// CONSTANTS (each read address is a real file offset in ProCore.framework, x86_64 slice):
//   @0xe1c30 vec4  (0.4166666567325592, 0.4166666567325592, 0.4166666567325592, 0.0)  ; 1/2.4 broadcast
//   @0xe1c40 vec4  (0.26269999146461487, 0.6779999732971191, 0.059300001710653305, 0.0)  ; BT.2020 luma weights
//   @0xe1c50 vec4  (1.4745999574661255, 0, 0, 0)                                    ; R-diff scaler numerator
//   @0xe1c60 vec4  (0.0, -0.16455312073230743, 1.8813999891281128, 0.0)              ; row from Cb inverse-matrix
//   @0xe1c70 vec4  (1.4745999574661255, -0.5713531374931335, 0.0, 0.0)               ; row from Cr inverse-matrix
//   @0xe1f70 f32   1.0                                                              ; addss const
//   @0xe1f74 f32   12.259798049926758                                               ; BT.2446-A: log-arg gain
//   @0xe1f78 f32   2.5847368240356445                                               ; BT.2446-A: log divisor
//   @0xe1f7c f32   0.7398999929428101                                               ; Y_p threshold #1
//   @0xe1f80 f32   1.0770000219345093                                               ; linear-branch gain
//   @0xe1f84 f32   0.9908999800682068                                               ; Y_p threshold #2
//   @0xe1f88 f32   0.5                                                              ; clamp-branch scale/bias
//   @0xe1f8c f32   -1.1510000228881836                                              ; quadratic-branch a coeff
//   @0xe1f90 f32   2.781100034713745                                                ; quadratic-branch b coeff
//   @0xe1f94 f32   -0.6302000284194946                                              ; quadratic-branch c coeff
//   @0xe1f98 f32   5.696958065032959                                                ; pow base for inverse log
//   @0xe1f9c f32   -1.0                                                             ; pow-1 addend
//   @0xe1fa0 f32   4.696958065032959                                                ; pow-1 divisor
//   @0xe1fa4 f32   1.1                                                              ; denom gain on Y'
//   @0xe1fa8 f32   5.960464477539063e-08  (= 2^-24)                                 ; denom safe-min
//   @0xe1fac f32   1.8813999891281128                                               ; Cb divisor
//   @0xe1fb0 f32   0.1                                                              ; desaturation coefficient

// ── libm / simd boundary stubs (each cites its call-site addr) ─────────────────────────────

/** __simd_pow_f4 @ProCore 0xde768 — Apple libsystem simd vector pow, per-lane pow(base, exp). */
function __simd_pow_f4_call(
  base: [number, number, number, number],
  exp: [number, number, number, number],
): [number, number, number, number] {
  // libc/simd extern — modelled as a per-lane Math.pow with float-rounding to match ss/ps semantics.
  return [
    Math.fround(Math.pow(base[0], exp[0])),
    Math.fround(Math.pow(base[1], exp[1])),
    Math.fround(Math.pow(base[2], exp[2])),
    Math.fround(Math.pow(base[3], exp[3])),
  ];
}

/** _logf @ProCore 0xde930 — libm scalar logf. */
function logf(x: number): number { return Math.fround(Math.log(x)); }

/** _powf @ProCore 0xdea50 — libm scalar powf. */
function powf(x: number, y: number): number { return Math.fround(Math.pow(x, y)); }

// ── Recovered constants (each cites its read address) ─────────────────────────────────────

// @0xe1c30 — 1/2.4 broadcast for pow exponent
const K_INV_GAMMA_2P4 = Math.fround(0.4166666567325592);              // @0xe1c30

// @0xe1c40 — BT.2020 non-constant luminance weights (R, G, B, 0)
const K_LUMA_R = Math.fround(0.26269999146461487);                    // @0xe1c40+0
const K_LUMA_G = Math.fround(0.6779999732971191);                     // @0xe1c40+4
const K_LUMA_B = Math.fround(0.059300001710653305);                   // @0xe1c40+8

// @0xe1c50 — R-diff denominator (1.4746, 0, 0, 0)
const K_CR_DENOM = Math.fround(1.4745999574661255);                   // @0xe1c50+0

// @0xe1c60 — Cb inverse-matrix row for G:
//   (0, -0.16455..., 1.8813..., 0) — lane 1 hits G's Cb term; lane 2 hits B's Cb term (=1.8814).
const K_MAT_G_FROM_CB = Math.fround(-0.16455312073230743);            // @0xe1c60+4
const K_MAT_B_FROM_CB = Math.fround(1.8813999891281128);              // @0xe1c60+8 (same value as 0xe1fac)

// @0xe1c70 — Cr inverse-matrix row for R and G:
const K_MAT_R_FROM_CR = Math.fround(1.4745999574661255);              // @0xe1c70+0
const K_MAT_G_FROM_CR = Math.fround(-0.5713531374931335);             // @0xe1c70+4

// @0xe1f70..@0xe1fb0 — scalar constants (all f32; addresses in-line at the reads)
const K_ONE = Math.fround(1.0);                                        // @0xe1f70
const K_LOG_GAIN = Math.fround(12.259798049926758);                    // @0xe1f74
const K_LOG_DIV  = Math.fround(2.5847368240356445);                    // @0xe1f78
const K_YP_THR_LO = Math.fround(0.7398999929428101);                   // @0xe1f7c
const K_LIN_GAIN  = Math.fround(1.0770000219345093);                   // @0xe1f80
const K_YP_THR_HI = Math.fround(0.9908999800682068);                   // @0xe1f84
const K_HALF = Math.fround(0.5);                                       // @0xe1f88
const K_QUAD_A = Math.fround(-1.1510000228881836);                     // @0xe1f8c
const K_QUAD_B = Math.fround(2.781100034713745);                       // @0xe1f90
const K_QUAD_C = Math.fround(-0.6302000284194946);                     // @0xe1f94
const K_POW_BASE = Math.fround(5.696958065032959);                     // @0xe1f98
const K_MINUS_ONE = Math.fround(-1.0);                                 // @0xe1f9c
const K_POW_DIV = Math.fround(4.696958065032959);                      // @0xe1fa0
const K_DENOM_GAIN = Math.fround(1.100000023841858);                   // @0xe1fa4
const K_EPS = Math.fround(5.960464477539063e-08);                      // @0xe1fa8 = 2^-24
const K_CB_DENOM = Math.fround(1.8813999891281128);                    // @0xe1fac
const K_DESAT = Math.fround(0.10000000149011612);                      // @0xe1fb0

/**
 * `toneMap_BT2446_A_DisplayLinearToGamma(float3 rgb, float _unused)` — @ProCore 0x34f2.
 *   __Z37toneMap_BT2446_A_DisplayLinearToGammaDv3_ff
 *
 * Faithful transcription of the 60-instruction body — every op cites its source addr.
 * The second float argument is discarded by the machine (xorps %xmm1,%xmm1 @0x34fa),
 * so we accept it but ignore it here as well.
 */
export function toneMap_BT2446_A_DisplayLinearToGamma(
  rgb: [number, number, number],
  _unused: number,
): [number, number, number] {
  void _unused;

  // @0x34fa/34fd/3500 — rgb = max(rgb, 0); clear .w lane (kept implicit — we work in float3).
  //   xorps %xmm1,%xmm1;  maxps %xmm1,%xmm0;  blendps $0x8,%xmm1,%xmm0.
  const r_pos = Math.fround(Math.max(rgb[0], 0));                     // @0x34fd
  const g_pos = Math.fround(Math.max(rgb[1], 0));                     // @0x34fd
  const b_pos = Math.fround(Math.max(rgb[2], 0));                     // @0x34fd

  // @0x3506..350d — R'G'B' = pow(rgb, 1/2.4) per-lane via __simd_pow_f4.
  //   movaps 0xde723(%rip),%xmm1;  callq __simd_pow_f4.
  const gammaVec = __simd_pow_f4_call(
    [r_pos, g_pos, b_pos, 0],
    [K_INV_GAMMA_2P4, K_INV_GAMMA_2P4, K_INV_GAMMA_2P4, 0],
  );
  const Rp = gammaVec[0];
  const Gp = gammaVec[1];
  const Bp = gammaVec[2];

  // @0x3519 — movaps %xmm0,-0x20(%rbp): save (R', G', B', 0) to stack. Read back later @0x35ed.

  // @0x3512..352a — Y' = 0.2627*R' + 0.6780*G' + 0.0593*B' via:
  //   mulps %xmm0,%xmm1        ; xmm1 = (0.2627*R', 0.6780*G', 0.0593*B', 0)
  //   movaps %xmm1,%xmm0
  //   haddps %xmm1,%xmm0       ; low = 0.2627*R' + 0.6780*G'
  //   movhlps %xmm1,%xmm1      ; xmm1[0] = 0.0593*B'
  //   addss  %xmm0,%xmm1       ; xmm1[0] = Y'
  const Yp = Math.fround(
    Math.fround(K_LUMA_R * Rp) + Math.fround(K_LUMA_G * Gp) + Math.fround(K_LUMA_B * Bp),
  );

  // @0x352e/353a/353e/3546 — Y_p_log_arg = Y' * 12.2598 + 1.0; then logf.
  const logArg = Math.fround(Math.fround(Yp * K_LOG_GAIN) + K_ONE);   // @0x353a/353e
  const logResult = logf(logArg);                                     // @0x3546

  // @0x3536 — movaps %xmm1,-0x10(%rbp): save Y' to stack. Read back later @0x35dd.

  // @0x354e — Y_p = logf(Y'*12.2598+1) / 2.5847.
  const Yp_perc = Math.fround(logResult / K_LOG_DIV);                 // @0x354e

  // @0x3556..35b8 — Piecewise Y_c(Y_p). Faithful port of the exact ucomiss branch structure:
  //
  //   movss 0xdea1e(%rip),%xmm0     ; xmm0 = 0.7399
  //   ucomiss %xmm1,%xmm0           ; flags = 0.7399 - Y_p
  //   jae 0x359e                    ; if 0.7399 >= Y_p  → LINEAR branch
  //   ucomiss 0xdea12(%rip),%xmm1   ; flags = Y_p - 0.7399
  //   jbe 0x35a8                    ; NaN sentinel → CLAMP branch (also unordered)
  //   movss 0xdea10(%rip),%xmm0     ; xmm0 = 0.9909
  //   ucomiss %xmm1,%xmm0           ; flags = 0.9909 - Y_p
  //   jbe 0x35a8                    ; if 0.9909 <= Y_p → CLAMP branch
  //   ... QUADRATIC branch ...
  //
  // Note on NaN: `ucomiss` sets CF=ZF=PF=1 on unordered, so `jae/jbe` on a NaN operand of the
  // FIRST compare (@0x355e) fires `jae` → LINEAR path. However the SECOND compare @0x3563
  // catches NaN via `jbe` and diverts to CLAMP. We reproduce that by explicit isNaN handling.
  let Yc: number;
  if (Number.isNaN(Yp_perc)) {
    // First ucomiss sets CF=PF=1 → jae fires (CF=0 required for jae; but Intel spec sets CF=1
    // on unordered so jae does NOT fire on NaN). Fall through to second ucomiss which sets
    // CF=1 → jbe fires → CLAMP branch. → Y_c = 0.5*NaN + 0.5 = NaN. We emit NaN faithfully.
    Yc = Math.fround(K_HALF * Yp_perc + K_HALF);                      // @0x35a8..35b4
  } else if (K_YP_THR_LO >= Yp_perc) {
    // @0x3561 jae → LINEAR: Y_c = 1.077 * Y_p.
    Yc = Math.fround(Yp_perc * K_LIN_GAIN);                           // @0x359e
  } else if (K_YP_THR_HI <= Yp_perc) {
    // @0x3577 jbe → CLAMP: Y_c = 0.5*Y_p + 0.5.
    Yc = Math.fround(Math.fround(K_HALF * Yp_perc) + K_HALF);         // @0x35a8..35b4
  } else {
    // @0x3579..359c QUADRATIC: Y_c = ((-1.151)*Y_p + 2.7811)*Y_p + (-0.6302).
    const t1 = Math.fround(K_QUAD_A * Yp_perc + K_QUAD_B);            // @0x3579+0x3585
    Yc = Math.fround(t1 * Yp_perc + K_QUAD_C);                        // @0x358d+0x3591
  }

  // @0x35b8..35c0 — Y_hat_raw = powf(5.696958, Y_c).
  //   movss 0xde9d8(%rip),%xmm0 ; xmm0 = 5.696958
  //   callq _powf               ; xmm0 = pow(xmm0, xmm1) = pow(5.696958, Y_c)
  const powRaw = powf(K_POW_BASE, Yc);                                // @0x35c0

  // @0x35c5/35cd — Y_hat = (Y_hat_raw - 1) / 4.696958.
  const Yhat = Math.fround(Math.fround(powRaw + K_MINUS_ONE) / K_POW_DIV);

  // @0x35d5..3604 — Chroma reconstruction (denom, Cb', Cr').
  //
  //   xmm2 = 1.1        (@0xe1fa4)
  //   xmm5 = Y'         (from -0x10(%rbp))       @0x35dd
  //   xmm2 = 1.1 * Y'                              @0x35e1
  //   xmm3 = 2^-24     (@0xe1fa8)
  //   xmm4 = (R', G', B', 0)  (from -0x20(%rbp)) @0x35ed
  //   xmm1 = xmm4                                  @0x35f1
  //   unpckhpd xmm4,xmm1 → xmm1[0] = B'           @0x35f4
  //   subss %xmm5,%xmm1 → xmm1[0] = B' - Y'        @0x35f8
  //   divss 0xde9a8(%rip),%xmm1 → xmm1[0] = (B'-Y')/1.8814  (pre-scale Cb')  @0x35fc
  //   maxss %xmm2,%xmm3 → xmm3 = max(1.1*Y', 2^-24)   (denom)                 @0x3604
  //   subss %xmm5,%xmm4 → xmm4[0] = R' - Y'                                    @0x3608
  const cbPre = Math.fround(Math.fround(Bp - Yp) / K_CB_DENOM);       // @0x35f8/35fc
  const denom = Math.fround(Math.max(Math.fround(K_DENOM_GAIN * Yp), K_EPS));  // @0x35e1/3604
  const rMinusY = Math.fround(Rp - Yp);                               // @0x3608 (xmm4[0])

  // @0x360c — insertps $0x10 %xmm0,%xmm4 : xmm4[1] = xmm0[0] = Y_hat.
  //   → xmm4 = { R' - Y', Y_hat, B', 0 }.
  // @0x3612/3619 — xmm2 = (1.4746, 0, 0, 0); insertps $0x10 xmm3 → xmm2[1] = denom.
  //   → xmm2 = { 1.4746, denom, 0, 0 }.
  // @0x361f — divps %xmm2,%xmm4 : xmm4 /= xmm2 (lane-wise, all four lanes).
  //   → xmm4 = { (R'-Y')/1.4746, Y_hat/denom, B'/0=INF, 0/0=NaN }.
  const crPre = Math.fround(rMinusY / K_CR_DENOM);                    // xmm4[0] after divps
  const scale = Math.fround(Yhat / denom);                            // xmm4[1] after divps

  // @0x3622 — movshdup %xmm4,%xmm2 : replicates lane 1 into lane 0 → xmm2[0] = scale.
  // @0x3626/362a — mulss %xmm2,%xmm1 ; mulss %xmm2,%xmm4 → post-scale chroma.
  const Cb_scaled = Math.fround(cbPre * scale);                       // @0x3626
  const Cr_scaled = Math.fround(crPre * scale);                       // @0x362a

  // @0x362e..3641 — desaturate: Y_hat_desat = Y_hat - max(0, 0.1 * Cr_scaled).
  //   movss 0xde97a(%rip),%xmm2   ; xmm2 = 0.1
  //   mulss %xmm4,%xmm2           ; xmm2 = 0.1 * Cr_scaled  (xmm4 is post-mul, lane0 = Cr_scaled)
  //   xorps %xmm3,%xmm3           ; xmm3 = 0
  //   maxss %xmm2,%xmm3           ; xmm3 = max(0, 0.1 * Cr_scaled)
  //   subss %xmm3,%xmm0           ; xmm0 = Y_hat - max(0, 0.1 * Cr_scaled)
  const desatTerm = Math.fround(Math.max(0, Math.fround(K_DESAT * Cr_scaled)));  // @0x3636/363d
  const YhatDesat = Math.fround(Yhat - desatTerm);                    // @0x3641

  // @0x3645/3649 — broadcast Y_hat_desat & Cb_scaled to full vec4 (shufps $0).
  // @0x364d — mulps 0xde60c(%rip),%xmm1 : xmm1 *= (0, -0.16455312, 1.8813999, 0).
  //   → xmm1 = { 0, -0.16455*Cb, 1.8814*Cb, 0 }.
  // @0x3654 — addps %xmm1,%xmm0.
  // @0x3657 — broadcast xmm4[0] = Cr_scaled.
  // @0x365b — mulps 0xde60e(%rip),%xmm4 : xmm4 *= (1.4746, -0.5713531, 0, 0).
  //   → xmm4 = { 1.4746*Cr, -0.5713*Cr, 0, 0 }.
  // @0x3662 — addps %xmm4,%xmm0.
  //
  //   result.R = YhatDesat + 0                    + 1.4746 * Cr_scaled
  //   result.G = YhatDesat + (-0.16455) * Cb      + (-0.5713531) * Cr_scaled
  //   result.B = YhatDesat + 1.8814 * Cb          + 0
  const outR = Math.fround(YhatDesat + Math.fround(K_MAT_R_FROM_CR * Cr_scaled));
  const outG = Math.fround(
    YhatDesat +
      Math.fround(K_MAT_G_FROM_CB * Cb_scaled) +
      Math.fround(K_MAT_G_FROM_CR * Cr_scaled),
  );
  const outB = Math.fround(YhatDesat + Math.fround(K_MAT_B_FROM_CB * Cb_scaled));

  // @0x3665..366a — leave $0x20, retq.  Return xmm0 = (R, G, B, ?).
  return [outR, outG, outB];
}
