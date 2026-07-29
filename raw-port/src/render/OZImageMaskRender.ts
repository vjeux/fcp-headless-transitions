// OZImageMaskRender — Ozone.framework. Renders an OZImageMask (channel-driven raster mask)
// through the Helium (Li*) graphics pipeline. Sits between OZImageNodeRender (whose C2 it
// invokes at 0x46e1d7) and the Li stencil / wrap / clamp node factories; ships pixel data
// via LiImageSource. Layout + method boundaries are recovered from the C1 ctor body and the
// dtor pair (D1/D0), cross-checked against the sibling class OZImageNodeRender360.
//
// This port lays down the class SKELETON: the real C1/C2 ctor field-layout (memoized from
// the disassembly), the real D1/D0 dtor teardown sequence, the trivial leaf
// pixelTransformSupport that returns the constant 6 verbatim from the binary, and
// address-citing throw-stubs for every remaining method. The disassembly for each stub is
// saved under raw-port/re/disasm/OZImageMaskRender.<method>.s and is what a follow-up
// worker will transcribe body-for-body — nothing here is approximated: undecoded methods
// throw loudly (per PORTING_SPEC Rule 3, ANTI_SHORTCUT G1/P4).
//
// Class hierarchy (recovered from C1@0x46e170 and D1@0x470590):
//   OZImageNodeRender                                       (base — C2 call @0x46e1d7)
//   └── OZImageMaskRender                                    (this class)
//        │  installs primary vtable ptr into +0x000 @0x46e1e3
//        │  installs secondary vtable ptr (LiImageSource subobject) into +0x638 @0x46e1ed
//        │  installs tertiary vtable ptr (PCShared_base) into +0x648 @0x46e1fb / @0x46e19b
//        │
//        ├── LiImageSource base subobject @ this+0x638
//        │     (constructed in place by __ZN13LiImageSourceC2Ev @0x46e1be)
//        │     (destroyed in place by __ZN13LiImageSourceD2Ev @0x470624)
//        │
//        └── PCShared_base tail @ this+0x648 (vtable) / this+0x650 (weak-count ptr)
//              (installed pre-C1 @0x46e19b/@0x46e1a2; weak_release'd by D1 @0x470647)
//
// Layout recovered from C1 ctor body (bytes 0x46e170..0x46e659) and D1 dtor (0x470590):
//   +0x000  vtable ptr (primary — OZImageMaskRender's own vtable)
//              @install: 0x46e1e3   ; @re-install by D1: 0x4705a1, 0x4705f2
//   +0x008  OZImageNodeRender base subobject start (see OZImageNodeRender::C2)
//              +0x010  OZRenderParams field (copy-constructed from arg2)
//                        @dtor: __ZN14OZRenderParamsD1Ev @0x470615 on this+0x010
//   +0x5d0  OZImageNode* — result of dynamic_cast<OZImageNode*>(arg1)  (nullable)
//              @0x46e202 zeroed pre-cast, @0x46e2bc/@0x46e4a2 stored after dispatch
//   +0x5d8  OZImageMask* — result of dynamic_cast<OZImageMask*>(arg1, offset 0x438)
//              @0x46e29d/0x46e2a4/0x46e2ab/0x46e2b3 (dynamic_cast with hint 0x438)
//              @0x46e2c3 stored, subsequently used as the mask channel-source pointer
//   +0x5e0  PCPtr<LiImageSource>-payload / LiImageSource* (result of makeImageSource)
//              @0x46e39d (path A — decoded), @0x46e4db (path B — vtable dispatch)
//   +0x5e8  PCSharedCount #1 (init C1 @0x46e222; teardown @0x4705df)
//   +0x5f0  __m128 double pair — zeroed @0x46e22a then rewritten with pool value @0x46e283
//   +0x600  __m128 double pair — pool-init from 0x297188 @0x46e231, overwritten @0x46e28a
//   +0x610  bool "has cached image source" — set by C1 @0x46e3dd (movb $0x1 stored)
//   +0x614  int32  ImageSpace (arg 4 — %ecx sign-extended, stored @0x46e23f)
//   +0x618  ptr — cleared @0x46e246
//   +0x620  PCSharedCount #2 (init C1 @0x46e25c; teardown @0x4705da)
//   +0x628  ptr — cleared @0x46e261
//   +0x630  PCSharedCount #3 (init C1 @0x46e277; teardown @0x4705ce)
//   +0x638  LiImageSource base subobject (constructed here @0x46e1c3/@0x46e1be)
//              +0x638  LiImageSource vtable (re-installed by D1 @0x4705b2 pre-teardown)
//   +0x648  PCShared_base tail vtable ptr (installed by C1 @0x46e19b/@0x46e1fb,
//              reset by D1 @0x470634 to __ZTV13PCShared_base+0x10)
//   +0x650  __shared_weak_count* (nullable; weak_release'd by D1 @0x470647)
//
// Ported methods (each cites @0xADDR):
//   @Ozone 0x0046ced0  OZImageMaskRender::OZImageMaskRender(OZImageNode*, OZRenderParams const&, LiImageSource::ImageSpace) (C1 alt)  (STUB)
//   @Ozone 0x0046e170  OZImageMaskRender::OZImageMaskRender(OZImageNode*, OZRenderParams const&, LiImageSource::ImageSpace) (C1)      (STUB)
//   @Ozone 0x0046d450  OZImageMaskRender::makeImageSource(OZRenderParams&, OZRenderParams&)                                          (STUB)
//   @Ozone 0x0046e7e0  OZImageMaskRender::calculateBackProjection(LiCamera const*, OZRenderState const&, PCMatrix44Tmpl<double>*)    (STUB)
//   @Ozone 0x0046e9c0  OZImageMaskRender::calcStretch(LiAgent&)                                                                       (STUB)
//   @Ozone 0x0046ed50  OZImageMaskRender::getClampNode(LiAgent&)                                                                      (STUB)
//   @Ozone 0x0046f010  OZImageMaskRender::getStencilClampNode(LiAgent&)                                                               (STUB)
//   @Ozone 0x0046f4e0  OZImageMaskRender::getStencilWrapPixelXForm(LiAgent&)                                                          (STUB)
//   @Ozone 0x0046f8f0  OZImageMaskRender::getWrapNode(LiAgent&)                                                                       (STUB)
//   @Ozone 0x004702c0  OZImageMaskRender::getHelium(LiAgent&)                                                                         (STUB)
//   @Ozone 0x00470580  OZImageMaskRender::pixelTransformSupport(LiRenderParameters const&)  -> constant 6                             (PORTED)
//   @Ozone 0x00470590  OZImageMaskRender::~OZImageMaskRender() (D1 base dtor)                                                        (STUB)
//   @Ozone 0x00470660  OZImageMaskRender::~OZImageMaskRender() (D0 deleting dtor)                                                    (PORTED — trivial thunk)
//
// Referenced frontier symbols (each throw-stub cites its callsite):
//   @Ozone 0x0046e19b  vtable for PCShared_base                    (leaq __ZTV13PCShared_base + 0x10)
//   @Ozone 0x0046e1be  __ZN13LiImageSourceC2Ev                     LiImageSource::LiImageSource()
//   @Ozone 0x0046e1d7  __ZN17OZImageNodeRenderC2EP11OZImageNodeRK14OZRenderParams
//                                                                  OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&)
//   @Ozone 0x0046e222  __ZN13PCSharedCountC1Ev                     PCSharedCount::PCSharedCount()
//   @Ozone 0x0046e2b3  ___dynamic_cast                             (target: OZImageMask, offset hint 0x438)
//   @Ozone 0x0046e2cd  __ZN14OZRenderParamsC1ERKS_                 OZRenderParams::OZRenderParams(OZRenderParams const&)
//   @Ozone 0x0046e2f1  __ZN11OZImageMask17getMaskSourceTimeE6CMTime
//   @Ozone 0x0046e328  __ZN11OZImageMask13getMaskSourceEb          OZImageMask::getMaskSource(bool)
//   @Ozone 0x0046e35c  ___dynamic_cast                             (target: OZImageNode, offset -2)
//   @Ozone 0x0046e391  __ZN17OZImageMaskRender15makeImageSourceER14OZRenderParamsS1_
//   @Ozone 0x0046e3eb  __ZN14OZRenderParamsD1Ev                    OZRenderParams::~OZRenderParams()
//   @Ozone 0x0046e411  __ZN30Render360GroupAsEquirectSentryC1EP11OZImageNodeR14OZRenderParams
//   @Ozone 0x0046e445  __ZNK14OZRenderParams15getLiAASettingsEP12LiAASettings
//   @Ozone 0x0046e45a  __ZN7LiGroupC1Ev                            LiGroup::LiGroup()
//   @Ozone 0x0046e495  __ZN14LiGraphBuilderC1ERK5PCPtrI7LiGroupERK12LiAASettings
//   @Ozone 0x0046e4a9  __ZN18OZRenderGraphStateC1Ev                OZRenderGraphState::OZRenderGraphState()
//   @Ozone 0x0046e4d1  virtual dispatch OZImageNode.vtable[+0x7a8]  (produces a LiImageSource*)
//   @Ozone 0x0046e845  __ZN13OZRenderState12setEyeMatrixEPK8LiCamera
//   @Ozone 0x0046e8d2  __ZNK14PCMatrix44TmplIdEmlERKS0_             PCMatrix44Tmpl<double>::operator*
//   @Ozone 0x0046e8e0  __ZN14PCMatrix44TmplIdE14planarInverseZERKS0_d  PCMatrix44Tmpl<double>::planarInverseZ
//   @Ozone 0x0046ea1b  virtual dispatch OZImageMask.vtable[+0x520]  (bool "has bounded input")
//   @Ozone 0x0046ea7c  virtual dispatch OZImageMask.vtable[+0x018]  (fills PCRect<double> from LiAgent)
//   @Ozone 0x0046ea94  virtual dispatch this.vtable[+0x000]         (fills PCRect<double> mask boundary)
//   @Ozone 0x0046ec18  __ZN11PCExceptionC1ERK8PCString              PCException::PCException(PCString const&)
//                       (thrown with literal "OZImageMaskRender::getHelium: couldn't get mask/input boundary")
//   @Ozone 0x0046f932  __ZNK9OZChannel13getValueAsIntERK6CMTimed    OZChannel::getValueAsInt(CMTime const&, double)
//   @Ozone 0x0046fa70  __ZN11OZImageMask29getMaskSourcePixelAspectRatioEv
//   @Ozone 0x004705ce  __ZN13PCSharedCountD1Ev                     PCSharedCount::~PCSharedCount()
//   @Ozone 0x00470624  __ZN13LiImageSourceD2Ev                     LiImageSource::~LiImageSource()
//   @Ozone 0x00470647  __ZN18PC_Sp_counted_base12weak_releaseEv    PC_Sp_counted_base::weak_release()
//   @Ozone 0x00470677  __ZdlPv                                     operator delete(void*)
//
// Source disassembly (raw-port/re/disasm/):
//   OZImageMaskRender.OZImageMaskRender.s        (C1 @0x46e170, 315 lines)
//   OZImageMaskRender.makeImageSource.s          (@0x46d450, 756 lines)
//   OZImageMaskRender.calculateBackProjection.s  (@0x46e7e0, 77 lines)
//   OZImageMaskRender.calcStretch.s              (@0x46e9c0, 186 lines)
//   OZImageMaskRender.getClampNode.s             (@0x46ed50, 158 lines)
//   OZImageMaskRender.getStencilClampNode.s      (@0x46f010, 259 lines)
//   OZImageMaskRender.getStencilWrapPixelXForm.s (@0x46f4e0, 191 lines)
//   OZImageMaskRender.getWrapNode.s              (@0x46f8f0, 511 lines)
//   OZImageMaskRender.getHelium.s                (@0x4702c0, 187 lines)
//   OZImageMaskRender.pixelTransformSupport.s    (@0x470580, 7 lines — ported below)
//   OZImageMaskRender.~OZImageMaskRender.s       (D0 @0x470660, 13 lines — ported below)
//   D1 body (@0x470590..0x470650) extracted by awk-label from /tmp/Ozone_tV.txt (see re section).

