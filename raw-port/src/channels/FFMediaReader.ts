// FFMediaReader.ts — Flexo/FFMediaReader. This file ports one method of the
// FFMediaReader class: incrementStreamCount(), a trivial atomic bump of an
// integer "stream count" field kept at offset +0x14 in the object.
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.__ZN13FFMediaReader20incrementStreamCountEv.s
//
// SYMBOL (from /tmp/Flexo_symmap.tsv):
//   __ZN13FFMediaReader20incrementStreamCountEv  @0x00e07760
//     ; FFMediaReader::incrementStreamCount()
//
// DISASSEMBLY (verbatim):
//   0000000000e07760  pushq  %rbp
//   0000000000e07761  movq   %rsp, %rbp
//   0000000000e07764  lock
//   0000000000e07765  incl   0x14(%rdi)          ; atomic ++(*(int32*)(this+0x14))
//   0000000000e07768  popq   %rbp
//   0000000000e07769  retq
//   0000000000e0776a  nopw   (%rax,%rax)          ; alignment padding, not code
//
// DECODE — struct layout (recovered from this method's single memory access):
//   +0x14  int32  streamCount   // the only field touched: `lock incl 0x14(%rdi)`
//                               // @0xe07765 atomically increments a 32-bit int.
//                               // `incl` is a 32-bit ('l') increment, so the field
//                               // is a signed/unsigned 4-byte counter. The 'lock'
//                               // prefix makes it a full atomic RMW (this object is
//                               // touched from multiple reader threads); the value
//                               // itself is a plain 32-bit wrap-around counter.
//
// There is no callq, no return value written to %rax/%xmm0 (incrementStreamCount
// returns void), and no other field is read or written. This is a faithful,
// complete transcription of the whole function body.

/**
 * Minimal model of the FFMediaReader instance state that this method touches.
 * Only the field at +0x14 (streamCount) is decoded here; the rest of the
 * FFMediaReader layout is not exercised by incrementStreamCount and is left
 * undecoded (other FFMediaReader methods will add their own fields).
 */
export interface FFMediaReaderState {
  /** +0x14 int32 — atomic 32-bit stream reference counter. */
  streamCount: number;
}

/**
 * FFMediaReader::incrementStreamCount()  @Flexo 0x00e07760
 *
 * `lock incl 0x14(%rdi)` @0xe07765 — atomically increments the 32-bit stream
 * count at object offset +0x14. Returns void. JS is single-threaded so the
 * `lock` prefix (multi-thread atomicity in the binary) reduces to a plain
 * increment here; we preserve the 32-bit width by masking to a signed int32
 * to mirror the `incl` (32-bit) wrap-around exactly.
 */
export function FFMediaReader_incrementStreamCount(self: FFMediaReaderState): void {
  // `incl` is a 32-bit increment; wrap into signed int32 to match the machine.
  self.streamCount = (self.streamCount + 1) | 0;
}
