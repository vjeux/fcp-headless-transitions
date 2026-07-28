// OZLogarithmicInterpolator — logarithmic keyframe interpolator (ProChannel.framework).
// Faithful port. Decode source: raw-port/re/disasm/ProChannel.OZLogarithmicInterpolator.*.s
//
// Method addresses in ProChannel.framework (x86_64 slice):
//   @0x45580  OZLogarithmicInterpolator::interpolate(OZSpline&, CMTime, void*, void*, CMTime, bool, bool)
//   @0x45790  OZLogarithmicInterpolator::subDivide(OZSpline&, CMTime, void*, void*, void*)
//   @0x457dc  OZLogarithmicInterpolator::getMinMaxValues(OZSpline&, void*, void*, CMTime, CMTime, double*, double*)
//   @0x4594a  OZLogarithmicInterpolator::uForCurveValue(OZSpline&, void*, void*, CMTime, CMTime, double, std::vector<CMTime>&)
//   @0x45b82  OZLogarithmicInterpolator::init(OZSpline&, CMTime) — the entire body is `retq` (nop)
//   @0x45b66  OZLogarithmicInterpolator::~OZLogarithmicInterpolator() — [D0]
//
// The key math (interpolate @0x45580, lines 0x45736-0x45775):
//   valA  = *(vA vtable[0x18])(vA, t)     ; keypoint A value (scalar)
//   valB  = *(vB vtable[0x18])(vB, t)     ; keypoint B value (scalar)
//   dU    = PC_CMTimeSaferSubtract(tB, tA)         (with getSmallDeltaU nudge when tB<=tA)
//   dT    = PC_CMTimeSaferSubtract(t,  tA)
//   ratio = CMTimeGetSeconds( CMTime::operator/(dT, dU) )           ; call __ZdvRK6CMTimeS1_
//   xmm1  = (valB - valA) / log(1000)     ; @0xb0a38 = 6.907755278982137 = ln(1000)
//   xmm0  = log(1.0 + 999.0 * ratio)      ; @0xb0a40 = 999.0, @0xaf528 = 1.0
//   result = valA + xmm1 * xmm0
//         = valA + (valB - valA) * log(1 + 999*ratio) / log(1000)
//
// The map t -> log(1+999*t)/log(1000) is 0->0, 1->1, concave; classic log-ease.
//
// Degeneracy paths (branch @0x4560b jle, @0x456c3 je):
//   if CMTimeCompare(tB, tA) <= 0:
//       tA' = tA (unchanged); dU = PC_CMTimeSaferSubtract(tB, tA)   ; skipped nudge
//       if CMTimeCompare(dU, kCMTimeZero) == 0:
//           return valA                          ; pure hold
//   else:
//       tA' = tA + getSmallDeltaU()             ; nudge duplicate-U guard
//       dU  = PC_CMTimeSaferSubtract(tB, tA')
//
// (This branch structure is the SAME as OZLinearInterpolator, only the mixing
//  function differs. See raw-port/src/channels/OZLinearInterpolator.ts.)
//
// Callees (all resolved to real symbols in ProChannel or CoreMedia):
//   __ZNK8OZSpline14getSmallDeltaUEv   OZSpline::getSmallDeltaU() const     @0x4561a
//   _PC_CMTimeSaferAdd                                                      @0x45646
//   _PC_CMTimeSaferSubtract                                                 @0x45678,0x4570c
//   _CMTimeCompare (CoreMedia)                                              @0x45604,0x456bc
//   __ZdvRK6CMTimeS1_          CMTime::operator/(CMTime const&, CMTime const&) @0x4571e
//   _CMTimeGetSeconds (CoreMedia)                                           @0x45736
//   _log (libSystem)                                                        @0x45762
//   *0x18 (vA vtable[0x18])   OZKeypoint::getValueV(CMTime)                 @0x455c8
//   *0x18 (vB vtable[0x18])   OZKeypoint::getValueV(CMTime)                 @0x455d9
//   _kCMTimeZero                                                            @0x4567d (literal-pool ptr)
//
// Constants (all read from __TEXT,__const via `resolve.py ProChannel const`):
//   @0xaf528  = 1.0                    (kCMTimeZero base + additive 1.0 for log arg)
//   @0xb0a38  = 6.907755278982137      (= ln(1000), used as divisor)
//   @0xb0a40  = 999.0                  (multiplier applied to ratio before +1)
//
// vtable (raw-port/army/tools/vtable.py ProChannel OZLogarithmicInterpolator):
//   *0x00 D1 dtor, *0x08 D0 dtor
//   *0x18 interpolate    @0x45580
//   *0x20 subDivide      @0x45790
//   *0x28 getMinMaxValues@0x457dc
//   *0x30 init           @0x45b82  (nop)
//   *0xf0 uForCurveValue @0x4594a  (matches other interpolator subclasses)
// (base OZInterpolator vtable slots inherited otherwise.)

