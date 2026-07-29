// OZChannelRotation3D — a compound rotation-3D channel (Euler X/Y/Z + interpolation-mode enum).
// Faithful port of FCP class OZChannelRotation3D (ProChannel.framework). Struct layout recovered
// from ctor + dtor + accessor disasm:
//   +0x000 vtable (@ProChannel 0x5cf14 base; primary+0x350 secondary/OZCompoundChannel)
//   +0x008 …     OZCompoundChannel base subobject (ctor @ProChannel 0x810fa: 4-arg OZFactory
//                variant; 10-arg/copy variants call the matching base ctor)
//   +0x088 OZChannelAngle x  (size 0x98)   — channelID 1, name "X" (getProChannelBundle localized)
//   +0x120 OZChannelAngle y  (size 0x98)   — channelID 2, name "Y"
//   +0x1b8 OZChannelAngle z  (size 0x98)   — channelID 3, name "Z"
//   +0x250 OZChannelEnum interpolationMode  (size 0x100)  — 0=Euler, 1=Quaternion
//   +0x350 PCSpinLock                       (size 0x8)    — used for setCustomInterpolator install
//   +0x358 sizeof(OZChannelRotation3D)      — matches clone()'s new-size @ProChannel 0x8169c
//
// Nearly every method here forwards to embedded child channels (via offsets 0x88/0x120/0x1b8) and
// to base class routines (OZCompoundChannel, OZChannelFolder) which are not yet ported. The only
// FULLY PURE-MATH functions we can transcribe now are getValueAsEulerAngles and getValueAsQuatd —
// both read the three embedded child scalars via OZChannel::getValueAsDouble @ProChannel 0x69820
// (unported) and combine them. Everything else has a throwing stub citing its @0xADDR so the gate
// (frontier.py) sees the gap and refuses shortcuts.
//
// KEY UNIT FINDING (getValueAsQuatd @0x82062): each Euler component is multiplied by the ONE literal
// 0.5 (RIP-constant @ProChannel 0xb03c0 = 0x3fe0000000000000) before ___sincos_stret. That is a
// HALF-ANGLE only, meaning the child OZChannelAngles are ALREADY IN RADIANS (no π/180 factor lives
// anywhere in this getter). The OZChannelAngle type presumably enforces or accepts radians; do NOT
// insert a degrees-to-radians conversion here. getValueAsEulerAngles @0x82684 returns the raw child
// doubles verbatim (also radians) with no conversion.

import { OZChannelBase } from "./OZChannelBase.js";

/** 4-double PCQuat<double> in the layout that setValueAsQuatd/getValueAsQuatd stores to:
 *  +0x00 = component 0 (w in the standard reading; matches cx*cy*cz + sx*sy*sz)
 *  +0x08 = component 1 (matches sx*cy*cz + cx*sy*sz)
 *  +0x10 = component 2 (matches cx*sy*cz - sx*cy*sz)
 *  +0x18 = component 3 (matches cx*cy*sz - sx*sy*cz)
 *  See disasm re/disasm/ProChannel.OZChannelRotation3D.getValueAsQuatd.s. */
export type PCQuatd = { 0: number; 1: number; 2: number; 3: number };

/** 3-double PCVector3<double>. Layout +0x00 x, +0x08 y, +0x10 z. */
export type PCVector3d = { 0: number; 1: number; 2: number };

/** CMTime — type-shape for signatures; actual time flows through the (unported) OZChannel getters. */
export interface CMTimeLike { value: bigint; timescale: number; flags: number; epoch: bigint }

// ---- Forward-declared unported dependencies (throw at call site with their @0xADDR). ------------

/** OZChannel::getValueAsDouble(CMTime const&, double) const @ProChannel 0x69820 (nearest sym from
 *  callq __ZNK9OZChannel16getValueAsDoubleERK6CMTimed). Not yet transcribed. */
function OZChannel_getValueAsDouble(_ch: unknown, _t: CMTimeLike, _frac: number): number {
  throw new Error("OZChannel::getValueAsDouble @ProChannel @0x69820 not yet transcribed (called " +
                  "from OZChannelRotation3D::getValueAsEulerAngles @0x82684 / getValueAsQuatd " +
                  "@0x82062 / setValueAsQuatd @0x82288 / setValue @0x8186a / " +
                  "interpolationModeWasSet @0x82704)");
}

