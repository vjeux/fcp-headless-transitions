// MXF__MXFPartitionEntry.ts — raw transcription of Flexo `MXF::MXFPartitionEntry`.
//
// One entry of Flexo's MXF (SMPTE 377M) partition table. NESTED IN A NAMESPACE, so the file name
// joins with the DOUBLE underscore per PORTING_SPEC.md (`MXF::MXFPartitionEntry` ->
// `MXF__MXFPartitionEntry.ts`), matching the landed sibling `MXF__MXFPartitionData.ts` — which is
// the class that owns a `std::vector<MXF::MXFPartitionEntry*>` of these.
//
// Provenance (Flexo framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo):
//
//   @0x142dbc0  MXF::MXFPartitionEntry::MXFPartitionEntry(long long, unsigned int)
//                 __ZN3MXF17MXFPartitionEntryC2Exj   (C2, base-object ctor)
//                 __ZN3MXF17MXFPartitionEntryC1Exj   (C1, complete-object ctor)
//
// C1 AND C2 ARE THE SAME ADDRESS. Both mangled names resolve to 0x142dbc0 in the symbol table
// (`raw-port/army/inventory/Flexo.syms.txt`), i.e. the linker folded the two ctor variants into one
// body — there is no separate complete-object wrapper to port, and this one transcription covers
// both. (The class has a SECOND, one-argument ctor `C1Ex`/`C2Ex` @0x142db90, also folded; it is a
// different ledger unit and its body is NOT assumed here.)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN3MXF17MXFPartitionEntryC2Exj Flexo`):
//   raw-port/re/disasm/Flexo.__ZN3MXF17MXFPartitionEntryC2Exj.s (14 lines)
//
// Every OTHER member is a SEPARATE ledger unit and is deliberately NOT ported here; each gets ADDED
// to this file when its own unit is claimed (one class = one file; G6 add-only):
//   the one-arg ctor @0x142db90, and `updateEntry(MXPartitionHeader const*, unsigned long,
//   long long)` @0x142dbf0.
//
// ---------------------------------------------------------------------------------------------
// STRUCT LAYOUT — every byte this ctor writes, and nothing else
// ---------------------------------------------------------------------------------------------
// The ctor writes exactly four kinds of store. The zero-fills OVERLAP, which matters for reading
// the layout correctly:
//
//   +0x00        u32   `movl %edx,(%rdi)`      @0x142dbc4   <- the `unsigned int` argument
//   +0x04..0x07        (not written — padding before the 8-aligned field below)
//   +0x08        i64   `movq %rsi,0x8(%rdi)`   @0x142dbc6   <- the `long long` argument
//   +0x10..0x11  u16   `movw $0x0,0x10(%rdi)`  @0x142dbca   two bytes zeroed
//   +0x12..0x17        (not written)
//   +0x18..0x27  128b  `movups %xmm0,0x18(%rdi)` @0x142dbd3  (xmm0 zeroed @0x142dbd0 by xorps)
//   +0x24..0x33  128b  `movups %xmm0,0x24(%rdi)` @0x142dbd7  OVERLAPS the previous store by 4 bytes
//   +0x34..0x37        (not written — a real 4-byte hole between the two tails)
//   +0x38..0x47  128b  `movups %xmm0,0x38(%rdi)` @0x142dbdb
//   +0x48..0x4f  u64   `movq $0x0,0x48(%rdi)`   @0x142dbdf
//
// So the object is 0x50 bytes and the ctor zero-initialises [0x10,0x12), [0x18,0x34) and
// [0x38,0x50), leaving [0x04,0x08), [0x12,0x18) and [0x34,0x38) untouched.
//
// WHAT THE ZEROED SLOTS ARE. Their meanings are NOT invented here — each is grounded on the
// sibling `updateEntry` @0x142dbf0, quoted as evidence only (it is its own ledger unit):
//
//   +0x00  u32  bodySID     overwritten from the `kmiBodySID` KLV item
//                           (`movl 0x10(%rax),%eax ; movl %eax,(%rbx)` @0x142dc1d/@0x142dc20).
//                           The landed MXF__MXFPartitionData.ts already documents this slot from
//                           THIS ctor's `movl %edx,(%rdi)` and compares it against a stream id.
//   +0x11  u8   updated     set to 1 by `movb $0x1,0x11(%rbx)` @0x142dc37 — the "this entry has
//                           been filled in" flag, which is why the ctor's 16-bit zero store at
//                           +0x10 covers it.
//   +0x18  u64              written from `kmiStreamPositionIndicatorUInt64` @0x142dc53.
//   +0x20  u64              written as (this->+0x08) + updateEntry's `unsigned long` argument
//                           (`addq 0x8(%rbx),%r12 ; movq %r12,0x20(%rbx)` @0x142dc57/@0x142dc5b) —
//                           which is what proves +0x08 is used as a BASE OFFSET that a
//                           partition-relative size is added to.
//   +0x28  u64              written as updateEntry's `long long` argument minus that sum
//                           (`subq %r12,%r15 ; movq %r15,0x28(%rbx)` @0x142dc5f/@0x142dc62).
//   +0x30  u32  indexSID    overwritten from the `kmiIndexSID` KLV item (@0x142dc31/@0x142dc34) —
//                           inside the second zero-fill, which is why that store reaches to +0x34.
//   +0x38  16 bytes         overwritten from the master index segment
//                           (`movups (%rax),%xmm0 ; movups %xmm0,0x38(%rbx)` @0x142dc80/@0x142dc83),
//                           and the qword at +0x38 is later read back as a multiplier
//                           (`imulq 0x38(%rbx),%rax` @0x142dca2).
//   +0x48  u64              written with that product (@0x142dca7).
//
// This port therefore models the slots the ctor writes, names ONLY the two that `updateEntry` names
// unambiguously (bodySID at +0x00, indexSID at +0x30) plus the `updated` flag at +0x11, and keeps
// the rest as offset-named u64 slots. Naming them further would be a claim this ctor does not make.
//
// CALLEES: none. No call of any kind in the body — no in-scope callee, no extern, no allocation, no
// indirect or virtual dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `MXF::MXFPartitionEntry` — one decoded MXF partition-table entry.
 *
 * Only the constructor at @Flexo 0x142dbc0 is transcribed in this file, so only the state that
 * constructor establishes is modelled. Every field carries the offset and the instruction that
 * proves it (see the file header).
 */
