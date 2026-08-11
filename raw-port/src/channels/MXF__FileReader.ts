// MXF__FileReader.ts — raw transcription of Flexo `MXF::FileReader`.
//
// The MXF file reader. ONE symbol is transcribed in this file:
// `hasMultipleEssenceContainers() const`. Every OTHER member of the class (the ctors/dtors,
// `runDecoder`, `addEssenceContainers`, `decodeRestOfFile`, `essencContainer`,
// `mainEssenceContainer`, `isFileValid`, … — the inventory lists 60+ symbols for it) is a SEPARATE
// ledger unit and is deliberately absent: per the one-class-one-file rule each gets ADDED to THIS
// file when its own unit is claimed (G6 add-only). File name follows the landed nested/namespaced
// precedent in this directory — `MXF__MXFPartitionEntry.ts`, `MXF__MXFPartitionData.ts`,
// `MXF__MXFAVCPictureDataDecoder.ts` — i.e. `MXF__<Class>` for `MXF::<Class>`.
//
// Provenance (Flexo framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo):
//
//   @0x14467b0  MXF::FileReader::hasMultipleEssenceContainers() const
//                 __ZNK3MXF10FileReader28hasMultipleEssenceContainersEv     (inventory: `t`, local)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZNK3MXF10FileReader28hasMultipleEssenceContainersEv Flexo`):
//   raw-port/re/disasm/Flexo.__ZNK3MXF10FileReader28hasMultipleEssenceContainersEv.s
//
// FULL DISASM with the raw bytes (17 bytes; asserted byte-for-byte by the oracle against both the
// mapped image and /tmp/Flexo.x86_64 before it calls anything):
//
//   0x14467b0  55                       pushq %rbp                  ; prologue
//   0x14467b1  48 89 e5                 movq  %rsp, %rbp
//   0x14467b4  48 83 bf e8 00 00 00 02  cmpq  $0x2, 0xe8(%rdi)      ; flags on (*(u64*)(this+0xe8)) - 2
//   0x14467bc  0f 93 c0                 setae %al                   ; al = CF==0  ->  field >= 2 UNSIGNED
//   0x14467bf  5d                       popq  %rbp                  ; epilogue
//   0x14467c0  c3                       retq                        ; bool in %al
//
// AT&T ORDER, spelled out because getting it backwards is this codebase's most expensive mistake
// (PORTING_SPEC's cheat-sheet): `cmpq $0x2, 0xe8(%rdi)` computes DST - SRC = field - 2, and `setae`
// is CF==0, i.e. NO borrow, i.e. **field >= 2** — an UNSIGNED comparison (`setae`, not `setge`).
// The whole method is that one compare: nothing is stored, nothing else is read, there is no branch.
//
// WHAT +0xe8 IS, grounded on two sibling bodies rather than guessed. The class embeds a libc++
// `std::map` at +0xd8, whose three words are the standard `__tree` layout
// (`__begin_node_`, `__pair1_` = the end node, `__pair3_` = the SIZE):
//
//   __ZNK3MXF10FileReader15essencContainerEj @0x1446760 — the tree WALK, which is what identifies
//   the structure:
//     @0x1446760  movq 0xe0(%rdi), %rcx      ; root = *(this+0xe0)
//     @0x1446770  addq $0xe0, %rdi           ; &end_node — the sentinel the walk compares against
//     @0x1446782  cmpl %esi, 0x20(%rcx)      ; node+0x20 = the u32 KEY
//     @0x144678c  movq (%rcx,%rdx,8), %rcx   ; node+0x00 / +0x08 = __left_ / __right_
//     @0x14467a6  movq 0x28(%rax), %rax      ; node+0x28 = the mapped VALUE (a pointer)
//
//   __ZNK3MXF10FileReader20mainEssenceContainerEv @0x1446680 — reads the SAME word this method
//   reads, and treats it as a count:
//     @0x144668a  movq 0xe8(%rdi), %rax      ; n = *(this+0xe8)
//     @0x1446691  testq %rax, %rax ; je      ; n == 0 -> return null
//     @0x1446699  cmpq $0x1, %rax  ; jne     ; n == 1 -> return the first node's value
//     @0x144669f  movq 0xd8(%rbx), %r15      ; ...via __begin_node_ at +0xd8, and its +0x28 value
//
//   So: +0xd8 `__begin_node_`, +0xe0 `__pair1_` (end node / root slot), +0xe8 `__pair3_` = the
//   number of essence containers. `hasMultipleEssenceContainers()` is `size() >= 2`, and the
//   sibling's `n == 0` / `n == 1` cases are the same word read the same way.
//
// ORACLE — EXECUTED against live Final Cut Pro, and against THIS FILE, not read:
//   raw-port/re/oracle/MXF__FileReader_hasMultipleEssenceContainers_oracle.py
//   raw-port/re/oracle/MXF__FileReader_hasMultipleEssenceContainers_driver.mts
// The symbol is LOCAL (`t`), so it is called by address at `_dyld_get_image_vmaddr_slide(Flexo) +
// 0x14467b0` under `arch -x86_64` (the port is transcribed from the x86_64 slice; the natively
// loaded image is arm64 — the slice trap), after asserting the 17 opcode bytes above. The TS side
// is the REAL module, imported by the driver under `node --experimental-strip-types`, so the
// comparison is TypeScript-against-binary rather than binary-against-a-Python-restatement of the
// same misreading.
//
// MEASURED 2026-08-11 — see the PR for the full table. 9 receiver states (0, 1, 2, 3, 0x7fff_ffff,
// 0x8000_0000, 0x1_0000_0000, 0x7fff_ffff_ffff_ffff, 0xffff_ffff_ffff_ffff), live == port in all 9;
// a 0x200-byte 0xCD-poisoned receiver is byte-identical afterwards (the method stores nothing); and
// the neighbouring words +0xd8/+0xe0 are set to values that would flip the answer if the wrong one
// were read, which pins the OFFSET. Mutants evaluated in the same node process: `> 2` dies on the
// count==2 case, SIGNED `>= 2` dies on 0x8000_0000_0000_0000, `!= 0` dies on count==1.

