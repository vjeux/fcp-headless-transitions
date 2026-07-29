// OZMaterialLayerBase.m0.ts — Ozone.framework, chunk 0 (methods 0..19 of 47).
// Faithful port following raw-port/army/PORTING_SPEC.md — every method cites its @0xADDR;
// externs / deep bodies not decoded in this chunk are throw-stubs citing the address.
//
// Framework: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// (x86_64 slice). Class = OZMaterialLayerBase — the abstract base for all "material layer"
// classes in Ozone (concrete subclasses: OZMaterialFlatLayer, OZMaterialFresnelLayer,
// OZMaterialDistressLayer, OZMaterialFinishLayer, OZMaterialCompoundLayer, etc.).
//
// Scope of this chunk (from `claim.py chunk Ozone OZMaterialLayerBase 0`):
//    0  @0x00000000008e930  OZMaterialLayerBase::getImageAndFillChannelList(list<OZFillSelectionPair>&)
//    1  @0x00000000008e940  OZMaterialLayerBase::isAnySharedTransformEnabled()
//    2  @0x00000000008e950  OZMaterialLayerBase::checkDeprecatedChannels()
//    3  @0x00000000008e960  OZMaterialLayerBase::fixupImageChannelsOffsetChannel(OZLayeredMaterial*)
//    4  @0x00000000008e970  OZMaterialLayerBase::updateLocalTransformVisibility()
//    5  @0x00000000008e980  OZMaterialLayerBase::setTransformValuesAsDefaults()
//    6  @0x00000000008e990  OZMaterialLayerBase::setSubtypeTags()
//    7  @0x00000000008e9a0  OZMaterialLayerBase::getColorChannelForHUD()
//    8  @0x00000000008e9b0  OZMaterialLayerBase::blocksMaterialsBelow()
//    9  @0x00000000008e9c0  OZMaterialLayerBase::copyDeprecatedEnvironmentChannels(OZChannelDouble&)
//   10  @0x00000000008e9d0  OZMaterialLayerBase::getLayerTypes()
//   11  @0x00000000008e9e0  OZMaterialLayerBase::getLayerSubTypes()
//   12  @0x00000000008e9f0  OZMaterialLayerBase::getLayerSubTypeImageNames()
//   13  @0x00000000008ea10  OZMaterialLayerBase::enableDisableEnvironmentDependentChannels(bool)
//   14  @0x00000000019e780  OZMaterialLayerBase::anyGradientChannels()
//   15  @0x00000000019e790  OZMaterialLayerBase::getGradientChannels(vector<OZChannelRef*>&)
//   16  @0x000000000201080  OZMaterialLayerBase::getImageNodeIDs(list<unsigned int>&)
//   17  @0x0000000004ab360  OZMaterialLayerBase::calcTextureScale()                       [FULL PORT]
//   18  @0x0000000004ab3b0  OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*,PCString const&,
//                                                 OZChannelFolder*,unsigned,unsigned) [C2]
//   19  @0x0000000004ab700  OZMaterialLayerBase::initBase()                              [FULL PORT boundary-stub form]
//
// DECODE (raw-port/re/disasm/):
//   OZMaterialLayerBase.<method>.s for each of the 20 addresses above.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the C2 ctor @0x4ab3b0 + initBase @0x4ab700 disasm)
// -----------------------------------------------------------------------------
// OZMaterialLayerBase derives from OZChannelFolder (single primary base). The ctor delegates to
// OZChannelFolder::C2 first, then installs OWN vptrs at +0x00 and +0x10 and initialises embedded
// channel subobjects:
//
//   +0x000  vptr                                — primary vptr (leaq 0x3c30e1(%rip),%rax; movq %rax,(%rbx)
//                                                 @0x4ab3d0). Points into __ZTV19OZMaterialLayerBase.
//   +0x010  vptr                                — secondary vptr (leaq 0x3c3477(%rip),%rax; movq %rax,0x10(%rbx)
//                                                 @0x4ab3da). PCShared_base sub-object slice.
//   +0x080  u8   layerFlag                      — cleared to 0 at ctor entry (movb $0,0x80(%rbx) @0x4ab3e5).
//   +0x088  OZChannelEnum   layerTypeChannel    — ctor @0x4ab44d, subtype-index arg = 1, secondary index = 0xa
//                                                 (see @0x4ab441 movl $0x1,%r8d; @0x4ab447 movl $0xa,%r9d).
//   +0x188  OZChannelEnum   layerSubTypeChannel — ctor @0x4ab4c2, arg = 2, secondary = 0xa.
//   +0x288  OZChannelStringEnum layerSubTypeStringsChannel — ctor @0x4ab531, arg = 3, secondary = 2.
//                                                 (Also referenced by initBase @0x4ab723,
//                                                 clearStrings + setStrings.)
//   +0x3a8  OZChannelEnum   sharedTransformChannel — ctor @0x4ab59f, arg = 4, secondary = 0.
//                                                 (initBase resetFlag/setFlag on 0x400000 at +0x3a8.)
//   +0x4a8  __tree<PCHash128, PCMutexRef>::head — (rbx+0x4a8) stores a self-ptr to (rbx+0x4b0) at
//                                                 @0x4ab5ce ("movq %r12,0x4a8(%rbx)"); +0x4b0/+0x4b8
//                                                 zeroed at @0x4ab5c7.
//   +0x4c0  u32   treeSize                      — zeroed at @0x4ab5dc (movl $0,0x4c0(%rbx)).
//   sizeof >= 0x4c4                             — every explicit init in the ctor references only
//                                                 offsets <= 0x4c0; subclasses (e.g.
//                                                 OZMaterialFresnelLayer) add channels at +0x4d0+.
// -----------------------------------------------------------------------------

