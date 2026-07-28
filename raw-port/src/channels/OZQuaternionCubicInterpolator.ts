// OZQuaternionCubicInterpolator — ProChannel.framework. Quaternion-cubic keyframe interpolator
// for 3D rotation channels (OZChannelRotation3D). Chains through OZInterpolator (base).
//
// Faithful transcription per PORTING_SPEC. Symbols + addresses (verified via
// nm/otool/vtable.py):
//   __ZN29OZQuaternionCubicInterpolatorC1Ev/C2Ev   @ProChannel 0x816d2  ctor
//   __ZN29OZQuaternionCubicInterpolatorD0Ev/D1/D2  @ProChannel 0x82e10  dtor family
//   __ZN29OZQuaternionCubicInterpolator11interpolateER8OZSplineRK6CMTimePvS5_S4_bb
//                                                   @ProChannel 0x82e6c  interpolate (1057 lines)
//   __ZN29OZQuaternionCubicInterpolator9subDivideER8OZSplineRK6CMTimePvS5_S5_
//                                                   @ProChannel 0x8462c  subDivide (5-line no-op)
//   __ZN29OZQuaternionCubicInterpolator11useTangentsEv @ProChannel 0x84632  useTangents (returns 0)
//   __ZN29OZQuaternionCubicInterpolator8isActiveER8OZSplinePv
//                                                   @ProChannel 0x8463a  isActive
//
// vtable @ProChannel 0xdeba8 (see vtable.py output):
//   *0x18 -> 0x82e6c  interpolate                    (this file — throw stub)
//   *0x20 -> 0x8462c  subDivide                      (this file — no-op)
//   *0x38 -> 0x84632  useTangents                    (this file — returns 0)
//   *0x70 -> 0x8463a  isActive                       (this file — full transcription)
//   *0x10 -> 0x84718  OZInterpolator::init            (base — not overridden)
//   *0x28 -> 0x44688  OZInterpolator::convertHandlesToTangents (base — not overridden)
//   *0x30 -> 0x4468e  OZInterpolator::convertTangentsToHandles (base — not overridden)
//   *0x40 -> 0x44650  OZInterpolator::useKeypoints    (base)
//   *0x48 -> 0x44658  OZInterpolator::getAdjustedMaxU (base)
//   *0x50 -> 0x44670  OZInterpolator::getAdjustedMinU (base)
//   *0x58 -> 0x418aa  OZInterpolator::needInit        (base)
//   *0x60 -> 0x42888  OZInterpolator::uForCurveValue  (base)
//   *0x68 -> 0x418b2  OZInterpolator::easeTime        (base — identity, already ported)
//
// Object layout (from ctor @0x816d2 body):
//   this + 0x00 : vtable pointer (installed @ProChannel 0xdeba8; leaq 0x5d4c1(%rip) @0x816e0)
//   this + 0x08 : (OZInterpolator base state, opaque — set by OZInterpolator::OZInterpolator @not-yet-decoded)
//   this + 0x10 : uint8   = 0        @0x816ea  (movb $0x0, 0x10(%rbx))
//   this + 0x14 : uint32  = 0        @0x816ee  (movl $0x0, 0x14(%rbx))
//
// Base class chain: OZInterpolator (typeinfo @0xd6480, vtable slot *0xb8) — NOT yet ported.
// Per PORTING_SPEC Rule 3, the base ctor call at @0x816db (callq OZInterpolator::OZInterpolator())
// is deferred; we set this class's own known fields (+0x10=0, +0x14=0) and delegate anything that
// would touch OZInterpolator base state to a throwing stub citing the addr.
//
// The 1057-line `interpolate` method depends on a HUGE web of undecoded infrastructure:
//   • OZChannel::getCurveInterface        @0x30??? (called 6x for quaternion sub-channels)
//   • OZSplineNode::getSpline              @not-decoded (called 6x to pluck sub-splines)
//   • OZSpline::getPreviousValidVertex     @0x839c0 (not decoded)
//   • OZSpline::getNextValidVertex         @0x839d5 (not decoded)
//   • OZChannelRotation3D vtable *0xf0 x12 calls (vertex value fetch for rot channels)
//   • ___sincos_stret x18 calls (Euler-angle → quaternion trig; sin/cos per axis)
//   • slerp<double>                        @not-decoded (linear quaternion slerp)
//   • spline<double>                       @not-decoded (Squad-style cubic quaternion spline)
//   • PCMatrix44Tmpl<double>::setRotationFromQuaternion  @not-decoded
//   • PCMatrix44Tmpl<double>::getTransformation          @not-decoded
//   • dynamic_cast (OZChannelFolder → OZChannelRotation3D) x4 different call sites
//   • PC_CMTimeSaferAdd / PC_CMTimeSaferSubtract / CMTime * double / CMTime / CMTime / CMTimeGetSeconds
//   • OZSpline::getSmallDeltaU             @0x2fe52 (not yet decoded here)
// Per PORTING_SPEC Rule 3 it throws citing its addr.

