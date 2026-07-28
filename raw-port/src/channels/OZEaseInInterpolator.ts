// OZEaseInInterpolator — cosine ease-in keyframe interpolator (ProChannel.framework).
//
// Faithful transcription. Every method mirrors the x86_64 disassembly of the
// live FCP 11 ProChannel binary, branch-for-branch. Vtable @ProChannel 0xd6188
// (see raw-port/army/tools/vtable.py ProChannel OZEaseInInterpolator).
//
// Class-level notes
// -----------------
// * OZEaseInInterpolator has NO instance state of its own: both dtors chain
//   straight to `OZInterpolator::~OZInterpolator()` (D2 @ __ZN14OZInterpolatorD2Ev)
//   with no field cleanup and no vptr shuffle. Identity is entirely via vtable
//   overrides.
// * The class overrides these OZInterpolator slots (vtable @0xd6198):
//     *0x10  init             @0x43906   (empty body; pure prologue+ret)
//     *0x18  interpolate      @0x4339e   (the ease-in cosine value formula)
//     *0x20  subDivide        @0x43562   (dispatch: this->interpolate then rbx.vtable[0x20])
//     *0x60  uForCurveValue   @0x4371c   (inverse of the interpolate formula; time-for-value)
// * Additional non-vtable method (called externally through symbol):
//     0x435ae getMinMaxValues (max/min of endpoint values, with p2 possibly nudged by getSmallDeltaU)
// * All other vtable slots (0x28..0x58, 0x68) inherit OZInterpolator's implementation.
//
// Provenance of the numeric constants (recovered via resolve.py ProChannel const):
//   0xaf528 = 1.0            (used in `1 - cos(...)` and `+= 1.0` for acos)
//   0xb03b8 = π               (3.141592653589793) — half-turn for the cosine ease
//   0xb03c0 = 0.5             (halving factor so cos argument is π/2 * norm_t)
//   0xb05f0 = 2.0             (scale-factor when inverting the cosine ease: 2/π)
//
// Frontier callees (undecoded — each surfaces as a throwing stub citing its addr):
//   - OZSpline::getSmallDeltaU()                       @0x43438  (called by interpolate)
//   - OZSpline vtable[0xf0]                            @0x43756, @0x4376f (uForCurveValue)
//   - "keypoint" vtable[0x18]  (value at CMTime)       @0x433e6, @0x433f7, @0x437bf, @0x437d0,
//                                                     @0x436be, @0x436ed (interpolate, uForCurve,
//                                                     getMinMaxValues)
//   - "keypoint" vtable[0x20]  (set value at CMTime)   @0x435a1 (subDivide)
//   - CMTime operator/(CMTime, CMTime)  __ZdvRK6CMTimeS1_  @0x43506 (interpolate)
//   - CMTime operator/(CMTime, double)  __ZdvRK6CMTimed    @0x43850 (uForCurveValue)
//   - std::vector<CMTime>::push_back                   @0x438c4 (uForCurveValue)
// All of these throw with their @0xADDR when reached (Rule 3, decode-don't-guess).

import {
  CMTime,
  CMTimeCompare,
  CMTimeGetSeconds,
  CMTimeMul_double,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
  kCMTimeZero,
} from "../infra/CMTime.js";

// ─── polymorphic "keypoint-like" argument used by interpolate/subDivide/uForCurveValue ────────
//
// The C++ signatures spell these arguments as `void*`. The asm treats each as
// an object with a vtable at offset 0 and a `CMTime` at offset +0x10 (24 bytes):
//   +0x00      vtable*
//   +0x10      CMTime (value:i64, timescale:i32, flags:u32, epoch:i64)     [24 bytes]
//   vtable[0x18]  double (*)(this, CMTime const&)   ; "value at time"
//   vtable[0x20]  void   (*)(this, CMTime const&, double)  ; "set value at time" (subDivide)
//
// This is the OZ keypoint/vertex ABI. We accept the two virtuals as injected callbacks so
// this class does NOT invent a concrete keypoint decode; the specific vtable target depends
// on the concrete subclass and is a separate porting job.
export interface EaseInKeyframeLike {
  /** CMTime at struct offset +0x10 (24 bytes). See @0x433cc/@0x433c4 in interpolate. */
  time: CMTime;

