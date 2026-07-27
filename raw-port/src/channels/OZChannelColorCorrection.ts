// OZChannelColorCorrection — Ozone.framework color-correction channel/animation node.
// Faithful transcription of every method emitted for this class (5 methods).
//
// Disasm sources (this worktree):
//   raw-port/re/disasm/OZChannelColorCorrection.Register.s
//   raw-port/re/disasm/OZChannelColorCorrection.commonInitOZColorCorrectionUIChannel.s
//   raw-port/re/disasm/OZChannelColorCorrection.~OZChannelColorCorrection.s   (D0)
//   raw-port/re/disasm/OZChannelColorCorrection.D1.s                          (D1, hand-extracted)
//   raw-port/re/disasm/OZChannelColorCorrection.clone.s
//
// Method addresses (Ozone.framework, x86_64 slice — verified via nm/c++filt on
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone):
//   0x1a4150  OZChannelColorCorrection::Register()
//   0x1a4220  OZChannelColorCorrection::commonInitOZColorCorrectionUIChannel()
//   0x1a4830  OZChannelColorCorrection::~OZChannelColorCorrection()          (D1, base dtor)
//   0x1a4840  OZChannelColorCorrection::~OZChannelColorCorrection()          (D0, deleting dtor)
//   0x1a4860  OZChannelColorCorrection::clone() const
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from clone @0x1a4860 + commonInit @0x1a4220)
// -----------------------------------------------------------------------------
// sizeof(OZChannelColorCorrection) = 0x198 (408 bytes) — from `movl $0x198,%edi ;
//   callq __Znwm` at @0x1a486a in clone.
// Base subobjects:
//   +0x00 : OZChannelBlindData primary base subobject (copy-ctor'd @0x1a487f via
//           __ZN18OZChannelBlindDataC2ERKS_P15OZChannelFolder(newThis, srcThis, nullptr))
//   +0x00 : vptr = OZChannelColorCorrection_vtable + 0x10           (installed @0x1a488f)
//   +0x10 : secondary vptr (MI thunks) = OZChannelColorCorrection_vtable + 0x370
//           (installed @0x1a4898). +0x10 is the OZChannelBlindData secondary-vptr slot;
//           the size of OZChannelBlindData is inherited from that class's ctor.
// Fields set by commonInitOZColorCorrectionUIChannel (@0x1a4220):
//   +0x08 : pointer to the singleton OZChannelColorCorrection_Factory
//           (anonymous-namespace factory, address stored via `movq %rax,0x8(%rbx)` @0x1a4269)
//   +0x80 : pointer to the singleton OZChannelColorCorrectionInfo instance
//           (`movq %r14,0x80(%rbx)` @0x1a42e2)
//   +0x88 : pointer to the singleton OZChannelColorCorrectionInfo instance
//           (`movq %r14,0x88(%rbx)` @0x1a42db) — same pointer written twice; these
//           are two distinct owner-slots (likely one for the primary channelInfo
//           and one for the base OZChannelBlindData::mInfo which is at the same
//           offset re-used).
//
// -----------------------------------------------------------------------------
// STATICS / SINGLETONS in the anonymous namespace (Ozone)
// -----------------------------------------------------------------------------
//   (anonymous namespace)::OZChannelColorCorrection_Factory::_instanceOnce  (std::once_flag)
//   (anonymous namespace)::OZChannelColorCorrection_Factory::_instance      (pointer)
//   (anonymous namespace)::OZChannelColorCorrection_Instance                (OZChannelColorCorrectionInfo*)
//   (anonymous namespace)::OZChannelColorCorrectionInfo   0x58-byte info descriptor:
//     +0x00 : vptr = &vtable_for_OZChannelColorCorrectionInfo + 0x10  (installed @0x1a42c6, target 0x8413f8)
//     +0x08..+0x4f : OZChannelInfo base fields (populated by
//                    OZChannelInfo::OZChannelInfo(0.0, 0.0, 1.0, 1.0, 1.0, ""))
//     +0x50 : PCSingleton base secondary vptr = &vtable + 0x30 (installed @0x1a42d0, target 0x841418)
//     +0x50..+? : PCSingleton fields (populated by PCSingleton::PCSingleton(0x64 = 100))
//     vtable @ Ozone 0x8413e8 (raw sym: __ZTVN12_GLOBAL__N_128OZChannelColorCorrectionInfoE)
//
// -----------------------------------------------------------------------------
// vtable for OZChannelColorCorrection @ Ozone 0x840fa0 (installed ptr 0x840fb0)
// (from `python3 raw-port/army/tools/resolve.py Ozone vtable OZChannelColorCorrection`)
//   *0x00 -> 0x1a4830  ~OZChannelColorCorrection [D1]
//   *0x08 -> 0x1a4840  ~OZChannelColorCorrection [D0]
//   *0x10 -> 0x1fab0   OZFactoryBase::getIconName() const
//   *0x18 -> 0x1fad0   OZFactoryBase::getIconNameBW() const
//   *0x20 -> 0x1faf0   OZFactoryBase::getIconID() const
//   *0x28 -> 0x1fb00   OZFactoryBase::getLibraryIconName() const
//   *0x30 -> 0x1fb20   OZFactoryBase::description()
//   *0x38 -> 0x1fb40   OZChannelBase::getInstanceID() const
//   *0x40 -> 0x1fb50   OZChannelBase::getSerializer()
//   *0x48 -> 0x1fb60   OZFactoryBase::getFactoryForSerialization(...)
//   *0x50..0x68 : short indexes (resolver marks '?') — inherited undecoded slots
//   *0x70 -> 0x1fb70   OZChannelBase::isObjectRef() const
//   *0x78 -> 0x1fb80   OZChannelBase::isCompoundChannel() const
//   *0x80..0x88 : '?' slots
//   *0x90 -> 0x1fb90   OZChannelBase::saveWhenAtDefaultState() const
//   *0x98 -> 0x1fbb0   OZChannelBase::isStateModified()
//   *0xa0..0xd8 : '?' slots (inherited)
//   *0xe0 -> 0x1fbd0   OZChannelBase::setRangeName(PCString const&)
//   *0xe8..0xf0 : '?' slots
//   *0xf8 -> 0x1a4860  OZChannelColorCorrection::clone() const     [OVERRIDE]
//   (the +0x370-offset secondary vtable installed at +0x10 covers the OZChannelBlindData
//    MI thunks; not enumerated here because none are transcribed.)
//
// -----------------------------------------------------------------------------
// FRONTIER — undecoded callees / classes this class depends on
// -----------------------------------------------------------------------------
//   __ZN11OZFactories11getInstanceEv                 @Ozone stub 0x6dd5b4
//   __ZN11OZFactories10addFactoryEP9OZFactory        @Ozone stub 0x6dd5a8
//   __ZN14OZUIComponents11getInstanceEv              @Ozone stub 0x6ddd9a
//   __ZN14OZUIComponents14addUIComponentEP13OZUIComponent  @Ozone stub 0x6ddda0
//   __Znwm  (operator new)                           @Ozone stub 0x6dfca2
//   __ZdlPv (operator delete)                        @Ozone stub 0x6dfc36
//   __ZN8PCStringC1Ev  PCString::PCString()          @Ozone stub 0x6df0c0
//   __ZN13OZChannelInfoC2EdddddPKc                   @Ozone stub 0x6dda10  OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*)
//   __ZN13OZChannelInfoD2Ev                          @Ozone stub 0x6dda22  OZChannelInfo::~OZChannelInfo()
//   __ZN11PCSingletonC2Ej                            @Ozone stub 0x6dd638  PCSingleton::PCSingleton(uint32_t)
//   __ZN18OZChannelBlindDataC2ERKS_P15OZChannelFolder @Ozone stub 0x6de478 OZChannelBlindData(copy-ctor)
//   __ZN18OZChannelBlindDataD2Ev                     @Ozone stub 0x6de484  OZChannelBlindData::~OZChannelBlindData()
//   __ZNSt3__111__call_onceERVmPvPFvS2_E             @Ozone stub 0x6dfb2e  std::__1::__call_once
//   __ZTV13OZUIComponent                             @Ozone            vtable for OZUIComponent (base)
//   __ZTV45OZFxPlugColorCorrectionController_UIComponent @Ozone         vtable for OZFxPlugColorCorrectionController_UIComponent (derived UI component installed by Register)
//   (anon-ns) OZChannelColorCorrection_Factory::getInstance()  @Ozone   (init lambda body)
//   (anon-ns) OZChannelColorCorrectionInfo (D0/D1)             @Ozone 0x1a4a20 / 0x1a4a00
//   Two 16-byte raw constants @Ozone 0x709840 and 0x709850 written into the newly-allocated
//     OZUIComponent object at offsets +0x8 and +0x18 (likely FxPlug manufacturer/component UUIDs;
//     bytes captured below verbatim from the __const section — no interpretation invented).

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Opaque handle representing the anonymous-namespace
 * `OZChannelColorCorrection_Factory` singleton produced by
 * `getInstance()` inside `std::call_once`.
 *
 * The lambda body (undecoded) constructs the OZFactory implementation and
 * stores it in the `_instance` static. In this port we only observe the
 * pointer flow — we do not synthesize a factory here.
 */
