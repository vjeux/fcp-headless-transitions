// OZMaterialCompoundLayer.m0.ts — raw transcription of Ozone `OZMaterialCompoundLayer`
// (methods [0..20) of 47 — CHUNK 0 of a 3-chunk port: ctors, dtors, and the small
// transform/accessor family that touches offsets +0x4c8/+0x680/+0x940/+0x9d8/+0xad8/+0xb58).
//
// A concrete OZMaterialLayerBase-derived layer that owns FIVE embedded sub-object channels
// (Scale, Position, Angle, Enum, MaterialMapTransform) plus a large tail of layer-content state
// (Diffuse/Specular/Bump/Absorb) driven by parseEnd + createXxxLayer + appendXxxLayer methods
// (owned by chunks m1/m2).
//
// Provenance (Ozone framework, x86_64 slice; FAT offset 0x4000 = VA parity):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//   `nm -arch x86_64 | c++filt | grep OZMaterialCompoundLayer` — see head of the ledger.
//
// Symbols ported in THIS chunk (m0, methods [0..20)):
//   @0x19c9e0  ~OZMaterialCompoundLayer()                         [D2 body — canonical]
//                __ZN23OZMaterialCompoundLayerD2Ev
//   @0x6db590  ~OZMaterialCompoundLayer()                         [D1 — shares D2 body]
//                __ZN23OZMaterialCompoundLayerD1Ev
//   @0x6db5a0  ~OZMaterialCompoundLayer()                         [D0 deleting — `ud2` trap]
//                __ZN23OZMaterialCompoundLayerD0Ev
//   @0x19e7a0  getSequenceColorChannel()                          — literal `xor eax,eax; ret`
//                __ZN23OZMaterialCompoundLayer23getSequenceColorChannelEv
//   @0x19e7b0  getSequenceOpacityChannel()                        — literal `xor eax,eax; ret`
//                __ZN23OZMaterialCompoundLayer25getSequenceOpacityChannelEv
//   @0x1f97d0  OZMaterialCompoundLayer(OZFactory*, PCString const&, OZChannelFolder*, u32, u32) [C2]
//                __ZN23OZMaterialCompoundLayerC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj
//   @0x1f9a80  OZMaterialCompoundLayer(OZFactory*, PCString const&, u32)                       [C2]
//                __ZN23OZMaterialCompoundLayerC2EP9OZFactoryRK8PCStringj
//   @0x1f9d30  OZMaterialCompoundLayer(OZMaterialCompoundLayer const&, OZChannelFolder*)       [C2]
//                __ZN23OZMaterialCompoundLayerC2ERKS_P15OZChannelFolder
//   @0x1f9e70  parseEnd(PCSerializerReadStream&)
//                __ZN23OZMaterialCompoundLayer8parseEndER22PCSerializerReadStream
//   @0x1fa020  isAnySharedTransformEnabled()
//                __ZN23OZMaterialCompoundLayer27isAnySharedTransformEnabledEv
//   @0x1fa070  updateLocalTransformVisibility()                   — tail-jmp to
//                OZChannelMaterialMapTransform::updateLocalTransformChannelsVisibility() on +0xad8
//                __ZN23OZMaterialCompoundLayer30updateLocalTransformVisibilityEv
//   @0x1fa090  setTransformValuesAsDefaults()                     — tail-jmp to
//                OZChannelMaterialMapTransform::setCurrentTransformValuesAsDefault() on +0xad8
//                __ZN23OZMaterialCompoundLayer28setTransformValuesAsDefaultsEv
//   @0x1fa0b0  setSubtypeTags()                                   [very deep — throw-stub]
//                __ZN23OZMaterialCompoundLayer14setSubtypeTagsEv
//   @0x1fa3f0  getShouldRotateSide(CMTime const&)
//                __ZN23OZMaterialCompoundLayer19getShouldRotateSideERK6CMTime
//   @0x1fa460  getUseTriplanarMapping(CMTime const&)
//                __ZN23OZMaterialCompoundLayer22getUseTriplanarMappingERK6CMTime
//   @0x1fa4d0  setUpTexture(LayeredMaterialInfo&, LiTextureStoreToken const&, u32, u32, bool,
//                            ProShade::Sampler&, ProShade::Uniform&, OZTexturePlacement const&) [ovl]
//                __ZN23OZMaterialCompoundLayer12setUpTextureERN19OZMaterialLayerBase19LayeredMaterialInfoERK20LiTextureStoreTokenjjbRN8ProShade7SamplerERNS7_7UniformERK18OZTexturePlacement
//   @0x1fa610  setUpTexture(LayeredMaterialInfo&, LiTextureStoreToken const&, u32, u32, bool,
//                            ProShade::Sampler&, ProShade::Uniform&, bool, bool,
//                            PCMatrix44Tmpl<double> const&, ProShade::TextureTransformBasis)   [ovl]
//                __ZN23OZMaterialCompoundLayer12setUpTextureERN19OZMaterialLayerBase19LayeredMaterialInfoERK20LiTextureStoreTokenjjbRN8ProShade7SamplerERNS7_7UniformEbbRK14PCMatrix44TmplIdENS7_22TextureTransformBasisE
//   @0x1fa740  setUpSampler(LayeredMaterialInfo&, LiTextureStoreToken const&, ProShade::Sampler&,
//                            u32, u32, bool, double)
//                __ZN23OZMaterialCompoundLayer12setUpSamplerERN19OZMaterialLayerBase19LayeredMaterialInfoERK20LiTextureStoreTokenRN8ProShade7SamplerEjjbd
//   @0x1faa20  getAssetURL(NSDictionary*)
//                __ZN23OZMaterialCompoundLayer11getAssetURLEP12NSDictionary
//   @0x1faa40  createDiffuseGradientLayer(LayeredMaterialInfo&, CMTime const&,
//                                          OZChannelGradientWithTransform&)
//                __ZN23OZMaterialCompoundLayer26createDiffuseGradientLayerERN19OZMaterialLayerBase19LayeredMaterialInfoERK6CMTimeR31OZChannelGradientWithTransform
//   @0x1faed0  createDiffuseLayer(LayeredMaterialInfo&, CMTime const&, OZChannelColorNoAlpha*,
//                                  OZChannelColorNoAlpha*, double, NSDictionary*,
//                                  DiffuseMaterialLayer::BlendMode, bool, float, double)
//                __ZN23OZMaterialCompoundLayer18createDiffuseLayerERN19OZMaterialLayerBase19LayeredMaterialInfoERK6CMTimePK21OZChannelColorNoAlphaS7_dP12NSDictionaryNS_20DiffuseMaterialLayer9BlendModeEbfd
//   @0x1fbc60  getTextureTransform(LayeredMaterialInfo&, CMTime const&, float,
//                                   PCMatrix44Tmpl<double>&, ProShade::TextureTransformBasis&)
//                __ZN23OZMaterialCompoundLayer19getTextureTransformERN19OZMaterialLayerBase19LayeredMaterialInfoERK6CMTimefRN8ProShade22PCMatrix44TmplIdEENS4_22TextureTransformBasisE   [approx mangling — see nm]
//
// Source disassembly extractions (raw-port/re/disasm/):
//   OZMaterialCompoundLayer.OZMaterialCompoundLayer.s  — @0x1f97d0, 172 lines (primary ctor)
//   OZMaterialCompoundLayer.~OZMaterialCompoundLayer.s — @0x6db5a0, 5 lines (D0 body = `ud2`)
//
// VTABLE (resolve.py Ozone vtable OZMaterialCompoundLayer):
//   __ZTV23OZMaterialCompoundLayer @0x845428 ; installed primary ptr = table+0x10 = 0x845438
//   *0x00 -> 0x6db590 ~D1
//   *0x08 -> 0x6db5a0 ~D0 (`ud2`)
//   *0x10 -> 0x1fab0  OZFactoryBase::getIconName() const                (inherited)
//   *0x18 -> 0x1fad0  OZFactoryBase::getIconNameBW() const              (inherited)
//   *0x20 -> 0x1faf0  OZFactoryBase::getIconID() const                  (inherited)
//   *0x28 -> 0x1fb00  OZFactoryBase::getLibraryIconName() const         (inherited)
//   *0x30 -> 0x1fb20  OZFactoryBase::description()                      (inherited)
//   *0x38 -> 0x1fb40  OZChannelBase::getInstanceID() const              (inherited)
//   *0x40 -> 0x1fb50  OZChannelBase::getSerializer()                    (inherited)
//   *0x48 -> 0x1fb60  OZFactoryBase::getFactoryForSerialization(...)    (inherited)
//   *0x70 -> 0x1fb70  OZChannelBase::isObjectRef() const                (inherited)
//   *0x78 -> 0x1fb80  OZChannelBase::isCompoundChannel() const          (inherited)
//   *0xe0 -> 0x1fbd0  OZChannelBase::setRangeName(PCString const&)      (inherited)
//   *0xe8 -> 0x4ac2c0 OZMaterialLayerBase::copy(OZChannelBase const*, bool) (inherited)
//   Secondary vtable slice @ vtable+0x478 = 0x8458a0 (installed at this+0x10 by every ctor).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (fields TOUCHED by this chunk; full layout lives across chunks m0..m2)
// -----------------------------------------------------------------------------
// Ctor @0x1f97d0 installs vtables and constructs 5 sub-object channels in-place:
//
//   +0x000  vptr — primary   (installed = vtable+0x10 = 0x845438;
//                              ctor @0x1f97e9 `leaq 0x64bc48(%rip),%rax` +
//                                    @0x1f97f0 `movq %rax,(%rbx)`)
//   +0x010  vptr — secondary (installed = vtable+0x478 = 0x8458a0;
//                              ctor @0x1f97f3 `leaq 0x64c0a6(%rip),%rax` +
//                                    @0x1f97fa `movq %rax,0x10(%rbx)`)
//   +0x4c8  OZChannelScale                 — "Scale" sub-channel.
//                                              ctor @0x1f9847 (5-arg long-form OZChannelScale::C1
//                                                 name=PCString, folder=this, u1=0x64, u2=2, u3=2,
//                                                 impl=null, info=null); dtor @0x19ca39 vtable
//                                                 rewrite + OZChannel::D2 on +0x4c8.
//   +0x680  OZChannelPosition              — "Position" sub-channel.
//                                              ctor @0x1f989b (long-form C1: name, folder=this,
//                                                 u1=0x65, u2=2, u3=2, impl=null, info=null);
//                                              dtor @0x19ca2d.
//   +0x940  OZChannelAngle                 — "Angle" sub-channel.
//                                              ctor @0x1f989e→@0x1f98e9 (5-arg C2 long-form: name,
//                                                 folder=this, u1=0x66, u2=2, impl=null, info=null);
//                                              dtor @0x19ca21 via generic OZChannel::D2.
//   +0x9d8  OZChannelEnum                  — "Enum" sub-channel (subtype selector).
//                                              ctor @0x1f9955 (initialValue=0, PCString name,
//                                                 PCString displayName, folder=this, u1=0x67,
//                                                 u2=2, impl=null, info=null);
//                                              dtor @0x19ca15.
//   +0xad8  OZChannelMaterialMapTransform  — "MaterialMapTransform" sub-object.
//                                              ctor @0x1f999e (name, folder=this, u1=0xc8, u2=0, u3=0);
//                                              dtor @0x19ca09.
//                                              This is the SHARED-TRANSFORM sub-object that owns:
//                                                * flags (isAnySharedTransformEnabled reads bit
//                                                  0x400000 via OZChannelBase::testFlag @0x1fa029),
//                                                * `updateLocalTransformChannelsVisibility()` method
//                                                  (tail-called by our @0x1fa070),
//                                                * `setCurrentTransformValuesAsDefault()`   method
//                                                  (tail-called by our @0x1fa090).
//   +0xb58  OZChannel                      — "should-rotate-side / mapping-mode" enum-value channel.
//                                              accessed by getShouldRotateSide @0x1fa3fd `addq
//                                              $0xb58,%rdi` + OZChannel::getValueAsInt(kCMTimeZero),
//                                              and by getUseTriplanarMapping @0x1fa46d same pattern.
//                                              The dtor doesn't call D2 on it in our chunk — it is
//                                              destroyed by a later dtor call chain owned by m1/m2.
//
// Full layout (channels m1/m2 own) continues at +0xe58, +0xf58, +0x12a0, +0x1338, +0x1870, ...
// See parseEnd @0x1f9eb3-0x1f9f18 for the extended offsets. Those are declared here as anonymous
// "opaque field windows" so parseEnd (owned by this chunk) can reference them without lying about
// what's at each slot.
//
// -----------------------------------------------------------------------------
// CTOR TRANSCRIPTION NOTE (per PORTING_SPEC Rule 3)
// -----------------------------------------------------------------------------
// Each of the three C++ ctors is decoded field-by-field, but every sub-channel constructor
// (OZChannelScale::C1, OZChannelPosition::C1, OZChannelAngle::C2, OZChannelEnum::C1,
// OZChannelMaterialMapTransform::C1 and their copy overloads) is NOT yet transcribed on the TS
// side, so each ctor is exposed as a throwing factory (`constructWithFactory` /
// `constructNoFactory` / `constructCopy`) that cites @0xADDR of the C++ ctor and of the first
// undecoded sub-ctor. Field slots and vtable-install addresses ARE real — dtor / accessor
// transcriptions in this file use them directly.

