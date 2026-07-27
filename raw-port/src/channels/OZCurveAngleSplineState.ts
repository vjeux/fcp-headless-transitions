// OZCurveAngleSplineState — angle-typed spline-state singleton companion.  ProChannel.framework.
//
// One member of a small SplineState singleton family used by OZCurve (and its subclasses) —
// setSplineState(OZSplineState*) is called with the instance returned by
// OZCurve<T>SplineState::getInstance() where <T> is Angle / Double / Int / Bool / Enum / Percent.
// See raw-port/src/channels/OZCurveRuntime.ts for the call-in site (OZCurve::setSplineState
// @ProChannel 0x1ea66) that reads +0x2c on the pointer to decide whether to share or copy.
//
// Symbols exposed by nm on ProChannel (x86_64):
//   __ZN23OZCurveAngleSplineState11getInstanceEv  @0x84d2c  OZCurveAngleSplineState::getInstance()
//   __ZN23OZCurveAngleSplineStateD1Ev             @0x4e06   OZCurveAngleSplineState::~OZCurveAngleSplineState() (base)
//   __ZN23OZCurveAngleSplineStateD0Ev             @0x84e14  OZCurveAngleSplineState::~OZCurveAngleSplineState() (deleting)
//   __ZN23OZCurveAngleSplineState9_instanceE       @0xec388  static instance pointer
//   __ZN23OZCurveAngleSplineState13_instanceOnceE  @0xec390  std::once_flag (uint64)
//   __ZTV23OZCurveAngleSplineState                 @0xcc3c0  vtable (installed ptr = +0x10 @ 0xcc3d0)
//   __ZTI23OZCurveAngleSplineState                 @0xcc3e0  typeinfo
//
// The lambda body of getInstance() — actually the `std::__invoke` specialisation @0x84db8 that
// __call_once_proxy @0x84da8 forwards to — is the ONLY place the singleton is constructed. Its
// disassembly (@0x84db8..0x84dfe) recovers the following object layout:
//
//   size = 0x38 bytes  (movl $0x38, %edi ; callq __Znwm  @0x84dbf/0x84dc4)
//   +0x00  vtable ptr — stored last as (__ZTV23OZCurveAngleSplineState + 0x10)   @0x84de2..0x84ded
//                       (this is the "installed-vtable" convention: skip 16-byte RTTI/offset header)
//   +0x08  OZSplineState state — constructed in-place via __ZN13OZSplineStateC2Ev  @0x84dcc/0x84dd0
//                                (default OZSplineState() ctor, undecoded — see stub below)
//   [PCSingleton base occupies the same object; PCSingleton::PCSingleton(uint) is called on `this`
//    with esi=0xc8 (=200) @0x84dd5/0x84ddd — undecoded, see stub. 0xc8 is the "singleton category"
//    tag PCSingleton uses to register/deregister the instance in its global vector.]
//
//   Exception path @0x84dff..0x84e0d: if OZSplineState/PCSingleton ctor throws, `operator delete`
//   the raw 0x38-byte allocation and `__Unwind_Resume`. In TS we surface undecoded-callee throws.
//
// D1 (base dtor)  @0x4e06 disassembly (extracted from ProChannel.framework at raw VA 0x4e06):
//   0x4e06 pushq %rbp ; 0x4e07 movq %rsp,%rbp ; 0x4e0a popq %rbp
//   0x4e0b jmp   0xacb4c    ## symbol stub for: __ZN11PCSingletonD2Ev
//   Tail-calls PCSingleton::~PCSingleton().  OZCurveAngleSplineState-specific cleanup: NONE.
//   (The embedded OZSplineState at +0x8 is NOT explicitly destroyed here — its destructor is
//    trivial in disasm, or PCSingletonD2Ev is expected to invoke it via the vtable. Undecoded.)
//
// D0 (deleting dtor)  @0x84e14 disassembly:
//   0x84e14 pushq %rbp ; 0x84e15 movq %rsp,%rbp ; 0x84e18 pushq %rbx ; 0x84e19 pushq %rax
//   0x84e1a movq %rdi, %rbx                           — save `this`
//   0x84e1d callq 0xacb4c    ## symbol stub for: __ZN11PCSingletonD2Ev
//   0x84e22 movq %rbx, %rdi
//   0x84e25 addq $0x8, %rsp ; popq %rbx ; popq %rbp
//   0x84e2b jmp   0xace04    ## symbol stub for: __ZdlPv   — operator delete(this)
//   Same story: PCSingleton dtor then delete. No OZSplineState-specific cleanup call is emitted.

