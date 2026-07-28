// OZSplineInterpolator — ProChannel.framework.
// Faithful transcription of the 13 symbols FCP exports for this class. Decode evidence
// (all in raw-port/re/disasm/ProChannel.OZSplineInterpolator.*.s):
//
//   OZSplineInterpolator::OZSplineInterpolator()                        @ProChannel 0x45ba8 (C1)
//   OZSplineInterpolator::OZSplineInterpolator()                        @ProChannel 0x45ba8 (C2, same body — one entry)
//   OZSplineInterpolator::~OZSplineInterpolator()                       @ProChannel 0x45bc8 (D1)  [see D0 body @0x45bdc]
//   OZSplineInterpolator::~OZSplineInterpolator()                       @ProChannel 0x45bc8 (D2)
//   OZSplineInterpolator::~OZSplineInterpolator()                       @ProChannel 0x45bdc (D0, delete)
//   OZSplineInterpolator::useTangents()                                 @ProChannel 0x45bf8
//   OZSplineInterpolator::convertHandlesToTangents(OZSpline&, d*, d*)   @ProChannel 0x45c00
//   OZSplineInterpolator::convertTangentsToHandles(OZSpline&, d*, d*)   @ProChannel 0x45c46
//   OZSplineInterpolator::interpolate(OZSpline&, CMTime, void*, void*, CMTime, bool, bool)
//                                                                       @ProChannel 0x45c88
//   OZSplineInterpolator::bisection(double*, double)                    @ProChannel 0x45c92
//   OZSplineInterpolator::eval(double*, double)                         @ProChannel 0x45d7a  (vtable *0x70)
//   OZSplineInterpolator::eval(OZSpline&, CMTime, void*, void*, double) @ProChannel 0x45d84
//   OZSplineInterpolator::subDivide(OZSpline&, CMTime, void*, void*, void*)
//                                                                       @ProChannel 0x45e7a
//
// Vtable (partial, from resolve.py ProChannel vtable OZSplineInterpolator @0xd6638 / installed 0xd6648):
//   *0x20  -> 0x45e7a  OZSplineInterpolator::subDivide
//   *0x30  -> 0x45c46  OZSplineInterpolator::convertTangentsToHandles
//   *0x70  -> 0x45d7a  OZSplineInterpolator::eval(double*, double)
//   *0x100 -> 0x46f1a  OZXSplineInterpolator::needInit(OZSpline&)   (subclass override marker)
// All other slots inherited from OZInterpolator (parent). The bisection() body calls the *this*
// vtable slot *0x70 — i.e. OZSplineInterpolator::eval(double*, double) — which unconditionally
// returns 0.0. So bisection() on a bare OZSplineInterpolator is degenerate; the class is a base
// intended to be subclassed (OZXSplineInterpolator installs an override at *0x100 and, presumably,
// a real eval body). This TS port dispatches bisection through `this.eval2(...)` so subclass
// overrides in TS reproduce FCP's virtual behaviour.
//
// Constants — every literal below carries its RIP-relative provenance:
//   * convertHandlesToTangents divisor  (handleMode0 branch):
//       - sp->0xa8[0] == 0   ->  12.0                    @ProChannel 0xb0510 (RIP @0x45c10; 8-byte double)
//       - sp->0xa8[0] != 0   ->  0.3333333333333333      @ProChannel 0xb0a68 (RIP @0x45c1a; 1/3 == 0x3fd5555555555555)
//   * convertTangentsToHandles multiplier: SAME two constants, swapped role
//       - sp->0xa8[0] == 0   ->  12.0                    @ProChannel 0xb0510 (RIP @0x45c56)
//       - sp->0xa8[0] != 0   ->  0.3333333333333333      @ProChannel 0xb0a68 (RIP @0x45c60)
//   * bisection numerics:
//       - initial-search direction table (rip @0x45cd2)  -> [-1.0, +1.0]
//                                          @ProChannel 0xb0a70 (dbl -1.0), 0xb0a78 (dbl +1.0)
//       - inner-step scale  -> 0.5                       @ProChannel 0xb03c0 (RIP @0x45ce9)
//       - convergence epsilon -> 1e-07                   @ProChannel 0xb03b0 (RIP @0x45d14; u64 0x3e7ad7f29abcaf48)
//       - fabs mask (unused as a double)                 @ProChannel 0xb0390 (RIP @0x45d1c; u128 = 2x 0x7fffffffffffffff)
//       - constant `1.0` loaded on the (target < f(0)) branch
//                                          @ProChannel 0xaf528 (RIP @0x45cc8; u64 0x3ff0000000000000)
//       - iteration cap        -> 32                     @0x45cde  (movl $0x20, %r15d)
//
// Struct layout referenced (NOT owned by this file, transcribed elsewhere):
//   OZSpline+0xa8 -> byte-flag struct ("handle mode"). Byte 0 gates the handles<->tangents scale
//     factor here (12.0 vs 1/3). See re/BEZIER_DECODE.md, re/CURVE_EVAL.md,
//     re/BEZIER_GETCONTROLPOINTS_DECODE.md — those files also read sp->0xa8.
//
// Semantics recap (transcribed, not paraphrased):
//   useTangents() @0x45bf8         : return true (movb $0x1, %al ; ret).
//   convertHandlesToTangents(...)  : divide *t1 and *t2 by the branch scalar (12.0 or 1/3),
//                                    both null-guarded. Divisor picked from sp->0xa8[0].
//   convertTangentsToHandles(...)  : symmetric — multiply *t1 and *t2 by the same branch scalar.
//   interpolate(...) @0x45c88      : return 0.0 (xorps xmm0,xmm0 ; ret). Pure virtual stub —
//                                    subclasses (OZXSplineInterpolator, ...) override *0x18.
//   bisection(rsi, target) @0x45c92: root-finder inverting this->eval2(rsi, u) w.r.t. u.
//                                    Starts at u=0, initial step direction = sign of
//                                    (target - eval2(rsi, 0)), step magnitude halves each iter
//                                    from 0.5 downward, 32-iter cap, early-exit when either the
//                                    step magnitude OR the (eval2(rsi, u) - target) delta drops
//                                    below 1e-7 in absolute value. On overshoot (eval2 result >
//                                    target) reverts u to the pre-step value; else accepts.
//                                    NOTE: the returned value in xmm0 is *the last new_x*
//                                    (rbp-0x30, xmm6) — NOT the last accepted x — as literally
//                                    encoded by `movapd %xmm6, %xmm0` @0x45d6a on every exit path.
//   eval(double*, double) @0x45d7a : virtual, returns 0.0. Called through *0x70 by bisection.
//   eval(OZSpline&, CMTime, void*, void*, double) @0x45d84: composes 3 vtable calls to build a
//                                    local (double[3])-like frame at rbp-0x50, invokes
//                                    convertTangentsToHandles twice (if sp->0xa8[0]==0), then
//                                    calls this->eval(double*, double) @*0x70. All 5 vtable
//                                    slots (*0x40, *0x38, *0x30, *0x18, *0x70) are on undecoded
//                                    peer classes (vA, vB, this) — the 2-arg eval body is 0.0,
//                                    so on a bare OZSplineInterpolator this returns 0.0, but the
//                                    peer-vtable dispatches are un-transcribable without their
//                                    types. Throws with all 5 addrs cited (Rule 3).
//   subDivide(...) @0x45e7a        : return (xorps xmm0,xmm0 was NOT emitted — pure empty body:
//                                    pushq/movq/popq/ret). Effectively a no-op virtual base.
//   ctor  @0x45ba8                 : chain to OZInterpolator::OZInterpolator() (parent, D2 base)
//                                    then install vtable at 0xd6648 into this->[0]. TS: no-op.
//   dtor  @0x45bc8 / @0x45bdc      : chain to OZInterpolator::~OZInterpolator() then (D0 only)
//                                    tail-jump to operator delete. TS: no-op.

