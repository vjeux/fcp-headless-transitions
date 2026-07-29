// PCSvd_double.ts — the `~PCSvd<double>()` D2 destructor.
//
// This is the base-object destructor for ProCore's SVD (singular value
// decomposition) helper templated on `double`. It releases 8 heap-owned
// arrays held by the object, each managed as a ProCore ref-counted
// array pointer (refcount stored at pointer-4, "real" allocation base
// at pointer-8, elements start at pointer+0).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/__ZN5PCSvdIdED2Ev.s
//
// Symbols ported (mangled → address)
//   * __ZN5PCSvdIdED2Ev
//       — PCSvd<double>::~PCSvd() [D2 base-object dtor] @Ozone 0x898f0
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (TRUE OUT-OF-SCOPE extern — libc++)
// -----------------------------------------------------------------------------
//   * __ZdaPv
//       — operator delete[](void*) — libc++abi. Called (non-tail) from
//         every one of the 8 release blocks via Ozone stub 0x6dfc30.
//         Frees the previously-allocated array. TRUE out-of-scope
//         extern.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (recovered from the 8 release blocks)
// -----------------------------------------------------------------------------
// PCSvd<double> holds 8 heap arrays whose base pointers live at fixed
// offsets. Each pointer follows the standard ProCore refcounted-array
// convention (visible in every release block):
//
//   pointer_visible: points at element[0]
//   refcount        = *(pointer_visible - 4)   // int32
//   alloc_base      =   pointer_visible - 8    // real malloc/new[] block
//
// Offsets of the 8 pointers within PCSvd<double>, in the exact order the
// destructor releases them:
//
//    +0xC0    (block @0x898f9)
//    +0xA0    (block @0x8991e)
//    +0x88    (block @0x89943)
//    +0x70    (block @0x89968)
//    +0x58    (block @0x89987)
//    +0x38    (block @0x899a6)
//    +0x18    (block @0x899c5)
//    +0x00    (block @0x899e4 — last; reversed control flow but same
//              semantics as the other 7)
//
// The exact meaning of each slot (U/S/V matrices, work buffers, etc.) is
// only decodable from a caller/producer of PCSvd — the destructor alone
// only proves layout, not semantics. That decode is a separate ledger
// unit; this file transcribes only the destructor.
//
// -----------------------------------------------------------------------------
// FULL DISASM SKETCH (see raw-port/re/disasm/__ZN5PCSvdIdED2Ev.s for full)
// -----------------------------------------------------------------------------
//   prologue @0x898f0: push rbp/rbx, sub rsp (rbx = %rdi = this pointer)
//
//   For each field at offsets O ∈ {0xC0, 0xA0, 0x88, 0x70, 0x58, 0x38, 0x18}:
//     ---- release block ----
//       rdi = *(this + O)
//       if (rdi == nullptr) skip
//       if (--*(rdi - 4) != 0) skip       ; refcount != 0, keep alive
//       operator delete[](rdi - 8)         ; free real allocation base
//       *(this + O) = nullptr              ; null out
//
//   Final field at +0x00 uses reversed jumps but is the same semantically:
//     rdi = *(this + 0)
//     if (rdi == nullptr) goto epilogue      ; @0x899ea: je 0x899f1
//     if (--*(rdi - 4) == 0) goto free_block ; @0x899ef: je 0x899f8
//     goto epilogue                          ; refcount != 0
//   free_block @0x899f8:
//     operator delete[](rdi - 8)
//     *(this + 0) = nullptr
//     fallthrough to epilogue
//
//   epilogue @0x899f1 or @0x89xxx: add rsp, pop rbx/rbp, retq
//
// -----------------------------------------------------------------------------

// ═════════════════════════════════════════════════════════════════════════
// Types
// ═════════════════════════════════════════════════════════════════════════

/**
 * A ProCore refcounted heap array of doubles. The visible pointer
 * (`elements`) points at element 0; a 4-byte refcount lives immediately
 * before it, and the true allocation base is 8 bytes earlier. All 8
 * PCSvd<double> arrays follow this convention.
 *
 * The port models the layout explicitly so ~PCSvd can decrement the
 * refcount, detect zero, and free the real allocation base — matching
 * the disasm without fabricating a raw byte offset scheme.
 */
export interface RefCountedDoubleArray {
  /** Refcount stored at (elements - 4) in the raw ABI. */
  refCount: number;
  /** The element array itself (elements[0..n-1]). Only present in port
   *  form; the C++ ABI addresses it as (basePtr + 0..). */
  elements: Float64Array;
}

/**
 * `PCSvd<double>` — the 8 heap-owned refcounted array pointers, in the
 * order the destructor releases them. Full field semantics are not
 * decodable from the destructor alone (see file header).
 *
 * All fields are nullable: the destructor checks each for null before
 * doing anything, and a partially-constructed PCSvd may legitimately
 * have unassigned slots (the ctor is a separate ledger unit).
 */
export interface PCSvd_double {
  /** +0x00 — released LAST, using a reversed-jump code shape. */
  field_00: RefCountedDoubleArray | null;
  /** +0x18 */
  field_18: RefCountedDoubleArray | null;
  /** +0x38 */
  field_38: RefCountedDoubleArray | null;
  /** +0x58 */
  field_58: RefCountedDoubleArray | null;
  /** +0x70 */
  field_70: RefCountedDoubleArray | null;
  /** +0x88 */
  field_88: RefCountedDoubleArray | null;
  /** +0xA0 */
  field_A0: RefCountedDoubleArray | null;
  /** +0xC0 — released FIRST. */
  field_C0: RefCountedDoubleArray | null;
}

