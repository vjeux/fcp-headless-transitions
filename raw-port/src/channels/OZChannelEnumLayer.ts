// OZChannelEnumLayer — enum-valued channel WITH a factory-published "Layer" adaptor. Ozone.
//
// FRAMEWORK: Ozone
//
// Symbols exposed by nm on Ozone (x86_64, thin slice VA==offset):
//   __ZN18OZChannelEnumLayerC2ERK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       @0x4aaf80  ctor base-subobj (C2, PCString&,PCString&,Folder*,uint,uint,Impl*,Info*)
//   __ZN18OZChannelEnumLayerC1ERK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       @0x4ab090  ctor complete    (C1, same signature)  [byte-identical to C2]
//   __ZN18OZChannelEnumLayerC2EjRK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       @0x4ab1a0  ctor base-subobj (C2, uint,PCString&,PCString&,Folder*,uint,uint,Impl*,Info*)
//   __ZN18OZChannelEnumLayerC1EjRK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//                                                       @0x4ab240  ctor complete    (C1, same j-prefixed signature) [byte-identical to C2]
//   __ZN18OZChannelEnumLayerD1Ev                        @0x022c10  base dtor (D1, tail-jmp to OZChannelEnum::~OZChannelEnum)
//   __ZN18OZChannelEnumLayerD0Ev                        @0x022c20  deleting dtor (D0, base dtor + operator delete)
//   __ZN18OZChannelEnumLayer29createOZChannelEnumLayerCurveEd
//                                                       @0x0dfff0  static factory: build the enum curve
//
// Provenance disasm files:
//   raw-port/re/disasm/OZChannelEnumLayer.OZChannelEnumLayer.s        (C1 body @0x4ab090)
//   raw-port/re/disasm/OZChannelEnumLayer.~OZChannelEnumLayer.s       (D0 body @0x022c20)
//   raw-port/re/disasm/OZChannelEnumLayer.createOZChannelEnumLayerCurve.s (factory body @0x0dfff0)
//   (C2 @0x4aaf80, C2j @0x4ab1a0, C1j @0x4ab240, D1 @0x022c10 read inline from /tmp/Ozone_tV.txt.)
//
// FAITHFUL PORT — every function cites its @Ozone 0xADDR. Every numeric constant cites the
// address it was read from (thin x86_64 slice VA==offset). Undecoded callees throw citing
// their FCP address (PORTING_SPEC.md Rule 3). No approximations, no invented helpers.
//
// STRUCTURAL LAYOUT (recovered from the ctor tails @0x4ab122..0x4ab175 and @0x4ab1c2..0x4ab215):
//   sizeof(OZChannelEnumLayer) >= 0x18 bytes visible directly, and inherits from OZChannelEnum
//   whose own layout is not yet decoded. Fields we can name from the ctor stores:
//     this+0x00  primary vptr slot                       (installed = __ZTV18OZChannelEnumLayer + 0x10)
//     this+0x08  factory pointer field                    (assigned = OZChannelEnumLayer_Factory::_instance)
//     this+0x10  secondary vptr slot (multiple-inh thunk) (installed = __ZTV18OZChannelEnumLayer + 0x10 + 0x380)
//   The +0x380 offset in the secondary vptr write @0x4ab130/@0x4ab1d0/@0x4ab270 identifies the
//   second base-subobject's vtable-sub-table position within the class vtable image; the FCP
//   OZChannelEnumLayer participates in multiple inheritance (matches the OZChannelBase +
//   controller-interface pattern seen for other Ozone channel classes).

// ── opaque parameter types (structural — no ObjC/C++ layout is peeked at here) ────────────
/** OZ-family PCString handle. Structural placeholder — the string bytes are not read here. */
export type PCString = object;
/** Structural OZChannelFolder pointer. Layout not decoded here. */
export type OZChannelFolder = object | null;
/** Structural OZChannelImpl pointer. Layout not decoded here. */
export type OZChannelImpl = object | null;
/** Structural OZChannelInfo pointer. Layout not decoded here. */
export type OZChannelInfo = object | null;
/** Structural OZFactory pointer (base of *_Factory singletons). Layout not decoded here. */
export type OZFactoryPtr = object | null;
/** Structural OZSplineState pointer (matches OZChannelEnum.ts::OZSplineStatePtr). */
export type OZSplineStatePtr = object | null | undefined;

/**
 * Structural shape of the freshly-allocated OZCurveEnum returned by
 * `createOZChannelEnumLayerCurve` prior to any post-init side-effects.
 * Byte-for-byte identical to OZChannelEnum.OZCurveEnumShape — the two factory routines
 * emit the same 0xB0-byte layout. See OZChannelEnum.ts::OZCurveEnumShape for provenance.
 */
