// OZCurveBoolSplineState — the bool-variant OZSplineState singleton from
// ProChannel.framework. It is one of a family of per-curve-type spline-state
// singletons (bool, int, double, etc.) that share the same shape: a static
// `_instance` pointer initialised exactly once through a `std::call_once` guard
// that runs a lambda which (a) heap-allocates 0x38 bytes, (b) runs
// OZSplineState's default constructor on this+0x8, (c) runs
// PCSingleton::PCSingleton(0xC8) on this, (d) installs the class vtable, and
// (e) stores the pointer in the static.
//
// STRUCT LAYOUT (recovered strictly from the getInstance-lambda disasm
// 0x3f6ea..0x3f730 and the destructors 0x3f744/0x3f74e):
//
//   OZCurveBoolSplineState  (total size 0x38 = 56 B — from `movl $0x38,%edi ; callq __Znwm` @0x3f6f1/0x3f6f6)
//     +0x00  vptr             = &__ZTV22OZCurveBoolSplineState + 0x10   @ProChannel 0xd5a48
//                                 (leaq 0xb631d(%rip),%rax ; addq $0x10,%rax ; movq %rax,(%rbx)
//                                  @0x3f714/0x3f71b/0x3f71f)
//                                 base vtable @0xd5a38; +0x10 skips the Itanium-ABI
//                                 header (offset-to-top + typeinfo*) and points at
//                                 the first virtual slot.
//     +0x08  OZSplineState    subobject (default-constructed via OZSplineState::OZSplineState()
//                                 @ProChannel 0xa9f0a; call site @0x3f702).
//                                 OZSplineState is 0x30 (=48) bytes (independent
//                                 heap allocation of that class is 0x30 — see
//                                 `operator new(0x30)` in OZCurveRuntime.ts's copy-
//                                 ctor path @0x1e5d1). So this subobject spans
//                                 +0x08..+0x37, exactly filling the 0x38-byte alloc.
//
// The PCSingleton base is stored INSIDE `this` (not at a separate offset — see
// call `PCSingleton::PCSingleton(this, 0xC8)` @0x3f70a/0x3f70f). PCSingleton's own
// state overlaps with the vtable/OZSplineState fields; its exact layout is deferred
// to PCSingleton.ts and is opaque here.

// ---------------------------------------------------------------------------
// Undecoded callees — each is a throwing stub (Rule 3), citing its @0xADDR so
// frontier.py can see the demand signal.
// ---------------------------------------------------------------------------

/** OZSplineState::OZSplineState() — @ProChannel 0xa9f0a (__ZN13OZSplineStateC2Ev;
 *  aliased as C1Ev @0xa9f72). Default constructor for the OZSplineState subobject
 *  embedded at (this+0x8). Called from the getInstance lambda @0x3f702. Undecoded. */
function OZSplineState_default_ctor(_p: unknown): void {
  throw new Error(
    "OZSplineState::OZSplineState() @ProChannel 0xa9f0a (__ZN13OZSplineStateC2Ev; call site @0x3f702) not yet transcribed",
  );
}

/** PCSingleton::PCSingleton(unsigned int) — imported (external) symbol
 *  (__ZN11PCSingletonC2Ej). Called from the getInstance lambda @0x3f70f via the
 *  __stubs entry @0xacb46 with %esi=0xC8 (the singleton "type ID" this class
 *  registers itself under). Undecoded. */
function PCSingleton_ctor_uint(_p: unknown, _typeId: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProChannel (imported __ZN11PCSingletonC2Ej; stub @0xacb46; call site @0x3f70f with typeId=0xC8) not yet transcribed",
  );
}

/** PCSingleton::~PCSingleton() — imported (external) symbol
 *  (__ZN11PCSingletonD2Ev). Called from BOTH destructors:
 *    - D1 (in-place, non-deleting) tail-jmps to it @0x3f749
 *    - D0 (deleting) calls it @0x3f757 before jmping to operator delete @0x3f765.
 *  Undecoded. */
function PCSingleton_dtor(_p: unknown): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProChannel (imported __ZN11PCSingletonD2Ev; stubs @0xacb4c; call sites @0x3f749 @0x3f757) not yet transcribed",
  );
}

/** Vtable-plus-0x10 sentinel for OZCurveBoolSplineState. The vptr written at
 *  (this+0x0) is `&__ZTV22OZCurveBoolSplineState + 0x10`, i.e. 0xd5a48 =
 *  vtable-base 0xd5a38 + 0x10 (skipping the 16-byte Itanium-ABI header). Written
 *  by the getInstance lambda @0x3f714/0x3f71b/0x3f71f. */
const OZCurveBoolSplineState_vtable_plus_0x10: unique symbol = Symbol(
  "__ZTV22OZCurveBoolSplineState+0x10",
);

/** Opaque handle for the embedded OZSplineState subobject at (this+0x8). This file
 *  does not decode OZSplineState — see the future OZSplineState.ts. */
interface OZSplineStateSlot {}

