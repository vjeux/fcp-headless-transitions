// raw-port of Flexo C++ class OZShape — SIX methods emitted into the
// Flexo framework (the wider OZShape lives in Ozone; only these six
// short overrides / accessors were emitted here).
//
// Source: Flexo.framework (x86_64 slice). All addresses cite the raw
// file offset from `otool -tV -arch x86_64`.
//
// Methods:
//   @Flexo 0x659720  OZShape::hasShapeBehaviors() const              -> bool  (returns 0)
//   @Flexo 0x659730  OZShape::hasWriteOnBehavior() const             -> bool  (returns 0)
//   @Flexo 0x659740  OZShape::getPixelAspectRatio()                  -> double
//   @Flexo 0x659760  OZShape::shouldApplyScaleToFeathering()         -> bool
//   @Flexo 0x659a60  OZShape::intrinsicTranslationHasKeypoints()     -> bool  (returns 0)
//   @Flexo 0x659a90  OZShape::setShapeTranslation(double, double, CMTime const&)  (empty)
//
// Sub-object offsets recovered from the two non-trivial methods:
//   this + 0x9B8  -> an OZChannel-derived sub-object (the "pixel aspect
//                    ratio" channel). Accessed by getPixelAspectRatio
//                    @0x659744.
//   this + 0x39A0 -> an OZChannel-derived sub-object (the "apply scale to
//                    feathering" boolean channel). Accessed by
//                    shouldApplyScaleToFeathering @0x659764.
//
// The larger OZShape class body (with the ctor, curve behaviors, etc.)
// lives in Ozone.framework and is not visible from this Flexo slice.

import { CMTime, kCMTimeZero } from "../infra/CMTime.js";

// ────────────────────────────────────────────────────────────────────────
// Frontier: OZChannel — abstract audio/spline channel; two virtual
// evaluation entry points that this file calls.
// ────────────────────────────────────────────────────────────────────────

/**
 * Frontier: an OZChannel-derived sub-object. Signature-only.
 * The two accessor methods below invoke non-virtual (direct-call)
 * OZChannel:: methods against this pointer — the actual channel class
 * is undecoded here.
 */
export interface OZChannel {
  readonly __ozChannel: unique symbol;
}

/**
 * OZChannel::getValueAsDouble(CMTime const&, double defaultValue) const
 * — __stub __ZNK9OZChannel16getValueAsDoubleERK6CMTimed @Flexo 0x1497272.
 * Called (tail-jmp) from OZShape::getPixelAspectRatio @0x659756 with
 *   (rdi = this + 0x9B8, rsi = &kCMTimeZero, xmm0 = 0.0).
 */
function OZChannel_getValueAsDouble(
  _channel: OZChannel,
  _time: CMTime,
  _defaultValue: number,
): number {
  throw new Error(
    "OZChannel::getValueAsDouble not yet ported — needed by OZShape::getPixelAspectRatio @0x659756 (tail-jmp __stub @Flexo 0x1497272)",
  );
}

/**
 * OZChannel::getValueAsInt(CMTime const&, double defaultValue) const
 * — __stub __ZNK9OZChannel13getValueAsIntERK6CMTimed @Flexo 0x1497260.
 * Called from OZShape::shouldApplyScaleToFeathering @0x659775 with
 *   (rdi = this + 0x39A0, rsi = &kCMTimeZero, xmm0 = 0.0).
 * Returns int (esi/eax).
 */
function OZChannel_getValueAsInt(
  _channel: OZChannel,
  _time: CMTime,
  _defaultValue: number,
): number {
  throw new Error(
    "OZChannel::getValueAsInt not yet ported — needed by OZShape::shouldApplyScaleToFeathering @0x659775 (__stub @Flexo 0x1497260)",
  );
}

// ────────────────────────────────────────────────────────────────────────
// Class
// ────────────────────────────────────────────────────────────────────────

/**
 * OZShape — the Flexo-visible slice of Ozone's OZShape class. Only six
 * methods are emitted into Flexo (the six ported below). The rest of the
 * class (fields, ctor, other behaviors) is defined by Ozone.framework and
 * is not accessible from Flexo's disassembly.
 *
 * We model only the two decoded sub-channel offsets (`pixelAspectRatioChannel`
 * @0x9B8 and `applyScaleToFeatheringChannel` @0x39A0). Any other field
 * observed by other translation units belongs on a separate Ozone-emitted
 * OZShape port.
 */
export class OZShape {
  /**
   * @0x9B8 — an OZChannel-derived sub-object whose evaluation at t=0 with
   * defaultValue=0.0 is returned by getPixelAspectRatio().
   * See asm @0x659744..0x659756.
   */
  private pixelAspectRatioChannel: OZChannel;

  /**
   * @0x39A0 — an OZChannel-derived sub-object whose integer evaluation
   * at t=0 with defaultValue=0.0 is used to gate
   * shouldApplyScaleToFeathering(). See asm @0x659764..0x65977c.
   */
  private applyScaleToFeatheringChannel: OZChannel;

