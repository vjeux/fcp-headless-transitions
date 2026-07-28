// raw-port/src/render/HGLinearFilter.ts
//
// FCP `HGLinearFilter` — Helium namespace of 1D linear-filter kernel
// functions used to build separable prefilters (see
// HGPrefilterUtils::GetSeparablePrefilter which calls into these).
// Each function is a static `float(float x, float a, float b)` — the
// mangling `__ZN14HGLinearFilterNfEfff` (14 = strlen("HGLinearFilter"))
// and lack of a `this` argument in the disasm confirms these are free
// functions living in a class-shaped namespace.
//
// FRAMEWORK: Helium.framework
// DECODE:
//   raw-port/re/disasm/Helium.HGLinearFilter.uniform.s
//   raw-port/re/disasm/Helium.HGLinearFilter.sinc.s
//   raw-port/re/disasm/Helium.HGLinearFilter.rect.s
//   raw-port/re/disasm/Helium.HGLinearFilter.bartlett.s
//   raw-port/re/disasm/Helium.HGLinearFilter.gaussian.s
//   raw-port/re/disasm/Helium.HGLinearFilter.gauss.s
//   raw-port/re/disasm/Helium.HGLinearFilter.bicubic.s
//   raw-port/re/disasm/Helium.HGLinearFilter.lanczos.s
//   raw-port/re/disasm/Helium.HGLinearFilter.mitchell.s
//   raw-port/re/disasm/Helium.HGLinearFilter.hann.s
//   raw-port/re/disasm/Helium.HGLinearFilter.hamming.s
//   raw-port/re/disasm/Helium.HGLinearFilter.blackman.s
//   raw-port/re/disasm/Helium.HGLinearFilter.disc.s
//   raw-port/re/disasm/Helium.HGLinearFilter.kaiser.s   (stub — see below)
//
// SYMBOLS:
//   @Helium 0x10f060  HGLinearFilter::uniform(float, float, float)
//   @Helium 0x10f070  HGLinearFilter::sinc(float, float, float)
//   @Helium 0x10f0c0  HGLinearFilter::rect(float, float, float)
//   @Helium 0x10f0e0  HGLinearFilter::bartlett(float, float, float)
//   @Helium 0x10f110  HGLinearFilter::gaussian(float, float, float)
//   @Helium 0x10f160  HGLinearFilter::gauss(float, float, float)
//   @Helium 0x10f190  HGLinearFilter::bicubic(float, float, float)
//   @Helium 0x10f280  HGLinearFilter::lanczos(float, float, float)
//   @Helium 0x10f340  HGLinearFilter::mitchell(float, float, float)
//   @Helium 0x10f3d0  HGLinearFilter::kaiser(float, float, float)      [stub]
//   @Helium 0x10f670  HGLinearFilter::hann(float, float, float)
//   @Helium 0x10f6d0  HGLinearFilter::hamming(float, float, float)
//   @Helium 0x10f720  HGLinearFilter::blackman(float, float, float)
//   @Helium 0x10f790  HGLinearFilter::disc(float, float, float, float)
//
// DECODED CONSTANTS (VA -> value, all single-precision float unless noted):
//   @const 0x3c7c30  = 0x7fffffff        (abs-value mask; used by all
//                                         windowing filters as
//                                         `andps 0x2b8b65(%rip), %xmm0`)
//   @const 0x3c7cc0  = 1.0f              (unit / branch threshold)
//   @const 0x3c7ccc  = -0.5f             (gauss/gaussian exponent factor)
//   @const 0x3c7cd4  = -1.5f             (bicubic branch1 coeff)
//   @const 0x3caf8c  = 2.0f              (bicubic const2 / mitchell b2 thresh)
//   @const 0x3c9fc4  = -8.0f             (bicubic br2 factor)
//   @const 0x3ca2ec  = 4.0f              (gauss pre-mul; bicubic br2 factor)
//   @const 0x3cbaec  = 1.333333373f      (bicubic br2 factor: 4/3)
//   @const 0x3cf658  = 5.0f              (bicubic br2 factor)
//   @const 0x3d2388  = 3.141592741f      (single-precision pi; used by
//                                         sinc/lanczos/hann/hamming pre-cos/pre-sin scale)
//   @const 0x3d2390  = -0.166666672f     (bicubic br2: -1/6)
//   @const 0x3d2394  = -3.0f             (bicubic br1 const)
//   @const 0x3d2398  = -0.333333343f     (bicubic br1: -1/3)
//   @const 0x3d239c  = -0.388888896f     (mitchell b2: -7/18)
//   @const 0x3d23a0  = -3.333333492f     (mitchell b2: -10/3)
//   @const 0x3d23a4  = 1.777777910f      (mitchell b2: 16/9)
//   @const 0x3d23a8  = 1.166666627f      (mitchell b1: 7/6)
//   @const 0x3d23ac  = 0.888888896f      (mitchell b1: 8/9)
//   @const 0x3d23ec  = 0.456521750f      (hamming: 21/46 exact form)
//   @const 0x3d23f0  = 0.543478250f      (hamming: 25/46 exact form)
//   @const 0x3d2360  = 0.496560633f      (blackman a1)
//   @const 0x3d2370  = 0.426590711f      (blackman a0)
//   @const 0x3d2374  = -1.0f             (blackman shift for cos double-angle)
//   @const 0x3d23f4  = 0.076848671f      (blackman a2)
//   @const 0x3d23f8  = 3.14159265358979 (double)   (blackman uses double-precision cos)
//   @const 0x3d2388 -> also encodes 1/sqrt(2*pi) at 0x3ecc422a nearby:
//   @const 0x3ecc422a = 0.398942292f     (gaussian post-expf: 1/sqrt(2*pi))
//
// UNDECODED CALLEES / EXTERNAL SYMBOLS:
//   _sinf   (libm)     via symbol stub 0x3c55e2 — used by sinc, lanczos.
//   _cosf   (libm)     via symbol stub 0x3c5078 — used by hann, hamming.
//   _cos    (libm)     via symbol stub 0x3c5072 — used by blackman (double-precision).
//   _expf   (libm)     via symbol stub 0x3c50fc — used by gaussian, gauss, kaiser.
//   No cross-class calls; no vtable dispatch; no globals other than the
//   read-only float constants above.
//
// NUMERICS DISCIPLINE:
//   All kernel functions operate on single-precision floats (the disasm
//   uses `mulss`/`addss`/`movss` / `_sinf` / `_cosf` / `_expf`), except
//   blackman which uses `_cos` (double) — the input is widened with
//   `cvtss2sd` before the call and the result is narrowed back with
//   `cvtsd2ss`. All single-precision arithmetic is wrapped in
//   `Math.fround` to match the machine (PORTING_SPEC Rule 4).

