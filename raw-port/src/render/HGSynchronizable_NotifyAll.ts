// HGSynchronizable_NotifyAll.ts — the `NotifyAll()` member of Helium's
// `HGSynchronizable` recursive-mutex+condvar primitive.
//
// This file follows the same "one method per file" convention already
// established by HGSynchronizable_NestingReleaser.ts on this class (see
// branch port/HGSynchronizable_NestingReleaser). The main class file
// `HGSynchronizable.ts` (branch port/HGSynchronizable, not yet merged
// into main at the time this port was authored) hosts the recursive-lock
// state and Lock() method; each subsequent member has been split into
// its own file to keep the branches independently reviewable and mergeable.
// Reviewer note: once port/HGSynchronizable lands, this file's contents
// can be folded into HGSynchronizable.ts without behaviour change.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/Helium.__ZN16HGSynchronizable9NotifyAllEv.s
//
// Symbols ported (mangled → address)
//   * __ZN16HGSynchronizable9NotifyAllEv
//       — HGSynchronizable::NotifyAll() @Helium 0x194a30
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (TRUE OUT-OF-SCOPE extern — libpthread)
// -----------------------------------------------------------------------------
//   * _pthread_cond_broadcast
//       — pthread_cond_broadcast(pthread_cond_t*) — libSystem/libpthread.
//         Same policy as `_pthread_mutex_lock` / `_pthread_self` in the
//         peer HGSynchronizable::Lock() port. Tail-jumped-to via Helium
//         stub 0x3c5522 @0x194a39.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (used by this method)
// -----------------------------------------------------------------------------
// The `this` pointer arrives in %rdi. Line @0x194a34 (`addq $0x58, %rdi`)
// then advances the pointer by 0x58 bytes. This offset corresponds to
// the condvar field inside HGSynchronizable, laid out (per the peer
// Lock() port at @0x194a40) as:
//
//   struct HGSynchronizable {
//     void*             vptr;              // +0x00
//     pthread_mutex_t   mutex;             // +0x08 (56 bytes on macOS)
//     uint64_t          ownerThreadId;     // +0x48 (pthread_self() words)
//     uint64_t          nestingCount;      // +0x50
//     pthread_cond_t    cond;              // +0x58 <-- passed to broadcast
//     ...
//   };
//
// So `addq $0x58, %rdi` computes `&this->cond`, which is the exact
// argument pthread_cond_broadcast expects (pthread_cond_t*).
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN16HGSynchronizable9NotifyAllEv.s)
// -----------------------------------------------------------------------------
//   0x194a30  pushq  %rbp
//   0x194a31  movq   %rsp, %rbp
//   0x194a34  addq   $0x58, %rdi                       ; rdi = &this->cond
//   0x194a38  popq   %rbp
//   0x194a39  jmp    0x3c5522                          ; tail-jmp
//                                                     ; _pthread_cond_broadcast
//   0x194a3e  nop                                      ; padding

// ═════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════

/**
 * Minimal HGSynchronizable shape needed by this method. Only the `cond`
 * field @+0x58 is touched by NotifyAll (via the `add $0x58, %rdi` +
 * tail-jump). Full class layout lives in HGSynchronizable.ts; this
 * interface deliberately mirrors just the pieces this method observes.
 */
export interface HGSynchronizableCondView {
  /** pthread_cond_t @HGSynchronizable +0x58 — the condvar
   *  pthread_cond_broadcast() acts on. In the C ABI this is a struct;
   *  from the port's perspective it is an opaque handle. */
  cond: PthreadCondT;
}

/** Opaque `pthread_cond_t` handle — TRUE out-of-scope type (libpthread).
 *  Named as an interface so the port can pass it through without
 *  fabricating a real struct layout. */
export interface PthreadCondT {
  readonly __brand: "pthread_cond_t";
}

// ═════════════════════════════════════════════════════════════════════════
// Frontier extern (libpthread — TRUE OUT-OF-SCOPE)
// ═════════════════════════════════════════════════════════════════════════

/** `pthread_cond_broadcast(pthread_cond_t*)` — libpthread/libSystem
 *  extern. Called (tail-jump) from HGSynchronizable::NotifyAll @0x194a39
 *  via Helium stub 0x3c5522. Same treatment as pthread_mutex_lock /
 *  pthread_self in the peer HGSynchronizable::Lock() port. Real
 *  behaviour: wake every thread currently blocked in pthread_cond_wait
 *  on this condvar; return 0 on success. */
function pthread_cond_broadcast(_cond: PthreadCondT): number {
  throw new Error(
    "pthread_cond_broadcast @Helium stub 0x3c5522 (tail-called from " +
      "HGSynchronizable::NotifyAll @0x194a39) not yet transcribed — TRUE " +
      "out-of-scope extern (libpthread / libSystem). Peer treatment: " +
      "raw-port/src/render/HGSynchronizable.ts pthread_mutex_lock / " +
      "pthread_self.",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// The method
// ═════════════════════════════════════════════════════════════════════════

/**
 * `HGSynchronizable::NotifyAll()` — @Helium 0x194a30
 * (__ZN16HGSynchronizable9NotifyAllEv).
 *
 * Faithful line-for-line transcription of the 7-instruction body. The
 * entire method is a one-liner delegator: it advances the `this` pointer
 * to the condvar field (`addq $0x58, %rdi` @0x194a34) and tail-jumps to
 * `pthread_cond_broadcast(&this->cond)`. There is no return value
 * observable at the source level — the tail-jump's return code (int, 0
 * on success) is whatever pthread_cond_broadcast produces.
 *
 * The `pushq %rbp; movq %rsp, %rbp` prologue and matching
 * `popq %rbp; jmp` epilogue are the standard x86-64 tail-call
 * epilogue — they restore the caller's frame pointer before the branch
 * and have no TS-visible effect.
 */
export function HGSynchronizable_NotifyAll(
  self: HGSynchronizableCondView,
): number {
  // @0x194a30..0x194a31 — prologue. No TS-visible effect.
  // @0x194a34 — rdi = this + 0x58 = &this->cond.
  const condPtr = self.cond;
  // @0x194a38..0x194a39 — pop rbp; jmp _pthread_cond_broadcast
  // (tail call). We return its int return code so callers see the
  // same value the machine would have seen from a real tail-jump.
  return pthread_cond_broadcast(condPtr);
}