/** OZSplineState — opaque here. Fully-decoded layout lives elsewhere (see OZCurveRuntime.ts
 *  which uses the raw pointer via setSplineState). This class embeds one at object+0x8. */
export interface OZSplineState {
  /** (+0x2c) — read by OZCurve::setSplineState to gate share-vs-copy. See OZCurveRuntime.ts. */
  flag_at_0x2c: number;
}

/** OZSplineState::OZSplineState() — default ctor.  @ProChannel 0xaa??? (__ZN13OZSplineStateC2Ev).
 *  Called from the getInstance lambda @0x84dd0 on the +0x8 offset of the raw 0x38-byte allocation.
 *  UNDECODED. */
function OZSplineState_default_ctor(_state: OZSplineState): void {
  throw new Error(
    "OZSplineState::OZSplineState() @ProChannel (stub __ZN13OZSplineStateC2Ev; call site @0x84dd0) not yet transcribed",
  );
}

/** PCSingleton::PCSingleton(unsigned int) — base ctor.  @ProCore 0x1d5a6 (__ZN11PCSingletonC2Ej).
 *  Called from the getInstance lambda @0x84ddd with esi=0xc8. UNDECODED (registers `this` into
 *  PCSingleton's global vector under the given uint tag). */
function PCSingleton_ctor(_self: OZCurveAngleSplineState, _tag: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProCore 0x1d5a6 (stub __ZN11PCSingletonC2Ej; call site @0x84ddd, tag=0xc8) not yet transcribed",
  );
}

/** PCSingleton::~PCSingleton() — base dtor.  @ProCore 0x1d746 (__ZN11PCSingletonD2Ev).
 *  Tail-called from both OZCurveAngleSplineState D1 @0x4e0b and D0 @0x84e1d. UNDECODED. */
function PCSingleton_dtor(_self: OZCurveAngleSplineState): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProCore 0x1d746 (stub __ZN11PCSingletonD2Ev; call sites @0x4e0b,@0x84e1d) not yet transcribed",
  );
}

/**
 * OZCurveAngleSplineState — angle-typed spline-state singleton (companion to OZCurveAngle).
 *
 * The C++ class is a PCSingleton subclass that additionally embeds an OZSplineState at +0x8.
 * All non-destructor virtuals are inherited from PCSingleton (the vtable @0xcc3c0 slots at
 * +0x00 / +0x08 are the class's own destructors; higher slots belong to PCSingleton).
 *
 * We DO NOT model the object as raw bytes in TS. We model the two observable behaviours:
 *  - `getInstance()` returns the process-lifetime singleton (constructed on first call).
 *  - Destruction is a NOP-in-TS because the underlying PCSingleton bookkeeping is undecoded;
 *    both destructor entry points therefore delegate to a throwing stub, preserving the
 *    "loud gap" contract.
 */
export class OZCurveAngleSplineState {
  /** Embedded OZSplineState at C++ offset +0x08. Populated via default OZSplineState() ctor
   *  during the getInstance lambda @0x84dcc/@0x84dd0. */
  readonly state: OZSplineState;

