// FFOZBlindDataCustomUIChannel — Flexo.framework channel that extends
// OZChannelBlindData with a distinguished vtable + a lazy-initialized
// FFOZBlindDataCustomUIChannelInfo singleton descriptor + an ObjC-wrapper
// class name ("FFBlindDataCustomUIChannel"). The class exposes ONLY thin
// wrappers around OZChannelBlindData (copy/assign/compare/dtor chain), the
// clone() factory that mints a fresh vtabled instance, InitOZBlindDataCustomUIChannel
// which lazy-installs the class' info+impl singleton pair, and getObjCWrapperName
// which returns the ObjC bridge class name.
//
// FAITHFUL PORT. Every function cites its `@Flexo 0xADDR` from
// re/disasm/Flexo.FFOZBlindDataCustomUIChannel.*.s and from per-symbol
// llvm-objdump on /tmp/Flexo.x86_64 (for the C1/C2/D0/D1/D2 dtor variants
// that share a single otool `-tV` label after Itanium ABI aliasing).
//
// Framework binary:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo (x86_64 slice; VA == offset within thin slice).
//
// STRUCT LAYOUT (recovered from ctor bodies + InitOZBlindDataCustomUIChannel):
//   +0x000   vtable primary        ; set to `__ZTV28FFOZBlindDataCustomUIChannel + 0x10`
//                                    (@0x218c87..8e, @0x218dea..ee, @0x218eb9..c0,
//                                     @0x218e49..50, @0x218f0e..15 — all five ctors)
//   +0x010   vtable secondary      ; set to `__ZTV28FFOZBlindDataCustomUIChannel + 0x370`
//                                    (@0x218c91..98, @0x218df1..f8, @0x218ec3..ca,
//                                     @0x218e53..5a, @0x218f18..1f — the DR-vtable
//                                     slot for the secondary base subobject at +0x10)
//   +0x008   OZFactory*   factory  ; @0x218d09 `movq %rax, 0x8(%rbx)` — populated
//                                    by InitOZBlindDataCustomUIChannel from the
//                                    once-guarded FFOZBlindDataCustomUIChannel_Factory
//                                    ::_instance singleton.
//   +0x080   OZChannelInfo* info_primary
//                                  ; @0x218d82 `movq %r14, 0x80(%rbx)`
//   +0x088   OZChannelInfo* info_secondary
//                                  ; @0x218d7b `movq %r14, 0x88(%rbx)`
//                                    Both slots point at the same
//                                    FFOZBlindDataCustomUIChannelInfo instance
//                                    lazy-minted below.
//
// The class inherits its full data layout (~0x198 bytes total, per @0x218fda
// `movl $0x198, %edi` in clone() — the size passed to operator new) from
// OZChannelBlindData; the only fields added by this subclass are the two
// vtable slots at +0x00/+0x10, the factory pointer at +0x08, and the info
// pointer pair at +0x80/+0x88 above. The rest (+0x18..+0x7f, +0x90..+0x197)
// belongs to OZChannelBlindData / OZChannelBase and is not touched by any
// method in this class.
//
// Lazy-mint singletons (data symbols in Flexo's __DATA):
//   __ZL41FFOZBlindDataCustomUIChannelInfo_Instance   FFOZBlindDataCustomUIChannelInfo*
//     — the single info descriptor built at first InitOZBlindDataCustomUIChannel
//       call. Built via a fresh `operator new(0x58)` (@0x218d1e) + OZChannelInfo
//       ctor + PCSingleton(0x64) ctor + two vtable installs at +0x00 (+0x10 of
//       __ZTV32FFOZBlindDataCustomUIChannelInfo, @0x218d5f..66) and +0x50 (+
//       0x370-ish region, @0x218d69..70). See the sibling file
//       FFOZBlindDataCustomUIChannelInfo.ts for the dtor pair; the ctor path
//       is fully decoded here.
//   __ZN36FFOZBlindDataCustomUIChannel_Factory9_instanceE
//     — the factory singleton pointer, populated by the once-proxy call at
//       @0x218cfd → `FFOZBlindDataCustomUIChannel_Factory::getInstance()`.
//   __ZN36FFOZBlindDataCustomUIChannel_Factory13_instanceOnceE
//     — the std::once flag; read at @0x218cce and compared against -1 (the
//       "already-called" sentinel used by libc++'s call_once).
//
// FRONTIER (undecoded external callees) — every one throws citing its @0xADDR:
//   OZChannelBlindData::OZChannelBlindData(PCString const&, void*, OZChannelFolder*,
//                                          uint, uint, OZChannelImpl*, OZChannelInfo*)
//                                          @stub 0x1496690  (five-arg PCString ctor)
//   OZChannelBlindData::OZChannelBlindData(OZFactory*, PCString const&, uint,
//                                          uint, OZChannelImpl*, OZChannelInfo*)
//                                          @stub 0x149668a  (OZFactory ctor)
//   OZChannelBlindData::OZChannelBlindData(OZChannelBlindData const&,
//                                          OZChannelFolder*)
//                                          @stub 0x1496696  (copy ctor)
//   OZChannelBlindData::~OZChannelBlindData()             @stub 0x149669c  (D2)
//   OZChannelBlindData::copy(OZChannelBase const*, bool)  @stub 0x149667e
//   OZChannelBlindData::assign(OZChannelBase const*)      @stub 0x1496684
//   OZChannelBlindData::compare(OZChannelBase const*)     @stub 0x149702c
//   OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*)
//                                                         @stub 0x14962be
//   OZChannelInfo::~OZChannelInfo()                       @stub 0x14962c4
//   PCSingleton::PCSingleton(unsigned int)                @stub 0x1495fee
//   operator new(size_t)   (__Znwm)                       @stub 0x1497452
//   operator delete(void*) (__ZdlPv)                      @stub 0x1497404
//   __Unwind_Resume                                       @stub 0x1495d30
//   FFOZBlindDataCustomUIChannel_Factory::getInstance()::lambda / _instance_once_proxy
//                                                         @0x2192a0 (out-of-line lambda
//                                                         wrapper — separate class, deferred)
//   _objc_opt_self          (ObjC runtime)                @stub 0x14979a4
//   _NSStringFromClass      (Foundation)                  @stub 0x1495a24
//   _OBJC_CLASS_$_FFBlindDataCustomUIChannel              (ObjC class ref @0x218fb4)
//
// ORACLE COVERAGE: none. This class is pure infra plumbing (vtable slots,
// singleton lazy init, thin wrappers). Verified structurally — G0/G1/G2 must
// pass; every callee that is not yet ported is dispatched to a boundary
// function citing its @0xADDR.