// Opaque frontier types (real classes not yet landed).
type OZImageNodeRef            = unknown;   // real: OZImageNode*
type OZImageMaskRef            = unknown;   // real: OZImageMask*
type OZRenderParamsRef         = unknown;   // real: OZRenderParams const&
type OZRenderStateRef          = unknown;   // real: OZRenderState const&
type LiAgentRef                = unknown;   // real: LiAgent&
type LiCameraRef               = unknown;   // real: LiCamera const*
type LiRenderParametersRef     = unknown;   // real: LiRenderParameters const&
type LiImageSourceRef          = unknown;   // real: LiImageSource*
type PCMatrix44DoubleRef       = unknown;   // real: PCMatrix44Tmpl<double>*
type LiImageSourceImageSpace   = number;    // enum, arg4 of C1 — sign-extended int32
type OZImageMaskRenderInstance = unknown;   // opaque "this" — real object is a raw struct

// ---- Frontier-symbol throw-stubs (each cites its callsite). ----

/** @Ozone 0x0046e1be  __ZN13LiImageSourceC2Ev */
function LiImageSource_C2(_baseThis: unknown): void {
    throw new Error("LiImageSource::LiImageSource() @Ozone 0x0046e1be not yet transcribed");
}

/** @Ozone 0x0046e1d7  __ZN17OZImageNodeRenderC2EP11OZImageNodeRK14OZRenderParams */
function OZImageNodeRender_C2(_this: unknown, _imgNode: OZImageNodeRef, _params: OZRenderParamsRef): void {
    throw new Error("OZImageNodeRender::OZImageNodeRender(OZImageNode*, OZRenderParams const&) @Ozone 0x0046e1d7 not yet transcribed");
}

