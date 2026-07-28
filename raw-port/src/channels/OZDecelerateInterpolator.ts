// OZDecelerateInterpolator.ts — ProChannel.framework decelerate keyframe interpolator.
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/
//     Versions/A/ProChannel
//
// The class extends OZLinearInterpolator (see vtable @0xe2e48 — every slot except
// *0x68 easeTime is inherited from OZLinearInterpolator @0xd6508).  It overrides
// only `easeTime`: the interpolator warps query-time along a
// constant-decel motion profile whose deceleration coefficient is derived from
// the LEFT KEYFRAME's `getBias(kCMTimeZero)`.
//
// -----------------------------------------------------------------------------
// Vtable @0xe2e48   (installed ptr 0xe2e58)  — resolved via
//   `python3 raw-port/army/tools/resolve.py ProChannel vtable OZDecelerateInterpolator`.
// -----------------------------------------------------------------------------
//   *0x00 -> 0xa5476  ~OZDecelerateInterpolator (D1, in-place)
//   *0x08 -> 0xa5480  ~OZDecelerateInterpolator (D0, deleting)
//   *0x10 -> 0x84718  OZInterpolator::init                      (inherited)
//   *0x18 -> 0x44ec8  OZLinearInterpolator::interpolate         (inherited)
//   *0x20 -> 0x4511e  OZLinearInterpolator::subDivide           (inherited)
//   *0x28 -> 0x44688  OZInterpolator::convertHandlesToTangents  (inherited)
//   *0x30 -> 0x4468e  OZInterpolator::convertTangentsToHandles  (inherited)
//   *0x38 -> 0x44648  OZInterpolator::useTangents               (inherited)
//   *0x40 -> 0x44650  OZInterpolator::useKeypoints              (inherited)
//   *0x48 -> 0x44658  OZInterpolator::getAdjustedMaxU           (inherited)
//   *0x50 -> 0x44670  OZInterpolator::getAdjustedMinU           (inherited)
//   *0x58 -> 0x418aa  OZInterpolator::needInit                  (inherited)
//   *0x60 -> 0x453d0  OZLinearInterpolator::uForCurveValue      (inherited)
//   *0x68 -> 0xa52fc  OZDecelerateInterpolator::easeTime        (OVERRIDDEN — this file)
//
// -----------------------------------------------------------------------------
// easeTime — OZDecelerateInterpolator::easeTime(OZSpline&, CMTime const&, void* a, void* b)
// @0x00000000000a52fc  (returns CMTime by value → SRVO in %rdi)
// -----------------------------------------------------------------------------
// x86_64 (verbatim; from /tmp/ProChannel_tV.txt line 198612):
//     pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14 / pushq %r13 /
//     pushq %r12 / pushq %rbx / subq $0x78,%rsp
//     movq %r9, %r12                 ; r12 = void* b   (right keypoint / OZDynamicVertex*)
//     movq %r8, %r14                 ; r14 = void* a   (left  keypoint / OZDynamicVertex*)
//     movq %rcx, %r13                ; r13 = CMTime const* t
//     movq %rdi, %rbx                ; rbx = return-slot CMTime*
//     movq (%r8), %rax               ; rax = vptr of *a
//     movq _kCMTimeZero(%rip), %rsi  ; rsi = &kCMTimeZero
//     movq %r8, %rdi                 ; rdi = a
//     callq *0x28(%rax)              ; xmm0 = a->getBias(kCMTimeZero) — @vtable *0x28 =
//                                       OZDynamicVertex::getBias(CMTime const&) @0x3eab6
//     movsd 0xb2bf(%rip), %xmm1      ; xmm1 = 2.0                (const @ProChannel 0xb05f0)
//     subsd %xmm0, %xmm1             ; xmm1 = 2.0 - bias
//     mulsd 0xb083(%rip), %xmm1      ; xmm1 = (2.0 - bias) * 0.5  (const 0.5 @0xb03c0)
//     movsd %xmm1, -0x38(%rbp)       ; stack.coef = 1 - bias/2
//
//     ; -- copy CMTime t (16 bytes) into local frame -0x70(%rbp) --
//     movq 0x10(%r13), %rax          ; rax = t.epoch
//     leaq -0x70(%rbp), %r15
//     movq %rax, 0x10(%r15)          ; local.epoch = t.epoch
//     movups (%r13), %xmm0           ; xmm0 = (t.value, t.timescale|flags)
//     movaps %xmm0, (%r15)           ; local = t (first 16 bytes)
//
//     ; -- build PC_CMTimeSaferSubtract(t, a.u) --
//     ; NOTE the OZDynamicVertex layout: the vertex's CMTime "U" sits at +0x10..+0x20
//     ;  (16 bytes: value+timescale|flags), and the 8-byte epoch trailer at +0x20.
//     movq 0x20(%r14), %rax          ; rax = a.u.epoch
//     movq %rax, 0x28(%rsp)          ; arg2.epoch      (2nd CMTime arg to PC_CMTimeSaferSubtract)
//     movups 0x10(%r14), %xmm0       ; xmm0 = a.u.(value,timescale|flags)
//     movups %xmm0, 0x18(%rsp)       ; arg2.(v,ts)
//     movq 0x10(%r15), %rax
//     movq %rax, 0x10(%rsp)          ; arg1.epoch = t.epoch
//     movaps (%r15), %xmm0
//     movups %xmm0, (%rsp)           ; arg1.(v,ts) = t.(v,ts)
//     leaq -0x58(%rbp), %r13
//     movq %r13, %rdi                ; rdi = &out-CMTime (return slot for PC_CMTimeSaferSubtract)
//     callq _PC_CMTimeSaferSubtract  ; out = t - a.u
//
//     ; -- num = CMTimeGetSeconds(out) --
//     movq 0x10(%r13), %rax
//     movq %rax, 0x10(%rsp)
//     movups (%r13), %xmm0
//     movups %xmm0, (%rsp)
//     callq _CMTimeGetSeconds
//     movsd %xmm0, -0x30(%rbp)       ; stack.num = sec(t - a.u)
//
//     ; -- build PC_CMTimeSaferSubtract(b.u, a.u) --   [b - a]
//     movq 0x20(%r14), %rax
//     movq %rax, 0x28(%rsp)          ; arg2.epoch = a.u.epoch
//     movups 0x10(%r14), %xmm0
//     movups %xmm0, 0x18(%rsp)       ; arg2 = a.u
//     movq 0x20(%r12), %rax
//     movq %rax, 0x10(%rsp)          ; arg1.epoch = b.u.epoch
//     movups 0x10(%r12), %xmm0
//     movups %xmm0, (%rsp)           ; arg1 = b.u
//     movq %r15, %rdi                ; rdi = -0x70(%rbp) return slot
//     callq _PC_CMTimeSaferSubtract  ; slot = b.u - a.u
//
//     ; -- den = CMTimeGetSeconds(slot) --
//     movq 0x10(%r15), %rax
//     movq %rax, 0x10(%rsp)
//     movupd (%r15), %xmm0
//     movupd %xmm0, (%rsp)
//     callq _CMTimeGetSeconds
//     movsd -0x30(%rbp), %xmm2       ; xmm2 = num
//     divsd %xmm0, %xmm2             ; xmm2 = num/den  = u in [0,1]
//
//     ; -- easeInOut(t=u, accelIn=0, accelOut=coef, t0=0, t1=1, out=&outSec, speed=NULL) --
//     leaq -0x40(%rbp), %r12
//     movq $0x0, (%r12)              ; *out = 0.0  (double)
//     movsd 0xa121(%rip), %xmm4      ; xmm4 = 1.0    (const @ProChannel 0xaf528)
//     xorpd %xmm1, %xmm1             ; xmm1 = 0.0            (accelIn = 0)
//     xorps %xmm3, %xmm3             ; xmm3 = 0.0            (t0 = 0)
//     movapd %xmm2, %xmm0            ; xmm0 = u              (t)
//     movsd -0x38(%rbp), %xmm2       ; xmm2 = coef           (accelOut)
//     movq %r12, %rdi                ; rdi = &outSec
//     xorl %esi, %esi                ; rsi = NULL            (speed*)
//     callq __ZN6PCMath9easeInOutEdddddPdS0_
//                                      ; PCMath::easeInOut(t, aI, aO, t0, t1, &outSec, NULL)
//
//     ; -- multiply CMTime (b.u - a.u) by outSec  (operator*(CMTime const&, double)) --
//     movsd (%r12), %xmm0            ; xmm0 = outSec (eased in [0,1])
//     leaq -0x58(%rbp), %r12
//     movq %r12, %rdi                ; rdi = &out CMTime
//     movq %r15, %rsi                ; rsi = &(b.u - a.u)
//     callq __ZmlRK6CMTimed          ; CMTime * double  (out = (b-a) * eased)
//
//     ; -- return = PC_CMTimeSaferAdd(out, a.u) --
//     movq 0x20(%r14), %rax
//     movq %rax, 0x28(%rsp)          ; arg2 = a.u
//     movups 0x10(%r14), %xmm0
//     movups %xmm0, 0x18(%rsp)
//     movq 0x10(%r12), %rax
//     movq %rax, 0x10(%rsp)          ; arg1 = out
//     movups (%r12), %xmm0
//     movups %xmm0, (%rsp)
//     movq %rbx, %rdi                ; rdi = return-slot CMTime*
//     callq _PC_CMTimeSaferAdd       ; *rbx = a.u + (b-a)*eased
//     movq %rbx, %rax                ; return the return-slot (Itanium SRVO)
//     ...pop / ret
//
// In plain math: `easeTime(t; a, b) = a.u + (b.u - a.u) * easeInOut( (t-a.u)/(b.u-a.u), 0,
//   1 - a.getBias(0)/2, 0, 1 )`.
//
// -----------------------------------------------------------------------------
// D1 destructor @0xa5476  — tail-calls OZLinearInterpolator::~OZLinearInterpolator() @0x44eb0.
// D0 destructor @0xa5480  — calls the same base D2, then jumps to operator delete(this).
// -----------------------------------------------------------------------------
//   D1:  pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZN20OZLinearInterpolatorD2Ev
//   D0:  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//        movq  %rdi,%rbx
//        callq __ZN20OZLinearInterpolatorD2Ev
//        movq  %rbx,%rdi / addq $0x8,%rsp / popq %rbx / popq %rbp / jmp __ZdlPv
//
// -----------------------------------------------------------------------------
// TypeScript port
// -----------------------------------------------------------------------------

