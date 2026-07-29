// OZMaterialFresnelLayer — FCP Ozone framework Fresnel material layer.
//
// A concrete OZMaterialLayerBase subclass that owns seven OZChannel* channels
// (color + six Fresnel scalars) and an embedded OZMaterialFresnelIF at +0x4c8.
// Faithful transcription from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// Symbols ported (nm -arch x86_64 | c++filt):
//   @0x34b7d0  OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZFactory*, PCString const&,
//              OZChannelFolder*, unsigned int, unsigned int)                              [C2]
//   @0x34bbf0  OZMaterialFresnelLayer::initFresnel()
//   @0x34bc80  OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZFactory*, ...)            [C1 → C2]
//   @0x34bc90  OZMaterialFresnelLayer::OZMaterialFresnelLayer(PCString const&,
//              OZChannelFolder*, unsigned int, unsigned int)                              [C2 no-factory]
//   @0x34c110  OZMaterialFresnelLayer::OZMaterialFresnelLayer(PCString const&, ...)       [C1 → C2 no-factory]
//   @0x34c120  OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZFactory*, PCString const&,
//              unsigned int)                                                              [C2 minimal]
//   @0x34c540  OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZFactory*, PCString const&,
//              unsigned int)                                                              [C1 → C2 minimal]
//   @0x34c550  OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZMaterialFresnelLayer const&,
//              OZChannelFolder*)                                                          [copy C2]
//   @0x34c6f0  OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZMaterialFresnelLayer const&, ...) [copy C1 → C2]
//   @0x34c700  OZMaterialFresnelLayer::~OZMaterialFresnelLayer()                           [D2]
//   @0x34c7f0  OZMaterialFresnelLayer::~OZMaterialFresnelLayer()                           [D1 → D2]
//   @0x34c810  OZMaterialFresnelLayer::~OZMaterialFresnelLayer()                           [D0 deleting]
//   @0x34c860  OZMaterialFresnelLayer::clone() const
//   @0x34c8a0  OZMaterialFresnelLayer::makeMaterialLayerSequenceChannelFolder()
//   @0x34c8f0  OZMaterialFresnelLayer::appendLayersToLayeredMaterial(LayeredMaterialInfo&)
//   @0x34c910  OZMaterialFresnelLayer::colorChannel()
//   @0x34c920  OZMaterialFresnelLayer::fresnelDiffuseIntensityChannel()
//   @0x34c930  OZMaterialFresnelLayer::fresnelSpecularIntensityChannel()
//   @0x34c940  OZMaterialFresnelLayer::fresnelSpecularShininessChannel()
//   @0x34c950  OZMaterialFresnelLayer::fresnelFaceForegroundChannel()
//   @0x34c960  OZMaterialFresnelLayer::fresnelEdgeForegroundChannel()
//   @0x34c970  OZMaterialFresnelLayer::fresnelExponentChannel()
//   @0x34c980  OZMaterialFresnelLayer::sequenceChannels()          → tail-call OZMaterialLayerBase::getSequenceChannels()
//   @0x34c990  OZMaterialFresnelLayer::objectManipulator()         → tail-call OZChannelBase::getObjectManipulator() const
//
// DECODE (raw-port/re/disasm/):
//   OZMaterialFresnelLayer.initFresnel.s                             (@0x34bbf0, 31 lines)
//   OZMaterialFresnelLayer.OZMaterialFresnelLayer.s                  (@0x34bc80, 6 lines — jmp thunk)
//   OZMaterialFresnelLayer.C2-full.s (extracted via awk)              (@0x34b7d0, 241 lines — real body)
//   OZMaterialFresnelLayer.clone.s                                    (@0x34c860, 24 lines)
//   OZMaterialFresnelLayer.makeMaterialLayerSequenceChannelFolder.s   (@0x34c8a0, 28 lines)
//   OZMaterialFresnelLayer.appendLayersToLayeredMaterial.s            (@0x34c8f0, 7 lines — tail-call)
//   OZMaterialFresnelLayer.colorChannel.s                             (@0x34c910, +0x4d0)
//   OZMaterialFresnelLayer.fresnelDiffuseIntensityChannel.s           (@0x34c920, +0x8c0)
//   OZMaterialFresnelLayer.fresnelSpecularIntensityChannel.s          (@0x34c930, +0x958)
//   OZMaterialFresnelLayer.fresnelSpecularShininessChannel.s          (@0x34c940, +0x9f0)
//   OZMaterialFresnelLayer.fresnelFaceForegroundChannel.s             (@0x34c950, +0xa88)
//   OZMaterialFresnelLayer.fresnelEdgeForegroundChannel.s             (@0x34c960, +0xb20)
//   OZMaterialFresnelLayer.fresnelExponentChannel.s                   (@0x34c970, +0xbb8)
//   OZMaterialFresnelLayer.sequenceChannels.s                         (@0x34c980)
//   OZMaterialFresnelLayer.objectManipulator.s                        (@0x34c990)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from ctor @0x34b7d0 and every accessor above)
// -----------------------------------------------------------------------------
// sizeof(OZMaterialFresnelLayer) = 0xc50 bytes  (from clone @0x34c86a `movl $0xc50,%edi`).
//
//   +0x000  vptr                                — primary vptr (leaq 0x505738(%rip) @0x34b7e9,
//                                                 then movq %rax,(%rbx)); points into __ZTV22OZMaterialFresnelLayer.
//   +0x010  vptr                                — secondary vptr (leaq 0x505b16(%rip) @0x34b7f3,
//                                                 movq %rax,0x10(%rbx)); PCShared_base sub-object slice.
//   +0x018  u32                                — flags/id (`movl 0x18(%r14),%ecx` @0x34c8b7 —
//                                                 read at makeMaterialLayerSequenceChannelFolder,
//                                                 forwarded as u32 arg #4 to the OZMaterialFresnelLayerSequenceFolder ctor).
//   +0x020  PCString  name                     — the material-layer name (@0x34c8bb `addq $0x20,%r14`
//                                                 → passed as `PCString const&` arg to the Sequence-
//                                                 Folder ctor). Same offset touched by the base
//                                                 OZMaterialLayerBase ctor at @0x34b7e4.
//   +0x4c8  vptr → OZMaterialFresnelIF vtable  — embedded OZMaterialFresnelIF sub-object (leaq
//                                                 0x505b63(%rip) @0x34b7fe, movq %rax,0x4c8(%rbx)).
//                                                 appendLayersToLayeredMaterial passes `this+0x4c8`
//                                                 as the OZMaterialFresnelIF* to AppendFresnelLayerToLayeredMaterial().
//   +0x4d0  OZChannelColorNoAlpha   colorChannel                     — ctor at @0x34b855 (see below).
//   +0x8c0  OZChannelPercent        fresnelDiffuseIntensityChannel   — ctor at @0x34b8b0.
//   +0x958  OZChannelPercent        fresnelSpecularIntensityChannel  — ctor at @0x34b905.
//   +0x9f0  OZChannelPercent        fresnelSpecularShininessChannel  — ctor at @0x34b95d (see initFresnel too).
//   +0xa88  OZChannelPercent        fresnelFaceForegroundChannel     — ctor at @0x34b9b0-ish (per D2 dtor slot).
//   +0xb20  OZChannelPercent        fresnelEdgeForegroundChannel     — ctor at @0x34ba0X (per D2 dtor slot).
//   +0xbb8  OZChannel               fresnelExponentChannel           — ctor + OZChannelD2 in D2 (bare OZChannel).
//   +0xc50  (end)
//
// The dtor @0x34c700 confirms every offset above by calling OZChannelPercent::D1 on +0x8c0/+0x958/
// +0x9f0/+0xa88/+0xb20, OZChannel::D2 on +0xbb8, and OZChannelColorNoAlpha's vtable-install +
// D-chain on +0x4d0 (leaq/movq @0x34c77c reads __ZTV21OZChannelColorNoAlpha from the got).
//
// -----------------------------------------------------------------------------
// CHANNEL DEFAULTS AND initFresnel() — decoded constants
// -----------------------------------------------------------------------------
// initFresnel @0x34bbf0 first calls OZMaterialLayerBase::initBase() @0x34bbfa, then reconfigures
// the numeric channel ranges (only the min/max/default/slider-max — NO curve/keyframe math):
//
//   channel                                 offset  method             value  data-addr  addr-of-call
//   fresnelDiffuseIntensityChannel          +0x8c0  setMax(d)          1e6    0x707a60   @0x34bc0e
//   fresnelSpecularIntensityChannel         +0x958  setMax(d)          1e6    0x707a60   @0x34bc22
//   fresnelSpecularShininessChannel         +0x9f0  setDefaultValue(d) 0.5    0x706ea8   @0x34bc39
//   fresnelSpecularShininessChannel         +0x9f0  setMax(d)          1.0    0x7053e0   @0x34bc49
//   fresnelSpecularShininessChannel         +0x9f0  setSliderMax(d)    1.0    0x7053e0   @0x34bc59
//   fresnelExponentChannel                  +0xbb8  setSliderMax(d)   10.0    0x707ae0   @0x34bc74 (tail jmp)
//
// Constants read via `resolve.py Ozone const 0x707a60|0x706ea8|0x7053e0|0x707ae0`:
//   0x707a60 → double = 1e6                (u64 = 0x412e848000000000)
//   0x706ea8 → double = 0.5                (u64 = 0x3fe0000000000000)
//   0x7053e0 → double = 1.0                (u64 = 0x3ff0000000000000)
//   0x707ae0 → double = 10.0               (u64 = 0x4024000000000000)
//
// -----------------------------------------------------------------------------
// CTOR TRANSCRIPTION NOTE
// -----------------------------------------------------------------------------
// The primary ctor @0x34b7d0 is fully decoded and reads as: call OZMaterialLayerBase::C2, install
// vtable ptrs at +0x00/+0x10/+0x4c8, then in-place construct all seven OZChannel* members at their
// fixed offsets (each preceded by a PCString(CFStringRef, bundle, bundle) load for the channel
// display name). Those channel ctors (OZChannelColorNoAlpha::C1, OZChannelPercent::C1 with the
// long signature, OZChannel::C1) are NOT yet transcribed on the TS side, so per PORTING_SPEC.md
// Rule 3 the ctor is exposed as a throwing stub citing @0x34b7d0. Everything downstream that this
// port DOES cover (initFresnel, clone, appendLayers, makeSequenceFolder, and the seven accessors +
// two forwarders) is a real transcription that runs on a real instance once the ctor lands.

