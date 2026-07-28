// OZConstantInterpolator.ts — the "hold left value" interpolator kind.
//
// Faithful port of ProChannel.framework's OZConstantInterpolator class. This
// is the fallback interpolator used when a curve segment should NOT be
// smoothly interpolated — instead it holds the LEFT keypoint's value from
// tA all the way to tB (a step function). OZInterpolatorStrategies owns
// one heap-allocated instance at slot +0x08.
//
// Ported symbols (all @ProChannel):
//
//   @0x00000000000430f4  OZConstantInterpolator::OZConstantInterpolator() [C2]
//                        __ZN22OZConstantInterpolatorC2Ev
//   @0x0000000000043114  OZConstantInterpolator::OZConstantInterpolator() [C1]
//                        __ZN22OZConstantInterpolatorC1Ev
//                        (C1 has the same body as C2 with a different vtable
//                         const RIP-offset — both install this class's
//                         installed-pointer at (this+0x00) after calling the
//                         base OZInterpolator C2Ev.)
//   @0x0000000000043134  OZConstantInterpolator::~OZConstantInterpolator() [D2]
//                        __ZN22OZConstantInterpolatorD2Ev
//                        (3-instruction tail-jmp to OZInterpolator::~OZInterpolator.)
//   @0x000000000004313e  OZConstantInterpolator::~OZConstantInterpolator() [D1]
//                        __ZN22OZConstantInterpolatorD1Ev
//                        (Same 3-instruction body as D2 — Itanium D1/D2 alias.)
//   @0x0000000000043148  OZConstantInterpolator::~OZConstantInterpolator() [D0]
//                        __ZN22OZConstantInterpolatorD0Ev
//                        (Calls OZInterpolator::~OZInterpolator, then jmp __ZdlPv.)
//   @0x0000000000043164  OZConstantInterpolator::interpolate(OZSpline&, CMTime const&,
//                                                            void* vA, void* vB,
//                                                            CMTime const&, bool, bool)
//                        __ZN22OZConstantInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb
//   @0x000000000004318e  OZConstantInterpolator::subDivide(OZSpline&, CMTime const&,
//                                                          void*, void*, void*)
//                        __ZN22OZConstantInterpolator9subDivideER8OZSplineRK6CMTimePvS5_S5_
//                        (STUB — the full body is 104 lines; getSmallDeltaU
//                         guard + CMTime comparisons and multiple void*/void*
//                         vertex-manipulation calls. Not decoded here beyond
//                         the entry-side prologue; a throw-stub keeps the class
//                         boundary honest. See "subDivide" comment below for
//                         the specific @0xADDR at which decoding is deferred.)
//   @0x0000000000043314  OZConstantInterpolator::getMinMaxValues(OZSpline&, void* vA,
//                                                                void* vB, double, double,
//                                                                double* pMin, double* pMax)
//                        __ZN22OZConstantInterpolator15getMinMaxValuesER8OZSplinePvS2_ddPdS3_
//   @0x0000000000043340  OZConstantInterpolator::uForCurveValue(OZSpline&, void* vA, void* vB,
//                                                               CMTime const& tA, CMTime const& tB,
//                                                               double curveValue,
//                                                               std::vector<CMTime>& out)
//                        __ZN22OZConstantInterpolator14uForCurveValueER8OZSplinePvS2_RK6CMTimeS5_dRNSt3__16vectorIS3_NS6_9allocatorIS3_EEEE
//
// VERTEX SHAPE. `void* vA` / `void* vB` are opaque vertex pointers, but the
// disassembly reveals their shape via the virtual dispatches every method
// makes on them:
//
//   *(vertex)              vptr : *const void
//   *0x18(vptr)            getValueV(CMTime const&) -> double   (returns the vertex's
//                                                                value at time t — for
//                                                                a static keypoint,
//                                                                the stored scalar
//                                                                irrespective of t).
//
// This is IDENTICAL to the vertex shape decoded in OZLinearInterpolator.ts (see
// its `vA.getValueV(te)` comment). In this TS port, `void*` becomes `OZKeypoint`
// and the *0x18 dispatch resolves to reading `keypoint.value`.
//
// BASE. OZInterpolator (base class) has no state — its C2Ev is a no-op zero-
// arg ctor (raw-port/src/channels/OZInterpolator.ts). OZConstantInterpolator
// only OVERRIDES the vtable slots at +0x18 (interpolate), +0x20 (subDivide),
// +0x60 (getMinMaxValues), +0x70 (uForCurveValue) — everything else falls
// through to the base's virtuals (inherited).
//
// Object layout:
//   sizeof(OZConstantInterpolator) = 8 (a single vptr — confirmed by
//     OZInterpolatorStrategies C2 @0x44a42 heap-allocating 0x08 bytes for
//     its OZConstantInterpolator singleton slot).
//
//   +0x00  vptr : void*   installed pointer for vtable-for-OZConstantInterpolator
//                          (= 0x92fd7-based rip @0x43122/C1, 0x92ff7-based rip
//                           @0x43102/C2 — 0x20-byte gap between C1 and C2
//                           bodies means both compute the SAME final effective
//                           address; the vptr install target VMA is
//                           `next_pc + 0x92fd7` for C1 = 0x430fc target).
//                          Real target: __ZTV22OZConstantInterpolator+0x10.
//
// PRIOR STATE. `raw-port/src/channels/OZInterpolatorStrategies.ts` and
// `raw-port/src/channels/OZInterpolators.ts` reference this class by name.
// OZCatmullRomInterpolator.ts's file-header cross-references its methods at
// 0x4313e / 0x43148 / 0x84718 / 0x43164 / 0x4318e — those addresses match
// exactly (D1, D0, ?, interpolate, subDivide). The 0x84718 address is
// OZCatmullRomInterpolator's secondary-base vtable-init entry (into which the
// OZConstantInterpolator subobject's D1/D0/init pointers were spliced) —
// which is EXTERNAL to this class body and stays cited.