  /**
   * Virtual at vtable slot 0x18. Signature: `double (this, CMTime const&)`.
   * `interpolate` / `uForCurveValue` call this with the current time to obtain the
   * scalar value from the keypoint. Un-decoded across the codebase for arbitrary
   * concrete subclasses — the caller MUST inject the real implementation.
   */
  valueAtTime?: (t: CMTime) => number;

  /**
   * Virtual at vtable slot 0x20. Signature: `void (this, CMTime const&, double)`.
   * `subDivide` calls this to store the interpolated value into the destination
   * keypoint. Un-decoded — caller injects.
   */
  setValueAtTime?: (t: CMTime, v: number) => void;
}

// OZSpline is used only via a tiny slice of methods; we accept an opaque handle here that
// exposes the ones we actually invoke. Its full decode belongs in raw-port/src/channels/OZSpline.ts.
export interface OZSplineOpaque {
  /**
   * Virtual at OZSpline vtable slot 0xf0. Signature (per the asm register-usage):
   *   `double (this, CMTime const& time, CMTime const& baseline, i32 flag)`
   * uForCurveValue calls this with (spline, t1, kCMTimeZero, 0) and (spline, t2, kCMTimeZero, 0).
   * Un-decoded — caller injects.
   * @see @0x43756, @0x4376f (raw-port/re/disasm/ProChannel.OZEaseInInterpolator.uForCurveValue.s)
   */
  sample?: (t: CMTime, baseline: CMTime, flag: number) => number;

  /**
   * OZSpline::getSmallDeltaU() — returns a small CMTime used to nudge equal-U keypoints apart.
   * Un-decoded (@__ZNK8OZSpline14getSmallDeltaUEv). Callers to `interpolate` may supply this
   * so the degenerate `p1.time >= p2.time` branch can complete faithfully.
   * @see @0x43438 (raw-port/re/disasm/ProChannel.OZEaseInInterpolator.interpolate.s)
   */
  getSmallDeltaU?: () => CMTime;
}

// ── undecoded infra: CMTime operators not present in raw-port/src/infra/CMTime.ts ─────────────
//
// Rule 3: throw citing the @0xADDR. If/when raw-port/src/infra/CMTime.ts grows these, delete
// these local stubs and import the real port; do NOT approximate here.

/**
 * `CMTime operator/(CMTime const&, CMTime const&)`  __ZdvRK6CMTimeS1_
 * Used by OZEaseInInterpolator::interpolate @0x43506.
 */
function __CMTimeDiv_CMTime_UNDECODED(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "OZEaseInInterpolator: __ZdvRK6CMTimeS1_ (CMTime/CMTime) not yet transcribed " +
      "— undecoded frontier @0x43506 (raw-port/re/disasm/" +
      "ProChannel.OZEaseInInterpolator.interpolate.s). Port it in raw-port/src/infra/CMTime.ts.",
  );
}

/**
 * `CMTime operator/(CMTime const&, double)`  __ZdvRK6CMTimed
 * Used by OZEaseInInterpolator::uForCurveValue @0x43850.
 */
