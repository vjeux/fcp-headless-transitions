// ImplicitLine — a 2D line in implicit form `nx*x + ny*y + c = 0` where (nx, ny) is the
// unit normal and c is the signed offset. Built from two 2D points in the ctor; queries
// the signed distance from an arbitrary point via `distanceToLine`.
//
// Framework: ProCore
//
// Provenance (raw-port/re/disasm/ProCore.ImplicitLine.*.s):
//   ImplicitLine::ImplicitLine(PCVector2<double> const&, PCVector2<double> const&)
//     C1 @0x0006c756  __ZN12ImplicitLineC1ERK9PCVector2IdES3_  (5-instruction thunk → C2)
//     C2 @0x0006c6c4  __ZN12ImplicitLineC2ERK9PCVector2IdES3_  (the real ctor body)
//   ImplicitLine::distanceToLine(PCVector2<double> const&) const
//                    @0x0006c760  __ZNK12ImplicitLine14distanceToLineERK9PCVector2IdE
//
// The ledger lists exactly three T-symbols under `__ZN12ImplicitLine*` — these three; there
// are no other member functions to port. Pure math, no callees, no vtable.
//
// STRUCT LAYOUT (recovered from C2 stores + distanceToLine reads):
//   +0x00  double  nx   — normal.x = -dy_norm       (stored via `unpcklpd -> movupd`)
//   +0x08  double  ny   — normal.y =  dx_norm       (packed with nx into (rdi))
//   +0x10  double  c    — offset   = p0.x*dy_norm - p0.y*dx_norm  = -(n·p0)
//                        (stored via `movlpd %xmm3, 0x10(%rdi)`)
// TOTAL SIZE: 24 bytes (three doubles).
//
// Constants read from ProCore .rodata (all decoded via `resolve.py ProCore const <addr>`):
//   @0x122670  u64=0x7fffffffffffffff  — 63-bit all-1s mask; used with `andpd` to compute
//                                        |xmm3| (absolute value) by masking off the sign bit.
//                                        Not a numeric double (would decode as NaN); it is
//                                        the SSE ABSMASK idiom. Referenced RIP-relative @0x6c6ea.
//   @0x122860  u64=0x3e7ad7f2a0000000  — approximately 1.0000000116860974e-07 (i.e. the f32
//                                        literal `1e-7f` widened to double). The zero-length
//                                        epsilon. Referenced RIP-relative @0x6c6f6.
//   @0x0e2070  u64=0x8000000000000000  — 64-bit sign bit only; used with `xorpd` as the double
//                                        negation idiom (flip sign). Referenced RIP-relative
//                                        @0x6c722.
//
// PCVector2<double>: a 16-byte struct with double x @+0x00 and double y @+0x08 — inferred from
// the `movupd (%rsi), %xmm0` (loads (x,y) packed) and `movsd 0x8(%rsi), %xmm3` (reads y alone)
// pattern in this ctor. Modeled inline below as a 2-tuple; not modelled as a class here.

/** A 2D vector of doubles. Matches `PCVector2<double>` layout: (x @+0x00, y @+0x08). */
export interface Vec2d {
  x: number;
  y: number;
}

/**
 * ImplicitLine — 2D line in implicit form `nx*x + ny*y + c = 0`.
 */
export class ImplicitLine {
  /** Normal x-component. @+0x00 in C++ layout. Set by ctor @0x0006c732 (unpcklpd) +
   *  @0x0006c736 (movupd → (%rdi)). Equals `-dy_norm` where dy_norm is either
   *  `(p1.y-p0.y)/L` when L≥1e-7 else the raw `p1.y-p0.y`. */
  nx: number = 0;
  /** Normal y-component. @+0x08. Same store as `nx`. Equals `dx_norm`. */
  ny: number = 0;
  /** Signed offset. @+0x10. Set @0x0006c74f (movlpd → 0x10(%rdi)). Equals
   *  `p0.x*dy_norm - p0.y*dx_norm` = `-(nx*p0.x + ny*p0.y)` (verified algebraically:
   *   nx = -dy_norm so -nx*p0.x = dy_norm*p0.x; ny = dx_norm so -ny*p0.y = -dx_norm*p0.y). */
  c: number = 0;

