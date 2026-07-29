// Synchronizer — Flexo RAII helper (top-level class, unrelated to FFSynchronizer).
// The demangler names it `Synchronizer` (mangled `__ZN12Synchronizer…`) with no
// framework prefix; the referent is likewise the top-level `Synchronizable`
// (mangled `__ZN14Synchronizable…`).  Only its D1 destructor is exported in
// the Flexo dump; the same address handles D1 (this file), the ctor + WaitFor
// (if present) live in separate translation units.
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.Synchronizer.~Synchronizer.s  (@0x36e630)
// Framework: Final Cut Pro / Flexo.framework.
//
// ── STRUCT LAYOUT (recovered from the dtor body only) ─────────────────────
// Synchronizer:
//   +0x00  Synchronizable* sync         // Read `movq (%rdi), %rdi` @0x36e63a
//                                        // before the Unlock call.
//   +0x08  uint8_t         released     // dtor tests `cmpb $0x0, 0x8(%rdi)`
//                                        // @0x36e634 — if this byte is 0 the
//                                        // dtor calls Unlock, otherwise (non-
//                                        // zero = "we already gave the lock
//                                        // back") it skips.  Field name is a
//                                        // best fit matched to the mirroring
//                                        // FFSynchronizer.released convention
//                                        // (identical D1 shape @0x12cd0).
//
// sizeof(Synchronizer) >= 0x9 bytes.  The dtor reads nothing else.
//
// The landing pad @0x36e644 goes to `___clang_call_terminate`, i.e. the dtor
// is noexcept (a throw from Unlock terminates rather than propagating).

/**
 * Opaque handle for the referent of `Synchronizer.sync` (+0x00).  Its
 * `Unlock()` method is decoded in a separate raw-port unit (top-level
 * `Synchronizable`, distinct from `FFSynchronizable`).
 */
export type Synchronizable = { readonly __synchronizable: unique symbol };

/**
 * `Synchronizable::Unlock()` — mangled `__ZN14Synchronizable6UnlockEv`,
 * invoked @Flexo 0x36e63d from the dtor.  Not yet transcribed; separate
 * class' raw-port unit.
 */
function Synchronizable_Unlock(_sync: Synchronizable): void {
  throw new Error(
    "Synchronizer::~Synchronizer: Synchronizable::Unlock @Flexo 0x36e63d " +
      "(mangled __ZN14Synchronizable6UnlockEv) not yet transcribed"
  );
}

/**
 * Faithful transcription of Flexo's top-level `Synchronizer`.  The only
 * decoded method here is the D1 destructor @0x36e630.
 */
export class Synchronizer {
  /** +0x00 — the borrowed Synchronizable this helper will Unlock on scope-exit. */
  readonly sync: Synchronizable;
  /**
   * +0x08 — set truthy by the (undecoded) release/handoff API to suppress
   * the dtor's Unlock; matches FFSynchronizer's `released` convention.
   */
  released: boolean;

  constructor(sync: Synchronizable, released: boolean = false) {
    // Ctor @Flexo not yet transcribed — the address for `Synchronizer::Synchronizer`
    // is not surfaced in the dump for the D1 unit; this shape is inferred from
    // the two-field layout the dtor reads.  A future unit for the ctor will
    // replace this stub if the disassembly reveals additional init.
    this.sync = sync;
    this.released = released;
  }

  /**
   * `Synchronizer::~Synchronizer()` @Flexo 0x36e630 (D1).
   *
   * Body (AT&T; `cmp/sub` are `dst - src`; `jne` = ZF=0 = `dst != src`):
   *   0x36e630  push %rbp
   *   0x36e631  mov  %rsp, %rbp
   *   0x36e634  cmpb $0x0, 0x8(%rdi)         // released == 0 ?
   *   0x36e638  jne  0x36e642                 // if released != 0, skip Unlock
   *   0x36e63a  movq (%rdi), %rdi             // arg = this->sync
   *   0x36e63d  callq Synchronizable::Unlock  // sync->Unlock()
   *   0x36e642  pop  %rbp
   *   0x36e643  ret
   *   0x36e644  (landing pad) mov %rax, %rdi ; call ___clang_call_terminate
   *
   * D1 has no D2 sibling in the dump (only `__ZN12SynchronizerD1Ev` was
   * emitted).  The landing pad @0x36e644 hits `___clang_call_terminate`,
   * i.e. the dtor is noexcept.
   */
  destroy(): void {
    // @0x36e634-@0x36e638 — skip Unlock if `released` is truthy.
    if (this.released) {
      return;
    }
    // @0x36e63a-@0x36e63d — sync->Unlock().
    Synchronizable_Unlock(this.sync);
  }
}