/** OZChannel::getValueAsInt(CMTime const&, double) const @ProChannel (nearest sym from callq
 *  __ZNK9OZChannel13getValueAsIntERK6CMTimed). Not yet transcribed. */
function OZChannel_getValueAsInt(_ch: unknown, _t: CMTimeLike, _frac: number): number {
  throw new Error("OZChannel::getValueAsInt @ProChannel — called from " +
                  "OZChannelRotation3D::isQuaternionMode @0x8202f / interpolationModeWasSet " +
                  "@0x8272f — not yet transcribed");
}

/** OZChannelBase::willBeModified(unsigned int) — direct (non-virtual) base call at @ProChannel
 *  0x82048 (from OZChannelRotation3D::willBeModified). Not yet transcribed. */
function OZChannel_baseWillBeModified(_this: unknown, _flag: number): void {
  throw new Error("OZChannelBase::willBeModified @ProChannel — called from " +
                  "OZChannelRotation3D::willBeModified @0x82048 — not yet transcribed");
}

// ---------------------------------------------------------------------------------------------------

/** OZChannelRotation3D — Euler-XYZ compound channel with an interpolation-mode enum child. */
export class OZChannelRotation3D extends OZChannelBase {
  /** Embedded OZChannelAngle child at +0x88 (x). Not fully constructed here — see ctors below. */
  readonly x: unknown; // OZChannelAngle*
  /** Embedded OZChannelAngle child at +0x120 (y). */
  readonly y: unknown; // OZChannelAngle*
  /** Embedded OZChannelAngle child at +0x1b8 (z). */
  readonly z: unknown; // OZChannelAngle*
  /** Embedded OZChannelEnum at +0x250 (interpolationMode: 0=Euler, 1=Quaternion). */
  readonly interpolationMode: unknown; // OZChannelEnum*
  /** PCSpinLock at +0x350. Used by initCustomInterpolator to install the shared static
   *  _interpolator into each child channel atomically. */
  readonly spinLock: unknown;

  // Static shared interpolator — file-scope __ZN19OZChannelRotation3D13_interpolatorE
  // (rip-relative in initCustomInterpolator @0x80d1a). Newed lazily to a 24-byte OZInterpolator
  // subclass with a custom vtable @ProChannel 0x5de66-relative + fields (0x10 byte=0, 0x14 u32=0).
  private static _interpolator: unknown | null = null;

  /**
   * OZChannelRotation3D::OZChannelRotation3D(OZFactory*, PCString const&, unsigned int,
   *                                          unsigned int) @ProChannel 0x810e6 (C2) / 0x81368 (C1).
   *
   * Chains OZCompoundChannel(OZFactory*, PCString&, uint, uint) @0x810fa; installs primary vtable
   * @0x5d32a + secondary @0x5d660; constructs three OZChannelAngle children ("X"/"Y"/"Z" via
   * getProChannelBundle()) with initial value 0.0 and channelIDs 1,2,3; then OZChannelEnum
   * interpolationMode @+0x250; then PCSpinLock @+0x350.
   */
  static fromFactory(
    _factory: unknown, _name: string, _unk1: number, _unk2: number,
  ): OZChannelRotation3D {
    throw new Error("OZChannelRotation3D::OZChannelRotation3D(OZFactory*, PCString const&, " +
                    "unsigned int, unsigned int) @ProChannel @0x810e6 not yet transcribed " +
                    "(requires OZCompoundChannel + OZChannelAngle + OZChannelEnum + PCSpinLock ports)");
  }

  /**
   * OZChannelRotation3D::OZChannelRotation3D(double, double, double, PCString const&,
   *   OZChannelFolder*, unsigned int, unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)
   * @ProChannel 0x80df8 (C2) / 0x810dc (C1 thunk).
   */
  static fromEulerAndFolder(
    _x: number, _y: number, _z: number,
    _name: string, _folder: unknown, _u1: number, _u2: number, _u3: number,
    _impl: unknown, _info: unknown,
  ): OZChannelRotation3D {
    throw new Error("OZChannelRotation3D::OZChannelRotation3D(d,d,d,PCString&,OZChannelFolder*," +
                    "uint,uint,uint,OZChannelImpl*,OZChannelInfo*) @ProChannel @0x80df8 not yet " +
                    "transcribed (requires OZCompoundChannel + OZChannelAngle + OZChannelEnum + " +
                    "OZChannelRotation3D_Factory ports)");
  }

