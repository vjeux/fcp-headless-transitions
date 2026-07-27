// OZChannel2D -- a 2D value channel (x + y over time) from ProChannel.framework.
//
// Extends OZCompoundChannel and embeds two OZChannel sub-channels (X + Y).
// Faithful transcription of the FCP class @ProChannel. Decode references:
//   re/disasm/ProChannel.OZChannel2D.ctor_factory_folder.s          @0x47050
//   re/disasm/ProChannel.OZChannel2D.ctor_dd_folder.s               @0x47392
//   re/disasm/ProChannel.OZChannel2D.ctor_dd_names_folder.s         @0x474f2
//   re/disasm/ProChannel.OZChannel2D.ctor_copy.s                    @0x47856
//   re/disasm/ProChannel.OZChannel2D.clone.s                        @0x4791a
//   re/disasm/ProChannel.OZChannel2D.copy.s                         @0x4795a
//   re/disasm/ProChannel.OZChannel2D.setValue.s                     @0x47f64
//   re/disasm/ProChannel.OZChannel2D.setValueOffsetByBehaviors.s    @0x47fbe
//   re/disasm/ProChannel.OZChannel2D.flattenAtTime.s                @0x47e52
//   re/disasm/ProChannel.OZChannel2D.setLinearAtTime.s              @0x47f04
//   re/disasm/ProChannel.OZChannel2D.deriveChannel.s                @0x479d2
//   re/disasm/ProChannel.OZChannel2D.simplify.s                     @0x480ba
//   re/disasm/ProChannel.OZChannel2D.getObjCWrapperName.s           @0x48a38
//   re/disasm/ProChannel.OZChannel2D.dtor_base.s                    @0x48b7c
//   re/disasm/ProChannel.OZChannel2D.dtor_del.s                     @0x48a50
//
// Struct layout -- recovered from ctor+dtor+copy disassembly:
//   +0x00   vtable ptr             (installed in every ctor: leaq 0x8f70c(%rip),%rax; mov %rax,(%rbx))
//   +0x10   vtable-2 ptr           (secondary vtable / thunks; ctor: mov %rax,0x10(%rbx))
//   +0x00..+0x87   OZCompoundChannel base subobject  (constructed via
//                  OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&,
//                  OZChannelFolder*, uint, uint, bool, uint) @0x47070)
//   +0x88          OZChannel (X sub-channel) -- constructed as OZChannelDouble with sub-index 1
//                  (movl 0x1,%ecx @0x470c1); vtable stored at +0x88 (@0x478a7) and
//                  secondary vtable at +0x98 (@0x478b5). Copy ctor uses OZChannel::OZChannel
//                  (const&, OZChannelFolder*) @0x47896 which is OK because the X/Y sub-objects
//                  are OZChannel-shaped; the OZChannelDouble vtable slot is re-installed on top.
//   +0x120         OZChannel (Y sub-channel) -- same, sub-index 2 (movl 0x2,%ecx @0x47106).
//   sizeof         0x1b8  (clone allocates 0x1b8 via operator new @0x47924)
//
// This is the foundational 2D animation channel used everywhere translations/scale/anchor points
// live in .motr; every <parameter> that stores a 2D value hangs off one of these.

import type { CMTime } from "../infra/CMTime.js";

