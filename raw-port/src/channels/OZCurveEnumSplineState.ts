// OZCurveEnumSplineState.ts — the per-curve-type singleton that supplies the default
// OZSplineState instance for enum-valued channel curves in ProChannel.
//
// This is a faithful transcription of the FCP class OZCurveEnumSplineState whose three
// entry points live in the ProChannel framework:
//
//   @0x0006a670  OZCurveEnumSplineState::getInstance()                 [__ZN22OZCurveEnumSplineState11getInstanceEv]
//   @0x0006a77c  OZCurveEnumSplineState::~OZCurveEnumSplineState()  D1 [__ZN22OZCurveEnumSplineStateD1Ev]
//   @0x00010004  OZCurveEnumSplineState::~OZCurveEnumSplineState()  D0 [__ZN22OZCurveEnumSplineStateD0Ev]
//
// The singleton itself is constructed inside the std::call_once lambda body, which the
// compiler inlined into the __invoke helper at @0x0006391e:
//   __ZNSt3__18__invokeB9nqe210106IJZN22OZCurveEnumSplineState11getInstanceEvEUlvE_EEE...
// The proxy at @0x0006390e is the trivial `(*t.get<0>())()` trampoline that std::call_once
// hands to __call_once via a function pointer.
//
// STRUCT LAYOUT (recovered from the ctor lambda @0x0006391e):
//   sizeof(OZCurveEnumSplineState) = 0x38 = 56 bytes   (`movl $0x38, %edi ; callq _Znwm` @0x63925)
//     +0x00  vtable pointer                            (`leaq __ZTV22OZCurveEnumSplineState(%rip), %rax ; addq $0x10, %rax ; movq %rax, (%rbx)`
//                                                       @0x63948..0x63953 — installed ptr = vtable+0x10)
//     +0x08  OZSplineState base subobject              (`leaq 0x8(%rax), %rdi ; callq OZSplineState::OZSplineState()`
//                                                       @0x63932..0x63936). OZSplineState default-ctor @0xa9f0a (undecoded here).
//     +0x??  PCSingleton base subobject               (constructed AFTER OZSplineState — `movq %rbx, %rdi ; movl $0xc8, %esi ; callq PCSingleton::PCSingleton(uint)`
//                                                       @0x6393b..0x63943 with the singleton-id argument 200 (0xc8)).
//                                                       PCSingleton is called on `this` (%rbx) — so PCSingleton lives at
//                                                       offset +0x00 in the multi-inherit layout, overlapping the vtable
//                                                       slot which is then overwritten @0x63953 with the
//                                                       OZCurveEnumSplineState vtable installed pointer. In C++ terms:
//                                                       `class OZCurveEnumSplineState : public PCSingleton, public OZSplineState`
//                                                       (PCSingleton primary base at offset 0, OZSplineState secondary base at +0x8).
//
// VTABLE (from raw-port/army/tools/resolve.py ProChannel vtable OZCurveEnumSplineState —
// __ZTV22OZCurveEnumSplineState @0xd02d8; installed ptr = 0xd02e8; only 2 slots present, the
// remaining bytes in the dump belong to the next class):
//   *0x00 -> 0x6a77c  ~OZCurveEnumSplineState() D1  (complete-object dtor)
//   *0x08 -> 0x10004  ~OZCurveEnumSplineState() D0  (deleting dtor: base-dtor + operator delete)
//
// STATIC STATE (RIP-relative symbols read by getInstance() @0x6a670):
//   OZCurveEnumSplineState::_instanceOnce  [__ZN22OZCurveEnumSplineState13_instanceOnceE]
//     - the std::once_flag word tested `cmpq $-0x1, %rax ; je fast-path` @0x6a67f..0x6a686
//   OZCurveEnumSplineState::_instance      [__ZN22OZCurveEnumSplineState9_instanceE]
//     - loaded @0x6a6ad, returned as the singleton pointer @0x6a6b4
//
// UNDECODED CALLEES (throwing stubs cite their addresses per PORTING_SPEC.md Rule 3):
//   - OZSplineState::OZSplineState()              @ProChannel 0xa9f0a  (call site @0x63936)
//   - PCSingleton::PCSingleton(unsigned int)      @ProChannel U-import __ZN11PCSingletonC2Ej
//                                                                     (call site @0x63943)
//   - PCSingleton::~PCSingleton()                 @ProChannel U-import __ZN11PCSingletonD2Ev
//                                                                     (call sites @0x1000d in D0,
//                                                                                @0x6a781 in D1)
//   - operator new(unsigned long) __Znwm          (call site @0x6392a)
//   - operator delete(void*)      __ZdlPv         (call site @0x1001b tail-jmp in D0)

