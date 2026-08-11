// HGCGL__RendererList.ts — Helium HGCGL::RendererList (raw x86_64 port).
//
// NESTED CLASS. Per PORTING_SPEC the file joins the outer and inner names with a
// DOUBLE underscore: `HGCGL::RendererList` -> `HGCGL__RendererList.ts` (the
// convention that stopped two workers filing one class under `_` and `__`).
// The outer class lives in raw-port/src/render/HGCGL.ts and is untouched here.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This unit ports ONE method:
//
//   __ZN5HGCGL12RendererListD1Ev
//     — HGCGL::RendererList::~RendererList()   [D1, complete-object destructor]
//       @Helium 0x14ec60
//
// The D0 (deleting) and D2 (base-object) variants are DIFFERENT symbols and
// separate ledger entries — do not assume this file covers them.
//
// Re-derive with:
//   raw-port/tools/disasm.sh --sym __ZN5HGCGL12RendererListD1Ev Helium
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN5HGCGL12RendererListD1Ev.s — 32 lines)
// -----------------------------------------------------------------------------
//   0x14ec60  pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax  ; frame
//   0x14ec66  movq  %rdi, %rbx            ; rbx = this
//   0x14ec69  movq  (%rdi), %rdi          ; rdi = this->begin        (+0x00)
//   0x14ec6c  nopl  (%rax)                ; alignment pad
//   -- loop head @0x14ec70 --
//   0x14ec70  movq  0x8(%rbx), %rcx       ; rcx = this->end          (+0x08)
//   -- compare @0x14ec74 (the `rax == 0` path re-enters HERE, not above) --
//   0x14ec74  cmpq  %rcx, %rdi            ; begin - end
//   0x14ec77  je    0x14ec97              ; empty -> go free the buffer
//   0x14ec79  movq  -0x8(%rcx), %rax      ; rax = end[-1], the LAST element
//   0x14ec7d  addq  $-0x8, %rcx           ; rcx = end - 1 element (8 bytes)
//   0x14ec81  movq  %rcx, 0x8(%rbx)       ; this->end = rcx          — pop_back
//   0x14ec85  testq %rax, %rax
//   0x14ec88  je    0x14ec74              ; a NULL element is skipped, and the
//                                         ;   loop re-enters at the COMPARE with
//                                         ;   rcx/rdi still live in registers
//   0x14ec8a  movq  %rax, %rdi
//   0x14ec8d  callq __ZdlPv               ; ::operator delete(element)
//   0x14ec92  movq  (%rbx), %rdi          ; RELOAD this->begin
//   0x14ec95  jmp   0x14ec70              ; and re-enter at the head, which also
//                                         ;   RELOADS this->end
//   -- buffer release @0x14ec97 --
//   0x14ec97  testq %rdi, %rdi
//   0x14ec9a  je    0x14ecab              ; no buffer -> nothing to free
//   0x14ec9c  movq  %rdi, 0x8(%rbx)       ; this->end = this->begin
//   0x14eca0  addq $0x8,%rsp ; popq %rbx ; popq %rbp
//   0x14eca6  jmp   __ZdlPv               ; TAIL-CALL ::operator delete(begin)
//   -- empty-buffer exit @0x14ecab --
//   0x14ecab  addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
//
// FRONTIER CALLEES — exactly one, twice: `__ZdlPv` = `::operator delete(void*)`,
// the libc++ global deallocation function. That is a TRUE out-of-scope extern
// (the C++ runtime, not one of the five FCP frameworks), and it is the only call
// in the body; there is no in-scope callee, no indirect call and no virtual
// dispatch (`depgraph.py deps __ZN5HGCGL12RendererListD1Ev` lists nothing).
//
// -----------------------------------------------------------------------------
// WHAT IT IS
// -----------------------------------------------------------------------------
// The generated destructor of a `std::vector<T*>` whose elements are OWNED: it
// pops from the back, `operator delete`-ing each non-null element, then frees the
// element buffer itself. The three-pointer vector header is visible in the two
// offsets it touches:
//   +0x00  T**  begin  — the element buffer
//   +0x08  T**  end    — one past the last live element
// (+0x10, the capacity pointer, is NOT touched by this function, so nothing is
// claimed about it here.)
//
// HOW `operator delete` IS MODELLED. Following the landed convention in
// HGNode.ts's destructor ("`::operator delete(inputSlots[i])` — no-op in TS",
// "free(inputSlots) — no-op in TS"), each deallocation is transcribed as a CITED
// NO-OP: JavaScript is garbage-collected, so returning storage to the allocator
// has no observable counterpart. This is not a silent fallback — every call site
// is marked with its @0xADDR below, and every effect that IS observable (the
// per-element pop, the running `end` update, the final `end = begin`) is
// reproduced exactly. A throwing stub would be wrong here: the binary's
// observable state changes really do happen, and a throw would abandon them
// half-done.
//
// -----------------------------------------------------------------------------
// TWO DETAILS WORTH NOT SMOOTHING OVER
// -----------------------------------------------------------------------------
//   * THE POP HAPPENS BEFORE THE NULL TEST. `this->end` is decremented and
//     STORED (@0x14ec81) before `testq %rax,%rax` (@0x14ec85). So a null element
//     is still popped — it just skips the delete. The loop below keeps that
//     order rather than testing first.
//   * THE TWO RE-ENTRY POINTS DIFFER. After a delete the code jumps to 0x14ec70
//     and re-loads BOTH `end` (@0x14ec70) and `begin` (@0x14ec92) from memory,
//     because `operator delete` is an opaque call that might have touched them.
//     After skipping a null element it jumps to 0x14ec74 instead, keeping the
//     registers. In this port the container is a plain object, so both paths
//     read the same values; the re-reads are written where the machine does them
//     and this note records the difference, which only a caller that mutated the
//     list from inside `operator delete` could observe.
//   * `end = begin` is written (@0x14ec9c) but `begin` is NOT nulled. After this
//     destructor the object holds a dangling `begin`, which is normal for a D1 —
//     the storage is gone and nothing may read it again. The port reproduces the
//     assignment and leaves the field as it is.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// -----------------------------------------------------------------------------
// Checked against the real function. Harness: `arch -x86_64 /usr/bin/python3`
// (the port is transcribed from the x86_64 slice), dlopen Helium, resolve this
// LOCAL (`nm` type `t`) symbol as `nm -n -arch x86_64` vmaddr 0x14ec60 + the dyld
// image slide — NOT the bare `nm -n` fct/parity/local_call uses, which reports
// the ARM64 slice even from a Rosetta process. Because the body really does call
// the allocator, the harness builds each vector for real: the element buffer and
// every element come from libc `malloc`, so `::operator delete` (which is
// `free`) is handed pointers it may legitimately release.
// 512 vectors, 0..12 elements each (400 non-empty), null elements sprinkled at
// random (268 vectors contain at least one), plus empty-buffer and
// begin == NULL cases, and a 3-qword header so the untouched +0x10 capacity
// slot is watched too.
// RESULT: 512/512 — after the real call, `end` equalled `begin` in every case,
// `begin` was NEVER nulled (which is what confirms the D1-does-not-clear-begin
// note above), and the +0x10 capacity qword was never modified.
//
// WHAT THIS ORACLE CAN AND CANNOT SEE — stated because two of the obvious
// negative controls do NOT diverge, and that is a property of the function, not
// a hole in the fuzz:
//   * nulling `begin` at the end (a D0-ish mutation) -> 469 of 512 wrong. Good.
//   * making a null element BREAK the loop instead of skipping it -> 0 wrong,
//     and removing the final `end = begin` store -> 0 wrong. Each is masked by
//     the other: the loop drives `end` down to `begin` on its own, and the final
//     store sets it there anyway, so the post-state is OVER-DETERMINED. Applying
//     BOTH mutations at once diverges on 256 of 512, which is what shows the
//     harness is not simply blind here.
//   * the count of `operator delete` calls is NOT observed — that would need an
//     interposed allocator, which this harness does not do. So the evidence
//     covers the container's post-state and the buffer's fate, not the exact
//     number of frees. Said plainly rather than implied.

