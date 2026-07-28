// OZChannelAspectRatioImpl — the "impl" sidecar for OZChannelAspectRatio.
//
// Framework: ProChannel
//
// Provenance (raw-port/re/disasm/ProChannel.OZChannelAspectRatioImpl.*.s):
//   OZChannelAspectRatioImpl::~OZChannelAspectRatioImpl()   @0x00006152  (D1, base dtor)
//     mangled __ZN24OZChannelAspectRatioImplD1Ev
//   OZChannelAspectRatioImpl::~OZChannelAspectRatioImpl()   @0x00006172  (D0, deleting dtor)
//     mangled __ZN24OZChannelAspectRatioImplD0Ev
//
// The ledger lists exactly these two T-symbols under `__ZN24OZChannelAspectRatioImpl*`
// (only the itaniumABI D1/D0 pair, no other member function is exported here — the class
// body is otherwise pure inline / vtable dispatch).
//
// STRUCT LAYOUT (from the D1/D0 disasm):
//   +0x00  vptr (implicit; both dtors leave it alone — the base OZChannelImpl dtor rewrites it
//          before destroying its own fields)
//   +0x28  PCSingleton   member  (destroyed unconditionally by both D1 and D0 via
//                                 PCSingleton::~PCSingleton() — ProChannel stub 0xacb4c —
//                                 called on `this + 0x28`)
//   [everything else is inherited from OZChannelImpl; not touched by these two methods]
//
// Callees / RIP-relative refs (resolve.py ProChannel stubs):
//   __ZN11PCSingletonD2Ev             (D1 @0x615f, D0 @0x617f) — ProChannel stub 0xacb4c
//   __ZN13OZChannelImplD2Ev           (D1 tail @0x616d, D0 call @0x6187) — direct call, no stub
//   __ZdlPv  (operator delete)        (D0 tail @0x6195) — ProChannel stub 0xace04

/** External `__ZN11PCSingletonD2Ev` — `PCSingleton::~PCSingleton()` (base dtor). Invoked on
 *  `this + 0x28` by both D1 (@0x615f) and D0 (@0x617f). Not yet transcribed:
 *  destroys the PCSingleton member @0x00006152 (D1) / @0x00006172 (D0). */
function PCSingleton_dtor(_addrOfMember: unknown): void {
  throw new Error(
    'PCSingleton::~PCSingleton() @ProChannel stub 0xacb4c ' +
      '(__ZN11PCSingletonD2Ev) not yet transcribed — invoked by ' +
      'OZChannelAspectRatioImpl D1 @0x00006152 (call site @0x0000615f) and ' +
      'D0 @0x00006172 (call site @0x0000617f) on `this + 0x28`',
  );
}

/** External `__ZN13OZChannelImplD2Ev` — `OZChannelImpl::~OZChannelImpl()` (base dtor). Invoked
 *  as tail-jmp by D1 (@0x0000616d) and direct call by D0 (@0x00006187). Not yet transcribed. */
function OZChannelImpl_dtor(_self: OZChannelAspectRatioImpl): void {
  throw new Error(
    'OZChannelImpl::~OZChannelImpl() @ProChannel ' +
      '(__ZN13OZChannelImplD2Ev) not yet transcribed — invoked by ' +
      'OZChannelAspectRatioImpl D1 (tail-jmp @0x0000616d) and ' +
      'D0 (direct call @0x00006187)',
  );
}

/** External `__ZdlPv` — `operator delete(void*)`. Invoked as tail-jmp by D0 only
 *  (@0x00006195). Not yet transcribed: frees the object memory. */
function operator_delete(_self: OZChannelAspectRatioImpl): void {
  throw new Error(
    'operator delete(void*) @ProChannel stub 0xace04 ' +
      '(__ZdlPv) not yet transcribed — tail-jmp by ' +
      'OZChannelAspectRatioImpl D0 @0x00006195',
  );
}

/**
 * OZChannelAspectRatioImpl — the per-channel Impl sidecar for OZChannelAspectRatio.
 * Derives from OZChannelImpl (not modelled in TS yet — its dtor is a frontier throw).
 *
 * TS does NOT extend an `OZChannelImpl` base class here: the base's fields are unknown to us
 * (its ctor is un-decoded), so extending would create empty/undefined slots that make the
 * mirror-write pattern from the derived ctor path unfaithful. We only model what BOTH
 * disassembled dtors touch: the +0x28 `PCSingleton` member. This matches the OZChannelAspectRatio
 * convention: derived-class TS carries only what the disasm proves.
 */
