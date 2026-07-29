// HGSynchronizable_NestingReleaser — nested RAII helper of Helium's
// HGSynchronizable that RESTORES a previously-saved re-entrant nesting
// state on scope exit. This is the "unlock/release" half of a save/
// restore pair for the syncable's per-instance nesting counters
// (nesting count at +0x50, owning-thread id at +0x48).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice;
//             unadjusted VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/Helium.__ZN16HGSynchronizable15NestingReleaserD1Ev.s
//
// This file ports ONLY the destructor at @0x194b20. Other members of
// NestingReleaser (a ctor and possibly a member function to snapshot
// the state) are separate ledger entries and will be added to this
// same file when their own units are claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the D1 body)
// -----------------------------------------------------------------------------
// NestingReleaser {
//   +0x00  syncable         : HGSynchronizable*      (read @0x194b29, 0x194b39)
//   +0x08  savedNestingCount: uint64_t               (read @0x194b2c;
//                                                     written back to
//                                                     syncable+0x50)
// }
// sizeof(NestingReleaser) = 16 (natural align).
//
// Observed fields of HGSynchronizable (from write sites in this dtor):
//   +0x48  ownerThreadId    : pthread_t              (dtor stores
//                                                     pthread_self()
//                                                     here @0x194b3c)
//   +0x50  nestingCount     : uint64_t               (dtor stores the
//                                                     saved value here
//                                                     @0x194b30)
// (These are the SAME two fields the corresponding "capture" method of
// NestingReleaser reads. They are NOT in the visible-API surface of
// HGSynchronizable — they're internal recursion-state slots.)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all TRUE OUT-OF-SCOPE externs)
// -----------------------------------------------------------------------------
//   * _pthread_self  — pthread runtime, called @0x194b34 via Helium stub
//     0x3c559a. TRUE out-of-scope extern. Returns the current thread's
//     opaque handle; the dtor writes it into syncable->ownerThreadId at
//     +0x48. (We model it as a boundary stub — see pthreadSelf() below.)
//   * ___clang_call_terminate — Itanium ABI exception personality tail
//     call at @0x194b4a. Reached ONLY on unwind (if syncable dereference
//     throws — impossible here since we control the JS surface). Not a
//     normal callee; documented for completeness only.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN16HGSynchronizable15NestingReleaserD1Ev
//       — HGSynchronizable::NestingReleaser::~NestingReleaser()
//         @Helium 0x194b20
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN16HGSynchronizable15NestingReleaserD1Ev.s)
// -----------------------------------------------------------------------------
//   0x194b20  pushq  %rbp
//   0x194b21  movq   %rsp, %rbp
//   0x194b24  pushq  %r14                            ; callee-save (unused;
//                                                    ; likely for the
//                                                    ; landing pad)
//   0x194b25  pushq  %rax                            ; align to 16
//   0x194b26  movq   %rdi, %rbx                      ; rbx = this
//   0x194b29  movq   (%rdi), %rax                    ; rax = this->syncable
//   0x194b2c  movq   0x8(%rdi), %rcx                 ; rcx = this->savedNestingCount
//   0x194b30  movq   %rcx, 0x50(%rax)                ; syncable->nestingCount = savedNestingCount
//   0x194b34  callq  _pthread_self                    ; rax = pthread_self()
//                                                    ; (Helium stub 0x3c559a)
//   0x194b39  movq   (%rbx), %rcx                    ; rcx = this->syncable (re-loaded;
//                                                    ; callq clobbered rax)
//   0x194b3c  movq   %rax, 0x48(%rcx)                ; syncable->ownerThreadId = pthread_self()
//   0x194b40  addq   $0x8, %rsp                      ; drop the align slot
//   0x194b44  popq   %rbx
//   0x194b45  popq   %rbp
//   0x194b46  retq
//   ------------ landing pad (unwind path, unreachable normally) ------------
//   0x194b47  movq   %rax, %rdi
//   0x194b4a  callq  ___clang_call_terminate         ; terminate on unwind
//   0x194b4f  nop

// ═════════════════════════════════════════════════════════════════════════
// The syncable interface — the two fields this dtor writes at +0x48/+0x50.
// The full HGSynchronizable class is a SEPARATE ledger entry; here we
// expose just the two writable slots the D1 body needs, mirroring how
// HGSynchronizer.ts declares a minimal HGSynchronizableLike interface.
// ═════════════════════════════════════════════════════════════════════════

/**
 * Minimal shape of `HGSynchronizable` — only the two nesting-state slots
 * that NestingReleaser::~NestingReleaser writes to. The full class
 * lives elsewhere (still `todo` in the ledger); when it lands, this
 * interface is subsumed by a shared declaration. */
