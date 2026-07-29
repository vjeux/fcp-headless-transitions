// PCPrivateReaders.ts — ProCore::Private free helpers for raw byte-stream number reads.
//
// This file currently hosts ONE function:
//   ProCore::Private::getInt32Number(unsigned char const*)  @ProCore 0xb0b77
//     (mangled __ZN7ProCore7Private14getInt32NumberEPKh)
//
// The naming rule (raw-port/army/PORTING_SPEC.md Rule 6 + naming rule) says one FCP class per file.
// `ProCore::Private` is a C++ namespace (not a class), and its free `getInt32Number` disassembles
// as an independent leaf. Per the naming rule ("A free function goes in a file named after it or
// its translation-unit"), the natural file name is the reader itself; kept as `PCPrivateReaders.ts`
// so a sibling `getUInt16Number` / `getInt64Number` / etc. can join without another file.
//
// Transcribed from otool disasm at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// (see raw-port/re/disasm/ProCore.__ZN7ProCore7Private14getInt32NumberEPKh.s — 7 lines).

/**
 * ProCore::Private::getInt32Number(const uint8_t* p) -> uint32_t (32-bit)   @ProCore 0xb0b77.
 *
 * Reads FOUR consecutive bytes at *p in-order and interprets them as a big-endian 32-bit
 * unsigned integer (i.e. `p[0]` is the most-significant byte). This is the standard MP4/ISOBMFF /
 * QuickTime atom-size / QT metadata reader — every 32-bit field in an ISO base-media file lives
 * on disk in big-endian byte order, so a little-endian machine (all Apple silicon / Intel Macs
 * FCP runs on) reads the 32-bit word with `movl` and then flips it with `bswap`. That is exactly
 * what the disasm does — no bounds check, no null test, no error path.
 *
 * Full transcription (all instructions accounted for; addresses cited @0xADDR):
 *   0xb0b77  pushq %rbp                     ; frame prologue
 *   0xb0b78  movq  %rsp, %rbp               ; frame prologue
 *   0xb0b7b  movl  (%rdi), %eax             ; eax = *(uint32_t*)p   (native little-endian LOAD)
 *   0xb0b7d  bswapl %eax                    ; eax = bytereverse(eax) = p[0]<<24 | p[1]<<16 | p[2]<<8 | p[3]
 *   0xb0b7f  popq  %rbp                     ; frame epilogue
 *   0xb0b80  retq                           ; return eax
 *
 * The `bswap` behaviour is the SDM's exact definition: for a 32-bit register `bswap` swaps bytes
 * 0<->3 and 1<->2. In JS we mirror it via three shifts and an OR — no ambiguity, and no signed
 * spill since the values are u8 and the final `>>> 0` guarantees a u32.
 */
export function ProCore_Private_getInt32Number(p: Uint8Array, offset: number = 0): number {   // @ProCore 0xb0b77
  // movl (%rdi), %eax           @0xb0b7b — reads four little-endian bytes at p[0..3].
  const b0: number = p[offset + 0];                                                            // p[+0] -> byte 3 of native reg (LSB after bswap)
  const b1: number = p[offset + 1];                                                            // p[+1]
  const b2: number = p[offset + 2];                                                            // p[+2]
  const b3: number = p[offset + 3];                                                            // p[+3] -> byte 0 of native reg (MSB after bswap)
  // bswapl %eax                 @0xb0b7d — bytereverse: MSB of returned value is p[0].
  // (Equivalent big-endian composition, no sign concerns: three logical shifts + OR + >>> 0.)
  return (((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0);                                   // return eax  @0xb0b80
}
