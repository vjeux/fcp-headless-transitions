// OZRigBehavior.ts — raw transcription of Ozone `OZRigBehavior`.
//
// OZRigBehavior is a large OZSingleChannelBehavior-derived Ozone behavior that models a "rig"
// — a container for multiple named snapshot states of one or more OZChannelBase objects, plus
// an OZChanObjectRefWithPicker (the ObjectRef channel that selects which channel this rig is
// attached to) and an OZChannelVaryingFolder (the folder that holds the per-snapshot child
// channels). At solve time it interpolates channel values between snapshots using the current
// snapshot ID cached from the current time.
//
// This port is a CHUNK-scale skeleton (Rule 3 of PORTING_SPEC): ctor/dtor/vptr install and
// field layout are transcribed exactly; the deep, multi-hundred-line methods (parseBegin,
// getRiggedValue, solveNode, createInterpolatingSnapshot, calcHashForState, …) are
// declared as boundary throw-stubs that CITE their `@0xADDR` so `frontier.py` can see the
// remaining gap.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// KEY SYMBOLS (mangled → demangled):
//   @0x575380  __ZN13OZRigBehaviorC2EP9OZFactoryRK8PCStringj
//                OZRigBehavior::OZRigBehavior(OZFactory*, PCString const&, unsigned int)  [C2]
//   @0x575540  __ZN13OZRigBehaviorC1EP9OZFactoryRK8PCStringj                              [C1 shim → C2]
//   @0x575550  __ZN13OZRigBehaviorC2ERKS_j
//                OZRigBehavior::OZRigBehavior(OZRigBehavior const&, unsigned int)         [C2 copy]
//   @0x575770  __ZN13OZRigBehaviorD2Ev  ~OZRigBehavior()                                  [D2]
//   @0x575800  __ZN13OZRigBehaviorD1Ev  ~OZRigBehavior()                                  [D1]
//   @0x575b10  __ZN13OZRigBehaviorD0Ev  ~OZRigBehavior()                                  [D0 deleting]
//   @0x575e50  __ZN13OZRigBehavioraSERK10OZBehavior
//                OZRigBehavior::operator=(OZBehavior const&)
//   @0x577370  __ZN13OZRigBehavior9setWidgetEP11OZRigWidget
//                OZRigBehavior::setWidget(OZRigWidget*)
//   @0x576d10  __ZN13OZRigBehavior27clearCurrentSnapshotIDCacheEv
//                OZRigBehavior::clearCurrentSnapshotIDCache()
//   (46 methods total — full list in raw-port/re/disasm/OZRigBehavior.*.s and in the stubs below.)
//
// VTABLE (`resolve.py Ozone vtable OZRigBehavior`):
//   __ZTV13OZRigBehavior @0x87f918;  installed primary vptr = table+0x10 = 0x87f928.
//   Overridden slots (relative to installed ptr 0x87f928):
//     *0x00 -> 0x575800  ~OZRigBehavior [D1]
//     *0x08 -> 0x575b10  ~OZRigBehavior [D0 deleting]
//     *0x50 -> 0x575e50  operator=(OZBehavior const&)
//     *0x60 -> 0x576410  didAddToNode(OZSceneNode*)
//     *0x78 -> 0x576480  willRemove()
//     *0x88 -> 0x576540  didAddSceneNodeToScene(OZScene*)
//     *0x90 -> 0x5765b0  willRemoveSceneNodeFromScene(OZScene*)
//     *0x98 -> 0x576610  willDeleteObject(OZObjectManipulator*)
//     *0xa0 -> 0x576700  willDeleteMaterialLayer(OZMaterialLayerBase*)
//     *0xa8 -> 0x576680  didUndoDeleteOfObject(OZObjectManipulator*)
//     *0xc0 -> 0x576870  willUndoReorder()
//     *0xc8 -> 0x576880  didUndoReorder()
//     *0xd0 -> 0x576780  willDeleteChannel(OZChannelBase*)
//     *0xd8 -> 0x5767f0  didUndoDeleteChannel(OZChannelBase*)
//   (Non-override slots inherit OZSingleChannelBehavior / OZChannelBehavior / OZBehavior /
//    OZFactoryBase; recovered by `resolve.py Ozone vtable OZRigBehavior`.)
//
// VPTR INSTALL (C2 body @0x575399..0x5753d0):
//   +0x000 vptr primary   = 0x87f928   (leaq 0x30a588(%rip) @0x575399; nip 0x5753a0 + 0x30a588)
//   +0x010 vptr sub A     = 0x87fc78   (leaq 0x30a8ce(%rip) @0x5753a3)
//   +0x028 vptr sub B     = 0x87fed0   (leaq 0x30ab1b(%rip) @0x5753ae)
//   +0x148 vptr sub C     = 0x87ff28   (leaq 0x30ab68(%rip) @0x5753b9)
//   +0x210 vptr sub D     = 0x87ff50   (leaq 0x30ab82(%rip) @0x5753c7)
//   The same 5 vptrs are re-installed in D0 (`@0x575b19..`), D1 (`@0x575809..`) and D2
//   (`@0x575779..`) before the base dtors run (standard Itanium C++ ABI destructor prelude).
//
// STRUCT LAYOUT (recovered from ctor + accessor disasm):
//   +0x000  vptr           primary vtable       (= 0x87f928)
//   +0x010  vptr           sub A vtable         (= 0x87fc78)
//   +0x028  vptr           sub B vtable         (= 0x87fed0)
//   +0x030  OZChannelBase  base channel subobject (r12 in ctor: leaq 0x30(%rbx),%r12).
//   +0x148  vptr           sub C vtable         (= 0x87ff28)
//   +0x210  vptr           sub D vtable         (= 0x87ff50)
//   +0x370  uint8_t        currentSnapshotIDCache_valid flag
//   +0x378  PCSharedMutex  currentSnapshotID cache mutex
//   +0x3c8  void*          heap-allocated pointer (nullable) — freed via operator delete in D0
//   +0x3d0  void*          shadow-copy of +0x3c8
//   +0x3e0  OZChanObjectRefWithPicker  ObjectRef-with-picker channel
//   +0x4a9  bool           some flag set to 0 at ctor+0x5754ab
//   +0x4b0  OZChannelVaryingFolder  snapshot-varying folder
//   +0x530  uint16_t       flag word initialised to 0 at ctor+0x575474
//
// -----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */

