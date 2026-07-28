// OZExponentialInterpolator.ts
// Faithful raw-port of ProChannel::OZExponentialInterpolator (x86_64 slice).
//
// Symbols transcribed (mangled -> address, from /tmp/ProChannel_symmap.tsv):
//   __ZN25OZExponentialInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb     @0x43e6a
//     -> interpolate(OZSpline&, CMTime const&, void*, void*, CMTime const&, bool, bool) -> double
//   __ZN25OZExponentialInterpolator14uForCurveValueER8OZSplinePvS2_RK6CMTimeS5_dRNSt3__16vectorIS3_NS6_9allocatorIS3_EEEE
//                                                                                  @0x442a2
//     -> uForCurveValue(OZSpline&, void*, void*, CMTime const&, CMTime const&, double,
//                       std::vector<CMTime>&) -> bool
//   __ZN25OZExponentialInterpolator15getMinMaxValuesER8OZSplinePvS2_RK6CMTimeS5_PdS6_
//                                                                                  @0x44134
//     -> getMinMaxValues(OZSpline&, void*, void*, CMTime const&, CMTime const&, double*, double*)
//   __ZN25OZExponentialInterpolator4initER8OZSplineRK6CMTime                       @0x445a0
//     -> init(OZSpline&, CMTime const&)  [no-op; prologue/epilogue only]
//   __ZN25OZExponentialInterpolator9subDivideER8OZSplineRK6CMTimePvS5_S5_          @0x440e8
//     -> subDivide(OZSpline&, CMTime const&, void*, void*, void*)
//   __ZN25OZExponentialInterpolatorD0Ev                                             @0x44584
//     -> ~OZExponentialInterpolator()  [D0 delete-thunk; jumps to __ZdlPv]
//   __ZN25OZExponentialInterpolatorD1Ev  is folded (ICF) with D0 tail; base dtor __ZN14OZInterpolatorD2Ev
//
// Class hierarchy: OZExponentialInterpolator : OZInterpolator (D0 tail-calls
// __ZN14OZInterpolatorD2Ev then operator delete). OZInterpolator is NOT yet
// decoded as a class in the port (only its base easeTime identity — see OZInterpolator.ts),
// so the base dtor is a throwing stub citing its addr.
//
// The "context" args (void* rcx = currCtx, void* r8 = nextCtx) are OZDynamicVertex-like
// polymorphic vertices with:
//   *0x18 vtable slot = getValueV(CMTime const&) -> double
//   *0x20 vtable slot = <something taken by subDivide, unresolved here>
//   *0xf0 vtable slot = <double(vertex, ctx?, CMTime, int) called by uForCurveValue>
//   CMTime lives at +0x10..+0x28 (24 bytes) in the vertex object.
// This layout is READ off the disasm (movq 0x20(%rcx),%rax ; movups 0x10(%rcx),%xmm0) and
// matches the OZDynamicVertex vtable indices resolve.py documents:
//   "vtable OZDynamicVertex -> *0x18 getValueV, *0x88 isEnabled"
//
// Ported constants (all cited by RIP-relative decode address in the disasm files above):
//   @0xb0640 = 0x8000000000000000                     (sign-flip pd mask for fabs on delta)
//   @0xb08d8 = +9.210340371976182 = ln(10000)         (stiffness "K = 10000" log)
//   @0xb08e0 = -9.210340371976182 = -ln(10000)
//   @0xb08e8 = -0.00010000000000000009                (= -1/10000, i.e. -1/K)
//
// The exponential interpolant recovered from the pure-scalar block @0x43fb2..0x440cc is:
//     A       = |end - start|
//     delta   = end - start                            (signed)
//     x       = exp( t*(log(A) + ln(K)) - ln(K) )      (= A^t * K^(t-1) )
//     ratio   = (x - 1/K) * delta / (A - 1/K)
//     result  = start + ratio
// which factors to the well-known exponential ease  ( (K*A)^t - 1 ) / (K*A - 1) * delta + start,
// with K = 10000 the FCP-chosen stiffness constant.
//
// The inverse `uForCurveValue` solves this for t:
//     t = ( log( (A - 1/K) * (curveVal - start) / delta ) + ln(K) ) / ( log(A) + ln(K) )
// (See @0x44468..0x444f2 in uForCurveValue.s.)

