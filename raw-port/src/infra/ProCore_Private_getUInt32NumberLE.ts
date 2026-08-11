// ProCore_Private_getUInt32NumberLE.ts — the little-endian twin of
// ProCore_Private_getUInt32Number, and the read half of the LE pair whose
// write half already landed as ProCore_Private_setUInt32NumberLE.
//
// This file hosts ONE function:
//   ProCore::Private::getUInt32NumberLE(unsigned char const*)  @ProCore 0xb0e13
//     (mangled __ZN7ProCore7Private17getUInt32NumberLEEPKh)
//
// Naming rule: `ProCore::Private` is a C++ namespace, not a class. Per
// raw-port/army/PORTING_SPEC.md's naming rule ("a free function goes in a file
// named after itself or its translation-unit"), the file is named after the
// function — matching the landed siblings ProCore_Private_getUInt32Number.ts,
// ProCore_Private_getInt32Number.ts and ProCore_Private_setUInt32NumberLE.ts.
//
// Transcribed from otool disasm at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// (see raw-port/re/disasm/ProCore.__ZN7ProCore7Private17getUInt32NumberLEEPKh.s — 5 lines).
//
// FULL DISASM (the whole function — 5 instructions, @0xb0e13..@0xb0e1a)
//   0xb0e13  pushq  %rbp                     ; frame prologue
//   0xb0e14  movq   %rsp, %rbp               ; frame prologue
//   0xb0e17  movl   (%rdi), %eax             ; eax = *(uint32_t*)p — a NATIVE
//                                            ; (little-endian) 32-bit load
//   0xb0e19  popq   %rbp                     ; frame epilogue
//   0xb0e1a  retq                            ; return eax
//
// THE ONE THING THAT MATTERS HERE: there is NO `bswapl`. The big-endian sibling
// `getUInt32Number` @0xb0b8b is the same body PLUS `bswapl %eax` @0xb0b91; this
// LE variant omits exactly that instruction, which is the entire semantic
// difference between the two exported symbols. x86_64 is little-endian, so a
// bare `movl` load already yields `p[0] | p[1]<<8 | p[2]<<16 | p[3]<<24`.
//
// The function sits immediately before its writer twin in the text section —
// getUInt32NumberLE @0xb0e13 (5 instrs), setUInt32NumberLE @0xb0e1b (`movl %esi,
// (%rdi)`, likewise bswap-free). The landed setter models its single `movl`
// store with `DataView.setUint32(offset, value, /*littleEndian=*/true)`; this
// getter mirrors it exactly with `DataView.getUint32(offset, true)`, so the
// pair round-trips through one shared model of the machine's 32-bit access.
//
// No bounds check, no null test, no error path — a raw 4-byte load, exactly as
// in the machine. (`DataView` raises RangeError past the end of the buffer,
// which is the loud failure PORTING_SPEC Rule 3 asks for, and avoids the
// per-byte `undefined -> NaN` silent-wrong-answer class that OPS_LOG #13 / gate
// G7 exist to catch.)
//
// FRONTIER CALLEES: none — leaf function, zero callq.

/**
 * ProCore::Private::getUInt32NumberLE(const uint8_t* p) -> uint32_t  @ProCore 0xb0e13.
 *
 * Reads four bytes at `p` as a LITTLE-ENDIAN 32-bit unsigned integer:
 *
 *   return = p[0] | (p[1]<<8) | (p[2]<<16) | (p[3]<<24)
 *
 * i.e. `p[0]` is the LEAST-significant byte — the mirror image of the
 * big-endian `getUInt32Number` @0xb0b8b, whose `bswapl` makes `p[0]` the most
 * significant. The machine does it with a single native `movl (%rdi), %eax`
 * @0xb0e17 and no byte-swap at all.
 *
 * ORACLE: verified against the live ProCore binary. The symbol is EXPORTED
 * (`nm -arch x86_64` type `T` @0xb0e13), so the harness
 * (raw-port/re/oracle/ProCore_Private_getUInt32NumberLE_oracle.py) dlopens
 * ProCore under `arch -x86_64 /usr/bin/python3` — the port is transcribed from
 * the x86_64 slice, and an oracle on the arm64 image would be comparing against
 * a body this port never read — and calls the real function on an 8-byte buffer
 * (4 payload bytes + 4 random trailing bytes, so a too-wide read is caught).
 * 2,012 cases (12 hand-picked edge patterns + 2,000 random 4-byte vectors):
 * 2012/2012 bit-identical to this port. Cross-check: on every case the landed
 * big-endian sibling `getUInt32Number` @0xb0b8b returned a DIFFERENT value
 * except on byte-palindromes, where it returned the same one — which is what
 * proves this body really is the bswap-free variant rather than the harness
 * having handed it a mirrored buffer.
 * NEGATIVE CONTROLS (measured, same 2,012 cases): reading big-endian (the twin's
 * behaviour) -> 2010 wrong; returning a signed int32 -> 987 wrong; a 16-bit read
 * -> 2009 wrong; reading at offset 1 -> 2011 wrong.
 *
 * @param p       the source bytes.
 * @param offset  byte offset of the load within `p` (the machine's `%rdi`
 *                already points at the target byte; the parameter exists so
 *                callers can pass a subrange without allocating a view, exactly
 *                as the landed siblings do).
 */
export function ProCore_Private_getUInt32NumberLE(     // @ProCore 0xb0e13
  p: Uint8Array,
  offset: number = 0,
): number {
  // @0xb0e13..0xb0e14 — prologue (no TS-visible effect).
  // @0xb0e17 — movl (%rdi), %eax : ONE native 32-bit load, no bswapl (contrast
  //   the big-endian twin @0xb0b8b, which has `bswapl %eax` @0xb0b91). x86_64
  //   is little-endian, so `littleEndian = true` on the DataView read IS the
  //   `movl`; the same model the landed setUInt32NumberLE @0xb0e1f uses for its
  //   `movl %esi, (%rdi)` store.
  const dv = new DataView(p.buffer, p.byteOffset, p.byteLength);
  return dv.getUint32(offset, true) >>> 0;
  // @0xb0e19..0xb0e1a — epilogue + retq (the value in %eax is the uint32_t
  //   return; `>>> 0` states the unsigned 32-bit type the mangling declares).
}
