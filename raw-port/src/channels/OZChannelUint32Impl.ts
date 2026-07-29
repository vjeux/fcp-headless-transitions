// raw-port/src/channels/OZChannelUint32Impl.ts
//
// FCP `OZChannelUint32Impl` — the concrete Impl subclass under an
// `OZChannelUint32` (wired at OZChannelUint32::createOZChannelUint32Impl()
// singleton — see raw-port/src/channels/OZChannelUint32.ts for how the impl
// slot in an OZChannelUint32 defaults to the process-wide _OZChannelUint32Impl
// singleton produced by std::call_once). This class is a leaf destructor
// pair (+ two secondary-base thunks); it adds ONLY a PCSingleton subobject
// at +0x28 to the base OZChannelImpl layout — nothing else is touched by
// any of the four destructor bodies. No math is performed here; the class
// exists so its ctor (not enumerated in this ledger unit) can install a
// second-base vtable slot and its dtor can tear down the embedded
// PCSingleton in place before chaining into `OZChannelImpl::~OZChannelImpl`.
//
// Framework: ProChannel (x86_64 slice; slice offset 0x4000 in the fat FCP.app
// bundle — the raw byte offsets in /tmp/ProChannel.x86_64 line up 1:1 with
// the RVAs quoted below because otool -tV reports them as file VAs).
// Provenance disasm:
//   raw-port/re/disasm/ProChannel.OZChannelUint32Impl.~OZChannelUint32Impl.s
//     (only the D0 body lands there — otool -tV picks the last label with a
//      given source name; the D1 body @0x4590..0x45ab and the two secondary-
//      base thunks @0x45d8..0x45f0 (D1-thunk) and @0x45f6..0x4616 (D0-thunk)
//      are quoted verbatim below and cross-checked against a full
//      `otool -tV /tmp/ProChannel.x86_64` dump.)
// Symbol map: /tmp/ProChannel_symmap.tsv rows
//     __ZN19OZChannelUint32ImplD0Ev  ->  OZChannelUint32Impl::~OZChannelUint32Impl()  (D0 deleting)
//     __ZN19OZChannelUint32ImplD1Ev  ->  OZChannelUint32Impl::~OZChannelUint32Impl()  (D1 non-deleting)
// nm cross-check (`nm -n /tmp/ProChannel.x86_64 | grep OZChannelUint32ImplD`):
//     0x00004590 t __ZN19OZChannelUint32ImplD1Ev
//     0x000045b0 t __ZN19OZChannelUint32ImplD0Ev
//     0x000045d8 t __ZThn40_N19OZChannelUint32ImplD1Ev
//     0x000045f6 t __ZThn40_N19OZChannelUint32ImplD0Ev
// (four distinct symbols at four distinct VAs — no ICF folding here.)
//
// Enumerated methods (ledger unit — 2 base dtors; the two `__ZThn40_...`
// secondary-base-thunk dtors are transcribed as siblings because they are
// what a caller holding a base-1 pointer (OZChannelImpl-typed) sees, but
// they alias the same object identity and share the same tear-down):
//   OZChannelUint32Impl::~OZChannelUint32Impl() [D1 non-deleting]  @ProChannel 0x00004590
//     (__ZN19OZChannelUint32ImplD1Ev)
//   OZChannelUint32Impl::~OZChannelUint32Impl() [D0 deleting]      @ProChannel 0x000045b0
//     (__ZN19OZChannelUint32ImplD0Ev)
//   secondary-base thunks (SIBLING — not in the ledger unit under this class,
//   listed for completeness because the disasm decoded them together):
//     non-virtual thunk to ~OZChannelUint32Impl() [D1]             @ProChannel 0x000045d8
//       (__ZThn40_N19OZChannelUint32ImplD1Ev — thunk adjusts rdi by -0x28)
//     non-virtual thunk to ~OZChannelUint32Impl() [D0]             @ProChannel 0x000045f6
//       (__ZThn40_N19OZChannelUint32ImplD0Ev — thunk adjusts rdi by -0x28)
//   ("Thn40" is decimal 40 = 0x28; the thunks use `leaq -0x28(%rdi), %rbx`
//    @0x45de / 0x45fc, matching the PCSingleton offset — the class has a
//    secondary base that shares storage with the PCSingleton subobject.)
//
// STRUCT LAYOUT (recovered from all four dtor bodies — the only fields
// touched are the embedded PCSingleton at +0x28; everything else is
// inherited from OZChannelImpl and destructed by its base dtor):
//   +0x00..+0x28  OZChannelImpl base subobject (opaque here; owns the vptr,
//                   curve*/value/uint/bool fields per the sibling ports —
//                   see the OZChannelDecibel createOZChannelDecibelImpl
//                   lambda decode and OZChannelAngleImpl.ts).
//   +0x28..+0x38  PCSingleton subobject (16 bytes; the D1 body tears it
//                   down in place @0x459d by calling __ZN11PCSingletonD2Ev
//                   on `this + 0x28`, then tail-jmps into
//                   OZChannelImpl::~OZChannelImpl on `this`). Layout of
//                   PCSingleton itself is decoded in the ProCore family.
//
// Cross-framework references (all resolved from the disasm + resolve.py):
//   __ZN11PCSingletonD2Ev                       @ ProCore, via ProChannel __stubs 0xacb4c
//                                                  (resolve.py ProChannel stub 0xacb4c
//                                                   -> slot 9868 = __ZN11PCSingletonD2Ev)
//                                                  -- PCSingleton::~PCSingleton()
//                                                  called @0x459d (D1) and @0x45bd (D0)
//                                                  and @0x45e2 (D1-thunk) and @0x4600 (D0-thunk).
//   __ZN13OZChannelImplD2Ev                     @ ProChannel (extern label — otool -tV
//                                                  reports it as a direct `callq` / `jmp`,
//                                                  not a stub, so it lives in the same
//                                                  slice; not yet enumerated in the
//                                                  ledger as a dedicated class port)
//                                                  -- OZChannelImpl::~OZChannelImpl()
//                                                  tail-jmp target @0x45ab (D1) and @0x45f0
//                                                  (D1-thunk); direct callq @0x45c5 (D0)
//                                                  and @0x4608 (D0-thunk).
//   __ZdlPv                                     @ ProChannel __stubs 0xace04
//                                                  (resolve.py ProChannel stub 0xace04
//                                                   -> slot 9998 = __ZdlPv)
//                                                  -- operator delete(void*) tail-jmp
//                                                  target @0x45d3 (D0) and @0x4616 (D0-thunk).
//
// FULL DISASM (all four bodies quoted verbatim from otool -tV of
// /tmp/ProChannel.x86_64; the ranges cross-checked against
// raw-port/re/disasm/ProChannel.OZChannelUint32Impl.~OZChannelUint32Impl.s
// and the nm -n table above):
//
// D1  @0x4590 __ZN19OZChannelUint32ImplD1Ev:
//   0x4590  pushq  %rbp
//   0x4591  movq   %rsp, %rbp
//   0x4594  pushq  %rbx
//   0x4595  pushq  %rax                        ; 16-byte stack pad
//   0x4596  movq   %rdi, %rbx                  ; save this
//   0x4599  addq   $0x28, %rdi                 ; rdi = this + 0x28 (PCSingleton subobject)
//   0x459d  callq  __ZN11PCSingletonD2Ev       ; PCSingleton::~PCSingleton(this+0x28)
//                                              ; (stub @0xacb4c)
//   0x45a2  movq   %rbx, %rdi                  ; rdi = this
//   0x45a5  addq   $0x8, %rsp                  ; epilogue
//   0x45a9  popq   %rbx
//   0x45aa  popq   %rbp
//   0x45ab  jmp    __ZN13OZChannelImplD2Ev     ; TAIL-JMP OZChannelImpl::~OZChannelImpl(this)
//
// D0  @0x45b0 __ZN19OZChannelUint32ImplD0Ev:
//   0x45b0  pushq  %rbp
//   0x45b1  movq   %rsp, %rbp
//   0x45b4  pushq  %rbx
//   0x45b5  pushq  %rax                        ; 16-byte stack pad
//   0x45b6  movq   %rdi, %rbx                  ; save this
//   0x45b9  addq   $0x28, %rdi                 ; rdi = this + 0x28 (PCSingleton subobject)
//   0x45bd  callq  __ZN11PCSingletonD2Ev       ; PCSingleton::~PCSingleton(this+0x28)
//   0x45c2  movq   %rbx, %rdi                  ; rdi = this
//   0x45c5  callq  __ZN13OZChannelImplD2Ev     ; OZChannelImpl::~OZChannelImpl(this)
//   0x45ca  movq   %rbx, %rdi                  ; rdi = this (for the tail-jmp below)
//   0x45cd  addq   $0x8, %rsp                  ; epilogue
//   0x45d1  popq   %rbx
//   0x45d2  popq   %rbp
//   0x45d3  jmp    __ZdlPv                     ; TAIL-JMP operator delete(this)  (stub @0xace04)
//
// D1-thunk  @0x45d8 __ZThn40_N19OZChannelUint32ImplD1Ev:
//   0x45d8  pushq  %rbp
//   0x45d9  movq   %rsp, %rbp
//   0x45dc  pushq  %rbx
//   0x45dd  pushq  %rax                        ; 16-byte stack pad
//   0x45de  leaq   -0x28(%rdi), %rbx           ; rbx = this - 0x28 (adjust from secondary
//                                              ;                    base back to primary; the
//                                              ;                    secondary base begins at
//                                              ;                    OZChannelUint32Impl + 0x28)
//   0x45e2  callq  __ZN11PCSingletonD2Ev       ; rdi is UNCHANGED here — the thunk feeds the
//                                              ;   incoming secondary-base pointer (which
//                                              ;   already POINTS AT the PCSingleton subobject)
//                                              ;   straight into PCSingleton::~PCSingleton.
//                                              ;   (stub @0xacb4c)
//   0x45e7  movq   %rbx, %rdi                  ; rdi = adjusted primary-base this
//   0x45ea  addq   $0x8, %rsp                  ; epilogue
//   0x45ee  popq   %rbx
//   0x45ef  popq   %rbp
//   0x45f0  jmp    __ZN13OZChannelImplD2Ev     ; TAIL-JMP OZChannelImpl::~OZChannelImpl(primary)
//   0x45f5  nop
//
// D0-thunk  @0x45f6 __ZThn40_N19OZChannelUint32ImplD0Ev:
//   0x45f6  pushq  %rbp
//   0x45f7  movq   %rsp, %rbp
//   0x45fa  pushq  %rbx
//   0x45fb  pushq  %rax                        ; 16-byte stack pad
//   0x45fc  leaq   -0x28(%rdi), %rbx           ; rbx = this - 0x28 (primary-base adjust)
//   0x4600  callq  __ZN11PCSingletonD2Ev       ; PCSingleton::~PCSingleton(secondary this,
//                                              ;   which IS this+0x28 from primary base's PoV)
//   0x4605  movq   %rbx, %rdi                  ; rdi = adjusted primary-base this
//   0x4608  callq  __ZN13OZChannelImplD2Ev     ; OZChannelImpl::~OZChannelImpl(primary)
//   0x460d  movq   %rbx, %rdi                  ; rdi = adjusted primary-base this
//   0x4610  addq   $0x8, %rsp                  ; epilogue
//   0x4614  popq   %rbx
//   0x4615  popq   %rbp
//   0x4616  jmp    __ZdlPv                     ; TAIL-JMP operator delete(primary)
//                                              ; (stub @0xace04)

