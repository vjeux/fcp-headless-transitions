// OZProcessControlWrapper.ts — Ozone concrete OZProcessControl subclass that
// wraps an OWNED-BY-CALLER OZProcessControl* at +0x38 and null-safe-forwards
// `isAborted()` to it. Faithful transcription of the eight exported symbols
// in Ozone.framework (7 unique + 1 typeinfo — the ledger keys we own are
// C1/C2 ctors, D0/D1/D2 dtors, isAborted, setControl):
//
//   @0x00000000004daff0  OZProcessControlWrapper::OZProcessControlWrapper()  [C2]
//                        __ZN23OZProcessControlWrapperC2Ev
//   @0x00000000004db020  OZProcessControlWrapper::OZProcessControlWrapper()  [C1 — byte-identical
//                                                                             to C2 except addr]
//                        __ZN23OZProcessControlWrapperC1Ev
//   @0x00000000004db050  OZProcessControlWrapper::~OZProcessControlWrapper()  [D2]
//                        __ZN23OZProcessControlWrapperD2Ev
//   @0x00000000004db060  OZProcessControlWrapper::~OZProcessControlWrapper()  [D1 — byte-identical
//                                                                              to D2 except addr]
//                        __ZN23OZProcessControlWrapperD1Ev
//   @0x00000000004db070  OZProcessControlWrapper::~OZProcessControlWrapper()  [D0 — deleting]
//                        __ZN23OZProcessControlWrapperD0Ev
//   @0x00000000004db090  OZProcessControlWrapper::isAborted() const
//                        __ZNK23OZProcessControlWrapper9isAbortedEv
//   @0x00000000004db0b0  OZProcessControlWrapper::setControl(OZProcessControl const*)
//                        __ZN23OZProcessControlWrapper10setControlEPK16OZProcessControl
//
// Source disassembly (all extracted verbatim to raw-port/re/disasm/):
//   OZProcessControlWrapper.OZProcessControlWrapper.s    (C1 body @0x4db020, C2 body @0x4daff0)
//   OZProcessControlWrapper.~OZProcessControlWrapper.s   (D0 body @0x4db070)
//   OZProcessControlWrapper.isAborted.s                  (@0x4db090)
//   OZProcessControlWrapper.setControl.s                 (@0x4db0b0)
//   D1/D2 bodies extracted directly from /tmp/Ozone_tV.txt @0x4db050/@0x4db060 (three-instruction
//   thin wrappers that tail-jmp to OZProcessControl::~OZProcessControl() — see per-method comments).
//
// VTABLE (`resolve.py Ozone vtable OZProcessControlWrapper`):
//   __ZTV23OZProcessControlWrapper @0x877070; primary installed-ptr = 0x877080 (= vtable+0x10)
//   *0x00 -> 0x4db060  OZProcessControlWrapper::~OZProcessControlWrapper()   [D1]
//   *0x08 -> 0x4db070  OZProcessControlWrapper::~OZProcessControlWrapper()   [D0]
//   *0x10 -> 0x4db090  OZProcessControlWrapper::isAborted() const
//   (subsequent slots — 0x877130/0x877148 — belong to OZHGMotionEstimateJob and
//    OZOpticalFlow::Private::AnalyzerImpl, which multiply-inherit through this wrapper's
//    vtable region; not part of OZProcessControlWrapper itself.)
// C1/C2 both install (this+0x00) = 0x877080 = vtable+0x10  (LEA target proof:
//   C2 @0x4daffe: `leaq 0x39c07b(%rip),%rax` -> rip_after=0x4db005 -> 0x4db005+0x39c07b = 0x877080.
//   C1 @0x4db02e: `leaq 0x39c04b(%rip),%rax` -> rip_after=0x4db035 -> 0x4db035+0x39c04b = 0x877080.)
//
// STRUCT LAYOUT (end-to-end pinned; the class exposes exactly two fields):
//   +0x00  vptr    OZProcessControlWrapper vptr, points to vtable+0x10 = 0x877080.
//                  Written by C1/C2 immediately after delegating to the base ctor (@0x4daffe/
//                  @0x4db02e leaq, @0x4db005/@0x4db035 movq %rax,(%rbx)).
//   +0x08..+0x37  <inherited OZProcessControl subobject bytes>  — untouched by any body in this
//                 class; OZProcessControl::OZProcessControl() (@Ozone stub base ctor called at
//                 @0x4daff9/@0x4db029) is responsible for whatever it stores there.
//   +0x38  OZProcessControl const*  delegate pointer (nullable). Initialized to null by
//                                   C1/C2 (@0x4db008/@0x4db038: `movq $0x0, 0x38(%rbx)`).
//                                   Read by isAborted @0x4db094 and written by setControl
//                                   @0x4db0b4. The wrapper does NOT own this pointer — no
//                                   dtor path frees or reference-counts it; setControl is a
//                                   plain 8-byte store with no old-value teardown.
//
// Bases (not yet landed in the port tree — modelled as opaque interfaces here with named stubs):
//   OZProcessControl  raw-port/army/ledger/Ozone.ledger.json still lists this base as todo;
//                     its own vtable (@Ozone 0x841500 = 0x8414f0+0x10) has slot +0x10 =
//                     OZProcessControl::isAborted() const @0x1b0be0. isAborted() below dispatches
//                     through the DELEGATE's vptr+0x10 — the type/vslot layout MUST match
//                     OZProcessControl for that call to reach OZProcessControl::isAborted.
//
// Frontier / imports referenced (all cited by @addr — every undecoded callee is a throwing stub):
//   @0x4daff9 / @0x4db029  callq __ZN16OZProcessControlC2Ev            OZProcessControl::OZProcessControl() [C2]
//   @0x4db055 / @0x4db065  jmp   __ZN16OZProcessControlD2Ev            OZProcessControl::~OZProcessControl() [D2, tail-jmp]
//   @0x4db079              callq __ZN16OZProcessControlD2Ev            OZProcessControl::~OZProcessControl() [D2, from D0]
//   @0x4db087              jmp   0x6dfc36 = __ZdlPv                    operator delete(void*)  (tail-jmp from D0)
//   @0x4db0a1              jmpq  *0x10(%rax)                           vtable dispatch to
//                                                                       OZProcessControl::isAborted() const on the delegate.

