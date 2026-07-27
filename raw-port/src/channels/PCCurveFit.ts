// PCCurveFit.ts — ProCore's PCCurveFit singleton: Bezier curve fitting from PCVector2 point sets.
//
// This is a faithful transcription of the FCP class PCCurveFit whose 23 methods live in the ProCore
// framework at __TEXT __text 0xb3c0..0xc76d (see raw-port/re/disasm/ProCore.PCCurveFit.*.s).
// Every method below cites its @0xADDR. Undecoded methods throw a "not yet transcribed" stub that
// cites the address (a loud gap is correct per raw-port/army/PORTING_SPEC.md Rule 3).
//
// PCVector2<double> struct layout (recovered from every asm site that touches d[i] — e.g. b58b:
// `movupd (%rax,%rcx), %xmm1` with %rcx = i << 4, and b58f `movupd 0x10(%rax,%rcx), %xmm0` for
// d[i+1]. sizeof(PCVector2<double>) = 16 bytes, packed:
//   +0x00  x : double
//   +0x08  y : double
//
// ALL of the pure-math helpers use packed-double SSE2/SSSE3/SSE4 instructions on the two
// (x, y) lanes, which map exactly to a JS {x,y} pair. Every constant cited below was resolved by
// walking the RIP-relative operand: `next-instruction + disp` and then reading the 8-byte double
// at the target VA in the ProCore x86_64 slice. See raw-port/army/tools/resolve.py.
//
// The abs-value mask constant used by all three normalize-with-epsilon sites (ComputeLeftTangent,
// ComputeRightTangent, ComputeCenterTangent, plus the inlined tangent-compute inside FitCurve3-arg)
// is a 128-bit constant at 0x122670 = { 0x7fffffffffffffff, 0x7fffffffffffffff } — a packed
// abs-value mask. The epsilon compared against |len| is `1.0000000116860974e-07` (u64
// 0x3e7ad7f2a0000000) at 0x122860. These are read from ProCore's shared __TEXT __const pool.
//
// PCCurveFit is a PCSingleton subclass: its ctor stores its vtable and delegates to
// PCSingleton::PCSingleton(uint) with 0 (see @0xb3e2). It exposes a global getInstance() that
// returns the once-initialised _instance pointer (see @0xb434).

// ── constants read from ProCore __TEXT __const (all VAs are inside the x86_64 slice) ──
// @const 0x122528  double=0.0  u64=0x0                       — zero (used implicitly by xorpd)
// @const 0x122530  double=1.0  u64=0x3ff0000000000000        — literal 1.0 (B0/B1/B2, Bezier)
// @const 0x122628  double=3.0  u64=0x4008000000000000        — literal 3.0 (B1/B2 basis coeff)
// @const 0x122680  packed lo=0.5 hi=0.5                      — center-tangent 0.5 multiplier
// @const 0x122850  packed lo=3.0 hi=3.0                      — deriv-CP factor in NR root-find
// @const 0x122860  double=1.0000000116860974e-07             — normalize-epsilon (0-length gate)
// @const 0x122670  packed abs-value mask (0x7fffffffffffffff)— |x| via andpd
const K_ONE          = 1.0;    // @const 0x122530
const K_THREE        = 3.0;    // @const 0x122628 (also 0x122850 packed)
const K_HALF         = 0.5;    // @const 0x122680 packed
const K_ZERO_EPSILON = 1.0000000116860974e-07; // @const 0x122860

// ── PCVector2<double> — 16-byte {x,y} ──
// Every FCP asm site accesses d[i].x at +0x00 and d[i].y at +0x08; i-indexing multiplies by 16.
export interface PCVec2 {
  x: number; // +0x00
  y: number; // +0x08
}