import { OZKeypoint } from "./OZCurve.js";
import { CMTime, kCMTimeZero } from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Frontier stubs.
// -----------------------------------------------------------------------------

/**
 * `_kCMTimeZero` — the CoreMedia CMTime zero sentinel referenced from
 * ProChannel via `movq 0x87192(%rip), %rsi` @0x43327 (getMinMaxValues) and
 * `movq 0x87162(%rip), %rsi` @0x43357 (uForCurveValue). Both effective
 * addresses land in the `__got` section — kCMTimeZero is dyld-fixup'd from
 * `/System/Library/Frameworks/CoreMedia.framework`.
 *
 * TS import: `kCMTimeZero` is exported from `raw-port/src/infra/CMTime.ts`.
 */
function _kCMTimeZeroFromGot(): CMTime {
  // The FCP binary reads a symbol from __got; the TS equivalent is the imported
  // constant from CoreMedia's model in raw-port/src/infra/CMTime.ts.
  return kCMTimeZero;
}

// -----------------------------------------------------------------------------
// Helper — vtable slot +0x18 on a vertex/keypoint = getValueV(CMTime).
// -----------------------------------------------------------------------------

/**
 * Vertex vtable +0x18 : `double getValueV(CMTime const& t)`. Discovered by
 * `movq (%rdx), %rax ; callq *0x18(%rax)` at three ProChannel sites in this
 * file (getMinMaxValues @0x43327, uForCurveValue @0x43357, interpolate
 * @0x43173). For a STATIC OZKeypoint the returned double is the vertex's
 * stored scalar, independent of `t` — this is the same interpretation
 * OZLinearInterpolator.ts documents (`vA.getValueV(te)` collapses to
 * `a.value` there).
 *
 * Deeper vertex types (e.g. curve-nested channels) might return time-varying
 * values; that path is not exercised by any decoded caller so it remains a
 * frontier we don't yet model.
 */
function vertex_getValueV(v: OZKeypoint, _tAtWhichToEvaluate: CMTime): number {
  // For a scalar keypoint, getValueV is a constant getter — the value field is
  // written once by the parser and never varies with `t`.
  return v.value;
}

// -----------------------------------------------------------------------------
// OZConstantInterpolator.
// -----------------------------------------------------------------------------

/**
 * OZSpline forward-reference — the surrounding spline reference is passed by
 * const& into every interpolator method. Not touched by OZConstantInterpolator's
 * decoded bodies (the spline is unused because a constant curve doesn't need
 * neighbor lookups); we keep it as `unknown` since OZSpline.ts's export is a
 * separate file and this file adheres to Rule 6 (imports only).
 */
export type OZSplineRef = unknown;

/** Opaque out-vector for uForCurveValue. Backed by std::vector<CMTime>. */
export type CMTimeVectorRef = { push_back(t: CMTime): void };

