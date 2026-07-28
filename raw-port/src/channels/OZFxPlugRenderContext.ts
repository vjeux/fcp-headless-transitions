// OZFxPlugRenderContext.ts — Ozone FxPlug render context (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice).
//
// Symbols ported (raw-port/re/disasm/Ozone.OZFxPlugRenderContext.{C2,D1,D2}.s
// and the tail-thunk views in *.OZFxPlugRenderContext.s /
// *.~OZFxPlugRenderContext.s):
//   * OZFxPlugRenderContext::OZFxPlugRenderContext(
//         FxColorDescription const&, float,
//         std::__1::shared_ptr<HGComputeDevice const> const&)   [C2] @0x616b10
//   * OZFxPlugRenderContext::OZFxPlugRenderContext(
//         FxColorDescription const&, float,
//         std::__1::shared_ptr<HGComputeDevice const> const&)   [C1] @0x616d60
//                                                                    (thunk → C2)
//   * OZFxPlugRenderContext::~OZFxPlugRenderContext()            [D1] @0x619330
//                                                                    (thunk → D2)
//   * OZFxPlugRenderContext::~OZFxPlugRenderContext()            [D0] @0x619340
//                                                                    (calls D2 then operator delete)
//   * OZFxPlugRenderContext::~OZFxPlugRenderContext()            [D2] @0x619850
//
// Also referenced (in the ctor body / dtor bodies):
//   * vtable for OZFxPlugRenderContext: `__ZTV21OZFxPlugRenderContext`
//     — installed with the standard Itanium +0x10 skew.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (decoded from the C2 body @0x616b10 and D2 body @0x619850)
// -----------------------------------------------------------------------------
//   0x000  vptr                — OZFxPlugRenderContext's vtable (base+0x10),
//                                @0x616b3a install / @0x619869 dtor-reinstall.
//   0x008  u32 flag = 1        — `$0x1` written @0x616b3d.
//   0x010  u64 slotA = 0       — nominal pointer, zeroed @0x616b44.
//   0x018  PCSharedCount       — default-constructed @0x616b53.
//   0x020  vector<shared_ptr<HGComputeDevice const>>-like storage:
//           +0x20 base ptr, +0x28 end ptr, +0x30 cap-byte + flag; zeroed
//           en-bloc @0x616b65-0x616b6d.  cmpb $0x1, 0x30 test @0x61988d
//           gates a LiAgent single-slot-delete branch: dtor treats
//           `slotBase = +0x20` and `slotFlag = +0x30`.
//   0x028  u64 slotB / vector-end pointer.
//   0x030  u8  storageFlag = 0 — @0x616b6d.
//   0x034  u32 someCounter = 0 — @0x616b58.
//   0x038  u8  someByte = 0    — @0x616b60.
//   0x040  OZRenderParams*     — heap-allocated (0x5c0 bytes @0x616b72,
//                                default-ctor'd @0x616b86) and stored
//                                @0x616b8b; the dtor destroys+frees it
//                                @0x619878-0x619880.
//   0x048  LiRenderParameters  — in-place constructed @0x616bf0; dtor
//                                @0x61998e.  This is the primary embedded
//                                LiRenderParameters subobject; the size
//                                seems to be 0xd8 (offsets +0x48..+0x120).
//   0x120  shared_ptr<Li3DEngineObjectData> — zeroed by the two SSE writes
//                                @0x616c32-0x616c3d; dtor cleans it via
//                                shared_weak_count::__release_weak (see
//                                exception path @0x616cf4 and unified path
//                                @0x61995b-0x619986).
//   0x130  vector<shared_ptr<HGComputeDevice const>> — zeroed inline in the
//                                ctor via three SSE writes @0x616c35-0x616c45;
//                                dtor walks it releasing every weak-count
//                                @0x6198f2-0x619956.
//   0x14c  u32 zero = 0        — @0x616c15.
//   0x150  unique_ptr<PGPerThreadSetCurrentContextSentry>
//                                — zeroed @0x616c27; dtor pattern
//                                @0x6198cb-0x6198f2 (test-nonzero, D1, then
//                                operator delete).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all unported, cited by symbol + address)
// -----------------------------------------------------------------------------
//   * PCSharedCount::PCSharedCount()              @stub Ozone 0x6ddae8
//   * OZRenderParams::OZRenderParams()            @0x616b86 (in-binary)
//   * operator new (__Znwm, 0x5c0-byte alloc)     @stub Ozone 0x6dfca2
//   * FxColorDescription::isColorManaged() const  @stub Ozone 0x6df660
//   * PCCFRefTraits<CGColorSpace*>::retain / release
//                                                 @stub Ozone 0x6dda94 / 0x6dda9a
//   * PCColorSpaceCache::cgRec709Linear()         @stub Ozone 0x6de2fe
//   * FxColorDescription::FxColorDescription(
//         FxColorDescription const&, CGColorSpace*)
//                                                 @stub Ozone 0x6de3fa
//   * LiRenderParameters::LiRenderParameters(
//         FxColorDescription const&, float,
//         shared_ptr<HGComputeDevice const> const&)
//                                                 @stub Ozone 0x6de436
//   * OZRenderParams::setWorkingColorDescription(FxColorDescription const&)
//                                                 @0x616c58 (in-binary)
//   * OZRenderParams::setBlendingGamma(float)     @0x616c66 (in-binary)
//   * OZRenderParams::setRenderDevice(
//         shared_ptr<HGComputeDevice const> const&)
//                                                 @0x616c72 (in-binary)
//   * OZRenderParams::~OZRenderParams()           @0x619878 (in-binary)
//   * operator delete (__ZdlPv)                   @stub Ozone 0x6dfc36
//   * LiAgent::~LiAgent()                         @0x61989f (in-binary)
//   * shared_weak_count::__release_weak           @stub Ozone 0x6dfbbe
//   * PGPerThreadSetCurrentContextSentry::~D1     @stub Ozone 0x6de910
//   * LiRenderParameters::~LiRenderParameters()   @0x61998e (in-binary)
//   * PCSharedCount::~PCSharedCount()             @stub Ozone 0x6ddaee
//
// None of these are ported at this layer.
//
// -----------------------------------------------------------------------------
// D1 THUNK (@0x619330) and D0 DELETING DTOR (@0x619340)
// -----------------------------------------------------------------------------
// D1 body verbatim:
//   pushq %rbp; movq %rsp, %rbp; popq %rbp
//   jmp   __ZN21OZFxPlugRenderContextD2Ev            @0x619335
// D1 is a no-op thunk to D2.
//
// D0 body verbatim:
//   pushq %rbp; movq %rsp, %rbp; pushq %rbx; pushq %rax
//   this = rbx = rdi                                 @0x619346
//   callq __ZN21OZFxPlugRenderContextD2Ev            @0x619349
//   tail-jmp __ZdlPv(this)                           @0x619357
// D0 is the deleting-dtor variant.