// -----------------------------------------------------------------------------
// External hooks (not yet transcribed — declared as throwing stubs).
// -----------------------------------------------------------------------------

/** OZMaterialLayerBase — parent class, not yet transcribed as a whole. */
export interface OZMaterialLayerBaseLike {
  /** Called by initFresnel at @0x34bbfa (`callq OZMaterialLayerBase::initBase()`). */
  initBase(): void;
  /**
   * sequenceChannels() tail-calls this at Ozone @0x34c985.
   * Returns the base-class "sequence channels" list.
   */
  getSequenceChannels(): unknown;
}

/**
 * OZChannel-family hooks used by this class. Each setter is a real method on the corresponding
 * OZChannel subclass in the FCP binary; the exact call targets are listed in the DECODE section
 * above. We surface a minimal duck-typed interface so this file can be code-reviewed without
 * requiring OZChannel/OZChannelPercent/OZChannelColorNoAlpha to be fully ported first.
 *
 * @provenance the Ozone stubs
 *   __ZN9OZChannel6setMaxEd            (stub @0x6df432)
 *   __ZN9OZChannel12setSliderMaxEd     (stub @0x6df2b2)
 *   __ZN9OZChannel15setDefaultValueEd  (stub @0x6df306)
 *   __ZNK13OZChannelBase20getObjectManipulatorEv (stub @0x6df55e)
 */
