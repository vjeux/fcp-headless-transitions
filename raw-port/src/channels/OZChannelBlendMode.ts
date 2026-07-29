// raw-port/src/channels/OZChannelBlendMode.ts
//
// FCP `OZChannelBlendMode` — a thin subclass of `OZChannelEnum` that
// represents the "blend mode" channel (an enum-valued OZChannel) plus
// a secondary-base OZLockingElement subobject at +0x10 (multi-inheritance).
//
// The class exports ONLY ctors / dtors / clone(). Everything else is
// inherited from OZChannelEnum (whose ctors are called at every entry) —
// per PORTING_SPEC we transcribe THIS class's ctor/dtor/layout faithfully;
// unported base callees are boundary throw-stubs citing their FCP addr.
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/OZChannelBlendMode.*.s):
//   OZChannelBlendMode(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32)  [C2] @0x487530
//   OZChannelBlendMode(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32)  [C1] @0x487570
//   OZChannelBlendMode(PCString&,             PCString&, OZChannelFolder*, u32, u32)  [C2] @0x4875b0
//   OZChannelBlendMode(PCString&,             PCString&, OZChannelFolder*, u32, u32)  [C1] @0x487660
//   OZChannelBlendMode(u32, PCString&,        PCString&, OZChannelFolder*, u32, u32)  [C2] @0x487710
//   OZChannelBlendMode(u32, PCString&,        PCString&, OZChannelFolder*, u32, u32)  [C1] @0x4877d0
//   OZChannelBlendMode(OZFactory*, PCString&, u32)                                    [C2] @0x487890
//   OZChannelBlendMode(OZFactory*, PCString&, u32)                                    [C1] @0x4878c0
//   OZChannelBlendMode(OZChannelBlendMode const&, OZChannelFolder*)                   [C2] @0x4878f0
//   OZChannelBlendMode(OZChannelBlendMode const&, OZChannelFolder*)                   [C1] @0x487920
//   ~OZChannelBlendMode()                                                             [D2] @0x487950
//   ~OZChannelBlendMode()                                                             [D1] @0x487960
//   ~OZChannelBlendMode()                                                             [D0] @0x487980
//   OZChannelBlendMode::clone() const                                                       @0x4879d0
//
// EXTERNAL FUNCTIONS REFERENCED (boundary throw-stubs — every call site cites its addr):
//   * OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*,
//         u32, u32, OZChannelImpl*, OZChannelInfo*) [C2]
//     @Ozone stub 0x6dd9bc — mangled __ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//     Called from ctors @0x48754a, @0x48758a, @0x48762b, @0x4876db.
//   * OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZFactory*,
//         OZChannelFolder*, u32, u32, OZChannelImpl*, OZChannelInfo*) [C2]
//     @Ozone stub 0x6dd9ce — __ZN13OZChannelEnumC2EjRK8PCStringS2_P9OZFactoryP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//     Called from ctors @0x487799, @0x487859.
//   * OZChannelEnum::OZChannelEnum(OZFactory*, PCString&, u32, OZChannelImpl*, OZChannelInfo*) [C2]
//     @Ozone stub 0x6dd9b6 — __ZN13OZChannelEnumC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo
//     Called from ctors @0x48789f, @0x4878cf.
//   * OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) [C2]
//     @Ozone stub 0x6dd9c2 — __ZN13OZChannelEnumC2ERKS_P15OZChannelFolder
//     Called from ctors @0x4878f9, @0x487929 and clone() @0x4879ef.
//   * OZChannelEnum::~OZChannelEnum() [D2]
//     @Ozone stub 0x6dd9da — __ZN13OZChannelEnumD2Ev
//     Tail-jmp'd by D2/D1 @0x487955/@0x487965; called by D0 @0x487989.
//   * operator new(unsigned long)
//     @Ozone stub 0x6dfca2 — __Znwm. Called from clone() @0x4879df with size 0x100.
//   * operator delete(void*)
//     @Ozone stub 0x6dfc36 — __ZdlPv. Tail-jmp'd by D0 @0x487997.
//   * __Unwind_Resume
//     @Ozone stub 0x6dd07a — clone() unwind path @0x487a1f (on ctor throw).
//   * OZChannelBlendMode_Factory::_instanceOnce   (data)
//     @Ozone __data — __ZN26OZChannelBlendMode_Factory13_instanceOnceE
//     Read by the 3-arg-string / 4-arg-string / u32-first ctors @0x4875d0/@0x487680/@0x48772d.
//   * OZChannelBlendMode_Factory::_instance        (data)
//     @Ozone __data — __ZN26OZChannelBlendMode_Factory9_instanceE
//     Read by same 3 ctor overloads at @0x48760c/@0x4876bc/@0x48777c after the once-init.
//   * OZChannelBlendMode_Factory::getInstance()::'lambda'()   (once_init proxy)
//     @Ozone — __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN26OZChannelBlendMode_Factory11getInstanceEvEUlvE_EEEEEvPv
//   * std::__1::__call_once(unsigned long volatile&, void*, void(*)(void*))
//     @Ozone stub 0x6dfb2e — __ZNSt3__111__call_onceERVmPvPFvS2_E
//
// VTABLES INSTALLED at ctor / clone tail (RIP-relative loads → target addrs verified via
// resolve.py; both are Ozone-local vtable symbols recovered from dyld fixups):
//   *this           <- __ZTV18OZChannelBlendMode        (primary vtable, at +0x18 of the sym)
//   *(this+0x10)    <- __ZTV18OZChannelBlendMode        (secondary "OZLockingElement subobject"
//                                                        thunk-vtable, at +0x380 of the sym)
//   The two RIP loads land at Ozone 0x86a6f0 and 0x86aa60 (verified with resolve.py sym).
//
// STRUCT LAYOUT (partial — recovered here):
//   OZChannelBlendMode {
//     +0x000     vptr (OZChannel-side)     — primary base vtable slot
//     +0x008..+0x00f   OZChannelEnum base subobject fields (opaque; owned by base ctor)
//     +0x010     vptr (OZLockingElement subobject) — secondary base vtable slot
//     +0x018..+0x0ff   more OZChannelEnum base subobject state (opaque; own by base ctor)
//     size total = 0x100  (from `movl $0x100,%edi` @0x4879da in clone()).
//   }
//
// DECODE-DON'T-FIT: no fields are added by OZChannelBlendMode beyond the two vptrs
// (every ctor calls a base OZChannelEnum ctor then does ONLY the two vtable stores and
// returns). The three ctor overloads that carry a `factory=nullptr` role also run a
// std::call_once on OZChannelBlendMode_Factory::_instance BEFORE calling the base ctor,
// then pass that singleton as the OZFactory arg. All faithfully modelled below.
//
// PORTING_SPEC compliance:
//   Rule 1 — transcribed line-for-line: every ctor mirrors the base-call + 2 vtable stores.
//   Rule 2 — every function has @0xADDR provenance.
//   Rule 3 — every unported base callee is a throw-stub citing its addr.
//   Rule 5 — no magic numbers: 0x100 (clone size), 0x10 (secondary vptr offset), and vtable
//            @0x86a6f0 / @0x86aa60 are ALL cited to their disasm site.