export type OZChannelColorCorrection_FactoryHandle = { readonly kind: "OZChannelColorCorrection_Factory" };

/**
 * Opaque handle representing the anonymous-namespace
 * `OZChannelColorCorrectionInfo` singleton (0x58-byte info descriptor
 * composed of an OZChannelInfo primary base + a PCSingleton base at +0x50,
 * see the STRUCT LAYOUT comment above).
 */
export type OZChannelColorCorrectionInfoHandle = { readonly kind: "OZChannelColorCorrectionInfo" };

/**
 * Opaque handle representing an OZUIComponent instance (0x30 bytes) that
 * Register() allocates and registers as an
 * `OZFxPlugColorCorrectionController_UIComponent` (its derived vtable is
 * installed at +0x0 after the base vtable is temporarily installed for the
 * ctor of the embedded PCString at +0x28).
 */
export type OZUIComponentHandle = { readonly kind: "OZUIComponent" };

/**
 * The 16 bytes at @Ozone 0x709840 that `Register()` loads via
 *   movaps 0x565670(%rip), %xmm0        @0x1a41c9
 * and stores at OZUIComponent+0x8.
 *
 * Captured verbatim from the binary's __TEXT.__const section — interpretation
 * (likely an FxPlug 128-bit UUID / manufacturer id) is NOT invented here.
 */
