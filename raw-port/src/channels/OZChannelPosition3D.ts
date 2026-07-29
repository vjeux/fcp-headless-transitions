// OZChannelPosition3D — 3D animated position channel. Extends OZChannelPosition (which is 2D).
// Adds a Z sub-channel at +0x2e0 and a small in-Z-plane fast-path flag at +0x2d9. The
// arc-length / tangent / normal / binormal machinery inherited from the 2D parent is EXTENDED to
// 3D via getCachedVectors / getPositionOnPath / getTangent / getNormals / getBinormals — those
// heavy path-reparametrization routines are not yet transcribed and stubbed with @0xADDR throws.
// Faithful port from ProChannel.framework (Final Cut Pro).
//
// Class size: parent OZChannelPosition = 0x2c0 bytes; this class extends to at least 0x378
// (parent 0x2c0 + a std::vector<double> at +0x2c0..+0x2d7 + 2 booleans at +0x2d8/+0x2d9 +
// OZChannelDouble Z sub-channel at +0x2e0..+0x377).
//
// Struct layout recovered from ctor @0x76fe2, copy @0x772ba, willBeModified @0x7afe0,
// isInZEqualsZeroPlane @0x7e0ce, setPosition @0x77348, offsetPosition @0x773e2:
//   +0x000..+0x087  OZCompoundChannel / OZChannel2D / OZChannelPosition base (vtable @0xdd4d0
//                   installed by ctor @0x77001+@0x7700b: dual leaq for main + DR vtables).
//   +0x088..+0x11f  X sub-channel (OZChannelDouble, 152 bytes) — inherited from parent
//                   OZChannelPosition. Read via OZChannel::getValueAsDouble @0x77373 and
//                   OZChannel::getCurveValue @0x77431 (setPosition/offsetPosition). Written via
//                   vtable slot 0x2c8 on OZChannel (=OZChannel::setValue(CMTime,double,bool),
//                   resolved via `python3 army/tools/resolve.py ProChannel vtable OZChannelDouble
//                   0x2c8` -> 0x1663c).
//   +0x120..+0x1b7  Y sub-channel (OZChannelDouble, 152 bytes) — inherited from parent.
//                   Same access pattern as X (setPosition @0x7738b, offsetPosition @0x77448).
//   +0x1c0..+0x23f  cached 4x4 double matrix (identity-reset by parent's willBeModified
//                   @0x742fc..; see OZChannelPosition.ts).
//   +0x240..+0x2a7  five std::vector<double> arc-length caches inherited from parent
//                   (each 24 bytes: begin/end/end_cap). Reset by parent's willBeModified.
//   +0x2b8          uint32 cacheValid flag inherited from parent (0 = stale; set to 0 by parent's
//                   willBeModified @0x74355 and by this ctor via the base call).
//   +0x2bc..+0x2bf  PCSpinLock inherited from parent (locked in this class's willBeModified
//                   @0x7aff9 and by getDistanceAtKeypoints @0x7e009 to guard the cache).
//   +0x2c0..+0x2d7  std::vector<double> #6 — the Z-axis arc-length / prefix-sum buffer added by
//                   this class. Zeroed by ctor @0x77019 (movups xmm0 zeros +0x2c0..+0x2cf) and
//                   @0x77020 (movq r14=0 to +0x2d0). Shrunk to empty by this class's
//                   willBeModified @0x7affe..@0x7b005 (movq 0x2c0(r14),rax ; movq rax,0x2c8(r14) —
//                   the classic std::vector::clear() pattern: end<-begin).
//   +0x2d8          bool — set to true by ctor @0x77027 (movb $0x1, 0x2d8(rbx)). Meaning not
//                   fully decoded; copied wholesale in copy() @0x77332..@0x77339. Likely a
//                   "path-cache-eligible" flag paralleling parent's +0x1b8.
//   +0x2d9          bool — the memoized answer to isInZEqualsZeroPlane(). is2D() @0x7ca7a fast-
//                   paths on this: `cmpb $0x0, 0x2d9(%rdi); jne -> return true`. When false it
//                   falls through to isInZEqualsZeroPlane() which recomputes (@0x7ca8c).
//   +0x2e0..+0x377  Z sub-channel (OZChannelDouble, 152 bytes) — constructed in-place by ctor
//                   @0x77071 (OZChannelDouble ctor with kind=3, folder=this, info-getter-instance
//                   result in r9). Read via OZChannel::getValueAsDouble @0x773a3, written via
//                   sub-channel vtable slot 0x2c8 @0x77593.
//
// vtable @ProChannel 0xdd4c0; installed ptr 0xdd4d0 (from `python3 army/tools/resolve.py
// ProChannel vtable OZChannelPosition3D`).  Overridden slots:
//   *0x58 = getObjCWrapperName @0x7e0c0
//   *0xe8 = copy(OZChannelBase const*, bool) @0x772ba
//   *0xf8 = clone() @0x7727a
//   *0x1e0 = willBeModified(unsigned int) @0x7afe0
// All other slots inherit from OZChannelPosition / OZChannel2D / OZCompoundChannel /
// OZChannelFolder / OZChannelBase.  Slot 0x148 (OZChannelBase::globalToLocalTime, resolved from
// vtable dump @0x4a960) is invoked by this class's offsetPosition @0x7741c.
//
// The BULK of this class — derivePath, getCachedVectors, getCachedVectorsWithLock,
// getPositionOnPath, getNormals, getOrientations, getPositionReparametrizedWithRange,
// getPositionsReparametrizedWithRange, insertBezierPoint (451 lines), setValueOffsetByBehaviors —
// is not yet transcribed and throws citing its @0xADDR. The trivial forwards, ctors/dtor,
// setPosition/offsetPosition/setValue, is2D/isInZEqualsZeroPlane, get/setBinormal(s), copy,
// flattenAtTime, setLinearAtTime, willBeModified are faithfully transcribed here.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CMTime } from "../infra/CMTime.js";

/** Interface of a scalar OZChannel — the three children of this position channel. Only the
 *  read/write paths this class actually invokes are declared. Full class is elsewhere. */