// ── Frontier types (opaque handles for symbols not yet ported) ────────────

/** OZFactory* — opaque frontier. */
export interface OZFactoryLike { readonly __OZFactory_opaque: unique symbol; }
/** PCString const& — opaque. */
export interface PCStringLike { readonly __PCString_opaque: unique symbol; }
/** OZBehavior const& — opaque. */
export interface OZBehaviorLike { readonly __OZBehavior_opaque: unique symbol; }
/** OZSceneNode* — opaque. */
export interface OZSceneNodeLike { readonly __OZSceneNode_opaque: unique symbol; }
/** OZScene* — opaque. */
export interface OZSceneLike { readonly __OZScene_opaque: unique symbol; }
/** OZChannelBase* — opaque. */
export interface OZChannelBaseLike { readonly __OZChannelBase_opaque: unique symbol; }
/** OZObjectManipulator* — opaque. */
export interface OZObjectManipulatorLike { readonly __OZObjectManipulator_opaque: unique symbol; }
/** OZMaterialLayerBase* — opaque. */
export interface OZMaterialLayerBaseLike { readonly __OZMaterialLayerBase_opaque: unique symbol; }
/** OZPasteList* — opaque. */
export interface OZPasteListLike { readonly __OZPasteList_opaque: unique symbol; }
/** OZRigWidget* — opaque. */
export interface OZRigWidgetLike { readonly __OZRigWidget_opaque: unique symbol; }
/** CMTime — rational time. */
export interface CMTimeLike {
  readonly value: bigint;
  readonly timescale: number;
  readonly flags: number;
  readonly epoch: bigint;
}
/** PCSerializerReadStream& — opaque. */
export interface PCSerializerReadStreamLike { readonly __PCSerializerReadStream_opaque: unique symbol; }
/** PCSerializerWriteStream& — opaque. */
export interface PCSerializerWriteStreamLike { readonly __PCSerializerWriteStream_opaque: unique symbol; }
/** OZRenderParams const& — opaque. */
export interface OZRenderParamsLike { readonly __OZRenderParams_opaque: unique symbol; }
/** PCSharedMutex — opaque. */
export interface PCSharedMutexLike { readonly __PCSharedMutex_opaque: unique symbol; }
/** OZChanObjectRefWithPicker — opaque. */
export interface OZChanObjectRefWithPickerLike { readonly __OZChanObjectRefWithPicker_opaque: unique symbol; }
/** OZChannelVaryingFolder — opaque. */
export interface OZChannelVaryingFolderLike { readonly __OZChannelVaryingFolder_opaque: unique symbol; }