function v2(x: number, y: number): PCVec2 { return { x, y }; }
function v2sub(a: PCVec2, b: PCVec2): PCVec2 { return { x: a.x - b.x, y: a.y - b.y }; }
function v2add(a: PCVec2, b: PCVec2): PCVec2 { return { x: a.x + b.x, y: a.y + b.y }; }
function v2scale(a: PCVec2, s: number): PCVec2 { return { x: a.x * s, y: a.y * s }; }
function v2dot(a: PCVec2, b: PCVec2): number { return a.x * b.x + a.y * b.y; }
function v2lenSq(a: PCVec2): number { return a.x * a.x + a.y * a.y; }
function v2len(a: PCVec2): number { return Math.sqrt(v2lenSq(a)); }

// Normalize-with-epsilon mirroring the packed pattern
//   sqrtsd → len; andpd absmask → |len|; ucomisd ε > |len| ? (skip) : divpd
// i.e. if |len| >= 1e-7, divide the vector by len; otherwise leave it as (dx, dy) (a raw diff).
// This is a straight translation of the three tangent helpers.
function normalizeWithEps(v: PCVec2): PCVec2 {
  const L = Math.sqrt(v.x * v.x + v.y * v.y);
  // `andpd absmask, xmm2 = |L|`; `ucomisd ε > |L| ? ja skip : divpd`
  if (Math.abs(L) < K_ZERO_EPSILON) return v; // ε > |L| → skip the divide (asm: ja over divpd)
  return { x: v.x / L, y: v.y / L };
}

// ─────────────────────────────────────────────────────────────────────────────
// PCCurveFit — the singleton class
// ─────────────────────────────────────────────────────────────────────────────
export class PCCurveFit {
  // @0xb3c0  PCCurveFit::PCCurveFit()  (both C1/C2 tails are identical; both delegate to
  //          PCSingleton::PCSingleton(unsigned int) with the arg 0 [xorl esi, esi at b3eb]).
  //          Then stores its vtable ptr (leaq 0x13d847(%rip) at b3f2 → the __ZTV10PCCurveFit
  //          + 0x10 installed-ptr) into this. In TS we have no vtable; a plain new suffices.
  private constructor() { /* @0xb3c0/@0xb3e2 — PCSingleton chain has no observable side effect here */ }

  // @0xb434  PCCurveFit::getInstance() — dispatch-once wrapper. The .cold.1 branch initialises
  //          the singleton on first call; the fast path (once == -1) returns _instance directly.
  //          In JS we build the singleton lazily on first access and cache it forever.
  private static _instance: PCCurveFit | null = null;
  static getInstance(): PCCurveFit {
    if (PCCurveFit._instance === null) PCCurveFit._instance = new PCCurveFit();
    return PCCurveFit._instance;
  }

  // ── Bernstein cubic basis (recovered from B0/B1/B2/B3) ─────────────────────
  // @0xc4d8 PCCurveFit::B0(u) = (1 - u)^3
  //   movsd 1.0, xmm1;  subsd u, xmm1;  xmm0 = xmm1;  xmm0 *= xmm1;  xmm0 *= xmm1
  B0(u: number): number { const t = K_ONE - u; return t * t * t; }

  // @0xc490 PCCurveFit::B1(u) = 3 * u * (1 - u)^2
  //   xmm1 = 1.0 - u;  xmm0 *= 3.0;  xmm1 *= xmm1;  xmm0 *= xmm1  → 3u * (1-u)^2
  B1(u: number): number { const t = K_ONE - u; return u * K_THREE * (t * t); }

  // @0xc4b2 PCCurveFit::B2(u) = 3 * u^2 * (1 - u)
  //   xmm1 = 1.0 - u;  xmm2 = 3.0 * u;  xmm0 *= xmm2 → 3u*u = 3u²;  xmm0 *= xmm1 → 3u²(1-u)
  B2(u: number): number { const t = K_ONE - u; const three_u = K_THREE * u; return u * three_u * t; }

  // @0xc4f6 PCCurveFit::B3(u) = u^3
  //   xmm1 = xmm0;  xmm1 *= xmm0;  xmm0 *= xmm1  → u * u * u
  B3(u: number): number { return u * u * u; }

