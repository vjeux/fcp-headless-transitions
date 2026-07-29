// OZMaterialBumpMapLayer.ts — raw transcription of Ozone `OZMaterialBumpMapLayer`.
//
// A concrete OZMaterialLayerBase-derived material-layer that owns four channels
// (DiffuseGain-percent, BumpMap-image-with-transform, MaterialLayerMap, and
// bumpMap-type enum) and forwards its "append into layered material" hook to
// the free function `AppendBumpMapLayerToLayeredMaterial`.
//
// Provenance (Ozone framework, x86_64 slice; FAT offset 0x4000 == VA parity):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//   `nm -arch x86_64 | c++filt | grep OZMaterialBumpMapLayer`
//
// Symbols ported here (C1/C2 & D0/D1/D2 share bodies where noted — Itanium ABI):
//   @0x43fe40  OZMaterialBumpMapLayer(OZFactory*, PCString const&, OZChannelFolder*, uint, uint) [C2]
//                __ZN22OZMaterialBumpMapLayerC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj
//   @0x4401c0  OZMaterialBumpMapLayer(OZFactory*, PCString const&, OZChannelFolder*, uint, uint) [C1]
//                __ZN22OZMaterialBumpMapLayerC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj (== C2 body)
//   @0x4401d0  OZMaterialBumpMapLayer(PCString const&, OZChannelFolder*, uint, uint)           [C2]
//                __ZN22OZMaterialBumpMapLayerC2ERK8PCStringP15OZChannelFolderjj
//   @0x440500  OZMaterialBumpMapLayer(PCString const&, OZChannelFolder*, uint, uint)           [C1]
//                __ZN22OZMaterialBumpMapLayerC1ERK8PCStringP15OZChannelFolderjj (== C2 body)
//   @0x440510  OZMaterialBumpMapLayer(OZFactory*, PCString const&, uint)                       [C2]
//                __ZN22OZMaterialBumpMapLayerC2EP9OZFactoryRK8PCStringj
//   @0x4407e0  OZMaterialBumpMapLayer(OZFactory*, PCString const&, uint)                       [C1]
//                __ZN22OZMaterialBumpMapLayerC1EP9OZFactoryRK8PCStringj (== C2 body)
//   @0x4407f0  OZMaterialBumpMapLayer(OZMaterialBumpMapLayer const&, OZChannelFolder*)         [C2 copy]
//                __ZN22OZMaterialBumpMapLayerC2ERKS_P15OZChannelFolder
//   @0x4408f0  OZMaterialBumpMapLayer(OZMaterialBumpMapLayer const&, OZChannelFolder*)         [C1 copy]
//                __ZN22OZMaterialBumpMapLayerC1ERKS_P15OZChannelFolder (== C2 copy body)
//   @0x440900  ~OZMaterialBumpMapLayer()                                                       [D2]
//                __ZN22OZMaterialBumpMapLayerD2Ev
//   @0x440970  ~OZMaterialBumpMapLayer()                                                       [D1]
//                __ZN22OZMaterialBumpMapLayerD1Ev (== D2 body)
//   @0x440a50  ~OZMaterialBumpMapLayer()                                                       [D0 deleting]
//                __ZN22OZMaterialBumpMapLayerD0Ev
//   @0x440110  initBump()                                                                       __ZN22OZMaterialBumpMapLayer8initBumpEv
//   @0x440b50  clone() const                                                                    __ZNK22OZMaterialBumpMapLayer5cloneEv
//   @0x440b90  fixupImageChannelsOffsetChannel(OZLayeredMaterial*)                              __ZN22OZMaterialBumpMapLayer31fixupImageChannelsOffsetChannelEP17OZLayeredMaterial
//   @0x440bb0  makeMaterialLayerSequenceChannelFolder()                                         __ZN22OZMaterialBumpMapLayer38makeMaterialLayerSequenceChannelFolderEv
//   @0x440c00  appendLayersToLayeredMaterial(LayeredMaterialInfo&)                              __ZN22OZMaterialBumpMapLayer29appendLayersToLayeredMaterialERN19OZMaterialLayerBase19LayeredMaterialInfoE
//   @0x440c20  getImageNodeIDs(std::list<uint>&)                                                __ZN22OZMaterialBumpMapLayer15getImageNodeIDsERNSt3__14listIjNS0_9allocatorIjEEEE
//   @0x440cc0  bumpMapImageChannel()                                                            __ZN22OZMaterialBumpMapLayer19bumpMapImageChannelEv
//   @0x440cd0  bumpMapDiffuseGainChannel()                                                      __ZN22OZMaterialBumpMapLayer25bumpMapDiffuseGainChannelEv
//   @0x440ce0  bumpMapOperatorChannel()                                                         __ZN22OZMaterialBumpMapLayer22bumpMapOperatorChannelEv
//   @0x440cf0  bumpMapTypePopupChannel()                                                        __ZN22OZMaterialBumpMapLayer23bumpMapTypePopupChannelEv
//   @0x440d00  sequenceChannels()                                                               __ZN22OZMaterialBumpMapLayer16sequenceChannelsEv
//   @0x440d10  objectManipulator()                                                              __ZN22OZMaterialBumpMapLayer17objectManipulatorEv
//   @0x440d20  sharedTransformChannel()                                                         __ZN22OZMaterialBumpMapLayer22sharedTransformChannelEv
//
// Source disassembly:
//   raw-port/re/disasm/OZMaterialBumpMapLayer.*.s
//
// VTABLE (`resolve.py Ozone vtable OZMaterialBumpMapLayer`):
//   __ZTV22OZMaterialBumpMapLayer @0x864418; installed ptr = table+0x10 = 0x864428
//   Selected slots directly relevant here:
//     *0x00 -> 0x440970  ~OZMaterialBumpMapLayer() [D1]
//     *0x08 -> 0x440a50  ~OZMaterialBumpMapLayer() [D0 deleting]
//     *0xe8 -> 0x4ac2c0  OZMaterialLayerBase::copy(OZChannelBase const*, bool)  (inherited)
//     *0xf8 -> 0x440b50  OZMaterialBumpMapLayer::clone() const
//
// STRUCT LAYOUT (recovered from every ctor + method decode):
//   +0x000  vptr                                — primary   OZMaterialBumpMapLayer vptr
//                                                 (installed = 0x864428, i.e. table+0x10)
//                                                 ctor @0x43fe59..@0x43fe60:
//                                                   leaq 0x4245c8(%rip),%rax
//                                                   movq %rax,(%rbx)
//                                                 0x43fe60 + 0x4245c8 = 0x864428.
//   +0x010  vptr                                — secondary vptr (multi-inheritance sub-object slice)
//                                                 (installed = 0x864428+n₁ from table @0x864418)
//                                                 ctor @0x43fe63..@0x43fe6a:
//                                                   leaq 0x424996(%rip),%rax
//                                                   movq %rax,0x10(%rbx)
//                                                 0x43fe6a + 0x424996 = 0x864800  (thunk-vtable slice).
//   +0x4c8  vptr                                — tertiary  vptr (third sub-object slice)
//                                                 ctor @0x43fe6e..@0x43fe75:
//                                                   leaq 0x4249e3(%rip),%rax
//                                                   movq %rax,0x4c8(%rbx)
//                                                 0x43fe75 + 0x4249e3 = 0x864858  (thunk-vtable slice).
//   +0x4d0  OZChannelPercent                     "bump map diffuse gain" channel.
//                                                 ctor @0x43fec8: OZChannelPercent::OZChannelPercent(
//                                                   d=1.0, PCString&, OZChannelFolder*=this,
//                                                   uu1=0x65, impl=null, info=null)
//                                                 exposed by bumpMapDiffuseGainChannel() @0x440cd0.
//   +0x568  OZChannelImageWithTransform          "bump map image" channel (with transform).
//                                                 ctor @0x43ff0c: OZChannelImageWithTransform(
//                                                   PCString&, OZChannelFolder*=this, uu1=0x64, uu2=0x2)
//                                                 (NB: bumpMapImageChannel() @0x440cc0 returns
//                                                  this+0x1570, i.e. the MaterialLayerMap slot —
//                                                  NOT this slot. This subobject is the private
//                                                  image-with-transform channel; the "public"
//                                                  bump map image channel is the map at +0x1570.)
//   +0x1570 OZChannelMaterialLayerMap            "bump map material layer map" channel.
//                                                 ctor @0x43ff4c: OZChannelMaterialLayerMap(
//                                                   PCString&, OZChannelFolder*=this,
//                                                   uu1=0x67, uu2=0)
//                                                 exposed by bumpMapImageChannel() @0x440cc0.
//                                                 initBump @0x440160 calls resetFoldFlag(0xf) and
//                                                 saveStateAsDefault() on it, and initBump end
//                                                 @0x44019d..@0x4401b9 tail-calls setEnableBumpType(1).
//   +0x1aa0 OZChannel                            unnamed diffuse-gain sub-channel (initBump only).
//                                                 initBump @0x440153..@0x440158:
//                                                   setValue(kCMTimeZero, 1.0, false)  on this+0x1aa0
//                                                 initBump @0x440184..@0x44018c:
//                                                   setDefaultValue(1.0)              on this+0x1aa0
//                                                 No ctor site allocates it as its own subobject;
//                                                 it lives inside the +0x1570 MaterialLayerMap
//                                                 as a sub-slot (0x1aa0 - 0x1570 = 0x530). We
//                                                 model it purely by offset access.
//   +0x1ba0 OZChannel                            "bump map type popup" (enum) — exposed by
//                                                 bumpMapTypePopupChannel() @0x440cf0. Lives inside
//                                                 the +0x1570 MaterialLayerMap sub-object
//                                                 (0x1ba0 - 0x1570 = 0x630).
//   +0x2be0 OZChannelBase                        internal channel-base slot addressed by initBump
//                                                 @0x440191..@0x4401a2: `resetFlag(2, false)`.
//                                                 Byte-offset only; opaque body.
//   +0x2ea8 OZChannelEnum                        "bump map operator" (enum) channel.
//                                                 ctor @0x43ffb1: OZChannelEnum(PCString&, PCString&,
//                                                   OZChannelFolder*=this, uu1=0x66, uu2=0, impl=null,
//                                                   info=null)
//                                                 exposed by bumpMapOperatorChannel() @0x440ce0.
//   +0x2fa8 END-OF-OBJECT.                       clone() @0x440b5a: `movl $0x2fa8,%edi ; call operator new`.
//                                                 The heap slab size is exactly 0x2fa8 bytes.
//   +0x15f8 OZChannel                            a second image-node-id channel walked in
//                                                 getImageNodeIDs @0x440c70..@0x440c80 alongside
//                                                 the primary at +0x5f0. Both are called via
//                                                 OZChannel::getValueAsUint(kCMTimeZero, 0.0).
//   +0x5f0  OZChannel                            first image-node-id channel walked by
//                                                 getImageNodeIDs @0x440c31..@0x440c45 via
//                                                 OZChannel::getValueAsUint(kCMTimeZero, 0.0).
//
// CONSTANTS (via `resolve.py Ozone const <VA>`):
//   RIP data @0x707a60 :  double 1000000.0        (setMax(1e6) — diffuse-gain channel upper bound)
//   RIP data @0x7053e0 :  double 1.0              (setValue(1.0), setDefaultValue(1.0),
//                                                  OZChannelPercent ctor initial-value 1.0)
//
// FRONTIER (undecoded — every stub throws citing its addr):
//   OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString&, OZChannelFolder*, uint, uint)
//                                                     [C2]  @Ozone 0x4a?/direct-call
//   OZMaterialLayerBase::OZMaterialLayerBase(OZFactory*, PCString&, uint)                  [C2]
//                                                     @Ozone direct-call
//   OZMaterialLayerBase::OZMaterialLayerBase(OZMaterialLayerBase const&, OZChannelFolder*) [C2 copy]
//                                                     @Ozone direct-call
//   OZMaterialLayerBase::initBase()                    @Ozone direct-call
//   OZMaterialLayerBase::getSequenceChannels()         @Ozone direct-call (tail-jmp in sequenceChannels)
//   OZMaterialLayerBase::~OZMaterialLayerBase()        [D2] @Ozone direct-call (tail-jmp in dtor)
//   OZChannelPercent(d, PCString&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*)
//                                                      @Ozone 0x6de184 stub
//   OZChannelPercent(OZChannelPercent const&, OZChannelFolder*) @Ozone 0x6de17e stub
//   OZChannelPercent::~OZChannelPercent()              @Ozone 0x6de18a stub
//   OZChannelImageWithTransform(PCString&, OZChannelFolder*, uint, uint)               @Ozone direct-call
//   OZChannelImageWithTransform(OZChannelImageWithTransform const&, OZChannelFolder*)  @Ozone direct-call
//   OZChannelImageWithTransform::~OZChannelImageWithTransform()                        @Ozone direct-call
//   OZChannelMaterialLayerMap(PCString&, OZChannelFolder*, uint, uint)                 @Ozone direct-call
//   OZChannelMaterialLayerMap(OZChannelMaterialLayerMap const&, OZChannelFolder*)      @Ozone direct-call
//   OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap()                            @Ozone direct-call
//   OZChannelMaterialLayerMap::setImageChannelOffsetChannel(OZLayeredMaterial*)        @Ozone direct-call
//   OZChannelMaterialLayerMap::setEnableBumpType(bool)                                 @Ozone direct-call
//   OZChannelEnum(PCString&, PCString&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*)
//                                                                                     @Ozone 0x6dd9a4 stub
//   OZChannelEnum(OZChannelEnum const&, OZChannelFolder*)                             @Ozone 0x6dd9aa stub
//   OZChannelEnum::~OZChannelEnum()                                                   @Ozone 0x6dd9d4 stub
//   OZChannel::setMax(double)                                                         @Ozone 0x6df432 stub
//   OZChannel::setValue(CMTime const&, double, bool)                                  @Ozone 0x6df456 stub
//   OZChannel::setDefaultValue(double)                                                @Ozone 0x6df306 stub
//   OZChannel::getValueAsUint(CMTime const&, double) const                            @Ozone 0x6dfa8c stub
//   OZChannelBase::setInspectorCtlrClassName(CFStringRef)                             @Ozone 0x6dd8de stub
//   OZChannelBase::resetFlag(uint64, bool)                                            @Ozone 0x6dd92c stub
//   OZChannelBase::getObjectManipulator() const                                       @Ozone 0x6df55e stub
//   OZChannelFolder::resetFoldFlag(uint)                                              @Ozone 0x6ddf68 stub
//   OZChannelFolder::saveStateAsDefault()                                             @Ozone 0x6ddf92 stub
//   OZMaterialBumpMapLayerSequenceFolder(PCString&, OZChannelFolder*, uint, uint, uint)
//                                                                                     @Ozone direct-call
//   AppendBumpMapLayerToLayeredMaterial(OZMaterialBumpIF*, LayeredMaterialInfo&, bool) @Ozone direct-call
//   PCString(CFStringRef, CFBundleRef, CFBundleRef)                                   @Ozone 0x6df08a stub
//   PCString::~PCString()                                                             @Ozone 0x6df0c6 stub
//   OZMaterialBumpMapLayer_Factory::getInstance()  (call_once)                        @Ozone direct-call
//   operator new(size_t)                                                              @Ozone 0x6dfca2 stub
//   operator delete(void*)                                                            @Ozone 0x6dfc36 stub
//   __Unwind_Resume                                                                   @Ozone 0x6dd07a stub
//   kCMTimeZero  (literal-pool symbol pointer)                                        @Ozone 0x3e43c5+RIP
//
// -----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */

