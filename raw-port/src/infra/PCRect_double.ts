// PCRect_double.ts — ProCore axis-aligned rectangle, `double` specialisation.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//         Versions/A/ProCore (macOS FCP, x86_64 slice)
//
// This file ports `PCRect<double>::operator|=(PCVector2<double> const&)`
// (@ProCore 0x2c78c), the "expand this rectangle to include a point" union
// operator.  The class layout is recovered directly from that method's
// disassembly (see FULL DISASM below):
//
//   PCRect<double>:
//     +0x00  origin.x   (double)   \_ origin PCVector2<double>, read/written as a
//     +0x08  origin.y   (double)   /  packed 128-bit pair (movupd (%rax)).
//     +0x10  size.width (double)   \_ size PCVector2<double>, read/written as a
//     +0x18  size.height(double)   /  packed 128-bit pair (movupd 0x10(%rax)).
//
// The `PCVector2<double> const&` argument (%rsi) is a bare (x, y) pair; the
// method only reads its two doubles as a packed load (movupd (%rsi)), so it is
// modelled here as a plain 2-double struct — no PCVector2 method is called
// (there is NO callq in this function; FRONTIER CALLEES: none).
//
// -----------------------------------------------------------------------------
// FULL DISASM — PCRect<double>::operator|=(PCVector2<double> const&)
//   raw-port/re/disasm/ProCore.__ZN6PCRectIdEoRERK9PCVector2IdE.s
// -----------------------------------------------------------------------------
//   0x2c78c  pushq %rbp ; movq %rsp,%rbp
//   0x2c790  movq   %rdi, %rax               ; rax = this
//   0x2c793  movsd  0x10(%rdi), %xmm0        ; xmm0 = this.size.width
//   0x2c798  xorpd  %xmm2, %xmm2             ; xmm2 = 0.0
//   0x2c79c  ucomisd %xmm0, %xmm2            ; sub: xmm2 - xmm0 = 0 - width
//   0x2c7a0  ja     0x2c7ad                  ;   ja (CF=0&ZF=0) => 0 > width
//                                            ;   => width < 0 => EMPTY branch
//   0x2c7a2  movsd  0x18(%rax), %xmm1        ; xmm1 = this.size.height
//   0x2c7a7  ucomisd %xmm1, %xmm2            ; sub: xmm2 - xmm1 = 0 - height
//   0x2c7ab  jbe    0x2c7c3                  ;   jbe (CF=1|ZF=1) => 0 <= height
//                                            ;   => height >= 0 => UNION branch
//   -- fall-through here means height < 0 => EMPTY branch --
//   -- EMPTY branch @0x2c7ad: rect is degenerate, reset it to the point --
//   0x2c7ad  leaq   0x10(%rax), %rcx         ; rcx = &this.size
//   0x2c7b1  movupd (%rsi), %xmm0            ; xmm0 = point (px, py)
//   0x2c7b5  movupd %xmm0, (%rax)            ; this.origin = point
//   0x2c7b9  xorpd  %xmm0, %xmm0             ; xmm0 = (0, 0)
//   0x2c7bd  movupd %xmm0, (%rcx)            ; this.size = (0, 0)
//   0x2c7c1  jmp    0x2c7ec
//   -- UNION branch @0x2c7c3: expand rect to include point --
//   0x2c7c3  movupd (%rax), %xmm2            ; xmm2 = this.origin (ox, oy)
//   0x2c7c7  movupd (%rsi), %xmm3            ; xmm3 = point (px, py)
//   0x2c7cb  movapd %xmm3, %xmm4             ; xmm4 = point
//   0x2c7cf  minpd  %xmm2, %xmm4             ; xmm4 = min(point, origin)  [new origin]
//   0x2c7d3  unpcklpd %xmm1, %xmm0           ; xmm0 = (width, height)  [size]
//                                            ;   (xmm0[0]=width from 0x2c793,
//                                            ;    xmm1[0]=height from 0x2c7a2)
//   0x2c7d7  addpd  %xmm2, %xmm0             ; xmm0 = origin + size = far corner
//                                            ;   (ox+w, oy+h)
//   0x2c7db  maxpd  %xmm0, %xmm3             ; xmm3 = max(point, far corner)
//                                            ;   [new far corner]
//   0x2c7df  subpd  %xmm4, %xmm3             ; xmm3 = newFarCorner - newOrigin
//                                            ;   [new size]
//   0x2c7e3  movupd %xmm4, (%rax)            ; this.origin = new origin
//   0x2c7e7  movupd %xmm3, 0x10(%rax)        ; this.size = new size
//   0x2c7ec  popq %rbp ; retq
//
// AT&T decode notes (ucomisd %src,%dst computes dst - src):
//   * `ucomisd %xmm0,%xmm2` (xmm2=0, xmm0=width) => 0 - width. `ja` (CF=0&ZF=0)
//     is UNSIGNED-above on the FP flags: taken iff 0 > width, i.e. width < 0.
//   * `ucomisd %xmm1,%xmm2` (xmm2=0, xmm1=height) => 0 - height. `jbe`
//     (CF=1|ZF=1) taken iff 0 <= height, i.e. height >= 0 (go to UNION).
//   * So: if (width < 0 || height < 0) => EMPTY branch (degenerate rect);
//     else => UNION branch.  minpd/maxpd are componentwise (packed doubles).
//   * NaN caveat: `xorpd`-zeroed xmm2 is a real 0.0, so no unordered surprises
//     unless a stored width/height is NaN; the machine's raw ucomisd result is
//     mirrored exactly by the JS relational operators below (NaN comparisons
//     are false in both, matching CF=ZF=1 => neither branch's "taken" holds
//     for the `ja` at 0x2c7a0 and takes the `jbe` at 0x2c7ab, which is the same
//     ordering JS `0 <= NaN === false` / `0 > NaN === false` reproduce).
//
// FRONTIER CALLEES: none (no callq; pure SIMD arithmetic on the two vectors).
// Dependencies: 0 in-scope, 0 indirect, 0 out-of-scope externs.
// -----------------------------------------------------------------------------