/**
 * The part of an `MXF::FileReader` instance this file can ground. Deliberately minimal: the one
 * word the transcribed body reads, named from the two sibling bodies quoted in the header. Widened
 * by each future unit of the class — the other two words of the same `std::map` (+0xd8, +0xe0) are
 * deliberately NOT modelled here, because this method neither reads nor writes them.
 */
export interface MXF__FileReaderState {
  /**
   * +0xe8, u64 — `essenceContainers.size()`, the third word of the libc++ `std::map` embedded at
   * +0xd8 (`__tree::__pair3_`). Read @0x14467b4 by the method below and @0x144668a by
   * `mainEssenceContainer` @0x1446680.
   *
   * Modelled as `number` rather than `bigint`: the machine's compare is 64-bit UNSIGNED, and a
   * `number` cannot hold every u64 exactly — but this predicate is monotone in the value and the
   * only boundary is 2, so a count that is not exactly representable (> 2^53) is one that answers
   * `true` either way. Each element is a heap `__tree_node` of at least 0x30 bytes, so a count
   * above 2^53 cannot exist in an addressable process regardless.
   */
  essenceContainerCount: number;
}

/**
 * `MXF::FileReader::hasMultipleEssenceContainers() const` — @Flexo 0x14467b0
 * (`__ZNK3MXF10FileReader28hasMultipleEssenceContainersEv`).
 *
 * FULL transcription of all six instructions: one unsigned 64-bit compare of the essence-container
 * count against 2, returned as the `setae` boolean. No store, no branch, no call, no other field.
 *
 * @Flexo 0x14467b0
 */
export function MXF__FileReader_hasMultipleEssenceContainers(
  self: MXF__FileReaderState,
): boolean {
  // @0x14467b4  cmpq $0x2, 0xe8(%rdi)   — flags on (count - 2), unsigned
  // @0x14467bc  setae %al               — CF == 0, i.e. no borrow, i.e. count >= 2
  return self.essenceContainerCount >= 2;
}