import {
  type CMTime,
  kCMTimeZero,
  CMTimeCompare,
  CMTimeGetSeconds,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
  CMTimeMul_double,
} from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Undecoded frontier — throwing stubs citing the exact call sites.
// -----------------------------------------------------------------------------

/**
 * OZInterpolator base dtor. Called from D0 @0x4458d (`callq __ZN14OZInterpolatorD2Ev`).
 * The OZInterpolator class itself is not fully transcribed yet.
 */
function OZInterpolator_D2(_thisPtr: OZExponentialInterpolator): void {
  throw new Error(
    "raw-port: OZInterpolator::~OZInterpolator() (base D2) not yet transcribed " +
      "(called from ~OZExponentialInterpolator D0 @0x4458d)"
  );
}

/**
 * `operator delete(void*)` — jumped from D0 @0x4459b (via __stubs at ProChannel 0xace04).
 */
function operator_delete(_thisPtr: OZExponentialInterpolator): void {
  throw new Error(
    "raw-port: ::operator delete (__ZdlPv) not yet transcribed (tail-jmp from D0 @0x4459b)"
  );
}

/**
 * OZSpline::getSmallDeltaU() const  @ProChannel (called via `callq __ZNK8OZSpline14getSmallDeltaUEv`
 * at @0x43f03 and @0x443b7). Returns a CMTime via SysV sret (rdi = &result, rsi = &spline).
 * OZSpline is not yet transcribed as a class in the port; this stub cites the call sites.
 */
function OZSpline_getSmallDeltaU(_spline: unknown): CMTime {
  throw new Error(
    "raw-port: OZSpline::getSmallDeltaU() const not yet transcribed (called @0x43f03, @0x443b7)"
  );
}

/**
 * Vertex vtable slot at *0x18 — semantics `getValueV(CMTime const&) -> double`.
 * Called at:
 *   @0x43eb2   (interpolate)          receiver = rcx = currCtx
 *   @0x43ec3   (interpolate)          receiver = r8  = nextCtx
 *   @0x44339   (uForCurveValue)       receiver = r15 = currCtx
 *   @0x4434b   (uForCurveValue)       receiver = r12 = nextCtx
 * The concrete vertex class + vtable index (OZDynamicVertex per resolve.py doc, index 3 =
 * offset 0x18 with 8-byte slots after the 3-slot RTTI/typeinfo header) is not yet transcribed.
 *
 * Callers provide a `getValueV: (t: CMTime) => number` on the context object.
 */
interface VertexCtx {
  /** CMTime at +0x10 (the vertex's own U/time). */
  timeAt10: CMTime;
  /** vtable *0x18 slot: getValueV(t) -> double. */
  getValueV(t: CMTime): number;
  /** vtable *0xf0 slot: (only invoked by uForCurveValue @0x442dc, @0x442f9).
   *  Signature reconstructed from asm:
   *    rdi = this ; rsi = void* (currCtx or nextCtx, passed as-is) ;
   *    rdx = &kCMTimeZero ; rcx = 0 (int).
   *  Returns a double. The precise semantic is not yet decoded. */
  slotF0(other: unknown, t: CMTime, flag0: number): number;
  /** vtable *0x20 slot: used by subDivide @0x44127. Semantics not yet decoded. */
  slot20(other: unknown, t: CMTime): void;
}

function vertex_slotF0_undecoded(): number {
  throw new Error(
    "raw-port: vertex vtable[+0xf0] (called @0x442dc, @0x442f9) semantics not yet transcribed. " +
      "Signature: double(this, void* other, CMTime const& t=kCMTimeZero, int=0)."
  );
}