// -----------------------------------------------------------------------------
// External hooks — declared as loud stubs (per PORTING_SPEC Rule 3).
// -----------------------------------------------------------------------------

/**
 * OZMaterialLayerBase — parent class, not yet transcribed.
 * @provenance Ozone stubs
 *   __ZN19OZMaterialLayerBaseC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj  (C2, ctor 5-arg)
 *   __ZN19OZMaterialLayerBaseC2EP9OZFactoryRK8PCStringj                     (C2, ctor 3-arg)
 *   __ZN19OZMaterialLayerBaseC2ERKS_P15OZChannelFolder                       (C2, copy)
 *   __ZN19OZMaterialLayerBaseD2Ev                                            (D2, dtor)
 *   __ZN19OZMaterialLayerBase8parseEndER22PCSerializerReadStream             (parseEnd)
 */
export interface OZMaterialLayerBaseLike {
  parseEnd(_s: unknown): number;
}

/**
 * OZChannelBase::testFlag(u64) — hot flag-test used by isAnySharedTransformEnabled.
 * @provenance Ozone stub @0x6df57c (`__ZNK13OZChannelBase8testFlagEy`)
 */
export interface OZChannelBaseLike {
  /** Returns non-zero when the flag bit is set. */
  testFlag(flag: bigint): boolean;
  /** getObjectManipulator() — used by getShouldRotateSide/getUseTriplanarMapping fallback. */
  getObjectManipulator(): unknown;
}

