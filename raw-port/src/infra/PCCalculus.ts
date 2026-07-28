// PCCalculus.ts — ProCore numerical calculus (elliptic integrals, arc-length integrals,
// polynomial evaluation). All functions transcribed line-for-line from the ProCore x86_64
// disassembly (Final Cut Pro.app/.../Frameworks/ProCore.framework/.../ProCore).
//
// DECODE:
//   raw-port/re/disasm/ProCore.PCCalculus.poly.s
//   raw-port/re/disasm/ProCore.PCCalculus.f.s
//   raw-port/re/disasm/ProCore.PCCalculus.ds.s
//   raw-port/re/disasm/ProCore.PCCalculus.ellpk.s
//   raw-port/re/disasm/ProCore.PCCalculus.ellpe.s
//   raw-port/re/disasm/ProCore.PCCalculus.LegendreEllipticF.s
//   raw-port/re/disasm/ProCore.PCCalculus.LegendreEllipticE.s
//   raw-port/re/disasm/ProCore.PCCalculus.CarlsonEllipticF.s     (stub — not yet transcribed)
//   raw-port/re/disasm/ProCore.PCCalculus.CarlsonEllipticE.s     (stub — not yet transcribed)
//   raw-port/re/disasm/ProCore.PCCalculus.ellipticE.s            (stub — not yet transcribed)
//   raw-port/re/disasm/ProCore.PCCalculus.sineLineIntegral.s     (stub — not yet transcribed)
//   raw-port/re/disasm/ProCore.PCCalculus.ellipseLineIntegral.s  (stub — not yet transcribed)
//   raw-port/re/disasm/ProCore.PCCalculus.xFromSineLength.s      (stub — not yet transcribed)
//
// @const provenance — all RIP-relative constants read directly from the ProCore x86_64 slice:
//   @0x122530 = 1.0                                (used as unity everywhere)
//   @0x122560 = 6.283185307179586      (2*pi)      (used by `f`)
//   @0x1225a0 = 3.141592653589793      (pi)        (used by `ds`)
//   @0x122588 = -5.0                               (`ellpk` error-path arg to asin: asin(-5) = NaN)
//   @0x1225a8 = -0.5                               (`ellpk`/`ellpe` small-x log coefficient)
//   @0x1225b0 = 1.3862943611198906     (ln(4))     (`ellpk` small-x constant term)
//   @0x122598 = 1.1102230246251565e-16 (~DBL_EPSILON/2) (`ellpk` small-x threshold)
//   @0x1226d0 = PCCalculus::ellpk(double)::P   (11 doubles — Cephes ellpk polynomial P)
//   @0x122730 = PCCalculus::ellpk(double)::Q   (11 doubles — Cephes ellpk polynomial Q)
//   @0x122790 = PCCalculus::ellpe(double)::P   (11 doubles — Cephes ellpe polynomial P)
//   @0x1227f0 = PCCalculus::ellpe(double)::Q   (10 doubles — Cephes ellpe polynomial Q)
//   @0x122660 = -3.0                               (`LegendreEllipticE` R_D scale)
//
// The ellpk / ellpe polynomial arrays live in ProCore's __TEXT,__const at the addresses noted
// above; both are the classical Cephes coefficient tables (see ellpk.c / ellpe.c in Cephes).
// Both are indexed starting at index 1 in the disassembly (`movl $0x1, %eax`), i.e. the loop
// evaluates a Horner polynomial of degree 10 (ellpk) or 9 (ellpe) with the tail element used as
// the seed — matching Cephes' `polevl` invocation pattern exactly.
//
// All constant addresses above are cross-referenced from `re/disasm/*.s`:
//   f       @0xb21f  mulsd 0x117339(%rip)  ->  0x122560  = 2*pi
//   ds      @0xabe6  mulsd 0x1179b2(%rip)  ->  0x1225a0  = pi
//   ds      @0xac11  addsd 0x117917(%rip)  ->  0x122530  = 1.0
//   ellpk   @0xb24e  movsd 0x1172da(%rip)  ->  0x122530  = 1.0  (upper bound check)
//   ellpk   @0xb264  ucomisd 0x11732c(%rip) -> 0x122598  = 1.1102230246251565e-16 (small-x thresh)
//   ellpk   @0xb26e  movsd 0x117342(%rip)  ->  0x1225b8  = P[0] seed
//   ellpk   @0xb298  movsd 0x117320(%rip)  ->  0x1225c0  = Q[0] seed
//   ellpk   @0xb2d7  movsd 0x1172a9(%rip)  ->  0x122588  = -5.0 (asin arg for NaN error)
//   ellpk   @0xb2ed  mulsd 0x1172b3(%rip)  ->  0x1225a8  = -0.5
//   ellpk   @0xb2f5  addsd 0x1172b3(%rip)  ->  0x1225b0  = ln(4)
//   ellpe   @0xb316  movsd 0x117212(%rip)  ->  0x122530  = 1.0 (upper bound)
//   ellpe   @0xb324  movsd 0x11724c(%rip)  ->  0x122578  = ellpe P[0] seed  (see note below)
//   ellpe   @0xb356  movsd 0x117222(%rip)  ->  0x122578  = ellpe Q[0] seed
//   ellpe   @0xb3a6  movsd 0x117182(%rip)  ->  0x122530  = 1.0 (x==0 -> E(0) = 1)
//   ellpe   @0xb3b3  movsd 0x1171cd(%rip)  ->  0x122588  = -5.0 (out-of-range -> acos(-5) = NaN)
//   Legendre F  @0xaec0  movsd 0x117668(%rip)  ->  0x122530 = 1.0
//   Legendre E  @0xb16f  movsd 0x1173b9(%rip)  ->  0x122530 = 1.0
//   Legendre E  @0xb1bf  movsd 0x117369(%rip)  ->  0x122530 = 1.0
//   Legendre E  @0xb1d1  divsd 0x117487(%rip)  ->  0x122660 = -3.0
//
// Rule 4 (single-precision) does not apply here: every op is `sd` (double-precision, cvttsd2si
// / mulsd / addsd / sqrtsd), and the libm calls are `_sin`/`_cos`/`_log`/`_asin`/`_acos`/
// `___sincos_stret` (all double-precision). No Math.fround is required.

