// ProCore_Private.ts — ProCore::Private helpers for ICC byte-order marshalling.
// Transcribed from ProCore.framework disasm. These are trivial big-endian I/O for ICC
// profile fields (per ICC.1: numeric fields are big-endian on disk). Sibling functions
// in the same TU per /tmp/ProCore_symmap.tsv include getUInt16Number/setUInt32Number/
// getInt32Number/etc. — each ported into this file as it's claimed.

/**
 * ProCore::Private::setUInt16Number(unsigned char* dst, unsigned short v)  @ProCore 0x0b0bca
 *
 * Writes `v` as a big-endian uint16 to `dst[0..1]`. The disasm (7 lines):
 *   @0x0b0bca  pushq %rbp                       ; frame setup
 *   @0x0b0bcb  movq  %rsp, %rbp
 *   @0x0b0bce  rolw  $0x8, %si                  ; byte-swap the low 16 bits of the value (rdi=dst, rsi=v)
 *   @0x0b0bd2  movw  %si, (%rdi)                ; store swapped 16-bit to *dst
 *   @0x0b0bd5  popq  %rbp
 *   @0x0b0bd6  retq
 *
 * The `rolw $8, %si` on a 16-bit value is a byte-swap (swap the two bytes). So this
 * writes the host uint16 `v` as big-endian: dst[0] = (v>>8)&0xff, dst[1] = v & 0xff.
 * (The mac hosts running FCP are little-endian; ICC on disk is big-endian.)
 */
export function ProCore_Private_setUInt16Number(dst: Uint8Array, offset: number, v: number): void {
  // Model the pointer-plus-Uint8Array explicitly; the disasm operates on a raw byte pointer.
  const u = v & 0xffff; // rolw operates on a 16-bit register — mask to match
  dst[offset]     = (u >>> 8) & 0xff; // @0x0b0bce/@0x0b0bd2 — high byte first (big-endian)
  dst[offset + 1] =  u        & 0xff; //                        low byte second
}
