// FFOZMediaRefChannel.m0.ts — raw transcription of Flexo `FFOZMediaRefChannel`
// (methods [0..20) of 28 — CHUNK 0 of a 2-chunk port: ctors, InitOZMediaRefChannel, dtors, and
// the clone/copy/assign/compare/resetToDefault family + getObjCWrapperName).
//
// Sibling chunk m1 (raw-port/src/channels/FFOZMediaRefChannel.m1.ts) owns setAnchoredObject +
// the serialization tail (writeHeader/writeBody/parseBegin/parseElement/parseEnd/calcHashForState).
//
// Provenance (Flexo framework, x86_64 slice; FAT offset 0x4000 == VA parity):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//   `nm -arch x86_64 | c++filt | grep FFOZMediaRefChannel`.
//
// Symbols ported in THIS chunk (m0):
//   @0x21c2f0  FFOZMediaRefChannel(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)   [C2]
//                __ZN19FFOZMediaRefChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjj
//   @0x21c380  InitOZMediaRefChannel()                                                        [private init helper]
//                __ZN19FFOZMediaRefChannel21InitOZMediaRefChannelEv
//   @0x21c5a0  FFOZMediaRefChannel(OZFactory*, PCString const&, OZChannelFolder*, u32, u32)   [C1 body — see nm]
//                __ZN19FFOZMediaRefChannelC1EP9OZFactoryRK8PCStringP15OZChannelFolderjj
//   @0x21c630  FFOZMediaRefChannel(PCString const&, OZChannelFolder*, u32, u32)               [C2]
//                __ZN19FFOZMediaRefChannelC2ERK8PCStringP15OZChannelFolderjj
//   @0x21c710  FFOZMediaRefChannel(PCString const&, OZChannelFolder*, u32, u32)               [C1]
//                __ZN19FFOZMediaRefChannelC1ERK8PCStringP15OZChannelFolderjj
//   @0x21c720  FFOZMediaRefChannel(OZFactory*, PCString const&, u32)                          [C2]
//                __ZN19FFOZMediaRefChannelC2EP9OZFactoryRK8PCStringj
//   @0x21c7a0  FFOZMediaRefChannel(OZFactory*, PCString const&, u32)                          [C1]
//                __ZN19FFOZMediaRefChannelC1EP9OZFactoryRK8PCStringj
//   @0x21c820  FFOZMediaRefChannel(FFOZMediaRefChannel const&)                                [C2 copy-no-folder]
//                __ZN19FFOZMediaRefChannelC2ERKS_
//   @0x21c900  FFOZMediaRefChannel(FFOZMediaRefChannel const&)                                [C1 copy-no-folder]
//                __ZN19FFOZMediaRefChannelC1ERKS_
//   @0x21c9e0  FFOZMediaRefChannel(FFOZMediaRefChannel const&, OZChannelFolder*)              [C2 copy-with-folder]
//                __ZN19FFOZMediaRefChannelC2ERKS_P15OZChannelFolder
//   @0x21cac0  FFOZMediaRefChannel(FFOZMediaRefChannel const&, OZChannelFolder*)              [C1 copy-with-folder]
//                __ZN19FFOZMediaRefChannelC1ERKS_P15OZChannelFolder
//   @0x21cba0  ~FFOZMediaRefChannel()                                                          [D2]
//                __ZN19FFOZMediaRefChannelD2Ev
//   @0x21cbe0  ~FFOZMediaRefChannel()                                                          [D1]
//                __ZN19FFOZMediaRefChannelD1Ev
//   @0x21cc60  ~FFOZMediaRefChannel()                                                          [D0 deleting]
//                __ZN19FFOZMediaRefChannelD0Ev
//   @0x21ccf0  getObjCWrapperName()  ->  NSStringFromClass([FFMediaRefChannel class])
//                __ZN19FFOZMediaRefChannel18getObjCWrapperNameEv
//   @0x21cd10  clone() const  ->  `new FFOZMediaRefChannel(*this)`  (via OZChannel::C2 copy path)
//                __ZNK19FFOZMediaRefChannel5cloneEv
//   @0x21ce10  copy(OZChannelBase const*, bool)   [dynamic_cast + byte-window copy + PCString::set]
//                __ZN19FFOZMediaRefChannel4copyEPK13OZChannelBaseb
//   @0x21cec0  assign(OZChannelBase const*)       [same shape, no +0x98 copy]
//                __ZN19FFOZMediaRefChannel6assignEPK13OZChannelBase
//   @0x21cf60  compare(OZChannelBase const*) const [base compare + dynamic_cast + CMTimeCompare
//                                                    + flags/wrapper-backing equality]
//                __ZNK19FFOZMediaRefChannel7compareEPK13OZChannelBase
//   @0x21d020  resetToDefault(bool)               [base + "restore default state" byte-copy + ObjC dispatch]
//                __ZN19FFOZMediaRefChannel14resetToDefaultEb
//
// Sibling __ZThn16_... non-virtual thunks for D0/D1 live at @0x21cc20 (D1) and @0x21cca0 (D0);
// they subtract 0x10 from `this` to rebase to the primary vptr slot and then run the same
// vtable-install + PCString::D1 + OZChannel::D2 chain.  Nothing to port on the thunks themselves.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from InitOZMediaRefChannel + all ctors/dtors + clone)
// -----------------------------------------------------------------------------
// sizeof(FFOZMediaRefChannel) = 0xe0 bytes (from clone @0x21cd1d `movl $0xe0,%edi`).
//
//   +0x000  vptr — primary               (installed by every C2 to a Flexo-private
//                                          FFOZMediaRefChannel-vtable — RIP-relative address
//                                          @0x21cba9 in D2 (`leaq 0x16d8a88(%rip),%rax`);
//                                          the base object is 24-byte OZChannel).
//   +0x010  vptr — secondary             (installed by every C2 to the PCShared/secondary slice —
//                                          RIP-relative @0x21cbb3 in D2, `leaq 0x16d8dde(%rip)`).
//   +0x018..+0x098  OZChannel base-class fields (owned by OZChannel::C2, D2). Not modelled here.
//   +0x080  OZChannelInfo*               — `FFOZMediaRefChannelInfo_Instance` (a Meyers singleton
//                                          initialized on first call to InitOZMediaRefChannel).
//                                          Stored twice at +0x80 and +0x88 by InitOZMediaRefChannel
//                                          @0x21c3fe-@0x21c405 (`movq %r14,0x88(%rbx);
//                                          movq %r14,0x80(%rbx)`).
//   +0x088  OZChannelInfo*               — duplicate slot (the ObjC-wrapper hook reads +0x88).
//   +0x098  OZChannelImpl*               — `FFOZMediaRefChannelImpl_Instance` singleton
//                                          allocated by InitOZMediaRefChannel @0x21c40c+ (size
//                                          0xb0). Also read by anchoredObject / setAnchoredObject
//                                          (m1) as the "wrapper backing" pointer.
//   +0x0a0  u32 flags                    — mode/resolvable bits (see m1 for the bit definitions
//                                          used by setAnchoredObject and calcHashForState).
//                                          resetToDefault @0x21d035 restores from +0xa4.
//   +0x0a4  u32 flags-default            — the "default" flags value used by resetToDefault
//                                          (`movl 0xa4(%rbx),%eax; movl %eax,0xa0(%rbx)`).
//   +0x0a8..+0x0b7  CMTime (16 bytes)    — primary time slot (value/timescale/flags/epoch).
//                                          resetToDefault @0x21d03b copies from +0xc0.
//   +0x0b8..+0x0bf  CMTime tail (8 bytes) — copied from +0xd0 by resetToDefault @0x21d049.
//   +0x0c0..+0x0cf  CMTime (16 bytes)    — default time slot for resetToDefault ("factory time").
//   +0x0d0..+0x0d7  CMTime tail          — default-time flags/epoch tail.
//   +0x0d8..+0x0df  PCString name        — the "asset URL" or "reference path" PCString. Ctors
//                                          call PCString::C1() @0x21cd59 to default-construct;
//                                          clone/copy call PCString::set(const&) @0x21cdc1.
//                                          Dtor D2 @0x21cbc5 calls PCString::D1() on this slot.
//
// (Chunk m1 additionally uses +0x38 (anchor ptr) and +0x18 (kind u32), +0x20 (PCString for
//  serialization headers). Those live inside the OZChannel-base window and are OZChannel-owned.)
//
// -----------------------------------------------------------------------------
// CTOR TRANSCRIPTION NOTE
// -----------------------------------------------------------------------------
// The three primary C2 forms (5-arg with folder, 4-arg with folder, 3-arg no-folder), the two
// copy C2 forms (with and without folder), and the C1 aliases all end with a call to
// `InitOZMediaRefChannel()` — the private helper at @0x21c380 that lazily constructs the
// OZChannelInfo and OZChannelImpl singletons and stores their pointers into `this+0x80/0x88/0x98`.
// Each ctor is a boundary throw-stub citing @0xADDR because they depend on OZChannel::C2, the
// PCSingleton / OZCurveEnum machinery, and the ObjC selector table (none yet transcribed).

