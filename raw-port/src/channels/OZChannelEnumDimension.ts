// OZChannelEnumDimension — a "dimension" enum channel (Ozone.framework). Extends OZChannelEnum
// and adds one static factory method `createOZChannelEnumDimensionCurve(double)` that builds a
// heap OZCurveEnum with a u32-range domain (0..UINT32_MAX) — the enum-index domain used by
// dimension pickers. Structurally mirrors OZChannelEnumRetime (same layout, same call_once +
// vptr install sequence), but its ctor overloads take an EXTRA `OZChannelImpl*` argument that
// is forwarded to the base ctor (compare OZChannelEnumRetime, which passes nullptr).
//
// Faithful port from disassembly:
//   raw-port/re/disasm/OZChannelEnumDimension.OZChannelEnumDimension.s          (C1 6-arg thunk @Ozone 0x4b3250)
//   raw-port/re/disasm/OZChannelEnumDimension.createOZChannelEnumDimensionCurve.s (method @Ozone 0xf52e0)
//   /tmp/oz_ceed.txt (extracted C2 bodies + destructors — see disasm.sh + otool -tV).
//
// STRUCT LAYOUT (recovered from ctor bodies @0x4b3140 / @0x4b3260):
//   +0x000  vtable[0]  primary vptr  (vtable @Ozone, installed slot = vtable+0x10)
//   +0x008  OZChannelEnumDimension_Factory* _instance   (RIP-relative singleton set by call_once)
//   +0x010  vtable[1]  secondary vptr (vtable+0x380) — multiple-inheritance thunk table for the
//                                                     OZFactoryBase/etc. sub-object
//   +0x018 …          OZChannelEnum base subobject (opaque, frontier — see OZChannel* base ctors
//                                                    at stubs 0x6dd9bc / 0x6dd9c8)
//
// STATIC GLOBALS (all @Ozone, RIP-relative from ctor bodies):
//   OZChannelEnumDimension_Factory::_instanceOnce  — std::once_flag (u64).
//     Referenced @0x4b3164 (load for cmp -0x1), @0x4b3181 (leaq for __call_once), @0x4b31e6
//     (second call_once), @0x4b3203, @0x4b3356, @0x4b3373.
//   OZChannelEnumDimension_Factory::_instance      — OZChannelEnumDimension_Factory* singleton.
//     Loaded @0x4b31a4 (used as `factory` arg to base ctor), @0x4b321a (stored at this+0x8),
//     @0x4b32a6/@0x4b32da for the u32-leading ctor, @0x4b338a.
//   OZChannelEnumDimension vtable                  — installed pointer = vtable+0x10 at this+0x00
//                                                    and vtable+0x380 at this+0x10.
//
// The 7 exported methods (all covered here — ledger count matches):
//   0x00000000000f52e0  createOZChannelEnumDimensionCurve(double)                            [static factory]
//   0x0000000000023110  ~OZChannelEnumDimension()                                            [D1: jmp base D2]
//   0x0000000000023120  ~OZChannelEnumDimension()                                            [D0: base D2 + operator delete]
//   0x00000000004b3140  ctor(PCString&, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*)  [C2]
//   0x00000000004b3250  ctor(PCString&, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*)  [C1 -> C2]
//   0x00000000004b3260  ctor(u32, PCString&, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*) [C2]
//   0x00000000004b3310  ctor(u32, PCString&, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*) [C1 -> C2]
//
// FRONTIER CALLEES (each throwing stub cites its @0xADDR):
//   OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32,
//                                 OZChannelImpl*, OZChannelInfo*)   @Ozone stub 0x6dd9bc
//   OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZChannelFolder*, u32, u32,
//                                 OZChannelImpl*, OZChannelInfo*)   @Ozone stub 0x6dd9c8
//   OZChannelEnum::~OZChannelEnum()                                 @Ozone stub 0x6dd9da
//   operator new(unsigned long)                                     @Ozone stub 0x6dfca2
//   operator delete(void*)                                          @Ozone stub 0x6dfc36
//   OZChannelEnumDimension_Factory::getInstance()                   @Ozone 0x22c80 (call_once lambda proxy body)
//   std::__1::__call_once(...)                                      @Ozone stub 0x6dfb2e
//   OZCurve::OZCurve(double,double,double,double)                   @Ozone stub 0x6dec16
//   OZCurve::setSplineState(OZSplineState*)                         @Ozone stub 0x6debfe
//   OZCurveEnumSplineState::getInstance()                           @Ozone (call_once lambda body)
//   OZCurve::~OZCurve()                                             @Ozone stub 0x6dec1c
//
// The C1 constructors are 4-instruction thunks that jump directly to the corresponding C2
// (pushq rbp / movq rsp,rbp / popq rbp / jmp C2) — the TS ports do exactly the same delegation.

// ---------------------------------------------------------------------------------------------
// Opaque types the ctors pass through to the (frontier) base ctor. We do not dereference these.
// ---------------------------------------------------------------------------------------------
export type PCStringRef = { readonly __pcstring: true } | string;
export type OZChannelFolderPtr = object | null | undefined;
export type OZChannelImplPtr   = object | null | undefined;
export type OZChannelInfoPtr   = object | null | undefined;
export type OZSplineStatePtr   = object | null | undefined;