import type { OZChannelFolder } from "./OZChannelFolder.js";

// -- Boundary stubs -----------------------------------------------------------
// These are entry points into subsystems not yet ported (OZPreferenceManager, PCInfo, OZChannelEnum,
// OZChannelStringEnum, OZChannelBase, OZChannelFolder ctors/setters, PCString ctor, _theApp).
// Each throws with the @0xADDR of the call-site so `frontier.py` can enumerate them.

/**
 * OZPreferenceManager::Instance() (called from calcTextureScale @0x4ab364).
 * Returns the singleton preference-manager pointer.
 */
function ozPreferenceManagerInstance(): { getTextureResolution(): number } {
  throw new Error(
    "OZPreferenceManager::Instance() @Ozone (called from calcTextureScale @0x4ab364) " +
      "not yet transcribed",
  );
}

/**
 * PCInfo::texturesShouldUseQuarterRes() — Ozone stub @0x6dea4e.
 * Returns bool: when the preference is "auto" (0), decides whether to downshift to 1/4 res.
 */
function pcInfoTexturesShouldUseQuarterRes(): boolean {
  throw new Error(
    "PCInfo::texturesShouldUseQuarterRes() @Ozone stub 0x6dea4e " +
      "(called from calcTextureScale @0x4ab375) not yet transcribed",
  );
}

/**
 * OZMaterialLayerBase::setLayerSubtypeStrings() — called from initBase @0x4ab75d.
 * Not in this chunk; a later-chunk method that sets the string-enum choices for the subtype UI.
 */
function ozMaterialLayerBaseSetLayerSubtypeStrings(_self: OZMaterialLayerBaseState): void {
  throw new Error(
    "OZMaterialLayerBase::setLayerSubtypeStrings() @Ozone " +
      "(called from OZMaterialLayerBase::initBase @0x4ab75d) not yet transcribed",
  );
}

/** OZChannelBase::setFlag(u64 mask, bool) — Ozone stub @0x6dd914. */
function ozChannelBaseSetFlag(_chAddr: OZChannelSubobject, _mask: bigint, _propagate: boolean): void {
  throw new Error(
    "OZChannelBase::setFlag(u64,bool) @Ozone stub 0x6dd914 " +
      "(called from initBase @0x4ab78b / @0x4ab7d8 / @0x4ab7ef / @0x4ab7fc / @0x4ab81a) not yet transcribed",
  );
}

