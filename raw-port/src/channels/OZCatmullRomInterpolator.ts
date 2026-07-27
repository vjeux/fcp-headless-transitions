// OZCatmullRomInterpolator — ProChannel.framework.
// Faithful transcription of the 5 methods FCP exports for this class. Decode evidence:
//   re/disasm/ProChannel.OZCatmullRomInterpolator.OZCatmullRomInterpolator.s (@0x430a2)
//   re/disasm/ProChannel.OZCatmullRomInterpolator.~OZCatmullRomInterpolator.s (@0x430d8)
//   re/disasm/ProChannel.OZCardinalInterpolator.OZCardinalInterpolator.s      (@0x42a70; parent ctor)
//   re/disasm/ProChannel.OZCardinalInterpolator.computeTangents.s             (@0x42ae2; parent virtual)
//   OZCatmullRomInterpolator vtable @ProChannel 0xd6040 (installed-ptr 0xd6050), resolved via
//   dyld_info -fixups + resolve.py (see re/CURVE_EVAL.md).
//
// KEY FINDING (vtable resolution, verbatim from `vtable.py ProChannel OZCatmullRomInterpolator`):
//   *0x00 -> 0x430ce  ~OZCatmullRomInterpolator (D1)
//   *0x08 -> 0x430d8  ~OZCatmullRomInterpolator (D0, delete)
//   *0x10 -> 0x84718  OZInterpolator::init(OZSpline&, CMTime const&)
//   *0x18 -> 0x407e6  OZBezierInterpolator::interpolate                <-- reused, not overridden
//   *0x20 -> 0x40cb6  OZBezierInterpolator::subDivide                  <-- reused, not overridden
//   *0x28 -> 0x42ad6  OZCardinalInterpolator::convertHandlesToTangents <-- inherited from Cardinal
//   *0x30 -> 0x42adc  OZCardinalInterpolator::convertTangentsToHandles <-- inherited from Cardinal
//   *0x38 -> 0x42ace  OZCardinalInterpolator::useTangents              <-- inherited from Cardinal
//   *0x40 -> 0x44650  OZInterpolator::useKeypoints
//   *0x60 -> 0x415f8  OZBezierInterpolator::uForCurveValue             <-- reused, not overridden
//   *0x68 -> 0x418b2  OZInterpolator::easeTime                         <-- base identity, not overridden
//   *0x80 -> 0x42ae2  OZCardinalInterpolator::computeTangents          <-- the Cardinal-family virtual
//
// => OZCatmullRomInterpolator OWNS ZERO NEW METHODS beyond ctor+dtor. It exists solely as a
//    "Cardinal spline with tension = 0.0" configuration (Catmull-Rom is by definition the Cardinal
//    spline whose tension parameter is 0). Value sampling on a Catmull-Rom keypoint segment is:
//        1. call OZCardinalInterpolator::computeTangents (@0x42ae2) using the 4-vertex neighbourhood
//           (getPreviousValidVertex / getNextValidVertex around the [vA,vB] segment) — Cardinal's
//           tension parameter (this+0x10) is 0.0 here.
//        2. call OZBezierInterpolator::interpolate (@0x407e6) with those computed tangents.
//    NEITHER of those two callees has been transcribed yet in this port. Per PORTING_SPEC Rule 3
//    (never approximate; throw citing the addr), interpolate() throws a loud gap that names both
//    unresolved addresses. When those two are transcribed, this file's interpolate() becomes a
//    2-line composition (computeTangents + bezier interpolate) — NOT a new algorithm.
//
// DO NOT hand-write the "standard" Catmull-Rom cubic here: FCP does not evaluate Catmull-Rom as a
// direct basis polynomial in (t,value) space. It converts to Hermite tangents via computeTangents
// (which itself walks CMTime rational neighbours and calls OZSpline::getPreviousValidVertex /
// getNextValidVertex / getSmallDeltaU / getFirstValidVertex / getLastValidVertex + PC_CMTimeSafer*
// arithmetic — see re/disasm/ProChannel.OZCardinalInterpolator.computeTangents.s) and then routes
// through the Bezier evaluator. Approximating with a textbook Catmull-Rom polynomial would diverge
// from FCP on any non-uniformly-spaced keypoint set, on boundary segments (first/last), and on the
// extrapolation-flag branches. That is the exact "hand-rolled Newton" shortcut PORTING_SPEC forbids.

import { OZKeypoint } from "./OZCurve.js";
import { CMTime } from "../infra/CMTime.js";

/**
 * OZCatmullRomInterpolator::OZCatmullRomInterpolator()   @ProChannel 0x430a2
 * Disasm (14 lines) — the entire ctor body:
 *   xorps  %xmm0, %xmm0                              ; tension = 0.0
 *   callq  OZCardinalInterpolator::OZCardinalInterpolator(double)   @0x42a70
 *   leaq   0x92f96(%rip), %rax                       ; -> 0xd6050 (own vtable +0x10)
 *   movq   %rax, (%rbx)                              ; install vtable
 * Parent Cardinal ctor (@0x42a70) does:
 *   callq  OZHermiteInterpolator::OZHermiteInterpolator()           @not-yet-decoded
 *   leaq   ...(%rip), %rax                            ; install Cardinal vtable
 *   movq   %rax, (%rbx)
 *   movsd  %xmm0, 0x10(%rbx)                         ; this->tension = xmm0
 * So a Catmull-Rom instance is a Cardinal instance with Cardinal::tension (field @+0x10) = 0.0
 * and the OZCatmullRomInterpolator vtable installed at (%rbx).
 *
 * Additional vtable rows also decoded from *0xd6040:
 *   *0x88 -> 0x10000113 OZChannelHelpButton_Factory::_instanceOnce
 *   *0x90 -> 0xb0871    typeinfo name for OZCatmullRomInterpolator
 *   *0x98 -> 0xd6028    typeinfo for OZCardinalInterpolator
 *   *0xa8..0x118 -> the OZConstantInterpolator secondary-base sub-vtable (D1/D0/init/interpolate/
 *   subDivide/... @0x4313e / 0x43148 / 0x84718 / 0x43164 / 0x4318e / ... / 0x418b2 easeTime).
 * These are C++ multiple-inheritance thunks; they aren't user-called from the ctor itself.
 */