// -----------------------------------------------------------------------------
// External hooks (loud stubs per PORTING_SPEC Rule 3).
// -----------------------------------------------------------------------------

/**
 * OZChannel base subroutines called by this chunk.
 * @provenance Flexo stubs
 *   __ZN9OZChannelC2ERKS_P15OZChannelFolder                              (stub @0x1496f54)
 *   __ZN9OZChannel4copyEPK13OZChannelBaseb                                (stub @0x1496f0c)
 *   __ZN9OZChannel6assignEPK13OZChannelBase                              (stub @0x1496f12)
 *   __ZN9OZChannel14resetToDefaultEb                                     (stub @0x1496e7c)
 *   __ZN9OZChannelD2Ev                                                    (stub @0x1496f5a)
 *   __ZNK13OZChannelBase7compareEPKS_                                    (stub @0x1496fc0)
 */
export interface OZChannelBase_m0 {
  /** @provenance Flexo stub @0x1496f0c */
  copy(_other: OZChannelBase_m0 | null, _flag: boolean): void;
  /** @provenance Flexo stub @0x1496f12 */
  assign(_other: OZChannelBase_m0 | null): void;
  /** @provenance Flexo stub @0x1496e7c */
  resetToDefault(_flag: boolean): void;
  /** @provenance Flexo stub @0x1496fc0 */
  compare(_other: OZChannelBase_m0 | null): boolean;
}