// ═════════════════════════════════════════════════════════════════════════
// Frontier extern (libc++abi — TRUE OUT-OF-SCOPE)
// ═════════════════════════════════════════════════════════════════════════

/** `operator delete[](void*)` (__ZdaPv) — libc++abi. Called from every
 *  one of the 8 release blocks (call-sites @0x8990e, @0x89933, @0x89958,
 *  @0x8997a, @0x89999, @0x899b8, @0x899d7, @0x899fc) via Ozone stub
 *  0x6dfc30. Frees the previously-new[]'d block whose address is
 *  `elements - 8` (the real allocation base). Since JS has no manual
 *  free, we model this as a throw at the boundary — the outer control
 *  flow (`refcount==0 → delete`) is faithfully transcribed and the
 *  throw only fires when the port actually reaches a decref-to-zero,
 *  exactly like the machine. */
function operator_delete_array(_realAllocBase: unknown): void {
  throw new Error(
    "operator delete[] @Ozone stub 0x6dfc30 (called from " +
      "PCSvd<double>::~PCSvd repeated release blocks) not yet " +
      "transcribed — TRUE out-of-scope extern (libc++abi __ZdaPv).",
  );
}

// ═════════════════════════════════════════════════════════════════════════
// Helper: release-one-refcounted-array block (the pattern repeated 7×
// plus a reversed-jump twin at +0x00)
// ═════════════════════════════════════════════════════════════════════════

/**
 * The 6-instruction release block that appears (verbatim, at seven
 * different offsets) throughout ~PCSvd:
 *
 *     rdi = *(this + O)
 *     if (rdi == nullptr) goto skip
 *     rdi[-1].refCount -= 1                 ; decl -0x4(%rdi)
 *     if (rdi[-1].refCount != 0) goto skip  ; jne
 *     rdi = rdi - 8                         ; addq $-0x8, %rdi
 *     operator delete[](rdi)                 ; callq 0x6dfc30
 *     *(this + O) = nullptr                  ; movq $0, O(%rbx)
 *   skip:
 *
 * Returns the new (possibly-nulled) slot value so the caller can write
 * it back into the field.
 */
function releaseRefCountedSlot(
  slot: RefCountedDoubleArray | null,
): RefCountedDoubleArray | null {
  if (slot === null) return null;             // testq %rdi,%rdi; je skip
  slot.refCount = (slot.refCount - 1) | 0;    // decl -0x4(%rdi)
  if (slot.refCount !== 0) return slot;       // jne skip — still alive
  // addq $-0x8, %rdi  — recover the real allocation base for delete[].
  // In the port we just pass the slot itself; the frontier stub throws.
  operator_delete_array(slot);
  return null;                                 // movq $0, O(%rbx) — null out
}

// ═════════════════════════════════════════════════════════════════════════
// The destructor
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCSvd<double>::~PCSvd()` [D2 base-object dtor] — @Ozone 0x898f0
 * (__ZN5PCSvdIdED2Ev).
 *
 * Faithful transcription of the 79-instruction body. Releases 8
 * refcounted double-arrays in the exact ABI order the disasm walks
 * them: +0xC0, +0xA0, +0x88, +0x70, +0x58, +0x38, +0x18, +0x00. Each
 * release is the same "null-check → decref → if-zero delete[]+null-out"
 * pattern (see `releaseRefCountedSlot`). The +0x00 block uses a
 * reversed-jump code layout but has semantics identical to the other
 * seven (see disasm sketch above).
 *
 * The prologue (@0x898f0..0x898f6) saves %rbp/%rbx and stashes `this`
 * into %rbx for use across the calls to operator delete[] (which
 * clobbers %rdi). The epilogue (@0x899f1..0x899f7 or @0x89a08..0x89a0e)
 * pops both saves and returns. Neither has any TS-visible effect.
 */
export function PCSvd_double_dtor(self: PCSvd_double): void {
  // @0x898f0..0x898f6 — prologue (save rbp/rbx, rbx=this). No TS effect.

  // Order: +0xC0 first, +0x00 last — exactly as the disasm walks them.
  self.field_C0 = releaseRefCountedSlot(self.field_C0); // block @0x898f9
  self.field_A0 = releaseRefCountedSlot(self.field_A0); // block @0x8991e
  self.field_88 = releaseRefCountedSlot(self.field_88); // block @0x89943
  self.field_70 = releaseRefCountedSlot(self.field_70); // block @0x89968
  self.field_58 = releaseRefCountedSlot(self.field_58); // block @0x89987
  self.field_38 = releaseRefCountedSlot(self.field_38); // block @0x899a6
  self.field_18 = releaseRefCountedSlot(self.field_18); // block @0x899c5

  // Field +0x00 — reversed-jump code layout (@0x899e4..0x89a0e), same
  // semantics: null-check, decref, if zero delete[]+null-out. Whether
  // the code layout is "skip via jne" or "free via je" is invisible at
  // the source level; the observable state transitions are identical.
  self.field_00 = releaseRefCountedSlot(self.field_00);

  // @0x89a08..0x89a0e (or @0x899f1..0x899f7 on the early-null path) —
  // epilogue. No TS-visible effect.
}