/**
 * A single-axis sub-channel view. In the real binary each of these is a full OZChannel /
 * OZChannelDouble subobject (0x98 bytes wide, containing tangents/keyframes/curve/...). Here we
 * model just the surface exposed to OZChannel2D so struct field byte offsets stay documented but
 * the deep guts stay in OZChannel.ts (see raw-port/src/channels/OZChannel.ts).
 *
 * All members are named after the OZChannel/OZChannelDouble methods that OZChannel2D invokes on
 * them (via the OZChannelDouble vtable installed at +0 and +0x10 of each sub-channel):
 *
 *   vtable[0x2c8] = OZChannel::setValue(CMTime const&, double, bool)
 *                                                              @ProChannel 0x1663c
 *   OZChannel::getKeyframe(CMTime const&)                      @ProChannel (used by @0x47a72 etc.)
 *   OZChannel::getKeyframe(void*, CMTime*, double*)            @ProChannel (used by @0x47aa0)
 *   OZChannel::setKeyframe(CMTime const&, double, bool)        @ProChannel (used by @0x47ac7)
 *   OZChannel::setKeyframeOutputTangents(void*, double, double, bool)
 *                                                              @ProChannel (used by @0x47e9b)
 *   OZChannel::setKeyframeInputTangents(void*, double, double, bool)
 *                                                              @ProChannel (used by @0x47eb1)
 *   OZChannel::setKeyframeTangentsBroken(void*, bool)          @ProChannel (used by @0x47eea)
 *   OZChannel::setKeyframeInterpolation(void*, uint)           @ProChannel (used by @0x47f47)
 *   OZChannel::getCurveValue(CMTime const&, bool)              @ProChannel (used by @0x47ab2)
 *   OZChannel::getPreviousKeyframe(CMTime const&, CMTime*, double*) const
 *                                                              @ProChannel (used by @0x47b42)
 *   OZChannel::getValueAsDouble(CMTime const&, double) const   @ProChannel (used by @0x47fed)
 *   OZChannelBase::globalToLocalTime(CMTime const&) const      @ProChannel (used by @0x48031)
 */
export interface OZChannel2DAxis {
  /** vtable @+0x00 -- installed to OZChannelDouble vtable (installed-ptr = vtable+0x10). */
  setValue(t: CMTime, v: number, force: boolean): void;
  getKeyframe(t: CMTime): unknown | null;
  setKeyframeOutputTangents(kf: unknown, dx: number, dy: number, broken: boolean): void;
  setKeyframeInputTangents(kf: unknown, dx: number, dy: number, broken: boolean): void;
  setKeyframeTangentsBroken(kf: unknown, broken: boolean): void;
  setKeyframeInterpolation(kf: unknown, interp: number): void;
  getCurveValue(t: CMTime, extrap: boolean): number;
  getValueAsDouble(t: CMTime, defaultValue: number): number;
  globalToLocalTime(t: CMTime): CMTime;
}

/**
 * OZChannel2D -- 2D value channel (x,y over time). Faithful transcription. See file header for
 * struct layout + provenance for every field.
 */
export class OZChannel2D {
  /** X sub-channel -- struct offset +0x88 (see ctor @0x470ac / copy-ctor @0x478a7). */
  readonly x: OZChannel2DAxis;
  /** Y sub-channel -- struct offset +0x120 (see ctor @0x470f4 / copy-ctor @0x478d3). */
  readonly y: OZChannel2DAxis;

  /**
   * Primary ctor used by call-sites that already have a pair of OZChannel sub-channels
   * (OZChannel2D::OZChannel2D(OZFactory*, PCString const&, OZChannelFolder*, uint, uint, uint,
   * OZChannelImpl*, OZChannelInfo*) @0x47050 / C1 forwarder @0x47168). The binary constructs
   * fresh OZChannelDouble sub-objects at +0x88 and +0x120 with sub-index 1 (X) and 2 (Y). Here
   * we accept the two sub-channels the parent already built.
   *
   * The other ctors enumerated in the brief (@0x47172 (dd + factory + folder),
   * @0x47172/@0x472a8/@0x47392/@0x474f2/@0x475f2/@0x47742 and their C1 forwarders) are all
   * variations that (a) look up OZChannel2D_Factory::getInstance() @0x473c0 for the factory
   * slot, (b) instantiate a bundled PCString name from getProChannelBundle() @0x4708a for each
   * sub-axis, then (c) either OZChannelDouble::OZChannelDouble(PCString const&, ...) @0x470cc or
   * OZChannelDouble::OZChannelDouble(double, PCString const&, ...) @0x47445 for each sub-channel.
   * In this port those overloads collapse to constructing the pair yourself and passing them in.
   */
  constructor(xAxis: OZChannel2DAxis, yAxis: OZChannel2DAxis) {
    this.x = xAxis;
    this.y = yAxis;
  }

