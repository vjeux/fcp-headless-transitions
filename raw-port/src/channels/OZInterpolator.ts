// OZInterpolator — base keyframe interpolator (ProChannel.framework).
// Faithful port. Decodes:
//   * OZInterpolator::easeTime  @ProChannel 0x418b2 (re/CURVE_EVAL.md).
//   * OZInterpolator::~OZInterpolator()  @ProChannel 0x44642
//                       (raw-port/re/disasm/ProChannel.__ZN14OZInterpolatorD2Ev.s).
// One class per file (mirrors FCP's class hierarchy). easeTime is the base "time-warp" hook the
// interpolators call before evaluating a segment; the eased subclasses (SCurve/Convex/Concave/Ease)
// OVERRIDE it, Linear/Bezier use this identity base.
import { OZKeypoint } from "./OZCurve.js";
import { CMTime } from "../infra/CMTime.js";

/**
 * OZInterpolator::easeTime(OZSpline&, CMTime t, vA, vB) -> CMTime   @ProChannel 0x418b2.
 * The BASE implementation is IDENTITY: it copies the input CMTime `t` verbatim to the result
 * (movq 0x10(rcx)->0x10(rdi); movups (rcx)->(rdi)). Linear + Bezier use this base; the eased
 * interpolators OVERRIDE easeTime to warp the query time.
 */
export function easeTime_identity(t: CMTime, _a: OZKeypoint, _b: OZKeypoint): CMTime {
  return t; // verbatim copy
}

/**
 * `OZInterpolator::~OZInterpolator()` @ProChannel 0x44642
 * (__ZN14OZInterpolatorD2Ev — the D2 "base-object destructor" ABI variant).
 *
 * The full disassembly is a 4-instruction empty function:
 *
 *   0x44642  pushq  %rbp                              ; frame prologue
 *   0x44643  movq   %rsp, %rbp
 *   0x44646  popq   %rbp                              ; epilogue
 *   0x44647  retq
 *
 * No callees (no base-class dtor call, no member destructors), no field
 * touches, no vtable stores. Every observable effect of the machine is
 * "nothing" — the class holds no owning resources at this level of the
 * hierarchy that need clean-up. Any subclass D2 that DOES clean up owned
 * fields is a separate ledger entry, and it will call this base dtor as its
 * last step; for the base itself, the correct port is a no-op.
 *
 * We model it as an exported nullary function on the class-file (no
 * OZInterpolator TS class exists yet — the file currently ports only the
 * free-standing easeTime hook — so a static method has nowhere to hang).
 * The name mirrors the FCP mangling for reviewer traceability.
 */
export function OZInterpolator_D2(): void {
  // @0x44642..0x44643 — prologue (no TS-visible effect).
  // @0x44646..0x44647 — epilogue + retq. No stores, no callees.
}