export interface OZCurveEnumShape {
  /** +0x00 vptr — assigned to `__ZTV11OZCurveEnum + 0x10` at @0xe0038. */
  vtable_kind: "OZCurve" | "OZCurveEnum";
  /** splineState pointer written by OZCurve::setSplineState @0xe008a. */
  splineState: OZSplineStatePtr;
}

// ── seed constants read from Ozone __TEXT __const (verified via resolve.py const) ──────────
/** @const 0x7053e0  double = 1.0            (u64 0x3ff0000000000000)
 *  — 3rd arg (xmm2) to OZCurve::OZCurve(d,d,d,d) @0xe0028 in createOZChannelEnumLayerCurve.
 *    Loaded @0xe0015: `movsd 0x6253c3(%rip),%xmm2` -> RIP=0xe001d + 0x6253c3 = 0x7053e0. */
const K_ONE: number = 1.0;
/** @const 0x705c80  double = 4294967295.0   (u64 0x41efffffffe00000  ≡ UINT32_MAX as double)
 *  — 2nd arg (xmm1) to OZCurve::OZCurve(d,d,d,d) @0xe0028 in createOZChannelEnumLayerCurve.
 *    Loaded @0xe000d: `movsd 0x625c6b(%rip),%xmm1` -> RIP=0xe0015 + 0x625c6b = 0x705c80. */
const K_UINT32_MAX_D: number = 4294967295.0;
/** implicit zero — 1st arg (xmm0) to OZCurve::OZCurve(d,d,d,d) via `xorps %xmm0,%xmm0`
 *  @0xe001d. */
const K_ZERO: number = 0.0;
/** OZCurveEnum heap size in bytes — `movl $0xb0,%edi` @0xe0000 fed to operator new. */
const K_OZCURVEENUM_SIZE: number = 0xb0;
/** OZChannelEnumLayer secondary-vptr thunk offset — `addq $0x380,%rax` @0x4ab130 (and
 *  @0x4ab1d0 / @0x4ab270), added to (`__ZTV18OZChannelEnumLayer + 0x10`) before it is stored
 *  into `this+0x10`. Identifies the multiple-inheritance sub-object's vtable-sub-table. */
const K_SECONDARY_VPTR_OFFSET: number = 0x380;

// ── frontier stubs for un-ported callees ────────────────────────────────────────────────────

/** `OZChannelEnum::OZChannelEnum(PCString const&, OZFactory*, PCString const&, OZChannelFolder*,
 *  unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)` — symbol
 *  `__ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  (@Ozone stub 0x6dd9bc — imported into OZChannelEnumLayer at @0x4ab11d/@0x4ab00d). Frontier. */
function OZChannelEnum_ctor_pcstring(
  _self: OZChannelEnumLayer,
  _name: PCString,
  _factory: OZFactoryPtr,
  _label: PCString,
  _folder: OZChannelFolder,
  _u0: number,
  _u1: number,
  _impl: OZChannelImpl,
  _info: OZChannelInfo,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(PCString&,OZFactory*,PCString&,OZChannelFolder*,uint,uint,OZChannelImpl*,OZChannelInfo*) @Ozone (stub 0x6dd9bc) not yet transcribed (called from OZChannelEnumLayer ctor @0x4ab11d)",
  );
}

/** `OZChannelEnum::OZChannelEnum(unsigned int, PCString const&, PCString const&, OZChannelFolder*,
 *  unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)` — symbol
 *  `__ZN13OZChannelEnumC2EjRK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo`
 *  (@Ozone stub 0x6dd9c8 — imported into OZChannelEnumLayer at @0x4ab25d/@0x4ab1bd). Frontier. */
function OZChannelEnum_ctor_uint(
  _self: OZChannelEnumLayer,
  _enumId: number,
  _name: PCString,
  _label: PCString,
  _folder: OZChannelFolder,
  _u0: number,
  _u1: number,
  _impl: OZChannelImpl,
  _info: OZChannelInfo,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(uint,PCString&,PCString&,OZChannelFolder*,uint,uint,OZChannelImpl*,OZChannelInfo*) @Ozone (stub 0x6dd9c8) not yet transcribed (called from OZChannelEnumLayer ctor @0x4ab25d)",
  );
}

/** `OZChannelEnum::~OZChannelEnum()` — symbol `__ZN13OZChannelEnumD2Ev` (@Ozone stub 0x6dd9da —
 *  imported into OZChannelEnumLayer at @0x22c15 (D1 tail-jmp), @0x22c29 (D0), @0x4ab08e / @0x4ab228
 *  (unwind pads in the ctors)). Frontier. */