// ---------------------------------------------------------------------------
// Cephes-derived polynomial coefficient tables read verbatim from ProCore's
// __TEXT,__const. Byte-exact via `struct.unpack_from('<d', ...)` on the thin
// x86_64 slice (see PCCalculus.ellpk.s / PCCalculus.ellpe.s for the leaq
// __ZZN10PCCalculus5ellpkEdE1P / ellpeEdE1P / ellpkEdE1Q / ellpeEdE1Q refs).
// ---------------------------------------------------------------------------

// PCCalculus::ellpk(double)::P  —  11 doubles at @ProCore 0x1226d0
const ELLPK_P: readonly number[] = [
  1.37982864606273e-04,
  2.28025724005875e-03,
  7.97404013220415e-03,
  9.85821379021226e-03,
  6.87489687449950e-03,
  6.18901033637688e-03,
  8.79078273952744e-03,
  1.49380448916805e-02,
  3.08851465246712e-02,
  9.65735902811690e-02,
  1.38629436111989e+00,
];

// PCCalculus::ellpk(double)::Q  —  11 doubles at @ProCore 0x122730
const ELLPK_Q: readonly number[] = [
  2.94078955048599e-05,
  9.14184723865917e-04,
  5.94058303753168e-03,
  1.54850516649762e-02,
  2.39089602715925e-02,
  3.01204715227604e-02,
  3.73774314173823e-02,
  4.88280347570998e-02,
  7.03124996963957e-02,
  1.24999999999871e-01,
  5.00000000000000e-01,
];

// PCCalculus::ellpe(double)::P  —  11 doubles at @ProCore 0x122790
const ELLPE_P: readonly number[] = [
  1.53552577301013e-04,
  2.50888492163602e-03,
  8.68786816565889e-03,
  1.07350949056076e-02,
  7.77395492516787e-03,
  7.58395289413514e-03,
  1.15688436810574e-02,
  2.18317996015557e-02,
  5.68051945617860e-02,
  4.43147180560991e-01,
  1.00000000000000e+00,
];

// PCCalculus::ellpe(double)::Q  —  10 doubles at @ProCore 0x1227f0
const ELLPE_Q: readonly number[] = [
  3.27954898576486e-05,
  1.00962792679357e-03,
  6.50609489976927e-03,
  1.68862163993311e-02,
  2.61769742454494e-02,
  3.34833904888225e-02,
  4.27180926518931e-02,
  5.85936634471101e-02,
  9.37499997197644e-02,
  2.49999999999888e-01,
];

/**
 * PCCalculus::poly(double x, double* coefs, int n)  →  double
 * @ProCore 0x000000000000b1ea  (__ZN10PCCalculus4polyEdPdi)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCCalculus.poly.s):
 *   b1ee  movapd %xmm0, %xmm1               // save x in xmm1
 *   b1f2  movsd  (%rdi), %xmm0              // acc = coefs[0]     (seed)
 *   b1f6  testl  %esi, %esi                 // n == 0 ?
 *   b1f8  je     0xb20f                     //   → return coefs[0]
 *   b1fa  movl   %esi, %eax                 // eax = n
 *   b1fc  xorl   %ecx, %ecx                 // rcx = 0 (loop index)
 *   .LB:
 *   b1fe  mulsd  %xmm1, %xmm0               //   acc *= x
 *   b202  addsd  0x8(%rdi,%rcx,8), %xmm0    //   acc += coefs[rcx+1]
 *   b208  incq   %rcx
 *   b20b  cmpl   %ecx, %eax
 *   b20d  jne    .LB                        //   loop while rcx != n
 *   b20f  retq
 *
 * Classic Horner:  poly(x, c, n) = ((...((c[0]*x + c[1])*x + c[2])*x + ...)*x + c[n])
 * i.e. evaluates a degree-n polynomial with n+1 coefficients [c[0]..c[n]].
 */