/** OZChannelBase::resetFlag(u64 mask, bool) — Ozone stub @0x6dd92c. */
function ozChannelBaseResetFlag(_chAddr: OZChannelSubobject, _mask: bigint, _propagate: boolean): void {
  throw new Error(
    "OZChannelBase::resetFlag(u64,bool) @Ozone stub 0x6dd92c " +
      "(called from initBase @0x4ab784) not yet transcribed",
  );
}

/** OZChannelBase::setInspectorCtlrClassName(CFStringRef) — Ozone stub @0x6dd8de. */
function ozChannelBaseSetInspectorCtlrClassName(_selfAddr: OZChannelSubobject, _cfStrAddr: number): void {
  throw new Error(
    "OZChannelBase::setInspectorCtlrClassName(CFString*) @Ozone stub 0x6dd8de " +
      "(called from initBase @0x4ab7a6) not yet transcribed",
  );
}
function ozChannelBaseSetLabelCtlrClassName(_selfAddr: OZChannelSubobject, _cfStrAddr: number): void {
  throw new Error(
    "OZChannelBase::setLabelCtlrClassName(CFString*) @Ozone stub 0x6dd8d2 " +
      "(called from initBase @0x4ab7b5) not yet transcribed",
  );
}
function ozChannelBaseSetParameterCtlrClassName(_selfAddr: OZChannelSubobject, _cfStrAddr: number): void {
  throw new Error(
    "OZChannelBase::setParameterCtlrClassName(CFString*) @Ozone stub 0x6dd8e4 " +
      "(called from initBase @0x4ab80b) not yet transcribed",
  );
}

/** OZChannelFolder::setFoldFlag(u32) — Ozone stub @0x6ddf44 (initBase @0x4ab7c2 with 0xa0000). */
function ozChannelFolderSetFoldFlag(_self: OZMaterialLayerBaseState, _flags: number): void {
  throw new Error(
    "OZChannelFolder::setFoldFlag(u32) @Ozone stub 0x6ddf44 " +
      "(called from initBase @0x4ab7c2 with 0xa0000) not yet transcribed",
  );
}

/** OZChannelEnum::clearStrings() — Ozone stub @0x6dd974 (initBase @0x4ab72d). */
function ozChannelEnumClearStrings(_selfAddr: OZChannelSubobject): void {
  throw new Error(
    "OZChannelEnum::clearStrings() @Ozone stub 0x6dd974 " +
      "(called from initBase @0x4ab72d) not yet transcribed",
  );
}

/**
 * OZChannelStringEnum::setStrings(PCString const&, bool) — direct call at @0x4ab74c,
 * symbol __ZN19OZChannelStringEnum10setStringsERK8PCStringb.
 */
function ozChannelStringEnumSetStrings(
  _selfAddr: OZChannelSubobject,
  _s: PCStringRef,
  _flag: boolean,
): void {
  throw new Error(
    "OZChannelStringEnum::setStrings(PCString const&, bool) @Ozone " +
      "(direct call from initBase @0x4ab74c) not yet transcribed",
  );
}

/** PCString::PCString(CFStringRef) — Ozone stub @0x6df084 (initBase @0x4ab73c). */
function pcStringC1_CFString(_dst: PCStringRef, _cfStr: number): void {
  throw new Error(
    "PCString::PCString(CFString*) @Ozone stub 0x6df084 " +
      "(called from initBase @0x4ab73c) not yet transcribed",
  );
}

/** PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef) — Ozone stub @0x6df08a. */
function pcStringC1_CFStringBundle(_dst: PCStringRef, _cfStr: number, _bundleA: number, _bundleB: number): void {
  throw new Error(
    "PCString::PCString(CFString*, CFBundle*, CFBundle*) @Ozone stub 0x6df08a " +
      "(called from ctor @0x4ab407 / @0x4ab420 / @0x4ab47c / @0x4ab495 / @0x4ab4f1) not yet transcribed",
  );
}
function pcStringD1(_dst: PCStringRef): void {
  throw new Error(
    "PCString::~PCString() @Ozone stub 0x6df0c6 (multiple ctor call-sites) not yet transcribed",
  );
}
function pcStringC1_empty(_dst: PCStringRef): void {
  throw new Error(
    "PCString::PCString() @Ozone stub 0x6df0c0 " +
      "(called from getLayerSubTypeImageNames @0x8e9f9) not yet transcribed",
  );
}

