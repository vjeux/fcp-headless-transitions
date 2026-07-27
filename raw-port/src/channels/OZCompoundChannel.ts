// OZCompoundChannel — a channel that groups sub-channels (compound / vector-valued parameter).
// Base for OZChannel2D / OZChannel3D / OZChannelPosition / OZChannelRotation3D.
//
// FRAMEWORK NOTE: the vast majority of OZCompoundChannel lives in ProChannel.framework (ctors,
// dtor, copy/operator=, operator==, compare, willBeModified, setValue, removeValue*,
// numberOfKeypointsAt, hasOnlyOneKeypointAt, markFactoriesForSerialization,
// compoundReset/compoundAddKeypointAt/compoundMoveKeypointTo/compoundDeleteKeypointAt/
// compoundSetIsSpline — all `U` (undefined imports) in Ozone). Only THREE methods are actually
// defined in Ozone — the three transcribed here. They are the overrides FCP hooks in the Ozone
// build to specialize the ProChannel base class.
//
// The three Ozone overrides:
//   @Ozone 0x0000000000283790  isCompoundChannel() const                  -> returns true
//   @Ozone 0x00000000002837a0  setKeypointInterpolation(OZChannel*, void*, uint, bool) -> returns 0/false
//   @Ozone 0x00000000002837b0  setCurveInterpolation(uint)                -> no-op void
//
// Comparison with the sibling base method OZChannelBase::isCompoundChannel() const @Ozone 0x1fb80
// which returns 0 (false) — proves this class is the "yes I'm a compound" override point.
//
// Sub-channel container layout: not yet decoded here. The child channels are the vector-component
// leaf OZChannels (e.g. .x/.y for a 2D, .x/.y/.z for a 3D/position, three rotation channels for
// rotation3D). The container access + factory wiring live in the ProChannel ctors
// (OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, bool, uint) and
// OZCompoundChannel(OZFactory*, PCString const&, uint, uint)) — both `U` in Ozone, so the
// exact offset (likely a std::vector<OZChannel*> at some fixed this+0xNN parallel to
// OZChannelFolder's this+0x70 children vector) is DEFERRED. When a caller needs the sub-channels
// they must go through the (not-yet-ported) ProChannel accessors.
//
// Inheritance: OZCompoundChannel extends OZChannelBase (proven by the presence of the
// OZChannelBase::isCompoundChannel override slot in this class).

import { OZChannelBase } from "./OZChannelBase.js";
import { OZChannel } from "./OZChannel.js";

export class OZCompoundChannel extends OZChannelBase {
  /**
   * isCompoundChannel — @Ozone 0x0000000000283790
   *   pushq %rbp ; movq %rsp,%rbp ; movb $0x1,%al ; popq %rbp ; retq
   * Overrides OZChannelBase::isCompoundChannel() const @Ozone 0x1fb80 (which returns 0).
   * Constant-true predicate: every OZCompoundChannel instance answers "yes, I am compound".
   */
  isCompoundChannel(): boolean {
    return true;
  }

  /**
   * setKeypointInterpolation — @Ozone 0x00000000002837a0
   *   pushq %rbp ; movq %rsp,%rbp ; xorl %eax,%eax ; popq %rbp ; retq
   * Signature per demangled symbol
   *   __ZN17OZCompoundChannel24setKeypointInterpolationEP9OZChannelPvjb
   *   = setKeypointInterpolation(OZChannel*, void*, unsigned int, bool)
   * Return width: %al used by nothing (xorl %eax,%eax zeroes the whole %rax). Callers reading
   * the return as bool see false; callers reading as int see 0. This is the "no, I did not
   * handle it" override — the base OZChannel version (in ProChannel, not yet decoded) is what
   * actually walks a keypoint's interpolators; on a compound channel FCP defers to the per-
   * sub-channel setter instead (the OZCompoundChannel keypoint-interpolation entrypoint just
   * refuses at this level and returns false).
   */
  setKeypointInterpolation(
    _channel: OZChannel | null,
    _opaque: unknown,
    _kind: number,      // unsigned int
    _flag: boolean,
  ): boolean {
    // xorl %eax, %eax -> 0
    return false;
  }

  /**
   * setCurveInterpolation — @Ozone 0x00000000002837b0
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   * Signature per demangled symbol
   *   __ZN17OZCompoundChannel21setCurveInterpolationEj
   *   = setCurveInterpolation(unsigned int)
   * Return type: void (no %rax/%al setup). Pure no-op override — a compound channel does not
   * carry a single curve of its own, so setting a curve-interpolation kind at the compound
   * level is silently ignored; callers that mean it must set it on each leaf sub-channel.
   */
  setCurveInterpolation(_kind: number /* unsigned int */): void {
    // no-op — three-instruction epilogue only.
  }
}
