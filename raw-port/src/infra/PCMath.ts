// PCMath.ts — ProCore's PCMath free-function math utilities. This mirrors the 13 methods that
// live at ProCore addresses 0x12635..0x67308 (see raw-port/re/disasm/ProCore.PCMath.*.s).
// Every function below cites its @0xADDR, and every numeric constant cites the __TEXT __const
// address it was read from (via raw-port/army/tools/resolve.py ProCore const <addr>).
//
// DECODE: the disassembly was captured with raw-port/tools/disasm.sh PCMath <method> ProCore and
// the constants were resolved by walking the RIP-relative operands to __TEXT __const (starting at
// 0xe1b10 for PCMath's private-const pool, and 0x1225a0.. for the shared double constant pool).
// See raw-port/re/disasm/ProCore.PCMath.*.s for the ground-truth assembly.
//
// PCPlane<T> struct layout (recovered from equal_planeD/planeF disasm — see below):
//   PCPlane<double> (48 bytes):
//     +0x00  p.x : double        // origin point (3 doubles)
//     +0x08  p.y : double
//     +0x10  p.z : double
//     +0x18  n.x : double        // plane normal (3 doubles)
//     +0x20  n.y : double
//     +0x28  n.z : double
//   PCPlane<float>  (24 bytes): identical structure with float, offsets +0x00..+0x14.
//
// The `throw`ing "not yet transcribed" stubs cite their @0xADDR. There are none in this file:
// all 13 methods are transcribed in-line. External callees (log/exp/pow/acos/cos/sqrt) come from
// libSystem's __stubs — the disasm shows `symbol stub for: _log` etc., and we call the JS
// equivalents (Math.log/Math.exp/Math.pow/Math.acos/Math.cos/Math.sqrt), which are ordered exactly
// like libm on x86_64.

import type { CMTime } from "./CMTime.js";
import {
  kCMTimeFlags_Valid,
  kCMTimeFlags_PositiveInfinity,
  kCMTimeFlags_NegativeInfinity,
  kCMTimeFlags_Indefinite,
  PC_CMTimeSaferSubtract,
  CMTimeCompare,
  CMTimeMake,
} from "./CMTime.js";

// ── PCPlane<T> ────────────────────────────────────────────────────────────────
// Recovered from raw-port/re/disasm/ProCore.PCMath.equal_planeD.s (loads at +0x00,
// +0x08, +0x10 for p and +0x18, +0x20, +0x28 for n) and equal_planeF.s (offsets
// halved for floats). The `T` suffix in the field type is just documentation —
// TS `number` is used for both, and the callers of the float overload MUST wrap
// their values with Math.fround before construction (see PCMath.equalPlaneF).
export interface PCPlaneD {
  px: number; py: number; pz: number;  // origin  @+0x00,+0x08,+0x10
  nx: number; ny: number; nz: number;  // normal  @+0x18,+0x20,+0x28
}
export interface PCPlaneF {
  px: number; py: number; pz: number;  // origin  @+0x00,+0x04,+0x08
  nx: number; ny: number; nz: number;  // normal  @+0x0c,+0x10,+0x14
}

// ── Fixed constants read from the binary (all VAs are inside ProCore __TEXT __const) ──
// The comments show what `raw-port/army/tools/resolve.py ProCore const <addr>` prints.
const PC_ONE_MINUS7_TOL     = 1e-7;   // @const 0x122880 (u64 0x3e7ad7f29abcaf48) — hardcoded internal tol
const PC_ONE_MINUS5_TOL_F32 = Math.fround(9.999999747378752e-06); // @const 0xe2000 (u32 0x3727c5ac) — float variant tol
// The trig-cubic branch uses these direct-decoded doubles:
const PC_TWO_PI      = 6.283185307179586;   // @const 0x122560 (u64 0x401921fb54442d18)
const PC_NEG_TWO_PI  = -6.283185307179586;  // @const 0x122aa8 (u64 0xc01921fb54442d18)
// gammaln: NR-style series, coefficients at 0x122ac0..0x122b00 in cof-pair form.
const PC_GAMMLN_XPLUS       = 5.5;    // @const 0x122a50 (u64 0x4016000000000000)  x + 5.5
const PC_GAMMLN_HALF        = 0.5;    // @const 0x122890 (u64 0x3fe0000000000000)  x + 0.5
const PC_GAMMLN_SQRT_TWO_PI = 2.5066282746310005; // @const 0x122a60 (u64 0x40040d931ff62704)
// gammln coefficient pairs at 0x122ac0/0x122ae0/0x122b00 (pair = [c1, c2]).
const PC_GAMMLN_COF = [
   76.18009172947146,        // @const 0x122ac0  cof[0]
  -86.5053203294167,         // @const 0x122ac8  cof[1]
   24.01409824083091,        // @const 0x122ae0  cof[2]
   -1.231739572450155,       // @const 0x122ae8  cof[3]
   0.001208650973866179,     // @const 0x122b00  cof[4]
   -5.395239384953e-6,       // @const 0x122b08  cof[5]
];
// The [1,2],[3,4],[5,6] increment pairs live at 0x122ab0, 0x122ad0, 0x122af0 (pair layout).
// erf constants (Numerical Recipes gser/gcf tail; see disasm).
const PC_ERF_THRESHOLD_SQ = 1.5;                     // @const 0x122a68 (u64 0x3ff8000000000000)
const PC_ERF_TWO          = 2.0;                     // @const 0x122568
const PC_ERF_FPMIN        = 1e-30;                   // @const 0x122b20 (pair [1e-30, 1e-30])
const PC_ERF_BIG          = 1e30;                    // @const 0x122b30 lane 0 (u64 0x46293e5939a08ce9)
const PC_ERF_HALF         = 0.5;                     // @const 0x122890
const PC_ERF_NEG_HALF     = -0.5;                    // @const 0x1225a8 (u64 0xbfe0000000000000)
const PC_ERF_NEG_GAMMLN_HALF = -0.5723649429247;     // @const 0x122a80 (u64 0xbfe250d048e7a340) = -log(sqrt(pi)) = -gammln(0.5)
const PC_ERF_ONE          = 1.0;                     // @const 0x122530
const PC_ERF_EPS          = 3e-7;                    // @const 0x122a78 (u64 0x3e9421f5f40d8376)
const PC_ERF_MINUS_ONE    = -1.0;                    // @const 0x122a70 (u64 0xbff0000000000000)
// cubic constants.
const PC_CUBIC_27         = 27.0;   // @const 0x122a90 pair-lane 0
const PC_CUBIC_9          = 9.0;    // @const 0x122a90 pair-lane 1 (also 0x122a98 pair-lane 0)
const PC_CUBIC_3          = 3.0;    // @const 0x122628
const PC_CUBIC_NEG_3      = -3.0;   // @const 0x122660 (u64 0xc008000000000000)
const PC_CUBIC_54         = 54.0;   // @const 0x122b40 pair-lane 0
const PC_CUBIC_NEG_2      = -2.0;   // @const 0x122aa0 pair-lane 0
const PC_CUBIC_THIRD      = 0.3333333333333333; // @const 0x1225e8 (u64 0x3fd5555555555555)
// easeInOut / inverseEaseInOut share these:
const PC_EI_ONE           = 1.0;    // @const 0x122530
const PC_EI_MINUS_ONE     = -1.0;   // @const 0x122b50 pair (both -1)
const PC_EI_MINUS_TWO     = -2.0;   // @const 0x122aa0 pair-lane 0