// ── Absolute address constants recovered from RIP arithmetic in the ctor ──

/** Primary vtable installed ptr — vtable+0x10.  From ctor @0x5753a0. */
export const OZRIGBEHAVIOR_VTABLE_PRIMARY = 0x87f928;
/** Secondary sub-vtable stored at +0x10.  From ctor @0x5753aa. */
export const OZRIGBEHAVIOR_VTABLE_SUB_A   = 0x87fc78;
/** Sub-vtable at +0x28.  From ctor @0x5753b5. */
export const OZRIGBEHAVIOR_VTABLE_SUB_B   = 0x87fed0;
/** Sub-vtable at +0x148.  From ctor @0x5753c0. */
export const OZRIGBEHAVIOR_VTABLE_SUB_C   = 0x87ff28;
/** Sub-vtable at +0x210.  From ctor @0x5753ce. */
export const OZRIGBEHAVIOR_VTABLE_SUB_D   = 0x87ff50;

// ── The struct itself (allocated by C2; freed by D0) ──────────────────────

export interface OZRigBehavior {
  vptrPrimary: number;                                /* +0x000 */
  vptrSubA: number;                                   /* +0x010 */
  vptrSubB: number;                                   /* +0x028 */
  baseChannel: OZChannelBaseLike;                     /* +0x030 */
  vptrSubC: number;                                   /* +0x148 */
  vptrSubD: number;                                   /* +0x210 */
  currentSnapshotIDValid: boolean;                    /* +0x370 */
  snapshotIDMutex: PCSharedMutexLike;                 /* +0x378 */
  ptr_0x3c8: unknown | null;                          /* +0x3c8 */
  ptr_0x3d0: unknown | null;                          /* +0x3d0 */
  objectRefPicker: OZChanObjectRefWithPickerLike;     /* +0x3e0 */
  flag_0x4a9: boolean;                                /* +0x4a9 */
  varyingFolder: OZChannelVaryingFolderLike;          /* +0x4b0 */
  flag_0x530: number;                                 /* +0x530 */
}

// ── Boundary stubs for base-class ctors/dtors we invoke ───────────────────

/** OZSingleChannelBehavior::C2 — extern base-class ctor (Ozone). */
export function OZSingleChannelBehavior_C2(
  _self: unknown, _factory: OZFactoryLike, _name: PCStringLike, _flags: number,
): void {
  throw new Error("OZSingleChannelBehavior::OZSingleChannelBehavior @0x575394 not yet transcribed");
}
/** PCSharedMutex::C1 — extern (called from ctor stub @0x6ddb12). */
export function PCSharedMutex_C1(_self: PCSharedMutexLike): void {
  throw new Error("PCSharedMutex::PCSharedMutex @0x6ddb12 not yet transcribed");
}
/** PCSharedMutex::lock — extern (stub @0x6ddb06). */
export function PCSharedMutex_lock(_self: PCSharedMutexLike): void {
  throw new Error("PCSharedMutex::lock @0x6ddb06 not yet transcribed");
}
/** PCSharedMutex::unlock — extern (stub @0x6ddb0c). */
export function PCSharedMutex_unlock(_self: PCSharedMutexLike): void {
  throw new Error("PCSharedMutex::unlock @0x6ddb0c not yet transcribed");
}

// ── Ctor bodies (line-for-line transcription of the disasm) ───────────────

/**
 * `OZRigBehavior::OZRigBehavior(OZFactory*, PCString const&, unsigned int)` — @0x575380 [C2].
 * Full method body defers to sub-object construction which routes through _theApp state and
 * PCString-from-CFString glue; only the vptr installs + base-ctor call + mutex init are
 * transcribed inline.
 * @0x575380  __ZN13OZRigBehaviorC2EP9OZFactoryRK8PCStringj
 */
