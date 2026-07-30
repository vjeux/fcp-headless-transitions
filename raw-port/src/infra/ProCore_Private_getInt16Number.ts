// ProCore_Private_getInt16Number.ts — one of the ProCore::Private free byte-stream readers.
//
// This file hosts ONE function:
//   ProCore::Private::getInt16Number(unsigned char const*)  @ProCore 0xb0b9f
//     (mangled __ZN7ProCore7Private14getInt16NumberEPKh)
//
// Sibling ports in the same namespace live in their own per-symbol files by naming rule:
//   raw-port/src/infra/ProCore_Private_getInt32Number.ts       @0xb0b77
//   raw-port/src/infra/ProCore_Private_getUInt16Number.ts      @0xb0bba
//   raw-port/src/infra/ProCore_Private_getUInt32Number.ts      @0xb0b8b
//   raw-port/src/infra/ProCore_Private_getS15Fixed16Number.ts
//
// Transcribed from otool -tV disasm of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// (x86_64 slice). Full 7-line body — every instruction is accounted for and cited @0xADDR.

/**
 * ProCore::Private::getInt16Number(const uint8_t* p) -> int16_t (-32768..32767)  @ProCore 0xb0b9f.
 *
 * Reads TWO consecutive bytes at *p and interprets them as a BIG-ENDIAN SIGNED 16-bit integer.
 * Standard ICC/ISOBMFF/QuickTime i16 reader — 16-bit fields on disk are big-endian on Apple
 * binary formats. On a little-endian machine (x86_64/arm64) the code:
 *   1. loads the two bytes via `movzwl` (zero-extended so nothing above bit 15 is touched yet),
 *   2. rotates the low 16 bits left by 8 with `rolw $0x8, %ax` — this IS the byte-swap,
 *   3. sign-extends AX to EAX with `cwtl` (a.k.a. `cwde`) — this is what makes the SIGNED
 *      variant differ from the UNSIGNED sibling `getUInt16Number` (which uses `movzwl %ax, %eax`
 *      to ZERO-extend instead).
 *
 * Full transcription (all 7 instructions accounted for; addresses cited @0xADDR):
 *   0xb0b9f  pushq   %rbp                    ; frame prologue
 *   0xb0ba0  movq    %rsp, %rbp              ; frame prologue
 *   0xb0ba3  movzwl  (%rdi), %eax            ; eax = *(uint16_t*)p (native little-endian LOAD)
 *   0xb0ba6  rolw    $0x8, %ax               ; ax = bytereverse(ax) — the two-byte bswap
 *   0xb0baa  cwtl                            ; SIGN-extend ax (16b) into eax (32b)  [aka cwde]
 *   0xb0bab  popq    %rbp                    ; frame epilogue
 *   0xb0bac  retq                            ; return eax  (signed int16 promoted to int32)
 *
 * The KEY DIFFERENCE from the unsigned sibling `getUInt16Number` @0xb0bba is @0xb0baa: the signed
 * variant uses `cwtl` (sign-extend), the unsigned variant uses `movzwl %ax,%eax` (zero-extend).
 * Same big-endian byte order, opposite interpretation of the high bit.
 *
 * NUMERICS: signed 16-bit range [-32768, 32767]. Fits in a JS `number` with room to spare — no
 * bigint. The port models the sign-extension explicitly via the `<< 16 >> 16` idiom (JS's `<<` /
 * `>>` operate on 32-bit ints, so this shifts the sign bit into position and arithmetic-shifts it
 * back down — exactly the effect of `cwtl` on `ax`).
 *
 * SIGNATURE NOTE: same idiom as the sibling readers — accept a `Uint8Array` + optional byte offset
 * so callers can walk successive header fields without pointer arithmetic. Default offset = 0.
 */
export function ProCore_Private_getInt16Number(p: Uint8Array, offset: number = 0): number {  // @ProCore 0xb0b9f
  // movzwl (%rdi), %eax          @0xb0ba3 — reads two little-endian bytes at p[offset..offset+1]
  // into the low half of eax (upper 16 bits zeroed). p[0] lands in AL, p[1] lands in AH.
  const b0: number = p[offset + 0];  // MSB of the returned value after rolw
  const b1: number = p[offset + 1];  // LSB of the returned value after rolw
  // rolw $0x8, %ax               @0xb0ba6 — byte-swap ax. After this, AX = (b0 << 8) | b1.
  // cwtl                         @0xb0baa — sign-extend AX to EAX. In JS the equivalent is
  //                                         `(x << 16) >> 16`: `<<` promotes to 32b, `>>` is
  //                                         arithmetic (signed) so bit 15 propagates to bits 16..31.
  const swapped: number = ((b0 << 8) | b1) & 0xffff;
  return (swapped << 16) >> 16;  // return eax  @0xb0bac  (-32768..32767)
}
