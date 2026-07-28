// raw-port/src/render/HGSynchronizer.ts
//
// FCP `HGSynchronizer` — Helium RAII lock guard. Wraps a pointer to an
// `HGSynchronizable*` at +0x00 with a bool `released` flag at +0x08.
// The destructor unlocks the syncable iff it hasn't already been
// released (early-release pattern via a member function, not decoded
// here because it's not in the class's method list — only the dtor is
// present in the Helium ledger).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGSynchronizer.~HGSynchronizer.s (D1 @0x21b50)
//
// Ledger addresses (Helium.ledger.json):
//   0x21b50  HGSynchronizer::~HGSynchronizer()  [D1]
//
// Full D1 body (12 lines):
//   0x21b50  push rbp; mov rsp,rbp
//   0x21b54  cmpb $0, 0x8(%rdi)                  ; released == 0 ?
//   0x21b58  jne 0x21b62                         ; if released, skip
//   0x21b5a  movq (%rdi), %rdi                   ; load HGSynchronizable*
//   0x21b5d  callq __ZN16HGSynchronizable6UnlockEv
//   0x21b62  pop rbp; ret
//   0x21b64  [landing pad — __clang_call_terminate on unwind]
//
// The ctor is NOT in the ledger — meaning HGSynchronizer is likely
// constructed only inline (i.e. from a template header) so its ctor never
// emits its own external symbol. We CAN'T port the ctor from disasm because
// there is no disasm; we model the field layout observed from the dtor and
// leave `acquire()` as an intended construction pattern.
//
// STRUCT LAYOUT (recovered from dtor byte reads):
//   HGSynchronizer {
//     +0x00  syncable : HGSynchronizable*   (dtor reads (%rdi) and passes to Unlock)
//     +0x08  released : bool                (dtor tests cmpb $0, 0x8(%rdi))
//   }
//   sizeof(HGSynchronizer) = 16 (natural align).

/**
 * Opaque `HGSynchronizable` — declared as an interface with just the
 * `Unlock()` method (`__ZN16HGSynchronizable6UnlockEv`) that the dtor
 * needs. The rest of the class (Lock, TryLock, ...) is not decoded
 * here — HGSynchronizable's own file will supersede this when landed.
 */
export interface HGSynchronizableLike {
  /** `HGSynchronizable::Unlock()` — external symbol,
   *  called from HGSynchronizer::~HGSynchronizer @Helium 0x21b5d. */
  Unlock(): void;
}

/**
 * `HGSynchronizer` — RAII lock-holder over an `HGSynchronizable`.
 *
 * The C++ class is a plain guard: constructing it locks the target,
 * destructing it (or manually calling a release path) unlocks it. Only
 * the destructor is present in the Helium ledger — the constructor is
 * inline-defined, so no external symbol exists. To model both halves
 * faithfully, we expose:
 *   - `destruct()` — the decoded D1 body @0x21b50 (definitive).
 *   - `constructor` — currently a THROW: we cannot ship a ctor body
 *     without disasm of a real symbol. Users of HGSynchronizer in the
 *     port must acquire via inline helpers as FCP does; those inline
 *     helpers will fabricate the two-field state and never call this
 *     JS ctor.
 */
export class HGSynchronizer {
  /** +0x00: syncable pointer. */
  syncable: HGSynchronizableLike | null = null;
  /** +0x08: released flag (0 = still holding lock; 1 = manually released). */
  released: boolean = false;

  /**
   * No dedicated ctor was emitted for HGSynchronizer in Helium (the
   * ledger contains only the destructor). C++ construction is inlined
   * from a header. Because we have no disassembly of a construction
   * body, we throw on direct construction and require callers to use
   * a static `acquire()`-style factory (also currently a throw — the
   * construction pattern must be recovered from an inlined caller
   * before this can be filled in).
   */
  constructor() {
    throw new Error(
      "HGSynchronizer::HGSynchronizer() has no external symbol in Helium (inline-defined; " +
        "not in ledger). Cannot ship a ctor body without a decoded call site. Recover the " +
        "construction pattern from an inlined caller (any function that stack-allocates a " +
        "HGSynchronizer and passes an HGSynchronizable*) before filling this in.",
    );
  }

  /**
   * `HGSynchronizer::~HGSynchronizer()` @Helium 0x21b50 (D1).
   *
   * Body: if `released == 0`, load syncable pointer and call
   * `HGSynchronizable::Unlock()` on it; otherwise skip.
   */
  destruct(): void {
    // @Helium 0x21b54: cmpb $0, 0x8(%rdi)
    // @Helium 0x21b58: jne 0x21b62 (skip unlock if released)
    if (this.released) {
      return;
    }
    // @Helium 0x21b5a: movq (%rdi), %rdi  (load syncable)
    // @Helium 0x21b5d: callq HGSynchronizable::Unlock()
    if (this.syncable !== null) {
      this.syncable.Unlock();
    }
    // (Note: the disasm doesn't guard against a null syncable — that's
    //  a C++ UB path. In TS we defensively skip on null so downstream
    //  test harnesses that stub the field don't hit a spurious throw.
    //  If FCP ever ships a HGSynchronizer with a null syncable field
    //  and hits ~HGSynchronizer without `released=true`, this would
    //  crash in the C++ source — we're strictly-safer here.)
  }
}