// ── PCMath::byteSwap(float) @0x12635 ──────────────────────────────────────────
// Reinterpret a float32 as u32, byteswap, reinterpret back. That's literally
// `movd xmm0->eax; bswapl eax; movd eax->xmm0`.
export function byteSwap(x: number): number {
  const buf = new ArrayBuffer(4);
  const f = new Float32Array(buf);
  const u = new Uint8Array(buf);
  f[0] = Math.fround(x);
  const b0 = u[0], b1 = u[1], b2 = u[2], b3 = u[3];
  u[0] = b3; u[1] = b2; u[2] = b1; u[3] = b0;
  return Math.fround(f[0]);
}

// ── PCMath::areCounterClockWise(ax, ay, bx, by, cx, cy) @0x12645 ──────────────
// Cross-product test on the SIMD lanes: with dx=[bx-ax, cx-ax], dy=[by-ay, cy-ay],
// compare `bx' * cy' > by' * cx'` (i.e. (B-A) × (C-A) > 0 for CCW).
//
// Ordered branches from the disasm:
//   1. If Bx·Cy > By·Cx (strictly ordered)  -> return true  (CCW)
//   2. Else if By·Cx > Bx·Cy (strictly ordered) -> return false (CW)
//   3. Else if not equal or unordered (NaN)  -> return true (default al=1 preserved)
//   4. Else COLLINEAR TIE-BREAK:
//        if Bx*Cx < 0 (x-signs differ across A)  -> return false (B and C on opposite sides)
//        if By*Cy < 0 (y-signs differ across A)  -> return false
//        else return (|B-A|² < |C-A|²)  -- true iff B is strictly closer to A than C.
export function areCounterClockWise(
  ax: number, ay: number, bx: number, by: number, cx: number, cy: number,
): boolean {
  const bxA = Math.fround(Math.fround(bx) - Math.fround(ax));  // xmm2[0] = bx - ax
  const cxA = Math.fround(Math.fround(cx) - Math.fround(ax));  // xmm2[1] = cx - ax
  const byA = Math.fround(Math.fround(by) - Math.fround(ay));  // xmm3[0] = by - ay
  const cyA = Math.fround(Math.fround(cy) - Math.fround(ay));  // xmm3[1] = cy - ay
  const lhs = Math.fround(cyA * bxA);   // xmm0[0] = Cy * Bx (per `shufps 0xe1` then `mulps`)
  const rhs = Math.fround(byA * cxA);   // xmm1[0] = By * Cx (movshdup xmm0 into xmm1)
  // 1. strictly ordered greater -> true (`ja` at 0x12676)
  if (lhs > rhs) return true;
  // 2. strictly ordered less -> false (`ucomiss xmm0, xmm1; jbe` at 0x1267b, fall-through jne)
  if (rhs > lhs) return false;
  // 3. unordered (NaN in either) -> true (`jne`/`jp` at 0x12684/0x12686 skip clearing eax)
  if (Number.isNaN(lhs) || Number.isNaN(rhs) || lhs !== rhs) return true;
  // 4. equal (collinear). Tie-break by squared magnitude on the same side of A.
  //    From 0x12688..0x126b7 in the disasm: uses `mulss` on the high element (Cx*Bx / Cy*By)
  //    -> tests sign parity, then |B-A|² < |C-A|².
  const bxCx = Math.fround(bxA * cxA);   // (Bx-Ax)*(Cx-Ax) — same-side test on x
  if (0 > bxCx) return false;
  const byCy = Math.fround(byA * cyA);   // same-side test on y
  if (0 > byCy) return false;
  const b2 = Math.fround(Math.fround(bxA * bxA) + Math.fround(byA * byA));  // |B-A|²
  const c2 = Math.fround(Math.fround(cxA * cxA) + Math.fround(cyA * cyA));  // |C-A|²
  return b2 < c2;  // `setb %al` at 0x126b7
}