/**
 * PCString — the FCP string type.
 * @provenance Flexo stubs
 *   __ZN8PCStringC1Ev            (default ctor)   stub @0x1496dda
 *   __ZN8PCString3setERKS_       (copy-assign)    stub @0x1496db0
 *   __ZN8PCStringD1Ev            (dtor)           stub @0x1496de0
 */
export interface PCString_m0 {
  setFromPCString(_other: PCString_m0): void;
}

/**
 * OZChannelInfo / OZChannelImpl — the two Meyers-singleton subsystems initialized by
 * InitOZMediaRefChannel.
 * @provenance Flexo stubs
 *   __ZN13OZChannelInfoC2EdddddPKc  (5-double + name ctor)   stub @0x14962be
 *   __ZN11PCSingletonC2Ej            (u32-tag ctor)           stub @0x1495fee
 *   __ZN7OZCurveC2Edddd              (4-double curve ctor)   stub @0x1496c8a
 */
export type OZChannelInfoRef = { readonly __oz_channel_info: true };
export type OZChannelImplRef = { readonly __oz_channel_impl: true };
export type OZFactoryRef = { readonly __oz_factory: true };
export type OZChannelFolderRef = { readonly __oz_channel_folder: true };
export type OZChannelBaseRef = { readonly __oz_channel_base_opaque: true };
export type CMTimeSlot = { readonly __cm_time_slot: true };

/**
 * ObjC boundary — the two class references used by the getObjCWrapperName and resetToDefault
 * methods.
 * @provenance Flexo `_OBJC_CLASS_$_FFMediaRefChannel` @ getObjCWrapperName @0x21ccf4;
 * stubs `_objc_opt_self` @0x14979a4, `_NSStringFromClass` @0x1495a24.
 */
export type ObjCClass = { readonly __objc_class: true };
export type NSString = { readonly __ns_string: true };

// -----------------------------------------------------------------------------
// The class (chunk m0).
// -----------------------------------------------------------------------------

/**
 * @provenance ObjC class name literal at Flexo getObjCWrapperName @0x21ccf4
 *   (`leaq _OBJC_CLASS_$_FFMediaRefChannel(%rip),%rdi`) — the ObjC class whose Cocoa name is
 *   returned by getObjCWrapperName().
 */
export const FFOZ_MRC_OBJC_CLASS_NAME = "FFMediaRefChannel";

/**
 * @provenance clone @0x21cd1d — the exact byte-size passed to operator new.
 */
export const FFOZ_MRC_SIZEOF = 0xe0;

export class FFOZMediaRefChannel {
  // Fields at their real byte offsets. Only slots TOUCHED by this chunk are modelled;
  // sibling chunk m1 declares additional slots (+0x18, +0x20, +0x38, +0xa0, +0xa4, +0xa8..+0xd7,
  // +0xd8) — DUPLICATION IS INTENTIONAL: FFOZMediaRefChannel.m0 and .m1 are two views of the same
  // C++ object, and the layout is single-source-of-truth here. Consumers wire the two views.

  /** @provenance +0x80, InitOZMediaRefChannel @0x21c405 (`movq %r14,0x80(%rbx)`) — OZChannelInfo* dup. */
  channelInfoAt0x80: OZChannelInfoRef | null = null;

  /** @provenance +0x88, InitOZMediaRefChannel @0x21c3fe (`movq %r14,0x88(%rbx)`) — OZChannelInfo*. */
  channelInfoAt0x88: OZChannelInfoRef | null = null;