export interface OZChannelLike {
  setMax(v: number): void;
  setSliderMax(v: number): void;
  setDefaultValue(v: number): void;
}

/**
 * OZMaterialFresnelIF sub-object at +0x4c8. Ported separately in
 * ./OZMaterialFresnelIF.ts (@0x34ca50 getSequenceColorChannelIF).
 */
export interface OZMaterialFresnelIFRef { readonly __oz_fresnel_if: true }

/**
 * External free function called by appendLayersToLayeredMaterial at @0x34c8fc (tail-jmp).
 *
 * @provenance Ozone symbol
 *   `AppendFresnelLayerToLayeredMaterial(OZMaterialFresnelIF*, OZMaterialLayerBase::LayeredMaterialInfo&)`
 *   __Z35AppendFresnelLayerToLayeredMaterialP19OZMaterialFresnelIFRN19OZMaterialLayerBase19LayeredMaterialInfoE
 * Not yet transcribed — this is the free function the D2 tail-jmp targets.
 */
export function AppendFresnelLayerToLayeredMaterial(
  _fresnelIf: OZMaterialFresnelIFRef,
  _info: unknown,
): void {
  throw new Error(
    "AppendFresnelLayerToLayeredMaterial @Ozone (symbol " +
      "_Z35AppendFresnelLayerToLayeredMaterialP19OZMaterialFresnelIFRN19OZMaterialLayerBase19LayeredMaterialInfoE" +
      ") not yet transcribed — called from OZMaterialFresnelLayer::appendLayersToLayeredMaterial @0x34c8fc",
  );
}