export function PCCalculus_poly(x: number, coefs: readonly number[], n: number): number {
  // b1f2 acc = coefs[0]
  let acc = coefs[0];
  if (n === 0) return acc; // b1f6-b1f8
  // b1fe-b20d Horner loop: rcx from 0 to n-1, each step acc = acc*x + coefs[rcx+1]
  for (let i = 0; i < n; i++) {
    acc = acc * x + coefs[i + 1];
  }
  return acc;
}

/**
 * PCCalculus::f(double A, double freq_scale, double omega, double phase)  →  double
 * @ProCore 0x000000000000b212  (__ZN10PCCalculus1fEdddd)
 *
 * Signature note: arg names are recovered from usage. The disassembly binds:
 *   xmm0 = A          (first arg — "amplitude", used as final multiplier)
 *   xmm1 = freq_scale (second arg — spilled to [rbp-8], multiplies at the very end)
 *   xmm2 = omega      (third arg — scaled by 2π to become the sinusoid frequency)
 *   xmm3 = phase      (fourth arg — added inside sin)
 * (This matches the arc-length integrand pattern where the derivative of
 *  A*sin(2π·omega·x + phase) is (2π·omega)·A·cos(...); `f` here is the sin form itself
 *  used as the integrand or a related quantity — the ports below in ds/sineLineIntegral
 *  clarify the geometric meaning.)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCCalculus.f.s):
 *   b21a  movsd  %xmm1, -0x8(%rbp)          // spill freq_scale
 *   b21f  mulsd  0x117339(%rip), %xmm2      // xmm2 = omega * 2*pi     [@ProCore 0x122560]
 *   b227  mulsd  %xmm2, %xmm0               // xmm0 = A * (omega * 2*pi)
 *   b22b  addsd  %xmm3, %xmm0               // xmm0 = A*omega*2pi + phase
 *   b22f  callq  _sin                       // xmm0 = sin(A*omega*2pi + phase)
 *   b234  mulsd  -0x8(%rbp), %xmm0          // xmm0 = freq_scale * sin(...)
 *   b23e  retq
 *
 * i.e.  f(A, freq_scale, omega, phase) = freq_scale * sin(2*pi*omega*A + phase)
 */
export function PCCalculus_f(A: number, freq_scale: number, omega: number, phase: number): number {
  // b21f-b22b: A * (omega * 2*pi) + phase
  const arg = A * (omega * 6.283185307179586) + phase; // @ProCore 0x122560 = 2*pi
  // b22f + b234: freq_scale * sin(arg)
  return freq_scale * Math.sin(arg);
}

/**
 * PCCalculus::ds(double A, double amp, double freq, double x)  →  double
 * @ProCore 0x000000000000abd6  (__ZN10PCCalculus2dsEdddd)
 *
 * Arc-length element of the curve y = amp * sin(2π·freq·x + phase-baked-into-A). Reading the
 * disassembly precisely:
 *   xmm0 = A     (spilled through _cos as its argument; becomes cos(2π·freq·2·x·A))
 *   xmm1 = amp   (spilled to -0x8(%rbp) after being scaled by 2·pi)
 *   xmm2 = freq  (doubled to 2·freq)
 *   xmm3 = x     (mul with 2·pi; then mul with 2·freq before cos)
 * The single-precision-looking `abd6..ac22` prologue subtracts 0x10 for two stack spills.
 *
 * DECODE (raw-port/re/disasm/ProCore.PCCalculus.ds.s):
 *   abde  mulsd  %xmm2, %xmm1               // xmm1 = amp * freq
 *   abe2  addsd  %xmm1, %xmm1               // xmm1 = 2 * amp * freq
 *   abe6  movsd  0x1179b2(%rip), %xmm3      // xmm3 = pi                  [@ProCore 0x1225a0]
 *   abee  mulsd  %xmm3, %xmm1               // xmm1 = 2*pi*amp*freq
 *   abf2  movsd  %xmm1, -0x8(%rbp)          // spill (this is the derivative coefficient)
 *   abf7  addsd  %xmm2, %xmm2               // xmm2 = 2*freq
 *   abfb  mulsd  %xmm2, %xmm3               // xmm3 = 2*pi*(2*freq)  = 4*pi*freq
 *   abff  mulsd  %xmm3, %xmm0               // xmm0 = A * 4*pi*freq  (the cos argument)
 *   ac03  callq  _cos                       // xmm0 = cos(A * 4*pi*freq)
 *   ac08  mulsd  -0x8(%rbp), %xmm0          // xmm0 = 2*pi*amp*freq * cos(...)   (dy/dx)
 *   ac0d  mulsd  %xmm0, %xmm0               // xmm0 = (dy/dx)^2
 *   ac11  addsd  0x117917(%rip), %xmm0      // xmm0 = 1 + (dy/dx)^2       [@ProCore 0x122530 = 1.0]
 *   ac19  sqrtsd %xmm0, %xmm0               // xmm0 = sqrt(1 + (dy/dx)^2)
 *   ac22  retq
 *
 * Semantics: this is  sqrt(1 + [(2·pi·amp·freq) · cos(4·pi·freq·A)]²), i.e. the arc-length
 * element ds/dx for a sinusoid whose derivative at parameter `A` is 2·pi·amp·freq·cos(4·pi·freq·A).
 * (The `2` inside cos comes from `addsd %xmm2, %xmm2`; the disasm is literal — no interpretation.)
 */
