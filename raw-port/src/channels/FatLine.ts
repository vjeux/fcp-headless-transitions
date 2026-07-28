// FatLine — ProCore framework (Bézier "fat line" subdivision clipper).
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore (x86_64 slice).
//
// A FatLine is an ImplicitLine (a signed distance line) plus a pair of parallel
// offsets that bound a curve's control polygon; used by intersection algorithms
// on Bézier curves (Sederberg–Nishita).
//
// Layout — from the ctor @0x0006c77c:
//   +0x00..+0x10  : ImplicitLine base subobject (2 doubles: line normal.x, normal.y)
//                   The `movupd (%rbx), %xmm0` at @0x6c798 reads it back as
//                   [normal.x, normal.y].
//   +0x10         : ImplicitLine's `c` term (the signed-distance offset for the
//                   line through the two endpoints), used at @0x6c7a9 as the
//                   scalar addend before the ±0.5 halving.
//   +0x18         : dLow  — lower fat-line offset (double)   @0x6c7cf stores lane 0
//   +0x20         : dHigh — upper fat-line offset (double)   @0x6c7cf stores lane 1
//
// Methods (all 5):
//   0x0006c77c  FatLine(vector<PCVector2<double>> const&) [C2] — real body
//   0x0006c7da  FatLine(vector<PCVector2<double>> const&) [C1] — tail-call to C2
//   0x0006c7e4  intersectLineSegment(PCVector2 const&, PCVector2 const&, double&, double&) const
//   0x0006c8c0  intersectHull(vector<PCVector2<double>> const&, double&, double&)
//   0x0006cb34  clip(vector<PCVector2<double>> const&, vector<PCVector2<double>>*)
//
// intersectHull and clip are ~170 lines each of dense std::vector traversal
// (initial ±1e10 sentinels, wrap-around convex-hull walk with the "did we
// intersect?" pair, and a vector<PCVector2> emit path with reserve/push_back
// bookkeeping). We fully decode the two ctors + intersectLineSegment (the
// scalar math kernels) and raise from the two std::vector-heavy methods with
// the frontier callees + decoded sentinels documented.

/* eslint-disable @typescript-eslint/no-unused-vars */

// Frontier — PCVector2<double> and ImplicitLine are not yet ported. We model
// PCVector2<double> structurally (matches the {double x @+0x00, double y @+0x08}
// probed by `(%rsi)` / `0x8(%rsi)` in intersectLineSegment).
export interface PCVector2d {
  x: number;
  y: number;
}

// std::vector<PCVector2<double>> header is a 3-pointer struct in libc++:
// {begin, end, cap_end}. Ctor arg (%rsi) dereferences (%rsi) to grab `begin`
// then does &begin[+0x20] to reach the *third* element (points[2].x@+0x00,
// points[2].y@+0x08 fit inside &begin[0x20..0x30] since each element is 16 bytes).
// The ctor is documented to take a 3-point Bézier control polygon (or larger,
// only points[0] and points[2] are read for the endpoint line).
export type PCVector2dVector = PCVector2d[];

/**
 * FatLine — a signed-distance line (ImplicitLine base) with two offsets
 * bracketing a curve's control polygon.
 */
export class FatLine {
  /** +0x00 — normal.x of the ImplicitLine base */
  public nx: number = 0;
  /** +0x08 — normal.y of the ImplicitLine base */
  public ny: number = 0;
  /** +0x10 — ImplicitLine's `c` offset (signed distance for the base line) */
  public c: number = 0;
  /** +0x18 — dLow, the lower fat-line offset from `c` */
  public dLow: number = 0;
  /** +0x20 — dHigh, the upper fat-line offset from `c` */
  public dHigh: number = 0;