function vertex_slot20_undecoded(): void {
  throw new Error(
    "raw-port: vertex vtable[+0x20] (called from subDivide @0x44127) not yet transcribed."
  );
}

/**
 * `operator/(CMTime const&, CMTime const&) -> CMTime` — the exported symbol
 * `__ZdvRK6CMTimeS1_`, resolved via __stubs @ProChannel 0xace0a.  Called from:
 *   @0x44049   interpolate       (u/aSpan → normalized u-ratio)
 * Signature: SysV sret; rdi = &result, rsi = &numer, rdx = &denom.
 * The CMTime/CMTime division ratio is not yet transcribed.
 */
function CMTime_operator_div(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "raw-port: __ZdvRK6CMTimeS1_ (CMTime/CMTime division) not yet transcribed (called @0x44049)"
  );
}

/**
 * `std::vector<CMTime>::push_back(CMTime const&)` — the exported instantiation
 * `__ZNSt3__16vectorI6CMTimeNS_9allocatorIS1_EEE9push_backB9nqe210106ERKS1_`
 * called from uForCurveValue @0x44544. The STL call itself is not decoded, but its
 * observable postcondition is fully specified (the CMTime `t` is appended). We mirror
 * that with a JS Array push so the surrounding decoded math is not blocked by a
 * host-STL frontier that has no bearing on numerical fidelity.
 */
function vectorCMTime_push_back(vec: CMTime[], t: CMTime): void {
  // Cite: raw-port/re/disasm/ProChannel.OZExponentialInterpolator.uForCurveValue.s @0x44544.
  vec.push(t);
}

// -----------------------------------------------------------------------------
// Constants ported from RIP-relative loads (each cites its data addr).
// -----------------------------------------------------------------------------

/** Sign-flip pd-mask @ProChannel 0xb0640 = 0x8000000000000000 (xorpd → negate double).
 *  Modeled implicitly by Math.abs at the call sites where the raw code performs
 *    xorpd  0x6c66c(%rip),%xmm2  ; blendvpd  %xmm0,%xmm2,%xmm1
 *  as an fabs on the signed delta. */
const K_XORPD_SIGN_MASK_AT_0xb0640 = -0.0;
/** Stiffness log @ProChannel 0xb08d8 = ln(10000). */
const K_LN_10000_AT_0xb08d8 = 9.210340371976182;
/** Negated stiffness log @ProChannel 0xb08e0 = -ln(10000). */
const K_NEG_LN_10000_AT_0xb08e0 = -9.210340371976182;
/** Inverse stiffness @ProChannel 0xb08e8 = -1/10000. */
const K_NEG_INV_STIFFNESS_AT_0xb08e8 = -0.00010000000000000009;

// -----------------------------------------------------------------------------
// Class
// -----------------------------------------------------------------------------

/**
 * OZExponentialInterpolator — evaluates an exponential ease between two vertices.
 *
 * Inherits OZInterpolator. Has no per-instance fields decoded here (the D2 tail is a
 * direct base call). Instances are used polymorphically as spline segment interpolators.
 */
export class OZExponentialInterpolator {
  readonly __brand = "OZExponentialInterpolator" as const;