import { OZKeypoint } from "./OZCurve.js";
import {
  CMTime,
  CMTimeGetSeconds,
  PC_CMTimeSaferSubtract,
  kCMTimeZero,
} from "../infra/CMTime.js";
import { easeInOut } from "../infra/PCMath.js";

/**
 * `OZDynamicVertex::getBias(CMTime const&)` @ProChannel 0x3eab6.
 *
 * Not yet ported.  The compiled decelerate path invokes this virtual through
 * vtable slot *0x28 of OZDynamicVertex to fetch the LEFT keypoint's "bias"
 * parameter, evaluated at time-zero.  For static-value keypoints this returns
 * the static bias stored on the keypoint; for dynamic vertices it's a
 * time-sampled channel value.
 *
 * The port below reads `a.bias ?? 0` as a stand-in ONLY for the OZKeypoint
 * (static) shape already ported in raw-port/src/channels/OZCurve.ts — if the
 * caller has a decoded static bias on `a` we use it, otherwise we throw with
 * the address so the frontier is visible.
 */
function OZDynamicVertex_getBias_stub(a: OZKeypoint): number {
  // The decoded OZKeypoint carries no `bias` field yet in the shared struct;
  // FCP's decel curves that reach production go through a dynamic vertex that
  // reads a channel, which is not yet ported.  Refuse to invent.
  throw new Error(
    "OZDynamicVertex::getBias(CMTime) @ProChannel 0x3eab6 — not yet ported. " +
      "Required by OZDecelerateInterpolator::easeTime @0xa52fc.",
  );
  // silence unused param — the vertex arg is a decode citation
  void a;
}