export function OZRigBehavior_C2(
  self: OZRigBehavior, factory: OZFactoryLike, name: PCStringLike, flags: number,
): void {
  OZSingleChannelBehavior_C2(self, factory, name, flags);
  self.vptrPrimary = OZRIGBEHAVIOR_VTABLE_PRIMARY;
  self.vptrSubA    = OZRIGBEHAVIOR_VTABLE_SUB_A;
  self.vptrSubB    = OZRIGBEHAVIOR_VTABLE_SUB_B;
  self.vptrSubC    = OZRIGBEHAVIOR_VTABLE_SUB_C;
  self.vptrSubD    = OZRIGBEHAVIOR_VTABLE_SUB_D;
  PCSharedMutex_C1(self.snapshotIDMutex);
  throw new Error("OZRigBehavior::OZRigBehavior sub-object construction @0x5753e4 not yet transcribed");
}

/**
 * `OZRigBehavior::OZRigBehavior(OZFactory*, PCString const&, unsigned int)` — @0x575540 [C1].
 * Standard C1→C2 tail-jmp shim.
 * @0x575540  __ZN13OZRigBehaviorC1EP9OZFactoryRK8PCStringj
 */
export function OZRigBehavior_C1(
  self: OZRigBehavior, factory: OZFactoryLike, name: PCStringLike, flags: number,
): void {
  OZRigBehavior_C2(self, factory, name, flags);
}

/**
 * `OZRigBehavior::OZRigBehavior(OZRigBehavior const&, unsigned int)` — @0x575550 [C2 copy].
 * @0x575550  __ZN13OZRigBehaviorC2ERKS_j
 */
export function OZRigBehavior_C2_copy(
  _self: OZRigBehavior, _src: OZRigBehavior, _flags: number,
): void {
  throw new Error("OZRigBehavior::OZRigBehavior(copy) @0x575550 not yet transcribed");
}

/**
 * `OZRigBehavior::OZRigBehavior(OZRigBehavior const&, unsigned int)` [C1 copy shim].
 * @0x575690  __ZN13OZRigBehaviorC1ERKS_j
 */
export function OZRigBehavior_C1_copy(
  self: OZRigBehavior, src: OZRigBehavior, flags: number,
): void {
  OZRigBehavior_C2_copy(self, src, flags);
}

// ── Destructors ───────────────────────────────────────────────────────────

/** @0x575770  __ZN13OZRigBehaviorD2Ev */
export function OZRigBehavior_D2(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::~OZRigBehavior [D2] @0x575770 not yet transcribed");
}
/** @0x575800  __ZN13OZRigBehaviorD1Ev */
export function OZRigBehavior_D1(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::~OZRigBehavior [D1] @0x575800 not yet transcribed");
}
/** @0x575b10  __ZN13OZRigBehaviorD0Ev */
export function OZRigBehavior_D0(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::~OZRigBehavior [D0 deleting] @0x575b10 not yet transcribed");
}

// ── Small trivially-decodable leaves (ported inline) ──────────────────────

/**
 * `OZRigBehavior::clearCurrentSnapshotIDCache()` — @0x576d10.
 * Line-for-line transcription:
 *   1. r14 = this + 0x378  (mutex address)                          @0x576d1a
 *   2. PCSharedMutex::lock(r14)                                     @0x576d24
 *   3. this[+0x370] = 0 (u8)                                        @0x576d29
 *   4. PCSharedMutex::unlock(r14)                                   @0x576d33
 * @0x576d10  __ZN13OZRigBehavior27clearCurrentSnapshotIDCacheEv
 */
export function OZRigBehavior_clearCurrentSnapshotIDCache(self: OZRigBehavior): void {
  PCSharedMutex_lock(self.snapshotIDMutex);
  self.currentSnapshotIDValid = false;
  PCSharedMutex_unlock(self.snapshotIDMutex);
}

// ── Deep methods: throw-stubs citing @0xADDR (Rule 3) ─────────────────────