export function PCCalculus_ds(A: number, amp: number, freq: number, x: number): number {
  // Note: `x` (the 4th arg / xmm3) is loaded into xmm3 by the ABI but the disasm above
  // overwrites xmm3 at abe6 with the pi constant before using it, so its actual dataflow is:
  //   xmm3 initially = x (from caller)  →  clobbered at abe6 by movsd pi
  // Consequently the runtime cos argument in ds() reads only from A, freq (and the pi constant).
  // This is faithful to the disassembly; if a caller passes `x` here it is discarded, exactly
  // as the machine code does.
  void x;
  // abe6: pi                 (@ProCore 0x1225a0)
  const PI = 3.141592653589793;
  // abde-abee: dydx_coef = 2 * pi * amp * freq
  const dydx_coef = 2 * PI * amp * freq;
  // abf7-abff: cos_arg = A * (4 * pi * freq)
  const cos_arg = A * (4 * PI * freq);
  // ac03-ac08: dydx = dydx_coef * cos(cos_arg)
  const dydx = dydx_coef * Math.cos(cos_arg);
  // ac0d-ac19: sqrt(1 + dydx^2)     (@ProCore 0x122530 = 1.0)
  return Math.sqrt(1.0 + dydx * dydx);
}

/**
 * PCCalculus::ellpk(double x)  →  double
 * @ProCore 0x000000000000b240  (__ZN10PCCalculus5ellpkEd)
 *
 * Cephes-style complete elliptic integral of the first kind, K, parametrised by the complementary
 * parameter m1 = 1 - m (Cephes convention: input `x` here IS m1). Range: 0 <= x <= 1.
 *
 * DECODE (raw-port/re/disasm/ProCore.PCCalculus.ellpk.s):
 *   b240  xorpd  %xmm1,%xmm1
 *   b244  ucomisd %xmm1,%xmm0                // compare x, 0
 *   b248  jb     0xb2d7                      // x < 0     → error branch  (returns asin(-5) = NaN)
 *   b24e  movsd  0x1172da(%rip), %xmm1       // xmm1 = 1.0                [@ProCore 0x122530]
 *   b256  ucomisd %xmm0,%xmm1                // compare 1.0, x
 *   b25a  jb     0xb2d7                      // x > 1     → error branch  (asin(-5) = NaN)
 *   b264  ucomisd 0x11732c(%rip), %xmm0      // compare x, 1.11e-16       [@ProCore 0x122598]
 *   b26c  jbe    0xb2e4                      // x <= 1.11e-16 → small-x path
 *   .LARGE_X:  (0 < x < ~DBL_EPSILON/2 excluded, DBL_EPSILON/2 < x <= 1)
 *   b26e-b291  P_seed=P[0]; for i in 1..10: P_acc = P_acc*x + P[i]   →   polevl(x, P, 10)
 *   b298-b2bb  Q_seed=Q[0]; for i in 1..10: Q_acc = Q_acc*x + Q[i]   →   polevl(x, Q, 10)
 *   b2c2       xmm0 = log(x)
 *   b2c7       xmm0 = Q_acc * log(x)
 *   b2cc/b2d1  return P_acc - Q_acc*log(x)
 *   .SMALL_X:  (x <= DBL_EPSILON/2)
 *   b2e4       xmm0 = log(x)
 *   b2ed       xmm1 = log(x) * -0.5                                     [@ProCore 0x1225a8 = -0.5]
 *   b2f5       xmm1 = -0.5*log(x) + ln(4)                               [@ProCore 0x1225b0 = ln(4)]
 *   b2fd       return xmm1                                              = ln(4) - log(x)/2
 *              (= ln(4/sqrt(x)), the Cephes small-m1 asymptote of K)
 *   .ERROR: (x<0 or x>1)
 *   b2d7       xmm0 = -5.0                                              [@ProCore 0x122588]
 *   b2df       tail-call _asin(-5)  → NaN
 *
 * Faithful transcription — no shortcuts. The polynomial-evaluation loops are Cephes' `polevl(x,P,10)`
 * and `polevl(x,Q,10)` (degree-10 polynomials over 11 coefficients), invoked with the tail element
 * as the accumulator seed (`movl $0x1, %eax` starts at index 1).
 */