import { CMTime } from "../infra/CMTime.js";

// ─── Opaque spline handle — we only touch OZSpline+0xa8[0], the "handle-mode" byte-flag ─────────
// Full OZSpline decode belongs in raw-port/src/channels/OZSpline.ts. See re/BEZIER_DECODE.md and
// re/CURVE_EVAL.md — both read the same +0xa8 struct. The default (bare OZSpline ctor) fills 4
// zero bytes at +0xa8, so `handleMode0 === 0` on a freshly-parsed .motr.
export interface OZSplineOpaque {
  /** OZSpline+0xa8[0] — the byte gating the handles/tangents 12.0 vs 1/3 scale factor.
   *  Read at ProChannel 0x45c0b (convertHandlesToTangents) and 0x45c51 (convertTangentsToHandles). */
  handleMode0?: number;
}

// ─── Un-decoded peer types the 5-arg eval overload dispatches through virtual calls ────────────
// Each callee is a *0xNN vtable slot on an un-decoded class. Faithful port throws (Rule 3).
export interface OZSplineInterp_VBOpaque {
  /** vtable slot *0x40 on vB peer, called with (this, kZero, spline, out_dbl_ref)
   *  @0x45dc6 — writes a CMTime-or-double at out_dbl_ref[-0x48(rbp)]. */
  vslot_0x40?: (...args: unknown[]) => unknown;
  /** vtable slot *0x18 on vB peer, called with (this, spline) @0x45e2a — returns a double. */
  vslot_0x18?: (...args: unknown[]) => number;
}
export interface OZSplineInterp_VCOpaque {
  /** vtable slot *0x38 on vC peer, called with (this, kZero, spline, out_dbl_ref)
   *  @0x45dd8 — writes a CMTime-or-double at out_dbl_ref[-0x40(rbp)]. */
  vslot_0x38?: (...args: unknown[]) => unknown;
  /** vtable slot *0x18 on vC peer, called with (this, spline) @0x45e15 — returns a double. */
  vslot_0x18?: (...args: unknown[]) => number;
}