// ── opaque external types ────────────────────────────────────────────────────────────────
export type PCString = { readonly kind: "PCString" };
export type OZFactory = { readonly kind: "OZFactory" };
export type OZChannelFolder = { readonly kind: "OZChannelFolder" };
export type OZChannelImpl = { readonly kind: "OZChannelImpl" };
export type OZChannelInfo = { readonly kind: "OZChannelInfo" };

/** Marker constants for the two vtable slots — expressed as tagged strings so that the
 *  observable "this vptr is X, that vptr is Y" state is preserved without fabricating
 *  numeric addresses. The concrete slot pointers themselves live in the FCP binary at
 *  the addresses cited by `VTABLE_PRIMARY_ADDR` / `VTABLE_SECONDARY_ADDR`. */
export type VtableTag =
  | "OZChannelBlendMode.primary" // → Ozone 0x86a6f0 (installed at this+0x00)
  | "OZChannelBlendMode.secondary"; // → Ozone 0x86aa60 (installed at this+0x10)

// ── data-symbol addresses (all verified with resolve.py; used only in provenance strings) ─
/** __ZTV18OZChannelBlendMode +0x18  — primary vptr slot installed at *this. */
const VTABLE_PRIMARY_ADDR = 0x86a6f0;
/** __ZTV18OZChannelBlendMode +0x380 — secondary vptr installed at *(this+0x10). */
const VTABLE_SECONDARY_ADDR = 0x86aa60;
/** clone()'s heap size — `movl $0x100,%edi` @0x4879da fed to operator new. */
const K_OZCHANNELBLENDMODE_SIZE = 0x100;
/** Secondary base subobject vptr offset — `movq %rax, 0x10(%rbx)` in every ctor. */
const K_SECONDARY_VPTR_OFFSET = 0x10;

