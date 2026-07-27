// OZChannelEnumRetime — a retiming enum channel (Ozone.framework). Extends OZChannelEnum
// (frontier / not yet ported). Faithful port from disassembly at:
//   re/disasm/OZChannelEnumRetime.OZChannelEnumRetime.s           (C1 5-arg thunk @Ozone 0x472f90)
//   raw-port/re/disasm entries for the C2 bodies + destructors.
//
// STRUCT LAYOUT (recovered from ctor bodies @0x472e90 / @0x472fa0):
//   +0x000  vtable[0]  primary vptr  (vtable @Ozone 0x82d540, installed slot = 0x82d550 = vtable+0x10)
//   +0x008  OZChannelEnumRetime_Factory* _instance  (RIP-relative global set by getInstance
//                                                     via std::call_once on _instanceOnce)
//   +0x010  vtable[1]  secondary vptr (vtable+0x380) — multiple-inheritance thunk table for the
//                                                     OZFactoryBase/etc. sub-object
//   +0x018 …          OZChannelEnum base subobject (opaque, frontier — see OZChannel* base ctors
//                                                    at 0x6dd9bc / 0x6dd9c8 stubs)
//
// STATIC GLOBALS (all @Ozone, RIP-relative from ctor bodies):
//   OZChannelEnumRetime_Factory::_instanceOnce  — std::once_flag (u64). Referenced @0x472eb0 (load
//                                                 for cmp -0x1), @0x472ecd (leaq for __call_once),
//                                                 @0x472f28 (second call_once), @0x472fd9/0x472ff6.
//   OZChannelEnumRetime_Factory::_instance      — OZChannelEnumRetime_Factory* (the singleton).
//                                                 Loaded @0x472eec (used as `factory` arg to base
//                                                 ctor), @0x472f5c (stored at this+0x8),
//                                                 @0x47300d (same for the u32-leading ctor).
//   OZChannelEnumRetime vtable                  — @Ozone 0x82d540. Ctor installs address+0x10 at
//                                                 this+0x00 and address+0x380 at this+0x10.
//
// The 6 exported methods (all covered here):
//   0x000000000001fa80  ~OZChannelEnumRetime()               [D1 thunk -> OZChannelEnum::D2]
//   0x000000000001fa90  ~OZChannelEnumRetime()               [D0: D2 + operator delete]
//   0x0000000000472e90  ctor(PCString&, PCString&, OZChannelFolder*, u32, u32)              [C2]
//   0x0000000000472f90  ctor(PCString&, PCString&, OZChannelFolder*, u32, u32)              [C1 -> C2]
//   0x0000000000472fa0  ctor(u32, PCString&, PCString&, OZChannelFolder*, u32, u32)         [C2]
//   0x0000000000473040  ctor(u32, PCString&, PCString&, OZChannelFolder*, u32, u32)         [C1 -> C2]
//
// FRONTIER CALLEES (each throwing stub cites its @0xADDR):
//   OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, u32, u32,
//                                 OZChannelImpl*, OZChannelInfo*)   @Ozone stub 0x6dd9bc
//   OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZChannelFolder*, u32, u32,
//                                 OZChannelImpl*, OZChannelInfo*)   @Ozone stub 0x6dd9c8
//   OZChannelEnum::~OZChannelEnum()                                 @Ozone stub 0x6dd9da
//   operator delete(void*)                                          @Ozone stub 0x6dfc36
//   OZChannelEnumRetime_Factory::getInstance()                      @Ozone (inline via call_once)
//   std::__1::__call_once(...)                                      @Ozone stub 0x6dfb2e
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

// The factory type is opaque here — its methods (createChannel/createInstance/…) live in a
// separate class (OZChannelEnumRetime_Factory). The ctor only stores a pointer to it at +0x8.
export type OZChannelEnumRetime_FactoryPtr = object | null;