// The factory type is opaque here — its methods (createChannel/createInstance/…) live in a
// separate class (OZChannelEnumDimension_Factory). The ctor only stores a pointer to it at +0x8.
export type OZChannelEnumDimension_FactoryPtr = object | null;

// ---------------------------------------------------------------------------------------------
// Factory singleton — mirrors the RIP-relative globals accessed by the ctors. The GLOBAL SLOTS
// exist in the framework binary and are initialized on first access via std::call_once. Until
// OZChannelEnumDimension_Factory itself is ported, `getInstance()` throws citing the addresses.
// ---------------------------------------------------------------------------------------------
export class OZChannelEnumDimension_Factory {
  /** _instanceOnce — RIP-relative std::once_flag u64.
   *  Loaded @0x4b3164 / @0x4b31e6 / @0x4b3356 / @0x4b32a6 (via `movq …_instanceOnce(%rip),%rax`). */
  static _instanceOnce: bigint = 0n;
  /** _instance — the singleton pointer. Set only inside getInstance()'s call_once lambda body.
   *  Loaded @0x4b31a4 / @0x4b321a / @0x4b32da / @0x4b338a. */
  static _instance: OZChannelEnumDimension_FactoryPtr = null;

  /**
   * OZChannelEnumDimension_Factory::getInstance() — @Ozone 0x22c80 (body is the lambda inlined
   * into every ctor via std::call_once; symbol reference:
   * __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN30OZChannelEnumDimension_Factory11getInstanceEvEUlvE_EEEEEvPv).
   * NOT YET TRANSCRIBED — the lambda body constructs the singleton OZChannelEnumDimension_Factory
   * (itself a frontier class with 20+ methods). Throwing here surfaces the gap the moment any
   * real construction is attempted.
   */
  static getInstance(): OZChannelEnumDimension_FactoryPtr {
    throw new Error(
      "OZChannelEnumDimension_Factory::getInstance() @Ozone 0x22c80 (call_once proxy " +
      "__ZNSt3__117__call_once_proxy…OZChannelEnumDimension_Factory11getInstance…) not yet " +
      "transcribed — sets _instanceOnce (@0x4b3164/@0x4b31e6/@0x4b3356/@0x4b32a6) and _instance " +
      "(@0x4b31a4/@0x4b321a/@0x4b32da/@0x4b338a) globals",
    );
  }
}

// ---------------------------------------------------------------------------------------------
// Frontier base ctor stubs — OZChannelEnum. Both overloads are __stubs entries.
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelEnum::OZChannelEnum(PCString const& name, OZFactory* factory, PCString const& name2,
 *                              OZChannelFolder* folder, u32 u1, u32 u2, OZChannelImpl* impl,
 *                              OZChannelInfo* info) — @Ozone stub 0x6dd9bc.
 * NOT YET TRANSCRIBED. Called from OZChannelEnumDimension C2(6-arg) @0x4b31c9 with
 *   name    = arg1 (rsi)  from ctor
 *   factory = _instance   (loaded @0x4b31a4 into rdx)
 *   name2   = arg2 (rdx)  from ctor (spilled r13)
 *   folder  = arg3 (rcx)  from ctor (spilled r12)
 *   u1      = arg4 (r8d)  from ctor (spilled r15d)   -- passed as r9d
 *   u2      = arg5 (r9d)  from ctor (spilled r14d)   -- passed on stack@0(%rsp)
 *   impl    = arg6 (stack rbp+0x10) — the caller's OZChannelImpl*  (passed on stack@0x8(%rsp))
 *   info    = nullptr     (movq $0,0x10(%rsp) @0x4b31b4)
 */
function OZChannelEnum_C2_from_PCString(
  _self: OZChannelEnumDimension,
  _name: PCStringRef,
  _factory: OZChannelEnumDimension_FactoryPtr,
  _name2: PCStringRef,
  _folder: OZChannelFolderPtr,
  _u1: number,
  _u2: number,
  _impl: OZChannelImplPtr,
  _info: OZChannelInfoPtr,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32, " +
    "OZChannelImpl*, OZChannelInfo*) @Ozone stub 0x6dd9bc not yet transcribed " +
    "(called from OZChannelEnumDimension C2 @0x4b31c9)",
  );
}

/**
 * OZChannelEnum::OZChannelEnum(u32 id, PCString const& name, PCString const& name2,
 *                              OZChannelFolder* folder, u32 u1, u32 u2, OZChannelImpl* impl,
 *                              OZChannelInfo* info) — @Ozone stub 0x6dd9c8.
 * NOT YET TRANSCRIBED. Called from OZChannelEnumDimension C2(7-arg, u32-leading) @0x4b3289.
 * Args (per ctor disasm):
 *   this   = rdi (self)
 *   id     = rsi (u32)
 *   name   = rdx
 *   name2  = rcx
 *   folder = r8
 *   u1     = r9d
 *   u2     = mov eax,0x10(rbp) then mov [rsp],eax     (passed via stack@0)
 *   impl   = movq 0x18(rbp),%rdi then mov [rsp+0x8]   (caller's OZChannelImpl*)
 *   info   = nullptr  (movq $0,0x10(%rsp) @0x4b327d)
 */
