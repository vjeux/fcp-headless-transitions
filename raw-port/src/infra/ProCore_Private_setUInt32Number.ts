// ProCore_Private_setUInt32Number.ts — writes an unsigned 32-bit integer
// into a byte buffer in BIG-ENDIAN (network) byte order.
//
// This is a leaf helper in the `ProCore::Private` namespace (name/order
// bytes utility used by the ProCore JSON/binary serialisers). This file
// ports EXACTLY ONE ledger unit:
//
//   * __ZN7ProCore7Private15setUInt32NumberEPhj
//       — ProCore::Private::setUInt32Number(unsigned char*, unsigned int)
//         @ProCore 0xb0b95
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted VAs
// from `otool -tV`). Disassembly source:
//   raw-port/re/disasm/ProCore.__ZN7ProCore7Private15setUInt32NumberEPhj.s
//
// -----------------------------------------------------------------------------
// FULL DISASM
// -----------------------------------------------------------------------------
//   0xb0b95  pushq  %rbp                       ; prologue
//   0xb0b96  movq   %rsp, %rbp
//   0xb0b99  bswapl %esi                       ; esi = byte-swap(val)
//                                              ;   (32-bit BSWAP: reverses
//                                              ;    the byte order of val
//                                              ;    within the low 32 bits.
//                                              ;    So {b0,b1,b2,b3} on x86
//                                              ;    little-endian becomes
//                                              ;    {b3,b2,b1,b0}.)
//   0xb0b9b  movl   %esi, (%rdi)               ; *(uint32_t*)dst = esi
//                                              ;   (unaligned 4-byte store
//                                              ;    of the swapped value —
//                                              ;    Intel writes it as
//                                              ;    {b3,b2,b1,b0} on wire,
//                                              ;    which is the BIG-ENDIAN
//                                              ;    representation of val).
//   0xb0b9d  popq   %rbp                       ; epilogue
//   0xb0b9e  retq
//
// -----------------------------------------------------------------------------
// SEMANTICS
// -----------------------------------------------------------------------------
// C signature: `void ProCore::Private::setUInt32Number(unsigned char* dst,
// unsigned int val)` — writes `val` to `dst[0..3]` in big-endian order:
//   dst[0] = (val >> 24) & 0xff
//   dst[1] = (val >> 16) & 0xff
//   dst[2] = (val >>  8) & 0xff
//   dst[3] = (val      ) & 0xff
// The `bswap` + little-endian store idiom is the standard x86 way to
// emit BE numbers. The function has NO in-scope callees and NO externs
// beyond the trivial prologue/epilogue — a true leaf.

/**
 * ProCore::Private::setUInt32Number
 *   @ProCore 0xb0b95 — writes `val` (an unsigned 32-bit int) to the
 *   4 bytes at `buf[offset..offset+3]` in BIG-ENDIAN order.
 *
 * Faithful line-for-line transcription of the disassembly quoted in
 * this file's header:
 *
 *   0xb0b99  bswapl %esi        — esi = byteswap32(val)
 *   0xb0b9b  movl   %esi, (%rdi) — *(uint32_t*)dst = esi
 *
 * The `bswap`-then-store idiom on a little-endian machine emits the
 * bytes in big-endian order; we express this directly with four masked
 * stores at the corresponding shift positions.
 *
 * @param buf    destination byte buffer (models the `unsigned char*`).
 * @param offset base index into `buf` (models `dst - &buf[0]`).
 * @param val    the 32-bit unsigned value to serialise. Only the low
 *               32 bits are used (matches `unsigned int` on the ABI).
 */
export function ProCore_Private_setUInt32Number(
  buf: Uint8Array,
  offset: number,
  val: number,
): void {
  // ------------------------------------------------------------
  // @0xb0b99 — bswapl %esi. Reverses the byte order of the low 32
  // bits of val. On x86 with the little-endian `movl` that follows,
  // the net effect is: emit val's bytes to memory in BIG-ENDIAN
  // order.
  // @0xb0b9b — movl %esi, (%rdi). The 4 bytes at rdi..rdi+3 receive
  // the byteswapped value.
  // ------------------------------------------------------------
  // Force val into the low 32-bit unsigned domain first, matching
  // the `unsigned int` ABI parameter (bits above 31 are dropped by
  // the machine at register-write time).
  const v = val >>> 0; // @0xb0b99 esi (32-bit register semantics)
  buf[offset + 0] = (v >>> 24) & 0xff; // BE byte 0 — high byte of val
  buf[offset + 1] = (v >>> 16) & 0xff; // BE byte 1
  buf[offset + 2] = (v >>>  8) & 0xff; // BE byte 2
  buf[offset + 3] = (v       ) & 0xff; // BE byte 3 — low byte of val
}