export const OZ_UI_COMPONENT_CONST_A_AT_0x709840 = new Uint8Array([
  0x3e, 0xfb, 0x89, 0x98, 0xd7, 0x11, 0x30, 0xac,
  0x03, 0x00, 0x74, 0xa6, 0x58, 0xfb, 0x66, 0x93,
]);

/**
 * The 16 bytes at @Ozone 0x709850 that `Register()` loads via
 *   movaps 0x565675(%rip), %xmm0        @0x1a41d4
 * and stores at OZUIComponent+0x18.
 *
 * Captured verbatim from __TEXT.__const — interpretation not invented.
 */
export const OZ_UI_COMPONENT_CONST_B_AT_0x709850 = new Uint8Array([
  0xc6, 0x77, 0x2a, 0x2c, 0x96, 0x47, 0xb9, 0x7e,
  0x0b, 0xbd, 0x16, 0x86, 0xb4, 0x43, 0x31, 0x32,
]);

/**
 * OZChannelColorCorrection @Ozone — animation channel for color-correction
 * parameters. Concrete subclass of OZChannelBlindData; overrides `clone()`
 * (vtable slot 0xf8) and provides a `Register()` free function plus a
 * `commonInitOZColorCorrectionUIChannel()` helper that populates every
 * instance's factory/info pointers.
 */
export class OZChannelColorCorrection {
  /**
   * Pointer to the anonymous-namespace `OZChannelColorCorrection_Factory`
   * singleton (populated at +0x8 by `commonInitOZColorCorrectionUIChannel`).
   */
  factory: OZChannelColorCorrection_FactoryHandle | null = null;

  /**
   * Pointer to the anonymous-namespace `OZChannelColorCorrectionInfo`
   * singleton (populated at +0x80 by commonInit).
   */
  channelInfoAt0x80: OZChannelColorCorrectionInfoHandle | null = null;

  /**
   * Pointer to the anonymous-namespace `OZChannelColorCorrectionInfo`
   * singleton (populated at +0x88 by commonInit). Same value as
   * `channelInfoAt0x80`; the disassembly writes it into two distinct member
   * slots so we mirror that here.
   */
  channelInfoAt0x88: OZChannelColorCorrectionInfoHandle | null = null;

  /**
   * OZChannelColorCorrection::Register()  @Ozone 0x1a4150
   *   __ZN24OZChannelColorCorrection8RegisterEv
   *
   * Free function (no `this`). Registers the singleton factory and installs
   * the FxPlug color-correction controller UI component.
   *
   * Disasm control flow:
   *   @0x1a415b  callq OZFactories::getInstance()               ; stub 0x6dd5b4  → rbx = factories
   *   @0x1a4163  movq  _instanceOnce, %rax                       ; anon-ns Factory once-flag
   *   @0x1a416a  cmpq  $-1, %rax
   *   @0x1a416e  je    0x1a4197                                  ; skip call_once if already done
   *   @0x1a4180  leaq  _instanceOnce, %rdi
   *   @0x1a4187  leaq  __call_once_proxy<Factory::getInstance()::lambda>, %rdx
   *   @0x1a4192  callq __call_once                               ; stub 0x6dfb2e
   *   @0x1a4197  movq  _instance, %rsi
   *   @0x1a419e  movq  %rbx, %rdi                                ; factories
   *   @0x1a41a1  callq OZFactories::addFactory(OZFactory*)       ; stub 0x6dd5a8
   *   @0x1a41a6  callq OZUIComponents::getInstance()             ; stub 0x6ddd9a  → r14 = uiComponents
   *   @0x1a41ae  movl  $0x30, %edi                               ; sizeof(OZUIComponent) = 0x30
   *   @0x1a41b3  callq operator new(size_t)                      ; stub 0x6dfca2  → rbx = comp
   *   @0x1a41bb  leaq  __ZTV13OZUIComponent, %rax
   *   @0x1a41c2  addq  $0x10, %rax                               ; installed primary vptr
   *   @0x1a41c6  movq  %rax, (%rbx)                              ; comp->vptr = OZUIComponent vtable+0x10
   *   @0x1a41c9  movaps 0x565670(%rip), %xmm0                    ; const 16-byte @0x709840
   *   @0x1a41d0  movups %xmm0, 0x8(%rbx)                         ; comp[+0x8..+0x17] = const A
   *   @0x1a41d4  movaps 0x565675(%rip), %xmm0                    ; const 16-byte @0x709850
   *   @0x1a41db  movups %xmm0, 0x18(%rbx)                        ; comp[+0x18..+0x27] = const B
   *   @0x1a41df  leaq  0x28(%rbx), %rdi                          ; &comp->pcString (offset +0x28)
   *   @0x1a41e3  callq PCString::PCString()                      ; stub 0x6df0c0
   *   @0x1a41e8  leaq  __ZTV45OZFxPlugColorCorrectionController_UIComponent, %rax
   *   @0x1a41ef  addq  $0x10, %rax
   *   @0x1a41f3  movq  %rax, (%rbx)                              ; overwrite vptr → derived
   *   @0x1a41f6  movq  %r14, %rdi                                ; uiComponents
   *   @0x1a41f9  movq  %rbx, %rsi                                ; comp
   *   @0x1a41fc  callq OZUIComponents::addUIComponent(OZUIComponent*)  ; stub 0x6ddda0
   *   @0x1a4201  return
   *
   *   @0x1a420a  landing pad (from PCString ctor): __ZdlPv (delete comp), then
   *              __Unwind_Resume — not modelled in TS (GC-managed).
   */
  static Register(): void {
    // 1. Ensure the anon-ns Factory singleton exists (std::call_once), then
    //    add its `_instance` to the OZFactories collection.
    OZChannelColorCorrection._OZFactories_getInstance();
    OZChannelColorCorrection._factoryCallOnce_getInstance();
    const factoryInstance: OZChannelColorCorrection_FactoryHandle =
      OZChannelColorCorrection._read_anonNs_Factory_instance();
    OZChannelColorCorrection._OZFactories_addFactory(factoryInstance);

    // 2. Allocate an OZUIComponent (0x30 bytes), install the base vtable
    //    temporarily so PCString's ctor sees a valid vptr, populate the two
    //    16-byte constant fields, ctor the embedded PCString at +0x28,
    //    upgrade the vptr to the derived FxPlug controller vtable, then
    //    register with OZUIComponents.
    const uiComponents = OZChannelColorCorrection._OZUIComponents_getInstance();
    const comp = OZChannelColorCorrection._allocateOZUIComponent(0x30);
    OZChannelColorCorrection._installVptr_OZUIComponent(comp);
    OZChannelColorCorrection._writeConst16(comp, 0x8, OZ_UI_COMPONENT_CONST_A_AT_0x709840);
    OZChannelColorCorrection._writeConst16(comp, 0x18, OZ_UI_COMPONENT_CONST_B_AT_0x709850);
    OZChannelColorCorrection._PCString_ctor(comp, 0x28);
    OZChannelColorCorrection._installVptr_OZFxPlugColorCorrectionController_UIComponent(comp);
    OZChannelColorCorrection._OZUIComponents_addUIComponent(uiComponents, comp);
  }