// ---------------------------------------------------------------------------------------------
// Factory singleton — mirrors the RIP-relative globals accessed by the ctors. The GLOBAL SLOTS
// exist in the framework binary and are initialized on first access via std::call_once. Until
// OZChannelEnumRetime_Factory itself is ported, `getInstance()` throws citing the addresses.
//
// The ctors read _instance AFTER the call_once — so their store at (this+0x8) is `_instance`,
// which is populated by getInstance()'s lambda body (currently frontier).
// ---------------------------------------------------------------------------------------------
export class OZChannelEnumRetime_Factory {
  /** _instanceOnce — RIP-relative std::once_flag u64. Loaded @0x472eb0/0x472f28/0x472fd9/0x472ff6. */
  static _instanceOnce: bigint = 0n;
  /** _instance — the singleton pointer. Set only inside getInstance()'s call_once lambda body. */
  static _instance: OZChannelEnumRetime_FactoryPtr = null;

  /**
   * OZChannelEnumRetime_Factory::getInstance() — @Ozone (body is the lambda inlined into every
   * ctor via std::call_once; symbol reference:
   * __ZNSt3__117__call_once_proxy…INS_5tupleIJOZN27OZChannelEnumRetime_Factory11getInstanceEvEUlvE_
   * EEEEEvPv). NOT YET TRANSCRIBED — the lambda body constructs the singleton OZChannelEnumRetime_Factory
   * (which itself is a frontier class). Throwing here surfaces the gap the moment any real
   * construction is attempted.
   */
  static getInstance(): OZChannelEnumRetime_FactoryPtr {
    throw new Error("OZChannelEnumRetime_Factory::getInstance @Ozone (call_once lambda, ref " +
                    "__ZNSt3__117__call_once_proxy…OZChannelEnumRetime_Factory11getInstance…) " +
                    "not yet transcribed — sets _instanceOnce and _instance globals loaded from " +
                    "@0x472eb0 / @0x472eec / @0x472f28 / @0x472f5c / @0x472fd9 / @0x47300d");
  }
}

// ---------------------------------------------------------------------------------------------
// Frontier base — OZChannelEnum. The ctors call one of two overloads via __stub imports (both are
// __stubs entries pointing at the framework's own __ZN13OZChannelEnumC2… symbols but their
// bodies live in a different Ozone class and are not yet ported here).
// ---------------------------------------------------------------------------------------------

/**
 * OZChannelEnum::OZChannelEnum(PCString const& name, OZFactory* factory, PCString const& name2,
 *                              OZChannelFolder* folder, u32 u1, u32 u2, OZChannelImpl* impl,
 *                              OZChannelInfo* info) — @Ozone stub 0x6dd9bc.
 * NOT YET TRANSCRIBED. Called from OZChannelEnumRetime C2(5-arg) @0x472f0b with
 *   name    = arg1 (rsi)  from ctor
 *   factory = _instance   (loaded @0x472eec into rdx)
 *   name2   = arg2 (rdx)  from ctor (spilled r13)
 *   folder  = arg3 (rcx)  from ctor (spilled r12)
 *   u1      = arg4 (r8d)  from ctor (spilled r15d)   -- passed as r9d
 *   u2      = arg5 (r9d)  from ctor (spilled r14d)   -- passed on stack@0(%rsp)
 *   impl    = nullptr     (movups xmm0,0x8(%rsp) zeros 0x8-0x18 of stack)
 *   info    = nullptr     (same)
 */
function OZChannelEnum_C2_from_PCString(
  _self: OZChannelEnumRetime,
  _name: PCStringRef,
  _factory: OZChannelEnumRetime_FactoryPtr,
  _name2: PCStringRef,
  _folder: OZChannelFolderPtr,
  _u1: number,
  _u2: number,
  _impl: OZChannelImplPtr,
  _info: OZChannelInfoPtr,
): void {
  throw new Error("OZChannelEnum::OZChannelEnum(PCString&, OZFactory*, PCString&, OZChannelFolder*, " +
                  "u32, u32, OZChannelImpl*, OZChannelInfo*) @Ozone stub 0x6dd9bc not yet " +
                  "transcribed (called from OZChannelEnumRetime C2 @0x472f0b)");
}