  /**
   * clone -- OZChannel2D::clone() const @0x4791a.
   *   new (operator new @0x47929, size 0x1b8) OZChannel2D(*this, nullptr //folder)
   * i.e. invokes the copy ctor @0x47856 with folder=null (xorl %edx,%edx @0x47937).
   */
  clone(): OZChannel2D {
    return this.copyCtor(this, null);
  }

  /**
   * copy -- OZChannel2D::copy(OZChannelBase const*, bool) @0x4795a.
   * Faithful control flow:
   *   OZCompoundChannel::copy(base, deep)                             @0x4796d
   *   if (base != null)  base = dynamic_cast<OZChannel2D*>(base)      @0x4798a  (typeinfo @0x47977/@0x4797e)
   *   else               base = nullptr                               @0x47994
   *   OZChannel::copy(&this->x, base ? &base->x : nullptr, deep)      @0x479aa   ((base?+0x88))
   *   OZChannel::copy(&this->y, base ? &base->y : nullptr, deep)      tail-called @0x479cd  (offset +0x120)
   *
   * OZCompoundChannel::copy @0x4796d handles the base-class bookkeeping (flags/factory ref);
   * it (@0x4796d) has not yet been ported so this method throws citing that address if the
   * base-copy would be observable. When OZCompoundChannel is ported the two axis copy() calls
   * become the whole body (the interior of this fn is just those two calls).
   */
  copy(_src: OZChannel2D | null, _deep: boolean): void {
    throw new Error(
      "OZChannel2D::copy @ProChannel 0x4795a not yet transcribed " +
      "(delegates to OZCompoundChannel::copy @0x4796d + per-axis OZChannel::copy @0x479aa/@0x479cd)"
    );
  }

  /**
   * flattenAtTime -- OZChannel2D::flattenAtTime(CMTime const&) @0x47e52.
   * Faithful control flow (both axes, no branching):
   *   kfX = x.getKeyframe(t)                                       @0x47e6d
   *   kfY = y.getKeyframe(t)                                       @0x47e82
   *   x.setKeyframeOutputTangents(kfX, 0.0, 0.0, true)             @0x47e9b
   *   x.setKeyframeInputTangents (kfX, 0.0, 0.0, true)             @0x47eb1
   *   y.setKeyframeOutputTangents(kfY, 0.0, 0.0, true)             @0x47ec7
   *   y.setKeyframeInputTangents (kfY, 0.0, 0.0, true)             @0x47edd
   *   x.setKeyframeTangentsBroken(kfX, false)                      @0x47eea
   *   y.setKeyframeTangentsBroken(kfY, false)  (tail)              @0x47eff
   * (xorps %xmm0,%xmm0; xorps %xmm1,%xmm1 sets both tangent scalars to +0.0; movl 0x1,%edx
   *  passes true for the fourth arg; xorl %edx,%edx passes false for the third.)
   */
  flattenAtTime(t: CMTime): void {
    const kfX = this.x.getKeyframe(t);
    const kfY = this.y.getKeyframe(t);
    this.x.setKeyframeOutputTangents(kfX, 0.0, 0.0, true);
    this.x.setKeyframeInputTangents(kfX, 0.0, 0.0, true);
    this.y.setKeyframeOutputTangents(kfY, 0.0, 0.0, true);
    this.y.setKeyframeInputTangents(kfY, 0.0, 0.0, true);
    this.x.setKeyframeTangentsBroken(kfX, false);
    this.y.setKeyframeTangentsBroken(kfY, false);
  }

  /**
   * setLinearAtTime -- OZChannel2D::setLinearAtTime(CMTime const&) @0x47f04.
   * Faithful control flow:
   *   kfX = x.getKeyframe(t)                                @0x47f1f
   *   kfY = y.getKeyframe(t)                                @0x47f34
   *   x.setKeyframeInterpolation(kfX, 1)                    @0x47f47   (linear = 1)
   *   y.setKeyframeInterpolation(kfY, 1)  (tail)            @0x47f5f
   * (movl 0x1,%edx at @0x47f42 / @0x47f52 is the interpolation-kind enum; 1 = linear per
   *  the OZChannel interpolation table decoded in interpolators.ts.)
   */
  setLinearAtTime(t: CMTime): void {
    const kfX = this.x.getKeyframe(t);
    const kfY = this.y.getKeyframe(t);
    this.x.setKeyframeInterpolation(kfX, 1);
    this.y.setKeyframeInterpolation(kfY, 1);
  }