  constructor(
    pixelAspectRatioChannel: OZChannel,
    applyScaleToFeatheringChannel: OZChannel,
  ) {
    this.pixelAspectRatioChannel = pixelAspectRatioChannel;
    this.applyScaleToFeatheringChannel = applyScaleToFeatheringChannel;
  }

  /**
   * OZShape::hasShapeBehaviors() const  @Flexo 0x659720
   *
   * Asm (@0x659720..0x659727):
   *   xorl %eax, %eax
   *   retq
   *
   * Unconditionally returns false. The Flexo slice of OZShape carries no
   * shape-behavior state; a subclass or the Ozone-scoped OZShape may
   * override this via the vtable.
   */
  hasShapeBehaviors(): boolean {
    return false; // @0x659724 xorl %eax,%eax
  }

  /**
   * OZShape::hasWriteOnBehavior() const  @Flexo 0x659730
   *
   * Asm (@0x659730..0x659737):
   *   xorl %eax, %eax
   *   retq
   *
   * Unconditionally returns false. Same reasoning as hasShapeBehaviors —
   * this Flexo-scoped implementation is the "no behaviors" default.
   */
  hasWriteOnBehavior(): boolean {
    return false; // @0x659734 xorl %eax,%eax
  }

  /**
   * OZShape::getPixelAspectRatio()  @Flexo 0x659740
   *
   * Asm (@0x659740..0x659757):
   *   addq $0x9b8, %rdi                  ; rdi = &this->pixelAspectRatioChannel
   *   movq kCMTimeZero(%rip), %rsi       ; rsi = &kCMTimeZero  @0x65974b
   *   xorps %xmm0, %xmm0                 ; xmm0 = 0.0 (defaultValue)
   *   jmp  __ZNK9OZChannel16getValueAsDoubleERK6CMTimed  @0x659756
   *
   * Tail-calls OZChannel::getValueAsDouble on the sub-channel at +0x9B8
   * with time=CMTimeZero and defaultValue=0.0.
   *
   * NOTE: the argument order here is unusual — the compiler passed the
   * CMTime by-pointer to rsi (@0x65974b loads *&kCMTimeZero) even though
   * the C++ signature is `getValueAsDouble(CMTime const&, double)`. The
   * `RK6CMTime` in the mangling confirms it's a const-ref argument, and
   * the SysV ABI passes references as pointers, so rsi = &kCMTimeZero is
   * exactly right.
   */
  getPixelAspectRatio(): number {
    return OZChannel_getValueAsDouble(
      this.pixelAspectRatioChannel,
      kCMTimeZero, // @0x65974b RIP-relative load of _kCMTimeZero
      0.0,          // @0x659752 xorps %xmm0, %xmm0
    );
  }

  /**
   * OZShape::shouldApplyScaleToFeathering()  @Flexo 0x659760
   *
   * Asm (@0x659760..0x659780):
   *   addq  $0x39a0, %rdi                ; rdi = &this->applyScaleToFeatheringChannel
   *   movq  kCMTimeZero(%rip), %rsi      ; rsi = &kCMTimeZero
   *   xorps %xmm0, %xmm0                 ; xmm0 = 0.0
   *   callq __ZNK9OZChannel13getValueAsIntERK6CMTimed
   *   testl %eax, %eax
   *   sete  %al                           ; al = (returned int == 0)
   *   retq
   *
   * Returns TRUE iff the channel's integer value at t=0 is ZERO.
   *
   * The naming is a little counter-intuitive: "should apply scale to
   * feathering" is TRUE when the channel evaluates to 0 (i.e. the "opt
   * out" bit is unset). That is precisely what the `sete` op encodes.
   */
  shouldApplyScaleToFeathering(): boolean {
    const v = OZChannel_getValueAsInt(
      this.applyScaleToFeatheringChannel,
      kCMTimeZero,
      0.0,
    );
    return (v | 0) === 0; // @0x65977c sete %al  (result of testl %eax,%eax)
  }

  /**
   * OZShape::intrinsicTranslationHasKeypoints()  @Flexo 0x659a60
   *
   * Asm (@0x659a60..0x659a67):
   *   xorl %eax, %eax
   *   retq
   *
   * Unconditionally returns false. Like hasShapeBehaviors/hasWriteOnBehavior
   * this is the Flexo-visible "no keypoints on the intrinsic translation
   * channel" default. Subclasses (or the Ozone-scoped OZShape) may
   * override.
   */
  intrinsicTranslationHasKeypoints(): boolean {
    return false; // @0x659a64 xorl %eax,%eax
  }

  /**
   * OZShape::setShapeTranslation(double dx, double dy, CMTime const& t)
   *  @Flexo 0x659a90
   *
   * Asm (@0x659a90..0x659a95):
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp / retq
   *
   * Full body is prologue+epilogue. No argument is read, no memory is
   * touched. The Flexo-emitted OZShape is a "no-op" for shape
   * translation — a subclass (or the Ozone-scoped OZShape) supplies the
   * actual implementation via the vtable.
   */
  setShapeTranslation(_dx: number, _dy: number, _t: CMTime): void {
    // Faithful: empty body @0x659a90. All three args ignored.
  }
}
