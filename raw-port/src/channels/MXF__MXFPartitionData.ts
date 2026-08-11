// MXF__MXFPartitionData.ts — raw transcription of Flexo `MXF::MXFPartitionData`.
//
// Flexo's MXF (SMPTE 377M) partition-table reader: it walks a file's partition
// packs and keeps the decoded entries in a vector. NESTED IN A NAMESPACE, so
// the file name joins with the DOUBLE underscore per PORTING_SPEC.md
// (`MXF::MXFPartitionData` -> `MXF__MXFPartitionData.ts`).
//
// Provenance (Flexo framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file — ONE method:
//   @0x1433790  MXF::MXFPartitionData::lastStreamPosition(unsigned int) const
//                 __ZNK3MXF16MXFPartitionData18lastStreamPositionEj
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __ZNK3MXF16MXFPartitionData18lastStreamPositionEj Flexo`):
//   raw-port/re/disasm/Flexo.__ZNK3MXF16MXFPartitionData18lastStreamPositionEj.s
//   (20 lines)
//
// Every OTHER member is a SEPARATE ledger unit and is NOT ported here (the ctor
// @0x1431940, dtor @0x1431970, sourceStream @0x14319d0, readFirstPartition
// @0x14319e0, readPartitionHeader @0x1431b50, decodeLastPartitionPosition
// @0x1431dc0, decodeFooter @0x1431de0, partitionDataFromRIP @0x1432060,
// decodeForFastStream @0x1432510, decodeFirstPartition @0x14326a0,
// decodeLastPartitions @0x14326e0, loadFirstIndexTables @0x1432960,
// decodeAllPartitionsWithoutRIP @0x1432b50, searchLastPartition @0x1432ec0,
// decodePartition @0x1433430).
//
// ---------------------------------------------------------------------------
// LAYOUT — the std::vector this body walks
// ---------------------------------------------------------------------------
//   struct MXF::MXFPartitionData {
//     ...                                  // +0x00..+0x2f not touched here
//     MXFPartitionEntry** entriesBegin;    // +0x30  movq 0x30(%rdi),%rcx @0x1433794
//     MXFPartitionEntry** entriesEnd;      // +0x38  movq 0x38(%rdi),%rdx @0x1433798
//   };
//
// That is the standard libc++ `std::vector<MXFPartitionEntry*>` {begin, end}
// pair: the loop compares the two @0x14337a0, reads the element BEFORE `end`
// with `movq -0x8(%rdx),%rdi` @0x14337a5, and walks `end` down by 8 bytes
// (one pointer) at a time @0x14337af. The element type is named by the sibling
// signature `MXFPartitionData::decodePartition(MXF::MXFPartitionEntry*, long long)`
// @0x1433430 and by the emitted
// `std::vector<MXF::MXFPartitionEntry*>::insert` @0x1433200.
//
// ---------------------------------------------------------------------------
// LAYOUT — the fields of MXFPartitionEntry this body reads
// ---------------------------------------------------------------------------
// Grounded on the entry's own ctor and updater, both SEPARATE ledger units
// quoted here as evidence only:
//
//   +0x00  uint32  streamID   `movl %edx, (%rdi)` @0x142dbc4 in
//                             MXFPartitionEntry::MXFPartitionEntry(long long,
//                             unsigned int) — i.e. this slot IS that ctor's
//                             `unsigned int` parameter, which is what makes the
//                             `cmpl %esi, (%rdi)` @0x14337b3 below a comparison
//                             against this method's own `unsigned int` argument.
//   +0x11  uint8   updated    zero-initialised by `movw $0x0, 0x10(%rdi)`
//                             @0x142dbca (a 16-bit store covering +0x10 and
//                             +0x11), and set to 1 by
//                             `movb $0x1, 0x11(%rbx)` @0x142dc37 in
//                             MXFPartitionEntry::updateEntry(...). So it is the
//                             "this entry has been filled in" flag, and the
//                             `cmpb $0x1, 0x11(%rdi)` @0x14337a9 below is the
//                             loop's guard against reading un-updated entries.
//   +0x18  uint64  fieldAt18  zeroed @0x142dbd3, written
//                             `movq %rax, 0x18(%rbx)` @0x142dc53 by updateEntry.
//   +0x28  uint64  fieldAt28  zeroed @0x142dbd3/@0x142dbd7, written
//                             `movq %r15, 0x28(%rbx)` @0x142dc62 by updateEntry.
//
// The port does NOT invent names for +0x18/+0x28 beyond their offsets: their
// meaning would have to come from updateEntry's own decode, which is a
// different ledger unit. The method returns their SUM, which is the shape of
// "start + length = one-past-the-end position" — recorded here as an
// observation, not as a naming claim.
//
// CALLEES: none. No call of any kind in the body (`depgraph.py deps` lists
// nothing for this symbol).

/**
 * The fields of `MXF::MXFPartitionEntry` that `lastStreamPosition` reads.
 *
 * A PARTIAL view, declared here only so this method has a typed element — the
 * full class belongs in its own `MXF__MXFPartitionEntry.ts` when a unit for it
 * lands (same arrangement as `HGTileCtx`/`HGRendererStub` in HGTile.ts). Every
 * field is cited against the instruction that proves it in the block comment
 * above.
 */
export interface MXFPartitionEntryFields {
  /** @+0x00 uint32 — the stream id compared against the argument @0x14337b3. */
  streamID: number;
  /** @+0x11 uint8 — the "entry updated" flag tested @0x14337a9. */
  updated: number;
  /** @+0x18 uint64 — one of the two addends of the result. */
  fieldAt18: bigint;
  /** @+0x28 uint64 — the other addend of the result. */
  fieldAt28: bigint;
}

/**
 * `MXF::MXFPartitionData` — Flexo's MXF partition-table reader.
 *
 * @Flexo 0x1433790
 */
export class MXF__MXFPartitionData {
  /**
   * @Flexo instance +0x30 / +0x38 — the `std::vector<MXFPartitionEntry*>`
   * {begin, end} pair, read as `movq 0x30(%rdi),%rcx` @0x1433794 and
   * `movq 0x38(%rdi),%rdx` @0x1433798.
   *
   * Modelled as the element array itself: the machine's `end == begin` test
   * @0x14337a0 is `index < 0` here, and its 8-byte decrement @0x14337af is one
   * array step, because the vector holds 8-byte pointers.
   */
  entries: MXFPartitionEntryFields[] = [];

  /**
   * `MXF::MXFPartitionData::lastStreamPosition(unsigned int streamID) const`
   * @Flexo 0x1433790 (__ZNK3MXF16MXFPartitionData18lastStreamPositionEj).
   *
   * Faithful transcription of the 20-line body, quoted in full:
   *
   *   0x1433790  pushq %rbp                    ; frame prologue
   *   0x1433791  movq  %rsp, %rbp
   *   0x1433794  movq  0x30(%rdi), %rcx        ; rcx = entriesBegin
   *   0x1433798  movq  0x38(%rdi), %rdx        ; rdx = entriesEnd  (the cursor)
   *   0x143379c  xorl  %eax, %eax              ; result = 0  (the default)
   *   0x143379e  nop
   *   0x14337a0  cmpq  %rcx, %rdx              ; cursor == begin?
   *   0x14337a3  je    0x14337bf               ;   yes -> return 0
   *   0x14337a5  movq  -0x8(%rdx), %rdi        ; entry = cursor[-1]
   *   0x14337a9  cmpb  $0x1, 0x11(%rdi)        ; entry->updated == 1?
   *   0x14337ad  jne   0x14337bf               ;   no  -> STOP, return 0
   *   0x14337af  addq  $-0x8, %rdx             ; --cursor
   *   0x14337b3  cmpl  %esi, (%rdi)            ; entry->streamID == streamID?
   *   0x14337b5  jne   0x14337a0               ;   no  -> keep scanning back
   *   0x14337b7  movq  0x28(%rdi), %rax        ; rax = entry->+0x28
   *   0x14337bb  addq  0x18(%rdi), %rax        ; rax += entry->+0x18
   *   0x14337bf  popq  %rbp                    ; shared exit
   *   0x14337c0  retq
   *   0x14337c1  nopw  %cs:(%rax,%rax)         ; padding — not executed
   *
   * SEMANTICS: scan the partition-entry vector BACKWARDS from the end. Return
   * `entry->+0x28 + entry->+0x18` for the LAST entry whose `streamID` matches;
   * return 0 if no entry matches.
   *
   * TWO DETAILS A PARAPHRASE WOULD DROP, both load-bearing:
   *
   *   1. The `updated` test @0x14337a9 is an EARLY STOP, not a skip. `jne`
   *      leaves the loop entirely and returns 0 — it does NOT continue to the
   *      next entry. So a single un-updated entry hides every matching entry
   *      below it. Writing this as "skip entries that aren't updated" would be
   *      a different function.
   *   2. Every exit shares @0x14337bf, and `%eax` was zeroed once @0x143379c
   *      before the loop. That is why all three non-matching outcomes (empty
   *      vector, un-updated entry, scanned past the beginning) return the same
   *      0 — there is no distinguished "not found" value.
   *
   * NUMERICS: the result is a 64-bit `movq`/`addq` pair, so the port uses
   * `bigint` and wraps the sum with `BigInt.asUintN(64, ...)` to reproduce the
   * machine's exact 64-bit add including wraparound. `streamID` is compared
   * with a 32-bit `cmpl`, so it is masked to u32 on both sides.
   *
   * DEPENDENCIES: none in-scope; no extern; no call.
   */
  lastStreamPosition(streamID: number): bigint {
    // @0x1433794/@0x1433798 — begin and the end cursor. In array terms the
    // cursor is an index one PAST the element about to be read.
    const begin = 0;
    let cursor = this.entries.length;

    // @0x143379c  xorl %eax, %eax
    let result = 0n;

    for (;;) {
      // @0x14337a0..@0x14337a3  cmpq %rcx, %rdx ; je 0x14337bf
      if (cursor === begin) {
        break;
      }

      // @0x14337a5  movq -0x8(%rdx), %rdi
      const entry = this.entries[cursor - 1];
      if (entry === undefined) {
        // Unreachable while `entries` is a dense array: cursor is in
        // [1, length] here. Present so the read is total rather than an
        // assertion that could launder an undefined into the arithmetic below.
        break;
      }

      // @0x14337a9..@0x14337ad  cmpb $0x1, 0x11(%rdi) ; jne 0x14337bf
      // NOTE: this LEAVES the loop (see the docblock) — it is not a skip.
      if ((entry.updated & 0xff) !== 0x1) {
        break;
      }

      // @0x14337af  addq $-0x8, %rdx — the decrement happens BEFORE the id
      // compare, so the cursor is already past this entry on a match.
      cursor -= 1;

      // @0x14337b3..@0x14337b5  cmpl %esi, (%rdi) ; jne 0x14337a0
      if ((entry.streamID >>> 0) !== (streamID >>> 0)) {
        continue;
      }

      // @0x14337b7..@0x14337bb  movq 0x28(%rdi),%rax ; addq 0x18(%rdi),%rax
      result = BigInt.asUintN(64, entry.fieldAt28 + entry.fieldAt18);
      break;
    }

    // @0x14337bf..@0x14337c0 — the single shared exit.
    return result;
  }
}