/**
 * OZChannelEnum::OZChannelEnum(u32 id, PCString const& name, PCString const& name2,
 *                              OZChannelFolder* folder, u32 u1, u32 u2, OZChannelImpl* impl,
 *                              OZChannelInfo* info) — @Ozone stub 0x6dd9c8.
 * NOT YET TRANSCRIBED. Called from OZChannelEnumRetime C2(6-arg with leading u32) @0x472fbc.
 * Args (per ctor disasm):
 *   this   = rdi (self)
 *   id     = rsi (u32 first arg — actually promoted, but the base takes u32)
 *   name   = rdx
 *   name2  = rcx
 *   folder = r8
 *   u1     = r9d
 *   u2     = mov eax,0x10(rbp) then mov [rsp],eax   (passed via stack@0)
 *   impl   = nullptr  (xmm0=0; movups 0x8(rsp))
 *   info   = nullptr  (same)
 */
function OZChannelEnum_C2_from_u32(
  _self: OZChannelEnumRetime,
  _id: number,
  _name: PCStringRef,
  _name2: PCStringRef,
  _folder: OZChannelFolderPtr,
  _u1: number,
  _u2: number,
  _impl: OZChannelImplPtr,
  _info: OZChannelInfoPtr,
): void {
  throw new Error("OZChannelEnum::OZChannelEnum(u32, PCString&, PCString&, OZChannelFolder*, u32, u32, " +
                  "OZChannelImpl*, OZChannelInfo*) @Ozone stub 0x6dd9c8 not yet transcribed " +
                  "(called from OZChannelEnumRetime C2 @0x472fbc)");
}

/**
 * OZChannelEnum::~OZChannelEnum() — @Ozone stub 0x6dd9da. NOT YET TRANSCRIBED.
 * Called from:
 *   OZChannelEnumRetime D1 (@0x1fa80): 4-instr thunk `pushq rbp / movq rsp,rbp / popq rbp / jmp`
 *     — direct tail-jump to this base D2.
 *   OZChannelEnumRetime D0 (@0x1fa99): call base D2, then jmp operator delete (@0x6dfc36).
 *   Unwind landing pads @0x472f7c and @0x473027 (partial-construction cleanup).
 */
function OZChannelEnum_D2(_self: OZChannelEnumRetime): void {
  throw new Error("OZChannelEnum::~OZChannelEnum @Ozone stub 0x6dd9da not yet transcribed " +
                  "(called from OZChannelEnumRetime D0 @0x1fa99, D1 @0x1fa85, and unwind " +
                  "pads @0x472f7c / @0x473027)");
}

// ---------------------------------------------------------------------------------------------
// OZChannelEnumRetime — see doc comment at top of file for full struct layout + provenance.
// ---------------------------------------------------------------------------------------------
export class OZChannelEnumRetime {
  /** vtable[0] slot — installed as vtable+0x10 at (this+0x00) by every ctor
   *  (@0x472f10 lea vtable_addr, add 0x10, movq to (rbx); @0x472fc1 for the u32 variant). */
  readonly __vptr0: unknown = null;
  /** OZChannelEnumRetime_Factory* at (this+0x08) — set to `_instance` AFTER the base ctor and
   *  a second call_once (@0x472f5c / @0x473014). Semantically the concrete-class factory pointer
   *  the ctor "self-registers" onto the instance. */
  _factory: OZChannelEnumRetime_FactoryPtr = null;
  /** vtable[1] slot — installed as vtable+0x380 at (this+0x10) by every ctor
   *  (@0x472f1e/@0x472f24 for the 5-arg C2; @0x472fcf/@0x472fd5 for the u32-leading C2).
   *  This is the multiple-inheritance secondary sub-object vptr. */
  readonly __vptr1: unknown = null;