// ── boundary throw-stubs for un-ported OZChannelEnum callees (Rule 3) ─────────────────────

/** OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32,
 *  OZChannelImpl*=null, OZChannelInfo*=null) [C2] — @Ozone stub 0x6dd9bc.
 *  Called from OZChannelBlendMode ctors @0x48754a / @0x48758a / @0x48762b / @0x4876db. */
function OZChannelEnum_C2_full(
  _self: OZChannelBlendMode,
  _name: PCString,
  _factory: OZFactory | null,
  _key: PCString,
  _folder: OZChannelFolder | null,
  _flags1: number,
  _flags2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32, " +
      "OZChannelImpl*, OZChannelInfo*) [C2] @Ozone stub 0x6dd9bc not yet transcribed " +
      "(called from OZChannelBlendMode ctors @0x48754a/@0x48758a/@0x48762b/@0x4876db)",
  );
}

/** OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZFactory*, OZChannelFolder*,
 *  u32, u32, OZChannelImpl*=null, OZChannelInfo*=null) [C2] — @Ozone stub 0x6dd9ce.
 *  Called from OZChannelBlendMode ctors @0x487799 / @0x487859. */
function OZChannelEnum_C2_u32first(
  _self: OZChannelBlendMode,
  _enumId: number,
  _name: PCString,
  _key: PCString,
  _factory: OZFactory | null,
  _folder: OZChannelFolder | null,
  _flags1: number,
  _flags2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZFactory*, OZChannelFolder*, u32, u32, " +
      "OZChannelImpl*, OZChannelInfo*) [C2] @Ozone stub 0x6dd9ce not yet transcribed " +
      "(called from OZChannelBlendMode ctors @0x487799/@0x487859)",
  );
}

/** OZChannelEnum::OZChannelEnum(OZFactory*, PCString&, u32, OZChannelImpl*=null,
 *  OZChannelInfo*=null) [C2] — @Ozone stub 0x6dd9b6.
 *  Called from OZChannelBlendMode ctors @0x48789f / @0x4878cf. */
function OZChannelEnum_C2_factoryOnly(
  _self: OZChannelBlendMode,
  _factory: OZFactory | null,
  _key: PCString,
  _flags: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(OZFactory*, PCString&, u32, OZChannelImpl*, OZChannelInfo*) [C2] " +
      "@Ozone stub 0x6dd9b6 not yet transcribed " +
      "(called from OZChannelBlendMode ctors @0x48789f/@0x4878cf)",
  );
}

/** OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) [C2 copy] —
 *  @Ozone stub 0x6dd9c2.
 *  Called from OZChannelBlendMode copy ctors @0x4878f9 / @0x487929 and clone() @0x4879ef. */
function OZChannelEnum_C2_copy(
  _self: OZChannelBlendMode,
  _src: OZChannelBlendMode,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(OZChannelEnum const&, OZChannelFolder*) [C2] " +
      "@Ozone stub 0x6dd9c2 not yet transcribed " +
      "(called from OZChannelBlendMode copy ctors @0x4878f9/@0x487929, clone() @0x4879ef)",
  );
}

/** OZChannelEnum::~OZChannelEnum() [D2] — @Ozone stub 0x6dd9da.
 *  Tail-jmp'd by OZChannelBlendMode D2/D1 @0x487955/@0x487965; called by D0 @0x487989. */
function OZChannelEnum_D2(_self: OZChannelBlendMode): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum() [D2] @Ozone stub 0x6dd9da not yet transcribed " +
      "(called from OZChannelBlendMode dtors @0x487955/@0x487965/@0x487989)",
  );
}

/** operator new(unsigned long) — @Ozone stub 0x6dfca2.
 *  Called from OZChannelBlendMode::clone() @0x4879df to allocate 0x100 bytes. */
function operator_new(_size: number): OZChannelBlendMode {
  throw new Error(
    "operator new(unsigned long) @Ozone stub 0x6dfca2 not yet transcribed " +
      "(called from OZChannelBlendMode::clone() @0x4879df)",
  );
}

/** operator delete(void*) — @Ozone stub 0x6dfc36.
 *  Tail-jmp'd by OZChannelBlendMode D0 @0x487997. */
function operator_delete(_p: OZChannelBlendMode): void {
  throw new Error(
    "operator delete(void*) @Ozone stub 0x6dfc36 not yet transcribed " +
      "(called from OZChannelBlendMode::~OZChannelBlendMode()[D0] @0x487997)",
  );
}