function OZChannelEnum_dtor(_self: OZChannelEnumLayer): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum() @Ozone (stub 0x6dd9da) not yet transcribed (called from OZChannelEnumLayer::~OZChannelEnumLayer @0x22c15/@0x22c29)",
  );
}

/**
 * `OZChannelEnumLayer_Factory::getInstance()` — Ozone-framework singleton lazily initialised
 * via `std::call_once` on `__ZN26OZChannelEnumLayer_Factory13_instanceOnceE` (VA-refs
 * @0x4ab0b8, @0x4ab0d5, @0x4ab13a, @0x4ab157, @0x4ab1da, @0x4ab1f7 etc.). The raw instance
 * pointer is read from `__ZN26OZChannelEnumLayer_Factory9_instanceE` (@0x4ab0fc, @0x4ab16e,
 * @0x4ab1ec, @0x4ab20e).
 *
 * Ctor bodies at @0x4aaf80 / @0x4ab090 / @0x4ab1a0 / @0x4ab240 emit a `call_once` fence
 * TWICE — once BEFORE the base-class ctor (to make sure the factory exists before the base
 * ctor asks for it) and once AFTER (to store the resulting factory pointer into `this+0x8`).
 * The lambda body itself lives at `__ZN26OZChannelEnumLayer_Factory11getInstanceEv` — not
 * yet transcribed here.
 */
function OZChannelEnumLayer_Factory_getInstance(): OZFactoryPtr {
  throw new Error(
    "OZChannelEnumLayer_Factory::getInstance() singleton @Ozone not yet transcribed (std::call_once guard __ZN26OZChannelEnumLayer_Factory13_instanceOnceE @VA-ref 0x4ab0b8; global __ZN26OZChannelEnumLayer_Factory9_instanceE @VA-ref 0x4ab0fc)",
  );
}

/** `OZCurve::OZCurve(double, double, double, double)` — symbol `__ZN7OZCurveC2Edddd`
 *  (@Ozone stub 0x6dec16 — imported at @0xe0028). Frontier — the base-curve ctor decodes
 *  min/max/default/current from the four double args. Mirrors the frontier declared in
 *  OZChannelEnum.ts. */
function OZCurve_ctor4d(
  _obj: OZCurveEnumShape,
  _min: number,
  _max: number,
  _defaultValue: number,
  _currentValue: number,
): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @Ozone (stub 0x6dec16) not yet transcribed (called from OZChannelEnumLayer::createOZChannelEnumLayerCurve @0xe0028)",
  );
}

/** `OZCurve::setSplineState(OZSplineState*)` — symbol
 *  `__ZN7OZCurve14setSplineStateEP13OZSplineState` (@Ozone stub 0x6debfe — imported at
 *  @0xe008a). Frontier — mirrors the frontier declared in OZChannelEnum.ts. */
function OZCurve_setSplineState(_obj: OZCurveEnumShape, _s: OZSplineStatePtr): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @Ozone (stub 0x6debfe) not yet transcribed (called from OZChannelEnumLayer::createOZChannelEnumLayerCurve @0xe008a)",
  );
}

/** `OZCurve::~OZCurve()` — symbol `__ZN7OZCurveD2Ev` (@Ozone stub 0x6dec1c — imported at
 *  @0xe00d1 as an unwind-path callee inside createOZChannelEnumLayerCurve). Frontier. */
function OZCurve_dtor(_obj: OZCurveEnumShape): void {
  throw new Error(
    "OZCurve::~OZCurve() @Ozone (stub 0x6dec1c) not yet transcribed (called from createOZChannelEnumLayerCurve unwind pad @0xe00d1)",
  );
}

/**
 * `OZCurveEnumSplineState::getInstance()` — Ozone-framework singleton whose raw pointer is
 * loaded from `__ZN22OZCurveEnumSplineState9_instanceE` (VA-ref @0xe0072) after a
 * `std::call_once` guard on `__ZN22OZCurveEnumSplineState13_instanceOnceE` (VA-refs @0xe003b /
 * @0xe005b). The returned pointer is offset by +0x8 before being handed to
 * `OZCurve::setSplineState` (see @0xe007c: `leaq 0x8(%rax),%rsi` — a multiple-inheritance
 * sub-object adjust). If the raw instance pointer is null the adjust is short-circuited
 * (`testq %rax,%rax; cmoveq %rax,%rsi` @0xe0080..0xe0083).
 *
 * The initialiser lambda body lives in OZCurveEnumSplineState.ts; this stub bridges to it
 * as a frontier (identical to the one in OZChannelEnum.ts — the two factory sites both
 * call the same singleton).
 */
function OZCurveEnumSplineState_getInstance(): OZSplineStatePtr {
  throw new Error(
    "OZCurveEnumSplineState::getInstance() singleton @Ozone not yet transcribed (std::call_once guard __ZN22OZCurveEnumSplineState13_instanceOnceE @VA-ref 0xe003b; global __ZN22OZCurveEnumSplineState9_instanceE @VA-ref 0xe0072)",
  );
}