export class MXFPartitionEntry {
  /** +0x00 u32 — the `unsigned int` ctor argument; `updateEntry` later overwrites it from the
   *  kmiBodySID KLV item, which is what names it. `movl %edx,(%rdi)` @0x142dbc4. */
  bodySID: number;

  /** +0x08 i64 — the `long long` ctor argument. `updateEntry` reads it as the base that a
   *  partition-relative size is added to (@0x142dc57). Modelled as `bigint`: the slot is a full
   *  64-bit MXF stream position (its sibling slot at +0x18 is filled from an explicitly
   *  UInt64-typed KLV item), so it can exceed 2^53 and Rule 4 requires bigint. `movq %rsi,0x8(%rdi)`
   *  @0x142dbc6. */
  baseOffset: bigint;

  /** +0x10 u8 — the low byte of the 16-bit zero store @0x142dbca. No other unit writes it. */
  byteAt0x10: number;

  /** +0x11 u8 — the "entry has been filled in" flag; the high byte of that same 16-bit zero store.
   *  `updateEntry` sets it to 1 @0x142dc37. */
  updated: number;

  /** +0x18 u64 — zeroed by the store at @0x142dbd3; `updateEntry` fills it from the
   *  kmiStreamPositionIndicatorUInt64 item @0x142dc53. bigint: an explicit UInt64 stream position. */
  slotAt0x18: bigint;

  /** +0x20 u64 — zeroed by the store at @0x142dbd3; `updateEntry` writes baseOffset + its
   *  `unsigned long` argument @0x142dc5b. bigint for the same reason as +0x08. */
  slotAt0x20: bigint;

  /** +0x28 u64 — zeroed by the store at @0x142dbd7; `updateEntry` writes its `long long` argument
   *  minus the +0x20 sum @0x142dc62. bigint. */
  slotAt0x28: bigint;

  /** +0x30 u32 — zeroed by the store at @0x142dbd7 (which reaches to +0x34); `updateEntry`
   *  overwrites it from the kmiIndexSID KLV item @0x142dc34, which is what names it. */
  indexSID: number;

  /** +0x38 u64 — zeroed by the store at @0x142dbdb; `updateEntry` overwrites the 16 bytes at +0x38
   *  from the master index segment @0x142dc83 and later reads this qword back as a multiplier
   *  @0x142dca2. bigint. */
  slotAt0x38: bigint;

  /** +0x40 u64 — the upper half of that same 16-byte zero store @0x142dbdb. bigint. */
  slotAt0x40: bigint;

  /** +0x48 u64 — zeroed by `movq $0x0,0x48(%rdi)` @0x142dbdf; `updateEntry` writes the
   *  editUnitLength product here @0x142dca7. bigint. */
  slotAt0x48: bigint;

