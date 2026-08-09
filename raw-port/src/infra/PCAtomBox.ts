// PCAtomBox.ts — ProCore.framework QuickTime/ISO-BMFF atom ("box") descriptor.
//
// This file ports ONLY `PCAtomBox::getHeaderSize()`. PCAtomBox describes one atom/box
// parsed out of a media container: its file offset, its total size, and the file offset
// where its payload (data) begins. The header size is the byte span between the box's
// declared total-size field and where its data starts.
//
// Verbatim from FCP's ProCore framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Decode evidence:
//   re/disasm/ProCore.__ZN9PCAtomBox13getHeaderSizeEv.s  @0x8b90  getHeaderSize()  (THIS unit)
//   re/disasm/ProCore.__ZN9PCAtomBox9getOffsetEv.s       @0x8b54  getOffset()  -> movq (%rdi)      (+0x00 layout evidence)
//   re/disasm/ProCore.__ZN9PCAtomBox7getSizeEv.s         @0x8b68  getSize()    -> movq 0x8(%rdi)    (+0x08 layout evidence)
//
// -- STRUCT LAYOUT (partial, from the accessor disasms above) -------------
//   offset  size  field       source
//   ------  ----  ----------  -----------------------------------------------
//   +0x00   0x08  offset      getOffset() @0x8b58 movq (%rdi),%rax     (box file offset)
//   +0x08   0x08  size        getSize()   @0x8b6c movq 0x8(%rdi),%rax  (total box size / end pos)
//   +0x10   0x08  dataStart   getHeaderSize() @0x8b98 subq 0x10(%rdi)  (payload start position)
//
//   These are 64-bit file quantities (movq). Container files can exceed 2^53 bytes,
//   so per PORTING_SPEC Rule 4 they are modelled as bigint.

export class PCAtomBox {
  // +0x00: box file offset (returned by getOffset()).
  offset: bigint = 0n; // field @+0x00
  // +0x08: total box size / end position (returned by getSize()).
  size: bigint = 0n; // field @+0x08
  // +0x10: file position where the box payload (data) begins.
  dataStart: bigint = 0n; // field @+0x10

  /**
   * PCAtomBox::getHeaderSize()
   * @0x8b90 ProCore
   *
   * Disasm (7 lines):
   *   0x8b90  pushq %rbp
   *   0x8b91  movq  %rsp, %rbp
   *   0x8b94  movq  0x8(%rdi), %rax    ## rax = this->size (+0x08)
   *   0x8b98  subq  0x10(%rdi), %rax   ## rax -= this->dataStart (+0x10)
   *   0x8b9c  popq  %rbp
   *   0x8b9d  retq
   *
   * Returns `this->size - this->dataStart`: the number of header bytes preceding
   * the box payload. 64-bit two's-complement subtraction (`subq`).
   */
  getHeaderSize(): bigint {
    // @0x8b94  rax = this->size (+0x08)
    // @0x8b98  rax -= this->dataStart (+0x10)  — 64-bit subq
    return BigInt.asIntN(64, this.size - this.dataStart);
  }
}

