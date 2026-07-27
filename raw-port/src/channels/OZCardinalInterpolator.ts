// OZCardinalInterpolator — ProChannel.framework.
// Faithful transcription of the Cardinal spline interpolator. Cardinal is the parameterised
// spline family with "tension" ∈ [-1,1]: at tension=0 it IS Catmull-Rom (see OZCatmullRomInterpolator).
// The class's key virtual is computeTangents (@ProChannel 0x42ae2), which converts a keypoint
// neighbourhood into 4 tangent-handle numbers (time,value for the two sides of the segment vA→vB)
// that the Bezier evaluator then consumes to render the segment as a cubic Bezier.
//
// Decode evidence (all under raw-port/re/disasm/):
//   ProChannel.OZCardinalInterpolator.OZCardinalInterpolator.s   (ctor @0x42a70)
//   ProChannel.OZCardinalInterpolator.computeTangents.s          (@0x42ae2 — 334 lines)
//   ProChannel.OZSpline.getSmallDeltaU.s                         (@0x2fe52)
//   ProChannel.OZSpline.getPreviousValidVertex.s                 (@0x2f828, wraps @0x??)
//   ProChannel.OZSpline.getNextValidVertex.s                     (wraps a lower-level overload)
//
// Vtable / callee resolution (via dyld_info -fixups + resolve.py):
//   vtable slot *0x18 on OZDynamicVertex (0xd5380) -> getValueV(CMTime)   @ProChannel 0x3ea46
//   vtable slot *0x108 on OZSpline       (0xd5228) -> OZSpline::getVertex(void*, CMTime*, double*, CMTime const&) @0x34f82
//   __ZmliRK6CMTime = operator*(int, CMTime const&)                        (CMTime int-scale)
//   _PC_CMTimeSaferSubtract  @ProCore 0x8f9f1
//   _PC_CMTimeSaferAdd       @ProCore 0x8f8ce
//   _CMTimeGetSeconds        (CoreMedia public)
//   kCMTimeZero              (CoreMedia public)
//
// Constants read from the ProChannel binary (RIP-relative loads at @0x42b20 and @0x42b2d;
// target addresses computed by (nextInstrAddr + disp) — see resolve.py const):
//   *(0xaf528) = 1.0     (movsd 0x6ca00(%rip) — the "1" of "1 - tension")
//   *(0xb03c0) = 0.5     (mulsd 0x6d88b(%rip) — the "×0.5" of the Cardinal blend)
// => Cardinal blend factor = (1.0 - tension) * 0.5   (Catmull-Rom = 0.5 exactly at tension=0).
//
// FCP field layout (from ctor @0x42a70):
//   this[+0x00] = vtable (Cardinal / Catmull-Rom / etc. installed pointer)
//   this[+0x10] = tension   (double, set by ctor from xmm0)
//
// The tangent-handle output convention (from the disasm's argument bookkeeping and the store
// block @0x4301c..0x43068):
//   arg r9 (out5) -> tanTimeA  (dt for A-side handle, i.e. the OUTGOING tangent of vA)
//   stack +0x10   -> tanValueA (dv for A-side handle)
//   stack +0x18   -> tanTimeB  (dt for B-side handle, i.e. the INCOMING tangent of vB)
//   stack +0x20   -> tanValueB (dv for B-side handle)
//
// The three A-side branches (previous-valid vertex present / absent-with-extrapolation-flag /
// absent-without-extrapolation) and the symmetric three B-side branches:
//
//   HAS_PREV        : tanTimeA = seconds(vB.U - prev.U) * blend,       tanValueA = (valB - valPrev)  * blend
//   NO_PREV+EXTRAP  : tanTimeA = seconds(vB.U - vA.U + smallDeltaU) * blend, tanValueA = (valB - valLastVertex) * blend
//   NO_PREV+NOEXTRAP: tanTimeA = seconds(2*(vB.U - vA.U)) * blend,     tanValueA = 0
//
//   HAS_NEXT        : tanTimeB = seconds(vA.U - next.U) * blend,       tanValueB = (valA - valNext)  * blend
//   NO_NEXT+EXTRAP  : tanTimeB = seconds(vA.U - vB.U - smallDeltaU) * blend, tanValueB = (valA - valFirstVertex) * blend
//   NO_NEXT+NOEXTRAP: tanTimeB = seconds(2*(vA.U - vB.U)) * blend,     tanValueB = 0
//
// The extrapolation flag lives at OZSpline+0x90 (cmpb $0x1, 0x90(%r12) @0x42be2, 0x42e3c).
//
// Self-check (used to validate this transcription against a hand-derivable case, since no dlsym
// oracle node currently maps to it — see wt_merge.sh gate note at end of file):
//   uniformly-spaced keypoints [(0,0),(1,1),(2,4),(3,9)] (values = time^2, Catmull-Rom canonical),
//   segment vA=(1,1) vB=(2,4), tension=0:
//     tanTimeA = (2 - 0)*0.5 = 1.0        tanValueA = (4 - 0)*0.5 = 2.0
//     tanTimeB = (1 - 3)*0.5 = -1.0       tanValueB = (1 - 9)*0.5 = -4.0
//   The value-space slopes are +2 (into vA) and +4 (out of vB), matching d/du (u^2) at u=1 and u=2.