export class OZConstantInterpolator {
  /**
   * OZConstantInterpolator::OZConstantInterpolator()  [C2 @0x430f4 / C1 @0x43114]
   *
   * Faithful body — C1 @0x43114:
   *   @0x43118..@0x4311a  pushq %rbx ; pushq %rax ; movq %rdi, %rbx
   *   @0x4311d            callq OZInterpolator::OZInterpolator()   (base C2Ev)
   *   @0x43122..@0x43129  leaq 0x92fd7(%rip), %rax ; movq %rax, (%rbx)
   *                          -> install this class's installed-pointer
   *                             (next_pc=0x43129 + 0x92fd7 = 0xd6100 =
   *                              __ZTV22OZConstantInterpolator+0x10).
   *   epilogue.
   *
   * C2 body @0x430f4 is byte-identical except the RIP-offset is 0x92ff7 (which
   * produces the SAME effective address 0xd6100 because C2 starts 0x20 bytes
   * earlier: next_pc=0x43109 + 0x92ff7 = 0xd6100). Both ctors install the same
   * vtable at (this+0x00) after chaining to the base.
   *
   * The base OZInterpolator has no state (raw-port/src/channels/OZInterpolator.ts
   * defines only the free function `easeTime_identity`); no zero-init of any
   * derived-class field is performed (sizeof = 8, and the vptr is the only slot).
   */
  constructor() {
    // @0x4311d: base OZInterpolator::OZInterpolator() — TS no-op.
    // @0x43122..@0x43129: install vtable — TS no-op.
  }

  /**
   * OZConstantInterpolator::interpolate(OZSpline& sp, CMTime const& t,
   *                                     void* vA, void* vB, CMTime const& u,
   *                                     bool fX, bool fY)  @0x43164
   *
   * Faithful body:
   *   pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
   *   @0x4316a  movb 0x18(%rbp), %bl        ; %bl = fY (7th arg, stack-passed)
   *   @0x4316d  movq (%rcx), %rax           ; %rax = vptr of vA (%rcx)
   *   @0x43170  movq %rcx, %rdi             ; rdi = vA
   *   @0x43173  movq %rdx, %rsi             ; rsi = CMTime t (arg 2)
   *   @0x43176  callq *0x18(%rax)           ; xmm0 = vA.getValueV(t)
   *   @0x43179  xorps %xmm1, %xmm1          ; xmm1 = 0.0
   *   @0x4317c  testb %bl, %bl              ; if (fY == 0) ...
   *   @0x4317e  jne @0x43183                ;   ... take else branch
   *   @0x43180  movaps %xmm0, %xmm1         ; xmm1 = vA.getValueV(t)
   *   @0x43183  movaps %xmm1, %xmm0         ; xmm0 = xmm1 (i.e. either the value or 0.0)
   *   epilogue.
   *
   * Semantics: returns `vA.getValueV(t)` when `fY == 0` (i.e. normal Y-axis
   * interpolation — hold left value), else returns `0.0`. Note that fX (arg 6)
   * is unused in this body — a constant-value interpolator has no X-axis
   * variation to report. The `void* vB` (arg 4), CMTime u (arg 5), and OZSpline&
   * sp (arg 1) are all also unused — only vA and fY affect the return.
   *
   * This matches OZSpline.ts's file-level comment
   *   `case "constant": return a.value;  // OZConstantInterpolator: hold left value`
   * for the fY==0 default.
   */
  public interpolate(
    _sp: OZSplineRef,
    t: CMTime,
    vA: OZKeypoint,
    _vB: OZKeypoint,
    _u: CMTime,
    _fX: boolean,
    fY: boolean,
  ): number {
    // @0x43176: vA.getValueV(t)  via vertex vtable slot +0x18.
    const leftValue = vertex_getValueV(vA, t);
    // @0x43179..@0x43183: return fY ? 0.0 : leftValue.
    return fY ? 0.0 : leftValue;
  }