export function PCCalculus_ellpk(x: number): number {
  // b240-b24a: reject x < 0
  // b24e-b25a: reject x > 1
  if (!(x >= 0.0) || x > 1.0) {
    // b2d7/b2df: asin(-5) — a NaN sentinel, exactly as the binary produces
    return Math.asin(-5.0); // @ProCore 0x122588
  }
  // b264-b26c: small-x branch when x <= DBL_EPSILON/2
  const SMALL_THRESH = 1.1102230246251565e-16; // @ProCore 0x122598
  if (x <= SMALL_THRESH) {
    // b2e4/b2ed/b2f5: ln(4) - 0.5*log(x)
    return 1.3862943611198906 /* ln(4) @ProCore 0x1225b0 */ + -0.5 /* @0x1225a8 */ * Math.log(x);
  }
  // b26e-b291: P_acc = polevl(x, ELLPK_P, 10)   [seed=ELLPK_P[0], iterate i=1..10]
  const P_acc = PCCalculus_poly(x, ELLPK_P, 10);
  // b298-b2bb: Q_acc = polevl(x, ELLPK_Q, 10)   [seed=ELLPK_Q[0], iterate i=1..10]
  const Q_acc = PCCalculus_poly(x, ELLPK_Q, 10);
  // b2c2/b2c7/b2d1: return P_acc - Q_acc * log(x)
  return P_acc - Q_acc * Math.log(x);
}

/**
 * PCCalculus::ellpe(double x)  →  double
 * @ProCore 0x000000000000b308  (__ZN10PCCalculus5ellpeEd)
 *
 * Cephes-style complete elliptic integral of the second kind, E, parametrised by the complementary
 * parameter m1 = 1 - m. Range: 0 <= x <= 1.
 *
 * DECODE (raw-port/re/disasm/ProCore.PCCalculus.ellpe.s):
 *   b308  xorpd  %xmm1,%xmm1
 *   b30c  ucomisd %xmm1,%xmm0                // compare x, 0
 *   b310  jbe    0xb39e                      // x <= 0  → boundary branch (x==0 returns 1, x<0 NaN)
 *   b316  movsd  0x117212(%rip), %xmm2       // xmm2 = 1.0                [@ProCore 0x122530]
 *   b31e  ucomisd %xmm0,%xmm2                // compare 1.0, x
 *   b322  jb     0xb39e                      // x > 1   → error branch    (acos(-5) = NaN)
 *   .IN_RANGE:  (0 < x <= 1)
 *   b324-b347  P_acc = polevl(x, ELLPE_P, 10)   [seed=ELLPE_P[0], iterate i=1..10]
 *   b356-b379  Q_acc_pre = polevl(x, ELLPE_Q, 9) [seed=ELLPE_Q[0], iterate i=1..9]
 *   b37b       Q_acc = Q_acc_pre * x            (E's Q formula has an extra ×x factor vs K)
 *   b384       xmm0 = log(x)
 *   b389       xmm0 = Q_acc * log(x)
 *   b393       return P_acc - Q_acc*log(x)
 *   .BOUNDARY / .ERROR (jumped-to at 0xb39e):
 *   b39e-b3a2  compare xmm0 (=x) to 0 exactly
 *   b3a4       jump-if-parity to error (NaN input branch)
 *   b3a6       xmm1 = 1.0                                                [@ProCore 0x122530]
 *   b3ae       return 1.0                                    (E(m1=0)  = E(m=1)  = 1)
 *   .ERROR:
 *   b3b3       xmm0 = -5.0                                               [@ProCore 0x122588]
 *   b3bb       tail-call _acos(-5) → NaN
 */
export function PCCalculus_ellpe(x: number): number {
  // b30c-b310: x <= 0 goes to the boundary/error branch
  if (!(x > 0.0)) {
    // b39e-b3a4: x == 0 (non-NaN) → return 1.0
    if (x === 0.0) return 1.0; // @ProCore 0x122530
    // b3b3/b3bb: acos(-5) — NaN sentinel
    return Math.acos(-5.0); // @ProCore 0x122588
  }
  // b316-b322: reject x > 1
  if (x > 1.0) {
    return Math.acos(-5.0); // @ProCore 0x122588
  }
  // b324-b347: P_acc = polevl(x, ELLPE_P, 10)
  const P_acc = PCCalculus_poly(x, ELLPE_P, 10);
  // b356-b379 + b37b: Q_acc = x * polevl(x, ELLPE_Q, 9)
  //   Note the disassembly loop count is `cmpl $0xa, %eax` (i.e. iterate while eax != 10, so
  //   nine mul-adds for indices 1..9, matching Cephes' 10-coef Q vs 11-coef P).
  const Q_acc = x * PCCalculus_poly(x, ELLPE_Q, 9);
  // b384-b393: P_acc - Q_acc * log(x)
  return P_acc - Q_acc * Math.log(x);
}