export interface HGSynchronizableNestingState {
  /** HGSynchronizable +0x48 — owning thread id (pthread_t). Written by
   *  the dtor @Helium 0x194b3c. */
  ownerThreadId: unknown;
  /** HGSynchronizable +0x50 — recursive-nesting counter. Written by
   *  the dtor @Helium 0x194b30 with the value saved at construction. */
  nestingCount: bigint;
}

/**
 * `_pthread_self()` — pthread runtime extern. Called @Helium 0x194b34
 * via stub 0x3c559a. TRUE out-of-scope extern (libSystem.dylib /
 * libpthread).
 *
 * In a real x86_64 process this returns the current thread's opaque
 * pthread_t handle. There is no equivalent in JS's single-thread model —
 * we CANNOT fabricate a plausible synthetic value because the port has
 * no thread runtime to disambiguate callers. Faithful port: throw at
 * the boundary with the exact call-site @0xADDR, mirroring the standard
 * frontier-stub policy applied to __call_once, operator new, etc.
 * elsewhere in this codebase. */
function pthreadSelf(): unknown {
  throw new Error(
    "_pthread_self (libpthread) — TRUE out-of-scope extern called from " +
      "HGSynchronizable::NestingReleaser::~NestingReleaser @Helium 0x194b34 " +
      "via Helium stub 0x3c559a. No pthread runtime exists in the JS port; " +
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
 * `HGSynchronizable::NestingReleaser` — RAII helper that RESTORES the
 * saved (nestingCount, ownerThreadId) pair of an HGSynchronizable on
 * scope exit. Constructed at the top of a critical section (captures
 * the current pair), destroyed at the bottom (writes the pair back).
 *
 * Only the destructor is ported in this file (the ctor is a separate
 * ledger entry). Fields are modelled per the layout observed from the
 * D1 body — see the file header.
 */
export class HGSynchronizable_NestingReleaser {
  /** +0x00 — the syncable whose nesting state we own the restoration of. */
  syncable: HGSynchronizableNestingState | null = null;
  /** +0x08 — the pre-critical-section nesting count that ~NestingReleaser
   *  writes back to syncable->nestingCount at +0x50. */
  savedNestingCount: bigint = 0n;

  /**
   * `HGSynchronizable::NestingReleaser::~NestingReleaser()` —
   * @Helium 0x194b20 (__ZN16HGSynchronizable15NestingReleaserD1Ev).
   *
   * Faithful line-for-line transcription of the disassembly quoted in
   * the file header. Restores the syncable's nesting state:
   *
   *   1. rax = this->syncable                              @0x194b29
   *   2. rcx = this->savedNestingCount                     @0x194b2c
   *   3. syncable->nestingCount [+0x50] = savedNestingCount @0x194b30
   *   4. rax = _pthread_self()                             @0x194b34
   *   5. rcx = this->syncable  (re-loaded post-call)       @0x194b39
   *   6. syncable->ownerThreadId [+0x48] = pthread_self()  @0x194b3c
   *   7. return                                            @0x194b46
   *
   * The unwind landing pad @0x194b47..0x194b4a is unreachable here —
   * it exists only to satisfy the Itanium C++ exception ABI (call
   * ___clang_call_terminate if any of the interior operations
   * unwinds). Since none of the JS operations here can throw (except
   * pthreadSelf, which we let propagate), we don't model it.
   */
  destruct(): void {
    // @0x194b20..0x194b26 — prologue + rbx = this.
    // @0x194b29 — rax = this->syncable
    // @0x194b2c — rcx = this->savedNestingCount
    // (Native code assumes non-null this->syncable — the ctor
    //  establishes that invariant. A caller that violates it would
    //  segfault in the binary; here it hits TS's strict-null trap when
    //  we access sync.nestingCount below, which is the closest
    //  faithful match to native UB.)
    const sync = this.syncable!;
    const savedNesting = this.savedNestingCount;
    // @0x194b30 — syncable->nestingCount = savedNestingCount
    sync.nestingCount = savedNesting;
    // @0x194b34 — callq _pthread_self (Helium stub 0x3c559a)
    const tid = pthreadSelf();
    // @0x194b39 — rcx = this->syncable (re-loaded; the callq clobbered rax
    //             so the compiler re-reads from `this` — semantically the
    //             same value as `sync`).
    // @0x194b3c — syncable->ownerThreadId = pthread_self()
    sync.ownerThreadId = tid;
    // @0x194b40..0x194b46 — epilogue + retq. Nothing to model.
  }
}