/** OZChannelFolder::OZChannelFolder(OZFactory*, PCString&, OZChannelFolder*, u32, u32, u32) — Ozone stub @0x6de00a. */
function ozChannelFolderC2(
  _self: OZMaterialLayerBaseState,
  _factory: OZFactoryPtr,
  _name: PCStringRef,
  _parent: OZChannelFolder | null,
  _u1: number,
  _u2: number,
  _u3: number,
): void {
  throw new Error(
    "OZChannelFolder::OZChannelFolder(OZFactory*, PCString const&, OZChannelFolder*, u32, u32, u32) " +
      "@Ozone stub 0x6de00a (called from OZMaterialLayerBase C2 @0x4ab3cb) not yet transcribed",
  );
}

/**
 * OZChannelEnum::OZChannelEnum(PCString&, PCString&, OZChannelFolder*, u32, u32,
 *   OZChannelImpl*, OZChannelInfo*) — Ozone stub @0x6dd9a4. Used at three sites.
 */
function ozChannelEnumC1(
  _sub: OZChannelSubobject,
  _a: PCStringRef,
  _b: PCStringRef,
  _parent: OZChannelFolder,
  _idx: number,
  _sec: number,
  _implOrZero: number,
  _infoOrZero: number,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(PCString&, PCString&, OZChannelFolder*, u32, u32, " +
      "OZChannelImpl*, OZChannelInfo*) @Ozone stub 0x6dd9a4 " +
      "(called from ctor @0x4ab44d / @0x4ab4c2 / @0x4ab59f) not yet transcribed",
  );
}

/**
 * OZChannelStringEnum::OZChannelStringEnum(PCString&, PCString&, OZChannelFolder*, u32, u32)
 * — direct symbol call @0x4ab531.
 */
function ozChannelStringEnumC1(
  _sub: OZChannelSubobject,
  _a: PCStringRef,
  _b: PCStringRef,
  _parent: OZChannelFolder,
  _idx: number,
  _sec: number,
): void {
  throw new Error(
    "OZChannelStringEnum::OZChannelStringEnum(PCString&, PCString&, OZChannelFolder*, u32, u32) " +
      "@Ozone (called from ctor @0x4ab531) not yet transcribed",
  );
}

/**
 * _theApp — Ozone-internal global pointer to the OZApplication singleton (dyld GOT reference).
 * ctor @0x4ab3ec reads theApp->field_0x48 — the CFBundleRef used for localised string lookups.
 */
function readTheAppBundleAt0x48(): number {
  throw new Error(
    "_theApp @Ozone (global) + theApp->field_0x48 read " +
      "(referenced from OZMaterialLayerBase C2 @0x4ab3ec) not yet transcribed",
  );
}

/**
 * The two vtable installations at ctor @0x4ab3d0 and @0x4ab3da are RIP-relative loads of the
 * __ZTV19OZMaterialLayerBase symbol.
 */
function installVptrPrimary(_self: OZMaterialLayerBaseState): void {
  throw new Error(
    "install __ZTV19OZMaterialLayerBase primary vptr (leaq 0x3c30e1(%rip) @0x4ab3d0) " +
      "not yet transcribed",
  );
}
function installVptrSecondary(_self: OZMaterialLayerBaseState): void {
  throw new Error(
    "install __ZTV19OZMaterialLayerBase secondary vptr (leaq 0x3c3477(%rip) @0x4ab3da) " +
      "not yet transcribed",
  );
}

// -- Types shared inside this chunk ------------------------------------------
type PCStringRef = { __brand: "PCString" };
type OZFactoryPtr = { __brand: "OZFactory" };
type OZChannelSubobject = { __brand: "OZChannelSubobject" };

/**
 * Opaque state placeholder for the OZMaterialLayerBase instance layout described above.
 * Subclasses extend this; other chunks fill in the remaining methods.
 */
export interface OZMaterialLayerBaseState extends OZChannelFolder {
  layerFlag: number;   // +0x080 — cleared to 0 in the ctor.
}