/**
 * Single-precision fround (matches the machine's `cvtss2sd`-boundary
 * rounding — see PORTING_SPEC Rule 4).
 */
const f = Math.fround;

/**
 * `HGLinearFilter::uniform(float x, float a, float b)` @Helium 0x10f060
 *
 * Disasm (5 instructions):
 *   0x10f064  movaps  %xmm1, %xmm0      ; return arg2 as-is
 *   0x10f067  popq    %rbp
 *   0x10f068  retq
 *
 * Semantics: constant kernel — returns the second argument regardless
 * of x. (Weight is passed in as `a`; kernel value is `a`.)
 */
export function uniform(_x: number, a: number, _b: number): number {
  return f(a);
}

/**
 * `HGLinearFilter::sinc(float x, float a, float b)` @Helium 0x10f070
 *
 * Disasm summary:
 *   xmm2 = x * pi                            ; mulss @const 0x3d2388 (pi)
 *   xmm1 = xmm2 * xmm2
 *   xmm1 = xmm1 + 1.0                        ; @const 0x3c7cc0
 *   if (xmm1 == 1.0):   // (x*pi)^2 rounded to 0 -> return 1.0
 *     return 1.0                             ; xmm0 already holds 1.0
 *   return sinf(x*pi) / (x*pi)
 *
 * Semantics: normalized sinc — `sinf(pi*x) / (pi*x)`, with a squared-
 * epsilon check against 1.0 that returns 1.0 when `(pi*x)^2` rounds
 * away in single precision.
 *
 * NOTE: `a` and `b` are unused by the disasm (no read of xmm1/xmm2
 * before overwrite). We preserve the signature.
 */
export function sinc(x: number, _a: number, _b: number): number {
  const pi_x = f(x * f(3.141592741)); // @const 0x3d2388
  const one = f(1.0);                 // @const 0x3c7cc0
  const sq = f(f(pi_x * pi_x) + one);
  if (sq === one) {
    return one;
  }
  return f(Math.sin(pi_x) / pi_x);
}

