// FFAudioBufferList.ts — raw transcription of the Flexo class
// `FFAudioBufferList`, the concrete subclass of the landed
// `FFAudioBufferListBase` (raw-port/src/channels/FFAudioBufferListBase.ts).
//
// ONE symbol is transcribed in this file — the D1 destructor. Every other
// member of the class is a SEPARATE ledger unit and is NOT ported here; do not
// add them without their own disassembly and address citations. The class's
// vtable, recovered with `raw-port/army/tools/vtable.py Flexo FFAudioBufferList`
// (vtable@0x19217e8, installed-ptr 0x19217f8), for orientation only:
//   *0x00 -> 0x1255e90  ~FFAudioBufferList()              [D1]  <-- ported here
//   *0x08 -> 0x1255ef0  ~FFAudioBufferList()              [D0 deleting]
//   *0x10 -> 0x1256070  allocateBufferListMemory(unsigned long)
//   *0x18 -> 0x12560c0  allocateBufferDataMemory(unsigned long)
//   *0x20 -> 0x1256110  deallocateBufferListMemory()
//   *0x28 -> 0x1256140  deallocateBufferDataMemory()
// Those four are exactly the slots the landed base file records as UNFILLED in
// the base vtable — "pure-virtual hooks the DERIVED class must fill" — so this
// vtable dump is independent confirmation that FFAudioBufferList is that
// derived class.
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file:
//   @0x1255e90  FFAudioBufferList::~FFAudioBufferList()   [D1]
//                 __ZN17FFAudioBufferListD1Ev
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN17FFAudioBufferListD1Ev Flexo`):
//   raw-port/re/disasm/Flexo.__ZN17FFAudioBufferListD1Ev.s (26 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x1255e90  pushq %rbp                    ; frame setup (no TS counterpart)
//   0x1255e91  movq  %rsp, %rbp
//   0x1255e94  pushq %rbx
//   0x1255e95  pushq %rax                    ; 8-byte stack align, not a value
//   0x1255e96  movq  %rdi, %rbx              ; rbx = this
//   0x1255e99  leaq  0x6cb958(%rip), %rax    ; = 0x1255ea0 + 0x6cb958 = 0x19217f8
//   0x1255ea0  movq  %rax, (%rdi)            ; install the DERIVED vtable
//   0x1255ea3  movq  0x68(%rdi), %rdi        ; rdi = this->bufferDataMemory
//   0x1255ea7  testq %rdi, %rdi
//   0x1255eaa  je    0x1255eb9               ; NULL -> skip both the free AND
//                                            ;   the store that follows it
//   0x1255eac  callq _ZdaPv                  ; operator delete[](void*)
//                                            ;   @stub 0x14973fe
//   0x1255eb1  movq  $0x0, 0x68(%rbx)        ; ...and null the slot
//   0x1255eb9  movq  0x58(%rbx), %rdi        ; rdi = this->bufferListMemory
//   0x1255ebd  testq %rdi, %rdi
//   0x1255ec0  je    0x1255ecf
//   0x1255ec2  callq _ZdaPv                  ; operator delete[](void*)
//   0x1255ec7  movq  $0x0, 0x58(%rbx)
//   0x1255ecf  leaq  0x6cb8e2(%rip), %rax    ; = 0x1255ed6 + 0x6cb8e2 = 0x19217b8
//   0x1255ed6  movq  %rax, (%rbx)            ; install the BASE vtable
//   0x1255ed9  movq  $0x0, 0x28(%rbx)        ; mBufferList = nullptr
//   0x1255ee1  addq  $0x8, %rsp
//   0x1255ee5  popq  %rbx
//   0x1255ee6  popq  %rbp
//   0x1255ee7  retq
//   0x1255ee8  nopl  (%rax,%rax)             ; alignment padding, not executed
//
// ---------------------------------------------------------------------------
// THE TAIL IS THE INLINED BASE DESTRUCTOR
// ---------------------------------------------------------------------------
// The last two stores are not part of this class's own cleanup: installing the
// BASE vtable at 0x19217b8 and zeroing +0x28 IS `~FFAudioBufferListBase()`,
// inlined. The landed base file names both facts independently — it records
// the base installed-ptr as 0x19217b8 (from its ctor's `leaq 0x6cbf8d(%rip)`
// @0x1255824) and +0x28 as `mBufferList`, "allocated CoreAudio buffer list,
// null between teardown/setup". This port therefore does NOT invent a name for
// +0x28; it reuses the base's, and models the tail as the base-destructor step
// it is.
//
// TWO VTABLE STORES, IN ORDER, AND BOTH ARE TRANSCRIBED. Only the second is
// visible once the destructor returns, so a port that skipped the first would
// leave identical memory behind. It is transcribed anyway because the sequence
// is what the machine does: during a derived destructor the object's dynamic
// type really is the derived one, and any virtual call made in between would
// dispatch through 0x19217f8. Modelling only the end state would be modelling
// the outcome instead of the function.
//
// ---------------------------------------------------------------------------
// THE NULL CHECKS GUARD THE STORE, NOT JUST THE FREE
// ---------------------------------------------------------------------------
// `je 0x1255eb9` @0x1255eaa jumps PAST both the `callq` and the
// `movq $0x0, 0x68(%rbx)`. So when the slot is already NULL the machine does
// not write to it at all. That distinction is unobservable in memory — storing
// zero over zero changes nothing — and the oracle says so explicitly rather
// than pretending to have tested it: the corresponding negative control is
// PROVABLY EQUIVALENT and is reported as such (see below). The port still
// writes the branch the way the binary has it.
//
// ---------------------------------------------------------------------------
// LAYOUT — only what THIS body observes
// ---------------------------------------------------------------------------
//   +0x00  void*  vtable            — written twice (derived, then base)
//   +0x28  AudioBufferList* mBufferList — zeroed by the inlined base dtor;
//                                    named by the landed base file, not here
//   +0x58  void*  (array, `delete[]`) — freed and nulled when non-NULL
//   +0x68  void*  (array, `delete[]`) — freed and nulled when non-NULL
// The two pointer slots are freed with `operator delete[]`, NOT `delete`, so
// each is an ARRAY allocation. Their element types are not observable from
// this body and are not named here; the four allocate/deallocate vtable slots
// listed above are their writers and are separate units. Nothing else in the
// object is touched — confirmed live, byte by byte.
//
// CALLEES: one, `operator delete[](void*)` (`__ZdaPv`, @stub 0x14973fe), which
// is libc++ and a true out-of-scope extern under DEP_WORKER_BRIEF. It is
// called, not stubbed away: the port routes it through a named
// `operator_delete_array` boundary function so the two call sites stay visible
// and cite their addresses. `depgraph.py deps __ZN17FFAudioBufferListD1Ev`
// reports no in-scope callees.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live destructor
// ---------------------------------------------------------------------------
// raw-port/re/oracle/FFAudioBufferList_dtor_oracle.py, under
// `arch -x86_64 /usr/bin/python3`. A destructor returns nothing, so the
// observable is WHICH BYTES OF THE OBJECT CHANGE: the harness poisons a
// 0x100-byte arena with 0xAA, calls the real destructor, and compares the
// byte-level result against what this port's model writes. Both branches are
// exercised for real — the two pointer slots are filled by the process's OWN
// `operator new[]` (`_Znam`), because handing `delete[]` a pointer its
// allocator never produced is heap corruption and a segfaulting harness proves
// nothing. Results (2026-08-11):
//   * byte self-check PASS — `55 48 89 e5 53 50 48 89 fb 48 8d 05 58 b9 6c 00
//     48 89 07`; both vtable displacements were re-read from the machine code
//     and recomputed to 0x19217f8 and 0x19217b8.
//   * 32 trials across all four NULL/non-NULL combinations: 0 divergences.
//   * with both pointers set, the live destructor modifies exactly
//     +0x0..+0x7, +0x28..+0x2f, and the non-zero bytes within +0x58 and +0x68
//     — and nothing else in the 0x100-byte arena.
//   * the final vtable at +0x0 is the BASE 0x19217b8, as the two-store
//     sequence requires.
//   * negative controls: never-installs-the-base-vtable 16/16,
//     zeroes-+0x30-instead-of-+0x28 16/16, does-not-null-+0x68 8/16 (only
//     observable when that slot was set), zeroes-the-whole-object 16/16,
//     treats-the-two-slots-as-one-test 8/16 — and one deliberately retained
//     control, "nulls +0x58 even when it was already NULL", scores 0/16
//     because it is EQUIVALENT BY CONSTRUCTION: it removes a store of zero
//     into a slot the branch condition proved already zero, so no byte can
//     differ. That is the mutant being equivalent, not the harness being
//     blind, and the oracle prints exactly that distinction next to the zero.
//   * NOT claimed: that the blocks were returned to the allocator. The
//     tempting allocate-again-and-check-for-reuse test is not a verdict here —
//     address reuse on this box measured 0, 12, 57 and 64 of 64 across four
//     runs of an earlier harness (OPS_LOG).