/**
 * `operator*(CMTime const&, double)` @ProChannel — the CMTime × scalar op used
 * at 0xa5431.  Not yet ported.
 */
function CMTime_mul_double_stub(_t: CMTime, _s: number): CMTime {
  throw new Error(
    "operator*(CMTime const&, double) [__ZmlRK6CMTimed] @ProChannel — " +
      "not yet ported. Required by OZDecelerateInterpolator::easeTime @0xa5431.",
  );
}

/**
 * `PC_CMTimeSaferAdd(CMTime, CMTime)` @ProCore — the overflow-safe CMTime
 * addition, used at 0xa545f.  Not yet ported.
 */
function PC_CMTimeSaferAdd_stub(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "PC_CMTimeSaferAdd(CMTime, CMTime) @ProCore — not yet ported. " +
      "Required by OZDecelerateInterpolator::easeTime @0xa545f.",
  );
}

/**
 * OZDecelerateInterpolator::easeTime(OZSpline&, CMTime t, void* a, void* b)
 *   @ProChannel 0xa52fc  (vtable slot *0x68).
 *
 * Warps the query time along a constant-deceleration profile.  Given the
 * fractional position `u = (t - a.u)/(b.u - a.u)` within the segment [a,b],
 * this evaluates
 *
 *     e = PCMath::easeInOut(u, 0, 1 - a.getBias(0)/2, 0, 1)
 *
 * and returns `a.u + (b.u - a.u) * e` — i.e. the eased CMTime in segment
 * coordinates.  Downstream, `OZLinearInterpolator::interpolate` uses this
 * eased time as its input to the linear formula.
 *
 * The OZSpline argument is unused in the compiled body (never read); the
 * behaviour is fully determined by `a`, `b`, and `t`.  We keep the parameter
 * for ABI parity with the vtable slot signature.
 */