  /**
   * FatLine::FatLine(std::vector<PCVector2<double>> const& points) [C2] @0x0006c77c
   *
   * Asm (verbatim):
   *   0x6c789  movq (%rsi), %rsi              ; rsi = points.data() (first element ptr)
   *   0x6c78c  leaq 0x20(%rsi), %rdx          ; rdx = &points[0] + 0x20 = &points[2] (each PCVector2d is 16 bytes)
   *   0x6c790  callq ImplicitLine::ImplicitLine(PCVector2<double> const&, PCVector2<double> const&)
   *              → builds the base line through points[0] and points[2]; writes
   *              normal.x @+0x00, normal.y @+0x08, c @+0x10 into `this`.
   *   0x6c795  movq (%r14), %rax              ; rax = points.data()   (reload)
   *   0x6c798  movupd (%rbx), %xmm0           ; xmm0 = [this.nx, this.ny]
   *   0x6c79c  movupd 0x10(%rax), %xmm1       ; xmm1 = [points[1].x, points[1].y]
   *   0x6c7a1  mulpd %xmm0, %xmm1             ; xmm1 = [nx*p1x, ny*p1y]
   *   0x6c7a5  haddpd %xmm1, %xmm1            ; lane0 = nx*p1x + ny*p1y  (dot(n, p1))
   *   0x6c7a9  addsd 0x10(%rbx), %xmm1        ; xmm1[0] += this.c
   *                                           ; = dot(n, p1) + c   (== signed distance from p1 to the base line)
   *   0x6c7ae  mulsd [rip+0.5], %xmm1         ; xmm1[0] *= 0.5     @const 0x122890 = 0.5
   *   0x6c7b6  xorpd %xmm0, %xmm0             ; xmm0 = [0, 0]
   *   0x6c7ba  unpcklpd %xmm1, %xmm0          ; xmm0 = [0, d]      (d = signed-dist/2)
   *   0x6c7be  movq %xmm1, %xmm2              ; xmm2 = [d, 0]
   *   0x6c7c2  cmpltpd %xmm0, %xmm2           ; xmm2 = [d < 0, 0 < d]  (per-lane mask)
   *                                             lane0 = (d < 0)  ? -1 : 0
   *                                             lane1 = (0 < d)  ? -1 : 0
   *   0x6c7c7  movddup %xmm1, %xmm0           ; xmm0 = [d, d]
   *   0x6c7cb  andpd %xmm2, %xmm0             ; xmm0 = [d<0 ? d : 0, 0<d ? d : 0]
   *                                             lane0 = min(d,0)
   *                                             lane1 = max(d,0)
   *   0x6c7cf  movupd %xmm0, 0x18(%rbx)       ; this.dLow  = min(d, 0)  @+0x18
   *                                             this.dHigh = max(d, 0)  @+0x20
   *   retq
   *
   * Semantics: given control points p0, p1, p2, build the base line through
   * (p0, p2), then set dLow = min(d, 0), dHigh = max(d, 0) where d is *half*
   * the signed distance from p1 to that base line. This is the standard
   * Sederberg fat-line construction for a *quadratic* control polygon (the
   * `0.5` and reading only points[1] are diagnostic for the quadratic case;
   * the cubic case has a slightly different scale but the ctor only touches
   * points[0], points[1], points[2]).
   */
  constructor(points: PCVector2dVector) {
    // @0x6c790 : delegate to ImplicitLine base ctor with p0, p2.
    const p0 = points[0];
    const p2 = points[2];
    FatLine.ImplicitLine_ctor(this, p0, p2);
    // @0x6c795..@0x6c7a9 : d_raw = dot(n, p1) + c   (signed distance from p1 to base line)
    const p1 = points[1];
    const dRaw = this.nx * p1.x + this.ny * p1.y + this.c;
    // @0x6c7ae : d = 0.5 * d_raw   (const @0x122890 = 0.5)
    const d = dRaw * 0.5;
    // @0x6c7c2..@0x6c7cb : lane-wise (min(d,0), max(d,0))
    // NB: for NaN inputs the SSE cmpltpd flavor returns false-masks in both
    // lanes so dLow=dHigh=0. JS Math.min/max propagate NaN, but the andpd
    // trick yields 0 on NaN — mirror that explicitly so the parity holds.
    if (d !== d /* NaN */) {
      this.dLow = 0;
      this.dHigh = 0;
    } else {
      this.dLow = d < 0 ? d : 0;
      this.dHigh = 0 < d ? d : 0;
    }
  }

