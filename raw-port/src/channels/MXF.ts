// raw-port: MXF — Flexo framework (channels layer, MXF audio helpers)
//
// MXF is a namespace-style class in Flexo holding free-function helpers for
// ADTS (AAC audio) framing inside MXF containers. Two published entry points:
//
//   0x0142d2a0  MXF::getAdtsBlockSize(unsigned char const*, unsigned long)
//   0x0142d340  MXF::convertADTSbuffer(std::vector<unsigned char> const&)
//
// getAdtsBlockSize scans a byte buffer looking for the ADTS syncword
// 0xFF 0xF1 0x4C 0x80 (little-endian u32 = 0x804CF1FF, see @0x142d2ef) and
// returns the byte offset of the second frame — or `len` if none found.
// The scan uses byte 3 of the current window as a fast fingerprint and
// advances by 1/2/3/4 depending on which mismatched byte was seen (a
// Boyer-Moore-ish skip table specialised to the 4-byte syncword).
//
// convertADTSbuffer strips the 7-byte ADTS header off the front of the
// input vector and returns a new vector containing the remaining payload.

/**
 * MXF::getAdtsBlockSize(bytes, len)  @0x0142d2a0
 *
 * Scan `bytes[0..len)` looking for the ADTS-in-MXF syncword sequence
 *   0xff 0xf1 0x4c 0x80
 * (little-endian u32 == 0x804CF1FF). Returns the byte offset of the FIRST
 * match found at probe positions rdx∈[4, len-4), or `len` if no match.
 *
 * The scan is a hand-rolled Boyer-Moore-style skip driven by the byte at
 * position `rdx+3`. `rdx` starts at 4 (asm @0x142d2ac) and the end sentinel
 * is `bytes + len - 4` (@0x142d2a4..0x142d2a8). The dispatch on `rdx[3]`:
 *
 *   b3 >  0xf0:                                (@0x142d2d0/0x142d2d7 jg)
 *     b3 == 0xff → rdx += 3                    (@0x142d319/0x142d322)
 *     b3 == 0xf1 → rdx += 2                    (@0x142d310/0x142d32d)
 *     else       → rdx += 4                    (fallthrough @0x142d2b5)
 *   b3 == 0x4c    → rdx += 1                    (@0x142d2dd/0x142d328)
 *   b3 == 0x80    → check full u32 match:       (@0x142d2df/0x142d2e6)
 *     u32(rdx) == 0x804CF1FF → return rdx - bytes  (@0x142d2ef, @0x142d2c0 jne)
 *     else                    → rdx += 4, keep scanning (@0x142d2f5..0x142d2fd)
 *   else          → rdx += 4                    (fallthrough @0x142d2e6 jne 0x142d2b5)
 *
 * The choice of skips 1/2/3/4 corresponds to how far along the syncword
 * the observed b3 might be:
 *   b3=0x80 means rdx COULD be exactly on the sync, verify u32 → skip 0 (if match) or 4
 *   b3=0x4c means the syncword may be 1 byte ahead → skip 1
 *   b3=0xf1 means the syncword may be 2 bytes ahead → skip 2
 *   b3=0xff means the syncword may be 3 bytes ahead → skip 3
 *   otherwise no match possible in current window → skip 4
 *
 * Returns `len` (the input length) when no match is found — @0x142d2c7 jae
 * → @0x142d333 movl %esi, %eax; ret.
 *
 * All arithmetic here is on `unsigned long` byte offsets (size_t). We use
 * `>>> 0` where the asm reads 32-bit widths so the js integer stays u32.
 */