/** @0x5756f0  __ZN13OZRigBehavior4copyERK10OZBehavior */
export function OZRigBehavior_copy(_self: OZRigBehavior, _src: OZBehaviorLike): void {
  throw new Error("OZRigBehavior::copy(OZBehavior const&) @0x5756f0 not yet transcribed");
}
/** @0x575e50  __ZN13OZRigBehavioraSERK10OZBehavior */
export function OZRigBehavior_operator_assign(_self: OZRigBehavior, _rhs: OZBehaviorLike): OZRigBehavior {
  throw new Error("OZRigBehavior::operator=(OZBehavior const&) @0x575e50 not yet transcribed");
}
/** @0x576410  __ZN13OZRigBehavior12didAddToNodeEP11OZSceneNode */
export function OZRigBehavior_didAddToNode(_self: OZRigBehavior, _n: OZSceneNodeLike): void {
  throw new Error("OZRigBehavior::didAddToNode(OZSceneNode*) @0x576410 not yet transcribed");
}
/** @0x576480  __ZN13OZRigBehavior10willRemoveEv */
export function OZRigBehavior_willRemove(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::willRemove() @0x576480 not yet transcribed");
}
/** @0x576540  __ZN13OZRigBehavior22didAddSceneNodeToSceneEP7OZScene */
export function OZRigBehavior_didAddSceneNodeToScene(_self: OZRigBehavior, _s: OZSceneLike): void {
  throw new Error("OZRigBehavior::didAddSceneNodeToScene(OZScene*) @0x576540 not yet transcribed");
}
/** @0x5765b0  __ZN13OZRigBehavior28willRemoveSceneNodeFromSceneEP7OZScene */
export function OZRigBehavior_willRemoveSceneNodeFromScene(_self: OZRigBehavior, _s: OZSceneLike): void {
  throw new Error("OZRigBehavior::willRemoveSceneNodeFromScene(OZScene*) @0x5765b0 not yet transcribed");
}
/** @0x576610  __ZN13OZRigBehavior16willDeleteObjectEP19OZObjectManipulator */
export function OZRigBehavior_willDeleteObject(_self: OZRigBehavior, _o: OZObjectManipulatorLike): void {
  throw new Error("OZRigBehavior::willDeleteObject(OZObjectManipulator*) @0x576610 not yet transcribed");
}
/** @0x576680  __ZN13OZRigBehavior21didUndoDeleteOfObjectEP19OZObjectManipulator */
export function OZRigBehavior_didUndoDeleteOfObject(_self: OZRigBehavior, _o: OZObjectManipulatorLike): void {
  throw new Error("OZRigBehavior::didUndoDeleteOfObject(OZObjectManipulator*) @0x576680 not yet transcribed");
}
/** @0x576700  __ZN13OZRigBehavior23willDeleteMaterialLayerEP19OZMaterialLayerBase */
export function OZRigBehavior_willDeleteMaterialLayer(_self: OZRigBehavior, _m: OZMaterialLayerBaseLike): void {
  throw new Error("OZRigBehavior::willDeleteMaterialLayer(OZMaterialLayerBase*) @0x576700 not yet transcribed");
}
/** @0x576780  __ZN13OZRigBehavior17willDeleteChannelEP13OZChannelBase */
export function OZRigBehavior_willDeleteChannel(_self: OZRigBehavior, _c: OZChannelBaseLike): void {
  throw new Error("OZRigBehavior::willDeleteChannel(OZChannelBase*) @0x576780 not yet transcribed");
}
/** @0x5767f0  __ZN13OZRigBehavior20didUndoDeleteChannelEP13OZChannelBase */
export function OZRigBehavior_didUndoDeleteChannel(_self: OZRigBehavior, _c: OZChannelBaseLike): void {
  throw new Error("OZRigBehavior::didUndoDeleteChannel(OZChannelBase*) @0x5767f0 not yet transcribed");
}
/** @0x576870  __ZN13OZRigBehavior15willUndoReorderEv */
export function OZRigBehavior_willUndoReorder(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::willUndoReorder() @0x576870 not yet transcribed");
}
/** @0x576880  __ZN13OZRigBehavior14didUndoReorderEv */
export function OZRigBehavior_didUndoReorder(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::didUndoReorder() @0x576880 not yet transcribed");
}
/** @0x577370  __ZN13OZRigBehavior9setWidgetEP11OZRigWidget
 *  Disasm (10 lines):
 *    addq $0x3e0, %rdi                                  ## this += 0x3e0 (→ objectRefPicker)
 *    movl 0x48(%rsi), %eax; cvtsi2sd %rax, %xmm0         ## widget->0x48 (int32) → double
 *    movq _kCMTimeZero(%rip), %rsi
 *    xorl %edx, %edx
 *    jmp OZChannel::setValue(CMTime const&, double, bool)
 */