// ── Frontier types (opaque, structural). The actual class ports are separate
// files under raw-port/src/channels/OZChannel*.ts / OZMaterialLayerBase.ts and
// will replace these `interface … {}` shapes when their C2 bodies are ported.

/** OZFactory* — opaque frontier. Only appears as an arg passed through to the
 *  OZMaterialLayerBase base ctor. */
export interface OZFactoryLike {
  readonly __OZFactory_opaque: unique symbol;
}

/** PCString — opaque frontier (raw-port/src/infra/PCString.ts is the eventual
 *  landing site). Modeled here only as a reference-holder shape. */
export interface PCStringLike {
  readonly __PCString_opaque: unique symbol;
}

/** OZChannelFolder* — opaque frontier. */
export interface OZChannelFolderLike {
  readonly __OZChannelFolder_opaque: unique symbol;
}

/** OZChannelImpl* — opaque frontier. Used only as a null pointer arg here. */
export interface OZChannelImplLike {
  readonly __OZChannelImpl_opaque: unique symbol;
}

/** OZChannelInfo* — opaque frontier. Used only as a null pointer arg here. */
export interface OZChannelInfoLike {
  readonly __OZChannelInfo_opaque: unique symbol;
}

/** OZLayeredMaterial* — opaque frontier. */
export interface OZLayeredMaterialLike {
  readonly __OZLayeredMaterial_opaque: unique symbol;
}

/** OZMaterialBumpIF* — opaque frontier. `appendLayersToLayeredMaterial` casts
 *  `this+0x4c8` to this pointer (i.e. the third-vptr sub-object slice IS the
 *  OZMaterialBumpIF sub-object embedded in OZMaterialBumpMapLayer). */
export interface OZMaterialBumpIFLike {
  readonly __OZMaterialBumpIF_opaque: unique symbol;
}

/** CMTime — opaque frontier. `kCMTimeZero` is a link-time symbol pointer
 *  referenced from many method bodies via RIP-relative literal-pool loads. */
export interface CMTimeLike {
  readonly __CMTime_opaque: unique symbol;
}

/** LayeredMaterialInfo — nested type OZMaterialLayerBase::LayeredMaterialInfo,
 *  opaque frontier. Passed by reference through
 *  appendLayersToLayeredMaterial → AppendBumpMapLayerToLayeredMaterial. */
export interface LayeredMaterialInfoLike {
  readonly __LayeredMaterialInfo_opaque: unique symbol;
}

/** OZChannelPercent — opaque frontier for the +0x4d0 subobject. */
export interface OZChannelPercentLike {
  readonly __OZChannelPercent_opaque: unique symbol;
}

/** OZChannelImageWithTransform — opaque frontier for the +0x568 subobject. */
export interface OZChannelImageWithTransformLike {
  readonly __OZChannelImageWithTransform_opaque: unique symbol;
}

/** OZChannelMaterialLayerMap — opaque frontier for the +0x1570 subobject.
 *  Also owns the +0x1aa0 (unnamed) sub-slot AND the +0x1ba0 typePopup sub-slot
 *  addressed by initBump / bumpMapTypePopupChannel. */
export interface OZChannelMaterialLayerMapLike {
  readonly __OZChannelMaterialLayerMap_opaque: unique symbol;
}

/** OZChannelEnum — opaque frontier for the +0x2ea8 subobject. */
export interface OZChannelEnumLike {
  readonly __OZChannelEnum_opaque: unique symbol;
}