export class OZChannelAspectRatioImpl {
  /** `PCSingleton` member at C++ offset +0x28. Destroyed unconditionally by both D1
   *  (@0x00006152 → call @0x0000615f) and D0 (@0x00006172 → call @0x0000617f) via
   *  `PCSingleton::~PCSingleton()`. Its constructor is not in the D1/D0 disasm and
   *  is not modelled here — only its byte offset and dtor call are proven. */
  singletonMember!: unknown;

  /**
   * OZChannelAspectRatioImpl::~OZChannelAspectRatioImpl() @0x00006152 (D1 — base destructor).
   *
   * Faithful transcription (raw-port/re/disasm/ProChannel.OZChannelAspectRatioImpl.D1.s):
   *   @0x6152 pushq %rbp                                — frame setup
   *   @0x6153 movq  %rsp, %rbp
   *   @0x6156 pushq %rbx                                — save callee-saved
   *   @0x6157 pushq %rax                                — 16-byte align (scratch)
   *   @0x6158 movq  %rdi, %rbx                          — this -> rbx
   *   @0x615b addq  $0x28, %rdi                         — rdi = this + 0x28 (PCSingleton member)
   *   @0x615f callq PCSingleton::~PCSingleton()         — destroys +0x28 member
   *   @0x6164 movq  %rbx, %rdi                          — rdi = this (restore)
   *   @0x6167 addq  $0x8, %rsp                          — undo align push
   *   @0x616b popq  %rbx                                — restore callee-saved
   *   @0x616c popq  %rbp
   *   @0x616d jmp   OZChannelImpl::~OZChannelImpl()     — tail-call base dtor
   */
  destroyBase(): void {
    // @0x615b + @0x615f — destroy the +0x28 PCSingleton member.
    PCSingleton_dtor(/* &this.singletonMember (this + 0x28) */ this);
    // @0x616d — tail-jmp to base dtor. In TS, model as a call in tail position.
    OZChannelImpl_dtor(this);
  }

  /**
   * OZChannelAspectRatioImpl::~OZChannelAspectRatioImpl() @0x00006172 (D0 — deleting destructor).
   *
   * Faithful transcription (raw-port/re/disasm/ProChannel.OZChannelAspectRatioImpl.~OZChannelAspectRatioImpl.s):
   *   @0x6172 pushq %rbp                                — frame setup
   *   @0x6173 movq  %rsp, %rbp
   *   @0x6176 pushq %rbx                                — save callee-saved
   *   @0x6177 pushq %rax                                — 16-byte align (scratch)
   *   @0x6178 movq  %rdi, %rbx                          — this -> rbx
   *   @0x617b addq  $0x28, %rdi                         — rdi = this + 0x28 (PCSingleton member)
   *   @0x617f callq PCSingleton::~PCSingleton()         — destroys +0x28 member (same as D1)
   *   @0x6184 movq  %rbx, %rdi                          — rdi = this
   *   @0x6187 callq OZChannelImpl::~OZChannelImpl()     — DIRECT call to base dtor
   *   @0x618c movq  %rbx, %rdi                          — rdi = this (restore for delete)
   *   @0x618f addq  $0x8, %rsp                          — undo align push
   *   @0x6193 popq  %rbx                                — restore callee-saved
   *   @0x6194 popq  %rbp
   *   @0x6195 jmp   operator delete(void*)              — tail-call to free memory
   *
   * D0 differs from D1 in TWO places: (1) OZChannelImpl::~OZChannelImpl is a direct call, not a
   * tail-jmp, because (2) `operator delete(this)` runs after it as the final tail-jmp.
   */
  destroyAndFree(): void {
    // @0x617b + @0x617f — destroy the +0x28 PCSingleton member.
    PCSingleton_dtor(/* &this.singletonMember (this + 0x28) */ this);
    // @0x6187 — DIRECT call (not tail-jmp): base dtor runs to completion, THEN we delete.
    OZChannelImpl_dtor(this);
    // @0x6195 — tail-jmp to operator delete(this). In TS, model as final call.
    operator_delete(this);
  }
}