  // @0xc766 PCCurveFit::Bezier(degree, V, t) — de Casteljau. Copies control-points V into a working
  //         buffer Vtmp (via std::vector::__init_with_size at c7a7); then for i=1..degree, for j=0..degree-i:
  //           Vtmp[j] = (1-t)*Vtmp[j] + t*Vtmp[j+1]
  //         Constants: 0x122530 = 1.0 (loaded once as (1-t) source).
  //         The SIMD loop uses movddup to broadcast (1-t) and t, mulpd/addpd on packed (x,y).
  //         Returns Vtmp[0] (loaded via `movups (%rdi), %xmm0` at c820 then stored to (%rbx)).
  Bezier(degree: number, V: PCVec2[], t: number): PCVec2 {
    // __init_with_size(V.begin, V.end, count) — copy the entire input vector.
    // We only ever call with degree in {3,2,1}; Vtmp length is V.length (== degree+1 in practice).
    const Vtmp: PCVec2[] = V.map((p) => ({ x: p.x, y: p.y }));
    // testl %r14d, %r14d ; jle end → if (degree <= 0) skip the loop (return V[0]).
    if (degree > 0) {
      const one_minus_t = K_ONE - t; // movsd 0x115d74(%rip), xmm0 → 1.0; subsd t, xmm0
      // Outer counter starts at 1, ends when it equals r14 (degree). Inner iterates over
      // (degree - i) pairs. rdx bounds the inner loop as `(max(deg-i-1,0) << 4) + 0x10`.
      // Equivalent explicit form:
      for (let i = 1; i <= degree; i++) {
        const inner = degree - i; // number of pairs written this pass
        for (let j = 0; j <= inner; j++) {
          const a = Vtmp[j];
          const b = Vtmp[j + 1];
          Vtmp[j] = {
            x: one_minus_t * a.x + t * b.x,
            y: one_minus_t * a.y + t * b.y,
          };
        }
      }
    }
    // Return Vtmp[0]. (The asm then callq __ZdlPv on the heap allocation; JS GC handles that.)
    return { x: Vtmp[0].x, y: Vtmp[0].y };
  }

  // @0xb580 PCCurveFit::ComputeLeftTangent(d, end) — normalize(d[end+1] - d[end]).
  //   xmm1 = d[end]; xmm0 = d[end+1];  xmm0 -= xmm1;
  //   len² via mulpd+haddpd; sqrtsd → len; normalize-with-epsilon.
  //   Stores the (possibly non-unit) result into (%rax = this[hidden ret ptr]).
  ComputeLeftTangent(d: PCVec2[], end: number): PCVec2 {
    // shlq $0x4, %rcx  → indexing at (base + end*16), then reads +0 (d[end]) and +0x10 (d[end+1]).
    const diff = v2sub(d[end + 1], d[end]);
    return normalizeWithEps(diff);
  }

  // @0xb5d6 PCCurveFit::ComputeRightTangent(d, end) — normalize(d[end-1] - d[end]).
  //   xmm0 = d[end-1] (via -0x10(rax,rcx)); xmm1 = d[end]; xmm0 -= xmm1; then normalize as above.
  ComputeRightTangent(d: PCVec2[], end: number): PCVec2 {
    const diff = v2sub(d[end - 1], d[end]);
    return normalizeWithEps(diff);
  }

  // @0xc424 PCCurveFit::ComputeCenterTangent(d, center) — normalize((d[center-1] - d[center+1]) * 0.5).
  //   xmm1 = d[center-1] - d[center];
  //   xmm0 = d[center]   - d[center+1];
  //   xmm0 += xmm1  →  d[center-1] - d[center+1];
  //   xmm0 *= (0.5,0.5)   (mulpd 0x11622c(%rip) → 0x122680 = packed 0.5);
  //   then the same normalize-with-epsilon pattern.
  ComputeCenterTangent(d: PCVec2[], center: number): PCVec2 {
    const a = v2sub(d[center - 1], d[center]);
    const b = v2sub(d[center],     d[center + 1]);
    const sum = v2add(a, b);
    const half = { x: sum.x * K_HALF, y: sum.y * K_HALF };
    return normalizeWithEps(half);
  }