/**
 * `HGLinearFilter::rect(float x, float a, float b)` @Helium 0x10f0c0
 *
 * Disasm:
 *   xmm0 = |x|                              ; andps @const 0x3c7c30 (0x7fffffff)
 *   xmm1 = 1.0                              ; @const 0x3c7cc0
 *   xmm0 = (xmm0 < 1.0) ? all-ones : 0      ; cmpltss
 *   xmm0 = xmm0 AND 1.0                     ; andps
 *
 * Semantics: box / rect kernel — returns 1.0 if `|x| < 1.0`, else 0.0.
 * (The `cmpltss` produces the mask 0xFFFFFFFF for true and 0 for false;
 *  ANDing with 1.0 (0x3F800000) yields 1.0 or 0.0.)
 */
export function rect(x: number, _a: number, _b: number): number {
  return f(Math.abs(x)) < f(1.0) ? f(1.0) : f(0.0);
}

/**
 * `HGLinearFilter::bartlett(float x, float a, float b)` @Helium 0x10f0e0
 *
 * Disasm:
 *   xmm0 = |x|                              ; andps @const 0x3c7c30
 *   xmm1 = 1.0                              ; @const 0x3c7cc0
 *   xmm2 = xmm1 - xmm0                      ; (1 - |x|)
 *   xmm0 = (xmm0 < 1.0) ? all-ones : 0      ; cmpltss
 *   xmm0 = xmm0 AND xmm2                    ; mask * (1 - |x|)
 *
 * Semantics: Bartlett (triangle) kernel — `max(0, 1 - |x|)` in the
 * range [-1, 1], zero outside. (Equivalent to `(|x| < 1) ? 1 - |x| : 0`
 * — note strict less-than: at |x|==1 result is 0, matching the disasm.)
 */
export function bartlett(x: number, _a: number, _b: number): number {
  const ax = f(Math.abs(x));
  const one = f(1.0);
  return ax < one ? f(one - ax) : f(0.0);
}

/**
 * `HGLinearFilter::gaussian(float x, float a, float b)` @Helium 0x10f110
 *
 * Disasm:
 *   xmm3 = 1.0 / b                          ; movss @const 0x3c7cc0 (1.0), divss %xmm2
 *   xmm0 = (x - a)                          ; subss
 *   xmm0 = (x - a) * (1/b)
 *   xmm1 = -0.5                             ; @const 0x3c7ccc
 *   xmm1 = -0.5 * ((x-a)/b)
 *   xmm0 = xmm1 * xmm0 = -0.5 * ((x-a)/b)^2
 *   call _expf                              ; xmm0 = exp(-0.5 * ((x-a)/b)^2)
 *   xmm0 = xmm0 * 0.398942292               ; mulss @const 0x3ecc422a (= 1/sqrt(2*pi))
 *   xmm0 = xmm0 * (1/b)                     ; final scale
 *
 * Semantics: full Gaussian PDF — `(1/(b*sqrt(2*pi))) * exp(-0.5 * ((x-a)/b)^2)`.
 * `a` = mean, `b` = standard deviation.
 */
export function gaussian(x: number, a: number, b: number): number {
  const invB = f(f(1.0) / b);          // @const 0x3c7cc0 = 1.0
  const z = f(f(x - a) * invB);
  const halfNeg = f(-0.5);             // @const 0x3c7ccc
  const arg = f(f(halfNeg * z) * z);
  const e = f(Math.exp(arg));
  const norm = f(0.398942292);         // @const 0x3ecc422a = 1/sqrt(2*pi)
  return f(f(e * norm) * invB);
}

/**
 * `HGLinearFilter::gauss(float x, float a, float b)` @Helium 0x10f160
 *
 * Disasm:
 *   xmm0 = x * 4.0                          ; mulss @const 0x3ca2ec (4.0)
 *   xmm1 = -0.5                             ; @const 0x3c7ccc
 *   xmm1 = -0.5 * (x*4)
 *   xmm0 = xmm1 * xmm0 = -0.5 * (4x)^2 = -8 * x^2
 *   jmp _expf                               ; tail call: return expf(-8*x^2)
 *
 * Semantics: un-normalized Gaussian bell with fixed half-width factor 4.
 * `a` and `b` are unused (never read before being overwritten).
 */