// ── frontier stubs for un-ported callees ─────────────────────────────────────────────────────
// Every method throws citing the FCP source address that would need transcription first
// (PORTING_SPEC.md Rule 3 — a loud gap is correct; a plausible guess corrupts everything).

/**
 * PCSingleton::~PCSingleton() — non-deleting (D2/base) destructor of the
 * embedded 16-byte PCSingleton subobject. Lives in ProCore; called through
 * the ProChannel __stubs entry at 0xacb4c (resolve.py stub decode: slot 9868
 * -> __ZN11PCSingletonD2Ev). Invoked with `this + 0x28` from all four
 * OZChannelUint32Impl dtor variants (@0x459d / 0x45bd / 0x45e2 / 0x4600).
 * Not yet transcribed — a plausible teardown here would silently corrupt
 * whatever reference-count / call_once state PCSingleton holds.
 */
function PCSingleton__dtor(_thisPlus0x28: unknown): void {
  throw new Error(
    "PCSingleton::~PCSingleton() @ProCore (via ProChannel stub 0xacb4c) " +
      "not yet transcribed (called from OZChannelUint32Impl dtors @0x459d/0x45bd/0x45e2/0x4600)",
  );
}

/**
 * OZChannelImpl::~OZChannelImpl() — non-deleting base dtor. Lives in the
 * same ProChannel slice as this class (otool -tV renders it as a direct
 * `callq`/`jmp` label, not a stub, so the target is intra-slice). Called
 * with the primary-base `this` from all four OZChannelUint32Impl dtor
 * variants (@0x45ab tail-jmp / 0x45c5 direct / 0x45f0 tail-jmp / 0x4608
 * direct). Not yet enumerated as a dedicated class port.
 */