/**
 * OZChannel-family accessors used by this chunk.
 * @provenance Ozone stubs
 *   __ZNK9OZChannel13getValueAsIntERK6CMTimed         (stub @0x6dfa80)
 */
export interface OZChannelLike extends OZChannelBaseLike {
  /**
   * getValueAsInt(CMTime const&, double xmm0=0) — reads the channel value as an int at time t.
   * @provenance Ozone stub @0x6dfa80
   */
  getValueAsInt(_t: unknown, _xmm0: number): number;
}

/**
 * OZChannelMaterialMapTransform sub-object at +0xad8 — the shared-transform subsystem.
 * @provenance Ozone stubs
 *   __ZN29OZChannelMaterialMapTransform38updateLocalTransformChannelsVisibilityEv (@0x1fa07c tail-jmp)
 *   __ZN29OZChannelMaterialMapTransform34setCurrentTransformValuesAsDefaultEv     (@0x1fa09c tail-jmp)
 *   __ZN29OZChannelMaterialMapTransformC1ERK8PCStringP15OZChannelFolderjjj        (ctor)
 *   __ZN29OZChannelMaterialMapTransformC1ERKS_P15OZChannelFolder                   (copy ctor)
 *   __ZN29OZChannelMaterialMapTransformD2Ev                                        (dtor)
 */
export interface OZChannelMaterialMapTransformLike extends OZChannelBaseLike {
  /** @provenance Ozone stub-body not yet transcribed */
  updateLocalTransformChannelsVisibility(): void;
  /** @provenance Ozone stub-body not yet transcribed */
  setCurrentTransformValuesAsDefault(): void;
}

/** OZChannelScale sub-object at +0x4c8. @provenance Ozone stub OZChannelScale::C1 */
export interface OZChannelScaleLike extends OZChannelLike {}
/** OZChannelPosition sub-object at +0x680. @provenance Ozone stub OZChannelPosition::C1 */
export interface OZChannelPositionLike extends OZChannelLike {}
/** OZChannelAngle sub-object at +0x940. @provenance Ozone stub OZChannelAngle::C2 */
export interface OZChannelAngleLike extends OZChannelLike {}
/** OZChannelEnum sub-object at +0x9d8. @provenance Ozone stub OZChannelEnum::C1 */
export interface OZChannelEnumLike extends OZChannelLike {}

// PCSerializerReadStream — parseEnd input. Not modeled here.
export type PCSerializerReadStreamRef = { readonly __oz_serializer_read: true };

// CMTime — the standard AV time; opaque here (not our chunk to port).
export type CMTimeRef = { readonly __cm_time: true };

// OZTexturePlacement / LiTextureStoreToken / ProShade::* / PCMatrix44Tmpl<double> —
// opaque handles for the deferred setUp*/create* methods.
export type OZTexturePlacementRef = { readonly __oz_texture_placement: true };
export type LiTextureStoreTokenRef = { readonly __li_texture_store_token: true };
export type ProShadeSamplerRef = { readonly __proshade_sampler: true };
export type ProShadeUniformRef = { readonly __proshade_uniform: true };
export type ProShadeTextureTransformBasisRef = { readonly __proshade_texture_transform_basis: true };
export type PCMatrix44TmplDoubleRef = { readonly __pc_matrix44_double: true };
export type OZChannelGradientWithTransformRef = { readonly __oz_channel_gradient_with_transform: true };
export type OZChannelColorNoAlphaRef = { readonly __oz_channel_color_no_alpha: true };
export type LayeredMaterialInfoRef = { readonly __oz_layered_material_info: true };
export type DiffuseMaterialLayerBlendMode = number;

// -----------------------------------------------------------------------------
// The class.
// -----------------------------------------------------------------------------

/**
 * Address of the primary vptr slot stored at `this+0` by every ctor.
 * @provenance Ozone ctor @0x1f97e9 (`leaq 0x64bc48(%rip),%rax`); rip=0x1f97f0
 *   → 0x1f97f0 + 0x64bc48 = 0x845438 = &__ZTV23OZMaterialCompoundLayer+0x10.
 */
export const OZ_MCL_VPTR_PRIMARY = 0x845438;

/**
 * Address of the secondary vptr slot stored at `this+0x10` by every ctor.
 * @provenance Ozone ctor @0x1f97f3 (`leaq 0x64c0a6(%rip),%rax`); rip=0x1f97fa
 *   → 0x1f97fa + 0x64c0a6 = 0x8458a0 = &__ZTV23OZMaterialCompoundLayer+0x478.
 * Also referenced by dtor @0x19c9f8 as `vtable + 0x478`.
 */
export const OZ_MCL_VPTR_SECONDARY = 0x8458a0;

export class OZMaterialCompoundLayer {
  // --- Struct fields at their real byte offsets. -------------------------

  /** @provenance +0x000, ctor @0x1f97e9-@0x1f97f0 install (vtable+0x10) */
  vptrAt0x00: number = OZ_MCL_VPTR_PRIMARY;

  /** @provenance +0x010, ctor @0x1f97f3-@0x1f97fa install (vtable+0x478) */
  vptrAt0x10: number = OZ_MCL_VPTR_SECONDARY;