// ── Frontier stubs — every undecoded callee cites its address. ──────────────────────────────────

/** `__ZN16OZProcessControlC2Ev` — OZProcessControl::OZProcessControl() [C2 base ctor],
 *  @Ozone (address inside Ozone; near-stub called by our ctors @0x4daff9/@0x4db029).
 *  Not yet transcribed. */
function OZProcessControl_C2_stub(_this: OZProcessControlWrapper): void {
  throw new Error(
    "OZProcessControl::OZProcessControl() [C2] @Ozone (base ctor for OZProcessControlWrapper) " +
      "not yet transcribed"
  );
}

/** `__ZN16OZProcessControlD2Ev` — OZProcessControl::~OZProcessControl() [D2 base dtor].
 *  Tail-jumped from D1 @0x4db065 and D2 @0x4db055; call-then-return from D0 @0x4db079.
 *  Not yet transcribed. */
function OZProcessControl_D2_stub(_this: OZProcessControlWrapper): void {
  throw new Error(
    "OZProcessControl::~OZProcessControl() [D2] @Ozone (base dtor for OZProcessControlWrapper) " +
      "not yet transcribed"
  );
}

/** `__ZdlPv` — operator delete(void*), @Ozone 0x6dfc36 (stub target).
 *  Tail-jmped from OZProcessControlWrapper::~OZProcessControlWrapper() [D0] @0x4db087. */
function operator_delete_stub(_p: unknown): void {
  throw new Error("operator delete(void*) @Ozone 0x6dfc36 not yet transcribed");
}

/** Model of the vtable dispatch at @0x4db0a1: `jmpq *0x10(%rax)` where rax = (delegate)+0x00.
 *  The C++ semantics: invoke `OZProcessControl::isAborted() const` (or whatever subclass override
 *  is in slot +0x10 of the delegate's vtable). Since OZProcessControl is not yet ported, the
 *  faithful mirror routes through the delegate's own `.isAborted()` method — same behavior as
 *  vtable dispatch on the x86 side. */
export interface OZProcessControl {
  /** Vslot +0x10 on OZProcessControl's vtable
   *  (@Ozone 0x841500 -> *0x10 = 0x1b0be0 OZProcessControl::isAborted() const).
   *  Concrete subclasses override this. */
  isAborted(): boolean;
}

// ── The class ────────────────────────────────────────────────────────────────────────────────

