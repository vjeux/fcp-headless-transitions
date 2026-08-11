// OZOpticalFlow__Private__FootageMatchesPred.ts — raw transcription of Ozone
// `OZOpticalFlow::Private::FootageMatchesPred`.
//
// A one-field predicate functor: it captures an `OZFootage const*` so the
// optical-flow analyzer can later ask "is this the same footage?" — the classic
// `std::find_if(..., FootageMatchesPred(footage))` shape, and the footage-keyed
// sibling of the landed `ElementMatchesPred` / `JobIDPred` predicates. ONE
// symbol is transcribed here — the complete-object constructor. The call
// operators and the base-object ctor are SEPARATE ledger units and are NOT
// ported here; do not add them without their own disassembly and address
// citations.
//
// The file is named `Outer__Inner` after the nested class, matching the landed
// convention for nested types (OZOpticalFlow__Private__JobIDPred.ts,
// OZOpticalFlow__Private__ElementMatchesPred.ts,
// OZOpticalFlow__Private__CacheFileHeader.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4ec830  OZOpticalFlow::Private::FootageMatchesPred::FootageMatchesPred(OZFootage const*)
//                __ZN13OZOpticalFlow7Private18FootageMatchesPredC1EPK9OZFootage   [Itanium C1]
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN13OZOpticalFlow7Private18FootageMatchesPredC1EPK9OZFootage Ozone`):
//   raw-port/re/disasm/__ZN13OZOpticalFlow7Private18FootageMatchesPredC1EPK9OZFootage.s (7 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
//   struct FootageMatchesPred {
//     OZFootage const* footage;   // +0x00 — the ONLY field this ctor writes
//                                 //   (`movq %rsi,(%rdi)` @0x4ec834, a 64-bit
//                                 //   pointer store)
//   };
//
// sizeof is 8 (one pointer). Two independent bodies corroborate the layout:
//   * the base-object ctor `__ZN13OZOpticalFlow7Private18FootageMatchesPredC2EPK9OZFootage`
//     @0x4ec820 is a SEPARATELY EMITTED body with the IDENTICAL three
//     instructions (`pushq %rbp ; movq %rsp,%rbp ; movq %rsi,(%rdi)` @0x4ec824).
//     It is its own ledger unit and is NOT ported here; it is cited only as
//     corroboration that the object has no base class and no vtable (neither
//     body writes a vptr, and neither calls anything).
//   * the call operator
//     `__ZNK13OZOpticalFlow7Private18FootageMatchesPredclEPK9OZFootage`
//     @0x4ec840 reads the object back with a single `movq (%rdi),%rbx`
//     @0x4ec849 — the same lone slot at +0x00 and no other field — then
//     null-checks BOTH that captured pointer and its argument
//     (`testq %rsi,%rsi ; sete %al ; testq %rbx,%rbx ; sete %cl ; orb %al,%cl`
//     @0x4ec84c-0x4ec858) before hashing them. That null test is why the
//     captured pointer is modelled as NULLABLE here: the ctor stores whatever
//     it is handed, including nullptr, and the caller-visible behaviour of the
//     predicate depends on it. (Also its own ledger unit — not ported here.)
//
// The pointee `OZFootage` is a DIFFERENT, not-yet-ported ledger unit. This ctor
// never dereferences it — one `movq` moves the argument register into the
// object — so the port declares a branded opaque handle for it, exactly as the
// landed HGMetalContext / OZChannelShearAngle ports do for their unmodelled
// pointee classes, rather than inventing a field layout for a class it has not
// decoded.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect or
// virtual dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `OZFootage` — opaque handle for the footage pointer this predicate captures.
 *
 * The concrete `OZFootage` class is a separate, not-yet-ported ledger unit.
 * This body treats the value strictly as an 8-byte pointer: the ctor's single
 * `movq %rsi,(%rdi)` @Ozone 0x4ec834 copies the argument register into the
 * object without reading a single byte behind it, so an opaque brand is the
 * faithful type. Branded (rather than a bare `object`) so it cannot be silently
 * interchanged with another unmodelled handle.
 *
 * @Ozone 0x4ec834
 */
export interface OZFootage {
  readonly __ozFootage: unique symbol;
}

/**
 * `OZOpticalFlow::Private::FootageMatchesPred` — the captured-footage predicate
 * functor.
 *
 * Only the field this ctor writes is modelled.
 *
 * @Ozone 0x4ec830
 */
export class OZOpticalFlow__Private__FootageMatchesPred {
  /**
   * +0x00 — the captured `OZFootage const*`.
   *
   * Written by the ctor's single `movq %rsi,(%rdi)` @Ozone 0x4ec834. A 64-bit
   * store, so the value is the pointer itself, not a widened scalar. Nullable
   * because the ctor performs no null check and the call operator @0x4ec840
   * explicitly tests this slot for null (`testq %rbx,%rbx ; sete %cl`
   * @0x4ec852) — nullptr is a value this field is expected to hold.
   */
  footage: OZFootage | null = null;

  /**
   * `OZOpticalFlow::Private::FootageMatchesPred::FootageMatchesPred(OZFootage const*)` [C1]
   *   — @Ozone 0x4ec830
   *   — __ZN13OZOpticalFlow7Private18FootageMatchesPredC1EPK9OZFootage
   *
   * Full transcription — every instruction, in order:
   *
   *   0x4ec830  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x4ec831  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x4ec834  movq  %rsi,(%rdi)           ; this->footage = footage (64-bit store)
   *   0x4ec837  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x4ec838  retq
   *   0x4ec839  nopl  (%rax)                ; alignment padding, not executed
   *
   * There is no vtable store (the class is not polymorphic — no
   * `leaq …vtable…(%rip)` appears in the body), no zero-init of any further
   * slot, and no ownership call: the pointer is stored UNRETAINED, a plain
   * 64-bit move with no retain/addRef/`objc_retain` anywhere in the five
   * instructions.
   *
   * @param footage the `OZFootage const*` passed in %rsi (may be nullptr —
   *                the body neither checks nor rejects it).
   */
  constructor(footage: OZFootage | null) {
    // movq %rsi,(%rdi) @0x4ec834 — the only store in the function.
    this.footage = footage;
  }
}