  /**
   * OZConstantInterpolator::subDivide(OZSpline& sp, CMTime const& t,
   *                                   void* vA, void* vB, void* vNew)  @0x4318e
   *
   * The full body is 104 asm lines and involves:
   *   - copying the input vertex records into stack-locals (CMTime + void*
   *     handle-vector shapes at offsets 0x10, 0x20),
   *   - a `CMTimeCompare(vNew.time, vA.time)` @0x431f8 with a `getSmallDeltaU`
   *     nudge branch @0x43208..@0x43213 (Ozone's "equal-U guard"),
   *   - further vertex-manipulation calls into OZSpline::sampleSplineSegment
   *     (@0x345b6 via the spline's own vtable slot +0x48) and vertex handle
   *     resets that write into the caller-supplied `vNew`.
   *
   * The full decoded semantics of subDivide on a CONSTANT segment amounts to
   * "propagate the left value into vNew" (a constant segment split at any
   * intermediate time yields two constant sub-segments with the same value).
   * However, the exact CMTime/handle-copy dance across the 104-line body
   * involves several OZSpline vtable calls that are not yet transcribed as TS
   * (getSmallDeltaU, sampleSplineSegment, vertex handle setters/getters).
   *
   * Per Rule 3 of the porting spec — throw with the exact @0xADDR of the
   * deferred body. When OZSpline's vertex-handle setters land as TS, this
   * method should be replaced with the line-by-line transcription of
   * @0x4318e..0x432?? (the D0 dtor at 0x43148 marks the end of the __text
   * region for this class).
   */
  public subDivide(
    _sp: OZSplineRef,
    _t: CMTime,
    _vA: OZKeypoint,
    _vB: OZKeypoint,
    _vNew: OZKeypoint,
  ): void {
    // @0x4318e: full subDivide body not yet transcribed — requires
    //   OZSpline::getSmallDeltaU @0x??? and OZSpline vtable +0x48
    //   sampleSplineSegment @0x345b6 to be ported first.
    throw new Error(
      "raw-port: OZConstantInterpolator::subDivide @ProChannel 0x4318e — " +
        "full 104-line body (getSmallDeltaU guard + OZSpline sampleSplineSegment " +
        "+ vertex handle propagation) not yet transcribed",
    );
  }

  /**
   * OZConstantInterpolator::getMinMaxValues(OZSpline& sp, void* vA, void* vB,
   *                                          double, double,
   *                                          double* pMin, double* pMax)  @0x43314
   *
   * Faithful body:
   *   pushq %rbp ; movq %rsp, %rbp ; pushq %r14 ; pushq %rbx
   *   @0x4331b  movq %r9, %rbx              ; %rbx = pMax (arg 7)
   *   @0x4331e  movq %r8, %r14              ; %r14 = pMin (arg 6)
   *   @0x43321  movq %rdx, %rdi             ; %rdi = vA (arg 2)
   *   @0x43324  movq (%rdx), %rax           ; %rax = vptr of vA
   *   @0x43327  movq 0x87192(%rip), %rsi    ; %rsi = _kCMTimeZero (dyld fixup)
   *   @0x4332e  callq *0x18(%rax)           ; xmm0 = vA.getValueV(_kCMTimeZero)
   *   @0x43331  movsd %xmm0, (%r14)         ; *pMin = xmm0
   *   @0x43336  movsd %xmm0, (%rbx)         ; *pMax = xmm0
   *   epilogue.
   *
   * Semantics: for a constant segment, min == max == the vertex's value at t=0.
   * The two `double` args at positions 4 and 5 (xmm0, xmm1) and the OZSpline&
   * sp are ALL unused — only vA is read. vB is also unused.
   *
   * The `_kCMTimeZero` argument to getValueV means "evaluate at time zero",
   * which for a static keypoint just returns its stored scalar (as our
   * vertex_getValueV helper does).
   */
  public getMinMaxValues(
    _sp: OZSplineRef,
    vA: OZKeypoint,
    _vB: OZKeypoint,
    _u0: number,
    _u1: number,
    pMin: { value: number },
    pMax: { value: number },
  ): void {
    // @0x43327..@0x4332e: constantValue = vA.getValueV(_kCMTimeZero).
    const constantValue = vertex_getValueV(vA, _kCMTimeZeroFromGot());
    // @0x43331: *pMin = constantValue.
    pMin.value = constantValue;
    // @0x43336: *pMax = constantValue.
    pMax.value = constantValue;
  }

