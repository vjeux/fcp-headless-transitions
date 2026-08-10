// PCAtomBox — ProCore's QuickTime/ISO-BMFF "atom box" descriptor (type, offset,
// size, payload, parent/child links) used when parsing container files.
//
// Faithful port of the ProCore x86_64 disassembly. Every method cites its
// @ProCore addr. Framework: ProCore (thin slice extracted from
// Final Cut Pro.app/Contents/Frameworks/ProCore.framework/.../ProCore).
//
// Provenance (raw-port/re/disasm/ProCore.PCAtomBox.*.s):
//   getOffset()  @0x008b54  (__ZN9PCAtomBox9getOffsetEv)
//
// ── Decoded struct layout (only the fields this unit touches are pinned here;
//    the remaining fields are added by their own ledger units) ──────────────
//
//   +0x00  u64   offset   // byte offset of this atom within its container file.
//                         // Read by getOffset @0x008b58 (`movq (%rdi),%rax`), written
//                         // by setOffset(unsigned long long) — a full 64-bit value,
//                         // so it is modelled as a bigint (a large file offset can
//                         // exceed 2^53). See PORTING_SPEC Rule 4.

export class PCAtomBox {
  // +0x00  u64 file offset of this atom (see setOffset(unsigned long long)).
  offset: bigint = 0n;

  /**
   * PCAtomBox::getOffset()
   * @0xADDR ProCore 0x0000000000008b54  (__ZN9PCAtomBox9getOffsetEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN9PCAtomBox9getOffsetEv.s):
   *   0x008b54  pushq %rbp ; movq %rsp,%rbp        ; frame
   *   0x008b58  movq (%rdi), %rax                  ; rax = *(u64*)(this+0x00) = offset
   *   0x008b5b  popq %rbp ; retq                   ; return offset
   *
   * A plain 64-bit field accessor: returns the atom's byte offset. Zero callees,
   * no externs. The return is a full unsigned long long, kept as bigint.
   */
  getOffset(): bigint {
    // @0x008b58 — movq (%rdi),%rax : load the u64 offset at +0x00.
    return this.offset;
  }
}