function OZChannelImpl__dtor(_this: unknown): void {
  throw new Error(
    "OZChannelImpl::~OZChannelImpl() @ProChannel (intra-slice label) " +
      "not yet transcribed (called from OZChannelUint32Impl dtors @0x45ab/0x45c5/0x45f0/0x4608)",
  );
}

/**
 * operator delete(void*) — the C++ heap deallocator (`__ZdlPv`), used by
 * the D0 (deleting) dtor. Lives in libc++ / libsystem; called through the
 * ProChannel __stubs entry at 0xace04 (resolve.py stub decode: slot 9998
 * -> __ZdlPv). Tail-jmp target of both D0 bodies (@0x45d3 and @0x4616).
 * Not yet transcribed here — a JS port has no meaningful operator delete;
 * this stub exists solely so the D0 wrappers below can cite the address.
 */
function operator_delete(_this: unknown): void {
  throw new Error(
    "operator delete(void*) @libcxx (via ProChannel stub 0xace04) " +
      "not yet transcribed (called from OZChannelUint32Impl D0 dtors @0x45d3 and @0x4616)",
  );
}

// ── opaque this-pointer type ─────────────────────────────────────────────────────────────────
/**
 * Structural placeholder for a heap-allocated `OZChannelUint32Impl*`. The
 * dtor bodies never dereference any field on the object other than the
 * PCSingleton subobject at +0x28, which they pass by address to
 * PCSingleton::~PCSingleton — no field READ, only offset arithmetic. So
 * we model `this` as an opaque pointer identity.
 */