export function OZDecelerateInterpolator_easeTime(
  _sp: unknown /* OZSpline& — unused in the compiled body */,
  t: CMTime,
  a: OZKeypoint,
  b: OZKeypoint,
): CMTime {
  // @0xa5326  bias = a->getBias(kCMTimeZero)  via vtable *0x28
  //           — for the current decode of OZKeypoint (static value only), this
  //             is not resolvable and throws with the frontier addr.
  const bias = OZDynamicVertex_getBias_stub(a);
  // The unused param is a lint-only concern; keep the citation but silence:
  void kCMTimeZero;

  // @0xa5329..@0xa533d  coef = (2.0 - bias) * 0.5  =  1 - bias/2
  const coef = (2.0 - bias) * 0.5;

  // @0xa5382 / @0xa53cd  num = seconds(t - a.u);  den = seconds(b.u - a.u)
  const num = CMTimeGetSeconds(PC_CMTimeSaferSubtract(t, a.u));
  const den = CMTimeGetSeconds(PC_CMTimeSaferSubtract(b.u, a.u));

  // @0xa53ef  u = num / den   (SSE divsd — IEEE 754 double)
  const u = num / den;

  // @0xa541c  PCMath::easeInOut(t=u, accelIn=0, accelOut=coef, t0=0, t1=1)
  //           Returns {out, speed}; only `out` is consumed.
  const { out: eased } = easeInOut(u, 0.0, coef, 0.0, 1.0);

  // @0xa5431  (b.u - a.u) * eased
  const dur = PC_CMTimeSaferSubtract(b.u, a.u);
  const scaled = CMTime_mul_double_stub(dur, eased);

  // @0xa545f  a.u + scaled
  return PC_CMTimeSaferAdd_stub(a.u, scaled);
}

/**
 * OZDecelerateInterpolator — is-a OZLinearInterpolator (only `easeTime` differs).
 *
 * Every other virtual (`interpolate`, `subDivide`, `uForCurveValue`, tangent
 * conversions, `useTangents`, `useKeypoints`, `getAdjustedMinU/MaxU`,
 * `needInit`, `init`) is inherited unchanged from OZLinearInterpolator
 * — see the vtable dump at the top of this file.
 *
 * A TS class shell isn't strictly required (the porting model exposes the
 * eased-time free function directly for use from a switch in the
 * interpolator dispatch tables), but we keep the class-shape citation and
 * expose the override so downstream ports can bind to it.
 */
export class OZDecelerateInterpolator {
  /**
   * @asm ~OZDecelerateInterpolator (D1) @0xa5476 :
   *   `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp OZLinearInterpolator::~OZLinearInterpolator()`
   */
  destroy(): void {
    // Tail-calls into the base D2 (OZLinearInterpolator::~OZLinearInterpolator @0x44eb0).
    // That base is itself trivial in ProChannel (see re/CURVE_EVAL.md) — no members
    // to tear down — so we emit no work here beyond the frame prologue equivalent.
  }

  /** @vtable *0x68 — the ONLY method override on this subclass. */
  easeTime(sp: unknown, t: CMTime, a: OZKeypoint, b: OZKeypoint): CMTime {
    return OZDecelerateInterpolator_easeTime(sp, t, a, b);
  }
}