/** OZChannel — opaque frontier (base class). Used to type-thin the +0x1aa0 /
 *  +0x5f0 / +0x15f8 slots that initBump / getImageNodeIDs address. */
export interface OZChannelLike {
  readonly __OZChannel_opaque: unique symbol;
}

/** OZChannelBase — opaque frontier for the +0x2be0 slot addressed by initBump
 *  (resetFlag(2,false)). */
export interface OZChannelBaseLike {
  readonly __OZChannelBase_opaque: unique symbol;
}

/** OZMaterialBumpMapLayerSequenceFolder — opaque frontier constructed by
 *  makeMaterialLayerSequenceChannelFolder(). Heap-allocated via `operator new`
 *  with size 0x8e8 (`movl $0x8e8,%edi ; callq __Znwm` @0x440bba). */
export interface OZMaterialBumpMapLayerSequenceFolderLike {
  readonly __OZMaterialBumpMapLayerSequenceFolder_opaque: unique symbol;
}

/** CFStringRef — Objective-C CoreFoundation string. Each `leaq ..(%rip),%rsi`
 *  paired with `## Objc cfstring ref: @"bad cfstring ref"` in the disasm is
 *  such a pointer. We keep the *literal-pool VA* as a symbolic string. */
export interface CFStringRefLike {
  readonly __CFStringRef_opaque: unique symbol;
}

// ── Frontier stubs — every undecoded external callee gets a throw citing its
//    addr / stub target. This is Rule 3 of PORTING_SPEC.md.

/** `_theApp` global — used as `movq (_theApp),%rax ; movq 0x48(%rax),%rdx`
 *  (theApp.field@0x48 is the CFBundle passed to PCString(CFStringRef, bundle, bundle)).
 *  Referenced by every C2 ctor here. Left as a throwing accessor. */
function theApp_getBundle_stub(): CFStringRefLike {
  throw new Error("_theApp.field@0x48 (CFBundle for PCString) @Ozone 0x43fe7c not yet transcribed");
}

/** __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_ — PCString(CFStringRef,
 *  CFBundleRef, CFBundleRef) [C1], @Ozone 0x6df08a stub target. */
function PCString_ctor_cfstring_stub(_out: PCStringLike, _cfstr: CFStringRefLike, _b1: unknown, _b2: unknown): void {
  throw new Error("PCString(CFStringRef, CFBundleRef, CFBundleRef) [C1] @Ozone 0x6df08a not yet transcribed");
}

/** __ZN8PCStringD1Ev — PCString::~PCString() [D1], @Ozone 0x6df0c6 stub target. */
function PCString_dtor_stub(_p: PCStringLike): void {
  throw new Error("PCString::~PCString() [D1] @Ozone 0x6df0c6 not yet transcribed");
}

/** __ZN16OZChannelPercentC1EdRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
 *  — OZChannelPercent(double, PCString&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*),
 *  @Ozone 0x6de184 stub target. */
function OZChannelPercent_ctor_stub(
  _out: OZChannelPercentLike, _v: number, _name: PCStringLike, _folder: OZChannelFolderLike,
  _uu1: number, _uu2: number, _impl: OZChannelImplLike | null, _info: OZChannelInfoLike | null,
): void {
  throw new Error(
    "OZChannelPercent(double, PCString&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*) " +
      "@Ozone 0x6de184 not yet transcribed",
  );
}

/** __ZN16OZChannelPercentC1ERKS_P15OZChannelFolder — OZChannelPercent(OZChannelPercent const&,
 *  OZChannelFolder*) [C1], @Ozone 0x6de17e stub target. */
function OZChannelPercent_copy_stub(_out: OZChannelPercentLike, _src: OZChannelPercentLike, _folder: OZChannelFolderLike): void {
  throw new Error("OZChannelPercent(OZChannelPercent const&, OZChannelFolder*) @Ozone 0x6de17e not yet transcribed");
}

/** __ZN16OZChannelPercentD1Ev — OZChannelPercent::~OZChannelPercent() [D1], @Ozone 0x6de18a stub target. */
function OZChannelPercent_dtor_stub(_p: OZChannelPercentLike): void {
  throw new Error("OZChannelPercent::~OZChannelPercent() [D1] @Ozone 0x6de18a not yet transcribed");
}

/** __ZN27OZChannelImageWithTransformC1ERK8PCStringP15OZChannelFolderjj — direct-call
 *  in the ctor @0x43ff0c. */
function OZChannelImageWithTransform_ctor_stub(
  _out: OZChannelImageWithTransformLike, _name: PCStringLike, _folder: OZChannelFolderLike,
  _uu1: number, _uu2: number,
): void {
  throw new Error(
    "OZChannelImageWithTransform(PCString&, OZChannelFolder*, uint, uint) [C1] " +
      "@Ozone 0x43ff0c (direct call) not yet transcribed",
  );
}

/** __ZN27OZChannelImageWithTransformC1ERKS_P15OZChannelFolder — copy-ctor, direct-call @0x440859. */
function OZChannelImageWithTransform_copy_stub(
  _out: OZChannelImageWithTransformLike, _src: OZChannelImageWithTransformLike, _folder: OZChannelFolderLike,
): void {
  throw new Error(
    "OZChannelImageWithTransform(OZChannelImageWithTransform const&, OZChannelFolder*) [C1] " +
      "@Ozone 0x440859 (direct call) not yet transcribed",
  );
}

/** __ZN27OZChannelImageWithTransformD2Ev — direct-call in every C2 unwind path and in D2 @0x44094b. */
function OZChannelImageWithTransform_dtor_stub(_p: OZChannelImageWithTransformLike): void {
  throw new Error(
    "OZChannelImageWithTransform::~OZChannelImageWithTransform() [D2] " +
      "@Ozone 0x44094b (direct call) not yet transcribed",
  );
}

/** __ZN25OZChannelMaterialLayerMapC1ERK8PCStringP15OZChannelFolderjj — direct-call @0x43ff4c. */
function OZChannelMaterialLayerMap_ctor_stub(
  _out: OZChannelMaterialLayerMapLike, _name: PCStringLike, _folder: OZChannelFolderLike,
  _uu1: number, _uu2: number,
): void {
  throw new Error(
    "OZChannelMaterialLayerMap(PCString&, OZChannelFolder*, uint, uint) [C1] " +
      "@Ozone 0x43ff4c (direct call) not yet transcribed",
  );
}

/** __ZN25OZChannelMaterialLayerMapC1ERKS_P15OZChannelFolder — copy-ctor, direct-call @0x440872. */
function OZChannelMaterialLayerMap_copy_stub(
  _out: OZChannelMaterialLayerMapLike, _src: OZChannelMaterialLayerMapLike, _folder: OZChannelFolderLike,
): void {
  throw new Error(
    "OZChannelMaterialLayerMap(OZChannelMaterialLayerMap const&, OZChannelFolder*) [C1] " +
      "@Ozone 0x440872 (direct call) not yet transcribed",
  );
}

/** __ZN25OZChannelMaterialLayerMapD2Ev — direct-call in D2 @0x44093f and in every unwind path. */
function OZChannelMaterialLayerMap_dtor_stub(_p: OZChannelMaterialLayerMapLike): void {
  throw new Error(
    "OZChannelMaterialLayerMap::~OZChannelMaterialLayerMap() [D2] " +
      "@Ozone 0x44093f (direct call) not yet transcribed",
  );
}

/** __ZN25OZChannelMaterialLayerMap28setImageChannelOffsetChannelEP17OZLayeredMaterial
 *  — tail-called from fixupImageChannelsOffsetChannel @0x440b9b (direct-call). */
function OZChannelMaterialLayerMap_setImageChannelOffsetChannel_stub(
  _p: OZChannelMaterialLayerMapLike, _lm: OZLayeredMaterialLike,
): void {
  throw new Error(
    "OZChannelMaterialLayerMap::setImageChannelOffsetChannel(OZLayeredMaterial*) " +
      "@Ozone 0x440b9b (tail-call) not yet transcribed",
  );
}

/** __ZN25OZChannelMaterialLayerMap17setEnableBumpTypeEb
 *  — tail-called from the end of every ctor and from the end of initBump @0x4401b9. */
function OZChannelMaterialLayerMap_setEnableBumpType_stub(_p: OZChannelMaterialLayerMapLike, _enable: boolean): void {
  throw new Error(
    "OZChannelMaterialLayerMap::setEnableBumpType(bool) @Ozone 0x4401b9 (tail-call) not yet transcribed",
  );
}

/** __ZN13OZChannelEnumC1ERK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
 *  — @Ozone 0x6dd9a4 stub target. */
function OZChannelEnum_ctor_stub(
  _out: OZChannelEnumLike, _name1: PCStringLike, _name2: PCStringLike, _folder: OZChannelFolderLike,
  _uu1: number, _uu2: number, _impl: OZChannelImplLike | null, _info: OZChannelInfoLike | null,
): void {
  throw new Error(
    "OZChannelEnum(PCString&, PCString&, OZChannelFolder*, uint, uint, OZChannelImpl*, OZChannelInfo*) " +
      "@Ozone 0x6dd9a4 not yet transcribed",
  );
}

/** __ZN13OZChannelEnumC1ERKS_P15OZChannelFolder — @Ozone 0x6dd9aa stub target. */
function OZChannelEnum_copy_stub(_out: OZChannelEnumLike, _src: OZChannelEnumLike, _folder: OZChannelFolderLike): void {
  throw new Error("OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) @Ozone 0x6dd9aa not yet transcribed");
}