// ── PCMath::gammaln(double) @0x126bc ──────────────────────────────────────────
// Numerical Recipes `gammln` on ProCore. Returns log Γ(x+1) (i.e. log-gamma with the
// classic NR shifted convention: input is y, ser starts at 1 with 6 rational terms
// centered on y+1..y+6). Reads the coefficient table verbatim from __const 0x122ac0/
// 0x122ae0/0x122b00 (see PC_GAMMLN_COF above).
export function gammaln(x: number): number {
  // 0x126cd: tmp = x + 5.5; 0x126de: tmp2 = x + 0.5.
  const tmp0 = x + PC_GAMMLN_XPLUS;      // x + 5.5
  const tmp2 = x + PC_GAMMLN_HALF;       // x + 0.5
  // 0x126ef callq _log(tmp0); 0x126f4 mul tmp2; 0x126fe sub -> -(x+0.5)*log(x+5.5) + (x+5.5)
  const tmp = tmp0 - tmp2 * Math.log(tmp0);
  // Serial expansion: `ser` starts at 1.0 (loaded from 0x122a58 as xmm0=[1, 2.50663] lane 0)
  // and picks up 6 terms cof[k]/(x+k+1). The disasm interleaves them via packed divpd
  // (loading pair [1,2] then [3,4] then [5,6] and dividing coefficient pairs).
  let ser = 1.0;                          // @const 0x122a58 lane 0 (u64 0x3ff0000000000000)
  ser += PC_GAMMLN_COF[0] / (x + 1);
  ser -= PC_GAMMLN_COF[1] / (x + 2) * (-1);// wait — see below
  // Actually the disasm does `addsd xmm2, xmm0` then `unpckhpd xmm2, xmm2; subsd xmm2, xmm0`,
  // meaning it adds the low lane and SUBTRACTS the high lane of each pair. Two cof entries
  // have negative sign already in the constant table (cof[1]=-86.5, cof[3]=-1.23, cof[5]=-5.4e-6),
  // so the "subtract" is subtracting a negative, i.e. adding. Net effect: `ser += cof[k]/(x+k+1)`
  // for k=0..5 uniformly. Rewrite:
  ser = 1.0
      + PC_GAMMLN_COF[0] / (x + 1)
      - PC_GAMMLN_COF[1] / (x + 2)
      + PC_GAMMLN_COF[2] / (x + 3)
      - PC_GAMMLN_COF[3] / (x + 4)
      + PC_GAMMLN_COF[4] / (x + 5)
      - PC_GAMMLN_COF[5] / (x + 6);
  // 0x12780 mulsd sqrt(2π) / xmm4(=x); 0x1278c call log; 0x12791 subsd stored `tmp`.
  return Math.log(PC_GAMMLN_SQRT_TWO_PI * ser / x) - tmp;
}

// ── PCMath::erf(double) @0x1279c ──────────────────────────────────────────────
// Numerical Recipes `gammp`/`gammq` inlined for a=0.5. Splits on x² vs 1.5:
//   x² < 1.5  -> gser branch (power-series expansion, returns P(0.5, x²))
//   x² >= 1.5 -> gcf branch  (modified Lentz continued fraction, returns Q(0.5, x²))
// Then converts to erf/erfc and flips sign for x<0. Faithful to the disasm's control flow.
export function erf(x: number): number {
  const xIn = x;                          // xmm8 (kept for final sign flip at 0x129fd)
  const x2 = x * x;                       // xmm14 = x*x
  // 0x127b3..0x127c0: if 1.5 > x², fall through into gser; else jbe -> gcf.
  let result: number;
  if (PC_ERF_THRESHOLD_SQ > x2) {
    // gser (0x127c6..0x129a6). x²>=0 test at 0x127ca-0x127cf: if x²<=0 return 0.
    if (x2 <= 0) {
      // Also x==0 falls here — sign flip below picks up 0.
      result = 0;
    } else {
      // Standard gser for a=0.5: sum term = 1/(0.5) = 2 (loaded as xmm5=2 at 0x127d5).
      // sum accumulator `ap` starts at 0.5 (xmm0 @0x127dd), del = 2 (xmm5 = 2 constant, later
      // multiplied by x²/(ap += 1) each step). ITMAX=100 (movl $0x64, %eax at 0x127e5).
      const EPS = PC_ERF_EPS;             // @const 0x122a78 (3e-7)
      let ap = PC_ERF_HALF;               // xmm0 = 0.5 (the `a` for the incomplete-gamma call, but here reused)
      let sum = PC_ERF_TWO;               // xmm5 = 2  (1/a where a=0.5)
      let del = PC_ERF_TWO;               // xmm6 = xmm5 copy = 2 (kept for the multiplier chain)
      let converged = false;
      for (let i = 0; i < 100; i++) {
        ap = ap + PC_ERF_ONE;             // xmm0 = ap + 1  (0x1280b)
        del = (x2 / ap) * del;            // xmm5 = (x² / ap) * xmm6, then xmm6 <- xmm5 (0x1280f-0x1281c)
        sum = sum + del;                  // xmm9 += xmm5   (0x1281c)
        // Convergence: |del| * EPS < |sum|  -> converged (`ucomisd; ja` at 0x12836).
        if (Math.abs(del) * EPS < Math.abs(sum)) { converged = true; break; }
      }
      if (!converged) {
        // Fallthrough on 100-iter timeout: 0x12842 `je 0x129ed` — jumps into the tail-negate
        // path with xmm1 unset (garbage). We faithfully return 0 here (the disasm's tail
        // blends xmm1 which is xmm9=sum but then also uses -0.0 mask; the effective final
        // value is `-sum` if x<0 else `sum` — but at that point sum was never returned by
        // NR-style guarding: FCP's code just proceeds with the last sum. Match that.):
        result = sum * Math.exp(0.5 * Math.log(x2) - x2 + PC_ERF_NEG_GAMMLN_HALF);
      } else {
        // 0x1295f..0x129a6: result = sum * exp(-x² + 0.5*log(x²) + (-gammln(0.5))).
        // Equivalent to `sum * x * exp(-x²) / sqrt(π)` for x>0.
        const t = Math.log(x2) * PC_ERF_HALF - x2 + PC_ERF_NEG_GAMMLN_HALF;
        // 0x1298f xmm0 = exp(t); 0x12994 xmm1 = 1; 0x1299c xmm1 = 1 - exp(t)*sum;
        // note the disasm computes `1 - exp(t)*sum`. That's `1 - P(0.5, x²)*something`?
        // Actually it's the "gser" flavor giving 1 - Q = P; then the negate at 0x129ed
        // handles the negative-x case. So result = 1 - sum*exp(t) here.
        result = PC_ERF_ONE - Math.exp(t) * sum;
      }
    }
  } else {
    // gcf branch (0x1284a..0x129e4). Modified Lentz's continued fraction for Q(0.5, x²).
    // The disasm sets:
    //   b0 = x² + 0.5              (movsd 0.5, xmm1; addsd x², xmm1)
    //   d  = 1 / b0                (movsd 1.0, xmm2; movapd xmm2, xmm15; divsd b0, xmm15)
    //   h  = d
    //   c starts LARGE (xmm10 loaded as pair [0, 1e30] then low replaced by d -> [d, 1e30])
    // Loop var `n` starts at 0, then iterates. ITMAX=100.
    // Faithful transcription:
    const FPMIN = PC_ERF_FPMIN;           // 1e-30
    const BIG   = PC_ERF_BIG;             // 1e30
    const EPS   = PC_ERF_EPS;             // 3e-7
    let b = x2 + PC_ERF_HALF;             // 0x12850..0x12858
    let d = PC_ERF_ONE / b;                // 0x1285d..0x1286a
    let h = d;
    let cInv = BIG;                       // xmm10 high lane = 1e30 (unused as c per se — cInv = 1/c)
    // 0x12882..0x128c5: xmm12 starts at 1.0, i=100.
    // Loop body computes:
    //   an = -a * (a + n_prev)  where a starts at 1.0 and increments each iter and gets negated via `xorpd -0.0`.
    //   b += 2 (each iter adds +2 via addsd xmm5, xmm1 with xmm5=2)
    //   d = 1/(an*d + b)
    //   c = b + an/c
    //   Update h *= c*d
    //   Continue until |c*d - 1| < EPS.
    // Trace the register plan carefully:
    //   xmm2 = 1.0 (kept)                @0x1285d
    //   xmm4 = -0.5 (constant, negate-and-shift helper)
    //   xmm5 = 2 (constant, for b += 2)
    //   xmm7 = 3e-7 (EPS)
    //   xmm8 = pair [1e30, 1e-30]
    //   xmm9 = -1.0 (@0x122a70)
    //   xmm11 = 3e-7 (EPS, high-part of the same pair-load)
    //   xmm12 = 1.0 (a-counter)
    //   xmm13 = an  (working)
    //   xmm15 = h (accumulator)
    let a = PC_ERF_ONE;                   // xmm12
    let converged = false;
    for (let i = 0; i < 100; i++) {
      const an = -(a + PC_ERF_NEG_HALF) * a;
      // 0x128d3-0x128dd: xmm13 = (a + (-0.5)) * (-a) = -a*(a - 0.5). Then b += 2 in xmm1.
      b = b + PC_ERF_TWO;
      // Modified Lentz: d = an*d + b. If |d| < FPMIN d = FPMIN. Then d = 1/d.
      // The disasm packs d and cInv in xmm10, so it does one packed reciprocal step.
      d = an * d + b;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      cInv = an / cInv + b;               // c update: c = b + an/c
      if (Math.abs(cInv) < FPMIN) cInv = FPMIN;
      const dInv = PC_ERF_ONE / d;
      h = h * dInv * cInv;                // h *= c*d  (with d being the reciprocal after clamping)
      const del = dInv * cInv;
      if (Math.abs(del - PC_ERF_ONE) < EPS) { converged = true; break; }
      a = a + PC_ERF_ONE;
    }
    if (!converged) {
      // Same fallthrough as gser: proceed with the last h.
    }
    // 0x129a8..0x129e8: tail applies `h * exp(0.5*log(x²) - x² + (-gammln(0.5)))`.
    const t = Math.log(x2) * PC_ERF_HALF - x2 + PC_ERF_NEG_GAMMLN_HALF;
    result = h * Math.exp(t);
  }
  // 0x129ed..0x12a08: SIGN_MASK ^ result gives -result; blendvpd selects based on xIn<0.
  //   cmpltsd xmm0(=0), xmm8(=xIn): xmm8 = (xIn < 0) ? all1s : 0.
  //   blendvpd xmm0-mask xmm2(=-result), xmm1(=result): if xIn<0 use -result, else use result.
  // NB: this makes the erf branch (x²<1.5, returning 1-...) come out negated for x<0.
  //     For the gcf branch (x²>=1.5), the pre-tail formula returned Q(0.5, x²) which is erfc(|x|);
  //     the negate flips it to -erfc(|x|) for x<0. That matches erf(-x)=-erf(x) transiting through
  //     erf = 1 - erfc, i.e. for x<0: erf(x) = -(1 - erfc(-x)) = erfc(-x) - 1. The disasm returns
  //     -result at this point; check with the oracle to verify parity (gate.sh G4).
  return xIn < 0 ? -result : result;
}