export function MXF_getAdtsBlockSize(bytes: Uint8Array, len: number): number {
  // @0x142d2a4  leaq (%rdi,%rsi), %rcx ; @0x142d2a8 addq $-0x4, %rcx
  // rcx = &bytes[len - 4] (end sentinel; loop stops when rdx >= rcx).
  const endMinus4 = len - 4;
  // @0x142d2ac  leaq 0x4(%rdi), %rdx
  let rdx = 4;
  // r8 = 0 (constant used by cmovne to zero eax on a bad u32 match).
  const R8_ZERO = 0;

  // Guard: if len < 4, the sentinel underflows; asm behaves the same:
  // rdx=4 > rcx=len-4, so it falls into @0x142d2c7 jae → return len.
  // (Bytes buffer must therefore be at least len bytes; we don't check.)

  // Main scan loop @0x142d2c4..0x142d301.
  // eax is the "candidate" return value; only non-zero on a full u32 match.
  let eax = 0;
  // Emulate the two entry points to the test-and-return:
  //   fallthrough from the b3==0x80 branch → test eax; jne ret
  //   otherwise the loop just re-enters at @0x142d2c4
  // We express this as one loop with a `checkReturn` boolean.
  let checkReturn = false;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (checkReturn) {
      // @0x142d2c0 testl %eax, %eax  @0x142d2c2 jne 0x142d335 ret
      if (eax !== 0) return eax >>> 0;
      checkReturn = false;
    }
    // @0x142d2c4 cmpq %rcx, %rdx ; @0x142d2c7 jae 0x142d333
    if (rdx >= endMinus4) {
      // @0x142d333 movl %esi, %eax → return len
      return len >>> 0;
    }
    // @0x142d2c9 movzbl 0x3(%rdx), %r9d
    const b3 = bytes[rdx + 3]!;
    // @0x142d2ce xorl %eax, %eax
    eax = 0;

    // @0x142d2d0 cmpl $0xf0, %r9d ; @0x142d2d7 jg 0x142d310
    if (b3 > 0xf0) {
      // @0x142d310 cmpl $0xf1, %r9d ; @0x142d317 je 0x142d32d
      if (b3 === 0xf1) {
        // @0x142d32d addq $0x2, %rdx ; @0x142d331 jmp 0x142d2c0
        rdx += 2;
        checkReturn = true;
        continue;
      }
      // @0x142d319 cmpl $0xff, %r9d ; @0x142d320 jne 0x142d2b5 (skip 4 default)
      if (b3 === 0xff) {
        // @0x142d322 addq $0x3, %rdx ; @0x142d326 jmp 0x142d2c0
        rdx += 3;
        checkReturn = true;
        continue;
      }
      // fallthrough → @0x142d2b5 addq $0x4, %rdx
      rdx += 4;
      checkReturn = true;
      continue;
    }
    // @0x142d2d9 cmpl $0x4c, %r9d ; @0x142d2dd je 0x142d328
    if (b3 === 0x4c) {
      // @0x142d328 incq %rdx ; @0x142d32b jmp 0x142d2c0
      rdx += 1;
      checkReturn = true;
      continue;
    }
    // @0x142d2df cmpl $0x80, %r9d ; @0x142d2e6 jne 0x142d2b5 (skip 4 default)
    if (b3 === 0x80) {
      // @0x142d2e8 movl %edx, %eax  ; @0x142d2ea subl %edi, %eax
      // eax = rdx (offset from bytes base) — u32.
      eax = rdx >>> 0;
      // @0x142d2ec xorl %r9d, %r9d
      // @0x142d2ef cmpl $0x804cf1ff, (%rdx) ; @0x142d2f5 setne %r9b
      // Read little-endian u32 at rdx.
      const u32 =
        (bytes[rdx]! | (bytes[rdx + 1]! << 8) | (bytes[rdx + 2]! << 16) | (bytes[rdx + 3]! << 24)) >>>
        0;
      const setne = u32 !== 0x804cf1ff ? 1 : 0;
      // @0x142d2f9 leaq (%rdx,%r9,4), %rdx → advance 0 or 4.
      rdx += setne * 4;
      // @0x142d2fd cmovnel %r8d, %eax → if not-equal, eax = r8 (=0).
      if (setne !== 0) {
        eax = R8_ZERO;
      }
      // @0x142d301 jmp 0x142d2c0 → test eax, ret-if-nonzero.
      checkReturn = true;
      continue;
    }
    // Default (@0x142d2e6 jne 0x142d2b5) → addq $0x4, %rdx.
    rdx += 4;
    checkReturn = true;
  }
}