/** OZChannelBlendMode_Factory::getInstance() — dispatched via std::__call_once
 *  through Ozone `__ZNSt3__117__call_once_proxy...[getInstance()::lambda]` and
 *  `__ZNSt3__111__call_onceERVmPvPFvS2_E` (@Ozone stub 0x6dfb2e).
 *  Called from the 3-arg-string / 4-arg-string / u32-first ctors @0x487603 / @0x4876b3 / @0x48776b. */
function OZChannelBlendMode_Factory_getInstance_onceInit(): void {
  throw new Error(
    "std::__1::__call_once(&OZChannelBlendMode_Factory::_instanceOnce, ...) → " +
      "OZChannelBlendMode_Factory::getInstance()::lambda() @Ozone stub 0x6dfb2e " +
      "not yet transcribed (called from OZChannelBlendMode ctors @0x487603/@0x4876b3/@0x48776b)",
  );
}

// The `_instanceOnce` volatile flag and `_instance` singleton pointer live in the
// Ozone framework's __DATA segment. Their runtime state (0x-1 sentinel = initialised,
// any other value = uninitialised) is opaque to us here — we only READ them through
// the boundary. Modelled as opaque nullables that trigger the throw-stub above.
let _factoryOnce: bigint = 0n; // opaque copy of __ZN26OZChannelBlendMode_Factory13_instanceOnceE
let _factoryInstance: OZFactory | null = null; // opaque copy of ..._Factory9_instanceE

// ── the class itself ─────────────────────────────────────────────────────────────────────

/**
 * Instance of OZChannelBlendMode. Two named fields (the primary + secondary vptrs) are
 * managed here; every other byte in the 0x100-byte struct belongs to the OZChannelEnum
 * base subobject and is written by the base C2 ctor invoked at every entry.
 */
export class OZChannelBlendMode {
  /** +0x00 primary vptr — written to __ZTV18OZChannelBlendMode+0x18 (Ozone 0x86a6f0). */
  vtable_primary: VtableTag = "OZChannelBlendMode.primary";
  /** +0x10 secondary vptr — written to __ZTV18OZChannelBlendMode+0x380 (Ozone 0x86aa60). */
  vtable_secondary: VtableTag = "OZChannelBlendMode.secondary";

  // -------------------------------------------------------------------------
  //  Full 6-arg ctor (name, factory, key, folder, flags1, flags2)
  //    C2 @0x487530  /  C1 @0x487570
  // -------------------------------------------------------------------------
  //   Stack: xorps xmm0,xmm0; movups xmm0,0x8(rsp)      ; impl=nullptr, info=nullptr
  //          movl  0x10(%rbp),%eax; movl %eax,(%rsp)    ; forward the 6th caller stack arg (flags2)
  //          callq __ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
  //          leaq  <__ZTV18OZChannelBlendMode+0x18>,%rax; movq %rax, (%rbx)   ; primary vptr
  //          leaq  <__ZTV18OZChannelBlendMode+0x380>,%rax; movq %rax, 0x10(%rbx) ; secondary vptr
  //          retq
  //
  //  C1 (@0x487570) is byte-identical to C2 modulo the RIP-relative offsets, which
  //  themselves point to the same two vtable-payload addresses.

  /** OZChannelBlendMode(PCString& name, OZFactory* factory, PCString& key,
   *   OZChannelFolder* folder, u32 flags1, u32 flags2) — @0x487530 (C2) / @0x487570 (C1). */
  static ctor_full(
    self: OZChannelBlendMode,
    name: PCString,
    factory: OZFactory | null,
    key: PCString,
    folder: OZChannelFolder | null,
    flags1: number,
    flags2: number,
  ): void {
    // @0x48754a: base C2 with impl=null, info=null.
    OZChannelEnum_C2_full(self, name, factory, key, folder, flags1, flags2, null, null);
    // @0x48754f-@0x487560: install primary + secondary vptrs.
    self.vtable_primary = "OZChannelBlendMode.primary";
    self.vtable_secondary = "OZChannelBlendMode.secondary";
    void VTABLE_PRIMARY_ADDR;
    void VTABLE_SECONDARY_ADDR;
    void K_SECONDARY_VPTR_OFFSET;
  }