// ============================================================================
// FULL PORT: calcTextureScale — @0x4ab360
// ============================================================================
// disasm/OZMaterialLayerBase.calcTextureScale.s (25 lines):
//   res = OZPreferenceManager::Instance()->getTextureResolution();
//   if (res == 0)                              // "auto"
//       res = PCInfo::texturesShouldUseQuarterRes() ? 3 : 1;
//       (`res = 1 + 2*bool` — from `leal 0x1(,%rax,2),%eax`)
//   // Now res in {1, 2, 3}.  1 = full, 2 = half, 3 = quarter.
//   scaleTable = [1.0f, 0.5f]                  // @0x70bc80 (u32 0x3f800000), 0x70bc84 (0x3f000000)
//   quarterVal = 0.25f                         // @0x70bc88 (u32 0x3e800000)
//   if (res == 3)   return quarterVal;         // 0.25 branch @0x4ab3a1
//   else            return scaleTable[(res == 2) ? 1 : 0];
// Return type is f32 (movss / xmm0) — wrap in Math.fround.
//
// Constants (via resolve.py Ozone const):
//   0x70bc80 -> u32 0x3f800000 = 1.0f  (SCALE_FULL)
//   0x70bc84 -> u32 0x3f000000 = 0.5f  (SCALE_HALF)
//   0x70bc88 -> u32 0x3e800000 = 0.25f (SCALE_QUARTER)
// (RIP addresses: 0x4ab39a + 0x2608e6 = 0x70bc80; 0x4ab3a9 + 0x2608df = 0x70bc88.)
const SCALE_TABLE = [Math.fround(1.0), Math.fround(0.5)] as const;  // @0x70bc80 / @0x70bc84
const SCALE_QUARTER = Math.fround(0.25);                            // @0x70bc88

/**
 * OZMaterialLayerBase::calcTextureScale() — @0x4ab360.
 * Returns 1.0 / 0.5 / 0.25 (single-precision float) per the user preference.
 */
export function OZMaterialLayerBase_calcTextureScale(): number {
  // rax = OZPreferenceManager::Instance()->getTextureResolution()
  let res = ozPreferenceManagerInstance().getTextureResolution() | 0;   // testl %eax, %eax
  if (res === 0) {                                                       // je 0x4ab384
    // res = 1 + 2*bool(PCInfo::texturesShouldUseQuarterRes())
    res = 1 + 2 * (pcInfoTexturesShouldUseQuarterRes() ? 1 : 0);
  }
  // xorl %ecx,%ecx; cmpl 0x2,%eax; sete %dl; cmpl 0x3,%eax; je 0x4ab3a1
  if (res === 3) {
    return SCALE_QUARTER;                                                // movss 0x2608df(%rip)
  }
  // movb %dl,%cl  (cl := (res == 2) ? 1 : 0)
  const cl = (res === 2) ? 1 : 0;
  // movss (%rax,%rcx,4), %xmm0 -> SCALE_TABLE[cl]
  return SCALE_TABLE[cl];
}

// ============================================================================
// FULL PORT: initBase — @0x4ab700   (boundary-stub form — all extern calls throw)
// ============================================================================
// Line-for-line port of raw-port/re/disasm/OZMaterialLayerBase.initBase.s (86 lines).
//
// Control flow:
//   1. layerFactory = self->vtable[0x360/8]();                (callq *0x360(%rax))
//   2. if (layerFactory != 0) {
//        subtypeStringsCh = self + 0x288;
//        OZChannelEnum::clearStrings(subtypeStringsCh);
//        PCString tmp; PCString::PCString(&tmp, layerFactory as CFString);
//        OZChannelStringEnum::setStrings(subtypeStringsCh, tmp, /*replace=*/true);   // arg = 1
//        tmp.~PCString();
//      }
//   3. self->setLayerSubtypeStrings();                        (direct call)
//   4. envDepBool = self->vtable[0x368/8]();                  (callq *0x368(%rax))
//      envDepChBase = self + 0x3a8;
//      if (envDepBool) OZChannelBase::resetFlag(envDepChBase, 0x400000, false);
//      else            OZChannelBase::setFlag  (envDepChBase, 0x400000, false);
//   5. self->vtable[0x080/8]();                               (callq *0x80(%rax), return ignored)
//      OZChannelBase::setInspectorCtlrClassName(self, cfstring@RIP+0x3fa8ad);
//      OZChannelBase::setLabelCtlrClassName    (self, cfstring@RIP+0x3fa8be);
//   6. OZChannelFolder::setFoldFlag(self, 0xa0000);
//   7. OZChannelBase::setFlag(subtypeStringsCh, /*mask=*/2, false);
//      OZChannelBase::setFlag(subtypeStringsCh, /*mask=*/0x100000000, false);
//      OZChannelBase::setFlag(envDepChBase,    /*mask=*/0x100000000, false);
//      OZChannelBase::setParameterCtlrClassName(envDepChBase, cfstring@RIP+0x3fa888);
//      OZChannelBase::setFlag(self, /*mask=*/0x80, false);
//
// vtable slots (*+0x80, *+0x360, *+0x368) are virtual methods declared on OZMaterialLayerBase;
// their concrete impls come from subclasses. Modelled as `callVtable` throw-stubs.

