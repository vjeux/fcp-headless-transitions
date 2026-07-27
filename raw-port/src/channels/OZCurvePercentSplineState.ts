// OZCurvePercentSplineState — a Meyers-singleton that owns the per-curve-type
// OZSplineState used by OZCurvePercent (the percent-domain curve variant).
// Framework: ProChannel.
//
// Faithful port. Decode: 3 methods listed by the ledger, plus the singleton's
// call-once lambda body (the ctor lives inside the __invoke thunk):
//   __ZN25OZCurvePercentSplineState11getInstanceEv                @ProChannel 0xabb48
//   __ZN25OZCurvePercentSplineStateD1Ev  (base dtor D1)           @ProChannel 0xabcc4
//   __ZN25OZCurvePercentSplineStateD0Ev  (deleting dtor D0)       @ProChannel 0xabcce
//   __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN25OZCurvePercentSplineState11getInstanceEvEUlvE_EEEEEvPv
//                                                                 @ProChannel 0xabc5a
//   __ZNSt3__18__invokeB9nqe210106IJZN25OZCurvePercentSplineState11getInstanceEvEUlvE_EEE...
//                                                                 @ProChannel 0xabc6a
//     (the lambda body: the ctor emitted inline here — this is where the class
//      is actually constructed on first getInstance() call.)
//
// Object layout (recovered from the invoke thunk @0xabc71..0xabca9):
//   sizeof = 0x38 (56 B)                                        `movl $0x38,%edi` @0xabc71
//   +0x00  vptr  = &__ZTV25OZCurvePercentSplineState + 0x10     @0xabc94..0xabc9f
//   +0x00  ..    PCSingleton base subobject
//          — the PCSingleton base ctor is called on `%rbx` (this)   @0xabc87..0xabc8f
//          — the base is at +0x0; its own layout is opaque here.
//   +0x08  OZSplineState subobject                               @0xabc7e..0xabc82
//          — rdi = %rax+0x8, then OZSplineState::OZSplineState() runs.
//
// Base helpers we ride but haven't decoded yet (each a throwing stub — Rule 3):
//   __ZN13OZSplineStateC2Ev  OZSplineState::OZSplineState()      @ProChannel 0xa9f0a
//                                                                 (called @0xabc82)
//   __ZN11PCSingletonC2Ej    PCSingleton::PCSingleton(unsigned)  @ProChannel U-import
//                                                                 (called @0xabc8f, arg=0xc8)
//   __ZN11PCSingletonD2Ev    PCSingleton::~PCSingleton()         @ProChannel U-import
//                                                                 (called @0xabcc9, @0xabcd7)
//   __ZNSt3__111__call_onceERVmPvPFvS2_E                          @ProChannel U-import
//                                                                 (called @0xabb80)
//
// Statics (BSS, ProChannel __DATA):
//   __ZN25OZCurvePercentSplineState13_instanceOnceE  = 0xed358   (uint64 __once_flag)
//   __ZN25OZCurvePercentSplineState9_instanceE       = 0xed350   (T*)

/** OZSplineState::OZSplineState() @ProChannel 0xa9f0a (__ZN13OZSplineStateC2Ev).
 *  Called @0xabc82 with rdi = self+0x8 to default-construct the embedded subobject. */
function OZSplineState_default_ctor(_self_plus_0x8: unknown): void {
  throw new Error(
    "OZSplineState::OZSplineState() @ProChannel 0xa9f0a (__ZN13OZSplineStateC2Ev; call site @0xabc82) not yet transcribed",
  );
}

/** PCSingleton::PCSingleton(unsigned int) @ProChannel U-import (__ZN11PCSingletonC2Ej).
 *  Called @0xabc8f with esi=0xc8 (=200) — the singleton class id. */
function PCSingleton_ctor(_self: unknown, _classId: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProChannel 0x0 (__ZN11PCSingletonC2Ej U-import; call site @0xabc8f) not yet transcribed",
  );
}

/** PCSingleton::~PCSingleton() @ProChannel U-import (__ZN11PCSingletonD2Ev).
 *  Called @0xabcc9 (from D1) and @0xabcd7 (from D0). */
function PCSingleton_dtor(_self: unknown): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProChannel 0x0 (__ZN11PCSingletonD2Ev U-import; call sites @0xabcc9 @0xabcd7) not yet transcribed",
  );
}