/** @Ozone 0x0046e2cd  __ZN14OZRenderParamsC1ERKS_ */
function OZRenderParams_copy_ctor(_dst: unknown, _src: OZRenderParamsRef): void {
    throw new Error("OZRenderParams::OZRenderParams(OZRenderParams const&) @Ozone 0x0046e2cd not yet transcribed");
}

/** @Ozone 0x0046e3eb  __ZN14OZRenderParamsD1Ev */
function OZRenderParams_D1(_this: unknown): void {
    throw new Error("OZRenderParams::~OZRenderParams() @Ozone 0x0046e3eb not yet transcribed");
}

/** @Ozone 0x0046e222  __ZN13PCSharedCountC1Ev — no-arg ctor for the ref-count cells at +0x5e8/+0x620/+0x630. */
function PCSharedCount_C1(_this: unknown): void {
    throw new Error("PCSharedCount::PCSharedCount() @Ozone 0x0046e222 not yet transcribed");
}

/** @Ozone 0x004705ce  __ZN13PCSharedCountD1Ev — dtor called three times by D1 for the three cells. */
function PCSharedCount_D1(_this: unknown): void {
    throw new Error("PCSharedCount::~PCSharedCount() @Ozone 0x004705ce not yet transcribed");
}

/** @Ozone 0x00470624  __ZN13LiImageSourceD2Ev — dtor of the LiImageSource base subobject. */
function LiImageSource_D2(_baseThis: unknown): void {
    throw new Error("LiImageSource::~LiImageSource() @Ozone 0x00470624 not yet transcribed");
}

