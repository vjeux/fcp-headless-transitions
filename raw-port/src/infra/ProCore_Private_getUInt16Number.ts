// ProCore_Private_getUInt16Number.ts — one of the ProCore::Private free byte-stream readers.
//
// This file hosts ONE function:
//   ProCore::Private::getUInt16Number(unsigned char const*)  @ProCore 0xb0bba
//     (mangled __ZN7ProCore7Private15getUInt16NumberEPKh)
//
// Sibling ports in the same namespace live in their own per-symbol files by naming rule (each free
// function goes in a file named after it):
//   raw-port/src/infra/ProCore_Private_getInt32Number.ts       @0xb0b77
//   raw-port/src/infra/ProCore_Private_getS15Fixed16Number.ts
//   raw-port/src/infra/ProCore_Private_convertToS15Fixed16.ts
//   ...
//
// Transcribed from otool -tV disasm of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// (x86_64 slice). Full 7-line body — every instruction is accounted for and cited @0xADDR.

/**
 * ProCore::Private::getUInt16Number(const uint8_t* p) -> uint16_t (0..65535)  @ProCore 0xb0bba.
 *
 * Reads TWO consecutive bytes at *p and interprets them as a BIG-ENDIAN unsigned 16-bit integer
 * (i.e. `p[0]` is the most-significant byte, `p[1]` the least). This is the standard MP4/ISOBMFF
 * / ICC-profile / QuickTime u16 reader — 16-bit fields on disk are big-endian on Apple binary
 * formats, so on a little-endian machine (Apple x86_64 + Apple silicon) the code loads the two
 * bytes with `movzwl` then flips them with `rolw $8, %ax`. `rolw $8` on a 16-bit register is
 * exactly a byte-swap of the low two bytes; the trailing `movzwl %ax, %eax` re-zeroes the top
 * bits so the return is a clean unsigned 16-bit value in `eax`.
 *
 * Full transcription (all 7 instructions accounted for; addresses cited @0xADDR):
 *   0xb0bba  pushq   %rbp                    ; frame prologue
 *   0xb0bbb  movq    %rsp, %rbp              ; frame prologue
 *   0xb0bbe  movzwl  (%rdi), %eax            ; eax = *(uint16_t*)p (native little-endian LOAD, zero-extended)
 *   0xb0bc1  rolw    $0x8, %ax               ; ax = bytereverse(ax) — the two-byte bswap
 *   0xb0bc5  movzwl  %ax, %eax               ; eax = zero-extend ax (clear high 16 bits after rolw)
 *   0xb0bc8  popq    %rbp                    ; frame epilogue
 *   0xb0bc9  retq                            ; return eax  (0..65535)
 *
 * `movzwl` at @0xb0bbe reads a native little-endian 16-bit half-word: on Intel/Apple silicon this
 * is (p[0], p[1]) into the low byte / high byte of AX respectively. `rolw $0x8, %ax` then rotates
 * left by 8 bits within AX, which for a 16-bit value equals a full byte-swap: the low byte moves
 * to the high position and the high byte to the low. Net effect: the returned value has p[0] in
 * the HIGH position and p[1] in the LOW position — a big-endian read. No sign extension anywhere
 * (both `movzwl` steps are ZERO-extends), so the return is in [0, 65535].
 *
 * NUMERICS: pure integer, always fits in a JS `number` (max 65535). No bigint needed. No throw.
 * No dependencies (POSIX/libc/ObjC free).
 *
 * SIGNATURE NOTE: the C++ signature is `uint16_t getUInt16Number(uint8_t const* p)`. In this port
 * we take a `Uint8Array` view + optional byte offset — a common TS-side idiom already used by the
 * sibling `ProCore_Private_getInt32Number` — so the same buffer can host successive header fields
 * without pointer arithmetic on the caller's side. Default offset = 0 mirrors "pass raw pointer".
 */
export function ProCore_Private_getUInt16Number(p: Uint8Array, offset: number = 0): number {  // @ProCore 0xb0bba
  // movzwl (%rdi), %eax          @0xb0bbe — reads two little-endian bytes at p[offset..offset+1]
  // into eax (zero-extended). p[0] lands in AL (low byte of AX), p[1] lands in AH (high byte).
  const b0: number = p[offset + 0];  // MSB after the rolw+movzwl composition (returned high byte)
  const b1: number = p[offset + 1];  // LSB after the rolw+movzwl composition (returned low byte)
  // rolw $0x8, %ax               @0xb0bc1 — byte-swap ax; then
  // movzwl %ax, %eax             @0xb0bc5 — zero-extend to 32b. Net: return (p[0]<<8) | p[1] as u16.
  return ((b0 << 8) | b1) & 0xffff;  // return eax  @0xb0bc9  (always fits in 16 bits)
}