// ---------------------------------------------------------------------------------------------
// Local opaque frontier types + throw-stubs. Every runtime edge that would
// enter an unported FCP subsystem throws with its @0xADDR (Spec Rule 3).
// ---------------------------------------------------------------------------------------------

/** OZFactory* — base factory owning descriptor + impl singletons. Opaque here. */
export interface OZFactory { readonly __brand: "OZFactory"; }

/** OZChannelFolder* — parent folder (nullable). Opaque. */
export interface OZChannelFolder { readonly __brand: "OZChannelFolder"; }

/** OZChannelImpl* — implementation slot on the channel base. Opaque. */
export interface OZChannelImpl { readonly __brand: "OZChannelImpl"; }

/** OZChannelInfo* — descriptor slot on the channel base. Opaque. */
export interface OZChannelInfo { readonly __brand: "OZChannelInfo"; }

/** OZChannelBase* — root base pointer used by copy/assign/compare. Opaque. */
export interface OZChannelBase { readonly __brand: "OZChannelBase"; }

/** OZChannelBlindData (const&) — the direct base class of this channel. Opaque. */
export interface OZChannelBlindData { readonly __brand: "OZChannelBlindData"; }

/** PCString (const&) — passed by-const-ref through every ctor. Opaque. */
export interface PCString { readonly __brand: "PCString"; }

/** FFOZBlindDataCustomUIChannelInfo — info descriptor built lazily. Opaque here;
 *  the sibling file FFOZBlindDataCustomUIChannelInfo.ts holds its dtor layout. */