function OZChannelEnum_C2_from_u32(
  _self: OZChannelEnumDimension,
  _id: number,
  _name: PCStringRef,
  _name2: PCStringRef,
  _folder: OZChannelFolderPtr,
  _u1: number,
  _u2: number,
  _impl: OZChannelImplPtr,
  _info: OZChannelInfoPtr,
): void {
  throw new Error(
    "OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZChannelFolder*, u32, u32, " +
    "OZChannelImpl*, OZChannelInfo*) @Ozone stub 0x6dd9c8 not yet transcribed " +
    "(called from OZChannelEnumDimension C2 @0x4b3289)",
  );
}

/**
 * OZChannelEnum::~OZChannelEnum() — @Ozone stub 0x6dd9da. NOT YET TRANSCRIBED.
 * Called from:
 *   OZChannelEnumDimension D1 (@0x23110): 4-instr thunk `pushq rbp / movq rsp,rbp / popq rbp / jmp`
 *     — direct tail-jump to this base D2.
 *   OZChannelEnumDimension D0 (@0x23120): call base D2, then jmp operator delete (@0x6dfc36).
 *   Unwind landing pads @0x4b323a (6-arg C2) and @0x4b32f4 (u32-leading C2) — partial-construction
 *   cleanup.
 */
function OZChannelEnum_D2(_self: OZChannelEnumDimension): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum() @Ozone stub 0x6dd9da not yet transcribed " +
    "(called from OZChannelEnumDimension D0 @0x23129, D1 @0x23115, and unwind " +
    "pads @0x4b323a / @0x4b32f4)",
  );
}

// ---------------------------------------------------------------------------------------------
// createOZChannelEnumDimensionCurve — frontier callees below build the OZCurveEnum + wire the
// shared OZCurveEnumSplineState singleton. Every stub cites its @0xADDR.
// ---------------------------------------------------------------------------------------------

/**
 * Structural shape of the newly-allocated `OZCurveEnum` prior to the vptr write. The C++ layout
 * is a 0xb0-byte struct fully initialised by `OZCurve::OZCurve(double,double,double,double)`
 * (@stub 0x6dec16). We only touch the parts named here; every other byte belongs to the OZCurve
 * base ctor and stays opaque. Same shape as OZChannelEnum.ts uses.
 */
export interface OZCurveEnumShape {
  /** +0x00 vptr — assigned to `__ZTV11OZCurveEnum + 0x10` at @0xf531d..0xf5328. */
  vtable_kind: "OZCurve" | "OZCurveEnum";
  /** splineState pointer written by `OZCurve::setSplineState` @0xf537a (after the +0x8
   *  sub-object adjust — see doc-comment on `createOZChannelEnumDimensionCurve` below). */
  splineState: OZSplineStatePtr;
}

/** `OZCurve::OZCurve(double, double, double, double)` — symbol `__ZN7OZCurveC2Edddd`
 *  @Ozone stub 0x6dec16 (called @0xf5318 with (0.0, 4294967295.0, 1.0, <input>)). Frontier. */
function OZCurve_ctor4d(
  _obj: OZCurveEnumShape,
  _a0: number,
  _a1: number,
  _a2: number,
  _a3: number,
): void {
  throw new Error(
    "OZCurve::OZCurve(double,double,double,double) @Ozone stub 0x6dec16 not yet transcribed " +
    "(called from OZChannelEnumDimension::createOZChannelEnumDimensionCurve @0xf5318)",
  );
}

/** `OZCurve::setSplineState(OZSplineState*)` — symbol `__ZN7OZCurve14setSplineStateEP13OZSplineState`
 *  @Ozone stub 0x6debfe (called @0xf537a). Frontier. */
function OZCurve_setSplineState(_obj: OZCurveEnumShape, _s: OZSplineStatePtr): void {
  throw new Error(
    "OZCurve::setSplineState(OZSplineState*) @Ozone stub 0x6debfe not yet transcribed " +
    "(called from OZChannelEnumDimension::createOZChannelEnumDimensionCurve @0xf537a)",
  );
}

/**
 * `OZCurveEnumSplineState::getInstance()` — Ozone-framework singleton whose raw pointer is
 * loaded from `__ZN22OZCurveEnumSplineState9_instanceE` (VA-ref @0xf5362) after a
 * `std::call_once` guard on `__ZN22OZCurveEnumSplineState13_instanceOnceE` (VA-ref @0xf532b /
 * @0xf534b). The returned pointer is offset by +0x8 before being handed to
 * `OZCurve::setSplineState` (see @0xf536c: `leaq 0x8(%rax),%rsi` — a multiple-inheritance
 * sub-object adjust). If the raw instance pointer is null the adjust is short-circuited
 * (`testq %rax,%rax; cmoveq %rax,%rsi` @0xf5370..@0xf5373).
 *
 * The initialiser lambda body is not yet transcribed — frontier stub. Returns the raw instance
 * pointer; the caller applies the +0x8 sub-object adjust exactly as the compiler emitted it.
 */
function OZCurveEnumSplineState_getInstance(): OZSplineStatePtr {
  throw new Error(
    "OZCurveEnumSplineState::getInstance() singleton @Ozone not yet transcribed " +
    "(std::call_once guard __ZN22OZCurveEnumSplineState13_instanceOnceE @VA-ref 0xf532b; " +
    "global __ZN22OZCurveEnumSplineState9_instanceE @VA-ref 0xf5362)",
  );
}