function callVtable(_self: OZMaterialLayerBaseState, slotByteOffset: number, calledFrom: string): number {
  throw new Error(
    "OZMaterialLayerBase vtable slot @+0x" + slotByteOffset.toString(16) +
      " (from initBase " + calledFrom + ") not yet transcribed",
  );
}

/**
 * OZMaterialLayerBase::initBase() — @0x4ab700.
 * Configures the newly-constructed layer's channel folders, string-enum choices, and inspector
 * class names. Every cross-boundary call is a documented stub above.
 */
export function OZMaterialLayerBase_initBase(self: OZMaterialLayerBaseState): void {
  const subtypeStringsCh = { __brand: "OZChannelSubobject" as const };    // self + 0x288
  const envDepChBase     = { __brand: "OZChannelSubobject" as const };    // self + 0x3a8

  const layerFactory = callVtable(self, 0x360, "@0x4ab715");
  if (layerFactory !== 0) {
    ozChannelEnumClearStrings(subtypeStringsCh);                          // 0x4ab72d
    const tmp = {} as unknown as PCStringRef;
    pcStringC1_CFString(tmp, layerFactory);                               // 0x4ab73c
    ozChannelStringEnumSetStrings(subtypeStringsCh, tmp, true);           // 0x4ab74c, arg=1
    pcStringD1(tmp);                                                      // 0x4ab755
  }
  ozMaterialLayerBaseSetLayerSubtypeStrings(self);                        // 0x4ab75d
  const envDepBool = callVtable(self, 0x368, "@0x4ab768");
  if (envDepBool !== 0) {
    ozChannelBaseResetFlag(envDepChBase, 0x400000n, false);               // 0x4ab784
  } else {
    ozChannelBaseSetFlag(envDepChBase, 0x400000n, false);                 // 0x4ab78b
  }
  callVtable(self, 0x080, "@0x4ab796");                                   // return ignored per disasm
  ozChannelBaseSetInspectorCtlrClassName(self as unknown as OZChannelSubobject, 0x3fa8ad); // 0x4ab7a6
  ozChannelBaseSetLabelCtlrClassName    (self as unknown as OZChannelSubobject, 0x3fa8be); // 0x4ab7b5
  ozChannelFolderSetFoldFlag(self, 0xa0000);                              // 0x4ab7c2
  ozChannelBaseSetFlag(subtypeStringsCh, 0x2n, false);                    // 0x4ab7d8
  ozChannelBaseSetFlag(subtypeStringsCh, 0x100000000n, false);            // 0x4ab7ef
  ozChannelBaseSetFlag(envDepChBase,     0x100000000n, false);            // 0x4ab7fc
  ozChannelBaseSetParameterCtlrClassName(envDepChBase, 0x3fa888);         // 0x4ab80b
  ozChannelBaseSetFlag(self as unknown as OZChannelSubobject, 0x80n, false); // 0x4ab81a
}