/**
 * OZSplineInterpolator — base virtual spline interpolator (ProChannel).
 * See file header for the full 13-symbol decode table.
 */
export class OZSplineInterpolator {
  /**
   * OZSplineInterpolator::OZSplineInterpolator()  @ProChannel 0x45ba8.
   * Body (10 emitted insns): saves rbx, calls OZInterpolator::OZInterpolator() (@parent C2),
   * then `leaq 0x90a8b(%rip), %rax; movq %rax, (%rbx)` @0x45bb6 installs vtable 0xd6648. The
   * vptr install has no observable effect in TS (dispatch is by direct method invocation).
   */
  constructor() {
    // @0x45bb1 chain to OZInterpolator::OZInterpolator() — inherited defaults; nothing to init.
  }

  /**
   * OZSplineInterpolator::~OZSplineInterpolator()  @ProChannel 0x45bc8 (D1/D2), 0x45bdc (D0).
   * D1/D2 chain to OZInterpolator::~OZInterpolator(). D0 additionally tail-jumps to
   * operator delete (__ZdlPv @0xace04). No owned resources → no-op in TS.
   */
  destroy(): void {
    // @0x45bc8 / @0x45bdc — chain-to-parent dtor + operator delete. No-op in TS.
  }

  /**
   * useTangents()  @ProChannel 0x45bf8.
   * Body (verbatim): `movb $0x1, %al ; ret`. Unconditional true.
   */
  useTangents(): boolean {
    return true; // @0x45bfc  movb $0x1, %al
  }