/** std::__1::call_once — the C++ std machinery invoked @0xabb80 to serialize the
 *  first-call construction of the Meyers singleton. We model it directly with a
 *  boolean flag (Node/JS is single-threaded — no real race). */
function std_call_once(flag: { done: boolean }, run: () => void): void {
  // @0xabb80: __ZNSt3__111__call_onceERVmPvPFvS2_E — reference to _instanceOnce,
  // a fn-ptr to the call_once_proxy trampoline, and the packed arg pack.
  if (!flag.done) {
    run();
    flag.done = true;
  }
}

/** Vtable base for OZCurvePercentSplineState. The vptr stored at (this+0x0) is
 *  `&__ZTV25OZCurvePercentSplineState + 0x10`, i.e. it skips the 16-byte Itanium
 *  ABI header (offset-to-top + typeinfo*) and points at the first virtual slot.
 *  __ZTV25OZCurvePercentSplineState @ProChannel 0xe2848 (address only; the slot
 *  contents come from vtable dumps of the class, not decoded in this file). */
const OZCurvePercentSplineState_vtable_plus_0x10: unique symbol = Symbol(
  "__ZTV25OZCurvePercentSplineState+0x10",
);

/** Static once-flag @ProChannel 0xed358 (__ZN25OZCurvePercentSplineState13_instanceOnceE).
 *  Read/written by std::call_once @0xabb80. In C++ its runtime states are:
 *    (uint64_t)-1 → the "already fully constructed" fast-path sentinel (checked
 *                    @0xabb5a..0xabb5e: `cmpq $-0x1,%rax ; je 0xabb85` — skips the
 *                    call_once entirely).
 *    other        → dispatch into call_once, which will either construct or wait.
 *  We use a plain boolean; the two states collapse cleanly. */
const _instanceOnce: { done: boolean } = { done: false };

/** Static instance slot @ProChannel 0xed350 (__ZN25OZCurvePercentSplineState9_instanceE).
 *  Read @0xabb85..0xabb8c (return value) and written @0xabca2..0xabca9 (inside the
 *  call_once lambda). Nullable — remains null until getInstance() has run. */
let _instance: OZCurvePercentSplineState | null = null;

/**
 * OZCurvePercentSplineState — extends PCSingleton and owns an embedded OZSplineState
 * subobject at +0x8. There is no external state; the class exists to be a typed,
 * class-id-200 singleton exposing OZSplineState services to OZCurvePercent.
 */
export class OZCurvePercentSplineState {
  /** (this+0x0) — vptr, set to `&__ZTV25OZCurvePercentSplineState + 0x10`
   *  after PCSingleton::PCSingleton has initialised the base subobject
   *  (@0xabc94..0xabc9f). The vtable class id passed to PCSingleton is 0xc8. */
  __vptr?: symbol;

  /** (this+0x0..)  PCSingleton base — layout opaque here (U-import). Constructed
   *  in-place by `PCSingleton_ctor(this, 0xc8)` @0xabc8f. */

  /** (this+0x08)   OZSplineState subobject. Default-constructed in-place
   *  by `OZSplineState::OZSplineState()` @0xabc82. Its own fields are opaque here. */
  splineState_at_0x8: object = {};

  /**
   * OZCurvePercentSplineState::OZCurvePercentSplineState() — the ctor is not
   * emitted as a named function; the compiler inlined it into the call_once
   * lambda's __invoke thunk (@0xabc6a..0xabcb0). We mirror that body verbatim
   * as the private `_construct` helper:
   *   %rbx = operator new(0x38)                                    @0xabc71..0xabc7b
   *   OZSplineState::OZSplineState(%rax + 0x8)                     @0xabc7e..0xabc82
   *   PCSingleton::PCSingleton(%rbx, 0xc8)                         @0xabc87..0xabc8f
   *   (%rbx)+0x0 = &__ZTV25OZCurvePercentSplineState + 0x10        @0xabc94..0xabc9f
   *   _instance = %rbx                                             @0xabca2..0xabca9
   *   return                                                       @0xabb0
   * Landing pad (@0xabcb1..0xabcbf): on throw, operator delete(%rbx) + _Unwind_Resume.
   *
   * The lambda emits an unconditional store into _instance — there is NO
   * pre-existence check inside the lambda (unlike e.g. OZChannelPercent50Impl
   * @0xabd04). Serialization is entirely std::call_once's job.
   */
  private static _construct(): void {
    // @0xabc71..0xabc7b: operator new(0x38) — 56-byte allocation. GC-managed in TS.
    const self = Object.create(OZCurvePercentSplineState.prototype) as OZCurvePercentSplineState;
    // @0xabc7e..0xabc82: OZSplineState default ctor on self+0x8.
    OZSplineState_default_ctor(self.splineState_at_0x8);
    // @0xabc87..0xabc8f: PCSingleton::PCSingleton(this, 0xc8).
    //   0xc8 = 200 — the class-id constant baked into this singleton
    //   (`movl $0xc8,%esi` @0xabc8a).
    PCSingleton_ctor(self, 0xc8);
    // @0xabc94..0xabc9f: install vptr (skip 16-byte Itanium header).
    self.__vptr = OZCurvePercentSplineState_vtable_plus_0x10;
    // @0xabca2..0xabca9: publish to the static _instance slot.
    _instance = self;
  }