/**
 * Opaque helper handles — none of these classes are transcribed yet.
 * We surface them nominally so the type surface at the ctor is honest.
 */
export type FxColorDescription = object;
export type HGComputeDevice = object;
export type OZRenderParams = object;
export type LiRenderParameters = object;
export type Li3DEngineObjectData = object;
export type PGPerThreadSetCurrentContextSentry = object;

/** `std::__1::shared_ptr<T>` is modeled as an opaque handle to the
 *  refcounted target — the control block manipulation isn't decoded here. */
export type StdSharedPtr<T> = { readonly target: T | null };

export class OZFxPlugRenderContext {
  /** @+0x00 — vtable pointer.  Installed at @0x616b3a in C2 and reinstalled
   *  at @0x619869 on dtor entry. */
  vptr: unknown = null;

  /** @+0x08 — u32 flag, set to 1 verbatim @0x616b3d. */
  flag: number = 1;

  /** @+0x10 — nominal `void*`-sized slot, zeroed @0x616b44. */
  slotA: unknown = null;

  /** @+0x18 — PCSharedCount subobject.  Default-ctor'd @0x616b53 via
   *  __ZN13PCSharedCountC1Ev.  Opaque in this layer. */
  sharedCount: unknown = null;

  /** @+0x20 — nominal vector<shared_ptr>-like base pointer, zeroed
   *  @0x616b68 (part of a two-lane SSE zeroing). */
  storageBase: unknown = null;