  // @0xbb42 PCCurveFit::ChordLengthParameterize(d, first, last) -> double[N+1]  where N = last-first
  //   Allocates (N+1) doubles via `operator new[]`. u[0] = 0.0.
  //   for (i = first+1; i <= last; i++):
  //     u[i-first] = u[i-first-1] + |d[i] - d[i-1]|
  //   Second pass: for (i = first+1; i <= last; i++): u[i-first] /= u[last-first]
  //   Returns the pointer (caller owns; delete[]-freed later by FitCubic).
  ChordLengthParameterize(d: PCVec2[], first: number, last: number): number[] {
    const N = last - first;
    // leaq 0x8(,%r12,8), %rax  → allocation size = 8 * (N+1) bytes.
    const u: number[] = new Array<number>(N + 1);
    u[0] = 0.0;
    // Skip if last < first+1 (empty accumulate). Asm: `leaq 0x1(%r14),%rcx; cmpq %rbx,%rcx; ja end`.
    if (first + 1 <= last) {
      for (let i = first + 1; i <= last; i++) {
        // xmm2 = d[i] - d[i-1] (packed); mulpd+haddpd → |diff|²; sqrtsd → |diff|; addsd previous.
        const diff = v2sub(d[i], d[i - 1]);
        u[i - first] = u[i - first - 1] + Math.sqrt(diff.x * diff.x + diff.y * diff.y);
      }
      // Normalize by total length u[N]. Asm second loop starts at u[1], divides each by u[N].
      const total = u[N];
      for (let i = first + 1; i <= last; i++) {
        u[i - first] = u[i - first] / total;
      }
    }
    return u;
  }

  // @0xc2be PCCurveFit::ComputeMaxError(d, bezCurve, first, last, u, &splitPt) -> double
  //   Initialises *splitPt = (last - first + 1) >> 1  (the midpoint) and maxDist = 0.0.
  //   for (i = first+1; i < last; i++):
  //     P = Bezier(3, bezCurve, u[i-first])   ← the u[] index is (i - first) since u aligns to first.
  //     dist² = |P - d[i]|²
  //     if (dist² >= maxDist) { *splitPt = i; maxDist = dist²; }
  //   Returns maxDist (the SQUARED max error — no sqrt in the asm!).
  //
  //   Note: the asm indexing shows `leaq 0x1(%r15),%r12` (i = first + 1) and `cmpq %r8,%r12` (< last),
  //   `movsd (%rbx),%xmm0` with rbx = &u[i-first] pre-incremented, and the Bezier call gets that u.
  ComputeMaxError(
    d: PCVec2[],
    bezCurve: PCVec2[],
    first: number,
    last: number,
    u: number[],
    splitPtOut: { value: number },
  ): number {
    // movq %r8, %rax; subq %r15, %rax; incq %rax; shrq %rax  → *splitPt = (last - first + 1) / 2
    // (unsigned). rcx here = &splitPt (arg 6, on the stack as `0x10(%rbp)`). Note the subsequent
    // update at @0xc34e writes %r12 (= i, the ABSOLUTE loop index starting at first+1). So the
    // FCP asm actually writes two different "kinds" of value into the same field — an offset in
    // the init, then an absolute index in the loop. Faithful transcription writes exactly that.
    splitPtOut.value = (last - first + 1) >>> 1;
    let maxDistSq = 0.0; // xorpd %xmm0; movsd %xmm0, -0x30(%rbp)
    // Loop: for i = first + 1; i < last; i++
    for (let i = first + 1; i < last; i++) {
      // rbx = &u[i-first] (pre-incremented by 8 at c304), then movsd (rbx), xmm0.
      // (Bezier expects a std::vector<PCVec2>&; we pass bezCurve directly.)
      const P = this.Bezier(3, bezCurve, u[i - first]);
      // xmm0 = P; xmm1 = d[i]; xmm0 -= xmm1; mulpd+haddpd → |diff|².
      const diff = v2sub(P, d[i]);
      const distSq = diff.x * diff.x + diff.y * diff.y;
      // ucomisd distSq, maxDistSq ; jb skip  → "if maxDistSq is unordered-less-than distSq, take".
      // Equivalently: if (distSq >= maxDistSq) { splitPt = i; maxDistSq = distSq; }
      if (distSq >= maxDistSq) {
        splitPtOut.value = i;
        maxDistSq = distSq;
      }
    }
    return maxDistSq;
  }

