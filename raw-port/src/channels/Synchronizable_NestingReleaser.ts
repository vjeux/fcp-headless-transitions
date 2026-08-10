// Synchronizable_NestingReleaser — nested RAII helper of Flexo's
// `Synchronizable` that RESTORES a previously-saved re-entrant nesting
// state on scope exit. This is the "unlock/release" half of a save/
// restore pair for the syncable's per-instance nesting counters
// (nesting count at +0x50, owning-thread id at +0x48).
//
// This is the Flexo-framework analog of Helium's
// HGSynchronizable::NestingReleaser (see
// raw-port/src/render/HGSynchronizable_NestingReleaser.ts) — the two
// destructors are structurally identical (same field offsets, same
// _pthread_self boundary), differing only in framework/address.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/Flexo.__ZN14Synchronizable15NestingReleaserD1Ev.s
//
// This file ports ONLY the destructor at @0x1303450. Other members of
// NestingReleaser (a ctor and possibly a member function to snapshot
// the state) are separate ledger entries and will be added to this
// same file when their own units are claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D1 body)
// -----------------------------------------------------------------------------
// Synchronizable::NestingReleaser {
//   +0x00  syncable         : Synchronizable*        (read @0x1303459, 0x1303469)
//   +0x08  savedNestingCount: uint64_t               (read @0x130345c;
//                                                     written back to
//                                                     syncable+0x50)
// }
// sizeof(NestingReleaser) = 16 (natural align).
//
// Observed fields of Synchronizable (from write sites in this dtor):
//   +0x48  ownerThreadId    : pthread_t              (dtor stores
//                                                     pthread_self()
//                                                     here @0x130346c)
//   +0x50  nestingCount     : uint64_t               (dtor stores the
//                                                     saved value here
//                                                     @0x1303460)
// (These are internal recursion-state slots, not part of the visible-API
// surface of Synchronizable — the exact two fields the "capture" method of
// NestingReleaser reads.)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _pthread_self  — pthread runtime, called @0x1303464 via Flexo stub
//     0x1497b12. TRUE out-of-scope extern. Returns the current thread's
//     opaque handle; the dtor writes it into syncable->ownerThreadId at
//     +0x48. Modelled as a boundary stub — see pthreadSelf() below.
//   * ___clang_call_terminate — Itanium ABI exception personality tail
//     call at @0x130347a. Reached ONLY on unwind (if the syncable
//     dereference throws — impossible here since we control the JS
//     surface). Not a normal callee; documented for completeness only.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN14Synchronizable15NestingReleaserD1Ev
//       — Synchronizable::NestingReleaser::~NestingReleaser()  @Flexo 0x1303450
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN14Synchronizable15NestingReleaserD1Ev.s)
// -----------------------------------------------------------------------------
//   0x1303450  pushq  %rbp
//   0x1303451  movq   %rsp, %rbp
//   0x1303454  pushq  %rbx                            ; callee-save (holds this)
//   0x1303455  pushq  %rax                            ; align to 16
//   0x1303456  movq   %rdi, %rbx                      ; rbx = this
//   0x1303459  movq   (%rdi), %rax                    ; rax = this->syncable
//   0x130345c  movq   0x8(%rdi), %rcx                 ; rcx = this->savedNestingCount
//   0x1303460  movq   %rcx, 0x50(%rax)                ; syncable->nestingCount = savedNestingCount
//   0x1303464  callq  _pthread_self                   ; rax = pthread_self()
//                                                     ; (Flexo stub 0x1497b12)
//   0x1303469  movq   (%rbx), %rcx                    ; rcx = this->syncable (re-loaded;
//                                                     ; callq clobbered rax)
//   0x130346c  movq   %rax, 0x48(%rcx)                ; syncable->ownerThreadId = pthread_self()
//   0x1303470  addq   $0x8, %rsp                      ; drop the align slot
//   0x1303474  popq   %rbx
//   0x1303475  popq   %rbp
//   0x1303476  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x1303477  movq   %rax, %rdi
//   0x130347a  callq  ___clang_call_terminate         ; terminate on unwind
//   0x130347f  nop

// ═════════════════════════════════════════════════════════════════════════
// The syncable interface — the two fields this dtor writes at +0x48/+0x50.
// The full Synchronizable class is a SEPARATE ledger entry; here we expose
// just the two writable slots the D1 body needs, mirroring how
// HGSynchronizable_NestingReleaser declares a minimal nesting-state shape.
// ═════════════════════════════════════════════════════════════════════════

/**
 * Minimal shape of `Synchronizable` — only the two nesting-state slots that
 * NestingReleaser::~NestingReleaser writes to. The full class lives elsewhere
 * (its own ledger entry); when it lands, this interface is subsumed by a
 * shared declaration.
 */