export class OZCatmullRomInterpolator {
  /** Cardinal tension parameter. Read from Cardinal ctor: `movsd xmm0, 0x10(%rbx)` @0x42a92.
   *  Set by our ctor via `xorps xmm0,xmm0` @0x430ab → 0.0. Catmull-Rom ≡ Cardinal(tension=0). */
  readonly tension: number = 0.0; // @0x430ab (xorps xmm0,xmm0) → passed to Cardinal ctor @0x430ae

  constructor() {
    // Body of @ProChannel 0x430a2. See method-header comment for the disasm mapping.
    // The vtable install (`movq %rax,(%rbx)` @0x430ba, target 0xd6050) has no observable
    // side-effect in this TS model — dispatch is by direct method call, not by vptr load.
  }

  /**
   * OZCatmullRomInterpolator::~OZCatmullRomInterpolator()  @ProChannel 0x430ce (D1), 0x430d8 (D0).
   * D1 body @0x430ce chains to OZCardinalInterpolator::~OZCardinalInterpolator (@0x42a??), which
   * chains to OZHermiteInterpolator::~OZHermiteInterpolator, then base OZInterpolator dtor.
   * D0 body @0x430d8 (12 lines): callq OZCardinalInterpolator::~OZCardinalInterpolator (D2)
   * then tail-jumps to `operator delete` (__ZdlPv @0xace04) — the delete-and-destroy variant.
   * No owned resources in this class → nothing to free here in the TS model.
   */
  destroy(): void {
    // @0x430ce/0x430d8: chain-to-parent dtor + operator delete. No-op in TS.
  }

  /**
   * interpolate(spline, t, vA, vB, u, fX, fY) — the *0x18 vtable slot.
   *
   * The OZCatmullRomInterpolator vtable at *0x18 resolves to
   *   OZBezierInterpolator::interpolate(OZSpline&, CMTime const&, void*, void*, CMTime const&,
   *                                     bool, bool)              @ProChannel 0x407e6
   * i.e. Catmull-Rom does NOT own its own `interpolate`. FCP evaluates a Catmull-Rom segment as:
   *   tangents ← OZCardinalInterpolator::computeTangents(sp, vA, vB, u, &tTa, &tVa, &tTb, &tVb)
   *                                                       @ProChannel 0x42ae2
   *              (walks getPreviousValidVertex@0x??, getNextValidVertex@0x??, getSmallDeltaU@0x2fe52,
   *               getFirstValidVertex/getLastValidVertex, PC_CMTimeSaferAdd/Subtract, CMTimeGetSeconds;
   *               scales by (1 - tension) * 0.5 read from RIP-relative constants @0x42b20/0x42b2d)
   *   value    ← OZBezierInterpolator::interpolate(sp, t, vA, vB, u, fX, fY)   @ProChannel 0x407e6
   *              (uses those tangents to build the cubic Bezier and evaluate at t)
   *
   * NEITHER OZCardinalInterpolator::computeTangents @0x42ae2 NOR OZBezierInterpolator::interpolate
   * @0x407e6 has been transcribed in this port yet. Per PORTING_SPEC Rule 3 we THROW citing both
   * source addresses, rather than substitute a textbook Catmull-Rom (which would diverge on
   * non-uniform time spacing, boundary segments, and extrapolation-flag paths).
   */
  interpolate(_t: CMTime, _a: OZKeypoint, _b: OZKeypoint): number {
    throw new Error(
      "OZCatmullRomInterpolator.interpolate not yet transcribed: requires " +
      "OZCardinalInterpolator::computeTangents @ProChannel 0x42ae2 AND " +
      "OZBezierInterpolator::interpolate @ProChannel 0x407e6 " +
      "(vtable *0x18 @ProChannel 0xd6040 resolves to 0x407e6; ctor @ProChannel 0x430a2)"
    );
  }
}

/**
 * Module-level singleton, mirroring FCP's own OZInterpolators registry (`OZInterpolators::ctor`
 * @ProChannel 0x44a24 stores one instance of each interpolator into the singleton at fixed offsets
 * — see re/INTERPOLATOR_DECODE.md; the type-6 slot @+0x20 in that registry is a
 * OZCatmullRomInterpolator). The dispatch in interpolators.ts uses this singleton.
 */
export const OZ_CATMULL_ROM_INTERPOLATOR = new OZCatmullRomInterpolator();

/**
 * Free-function facade used by the sampleCurveValue dispatch in interpolators.ts. Kept as a thin
 * wrapper so the switch stays symmetric with linearInterpolate / scurveInterpolate / etc.
 * Throws the same faithful gap message from OZCatmullRomInterpolator.interpolate @ProChannel 0x407e6.
 */
export function catmullRomInterpolate(t: CMTime, a: OZKeypoint, b: OZKeypoint): number {
  return OZ_CATMULL_ROM_INTERPOLATOR.interpolate(t, a, b);
}