/** @Ozone 0x00470647  __ZN18PC_Sp_counted_base12weak_releaseEv */
function PC_Sp_counted_base_weak_release(_this: unknown): void {
    throw new Error("PC_Sp_counted_base::weak_release() @Ozone 0x00470647 not yet transcribed");
}

/** @Ozone 0x00470677  __ZdlPv — operator delete(void*), tail-called by D0. */
function operator_delete(_p: unknown): void {
    throw new Error("operator delete(void*) @Ozone 0x00470677 not yet transcribed");
}

// ---- The class itself. ----

export class OZImageMaskRender {
    // NOTE: fields carry the real byte offset recovered from the ctor disassembly. The layout
    // is a flat POD-like block; the runtime stores this alongside the OZImageNodeRender base
    // subobject at +0x008 and the LiImageSource subobject at +0x638. Any subsequent worker
    // porting one of the STUB methods below MUST read/write through these named fields (never
    // through raw offsets) — that keeps struct edits reviewable class-wide (PORTING_SPEC Rule 5).

    /** OZImageNode* — dynamic_cast<OZImageNode*>(arg1) from C1 @0x46e202/@0x46e4a2. */
    imageNode: OZImageNodeRef = null;                      // +0x5d0

    /** OZImageMask* — dynamic_cast<OZImageMask*>(arg1, hint 0x438) from C1 @0x46e2b3/@0x46e2c3. */
    imageMask: OZImageMaskRef = null;                      // +0x5d8