export interface SynchronizableNestingState {
  /** Synchronizable +0x48 — owning thread id (pthread_t). Written by the
   *  dtor @Flexo 0x130346c. */
  ownerThreadId: unknown;
  /** Synchronizable +0x50 — recursive-nesting counter. Written by the dtor
   *  @Flexo 0x1303460 with the value saved at construction. */
  nestingCount: bigint;
}

/**
 * `_pthread_self()` — pthread runtime extern. Called @Flexo 0x1303464 via
 * stub 0x1497b12. TRUE out-of-scope extern (libSystem.dylib / libpthread).
 *
 * In a real x86_64 process this returns the current thread's opaque
 * pthread_t handle. There is no equivalent in JS's single-thread model — we
 * CANNOT fabricate a plausible synthetic value because the port has no
 * thread runtime to disambiguate callers. Faithful port: throw at the
 * boundary with the exact call-site @0xADDR, mirroring the standard
 * frontier-stub policy applied to __call_once, operator new, etc. elsewhere
 * in this codebase (and to _pthread_self in HGSynchronizable_NestingReleaser).
 */
function pthreadSelf(): unknown {
  throw new Error(
    "_pthread_self (libpthread) — TRUE out-of-scope extern called from " +
      "Synchronizable::NestingReleaser::~NestingReleaser @Flexo 0x1303464 " +
      "via Flexo stub 0x1497b12. No pthread runtime exists in the JS port; " +
      "callers that need thread-identity semantics (per-syncable nesting) " +
      "must be exercised behind a boundary policy — this stub raises at the " +
      "call site so a real caller surfaces the missing runtime rather than " +
      "silently returning a bogus id that would then be compared against " +
      "future pthread_self() returns.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `Synchronizable::NestingReleaser` — RAII helper that RESTORES the saved
 * (nestingCount, ownerThreadId) pair of a Synchronizable on scope exit.
 * Constructed at the top of a critical section (captures the current pair),
 * destroyed at the bottom (writes the pair back).
 *
 * Only the destructor is ported in this file (the ctor is a separate ledger
 * entry). Fields are modelled per the layout observed from the D1 body — see
 * the file header.
 */
export class Synchronizable_NestingReleaser {
  /** +0x00 — the syncable whose nesting state we own the restoration of. */
  syncable: SynchronizableNestingState | null = null;
  /** +0x08 — the pre-critical-section nesting count that ~NestingReleaser
   *  writes back to syncable->nestingCount at +0x50. */
  savedNestingCount: bigint = 0n;

  /**
   * `Synchronizable::NestingReleaser::~NestingReleaser()` —
   * @Flexo 0x1303450 (__ZN14Synchronizable15NestingReleaserD1Ev).
   *
   * Faithful line-for-line transcription of the disassembly quoted in the
   * file header. Restores the syncable's nesting state:
   *
   *   1. rax = this->syncable                               @0x1303459
   *   2. rcx = this->savedNestingCount                      @0x130345c
   *   3. syncable->nestingCount [+0x50] = savedNestingCount @0x1303460
   *   4. rax = _pthread_self()                              @0x1303464
   *   5. rcx = this->syncable  (re-loaded post-call)        @0x1303469
   *   6. syncable->ownerThreadId [+0x48] = pthread_self()   @0x130346c
   *   7. return                                             @0x1303476
   *
   * The unwind landing pad @0x1303477..0x130347a is unreachable here — it
   * exists only to satisfy the Itanium C++ exception ABI (call
   * ___clang_call_terminate if any interior op unwinds). Since none of the
   * JS operations here can throw except pthreadSelf (which we let
   * propagate), we don't model it.
   */
  destruct(): void {
    // @0x1303450..0x1303456 — prologue + rbx = this.
    // @0x1303459 — rax = this->syncable
    // @0x130345c — rcx = this->savedNestingCount
    // (Native code assumes non-null this->syncable — the ctor establishes
    //  that invariant. A caller that violates it would segfault in the
    //  binary; here it hits TS's strict-null trap when we access
    //  sync.nestingCount below, the closest faithful match to native UB.)
    const sync = this.syncable!;
    const savedNesting = this.savedNestingCount;
    // @0x1303460 — syncable->nestingCount = savedNestingCount
    sync.nestingCount = savedNesting;
    // @0x1303464 — callq _pthread_self (Flexo stub 0x1497b12)
    const tid = pthreadSelf();
    // @0x1303469 — rcx = this->syncable (re-loaded; the callq clobbered rax
    //             so the compiler re-reads from `this` — semantically the
    //             same value as `sync`).
    // @0x130346c — syncable->ownerThreadId = pthread_self()
    sync.ownerThreadId = tid;
    // @0x1303470..0x1303476 — epilogue + retq. Nothing to model.
  }
}