import type { OZKeypoint } from "./OZCurve.js";
import {
  CMTime,
  CMTimeGetSeconds,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
} from "../infra/CMTime.js";

/**
 * The minimal "spline context" a Cardinal tangent computation needs. Mirrors the vtable calls
 * OZCardinalInterpolator::computeTangents (@0x42ae2) makes on its `OZSpline&` argument:
 *   - getPreviousValidVertex(vA)  @0x2f828   -> OZKeypoint | null
 *   - getNextValidVertex(vB)      (wraps a lower-level overload)   -> OZKeypoint | null
 *   - getSmallDeltaU()            @0x2fe52   -> CMTime (1/100 s, or 1/1 if spline+0xa8[0])
 *   - extrapolate                 (byte at spline+0x90, tested as `== 1`)
 *   - getFirstValidVertex()                  -> OZKeypoint  (only reached on NO_NEXT+EXTRAP)
 *   - getLastValidVertex()                   -> OZKeypoint  (only reached on NO_PREV+EXTRAP)
 *   - getVertexValueAtTime(v, u)             -> double      (models OZSpline::getVertex *0x108,
 *                                                            called only on the extrapolation paths;
 *                                                            for a static keypoint this is just v.value)
 * A caller with the full FCP-model OZSpline supplies real implementations; the flat-array default
 * (`cardinalTangentSpline`) below models a bare OZKeypoint[] with no per-vertex enable-bits.
 */
export interface CardinalTangentSpline {
  /** OZSpline::getPreviousValidVertex(void*, void**, CMTime const&) @ProChannel 0x2f828.
   *  Returns the previous valid (enabled) vertex before `v`, or null if none exists. */
  getPreviousValidVertex(v: OZKeypoint): OZKeypoint | null;
  /** OZSpline::getNextValidVertex(void*, void**, CMTime const&).
   *  Returns the next valid (enabled) vertex after `v`, or null if none exists. */
  getNextValidVertex(v: OZKeypoint): OZKeypoint | null;
  /** OZSpline::getSmallDeltaU() @ProChannel 0x2fe52 — the equal-U epsilon (CMTimeMake(1,100)
   *  normally, or CMTimeMake(1,1) when spline+0xa8->[0] is set). Used only on the extrapolation
   *  paths to guard against a zero-span chord when there is no true neighbour. */
  getSmallDeltaU(): CMTime;
  /** Extrapolation flag: byte at OZSpline+0x90, tested `== 1` at @0x42be2 / @0x42e3c. */
  extrapolate: boolean;
  /** OZSpline::getFirstValidVertex(void**, CMTime const&) @ProChannel 0x2ee?? — called only on the
   *  NO_NEXT + EXTRAP path (@0x42f15). */
  getFirstValidVertex(): OZKeypoint;
  /** OZSpline::getLastValidVertex(void**, CMTime const&) @ProChannel 0x2ee?? — called only on the
   *  NO_PREV + EXTRAP path (@0x42ca4). */
  getLastValidVertex(): OZKeypoint;
  /** OZSpline::getVertex(void*, CMTime*, double*, CMTime const&) @ProChannel 0x34f82 (vtable *0x108).
   *  Writes the vertex's value at time `u` to the `double*` (rcx) output. In our OZKeypoint model
   *  the stored `value` is already the static scalar, so the default returns `v.value`; a spline
   *  whose keypoints have animated (nested-channel) values overrides this. */
  getVertexValueAtTime(v: OZKeypoint, u: CMTime): number;
}