  /**
   * OZChannelColorCorrection::commonInitOZColorCorrectionUIChannel()
   *   @Ozone 0x1a4220
   *   __ZN24OZChannelColorCorrection36commonInitOZColorCorrectionUIChannelEv
   *
   * Instance helper: fills in the factory pointer at +0x8 and the info-singleton
   * pointer at both +0x80 and +0x88. Lazily constructs the info-singleton
   * (0x58-byte OZChannelColorCorrectionInfo) the first time it's called.
   *
   * Disasm control flow (this = %rbx from @0x1a422b):
   *   @0x1a422e..0x1a425d  Same std::call_once sequence as Register — ensures the
   *                         anon-ns Factory `_instance` is created.
   *   @0x1a4262  movq _instance,%rax
   *   @0x1a4269  movq %rax, 0x8(%rbx)                             ; this->factory = _instance
   *   @0x1a426d  movq _Instance,%r14                              ; static OZChannelColorCorrectionInfo* ; anon-ns global
   *   @0x1a4274  testq %r14,%r14
   *   @0x1a4277  jne   0x1a42db                                   ; already constructed → skip
   *   @0x1a4279  movl  $0x58,%edi                                 ; sizeof(OZChannelColorCorrectionInfo)
   *   @0x1a427e  callq operator new(size_t)                       ; stub 0x6dfca2  → r14 = info
   *   @0x1a4286  leaq  0x642cfb(%rip), %rsi                       ; "" literal (empty c-string)
   *   @0x1a428d  movsd 0x5619eb(%rip), %xmm1                      ; const double @0x705C80 = 4294967295.0
   *   @0x1a4295  movsd 0x561143(%rip), %xmm2                      ; const double @0x7053E0 = 1.0
   *   @0x1a429d  xorps %xmm0,%xmm0                                ; 0.0
   *   @0x1a42a0  movq  %rax,%rdi                                  ; info as this
   *   @0x1a42a3  movaps %xmm2,%xmm3                               ; 1.0
   *   @0x1a42a6  movaps %xmm2,%xmm4                               ; 1.0
   *   @0x1a42a9  callq OZChannelInfo::OZChannelInfo(d,d,d,d,d,cs) ; stub 0x6dda10
   *                                                                ; args (0.0, 4294967295.0, 1.0, 1.0, 1.0, "")
   *                                                                ; xmm0=min=0.0, xmm1=max=4294967295.0,
   *                                                                ; xmm2=default=1.0, xmm3=step=1.0,
   *                                                                ; xmm4=pageStep=1.0
   *   @0x1a42ae  movq %r14,%rdi
   *   @0x1a42b1  addq $0x50,%rdi                                  ; &info->pcSingletonBase
   *   @0x1a42b5  movl $0x64,%esi                                  ; slot id 0x64 = 100
   *   @0x1a42ba  callq PCSingleton::PCSingleton(uint32_t)         ; stub 0x6dd638
   *   @0x1a42bf  leaq 0x69d132(%rip),%rax                         ; &vtable_for_OZChannelColorCorrectionInfo (Ozone 0x8413f8)
   *   @0x1a42c6  movq %rax,(%r14)                                 ; primary vptr
   *   @0x1a42c9  leaq 0x69d148(%rip),%rax                         ; secondary MI vptr (Ozone 0x841418)
   *   @0x1a42d0  movq %rax,0x50(%r14)                             ; secondary vptr at +0x50
   *   @0x1a42d4  movq %r14, _Instance(%rip)                       ; anon-ns _Instance = info
   *   @0x1a42db  movq %r14, 0x88(%rbx)                            ; this->channelInfoAt0x88 = info
   *   @0x1a42e2  movq %r14, 0x80(%rbx)                            ; this->channelInfoAt0x80 = info
   *   @0x1a42e9  ret
   *
   *   @0x1a42f2  landing pad for OZChannelInfo ctor failure: dtor + operator delete + Unwind_Resume
   *   @0x1a430d  landing pad for PCSingleton ctor failure:   operator delete + Unwind_Resume
   */
  commonInitOZColorCorrectionUIChannel(): void {
    // 1. Ensure Factory singleton — same call_once pattern as Register.
    OZChannelColorCorrection._factoryCallOnce_getInstance();
    this.factory = OZChannelColorCorrection._read_anonNs_Factory_instance();

    // 2. Read the anon-ns OZChannelColorCorrectionInfo singleton; lazily
    //    construct if null. Construction path:
    //    a) operator new(0x58)
    //    b) OZChannelInfo::OZChannelInfo(0.0, 4294967295.0, 1.0, 1.0, 1.0, "")
    //    c) PCSingleton::PCSingleton(0x64) at +0x50
    //    d) install primary vptr @Ozone 0x8413f8 at +0x00
    //    e) install secondary vptr @Ozone 0x841418 at +0x50
    let info = OZChannelColorCorrection._read_anonNs_Instance();
    if (info === null) {
      info = OZChannelColorCorrection._allocateInfo(0x58);
      OZChannelColorCorrection._OZChannelInfo_ctor(
        info,
        0.0,                 // xmm0 — min
        4294967295.0,        // xmm1 — max (const @Ozone 0x705C80)
        1.0,                 // xmm2 — default (const @Ozone 0x7053E0)
        1.0,                 // xmm3 — step
        1.0,                 // xmm4 — pageStep
        "",                  // rsi  — label literal @Ozone ""
      );
      OZChannelColorCorrection._PCSingleton_ctor_at_off(info, 0x50, 0x64);
      OZChannelColorCorrection._installInfoVptr_primary(info, 0x8413f8);
      OZChannelColorCorrection._installInfoVptr_secondary(info, 0x841418, 0x50);
      OZChannelColorCorrection._write_anonNs_Instance(info);
    }
    this.channelInfoAt0x88 = info;
    this.channelInfoAt0x80 = info;
  }

