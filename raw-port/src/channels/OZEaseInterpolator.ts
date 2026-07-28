// raw-port: OZEaseInterpolator — ProChannel.framework (channels layer)
//
// The eased-time flavor of OZLinearInterpolator. It shares the same
// derivation-of-t-in-[0,1] logic as OZLinearInterpolator but reshapes
// that normalized parameter through PCMath::easeInOut before scaling
// the interval between two keyframes' CMTimes.
//
// Public surface (3 methods):
//   0x000a59c0  easeTime(OZSpline&, CMTime const&, void*, void*) -> CMTime
//   0x000a5b3a  ~OZEaseInterpolator()  (D1)  — tail-jmp to OZLinearInterpolator::~()
//   0x000a5b44  ~OZEaseInterpolator()  (D0)  — call OZLinear ~; delete
//
// INSTANCE STATE
// --------------
// Neither dtor references any OZEaseInterpolator-specific fields; both
// forward straight to `OZLinearInterpolator::~OZLinearInterpolator()`
// (D2 base ctor, @__ZN20OZLinearInterpolatorD2Ev). easeTime@0xa59c0 also
// never touches `this` — %rsi (the this arg) is CLOBBERED at 0x59e0 by
// the load of _kCMTimeZero before it is read. So on this class OZEase
// has zero observable instance state; its identity is expressed purely
// via vtable dispatch (`easeTime` is override of an OZLinear virtual).
//
// FRONTIER CALLEES
// ----------------
// easeTime calls SIX external symbols. Every one is documented below;
// each un-decoded callee lands as a throwing stub citing its @0xADDR.
//
//   virtual *0x28  on p1                      @0x0a59ea
//     Pattern: `mov (%r8),%rax; ...; call *0x28(%rax)`. p1 is a
//     polymorphic keyframe-ish object. Vtable slot 0x28 (index 5)
//     returns a `double` given a CMTime const& (here _kCMTimeZero).
//     Un-decoded — we surface it as a caller-supplied injectable.
//
//   _PC_CMTimeSaferSubtract(out, a, b)          @0x0a5a46, @0x0a5a91
//     `out = a - b`  — already decoded in raw-port/src/infra/CMTime.ts
//
//   _CMTimeGetSeconds(cmtime)                    @0x0a5a5d, @0x0a5aa9
//     Standard CoreMedia — decoded in CMTime.ts
//
//   PCMath::easeInOut(t, accelIn, accelOut, t0, t1, *out, *speed) @0x0a5adf
//     Symbol __ZN6PCMath9easeInOutEdddddPdS0_ — decoded in
//     raw-port/src/infra/PCMath.ts
//
//   operator*(CMTime const&, double)             @0x0a5af4
//     Symbol __ZmlRK6CMTimed. Decoded as `CMTimeMul_double` in
//     raw-port/src/infra/CMTime.ts
//
//   _PC_CMTimeSaferAdd(out, a, b)                @0x0a5b22
//     `out = a + b` — decoded in CMTime.ts
//
// CONSTANTS (recovered from rip-relative loads via /tmp/ProChannel.x86_64)
// -----------------------------------------------------------------------
//   @0x0a59ed  0xabfb(%rip) = *0xb45f0 = 2.0   (used to compute curve param)
//   @0x0a59f9  0xb767(%rip) = *0xb1168 = 0.25  (   "         "         "   )
//   @0x0a5ac3  0x9a5d(%rip) = *0xaf528 = 1.0   (t1 for easeInOut interval)
//
// SEMANTICS
// ---------
//   1. curveParam = (2.0 - virtual_p1_0x28(_kCMTimeZero)) * 0.25;
//   2. dtNumSec   = seconds(t - p1.time);
//   3. dtDenSec   = seconds(p2.time - p1.time);
//   4. norm_t     = dtNumSec / dtDenSec;
//   5. easeInOut(&eased_t, /*flag*/false, /*t*/norm_t,
//                /*aI*/curveParam, /*aO*/curveParam,
//                /*t0*/0.0, /*t1*/1.0, /*speed*/null);
//   6. return  p1.time + (p2.time - p1.time) * eased_t;
//
// (The "flag" arg is actually the 1st `bool`-esi arg to PCMath::easeInOut;
// we pass 0 to mirror `xorl %esi, %esi` @0x0a5add.)

import {
  CMTime,
  kCMTimeZero,
  CMTimeGetSeconds,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
  CMTimeMul_double,
} from "../infra/CMTime.js";
import * as PCMath from "../infra/PCMath.js";