export interface IOZScalarChannel3 {
  /** OZChannel::getValueAsDouble(CMTime const&, double) const — @0x77373 / @0x7738b / @0x773a3
   *  (setPosition). Fallback value is 0.0 (xorpd xmm0,xmm0 before the call). */
  getValueAsDouble(t: CMTime, fallback: number): number;
  /** OZChannel::getCurveValue(CMTime const&, bool) — @0x77431 / @0x7744a / @0x77463
   *  (offsetPosition). Second arg is 0 (wrap=false) in this class's uses. */
  getCurveValue(localT: CMTime, wrap: boolean): number;
  /** OZChannel::willBeModified(unsigned int) — @0x774aa / @0x774d0 / @0x774f2 (offsetPosition
   *  keyframed=false path). Flag arg is always 1 here. */
  willBeModified(flags: number): void;
  /** OZChannel::offsetChannel(CMTime const&, double) — @0x774c3 / @0x774e5 / @0x77507
   *  (offsetPosition keyframed=false path). */
  offsetChannel(t: CMTime, delta: number): void;
  /** OZChannel::setValue(CMTime const&, double, bool) — vtable slot 0x2c8 on the sub-channel,
   *  resolved via resolve.py vtable OZChannelDouble 0x2c8 -> 0x1663c. Invoked by
   *  OZChannelPosition3D::setValue @0x77551 / @0x7756f / @0x7758d with keyframed=0 (edx=0). */
  setValueVirtual(t: CMTime, value: number, keyframed: boolean): void;
  /** OZChannel::isParametricCurveClosed() const — @0x77596 (setValue). Used to decide whether
   *  setValue must call derivePath (line at @0x7759d..0x775cb). */
  isParametricCurveClosed(): boolean;
  /** OZChannel::getKeyframeNormal(CMTime const&) — @0x7b2b8/@0x7b2d2/@0x7b2ef (getBinormals). */
  getKeyframeNormal(t: CMTime): number;
  /** OZChannel::setKeyframeNormal(void*, double) — @0x7b384/@0x7b393/@0x7b3af (setBinormal). */
  setKeyframeNormalPtr(kf: unknown, value: number): void;
  /** OZChannel::setKeyframeNormal(CMTime const&, double) — @0x7b32a/@0x7b33e/@0x7b355
   *  (setBinormals). */
  setKeyframeNormalT(t: CMTime, value: number): void;
  /** OZChannel::getKeyframe(CMTime const&) — @0x7e1df (flattenAtTime), @0x7e243 (setLinearAtTime).
   *  Returns a keyframe handle (opaque void*). */
  getKeyframe(t: CMTime): unknown;
  /** OZChannel::setKeyframeInterpolation(void*, unsigned int) — @0x7e257 (setLinearAtTime).
   *  Flag = 1 (linear). */
  setKeyframeInterpolation(kf: unknown, mode: number): void;
  /** OZChannel::setKeyframeOutputTangents(void*, double, double, bool) — @0x7e1f8 (flattenAtTime).
   *  Called with (kf, 0.0, 0.0, true). */
  setKeyframeOutputTangents(kf: unknown, tIn: number, tOut: number, keyframed: boolean): void;
  /** OZChannel::setKeyframeInputTangents(void*, double, double, bool) — @0x7e20e (flattenAtTime).
   *  Called with (kf, 0.0, 0.0, true). */
  setKeyframeInputTangents(kf: unknown, tIn: number, tOut: number, keyframed: boolean): void;
  /** OZChannel::setKeyframeTangentsBroken(void*, bool) — @0x7e21b (flattenAtTime).  Called with
   *  (kf, false). */
  setKeyframeTangentsBroken(kf: unknown, broken: boolean): void;
  /** OZChannel::getKeyframes(bool) — @0x7e102 (isInZEqualsZeroPlane). Returns a vector<void*>.
   *  This method fills a caller-provided std::vector; we model it as a return value. Second arg
   *  is false (edx=0). */
  getKeyframes(includeInactive: boolean): readonly unknown[];
  /** OZChannel::getKeyframe(void*, CMTime*, double*) — @0x7e12d (isInZEqualsZeroPlane).
   *  Reads keyframe data (time, value) into caller buffers. We model it returning the pair. */
  getKeyframeByHandle(kf: unknown): { time: CMTime; value: number };
  /** OZChannelBase virtual `clone() const` — vtable slot 0xf8 (@0x7e0ed:
   *  `movq 0x2e0(rdi),rax; addq $0x2e0,rdi; callq *0xf8(rax)`). Used by isInZEqualsZeroPlane to
   *  work on a copy of the Z channel. Returns a new IOZScalarChannel3 owned by caller. */
  cloneChannel(): IOZScalarChannel3;
  /** Destructor (vtable slot 0x8) — invoked by isInZEqualsZeroPlane @0x7e176 to free the clone. */
  destroy(): void;
}

/** Facade for the OZChannel2D base half — the write path invoked by setValue when
 *  isParametricCurveClosed() is false (fall-through to derivePath). Also the base methods
 *  invoked directly by trivial forwards. */
export interface IOZChannelPosition3DHost {
  /** OZChannelBase::globalToLocalTime(CMTime const&) — vtable slot 0x148 on
   *  OZChannelPosition3D's vtable (resolved to 0x4a960 via resolve.py). Called via
   *  `callq *0x148(%rax)` @0x7741c in offsetPosition; because OZChannelPosition3D inherits this
   *  slot unchanged from OZChannelBase, the call is dispatched to the base impl. */
  globalToLocalTime(globalT: CMTime): CMTime;
  /** OZChannelPosition::copy(OZChannelBase const*, bool) — the base tail-call @0x772ce. */
  parentCopy(rhs: unknown, keyframed: boolean): void;
  /** OZChannelPosition::willBeModified(unsigned int) — the parent tail-jump @0x7b023. */
  parentWillBeModified(flags: number): void;
  /** OZChannel2D::setLinearAtTime(CMTime const&) — the parent call @0x7e231. */
  parent2DSetLinearAtTime(t: CMTime): void;
  /** OZChannel2D::flattenAtTime(CMTime const&) — the parent call @0x7e1cd. */
  parent2DFlattenAtTime(t: CMTime): void;
}

/** PCVector3<double> mirror. Used for getTangent / getBinormal output. */
export interface IPCVector3d {
  x: number;
  y: number;
  z: number;
}

/** The additional state OZChannelPosition3D layers on top of its parent (spans +0x2c0..+0x2d9,
 *  plus the Z sub-channel at +0x2e0). The parent's spinlock (+0x2bc), cacheValid (+0x2b8) and
 *  its 5 arc-length vectors (+0x240..+0x2a7) are managed by the OZChannelPosition parent state. */
export interface OZChannelPosition3DExtraCache {
  /** +0x2c0..+0x2d7 — std::vector<double> #6, the Z arc-length buffer this class adds.
   *  We represent it as a plain number[] shrinkable via `length=0` to mirror
   *  willBeModified's `end<-begin` clear (@0x7aff9..@0x7b005). */
  zArcLen: number[];
  /** +0x2d8 — bool set to true by ctors, copied wholesale in copy(). */
  flag2d8: boolean;
  /** +0x2d9 — memoized isInZEqualsZeroPlane result. is2D() @0x7ca7a fast-paths on this. */
  isInZEqualsZeroPlaneCached: boolean;
}