  /**
   * OZChannelRotation3D::OZChannelRotation3D(PCString const&, OZChannelFolder*, unsigned int,
   *   unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*) @ProChannel 0x80984 (unnamed C2,
   *   COMDAT-folded — C1 alias at @0x80dee jumps to this address).
   */
  static fromFolder(
    _name: string, _folder: unknown, _u1: number, _u2: number, _u3: number,
    _impl: unknown, _info: unknown,
  ): OZChannelRotation3D {
    throw new Error("OZChannelRotation3D::OZChannelRotation3D(PCString&,OZChannelFolder*,uint,uint," +
                    "uint,OZChannelImpl*,OZChannelInfo*) @ProChannel @0x80984 not yet transcribed");
  }

  /**
   * OZChannelRotation3D::OZChannelRotation3D(OZChannelRotation3D const&, OZChannelFolder*)
   * @ProChannel 0x81372 (C2) / 0x81502 (C1 thunk).
   *
   * Chains OZCompoundChannel(const&, OZChannelFolder*) @0x81389; installs vtable pointers @0x5d09b
   * + @0x5d3d1; copy-constructs the three OZChannel children in place (offsets 0x88/0x120/0x1b8)
   * via OZChannel(OZChannel const&, OZChannelFolder*), then overwrites their vtables with
   * OZChannelAngle's primary+0x10 and +0x370 (stores @0x813c9/0x813d7/0x813f6/0x813fd).
   */
  static copyFrom(_other: OZChannelRotation3D, _folder: unknown): OZChannelRotation3D {
    throw new Error("OZChannelRotation3D::OZChannelRotation3D(OZChannelRotation3D const&, " +
                    "OZChannelFolder*) @ProChannel @0x81372 not yet transcribed");
  }

  /**
   * OZChannelRotation3D::~OZChannelRotation3D() @ProChannel 0x8150c (D2) / 0x81578 (D1) / 0x81590 (D0).
   *
   * Restores base vtable @0x5cf14+0x10, destroys embedded subobjects in reverse construction
   * order (PCSpinLock @+0x350, OZChannelEnum @+0x250, OZChannel @+0x1b8/+0x120/+0x88), then
   * tail-jumps to OZCompoundChannel::~OZCompoundChannel(). TS GC handles the equivalent.
   */
  dispose(): void {
    // no-op: embedded native subobject dtors (@ProChannel @0x8150c) have no TS analog.
  }

  /**
   * OZChannelRotation3D::operator=(OZChannelRotation3D const&) @ProChannel 0x815d0.
   * Trivial dispatcher: loads primary vtable, calls slot *0xe8 (=OZChannel::copy per vtable dump)
   * with copyChildren=true. Returns *this.
   */
  operatorAssign(other: OZChannelBase | null): this {
    this.copy(other, true);
    return this;
  }

  /**
   * OZChannelRotation3D::copy(OZChannelBase const*, bool) @ProChannel 0x815f2.
   * Calls OZCompoundChannel::copy(base, doChildCopy) @0x81605; dynamic_cast<OZChannelRotation3D
   * const*>(base) @0x81622; if non-null copies each of the three OZChannel children in-place via
   * OZChannel::copy(base+offset, doChildCopy) at 0x88/0x120/0x1b8. The enum @+0x250 is NOT copied.
   */
  copy(_base: OZChannelBase | null, _doChildCopy: boolean): void {
    throw new Error("OZChannelRotation3D::copy(OZChannelBase const*, bool) @ProChannel @0x815f2 " +
                    "not yet transcribed (requires OZCompoundChannel::copy + OZChannel::copy ports)");
  }

  /**
   * OZChannelRotation3D::clone() const @ProChannel 0x81692.
   *   new(0x358) OZChannelRotation3D(*this, nullptr) via C2ERKS_P15OZChannelFolder @0x816b1.
   */
  clone(): OZChannelRotation3D {
    return OZChannelRotation3D.copyFrom(this, null);
  }

  /**
   * OZChannelRotation3D::interpWillBeModified(unsigned int) @ProChannel 0x816fc.
   * Calls OZChannel::parentWillBeModified(unsigned int) on each of the three children @+0x88,
   * +0x120, +0x1b8 (tail-jmp on the last @0x81732).
   */
  interpWillBeModified(_flag: number): void {
    throw new Error("OZChannelRotation3D::interpWillBeModified @ProChannel @0x816fc — dependency " +
                    "OZChannel::parentWillBeModified(unsigned int) not yet transcribed");
  }