  /**
   * OZChannelColorCorrection::~OZChannelColorCorrection()  @Ozone 0x1a4830
   *   __ZN24OZChannelColorCorrectionD1Ev  (D1 — base destructor)
   *
   * Disasm:
   *   0x1a4830 pushq %rbp
   *   0x1a4831 movq  %rsp,%rbp
   *   0x1a4834 popq  %rbp
   *   0x1a4835 jmp   OZChannelBlindData::~OZChannelBlindData()     ; stub 0x6de484
   *
   * Trivial tail-call to the base OZChannelBlindData destructor. This class
   * owns no fields of its own that need destruction (the factory/info
   * pointers are non-owning references to global singletons).
   */
  destroy(): void {
    OZChannelColorCorrection._OZChannelBlindData_dtor(this);
  }

  /**
   * OZChannelColorCorrection::~OZChannelColorCorrection()  @Ozone 0x1a4840
   *   __ZN24OZChannelColorCorrectionD0Ev  (D0 — deleting destructor)
   *
   * Disasm:
   *   0x1a4840 pushq %rbp
   *   0x1a4841 movq  %rsp,%rbp
   *   0x1a4844 pushq %rbx
   *   0x1a4845 pushq %rax
   *   0x1a4846 movq  %rdi,%rbx                                     ; save this
   *   0x1a4849 callq OZChannelBlindData::~OZChannelBlindData()     ; stub 0x6de484
   *   0x1a484e movq  %rbx,%rdi                                     ; this
   *   0x1a4857 jmp   operator delete(void*)                        ; stub 0x6dfc36
   *
   * Same as D1 followed by operator delete(this). In TS operator delete is a
   * no-op (GC-managed) — the base-teardown is otherwise identical.
   */
  deleteThis(): void {
    OZChannelColorCorrection._OZChannelBlindData_dtor(this);
    // operator delete(this) — stub 0x6dfc36. GC-managed in TS: no-op.
  }