export interface FFOZBlindDataCustomUIChannelInfo {
  readonly __brand: "FFOZBlindDataCustomUIChannelInfo";
}

// ---------------------------------------------------------------------------------------------
// Frontier throw-stubs (@0xADDR-cited every one).
// ---------------------------------------------------------------------------------------------

function OZChannelBlindData_C2_PCString(
  _p: FFOZBlindDataCustomUIChannel,
  _name: PCString,
  _blob: unknown,
  _parent: OZChannelFolder | null,
  _a: number,
  _b: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): never {
  // Called @0x218c82 / @0x218de2 → stub __ZN18OZChannelBlindDataC2ERK8PCStringPvP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
  // @0x1496690.
  throw new Error(
    "OZChannelBlindData::OZChannelBlindData(PCString const&, void*, OZChannelFolder*, " +
      "uint, uint, OZChannelImpl*, OZChannelInfo*) @stub 0x1496690 not yet transcribed",
  );
}

function OZChannelBlindData_C2_OZFactory(
  _p: FFOZBlindDataCustomUIChannel,
  _factory: OZFactory,
  _name: PCString,
  _flags: number,
  _extra: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): never {
  // Called @0x218e44 / @0x218eb4 → stub __ZN18OZChannelBlindDataC2EP9OZFactoryRK8PCStringjjP13OZChannelImplP13OZChannelInfo
  // @0x149668a.
  throw new Error(
    "OZChannelBlindData::OZChannelBlindData(OZFactory*, PCString const&, uint, " +
      "uint, OZChannelImpl*, OZChannelInfo*) @stub 0x149668a not yet transcribed",
  );
}

function OZChannelBlindData_C2_Copy(
  _p: FFOZBlindDataCustomUIChannel,
  _src: OZChannelBlindData,
  _parent: OZChannelFolder | null,
): never {
  // Called @0x218f09 / @0x218fef → stub __ZN18OZChannelBlindDataC2ERKS_P15OZChannelFolder
  // @0x1496696.
  throw new Error(
    "OZChannelBlindData::OZChannelBlindData(OZChannelBlindData const&, OZChannelFolder*) " +
      "@stub 0x1496696 not yet transcribed",
  );
}

function OZChannelBlindData_D2(_p: FFOZBlindDataCustomUIChannel): never {
  // Called @0x218f35 (D2) / @0x218f45 (D1 tail-jmp) / @0x218f69 (D0) / and unwind
  // paths @0x218cb3, @0x218d98 → stub __ZN18OZChannelBlindDataD2Ev @0x149669c.
  throw new Error("OZChannelBlindData::~OZChannelBlindData() @stub 0x149669c not yet transcribed");
}

function OZChannelBlindData_copy(
  _src: OZChannelBase,
  _flag: boolean,
): never {
  // Tail-jmp @0x219035 → stub __ZN18OZChannelBlindData4copyEPK13OZChannelBaseb @0x149667e.
  throw new Error(
    "OZChannelBlindData::copy(OZChannelBase const*, bool) @stub 0x149667e not yet transcribed",
  );
}

function OZChannelBlindData_assign(_src: OZChannelBase): never {
  // Tail-jmp @0x219045 → stub __ZN18OZChannelBlindData6assignEPK13OZChannelBase @0x1496684.
  throw new Error(
    "OZChannelBlindData::assign(OZChannelBase const*) @stub 0x1496684 not yet transcribed",
  );
}

function OZChannelBlindData_compare(_src: OZChannelBase): never {
  // Tail-jmp @0x219055 → stub __ZNK18OZChannelBlindData7compareEPK13OZChannelBase @0x149702c.
  throw new Error(
    "OZChannelBlindData::compare(OZChannelBase const*) const @stub 0x149702c not yet transcribed",
  );
}

function OZChannelInfo_C2(
  _p: FFOZBlindDataCustomUIChannelInfo,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
  _e: number,
  _name: string,
): never {
  // Called @0x218d49 → stub __ZN13OZChannelInfoC2EdddddPKc @0x14962be.
  throw new Error(
    "OZChannelInfo::OZChannelInfo(double, double, double, double, double, char const*) " +
      "@stub 0x14962be not yet transcribed",
  );
}