export type OZChannelUint32ImplPtr = { readonly __ozChannelUint32Impl: true };

// ── ported dtors ─────────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelUint32Impl::~OZChannelUint32Impl()` [D1 non-deleting]
 * @ProChannel 0x00004590 (symbol __ZN19OZChannelUint32ImplD1Ev).
 *
 * Mirrors the disasm line-for-line: tears down the PCSingleton subobject
 * at `this + 0x28`, then TAIL-JMPS into `OZChannelImpl::~OZChannelImpl(this)`
 * (no delete, because this is the non-deleting variant — the object
 * storage is owned by whoever embeds it).
 *
 * Instruction map:
 *   @0x4590..0x459a  stack frame + `rbx = this`
 *   @0x459d          PCSingleton::~PCSingleton(this + 0x28)   ; stub 0xacb4c
 *   @0x45a2..0x45aa  epilogue, restore `this` into rdi
 *   @0x45ab          tail-jmp OZChannelImpl::~OZChannelImpl(this)
 */
export function OZChannelUint32Impl_D1(_this: OZChannelUint32ImplPtr): void {
  // 0x4599: addq $0x28, %rdi  — PCSingleton subobject address; we pass the
  //         parent `this` through unchanged because our stub is opaque.
  PCSingleton__dtor(_this /* + 0x28 */);
  // 0x45ab: jmp __ZN13OZChannelImplD2Ev  (tail-jmp)
  OZChannelImpl__dtor(_this);
}

/**
 * `OZChannelUint32Impl::~OZChannelUint32Impl()` [D0 deleting]
 * @ProChannel 0x000045b0 (symbol __ZN19OZChannelUint32ImplD0Ev).
 *
 * Same tear-down sequence as D1, then a DIRECT callq into
 * OZChannelImpl::~OZChannelImpl (not tail-jmp — because a real
 * `operator delete(this)` call follows), then a tail-jmp into
 * `operator delete(this)` (stub 0xace04).
 *
 * Instruction map:
 *   @0x45b0..0x45ba  stack frame + `rbx = this`
 *   @0x45bd          PCSingleton::~PCSingleton(this + 0x28)   ; stub 0xacb4c
 *   @0x45c2..0x45c4  rdi = this
 *   @0x45c5          callq OZChannelImpl::~OZChannelImpl(this)
 *   @0x45ca..0x45d2  rdi = this, epilogue
 *   @0x45d3          tail-jmp operator delete(this)           ; stub 0xace04
 */