  /** @provenance +0x4c8, ctor @0x1f9847 OZChannelScale::C1 */
  channelScaleAt0x4c8!: OZChannelScaleLike;

  /** @provenance +0x680, ctor @0x1f989b OZChannelPosition::C1 */
  channelPositionAt0x680!: OZChannelPositionLike;

  /** @provenance +0x940, ctor @0x1f989e-@0x1f98e9 OZChannelAngle::C2 */
  channelAngleAt0x940!: OZChannelAngleLike;

  /** @provenance +0x9d8, ctor @0x1f9955 OZChannelEnum::C1 */
  channelEnumAt0x9d8!: OZChannelEnumLike;

  /** @provenance +0xad8, ctor @0x1f999e OZChannelMaterialMapTransform::C1 */
  channelMaterialMapTransformAt0xad8!: OZChannelMaterialMapTransformLike;

  /**
   * @provenance +0xb58, read by getShouldRotateSide @0x1fa3fd + getUseTriplanarMapping @0x1fa46d.
   *   This slot is the "map mode / should-rotate-side" enum channel — dtor for it lives in a
   *   sibling chunk (m1/m2).
   */
  channelAt0xb58!: OZChannelLike;

  /**
   * @provenance +0xe58, fallback OZChannel used by getShouldRotateSide/getUseTriplanarMapping
   *   when the +0xb58 read returns 0 AND getObjectManipulator returns null.
   *   Read at @0x1fa433 (`addq $0xe58,%r14`).
   */
  channelAt0xe58!: OZChannelLike;

  /**
   * base — the OZMaterialLayerBase sub-object. Not modeled with a real field because we don't
   * own the base class yet; consumers that call parseEnd() must set this reference.
   */
  base!: OZMaterialLayerBaseLike;

  // ------------------------------------------------------------------------
  // Constructors (throwing stubs per PORTING_SPEC Rule 3 — depend on
  // OZMaterialLayerBase::C2 + 5 sub-channel C1/C2 ctors which are not yet transcribed).
  // ------------------------------------------------------------------------

  /**
   * (OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int) — @Ozone 0x1f97d0.
   *
   * Body shape (from disasm/OZMaterialCompoundLayer.OZMaterialCompoundLayer.s, 172 lines):
   *
   *   @0x1f97e4  callq OZMaterialLayerBase::C2(factory, name, folder, u1, u2)
   *   @0x1f97e9  install primary vptr at this+0x00 = &vtable+0x10 (0x845438)
   *   @0x1f97f3  install secondary vptr at this+0x10 = &vtable+0x478 (0x8458a0)
   *   @0x1f9847  OZChannelScale::C1 at this+0x4c8
   *              (name=@"bad cfstring ref" → PCString::C1(CFStringRef, bundle, bundle) @0x1f9819,
   *               folder=this, u1=0x64, u2=2, u3=2, impl=null, info=null)
   *   @0x1f989b  OZChannelPosition::C1 at this+0x680
   *              (name=@"bad cfstring ref" via PCString @0x1f9869,
   *               folder=this, u1=0x65, u2=2, u3=2, impl=null, info=null)
   *   @0x1f98e9  OZChannelAngle::C2 at this+0x940
   *              (name via PCString @0x1f98bd, folder=this, u1=0x66, u2=2, impl=null, info=null)
   *   @0x1f9955  OZChannelEnum::C1 at this+0x9d8
   *              (initValue=0 (`xor esi,esi` @0x1f994a), name via PCString @0x1f990b, displayName
   *               via PCString @0x1f9924, folder=this, u1=0x67, u2=2, impl=null, info=null)
   *   @0x1f999e  OZChannelMaterialMapTransform::C1 at this+0xad8
   *              (name via PCString @0x1f9980, folder=this, u1=0xc8, u2=0, u3=0)
   *
   * The tail @0x1f99bb..@0x1f9a6f is the standard multi-level Itanium unwind cleanup — one
   * label per sub-object already constructed at the point of an exception, each calling the
   * matching Dx on the constructed prefix and then __Unwind_Resume.
   *
   * NOT YET TRANSCRIBED — depends on:
   *   __ZN19OZMaterialLayerBaseC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj
   *   __ZN14OZChannelScaleC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
   *   __ZN17OZChannelPositionC1ERK8PCStringP15OZChannelFolderjjjP13OZChannelImplP13OZChannelInfo
   *   __ZN14OZChannelAngleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
   *   __ZN13OZChannelEnumC1EjRK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
   *   __ZN29OZChannelMaterialMapTransformC1ERK8PCStringP15OZChannelFolderjjj
   *   __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
   *
   * @provenance Ozone @0x1f97d0
   */
  static constructWithFactory(
    _factory: unknown,
    _name: unknown,
    _folder: unknown,
    _u1: number,
    _u2: number,
  ): OZMaterialCompoundLayer {
    throw new Error(
      "OZMaterialCompoundLayer::OZMaterialCompoundLayer(OZFactory*, PCString const&, OZChannelFolder*, u32, u32) " +
        "@Ozone 0x1f97d0 not yet transcribed — 5 sub-channel ctors not ported " +
        "(OZChannelScale::C1 @0x1f9847, OZChannelPosition::C1 @0x1f989b, OZChannelAngle::C2 @0x1f98e9, " +
        "OZChannelEnum::C1 @0x1f9955, OZChannelMaterialMapTransform::C1 @0x1f999e).",
    );
  }

  /**
   * (OZFactory*, PCString const&, unsigned int) — @Ozone 0x1f9a80.
   *
   * No-folder variant. Same 5 sub-channel construction chain at the same offsets +0x4c8/+0x680/
   * +0x940/+0x9d8/+0xad8, with `folder = this` (each sub-channel is its own parent). Calls
   * OZMaterialLayerBase::C2 3-arg overload at @0x1f9a94.
   *
   * NOT YET TRANSCRIBED — same downstream ctor set as constructWithFactory.
   *
   * @provenance Ozone @0x1f9a80
   */
  static constructNoFolder(
    _factory: unknown,
    _name: unknown,
    _u: number,
  ): OZMaterialCompoundLayer {
    throw new Error(
      "OZMaterialCompoundLayer::OZMaterialCompoundLayer(OZFactory*, PCString const&, u32) " +
        "@Ozone 0x1f9a80 not yet transcribed — same 5 sub-channel ctors as the 5-arg form.",
    );
  }