  // @0xc508 PCCurveFit::NewtonRaphsonRootFind(Q, P, u) -> double
  //   One iteration of Newton-Raphson refining the parameter u so that Bezier(u) is closest to P.
  //   Builds Q1[3] = 3 * (Q[i+1] - Q[i])  (derivative control points, degree 2 curve)
  //          Q2[2] = 2 * (Q1[i+1] - Q1[i]) (second-derivative control points, degree 1 curve)
  //   Evaluates:
  //     Q_u   = Bezier(3, Q,  u)
  //     Q1_u  = Bezier(2, Q1, u)
  //     Q2_u  = Bezier(1, Q2, u)
  //   Newton step:
  //     numerator   = (Q_u - P) · Q1_u
  //     denominator = (Q_u - P) · Q2_u + |Q1_u|²
  //     return u - numerator / denominator
  //
  //   The asm uses two std::vector<PCVector2> temporaries built with __emplace_back_slow_path;
  //   we allocate plain arrays. The three-element/two-element sizing comes from the
  //   `cmpq $0x30, %r13` (@c5bf → 48/16 = 3 elements) and `movl $0x1, %r13d` init (@c626).
  //
  //   Newton step arithmetic (@c6b6..c71c) — packed-lane detail:
  //     xmm2 = Q_u  - P          (packed .x/.y)
  //     xmm3 = Q1_u              (packed .x/.y)
  //     xmm1 = Q1_u * Q1_u ; haddpd → xmm1_lo = |Q1_u|²
  //     xmm0 = Q1_u * diff       (packed lane-wise product)
  //     xmm4 = Q2_u.x  (scalar low)
  //     xmm4 = Q2_u.x * diff.x   (scalar) ; xmm4 += |Q1_u|²  → xmm4_lo = Q2x*dx + |Q1_u|²
  //     xmm0 = shufpd(xmm0, xmm4)  → xmm0 = (Q1y*dy, Q2x*dx + |Q1_u|²)
  //     xmm3 = unpcklpd(Q1_u.x, Q2_u.y)  = (Q1_u.x, Q2_u.y)
  //     xmm3 = xmm3 * diff       (packed) → (Q1x*dx, Q2y*dy)
  //     xmm3 = xmm3 + xmm0       → (Q1x*dx + Q1y*dy, Q2y*dy + Q2x*dx + |Q1_u|²)
  //                              =  (numerator,        denominator)
  //     xmm0 = xmm3.hi           → denominator (broadcast)
  //     xmm3 = xmm3 / xmm0       → xmm3.lo = numerator/denominator
  //     return u - xmm3.lo
  NewtonRaphsonRootFind(Q: PCVec2[], P: PCVec2, u: number): number {
    // Q1 = 3 * (Q[i+1] - Q[i]) for i = 0..2. `mulpd 0x11629b(%rip)` = packed (3.0, 3.0) @ 0x122850.
    const Q1: PCVec2[] = [];
    for (let i = 0; i < 3; i++) {
      const diff = v2sub(Q[i + 1], Q[i]);
      Q1.push({ x: diff.x * K_THREE, y: diff.y * K_THREE });
    }
    // Q2 = 2 * (Q1[i+1] - Q1[i]) for i = 0..1. Asm: `subpd xmm0, xmm1 ; addpd xmm1, xmm1`
    // (`addpd xmm1, xmm1` = double it — i.e. multiply by 2). Two elements: r13 initialised to 1
    // and the inner block re-runs once (r12b toggle at c62c/c630).
    const Q2: PCVec2[] = [];
    for (let i = 0; i < 2; i++) {
      const diff = v2sub(Q1[i + 1], Q1[i]);
      Q2.push({ x: diff.x + diff.x, y: diff.y + diff.y });
    }
    // Q_u = Bezier(3, Q, u).   xmm result stored to -0xd0(%rbp).
    const Q_u = this.Bezier(3, Q, u);
    // Q1_u = Bezier(2, Q1, u). Stored to -0xc0(%rbp).
    const Q1_u = this.Bezier(2, Q1, u);
    // Q2_u = Bezier(1, Q2, u). Split into .x @ -0xa0, .y @ -0xb0.
    const Q2_u = this.Bezier(1, Q2, u);
    // Newton step:
    const diff = v2sub(Q_u, P);
    const numerator   = diff.x * Q1_u.x + diff.y * Q1_u.y;                       // (Q-P)·Q'
    const denominator = diff.x * Q2_u.x + diff.y * Q2_u.y + v2lenSq(Q1_u);       // (Q-P)·Q'' + |Q'|²
    return u - numerator / denominator;
  }