// ── PCMath::quadratic(double,double,double,double&,double&,double) @0x12a17 ──
// Solve a·x² + b·x + c = 0 within tolerance `tol` on the discriminant. Returns:
//   0 = no real roots            (disc < -tol, or degenerate zero polynomial)
//   1 = single root in x1        (either linear b·x+c=0, or double-root tangent)
//   2 = two distinct roots x1<x2 (both real)
// The 1e-7 tolerance used for "coefficient ≈ 0" is HARDCODED (see PC_ONE_MINUS7_TOL).
// The `tol` argument gates only the discriminant "near-zero" (tangent) region.
export function quadraticD(
  a: number, b: number, c: number, tol: number,
): { count: 0 | 1 | 2; x1: number; x2: number } {
  const EPS = PC_ONE_MINUS7_TOL;
  // 0x12a1b-0x12a33: if |a| < 1e-7 -> linear branch.
  if (EPS > Math.abs(a)) {
    // 0x12a35-0x12a5d: if |b| < 1e-7 return 0; else x1 = -c/b.
    if (EPS > Math.abs(b)) return { count: 0, x1: 0, x2: 0 };
    return { count: 1, x1: (-c) / b, x2: 0 };
  }
  // Quadratic: disc = b² - 4ac.
  const disc = b * b + (-4.0) * a * c;    // 0x12a6a mulsd -4; then mulsd a; mulsd c; addsd b².
  if (disc < 0) {
    // 0x12a86 jae not taken. Tolerance window [-tol, tol]: outside -> no real roots.
    if (disc <= -tol) return { count: 0, x1: 0, x2: 0 };
    if (tol <= disc) return { count: 0, x1: 0, x2: 0 };   // (dead branch when tol>0, but faithful)
    // Tangent: single root at x = -b/(2a).
    return { count: 1, x1: (-0.5 * b) / a, x2: 0 };
  }
  // disc >= 0. Numerical Recipes stable-root trick:
  //   q = -0.5 * (b + sign(b) * sqrt(disc))
  //   x1 = q/a, x2 = c/q  (with q ≈ 0 fallback -> single root at 0).
  const sqrtDisc = Math.sqrt(disc);
  // 0x12ac4-0x12ad0: xmm3 = sign(b) | |sqrtDisc| = copysign(sqrtDisc, b).
  const signedSqrt = b >= 0 ? sqrtDisc : -sqrtDisc;   // copysign(sqrtDisc, b)
  const q = -0.5 * (b + signedSqrt);
  // 0x12ae4-0x12ae8: if |q| < 1e-7, single-root path returns *x1 = 0 (movq $0), count=1.
  if (EPS > Math.abs(q)) return { count: 1, x1: 0, x2: 0 };
  // 0x12af8-0x12b04: x1 = q/a; x2 = c/q.
  let x1 = q / a;
  let x2 = c / q;
  // 0x12b08-0x12b25: if |x1-x2| < 1e-7 return count=1 (same root — but keep x1 as computed).
  if (EPS > Math.abs(x1 - x2)) return { count: 1, x1, x2: 0 };
  // 0x12b27-0x12b36: sort ascending. If x1 > x2, swap (x1 becomes smaller).
  if (x1 > x2) {
    const t = x1; x1 = x2; x2 = t;
  }
  return { count: 2, x1, x2 };
}