/**
 * External constructor called by makeMaterialLayerSequenceChannelFolder at @0x34c8cd.
 * Not yet transcribed as its own class.
 *
 * @provenance Ozone symbol
 *   `OZMaterialFresnelLayerSequenceFolder::OZMaterialFresnelLayerSequenceFolder(PCString const&,
 *      OZChannelFolder*, unsigned int, unsigned int, unsigned int)`
 *   __ZN36OZMaterialFresnelLayerSequenceFolderC1ERK8PCStringP15OZChannelFolderjjj
 */
export class OZMaterialFresnelLayerSequenceFolder {
  constructor(
    _name: unknown,
    _folder: unknown,
    _a: number,
    _b: number,
    _c: number,
  ) {
    throw new Error(
      "OZMaterialFresnelLayerSequenceFolder ctor (symbol " +
        "_ZN36OZMaterialFresnelLayerSequenceFolderC1ERK8PCStringP15OZChannelFolderjjj" +
        ") not yet transcribed — called from OZMaterialFresnelLayer::makeMaterialLayerSequenceChannelFolder @0x34c8cd",
    );
  }
}

// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------

/**
 * OZMaterialFresnelLayer — concrete Fresnel-shaded material layer in Ozone.
 *
 * Owns seven OZChannel* members (one color + six scalars) at fixed byte offsets
 * that match the FCP binary layout. Extends OZMaterialLayerBase (base subobject
 * starts at offset 0); embeds an OZMaterialFresnelIF at +0x4c8.
 *
 * @provenance Ozone @0x34b7d0..@0x34c99a
 */
export class OZMaterialFresnelLayer {
  // --- Struct fields (offsets recovered from ctor + accessors + dtor). -----

  /** @provenance +0x018, `movl 0x18(%r14),%ecx` @0x34c8b7 */
  flagsAt0x18: number = 0;

  /** @provenance +0x020, base name (used as PCString name arg to Sequence-Folder ctor) */
  nameAt0x20: unknown = null;

  /** OZMaterialFresnelIF sub-object @+0x4c8. @provenance ctor @0x34b7fe */
  fresnelIfAt0x4c8!: OZMaterialFresnelIFRef;

  /** @provenance accessor @0x34c910 `leaq 0x4d0(%rdi),%rax`; ctor @0x34b855 (OZChannelColorNoAlpha::C1) */
  colorChannelAt0x4d0!: OZChannelLike;

  /** @provenance accessor @0x34c920 `leaq 0x8c0(%rdi),%rax`; ctor @0x34b8b0 (OZChannelPercent::C1) */
  fresnelDiffuseIntensityChannelAt0x8c0!: OZChannelLike;

  /** @provenance accessor @0x34c930 `leaq 0x958(%rdi),%rax`; ctor @0x34b905 (OZChannelPercent::C1) */
  fresnelSpecularIntensityChannelAt0x958!: OZChannelLike;

  /** @provenance accessor @0x34c940 `leaq 0x9f0(%rdi),%rax` */
  fresnelSpecularShininessChannelAt0x9f0!: OZChannelLike;

  /** @provenance accessor @0x34c950 `leaq 0xa88(%rdi),%rax` */
  fresnelFaceForegroundChannelAt0xa88!: OZChannelLike;

  /** @provenance accessor @0x34c960 `leaq 0xb20(%rdi),%rax` */
  fresnelEdgeForegroundChannelAt0xb20!: OZChannelLike;

  /** @provenance accessor @0x34c970 `leaq 0xbb8(%rdi),%rax` (bare OZChannel, not OZChannelPercent) */
  fresnelExponentChannelAt0xbb8!: OZChannelLike;

  /**
   * base — the OZMaterialLayerBase sub-object. Not modeled with a real field because we don't
   * own the base class yet; consumers that call sequenceChannels() must set this reference.
   */
  base!: OZMaterialLayerBaseLike;

  // ------------------------------------------------------------------------
  // Constructors
  // ------------------------------------------------------------------------

