// PCAtomBox.ts — ProCore `PCAtomBox`: the in-memory representation of a
// QuickTime/ISO-BMFF "atom" (a.k.a. "box") — a length-prefixed, four-CC-typed
// container node in a PCAtomBoxFile tree. Only one accessor is transcribed
// here so far (`getPayloadSize`); the sibling accessors that pin the head of
// the struct layout (getOffset/getSize/setPayloadSize) are cited below.
//
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//     Versions/A/ProCore.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/ProCore.__ZN9PCAtomBox14getPayloadSizeEv.s
//   raw-port/re/disasm/ProCore.__ZN9PCAtomBox9setParentEPS_.s
//
// ProCore symbol transcribed:
//   @0x00008b7c  PCAtomBox::getPayloadSize()   — __ZN9PCAtomBox14getPayloadSizeEv
//   @0x00008bbc  PCAtomBox::setParent(PCAtomBox*) — __ZN9PCAtomBox9setParentEPS_
//
// STRUCT LAYOUT (head, recovered from the trivial accessor asm — each field
// cited @0xADDR of the accessor that reads/writes it):
//   PCAtomBox {
//     +0x00  u64  offset        [getOffset  @0x8b58 `movq (%rdi),%rax`;
//                                setOffset   @0x8b5e]
//     +0x08  u64  size          [getSize    @0x8b6c `movq 0x8(%rdi),%rax`;
//                                setSize     @0x8b72]
//     +0x10  u64  payloadSize   [getPayloadSize @0x8b80 `movq 0x10(%rdi),%rax`;
//                                setPayloadSize  @0x8b8a `movq %rsi,0x10(%rdi)`]
//     +0x20  ptr  parent        [getParent  @0x8bb6 `movq 0x20(%rdi),%rax`;
//                                setParent   @0x8bc0 `movq %rsi,0x20(%rdi)`]
//     ...    (type u32, child vector, etc. — pinned when those accessors are
//            ported: getType @0x8b9e, getChildCount @0x8eae, ...)
//   }
//
// The three head fields are all 64-bit (`movq`), matching the ISO-BMFF
// large-size (`size64`) and offset conventions and `setPayloadSize(unsigned
// long long)`'s `y` mangling. Modeled as `bigint` per PORTING_SPEC Rule 4
// (u64 that can exceed 2^53 — a media file's byte offsets/sizes).
//
// Called stubs / data: NONE — pure field load.
// Frontier callees (not-yet-transcribed): NONE.

/**
 * `PCAtomBox` — ISO-BMFF / QuickTime atom node. Only the fields with a
 * transcribed accessor are modeled; the rest of the object is an open
 * frontier filled in as its accessors are ported.
 */
export class PCAtomBox {
  /** @+0x00 u64 — byte offset of this atom in its file.
   *  [getOffset @0x8b58]. */
  offset: bigint = 0n;

  /** @+0x08 u64 — total atom size (header + payload).
   *  [getSize @0x8b6c]. */
  size: bigint = 0n;

  /** @+0x10 u64 — payload (content) size in bytes.
   *  [getPayloadSize @0x8b80 / setPayloadSize @0x8b8a]. */
  payloadSize: bigint = 0n;

  /** @+0x20 ptr — parent atom box in the containment tree.
   *  [getParent @0x8bb6 / setParent @0x8bc0]. */
  parent: PCAtomBox | null = null;

  /**
   * `PCAtomBox::getPayloadSize()`
   *   — @ProCore 0x8b7c
   *   — __ZN9PCAtomBox14getPayloadSizeEv
   *
   * Returns the 64-bit payload size stored at this+0x10. Verbatim:
   *
   *   0x8b7c  pushq %rbp
   *   0x8b7d  movq  %rsp,%rbp
   *   0x8b80  movq  0x10(%rdi),%rax    ; return *(u64*)(this + 0x10)
   *   0x8b84  popq  %rbp
   *   0x8b85  retq
   *
   * DEPENDENCIES: none — pure field load.
   */
  getPayloadSize(): bigint {
    // @0x8b80 — movq 0x10(%rdi),%rax.
    return this.payloadSize;
  }

  /**
   * `PCAtomBox::setParent(PCAtomBox*)`
   *   — @ProCore 0x8bbc
   *   — __ZN9PCAtomBox9setParentEPS_
   *
   * Stores the parent-atom pointer at this+0x20. Verbatim:
   *
   *   0x8bbc  pushq %rbp
   *   0x8bbd  movq  %rsp,%rbp
   *   0x8bc0  movq  %rsi, 0x20(%rdi)   ; *(PCAtomBox**)(this + 0x20) = parent
   *   0x8bc4  popq  %rbp
   *   0x8bc5  retq
   *
   * Pure setter — no back-link update, no retain (PCAtomBox parents are
   * non-owning; see getParent @0x8bb6 reading the same +0x20 slot).
   *
   * DEPENDENCIES: none — pure field store.
   */
  setParent(parent: PCAtomBox | null): void {
    // @0x8bc0 — movq %rsi, 0x20(%rdi).
    this.parent = parent;
  }
}