/** __ZN13OZChannelEnumD1Ev — @Ozone 0x6dd9d4 stub target. */
function OZChannelEnum_dtor_stub(_p: OZChannelEnumLike): void {
  throw new Error("OZChannelEnum::~OZChannelEnum() [D1] @Ozone 0x6dd9d4 not yet transcribed");
}

/** __ZN9OZChannel6setMaxEd — OZChannel::setMax(double), @Ozone 0x6df432 stub target. */
function OZChannel_setMax_stub(_p: OZChannelLike | OZChannelPercentLike, _v: number): void {
  throw new Error("OZChannel::setMax(double) @Ozone 0x6df432 not yet transcribed");
}

/** __ZN9OZChannel8setValueERK6CMTimedb — OZChannel::setValue(CMTime const&, double, bool),
 *  @Ozone 0x6df456 stub target. */
function OZChannel_setValue_stub(_p: OZChannelLike, _t: CMTimeLike, _v: number, _b: boolean): void {
  throw new Error("OZChannel::setValue(CMTime const&, double, bool) @Ozone 0x6df456 not yet transcribed");
}

/** __ZN9OZChannel15setDefaultValueEd — OZChannel::setDefaultValue(double), @Ozone 0x6df306 stub target. */
function OZChannel_setDefaultValue_stub(_p: OZChannelLike, _v: number): void {
  throw new Error("OZChannel::setDefaultValue(double) @Ozone 0x6df306 not yet transcribed");
}

/** __ZNK9OZChannel14getValueAsUintERK6CMTimed — OZChannel::getValueAsUint(CMTime const&, double) const,
 *  @Ozone 0x6dfa8c stub target. */
function OZChannel_getValueAsUint_stub(_p: OZChannelLike, _t: CMTimeLike, _tol: number): number {
  throw new Error("OZChannel::getValueAsUint(CMTime const&, double) const @Ozone 0x6dfa8c not yet transcribed");
}

/** __ZN13OZChannelBase25setInspectorCtlrClassNameEPK10__CFString — @Ozone 0x6dd8de stub target. */
function OZChannelBase_setInspectorCtlrClassName_stub(_p: OZChannelBaseLike | OZChannelMaterialLayerMapLike, _cfs: CFStringRefLike): void {
  throw new Error(
    "OZChannelBase::setInspectorCtlrClassName(CFStringRef) @Ozone 0x6dd8de not yet transcribed",
  );
}

/** __ZN13OZChannelBase9resetFlagEyb — OZChannelBase::resetFlag(uint64, bool), @Ozone 0x6dd92c stub target. */
function OZChannelBase_resetFlag_stub(_p: OZChannelBaseLike, _flag: bigint, _b: boolean): void {
  throw new Error("OZChannelBase::resetFlag(uint64, bool) @Ozone 0x6dd92c not yet transcribed");
}

/** __ZNK13OZChannelBase20getObjectManipulatorEv — @Ozone 0x6df55e stub target. */
function OZChannelBase_getObjectManipulator_stub(_p: OZChannelBaseLike): unknown {
  throw new Error("OZChannelBase::getObjectManipulator() const @Ozone 0x6df55e not yet transcribed");
}

/** __ZN15OZChannelFolder13resetFoldFlagEj — @Ozone 0x6ddf68 stub target. */
function OZChannelFolder_resetFoldFlag_stub(_p: OZChannelFolderLike | OZChannelMaterialLayerMapLike, _flag: number): void {
  throw new Error("OZChannelFolder::resetFoldFlag(uint) @Ozone 0x6ddf68 not yet transcribed");
}

/** __ZN15OZChannelFolder18saveStateAsDefaultEv — @Ozone 0x6ddf92 stub target. */
function OZChannelFolder_saveStateAsDefault_stub(_p: OZChannelFolderLike | OZChannelMaterialLayerMapLike): void {
  throw new Error("OZChannelFolder::saveStateAsDefault() @Ozone 0x6ddf92 not yet transcribed");
}

/** OZMaterialLayerBase C2 (5-arg), C2 (3-arg), C2 copy, initBase, dtor, getSequenceChannels
 *  — all direct-call frontiers in `../src/channels/…` not yet transcribed. */
function OZMaterialLayerBase_C2_full_stub(_this: OZMaterialBumpMapLayer, _factory: OZFactoryLike, _name: PCStringLike, _folder: OZChannelFolderLike | null, _uu1: number, _uu2: number): void {
  throw new Error(
    "OZMaterialLayerBase(OZFactory*, PCString&, OZChannelFolder*, uint, uint) [C2] " +
      "@Ozone direct-call (ctor entry @0x43fe54) not yet transcribed",
  );
}
function OZMaterialLayerBase_C2_short_stub(_this: OZMaterialBumpMapLayer, _factory: OZFactoryLike, _name: PCStringLike, _uu1: number): void {
  throw new Error(
    "OZMaterialLayerBase(OZFactory*, PCString&, uint) [C2] " +
      "@Ozone direct-call (ctor entry @0x440524) not yet transcribed",
  );
}
function OZMaterialLayerBase_C2_copy_stub(_this: OZMaterialBumpMapLayer, _src: OZMaterialBumpMapLayer, _folder: OZChannelFolderLike | null): void {
  throw new Error(
    "OZMaterialLayerBase(OZMaterialLayerBase const&, OZChannelFolder*) [C2] " +
      "@Ozone direct-call (ctor entry @0x440804) not yet transcribed",
  );
}
function OZMaterialLayerBase_initBase_stub(_this: OZMaterialBumpMapLayer): void {
  throw new Error("OZMaterialLayerBase::initBase() @Ozone direct-call (@0x43ffcb) not yet transcribed");
}
function OZMaterialLayerBase_getSequenceChannels_stub(_this: OZMaterialBumpMapLayer): unknown {
  throw new Error(
    "OZMaterialLayerBase::getSequenceChannels() @Ozone direct-call (tail-jmp @0x440d05) not yet transcribed",
  );
}
function OZMaterialLayerBase_D2_stub(_this: OZMaterialBumpMapLayer): void {
  throw new Error("OZMaterialLayerBase::~OZMaterialLayerBase() [D2] @Ozone direct-call (@0x440965) not yet transcribed");
}

/** AppendBumpMapLayerToLayeredMaterial(OZMaterialBumpIF*, LayeredMaterialInfo&, bool) — free
 *  function tail-called from appendLayersToLayeredMaterial @0x440c0e. */
function AppendBumpMapLayerToLayeredMaterial_stub(_bump: OZMaterialBumpIFLike, _info: LayeredMaterialInfoLike, _flag: boolean): void {
  throw new Error(
    "AppendBumpMapLayerToLayeredMaterial(OZMaterialBumpIF*, LayeredMaterialInfo&, bool) " +
      "@Ozone direct-call (@0x440c0e) not yet transcribed",
  );
}

/** OZMaterialBumpMapLayerSequenceFolder(PCString&, OZChannelFolder*, uint, uint, uint) — direct-call
 *  in makeMaterialLayerSequenceChannelFolder @0x440bdd. Heap slab size = 0x8e8 (2280 bytes). */
function OZMaterialBumpMapLayerSequenceFolder_ctor_stub(
  _out: OZMaterialBumpMapLayerSequenceFolderLike, _name: PCStringLike, _folder: OZChannelFolderLike | null,
  _uu1: number, _uu2: number, _uu3: number,
): void {
  throw new Error(
    "OZMaterialBumpMapLayerSequenceFolder(PCString&, OZChannelFolder*, uint, uint, uint) [C1] " +
      "@Ozone direct-call (@0x440bdd) not yet transcribed",
  );
}

/** OZMaterialBumpMapLayer_Factory::getInstance() — reached via std::call_once wrapper in
 *  the 4-arg C2 @0x440214. Not yet transcribed. */
function OZMaterialBumpMapLayer_Factory_getInstance_stub(): OZFactoryLike {
  throw new Error(
    "OZMaterialBumpMapLayer_Factory::getInstance() @Ozone direct-call (@0x440214) not yet transcribed",
  );
}

// ── The port ────────────────────────────────────────────────────────────────

/**
 * VTABLE addresses installed by the ctors. Cited so provenance is machine-checkable.
 *
 *   primary   = table+0x10 = 0x864428  (@0x43fe59..@0x43fe60: leaq 0x4245c8(%rip),%rax)
 *   secondary = 0x864800              (@0x43fe63..@0x43fe6a: leaq 0x424996(%rip),%rax)
 *   tertiary  = 0x864858              (@0x43fe6e..@0x43fe75: leaq 0x4249e3(%rip),%rax)
 */
export const VTBL_OZMaterialBumpMapLayer_primary_VA_0x864428 = 0x864428;
export const VTBL_OZMaterialBumpMapLayer_secondary_VA_0x864800 = 0x864800;
export const VTBL_OZMaterialBumpMapLayer_tertiary_VA_0x864858 = 0x864858;

/**
 * OZChannelPercent(diffuseGain) initial value 1.0 — RIP data @Ozone 0x7053e0.
 * `movsd 0x2c552d(%rip),%xmm0` @0x43feab (target = 0x43feb3 + 0x2c552d = 0x7053e0).
 */
export const OZMaterialBumpMapLayer_diffuseGain_initial_at_VA_0x7053e0 = 1.0;

/**
 * OZChannel::setMax(1e6) — RIP data @Ozone 0x707a60.
 * `movsd 0x2c792f(%rip),%xmm0` @0x440129 (target = 0x440131 + 0x2c792f = 0x707a60).
 */
export const OZMaterialBumpMapLayer_diffuseGain_setMax_at_VA_0x707a60 = 1_000_000.0;

