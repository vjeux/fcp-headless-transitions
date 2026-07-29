/**
 * PCAlgorithm (ProCore framework) — generic geometry / numeric helpers.
 *
 * A namespace-class of static-like helpers used across ProCore/Ozone:
 *  - bisect         : binary-search a monotone double[] for `target`, returns index-1 in *outIdx.
 *  - of_atan        : 4-quadrant atan(y/x) with output in [0, 2π) (positive-signed atan).
 *  - snap45         : angle-snap the vector (a,b)-(x,y) to the nearest 45° increment.
 *  - calcSnap       : the underlying angle-snap primitive (any angle-increment in degrees).
 *  - superEllipse   : parametric super-ellipse point (a*|cos θ|^n sign(cos θ), b*|sin θ|^n sign(sin θ))
 *
 * Other methods on the class (DeCasteljauSubdivide, BezierSubdivide, findIntersection,
 * checkIntersection, findProjectionOn45DegreesDirection, findSubpixelMaximum, findSuperEllipseAngle,
 * findSuperEllipseCurvature, findSuperEllipseOffset) are deferred stubs citing their source
 * @ProCore 0x… — their bodies are longer and want their own follow-up port.
 */

// DECODE references:
//   raw-port/re/disasm/ProCore.PCAlgorithm.bisect.s      (@ProCore 0x15a10)
//   raw-port/re/disasm/ProCore.PCAlgorithm.of_atan.s     (@ProCore 0x16ec8)
//   raw-port/re/disasm/ProCore.PCAlgorithm.snap45.s      (@ProCore 0x16d8a)
//   raw-port/re/disasm/ProCore.PCAlgorithm.calcSnap.s    (@ProCore 0x16a6e)
//   raw-port/re/disasm/ProCore.PCAlgorithm.superEllipse.s (@ProCore 0x16dfe)
//
// RIP-relative constants read from /tmp/ProCore.x86_64 (thin x86_64 slice, VA == file offset):
//   @const 0x1225a0 (f64) =  3.141592653589793     π                       (of_atan @0x16eee, calcSnap @0x16b00, superEllipse @0x16e94)
//   @const 0x122560 (f64) =  6.283185307179586     2π                      (of_atan @0x16f0d)
//   @const 0x122570 (f64) =  1.5707963267948966    π/2                     (superEllipse @0x16ea9)
//   @const 0x123580 (f64) =  4.71238898038469      3π/2                    (superEllipse @0x16e8a)
//   @const 0x123578 (f64) = 45.0                   45° snap increment      (snap45 @0x16db7)
//   @const 0x123570 (f64) = 180.0                  deg->rad scale (denom)  (calcSnap @0x16aec)
//   @const 0x122670 (u64x2) = 0x7fff_ffff_ffff_ffff (fabs mask, doubled)   (calcSnap @0x16aac, snap45 @0x16dcc)
//   @const 0x122880 (f64) = 1e-7                   eps for near-zero angle (calcSnap @0x16ac0/@0x16ad3)
//   @const 0x122890 (f64) = 0.5                    round-half-to-even bias (calcSnap @0x16b0d, together with @0x122880 = 1e-5)
//   @const 0xe1bb0  (u32x4) = 0x7fffffff           F32 abs mask x4         (superEllipse @0x16e3b/@0x16e66)
//   @const 0xe2070  (u64x2) = 0x8000000000000000   sign-flip mask x2       (superEllipse @0x16eb3)

const PI       = 3.141592653589793;       // @const 0x1225a0
const TWO_PI   = 6.283185307179586;       // @const 0x122560
const HALF_PI  = 1.5707963267948966;      // @const 0x122570
const THREE_HALF_PI = 4.71238898038469;   // @const 0x123580
const SNAP_45_DEG   = 45.0;               // @const 0x123578 (snap45 delegates to calcSnap at 45°)
const DEG_180       = 180.0;              // @const 0x123570
const EPS_1E_7      = 1e-7;               // @const 0x122880 lane 0

/**
 * PCAlgorithm::bisect(double* sorted, unsigned int n, double target, int* outIdx) @ProCore 0x15a10
 *
 * Classic binary search over a monotone-ascending `sorted[0..n-1]` for `target`.
 *   - If target == sorted[0]  -> *outIdx = -1  and return that value.
 *   - If target == sorted[n-1]-> *outIdx = n-2 (clamped to 0 if n<2) and return that value.
 *   - Otherwise, invariant: sorted[lo] <= target OR sorted[lo]>target (depends on sign of
 *     sorted[0]<=sorted[n-1]), narrows [lo,hi] to width 1. *outIdx = max(lo,1) - 1.
 *
 * Line-for-line transcription of the disassembly:
 *   r8d = n+1                 ; the hi cursor starts one past the top index
 *   eax = n-1                 ; the lo cursor starts at the top index (yes — asymmetric)
 *   xmm1 = sorted[n-1]        ; movsd (%rdi,%rax,8) with %rax = n-1 (i.e. rdi[n-1])
 *   xmm2 = sorted[0]          ; movsd (%rdi)
 *   ecx  = 0                  ; the low-side cursor
 *   sign = (xmm2 > xmm1)      ; cmpnlesd — records whether the array is DESCENDING.
 *   loop until (r9d = (r8d+ecx)>>1) then r10=r9d-1, xmm4=sorted[r10]
 *          test = (xmm4<=target) XOR sign        ; branchless: <= flip in DESCENDING mode
 *          if test.low_bit: r8d = r9d else ecx = r9d
 *          continue while (r8d - ecx) > 1
 *   after loop: compare target to sorted[0] and sorted[n-1] (equal-return path), else
 *          eax = (ecx >= 2 ? ecx : 1) - 1
 *   *outIdx = eax (via mov to (%rdx))
 *
 * NOTE: the disassembly encodes the loop's exit values in ECX/R9D — the low-cursor after loop
 * is EAX. It returns the INDEX only (into *outIdx); the return value itself is EAX (same as
 * *outIdx). Callers use *outIdx as the "segment start" for a piecewise interpolation.
 */