  // @0xc37a PCCurveFit::Reparameterize(d, bezCurve, first, last, u) -> double[N+1]  (N = last-first)
  //   Allocates uPrime[N+1] and, for i = first..last, sets uPrime[i-first] =
  //     NewtonRaphsonRootFind(bezCurve, d[i], u[i-first]).
  //   Returns the fresh pointer.
  //
  //   Asm stack slot map (recovered from the movs at c38b..c39d):
  //     -0x30(%rbp) = this (rdi)
  //     -0x38(%rbp) = d    (rsi)
  //     -0x40(%rbp) = bezCurve (rdx)
  //     -0x48(%rbp) = u    (r9)
  //     r13 = first,  r14 = last
  //   The alloc size is `((last-first)+1) * 8` bytes (branch at c3ab tries to detect the overflow
  //   `(N+1) >> 0x3d != 0` and if so passes -1 to `operator new[]` which throws).
  Reparameterize(
    d: PCVec2[],
    bezCurve: PCVec2[],
    first: number,
    last: number,
    u: number[],
  ): number[] {
    const N = last - first;
    const uPrime: number[] = new Array<number>(N + 1);
    // Guard `jb 0xc411` skips the loop when last < first.
    if (last >= first) {
      for (let i = first; i <= last; i++) {
        // r15 = i, r15 << 4 = byte-offset into d; rdx = &d[i]; xmm0 = u[i-first].
        uPrime[i - first] = this.NewtonRaphsonRootFind(bezCurve, d[i], u[i - first]);
      }
    }
    return uPrime;
  }

  // @0xbbf8 PCCurveFit::GenerateBezier(d, first, last, uPrime, tHat1, tHat2) -> vector<PCVec2>
  //   Solves the 4-control-point least-squares Bezier fit given tangent directions and a parameter
  //   sequence. The asm is 431 lines of interleaved packed-SIMD math including a fallback
  //   branch (when the 2x2 normal-matrix determinant is non-finite: NaN or the ratio
  //   `alpha < 1e-6` per the `cmpltpd 0x1168ea(%rip)` comparison at @0xbf4d against const
  //   0x122840). Faithfully transcribing this is not attempted here; a paraphrase would
  //   be a defect per raw-port/army/PORTING_SPEC.md Rule 3. The frontier callee is a std::vector
  //   __emplace_back_slow_path and operator new[]/delete[].
  GenerateBezier(
    _d: PCVec2[],
    _first: number,
    _last: number,
    _uPrime: number[],
    _tHat1: PCVec2,
    _tHat2: PCVec2,
  ): PCVec2[] {
    throw new Error("PCCurveFit::GenerateBezier @0xbbf8 not yet transcribed");
  }