/**
 * Frontier stub covering the tail @0xf537f..0xf5399:
 *
 *   0xf537f  movq 0xa0(%rbx),%rax
 *   0xf5386  movl $0x0, 0x20(%rax)                  // *(newObj+0xa0)+0x20 = 0u32
 *   0xf538d  movb $0x0, 0x2(%rax)                   // *(newObj+0xa0)+0x2  = 0u8
 *   0xf5391  movq (%rbx),%rax                       // rax = vptr
 *   0xf5394  movq %rbx,%rdi                         // arg0 = this
 *   0xf5397  xorl %esi,%esi                         // arg1 = 0
 *   0xf5399  callq *0x50(%rax)                      // vt-slot 0x50 (index 10) on OZCurveEnum
 *
 * The vtable slot at offset 0x50 resolves via `__ZTV11OZCurveEnum + 0x10 + 0x50`. Its method
 * identity is recoverable via `raw-port/army/tools/resolve.py Ozone vtable OZCurveEnum 0x50`
 * once we open OZCurveEnum.ts for decode — leaving as a frontier throw here preserves the
 * @0xADDR trail without inventing a body.
 */
function postInitializeOZCurveEnum(_curve: OZCurveEnumShape): void {
  throw new Error(
    "OZCurveEnum post-init tail @Ozone 0xf537f..0xf5399 not yet transcribed " +
    "(writes *(this+0xa0)+0x20=0u32, *(this+0xa0)+0x2=0u8, then dispatches this->vt[0x50](this,0) " +
    "via __ZTV11OZCurveEnum)",
  );
}

// ── seed constants read from Ozone __TEXT __const (verified via resolve.py Ozone const) ────
/** @const 0x7053e0  double = 1.0            (u64 0x3ff0000000000000)
 *  — 3rd arg (xmm2) to OZCurve::OZCurve(d,d,d,d) @0xf5318 in createOZChannelEnumDimensionCurve.
 *    Loaded @0xf5305: `movsd 0x6100d3(%rip),%xmm2` -> RIP=0xf530d + 0x6100d3 = 0x7053e0. */
const K_ONE: number = 1.0;
/** @const 0x705c80  double = 4294967295.0   (u64 0x41efffffffe00000  ≡ UINT32_MAX as double)
 *  — 2nd arg (xmm1) to OZCurve::OZCurve(d,d,d,d) @0xf5318 in createOZChannelEnumDimensionCurve.
 *    Loaded @0xf52fd: `movsd 0x61097b(%rip),%xmm1` -> RIP=0xf5305 + 0x61097b = 0x705c80. */
const K_UINT32_MAX_D: number = 4294967295.0;
/** implicit zero — 1st arg (xmm0) to OZCurve::OZCurve(d,d,d,d) via `xorps %xmm0,%xmm0`
 *  @0xf530d. */
const K_ZERO: number = 0.0;
/** OZCurveEnum heap size in bytes — `movl $0xb0,%edi` @0xf52f0 fed to operator new. */
const K_OZCURVEENUM_SIZE: number = 0xb0;

// ---------------------------------------------------------------------------------------------
// OZChannelEnumDimension — see doc comment at top of file for full struct layout + provenance.
// ---------------------------------------------------------------------------------------------
export class OZChannelEnumDimension {
  /** vtable[0] slot — installed as vtable+0x10 at (this+0x00) by every ctor
   *  (@0x4b31ce/@0x4b31d9 for the 6-arg C2; @0x4b328e/@0x4b3299 for the u32-leading C2). */
  readonly __vptr0: unknown = null;
  /** OZChannelEnumDimension_Factory* at (this+0x08) — set to `_instance` AFTER the base ctor and
   *  the trailing call_once (@0x4b3221 / @0x4b32e1). Semantically the concrete-class factory
   *  pointer the ctor "self-registers" onto the instance. */
  _factory: OZChannelEnumDimension_FactoryPtr = null;
  /** vtable[1] slot — installed as vtable+0x380 at (this+0x10) by every ctor
   *  (@0x4b31dc/@0x4b31e2 for the 6-arg C2; @0x4b329c/@0x4b32a2 for the u32-leading C2).
   *  This is the multiple-inheritance secondary sub-object vptr. */
  readonly __vptr1: unknown = null;