  /** @+0x28 — vector end pointer, zeroed with storageBase. */
  storageEnd: unknown = null;

  /** @+0x30 — SSO flag byte for the storage, zeroed @0x616b6d. */
  storageFlag: number = 0;

  /** @+0x34 — u32 counter, zeroed @0x616b58. */
  someCounter: number = 0;

  /** @+0x38 — u8 byte, zeroed @0x616b60. */
  someByte: number = 0;

  /** @+0x40 — heap `OZRenderParams*` (0x5c0 bytes).  Allocated & ctor'd in
   *  C2 @0x616b72-0x616b8b. */
  renderParams: OZRenderParams | null = null;

  /** @+0x48 — embedded LiRenderParameters subobject (size ~0xd8; occupies
   *  +0x48..+0x11f).  Constructed in place @0x616bf0. */
  liRenderParams: LiRenderParameters | null = null;

  /** @+0x120 — shared_ptr<Li3DEngineObjectData>, zeroed inline @0x616c32. */
  li3dData: StdSharedPtr<Li3DEngineObjectData> = { target: null };

  /** @+0x130 — vector<shared_ptr<HGComputeDevice const>>, zeroed inline
   *  @0x616c3d. */
  computeDevices: StdSharedPtr<HGComputeDevice>[] = [];

  /** @+0x14c — u32 zero-init counter @0x616c15. */
  slotCounter: number = 0;

  /** @+0x150 — unique_ptr<PGPerThreadSetCurrentContextSentry>.  Zeroed
   *  @0x616c27; dtor releases via @0x6198e5. */
  perThreadSentry: PGPerThreadSetCurrentContextSentry | null = null;

  /**
   * `OZFxPlugRenderContext::OZFxPlugRenderContext(FxColorDescription const&,
   *      float, std::__1::shared_ptr<HGComputeDevice const> const&)`
   *      — C2 @0x616b10.
   *
   * Body walk (see raw-port/re/disasm/Ozone.OZFxPlugRenderContext.C2.s):
   *   @0x616b10 prologue (chkstk_darwin, 0x38-byte frame).
   *   @0x616b21-0x616b2f stash rdx=shared_ptr&(→r14), xmm0=gamma→[-0x2c],
   *          rsi=colorDesc(→r12), rdi=this(→r15).
   *   @0x616b2f-0x616b3a install vtable (base + 0x10).
   *   @0x616b3d this[+0x08] = 1.
   *   @0x616b44 this[+0x10] = 0.
   *   @0x616b53 PCSharedCount::C1(&this[+0x18]).
   *   @0x616b58 this[+0x34] = 0 (u32).
   *   @0x616b60 this[+0x38] = 0 (u8).
   *   @0x616b65-0x616b6d SSE-zero this[+0x20..+0x30] (u32) with two xmm
   *          writes + a movb.
   *   @0x616b72-0x616b8b  allocate an OZRenderParams (0x5c0 bytes) via
   *          operator new, default-ctor it, store at this[+0x40].
   *   @0x616b8f-0x616bcd  IF colorDesc.isColorManaged() { copy struct
   *          fields verbatim into stack tmp @[-0x60..-0x48] with a
   *          PCCFRefTraits::retain on the CGColorSpace* @+0x00 }
   *          ELSE { PCColorSpaceCache::cgRec709Linear();
   *                FxColorDescription::FxColorDescription(&tmp, colorDesc,
   *                cs) }.
   *   @0x616bf0 LiRenderParameters::LiRenderParameters(&this[+0x48],
   *          &tmpFxColorDesc, gamma, sharedPtr).
   *   @0x616bfc PCCFRefTraits::release(tmpFxColorDesc.cgColorSpace)  if
   *          non-null.
   *   @0x616c03-0x616c45  zero this[+0x120..+0x148] (Li3D shared_ptr and
   *          the compute-devices vector storage) via three SSE writes plus
   *          a movl and an explicit `movq $0, 0x150(%r15)`.
   *   @0x616c15 this[+0x14c] = 0 (u32).
   *   @0x616c58 OZRenderParams::setWorkingColorDescription(*renderParams,
   *          &this[+0xe8])                — the LiRenderParams'
   *          FxColorDescription subobject at +0xe8.
   *   @0x616c66 OZRenderParams::setBlendingGamma(*renderParams, gamma).
   *   @0x616c72 OZRenderParams::setRenderDevice(*renderParams, sharedPtr).
   *
   * Every one of these callees is unported (see FRONTIER CALLEES above).
   * The ctor body raises with a citation.
   */
  constructor(
    _colorDesc: FxColorDescription,
    _blendingGamma: number,
    _computeDevice: StdSharedPtr<HGComputeDevice>,
  ) {
    // @0x616b10 — full ctor body requires operator new (0x5c0-byte alloc),
    //   PCSharedCount::C1, OZRenderParams::C1, FxColorDescription::C1(const&,
    //   CGColorSpace*), FxColorDescription::isColorManaged, PCCFRefTraits::
    //   retain/release, PCColorSpaceCache::cgRec709Linear, LiRenderParameters
    //   ::C1(const FxColorDesc&, float, const shared_ptr<HGComputeDevice>&),
    //   OZRenderParams::setWorkingColorDescription/setBlendingGamma/
    //   setRenderDevice — none ported. @0x616b10
    throw new Error(
      "OZFxPlugRenderContext::OZFxPlugRenderContext: requires " +
        "operator new + PCSharedCount + OZRenderParams::C1 + " +
        "FxColorDescription copy/isColorManaged + PCColorSpaceCache + " +
        "LiRenderParameters::C1 + OZRenderParams setters — none " +
        "ported. @0x616b10",
    );
  }