/**
 * OZChannel::setValue(1.0) on the +0x1aa0 slot — RIP data @Ozone 0x7053e0.
 * `movsd 0x2c528d(%rip),%xmm0` @0x44014b (target = 0x440153 + 0x2c528d = 0x7053e0).
 */
export const OZMaterialBumpMapLayer_slot_1aa0_setValue_at_VA_0x7053e0 = 1.0;

/**
 * OZChannel::setDefaultValue(1.0) on the +0x1aa0 slot — RIP data @Ozone 0x7053e0.
 * `movsd 0x2c5254(%rip),%xmm0` @0x440184 (target = 0x44018c + 0x2c5254 = 0x7053e0).
 */
export const OZMaterialBumpMapLayer_slot_1aa0_setDefault_at_VA_0x7053e0 = 1.0;

/**
 * The four factory-tag `uint` args passed to the child channel ctors. Cited so
 * the offsets and values are grounded in the disasm.
 *   +0x4d0  OZChannelPercent          arg4 = 0x65
 *   +0x568  OZChannelImageWithTransform arg3 = 0x64, arg4 = 0x2
 *   +0x1570 OZChannelMaterialLayerMap arg3 = 0x67
 *   +0x2ea8 OZChannelEnum             arg4 = 0x66
 * (Verified in @0x43febd, @0x43ff01/@0x43ff06, @0x43ff44, @0x43ffa8.)
 */
export const OZMaterialBumpMapLayer_child_ctor_tags = {
  diffuseGain_uu1_at_VA_0x43febd: 0x65,
  imageWithTransform_uu1_at_VA_0x43ff01: 0x64,
  imageWithTransform_uu2_at_VA_0x43ff06: 0x2,
  materialLayerMap_uu1_at_VA_0x43ff44: 0x67,
  enum_uu1_at_VA_0x43ffa8: 0x66,
} as const;

/**
 * initBump calls at end-of-ctor use `resetFoldFlag(0x0f)` on the MaterialLayerMap sub-object
 * (@0x440160..@0x440165: `movl $0xf,%esi ; callq __ZN15OZChannelFolder13resetFoldFlagEj`),
 * and `resetFlag(2, false)` on the +0x2be0 base slot (@0x44019d..@0x4401a2:
 * `movl $0x2,%esi ; xorl %edx,%edx ; callq __ZN13OZChannelBase9resetFlagEyb`).
 * Cited symbolically so future decoders don't wonder where these bit masks came from.
 */
export const OZMaterialBumpMapLayer_initBump_resetFoldFlag_at_VA_0x440160 = 0x0f;
export const OZMaterialBumpMapLayer_initBump_resetFlag_at_VA_0x44019d = 2;

/**
 * The heap slab size for `clone()` and `makeMaterialLayerSequenceChannelFolder()`.
 * These are hard-coded immediates in the two functions; naming them here anchors
 * the recovered layout total-size = 0x2fa8.
 */
export const OZMaterialBumpMapLayer_sizeof_at_VA_0x440b5a = 0x2fa8;
export const OZMaterialBumpMapLayerSequenceFolder_sizeof_at_VA_0x440bba = 0x8e8;

/**
 * `OZMaterialBumpMapLayer` — a concrete OZMaterialLayerBase-derived material
 * layer. Only its *outer field-offsets* are decoded here; the four channel
 * sub-objects remain opaque (their C2 bodies land in their own files). All
 * offsets are byte offsets from `this` (the C2-first-arg pointer `%rdi`).
 */
export interface OZMaterialBumpMapLayer {
  /** +0x000 primary vptr. Installed = 0x864428 (see VTBL_..._primary). */
  vptrPrimary_at_0x000: number;
  /** +0x010 secondary vptr. Installed = 0x864800. */
  vptrSecondary_at_0x010: number;
  /** +0x4c8 tertiary vptr. Installed = 0x864858. */
  vptrTertiary_at_0x4c8: number;
  /** +0x4d0 OZChannelPercent (diffuseGain). */
  diffuseGainChannel_at_0x4d0: OZChannelPercentLike;
  /** +0x568 OZChannelImageWithTransform (private image-with-transform). */
  imageWithTransformChannel_at_0x568: OZChannelImageWithTransformLike;
  /** +0x1570 OZChannelMaterialLayerMap (the "public" bumpMapImageChannel). */
  materialLayerMap_at_0x1570: OZChannelMaterialLayerMapLike;
  /** +0x1aa0 OZChannel — nested inside the +0x1570 map (offset 0x530).
   *  initBump sets its value/default to 1.0. */
  nested_channel_at_0x1aa0: OZChannelLike;
  /** +0x1ba0 OZChannel — nested inside +0x1570 (offset 0x630). Exposed as
   *  bumpMapTypePopupChannel(). */
  bumpMapTypePopupChannel_at_0x1ba0: OZChannelLike;
  /** +0x2be0 OZChannelBase — nested base slot. initBump resets flag 2. */
  nested_channelBase_at_0x2be0: OZChannelBaseLike;
  /** +0x2ea8 OZChannelEnum (bumpMapOperator). */
  bumpMapOperatorChannel_at_0x2ea8: OZChannelEnumLike;
  /** +0x5f0 OZChannel — first image-node-id channel walked by getImageNodeIDs. */
  imageNodeIdChannel_a_at_0x5f0: OZChannelLike;
  /** +0x15f8 OZChannel — second image-node-id channel walked by getImageNodeIDs. */
  imageNodeIdChannel_b_at_0x15f8: OZChannelLike;
}

/**
 * The compact std::list<uint32_t> node layout used by libc++ and read by
 * `getImageNodeIDs`. Each node is 0x18 bytes:
 *   +0x00  next    (list-node*)
 *   +0x08  prev    (list-node*)  — actually the "back-pointer"; on the sentinel
 *                                   this is the tail node.
 *   +0x10  value   (uint32_t)    — written from %r12d / %r14d in the disasm.
 * The list HEAD (passed as `%rbx` in getImageNodeIDs) is itself a sentinel
 * with the same three fields (0x8/0x0 hold prev/next of the ring, and 0x10
 * holds `size_t size`, which is incremented by `incq 0x10(%rbx)`).
 */
export interface StdListUint32Node {
  next_at_0x00: StdListUint32Node;
  prev_at_0x08: StdListUint32Node;
  value_at_0x10: number;
}

export interface StdListUint32Head {
  next_at_0x00: StdListUint32Node;
  prev_at_0x08: StdListUint32Node;
  size_at_0x10: number;
}

// ── Ctors ───────────────────────────────────────────────────────────────────
// The C1/C2 pairs share bodies (Itanium ABI); we transcribe the C2 form and
// export the C1 alias explicitly.

/**
 * `OZMaterialBumpMapLayer::OZMaterialBumpMapLayer(OZFactory*, PCString const&,
 *  OZChannelFolder*, unsigned int, unsigned int)` [C2] @Ozone 0x43fe40.
 *
 * Structure (line-for-line with the disasm):
 *   1. callq OZMaterialLayerBase::OZMaterialLayerBase(factory, name, folder, uu1, uu2)   [C2]
 *   2. install primary/secondary/tertiary vptrs (0x864428 / 0x864800 / 0x864858).
 *   3. Build a scratch PCString from a bundle-relative CFString ref (bundle = _theApp.field@0x48).
 *      Construct `this+0x4d0` = OZChannelPercent(1.0, scratch, this-as-folder, 0x65, 0, null, null).
 *      Destroy scratch PCString.
 *   4. Repeat with 3 more scratch PCStrings for the other three subobjects:
 *      `this+0x568`  = OZChannelImageWithTransform(scratch, this-as-folder, 0x64, 0x2)
 *      `this+0x1570` = OZChannelMaterialLayerMap(scratch, this-as-folder, 0x67, 0)
 *      `this+0x2ea8` = OZChannelEnum(scratch1, scratch2, this-as-folder, 0x66, 0, null, null)
 *   5. call OZMaterialLayerBase::initBase()
 *   6. initBump-style tail block (identical to `initBump` @0x440110):
 *        (this+0x4d0).setMax(1e6)
 *        (this+0x1aa0).setValue(kCMTimeZero, 1.0, false)
 *        (this+0x1570).resetFoldFlag(0x0f)
 *        (this+0x1570).setInspectorCtlrClassName(<cfstring>)
 *        (this+0x1570).saveStateAsDefault()
 *        (this+0x1aa0).setDefaultValue(1.0)
 *        (this+0x2be0).resetFlag(2, false)
 *        (this+0x1570).setEnableBumpType(true)          [tail-call]
 *
 * NOTE — the C2 body inlines the `initBump()` epilogue; the exported
 * `OZMaterialBumpMapLayer::initBump()` @0x440110 is the SAME sequence starting
 * at step 6. This is faithful to the disasm; do not "refactor" ctor to call
 * initBump — the ctor does NOT call initBump (they're two independent bodies).
 */