/**
 * PCCalculus::LegendreEllipticF(double phi, double k)  →  double  (incomplete F(phi, k))
 * @ProCore 0x000000000000ae94  (__ZN10PCCalculus17LegendreEllipticFEdd)
 *
 * Standard Carlson reduction:  F(phi, k) = sin(phi) · R_F(cos²(phi), 1 - k²·sin²(phi), 1)
 *
 * DECODE (raw-port/re/disasm/ProCore.PCCalculus.LegendreEllipticF.s):
 *   ae9c  movsd  %xmm1, -0x8(%rbp)                    // spill k
 *   aea1  callq  ___sincos_stret(phi)                 // xmm0 = sin(phi), xmm1 = cos(phi)
 *   aea6  movapd %xmm0, %xmm2                         // xmm2 = sin(phi)
 *   aeaa  movsd  %xmm0, -0x10(%rbp)                   // spill sin(phi)
 *   aeaf  movapd %xmm1, %xmm0                         // xmm0 = cos(phi)
 *   aeb3  mulsd  %xmm1, %xmm0                         // xmm0 = cos²(phi)     = CarlsonF arg0
 *   aeb7  movsd  -0x8(%rbp), %xmm3                    // xmm3 = k
 *   aebc  mulsd  %xmm2, %xmm3                         // xmm3 = k * sin(phi)
 *   aec0  movsd  0x117668(%rip), %xmm2                // xmm2 = 1.0           [@ProCore 0x122530]
 *   aec8  movapd %xmm2, %xmm1                         // xmm1 = 1.0
 *   aecc  subsd  %xmm3, %xmm1                         // xmm1 = 1 - k·sin(phi)
 *   aed0  addsd  %xmm2, %xmm3                         // xmm3 = 1 + k·sin(phi)
 *   aed4  mulsd  %xmm1, %xmm3                         // xmm3 = 1 - k²·sin²(phi) = CarlsonF arg1
 *   aed8  movapd %xmm3, %xmm1
 *   aedc  callq  PCCalculus::CarlsonEllipticF(cos²(phi), 1-k²sin²(phi), 1.0)
 *   aee1  mulsd  -0x10(%rbp), %xmm0                   // xmm0 = result * sin(phi)
 *   aeeb  retq
 */
export function PCCalculus_LegendreEllipticF(phi: number, k: number): number {
  // aea1: sincos(phi)
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  // aeb3: cos²(phi)
  const cos2 = cosPhi * cosPhi;
  // aebc-aed4: 1 - k²·sin²(phi)   (computed as (1 - k·sinφ)·(1 + k·sinφ), faithful to the disasm)
  const ksin = k * sinPhi;
  const one_minus_k2_sin2 = (1.0 /* @ProCore 0x122530 */ - ksin) * (1.0 + ksin);
  // aedc: CarlsonF(cos²(phi), 1-k²sin²(phi), 1.0)
  const rf = PCCalculus_CarlsonEllipticF(cos2, one_minus_k2_sin2, 1.0);
  // aee1: * sin(phi)
  return sinPhi * rf;
}

/**
 * PCCalculus::LegendreEllipticE(double phi, double k)  →  double  (incomplete E(phi, k))
 * @ProCore 0x000000000000b142  (__ZN10PCCalculus17LegendreEllipticEEdd)
 *
 * Standard Carlson reduction:
 *   E(phi, k) = sin(phi) · [ R_F(cos²φ, 1-k²sin²φ, 1) − (k²·sin²φ / 3) · R_D(cos²φ, 1-k²sin²φ, 1) ]
 * where R_D is PCCalculus::CarlsonEllipticE (Numerical Recipes' rd — degenerate case of R_J).
 *
 * DECODE (raw-port/re/disasm/ProCore.PCCalculus.LegendreEllipticE.s):
 *   b14a  movsd  %xmm1, -0x8(%rbp)                    // spill k
 *   b14f  callq  ___sincos_stret(phi)                 // xmm0 = sin(phi), xmm1 = cos(phi)
 *   b154  movsd  %xmm0, -0x10(%rbp)                   // spill sin(phi)
 *   b159  movapd %xmm1, %xmm3
 *   b15d  mulsd  %xmm1, %xmm3                         // xmm3 = cos²(phi)
 *   b161  movsd  %xmm3, -0x18(%rbp)                   // spill cos²(phi)  = CarlsonF arg0
 *   b166  movapd %xmm0, %xmm1                         // xmm1 = sin(phi)
 *   b16a  mulsd  -0x8(%rbp), %xmm1                    // xmm1 = sin(phi) * k
 *   b16f  movsd  0x1173b9(%rip), %xmm2                // xmm2 = 1.0        [@ProCore 0x122530]
 *   b177  movapd %xmm2, %xmm0
 *   b17b  subsd  %xmm1, %xmm0                         // xmm0 = 1 - k·sin(phi)
 *   b17f  addsd  %xmm2, %xmm1                         // xmm1 = 1 + k·sin(phi)
 *   b183  mulsd  %xmm0, %xmm1                         // xmm1 = 1 - k²·sin²(phi)
 *   b187  movsd  %xmm1, -0x20(%rbp)                   // spill                = CarlsonF arg1
 *   b18c  movapd %xmm3, %xmm0                         // xmm0 = cos²(phi)
 *   b190  callq  CarlsonEllipticF(cos²(phi), 1-k²sin²(phi), 1.0=xmm2)
 *   b195  movsd  %xmm0, -0x28(%rbp)                   // rf   = spill
 *   b19a  movsd  -0x10(%rbp), %xmm1                   // xmm1 = sin(phi)
 *   b19f  mulsd  %xmm1, %xmm1                         // xmm1 = sin²(phi)
 *   b1a3  movsd  -0x8(%rbp), %xmm0                    // xmm0 = k
 *   b1a8  mulsd  %xmm0, %xmm1                         // xmm1 = k * sin²(phi)
 *   b1ac  mulsd  %xmm0, %xmm1                         // xmm1 = k² * sin²(phi)
 *   b1b0  movsd  %xmm1, -0x8(%rbp)                    // spill k²·sin²(phi)
 *   b1b5  movsd  -0x18(%rbp), %xmm0                   // xmm0 = cos²(phi)
 *   b1ba  movsd  -0x20(%rbp), %xmm1                   // xmm1 = 1 - k²·sin²(phi)
 *   b1bf  movsd  0x117369(%rip), %xmm2                // xmm2 = 1.0        [@ProCore 0x122530]
 *   b1c7  callq  CarlsonEllipticE(cos²(phi), 1-k²sin²(phi), 1.0)
 *   b1cc  mulsd  -0x8(%rbp), %xmm0                    // xmm0 = rd * k²·sin²(phi)
 *   b1d1  divsd  0x117487(%rip), %xmm0                // xmm0 /= -3.0      [@ProCore 0x122660]
 *   b1d9  addsd  -0x28(%rbp), %xmm0                   // xmm0 = rf - rd·k²·sin²(phi)/3
 *   b1de  mulsd  -0x10(%rbp), %xmm0                   // xmm0 *= sin(phi)
 *   b1e8  retq
 */