  /**
   * OZChannelEnumDimension(PCString const& name, PCString const& name2, OZChannelFolder* folder,
   *                        u32 u1, u32 u2, OZChannelImpl* impl) — C2 body @Ozone 0x4b3140.
   *
   * Disasm control flow (verbatim, line-for-line):
   *   @0x4b3151..0x4b3160  spill args: r14d=u2, r15d=u1, r12=folder, r13=name2, rbx=this,
   *                        rdi = *(rbp+0x10) = OZChannelImpl* (6th user arg on stack).
   *   @0x4b3164  load _instanceOnce; if != -1 -> jump past call_once (@0x4b31a4).
   *   @0x4b3171..0x4b3197  set up std::__call_once frame:
   *                          -0x29(%rbp) = local flag byte
   *                          -0x40(%rbp) = &flag_byte
   *                          -0x38(%rbp) = &-0x40      (the "arg" tuple pointer)
   *                          rdi = &_instanceOnce
   *                          rdx = __call_once_proxy<...OZChannelEnumDimension_Factory::getInstance…>
   *                          rsi = &-0x38
   *                          (spill rsi=name at -0x48(%rbp) before call)
   *                          callq __ZNSt3__111__call_onceERVmPvPFvS2_E   (@stub 0x6dfb2e)
   *   @0x4b319c..0x4b31a0  reload rdi=OZChannelImpl* and rsi=name from the spills.
   *   @0x4b31a4  rdx = _instance   ; factory pointer (OZFactory* arg to base ctor)
   *   @0x4b31ab..0x4b31bd  stack layout for base ctor call:
   *                          [rsp+0x00] = u2 (r14d)         mov [rsp], r14d
   *                          [rsp+0x08] = OZChannelImpl*    mov [rsp+8], rdi
   *                          [rsp+0x10] = 0  (info)         movq $0, [rsp+0x10]
   *                        set up regs:
   *                          rdi = this (rbx)
   *                          rsi = name  (spilled -0x48(%rbp))
   *                          rdx = factory (_instance)
   *                          rcx = name2 (r13)
   *                          r8  = folder (r12)
   *                          r9d = u1 (r15d)
   *                          callq OZChannelEnum::C2(name, factory, name2, folder, u1, u2, impl, nullptr)
   *                                (stub @0x6dd9bc @0x4b31c9)
   *   @0x4b31ce  rax = &vtable_OZChannelEnumDimension          (RIP-relative)
   *   @0x4b31d5  rcx = rax + 0x10                              (installed pointer = vtable+0x10)
   *   @0x4b31d9  *(this + 0x00) = rcx                          (primary vptr)
   *   @0x4b31dc  rax += 0x380                                  (secondary sub-object slot)
   *   @0x4b31e2  *(this + 0x10) = rax                          (secondary vptr)
   *   @0x4b31e6..0x4b3215  second call_once on _instanceOnce with the SAME lambda:
   *                        the compiler emitted a redundant post-base-ctor call_once — we
   *                        transcribe it literally.
   *   @0x4b321a  rax = _instance
   *   @0x4b3221  *(this + 0x08) = rax
   *   @0x4b3225..0x4b3233  epilogue: pop frame + retq.
   *   @0x4b3234..0x4b3242  unwind pad: base OZChannelEnum::D2 + __Unwind_Resume.
   */
  private ctor_6arg(
    name: PCStringRef,
    name2: PCStringRef,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
    impl: OZChannelImplPtr,
  ): void {
    // u1 / u2 are unsigned 32-bit — the ABI passes them in 32-bit regs (r15d, r14d) and stores u2
    // as a 4-byte slot on the stack. Preserve that width contract.
    const U1 = u1 >>> 0;   // uint32
    const U2 = u2 >>> 0;   // uint32

    // ---- 1) std::call_once(_instanceOnce, getInstance lambda) — @0x4b3164..0x4b31a0 ----------
    // If _instanceOnce == -1 (already ran), skip. Otherwise run the lambda through the proxy.
    // The lambda body (frontier) constructs the singleton and writes _instance.
    if (OZChannelEnumDimension_Factory._instanceOnce !== -1n) {
      OZChannelEnumDimension_Factory.getInstance();
    }

    // ---- 2) OZChannelEnum::C2(this, name, _instance, name2, folder, u1, u2, impl, nullptr) ---
    //         @0x4b31c9 — base ctor with factory=_instance and caller's impl. Frontier stub.
    const factory = OZChannelEnumDimension_Factory._instance;
    OZChannelEnum_C2_from_PCString(this, name, factory, name2, folder, U1, U2, impl, null);

    // ---- 3) Install vptrs @0x4b31ce..0x4b31e2 -----------------------------------------------
    // Primary vptr = vtable+0x10. Secondary vptr = vtable+0x380 (multiple-inheritance secondary
    // sub-object table). The actual vtable slots dispatch to OZChannelEnumDimension::* thunks;
    // in TS the readonly __vptr0/__vptr1 slots model the class-identity fingerprint (nothing to
    // write here — the class instance itself is the identity).

    // ---- 4) Redundant second call_once — @0x4b31e6..0x4b3215 --------------------------------
    // Present in the binary exactly as emitted. Repeating literally to match control flow.
    if (OZChannelEnumDimension_Factory._instanceOnce !== -1n) {
      OZChannelEnumDimension_Factory.getInstance();
    }

    // ---- 5) Store _instance at (this+0x08) — @0x4b321a/@0x4b3221 -----------------------------
    this._factory = OZChannelEnumDimension_Factory._instance;
  }