  /**
   * (OZMaterialCompoundLayer const&, OZChannelFolder*) — @Ozone 0x1f9d30.
   *
   * Copy constructor (used by clone()). Body @0x1f9d30..@0x1f9e10:
   *
   *   @0x1f9d44  callq OZMaterialLayerBase::C2(const&, folder)
   *   @0x1f9d49  install primary vptr at this+0x00 = vtable+0x10 (0x845438)
   *   @0x1f9d53  install secondary vptr at this+0x10 = vtable+0x478 (0x8458a0)
   *   @0x1f9d73  OZChannelScale::C1(const&, folder=this)                   at this+0x4c8
   *   @0x1f9d91  OZChannelPosition::C1(const&, folder=this)                at this+0x680
   *   @0x1f9dab  OZChannel::C2(const&, folder=this)                        at this+0x940
   *              (NB: the copy path uses BASE OZChannel::C2 for +0x940, then rewrites the
   *               OZChannelAngle vptr at @0x1f9dbb `movq &__ZTV14OZChannelAngle+0x10,0x940(%rbx)`
   *               and its secondary vptr at 0x950; this is how FCP promotes the copy of a bare
   *               OZChannel into an OZChannelAngle without invoking the long-form ctor.)
   *   @0x1f9de4  OZChannelEnum::C1(const&, folder=this)                    at this+0x9d8
   *   @0x1f9dfd  OZChannelMaterialMapTransform::C1(const&, folder=this)    at this+0xad8
   *
   * NOT YET TRANSCRIBED — depends on OZChannelScale::C1(copy), OZChannelPosition::C1(copy),
   * OZChannel::C2(copy), OZChannelEnum::C1(copy), OZChannelMaterialMapTransform::C1(copy),
   * OZMaterialLayerBase::C2(copy).
   *
   * @provenance Ozone @0x1f9d30
   */
  static constructCopy(
    _other: OZMaterialCompoundLayer,
    _folder: unknown,
  ): OZMaterialCompoundLayer {
    throw new Error(
      "OZMaterialCompoundLayer::OZMaterialCompoundLayer(OZMaterialCompoundLayer const&, OZChannelFolder*) " +
        "@Ozone 0x1f9d30 not yet transcribed — copy overloads for 5 sub-channel ctors not ported.",
    );
  }

  // ------------------------------------------------------------------------
  // Destructors
  // ------------------------------------------------------------------------

  /**
   * ~OZMaterialCompoundLayer() [D2 body] — @Ozone 0x19c9e0.
   *
   * Body (~30 lines) — mirrors the ctor in reverse (see disasm/OZMaterialCompoundLayer.D2.s
   * extraction, and full listing in the head-of-file provenance block):
   *
   *   @0x19c9ea  install primary vptr at this+0x00   = vtable+0x10 = 0x845438
   *   @0x19c9f8  install secondary vptr at this+0x10 = vtable+0x478 = 0x8458a0
   *   @0x19ca02  OZChannelMaterialMapTransform::D2 at this+0xad8
   *   @0x19ca15  OZChannelEnum::D1                  at this+0x9d8
   *   @0x19ca1b  OZChannel::D2                      at this+0x940 (Angle promoted-to-base dtor)
   *   @0x19ca2d  OZChannelPosition::D1              at this+0x680
   *   @0x19ca39  install OZChannel2D vptr at this+0x4c8 = &__ZTV11OZChannel2D+0x10 (0x685e40+...)
   *              then OZChannel::D2 at this+0x5e8 and this+0x550, then OZCompoundChannel::D2
   *              at this+0x4c8. This is the two-vptr-slice unwind of a compound OZChannelScale
   *              slot (Scale multi-inherits from OZChannel2D + OZCompoundChannel).
   *   @0x19ca7f  jmp OZMaterialLayerBase::D2   [tail-call — no popq/ret after]
   *
   * NOT YET TRANSCRIBED — sub-channel dtors are the counterparts of the sub-channel ctors above.
   *
   * @provenance Ozone @0x19c9e0
   */
  destroy(): void {
    throw new Error(
      "OZMaterialCompoundLayer::~OZMaterialCompoundLayer() [D2 body] @Ozone 0x19c9e0 not yet " +
        "transcribed — depends on OZChannelMaterialMapTransform::D2, OZChannelEnum::D1, " +
        "OZChannel::D2, OZChannelPosition::D1, OZChannel2D vptr rewrite chain, " +
        "OZCompoundChannel::D2, and OZMaterialLayerBase::D2 (tail-call @0x19ca7f).",
    );
  }

  /**
   * ~OZMaterialCompoundLayer() [D1] — @Ozone 0x6db590.
   * ICF-folded onto the D2 body at 0x19c9e0 in most builds; nm reports two symbols at 0x6db590/0x6db5a0
   * but the callable-address IS the D2 body. Any caller resolving through the vtable slot 0x00
   * (=0x6db590) reaches the same code as `destroy()` above.
   *
   * @provenance Ozone @0x6db590 (D1 alias of D2 @0x19c9e0)
   */
  destroyD1(): void {
    // D1 shares the D2 body — dispatch through the one implementation.
    this.destroy();
  }

  /**
   * ~OZMaterialCompoundLayer() [D0 deleting] — @Ozone 0x6db5a0.
   *
   * Body @0x6db5a0..@0x6db5a6 is literally:
   *   pushq %rbp
   *   movq  %rsp, %rbp
   *   ud2
   *
   * `ud2` is the x86_64 undefined-opcode trap — Apple compiled the deleting-dtor as an
   * unreachable trap because OZMaterialCompoundLayer instances are NEVER heap-allocated by
   * `delete`. Any code path that reaches this vtable slot is a bug (mis-typed downcast + delete).
   *
   * @provenance Ozone @0x6db5a0
   */
  destroyD0Deleting(): never {
    // Direct transcription of `ud2`.
    throw new Error(
      "OZMaterialCompoundLayer::~OZMaterialCompoundLayer() [D0 deleting] @Ozone 0x6db5a0 is " +
        "compiled to `ud2` (undefined-opcode trap) — this slot is unreachable in a correct build. " +
        "Reaching it indicates a mis-typed downcast + delete on a stack/embedded instance.",
    );
  }

  // ------------------------------------------------------------------------
  // Real transcribed methods
  // ------------------------------------------------------------------------

  /**
   * getSequenceColorChannel() — @Ozone 0x19e7a0.
   *
   * Body (5 lines): `xorl %eax,%eax; ret` — always returns null.
   * (Overrides the base class's "sequence color channel" query; OZMaterialCompoundLayer chose
   * NOT to publish one at this level — subclasses like OZMaterialDistressLayer do publish
   * a channel at this hook.)
   *
   * @provenance Ozone @0x19e7a0
   */
  getSequenceColorChannel(): unknown {
    return null;
  }

  /**
   * getSequenceOpacityChannel() — @Ozone 0x19e7b0.
   * Body identical to getSequenceColorChannel: `xorl %eax,%eax; ret`.
   *
   * @provenance Ozone @0x19e7b0
   */
  getSequenceOpacityChannel(): unknown {
    return null;
  }