  /**
   * `OZFxPlugRenderContext::OZFxPlugRenderContext(FxColorDescription const&,
   *      float, std::__1::shared_ptr<HGComputeDevice const> const&)`
   *      — C1 @0x616d60.
   *
   * Body verbatim (3 insns + tail-jmp):
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp;
   *   jmp __ZN21OZFxPlugRenderContextC2ERK18FxColorDescriptionfRKNSt3__110shared_ptrIK15HGComputeDeviceEE
   *     @0x616d65.
   *
   * i.e. C1 is a no-op thunk that tail-calls C2.  In TS we forward:
   */
  static C1(
    colorDesc: FxColorDescription,
    blendingGamma: number,
    computeDevice: StdSharedPtr<HGComputeDevice>,
  ): OZFxPlugRenderContext {
    // @0x616d65: jmp C2
    return new OZFxPlugRenderContext(colorDesc, blendingGamma, computeDevice);
  }

  /**
   * `OZFxPlugRenderContext::~OZFxPlugRenderContext()` — D2 @0x619850.
   *
   * The D2 base-object destructor walks every owned resource in reverse
   * construction order.  Body (see re/disasm/Ozone.OZFxPlugRenderContext.D2.s):
   *
   *   @0x619869 this[0] = vtable (base+0x10)   ; dtor-vtable install
   *
   *   @0x61986c-0x619885  IF this[+0x40] != 0 {
   *                          OZRenderParams::~OZRenderParams(*renderParams);
   *                          __ZdlPv(renderParams);
   *                       }
   *   @0x619885           this[+0x40] = 0
   *
   *   @0x61988d-0x6198ac  IF this[+0x30] == 1 {                       // LiAgent slot flag
   *                          if (this[+0x20] != 0) {
   *                              LiAgent::~LiAgent(this[+0x20]);
   *                              __ZdlPv(this[+0x20]);
   *                          }
   *                          this[+0x20] = 0;
   *                       }
   *
   *   @0x6198b4-0x6198cb  IF this[+0x28] != 0 {
   *                          (*(void(**)(void*))(*this[+0x28] + 0x8))(this[+0x28]);
   *                          this[+0x28] = 0;
   *                       }
   *                       — virtual-slot dispatch via vtable+0x08 on the
   *                         object at +0x28.  Slot @+0x08 is unresolved
   *                         here (Itanium ABI slot 1 = complete-object
   *                         dtor for polymorphic types).
   *
   *   @0x6198cb-0x6198f2  IF this[+0x150] != 0 {
   *                          PGPerThreadSetCurrentContextSentry::~D1(...);
   *                          __ZdlPv(...);
   *                       }
   *                       this[+0x150] = 0
   *
   *   @0x6198f2-0x619956  Walk the compute-devices vector [this+0x130 .. +0x138]
   *                       in REVERSE; for each shared_ptr entry decrement its
   *                       shared_weak_count (via `lock xaddq $-1, 8(cb)`);
   *                       if the strong count hit zero, virtual-dispatch
   *                       slot +0x10 (base dtor) on the control block and
   *                       call __release_weak.  Then __ZdlPv(vector.base).
   *
   *   @0x61995b-0x619986  Same shared_weak-count release dance for the
   *                       li3dData member @[+0x128] (note: the offset is
   *                       +0x128 here, not +0x120 — that field stores the
   *                       CONTROL-BLOCK pointer of the shared_ptr).
   *
   *   @0x61998e          LiRenderParameters::~LiRenderParameters(&this[+0x48]).
   *
   *   @0x619993-@0x6199a2 tail-jmp PCSharedCount::D1(&this[+0x18]).
   *
   * All callees are unported.  We surface the cleanup shape without
   * pretending to run any of them.
   */
  static destroy_D2(self: OZFxPlugRenderContext): void {
    // @0x619869: reinstall base vtable slot (nominal here)
    self.vptr = null;

    // @0x61986c-0x619885: OZRenderParams* renderParams cleanup — unported
    // dtor + operator delete.
    self.renderParams = null;

    // @0x61988d-0x6198ac: LiAgent-slot cleanup gated on storageFlag == 1.
    if (self.storageFlag === 1) {
      // LiAgent::~LiAgent(this[+0x20]) + __ZdlPv — unported.
      self.storageBase = null;
    }

    // @0x6198b4-0x6198cb: virtual-slot dispatch on this[+0x28] slot 1.
    self.storageEnd = null;

    // @0x6198cb-0x6198f2: unique_ptr<PGPerThreadSetCurrentContextSentry>
    // release + delete — GC in TS.
    self.perThreadSentry = null;

    // @0x6198f2-0x619956: walk compute-devices vector in reverse releasing
    // each shared_weak_count — GC in TS.
    self.computeDevices = [];

    // @0x61995b-0x619986: shared_weak release for li3dData.
    self.li3dData = { target: null };

    // @0x61998e: LiRenderParameters::~D2(&this[+0x48]) — unported dtor.
    self.liRenderParams = null;

    // @0x6199a2: tail-jmp PCSharedCount::D1(&this[+0x18]) — unported.
    self.sharedCount = null;
  }