  /**
   * Primary ctor — @Ozone 0x34b7d0.
   *
   * (OZFactory*, PCString const&, OZChannelFolder*, unsigned int, unsigned int)
   *
   * Body (`raw-port/re/disasm` extracted from tV.txt, 241 lines):
   *
   *   0x34b7e4  callq OZMaterialLayerBase::OZMaterialLayerBase(factory, name, folder, u1, u2)
   *   0x34b7e9  movq &__ZTV22OZMaterialFresnelLayer+0x18, (%rbx)         // primary vptr
   *   0x34b7f3  movq &__ZTV22OZMaterialFresnelLayer+0x??, 0x10(%rbx)      // secondary vptr (PCShared)
   *   0x34b7fe  movq &__ZTV19OZMaterialFresnelIF+0x??, 0x4c8(%rbx)        // OZMaterialFresnelIF vptr
   *   0x34b81b  build PCString name for +0x4d0 channel (CFStringRef @0x54bd0e)
   *   0x34b855  OZChannelColorNoAlpha::OZChannelColorNoAlpha(0.0, 0.0, 0.0, name, this, 0x64, 0, 5)
   *   ... six more channels constructed at +0x8c0 / +0x958 / +0x9f0 / +0xa88 / +0xb20 / +0xbb8 ...
   *
   * NOT YET TRANSCRIBED — depends on OZMaterialLayerBase::C2, OZChannelColorNoAlpha::C1,
   * OZChannelPercent::C1 (5-arg form), OZChannel::C1, and PCString::C1(CFStringRef,CFBundle,CFBundle).
   *
   * @provenance Ozone @0x34b7d0
   */
  static constructWithFactory(
    _factory: unknown,
    _name: unknown,
    _folder: unknown,
    _u1: number,
    _u2: number,
  ): OZMaterialFresnelLayer {
    throw new Error(
      "OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZFactory*, PCString const&, OZChannelFolder*, u32, u32) " +
        "@Ozone 0x34b7d0 not yet transcribed — 7 OZChannel* subobject ctors not yet ported " +
        "(OZChannelColorNoAlpha::C1 @0x34b855, OZChannelPercent::C1 x5, OZChannel::C1 @+0xbb8)",
    );
  }

  /**
   * (PCString const&, OZChannelFolder*, unsigned int, unsigned int) — @Ozone 0x34bc90.
   * No-factory variant (same body shape as the primary ctor but the OZMaterialLayerBase base
   * ctor is the no-factory overload).
   *
   * @provenance Ozone @0x34bc90
   */
  static constructNoFactory(
    _name: unknown,
    _folder: unknown,
    _u1: number,
    _u2: number,
  ): OZMaterialFresnelLayer {
    throw new Error(
      "OZMaterialFresnelLayer::OZMaterialFresnelLayer(PCString const&, OZChannelFolder*, u32, u32) " +
        "@Ozone 0x34bc90 not yet transcribed — same 7 subobject ctors as the primary form.",
    );
  }

  /**
   * (OZFactory*, PCString const&, unsigned int) — @Ozone 0x34c120.
   * Minimal ctor: no OZChannelFolder, single u32 arg.
   *
   * @provenance Ozone @0x34c120
   */
  static constructMinimal(
    _factory: unknown,
    _name: unknown,
    _u: number,
  ): OZMaterialFresnelLayer {
    throw new Error(
      "OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZFactory*, PCString const&, u32) " +
        "@Ozone 0x34c120 not yet transcribed — depends on the same subobject ctor chain.",
    );
  }

  /**
   * (OZMaterialFresnelLayer const&, OZChannelFolder*) — @Ozone 0x34c550.
   * Copy constructor (used by clone). NOT YET TRANSCRIBED — depends on
   * OZChannelColorNoAlpha::C1(const&,...) and OZChannelPercent::C1(const&,...) copy overloads.
   *
   * @provenance Ozone @0x34c550
   */
  static constructCopy(
    _other: OZMaterialFresnelLayer,
    _folder: unknown,
  ): OZMaterialFresnelLayer {
    throw new Error(
      "OZMaterialFresnelLayer::OZMaterialFresnelLayer(OZMaterialFresnelLayer const&, OZChannelFolder*) " +
        "@Ozone 0x34c550 not yet transcribed — copy-ctors for 7 OZChannel* subobjects not ported.",
    );
  }

  // ------------------------------------------------------------------------
  // Real transcribed methods
  // ------------------------------------------------------------------------