  /**
   * OZChannelEnumDimension(u32 id, PCString const& name, PCString const& name2,
   *                        OZChannelFolder* folder, u32 u1, u32 u2,
   *                        OZChannelImpl* impl) — C2 body @Ozone 0x4b3260.
   *
   * Disasm control flow (verbatim):
   *   @0x4b326b  rbx = this (rdi).
   *   @0x4b326e  eax = *(u32*)(rbp+0x10)          ; u2 arrived on stack (6th u32 arg).
   *   @0x4b3271  rdi = *(rbp+0x18)                ; OZChannelImpl* (7th arg on stack).
   *   @0x4b3275..0x4b327d  stack layout for base ctor:
   *                          [rsp+0x00] = u2   (mov [rsp], eax)
   *                          [rsp+0x08] = impl (mov [rsp+8], rdi)
   *                          [rsp+0x10] = 0    (info)
   *   @0x4b3286  rdi = this (rbx).
   *   @0x4b3289  callq OZChannelEnum::C2(this, id, name, name2, folder, u1, u2, impl, nullptr)
   *              (stub @0x6dd9c8). NOTE: rsi=id / rdx=name / rcx=name2 / r8=folder / r9d=u1
   *              are already in place from THIS ctor's own ABI regs (no re-shuffling).
   *   @0x4b328e..0x4b32a2  install vptrs (identical to the 6-arg variant): primary=vtable+0x10
   *              at this+0x00; secondary=vtable+0x380 at this+0x10.
   *   @0x4b32a6..0x4b32d5  std::call_once(_instanceOnce, getInstance lambda). ONE call in this
   *              overload (not two — vs @0x4b3164+@0x4b31e6 in the 6-arg variant). Frame slots:
   *              -0x11(%rbp)=flag_byte, -0x28(%rbp)=&flag_byte, -0x20(%rbp)=&-0x28.
   *   @0x4b32da..0x4b32e1  *(this+0x08) = _instance.
   *   @0x4b32e5..0x4b32ed  epilogue + retq.
   *   @0x4b32ee..0x4b32fc  unwind pad: base OZChannelEnum::D2 + __Unwind_Resume.
   *
   * Notable difference vs the 6-arg C2: the base ctor overload used here takes `u32 id` as its
   * FIRST arg and DOES NOT receive a factory pointer (compare @0x6dd9c8 vs @0x6dd9bc). The
   * single trailing call_once (vs the 6-arg's two) is exactly what the compiler emitted.
   */
  private ctor_7arg(
    id: number,
    name: PCStringRef,
    name2: PCStringRef,
    folder: OZChannelFolderPtr,
    u1: number,
    u2: number,
    impl: OZChannelImplPtr,
  ): void {
    const ID = id >>> 0;   // uint32
    const U1 = u1 >>> 0;   // uint32
    const U2 = u2 >>> 0;   // uint32

    // ---- 1) OZChannelEnum::C2(this, id, name, name2, folder, u1, u2, impl, nullptr) ---------
    //         @0x4b3289 — the u32-leading base ctor overload (@Ozone stub 0x6dd9c8). Frontier.
    OZChannelEnum_C2_from_u32(this, ID, name, name2, folder, U1, U2, impl, null);

    // ---- 2) Install vptrs — identical to the 6-arg C2 (@0x4b328e..0x4b32a2) -----------------
    // primary = vtable+0x10; secondary = vtable+0x380. Modeled as class-identity; see layout.

    // ---- 3) std::call_once on _instanceOnce — @0x4b32a6..0x4b32d5 --------------------------
    if (OZChannelEnumDimension_Factory._instanceOnce !== -1n) {
      OZChannelEnumDimension_Factory.getInstance();
    }

    // ---- 4) Store _instance at (this+0x08) — @0x4b32da/@0x4b32e1 ---------------------------
    this._factory = OZChannelEnumDimension_Factory._instance;
  }

  /**
   * OZChannelEnumDimension::OZChannelEnumDimension(...) — dispatcher for the two ctor shapes.
   *
   * C1-thunk provenance:
   *   @Ozone 0x4b3250  (C1: 6-arg PCString&,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*)
   *                    -> jmp C2 @0x4b3140
   *   @Ozone 0x4b3310  (C1: u32,PCString&,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*)
   *                    -> jmp C2 @0x4b3260
   * Both C1 thunks are `pushq rbp / movq rsp,rbp / popq rbp / jmp C2` — a plain tail-call to the
   * complete C2 body. We honor that by routing both call shapes through the C2 bodies below.
   */
  constructor(
    a: PCStringRef | number,
    b: PCStringRef,
    c: PCStringRef | OZChannelFolderPtr,
    d: OZChannelFolderPtr | number,
    e: number,
    f: number | OZChannelImplPtr,
    g?: OZChannelImplPtr,
  ) {
    if (typeof a === "number") {
      // (u32, PCString&, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*)
      //   — C1 @0x4b3310 -> C2 @0x4b3260.
      // f must be a number (u32) and g the OZChannelImpl* pointer in this shape.
      if (typeof f !== "number") {
        throw new Error(
          "OZChannelEnumDimension(u32,PCString&,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*) " +
          "@Ozone 0x4b3260 requires args: f=u32, g=OZChannelImpl* (u2 arrives on stack @rbp+0x10, " +
          "impl arrives on stack @rbp+0x18 in ABI)",
        );
      }
      this.ctor_7arg(a, b, c as PCStringRef, d as OZChannelFolderPtr, e, f, g);
    } else {
      // (PCString&, PCString&, OZChannelFolder*, u32, u32, OZChannelImpl*)
      //   — C1 @0x4b3250 -> C2 @0x4b3140.
      // f must be the OZChannelImpl* pointer; g must be absent (6 user args).
      if (typeof f === "number") {
        throw new Error(
          "OZChannelEnumDimension(PCString&,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*) " +
          "@Ozone 0x4b3140 takes exactly 6 args; f must be OZChannelImpl*, not u32",
        );
      }
      if (g !== undefined) {
        throw new Error(
          "OZChannelEnumDimension(PCString&,PCString&,OZChannelFolder*,u32,u32,OZChannelImpl*) " +
          "@Ozone 0x4b3140 takes exactly 6 args; got 7",
        );
      }
      this.ctor_6arg(a, b as PCStringRef, c as OZChannelFolderPtr, d as number, e, f);
    }
  }