  /**
   * OZChannelRotation3D::setCurveInterpolation(unsigned int) @ProChannel 0x81738.
   * Calls (*this[0]).*0x328 with esi=0 (primary vtable slot, unresolved), then
   * OZChannel::setInterpolation(v) on each of the three children.
   */
  setCurveInterpolation(_v: number): void {
    throw new Error("OZChannelRotation3D::setCurveInterpolation @ProChannel @0x81738 — depends on " +
                    "primary-vtable slot *0x328 (unresolved) and OZChannel::setInterpolation");
  }

  /**
   * OZChannelRotation3D::setKeypointInterpolation(OZChannel*, void*, unsigned int, bool)
   * @ProChannel 0x81780. Reads keyframe from SOURCE channel via OZChannel::getKeyframe @0x817c6,
   * propagates interpolation to OTHER two children via OZChannel::getKeyframe(CMTime const&)
   * @0x817de and OZChannel::setKeypointInterpolation.
   */
  setKeypointInterpolation(_ch: unknown, _pt: unknown, _mode: number, _b: boolean): void {
    throw new Error("OZChannelRotation3D::setKeypointInterpolation @ProChannel @0x81780 not yet " +
                    "transcribed (requires OZChannel::getKeyframe / setKeypointInterpolation ports)");
  }

  /**
   * OZChannelRotation3D::setValue(OZChannel*, CMTime const&, double) @ProChannel 0x8186a.
   *
   * If OZChannelFolder::testFoldFlag(0x100000) is FALSE @0x818ee: tail-forward to child vtable
   * *0x2c8 (OZChannel::setValue-family). If TRUE @0x81897: resetFoldFlag(0x100000); if the source
   * == exactly one of the three children (offsets 0x88/0x120/0x1b8), set only that one via *0x2c8
   * @0x818e3; else @0x81915 read the three current child values (getValueAsDouble on x/y/z), set
   * the enum @+0x250 to 1 @0x81973 (interpolationMode -> Quaternion), then setValue on all three
   * children with `newValue` substituted for the source channel.
   */
  setValue(_ch: unknown, _t: CMTimeLike, _v: number): void {
    throw new Error("OZChannelRotation3D::setValue @ProChannel @0x8186a not yet transcribed " +
                    "(requires OZChannelFolder::testFoldFlag / resetFoldFlag + OZChannel::setValue " +
                    "+ setKeyframe + vtable slot *0x2c8 ports)");
  }

  /**
   * OZChannelRotation3D::compoundAddKeypointAt(OZChannel*, CMTime const&, bool) @ProChannel 0x81a06.
   * If arg3(bypass) OR testFoldFlag(0x100000) is true @0x81a2a-31: tail-forward to child vtable
   * *0x258 @0x81a36 (addKeypointAt-family). Else compound path @0x81a53 iterates the three children.
   */
  compoundAddKeypointAt(_ch: unknown, _t: CMTimeLike, _bypass: boolean): void {
    throw new Error("OZChannelRotation3D::compoundAddKeypointAt @ProChannel @0x81a06 not yet " +
                    "transcribed (requires OZChannelFolder::testFoldFlag + OZChannel vtable *0x258)");
  }

  /**
   * OZChannelRotation3D::compoundMoveKeypointTo(OZChannel*, CMTime const&, CMTime const&, bool,
   *   bool, bool) @ProChannel 0x81b1c. Same testFoldFlag(0x100000) branch pattern @0x81b59.
   */
  compoundMoveKeypointTo(
    _ch: unknown, _from: CMTimeLike, _to: CMTimeLike, _b1: boolean, _b2: boolean, _b3: boolean,
  ): void {
    throw new Error("OZChannelRotation3D::compoundMoveKeypointTo @ProChannel @0x81b1c not yet " +
                    "transcribed (requires OZChannelFolder::testFoldFlag + OZChannel keyframe ops)");
  }