  /** @provenance +0x98, wrapper backing (also read by resetToDefault @0x21d057). */
  wrapperBackingAt0x98: OZChannelImplRef | null = null;

  /** @provenance +0xa0, u32 flags (see m1 for bit definitions). resetToDefault restores from +0xa4. */
  flagsAt0xa0: number = 0;

  /** @provenance +0xa4, u32 flags-default value; resetToDefault @0x21d02f copies +0xa4 -> +0xa0. */
  flagsDefaultAt0xa4: number = 0;

  /** @provenance +0xa8..+0xbf, primary CMTime slot; resetToDefault overwrites from +0xc0/+0xd0. */
  currentTimeAt0xa8!: CMTimeSlot;

  /** @provenance +0xc0..+0xd7, default CMTime slot copied to +0xa8 by resetToDefault. */
  defaultTimeAt0xc0!: CMTimeSlot;

  /** @provenance +0xd8, PCString name. Default-ctor'd @0x21c... in every C2; PCString::D1 in D2. */
  nameAt0xd8!: PCString_m0;

  /** OZChannel base sub-object used to chain into the base copy/assign/resetToDefault/compare. */
  base!: OZChannelBase_m0;

  // ------------------------------------------------------------------------
  // Constructors (throwing per PORTING_SPEC Rule 3 — depend on OZChannel::C2 + PCString::C1 +
  // InitOZMediaRefChannel's OZChannelInfo/OZChannelImpl/PCSingleton/OZCurve*Enum machinery).
  // ------------------------------------------------------------------------

  /**
   * (OZFactory*, PCString const&, OZChannelFolder*, u32, u32) [C2] — @Flexo 0x21c2f0.
   *
   * Structural shape (fully decoded but not yet transcribed):
   *   - call OZChannel::C2 with the same args (base class),
   *   - install primary + secondary vptrs at this+0x00 / this+0x10,
   *   - default-construct PCString at this+0xd8,
   *   - call InitOZMediaRefChannel() to lazily bootstrap the two singletons and store
   *     OZChannelInfo* / OZChannelImpl* at this+0x80/0x88/0x98.
   *
   * @provenance Flexo @0x21c2f0
   */
  static constructWithFactoryAndFolder(
    _factory: OZFactoryRef,
    _name: PCString_m0,
    _folder: OZChannelFolderRef,
    _u1: number,
    _u2: number,
  ): FFOZMediaRefChannel {
    throw new Error(
      "FFOZMediaRefChannel::FFOZMediaRefChannel(OZFactory*, PCString const&, OZChannelFolder*, u32, u32) " +
        "@Flexo 0x21c2f0 not yet transcribed — depends on OZChannel::C2 (stub @0x1496f54), " +
        "PCString::C1 (stub @0x1496dda), and InitOZMediaRefChannel @0x21c380.",
    );
  }

  /**
   * (PCString const&, OZChannelFolder*, u32, u32) [C2] — @Flexo 0x21c630.
   * No-factory variant. Same shape as the 5-arg C2 with a different OZChannel::C2 overload.
   * @provenance Flexo @0x21c630
   */
  static constructWithFolderNoFactory(
    _name: PCString_m0,
    _folder: OZChannelFolderRef,
    _u1: number,
    _u2: number,
  ): FFOZMediaRefChannel {
    throw new Error(
      "FFOZMediaRefChannel::FFOZMediaRefChannel(PCString const&, OZChannelFolder*, u32, u32) " +
        "@Flexo 0x21c630 not yet transcribed — same shape as the 5-arg form via a different " +
        "OZChannel::C2 overload.",
    );
  }

  /**
   * (OZFactory*, PCString const&, u32) [C2] — @Flexo 0x21c720.
   * Minimal form: no folder + single u32.
   * @provenance Flexo @0x21c720
   */
  static constructMinimal(
    _factory: OZFactoryRef,
    _name: PCString_m0,
    _u: number,
  ): FFOZMediaRefChannel {
    throw new Error(
      "FFOZMediaRefChannel::FFOZMediaRefChannel(OZFactory*, PCString const&, u32) " +
        "@Flexo 0x21c720 not yet transcribed — depends on OZChannel::C2 (3-arg) and " +
        "InitOZMediaRefChannel @0x21c380.",
    );
  }