/**
 * A 2-D `double` point, as passed by `const&` (%rsi) to `operator|=`.  The
 * method loads it as a packed 128-bit pair `(x, y)`; only these two doubles
 * are read, so this is the minimal faithful model of `PCVector2<double>` for
 * this operator (no PCVector2 method is invoked).
 */
export interface PCVector2d {
  /** vector +0x00 — x component (movupd low lane). */
  x: number;
  /** vector +0x08 — y component (movupd high lane). */
  y: number;
}

/**
 * `PCRect<double>` — an axis-aligned rectangle stored as an origin corner
 * `(x, y)` at +0x00/+0x08 and a size `(width, height)` at +0x10/+0x18.  Layout
 * recovered from the `operator|=` disasm (packed movupd at (%rax) for the
 * origin pair and at 0x10(%rax) for the size pair).
 */
export class PCRect_double {
  /** (this+0x00) — origin.x. */
  origin_x_at_0x0 = 0;
  /** (this+0x08) — origin.y. */
  origin_y_at_0x8 = 0;
  /** (this+0x10) — size.width. */
  size_w_at_0x10 = 0;
  /** (this+0x18) — size.height. */
  size_h_at_0x18 = 0;

  /**
   * `PCRect<double>::operator|=(PCVector2<double> const&)` —
   * @ProCore 0x2c78c (__ZN6PCRectIdEoRERK9PCVector2IdE).
   *
   * Grow this rectangle in place so it contains `point`.  If the rectangle is
   * currently degenerate (negative width OR negative height), it is reset to a
   * zero-size rectangle located at `point`.  Otherwise the origin is min'd and
   * the far corner is max'd against `point` componentwise, and the size is
   * recomputed as `newFarCorner - newOrigin`.
   *
   * Returns nothing here (the C++ returns `*this` in %rax @0x2c790, an lvalue
   * ref used only for chaining; the mutation is the observable effect).
   */
  operator_orassign(point: PCVector2d): void {
    // @0x2c793 movsd 0x10(%rdi),%xmm0 : width.
    const width = this.size_w_at_0x10;
    // @0x2c79c ucomisd %xmm0,%xmm2 ; @0x2c7a0 ja EMPTY : 0 > width => width < 0.
    // @0x2c7a2 movsd 0x18,%xmm1 ; @0x2c7a7 ucomisd %xmm1,%xmm2 ; @0x2c7ab jbe UNION
    //   : 0 <= height => UNION. Fall-through (height < 0) => EMPTY.
    const height = this.size_h_at_0x18;
    if (width < 0 || height < 0) {
      // -- EMPTY branch @0x2c7ad --
      // @0x2c7b5 movupd %xmm0,(%rax) : this.origin = point.
      this.origin_x_at_0x0 = point.x;
      this.origin_y_at_0x8 = point.y;
      // @0x2c7bd movupd (0,0),(%rcx) : this.size = (0, 0).
      this.size_w_at_0x10 = 0;
      this.size_h_at_0x18 = 0;
      // @0x2c7c1 jmp epilogue.
      return;
    }

    // -- UNION branch @0x2c7c3 --
    // @0x2c7c3 movupd (%rax),%xmm2 : origin (ox, oy).
    const ox = this.origin_x_at_0x0;
    const oy = this.origin_y_at_0x8;
    // @0x2c7cf minpd %xmm2,%xmm4 (xmm4=point) : new origin = min(point, origin).
    const newOx = Math.min(point.x, ox);
    const newOy = Math.min(point.y, oy);
    // @0x2c7d3 unpcklpd -> (width, height) ; @0x2c7d7 addpd %xmm2 : far corner.
    const farX = ox + width;
    const farY = oy + height;
    // @0x2c7db maxpd %xmm0,%xmm3 (xmm3=point) : new far corner = max(point, far).
    const newFarX = Math.max(point.x, farX);
    const newFarY = Math.max(point.y, farY);
    // @0x2c7df subpd %xmm4,%xmm3 : new size = newFarCorner - newOrigin.
    // @0x2c7e3/0x2c7e7 store origin then size.
    this.origin_x_at_0x0 = newOx;
    this.origin_y_at_0x8 = newOy;
    this.size_w_at_0x10 = newFarX - newOx;
    this.size_h_at_0x18 = newFarY - newOy;
    // @0x2c7ec popq %rbp ; retq.
  }
}