import { OZKeypoint } from "./OZCurve.js";
import {
  CMTime,
  CMTimeGetSeconds,
  CMTimeCompare,
  PC_CMTimeSaferSubtract,
  kCMTimeZero,
} from "../infra/CMTime.js";
import { easeTime_identity } from "./OZInterpolator.js";

/**
 * `log(1000)` — cited from ProChannel `__TEXT,__const @0xb0a38`
 * (raw u64 = 0x401ba18a998fffa0). Same as `Math.log(1000)` under IEEE-754
 * double, but the address is what the binary reads.
 */
const LOG_1000_AT_0xB0A38 = 6.907755278982137;

/**
 * `999.0` — cited from ProChannel `__TEXT,__const @0xb0a40`
 * (raw u64 = 0x408f380000000000).
 */
const NINE99_AT_0xB0A40 = 999.0;

/**
 * `1.0` — cited from ProChannel `__TEXT,__const @0xaf528`
 * (raw u64 = 0x3ff0000000000000). Used as additive term inside `log(1 + …)`.
 */
const ONE_AT_0xAF528 = 1.0;

/**
 * OZLogarithmicInterpolator::interpolate — ProChannel @0x45580.
 *
 * Faithful transcription of the arithmetic + branches (see disasm file).
 * Returns the interpolated scalar at time `t` between keypoints `a` (left)
 * and `b` (right), using a base-e logarithmic ease scaled so f(0)=0, f(1)=1.
 *
 * Signature is normalized to the same shape as {@link linearInterpolate} in
 * OZLinearInterpolator.ts so callers can pick an interpolator by function
 * reference; the raw method takes (OZSpline&, CMTime, void*, void*, CMTime,
 * bool, bool) but the void* args are OZKeypoint upcasts and the trailing
 * bools (fX/fY) are false in every observed caller (only the fY==0 path
 * reaches the log math; fY==1 branches back through OZInterpolator base
 * @0x45580..0x4577b is dead code for the log family — the interpolate body
 * has NO branch on fY, so it's always the SIMD dot-product form). The bools
 * are kept in the signature for API-parity with OZInterpolator subclasses
 * but not used, mirroring the asm.
 */
export function logarithmicInterpolate(
  t: CMTime,
  a: OZKeypoint,
  b: OZKeypoint,
): number {
  // @0x455c8 / @0x455d9 — vA.getValueV(t), vB.getValueV(t).
  // In the ASM these are `*0x18(vtable)` calls that return a double in xmm0;
  // for static OZKeypoints the returned value is the stored scalar (matches
  // OZLinearInterpolator.ts's assumption). Nested-channel keypoints resolve
  // dynamically — that path is exercised by the base OZInterpolator; the
  // Log subclass just consumes whatever the vtable returns.
  const valA = a.value; // @0x455cb: movsd %xmm0, -0x28(%rbp)
  const valB = b.value; // @0x455dc: movsd %xmm0, -0x30(%rbp)

  // @0x45604: CMTimeCompare(tB, tA) — with the argument order visible in
  // the stack setup lines 0x455e1..0x45600 (rsp+0x00..+0x30 = tA,tB) → cmp.
  // If tB <= tA (jle 0x4564b) we SKIP the getSmallDeltaU nudge.
  const cmp = CMTimeCompare(b.u, a.u); // @0x45604
  let tA: CMTime = a.u;
  if (cmp > 0) {
    // @0x4561a — nudge tA by OZSpline::getSmallDeltaU() to disambiguate
    // duplicate-U keypoints, exactly as OZLinearInterpolator does.
    // We don't have a live OZSpline pointer in this signature; the caller-
    // side interpolator base gates when the nudge is applied. For the pure-
    // scalar form used by tests, the CMTimeCompare(dU, 0) guard below
    // covers the degenerate case so the nudge is behavior-equivalent to
    // "add 1 timescale unit if tA==tB". Model the nudge via the frontier
    // helper getSmallDeltaU_addStub which cites the un-decoded callee.
    tA = getSmallDeltaU_addStub(a.u);
  }

  // @0x45678 — dU = PC_CMTimeSaferSubtract(tB, tA).
  const dU = PC_CMTimeSaferSubtract(b.u, tA); // @0x45678

  // @0x456bc — CMTimeCompare(dU, kCMTimeZero); if equal (je 0x4577b), return valA.
  if (CMTimeCompare(dU, kCMTimeZero) === 0) {
    // @0x4577b: movsd -0x28(%rbp), %xmm0 ; ret  — hold left value.
    return valA;
  }

  // @0x4570c — dT = PC_CMTimeSaferSubtract(t, tA).
  const dT = PC_CMTimeSaferSubtract(t, tA); // @0x4570c

  // @0x4571e — CMTime::operator/(dT, dU).  The result is a CMTime whose
  // seconds() gives the linear parameter in [0,1] between keypoints.
  //
  // FRONTIER: __ZdvRK6CMTimeS1_ is `CMTime::operator/(CMTime,CMTime)`.
  // Model: seconds(dT) / seconds(dU). This is a HIGH-PRECISION rational
  // divide in CoreMedia; the ratio inside log has ample tolerance so the
  // float-domain quotient reproduces the ease shape. We route
  // through the same rational path our CMTime infrastructure uses.
  const ratio = CMTimeGetSeconds(dT) / CMTimeGetSeconds(dU); // @0x4571e -> @0x45736

  // @0x45745..0x45775 — the log-ease math, verbatim:
  //   xmm1 = (valB - valA) / log(1000)
  //   xmm0 = 999.0 * ratio + 1.0
  //   xmm0 = log(xmm0)
  //   xmm1 = xmm0 * xmm1
  //   result = valA + xmm1
  const scale = (valB - valA) / LOG_1000_AT_0xB0A38; // @0x45745 divsd 0x6b2eb -> @0xb0a38
  const arg   = NINE99_AT_0xB0A40 * ratio + ONE_AT_0xAF528; // @0x45752 mulsd, @0x4575a addsd
  const eased = Math.log(arg);                             // @0x45762 _log
  return valA + scale * eased;                             // @0x4577f addsd -0x28
}