import type { CMTime } from "../infra/CMTime.js";

/** Opaque handle for the FCP OZSpline instance passed into vtable methods.  The full class is
 *  not yet transcribed (raw-port/src/channels/OZSpline.ts exports only the free helper
 *  sampleCurveValue at present); the interpolate/isActive paths that would traverse its fields
 *  are throw-stubs in this file, so we don't need a structural type here. */
type OZSplineRef = unknown;

/**
 * OZQuaternionCubicInterpolator ctor.  @ProChannel 0x816d2 (C1) / same-body C2/base symbols.
 *
 * Body (verbatim, 12 lines of x86-64):
 *   pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
 *   movq %rdi, %rbx
 *   callq  __ZN14OZInterpolatorC2Ev     ; base ctor (OZInterpolator, not yet transcribed)
 *   leaq   0x5d4c1(%rip), %rax          ; = 0xdeba8 (vtable installed-ptr)
 *   movq   %rax, (%rbx)                 ; this->vtable = &vtable[0]
 *   movb   $0x0,  0x10(%rbx)            ; this[+0x10] (uint8) = 0
 *   movl   $0x0,  0x14(%rbx)            ; this[+0x14] (uint32) = 0
 *   addq $0x8, %rsp ; popq %rbx ; popq %rbp ; retq
 *
 * Fields at +0x10/+0x14 are used by OZInterpolator base bookkeeping (needInit gate at
 * base 0x418aa reads a flag near here). Their exact meaning requires transcribing the
 * OZInterpolator base — DEFERRED — so we mirror the memory layout, and the base ctor call
 * is modelled as a stubbed super() throwing until OZInterpolator is landed.
 */
export class OZQuaternionCubicInterpolator {
  /** @ProChannel 0x816ea — movb $0x0, 0x10(%rbx). uint8 flag near "needInit" bookkeeping. */
  field_0x10: number = 0;
  /** @ProChannel 0x816ee — movl $0x0, 0x14(%rbx). uint32 counter/flag near base state. */
  field_0x14: number = 0;

  constructor() {
    // @0x816db callq OZInterpolator::OZInterpolator()  (C2). Base ctor is not yet decoded.
    // The base sets its own fields at this+0x08..+0x0f (opaque); we do not touch them here.
    // If a downstream call requires that base state, it must go through the base class which
    // will throw with its own citation. See raw-port/src/channels/OZInterpolator.ts for the
    // (partially ported) base — easeTime is landed; ctor is deferred.
    // @0x816e0..0x816e7: install vtable (this->vtable = &vtable[0]).
    // @0x816ea:          this->field_0x10 = 0.
    // @0x816ee:          this->field_0x14 = 0.
  }

  /**
   * OZQuaternionCubicInterpolator::useTangents()   @ProChannel 0x84632  (vtable *0x38).
   *
   * Body (6 lines, verbatim):
   *   pushq %rbp ; movq %rsp, %rbp
   *   xorl %eax, %eax          ; return 0 (false)
   *   popq %rbp ; retq
   *
   * This says the quaternion-cubic interpolator does NOT use tangent handles from its keypoints
   * (unlike Bezier, which does). The parent OZInterpolator base has a default that returns 1
   * (or dispatches — not verified until base ctor is decoded); this override returns 0. Callers
   * of computeTangents/convertHandlesToTangents branch on this to skip tangent extraction.
   */
  useTangents(): boolean {
    return false;                       // xorl %eax, %eax @0x84636
  }

  /**
   * OZQuaternionCubicInterpolator::subDivide(OZSplineRef, CMTime const&, void*, void*, void*)
   *   @ProChannel 0x8462c  (vtable *0x20).
   *
   * Body (5 lines, verbatim):
   *   pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; retq
   *
   * Empty no-op. Bezier interpolators subdivide their control polygon in-place for uForCurveValue
   * root-finding; the quaternion interpolator has no polygon (it evaluates via slerp/spline on
   * unit quaternions), so subdivide is a no-op. The caller (OZInterpolator::uForCurveValue base
   * @0x42888) checks this-> useTangents() first and returns early when 0 — so this method is
   * effectively dead code for the quaternion path but is present for vtable slot completeness.
   */
  subDivide(_sp: OZSplineRef, _u: CMTime, _vA: unknown, _vB: unknown, _out: unknown): void {
    // no-op
  }