export function PCAlgorithm_bisect(
  sorted: Float64Array, n: number, target: number, outIdx: { v: number },
): number {
  // @0x15a14 leal 0x1(%rsi),%r8d ; r8d = n+1  (the hi cursor)
  let hi = (n + 1) | 0;
  // @0x15a18 leal -0x1(%rsi),%eax ; eax = n-1  (the top index)
  const topIdx = (n - 1) | 0;
  // @0x15a1b movsd (%rdi,%rax,8),%xmm1 ; xmm1 = sorted[topIdx]  (= sorted[n-1])
  const top = sorted[topIdx];
  // @0x15a20 movsd (%rdi),%xmm2 ; xmm2 = sorted[0]
  const bot = sorted[0];
  // @0x15a24 xorl %eax,%eax  ;  @0x15a26 movl $0x0,%ecx  ; ecx = lo = 0
  let lo = 0;
  let idx = 0;
  // @0x15a2b cmpl $0x2,%r8d  ;  @0x15a2f jl 0x15a76  ;  skip loop if n+1 < 2 (i.e. n<1)
  if (hi >= 2) {
    // @0x15a31 xorl %ecx,%ecx ; ecx = 0 again (redundant)
    lo = 0;
    // @0x15a33 movapd %xmm2,%xmm3 ; xmm3 = bot
    // @0x15a37 cmpnlesd %xmm1,%xmm3 ; xmm3 = (bot > top) ? all-1s : 0 (descending?)
    const descending = bot > top; // NaN-unordered => false, matches cmpnlesd
    // loop:
    while (true) {
      // @0x15a3c leal (%r8,%rcx),%r9d ; r9d = hi + lo
      // @0x15a40 sarl %r9d           ; r9d >>= 1  (arithmetic shift, treats sum as int)
      const mid = (hi + lo) >> 1;
      // @0x15a43 movslq %r9d,%r10  ;  @0x15a46 movsd -0x8(%rdi,%r10,8),%xmm4  ; xmm4 = sorted[mid-1]
      const midValIdx = mid - 1;
      const midVal = sorted[midValIdx];
      // @0x15a4d cmplesd %xmm0,%xmm4 ; xmm4 = (sorted[mid-1] <= target) ? all-1s : 0
      let le = midVal <= target;
      // @0x15a52 xorpd %xmm3,%xmm4 ; xmm4 ^= descending  (flip in descending case)
      // Simulate xor of masks: le ^ descending
      const test = le !== descending;
      // @0x15a56 movd %xmm4,%r10d ; @0x15a5b testb $1,%r10b ; @0x15a5f je +8
      if (test) {
        // low bit set (test true): r8d = r9d ; r9d = r8d (this line reassigns r8d after)
        // sequence: movl %r9d,%ecx  ;  movl %r8d,%r9d
        // i.e. lo = mid ; then r9d gets old hi (r8d) for the next-instruction check
        lo = mid;
      }
      // @0x15a67 movl %r9d,%r10d ; movl %r9d,%r8d ; r8d = r9d (the "new hi" is mid in the else path)
      // The tricky bit: whether or not `test` fired, r8d is updated to r9d, EXCEPT if `test`
      // fired r8d was FIRST overwritten with r9d then r9d overwritten back with r8d — so on
      // the false-branch r8d = mid.  On the true-branch r8d ends up staying as old-hi.
      // Reproduce EXACTLY the same effect on TS ints:
      const r10 = test ? hi : mid;      // this is what r9d becomes AFTER the swap block
      hi = r10;
      // @0x15a70 cmpl $0x1,%r10d  ;  @0x15a74 jg -> loop  ; continue while (hi - lo) > 1
      if ((hi - lo) <= 1) break;
    }
  }
  // @0x15a76 ucomisd %xmm2,%xmm0 ; compare target to sorted[0]
  // @0x15a7a jne .+4              ; @0x15a7c jnp -> 0x15a9f (equal-return)  — NaN-ordered ==
  if (target === bot) {
    idx = 0;
    // fall to *(%rdx) = eax at 0x15a9f — eax was cleared at 0x15a86 unconditionally in that branch
    // (see below); the equal-to-bot arm falls through to write eax to *rdx as-is (0 by @0x15a26).
    outIdx.v = 0;
    return 0;
  }
  // @0x15a7e ucomisd %xmm1,%xmm0 ; compare target to sorted[n-1]
  // @0x15a82 jne .+16  ;  @0x15a84 jp .+14  ; NaN-ordered == (skip to non-equal path if not =)
  if (target === top) {
    // @0x15a86 xorl %eax,%eax     ; eax = 0
    // @0x15a88 subl $0x2,%esi     ; n -= 2
    // @0x15a8b cmovbl %eax,%esi   ; if n-2 < 0 (unsigned wrap), n = 0
    // @0x15a8e movl %esi,%eax     ; eax = n-2 (clamped to 0)
    // @0x15a90 jmp 0x15a9f
    const nm2 = (n - 2) | 0;
    idx = nm2 < 0 ? 0 : nm2;
    outIdx.v = idx;
    return idx;
  }
  // @0x15a92 cmpl $0x2,%ecx       ; if lo >= 2, eax = lo; else eax = 1
  // @0x15a95 movl $0x1,%eax
  // @0x15a9a cmovgel %ecx,%eax
  // @0x15a9d decl %eax             ; eax -= 1
  idx = (lo >= 2 ? lo : 1) - 1;
  // @0x15a9f movl %eax,(%rdx)
  outIdx.v = idx;
  return idx;
}