  /**
   * OZChannelEnumRetime(PCString const& name, PCString const& name2, OZChannelFolder* folder,
   *                     u32 u1, u32 u2) — C2 body @Ozone 0x472e90.
   *
   * Disasm control flow (verbatim, line-for-line):
   *   @0x472eb0  load _instanceOnce; if != -1 -> jump past call_once (@0x472ebd..0x472ee8)
   *   @0x472ebd..0x472ee3  set up std::__call_once frame:
   *                          -0x29(%rbp) = local flag byte
   *                          -0x40(%rbp) = &flag_byte
   *                          -0x38(%rbp) = &-0x40      (the "arg" tuple pointer)
   *                          rdi = &_instanceOnce
   *                          rdx = __call_once_proxy<...OZChannelEnumRetime_Factory::getInstance…>
   *                          rsi = &-0x38
   *                          callq __ZNSt3__111__call_onceERVmPvPFvS2_E    (@stub 0x6dfb2e)
   *   @0x472eec  rdx = _instance   ; factory pointer (used as OZFactory* arg to base ctor)
   *   @0x472ef3..0x472efb  zero xmm0; movups xmm0, 8(%rsp); mov r14d, (%rsp)
   *                        ; stack layout for base ctor call:
   *                        ;   [rsp+0x00] = u2 (r14d)
   *                        ;   [rsp+0x08] = 0   (OZChannelImpl* = nullptr)
   *                        ;   [rsp+0x10] = 0   (OZChannelInfo* = nullptr)
   *   @0x472eff..0x472f0b  set up regs:
   *                          rdi = this (rbx)
   *                          rsi = name  (unchanged, spilled -0x48(%rbp))
   *                          rdx = factory (_instance)
   *                          rcx = name2 (r13)
   *                          r8  = folder (r12)
   *                          r9d = u1 (r15d)
   *                          callq OZChannelEnum::C2(name, factory, name2, folder, u1, u2, nullptr, nullptr)
   *                                (stub @0x6dd9bc)
   *   @0x472f10  rax = &vtable_OZChannelEnumRetime            (RIP-relative)
   *   @0x472f17  rcx = rax + 0x10                             (installed pointer = vtable+0x10)
   *   @0x472f1b  *(this + 0x00) = rcx                         (primary vptr)
   *   @0x472f1e  rax += 0x380                                 (secondary sub-object slot)
   *   @0x472f24  *(this + 0x10) = rax                         (secondary vptr)
   *   @0x472f28..0x472f5c  second call_once on _instanceOnce with the SAME lambda:
   *                        (this is what the compiler emitted — the check is redundant after the
   *                         first call, but it is present in the binary; we transcribe it literally.)
   *   @0x472f5c  rax = _instance
   *   @0x472f63  *(this + 0x08) = rax
   *   @0x472f67..0x472f75  epilogue: pop frame + retq.
   */
  private ctor_5arg(
    name: PCStringRef, name2: PCStringRef, folder: OZChannelFolderPtr, u1: number, u2: number,
  ): void {
    // u1 / u2 are unsigned 32-bit — the ABI passes them in 32-bit regs (r15d, r14d) and stores u2
    // as a 4-byte slot on the stack. Preserve that width contract.
    const U1 = u1 >>> 0;   // uint32
    const U2 = u2 >>> 0;   // uint32

    // ---- 1) std::call_once(_instanceOnce, getInstance lambda) — @0x472eb0..0x472ee8 ----------
    // If _instanceOnce == -1 (i.e. already ran), skip. Otherwise run the lambda through the proxy.
    // The lambda body (frontier) constructs the singleton and writes _instance.
    if (OZChannelEnumRetime_Factory._instanceOnce !== -1n) {
      // __call_once<lambda>: on first call, invokes getInstance()'s lambda which sets _instance
      // and flips _instanceOnce to -1. Frontier — throws citing addresses.
      OZChannelEnumRetime_Factory.getInstance();
    }

    // ---- 2) OZChannelEnum::C2(this, name, _instance, name2, folder, u1, u2, nullptr, nullptr) --
    //         @0x472f0b — the base ctor with factory=_instance. Frontier stub — throws citing addr.
    const factory = OZChannelEnumRetime_Factory._instance;
    OZChannelEnum_C2_from_PCString(this, name, factory, name2, folder, U1, U2, null, null);

    // ---- 3) Install vptrs @0x472f10..0x472f24 -----------------------------------------------
    // Primary vptr = vtable+0x10 (address 0x82d550 for vtable 0x82d540).
    // Secondary vptr = vtable+0x380 (multiple-inheritance secondary sub-object table).
    // The ACTUAL vtable slots dispatch to OZChannelEnumRetime::* thunks; we cannot install
    // "function pointers" in TS, but structurally these two writes model the class-identity
    // fingerprint. See file-top layout doc comment.
    // (In TS: `readonly __vptr0`/`__vptr1` are the shape; there is nothing to write here.)

    // ---- 4) Redundant second call_once — @0x472f28..0x472f5c ---------------------------------
    // Present in the binary exactly as emitted. Repeating literally to match control flow.
    if (OZChannelEnumRetime_Factory._instanceOnce !== -1n) {
      OZChannelEnumRetime_Factory.getInstance();
    }

    // ---- 5) Store _instance at (this+0x08) — @0x472f5c/@0x472f63 -----------------------------
    this._factory = OZChannelEnumRetime_Factory._instance;
  }