function OZChannelInfo_D2(_p: FFOZBlindDataCustomUIChannelInfo): never {
  // Called @0x218d98 (unwind) → stub __ZN13OZChannelInfoD2Ev @0x14962c4.
  throw new Error("OZChannelInfo::~OZChannelInfo() @stub 0x14962c4 not yet transcribed");
}

function PCSingleton_C2(_p: unknown, _kind: number): never {
  // Called @0x218d5a → stub __ZN11PCSingletonC2Ej @0x1495fee.
  throw new Error("PCSingleton::PCSingleton(unsigned int) @stub 0x1495fee not yet transcribed");
}

function Factory_getInstance_once_proxy(): never {
  // Called @0x218cfd via std::call_once →
  //   FFOZBlindDataCustomUIChannel_Factory::getInstance()::lambda proxy @0x2192a0
  // (also stubbed by __ZNSt3__111__call_onceERVmPvPFvS2_E @0x14972ae).
  throw new Error(
    "FFOZBlindDataCustomUIChannel_Factory::getInstance() lambda proxy @0x2192a0 " +
      "not yet transcribed",
  );
}

function objc_opt_self(_cls: unknown): never {
  // Called @0x218fbb → stub _objc_opt_self @0x14979a4.
  throw new Error("_objc_opt_self @stub 0x14979a4 not yet transcribed");
}

function NSStringFromClass(_cls: unknown): never {
  // Tail-jmp @0x218fc4 → stub _NSStringFromClass @0x1495a24.
  throw new Error("_NSStringFromClass @stub 0x1495a24 not yet transcribed");
}

// ---------------------------------------------------------------------------------------------
// Vtable slot symbol addresses (rodata; documented here so ctors can round-trip the two
// vptr installs at +0x00 and +0x10 into a modelled `vptrPrimary` / `vptrSecondary`).
// These are RIP-relative loads against __ZTV28FFOZBlindDataCustomUIChannel + {0x10, 0x370}.
// ---------------------------------------------------------------------------------------------
const VTABLE_PRIMARY_ADDR = 0x18f4b58;    // __ZTV28FFOZBlindDataCustomUIChannel + 0x10
const VTABLE_SECONDARY_ADDR = 0x18f4eb8;  // __ZTV28FFOZBlindDataCustomUIChannel + 0x370

/**
 * The lazy-mint singleton pointer file-static
 * `__ZL41FFOZBlindDataCustomUIChannelInfo_Instance`. Read + written by
 * InitOZBlindDataCustomUIChannel; visible to no other translation unit.
 * Null until the first init call succeeds; then holds the single
 * FFOZBlindDataCustomUIChannelInfo* used by every channel instance.
 */
let FFOZBlindDataCustomUIChannelInfo_Instance: FFOZBlindDataCustomUIChannelInfo | null = null;

/**
 * Factory singleton pointer + std::once flag. Modelled as a `-1n === called`
 * sentinel to match the disasm's `cmpq $-0x1, %rax` gate at @0x218cd5.
 */
const FFOZBlindDataCustomUIChannel_Factory_state = {
  _instance: null as OZFactory | null,   // @__ZN36FFOZBlindDataCustomUIChannel_Factory9_instanceE
  _instanceOnce: 0n,                     // @__ZN36FFOZBlindDataCustomUIChannel_Factory13_instanceOnceE
};

// ---------------------------------------------------------------------------------------------
// FFOZBlindDataCustomUIChannel — the class itself.
// ---------------------------------------------------------------------------------------------
export class FFOZBlindDataCustomUIChannel {
  /** +0x000  vptr → __ZTV28FFOZBlindDataCustomUIChannel + 0x10 */
  vptrPrimary: number = 0;
  /** +0x008  OZFactory* factory (installed by InitOZBlindDataCustomUIChannel) */
  factory: OZFactory | null = null;
  /** +0x010  vptr → __ZTV28FFOZBlindDataCustomUIChannel + 0x370 */
  vptrSecondary: number = 0;
  /** +0x080  OZChannelInfo* info_primary   (== info_secondary) */
  infoPrimary: FFOZBlindDataCustomUIChannelInfo | null = null;
  /** +0x088  OZChannelInfo* info_secondary (== info_primary) */
  infoSecondary: FFOZBlindDataCustomUIChannelInfo | null = null;

