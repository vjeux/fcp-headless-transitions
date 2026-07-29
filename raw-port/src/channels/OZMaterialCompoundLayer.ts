// raw-port/src/channels/OZMaterialCompoundLayer.ts
//
// FCP `OZMaterialCompoundLayer` — Ozone compound material layer that
// aggregates diffuse/specular/bump/absorb sub-layers into a single
// LayeredMaterialInfo when appended into a Layered Material. Owns an
// `OZChannelMaterialMapTransform` sub-object at +0xad8 (used for the
// shared-transform channel plumbing) and an `OZChannel` (int-valued)
// sub-object at +0xb58 (the "any shared transform enabled" gate).
//
// This class extends `OZMaterialLayerBase` (which extends `OZChannelBase`
// and `OZFactoryBase` via Ozone's multi-inheritance framework hierarchy).
// Vtable @Ozone 0x845428 (installed +0x10 = 0x845438).
// Slot map (from `raw-port/army/tools/resolve.py Ozone vtable OZMaterialCompoundLayer`):
//   *0x00 -> 0x6db590  ~OZMaterialCompoundLayer()  [D1 complete dtor — body not disasm'd here]
//   *0x08 -> 0x6db5a0  ~OZMaterialCompoundLayer()  [D0 deleting dtor — ud2 (unreachable)]
//   *0x10 -> 0x1fab0  OZFactoryBase::getIconName() const           (inherited)
//   *0x18 -> 0x1fad0  OZFactoryBase::getIconNameBW() const         (inherited)
//   *0x20 -> 0x1faf0  OZFactoryBase::getIconID() const             (inherited)
//   *0x28 -> 0x1fb00  OZFactoryBase::getLibraryIconName() const    (inherited)
//   *0x30 -> 0x1fb20  OZFactoryBase::description()                 (inherited)
//   *0x38 -> 0x1fb40  OZChannelBase::getInstanceID() const         (inherited)
//   *0x40 -> 0x1fb50  OZChannelBase::getSerializer()               (inherited)
//   *0x48 -> 0x1fb60  OZFactoryBase::getFactoryForSerialization(PCSerializerWriteStream&, bool)
//   ... (base panel slots — 20+ inherited from OZChannelBase/OZFactoryBase;
//        this class overrides `parseEnd`, `setUpTexture` [two overloads],
//        `setUpSampler`, `getShouldRotateSide`, `getUseTriplanarMapping`,
//        `getAssetURL`, the create*/append* layer family, and 5 channel
//        accessors that all return nullptr on this base type.)
//
// STRUCT LAYOUT (recovered from tail-call dispatches; ctor bodies are
// not decoded in this port and are stubbed accordingly):
//
//   +0x000 : vptr (installed 0x845438 = table+0x10)
//   +0x008..0xad0 : inherited OZMaterialLayerBase/OZChannelBase/OZFactoryBase
//                   fields (not enumerated here — decoded upstream in
//                   OZChannelBase.ts / OZFactoryBase.ts / OZMaterialLayerBase.ts).
//   +0xad8 : OZChannelMaterialMapTransform  (sub-object; base of channel
//            @Ozone 0x1fa07b `addq $0xad8, %rdi;
//                             jmp OZChannelMaterialMapTransform::
//                                 updateLocalTransformChannelsVisibility()`.
//            Also referenced from setTransformValuesAsDefaults @0x1fa094
//            and from isAnySharedTransformEnabled @0x1fa029 which calls
//            OZChannelBase::testFlag(this+0xad8, 0x400000) on it.)
//   +0xb58 : OZChannel  (int-valued shared-transform-enabled channel;
//            @Ozone 0x1fa047 `addq $0xb58, %rbx;
//                             ... callq OZChannel::getValueAsInt(kCMTimeZero)`.
//            The return value (0 vs non-0) is the boolean the method
//            returns.)
//
// Symbols decoded in this port (Ozone, x86_64 slice; VAs unadjusted;
// disasm files under raw-port/re/disasm/OZMaterialCompoundLayer.*.s):
//
//   Ctors (bodies not decoded — throw-stub with @0xADDR):
//     @0x1f97d0  OZMaterialCompoundLayer(OZFactory*, PCString const&, OZChannelFolder*, uint, uint) [C2]
//     @0x1f9a80  OZMaterialCompoundLayer(OZFactory*, PCString const&, uint)                        [C2 short]
//     @0x1f9d30  OZMaterialCompoundLayer(OZMaterialCompoundLayer const&, OZChannelFolder*)         [C2 copy]
//
//   Dtors:
//     @0x6db590  ~OZMaterialCompoundLayer()  [D1/D2 complete/base — body not decoded]
//     @0x6db5a0  ~OZMaterialCompoundLayer()  [D0 deleting — body is `ud2` (unreachable);
//                                             every caller of this deleting variant is a bug]
//     @0x19c9e0  ~OZMaterialCompoundLayer()  [alt entry — inline base dtor
//                                             per ledger; not disasm'd here]
//
//   Trivial nullptr-returning channel accessors (all identical body:
//     `xorl %eax, %eax; ret` — returning a nullptr channel pointer):
//     @0x19e7a0  getSequenceColorChannel()
//     @0x19e7b0  getSequenceOpacityChannel()
//     @0x1ff260  getColorChannel(CMTime const&)
//     @0x1ff600  getGradientChannel(CMTime const&)
//     @0x1ff610  getMetalShinyPercentChannel()
//
//   Tail-jmp thunks into subobject-at-0xad8:
//     @0x1fa070  updateLocalTransformVisibility()
//                => `addq $0xad8, %rdi; jmp
//                    OZChannelMaterialMapTransform::updateLocalTransformChannelsVisibility()`
//     @0x1fa090  setTransformValuesAsDefaults()
//                => `addq $0xad8, %rdi; jmp
//                    OZChannelMaterialMapTransform::setCurrentTransformValuesAsDefault()`
//
//   Simple predicate over the two sub-objects (fully ported below):
//     @0x1fa020  isAnySharedTransformEnabled()
//                => if (testFlag(this+0xad8, 0x400000)) return false;
//                   return getValueAsInt(this+0xb58, kCMTimeZero) != 0;
//
//   All other methods (39) are heavy ObjC-msgSend / PCPtr / ProShade /
//   NSDictionary bridges. Each is throw-stub with @0xADDR per
//   PORTING_SPEC rule 3. Their raw disasms remain undecoded in this
//   pass and the throw-stub cites the exact ADDR for `frontier.py`.
//
// DECODE-DON'T-FIT: the ctor is not transcribed here (would require
// decoding OZMaterialLayerBase, OZChannelMaterialMapTransform,
// OZChannel, and the OZChannelFolder plumbing). We throw citing
// @0xADDR so a downstream ctor-decode pass can wire it up correctly.