  /**
   * parseEnd(PCSerializerReadStream&) — @Ozone 0x1f9e70.
   *
   * Wraps OZMaterialLayerBase::parseEnd, then post-processes with a large decision tree that
   * touches offsets +0x4c8/+0x550/+0x5e8/+0x680/+0x940/+0x9d8/+0xad8/+0xb58/+0xe58/+0xf58/
   * +0x12a0/+0x1338/+0x1870 (via vtable slot *0xe8 = OZMaterialLayerBase::copy).
   *
   * Body @0x1f9e70..(returns %r14d) — the fast-path checks
   * `OZChannelBase::testFlag(this+0x4c8, 2)` (`testFlag` stub @0x6df57c). If SET, jumps to
   * @0x1f9fc9 and returns the base parseEnd result. Otherwise runs the LONG post-processing
   * chain — many indirect calls through per-channel vtable slot 0xe8 (`copy(...)`) and calls
   * to OZChannelBase::setFlag (stub @0x6dd914) with 0x1000.
   *
   * NOT YET TRANSCRIBED — depends on OZChannelBase::testFlag / setFlag, OZMaterialLayerBase::parseEnd,
   * and the vtable-slot-0xe8 (`OZChannelBase::copy`) calls on 5+ sibling sub-object slots.
   *
   * @provenance Ozone @0x1f9e70
   */
  parseEnd(_stream: PCSerializerReadStreamRef): number {
    throw new Error(
      "OZMaterialCompoundLayer::parseEnd(PCSerializerReadStream&) @Ozone 0x1f9e70 not yet " +
        "transcribed — depends on OZMaterialLayerBase::parseEnd (@0x1f9e81), OZChannelBase::testFlag " +
        "(stub @0x6df57c), and 5+ indirect vtable-*0xe8 calls (OZChannelBase::copy) plus " +
        "OZChannelBase::setFlag (stub @0x6dd914) with mask 0x1000.",
    );
  }

  /**
   * isAnySharedTransformEnabled() — @Ozone 0x1fa020.
   *
   * Two-step check on the MaterialMapTransform sub-object at +0xad8 (as an OZChannelBase) and
   * the +0xb58 channel:
   *
   *   @0x1fa029  addq $0xad8,%rdi                              ; rdi = &this->channelMaterialMapTransformAt0xad8
   *   @0x1fa030  movl $0x400000,%esi
   *   @0x1fa035  callq __ZNK13OZChannelBase8testFlagEy         ; testFlag(0x400000)
   *   @0x1fa03a  testb %al,%al
   *   @0x1fa03c  je   0x1fa047                                 ; when flag NOT set → check +0xb58
   *   @0x1fa03e  xorl %eax,%eax                                ; flag SET → return false
   *   @0x1fa046  ret
   *   @0x1fa047  addq $0xb58,%rbx                              ; rdi = &this->channelAt0xb58
   *   @0x1fa04e  movq _kCMTimeZero(%rip),%rsi                  ; time arg (CMTime const&)
   *   @0x1fa055  xorps %xmm0,%xmm0                             ; xmm0 = 0.0
   *   @0x1fa05b  callq __ZNK9OZChannel13getValueAsIntERK6CMTimed
   *   @0x1fa060  testl %eax,%eax
   *   @0x1fa062  setne %al                                     ; return (value != 0)
   *   @0x1fa06b  ret
   *
   * @provenance Ozone @0x1fa020
   */
  isAnySharedTransformEnabled(): boolean {
    // Step 1: if the MaterialMapTransform's 0x400000 flag is set, the shared transform is
    //          administratively OFF regardless of the +0xb58 channel value.
    // 0x400000n forces the value to a bigint (matching the u64 signature of OZChannelBase::testFlag).
    if (this.channelMaterialMapTransformAt0xad8.testFlag(0x400000n)) {
      return false;
    }
    // Step 2: consult the +0xb58 channel's value at kCMTimeZero. Any non-zero enum value → true.
    //          The second arg is the xmm0 double = 0.0 (see @0x1fa04e-@0x1fa058).
    const KCMTimeZero: unknown = null; // extern _kCMTimeZero — opaque pointer; second arg to getValueAsInt.
    const v = this.channelAt0xb58.getValueAsInt(KCMTimeZero, 0.0);
    return v !== 0;
  }

  /**
   * updateLocalTransformVisibility() — @Ozone 0x1fa070.
   *
   * Body (7 lines) — pure tail-jmp:
   *
   *   @0x1fa074  addq $0xad8, %rdi
   *   @0x1fa07c  jmp OZChannelMaterialMapTransform::updateLocalTransformChannelsVisibility()
   *
   * @provenance Ozone @0x1fa070
   */
  updateLocalTransformVisibility(): void {
    this.channelMaterialMapTransformAt0xad8.updateLocalTransformChannelsVisibility();
  }

  /**
   * setTransformValuesAsDefaults() — @Ozone 0x1fa090.
   *
   * Body (7 lines) — pure tail-jmp:
   *
   *   @0x1fa094  addq $0xad8, %rdi
   *   @0x1fa09c  jmp OZChannelMaterialMapTransform::setCurrentTransformValuesAsDefault()
   *
   * @provenance Ozone @0x1fa090
   */
  setTransformValuesAsDefaults(): void {
    this.channelMaterialMapTransformAt0xad8.setCurrentTransformValuesAsDefault();
  }

  /**
   * setSubtypeTags() — @Ozone 0x1fa0b0.
   *
   * Deep 280+ byte method — invokes an ObjC virtual (`callq *0x3b8(%rax)` @0x1fa0e2 on the
   * primary vtable) to fetch an Objc container of "subtype tag" descriptors, then loops
   * calling `[obj getInitialValue:...]` (ObjC selector at 0x62befa RIP-fixup) into two 16-byte
   * stack windows, forwarding into an internal decoder. Also reads _kCMTimeZero and the
   * `___stack_chk_guard` cookie.
   *
   * NOT YET TRANSCRIBED — depends on the primary vtable slot at 0x3b8 (subtype-descriptor getter),
   * the ObjC selector `getInitialValue:` on an unknown Objective-C receiver, and the internal
   * loop's element decoder (offsets @0x1fa10a onward through the tail).
   *
   * @provenance Ozone @0x1fa0b0
   */
  setSubtypeTags(): void {
    throw new Error(
      "OZMaterialCompoundLayer::setSubtypeTags() @Ozone 0x1fa0b0 not yet transcribed — depends " +
        "on vtable-slot-0x3b8 subtype-descriptor getter (called @0x1fa0e2) and ObjC selector " +
        "[receiver getInitialValue:] (dispatched via `callq *0x62befa(%rip)` @0x1fa128).",
    );
  }