  /**
   * interpolate(OZSpline&, CMTime const& t, void* currCtx, void* nextCtx, CMTime const& u,
   *             bool, bool) -> double     @0x43e6a
   *
   * Direct transcription of @0x43e6a..0x440e6:
   *   1. capture currCtx.time = *(rcx+0x10..+0x28)          @0x43e88..@0x43e94
   *   2. capture nextCtx.time = *(r8+0x10..+0x28)           @0x43e98..@0x43ea5
   *   3. start = currCtx.getValueV(t)                       @0x43ea9..@0x43eb5   [vtable *0x18]
   *   4. end   = nextCtx.getValueV(t)                       @0x43eba..@0x43ec6   [vtable *0x18]
   *   5. if CMTimeCompare(currCtx.time, nextCtx.time) > 0:  @0x43eed..@0x43ef4
   *        nextCtx.time := PC_CMTimeSaferAdd(currCtx.time, OZSpline::getSmallDeltaU())
   *                                                        @0x43efd..@0x43f2f
   *   6. aSpan = PC_CMTimeSaferSubtract(nextCtx.time, currCtx.time)   @0x43f34..@0x43f61
   *      (subtract order in the asm: RSP[0..0x18]=nextCtx.time, RSP[0x18..0x30]=currCtx.time,
   *       result -> -0xc8; PC_CMTimeSaferSubtract(a,b) = a - b — see infra/CMTime.ts.)
   *   7. if CMTimeCompare(kCMTimeZero, aSpan) == 0: return start     @0x43fac..@0x440d2
   *   8. delta = end - start                                @0x43fb2..@0x43fbb
   *      absDelta = |delta| (blendvpd of xorpd sign-flip)   @0x43fbb..@0x43fe6
   *      logAbsDelta = log(absDelta)                        @0x43fea
   *   9. numer = PC_CMTimeSaferSubtract(u, currCtx.time)   @0x43ff4..@0x44037
   *  10. ratioCMTime = CMTime_operator_div(numer, aSpan)   @0x44049   [undecoded — throws]
   *      tRatio = CMTimeGetSeconds(ratioCMTime)            @0x44061
   *  11. y = tRatio * (logAbsDelta + ln(10000)) - ln(10000)  @0x4406b..@0x4407c
   *      firstExp = exp(y)                                  @0x44084 -> saved -0x98
   *      absAgain = exp(logAbsDelta) = absDelta             @0x44096..@0x4409e
   *      rescaled = (firstExp - 1/K) * delta / (absDelta - 1/K)   @0x440a3..@0x440c3
   *      result = start + rescaled                          @0x440c7..@0x440cc
   */
  interpolate(
    _spline: unknown,
    t: CMTime,
    currCtx: VertexCtx,
    nextCtx: VertexCtx,
    u: CMTime,
    _flagA: boolean,
    _flagB: boolean
  ): number {
    // Steps 1-2: capture the vertex times (values not further used in this function; retained
    // for parallelism with the raw asm and for the getSmallDeltaU nudge below).
    const tCurr: CMTime = currCtx.timeAt10;
    let tNext: CMTime = nextCtx.timeAt10;

    // Steps 3-4: end-point values at the input time t.
    const start = currCtx.getValueV(t);
    const end = nextCtx.getValueV(t);

    // Step 5: guard against equal/inverted times — nudge tNext forward if tCurr > tNext.
    if (CMTimeCompare(tCurr, tNext) > 0) {
      const smallDelta = OZSpline_getSmallDeltaU(_spline);
      tNext = PC_CMTimeSaferAdd(tCurr, smallDelta);
    }

    // Step 6: aSpan = tNext - tCurr.
    const aSpan = PC_CMTimeSaferSubtract(tNext, tCurr);

    // Step 7: degenerate identical times — return the left value.
    if (CMTimeCompare(kCMTimeZero, aSpan) === 0) {
      return start;
    }

    // Step 8: delta / absDelta / logAbsDelta.
    const delta = end - start;                          // @0x43fbb..@0x43fc0
    // absDelta computation via xorpd + blendvpd @0x43fcc..@0x43fe1 — |end-start|.
    // xorpd with 0x8000_0000_0000_0000 = -delta; blendvpd picks -delta iff (end < start),
    // else delta. That's Math.abs(delta).
    void K_XORPD_SIGN_MASK_AT_0xb0640; // provenance touch — const is used implicitly via Math.abs
    const absDelta = Math.abs(delta);
    const logAbsDelta = Math.log(absDelta);             // @0x43fea (libm _log)

    // Step 9: numer = u - tCurr.
    const numer = PC_CMTimeSaferSubtract(u, tCurr);

    // Step 10: ratioCMTime = numer / aSpan; tRatio = seconds.
    const ratioCMTime = CMTime_operator_div(numer, aSpan);
    const tRatio = CMTimeGetSeconds(ratioCMTime);

    // Step 11: exponential blend — see class-level derivation.
    const logAbsDeltaPlusLnK = logAbsDelta + K_LN_10000_AT_0xb08d8;
    const y = tRatio * logAbsDeltaPlusLnK + K_NEG_LN_10000_AT_0xb08e0;
    const firstExp = Math.exp(y);                        // @0x44084

    // Second exp: exp(logAbsDelta) — algebraically absDelta. We faithfully call exp here
    // because the raw code does (@0x4409e); using Math.exp preserves the exact bit-pattern
    // FCP produces on this path (libm exp of a possibly-rounded log(|delta|)).
    const absDeltaViaExp = Math.exp(logAbsDelta);        // @0x4409e

    const numer2 = (firstExp + K_NEG_INV_STIFFNESS_AT_0xb08e8) * delta;
    const denom2 = absDeltaViaExp + K_NEG_INV_STIFFNESS_AT_0xb08e8;
    const rescaled = numer2 / denom2;

    return start + rescaled;
  }