import { OZChannelBase } from './OZChannelBase.js';

// ---------------------------------------------------------------------------
// Frontier stubs — external Ozone/ObjC classes referenced but not decoded.
// ---------------------------------------------------------------------------

/**
 * `OZChannel` — sub-object at +0xb58 in the layout. Only method touched
 * by this port is `getValueAsInt(kCMTimeZero)` @Ozone 0x1fa05b.
 * Not yet decoded here.
 */
interface OZChannelStub {
  /** @Ozone 0x1fa05b — vcall `__ZNK9OZChannel13getValueAsIntERK6CMTimed`. */
  getValueAsInt(time: unknown, second: number): number;
}

/**
 * `OZChannelMaterialMapTransform` — sub-object at +0xad8. Referenced
 * via:
 *   @Ozone 0x1fa07c updateLocalTransformChannelsVisibility()  — void
 *   @Ozone 0x1fa09c setCurrentTransformValuesAsDefault()      — void
 * Also embeds an OZChannelBase whose `testFlag(0x400000)` is called at
 *   @Ozone 0x1fa035
 * Not yet decoded here.
 */
interface OZChannelMaterialMapTransformStub {
  updateLocalTransformChannelsVisibility(): void;
  setCurrentTransformValuesAsDefault(): void;
  /** OZChannelBase-inherited; testFlag @Ozone 0x1fa035. */
  testFlag(mask: number): boolean;
}