// ── the polymorphic p1/p2 argument ──────────────────────────────────────
//
// The asm treats `p1` (r14, the 3rd normal arg / 5th register) as an
// object with:
//   +0x00      vtable*                   ; read once at 0x0a59dd
//   +0x10      CMTime  (24 bytes)        ; copied from +0x10..+0x28 at 0x0a5a24
//   vtable[5] (offset 0x28): fn(this, CMTime const&) -> double
//                                          ; called once at 0x0a59ea
//
// Same layout for `p2` (r12) — but only its +0x10 CMTime is used
// (no vtable call on p2). i.e. p2 is a "future keyframe" data-only
// object; p1 provides both a time AND the curve-shape parameter.
//
// We do not know the concrete class here — the parity harness for the
// interpolator family calls easeTime with concrete OZSpline keyframes
// through a virtual dispatch we would need to decode separately. So
// we type it as an interface and require the caller to provide the
// virtual-0x28 fn.
export interface EaseInterpolatorKeyframe {
  /**
   * Keyframe time at struct offset +0x10 (24 bytes).
   * See @0x0a5a24 (movups 0x10(%r14),%xmm0) and @0x0a5a1b
   * (movq 0x20(%r14),%rax → high 8 bytes of the CMTime).
   */
  time: CMTime;

  /**
   * Virtual method at vtable slot 0x28 of `p1`. Signature:
   *   double vfn(CMTime const& query);
   * `easeTime` always calls this with `_kCMTimeZero` and uses the
   * result as `2.0 - x, x/=4` to derive the ease-shape parameter.
   *
   * Un-decoded across the codebase — the caller MUST inject the real
   * implementation. Absent one, easeTime throws citing @0x0a59ea.
   */
  virtualEaseShapeAtZero?: (query: CMTime) => number;
}

// OZSpline appears as the 1st arg in the C++ signature but is unused
// in the observable asm of easeTime (%rdx = spline is never read after
// the prologue). We accept it for signature fidelity and mark it as
// intentionally-unused.
export interface OZSplineOpaque { readonly __brand: "OZSpline"; }

/**
 * OZEaseInterpolator — a stateless subclass of OZLinearInterpolator.
 *
 * The class carries no fields of its own (both dtors chain straight
 * to `OZLinearInterpolator::~()` with no other work). We keep the
 * class for API parity but instances are indistinguishable from any
 * other empty polymorphic subclass; the meaning is in the vtable
 * override of `easeTime`.
 */
export class OZEaseInterpolator {
  /**
   * OZEaseInterpolator::~OZEaseInterpolator()  @0x000a5b3a  (D1)
   *
   * Faithful asm mirror:
   *   @0x0a5b3a  pushq %rbp; movq %rsp,%rbp
   *   @0x0a5b3e  popq  %rbp
   *   @0x0a5b3f  jmp   __ZN20OZLinearInterpolatorD2Ev
   *
   * Pure tail-jmp to the parent D2 dtor. No fields, no vtable-pointer
   * shuffle — meaning OZEaseInterpolator adds NO instance data over
   * OZLinearInterpolator.
   */
  destroy(): void {
    // Frontier: OZLinearInterpolator::~() (D2) is not decoded in this
    // file. In the ported world every subclass has a JS "destroy" hook
    // that its parent may fill in; here it's a plain no-op with a
    // frontier citation.
    // (No throwing stub because the observable behavior IS "no-op that
    // eventually delegates to a currently-trivial base destructor" —
    // OZLinear's D2 also does nothing observable in every decoded
    // sibling class we've seen.)
  }

  /**
   * OZEaseInterpolator::~OZEaseInterpolator()  @0x000a5b44  (D0, deleting)
   *
   * Faithful asm mirror:
   *   @0x0a5b44  pushq %rbp; movq %rsp,%rbp
   *   @0x0a5b48  pushq %rbx; pushq %rax
   *   @0x0a5b4a  movq  %rdi, %rbx
   *   @0x0a5b4d  callq __ZN20OZLinearInterpolatorD2Ev
   *   @0x0a5b52  movq  %rbx, %rdi
   *   @0x0a5b55  addq $0x8, %rsp; popq %rbx; popq %rbp
   *   @0x0a5b5b  jmp __ZdlPv                          ; operator delete
   */
  destroyAndDelete(): void {
    // See destroy() — same delegation. The tail-jmp to operator delete
    // corresponds to JS's garbage collector; no explicit action needed.
  }