/**
 * MXF::convertADTSbuffer(vec)  @0x0142d340
 *
 * Take a std::vector<uint8_t> in — treat it as an ADTS frame — and return
 * a NEW std::vector<uint8_t> containing the payload minus the 7-byte ADTS
 * header. The caller-supplied return-slot is `rdi` (a stack-allocated
 * empty vector); the asm fills its three fields (begin/end/end_cap) and
 * memcpy's `len - 7` bytes from `src + 7` into a freshly-allocated block.
 *
 * Faithful trace:
 *   @0x142d351  mov (%rsi), %r15                 ; r15 = src.begin (data ptr)
 *   @0x142d354  mov 0x8(%rsi), %r14              ; r14 = src.end
 *   @0x142d358  sub %r15, %r14                   ; r14 = src.size() (bytes)
 *   @0x142d35b  xorps %xmm0, %xmm0
 *   @0x142d35e  movups %xmm0, (%rdi)             ; ret.begin = ret.end = 0
 *   @0x142d361  movq $0, 0x10(%rdi)              ; ret.end_cap = 0
 *   @0x142d369  add $-0x7, %r14                  ; r14 = size - 7
 *   @0x142d36d  je  0x142d398                    ; size == 7 → return empty
 *   @0x142d36f  js  0x142d3bf                    ; size <  7 → __throw_length_error
 *   @0x142d371  mov %r14, %rdi ; call operator new(size-7)   ; @0x142d374
 *   @0x142d379  mov %rax, %r12
 *   @0x142d37c  mov %rax, (%rbx)                 ; ret.begin = alloc
 *   @0x142d37f  lea (%rax,%r14), %r13            ; end = alloc + (size-7)
 *   @0x142d383  mov %r13, 0x10(%rbx)             ; ret.end_cap = end
 *   @0x142d387  mov %rax, %rdi ; mov %r14, %rsi ; call _bzero  ; @0x142d38d
 *   @0x142d392  mov %r13, 0x8(%rbx)              ; ret.end = end
 *   @0x142d398 (empty branch): xor %r12d, %r12d  ; r12 = nullptr
 *   @0x142d39b  add $0x7, %r15                   ; src += 7
 *   @0x142d39f  mov %r12, %rdi ; mov %r15, %rsi ; mov %r14, %rdx
 *   @0x142d3a8  call _memcpy                     ; memcpy(dst, src+7, size-7)
 *   @0x142d3ad  ret rbx (the &ret vector)
 *
 * Notes on faithfulness:
 *   • The asm zeroes the destination buffer with `bzero` (@0x142d38d) BEFORE
 *     the memcpy. That zero-fill is a wasted store (memcpy overwrites the
 *     whole thing), but it is exactly what the asm does — keep it visible
 *     in the port for provenance.
 *   • On size==7 the asm skips new/bzero and calls memcpy with dst=NULL,
 *     size=0 — a no-op memcpy(NULL,NULL,0). We emit an empty vector.
 *   • On size<7 the asm calls std::vector::__throw_length_error
 *     (@0x142d3bf). In JS that's a RangeError.
 */
export function MXF_convertADTSbuffer(src: Uint8Array): Uint8Array {
  // @0x142d354..0x142d358 — vec.size() computed from end - begin.
  // (In JS Uint8Array we just read .length; the asm's rationale is that
  // std::vector<uint8_t> stores {begin,end,end_cap} and size = end - begin.)
  const size = src.length >>> 0;
  // @0x142d369 addq $-0x7, %r14 → r14 = size - 7 (as SIGNED 64-bit).
  //   je → empty branch; js → throw.
  const rem = size - 7;
  if (rem === 0) {
    // @0x142d398 xor r12, r12 ; then memcpy(NULL, src+7, 0) → no-op.
    return new Uint8Array(0);
  }
  if (rem < 0) {
    // @0x142d3bf callq std::__1::vector<uint8_t>::__throw_length_error
    throw new RangeError("std::vector<unsigned char>::__throw_length_error");
  }
  // @0x142d374 call operator new(rem) → new Uint8Array (starts zero-filled
  // in JS, which matches the @0x142d38d __bzero after allocation).
  const out = new Uint8Array(rem);
  // @0x142d39b addq $0x7, %r15 ; @0x142d3a8 _memcpy(out, src+7, rem).
  out.set(src.subarray(7, 7 + rem));
  return out;
}

/**
 * MXF — namespace holder mirroring the C++ scope. The two members are
 * declared static so callers can spell them as `MXF.getAdtsBlockSize(...)`
 * to match the mangled name (`MXF::getAdtsBlockSize`).
 */
export class MXF {
  /** @see MXF_getAdtsBlockSize (@0x142d2a0) */
  static getAdtsBlockSize(bytes: Uint8Array, len: number): number {
    return MXF_getAdtsBlockSize(bytes, len);
  }
  /** @see MXF_convertADTSbuffer (@0x142d340) */
  static convertADTSbuffer(src: Uint8Array): Uint8Array {
    return MXF_convertADTSbuffer(src);
  }
}