  /**
   * initFresnel() — @Ozone 0x34bbf0.
   *
   *   0x34bbfa  callq OZMaterialLayerBase::initBase()                       // via base subobject
   *   0x34bbff-0x34bc13  fresnelDiffuseIntensityChannel[+0x8c0].setMax(1e6)
   *   0x34bc13-0x34bc27  fresnelSpecularIntensityChannel[+0x958].setMax(1e6)
   *   0x34bc27-0x34bc3e  fresnelSpecularShininessChannel[+0x9f0].setDefaultValue(0.5)
   *   0x34bc3e-0x34bc4e  fresnelSpecularShininessChannel[+0x9f0].setMax(1.0)
   *   0x34bc4e-0x34bc5e  fresnelSpecularShininessChannel[+0x9f0].setSliderMax(1.0)
   *   0x34bc5e-0x34bc74  fresnelExponentChannel[+0xbb8].setSliderMax(10.0)  // tail-jmp to the stub
   *
   * The three literal doubles (1e6, 0.5, 1.0, 10.0) were resolved via
   * `resolve.py Ozone const 0x707a60|0x706ea8|0x7053e0|0x707ae0` — see the DECODE table above.
   * No other side-effects: initFresnel touches ONLY those four fields on those three channels.
   *
   * @provenance Ozone @0x34bbf0
   */
  initFresnel(): void {
    this.base.initBase(); // @0x34bbfa
    this.fresnelDiffuseIntensityChannelAt0x8c0.setMax(1e6); // @0x34bc0e, data @0x707a60
    this.fresnelSpecularIntensityChannelAt0x958.setMax(1e6); // @0x34bc22, data @0x707a60
    this.fresnelSpecularShininessChannelAt0x9f0.setDefaultValue(0.5); // @0x34bc39, data @0x706ea8
    this.fresnelSpecularShininessChannelAt0x9f0.setMax(1.0); // @0x34bc49, data @0x7053e0
    this.fresnelSpecularShininessChannelAt0x9f0.setSliderMax(1.0); // @0x34bc59, data @0x7053e0
    this.fresnelExponentChannelAt0xbb8.setSliderMax(10.0); // @0x34bc74 (tail-jmp), data @0x707ae0
  }

  /**
   * clone() const — @Ozone 0x34c860.
   *
   *   0x34c86a  movl $0xc50, %edi                             // sizeof(OZMaterialFresnelLayer)
   *   0x34c86f  callq operator new(0xc50)                      // __Znwm stub
   *   0x34c87f  callq OZMaterialFresnelLayer::OZMaterialFresnelLayer(*this, nullptr)  // copy-ctor
   *   0x34c884  movq %rbx, %rax                                // return the new pointer
   *
   * @provenance Ozone @0x34c860
   */
  clone(): OZMaterialFresnelLayer {
    // sizeof = 0xc50 — allocated by `operator new(0xc50)` @0x34c86a.
    // Copy-ctor gets folder = nullptr (`xorl %edx, %edx` @0x34c87d).
    return OZMaterialFresnelLayer.constructCopy(this, null);
  }

  /**
   * makeMaterialLayerSequenceChannelFolder() — @Ozone 0x34c8a0.
   *
   *   0x34c8aa  movl $0x800, %edi                              // sizeof(OZMaterialFresnelLayerSequenceFolder)
   *   0x34c8af  callq operator new(0x800)
   *   0x34c8b7  movl 0x18(%r14), %ecx                          // ecx = this->flagsAt0x18 (arg #4)
   *   0x34c8bb  addq $0x20, %r14                               // rsi = &this->nameAt0x20 (arg #2)
   *   0x34c8cd  callq OZMaterialFresnelLayerSequenceFolder(this->nameAt0x20, nullptr, this->flagsAt0x18, 0, 0)
   *
   * @provenance Ozone @0x34c8a0
   */
  makeMaterialLayerSequenceChannelFolder(): OZMaterialFresnelLayerSequenceFolder {
    // sizeof(OZMaterialFresnelLayerSequenceFolder) = 0x800 bytes (`movl $0x800,%edi` @0x34c8aa).
    return new OZMaterialFresnelLayerSequenceFolder(
      this.nameAt0x20, // rsi @0x34c8c2 (from `addq $0x20,%r14`)
      null, // rdx = 0    @0x34c8c5 (`xorl %edx,%edx`)
      this.flagsAt0x18, // ecx = *(u32)(this+0x18)  @0x34c8b7
      0, // r8d = 0   @0x34c8c7
      0, // r9d = 0   @0x34c8ca
    );
  }