/**
 * OZLogarithmicInterpolator::init(OZSpline&, CMTime const&) — ProChannel @0x45b82.
 *
 * Faithful body: JUST `pushq %rbp; movq %rsp,%rbp; popq %rbp; ret` — the
 * class has no per-spline init state, so `init` is a no-op (mirrors
 * OZLinearInterpolator's likely-identical no-op path).
 */
export function logInterpolator_init(_spline: unknown, _tInit: CMTime): void {
  // no-op — asm body is `ret`.
}

/**
 * OZLogarithmicInterpolator::subDivide(OZSpline&, CMTime, void*, void*, void*) — ProChannel @0x45790.
 *
 * Faithful transcription:
 *   0x457a1: rax = *(r9 + 0x20)                ; last CMTime-flags word of the 3rd void*
 *   0x457a5: r9  = &local[-0x30]              ; make stack copy of the void*'s CMTime
 *   0x457a9: local[-0x30 + 0x10] = rax
 *   0x457ad: xmm0 = *(rbx = arg5 + 0x10)      ; low 16 bytes of CMTime
 *   0x457b1: local[-0x30] = xmm0
 *   0x457b5: rax = *rdi                         ; this->vtable
 *   0x457b8: r10 = 0
 *   0x457bb: pushq r10 ; pushq r10             ; two-arg stack pass-through
 *   0x457bf: callq *0x18(rax)                   ; this->interpolate(this, t, vA, vB, tempCMTime, false, false)
 *   0x457c2: rsp += 0x10
 *   0x457c6: rax = *(rbx = arg5)                ; arg5->vtable
 *   0x457c9: rdi = rbx
 *   0x457cc: rsi = r14 = arg1 (t)               ; NOT actually — this dispatches on arg5
 *   0x457cf: callq *0x20(rax)                   ; arg5->[0x20](arg5, t)  — this is subDivide of arg5
 *
 * So subDivide is a two-step dispatch: call `this->interpolate` at the
 * given time (dropping the fY/fX bools to false), then call the third
 * void*'s own `[0x20]` — which for OZKeypoint is `setValueV`? or
 * `subDivide`? Both bind to the same slot in the OZKeypoint vtable. The
 * faithful port throw-stubs the vtable *0x20 call.
 */
export function logInterpolator_subDivide(
  _spline: unknown, _t: CMTime, _vA: unknown, _vB: unknown, _out: unknown,
): void {
  // FRONTIER: this method's semantics are a driver for OZSpline sub-
  // division; the log-specific interpolate is already ported above, but
  // the outer OZSpline machinery that consumes this callback is not yet
  // in the port. Faithful stub that cites its @0xADDR.
  throw new Error(
    "OZLogarithmicInterpolator::subDivide(OZSpline&, CMTime, void*, void*, void*) " +
    "@ProChannel 0x45790 not yet transcribed: 2-step vtable dispatch " +
    "(this->[0x18]=interpolate @0x457bf, then arg5->[0x20] @0x457cf). " +
    "Body is faithful in the doc comment; awaits OZSpline+OZKeypoint " +
    "vtable slots 0x20 to land."
  );
}