/**
 * Frontier stub covering the tail @0xe008f..0xe00a9 in createOZChannelEnumLayerCurve:
 *
 *   0xe008f  movq 0xa0(%rbx),%rax                     ; rax = *(newObj + 0xa0)
 *   0xe0096  movl $0x0, 0x20(%rax)                     ; *(rax + 0x20) = 0u32
 *   0xe009d  movb $0x0, 0x2(%rax)                      ; *(rax + 0x2)  = 0u8
 *   0xe00a1  movq (%rbx),%rax                          ; rax = newObj->vptr
 *   0xe00a4  movq %rbx,%rdi                            ; arg0 = this
 *   0xe00a7  xorl %esi,%esi                            ; arg1 = 0
 *   0xe00a9  callq *0x50(%rax)                         ; vt-slot 0x50 (index 10) on OZCurveEnum
 *
 * Byte-identical to the tail @0xab4ff..0xab519 in OZChannelEnum::createOZChannelEnumCurve —
 * the vtable slot resolves via `__ZTV11OZCurveEnum + 0x10 + 0x50`. Frontier stub so the
 * gap is loud (the OZCurveEnum owning class handles the byte semantics).
 */
function postInitializeOZCurveEnum(_obj: OZCurveEnumShape): void {
  throw new Error(
    "OZCurveEnum vtable slot 0x50 (post-init virtual call, esi=0) @Ozone not yet transcribed (called from OZChannelEnumLayer::createOZChannelEnumLayerCurve @0xe00a9); post-init stores at *(this+0xa0)+0x20 = 0u32 @0xe0096 and *(this+0xa0)+0x2 = 0u8 @0xe009d",
  );
}

// ── OZChannelEnumLayer ──────────────────────────────────────────────────────────────────────

/**
 * OZChannelEnumLayer — an enum-valued OZChannelEnum specialised for the "Layer" adaptor:
 * it participates in factory dispatch through an OZChannelEnumLayer_Factory singleton and
 * carries a secondary base-subobject vtable at `this+0x10` (multiple-inheritance thunk).
 *
 * The class exposes four ctor variants (2 unique bodies × {C1,C2} Itanium ABI aliases),
 * two dtor variants (D1 / D0), and one static factory (`createOZChannelEnumLayerCurve`).
 */
export class OZChannelEnumLayer {
  /** +0x00 primary vptr slot — installed = `__ZTV18OZChannelEnumLayer + 0x10`.
   *  Modelled as a structural marker; the class identity IS the vtable in the TS port. */
  vtable_kind: "OZChannelEnumLayer" | "OZChannelEnum" = "OZChannelEnumLayer";
  /** +0x08 factory pointer field — assigned in every ctor to
   *  `OZChannelEnumLayer_Factory::_instance` after the singleton `call_once` fence. */
  factory: OZFactoryPtr = null;
  /** +0x10 secondary vptr slot — installed = `__ZTV18OZChannelEnumLayer + 0x10 + 0x380`.
   *  Sub-object thunk vtable for the second base-class subobject (multiple inheritance). */
  secondary_vtable_kind: "OZChannelEnumLayer_thunk" | null = null;