    /** LiImageSource* — cached image source, filled by makeImageSource@0x46e391 (path A) or
     *  by the virtual dispatch OZImageNode.vtable[+0x7a8]@0x46e4d1 (path B). */
    cachedImageSource: LiImageSourceRef = null;            // +0x5e0

    /** Two __m128d pool values written by C1 @0x46e22a/@0x46e231/@0x46e283/@0x46e28a. These
     *  are 128-bit constant-pool loads from Ozone.__const at RIP+0x297188 / RIP+0x29fedd; a
     *  follow-up worker will decode the exact double pair from Ozone.__const and store it
     *  here as a fixed 2-element Float64Array with the constant citation. */
    poolA_lo = 0;   poolA_hi = 0;                          // +0x5f0..+0x5f8
    poolB_lo = 0;   poolB_hi = 0;                          // +0x600..+0x608

    /** bool "has cached image source" — set by C1 @0x46e3dd. */
    hasCachedImageSource = false;                          // +0x610

    /** LiImageSource::ImageSpace — arg4 of the ctor, stored @0x46e23f. */
    imageSpace: LiImageSourceImageSpace = 0;               // +0x614

    // Three PCSharedCount cells + one raw pointer, part of the shared-count tail:
    //   +0x618  ptr — cleared @0x46e246
    //   +0x620  PCSharedCount #2 (C1 @0x46e25c)
    //   +0x628  ptr — cleared @0x46e261
    //   +0x630  PCSharedCount #3 (C1 @0x46e277)
    //   +0x5e8  PCSharedCount #1 (C1 @0x46e222)
    // Represented as opaque unknowns until PCSharedCount is decoded; a later worker will
    // replace these with the real PCSharedCount struct once it lands.
    sharedCount1: unknown = null;                          // +0x5e8
    ptr618: unknown = null;                                // +0x618
    sharedCount2: unknown = null;                          // +0x620
    ptr628: unknown = null;                                // +0x628
    sharedCount3: unknown = null;                          // +0x630

    /** __shared_weak_count* — nullable; weak_release'd by D1 @0x470647. */
    weakCount: unknown = null;                             // +0x650