  /**
   * (FFOZMediaRefChannel const&) [C2 copy, no-folder] — @Flexo 0x21c820.
   * Copy ctor without an explicit folder — the C2 body forwards `folder = null` to
   * OZChannel::C2(const&, folder).
   * @provenance Flexo @0x21c820
   */
  static constructCopyNoFolder(_other: FFOZMediaRefChannel): FFOZMediaRefChannel {
    throw new Error(
      "FFOZMediaRefChannel::FFOZMediaRefChannel(FFOZMediaRefChannel const&) " +
        "@Flexo 0x21c820 not yet transcribed — depends on OZChannel::C2(const&, folder=null) and " +
        "PCString::set(const&) (stub @0x1496db0).",
    );
  }

  /**
   * (FFOZMediaRefChannel const&, OZChannelFolder*) [C2 copy-with-folder] — @Flexo 0x21c9e0.
   * @provenance Flexo @0x21c9e0
   */
  static constructCopyWithFolder(
    _other: FFOZMediaRefChannel,
    _folder: OZChannelFolderRef,
  ): FFOZMediaRefChannel {
    throw new Error(
      "FFOZMediaRefChannel::FFOZMediaRefChannel(FFOZMediaRefChannel const&, OZChannelFolder*) " +
        "@Flexo 0x21c9e0 not yet transcribed — depends on OZChannel::C2(const&, folder) and " +
        "PCString::set(const&) (stub @0x1496db0).",
    );
  }

  /**
   * InitOZMediaRefChannel() — @Flexo 0x21c380 (private helper).
   *
   * Body (~150 bytes) — a Meyers-style double-checked bootstrap of two Flexo-private singletons:
   *
   *   @0x21c390  r14 = FFOZMediaRefChannelInfo_Instance      ; TU-local static ptr
   *   @0x21c397  if (r14 != null) skip alloc, jump to store
   *   @0x21c39c  operator new(0x58 bytes)
   *   @0x21c3cc  OZChannelInfo::C2(this, xmm0=0, xmm1=&data@rip+0x1352858, xmm2=&data@rip+0x1350640,
   *              xmm3=xmm2, xmm4=xmm2, name="" @rip+0x1475ca8)
   *   @0x21c3dd  PCSingleton::C2(this+0x50, 0x64)
   *   @0x21c3e9  install two vptrs at (info) and (info+0x50)  (RIP-relative addresses at 0x21c3e2/0x21c3ec)
   *   @0x21c3f7  FFOZMediaRefChannelInfo_Instance = info
   *   @0x21c3fe  this->channelInfoAt0x88 = info
   *   @0x21c405  this->channelInfoAt0x80 = info
   *   @0x21c40c  r15 = FFOZMediaRefChannelImpl_Instance
   *   @0x21c416  if (r15 != null) skip alloc, jump to store
   *   @0x21c41c  operator new(0xb0 bytes)
   *   @0x21c442  OZCurve::C2(this, xmm0=0, xmm1=&data@rip+0x13527df, xmm2=&data@rip+0x13505c7, xmm3=0)
   *   @0x21c447  install __ZTV11OZCurveEnum vtable at (impl+0), (impl+0x50 secondary vptr set later)
   *   @0x21c455-@0x21c45f  OZCurveEnumSplineState::_instanceOnce == -1 fast-path (Itanium-ABI guarded static)
   *   ... continues past the sed window with more init ...
   *   store impl into `this->wrapperBackingAt0x98`.
   *
   * NOT YET TRANSCRIBED — depends on OZChannelInfo::C2, PCSingleton::C2, OZCurve::C2, the
   * OZCurveEnum vtable installation, and the Itanium-ABI __cxa_guard machinery for
   * `OZCurveEnumSplineState::_instanceOnce`. Also depends on the RIP-relative doubles at
   * 0x1352858 / 0x1350640 / 0x13527df / 0x13505c7 which are not yet decoded.
   *
   * @provenance Flexo @0x21c380
   */
  initOZMediaRefChannel(): void {
    throw new Error(
      "FFOZMediaRefChannel::InitOZMediaRefChannel() @Flexo 0x21c380 not yet transcribed — " +
        "depends on OZChannelInfo::C2 (stub @0x14962be, 5-double + name), PCSingleton::C2 " +
        "(stub @0x1495fee), OZCurve::C2 (stub @0x1496c8a), the OZCurveEnum vtable install, and " +
        "the __cxa_guard bootstrap of OZCurveEnumSplineState::_instanceOnce.",
    );
  }

  // ------------------------------------------------------------------------
  // Destructors
  // ------------------------------------------------------------------------