  /**
   * OZChannelEnumLayer::OZChannelEnumLayer(PCString const& name, PCString const& label,
   *   OZChannelFolder* folder, unsigned int u0, unsigned int u1, OZChannelImpl* impl,
   *   OZChannelInfo* info)  — @Ozone 0x4ab090  (C1 __ZN18OZChannelEnumLayerC1ERK8PCStringS2_P15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo)
   *
   * The C2 base-subobject variant (@0x4aaf80  __ZN18OZChannelEnumLayerC2ERK8PCString...) is
   * byte-identical to this body — the Itanium ABI emits both because the class has no
   * virtual base. We collapse them into one TS method; the C1↔C2 distinction is not
   * observable from the port.
   *
   * Disasm (raw-port/re/disasm/OZChannelEnumLayer.OZChannelEnumLayer.s):
   *
   *   0x4ab090..0x4ab0ad  prologue + spill args:
   *                       r14d = r9d (u1)         @0x4ab0a1
   *                       r15d = r8d (u0)         @0x4ab0a4
   *                       r12  = rcx (folder)     @0x4ab0a7
   *                       r13  = rdx (label ref)  @0x4ab0aa
   *                       rbx  = rdi (this)       @0x4ab0ad
   *                       r10  = [rbp+0x18] (info stack arg)  @0x4ab0b0
   *                       rdi  = [rbp+0x10] (impl stack arg)  @0x4ab0b4
   *   0x4ab0b8..0x4ab0f8  ENSURE factory singleton via std::call_once (see
   *                       OZChannelEnumLayer_Factory_getInstance). r10/rdi/rsi restored
   *                       from spills @0x4ab0f0..0x4ab0f8 (they are clobbered by call_once).
   *   0x4ab0fc..0x4ab00d  set up args for the base ctor call:
   *                       rdx = factory (loaded from _instance @0x4ab0fc)
   *                       [rsp+0x10] = r10 (info)     @0x4ab103
   *                       [rsp+0x8]  = rdi (impl)     @0x4ab108
   *                       [rsp+0x0]  = r14d (u1)      @0x4ab10d
   *                       rdi = rbx (this)            @0x4ab111
   *                       rcx = r13 (label)           @0x4ab114
   *                       r8  = r12 (folder)          @0x4ab117
   *                       r9d = r15d (u0)             @0x4ab11a
   *                       [rsi is passed through as the first "name" arg — the base ctor
   *                        signature is (this,name,factory,label,folder,u0,u1,impl,info).]
   *   0x4ab11d           callq __ZN13OZChannelEnumC2ERK8PCStringP9OZFactoryS2_P15OZChannelFolder
   *                              jjP13OZChannelImplP13OZChannelInfo   (base ctor)
   *   0x4ab122..0x4ab12d  primary vptr install:
   *                       rax = &__ZTV18OZChannelEnumLayer
   *                       rcx = rax + 0x10                            (skip typeinfo header)
   *                       *this = rcx                                 (this+0x0 vptr)
   *   0x4ab130..0x4ab136  secondary vptr install:
   *                       rax += 0x380                                (sub-object thunk offset)
   *                       *(this+0x10) = rax                          (this+0x10 secondary vptr)
   *   0x4ab13a..0x4ab169  factory singleton call_once FENCE #2 (redundant guard around the
   *                       load of _instance below).
   *   0x4ab16e..0x4ab175  *(this+0x8) = factory                       (write factory ptr)
   *   0x4ab179..0x4ab187  epilogue, return.
   *   0x4ab188..0x4ab196  UNWIND PAD: if the base ctor throws, tail-call
   *                       __ZN13OZChannelEnumD2Ev(this) then __Unwind_Resume(exc).
   */
  ctor_pcstring(
    name: PCString,
    label: PCString,
    folder: OZChannelFolder,
    u0: number,
    u1: number,
    impl: OZChannelImpl,
    info: OZChannelInfo,
  ): void {
    // @0x4ab0b8..0x4ab0f8 — ENSURE factory singleton exists (call_once fence #1).
    // The factory pointer we obtain here is passed to the base ctor at @0x4ab11d as the
    // 3rd argument (rdx). Frontier: OZChannelEnumLayer_Factory_getInstance throws.
    const factoryForBase = OZChannelEnumLayer_Factory_getInstance();

    // @0x4ab11d — base ctor: OZChannelEnum::OZChannelEnum(name, factory, label, folder, u0,
    // u1, impl, info). Frontier throw preserves the gap.
    try {
      OZChannelEnum_ctor_pcstring(
        this,
        name,
        factoryForBase,
        label,
        folder,
        u0,
        u1,
        impl,
        info,
      );
    } catch (e) {
      // @0x4ab188..0x4ab196 unwind pad: __ZN13OZChannelEnumD2Ev(this); __Unwind_Resume(e).
      // We call the base dtor here as the emitted assembly does. Since it too is a frontier
      // throw, we swallow the dtor exception ONLY to re-throw the ORIGINAL exception (the
      // compiler-emitted _Unwind_Resume propagates the original, not the dtor's).
      try {
        OZChannelEnum_dtor(this);
      } catch {
        /* base dtor is a frontier throw; the original exception is what unwind propagates */
      }
      throw e;
    }

    // @0x4ab122..0x4ab12d — primary vptr write (this+0x0 = &__ZTV18OZChannelEnumLayer + 0x10).
    this.vtable_kind = "OZChannelEnumLayer";
    // @0x4ab130..0x4ab136 — secondary vptr write (this+0x10 = &__ZTV18OZChannelEnumLayer + 0x10 + 0x380).
    void K_SECONDARY_VPTR_OFFSET;
    this.secondary_vtable_kind = "OZChannelEnumLayer_thunk";

    // @0x4ab13a..0x4ab169 — call_once FENCE #2 (redundant re-fence around the load below).
    // The C++ compiler emits it because the second load of _instance is a separate use;
    // std::call_once is idempotent so the observable effect is a no-op if #1 succeeded.
    const factoryForField = OZChannelEnumLayer_Factory_getInstance();
    // @0x4ab16e..0x4ab175 — *(this+0x8) = factory instance pointer.
    this.factory = factoryForField;
  }