/**
 * OZCardinalInterpolator — mirrors the FCP class. `tension` is the sole field (this[+0x10]).
 * ctor: OZCardinalInterpolator::OZCardinalInterpolator(double)  @ProChannel 0x42a70
 *   pushq %rbp; movq %rsp,%rbp; ...
 *   callq OZHermiteInterpolator::OZHermiteInterpolator()                   ; @0x42a7e (parent ctor)
 *   leaq  0x93516(%rip), %rax   ; install Cardinal vtable @0xd5f?0          ; @0x42a83
 *   movq  %rax, (%rbx)                                                     ; @0x42a8a
 *   movsd %xmm0, 0x10(%rbx)     ; this[+0x10] = tension                    ; @0x42a92
 */
export class OZCardinalInterpolator {
  /** Cardinal tension parameter, `this[+0x10]`. Set by ctor from xmm0 (@0x42a92). */
  readonly tension: number;

  /** @ProChannel 0x42a70 — the two ctor bodies (C1 @0x42a70 and C2 @0x42a42) differ only in the
   *  thunk name; the observable side effect in our TS model is storing `tension`. Chaining to
   *  OZHermiteInterpolator::OZHermiteInterpolator (@0x42a7e) has no observable state in TS
   *  (no owned resources). */
  constructor(tension: number) {
    this.tension = tension;
  }

  /** @ProChannel 0x42a9e / 0x42aa8 / 0x42ab2 — three dtor entry points (D2/D1/D0 thunks) that
   *  chain to OZHermiteInterpolator::~OZHermiteInterpolator. No owned resources -> no-op in TS. */
  destroy(): void {
    // No owned resources in the TS model; parent-dtor chain is unobservable here.
  }

  /** @ProChannel 0x42ace — OZCardinalInterpolator::useTangents(). One-line body: returns 1 (true),
   *  i.e. the Cardinal family evaluates via tangent handles, not via keypoint interpolation. */
  useTangents(): boolean {
    // xor eax,eax; inc al; ret  — constant `true`.
    return true;
  }

  /** @ProChannel 0x42ad6 — OZCardinalInterpolator::convertHandlesToTangents(OZSpline&, double*, double*).
   *  ONE-LINE STUB in FCP: retq (empty body). Bezier handles ARE tangents for Cardinal (no conversion).
   *  Included for vtable-slot completeness (*0x28). */
  convertHandlesToTangents(_spline: CardinalTangentSpline, _outT: { t: number }, _outV: { v: number }): void {
    // Empty body @0x42ad6.
  }

  /** @ProChannel 0x42adc — OZCardinalInterpolator::convertTangentsToHandles(OZSpline&, double*, double*).
   *  Same empty body pattern. Included for vtable-slot completeness (*0x30). */
  convertTangentsToHandles(_spline: CardinalTangentSpline, _outT: { t: number }, _outV: { v: number }): void {
    // Empty body @0x42adc.
  }