function __CMTimeDiv_double_UNDECODED(_a: CMTime, _s: number): CMTime {
  throw new Error(
    "OZEaseInInterpolator: __ZdvRK6CMTimed (CMTime/double) not yet transcribed " +
      "— undecoded frontier @0x43850 (raw-port/re/disasm/" +
      "ProChannel.OZEaseInInterpolator.uForCurveValue.s). Port it in raw-port/src/infra/CMTime.ts.",
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * OZEaseInInterpolator — cosine ease-in keyframe interpolator subclass.
 *
 * Base class: OZInterpolator (dtors chain to __ZN14OZInterpolatorD2Ev).
 */
export class OZEaseInInterpolator {
  /**
   * OZEaseInInterpolator::~OZEaseInInterpolator()  @0x000438e0 (D1) / @0x000438ea (D0)
   *
   * Faithful asm mirror (both are trivial delegations to OZInterpolator's D2):
   *   D1  @0x438e0  push rbp; mov rsp,rbp; pop rbp; jmp __ZN14OZInterpolatorD2Ev
   *   D0  @0x438ea  push rbp; mov rsp,rbp; push rbx; push rax; mov rdi,rbx;
   *                 call __ZN14OZInterpolatorD2Ev; mov rbx,rdi; ...; jmp __ZdlPv
   * No fields cleaned up, no vptr manipulation.
   */
  destroy(): void {
    // OZInterpolator::~OZInterpolator() D2 is trivial in every decoded sibling
    // (linear/ease/ease-out share the same base). Modelled as a no-op here; JS
    // garbage collector handles the operator delete in the D0 variant.
  }

  /**
   * OZEaseInInterpolator::init(OZSpline&, CMTime const&)  @0x00043906
   *
   * Faithful asm mirror — the body is EMPTY:
   *   0x43906  pushq %rbp
   *   0x43907  movq  %rsp, %rbp
   *   0x4390a  popq  %rbp
   *   0x4390b  retq
   *
   * (Override of OZInterpolator vtable slot 0x10; the ease-in class has no
   *  per-call initialization state to prime.)
   */
  init(_spline: OZSplineOpaque, _t: CMTime): void {
    // no body
  }

  /**
   * OZEaseInInterpolator::interpolate(OZSpline&, CMTime const& t, void* p1, void* p2,
   *                                    CMTime const& targetTime, bool fA, bool fB)
   *   -> double
   *   @0x0004339e   (vtable slot *0x18)
   *
   * Formula recovered from the asm:
   *     v1        = p1->vtable[0x18](t)                      @0x433e6
   *     v2        = p2->vtable[0x18](t)                      @0x433f7
   *     tA        = p1.time                                   (from +0x10 of p1)
   *     tB        = p2.time                                   (from +0x10 of p2)
   *     if CMTimeCompare(tA, tB) > 0:                        @0x43422
   *         tB = tA + OZSpline::getSmallDeltaU()             @0x43438..@0x43464
   *     dtNum     = targetTime - tA                          @0x434ac  (PC_CMTimeSaferSubtract)
   *     dtNum_pi  = dtNum * π                                @0x434c6  (__ZmlRK6CMTimed, xmm0=π)
   *     dtDen     = tB - tA                                  @0x434f8  (PC_CMTimeSaferSubtract)
   *     q         = dtNum_pi / dtDen                         @0x43506  (__ZdvRK6CMTimeS1_)
   *     f         = CMTimeGetSeconds(q) * 0.5                @0x4351e, @0x43523 (mulsd 0.5)
   *     c         = cos(f)                                   @0x4352b
   *     return v1 + (v2 - v1) * (1.0 - c)                    @0x43530..@0x43552
   *
   * Note the argument-order convention for _PC_CMTimeSaferSubtract used by the asm:
   *   stack[0..0x18]   = first  operand  (a)
   *   stack[0x18..0x30] = second operand (b)
   *   out    = a - b
   * (Two calls in this function: `targetTime - tA` and `tB - tA`.)
   *
   * The `fA`, `fB` bool args on stack are UNUSED in this override — the asm never reads
   * them. They exist for signature parity with the OZLinearInterpolator interpolate slot.
   */
  static interpolate(
    spline: OZSplineOpaque,
    _t: CMTime,               // rdx  — this "t" is passed to p1/p2 valueAtTime; see @0x433e3
    p1: EaseInKeyframeLike,   // rcx
    p2: EaseInKeyframeLike,   // r8
    targetTime: CMTime,       // r9  — the actual query time for the ease
    _fA: boolean,             // stack — unread
    _fB: boolean,             // stack — unread
  ): number {
    // @0x433dd..@0x433e9 — v1 = p1->vtable[0x18](t)
    if (!p1.valueAtTime) {
      throw new Error(
        "OZEaseInInterpolator.interpolate: p1.valueAtTime not injected — undecoded " +
          "virtual dispatch @0x433e6 (vtable *0x18 of p1)",
      );
    }
    // @0x433ee..@0x433fa — v2 = p2->vtable[0x18](t)
    if (!p2.valueAtTime) {
      throw new Error(
        "OZEaseInInterpolator.interpolate: p2.valueAtTime not injected — undecoded " +
          "virtual dispatch @0x433f7 (vtable *0x18 of p2)",
      );
    }
    // NOTE: The asm passes %rdx (the 2nd CMTime arg, i.e. `t`) as `rsi` to both vtable calls.
    // In OZ's live use the same `t` is used for both keyframes at this virtual.
    const v1 = p1.valueAtTime(_t);
    const v2 = p2.valueAtTime(_t);

    // Local copies of p1.time / p2.time (@0x433bc..@0x433d9).
    let tA: CMTime = p1.time;
    let tB: CMTime = p2.time;

    // @0x43422 — CMTimeCompare(tA, tB); jle skips the nudge.
    if (CMTimeCompare(tA, tB) > 0) {
      // Degenerate: p1.time >= p2.time. Nudge tB = tA + getSmallDeltaU.  @0x43438..@0x43464
      if (!spline.getSmallDeltaU) {
        throw new Error(
          "OZEaseInInterpolator.interpolate: OZSpline::getSmallDeltaU not injected " +
            "— undecoded frontier @0x43438 (__ZNK8OZSpline14getSmallDeltaUEv). " +
            "Required only when p1.time > p2.time.",
        );
      }
      const delta = spline.getSmallDeltaU();
      // @0x43464 — _PC_CMTimeSaferAdd(&tB_local, first=tA, second=delta) ⇒ tB = tA + delta
      tB = PC_CMTimeSaferAdd(tA, delta);
    }

    // @0x43483..@0x434ac — dtNum = targetTime - tA
    // Stack setup: (rsp+0..+0x18)=targetTime, (rsp+0x18..+0x30)=tA
    //   PC_CMTimeSaferSubtract(out, a=targetTime, b=tA) ⇒ out = targetTime - tA
    const dtNum: CMTime = PC_CMTimeSaferSubtract(targetTime, tA);

    // @0x434b8..@0x434c6 — dtNum_pi = dtNum * π
    //   xmm0 = *0xb03b8 = π
    //   __ZmlRK6CMTimed(dtNum, π) → CMTime
    const dtNum_pi: CMTime = CMTimeMul_double(dtNum, Math.PI);

    // @0x434e6..@0x434f8 — dtDen = tB - tA
    // Stack: (rsp)=tB, (rsp+0x18)=tA ⇒ out = tB - tA
    const dtDen: CMTime = PC_CMTimeSaferSubtract(tB, tA);

    // @0x43506 — CMTime / CMTime is UNDECODED (__ZdvRK6CMTimeS1_).
    // Faithful surface: throwing stub cites the addr. Downstream consumers of interpolate
    // may inject a decode later; nothing in this file may deviate from the disasm.
    const q: CMTime = __CMTimeDiv_CMTime_UNDECODED(dtNum_pi, dtDen);

    // @0x4351e..@0x43523 — f = seconds(q) * 0.5   (mulsd 0.5 from *0xb03c0)
    const f = CMTimeGetSeconds(q) * 0.5;

    // @0x4352b — c = cos(f)   (libm `cos`; scalar double).
    const c = Math.cos(f);

    // @0x43530..@0x43552 — v1 + (v2 - v1) * (1 - c)
    //   xmm1 = 1.0 (from *0xaf528); xmm1 -= c; xmm0 = v2-v1; xmm0 *= xmm1; xmm0 += v1
    return v1 + (v2 - v1) * (1.0 - c);
  }

  /**
   * OZEaseInInterpolator::subDivide(OZSpline&, CMTime const& t, void* p1, void* p2, void* dst)
   *   @0x00043562   (vtable slot *0x20)
   *
   * Faithful asm mirror:
   *   1. copy dst.time (dst[+0x10..+0x28]) into a local scratch CMTime (r9 target); @0x43573..@0x43587
   *   2. push two zeros as the last two bool args on the stack;                     @0x4358d, @0x4358f
   *   3. call this->vtable[0x18] with (this, spline, t, p1, p2, &scratch_time)      @0x43591
   *        — i.e. `value = this->interpolate(spline, t, p1, p2, dst.time, 0, 0)`
   *   4. call dst->vtable[0x20](t, value)                                            @0x435a1
   *        — i.e. `dst.setValueAtTime(t, value)` (writes back)
   *
   * The `xmm0` (result of interpolate) is preserved across `addq $0x10, %rsp` and passed
   * as the FP arg to dst.vtable[0x20].
   */
  subDivide(
    spline: OZSplineOpaque,
    t: CMTime,
    p1: EaseInKeyframeLike,
    p2: EaseInKeyframeLike,
    dst: EaseInKeyframeLike,
  ): void {
    // Step 3 — value = this->interpolate(spline, t, p1, p2, dst.time, false, false)
    const value = OZEaseInInterpolator.interpolate(
      spline,
      t,
      p1,
      p2,
      dst.time,
      false, // pushq %r10 (r10=0) @0x4358d
      false, // pushq %r10 (r10=0) @0x4358f
    );
    // Step 4 — dst->vtable[0x20](t, value)   @0x435a1
    if (!dst.setValueAtTime) {
      throw new Error(
        "OZEaseInInterpolator.subDivide: dst.setValueAtTime not injected " +
          "— undecoded virtual dispatch @0x435a1 (vtable *0x20 of dst)",
      );
    }
    dst.setValueAtTime(t, value);
  }

  /**
   * OZEaseInInterpolator::uForCurveValue(OZSpline&, void* p1, void* p2,
   *                                       CMTime const& t1, CMTime const& t2,
   *                                       double target,
   *                                       std::vector<CMTime>& out)
   *   -> bool
   *   @0x0004371c   (vtable slot *0x60)
   *
   * Inverse of interpolate: given a target VALUE, find the CMTime `u` such that
   *   interpolate(u) == target
   * and (if it exists in the interior) append that CMTime to `out`.
   *
   * Algorithm from the asm:
   *     s1        = spline.vtable[0xf0](t1, kCMTimeZero, 0)         @0x43756
   *     s2        = spline.vtable[0xf0](t2, kCMTimeZero, 0)         @0x4376f
   *     hi        = max(s2, s1)                                       @0x4377e
   *     lo        = min(s2, s1)                                       @0x43782
   *     inRange   = (target >= lo) && (hi >= target)                  @0x4378b..@0x437a4
   *     if !inRange: return false                                     @0x437a4 (je 0x438c9)
   *
   *     v1        = p1->vtable[0x18](kCMTimeZero)                     @0x437bf
   *     v2        = p2->vtable[0x18](kCMTimeZero)                     @0x437d0
   *     dtDen     = p2.time - p1.time                                @0x4381c
   *     dtDen_2   = dtDen * 2.0                                       @0x43836  (xmm0=*0xb05f0=2.0)
   *     scale     = dtDen_2 / π                                       @0x43850  (__ZdvRK6CMTimed)
   *     r         = (v1 - target) / (v2 - v1) + 1.0                  @0x43855..@0x4386c
   *                 == (v2 - target) / (v2 - v1)
   *     a         = acos(r)                                           @0x43874
   *     dt        = scale * a                                         @0x43883  (__ZmlRK6CMTimed)
   *     u         = p1.time + dt                                     @0x438b9  (PC_CMTimeSaferAdd)
   *     out.push_back(u)                                              @0x438c4
   *     return true
   *
   * The p1/p2 objects' vtable[0x18] is called with `kCMTimeZero` here (unlike interpolate,
   * which uses `t`) — the value is treated as the constant scalar stored on the keypoint.
   */
  uForCurveValue(
    spline: OZSplineOpaque,
    p1: EaseInKeyframeLike,
    p2: EaseInKeyframeLike,
    t1: CMTime,
    t2: CMTime,
    target: number,
    out: CMTime[],
  ): boolean {
    // Range test using OZSpline vtable[0xf0].
    if (!spline.sample) {
      throw new Error(
        "OZEaseInInterpolator.uForCurveValue: OZSpline vtable[0xf0] (sample) not injected " +
          "— undecoded frontier @0x43756/@0x4376f " +
          "(raw-port/re/disasm/ProChannel.OZEaseInInterpolator.uForCurveValue.s)",
      );
    }
    // @0x43741..@0x4375c
    const s1 = spline.sample(t1, kCMTimeZero, 0);
    // @0x43761..@0x43775
    const s2 = spline.sample(t2, kCMTimeZero, 0);

    // @0x4377e/0x43782 — maxsd/minsd (IEEE-754 max/min of the two ordered operands).
    // For finite operands `Math.max`/`Math.min` reproduce the asm exactly.
    const hi = Math.max(s2, s1);
    const lo = Math.min(s2, s1);

    // @0x4378b..@0x437a4 — cmpnltsd is "NOT less than" (i.e. >=). AND both bits.
    const inRange = target >= lo && hi >= target;
    if (!inRange) return false;

    // @0x437ae..@0x437d3 — v1, v2 sampled at kCMTimeZero via keypoint vtable[0x18].
    if (!p1.valueAtTime) {
      throw new Error(
        "OZEaseInInterpolator.uForCurveValue: p1.valueAtTime not injected " +
          "— undecoded virtual dispatch @0x437bf (vtable *0x18 of p1)",
      );
    }
    if (!p2.valueAtTime) {
      throw new Error(
        "OZEaseInInterpolator.uForCurveValue: p2.valueAtTime not injected " +
          "— undecoded virtual dispatch @0x437d0 (vtable *0x18 of p2)",
      );
    }
    const v1 = p1.valueAtTime(kCMTimeZero);
    const v2 = p2.valueAtTime(kCMTimeZero);

    // @0x437d8..@0x4381c — dtDen = p2.time - p1.time
    // Stack conv: (rsp)=p2.time, (rsp+0x18)=p1.time ⇒ subtract → p2.time - p1.time.
    const dtDen: CMTime = PC_CMTimeSaferSubtract(p2.time, p1.time);

    // @0x43828..@0x43836 — dtDen_2 = dtDen * 2.0   (xmm0 = *0xb05f0 = 2.0)
    const dtDen_2: CMTime = CMTimeMul_double(dtDen, 2.0);

    // @0x43842..@0x43850 — scale = dtDen_2 / π   (xmm0 = *0xb03b8 = π; __ZdvRK6CMTimed)
    const scale: CMTime = __CMTimeDiv_double_UNDECODED(dtDen_2, Math.PI);

    // @0x43855..@0x4386c — r = ((v1 - target) / (v2 - v1)) + 1.0
    // Faithful asm sequence: xmm0=v1; xmm1=v2; xmm1-=xmm0=(v2-v1); xmm0-=target=(v1-target);
    //                        xmm0/=xmm1; xmm0+=1.0 (*0xaf528).
    const r = (v1 - target) / (v2 - v1) + 1.0;

    // @0x43874 — a = acos(r)
    const a = Math.acos(r);

    // @0x43879..@0x43883 — dt = scale * a   (__ZmlRK6CMTimed)
    const dt: CMTime = CMTimeMul_double(scale, a);

    // @0x43888..@0x438b9 — u = p1.time + dt   (PC_CMTimeSaferAdd; stack: (rsp)=dt, (rsp+0x18)=p1.time)
    // Convention: SaferAdd(out, a, b) ⇒ out = a + b, so u = dt + p1.time = p1.time + dt.
    const u: CMTime = PC_CMTimeSaferAdd(dt, p1.time);

    // @0x438c4 — out.push_back(u)
    out.push(u);
    return true;
  }

  /**
   * OZEaseInInterpolator::getMinMaxValues(OZSpline&, void* p1, void* p2,
   *                                        CMTime const& t1, CMTime const& t2,
   *                                        double* outMin, double* outMax)
   *   @0x000435ae
   *
   * Not on the vtable, but reachable via the mangled symbol directly. Faithful asm mirror:
   *
   *   1. Local A = t1, Local B = p2.time                                    @0x435d2..@0x43601
   *   2. if CMTimeCompare(t1, p2.time) > 0:                                  @0x43628
   *          Local A = p2.time                                              @0x43631..@0x4363d
   *   3. Local C = t2                                                        @0x43641..@0x4364e
   *   4. if CMTimeCompare(p1.time, t2) < 0:                                  @0x43677 (jns skips)
   *          Local B = t2                                                   @0x43680..@0x4368e
   *   5. outMin = this->interpolate(spline, LocalA, p1, p2, LocalB, 0, 0)   @0x436a0..@0x436be
   *   6. outMax = this->interpolate(spline, LocalA, p1, p2, LocalC, 0, 0)   @0x436c9..@0x436ed
   *   7. if outMin > outMax: swap                                            @0x436fc..@0x43706
   *
   * The two vtable calls at *0x18 resolve back to OZEaseInInterpolator::interpolate above
   * (the class has no further subclass in the FCP binary that overrides *0x18 on this branch).
   * Register map at each interpolate call:
   *     rdi = this, rsi = OZSpline&, rdx = LocalA (CMTime&), rcx = p1, r8 = p2,
   *     r9 = LocalB or LocalC (CMTime&); stack[0..0x10] = two `false` bools.
   */
  getMinMaxValues(
    spline: OZSplineOpaque,
    p1: EaseInKeyframeLike,
    p2: EaseInKeyframeLike,
    t1: CMTime,
    t2: CMTime,
  ): { min: number; max: number } {
    // -0x80/-0x70 (Local A) starts as t1.
    let localA: CMTime = t1;
    // -0x60/-0x50 (Local B) starts as p2.time.
    let localB: CMTime = p2.time;

    // @0x43628..@0x4363d — CMTimeCompare(t1, p2.time) > 0 ⇒ Local A = p2.time.
    if (CMTimeCompare(t1, p2.time) > 0) {
      localA = p2.time;
    }

    // @0x43641..@0x4364e — Local C = t2.
    const localC: CMTime = t2;

    // @0x43677 — CMTimeCompare(p1.time, t2); jns (>=0) skips the reload.
    if (CMTimeCompare(p1.time, t2) < 0) {
      localB = t2;
    }

    // @0x436a0..@0x436be — outMin = this->interpolate(spline, LocalA, p1, p2, LocalB, 0, 0).
    const minCandidate = OZEaseInInterpolator.interpolate(
      spline,
      localA,   // rdx = "t" fed to keypoint valueAtTime
      p1,
      p2,
      localB,   // r9 = ease query time
      false,
      false,
    );

    // @0x436c9..@0x436ed — outMax = this->interpolate(spline, LocalA, p1, p2, LocalC, 0, 0).
    const maxCandidate = OZEaseInInterpolator.interpolate(
      spline,
      localA,
      p1,
      p2,
      localC,
      false,
      false,
    );

    // @0x436f8..@0x43706 — if minCandidate > maxCandidate, swap.
    if (minCandidate > maxCandidate) {
      return { min: maxCandidate, max: minCandidate };
    }
    return { min: minCandidate, max: maxCandidate };
  }
}