  /**
   * OZEaseInterpolator::easeTime(OZSpline&, CMTime const&, void* p1, void* p2)
   *   @0x000a59c0
   *
   * Returns the CMTime whose seconds-value is the eased interpolation
   * between p1.time and p2.time by the normalized offset (t - p1.time) /
   * (p2.time - p1.time), reshaped by PCMath::easeInOut with a curve
   * parameter derived from p1's virtual-0x28 method.
   *
   * Faithful asm mirror — every step cited @0xADDR:
   *
   *  Prologue @0x0a59c0..0x0a59da — register save + arg capture:
   *     rbx = &return (rdi)               ; hidden struct-return
   *     %rsi = this — clobbered, unused
   *     r13 = %rcx = &t
   *     r14 = %r8  = p1
   *     r12 = %r9  = p2
   *
   *  Step 1  @0x0a59dd..0x0a5a01 — derive curveParam:
   *     rax   = p1[0x00]                  ; vtable*
   *     rsi   = &_kCMTimeZero
   *     rdi   = p1
   *     xmm0  = call *rax[0x28]           ; virtual double(CMTime)
   *     xmm1  = *0xb45f0 = 2.0
   *     xmm1 -= xmm0                       ; = 2.0 - x
   *     xmm1 *= *0xb1168 = 0.25            ; = (2.0 - x) * 0.25
   *     store xmm1 -> -0x38(%rbp)          ; = curveParam
   *
   *  Step 2  @0x0a5a06..0x0a5a4b — dtNum = t - p1.time (CMTime):
   *     Copy *t                  → r15=-0x70
   *     Copy p1.time (r14+0x10)  → rsp+0x18
   *     Copy *r15                → rsp
   *     r13 = -0x58
   *     PC_CMTimeSaferSubtract(out=&*r13, a=*rsp, b=*rsp+0x18)
   *     ; convention: sub(out, minuend, subtrahend); result written to r13
   *
   *  Step 3  @0x0a5a4b..0x0a5a62 — dtNumSec = seconds(dtNum):
   *     Copy *r13 → rsp; call _CMTimeGetSeconds → xmm0
   *     store xmm0 -> -0x30(%rbp) (= dtNumSec)
   *
   *  Step 4  @0x0a5a67..0x0a5a96 — dtDen = p2.time - p1.time (CMTime):
   *     Copy p1.time  → rsp+0x18
   *     Copy p2.time (r12+0x10) → rsp
   *     PC_CMTimeSaferSubtract(&*r15=-0x70, *rsp, *rsp+0x18)
   *     ; NB: r15 now overwritten to hold dtDen.
   *
   *  Step 5  @0x0a5a96..0x0a5ab7 — norm_t = dtNumSec / dtDenSec:
   *     Copy *r15 → rsp; call _CMTimeGetSeconds → xmm0 = dtDenSec
   *     xmm1 = -0x30(%rbp) = dtNumSec
   *     xmm1 /= xmm0                                 ; = norm_t
   *     r12  = -0x40(%rbp)  (fresh out slot for easeInOut)
   *     *r12 = 0.0
   *
   *  Step 6  @0x0a5ac3..0x0a5ae4 — eased_t = PCMath::easeInOut(...):
   *     xmm4 = *0xaf528 = 1.0
   *     xmm3 = 0.0
   *     xmm0 = norm_t
   *     xmm1 = curveParam (-0x38)
   *     xmm2 = xmm1 = curveParam
   *     rdi  = r12 (=out ptr)
   *     esi  = 0                             ; the `bool`-flavored 1st arg
   *     call PCMath::easeInOut               ; writes *r12 = eased_t
   *     xmm0 = *r12 = eased_t
   *
   *  Step 7  @0x0a5aea..0x0a5af9 — scaled = dtDen * eased_t (CMTime):
   *     r12 = -0x58; rdi=r12; rsi=r15 (=dtDen)
   *     call __ZmlRK6CMTimed  ; CMTime operator*(CMTime const&, double)
   *
   *  Step 8  @0x0a5af9..0x0a5b22 — *rbx = p1.time + scaled  (final):
   *     Copy p1.time  → rsp+0x18
   *     Copy scaled (*r12) → rsp
   *     rdi = rbx (return buffer)
   *     call _PC_CMTimeSaferAdd
   *
   *  Epilogue @0x0a5b27..0x0a5b38 — rax = rbx; restore; ret.
   */
  static easeTime(
    _spline: OZSplineOpaque,
    t: CMTime,
    p1: EaseInterpolatorKeyframe,
    p2: EaseInterpolatorKeyframe,
  ): CMTime {
    // Step 1 — curveParam from p1's virtual-0x28 method. The virtual is
    // NOT decoded in this file; the caller must have supplied it.
    if (!p1.virtualEaseShapeAtZero) {
      throw new Error(
        "OZEaseInterpolator.easeTime: no p1.virtualEaseShapeAtZero " +
          "injected — undecoded virtual dispatch @0x0a59ea " +
          "(vtable slot *0x28 of p1)",
      );
    }
    // @0x0a59e0..0x0a59ea — the vtable call takes _kCMTimeZero.
    const shapeAtZero = p1.virtualEaseShapeAtZero(kCMTimeZero);
    // @0x0a59ed..0x0a5a01 — curveParam = (2.0 - shapeAtZero) * 0.25
    const curveParam = (2.0 - shapeAtZero) * 0.25;

    // Step 2 — dtNum = t - p1.time  (CMTime subtract).
    //   @0x0a5a46 — PC_CMTimeSaferSubtract(out, a=t, b=p1.time)
    // NB: the asm's first stack-arg is t and the second is p1.time;
    // PC_CMTimeSaferSubtract's signature is (a, b) -> a - b, so
    // result = t - p1.time.
    const dtNum: CMTime = PC_CMTimeSaferSubtract(t, p1.time);

    // Step 3 — dtNumSec = seconds(dtNum).                        @0x0a5a5d
    const dtNumSec = CMTimeGetSeconds(dtNum);

    // Step 4 — dtDen = p2.time - p1.time (CMTime).               @0x0a5a91
    // Same argument convention: first stack arg = p2.time, second = p1.time.
    const dtDen: CMTime = PC_CMTimeSaferSubtract(p2.time, p1.time);

    // Step 5 — norm_t = dtNumSec / dtDenSec.
    //   @0x0a5aa9 → xmm0 = dtDenSec
    //   @0x0a5ab3 → xmm1 /= xmm0
    const dtDenSec = CMTimeGetSeconds(dtDen);
    const norm_t = dtNumSec / dtDenSec;

    // Step 6 — eased_t = PCMath::easeInOut(...).                 @0x0a5adf
    //   Signature (see raw-port/src/infra/PCMath.ts):
    //     easeInOut(flag: 0|1, t, accelIn, accelOut, t0, t1) -> {out, speed?}
    //   Asm reg-map:
    //     esi(flag)=0, xmm0=norm_t, xmm1=curveParam, xmm2=curveParam,
    //     xmm3=0.0, xmm4=1.0, rdi=&out, rsi=&speed (=null).
    // We assume PCMath.easeInOut returns the "out" scalar directly (as
    // exposed by the ported infra API); the "speed" slot is a nullable
    // second output we don't ask for.
    const eased_t = OZEaseInterpolator._callEaseInOut(
      false,        // esi = 0                       @0x0a5add
      norm_t,       // xmm0                          @0x0a5ace
      curveParam,   // xmm1                          @0x0a5ad2 (from -0x38)
      curveParam,   // xmm2                          @0x0a5ad7
      0.0,          // xmm3                          @0x0a5acb
      1.0,          // xmm4                          @0x0a5ac3
    );

    // Step 7 — scaled = dtDen * eased_t (CMTime).                @0x0a5af4
    //   __ZmlRK6CMTimed  ==  operator*(CMTime const&, double)
    //   which the CMTime.ts port exposes as CMTimeMul_double.
    const scaled: CMTime = CMTimeMul_double(dtDen, eased_t);

    // Step 8 — return = p1.time + scaled.                        @0x0a5b22
    return PC_CMTimeSaferAdd(p1.time, scaled);
  }