export function gauss(x: number, _a: number, _b: number): number {
  const scaled = f(x * f(4.0));        // @const 0x3ca2ec
  const halfNeg = f(-0.5);             // @const 0x3c7ccc
  const arg = f(f(halfNeg * scaled) * scaled);
  return f(Math.exp(arg));
}

/**
 * `HGLinearFilter::bicubic(float x, float B, float C)` @Helium 0x10f190
 *
 * Two-branch Mitchell-Netravali cubic (with the parameters B and C
 * passed live, unlike `mitchell` which bakes them). Decoded formula
 * (both branches verified against instruction ordering — see the
 * step-by-step trace in re/disasm/Helium.HGLinearFilter.bicubic.s):
 *
 *   x = |x|
 *   if x < 1.0:
 *     p3 = -1.5*B + 2 - C            ; @const 0x3c7cd4 (-1.5), 0x3caf8c (2.0)
 *     p2 = 2*B + C - 3               ; @const 0x3d2394 (-3.0)
 *     p0 = 1 - B/3                   ; @const 0x3d2398 (-1/3), 0x3c7cc0 (1.0)
 *     return p0 + p2*x^2 + p3*x^3
 *   elif x < 2.0:                    ; @const 0x3caf8c (2.0)
 *     q3 = -B/6 - C                  ; @const 0x3d2390 (-1/6)
 *     q2 = B + 5*C                   ; @const 0x3cf658 (5.0)
 *     q1 = -2*B - 8*C                ; @const 0x3c9fc4 (-8.0)
 *     q0 = 4*B/3 + 4*C               ; @const 0x3cbaec (4/3), 0x3ca2ec (4.0)
 *     return q0 + q1*x + q2*x^2 + q3*x^3
 *   else:
 *     return 0.0                     ; xmm3 = xorps'd to zero
 *
 * This is the standard Mitchell-Netravali family scaled by 1/6.
 */
export function bicubic(x: number, B: number, C: number): number {
  const ax = f(Math.abs(x));
  const one = f(1.0);        // @const 0x3c7cc0
  const two = f(2.0);        // @const 0x3caf8c
  if (one > ax) {
    // branch1: |x| < 1. p3 order per disasm: (-1.5*B) then +2.0 then -C.
    const p3 = f(f(f(f(-1.5) * B) + two) - C);            // @const 0x3c7cd4, 0x3caf8c
    // p2 = 2B + C - 3 (order per disasm: B, +B, +C, +(-3))
    const p2 = f(f(f(B + B) + C) + f(-3.0));              // @const 0x3d2394
    // p0 = 1 - B/3  (order per disasm: xmm1 *= -1/3 -> -B/3; +1.0)
    const p0 = f(f(B * f(-0.333333343)) + one);           // @const 0x3d2398, 0x3c7cc0
    // Body order (matches disasm):
    //   xmm3 = p3 * x * x                     (mulss ax twice)
    //   xmm4 = p2 * x + xmm3                  (mulss ax; addss xmm3)
    //   xmm4 = xmm4 * x                       (mulss ax)
    //   xmm1 = p0 + xmm4
    const t = f(f(p3 * ax) * ax);
    const u = f(f(f(p2 * ax) + t) * ax);
    return f(p0 + u);
  }
  if (two > ax) {
    // branch2: 1 <= |x| < 2
    // xmm3 = -1/6 * B - C           (disasm: mulss -1/6; subss C)
    const xmm3a = f(f(B * f(-0.166666672)) - C);          // @const 0x3d2390
    // xmm3 *= x
    const xmm3b = f(xmm3a * ax);
    // xmm4 = 5*C + B                 (disasm: mulss 5.0; addss B)
    const xmm4a = f(f(C * f(5.0)) + B);                   // @const 0x3cf658
    // xmm4 = (xmm4 + xmm3) * x  =>  ((B + 5C) + (-B/6 - C)*x) * x
    const xmm4b = f(f(xmm4a + xmm3b) * ax);
    // xmm3 = -8 * C                  (disasm: -8.0 * C)
    const xmm3c = f(f(-8.0) * C);                         // @const 0x3c9fc4
    // xmm5 = 2*B                     (disasm: B, +B)
    const xmm5 = f(B + B);
    // xmm3 -= xmm5                   (=> -8C - 2B)
    const xmm3d = f(xmm3c - xmm5);
    // xmm1 *= 4/3                    (=> 4B/3)
    const xmm1 = f(B * f(1.333333373));                   // @const 0x3cbaec
    // xmm2 *= 4                      (=> 4C)
    const xmm2 = f(C * f(4.0));                           // @const 0x3ca2ec
    // xmm3 = (xmm3 + xmm4) * x
    const xmm3e = f(f(xmm3d + xmm4b) * ax);
    // xmm2 = (xmm2 + xmm1) + xmm3
    return f(f(xmm2 + xmm1) + xmm3e);
  }
  return f(0.0);
}