  /**
   * OZChannelRotation3D::compoundDeleteKeypointAt(OZChannel*, CMTime const&, bool) @ProChannel 0x81ce0.
   * Same fold-flag pattern; forwards to child vtable *0x260 @0x81d10 (deleteKeypointAt-family).
   */
  compoundDeleteKeypointAt(_ch: unknown, _t: CMTimeLike, _bypass: boolean): void {
    throw new Error("OZChannelRotation3D::compoundDeleteKeypointAt @ProChannel @0x81ce0 not yet " +
                    "transcribed (requires OZChannel vtable *0x260)");
  }

  /**
   * OZChannelRotation3D::compoundReset(OZChannel*, bool) @ProChannel 0x81df6.
   * Forwards to child vtable *0x120 @0x81e23 (compoundReset-family).
   */
  compoundReset(_ch: unknown, _bypass: boolean): void {
    throw new Error("OZChannelRotation3D::compoundReset @ProChannel @0x81df6 not yet transcribed " +
                    "(requires OZChannel vtable *0x120)");
  }

  /**
   * OZChannelRotation3D::compoundSetIsSpline(OZChannel*, bool, bool) @ProChannel 0x81efe.
   * Forwards to child vtable *0x1e0 @0x81f2e (setIsSpline).
   */
  compoundSetIsSpline(_ch: unknown, _isSpline: boolean, _bypass: boolean): void {
    throw new Error("OZChannelRotation3D::compoundSetIsSpline @ProChannel @0x81efe not yet " +
                    "transcribed (requires OZChannel vtable *0x1e0)");
  }

  /**
   * OZChannelRotation3D::isQuaternionMode() @ProChannel 0x8201a.
   *
   *   addq  $0x250, %rdi                    ; -> &interpolationMode
   *   movq  _kCMTimeZero(%rip), %rsi
   *   xorps %xmm0, %xmm0                    ; fraction = 0.0
   *   callq OZChannel::getValueAsInt(CMTime const&, double) const   ; @0x8202f
   *   cmpl  $0x1, %eax
   *   sete  %al
   *   ret
   *
   * i.e. `(interpolationMode->getValueAsInt(kCMTimeZero, 0.0)) == 1`.
   */
  isQuaternionMode(): boolean {
    const kCMTimeZero: CMTimeLike = { value: 0n, timescale: 0, flags: 0, epoch: 0n };
    return OZChannel_getValueAsInt(this.interpolationMode, kCMTimeZero, 0.0) === 1;
  }

  /**
   * OZChannelRotation3D::willBeModified(unsigned int) @ProChannel 0x8203c.
   *
   *   callq OZChannelBase::willBeModified(unsigned int)   ; base call @0x82048
   *   movq  (this), %rax
   *   movq  0x328(%rax), %rax                             ; primary-vtable slot *0x328
   *   jmpq  *%rax                                          ; tail-jump
   *
   * Slot *0x328 resolved via `python3 raw-port/army/tools/resolve.py ProChannel vtable
   * OZChannelRotation3D 0x328` -> 0x816fc = OZChannelRotation3D::interpWillBeModified(unsigned int).
   * i.e. this is a base modify + tail-jump to this class's interpWillBeModified — because
   * OZChannelRotation3D installs its own override at slot 0x328 (per the vtable dump), and no
   * subclass would resolve slot 0x328 to anything else at this level of the hierarchy. The virtual
   * dispatch is faithfully modeled by a direct self-call.
   *
   * The base OZChannelBase::willBeModified is not yet transcribed; we invoke it through
   * OZChannel_baseWillBeModified below, which throws with a @0xADDR-cited "not yet transcribed"
   * message — frontier.py will surface it as a genuine gap.
   */
  willBeModified(flag: number): void {
    // @0x82048 direct call to OZChannelBase::willBeModified.
    OZChannel_baseWillBeModified(this, flag);
    // @0x82060 tail-jump — vtable slot 0x328 for THIS class = interpWillBeModified.
    this.interpWillBeModified(flag);
  }