  /**
   * OZChannelEnumRetime(u32 id, PCString const& name, PCString const& name2,
   *                     OZChannelFolder* folder, u32 u1, u32 u2) — C2 body @Ozone 0x472fa0.
   *
   * Disasm control flow (verbatim):
   *   @0x472fae  eax = *(u32*)(rbp+0x10)          ; u2 arrived on stack (6th u32 arg)
   *   @0x472fb1..0x472fb9  zero xmm0; movups 8(%rsp); mov [rsp], eax
   *                        ; stack for base ctor: [rsp+0]=u2, [rsp+8]=0 (impl), [rsp+0x10]=0 (info)
   *   @0x472fbc  callq OZChannelEnum::C2(this, id, name, name2, folder, u1, u2, nullptr, nullptr)
   *              (stub @0x6dd9c8). NOTE: rdi=this / rsi=id / rdx=name / rcx=name2 / r8=folder /
   *              r9d=u1 are already in place from THIS ctor's own ABI regs (no re-shuffling).
   *   @0x472fc1..0x472fd5  install vptrs (identical to the 5-arg variant): primary=vtable+0x10 at
   *              this+0x00; secondary=vtable+0x380 at this+0x10.
   *   @0x472fd9..0x47300d  std::call_once(_instanceOnce, getInstance lambda). ONE call in this
   *              overload (not two — @0x472fd9 vs @0x472eb0+@0x472f28 in the other variant).
   *              Frame slots: -0x11(%rbp)=flag_byte, -0x28(%rbp)=&flag_byte, -0x20(%rbp)=&-0x28.
   *   @0x47300d..0x473014  *(this+0x08) = _instance.
   *   @0x473018..0x473020  epilogue + retq.
   *
   * Notable difference vs the 5-arg C2: the base ctor overload used here takes `u32 id` as its
   * FIRST arg and DOES NOT receive a factory pointer (compare @0x6dd9c8 signature to @0x6dd9bc).
   * The single call_once (vs the 5-arg's two) is exactly what the compiler emitted.
   */
  private ctor_6arg(
    id: number, name: PCStringRef, name2: PCStringRef, folder: OZChannelFolderPtr,
    u1: number, u2: number,
  ): void {
    const ID = id >>> 0;   // uint32
    const U1 = u1 >>> 0;   // uint32
    const U2 = u2 >>> 0;   // uint32

    // ---- 1) OZChannelEnum::C2(this, id, name, name2, folder, u1, u2, nullptr, nullptr) -------
    //         @0x472fbc — the u32-leading base ctor overload (@Ozone stub 0x6dd9c8). Frontier.
    OZChannelEnum_C2_from_u32(this, ID, name, name2, folder, U1, U2, null, null);

    // ---- 2) Install vptrs — identical to the 5-arg C2 (@0x472fc1..0x472fd5) -----------------
    // primary = vtable+0x10; secondary = vtable+0x380. (Modeled as class-identity; see layout.)

    // ---- 3) std::call_once on _instanceOnce — @0x472fd9..0x47300d --------------------------
    if (OZChannelEnumRetime_Factory._instanceOnce !== -1n) {
      OZChannelEnumRetime_Factory.getInstance();
    }

    // ---- 4) Store _instance at (this+0x08) — @0x47300d/@0x473014 ---------------------------
    this._factory = OZChannelEnumRetime_Factory._instance;
  }