  /**
   * ImplicitLine::ImplicitLine(PCVector2<double> const& p0, PCVector2<double> const& p1)
   *   C2 body @0x0006c6c4  (C1 @0x0006c756 is a bare pushq/movq/popq/jmp thunk to C2).
   *
   * Faithful transcription (raw-port/re/disasm/ProCore.ImplicitLine.C2.s):
   *   @0x6c6c4 pushq %rbp                                — frame setup
   *   @0x6c6c5 movq  %rsp, %rbp
   *   @0x6c6c8 xorps %xmm0, %xmm0                        — xmm0 = 0
   *   @0x6c6cb movups %xmm0, (%rdi)                      — this[+0..+16] = 0 (over-written below)
   *   @0x6c6ce movupd (%rdx), %xmm1                      — xmm1 = (p1.x, p1.y)
   *   @0x6c6d2 movupd (%rsi), %xmm0                      — xmm0 = (p0.x, p0.y)
   *   @0x6c6d6 subpd  %xmm0, %xmm1                       — xmm1 = (dx, dy) = p1 - p0
   *   @0x6c6da movapd %xmm1, %xmm0                       — xmm0 = xmm1
   *   @0x6c6de mulpd  %xmm1, %xmm0                       — xmm0 = (dx*dx, dy*dy)
   *   @0x6c6e2 haddpd %xmm0, %xmm0                       — xmm0 = (dx*dx + dy*dy, same)
   *   @0x6c6e6 sqrtsd %xmm0, %xmm3                       — xmm3.low = L = sqrt(dx*dx + dy*dy)
   *   @0x6c6ea movapd (rip+0xb5f7e), %xmm0               — xmm0 = ABSMASK (both qwords 0x7fff...ffff)
   *   @0x6c6f2 andpd  %xmm3, %xmm0                       — xmm0.low = |L|  (still just L; L>=0)
   *   @0x6c6f6 movsd  (rip+0xb6162), %xmm4               — xmm4.low = 1e-7 (as f32→f64)
   *   @0x6c6fe ucomisd %xmm0, %xmm4                      — CMP  xmm4 ? xmm0   (i.e. 1e-7 ? L)
   *   @0x6c702 movapd %xmm1, %xmm5                       — xmm5 = (dx, dy)
   *   @0x6c706 divsd  %xmm3, %xmm5                       — xmm5.low = dx / L   (unconditional; L may be 0)
   *   @0x6c70a movapd %xmm1, %xmm2                       — xmm2 = (dx, dy)
   *   @0x6c70e unpckhpd %xmm1, %xmm2                     — xmm2 = (dy, dy)  (both lanes = dy)
   *   @0x6c712 cmpnltsd %xmm4, %xmm0                     — xmm0.low = (L >= 1e-7) ? all-1s : 0
   *                                                        (xmm0 nlt xmm4  ⇔  L NOT<1e-7  ⇔  L>=1e-7)
   *   @0x6c717 blendvpd %xmm0, %xmm5, %xmm1              — for each qword: sign bit of xmm0 selects
   *                                                        xmm5 (normalized) over xmm1 (raw).
   *                                                        xmm0.high sign = 0 (upper qword of ABSMASK),
   *                                                        so lane 1 keeps xmm1.high = dy (raw).
   *                                                        xmm0.low sign = 1 iff L>=1e-7, so lane 0
   *                                                        becomes dx/L if L>=1e-7 else stays dx.
   *                                                        After: xmm1 = (dx_norm_or_raw, dy_raw).
   *   @0x6c71c ja     0x6c722                            — if (1e-7 > L) skip the divsd of xmm2:
   *                                                        i.e. keep xmm2.low = dy raw when L<1e-7.
   *   @0x6c71e divsd  %xmm3, %xmm2                       — else xmm2.low = dy / L.
   *                                                        (executed iff L>=1e-7.)
   *   @0x6c722 movapd (rip+0x75946), %xmm0               — xmm0 = NEGMASK (both qwords 0x8000...0000)
   *   @0x6c72a movapd %xmm2, %xmm3                       — xmm3 = xmm2 (dy_norm or dy_raw in low)
   *   @0x6c72e xorpd  %xmm0, %xmm3                       — xmm3 = -xmm3 (negate low lane of xmm3)
   *                                                                     — xmm3.low = -dy_norm_or_raw
   *   @0x6c732 unpcklpd %xmm1, %xmm3                     — xmm3 = (xmm3.low, xmm1.low)
   *                                                                = (-dy_norm_or_raw, dx_norm_or_raw)
   *   @0x6c736 movupd %xmm3, (%rdi)                      — this[+0] = nx = -dy_norm_or_raw
   *                                                        this[+8] = ny =  dx_norm_or_raw
   *   @0x6c73a movsd  0x8(%rsi), %xmm3                   — xmm3.low = p0.y
   *   @0x6c73f mulsd  (%rsi), %xmm2                      — xmm2.low = dy_norm_or_raw * p0.x
   *                                                                   (was xmm2.low = dy_norm_or_raw)
   *   @0x6c743 mulsd  %xmm1, %xmm3                       — xmm3.low = p0.y * xmm1.low
   *                                                                   = p0.y * dx_norm_or_raw
   *   @0x6c747 subsd  %xmm2, %xmm3                       — xmm3.low = p0.y*dx_n_or_r - dy_n_or_r*p0.x
   *   @0x6c74b xorpd  %xmm0, %xmm3                       — xmm3.low = -(p0.y*dx - p0.x*dy)  (negate)
   *                                                                   = p0.x*dy_n_or_r - p0.y*dx_n_or_r
   *   @0x6c74f movlpd %xmm3, 0x10(%rdi)                  — this[+0x10] = c = above
   *   @0x6c754 popq  %rbp
   *   @0x6c755 retq
   *
   * Numerical checks (all doubles, IEEE-754):
   *   ctor((0,0), (1,0)) -> L=1; dx_n=1, dy_n=0 -> nx=-0, ny=1, c=0*0-0*1=0.  Line: y=0. ✓
   *   ctor((0,0), (0,1)) -> L=1; dx_n=0, dy_n=1 -> nx=-1, ny=0, c=0*1-0*0=0.  Line: -x=0. ✓
   *   ctor((1,2), (3,4)) -> dx=2,dy=2,L=2√2; dx_n=dy_n=√2/2 -> nx=-√2/2, ny=√2/2,
   *                        c = 1*(√2/2) - 2*(√2/2) = -√2/2. distanceToLine((3,4)) =
   *                        -√2/2*3 + √2/2*4 + (-√2/2) = √2/2*(-3+4-1) = 0. ✓
   *   ctor((0,0), (0,0)) -> L=0; all dx/L are NaN; blendv keeps raw when L<1e-7 (L=0 is <1e-7),
   *                        so xmm1.low stays dx=0 and xmm2.low stays dy=0 (ja taken).
   *                        Result nx=-0, ny=0, c=0. A degenerate line (n = 0). Callers must
   *                        avoid this input; the ctor does NOT throw. ✓
   */
  static fromPoints(p0: Vec2d, p1: Vec2d): ImplicitLine {
    const self = new ImplicitLine();

    // @0x6c6ce, @0x6c6d2, @0x6c6d6 — pack-subtract to get (dx, dy).
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;

    // @0x6c6de..@0x6c6e6 — length squared then sqrtsd. Both are DOUBLE-precision (not f32);
    // sqrtsd on x86-64 uses hardware IEEE-754 double sqrt — matched by JS Math.sqrt on doubles.
    const lenSq = dx * dx + dy * dy;
    const L = Math.sqrt(lenSq);

    // @0x6c6f6 — the epsilon: bit-pattern 0x3e7ad7f2a0000000, which is `1e-7f` (f32) widened.
    // We use the exact double value, not the shorter literal 1e-7, so bit-exact parity holds.
    // (1e-7 as a JS double literal is 0x3e7ad7f29abcaf48, DIFFERENT — a 4 ulp mismatch. The
    //  binary chose the f32-rounded form, so we must too.)
    const EPS_LEN = 1.0000000116860974e-7; // u64 0x3e7ad7f2a0000000, see @0x122860.

    // @0x6c6fe..@0x6c717 — blendvpd on lane 0 (low): normalized when L>=EPS_LEN, raw when L<EPS_LEN.
    // @0x6c71c..@0x6c71e — divsd on xmm2 gated by `ja` (L<EPS_LEN skips). So both lanes obey the
    // same guard: normalize iff L>=EPS_LEN, else pass through raw values.
    let dxN: number, dyN: number;
    if (L >= EPS_LEN) {
      dxN = dx / L;
      dyN = dy / L;
    } else {
      // L below the SSE guard threshold. Raw (un-normalized) values propagate; when L==0
      // both are just 0 (they came from the p1-p0 subtraction).
      dxN = dx;
      dyN = dy;
    }

    // @0x6c722..@0x6c736 — normal = (-dyN, dxN). (NEGMASK xor flips sign of dyN.)
    // Note: for dyN == +0 the SSE xorpd produces -0 (JS: -0 * 1 === -0). We match by
    // negating explicitly via unary minus which yields -0 for +0 inputs in JS too.
    self.nx = -dyN;
    self.ny = dxN;

    // @0x6c73a..@0x6c74f — c = -(p0.y * dxN - p0.x * dyN) = p0.x*dyN - p0.y*dxN.
    // The x86 sequence computes  tmp = p0.y*dxN - p0.x*dyN, then negates -> stored.
    // We fuse to a single expression that matches the sign convention: c = p0.x*dyN - p0.y*dxN.
    // (Verified: c == -(nx*p0.x + ny*p0.y) since nx=-dyN, ny=dxN.)
    self.c = p0.x * dyN - p0.y * dxN;

    return self;
  }

