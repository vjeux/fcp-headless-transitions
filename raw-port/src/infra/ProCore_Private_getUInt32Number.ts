// ProCore_Private_getUInt32Number.ts — sibling of ProCore_Private_getInt32Number.
//
// This file hosts ONE function:
//   ProCore::Private::getUInt32Number(unsigned char const*)  @ProCore 0xb0b8b
//     (mangled __ZN7ProCore7Private15getUInt32NumberEPKh)
//
// The signed twin `getInt32Number` at ProCore 0xb0b77 lives in
// raw-port/src/infra/ProCore_Private_getInt32Number.ts — the two bodies
// are byte-for-byte identical (same `movl (%rdi),%eax ; bswapl %eax`
// pair). The C++-level distinction is purely in the return type: the
// unsigned version reinterprets the result as a `uint32_t` and the
// signed version as an `int32_t`. On x86 both fit in %eax with no
// separate sign-extension instruction, so the compiler emits the same
// code and the two mangled names both land in the ledger.
//
// Naming rule: `ProCore::Private` is a C++ namespace, not a class. Per
// raw-port/army/PORTING_SPEC.md's naming rule ("a free function goes in
// a file named after itself or its translation-unit"), the file is
// named after the function.
//
// Transcribed from otool disasm at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// (see raw-port/re/disasm/ProCore.__ZN7ProCore7Private15getUInt32NumberEPKh.s — 7 lines).
//
// FULL DISASM
//   0xb0b8b  pushq  %rbp                     ; frame prologue
//   0xb0b8c  movq   %rsp, %rbp               ; frame prologue
//   0xb0b8f  movl   (%rdi), %eax             ; eax = *(uint32_t*)p (native LE LOAD)
//   0xb0b91  bswapl %eax                     ; eax = bytereverse(eax)
//   0xb0b93  popq   %rbp                     ; frame epilogue
//   0xb0b94  retq                            ; return eax
//
// FRONTIER CALLEES: none — leaf function.

/**
 * ProCore::Private::getUInt32Number(const uint8_t* p) -> uint32_t   @ProCore 0xb0b8b.
 *
 * Reads FOUR bytes at `*p` in-order and interprets them as a big-endian
 * 32-bit UNSIGNED integer. Standard ICC / ISO-base-media reader: on-disk
 * fields are big-endian, so on a little-endian host the compiler emits
 * `movl` + `bswapl`. No bounds check, no null test, no error path.
 *
 *   Byte layout: `p[0]` is the MOST-SIGNIFICANT byte after the bswap.
 *     return  =  (p[0]<<24) | (p[1]<<16) | (p[2]<<8) | p[3]
 *
 * The signed twin `getInt32Number` @0xb0b77 has an identical body —
 * only the C++ return type (int32_t vs uint32_t) differs, which is
 * transparent to the machine.
 */
export function ProCore_Private_getUInt32Number(       // @ProCore 0xb0b8b
  p: Uint8Array,
  offset: number = 0,
): number {
  // @0xb0b8f — movl (%rdi), %eax : native LE load of four bytes.
  const b0: number = p[offset + 0]; // MSB after bswap
  const b1: number = p[offset + 1];
  const b2: number = p[offset + 2];
  const b3: number = p[offset + 3]; // LSB after bswap
  // @0xb0b91 — bswapl %eax : bytereverse. In JS the equivalent
  //            three-shift OR yields the same 32-bit value; the final
  //            `>>> 0` guarantees an unsigned 32-bit result (matches
  //            the uint32_t return type — the whole point of the
  //            unsigned twin over the signed one).
  return (((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0);
  // @0xb0b93..0xb0b94 — epilogue + retq.
}
