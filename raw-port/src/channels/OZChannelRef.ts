// OZChannelRef — ProChannel's smart-ref helper for OZChannel channels.
//
// This file ONLY transcribes ONE method today: the D1 destructor
// `OZChannelRef::~OZChannelRef()` @ProChannel 0x4abb4. All other members
// (ctor(s), getChannel, setChannel, retain/release, operator=, etc.) are
// SEPARATE ledger units and will be added to this class file as their own
// claims land, per the "one class per file" rule.
//
// Cross-reference: another already-ported file
// (raw-port/src/channels/OZChannelUndo.ts) declares an EXTERN STUB for
// `OZChannelRef::~OZChannelRef()` at the Ozone framework's import stub
// address 0x6dd71c (`OZChannelRef_dtor_stub`). That stub is Ozone's
// PLT-style tail-jmp indirection into ProChannel — it is a SEPARATE
// symbol (Ozone's __stubs section) from the actual body ported here
// (ProChannel's __text @0x4abb4). This file transcribes the real body;
// the Ozone-side stub is a per-framework alias that will be resolved
// when Ozone's linker layer is modelled. Nothing here overlaps or
// conflicts with the OZChannelUndo stub — they are two different
// symbols at two different addresses in two different frameworks.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted
// VAs from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProChannel.__ZN12OZChannelRefD1Ev.s
//
// Full 11-line disassembly of the CLAIMED method (verbatim):
//
//   __ZN12OZChannelRefD1Ev:
//   0x4abb4  pushq   %rbp
//   0x4abb5  movq    %rsp, %rbp
//   0x4abb8  testb   $0x1, (%rdi)                    ; test low bit of *this
//   0x4abbb  jne     0x4abbf                         ; if bit0 set -> free
//   0x4abbd  popq    %rbp
//   0x4abbe  retq                                     ; bit0 clear: no-op
//   0x4abbf  movq    0x10(%rdi), %rdi                ; rdi = this->owned
//   0x4abc3  popq    %rbp
//   0x4abc4  jmp     0xace04                         ## symbol stub for: __ZdlPv
//   0x4abc9  nop
//
// SEMANTIC SUMMARY
//   `OZChannelRef` carries a "tagged ownership" flag in the low bit of
//   its first word:
//     - bit 0 CLEAR at (%rdi) => this ref is a NON-OWNING view; the
//       destructor is a pure no-op (early return @0x4abbe).
//     - bit 0 SET at (%rdi)   => this ref OWNS a heap allocation whose
//       pointer is stored at instance +0x10. The dtor tail-jumps to
//       `operator delete(void*)` on that pointer, freeing the owned
//       block. Nothing else is touched — the ref itself is not scrubbed;
//       Itanium ABI D1 is expected to leave the storage valid-but-empty
//       for the surrounding scope to reclaim.
//
//   This "low-bit flag on the header word + owned pointer at +0x10"
//   pattern is very close to the OZChannelUndo layout documented in the
//   sibling file (raw-port/src/channels/OZChannelUndo.ts) which also
//   holds a "raw-ref | owned-copy" discriminator plus a pointer at +0x08
//   / +0x10. Both use the same style of ownership discipline; the
//   details differ per class.
//
// STRUCT LAYOUT DECODED FROM THIS BODY
//   OZChannelRef instance layout (partial — only what THIS function touches):
//     +0x00  { uint8_t ownsCopy : 1; ... : 7; ... }
//                                   // bit 0 tested @0x4abb8; the rest
//                                   // of the byte and the remaining
//                                   // header bytes are untouched here.
//     +0x08  ... (unknown to this dtor — likely refcount / vtable
//                 pointer / raw channel pointer; separate claims will
//                 extend this layout)
//     +0x10  void* owned          // read @0x4abbf; passed to
//                                   // operator delete. Present only
//                                   // when bit 0 of +0x00 is set.
//
// DEPENDENCIES
//   Direct in-scope callees: NONE. The one tail-jmp target is
//   `__ZdlPv` — libc++ `operator delete(void*)` @ProChannel imported
//   stub 0xace04. TRUE out-of-scope extern (C++ runtime allocator).
//   Modelled as a boundary stub per policy (see PORTING_SPEC.md — same
//   treatment as HGMemory's __Znwm/__ZdlPv callsites).
//
// Symbols ported here (mangled -> address):
//   * __ZN12OZChannelRefD1Ev  —  OZChannelRef::~OZChannelRef()  @ProChannel 0x4abb4
//     (Itanium ABI D1 — complete-object dtor; ordinary destructor).