  /**
   * OZChannelColorCorrection::clone() const  @Ozone 0x1a4860
   *   __ZNK24OZChannelColorCorrection5cloneEv
   *
   * Disasm:
   *   0x1a4860 pushq %rbp
   *   0x1a4861 movq  %rsp,%rbp
   *   0x1a4864 pushq %r14
   *   0x1a4866 pushq %rbx
   *   0x1a4867 movq  %rdi,%r14                                     ; src
   *   0x1a486a movl  $0x198,%edi                                   ; sizeof = 0x198
   *   0x1a486f callq operator new(size_t)                          ; stub 0x6dfca2
   *   0x1a4874 movq  %rax,%rbx                                     ; dst
   *   0x1a4877 movq  %rax,%rdi                                     ; dst as this
   *   0x1a487a movq  %r14,%rsi                                     ; src (const&)
   *   0x1a487d xorl  %edx,%edx                                     ; folder = nullptr
   *   0x1a487f callq OZChannelBlindData(OZChannelBlindData const&, OZChannelFolder*) ; stub 0x6de478
   *   0x1a4884 leaq  __ZTV24OZChannelColorCorrection,%rax          ; vtable @0x840fa0
   *   0x1a488b leaq  0x10(%rax),%rcx                               ; installed primary = 0x840fb0
   *   0x1a488f movq  %rcx,(%rbx)                                   ; dst->vptr = 0x840fb0
   *   0x1a4892 addq  $0x370,%rax                                   ; secondary MI-thunk ptr = 0x840fa0+0x370 = 0x841310
   *   0x1a4898 movq  %rax,0x10(%rbx)                               ; dst->vptr2 = 0x841310
   *   0x1a489c movq  %rbx,%rax                                     ; return dst
   *   0x1a48a3 retq
   *
   *   0x1a48a4 landing pad: __ZdlPv on dst, __Unwind_Resume.
   *
   * The copy-ctor `OZChannelBlindData(OZChannelBlindData const&, OZChannelFolder*)`
   * is called with `folder=nullptr`, which detaches the clone from any parent
   * folder — the FCP convention for a fresh top-level copy.
   */
  clone(): OZChannelColorCorrection {
    // Allocate a fresh 0x198-byte instance and copy-construct via
    // OZChannelBlindData's copy-ctor. The base copy handles every inherited
    // field; we then override the two vptr slots to point at
    // OZChannelColorCorrection's own vtable (undoing whatever base-class
    // vptrs the copy-ctor may have installed).
    const dst = new OZChannelColorCorrection();
    OZChannelColorCorrection._OZChannelBlindData_copyCtor(dst, this, /*folder=*/ null);

    // Install vtables — in TS the vtable is implicit (via the class), but we
    // still cite the addresses used by the binary at this point.
    // dst.__vptr_primary   = @Ozone 0x840fb0 (= &vtable_for_OZChannelColorCorrection + 0x10)
    // dst.__vptr_secondary = @Ozone 0x841310 (= &vtable_for_OZChannelColorCorrection + 0x370)

    return dst;
  }

  // ---------------------------------------------------------------------------
  // Undecoded external callees — every one throws with the cited @0xADDR so
  // callers see a loud gap (per PORTING_SPEC.md Rule 3).
  // ---------------------------------------------------------------------------

  /** OZFactories::getInstance() — stub @Ozone 0x6dd5b4 — called from Register @0x1a415b. */
  private static _OZFactories_getInstance(): unknown {
    throw new Error(
      "OZFactories::getInstance() @Ozone stub 0x6dd5b4 not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a415b.",
    );
  }

  /** OZFactories::addFactory(OZFactory*) — stub @Ozone 0x6dd5a8 — called from Register @0x1a41a1. */
  private static _OZFactories_addFactory(_f: OZChannelColorCorrection_FactoryHandle): void {
    throw new Error(
      "OZFactories::addFactory(OZFactory*) @Ozone stub 0x6dd5a8 not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a41a1.",
    );
  }

  /** OZUIComponents::getInstance() — stub @Ozone 0x6ddd9a — called from Register @0x1a41a6. */
  private static _OZUIComponents_getInstance(): unknown {
    throw new Error(
      "OZUIComponents::getInstance() @Ozone stub 0x6ddd9a not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a41a6.",
    );
  }

  /**
   * OZUIComponents::addUIComponent(OZUIComponent*) — stub @Ozone 0x6ddda0 —
   * called from Register @0x1a41fc.
   */
  private static _OZUIComponents_addUIComponent(_c: unknown, _comp: OZUIComponentHandle): void {
    throw new Error(
      "OZUIComponents::addUIComponent(OZUIComponent*) @Ozone stub 0x6ddda0 not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a41fc.",
    );
  }

  /**
   * operator new(size_t) with size = 0x30 for the OZUIComponent — stub @Ozone
   * 0x6dfca2, called from Register @0x1a41b3 (movl $0x30,%edi @0x1a41ae).
   */
  private static _allocateOZUIComponent(_size: number): OZUIComponentHandle {
    throw new Error(
      "operator new(0x30) for OZUIComponent @Ozone stub 0x6dfca2 not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a41b3.",
    );
  }