/**
 * `OZChannelBase::testFlag(uint64_t)` — Ozone
 * `__ZNK13OZChannelBase8testFlagEy`. The port here calls it through
 * the subobject at +0xad8 (interpreted as an OZChannelBase).
 * Not yet transcribed @Ozone 0x1fa035 (call site in
 * isAnySharedTransformEnabled).
 */
function OZChannelBase_testFlag(
  _self: unknown,
  _mask: number,
): boolean {
  throw new Error(
    'OZChannelBase::testFlag not yet transcribed @Ozone __ZNK13OZChannelBase8testFlagEy ' +
      '(called from OZMaterialCompoundLayer::isAnySharedTransformEnabled @Ozone 0x1fa035)',
  );
}

// ---------------------------------------------------------------------------
// OZMaterialCompoundLayer
// ---------------------------------------------------------------------------

/**
 * `OZMaterialCompoundLayer` — extends OZChannelBase transitively via
 * OZMaterialLayerBase. Vtable @Ozone 0x845428.
 *
 * The TS port models only the two sub-object slots we actually use
 * (+0xad8, +0xb58) as fields. The full layout inherits from
 * OZMaterialLayerBase (not yet fully decoded); every method that
 * reads a not-yet-decoded field throws citing its @0xADDR.
 */
export class OZMaterialCompoundLayer extends OZChannelBase {
  /** +0xad8 sub-object — OZChannelMaterialMapTransform. See header layout. */
  channelMaterialMapTransformAt0xAD8: OZChannelMaterialMapTransformStub | null =
    null;

  /** +0xb58 sub-object — OZChannel (int-valued). See header layout. */
  channelAt0xB58: OZChannelStub | null = null;

  /**
   * The 3 real C2 ctors are NOT transcribed in this pass. Each has a
   * body that inits the OZMaterialLayerBase parent + a chain of
   * OZChannel* sub-objects — a decode job in itself. This constructor
   * throws citing the @0xADDR of all three known variants so
   * frontier.py can schedule the ctor-decode as a follow-up.
   *
   * Variants:
   *   @Ozone 0x1f97d0  (OZFactory*, PCString const&, OZChannelFolder*, uint, uint)
   *   @Ozone 0x1f9a80  (OZFactory*, PCString const&, uint)
   *   @Ozone 0x1f9d30  (OZMaterialCompoundLayer const&, OZChannelFolder*)  [copy]
   */
  constructor() {
    super();
    // NOTE: base OZChannelBase super() runs; the actual FCP ctor also
    // initializes >20 OZChannel* sub-objects (folders, gain channels,
    // transform, etc.) at fixed field offsets. That work is deferred to
    // a later pass — this file focuses on the class's vtable
    // dispatch behaviour and the observable API.
  }

  // -------------------------------------------------------------------
  // Trivial `return nullptr` channel accessors — bodies verbatim.
  // Each is `xorl %eax, %eax; ret` at the cited address.
  // -------------------------------------------------------------------

  /**
   * `OZMaterialCompoundLayer::getSequenceColorChannel()` — Ozone @0x19e7a0.
   *   xorl %eax, %eax; retq
   *
   * Returns null — this base does not own a sequence-color channel;
   * subclasses may override the vtable slot to return a real channel.
   */
  getSequenceColorChannel(): unknown {
    return null;
  }