export function PCCalculus_LegendreEllipticE(phi: number, k: number): number {
  // b14f: sincos(phi)
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  // b15d: cos²(phi)
  const cos2 = cosPhi * cosPhi;
  // b16a-b183: 1 - k²·sin²(phi)
  const ksin = k * sinPhi;
  const one_minus_k2_sin2 = (1.0 /* @ProCore 0x122530 */ - ksin) * (1.0 + ksin);
  // b190: rf = CarlsonEllipticF(cos²(phi), 1-k²sin²(phi), 1.0)
  const rf = PCCalculus_CarlsonEllipticF(cos2, one_minus_k2_sin2, 1.0);
  // b19f-b1b0: k²·sin²(phi)
  const k2sin2 = k * k * (sinPhi * sinPhi);
  // b1c7: rd = CarlsonEllipticE(cos²(phi), 1-k²sin²(phi), 1.0)
  const rd = PCCalculus_CarlsonEllipticE(cos2, one_minus_k2_sin2, 1.0);
  // b1cc-b1d9: rf + (rd * k²·sin²(phi)) / -3.0    (i.e. rf - rd·k²·sin²(phi)/3)
  const combined = rf + (rd * k2sin2) / -3.0; // @ProCore 0x122660
  // b1de: * sin(phi)
  return sinPhi * combined;
}

/**
 * PCCalculus::CarlsonEllipticF(double x, double y, double z)  →  double  (Carlson R_F)
 * @ProCore 0x000000000000accc  (__ZN10PCCalculus16CarlsonEllipticFEddd)
 *
 * Iterative Carlson symmetric elliptic integral of the first kind R_F(x, y, z), implemented as
 * the classic Numerical Recipes / Cephes `rf` — a mean-value duplication loop over (x, y, z),
 * mixing packed SSE ops (y+z averaged as an xmm pair, packed abs mask 0x7fff...ffff at
 * @ProCore 0x122670, packed (0.25, 0.25) at @ProCore 0x122690) until |max(dx, dy, dz)| < ERRTOL,
 * then a degree-3 correction polynomial with the Cephes constants:
 *   ERRTOL = 0.0025                                                     @ProCore 0x1225f0
 *   TINY   = 1.5e-38 (lower-arg bound)                                  @ProCore 0x1225d0
 *   BIG    = 3.0e+37 (upper-arg bound)                                  @ProCore 0x1225d8
 *   C1     = 1/24   = 0.041666666666666664                              @ProCore 0x1225f8
 *   C2     = -0.1                                                       @ProCore 0x122600
 *   C3     = -3/44  = -0.06818181818181818                              @ProCore 0x122608
 *   C4     = 0.25    (from @ProCore 0x122690 pair used vectorised)
 *   C5     = 1/14   = 0.07142857142857142                               @ProCore 0x122610
 * On invalid input (min<=0, max>BIG, sum-min < TINY) the function returns 0.0 via a branch at
 * 0xae8f that skips the prologue.
 *
 * NOTE: this method is NOT yet transcribed — the 96-line vectorised duplication loop (packed sqrt,
 * unpckhpd, andpd/maxpd for parallel-abs, movddup for pair broadcasts) needs a careful pass with
 * an oracle harness before it can land. Emitting a throwing stub keeps the frontier honest so
 * subsequent worker rounds pick it up as an explicit demand.
 */
export function PCCalculus_CarlsonEllipticF(x: number, y: number, z: number): number {
  // Silence unused-parameter warnings without swallowing them.
  void x; void y; void z;
  throw new Error(
    "PCCalculus::CarlsonEllipticF(double, double, double) not yet transcribed @ProCore 0xaccc " +
    "(96-line vectorised NR-rf duplication loop — decode raw-port/re/disasm/ProCore.PCCalculus.CarlsonEllipticF.s)"
  );
}