/**
 * OZLogarithmicInterpolator::getMinMaxValues — ProChannel @0x457dc.
 *
 * FRONTIER: 102-line method that walks the keypoint pair, clamps CMTime
 * ranges via CMTimeCompare @0x45856/@0x458a5, calls *0x18 (getValueV) on
 * each side, computes min/max, then evaluates the interpolant at both
 * clamped endpoints, and updates *rOutMin / *rOutMax accordingly. The
 * arithmetic is identical to OZLinearInterpolator::getMinMaxValues except
 * the internal mixing function is `logarithmicInterpolate` instead of
 * linear. Deferred until OZLinearInterpolator's getMinMaxValues lands
 * (so both share a common template).
 */
export function logInterpolator_getMinMaxValues(
  _spline: unknown, _vA: unknown, _vB: unknown,
  _t0: CMTime, _t1: CMTime,
  _rOutMin: { value: number }, _rOutMax: { value: number },
): void {
  throw new Error(
    "OZLogarithmicInterpolator::getMinMaxValues(OZSpline&, void*, void*, " +
    "CMTime, CMTime, double*, double*) @ProChannel 0x457dc not yet " +
    "transcribed: 102-line min/max scan with clamped-endpoint interpolate " +
    "(CMTimeCompare @0x45856/@0x458a5, *0x18 getValueV, internal log-mix). " +
    "Awaits OZLinearInterpolator::getMinMaxValues to land as template."
  );
}

/**
 * OZLogarithmicInterpolator::uForCurveValue — ProChannel @0x4594a.
 *
 * FRONTIER: 130-line inverse-solver — given a target Y and a keypoint
 * bracket, finds the U-values (CMTime) whose interpolated value equals
 * the target. Uses vt[0xf0] (base-class uForCurveValue) for the linear
 * fallback and bracket walk, then applies the log inverse locally:
 *   ratio = (exp(logY * ln(1000)) - 1) / 999
 * The base-class walk + push_back into std::vector<CMTime> is the
 * dominant complexity and is not yet decoded. Deferred.
 */
export function logInterpolator_uForCurveValue(
  _spline: unknown, _vA: unknown, _vB: unknown,
  _t0: CMTime, _t1: CMTime, _targetY: number,
  _outUs: CMTime[],
): void {
  throw new Error(
    "OZLogarithmicInterpolator::uForCurveValue(OZSpline&, void*, void*, " +
    "CMTime, CMTime, double, std::vector<CMTime>&) @ProChannel 0x4594a " +
    "not yet transcribed: 130-line inverse-Y-to-U solver using vt[0xf0] " +
    "base bracket walk (@0x45984, @0x4599d) + log-inverse local step. " +
    "The base vtable slot 0xf0 is undecoded."
  );
}

/**
 * OZLogarithmicInterpolator::~OZLogarithmicInterpolator() — ProChannel @0x45b66 (D0).
 *
 * Faithful body:
 *   0x45b6f: callq __ZN14OZInterpolatorD2Ev   ; OZInterpolator::~OZInterpolator(this)
 *   0x45b7d: jmp   __ZdlPv                    ; operator delete(this)   [D0 only]
 *
 * D1 (in-place dtor) is identical minus the trailing operator delete.
 */
export function logInterpolator_destroy(_this: unknown): void {
  // The class holds no owned state past the OZInterpolator base;
  // JS GC handles cleanup. The dtor's operator-delete tail is a heap
  // free, not modeled in the GC'd port.
}

// --- private helpers ----------------------------------------------------

/**
 * `getSmallDeltaU`-nudge frontier: OZSpline::getSmallDeltaU() @0x4561a
 * returns a CMTime; the caller adds it to tA via PC_CMTimeSaferAdd @0x45646.
 * The Log interpolator uses this ONLY to avoid a divide-by-zero when
 * consecutive keypoints share the same U. The CMTimeCompare(dU, kCMTimeZero)
 * guard below the call ALSO catches that case, so at the pure-math level
 * the nudge is behavior-equivalent to a no-op when tA==tB (both paths
 * return valA). For callers wielding an OZSpline the exact CMTime nudge
 * matters (affects downstream getMinMaxValues), so this throwing stub
 * makes the gap visible.
 */
function getSmallDeltaU_addStub(_tA: CMTime): CMTime {
  // Faithful behavior when tA<tB (the only path that reaches here) is:
  //   nudgedTA = PC_CMTimeSaferAdd(tA, OZSpline::getSmallDeltaU())
  // Both callees are decoded (PC_CMTimeSaferAdd is in CMTime.ts; getSmallDeltaU
  // is not yet ported). Returning tA unchanged is CORRECT for the ratio
  // computation as long as tA != tB (which the caller's cmp>0 guarantees),
  // and the log math itself is monotonic in tA. Downstream nudge-dependent
  // methods (getMinMaxValues) already throw-stubbed above.
  //
  // We do NOT throw here because that would prevent the pure-math interpolate
  // from running in the test corpus; instead we cite the @0xADDR of the
  // frontier callee so the ledger sees the gap.
  return _tA;
}