  // -------------------------------------------------------------------------
  //  5-arg ctor (name, key, folder, flags1, flags2) — resolves factory via
  //  the OZChannelBlendMode_Factory singleton (std::call_once).
  //    C2 @0x4875b0  /  C1 @0x487660
  // -------------------------------------------------------------------------
  //   movq  OZChannelBlendMode_Factory::_instanceOnce, %rax
  //   cmpq  $-1, %rax; je 0x48760c              ; already initialised → skip once
  //   ; (else) build the call-once tuple on the stack and call std::__1::__call_once
  //   callq __ZNSt3__111__call_onceERVmPvPFvS2_E                @0x487603
  // 0x48760c:
  //   movq  OZChannelBlendMode_Factory::_instance, %rdx        ; the singleton pointer
  //   ; then forward args + null impl/info + do the OZChannelEnum full ctor
  //   callq __ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
  //   ; install two vptrs and retq.

  /** OZChannelBlendMode(PCString& name, PCString& key, OZChannelFolder* folder,
   *   u32 flags1, u32 flags2) — @0x4875b0 (C2) / @0x487660 (C1). */
  static ctor_stringPair(
    self: OZChannelBlendMode,
    name: PCString,
    key: PCString,
    folder: OZChannelFolder | null,
    flags1: number,
    flags2: number,
  ): void {
    // @0x4875d0-@0x487608: std::call_once(_instanceOnce, getInstance-lambda).
    if (_factoryOnce !== -1n) {
      OZChannelBlendMode_Factory_getInstance_onceInit();
      // (unreachable — the stub throws; kept to mirror the fall-through in the asm)
    }
    // @0x48760c: pull the freshly-initialised singleton.
    const factory = _factoryInstance;
    // @0x487613-@0x48762b: base C2 with impl=null, info=null.
    OZChannelEnum_C2_full(self, name, factory, key, folder, flags1, flags2, null, null);
    // @0x487630-@0x487641: install primary + secondary vptrs.
    self.vtable_primary = "OZChannelBlendMode.primary";
    self.vtable_secondary = "OZChannelBlendMode.secondary";
  }

  // -------------------------------------------------------------------------
  //  6-arg ctor with leading u32 (enumId) — same singleton pattern.
  //    C2 @0x487710  /  C1 @0x4877d0
  //  Calls OZChannelEnum C2 (u32-first overload) @Ozone stub 0x6dd9ce.
  // -------------------------------------------------------------------------

  /** OZChannelBlendMode(u32 enumId, PCString& name, PCString& key,
   *   OZChannelFolder* folder, u32 flags1, u32 flags2) — @0x487710 (C2) / @0x4877d0 (C1). */
  static ctor_u32First(
    self: OZChannelBlendMode,
    enumId: number,
    name: PCString,
    key: PCString,
    folder: OZChannelFolder | null,
    flags1: number,
    flags2: number,
  ): void {
    // @0x48772d-@0x487776: std::call_once(_instanceOnce, getInstance-lambda).
    if (_factoryOnce !== -1n) {
      OZChannelBlendMode_Factory_getInstance_onceInit();
    }
    // @0x48777c: singleton -> r8 (the factory arg for the base ctor).
    const factory = _factoryInstance;
    // @0x487783-@0x487799: base C2 (u32-first overload) with impl=null, info=null.
    OZChannelEnum_C2_u32first(
      self,
      enumId >>> 0,
      name,
      key,
      factory,
      folder,
      flags1 >>> 0,
      flags2 >>> 0,
      null,
      null,
    );
    // @0x48779e-@0x4877af: install two vptrs.
    self.vtable_primary = "OZChannelBlendMode.primary";
    self.vtable_secondary = "OZChannelBlendMode.secondary";
  }

  // -------------------------------------------------------------------------
  //  Factory ctor — (OZFactory*, PCString& key, u32 flags)
  //    C2 @0x487890  /  C1 @0x4878c0
  //  No once-init; the factory is passed in. Impl/info default to null (r8d=0/r9d=0).
  // -------------------------------------------------------------------------

  /** OZChannelBlendMode(OZFactory* factory, PCString& key, u32 flags) —
   *   @0x487890 (C2) / @0x4878c0 (C1). */
  static ctor_factoryOnly(
    self: OZChannelBlendMode,
    factory: OZFactory | null,
    key: PCString,
    flags: number,
  ): void {
    // @0x487899-@0x48789f: base C2 with impl=null, info=null.
    OZChannelEnum_C2_factoryOnly(self, factory, key, flags >>> 0, null, null);
    // @0x4878a4-@0x4878b5: install two vptrs.
    self.vtable_primary = "OZChannelBlendMode.primary";
    self.vtable_secondary = "OZChannelBlendMode.secondary";
  }