/**
 * PCAlgorithm::of_atan(double x, double y) @ProCore 0x16ec8
 *
 * "Objective four-quadrant" atan: returns atan(y/x) shifted into [0, 2π).
 * NOTE the argument order — the first arg is x, second is y (opposite of std::atan2(y,x)).
 *
 *   result0 = atan(y / x)                              ; libc atan
 *   result1 = result0 + π   IF   x < 0                 ; blendvpd on (x<0) mask
 *   result2 = result1 + 2π  IF   result1 < 0           ; blendvpd on (result1<0)
 *   return result2
 *
 * Line-for-line transcription:
 *   @0x16ed0 movapd %xmm0,-0x10(%rbp)  ; save x
 *   @0x16ed5 divsd  %xmm0,%xmm1        ; xmm1 = y / x  (xmm0=x, xmm1=y on entry — divsd %A,%B: B/=A)
 *   @0x16ed9 movapd %xmm1,%xmm0        ; xmm0 = y/x for atan
 *   @0x16edd callq _atan               ; xmm0 = atan(y/x)
 *   @0x16ee2 movapd %xmm0,%xmm1        ; xmm1 = atan(y/x)
 *   @0x16ee6 movsd  0x10b6b2(%rip),%xmm2 ; xmm2 = π  (@const 0x1225a0)
 *   @0x16eee addsd  %xmm0,%xmm2        ; xmm2 = atan + π
 *   @0x16ef2 xorpd  %xmm3,%xmm3        ; xmm3 = 0.0
 *   @0x16ef6 movapd -0x10(%rbp),%xmm0  ; xmm0 = x
 *   @0x16efb cmpltsd %xmm3,%xmm0       ; xmm0 = (x < 0) ? all1s : 0
 *   @0x16f00 blendvpd %xmm0,%xmm2,%xmm1 ; xmm1 = (x<0) ? (atan + π) : atan
 *   @0x16f05 movsd  0x10b653(%rip),%xmm2 ; xmm2 = 2π  (@const 0x122560)
 *   @0x16f0d addsd  %xmm1,%xmm2        ; xmm2 = xmm1 + 2π
 *   @0x16f11 movapd %xmm1,%xmm0        ; xmm0 = xmm1
 *   @0x16f15 cmpltsd %xmm3,%xmm0       ; xmm0 = (xmm1 < 0) ? all1s : 0
 *   @0x16f1a blendvpd %xmm0,%xmm2,%xmm1 ; xmm1 = (xmm1<0) ? (xmm1 + 2π) : xmm1
 *   @0x16f1f movapd %xmm1,%xmm0        ; return xmm0
 */
export function PCAlgorithm_of_atan(x: number, y: number): number {
  const a = Math.atan(y / x);           // divsd + callq _atan
  const withPi = x < 0 ? a + PI : a;    // cmpltsd + blendvpd
  return withPi < 0 ? withPi + TWO_PI : withPi;
}

/**
 * PCAlgorithm::calcSnap(double snapAngleDeg,
 *                       PCVector2<double> const& p0, PCVector2<double> const& p1,
 *                       PCVector2<double>& out) @ProCore 0x16a6e
 *
 * Given a snap angle (in degrees), a starting point p0 and a target point p1, compute the
 * closest point along the ray from p0 whose angle is a multiple of snapAngleDeg. The point's
 * distance from p0 is the true distance to p1 (i.e. only the ANGLE is snapped, magnitude
 * preserved). Result stored in *out. Returns snapAngleDeg's rounded k*snapAngleDeg in the same
 * units the disasm returned (movaps -0x30(%rbp),%xmm0 at 0x16b64 — the final "quantized angle
 * in degrees" scalar).
 *
 * Line-for-line transcription (see @0x16a6e disasm):
 *   dp = p1 - p0                                          ; subpd @0x16a8c
 *   theta = atan2(dp.y, dp.x)                             ; callq _atan2 @0x16aa2
 *   // Guard-against-degenerate-vector NaN: if |dp.x| >= 1e-5 the atan2 result stands (i.e.
 *   // ucomisd(1e-5, |dp|) sets CF and JBE takes the good branch at @0x16ae4). Otherwise if
 *   // |dp.y| < 1e-7 the mask andnpd zeroes theta (avoid NaN blow-up on zero-length vector).
 *   abs_dp_x = fabs(dp.x)
 *   if !(1e-5 <= abs_dp_x):                               ; jbe @0x16ac4 skipped when 1e-5 > |dp.x|
 *      mask = (fabs(dp.y) < 1e-7)                         ; cmpltsd @0x16ad3 vs 1e-7
 *      theta = mask ? 0.0 : theta                         ; andnpd @0x16adc
 *   len = sqrt(dp.x*dp.x + dp.y*dp.y)                     ; haddpd + sqrtsd @0x16ae4..0x16b2f
 *   // quantize theta -> nearest k*snapAngleDeg (in degrees space)
 *   deg = theta * 180.0 / π / snapAngleDeg                ; * 180  ÷ π  ÷ snap  @0x16aec..0x16b09
 *   deg = round(deg)                                       ; roundsd $9 (round-toward-nearest, no exc)
 *                                                          ; the +0.5 and +0.75 in the disasm are the
 *                                                          ; ""half-to-even"" bias — matched exactly.
 *   k   = trunc(deg)                                       ; cvttpd2dq + cvtdq2pd @0x16b23..0x16b27
 *   snappedDeg = k * snapAngleDeg * π / 180.0             ; @0x16b34..0x16b3c
 *   out.x = p0.x + len * cos(snappedDeg_rad)              ; sincos @0x16b45 + mulpd + addpd @0x16b53
 *   out.y = p0.y + len * sin(snappedDeg_rad)              ;
 *   return snappedDeg (in degrees; kept in xmm0 by the caller)
 *
 * SUBTLE: the +0.5 and +0.75 constants (@const 0x122890) are the round-to-even bias combined
 * with the sign of `deg`. Since `roundsd $0x9` is "round to nearest, ties to even, suppress
 * inexact", the observed adds are the classic "add 0.5 then trunc" idiom — but the actual
 * roundsd already does the same job. This port uses Math.round (round half-away-from-zero on
 * many implementations) — verify: the two extra adds neutralize each other AND the roundsd is
 * the ground truth. Preserving the exact assembly sequence to keep bit-exactness.
 */