/**
 * `OZProcessControlWrapper` — Ozone concrete OZProcessControl subclass that owns a nullable
 * delegate `OZProcessControl const*` at +0x38 and forwards `isAborted()` to it (returning `false`
 * when the delegate is null). No other virtual slot on OZProcessControlWrapper is overridden
 * beyond isAborted @vslot +0x10; the two dtor slots (+0x00/+0x08) are the standard D1/D0 pair.
 *
 * Practically speaking the class is a thin "detachable-controller" indirection: some Ozone
 * subsystem publishes an OZProcessControl channel (something with an is-cancelled predicate),
 * and this wrapper lets a client hold onto that channel through a stable this-pointer, with the
 * option to `setControl(nullptr)` to detach at any time without a live-vptr dangling. This is
 * why isAborted is null-safe (@0x4db09b `je 0x4db0a4` -> return 0) and setControl is a bare
 * pointer store with no lifetime work.
 */
export class OZProcessControlWrapper implements OZProcessControl {
  /** +0x00 primary vptr — points to OZProcessControlWrapper vtable+0x10 = 0x877080. Written by
   *  C1 @0x4db02e/@0x4db035 (and identically by C2 @0x4daffe/@0x4db005). */
  vptr_at_0x00: string = "__ZTV23OZProcessControlWrapper+0x10";
  /** +0x38 delegate pointer (nullable). Init'd to null by both ctors (@0x4db008/@0x4db038:
   *  `movq $0x0, 0x38(%rbx)`); written by setControl (@0x4db0b4: `movq %rsi, 0x38(%rdi)`);
   *  read by isAborted (@0x4db094: `movq 0x38(%rdi), %rdi`).
   *
   *  The C++ signature `setControl(OZProcessControl const*)` marks the pointee as const, and
   *  neither dtor path frees this — so the wrapper does NOT own the delegate. */
  control_at_0x38: OZProcessControl | null = null;

  /**
   * `OZProcessControlWrapper::OZProcessControlWrapper()` [C1/C2 — same body at different addrs]
   * C2 @Ozone 0x4daff0, C1 @Ozone 0x4db020.
   *
   * Body (C1 @0x4db020 — C2 is byte-identical modulo the leaq displacement):
   *   0x4db020  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x4db026  movq  %rdi, %rbx                        ; rbx = this
   *   0x4db029  callq __ZN16OZProcessControlC2Ev        ; base ctor (undecoded)
   *   0x4db02e  leaq  0x39c04b(%rip), %rax              ; rax = 0x4db035 + 0x39c04b = 0x877080
   *                                                     ; = vtable+0x10  (installed-ptr).
   *   0x4db035  movq  %rax, (%rbx)                      ; (this+0x00) = vptr
   *   0x4db038  movq  $0x0, 0x38(%rbx)                  ; (this+0x38) = null delegate
   *   0x4db040  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
   */
  static construct(dst: OZProcessControlWrapper): void {
    // @0x4db029 — base ctor delegate (undecoded).
    OZProcessControl_C2_stub(dst);
    // @0x4db02e..@0x4db035 — install primary vptr @+0x00.
    dst.vptr_at_0x00 = "__ZTV23OZProcessControlWrapper+0x10";
    // @0x4db038 — initialize delegate to null.
    dst.control_at_0x38 = null;
  }

  /**
   * `OZProcessControlWrapper::~OZProcessControlWrapper()` [D1 — complete-object]  @Ozone 0x4db060.
   *
   * Body (three instructions + tail-jmp — extracted from /tmp/Ozone_tV.txt):
   *   0x4db060  pushq %rbp
   *   0x4db061  movq  %rsp, %rbp
   *   0x4db064  popq  %rbp
   *   0x4db065  jmp   __ZN16OZProcessControlD2Ev        ; tail-jmp to base D2
   *   0x4db06a  nopw  (%rax,%rax)                        ; alignment padding
   *
   * No wrapper-owned fields need teardown (the +0x38 delegate is not owned). The whole body is
   * just a tail-jmp to the base's D2 — the wrapper's own D1 is effectively empty. */
  destructor_D1(): void {
    // @0x4db065 — tail-jmp to OZProcessControl::~OZProcessControl() [D2].
    OZProcessControl_D2_stub(this);
  }