  /**
   * convertHandlesToTangents(spline, t1, t2)  @ProChannel 0x45c00.
   * Disasm (17 insns, verbatim structure):
   *   movq  0xa8(spline), rax            ; @0x45c04 — read the handle-mode struct ptr
   *   cmpb  $0x0, (rax)                   ; @0x45c0b — sp->0xa8[0]
   *   jne   0x45c1a                       ; if nonzero -> divisor = 1/3
   *   movsd 0x6a8f8(rip), xmm0 = 12.0     ; @0x45c10 — RIP-const @ProChannel 0xb0510
   *   jmp   0x45c22
   * 0x45c1a:
   *   movsd 0x6ae46(rip), xmm0 = 0.333... ; @0x45c1a — RIP-const @ProChannel 0xb0a68
   * 0x45c22:
   *   testq rdx, rdx / je -> skip         ; if (t1 != null)
   *   movsd (rdx), xmm1 ; divsd xmm0, xmm1 ; movsd xmm1, (rdx)   ; *t1 /= divisor
   *   testq rcx, rcx / je -> ret          ; if (t2 != null)
   *   movsd (rcx), xmm1 ; divsd xmm0, xmm1 ; movsd xmm1, (rcx)   ; *t2 /= divisor
   *   ret
   * Returns void.
   */
  convertHandlesToTangents(
    spline: OZSplineOpaque,
    t1: { value: number } | null,
    t2: { value: number } | null,
  ): void {
    // @0x45c04 movq 0xa8(spline), rax ; @0x45c0b cmpb $0, (rax)
    const mode = spline.handleMode0 ?? 0;
    // @0x45c10  divisor = 12.0     (ProChannel 0xb0510)
    // @0x45c1a  divisor = 1/3      (ProChannel 0xb0a68 = 0x3fd5555555555555)
    const divisor = mode === 0 ? 12.0 : 0.3333333333333333;
    // @0x45c22..0x45c33  if (t1) *t1 /= divisor
    if (t1 !== null) t1.value = t1.value / divisor;
    // @0x45c33..0x45c44  if (t2) *t2 /= divisor
    if (t2 !== null) t2.value = t2.value / divisor;
  }

  /**
   * convertTangentsToHandles(spline, t1, t2)  @ProChannel 0x45c46.
   * Symmetric to convertHandlesToTangents — same branch, divsd swapped for mulsd. Same 2 consts.
   *   sp->0xa8[0]==0 -> factor = 12.0            @ProChannel 0xb0510 (RIP @0x45c56)
   *   sp->0xa8[0]!=0 -> factor = 0.3333...       @ProChannel 0xb0a68 (RIP @0x45c60)
   *   *t1 *= factor if t1 != null ; *t2 *= factor if t2 != null
   * Note: the second `mulsd (%rcx), %xmm0` @0x45c7e reuses xmm0 as accumulator and stores back
   * via `movsd %xmm0, (%rcx)` — but that overwrites xmm0 with the new *t2; irrelevant to callers
   * as the function returns void.
   */
  convertTangentsToHandles(
    spline: OZSplineOpaque,
    t1: { value: number } | null,
    t2: { value: number } | null,
  ): void {
    // @0x45c4a movq 0xa8(spline), rax ; @0x45c51 cmpb $0, (rax)
    const mode = spline.handleMode0 ?? 0;
    // @0x45c56  factor = 12.0     (ProChannel 0xb0510)
    // @0x45c60  factor = 1/3      (ProChannel 0xb0a68)
    const factor = mode === 0 ? 12.0 : 0.3333333333333333;
    // @0x45c68..0x45c79  if (t1) *t1 *= factor
    if (t1 !== null) t1.value = t1.value * factor;
    // @0x45c79..0x45c86  if (t2) *t2 *= factor
    if (t2 !== null) t2.value = t2.value * factor;
  }

  /**
   * interpolate(spline, t, vA, vB, u, fX, fY) — @ProChannel 0x45c88.
   * Body (verbatim): `xorps %xmm0, %xmm0 ; ret`. Base returns 0.0. Subclasses override *0x18.
   */
  interpolate(
    _spline: OZSplineOpaque,
    _t: CMTime,
    _vA: unknown,
    _vB: unknown,
    _u: CMTime,
    _fX: boolean,
    _fY: boolean,
  ): number {
    return 0.0; // @0x45c8c  xorps xmm0, xmm0
  }