  /**
   * OZChannelEnumLayer::OZChannelEnumLayer(unsigned int enumId, PCString const& name,
   *   PCString const& label, OZChannelFolder* folder, unsigned int u0, unsigned int u1,
   *   OZChannelImpl* impl, OZChannelInfo* info)  — @Ozone 0x4ab240  (C1 j-prefixed variant).
   *
   * C2 base-subobject variant is @0x4ab1a0 (__ZN18OZChannelEnumLayerC2Ej...); byte-identical.
   *
   * Body @0x4ab1a0..0x4ab221 (C2) / @0x4ab240..0x4ab2c1 (C1):
   *
   *   0x4ab1a0..0x4ab1ab  prologue + rbx = rdi (this).
   *   0x4ab1ae..0x4ab1bd  forward the stack-passed tail args (impl @[rbp+0x10],
   *                       info-lo/hi @[rbp+0x18]) into the sysv-abi stack slots for the
   *                       base ctor: eax = [rbp+0x10] (impl-lo? — actually the enumId is
   *                       already in %esi from the register ABI; this movl+movups pair
   *                       shuffles the trailing PCString/impl/info args into [rsp]).
   *   0x4ab1bd           callq __ZN13OZChannelEnumC2EjRK8PCStringS2_P15OZChannelFolderjjP13
   *                              OZChannelImplP13OZChannelInfo  (base ctor, uint-prefixed sig)
   *   0x4ab1c2..0x4ab1cd  primary vptr install (this+0x0 = &__ZTV18OZChannelEnumLayer + 0x10)
   *   0x4ab1d0..0x4ab1d6  secondary vptr install (this+0x10 = &__ZTV18OZChannelEnumLayer + 0x10 + 0x380)
   *   0x4ab1da..0x4ab209  factory-singleton call_once fence (post-ctor; only ONE fence in
   *                       the j-prefixed variant — no pre-ctor fence, presumably because
   *                       the j-prefixed base ctor doesn't need the factory pointer).
   *   0x4ab20e..0x4ab215  *(this+0x8) = factory
   *   0x4ab219..0x4ab221  epilogue, return.
   *   0x4ab222..0x4ab230  unwind pad: __ZN13OZChannelEnumD2Ev(this); __Unwind_Resume.
   *
   * KEY DIFFERENCE vs the pcstring ctor: only ONE call_once fence (post-ctor), because the
   * base ctor `OZChannelEnumC2Ej...` does not take a factory argument (compare its symbol
   * — no `P9OZFactory` param). Same primary+secondary vptr installs and same factory-write.
   */
  ctor_uint(
    enumId: number,
    name: PCString,
    label: PCString,
    folder: OZChannelFolder,
    u0: number,
    u1: number,
    impl: OZChannelImpl,
    info: OZChannelInfo,
  ): void {
    // @0x4ab1bd — base ctor: OZChannelEnum::OZChannelEnum(enumId, name, label, folder,
    // u0, u1, impl, info). Frontier throw preserves the gap.
    try {
      OZChannelEnum_ctor_uint(this, enumId, name, label, folder, u0, u1, impl, info);
    } catch (e) {
      // @0x4ab222..0x4ab230 unwind pad: base dtor + _Unwind_Resume.
      try {
        OZChannelEnum_dtor(this);
      } catch {
        /* frontier throw; original exception propagates */
      }
      throw e;
    }

    // @0x4ab1c2..0x4ab1cd — primary vptr write.
    this.vtable_kind = "OZChannelEnumLayer";
    // @0x4ab1d0..0x4ab1d6 — secondary vptr write (+0x380 thunk offset).
    this.secondary_vtable_kind = "OZChannelEnumLayer_thunk";

    // @0x4ab1da..0x4ab209 — factory singleton call_once fence.
    // @0x4ab20e..0x4ab215 — *(this+0x8) = factory.
    this.factory = OZChannelEnumLayer_Factory_getInstance();
  }

  /**
   * OZChannelEnumLayer::~OZChannelEnumLayer()  — @Ozone 0x22c10  (D1 base dtor,
   *   __ZN18OZChannelEnumLayerD1Ev).
   *
   * Disasm body @0x22c10..0x22c1a:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp   0x6dd9da    ## symbol stub for: __ZN13OZChannelEnumD2Ev
   *
   * Tail-call to the base OZChannelEnum destructor — no OZChannelEnumLayer-specific cleanup
   * because the class owns no additional resources beyond its base subobject.
   */
  destroyBase(): void {
    // @0x22c15 — jmp __ZN13OZChannelEnumD2Ev.
    OZChannelEnum_dtor(this);
  }

