// ProCore::Private — ProCore.framework. Free-function helpers in the ProCore::Private namespace.
// One method transcribed here:
//   @ProCore 0xb0bba  ProCore::Private::getUInt16Number(unsigned char const*)
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZN7ProCore7Private15getUInt16NumberEPKh.s
//
// The disasm is 8 instructions — a straight big-endian u16 read:
//   00000000000b0bba  pushq  %rbp                    ; prologue
//   00000000000b0bbb  movq   %rsp, %rbp              ; prologue
//   00000000000b0bbe  movzwl (%rdi), %eax            ; ax = *(uint16_t*)p  (little-endian load into ax)
//   00000000000b0bc1  rolw   $0x8, %ax               ; swap the two bytes in ax  (BE -> host)
//   00000000000b0bc5  movzwl %ax, %eax               ; zero-extend to eax (return value in eax)
//   00000000000b0bc8  popq   %rbp                    ; epilogue
//   00000000000b0bc9  retq
//
// Effect: given a pointer to 2 bytes stored big-endian on disk (ICC profile / atom-box style),
// return them as a native 16-bit unsigned integer. i.e. `(p[0] << 8) | p[1]`.

/**
 * Read a big-endian uint16 from a byte buffer.
 * @ProCore 0xb0bba  ProCore::Private::getUInt16Number(unsigned char const*)
 *
 * @param p    Byte buffer (Uint8Array) — reads p[offset] and p[offset+1].
 * @param off  Byte offset into the buffer (defaults to 0). Modelled here explicitly because
 *             the disasm uses a raw pointer `%rdi`; the caller is responsible for advancing it.
 * @returns    Native uint16 in the low 16 bits (movzwl zero-extends).
 */
export function ProCore_Private_getUInt16Number(p: Uint8Array, off: number = 0): number {
  // movzwl (%rdi), %eax  ; rolw $0x8, %ax  ; movzwl %ax, %eax
  //   = ((p[0] << 8) | p[1]) & 0xffff
  // The rolw swaps the two bytes of the little-endian load, i.e. reads them big-endian.
  const hi = p[off] & 0xff;         // @ProCore 0xb0bbe (low byte of the LE load = 1st byte on disk)
  const lo = p[off + 1] & 0xff;     // @ProCore 0xb0bbe (high byte of the LE load = 2nd byte on disk)
  return ((hi << 8) | lo) & 0xffff; // @ProCore 0xb0bc1 rolw $0x8  +  @ProCore 0xb0bc5 movzwl
}