  /**
   * FatLine::FatLine(...) [C1] @0x0006c7da
   *
   * Asm:
   *   0x6c7da  pushq %rbp
   *   0x6c7db  movq  %rsp, %rbp
   *   0x6c7de  popq  %rbp
   *   0x6c7df  jmp   FatLine::FatLine(...)[C2]
   *
   * Pure tail-call to C2 (same TS constructor).
   */

  /**
   * FatLine::intersectLineSegment(PCVector2<double> const& a, PCVector2<double> const& b,
   *                                double& outMin, double& outMax) const @0x0006c7e4
   *
   * Signature note (SysV): rdi=this, rsi=&a, rdx=&b, rcx=&outMin, r8=&outMax. Return in `al` (bool).
   *
   * Asm (verbatim, annotated):
   *   0x6c7e8  movsd 0x8(%rsi), %xmm3         ; xmm3 = a.y
   *   0x6c7ed  movsd 0x8(%rdx), %xmm1         ; xmm1 = b.y
   *   0x6c7f2  subsd %xmm3, %xmm1             ; xmm1 = b.y - a.y   (dy)
   *   0x6c7f6  movapd [rip+ABS_MASK], %xmm0   ; xmm0 = [0x7fff..., 0x7fff...]  (double abs mask, addr 0x122670)
   *   0x6c7fe  andpd  %xmm1, %xmm0            ; xmm0 = |dy|                    (only lane0 used)
   *   0x6c802  ucomisd [rip+1e-07], %xmm0     ; compare |dy| against 1e-7      (const @0x122880)
   *   0x6c80a  jbe 0x6c8b9                    ; if (|dy| <= 1e-7) goto FAIL
   *
   *   ; --- INTERSECT WITH y = dLow (this.dLow @+0x18) ---
   *   0x6c810  movsd (%rsi), %xmm2            ; xmm2 = a.x
   *   0x6c814  movsd (%rdx), %xmm0            ; xmm0 = b.x
   *   0x6c818  subsd %xmm2, %xmm0             ; xmm0 = b.x - a.x    (dx)
   *   0x6c81c  movsd 0x18(%rdi), %xmm4        ; xmm4 = this.dLow
   *   0x6c821  subsd %xmm3, %xmm4             ; xmm4 = dLow - a.y
   *   0x6c825  divsd %xmm1, %xmm4             ; xmm4 = t = (dLow - a.y) / dy
   *   0x6c829  movapd %xmm4, %xmm5
   *   0x6c82d  cmplesd [rip+1.0], %xmm5       ; xmm5 = (t <= 1.0) ? -1 : 0     (const @0x122530 = 1.0)
   *   0x6c836  xorpd  %xmm3, %xmm3
   *   0x6c83a  xorpd  %xmm6, %xmm6
   *   0x6c83e  cmplesd %xmm4, %xmm6           ; xmm6 = (0.0 <= t) ? -1 : 0
   *   0x6c843  andpd  %xmm5, %xmm6            ; xmm6 = (0<=t && t<=1) ? -1 : 0
   *   0x6c847  movd   %xmm6, %eax
   *   0x6c84b  testb  $0x1, %al
   *   0x6c84d  je 0x6c871                     ; if !(0<=t<=1) skip the update
   *   0x6c84f  mulsd  %xmm0, %xmm4            ; xmm4 = t*dx
   *   0x6c853  addsd  %xmm4, %xmm2            ; xmm2 = a.x + t*dx  (== x at y=dLow)
   *   0x6c857  movsd  (%rcx), %xmm4           ; xmm4 = *outMin
   *   0x6c85b  ucomisd %xmm2, %xmm4
   *   0x6c85f  jbe 0x6c865
   *   0x6c861  movsd %xmm2, (%rcx)            ; if (*outMin > x) *outMin = x
   *   0x6c865  ucomisd (%r8), %xmm2
   *   0x6c86a  jbe 0x6c871
   *   0x6c86c  movsd %xmm2, (%r8)             ; if (x > *outMax) *outMax = x
   *
   *   ; --- INTERSECT WITH y = dHigh (this.dHigh @+0x20) ---
   *   0x6c871  movsd 0x20(%rdi), %xmm2        ; xmm2 = this.dHigh
   *   0x6c876  subsd 0x8(%rsi), %xmm2         ; xmm2 = dHigh - a.y
   *   0x6c87b  divsd %xmm1, %xmm2             ; xmm2 = t' = (dHigh - a.y) / dy
   *   0x6c87f  ucomisd %xmm3, %xmm2           ; compare t' vs 0.0
   *   0x6c883  jb 0x6c8bb                     ; if (t' < 0) → return true (al already set)   [see 6c8a9]
   *   0x6c885  movsd  [rip+1.0], %xmm1        ; xmm1 = 1.0                       (const @0x122531)
   *   0x6c88d  ucomisd %xmm2, %xmm1
   *   0x6c891  jb 0x6c8bb                     ; if (1.0 < t')  → return true (skip)
   *   0x6c893  mulsd  %xmm2, %xmm0            ; xmm0 = t'*dx
   *   0x6c897  addsd  (%rsi), %xmm0           ; xmm0 = a.x + t'*dx
   *   0x6c89b  movsd  (%rcx), %xmm1
   *   0x6c89f  ucomisd %xmm0, %xmm1
   *   0x6c8a3  jbe 0x6c8a9
   *   0x6c8a5  movsd  %xmm0, (%rcx)           ; if (*outMin > x') *outMin = x'
   *   0x6c8a9  movb  $0x1, %al                ; return-value = true (any successful intersect)
   *   0x6c8ab  ucomisd (%r8), %xmm0
   *   0x6c8b0  jbe 0x6c8bb
   *   0x6c8b2  movsd  %xmm0, (%r8)            ; if (x' > *outMax) *outMax = x'
   *   0x6c8b7  jmp 0x6c8bb
   *   0x6c8b9  xorl %eax, %eax                ; FAIL → return false
   *   0x6c8bb  andb $0x1, %al
   *   0x6c8bd  retq
   *
   * Semantics: for a line segment from a to b, find the x-values where the
   * segment crosses the fat-line's two parallel edges (y = dLow, y = dHigh)
   * in the ImplicitLine's local coordinate system. When |dy| is small (< 1e-7)
   * the segment is nearly parallel — fail. Otherwise clamp the segment
   * parameter t to [0,1] and update the caller's [outMin, outMax] envelope.
   *
   * The return is `true` iff the *upper* intersection landed in [0,1] (the
   * lower one only widens the envelope silently). This mirrors the observed
   * `al = 0` early exit vs `al = 1` inside the upper-intersect branch.
   *
   * We return {hit, outMin, outMax} as an object; callers who mimic the C++
   * out-params write outMin/outMax back into their own doubles.
   */
  intersectLineSegment(
    a: PCVector2d,
    b: PCVector2d,
    outMin: number,
    outMax: number,
  ): { hit: boolean; outMin: number; outMax: number } {
    // @0x6c7e8..@0x6c7f2 : dy = b.y - a.y
    const dy = b.y - a.y;
    // @0x6c7f6..@0x6c80a : if (|dy| <= 1e-7) return false
    const absDy = dy < 0 ? -dy : dy;
    if (!(absDy > 1e-7)) {
      // note: ucomisd/jbe treats NaN as unordered → falls through to FAIL
      return { hit: false, outMin, outMax };
    }
    let hit = false;
    // @0x6c810..@0x6c818 : dx = b.x - a.x
    const dx = b.x - a.x;
    // --- lower edge y = this.dLow ---
    // @0x6c821..@0x6c825 : t = (dLow - a.y) / dy
    const tLow = (this.dLow - a.y) / dy;
    // @0x6c82d..@0x6c84d : if (0 <= tLow && tLow <= 1.0) update envelope
    if (0 <= tLow && tLow <= 1.0) {
      // @0x6c84f..@0x6c853 : x = a.x + tLow * dx
      const x = a.x + tLow * dx;
      // @0x6c857..@0x6c861 : if (outMin > x) outMin = x
      if (outMin > x) outMin = x;
      // @0x6c865..@0x6c86c : if (x > outMax) outMax = x
      if (x > outMax) outMax = x;
    }
    // --- upper edge y = this.dHigh ---
    // @0x6c871..@0x6c87b : t' = (dHigh - a.y) / dy
    const tHigh = (this.dHigh - a.y) / dy;
    // @0x6c87f..@0x6c891 : if (t' < 0 || 1.0 < t') skip upper-edge update
    //   NB: the ucomisd checks use "unordered treated as taken" but for real
    //   numbers they collapse to the plain interval check below. When t' is
    //   NaN both compares are unordered so we do skip (matches the jb/jb).
    if (!(tHigh !== tHigh) && tHigh >= 0 && tHigh <= 1.0) {
      // @0x6c893..@0x6c897 : x' = a.x + t' * dx
      const xHigh = a.x + tHigh * dx;
      // @0x6c89b..@0x6c8a5 : if (outMin > x') outMin = x'
      if (outMin > xHigh) outMin = xHigh;
      // @0x6c8a9 : al = 1  (returning true)
      hit = true;
      // @0x6c8ab..@0x6c8b2 : if (x' > outMax) outMax = x'
      if (xHigh > outMax) outMax = xHigh;
    }
    return { hit, outMin, outMax };
  }