/**
 * PCCalculus::CarlsonEllipticE(double x, double y, double z)  →  double  (Carlson R_D)
 * @ProCore 0x000000000000aeec  (__ZN10PCCalculus16CarlsonEllipticEEddd)
 *
 * Iterative Carlson symmetric elliptic integral of the second kind R_D(x, y, z), i.e. Numerical
 * Recipes' `rd` — a mean-value duplication loop that also accumulates a running sum used in the
 * degree-3 correction polynomial (this is what makes rd more expensive than rf). Same constant
 * bank as CarlsonEllipticF (ERRTOL @0x1225f0, TINY @0x1225d0, BIG @0x1225d8, and the C1..C6
 * cluster around 0x1225f8..0x122610).
 *
 * NOT yet transcribed — 121-line vectorised loop, must be gated by an oracle before landing.
 */
export function PCCalculus_CarlsonEllipticE(x: number, y: number, z: number): number {
  void x; void y; void z;
  throw new Error(
    "PCCalculus::CarlsonEllipticE(double, double, double) not yet transcribed @ProCore 0xaeec " +
    "(121-line vectorised NR-rd duplication loop — decode raw-port/re/disasm/ProCore.PCCalculus.CarlsonEllipticE.s)"
  );
}

/**
 * PCCalculus::ellipticE(double phi, double m)  →  double  (Legendre E, Cephes-style entry point)
 * @ProCore 0x000000000000a4fc  (__ZN10PCCalculus9ellipticEEdd)
 *
 * Reduction wrapper that folds phi into [-pi/2, pi/2] (`roundsd $0x9, %xmm1` uses round-to-nearest
 * with truncation semantics after a pi/2 division, then re-adds the halved shift), handles the
 * m == 0 fast-return, and calls into ellpk/ellpe for the complete case with the full quadrant
 * accumulation `n·E(m) + E(residual, m)`.
 *
 * NOT yet transcribed — 286-line function with multiple sign-swap / K-vs-E branches, and it
 * shares the ellpe/ellpk P & Q tables with ellpe/ellpk (leaq __ZZN10PCCalculus5ellpeEdE1P at 0xa5a9,
 * 5ellpeEdE1Q at 0xa5d8). Faithful transcription requires walking every branch.
 */
export function PCCalculus_ellipticE(phi: number, m: number): number {
  void phi; void m;
  throw new Error(
    "PCCalculus::ellipticE(double, double) not yet transcribed @ProCore 0xa4fc " +
    "(286-line quadrant-reducing wrapper over ellpk/ellpe — decode " +
    "raw-port/re/disasm/ProCore.PCCalculus.ellipticE.s)"
  );
}

/**
 * PCCalculus::sineLineIntegral(double A, double amp, double freq, double phase)  →  double
 * @ProCore 0x000000000000a438  (__ZN10PCCalculus16sineLineIntegralEdddd)
 *
 * Arc length along y = amp·sin(2π·freq·x + phase) from x=0 to x=A, evaluated by transforming to
 * the Legendre incomplete elliptic form and calling PCCalculus::ellipticE. NOT yet transcribed.
 */
export function PCCalculus_sineLineIntegral(A: number, amp: number, freq: number, phase: number): number {
  void A; void amp; void freq; void phase;
  throw new Error(
    "PCCalculus::sineLineIntegral(double, double, double, double) not yet transcribed @ProCore 0xa438 " +
    "(decode raw-port/re/disasm/ProCore.PCCalculus.sineLineIntegral.s)"
  );
}

/**
 * PCCalculus::ellipseLineIntegral(double a, double b, double phi)  →  double
 * @ProCore 0x000000000000ac24  (__ZN10PCCalculus19ellipseLineIntegralEddd)
 *
 * Arc length of an ellipse with semi-axes (a, b) up to eccentric anomaly phi; reduces to the
 * incomplete Legendre E via the standard eccentricity substitution. NOT yet transcribed.
 */
export function PCCalculus_ellipseLineIntegral(a: number, b: number, phi: number): number {
  void a; void b; void phi;
  throw new Error(
    "PCCalculus::ellipseLineIntegral(double, double, double) not yet transcribed @ProCore 0xac24 " +
    "(decode raw-port/re/disasm/ProCore.PCCalculus.ellipseLineIntegral.s)"
  );
}

/**
 * PCCalculus::xFromSineLength(double L, double amp, double freq, double phase)  →  double
 * @ProCore 0x000000000000aa58  (__ZN10PCCalculus15xFromSineLengthEdddd)
 *
 * Inverse of sineLineIntegral: given an arc length `L`, solve for the x at which the sinusoid's
 * traversed length equals `L`. Newton/bisection root-solve. NOT yet transcribed.
 */
export function PCCalculus_xFromSineLength(L: number, amp: number, freq: number, phase: number): number {
  void L; void amp; void freq; void phase;
  throw new Error(
    "PCCalculus::xFromSineLength(double, double, double, double) not yet transcribed @ProCore 0xaa58 " +
    "(decode raw-port/re/disasm/ProCore.PCCalculus.xFromSineLength.s)"
  );
}