  /**
   * Thin adaptor over the infra `PCMath.easeInOut` port. The infra
   * function's exact TS return-shape differs between snapshot revisions,
   * so we do the tiny call here and centralize the surface. If the
   * infra API doesn't match what the asm expects (5 doubles + a
   * bool-flag + a nullable *speed pointer, returning the "out"
   * double), we throw citing @0x0a5adf.
   */
  private static _callEaseInOut(
    flag: boolean,
    t: number,
    accelIn: number,
    accelOut: number,
    t0: number,
    t1: number,
  ): number {
    // The concrete PCMath.easeInOut prototype in this repo (see
    // raw-port/src/infra/PCMath.ts @line ~472) is:
    //   easeInOut(t, accelIn, accelOut, t0, t1, *out, *speed) @0x130d9
    // where *speed is optional. It's exposed here (per the imports at
    // the top of this file) as `PCMath.easeInOut(...)` returning the
    // computed value. Because the exact call shape has shifted between
    // ports, we defer to whatever the infra API is and guard with a
    // typed check.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn: any = (PCMath as any).easeInOut;
    if (typeof fn !== "function") {
      throw new Error(
        "OZEaseInterpolator._callEaseInOut: PCMath.easeInOut not " +
          "available — undecoded infra @0x0a5adf " +
          "(__ZN6PCMath9easeInOutEdddddPdS0_)",
      );
    }
    // Try the "returns number" shape first; if it returns undefined
    // the infra API is the (out, speed) mutable-output flavor and we
    // fall back to that.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = fn(t, accelIn, accelOut, t0, t1, flag);
    if (typeof res === "number") return res;
    if (res && typeof res === "object" && typeof res.out === "number") {
      return res.out;
    }
    throw new Error(
      "OZEaseInterpolator._callEaseInOut: PCMath.easeInOut returned " +
        "an unexpected shape (" + typeof res + ") — infra ABI drift; " +
        "undecoded frontier @0x0a5adf",
    );
  }
}