  /**
   * getShouldRotateSide(CMTime const&) — @Ozone 0x1fa3f0.
   *
   *   @0x1fa3fd  addq $0xb58,%rdi                              ; rdi = &this->channelAt0xb58
   *   @0x1fa404  movq _kCMTimeZero(%rip),%rsi
   *   @0x1fa40b  xorps %xmm0,%xmm0                             ; xmm0 = 0.0
   *   @0x1fa40e  callq __ZNK9OZChannel13getValueAsIntERK6CMTimed
   *   @0x1fa413  testl %eax,%eax
   *   @0x1fa415  je    0x1fa433                                ; +0xb58 == 0 → path B
   *   ; PATH A (primary +0xb58 non-zero):
   *   @0x1fa417  callq __ZNK13OZChannelBase20getObjectManipulatorEv on `this`
   *   @0x1fa41f  leaq  -0x10(%rax),%r14
   *   @0x1fa423  testq %rax,%rax
   *   @0x1fa426  cmoveq %rax,%r14                              ; if getObjectManipulator()==null: %r14=null
   *   @0x1fa42a  addq  $0x950,%r14                             ; else rebase to (manip - 0x10) + 0x950
   *   @0x1fa431  jmp   0x1fa43a
   *   ; PATH B (primary +0xb58 zero):
   *   @0x1fa433  addq $0xe58,%r14                              ; rdi = &this->channelAt0xe58
   *   ; MERGE — read the selected channel with the same 3rd arg pattern (t, xmm0=0):
   *   @0x1fa43d  movq %r14,%rdi
   *   @0x1fa440  movq %rbx,%rsi                                ; t = original CMTime arg
   *   @0x1fa443  callq __ZNK9OZChannel13getValueAsIntERK6CMTimed
   *   @0x1fa448  testl %eax,%eax
   *   @0x1fa44a  sete %al                                       ; return (value == 0)
   *   @0x1fa451  ret
   *
   * @provenance Ozone @0x1fa3f0
   */
  getShouldRotateSide(t: CMTimeRef): boolean {
    // Step 1: read the +0xb58 map-mode channel at kCMTimeZero.
    const KCMTimeZero: unknown = null;
    const primary = this.channelAt0xb58.getValueAsInt(KCMTimeZero, 0.0);
    let selected: OZChannelLike;
    if (primary !== 0) {
      // PATH A — consult object-manipulator-derived channel at manipulator - 0x10 + 0x950.
      // The addr math we can't reconstruct exactly in TS without a real byte-addressed heap;
      // we model the "manipulator override" branch by asking the base to resolve its own manip.
      const manip = this.channelMaterialMapTransformAt0xad8.getObjectManipulator();
      if (manip == null) {
        // cmoveq @0x1fa426 selects null when getObjectManipulator() returns 0 — then
        // `addq $0x950, %r14` overflows a null pointer; in C++ that yields (0x950 as pointer),
        // whose subsequent OZChannel::getValueAsInt call is undefined behaviour in-binary. We
        // refuse to guess a defined behaviour here.
        throw new Error(
          "OZMaterialCompoundLayer::getShouldRotateSide @Ozone 0x1fa426 — " +
            "getObjectManipulator() returned null but the disasm still adds 0x950 to it, " +
            "yielding a synthetic pointer; not yet transcribed as a resolvable channel.",
        );
      }
      // "manipulator override" channel at manip-0x10+0x950 — not yet transcribed as a
      // structured lookup on the manipulator object.
      throw new Error(
        "OZMaterialCompoundLayer::getShouldRotateSide @Ozone 0x1fa41f-0x1fa42a — manipulator " +
          "override channel at (manip-0x10)+0x950 not yet transcribed — depends on " +
          "OZChannelBase::getObjectManipulator (stub @0x6df55e) and its owning object's layout.",
      );
      // (unreachable) return this.readSelectedChannel(selected, t) === 0;
    } else {
      // PATH B — the fallback channel at this+0xe58.
      selected = this.channelAt0xe58;
    }
    // MERGE — return (value == 0).
    return selected.getValueAsInt(t, 0.0) === 0;
  }

  /**
   * getUseTriplanarMapping(CMTime const&) — @Ozone 0x1fa460.
   *
   * Structurally identical to getShouldRotateSide but the MERGE tail returns `(value != 2)`
   * instead of `(value == 0)`. The +0xb58 gate and the manipulator-override / +0xe58 fallback
   * are unchanged.
   *
   *   @0x1fa4b8  cmpl $0x2, %eax
   *   @0x1fa4bb  setne %al                                     ; return (value != 2)
   *
   * @provenance Ozone @0x1fa460
   */
  getUseTriplanarMapping(t: CMTimeRef): boolean {
    const KCMTimeZero: unknown = null;
    const primary = this.channelAt0xb58.getValueAsInt(KCMTimeZero, 0.0);
    let selected: OZChannelLike;
    if (primary !== 0) {
      const manip = this.channelMaterialMapTransformAt0xad8.getObjectManipulator();
      if (manip == null) {
        throw new Error(
          "OZMaterialCompoundLayer::getUseTriplanarMapping @Ozone 0x1fa496 — " +
            "getObjectManipulator() returned null but disasm adds 0x950; not yet transcribed.",
        );
      }
      throw new Error(
        "OZMaterialCompoundLayer::getUseTriplanarMapping @Ozone 0x1fa48f-0x1fa4a1 — manipulator " +
          "override channel at (manip-0x10)+0x950 not yet transcribed — depends on " +
          "OZChannelBase::getObjectManipulator (stub @0x6df55e) and its owning object's layout.",
      );
    } else {
      selected = this.channelAt0xe58;
    }
    return selected.getValueAsInt(t, 0.0) !== 2;
  }

  /**
   * setUpTexture(...) [8-arg overload with OZTexturePlacement const&] — @Ozone 0x1fa4d0.
   *
   * Deep method (~350 bytes): builds a ProShade sampler/uniform pair for a texture placement
   * spec. Calls into ProShade::Sampler / ProShade::Uniform builder methods, LiTextureStore for
   * texture-store binding, and reads placement fields to configure texture-transform-basis.
   *
   * NOT YET TRANSCRIBED.
   *
   * @provenance Ozone @0x1fa4d0
   */
  setUpTextureWithPlacement(
    _info: LayeredMaterialInfoRef,
    _token: LiTextureStoreTokenRef,
    _u1: number,
    _u2: number,
    _flag: boolean,
    _sampler: ProShadeSamplerRef,
    _uniform: ProShadeUniformRef,
    _placement: OZTexturePlacementRef,
  ): void {
    throw new Error(
      "OZMaterialCompoundLayer::setUpTexture(LayeredMaterialInfo&, LiTextureStoreToken const&, " +
        "u32, u32, bool, ProShade::Sampler&, ProShade::Uniform&, OZTexturePlacement const&) " +
        "@Ozone 0x1fa4d0 not yet transcribed — depends on ProShade::Sampler / ProShade::Uniform " +
        "builder methods and LiTextureStore binding.",
    );
  }