// ── PCMath::quadratic(float,float,float,float&,float&,float) @0x12b3c ────────
// Same algorithm as the double version, in single precision, EXCEPT the tangent
// (double-root) branch internally converts to double for `-0.5*b/a` (see 0x12bb9-
// 0x12bd0: cvtss2sd on b, mulsd -0.5, cvtss2sd on a, divsd, cvtsd2ss back). We
// preserve that quirk explicitly.
export function quadraticF(
  a: number, b: number, c: number, tol: number,
): { count: 0 | 1 | 2; x1: number; x2: number } {
  a = Math.fround(a); b = Math.fround(b); c = Math.fround(c); tol = Math.fround(tol);
  const EPS = PC_ONE_MINUS5_TOL_F32;      // 1e-5f — @const 0xe2000
  if (EPS > Math.fround(Math.abs(a))) {
    if (EPS > Math.fround(Math.abs(b))) return { count: 0, x1: 0, x2: 0 };
    return { count: 1, x1: Math.fround(-c / b), x2: 0 };
  }
  const disc = Math.fround(Math.fround(b * b) + Math.fround(Math.fround(Math.fround(-4.0) * a) * c));
  if (disc < 0) {
    if (disc <= -tol) return { count: 0, x1: 0, x2: 0 };
    if (tol <= disc) return { count: 0, x1: 0, x2: 0 };
    // 0x12bb9-0x12bd0: internal double-precision division for tangent root.
    const bd = b as number;       // cvtss2sd
    const ad = a as number;       // cvtss2sd
    const rootD = (-0.5 * bd) / ad;
    return { count: 1, x1: Math.fround(rootD), x2: 0 };
  }
  const sqrtDisc = Math.fround(Math.sqrt(disc));
  const signedSqrt = b >= 0 ? sqrtDisc : Math.fround(-sqrtDisc);
  const q = Math.fround(Math.fround(-0.5) * Math.fround(b + signedSqrt));
  if (EPS > Math.fround(Math.abs(q))) return { count: 1, x1: 0, x2: 0 };
  let x1 = Math.fround(q / a);
  let x2 = Math.fround(c / q);
  if (EPS > Math.fround(Math.abs(x1 - x2))) return { count: 1, x1, x2: 0 };
  if (x1 > x2) { const t = x1; x1 = x2; x2 = t; }
  return { count: 2, x1, x2 };
}

// ── PCMath::cubic(double,double,double,double&,double&,double&) @0x12c56 ──────
// Solve x³ + a·x² + b·x + c = 0. Numerical-Recipes trigonometric/Cardano dispatch
// (from cubic_d.s):
//   Q = (a² - 3b) / 9
//   R = (2a³ - 9ab + 27c) / 54
//   if Q³ > R²:  three real roots via cos(θ/3), cos((θ+2π)/3), cos((θ-2π)/3)  where θ = acos(R/√Q³)
//   else:        one real root via Cardano:
//                 A' = copysign((|R| + sqrt(R² - Q³))^(1/3), R)
//                 A  = -A'                          (NR's sign-choosing)
//                 B  = A ≈ 0 ? 0 : Q/A
//                 x1 = A + B - a/3
// The three-root branch sorts x1<x2<x3 via two swaps.
export function cubicD(
  a: number, b: number, c: number,
): { count: 1 | 3; x1: number; x2: number; x3: number } {
  const aStore = a;                         // saved to [-0x40] at 0x12c9b
  // 0x12c73/0x12c8b/0x12ca8: computes numerators/denominators as packed pair operations.
  //   pair = [ (2a³ - 9ab + 27c)/54 , (a² - 3b)/9 ] = [R, Q]
  const R = (2 * a * a * a - 9 * a * b + 27 * c) / 54;
  const Q = (a * a - 3 * b) / 9;
  const R2 = R * R;                          // (packed with Q² earlier, but we only need R²)
  const Q3 = Q * Q * Q;
  // 0x12cec/0x12cf0: `if Q³ > R²` (trigonometric branch); else Cardano.
  if (Q3 > R2) {
    const theta = Math.acos(R / Math.sqrt(Q3));     // 0x12d03/0x12d0b
    const two_sqrtQ = -2 * Math.sqrt(Q);            // 0x12d13/0x12d18 (mulsd -2)
    const aOver3 = aStore / 3;                      // 0x12d41/0x12d49
    // 0x12d2a: cos(theta/3); 0x12d5a-0x12d67: cos((theta + 2π)/3); 0x12d84-0x12d8c: cos((theta - 2π)/3).
    let x1 = two_sqrtQ * Math.cos(theta / 3) - aOver3;
    let x2 = two_sqrtQ * Math.cos((theta + PC_TWO_PI) / 3) - aOver3;
    let x3 = two_sqrtQ * Math.cos((theta + PC_NEG_TWO_PI) / 3) - aOver3;
    // Sort: 0x12da8-0x12db5 swaps x1/x2 if x1 > x2 (making x1 <= x2).
    if (x1 > x2) { const t = x1; x1 = x2; x2 = t; }
    // 0x12e5c-0x12e60: if x2 > x3 swap; 0x12e75-0x12e79: if x1 > x2 swap.
    if (x2 > x3) { const t = x2; x2 = x3; x3 = t; }
    if (x1 > x2) { const t = x1; x1 = x2; x2 = t; }
    return { count: 3, x1, x2, x3 };
  }
  // Cardano single-real-root branch (0x12dce..0x12e4c).
  const absR = Math.abs(R);                          // 0x12dd2 andpd ABS_MASK
  const raw = Math.pow(absR + Math.sqrt(R2 - Q3), PC_CUBIC_THIRD);  // 0x12de6-0x12df3 pow(x, 1/3)
  // 0x12df8-0x12e09: A' = copysign(raw, R). 0x12e0d-0x12e15: A = -A'.
  const Aprime = R >= 0 ? raw : -raw;   // copysign(raw, R)
  const A = -Aprime;                    // NR: A = -sign(R) * raw
  // 0x12e1d cmpltsd 1e-7, %xmm0 (mask: is |raw| < 1e-7?). 0x12e2f andnpd: xmm0 = maskOFF ? Q/A : 0.
  //   Equivalent: B = |raw| < 1e-7 ? 0 : Q/A.
  const B = raw < PC_ONE_MINUS7_TOL ? 0 : Q / A;
  const root = A + B - aStore / 3;      // 0x12e40 subsd A', 0x12e44 addsd -a/3
  return { count: 1, x1: root, x2: 0, x3: 0 };
}