/**
 * An element of `HGCGL::RendererList` — a `T*` owned by the list.
 *
 * The destructor only ever tests the pointer against null and hands it to
 * `::operator delete`; it never dereferences it, so the pointee's type is NOT
 * decodable from this unit and is modelled as an opaque handle. (The outer
 * class's name says these are renderers; nothing in THIS function proves it, so
 * nothing here claims it.)
 */
export interface HGCGLRendererHandle {
  readonly __hgcglRenderer: true;
}

/**
 * `HGCGL::RendererList` — a `std::vector<T*>` of owned renderer pointers.
 *
 * Only the two header slots this destructor touches are modelled.
 *
 * POINTER-TO-INDEX MAPPING. The machine holds `begin` (+0x00) and `end` (+0x08)
 * as raw pointers and moves `end` in 8-byte steps (`addq $-0x8`). This port
 * holds the buffer as an array and `end` as an ELEMENT INDEX into it, so the
 * machine's `end -= 8` is `endIndex -= 1` and its `begin == end` test is
 * `endIndex === 0`. That is a 1:1 re-expression of the same arithmetic in the
 * units TypeScript can index with, not a change of algorithm.
 */
export class HGCGL__RendererList {
  /**
   * +0x00 — `begin`, the element buffer. Read by the destructor at @0x14ec69
   * and re-read at @0x14ec92, and passed to `::operator delete` at @0x14eca6.
   * `null` models a vector that never allocated (the @0x14ec9a null test).
   */
  begin_at_0x00: Array<HGCGLRendererHandle | null> | null = null;