// ─────────────────────────────────────────────────────────────────────────────
// Undecoded-base stubs
// ─────────────────────────────────────────────────────────────────────────────

/** OZSplineState::OZSplineState() — @ProChannel 0xa9f0a (__ZN13OZSplineStateC2Ev).
 *  Base default constructor invoked on `this+0x8` inside the getInstance lambda @0x63936.
 *  Undecoded here; the OZSplineState class lives outside this file (Rule 6). */
function OZSplineState_default_ctor(_baseSubobj: unknown): void {
  throw new Error(
    "OZSplineState::OZSplineState() @ProChannel 0xa9f0a (__ZN13OZSplineStateC2Ev; call site @0x63936) not yet transcribed",
  );
}

/** PCSingleton::PCSingleton(unsigned int) — @ProChannel U-import __ZN11PCSingletonC2Ej.
 *  Primary-base constructor invoked on `this` with singleton-id 0xc8 (200) inside the
 *  getInstance lambda @0x63943. PCSingleton lives in ProCore and is undecoded here. */
function PCSingleton_ctor(_this: unknown, _id: number): void {
  throw new Error(
    "PCSingleton::PCSingleton(unsigned int) @ProChannel U-import __ZN11PCSingletonC2Ej (call site @0x63943 with id=0xc8) not yet transcribed",
  );
}

/** PCSingleton::~PCSingleton() — @ProChannel U-import __ZN11PCSingletonD2Ev.
 *  Called by both destructor variants (D0 @0x1000d, D1 @0x6a781). Undecoded. */
function PCSingleton_dtor(_this: unknown): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProChannel U-import __ZN11PCSingletonD2Ev (call sites D0@0x1000d, D1@0x6a781) not yet transcribed",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OZCurveEnumSplineState — 56-byte object; enum-curve default spline state singleton
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OZCurveEnumSplineState — per-curve-type (enum variant) OZSplineState singleton.
 *
 * Fields are laid out per the recovered struct layout above. The vtable pointer at +0x00
 * is not modelled explicitly (we have no vtable in TS); PCSingleton and OZSplineState base
 * subobjects are declared as opaque handles pending their own class ports.
 */
export class OZCurveEnumSplineState {
  /** (+0x00) PCSingleton primary base. Constructed with id=0xc8 @0x63943. Opaque here. */
  readonly _pcSingletonBase: { readonly id: number };

  /** (+0x08) OZSplineState secondary base subobject. Default-constructed @0x63936. Opaque here. */
  readonly _splineStateBase: unknown;