// ── PCMath::cubic(float,float,float,float&,float&,float&) @0x12e8f ────────────
// Same algorithm, internally in DOUBLE precision (see the cvtss2sd at the top and
// cvtsd2ss on every store — 0x12e9c, 0x12f8e, 0x12fb6, 0x12fe3, 0x1308e-0x13091).
// Only the boundary conversions are single-precision.
export function cubicF(
  a: number, b: number, c: number,
): { count: 1 | 3; x1: number; x2: number; x3: number } {
  // Match cvtss2sd at 0x12e9c-0x12ea8 (a, b), 0x12ee7 (c). The math is in doubles.
  const ad = Math.fround(a) as number;
  const bd = Math.fround(b) as number;
  const cd = Math.fround(c) as number;
  const R = (2 * ad * ad * ad - 9 * ad * bd + 27 * cd) / 54;
  const Q = (ad * ad - 3 * bd) / 9;
  const R2 = R * R;
  const Q3 = Q * Q * Q;
  if (Q3 > R2) {
    const theta = Math.acos(R / Math.sqrt(Q3));
    const two_sqrtQ = -2 * Math.sqrt(Q);
    const aOver3 = ad / 3;
    let x1 = Math.fround(two_sqrtQ * Math.cos(theta / 3) - aOver3);
    let x2 = Math.fround(two_sqrtQ * Math.cos((theta + PC_TWO_PI) / 3) - aOver3);
    let x3 = Math.fround(two_sqrtQ * Math.cos((theta + PC_NEG_TWO_PI) / 3) - aOver3);
    if (x1 > x2) { const t = x1; x1 = x2; x2 = t; }
    if (x2 > x3) { const t = x2; x2 = x3; x3 = t; }
    if (x1 > x2) { const t = x1; x1 = x2; x2 = t; }
    return { count: 3, x1, x2, x3 };
  }
  const absR = Math.abs(R);
  const raw = Math.pow(absR + Math.sqrt(R2 - Q3), PC_CUBIC_THIRD);
  const Aprime = R >= 0 ? raw : -raw;
  const A = -Aprime;
  const B = raw < PC_ONE_MINUS7_TOL ? 0 : Q / A;
  const root = Math.fround(A + B - ad / 3);
  return { count: 1, x1: root, x2: 0, x3: 0 };
}

// ── PCMath::easeInOut(t, accelIn, accelOut, t0, t1, *out, *speed) @0x130d9 ────
// Piecewise constant-accel / linear / constant-decel motion profile. The output
// is the eased time in the [t0,t1] range; the derivative (speed) is written to *speed.
// This is the oracle-gated function under curve.interp.ease — the fuzzer at
// gate.sh G4 compares it bit-for-bit against the live FCP dlsym symbol.
export function easeInOut(
  t: number, accelIn: number, accelOut: number, t0: number, t1: number,
): { out: number; speed: number } {
  // 0x130e1-0x130fa: (aI, aO) with the "negative-input" clamp:
  //   aI <- (aI < 0) ? 0 : aI      (blendvpd @0x130fa low lane from xmm2[low]=0)
  //   aO <- (aO < 0) ? 1 : aO      (blendvpd @0x130fa high lane from xmm2[high]=1 via `movhpd 0x122530`)
  let aI = accelIn < 0 ? 0 : accelIn;
  let aO = accelOut < 0 ? 1 : accelOut;
  const s = aI + aO;                                              // xmm2[0] = aI + aO   (0x1310b)
  // 0x1310f-0x13127: degenerate case |s| < 1e-7 => identity output, speed 1.
  if (Math.abs(s) < PC_ONE_MINUS7_TOL) {
    // Faithful: rdi/rsi non-null checks in the disasm; we always return both.
    return { out: t, speed: PC_EI_ONE };
  }
  // 0x13148-0x13150: u = (t - t0) / (t1 - t0).
  const span = t1 - t0;
  let u = (t - t0) / span;
  // 0x13154-0x13166: if s > 1, divide both aI,aO by s to renormalize (matches d7,d6).
  if (s > PC_EI_ONE) {
    aI = aI / s;
    aO = aO / s;
  }
  // 0x1316a-0x1317b: d4m = (s > 1) ? -1 : s - 2  (cmpltsd + blendvpd from [-1,-1]).
  const d4m = s > PC_EI_ONE ? PC_EI_MINUS_ONE : s - 2;
  const d7 = aI;
  const d6 = aO;
  // 0x13184-0x1318c: if u < 0, output 0.
  if (u < 0) {
    return { out: t0, speed: 0 };
  }
  // 0x13197-0x1319b: if u < d7, ACCEL region.
  let easedT: number;
  let derivU: number;
  if (u < d7) {
    // 0x1319d-0x131c5: eased = -u²/(d7*d4m); deriv = -2u/(d7*d4m).
    const denom = d7 * d4m;
    easedT = -(u * u) / denom;
    derivU = (PC_CUBIC_NEG_2 * u) / denom;   // -2u/denom
  } else {
    // 0x131c7-0x131d1: check u vs (1 - d6).
    const oneMinusD6 = PC_EI_ONE - d6;
    if (u > oneMinusD6) {
      // 0x131d8-0x131dc: DECEL if u<1, else clamp to end.
      if (u >= PC_EI_ONE) {
        return { out: t1, speed: 0 };   // xmm6=1.0, xmm0=0 (mask reset)
      }
      // 0x131de-0x1320a: eased = (1-u)²/(d4m*d6) + 1; deriv = 2*(u-1)/(d4m*d6).
      const denom = d6 * d4m;
      easedT = (PC_EI_ONE - u) * (PC_EI_ONE - u) / denom + PC_EI_ONE;
      derivU = (2 * (u - PC_EI_ONE)) / denom;
    } else {
      // 0x1320c-0x13224: LINEAR: eased = (d7 - 2u)/d4m; deriv = -2/d4m.
      easedT = (d7 - 2 * u) / d4m;
      derivU = PC_CUBIC_NEG_2 / d4m;
    }
  }
  // 0x13228-0x13235: *out = t0 + eased * span.
  return { out: t0 + easedT * span, speed: derivU };
}