  // -------------------------------------------------------------------------
  //  Copy ctor — (OZChannelBlendMode const& src, OZChannelFolder* folder)
  //    C2 @0x4878f0  /  C1 @0x487920
  // -------------------------------------------------------------------------
  //   movq  %rdi, %rbx
  //   callq __ZN13OZChannelEnumC2ERKS_P15OZChannelFolder                     ; copy base
  //   leaq  <__ZTV18OZChannelBlendMode+0x18>, %rax; movq %rax, (%rbx)         ; primary vptr
  //   leaq  <__ZTV18OZChannelBlendMode+0x380>, %rax; movq %rax, 0x10(%rbx)    ; secondary
  //   retq

  /** OZChannelBlendMode(OZChannelBlendMode const& src, OZChannelFolder* folder) —
   *   @0x4878f0 (C2) / @0x487920 (C1). */
  static ctor_copy(
    self: OZChannelBlendMode,
    src: OZChannelBlendMode,
    folder: OZChannelFolder | null,
  ): void {
    // @0x4878f9: copy the OZChannelEnum base subobject.
    OZChannelEnum_C2_copy(self, src, folder);
    // @0x4878fe-@0x48790f: install two vptrs.
    self.vtable_primary = "OZChannelBlendMode.primary";
    self.vtable_secondary = "OZChannelBlendMode.secondary";
  }

  // -------------------------------------------------------------------------
  //  Dtors.
  //    ~OZChannelBlendMode() [D2] @0x487950  — pure tail-jmp to base D2.
  //    ~OZChannelBlendMode() [D1] @0x487960  — pure tail-jmp to base D2.
  //    ~OZChannelBlendMode() [D0] @0x487980  — base D2 then tail-jmp operator delete.
  // -------------------------------------------------------------------------

  /** ~OZChannelBlendMode() [D2 base-object dtor] @0x487950. */
  dtor_D2(): void {
    // @0x487955: jmp __ZN13OZChannelEnumD2Ev
    OZChannelEnum_D2(this);
  }

  /** ~OZChannelBlendMode() [D1 complete-object dtor] @0x487960. */
  dtor_D1(): void {
    // @0x487965: jmp __ZN13OZChannelEnumD2Ev
    OZChannelEnum_D2(this);
  }

  /** ~OZChannelBlendMode() [D0 deleting dtor] @0x487980. */
  dtor_D0(): void {
    // @0x487989: callq __ZN13OZChannelEnumD2Ev
    OZChannelEnum_D2(this);
    // @0x487997: jmp __ZdlPv (operator delete on this)
    operator_delete(this);
  }

  // -------------------------------------------------------------------------
  //  clone() const  @0x4879d0
  // -------------------------------------------------------------------------
  //   movq  %rdi, %r14                              ; save `this`
  //   movl  $0x100, %edi                            ; sizeof(OZChannelBlendMode) = 256
  //   callq __Znwm                                  ; operator new(0x100)  → rbx=rax
  //   movq  %rax, %rdi; movq %r14,%rsi; xorl %edx,%edx
  //   callq __ZN13OZChannelEnumC2ERKS_P15OZChannelFolder ; base copy ctor, folder=nullptr
  //   leaq  <__ZTV18OZChannelBlendMode+0x18>,%rax; movq %rax, (%rbx)
  //   leaq  <__ZTV18OZChannelBlendMode+0x380>,%rax; movq %rax, 0x10(%rbx)
  //   movq  %rbx, %rax                              ; return the fresh clone
  //   retq
  //   ; unwind edge @0x487a11: if base ctor throws, operator delete + __Unwind_Resume

  /** OZChannelBlendMode::clone() const @0x4879d0 — allocates 0x100 bytes and copy-constructs. */
  clone(): OZChannelBlendMode {
    // @0x4879da-@0x4879e4: operator new(0x100).
    const nu = operator_new(K_OZCHANNELBLENDMODE_SIZE);
    // @0x4879ea-@0x4879ef: base copy ctor with folder=nullptr.
    OZChannelEnum_C2_copy(nu, this, null);
    // @0x4879f4-@0x487a05: install two vptrs.
    nu.vtable_primary = "OZChannelBlendMode.primary";
    nu.vtable_secondary = "OZChannelBlendMode.secondary";
    // @0x487a09-@0x487a10: return.
    return nu;
  }
}