  /**
   * OZConstantInterpolator::uForCurveValue(OZSpline& sp, void* vA, void* vB,
   *                                         CMTime const& tA, CMTime const& tB,
   *                                         double curveValue,
   *                                         std::vector<CMTime>& out)  @0x43340
   *
   * Faithful body:
   *   pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; subq $0x18, %rsp
   *   @0x43349  movsd %xmm0, -0x10(%rbp)    ; spill xmm0 (curveValue) to stack
   *   @0x4334e  movq %r8, %rbx              ; %rbx = &tB (arg 5)
   *   @0x43351  movq %rdx, %rdi             ; %rdi = vA
   *   @0x43354  movq (%rdx), %rax           ; %rax = vertex vptr
   *   @0x43357  movq 0x87162(%rip), %rsi    ; %rsi = _kCMTimeZero (dyld fixup)
   *   @0x4335e  callq *0x18(%rax)           ; xmm0 = vA.getValueV(_kCMTimeZero)
   *   @0x43361  movsd -0x10(%rbp), %xmm1    ; xmm1 = original curveValue
   *   @0x43366  ucomisd %xmm0, %xmm1        ; unordered compare
   *   @0x4336a  jne @0x43384                ; if !equal, skip push_back
   *   @0x4336c  jp  @0x43384                ; if unordered (NaN), skip push_back
   *   @0x4336e  movq 0x10(%rbp), %rdi       ; %rdi = out (7th arg, stack)
   *   @0x43372  movq %rbx, %rsi             ; %rsi = &tB
   *   @0x43375  movsd %xmm0, -0x18(%rbp)    ; spill vertex value
   *   @0x4337a  callq std::vector<CMTime>::push_back(CMTime const&)
   *   @0x4337f  movsd -0x18(%rbp), %xmm0    ; reload vertex value
   *   @0x43384  movsd -0x10(%rbp), %xmm1    ; xmm1 = curveValue again
   *   @0x43389  cmpeqsd %xmm0, %xmm1        ; xmm1 = curveValue == vertex ? all-ones : all-zeros
   *   @0x4338e  movq %xmm1, %rax
   *   @0x43393  andl $0x1, %eax             ; %eax = xmm1_bits & 1  (i.e. 1 if equal, 0 otherwise)
   *   epilogue with rax as return.
   *
   * Semantics: for a constant segment, the curve equals `curveValue` at EVERY
   * time if the segment's constant value equals `curveValue`; otherwise it
   * never equals `curveValue`. The FCP body optimizes this by push_back'ing
   * `tB` (the segment's END time) into `out` when the values match, then
   * returning 1 (found) or 0 (not found).
   *
   * The `!isNaN` check in the jp branch is mirrored — cmpeqsd already handles
   * the NaN case, but the earlier ucomisd would have skipped push_back on NaN
   * (jne || jp) and the second cmpeqsd's low bit would be 0 for unordered,
   * giving return 0 in that case as well.
   *
   * The `tA` (arg 4) and OZSpline& sp are unused; only vA, tB, curveValue, and
   * out are touched. vB is also unused.
   */
  public uForCurveValue(
    _sp: OZSplineRef,
    vA: OZKeypoint,
    _vB: OZKeypoint,
    _tA: CMTime,
    tB: CMTime,
    curveValue: number,
    out: CMTimeVectorRef,
  ): number {
    // @0x43357..@0x4335e: vertex value at time zero.
    const vertexValue = vertex_getValueV(vA, _kCMTimeZeroFromGot());
    // @0x43366..@0x4336a: skip push_back on !== (or NaN).
    if (vertexValue === curveValue) {
      // @0x4337a: out.push_back(tB).
      out.push_back(tB);
    }
    // @0x43389..@0x43393: return 1 iff exact equal (NaN → 0 via cmpeqsd's zero-on-unordered).
    return vertexValue === curveValue ? 1 : 0;
  }

  /**
   * OZConstantInterpolator::~OZConstantInterpolator()  [D2 @0x43134 / D1 @0x4313e]
   *
   * Faithful body — both D1 and D2 are 3-instruction tail-jmp trampolines:
   *   pushq %rbp ; movq %rsp, %rbp ; popq %rbp
   *   jmp OZInterpolator::~OZInterpolator()  (base dtor at ProChannel 0x?????)
   *
   * The base OZInterpolator has no state (see raw-port/src/channels/OZInterpolator.ts —
   * only `easeTime_identity` is exported), so the whole destruction chain is a no-op
   * in TS.
   *
   * D0 @0x43148 is the "deleting destructor" variant: it calls
   * OZInterpolator::~OZInterpolator (base), then `jmp __ZdlPv` to release the
   * object's memory. In TS, GC handles freeing.
   */
  public destroy(): void {
    // @0x4313e: tail-jmp to OZInterpolator::~OZInterpolator — TS no-op.
  }

  /** D0 deleting variant @0x43148. TS calls destroy + relies on GC. */
  public destroyAndFree(): void {
    this.destroy();
    // @0x4315f: jmp __ZdlPv — TS no-op (GC).
  }
}