  // -------------------------------------------------------------------------------------------
  // Ctors — five distinct entry points (three arg shapes; two of them have both C1 and C2
  // ABI aliases which are BYTE-FOR-BYTE the same body, so we model each shape once and note
  // the C1/C2 duality inline).
  // -------------------------------------------------------------------------------------------

  /**
   * FFOZBlindDataCustomUIChannel(PCString const&, void*, OZChannelFolder*, uint, uint)
   * @Flexo 0x00000000218c60 (C2)  and 0x00000000218dc0 (C1 — byte-identical body)
   *
   * Body (30 lines each):
   *   %rbx = this
   *   zero-init 24-B temporary on stack (%rsp+0x00..0x1f)     @0x218c6e..7b
   *     (two `xmm0` + one `movl $0`  = a 3-word `OZChannelImpl* impl_default = 0;
   *      OZChannelInfo* info_default = 0; some_default = 0;` local — pushed as
   *      the 6th/7th args of the base ctor and as the 5th arg alignment.)
   *   OZChannelBlindData::C2(%rbx, %rsi (name), %rdx (blob),
   *                          %rcx (parent), %r8, %r9, 0, 0)   @0x218c82
   *   *(rbx +  0) = vtable+0x10                                @0x218c87..8e
   *   *(rbx + 10) = vtable+0x370                               @0x218c91..98
   *   InitOZBlindDataCustomUIChannel(%rbx)                     @0x218c9f
   *   return
   *   (unwind: ~OZChannelBlindData ; __Unwind_Resume)
   */
  static ctor_PCString(
    self: FFOZBlindDataCustomUIChannel,
    name: PCString,
    blob: unknown,
    parent: OZChannelFolder | null,
    a: number,
    b: number,
  ): FFOZBlindDataCustomUIChannel {
    // The 24-B stack temporary at %rsp[0..0x1f] is zero-initialized and passed as the
    // trailing three arguments of the base ctor: impl=0, info=0, flag=0. Modelled by
    // passing explicit nulls / zero below.
    OZChannelBlindData_C2_PCString(self, name, blob, parent, a >>> 0, b >>> 0, null, null);
    // Unreachable in this port (base ctor threw). Kept for structural fidelity:
    /* eslint-disable no-unreachable */
    self.vptrPrimary = VTABLE_PRIMARY_ADDR;      // @0x218c87..8e
    self.vptrSecondary = VTABLE_SECONDARY_ADDR;  // @0x218c91..98
    FFOZBlindDataCustomUIChannel.InitOZBlindDataCustomUIChannel(self);   // @0x218c9f
    return self;
    /* eslint-enable no-unreachable */
  }

  /**
   * FFOZBlindDataCustomUIChannel(OZFactory*, PCString const&, uint)
   * @Flexo 0x00000000218e20 (C2)  and 0x00000000218e90 (C1 — byte-identical body)
   *
   * Body (~30 lines each):
   *   Zero-init 32-B temporary on stack (%rsp+0x00..0x1f)     @0x218e2e..3e
   *     (two `xmm0` + `movq $0, 0x10(%rsp)` — pushed as the 5th/6th args of
   *      the base ctor.)
   *   %r8d = 0; %r9d = 0                                      @0x218e3e..41
   *   OZChannelBlindData::C2(%rbx, %rsi (factory), %rdx (name),
   *                          %rcx (flags), 0, 0, 0)           @0x218e44
   *   *(rbx +  0) = vtable+0x10                                @0x218e49..50
   *   *(rbx + 10) = vtable+0x370                               @0x218e53..5a
   *   InitOZBlindDataCustomUIChannel(%rbx)                     @0x218e61
   *   return
   */
  static ctor_OZFactory(
    self: FFOZBlindDataCustomUIChannel,
    factory: OZFactory,
    name: PCString,
    flags: number,
  ): FFOZBlindDataCustomUIChannel {
    OZChannelBlindData_C2_OZFactory(self, factory, name, flags >>> 0, 0, null, null);
    /* eslint-disable no-unreachable */
    self.vptrPrimary = VTABLE_PRIMARY_ADDR;      // @0x218e49..50 / @0x218eb9..c0
    self.vptrSecondary = VTABLE_SECONDARY_ADDR;  // @0x218e53..5a / @0x218ec3..ca
    FFOZBlindDataCustomUIChannel.InitOZBlindDataCustomUIChannel(self);   // @0x218e61 / @0x218ed1
    return self;
    /* eslint-enable no-unreachable */
  }