  /**
   * OZChannelEnumDimension::createOZChannelEnumDimensionCurve(double)
   *
   * @Ozone 0x000f52e0  (symbol `__ZN22OZChannelEnumDimension33createOZChannelEnumDimensionCurveEd`)
   *
   * Static factory: allocates an OZCurveEnum on the heap, initialises it via
   * `OZCurve::OZCurve(0.0, 4294967295.0, 1.0, v)` (the u32-range OZCurve variant — same three
   * seed doubles as OZChannelEnum::createOZChannelEnumCurve @0xab460 and
   * OZChannelUint32::createOZChannelUint32Curve @0xdf570), rewrites the primary vptr to
   * `__ZTV11OZCurveEnum + 0x10`, lazily obtains the shared `OZCurveEnumSplineState` instance,
   * and wires it in. NOTE: this is a NON-VIRTUAL, NON-STATIC-BUT-SELF-CONTAINED helper — the C++
   * symbol is `OZChannelEnumDimension::createOZChannelEnumDimensionCurve(double)` but the body
   * never dereferences `this` (no rdi load beyond the operator-new-returned rbx). We expose it
   * as a static method to match that reality.
   *
   * Disasm (raw-port/re/disasm/OZChannelEnumDimension.createOZChannelEnumDimensionCurve.s),
   * instruction-by-instruction:
   *
   *   0xf52e0..0xf52ea  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx ; subq $0x20,%rsp
   *   0xf52eb           movsd %xmm0, -0x20(%rbp)                            (spill input `v`)
   *   0xf52f0           movl $0xb0,%edi                                     (heap size 176 = 0xb0)
   *   0xf52f5           callq __Znwm                                        (operator new @stub 0x6dfca2)
   *   0xf52fa           movq %rax,%rbx                                      (rbx = new_obj)
   *   0xf52fd           movsd 0x61097b(%rip),%xmm1                          (xmm1 = *0x705c80 = 4294967295.0)
   *   0xf5305           movsd 0x6100d3(%rip),%xmm2                          (xmm2 = *0x7053e0 = 1.0)
   *   0xf530d           xorps %xmm0,%xmm0                                   (xmm0 = 0.0)
   *   0xf5310           movq %rax,%rdi                                      (this = new_obj)
   *   0xf5313           movsd -0x20(%rbp),%xmm3                             (xmm3 = v)
   *   0xf5318           callq __ZN7OZCurveC2Edddd                           (OZCurve base ctor @stub 0x6dec16)
   *   0xf531d           leaq __ZTV11OZCurveEnum(%rip),%rax
   *   0xf5324           addq $0x10,%rax
   *   0xf5328           movq %rax,(%rbx)                                    (primary vptr write)
   *   0xf532b           movq __ZN22OZCurveEnumSplineState13_instanceOnceE,%rax
   *   0xf5332           movq (%rax),%rax
   *   0xf5335           cmpq $-0x1,%rax                                     (once-flag "done" sentinel)
   *   0xf5339           je 0xf5362                                          (fast-path: already run)
   *          @0xf533b..0xf535d  build std::__1::tuple<...&&> lambda-arg on the stack
   *                              (leaq -0x11(%rbp),%rax — a 1-byte "arg" for the lambda) and
   *                              call __ZNSt3__111__call_onceERVmPvPFvS2_E (@stub 0x6dfb2e) with
   *                                rdi = &once, rsi = &tuple, rdx = &__call_once_proxy<lambda>.
   *   0xf5362           movq __ZN22OZCurveEnumSplineState9_instanceE,%rax    (load instance slot addr)
   *   0xf5369           movq (%rax),%rax                                    (deref -> raw instance ptr)
   *   0xf536c           leaq 0x8(%rax),%rsi                                 (rsi = raw + 0x8 sub-object)
   *   0xf5370           testq %rax,%rax
   *   0xf5373           cmoveq %rax,%rsi                                    (null -> keep null)
   *   0xf5377           movq %rbx,%rdi                                      (this = new_obj)
   *   0xf537a           callq __ZN7OZCurve14setSplineStateEP13OZSplineState (@stub 0x6debfe)
   *   0xf537f..0xf5386  movq 0xa0(%rbx),%rax ; movl $0x0,0x20(%rax)          (post-init side-effect)
   *   0xf538d           movb $0x0,0x2(%rax)                                 (post-init side-effect)
   *   0xf5391..0xf5399  vt-slot 0x50 dispatch on new_obj:
   *                       movq (%rbx),%rax ; movq %rbx,%rdi ; xorl %esi,%esi ; callq *0x50(%rax)
   *                       (calls new_obj->vt[0x50/8=10](this, 0) — a virtual method on OZCurveEnum
   *                        whose slot resolves via the freshly-installed __ZTV11OZCurveEnum+0x10 —
   *                        deferred to postInitializeOZCurveEnum() above.)
   *   0xf539c..0xf53a7  epilogue (return new_obj).
   *   0xf53a8..0xf53b6  unwind pad #1: before the vptr install completed
   *                     -> operator delete(new_obj) + __Unwind_Resume.
   *   0xf53bb..0xf53d1  unwind pad #2: after OZCurve ctor completed
   *                     -> OZCurve::~OZCurve(new_obj) + operator delete + __Unwind_Resume.
   *
   * The two post-init writes @0xf537f..0xf538d are into `*(new_obj + 0xa0)` (a struct pointer
   * stored inside the freshly-built OZCurveEnum). Since the OZCurve/OZCurveEnum layout is not
   * yet decoded here, we surface the write as a call into the OZCurveEnum instance itself and
   * let the un-ported class handle the byte semantics — the +0xa0 field, the u32-zero at +0x20
   * of that inner struct, and the u8-zero at +0x2 are FRONTIER: the callee that would decode
   * them belongs in OZCurveEnum.ts. To avoid a silent gap we throw from the frontier stub
   * `postInitializeOZCurveEnum`.
   *
   * The body is byte-for-byte identical to `OZChannelEnum::createOZChannelEnumCurve` @0xab460
   * (see raw-port/src/channels/OZChannelEnum.ts) — same three seed doubles, same 0xb0 heap size,
   * same OZCurveEnum vtable install, same OZCurveEnumSplineState singleton wiring, same
   * post-init tail. The addresses differ (0xf52e0 here vs 0xab460 there) because the symbol
   * is emitted twice (once per concrete OZChannelEnum-derived class); ICF has not folded them.
   */
  static createOZChannelEnumDimensionCurve(v: number): OZCurveEnumShape {
    // @0xf52f0 — operator new(0xb0). Modelled as a plain-object shape (the 0xb0 byte-size is
    // captured in K_OZCURVEENUM_SIZE for auditability). No implicit zeroing — every field is
    // set by the ctor call below.
    void K_OZCURVEENUM_SIZE;
    const curve: OZCurveEnumShape = {
      // Seed to the C++ pre-ctor state; OZCurve ctor is the one that "installs" the base vptr
      // (which is then overwritten @0xf5328 to the OZCurveEnum vptr).
      vtable_kind: "OZCurve",
      splineState: undefined,
    };

    // @0xf52fd..0xf5318 — OZCurve base ctor with (0.0, 4294967295.0, 1.0, v).
    OZCurve_ctor4d(curve, K_ZERO, K_UINT32_MAX_D, K_ONE, v);

    // @0xf531d..0xf5328 — overwrite the primary vptr to `__ZTV11OZCurveEnum + 0x10`.
    curve.vtable_kind = "OZCurveEnum";

    // @0xf532b..0xf535d — lazily initialise the OZCurveEnumSplineState singleton
    // (std::call_once). JS memoisation of the getInstance() call handles this implicitly.
    const rawInstance: OZSplineStatePtr = OZCurveEnumSplineState_getInstance();

    // @0xf536c / 0xf5370..0xf5373 — apply the +0x8 sub-object adjust unless the raw pointer is
    // null. C++ uses byte-offset multiple-inheritance thunks; JS cannot subdivide an object
    // pointer by 8 bytes, so identity+8-adjust is modelled by passing the raw pointer through
    // unchanged. The exact pointer arithmetic is preserved in this comment and must be
    // reinstated once OZSplineState + OZCurveEnumSplineState are transcribed.
    let stateArg: OZSplineStatePtr;
    if (rawInstance === null || rawInstance === undefined) {
      stateArg = rawInstance;
    } else {
      stateArg = rawInstance;
    }

    // @0xf537a — OZCurve::setSplineState(this, state+0x8).
    OZCurve_setSplineState(curve, stateArg);

    // @0xf537f..0xf5399 — post-init side-effects on `*(new_obj + 0xa0)` and a virtual dispatch
    // through `new_obj->vt[0x50]`. Both belong to OZCurveEnum, whose full ctor tail is not
    // decoded here. Surface as a frontier throw so the gap is loud.
    postInitializeOZCurveEnum(curve);

    // @0xf539c — return new_obj.
    return curve;
  }