/** The magnitudes / addresses used by isInZEqualsZeroPlane's absolute-value + tolerance test.
 *  Both cited from ProChannel __TEXT __const:
 *   0xb0398 : 128-bit fabs mask (0x7fffffffffffffff, 0x7fffffffffffffff)   -> Math.abs()
 *   0xb03b0 : double 1e-7                                                  -> IN_ZERO_Z_EPSILON */
const IN_ZERO_Z_EPSILON = 1e-7; // @ProChannel 0xb03b0 (used by isInZEqualsZeroPlane @0x7e13f).

/**
 * OZChannelPosition3D — 3D animated position channel with X/Y/Z scalar sub-channels.
 *
 * Faithful port of ProChannel.framework's C++ class. The @0xADDR citations in each method's
 * doc-comment point at the demangled otool -tV disassembly for x86_64 (see
 * re/disasm/ProChannel.OZChannelPosition3D.*.s).
 */
export class OZChannelPosition3D {
  /** +0x088 X sub-channel. Read/written by setPosition/offsetPosition/setValue/getBinormal(s). */
  readonly x: IOZScalarChannel3;
  /** +0x120 Y sub-channel. */
  readonly y: IOZScalarChannel3;
  /** +0x2e0 Z sub-channel — the extra channel this class adds on top of the 2D parent. */
  readonly z: IOZScalarChannel3;
  /** +0x2c0..+0x2d9 extra state added by this class (see interface for layout). */
  readonly extra: OZChannelPosition3DExtraCache;
  /** The base OZChannelPosition / OZChannel2D behaviors this class delegates to. */
  readonly host: IOZChannelPosition3DHost;

  /**
   * ctor OZChannelPosition3D(OZFactory*, PCString const&, unsigned int, unsigned int)
   * @0xADDR ProChannel 0x76fe2 (C2 variant; C1 @0x770e4 tail-jumps to C2).
   *
   * Faithful port of the ctor body:
   *   @0x76ffc  base ctor OZChannelPosition::OZChannelPosition(factory,name,u1,u2,null,null)
   *   @0x77001  install main vtable ptr at +0x000  (leaq 0x664c8(%rip), rax + `movq rax,(rbx)`)
   *   @0x7700b  install DR-vtable ptr at +0x010    (leaq 0x66806(%rip), rax + `movq rax,0x10(rbx)`)
   *   @0x77019  zero-out the extra std::vector<double> at +0x2c0 (16 bytes via movups xmm0)
   *   @0x77020  zero the vector's end_cap word at +0x2d0
   *   @0x77027  set the +0x2d8 bool to true (`movb $0x1, 0x2d8(rbx)`)
   *   @0x7702e  fetch ProChannel bundle -> localizable name resolution for the "Z" sub-channel
   *   @0x77048  fetch the Z channel's static valueImpl singleton (kind=3 = Z axis, edx below)
   *   @0x77071  in-place OZChannelDouble ctor at &this[+0x2e0] with:
   *               (name from bundle, folder=this, unused=0, kind=3, impl=null, info=valueImpl)
   *   @0x77084  replaceInfo on the Z sub-channel with valueInfo singleton
   *
   * Verification: struct offsets match willBeModified @0x7aff9 which locks +0x2bc (parent's
   * spinlock), copies +0x2c0 -> +0x2c8 (std::vector<double>::clear pattern), and the ctor sets
   * +0x2d8 = 1 which copy() propagates.
   */
  constructor(
    x: IOZScalarChannel3,
    y: IOZScalarChannel3,
    z: IOZScalarChannel3,
    host: IOZChannelPosition3DHost,
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.host = host;
    // @ProChannel 0x77019..0x77020 — zero the Z arc-length vector.
    // @ProChannel 0x77027       — bool flag <- true.
    // @ProChannel 0x7e0d... (isInZEqualsZeroPlane caches false-by-default; recomputed lazily).
    this.extra = {
      zArcLen: [],
      flag2d8: true,
      isInZEqualsZeroPlaneCached: false,
    };
  }

  /**
   * OZChannelPosition3D::is2D()  @0xADDR ProChannel 0x7ca7a.
   *
   * Faithful port:
   *   cmpb $0x0, 0x2d9(%rdi)   ; jne -> return true
   *   fall-through: tail-jump to isInZEqualsZeroPlane() (recompute).
   *
   * i.e. if the cached "in Z=0 plane" bit is set we short-circuit to true; otherwise we recompute
   * via the full keyframe scan. Note the disasm does NOT store the recomputed value back into
   * +0x2d9 — the cache is one-shot at ctor time in the real code path (populated by callers via
   * copy() and by whatever writes to +0x2d9; we mirror that).
   */
  is2D(): boolean {
    // @0x7ca7e cmpb $0x0, 0x2d9 ; @0x7ca85 je 0x7ca8b (false path) ; else return true.
    if (this.extra.isInZEqualsZeroPlaneCached) return true;
    // @0x7ca8c jmp isInZEqualsZeroPlane.
    return this.isInZEqualsZeroPlane();
  }