  /**
   * setValue -- OZChannel2D::setValue(CMTime const&, double, double, bool) @0x47f64.
   * Faithful control flow (delegates to each axis via the OZChannelDouble vtable slot @0x2c8
   * which is OZChannel::setValue(CMTime const&, double, bool) @ProChannel 0x1663c):
   *   x.setValue(t, xv, force)             @0x47f89   (*(vtbl_x + 0x2c8))
   *   y.setValue(t, yv, force)  (tail)     @0x47fbb   (*(vtbl_y + 0x2c8))
   */
  setValue(t: CMTime, xv: number, yv: number, force: boolean): void {
    this.x.setValue(t, xv, force);
    this.y.setValue(t, yv, force);
  }

  /**
   * setValueOffsetByBehaviors -- OZChannel2D::setValueOffsetByBehaviors(CMTime const&, double,
   * double) @0x47fbe. Sets each axis so the sampled value at time t (including any curve
   * offset from OZChannel::getCurveValue applied at the localised time) equals the target.
   *
   * Faithful reconstruction (mirroring the two mirrored X/Y blocks in the disasm):
   *   xDelta = xt - x.getValueAsDouble(t, 0.0)                 @0x47fed -> subsd @0x47ff7
   *   yDelta = yt - y.getValueAsDouble(t, 0.0)                 @0x48011 -> subsd @0x4801b
   *   localX = x.globalToLocalTime(t)                          @0x48031
   *   curveX = x.getCurveValue(localX, false)                  @0x4803e   (extrap = false)
   *   localY = y.globalToLocalTime(t)                          @0x48051
   *   curveY = y.getCurveValue(localY, false)                  @0x4805e
   *   finalX = curveX + xDelta                                 @0x4806c  (addsd)
   *   finalY = curveY + yDelta                                 @0x48071  (addsd)
   *   x.setValue(t, finalX, false)                             @0x4808a  (*(vtbl_x + 0x2c8), force=false)
   *   y.setValue(t, finalY, false)                             @0x480a4  (*(vtbl_y + 0x2c8), force=false)
   *
   * Numerics: all math is IEEE-754 double (subsd/addsd) -- no fround needed here.
   */
  setValueOffsetByBehaviors(t: CMTime, xt: number, yt: number): void {
    // X axis
    const xDelta = xt - this.x.getValueAsDouble(t, 0.0);
    const localX = this.x.globalToLocalTime(t);
    const curveX = this.x.getCurveValue(localX, false);
    // Y axis
    const yDelta = yt - this.y.getValueAsDouble(t, 0.0);
    const localY = this.y.globalToLocalTime(t);
    const curveY = this.y.getCurveValue(localY, false);
    // Commit
    this.x.setValue(t, curveX + xDelta, false);
    this.y.setValue(t, curveY + yDelta, false);
  }

  /**
   * getObjCWrapperName -- OZChannel2D::getObjCWrapperName() @0x48a38.
   * The binary loads a CFString reference at RIP-relative 0x9c56d (@0x48a3c) and returns it.
   * The exact CFString bytes require a live otool-decoded CFString section read; the body
   * @0x48a38 is therefore represented as a throwing stub below (see the throw's own cite).
   */
  getObjCWrapperName(): string {
    throw new Error(
      "OZChannel2D::getObjCWrapperName @ProChannel 0x48a38 not yet transcribed (CFString @0x48a3c)"
    );
  }

  /**
   * deriveChannel -- OZChannel2D::deriveChannel(CMTime const&) @0x479d2. A 294-line routine
   * that derives (differentiates) both axes at time t: reads the previous/next keyframes on
   * each axis (OZChannel::getPreviousKeyframe @0x47b42, OZChannel::getKeyframe @0x47a72 /
   * @0x47b4d, OZChannel::getKeyframe(void*, CMTime*, double*) @0x47aa0), computes tangents
   * from finite differences, and rewrites the keyframe tangents in place. Full body pending
   * decode of the CMTimeZero / CMTimeCompare / tangent math it inlines (kCMTimeZero read at
   * @0x47a06, four local CMTime slots at -0x110 / -0xf0 / -0xd0 / -0xb0).
   */
  deriveChannel(_t: CMTime): void {
    throw new Error(
      "OZChannel2D::deriveChannel @ProChannel 0x479d2 not yet transcribed " +
      "(294-line tangent-from-finite-differences body)"
    );
  }