  /**
   * OZCurvePercentSplineState::getInstance() @ProChannel 0xabb48
   * (__ZN25OZCurvePercentSplineState11getInstanceEv).
   *
   * Body @0xabb48..0xabb94:
   *   rax = _instanceOnce                                         @0xabb50..0xabb57
   *   if (rax == (uint64_t)-1) goto ret_load                      @0xabb5a..0xabb5e
   *   // Build the tuple<lambda&&> arg-pack on the stack:
   *   //   [rbp-0x18] = &[rbp-0x1] ; [rbp-0x10] = &[rbp-0x18]     @0xabb60..0xabb72
   *   //   (this is the trivial capture-nothing lambda address —
   *   //    the lambda has no state, but the ABI still packs it.)
   *   call std::__1::__call_once(_instanceOnce,
   *                              &tuple,
   *                              &__call_once_proxy<...>)         @0xabb79..0xabb80
   * ret_load:
   *   rax = _instance                                             @0xabb85..0xabb8c
   *   return rax                                                  @0xabb8f..0xabb94
   *
   * The proxy trampoline @0xabc5a just forwards to the __invoke thunk (@0xabc6a),
   * which contains the ctor body transcribed in `_construct()` above.
   */
  static getInstance(): OZCurvePercentSplineState | null {
    // @0xabb50..0xabb5e: fast-path — if the once flag is the sentinel, skip.
    // Modelled by the boolean `_instanceOnce.done` inside `std_call_once`.
    // @0xabb79..0xabb80: call_once dispatches to the lambda which is
    //   `OZCurvePercentSplineState::_construct()`.
    std_call_once(_instanceOnce, OZCurvePercentSplineState._construct);
    // @0xabb85..0xabb94: return the (now-published) _instance.
    return _instance;
  }

  /**
   * OZCurvePercentSplineState::~OZCurvePercentSplineState() (D1 — non-deleting)
   * @ProChannel 0xabcc4 (__ZN25OZCurvePercentSplineStateD1Ev).
   *
   * Body @0xabcc4..0xabcc9:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp PCSingleton::~PCSingleton()                             @0xabcc9
   * i.e. a bare tail-call to the base dtor with NO derived-class cleanup.
   * OZCurvePercentSplineState adds no owning fields beyond the OZSplineState
   * subobject, whose destruction is implicit (OZSplineState has no compiler-
   * emitted dtor call visible here — either trivial or inlined into the base).
   */
  dtor(): void {
    // @0xabcc9: tail-call to PCSingleton::~PCSingleton().
    PCSingleton_dtor(this);
  }

  /**
   * OZCurvePercentSplineState::~OZCurvePercentSplineState() (D0 — deleting)
   * @ProChannel 0xabcce (__ZN25OZCurvePercentSplineStateD0Ev).
   *
   * Body @0xabcce..0xabce5:
   *   %rbx = %rdi ; call PCSingleton::~PCSingleton(%rdi)          @0xabcd4..0xabcd7
   *   %rdi = %rbx ; jmp operator delete(void*)                    @0xabcdc..0xabce5
   * i.e. destroy the base and then free the storage. In TS there is no
   * `operator delete`; that half is a no-op (GC owns the heap).
   */
  dtor_deleting(): void {
    // @0xabcd7: PCSingleton::~PCSingleton(this).
    PCSingleton_dtor(this);
    // @0xabce5: jmp __ZdlPv (operator delete) — no TS equivalent; GC reclaims.
  }
}