export function OZMaterialBumpMapLayer_C2_at_VA_0x43fe40(
  self: OZMaterialBumpMapLayer,
  factory: OZFactoryLike,
  name: PCStringLike,
  folder: OZChannelFolderLike | null,
  uu1: number,
  uu2: number,
  kCMTimeZero: CMTimeLike,
): void {
  // (1) base ctor
  OZMaterialLayerBase_C2_full_stub(self, factory, name, folder as OZChannelFolderLike, uu1, uu2);
  // (2) install vptrs
  self.vptrPrimary_at_0x000 = VTBL_OZMaterialBumpMapLayer_primary_VA_0x864428;
  self.vptrSecondary_at_0x010 = VTBL_OZMaterialBumpMapLayer_secondary_VA_0x864800;
  self.vptrTertiary_at_0x4c8 = VTBL_OZMaterialBumpMapLayer_tertiary_VA_0x864858;
  // (3) diffuseGain channel @+0x4d0
  const scratch1: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch1, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelPercent_ctor_stub(
    self.diffuseGainChannel_at_0x4d0,
    OZMaterialBumpMapLayer_diffuseGain_initial_at_VA_0x7053e0,
    scratch1,
    self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.diffuseGain_uu1_at_VA_0x43febd,
    0,
    null,
    null,
  );
  PCString_dtor_stub(scratch1);
  // (4a) imageWithTransform channel @+0x568
  const scratch2: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch2, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelImageWithTransform_ctor_stub(
    self.imageWithTransformChannel_at_0x568,
    scratch2,
    self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.imageWithTransform_uu1_at_VA_0x43ff01,
    OZMaterialBumpMapLayer_child_ctor_tags.imageWithTransform_uu2_at_VA_0x43ff06,
  );
  PCString_dtor_stub(scratch2);
  // (4b) materialLayerMap channel @+0x1570
  const scratch3: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch3, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelMaterialLayerMap_ctor_stub(
    self.materialLayerMap_at_0x1570,
    scratch3,
    self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.materialLayerMap_uu1_at_VA_0x43ff44,
    0,
  );
  PCString_dtor_stub(scratch3);
  // (4c) enum channel @+0x2ea8 — needs TWO scratch PCStrings
  const scratch4a: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch4a, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  const scratch4b: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch4b, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelEnum_ctor_stub(
    self.bumpMapOperatorChannel_at_0x2ea8,
    scratch4a,
    scratch4b,
    self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.enum_uu1_at_VA_0x43ffa8,
    0,
    null,
    null,
  );
  PCString_dtor_stub(scratch4b);
  PCString_dtor_stub(scratch4a);
  // (5) initBase
  OZMaterialLayerBase_initBase_stub(self);
  // (6) initBump tail block — inlined here @0x43ffd0..@0x44004f, IDENTICAL to
  //     OZMaterialBumpMapLayer::initBump() @0x440110..@0x4401b9.
  OZChannel_setMax_stub(
    self.diffuseGainChannel_at_0x4d0 as unknown as OZChannelLike,
    OZMaterialBumpMapLayer_diffuseGain_setMax_at_VA_0x707a60,
  );
  OZChannel_setValue_stub(
    self.nested_channel_at_0x1aa0,
    kCMTimeZero,
    OZMaterialBumpMapLayer_slot_1aa0_setValue_at_VA_0x7053e0,
    false,
  );
  OZChannelFolder_resetFoldFlag_stub(
    self.materialLayerMap_at_0x1570,
    OZMaterialBumpMapLayer_initBump_resetFoldFlag_at_VA_0x440160,
  );
  OZChannelBase_setInspectorCtlrClassName_stub(
    self.materialLayerMap_at_0x1570,
    {} as CFStringRefLike, // @0x44000d: leaq 0x44ecfc(%rip),%rsi — Objc cfstring literal
  );
  OZChannelFolder_saveStateAsDefault_stub(self.materialLayerMap_at_0x1570);
  OZChannel_setDefaultValue_stub(
    self.nested_channel_at_0x1aa0,
    OZMaterialBumpMapLayer_slot_1aa0_setDefault_at_VA_0x7053e0,
  );
  OZChannelBase_resetFlag_stub(
    self.nested_channelBase_at_0x2be0,
    BigInt(OZMaterialBumpMapLayer_initBump_resetFlag_at_VA_0x44019d),
    false,
  );
  // Tail-call setEnableBumpType(true).
  OZChannelMaterialLayerMap_setEnableBumpType_stub(self.materialLayerMap_at_0x1570, true);
}

/** C1 alias — shares C2's body (Itanium ABI). @Ozone 0x4401c0. */
export const OZMaterialBumpMapLayer_C1_at_VA_0x4401c0 = OZMaterialBumpMapLayer_C2_at_VA_0x43fe40;

/**
 * `OZMaterialBumpMapLayer(PCString const&, OZChannelFolder*, uint, uint)` [C2] @Ozone 0x4401d0.
 *
 * Structure (from @0x4401f0..@0x440234 head + shared tail with the 5-arg ctor):
 *   1. `std::call_once(OZMaterialBumpMapLayer_Factory::_instanceOnce,
 *                      [&]{ OZMaterialBumpMapLayer_Factory::getInstance() })`
 *   2. Load `OZMaterialBumpMapLayer_Factory::_instance` into %rsi (the factory ptr).
 *   3. Tail-call the 5-arg C2 with that factory: this(factory=_instance, name, folder, uu1, uu2).
 *
 * The rest of the body (post-@0x440234) is the exact same channel-ctor + initBase +
 * initBump-tail sequence as the 5-arg C2; the two share the SAME layout constants.
 */
export function OZMaterialBumpMapLayer_C2_short_at_VA_0x4401d0(
  self: OZMaterialBumpMapLayer,
  name: PCStringLike,
  folder: OZChannelFolderLike | null,
  uu1: number,
  uu2: number,
  kCMTimeZero: CMTimeLike,
): void {
  // (1) call_once bootstrap of the singleton factory.
  const factory = OZMaterialBumpMapLayer_Factory_getInstance_stub();
  // (2/3) forward to the 5-arg C2 body.
  OZMaterialBumpMapLayer_C2_at_VA_0x43fe40(self, factory, name, folder, uu1, uu2, kCMTimeZero);
}

/** C1 alias — @Ozone 0x440500. */
export const OZMaterialBumpMapLayer_C1_short_at_VA_0x440500 = OZMaterialBumpMapLayer_C2_short_at_VA_0x4401d0;

/**
 * `OZMaterialBumpMapLayer(OZFactory*, PCString const&, uint)` [C2] @Ozone 0x440510.
 *
 * Structure — same recipe as the 5-arg C2 but the base call and every child
 * ctor tag list drops the extra `folder`/`uu2` (folder = null, uu2 = 0):
 *   1. callq OZMaterialLayerBase(OZFactory*, PCString&, uint)                          [C2]
 *   2. install same three vptrs.
 *   3..5. same four channel subobject constructions, same initBase.
 *   6. same initBump tail block.
 *
 * We forward to the shared body with `folder = null` and `uu2 = 0` — the disasm
 * confirms every child ctor is called with folder = %rbx-as-folder even in this
 * overload (i.e. `this-as-folder`, not the missing outer folder arg).
 */
export function OZMaterialBumpMapLayer_C2_factoryOnly_at_VA_0x440510(
  self: OZMaterialBumpMapLayer,
  factory: OZFactoryLike,
  name: PCStringLike,
  uu1: number,
  kCMTimeZero: CMTimeLike,
): void {
  OZMaterialLayerBase_C2_short_stub(self, factory, name, uu1);
  self.vptrPrimary_at_0x000 = VTBL_OZMaterialBumpMapLayer_primary_VA_0x864428;
  self.vptrSecondary_at_0x010 = VTBL_OZMaterialBumpMapLayer_secondary_VA_0x864800;
  self.vptrTertiary_at_0x4c8 = VTBL_OZMaterialBumpMapLayer_tertiary_VA_0x864858;
  // Delegate the remaining channel/init construction to the shared tail. In
  // the disasm this is textually inlined; we call the same helpers to keep
  // the sequence 1:1.
  const scratch1: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch1, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelPercent_ctor_stub(
    self.diffuseGainChannel_at_0x4d0, OZMaterialBumpMapLayer_diffuseGain_initial_at_VA_0x7053e0,
    scratch1, self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.diffuseGain_uu1_at_VA_0x43febd, 0, null, null,
  );
  PCString_dtor_stub(scratch1);
  const scratch2: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch2, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelImageWithTransform_ctor_stub(
    self.imageWithTransformChannel_at_0x568, scratch2, self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.imageWithTransform_uu1_at_VA_0x43ff01,
    OZMaterialBumpMapLayer_child_ctor_tags.imageWithTransform_uu2_at_VA_0x43ff06,
  );
  PCString_dtor_stub(scratch2);
  const scratch3: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch3, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelMaterialLayerMap_ctor_stub(
    self.materialLayerMap_at_0x1570, scratch3, self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.materialLayerMap_uu1_at_VA_0x43ff44, 0,
  );
  PCString_dtor_stub(scratch3);
  const scratch4a: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch4a, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  const scratch4b: PCStringLike = {} as PCStringLike;
  PCString_ctor_cfstring_stub(scratch4b, {} as CFStringRefLike, theApp_getBundle_stub(), theApp_getBundle_stub());
  OZChannelEnum_ctor_stub(
    self.bumpMapOperatorChannel_at_0x2ea8, scratch4a, scratch4b, self as unknown as OZChannelFolderLike,
    OZMaterialBumpMapLayer_child_ctor_tags.enum_uu1_at_VA_0x43ffa8, 0, null, null,
  );
  PCString_dtor_stub(scratch4b); PCString_dtor_stub(scratch4a);
  OZMaterialLayerBase_initBase_stub(self);
  // initBump tail block:
  OZMaterialBumpMapLayer_initBump_at_VA_0x440110(self, kCMTimeZero);
}

/** C1 alias — @Ozone 0x4407e0. */
export const OZMaterialBumpMapLayer_C1_factoryOnly_at_VA_0x4407e0 = OZMaterialBumpMapLayer_C2_factoryOnly_at_VA_0x440510;