/**
 * `operator delete(void*)` — the C++ deallocator. Imported by ProChannel
 * at stub @0xace04 (`## symbol stub for: __ZdlPv`). TRUE out-of-scope
 * extern (libc++ runtime; not one of the five FCP frameworks).
 *
 * In this port there is no libc++ allocator, so a faithful raise here
 * is the correct behaviour: any owning dtor reaching this point is
 * asserting that a heap block should be freed, and we cannot honour
 * that without a JS-side allocator model.
 */
function operator_delete_stub(_p: unknown): void {
  throw new Error(
    "operator delete(void*) __ZdlPv @ProChannel imported stub 0xace04 " +
      "(libc++ runtime allocator — TRUE out-of-scope extern; not yet transcribed)",
  );
}

/**
 * A minimal accessor over the tagged "ownership flag" byte at
 * OZChannelRef instance offset +0x00. Only bit 0 is examined by the D1
 * dtor (see body); bits 1..7 of that byte and any surrounding header
 * fields are OPAQUE to this file and will be decoded by other members'
 * claims. We model this as a discrete field pair so the flag test and
 * the owned-pointer load are faithful, without inventing an entire
 * byte-array representation for the struct.
 */
export interface OZChannelRefHeader {
  /** @ProChannel instance +0x00 low bit; tested by D1 dtor @0x4abb8.
   *  Semantics: 1 = OZChannelRef owns the block at +0x10 (dtor must
   *  operator-delete it); 0 = non-owning view (dtor is a no-op). */
  ownsCopy: boolean;

  /** @ProChannel instance +0x10; read only when `ownsCopy === true`
   *  (dtor path @0x4abbf..0x4abc4). Pointer to the heap-allocated
   *  channel copy that this ref owns. The exact type of the pointee is
   *  the responsibility of the OZChannelRef ctor claims (not decoded
   *  here); `unknown` is faithful to what the dtor sees — an opaque
   *  void* on its way to operator delete. */
  owned: unknown;
}

/**
 * `OZChannelRef` — ProChannel smart-ref (partial port).
 *
 * ONLY the D1 destructor is transcribed here. All other members are
 * SEPARATE ledger symbols.
 *
 * Struct layout (partial, decoded from ported members only):
 *   +0x00  ownsCopy flag (low bit of a byte) — tested by D1.
 *   +0x10  owned pointer                     — freed by D1 when owned.
 */
export class OZChannelRef implements OZChannelRefHeader {
  /** @ProChannel instance +0x00 (bit 0). */
  ownsCopy: boolean = false;
  /** @ProChannel instance +0x10. */
  owned: unknown = null;

  /**
   * `OZChannelRef::~OZChannelRef()` @ProChannel 0x4abb4
   * (__ZN12OZChannelRefD1Ev). Itanium ABI D1 (complete-object dtor).
   *
   * Faithful transcription of the 11-line disasm quoted in the file
   * header. Body:
   *
   *   if (this->ownsCopy) {
   *     operator delete(this->owned);   // tail-jmp @0x4abc4
   *   }
   *   // otherwise no-op (early return @0x4abbe)
   */
  destroy(): void {
    // @0x4abb4–0x4abb5: prologue (rbp frame, no callee-saves needed).

    // @0x4abb8:      testb $0x1, (%rdi)   ; test bit 0 of this->{+0x00}.
    // @0x4abbb:      jne   0x4abbf        ; if SET, jump into the free path.
    // @0x4abbd–e:    fall-through -> popq %rbp ; retq (no-op dtor).
    if (!this.ownsCopy) {
      // Non-owning view: nothing to free.
      return;
    }

    // @0x4abbf: movq 0x10(%rdi), %rdi  ; rdi = this->owned (heap pointer).
    // @0x4abc3: popq %rbp              ; tear down the frame BEFORE the tail-jmp.
    // @0x4abc4: jmp  0xace04           ## symbol stub for operator delete(void*).
    //           Tail-call — control never returns here (the jmp is not a
    //           callq). Faithful raising stub — see operator_delete_stub.
    operator_delete_stub(this.owned);
    // (unreachable in the faithful port; the tail-jmp does not return.)
  }
}