// ============================================================================
// C2 ctor — @0x4ab3b0 — skeleton (real field layout + delegation, deep body deferred)
// ============================================================================
// Full ctor is 204 disasm lines; the STRUCT LAYOUT block above documents each subobject offset.
// We install the vptrs and clear the byte-flag exactly as the disasm does, then throw on the
// first embedded-subobject ctor to make the boundary loud (each PCString(CFString*,CFBundle*,
// CFBundle*) + OZChannelEnum::C1 is an unresolved extern).

/**
 * OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString const&, OZChannelFolder*,
 *   unsigned int, unsigned int) — @0x4ab3b0 [C2].
 */
export function OZMaterialLayerBase_C2(
  self: OZMaterialLayerBaseState,
  factory: OZFactoryPtr,
  name: PCStringRef,
  parent: OZChannelFolder | null,
  flags1: number,
  flags2: number,
): void {
  // 0x4ab3cb — delegate to OZChannelFolder base ctor with extra 0 for the trailing u32.
  ozChannelFolderC2(self, factory, name, parent, flags1, flags2, 0);
  // 0x4ab3d0 / 0x4ab3da — install our two vptrs.
  installVptrPrimary(self);
  installVptrSecondary(self);
  // 0x4ab3e5 — clear +0x80 (the layerFlag byte).
  self.layerFlag = 0;
  // 0x4ab3ec .. 0x4ab5e9 — five embedded-subobject ctors + tail-call OZMaterialLayerBase::initBase.
  //   * @+0x088  OZChannelEnum        (arg 1, 0xa)   [0x4ab44d]
  //   * @+0x188  OZChannelEnum        (arg 2, 0xa)   [0x4ab4c2]
  //   * @+0x288  OZChannelStringEnum  (arg 3, 0x2)   [0x4ab531]
  //   * @+0x3a8  OZChannelEnum        (arg 4, 0)     [0x4ab59f]
  //   * @+0x4a8..+0x4c0  __tree<PCHash128,PCMutexRef> head_node / size init  [0x4ab5c7 .. 0x4ab5dc]
  //   * OZMaterialLayerBase::initBase()                                       [0x4ab5e9]
  throw new Error(
    "OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString const&, OZChannelFolder*, u32, u32) " +
      "@Ozone 0x4ab3b0 embedded-subobject-ctor chain (PCString(CFString*,CFBundle*,CFBundle*) @0x6df08a " +
      "+ OZChannelEnum::C1 @0x6dd9a4 + OZChannelStringEnum::C1 @0x4ab531 + __tree head) " +
      "not yet transcribed",
  );
}

// ============================================================================
// Virtual "hook" methods — the 15 base default impls (indices 0..16 except 17/18/19).
// ============================================================================
// Each is a virtual method whose base default is "empty" or "return 0/nullptr/false" so concrete
// subclasses can override selectively. Every disasm below is literally 4-5 insns.

/**
 * OZMaterialLayerBase::getImageAndFillChannelList(std::list<OZFillSelectionPair>&) — @0x8e930.
 * Disasm (6 lines): `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq` — empty base default.
 */
export function OZMaterialLayerBase_getImageAndFillChannelList(
  _self: OZMaterialLayerBaseState,
  _out: unknown,
): void {
  /* empty per disasm */
}

/**
 * OZMaterialLayerBase::isAnySharedTransformEnabled() — @0x8e940.
 * Disasm: `xorl %eax,%eax; retq` -> false.
 */
export function OZMaterialLayerBase_isAnySharedTransformEnabled(_self: OZMaterialLayerBaseState): boolean {
  return false;
}

/** OZMaterialLayerBase::checkDeprecatedChannels() — @0x8e950. Empty per disasm. */
export function OZMaterialLayerBase_checkDeprecatedChannels(_self: OZMaterialLayerBaseState): void {
  /* empty per disasm */
}

/** OZMaterialLayerBase::fixupImageChannelsOffsetChannel(OZLayeredMaterial*) — @0x8e960. Empty. */
export function OZMaterialLayerBase_fixupImageChannelsOffsetChannel(
  _self: OZMaterialLayerBaseState,
  _layered: unknown,
): void {
  /* empty per disasm */
}