  /**
   * OZChannelEnumLayer::~OZChannelEnumLayer()  — @Ozone 0x22c20  (D0 deleting dtor,
   *   __ZN18OZChannelEnumLayerD0Ev).
   *
   * Disasm body @0x22c20..0x22c3c:
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq  %rdi,%rbx                            ; rbx = this
   *   callq 0x6dd9da    ## __ZN13OZChannelEnumD2Ev
   *   movq  %rbx,%rdi
   *   addq  $0x8,%rsp ; popq %rbx ; popq %rbp
   *   jmp   0x6dfc36    ## __ZdlPv     (operator delete)
   *
   * Base destructor then `operator delete(this)`. In TS the operator-delete is degenerate:
   * the GC reclaims storage.
   */
  destroyAndDelete(): void {
    // @0x22c29 — callq __ZN13OZChannelEnumD2Ev.
    OZChannelEnum_dtor(this);
    // @0x22c37 — jmp __ZdlPv (operator delete) — no TS equivalent; GC reclaims.
  }

  /**
   * OZChannelEnumLayer::createOZChannelEnumLayerCurve(double v)
   *
   * @Ozone 0x0dfff0  (symbol `__ZN18OZChannelEnumLayer29createOZChannelEnumLayerCurveEd`)
   *
   * Static factory: allocates an OZCurveEnum on the heap, initialises it via `OZCurve::
   * OZCurve(0.0, 4294967295.0, 1.0, v)` (same seed doubles as OZChannelEnum::
   * createOZChannelEnumCurve @0xab460 — both u32-range enum-curve factories share the
   * exact constants and post-init sequence), rewrites the primary vptr to
   * `__ZTV11OZCurveEnum + 0x10`, lazily obtains the shared `OZCurveEnumSplineState`
   * instance, and wires it in.
   *
   * Disasm (raw-port/re/disasm/OZChannelEnumLayer.createOZChannelEnumLayerCurve.s):
   *
   *   0xdfff0..0xdfffb   pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx ; subq $0x20,%rsp
   *   0xdfffb            movsd %xmm0, -0x20(%rbp)                (spill input `v`)
   *   0xe0000            movl $0xb0,%edi                          (heap size 176 = 0xb0)
   *   0xe0005            callq __Znwm                             (operator new)
   *   0xe000a            movq %rax,%rbx                           (rbx = new_obj)
   *   0xe000d            movsd 0x625c6b(%rip),%xmm1               (xmm1 = *0x705c80 = 4294967295.0)
   *   0xe0015            movsd 0x6253c3(%rip),%xmm2               (xmm2 = *0x7053e0 = 1.0)
   *   0xe001d            xorps %xmm0,%xmm0                        (xmm0 = 0.0)
   *   0xe0020            movq %rax,%rdi                           (this  = new_obj)
   *   0xe0023            movsd -0x20(%rbp),%xmm3                  (xmm3 = v)
   *   0xe0028            callq __ZN7OZCurveC2Edddd                (OZCurve base ctor)
   *   0xe002d            leaq __ZTV11OZCurveEnum(%rip),%rax
   *   0xe0034            addq $0x10,%rax
   *   0xe0038            movq %rax,(%rbx)                         (primary vptr write -> OZCurveEnum)
   *   0xe003b            movq __ZN22OZCurveEnumSplineState13_instanceOnceE,%rax
   *   0xe0042            movq (%rax),%rax
   *   0xe0045            cmpq $-0x1,%rax                          (once-flag "done" sentinel)
   *   0xe0049            je 0xe0072                                (fast-path: already run)
   *          0xe004b..0xe006d  build the std::__1::tuple<...&&> lambda-arg on the stack
   *                             (leaq -0x11(%rbp),%rax — a 1-byte "arg" for the lambda) and
   *                             call __ZNSt3__111__call_onceERVmPvPFvS2_E with
   *                               rdi = &once, rsi = &tuple, rdx = &__call_once_proxy<lambda>.
   *   0xe0072            movq __ZN22OZCurveEnumSplineState9_instanceE,%rax   (load slot addr)
   *   0xe0079            movq (%rax),%rax                          (deref -> raw instance ptr)
   *   0xe007c            leaq 0x8(%rax),%rsi                       (rsi = raw + 0x8 sub-obj)
   *   0xe0080            testq %rax,%rax
   *   0xe0083            cmoveq %rax,%rsi                          (null -> keep null)
   *   0xe0087            movq %rbx,%rdi                            (this = new_obj)
   *   0xe008a            callq __ZN7OZCurve14setSplineStateEP13OZSplineState
   *   0xe008f..0xe009d   movq 0xa0(%rbx),%rax ; movl $0x0,0x20(%rax) ; movb $0x0,0x2(%rax)
   *                       (post-init side-effects on *(new_obj+0xa0))
   *   0xe00a1..0xe00a9   vt-slot 0x50 dispatch on new_obj:
   *                       movq (%rbx),%rax ; movq %rbx,%rdi ; xorl %esi,%esi ; callq *0x50(%rax)
   *   0xe00ac..0xe00b7   epilogue (return new_obj).
   *   0xe00b8..0xe00c6   unwind pad #1 (before OZCurve base ctor completed):
   *                       operator delete(new_obj) + __Unwind_Resume.
   *   0xe00cb..0xe00e1   unwind pad #2 (after OZCurve base ctor completed):
   *                       __ZN7OZCurveD2Ev(new_obj) + operator delete + __Unwind_Resume.
   *
   * This body is byte-parallel to OZChannelEnum::createOZChannelEnumCurve @0xab460 — same
   * heap size, same seed constants (read from the SAME `.const` addresses 0x705c80 and
   * 0x7053e0), same singleton, same vt-slot-0x50 tail. The +0x8 sub-object adjust on the
   * raw singleton pointer is preserved in commentary; identity+8 is not expressible in TS.
   */
  static createOZChannelEnumLayerCurve(v: number): OZCurveEnumShape {
    // @0xe0000 — operator new(0xb0). Modelled as a plain-object shape; K_OZCURVEENUM_SIZE
    // captures the 0xb0 byte-size for auditability.
    void K_OZCURVEENUM_SIZE;
    const curve: OZCurveEnumShape = {
      // Pre-ctor state; OZCurve ctor is the one that "installs" the base vptr (which is
      // then overwritten @0xe0038 to the OZCurveEnum vptr).
      vtable_kind: "OZCurve",
      splineState: undefined,
    };

    // @0xe000d..0xe0028 — OZCurve base ctor with (0.0, 4294967295.0, 1.0, v).
    // arg-order in the C++ signature: (min, max, defaultValue, currentValue).
    // Unwind pad #1 @0xe00b8..0xe00c6: if the ctor throws BEFORE completing, only the
    // raw allocation exists — the pad runs `operator delete(new_obj)` + __Unwind_Resume.
    // (No dtor call because the base subobject isn't fully constructed.) In TS the GC
    // reclaims, so we simply re-throw.
    try {
      OZCurve_ctor4d(curve, K_ZERO, K_UINT32_MAX_D, K_ONE, v);
    } catch (e) {
      throw e;
    }

    // @0xe002d..0xe0038 — overwrite primary vptr to `__ZTV11OZCurveEnum + 0x10`.
    curve.vtable_kind = "OZCurveEnum";

    // @0xe003b..0xe006d — std::call_once fence around the OZCurveEnumSplineState singleton.
    // JS memoisation of getInstance() handles the once-guard implicitly; the frontier stub
    // throws so the gap is loud.
    const rawInstance: OZSplineStatePtr = OZCurveEnumSplineState_getInstance();

    // @0xe007c / 0xe0080..0xe0083 — apply the +0x8 sub-object adjust unless the raw
    // pointer is null. C++ uses byte-offset multiple-inheritance thunks; TS cannot
    // subdivide an object pointer by 8 bytes, so identity+8-adjust collapses to identity.
    // The exact pointer arithmetic is preserved in this commentary and must be reinstated
    // once OZSplineState + OZCurveEnumSplineState are transcribed.
    let stateArg: OZSplineStatePtr;
    if (rawInstance === null || rawInstance === undefined) {
      stateArg = rawInstance;
    } else {
      stateArg = rawInstance;
    }

    // @0xe008a — OZCurve::setSplineState(this, state+0x8).
    // Unwind pad #2 @0xe00cb..0xe00e1: if setSplineState or the post-init side-effects
    // throw AFTER the OZCurve base ctor completed, the pad runs __ZN7OZCurveD2Ev(new_obj)
    // then `operator delete(new_obj)` and __Unwind_Resume(exc).
    try {
      OZCurve_setSplineState(curve, stateArg);

      // @0xe008f..0xe00a9 — post-init side-effects on `*(new_obj + 0xa0)` and a virtual
      // dispatch through `new_obj->vt[0x50]`. Frontier throw so the gap is loud.
      postInitializeOZCurveEnum(curve);
    } catch (e) {
      // @0xe00d1 unwind pad: OZCurve::~OZCurve(new_obj) — a frontier throw itself; swallow
      // that inner exception so the ORIGINAL (`e`) is what propagates (matching the C++
      // _Unwind_Resume semantics, which propagate the original exception).
      try {
        OZCurve_dtor(curve);
      } catch {
        /* frontier throw; propagate the original `e` */
      }
      throw e;
    }

    // @0xe00ac — return new_obj.
    return curve;
  }
}
