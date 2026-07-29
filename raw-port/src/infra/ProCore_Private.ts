// ProCore::Private — ProCore.framework. Free-function helpers in the ProCore::Private namespace.
// Methods transcribed here:
//   @ProCore 0xb0bba  ProCore::Private::getUInt16Number(unsigned char const*)
//   @ProCore 0xb0d4f  ProCore::Private::convertFromU8Fixed8(unsigned short)
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZN7ProCore7Private15getUInt16NumberEPKh.s
//                     raw-port/re/disasm/ProCore.__ZN7ProCore7Private19convertFromU8Fixed8Et.s
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

// -----------------------------------------------------------------------------
// convertFromU8Fixed8
//
// Disassembly (7 lines total, one straight cvt+mul):
//   00000000000b0d4f  pushq     %rbp
//   00000000000b0d50  movq      %rsp, %rbp
//   00000000000b0d53  cvtsi2sd  %edi, %xmm0            ; xmm0 = (double) edi   (signed 32-bit -> f64)
//   00000000000b0d57  mulsd     0x771f1(%rip), %xmm0   ; xmm0 *= *(double*)(rip+0x771f1)  ; RIP-target = 0xb0d5f + 0x771f1 = 0x127f50
//   00000000000b0d5f  popq      %rbp
//   00000000000b0d60  retq
//
// Constant pool @ProCore 0x127f50 (8 bytes, little-endian):
//   00 00 00 00 00 00 70 3f  = 0x3f70000000000000 = 1.0 / 256.0 = 0.00390625
//
// So the function computes `((double) x) * (1.0/256.0)` — the canonical U8.8 fixed-point
// decode: an unsigned short is treated as an 8.8 fixed-point number, converted to double by
// dividing the raw integer by 256 (i.e. the low 8 bits are the fractional part).
//
// Note: the arg is declared `unsigned short` in the demangled name but the disasm uses
// `cvtsi2sd %edi` — a SIGNED 32-bit -> double convert. Because the caller passes a u16 (which
// is 16 bits wide), the high bits of %edi are zero and the signed interpretation is identical
// to the unsigned one for the whole 0..65535 range. We mask & 0xffff before the convert to
// match the ABI's zero-extended callee param and the semantic type.

/**
 * Decode a U8.8 fixed-point number to a double.
 * @ProCore 0xb0d4f  ProCore::Private::convertFromU8Fixed8(unsigned short)
 *
 * The 16-bit input is a Q8.8 unsigned fixed-point value: the top 8 bits are the integer part,
 * the bottom 8 bits are the fractional part (as 256ths). Returns `x / 256.0`.
 *
 * @param x  U8.8 fixed-point (0..65535 raw; represents 0.0 .. 255.99609375).
 * @returns  IEEE-754 double = x * (1/256).
 */
export function ProCore_Private_convertFromU8Fixed8(x: number): number {
  // @ProCore 0xb0d53 cvtsi2sd  — the caller ABI supplies a zero-extended u16 in %edi.
  // @ProCore 0xb0d57 mulsd     — multiply by the constant read from @0x127f50 = 1/256.
  const xi = x & 0xffff;         // zero-extend to match the ABI's u16 param
  return xi * (1.0 / 256.0);     // @ProCore 0x127f50 constant = 0x3f70000000000000 = 1/256
}