  /**
   * @0x0006391e  OZCurveEnumSplineState::OZCurveEnumSplineState()  (compiler-inlined into the
   * std::call_once lambda body — no standalone symbol; disassembled inside the __invoke helper
   * __ZNSt3__18__invokeB9nqe210106IJZN22OZCurveEnumSplineState11getInstanceEvEUlvE_EEE...).
   *
   * Mirrors the asm exactly:
   *   0x63925  movl  $0x38, %edi                     ; sizeof = 56
   *   0x6392a  callq __Znwm                          ; %rax = operator new(56)
   *   0x6392f  movq  %rax, %rbx                      ; this = %rbx
   *   0x63932  leaq  0x8(%rax), %rdi                 ; &this->OZSplineState_base
   *   0x63936  callq OZSplineState::OZSplineState()  ; base ctor #1  @0xa9f0a
   *   0x6393b  movq  %rbx, %rdi
   *   0x6393e  movl  $0xc8, %esi                     ; id = 200
   *   0x63943  callq PCSingleton::PCSingleton(uint)  ; base ctor #2  (U-import)
   *   0x63948  leaq  __ZTV22OZCurveEnumSplineState(%rip), %rax
   *   0x6394f  addq  $0x10, %rax                     ; installed ptr = vtable+0x10
   *   0x63953  movq  %rax, (%rbx)                    ; this->vtable = installed
   *   0x63956  leaq  OZCurveEnumSplineState::_instance(%rip), %rax
   *   0x6395d  movq  %rbx, (%rax)                    ; _instance = this
   *
   * The vtable-store at 0x63953 has no TS analogue (we have no vptr); the two virtual
   * destructors are ordinary methods on the class. Order of base-ctor calls matches the
   * asm: OZSplineState first (@0x63936), then PCSingleton (@0x63943).
   */
  private constructor() {
    // @0x63936 — OZSplineState base ctor on the secondary base subobject at +0x8.
    // The base object is opaque; we materialise a distinct empty holder so identity
    // comparisons behave and the ctor citation isn't silently elided.
    const splineStateBase: unknown = Object.create(null);
    OZSplineState_default_ctor(splineStateBase); // throws — currently undecoded
    this._splineStateBase = splineStateBase;

    // @0x63943 — PCSingleton primary-base ctor with id = 0xc8 (200 decimal).
    const pcSingletonBase = { id: 0xc8 };
    PCSingleton_ctor(pcSingletonBase, 0xc8); // throws — currently undecoded
    this._pcSingletonBase = pcSingletonBase;

    // @0x63948..0x63953 — vptr install. No TS analogue.
  }

  // ── static once-flag + instance slot (RIP-relative globals in ProChannel) ──
  //   __ZN22OZCurveEnumSplineState13_instanceOnceE   — std::once_flag word
  //   __ZN22OZCurveEnumSplineState9_instanceE        — OZCurveEnumSplineState*
  /** @ProChannel __ZN22OZCurveEnumSplineState13_instanceOnceE — the once_flag tested @0x6a682
   *  (`cmpq $-0x1, %rax`). Set to the sentinel -1 after successful init by __call_once. */
  private static _instanceOnce: -1 | 0 = 0;
  /** @ProChannel __ZN22OZCurveEnumSplineState9_instanceE — pointer loaded @0x6a6ad. */
  private static _instance: OZCurveEnumSplineState | null = null;

  /**
   * @0x0006a670  OZCurveEnumSplineState::getInstance()
   * [__ZN22OZCurveEnumSplineState11getInstanceEv]
   *
   * Meyers-style std::call_once singleton. Mirrors the asm:
   *   0x6a678  leaq  _instanceOnce(%rip), %rax
   *   0x6a67f  movq  (%rax), %rax
   *   0x6a682  cmpq  $-0x1, %rax                     ; fast path: already initialised?
   *   0x6a686  je    0x6a6ad                          ; yes → skip call_once
   *   ; --- slow path: allocate the tuple<...&&> shim on stack and hand it to __call_once ---
   *   0x6a688..0x6a6a1  build the &(&lambda) tuple pointer chain on the stack
   *   0x6a6a1  leaq  _instanceOnce(%rip), %rdi
   *   0x6a6a1  leaq  __call_once_proxy<...>(%rip), %rdx
   *   0x6a6a8  callq __call_once(unsigned long&, void*, void(*)(void*))   ; @__stubs
   *   ; --- fall-through / fast-path merge ---
   *   0x6a6ad  leaq  _instance(%rip), %rax
   *   0x6a6b4  movq  (%rax), %rax                    ; return _instance
   *   0x6a6b7..retq
   *
   * In TypeScript we collapse the double-indirection tuple<T&&> shim to a plain
   * lazy-init: on first entry construct the object and flip _instanceOnce to -1.
   * The observable behaviour (single construction, cached pointer) matches the asm.
   */
  static getInstance(): OZCurveEnumSplineState | null {
    // @0x6a67f..0x6a686 — fast path check.
    if (OZCurveEnumSplineState._instanceOnce !== -1) {
      // @0x6a6a8 — call_once(_instanceOnce, tuple{&lambda}, __call_once_proxy).
      // The proxy @0x6390e trampolines to __invoke @0x6391e which runs the ctor lambda.
      // If the ctor throws (currently guaranteed because OZSplineState/PCSingleton bases
      // are undecoded), the once-flag is NOT set to -1 — matching std::call_once semantics
      // where a ctor that raises leaves the flag "not yet initialised" (see @0x6a682).
      const fresh = new OZCurveEnumSplineState();
      OZCurveEnumSplineState._instance = fresh;
      OZCurveEnumSplineState._instanceOnce = -1;
    }
    // @0x6a6ad..0x6a6b4 — return _instance (may still be null on race in the asm; in TS
    // the single-threaded model guarantees non-null once past the guard).
    return OZCurveEnumSplineState._instance;
  }