/**
 * `HGLinearFilter::lanczos(float x, float a, float b)` @Helium 0x10f280
 *
 * Disasm summary:
 *   xmm2 = 0
 *   if a <= |x|: return 0                     ; xmm1 = a
 *   xmm0 = x * pi                             ; @const 0x3d2388
 *   xmm2 = (x*pi)^2 + 1
 *   xmm3 = 1.0                                ; @const 0x3c7cc0
 *   if xmm2 == 1.0:  sinc1 = 1.0              ; xmm2 <- xmm3
 *   else:            sinc1 = sinf(x*pi) / (x*pi)
 *   xmm4 = (x/a) * pi
 *   if (xmm4^2 + 1) == 1.0:  sinc2 = 1.0
 *   else:                    sinc2 = sinf(xmm4) / xmm4
 *   return sinc1 * sinc2
 *
 * Semantics: 2-lobe (windowed) Lanczos kernel — `sinc(pi*x) * sinc(pi*x/a)`
 * for `|x| < a`, zero otherwise. `a` is the window half-width, `b` unused.
 */
export function lanczos(x: number, a: number, _b: number): number {
  const one = f(1.0);         // @const 0x3c7cc0
  const pi = f(3.141592741);  // @const 0x3d2388
  const ax = f(Math.abs(x));
  if (a <= ax) return f(0.0);
  const pi_x = f(x * pi);
  const sq1 = f(f(pi_x * pi_x) + one);
  const sinc1 = sq1 === one ? one : f(Math.sin(pi_x) / pi_x);
  const pi_x_over_a = f(f(x / a) * pi);
  const sq2 = f(f(pi_x_over_a * pi_x_over_a) + one);
  const sinc2 = sq2 === one ? one : f(Math.sin(pi_x_over_a) / pi_x_over_a);
  return f(sinc1 * sinc2);
}

/**
 * `HGLinearFilter::mitchell(float x, float a, float b)` @Helium 0x10f340
 *
 * Two-branch Mitchell-Netravali cubic with the standard B=C=1/3
 * parameters baked in (`bicubic` above takes B, C as live arguments;
 * `mitchell` hardcodes them and pre-simplifies each coefficient).
 * Decoded (see re/disasm/Helium.HGLinearFilter.mitchell.s):
 *
 *   x = |x|
 *   if x < 1.0:
 *     xmm1 = 7/6 * x                        ; @const 0x3d23a8 (7/6)
 *     xmm1 = xmm1 * x                       ; -> 7/6 * x^2
 *     xmm2 = 2 * x                          ; addss %xmm0, %xmm2
 *     xmm1 = xmm1 - xmm2                    ; -> 7/6*x^2 - 2x
 *     xmm1 = xmm1 * x                       ; -> 7/6*x^3 - 2*x^2
 *     xmm1 = xmm1 + 8/9                     ; @const 0x3d23ac (8/9)
 *     return xmm1
 *   elif x < 2.0:                           ; @const 0x3caf8c
 *     xmm1 = -7/18 * x                      ; @const 0x3d239c
 *     xmm1 = xmm1 + 2.0                     ; @const 0x3caf8c
 *     xmm1 = xmm1 * x
 *     xmm1 = xmm1 + (-10/3)                 ; @const 0x3d23a0
 *     xmm1 = xmm1 * x
 *     xmm1 = xmm1 + 16/9                    ; @const 0x3d23a4
 *     return xmm1
 *   else: return 0
 */