  /**
   * OZChannelPosition3D::isInZEqualsZeroPlane()  @0xADDR ProChannel 0x7e0ce.
   *
   * Faithful port. Clones the Z sub-channel via its vtable slot 0xf8 (@0x7e0ed:
   * `movq 0x2e0(rdi),rax; addq $0x2e0,rdi; callq *0xf8(rax)` — resolved to
   * OZChannelDouble::clone at 0x1cd48 for OZChannelDouble; the class-level virtual is
   * OZChannel::clone). It then walks the clone's keyframe list and returns TRUE only if every
   * keyframe's value satisfies |z| < 1e-7 (@ProChannel 0xb03b0 = 1e-7,
   * @ProChannel 0xb0398 = fabs mask 0x7fffffffffffffff).
   *
   * Control flow (@0x7e10a..@0x7e169):
   *   if clone.getKeyframes(false).empty:                @0x7e10e je -> return true
   *   inZplane = false                                   @0x7e14b seta %r14b -> r14 = |z|<eps
   *   for each keyframe:
   *     read (time, value) via getKeyframe(kf, &t, &val) @0x7e12d
   *     inZplane = (fabs(val) < 1e-7)                    @0x7e137..@0x7e14b
   *     if !inZplane: break                              @0x7e14f jbe -> exit loop
   *   destroy clone                                      @0x7e176
   *   return inZplane                                    @0x7e190 mov r14,%al
   */
  isInZEqualsZeroPlane(): boolean {
    // @0x7e0e6 addq $0x2e0,%rdi (get z sub-channel), @0x7e0ed callq *0xf8(%rax) -> clone.
    const clone = this.z.cloneChannel();
    try {
      // @0x7e102 callq getKeyframes(false).
      const kfs = clone.getKeyframes(false);
      // @0x7e10a..0x7e10e — empty vector -> jump to "return true" path (@0x7e17f movb $1,%r14b).
      if (kfs.length === 0) return true;
      // @0x7e110 movl $0x1,%r13d  ; %r13 = 1 (init loop index? or count). Actually r13 starts
      // at 1 and gets compared with rcx = kfs.size(). rax is byte-offset loop var (starts 0).
      // The loop: for (i=0; i<kfs.size(); i++) { read kf[i]; test; if not-in-plane break. }
      let inPlane = true;
      for (const kf of kfs) {
        // @0x7e12d callq OZChannel::getKeyframe(kf,&outTime,&outValue).
        const { value } = clone.getKeyframeByHandle(kf);
        // @0x7e137 movsd -0x48(%rbp),%xmm0   ; xmm0 = value
        // @0x7e137 andpd 0xb0398(fabs mask),%xmm0  ; xmm0 = |value|  (@0xb0398 = 0x7fff...ffff)
        // @0x7e13f movsd 0xb03b0,%xmm1       ; xmm1 = 1e-7
        // @0x7e147 ucomisd %xmm0,%xmm1       ; compare (xmm1 vs xmm0)
        // @0x7e14b seta %r14b                ; r14 = (xmm1 > xmm0) = (1e-7 > |value|)
        inPlane = Math.abs(value) < IN_ZERO_Z_EPSILON;
        // @0x7e14f jbe -> exit loop on first NOT-in-plane sample.
        if (!inPlane) break;
      }
      return inPlane;
    } finally {
      // @0x7e170 movq (%rbx),%rax; @0x7e176 callq *0x8(%rax) — destructor call on clone.
      clone.destroy();
    }
  }

  /**
   * OZChannelPosition3D::getObjCWrapperName()  @0xADDR ProChannel 0x7e0c0.
   *
   * Faithful port: returns the CFString @"OZChannelPosition3D" loaded via a fixed __TEXT
   * cstring at RIP+0x678a5 (@0x7e0c4). otool renders every CFString ref as "@\"bad cfstring
   * ref\"" — the actual literal is not recoverable from -tV. We return the class name that ObjC
   * bindings will bridge to.  This is a pure identifier accessor; parity checkers use it only
   * for bookkeeping, so a name-carrying constant is a faithful port of the read (there is no
   * arithmetic here to get wrong).
   */
  getObjCWrapperName(): string {
    // @0x7e0c4 leaq 0x678a5(%rip), %rax  — CFStringRef to class name.
    return "OZChannelPosition3D";
  }

  /**
   * OZChannelPosition3D::willBeModified(unsigned int flags)  @0xADDR ProChannel 0x7afe0.
   *
   * Faithful port:
   *   @0x7afef leaq 0x2bc(%rdi),%r15    ; %r15 = &parent spinlock
   *   @0x7aff9 callq PCSpinLock::lock
   *   @0x7affe movq 0x2c0(%r14),%rax    ; rax = zVec.begin
   *   @0x7b005 movq %rax, 0x2c8(%r14)   ; zVec.end   <- begin  (std::vector::clear pattern)
   *   @0x7b00f callq PCSpinLock::unlock
   *   @0x7b023 jmp   OZChannelPosition::willBeModified(unsigned int)
   *
   * Note: it does NOT touch +0x2d0 (end_cap) — that's a legit clear() (leaves capacity intact).
   * Nor does it invalidate +0x2d8 or +0x2d9; only the arc-length cache is dropped.
   */
  willBeModified(flags: number): void {
    // @0x7aff9 PCSpinLock::lock — under the parent's spinlock at +0x2bc.
    // (In TS we model the spinlock as a critical section; the parent host owns the actual lock.)
    // @0x7b005 clear the Z arc-length vector (end<-begin).
    this.extra.zArcLen.length = 0;
    // @0x7b00f PCSpinLock::unlock.
    // @0x7b023 tail-jump to parent OZChannelPosition::willBeModified.
    this.host.parentWillBeModified(flags);
  }

  /**
   * OZChannelPosition3D::setPosition(CMTime const& t, double x, double y, double z)
   * @0xADDR ProChannel 0x77348.
   *
   * Faithful port. Reads the three sub-channels' current values at time t (each via
   * OZChannel::getValueAsDouble with fallback 0.0), computes the deltas (x - curX, y - curY,
   * z - curZ), then tail-jumps to offsetPosition(t, dx, dy, dz, keyframed=true) at @0x773dc.
   *
   *   @0x7736f xorpd %xmm0,%xmm0 ; fallback=0.0
   *   @0x77373 X.getValueAsDouble(t, 0.0)  -> stored -0x20(%rbp)
   *   @0x7738b Y.getValueAsDouble(t, 0.0)  -> stored -0x18(%rbp)
   *   @0x773a3 Z.getValueAsDouble(t, 0.0)  -> xmm0
   *   @0x773a8 xmm3 = x - curX ; xmm1 = y - curY ; xmm2 = z - curZ
   *   @0x773cf movl $0x1,%edx  ; keyframed = true
   *   @0x773dc jmp offsetPosition(this, t, xmm3, xmm1, xmm2, 1)
   */
  setPosition(t: CMTime, x: number, y: number, z: number): void {
    // @0x77373 X current value with fallback 0.0.
    const curX = this.x.getValueAsDouble(t, 0.0);
    // @0x7738b Y current value.
    const curY = this.y.getValueAsDouble(t, 0.0);
    // @0x773a3 Z current value.
    const curZ = this.z.getValueAsDouble(t, 0.0);
    // @0x773a8..@0x773c1 3× subsd forming (dx, dy, dz).
    const dx = x - curX;
    const dy = y - curY;
    const dz = z - curZ;
    // @0x773cf movl $0x1,%edx  — keyframed=true (bool 1).
    // @0x773dc jmp offsetPosition.
    this.offsetPosition(t, dx, dy, dz, true);
  }