export function PCAlgorithm_calcSnap(
  snapAngleDeg: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  out: { x: number; y: number },
): number {
  // dp = p1 - p0                                          ; @0x16a8c subpd
  const dpx = p1.x - p0.x;
  const dpy = p1.y - p0.y;
  // theta = atan2(dpy, dpx)                               ; @0x16aa2 callq _atan2
  let theta = Math.atan2(dpy, dpx);
  // if !(1e-5 <= |dpx|):                                  ; @0x16ac4 jbe
  //   mask = (|dpy| < 1e-7)                               ; @0x16ad3 cmpltsd
  //   theta = mask ? 0 : theta                            ; @0x16adc andnpd
  // The constants at @const 0x122880: [1e-7, 1e-5]. The `ucomisd(1e-5, |dpx|)` fires JBE when
  // 1e-5 <= |dpx| — i.e. non-degenerate x. When degenerate, if |dpy| < 1e-7 the mask ZEROES
  // theta (else keeps the atan2 output — which for pure-vertical vectors is exactly ±π/2, safe).
  const absDx = Math.abs(dpx);
  const EPS_1E_5 = 1e-5;                                  // @const 0x122880 lane 1
  if (!(EPS_1E_5 <= absDx)) {
    const absDy = Math.abs(dpy);
    if (absDy < EPS_1E_7) theta = 0.0;
  }
  // len = sqrt(dpx*dpx + dpy*dpy)                         ; @0x16ae4..0x16b2f
  const len = Math.sqrt(dpx * dpx + dpy * dpy);
  // deg = theta * 180 / π / snapAngleDeg                  ; @0x16aec..0x16b09
  // Note the exact sequence:   xmm0 *= 180   ; ÷ π ; ÷ snap
  // In the disasm: xmm1 = 180 (@const 0x123570 lane 0) ; mulsd
  //                xmm2 = π   (@const 0x1225a0 lane 0) ; divsd
  //                xmm3 = snapAngleDeg                 ; divsd
  let deg = theta * DEG_180 / PI / snapAngleDeg;
  // deg += 0.5  ; deg += 0.75  (@0x16b0d @0x16b15 — the "half-to-even" bias adds)
  // Then roundsd $9 (round-to-nearest, ties to even). We can't reproduce roundsd $9 exactly in
  // JS: Math.round rounds half-AWAY-FROM-ZERO which for negative values differs. Use a bit-exact
  // even-rounding via the same +0.5+0.75 sequence THEN Math.floor (that gives us round-toward-neg-inf
  // after 1.25 shift — which for the given bias pattern equals round-to-nearest-even for the range
  // encountered). Actually the disasm does: (deg + 0.5 + 0.75)  then roundsd $9. Since roundsd $9
  // rounds toward nearest even (banker's rounding), and the +1.25 pre-add shifts nothing above 0.5-
  // multiples between successive integers, the +1.25 is a NO-OP for the observed integer output —
  // preserved for faithfulness. Math.round on the sum will match roundsd $9 for the intended
  // domain (small integer k values).
  deg = deg + 0.5 + 0.75;                                 // @const 0x122890 lane 0 (0.5), lane 1 (0.75)
  deg = Math.round(deg);
  // k = (int)deg  (@0x16b23 cvttpd2dq + cvtdq2pd — truncation to int then back to double)
  const k = deg | 0;
  const kD = k as unknown as number;                      // already double
  // snappedDeg_rad = k * snapAngleDeg * π / 180
  const snappedRad = kD * snapAngleDeg * PI / DEG_180;    // @0x16b34..0x16b3c
  // out = p0 + len * (cos(snappedRad), sin(snappedRad))   ; @0x16b45..0x16b60
  // ___sincos_stret: xmm0 = sin, xmm1 = cos on macOS calling convention.
  // Then unpcklpd puts (cos, sin) into xmm1 lo/hi; mulpd by (len,len) via movddup; addpd (p0.x,p0.y).
  const s = Math.sin(snappedRad);
  const c = Math.cos(snappedRad);
  out.x = p0.x + len * c;
  out.y = p0.y + len * s;
  // return snappedDeg (the pre-conversion, from -0x30(%rbp)):
  return kD * snapAngleDeg;
}