// ---------------------------------------------------------------------------
// The class itself.
// ---------------------------------------------------------------------------
//
// OZCurveBoolSplineState has THREE decoded methods and one hidden lambda:
//
//   getInstance()                                  @ProChannel 0x3f570
//   getInstance()::'lambda'()  (via __invoke)      @ProChannel 0x3f6ea
//   ~OZCurveBoolSplineState()  (D1, in-place)      @ProChannel 0x3f744
//   ~OZCurveBoolSplineState()  (D0, deleting)      @ProChannel 0x3f74e
//
// The lambda is what installs the singleton on first call; getInstance itself is
// a thin __call_once wrapper around it.

export class OZCurveBoolSplineState {
  /** (+0x00) vptr — set to `&__ZTV22OZCurveBoolSplineState + 0x10` @ProChannel 0xd5a48.
   *  Written by the getInstance lambda @0x3f714..0x3f71f. */
  __vptr: symbol = OZCurveBoolSplineState_vtable_plus_0x10;

  /** (+0x08) OZSplineState subobject — default-constructed by
   *  OZSplineState::OZSplineState() @ProChannel 0xa9f0a. Spans +0x08..+0x37 (0x30
   *  bytes, filling the 0x38-byte allocation). Written by the getInstance lambda
   *  @0x3f702. */
  splineState: OZSplineStateSlot = {};

  // -------------------------------------------------------------------------
  //  Static singleton machinery (matches std::call_once semantics).
  //  In C++:
  //    static uint64_t _instanceOnce = 0;              @ProChannel 0xec3b0
  //    static OZCurveBoolSplineState* _instance = 0;   @ProChannel 0xec3a8
  //  The x86_64 disasm compares _instanceOnce to -1 (=~0) as the "already
  //  completed" sentinel used by std::__1::__call_once (see @0x3f582).
  // -------------------------------------------------------------------------

  /** OZCurveBoolSplineState::_instanceOnce @ProChannel 0xec3b0.
   *  The call_once state word; -1 (as uint64) means "already run". */
  private static _instanceOnce = 0n;

  /** OZCurveBoolSplineState::_instance @ProChannel 0xec3a8.
   *  The singleton pointer, populated exactly once by the getInstance lambda. */
  private static _instance: OZCurveBoolSplineState | null = null;

  // =========================================================================
  //  OZCurveBoolSplineState::getInstance()   @ProChannel 0x3f570.
  //  Straight-line transcription of 0x3f570..0x3f5bc.
  //
  //    @0x3f578/0x3f57f:  leaq _instanceOnce(%rip),%rax ; movq (%rax),%rax
  //    @0x3f582/0x3f586:  cmpq $-1,%rax ; je 0x3f5ad         (already done? skip)
  //    @0x3f588..0x3f5a1: build the __call_once frame:
  //                        -0x1(%rbp)  = uninit `bool completed` (0 initially,
  //                                       __call_once flips to 1 on success)
  //                        -0x18(%rbp) = &completed              (the tuple's
  //                                       captured lambda-arg)
  //                        -0x10(%rbp) = &-0x18(%rbp)            (the tuple ptr)
  //                        %rdi = &_instanceOnce
  //                        %rsi = &tuple (=-0x10(%rbp))
  //                        %rdx = &__call_once_proxy<lambda>     (the trampoline
  //                                that reads *tuple->lambda and __invokes it)
  //    @0x3f5a8:  callq std::__1::__call_once(...)                (via stub)
  //    @0x3f5ad/0x3f5b4:  leaq _instance(%rip),%rax ; movq (%rax),%rax
  //    @0x3f5b7..0x3f5bc:  epilogue ; retq
  //
  //  We collapse the __call_once trampoline into a direct call to the lambda —
  //  it's semantically identical (one-shot init guarded by a state word) and the
  //  proxy/invoke helpers only exist to marshal the lambda across the C ABI. The
  //  citations above document what we skipped and where it lived in the binary.
  // =========================================================================
  static getInstance(): OZCurveBoolSplineState {
    // @0x3f57f/0x3f582/0x3f586: compare _instanceOnce to -1 (uint64 all-ones).
    // 0xffffffffffffffffn is what std::call_once writes on successful completion.
    if (OZCurveBoolSplineState._instanceOnce !== 0xffffffffffffffffn) {
      // @0x3f5a8: __call_once(&_instanceOnce, &tuple{&lambda}, &__call_once_proxy).
      //   Inside __call_once, the proxy @0x3f6da unpacks the tuple, then __invoke
      //   @0x3f6ea runs the lambda. See the "getInstance lambda" section below.
      OZCurveBoolSplineState._getInstance_lambda();
      // std::call_once sets the state word to all-ones on successful completion.
      OZCurveBoolSplineState._instanceOnce = 0xffffffffffffffffn;
    }
    // @0x3f5ad/0x3f5b4:  return _instance.
    // Post-call_once, _instance is guaranteed non-null; the assert mirrors the
    // language-level invariant without inventing a fallback path.
    const inst = OZCurveBoolSplineState._instance;
    if (inst === null) {
      throw new Error(
        "OZCurveBoolSplineState::getInstance @ProChannel 0x3f5ad — _instance is null after __call_once (should be impossible)",
      );
    }
    return inst;
  }

