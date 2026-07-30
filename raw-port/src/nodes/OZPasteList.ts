// OZPasteList — Ozone's paste-buffer container. Holds two intrusive
// std::list<> heads (both inlined into the object) and a boolean
// flag. The default constructor initializes both list sentinels to
// their canonical empty state (prev = next = &end, size = 0) and
// sets the flag to 1.
//
// Framework: Ozone
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs).
// Disasm:   raw-port/re/disasm/__ZN11OZPasteListC1Ev.s
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (recovered from the 12-instruction default ctor)
// -----------------------------------------------------------------------------
//   +0x00  list1_prev       ; ptr, self-referential @0x1ad5c4 (movq %rdi, (%rdi))
//   +0x08  list1_next       ; ptr, self-referential @0x1ad5c7
//   +0x10  list1_size       ; size_t = 0            @0x1ad5cb (movq $0x0, 0x10(%rdi))
//   +0x18  list2_prev       ; ptr, self-referential @0x1ad5d7 (movq %rax, 0x18(%rdi))
//   +0x20  list2_next       ; ptr, self-referential @0x1ad5db
//   +0x28  list2_size       ; size_t = 0            @0x1ad5df
//   +0x30  flagAt30         ; bool  = 1             @0x1ad5e7 (movb $0x1, 0x30(%rdi))
//
// The two lists are LibCxx std::list<T> heads embedded directly inside the
// container (the head is a 3-word __end_ { __prev_, __next_, __size_ } node
// where an empty list points __prev_ and __next_ back at &__end_). We
// preserve the raw offsets and sentinel shape rather than modelling a full
// JavaScript linked list here — the ELEMENT TYPES of these lists are not
// decoded by the ctor (they show up in members that haven't been ported
// yet). The default-constructed state is what this file provides.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN11OZPasteListC1Ev
//       — OZPasteList::OZPasteList() @Ozone 0x1ad5c0
//       (12-line disasm; sets up two std::list sentinels + 1-byte flag=1.
//        Source: __ZN11OZPasteListC1Ev.s)

/**
 * A LibCxx std::list<> head as a raw 3-word record. `prev` and `next`
 * are opaque handles (pointers into the C++ heap); in JS we model an
 * empty sentinel as an object whose `prev` and `next` point back to
 * itself and whose `size` is 0. Same shape any std::list<T> uses,
 * regardless of the (unknown here) T.
 */
export interface StdListHead {
  /** Prev pointer of the sentinel end-node (self for an empty list). */
  prev: StdListHead | null;
  /** Next pointer of the sentinel end-node (self for an empty list). */
  next: StdListHead | null;
  /** Number of elements currently in the list. */
  size: number;
}

/**
 * Ozone paste buffer.
 *
 * The default-constructed layout is fully recovered from
 * `OZPasteList::OZPasteList()`; other operations (insert/erase/copy)
 * are in as-yet-unported members and are NOT modelled here.
 */
export class OZPasteList {
  /** @Ozone offsets +0x00..+0x18 — inlined std::list head #1. */
  list1: StdListHead;

  /** @Ozone offsets +0x18..+0x30 — inlined std::list head #2. */
  list2: StdListHead;

  /**
   * @Ozone offset +0x30 — a single byte set to 1 by the ctor
   * (`movb $0x1, 0x30(%rdi)`). Its readers live in other, not-yet-
   * decoded, OZPasteList members. We don't invent a name for what
   * the flag gates — modelled as `number` (0..255) so the exact
   * byte width the machine writes is preserved.
   */
  flagAt30: number;

  /**
   * `OZPasteList::OZPasteList()`
   *   — @Ozone 0x1ad5c0
   *   — __ZN11OZPasteListC1Ev
   *
   * Faithful line-for-line transcription of the 12-line disassembly:
   *
   *   0x1ad5c0  pushq  %rbp                        ; frame prologue
   *   0x1ad5c1  movq   %rsp, %rbp
   *
   *   0x1ad5c4  movq   %rdi, (%rdi)                ; list1_prev = &this[+0x00]
   *   0x1ad5c7  movq   %rdi, 0x8(%rdi)             ; list1_next = &this[+0x00]
   *   0x1ad5cb  movq   $0x0, 0x10(%rdi)            ; list1_size = 0
   *
   *   0x1ad5d3  leaq   0x18(%rdi), %rax            ; %rax = &this[+0x18]
   *   0x1ad5d7  movq   %rax, 0x18(%rdi)            ; list2_prev = &this[+0x18]
   *   0x1ad5db  movq   %rax, 0x20(%rdi)            ; list2_next = &this[+0x18]
   *   0x1ad5df  movq   $0x0, 0x28(%rdi)            ; list2_size = 0
   *
   *   0x1ad5e7  movb   $0x1, 0x30(%rdi)            ; flagAt30 = 1
   *
   *   0x1ad5eb  popq   %rbp                        ; frame epilogue
   *   0x1ad5ec  retq
   *   0x1ad5ed  nopl   (%rax)                      ; alignment padding
   *
   * Three sub-statements:
   *
   *   1 & 2. Two std::list<T> sentinel initializations. Each writes
   *      the head's `prev` and `next` pointers to the head's own
   *      address (empty-list canonical form: _end_.__prev_ = &_end_,
   *      _end_.__next_ = &_end_) and zeroes the head's `size` field.
   *      In the machine, the two `movq %rdi/,%rax, offset(%rdi)` pairs
   *      are that self-linking. We reproduce it here by making each
   *      StdListHead refer back to itself.
   *
   *   3. Set the 1-byte flag at +0x30 to 1.
   *
   * Zero in-scope callees, zero externs, no indirect calls — a pure
   * field-init constructor.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN11OZPasteListC1Ev.s (12 lines)
   */
  constructor() {
    // @0x1ad5c4-0x1ad5cb — list1 sentinel: prev=next=self, size=0.
    this.list1 = { prev: null, next: null, size: 0 };
    this.list1.prev = this.list1;
    this.list1.next = this.list1;

    // @0x1ad5d3-0x1ad5df — list2 sentinel: prev=next=self, size=0.
    this.list2 = { prev: null, next: null, size: 0 };
    this.list2.prev = this.list2;
    this.list2.next = this.list2;

    // @0x1ad5e7  movb $0x1,0x30(%rdi)
    this.flagAt30 = 1;
  }
}