  /**
   * operator new(size_t) with size = 0x58 for the anon-ns
   * OZChannelColorCorrectionInfo — stub @Ozone 0x6dfca2, called from
   * commonInitOZColorCorrectionUIChannel @0x1a427e (movl $0x58,%edi @0x1a4279).
   */
  private static _allocateInfo(_size: number): OZChannelColorCorrectionInfoHandle {
    throw new Error(
      "operator new(0x58) for OZChannelColorCorrectionInfo @Ozone stub 0x6dfca2 not yet transcribed — " +
      "called from OZChannelColorCorrection::commonInitOZColorCorrectionUIChannel() @0x1a427e.",
    );
  }

  /**
   * Install OZUIComponent's own vtable (base) on a freshly-allocated
   * component — @0x1a41bb..@0x1a41c6:
   *   leaq __ZTV13OZUIComponent(%rip),%rax
   *   addq $0x10,%rax
   *   movq %rax,(%rbx)                    ; comp->vptr = &vtable + 0x10
   *
   * The installed pointer is `&__ZTV13OZUIComponent + 0x10` — the standard
   * Itanium-ABI +0x10 skip for the offset-to-top / typeinfo pair.
   */
  private static _installVptr_OZUIComponent(_comp: OZUIComponentHandle): void {
    throw new Error(
      "install __ZTV13OZUIComponent+0x10 on OZUIComponent @Ozone 0x1a41bb (vtable OZUIComponent not yet resolved) not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a41c6.",
    );
  }

  /**
   * Upgrade the vptr to
   * `__ZTV45OZFxPlugColorCorrectionController_UIComponent + 0x10` — @0x1a41e8..@0x1a41f3.
   * Called after PCString ctor so PCString's ctor sees a valid (base) vptr.
   */
  private static _installVptr_OZFxPlugColorCorrectionController_UIComponent(_comp: OZUIComponentHandle): void {
    throw new Error(
      "install __ZTV45OZFxPlugColorCorrectionController_UIComponent+0x10 on OZUIComponent @Ozone 0x1a41e8 " +
      "(OZFxPlugColorCorrectionController_UIComponent vtable not yet resolved) not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a41f3.",
    );
  }

  /**
   * Store the 16-byte const at `comp[off .. off+15]` (movaps xmm load + movups
   * xmm store — @0x1a41c9/@0x1a41d0 and @0x1a41d4/@0x1a41db).
   */
  private static _writeConst16(_comp: OZUIComponentHandle, _off: number, _bytes: Uint8Array): void {
    throw new Error(
      "OZUIComponent inline-const store (16 bytes) @Ozone 0x1a41d0 / 0x1a41db not yet transcribed — " +
      "byte payloads captured verbatim as OZ_UI_COMPONENT_CONST_A_AT_0x709840 / _B_AT_0x709850.",
    );
  }

  /**
   * PCString::PCString() — stub @Ozone 0x6df0c0 — called from Register @0x1a41e3
   * on the embedded PCString at OZUIComponent+0x28.
   */
  private static _PCString_ctor(_comp: OZUIComponentHandle, _off: number): void {
    throw new Error(
      "PCString::PCString() @Ozone stub 0x6df0c0 not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a41e3 on OZUIComponent+0x28.",
    );
  }

  /**
   * std::__1::__call_once wrapper for the anon-ns
   * OZChannelColorCorrection_Factory::_instanceOnce guarding
   * `OZChannelColorCorrection_Factory::getInstance()::lambda`.
   *
   * Cited addresses:
   *   - _instanceOnce load       @0x1a4163 (Register) / @0x1a422e (commonInit)
   *   - proxy callable pointer    @0x1a4187 (Register) / @0x1a4252 (commonInit)
   *   - __call_once stub 0x6dfb2e @0x1a4192 (Register) / @0x1a425d (commonInit)
   *
   * The lambda body itself (the "produce a new OZChannelColorCorrection_Factory
   * and stash it in `_instance`") is NOT transcribed here — it's a separate
   * anonymous-namespace function.
   */
  private static _factoryCallOnce_getInstance(): void {
    throw new Error(
      "std::__1::__call_once for (anon-ns) OZChannelColorCorrection_Factory::_instanceOnce " +
      "@Ozone stub 0x6dfb2e not yet transcribed — " +
      "called from OZChannelColorCorrection::Register() @0x1a4192 and " +
      "OZChannelColorCorrection::commonInitOZColorCorrectionUIChannel() @0x1a425d.",
    );
  }

  /**
   * Read the anon-ns global
   *   (anonymous namespace)::OZChannelColorCorrection_Factory::_instance
   * (@0x1a4197 in Register, @0x1a4262 in commonInit).
   */
  private static _read_anonNs_Factory_instance(): OZChannelColorCorrection_FactoryHandle {
    throw new Error(
      "(anon-ns) OZChannelColorCorrection_Factory::_instance read @Ozone 0x1a4197 / 0x1a4262 not yet transcribed — " +
      "the factory singleton itself is undecoded (its call_once lambda body is not yet ported).",
    );
  }