export function OZChannelUint32Impl_D0(_this: OZChannelUint32ImplPtr): void {
  // 0x45bd
  PCSingleton__dtor(_this /* + 0x28 */);
  // 0x45c5
  OZChannelImpl__dtor(_this);
  // 0x45d3
  operator_delete(_this);
}

/**
 * `non-virtual thunk to OZChannelUint32Impl::~OZChannelUint32Impl()` [D1]
 * @ProChannel 0x000045d8 (symbol __ZThn40_N19OZChannelUint32ImplD1Ev).
 *
 * Compiler-emitted secondary-base thunk. Callers holding a pointer to the
 * secondary base (which begins at OZChannelUint32Impl + 0x28 — exactly the
 * PCSingleton subobject offset, hence "Thn40" = decimal 40 = 0x28) enter
 * here. The thunk feeds the incoming pointer straight into
 * PCSingleton::~PCSingleton (because from the secondary-base PoV that
 * pointer already POINTS AT the PCSingleton subobject), then adjusts back
 * to the primary base (`rbx = rdi - 0x28`) and tail-jmps into
 * `OZChannelImpl::~OZChannelImpl` on the primary base.
 *
 * Instruction map:
 *   @0x45d8..0x45dd  stack frame
 *   @0x45de          rbx = this - 0x28 (primary-base pointer)
 *   @0x45e2          PCSingleton::~PCSingleton(rdi = secondary-base this, unchanged)
 *   @0x45e7..0x45ef  rdi = primary this, epilogue
 *   @0x45f0          tail-jmp OZChannelImpl::~OZChannelImpl(primary this)
 */
export function OZChannelUint32Impl_D1_Thunk40(_secondaryBaseThis: OZChannelUint32ImplPtr): void {
  // 0x45e2: PCSingleton::~PCSingleton — thunk passes the incoming secondary-base
  //         pointer through unchanged (it already IS `this + 0x28` from primary PoV).
  PCSingleton__dtor(_secondaryBaseThis);
  // 0x45f0: tail-jmp OZChannelImpl::~OZChannelImpl with primary-adjusted this.
  //         Opaque pointer identity; the actual -0x28 adjust is a physical-layout
  //         concern that cannot be re-expressed in TS without inventing struct
  //         internals the disasm does not evidence for this class.
  OZChannelImpl__dtor(_secondaryBaseThis /* - 0x28 */);
}

/**
 * `non-virtual thunk to OZChannelUint32Impl::~OZChannelUint32Impl()` [D0]
 * @ProChannel 0x000045f6 (symbol __ZThn40_N19OZChannelUint32ImplD0Ev).
 *
 * Same secondary-base adjust as the D1-thunk, then the same DIRECT callq
 * to OZChannelImpl::~OZChannelImpl (not tail-jmp) followed by a tail-jmp
 * to `operator delete` on the primary base.
 *
 * Instruction map:
 *   @0x45f6..0x45fb  stack frame
 *   @0x45fc          rbx = this - 0x28 (primary-base pointer)
 *   @0x4600          PCSingleton::~PCSingleton(rdi = secondary-base this, unchanged)
 *   @0x4605..0x4607  rdi = primary this
 *   @0x4608          callq OZChannelImpl::~OZChannelImpl(primary this)
 *   @0x460d..0x4615  rdi = primary this, epilogue
 *   @0x4616          tail-jmp operator delete(primary this)          ; stub 0xace04
 */
export function OZChannelUint32Impl_D0_Thunk40(_secondaryBaseThis: OZChannelUint32ImplPtr): void {
  // 0x4600
  PCSingleton__dtor(_secondaryBaseThis);
  // 0x4608
  OZChannelImpl__dtor(_secondaryBaseThis /* - 0x28 */);
  // 0x4616
  operator_delete(_secondaryBaseThis /* - 0x28 */);
}