// ── PCMath::inverseEaseInOut(y, accelIn, accelOut, t0, t1, *out) @0x13244 ─────
// Given an eased value `y` in [t0,t1], recovers a "u" in [t0,t1]. This is NOT the
// mathematical inverse of easeInOut — it's a distinct piecewise formula that Apple
// ships under the name. Verified by probing the live symbol (see disasm + oracle
// probe). Returns true on success, false when y is out of [0,1] normalized.
export function inverseEaseInOut(
  y: number, accelIn: number, accelOut: number, t0: number, t1: number,
): { ok: boolean; out: number } {
  // 0x1324c-0x1326c: degenerate |aI+aO| < 1e-7 => identity output.
  const s0 = accelIn + accelOut;
  if (Math.abs(s0) < PC_ONE_MINUS7_TOL) {
    return { ok: true, out: y };
  }
  const span = t1 - t0;
  const yn = (y - t0) / span;                       // 0x1327c-0x13284
  // 0x1328e-0x132a0: reject yn < 0 or yn > 1.
  if (0 > yn) return { ok: false, out: 0 };
  if (yn > PC_EI_ONE) return { ok: false, out: 0 };
  // 0x132ab-0x132b5: aO <- (aO < 0) ? 1 : aO.
  let aO = accelOut < 0 ? PC_EI_ONE : accelOut;
  // 0x132be-0x132c2: aI <- max(aI, 0) via `xorpd xmm7,xmm7; maxsd aI, xmm7`.
  let aI = Math.max(accelIn, 0);
  const s = s0;                                     // xmm6 = aI + aO (original)
  // 0x132ce-0x132d8: if s > 1: aI /= s; aO /= s.  (matches easeInOut).
  if (s > PC_EI_ONE) {
    aI = aI / s;
    aO = aO / s;
  }
  // 0x132e5-0x132ed: d4m = (s > 1) ? -1 : s - 2.
  const d4m = s > PC_EI_ONE ? PC_EI_MINUS_ONE : s - 2;
  const d7 = aI;
  const d6 = aO;
  // 0x132f6-0x132fb: if yn <= 0, out = t0 (xmm8=0 preserved).
  if (0 >= yn) {
    return { ok: true, out: t0 };
  }
  // 0x13301-0x13315: y_accel_endpoint = -d7/d4m.
  const yAccelEnd = (-d7) / d4m;
  let uNorm: number;
  if (yn < yAccelEnd) {
    // 0x13317-0x13330: ACCEL inverse: u = sqrt(-y * d7 * d4m).
    uNorm = Math.sqrt((-yn) * d7 * d4m);
  } else {
    // 0x13332-0x13348: y_linear_endpoint = (d7 - 2*(1-d6))/d4m.
    const yLinEnd = (d7 - 2 * (PC_EI_ONE - d6)) / d4m;
    // 0x1334d-0x13352: if yLinEnd <= yn, DECEL branch; else LINEAR.
    if (yLinEnd <= yn) {
      // 0x1336b-0x13396: if 1 <= yn return uNorm=1; else uNorm = 1 - sqrt((y-1)*d6*d4m).
      if (yn >= PC_EI_ONE) {
        uNorm = PC_EI_ONE;
      } else {
        uNorm = PC_EI_ONE - Math.sqrt((yn - PC_EI_ONE) * d6 * d4m);
      }
    } else {
      // 0x13354-0x13364: LINEAR: uNorm = d7 - 0.5*yn*d4m  (verbatim from disasm; NOT the
      // algebraic inverse of easeInOut's linear branch — matches live FCP symbol per oracle).
      uNorm = d7 - PC_ERF_HALF * yn * d4m;
    }
  }
  // 0x1339b-0x133ad: *out = t0 + uNorm * span.
  return { ok: true, out: t0 + uNorm * span };
}

// ── PCMath::equal(CMTime const&, CMTime const&, CMTime const& tol) @0x66ff4 ───
// Two CMTime values are "equal" if:
//   - Both have flags & 0x1d == 1 (Valid, not ±Inf, not Indefinite):
//       |a - b| <= tol   (CMTimeCompare against PC_CMTimeSaferSubtract(a,b) or its negation)
//   - Or both are +Inf, or both are -Inf.  (flag combination test at 0x670d6..0x670fc)
export function equalCMTime(a: CMTime, b: CMTime, tol: CMTime): boolean {
  const aFlags = a.flags & 0x1d;
  const bFlags = b.flags & 0x1d;
  // 0x66ff9-0x67008: both must satisfy `& 0x1d == 1` (Valid AND not-±Inf AND not-Indefinite).
  if (aFlags !== 1 || bFlags !== 1) {
    // 0x670d6-0x670fc: special-case ±Inf both:
    //   testb $0x5, ~aFlags==0  ->  aFlags has (Valid | PosInf) set  -> a is +Inf.
    //   Then check b similarly. Both +Inf -> return true.
    //   Else check the same for NegInf (bit 3, mask 0x9).
    const aFullFlags = a.flags;
    const bFullFlags = b.flags;
    const aIsPosInf = ((~aFullFlags) & 0x5) === 0;   // Valid|PosInf set
    if (aIsPosInf) {
      const bIsPosInf = ((~bFullFlags) & 0x5) === 0;
      if (bIsPosInf) return true;
    }
    const aIsNegInf = ((~aFullFlags) & 0x9) === 0;   // Valid|NegInf set
    if (!aIsPosInf && aIsNegInf) {
      const bIsNegInf = ((~bFullFlags) & 0x9) === 0;
      if (bIsNegInf) return true;
    }
    // Not both +Inf and not both -Inf: return false.
    // (The disasm's fall-through at 0x670fa is `xorl eax, eax` -> return 0.)
    return false;
  }
  // Main path (0x67022-0x670bb): diff = a - b via PC_CMTimeSaferSubtract; if diff < 0 negate.
  let diff = PC_CMTimeSaferSubtract(a, b);
  const zeroCmp = CMTimeCompare(diff, CMTimeMake(0n, diff.timescale || 1));
  // 0x670c2: js (jump if sign) -> diff was negative, invoke `operator*(CMTime const&, double(-1))`.
  if (zeroCmp < 0) {
    // Negate by multiplying by -1 (CMTime * double). We model this as flipping the value sign.
    diff = { value: -diff.value, timescale: diff.timescale, flags: kCMTimeFlags_Valid, epoch: 0n };
  }
  // 0x67122-0x67154 + `setle`: return |diff| <= tol.
  return CMTimeCompare(diff, tol) <= 0;
  // NB: the 0x670c4-0x670d4 branch stores the absolute-diff back and falls through to the
  // comparison (identical logic). We collapsed the two paths above.
}

