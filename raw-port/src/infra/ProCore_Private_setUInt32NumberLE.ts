// ProCore::Private::setUInt32NumberLE(unsigned char* dst, unsigned int value)
// — write a 32-bit unsigned integer to a byte buffer in native little-endian
// order (no byte-swap, unlike the ICC big-endian setUInt32Number).
//
// @ProCore /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// @0xb0e1b  __ZN7ProCore7Private17setUInt32NumberLEEPhj
//
// This is the "LE" (little-endian) counterpart to the big-endian ICC writers
// (setUInt32Number / setUInt16Number) in the same ProCore::Private namespace.
// Used where a value needs to hit the wire byte-for-byte as it lives in a
// little-endian machine register — e.g. a memory-mapped struct read back
// verbatim on the same host, or a fixed-endian binary format where the
// caller has explicitly chosen LE. On x86_64 this compiles to a single
// unaligned 32-bit store; no bswap is issued.
//
// DECODE: raw-port/re/disasm/ProCore.__ZN7ProCore7Private17setUInt32NumberLEEPhj.s
//
//   0xb0e1b  pushq %rbp                       ;; standard frame prologue
//   0xb0e1c  movq  %rsp, %rbp                 ;;   (not strictly needed for this
//                                                  6-instruction body, but the
//                                                  ABI requires the frame ptr in
//                                                  a debug-attributed function)
//   0xb0e1f  movl  %esi, (%rdi)               ;; *(uint32_t*)dst = value
//                                                (esi = arg2 = value; rdi = arg1 = dst)
//                                                x86 stores are native little-endian —
//                                                the four bytes of value go to
//                                                dst[0..3] with LSB-first ordering.
//   0xb0e21..0xb0e22  epilogue (popq %rbp; retq)
//
// FRONTIER CALLEES: none. Pure memory store.

/**
 * Write `value` (a 32-bit unsigned integer) into `dst` at `offset` in native
 * little-endian byte order. Faithful transcription of the single-store body:
 *
 *   *(uint32_t*)(dst + offset) = value;
 *
 * DataView.setUint32(byteOffset, value, true) is the exact JS equivalent —
 * `true` selects little-endian, matching the x86_64 unaligned 32-bit store
 * that the machine emits at @0xb0e1f. The value is coerced to uint32 by
 * DataView (mask & 0xFFFFFFFF), matching the register width the disasm uses.
 *
 * @ProCore 0xb0e1b
 */
export function ProCore_Private_setUInt32NumberLE(
  dst: Uint8Array,
  value: number,
  offset: number = 0,
): void {
  // @ProCore 0xb0e1f  movl %esi, (%rdi)      ;; *(uint32_t*)dst = value  (LE store)
  const dv = new DataView(dst.buffer, dst.byteOffset, dst.byteLength);
  dv.setUint32(offset, value >>> 0, true); // true = little-endian, matching movl on x86_64
}