/**
 * `operator delete[](void*)` — libc++, `__ZdaPv`, reached through the Flexo
 * stub at 0x14973fe. A true out-of-scope extern: the destructor's only callee.
 *
 * Modelled as a boundary function rather than elided so that the two call
 * sites remain visible in the port and keep their address citations. TypeScript
 * has no manual deallocation, so releasing the reference is all a faithful
 * model can do here; the observable effect the binary leaves behind — the slot
 * being nulled — is performed by the caller, exactly as the machine does it in
 * the separate `movq $0x0` that follows each call.
 *
 * @Flexo 0x14973fe
 */
function operator_delete_array(_p: unknown): void {
  // No TS counterpart to freeing: the runtime owns the memory. The caller
  // performs the store that the binary performs after this call returns.
}

/**
 * The DERIVED vtable installed on entry — `FFAudioBufferList`'s own, at
 * installed-ptr 0x19217f8 (vtable@0x19217e8), from the `leaq 0x6cb958(%rip)`
 * at 0x1255e99 (0x1255ea0 + 0x6cb958).
 *
 * @Flexo 0x19217f8
 */
export const FF_AUDIO_BUFFER_LIST_VTABLE = 0x19217f8; // @Flexo 0x19217f8

/**
 * The BASE vtable installed on the way out — `FFAudioBufferListBase`'s, at
 * installed-ptr 0x19217b8, from the `leaq 0x6cb8e2(%rip)` at 0x1255ecf
 * (0x1255ed6 + 0x6cb8e2). The landed base file cites the same address from
 * that class's own constructor.
 *
 * @Flexo 0x19217b8
 */