  /**
   * eval(_dbl_out, u) — the 2-arg overload, @ProChannel 0x45d7a. Vtable *0x70.
   * Body (verbatim): `xorps %xmm0, %xmm0 ; ret`. Base returns 0.0. bisection() calls
   * `(*this.vtable[*0x70])(this, extra_ptr, u)` — i.e. this method on a bare OZSplineInterpolator
   * instance. Subclasses override to give bisection something to invert.
   *
   * Named eval2 in TS to disambiguate from the 5-arg eval overload; both map to the SAME source
   * name in FCP but different mangled symbols (Ptr vs Ref-based signatures).
   */
  eval2(_out: unknown, _u: number): number {
    return 0.0; // @0x45d7e  xorps xmm0, xmm0
  }

  /**
   * bisection(extraPtr, target)  @ProChannel 0x45c92.
   *
   * Verbatim x86-64 transcription of the 32-iteration monotone step-halving root-finder that
   * inverts `this.eval2(extraPtr, u)` with respect to `u`. The disasm (lines 1..47 of
   * re/disasm/ProChannel.OZSplineInterpolator.bisection.s) maps to the TS below symbol-for-symbol.
   *
   *   Prologue @0x45c92-0x45ca7: rdi=this→r14, rsi=extraPtr→rbx, xmm0=target→[rbp-0x20].
   *   Seed call @0x45caa-0x45cb1: `xmm0 = 0.0 ; call *0x70(this.vtable)` → x0 = this.eval2(extraPtr,0).
   *   Compare @0x45cb4-0x45cc3: xmm0 -= target ; ucomisd 0.0, xmm0 ; setae cl.
   *     cl = 1 iff 0.0 >= (x0 - target)  ↔  target >= x0  ↔  we need to step u upward.
   *   Branch @0x45cc6: if cl set (target >= x0), skip loading xmm1=1.0. Else xmm1 = 1.0.
   *     After this block xmm1 = { target < x0 : 1.0, target >= x0 : 0.0 }. NOTE this is the
   *     STARTING VALUE OF x IN THE SEARCH (not the direction). @0x45cc8 loads 1.0 from
   *     ProChannel 0xaf528 (RIP @0x45cc8+7+0x69858 = 0xaf528, u64 0x3ff0000000000000).
   *   Direction @0x45cd2: `leaq [+0xb0a70](rip), rcx ; movsd (rcx, rax*8), xmm3` where rax=cl.
   *     Table = [-1.0 @0xb0a70, +1.0 @0xb0a78]. So direction = (target >= x0 ? +1.0 : -1.0).
   *
   *   Loop head @0x45ce4-0x45cfe: (32 iters, r15d starts at 32 @0x45cde)
   *     save x                              (movapd xmm1, -0x50(rbp))
   *     step *= 0.5                          (mulsd @ProChannel 0xb03c0, xmm3)
   *     save step                            (movapd xmm3, -0x40(rbp))
   *     new_x = x + step                     (movapd xmm1, xmm0 ; addsd xmm3, xmm0)
   *     save new_x                           (movapd xmm0, -0x30(rbp))
   *     call this.eval2(extraPtr, new_x)     (movq (r14), rax ; call *0x70(rax); xmm0 = result)
   *
   *   Post-call @0x45d0f-0x45d4d:
   *     xmm6 = new_x                         (reload -0x30(rbp))
   *     xmm5 = 1e-7                          (movsd @ProChannel 0xb03b0, xmm5)
   *     xmm4 = fabs-mask (u128 0x7fff…ffff)  (movapd @ProChannel 0xb0390, xmm4)
   *     xmm3 = step, xmm2 = old x (reloads)
   *     if |step| < 1e-7:  break             (andpd xmm4, xmm1=xmm3 ; ucomisd xmm1, xmm5 ; ja exit)
   *     xmm0 = result - target                (subsd -0x20(rbp), xmm0)
   *     if |result - target| < 1e-7: break   (andpd xmm4, xmm1=xmm0 ; ucomisd xmm1, xmm5 ; ja exit)
   *
   *   Blend @0x45d4f-0x45d5c:
   *     xmm1 = 0.0 ; xmm0 = cmpnlesd 0.0, xmm0  → all-ones iff (result - target) > 0.0
   *     xmm1 = new_x ; blendvpd xmm0, xmm2, xmm1
   *     ⇒ if overshoot (result > target): xmm1 = old x (revert)
   *       else:                              xmm1 = new_x (accept)
   *
   *   Loop tail @0x45d61-0x45d64: r15d-- ; jne loop.
   *   Exit @0x45d6a: `movapd %xmm6, %xmm0 ; ret`. Returns *the last new_x*, i.e. -0x30(rbp) as
   *   observed in xmm6 on this iteration — NOT the last accepted x. (Faithfully preserved below.)
   *
   * The step magnitude is halved every iteration and its sign is FIXED by the initial branch —
   * this is pure step-halving, not a signed-error bisection. The starting x is 1.0 iff target<x0,
   * else 0.0. This is FCP's own encoding — do not "clean it up".
   */
  bisection(extraPtr: unknown, target: number): number {
    // Prologue: seed call — @0x45cad-0x45cb1: this.eval2(extraPtr, 0.0)
    let x0 = this.eval2(extraPtr, 0.0);
    // @0x45cb4  x0 -= target       (xmm0 becomes x0 - target)
    x0 = x0 - target;
    // @0x45cbb-0x45cc3  cl = setae(0.0 >= x0 - target)  = (target >= f(0))
    const cl = 0.0 >= x0 ? 1 : 0;
    // @0x45cc6/0x45cc8  starting x = (target < f(0) ? 1.0 : 0.0). 1.0 loaded @ProChannel 0xaf528.
    let x = cl === 0 ? 1.0 : 0.0;
    // @0x45cd2  direction table [ -1.0 @0xb0a70, +1.0 @0xb0a78 ]; index = cl.
    // step magnitude enters the loop pre-halving; first iteration halves to ±0.5.
    let step = cl === 1 ? 1.0 : -1.0;
    // @0x45cde  movl $0x20, %r15d  — iteration cap = 32
    let newX = x;
    for (let i = 0; i < 32; i++) { // @0x45cde ... @0x45d64
      // @0x45ce4  save x (xmm1 -> -0x50(rbp))
      const oldX = x;
      // @0x45ce9  step *= 0.5   (mulsd @ProChannel 0xb03c0)
      step = step * 0.5;
      // @0x45cf1  save step (-0x40(rbp))
      // @0x45cf6-0x45cfa  new_x = x + step
      newX = oldX + step;
      // @0x45cfe  save new_x (-0x30(rbp))
      // @0x45d03-0x45d0c  call *0x70(this.vtable)  →  this.eval2(extraPtr, new_x)
      let result = this.eval2(extraPtr, newX);
      // @0x45d14  xmm5 = 1e-7 (ProChannel 0xb03b0 = 0x3e7ad7f29abcaf48)
      const EPS = 1e-7;
      // @0x45d1c  xmm4 = fabs-mask (ProChannel 0xb0390 = 0x7fffffffffffffff x2); used for |step|,|diff|
      // @0x45d32-0x45d3a  if |step| < 1e-7 : break (ja == unordered/greater ; == EPS > |step|)
      // ucomisd xmm1=|step|, xmm5=EPS ; ja exit  ⇒ EPS > |step|
      if (EPS > Math.abs(step)) break; // @0x45d3a  ja 0x45d6a
      // @0x45d3c  xmm0 = result - target
      result = result - target;
      // @0x45d45-0x45d4d  if |diff| < 1e-7 : break
      if (EPS > Math.abs(result)) break; // @0x45d4d  ja 0x45d6a
      // @0x45d4f-0x45d5c  blend: if diff > 0 (result > target): x = oldX (revert), else x = newX
      //   cmpnlesd 0.0, xmm0  → all-ones iff (result > 0)
      //   blendvpd xmm0, xmm2=oldX, xmm1=newX  → dest bit set ? src : keep
      x = result > 0.0 ? oldX : newX;
      // decl r15d ; jne loop_start
    }
    // @0x45d6a  movapd %xmm6, %xmm0 ; ret  — return the LAST new_x (xmm6 = -0x30(rbp)), not x.
    return newX;
  }