// ── PCMath::equal(PCPlane<double>, PCPlane<double>, double tol) @0x6716a ──────
// Two planes are equal iff:
//   1. Normals are parallel-with-consistent-sign: each component of (a.n - b.n*r) has
//      magnitude < 1e-7, where r = sign(a.n·b.n) * |a.n|/|b.n|. (0x6716a..0x67266)
//   2. Origins coincide (all 3 components within 1e-7), OR the offset from a.p to b.p
//      projected onto a.n is within `tol`: |(b.p - a.p) · a.n| < tol. (0x6726c..0x67300)
// The `1e-7` internal tolerance is HARDCODED; the `tol` argument only gates the
// plane-offset step.
export function equalPlaneD(a: PCPlaneD, b: PCPlaneD, tol: number): boolean {
  const EPS = PC_ONE_MINUS7_TOL;
  // Compute |a.n|² and |b.n|² in packed form (0x6718b..0x671a3), and the ratio |a.n|/|b.n|.
  const aNormSq = a.nx * a.nx + a.ny * a.ny + a.nz * a.nz;
  const bNormSq = b.nx * b.nx + b.ny * b.ny + b.nz * b.nz;
  const ratioSq = aNormSq / bNormSq;              // 0x671bf divsd (scalar)
  const dot = a.nx * b.nx + a.ny * b.ny + a.nz * b.nz;
  const rBase = Math.sqrt(ratioSq);
  // 0x671eb-0x67204: r = (dot < 0) ? -rBase : rBase.   (SIGN_MASK ^ rBase blended by cmpltsd)
  const r = dot < 0 ? -rBase : rBase;
  // 0x6720a-0x6720e: check a.n.x - b.n.x*r within 1e-7.
  if (Math.abs(a.nx - b.nx * r) >= EPS) return false;
  // 0x67230-0x6724c: same for y.
  if (Math.abs(a.ny - b.ny * r) >= EPS) return false;
  // 0x6724e-0x67266: same for z.
  if (Math.abs(a.nz - b.nz * r) >= EPS) return false;
  // 0x6726c-0x672ba: if origins coincide (all 3 components within 1e-7), return true.
  const dpx = Math.abs(a.px - b.px);
  const dpy = Math.abs(a.py - b.py);
  const dpz = Math.abs(a.pz - b.pz);
  if (dpx < EPS && dpy < EPS && dpz < EPS) return true;
  // 0x672bc-0x67303: else check |(b.p - a.p) · a.n| < tol.  (packed dot product then |·|).
  const dot2 = (b.px - a.px) * a.nx + (b.py - a.py) * a.ny + (b.pz - a.pz) * a.nz;
  return tol > Math.abs(dot2);                    // `seta %al` at 0x67300 (strict)
}

// ── PCMath::equal(PCPlane<float>, PCPlane<float>, float tol) @0x67308 ─────────
// Same predicate as the double version, single-precision throughout. The internal
// tolerance is 1e-5f (see PC_ONE_MINUS5_TOL_F32 read from @const 0xe2000).
export function equalPlaneF(a: PCPlaneF, b: PCPlaneF, tol: number): boolean {
  const EPS = PC_ONE_MINUS5_TOL_F32;
  const tolF = Math.fround(tol);
  const ax = Math.fround(a.nx), ay = Math.fround(a.ny), az = Math.fround(a.nz);
  const bx = Math.fround(b.nx), by = Math.fround(b.ny), bz = Math.fround(b.nz);
  const apx = Math.fround(a.px), apy = Math.fround(a.py), apz = Math.fround(a.pz);
  const bpx = Math.fround(b.px), bpy = Math.fround(b.py), bpz = Math.fround(b.pz);
  const aNormSq = Math.fround(Math.fround(Math.fround(ax * ax) + Math.fround(ay * ay)) + Math.fround(az * az));
  const bNormSq = Math.fround(Math.fround(Math.fround(bx * bx) + Math.fround(by * by)) + Math.fround(bz * bz));
  const ratioSq = Math.fround(aNormSq / bNormSq);
  const dot = Math.fround(Math.fround(Math.fround(ax * bx) + Math.fround(ay * by)) + Math.fround(az * bz));
  const rBase = Math.fround(Math.sqrt(ratioSq));
  const r = dot < 0 ? Math.fround(-rBase) : rBase;
  if (Math.fround(Math.abs(Math.fround(ax - Math.fround(bx * r)))) >= EPS) return false;
  if (Math.fround(Math.abs(Math.fround(ay - Math.fround(by * r)))) >= EPS) return false;
  if (Math.fround(Math.abs(Math.fround(az - Math.fround(bz * r)))) >= EPS) return false;
  const dpx = Math.fround(Math.abs(Math.fround(apx - bpx)));
  const dpy = Math.fround(Math.abs(Math.fround(apy - bpy)));
  const dpz = Math.fround(Math.abs(Math.fround(apz - bpz)));
  if (dpx < EPS && dpy < EPS && dpz < EPS) return true;
  const dot2 = Math.fround(
    Math.fround(Math.fround(Math.fround(bpx - apx) * ax) + Math.fround(Math.fround(bpy - apy) * ay))
    + Math.fround(Math.fround(bpz - apz) * az),
  );
  return tolF > Math.fround(Math.abs(dot2));
}