  /**
   * ~FFOZMediaRefChannel() [D2 body] — @Flexo 0x21cba0.
   *
   * Body (56 bytes):
   *   @0x21cba9  install primary   vptr at this+0x00   (RIP-relative addr @0x21cba9)
   *   @0x21cbb3  install secondary vptr at this+0x10   (RIP-relative addr @0x21cbb3)
   *   @0x21cbbe  rdi = this+0xd8
   *   @0x21cbc5  callq PCString::D1                     (destroy the name PCString at +0xd8)
   *   @0x21cbd3  tail-jmp OZChannel::D2                 (base-class dtor)
   *
   * NOT YET TRANSCRIBED — depends on the base OZChannel::D2 (stub @0x1496f5a) and
   * PCString::D1 (stub @0x1496de0).
   *
   * @provenance Flexo @0x21cba0
   */
  destroyD2(): void {
    throw new Error(
      "FFOZMediaRefChannel::~FFOZMediaRefChannel() [D2] @Flexo 0x21cba0 not yet transcribed — " +
        "depends on PCString::D1 (stub @0x1496de0) and OZChannel::D2 (stub @0x1496f5a).",
    );
  }

  /**
   * ~FFOZMediaRefChannel() [D1] — @Flexo 0x21cbe0.
   * Structurally identical to D2 but installs a DIFFERENT vtable slice at this+0x00 / this+0x10
   * (RIP-relative offsets 0x16d8a48 / 0x16d8d9e vs 0x16d8a88 / 0x16d8dde in D2). The two vtable
   * slices point at "in-derived-class complete" vs "in-derived-class base" typeinfo — the classic
   * Itanium ABI D1 vs D2 distinction for a multi-inheritance layout.
   * @provenance Flexo @0x21cbe0
   */
  destroyD1(): void {
    throw new Error(
      "FFOZMediaRefChannel::~FFOZMediaRefChannel() [D1] @Flexo 0x21cbe0 not yet transcribed — " +
        "depends on PCString::D1 (stub @0x1496de0) and OZChannel::D2 (stub @0x1496f5a); the " +
        "vptr addresses differ from D2 by 0x40/0x40 (D1 vtable slice at RIP 0x16d8a48/0x16d8d9e).",
    );
  }

  /**
   * ~FFOZMediaRefChannel() [D0 deleting] — @Flexo 0x21cc60.
   * Same as D1/D2 vptr install + PCString::D1 + OZChannel::D2, followed by
   * `jmp operator delete(void*)` (stub @0x1497404) to release the heap.
   * @provenance Flexo @0x21cc60
   */
  destroyD0Deleting(): void {
    throw new Error(
      "FFOZMediaRefChannel::~FFOZMediaRefChannel() [D0 deleting] @Flexo 0x21cc60 not yet " +
        "transcribed — depends on PCString::D1, OZChannel::D2, and operator delete " +
        "(stub @0x1497404).",
    );
  }

  // ------------------------------------------------------------------------
  // Real transcribed methods.
  // ------------------------------------------------------------------------

  /**
   * getObjCWrapperName() — @Flexo 0x21ccf0.
   *
   * 24-byte tail-call chain:
   *
   *   @0x21ccf4  rdi = &_OBJC_CLASS_$_FFMediaRefChannel
   *   @0x21ccfb  callq _objc_opt_self          (Objective-C runtime helper — returns the class)
   *   @0x21cd00  rdi = <result>
   *   @0x21cd04  jmp   _NSStringFromClass      (returns @"FFMediaRefChannel")
   *
   * The observable result is `@"FFMediaRefChannel"` — the Cocoa string form of the Objective-C
   * class name `FFMediaRefChannel`. The two stubs (`_objc_opt_self`, `_NSStringFromClass`) are
   * ObjC-runtime boundary calls; we throw-stub the observable dispatch here but the
   * class-name constant IS transcribed (see FFOZ_MRC_OBJC_CLASS_NAME above).
   *
   * @provenance Flexo @0x21ccf0
   */
  getObjCWrapperName(): NSString {
    throw new Error(
      "FFOZMediaRefChannel::getObjCWrapperName() @Flexo 0x21ccf0 not yet transcribed — depends " +
        "on _objc_opt_self (stub @0x14979a4) and _NSStringFromClass (stub @0x1495a24). Observable " +
        "return value is the NSString \"FFMediaRefChannel\" (constant FFOZ_MRC_OBJC_CLASS_NAME).",
    );
  }