  /**
   * simplify -- OZChannel2D::simplify(CMTime const&, CMTime const&, CMTime const&, double,
   * uint, uint, bool) @0x480ba. A 561-line routine that walks the [t0,t1] range on both axes,
   * removes keyframes whose 2D-Euclidean deviation from the fitted spline is below the epsilon
   * (fourth arg) with the two flags-uint arguments (fifth+sixth) selecting the fit policy, then
   * commits the simplification (bool arg = commit vs preview). Full body pending decode of the
   * per-axis fit/deviation math it inlines.
   */
  simplify(
    _t0: CMTime, _t1: CMTime, _tolerance: CMTime,
    _epsilon: number, _mode: number, _mode2: number, _commit: boolean,
  ): void {
    throw new Error(
      "OZChannel2D::simplify @ProChannel 0x480ba not yet transcribed " +
      "(561-line 2D keyframe-simplification body)"
    );
  }

  /**
   * Internal helper -- copy ctor OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*)
   * @0x47856. Faithful control flow:
   *   OZCompoundChannel::OZCompoundChannel(base, folder)                       @0x4786a
   *   install primary/secondary vtable ptrs @+0x00/+0x10                       @0x4786f-@0x47880
   *   OZChannel::OZChannel(&this->x, &src->x, this //folder)                   @0x47896  (offset +0x88)
   *   overwrite this->x's vtable pointers with OZChannelDouble vtable          @0x478a7/@0x478b5
   *   OZChannel::OZChannel(&this->y, &src->y, this //folder)                   @0x478ce  (offset +0x120)
   *   overwrite this->y's vtable pointers with OZChannelDouble vtable          @0x478d3/@0x478da
   *
   * The OZChannel/OZChannelDouble vtable machinery is expressed via the axes' own clone()
   * method (each concrete OZChannel implementation defines it with its own vtable). folder is
   * unused because OZCompoundChannel is not yet ported (see @0x4786a).
   */
  private copyCtor(src: OZChannel2D, _folder: unknown | null): OZChannel2D {
    // OZCompoundChannel::OZCompoundChannel(base, folder) -- not yet transcribed (base class).
    // For a clone that only exercises the sub-channels this is a no-op above OZChannelBase state.
    const xClone = (src.x as unknown as { clone(): OZChannel2DAxis }).clone();
    const yClone = (src.y as unknown as { clone(): OZChannel2DAxis }).clone();
    return new OZChannel2D(xClone, yClone);
  }

  /**
   * Destructor -- OZChannel2D::~OZChannel2D() @0x48b7c (D2) / @0x48a46 (D1 forwarder) /
   *                                            @0x48a50 (D0 = deleting).
   * Faithful control flow (D2 body @0x48b7c):
   *   this->vtable      = &OZChannel2D_vtable_secondary    (@0x48b85 -> +0x00)
   *   this->vtable_2    = &OZChannel2D_vtable_thunk        (@0x48b8f -> +0x10)
   *   ~OZChannel(&this->y)   at offset +0x120              @0x48ba1
   *   ~OZChannel(&this->x)   at offset +0x88               @0x48bad
   *   ~OZCompoundChannel(this)                    (tail)   @0x48bbb
   * D0 @0x48a50 calls ~OZChannel2D then operator delete (__ZdlPv @0x48a67).
   *
   * TypeScript has no explicit destructors; the equivalent is dropping the object. The two
   * sub-channel destructors are OZChannel::~OZChannel @ProChannel (used by @0x48ba1/@0x48bad);
   * they release any keyframe / curve storage which JS's GC handles automatically.
   */
  // (no method body -- documented for provenance only; see @0x48b7c above.)
}