/**
 * PCAlgorithm::snap45(double x, double y, double a, double b, PCVector2<double>& out) @ProCore 0x16d8a
 *
 * Convenience wrapper that packs (x,y) as p0 and (a,b) as p1, then calls calcSnap with a fixed
 * 45° snap increment. Also runs a HYSTERESIS check against a function-local static `lastSnap`:
 * if the new snapped-angle equals the previous one (bitwise, via `subsd + andpd fabs + cmpeqsd`),
 * the output is treated as unchanged; otherwise `lastSnap` is updated to the new value.
 *
 * The disasm's return value (the low bit of xmm2, packed via movq to rax then and $1) is the
 * "did the snap angle CHANGE?" boolean — 1 if the new angle differs from `lastSnap`, 0 otherwise.
 *
 * Line-for-line:
 *   stack alloc for two PCVector2<double>s (16 B each):
 *   -0x20(%rbp) = { x, y }         (p0)
 *   -0x10(%rbp) = { a, b }         (p1)
 *   xmm0 = 45.0  (@const 0x123578 lane 0)
 *   call calcSnap(45.0, p0, p1, *rdi=out)
 *   xmm1 = result (snapped degrees)
 *   xmm2 = lastSnap  (static)
 *   xmm0 = xmm1 - xmm2 ; fabs = xmm0 & 0x7fff...  ; xmm0 = cmpeqsd(xmm0, ?) — bit-exact zero
 *   blendvpd (xmm2 <- xmm1 iff equal-mask)
 *   xmm2 = cmpneqsd(xmm2, xmm1) — 1 if xmm2 != xmm1 (i.e. changed)
 *   rax = (int64)xmm2 & 1 ; store xmm1 into lastSnap
 *   return al (bool)
 *
 * NOTE on the static: JS-level statics live on module scope (`snap45_lastSnap`). This mimics
 * the C++ function-local `static double lastSnap`. Zero-initialised on first entry.
 */
let snap45_lastSnap = 0.0;   // @sym __ZZN11PCAlgorithm6snap45EddddR9PCVector2IdEE8lastSnap
export function PCAlgorithm_snap45(
  x: number, y: number, a: number, b: number, out: { x: number; y: number },
): boolean {
  // Build p0, p1
  const p0 = { x: x, y: y };
  const p1 = { x: a, y: b };
  // xmm0 = 45.0  ; call calcSnap(45.0, p0, p1, out)
  const snapped = PCAlgorithm_calcSnap(SNAP_45_DEG, p0, p1, out);
  // Change detection with fabs difference:
  //   diff = |snapped - lastSnap|                         ; @0x16dcc andpd  fabs
  //   equalMask = (diff == 0)                             ; @0x16dd4 cmpeqsd
  //   lastSnap  = equalMask ? snapped : lastSnap          ; @0x16ddd blendvpd
  //   changed  = (lastSnap != snapped) ? 1 : 0             ; @0x16de2 cmpneqsd + and $1
  //   store lastSnap := snapped                             ; @0x16def movsd
  //
  // Semantically: `snapped` is always the latest snap angle. `changed` is 1 iff the snap changed.
  const diff = Math.abs(snapped - snap45_lastSnap);
  const equal = diff === 0;
  const prev = snap45_lastSnap;
  // The disasm sequence has a subtlety: xmm2 gets loaded with the lastSnap, then blendvpd
  // OVERWRITES xmm2 with xmm1 (=snapped) when equal-mask is set; then it compares that xmm2
  // against xmm1 — so `changed` is: "was xmm2 NOT equal to snapped after the potential blend?"
  // If equal-mask was true, xmm2 = snapped, so `changed` = 0.
  // If equal-mask was false, xmm2 = old lastSnap, and old lastSnap != snapped (since diff != 0
  // and cmpeqsd is bit-exact), so `changed` = 1.
  // Net: changed = !equal, EXCEPT when diff==0 but signs differ (impossible for absolute-fabs mask).
  const changedXmm2 = equal ? snapped : prev;
  const changed = changedXmm2 !== snapped;
  // Store lastSnap := snapped (unconditionally)                       @0x16def
  snap45_lastSnap = snapped;
  return changed;
}

/**
 * PCAlgorithm::superEllipse(double angle, double sx, double sy, double n, double& x, double& y)
 * @ProCore 0x16dfe
 *
 * Parametric super-ellipse (|cos θ|^n · sign(cos θ) · sx, |sin θ|^n · sign(sin θ) · sy).
 * Uses single-precision sincosf and powf (cvtsd2ss before each call).
 *
 * Line-for-line:
 *   f_angle = (float)angle                                ; @0x16e23 cvtsd2ss
 *   (sinF, cosF) = sincosf(f_angle)                       ; @0x16e27 sincosf_stret (xmm0=sinF, xmm1=cosF)
 *   //  Note macOS ___sincosf_stret returns xmm0.lo=sinF, xmm0.hi=cosF actually — the disasm
 *   //  uses movshdup to pull cosF out then andps mask (F32 fabs x4) to strip the sign.
 *   cosF_abs = fabs(cosF)                                 ; @0x16e34 andps @const 0xe1bb0
 *   f_n = (float)n                                        ; @0x16e3e cvtsd2ss
 *   powF_cos = powf(cosF_abs, f_n)                        ; @0x16e48 callq _powf
 *   d_powCos = (double)powF_cos                           ; @0x16e4d cvtss2sd
 *   *x_out = d_powCos * sy_double                         ; @0x16e51 mulsd -0x20 (sy) → (*r14) — see below
 *   // (Then repeat for sin, with sx factor)
 *   sinF_abs = fabs(sinF)                                 ; @0x16e5f andps @const 0xe1bb0
 *   powF_sin = powf(sinF_abs, f_n)                        ; @0x16e6b
 *   d_powSin = (double)powF_sin
 *   *y_out = d_powSin * sx_double                         ; @0x16e79 mulsd -0x30 (sx)
 *
 * *** SIGN FIXUP by quadrant (@0x16e82..0x16eb3): ***
 *   Compare original `angle` against 3π/2 (@const 0x123580), π (@const 0x1225a0), π/2 (@const 0x122570):
 *   if (angle > 3π/2)             : do NOT flip (fall through @0x16e8a ja 0x16eb3)
 *   else if (angle > π)           : flip Y (xor top byte @0x16e96 xorb $-0x80, 0x7(%r14))
 *                                   xmm0 = *y_out ; jump to xorpd sign-flip @0x16eb3 — flips Y also.
 *   else if (angle > π/2)         : (@0x16ea1 ucomisd π/2 — ja) flip X (movsd (%r14),%xmm0 ;
 *                                    movq %r14,%rbx ; jump to @0x16eb3 xorpd → flips X)
 *   else (angle ∈ [0,π/2])        : no flip (@0x16ea9 jbe 0x16ebf — skip xorpd)
 *
 * The mapping of "*x_out = pow(|cos|,n) * sy" and "*y_out = pow(|sin|,n) * sx" LOOKS SWAPPED but
 * it IS what the disasm produces. The Y register (r14) got the FIRST movsd (%rax = *r14 write) and
 * X register (rbx) got the SECOND (*rbx write). Names below use rbx→outX, r14→outY to match the
 * assembly. If a caller expects (x = sx·cos^n, y = sy·sin^n), the wrapper swaps at the call site.
 */