  /**
   * `MXF::MXFPartitionEntry::MXFPartitionEntry(long long, unsigned int)` — @Flexo 0x142dbc0
   *   `__ZN3MXF17MXFPartitionEntryC2Exj` == `__ZN3MXF17MXFPartitionEntryC1Exj` (same address).
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x142dbc0  pushq  %rbp                    ; frame setup (no TS counterpart)
   *   0x142dbc1  movq   %rsp,%rbp               ; frame setup (no TS counterpart)
   *   0x142dbc4  movl   %edx,(%rdi)             ; this->bodySID = (u32)arg2
   *   0x142dbc6  movq   %rsi,0x8(%rdi)          ; this->baseOffset = (i64)arg1
   *   0x142dbca  movw   $0x0,0x10(%rdi)         ; zero the two bytes at +0x10/+0x11
   *   0x142dbd0  xorps  %xmm0,%xmm0             ; xmm0 = 0 — the zero source for the three stores
   *   0x142dbd3  movups %xmm0,0x18(%rdi)        ; zero [0x18,0x28)
   *   0x142dbd7  movups %xmm0,0x24(%rdi)        ; zero [0x24,0x34)  — OVERLAPS the previous by 4
   *   0x142dbdb  movups %xmm0,0x38(%rdi)        ; zero [0x38,0x48)
   *   0x142dbdf  movq   $0x0,0x48(%rdi)         ; zero [0x48,0x50)
   *   0x142dbe7  popq   %rbp                    ; frame teardown (no TS counterpart)
   *   0x142dbe8  retq
   *   0x142dbe9  nopl   (%rax)                  ; alignment padding, not executed
   *
   * ARGUMENT ORDER. Under the SysV ABI the implicit `this` is %rdi, so the `long long` first
   * parameter is %rsi and the `unsigned int` second parameter is %edx — which is why the FIRST
   * declared parameter lands at +0x08 and the SECOND at +0x00, and not the other way around.
   *
   * THE OVERLAP IS NOT A TYPO. The two 16-byte stores are at +0x18 and +0x24, four bytes apart in
   * a sixteen-byte-wide store: together they clear [0x18,0x34) with [0x24,0x28) written twice.
   * Writing them as one 0x1c-byte clear would still be faithful in VALUE, but the port keeps both
   * stores so the transcription stays instruction-for-instruction. What matters for correctness is
   * the RANGE: it ends at 0x34, not 0x38, so the 4 bytes at [0x34,0x38) are NOT initialised by this
   * constructor — and neither are [0x04,0x08) or [0x12,0x18). This port models no field there
   * precisely because the constructor leaves those bytes alone.
   *
   * `%edx` is a 32-bit write into a 32-bit slot, so the stored value is the unsigned 32-bit
   * argument; the port applies `>>> 0` to keep that width exact.
   *
   * ORACLE (executed against live FCP, not read). The symbol is `t` (local) so it is not
   * dlsym-able; it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Flexo) + 0x142dbc0`, with the vmaddr from
   * `nm -n -arch x86_64` (never a bare `nm`, which reports the arm64 slice even under Rosetta), on
   * a 0x60-byte arena poisoned with 0xCD. For every argument pair tried — including 0, 1, -1,
   * INT64_MIN, INT64_MAX and 0xFFFFFFFF — live Flexo wrote exactly the bytes this port models: the
   * u32 at +0x00, the i64 at +0x08, zeros across [0x10,0x12), [0x18,0x34) and [0x38,0x50), and it
   * left [0x04,0x08), [0x12,0x18), [0x34,0x38) and everything past +0x50 at 0xCD. The untouched
   * holes were confirmed by byte-diffing the whole arena, not inferred from the listing.
   *
   * @param arg1 the `long long` in %rsi -> +0x08.
   * @param arg2 the `unsigned int` in %edx -> +0x00.
   */
  constructor(arg1: bigint, arg2: number) {
    // @0x142dbc4  movl %edx,(%rdi)
    this.bodySID = arg2 >>> 0;
    // @0x142dbc6  movq %rsi,0x8(%rdi)
    this.baseOffset = BigInt.asIntN(64, arg1);
    // @0x142dbca  movw $0x0,0x10(%rdi) — one 16-bit store covering both bytes.
    this.byteAt0x10 = 0;
    this.updated = 0;
    // @0x142dbd0/@0x142dbd3  xorps %xmm0,%xmm0 ; movups %xmm0,0x18(%rdi) — zero [0x18,0x28).
    this.slotAt0x18 = 0n;
    this.slotAt0x20 = 0n;
    // @0x142dbd7  movups %xmm0,0x24(%rdi) — zero [0x24,0x34); overlaps the store above.
    this.slotAt0x28 = 0n;
    this.indexSID = 0;
    // @0x142dbdb  movups %xmm0,0x38(%rdi) — zero [0x38,0x48).
    this.slotAt0x38 = 0n;
    this.slotAt0x40 = 0n;
    // @0x142dbdf  movq $0x0,0x48(%rdi) — zero [0x48,0x50).
    this.slotAt0x48 = 0n;
    // @0x142dbe8  retq — the ctor returns nothing; [0x04,0x08), [0x12,0x18) and [0x34,0x38) are
    //                    deliberately left uninitialised by the binary and unmodelled here.
  }
}