export function OZRigBehavior_setWidget(_self: OZRigBehavior, _widget: OZRigWidgetLike): void {
  throw new Error("OZRigBehavior::setWidget(OZRigWidget*) @0x577370 not yet transcribed");
}
/** __ZN13OZRigBehavior18registerWithWidgetEv */
export function OZRigBehavior_registerWithWidget(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::registerWithWidget() @0x576040 not yet transcribed");
}
/** __ZN13OZRigBehavior20unregisterWithWidgetEv */
export function OZRigBehavior_unregisterWithWidget(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::unregisterWithWidget() @0x5764e0 not yet transcribed");
}
/** __ZN13OZRigBehavior10parseBeginER22PCSerializerReadStream */
export function OZRigBehavior_parseBegin(_self: OZRigBehavior, _s: PCSerializerReadStreamLike): void {
  throw new Error("OZRigBehavior::parseBegin(PCSerializerReadStream&) @0x575ec0 not yet transcribed");
}
/** __ZN13OZRigBehavior14calcStaticHashE... */
export function OZRigBehavior_calcStaticHash(
  _self: OZRigBehavior, _s: PCSerializerWriteStreamLike, _mods: OZObjectManipulatorLike[],
): void {
  throw new Error("OZRigBehavior::calcStaticHash(...) @0x576a20 not yet transcribed");
}
/** __ZN13OZRigBehavior16calcHashForState... */
export function OZRigBehavior_calcHashForState(
  _self: OZRigBehavior, _s: PCSerializerWriteStreamLike, _rp: OZRenderParamsLike, _mods: OZObjectManipulatorLike[],
): void {
  throw new Error("OZRigBehavior::calcHashForState(...) @0x576b20 not yet transcribed");
}
/** __ZN13OZRigBehavior14getRiggedValueEjjjdRK6CMTime */
export function OZRigBehavior_getRiggedValue(
  _self: OZRigBehavior, _idA: number, _idB: number, _idx: number, _t: number, _time: CMTimeLike,
): number {
  throw new Error("OZRigBehavior::getRiggedValue(unsigned int,unsigned int,unsigned int,double,CMTime const&) @0x576f10 not yet transcribed");
}
/** __ZN13OZRigBehavior9solveNodeEjRK6CMTimedd */
export function OZRigBehavior_solveNode(
  _self: OZRigBehavior, _flags: number, _time: CMTimeLike, _a: number, _b: number,
): void {
  throw new Error("OZRigBehavior::solveNode(unsigned int, CMTime const&, double, double) @0x576d70 not yet transcribed");
}
/** __ZN13OZRigBehavior10copyScalesEPK13OZChannelBasePS0_ */
export function OZRigBehavior_copyScales(
  _self: OZRigBehavior, _src: OZChannelBaseLike, _dst: OZChannelBaseLike,
): void {
  throw new Error("OZRigBehavior::copyScales(OZChannelBase const*, OZChannelBase*) @0x577730 not yet transcribed");
}
/** __ZN13OZRigBehavior10copyValuesEPK13OZChannelBasePS0_ */
export function OZRigBehavior_copyValues(
  _self: OZRigBehavior, _src: OZChannelBaseLike, _dst: OZChannelBaseLike,
): void {
  throw new Error("OZRigBehavior::copyValues(OZChannelBase const*, OZChannelBase*) @0x5778b0 not yet transcribed");
}
/** __ZN13OZRigBehavior14addToSceneNodeEP11OZSceneNode */
export function OZRigBehavior_addToSceneNode(_self: OZRigBehavior, _n: OZSceneNodeLike): void {
  throw new Error("OZRigBehavior::addToSceneNode(OZSceneNode*) @0x578090 not yet transcribed");
}
/** __ZN13OZRigBehavior14deleteSnapshotEj */
export function OZRigBehavior_deleteSnapshot(_self: OZRigBehavior, _id: number): void {
  throw new Error("OZRigBehavior::deleteSnapshot(unsigned int) @0x577640 not yet transcribed");
}
/** __ZN13OZRigBehavior20copySnapshotToTargetEj */
export function OZRigBehavior_copySnapshotToTarget(_self: OZRigBehavior, _id: number): void {
  throw new Error("OZRigBehavior::copySnapshotToTarget(unsigned int) @0x577860 not yet transcribed");
}
/** __ZN13OZRigBehavior20copyTargetToSnapshotEj */
export function OZRigBehavior_copyTargetToSnapshot(_self: OZRigBehavior, _id: number): void {
  throw new Error("OZRigBehavior::copyTargetToSnapshot(unsigned int) @0x5776d0 not yet transcribed");
}
/** __ZN13OZRigBehavior20sortSnapshotChannelsEv */
export function OZRigBehavior_sortSnapshotChannels(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::sortSnapshotChannels() @0x5780d0 not yet transcribed");
}
/** __ZN13OZRigBehavior21adjustToSnapshotCountEv */
export function OZRigBehavior_adjustToSnapshotCount(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::adjustToSnapshotCount() @0x5760a0 not yet transcribed");
}
/** __ZN13OZRigBehavior21createDefaultSnapshotEjPK13OZChannelBase */
export function OZRigBehavior_createDefaultSnapshot(
  _self: OZRigBehavior, _id: number, _ch: OZChannelBaseLike,
): void {
  throw new Error("OZRigBehavior::createDefaultSnapshot(unsigned int, OZChannelBase const*) @0x577410 not yet transcribed");
}
/** __ZN13OZRigBehavior27createDefaultSnapshotHelperEjPK13OZChannelBase */
export function OZRigBehavior_createDefaultSnapshotHelper(
  _self: OZRigBehavior, _id: number, _ch: OZChannelBaseLike,
): void {
  throw new Error("OZRigBehavior::createDefaultSnapshotHelper(unsigned int, OZChannelBase const*) @0x5773a0 not yet transcribed");
}
/** __ZN13OZRigBehavior27createInterpolatingSnapshotEjjjdRK6CMTime */
export function OZRigBehavior_createInterpolatingSnapshot(
  _self: OZRigBehavior, _idOut: number, _idA: number, _idB: number, _t: number, _time: CMTimeLike,
): void {
  throw new Error("OZRigBehavior::createInterpolatingSnapshot(unsigned int,unsigned int,unsigned int,double,CMTime const&) @0x577480 not yet transcribed");
}
/** __ZN13OZRigBehavior21getChannelForSnapshotEj */
export function OZRigBehavior_getChannelForSnapshot(
  _self: OZRigBehavior, _id: number,
): OZChannelBaseLike {
  throw new Error("OZRigBehavior::getChannelForSnapshot(unsigned int) @0x5780b0 not yet transcribed");
}
/** __ZN13OZRigBehavior22cacheCurrentSnapshotIDERK6CMTime */
export function OZRigBehavior_cacheCurrentSnapshotID(_self: OZRigBehavior, _time: CMTimeLike): void {
  throw new Error("OZRigBehavior::cacheCurrentSnapshotID(CMTime const&) @0x576c40 not yet transcribed");
}
/** __ZN13OZRigBehavior25didFinishLoadingIntoSceneEv */
export function OZRigBehavior_didFinishLoadingIntoScene(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::didFinishLoadingIntoScene() @0x575f10 not yet transcribed");
}
/** __ZN13OZRigBehavior28canAddToChannelAfterMismatchEP13OZChannelBase */
export function OZRigBehavior_canAddToChannelAfterMismatch(
  _self: OZRigBehavior, _c: OZChannelBaseLike,
): boolean {
  throw new Error("OZRigBehavior::canAddToChannelAfterMismatch(OZChannelBase*) @0x577270 not yet transcribed");
}
/** __ZN13OZRigBehavior30adjustTo2DChannelsPromotedTo3DEv */
export function OZRigBehavior_adjustTo2DChannelsPromotedTo3D(_self: OZRigBehavior): void {
  throw new Error("OZRigBehavior::adjustTo2DChannelsPromotedTo3D() @0x5761f0 not yet transcribed");
}
/** __ZN13OZRigBehavior30DuplicateAffectingRigBehaviorsEP19OZObjectManipulatorS1_ */
export function OZRigBehavior_DuplicateAffectingRigBehaviors(
  _self: OZRigBehavior, _srcObj: OZObjectManipulatorLike, _dstObj: OZObjectManipulatorLike,
): void {
  throw new Error("OZRigBehavior::DuplicateAffectingRigBehaviors(OZObjectManipulator*, OZObjectManipulator*) @0x577cd0 not yet transcribed");
}
/** __ZN13OZRigBehavior35AddAffectingRigBehaviorsToPasteListEP19OZObjectManipulatorP11OZPasteListb */
export function OZRigBehavior_AddAffectingRigBehaviorsToPasteList(
  _self: OZRigBehavior, _obj: OZObjectManipulatorLike, _list: OZPasteListLike, _flag: boolean,
): void {
  throw new Error("OZRigBehavior::AddAffectingRigBehaviorsToPasteList(OZObjectManipulator*, OZPasteList*, bool) @0x577ae0 not yet transcribed");
}