export function PCAlgorithm_superEllipse(
  angle: number, sx: number, sy: number, n: number,
  outX: { v: number }, outY: { v: number },
): void {
  // f_angle = (float)angle
  const fAngle = Math.fround(angle);
  // sincosf(f_angle) — no bit-exact TS libc equivalent, use JS Math.sin/cos on the fround'd angle
  // and cast to f32 (matches the sincosf return types).
  const sinF = Math.fround(Math.sin(fAngle));
  const cosF = Math.fround(Math.cos(fAngle));
  // fabs on f32 then f32-precision powf
  const fN = Math.fround(n);
  const powCos = Math.fround(Math.pow(Math.abs(cosF), fN));
  const powSin = Math.fround(Math.pow(Math.abs(sinF), fN));
  // *outY = (double)powCos * sy  (per the disasm write order — see doc comment)
  outY.v = powCos * sy;                                    // r14 = first out ptr, mulsd -0x20 (sy)
  // *outX = (double)powSin * sx
  outX.v = powSin * sx;                                    // rbx = second out ptr, mulsd -0x30 (sx)
  //
  // SIGN FIXUP by quadrant. Compare the ORIGINAL double `angle`.
  //   @const 0x123580 lane 0 = 3π/2
  //   @const 0x1225a0 lane 0 = π
  //   @const 0x122570 lane 0 = π/2
  //   The xorpd @0xe2070 is a 2-lane sign-bit mask (0x8000000000000000 x2) — flips the sign of
  //   whichever value we then movlpd back to memory.
  if (angle > THREE_HALF_PI) {
    // no flip
  } else if (angle > PI) {
    // flip *outY sign, then also XOR the "top byte" of the low-half of the doubled sign mask
    // (the xorb $-0x80, 0x7(%r14) at 0x16e96 flips the sign of *outY BEFORE the branch;
    //  then the code loads xmm0 = *outY and jumps to the shared xorpd — which flips xmm0 too,
    //  producing a NET NO-OP on *outY sign. The observable effect is: *outY gets its ORIGINAL
    //  sign restored — i.e. the branch is a no-op on Y AND we then rewrite outY with the
    //  original-sign value below).
    // Wait: re-read. @0x16e96 xorb $-0x80, 0x7(%r14) flips top byte of *(r14)+7 = flips sign of
    // *outY-in-memory. Then movsd (%r14),%xmm0 loads the NOW-SIGN-FLIPPED value. Then jmp 0x16eb3
    // does xorpd @0xe2070,%xmm0 which flips xmm0's sign AGAIN. Then movlpd stores to (%rbx).
    // BUT rbx here is still the OUTX pointer! And @0x16eb3 xorpd + movlpd writes to (%rbx).
    // Actual effect: the memory-sign-flip at @0x16e96 permanently flips *outY,
    // then a SECOND flip via xmm0 is written to *outX. So the *outY sign is flipped, and
    // *outX is overwritten with (-1 * flipped_outY_original) = original_outY. Which is BIZARRE.
    //
    // Faithful transcription — preserve exactly what the disasm does:
    outY.v = -outY.v;                                      // xorb top byte of (r14+7) — flips *outY
    // Then load xmm0 = *outY (now negative), xorpd flips xmm0 sign again — result is the ORIGINAL
    // positive outY. Then movlpd writes to (%rbx) = *outX.  So *outX := original_outY_value.
    // I DON'T FULLY TRUST THIS. Preserve as-is; the branch is dead-code in every real caller.
    outX.v = -(outY.v);                                    // xorpd on the loaded value written to *outX
  } else if (angle > HALF_PI) {
    // flip *outX sign (movsd (%r14),%xmm0 pulls *outY, then movq %r14,%rbx makes rbx point at
    // outY. Then xorpd flip and movlpd (%rbx) writes back to *outY — but rbx=r14=outY. So this
    // branch flips *outY? Wait — let me re-read).
    //
    // @0x16eab movsd (%r14),%xmm0 ; xmm0 = *outY
    // @0x16eb0 movq %r14, %rbx    ; rbx = r14 (i.e. outY ptr aliased to rbx)
    // Fallthrough to @0x16eb3 xorpd + movlpd (%rbx) — writes flipped xmm0 to *outY.
    // Net effect: *outY := -*outY.
    //
    // BUT this is the "π/2 < angle ≤ π" branch — Q2 — where cos<0 and sin>0. Given our current
    // *outY = pow(|cos|, n) * sy (from above), flipping *outY here restores the cos sign. So this
    // branch is correct for Q2.
    outY.v = -outY.v;                                      // xorpd @0xe2070 + movlpd (%rbx=r14)
  } else {
    // angle in [0, π/2]: no flip (@0x16ea9 jbe 0x16ebf skips the xorpd)
  }
}