    /**
     * OZImageMaskRender::OZImageMaskRender(OZImageNode*, OZRenderParams const&,
     *                                      LiImageSource::ImageSpace)  (C1, primary)
     * @Ozone 0x0046e170
     *
     * Body (315 lines) installs three vtable pointers, constructs the OZImageNodeRender base
     * subobject and the LiImageSource sub-subobject in place, seeds three PCSharedCount cells,
     * runs a two-way dynamic_cast (OZImageNode + OZImageMask hint 0x438), and then, on the
     * "isImageMask" branch, calls makeImageSource; on the fallback branch, constructs a
     * Render360GroupAsEquirectSentry + LiGroup + LiGraphBuilder + OZRenderGraphState and
     * dispatches OZImageNode.vtable[+0x7a8] to produce the LiImageSource*.
     *
     * Full transcription requires OZImageNodeRender::C2, OZRenderParams C1/D1, OZImageMask
     * getMaskSource/getMaskSourceTime, Render360GroupAsEquirectSentry::C1, LiGroup::C1, and
     * LiGraphBuilder::C1 to all be decoded first. Deferred; see disassembly file for the
     * full byte-accurate body a follow-up worker will transcribe.
     */
    constructor(_imgNode: OZImageNodeRef, _params: OZRenderParamsRef, _space: LiImageSourceImageSpace) {
        throw new Error("OZImageMaskRender::OZImageMaskRender(OZImageNode*, OZRenderParams const&, LiImageSource::ImageSpace) @Ozone 0x0046e170 not yet transcribed");
    }

    /**
     * OZImageMaskRender::OZImageMaskRender(OZImageNode*, OZRenderParams const&,
     *                                      LiImageSource::ImageSpace)  (C2 alt @ 0x0046ced0)
     *
     * Second constructor emission (C2 base-object ctor variant, callable from a derived
     * class's ctor). Bodies of C1 and C2 diverge only in how they set up the vtable tail —
     * decoded in parallel to C1 above. Deferred.
     */
    static C2_alt(_this: unknown, _imgNode: OZImageNodeRef, _params: OZRenderParamsRef, _space: LiImageSourceImageSpace): void {
        throw new Error("OZImageMaskRender::OZImageMaskRender(...)  C2 @Ozone 0x0046ced0 not yet transcribed");
    }

    /**
     * OZImageMaskRender::makeImageSource(OZRenderParams&, OZRenderParams&)
     * @Ozone 0x0046d450
     *
     * 756-line body — the largest routine on the class. Builds the LiImageSource* that the
     * ctor stashes at +0x5e0, walking OZImageMask's channel graph to compose the input mask
     * with its wrap/clamp/stencil sub-nodes. Deferred; a dedicated worker will port this one
     * on its own commit.
     */
    makeImageSource(_paramsA: OZRenderParamsRef, _paramsB: OZRenderParamsRef): LiImageSourceRef {
        throw new Error("OZImageMaskRender::makeImageSource(OZRenderParams&, OZRenderParams&) @Ozone 0x0046d450 not yet transcribed");
    }

    /**
     * OZImageMaskRender::calculateBackProjection(LiCamera const*, OZRenderState const&,
     *                                             PCMatrix44Tmpl<double>*)
     * @Ozone 0x0046e7e0
     *
     * 77-line body — dynamic_casts (this->imageMask)->getBaseSceneNode() to OZElement (hint 0),
     * copies the passed OZRenderState, primes its eye matrix via setEyeMatrix (@0x46e845),
     * builds a scratch identity PCMatrix44Tmpl<double> on the stack (four 0x3ff0000000000000
     * diag stores at @0x46e858..@0x46e86a), asks the element for its projection matrix via
     * OZElement.vtable[+0x500]@0x46e8a9 and its parent transform via arg2.vtable[+0x030]@0x46e8bf,
     * multiplies them with PCMatrix44Tmpl<double>::operator* (@0x46e8d2), then calls
     * PCMatrix44Tmpl<double>::planarInverseZ (@0x46e8e0) to compute the back-projection into
     * the output matrix. Returns bool.
     *
     * Deferred until PCMatrix44Tmpl<double>::operator* and planarInverseZ land; both are
     * pure-math OZ-friendly leaves that are next in the ledger.
     */
    calculateBackProjection(_camera: LiCameraRef, _renderState: OZRenderStateRef, _outMatrix: PCMatrix44DoubleRef): boolean {
        throw new Error("OZImageMaskRender::calculateBackProjection(LiCamera const*, OZRenderState const&, PCMatrix44Tmpl<double>*) @Ozone 0x0046e7e0 not yet transcribed");
    }