/**
 * `OZMaterialBumpMapLayer(OZMaterialBumpMapLayer const&, OZChannelFolder*)` [C2 copy]
 * @Ozone 0x4407f0.
 *
 * Structure (line-for-line):
 *   1. callq OZMaterialLayerBase(OZMaterialLayerBase const&, OZChannelFolder*)       [C2 copy]
 *   2. install the primary/secondary/tertiary vptrs (SAME three addresses).
 *   3. `this+0x4d0`.OZChannelPercent(other+0x4d0, this-as-folder)
 *   4. `this+0x568`.OZChannelImageWithTransform(other+0x568, this-as-folder)
 *   5. `this+0x1570`.OZChannelMaterialLayerMap(other+0x1570, this-as-folder)
 *   6. `this+0x2ea8`.OZChannelEnum(other+0x2ea8, this-as-folder)
 * (No initBase / initBump — the copy takes state from `other`.)
 */
export function OZMaterialBumpMapLayer_C2_copy_at_VA_0x4407f0(
  self: OZMaterialBumpMapLayer,
  other: OZMaterialBumpMapLayer,
  folder: OZChannelFolderLike | null,
): void {
  OZMaterialLayerBase_C2_copy_stub(self, other, folder);
  self.vptrPrimary_at_0x000 = VTBL_OZMaterialBumpMapLayer_primary_VA_0x864428;
  self.vptrSecondary_at_0x010 = VTBL_OZMaterialBumpMapLayer_secondary_VA_0x864800;
  self.vptrTertiary_at_0x4c8 = VTBL_OZMaterialBumpMapLayer_tertiary_VA_0x864858;
  OZChannelPercent_copy_stub(
    self.diffuseGainChannel_at_0x4d0,
    other.diffuseGainChannel_at_0x4d0,
    self as unknown as OZChannelFolderLike,
  );
  OZChannelImageWithTransform_copy_stub(
    self.imageWithTransformChannel_at_0x568,
    other.imageWithTransformChannel_at_0x568,
    self as unknown as OZChannelFolderLike,
  );
  OZChannelMaterialLayerMap_copy_stub(
    self.materialLayerMap_at_0x1570,
    other.materialLayerMap_at_0x1570,
    self as unknown as OZChannelFolderLike,
  );
  OZChannelEnum_copy_stub(
    self.bumpMapOperatorChannel_at_0x2ea8,
    other.bumpMapOperatorChannel_at_0x2ea8,
    self as unknown as OZChannelFolderLike,
  );
}

/** C1 alias — @Ozone 0x4408f0. */
export const OZMaterialBumpMapLayer_C1_copy_at_VA_0x4408f0 = OZMaterialBumpMapLayer_C2_copy_at_VA_0x4407f0;

// ── initBump ────────────────────────────────────────────────────────────────

/**
 * `OZMaterialBumpMapLayer::initBump()` @Ozone 0x440110.
 *
 * The exact tail block inlined by every C2 ctor form. Bit-for-bit sequence:
 *   1. callq OZMaterialLayerBase::initBase()                                @0x44011d
 *   2. (this+0x4d0).setMax(1e6)                                             @0x440131
 *   3. (this+0x1aa0).setValue(kCMTimeZero, 1.0, false)                      @0x440158
 *   4. (this+0x1570).resetFoldFlag(0x0f)                                    @0x440165
 *   5. (this+0x1570).setInspectorCtlrClassName(<cfstring @0x44016a>)        @0x440174
 *   6. (this+0x1570).saveStateAsDefault()                                   @0x44017c
 *   7. (this+0x1aa0).setDefaultValue(1.0)                                   @0x44018c
 *   8. (this+0x2be0).resetFlag(2, false)                                    @0x4401a2
 *   9. tail-jmp (this+0x1570).setEnableBumpType(true)                       @0x4401b9
 *
 * Note step 1 — initBump ALSO calls initBase at its entry. In the ctors,
 * initBase runs BEFORE the same tail block; here it runs at the head of
 * initBump. This is faithful; both call sites do it.
 */
export function OZMaterialBumpMapLayer_initBump_at_VA_0x440110(
  self: OZMaterialBumpMapLayer,
  kCMTimeZero: CMTimeLike,
): void {
  OZMaterialLayerBase_initBase_stub(self);
  OZChannel_setMax_stub(
    self.diffuseGainChannel_at_0x4d0 as unknown as OZChannelLike,
    OZMaterialBumpMapLayer_diffuseGain_setMax_at_VA_0x707a60,
  );
  OZChannel_setValue_stub(
    self.nested_channel_at_0x1aa0,
    kCMTimeZero,
    OZMaterialBumpMapLayer_slot_1aa0_setValue_at_VA_0x7053e0,
    false,
  );
  OZChannelFolder_resetFoldFlag_stub(
    self.materialLayerMap_at_0x1570,
    OZMaterialBumpMapLayer_initBump_resetFoldFlag_at_VA_0x440160,
  );
  OZChannelBase_setInspectorCtlrClassName_stub(
    self.materialLayerMap_at_0x1570,
    {} as CFStringRefLike, // @0x44016a Objc cfstring ref
  );
  OZChannelFolder_saveStateAsDefault_stub(self.materialLayerMap_at_0x1570);
  OZChannel_setDefaultValue_stub(
    self.nested_channel_at_0x1aa0,
    OZMaterialBumpMapLayer_slot_1aa0_setDefault_at_VA_0x7053e0,
  );
  OZChannelBase_resetFlag_stub(
    self.nested_channelBase_at_0x2be0,
    BigInt(OZMaterialBumpMapLayer_initBump_resetFlag_at_VA_0x44019d),
    false,
  );
  OZChannelMaterialLayerMap_setEnableBumpType_stub(self.materialLayerMap_at_0x1570, true);
}

// ── Destructor ──────────────────────────────────────────────────────────────

/**
 * `~OZMaterialBumpMapLayer()` [D2] @Ozone 0x440900.
 *
 * Structure:
 *   1. re-install the three vptrs (0x864418+delta, i.e. `+8` slots relative to
 *      the ctor variants — a "destructor vtable" convention where each slot's
 *      leaq target differs by 8 bytes from the C2's target; the effect is the
 *      same three sub-object vptrs but pointing at the dtor half of each
 *      combined vtable). @0x440909..@0x440925 (leaq +0x423b18/+0x423ee6/+0x423f33).
 *   2. call channels in REVERSE construction order:
 *        (this+0x2ea8).~OZChannelEnum()
 *        (this+0x1570).~OZChannelMaterialLayerMap()
 *        (this+0x568).~OZChannelImageWithTransform()
 *        (this+0x4d0).~OZChannelPercent()
 *   3. tail-jmp OZMaterialLayerBase::~OZMaterialLayerBase() [D2]                @0x440965
 */
export function OZMaterialBumpMapLayer_D2_at_VA_0x440900(self: OZMaterialBumpMapLayer): void {
  // (1) Re-install destructor-half vptrs. The three destinations are
  //     table+0x8 slice pointers (a Itanium "sub-vtable for D2" convention).
  //     Cite the same three primary VAs; the runtime distinguishes ctor vs
  //     dtor dispatch by the +0x00 vs +0x08 slot in each installed pointer.
  self.vptrPrimary_at_0x000 = VTBL_OZMaterialBumpMapLayer_primary_VA_0x864428;
  self.vptrSecondary_at_0x010 = VTBL_OZMaterialBumpMapLayer_secondary_VA_0x864800;
  self.vptrTertiary_at_0x4c8 = VTBL_OZMaterialBumpMapLayer_tertiary_VA_0x864858;
  // (2) subobject dtors in reverse construction order.
  OZChannelEnum_dtor_stub(self.bumpMapOperatorChannel_at_0x2ea8);
  OZChannelMaterialLayerMap_dtor_stub(self.materialLayerMap_at_0x1570);
  OZChannelImageWithTransform_dtor_stub(self.imageWithTransformChannel_at_0x568);
  OZChannelPercent_dtor_stub(self.diffuseGainChannel_at_0x4d0);
  // (3) tail-jmp to base D2.
  OZMaterialLayerBase_D2_stub(self);
}

/** D1 alias — shares D2 body (Itanium ABI). @Ozone 0x440970. */
export const OZMaterialBumpMapLayer_D1_at_VA_0x440970 = OZMaterialBumpMapLayer_D2_at_VA_0x440900;

/**
 * `~OZMaterialBumpMapLayer()` [D0 deleting] @Ozone 0x440a50.
 *
 * The deleting-dtor is the standard Itanium pattern: run D2, then
 * `operator delete(this)`. Since `operator delete` is a frontier stub, the
 * canonical port calls D2 then throws-via-stub for the delete.
 */
export function OZMaterialBumpMapLayer_D0_deleting_at_VA_0x440a50(self: OZMaterialBumpMapLayer): void {
  OZMaterialBumpMapLayer_D2_at_VA_0x440900(self);
  // operator delete(this)  — @Ozone 0x6dfc36 stub target.
  throw new Error("operator delete(void*) @Ozone 0x6dfc36 not yet transcribed (D0 tail)");
}

// ── Accessors ───────────────────────────────────────────────────────────────

/** `clone() const` @Ozone 0x440b50 — heap-allocate 0x2fa8 bytes via `operator new`,
 *  then run the copy-ctor with `folder = nullptr`. */
