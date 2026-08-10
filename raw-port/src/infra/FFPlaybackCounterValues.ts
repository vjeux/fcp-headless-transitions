// FFPlaybackCounterValues.ts — playback-scoped counter snapshot for the FCP Flexo engine.
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at:
//   raw-port/re/disasm/Flexo.__ZN23FFPlaybackCounterValues24getLiveEditsThisPlaybackEv.s
//
// Exported symbol ported here (a trivial int32 field getter):
//   @Flexo 0x0000000000d70530  FFPlaybackCounterValues::getLiveEditsThisPlayback()
//   @Flexo 0x0000000000d6f730  FFPlaybackCounterValues::FFPlaybackCounterValues()  [__ZN23FFPlaybackCounterValuesC1Ev]
//
// Disassembly (verbatim):
//   getLiveEditsThisPlayback @0xd70530:
//     0xd70530  pushq  %rbp
//     0xd70531  movq   %rsp, %rbp
//     0xd70534  movl   0x34(%rdi), %eax   ; eax = *(int32_t*)(this + 0x34)
//     0xd70537  popq   %rbp
//     0xd70538  retq
//   FFPlaybackCounterValues() ctor @0xd6f730:
//     0xd6f730  pushq  %rbp
//     0xd6f731  movq   %rsp, %rbp
//     0xd6f734  leaq   0x48(%rdi), %rax   ; rax = this + 0x48 (addr of embedded list sentinel)
//     0xd6f738  xorps  %xmm0, %xmm0       ; xmm0 = 0
//     0xd6f73b  movups %xmm0, 0x2c(%rdi)  ; zero bytes [0x2c,0x3c)
//     0xd6f73f  movups %xmm0, 0x20(%rdi)  ; zero bytes [0x20,0x30)
//     0xd6f743  movups %xmm0, 0x10(%rdi)  ; zero bytes [0x10,0x20)
//     0xd6f747  movups %xmm0, (%rdi)      ; zero bytes [0x00,0x10)  -> net: [0x00,0x3c) all zero
//     0xd6f74a  movq   %rax, 0x40(%rdi)   ; this->listNext(+0x40) = &sentinel(this+0x48)
//     0xd6f74e  movups %xmm0, 0x48(%rdi)  ; zero the sentinel storage [0x48,0x58)
//     0xd6f752  popq   %rbp
//     0xd6f753  retq
//
// STRUCT LAYOUT (recovered from this accessor + ctor):
//   +0x00 .. +0x3b   zero-initialised counter block (16-byte stores at 0x00,0x10,0x20,0x2c)
//   +0x34  int32_t liveEditsThisPlayback   // read by getLiveEditsThisPlayback @0xd70534 (movl = 32-bit)
//   +0x40  pointer listNext  // set to &(this+0x48) by ctor @0xd6f74a — empty-std::list sentinel head
//   +0x48 .. +0x57   embedded list sentinel storage, zero-initialised @0xd6f74e
//
// NUMERICS: `movl 0x34(%rdi), %eax` is a plain 32-bit load into eax — a signed int32 field. The
// ctor's `movups %xmm0,...` are 16-byte zero stores (no float math). `leaq 0x48(%rdi),%rax` +
// `movq %rax,0x40(%rdi)` models the classic empty-`std::list` where the head's next pointer points
// at the embedded sentinel node. Modelled with JS `number` fields (int32) + a self-referential
// sentinel object for the list head.

/**
 * Per-playback counter snapshot (FCP class `FFPlaybackCounterValues`).
 *
 * The default constructor is exported by Flexo (`__ZN23FFPlaybackCounterValuesC1Ev`
 * @0xd6f730); it zero-initialises the counter block [0x00,0x3c) and sets up an
 * embedded empty `std::list` sentinel at +0x40/+0x48. The int32 accessor reads +0x34.
 */
export class FFPlaybackCounterValues {
  /** @Flexo +0x34 — int32 count of live edits during this playback; read at 0xd70534 (movl). */
  private liveEditsThisPlayback: number;

  /**
   * @Flexo +0x40 — next pointer of the embedded list head. In FCP this is set to
   * `this + 0x48` by the ctor (@0xd6f74a) so a freshly-constructed instance holds an
   * empty doubly-linked list whose head points at its own embedded sentinel storage
   * (+0x48). Modelled as a self-reference to the sentinel object below.
   */
  private listNext: object;

  /**
   * @Flexo +0x48..+0x57 — embedded list sentinel storage, zero-initialised by the
   * ctor (@0xd6f74e). Represented as an empty object the head (+0x40) points at.
   */
  private listSentinel: object;

  /**
   * Default constructor — faithful transcription of `__ZN23FFPlaybackCounterValuesC1Ev`.
   *
   * @Flexo 0x0000000000d6f730  FFPlaybackCounterValues::FFPlaybackCounterValues()
   *
   *   0xd6f734  leaq 0x48(%rdi), %rax   ; rax = &(this+0x48)  (embedded sentinel address)
   *   0xd6f738  xorps %xmm0, %xmm0      ; xmm0 = 0
   *   0xd6f73b  movups %xmm0, 0x2c(%rdi); zero [0x2c,0x3c)
   *   0xd6f73f  movups %xmm0, 0x20(%rdi); zero [0x20,0x30)
   *   0xd6f743  movups %xmm0, 0x10(%rdi); zero [0x10,0x20)
   *   0xd6f747  movups %xmm0, (%rdi)    ; zero [0x00,0x10) -> net [0x00,0x3c) zeroed
   *   0xd6f74a  movq %rax, 0x40(%rdi)   ; this->listNext = &sentinel
   *   0xd6f74e  movups %xmm0, 0x48(%rdi); zero sentinel storage [0x48,0x58)
   */
  constructor() {
    // @0xd6f73b..0xd6f747 — zero the counter block [0x00,0x3c); +0x34 (liveEditsThisPlayback) is
    // part of this zeroed range, so it starts at 0 (int32).
    this.liveEditsThisPlayback = 0;
    // @0xd6f74e — zero the embedded sentinel storage at +0x48.
    this.listSentinel = {};
    // @0xd6f74a — this->listNext(+0x40) = &(this+0x48): empty-list head points at its own sentinel.
    this.listNext = this.listSentinel;
  }


  /**
   * Return the count of live edits made during this playback.
   *
   * @Flexo 0x0000000000d70530  FFPlaybackCounterValues::getLiveEditsThisPlayback()
   *
   *   movl 0x34(%rdi), %eax   ; return *(int32_t*)(this + 0x34)
   */
  getLiveEditsThisPlayback(): number {
    // @0xd70534 movl 0x34(%rdi), %eax — return this->liveEditsThisPlayback (int32)
    return this.liveEditsThisPlayback;
  }
}