    /**
     * OZImageMaskRender::calcStretch(LiAgent&)
     * @Ozone 0x0046e9c0
     *
     * 186-line body — computes an anisotropic "stretch" transform stored in the passed-in
     * 8-double matrix by comparing the input boundary (dispatched via this.vtable[+0x000])
     * and the mask boundary (dispatched via OZImageMask.vtable[+0x018]) and, on the "has
     * bounded input" branch (OZImageMask.vtable[+0x520] @0x46ea1b), scaling by the ratio
     * of their spans; both throw a PCException with the literals
     *   "OZImageMaskRender::getHelium: couldn't get input boundary"     (@0x46ec01)
     *   "OZImageMaskRender::getHelium: couldn't get mask boundary"      (@0x46ec42)
     * when the corresponding vtable call returns false.
     *
     * Deferred; body contains 15+ vtable dispatches whose targets need decoding.
     */
    calcStretch(_agent: LiAgentRef): unknown {
        throw new Error("OZImageMaskRender::calcStretch(LiAgent&) @Ozone 0x0046e9c0 not yet transcribed");
    }

    /**
     * OZImageMaskRender::getClampNode(LiAgent&)
     * @Ozone 0x0046ed50
     */
    getClampNode(_agent: LiAgentRef): unknown {
        throw new Error("OZImageMaskRender::getClampNode(LiAgent&) @Ozone 0x0046ed50 not yet transcribed");
    }

    /**
     * OZImageMaskRender::getStencilClampNode(LiAgent&)
     * @Ozone 0x0046f010
     */
    getStencilClampNode(_agent: LiAgentRef): unknown {
        throw new Error("OZImageMaskRender::getStencilClampNode(LiAgent&) @Ozone 0x0046f010 not yet transcribed");
    }

    /**
     * OZImageMaskRender::getStencilWrapPixelXForm(LiAgent&)
     * @Ozone 0x0046f4e0
     */
    getStencilWrapPixelXForm(_agent: LiAgentRef): unknown {
        throw new Error("OZImageMaskRender::getStencilWrapPixelXForm(LiAgent&) @Ozone 0x0046f4e0 not yet transcribed");
    }

    /**
     * OZImageMaskRender::getWrapNode(LiAgent&)
     * @Ozone 0x0046f8f0
     *
     * 511-line body — dispatches through OZChannel::getValueAsInt (@0x46f932) with
     * (this->imageMask + 0x988, kCMTimeZero, 0.0) to read a "wrap mode" integer, and through
     * OZImageMask::getMaskSourcePixelAspectRatio (@0x46fa70) to seed the pixel-aspect scale;
     * on the "has stencil" branch inlines getStencilWrapPixelXForm above.
     */
    getWrapNode(_agent: LiAgentRef): unknown {
        throw new Error("OZImageMaskRender::getWrapNode(LiAgent&) @Ozone 0x0046f8f0 not yet transcribed");
    }

    /**
     * OZImageMaskRender::getHelium(LiAgent&)
     * @Ozone 0x004702c0
     */
    getHelium(_agent: LiAgentRef): unknown {
        throw new Error("OZImageMaskRender::getHelium(LiAgent&) @Ozone 0x004702c0 not yet transcribed");
    }

    /**
     * OZImageMaskRender::pixelTransformSupport(LiRenderParameters const&)  -> 6
     * @Ozone 0x00470580
     *
     * Disassembly (raw-port/re/disasm/OZImageMaskRender.pixelTransformSupport.s):
     *   pushq %rbp / movq %rsp,%rbp / movl $0x6,%eax / popq %rbp / retq
     * The function unconditionally returns the constant 6 — a support-mask bitfield the
     * caller ORs into a Li pipeline capability set. Same shape as the sibling
     * OZImageNodeRender360::pixelTransformSupport (@Ozone 0x0041dcc0) which returns 3, and
     * OZImageNodeRender's own default (undecoded here). Verified by direct read of the
     * @0x00470580 disassembly file — no branches, no vtable, no floating point.
     */
    pixelTransformSupport(_params: LiRenderParametersRef): number {
        return 6;
    }