  /**
   * +0x08 — `end`, one past the last live element, as an element INDEX into
   * `begin_at_0x00` (see the mapping note on the class). Read at @0x14ec70,
   * decremented and stored at @0x14ec7d/@0x14ec81, and finally set equal to
   * `begin` at @0x14ec9c.
   */
  endIndex_at_0x08: number = 0;

  /**
   * `HGCGL::RendererList::~RendererList()` [D1] — @Helium 0x14ec60
   *   (__ZN5HGCGL12RendererListD1Ev).
   *
   * Faithful transcription of the 32-line body quoted in the file header: pop
   * every element off the back, `::operator delete` each non-null one, then
   * release the buffer.
   *
   * `::operator delete` is a cited no-op (see the file header for why, and for
   * the landed HGNode.ts precedent). Every observable state change is performed.
   */
  destructD1(): void {
    // @0x14ec69  movq (%rdi), %rdi — rdi = this->begin.
    let begin = this.begin_at_0x00;

    for (;;) {
      // @0x14ec70  movq 0x8(%rbx), %rcx — re-read this->end at the loop head.
      // @0x14ec74  cmpq %rcx, %rdi ; je — begin == end means the vector is empty.
      //   In index terms (see the class note) that is endIndex === 0; when
      //   `begin` is null there is no buffer and the pointers are equal too.
      if (begin === null || this.endIndex_at_0x08 === 0) {
        break;
      }

      // @0x14ec79  movq -0x8(%rcx), %rax — the LAST element, end[-1].
      const element = begin[this.endIndex_at_0x08 - 1];
      // @0x14ec7d/@0x14ec81  addq $-0x8,%rcx ; movq %rcx,0x8(%rbx) — pop FIRST,
      //   unconditionally, before the element is even tested.
      this.endIndex_at_0x08 = this.endIndex_at_0x08 - 1;

      // @0x14ec85/@0x14ec88  testq %rax,%rax ; je 0x14ec74 — a null element is
      //   skipped, re-entering at the COMPARE (registers kept, no re-read).
      if (element === null || element === undefined) {
        continue;
      }

      // @0x14ec8d  callq __ZdlPv — ::operator delete(element).
      //   Out-of-scope libc++ deallocation; no observable counterpart in a
      //   garbage-collected runtime, so this is a cited no-op.
      // @0x14ec92  movq (%rbx),%rdi — reload this->begin after the opaque call.
      begin = this.begin_at_0x00;
      // @0x14ec95  jmp 0x14ec70 — re-enter at the head, which re-reads end too.
    }

    // @0x14ec97/@0x14ec9a  testq %rdi,%rdi ; je — no buffer, nothing to free.
    if (begin === null) {
      // @0x14ecab  the empty-buffer exit: pop the frame and return.
      return;
    }

    // @0x14ec9c  movq %rdi, 0x8(%rbx) — this->end = this->begin. In index terms
    //   the end index becomes 0. Note `begin` itself is deliberately NOT nulled.
    this.endIndex_at_0x08 = 0;

    // @0x14eca6  jmp __ZdlPv — TAIL-CALL ::operator delete(begin), releasing the
    //   element buffer. Again out-of-scope libc++ deallocation: a cited no-op.
  }
}