  /**
   * FatLine::intersectHull(std::vector<PCVector2<double>> const& hull,
   *                        double& outLo, double& outHi) @0x0006c8c0
   *
   * Not yet transcribed. ~170 lines of dense std::vector traversal + hull
   * wrap-around that repeatedly calls FatLine::intersectLineSegment on each
   * edge of `hull` (treating it as a closed polygon). Decoded so far:
   *   0x6c8de..0x6c8f5 : *outLo = +1e10 (imm 0x4202A05F20000000)
   *                       *outHi = -1e10 (imm 0xC202A05F20000000)
   *                     — initial sentinels that the intersect-per-edge loop
   *                     tightens toward each other.
   * Everything after is std::vector { begin_p, end_p, cap_p } iteration soup
   * that needs its own PCVector2d-vector port before a faithful transcription
   * is possible.
   */
  intersectHull(_hull: PCVector2dVector, _outLo: number, _outHi: number): { lo: number; hi: number } {
    // @0x6c8de : *outLo = +1e10
    // @0x6c8eb : *outHi = -1e10
    // (rest of body @0x6c8c0..@0x6cb33 is std::vector iteration + repeated
    //  calls to this.intersectLineSegment — not yet transcribed.)
    throw new Error('FatLine.intersectHull @0x0006c8c0 body not yet transcribed (std::vector<PCVector2<double>> hull traversal, ~170 lines)');
  }