    /**
     * OZImageMaskRender::~OZImageMaskRender()  (D1 — base dtor, invoked by D0)
     * @Ozone 0x00470590
     *
     * D1 body (extracted by awk-label from /tmp/Ozone_tV.txt):
     *   1. Reinstalls THIS OWN class's three vtable pointers so any virtual call issued from
     *      within a member dtor dispatches to *this* class, not a derived one (@0x47059a → +0x000,
     *      @0x4705ab → +0x638, @0x4705b9 → +0x648).
     *   2. Tears down PCSharedCount #3, #2, #1 in reverse construction order
     *      (@0x4705c7 for +0x630, @0x4705d3 for +0x620, @0x4705df for +0x5e8).
     *   3. Reinstalls another vtable trio (@0x4705eb → +0x000, @0x4705f5 → +0x638,
     *      @0x470603 → +0x648) — this second install corresponds to the OZImageNodeRender base
     *      re-taking control before its own dtor is not yet called here (the compiler emits the
     *      chain when the base dtor is itself invoked via a static call that follows below via
     *      OZRenderParams::~OZRenderParams and LiImageSource::~LiImageSource — the base dtor is
     *      not shown in this function body because the compiler chained it as a direct call
     *      after the tail; verifying that requires reading OZImageNodeRender::D1).
     *   4. Destroys OZRenderParams at +0x010 (@0x470615, __ZN14OZRenderParamsD1Ev).
     *   5. Destroys the LiImageSource subobject at +0x638 (@0x470624, __ZN13LiImageSourceD2Ev).
     *   6. Resets the PCShared_base tail vtable pointer at +0x648 to __ZTV13PCShared_base+0x10
     *      (@0x470629..@0x470634) and, if the weak-count pointer at +0x650 is non-null, calls
     *      __ZN18PC_Sp_counted_base12weak_releaseEv on it (@0x470647).
     *
     * Deferred to a follow-up worker because steps 1/3 depend on the four Ozone-local vtable
     * addresses (0x3f76e7 / 0x3f77ce / 0x3f7888 / 0x3f78de / 0x3f79cc / 0x3f7a86 relative RIP)
     * being resolved to their __ZTV constants — that's a resolve.py pass on the exact bytes.
     */
    destructor_D1(): void {
        throw new Error("OZImageMaskRender::~OZImageMaskRender() D1 @Ozone 0x00470590 not yet transcribed");
    }

    /**
     * OZImageMaskRender::~OZImageMaskRender()  (D0 — deleting dtor, vtable slot)
     * @Ozone 0x00470660
     *
     * Disassembly (raw-port/re/disasm/OZImageMaskRender.~OZImageMaskRender.s, 13 lines):
     *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
     *   movq %rdi,%rbx
     *   callq __ZN17OZImageMaskRenderD1Ev              ## OZImageMaskRender::~OZImageMaskRender()
     *   movq %rbx,%rdi / addq $0x8,%rsp / popq %rbx / popq %rbp
     *   jmp  __ZdlPv                                   ## operator delete(void*) (tail-call)
     *
     * The compiler-standard "call D1 then tail-jump to operator delete" pattern. Ported
     * literally: run the base dtor, then delete the allocation. Because D1 itself is
     * currently a throw-stub (see above), calling D0 today will surface the D1 gap loudly
     * — that is the correct behaviour per Rule 3 (loud gaps beat silent progress).
     */
    destructor_D0(): void {
        // Line 3: callq __ZN17OZImageMaskRenderD1Ev @0x470669
        this.destructor_D1();
        // Line 7: jmp __ZdlPv @0x470677 (tail-call)
        operator_delete(this as unknown);
    }
}