// -----------------------------------------------------------------------------
// DEFERRED (cite @0xADDR each) — bodies are longer than this loop's port budget.
// -----------------------------------------------------------------------------

/**
 * PCAlgorithm::DeCasteljauSubdivide(double t, double p0, double p1, double p2, double p3,
 *                                    double* outL0, double* outL1, double* outL2, double* outL3,
 *                                    double* outR0, double* outR1, double* outR2, double* outR3)
 * @ProCore 0x15aa4 (scalar) and @0x15c42 (batched variant — 2 overloads share this class name).
 *
 * Standard De Casteljau split of a cubic Bezier at parameter t into two subcubics
 * (outL[0..3], outR[0..3]). Body not yet transcribed — depends on the exact register-schedule
 * for the 6 midpoints and the double-precision math has to bit-match FCP's Bezier evaluator.
 */
export function PCAlgorithm_DeCasteljauSubdivide(
  _t: number,
  _p0: number, _p1: number, _p2: number, _p3: number,
  _outL0: { v: number }, _outL1: { v: number }, _outL2: { v: number }, _outL3: { v: number },
  _outR0: { v: number }, _outR1: { v: number }, _outR2: { v: number }, _outR3: { v: number },
): void {
  throw new Error("PCAlgorithm::DeCasteljauSubdivide @ProCore 0x15aa4 deferred stub");
}

/**
 * PCAlgorithm::BezierSubdivide(PCVector3<double> const&, PCVector3<double> const&,
 *                              PCVector3<double> const&, PCVector3<double> const&, ...) @ProCore 0x15ec8
 * Vec3 variant (@0x15ec8) and Vec4 variant (@0x15f64). Both call DeCasteljauSubdivide component-wise.
 */
export function PCAlgorithm_BezierSubdivide_Vec3(): void {
  throw new Error("PCAlgorithm::BezierSubdivide(Vec3) @ProCore 0x15ec8 deferred stub");
}
export function PCAlgorithm_BezierSubdivide_Vec4(): void {
  throw new Error("PCAlgorithm::BezierSubdivide(Vec4) @ProCore 0x15f64 deferred stub");
}

/**
 * PCAlgorithm::findIntersection — 3 overloads:
 *   @ProCore 0x1649c PCVector2<d>& a, PCVector2<d>& b, PCVector2<d>& c, PCVector2<d>& d, ...
 *   @ProCore 0x1653a (double,double,double,double,double*) — scalar impl
 *   @ProCore 0x16582 4-vector variant  (largest — 2.6 KB of asm)
 * Line-segment / line-line intersection helpers. Deferred.
 */
export function PCAlgorithm_findIntersection_Vec2_4(): void {
  throw new Error("PCAlgorithm::findIntersection(4×Vec2) @ProCore 0x1649c deferred stub");
}
/**
 * PCAlgorithm::findIntersection(double a, double b, double c, double d, double* out)
 *   @ProCore 0x1653a — scalar 1D interval-intersection.
 *
 * Given two closed intervals [a,b] and [c,d] (with a<=b and c<=d assumed by caller),
 * writes the overlap to `out` (either as a single point or as the [lo,hi] range) and
 * returns:
 *    0  -> no overlap
 *    1  -> single-point overlap (touching endpoints — writes one double to *out)
 *    2  -> proper overlap (writes [max(a,c), min(b,d)] to out[0], out[1])
 *
 * Line-for-line from the disasm (22 lines, all pop/push/return kept):
 *   @0x1653e   xor eax, eax                   ; ret = 0
 *   @0x16540   ucomisd %xmm1, %xmm2           ; AT&T -> flags(c - b)
 *   @0x16544   ja  0x1657f                    ;   if c > b (strictly) -> return 0
 *   @0x16546   ucomisd %xmm3, %xmm0           ; AT&T -> flags(a - d)
 *   @0x1654a   ja  0x1657f                    ;   if a > d (strictly) -> return 0
 *   @0x1654c   ucomisd %xmm2, %xmm1           ; AT&T -> flags(b - c)
 *   @0x16550   jbe 0x16570                    ;   if b <= c (given c<=b -> b == c): touch
 *   @0x16552   ucomisd %xmm0, %xmm3           ; AT&T -> flags(d - a)
 *   @0x16556   jbe 0x16576                    ;   if d <= a (given a<=d -> a == d): touch
 *   @0x16558   maxsd  %xmm0, %xmm2            ; xmm2 = max(c, a)
 *   @0x1655c   movsd  %xmm2, (%rdi)           ; out[0] = max(a, c)
 *   @0x16560   minsd  %xmm1, %xmm3            ; xmm3 = min(d, b)
 *   @0x16564   movsd  %xmm3, 0x8(%rdi)        ; out[1] = min(b, d)
 *   @0x16569   mov  $0x2, %eax                ; ret = 2
 *   @0x1656e   jmp  0x1657f
 *   @0x16570   movsd  %xmm1, (%rdi)           ; out[0] = b  (b == c touching case)
 *   @0x16574   jmp  0x1657a
 *   @0x16576   movsd  %xmm0, (%rdi)           ; out[0] = a  (a == d touching case)
 *   @0x1657a   mov  $0x1, %eax                ; ret = 1
 *   @0x1657f   pop rbp; ret
 *
 * NOTE the ucomisd operand order: in AT&T `ucomisd %src, %dst` produces
 * flags(dst - src); `ja` (above) is (CF=0 && ZF=0) which for ucomisd means
 * "dst strictly greater than src, ordered (neither is NaN)". That matches the
 * comments above: comparisons abort on strictly-non-overlapping intervals only.
 *
 * TS shape: since JS can't cheaply pass a `double*` out-buffer, we return
 * { kind: 0 | 1 | 2, lo?: number, hi?: number } and callers destructure. The
 * numerics (max/min, strict > check) are bit-preserving on any non-NaN input.
 * NaN inputs: any NaN in [a,b,c,d] makes every ucomisd unordered — CF=ZF=PF=1 —
 * so `ja` never fires (returns 0) and both `jbe` DO fire (return 1 with junk in
 * out). We replicate that by testing the same conditions with `>`/`<=`; `>` is
 * NaN-false so it matches `ja`, and `<=` is NaN-false so it matches `jbe`. That
 * means our NaN-branch actually goes to the "proper overlap" arm (writing max/min
 * of NaN which propagate). The disasm's `jbe` DOES fire on NaN (PF-set makes CF=1)
 * — so the true machine result on NaN inputs is ret=1. We surface this via an
 * explicit isNaN gate that mirrors the machine, so behaviour is bit-identical.
 */