  /**
   * clone() const — @Flexo 0x21cd10.
   *
   * Body (200 bytes):
   *   @0x21cd1d  operator new(0xe0)
   *   @0x21cd35  OZChannel::C2(new, this, folder=null)
   *   @0x21cd41  install primary vptr at new+0x00 (Flexo-private FFOZMediaRefChannel vtable)
   *   @0x21cd4b  install secondary vptr at new+0x10
   *   @0x21cd59  PCString::C1() at new+0xd8       (default construct the name PCString)
   *   @0x21cd5e-@0x21cdad  byte-copy new+0x98..+0xd7 from this+0x98..+0xd7
   *              (i.e. wrapperBackingAt0x98, flagsAt0xa0/a4, currentTimeAt0xa8, defaultTimeAt0xc0
   *               and its tails — 8 + 8 + 16 + 8 + 16 + 8 = 64 bytes copied one QWord/OWORD at a time).
   *   @0x21cdc1  PCString::set(new+0xd8, this+0xd8)  ; copy the name PCString
   *   @0x21cdc6  return new
   *
   * The unwind cleanup @0x21cdd4..@0x21cdff calls PCString::D1(new+0xd8) then OZChannel::D2(new)
   * then __Unwind_Resume — standard Itanium ABI.
   *
   * NOT YET TRANSCRIBED — depends on operator new (stub @0x1497452), OZChannel::C2(const&, folder),
   * PCString::C1() (stub @0x1496dda), and PCString::set(const&) (stub @0x1496db0). The vtable
   * addresses at RIP 0x16d88f7 / 0x16d8c4d are the same slices as those installed by D2/D1/D0.
   *
   * @provenance Flexo @0x21cd10
   */
  clone(): FFOZMediaRefChannel {
    throw new Error(
      "FFOZMediaRefChannel::clone() @Flexo 0x21cd10 not yet transcribed — depends on operator new " +
        "(stub @0x1497452), OZChannel::C2(const&, folder=null) (stub @0x1496f54), PCString::C1() " +
        "(stub @0x1496dda), and PCString::set(const&) (stub @0x1496db0).",
    );
  }

  /**
   * copy(OZChannelBase const*, bool) — @Flexo 0x21ce10.
   *
   * Body (170 bytes):
   *   @0x21ce1d  callq OZChannel::copy(this, other, flag)               ; base contribution
   *   @0x21ce22  if (other == null) return                                ; @0x21ce25 -> @0x21ceb8
   *   @0x21ce3e  ___dynamic_cast(other, &__ZTI13OZChannelBase, &__ZTI19FFOZMediaRefChannel, 0)
   *   @0x21ce46  if (result == null) return                              ; not-a-FFOZMediaRefChannel path
   *   @0x21ce48-@0x21ce95  byte-copy this+0x98..+0xd7 from cast+0x98..+0xd7 (same 64-byte window as clone)
   *   @0x21cea9-@0x21ceb3  tail-jmp PCString::set(this+0xd8, cast+0xd8)  ; copy PCString name
   *
   * The `flag` bool argument is passed through to the base call at @0x21ce1d but is NOT read
   * again in the derived body.
   *
   * NOT YET TRANSCRIBED — depends on the base OZChannel::copy (stub @0x1496f0c), __dynamic_cast
   * (stub @0x14974b8), and PCString::set (stub @0x1496db0).
   *
   * @provenance Flexo @0x21ce10
   */
  copy(_other: OZChannelBaseRef | null, _flag: boolean): void {
    throw new Error(
      "FFOZMediaRefChannel::copy(OZChannelBase const*, bool) @Flexo 0x21ce10 not yet transcribed — " +
        "depends on OZChannel::copy (stub @0x1496f0c), ___dynamic_cast (stub @0x14974b8), and " +
        "PCString::set (stub @0x1496db0). Field window copied: this+0x98..+0xd7 (64 bytes).",
    );
  }

  /**
   * assign(OZChannelBase const*) — @Flexo 0x21cec0.
   *
   * Same shape as `copy` but WITHOUT copying `this+0x98` (the wrapper-backing pointer). Starts at
   * +0xa0 (`movq 0xa0(%rax),%rcx; movq %rcx,0xa0(%rbx)` @0x21cef4) instead of at +0x98 — 56 bytes
   * of state (flags + two CMTimes + tails), then tail-jmp PCString::set(this+0xd8, cast+0xd8).
   *
   * NOT YET TRANSCRIBED — same deps as copy.
   *
   * @provenance Flexo @0x21cec0
   */
  assign(_other: OZChannelBaseRef | null): void {
    throw new Error(
      "FFOZMediaRefChannel::assign(OZChannelBase const*) @Flexo 0x21cec0 not yet transcribed — " +
        "depends on OZChannel::assign (stub @0x1496f12), ___dynamic_cast (stub @0x14974b8), and " +
        "PCString::set (stub @0x1496db0). Field window copied: this+0xa0..+0xd7 (56 bytes — " +
        "skips the wrapperBackingAt0x98 slot).",
    );
  }