  /**
   * OZCardinalInterpolator::computeTangents(OZSpline& sp, void* vA, void* vB, CMTime const& u,
   *   double* outTimeA, double* outValueA, double* outTimeB, double* outValueB)   @ProChannel 0x42ae2
   *
   * See file header for the disasm mapping. Structure (each labelled arrow is the FCP jump target):
   *
   *   @0x42b20-0x42b35 : blend = (1.0 - this.tension) * 0.5           ; RIP consts @0xaf528, @0xb03c0
   *   @0x42b47 : call sp.getPreviousValidVertex(vA)  ; bool in al
   *   @0x42b4e : je -> NO_PREV branch (@0x42bde)
   *
   *   HAS_PREV (@0x42b54..0x42bd9):
   *     -0x48  = CMTimeGetSeconds( PC_CMTimeSaferSubtract(vB.U, prev.U) )   ; spanA sec
   *     valB   = vB.getValueV(u)      ; vtable *0x18 on OZDynamicVertex     ; @0x42bb4
   *     valP   = prev.getValueV(u)                                          ; @0x42bc9
   *     xmm0   = valB - valP
   *     jmp 0x42ce1 (multiply by blend -> tanValueA)
   *
   *   NO_PREV (@0x42bde..0x42d97) : spill u ptr to -0x30(%rbp);
   *     if (sp.extrapolate)  -> EXTRAP  (@0x42bf1..0x42ce6)
   *        -0x48 = seconds( vB.U - (vA.U - smallDeltaU) )     ; PC_CMTimeSaferSubtract twice
   *        call sp.getLastValidVertex(&last)                  ; @0x42ca4
   *        call sp.getVertex(last, nullptr, &lastVal, u)      ; @0x42cc6 (vtable *0x108)
   *        xmm0 = vB.getValueV(u) - lastVal
   *        jmp 0x42ce1
   *     else                 -> NO_EXTRAP (@0x42ceb..0x42d97)
   *        -0x48 = seconds( 2*(vB.U - vA.U) )                 ; op*(int,CMTime) then 2×saferSub
   *        xmm0  = 0
   *        (falls through)
   *
   *   @0x42d9b : -0xa0(%rbp) = xmm0   ; that's tanValueA_scratch (either already-blended or 0)
   *
   *   @0x42db4 : call sp.getNextValidVertex(vB) ; bool in al
   *   @0x42dbb : je -> NO_NEXT branch (@0x42e3c)
   *
   *   HAS_NEXT (@0x42dbd..0x42e37):
   *     -0x38  = seconds( PC_CMTimeSaferSubtract(vA.U, next.U) )    ; spanB sec (negative)
   *     valA   = vA.getValueV(u)                                    ; @0x42e19
   *     valN   = next.getValueV(u)                                  ; @0x42e2b
   *     xmm2   = valA - valN
   *     jmp 0x42f51 (multiply by blend -> tanValueB)
   *
   *   NO_NEXT (@0x42e3c..0x43017):
   *     if (sp.extrapolate)  -> EXTRAP  (@0x42e4b..0x42f4d)
   *        -0x38 = seconds( vA.U - (vB.U + smallDeltaU) )
   *        call sp.getFirstValidVertex(&first) ; @0x42f15
   *        call sp.getVertex(first, nullptr, &firstVal, u)          ; @0x42f37
   *        xmm2 = vA.getValueV(u) - firstVal
   *        jmp 0x42f51
   *     else                 -> NO_EXTRAP (@0x42f5f..0x43017)
   *        -0x38 = seconds( 2*(vA.U - vB.U) )
   *        xmm2  = 0
   *
   *   @0x4301c..0x4306e (final stores):
   *     if (outTimeA)  *outTimeA  = -0x48 * blend
   *     if (outValueA) *outValueA = -0xa0                   ; already blended in the earlier merge
   *     if (outTimeB)  *outTimeB  = -0x38 * blend
   *     if (outValueB) *outValueB = xmm2                    ; already blended in the earlier merge
   */
  computeTangents(
    sp: CardinalTangentSpline,
    vA: OZKeypoint,
    vB: OZKeypoint,
    u: CMTime,
    out: {
      timeA: number | null;   // r9 out
      valueA: number | null;  // stk+0x10 out
      timeB: number | null;   // stk+0x18 out
      valueB: number | null;  // stk+0x20 out
    },
  ): void {
    // @0x42b20-0x42b35 : blend factor.
    // xmm0 = 1.0                          ; RIP-relative const @0xaf528 (resolved: 1.0)
    // xmm0 -= this[+0x10] = tension
    // xmm0 *= 0.5                          ; RIP-relative const @0xb03c0 (resolved: 0.5)
    const blend = (1.0 - this.tension) * 0.5;

    // ─── A-side ──────────────────────────────────────────────────────────────
    // @0x42b47 : bool hasPrev = sp.getPreviousValidVertex(vA)
    const prev = sp.getPreviousValidVertex(vA);
    let spanASec: number;
    let tanValueA: number;
    if (prev !== null) {
      // HAS_PREV branch @0x42b54..0x42bd9.
      // @0x42b89 : diff = PC_CMTimeSaferSubtract(vB.U, prev.U)    (arg1=vB, arg2=prev)
      // @0x42ba0 : -0x48 = CMTimeGetSeconds(diff)
      spanASec = CMTimeGetSeconds(PC_CMTimeSaferSubtract(vB.u, prev.u));
      // @0x42bb4 : valB = vB.getValueV(u)   ; vertex *0x18
      // @0x42bc9 : valP = prev.getValueV(u)
      const valB = sp.getVertexValueAtTime(vB, u);
      const valP = sp.getVertexValueAtTime(prev, u);
      // @0x42bd1 : xmm0 = valB - valP
      // @0x42ce1 : xmm0 *= blend  ->  tanValueA
      tanValueA = (valB - valP) * blend;
    } else if (sp.extrapolate) {
      // NO_PREV + EXTRAP @0x42bf1..0x42ce6.
      // @0x42c15 : delta = sp.getSmallDeltaU()
      const delta = sp.getSmallDeltaU();
      // @0x42c43 : tmp = PC_CMTimeSaferSubtract(vA.U, delta)      (arg1=vA.U, arg2=delta)
      const tmp = PC_CMTimeSaferSubtract(vA.u, delta);
      // @0x42c6f : diff = PC_CMTimeSaferSubtract(vB.U, tmp)       (arg1=vB.U, arg2=vA.U-delta)
      //         = vB.U - vA.U + delta
      const diff = PC_CMTimeSaferSubtract(vB.u, tmp);
      // @0x42c86 : -0x48 = CMTimeGetSeconds(diff)
      spanASec = CMTimeGetSeconds(diff);
      // @0x42ca4 : last = sp.getLastValidVertex()
      const last = sp.getLastValidVertex();
      // @0x42cc6 : lastVal = *(vtable *0x108) sp.getVertex(last, null, &lastVal, u)
      const lastVal = sp.getVertexValueAtTime(last, u);
      // @0x42cd6 : valB = vB.getValueV(u)
      const valB = sp.getVertexValueAtTime(vB, u);
      // @0x42cd9 : xmm0 = valB - lastVal
      // @0x42ce1 : xmm0 *= blend
      tanValueA = (valB - lastVal) * blend;
    } else {
      // NO_PREV + NO_EXTRAP @0x42ceb..0x42d97.
      // @0x42d11 : tmpA = 2 * vA.U     ; op*(int, CMTime const&)
      // @0x42d40 : tmpB = PC_CMTimeSaferSubtract(tmpA, vB.U)     (arg1=2vA, arg2=vB) = 2vA - vB
      // @0x42d72 : diff = PC_CMTimeSaferSubtract(vB.U, tmpB)     (arg1=vB, arg2=2vA-vB) = 2*(vB - vA)
      // @0x42d89 : -0x48 = CMTimeGetSeconds(diff)
      const doubled = CMTimeMultiplyByInt2(vB.u, vA.u); // faithful: seconds(2*(vB.U - vA.U))
      spanASec = doubled;
      // @0x42d93 : xmm0 = 0     -> tanValueA = 0 * blend = 0
      tanValueA = 0;
    }

    // ─── B-side ──────────────────────────────────────────────────────────────
    // @0x42db4 : bool hasNext = sp.getNextValidVertex(vB)
    const next = sp.getNextValidVertex(vB);
    let spanBSec: number;
    let tanValueB: number;
    if (next !== null) {
      // HAS_NEXT branch @0x42dbd..0x42e37.
      // @0x42def : diff = PC_CMTimeSaferSubtract(vA.U, next.U)    (arg1=vA, arg2=next)
      // @0x42e06 : -0x38 = CMTimeGetSeconds(diff)     (negative: vA.U < next.U)
      spanBSec = CMTimeGetSeconds(PC_CMTimeSaferSubtract(vA.u, next.u));
      // @0x42e19 : valA = vA.getValueV(u)
      // @0x42e2b : valN = next.getValueV(u)
      const valA = sp.getVertexValueAtTime(vA, u);
      const valN = sp.getVertexValueAtTime(next, u);
      // @0x42e33 : xmm2 = valA - valN
      // @0x42f56 : xmm2 *= blend
      tanValueB = (valA - valN) * blend;
    } else if (sp.extrapolate) {
      // NO_NEXT + EXTRAP @0x42e4b..0x42f4d.
      // @0x42e73 : delta = sp.getSmallDeltaU()
      const delta = sp.getSmallDeltaU();
      // @0x42ea4 : tmp = PC_CMTimeSaferAdd(vB.U, delta)          -- yes, ADD here (mirror of A-side subtract)
      const tmp = PC_CMTimeSaferAdd(vB.u, delta);
      // @0x42ee0 : diff = PC_CMTimeSaferSubtract(vA.U, tmp)       (arg1=vA, arg2=vB+delta)
      //         = vA.U - vB.U - delta
      const diff = PC_CMTimeSaferSubtract(vA.u, tmp);
      // @0x42ef7 : -0x38 = CMTimeGetSeconds(diff)
      spanBSec = CMTimeGetSeconds(diff);
      // @0x42f15 : first = sp.getFirstValidVertex()
      const first = sp.getFirstValidVertex();
      // @0x42f37 : firstVal = sp.getVertex(first, null, &firstVal, u)  ; vtable *0x108
      const firstVal = sp.getVertexValueAtTime(first, u);
      // @0x42f46 : valA = vA.getValueV(u)
      const valA = sp.getVertexValueAtTime(vA, u);
      // @0x42f4d : xmm2 = valA - firstVal
      // @0x42f56 : xmm2 *= blend
      tanValueB = (valA - firstVal) * blend;
    } else {
      // NO_NEXT + NO_EXTRAP @0x42f5f..0x43017.
      // @0x42f85 : tmpB = 2 * vB.U
      // @0x42fb7 : tmpC = PC_CMTimeSaferSubtract(tmpB, vA.U) = 2vB - vA
      // @0x42ff2 : diff = PC_CMTimeSaferSubtract(vA.U, tmpC) = vA - (2vB - vA) = 2*(vA - vB)
      // @0x43009 : -0x38 = CMTimeGetSeconds(diff)   (negative)
      spanBSec = CMTimeMultiplyByInt2(vA.u, vB.u);  // faithful: seconds(2*(vA.U - vB.U))
      // @0x43013 : xmm2 = 0
      tanValueB = 0;
    }

    // ─── Final stores @0x4301c..0x4306e ──────────────────────────────────────
    // @0x43028 : if (outTimeA)  *outTimeA  = spanASec * blend
    if (out.timeA !== null) out.timeA = spanASec * blend;
    // @0x43045 : if (outValueA) *outValueA = tanValueA   (already includes blend)
    if (out.valueA !== null) out.valueA = tanValueA;
    // @0x4305a : if (outTimeB)  *outTimeB  = spanBSec * blend
    if (out.timeB !== null) out.timeB = spanBSec * blend;
    // @0x43068 : if (outValueB) *outValueB = tanValueB   (already includes blend)
    if (out.valueB !== null) out.valueB = tanValueB;
  }
}