  /**
   * @0x0006a77c  OZCurveEnumSplineState::~OZCurveEnumSplineState()  D1 (complete-object dtor)
   * [__ZN22OZCurveEnumSplineStateD1Ev]
   *
   * Full disassembly:
   *   0x6a77c  pushq %rbp
   *   0x6a77d  movq  %rsp, %rbp
   *   0x6a780  popq  %rbp
   *   0x6a781  jmp   __ZN11PCSingletonD2Ev            ; tail-call PCSingleton::~PCSingleton
   *
   * Trivial tail-call — the OZSplineState secondary base and this class have no
   * additional dtor code emitted here; only the PCSingleton primary base is destroyed.
   * (The compiler folded OZSplineState's dtor into the D2/D0 helpers not present at
   * this address; only the primary-base dtor survives at the D1 entry.)
   */
  destroy_D1(): void {
    // @0x6a781 — tail-call PCSingleton::~PCSingleton().
    PCSingleton_dtor(this._pcSingletonBase);
  }

  /**
   * @0x00010004  OZCurveEnumSplineState::~OZCurveEnumSplineState()  D0 (deleting dtor)
   * [__ZN22OZCurveEnumSplineStateD0Ev]
   *
   * Full disassembly:
   *   0x10004  pushq %rbp
   *   0x10005  movq  %rsp, %rbp
   *   0x10008  pushq %rbx
   *   0x10009  pushq %rax
   *   0x1000a  movq  %rdi, %rbx                       ; save this
   *   0x1000d  callq __ZN11PCSingletonD2Ev            ; PCSingleton::~PCSingleton(this)
   *   0x10012  movq  %rbx, %rdi
   *   0x10015  addq  $0x8, %rsp
   *   0x10019  popq  %rbx
   *   0x1001a  popq  %rbp
   *   0x1001b  jmp   __ZdlPv                          ; tail-call operator delete(this)
   *
   * Same as D1 wrt member destruction (no member-dtors emitted here — only the
   * PCSingleton primary-base dtor), then tail-jumps to `operator delete`.
   * TS has no manual delete; we model deletion by clearing the shared _instance
   * slot iff it points at `this` (so a re-init would re-run the ctor).
   */
  destroy_D0(): void {
    // @0x1000d — PCSingleton::~PCSingleton(this).
    PCSingleton_dtor(this._pcSingletonBase);
    // @0x1001b — operator delete(this). TS has no manual heap free; observable
    // effect that matters here is that a future getInstance() should not hand
    // back a destroyed object. Uncouple the static _instance slot when it
    // points at us.
    if (OZCurveEnumSplineState._instance === this) {
      OZCurveEnumSplineState._instance = null;
      OZCurveEnumSplineState._instanceOnce = 0;
    }
  }
}