  /**
   * `OZMaterialCompoundLayer::getSequenceOpacityChannel()` — Ozone @0x19e7b0.
   *   xorl %eax, %eax; retq
   */
  getSequenceOpacityChannel(): unknown {
    return null;
  }

  /**
   * `OZMaterialCompoundLayer::getColorChannel(CMTime const&)` — Ozone @0x1ff260.
   *   xorl %eax, %eax; retq
   */
  getColorChannel(_time: unknown): unknown {
    return null;
  }

  /**
   * `OZMaterialCompoundLayer::getGradientChannel(CMTime const&)` — Ozone @0x1ff600.
   *   xorl %eax, %eax; retq
   */
  getGradientChannel(_time: unknown): unknown {
    return null;
  }

  /**
   * `OZMaterialCompoundLayer::getMetalShinyPercentChannel()` — Ozone @0x1ff610.
   *   xorl %eax, %eax; retq
   */
  getMetalShinyPercentChannel(): unknown {
    return null;
  }

  // -------------------------------------------------------------------
  // Tail-jmp thunks into the OZChannelMaterialMapTransform sub-object.
  // -------------------------------------------------------------------

  /**
   * `OZMaterialCompoundLayer::updateLocalTransformVisibility()` — Ozone @0x1fa070.
   *
   *   addq $0xad8, %rdi
   *   jmp  __ZN29OZChannelMaterialMapTransform38updateLocalTransformChannelsVisibilityEv
   *
   * The C++ body is a tail-call thunk that shifts `this` to the
   * +0xad8 sub-object and forwards to its
   * `updateLocalTransformChannelsVisibility()`. The TS port keeps the
   * sub-object as a field and calls into it, but the target method
   * body is not yet decoded — the stub throws citing @0xADDR.
   */
  updateLocalTransformVisibility(): void {
    if (this.channelMaterialMapTransformAt0xAD8 === null) {
      throw new Error(
        'OZMaterialCompoundLayer::updateLocalTransformVisibility: ' +
          'channelMaterialMapTransformAt0xAD8 uninitialized ' +
          '(ctor @Ozone 0x1f97d0 not yet transcribed)',
      );
    }
    // @Ozone 0x1fa07c — jmp OZChannelMaterialMapTransform::updateLocalTransformChannelsVisibility().
    this.channelMaterialMapTransformAt0xAD8.updateLocalTransformChannelsVisibility();
  }

  /**
   * `OZMaterialCompoundLayer::setTransformValuesAsDefaults()` — Ozone @0x1fa090.
   *
   *   addq $0xad8, %rdi
   *   jmp  __ZN29OZChannelMaterialMapTransform34setCurrentTransformValuesAsDefaultEv
   */
  setTransformValuesAsDefaults(): void {
    if (this.channelMaterialMapTransformAt0xAD8 === null) {
      throw new Error(
        'OZMaterialCompoundLayer::setTransformValuesAsDefaults: ' +
          'channelMaterialMapTransformAt0xAD8 uninitialized ' +
          '(ctor @Ozone 0x1f97d0 not yet transcribed)',
      );
    }
    // @Ozone 0x1fa09c — jmp OZChannelMaterialMapTransform::setCurrentTransformValuesAsDefault().
    this.channelMaterialMapTransformAt0xAD8.setCurrentTransformValuesAsDefault();
  }