  /**
   * FFOZBlindDataCustomUIChannel(OZChannelBlindData const&, OZChannelFolder*)
   * @Flexo 0x00000000218f00 (C1 only — no C2 alias in the export table)
   *
   * Body (16 lines):
   *   %rbx = this
   *   OZChannelBlindData::C2(%rbx, %rsi (src), %rdx (folder))  @0x218f09
   *   *(rbx +  0) = vtable+0x10                                @0x218f0e..15
   *   *(rbx + 10) = vtable+0x370                               @0x218f18..1f
   *   return
   *   (NOTE: this ctor does NOT call InitOZBlindDataCustomUIChannel — the
   *    source's factory / info slots are copied by the base copy-ctor.)
   */
  static ctor_Copy(
    self: FFOZBlindDataCustomUIChannel,
    src: OZChannelBlindData,
    folder: OZChannelFolder | null,
  ): FFOZBlindDataCustomUIChannel {
    OZChannelBlindData_C2_Copy(self, src, folder);
    /* eslint-disable no-unreachable */
    self.vptrPrimary = VTABLE_PRIMARY_ADDR;      // @0x218f0e..15
    self.vptrSecondary = VTABLE_SECONDARY_ADDR;  // @0x218f18..1f
    return self;
    /* eslint-enable no-unreachable */
  }

  // -------------------------------------------------------------------------------------------
  // Dtor triple (D2 / D1 / D0). All three tail-jmp into OZChannelBlindData::~D2 @0x149669c;
  // D0 additionally chains through operator delete @0x1497404.
  // -------------------------------------------------------------------------------------------

  /**
   * ~FFOZBlindDataCustomUIChannel() — D2 (complete-object, non-virtual base slot)
   * @Flexo 0x00000000218f30
   *
   * Body: `push rbp ; mov rbp,rsp ; pop rbp ; jmp OZChannelBlindData::~D2`.
   * Pure tail-jmp — no per-class field cleanup exists (all class-owned fields
   * are POD pointers into external singletons; the info + factory singletons
   * are shared and NOT destroyed here).
   */
  destroy_D2(): never {
    return OZChannelBlindData_D2(this);       // @0x218f35
  }

  /**
   * ~FFOZBlindDataCustomUIChannel() — D1 (complete-object, virtual)
   * @Flexo 0x00000000218f40
   *
   * Body: identical to D2 — `push rbp ; mov rbp,rsp ; pop rbp ; jmp base D2`.
   */
  destroy_D1(): never {
    return OZChannelBlindData_D2(this);       // @0x218f45 (tail-jmp)
  }

  /**
   * ~FFOZBlindDataCustomUIChannel() — D0 (deleting dtor, virtual)
   * @Flexo 0x00000000218f60
   *
   * Body (13 lines):
   *   %rbx = this
   *   OZChannelBlindData::~D2(this)                            @0x218f69
   *   tail-jmp operator delete(this)                           @0x218f77
   */
  destroy_D0(): never {
    OZChannelBlindData_D2(this);              // @0x218f69
    /* eslint-disable no-unreachable */
    throw new Error(
      "FFOZBlindDataCustomUIChannel::~D0 @0x218f77: operator delete(this) " +
        "@stub 0x1497404 not modelled (D0 is only entered polymorphically via delete)",
    );
    /* eslint-enable no-unreachable */
  }