  /**
   * OZChannelRotation3D::getValueAsQuatd(PCQuat<double>&, CMTime const&, double) const
   *   @ProChannel 0x82062.
   *
   * Reads the three child scalars (radians) via OZChannel::getValueAsDouble on
   * this+0x88 (x @0x82087), +0x120 (y @0x820a0), +0x1b8 (z @0x820bc). Multiplies each by the
   * constant 0.5 (RIP-relative literal @ProChannel 0xb03c0 = 0x3fe0000000000000; loaded @0x820cb/
   * 0x820f8/0x82121) — the half-angle for quaternion-from-Euler. Passes each half-angle through
   * ___sincos_stret (stub @ProChannel 0xacea6, called @0x820d3/0x82100/0x82129) yielding
   * (sx, cx), (sy, cy), (sz, cz). Then combines and stores into the output PCQuat<double>:
   *
   *   q[0] (+0x00) =  cx*cy*cz + sx*sy*sz          ; store @0x82279 (last)
   *   q[1] (+0x08) =  sx*cy*cz + cx*sy*sz          ; store @0x8226a
   *   q[2] (+0x10) =  cx*sy*cz - sx*cy*sz          ; store @0x8226f
   *   q[3] (+0x18) =  cx*cy*sz - sx*sy*cz          ; store @0x82274
   *
   * (Store order and formulas recovered from register-by-register symbolic trace of the disasm;
   *  numerous `xorpd`/`mulsd` zero-terms in the compiled body cancel out to the above.)
   *
   * NB: because the halving constant is 0.5 with no π/180 factor, the child channels are
   *     expected to already be in RADIANS. Do not add a deg→rad conversion here.
   */
  getValueAsQuatd(out: PCQuatd, t: CMTimeLike, frac: number): void {
    const rx = OZChannel_getValueAsDouble(this.x, t, frac);
    const ry = OZChannel_getValueAsDouble(this.y, t, frac);
    const rz = OZChannel_getValueAsDouble(this.z, t, frac);
    const hx = rx * 0.5, hy = ry * 0.5, hz = rz * 0.5;
    const sx = Math.sin(hx), cx = Math.cos(hx);
    const sy = Math.sin(hy), cy = Math.cos(hy);
    const sz = Math.sin(hz), cz = Math.cos(hz);
    out[0] = cx * cy * cz + sx * sy * sz;
    out[1] = sx * cy * cz + cx * sy * sz;
    out[2] = cx * sy * cz - sx * cy * sz;
    out[3] = cx * cy * sz - sx * sy * cz;
  }

  /**
   * OZChannelRotation3D::setValueAsQuatd(PCQuat<double> const&, CMTime const&) @ProChannel 0x82288.
   *
   * 1) Read the three current-euler seeds via OZChannel::getValueAsDouble on x/y/z children
   *    @0x822b4/0x822d2/0x822ef.
   * 2) Call PCQuat<double>::getIncrementalEulerAngles(&x, &y, &z, RotationOrder=4) @0x82307
   *    (decomposes quat into euler biased toward the seed for branch-continuity; order hardcoded
   *    via `movl $0x4, %r8d`).
   * 3) For each of the three children, call vtable slot *0x2c8 on the child (OZChannel setter
   *    family) with the newly-computed euler component and edx=0 (@0x82327/0x82344/0x82361).
   */
  setValueAsQuatd(_q: PCQuatd, _t: CMTimeLike): void {
    throw new Error("OZChannelRotation3D::setValueAsQuatd @ProChannel @0x82288 not yet transcribed " +
                    "(requires OZChannel::getValueAsDouble + PCQuat<double>::getIncrementalEulerAngles" +
                    " @ProCore/ProChannel + OZChannel vtable *0x2c8)");
  }

  /**
   * OZChannelRotation3D::getValueAsEulerAngles(CMTime const&, PCVector3<double>*, double) const
   *   @ProChannel 0x82684.
   *
   *   x = OZChannel::getValueAsDouble(this+0x88,  t, frac)     ; @0x826a6
   *   y = OZChannel::getValueAsDouble(this+0x120, t, frac)     ; @0x826bf
   *   z = OZChannel::getValueAsDouble(this+0x1b8, t, frac)     ; @0x826db
   *   (%rbx)   = x     @0x826e5
   *   8(%rbx)  = y     @0x826e9
   *   0x10(%rbx)=z     @0x826f3
   *
   * No unit conversion — raw child doubles (radians per the getValueAsQuatd analysis above).
   */
  getValueAsEulerAngles(t: CMTimeLike, out: PCVector3d, frac: number): void {
    const x = OZChannel_getValueAsDouble(this.x, t, frac);
    const y = OZChannel_getValueAsDouble(this.y, t, frac);
    const z = OZChannel_getValueAsDouble(this.z, t, frac);
    out[0] = x;
    out[1] = y;
    out[2] = z;
  }