  /**
   * `OZMaterialCompoundLayer::isAnySharedTransformEnabled()` — Ozone @0x1fa020.
   * Body (28 lines) ported verbatim:
   *
   *   %rbx = this
   *   %rdi = this + 0xad8              @0x1fa029  (sub-object OZChannelBase)
   *   %esi = 0x400000                  @0x1fa030
   *   testFlag = OZChannelBase::testFlag(0x400000)   @0x1fa035
   *   if (testFlag) { %eax = 0; return false; }      @0x1fa03a..0x1fa046
   *   %rbx += 0xb58                    @0x1fa047  (sub-object OZChannel)
   *   %xmm0 = 0                        @0x1fa055  (double arg cleared)
   *   %rsi = &kCMTimeZero              @0x1fa04e
   *   result = OZChannel::getValueAsInt(&kCMTimeZero, 0.0)  @0x1fa05b
   *   return result != 0               @0x1fa060..0x1fa06b
   *
   * The two sub-object types are frontier-stubbed; the control flow is
   * fully transcribed.
   */
  isAnySharedTransformEnabled(): boolean {
    if (
      this.channelMaterialMapTransformAt0xAD8 === null ||
      this.channelAt0xB58 === null
    ) {
      throw new Error(
        'OZMaterialCompoundLayer::isAnySharedTransformEnabled: ' +
          'subobjects uninitialized (ctor @Ozone 0x1f97d0 not yet transcribed)',
      );
    }
    // @Ozone 0x1fa035 — OZChannelBase::testFlag(this+0xad8, 0x400000).
    // We route through the subobject's inherited testFlag; when
    // OZChannelBase::testFlag is decoded this shim disappears.
    let testFlag: boolean;
    try {
      testFlag = this.channelMaterialMapTransformAt0xAD8.testFlag(0x400000);
    } catch (_e) {
      // The OZChannelBase::testFlag body is not yet decoded — surface
      // the frontier @0xADDR the way the file-header stub does.
      OZChannelBase_testFlag(
        this.channelMaterialMapTransformAt0xAD8,
        0x400000,
      );
      throw _e;
    }
    // @Ozone 0x1fa03a — testb %al, %al; je +…
    if (testFlag) {
      return false;
    }
    // @Ozone 0x1fa047..0x1fa05b — OZChannel::getValueAsInt(kCMTimeZero, 0.0)
    // on the sub-object at +0xb58. kCMTimeZero is Apple's canonical
    // "invalid/zero" CMTime constant; we pass null-as-marker here and
    // preserve the second arg (0.0) as an explicit float.
    const value = this.channelAt0xB58.getValueAsInt(
      /* kCMTimeZero */ null,
      0.0,
    );
    // @Ozone 0x1fa060 — setne %al: return (value != 0).
    return value !== 0;
  }

  // -------------------------------------------------------------------
  // Deep ObjC / PCPtr / ProShade methods — all throw-stubbed @0xADDR.
  // Each body is 20..3000+ lines of ObjC msgSend + PCPtr refcount
  // dances + std::list<uint> traversal + NSDictionary/NSString bridging.
  // -------------------------------------------------------------------

  /** @Ozone 0x1f9e70 — reads PCSerializerReadStream. */
  parseEnd(_stream: unknown): void {
    throw new Error(
      'OZMaterialCompoundLayer::parseEnd not yet transcribed @Ozone 0x1f9e70',
    );
  }

  /** @Ozone 0x1fa0b0 — 183-line body: 4×xmm0 zeroing of a 64-byte
   *  ObjC struct at rbp-0x140, then a chain of ObjC msgSends against
   *  the objects returned by vcall *0x3b8 with `kCMTimeZero`. */
  setSubtypeTags(): void {
    throw new Error(
      'OZMaterialCompoundLayer::setSubtypeTags not yet transcribed @Ozone 0x1fa0b0 (183-line ObjC body)',
    );
  }

  /** @Ozone 0x1fa3f0. */
  getShouldRotateSide(_time: unknown): boolean {
    throw new Error(
      'OZMaterialCompoundLayer::getShouldRotateSide not yet transcribed @Ozone 0x1fa3f0',
    );
  }

  /** @Ozone 0x1fa460. */
  getUseTriplanarMapping(_time: unknown): boolean {
    throw new Error(
      'OZMaterialCompoundLayer::getUseTriplanarMapping not yet transcribed @Ozone 0x1fa460',
    );
  }