  /**
   * Private constructor — reproduces the getInstance lambda body @0x84db8..0x84dfe.
   *
   *   0x84dbf movl $0x38, %edi
   *   0x84dc4 callq __Znwm                        — allocate 0x38 bytes
   *   0x84dc9 movq  %rax, %rbx                    — this = allocation
   *   0x84dcc leaq  0x8(%rax), %rdi
   *   0x84dd0 callq __ZN13OZSplineStateC2Ev       — placement-construct OZSplineState @ this+8
   *   0x84dd5 movq  %rbx, %rdi
   *   0x84dd8 movl  $0xc8, %esi
   *   0x84ddd callq __ZN11PCSingletonC2Ej         — PCSingleton::PCSingleton(this, 200)
   *   0x84de2 leaq  __ZTV23OZCurveAngleSplineState(%rip), %rax
   *   0x84de9 addq  $0x10, %rax
   *   0x84ded movq  %rax, (%rbx)                  — this->vtable = &__ZTV + 0x10
   *   0x84df0 leaq  __ZN23OZCurveAngleSplineState9_instanceE(%rip), %rax
   *   0x84df7 movq  %rbx, (%rax)                  — _instance = this
   *
   * Both member subconstructors are currently undecoded stubs; they will throw when the
   * singleton is first accessed. That preserves the "throw on undecoded" contract while
   * still giving downstream code a static class it can reference.
   */
  private constructor() {
    // OZSplineState field placeholder; the real default ctor is undecoded, so instantiate
    // the opaque shape and immediately invoke the stub to preserve the gap (throwing).
    this.state = { flag_at_0x2c: 0 };
    OZSplineState_default_ctor(this.state); // @0x84dd0 — throws (undecoded)
    PCSingleton_ctor(this, 0xc8);           // @0x84ddd — throws (undecoded)
    // (vtable install @0x84de2..0x84ded is a no-op in TS — no vtables here.)
  }

  /** static _instance — mirrors __ZN23OZCurveAngleSplineState9_instanceE @0xec388. */
  private static _instance: OZCurveAngleSplineState | null = null;

  /**
   * OZCurveAngleSplineState::getInstance()  @ProChannel 0x84d2c  (__ZN23OZCurveAngleSplineState11getInstanceEv)
   *
   *   0x84d2c push/mov %rbp ; sub $0x20, %rsp
   *   0x84d34 leaq __ZN23OZCurveAngleSplineState13_instanceOnceE(%rip), %rax
   *   0x84d3b movq (%rax), %rax                    — load once_flag
   *   0x84d3e cmpq $-0x1, %rax                     — completed sentinel = ~0ULL
   *   0x84d42 je   0x84d69                         — already initialised, skip call_once
   *   0x84d44 ...set up std::call_once args...     — stack tuple wrapping the getInstance lambda
   *   0x84d56 leaq _instanceOnce(%rip), %rdi
   *   0x84d5d leaq __call_once_proxy<lambda>(%rip), %rdx
   *   0x84d64 callq __ZNSt3__111__call_onceERVmPvPFvS2_E   ## std::__1::__call_once
   *   0x84d69 leaq __ZN23OZCurveAngleSplineState9_instanceE(%rip), %rax
   *   0x84d70 movq (%rax), %rax                    — return _instance
   *   0x84d73 add $0x20, %rsp ; pop %rbp ; retq
   *
   * The `__call_once` -> `__call_once_proxy` @0x84da8 -> `__invoke<lambda>` @0x84db8 chain
   * executes the ctor above exactly once. In JS we express that lazily with a null-check
   * (the fast path — `once == -1` — matches this shape bit-for-bit modulo the memory barrier
   * that std::once provides on the C++ side).
   */
  static getInstance(): OZCurveAngleSplineState {
    if (OZCurveAngleSplineState._instance === null) {
      OZCurveAngleSplineState._instance = new OZCurveAngleSplineState();
    }
    return OZCurveAngleSplineState._instance;
  }

  /**
   * Base-object destructor.  @ProChannel 0x4e06  (__ZN23OZCurveAngleSplineStateD1Ev)
   *
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp   0xacb4c    ## symbol stub for: __ZN11PCSingletonD2Ev
   *
   * Tail-call to PCSingleton::~PCSingleton(). No OZCurveAngleSplineState-specific
   * cleanup — the embedded OZSplineState is not explicitly destructed here.
   */
  destroyBase(): void {
    PCSingleton_dtor(this);
  }

  /**
   * Deleting destructor.  @ProChannel 0x84e14  (__ZN23OZCurveAngleSplineStateD0Ev)
   *
   *   0x84e1d callq 0xacb4c    ## symbol stub for: __ZN11PCSingletonD2Ev
   *   0x84e2b jmp   0xace04    ## symbol stub for: __ZdlPv    — operator delete(this)
   *
   * PCSingleton base destructor, then `operator delete(this)`. In TS the delete is a no-op
   * (GC owns the object); we surface it as a return after invoking the (throwing) base dtor
   * stub to preserve the loud-gap contract.
   */
  destroyDeleting(): void {
    PCSingleton_dtor(this); // @0x84e1d — throws (undecoded); would then `operator delete(this)` @0x84e2b
  }
}