  /**
   * ImplicitLine::distanceToLine(PCVector2<double> const& p) const   @0x0006c760.
   *
   * Faithful transcription (raw-port/re/disasm/ProCore.ImplicitLine.distanceToLine.s):
   *   @0x6c760 pushq %rbp
   *   @0x6c761 movq  %rsp, %rbp
   *   @0x6c764 movupd (%rdi), %xmm1                      — xmm1 = (this.nx, this.ny)
   *   @0x6c768 movupd (%rsi), %xmm0                      — xmm0 = (p.x, p.y)
   *   @0x6c76c mulpd  %xmm1, %xmm0                       — xmm0 = (nx*p.x, ny*p.y)
   *   @0x6c770 haddpd %xmm0, %xmm0                       — xmm0.low = nx*p.x + ny*p.y  (both lanes)
   *   @0x6c774 addsd  0x10(%rdi), %xmm0                  — xmm0.low += c
   *   @0x6c779 popq  %rbp
   *   @0x6c77a retq
   *
   * Returns the SIGNED distance from `p` to the line. Since (nx, ny) is the unit normal for
   * inputs with L>=EPS_LEN, the return value is the true Euclidean signed distance. When
   * the ctor's L<EPS_LEN degenerate branch was taken, the normal is un-normalized and this
   * function returns a scaled value; callers must be aware.
   */
  distanceToLine(p: Vec2d): number {
    // @0x6c764..@0x6c774 — dot(n, p) + c, using haddpd for the packed reduction.
    // In double precision the order of the add matters for exact IEEE parity; the SSE
    // sequence is (nx*p.x) + (ny*p.y) then +c, which is what we emit here.
    return this.nx * p.x + this.ny * p.y + this.c;
  }
}