  /**
   * @Ozone 0x1fa4d0 — first setUpTexture overload
   *   (LayeredMaterialInfo&, LiTextureStoreToken const&, uint, uint, bool,
   *    ProShade::Sampler&, ProShade::Uniform&, OZTexturePlacement const&).
   */
  setUpTexture_8args(
    _info: unknown,
    _token: unknown,
    _u0: number,
    _u1: number,
    _b0: boolean,
    _sampler: unknown,
    _uniform: unknown,
    _placement: unknown,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::setUpTexture(8args) not yet transcribed @Ozone 0x1fa4d0',
    );
  }

  /**
   * @Ozone 0x1fa610 — second setUpTexture overload
   *   (…, ProShade::Sampler&, ProShade::Uniform&, bool, bool,
   *    PCMatrix44Tmpl<double> const&, ProShade::TextureTransformBasis).
   */
  setUpTexture_11args(
    _info: unknown,
    _token: unknown,
    _u0: number,
    _u1: number,
    _b0: boolean,
    _sampler: unknown,
    _uniform: unknown,
    _b1: boolean,
    _b2: boolean,
    _matrix: unknown,
    _basis: unknown,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::setUpTexture(11args) not yet transcribed @Ozone 0x1fa610',
    );
  }

  /** @Ozone 0x1fa740. */
  setUpSampler(
    _info: unknown,
    _token: unknown,
    _sampler: unknown,
    _u0: number,
    _u1: number,
    _b: boolean,
    _d: number,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::setUpSampler not yet transcribed @Ozone 0x1fa740',
    );
  }

  /** @Ozone 0x1faa20 — NSDictionary → NSURL bridging. */
  getAssetURL(_dict: unknown): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::getAssetURL not yet transcribed @Ozone 0x1faa20',
    );
  }

  /** @Ozone 0x1faa40. */
  createDiffuseGradientLayer(
    _info: unknown,
    _time: unknown,
    _grad: unknown,
  ): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::createDiffuseGradientLayer not yet transcribed @Ozone 0x1faa40',
    );
  }

  /** @Ozone 0x1faed0. */
  createDiffuseLayer(
    _info: unknown,
    _time: unknown,
    _colorA: unknown,
    _colorB: unknown,
    _d0: number,
    _dict: unknown,
    _blend: unknown,
    _b0: boolean,
    _f0: number,
    _d1: number,
  ): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::createDiffuseLayer not yet transcribed @Ozone 0x1faed0',
    );
  }

  /** @Ozone 0x1fbc60. */
  getTextureTransform(
    _info: unknown,
    _time: unknown,
    _f: number,
    _matrix: unknown,
    _basis: unknown,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::getTextureTransform not yet transcribed @Ozone 0x1fbc60',
    );
  }

  /** @Ozone 0x1fbdb0. */
  createBumpLayer(
    _info: unknown,
    _time: unknown,
    _d0: number,
    _b0: boolean,
    _dict: unknown,
    _cfNumber: unknown,
    _b1: boolean,
    _f: number,
    _b2: boolean,
  ): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::createBumpLayer not yet transcribed @Ozone 0x1fbdb0',
    );
  }

  /** @Ozone 0x1fcf60. */
  createAbsorbLayer(
    _info: unknown,
    _time: unknown,
    _dict: unknown,
    _f0: number,
    _f1: number,
    _f2: number,
    _f3: number,
  ): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::createAbsorbLayer not yet transcribed @Ozone 0x1fcf60',
    );
  }

  /** @Ozone 0x1fdb70. */
  setSpecularIntensityMap(
    _info: unknown,
    _ptr: unknown,
    _dict: unknown,
    _placement: unknown,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::setSpecularIntensityMap not yet transcribed @Ozone 0x1fdb70',
    );
  }

  /** @Ozone 0x1fe0a0. */
  setSpecularShininessMap(
    _info: unknown,
    _ptr: unknown,
    _dict: unknown,
    _placement: unknown,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::setSpecularShininessMap not yet transcribed @Ozone 0x1fe0a0',
    );
  }

  /** @Ozone 0x1fe5d0. */
  setSpecularAngleMap(
    _info: unknown,
    _ptr: unknown,
    _dict: unknown,
    _placement: unknown,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::setSpecularAngleMap not yet transcribed @Ozone 0x1fe5d0',
    );
  }

  /** @Ozone 0x1febd0. */
  createSpecularLayer(
    _info: unknown,
    _time: unknown,
    _d0: number,
    _d1: number,
    _grad: unknown,
    _b0: boolean,
    _b1: boolean,
  ): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::createSpecularLayer not yet transcribed @Ozone 0x1febd0',
    );
  }

  /** @Ozone 0x1ff270 — NSDictionary + CMTime + LayeredMaterialInfo bridge. */
  getOpacity(_dict: unknown, _time: unknown, _info: unknown): number {
    throw new Error(
      'OZMaterialCompoundLayer::getOpacity not yet transcribed @Ozone 0x1ff270',
    );
  }

  /** @Ozone 0x1ff280. */
  appendDiffuseLayer(_info: unknown, _time: unknown, _dict: unknown): void {
    throw new Error(
      'OZMaterialCompoundLayer::appendDiffuseLayer not yet transcribed @Ozone 0x1ff280',
    );
  }

  /**
   * @Ozone 0x1ff570 — NSDictionary→double bridge (21 lines).
   *   dict[key] via ObjC msgSend @sel `objectForKey:`. If nil → return
   *   default (arg[3]). Else → ObjC msgSend `doubleValue` on the object
   *   (tail-jmp @0x1ff5a4 through the ObjC dispatch table).
   *
   * The two @sel references at rip+0x709936 and rip+0x70b7cc, plus the
   * two msgSend indirects at rip+0x626a98 / +0x626a7e are ObjC
   * runtime handles — not yet decoded here. Throw-stub cites @0xADDR.
   */
  getDoubleForNumberKey(
    _key: unknown,
    _dict: unknown,
    _default: number,
  ): number {
    throw new Error(
      'OZMaterialCompoundLayer::getDoubleForNumberKey not yet transcribed @Ozone 0x1ff570 ' +
        '(ObjC msgSend objectForKey:/doubleValue — @sel table not decoded)',
    );
  }

  /**
   * @Ozone 0x1ff5c0 — NSDictionary→bool bridge (23 lines). Same pattern
   * as getDoubleForNumberKey but with `boolValue` selector. Throw-stub
   * citing @0xADDR.
   */
  getBoolForKey(
    _key: unknown,
    _dict: unknown,
    _default: boolean,
  ): boolean {
    throw new Error(
      'OZMaterialCompoundLayer::getBoolForKey not yet transcribed @Ozone 0x1ff5c0 ' +
        '(ObjC msgSend objectForKey:/boolValue — @sel table not decoded)',
    );
  }

  /** @Ozone 0x1ff620. */
  getSpecularShininess(_dict: unknown, _time: unknown): number {
    throw new Error(
      'OZMaterialCompoundLayer::getSpecularShininess not yet transcribed @Ozone 0x1ff620',
    );
  }

  /** @Ozone 0x1ff630. */
  getSpecularIntensity(_dict: unknown, _time: unknown): number {
    throw new Error(
      'OZMaterialCompoundLayer::getSpecularIntensity not yet transcribed @Ozone 0x1ff630',
    );
  }

  /** @Ozone 0x1ff640. */
  appendSpecularLayer(
    _info: unknown,
    _time: unknown,
    _dict: unknown,
  ): void {
    throw new Error(
      'OZMaterialCompoundLayer::appendSpecularLayer not yet transcribed @Ozone 0x1ff640',
    );
  }

  /** @Ozone 0x2005b0. */
  getBumpGain(_dict: unknown, _time: unknown, _info: unknown): number {
    throw new Error(
      'OZMaterialCompoundLayer::getBumpGain not yet transcribed @Ozone 0x2005b0',
    );
  }

  /** @Ozone 0x2005c0. */
  getBumpInvert(_dict: unknown, _time: unknown, _info: unknown): boolean {
    throw new Error(
      'OZMaterialCompoundLayer::getBumpInvert not yet transcribed @Ozone 0x2005c0',
    );
  }

  /** @Ozone 0x2005d0. */
  appendBumpLayer(_info: unknown, _time: unknown, _dict: unknown): void {
    throw new Error(
      'OZMaterialCompoundLayer::appendBumpLayer not yet transcribed @Ozone 0x2005d0',
    );
  }

  /** @Ozone 0x2007e0. */
  appendAbsorbLayer(_info: unknown, _time: unknown, _dict: unknown): void {
    throw new Error(
      'OZMaterialCompoundLayer::appendAbsorbLayer not yet transcribed @Ozone 0x2007e0',
    );
  }

  /** @Ozone 0x200900. */
  getCurrentLayers(_time: unknown): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::getCurrentLayers not yet transcribed @Ozone 0x200900',
    );
  }

  /** @Ozone 0x200b40. */
  appendLayers(_info: unknown, _time: unknown, _arr: unknown): void {
    throw new Error(
      'OZMaterialCompoundLayer::appendLayers not yet transcribed @Ozone 0x200b40',
    );
  }

  /** @Ozone 0x200de0. */
  collectInternalTexturesFromLayeredMaterial(): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::collectInternalTexturesFromLayeredMaterial not yet transcribed @Ozone 0x200de0',
    );
  }

  /** @Ozone 0x201020. */
  appendLayersToLayeredMaterial(_info: unknown): void {
    throw new Error(
      'OZMaterialCompoundLayer::appendLayersToLayeredMaterial not yet transcribed @Ozone 0x201020',
    );
  }

  /** @Ozone 0x201090. */
  getLayerDescriptions(_time: unknown): unknown {
    throw new Error(
      'OZMaterialCompoundLayer::getLayerDescriptions not yet transcribed @Ozone 0x201090',
    );
  }

  // -------------------------------------------------------------------
  // Destructors
  // -------------------------------------------------------------------

  /**
   * `OZMaterialCompoundLayer::~OZMaterialCompoundLayer()` — Ozone
   *   @0x6db590 D1/D2 complete/base dtor — body NOT decoded in this
   *              pass. Throws citing the ADDR.
   *   @0x6db5a0 D0 deleting dtor — body is literally `ud2`
   *              (illegal-instruction trap). This means the deleting
   *              variant is never expected to be reached at runtime
   *              (subclasses either override or FCP never delete
   *              instances through the base vptr slot). We mirror the
   *              trap by throwing.
   */
  destroy_D0(): never {
    // @Ozone 0x6db5a4 — ud2. In C++ this is a hard hardware trap;
    // reaching it is a bug. We translate to a hard throw.
    throw new Error(
      'OZMaterialCompoundLayer::~OZMaterialCompoundLayer[D0] reached — ' +
        'D0 body is `ud2` (unreachable) @Ozone 0x6db5a4. This deleting-dtor ' +
        'slot is not supposed to be entered at runtime; a subclass D0 override ' +
        'or a direct non-deleting call is expected.',
    );
  }

  /**
   * `OZMaterialCompoundLayer::~OZMaterialCompoundLayer()` [D1/D2] —
   * Ozone @0x6db590. Body NOT decoded here. Cites the ADDR so
   * frontier.py schedules the decode.
   */
  destroy_D1(): void {
    throw new Error(
      'OZMaterialCompoundLayer::~OZMaterialCompoundLayer[D1/D2] not yet transcribed @Ozone 0x6db590',
    );
  }
}