  /**
   * OZQuaternionCubicInterpolator::isActive(OZSplineRef, void*)   @ProChannel 0x8463a  (vtable *0x70).
   *
   * Full transcription of the 46-line disasm:
   *
   *   pushq %rbp ; movq %rsp, %rbp ; pushq %r14 ; pushq %rbx
   *   movq %rsi, %rbx                                 ; rbx = &sp (OZSplineRef)
   *   testq %rdx, %rdx                                ; if (vA == nullptr) …
   *   je   0x8465d
   *   movq (%rdx), %rax                               ; rax = *vA (vtable)
   *   movq %rdx, %rdi
   *   callq *0xd0(%rax)                               ; r14 = (int) vA_vtable[0xd0/8](vA)  — "isValid"
   *                                                     (OZDynamicVertex::isValid or similar; on a
   *                                                     static keypoint this returns 1; NOT decoded).
   *   testl %eax, %eax ; setne %r14b                  ; r14b = (result != 0)
   *   jmp 0x84660
   *   0x8465d:  movb $0x1, %r14b                      ; if vA==nullptr, treat as active (r14=1)
   *
   *   0x84660:  movq 0xa0(%rbx), %rax                 ; rax = sp[+0xa0]      (OZSpline::owner?)
   *             movq 0x20(%rax), %rax                 ; rax = rax[+0x20]     (OZChannel base)
   *             movq 0x98(%rax), %rax                 ; rax = rax[+0x98]     (root OZChannelFolder)
   *             testq %rax, %rax ; je 0x846c1         ; if null → return 0
   *             movq 0x30(%rax), %rdi                 ; rdi = rax[+0x30]     (payload for
   *                                                     dynamic_cast; a base subobject ptr)
   *             testq %rdi, %rdi ; je 0x846c1         ; if null → return 0
   *             leaq __ZTI15OZChannelFolder(%rip), %rsi     ; typeinfo for OZChannelFolder
   *             leaq __ZTI19OZChannelRotation3D(%rip), %rdx ; typeinfo for OZChannelRotation3D
   *             xorl %ebx, %ebx ; xorl %ecx, %ecx
   *             callq ___dynamic_cast                        ; rax = dynamic_cast<OZChannelRotation3D*>
   *             testq %rax, %rax ; je 0x846c3               ; not a Rotation3D → return 0
   *             addq $0x250, %rax                            ; rax = &channel->[+0x250]  (an
   *                                                            OZChannel sub-object inside the
   *                                                            Rotation3D — the "enable" flag ch)
   *             movq _kCMTimeZero(%rip), %rsi
   *             xorps %xmm0, %xmm0
   *             movq %rax, %rdi
   *             callq OZChannel::getValueAsInt(kCMTimeZero, 0.0)   ; enable = channel.getValueAsInt(0)
   *             testl %eax, %eax ; setne %al                       ; al = (enable != 0)
   *             andb %al, %r14b                                    ; r14 &= al
   *             movl %r14d, %ebx
   *             jmp 0x846c3
   *   0x846c1:  xorl %ebx, %ebx
   *   0x846c3:  movl %ebx, %eax
   *             popq %rbx ; popq %r14 ; popq %rbp ; retq
   *
   * Semantics: this interpolator is ACTIVE iff (vertex is valid or nullptr) AND its owning
   * spline is inside an OZChannelRotation3D whose enable sub-channel @+0x250 reads non-zero at
   * kCMTimeZero.  On our static-keypoint data model (raw-port/src/channels/OZCurve.ts), we do
   * NOT have an owning OZChannelRotation3D structure attached to the spline — the keypoint
   * pipeline is flat scalars. So faithfully porting this requires:
   *
   *   1. sp[+0xa0][+0x20][+0x98][+0x30]      pointer walk through parseScene-built objects,
   *   2. dynamic_cast to OZChannelRotation3D  (available at raw-port/src/channels/OZChannelRotation3D.ts),
   *   3. an OZChannel sub-object at +0x250,   getValueAsInt @kCMTimeZero.
   *
   * The vertex validity check at +0xd0 on vA is ALSO not decoded (OZDynamicVertex::isValid or
   * a base OZVertex::isValid; ~0xd0/8 = slot 26 in the vertex vtable). Per PORTING_SPEC Rule 3
   * we throw citing this method's addr — the caller path from FCP's evaluator hits this only
   * for actual rotation channels which our .motr corpus does not currently activate.
   */
  isActive(_sp: OZSplineRef, _vA: unknown): boolean {
    throw new Error(
      "OZQuaternionCubicInterpolator::isActive @ProChannel 0x8463a not yet transcribed — " +
        "requires the vertex *0xd0 validity vtable slot (OZDynamicVertex::isValid, undecoded) " +
        "AND the sp[+0xa0][+0x20][+0x98][+0x30] pointer walk with dynamic_cast to " +
        "OZChannelRotation3D and its enable sub-channel at +0x250 (OZChannel::getValueAsInt " +
        "at kCMTimeZero). Not reachable from the static-keypoint evaluator our port currently " +
        "exercises; a full transcription must land the OZDynamicVertex vtable and the " +
        "OZChannelRotation3D-owning spline lookup path.",
    );
  }