export function mitchell(x: number, _a: number, _b: number): number {
  const ax = f(Math.abs(x));
  const one = f(1.0);   // @const 0x3c7cc0
  const two = f(2.0);   // @const 0x3caf8c
  if (one > ax) {
    // 7/6 * x^3 - 2*x^2 + 8/9 (via factored eval matching disasm)
    let t = f(f(1.166666627) * ax);           // @const 0x3d23a8
    t = f(t * ax);
    const tx2 = f(ax + ax);
    t = f(t - tx2);
    t = f(t * ax);
    return f(t + f(0.888888896));             // @const 0x3d23ac
  }
  if (two > ax) {
    let t = f(f(-0.388888896) * ax);          // @const 0x3d239c
    t = f(t + two);                           // @const 0x3caf8c
    t = f(t * ax);
    t = f(t + f(-3.333333492));               // @const 0x3d23a0
    t = f(t * ax);
    return f(t + f(1.777777910));             // @const 0x3d23a4
  }
  return f(0.0);
}

/**
 * `HGLinearFilter::kaiser(float x, float a, float b)` @Helium 0x10f3d0
 *
 * NOT YET TRANSCRIBED — the Kaiser window uses a piecewise polynomial
 * expansion of the modified Bessel function I0(beta * sqrt(1 - x^2)) / I0(beta)
 * (two separate polynomial evaluations at ~0x10f42a..0x10f472 and
 * ~0x10f551..0x10f5e6, plus a third at ~0x10f609..0x10f651). The 128-line
 * disasm at raw-port/re/disasm/Helium.HGLinearFilter.kaiser.s is fully
 * captured but the ~25 RIP-relative I0 polynomial coefficients need
 * per-instruction decode before we can port it faithfully. Deferred
 * per PORTING_SPEC Rule 3 — a loud gap is correct; do NOT approximate.
 * @Helium 0x10f3d0
 */
export function kaiser(_x: number, _a: number, _b: number): number {
  // throw citing @Helium 0x10f3d0 (P4 requires an @0xADDR on this line)
  throw new Error("HGLinearFilter::kaiser @Helium 0x10f3d0 not yet transcribed");
}

/**
 * `HGLinearFilter::hann(float x, float a, float b)` @Helium 0x10f670
 *
 * Disasm:
 *   xmm2 = |x|                              ; andps @const 0x3c7c30
 *   xmm3 = 0
 *   xmm4 = 1.0                              ; @const 0x3c7cc0
 *   if 1.0 <= |x|: return 0                 ; jbe -> xmm3=0 fall-through
 *   xmm4 = 1.0 - a                          ; subss %xmm1, %xmm4
 *   xmm0 = x * pi                           ; @const 0x3d2388
 *   call _cosf
 *   xmm3 = xmm0 * (1 - a) + a
 *   return xmm3
 *
 * Semantics: generalized Hann/cosine window — `a + (1-a)*cos(pi*x)`
 * for `|x| < 1`, zero outside. Classical Hann (`a = 0.5`) gives
 * `0.5 + 0.5*cos(pi*x)`.
 */
export function hann(x: number, a: number, _b: number): number {
  const one = f(1.0);         // @const 0x3c7cc0
  const pi = f(3.141592741);  // @const 0x3d2388
  const ax = f(Math.abs(x));
  if (one <= ax) return f(0.0);
  const oneMinusA = f(one - a);
  const c = f(Math.cos(f(x * pi)));
  return f(f(c * oneMinusA) + a);
}

/**
 * `HGLinearFilter::hamming(float x, float a, float b)` @Helium 0x10f6d0
 *
 * Disasm:
 *   xmm2 = |x|                              ; andps @const 0x3c7c30
 *   xmm1 = 0
 *   xmm3 = 1.0                              ; @const 0x3c7cc0
 *   if 1.0 <= |x|: return 0                 ; jbe -> xmm1=0 fall-through
 *   xmm0 = x * pi                           ; @const 0x3d2388
 *   call _cosf
 *   xmm1 = xmm0 * 0.45652175 + 0.54347825   ; @const 0x3d23ec, 0x3d23f0
 *   return xmm1
 *
 * Semantics: Hamming window with the "exact" (21/46, 25/46) coefficients:
 *   `25/46 + 21/46 * cos(pi*x)` for |x| < 1, zero outside.
 * `a` and `b` unused.
 */
export function hamming(x: number, _a: number, _b: number): number {
  const one = f(1.0);         // @const 0x3c7cc0
  const pi = f(3.141592741);  // @const 0x3d2388
  const ax = f(Math.abs(x));
  if (one <= ax) return f(0.0);
  const c = f(Math.cos(f(x * pi)));
  return f(f(c * f(0.456521750)) + f(0.543478250));   // @const 0x3d23ec, 0x3d23f0
}