  /**
   * OZChannelRotation3D::interpolationModeWasSet() @ProChannel 0x82704.
   *
   * Reads interpolationMode(t=0) as int @0x8272f. If !=1 @0x82737: reset foldFlag(0x100000) —
   * tail-jump @0x828f1. If ==1: setKeyframe(kCMTimeZero, 0.0, forceKF=true) on the enum @0x8274f,
   * setFoldFlag(0x100000) @0x8275c, then iterate each of the three children:
   *   for r13 in {x@0x88, y@0x120, z@0x1b8}:
   *     kfs = child->getKeyframes(false)         ; primary-vtable slot *0x340 @0x827a6
   *     for kf in kfs:
   *       (kfTime, kfVal) = child->getKeyframe(kf.opaquePtr, ...) @0x8280b
   *       OZChannelFolder::addKeypointAt(kfTime) @0x82816
   *       for other in {x,y,z} \ r13:
   *         okf = other->getKeyframe(kfTime) @0x82844
   *         if okf: other->setKeyframeInterpolation(okf, child->getKeyframeInterpolation(kf)) @0x8286a
   *     delete kfs
   *   finally: enum->setKeyframe(kCMTimeZero, <double @ProChannel rip+0x2cc6a>, true) @0x828c7
   */
  interpolationModeWasSet(): void {
    throw new Error("OZChannelRotation3D::interpolationModeWasSet @ProChannel @0x82704 not yet " +
                    "transcribed (mode-switch keyframe migration; requires OZChannel::getKeyframes/" +
                    "getKeyframe/setKeyframe/*Interpolation + OZChannelFolder foldFlag/addKeypointAt)");
  }

  /**
   * OZChannelRotation3D::getObjCWrapperName() @ProChannel 0x82918.
   *   leaq 0x6318d(%rip), %rax     ; CFStringRef literal (otool renders as "bad cfstring ref";
   *                                ;   dyld_info -content needed to recover the exact name)
   *   ret
   *
   * Faithful port: this method has NO arithmetic — it is a single-instruction return of a
   * CFStringRef at a fixed __TEXT __cfstring slot. `otool -tV` renders every cfstring ref as the
   * literal marker `@"bad cfstring ref"`, so that IS what the raw disassembly conveys.
   * Convention across sibling ports (OZChannelPosition::getObjCWrapperName @0x76b46 in
   * OZChannelPosition.ts) is to return that exact string verbatim; we do the same here rather
   * than invent a class-name literal that has no grounding in the disasm.
   */
  getObjCWrapperName(): string {
    // @0x8291c leaq 0x6318d(%rip), %rax — otool renders the CFString ref as the marker below.
    return "bad cfstring ref";
  }

  /**
   * OZChannelRotation3D::parseEnd(PCSerializerReadStream&) @ProChannel 0x82926.
   *
   *   OZChannelFolder::parseEnd(s)              ; @0x8292f
   *   this->interpolationModeWasSet()           ; @0x82937
   *   return true                               ; movb $0x1,%al
   */
  parseEnd(_stream: unknown): boolean {
    throw new Error("OZChannelRotation3D::parseEnd @ProChannel @0x82926 not yet transcribed " +
                    "(requires OZChannelFolder::parseEnd + interpolationModeWasSet — both deferred)");
  }

  /**
   * OZChannelRotation3D::initCustomInterpolator() @ProChannel 0x80d0c.
   *
   * Lazily allocates a 24-byte OZInterpolator subclass into the file-scope static
   * OZChannelRotation3D::_interpolator (rip-relative @0x80d1a). Installs vtable
   * @ProChannel 0x5de66-relative + fields (0x10 byte=0, 0x14 u32=0). Then, for each child at
   * (@+0x88, +0x120, +0x1b8):
   *   OZChannel::setCustomInterpolator(childPtr, _interpolator, &this->spinLock@+0x350) @0x80d70
   *   OZChannel::setOwnerChannel(childPtr, childPtr)                                     @0x80dad
   * Last setOwnerChannel is a tail-jump @0x80dcb.
   */
  initCustomInterpolator(): void {
    throw new Error("OZChannelRotation3D::initCustomInterpolator @ProChannel @0x80d0c not yet " +
                    "transcribed (requires OZInterpolator ctor + OZChannel::setCustomInterpolator + " +
                    "OZChannel::setOwnerChannel ports)");
  }
}