export function OZMaterialBumpMapLayer_clone_at_VA_0x440b50(self: OZMaterialBumpMapLayer): OZMaterialBumpMapLayer {
  // callq __Znwm(0x2fa8) — operator new. Frontier stub: replaced with a fresh
  // TS object with the correct layout tag; the byte-size is cited symbolically.
  void OZMaterialBumpMapLayer_sizeof_at_VA_0x440b5a; // 0x2fa8 (cite for provenance)
  const heap = {} as OZMaterialBumpMapLayer;
  OZMaterialBumpMapLayer_C2_copy_at_VA_0x4407f0(heap, self, null);
  return heap;
}

/** `fixupImageChannelsOffsetChannel(OZLayeredMaterial*)` @Ozone 0x440b90 — tail-jmp
 *  into `OZChannelMaterialLayerMap::setImageChannelOffsetChannel(OZLayeredMaterial*)`
 *  with `this = this+0x1570`. */
export function OZMaterialBumpMapLayer_fixupImageChannelsOffsetChannel_at_VA_0x440b90(
  self: OZMaterialBumpMapLayer,
  lm: OZLayeredMaterialLike,
): void {
  OZChannelMaterialLayerMap_setImageChannelOffsetChannel_stub(self.materialLayerMap_at_0x1570, lm);
}

/** `makeMaterialLayerSequenceChannelFolder()` @Ozone 0x440bb0 — heap-allocate
 *  0x8e8 bytes and construct an OZMaterialBumpMapLayerSequenceFolder with args
 *  `(this+0x20, folder=nullptr, uu1=this->field_0x18, uu2=0, uu3=0)`.
 *
 * Disasm cites:
 *   @0x440bc7  movl 0x18(%r14),%ecx       — read uu1 = this->field_at_0x18 (an OZChannel-base uint)
 *   @0x440bcb  addq $0x20,%r14           — the PCString arg is at this+0x20 (self as-PCString? actually
 *                                          it's the "name" field of OZMaterialLayerBase — layout of
 *                                          the base class writes a PCString at +0x20 of the object)
 *   @0x440bdd  callq  OZMaterialBumpMapLayerSequenceFolder_C1(...)
 */
export function OZMaterialBumpMapLayer_makeMaterialLayerSequenceChannelFolder_at_VA_0x440bb0(
  self: OZMaterialBumpMapLayer & {
    field_at_0x18: number;
    name_pcstring_at_0x20: PCStringLike;
  },
): OZMaterialBumpMapLayerSequenceFolderLike {
  void OZMaterialBumpMapLayerSequenceFolder_sizeof_at_VA_0x440bba; // 0x8e8 (cite for provenance)
  const heap = {} as OZMaterialBumpMapLayerSequenceFolderLike;
  OZMaterialBumpMapLayerSequenceFolder_ctor_stub(
    heap,
    self.name_pcstring_at_0x20,
    null,
    self.field_at_0x18,
    0,
    0,
  );
  return heap;
}

/** `appendLayersToLayeredMaterial(LayeredMaterialInfo&)` @Ozone 0x440c00 — tail-jmp
 *  `AppendBumpMapLayerToLayeredMaterial(this+0x4c8, info, false)`. The `this+0x4c8`
 *  cast is safe: +0x4c8 is the OZMaterialBumpIF sub-object slice (its tertiary vptr
 *  is installed by the ctors at that offset — see VTBL_..._tertiary_VA_0x864858). */
export function OZMaterialBumpMapLayer_appendLayersToLayeredMaterial_at_VA_0x440c00(
  self: OZMaterialBumpMapLayer,
  info: LayeredMaterialInfoLike,
): void {
  AppendBumpMapLayerToLayeredMaterial_stub(
    self as unknown as OZMaterialBumpIFLike, // the +0x4c8 slice — see the vptr install above
    info,
    false, // @0x440c0b: `xorl %edx,%edx`
  );
}

/** `getImageNodeIDs(std::list<uint>&)` @Ozone 0x440c20 —
 *  push_back(getValueAsUint(this+0x5f0, kCMTimeZero, 0.0));
 *  push_back(getValueAsUint(this+0x15f8, kCMTimeZero, 0.0));
 *
 * Each `push_back` is the libc++ insert-before-end idiom used inline
 * (@0x440c4d..@0x440c6c and @0x440c8d..@0x440ca7): allocate a 0x18-byte
 * list-node via operator new, splice it into the ring before the
 * sentinel, increment size@+0x10.
 */
export function OZMaterialBumpMapLayer_getImageNodeIDs_at_VA_0x440c20(
  self: OZMaterialBumpMapLayer,
  out: StdListUint32Head,
  kCMTimeZero: CMTimeLike,
): void {
  // ── Element A: getValueAsUint(this+0x5f0, kCMTimeZero, 0.0) ─────────────
  const valueA = OZChannel_getValueAsUint_stub(self.imageNodeIdChannel_a_at_0x5f0, kCMTimeZero, 0.0);
  // std::list<uint32_t>::push_back — allocate 0x18-byte node via __Znwm(0x18).
  const nodeA = {
    // Layout matches StdListUint32Node above.
    next_at_0x00: undefined as unknown as StdListUint32Node,
    prev_at_0x08: undefined as unknown as StdListUint32Node,
    value_at_0x10: valueA >>> 0, // uint32
  } as StdListUint32Node;
  // Splice before sentinel: newNode.prev = head.prev; newNode.next = head;
  //                        head.prev.next = newNode; head.prev = newNode; size++.
  nodeA.prev_at_0x08 = out.prev_at_0x08 as unknown as StdListUint32Node;
  nodeA.next_at_0x00 = out as unknown as StdListUint32Node;
  (out.prev_at_0x08 as unknown as StdListUint32Node).next_at_0x00 = nodeA;
  out.prev_at_0x08 = nodeA;
  out.size_at_0x10 += 1;
  // ── Element B: getValueAsUint(this+0x15f8, kCMTimeZero, 0.0) ────────────
  const valueB = OZChannel_getValueAsUint_stub(self.imageNodeIdChannel_b_at_0x15f8, kCMTimeZero, 0.0);
  const nodeB = {
    next_at_0x00: undefined as unknown as StdListUint32Node,
    prev_at_0x08: undefined as unknown as StdListUint32Node,
    value_at_0x10: valueB >>> 0,
  } as StdListUint32Node;
  nodeB.prev_at_0x08 = out.prev_at_0x08 as unknown as StdListUint32Node;
  nodeB.next_at_0x00 = out as unknown as StdListUint32Node;
  (out.prev_at_0x08 as unknown as StdListUint32Node).next_at_0x00 = nodeB;
  out.prev_at_0x08 = nodeB;
  out.size_at_0x10 += 1;
}

/** `bumpMapImageChannel()` @Ozone 0x440cc0 — return `this+0x1570` (the
 *  OZChannelMaterialLayerMap sub-object). */
export function OZMaterialBumpMapLayer_bumpMapImageChannel_at_VA_0x440cc0(
  self: OZMaterialBumpMapLayer,
): OZChannelMaterialLayerMapLike {
  return self.materialLayerMap_at_0x1570;
}

/** `bumpMapDiffuseGainChannel()` @Ozone 0x440cd0 — return `this+0x4d0`. */
export function OZMaterialBumpMapLayer_bumpMapDiffuseGainChannel_at_VA_0x440cd0(
  self: OZMaterialBumpMapLayer,
): OZChannelPercentLike {
  return self.diffuseGainChannel_at_0x4d0;
}

/** `bumpMapOperatorChannel()` @Ozone 0x440ce0 — return `this+0x2ea8`. */
export function OZMaterialBumpMapLayer_bumpMapOperatorChannel_at_VA_0x440ce0(
  self: OZMaterialBumpMapLayer,
): OZChannelEnumLike {
  return self.bumpMapOperatorChannel_at_0x2ea8;
}

/** `bumpMapTypePopupChannel()` @Ozone 0x440cf0 — return `this+0x1ba0`. */
export function OZMaterialBumpMapLayer_bumpMapTypePopupChannel_at_VA_0x440cf0(
  self: OZMaterialBumpMapLayer,
): OZChannelLike {
  return self.bumpMapTypePopupChannel_at_0x1ba0;
}

/** `sequenceChannels()` @Ozone 0x440d00 — tail-jmp
 *  `OZMaterialLayerBase::getSequenceChannels()` with `this` unchanged. */
export function OZMaterialBumpMapLayer_sequenceChannels_at_VA_0x440d00(
  self: OZMaterialBumpMapLayer,
): unknown {
  return OZMaterialLayerBase_getSequenceChannels_stub(self);
}

/** `objectManipulator()` @Ozone 0x440d10 — tail-jmp
 *  `OZChannelBase::getObjectManipulator() const` with `this` unchanged. */
export function OZMaterialBumpMapLayer_objectManipulator_at_VA_0x440d10(
  self: OZMaterialBumpMapLayer,
): unknown {
  return OZChannelBase_getObjectManipulator_stub(self as unknown as OZChannelBaseLike);
}

/** `sharedTransformChannel()` @Ozone 0x440d20 —
 *      callq  OZChannelBase::getObjectManipulator()
 *      addq   $0x5c0, %rax
 *      retq
 *  i.e. return `getObjectManipulator() + 0x5c0` (byte-arithmetic on the returned
 *  manipulator pointer). We model it as a wrapped tagged offset since the
 *  manipulator type is a frontier. */
export function OZMaterialBumpMapLayer_sharedTransformChannel_at_VA_0x440d20(
  self: OZMaterialBumpMapLayer,
): { readonly manipulator: unknown; readonly plusBytes: 0x5c0 } {
  const mgr = OZChannelBase_getObjectManipulator_stub(self as unknown as OZChannelBaseLike);
  return { manipulator: mgr, plusBytes: 0x5c0 };
}