  /**
   * OZQuaternionCubicInterpolator::interpolate(OZSpline&, CMTime, void* vA, void* vB, CMTime u,
   *                                             bool fX, bool fY)   @ProChannel 0x82e6c.
   *
   * 1057-line body implementing:
   *   1. Equal-U guard via CMTimeCompare + PC_CMTimeSaferAdd + OZSpline::getSmallDeltaU (@0x82e94..).
   *   2. Dynamic-cast walk sp[+0xa0][+0x20][+0x98][+0x30] → OZChannelRotation3D (@0x82f59..).
   *   3. Pluck 3 sub-splines out of the rotation channel (X, Y, Z Euler-angle channels) via
   *      OZChannel::getCurveInterface + dynamic_cast<OZCurve*> + OZSplineNode::getSpline (each x3;
   *      @0x82fa6..0x83020).
   *   4. Fetch prev/next valid vertices around uQuery via OZSpline::getPreviousValidVertex /
   *      OZSpline::getNextValidVertex (@0x839c0/0x839d5) — three times, for the vA-side quaternion
   *      basis, the vB-side basis, and the tangent-neighbor bases.
   *   5. Read 12 Euler-angle scalars via OZChannel *0xf0 (getValueV variant, @0x8308f, @0x830af,
   *      @0x830d0, @0x830f1, @0x8310d, @0x83130 and again after next-valid at @0x83a86..0x83b1d).
   *   6. Convert each XYZ Euler triple → unit quaternion via 6× ___sincos_stret per triple (18 total
   *      sincos calls @0x8314b, 0x8316a, 0x8318c, 0x8332f, 0x83368, 0x833a1, 0x83b40, 0x83b5f,
   *      0x83b81, 0x83d43, 0x83d79, 0x83db2 — one sincos per Euler axis) → half-angle products.
   *   7. Normalize + call slerp<double>(qA, qB, t)           @0x83fe0    when *0xa8-flag says linear,
   *      OR call spline<double>(qA, qB, qA_tan, qB_tan, t)   @0x8412a    when the flag says cubic.
   *   8. Assemble a PCMatrix44 from the resulting quaternion (setRotationFromQuaternion @0x84189)
   *      and extract Euler XYZ via getTransformation @0x841bd, returning the scalar the caller
   *      requested (matching the OZChannelRotation3D::getValueV path that dispatches to this).
   *
   * All ~10 callees + the PCQuat/PCMatrix44 free functions + the OZSpline traversal helpers are
   * undecoded. Per PORTING_SPEC Rule 3 we throw citing every deferred addr. This class exists on
   * the vtable for OZChannelRotation3D-typed rotation curves (not currently activated by our
   * transition corpus, which does 2D transitions); landing it requires the deep quaternion/matrix
   * infrastructure first.
   */
  interpolate(
    _sp: OZSplineRef,
    _t: CMTime,
    _vA: unknown,
    _vB: unknown,
    _u: CMTime,
    _fX: boolean,
    _fY: boolean,
  ): number {
    throw new Error(
      "OZQuaternionCubicInterpolator::interpolate @ProChannel 0x82e6c not yet transcribed — " +
        "1057-line body requiring OZSpline::getSmallDeltaU @0x2fe52, " +
        "OZSpline::getPreviousValidVertex @0x839c0, OZSpline::getNextValidVertex @0x839d5, " +
        "OZChannel::getCurveInterface + dynamic_cast<OZCurve*>, OZSplineNode::getSpline, " +
        "OZChannelRotation3D *0xf0 vertex value fetches (x12), 18× ___sincos_stret for " +
        "Euler->quaternion, PCQuat<double> slerp @0x83fe0, PCQuat<double> spline @0x8412a, " +
        "PCMatrix44Tmpl<double>::setRotationFromQuaternion @0x84189, and " +
        "PCMatrix44Tmpl<double>::getTransformation @0x841bd — all undecoded.",
    );
  }
}

/**
 * Module-level default instance — mirrors FCP's OZInterpolators registry where a single stateless
 * OZQuaternionCubicInterpolator instance is installed for OZChannelRotation3D channels.
 * (Registry construction lives in OZInterpolators/OZChannelEnumInterpMode_Factory, not yet
 * transcribed. This export is a convenience matching the pattern in OZBezierInterpolator.ts.)
 */
export const OZ_QUATERNION_CUBIC_INTERPOLATOR = new OZQuaternionCubicInterpolator();