  // =========================================================================
  //  OZCurveBoolSplineState::getInstance()::'lambda'()  @ProChannel 0x3f6ea
  //    (reached via __call_once_proxy @0x3f6da -> __invoke @0x3f6ea).
  //  Straight-line transcription of 0x3f6ea..0x3f730 (0x3f731..0x3f73f is the
  //  Itanium unwind landing pad that operator-deletes %rbx and re-raises — the
  //  only way to reach it is if operator new or one of the ctor calls throws).
  //
  //    @0x3f6f1/0x3f6f6:  movl $0x38,%edi ; callq __Znwm     (operator new(0x38))
  //    @0x3f6fb:          movq %rax, %rbx                    (fresh 56-byte block)
  //    @0x3f6fe/0x3f702:  leaq 0x8(%rax),%rdi ; callq OZSplineState::OZSplineState()
  //    @0x3f707/0x3f70a/0x3f70f:
  //                       movq %rbx,%rdi ; movl $0xC8,%esi ;
  //                       callq PCSingleton::PCSingleton(unsigned int)
  //    @0x3f714/0x3f71b/0x3f71f:
  //                       leaq __ZTV22OZCurveBoolSplineState(%rip),%rax ;
  //                       addq $0x10,%rax ; movq %rax, (%rbx)
  //                                          -> vptr = vtable-base + 0x10 = 0xd5a48.
  //    @0x3f722/0x3f729:  leaq _instance(%rip),%rax ; movq %rbx, (%rax)
  //                                          -> _instance = fresh.
  //    @0x3f72c..0x3f730: epilogue ; retq.
  // =========================================================================
  private static _getInstance_lambda(): void {
    // @0x3f6f1..0x3f6fb:  operator new(0x38) -> a fresh 56-byte block.
    const fresh = new OZCurveBoolSplineState();

    // @0x3f6fe/0x3f702:  OZSplineState::OZSplineState() on (this+0x8).
    OZSplineState_default_ctor(fresh.splineState);

    // @0x3f707/0x3f70a/0x3f70f:  PCSingleton::PCSingleton(this, 0xC8).
    //  0xC8 is the singleton-type ID this class registers under. It's a compile-
    //  time constant baked into the lambda; we transcribe it here as-is.
    PCSingleton_ctor_uint(fresh, 0xc8);

    // @0x3f714/0x3f71b/0x3f71f:  install the vtable-plus-0x10 pointer at (this+0).
    //  (The `new OZCurveBoolSplineState()` above already set __vptr to this same
    //  sentinel via the field initialiser — the assignment here mirrors the store
    //  the binary performs and keeps the mapping explicit.)
    fresh.__vptr = OZCurveBoolSplineState_vtable_plus_0x10;

    // @0x3f722/0x3f729:  publish to the static.
    OZCurveBoolSplineState._instance = fresh;
  }

  // =========================================================================
  //  OZCurveBoolSplineState::~OZCurveBoolSplineState()  @ProChannel 0x3f744  (D1, in-place).
  //  Straight-line transcription of 0x3f744..0x3f749.
  //
  //    @0x3f744..0x3f748:  push %rbp ; mov %rsp,%rbp ; pop %rbp
  //    @0x3f749:           jmp PCSingleton::~PCSingleton()   (tail-call)
  //
  //  Nothing else. Notably, OZSplineState (at this+0x8) does NOT get its own
  //  destructor invocation here — the class's compiler-generated destructor
  //  chain apparently expects PCSingleton::~PCSingleton() to do the composite
  //  teardown, or OZSplineState is trivially-destructible and its bytes are
  //  simply reclaimed by the deleting D0. Either way, the disasm shows no
  //  OZSplineState::~OZSplineState() call from the D1 path, and Rule 1 says we
  //  mirror what's there.
  // =========================================================================
  destruct(): void {
    // @0x3f749: tail-jmp to PCSingleton::~PCSingleton(this).
    PCSingleton_dtor(this);
  }

  // =========================================================================
  //  OZCurveBoolSplineState::~OZCurveBoolSplineState()  @ProChannel 0x3f74e  (D0, deleting).
  //  Straight-line transcription of 0x3f74e..0x3f765.
  //
  //    @0x3f74e..0x3f754:  push %rbp/%rbx/%rax ; mov %rdi,%rbx (save this).
  //    @0x3f757:           callq PCSingleton::~PCSingleton(this).
  //    @0x3f75c/0x3f75f:   mov %rbx,%rdi ; add $0x8,%rsp.
  //    @0x3f763..0x3f765:  pop %rbx/%rbp ; jmp operator delete(%rdi).
  //
  //  Same observation as D1 re: OZSplineState — no explicit dtor call. In TS
  //  operator delete is GC-managed; we just run the same PCSingleton dtor.
  // =========================================================================
  destruct_delete(): void {
    // @0x3f757: PCSingleton::~PCSingleton(this).
    PCSingleton_dtor(this);
    // @0x3f765: tail-jmp to operator delete(this). GC-managed in TS.
  }
}