  /**
   * uForCurveValue(OZSpline&, void* currCtx, void* nextCtx, CMTime const& tCurr, CMTime const& tNext,
   *                double curveValue, std::vector<CMTime>& out) -> bool           @0x442a2
   *
   * Direct transcription of @0x442a2..0x44579. See the class-level derivation for the closed
   * form:  t = ( log( (A - 1/K) * (curveVal - start) / delta ) + ln(K) ) / ( log(A) + ln(K) ).
   *
   * BLOCKER: the two probing calls @0x442dc/@0x442f9 dispatch vtable *0xf0 on the vertex
   * (semantics undecoded — see `vertex_slotF0_undecoded`). Their return values gate the
   * early-out `curveValue > max`/`curveValue > min` short-circuit at @0x44308..@0x44323.
   * Per PORTING_SPEC Rule 3 we fire the throwing frontier stub loudly; the rest of the
   * decoded body is transcribed inside an unreachable `if (false)` block so tsc still sees
   * the exact ported math and the day slotF0 is decoded the guard flips.
   */
  uForCurveValue(
    spline: unknown,
    currCtx: VertexCtx,
    nextCtx: VertexCtx,
    _tCurrArg: CMTime,     // not read by name in the asm (see uForCurveValue.s r13 usage)
    tNextNextArg: CMTime,  // r9 -> r13 — used as vtable-F0 arg
    curveValue: number,
    out: CMTime[]
  ): boolean {
    // Steps 1-2: slotF0 probes on currCtx (@0x442dc, @0x442f9).
    const _tmp0 = currCtx.slotF0(nextCtx, kCMTimeZero, 0);
    const _tmp1 = currCtx.slotF0(tNextNextArg, kCMTimeZero, 0);
    void _tmp0; void _tmp1;
    // The values are used at @0x44308..@0x44323 with max/min + compare against curveValue.
    // Loud gap (Rule 3):
    vertex_slotF0_undecoded();

    // The remaining decoded body (steps 3-12) — kept live so tsc sees the transcribed math.
    // Uses CMTimeMul_double (@ProCore) for the __ZmlRK6CMTimed call at @0x44508 (that operator
    // is already decoded in infra/CMTime.ts). Uses CMTime_operator_div (@0x44049 stub) is NOT
    // needed here — uForCurveValue produces the CMTime via CMTimeMul_double + PC_CMTimeSaferAdd.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if ((0 as number) !== 0) {
      const start = currCtx.getValueV(kCMTimeZero);
      const end = nextCtx.getValueV(kCMTimeZero);
      const tCurrLocal = currCtx.timeAt10;
      let tNextLocal = nextCtx.timeAt10;
      if (CMTimeCompare(tNextLocal, tCurrLocal) > 0) {
        const smallDelta = OZSpline_getSmallDeltaU(spline);
        tNextLocal = PC_CMTimeSaferAdd(tCurrLocal, smallDelta);
      }
      const aSpan = PC_CMTimeSaferSubtract(tCurrLocal, tNextLocal);
      if (CMTimeCompare(kCMTimeZero, aSpan) === 0) {
        return start !== 0.0;
      }
      const delta = end - start;
      const absDelta = Math.abs(delta);
      const logAbsDelta = Math.log(absDelta);
      const denomLog = logAbsDelta + K_LN_10000_AT_0xb08d8;
      const absAgain = Math.exp(K_NEG_LN_10000_AT_0xb08e0 + denomLog);
      const numFactor = curveValue - start;
      let x = (absAgain + K_NEG_INV_STIFFNESS_AT_0xb08e8) * numFactor;
      x = x / delta;
      x = Math.log(x);
      x = x + K_LN_10000_AT_0xb08d8;
      const tRatio = x / denomLog;
      const scaledCM = CMTimeMul_double(aSpan, tRatio);
      const resultCM = PC_CMTimeSaferAdd(scaledCM, tNextLocal);
      vectorCMTime_push_back(out, resultCM);
      return false;
    }
    return false;
  }

  /**
   * getMinMaxValues(OZSpline&, void* currCtx, void* nextCtx, CMTime const& tCurr, CMTime const& tNext,
   *                 double* outMin, double* outMax)                              @0x44134
   *
   * Direct transcription of @0x44134..@0x442a1:
   *   1. capture currCtx.time (rdx+0x10..+0x28), nextCtx.time (rcx+0x10..+0x28),
   *      argTNext.time (r8+0x00..+0x18)                                          @0x44158..@0x44187
   *   2. if CMTimeCompare(currCtx.time, argTNext.time) > 0:                       @0x441ae..@0x441b5
   *        currCtx.time := argTNext.time                                          @0x441b7..@0x441c3
   *      (Load argTNext-slot contents into the local currCtx.time slot.)
   *   3. copy r13-referenced CMTime into local                                    @0x441c7..@0x441d4
   *      if CMTimeCompare(nextCtx.time, r13Time) < 0 (jns branch = NOT signed = >=0):
   *        nextCtx.time := r13Time                                                @0x44206..@0x44214
   *      (r13 = r9 = argTNextNext or similar; we thread it as `clampHi`.)
   *   4. outMin = this->vtable[*0x18](spline, currCtx.time (nudged), nextCtx.time (clamped),
   *                                   kCMTimeZero, 0, 0)                          @0x44244
   *      — Wait: the call at @0x44244 is `callq *0x18(rax)` where rax = *(r12) = vtable of `this`
   *      (not of currCtx). So this dispatches on this OZExponentialInterpolator's OWN vtable
   *      *0x18 slot = interpolate. The recursion is: minmax(a,b) invokes this->interpolate
   *      twice — once at t=currCtx.time, once at t=nextCtx.time — and picks the {min,max}.
   *   5. outMax = this->interpolate(spline, currCtx (from -0x60 local, i.e. clamped bounds),
   *                                 kCMTimeZero, 0, 0)                            @0x44273
   *   6. if outMin[0] > outMax[0]: swap                                            @0x4427e..@0x4428c
   *
   * The two "vtable *0x18 on this" call sites use an argument-register shuffle from
   * range-CMTime slots into vertex `void*` slots that has not yet been decoded. Per Rule 3
   * we surface this as a loud gap; the disasm is on disk for the follow-up decoder.
   */
  getMinMaxValues(
    _spline: unknown,
    _currCtx: VertexCtx,
    _nextCtx: VertexCtx,
    _tCurr: CMTime,
    _tNext: CMTime,
    _outMin: { value: number },
    _outMax: { value: number }
  ): void {
    throw new Error(
      "raw-port: OZExponentialInterpolator::getMinMaxValues (@0x44134) — the two `interpolate` " +
        "vtable-dispatch call sites @0x44244 and @0x44273 use an argument shuffle from " +
        "range-CMTime slots into vertex `void*` slots that is not yet decoded. See " +
        "raw-port/re/disasm/ProChannel.OZExponentialInterpolator.getMinMaxValues.s."
    );
  }

  /**
   * init(OZSpline&, CMTime const&)  @0x445a0
   *
   * Direct transcription of @0x445a0..@0x445a5:
   *   0x445a0  pushq %rbp
   *   0x445a1  movq  %rsp,%rbp
   *   0x445a4  popq  %rbp
   *   0x445a5  retq
   * Body is empty (pure prologue/epilogue). The class does not require initialization state.
   */
  init(_spline: unknown, _time: CMTime): void {
    // no-op — verbatim
  }

  /**
   * subDivide(OZSpline&, CMTime const&, void* currCtx, void* nextCtx, void* extraCtx)  @0x440e8
   *
   * Direct transcription of @0x440e8..@0x44132:
   *   Preserves regs, saves r9 (extraCtx) in rbx and rdx (input t? — arg2) in r14.
   *   Copies 24 bytes of extraCtx (offsets 0x10..0x28) into an on-stack CMTime.
   *   Two virtual dispatches on `this` (r12 = rdi):
   *     @0x44117  callq *0x18(rax)  — rdi = this, rsi = currCtx (stack), rdx = nextCtx (stack),
   *                                    rcx = 0 (nulled r10d), r8 = 0 (nulled r10d again).
   *              (r10d push-and-pop packs two zeros as the last two stack args.)
   *              vtable *0x18 on `this` = interpolate. Return value is discarded — the call
   *              sits in a subDivide flow, likely to prime a cache the concrete subclass has.
   *     @0x44127  callq *0x20(rax) — rdi = this, rsi = r14 (input t). Vtable *0x20 slot on
   *              OZInterpolator/OZExponentialInterpolator is not yet decoded.
   *
   * We transcribe the two call sites literally; the *0x20 slot @0x44127 throws (see vertex_slot20_undecoded).
   */
  subDivide(
    spline: unknown,
    t: CMTime,
    currCtx: VertexCtx,
    nextCtx: VertexCtx,
    extraCtx: VertexCtx
  ): void {
    // @0x440fd-@0x44109: capture extraCtx.time (24 bytes at +0x10..+0x28) — used as the
    // 5th CMTime arg `u` in the *0x18 interpolate call at @0x44117.
    const uFromExtra: CMTime = extraCtx.timeAt10;

    // @0x44117: this->interpolate(spline, t, currCtx, nextCtx, u=uFromExtra, false, false).
    // Result discarded (subDivide returns void).
    this.interpolate(spline, t, currCtx, nextCtx, uFromExtra, false, false);

    // @0x44127: this->slot20(t) — vtable *0x20 on `this` (extraCtx also passed as rdi/rsi
    // per the r14 register mapping — see comment above). Slot semantics undecoded.
    vertex_slot20_undecoded();
    void currCtx; // suppress unused
  }

  /**
   * ~OZExponentialInterpolator() [D0 delete-thunk]                                @0x44584
   *
   * Body:
   *   @0x44584..@0x44589  prologue
   *   @0x4458a           movq %rdi,%rbx        ; save this
   *   @0x4458d           callq __ZN14OZInterpolatorD2Ev   ; base dtor
   *   @0x44592..@0x44599 epilogue (restore rdi = this)
   *   @0x4459b           jmp __ZdlPv           ; tail-jmp operator delete
   */
  destroy_D0(): void {
    OZInterpolator_D2(this);
    operator_delete(this);
  }
}

export default OZExponentialInterpolator;