  /**
   * FatLine::clip(std::vector<PCVector2<double>> const& in,
   *               std::vector<PCVector2<double>>* out) @0x0006cb34
   *
   * Not yet transcribed. Calls intersectHull @0x6cb50 and then walks the input
   * hull emitting clipped points into `*out` (std::vector push_back / reserve
   * bookkeeping ~166 lines). Blocked on the same std::vector port.
   */
  clip(_in: PCVector2dVector, _out: PCVector2dVector | null): void {
    // (body @0x0006cb34..@0x0006cd??  ~166 lines of std::vector push/pop over
    //  the input hull, gated by intersectHull results — not yet transcribed.)
    throw new Error('FatLine.clip @0x0006cb34 body not yet transcribed (std::vector<PCVector2<double>> emit path, ~166 lines)');
  }

  /**
   * Frontier callee — ImplicitLine::ImplicitLine(PCVector2<double> const&, PCVector2<double> const&)
   * called @0x0006c790. Not yet ported; the ctor cannot proceed without it.
   * Sets this.nx, this.ny, this.c from (p0, p2).
   */
  private static ImplicitLine_ctor(_self: FatLine, _p0: PCVector2d, _p2: PCVector2d): void {
    throw new Error('ImplicitLine::ImplicitLine(PCVector2d&, PCVector2d&) @callq 0x0006c790 not yet transcribed');
  }
}