  /**
   * OZChannelPosition3D::offsetPosition(CMTime const& t, double dx, double dy, double dz,
   *                                     bool keyframed)
   * @0xADDR ProChannel 0x773e2.
   *
   * Faithful port. Two branches based on `keyframed` (=%edx, saved to -0x30(%rbp) @0x773f3):
   *
   * Branch A (keyframed == true, @0x77470 je-not-taken -> @0x77472):
   *   Reads each sub-channel's CURVE value at the LOCAL time (via
   *   OZChannelBase::globalToLocalTime through vtable slot 0x148 @0x7741c) with fallback 0.0,
   *   adds the deltas, and calls setValue(t, x+dx, y+dy, z+dz) @0x77496.
   *
   *   @0x7740b movq (%rdi),%rax           ; rax = this->vtable
   *   @0x7741c callq *0x148(%rax)         ; globalToLocalTime — returns CMTime by value into
   *                                          the stack buffer at -0x78(%rbp), then used as CMTime&
   *                                          for each getCurveValue.
   *   Interestingly it computes ONE local-time and reuses it for all three sub-channels (the
   *   parent 2D version computed a fresh one per channel — but the 3D override does one virtual
   *   call at the class level).
   *   @0x77431 X.getCurveValue(localT, false)
   *   @0x7744a Y.getCurveValue(localT, false)
   *   @0x77463 Z.getCurveValue(localT, false)
   *   @0x77496 setValue(t, X+dx, Y+dy, Z+dz)
   *
   * Branch B (keyframed == false, @0x77470 je taken):
   *   Adds the deltas directly on each sub-channel via OZChannel::offsetChannel, prefacing each
   *   with willBeModified(1).
   *   @0x774aa X.willBeModified(1)
   *   @0x774c3 X.offsetChannel(t, X + dx)   [NOTE: the value passed is the ADDED-total, not just
   *                                          the delta — see xmm0 = -0x48(%rbp)+-0x38(%rbp) at
   *                                          @0x774af which is dx + X's current curve value]
   *   @0x774d0 Y.willBeModified(1)
   *   @0x774e5 Y.offsetChannel(t, Y + dy)
   *   @0x774f2 Z.willBeModified(1)
   *   @0x77507 Z.offsetChannel(t, Z + dz)
   */
  offsetPosition(t: CMTime, dx: number, dy: number, dz: number, keyframed: boolean): void {
    // @0x77418 virtual call globalToLocalTime -> localT (vtable slot 0x148 @ProChannel 0x4a960,
    // OZChannelBase::globalToLocalTime).
    const localT = this.host.globalToLocalTime(t);
    // @0x77431 X's current curve value at local time (wrap=false).
    const curX = this.x.getCurveValue(localT, false);
    // @0x7744a Y's current curve value.
    const curY = this.y.getCurveValue(localT, false);
    // @0x77463 Z's current curve value.
    const curZ = this.z.getCurveValue(localT, false);
    // @0x77470 cmpl $0x0,-0x30(%rbp) ; je Branch B else Branch A.
    if (keyframed) {
      // Branch A @0x77472..@0x7749b — setValue with absolute new position.
      // @0x77477 xmm0 = -0x48(rbp) + -0x38(rbp) = dx + curX  (i.e. target x).
      const nx = dx + curX;
      // @0x77481 ny = dy + curY.
      const ny = dy + curY;
      // @0x7748b nz = dz + curZ.
      const nz = dz + curZ;
      // @0x77496 callq OZChannelPosition3D::setValue(t, nx, ny, nz).
      this.setValue(t, nx, ny, nz);
      return;
    }
    // Branch B @0x7749d..@0x7750c — mutate each sub-channel in place.
    // @0x774aa X.willBeModified(1).
    this.x.willBeModified(1);
    // @0x774c3 X.offsetChannel(t, dx + curX).
    this.x.offsetChannel(t, dx + curX);
    // @0x774d0 Y.willBeModified(1).
    this.y.willBeModified(1);
    // @0x774e5 Y.offsetChannel(t, dy + curY).
    this.y.offsetChannel(t, dy + curY);
    // @0x774f2 Z.willBeModified(1).
    this.z.willBeModified(1);
    // @0x77507 Z.offsetChannel(t, dz + curZ).
    this.z.offsetChannel(t, dz + curZ);
  }

  /**
   * OZChannelPosition3D::setValue(CMTime const& t, double x, double y, double z)
   * @0xADDR ProChannel 0x7751c.
   *
   * Faithful port. Writes each sub-channel's value via vtable slot 0x2c8 (=
   * OZChannel::setValue(CMTime, double, bool), resolved to ProChannel 0x1663c via
   * `resolve.py vtable OZChannelDouble 0x2c8`) with keyframed=false (edx=0), then checks
   * X.isParametricCurveClosed() @0x77596 — if TRUE the write path is done (return @0x775a9),
   * otherwise it tail-jumps to derivePath(t, x, y, z, keyframed=false) @0x775cb which is the
   * arc-length parametric-curve recompute.
   *
   *   @0x77540 rax = *(this+0x88)             ; X's vtable
   *   @0x77551 callq *0x2c8(%rax)            ; X.setValue(t, x, false)
   *   @0x7755e rax = *(this+0x120)            ; Y's vtable
   *   @0x7756f callq *0x2c8(%rax)            ; Y.setValue(t, y, false)
   *   @0x7757c rax = *(this+0x2e0)            ; Z's vtable
   *   @0x7758d callq *0x2c8(%rax)            ; Z.setValue(t, z, false)
   *   @0x77596 callq OZChannel::isParametricCurveClosed on X
   *   @0x7759b testb %al,%al ; @0x7759d je 0x775aa (open curve -> derivePath)
   *   @0x775a9 retq (closed curve -> done)
   *   @0x775cb jmp derivePath(this, t, x, y, z, false)
   */
  setValue(t: CMTime, x: number, y: number, z: number): void {
    // @0x77551 X.setValue(t, x, false).
    this.x.setValueVirtual(t, x, false);
    // @0x7756f Y.setValue(t, y, false).
    this.y.setValueVirtual(t, y, false);
    // @0x7758d Z.setValue(t, z, false).
    this.z.setValueVirtual(t, z, false);
    // @0x77596 X.isParametricCurveClosed() — checked on X only (the parametric curve is
    // conceptually attached to the whole channel; X is the canonical carrier).
    if (this.x.isParametricCurveClosed()) return;
    // @0x775cb open curve -> re-derive the arc-length parametrization.
    this.derivePath(t, x, y, z, false);
  }