  /**
   * OZChannelEnumRetime::OZChannelEnumRetime(...) — dispatcher for the two ctor shapes.
   *
   * C1-thunk provenance:
   *   @Ozone 0x472f90  (C1: 5-arg PCString&,PCString&,OZChannelFolder*,u32,u32) -> jmp C2 @0x472e90
   *   @Ozone 0x473040  (C1: u32,PCString&,PCString&,OZChannelFolder*,u32,u32)   -> jmp C2 @0x472fa0
   * Both C1 thunks are `pushq rbp / movq rsp,rbp / popq rbp / jmp C2` — a plain tail-call to the
   * complete C2 body. We honor that by routing both call shapes through the C2 bodies below.
   */
  constructor(
    a: PCStringRef | number, b: PCStringRef, c: PCStringRef | OZChannelFolderPtr,
    d: OZChannelFolderPtr | number, e: number, f?: number,
  ) {
    if (typeof a === "number") {
      // (u32, PCString&, PCString&, OZChannelFolder*, u32, u32) — C1 @0x473040 -> C2 @0x472fa0.
      // f is required in this shape; the underlying C2 reads it via mov eax, 0x10(%rbp).
      if (f === undefined) {
        throw new Error("OZChannelEnumRetime(u32,PCString&,PCString&,OZChannelFolder*,u32,u32) " +
                        "@Ozone 0x472fa0 requires 6 args (u2 arrives on stack @rbp+0x10 in ABI)");
      }
      this.ctor_6arg(a, b, c as PCStringRef, d as OZChannelFolderPtr, e, f);
    } else {
      // (PCString&, PCString&, OZChannelFolder*, u32, u32) — C1 @0x472f90 -> C2 @0x472e90.
      // f MUST be absent in this shape (5 args).
      if (f !== undefined) {
        throw new Error("OZChannelEnumRetime(PCString&,PCString&,OZChannelFolder*,u32,u32) " +
                        "@Ozone 0x472e90 takes exactly 5 args; got 6");
      }
      this.ctor_5arg(a, b as PCStringRef, c as OZChannelFolderPtr, d as number, e);
    }
  }

  /**
   * ~OZChannelEnumRetime() — @Ozone 0x1fa80 (D1) and @Ozone 0x1fa90 (D0).
   *
   * D1 body @0x1fa80..0x1fa8a (5 instrs):
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZN13OZChannelEnumD2Ev@stub (@0x6dd9da)
   * A pure tail-call to the base destructor; there are no subobjects to destroy that aren't in
   * the base (the two vptr slots and the _factory pointer are trivial types — no dtors run).
   *
   * D0 body @0x1fa90..0x1faac:
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
    // D1 — @0x1fa80: pure tail-call to OZChannelEnum::~OZChannelEnum (frontier).
    OZChannelEnum_D2(this);
  }

  /** D0 — @0x1fa90: base D2 then operator delete (frontier). */
  destroy_deleting(): void {
    OZChannelEnum_D2(this);
    // operator delete @Ozone stub 0x6dfc36 — frontier (no TS equivalent; throw for parity).
    throw new Error("operator delete(void*) @Ozone stub 0x6dfc36 not yet transcribed " +
                    "(tail-called from OZChannelEnumRetime D0 @0x1faa7)");
  }
}