  /**
   * eval(spline, t, vA, vB, u) — 5-arg overload, @ProChannel 0x45d84.
   * Body composes 5 virtual dispatches on 3 different peer classes plus this:
   *   @0x45dc6  vB->vtable[*0x40] (this=r12=vB, arg1=CMTime(0), arg2=spline, out=&local_48) — writes
   *             an object at rbp-0x48. Kind = un-decoded (CMTime? double?).
   *   @0x45dd8  vC->vtable[*0x38] (this=r14=vC, arg1=CMTime(0), arg2=spline, out=&local_40) —
   *             writes rbp-0x40 analogously.
   *   @0x45de5  if spline+0xa8[0] == 0:
   *       @0x45df6   this->vtable[*0x30] = OZSplineInterpolator::convertTangentsToHandles
   *                                        (this, spline, 0, &local_48)   — in-place scale
   *       @0x45e08   this->vtable[*0x30] again on &local_40
   *   @0x45e15  vB->vtable[*0x18] (this=vB, spline) → double added to  local_50[+8]  (accumulator)
   *   @0x45e33  vC->vtable[*0x18] (this=vC, spline) → double added to  local_50[+10] (accumulator)
   *   @0x45e52  this->vtable[*0x70](this, &local_50, xmm0=u_original)   → this.eval2(&local_50, u)
   *
   * On a bare OZSplineInterpolator, eval2 is 0.0-returning, so this call returns 0.0. But the
   * transcription of the peer-vtable dispatches @*0x40, @*0x38, @*0x18 requires the concrete
   * types of vA/vB — NOT decoded yet in this port. Per PORTING_SPEC Rule 3, throw citing all
   * un-decoded addresses. A subclass or resolved peer type is required to remove this throw.
   */
  eval(
    spline: OZSplineOpaque,
    t: CMTime,
    vA: OZSplineInterp_VBOpaque,
    vB: OZSplineInterp_VCOpaque,
    u: number, // @0x45c95 saved xmm0 -> -0x58(rbp)
  ): number {
    // Silence unused-args diagnostic while faithfully preserving the parameter positions.
    void spline; void t; void vA; void vB; void u;
    throw new Error(
      "OZSplineInterpolator::eval(OZSpline&,CMTime,void*,void*,double) @ProChannel 0x45d84 " +
        "not yet transcribed: requires vA vtable *0x40 @ProChannel 0x45dc6, vB vtable *0x38 " +
        "@ProChannel 0x45dd8, vA vtable *0x18 @ProChannel 0x45e15, vB vtable *0x18 " +
        "@ProChannel 0x45e2a, and this->eval2(*0x70) @ProChannel 0x45d7a — the vA/vB peer " +
        "types are undecoded in this port.",
    );
  }

  /**
   * subDivide(spline, t, vA, vB, out)  @ProChannel 0x45e7a.
   * Body (verbatim, 5 insns): `pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; retq`. Pure empty
   * virtual base — no assignment to any out param, no arithmetic. Subclasses (e.g. Bezier) override.
   */
  subDivide(
    _spline: OZSplineOpaque,
    _t: CMTime,
    _vA: unknown,
    _vB: unknown,
    _out: unknown,
  ): void {
    // @0x45e7a — empty body.
  }
}

/**
 * Module-level singleton — mirrors FCP's OZInterpolators registry pattern (see
 * OZBezierInterpolator.ts). OZSplineInterpolator is a base class; the concrete registry slot is
 * typically its OZXSplineInterpolator subclass (vtable *0x100 @ProChannel 0xd66xx points at
 * OZXSplineInterpolator::needInit @0x46f1a). Exposed for parity harnesses that want to exercise
 * the base implementation of useTangents/convertHandlesToTangents/convertTangentsToHandles
 * directly.
 */
export const OZ_SPLINE_INTERPOLATOR = new OZSplineInterpolator();