  /**
   * appendLayersToLayeredMaterial(LayeredMaterialInfo&) — @Ozone 0x34c8f0.
   *
   *   0x34c8f4  addq $0x4c8, %rdi                              // rdi = &this->fresnelIfAt0x4c8
   *   0x34c8fc  jmp AppendFresnelLayerToLayeredMaterial(fresnelIf, info)  // tail-call
   *
   * @provenance Ozone @0x34c8f0
   */
  appendLayersToLayeredMaterial(info: unknown): void {
    // Tail-jmp to the free function; pass the embedded OZMaterialFresnelIF sub-object as arg 1.
    AppendFresnelLayerToLayeredMaterial(this.fresnelIfAt0x4c8, info);
  }

  /**
   * colorChannel() — @Ozone 0x34c910. `leaq 0x4d0(%rdi), %rax`
   * @provenance Ozone @0x34c914
   */
  colorChannel(): OZChannelLike {
    return this.colorChannelAt0x4d0;
  }

  /**
   * fresnelDiffuseIntensityChannel() — @Ozone 0x34c920. `leaq 0x8c0(%rdi), %rax`
   * @provenance Ozone @0x34c924
   */
  fresnelDiffuseIntensityChannel(): OZChannelLike {
    return this.fresnelDiffuseIntensityChannelAt0x8c0;
  }

  /**
   * fresnelSpecularIntensityChannel() — @Ozone 0x34c930. `leaq 0x958(%rdi), %rax`
   * @provenance Ozone @0x34c934
   */
  fresnelSpecularIntensityChannel(): OZChannelLike {
    return this.fresnelSpecularIntensityChannelAt0x958;
  }

  /**
   * fresnelSpecularShininessChannel() — @Ozone 0x34c940. `leaq 0x9f0(%rdi), %rax`
   * @provenance Ozone @0x34c944
   */
  fresnelSpecularShininessChannel(): OZChannelLike {
    return this.fresnelSpecularShininessChannelAt0x9f0;
  }

  /**
   * fresnelFaceForegroundChannel() — @Ozone 0x34c950. `leaq 0xa88(%rdi), %rax`
   * @provenance Ozone @0x34c954
   */
  fresnelFaceForegroundChannel(): OZChannelLike {
    return this.fresnelFaceForegroundChannelAt0xa88;
  }

  /**
   * fresnelEdgeForegroundChannel() — @Ozone 0x34c960. `leaq 0xb20(%rdi), %rax`
   * @provenance Ozone @0x34c964
   */
  fresnelEdgeForegroundChannel(): OZChannelLike {
    return this.fresnelEdgeForegroundChannelAt0xb20;
  }

  /**
   * fresnelExponentChannel() — @Ozone 0x34c970. `leaq 0xbb8(%rdi), %rax`
   * @provenance Ozone @0x34c974
   */
  fresnelExponentChannel(): OZChannelLike {
    return this.fresnelExponentChannelAt0xbb8;
  }

  /**
   * sequenceChannels() — @Ozone 0x34c980. Tail-jmp to OZMaterialLayerBase::getSequenceChannels().
   * @provenance Ozone @0x34c985
   */
  sequenceChannels(): unknown {
    return this.base.getSequenceChannels();
  }

  /**
   * objectManipulator() — @Ozone 0x34c990. Tail-jmp to OZChannelBase::getObjectManipulator() const
   * on `this`. In the binary the call target is the exported __stub @0x6df55e
   * (`__ZNK13OZChannelBase20getObjectManipulatorEv`); the argument is the OZMaterialFresnelLayer*
   * itself (%rdi unchanged), because the class multi-inherits OZChannelBase at offset 0.
   *
   * NOT YET TRANSCRIBED — OZChannelBase::getObjectManipulator is not ported.
   *
   * @provenance Ozone @0x34c995 (tail-jmp to __stub 0x6df55e)
   */
  objectManipulator(): unknown {
    throw new Error(
      "OZChannelBase::getObjectManipulator() const (stub @Ozone 0x6df55e, " +
        "__ZNK13OZChannelBase20getObjectManipulatorEv) not yet transcribed — " +
        "tail-called from OZMaterialFresnelLayer::objectManipulator @0x34c995",
    );
  }
}