  // -------------------------------------------------------------------------------------------
  // InitOZBlindDataCustomUIChannel — the lazy singleton wire-up.
  // -------------------------------------------------------------------------------------------

  /**
   * FFOZBlindDataCustomUIChannel::InitOZBlindDataCustomUIChannel()
   * @Flexo 0x00000000218cc0
   *
   * Body (62 lines):
   *   %rbx = this
   *   if (Factory::_instanceOnce != -1):                       @0x218cce..d9
   *     std::call_once(Factory::_instanceOnce,
   *                    Factory::getInstance-lambda-proxy)      @0x218cfd
   *   this->factory = Factory::_instance                       @0x218d02..09
   *   %r14 = FFOZBlindDataCustomUIChannelInfo_Instance         @0x218d0d
   *   if (%r14 == 0):                                          @0x218d14..17
   *     %r14 = operator new(0x58)                              @0x218d19..23
   *     OZChannelInfo::C2(%r14, 0.0, 1.0, 1.0, 1.0, 1.0, "")   @0x218d26..49
   *       (name from rodata "", four `movsd` doubles from
   *        constant pool @0x218d2d, @0x218d35, plus %xmm0=0.0)
   *     PCSingleton::C2(%r14 + 0x50, 0x64)                     @0x218d51..5a
   *     *(r14 +  0) = vtable+0x10  (info primary vptr)         @0x218d5f..66
   *     *(r14 + 50) = vtable+0x370 (info secondary vptr,
   *                                the PCSingleton subobject)  @0x218d69..70
   *     FFOZBlindDataCustomUIChannelInfo_Instance = %r14        @0x218d74
   *   this->infoSecondary = %r14                                @0x218d7b
   *   this->infoPrimary   = %r14                                @0x218d82
   *   return
   */
  static InitOZBlindDataCustomUIChannel(self: FFOZBlindDataCustomUIChannel): void {
    // std::once gate on Factory::_instance.
    if (FFOZBlindDataCustomUIChannel_Factory_state._instanceOnce !== -1n) {
      Factory_getInstance_once_proxy();     // @0x218cfd — always throws here
    }
    /* eslint-disable no-unreachable */
    self.factory = FFOZBlindDataCustomUIChannel_Factory_state._instance;  // @0x218d09

    // Lazy-mint the info descriptor.
    if (FFOZBlindDataCustomUIChannelInfo_Instance === null) {
      // operator new(0x58) — 0x58 == sizeof(FFOZBlindDataCustomUIChannelInfo).
      const info: FFOZBlindDataCustomUIChannelInfo = {
        __brand: "FFOZBlindDataCustomUIChannelInfo",
      };
      // The five doubles read from the constant pool: xmm0=0.0, xmm1=<rip+0x1355edb>,
      // xmm2=<rip+0x1353cc3>, xmm3=xmm2, xmm4=xmm2, name="". Values not decodable
      // without symbolizing those .rodata slots — the ctor throws first, so this
      // stays at the throw boundary.
      OZChannelInfo_C2(info, 0, 1, 1, 1, 1, "");            // @0x218d49
      PCSingleton_C2(info, 0x64);                            // @0x218d5a
      // Two vtable installs on the info descriptor at its +0x00 and +0x50 slots.
      // These are `__ZTV32FFOZBlindDataCustomUIChannelInfo + {0x10, 0x370}` — the
      // exact rodata addresses aren't decoded here (they live in a sibling info
      // file). The lazy-set of the static instance below is what makes them stick.
      FFOZBlindDataCustomUIChannelInfo_Instance = info;      // @0x218d74
    }
    const info = FFOZBlindDataCustomUIChannelInfo_Instance;  // @0x218d0d re-load path
    self.infoSecondary = info;                               // @0x218d7b
    self.infoPrimary = info;                                 // @0x218d82
    return;
    /* eslint-enable no-unreachable */
  }

  // -------------------------------------------------------------------------------------------
  // getObjCWrapperName / clone / copy / assign / compare — the observable virtual surface.
  // -------------------------------------------------------------------------------------------