  /**
   * compare(OZChannelBase const*) const — @Flexo 0x21cf60.
   *
   * Body (~180 bytes):
   *   @0x21cf73  base = OZChannelBase::compare(this, other)                ; bool
   *   @0x21cf7a  if (base == false) return false                            ; short-circuit
   *   @0x21cf83  if (other == null) return true                             ; both empty ≈ equal
   *   @0x21cf9b  ___dynamic_cast(other, &__ZTI13OZChannelBase, &__ZTI19FFOZMediaRefChannel, 0)
   *   @0x21cfa3  if (cast == null) return true                              ; not-comparable-as-FFOZ path == equal-base
   *   @0x21cfa8-@0x21cfd4  push a 32-byte stack window with two CMTime pairs:
   *                (a.value/timescale, a.flags/epoch)  (b.value/timescale, b.flags/epoch)
   *   @0x21cfd8  _CMTimeCompare  (stub @0x149511e)  ; libcoremedia CMTimeCompare
   *   @0x21cfdd  if (result != 0) return false                              ; times differ
   *   @0x21cfe7  cmpl this->flagsAt0xa0, cast->flagsAt0xa0                 ; flags equal?
   *   @0x21cfee  if (!=) return false
   *   @0x21cff7  cmpq this->wrapperBackingAt0x98, cast->wrapperBackingAt0x98
   *   @0x21cffe  return (equal)                                             ; sete
   *
   * NOT YET TRANSCRIBED — depends on OZChannelBase::compare (stub @0x1496fc0), __dynamic_cast
   * (stub @0x14974b8), and CMTimeCompare (stub @0x149511e).
   *
   * @provenance Flexo @0x21cf60
   */
  compare(_other: OZChannelBaseRef | null): boolean {
    throw new Error(
      "FFOZMediaRefChannel::compare(OZChannelBase const*) const @Flexo 0x21cf60 not yet " +
        "transcribed — depends on OZChannelBase::compare (stub @0x1496fc0), ___dynamic_cast " +
        "(stub @0x14974b8), and _CMTimeCompare (stub @0x149511e). Compares (in order): CMTime at " +
        "+0xa8..+0xbf, u32 flags at +0xa0, wrapperBacking ptr at +0x98.",
    );
  }

  /**
   * resetToDefault(bool) — @Flexo 0x21d020.
   *
   *   @0x21d02a  callq OZChannel::resetToDefault(this, flag)               ; base contribution
   *   @0x21d02f  this->flagsAt0xa0     = this->flagsDefaultAt0xa4          ; u32
   *   @0x21d03b  this->currentTimeAt0xa8[0..15] = this->defaultTimeAt0xc0[0..15]  ; 16 bytes movups
   *   @0x21d049  this->currentTimeAt0xa8[16..23] = this->defaultTimeAt0xc0[16..23] ; 8 bytes movq
   *   @0x21d057  r14 = this->wrapperBackingAt0x98
   *   @0x21d063  wrapper = _CHChannelWrapperForOZChannel(this, 0)          ; stub @0x1494f32
   *   @0x21d07b  tail-jmpq to ObjC selector (at RIP 0x16d063f — a "resetChannel:"-shape method)
   *              on r14 (the FCP-CH wrapper backing), with args (wrapper backing, 0, wrapper).
   *
   * NOT YET FULLY TRANSCRIBED past the base call — the terminal ObjC dispatch is a Cocoa
   * boundary and the byte-copy window depends on the FCP-CH wrapper's field layout. The three
   * scalar field-restore steps (@0x21d02f/@0x21d03b/@0x21d049) ARE decoded and modelled here.
   *
   * @provenance Flexo @0x21d020
   */
  resetToDefault(flag: boolean): void {
    this.base.resetToDefault(flag);
    // Restore flags + CMTime from the "default" slots.
    this.flagsAt0xa0 = this.flagsDefaultAt0xa4 >>> 0;
    // The two CMTime writes are 16-byte and 8-byte movups/movq — a whole-slot assignment.
    this.currentTimeAt0xa8 = this.defaultTimeAt0xc0;
    // Terminal ObjC dispatch on the FCP-CH wrapper.
    this.dispatchObjCResetOnWrapper();
  }

  /**
   * Terminal ObjC selector called by resetToDefault @0x21d07b — resets the anchor state on the
   * FCP-CH wrapper.
   * @provenance Flexo resetToDefault @0x21d07b (`jmpq *0x16d063f(%rip)`)
   */
  protected dispatchObjCResetOnWrapper(): void {
    throw new Error(
      "FFOZMediaRefChannel::resetToDefault terminal ObjC dispatch @Flexo 0x21d07b (selector at " +
        "RIP 0x16d063f) not yet transcribed — Objective-C boundary, also depends on " +
        "_CHChannelWrapperForOZChannel (stub @0x1494f32).",
    );
  }
}