  /**
   * ~OZChannelEnumDimension() — @Ozone 0x23110 (D1) and @Ozone 0x23120 (D0).
   *
   * D1 body @0x23110..0x2311a (5 instrs):
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZN13OZChannelEnumD2Ev@stub (@0x6dd9da)
   * A pure tail-call to the base destructor; there are no subobjects to destroy that aren't in
   * the base (the two vptr slots and the _factory pointer are trivial types — no dtors run).
   *
   * D0 body @0x23120..0x2313c:
   *   pushq %rbp / movq %rsp,%rbp
   *   pushq %rbx / pushq %rax
   *   movq  %rdi,%rbx                              ; save this
   *   callq __ZN13OZChannelEnumD2Ev@stub           ; base D2 (@0x6dd9da)
   *   movq  %rbx,%rdi                              ; restore this for delete
   *   addq  $0x8,%rsp / popq %rbx / popq %rbp
   *   jmp   __ZdlPv@stub                           ; operator delete (@0x6dfc36) tail-call
   *
   * TS models a manual `destroy(deleting)`: both call the base D2 stub (which throws). D0 is the
   * "delete via delete-expression" variant that also invokes `operator delete` — modeled as a
   * throw citing that stub.
   */
  destroy(): void {
    // D1 — @0x23110: pure tail-call to OZChannelEnum::~OZChannelEnum (frontier).
    OZChannelEnum_D2(this);
  }

  /** D0 — @0x23120: base D2 then operator delete (frontier). */
  destroy_deleting(): void {
    OZChannelEnum_D2(this);
    // operator delete @Ozone stub 0x6dfc36 — frontier (no TS equivalent; throw for parity).
    throw new Error(
      "operator delete(void*) @Ozone stub 0x6dfc36 not yet transcribed " +
      "(tail-called from OZChannelEnumDimension D0 @0x23137)",
    );
  }
}