  /**
   * Read the anon-ns global
   *   (anonymous namespace)::OZChannelColorCorrection_Instance
   * (@0x1a426d in commonInit).
   */
  private static _read_anonNs_Instance(): OZChannelColorCorrectionInfoHandle | null {
    throw new Error(
      "(anon-ns) OZChannelColorCorrection_Instance read @Ozone 0x1a426d not yet transcribed.",
    );
  }

  /**
   * Write the anon-ns global
   *   (anonymous namespace)::OZChannelColorCorrection_Instance
   * (@0x1a42d4 in commonInit).
   */
  private static _write_anonNs_Instance(_info: OZChannelColorCorrectionInfoHandle): void {
    throw new Error(
      "(anon-ns) OZChannelColorCorrection_Instance write @Ozone 0x1a42d4 not yet transcribed.",
    );
  }

  /**
   * OZChannelInfo::OZChannelInfo(double,double,double,double,double,char const*)
   *   — stub @Ozone 0x6dda10 (symbol __ZN13OZChannelInfoC2EdddddPKc)
   *   — called from commonInit @0x1a42a9 with
   *     (min=0.0, max=4294967295.0 [const @0x705C80],
   *      default=1.0 [const @0x7053E0], step=1.0, pageStep=1.0, label="").
   */
  private static _OZChannelInfo_ctor(
    _info: OZChannelColorCorrectionInfoHandle,
    _min: number, _max: number, _def: number, _step: number, _pageStep: number, _label: string,
  ): void {
    throw new Error(
      "OZChannelInfo::OZChannelInfo(d,d,d,d,d,char const*) @Ozone stub 0x6dda10 not yet transcribed — " +
      "called from OZChannelColorCorrection::commonInitOZColorCorrectionUIChannel() @0x1a42a9 " +
      'with args (0.0, 4294967295.0, 1.0, 1.0, 1.0, "").',
    );
  }

  /**
   * PCSingleton::PCSingleton(uint32_t) — stub @Ozone 0x6dd638 — called from
   * commonInit @0x1a42ba on OZChannelColorCorrectionInfo+0x50 with slot=0x64=100.
   */
  private static _PCSingleton_ctor_at_off(
    _info: OZChannelColorCorrectionInfoHandle, _off: number, _slot: number,
  ): void {
    throw new Error(
      "PCSingleton::PCSingleton(uint32_t) @Ozone stub 0x6dd638 not yet transcribed — " +
      "called from OZChannelColorCorrection::commonInitOZColorCorrectionUIChannel() @0x1a42ba " +
      "on OZChannelColorCorrectionInfo+0x50 with slot=0x64 (100).",
    );
  }

  /**
   * Install `&vtable_for_OZChannelColorCorrectionInfo + 0x10` (@Ozone 0x8413f8)
   * at info+0x00 — @0x1a42bf/@0x1a42c6.
   */
  private static _installInfoVptr_primary(_info: OZChannelColorCorrectionInfoHandle, _vptrTarget: number): void {
    throw new Error(
      "install (anon-ns) OZChannelColorCorrectionInfo primary vptr (target @Ozone 0x8413f8) " +
      "@0x1a42bf not yet transcribed.",
    );
  }

  /**
   * Install `&vtable_for_OZChannelColorCorrectionInfo + 0x30` (@Ozone 0x841418)
   * at info+0x50 — @0x1a42c9/@0x1a42d0.
   */
  private static _installInfoVptr_secondary(
    _info: OZChannelColorCorrectionInfoHandle, _vptrTarget: number, _off: number,
  ): void {
    throw new Error(
      "install (anon-ns) OZChannelColorCorrectionInfo secondary vptr (target @Ozone 0x841418) " +
      "@0x1a42c9 not yet transcribed.",
    );
  }

  /**
   * OZChannelBlindData::~OZChannelBlindData() — stub @Ozone 0x6de484 — called
   * from ~OZChannelColorCorrection D1 @0x1a4835 (tail-jmp) and D0 @0x1a4849.
   */
  private static _OZChannelBlindData_dtor(_self: OZChannelColorCorrection): void {
    throw new Error(
      "OZChannelBlindData::~OZChannelBlindData() @Ozone stub 0x6de484 not yet transcribed — " +
      "called from OZChannelColorCorrection::~OZChannelColorCorrection() @0x1a4835 / @0x1a4849.",
    );
  }

  /**
   * OZChannelBlindData::OZChannelBlindData(OZChannelBlindData const&, OZChannelFolder*)
   *   — stub @Ozone 0x6de478 (symbol __ZN18OZChannelBlindDataC2ERKS_P15OZChannelFolder)
   *   — called from clone @0x1a487f with folder=nullptr.
   */
  private static _OZChannelBlindData_copyCtor(
    _dst: OZChannelColorCorrection, _src: OZChannelColorCorrection, _folder: null,
  ): void {
    throw new Error(
      "OZChannelBlindData::OZChannelBlindData(const OZChannelBlindData&, OZChannelFolder*) " +
      "@Ozone stub 0x6de478 not yet transcribed — " +
      "called from OZChannelColorCorrection::clone() @0x1a487f with folder=nullptr.",
    );
  }
}