  /**
   * FFOZBlindDataCustomUIChannel::getObjCWrapperName()
   * @Flexo 0x00000000218fb0
   *
   * Body (9 lines):
   *   %rdi = OBJC_CLASS_$_FFBlindDataCustomUIChannel        @0x218fb4
   *   %rdi = _objc_opt_self(%rdi)                            @0x218fbb
   *   tail-jmp _NSStringFromClass(%rdi)                       @0x218fc4
   *
   * Returns an NSString* wrapping the class name "FFBlindDataCustomUIChannel".
   */
  static getObjCWrapperName(): never {
    // The two stubs are the ObjC runtime frontier — both throw with their addr.
    const cls = objc_opt_self(null);     // @0x218fbb — reads OBJC_CLASS_$_FFBlindDataCustomUIChannel
    /* eslint-disable no-unreachable */
    return NSStringFromClass(cls);        // @0x218fc4
    /* eslint-enable no-unreachable */
  }

  /**
   * FFOZBlindDataCustomUIChannel::clone() const
   * @Flexo 0x00000000218fd0
   *
   * Body (28 lines):
   *   %r14 = this
   *   %rbx = operator new(0x198)                              @0x218fda..e4
   *   OZChannelBlindData::C2_Copy(%rbx, %r14, 0)              @0x218fed..f4
   *     — 0 folder means "attach to no folder" (a detached copy)
   *   *(rbx +  0) = vtable+0x10                                @0x218ff4..fb
   *   *(rbx + 10) = vtable+0x370                               @0x218ffe..05
   *   return %rbx
   *   (unwind: operator delete(%rbx) ; __Unwind_Resume)
   *
   * The `0x198` (== 408 bytes) is the DIRECT sizeof(FFOZBlindDataCustomUIChannel);
   * matches the layout above (up to +0x88 known fields + tail owned by
   * OZChannelBlindData). No InitOZBlindDataCustomUIChannel call here because the
   * copy ctor already brings the factory + info pointers forward from the source.
   */
  clone(): FFOZBlindDataCustomUIChannel {
    const cp: FFOZBlindDataCustomUIChannel = new FFOZBlindDataCustomUIChannel();
    // operator new(0x198) — TS has no explicit-size heap; the `new`-produced object
    // already has the modelled fields. We call the boundary base copy-ctor:
    OZChannelBlindData_C2_Copy(cp, this as unknown as OZChannelBlindData, null);   // @0x218fed
    /* eslint-disable no-unreachable */
    cp.vptrPrimary = VTABLE_PRIMARY_ADDR;      // @0x218ff4..fb
    cp.vptrSecondary = VTABLE_SECONDARY_ADDR;  // @0x218ffe..05
    return cp;
    /* eslint-enable no-unreachable */
  }

  /**
   * FFOZBlindDataCustomUIChannel::copy(OZChannelBase const*, bool)
   * @Flexo 0x00000000219030
   *
   * Body (6 lines): `push rbp ; mov rbp,rsp ; pop rbp ; jmp base::copy`.
   * Pure tail-jmp — this class overrides nothing; the vtable slot only exists
   * because the derived class has its own vtable and the linker regenerated
   * the delegator.
   */
  copy(src: OZChannelBase, flag: boolean): never {
    return OZChannelBlindData_copy(src, flag);   // @0x219035 (tail-jmp)
  }

  /**
   * FFOZBlindDataCustomUIChannel::assign(OZChannelBase const*)
   * @Flexo 0x00000000219040
   *
   * Body (6 lines): `push rbp ; mov rbp,rsp ; pop rbp ; jmp base::assign`.
   */
  assign(src: OZChannelBase): never {
    return OZChannelBlindData_assign(src);       // @0x219045 (tail-jmp)
  }

  /**
   * FFOZBlindDataCustomUIChannel::compare(OZChannelBase const*) const
   * @Flexo 0x00000000219050
   *
   * Body (6 lines): `push rbp ; mov rbp,rsp ; pop rbp ; jmp base::compare`.
   */
  compare(src: OZChannelBase): never {
    return OZChannelBlindData_compare(src);      // @0x219055 (tail-jmp)
  }
}