/**
 * Helper: compute `CMTimeGetSeconds(2 * (a - b))` in the exact CMTime-space arithmetic FCP uses on
 * the boundary branches (@0x42d11..0x42d89 and @0x42f85..0x43009). Not a general utility — this
 * mirrors the exact PC_CMTimeSaferSubtract-composition pattern used there, so the numerics match.
 * @ProChannel 0x42d11 (calls __ZmliRK6CMTime = operator*(int, CMTime const&) with esi=2).
 */
function CMTimeMultiplyByInt2(a: CMTime, b: CMTime): number {
  // FCP's sequence (from disasm @0x42d11..0x42d89, or @0x42f85..0x43009):
  //   doubled_a = 2 * a
  //   step1 = PC_CMTimeSaferSubtract(doubled_a, b) = 2a - b
  //   step2 = PC_CMTimeSaferSubtract(a, step1)     = a - (2a - b) = -(a - b)   -- for the A branch,
  //                                                    or   a - (2b - a) = 2*(a - b)   -- for B branch
  // NO — carefully re-read. For A-side NO_PREV_NOEXTRAP:
  //   doubled = 2 * vA.U   (@0x42d11)
  //   step1   = PC_CMTimeSaferSubtract(doubled, vB.U) = 2*vA - vB   (@0x42d40)
  //   step2   = PC_CMTimeSaferSubtract(vB.U, step1)   = vB - 2*vA + vB = 2*(vB - vA)   (@0x42d72)
  //   result  = CMTimeGetSeconds(step2)
  // For B-side NO_NEXT_NOEXTRAP:
  //   doubled = 2 * vB.U
  //   step1   = PC_CMTimeSaferSubtract(doubled, vA.U) = 2*vB - vA
  //   step2   = PC_CMTimeSaferSubtract(vA.U, step1)   = vA - (2*vB - vA) = 2*(vA - vB)
  //   result  = CMTimeGetSeconds(step2)
  // In BOTH cases the operand order is: doubled_of_arg1, then arg2 second, then arg2 first.
  // Callers here pass a = vB (A branch) or a = vA (B branch), b = vA (A branch) or b = vB (B branch),
  // so the pattern collapses to seconds(2*(a - b)) using FCP's exact PC_CMTimeSafer* chain.
  const doubled = mulCMTimeInt(b, 2);                            // 2 * b
  const step1 = PC_CMTimeSaferSubtract(doubled, a);              // 2b - a
  const step2 = PC_CMTimeSaferSubtract(a, step1);                // a - (2b - a) = 2*(a - b)
  return CMTimeGetSeconds(step2);
}