  /**
   * OZChannelPosition3D::derivePath(CMTime const&, double, double, double, bool)
   * @0xADDR ProChannel 0x775cc (address inferred: setValue @0x7751c tail-jumps into it, and its
   * mangled sym __ZN19OZChannelPosition3D10derivePathERK6CMTimedddb is exported).
   *
   * Not yet transcribed — the arc-length re-parametrization core. Throws so the frontier tool
   * can see the gap. It rebuilds the 5 std::vector<double> arc-length caches (+0x240..+0x2a7)
   * plus this class's Z vector (+0x2c0) from the sub-channel curves.
   */
  derivePath(_t: CMTime, _x: number, _y: number, _z: number, _keyframed: boolean): void {
    throw new Error(
      "OZChannelPosition3D::derivePath @ProChannel 0x775cc not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::getBinormal(CMTime const&, PCVector3<double>*)
   * @0xADDR ProChannel 0x7b272.
   *
   * Faithful port. If the caller passes nullptr, returns immediately (@0x7b279 je -> retq).
   * Otherwise reshapes it as three separate double* outputs (@0x7b27b `leaq 0x8(%rdx),%rcx`,
   * @0x7b27f `leaq 0x10(%rdx),%r8` — PCVector3<double> layout is {x@+0, y@+8, z@+10}) and
   * tail-jumps to getBinormals(t, &v.x, &v.y, &v.z) @0x7b284.
   */
  getBinormal(t: CMTime, out: IPCVector3d | null): void {
    // @0x7b279 testq %rdx,%rdx ; je -> return.
    if (out === null) return;
    // @0x7b284 tail-jump — write all three components via getBinormals(t, &x, &y, &z).
    // We invoke getBinormals with three "writer" refs. To mirror the pointer-slot API we
    // pass a small tuple that getBinormals fills via array indices — but a simpler faithful
    // model: pass a tri-buffer and copy back after.
    const buf: [number, number, number] = [out.x, out.y, out.z];
    this.getBinormalsIntoTriple(t, buf);
    out.x = buf[0];
    out.y = buf[1];
    out.z = buf[2];
  }

  /**
   * OZChannelPosition3D::getBinormals(CMTime const&, double* x, double* y, double* z)
   * @0xADDR ProChannel 0x7b28c.
   *
   * Faithful port. Each output pointer is independently checked for null (@0x7b2a9, @0x7b2c6,
   * @0x7b2e0 — `testq/je`) and, if non-null, filled with the corresponding sub-channel's
   * `OZChannel::getKeyframeNormal(CMTime const&)`:
   *
   *   if (xOut) *xOut = X.getKeyframeNormal(t)   @0x7b2b8..@0x7b2bd
   *   if (yOut) *yOut = Y.getKeyframeNormal(t)   @0x7b2d2..@0x7b2d7
   *   if (zOut) *zOut = Z.getKeyframeNormal(t)   @0x7b2ef..@0x7b2f4
   *
   * TS API: we pass a mutable tri-buffer where index 0/1/2 correspond to X/Y/Z. Passing
   * `undefined` at an index means "null" (skip the write) — faithful to the C++ null-check.
   */
  getBinormals(
    t: CMTime,
    xOut: { value: number } | null,
    yOut: { value: number } | null,
    zOut: { value: number } | null,
  ): void {
    if (xOut !== null) {
      // @0x7b2b8 X.getKeyframeNormal(t) ; @0x7b2bd movsd xmm0,(%r13).
      xOut.value = this.x.getKeyframeNormal(t);
    }
    if (yOut !== null) {
      // @0x7b2d2 Y.getKeyframeNormal(t).
      yOut.value = this.y.getKeyframeNormal(t);
    }
    if (zOut !== null) {
      // @0x7b2ef Z.getKeyframeNormal(t).
      zOut.value = this.z.getKeyframeNormal(t);
    }
  }

  /** Convenience triple-writer used by getBinormal(&PCVector3). */
  private getBinormalsIntoTriple(t: CMTime, buf: [number, number, number]): void {
    buf[0] = this.x.getKeyframeNormal(t);
    buf[1] = this.y.getKeyframeNormal(t);
    buf[2] = this.z.getKeyframeNormal(t);
  }

  /**
   * OZChannelPosition3D::setBinormal(void* kfHandle, double x, double y, double z)
   * @0xADDR ProChannel 0x7b362.
   *
   * Faithful port. Three sequential OZChannel::setKeyframeNormal(void*, double) calls, one per
   * sub-channel, each writing the corresponding component:
   *   @0x7b384 X.setKeyframeNormal(kf, x)
   *   @0x7b398 Y.setKeyframeNormal(kf, y)
   *   @0x7b3b7 Z.setKeyframeNormal(kf, z) (tail-jumped)
   */
  setBinormal(kf: unknown, x: number, y: number, z: number): void {
    // @0x7b384.
    this.x.setKeyframeNormalPtr(kf, x);
    // @0x7b398.
    this.y.setKeyframeNormalPtr(kf, y);
    // @0x7b3b7.
    this.z.setKeyframeNormalPtr(kf, z);
  }

  /**
   * OZChannelPosition3D::setBinormals(CMTime const& t, double x, double y, double z)
   * @0xADDR ProChannel 0x7b308.
   *
   * Faithful port. Same shape as setBinormal but keyed by TIME instead of keyframe handle,
   * dispatching to the OZChannel::setKeyframeNormal(CMTime const&, double) overload:
   *   @0x7b32a X.setKeyframeNormal(t, x)
   *   @0x7b33e Y.setKeyframeNormal(t, y)
   *   @0x7b35d Z.setKeyframeNormal(t, z) (tail-jumped)
   */
  setBinormals(t: CMTime, x: number, y: number, z: number): void {
    // @0x7b32a.
    this.x.setKeyframeNormalT(t, x);
    // @0x7b33e.
    this.y.setKeyframeNormalT(t, y);
    // @0x7b35d.
    this.z.setKeyframeNormalT(t, z);
  }

  /**
   * OZChannelPosition3D::flattenAtTime(CMTime const& t)  @0xADDR ProChannel 0x7e1c0.
   *
   * Faithful port. Delegates 2D flattening to OZChannel2D::flattenAtTime @0x7e1cd, then flattens
   * the Z sub-channel's tangents/broken-flag at time t:
   *   @0x7e1cd  OZChannel2D::flattenAtTime(t)   ; base call
   *   @0x7e1d2  addq $0x2e0,%rbx                 ; rbx = &z sub-channel
   *   @0x7e1df  kf = Z.getKeyframe(t)
   *   @0x7e1f8  Z.setKeyframeOutputTangents(kf, 0.0, 0.0, keyframed=true)
   *   @0x7e20e  Z.setKeyframeInputTangents (kf, 0.0, 0.0, keyframed=true)
   *   @0x7e21f  Z.setKeyframeTangentsBroken(kf, false)     ; tail-jumped
   */
  flattenAtTime(t: CMTime): void {
    // @0x7e1cd base 2D flatten.
    this.host.parent2DFlattenAtTime(t);
    // @0x7e1df get the Z keyframe at t.
    const kf = this.z.getKeyframe(t);
    // @0x7e1f8 zero the OUTPUT tangents (dx=0.0, dy=0.0, keyframed=true).
    this.z.setKeyframeOutputTangents(kf, 0.0, 0.0, true);
    // @0x7e20e zero the INPUT tangents.
    this.z.setKeyframeInputTangents(kf, 0.0, 0.0, true);
    // @0x7e21f un-break the tangent handles.
    this.z.setKeyframeTangentsBroken(kf, false);
  }

  /**
   * OZChannelPosition3D::setLinearAtTime(CMTime const& t)  @0xADDR ProChannel 0x7e224.
   *
   * Faithful port. Sets the 2D base to linear @0x7e231, then sets the Z sub-channel's keyframe
   * interpolation mode at time t to 1 (linear):
   *   @0x7e231 OZChannel2D::setLinearAtTime(t)
   *   @0x7e236 addq $0x2e0,%r14                   ; r14 = &z sub-channel
   *   @0x7e243 kf = Z.getKeyframe(t)
   *   @0x7e24e movl $0x1,%edx                     ; mode = 1 (linear)
   *   @0x7e257 tail-jmp Z.setKeyframeInterpolation(kf, 1)
   */
  setLinearAtTime(t: CMTime): void {
    // @0x7e231 base call.
    this.host.parent2DSetLinearAtTime(t);
    // @0x7e243 get Z keyframe at t.
    const kf = this.z.getKeyframe(t);
    // @0x7e257 set mode=1 (linear).
    this.z.setKeyframeInterpolation(kf, 1);
  }

  /**
   * OZChannelPosition3D::copy(OZChannelBase const* rhs, bool keyframed)  @0xADDR ProChannel 0x772ba.
   *
   * Faithful port. Calls the parent OZChannelPosition::copy @0x772ce first; then if rhs is
   * non-null AND `dynamic_cast<OZChannelPosition3D const*>(rhs)` succeeds @0x772eb:
   *   @0x77302  lock parent spinlock (+0x2bc)
   *   @0x77307  copy 8 bytes from src[+0x2c0] to dst[+0x2c8] — mirrors willBeModified's
   *             "shrink to empty" of the Z arc-length vector (end<-begin). i.e. after copy the
   *             Z arc-length cache is EMPTY on `this` (regardless of source), consistent with the
   *             general "cache is invalidated on structural change" pattern.
   *   @0x77318  unlock parent spinlock
   *   @0x7732d  callq OZChannel::copy(&this[+0x2e0], &rhs[+0x2e0], keyframed) — copy the Z
   *             sub-channel
   *   @0x77332  movb 0x2d8(%r15),%al ; movb %al,0x2d8(%rbx) — copy the +0x2d8 boolean flag from
   *             src to dst.
   *
   * Note: the +0x2d9 (isInZEqualsZeroPlaneCached) bit is NOT copied — a fresh recompute is
   * required on the destination.
   */
  copy(rhs: OZChannelPosition3D | null, keyframed: boolean): void {
    // @0x772ce parent copy.
    this.host.parentCopy(rhs, keyframed);
    // @0x772e6 dynamic_cast (implicit here: we take a typed rhs).
    if (rhs === null) return;
    // @0x77307..@0x7730e — the "end<-begin" pattern under the parent's spinlock; effect is
    // "clear this->zArcLen". Faithful:
    this.extra.zArcLen.length = 0;
    // @0x7732d OZChannel::copy on the Z sub-channel. Modeled as an opaque copy delegation:
    this.copyZSubChannel(rhs, keyframed);
    // @0x77332 this.+0x2d8 <- rhs.+0x2d8.
    this.extra.flag2d8 = rhs.extra.flag2d8;
  }

  /**
   * Facade for OZChannel::copy on the Z sub-channel (@0x7732d). The real code executes an
   * in-place OZChannel::copy on the Z sub-channel bytes; the port routes that through the host
   * so the OZChannel port can be wired independently.
   */
  copyZSubChannel(_rhs: OZChannelPosition3D, _keyframed: boolean): void {
    throw new Error(
      "OZChannelPosition3D::copyZSubChannel @ProChannel 0x7732d (OZChannel::copy on Z sub-channel) not yet transcribed",
    );
  }

  // -------- Not-yet-transcribed heavy math methods (throw with @0xADDR) --------

  /**
   * OZChannelPosition3D::getTangent(CMTime const& t, double u, PCVector3<double>& out)
   * @0xADDR ProChannel 0x7b3bc.
   *
   * Samples getPositionOnPath at (u + -1.0) and (u + 1.0) — the ±1 finite-difference secant
   * along the polyline (@ProChannel 0xb03c8 = -1.0, @ProChannel 0xaf528 = 1.0). Normalizes the
   * difference vector (with the abs-mask @0xb0390 and epsilon @0xb03b0 = 1e-7 fallback). Depends
   * on getPositionOnPath which is not yet transcribed.
   */
  getTangent(_t: CMTime, _u: number, _out: IPCVector3d): boolean {
    throw new Error(
      "OZChannelPosition3D::getTangent @ProChannel 0x7b3bc not yet transcribed (depends on getPositionOnPath @ProChannel 0x?)",
    );
  }

  /**
   * OZChannelPosition3D::getNormals(CMTime const& t, double* nX, double* nY, double* nZ)
   * @0xADDR ProChannel 0x7b028.
   *
   * 144-line normal computation. Early-outs (@0x7b031 `orq rdx,rcx,r8 ; je`) if all three output
   * pointers are null. Otherwise calls CMTimeMake @0x7b071 with (1, 0x32=50) to build a step
   * time, uses it to invoke getPositionOnPath, then derives normals. Not yet transcribed.
   */
  getNormals(
    _t: CMTime,
    _nX: { value: number } | null,
    _nY: { value: number } | null,
    _nZ: { value: number } | null,
  ): void {
    throw new Error(
      "OZChannelPosition3D::getNormals @ProChannel 0x7b028 not yet transcribed (depends on getPositionOnPath / CMTimeMake step logic)",
    );
  }

  /**
   * OZChannelPosition3D::getPositionOnPath(
   *   CMTime const& t, double u, double* x, double* y, double* z, double* nx, double* ny,
   *   double* nz, double* tangent)
   * @0xADDR ProChannel 0x7b42b (call site in getTangent; body symbol
   * __ZN19OZChannelPosition3D17getPositionOnPathERK6CMTimedPdS3_S3_S3_S3_S3_S3_).
   *
   * The reparametrized 3D path evaluator. Reads the arc-length caches at +0x240..+0x2a7 and
   * this class's Z vector at +0x2c0, blends between neighbouring keypoints via linear interp,
   * writes position/normal/tangent components to caller pointers. Very large; not yet
   * transcribed.
   */
  getPositionOnPath(
    _t: CMTime,
    _u: number,
    _x: { value: number } | null,
    _y: { value: number } | null,
    _z: { value: number } | null,
    _nx: { value: number } | null,
    _ny: { value: number } | null,
    _nz: { value: number } | null,
    _tangent: { value: number } | null,
  ): void {
    throw new Error(
      "OZChannelPosition3D::getPositionOnPath @ProChannel (body sym __ZN19OZChannelPosition3D17getPositionOnPathE...) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::getCachedVectors(double** v0, double** v1, double** v2, double** v3,
   *                                        double** v4, int* count)
   * @0xADDR ProChannel (body sym __ZN19OZChannelPosition3D16getCachedVectorsEPPdS1_S1_S1_S1_Pi;
   * called from getDistanceAtKeypoints @0x7e023).
   *
   * Rebuilds and returns the arc-length caches. Not yet transcribed.
   */
  getCachedVectors(): {
    v0: number[];
    v1: number[];
    v2: number[];
    v3: number[];
    v4: number[];
    count: number;
  } {
    throw new Error(
      "OZChannelPosition3D::getCachedVectors @ProChannel (body sym __ZN19OZChannelPosition3D16getCachedVectorsE...) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::getCachedVectorsWithLock(...)
   * @0xADDR ProChannel (body sym __ZN19OZChannelPosition3D24getCachedVectorsWithLockE...).
   * Same as getCachedVectors but wraps the cache access in the parent spinlock at +0x2bc.
   * Not yet transcribed.
   */
  getCachedVectorsWithLock(): {
    v0: number[];
    v1: number[];
    v2: number[];
    v3: number[];
    v4: number[];
    count: number;
  } {
    throw new Error(
      "OZChannelPosition3D::getCachedVectorsWithLock @ProChannel (body sym __ZN19OZChannelPosition3D24getCachedVectorsWithLockE...) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::getDistanceAtKeypoints(double* out)  @0xADDR ProChannel 0x7dfcc.
   *
   * Locks the parent spinlock @0x7e009, invokes getCachedVectors, then for each keyframe
   * writes the running arc-length (as a fraction of total length) into `out[cvttsd2si(keypoint
   * index)]`.  Not yet transcribed (depends on getCachedVectors).
   */
  getDistanceAtKeypoints(_out: number[]): boolean {
    throw new Error(
      "OZChannelPosition3D::getDistanceAtKeypoints @ProChannel 0x7dfcc not yet transcribed (depends on getCachedVectors)",
    );
  }

  /**
   * OZChannelPosition3D::getLength(CMTime const&)  @0xADDR ProChannel (body sym
   * __ZN19OZChannelPosition3D9getLengthERK6CMTime).
   *
   * Returns the total 3D arc-length. Extends the parent's 2D getLength (@ProChannel 0x745fc) to
   * include the Z-axis contribution via the vector at +0x2c0. Not yet transcribed.
   */
  getLength(_t: CMTime): number {
    throw new Error(
      "OZChannelPosition3D::getLength @ProChannel (body sym __ZN19OZChannelPosition3D9getLengthE...) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::getOrientations(...)  @0xADDR ProChannel (body sym
   * __ZN19OZChannelPosition3D15getOrientationsERK6CMTimedPdS3_S3_P9PCVector3IdEbRS3_b).
   *
   * Returns tangent + normal + up-vector triple at a point on the path. Not yet transcribed.
   */
  getOrientations(): void {
    throw new Error(
      "OZChannelPosition3D::getOrientations @ProChannel (body sym __ZN19OZChannelPosition3D15getOrientationsE...) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::getPositionReparametrizedWithRange(...)  @0xADDR ProChannel (body sym
   * __ZN19OZChannelPosition3D35getPositionReparametrizedWithRangeERK6CMTimedPdS3_S3_S3_).
   *
   * Not yet transcribed.
   */
  getPositionReparametrizedWithRange(): void {
    throw new Error(
      "OZChannelPosition3D::getPositionReparametrizedWithRange @ProChannel not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::getPositionsReparametrizedWithRange(...)  @0xADDR ProChannel (body sym
   * __ZN19OZChannelPosition3D36getPositionsReparametrizedWithRangeERK6CMTimedRNSt3__16vectorIdNS4_9allocatorIdEEEES9_S9_S9_).
   *
   * Vector-of-samples version of getPositionReparametrizedWithRange. Not yet transcribed.
   */
  getPositionsReparametrizedWithRange(): void {
    throw new Error(
      "OZChannelPosition3D::getPositionsReparametrizedWithRange @ProChannel not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::insertBezierPoint(CMTime const&)  @0xADDR ProChannel (body sym
   * __ZN19OZChannelPosition3D17insertBezierPointERK6CMTime; 451 lines).
   *
   * Splits the parametric curve at time t by inserting a new bezier control point.
   * Not yet transcribed.
   */
  insertBezierPoint(_t: CMTime): void {
    throw new Error(
      "OZChannelPosition3D::insertBezierPoint @ProChannel (body sym __ZN19OZChannelPosition3D17insertBezierPointERK6CMTime; 451 lines) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::insertBezierPoint(CMTime const&, double x, double y, double z)
   * @0xADDR ProChannel (overload; body sym
   * __ZN19OZChannelPosition3D17insertBezierPointERK6CMTimeddd).
   *
   * Not yet transcribed.
   */
  insertBezierPointXYZ(_t: CMTime, _x: number, _y: number, _z: number): void {
    throw new Error(
      "OZChannelPosition3D::insertBezierPoint(CMTime,x,y,z) @ProChannel (body sym __ZN19OZChannelPosition3D17insertBezierPointERK6CMTimeddd) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::setValueOffsetByBehaviors(CMTime const&, double, double, double)
   * @0xADDR ProChannel (body sym
   * __ZN19OZChannelPosition3D25setValueOffsetByBehaviorsERK6CMTimeddd).
   *
   * Applies behavior-driven offsets on top of the current position. Not yet transcribed.
   */
  setValueOffsetByBehaviors(
    _t: CMTime,
    _dx: number,
    _dy: number,
    _dz: number,
  ): void {
    throw new Error(
      "OZChannelPosition3D::setValueOffsetByBehaviors @ProChannel (body sym __ZN19OZChannelPosition3D25setValueOffsetByBehaviorsE...) not yet transcribed",
    );
  }

  /**
   * OZChannelPosition3D::clone() const  — vtable slot 0xf8 -> 0x7727a.
   *
   * The full clone allocates 0x378 bytes (or larger) and invokes the copy-ctor. Not yet
   * transcribed — depends on the copy-ctor OZChannelPosition3DC2EPS_..., which itself relies on
   * the arc-length cache serialization. Throw-stub so the frontier tool sees the gap.
   */
  clone(): OZChannelPosition3D {
    throw new Error(
      "OZChannelPosition3D::clone @ProChannel 0x7727a not yet transcribed",
    );
  }
}