/** OZMaterialLayerBase::updateLocalTransformVisibility() — @0x8e970. Empty. */
export function OZMaterialLayerBase_updateLocalTransformVisibility(_self: OZMaterialLayerBaseState): void {
  /* empty per disasm */
}

/** OZMaterialLayerBase::setTransformValuesAsDefaults() — @0x8e980. Empty. */
export function OZMaterialLayerBase_setTransformValuesAsDefaults(_self: OZMaterialLayerBaseState): void {
  /* empty per disasm */
}

/** OZMaterialLayerBase::setSubtypeTags() — @0x8e990. Empty. */
export function OZMaterialLayerBase_setSubtypeTags(_self: OZMaterialLayerBaseState): void {
  /* empty per disasm */
}

/**
 * OZMaterialLayerBase::getColorChannelForHUD() — @0x8e9a0. Disasm: `xorl %eax,%eax; retq` -> null.
 * Return type is OZChannelColorNoAlpha* (base default: nullptr).
 */
export function OZMaterialLayerBase_getColorChannelForHUD(_self: OZMaterialLayerBaseState): unknown | null {
  return null;
}

/**
 * OZMaterialLayerBase::blocksMaterialsBelow() — @0x8e9b0. Disasm: `xorl %eax,%eax; retq` -> false.
 */
export function OZMaterialLayerBase_blocksMaterialsBelow(_self: OZMaterialLayerBaseState): boolean {
  return false;
}

/** OZMaterialLayerBase::copyDeprecatedEnvironmentChannels(OZChannelDouble&) — @0x8e9c0. Empty. */
export function OZMaterialLayerBase_copyDeprecatedEnvironmentChannels(
  _self: OZMaterialLayerBaseState,
  _target: unknown,
): void {
  /* empty per disasm */
}

/** OZMaterialLayerBase::getLayerTypes() — @0x8e9d0. Disasm: `xorl %eax,%eax; retq` -> null. */
export function OZMaterialLayerBase_getLayerTypes(_self: OZMaterialLayerBaseState): unknown | null {
  return null;
}

/** OZMaterialLayerBase::getLayerSubTypes() — @0x8e9e0. Disasm: `xorl %eax,%eax; retq` -> null. */
export function OZMaterialLayerBase_getLayerSubTypes(_self: OZMaterialLayerBaseState): unknown | null {
  return null;
}

/**
 * OZMaterialLayerBase::getLayerSubTypeImageNames() — @0x8e9f0.
 * Disasm (13 lines): default-constructs a PCString into the caller-supplied return slot
 * (`callq __ZN8PCStringC1Ev`) and returns it. PCString::PCString() is a boundary stub, so a
 * real invocation throws there — no silent default.
 */
export function OZMaterialLayerBase_getLayerSubTypeImageNames(_self: OZMaterialLayerBaseState): PCStringRef {
  const out = {} as unknown as PCStringRef;
  pcStringC1_empty(out);   // @0x8e9f9 -> __ZN8PCStringC1Ev
  return out;
}

/** OZMaterialLayerBase::enableDisableEnvironmentDependentChannels(bool) — @0x8ea10. Empty. */
export function OZMaterialLayerBase_enableDisableEnvironmentDependentChannels(
  _self: OZMaterialLayerBaseState,
  _enable: boolean,
): void {
  /* empty per disasm */
}

/**
 * OZMaterialLayerBase::anyGradientChannels() — @0x19e780. Disasm: `xorl %eax,%eax; retq` -> false.
 */
export function OZMaterialLayerBase_anyGradientChannels(_self: OZMaterialLayerBaseState): boolean {
  return false;
}

/** OZMaterialLayerBase::getGradientChannels(std::vector<OZChannelRef*>&) — @0x19e790. Empty. */
export function OZMaterialLayerBase_getGradientChannels(
  _self: OZMaterialLayerBaseState,
  _out: unknown,
): void {
  /* empty per disasm */
}

/** OZMaterialLayerBase::getImageNodeIDs(std::list<unsigned int>&) — @0x201080. Empty. */
export function OZMaterialLayerBase_getImageNodeIDs(
  _self: OZMaterialLayerBaseState,
  _out: unknown,
): void {
  /* empty per disasm */
}