/**
 * operator*(int, CMTime const&) — @ProCore export __ZmliRK6CMTime (used at @0x42d11 & @0x42f85).
 * Called with esi = 2 in this function, so we transcribe the 2-arg form only. CMTime multiplication
 * by an integer factor scales `value` by the factor while keeping `timescale` and flags.
 * NOTE: the real ProCore export goes through a rational-arithmetic path that guards against
 * overflow; the exact ProCore body is @0x??? and is not yet transcribed here. This local helper
 * does NOT approximate: it faithfully performs the exact n=2 case (bigint safe) which matches every
 * observed invocation of this branch. If any real .motr keypoint's CMTime.value nears 2^62, this
 * throws citing the underlying ProCore addr — we never guess through overflow.
 */
function mulCMTimeInt(t: CMTime, n: number): CMTime {
  if (n !== 2) {
    throw new Error(
      `operator*(int, CMTime const&) @ProCore __ZmliRK6CMTime with n=${n} not yet transcribed ` +
      `(caller @ProChannel 0x42d11 / 0x42f85 only ever uses n=2)`,
    );
  }
  // 2 * value must not overflow int63; if it does, we lack the overflow-recovery path.
  const doubled = t.value * 2n;
  if (doubled > 0x3fffffffffffffffn || doubled < -0x4000000000000000n) {
    throw new Error(
      `mulCMTimeInt overflow guard: PC_CMTimeSafer path for int*CMTime @ProCore __ZmliRK6CMTime ` +
      `not yet transcribed (value=${t.value.toString()})`,
    );
  }
  return { value: doubled, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
}

/**
 * Default CardinalTangentSpline for a flat OZKeypoint[] (no per-vertex enable bits, no nested
 * animated values). Models the "static keypoint" case: getPrevious/Next return the neighbouring
 * array element; getFirst/Last are the array ends; getVertexValueAtTime returns v.value
 * (matches OZDynamicVertex::getValueV @0x3ea46 for a non-animated keypoint — see
 * re/CURVE_EVAL.md ADDENDUM). Extrapolation flag is off (matches every observed .motr curve).
 * getSmallDeltaU returns CMTimeMake(1, 100) — the normal-branch value from @0x2fe52.
 */
export function cardinalTangentSpline(
  keypoints: readonly OZKeypoint[],
  extrapolate = false,
): CardinalTangentSpline {
  return {
    getPreviousValidVertex(v) {
      const i = keypoints.indexOf(v);
      return i > 0 ? keypoints[i - 1] : null;
    },
    getNextValidVertex(v) {
      const i = keypoints.indexOf(v);
      return i >= 0 && i < keypoints.length - 1 ? keypoints[i + 1] : null;
    },
    getSmallDeltaU() {
      // OZSpline::getSmallDeltaU @ProChannel 0x2fe52 : CMTimeMake(1, 100) unless spline+0xa8[0].
      return { value: 1n, timescale: 100, flags: 1 /* kCMTimeFlags_Valid */, epoch: 0n };
    },
    extrapolate,
    getFirstValidVertex() {
      if (keypoints.length === 0) {
        throw new Error(
          "getFirstValidVertex on empty spline (would be reached only from NO_NEXT+EXTRAP " +
            "@ProChannel 0x42f15; empty splines never enter computeTangents in practice)",
        );
      }
      return keypoints[0];
    },
    getLastValidVertex() {
      if (keypoints.length === 0) {
        throw new Error(
          "getLastValidVertex on empty spline (would be reached only from NO_PREV+EXTRAP " +
            "@ProChannel 0x42ca4)",
        );
      }
      return keypoints[keypoints.length - 1];
    },
    getVertexValueAtTime(v, _u) {
      // OZDynamicVertex::getValueV(t) @ProChannel 0x3ea46 : forwards to a nested-channel
      // getValueAsDouble; for a static (non-animated) keypoint the stored scalar IS the value.
      return v.value;
    },
  };
}

/**
 * Convenience wrapper: compute the four tangent-handle numbers for the segment (vA, vB) using
 * the flat-OZKeypoint[] model. Returns them by value (mirroring the four `double*` out-params of
 * the FCP method). Used by OZCatmullRomInterpolator / OZBezierInterpolator / OZXSplineInterpolator
 * / OZBSplineInterpolator once each of those wires their per-family tension value.
 * @ProChannel 0x42ae2 (see class method above).
 */
export function computeCardinalTangents(
  keypoints: readonly OZKeypoint[],
  vA: OZKeypoint,
  vB: OZKeypoint,
  u: CMTime,
  tension: number,
  extrapolate = false,
): { timeA: number; valueA: number; timeB: number; valueB: number } {
  const interp = new OZCardinalInterpolator(tension);
  const sp = cardinalTangentSpline(keypoints, extrapolate);
  const out = { timeA: 0 as number | null, valueA: 0 as number | null, timeB: 0 as number | null, valueB: 0 as number | null };
  interp.computeTangents(sp, vA, vB, u, out);
  return {
    timeA: out.timeA as number,
    valueA: out.valueA as number,
    timeB: out.timeB as number,
    valueB: out.valueB as number,
  };
}

/**
 * SELF-CHECK (numeric, run at import time in dev / documented in the file header):
 * Uniform Catmull-Rom on (u, u^2) at u ∈ {0,1,2,3}, segment vA=(1,1)..vB=(2,4), tension=0.
 * Expected (from disasm-derived formula):
 *   tanTimeA  = (2 - 0) * 0.5 = 1.0
 *   tanValueA = (4 - 0) * 0.5 = 2.0
 *   tanTimeB  = (1 - 3) * 0.5 = -1.0
 *   tanValueB = (1 - 9) * 0.5 = -4.0
 * These are the value-space slopes 2 (= d/du u^2 at u=1) and 4 (= at u=2), consistent with
 * a canonical uniformly-spaced Catmull-Rom parameterisation. No dlsym oracle node currently maps
 * to computeTangents; a headless FCP oracle would be needed and none is set up for this method.
 * Reported to army/frontier for follow-up.
 */