  /**
   * `OZFxPlugRenderContext::~OZFxPlugRenderContext()` — D1 @0x619330.
   *
   * Body verbatim (3 insns + tail-jmp):
   *   pushq %rbp; movq %rsp, %rbp; popq %rbp
   *   jmp __ZN21OZFxPlugRenderContextD2Ev             @0x619335
   * i.e. D1 tail-calls D2.
   */
  static destroy_D1(self: OZFxPlugRenderContext): void {
    // @0x619335: jmp D2
    OZFxPlugRenderContext.destroy_D2(self);
  }

  /**
   * `OZFxPlugRenderContext::~OZFxPlugRenderContext()` — D0 @0x619340
   * (deleting destructor).
   *
   * Body verbatim (see raw-port/re/disasm/OZFxPlugRenderContext.~OZFxPlug…s):
   *   @0x619346 this = rbx = rdi
   *   @0x619349 callq __ZN21OZFxPlugRenderContextD2Ev
   *   @0x619357 tail-jmp __ZdlPv(this)
   */
  static destroy_D0(self: OZFxPlugRenderContext): void {
    // @0x619349: D2(this)
    OZFxPlugRenderContext.destroy_D2(self);
    // @0x619357: tail-jmp __ZdlPv(this)  — GC in TS.
  }
}