export const FF_AUDIO_BUFFER_LIST_BASE_VTABLE = 0x19217b8; // @Flexo 0x19217b8

/**
 * `FFAudioBufferList` — the concrete Flexo audio buffer list, the subclass
 * that fills the four allocate/deallocate hooks the base leaves pure.
 *
 * Only the fields the transcribed destructor touches are modelled here; the
 * rest of the object belongs to the ctor and accessor units.
 *
 * @Flexo 0x1255e90
 */
export class FFAudioBufferList {
  /**
   * (+0x00) The object's vtable pointer. Written twice by the destructor —
   * derived, then base — which is why it is modelled explicitly rather than
   * left implicit in the class identity.
   *
   * @Flexo 0x1255ea0
   */
  vtable_at_0x0: number = FF_AUDIO_BUFFER_LIST_VTABLE;

  /**
   * (+0x28) `mBufferList` — the allocated CoreAudio buffer list. The name is
   * the landed `FFAudioBufferListBase`'s, not a new one: this slot belongs to
   * the base sub-object, and the destructor's zeroing of it @0x1255ed9 is the
   * inlined base destructor.
   *
   * @Flexo 0x1255ed9
   */
  mBufferList_at_0x28: unknown = null;

  /**
   * (+0x58) An array allocation released with `operator delete[]` @0x1255ec2.
   * `delete[]` rather than `delete` is what establishes it is an array; the
   * element type is not observable from this body and is not named here.
   *
   * @Flexo 0x1255eb9
   */
  arrayAt0x58: unknown = null;

  /**
   * (+0x68) A second array allocation, released first, @0x1255eac.
   *
   * @Flexo 0x1255ea3
   */
  arrayAt0x68: unknown = null;

  /**
   * `FFAudioBufferList::~FFAudioBufferList()` [D1] — @Flexo 0x1255e90
   *   __ZN17FFAudioBufferListD1Ev
   *
   * Installs the derived vtable, releases the two `delete[]` arrays (each
   * guarded by its own null test, which guards the following store too), then
   * runs the inlined base destructor: install the base vtable and null
   * `mBufferList`.
   *
   * Faithful transcription; see the file header for the full listing.
   */
  destructor_D1(): void {
    // @0x1255e99/@0x1255ea0 — leaq 0x6cb958(%rip), %rax ; movq %rax, (%rdi):
    // install the DERIVED vtable. Overwritten below, but the machine does it
    // and the object's dynamic type really is derived for the duration.
    this.vtable_at_0x0 = FF_AUDIO_BUFFER_LIST_VTABLE;

    // @0x1255ea3..@0x1255eb1 — movq 0x68(%rdi), %rdi ; testq ; je 0x1255eb9.
    // ZF=1 iff the slot is NULL, and the `je` skips BOTH the free and the
    // store, so a null slot is not written at all.
    if (this.arrayAt0x68 !== null) {
      operator_delete_array(this.arrayAt0x68); // @0x1255eac callq __ZdaPv
      this.arrayAt0x68 = null; // @0x1255eb1 movq $0x0, 0x68(%rbx)
    }

    // @0x1255eb9..@0x1255ec7 — the same shape for the +0x58 slot.
    if (this.arrayAt0x58 !== null) {
      operator_delete_array(this.arrayAt0x58); // @0x1255ec2 callq __ZdaPv
      this.arrayAt0x58 = null; // @0x1255ec7 movq $0x0, 0x58(%rbx)
    }

    // ── inlined ~FFAudioBufferListBase() ──────────────────────────────────
    // @0x1255ecf/@0x1255ed6 — leaq 0x6cb8e2(%rip), %rax ; movq %rax, (%rbx)
    this.vtable_at_0x0 = FF_AUDIO_BUFFER_LIST_BASE_VTABLE;
    // @0x1255ed9 — movq $0x0, 0x28(%rbx)
    this.mBufferList_at_0x28 = null;
  }
}