  // @0xb62c PCCurveFit::FitCubic(d, first, last, tHat1, tHat2, error) -> vector<PCVec2>
  //   Two branches:
  //     (a) N == 1 (single segment between two adjacent points): closed-form Wu/Barsky formula
  //         (see the asm at @0xb68f..@0xb8a1 — inlined normalize + push_back of four control pts)
  //         dist = |d[last] - d[first]| / 3.0
  //         bez  = [ d[first],
  //                  d[first] + normalize(tHat1) * dist,
  //                  d[last]  + normalize(tHat2) * dist,
  //                  d[last] ]
  //     (b) N > 1: u = ChordLengthParameterize(d, first, last);
  //                bez = GenerateBezier(d, first, last, u, tHat1, tHat2);
  //                err = ComputeMaxError(d, bez, first, last, u, &splitPt);
  //                if (err <= error) return bez;
  //                if (err < error²) for iter=20..1 { u' = Reparameterize;
  //                                                    bez = GenerateBezier(d, first, last, u', ...);
  //                                                    err = ComputeMaxError(...); if (err<error) return; }
  //                else recurse: tHatC = ComputeCenterTangent(d, splitPt);
  //                              bez = FitCubic(d, first, splitPt, tHat1, tHatC, error)
  //                                  ++ FitCubic(d, splitPt, last, -tHatC, tHat2, error).slice(1)
  //
  //   The recursion + closed-form + SIMD-heavy N==1 branch is not transcribed here; falls into the
  //   same faithfulness constraint as GenerateBezier. The sign-flip of tHatC uses `xorps
  //   0xd6642(%rip), %xmm0` at @0xba27, which loads a packed sign-mask (0x8000000000000000, ...)
  //   from const 0x1ea070 — see re/disasm/ProCore.PCCurveFit.FitCubic.s.
  FitCubic(
    _d: PCVec2[],
    _first: number,
    _last: number,
    _tHat1: PCVec2,
    _tHat2: PCVec2,
    _error: number,
  ): PCVec2[] {
    throw new Error("PCCurveFit::FitCubic @0xb62c not yet transcribed");
  }

  // @0xb49a PCCurveFit::FitCurve(d, bezCurve, error) — the 3-arg entry-point.
  //   Computes tHat1 = normalize(d[1] - d[0])          (inlined ComputeLeftTangent(d, 0))
  //            tHat2 = normalize(d[n-2] - d[n-1])       (inlined ComputeRightTangent(d, n-1))
  //   Then calls FitCubic(d, 0, n-1, tHat1, tHat2, error) and moves the returned vector into
  //   bezCurve (freeing the old buffer first via operator delete).
  //
  //   Because FitCubic @0xb62c is not yet transcribed, this method throws — the delegation and the
  //   inlined tangent math is otherwise identical to ComputeLeftTangent/ComputeRightTangent
  //   plus the sink into bezCurve.
  FitCurve(_d: PCVec2[], _bezCurve: PCVec2[], _error: number): void {
    throw new Error("PCCurveFit::FitCurve(3-arg) @0xb49a not yet transcribed (delegates to FitCubic @0xb62c)");
  }

  // @0xbae6 PCCurveFit::FitCurve(d, bezCurve, tHat1, tHat2, error) — the 5-arg entry-point.
  //   Trivial delegator: FitCubic(d, 0, n-1, tHat1, tHat2, error) → bezCurve.
  FitCurveWithTangents(
    _d: PCVec2[],
    _bezCurve: PCVec2[],
    _tHat1: PCVec2,
    _tHat2: PCVec2,
    _error: number,
  ): void {
    throw new Error("PCCurveFit::FitCurve(5-arg) @0xbae6 not yet transcribed (delegates to FitCubic @0xb62c)");
  }
}