  /**
   * setUpTexture(...) [11-arg overload with PCMatrix44Tmpl<double> + TextureTransformBasis] —
   * @Ozone 0x1fa610.
   *
   * The "matrix-form" of the overload above — takes an explicit texture transform matrix
   * (double 4x4) and basis mode instead of an OZTexturePlacement bundle. Same downstream
   * dependencies (ProShade::Sampler/Uniform, LiTextureStore).
   *
   * NOT YET TRANSCRIBED.
   *
   * @provenance Ozone @0x1fa610
   */
  setUpTextureWithMatrix(
    _info: LayeredMaterialInfoRef,
    _token: LiTextureStoreTokenRef,
    _u1: number,
    _u2: number,
    _flag: boolean,
    _sampler: ProShadeSamplerRef,
    _uniform: ProShadeUniformRef,
    _b1: boolean,
    _b2: boolean,
    _matrix: PCMatrix44TmplDoubleRef,
    _basis: ProShadeTextureTransformBasisRef,
  ): void {
    throw new Error(
      "OZMaterialCompoundLayer::setUpTexture(...11-arg matrix form) @Ozone 0x1fa610 not yet " +
        "transcribed — depends on ProShade::Sampler / ProShade::Uniform builders and " +
        "PCMatrix44Tmpl<double> conversion routines.",
    );
  }

  /**
   * setUpSampler(LayeredMaterialInfo&, LiTextureStoreToken const&, ProShade::Sampler&,
   *              u32, u32, bool, double) — @Ozone 0x1fa740.
   *
   * NOT YET TRANSCRIBED — configures a ProShade::Sampler for a given texture and a scalar
   * intensity/opacity.
   *
   * @provenance Ozone @0x1fa740
   */
  setUpSampler(
    _info: LayeredMaterialInfoRef,
    _token: LiTextureStoreTokenRef,
    _sampler: ProShadeSamplerRef,
    _u1: number,
    _u2: number,
    _flag: boolean,
    _d: number,
  ): void {
    throw new Error(
      "OZMaterialCompoundLayer::setUpSampler(...) @Ozone 0x1fa740 not yet transcribed — " +
        "depends on ProShade::Sampler builder methods.",
    );
  }

  /**
   * getAssetURL(NSDictionary*) — @Ozone 0x1faa20.
   *
   * ObjC method-dispatch to fetch an @"AssetURL" (or similar key) from the passed dictionary.
   * NOT YET TRANSCRIBED — depends on the ObjC selector table.
   *
   * @provenance Ozone @0x1faa20
   */
  getAssetURL(_dict: unknown): unknown {
    throw new Error(
      "OZMaterialCompoundLayer::getAssetURL(NSDictionary*) @Ozone 0x1faa20 not yet transcribed — " +
        "depends on ObjC selector table (Objc: objc_msgSend with an NSString key lookup).",
    );
  }

  /**
   * createDiffuseGradientLayer(LayeredMaterialInfo&, CMTime const&,
   *                             OZChannelGradientWithTransform&) — @Ozone 0x1faa40.
   *
   * NOT YET TRANSCRIBED — creates a DiffuseGradientMaterialLayer from an
   * OZChannelGradientWithTransform, wiring it into the LayeredMaterialInfo passed in.
   *
   * @provenance Ozone @0x1faa40
   */
  createDiffuseGradientLayer(
    _info: LayeredMaterialInfoRef,
    _t: CMTimeRef,
    _gradient: OZChannelGradientWithTransformRef,
  ): unknown {
    throw new Error(
      "OZMaterialCompoundLayer::createDiffuseGradientLayer(...) @Ozone 0x1faa40 not yet " +
        "transcribed — depends on DiffuseGradientMaterialLayer / LayeredMaterialInfo builder.",
    );
  }

  /**
   * createDiffuseLayer(LayeredMaterialInfo&, CMTime const&, OZChannelColorNoAlpha*,
   *                    OZChannelColorNoAlpha*, double, NSDictionary*,
   *                    DiffuseMaterialLayer::BlendMode, bool, float, double) — @Ozone 0x1faed0.
   *
   * NOT YET TRANSCRIBED — the primary diffuse-layer factory (largest method in this chunk at
   * ~3400 bytes). Configures a DiffuseMaterialLayer from two color channels, opacity, blend
   * mode, and a metadata dictionary; wires it into LayeredMaterialInfo.
   *
   * @provenance Ozone @0x1faed0
   */
  createDiffuseLayer(
    _info: LayeredMaterialInfoRef,
    _t: CMTimeRef,
    _color1: OZChannelColorNoAlphaRef | null,
    _color2: OZChannelColorNoAlphaRef | null,
    _opacity: number,
    _dict: unknown,
    _blend: DiffuseMaterialLayerBlendMode,
    _flag1: boolean,
    _f: number,
    _d: number,
  ): unknown {
    throw new Error(
      "OZMaterialCompoundLayer::createDiffuseLayer(...) @Ozone 0x1faed0 not yet transcribed — " +
        "depends on DiffuseMaterialLayer builder, LayeredMaterialInfo, and NSDictionary parsing.",
    );
  }

  /**
   * getTextureTransform(LayeredMaterialInfo&, CMTime const&, float, PCMatrix44Tmpl<double>&,
   *                     ProShade::TextureTransformBasis&) — @Ozone 0x1fbc60.
   *
   * Builds the texture-transform matrix (double 4x4) and basis mode for a given time/param,
   * writing them into the passed-by-ref matrix + basis outputs.
   *
   * NOT YET TRANSCRIBED — depends on PCMatrix44Tmpl<double> construction and the transform-basis
   * enum ranges.
   *
   * @provenance Ozone @0x1fbc60
   */
  getTextureTransform(
    _info: LayeredMaterialInfoRef,
    _t: CMTimeRef,
    _f: number,
    _outMatrix: PCMatrix44TmplDoubleRef,
    _outBasis: ProShadeTextureTransformBasisRef,
  ): void {
    throw new Error(
      "OZMaterialCompoundLayer::getTextureTransform(...) @Ozone 0x1fbc60 not yet transcribed — " +
        "depends on PCMatrix44Tmpl<double> construction and ProShade::TextureTransformBasis.",
    );
  }
}