  /**
   * `OZProcessControlWrapper::~OZProcessControlWrapper()` [D2 — base-only]  @Ozone 0x4db050.
   *
   * Body is BYTE-FOR-BYTE identical to D1 above (same 3-instruction + tail-jmp shape):
   *   0x4db050  pushq %rbp
   *   0x4db051  movq  %rsp, %rbp
   *   0x4db054  popq  %rbp
   *   0x4db055  jmp   __ZN16OZProcessControlD2Ev        ; tail-jmp to base D2
   *   0x4db05a  nopw  (%rax,%rax)                        ; alignment padding
   *
   * The Itanium C++ ABI emits D1 (complete-object) and D2 (base-object) with the same body when
   * the derived class has no owned members that need destruction — the two entry points exist
   * only because the ABI defines them separately (they may be dispatched through different
   * vtable-slot positions). */
  destructor_D2(): void {
    // @0x4db055 — tail-jmp to OZProcessControl::~OZProcessControl() [D2].
    OZProcessControl_D2_stub(this);
  }

  /**
   * `OZProcessControlWrapper::~OZProcessControlWrapper()` [D0 — deleting]  @Ozone 0x4db070.
   *
   * Body:
   *   0x4db070  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *   0x4db076  movq  %rdi, %rbx                        ; rbx = this
   *   0x4db079  callq __ZN16OZProcessControlD2Ev        ; run base D2 (D1's own body reduces to
   *                                                       just this call, so D0 inlines it)
   *   0x4db07e  movq  %rbx, %rdi                        ; rdi = this  (arg for operator delete)
   *   0x4db081  addq  $0x8, %rsp / popq %rbx / popq %rbp
   *   0x4db087  jmp   0x6dfc36                          ; tail-jmp __ZdlPv (operator delete this)
   *   0x4db08c  nopl  (%rax)                             ; alignment padding
   */
  destructor_D0(): void {
    // @0x4db079 — run the base dtor.
    OZProcessControl_D2_stub(this);
    // @0x4db087 — tail-jmp operator delete(this).
    operator_delete_stub(this);
  }

  /**
   * `OZProcessControlWrapper::isAborted() const`  @Ozone 0x4db090.
   *
   * Null-safe forward: if delegate is null return false, else vtable-dispatch to the delegate's
   * slot +0x10 (which on the base OZProcessControl vtable @0x841500 resolves to
   * OZProcessControl::isAborted() const @Ozone 0x1b0be0; a subclass override lives at its own
   * vtable's +0x10).
   *
   * Body:
   *   0x4db090  pushq %rbp / movq %rsp,%rbp
   *   0x4db094  movq  0x38(%rdi), %rdi                  ; rdi = this[+0x38] = delegate
   *   0x4db098  testq %rdi, %rdi
   *   0x4db09b  je    0x4db0a4                          ; if delegate == null -> return 0
   *   0x4db09d  movq  (%rdi), %rax                      ; rax = delegate->vptr
   *   0x4db0a0  popq  %rbp
   *   0x4db0a1  jmpq  *0x10(%rax)                       ; tail-jmp delegate->vtable[+0x10]
   *                                                     ; = OZProcessControl::isAborted (or subclass override)
   *   0x4db0a4  xorl  %eax, %eax                        ; rax = 0
   *   0x4db0a6  popq  %rbp / retq                        ; return 0
   */
  isAborted(): boolean {
    // @0x4db094..@0x4db09b — nullable-delegate short-circuit.
    const delegate = this.control_at_0x38;
    if (delegate === null) {
      // @0x4db0a4..@0x4db0a7 — return false (`xorl %eax,%eax`).
      return false;
    }
    // @0x4db09d..@0x4db0a1 — vtable dispatch through delegate.vptr[+0x10].
    return delegate.isAborted();
  }

  /**
   * `OZProcessControlWrapper::setControl(OZProcessControl const*)`  @Ozone 0x4db0b0.
   *
   * Body (four instructions — pure pointer store):
   *   0x4db0b0  pushq %rbp / movq %rsp,%rbp
   *   0x4db0b4  movq  %rsi, 0x38(%rdi)                  ; (this+0x38) = arg
   *   0x4db0b8  popq  %rbp / retq
   *   0x4db0ba  <padding>                                ; non-executable filler
   *
   * The wrapper does NOT own the pointer — no dtor frees it, no reference count is bumped,
   * setControl is a plain 8-byte store with no old-value teardown. Faithful mirror is a plain
   * field write.
   */
  setControl(control: OZProcessControl | null): void {
    // @0x4db0b4 — plain pointer store at +0x38.
    this.control_at_0x38 = control;
  }
}