/**
 * `HGLinearFilter::blackman(float x, float a, float b)` @Helium 0x10f720
 *
 * Disasm summary (this one uses *double-precision* cos):
 *   xmm2 = |x|                              ; andps @const 0x3c7c30
 *   xmm0 = 0
 *   xmm3 = 1.0                              ; @const 0x3c7cc0
 *   if 1.0 <= |x|: return 0
 *   xmm0 = (double) x                       ; cvtss2sd
 *   xmm0 = xmm0 * pi (double)               ; mulsd @const 0x3d23f8 = 3.14159265358979
 *   call _cos                               ; double _cos
 *   xmm0 = (float) xmm0                     ; cvtsd2ss
 *   c = xmm0                                ; = cos(pi*x)
 *   xmm2 = movaps [0.49656063, 0, 0, 0]     ; @const 0x3d2360
 *   xmm0 = c + c                            ; = 2*c
 *   xmm2 = insertps(xmm2, xmm0, 0x10)       ; xmm2 = [0.49656063, 2c, 0, 0]
 *   xmm2 = xmm2 * [c, c, c, c]              ; = [0.49656063*c, 2*c*c, 0, 0]
 *   xmm2 = xmm2 + [0.42659071, -1.0, 0, 0]  ; @const 0x3d2370, 0x3d2374
 *                                           ; xmm2 = [0.42659071 + 0.49656063*c,
 *                                           ;         2*c*c - 1,  0, 0]
 *   xmm0 = xmm2[1]                          ; movshdup
 *   xmm0 = xmm0 * 0.07684867                ; @const 0x3d23f4
 *   xmm0 = xmm0 + xmm2[0]                   ; addss
 *   return xmm0
 *
 *   Since 2*cos^2(theta) - 1 == cos(2*theta), the final value is:
 *     0.42659071 + 0.49656063 * cos(pi*x) + 0.07684867 * cos(2*pi*x)
 *   for |x| < 1, zero outside. This is the exact 3-term Blackman window
 *   (a0=7938/18608, a1=9240/18608, a2=1430/18608).
 *
 * `a` and `b` unused.
 */
export function blackman(x: number, _a: number, _b: number): number {
  const one = f(1.0);         // @const 0x3c7cc0
  const ax = f(Math.abs(x));
  if (one <= ax) return f(0.0);
  // NOTE: the disasm widens to double *before* multiplying by pi, then
  // calls double-precision cos, then narrows back. Preserve that path.
  const pi_d = 3.141592653589793;                 // @const 0x3d23f8 (double)
  const c = f(Math.cos(x * pi_d));
  const a0 = f(0.426590711);                      // @const 0x3d2370
  const a1 = f(0.496560633);                      // @const 0x3d2360
  const a2 = f(0.076848671);                      // @const 0x3d23f4
  // The disasm computes 2*c*c-1 via SSE lanes, but that's algebraically
  // cos(2*pi*x). We mirror the disasm's numerics (single-precision
  // fround at each step) rather than call cos(2*pi*x) directly.
  const two_c = f(c + c);
  const two_cc = f(two_c * c);
  const cos2 = f(two_cc + f(-1.0));               // @const 0x3d2374
  return f(f(cos2 * a2) + f(f(a1 * c) + a0));
}

/**
 * `HGLinearFilter::disc(float x, float y, float a, float b)` @Helium 0x10f790
 *
 * Disasm:
 *   xmm0 = x*x
 *   xmm1 = y*y
 *   xmm0 = xmm0 + xmm1                      ; = x^2 + y^2
 *   xmm1 = 1.0                              ; @const 0x3c7cc0
 *   xmm0 = (xmm0 < 1.0) ? all-ones : 0      ; cmpltss
 *   xmm0 = xmm0 AND 1.0
 *
 * Semantics: 2D unit-disc / circle indicator — returns 1.0 if
 * `x^2 + y^2 < 1.0`, else 0.0. Note this is the ONLY function in
 * the namespace with 4 arguments (the last chars in the mangled name
 * `Effff` = four floats).
 */
export function disc(x: number, y: number, _a: number, _b: number): number {
  return f(f(x * x) + f(y * y)) < f(1.0) ? f(1.0) : f(0.0);
}