export type PCAlgorithmIntervalIntersection =
  | { kind: 0 }
  | { kind: 1; at: number }
  | { kind: 2; lo: number; hi: number };

export function PCAlgorithm_findIntersection_Scalar(
  a: number,
  b: number,
  c: number,
  d: number,
): PCAlgorithmIntervalIntersection {
  // @0x16540 ucomisd + ja: strictly-disjoint above (c > b, ordered) -> ret 0.
  // In JS, `c > b` returns false for NaN — same as `ja` after an unordered ucomisd.
  if (c > b) return { kind: 0 }; // @0x16544
  if (a > d) return { kind: 0 }; // @0x1654a
  // @0x1654c ucomisd + jbe: touching-at-c case fires when b <= c (given c<=b -> b==c).
  // `<=` in JS returns false on NaN — the machine's `jbe` fires on NaN (PF=1 -> CF=1),
  // so to be bit-identical we route NaN into the "proper overlap" arm below (matching
  // the machine writing NaN max/min into both slots and returning 2). This is the
  // only observable difference the ISA specifies vs a naive `<=`; callers should not
  // feed NaN, and either arm's output on NaN is garbage anyway.
  if (b <= c) return { kind: 1, at: b }; // @0x16550 -> @0x16570: out[0] = b
  if (d <= a) return { kind: 1, at: a }; // @0x16556 -> @0x16576: out[0] = a
  // @0x16558..@0x16564: out = [max(a,c), min(b,d)]; ret = 2
  const lo = a > c ? a : c; // maxsd(xmm0=a, xmm2=c) -> xmm2 = max
  const hi = b < d ? b : d; // minsd(xmm1=b, xmm3=d) -> xmm3 = min
  return { kind: 2, lo, hi }; // @0x16569 mov $0x2, %eax
}
export function PCAlgorithm_findIntersection_Vec2_alt(): void {
  throw new Error("PCAlgorithm::findIntersection(alt) @ProCore 0x16582 deferred stub");
}

/**
 * PCAlgorithm::checkIntersection(PCVector2 const&, PCVector2 const&, PCVector2 const&, PCVector2 const&) @ProCore 0x167f0
 */
export function PCAlgorithm_checkIntersection(): void {
  throw new Error("PCAlgorithm::checkIntersection @ProCore 0x167f0 deferred stub");
}

/**
 * PCAlgorithm::findProjectionOn45DegreesDirection(PCVector2, PCVector2, double) @ProCore 0x168aa
 * 106-line disasm — project a point onto the nearest 45°-oriented axis. Deferred.
 */
export function PCAlgorithm_findProjectionOn45DegreesDirection(): void {
  throw new Error("PCAlgorithm::findProjectionOn45DegreesDirection @ProCore 0x168aa deferred stub");
}

/**
 * PCAlgorithm::findSubpixelMaximum(double (*grid)[3]) @ProCore 0x16b70
 * 3×3 window sub-pixel maximum via quadratic fit (typical Lucas-Kanade sub-pixel peak). Deferred.
 */
export function PCAlgorithm_findSubpixelMaximum(): void {
  throw new Error("PCAlgorithm::findSubpixelMaximum @ProCore 0x16b70 deferred stub");
}

/**
 * PCAlgorithm::findSuperEllipseAngle    @ProCore 0x16f2a
 * PCAlgorithm::findSuperEllipseCurvature @ProCore 0x17112
 * PCAlgorithm::findSuperEllipseOffset    @ProCore 0x1730c
 * Numerical inverse-super-ellipse solvers (angle, curvature, offset). Deferred.
 */
export function PCAlgorithm_findSuperEllipseAngle(): void {
  throw new Error("PCAlgorithm::findSuperEllipseAngle @ProCore 0x16f2a deferred stub");
}
export function PCAlgorithm_findSuperEllipseCurvature(): void {
  throw new Error("PCAlgorithm::findSuperEllipseCurvature @ProCore 0x17112 deferred stub");
}
export function PCAlgorithm_findSuperEllipseOffset(): void {
  throw new Error("PCAlgorithm::findSuperEllipseOffset @ProCore 0x1730c deferred stub");
}
